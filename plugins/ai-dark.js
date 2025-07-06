import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text) {
      throw `Example: *${usedPrefix + command}* what is a black hole?`;
    }

    await m.react('🤖');

    const prompt = encodeURIComponent(text);
    const apiurl = `https://llama.gtech-apiz.workers.dev/?apikey=APIKEY&text=${prompt}`; // Use valid key

    const result = await fetch(apiurl);
    const rawText = await result.text();
    console.log('[DEBUG] Raw response:', rawText);

    let json;
    try {
      json = JSON.parse(rawText);
    } catch (e) {
      throw '❌ Response is not JSON:\n' + rawText;
    }

    if (!json?.data?.response) throw '❌ No response from AI';

    const replyText = json.data.response;
    m.reply(replyText);

  } catch (error) {
    console.error('[AI Error]', error);
    m.reply('❌ ' + (error.message || error));
  }
};

handler.help = ['darky'];
handler.tags = ['ai'];
handler.command = ['darky', 'darkgpt'];
handler.limit = true

export default handler;
