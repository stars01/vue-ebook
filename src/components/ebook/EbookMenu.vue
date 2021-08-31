<template>
  <div class="menu-bar">
    <transition name="slide-up">
      <div class="menu-wrapper" :class="{'hide-box-shadow': !menuVisible}" v-show="menuVisible">
        <div class="icon-wrapper">
          <span class="icon-menu-7" @click="showSetting(3)"></span>
        </div>
        <div class="icon-wrapper">
          <span class="icon-progress-31" @click="showSetting(2)"></span>
        </div>
        <div class="icon-wrapper">
          <span class="icon-bright-6" @click="showSetting(1)"></span>
        </div>
        <div class="icon-wrapper">
          <span class="icon-A-0" @click="showSetting(0)"></span>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { ebookMixin } from '../../utils/mixin'

export default {
  mixins: [ebookMixin],

  data () {
    return {
    }
  },
  methods: {
    // 显示设置面板
    showSetting (key) {
    }
  }
}

</script>

<style lang='scss' scoped>
@import '../../assets/styles/global';
.menu-wrapper {
  font-size: px2rem(20);
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 102;
  display: flex;
  width: 100%;
  height: px2rem(48);
  background: white;
  box-shadow: 0 px2rem(-8) px2rem(8) rgba(0, 0, 0, .15);
  &.hide-box-shadow {
    box-shadow: none;
  }
  .icon-wrapper {
    flex: 1;
    @include center;
    .icon-progress {
      font-size: px2rem(28);
    }
    .icon-bright {
      font-size: px2rem(24);
    }
  }
}
</style>
