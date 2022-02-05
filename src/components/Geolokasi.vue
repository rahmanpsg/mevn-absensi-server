<template>
  <v-col class="mx-5">
    <v-row align="center">
      <v-col cols="12" sm="7" md="7">
        <gmap-autocomplete
          placeholder="Cari lokasi"
          class="inputSearch"
          @place_changed="setPlace"
        />
      </v-col>
      <v-col cols="6" sm="1" md="1"> Radius : </v-col>
      <v-col cols="6" sm="2" md="2" class="mt-4">
        <v-slider
          :hint="`${radius} m`"
          max="1000"
          min="0"
          persistent-hint
          :value="radius"
          @change="setRadius"
        ></v-slider>
      </v-col>
      <v-col cols="12" sm="2" md="2" class="d-flex flex-row-reverse">
        <v-btn rounded outlined color="primary" @click="saveClick">
          Simpan
        </v-btn>
      </v-col>
      <v-col cols="12" class="mt-n4">
        <gmap-map
          :center="center"
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
          style="width: auto; height: 450px"
        >
          <gmap-info-window
            :options="infoOptions"
            :position="center"
            :opened="infoWinOpen"
            @closeclick="infoWinOpen = false"
          >
          </gmap-info-window>

          <gmap-marker
            @dragstart="infoWinOpen = false"
            @dragend="dragMarker"
            :position="center"
            :clickable="true"
            :draggable="true"
          />

          <gmap-circle
            :center="center"
            :radius="radius"
            :options="circleOptions"
          />

          <div slot="visible">
            <div
              style="
                padding: 2px 5px;
                top: 0;
                left: 0;
                background-color: #fbaccc;
                color: white;
                position: absolute;
                z-index: 1;
              "
            >
              {{ infoContent }}
            </div>
          </div>
        </gmap-map>
      </v-col>
    </v-row>
  </v-col>
</template>

<script src="vue-google-maps.js"></script>

<script>
import { mapState, mapActions } from "vuex";

export default {
  data() {
    return {
      circleOptions: {
        strokeColor: "#F875AA",
        strokeWeight: 2,
        fillColor: "#fbaccc",
      },
      infoContent: "Silahkan geser marker ke lokasi kantor",
      infoWinOpen: true,
    };
  },
  async created() {
    if (this.radius == 0) await this.getData();
  },
  computed: {
    ...mapState("geolokasiModule", [
      "latitude",
      "longitude",
      "alamat",
      "radius",
    ]),
    center() {
      return { lat: this.latitude, lng: this.longitude };
    },
    infoOptions() {
      return {
        content: `<table>
                    ${
                      this.alamat
                        ? "<thead class='overline'><tr><th colspan='2'>" +
                          this.alamat +
                          `</th></tr></thead>`
                        : ``
                    }
                    <tbody class='caption'>
                      <tr>
                        <td width='70px'>Latitude</td>
                        <td> : ${this.latitude}</td>
                      </tr>
                      <tr>
                        <td>Longitude</td>
                        <td>: ${this.longitude}</td>
                      </tr>
                    </tbody>
                  </table>`,
        pixelOffset: {
          width: 0,
          height: -35,
        },
      };
    },
  },
  methods: {
    ...mapActions("geolokasiModule", [
      "setPosition",
      "setRadius",
      "getData",
      "saveData",
    ]),
    async getPlaceName(location) {
      const geocoder = new google.maps.Geocoder();
      const res = await geocoder.geocode({ location });
      return res.results[0].formatted_address;
    },
    async setPlace(place) {
      const position = place.geometry.location.toJSON();
      const alamat = await this.getPlaceName(position);
      this.setPosition({ ...position, alamat });
    },
    async dragMarker(PointerEvent) {
      const position = PointerEvent.latLng.toJSON();
      const alamat = await this.getPlaceName(position);
      this.setPosition({ ...position, alamat });
      this.infoWinOpen = true;
    },
    async saveClick() {
      const res = await this.saveData();

      this.$emit("setResponse", { show: true, text: res.data.message });
    },
  },
};
</script>

<style scoped>
.inputSearch {
  width: 80%;
  padding: 0.25em 1em;
  border: 1px solid grey;
  border-radius: 7px;
  background-color: #fff;
}
</style>
