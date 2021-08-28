const express = require("express");
const router = express.Router();
const moment = require("moment");
const PdfTable = require("voilab-pdf-table");
const PDFDocument = require("pdfkit");
const userModel = require("../models/user");
const absenModel = require("../models/absen");
const ruleModel = require("../models/rule");
const cutiModel = require("../models/cuti");
const izinModel = require("../models/izin");
const { convertBulan, convertHari } = require("../utils/convert");
const getAbsens = require("../data/absen");

// generete PDF
router.get("/", async (req, res) => {
  const { bulan, tahun } = req.query;
  const tanggal = moment().format("DD-MM-YYYY");

  const cbulan = convertBulan(bulan);

  if (bulan == null || tahun == null)
    return res.send({ error: true, message: "Parameter tidak lengkap" });

  const listKaryawan = await userModel.find(
    { role: "karyawan", createdAt: { $lte: new Date(tahun, cbulan, 1) } },
    "nama createdAt"
  );

  const listAbsen = await absenModel.find(
    {
      tanggal: { $regex: ".*" + `${cbulan}-${tahun}`, $lte: tanggal },
    },
    "-infoAbsenDatang -infoAbsenPulang"
  );
  // .aggregate([
  //   // { $match: { tanggal: { $regex: ".*" + `${cbulan}-${tahun}` } } },
  //   { $group: { _id: "$user", users: { $push: "$$ROOT" } } },
  // ]);

  const hariLibur = await ruleModel.find({ libur: true }, "hari");

  // const totalHari = new Date(tahun, cbulan, 0).getDate();
  // const totalHari = moment(`${tahun}-${cbulan}`, "YYYY-MM").daysInMonth();

  const totalHariKerja = Array.from(
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
    .filter((v) => moment(v.split(" ")[0]).isBefore(moment(new Date()))).length;

  const dataAbsen = await Promise.all(
    listKaryawan.map(async (karyawan) => {
      try {
        const dataIzin = await izinModel.find(
          {
            user: karyawan.id,
            tanggal: { $regex: ".*" + `${cbulan}-${tahun}` },
          },
          "tanggal"
        );

        let izinHadir = 0;

        const totalHadir = listAbsen
          .map((absen) => {
            if (absen.user == karyawan.id) {
              if (dataIzin.some((izin) => izin.tanggal == absen.tanggal)) {
                if (absen.waktuDatang != null) {
                  izinHadir++;
                  return true;
                }
                return true;
              }
              if (absen.waktuPulang == null) return false;
              return true;
            }
          })
          .filter(Boolean).length;

        const totalCuti = await cutiModel
          .find({
            user: karyawan.id,
            tanggal: { $regex: ".*" + `${cbulan}-${tahun}`, $lte: tanggal },
            diterima: true,
          })
          .countDocuments();

        const totalIzin = dataIzin.length;

        // const totalIzin = await izinModel
        //   .find({
        //     user: karyawan.id,
        //     tanggal: { $regex: ".*" + `${cbulan}-${tahun}` },
        //   })
        //   .countDocuments();

        // const tanggalMasuk = moment(karyawan.createdAt).format("D");

        const totalAlpa =
          totalHariKerja - totalHadir - totalCuti - (totalIzin - izinHadir);

        return {
          ...karyawan._doc,
          hadir: totalHadir,
          alpa: totalAlpa,
          cuti: totalCuti,
          izin: totalIzin,
        };
      } catch (error) {
        console.log(error);
      }
    })
  );

  let doc = new PDFDocument({
    size: "LEGAL",
    margins: { top: 10, left: 30, right: 30, bottom: 10 },
  });

  let table = new PdfTable(doc, {
    bottomMargin: 30,
  });

  createHeaderPDF(res, doc, bulan, tahun);

  doc.moveDown();

  table
    .setColumnsDefaults({
      headerBorder: ["L", "T", "B", "R"],
      border: ["L", "T", "B", "R"],
      headerPadding: [10, 0, 5, 5],
      padding: [5, 5, 5, 5],
      align: "center",
    })
    .addColumns([
      {
        id: "no",
        header: "No",
        width: 50,
      },
      {
        id: "nama",
        header: "Nama",
        width: 220,
        align: "left",
      },
      {
        id: "hadir",
        header: "Hadir",
        width: 70,
      },
      {
        id: "alpa",
        header: "Alpa",
        width: 70,
      },
      {
        id: "izin",
        header: "Izin",
        width: 70,
      },
      {
        id: "cuti",
        header: "Cuti",
        width: 70,
      },
    ])
    .onPageAdded(function (tb) {
      tb.addHeader();
    });

  const dataTable = dataAbsen.map((v, i) => {
    return {
      no: i + 1,
      nama: v.nama,
      hadir: v.hadir,
      alpa: v.alpa,
      izin: v.izin,
      cuti: v.cuti,
    };
  });

  if (dataTable.length > 0) table.addBody(dataTable);
  else {
    doc.moveDown();
    doc.moveDown();
    doc.moveDown();
    doc.fontSize(14).text(`Tidak ada data`, {
      underline: true,
      width: 310,
      align: "center",
    });
  }

  // Finalize PDF file
  doc.end();
});

router.get("/:user", async (req, res) => {
  const user = req.params.user;

  const { bulan, tahun } = req.query;

  // const cbulan = convertBulan(bulan);

  // if (bulan == null || tahun == null)
  //   return res.send({ error: true, message: "Parameter tidak lengkap" });

  const dataKaryawan = await userModel.findOne({ _id: user });

  // const dataAbsen = await absenModel
  //   .find({
  //     user,
  //     tanggal: { $regex: ".*" + `${cbulan}-${tahun}` },
  //     waktuPulang: { $ne: null },
  //   })
  //   .sort("tanggal");

  try {
    const { historiList, total } = await getAbsens(req, res, false);

    let doc = new PDFDocument({
      size: "LEGAL",
      margins: { top: 10, left: 30, right: 30, bottom: 10 },
    });

    let table = new PdfTable(doc, {
      bottomMargin: 30,
    });

    createHeaderPDF(res, doc, bulan, tahun);

    const opt = { continued: true };

    doc.moveDown();
    doc.moveDown();
    doc.text("Nama", 30, doc.y, opt);
    doc.text(`: ${dataKaryawan.nama}`, doc.x + 28, doc.y);
    doc.text("NIK", 30, doc.y, opt);
    doc.text(`: ${dataKaryawan.nik}`, doc.x + 42, doc.y);
    if (historiList.length > 0) {
      doc.text("Hadir", 30, doc.y, opt);
      doc.text(`: ${total.hadir}`, doc.x + 32, doc.y);
      doc.text("Alpa", 30, doc.y, opt);
      doc.text(`: ${total.alpa}`, doc.x + 37, doc.y);
      doc.text("Izin", 30, doc.y, opt);
      doc.text(`: ${total.izin}`, doc.x + 43, doc.y);
      doc.text("Cuti", 30, doc.y, opt);
      doc.text(`: ${total.cuti}`, doc.x + 40, doc.y);
    }
    doc.moveDown();

    table
      .setColumnsDefaults({
        headerBorder: ["L", "T", "B", "R"],
        border: ["L", "T", "B", "R"],
        headerPadding: [10, 0, 5, 5],
        padding: [5, 0, 0, 0],
        align: "center",
      })
      .addColumns([
        {
          id: "no",
          header: "No",
          width: 50,
        },
        {
          id: "tanggal",
          header: "Tanggal",
          width: 200,
        },
        {
          id: "waktuDatang",
          header: "Jam Datang",
          width: 150,
        },
        {
          id: "waktuPulang",
          header: "Jam Pulang",
          width: 150,
        },
      ])
      .onPageAdded(function (tb) {
        tb.addHeader();
      });

    const dataTable = historiList.map((v, i) => {
      return {
        no: i + 1,
        tanggal: v.tanggal,
        waktuDatang:
          v.status == "izin"
            ? "Izin"
            : v.status == "cuti"
            ? "Cuti"
            : v.waktuDatang,
        waktuPulang:
          v.status == "izin"
            ? "Izin"
            : v.status == "cuti"
            ? "Cuti"
            : v.waktuPulang,
      };
    });

    if (historiList.length > 0) table.addBody(dataTable);
    else {
      doc.moveDown();
      doc.moveDown();
      doc.moveDown();
      doc.fontSize(14).text(`Tidak ada data`, {
        underline: true,
        width: 530,
        align: "center",
      });
    }

    // Finalize PDF file
    doc.end();
  } catch (error) {
    console.log(error);
  }
});

function createHeaderPDF(res, doc, bulan, tahun) {
  res.writeHead(200, {
    "Content-Type": "application/pdf",
    "Access-Control-Allow-Origin": "*",
  });

  doc.pipe(res);

  doc.font("Helvetica-Bold").fontSize(30).text("ABSENSI KARYAWAN", 140, 20);

  doc.fontSize(14).text(`LAPORAN ABSENSI KARYAWAN`, {
    width: 310,
    align: "center",
  });

  doc.moveDown();
  doc.text(`${bulan} - ${tahun}`, {
    width: 310,
    align: "center",
  });

  doc.font("Helvetica");
}

module.exports = router;
