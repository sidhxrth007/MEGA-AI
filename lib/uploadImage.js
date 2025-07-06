import fetch from 'node-fetch'
import FormData from 'form-data'
import { fileTypeFromBuffer } from 'file-type'

export default async function uploadToCatbox(buffer) {
  const { ext, mime } = await fileTypeFromBuffer(buffer)
  if (!ext || !mime) throw '❌ Could not determine file type.'

  const form = new FormData()
  form.append('reqtype', 'fileupload')
  form.append('fileToUpload', buffer, `file.${ext}`)

  let attempt = 0
  while (attempt < 3) {
    try {
      const res = await fetch('https://catbox.moe/user/api.php', {
        method: 'POST',
        body: form,
        headers: form.getHeaders(),
        timeout: 15000 // optional: 15 seconds timeout
      })

      const url = await res.text()
      if (!url.startsWith('https://')) throw new Error(`Upload failed: ${url}`)
      return url
    } catch (err) {
      attempt++
      console.error(`[Catbox Attempt ${attempt}]`, err)
      if (attempt >= 3) throw '❌ Upload failed after multiple attempts.'
    }
  }
}
