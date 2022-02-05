const express = require("express");
const absenModel = require("../models/absen");
const geolocationModel = require("../models/geolocation");
const router = express.Router();
const auth = require("../middleware/auth");

const moment = require("moment");

// get kantor coordinate
router.get("/", auth, async (req, res) => {
  const data = await geolocationModel.findOne();

  res.send(data);
});

// save kantor coordinate
router.post("/", auth, async (req, res) => {
  const { latitude, longitude, radius } = req.body;

  await geolocationModel.deleteMany();

  const geolocations = new geolocationModel({ latitude, longitude, radius });

  geolocations.save((err) => {
    if (err) return res.status(500).send({ message: err });

    res.status(200).send({
      message: "Data geolocation berhasil disimpan",
    });
  });
});

// save lokasi karyawan setelah absen
router.post("/:user", auth, async (req, res) => {
  const user = req.params.user;
  const { latitude, longitude } = req.body;

  const tanggal = moment().format("DD-MM-YYYY");

  //   periksa jika telah melakukan absen hari yang sama
  const absen = await absenModel.findOne({ user, tanggal });

  if (absen) {
    const waktu = moment().format("HH:mm:ss");

    const lokasi = { latitude, longitude, waktu };
    console.log(lokasi);

    absenModel.findByIdAndUpdate(
      absen._id,
      { $push: { lokasi: lokasi } },
      { useFindAndModify: false },
      (err) => {
        if (err) return res.status(500).send({ message: err });

        res.status(200).send({
          error: false,
          message: "Lokasi berhasil disimpan",
        });
      }
    );
  }
});

module.exports = router;
