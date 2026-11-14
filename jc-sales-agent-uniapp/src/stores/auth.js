import { reactive } from 'vue'
import { read, write, remove } from '../utils/storage.js'

export const auth = reactive({ user: read('jc-user'), token: read('jc-token', '') })
export function acceptLogin(repId, data) {
  if (!data?.token) throw new Error('登录响应缺少 Token')
  auth.user = { repId: String(repId), username: data.username, role: data.role }
  auth.token = data.token
  write('jc-user', auth.user)
  write('jc-token', auth.token)
}
export function clearAuth() {
  auth.user = null
  auth.token = ''
  remove('jc-token')
  remove('jc-user')
}
export function requireLogin() {
  if (auth.token && auth.user) return true
  uni.navigateTo({ url: '/pages/login/index' })
  return false
}
