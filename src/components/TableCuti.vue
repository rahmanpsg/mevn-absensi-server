<template>
  <v-col>
    <v-data-table
      :headers="headers"
      :items="items"
      :item-key="itemKey"
      :search="search"
      :loading="loading"
      loading-text="Loading data..."
      :sort-by="sortBy"
    >
      <template v-slot:[`item.index`]="{ index }">
        {{ index + 1 }}
      </template>

      <template v-slot:[`item.nama`]="{ item }">
        <v-row align="center" class="spacer py-3" no-gutters>
          <v-col cols="12" sm="2" md="2">
            <v-avatar>
              <img
                v-if="item.user.image"
                :src="`data:image/jpeg;base64,${item.user.image}`"
              />
              <img v-else src="@/assets/user.png" />
            </v-avatar>
          </v-col>
          <v-col cols="12" class="pl-1" sm="10" md="10">
            <h4 class="caption" v-html="item.user.nama"></h4>
          </v-col>
        </v-row>
      </template>

      <template v-slot:[`item.tanggal`]="{ value }" ]>
        {{ formatTanggal(value) }}
      </template>

      <template v-slot:[`item.aksi`]="{ item, index }">
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-icon
              small
              class="mr-2"
              v-bind="attrs"
              v-on="on"
              color="success"
              @click.stop="
                $emit('aksi', { index, id: item._id, diterima: true })
              "
            >
              mdi-check-circle
            </v-icon>
          </template>
          <span>Terima</span>
        </v-tooltip>

        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-icon
              small
              v-bind="attrs"
              v-on="on"
              color="primary"
              @click.stop="
                $emit('aksi', { index, id: item._id, diterima: false })
              "
            >
              mdi-close-circle
            </v-icon>
          </template>
          <span>Tolak</span>
        </v-tooltip>
      </template>

      <template v-slot:top>
        <slot name="modal"></slot>
      </template>
    </v-data-table>
  </v-col>
</template>

<script>
import moment from "moment";
export default {
  props: {
    headers: Array,
    items: Array,
    itemKey: String,
    search: String,
    sortBy: String,
    groupBy: String,
    loading: Boolean,
    expanded: Boolean,
    btnImage: Boolean,
  },
  methods: {
    formatTanggal(tanggal) {
      moment.locale("id");
      const [hari, bulan, tahun] = tanggal.split("-");
      return moment(`${bulan}-${hari}-${tahun}`).format("DD MMMM YYYY");
    },
  },
};
</script>
