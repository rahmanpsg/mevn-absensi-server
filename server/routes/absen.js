const express = require("express");
const absenModel = require("../models/absen");
const ruleModel = require("../models/rule");
const userModel = require("../models/user");
const izinModel = require("../models/izin");
const cutiModel = require("../models/cuti");
const router = express.Router();
const auth = require("../middleware/auth");
const getAbsens = require("../data/absen");

const moment = require("moment");

// get all data absen
router.get("/", auth, async (req, res) => {
  const tanggal = moment().format("DD-MM-YYYY");
  const dataUser = await userModel.find({ role: "karyawan" }, "nama image");
  const dataAbsen = await absenModel.find({ tanggal }, "-tanggal");
  const dataIzin = await izinModel.find({ tanggal }, "user keterangan");
  const dataCuti = await cutiModel.find(
    { tanggal, diterima: true },
    "user keterangan"
  );

  const data = dataUser.map((v) => {
    const absen = dataAbsen.find((o) => o.user == v.id);
    const izin = dataIzin.find((o) => o.user == v.id);
    const cuti = dataCuti.find((o) => o.user == v.id);

    let res = v._doc;

    if (absen) res = { ...res, ...absen._doc };
    if (izin) res = { ...res, izin: true, ...izin._doc };
    if (cuti) res = { ...res, cuti: true, ...cuti._doc };

    return res;
  });

  res.send(data);
});

// get all data absen/history by user
router.get("/:user", auth, async (req, res) => {
  try {
    const { historiList, total } = await getAbsens(req, res);

    res.send({ historiList, total });
  } catch (error) {
    console.log(error);
  }
});

// get data absen hari ini by user
router.get("/hari/:user", auth, async (req, res) => {
  const user = req.params.user;
  const tanggal = moment().format("DD-MM-YYYY");

  const absen = await absenModel.findOne({ user, tanggal });

  const hari = new Date().getDay();
  const dataRule = await ruleModel.findOne({ hari }).select("libur");

  const dataIzin = await izinModel
    .findOne({ user, tanggal }, "user keterangan")
    .countDocuments();
  const dataCuti = await cutiModel
    .findOne({ user, tanggal, diterima: true }, "user keterangan")
    .countDocuments();

  if (absen == null) {
    const response = {
      tanggal,
      infoAbsenDatang: "",
      infoAbsenPulang: "",
    };

    if (dataIzin > 0) {
      response["izin"] = true;
    } else if (dataCuti > 0) {
      response["cuti"] = true;
    } else if (!dataRule.libur) {
      response["infoAbsenDatang"] = "Anda belum melakukan absen";
    }

    return res.send(response);
  }

  const response = { ...absen._doc };

  if (dataIzin > 0) {
    response["izin"] = true;
  }

  res.send(response);
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

  let totalSeconds = moment(date1).diff(moment(date2), "seconds");

  const hours = Math.floor(totalSeconds / 3600);
  totalSeconds %= 3600;
  const minutes = Math.floor(totalSeconds / 60);

  if (tipe == "datang") {
    let info = "Anda datang tepat waktu";

    if (hours > 0 || minutes >= 1) {
      info =
        "Anda datang terlambat " +
        (hours > 0 ? `${hours} jam, ` : "") +
        `${minutes} menit`;
    }

    return info;
  } else {
    let info = "Anda pulang tepat waktu";

    if (hours >= 1) {
      info =
        "Anda pulang lewat dari " +
        (hours > 0 ? `${hours} jam, ` : "") +
        `${minutes} menit`;
    }

    return info;
  }
}

module.exports = router;
