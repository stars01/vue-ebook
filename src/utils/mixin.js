import { mapGetters, mapActions } from 'vuex'
import { addCss, removeAllCss, themeList } from '../utils/book'
import { getBookmark, saveLocation } from '../utils/localStorage'

export const storeHomeMixin = {
  computed: {
    ...mapGetters([
      'offsetY',
      'hotSearchOffsetY',
      'flapCardVisible'
    ])
  },
  methods: {
    ...mapActions([
      'setOffsetY',
      'setHotSearchOffsetY',
      'setFlapCardVisible'
    ])
    // showBookDetail (book) {
    //   gotoBookDetail(this, book)
    // }
  }
}

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
    },
    // 计算进度
    getSectionName () {
      return this.section ? this.navigation[this.section].label : ''
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
    refreshLocation () {
      // 跳转后更新进度条
      const currentLocation = this.currentBook.rendition.currentLocation()
      if (currentLocation && currentLocation.start) {
        const progress = this.currentBook.locations.percentageFromCfi(currentLocation.start.cfi)
        const startCfi = currentLocation.start.cfi
        this.setProgress(Math.floor(progress * 100))
        this.setSection(currentLocation.start.index)
        saveLocation(this.fileName, startCfi)
        console.log(startCfi)
        // 判断书签
        const bookmark = getBookmark(this.fileName)
        if (bookmark) {
          // 判断书签中是否存在当前页，显示书签
          if (bookmark.some(item => item.cfi === startCfi)) {
            this.setIsBookmark(true)
          } else {
            this.setIsBookmark(false)
          }
        } else {
          this.setIsBookmark(false)
        }
        // 计算总页数
        if (this.pagelist) {
          const totalPage = this.pagelist.length
          const currentPage = currentLocation.start.location
          // 如果有当前页数信息，写入Paginate
          if (currentPage && currentPage > 0) {
            this.setPaginate(currentPage + ' / ' + totalPage)
          } else {
            this.setPaginate('')
          }
        } else {
          this.setPaginate('')
        }
      }
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
    },
    // 关闭显示的设置栏
    hideTitleAndMenu () {
      // this.$store.dispatch('setMenuVisible', false)
      this.setMenuVisible(false)
      this.setSettingVisible(-1)
      this.setFontFamilyVisible(false)
    }
  }
}
