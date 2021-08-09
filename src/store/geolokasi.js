import axios from "axios";

export default {
  namespaced: true,
  state: () => ({
    latitude: -4.0127511,
    longitude: 119.620638,
    radius: 0,
  }),
  mutations: {
    setData: (state, data) => {
      try {
        state.latitude = data.latitude;
        state.longitude = data.longitude;
        state.radius = data.radius;
      } catch (error) {
        console.log(error);
      }
    },
    setPosition: (state, data) => {
      try {
        state.latitude = data.lat;
        state.longitude = data.lng;
      } catch (error) {
        console.log(error);
      }
    },
    setRadius: (state, radius) => {
      try {
        state.radius = radius;
      } catch (error) {
        console.log(error);
      }
    },
  },
  actions: {
    setPosition({ commit }, data) {
      try {
        console.log(data);
        commit("setPosition", data);
      } catch (error) {
        console.log(error);
      }
    },
    setRadius({ commit }, radius) {
      try {
        commit("setRadius", radius);
      } catch (error) {
        console.log(error);
      }
    },
    async getData({ commit, rootState }) {
      try {
        const { data } = await axios.get(`geolocation`, {
          headers: { "x-access-token": rootState.userModule.token },
        });

        commit("setData", data);
      } catch (error) {
        console.log(error);
        return error.response;
      }
    },
    async saveData({ state, rootState }) {
      try {
        const res = await axios.post(`geolocation`, state, {
          headers: { "x-access-token": rootState.userModule.token },
        });

        return res;
      } catch (error) {
        console.log(error);
        return error.response;
      }
    },
  },
};
