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
const geolocationModel = require("../models/geolocation");
const { convertBulan, convertHari } = require("../utils/convert");
const { distance } = require("../utils/geolocation");
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

  // Periksa jika data adalah bulan yang berjalan
  const checkIfIsMonth = (bulan, tahun) => {
    return bulan == moment().month() + 1 && tahun == moment().year();
  };

  const listAbsen = await absenModel.find(
    {
      tanggal: {
        $regex: ".*" + `${cbulan}-${tahun}`,
        $lte: checkIfIsMonth(parseInt(cbulan), tahun) ? tanggal : "32",
      },
    },
    "-infoAbsenDatang -infoAbsenPulang"
  );

  const hariLibur = await ruleModel.find({ libur: true }, "hari");

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
          .filter((absen) => absen.user == karyawan.id)
          .map((absen) => {
            if (dataIzin.some((izin) => izin.tanggal == absen.tanggal)) {
              if (absen.waktuDatang != null) {
                izinHadir++;
                return true;
              }
              return true;
            }
            if (absen.waktuPulang == null) return false;
            return true;
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
    size: "A4",
    margins: { top: 10, left: 23, right: 30, bottom: 10 },
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

  const dataTable = dataAbsen.map((absen, i) => {
    return {
      no: i + 1,
      nama: absen.nama,
      hadir: absen.hadir,
      alpa: absen.alpa,
      izin: absen.izin,
      cuti: absen.cuti,
    };
  });

  if (dataTable.length == 0) {
    doc.moveDown(3);
    doc.fontSize(14).text(`Tidak ada data`, {
      underline: true,
      width: 310,
      align: "center",
    });
    doc.end();
    return;
  } else {
    if (checkIfIsMonth(parseInt(cbulan), tahun)) {
      doc.x = 30;
      doc.text("KETERANGAN : DATA ABSENSI BELUM LENGKAP", {
        align: "left",
      });
    }
  }

  table.addBody(dataTable);

  createTTD(doc);

  // Finalize PDF file
  doc.end();
});

router.get("/:user", async (req, res) => {
  const user = req.params.user;

  const { bulan, tahun } = req.query;

  const dataKaryawan = await userModel.findOne({ _id: user });

  const dataGeolocation = await geolocationModel.findOne();

  try {
    const { historiList, total, totalHariKerja } = await getAbsens(
      req,
      res,
      false
    );

    let doc = new PDFDocument({
      size: "LEGAL",
      margins: { top: 10, left: 30, right: 30, bottom: 10 },
    });

    let tableHeader = new PdfTable(doc, {
      bottomMargin: 30,
    });

    let table = new PdfTable(doc, {
      bottomMargin: 30,
    });

    createHeaderPDF(res, doc, bulan, tahun);

    tableHeader.addColumns([{ id: "jenis", width: 105 }, { id: "teks" }]);

    let listJenis = ["NAMA", "NIK"];
    let listTeks = [dataKaryawan.nama.toUpperCase(), dataKaryawan.nik];

    if (historiList.length > 0) {
      listJenis = [...listJenis, "HADIR", "ALPA", "IZIN", "CUTI"];
      listTeks = [...listTeks, total.hadir, total.alpa, total.izin, total.cuti];

      if (
        moment(historiList[0].tanggal, "DD-MM-YYYY").endOf("month") >
          moment() ||
        historiList.length != totalHariKerja
      ) {
        listTeks.push("DATA ABSENSI TIDAK LENGKAP");
      } else {
        listTeks.push("DATA ABSENSI LENGKAP");
      }
    } else {
      listTeks.push("DATA ABSENSI TIDAK LENGKAP");
    }

    listJenis.push("KETERANGAN");

    const dataTableHeader = listJenis.map((jenis, index) => {
      return { jenis, teks: `: ${listTeks[index]}` };
    });

    tableHeader.addBody(dataTableHeader);

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
      .onRowAdd((tb, row) => {
        const shade = "#525252";
        const black = "#000";

        tb.pdf.stroke(black);

        if (row.no != "") return;
        const w = tb.getColumnWidth("no") - 2;
        const h = row._renderedContent.height - 2;
        tb.pdf.rect(30, tb.pdf.y, w, h, shade).fillAndStroke(shade, shade);

        tb.setColumnsDefaults({ border: ["T", "B"] });
        // tb.setColumns()

        // const w_t = tb.getWidth();
        const w_t = tb.getColumnWidth("tanggal") - 3;
        tb.pdf
          .rect(30 + w + 3, tb.pdf.y, w_t, h, shade)
          .fillAndStroke(shade, shade)
          .fill(black);
      })
      .onPageAdded(function (tb) {
        tb.pdf.fillAndStroke("#000");
        tb.addHeader();
      });
    const dataTable = historiList.map((absen, i) => {
      if (absen.lokasi != null && absen.lokasi.length > 0) {
        // console.log(absen.lokasi);

        absen.geolocation = [];

        for (const lokasi of absen.lokasi) {
          const dist = distance(
            dataGeolocation.latitude,
            dataGeolocation.longitude,
            lokasi.latitude,
            lokasi.longitude,
            "K"
          );

          const jarakMeter = Math.round(dist * 1000);

          if (absen.geolocation.length > 0) {
            if (absen.geolocation[absen.geolocation.length - 1].keluar) {
              if (jarakMeter <= dataGeolocation.radius)
                absen.geolocation.push({ waktu: lokasi.waktu, keluar: false });
            } else if (jarakMeter > dataGeolocation.radius) {
              absen.geolocation.push({ waktu: lokasi.waktu, keluar: true });
            }
          } else if (jarakMeter > dataGeolocation.radius) {
            absen.geolocation.push({ waktu: lokasi.waktu, keluar: true });
          }
        }
      }

      // console.log(absen.geolocation);

      return {
        no: i + 1,
        tanggal: absen.tanggal,
        waktuDatang:
          absen.status == "izin"
            ? "Izin"
            : absen.status == "cuti"
            ? "Cuti"
            : absen.waktuDatang,
        waktuPulang:
          absen.status == "izin"
            ? "Izin"
            : absen.status == "cuti"
            ? "Cuti"
            : absen.waktuPulang,
        geolocation: absen.geolocation,
      };
    });

    if (historiList.length > 0) {
      if (dataTable.some((his) => his.geolocation)) {
        let dataTableGeolocation = [];

        for (const data of dataTable) {
          dataTableGeolocation.push(data);
          if (data.geolocation == undefined) continue;

          const dataLokasi = [];
          for (const [index, geolocation] of data.geolocation.entries()) {
            if (index == 0 || index % 2 == 0) {
              dataLokasi.push({
                no: "",
                tanggal: "",
                waktuDatang: geolocation.waktu,
                waktuPulang: null,
              });
            } else {
              dataLokasi[dataLokasi.length - 1].waktuPulang = geolocation.waktu;
            }
          }

          dataTableGeolocation = [...dataTableGeolocation, ...dataLokasi];
        }

        table.addBody(dataTableGeolocation);
      } else {
        table.addBody(dataTable);
      }

      createTTD(doc);
    } else {
      doc.moveDown(3);
      doc.x = 0;
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

  doc.font("Helvetica-Bold").fontSize(20).text("ABSENSI KARYAWAN", 192, 20);

  doc.fontSize(14).text(`LAPORAN ABSENSI KARYAWAN`, 140, 45, {
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

function createTTD(doc) {
  const tanggal = moment().format("DD-MM-YYYY");

  doc.x = 400;

  doc.moveDown(2);
  doc.text(`Parepare, ${tanggal}`);
  doc.moveDown();
  doc.text("PIMPINAN");
  doc.moveDown(4);
  doc.text("KARWITO");
}

module.exports = router;
