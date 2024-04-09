import type { XiorRequestConfig } from 'xior'
import axios from 'xior'

export default (requestConfig: XiorRequestConfig) => {
  return axios.request(requestConfig)
}
