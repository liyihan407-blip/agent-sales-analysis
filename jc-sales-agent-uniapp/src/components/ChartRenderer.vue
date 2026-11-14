<template>
  <view class="chart-card">
    <view class="chart-title">{{ title }}</view>
    <canvas v-if="supported" :id="canvasId" :canvas-id="canvasId" class="chart-canvas" />
    <view v-else class="muted">当前图表以数据表展示</view>
    <view class="row table-toggle" @tap="expanded = !expanded"><text>原始数据 · {{ rows.length }} 项</text><text>{{ expanded ? '收起 −' : '展开 ＋' }}</text></view>
    <view v-if="expanded || !supported" class="data-table">
      <view v-for="(row, index) in rows" :key="index" class="data-row"><text>{{ row.label }}</text><text>{{ format(row.value) }}</text></view>
    </view>
  </view>
</template>
<script setup>
import { computed, ref, onMounted, watch, nextTick, getCurrentInstance } from 'vue'
import { chartData } from '../utils/reply.js'
const props = defineProps({ option: { type: Object, required: true }, chartId: { type: String, required: true } })
const instance = getCurrentInstance()
const canvasId = `chart-${props.chartId.replace(/[^\w-]/g, '')}`
const expanded = ref(false)
const colors = ['#3266ed', '#36ad98', '#f2ad4b', '#9469d4', '#ee7a80']
const series = computed(() => chartData(props.option))
const title = computed(() => (Array.isArray(props.option.title) ? props.option.title[0]?.text : props.option.title?.text) || '销售数据')
const supported = computed(() => series.value.length === 1 && ['bar', 'line', 'pie'].includes(series.value[0]?.type) && series.value[0].rows.length > 0)
const rows = computed(() => series.value.flatMap(s => s.rows.map(row => ({ ...row, label: series.value.length > 1 ? `${s.name} · ${row.name}` : row.name }))))
function format(n) { return Number(n.toFixed(2)).toLocaleString() }
async function draw() {
  if (!supported.value) return
  await nextTick()
  uni.createSelectorQuery().in(instance.proxy).select(`#${canvasId}`).boundingClientRect(rect => {
    if (!rect?.width) return
    const ctx = uni.createCanvasContext(canvasId, instance.proxy)
    const w = rect.width, h = 220
    const data = series.value[0].rows, type = series.value[0].type
    ctx.clearRect(0, 0, w, h)
    ctx.setFontSize(10); ctx.setFillStyle('#78869c')
    if (type === 'pie') {
      const total = data.reduce((sum, row) => sum + Math.max(0, row.value), 0)
      if (total <= 0 || data.some(row => row.value < 0)) {
        ctx.fillText('当前数值不适合饼图，请查看原始数据', 8, 100)
      } else {
        let angle = -Math.PI / 2
        const cx = w / 2, cy = 90, radius = Math.min(w * .3, 72)
        data.forEach((row, i) => {
          const end = angle + row.value / total * 2 * Math.PI
          ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, radius, angle, end)
          ctx.closePath(); ctx.setFillStyle(colors[i % colors.length]); ctx.fill(); angle = end
        })
        data.slice(0, 3).forEach((row, i) => {
          ctx.setFillStyle(colors[i % colors.length]); ctx.fillRect(8, 176 + i * 15, 7, 7)
          ctx.setFillStyle('#667c9d'); ctx.fillText(`${row.name.slice(0, 10)}  ${(row.value / total * 100).toFixed(1)}%`, 22, 183 + i * 15)
        })
      }
    } else {
      const min = Math.min(0, ...data.map(row => row.value)), max = Math.max(0, ...data.map(row => row.value))
      const range = max - min || 1
      const left = 50, right = w - 12, top = 18, bottom = 177
      const y = value => bottom - (value - min) / range * (bottom - top)
      for (let tick = 0; tick <= 4; tick++) {
        const val = min + range * tick / 4, yy = y(val)
        ctx.setStrokeStyle('#e9edf5'); ctx.beginPath(); ctx.moveTo(left, yy); ctx.lineTo(right, yy); ctx.stroke()
        ctx.setFillStyle('#78869c'); ctx.fillText(Math.abs(val) >= 10000 ? `${(val / 10000).toFixed(1)}万` : `${Math.round(val)}`, 0, yy + 4)
      }
      const step = (right - left) / data.length
      ctx.setStrokeStyle('#3266ed'); ctx.setLineWidth(2)
      if (type === 'line') {
        ctx.beginPath()
        data.forEach((row, i) => { const x = left + step * (i + .5); i ? ctx.lineTo(x, y(row.value)) : ctx.moveTo(x, y(row.value)) })
        ctx.stroke()
      }
      data.forEach((row, i) => {
        const x = left + step * (i + .5), yy = y(row.value)
        ctx.setFillStyle('#3266ed')
        if (type === 'bar') ctx.fillRect(x - step * .3, Math.min(yy, y(0)), step * .6, Math.max(1, Math.abs(y(0) - yy)))
        else { ctx.beginPath(); ctx.arc(x, yy, 3, 0, Math.PI * 2); ctx.fill() }
        if (i % Math.max(1, Math.ceil(data.length / 4)) === 0) {
          ctx.setFillStyle('#78869c'); ctx.fillText(row.name.slice(0, 6), x - 15, 199)
        }
      })
    }
    ctx.draw()
  }).exec()
}
onMounted(draw)
watch(() => props.option, draw, { deep: true })
</script>
<style scoped>
.chart-card { margin-top: 24rpx; border-top: 1rpx solid #edf0f6; padding-top: 24rpx; }
.chart-title { font-size: 27rpx; font-weight: 600; margin-bottom: 20rpx; }
.chart-canvas { width: 100%; height: 220px; }
.table-toggle { font-size: 22rpx; color: #3266ed; padding: 18rpx 0; }
.data-row { display: flex; justify-content: space-between; padding: 16rpx 0; border-bottom: 1rpx solid #edf0f6; font-size: 23rpx; }
.data-row text:first-child { flex: 1; padding-right: 16rpx; }
</style>
