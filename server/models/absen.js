const mongoose = require("mongoose");

const schema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  tanggal: String,
  status: String,
  waktuDatang: String,
  waktuPulang: String,
  infoAbsenDatang: String,
  infoAbsenPulang: String,
});

module.exports = mongoose.model("Absen", schema);
