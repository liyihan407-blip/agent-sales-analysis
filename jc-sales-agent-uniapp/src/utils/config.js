import { read, write } from './storage.js'

export function normalizeBaseUrl(value) {
  const url = String(value || '').trim().replace(/\/+$/, '')
  if (!/^https?:\/\/[^\s/?#]+(?::\d+)?(?:\/[^?#\s]*)?$/i.test(url)) {
    throw new Error('请输入完整的 http:// 或 https:// 服务器地址')
  }
  return url
}
export function getBaseUrl() {
  const custom = read('jc-api-base', null)
  if (custom !== null) return custom
  // #ifdef H5
  if (import.meta.env.DEV) return ''
  // #endif
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8087'
}
export function saveBaseUrl(value) { write('jc-api-base', normalizeBaseUrl(value)) }
export function getDefaultBaseUrl() { return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8087' }
