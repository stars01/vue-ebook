<template>
  <div class="ebook-reader">
    <div id="read"></div>
  </div>
</template>

<script>
import { ebookMixin } from '../../utils/mixin'
import Epub from 'epubjs'
global.epub = Epub

export default {
  mixins: [ebookMixin],
  methods: {
    prevPage () {
      if (this.rendition) {
        this.rendition.prev()
        this.hideTitleAndMenu()
      }
    },
    nextPage () {
      if (this.rendition) {
        this.rendition.next()
        this.hideTitleAndMenu()
      }
    },
    // 控制标题和菜单栏的显示隐藏
    toggleTitleAndMenu () {
      // this.$store.dispatch('setMenuVisible', !this.menuVisible)
      this.setMenuVisible(!this.menuVisible)
    },
    hideTitleAndMenu () {
      // this.$store.dispatch('setMenuVisible', false)
      this.setMenuVisible(false)
    },
    initEpub () {
      // nginx资源路径
      // 拼接路径
      const url = 'http://192.168.31.193:9001/epub/' + this.fileName + '.epub'
      this.book = new Epub(url)
      // 渲染ebook,绑定dom只能识别id
      this.rendition = this.book.renderTo('read', {
        width: innerWidth,
        height: innerHeight,
        // 兼容微信
        method: 'default'
      })
      // 渲染电子书
      this.rendition.display()
      // 绑定自己的事件,判定点击开始与结束的偏移量与时间差
      this.rendition.on('touchstart', event => {
        this.touchstartX = event.changedTouches[0].clientX
        this.touchstartTime = event.timeStamp
      })
      this.rendition.on('touchend', event => {
        this.offsetX = event.changedTouches[0].clientX - this.touchstartX
        this.time = event.timeStamp - this.touchstartTime
        // 实现滑动翻页，点击菜单栏
        if (this.time < 500 && this.offsetX > 40) {
          this.prevPage()
        } else if (this.time < 500 && this.offsetX < -40) {
          this.nextPage()
        } else {
          this.toggleTitleAndMenu()
        }
        // 声明事件监听的时候设置为主动事件监听,不传递事件
        document.addEventListener('touchstart', function (event) {
          event.preventDefault()
        }, false)
        event.stopPropagation()
      })
    }
  },
  mounted () {
    // 将字符串按 "|" 进行分割，通过 "/"连在一起
    if (this.$route.params.fileName) {
      const fileName = this.$route.params.fileName.split('|').join('/')
      this.setFileName(fileName).then(() => {
        this.initEpub()
      })
    }
  }
}

</script>
<style lang="scss" scoped>
@import "../../assets/styles/global";
// *{
//   touch-action:none
// }
</style>
