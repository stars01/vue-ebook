<template>
  <div class="ebook-reader">
    <div id="read"></div>
  </div>
</template>

<script>
import { ebookMixin } from '../../utils/mixin'
import Epub from 'epubjs'
import { getFontFamily, getFontSize, getLocation, getTheme, saveFontFamily, saveFontSize, saveTheme } from '../../utils/localStorage'

global.epub = Epub

export default {
  mixins: [ebookMixin],
  methods: {
    prevPage () {
      if (this.rendition) {
        this.rendition.prev().then(() => {
          this.refreshLocation()
        })
        this.hideTitleAndMenu()
      }
    },
    nextPage () {
      if (this.rendition) {
        this.rendition.next().then(() => {
          this.refreshLocation()
        })
        this.hideTitleAndMenu()
      }
    },
    // 控制标题和菜单栏的显示隐藏
    toggleTitleAndMenu () {
      if (this.menuVisible) {
        this.setSettingVisible(-1)
        this.setFontFamilyVisible(false)
      }
      this.setMenuVisible(!this.menuVisible)
    },
    hideTitleAndMenu () {
      // this.$store.dispatch('setMenuVisible', false)
      this.setMenuVisible(false)
      this.setSettingVisible(-1)
      this.setFontFamilyVisible(false)
    },
    initFontSize () {
      let fontSize = getFontSize(this.fileName)// eslint-disable-line
      if (!fontSize) {
        // 储存字体大小信息
        saveFontSize(this.fileName, this.defaultFontSize)
      } else {
        // 将字体大小渲染出来
        this.rendition.themes.fontSize(fontSize)
        // 更新字体选中状态
        this.setDefaultFontSize(fontSize)
      }
    },
    initFontFamily () {
      let font = getFontFamily(this.fileName)// eslint-disable-line
      if (!font) {
        // 储存字体类型信息
        saveFontFamily(this.fileName, this.defaultFontFamily)
      } else {
        // 将字体类型渲染出来
        this.rendition.themes.font(font)
        // 更新字体勾选状态
        this.setDefaultFontFamily(font)
      }
    },
    initTheme () {
      let defaultTheme = getTheme(this.fileName)
      if (!defaultTheme) {
        defaultTheme = this.themeList[0].name
        saveTheme(this.fileName, defaultTheme)
      }
      this.setDefaultTheme(defaultTheme)
      this.themeList.forEach(theme => {
        this.rendition.themes.register(theme.name, theme.style)
      })
      this.rendition.themes.select(defaultTheme)
    },
    initRendition () {
      // 渲染ebook,绑定dom只能识别id
      this.rendition = this.book.renderTo('read', {
        width: innerWidth,
        height: innerHeight,
        // 兼容微信
        method: 'default'
      })
      // 渲染电子书，判断默认字体
      const location = getLocation(this.fileName)
      this.display(location, () => {
        this.initTheme()
        this.initFontSize()
        this.initFontFamily()
        this.initGlobalStyle()
      })
      // 解决阅读器不能更换字体
      this.rendition.hooks.content.register(contents => {
        Promise.all([
          // 手动的添加样式文件,传入值是url
          contents.addStylesheet(`${process.env.VUE_APP_RES_URL}/fonts/cabin.css`),
          contents.addStylesheet(`${process.env.VUE_APP_RES_URL}/fonts/daysOne.css`),
          contents.addStylesheet(`${process.env.VUE_APP_RES_URL}/fonts/montserrat.css`),
          contents.addStylesheet(`${process.env.VUE_APP_RES_URL}/fonts/tangerine.css`)
        ]).then(() => {})
      })
    },
    initGesture () {
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
        window.addEventListener('touchstart', { passive: false })
        event.stopPropagation()
      })
    },
    initEpub () {
      // nginx资源路径
      // 拼接路径
      const url = process.env.VUE_APP_RES_URL + '/epub/' + this.fileName + '.epub'
      this.book = new Epub(url)
      // book对象传入vuex
      this.setCurrentBook(this.book)

      this.initRendition()
      this.initGesture()

      this.book.ready.then(() => {
        return this.book.locations.generate(750 * (window.innerWidth / 375) * (getFontSize(this.fileName) / 16))
      }).then(location => {
        // 分页
        this.setBookAvailable(true)
        this.refreshLocation()
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
