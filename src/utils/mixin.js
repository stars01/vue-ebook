import { mapGetters, mapActions } from 'vuex'
import { addCss, removeAllCss, themeList } from '../utils/book'
import { saveLocation } from '../utils/localStorage'

export const ebookMixin = {
  computed: {
    ...mapGetters([
      'fileName',
      'menuVisible',
      'settingVisible',
      'defaultFontSize',
      'defaultFontFamily',
      'fontFamilyVisible',
      'defaultTheme',
      'bookAvailable',
      'progress',
      'section',
      'isPaginating',
      'currentBook',
      'navigation',
      'cover',
      'metadata',
      'paginate',
      'pagelist',
      'offsetY',
      'isBookmark',
      'speakingIconBottom'
    ]),
    // 主题信息查询
    themeList () {
      return themeList(this)
    }
  },
  methods: {
    ...mapActions([
      'setFileName',
      'setMenuVisible',
      'setSettingVisible',
      'setDefaultFontSize',
      'setDefaultFontFamily',
      'setFontFamilyVisible',
      'setDefaultTheme',
      'setBookAvailable',
      'setProgress',
      'setSection',
      'setIsPaginating',
      'setCurrentBook',
      'setNavigation',
      'setCover',
      'setMetadata',
      'setPaginate',
      'setPagelist',
      'setOffsetY',
      'setIsBookmark',
      'setSpeakingIconBottom'
    ]),
    initGlobalStyle () {
      removeAllCss()
      switch (this.defaultTheme) {
        case 'Default':
          addCss(`${process.env.VUE_APP_RES_URL}/theme/theme_default.css`)
          break
        case 'Eye':
          addCss(`${process.env.VUE_APP_RES_URL}/theme/theme_eye.css`)
          break
        case 'Gold':
          addCss(`${process.env.VUE_APP_RES_URL}/theme/theme_gold.css`)
          break
        case 'Night':
          addCss(`${process.env.VUE_APP_RES_URL}/theme/theme_night.css`)
          break
        default:
          addCss(`${process.env.VUE_APP_RES_URL}/theme/theme_default.css`)
          break
      }
    },
    // 章节跳转后更新进度条
    refreshLocation () {
      const currentLocation = this.currentBook.rendition.currentLocation()
      const progress = this.currentBook.locations.percentageFromCfi(currentLocation.start.cfi)
      this.setProgress(Math.floor(progress * 100))
      this.setSection(currentLocation.start.index)
      const startCfi = currentLocation.start.cfi
      saveLocation(this.fileName, startCfi)
    },
    // 根据传入参数 转到应该显示的章节
    display (target, cb) {
      if (target) {
        this.currentBook.rendition.display(target).then(() => {
          // if (highlight) {
          //   if (target.startsWith('epubcfi')) {
          //     this.currentBook.getRange(target).then(range => {
          //       this.currentBook.rendition.annotations.highlight(target, {}, (e) => {
          //       })
          //     })
          //   }
          // }
          this.refreshLocation()
          if (cb) cb()
        })
      } else {
        this.currentBook.rendition.display().then(() => {
          this.refreshLocation()
          if (cb) cb()
        })
      }
      // this.hideMenuVisible()
    }
  }
}
