import jsonp from "utils/jsonp.js";
import axios from "utils/axios.js";
import caxios from "utils/caxios.js";

import { commonParams, options } from "./config";

// 获取轮播图数据
export function getRecommend() {
  const url =
    "https://c.y.qq.com/musichall/fcgi-bin/fcg_yqqhomepagerecommend.fcg";

  const data = Object.assign({}, commonParams, {
    platform: "h5",
    uin: 0,
    needNewCode: 1
  });

  return jsonp(url, data, options);
}

// 获取首页歌单数据
export function getDiscList() {
  return axios.request({
    methods: "get",
    url: "/cgi-bin/musicu.fcg",
    params: {
      "-": "recom6673504530566847",
      g_tk: 5381,
      loginUin: 0,
      hostUin: 0,
      format: "json",
      inCharset: "utf8",
      outCharset: "utf - 8",
      notice: 0,
      platform: "yqq.json",
      needNewCode: 0,
      data: {
        comm: { ct: 24 },
        category: {
          method: "get_hot_category",
          param: { qq: "" },
          module: "music.web_category_svr"
        },
        recomPlaylist: {
          method: "get_hot_recommend",
          param: { async: 1, cmd: 2 },
          module: "playlist.HotRecommendServer"
        },
        playlist: {
          method: "get_playlist_by_category",
          param: { id: 8, curPage: 1, size: 40, order: 5, titleid: 8 },
          module: "playlist.PlayListPlazaServer"
        },
        new_song: {
          module: "newsong.NewSongServer",
          method: "get_new_song_info",
          param: { type: 5 }
        },
        new_album: {
          module: "newalbum.NewAlbumServer",
          method: "get_new_album_info",
          param: { area: 1, sin: 0, num: 10 }
        },
        new_album_tag: {
          module: "newalbum.NewAlbumServer",
          method: "get_new_album_area",
          param: {}
        },
        toplist: {
          module: "musicToplist.ToplistInfoServer",
          method: "GetAll",
          param: {}
        },
        focus: {
          module: "QQMusic.MusichallServer",
          method: "GetFocus",
          param: {}
        }
      }
    }
  });
}

// 获取歌单详情数据
export function getSongList(disstid) {
  return caxios.request({
    methods: "get",
    url: "/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg",
    params: {
      disstid,
      type: 1,
      json: 1,
      utf8: 1,
      onlysong: 0,
      new_format: 1,
      g_tk: 5381,
      loginUin: 0,
      hostUin: 0,
      format: "json",
      inCharset: "utf8",
      outCharset: "utf-8",
      notice: 0,
      platform: "yqq.json",
      needNewCode: 0,
      song_begin: 0,
      song_num: 10
    }
  });
}
