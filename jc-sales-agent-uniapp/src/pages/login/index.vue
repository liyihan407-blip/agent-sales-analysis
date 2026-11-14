<template>
  <view class="page login-page">
    <view class="brand">JC</view>
    <text class="eyebrow">JICHI SALES INTELLIGENCE</text>
    <view class="title"><view>让销售数据</view><view>成为行动依据。</view></view>
    <view class="muted">用自然语言查询业绩、发现趋势，随时获取业务洞察。</view>
    <view class="card login-card">
      <view class="row"><text class="form-title">登录销售助手</text><text class="pill">移动工作台</text></view>
      <text class="label">员工 ID</text>
      <input v-model="repId" class="field" type="number" maxlength="15" placeholder="请输入已有员工 ID" @confirm="submit" />
      <view class="muted note">使用与网页端相同的员工账号。</view>
      <view v-if="error" class="error">{{ error }}</view>
      <button class="primary" :loading="loading" :disabled="loading" @tap="submit">登录并开始分析</button>
    </view>
    <button class="settings-link" @tap="openSettings">连接设置</button>
    <view class="muted footer">销售查询 · 趋势洞察 · 可视化分析</view>
  </view>
</template>
<script setup>
import { ref } from 'vue'
import { login } from '../../api/request.js'
import { acceptLogin } from '../../stores/auth.js'
import { syncSession } from '../../utils/session.js'
const repId = ref(''), loading = ref(false), error = ref('')
async function submit() {
  if (loading.value) return
  if (!/^[1-9]\d{0,14}$/.test(repId.value.trim())) { error.value = '请输入有效的员工 ID'; return }
  error.value = ''; loading.value = true
  try {
    const data = await login(repId.value.trim())
    acceptLogin(repId.value.trim(), data)
    syncSession()
    uni.switchTab({ url: '/pages/chat/index' })
  } catch (e) { error.value = e.message } finally { loading.value = false }
}
function openSettings() { uni.navigateTo({ url: '/pages/settings/index' }) }
</script>
<style scoped>
.login-page { padding-top: 80rpx; }
.brand { width: 90rpx; height: 90rpx; background: #3266ed; color: white; font-weight: 800; font-size: 38rpx; border-radius: 26rpx; text-align: center; line-height: 90rpx; margin-bottom: 40rpx; }
.title { font-size: 58rpx; line-height: 1.35; margin: 24rpx 0; }
.login-card { margin-top: 52rpx; }
.form-title { font-size: 31rpx; font-weight: 600; }
.note { margin: 18rpx 0 36rpx; font-size: 23rpx; }
.settings-link { color: #3266ed; background: transparent; }
.footer { text-align: center; margin-top: 40rpx; font-size: 22rpx; }
</style>
