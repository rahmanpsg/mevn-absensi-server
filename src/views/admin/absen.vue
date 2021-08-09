<template>
  <v-container>
    <v-row>
      <v-col cols="12" class="py-0">
        <h1 class="font-weight-light mb-0">Tabel Data Absen</h1>
      </v-col>
      <v-col cols="12">
        <v-card elevation="3" class="cardRadius">
          <v-card-title>
            <v-col cols="12" sm="4" md="4">
              <v-autocomplete
                v-model="selectedKaryawan"
                :items="listKaryawan"
                item-text="nama"
                item-value="_id"
                placeholder="Pilih Karyawan"
                @change="changeSelected('karyawan')"
              >
                <template v-slot:item="{ item }">
                  <v-list-item-avatar
                    color="indigo"
                    class="text-h5 font-weight-light white--text"
                  >
                    <img :src="`data:image/jpeg;base64,${item.image}`" />
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title v-text="item.nama"></v-list-item-title>
                    <v-list-item-subtitle
                      v-text="item.nik"
                    ></v-list-item-subtitle>
                  </v-list-item-content>
                </template>
              </v-autocomplete>
            </v-col>
            <v-col cols="6" sm="3" md="3">
              <v-autocomplete
                v-model="selectedBulan"
                :items="listBulan"
                placeholder="Pilih Bulan"
                @change="changeSelected('bulan')"
              >
              </v-autocomplete>
            </v-col>
            <v-col cols="6" sm="3" md="3">
              <v-autocomplete
                v-model="selectedTahun"
                :items="listTahun"
                placeholder="Pilih Tahun"
                @change="changeSelected('tahun')"
              >
              </v-autocomplete>
            </v-col>
            <v-col cols="12" sm="2" md="2" class="d-flex flex-row-reverse">
              <v-btn
                outlined
                color="primary"
                :disabled="!listAbsen.length"
                @click="dialog = !dialog"
              >
                <v-icon left> mdi-printer </v-icon> Cetak
              </v-btn>
            </v-col>
          </v-card-title>
          <table-absen
            :headers="headers"
            :items="listAbsen"
            :loading="loading"
          ></table-absen>
        </v-card>
      </v-col>
      <dialog-cetak
        :id="selectedKaryawan"
        :bulan="selectedBulan"
        :tahun="selectedTahun"
        :dialog="dialog"
        @closeDialog="dialog = false"
      />
    </v-row>
  </v-container>
</template>

<script>
import moment from "moment";
import TableAbsen from "@/components/TableAbsen.vue";
import DialogCetak from "@/components/DialogCetak.vue";
import { mapState, mapActions } from "vuex";

export default {
  components: {
    TableAbsen,
    DialogCetak,
  },
  data() {
    DialogCetak;
    return {
      loading: true,
      selectedKaryawan: null,
      selectedBulan: null,
      selectedTahun: null,
      dialog: false,
      headers: [
        {
          text: "#",
          align: "center",
          sortable: false,
          value: "index",
        },
        { text: "Tanggal", value: "tanggal" },
        {
          text: "Jam Datang",
          value: "waktuDatang",
          align: "center",
        },
        { text: "Jam Pulang", value: "waktuPulang", align: "center" },
      ],
      listBulan: [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember",
      ],
    };
  },
  async created() {
    await this.resetAbsens();
    await this.getAllKaryawan();
    this.loading = false;
  },
  computed: {
    ...mapState("absenModule", {
      listAbsen: "absens",
      listKaryawan: "karyawans",
    }),
    listTahun() {
      const tahun = moment().format("YYYY");

      const list = [];

      for (let i = 0; i < 3; i++) {
        list.push(tahun - i);
      }

      return list;
    },
  },
  methods: {
    ...mapActions("absenModule", [
      "getAllByKaryawan",
      "getAllKaryawan",
      "resetAbsens",
    ]),
    async changeSelected(tipe) {
      if (tipe == "karyawan") {
        if (this.selectedBulan == null || this.selectedTahun == null) return;
      } else if (tipe == "bulan") {
        if (this.selectedKaryawan == null || this.selectedTahun == null) return;
      } else if (tipe == "tahun") {
        if (this.selectedKaryawan == null || this.selectedBulan == null) return;
      }

      this.loading = true;
      await this.getAllByKaryawan({
        _id: this.selectedKaryawan,
        bulan: this.selectedBulan,
        tahun: this.selectedTahun,
      });
      this.loading = false;
    },
  },
};
</script>

<style scoped>
.cardRadius {
  border-radius: 15px;
}
</style>
