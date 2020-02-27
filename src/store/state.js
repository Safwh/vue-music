import { playMode } from "common/js/config.js";
import { localSearch, loadPlay, loadFavorite } from "common/js/cache.js";

const state = {
  /* 歌手详情页相关state */
  singer: {},
  /* 播放相关state */
  playing: false, // 播放
  fullScreen: false, // 播放器全屏
  playList: [], // 当前播放歌曲列表
  sequenceList: [], // 顺序播放时歌曲列表
  mode: playMode.sequence, // 播放模式
  currentIndex: -1, // 当前播放索引
  disc: {}, // 歌单对象
  /* 排行页相关state */
  topList: {}, // 当前选中榜单
  searchHistory: localSearch(), //搜索历史
  playHistory: loadPlay(), // 播放历史
  favoriteList: loadFavorite() // 收藏列表
};

export default state;
