const express = require("express");
const router = express.Router();
const PdfTable = require("voilab-pdf-table");
const PDFDocument = require("pdfkit");
const userModel = require("../models/user");
const absenModel = require("../models/absen");

// generete PDF Berita Acara
router.get("/karyawan/:user", async (req, res) => {
  const user = req.params.user;

  const { bulan, tahun } = req.query;

  const cbulan = convertBulan(bulan);

  if (bulan == null || tahun == null)
    return res.send({ error: true, message: "Parameter tidak lengkap" });

  const dataKaryawan = await userModel.findOne({ _id: user });

  const dataAbsen = await absenModel
    .find({
      user,
      tanggal: { $regex: ".*" + `${cbulan}-${tahun}` },
      waktuPulang: { $ne: null },
    })
    .sort("tanggal");

  let doc = new PDFDocument({
    size: "LEGAL",
    margins: { top: 10, left: 30, right: 30, bottom: 10 },
  });

  let table = new PdfTable(doc, {
    bottomMargin: 30,
  });

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

  const opt = { continued: true };

  doc.moveDown();
  doc.moveDown();
  doc.text("Nama", 30, doc.y, opt);
  doc.text(`: ${dataKaryawan.nama}`, doc.x + 28, doc.y);
  doc.text("NIK", 30, doc.y, opt);
  doc.text(`: ${dataKaryawan.nik}`, doc.x + 42);

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

  const dataTableMhs = dataAbsen.map((v, i) => {
    return {
      no: i + 1,
      tanggal: v.tanggal,
      waktuDatang: v.waktuDatang,
      waktuPulang: v.waktuPulang,
    };
  });

  table.addBody(dataTableMhs);

  // Finalize PDF file
  doc.end();
});

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
