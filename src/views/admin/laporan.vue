<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card elevation="3" class="cardRadius">
          <v-card-title>
            <v-col cols="12" sm="4" md="4">
              <v-autocomplete
                v-model="selectedTahun"
                :items="listTahun"
                placeholder="Pilih Tahun"
                @change="changeSelected('tahun')"
                dense
                filled
                rounded
              >
              </v-autocomplete>
            </v-col>
            <v-col cols="6" sm="3" md="3">
              <v-autocomplete
                v-model="selectedBulan"
                :items="listBulan"
                placeholder="Pilih Bulan"
                @change="changeSelected('bulan')"
                dense
                filled
                rounded
              >
              </v-autocomplete>
            </v-col>
            <v-col cols="6" sm="3" md="3">
              <v-autocomplete
                v-model="selectedKaryawan"
                :items="listKaryawan"
                item-text="nama"
                item-value="_id"
                placeholder="Semua Karyawan"
                @change="changeSelected('karyawan')"
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
                      :src="`data:image/jpeg;base64,${item.image}`"
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
            <v-col
              cols="12"
              sm="2"
              md="2"
              class="d-flex flex-row-reverse mt-n6"
            >
              <v-btn
                outlined
                color="primary"
                :disabled="!cetak"
                @click="dialog = !dialog"
              >
                <v-icon left> mdi-printer </v-icon> Cetak
              </v-btn>
            </v-col>
          </v-card-title>
        </v-card>
      </v-col>
      <v-col> </v-col>
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
import DialogCetak from "@/components/DialogCetak.vue";
import { mapState, mapActions } from "vuex";

export default {
  components: {
    DialogCetak,
  },
  data() {
    return {
      loading: true,
      selectedKaryawan: null,
      selectedBulan: null,
      selectedTahun: null,
      cetak: false,
      dialog: false,
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
    await this.getAllKaryawan();
    this.loading = false;
  },
  computed: {
    ...mapState("absenModule", {
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
    ...mapActions("absenModule", ["getAllKaryawan"]),
    async changeSelected(tipe) {
      this.cetak = false;
      if (tipe == "bulan") {
        if (this.selectedTahun == null) return;
      } else if (tipe == "tahun") {
        if (this.selectedBulan == null) return;
      }

      this.cetak = true;
    },
  },
};
</script>

<style scoped>
.cardRadius {
  border-radius: 15px;
}
</style>
