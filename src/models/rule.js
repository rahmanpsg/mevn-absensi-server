class RuleModel {
  constructor({ hari, jamDatang, jamPulang, libur, lembur }) {
    this.hari = hari;
    this.jamDatang = jamDatang || "";
    this.jamPulang = jamPulang || "";
    this.libur = libur || false;
    this.lembur = lembur || false;
  }

  get isCanSave() {
    const check = (value) => {
      const jam = value.split(":");

      if (jam.length != 2) return false;

      return jam[0] != "HH" && jam[1] != "mm";
    };

    if (this.jamDatang == "" && this.jamPulang == "") return true;
    return check(this.jamDatang) && check(this.jamPulang);
  }
}

export default RuleModel;
