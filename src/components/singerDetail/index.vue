<template>
  <transition name="slide">
    <MusicList :songs="songs" :title="title" :bgImage="bgImage" />
  </transition>
</template>

<script>
import MusicList from "components/musicList";
import { mapGetters } from "vuex";
import { getSingerDetail, getPlayMusic } from "api/singer.js";
import { createSong } from "common/js/song.js";
import { ERR_OK } from "api/config.js";
export default {
  name: "singerDetail",
  components: {
    MusicList
  },
  data() {
    return {
      songs: [],
      songmids: []
    };
  },
  computed: {
    title() {
      return (
        this.singer.name ||
        JSON.parse(window.sessionStorage.getItem("singer")).name
      );
    },
    bgImage() {
      return (
        this.singer.avatar ||
        JSON.parse(window.sessionStorage.getItem("singer")).avatar
      );
    },

    ...mapGetters(["singer"])
  },
  watch: {
    songmids() {
      this._normalizeSongsPlayUrl(this.songmids);
    }
  },
  created() {
    this._getDetail();
  },
  methods: {
    // 获取歌手详情
    _getDetail() {
      let id = this.singer.id || this.$route.params.id;
      if (!id) {
        this.$router.push("/singer");
        return;
      }
      getSingerDetail(id).then(res => {
        if (res.code === ERR_OK) {
          this.songs = this._normalizeSongs(res.data.list);
        }
      });
    },
    // song数据处理
    _normalizeSongs(list) {
      let ret = [];
      let songmids = [];
      list.forEach(item => {
        let { musicData } = item;
        if (musicData.songid && musicData.albummid) {
          ret.push(createSong(musicData));
          songmids.push(musicData.songmid);
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
@import "common/style/variable";

.slide-enter-active,
.slide-leave-active {
  transition: all 0.1s;
}

.slide-enter,
.slide-leave-to {
  transform: translate3d(100%, 0, 0);
}
</style>
