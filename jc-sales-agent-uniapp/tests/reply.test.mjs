import test from 'node:test'
import assert from 'node:assert/strict'
import { parseReply, chartData } from '../src/utils/reply.js'

test('preserves plain replies and Markdown without interpreting HTML', () => {
  const content = '**本月表现**\n销售额增长 12%。<script>bad</script>'
  assert.deepEqual(parseReply(content), { content, chartOption: null, chartError: false })
})
test('extracts code-fenced chart with escaped quotes, braces and trailing analysis', () => {
  const option = { title: { text: '产品"{A}' }, xAxis: { data: ['一月'] }, series: [{ type: 'line', data: [100] }] }
  const reply = parseReply('业绩上涨\nCHART_JSON:```json\n' + JSON.stringify(option) + '\n```\n建议关注新品')
  assert.deepEqual(reply.chartOption, option)
  assert.equal(reply.content, '业绩上涨\n\n建议关注新品')
})
test('broken chart has a visible fallback without exposing raw JSON', () => {
  assert.deepEqual(parseReply('分析完成\nCHART_JSON:{"series":['), { content: '分析完成', chartOption: null, chartError: true })
})
test('normalizes line, bar, pie, multiple series and rejects non-finite values', () => {
  const result = chartData({ xAxis: [{ data: ['甲', '乙'] }], series: [
    { name: '销售额', type: 'bar', data: [23, -5] },
    { type: 'pie', data: [{ name: '华东', value: 8 }, { name: '无效', value: 'oops' }] },
  ] })
  assert.deepEqual(result[0].rows, [{ name: '甲', value: 23 }, { name: '乙', value: -5 }])
  assert.deepEqual(result[1].rows, [{ name: '华东', value: 8 }])
})
