import express, { Request, Response, NextFunction } from "express";
import routes from "./routes/index";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import passport from "passport";
require("dotenv").config();

const app = express();

// Initialise MongoDB connection
mongoose.connect(String(process.env.MONGO_URI));
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => console.log("Connected to database."));

// Parse bodies of all incoming requests to populate req.body with JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());
app.use(morgan("dev"));
app.use(cookieParser());

// Pass global passport object into the configuration function
require("./config/passport")(passport);

// Initialise passport object on every request
app.use(passport.initialize());

// Make uploads folder static / publicly available
app.use("/uploads", express.static("uploads"));
app.use("/images", express.static("images"));

// Connect routes
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

app.listen(process.env.PORT || 5000);
