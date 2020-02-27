/* Mixin 是分发vue组件可重用功能的灵活方法, mixin对象可以包含任何组件选项 */

import { mapGetters, mapMutations, mapActions } from "vuex";
import { playMode } from "common/js/config.js";
import { shuffle } from "utils/playList.js";

// 解决迷你播放器和scroll高度问题
export const playlistMixin = {
  computed: {
    ...mapGetters(["playList"])
  },
  mounted() {
    this.handlePlaylist(this.playList);
  },
  // activated 在激活保持活动的组件时调用(keep-alive)
  activated() {
    this.handlePlaylist(this.playList);
  },
  watch: {
    playList(newVal) {
      this.handlePlaylist(newVal);
    }
  },
  methods: {
    handlePlaylist() {
      throw new Error("component must implement handlePlaylist method");
    }
  }
};

// 播放 mixin
export const playerMixin = {
  computed: {
    // 模式icon
    iconMode() {
      return this.mode === playMode.sequence
        ? "icon-sequence"
        : this.mode === playMode.loop
        ? "icon-loop"
        : "icon-random";
    },
    ...mapGetters([
      "sequenceList",
      "currentSong",
      "playList",
      "mode",
      "favoriteList"
    ])
  },
  methods: {
    // 改变播放模式
    changeMode() {
      const mode = (this.mode + 1) % 3;
      this.setPlayMode(mode);
      let list = null;
      if (mode === playMode.random) {
        list = shuffle(this.sequenceList);
      } else {
        list = this.sequenceList;
      }
      this.resetCurrentIndex(list);
      this.setPlayList(list);
    },
    // 播放列表顺序改变, 寻找当前播放歌曲索引,并设置
    resetCurrentIndex(list) {
      let index = list.findIndex(item => {
        return item.id === this.currentSong.id;
      });
      this.setCurrentIndex(index);
    },
    // 获取收藏图标
    getFavoriteIcon(song) {
      return this.isFavorite(song) ? "icon-favorite" : "icon-not-favorite";
    },
    // 切换收藏与取消收藏
    toggleFavorite(song) {
      if (this.isFavorite(song)) {
        this.deleteFavoriteList(song);
      } else {
        this.saveFavoriteList(song);
      }
    },
    // 判断当前歌曲是否已经收藏
    isFavorite(song) {
      const index = this.favoriteList.findIndex(item => {
        return item.id === song.id;
      });
      return index > -1;
    },
    ...mapMutations({
      setCurrentIndex: "SET_CURRENT_INDEX",
      setPlayMode: "SET_PLAY_MODE",
      setPlayList: "SET_PLAYLIST",
      setPlayingState: "SET_PLAYING_STATE"
    }),
    ...mapActions(["saveFavoriteList", "deleteFavoriteList"])
  }
};

// 搜索mixin
export const searchMixin = {
  data() {
    return {
      query: "" // 搜索框内容
    };
  },
  computed: {
    ...mapGetters(["searchHistory"])
  },
  methods: {
    // 搜索框内容改变,SearchBox派发query事件
    onQueryChange(query) {
      this.query = query;
    },
    // 列表滚动 , 搜索框失去焦点, 收起输入键盘
    blurInput() {
      this.$refs.searchBox.blur();
    },
    // 选择搜索结果 派发select事件 保存搜索历史
    saveHistory() {
      this.saveSearchHistory(this.query);
    },
    // 点击热门搜索
    addQuery(query) {
      this.$refs.searchBox.setQuery(query);
    },
    ...mapActions(["saveSearchHistory", "deleteSearchHistory"])
  }
};
