// Server created to communicate with: database & api
const express = require("express");
// middleware
const { handleNotFound, errorHandler } = require("./middleware/helpers");
const { authenticateJWT } = require("./middleware/auth");

const app = express();
const cors = require("cors");
const morgan = require("morgan");

//Routes
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const imageRoutes = require("./routes/image");

// Middleware definitions applies to all requests at all paths
app.use(express.json()); //parse JSON data
app.use(morgan("tiny")); // Logging middleware
app.use(cors());
app.use(authenticateJWT);

// normal route handler
app.use("/users", userRoutes);
app.use("/auth", authRoutes);
app.use("/image", imageRoutes);

app.use(handleNotFound); // 404 handler middleware
app.use(errorHandler); // Error handling middleware

module.exports = app;
