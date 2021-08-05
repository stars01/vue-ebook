<template>
  <div id="app">
    <span class="text">ABCDEFGH</span>
    <router-view/>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters(['test'])
  },
  mounted () {
    this.$store.dispatch('setTest', 10).then(() => {
      // console.log(this.$store.state.book.test)
      console.log(this.test)
    })
  }
}

// 根据屏幕宽度计算字体大小
document.addEventListener('DOMContentLoaded', () => {
  let fontSize = window.innerWidth / 10
  fontSize = fontSize > 40 ? 40 : fontSize
  const html = document.querySelector('html')
  html.style.fontSize = fontSize + 'px'
})
</script>

<style lang="scss" scoped>
@import "./assets/styles/global.scss";
.text{
  font-family: 'Days One';
  font-size: px2rem(20);
  color: #795f5f;
}
</style>
