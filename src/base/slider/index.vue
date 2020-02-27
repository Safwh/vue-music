<template>
  <div class="slider" ref="slider">
    <div class="slider-group" ref="sliderGroup">
      <slot></slot>
    </div>
    <div class="dots">
      <span
        v-for="(item, index) in dots"
        :key="index"
        class="dot"
        :class="{ active: currentPageIndex === index }"
      ></span>
    </div>
  </div>
</template>

<script>
import BScroll from "better-scroll";
import { addClass } from "utils/dom.js";

export default {
  name: "Slider",
  // 给slider组件几个初始值
  props: {
    // 是否可以轮播
    loop: {
      type: Boolean,
      default: true
    },
    // 自动轮播
    autoPlay: {
      type: Boolean,
      default: true
    },
    // 自动录播间隔
    interval: {
      type: Number,
      default: 3000
    }
  },
  data() {
    return {
      dots: [],
      currentPageIndex: 0 // 当前是哪张轮播图
    };
  },
  methods: {
    // 设置slider宽度
    _setSliderWidth(isResize) {
      // 获取sliderGroup下children的dom
      this.children = this.$refs.sliderGroup.children;
      let width = 0;
      // 轮播图宽度是一个屏幕宽度，slider的宽度=所有轮播图宽度之和
      let sliderWidth = this.$refs.slider.clientWidth;
      // 计算整个轮播的视口应该有多宽
      for (let i = 0; i < this.children.length; i++) {
        let child = this.children[i];
        // 轮播组件设置样式，让img自适应宽度
        addClass(child, "slider-item");

        child.style.width = sliderWidth + "px";
        width += sliderWidth;
      }
      // 因为bscroll为了无缝切换轮播，会前后克隆一个child，所以我们算宽度要加两个，如果是窗口改变，那么不增加，之前已经加过了
      if (this.loop && !isResize) {
        width += 2 * sliderWidth;
      }
      this.$refs.sliderGroup.style.width = width + "px";
    },
    // 初始化better-scroll
    _initSlider() {
      this.slider = new BScroll(this.$refs.slider, {
        scrollX: true, // 横向滚动
        scrollY: false, // 不允许纵向滚动
        momentum: false, // 当快速滑动时是否开启滑动惯性
        snap: {
          loop: this.loop, // 是否可以无缝循环轮播
          threshold: 0.3, // 手动切换时的阈值
          speed: 400 // 轮播图切换的动画时间
        },
        click: true // 是否派发click事件
      });
      // 每次轮播图滚动完毕的时候better-scroll会派发一个scrollEnd事件
      this.slider.on("scrollEnd", () => {
        let pageIndex = this.slider.getCurrentPage().pageX; // getCurrentPage().pageX示横轴方向的页面数
        this.currentPageIndex = pageIndex;
        // 手动滑动一下, 删除定时器, 防止手动滑动后立即自动滑动
        if (this.autoPlay) {
          clearTimeout(this.timer);
          this._play();
        }
      });
    },
    // 初始化小圆点
    _initDots() {
      this.dots = new Array(this.children.length); // 一个长度为this.children的空数组
    },
    // 自动轮播处理
    _play() {
      this.timer = setTimeout(() => {
        this.slider.next(); // 滚动到下一页
        // this.slider.goToPage(pageIndex, 0, 400); // goToPage滚动到指定的页面。
      }, this.interval);
    }
  },
  // 实例被挂载后调用
  mounted() {
    // $nextTick 是在下次 DOM 更新循环结束之后执行延迟回调，在修改数据之后使用 $nextTick，则可以在回调中获取更新后的 DOM
    this.$nextTick(function() {
      this._setSliderWidth();
      this._initDots(); // 在初始化better-scroll之前, 初始化小圆点,因为better-scroll会克隆两个节点
      this._initSlider();
      if (this.autoPlay) {
        this._play();
      }
    });
    // 绑定窗口改变大小事件
    window.addEventListener("resize", () => {
      // slider未初始化, 直接返回
      if (!this.slider) {
        return;
      }
      this._setSliderWidth(true);
      this.slider.refresh(); // 重新计算 better-scroll，当 DOM 结构发生变化的时候务必要调用确保滚动的效果正常。
    });
    // this.$nextTick和setTimeout随便选一种
    //  // 浏览器的刷新通常是17毫秒一次，初始化操作放在20毫秒后，比较保险
    // setTimeout(() => {
    //   this._setSliderWidth();
    //   this._initSlider();
    // }, 20);
  },
  // 被 keep-alive 缓存的组件激活时调用。
  activated() {
    if (this.autoPlay) {
      this._play();
    }
  },
  // 被 keep-alive 缓存的组件停用时调用
  deactivated() {
    clearTimeout(this.timer);
  }
};
</script>

<style lang="scss" scoped>
@import "common/style/variable";
.slider {
  min-height: 1px;
  .slider-group {
    position: relative;
    overflow: hidden;
    white-space: nowrap;
    .slider-item {
      float: left;
      box-sizing: border-box;
      overflow: hidden;
      text-align: center;
      a {
        display: block;
        width: 100%;
        overflow: hidden;
        text-decoration: none;
      }
      img {
        display: block;
        width: 100%;
      }
    }
  }
  .dots {
    position: absolute;
    right: 0;
    left: 0;
    bottom: 12px;
    text-align: center;
    font-size: 0;
    .dot {
      display: inline-block;
      margin: 0 4px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: $color-text-l;
      &.active {
        width: 20px;
        border-radius: 5px;
        background: $color-text-ll;
      }
    }
  }
}
</style>
