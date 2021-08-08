import axios from "axios";

export default {
  namespaced: true,
  state: () => ({
    absens: [],
  }),
  mutations: {
    setAbsens(state, absens) {
      state.absens = absens;
    },
  },
  actions: {
    async getAll({ commit }) {
      try {
        const { data } = await axios.get(`absen`);
        commit("setAbsens", data);
      } catch (error) {
        return error.response;
      }
    },
  },
};
