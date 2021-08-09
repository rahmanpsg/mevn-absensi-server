import axios from "axios";

export default {
  namespaced: true,
  state: () => ({
    karyawans: [],
  }),
  mutations: {
    setKaryawans(state, karyawans) {
      state.karyawans = karyawans;
    },
  },
  actions: {
    async getAll({ commit }) {
      try {
        const { data } = await axios.get(`user`);
        commit("setKaryawans", data);
      } catch (error) {
        return error.response;
      }
    },
    async addKaryawan({ commit, state }, karyawan) {
      try {
        const res = await axios.post("user", karyawan);

        if (res.status == 200) {
          karyawan._id = res.data.id;
          commit("setKaryawans", [...state.karyawans, karyawan]);
        }

        return res;
      } catch (error) {
        return error.response;
      }
    },
    async editKaryawan({ state }, { index, karyawan }) {
      try {
        const res = await axios.put("user", karyawan);

        if (res.status == 200) Object.assign(state.karyawans[index], karyawan);
        return res;
      } catch (error) {
        return error.response;
      }
    },
    async deleteKaryawan({ state }, { index, id }) {
      try {
        const res = await axios.delete(`user/${id}`);

        if (res.status == 200) state.karyawans.splice(index, 1);

        return res;
      } catch (error) {
        return error.response;
      }
    },
  },
};
