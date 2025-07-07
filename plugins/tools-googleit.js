import fetch from 'node-fetch';

const fallbackImage = 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`🔍 Provide a query.\nExample: *${usedPrefix + command} Supreme Leader*`);

  try {
    const res = await fetch(`https://gtech-api-xtp1.onrender.com/api/google/search?apikey=APIKEY&query=${encodeURIComponent(text)}`);
    const data = await res.json();

    if (!data.status || !Array.isArray(data.results) || data.results.length === 0)
      return m.reply('❌ No search results found.');

    const results = data.results.slice(0, 5); // Limit to top 5 results
    const formatted = results.map((r, i) => `*${i + 1}. ${r.link}*\n${r.description}`).join('\n\n');

    await conn.sendMessage(m.chat, {
      image: { url: fallbackImage },
      caption: `*🔍 Google Search Results:*\n\n${formatted}\n\n🌐 Powered by MEGA-AI`,
    }, { quoted: m });

  } catch (err) {
    console.error('Google Search Error:', err);
    m.reply('⚠️ An error occurred while fetching search results.');
  }
};


handler.tags = ['internet'];
handler.help = ['googleit <query>'];
handler.command = /^(google|googleit)$/i;
handler.limit = true
export default handler;
