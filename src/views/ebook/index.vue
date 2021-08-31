<template>
  <div class="ebook">
      <ebook-reader></ebook-reader>
      <ebook-title-bar></ebook-title-bar>
      <ebook-menu></ebook-menu>
  </div>
</template>

<script>
import EbookReader from '../../components/ebook/EbookReader.vue'
import EbookTitleBar from '../../components/ebook/EbookTitleBar.vue'
import EbookMenu from '../../components/ebook/EbookMenu.vue'
export default {
  components: {
    EbookReader,
    EbookTitleBar,
    EbookMenu
  }
}

</script>
<style lang="scss" scoped>
@import "../../assets/styles/global"
</style>
