const moment = require("moment");
const absenModel = require("../models/absen");
const ruleModel = require("../models/rule");
const cutiModel = require("../models/cuti");
const izinModel = require("../models/izin");
const { convertBulan, convertHari } = require("../utils/convert");

module.exports = async function (req, res, sort = true) {
  const user = req.params.user;
  const tanggal = moment().format("DD-MM-YYYY");

  const { bulan, tahun } = req.query;

  const cbulan = convertBulan(bulan);

  if (bulan == null || tahun == null)
    return res.send({ error: true, message: "Parameter tidak lengkap" });

  const hariLibur = await ruleModel.find({ libur: true }, "hari");

  const hariKerja = Array.from(
    { length: moment(`${tahun}-${cbulan}`).daysInMonth() },
    (x, i) =>
      moment(`${tahun}-${cbulan}`)
        .startOf("month")
        .add(i, "days")
        .format("DD-dddd")
  )
    .filter((v) =>
      hariLibur.find((o) => convertHari(o.hari) != v.split("-")[1])
    )
    .map((v) => `${v.split("-")[0]}-${cbulan}-${tahun}`);

  // Periksa jika data adalah bulan yang berjalan
  const checkIfIsMonth = (bulan, tahun) => {
    return bulan == moment().month() + 1 && tahun == moment().year();
  };

  const dataAbsen = await absenModel
    .find(
      {
        user,
        tanggal: {
          $regex: ".*" + `${cbulan}-${tahun}`,
          $lte: checkIfIsMonth(parseInt(cbulan), tahun) ? tanggal : "32",
        },
        // waktuPulang: { $ne: null },
      },
      "-user"
    )
    .sort({ tanggal: "DESC" });

  if (!dataAbsen.length && !checkIfIsMonth(parseInt(cbulan), tahun))
    return { historiList: dataAbsen };

  const dataIzin = await izinModel.find(
    { user, tanggal: { $regex: ".*" + `${cbulan}-${tahun}` } },
    "-user"
  );

  const dataCuti = await cutiModel.find(
    {
      user,
      tanggal: { $regex: ".*" + `${cbulan}-${tahun}`, $lte: tanggal },
      diterima: true,
    },
    "-user"
  );

  let totalHadir = 0,
    totalAlpa = 0,
    totalIzin = 0,
    totalCuti = 0;

  const data = dataAbsen.map((absen) => {
    absen["status"] = "hadir";
    totalHadir++;

    // Sesuaikan data izin berdasarkan tanggal
    if (dataIzin.some((izin) => izin.tanggal == absen.tanggal)) {
      const izinIndex = dataIzin.findIndex(
        (izin) => izin.tanggal == absen.tanggal
      );

      const waktuIzin = moment(dataIzin[izinIndex].createdAt).format(
        "HH:mm:ss"
      );
      // if (absen.waktuDatang == null) {
      //   absen.waktuDatang = waktuIzin;
      //   absen.infoAbsenDatang = dataIzin[izinIndex].keterangan;
      //   absen.status = "izin"; //status jika melakukan izin tidak hadir
      // }
      absen.waktuPulang = waktuIzin + " (Izin)";
      absen.infoAbsenPulang = dataIzin[izinIndex].keterangan;
      absen.status = "izinPulang"; //status jika melakukan izin setelah absen masuk
      totalIzin++;
    }

    if (absen.waktuPulang == null) {
      if (absen.tanggal == tanggal)
        absen.infoAbsenPulang = "Anda belum absen pulang";
      else absen.infoAbsenPulang = "Anda tidak absen pulang";

      absen.waktuPulang = "-";
      absen.status = "alpa";
      totalAlpa++;
      totalHadir--;
    }

    return absen;
  });

  hariKerja.forEach((h) => {
    // console.log(h);
    if (data.some((absen) => absen.tanggal == h)) {
      return;
    }

    if (dataIzin.some((izin) => izin.tanggal == h)) {
      const izinIndex = dataIzin.findIndex((izin) => izin.tanggal == h);

      const waktuIzin = moment(dataIzin[izinIndex].createdAt).format(
        "HH:mm:ss"
      );

      totalIzin++;

      return data.push({
        tanggal: h,
        status: "izin",
        waktuDatang: waktuIzin,
        infoAbsenDatang: dataIzin[izinIndex].keterangan,
        waktuPulang: waktuIzin,
        infoAbsenPulang: dataIzin[izinIndex].keterangan,
      });
    }

    if (dataCuti.some((cuti) => cuti.tanggal == h)) {
      const cutiIndex = dataCuti.findIndex((cuti) => cuti.tanggal == h);

      const waktuCuti = moment(dataCuti[cutiIndex].createdAt).format(
        "HH:mm:ss"
      );

      totalCuti++;

      return data.push({
        tanggal: h,
        status: "cuti",
        waktuDatang: waktuCuti,
        infoAbsenDatang: dataCuti[cutiIndex].keterangan,
        waktuPulang: "-",
        infoAbsenPulang: dataCuti[cutiIndex].keterangan,
      });
    }

    if (!checkIfIsMonth(parseInt(cbulan), tahun)) {
      totalAlpa++;

      return data.push({
        tanggal: h,
        status: "alpa",
        waktuDatang: "-",
        infoAbsenDatang: "Anda tidak absen datang",
        infoAbsenPulang: "Anda tidak absen pulang",
        waktuPulang: "-",
      });
    }
  });

  const historiList = data.sort((a, b) =>
    sort
      ? b.tanggal.split("-")[0] - a.tanggal.split("-")[0]
      : a.tanggal.split("-")[0] - b.tanggal.split("-")[0]
  );

  const total = {
    hadir: totalHadir,
    alpa: totalAlpa,
    izin: totalIzin,
    cuti: totalCuti,
  };

  return { historiList, total, totalHariKerja: hariKerja.length };
};
