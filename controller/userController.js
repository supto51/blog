const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const filteredObj = (obj, ...allowedField) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedField.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllUser = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: "success",
    totalUser: users.length,
    data: {
      users,
    },
  });
});

exports.createUser = catchAsync(async (req, res, next) => {
  const user = await User.create(req.body);

  res.status(200).json({
    status: "Success",
    data: {
      user,
    },
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ _id: req.params.id });

  res.status(200).json({
    status: "Success",
    data: {
      user,
    },
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body);

  res.status(200).json({
    status: "Success",
    data: {
      user,
    },
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  await User.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: "User Deleted!",
  });
});

exports.updateCurrentUser = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.confirmPassword) {
    return next(
      new AppError(
        "You can't update your password using this url please go to update password!",
        400
      )
    );
  }

  const filteredBody = filteredObj(req.body, "firstName", "lastName", "email", "avatar");

  console.log(filteredObj);

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "Success",
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteCurrentUser = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: "Success",
    data: null,
  });
});
