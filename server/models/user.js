const mongoose = require("mongoose");

const schema = mongoose.Schema(
  {
    username: String,
    password: String,
    nama: String,
    nik: String,
    image: String,
    role: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", schema);
