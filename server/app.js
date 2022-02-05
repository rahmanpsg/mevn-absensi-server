require("dotenv").config();
require("./config/database").connect();
require("./config/cloudinary");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const moment = require("moment");

const app = express();

moment.locale("id");

// app.use(express.json());
app.use(bodyParser.json({ limit: "10mb", extended: true }));
app.use(cors());

const loginRoute = require("./routes/login");
const geolocationRoute = require("./routes/geolocation");
const absenRoute = require("./routes/absen");
const userRoute = require("./routes/user");
const cutiRoute = require("./routes/cuti");
const izinRoute = require("./routes/izin");
const ruleRoute = require("./routes/rule");
const cetakRoute = require("./routes/cetak");
const totalRoute = require("./routes/total");

app.use(express.static("./dist/"));

app.get("/", (req, res) => {
  res.sendFile(__dirname, "./dist/index.html");
});

app.use("/login", loginRoute);
app.use("/geolocation", geolocationRoute);
app.use("/absen", absenRoute);
app.use("/user", userRoute);
app.use("/cuti", cutiRoute);
app.use("/izin", izinRoute);
app.use("/rule", ruleRoute);
app.use("/cetak", cetakRoute);
app.use("/total", totalRoute);

module.exports = app;
