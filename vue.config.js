const path = require("path");
function resolve(dir) {
  return path.join(__dirname, dir);
}
module.exports = {
  lintOnSave: true,
  chainWebpack: config => {
    config.resolve.alias
      .set("src", resolve("src"))
      .set("common", resolve("src/common"))
      .set("api", resolve("src/api"))
      .set("utils", resolve("src/utils"))
      .set("assets", resolve("src/assets"))
      .set("components", resolve("src/components"))
      .set("layout", resolve("src/layout"))
      .set("base", resolve("src/base"))
      .set("static", resolve("src/static"));
  },
  // webpack-dev-server 相关配置
  devServer: {
    open: false, // 编译完成是否打开网页
    host: "0.0.0.0", // 指定使用地址，默认localhost,0.0.0.0代表可以被外界访问
    port: 8080, // 访问端口
    https: false, // 编译失败时刷新页面
    hot: true, // 开启热加载
    hotOnly: false,
    // 设置代理
    proxy: {
      "/api": {
        target: "https://u.y.qq.com",
        // target: "https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg",
        secure: true, // 如果是https接口，需要配置这个参数
        changeOrigin: true, //是否跨域
        pathRewrite: {
          "^/api": ""
        }
      },
      "/capi": {
        target: "https://c.y.qq.com",
        secure: true, // 如果是https接口，需要配置这个参数
        changeOrigin: true, //是否跨域
        pathRewrite: {
          "^/capi": ""
        },
        // 突破host和origin的限制
        headers: {
          referer: "https://y.qq.com/",
          origin: "https://y.qq.com"
        }
      }
    }
  }
};
