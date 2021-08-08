<template>
  <v-container>
    <v-row align="center" class="spacer py-3" no-gutters>
      <v-col cols="12">
        <v-card elevation="3" class="cardRadius px-2">
          <v-row align="center">
            <v-col cols="12" sm="12" md="12" class="mx-5 my-2 mb-md-n16 mb-n10">
              <h3 class="font-weight-light black-grey--text overline">
                Pengaturan Absensi
              </h3>
            </v-col>
            <v-col cols="12" sm="2" md="2"></v-col>
            <v-col cols="6" sm="2" md="2" class="ma-auto">
              <vue-timepicker
                ref="jamDatang"
                v-model="editedItem.jamDatang"
                :hour-range="[[6, 18]]"
                hide-disabled-hours
              ></vue-timepicker>
            </v-col>
            <v-col cols="6" sm="2" md="2" class="ma-auto">
              <vue-timepicker
                ref="jamPulang"
                v-model="editedItem.jamPulang"
                :hour-range="[[6, 18]]"
                hide-disabled-hours
              ></vue-timepicker>
            </v-col>
            <v-col cols="6" sm="4" md="4" class="ma-auto">
              <v-tooltip v-for="(item, i) in listHari" :key="i" bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-avatar
                    @click="selectHari(i)"
                    :color="selectedHari == i ? 'primary' : 'white'"
                    size="40"
                    class="elevation-3 ma-1 btnHari"
                    v-bind="attrs"
                    v-on="on"
                  >
                    <span
                      :class="
                        selectedHari == i ? 'white--text ' : 'grey--text '
                      "
                      class="text-h6"
                      >{{ item.text }}</span
                    >
                  </v-avatar>
                </template>
                <span>{{ item.longText }}</span>
              </v-tooltip>
            </v-col>
            <v-col
              cols="6"
              sm="1"
              md="1"
              class="d-flex flex-row-reverse mr-md-2"
            >
              <v-btn
                rounded
                outlined
                color="primary"
                :disabled="!canSave"
                @click="saveClick"
              >
                Simpan
              </v-btn>
            </v-col>
            <v-col cols="3"></v-col>
            <v-col class="mt-n5">
              <v-switch
                v-model="editedItem.libur"
                label="Libur"
                color="primary"
                hide-details
              ></v-switch>
            </v-col>
            <v-col class="mt-n5">
              <v-switch
                v-model="editedItem.lembur"
                label="Lembur"
                color="primary"
                hide-details
              ></v-switch>
            </v-col>
            <v-col cols="6"></v-col>
          </v-row>
        </v-card>
      </v-col>
      <v-col cols="12" class="py-15">
        <v-card elevation="3" class="cardRadius">
          <v-row>
            <v-col cols="12" class="mx-5 my-2">
              <h3 class="font-weight-light black-grey--text overline">
                Pengaturan Geolokasi
              </h3>
            </v-col>
            <geolokasi />
          </v-row>
        </v-card>
      </v-col>
    </v-row>
    <SnackbarResponse :response="response" />
  </v-container>
</template>

<script>
import VueTimepicker from "vue2-timepicker/src/vue-timepicker.vue";
import Geolokasi from "@/components/Geolokasi.vue";
import SnackbarResponse from "@/components/SnackbarResponse.vue";
import { mapState, mapActions } from "vuex";

import RuleModel from "../../models/rule";

export default {
  components: {
    VueTimepicker,
    Geolokasi,
    SnackbarResponse,
  },
  data() {
    return {
      listHari: [
        { text: "M", longText: "Minggu" },
        { text: "S", longText: "Senin" },
        { text: "S", longText: "Selasa" },
        { text: "R", longText: "Rabu" },
        { text: "K", longText: "Kamis" },
        { text: "J", longText: "Jumat" },
        { text: "S", longText: "Sabtu" },
      ],
      selectedHari: "-",
      editedItem: new RuleModel({}),
      response: { show: false, text: "" },
    };
  },
  async created() {
    await this.getAll();
  },
  computed: {
    ...mapState("ruleModule", ["rules"]),
    canSave() {
      return this.selectedHari != "-" && this.editedItem.isCanSave;
    },
  },
  methods: {
    ...mapActions("ruleModule", ["getAll", "saveRule"]),
    async selectHari(hari) {
      await this.$refs.jamDatang.clearTime();
      await this.$refs.jamPulang.clearTime();
      this.selectedHari = hari;

      const item = this.rules.find((v) => v.hari == hari);

      if (item != null) {
        this.editedItem = new RuleModel(item);

        console.log(this.editedItem);
      }
    },
    async saveClick() {
      const res = await this.saveRule({
        index: this.selectedHari,
        rule: { ...this.editedItem },
      });

      this.response = { show: true, text: res.data.message };
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
