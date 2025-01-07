import dotenv from "dotenv";
import express from "express";
import cors from "cors";
const app = express();

dotenv.config();

// Middleware
app.use(cors());
app.use(express.json());

// // Routes
// app.use("/api/auth", require("./routes/auth"));
// app.use("/api/users", require("./routes/users"));

app.get("/", (req, res) => {
  res.send("Hello");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
