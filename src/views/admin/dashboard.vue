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
              <h3 class="font-weight-light black-grey--text">Daftar Absensi</h3>
            </v-col>
            <v-col>
              <v-data-table
                :headers="headers"
                :items="listAbsen"
                :items-per-page="10"
                :loading="loading"
                class="elevation-0"
              >
                <template v-slot:[`item.index`]="{ index }">
                  {{ index + 1 }}
                </template>

                <template v-slot:[`item.nama`]="{ item }">
                  <v-row align="center" class="spacer py-3" no-gutters>
                    <v-col cols="4" sm="2" md="1">
                      <v-avatar>
                        <img :src="`data:image/jpeg;base64,${item.image}`" />
                      </v-avatar>
                    </v-col>
                    <v-col class="hidden-xs-only pl-8" sm="5" md="3">
                      <h4 class="caption" v-html="item.nama"></h4>
                    </v-col>
                  </v-row>
                </template>

                <template v-slot:[`item.waktuDatang`]="{ item, value }">
                  <v-chip
                    v-if="value"
                    :color="getColor(item.infoAbsenDatang)"
                    dark
                  >
                    <h4 class="caption" v-html="value"></h4>
                  </v-chip>
                  <h4 v-else class="caption">-</h4>
                </template>

                <template v-slot:[`item.waktuPulang`]="{ item, value }">
                  <v-chip
                    v-if="value"
                    :color="getColor(item.infoAbsenPulang)"
                    dark
                  >
                    <h4 class="caption" v-html="value"></h4>
                  </v-chip>
                  <h4 v-else class="caption">-</h4>
                </template>
              </v-data-table>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from "axios";
import moment from "moment";
import { mapState, mapActions } from "vuex";

export default {
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
      //   { text: "Foto", value: "image" },
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
    getColor(info) {
      if (info.includes("tepat")) return "success";
      else if (info.includes("cepat") || info.includes("terlambat"))
        return "warning";
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
