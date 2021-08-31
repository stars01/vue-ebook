const book = {
  state: {
    fileName: '',
    // 控制菜单栏的隐藏显示
    menuVisible: false
  },
  mutations: {
    SET_FILENAME: (state, fileName) => {
      state.fileName = fileName
    },
    SET_MENUVISIBLE: (state, menuVisible) => {
      state.menuVisible = menuVisible
    }
  },
  modules: {
  }
}
export default book
