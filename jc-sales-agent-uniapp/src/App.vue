<script>
import { expireSession } from './utils/session.js'
export default {
  onLaunch() { uni.$on('jc-auth-expired', expireSession) },
}
</script>

<style>
page { background: #f5f7fb; color: #18243d; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 28rpx; }
view, text, button, input, textarea { box-sizing: border-box; }
button { font-size: 28rpx; border-radius: 18rpx; margin: 0; }
button::after { border: none; }
button[disabled] { opacity: .45; }
.page { padding: 36rpx 32rpx; }
.card { background: #fff; border: 1rpx solid #e7ecf4; border-radius: 26rpx; padding: 30rpx; margin-bottom: 24rpx; }
.eyebrow { color: #667c9d; font-size: 22rpx; letter-spacing: 3rpx; }
.title { font-size: 44rpx; font-weight: 700; margin: 14rpx 0; }
.muted { color: #78869c; font-size: 25rpx; line-height: 1.7; }
.label { display: block; font-size: 26rpx; font-weight: 600; margin: 28rpx 0 14rpx; }
.field { background: #f4f6fa; padding: 24rpx; height: 92rpx; border-radius: 16rpx; font-size: 28rpx; }
.primary { background: #3266ed; color: #fff; font-weight: 600; }
.secondary { background: #edf2ff; color: #3266ed; }
.danger { color: #c84545; background: #fff1f1; }
.error { color: #c84545; font-size: 26rpx; line-height: 1.6; margin: 20rpx 0; }
.row { display: flex; align-items: center; justify-content: space-between; }
.pill { display: inline-block; padding: 8rpx 18rpx; background: #edf2ff; color: #3266ed; border-radius: 30rpx; font-size: 22rpx; }
</style>
