import test from 'node:test'
import assert from 'node:assert/strict'
import { login, sendChat, deleteChat, request } from '../src/api/request.js'
import { normalizeBaseUrl } from '../src/utils/config.js'

test('validates backend addresses', () => {
  assert.equal(normalizeBaseUrl(' http://192.168.1.2:8087/ '), 'http://192.168.1.2:8087')
  assert.throws(() => normalizeBaseUrl('javascript:alert(1)'))
  assert.throws(() => normalizeBaseUrl('https://api.example.com?token=abc'))
})
test('mocked uni.request matches backend login, token, chat, deletion, 401 and cancellation contracts', async () => {
  const received = [], events = [], values = new Map()
  values.set('jc-api-base', 'http://localhost:8087')
  globalThis.uni = {
    getStorageSync: key => values.get(key) ?? '', removeStorageSync: key => values.delete(key),
    $emit: event => events.push(event),
    request(options) {
      let aborted = false
      const path = new URL(options.url).pathname
      received.push({ path, method: options.method, token: options.header['sa-token'], body: options.data ?? null })
      queueMicrotask(() => {
        if (aborted) return
        const data = path === '/auth/login' ? { token: 'test-token', username: '测试员工', role: 'SALES_REP' } :
          path === '/agent/chat' ? { reply: '销售额为 100 元', durationMs: 25 } : {}
        options.success({ statusCode: path === '/expired' ? 401 : 200, data })
      })
      return { abort() { aborted = true; options.fail({ errMsg: 'request:fail abort' }) } }
    },
  }
  try {
    const user = await login('12'); values.set('jc-token', user.token)
    const answer = await sendChat({ sessionId: 'mobile-test', message: '分析销售' }).promise
    assert.equal(answer.reply, '销售额为 100 元')
    assert.deepEqual(received[0].body, { repId: 12 })
    assert.equal(received[1].token, 'test-token')
    assert.deepEqual(received[1].body, { sessionId: 'mobile-test', message: '分析销售' })
    await deleteChat('mobile-test')
    assert.equal(received[2].method, 'DELETE')
    await assert.rejects(request('/expired').promise, /登录已过期/)
    assert.equal(values.has('jc-token'), false)
    assert.deepEqual(events, ['jc-auth-expired'])
    const pending = request('/cancel'); pending.abort()
    await assert.rejects(pending.promise, /取消/)
  } finally { delete globalThis.uni }
})
