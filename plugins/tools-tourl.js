import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'
import axios from 'axios'
import FormData from 'form-data'
import { fileTypeFromBuffer } from 'file-type'

let handler = async m => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''

  if (!mime) throw '✳️ Respond to an image, video, sticker, or audio'

  let mediaBuffer = await q.download()

  if (mediaBuffer.length > 10 * 1024 * 1024) {
    throw '✴️ Media size exceeds 10 MB. Please upload a smaller file.'
  }

  try {
    const fileType = await fileTypeFromBuffer(mediaBuffer)
    if (!fileType?.ext) throw '❌ Could not determine file type.'

    const form = new FormData()
    form.append('reqtype', 'fileupload')
    form.append('userhash', '') // Optional: Put your Catbox userhash here if you want persistent upload
    form.append('fileToUpload', mediaBuffer, `upload.${fileType.ext}`)

    const uploadRes = await axios.post('https://catbox.moe/user/api.php', form, {
      headers: form.getHeaders()
    })

    console.log('[Catbox Upload Response]', uploadRes.data)

    const url = uploadRes.data
    if (!url.startsWith('https://')) throw 'Upload failed: Invalid URL returned'

    const fileSizeMB = (mediaBuffer.length / (1024 * 1024)).toFixed(2)
    m.reply(`✅ *Upload Successful!*
📎 *URL:* ${url}
💾 *Size:* ${fileSizeMB} MB`)

  } catch (e) {
    console.error('[Catbox Upload Error]', e)
    m.reply(`❌ Upload failed: ${e.message || e}`)
  }
}

handler.help = ['tourl']
handler.tags = ['tools']
handler.command = ['url', 'tourl']
handler.limit = true
export default handler
