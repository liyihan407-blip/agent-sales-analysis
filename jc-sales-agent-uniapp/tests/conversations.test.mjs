import test from 'node:test'
import assert from 'node:assert/strict'
import { createConversationManager } from '../src/utils/conversations.js'

function fixture() {
  const state = { sessions: [], activeId: null, busy: false }
  let resolve, reject, owner = '1', calls = 0, aborts = 0
  const manager = createConversationManager(state, {
    send() { calls++; return { promise: new Promise((yes, no) => { resolve = yes; reject = no }), abort() { aborts++ } } },
    save() {}, clearRemote: async () => {}, getOwner: () => owner,
  })
  return { state, manager, resolve: x => resolve(x), getResolver: () => resolve, reject: x => reject(x), owner: x => { owner = x }, calls: () => calls, aborts: () => aborts }
}
test('sends once while busy and keeps server conversation ID for follow-up questions', async () => {
  const f = fixture()
  const pending = f.manager.send('分析本月销售')
  const id = f.state.activeId
  await f.manager.send('不应该重复提交')
  assert.equal(f.calls(), 1)
  f.resolve({ reply: '销售额 100 元', durationMs: 1000 })
  await pending
  assert.equal(f.state.sessions[0].messages[1].content, '销售额 100 元')
  assert.equal(f.state.busy, false)
  const next = f.manager.send('同比呢？')
  f.resolve({ reply: '同比增加' }); await next
  assert.equal(f.state.activeId, id)
})
test('stopping ignores late responses and does not clobber a newer request', async () => {
  const f = fixture()
  const first = f.manager.send('旧问题')
  const oldResolve = f.getResolver()
  f.manager.stop()
  assert.equal(f.aborts(), 1)
  const second = f.manager.send('新问题')
  oldResolve({ reply: '迟到的回答' }); await first
  assert.equal(f.state.sessions[0].messages[1].status, 'cancelled')
  assert.equal(f.state.busy, true)
  f.resolve({ reply: '新回答' }); await second
  assert.equal(f.state.sessions[0].messages[3].content, '新回答')
})
test('request errors and empty server responses leave a visible retryable error', async () => {
  const f = fixture()
  let pending = f.manager.send('问题')
  f.reject(new Error('没有权限')); await pending
  assert.equal(f.state.sessions[0].messages[1].content, '没有权限')
  pending = f.manager.send('再问一次')
  f.resolve({}); await pending
  assert.equal(f.state.sessions[0].messages[3].status, 'error')
  assert.equal(f.state.busy, false)
})
test('blocks destructive changes while a request is pending', async () => {
  const f = fixture(), pending = f.manager.send('问题')
  assert.equal(f.manager.create(), null)
  await assert.rejects(f.manager.remove(f.state.activeId), /等待/)
  f.resolve({ reply: '完成' }); await pending
  await f.manager.remove(f.state.activeId)
  assert.equal(f.state.sessions.length, 0)
})
test('invalidates an old account request before loading another account', async () => {
  const f = fixture(), pending = f.manager.send('账号一的问题')
  const old = f.state.sessions[0]
  f.manager.stop(); f.owner('2'); f.state.sessions = []; f.state.activeId = null
  f.resolve({ reply: '账号一的机密回答' }); await pending
  assert.equal(f.state.sessions.length, 0)
  assert.notEqual(old.messages[1].content, '账号一的机密回答')
})
