"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const index_1 = __importDefault(require("./routes/index"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const passport_1 = __importDefault(require("passport"));
require("dotenv").config();
const app = (0, express_1.default)();
// Initialise MongoDB connection
mongoose_1.default.connect(String(process.env.MONGO_URI));
const db = mongoose_1.default.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => console.log("Connected to database."));
// Parse bodies of all incoming requests to populate req.body with JSON
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)("dev"));
app.use((0, cookie_parser_1.default)());
// Pass global passport object into the configuration function
require("./config/passport")(passport_1.default);
// Initialise passport object on every request
app.use(passport_1.default.initialize());
// Make uploads folder static / publicly available
app.use("/uploads", express_1.default.static("uploads"));
app.use("/images", express_1.default.static("images"));
// Connect routes
app.use("/", index_1.default);
// Handle 404 errors
app.use((req, res, next) => {
    res.status(404);
    return res.type("txt").send("Not found");
});
// Default error handling middleware
app.use((err, req, res, next) => {
    res.status(500).json({ message: err.message });
});
app.listen(process.env.PORT);
