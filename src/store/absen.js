import axios from "axios";

export default {
  namespaced: true,
  state: () => ({
    absens: [],
    absensKaryawan: [],
    karyawans: [],
  }),
  mutations: {
    setAbsens(state, absens) {
      state.absens = absens;
    },
    setAbsensKaryawan(state, absensKaryawan) {
      state.absensKaryawan = absensKaryawan;
    },
    resetAbsensKaryawan(state) {
      state.absensKaryawan = [];
    },
    setKaryawans(state, karyawans) {
      state.karyawans = karyawans;
    },
  },
  actions: {
    resetAbsensKaryawan({ commit }) {
      commit("resetAbsensKaryawan");
    },
    async getAll({ commit }, { lokasi }) {
      try {
        const { data } = await axios.get(
          `absen?select=${lokasi == false ? "-lokasi" : ""}`
        );
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
        commit("setAbsensKaryawan", data.historiList);
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
