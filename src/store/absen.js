import axios from "axios";

export default {
  namespaced: true,
  state: () => ({
    absens: [],
    karyawans: [],
  }),
  mutations: {
    setAbsens(state, absens) {
      state.absens = absens;
    },
    resetAbsens(state) {
      state.absens = [];
    },
    setKaryawans(state, karyawans) {
      state.karyawans = karyawans;
    },
  },
  actions: {
    resetAbsens({ commit }) {
      commit("resetAbsens");
    },
    async getAll({ commit }) {
      try {
        const { data } = await axios.get(`absen`);
        commit("setAbsens", data);
      } catch (error) {
        return error.response;
      }
    },
    async getAllByKaryawan({ commit }, { _id, bulan, tahun }) {
      try {
        const { data } = await axios.get(
          `absen/${_id}?bulan=${bulan}&tahun=${tahun}`
        );
        commit("setAbsens", data.historiList);
      } catch (error) {
        console.log(error);
        return error.response;
      }
    },
    async getAllKaryawan({ commit }) {
      try {
        const { data } = await axios.get(`user?select=nama nik image`);
        commit("setKaryawans", data);
      } catch (error) {
        console.log(error);
        return error.response;
      }
    },
  },
};
