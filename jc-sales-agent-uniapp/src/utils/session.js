import { auth, clearAuth, requireLogin } from '../stores/auth.js'
import { loadChats } from '../stores/chat.js'
import { getBaseUrl } from './config.js'

export function syncSession() {
  loadChats(auth.user ? `${getBaseUrl()}::${auth.user.repId}` : '')
  return requireLogin()
}
export function expireSession() {
  clearAuth()
  loadChats('')
  uni.reLaunch({ url: '/pages/login/index' })
}
