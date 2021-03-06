<template>
  <v-container>
    <v-row>
      <v-col cols="12" class="py-0">
        <h2 class="font-weight-light mb-0">Tabel Data Karyawan</h2>
      </v-col>
      <v-col cols="12">
        <Table
          @tambah="tambah"
          @edit="edit"
          @hapus="showDialogHapus"
          :headers="headers"
          :items="items"
          itemKey="nik"
          sortBy="nik"
          :loading="loading"
          :dialogDelete="dialogDelete"
        >
          <template v-slot:modal>
            <DialogForm
              :dialog="dialog"
              :loading="dialogLoading"
              :formTitle="formTitle"
              @closeDialog="closeDialog"
              @simpan="simpan"
            >
              <template v-slot:form>
                <v-form ref="form" v-model="valid" lazy-validation>
                  <v-row>
                    <v-col cols="12" sm="6" md="6">
                      <v-text-field
                        v-model="editedItem.nik"
                        type="number"
                        label="NIK*"
                        :rules="nikRules"
                        required
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="6">
                      <v-text-field
                        v-model="editedItem.nama"
                        label="Nama*"
                        :rules="[(v) => !!v || 'Nama tidak boleh kosong']"
                        required
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="6">
                      <v-text-field
                        v-model="editedItem.username"
                        label="Username*"
                        :rules="usernameRules"
                        required
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="6">
                      <v-text-field
                        v-model="editedItem.password"
                        type="password"
                        label="Password*"
                        :rules="[(v) => !!v || 'Password tidak boleh kosong']"
                        required
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="2" md="2">
                      <v-btn
                        color="primary"
                        :disabled="editedItem.image != undefined"
                        @click="$refs.uploader.click()"
                      >
                        Tambah Image
                        <v-icon right> mdi-plus </v-icon>
                      </v-btn>
                      <input
                        ref="uploader"
                        class="d-none"
                        type="file"
                        accept="image/*"
                        multiple
                        @change="onFileChanged"
                      />
                    </v-col>
                  </v-row>

                  <v-row
                    justify="space-around"
                    v-if="editedItem.image != undefined"
                  >
                    <v-col cols="4">
                      <div class="title mb-1">
                        <v-btn
                          small
                          color="error"
                          @click="editedItem.image = undefined"
                        >
                          Hapus
                          <v-icon right> mdi-delete </v-icon>
                        </v-btn>
                      </div>
                      <v-img :src="imageSrc" aspect-ratio="1.1"></v-img>
                    </v-col>
                  </v-row>
                </v-form>
              </template>
            </DialogForm>

            <DialogCustom
              :dialog="dialogDelete"
              title="Anda yakin untuk menghapus data ini?"
              @event="hapus"
              @closeDialog="closeDialog"
            />
          </template>
        </Table>

        <SnackbarResponse :response="response" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Table from "@/components/Table.vue";
import DialogForm from "@/components/DialogForm.vue";
import DialogCustom from "@/components/DialogCustom.vue";
import SnackbarResponse from "@/components/SnackbarResponse.vue";
import { mapState, mapActions } from "vuex";

import KaryawanModel from "../../models/karyawan";

export default {
  components: {
    Table,
    DialogForm,
    DialogCustom,
    SnackbarResponse,
  },
  data() {
    return {
      loading: true,
      headers: [
        {
          text: "#",
          align: "start",
          sortable: false,
          value: "index",
        },
        { text: "NIK", value: "nik" },
        { text: "Nama", value: "nama" },
        { text: "Username", value: "username" },
        { text: "Aksi", value: "aksi", sortable: false },
      ],
      dialog: false,
      dialogLoading: false,
      dialogDelete: false,
      editedIndex: -1,
      editedItem: new KaryawanModel({}),
      valid: true,
      response: { show: false, text: "" },
      alertImage: false,
    };
  },
  async created() {
    if (!this.items.length) await this.getAll();
    this.loading = false;
  },
  computed: {
    ...mapState("karyawanModule", {
      items: "karyawans",
    }),
    formTitle() {
      return this.editedIndex === -1
        ? "Tambah Data Karyawan"
        : "Edit Data Karyawan";
    },
    nikRules() {
      return [
        (v) => !!v || "NIK tidak boleh kosong",
        (v) => {
          return (
            (this.editedIndex != -1 && this.items[this.editedIndex].nik == v) ||
            !this.items.find((item) => item.nik == v) ||
            "NIK telah digunakan"
          );
        },
      ];
    },
    usernameRules() {
      return [
        (v) => !!v || "Username tidak boleh kosong",
        (v) => (v && v.length >= 6) || "Username minimal 6 karakter",
        (v) => {
          return (
            (this.editedIndex != -1 &&
              this.items[this.editedIndex].username == v) ||
            !this.items.find((item) => item.username == v) ||
            "Username telah digunakan"
          );
        },
      ];
    },
    imageSrc() {
      if (
        this.editedItem.image.startsWith("https://") ||
        this.editedItem.image.startsWith("http://")
      ) {
        return this.editedItem.image;
      }

      return `data:image/jpeg;base64,${this.editedItem.image}`;
    },
  },
  methods: {
    ...mapActions("karyawanModule", [
      "getAll",
      "addKaryawan",
      "editKaryawan",
      "deleteKaryawan",
    ]),
    onFileChanged(e) {
      for (const image of e.target.files) {
        this.createBase64(image);
      }
    },
    createBase64(file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        this.editedItem.image = e.target.result.split(",").pop();
      };

      reader.readAsDataURL(file);
    },
    tambah() {
      this.editedItem = new KaryawanModel({});

      this.dialog = true;

      this.$nextTick(() => {
        this.$refs.form.reset();
      });
    },
    edit(item) {
      this.editedIndex = this.items.indexOf(item);
      this.editedItem = new KaryawanModel(item);

      this.dialog = true;
    },
    showDialogHapus(item) {
      this.editedIndex = this.items.indexOf(item);
      this.editedItem = new KaryawanModel(item);

      this.dialogDelete = true;
    },
    async hapus() {
      const res = await this.deleteKaryawan({
        index: this.editedIndex,
        id: this.editedItem._id,
      });

      this.response = { show: true, text: res.data.message };

      this.closeDialog();
    },
    async simpan() {
      await this.$refs.form.validate();

      if (!this.valid) return;

      this.dialogLoading = true;

      let res;
      if (this.editedIndex > -1) {
        res = await this.editKaryawan({
          index: this.editedIndex,
          karyawan: this.editedItem,
        });
      } else {
        res = await this.addKaryawan(this.editedItem);
      }

      this.response = { show: true, text: res.data.message };

      this.closeDialog();
    },
    closeDialog() {
      this.dialog = false;
      this.dialogLoading = false;
      this.dialogDelete = false;

      this.$nextTick(() => {
        this.editedItem = new KaryawanModel({});
        this.editedIndex = -1;
      });
    },
  },
};
</script>
