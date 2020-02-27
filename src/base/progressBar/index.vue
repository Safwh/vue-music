<template>
  <div @click="progressClick" class="progress-bar" ref="progressBar">
    <div class="bar-inner">
      <div class="progress" ref="progress"></div>
      <div
        class="progress-bar-wrapper"
        ref="progressBtn"
        @touchstart.prevent="progressTouchStart"
        @touchmove.prevent="progressTouchMove"
        @touchend="progressTouchEnd"
      >
        <div class="progress-btn"></div>
      </div>
    </div>
  </div>
</template>

<script>
const progressBtnWidth = 16;
export default {
  name: "ProgressBar",
  props: {
    // 歌曲进度百分比
    percent: {
      type: Number,
      default: 0
    }
  },
  watch: {
    // 歌曲进度百分比
    percent(newPrecent) {
      // 因为拖动时改变进度条冲突(一拖动,小圆点回弹),加一个条件
      if (newPrecent > 0 && !this.touch.initiated) {
        // 进度条总宽度 - 小圆点宽度
        const progressBarWidth =
          this.$refs.progressBar.clientWidth - progressBtnWidth;
        const offsetWidth = newPrecent * progressBarWidth;
        this._offset(offsetWidth);
      }
    }
  },
  created() {
    this.touch = {};
  },
  methods: {
    progressTouchStart(e) {
      this.touch.initiated = true; // 一个标志位
      this.touch.startX = e.touches[0].pageX; // 记录点击位置
      this.touch.left = this.$refs.progress.clientWidth; // 当前进度条已经偏移位置
    },
    progressTouchMove(e) {
      if (!this.touch.initiated) {
        return;
      }
      const deltaX = e.touches[0].pageX - this.touch.startX;
      // 设置左右拖动限制
      const offsetWidth = Math.min(
        this.$refs.progressBar.clientWidth - progressBtnWidth,
        Math.max(0, this.touch.left + deltaX)
      );
      this._offset(offsetWidth);
    },
    progressTouchEnd() {
      this.touch.initiated = false;
      this._triggerPercent();
    },
    // 点击进度条
    progressClick(e) {
      // this._offset(e.offsetX);
      const rect = this.$refs.progressBar.getBoundingClientRect();
      const offset = e.pageX - rect.left;
      this._offset(offset);
      this._triggerPercent();
    },
    // 进度条和小圆点设置偏移
    _offset(offsetWidth) {
      this.$refs.progress.style.width = `${offsetWidth}px`;
      this.$refs.progressBtn.style.transform = `translate3d(${offsetWidth}px, 0, 0)`;
    },
    // 拖动小圆点结束,派发一个percent改变事件
    _triggerPercent() {
      const progressBarWidth =
        this.$refs.progressBar.clientWidth - progressBtnWidth;
      const percent = this.$refs.progress.clientWidth / progressBarWidth;
      this.$emit("percentChange", percent);
    }
  }
};
</script>

<style lang="scss" scoped>
@import "common/style/variable.scss";
.progress-bar {
  height: 30px;
  .bar-inner {
    position: relative;
    top: 13px;
    height: 4px;
    background: rgba(0, 0, 0, 0.3);
    .progress {
      position: absolute;
      height: 100%;
      background: $color-theme;
    }
    .progress-bar-wrapper {
      position: absolute;
      left: -8px;
      top: -13px;
      width: 30px;
      height: 30px;
      .progress-btn {
        position: relative;
        top: 7px;
        left: 7px;
        box-sizing: border-box;
        width: 16px;
        height: 16px;
        border: 3px solid $color-text;
        border-radius: 50%;
        background: $color-theme;
      }
    }
  }
}
</style>
