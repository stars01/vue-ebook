<template>
<transition name="popup-slide-up">
  <div class="ebook-popup-list" v-show="fontFamilyVisible">
    <div class="ebook-popup-title">
        <div class="ebook-popup-title-icon" @click="hide">
        <span class="icon-pull_down-32"></span>
        </div>
        <span class="ebook-popup-title-text">{{$t('book.selectFont')}}</span>
    </div>
    <div class="ebook-popup-list-wrapper">
      <div class="ebook-popup-item" v-for="(item, index) in fontFamilyList" :key="index"
      @click="setFontFamily(item.font)">
        <div class="ebook-popup-item-text" :class="{'selected': isSelected(item)}">{{item.font}}</div>
        <div class="ebook-popup-item-check" v-if="isSelected(item)">
          <span class="icon-check-2"></span>
        </div>
      </div>
    </div>
  </div>
</transition>
</template>

<script>
import { FONT_FAMILY } from '../../utils/book'
import { ebookMixin } from '../../utils/mixin'
import { saveFontFamily } from '../../utils/localStorage'

export default {
  mixins: [ebookMixin],
  data () {
    return {
      fontFamilyList: FONT_FAMILY
    }
  },
  methods: {
    setFontFamily (font) {
      this.setDefaultFontFamily(font)
      // 通过storage 进行储存
      saveFontFamily(this.fileName, font)
      if (font === 'Default') {
        this.currentBook.rendition.themes.font('Times LT Std')
      }
      this.currentBook.rendition.themes.font(font)
    },
    hide () {
      this.setFontFamilyVisible(false)
    },
    isSelected (item) {
      return this.defaultFontFamily === item.font
    }
  }
}
</script>

<style lang="scss" scoped>
  @import "../../assets/styles/global";

  .ebook-popup-list {
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: 350;
    background: #ffffff;
    width: 100%;
    font-size: 0;
    box-shadow: 0 px2rem(-4) px2rem(6) rgba(0, 0, 0, .1);
    .ebook-popup-title {
      position: relative;
      text-align: center;
      padding: px2rem(15);
      border-bottom: px2rem(1) solid #b8b9bb;
      box-sizing: border-box;
      @include center;
      .ebook-popup-title-text {
        font-size: px2rem(14);
        font-weight: bold;
      }
      .ebook-popup-title-icon {
        position: absolute;
        right: px2rem(14);
        top: 0;
        height: 100%;
        @include center;
        .icon-pull_down-32 {
          font-size: px2rem(16);
          font-weight: bold;
        }
      }
    }
    .ebook-popup-list-wrapper {
      .ebook-popup-item {
        display: flex;
        padding: px2rem(15);
        .ebook-popup-item-text {
          flex: 1;
          font-size: px2rem(14);
          text-align: left;
          &.selected {
            color: #346cb9;
            font-weight: bold;
          }
        }
        .ebook-popup-item-check {
          flex: 1;
          text-align: right;
          .icon-check-2 {
            font-size: px2rem(14);
            font-weight: bold;
            color: #346cb9;
          }
        }
      }
    }
  }
</style>
