import Mock from 'mockjs'
import Home from './bookHome'
import Shelf from './bookShelf'
import List from './bookList'
import FlatList from './bookFlatList'

// Mock.setup({
//   timeout: '350-600'
// })

Mock.mock(/\/book\/home/, 'get', Home)
Mock.mock(/\/book\/shelf/, 'get', Shelf)
Mock.mock(/\/book\/list/, 'get', List)
Mock.mock(/\/book\/flat-list/, 'get', FlatList)

export default Mock
