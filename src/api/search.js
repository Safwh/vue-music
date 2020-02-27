import jsonp from "utils/jsonp";
import caxios from "utils/caxios.js";
import { commonParams, options } from "./config";

export function getHotKey() {
  const url = "https://c.y.qq.com/splcloud/fcgi-bin/gethotkey.fcg";

  const data = Object.assign({}, commonParams, {
    uin: 0,
    needNewCode: 1,
    platform: "h5"
  });

  return jsonp(url, data, options);
}

/**
 *  关键字查询
 * @param {keyword} query 关键字
 * @param {int} page 页码
 * @param {Boolean} zhida 是否查询歌手
 * @param {int} perpage 每页显示文章数
 */
export function search(query, page, zhida, perpage) {
  return caxios.request({
    methods: "GET",
    url: "/soso/fcgi-bin/search_for_qq_cp",
    params: {
      _: 1580581016586,
      g_tk: 5381,
      uin: "",
      format: "json",
      inCharset: "utf-8",
      outCharset: "utf-8",
      notice: 0,
      platform: "h5",
      needNewCode: 1,
      w: query,
      zhidaqu: 1,
      catZhida: zhida ? 1 : 0,
      t: 0,
      flag: 1,
      ie: "utf-8",
      sem: 1,
      aggr: 0,
      perpage,
      n: perpage,
      p: page,
      remoteplace: "txt.mqq.all"
    }
  });
}
