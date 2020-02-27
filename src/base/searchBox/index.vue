<template>
  <div class="search-box">
    <i class="icon-search"></i>
    <input ref="query" v-model="query" class="box" :placeholder="placeholder" />
    <i @click="clear" v-show="query" class="icon-dismiss"></i>
  </div>
</template>

<script>
import { debounce } from "utils/common";
export default {
  name: "searchBox",
  props: {
    placeholder: {
      type: String,
      default: "搜索歌曲 歌手"
    }
  },
  data() {
    return {
      query: "" // 搜索框内容
    };
  },
  methods: {
    // 点击X, 清除搜索框内容
    clear() {
      this.query = "";
    },
    // 改变搜索框内容
    setQuery(query) {
      this.query = query;
    },
    // 搜索框失去焦点
    blur() {
      this.$refs.query.blur();
    }
  },
  created() {
    // 命令式的 vm.$watch API 观察 Vue 实例上的一个表达式或者一个函数计算结果的变化。回调函数得到的参数为新值和旧值。
    // 监视搜索框内容, 内容改变, 派发query事件
    this.$watch(
      "query",
      debounce(newQuery => {
        this.$emit("query", newQuery);
      }, 200)
    );
  }
};
</script>

<style lang="scss" scoped>
@import "common/style/variable.scss";
.search-box {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  padding: 0 6px;
  height: 40px;
  background: $color-highlight-background;
  border-radius: 6px;
  .icon-search {
    font-size: 24px;
    color: $color-background;
  }
  .box {
    flex: 1;
    margin: 0 5px;
    line-height: 18px;
    background: $color-highlight-background;
    color: $color-text;
    font-size: $font-size-medium;
    outline: 0;
    &::placeholder {
      color: $color-text-d;
    }
  }
  .icon-dismiss {
    font-size: 16px;
    color: $color-background;
  }
}
</style>
