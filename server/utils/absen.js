const moment = require("moment");

const ruleModel = require("../models/rule");
const cutiModel = require("../models/cuti");
const { convertHari } = require("./convert");

async function genereteAbsen(tahun, cbulan) {
  const userJson = require("../../src/assets/users.json").map(
    (json) => json._id["$oid"]
  );

  const absens = [];

  for (const user of userJson) {
    // const user = "61e68be9d447d80016828432";

    const hariLibur = await ruleModel.find({ libur: true }, "hari");

    const harikerja = Array.from(
      { length: moment(`${tahun}-${cbulan}`).daysInMonth() },
      (x, i) =>
        moment(`${tahun}-${cbulan}`)
          .startOf("month")
          .add(i, "days")
          .format("YYYY-MM-DD dddd")
    )
      .filter((v) =>
        hariLibur.find((o) => convertHari(o.hari) != v.split(" ")[1])
      )
      .filter((v) => moment(v.split(" ")[0]).isBefore(moment(new Date())));

    const rule = await ruleModel.find().select("hari jamDatang jamPulang");

    const absen = harikerja.map(async (v) => {
      const date = v.split(" ")[0];
      const tanggal = moment(date).format("DD-MM-YYYY");
      const hari = moment(date).day();

      const cekCuti = await cutiModel.find({ user, tanggal }).countDocuments();

      // console.log(cekCuti);

      if (cekCuti > 0) return;

      const { jamDatang, jamPulang } = rule.find((r) => r.hari == hari);

      // probabilitas tepat waktu
      const prob = 70;
      let randWaktuDatang;
      let randWaktuPulang;

      if (Math.floor(Math.random() * 100) >= prob) {
        randWaktuDatang = Math.floor(Math.random() * (30 - 0 + 1) + 0);
        // randWaktuPulang = Math.floor(Math.random() * (0 - -30 + 1) + -30);
      } else {
        randWaktuDatang = Math.floor(Math.random() * (0 - -30 + 1) + -30);
      }
      randWaktuPulang = Math.floor(Math.random() * (30 - 0 + 1) + 0);

      const waktuDatang = moment(`${date} ${jamDatang}`)
        .add(randWaktuDatang, "minutes")
        .format("HH:mm:ss");
      const infoAbsenDatang = cekWaktuAbsen("datang", waktuDatang, jamDatang);
      const waktuPulang = moment(`${date} ${jamPulang}`)
        .add(randWaktuPulang, "minutes")
        .format("HH:mm:ss");
      const infoAbsenPulang = cekWaktuAbsen("pulang", waktuPulang, jamPulang);
      return {
        user,
        tanggal,
        waktuDatang,
        waktuPulang,
        infoAbsenDatang,
        infoAbsenPulang,
      };
    });

    absens.push(...absen);
  }

  return Promise.all(absens);
  // absenModel.insertMany(absens).then(() => res.send({ res: true }));
}

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

module.exports = { genereteAbsen, cekWaktuAbsen };
