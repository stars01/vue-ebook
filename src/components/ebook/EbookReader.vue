<template>
  <div class="ebook-reader">
    <div id="read"></div>
    <div class="ebook-reader-mask"
         @click="onMaskClick"
         @touchmove="move"
         @touchend="moveEnd"
         @mousedown.left="onMouseEnter"
         @mousemove.left="onMouseMove"
         @mouseup.left="onMouseEnd"></div>
  </div>
</template>

<script>
import { ebookMixin } from '../../utils/mixin'
import Epub from 'epubjs'
import { getFontFamily, getFontSize, getLocation, getTheme, saveFontFamily, saveFontSize, saveTheme } from '../../utils/localStorage'
import { flatten } from '../../utils/book'
import { getLocalForage } from '../../utils/localForage'

global.epub = Epub

export default {
  mixins: [ebookMixin],
  methods: {
    // 鼠标事件
    // 1 - 鼠标按下
    // 2 - 鼠标按下后的移动
    // 3 - 鼠标从移动状态松手
    // 4 - 鼠标还原
    onMouseEnter (e) {
      // 鼠标按下 1
      this.mouseState = 1
      // 依据时间判断误操作
      this.mouseStartTime = e.timeStamp
      e.preventDefault()
      e.stopPropagation()
    },
    onMouseMove (e) {
      // 鼠标按下后的移动 2
      if (this.mouseState === 1) {
        this.mouseState = 2
      } else if (this.mouseState === 2) {
        let offsetY = 0
        if (this.firstOffsetY) {
          offsetY = e.clientY - this.firstOffsetY
          this.setOffsetY(offsetY)
        } else {
          this.firstOffsetY = e.clientY
        }
      }
      e.preventDefault()
      e.stopPropagation()
    },
    onMouseEnd (e) {
      // 鼠标从移动状态松手 3
      if (this.mouseState === 2) {
        this.setOffsetY(0)
        this.firstOffsetY = null
        this.mouseState = 3
      } else {
        this.mouseState = 4
      }
      const time = e.timeStamp - this.mouseStartTime
      if (time < 100) {
        this.mouseState = 4
      }
      e.preventDefault()
      e.stopPropagation()
    },
    // 触碰事件
    move (e) {
      let offsetY = 0
      if (this.firstOffsetY) {
        offsetY = e.changedTouches[0].clientY - this.firstOffsetY
        this.setOffsetY(offsetY)
      } else {
        this.firstOffsetY = e.changedTouches[0].clientY
      }
      e.preventDefault()
      e.stopPropagation()
    },
    moveEnd (e) {
      this.setOffsetY(0)
      this.firstOffsetY = null
    },
    onMaskClick (e) {
      if (this.mouseState && (this.mouseState === 2 || this.mouseState === 3)) {
        return
      }
      const offsetX = e.offsetX
      const width = window.innerWidth
      if (offsetX > 0 && offsetX < width * 0.3) {
        this.prevPage()
      } else if (offsetX > 0 && offsetX > width * 0.7) {
        this.nextPage()
      } else {
        this.toggleTitleAndMenu()
      }
    },
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
    // 获取图书信息
    parseBook () {
      // 封面
      this.book.loaded.cover.then(cover => {
        this.book.archive.createUrl(cover).then(url => {
          this.setCover(url)
        })
      })
      // 书名，作者
      this.book.loaded.metadata.then(metadata => {
        this.setMetadata(metadata)
      })
      // 目录
      this.book.loaded.navigation.then(nav => {
        const navItem = flatten(nav.toc)

        // 依据parent的值，进行分级
        function find (item, level = 0) {
          return !item.parent ? level : find(navItem.filter(parentItem => parentItem.id === item.parent)[0], ++level)
        }

        navItem.forEach(item => {
          item.level = find(item)
        })
        this.setNavigation(navItem)
      })
    },
    initEpub (url) {
      // 传入url地址，还可以传入blob对象
      this.book = new Epub(url)
      // book对象传入vuex
      this.setCurrentBook(this.book)

      this.initRendition()
      // this.initGesture()
      this.parseBook()

      this.book.ready.then(() => {
        return this.book.locations.generate(750 * (window.innerWidth / 375) * (getFontSize(this.fileName) / 16))
      }).then(locations => {
        // 分页
        this.navigation.forEach(nav => {
          nav.pagelist = []
        })
        locations.forEach(item => {
          const loc = item.match(/\[(.*)\]!/)[1]
          this.navigation.forEach(nav => {
            if (nav.href) {
              const href = nav.href.match(/^(.*)\.html$/)
              if (href) {
                if (href[1] === loc) {
                  nav.pagelist.push(item)
                }
              }
            }
          })
          // 从首页开始计算 每个章节的页数
          let currentPage = 1
          this.navigation.forEach((nav, index) => {
            if (index === 0) {
              nav.page = 1
            } else {
              nav.page = currentPage
            }
            currentPage += nav.pagelist.length + 1
          })
        })
        this.setPagelist(locations)

        this.setBookAvailable(true)
        this.refreshLocation()
      })
    }
  },
  mounted () {
    // 将字符串按 "|" 进行分割，通过 "/"连在一起
    const books = this.$route.params.fileName.split('|')
    const fileName = books[1]
    getLocalForage(fileName, (err, blob) => {
      if (!err && blob) {
        // console.log('找到了缓存')
        this.setFileName(books.join('/')).then(() => {
          this.initEpub(blob)
        })
      } else {
        // console.log('没有缓存,网络获取')
        // 拼接路径
        const url = process.env.VUE_APP_RES_URL + '/epub/' + this.fileName + '.epub'
        this.setFileName(books.join('/')).then(() => {
          this.initEpub(url)
        })
      }
    })
  }
}

</script>
<style lang="scss" scoped>
@import "../../assets/styles/global";

.ebook-reader {
  width: 100%;
  height: 100%;
  overflow: hidden;
  .ebook-reader-mask {
    position: absolute;
    top: 0;
    left: 0;
    background: transparent;
    z-index: 100;
    width: 100%;
    height: 100%;
  }
}
</style>
