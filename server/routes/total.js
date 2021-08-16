const express = require("express");
const moment = require("moment");
const userModel = require("../models/user");
const absenModel = require("../models/absen");
const router = express.Router();
const auth = require("../middleware/auth");

// get total data
router.get("/", auth, async (req, res) => {
  const totalKaryawan = await userModel.countDocuments({ role: "karyawan" });

  const tanggal = moment().format("DD-MM-YYYY");
  const telahAbsen = await absenModel.countDocuments({
    tanggal,
    waktuDatang: { $ne: null },
  });

  const belumAbsen = totalKaryawan - telahAbsen;

  res.send({ totalKaryawan, telahAbsen, belumAbsen });
});

module.exports = router;
