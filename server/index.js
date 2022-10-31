//For using Dotenv variables
require("dotenv").config();

const cookieParser = require("cookie-parser")
//Express
const express = require("express");
const app = express();

//MongoDB Connection
require("./db/connection");

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


//Routes
const PostRoute = require("./routes/postRoutes");
const UserRoute = require("./routes/userRoutes");
app.use("/api", PostRoute);
app.use("/api", UserRoute);

//Listening to port
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port: ${process.env.PORT}`);
});
