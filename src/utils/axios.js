import _axios from "axios";

/* process.env.NODE_ENV  返回生产还是开发环境 */
const BASEURL = process.env.NODE_ENV === "production" ? "" : "/api";

// 创建axios
const axios = _axios.create({
  // `baseURL` 将自动加在 `url` 前面，除非 `url` 是一个绝对 URL。
  baseURL: BASEURL,
  timeout: 15000
});

// 添加请求拦截器
axios.interceptors.request.use(
  function(config) {
    return config;
  },
  function(error) {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

// 添加响应拦截器
axios.interceptors.response.use(
  function(response) {
    // 对响应数据做点什么
    return response;
  },
  function(error) {
    // 对响应错误做点什么
    return Promise.reject(error);
  }
);

export default axios;
