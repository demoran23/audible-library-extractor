<template>
  <div class="book-tags">
    <a :href="makeUrl('tags', tag)" target="_blank" rel="noopener noreferrer" class="book-tag" v-for="tag in book.tags" :key="tag.name">
      {{ tag.name }}
    </a>
  </div>
</template>

<script>
import makeUrl from "@output-mixins/gallery-makeFullUrl.js";

export default {
  name: "bookTags",
  props: ["book"],
  mixins: [makeUrl],
  data: function() {
    return {
    };
  },
};
</script>

<style lang="scss" scoped>


.book-tags {
  .book-tag {
    display: inline-block;
    padding: 3px 5px;
    margin: 6px 6px 0 0;
    border-radius: 9999999px;
    font-size: 11px;
    line-height: 11px;
    white-space: nowrap;
    
    @include themify($themes) {
      color: rgba(themed(frontColor), 0.7) !important;
      border: 1px solid rgba(themed(frontColor), 0.6);
    }
  }
  
  a.book-tag:visited {
    @include themify($themes) {
      color: rgba(themed(frontColor), 0.3) !important;
    }
  }
}

</style>
