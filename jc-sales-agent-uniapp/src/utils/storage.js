export function read(key, fallback = null) {
  try { const value = uni.getStorageSync(key); return value === '' || value == null ? fallback : value } catch { return fallback }
}
export function write(key, value) {
  try { uni.setStorageSync(key, value) } catch { uni.showToast({ title: '本地存储空间不足，记录可能未保存', icon: 'none' }) }
}
export function remove(key) { uni.removeStorageSync(key) }
