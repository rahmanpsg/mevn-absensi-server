const mongoose = require("mongoose");

const schema = mongoose.Schema({
  latitude: Number,
  longitude: Number,
  radius: Number,
});

module.exports = mongoose.model("Geolocation", schema);
