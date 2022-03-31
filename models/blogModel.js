const mongoose = require("mongoose");
const slugify = require("slugify");

const blogSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "blog must have a name!"],
      min: 5,
      max: 50,
      unique: true,
    },
    excerpt: {
      type: String,
      required: [true, "blog must have a excerpt!"],
    },
    imageCover: {
      type: String,
      required: [true, "blog must have a cover  image"],
    },
    images: {
      type: [String],
    },
    description: {
      type: String,
      required: [true, "blog must have a description!"],
    },
    tags: {
      type: [String],
    },
    slug: String,
    author: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  },

  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

blogSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });

  next();
});

blogSchema.pre(/^find/, function (next) {
  this.populate({
    ref: "User",
    select: "firstName lastName avatar",
  });

  next();
});

const Blog = mongoose.model("Blog", blogSchema);

module.exports = Blog;
