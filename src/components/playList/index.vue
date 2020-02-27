<template>
  <transition name="list-fade">
    <div class="playlist" v-show="showFlag" @click="hide">
      <!-- 此处@click.stop 是为了阻止点击list-wrapper中的地方 事件冒泡 -->
      <div @click.stop class="list-wrapper">
        <div class="list-header">
          <h1 class="title">
            <i @click="changeMode" class="icon" :class="iconMode"></i>
            <span class="text">{{ modeText }}</span>
            <span @click="showConfirm" class="clear">
              <i class="icon-clear"></i>
            </span>
          </h1>
        </div>
        <Scroll :data="sequenceList" ref="listContent" class="list-content">
          <transition-group tag="ul" name="list">
            <li
              ref="listItem"
              @click="selectItem(item, index)"
              v-for="(item, index) in sequenceList"
              :key="item.id"
              class="item"
            >
              <i class="current" :class="getCurrentIcon(item)"></i>
              <span class="text">{{ item.name }}</span>
              <!-- 收藏icon -->
              <span @click.stop="toggleFavorite(item)" class="like">
                <i :class="getFavoriteIcon(item)"></i>
              </span>
              <!-- 删除icon -->
              <span @click.stop="deleteOne(item)" class="delete">
                <i class="icon-delete"></i>
              </span>
            </li>
          </transition-group>
        </Scroll>
        <div class="list-operate">
          <div class="add" @click="addSong">
            <i class="icon-add"></i>
            <span class="text">添加歌曲到队列</span>
          </div>
        </div>
        <div @click="hide" class="list-close">
          <span>关闭</span>
        </div>
      </div>
      <Confirm
        @confirm="confirmClear"
        ref="confirm"
        text="是否清空播放列表"
        confirmBtnText="清空"
      />
      <AddSong ref="addSong" />
    </div>
  </transition>
</template>

<script>
import { mapActions } from "vuex";
import { playMode } from "common/js/config.js";
import { playerMixin } from "common/js/mixin.js";
import Scroll from "src/base/scroll";
import Confirm from "src/base/confirm";
import AddSong from "components/addSong";
export default {
  name: "PlayList",
  components: {
    Scroll,
    Confirm,
    AddSong
  },
  mixins: [playerMixin],
  data() {
    return {
      showFlag: false //  显示隐藏标志位
    };
  },
  computed: {
    modeText() {
      return this.mode === playMode.sequence
        ? "顺序播放"
        : this.mode === playMode.random
        ? "随机播放"
        : "单曲循环";
    }
  },
  watch: {
    // 当前播放歌曲改变, 滚动scroll
    currentSong(newSong, oldSong) {
      if (!this.showFlag || newSong.id === oldSong.id) {
        return;
      }
      this.scrollToCurrent(newSong);
    }
  },
  methods: {
    // 显示
    show() {
      this.showFlag = true;
      setTimeout(() => {
        this.$refs.listContent.refresh();
        this.scrollToCurrent(this.currentSong);
      }, 20);
    },
    // 隐藏
    hide() {
      this.showFlag = false;
    },
    // 判断正在播放的歌曲添加ICON
    getCurrentIcon(item) {
      if (this.currentSong.id === item.id) {
        return "icon-play";
      }
      return "";
    },
    // 点击播放列表中某一首歌
    selectItem(item, index) {
      // 播放模式 随机和顺序处理
      if (this.mode === playMode.random) {
        index = this.playList.findIndex(song => {
          return song.id === item.id;
        });
      }
      this.setCurrentIndex(index);
      this.setPlayingState(true);
    },
    // 滚动到当前播放歌曲位置
    scrollToCurrent(current) {
      const index = this.sequenceList.findIndex(song => {
        return current.id === song.id;
      });
      this.$refs.listContent.scrollToElement(this.$refs.listItem[index], 300);
    },
    // 删除播放列表某一项
    deleteOne(item) {
      this.deleteSong(item);
      // 播放列表为空, 调用隐藏函数, 防止播放列表新增歌曲, 此组件自动显示
      if (!this.playList.length) {
        this.hide();
      }
    },
    // 点击清空播放列表显示确认弹窗
    showConfirm() {
      this.$refs.confirm.show();
    },
    // 确认清空播放列表
    confirmClear() {
      this.deleteSongList();
      this.hide();
    },
    // 点击添加歌曲到队列
    addSong() {
      this.$refs.addSong.show();
    },
    ...mapActions(["deleteSong", "deleteSongList"])
  }
};
</script>

<style lang="scss" scoped>
@import "common/style/variable.scss";
.playlist {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 200;
  background-color: $color-background-d;
  .list-wrapper {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    background-color: $color-highlight-background;
    .list-header {
      position: relative;
      padding: 20px 30px 10px 20px;
      .title {
        display: flex;
        align-items: center;
        .icon {
          margin-right: 10px;
          font-size: 30px;
          color: $color-theme-d;
        }
        .text {
          flex: 1;
          font-size: $font-size-medium;
          color: $color-text-l;
        }
        .clear {
          .icon-clear {
            font-size: $font-size-medium;
            color: $color-text-d;
          }
        }
      }
    }
    .list-content {
      max-height: 240px;
      overflow: hidden;
      .item {
        display: flex;
        align-items: center;
        height: 40px;
        padding: 0 30px 0 20px;
        overflow: hidden;
        .current {
          flex: 0 0 20px;
          width: 20px;
          font-size: $font-size-small;
          color: $color-theme-d;
        }
        .text {
          flex: 1;
          font-size: $font-size-medium;
          color: $color-text-d;
        }
        .like {
          margin-right: 15px;
          font-size: $font-size-small;
          color: $color-theme;
          .icon-favorite {
            color: $color-sub-theme;
          }
        }
        .delete {
          font-size: $font-size-small;
          color: $color-theme;
        }
      }
      .item.list-enter-active {
        transition: all 0.1s;
      }
      .item.list-leave-active {
        transition: all 0.1s;
      }
      .item.list-enter {
        height: 0;
      }
      .item.list-leave-to {
        height: 0;
      }
    }
    .list-operate {
      width: 140px;
      margin: 20px auto 30px auto;
      .add {
        display: flex;
        align-items: center;
        padding: 8px 16px;
        border: 1px solid $color-text-l;
        border-radius: 100px;
        color: $color-text-l;
        .icon-add {
          margin-right: 5px;
          font-size: $font-size-small-s;
        }
        .text {
          font-size: $font-size-small;
        }
      }
    }
    .list-close {
      text-align: center;
      line-height: 50px;
      background: $color-background;
      font-size: $font-size-medium-x;
      color: $color-text-l;
    }
  }
}
.playlist.list-fade-enter-active {
  transition: opacity 0.3s;
  .list-wrapper {
    transition: all 0.3s;
  }
}
.playlist.list-fade-leave-active {
  transition: opacity 0.3s;
  .list-wrapper {
    transition: all 0.3s;
  }
}
.playlist.list-fade-enter {
  opacity: 0;
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  background-color: $color-highlight-background;
  .list-wrapper {
    transform: translate3d(0, 100%, 0);
  }
  .list-header {
    position: relative;
    padding: 20px 30px 10px 20px;
    .title {
      display: flex;
      align-items: center;
      .icon {
        margin-right: 10px;
        font-size: 30px;
        color: $color-theme-d;
      }
      .text {
        flex: 1;
        font-size: $font-size-medium;
        color: $color-text-l;
      }
      .clear {
        .icon-clear {
          font-size: $font-size-medium;
          color: $color-text-d;
        }
      }
    }
  }
  .list-content {
    max-height: 240px;
    overflow: hidden;
    .item {
      display: flex;
      align-items: center;
      height: 40px;
      padding: 0 30px 0 20px;
      overflow: hidden;
      .current {
        flex: 0 0 20px;
        width: 20px;
        font-size: $font-size-small;
        color: $color-theme-d;
      }
      .text {
        flex: 1;
        font-size: $font-size-medium;
        color: $color-text-d;
      }
      .like {
        margin-right: 15px;
        font-size: $font-size-small;
        color: $color-theme;
        .icon-favorite {
          color: $color-sub-theme;
        }
      }
      .delete {
        font-size: $font-size-small;
        color: $color-theme;
      }
    }
    .item.list-enter-active {
      transition: all 0.1s;
    }
    .item.list-leave-active {
      transition: all 0.1s;
    }
    .item.list-enter {
      height: 0;
    }
    .item.list-leave-to {
      height: 0;
    }
  }
  .list-operate {
    width: 140px;
    margin: 20px auto 30px auto;
    .add {
      display: flex;
      align-items: center;
      padding: 8px 16px;
      border: 1px solid $color-text-l;
      border-radius: 100px;
      color: $color-text-l;
      .icon-add {
        margin-right: 5px;
        font-size: $font-size-small-s;
      }
      .text {
        font-size: $font-size-small;
      }
    }
  }
  .list-close {
    text-align: center;
    line-height: 50px;
    background: $color-background;
    font-size: $font-size-medium-x;
    color: $color-text-l;
  }
}
.playlist.list-fade-leave-to {
  opacity: 0;
  .list-wrapper {
    transform: translate3d(0, 100%, 0);
  }
}
</style>
