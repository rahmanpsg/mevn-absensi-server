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
          hint="Radius"
          max="1000"
          min="0"
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
          <gmap-marker
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
                z-index: 100;
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
    };
  },
  async created() {
    await this.getData();
  },
  computed: {
    ...mapState("geolokasiModule", ["latitude", "longitude", "radius"]),
    center() {
      return { lat: this.latitude, lng: this.longitude };
    },
  },
  methods: {
    ...mapActions("geolokasiModule", [
      "setPosition",
      "setRadius",
      "getData",
      "saveData",
    ]),
    setPlace(place) {
      this.setPosition(place.geometry.location.toJSON());
    },
    async dragMarker(PointerEvent) {
      this.setPosition(PointerEvent.latLng.toJSON());
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
