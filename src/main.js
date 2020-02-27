import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

// 图片懒加载
import VueLazyload from "vue-lazyload";
Vue.use(VueLazyload, {
  loading: require("common/image/default.png")
});

// 解决移动端点击300ms延迟
import FastClick from "fastclick";
if ("addEventListener" in document) {
  document.addEventListener(
    "DOMContentLoaded",
    function() {
      FastClick.attach(document.body);
    },
    false
  );
}

import "common/style/index.scss";

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
