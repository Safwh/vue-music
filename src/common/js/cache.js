import storage from "good-storage";

const SEARCH_HISTORY_KEY = "__searchHistory__";
const HISTORY_MAX_LENGTH = 15;

const PLAY_KEY = "__play__";
const PLAY_MAX_LENGTH = 200;

const FAVORITE_KEY = "__favorite__";
const FAVORITE_MAX_LENGTH = 200;

// 读取本地搜索历史
export function localSearch() {
  return storage.get(SEARCH_HISTORY_KEY, []);
}

// 保存当前搜索至搜索历史中
export function saveSearch(query) {
  let searches = storage.get(SEARCH_HISTORY_KEY, []);
  insertArray(
    searches,
    query,
    item => {
      return item === query;
    },
    HISTORY_MAX_LENGTH
  );
  storage.set(SEARCH_HISTORY_KEY, searches);
  return searches;
}

// 从搜索历史中删除某个历史记录
export function deleteSearch(query) {
  let searches = storage.get(SEARCH_HISTORY_KEY, []);
  deleteFromArray(searches, item => {
    return item === query;
  });
  storage.set(SEARCH_HISTORY_KEY, searches);
  return searches;
}

// 清除全部搜索历史
export function clearSearch() {
  storage.remove(SEARCH_HISTORY_KEY);
  return [];
}

// 读取本地播放历史
export function loadPlay() {
  return storage.get(PLAY_KEY, []);
}

// 保存播放历史
export function savePlay(song) {
  let songs = storage.get(PLAY_KEY, []);
  insertArray(
    songs,
    song,
    item => {
      return item.id === song.id;
    },
    PLAY_MAX_LENGTH
  );
  storage.set(PLAY_KEY, songs);
  return songs;
}

// 读取收藏数据
export function loadFavorite() {
  return storage.get(FAVORITE_KEY, []);
}

// 保存收藏数据
export function saveFavorite(song) {
  let songs = storage.get(FAVORITE_KEY, []);
  insertArray(
    songs,
    song,
    item => {
      return song.id === item.id;
    },
    FAVORITE_MAX_LENGTH
  );
  storage.set(FAVORITE_KEY, songs);
  return songs;
}

// 从收藏数据删除收藏
export function deleteFavorite(song) {
  let songs = storage.get(FAVORITE_KEY, []);
  deleteFromArray(songs, item => {
    return (item.id = song.id);
  });
  storage.set(FAVORITE_KEY, songs);
  return songs;
}

/**
 * @description:
 * @param  {Array} arr 数组
 * @param  {String} query 待查找文本
 * @param  {function} func 比较函数
 * @param  {Number} maxlen 插入最大值
 * @return:
 */
function insertArray(arr, val, func, maxlen) {
  const index = arr.findIndex(func);
  // val 存在且为第一个值, 函数结束
  if (index === 0) {
    return;
  }
  // val存在且不为第一个值, 先删除存在的值, 添加val至索引0位置
  if (index > 0) {
    arr.splice(index, 1);
  }
  arr.unshift(val);
  // 判断arr长度, 大于maxlen , 删除最后一个值
  if (arr && arr.length > maxlen) {
    arr.pop();
  }
}

/**
 * @description: 从数组中删除某个值
 * @param {Array} arr 数组
 * @param {function} func 比较函数
 * @return:
 */
function deleteFromArray(arr, func) {
  let index = arr.findIndex(func);
  if (index > -1) {
    arr.splice(index, 1);
  }
}
