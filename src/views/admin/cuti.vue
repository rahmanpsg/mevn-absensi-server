<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card elevation="3" class="cardRadius">
          <v-card-title>
            <v-col cols="12" class="py-0">
              <h3 class="font-weight-light mb-0">Tabel Permintaan Cuti</h3>
            </v-col>
          </v-card-title>
          <table-cuti
            :headers="headersPermintaan"
            :items="listPermintaan"
            :loading="loading"
            @aksi="showDialogAksi"
          ></table-cuti>
        </v-card>
      </v-col>
      <v-col cols="12">
        <v-card elevation="3" class="cardRadius">
          <v-card-title>
            <v-col cols="12" class="py-0">
              <h3 class="font-weight-light mb-0">Tabel Daftar Cuti</h3>
            </v-col>
          </v-card-title>
          <table-cuti
            :headers="headersDaftar"
            :items="listDaftar"
            :loading="loading"
          ></table-cuti>
        </v-card>
      </v-col>

      <DialogCustom
        :dialog="dialogAksi"
        :title="dialogTitle"
        @event="aksiEvent"
        @closeDialog="
          dialogAksi = false;
          itemSelected = null;
        "
      />

      <SnackbarResponse :response="response" />
    </v-row>
  </v-container>
</template>

<script>
import TableCuti from "@/components/TableCuti.vue";
import DialogCustom from "@/components/DialogCustom.vue";
import SnackbarResponse from "@/components/SnackbarResponse.vue";
import { mapState, mapActions } from "vuex";

export default {
  components: {
    TableCuti,
    DialogCustom,
    SnackbarResponse,
  },
  data() {
    return {
      loading: true,
      headersPermintaan: [
        {
          text: "#",
          align: "center",
          sortable: false,
          value: "index",
        },
        { text: "Nama", value: "nama", width: 350 },
        { text: "Tanggal", value: "tanggal", align: "center" },
        { text: "Keterangan", value: "keterangan" },
        { text: "Aksi", value: "aksi" },
      ],
      headersDaftar: [
        {
          text: "#",
          align: "center",
          sortable: false,
          value: "index",
        },
        { text: "Nama", value: "nama" },
        { text: "Tanggal", value: "tanggal", align: "center" },
        { text: "Keterangan", value: "keterangan" },
      ],
      itemSelected: null,
      dialogTitle: null,
      dialogAksi: false,
      response: { show: false, text: "" },
    };
  },
  async created() {
    await this.getAll();
    this.loading = false;
  },
  computed: {
    ...mapState("cutiModule", {
      listPermintaan: "permintaanCuti",
      listDaftar: "daftarCuti",
    }),
  },
  methods: {
    ...mapActions("cutiModule", ["getAll", "setAksiPermintaan"]),
    showDialogAksi(item) {
      this.itemSelected = item;

      this.dialogTitle = `Anda yakin untuk ${
        item.diterima ? "menerima" : "menolak"
      } permintaan cuti ini?`;

      this.dialogAksi = true;
    },
    async aksiEvent() {
      const res = await this.setAksiPermintaan(this.itemSelected);
      this.response = { show: true, text: res.data.message };
      this.dialogAksi = false;
    },
    hapus() {},
  },
};
</script>

<style scoped>
.cardRadius {
  border-radius: 15px;
}
</style>
