const express = require("express");
const blogController = require("../controller/blogController");
const authController = require("../controller/authController");

const router = express.Router();

router
  .route("/")
  .get(blogController.getAllBlog)
  .post(
    authController.protect,
    authController.restrictedTo("Admin", "Author", "Editor"),
    blogController.createBlog
  );

router
  .route("/:id")
  .get(blogController.getBLog)
  .delete(
    authController.protect,
    authController.restrictedTo("Admin", "Author", "Editor"),
    blogController.delateBlog
  );

module.exports = router;
