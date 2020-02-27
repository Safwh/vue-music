import 'babel-polyfill'  // 用于实现浏览器并不支持的原生API的代码。
import Vue from 'vue'
import App from './App'
import router from './router'
import fastclick from 'fastclick'
import VueLazyLoad from 'vue-lazyload'
import store from './store'

// 入口文件引入公共样式
import 'common/stylus/index.styl'

// 整个PC所有body下的dom点击都不会有300毫秒的延时
fastclick.attach(document.body)

/* eslint-disable no-unused-vars */
import vConsole from 'vconsole'

// console.log('vConsole')

// 安装图片懒加载插件
Vue.use(VueLazyLoad, {
  loading: require('common/image/default.png')
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
