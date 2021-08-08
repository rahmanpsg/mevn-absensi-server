const mongoose = require("mongoose");

const schema = mongoose.Schema({
  username: String,
  password: String,
  nama: String,
  nik: String,
  image: String,
  role: String,
  token: String,
});

module.exports = mongoose.model("User", schema);
