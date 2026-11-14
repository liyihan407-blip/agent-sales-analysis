<template>
  <view class="message" :class="message.role">
    <view class="sender">{{ message.role === 'user' ? '你' : '✦ 集驰 AI' }}</view>
    <view class="bubble" :class="{ failed: message.status === 'error' }">
      <text v-if="message.status === 'pending'" class="pending">正在分析，请稍候…</text>
      <text v-else class="content" selectable>{{ message.content || (message.chartOption ? '已生成数据图表。' : '暂无内容') }}</text>
      <ChartRenderer v-if="message.chartOption" :option="message.chartOption" :chart-id="message.id" />
      <view v-if="message.chartError" class="error">图表数据未能识别，请尝试让助手重新生成。</view>
      <view v-if="message.status !== 'pending'" class="actions"><text @tap="copy">复制回答</text><text v-if="message.durationMs">{{ (message.durationMs / 1000).toFixed(1) }} 秒</text></view>
    </view>
  </view>
</template>
<script setup>
import ChartRenderer from './ChartRenderer.vue'
const props = defineProps({ message: { type: Object, required: true } })
function copy() {
  const text = props.message.content + (props.message.chartOption ? '\n' + JSON.stringify(props.message.chartOption, null, 2) : '')
  uni.setClipboardData({ data: text })
}
</script>
<style scoped>
.message { margin-bottom: 34rpx; }
.sender { color: #75839a; font-size: 22rpx; margin-bottom: 12rpx; }
.user .sender { text-align: right; }
.bubble { background: white; padding: 26rpx; border-radius: 0 24rpx 24rpx; border: 1rpx solid #e5eaf2; }
.user .bubble { background: #eaf0ff; border-color: #dce6ff; border-radius: 24rpx 0 24rpx 24rpx; margin-left: 70rpx; }
.content { white-space: pre-wrap; overflow-wrap: anywhere; font-size: 28rpx; line-height: 1.85; }
.pending { color: #667c9d; }
.failed { border-color: #efcaca; }
.actions { color: #8b98ac; display: flex; justify-content: space-between; font-size: 21rpx; margin-top: 22rpx; }
</style>
