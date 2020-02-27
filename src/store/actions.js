import * as types from "./mutationTypes";
import { playMode } from "common/js/config.js";
import { shuffle } from "utils/playList.js";
import {
  saveSearch,
  deleteSearch,
  clearSearch,
  savePlay,
  saveFavorite,
  deleteFavorite
} from "common/js/cache.js";

const actions = {
  // 歌手页面选中某个歌曲播放
  selectPlay({ commit, state }, { list, index }) {
    // 如果模式是随机, 就传一个随机的播放列表
    if (state.mode === playMode.random) {
      let randomList = shuffle(list);
      commit(types.SET_PLAYLIST, randomList);
      index = findIndex(randomList, list[index]);
    } else {
      commit(types.SET_PLAYLIST, list); // 当前模式播放列表;
    }
    commit(types.SET_SEQUENCE_LIST, list); // 顺序模式下播放列表
    commit(types.SET_CURRENT_INDEX, index); // 当前播放索引
    commit(types.SET_PLAYING_STATE, true); // 播放
    commit(types.SET_FULL_SCREEN, true); // 全屏播放器
  },
  // 切换播放模式为随机播放
  randomPlay({ commit }, { list }) {
    let randomList = shuffle(list);
    commit(types.SET_PLAY_MODE, playMode.random); // 播放模式
    commit(types.SET_PLAYLIST, randomList); // 当前模式播放列表
    commit(types.SET_SEQUENCE_LIST, list); // 顺序模式下播放列表
    commit(types.SET_CURRENT_INDEX, 0); // 播放索引
    commit(types.SET_PLAYING_STATE, true); // 播放
    commit(types.SET_FULL_SCREEN, true); // 全屏播放器
  },
  // 搜索结果列表点击歌曲
  insertSong({ commit, state }, song) {
    let playList = JSON.parse(JSON.stringify(state.playList));
    let sequenceList = JSON.parse(JSON.stringify(state.sequenceList));
    let currentIndex = JSON.parse(JSON.stringify(state.currentIndex));
    // 记录当前播放的歌曲
    let currentSong = playList[currentIndex];
    // 查找当前列表中是否有待插入歌曲并返回索引
    let fpIndex = findIndex(playList, song);
    // 因为是插入歌曲, 所以索引+1
    currentIndex++;
    // 插入这首歌到当前索引位置
    playList.splice(currentIndex, 0, song);
    // 如果已经包含了这首歌
    if (fpIndex > -1) {
      // 如果当前插入的序号大于例表中的序号
      if (currentIndex > fpIndex) {
        playList.splice(fpIndex, 1);
        currentIndex--;
      } else {
        playList.splice(fpIndex + 1, 1);
      }
    }
    // 查找顺序列表中是否有待插入歌曲并返回 索引+1
    let currentSIndex = findIndex(sequenceList, currentSong) + 1;
    // 查找顺序播放列表中是否有待插入歌曲并返回索引
    let fsIndex = findIndex(sequenceList, song);
    // 插入这首歌到顺序播放列表索引位置
    sequenceList.splice(currentSIndex, 0, song);
    if (fsIndex > -1) {
      if (currentSIndex > fsIndex) {
        sequenceList.splice(fsIndex, 1);
      } else {
        sequenceList.splice(fsIndex + 1, 1);
      }
    }
    commit(types.SET_PLAYLIST, playList);
    commit(types.SET_SEQUENCE_LIST, sequenceList);
    commit(types.SET_CURRENT_INDEX, currentIndex);
    commit(types.SET_FULL_SCREEN, true);
    commit(types.SET_PLAYING_STATE, true);
  },
  // 保存搜索历史到vuex和localstorage
  saveSearchHistory({ commit }, query) {
    commit(types.SET_SEARCH_HISTORY, saveSearch(query));
  },
  // 删除搜索历史中某个数据
  deleteSearchHistory({ commit }, query) {
    commit(types.SET_SEARCH_HISTORY, deleteSearch(query));
  },
  // 清空搜索历史
  clearSearchHistory({ commit }) {
    commit(types.SET_SEARCH_HISTORY, clearSearch());
  },
  // 删除播放列表的某一项
  deleteSong({ commit, state }, song) {
    let playList = state.playList;
    let sequenceList = state.sequenceList;
    let currentIndex = state.currentIndex;
    let pIndex = findIndex(playList, song);
    playList.splice(pIndex, 1);
    let sIndex = findIndex(sequenceList, song);
    sequenceList.splice(sIndex, 1);
    if (currentIndex > pIndex || currentIndex === playList.length) {
      currentIndex--;
    }
    commit(types.SET_PLAYLIST, playList);
    commit(types.SET_SEQUENCE_LIST, sequenceList);
    commit(types.SET_CURRENT_INDEX, currentIndex);

    const playingState = playList.length > 0;
    commit(types.SET_PLAYING_STATE, playingState);
  },
  // 清空播放列表
  deleteSongList({ commit }) {
    commit(types.SET_PLAYLIST, []);
    commit(types.SET_SEQUENCE_LIST, []);
    commit(types.SET_CURRENT_INDEX, -1);
    commit(types.SET_PLAYING_STATE, false);
  },
  // 添加歌曲到播放历史
  savePlayHistory({ commit }, song) {
    commit(types.SET_PLAY_HISTORY, savePlay(song));
  },
  // 保存收藏
  saveFavoriteList({ commit }, song) {
    commit(types.SET_FAVORITELIST, saveFavorite(song));
  },
  // 删除收藏
  deleteFavoriteList({ commit }, song) {
    commit(types.SET_FAVORITELIST, deleteFavorite(song));
  }
};

function findIndex(list, song) {
  return list.findIndex(item => {
    return item.id === song.id;
  });
}

export default actions;
