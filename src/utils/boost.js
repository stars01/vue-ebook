/* eslint-disable no-extend-native */
// 对数组做拓展,增加元素不要出现重复
Array.prototype.pushWithoutDuplicate = function () {
  for (let i = 0; i < arguments.length; i++) {
    const arg = arguments[i]
    if (this.indexOf(arg) === -1) {
      this.push(arg)
    }
  }
}
