<template>
  <Scroll
    class="listview"
    ref="listView"
    :data="data"
    :probeType="probeType"
    :listenScroll="listenScroll"
    @scroll="scroll"
  >
    <!-- 歌手列表 -->
    <ul>
      <li
        v-for="group in data"
        :key="group.id"
        class="list-group"
        ref="listGroup"
      >
        <h2 class="list-group-title">{{ group.title }}</h2>
        <ul>
          <li
            @click="selectItem(item)"
            v-for="item in group.items"
            :key="item.id"
            class="list-group-item"
          >
            <img v-lazy="item.avatar" alt="" class="avatar" />
            <span class="name">{{ item.name }}</span>
          </li>
        </ul>
      </li>
    </ul>
    <!-- 快速索引 -->
    <div
      class="list-shortcut"
      @touchstart="onShortcutTouchstart"
      @touchmove.stop.prevent="onShortcutTouchmove"
    >
      <ul>
        <li
          class="item"
          :class="{ current: currentIndex === index }"
          v-for="(item, index) in shortcutList"
          :key="item.id"
          :data-index="index"
        >
          {{ item }}
        </li>
      </ul>
    </div>
    <!-- 歌手列表顶部固定索引 -->
    <div class="list-fixed" v-show="fixedTitle" ref="fixed">
      <h1 class="fixed-title">
        {{ fixedTitle }}
      </h1>
    </div>
    <!-- loading -->
    <div v-show="!data.length" class="loading-container">
      <loading />
    </div>
  </Scroll>
</template>

<script>
import Scroll from "src/base/scroll";
import Loading from "src/base/loading";
import { setData } from "utils/dom";

const ANCHOR_HEIGHT = 18; // 索引中li元素的高度
const TITLE_HEIGHT = 30; // 顶部固定索引高度

export default {
  name: "ListView",
  components: {
    Scroll,
    Loading
  },
  props: {
    data: {
      type: Array,
      default: null
    }
  },
  data() {
    return {
      scrollY: -1, // 滑动距离
      currentIndex: 0, // 滑动对应当前索引
      diff: -1 // 一个listGroup和最上面固定的标题的滚动差，边界条件
    };
  },
  created() {
    // 在created中声明 touch, 是因为不需要观测touch的变化
    this.touch = {};
    this.probeType = 3; // 当 probeType 为 3 的时候，不仅在屏幕滑动的过程中，而且在 momentum 滚动动画运行过程中实时派发 scroll 事件
    this.listenScroll = true; //监听scroll事件
    this.listHeight = []; // 每个group高度
  },
  // 计算属性
  computed: {
    // 快速入口(索引)的数据
    shortcutList() {
      return this.data.map(item => {
        return item.title.substr(0, 1); // 热门是两个字, 只取一个热字
      });
    },
    fixedTitle() {
      // 当下拉滚动,顶部的固定索引隐藏
      if (this.scrollY > 0) {
        return "";
      }
      return this.data[this.currentIndex]
        ? this.data[this.currentIndex].title
        : "";
    }
  },
  watch: {
    data() {
      setTimeout(() => {
        this._claculateHeight();
      }, 20);
    },
    scrollY(newY) {
      // 下拉 newY正值, 上拉newY负值
      const listHeight = this.listHeight;
      // 当下拉, 滚动到顶部 newY > 0;
      if (newY > 0) {
        this.currentIndex = 0;
        return;
      }
      // 在中间部分滚动
      for (let i = 0; i < listHeight.length - 1; i++) {
        let height1 = listHeight[i];
        let height2 = listHeight[i + 1];
        if (-newY >= height1 && -newY < height2) {
          // console.log(`height1=${height1} height2=${height2} newY=${-newY}`);
          this.currentIndex = i;
          this.diff = height2 + newY;
          return;
        }
      }
      // 当上拉,滚动到底部,且-newY 大于最后一个元素上限
      this.currentIndex = listHeight.length - 2; //减2原因: listHeight元素要比[热A-Z]元素多一个, 又因为length不是从1开始计算,索引是从0开始, 所以减 2
    },
    // 观测diff的变化
    diff(newVal) {
      // 如果高度差大于0，并且小于一个标题快的line-height时计算 fixedTop 否则  fixedTop = 0
      let fixedTop =
        newVal > 0 && newVal < TITLE_HEIGHT ? newVal - TITLE_HEIGHT : 0;
      // 高度差大于TITLE_HEIGHT , 两者都为 0 (this.fixedTop第一次是undefined)
      if (this.fixedTop === fixedTop) {
        return;
      }
      this.fixedTop = fixedTop;
      // 顶部标题往上偏移
      this.$refs.fixed.style.transform = `translate3d(0, ${fixedTop}px, 0)`;
    }
  },
  methods: {
    refresh() {
      this.$refs.listView.refresh();
    },
    // 点击歌手项,派发点击事件
    selectItem(item) {
      this.$emit("select", item);
    },
    // 点击右侧索引,跳转到对应位置
    onShortcutTouchstart(e) {
      // 记录点击时的位置
      let firstTouch = e.touches[0];
      this.touch.y1 = firstTouch.pageY;
      // 获取索引并记录
      let currentIndex = setData(e.target, "index");
      this.touch.anchorIndex = currentIndex;
      this._scrollTo(currentIndex);
    },
    // 在右侧索引移动, (此处使用了stop和prevent, 阻止浏览器默认滑动行为和冒泡)
    onShortcutTouchmove(e) {
      // 计算当前位置和初始位置的差值,判断滚动到哪个位置
      // this.touch.y2 = e.touches
      let mouveTouch = e.touches[0];
      this.touch.y2 = mouveTouch.pageY;
      // 偏移差值 (number|0是向下取整, 和Math.floor(number)一样)
      let delta = ((this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT) | 0;
      let currentIndex = parseInt(this.touch.anchorIndex) + delta;
      this._scrollTo(currentIndex);
    },
    // scroll组件监听滚动事件触发
    scroll(pos) {
      this.scrollY = pos.y;
    },
    // 滚动处理函数
    _scrollTo(index) {
      // 点击div的padding的时候, 不响应
      if (!index && index !== 0) {
        // Boolean(0) = false
        return;
      }
      // 处理touchmove时顶部和底部超出边界情况
      if (index < 0) {
        index = 0;
      } else if (index > this.listHeight.length - 2) {
        index = this.listHeight.length - 2;
      }
      // this.scrollY = -this.listHeight[index];
      // 第二个参数 0, 表示立即滚动到对应位置
      this.$refs.listView.scrollToElement(this.$refs.listGroup[index], 0);
    },
    // 计算每个group高度
    _claculateHeight() {
      this.listHeight = [];
      const list = this.$refs.listGroup;
      let height = 0;
      this.listHeight.push(height);
      for (let i = 0; i < list.length; i++) {
        let item = list[i];
        height += item.clientHeight;
        this.listHeight.push(height);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import "common/style/variable";
.listview {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: $color-background;
  .list-group {
    padding-bottom: 30px;
    .list-group-title {
      height: 30px;
      line-height: 30px;
      padding-left: 20px;
      font-size: $font-size-small;
      color: $color-text-l;
      background: $color-highlight-background;
    }
    .list-group-item {
      display: flex;
      align-items: center;
      padding: 20px 0 0 30px;
      .avatar {
        width: 50px;
        height: 50px;
        border-radius: 50%;
      }
      .name {
        margin-left: 20px;
        color: $color-text-l;
        font-size: $font-size-medium;
      }
    }
  }
  .list-shortcut {
    position: absolute;
    z-index: 30;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    padding: 20px 0;
    border-radius: 10px;
    text-align: center;
    background: $color-background-d;
    font-family: Helvetica;
    .item {
      padding: 3px;
      line-height: 1;
      color: $color-text-l;
      font-size: $font-size-small;
      &.current {
        color: $color-theme;
      }
    }
  }
  .list-fixed {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    .fixed-title {
      height: 30px;
      line-height: 30px;
      padding-left: 20px;
      font-size: $font-size-small;
      color: $color-text-l;
      background: $color-highlight-background;
    }
  }
  .loading-container {
    position: absolute;
    width: 100%;
    top: 50%;
    transform: translateY(-50%);
  }
}
</style>
