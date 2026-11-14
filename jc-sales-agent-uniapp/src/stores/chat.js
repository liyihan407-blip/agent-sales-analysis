import { reactive } from 'vue'
import { read, write } from '../utils/storage.js'
import { createConversationManager } from '../utils/conversations.js'
import { sendChat, deleteChat } from '../api/request.js'

let owner = ''
export const chat = reactive({ sessions: [], activeId: null, busy: false })
export const conversations = createConversationManager(chat, {
  send: sendChat,
  clearRemote: deleteChat,
  getOwner: () => owner,
  save: (id, sessions) => { if (id) write(`jc-sessions-${id}`, sessions) },
})
export function loadChats(repId) {
  const next = String(repId || '')
  if (owner === next) return
  conversations.stop()
  owner = next
  const stored = next ? read(`jc-sessions-${next}`, []) : []
  chat.sessions = Array.isArray(stored) ? stored.filter(s => s?.id && Array.isArray(s.messages)) : []
  for (const session of chat.sessions) for (const message of session.messages) {
    if (message.status === 'pending') {
      message.status = 'error'
      message.content = '上次请求已中断，请重新提问。'
    }
  }
  chat.activeId = chat.sessions[0]?.id || null
}
