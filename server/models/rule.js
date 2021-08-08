const mongoose = require("mongoose");

const schema = mongoose.Schema({
  hari: Number,
  jamDatang: String,
  jamPulang: String,
  lembur: Boolean,
  libur: Boolean,
});

module.exports = mongoose.model("Rule", schema);
