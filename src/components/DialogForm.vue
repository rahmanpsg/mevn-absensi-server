<template>
  <v-dialog
    v-model="dialog"
    persistent
    fullscreen
    hide-overlay
    transition="dialog-bottom-transition"
  >
    <v-card>
      <v-toolbar dark color="primary">
        <v-btn icon dark @click.stop="$emit('closeDialog')">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>{{ formTitle }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-col v-if="loading">
            <v-progress-circular
              indeterminate
              color="white"
            ></v-progress-circular>
          </v-col>
          <v-btn v-else dark text @click="$emit('simpan')"> Simpan </v-btn>
        </v-toolbar-items>
      </v-toolbar>

      <v-card-text>
        <slot name="form"></slot>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    dialog: Boolean,
    loading: Boolean,
    formTitle: String,
  },
};
</script>
