import { parseReply } from './reply.js'

export function createConversationManager(state, { send: sendTransport, save, clearRemote, getOwner }) {
  let pending = null
  let generation = 0
  const persist = () => save(getOwner(), state.sessions)
  function stop() {
    generation++
    pending?.abort()
    pending = null
    for (const session of state.sessions) {
      for (const m of session.messages) if (m.status === 'pending') {
        m.status = 'cancelled'; m.content = '已停止等待，服务端可能仍在处理。'
      }
    }
    state.busy = false
    persist()
  }
  function create() {
    if (state.busy) return null
    const id = `mobile-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
    const session = { id, title: '新会话', createdAt: new Date().toISOString(), messages: [] }
    state.sessions.unshift(session)
    state.activeId = id
    persist()
    // Read back through state so Vue callers receive the reactive session proxy.
    return state.sessions[0]
  }
  async function send(text) {
    const message = text.trim()
    if (!message || state.busy) return
    if (message.length > 2000) throw new Error('问题不能超过 2000 字')
    const session = state.sessions.find(s => s.id === state.activeId) || create()
    if (!session.messages.length) session.title = message.slice(0, 24)
    session.messages.push({ id: `u-${Date.now()}`, role: 'user', content: message, status: 'done' })
    session.messages.push({ id: `a-${Date.now()}`, role: 'assistant', content: '', status: 'pending' })
    const answer = session.messages[session.messages.length - 1]
    state.busy = true
    const run = ++generation
    const owner = getOwner()
    persist()
    try {
      pending = sendRequest(session.id, message)
      const data = await pending.promise
      if (generation !== run || getOwner() !== owner) return
      if (typeof data?.reply !== 'string' || !data.reply.trim()) throw new Error('服务器未返回有效回答，请稍后重试')
      Object.assign(answer, parseReply(data.reply), { status: 'done', durationMs: data.durationMs })
    } catch (error) {
      if (generation !== run || getOwner() !== owner) return
      answer.status = 'error'
      answer.content = error.message || '请求失败，请稍后重试'
    } finally {
      if (generation === run) { state.busy = false; pending = null; persist() }
    }
  }
  // Keep the injected transport separate from the public send method.
  function sendRequest(sessionId, message) { return sendTransport({ sessionId, message }) }
  async function remove(id) {
    if (state.busy) throw new Error('请等待当前分析完成')
    const owner = getOwner()
    await clearRemote(id)
    if (getOwner() !== owner) return
    state.sessions = state.sessions.filter(s => s.id !== id)
    if (state.activeId === id) state.activeId = state.sessions[0]?.id || null
    persist()
  }
  return { create, send, stop, remove }
}
