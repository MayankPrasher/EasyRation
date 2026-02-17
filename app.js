const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
// const moongoose = require("mongoose");
const cookieParser = require("cookie-parser");
// const cron = require("node-cron");

const config = require("./config/index");
const connectDB = require("./config/db");

const authRoutes = require("./routes/Auth");
const mainRoutes = require("./routes/main");

const app = express();
connectDB();

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "/public")));
app.use(cookieParser())

app.use("/", authRoutes);
app.use("/app", mainRoutes);

app.use(
  (req,res,next)=>{
    res.status(404).render("404",{
      pageTitle:"Page Note Found",
      path:"/404"
    })
  })

app.listen(config.port,()=>{
  console.log(`Server running on port ${config.port}`)
})

