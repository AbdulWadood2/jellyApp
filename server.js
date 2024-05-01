const path = require("path");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
/* routes */
const userRouter = require("./Route/user.routes");
const productRouter = require("./Route/product.routes");
const fileRouter = require("./Route/fileSystem.routes");
const userPlanRouter = require("./Route/userPlan.routes");
const adminRouter = require("./Route/admin.routes");
const limitationRouter = require("./Route/limitation.route");
const dashboardRouter = require("./Route/dashboard.routes");
const categoryRouter = require("./Route/category.routes");
const notificationRouter = require("./Route/notification.routes");
const fs = require("fs");

const folderStructure = ["posts", "posts/users"];

// function for make all needed global files
const createFoldersMiddleware = () => {
  for (const folder of folderStructure) {
    const folderPath = path.join(__dirname, folder);

    // Check if the folder exists
    if (!fs.existsSync(folderPath)) {
      // If the folder doesn't exist, create it
      fs.mkdirSync(folderPath, { recursive: true });
    }
  }
};
// function for make all needed global files : calls here
createFoldersMiddleware();

const dotenv = require("dotenv");
dotenv.config({ path: ".env" });

const app = express();
const requestIp = require("request-ip");
app.use(requestIp.mw());
app.enable("trust proxy");
app.use(cors());
app.options("*", cors());

app.use(
  express.json({
    limit: "10kb",
  })
);
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// static folder
app.use(express.static("posts")); // Serve static files from the 'public' directory
/* routes */
app.use("/api/v1/user", userRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/file", fileRouter);
app.use("/api/v1/userPlan", userPlanRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/limitation", limitationRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/category", categoryRouter);
app.use("/api/v1/notifications", notificationRouter);

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    data: null,
    error: err.message,
    fullError: err.stack,
  });
});

const DB = process.env.mongo_uri;
mongoose
  .connect(DB, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((err) => {
    console.error("Error connecting to the database:", err);
  });

console.log("database connecting");

const port = 3000;

const server = app.listen(port, () => {
  console.log(`App run with url: http://localhost:${port}`);
});
