<template>
  <v-container fluid fill-height class="bg">
    <v-card
      elevation="20"
      outlined
      :loading="loading"
      class="mx-auto my-12"
      width="100%"
      max-width="500"
      v-bind:key="show"
    >
      <login-form
        v-if="show"
        v-on:setLoading="setLoading"
        v-on:setShow="setShow"
      >
      </login-form>
    </v-card>
  </v-container>
</template>

<script>
import LoginForm from "../components/LoginForm.vue";

export default {
  components: {
    LoginForm,
  },
  data: () => ({
    show: true,
    valid: true,
    loading: false,
    username: "",
    password: "",
  }),
  methods: {
    setLoading(loading) {
      this.loading = loading;
    },
    setShow(show) {
      this.show = show;
    },
  },
};
</script>

<style lang="scss" scoped>
.bg {
  background: rgb(248, 117, 169);
  background: linear-gradient(
    146deg,
    rgba(248, 117, 169, 1) 0%,
    rgba(251, 172, 204, 1) 35%,
    rgba(241, 209, 208, 1) 100%
  );
}
</style>
