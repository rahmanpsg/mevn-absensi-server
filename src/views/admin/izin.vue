<template>
  <v-container>
    <v-row>
      <v-col cols="12" class="py-0">
        <h2 class="font-weight-light mb-0">Tabel Data Izin</h2>
      </v-col>
      <v-col cols="12">
        <v-card elevation="3" class="cardRadius">
          <v-card-title>
            <v-spacer></v-spacer>
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="Cari"
              single-line
              hide-details
              dense
              filled
              rounded
            ></v-text-field>
          </v-card-title>
          <table-cuti
            :headers="headers"
            :items="listIzin"
            :search="search"
            :loading="loading"
          ></table-cuti>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import TableCuti from "@/components/TableCuti.vue";
import { mapState, mapActions } from "vuex";

export default {
  components: {
    TableCuti,
  },
  data() {
    return {
      loading: true,
      search: null,
      dialog: false,
      headers: [
        {
          text: "#",
          align: "center",
          sortable: false,
          value: "index",
        },
        { text: "Nama", value: "nama" },
        { text: "Tanggal", value: "tanggal" },
        { text: "Keterangan", value: "keterangan" },
      ],
    };
  },
  async created() {
    await this.getAll();
    this.loading = false;
  },
  computed: {
    ...mapState("izinModule", {
      listIzin: "izins",
    }),
  },
  methods: {
    ...mapActions("izinModule", ["getAll"]),
  },
};
</script>

<style scoped>
.cardRadius {
  border-radius: 15px;
}
</style>
