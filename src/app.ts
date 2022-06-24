import express, { Request, Response, NextFunction } from "express";
import routes from "./routes/index";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
require("dotenv").config();

const app = express();

// Initialise MongoDB connection
mongoose.connect(String(process.env.MONGO_URI));
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => console.log("Connected to database."));

// Parse bodies of all incoming requests to populate req.body with JSON
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.use(cookieParser());

// Make uploads folder static / publicly available
app.use("/uploads", express.static("uploads"));

// app.use(express.urlencoded());
// app.use(cookieParser());
// app.use(logger("dev"));

// Connect routes to our app
// Forward all requests targeting /todos to our todoRoutes
// app.use("/todos", todoRoutes);
app.use("/", routes);

// Handle 404 errors
app.use((req, res, next): Response => {
  res.status(404);
  return res.type("txt").send("Not found");
});

// Default error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({ message: err.message });
});

app.listen(process.env.PORT);
