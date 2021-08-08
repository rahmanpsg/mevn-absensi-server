<template>
  <v-col class="mx-5">
    <v-row align="center">
      <v-col cols="12" sm="7" md="7">
        <GmapAutocomplete class="inputSearch" />
      </v-col>
      <v-col cols="6" sm="1" md="1"> Radius : </v-col>
      <v-col cols="6" sm="2" md="2" class="mt-4">
        <v-slider hint="Radius" max="1000" min="0"></v-slider>
      </v-col>
      <v-col cols="12" sm="2" md="2" class="d-flex flex-row-reverse">
        <v-btn rounded outlined color="primary"> Simpan </v-btn>
      </v-col>
      <v-col cols="12" class="mt-n4">
        <GmapMap
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
          map-type-id="terrain"
          style="width: auto; height: 450px"
        >
        </GmapMap>
      </v-col>
    </v-row>
  </v-col>
</template>

<script>
export default {
  data() {
    return {
      center: { lat: -4.0127511, lng: 119.620638 },
      marker: [],
      radius: 0,
    };
  },
};
</script>

<style scoped>
.inputSearch {
  padding: 0.25em 1em;
  border: 1px solid grey;
  border-radius: 7px;
  background-color: #fff;
}
</style>
