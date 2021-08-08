import Vue from "vue";
import Vuetify from "vuetify/lib/framework";

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    options: {
      customProperties: true,
    },
    themes: {
      light: {
        primary: "#F875AA",
        secondary: "#FBACCC",
        accent: "#F1D1D0",
        error: "#FF5252",
        info: "#2196F3",
        success: "#73c776",
        warning: "#facc43",
      },
    },
  },
});
