import Vue from "vue";
import VueRouter from "vue-router";

const Recommend = () => import("components/recommend");
const Singer = () => import("components/singer");
const Rank = () => import("components/rank");
const Search = () => import("components/search");
const SingerDetail = () => import("components/singerDetail");
const Disc = () => import("components/disc");
const TopList = () => import("components/topList");
const User = () => import("components/user");

Vue.use(VueRouter);

const routes = [
  { path: "/", redirect: "/recommend" },
  // 主页
  {
    path: "/recommend",
    component: Recommend,
    children: [
      {
        path: ":id",
        component: Disc
      }
    ]
  },
  // 歌手页
  {
    path: "/singer",
    component: Singer,
    children: [
      {
        path: ":id",
        component: SingerDetail
      }
    ]
  },
  // 排行页
  {
    path: "/rank",
    component: Rank,
    children: [
      {
        path: ":id",
        component: TopList
      }
    ]
  },
  // 搜索页
  {
    path: "/search",
    component: Search,
    children: [
      {
        path: ":id",
        component: SingerDetail
      }
    ]
  },
  // 用户页
  {
    path: "/user",
    component: User
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

export default router;
