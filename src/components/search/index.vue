<template>
  <div class="search">
    <!-- 搜索框区域 -->
    <div class="search-box-wrapper">
      <SearchBox @query="onQueryChange" ref="searchBox" />
    </div>
    <!-- 热门搜索和搜索历史区域 -->
    <div v-show="!query" ref="shortcutWrapper" class="shortcut-wrapper">
      <Scroll ref="shortcut" :data="shortcut" class="shortcut">
        <div>
          <!-- 热门搜索区域 -->
          <div class="hot-key">
            <h1 class="title">热门搜索</h1>
            <ul>
              <li
                @click="addQuery(item.k)"
                v-for="item in hotKey"
                :key="item.n"
                class="item"
              >
                <span>{{ item.k }}</span>
              </li>
            </ul>
          </div>
          <!-- 搜素历史区域 -->
          <div v-show="searchHistory.length" class="search-history">
            <h1 class="title">
              <span class="text">搜素历史</span>
              <span @click="showConfirm" class="clear">
                <i class="icon-clear"></i>
              </span>
            </h1>
            <SearchList
              @select="addQuery"
              @delete="deleteOne"
              :searches="searchHistory"
            />
          </div>
        </div>
      </Scroll>
    </div>
    <!-- 搜索结果区域 -->
    <div v-show="query" ref="searchResult" class="search-result">
      <Suggest
        @select="saveHistory"
        @listScroll="blurInput"
        :query="query"
        ref="suggest"
      />
    </div>
    <Confirm
      @confirm="clearSearchHistory"
      text="是否清空所有搜索历史"
      confirmBtnText="清空"
      ref="confirm"
    />
    <!--  -->
    <router-view></router-view>
  </div>
</template>

<script>
import { getHotKey } from "api/search.js";
import { ERR_OK } from "api/config.js";
import SearchBox from "src/base/searchBox";
import Suggest from "components/suggest";
import SearchList from "src/base/searchList";
import Confirm from "src/base/confirm";
import Scroll from "src/base/scroll";
import { mapActions } from "vuex";
import { playlistMixin, searchMixin } from "common/js/mixin";
export default {
  name: "Search",
  mixins: [playlistMixin, searchMixin],
  components: {
    SearchBox,
    Suggest,
    SearchList,
    Confirm,
    Scroll
  },
  data() {
    return {
      hotKey: [] // 热门数据
    };
  },
  computed: {
    // 当hotkey或者searchHistory只要改变一个 , 重新计算 Scroll
    shortcut() {
      return this.hotKey.concat(this.searchHistory);
    }
  },
  watch: {
    // 如果是从搜索列表切页面回来，要手动刷新一下
    query(newQuery) {
      if (!newQuery) {
        setTimeout(() => {
          this.$refs.shortcut.refresh();
        }, 20);
      }
    }
  },
  created() {
    this._getHotKey();
  },
  methods: {
    // 获取热门搜索数据
    _getHotKey() {
      getHotKey().then(res => {
        if (res.code === ERR_OK) {
          this.hotKey = res.data.hotkey.slice(0, 10); // 截取前10个数据 slice浅拷贝不改变原数组
        }
      });
    },
    // 点击搜索历史列表某项删除 派发的deltet事件
    deleteOne(item) {
      this.deleteSearchHistory(item);
    },
    // 显示确认弹窗
    showConfirm() {
      this.$refs.confirm.show();
    },
    // 存在mini播放器, 重新计算scroll高度
    handlePlaylist(playlist) {
      const bottom = playlist.length > 0 ? "60px" : "";
      this.$refs.shortcutWrapper.style.bottom = bottom;
      this.$refs.shortcut.refresh();
      this.$refs.searchResult.style.bottom = bottom;
      this.$refs.suggest.refresh();
    },
    ...mapActions(["clearSearchHistory"])
  }
};
</script>

<style lang="scss" scoped>
@import "common/style/variable.scss";
.search {
  .search-box-wrapper {
    margin: 20px;
  }
  .shortcut-wrapper {
    position: fixed;
    top: 178px;
    bottom: 0;
    width: 100%;
    .shortcut {
      height: 100%;
      overflow: hidden;
      .hot-key {
        margin: 0 20px 20px 20px;
        .title {
          margin-bottom: 20px;
          font-size: $font-size-medium;
          color: $color-text-l;
        }
        .item {
          display: inline-block;
          padding: 5px 10px;
          margin: 0 20px 10px 0;
          border-radius: 6px;
          background: $color-highlight-background;
          font-size: $font-size-medium;
          color: $color-text-d;
        }
      }
      .search-history {
        position: relative;
        margin: 0 20px;
        .title {
          display: flex;
          align-items: center;
          height: 40px;
          font-size: $font-size-medium;
          color: $color-text-l;
          .text {
            flex: 1;
          }
          .clear {
            .icon-clear {
              font-size: $font-size-medium;
              color: $color-text-d;
            }
          }
        }
      }
    }
  }
  .search-result {
    position: fixed;
    width: 100%;
    top: 178px;
    bottom: 0;
  }
}
</style>
