// Vuex 允许我们在 store 中定义“getter”（可以认为是 store 的计算属性）
export const singer = state => state.singer;

export const playing = state => state.playing;

export const fullScreen = state => state.fullScreen;

export const playList = state => state.playList;

export const sequenceList = state => state.sequenceList;

export const mode = state => state.mode;

export const currentIndex = state => state.currentIndex;

// 当前播放的歌曲
export const currentSong = state => {
  return state.playList[state.currentIndex] || {};
};

export const topList = state => state.topList;

export const disc = state => {
  return state.disc;
};

export const searchHistory = state => state.searchHistory;

export const playHistory = state => state.playHistory;

export const favoriteList = state => state.favoriteList;
