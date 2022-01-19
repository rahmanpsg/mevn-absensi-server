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

schema.pre("deleteOne", function (next) {
  const absens = mongoose.model("Absen");
  const izins = mongoose.model("Izin");
  const cutis = mongoose.model("Cuti");

  const id = this.getQuery()["_id"];

  absens.deleteMany({ user: id }, (err) => {
    if (err) next(err);
    next();
  });

  izins.deleteMany({ user: id }, (err) => {
    if (err) next(err);
    next();
  });

  cutis.deleteMany({ user: id }, (err) => {
    if (err) next(err);
    next();
  });
});

module.exports = mongoose.model("User", schema);
