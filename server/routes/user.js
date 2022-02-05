const express = require("express");
const userModel = require("../models/user");
const router = express.Router();
const auth = require("../middleware/auth");
const cloudinary = require("cloudinary");

// get all data user
router.get("/", auth, async (req, res) => {
  const select = req.query.select;
  const data = await userModel.find({ role: "karyawan" }, select || "-role ");

  res.send(data);
});

// save data user
router.post("/", auth, async (req, res) => {
  const { username, password, nama, nik, image } = req.body;

  cloudinary.v2.uploader.upload(
    "data:image/png;base64," + image,
    {
      public_id: username,
      folder: "karyawan",
    },
    function (error, result) {
      if (error)
        res.status(200).send({ error: true, message: "Gagal mengupload foto" });

      const { url } = result;

      const users = new userModel({
        username,
        password,
        nama,
        nik,
        image: url,
        role: "karyawan",
      });

      users.save((err, doc) => {
        if (err) return res.status(500).send({ message: err });

        res.status(200).send({
          message: "Data karyawan berhasil disimpan",
          id: doc._id,
        });
      });
    }
  );
});

// ubah data karyawan
router.put("/", auth, async (req, res) => {
  const { _id, nik, nama, username, password } = req.body;
  let { image } = req.body;

  if (image == undefined) {
    cloudinary.v2.uploader.destroy(
      `karyawan/${username}`,
      { resource_type: "image" },
      function (error, result) {
        if (error)
          res
            .status(200)
            .send({ error: true, message: "Gagal menghapus foto" });

        console.log(result);
      }
    );
  } else if (image.length > 100) {
    const upload = await cloudinary.v2.uploader.upload(
      "data:image/png;base64," + image,
      {
        public_id: username,
        folder: "karyawan",
      }
    );

    image = upload.url;
  }

  const newData = {
    nik,
    nama,
    username,
    password,
    image,
  };

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

  const { username } = await userModel.findById(_id, "username");

  cloudinary.v2.uploader.destroy(`karyawan/${username}`, {
    resource_type: "image",
  });

  userModel.deleteOne({ _id }, (err) => {
    if (err) return res.status(500).send({ message: err });

    res.status(200).send({
      message: "Karyawan berhasil dihapus",
    });
  });
});

module.exports = router;
