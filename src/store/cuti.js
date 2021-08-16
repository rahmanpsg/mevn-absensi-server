import axios from "axios";

export default {
  namespaced: true,
  state: () => ({
    permintaanCuti: [],
    daftarCuti: [],
  }),
  mutations: {
    setPermintaan(state, permintaanCuti) {
      state.permintaanCuti = permintaanCuti;
    },
    setDaftar(state, daftarCuti) {
      state.daftarCuti = daftarCuti;
    },
  },
  actions: {
    async getAll({ commit }) {
      try {
        const { data: permintaan } = await axios.get(`cuti?permintaan=true`);
        const { data: daftar } = await axios.get(`cuti`);
        commit("setPermintaan", permintaan);
        commit("setDaftar", daftar);
      } catch (error) {
        return error.response;
      }
    },
    async setAksiPermintaan({ commit, state }, { index, id, diterima }) {
      try {
        const res = await axios.put("cuti", { _id: id, diterima });

        if (res.status == 200) {
          if (diterima)
            commit("setDaftar", [
              state.permintaanCuti[index],
              ...state.daftarCuti,
            ]);

          state.permintaanCuti.splice(index, 1);
        }

        return res;
      } catch (error) {
        return error.response;
      }
    },
  },
};
