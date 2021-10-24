<template>
  <div class="shelf-footer" v-show="isEditMode">
    <div class="shelf-footer-tab-wrapper" v-for="item in tabs" :key="item.index" @click="onTabClick(item)">
      <div class="shelf-footer-tab" :class="{'is-selected': isSelected}">
        <div class="icon-download-36 tab-icon" v-if="item.index === 1 && !isDownload"></div>
        <div class="icon-download-remove-28 tab-icon" v-if="item.index === 1 && isDownload"></div>
        <div class="icon-move-26 tab-icon" v-if="item.index === 2"></div>
        <div class="icon-shelf-25 tab-icon" v-if="item.index === 3"></div>
        <div class="tab-text" :class="{'remove-text': item.index === 3}">{{label(item)}}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { storeShelfMixin } from '../../utils/mixin'
import { saveBookShelf, removeLocalStorage } from '../../utils/localStorage'
import { download } from '../../api/store'
import { removeLocalForage } from '../../utils/localForage'

export default {
  mixins: [storeShelfMixin],
  computed: {
    isSelected () {
      return this.shelfSelected && this.shelfSelected.length > 0
    },
    tabs () {
      return [
        {
          label: this.$t('shelf.download'),
          label2: this.$t('shelf.delete'),
          index: 1
        },
        {
          label: this.$t('shelf.move'),
          index: 2
        },
        {
          label: this.$t('shelf.remove'),
          index: 3
        }
      ]
    },
    isDownload () {
      if (!this.isSelected) {
        return false
      } else {
        return this.shelfSelected.every(item => item.cache)
      }
    }
  },
  data () {
    return {
      popupMenu: null
    }
  },
  methods: {
    async downloadSelectedBook () {
      for (let i = 0; i < this.shelfSelected.length; i++) {
        await this.downloadBook(this.shelfSelected[i])
          .then(book => {
            book.cache = true
          })
      }
    },
    downloadBook (book) { // 下载电子书
      let text = ''
      const toast = this.toast({
        text
      })
      toast.continueShow()
      return new Promise((resolve, reject) => {
        download(book, book => {
          toast.remove()
          resolve(book)
        }, reject, progressEvent => { // 下载进度事件 拼接文本
          const progress = Math.floor(progressEvent.loaded / progressEvent.total * 100) + '%'
          text = this.$t('shelf.progressDownload').replace('$1', `${book.fileName}.epub(${progress})`)
          toast.updateText(text)
        })
      }).catch(function () { // 下载失败弹出弹窗
        console.log('关闭')
        text = '缓存错误'
        toast.updateText(text)
        setTimeout(function () { toast.remove() }, 2000)
      })
    },
    removeSelectedBook () { // 删除电子书
      Promise.all(this.shelfSelected.map(book => this.removeBook(book)))
        .then(books => {
          books.map(book => {
            book.cache = false
          })
          saveBookShelf(this.shelfList)
          this.simpleToast(this.$t('shelf.removeDownloadSuccess'))
        })
    },
    removeBook (book) {
      return new Promise((resolve, reject) => {
        removeLocalStorage(`${book.categoryText}/${book.fileName}-info`)
        removeLocalForage(`${book.fileName}`)
        resolve(book)
      })
    },
    hidePopup () {
      this.popupMenu.hide()
    },
    onComplete () {
      this.hidePopup()
      this.setIsEditMode(false)
      saveBookShelf(this.shelfList)
    },
    async setDownload () {
      this.onComplete()
      if (this.isDownload) {
        this.removeSelectedBook()
      } else {
        await this.downloadSelectedBook()
        saveBookShelf(this.shelfList)
        this.simpleToast(this.$t('shelf.setDownloadSuccess'))
      }
    },
    removeSelected () {
      this.shelfSelected.forEach(selected => {
        this.setShelfList(this.shelfList.filter(book => book !== selected))
      })
      this.setShelfSelected([])
      this.onComplete()
    },
    showDownload () {
      this.popupMenu = this.popup({
        title: this.isDownload ? this.$t('shelf.removeDownloadTitle') : this.$t('shelf.setDownloadTitle'),
        btn: [
          {
            text: this.isDownload ? this.$t('shelf.delete') : this.$t('shelf.open'),
            click: () => {
              this.setDownload()
            }
          },
          {
            text: this.$t('shelf.cancel'),
            click: () => {
              this.hidePopup()
            }
          }
        ]
      }).show()
    },
    showRemove () {
      let title
      if (this.shelfSelected.length === 1) {
        title = this.$t('shelf.removeBookTitle').replace('$1', `《${this.shelfSelected[0].title}》`)
      } else {
        title = this.$t('shelf.removeBookTitle').replace('$1', this.$t('shelf.selectedBooks'))
      }
      this.popupMenu = this.popup({
        title: title,
        btn: [
          {
            text: this.$t('shelf.removeBook'),
            type: 'danger',
            click: () => {
              this.removeSelected()
            }
          },
          {
            text: this.$t('shelf.cancel'),
            click: () => {
              this.hidePopup()
            }
          }
        ]
      }).show()
    },
    onTabClick (item) {
      if (!this.isSelected) {
        return
      }
      switch (item.index) {
        case 1:
          this.showDownload()
          break
        case 2:
          this.dialog().show()
          break
        case 3:
          this.showRemove()
          break
        default:
          break
      }
    },
    label (item) {
      if (item.index === 1) {
        return this.isDownload ? item.label2 : item.label
      } else {
        return item.label
      }
    }
  }
}
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../../assets/styles/global";

  .shelf-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    z-index: 120;
    display: flex;
    width: 100%;
    height: px2rem(48);
    background: white;
    box-shadow: 0 px2rem(-2) px2rem(4) 0 rgba(0, 0, 0, .1);
    @include center;
    .shelf-footer-tab-wrapper {
      width: 25%;
      height: 100%;
      .shelf-footer-tab {
        width: 100%;
        height: 100%;
        opacity: .5;
        @include columnCenter;
        &.is-selected {
          opacity: 1;
        }
        .tab-icon {
          font-size: px2rem(20);
          color: #666;
        }
        .tab-text {
          margin-top: px2rem(5);
          font-size: px2rem(12);
          color: #666;
          &.remove-text {
            color: $color-pink;
          }
        }
        .icon-shelf-25 {
          color: $color-pink;
        }
      }
    }
  }
</style>
