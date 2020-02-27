<template>
  <ul class="switches">
    <li
      @click="switchItem(index)"
      v-for="(item, index) in switches"
      :key="item.id"
      :class="{ active: currentIndex === index }"
      class="switch-item"
    >
      <span> {{ item.name }}</span>
    </li>
  </ul>
</template>

<script>
export default {
  name: "Switches",
  props: {
    switches: {
      type: Array,
      default: () => []
    },
    currentIndex: {
      type: Number,
      default: 0
    }
  },
  methods: {
    // 切换标签, 派发事件
    switchItem(index) {
      this.$emit("switch", index);
    }
  }
};
</script>

<style lang="scss" scoped>
@import "common/style/variable.scss";
.switches {
  display: flex;
  align-items: center;
  width: 240px;
  margin: 0 auto;
  border: 1px solid $color-highlight-background;
  border-radius: 5px;
  .switch-item {
    flex: 1;
    padding: 8px;
    text-align: center;
    font-size: $font-size-medium;
    color: $color-text-d;
  }
  .switch-item.active {
    background: $color-highlight-background;
    color: $color-text;
  }
}
</style>
