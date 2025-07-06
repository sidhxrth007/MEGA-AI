import fetch from 'node-fetch';
import pkg from 'nayan-media-downloaders';
const { ytdown } = pkg;

const fetchWithRetry = async (url, options, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    const response = await fetch(url, options);
    if (response.ok) return response;
    console.log(`Retrying... (${i + 1})`);
  }
  throw new Error('Failed to fetch media content after retries');
};

const handler = async (m, { args, conn }) => {
  if (!args.length) return m.reply('Please provide a YouTube URL.');

  const url = args.join(' ');
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
  if (!youtubeRegex.test(url)) {
    await m.react('❌');
    return m.reply('Invalid YouTube URL. Please provide a valid one.');
  }

  await m.react('⏳');

  try {
    const response = await ytdown(url);
    console.log('[YT DOWNLOAD RESPONSE]', response); // 👈 Log full response here

    const videoUrl = response?.data?.video_hd || response?.data?.video;
    if (!videoUrl) throw new Error('Video URL not found.');

    const title = response.data.title || 'YouTube Video';
    const author = response.data.channel || 'Unknown';
    const duration = response.data.duration || 'N/A';
    const views = response.data.views || '0';
    const uploadDate = response.data.date || 'Unknown';
    const thumbnail = response.data.thumbnail || '';

    const caption = `*𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 © 𝙼𝙴𝙶𝙰-𝙰𝙸*\n\n` +
      `*Title:* ${title}\n` +
      `*Author:* ${author}\n` +
      `*Duration:* ${duration}\n` +
      `*Views:* ${views}\n` +
      `*Uploaded on:* ${uploadDate}`;

    const mediaResponse = await fetchWithRetry(videoUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': '*/*'
      }
    });

    const contentType = mediaResponse.headers.get('content-type');
    if (!contentType || !contentType.includes('video'))
      throw new Error('Invalid content type');

    const arrayBuffer = await mediaResponse.arrayBuffer();
    const mediaBuffer = Buffer.from(arrayBuffer);
    if (mediaBuffer.length === 0) throw new Error('Downloaded file is empty');

    await conn.sendFile(m.chat, mediaBuffer, `ytvideo.mp4`, caption, m, false, {
      mimetype: 'video/mp4',
      thumbnail: thumbnail
    });

    await m.react('✅');
  } catch (error) {
    console.error('YT Error:', error.message);
    await m.reply('❌ Error fetching video. Please try again later.');
    await m.react('❌');
  }
};

handler.help = ['ytmp4 <url>'];
handler.tags = ['dl'];
handler.command = ['ytmp4', 'ytv'];
handler.limit = true
export default handler;
