<template>
  <v-card elevation="2" class="cardRadius">
    <v-card-title>
      <v-btn rounded color="primary" @click.stop="$emit('tambah')">
        <v-icon left> mdi-plus-circle </v-icon>
        Tambah Data
      </v-btn>
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
    <v-data-table
      :headers="headers"
      :items="items"
      :item-key="itemKey"
      :items-per-page="10"
      :search="search"
      :loading="loading"
      :group-by="groupBy"
      :show-group-by="groupBy != null"
      loading-text="Loading data..."
      :show-expand="expanded"
      :single-expand="true"
      :sort-by="sortBy"
      :getNamaPenguji="getNamaPenguji"
    >
      <template v-slot:[`item.index`]="{ index }">
        {{ index + 1 }}
      </template>

      <template v-slot:[`item.aksi`]="{ item }">
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-icon
              small
              class="mr-2"
              v-bind="attrs"
              v-on="on"
              color="success"
              @click.stop="$emit('edit', item)"
            >
              mdi-pencil
            </v-icon>
          </template>
          <span>Edit Data</span>
        </v-tooltip>

        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-icon
              small
              v-bind="attrs"
              v-on="on"
              color="primary"
              @click.stop="$emit('hapus', item)"
            >
              mdi-delete
            </v-icon>
          </template>
          <span>Hapus Data</span>
        </v-tooltip>
      </template>

      <template v-slot:expanded-item="{ headers, item }">
        <td :colspan="headers.length" class="py-4">
          <v-row>
            <v-col cols="12" v-for="(jawaban, i) in item.jawaban" :key="i">
              <v-row>
                <v-col
                  cols="1"
                  class="text-md-body-1 font-weight-bold text-uppercase"
                  v-text="i"
                ></v-col>
                <v-col cols="1">:</v-col>
                <v-col cols="10">{{ jawaban }}</v-col>
              </v-row>
            </v-col>
          </v-row>
        </td>
      </template>

      <template v-slot:top>
        <slot name="modal"></slot>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
export default {
  props: {
    headers: Array,
    items: Array,
    itemKey: String,
    sortBy: String,
    groupBy: String,
    loading: Boolean,
    expanded: Boolean,
    btnImage: Boolean,
    getNamaPenguji: Function,
    getNamaMatakuliah: Function,
  },
  data: () => ({
    search: "",
  }),
};
</script>

<style scoped>
.cardRadius {
  border-radius: 15px;
}
</style>
