<template>
  <view class="page">
    <text class="eyebrow">CONVERSATIONS</text><view class="title">每一次提问，都有迹可循</view>
    <view class="muted intro">{{ chat.sessions.length }} 个本地会话 · 仅保存在当前设备</view>
    <input v-model="search" class="field search" placeholder="搜索会话标题" />
    <view v-if="!filtered.length" class="card empty"><view>{{ search ? '没有找到相关会话' : '还没有会话记录' }}</view><view class="muted">到 AI 分析页面发起第一个问题吧。</view><button class="secondary" @tap="start">开始分析</button></view>
    <view v-for="session in filtered" :key="session.id" class="card session" @tap="open(session.id)">
      <view class="row"><text class="session-title">{{ session.title }}</text><text class="arrow">↗</text></view>
      <view class="preview">{{ preview(session) }}</view>
      <view class="row meta"><text>{{ date(session.createdAt) }} · {{ session.messages.length }} 条消息</text><text class="delete" @tap.stop="remove(session)">删除</text></view>
    </view>
  </view>
</template>
<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { chat, conversations } from '../../stores/chat.js'
import { syncSession } from '../../utils/session.js'
const search = ref('')
const filtered = computed(() => chat.sessions.filter(s => s.title.toLowerCase().includes(search.value.toLowerCase())))
onShow(syncSession)
function date(value) { const d = new Date(value); return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}` }
function preview(s) { return s.messages.filter(m => m.role === 'assistant').slice(-1)[0]?.content?.slice(0, 64) || '等待发起分析' }
function start() { uni.switchTab({ url: '/pages/chat/index' }) }
function open(id) {
  if (chat.busy) { uni.showToast({ title: '请先等待当前分析完成', icon: 'none' }); return }
  chat.activeId = id; start()
}
function remove(session) {
  uni.showModal({ title: '删除会话', content: '将删除当前设备中的记录，并清除服务端该会话的记忆。', success: async result => {
    if (!result.confirm) return
    try { await conversations.remove(session.id) } catch (e) { uni.showToast({ title: e.message, icon: 'none' }) }
  } })
}
</script>
<style scoped>
.title { font-size: 38rpx; }.intro { margin-bottom: 30rpx; }.search { margin-bottom: 28rpx; background: #eaf0f7; }
.session-title { font-weight: 600; max-width: 90%; }.arrow { color: #3266ed; }.preview { color: #7b889e; font-size: 25rpx; line-height: 1.7; margin: 20rpx 0; }
.meta { color: #94a0b2; font-size: 22rpx; }.delete { color: #b36666; padding: 10rpx; }.empty { text-align: center; padding: 60rpx 30rpx; }.empty button { margin-top: 30rpx; }
</style>
