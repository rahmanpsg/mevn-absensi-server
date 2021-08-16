<template>
  <v-app>
    <v-app-bar color="primary" dark app>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>{{ items[selectedItem].text }}</v-toolbar-title>
      <v-spacer></v-spacer>

      <v-btn icon @click="logout">
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" app>
      <v-list>
        <v-list-item link>
          <v-list-item-content>
            <v-list-item-title class="title">
              Absensi Karyawan
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <v-divider></v-divider>
      <v-list nav dense>
        <v-list-item-group active-class="primary--text text--accent-4">
          <v-list-item
            v-for="(item, i) in items"
            :key="i"
            :to="item.href"
            link
            exact
          >
            <v-list-item-icon>
              <v-icon v-text="item.icon"></v-icon>
            </v-list-item-icon>
            <v-list-item-title v-text="item.text"></v-list-item-title>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-container class="px-4 py-4">
        <transition name="fade">
          <router-view></router-view>
        </transition>
      </v-container>
    </v-main>

    <v-footer color="primary" dark>
      <v-card class="flex" color="primary" flat tile>
        <v-card-text class="py-2 white--text text-center">
          &copy; {{ new Date().getFullYear() }} —
          <strong>Aplikasi Absensi Karyawan</strong>
        </v-card-text>
      </v-card>
    </v-footer>
  </v-app>
</template>

<script>
import { mapState } from "vuex";

export default {
  data() {
    return {
      drawer: true,
      // selectedItem: 0,
      items: [
        { text: "Dashboard", href: "/admin/", icon: "mdi-home" },
        {
          text: "Data Karyawan",
          href: "/admin/karyawan",
          icon: "mdi-account-group",
        },
        {
          text: "Data Absen",
          href: "/admin/absen",
          icon: "mdi-book",
        },
        {
          text: "Data Izin",
          href: "/admin/izin",
          icon: "mdi-calendar-account",
        },
        {
          text: "Data Cuti",
          href: "/admin/cuti",
          icon: "mdi-calendar-month",
        },
        {
          text: "Laporan",
          href: "/admin/laporan",
          icon: "mdi-printer",
        },
        {
          text: "Pengaturan",
          href: "/admin/pengaturan",
          icon: "mdi-cog",
        },
      ],
    };
  },
  computed: {
    ...mapState("userModule", { nama: "nama" }),
    selectedItem() {
      return this.items.findIndex((item) => item.text == this.$route.name);
    },
  },
  methods: {
    logout() {
      this.$store.commit("userModule/isLogin", false);
      this.$router.push("/");
      localStorage.clear();
    },
  },
};
</script>

<style lang="scss" scoped>
.fade-enter-active,
.fade-leave-active {
  transition-property: opacity;
  transition-duration: 0.25s;
}

.fade-enter-active {
  transition-delay: 0.25s;
}

.fade-enter,
.fade-leave-active {
  opacity: 0;
}
</style>
