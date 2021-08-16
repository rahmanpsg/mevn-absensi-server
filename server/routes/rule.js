const express = require("express");
const ruleModel = require("../models/rule");
const router = express.Router();
const auth = require("../middleware/auth");

// get absen rule
router.get("/", auth, async (req, res) => {
  const all = req.query.all;

  if (all != null) {
    const data = await ruleModel.find().sort("hari");

    return res.send(data);
  }

  const data = await ruleModel.findOne({
    hari: new Date().getDay(),
  });

  res.send(data);
});

router.post("/", auth, async (req, res) => {
  const { hari, jamDatang, jamPulang, lembur, libur } = req.body;

  //   periksa jika telah melakukan rule hari telah ada
  const cek = await ruleModel.findOne({ hari }).countDocuments();

  // jika telah ada, maka perbarui data
  if (cek > 0) {
    const newData = { hari, jamDatang, jamPulang, lembur, libur };

    ruleModel.findOneAndUpdate({ hari }, newData, { new: false }, (err) => {
      if (err) return res.status(500).send({ message: err });

      return res.status(200).send({
        message: "Rule berhasil diubah",
      });
    });
  } else {
    const rules = new ruleModel({
      hari,
      jamDatang,
      jamPulang,
      lembur,
      libur,
    });

    // save jika rule hari belum ada
    rules.save((err, doc) => {
      if (err) return res.status(500).send({ message: err });

      res.status(200).send({
        message: "Rule berhasil disimpan",
        id: doc._id,
      });
    });
  }
});

module.exports = router;
