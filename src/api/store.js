import axios from 'axios'
import { setLocalForage } from '../utils/localForage'

export function download (book, onSucess, onError, onProgress) {
  if (onProgress == null) { // 如果只传三个参数 将第三个参数赋值给第四个
    onProgress = onError
    onError = null
  }
  return axios.create({
    baseURL: process.env.VUE_APP_EPUB_URL,
    method: 'get',
    responseType: 'blob',
    timeout: 180 * 1000,
    onDownloadProgress: progressEvent => { // 下载进度事件回调
      if (onProgress) onProgress(progressEvent)
    }
  }).get(`${book.categoryText}/${book.fileName}.epub`) // 拼接路径
    .then(res => {
      const blob = new Blob([res.data])
      setLocalForage(book.fileName, blob,
        () => onSucess(book),
        err => onError(err))
    }).catch(err => {
      if (onError) onError(err)
    })
}

export function shelf () {
  return axios({
    method: 'get',
    url: `${process.env.VUE_APP_BASE_URL}/book/shelf`
  })
}

export function home () {
  return axios({
    method: 'get',
    url: `${process.env.VUE_APP_BASE_URL}/book/home`
  })
}

export function detail (book) {
  return axios({
    method: 'get',
    url: `${process.env.VUE_APP_BOOK_URL}/book/detail`,
    params: {
      fileName: book.fileName
    }
  })
}

export function list () {
  return axios({
    method: 'get',
    url: `${process.env.VUE_APP_BASE_URL}/book/list`
  })
}
