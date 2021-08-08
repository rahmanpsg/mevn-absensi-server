const express = require("express");
const userModel = require("../models/user");
const router = express.Router();

// get all data user
router.get("/", async (req, res) => {
  const data = await userModel.find({ role: "karyawan" });

  res.send(data);
});

// save data user
router.post("/", async (req, res) => {
  const { username, password, nama, nik, image } = req.body;

  const users = new userModel({
    username,
    password,
    nama,
    nik,
    image,
    role: "karyawan",
  });

  users.save((err) => {
    if (err) return res.status(500).send({ message: err });

    res.status(200).send({
      message: "Data karyawan berhasil disimpan",
    });
  });
});

// ubah data karyawan
router.put("/", async (req, res) => {
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
router.delete("/:id", async (req, res) => {
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
