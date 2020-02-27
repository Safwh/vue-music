import jsonp from "utils/jsonp.js";
import axios from "utils/axios.js";
import caxios from "utils/caxios.js";
import { commonParams, options } from "./config";

// 获取歌手列表
export function getSingerList() {
  const url = "https://c.y.qq.com/v8/fcg-bin/v8.fcg";
  const data = Object.assign({}, commonParams, {
    channel: "singer",
    page: "list",
    key: "all_all_all",
    pagesize: 100,
    pagenum: 1,
    hostUin: 0,
    needNewCode: 0,
    platform: "yqq"
  });

  return jsonp(url, data, options);
}

// 获取歌手详情
export function getSingerDetail(singerId) {
  const url = "https://c.y.qq.com/v8/fcg-bin/fcg_v8_singer_track_cp.fcg";
  const data = Object.assign({}, commonParams, {
    hostUin: 0,
    needNewCode: 0,
    platform: "yqq",
    order: "listen",
    begin: 0,
    num: 80,
    songstatus: 1,
    singermid: singerId
  });
  return jsonp(url, data, options);
}

// 获取歌曲播放URL
export function getPlayMusic(songmids) {
  return axios.request({
    methods: "get",
    url: "/cgi-bin/musicu.fcg",
    params: {
      format: "json",
      data: {
        req_0: {
          module: "vkey.GetVkeyServer",
          method: "CgiGetVkey",
          param: {
            guid: "3870860654",
            songmid: songmids,
            songtype: [0],
            uin: "0",
            loginflag: 1,
            platform: "20"
          }
        }
      }
    }
  });
}

// 获取歌词
export function getLyrics(songmid) {
  return caxios.request({
    methods: "get",
    url: "/lyric/fcgi-bin/fcg_query_lyric_new.fcg",
    params: {
      "-": "MusicJsonCallback_lrc",
      pcachetime: 1579744210808,
      songmid: songmid,
      g_tk: "5381",
      loginUin: "0",
      hostUin: "0",
      format: "json",
      inCharset: "utf8",
      outCharset: "utf-8",
      notice: "0",
      platform: "yqq.json",
      needNewCode: "0"
    }
  });
}
