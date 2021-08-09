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
          <v-col cols="4" sm="2" md="1">
            <v-avatar>
              <img :src="`data:image/jpeg;base64,${item.image}`" />
            </v-avatar>
          </v-col>
          <v-col class="hidden-xs-only pl-8" sm="5" md="3">
            <h4 class="caption" v-html="item.nama"></h4>
          </v-col>
        </v-row>
      </template>

      <template v-slot:[`item.waktuDatang`]="{ item, value }">
        <v-chip v-if="value" :color="getColor(item.infoAbsenDatang)" dark>
          <h4 class="caption" v-html="value"></h4>
        </v-chip>
        <h4 v-else class="caption">-</h4>
      </template>

      <template v-slot:[`item.waktuPulang`]="{ item, value }">
        <v-chip v-if="value" :color="getColor(item.infoAbsenPulang)" dark>
          <h4 class="caption" v-html="value"></h4>
        </v-chip>
        <h4 v-else class="caption">-</h4>
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
