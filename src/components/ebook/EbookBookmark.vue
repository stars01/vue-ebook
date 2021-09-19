<template>
  <div class="ebook-bookmark" ref="bookmark">
    <div class="ebook-bookmark-text-wrapper">
      <div class="ebook-bookmark-down-wrapper" ref="iconDown">
        <span class="icon-down-8"></span>
      </div>
      <div class="ebook-bookmark-text">{{text}}</div>
    </div>
    <div class="ebook-bookmark-icon-wrapper" :style="isFixed ? fixedStyle : {}">
      <bookmark :color="color" :width="15" :height="35"></bookmark>
    </div>
  </div>
</template>

<script>
import { realPx } from '../../utils/utils'
import Bookmark from '../common/Bookmark'
import { ebookMixin } from '../../utils/mixin'
import { getBookmark, saveBookmark } from '../../utils/localStorage'

const BLUE = '#346cbc'
const WHITE = '#fff'
export default {
  mixins: [ebookMixin],
  components: {
    Bookmark
  },
  computed: {
    height () {
      return realPx(35)
    },
    threshold () {
      return realPx(55)
    },
    fixedStyle () {
      return {
        position: 'fixed',
        top: 0,
        right: `${(window.innerWidth - this.$refs.bookmark.clientWidth) / 2}px`
      }
    }
  },
  watch: {
    offsetY (v) {
      if (!this.bookAvailable || this.menuVisible || this.settingVisible >= 0) {
        return
      }
      if (v >= this.height && v < this.threshold) {
        // console.log('>=35 <55')
        this.beforeThreshold(v)
      } else if (v >= this.threshold) {
        // console.log('>=55')
        this.afterThreshold(v)
      } else if (v > 0 && v < this.height) {
        // console.log('0-35')
        this.beforeHeight()
      } else if (v === 0) {
        this.restore()
      }
    },
    isBookmark (isBookmark) {
      // 数据转换为布尔值，判断存在
      this.isFixed = isBookmark
      if (isBookmark) {
        this.color = BLUE
        // this.isFixed = true
      } else {
        this.color = WHITE
        // this.isFixed = false
      }
    }
  },
  data () {
    return {
      text: '',
      color: WHITE,
      isFixed: false
    }
  },
  methods: {
    addBookmark () {
      // bookmark储存书签的数组
      this.bookmark = getBookmark(this.fileName)
      if (!this.bookmark) {
        this.bookmark = []
      }
      // 获取文本
      const currentLocation = this.currentBook.rendition.currentLocation()
      const cfibase = currentLocation.start.cfi.replace(/!.*/, '')
      const cfistart = currentLocation.start.cfi.replace(/.*!/, '').replace(/\)$/, '')
      const cfiend = currentLocation.end.cfi.replace(/.*!/, '').replace(/\)$/, '')
      const cfirange = `${cfibase}!,${cfistart},${cfiend})`
      this.currentBook.getRange(cfirange).then(range => {
        // 消去两个以上的空格
        const text = range.toString().replace(/\s\s/g, '')
        // 添加新的原神,内含cfi和text文本
        this.bookmark.push({
          cfi: currentLocation.start.cfi,
          text: text
        })
        console.log(this.bookmark)
        saveBookmark(this.fileName, this.bookmark)
      })
    },
    removeBookmark () {
      // 获取文本cfi
      const currentLocation = this.currentBook.rendition.currentLocation()
      const cfi = currentLocation.start.cfi
      this.bookmark = getBookmark(this.fileName)
      if (this.bookmark) {
        // 将cfi相同的项消去，并保存
        saveBookmark(this.fileName, this.bookmark.filter(item => item.cfi !== cfi))
        this.setIsBookmark(false)
      }
    },
    restore () {
      // 状态4：v=0 归位
      setTimeout(() => {
        this.$refs.bookmark.style.top = `${-this.height}px`
        this.$refs.iconDown.style.transform = 'rotate(0deg)'
      }, 200)
      if (this.isFixed) {
        this.setIsBookmark(true)
        this.addBookmark()
      } else {
        this.setIsBookmark(false)
        this.removeBookmark()
      }
    },
    beforeHeight () {
      // 状态1：0-35 未超过书签的高度
      if (this.isBookmark) {
        this.text = this.$t('book.pulldownDeleteMark')
        this.color = BLUE
        this.isFixed = true
      } else {
        this.text = this.$t('book.pulldownAddMark')
        this.color = WHITE
        this.isFixed = false
      }
    },
    beforeThreshold (v) {
      // 状态2：35<=v<55 未到达零界状态
      this.$refs.bookmark.style.top = `${-v}px`
      this.beforeHeight()
      // 箭头旋转
      const iconDown = this.$refs.iconDown
      if (iconDown.style.transform === 'rotate(180deg)') {
        iconDown.style.transform = 'rotate(0deg)'
      }
    },
    afterThreshold (v) {
      // 状态3：>=55超越零界状态
      this.$refs.bookmark.style.top = `${-v}px`
      if (this.isBookmark) {
        this.text = this.$t('book.releaseDeleteMark')
        this.color = WHITE
        this.isFixed = false
      } else {
        this.text = this.$t('book.releaseAddMark')
        this.color = BLUE
        this.isFixed = true
      }
      // 箭头旋转
      const iconDown = this.$refs.iconDown
      if (iconDown.style.transform === '' ||
        iconDown.style.transform === 'rotate(0deg)') {
        iconDown.style.transform = 'rotate(180deg)'
      }
    }
  }
}
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../../assets/styles/global";

  .ebook-bookmark {
    position: absolute;
    top: px2rem(-35);
    left: 0;
    z-index: 200;
    width: 100%;
    height: px2rem(35);
    .ebook-bookmark-text-wrapper {
      position: absolute;
      right: px2rem(45);
      bottom: px2rem(5);
      display: flex;
      .ebook-bookmark-down-wrapper {
        font-size: px2rem(14);
        color: white;
        transition: all .2s linear;
        @include center;
      }
      .ebook-bookmark-text {
        font-size: px2rem(14);
        color: white;
      }
    }
    .ebook-bookmark-icon-wrapper {
      position: absolute;
      height: px2rem(40);
      right: 0;
      bottom: px2rem(5);
      margin-right: px2rem(15);
    }
  }
</style>
