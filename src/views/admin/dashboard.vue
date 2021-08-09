<template>
  <v-container>
    <v-row>
      <v-col cols="12" sm="4" md="4" class="pb-2">
        <v-card class="cardRadius">
          <v-row class="no-gutters">
            <div class="col-auto">
              <div class="secondary fill-height d-flex pa-5">
                <v-icon size="35" color="white"> mdi-account-group </v-icon>
              </div>
            </div>
            <div class="col pa-3 py-4 secondary--text">
              <h5 class="text-truncate text-uppercase">Total Karyawan</h5>
              <h1>{{ totalKaryawan }}</h1>
            </div>
          </v-row>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4" md="4" class="pb-2">
        <v-card class="cardRadius">
          <v-row class="no-gutters">
            <div class="col-auto">
              <div class="success fill-height d-flex pa-5">
                <v-icon size="35" color="white">
                  mdi-checkbox-multiple-marked-circle
                </v-icon>
              </div>
            </div>
            <div class="col pa-3 py-4 success--text">
              <h5 class="text-truncate text-uppercase">Telah Absen</h5>
              <h1>{{ telahAbsen }}</h1>
            </div>
          </v-row>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4" md="4" class="pb-2">
        <v-card class="cardRadius">
          <v-row class="no-gutters">
            <div class="col-auto">
              <div class="warning fill-height d-flex pa-5">
                <v-icon size="35" color="white">
                  mdi-close-circle-multiple
                </v-icon>
              </div>
            </div>
            <div class="col pa-3 py-4 warning--text">
              <h5 class="text-truncate text-uppercase">Belum Absen</h5>
              <h1>{{ belumAbsen }}</h1>
            </div>
          </v-row>
        </v-card>
      </v-col>
      <v-col cols="12">
        <v-row class="no-gutters">
          <v-icon color="grey"> mdi-calendar </v-icon>
          <h4 class="overline blue-grey--text text--lighten-1">
            {{ tanggal }}
          </h4>
        </v-row>
      </v-col>
      <v-col cols="12">
        <v-card elevation="3" class="cardRadius">
          <v-row>
            <v-col cols="12" class="mx-5 my-2">
              <h3 class="font-weight-light black-grey--text">
                Daftar Absensi Hari Ini
              </h3>
            </v-col>
            <table-absen
              :headers="headers"
              :items="listAbsen"
              :loading="loading"
            ></table-absen>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from "axios";
import moment from "moment";
import TableAbsen from "@/components/TableAbsen.vue";
import { mapState, mapActions } from "vuex";

export default {
  components: {
    TableAbsen,
  },
  data: () => ({
    totalKaryawan: 0,
    telahAbsen: 0,
    belumAbsen: 0,
    loading: true,
    headers: [
      {
        text: "#",
        align: "center",
        sortable: false,
        value: "index",
      },
      { text: "Nama", value: "nama" },
      {
        text: "Jam Datang",
        value: "waktuDatang",
        align: "center",
      },
      { text: "Jam Pulang", value: "waktuPulang", align: "center" },
    ],
  }),
  async created() {
    this.loadData();
    await this.getAll();
    this.loading = false;
  },
  computed: {
    ...mapState("absenModule", { listAbsen: "absens" }),
    tanggal() {
      moment.locale("id");
      return moment().format("DD MMMM YYYY");
    },
  },
  methods: {
    ...mapActions("absenModule", ["getAll"]),
    async loadData() {
      const res = await axios("total");

      const { totalKaryawan, telahAbsen, belumAbsen } = res.data;

      this.totalKaryawan = totalKaryawan;
      this.telahAbsen = telahAbsen;
      this.belumAbsen = belumAbsen;
    },
  },
};
</script>

<style scoped>
.cardRadius {
  border-radius: 15px;
}

.cardRadius .fill-height {
  border-radius: 15px 0 0 15px;
}
</style>
