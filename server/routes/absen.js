const express = require("express");
const absenModel = require("../models/absen");
const ruleModel = require("../models/rule");
const userModel = require("../models/user");
const router = express.Router();
const auth = require("../middleware/auth");

const moment = require("moment");

// get all data absen
router.get("/", async (req, res) => {
  const tanggal = moment().format("DD-MM-YYYY");
  const dataAbsen = await absenModel.find({ tanggal });
  const dataUser = await userModel.find({ role: "karyawan" }, "nama image");

  const data = dataUser.map((v) => {
    const absen = dataAbsen.find((o) => {
      return o.user == v.id;
    });

    if (absen) return { ...v._doc, ...absen._doc };
    return v;
  });

  // const group = await absenModel.aggregate([
  //   { $group: { _id: "$user", users: { $push: "$$ROOT" } } },
  // ]);

  res.send(data);
});

// get all data absen by user
router.get("/:user", async (req, res) => {
  const user = req.params.user;

  const { bulan, tahun } = req.query;

  const cbulan = convertBulan(bulan);

  if (bulan == null || tahun == null)
    return res.send({ error: true, message: "Parameter tidak lengkap" });

  const data = await absenModel
    .find({
      user,
      tanggal: { $regex: ".*" + `${cbulan}-${tahun}` },
      waktuPulang: { $ne: null },
    })
    .sort("tanggal");

  res.send(data);
});

// get data absen hari ini by user
router.get("/hari/:user", async (req, res) => {
  const user = req.params.user;
  const tanggal = moment().format("DD-MM-YYYY");

  const absen = await absenModel.findOne({ user, tanggal });

  if (absen == null)
    return res.send({
      tanggal,
      infoAbsenDatang: "Anda belum melakukan absen",
      infoAbsenPulang: "",
    });

  res.send(absen);
});

// save data absen datang
router.post("/datang/:user", auth, async (req, res) => {
  const user = req.params.user;

  console.log(user);

  const tanggal = moment().format("DD-MM-YYYY");

  //   periksa jika telah melakukan absen hari yang sama

  const cek = await absenModel.findOne({ user, tanggal }).countDocuments();

  if (cek > 0)
    return res.status(406).send({
      error: true,
      message: "Anda telah melakukan absen datang hari ini",
    });

  const waktuDatang = moment().format("HH:mm:ss");

  const hari = new Date().getDay();

  const rule = await ruleModel.findOne({ hari }).select("jamDatang");

  const { jamDatang } = rule;

  const infoAbsenDatang = cekWaktuAbsen("datang", waktuDatang, jamDatang);

  const absen = new absenModel({
    user,
    tanggal,
    waktuDatang,
    infoAbsenDatang,
    // infoAbsenPulang: "",
  });

  absen.save((err) => {
    if (err) return res.status(500).send({ message: err, error: true });

    res.status(200).send({
      error: false,
      message: "Anda berhasil melakukan absen datang",
    });
  });
});

// / save data absen pulang
router.post("/pulang/:user", auth, async (req, res) => {
  const user = req.params.user;

  const tanggal = moment().format("DD-MM-YYYY");

  //   periksa jika telah melakukan absen hari yang sama
  const absen = await absenModel.findOne({ user, tanggal });

  if (absen) {
    if (!absen.waktuPulang) {
      const _id = absen._id;
      absen.waktuPulang = moment().format("HH:mm:ss");

      const hari = new Date().getDay();

      const rule = await ruleModel.findOne({ hari }).select("jamPulang");

      const { jamPulang } = rule;

      absen.infoAbsenPulang = cekWaktuAbsen(
        "pulang",
        absen.waktuPulang,
        jamPulang
      );

      absenModel.findByIdAndUpdate(
        _id,
        absen,
        { useFindAndModify: false },
        (err) => {
          if (err) return res.status(500).send({ message: err });

          res.status(200).send({
            error: false,
            message: "Anda berhasil melakukan absen pulang",
          });
        }
      );
    } else {
      return res.status(406).send({
        error: true,
        message: "Anda telah melakukan absen pulang hari ini",
      });
    }
  } else {
    return res.status(406).send({
      error: true,
      message: "Anda belum melakukan absen datang hari ini",
    });
  }
});

function cekWaktuAbsen(tipe, jamAbsen, jamRule) {
  const tanggal = moment().format("MM/DD/YYYY");
  const date1 = new Date(`${tanggal} ${jamAbsen}`);
  const date2 = new Date(`${tanggal} ${jamRule}:00`);

  if (tipe == "datang") {
    const diff = date2 - date1;

    return diff < 0 ? "Anda datang terlambat" : "Anda datang tepat waktu";
  } else {
    const diff = date1 - date2;

    return diff < 0 ? "Anda pulang cepat" : "Anda pulang tepat waktu";
  }
}

function convertBulan(bulan) {
  return {
    Januari: 1,
    Februari: 2,
    Maret: 3,
    April: 4,
    Mei: 5,
    Juni: 6,
    Juli: 7,
    Agustus: 8,
    September: 9,
    Oktober: 10,
    November: 11,
    Desember: 12,
  }[bulan];
}

module.exports = router;
