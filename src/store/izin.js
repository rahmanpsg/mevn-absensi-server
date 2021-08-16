import axios from "axios";

export default {
  namespaced: true,
  state: () => ({
    izins: [],
  }),
  mutations: {
    setIzins(state, izins) {
      state.izins = izins;
    },
  },
  actions: {
    async getAll({ commit }) {
      try {
        const { data } = await axios.get(`izin`);
        commit("setIzins", data);
      } catch (error) {
        return error.response;
      }
    },
  },
};
