const mongoose = require("mongoose");

const schema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    tanggal: String,
    keterangan: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Izin", schema);
