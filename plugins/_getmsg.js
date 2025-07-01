//import db from '../lib/database.js'

export async function all(m) {
  // Early return conditions
  if (!m.chat.endsWith('.net') || m.fromMe || m.key.remoteJid.endsWith('status@broadcast')) return

  if (global.db?.data?.chats?.[m.chat]?.isBanned) return
  if (global.db?.data?.users?.[m.sender]?.banned) return
  if (m.isBaileys) return

  // Defensive check for msgs object existence
  let msgs = global.db?.data?.msgs
  if (!msgs || typeof msgs !== 'object') return

  if (!(m.text in msgs)) return

  // Deserialize the stored message, converting Buffers
  let _m = this.serializeM(
    JSON.parse(JSON.stringify(msgs[m.text]), (_, v) => {
      if (
        v !== null &&
        typeof v === 'object' &&
        'type' in v &&
        v.type === 'Buffer' &&
        'data' in v &&
        Array.isArray(v.data)
      ) {
        return Buffer.from(v.data)
      }
      return v
    })
  )

  // Forward the message
  await _m.copyNForward(m.chat, true)
}
