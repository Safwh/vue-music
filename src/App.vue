<template>
  <div id="app">
    <MHeader />
    <Tab />
    <!-- keep-alive 包裹动态组件时，会缓存不活动的组件实例 -->
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
    <!-- 播放器组件 -->
    <Player />
  </div>
</template>

<script>
import MHeader from "components/m-header";
import Tab from "components/tab";
import Player from "components/player";

export default {
  components: {
    MHeader,
    Tab,
    Player
  }
};
</script>

<style lang="scss"></style>
