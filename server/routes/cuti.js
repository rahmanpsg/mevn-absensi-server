const express = require("express");
const cutiModel = require("../models/cuti");
const router = express.Router();
const auth = require("../middleware/auth");

// get all data cuti
router.get("/", auth, async (req, res) => {
  const permintaan = req.query.permintaan;

  const cutis = await cutiModel
    .find({
      diterima: permintaan != null ? null : true,
    })
    .populate("user", "nama image");

  const data = cutis.filter((o) => o.user != null);

  res.send(data);
});

// get all data cuti by user
router.get("/:user", auth, async (req, res) => {
  const user = req.params.user;

  const cutis = await cutiModel.find({ user }).sort({ createdAt: -1 });

  res.send(cutis);
});

// save data cuti
router.post("/", auth, async (req, res) => {
  const { tanggal, keterangan } = req.body;

  const user = req.user.id;

  const cutis = new cutiModel({
    user,
    tanggal,
    keterangan,
  });

  console.log(req.user);

  cutis.save((err, doc) => {
    if (err) return res.status(500).send({ error: true, message: err });

    res.status(200).send({
      error: false,
      message: "Data cuti berhasil disimpan",
      data: doc,
    });
  });
});

// Terima atau tolak cuti
router.put("/", auth, async (req, res) => {
  const { _id, diterima } = req.body;

  const newData = { diterima };

  cutiModel.findByIdAndUpdate(
    _id,
    newData,
    { useFindAndModify: false },
    (err) => {
      if (err) return res.status(500).send({ message: err });

      res.status(200).send({
        message: `Data cuti berhasil ${diterima ? "diterima" : "ditolak"}`,
      });
    }
  );
});

module.exports = router;
