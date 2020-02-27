<template>
  <transition name="slide">
    <MusicList :songs="songs" :title="title" :bgImage="bgImage"></MusicList>
  </transition>
</template>

<script>
import MusicList from "components/musicList";
import { getSongList } from "api/recommend.js";
import { getPlayMusic } from "api/singer.js";
import { ERR_OK } from "api/config.js";
import { createSong } from "common/js/song.js";
import { mapGetters } from "vuex";
export default {
  name: "Disc",
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
      return this.disc.title;
    },
    bgImage() {
      return this.disc.cover;
    },
    ...mapGetters(["disc"])
  },
  watch: {
    songmids() {
      this._normalizeSongsPlayUrl(this.songmids);
    }
  },
  created() {
    this._getSongList();
  },
  methods: {
    // 获取歌单详情
    _getSongList() {
      if (!this.disc.content_id) {
        this.$router.push("/recommend");
        return;
      }
      getSongList(this.disc.content_id).then(res => {
        if (res.data.code === ERR_OK) {
          this.songs = this._normalizeSongs(res.data.cdlist[0].songlist);
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
  transition: all 0.1s;
}

.slide-enter,
.slide-leave-to {
  transform: translate3d(100%, 0, 0);
}
</style>
