import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/database.js";
import AllRoutes from "./index.js";
dotenv.config();
connectDB();

const app = express();
app.use(cors());

app.use("/api", AllRoutes);

app.get("/", (req, res) => {
  res.send("Hello");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
