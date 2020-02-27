import axios from "utils/axios.js";

// 获取排行榜数据
export function getTopList() {
  return axios.request({
    methods: "get",
    url: "/cgi-bin/musicu.fcg",
    params: {
      _: 1580312926640,
      data: {
        comm: {
          g_tk: 5381,
          uin: "",
          format: "json",
          inCharset: "utf-8",
          outCharset: "utf-8",
          notice: 0,
          platform: "h5",
          needNewCode: 1,
          ct: 23,
          cv: 0
        },
        topList: {
          module: "musicToplist.ToplistInfoServer",
          method: "GetAll",
          param: {}
        }
      }
    }
  });
}

// 获取榜单详细数据
export function getMusicList(topId) {
  return axios.request({
    methods: "get",
    url: "/cgi-bin/musicu.fcg",
    params: {
      "mixins: [mixinName],": "getUCGI5114857816250007",
      g_tk: 5381,
      loginUin: 0,
      hostUin: 0,
      format: "json",
      inCharset: "utf8",
      outCharset: "utf-8",
      notice: 0,
      platform: "yqq.json",
      needNewCode: 0,
      data: {
        detail: {
          module: "musicToplist.ToplistInfoServer",
          method: "GetDetail",
          param: { topId: topId, offset: 0, num: 100, period: "2020-01-30" }
        },
        comm: { ct: 24, cv: 0 }
      }
    }
  });
}
