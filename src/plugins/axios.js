import Vue from "vue";
import axios from "axios";
import VueAxios from "vue-axios";
import store from "@/store";

if (process.env.NODE_ENV == "development")
  axios.defaults.baseURL = `http://localhost:4000/`;

axios.defaults.headers["x-access-token"] = store.state.userModule.token;

Vue.use(VueAxios, axios);

export default new VueAxios();
