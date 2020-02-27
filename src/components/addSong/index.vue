<template>
  <transition name="slide">
    <div class="add-song" v-show="showFlag" @click.stop>
      <div class="header">
        <h1 class="title">添加歌曲到列表</h1>
        <div @click="hide" class="close">
          <i class="icon-close"></i>
        </div>
      </div>
      <div class="search-box-wrapper">
        <SearchBox
          @query="onQueryChange"
          ref="searchBox"
          placeholder="搜索歌曲"
        />
      </div>
      <div class="shortcur" v-show="!query">
        <Switches
          @switch="switchItem"
          :switches="switches"
          :currentIndex="currentIndex"
        />
        <div class="list-wrapper">
          <!-- 最近播放 -->
          <Scroll
            v-if="currentIndex === 0"
            :data="playHistory"
            class="list-scroll"
            ref="songList"
          >
            <div class="list-inner">
              <SongList @select="selectSong" :songs="playHistory" />
            </div>
          </Scroll>
          <!-- 搜索历史 -->
          <Scroll
            v-if="currentIndex === 1"
            :data="searchHistory"
            class="list-scroll"
            ref="searchList"
          >
            <div class="list-inner">
              <SearchList
                :searches="searchHistory"
                @select="addQuery"
                @delete="deleteSearchHistory"
              />
            </div>
          </Scroll>
        </div>
      </div>
      <div class="search-result" v-show="query">
        <Suggest
          @select="selectSuggest"
          @listScroll="blurInput"
          :query="query"
          :showSinger="showSinger"
        />
      </div>
      <TopTip ref="topTip">
        <div class="tip-title">
          <i class="icon-ok"></i>
          <span class="text">1首歌曲已经添加到播放队列</span>
        </div>
      </TopTip>
    </div>
  </transition>
</template>

<script>
import SearchBox from "src/base/searchBox";
import Suggest from "components/suggest";
import Switches from "src/base/switches";
import Scroll from "src/base/scroll";
import SongList from "src/base/songList";
import SearchList from "src/base/searchList";
import TopTip from "src/base/topTip";
import { searchMixin } from "common/js/mixin.js";
import { mapGetters, mapActions } from "vuex";
import { Song } from "common/js/song.js";
export default {
  name: "AddSong",
  components: {
    SearchBox,
    Suggest,
    Switches,
    Scroll,
    SongList,
    SearchList,
    TopTip
  },
  mixins: [searchMixin],
  data() {
    return {
      showFlag: false,
      showSinger: false, //  不搜索歌手
      currentIndex: 0,
      switches: [{ name: "最近播放" }, { name: "搜索历史" }]
    };
  },
  computed: {
    ...mapGetters(["playHistory"])
  },
  methods: {
    // 显示
    show() {
      this.showFlag = true;
      // 从隐藏到显示  重新渲染scroll 可以滚动
      setTimeout(() => {
        if (this.currentIndex === 0) {
          this.$refs.songList.refresh();
        } else {
          this.$refs.searchList.refresh();
        }
      }, 20);
    },
    // 隐藏
    hide() {
      this.showFlag = false;
    },
    // 点击搜索结果中某一项
    selectSuggest() {
      this.saveHistory();
      this.showTopTip();
    },
    // 切换标签 子组件派发的事件
    switchItem(index) {
      this.currentIndex = index;
    },
    // 单击播放历史列表中的某一项
    selectSong(song, index) {
      // 点击第一项, 什么都不做
      if (index !== 0) {
        this.insertSong(new Song(song));
        this.showTopTip();
      }
    },
    // 显示顶部提示信息
    showTopTip() {
      this.$refs.topTip.show();
    },
    ...mapActions(["insertSong"])
  }
};
</script>

<style lang="scss" scoped>
@import "common/style/variable";

.add-song {
  position: fixed;
  top: 0;
  bottom: 0;
  width: 100%;
  z-index: 200;
  background: $color-background;
  .header {
    position: relative;
    height: 44px;
    text-align: center;
    .title {
      line-height: 44px;
      font-size: $font-size-large;
      color: $color-text;
    }
    .close {
      position: absolute;
      top: 0;
      right: 8px;
      .icon-close {
        display: block;
        padding: 12px;
        font-size: 20px;
        color: $color-theme;
      }
    }
  }
  .search-box-wrapper {
    margin: 20px;
  }
  .shortcur {
    .list-wrapper {
      position: absolute;
      top: 165px;
      bottom: 0;
      width: 100%;
      .list-scroll {
        height: 100%;
        overflow: hidden;
        .list-inner {
          padding: 20px 30px;
        }
      }
    }
  }
  .search-result {
    position: fixed;
    top: 124px;
    bottom: 0;
    width: 100%;
  }
  .tip-title {
    text-align: center;
    padding: 18px 0;
    font-size: 0;
    .icon-ok {
      font-size: $font-size-medium;
      color: $color-theme;
      margin-right: 4px;
    }
    .text {
      font-size: $font-size-medium;
      color: $color-text;
    }
  }
}
.add-song.slide-enter-active {
  transition: all 0.3s;
}
.add-song.slide-leave-active {
  transition: all 0.3s;
}
.add-song.slide-enter {
  transform: translate3d(100%, 0, 0);
}
.add-song.slide-leave-to {
  transform: translate3d(100%, 0, 0);
}
</style>
