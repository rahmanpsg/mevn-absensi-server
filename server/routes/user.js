const express = require("express");
const userModel = require("../models/user");
const router = express.Router();
const auth = require("../middleware/auth");

// get all data user
router.get("/", auth, async (req, res) => {
  const select = req.query.select;
  const data = await userModel.find({ role: "karyawan" }, select || "-role ");

  res.send(data);
});

// save data user
router.post("/", auth, async (req, res) => {
  const { username, password, nama, nik, image } = req.body;

  const users = new userModel({
    username,
    password,
    nama,
    nik,
    image,
    role: "karyawan",
  });

  users.save((err, doc) => {
    if (err) return res.status(500).send({ message: err });

    res.status(200).send({
      message: "Data karyawan berhasil disimpan",
      id: doc._id,
    });
  });
});

// ubah data karyawan
router.put("/", auth, async (req, res) => {
  const { _id, nik, nama, username, password, images } = req.body;

  const newData = { nik, nama, username, password, images };

  userModel.findByIdAndUpdate(
    _id,
    newData,
    { useFindAndModify: false },
    (err) => {
      if (err) return res.status(500).send({ message: err });

      res.status(200).send({
        message: "Karyawan berhasil diubah",
      });
    }
  );
});

// hapus data karyawan
router.delete("/:id", auth, async (req, res) => {
  const _id = req.params.id;

  if (!_id) {
    return res.status(404).send({ message: "ID tidak ditemukan" });
  }

  userModel.deleteOne({ _id }, (err) => {
    if (err) return res.status(500).send({ message: err });

    res.status(200).send({
      message: "Karyawan berhasil dihapus",
    });
  });
});

module.exports = router;
