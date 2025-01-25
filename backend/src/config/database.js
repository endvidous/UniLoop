import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const connection = {
  isConnected: mongoose.connection.readyState, // Use Mongoose's readyState
};

const connectDB = async () => {
  try {
    if (connection.isConnected) {
      console.log("Already connected to MongoDB");
      return;
    }
    if (mongoose.connection.readyState) {
      connection.isConnected = mongoose.connection.readyState;
      console.log("Reusing existing MongoDB connection");
      return;
    }
    const db = await mongoose.connect(process.env.MONGODB_URI);
    connection.isConnected = db.connections[0].readyState;
    console.log("Connected to MongoDB");
    return db;
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
};

export default connectDB;
