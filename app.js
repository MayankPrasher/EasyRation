require("dotenv").config();
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const moongoose = require("mongoose");
const authRoutes = require("./routes/Auth");
const mainRoutes = require("./routes/main");
const storeRoutes = require("./routes/store");
const flash = require("connect-flash");
const session = require("express-session");
const cron = require("node-cron");
const mainController = require("./controller/Main");
const mongodbStore = require("connect-mongodb-session")(session);
const app = express();
const store = new mongodbStore({
  uri: process.env.MONGODB_URI,
  collection: "sessions",
});
app.set("view engine", "ejs");

app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "/public")));
app.use(
  session({
    secret: "easyration",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);
app.use(flash());
// app.use(flash());
app.use("/", authRoutes);
app.use("/app", mainRoutes);
app.use("/store", storeRoutes);
cron.schedule("0 0 * * *", mainController.updateSlot, {
  scheduled: true,
  timezone: "Asia/Kolkata",
});
cron.schedule("0 0 1 * *", mainController.updateUserMonth, { scheduled: true });
moongoose
  .connect(process.env.MONGODB_URI)
  .then((result) => {
    app.listen(process.env.PORT);
  })
  .catch((err) => console.log(err));
