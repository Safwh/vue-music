<template>
  <Scroll
    :data="result"
    :beforeScroll="beforeScroll"
    @beforeScroll="listScroll"
    class="suggest"
    :pullup="pullup"
    @scrollToEnd="searchMore"
    ref="suggest"
  >
    <ul class="suggest-list">
      <li
        @click="selectItem(item)"
        v-for="item in result"
        :key="item.id"
        class="suggest-item"
      >
        <template v-if="isSongerOrMusic(item)">
          <div class="item-box">
            <div class="item-media">
              <img
                class="item-img"
                :src="getSingerPic(item.singermid)"
                alt=""
              />
            </div>
            <div class="item-bd">
              <h3 class="item-til">{{ `歌手:${item.singername}` }}</h3>
              <p class="item-desc">
                <span class="item-txt">{{ `歌曲:${item.songnum}` }}</span>
                <span class="item-txt">{{ `专辑:${item.albumnum}` }}</span>
              </p>
            </div>
          </div>
        </template>
        <template v-else class="icon">
          <div class="icon">
            <i class="icon-music"></i>
          </div>
          <div class="name">
            <p class="text">{{ item.name }}</p>
          </div>
        </template>
      </li>
      <loading v-show="hasMore"></loading>
    </ul>
    <div v-show="!hasMore && !result.length" class="no-result-wrapper">
      <NoResult title="抱歉 暂无搜索结果" />
    </div>
  </Scroll>
</template>

<script>
import { search } from "api/search.js";
import { getPlayMusic } from "api/singer.js";
import { ERR_OK } from "api/config.js";
import { createSong } from "common/js/song.js";
import Singer from "common/js/singer.js";
import { mapMutations, mapActions } from "vuex";
import Scroll from "src/base/scroll";
import NoResult from "src/base/noResult";
import Loading from "src/base/loading";
const TYPE_SINGER = "singer";
const perpage = 20; // 每页显示数量
export default {
  name: "Suggest",
  components: {
    Scroll,
    NoResult,
    Loading
  },
  props: {
    // 搜索关键字
    query: {
      type: String,
      default: ""
    },
    // 搜索结果显示歌手
    showSinger: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      page: 1, // 搜索页码
      result: [], // 搜索结果数据
      pullup: true, // 上拉刷新
      hasMore: true, // 标志位, 是否有更多数据
      beforeScroll: true //  滚动一开始派发beforeScroll事件, (目的, 滚动收起输入键盘)
    };
  },
  watch: {
    query() {
      this._search();
    }
  },
  created() {
    this._search();
  },
  methods: {
    // 搜索
    _search() {
      if (this.query === "") {
        this.result = [];
        return;
      }
      this.page = 1; // query每次改变 page都要重置为1
      this.$refs.suggest.scrollTo(0, 0); // 并且scroll位置重置到顶部
      this.hasMore = true;
      search(this.query, this.page, this.showSinger, perpage).then(res => {
        if (res.data.code === ERR_OK) {
          this.result = this._getResult(res.data.data);
          this._checkMore(res.data.data);
        }
      });
    },
    // 对搜索数据处理, (歌手和歌曲)
    _getResult(data) {
      let ret = [];
      if (data.zhida && data.zhida.singerid && data.song.curpage === 1) {
        ret.push({ ...data.zhida, ...{ type: TYPE_SINGER } });
      }
      if (data.song) {
        // concat() 方法用于合并两个或多个数组。此方法不会更改现有数组，而是返回一个新数组。
        ret = ret.concat(this._normalizeSongs(data.song.list));
      }
      return ret;
    },
    // 检查是否有更多数据
    _checkMore(data) {
      const song = data.song;
      if (!song.list.length || song.curnum * song.curpage >= song.totalnum) {
        this.hasMore = false;
      }
    },

    // 对搜索数据进一步处理
    _normalizeSongs(list) {
      let ret = [];
      let songmids = [];
      list.forEach(musicData => {
        if (musicData.songid && musicData.albumid) {
          ret.push(createSong(musicData));
          songmids.push(musicData.songmid);
        }
      });
      this._normalizeSongsPlayUrl(songmids, ret);
      return ret;
    },
    // 处理播放地址
    async _normalizeSongsPlayUrl(songmids, list) {
      await getPlayMusic(songmids).then(res => {
        if (res.data.code === ERR_OK) {
          let sip = res.data.req_0.data.sip;
          let midurlinfo = res.data.req_0.data.midurlinfo;
          midurlinfo.forEach((item, index) => {
            let url = sip[0] + item.purl;
            list[index].url = url;
          });
        }
      });
    },
    // 上拉搜索更多
    searchMore() {
      if (!this.hasMore) {
        return;
      }
      this.page++;
      search(this.query, this.page, this.showSinger, perpage).then(res => {
        if (res.data.code === ERR_OK) {
          // 加载更多的数据使用concat拼接 追加到上次的数据中
          this.result = this.result.concat(this._getResult(res.data.data));
          this._checkMore(res.data.data);
        }
      });
    },
    // 判断当前item是歌手数据还是歌曲数据, 返回对应样式
    getIconCls(item) {
      if (item.type === TYPE_SINGER) {
        return "icon-mine";
      } else {
        return "icon-music";
      }
    },
    // 判断当前item是歌手数据还是歌曲数据
    isSongerOrMusic(item) {
      if (item.type === TYPE_SINGER) {
        return true;
      } else {
        return false;
      }
    },
    // 获取歌手图片地址
    getSingerPic(singermid) {
      return `https://y.gtimg.cn/music/photo_new/T001R68x68M000${singermid}.jpg?max_age=2592000`;
    },
    // 选中一个item
    selectItem(item) {
      if (item.type === TYPE_SINGER) {
        const singer = new Singer(item.singermid, item.singername);
        this.$router.push({
          path: `/search/${singer.id}`
        });
        this.setSinger(singer);
      } else {
        this.insertSong(item);
      }
      this.$emit("select");
    },
    // 监听例表滚动
    listScroll() {
      this.$emit("listScroll");
    },
    // 重新渲染scroll
    refresh() {
      this.$refs.suggest.refresh();
    },
    ...mapMutations({
      setSinger: "SET_SINGER"
    }),
    ...mapActions(["insertSong"])
  }
};
</script>

<style lang="scss" scoped>
@import "common/style/variable.scss";
.suggest {
  height: 100%;
  overflow: hidden;
  .suggest-list {
    padding: 0 30px;
    .suggest-item {
      display: flex;
      align-items: center;
      padding-bottom: 20px;
      .item-box {
        display: flex;
        align-items: center;
        .item-media {
          width: 50px;
          height: 50px;
          flex: 0 0 50px;
          margin-right: 10px;
          .item-img {
            border-radius: 50%;
            object-fit: cover;
            width: 100%;
            height: 100%;
          }
        }
        .item-bd {
          flex: 1;
          color: $color-text-d;
          font-size: $font-size-medium;
          .item-til {
          }
          .item-desc {
            margin-top: 6px;
            .item-txt {
              margin-right: 8px;
            }
          }
        }
      }
    }
    .icon {
      flex: 0 0 30px;
      width: 30px;
      [class^="icon-"] {
        font-size: 14px;
        color: $color-text-d;
      }
    }
    .name {
      flex: 1;
      font-size: $font-size-medium;
      color: $color-text-d;
      overflow: hidden;
    }
  }
  .no-result-wrapper {
    position: absolute;
    width: 100%;
    top: 50%;
    transform: translateY(-50%);
  }
}
</style>
