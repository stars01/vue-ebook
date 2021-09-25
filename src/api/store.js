import axios from 'axios'

export function home () {
  return axios({
    method: 'get',
    url: `${process.env.VUE_APP_BASW_URL}/book/home`
  })
}
