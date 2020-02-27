<template>
  <div class="player" v-show="playList.length > 0">
    <!-- 全屏播放器 -->
    <transition name="normal">
      <div class="normal-player" v-show="fullScreen">
        <!-- 背景 -->
        <div class="background">
          <img
            ref="normalImg"
            :src="currentSong.image"
            width="100%"
            height="100%"
          />
        </div>
        <!-- 顶部区域 -->
        <div class="top">
          <!-- back-icon -->
          <div @click="back" class="back">
            <i class="icon-back"></i>
          </div>
          <!-- title区域 -->
          <h1 class="title">{{ currentSong.name }}</h1>
          <h2 class="subtitle">{{ currentSong.singer }}</h2>
        </div>

        <!-- 中间区域 -->
        <div
          class="middle"
          @touchstart="middleTouchStart"
          @touchmove="middleTouchMove"
          @touchend="middleTouchEnd"
        >
          <!-- 旋转图片区域 -->
          <div class="middle-l" ref="middleL">
            <!-- cd -->
            <div class="cd-wrapper">
              <div class="cd">
                <img
                  :src="currentSong.image"
                  alt=""
                  class="image"
                  :class="cdCls"
                />
              </div>
            </div>
            <!-- cd下方当前播放歌词 -->
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">{{ this.playingLyric }}</div>
            </div>
          </div>
          <!-- 歌词区域 -->
          <Scroll
            class="middle-r"
            ref="lyricList"
            :data="currentLyric && currentLyric.lines"
          >
            <div class="lyric-wrapper">
              <div v-if="currentLyric">
                <p
                  v-for="(line, index) in currentLyric.lines"
                  class="text"
                  :class="{ current: index === currentLineNum }"
                  ref="lyricLine"
                  :key="line.time"
                >
                  {{ line.txt }}
                </p>
              </div>
            </div>
          </Scroll>
        </div>
        <!-- 底部操作区域 -->
        <div class="bottom">
          <!-- 旋转图片 歌词左右切换显示小圆点 -->
          <div class="dot-wrapper">
            <div class="dot" :class="{ active: currentShow === 'cd' }"></div>
            <div class="dot" :class="{ active: currentShow === 'lyric' }"></div>
          </div>
          <!-- 进度条区域 -->
          <div class="progress-wrapper">
            <span class="time time-l">{{ format(currentTime) }}</span>
            <div class="progress-bar-wrapper">
              <PregressBar
                @percentChange="onProgressBarChange"
                :percent="percent"
              />
            </div>
            <span class="time time-r">{{ format(currentSong.duration) }}</span>
          </div>
          <!-- 底部控制区域 -->
          <div class="operators">
            <!-- 播放模式 -->
            <div class="icon i-left">
              <i @click="changeMode" :class="iconMode"></i>
            </div>
            <!-- 上一首 -->
            <div class="icon i-left" :class="disableCls">
              <i @click="prev" class="icon-prev"></i>
            </div>
            <!-- 播放暂停 -->
            <div class="icon i-center" :class="disableCls">
              <i :class="playIcon" @click="togglePlaying"></i>
            </div>
            <!-- 下一首 -->
            <div class="icon i-right" :class="disableCls">
              <i @click="next" class="icon-next" :class="disableCls"></i>
            </div>
            <!-- 收藏 -->
            <div class="icon i-right">
              <i
                @click="toggleFavorite(currentSong)"
                :class="getFavoriteIcon(currentSong)"
                class="icon"
              ></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <!-- 迷你播放器 -->
    <transition name="mini">
      <div @click="open" class="mini-player" v-show="!fullScreen">
        <div class="icon">
          <div class="imgWrapper">
            <img
              ref="miniImg"
              :src="currentSong.image"
              :class="cdCls"
              width="40"
              height="40"
            />
          </div>
        </div>
        <div class="text">
          <h2 class="name">{{ currentSong.name }}</h2>
          <p class="desc">{{ currentSong.singer }}</p>
        </div>
        <div class="control">
          <PrtgressCircle :radius="radius" :percent="percent">
            <i
              @click.stop="togglePlaying"
              :class="miniIcon"
              class="icon-mini"
            ></i>
          </PrtgressCircle>
        </div>
        <div class="control">
          <i @click.stop="showPlayList" class="icon-playlist"></i>
        </div>
      </div>
    </transition>
    <PlayList ref="playlist" />
    <audio
      ref="audio"
      :src="currentSong.url"
      @play="ready"
      @error="error"
      @timeupdate="timeUpdata"
      @ended="end"
    ></audio>
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from "vuex";
import PregressBar from "src/base/progressBar";
import PrtgressCircle from "src/base/progressCircle";
import { playMode } from "common/js/config.js";
import Lyric from "lyric-parser";
import Scroll from "src/base/scroll";
import PlayList from "components/playList";
import { playerMixin } from "common/js/mixin.js";
export default {
  name: "Player",
  components: {
    PregressBar, //线条进度条
    PrtgressCircle, // 环形进度条
    Scroll,
    PlayList
  },
  mixins: [playerMixin],
  data() {
    return {
      songReady: false, // 歌曲加载好了
      currentTime: 0, // 歌曲当前播放的时间
      radius: 32, // 迷你播放器圆环进度条宽度
      currentLyric: null, // 当前歌曲歌词
      currentLineNum: 0, // 当前歌词所在的行
      currentShow: "cd", // 显示cd还是显示歌词lyric
      playingLyric: ""
    };
  },
  computed: {
    // CD旋转暂停样式
    cdCls() {
      return this.playing ? "play" : "play pause";
    },
    // 全屏播放暂停icon
    playIcon() {
      return this.playing ? "icon-pause" : "icon-play";
    },
    // 迷你播放暂停icon
    miniIcon() {
      return this.playing ? "icon-pause-mini" : "icon-play-mini";
    },
    // 歌曲未准备好添加样式
    disableCls() {
      return this.songReady ? "" : "disable";
    },
    // 歌曲播放时间百分比
    percent() {
      return this.currentTime / this.currentSong.duration;
    },

    ...mapGetters(["fullScreen", "currentIndex", "playing"])
  },
  watch: {
    currentSong(newSong, oldSong) {
      // 防止播放列表删除为空时, 继续向下执行报错
      if (!newSong.id) {
        return;
      }
      if (newSong.id === oldSong.id) {
        return;
      }
      // 防止多个定时器, 调用play方法之前, 先判断清除定时器
      if (this.currentLyric) {
        this.currentLyric.stop();
      }
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.$refs.audio.play();
        this.getLyric();
      }, 1000);
    },
    playing() {
      this.$nextTick(() => {
        const audio = this.$refs.audio;
        this.playing ? audio.play() : audio.pause();
      });
    }
  },
  created() {
    this.touch = {};
  },
  methods: {
    // 隐藏全屏播放器
    back() {
      this.setFullScreen(false);
    },
    // 显示全屏播放器
    open() {
      this.setFullScreen(true);
    },
    // 单击播放暂停按钮时,
    togglePlaying() {
      this.setPlayingState(!this.playing);
      // 同时播放暂停歌词
      if (this.currentLyric) {
        this.currentLyric.togglePlay();
      }
    },
    // 歌曲播放完毕
    end() {
      // 循环或者下一首
      if (this.mode === playMode.loop) {
        this.loop();
      } else {
        this.next();
      }
    },
    // 循环播放处理
    loop() {
      this.$refs.audio.currentTime = 0;
      this.$refs.audio.play();
      // 循环结束,歌词跳到第一行
      if (this.currentLyric) {
        this.currentLyric.seek(0);
      }
    },
    // 上一首
    prev() {
      if (!this.songReady) {
        return;
      }
      // 当播放列表只有一首歌时, 直接调用循环
      if (this.playList.length === 1) {
        this.loop();
        return;
      } else {
        let index = this.currentIndex - 1;
        // 当第一首时,跳到最后一首
        if (index === -1) {
          index = this.playList.length - 1;
        }
        this.setCurrentIndex(index);
        if (!this.playing) {
          this.togglePlaying();
        }
      }
      this.songReady = false;
    },
    // 下一首
    next() {
      if (!this.songReady) {
        return;
      }
      // 当播放列表只有一首歌时, 直接调用循环
      if (this.playList.length === 1) {
        this.loop();
        return;
      } else {
        let index = this.currentIndex + 1;
        // 当最后一首时,跳到第一首
        if (index === this.playList.length) {
          index = 0;
        }
        this.setCurrentIndex(index);
        if (!this.playing) {
          this.togglePlaying();
        }
      }
      this.songReady = false;
    },
    // 当文件就绪开始播放时运行的脚本
    ready() {
      this.songReady = true;
      this.savePlayHistory(this.currentSong);
    },
    // 当在文件加载期间发生错误时运行的脚本。
    error() {
      this.songReady = false;
    },
    // 元素的currentTime属性表示的时间已经改变。
    timeUpdata(e) {
      this.currentTime = e.target.currentTime;
    },
    // 时间戳转换
    format(interval) {
      interval = interval | 0; // 或0 相当于Math.floor(向下取整)
      const minute = (interval / 60) | 0;
      const second = this._pad(interval % 60);
      return `${minute}:${second}`;
    },
    // 时间字符串补足长度
    _pad(num, n = 2) {
      let len = num.toString().length;
      while (len < n) {
        num = "0" + num;
        len++;
      }
      return num;
    },
    // 接收进度条派发的拖动事件
    onProgressBarChange(percent) {
      const currentTime = this.currentSong.duration * percent;
      this.$refs.audio.currentTime = currentTime;
      // 暂停状态拖动之后, 继续播放
      if (!this.playing) {
        this.togglePlaying();
      }
      // 拖动进度条, 歌词随之改变
      if (this.currentLyric) {
        this.currentLyric.seek(currentTime * 1000);
      }
    },
    // 获取歌词
    getLyric() {
      this.currentSong
        .getLyric()
        .then(lyric => {
          if (this.currentSong.lyric !== lyric) {
            return;
          }
          this.currentLyric = new Lyric(lyric, this.handleLyric);
          if (this.playing) {
            this.currentLyric.play();
          }
        })
        .catch(() => {
          // 未获取到歌词处理
          this.currentLyric = null;
          this.playingLyric = "";
          this.currentLineNum = 0;
        });
    },
    // 歌词每一行改变回调
    handleLyric({ lineNum, txt }) {
      this.currentLineNum = lineNum;
      // 让当前歌词显示在中间
      if (lineNum > 5) {
        let lineEl = this.$refs.lyricLine[lineNum - 5];
        this.$refs.lyricList.scrollToElement(lineEl, 1000);
      } else {
        this.$refs.lyricList.scrollTo(0, 0, 1000);
      }
      this.playingLyric = txt;
    },
    /* 歌词和CD左右滑动 */
    middleTouchStart(e) {
      this.touch.initiated = true;
      this.touch.startX = e.touches[0].pageX;
      this.touch.startY = e.touches[0].pageY;
    },
    middleTouchMove(e) {
      this.$refs.lyricList.$el.style.transition = "";
      this.$refs.middleL.style.transition = "";
      if (!this.touch.initiated) {
        return;
      }
      const deltaX = e.touches[0].pageX - this.touch.startX;
      const deltaY = e.touches[0].pageY - this.touch.startY;
      // 上下滑动距离比左右滑动距离大, 则直接返回
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        return;
      }
      const left = this.currentShow === "cd" ? 0 : -window.innerWidth;
      // -window.innerWidth < width < 0
      const offsetWidth = Math.min(
        0,
        Math.max(-window.innerWidth, left + deltaX)
      );
      this.touch.percent = Math.abs(offsetWidth / window.innerWidth);
      this.$refs.middleL.style.opacity = 1 - this.touch.percent;
      this.$refs.lyricList.$el.style.transform = `translate3d(${offsetWidth}px, 0, 0)`;
    },
    middleTouchEnd() {
      let offsetWidth, opacity;
      if (this.currentShow === "cd") {
        if (this.touch.percent < 0.1) {
          offsetWidth = 0;
          opacity = 1;
        } else {
          offsetWidth = -window.innerWidth;
          opacity = 0;
          this.currentShow = "lyric";
        }
      } else {
        if (this.touch.percent < 0.9) {
          offsetWidth = 0;
          opacity = 1;
          this.currentShow = "cd";
        } else {
          offsetWidth = -window.innerWidth;
          opacity = 0;
        }
      }
      this.$refs.lyricList.$el.style.transform = `translate3d(${offsetWidth}px, 0, 0)`;
      this.$refs.middleL.style.opacity = opacity;
      this.$refs.lyricList.$el.style.transition = "all .3s";
      this.$refs.middleL.style.transition = "all .3s";
    },
    // 显示
    showPlayList() {
      this.$refs.playlist.show();
    },
    ...mapMutations({
      setFullScreen: "SET_FULL_SCREEN"
    }),
    ...mapActions(["savePlayHistory"])
  }
};
</script>

<style lang="scss" scoped>
@import "common/style/variable.scss";
@import "common/style/mixin.scss";

.player {
  .normal-player {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 150;
    background: $color-background;
    .background {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      opacity: 0.6;
      filter: blur(20px);
    }
    .top {
      position: relative;
      margin-bottom: 25px;
      .back {
        position: absolute;
        top: 0;
        left: 6px;
        z-index: 50;
        .icon-back {
          display: block;
          padding: 9px;
          font-size: $font-size-large-x;
          color: $color-theme;
          transform: rotate(-90deg);
        }
      }
      .title {
        width: 70%;
        margin: 0 auto;
        line-height: 40px;
        text-align: center;
        font-size: $font-size-large;
        color: $color-text;
        @include no-wrap();
      }
      .subtitle {
        line-height: 20px;
        text-align: center;
        font-size: $font-size-medium;
        color: $color-text;
      }
    }
    .middle {
      position: fixed;
      width: 100%;
      top: 80px;
      bottom: 170px;
      white-space: nowrap;
      font-size: 0;
      .middle-l {
        display: inline-block;
        vertical-align: top;
        position: relative;
        width: 100%;
        height: 0;
        padding-top: 80%;
        .cd-wrapper {
          position: absolute;
          left: 10%;
          top: 0;
          width: 80%;
          box-sizing: border-box;
          height: 100%;
          .cd {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            .image {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
              box-sizing: border-box;
              border-radius: 50%;
              border: 10px solid rgba(255, 255, 255, 0.1);
            }
            .play {
              animation: rotate 20s linear infinite;
            }
            .pause {
              animation-play-state: paused;
            }
          }
        }
        .playing-lyric-wrapper {
          width: 80%;
          margin: 30px auto 0 auto;
          overflow: hidden;
          text-align: center;
          .playing-lyric {
            height: 20px;
            line-height: 20px;
            font-size: $font-size-medium;
            color: $color-text-l;
          }
        }
      }
      .middle-r {
        display: inline-block;
        vertical-align: top;
        width: 100%;
        height: 100%;
        overflow: hidden;
        .lyric-wrapper {
          width: 80%;
          margin: 0 auto;
          overflow: hidden;
          text-align: center;
          .text {
            line-height: 32px;
            color: $color-text-l;
            font-size: $font-size-medium;
          }
          .text.current {
            color: $color-text;
          }
          .pure-music {
            padding-top: 50%;
            line-height: 32px;
            color: $color-text-l;
            font-size: $font-size-medium;
          }
        }
      }
    }
    .bottom {
      position: absolute;
      bottom: 50px;
      width: 100%;
      .dot-wrapper {
        text-align: center;
        font-size: 0;
        .dot {
          display: inline-block;
          vertical-align: middle;
          margin: 0 4px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: $color-text-l;
        }
        .dot.active {
          width: 20px;
          border-radius: 5px;
          background: $color-text-ll;
        }
      }
      .progress-wrapper {
        display: flex;
        align-items: center;
        width: 80%;
        margin: 0px auto;
        padding: 10px 0;
        .time {
          color: $color-text;
          font-size: $font-size-small;
          flex: 0 0 30px;
          line-height: 30px;
          width: 30px;
        }
        .time.time-l {
          text-align: left;
        }
        .time.time-r {
          text-align: right;
        }
        .progress-bar-wrapper {
          flex: 1;
        }
      }
      .operators {
        display: flex;
        align-items: center;
        .icon {
          flex: 1;
          color: $color-theme;
          i {
            font-size: 30px;
          }
        }
        .icon.disable {
          color: $color-theme-d;
        }
        .i-left {
          text-align: right;
        }
        .i-center {
          padding: 0 20px;
          text-align: center;
          i {
            font-size: 40px;
          }
        }
        .i-right {
          text-align: left;
        }
        .icon-favorite {
          color: $color-sub-theme;
        }
      }
    }
  }
  .normal-player.normal-enter-active {
    transition: all 0.4s;
    .top {
      transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32);
    }
    .bottom {
      transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32);
    }
  }
  .normal-player.normal-leave-active {
    transition: all 0.4s;
    .top {
      transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32);
    }
    .bottom {
      transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32);
    }
  }
  .normal-player.normal-enter {
    opacity: 0;
    .top {
      transform: translate3d(0, -100px, 0);
    }
    .bottom {
      transform: translate3d(0, 100px, 0);
    }
  }
  .normal-player.normal-leave-to {
    opacity: 0;
    .top {
      transform: translate3d(0, -100px, 0);
    }
    .bottom {
      transform: translate3d(0, 100px, 0);
    }
  }
  .mini-player {
    display: flex;
    align-items: center;
    position: fixed;
    left: 0;
    bottom: 0;
    z-index: 180;
    width: 100%;
    height: 60px;
    background: $color-highlight-background;
    .icon {
      flex: 0 0 40px;
      width: 40px;
      height: 40px;
      padding: 0 10px 0 20px;
      .imgWrapper {
        height: 100%;
        width: 100%;
        img {
          border-radius: 50%;
        }
        img.play {
          animation: rotate 10s linear infinite;
        }
        img.pause {
          animation-play-state: paused;
        }
      }
    }
    .text {
      display: flex;
      flex-direction: column;
      justify-content: center;
      flex: 1;
      line-height: 20px;
      overflow: hidden;
      .name {
        margin-bottom: 2px;
        @include no-wrap();
        font-size: $font-size-medium;
        color: $color-text;
      }
      .desc {
        margin-bottom: 2px;
        @include no-wrap();
        font-size: $font-size-small;
        color: $color-text-d;
      }
    }
    .control {
      flex: 0 0 30px;
      width: 30px;
      padding: 0 10px;
      .icon-play-mini {
        font-size: 30px;
        color: $color-theme-d;
      }
      .icon-pause-mini {
        font-size: 30px;
        color: $color-theme-d;
      }
      .icon-playlist {
        font-size: 30px;
        color: $color-theme-d;
      }
      .icon-mini {
        font-size: 32px;
        position: absolute;
        left: 0;
        top: 0;
      }
    }
  }
  .mini-player.mini-enter-active {
    transition: all 0.4s;
  }
  .mini-player.mini-leave-active {
    transition: all 0.4s;
  }
  .mini-player.mini-enter {
    opacity: 0;
  }
  .mini-player.mini-leave-to {
    opacity: 0;
  }
  @keyframes rotate {
    0% {
      transform: rotate(0);
    }
    100% {
      transform: rotate(360deg);
    }
  }
}
</style>
