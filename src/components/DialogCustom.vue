<template>
  <v-dialog v-model="dialog" max-width="500px" persistent>
    <v-card>
      <v-card-title>
        <v-spacer></v-spacer>
        <v-icon x-large color="primary">mdi-alert</v-icon>
        <v-spacer></v-spacer>
      </v-card-title>
      <v-card-text class="headline">
        {{ title }}
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="success darken-1"
          outlined
          text
          @click="$emit('closeDialog')"
        >
          Cancel
        </v-btn>
        <v-btn color="primary darken-1" outlined text @click="$emit('event')">
          OK
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    dialog: Boolean,
    title: String,
  },
};
</script>
