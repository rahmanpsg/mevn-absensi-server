import Vue from "vue";
import VueRouter from "vue-router";
import store from "@/store";

Vue.use(VueRouter);

const isLogin = (to, from, next) => {
  const { login, role } = store.state.userModule;

  if (to.name == "Login") {
    if (login) next(role);
  } else {
    if (!login) next("/");

    if (to.name != role) {
      next(role);
    }
  }

  next();
};

const routes = [
  {
    path: "/",
    name: "Login",
    component: () => import("../views/Login.vue"),
  },
  {
    path: "/admin",
    component: () => import("../views/admin/index.vue"),
    beforeEnter: isLogin,
    children: [
      {
        path: "",
        name: "Admin",
        component: () => import("../views/admin/dashboard.vue"),
      },
      {
        path: "karyawan",
        name: "karyawan",
        component: () => import("../views/admin/karyawan.vue"),
      },
      {
        path: "absen",
        name: "absen",
        component: () => import("../views/admin/absen.vue"),
      },
      {
        path: "pengaturan",
        name: "pengaturan",
        component: () => import("../views/admin/pengaturan.vue"),
      },
    ],
  },
];

const router = new VueRouter({
  // mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
