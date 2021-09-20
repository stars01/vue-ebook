<template>
  <div class="ebook" ref="ebook">
      <ebook-reader></ebook-reader>
      <ebook-header></ebook-header>
      <ebook-footer></ebook-footer>
      <ebook-title-bar></ebook-title-bar>
      <ebook-menu></ebook-menu>
      <ebook-bookmark></ebook-bookmark>
      <div class="ebook-bookmark-bg"></div>
  </div>
</template>

<script>
import EbookReader from '../../components/ebook/EbookReader.vue'
import EbookTitleBar from '../../components/ebook/EbookTitleBar.vue'
import EbookMenu from '../../components/ebook/EbookMenu.vue'
import EbookBookmark from '../../components/ebook/EbookBookmark.vue'
import EbookHeader from '../../components/ebook/EbookHeader.vue'
import EbookFooter from '../../components/ebook/EbookFooter.vue'
import { ebookMixin } from '../../utils/mixin'
export default {
  mixins: [ebookMixin],
  components: {
    EbookReader,
    EbookTitleBar,
    EbookMenu,
    EbookBookmark,
    EbookHeader,
    EbookFooter
  },
  watch: {
    // 监听用户下拉屏幕时滚动条的y轴数值
    offsetY (v) {
      // 判断如果菜单栏没有处于显示状态（如果菜单栏显示，优先响应菜单栏事件）
      // 并且电子书已经解析完毕（未解析完毕时无法获取currentLocation）
      if (!this.menuVisible && this.bookAvailable) {
        if (v > 0) {
          // 向下拉动屏幕时，调用move方法
          this.move(v)
        } else if (v === 0) {
          // y轴为0时，调用restore方法让屏幕回弹，松手时屏幕是无法自动回弹的，必须自己实现
          this.restore()
        }
      }
    }
  },
  methods: {
    move (v) {
      // 向下拉动屏幕时，组件随之移动
      this.$refs.ebook.style.top = v + 'px'
    },
    restore () {
      this.$refs.ebook.style.top = 0
      // 设置过渡动画，产生回弹效果
      this.$refs.ebook.style.transition = 'all .15s linear'
      setTimeout(() => {
        // 动画结束后，将过渡动画关闭，否则在下拉时也会产生过渡动画
        this.$refs.ebook.style.transition = ''
      }, 200)
    }
  }
}

</script>
<style lang="scss" scoped>
@import "../../assets/styles/global";

.ebook {
  // 下拉添加书签，背景色
  .ebook-bookmark-bg {
    position: absolute;
    top: -100%;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #767c72;
  }
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
