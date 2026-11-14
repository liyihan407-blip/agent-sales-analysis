import { getBaseUrl } from '../utils/config.js'
import { read, remove } from '../utils/storage.js'

export function request(path, { method = 'GET', data, timeout = 120000 } = {}) {
  let task
  const promise = new Promise((resolve, reject) => {
    task = uni.request({
      url: `${getBaseUrl()}${path}`,
      method, data, timeout,
      header: { 'Content-Type': 'application/json', 'sa-token': read('jc-token', '') },
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) return resolve(res.data)
        if (res.statusCode === 401) {
          remove('jc-token'); remove('jc-user')
          uni.$emit('jc-auth-expired')
          return reject(new Error('登录已过期，请重新登录'))
        }
        const body = res.data
        const message = res.statusCode === 403 ? '当前账号没有访问权限' :
          (typeof body === 'string' ? body : body?.message || body?.error)
        reject(new Error(message || `请求失败（${res.statusCode}）`))
      },
      fail(err) { reject(new Error(/abort/i.test(err.errMsg || '') ? '请求已取消' : '无法连接服务器，请检查后端服务和连接设置')) },
    })
  })
  return { promise, abort: () => task?.abort() }
}

export const login = repId => request('/auth/login', { method: 'POST', data: { repId: Number(repId) } }).promise
export const logout = () => request('/auth/logout', { method: 'POST' }).promise
export const sendChat = data => request('/agent/chat', { method: 'POST', data })
export const deleteChat = id => request(`/agent/session/${encodeURIComponent(id)}`, { method: 'DELETE' }).promise
