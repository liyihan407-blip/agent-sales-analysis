<template>
  <view class="page">
    <text class="eyebrow">MY WORKSPACE</text><view class="title">我的工作台</view>
    <view class="card profile"><view class="avatar">{{ auth.user?.username?.slice(0, 1) || '我' }}</view><view><view class="username">{{ auth.user?.username || '未登录' }}</view><view class="muted">员工 ID · {{ auth.user?.repId || '—' }}</view><text class="pill">{{ roleName }}</text></view></view>
    <view class="card"><view class="row"><text>当前设备的会话</text><text class="count">{{ chat.sessions.length }}</text></view><view class="muted note">会话按服务器和员工账号分别保存在本机，暂不与网页端同步。</view></view>
    <view class="card menu" @tap="settings"><view class="row"><text>连接设置</text><text>›</text></view><view class="muted">更换开发环境或正式服务器</view></view>
    <view class="card"><view class="row"><text>集驰销售助手</text><text class="muted">v1.0.0</text></view><view class="muted note">销售查询、趋势分析与图表展示。分析结果请结合业务数据核实。</view></view>
    <button class="danger" :disabled="leaving" @tap="signOut">退出登录</button>
  </view>
</template>
<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { auth } from '../../stores/auth.js'
import { chat, conversations } from '../../stores/chat.js'
import { logout } from '../../api/request.js'
import { syncSession, expireSession } from '../../utils/session.js'
const leaving = ref(false)
const roleName = computed(() => ({ SALES_DIRECTOR: '销售总监', SALES_MANAGER: '销售经理', SALES_REP: '销售代表' })[auth.user?.role] || auth.user?.role || '员工')
onShow(syncSession)
function settings() { uni.navigateTo({ url: '/pages/settings/index' }) }
function signOut() {
  uni.showModal({ title: '退出登录', content: '确认退出当前账号？', success: async result => {
    if (!result.confirm) return
    leaving.value = true; conversations.stop()
    try { await logout() } catch { /* Always clear local credentials, including offline logout. */ }
    finally { leaving.value = false; if (auth.token) expireSession() }
  } })
}
</script>
<style scoped>
.profile { display: flex; align-items: center; margin-top: 32rpx; }.avatar { background: #edf2ff; color: #3266ed; border-radius: 26rpx; padding: 25rpx 35rpx; font-size: 42rpx; margin-right: 26rpx; }.username { font-size: 36rpx; font-weight: 600; }.profile .pill { margin-top: 12rpx; }.count { font-size: 42rpx; color: #3266ed; font-weight: 700; }.note { margin-top: 16rpx; }.menu .muted { margin-top: 14rpx; }
</style>
