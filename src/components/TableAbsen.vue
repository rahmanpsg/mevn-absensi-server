<template>
  <v-col>
    <v-data-table
      :headers="headers"
      :items="items"
      :items-per-page="10"
      :loading="loading"
      class="elevation-0"
    >
      <template v-slot:[`item.index`]="{ index }">
        {{ index + 1 }}
      </template>

      <template v-slot:[`item.nama`]="{ item }">
        <v-row align="center" class="spacer py-3" no-gutters>
          <v-col cols="12" sm="2" md="2">
            <v-avatar>
              <img
                v-if="item.image"
                :src="`data:image/jpeg;base64,${item.image}`"
              />
              <img v-else src="@/assets/user.png" />
            </v-avatar>
          </v-col>
          <v-col cols="12" sm="10" md="10">
            <h4 class="caption" v-html="item.nama"></h4>
          </v-col>
        </v-row>
      </template>

      <template v-slot:[`item.waktuDatang`]="{ item, value }">
        <v-chip v-if="item.izin || item.cuti" color="primary">
          <h4 class="overline" v-html="item.izin ? 'Izin : ' : 'Cuti : '"></h4>
          <h4 class="overline" v-html="item.keterangan"></h4>
        </v-chip>
        <v-chip v-else-if="value" :color="getColor(item.infoAbsenDatang)" dark>
          <h4 class="overline" v-html="value"></h4>
        </v-chip>
        <h4 v-else class="overline">-</h4>
      </template>

      <template v-slot:[`item.waktuPulang`]="{ item, value }">
        <v-chip v-if="value" :color="getColor(item.infoAbsenPulang)" dark>
          <h4 class="overline" v-html="value"></h4>
        </v-chip>
        <h4 v-else class="overline">-</h4>
      </template>
    </v-data-table>
  </v-col>
</template>

<script>
export default {
  props: {
    headers: Array,
    items: Array,
    loading: Boolean,
  },
  methods: {
    getColor(info) {
      if (info.includes("tepat")) return "success";
      else if (info.includes("cepat") || info.includes("terlambat"))
        return "warning";
    },
  },
};
</script>
