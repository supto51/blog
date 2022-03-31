const Blog = require("../models/blogModel");
const catchAsync = require("../utils/catchAsync");

exports.getAllBlog = catchAsync(async (req, res, next) => {
  const blogs = await Blog.find();

  res.status(200).json({
    status: "Success",
    data: {
      data: blogs,
    },
  });
});

exports.createBlog = catchAsync(async (req, res, next) => {
  const blog = await Blog.create(req.body);

  res.status(201).json({
    status: "Success",
    data: {
      data: blog,
    },
  });
  res.status(400).json({
    Status: "error",
    message: err.message,
  });
});

exports.getBLog = async (req, res, next) => {
  const blog = await Blog.findById(req.params.id);

  res.status(200).json({
    status: "Success",
    data: {
      data: blog,
    },
  });
};

exports.delateBlog = async (req, res, next) => {
  await Blog.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: "Success",
  });
};
