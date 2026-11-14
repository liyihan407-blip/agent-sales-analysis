<template>
  <view class="page"><text class="eyebrow">CONNECTION</text><view class="title">连接你的工作环境</view>
    <view class="card"><text class="label">后端服务器地址</text><input v-model="baseUrl" class="field" placeholder="http://192.168.1.10:8087" :maxlength="250" />
      <view class="muted note">电脑模拟器可使用 localhost；手机真机请填写电脑的局域网 IP，并保持在同一网络。正式环境使用 HTTPS 地址。</view>
      <view v-if="error" class="error">{{ error }}</view><button class="primary" @tap="save">保存连接设置</button>
      <button class="secondary reset" @tap="reset">恢复默认配置</button>
    </view>
    <view class="card"><view class="label">当前连接</view><text class="muted" selectable>{{ current || '当前站点（开发代理）' }}</text><view class="muted note">变更连接后需要重新登录。</view></view>
  </view>
</template>
<script setup>
import { ref } from 'vue'
import { getBaseUrl, getDefaultBaseUrl, saveBaseUrl, normalizeBaseUrl } from '../../utils/config.js'
import { remove } from '../../utils/storage.js'
import { expireSession } from '../../utils/session.js'
import { chat } from '../../stores/chat.js'
const current = ref(getBaseUrl()), baseUrl = ref(current.value || getDefaultBaseUrl()), error = ref('')
function change(action) {
  if (chat.busy) { error.value = '请等待当前分析完成后再修改连接'; return }
  uni.showModal({ title: '切换服务器', content: '切换后将退出当前账号，需要重新登录。', success: result => {
    if (!result.confirm) return
    action(); expireSession()
  } })
}
function save() {
  error.value = ''
  try { const normalized = normalizeBaseUrl(baseUrl.value); change(() => saveBaseUrl(normalized)) } catch (e) { error.value = e.message }
}
function reset() { change(() => remove('jc-api-base')) }
</script>
<style scoped>
.card { margin-top: 32rpx; }.label { margin-top: 0; }.note { margin: 24rpx 0; }.reset { margin-top: 20rpx; }
</style>
