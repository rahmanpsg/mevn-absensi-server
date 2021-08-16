import Vue from "vue";
import axios from "axios";
import VueAxios from "vue-axios";
import store from "@/store";

// axios.defaults.baseURL = `http://localhost:5000/`;
// axios.defaults.baseURL = `https://192.168.8.101:5000/`
axios.defaults.headers["x-access-token"] = store.state.userModule.token;

Vue.use(VueAxios, axios);

export default new VueAxios();
