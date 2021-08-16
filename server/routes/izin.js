const express = require("express");
const moment = require("moment");
const izinModel = require("../models/izin");
const router = express.Router();
const auth = require("../middleware/auth");

// get all data izin
router.get("/", auth, async (req, res) => {
  const izins = await izinModel.find().populate("user", "nama image");

  const data = izins.filter((o) => o.user != null);

  res.send(data);
});

// get all data izin by user
router.get("/:user", auth, async (req, res) => {
  const user = req.params.user;

  const izins = await izinModel.find({ user }).sort({ createdAt: -1 });

  res.send(izins);
});

// save data izin
router.post("/", auth, async (req, res) => {
  const { keterangan } = req.body;

  const user = req.user.id;
  const tanggal = moment().format("DD-MM-YYYY");

  // periksa jika telah melakukan izin hari ini
  const cek = await izinModel.find({ user, tanggal }).countDocuments();

  if (cek > 0)
    return res.send({
      error: true,
      message: "Anda telah melakukan izin hari ini",
    });

  const izins = new izinModel({
    user,
    tanggal,
    keterangan,
  });

  izins.save((err, doc) => {
    if (err) return res.status(500).send({ error: true, message: err });

    res.status(200).send({
      error: false,
      message: "Data izin berhasil disimpan",
      data: doc,
    });
  });
});

module.exports = router;
