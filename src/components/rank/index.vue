<template>
  <div class="rank" ref="rank">
    <Scroll :data="topList" class="toplist" ref="toplist">
      <ul>
        <template v-for="groupItem in topList">
          <li
            @click="selectItem(item)"
            class="item"
            v-for="item in groupItem.toplist"
            :key="item.topId"
          >
            <div class="icon">
              <img v-lazy="item.frontPicUrl" width="100" height="100" alt="" />
            </div>
            <ul class="songlist">
              <li
                v-for="(song, index) in item.song"
                class="song"
                :key="song.id"
              >
                <span>{{ index + 1 }}</span>
                <span>{{ ` ${song.title} - ${song.singerName}` }}</span>
              </li>
            </ul>
          </li>
        </template>
      </ul>
      <!-- loaging -->
      <div class="loading-container" v-show="!topList.length">
        <Loading />
      </div>
    </Scroll>
    <!-- 子路由显示区域 -->
    <router-view></router-view>
  </div>
</template>

<script>
import { getTopList } from "api/rank.js";
import { ERR_OK } from "api/config.js";
import Scroll from "src/base/scroll";
import Loading from "src/base/loading";
import { playlistMixin } from "common/js/mixin.js";
import { mapMutations } from "vuex";
export default {
  name: "Rank",
  components: {
    Scroll,
    Loading
  },
  mixins: [playlistMixin],
  data() {
    return {
      topList: []
    };
  },
  created() {
    this._getTopList();
  },
  methods: {
    // 获取排行榜数据
    _getTopList() {
      getTopList().then(res => {
        if (res.data.code === ERR_OK) {
          this.topList = res.data.topList.data.group;
        }
      });
    },
    // 利用mixin 解决迷你播放器显示导致遮挡Scroll
    handlePlaylist(playList) {
      const bottom = playList.length ? "60px" : "";
      this.$refs.rank.style.bottom = bottom;
      this.$refs.toplist.refresh();
    },
    // 点击榜单
    selectItem(item) {
      this.$router.push({
        path: `/rank/${item.topId}`
      });
      this.setTopList(item);
    },
    ...mapMutations({
      setTopList: "SET_TOP_LIST"
    })
  }
};
</script>

<style lang="scss" scoped>
@import "common/style/variable.scss";
@import "common/style/mixin.scss";
.rank {
  position: fixed;
  width: 100%;
  top: 88px;
  bottom: 0;
  .toplist {
    height: 100%;
    overflow: hidden;
    .item {
      display: flex;
      margin: 0 20px;
      padding-top: 20px;
      height: 100px;
      &:last-child {
        padding-bottom: 20px;
      }
      .icon {
        flex: 0 0 100px;
        width: 100px;
        height: 100px;
      }
      .songlist {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 0 20px;
        height: 100px;
        overflow: hidden;
        background: $color-highlight-background;
        color: $color-text-d;
        font-size: $font-size-small;
        .song {
          line-height: 26px;
        }
      }
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
