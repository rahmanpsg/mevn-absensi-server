const express = require("express");
const geolocationModel = require("../models/geolocation");
const router = express.Router();
const auth = require("../middleware/auth");

// get kantor coordinate
router.get("/", auth, async (req, res) => {
  const data = await geolocationModel.findOne();

  res.send(data);
});

// save kantor coordinate
router.post("/", async (req, res) => {
  const { latitude, longitude, radius } = req.body;

  const geolocations = new geolocationModel({ latitude, longitude, radius });

  geolocations.save((err, doc) => {
    if (err) return res.status(500).send({ message: err });

    res.status(200).send({
      message: "Data geolocation berhasil disimpan",
    });
  });
});

module.exports = router;
