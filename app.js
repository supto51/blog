const express = require("express");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xssClean = require("xss-clean");
const hpp = require("hpp");

const blogRouter = require("./routes/blogRouter");
const userRouter = require("./routes/userRouter");

const globalErrorHandler = require("./controller/errorController");

const app = express();

app.use(helmet());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const rateLimiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 100,
  message: "Too many request from this IP, Please try again after some time!",
});

app.use(express.json());
app.use(mongoSanitize());
app.use(xssClean());
app.use(hpp());

app.use("/api", rateLimiter);
app.use("/api/v1/blogs", blogRouter);
app.use("/api/v1/persons", userRouter);

app.all("*", (req, res, next) => {
  res.status(404).json({
    status: "Error",
    message: `Can't find ${req.originalUrl} on the sever!`,
  });

  next();
});

app.use(globalErrorHandler);

module.exports = app;
