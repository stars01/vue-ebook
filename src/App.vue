<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {

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
#app{
  widows: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
