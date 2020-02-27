<template>
  <div class="recommend" ref="recommend">
    <Scroll ref="scroll" class="recommend-content" :data="discList">
      <div>
        <!-- 轮播图区域 -->
        <div v-if="recommends.length" class="slider-wrapper">
          <slider>
            <template>
              <div v-for="item in recommends" :key="item.id">
                <a :href="item.linkUrl">
                  <img @load="imgLoad" :src="item.picUrl" alt="" />
                </a>
              </div>
            </template>
          </slider>
        </div>
        <!-- 歌单区域 -->
        <div class="recommend-list">
          <h1 class="list-title">热门歌单推荐</h1>
          <ul>
            <li
              @click="selectItem(item)"
              v-for="item in discList"
              :key="item.content_id"
              class="item"
            >
              <div class="icon">
                <img width="60px" height="60px" v-lazy="item.cover" alt="" />
              </div>
              <div class="text">
                <h2 class="name">{{ item.title }}</h2>
                <p class="desc">{{ item.username }}</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div class="loading-container" v-show="!discList.length">
        <Loading />
      </div>
    </Scroll>
    <router-view></router-view>
  </div>
</template>

<script>
import Slider from "src/base/slider";
import Scroll from "src/base/scroll";
import Loading from "src/base/loading";
import { playlistMixin } from "common/js/mixin.js";
import { mapMutations } from "vuex";

import { getRecommend, getDiscList } from "api/recommend.js";
import { ERR_OK } from "api/config.js";

export default {
  name: "Recommend",
  mixins: [playlistMixin],
  components: {
    Slider,
    Scroll,
    Loading
  },
  data() {
    return {
      // 轮播图数据
      recommends: [],
      // 歌单数据
      discList: []
    };
  },
  created() {
    this._getRecommend();
    this._getDiscList();
  },
  methods: {
    // 点击歌单
    selectItem(item) {
      this.$router.push({
        path: `/recommend/${item.content_id}`
      });
      this.setDisc(item);
    },
    // 利用mixin 解决迷你播放器显示导致遮挡Scroll
    handlePlaylist(playlist) {
      const bottom = playlist.length > 0 ? "60px" : "";
      this.$refs.recommend.style.bottom = bottom;
      this.$refs.scroll.refresh();
    },
    // 获取轮播图数据
    _getRecommend() {
      getRecommend().then(res => {
        if (res.code === ERR_OK) {
          this.recommends = res.data.slider;
        }
      });
    },
    // 获取歌单数据
    _getDiscList() {
      getDiscList().then(res => {
        if (res.data.code === ERR_OK) {
          this.discList = res.data.recomPlaylist.data.v_hot;
        }
      });
    },
    // 图片加载完成回调
    /* 因为图片加载时异步的, 所有保证better-scroll能够正常的滑动,添加img的load事件,在load事件中,轮播图区域的高度就出来了 */
    imgLoad() {
      // 图片很多, 设置一个标志位checkLoaded, 第一张图片加载完成, 设为true, 后面就不执行, 提高效率
      if (!this.checkLoaded) {
        this.$refs.scroll.refresh();
        this.checkLoaded = true;
      }
    },
    ...mapMutations({
      setDisc: "SET_DISC"
    })
  },
  mounted() {}
};
</script>

<style lang="scss" scoped>
@import "common/style/variable";
.recommend {
  position: fixed;
  width: 100%;
  top: 88px;
  bottom: 0;
  .recommend-content {
    height: 100%;
    overflow: hidden;
    .slider-wrapper {
      position: relative;
      width: 100%;
      overflow: hidden;
    }
    .recommend-list {
      .list-title {
        height: 65px;
        line-height: 65px;
        text-align: center;
        font-size: $font-size-medium;
        color: $color-theme;
      }
      .item {
        display: flex;
        box-sizing: border-box;
        align-items: center;
        padding: 0 20px 20px 20px;
        .icon {
          flex: 0 0 60px; // flex是flex-grow(划分剩余空间),flex-shrink(超出容器空间收缩比例),flex-basis(伸缩基准值-分配多余空间之前，项目占据的主轴空间)三个属性值的缩写
          width: 60px;
          padding-right: 20px;
        }
        .text {
          display: flex;
          flex-direction: column;
          justify-content: center;
          flex: 1;
          line-height: 20px;
          overflow: hidden;
          font-size: $font-size-medium;
          .name {
            margin-bottom: 10px;
            color: $color-text;
          }
          .desc {
            color: $color-text-d;
          }
        }
      }
    }
    .loading-container {
      position: absolute;
      width: 100%;
      top: 50%;
      transform: translateY(-50);
    }
  }
}
</style>
