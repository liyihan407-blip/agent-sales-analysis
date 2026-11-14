<template>
  <view class="chat-page">
    <view class="toolbar row"><view><text class="eyebrow">YOUR SALES COPILOT</text><view class="toolbar-title">{{ active?.title || '销售分析助手' }}</view></view><button class="new-button" :disabled="chat.busy" @tap="newChat">＋ 新会话</button></view>
    <scroll-view class="messages" scroll-y :scroll-into-view="scrollTarget" :scroll-with-animation="true">
      <view v-if="!active?.messages.length" class="welcome">
        <view class="spark">✦</view><view class="title">今天，想了解哪些业绩？</view>
        <view class="muted">从一个问题开始，让数据为你的决策提供依据。</view>
        <view class="suggestions">
          <view v-for="(item, index) in suggestions" :key="item.question" class="suggestion" @tap="ask(item.question)">
            <view class="row"><text class="suggestion-title">{{ item.title }}</text><text class="number">0{{ index + 1 }} ↗</text></view><view class="muted">{{ item.question }}</view>
          </view>
        </view>
        <view class="muted privacy">分析范围根据账号权限确定</view>
      </view>
      <view v-else class="message-list">
        <MessageBubble v-for="message in active.messages" :key="message.id" :message="message" />
      </view>
      <view :id="bottomId" style="height: 24rpx" />
    </scroll-view>
    <view class="composer">
      <view v-if="chat.busy" class="waiting row"><text>正在查询数据并生成分析…</text><text class="stop" @tap="conversations.stop">停止等待</text></view>
      <view class="input-row"><textarea v-model="input" class="message-input" :maxlength="2000" :auto-height="true" :disabled="chat.busy" placeholder="例如：最近 6 个月销售额有什么变化？" :show-confirm-bar="false" /><button class="send" :disabled="chat.busy || !input.trim()" @tap="send">↑</button></view>
      <view class="disclaimer">AI 分析仅供参考，请以业务原始数据为准</view>
    </view>
  </view>
</template>
<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import MessageBubble from '../../components/MessageBubble.vue'
import { chat, conversations } from '../../stores/chat.js'
import { syncSession } from '../../utils/session.js'
const input = ref(''), scrollTarget = ref(''), bottomId = ref('bottom-a')
const active = computed(() => chat.sessions.find(s => s.id === chat.activeId))
const suggestions = [
  { title: '业绩概览', question: '请分析本月销售业绩，并给出重点建议' },
  { title: '趋势追踪', question: '用折线图展示最近 6 个月的销售趋势' },
  { title: '产品洞察', question: '本月销售额最高的产品有哪些？' },
  { title: '异常发现', question: '检查当前销售数据是否存在异常' },
]
onShow(syncSession)
watch(() => JSON.stringify(active.value?.messages), async () => {
  await nextTick(); bottomId.value = bottomId.value === 'bottom-a' ? 'bottom-b' : 'bottom-a'
  await nextTick(); scrollTarget.value = bottomId.value
})
function newChat() { if (syncSession()) conversations.create() }
function ask(text) { input.value = text; send() }
async function send() {
  if (!syncSession() || chat.busy || !input.value.trim()) return
  const text = input.value; input.value = ''
  try { await conversations.send(text) } catch (e) { uni.showToast({ title: e.message, icon: 'none' }); input.value = text }
}
</script>
<style scoped>
.chat-page { height: 100%; height: calc(100vh - var(--window-top) - var(--window-bottom)); display: flex; flex-direction: column; }
.toolbar { padding: 24rpx 32rpx; background: #f5f7fb; }
.toolbar-title { font-size: 29rpx; font-weight: 600; margin-top: 8rpx; max-width: 420rpx; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.new-button { font-size: 23rpx; color: #3266ed; background: #eaf0ff; line-height: 2.4; padding: 0 20rpx; }
.messages { flex: 1; height: 0; min-height: 0; }
.welcome { padding: 54rpx 32rpx 24rpx; }
.spark { background: #e7eeff; color: #3266ed; font-size: 56rpx; width: 110rpx; height: 110rpx; border-radius: 32rpx; text-align: center; line-height: 110rpx; }
.welcome .title { font-size: 41rpx; margin: 32rpx 0 16rpx; }
.suggestions { margin-top: 40rpx; }
.suggestion { background: #fff; border: 1rpx solid #e3e9f4; border-radius: 24rpx; padding: 26rpx; margin-bottom: 18rpx; }
.suggestion-title { font-weight: 600; margin-bottom: 10rpx; }
.number { color: #8e9fbe; font-size: 23rpx; }
.privacy { font-size: 21rpx; text-align: center; margin-top: 26rpx; }
.message-list { padding: 24rpx; }
.composer { padding: 16rpx 24rpx 20rpx; padding-bottom: max(20rpx, env(safe-area-inset-bottom)); background: #f5f7fb; border-top: 1rpx solid #e7ecf4; }
.input-row { display: flex; align-items: flex-end; background: #fff; border: 1rpx solid #dce4f2; border-radius: 24rpx; padding: 18rpx; }
.message-input { flex: 1; min-height: 54rpx; max-height: 180rpx; font-size: 27rpx; padding: 12rpx 10rpx; }
.send { margin-left: 12rpx; color: white; background: #3266ed; width: 68rpx; height: 68rpx; line-height: 68rpx; padding: 0; font-size: 44rpx; }
.disclaimer { color: #94a0b3; font-size: 20rpx; text-align: center; padding-top: 14rpx; }
.waiting { color: #667c9d; font-size: 23rpx; padding: 4rpx 10rpx 20rpx; }
.stop { color: #3266ed; padding: 8rpx; }
</style>
