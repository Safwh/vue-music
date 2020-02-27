<template>
  <div class="singer" ref="singer">
    <ListView @select="selectSinger" :data="singers" ref="list" />
    <router-view></router-view>
  </div>
</template>

<script>
import { getSingerList } from "api/singer.js";
import { ERR_OK } from "api/config.js";
import Singer from "common/js/singer.js";
import ListView from "src/base/listView";
import { mapMutations } from "vuex";
import { playlistMixin } from "common/js/mixin.js";

const HOT_NAME = "热门";
const HOT_SINGER_LEN = 10;

export default {
  name: "Singer",
  mixins: [playlistMixin],
  components: {
    ListView
  },
  data() {
    return {
      singers: []
    };
  },
  methods: {
    // 利用mixin 解决迷你播放器显示导致遮挡Scroll
    handlePlaylist(playlist) {
      const bottom = playlist.length > 0 ? "60px" : "";
      this.$refs.singer.style.bottom = bottom;
      this.$refs.list.refresh();
    },
    // 点击一个歌手
    selectSinger(singer) {
      this.setSinger(singer);
      this.$router.push(`/singer/${singer.id}`);
    },
    // 获取歌手数据
    _getSingerList() {
      getSingerList().then(res => {
        if (res.code === ERR_OK) {
          this.singers = this._normalizeSinger(res.data.list);
        }
      });
    },
    // 处理歌手数据
    _normalizeSinger(list) {
      let map = {
        hot: {
          title: HOT_NAME,
          items: []
        }
      };
      list.forEach((item, index) => {
        // 取前十条数据当作热门
        if (index < HOT_SINGER_LEN) {
          map.hot.items.push(new Singer(item.Fsinger_mid, item.Fsinger_name));
        }
        // [A-Z]索引
        const key = item.Findex;
        // 如果索引不存在, 就添加到map中
        if (!map[key]) {
          map[key] = {
            title: key,
            items: []
          };
        }
        // 把数据添加到索引对应的对象中
        map[key].items.push(new Singer(item.Fsinger_mid, item.Fsinger_name));
      });
      // 因为对象是无序的, 所以要对map对象数据做处理
      let hot = [];
      let ret = [];
      for (let key in map) {
        let val = map[key];
        if (/[a-zA-Z]/.test(val.title)) {
          ret.push(val);
        } else if (val.title === HOT_NAME) {
          hot.push(val);
        }
      }
      // 对ret数组做A-Z排序
      ret.sort((a, b) => {
        return a.title.charCodeAt(0) - b.title.charCodeAt(0); // charCodeAt() 方法返回0到65535之间的整数(Unicode )
      });
      return hot.concat(ret); // concat() 方法用于合并两个或多个数组。此方法不会更改现有数组，而是返回一个新数组。
    },
    ...mapMutations({
      setSinger: "SET_SINGER"
    })
  },
  created() {
    this._getSingerList();
  }
};
</script>

<style lang="scss" scoped>
.singer {
  position: fixed;
  top: 88px;
  bottom: 0;
  width: 100%;
}
</style>
