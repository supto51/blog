const crypto = require("crypto");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      require: [true, "User must have a First Name"],
      min: 3,
      max: 50,
    },
    lastName: {
      type: String,
      require: [true, "User must have a Last  name"],
      min: 5,
      max: 50,
    },
    username: {
      type: String,
      unique: [true, "Username must be unique"],
      require: [true, "User must have a username"],
      min: 3,
      max: 50,
    },
    password: {
      type: String,
      require: [true, "User must have a password"],
      min: 8,
      select: false,
    },
    confirmPassword: {
      type: String,
      require: [true, "User must confirm password"],
      min: 8,
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: "Password not match!",
      },
    },
    passwordChangedAt: Date,
    email: {
      type: String,
      unique: [true, "Email must be unique"],
      trim: true,
      lowercase: true,
      required: [true, "User must enter a email address"],
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please fill a valid email address"],
    },
    avatar: {
      type: String,
    },
    role: {
      type: String,
      default: "User",
      enum: ["Admin", "Author", "Editor", "User"],
    },
    passwordResetToken: String,
    resetTokenExpireTime: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.virtual("blogs", {
  ref: "Blog",
  foreignField: "author",
  localField: "blogs",
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.confirmPassword = undefined;
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) {
    return next();
  }

  this.passwordChangedAt = Date.now() - 1000;
});

userSchema.methods.checkPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.passwordChangedAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTime = parseInt(this.passwordChangedAt / 1000, 10);
    return JWTTimestamp < changedTime;
  }

  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  this.resetTokenExpireTime = Date.now() + 5 * 60 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model("Person", userSchema);

module.exports = User;
