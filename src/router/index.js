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
        name: "Dashboard",
        component: () => import("../views/admin/dashboard.vue"),
      },
      {
        path: "karyawan",
        name: "Data Karyawan",
        component: () => import("../views/admin/karyawan.vue"),
      },
      {
        path: "absen",
        name: "Data Absen",
        component: () => import("../views/admin/absen.vue"),
      },
      {
        path: "izin",
        name: "Data Izin",
        component: () => import("../views/admin/izin.vue"),
      },
      {
        path: "cuti",
        name: "Data Cuti",
        component: () => import("../views/admin/cuti.vue"),
      },
      {
        path: "monitoring",
        name: "Monitoring",
        component: () => import("../views/admin/monitoring.vue"),
      },
      {
        path: "laporan",
        name: "Laporan",
        component: () => import("../views/admin/laporan.vue"),
      },
      {
        path: "pengaturan",
        name: "Pengaturan",
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
