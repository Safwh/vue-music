<template>
  <div ref="wrapper">
    <slot></slot>
  </div>
</template>

<script>
import BScroll from "better-scroll";
export default {
  name: "Scroll",
  props: {
    // 当 probeType 为 1 的时候，会非实时（屏幕滑动超过一定时间后）派发scroll 事件
    probeType: {
      type: Number,
      default: 1
    },
    click: {
      type: Boolean,
      default: true
    },
    // 外部传入数据, 数据改变 , 重新计算scroll
    data: {
      type: Array,
      default: null
    },
    // 监听滚动事件
    listenScroll: {
      type: Boolean,
      default: false
    },
    // 上拉刷新
    pullup: {
      type: Boolean,
      default: false
    },
    // 滚动一开始会派发一个beforeScroll事件
    beforeScroll: {
      type: Boolean,
      default: false
    },
    // 重新计算scroll延时
    refreshDelay: {
      type: Number,
      default: 20
    }
  },
  watch: {
    // 监听data变化, 变化调用refresh
    data() {
      this.$nextTick(function() {
        this.refresh();
      });
      // 如果此处使用的setTimeOut
      // setTimeout(() => {
      //   this.refresh();
      // }, this.refreshDelay);
    }
  },
  methods: {
    // 初始化 better-scroll
    _initScroll() {
      // 组件未渲染, 直接返回
      if (!this.$refs.wrapper) {
        return;
      }
      // 初始化 bscroll
      this.scroll = new BScroll(this.$refs.wrapper, {
        probeType: this.probeType,
        click: this.click
      });
      if (this.listenScroll) {
        this.scroll.on("scroll", pops => {
          this.$emit("scroll", pops);
        });
      }
      if (this.pullup) {
        this.scroll.on("scrollEnd", () => {
          if (this.scroll.y <= this.scroll.maxScrollY + 50) {
            this.$emit("scrollToEnd");
          }
        });
      }
      if (this.beforeScroll) {
        this.scroll.on("beforeScrollStart", () => {
          this.$emit("beforeScroll");
        });
      }
    },
    // 启用 better-scroll, 默认 开启。
    enable() {
      this.scroll && this.scroll.enable();
    },
    // 禁用 better-scroll，DOM 事件（如 touchstart、touchmove、touchend）的回调函数不再响应。
    disable() {
      this.scroll && this.scroll.disable();
    },
    // 重新计算 better-scroll，当 DOM 结构发生变化的时候务必要调用确保滚动的效果正常
    refresh() {
      this.scroll && this.scroll.refresh();
    },
    // 滚动到指定的位置
    scrollTo() {
      this.scroll && this.scroll.scrollTo.apply(this.scroll, arguments); // arguments 是一个对应于传递给函数的参数的类数组对象
    },
    // 滚动到指定的目标元素
    scrollToElement() {
      this.scroll && this.scroll.scrollToElement.apply(this.scroll, arguments);
    }
  },
  mounted() {
    // $nextTick 是在下次 DOM 更新循环结束之后执行延迟回调，在修改数据之后使用
    this.$nextTick(function() {
      this._initScroll();
    });
  }
};
</script>

<style lang="scss" scoped></style>
