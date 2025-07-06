import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const name = conn.getName(m.sender)

  if (!text) {
    throw `Hi *${name}*, do you want to talk? Respond with *${usedPrefix + command}* (your message)\n\n📌 Example: *${usedPrefix + command}* Hi bot`
  }

  await m.react('🗣️')

  const prompt = encodeURIComponent(text)
  const url = `https://gtech-api-xtp1.onrender.com/api/gemini/ai?prompt=${prompt}&apikey=APIKEY`

  try {
    const res = await fetch(url)
    const json = await res.json()

    if (!json?.response) throw '❌ No response from API'

    const reply = json.response
    m.reply(reply)
  } catch (err) {
    console.error(err)
    m.reply('⚠️ Something went wrong while talking. Please try again later.')
  }
}

handler.help = ['alexa <text>']
handler.tags = ['fun']
handler.command = /^(alexa)$/i
handler.limit = true

export default handler
