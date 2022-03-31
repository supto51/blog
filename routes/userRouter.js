const express = require("express");
const userController = require("../controller/userController");
const authController = require("../controller/authController");

const router = express.Router();

router
  .route("/")
  .get(authController.protect, userController.getAllUser)
  .post(userController.createUser);

router.route("/signup").post(authController.signup);
router.route("/login").post(authController.login);
router.route("/forgot-password").post(authController.forgotPassword);
router.route("/reset-password/:token").patch(authController.resetPassword);
router.route("/update-password").patch(authController.protect, authController.updatePassword);
router.route("/update-user").patch(authController.protect, userController.updateCurrentUser);
router.route("/delete-user").delete(authController.protect, userController.deleteCurrentUser);

router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
