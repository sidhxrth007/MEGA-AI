import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('✳️ Please enter the name of a song.')

  m.react('🎶')

  try {
    // SEARCH
    const query = encodeURIComponent(text)
    const searchUrl = `https://gtech-api-xtp1.onrender.com/api/spotify/search?apikey=APIKEY&query=${query}`
    const searchRes = await fetch(searchUrl).then(res => res.json())

   
    if (!searchRes.status || !searchRes.result?.length) {
      return m.reply('❎ No matching songs found.')
    }

    const song = searchRes.result[0]
    const songLink = song.link

    // DOWNLOAD
    const downloadUrl = `https://gtech-api-xtp1.onrender.com/api/spotify/download?apikey=APIKEY&url=${encodeURIComponent(songLink)}`
    const dlRes = await fetch(downloadUrl).then(res => res.json())

   
    // ✅ Return if status false with custom message
    if (!dlRes.status) return m.reply(`❎ ${dlRes.message}`);

    // ✅ Fallback if still no file URL
    if (!dlRes.result?.download_url) {
      return m.reply(`❎ Song *${dlRes.result?.title || song.name}* is not available for download.`)
    }

    const fileUrl = dlRes.result.download_url
    const title = dlRes.result.title || song.name
    const artist = dlRes.result.artistNames?.join(', ') || song.artists
    const thumbnail = dlRes.result.albumImage || 'https://wallpapercave.com/wp/wp7932387.jpg'
    const duration = dlRes.result.duration || 'Unknown'

    // SEND AUDIO
    await conn.sendMessage(m.chat, {
      audio: { url: fileUrl },
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`,
      ptt: false,
      contextInfo: {
        mentionedJid: [m.sender],
        externalAdReply: {
          title: title,
          body: `🎵 ${artist} • ${duration}`,
          thumbnailUrl: thumbnail,
          mediaType: 1,
          renderLargerThumbnail: true,
          sourceUrl: songLink
        }
      }
    }, { quoted: m })

    await m.react('✅')

  } catch (err) {
    console.error('[SPOTIFY ERROR]', err)
    if (!err.message.includes('aborted') && !err.message.includes('closed')) {
      m.reply('❎ Unexpected error occurred. Please try again.')
    }
  }
}

handler.help = ['spotify <song name>']
handler.tags = ['downloader']
handler.command = /^(spotify|play|audio|song)$/i
handler.limit = true
export default handler
