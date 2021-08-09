import Vue from "vue";
import Vuex from "vuex";
import createPersistedState from "vuex-persistedstate";
import SecureLS from "secure-ls";
const ls = new SecureLS({ isCompression: false });

import userModule from "./user";
import absenModule from "./absen";
import karyawanModule from "./karyawan";
import ruleModule from "./rule";
import geolokasiModule from "./geolokasi";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    userModule,
    absenModule,
    karyawanModule,
    ruleModule,
    geolokasiModule,
  },
  plugins: [
    createPersistedState({
      paths: ["userModule"],
      storage: {
        getItem: (key) => ls.get(key),
        setItem: (key, value) => ls.set(key, value),
        removeItem: (key) => ls.remove(key),
      },
    }),
  ],
});
