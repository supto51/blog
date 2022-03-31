const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const sendMail = require("../utils/email");

const signInToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION,
  });
};

const createSentToke = (user, statusCode, req, res) => {
  const token = signInToken(user._id);

  const cookieOption = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRATION * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookieOption.secure = true;
  res.cookie("jwt", token, cookieOption);

  user.password = undefined;

  res.status(statusCode).json({
    statue: "Success",
    jwt: token,
    data: { user },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const user = await User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  });

  createSentToke(user, 200, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if ((!email, !password)) {
    return next(new AppError("Please provide email and password", 400));
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user || !user.checkPassword(password, user.password)) {
    return next(new AppError("Password or email not valid!", 401));
  }

  createSentToke(user, 200, req, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("Your are not login!", 401));
  }

  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const freshUser = await User.findById(decode.id);

  if (!freshUser) {
    return next(new AppError("Token belong to the user not exists!", 404));
  }

  if (freshUser.passwordChangedAfter(decode.iat)) {
    return next(new AppError("You changed your password recently!", 401));
  }

  req.user = freshUser;
  next();
});

exports.restrictedTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("You don't have permission to perform this action!", 403));
    }

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const email = req.body.email;
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("User not exists!", 404));
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/persons/reset-password/${resetToken}`;

  const message = `If you forgot your password please hit that link ${resetUrl} and enter your new password. This token only valid for 1 hour \n dont't for got your password please ignore  this mail! \n Thank You! `;

  try {
    await sendMail({
      email: user.email,
      subject: "Your password reset token!",
      message,
    });

    res.status(200).json({
      status: "Success",
      message: "Reset token sent to the mail. Please check your mail.",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.resetTokenExpireTime = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError("There was an error sending mail. Please try again later", 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const resetToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: resetToken,
    resetPasswordExpiredTime: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Your token is not valid!", 403));
  }

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.resetTokenExpireTime = undefined;
  await user.save();

  createSentToke(user, 200, req, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  if (!user) {
    return next(new AppError("The user you req for is not found!", 400));
  }

  if (!(await user.checkPassword(req.body.currentPassword, user.password))) {
    return next(new AppError("Your current password is not  correct!", 401));
  }

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();

  createSentToke(user, 200, req, res);
});
