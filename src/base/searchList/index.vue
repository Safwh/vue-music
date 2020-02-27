<template>
  <div class="search-list" v-show="searches.length">
    <transition-group name="list" tag="ul">
      <li
        @click="selectItem(item)"
        v-for="item in searches"
        :key="item"
        class="search-item"
      >
        <span class="text">{{ item }}</span>
        <span @click.stop="deleteOne(item)" class="icon">
          <i class="icon-delete"></i>
        </span>
      </li>
    </transition-group>
  </div>
</template>

<script>
export default {
  name: "SearchList",
  props: {
    searches: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    // 点击搜索历史列表中的某一项
    selectItem(item) {
      this.$emit("select", item);
    },
    // 点击搜索历史列表中某一项删除图标
    deleteOne(item) {
      this.$emit("delete", item);
    }
  }
};
</script>

<style lang="scss" scoped>
@import "common/style/variable.scss";
@import "common/style/mixin.scss";
.search-list {
  .search-item {
    display: flex;
    align-items: center;
    height: 40px;
    overflow: hidden;
    &.list-enter-active,
    &.list-leave-active {
      transition: all 0.1s;
    }
    &.list-enter,
    &.list-leave-to {
      height: 0;
    }
    .text {
      flex: 1;
      color: $color-text-l;
    }
    .icon {
      @include extend-click();
      .icon-delete {
        font-size: $font-size-small;
        color: $color-text;
      }
    }
  }
}
</style>
