const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config({ path: "./config.env" });
const app = require("./app");

const DB = process.env.DATABASE.replace("<password>", process.env.DB_PASSWORD);

mongoose.connect(DB, {});

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log("App is running...");
});
