const mongoose = require("mongoose");
const config = require("config");

const MONGODB_URI = config.get("mongoURI");

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useFindAndModify: false,
    });
    console.log("database connected");
  } catch (error) {
    console.log(error.message);
    console.log("connection failed");
    process.exit(1); //exit app if the database is not connected
  }
};

module.exports = connectDB;
