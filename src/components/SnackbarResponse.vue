<template>
  <v-snackbar
    v-model="response.show"
    :timeout="2000"
    color="primary"
    absolute
    centered
  >
    {{ response.text }}
  </v-snackbar>
</template>

<script>
export default {
  props: {
    response: Object,
  },
};
</script>
