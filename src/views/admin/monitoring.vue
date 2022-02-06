<template>
  <v-container>
    <v-row align="center" no-gutters>
      <v-col cols="12">
        <v-card elevation="3" class="cardRadius">
          <v-row class="px-8">
            <v-col cols="12" class="mx-5 my-2">
              <h3 class="font-weight-light black-grey--text overline">
                Monitoring Lokasi Karyawan
              </h3>
            </v-col>
            <v-col cols="10" sm="11" md="11">
              <v-autocomplete
                v-model="selectedKaryawan"
                :items="karyawans"
                item-text="nama"
                item-value="_id"
                placeholder="Semua Karyawan"
                clearable
                dense
                filled
                rounded
              >
                <template v-slot:item="{ item }">
                  <v-list-item-avatar
                    color="indigo"
                    class="text-h5 font-weight-light white--text"
                  >
                    <img
                      v-if="item.image"
                      :src="imageSrc[karyawans.indexOf(item)]"
                    />
                    <img v-else src="@/assets/user.png" />
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
            <v-col cols="2" sm="1" md="1">
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon
                    size="37"
                    v-bind="attrs"
                    v-on="on"
                    color="accents"
                    @click.stop="loadData"
                  >
                    mdi-refresh-circle
                  </v-icon>
                </template>
                <span>Refresh Data</span>
              </v-tooltip>
            </v-col>
            <v-col v-if="loading" cols="12" class="mt-n8">
              <v-progress-linear
                color="primary accent-4"
                indeterminate
                rounded
                height="6"
              ></v-progress-linear>
            </v-col>
            <v-col cols="12" class="mt-n4">
              <gmap-map
                ref="myMap"
                :center.sync="center"
                :options="{
                  zoomControl: true,
                  mapTypeControl: false,
                  scaleControl: false,
                  streetViewControl: false,
                  rotateControl: false,
                  fullscreenControl: true,
                  disableDefaultUi: false,
                }"
                :zoom="14"
                map-type-id="hybrid"
                style="width: auto; height: 600px"
              >
                <template v-for="(karyawan, i) in dataKaryawan">
                  <gmap-info-window
                    v-if="karyawan.lokasi"
                    :key="karyawan.nama"
                    :options="infoOptions(karyawan)"
                    :position="karyawan.lokasi"
                    :opened="infoWinOpens[i]"
                    @closeclick="infoWindowsEvent(false, i)"
                  />
                  <gmap-marker
                    v-if="karyawan.lokasi"
                    :key="karyawan.id"
                    :title="karyawan.nama"
                    :position="karyawan.lokasi"
                    :clickable="true"
                    :icon="{
                      url: require('../../assets/marker.png'),
                      scaledSize: { height: 45, width: 45 },
                    }"
                    @click="infoWindowsEvent(true, i)"
                  />
                </template>

                <gmap-circle
                  :center="center"
                  :radius="radius"
                  :options="circleOptions"
                />
              </gmap-map>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
  data() {
    return {
      loading: true,
      selectedKaryawan: null,
      circleOptions: {
        strokeColor: "#F875AA",
        strokeWeight: 2,
        fillColor: "#fbaccc",
      },
      infoWinOpens: [],
      listKaryawan: [],
    };
  },
  async created() {
    let getPromise = [this.loadData()];
    if (this.radius == 0) getPromise.push(this.getData());

    await Promise.all(getPromise);

    this.loading = false;
  },
  computed: {
    ...mapState("geolokasiModule", [
      "latitude",
      "longitude",
      "alamat",
      "radius",
    ]),
    ...mapState("absenModule", { karyawans: "absens" }),
    center() {
      return { lat: this.latitude, lng: this.longitude };
    },
    dataKaryawan() {
      return this.listKaryawan
        .filter((karyawan) => karyawan.lokasi && karyawan.lokasi.length > 0)
        .map((karyawan) => {
          if (!karyawan.lokasi.length) return;
          const lokasi = karyawan.lokasi[karyawan.lokasi.length - 1];

          return {
            _id: karyawan._id,
            nama: karyawan.nama,
            lokasi: {
              lat: lokasi.latitude,
              lng: lokasi.longitude,
              waktu: lokasi.waktu,
            },
            infoWinOpen: false,
          };
        });
    },
    imageSrc() {
      return this.karyawans.map((item) => {
        if (!item.image) return;
        if (
          item.image.startsWith("https://") ||
          item.image.startsWith("http://")
        ) {
          return item.image;
        }

        return `data:image/jpeg;base64,${item.image}`;
      });
    },
  },
  watch: {
    selectedKaryawan(val) {
      if (val == null) {
        this.listKaryawan = this.karyawans;
        this.$refs.myMap.$mapPromise.then((map) => {
          map.panTo(this.center);
        });
        return;
      }

      const i = this.karyawans.findIndex((karyawan) => karyawan._id == val);

      if (!this.karyawans[i].lokasi || this.karyawans[i].lokasi.length == 0)
        return;

      this.listKaryawan = [this.karyawans[i]];

      const lokasi =
        this.karyawans[i].lokasi[this.karyawans[i].lokasi.length - 1];

      this.$refs.myMap.$mapPromise.then((map) => {
        map.panTo({ lat: lokasi.latitude, lng: lokasi.longitude });
      });
    },
  },
  methods: {
    ...mapActions("geolokasiModule", ["getData"]),
    ...mapActions("absenModule", ["getAll"]),
    async loadData() {
      await this.getAll({ lokasi: true });

      this.listKaryawan = this.karyawans;

      this.infoWinOpens = [
        ...Array.from({ length: this.listKaryawan.length }, () => false),
      ];
    },
    infoOptions(karyawan) {
      return {
        content: `<table>
                    <thead class="overline text-left">
                      <tr><th colspan="2">${karyawan.nama}</th></tr>
                    </thead>
                    <tbody class="caption">
                      <tr>
                        <td>Latitude</td>
                        <td>: ${karyawan.lokasi.lat}</td>
                      </tr>
                      <tr>
                        <td>Longitude</td>
                        <td> : ${karyawan.lokasi.lng}</td>
                      </tr>
                      <tr>
                        <td>Jam</td>
                        <td> : ${karyawan.lokasi.waktu}</td>
                      </tr>
                    </tbody>
                  </table>`,
        pixelOffset: {
          width: 0,
          height: -35,
        },
      };
    },
    infoWindowsEvent(aksi, i) {
      this.infoWinOpens.splice(i, 1, aksi);
    },
  },
};
</script>

<style scoped>
.cardRadius {
  border-radius: 15px;
}
.btnHari {
  cursor: pointer;
}
</style>
