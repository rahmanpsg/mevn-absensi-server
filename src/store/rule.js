import axios from "axios";

export default {
  namespaced: true,
  state: () => ({
    rules: [],
  }),
  mutations: {
    setRules(state, rules) {
      state.rules = rules;
    },
  },
  actions: {
    async getAll({ commit }) {
      try {
        const { data } = await axios.get(`rule?all=true`);
        commit("setRules", data);
      } catch (error) {
        return error.response;
      }
    },
    async saveRule({ state }, { index, rule }) {
      try {
        const res = await axios.post("rule", rule);

        if (res.status == 200) Object.assign(state.rules[index], rule);
        return res;
      } catch (error) {
        return error.response;
      }
    },
  },
};
