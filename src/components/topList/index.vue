<template>
  <transition name="slide">
    <MusicList
      :rank="rank"
      :title="title"
      :bgImage="bgImage"
      :songs="songs"
    ></MusicList>
  </transition>
</template>

<script>
import MusicList from "components/musicList";
import { mapGetters } from "vuex";
import { getMusicList } from "api/rank.js";
import { getPlayMusic } from "api/singer.js";
import { ERR_OK } from "api/config.js";
import { createSong } from "common/js/song.js";
export default {
  name: "TopList",
  components: {
    MusicList
  },
  data() {
    return {
      rank: true,
      songs: [],
      songmids: []
    };
  },
  computed: {
    // 标题
    title() {
      return this.topList.title;
    },
    // 背景图
    bgImage() {
      return this.topList.mbFrontPicUrl;
    },

    ...mapGetters(["topList"])
  },
  watch: {
    songmids() {
      this._normalizeSongsPlayUrl(this.songmids);
    }
  },
  created() {
    this._getMusicList();
  },
  methods: {
    // 获取某榜单详情数据
    _getMusicList() {
      if (!this.topList.topId) {
        this.$router.push("/rank");
        return;
      }
      getMusicList(this.topList.topId).then(res => {
        if (res.data.code === ERR_OK) {
          this.songs = this._normalizeSongs(res.data.detail.data.songInfoList);
        }
      });
    },
    // song数据处理
    _normalizeSongs(list) {
      let ret = [];
      let songmids = [];
      list.forEach(musicData => {
        if (musicData.id && musicData.mid) {
          ret.push(createSong(musicData));
          songmids.push(musicData.mid);
        }
      });
      this.songmids = songmids;
      return ret;
    },
    // 处理播放地址
    _normalizeSongsPlayUrl(list) {
      getPlayMusic(list).then(res => {
        if (res.data.code === ERR_OK) {
          let sip = res.data.req_0.data.sip;
          let midurlinfo = res.data.req_0.data.midurlinfo;
          midurlinfo.forEach((item, index) => {
            let url = sip[0] + item.purl;
            this.songs[index].url = url;
          });
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.1s ease;
}

.slide-enter,
.slide-leave-to {
  transform: translate3d(100%, 0, 0);
}
</style>
