import { getLyrics } from "api/singer.js";
import { ERR_OK } from "api/config.js";
import { Base64 } from "js-base64";

export class Song {
  constructor({ id, mid, singer, name, album, duration, image, url }) {
    this.id = id;
    this.mid = mid;
    this.singer = singer;
    this.name = name;
    this.album = album;
    this.duration = duration;
    this.image = image;
    this.url = url;
  }
  getLyric() {
    if (this.lyric) {
      return Promise.resolve(this.lyric);
    }
    return new Promise((resolve, reject) => {
      getLyrics(this.mid).then(res => {
        if (res.data.code === ERR_OK) {
          this.lyric = Base64.decode(res.data.lyric);
          resolve(this.lyric);
        } else {
          reject("no lyric");
        }
      });
    });
  }
}

export function createSong(musicData) {
  return new Song({
    id: musicData.songid || musicData.id,
    mid: musicData.songmid || musicData.mid,
    singer: filterSinger(musicData.singer),
    name: musicData.songname || musicData.name,
    album: musicData.albumname || (musicData.album ? musicData.album.name : ""), // 类似专辑名
    duration: musicData.interval || musicData.fnote, // 歌曲时长
    image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${musicData.albummid ||
      musicData.album.mid}.jpg?max_age=2592000`,
    url: `http://ws.stream.qqmusic.qq.com/${musicData.songid}.m4a?fromtag=46`
  });
}

export function filterSinger(singer) {
  let ret = [];
  if (!singer) {
    return "";
  }
  singer.forEach(item => {
    ret.push(item.name);
  });
  return ret.join("/");
}
