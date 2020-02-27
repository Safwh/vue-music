<template>
  <div class="music-list">
    <!-- 后退icon -->
    <div class="back" @click="back">
      <i class="icon-back"></i>
    </div>
    <!-- 标题 -->
    <h1 class="title">{{ title }}</h1>
    <!-- 大背景图 -->
    <div class="bg-image" :style="bgStyle" ref="bgImage">
      <div class="play-wrapper">
        <!-- 播放按钮 -->
        <div
          @click="random"
          class="play"
          ref="playBtn"
          v-show="songs.length > 0"
        >
          <i class="icon-play"></i>
          <span class="text">随机播放全部</span>
        </div>
      </div>
      <div class="filter" ref="filter"></div>
    </div>
    <!-- 往上滑的遮罩层 -->
    <div class="bg-layer" ref="layer"></div>
    <!-- 歌曲列表 -->
    <Scroll
      @scroll="scroll"
      :probeType="probeType"
      :listenScroll="listenScroll"
      :data="songs"
      class="list"
      ref="list"
    >
      <div class="song-list-wrapper">
        <SongList @select="selectItem" :songs="songs" :rank="rank" />
      </div>
      <!-- loading -->
      <div class="loading-container" v-show="!songs.length">
        <Loading />
      </div>
    </Scroll>
  </div>
</template>

<script>
import Scroll from "src/base/scroll";
import SongList from "src/base/songList";
import Loading from "src/base/loading";
import { mapActions } from "vuex";
import { playlistMixin } from "common/js/mixin.js";

const RESERVED_HEIGHT = 40;

export default {
  name: "MusicList",
  mixins: [playlistMixin],
  components: {
    SongList,
    Scroll,
    Loading
  },
  props: {
    title: {
      type: String,
      default: ""
    },
    bgImage: {
      type: String,
      default: ""
    },
    songs: {
      type: Array,
      default: () => []
    },
    rank: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      pagY: 0
    };
  },
  computed: {
    // 背景图片的应用方式
    bgStyle() {
      return `background-image: url(${this.bgImage})`;
    }
  },
  watch: {
    // 监听滑动
    pagY(newY) {
      // 返回一组数的最大值
      let translateY = Math.max(this.minTranslateY, newY);
      this.$refs.layer.style.transform = `translate3d(0,${translateY}px, 0)`;
      let zIndex = 0;
      let scale = 1; // 背景图缩放比例
      let blue = 0; // 高斯模糊
      /* 下拉背景放大,上拉背景高斯模糊 */
      const percent = Math.abs(newY / this.bgImageHeight); // 放大的比例
      // 下拉 newY > 0 上拉 newY < 0
      if (newY > 0) {
        scale = 1 + percent;
        zIndex = 10;
      } else {
        blue = Math.min(20 * percent, 20);
      }
      this.$refs.filter.style["backdropFilter"] = `blur(${blue}px)`;
      /* 上拉至顶部背景盒子处理 */
      if (newY < this.minTranslateY) {
        zIndex = 10;
        this.$refs.bgImage.style.padding = 0;
        this.$refs.bgImage.style.height = `${RESERVED_HEIGHT}px`;
        // 上拉到顶部，把随机播放隐藏
        this.$refs.playBtn.style.display = "none";
      } else {
        // 下拉还原原来的样式
        this.$refs.bgImage.style.paddingTop = "70%";
        this.$refs.bgImage.style.height = 0;
        // 正常情况下，按钮显示
        this.$refs.playBtn.style.display = "";
      }
      this.$refs.bgImage.style.zIndex = zIndex;
      this.$refs.bgImage.style["transform"] = `scale(${scale})`;
    }
  },
  methods: {
    // 利用mixin 解决迷你播放器显示导致遮挡Scroll
    handlePlaylist(playlist) {
      const bottom = playlist.length > 0 ? "60px" : "";
      this.$refs.list.$el.style.bottom = bottom;
      this.$refs.list.refresh();
    },
    // 派发的scroll事件可以监听到滚动位置
    scroll(pops) {
      this.pagY = pops.y;
    },
    // 返回上级
    back() {
      this.$router.back();
    },
    // 子组件派发的select事件
    selectItem(item, index) {
      this.selectPlay({
        list: this.songs,
        index: index
      });
    },
    // 点击随机播放全部处理
    random() {
      this.randomPlay({
        list: this.songs
      });
    },
    ...mapActions(["selectPlay", "randomPlay"])
  },
  created() {
    // 可以监听快速滑动的位置
    this.probeType = 3;
    // 需要监听滚动
    this.listenScroll = true;
  },

  mounted() {
    // 记录一下歌手图片的高度
    this.bgImageHeight = this.$refs.bgImage.clientHeight;
    // 图片高度减去头部高度，就是bglayer滚动的最大高度
    this.minTranslateY = -this.bgImageHeight + RESERVED_HEIGHT;
    // $el指向当前组件的DOM元素。
    this.$refs.list.$el.style.top = `${this.bgImageHeight}px`;
  }
};
</script>

<style lang="scss" scoped>
@import "common/style/variable";
@import "common/style/mixin";

.music-list {
  position: fixed;
  z-index: 100;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: $color-background;
  .back {
    position: absolute;
    top: 0;
    left: 6px;
    z-index: 50;
    .icon-back {
      display: block;
      padding: 10px;
      font-size: $font-size-large-x;
      color: $color-theme;
    }
  }
  .title {
    position: absolute;
    top: 0;
    left: 10%;
    z-index: 40;
    width: 80%;
    @include no-wrap();
    text-align: center;
    line-height: 40px;
    font-size: $font-size-large;
    color: $color-text;
  }
  .bg-image {
    position: relative;
    width: 100%;
    height: 0;
    padding-top: 70%;
    transform-origin: top;
    background-size: cover;
    .play-wrapper {
      position: absolute;
      bottom: 20px;
      z-index: 50;
      width: 100%;
      .play {
        box-sizing: border-box;
        width: 135px;
        padding: 7px 0;
        margin: 0 auto;
        text-align: center;
        border: 1px solid $color-theme;
        color: $color-theme;
        border-radius: 100px;
        font-size: 0;
        .icon-play {
          display: inline-block;
          vertical-align: middle;
          margin-right: 6px;
          font-size: $font-size-medium-x;
        }
        .text {
          display: inline-block;
          vertical-align: middle;
          font-size: $font-size-small;
        }
      }
    }
    .filter {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(7, 17, 27, 0.4);
    }
  }
  .bg-layer {
    position: relative;
    height: 100%;
    background: $color-background;
  }
  .list {
    position: fixed;
    top: 0;
    bottom: 0;
    width: 100%;
    background: $color-background;
    .song-list-wrapper {
      padding: 20px 30px;
    }
    .loading-container {
      position: absolute;
      width: 100%;
      top: 50%;
      transform: translateY(-50%);
    }
  }
}
</style>
