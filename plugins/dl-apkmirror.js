import fetch from 'node-fetch';

let handler = async (m, { conn, text }) => {
  if (!text) {
    return m.reply("Enter the name of the app to search for the mod.");
  }

  try {
    await m.react('⏳');

    const apiKey = 'APIKEY'; // Replace with your actual API key
    const query = encodeURIComponent(text);
    const apiUrl = `https://gtech-api-xtp1.onrender.com/api/apkmirror?query=${query}&apikey=${apiKey}`;

    const response = await fetch(apiUrl);
    if (!response.ok) {
      await m.react('❌');
      return m.reply(`Failed to fetch data: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("API Response:", data);

    if (!data.result || data.result.length === 0) {
      await m.react('✅');
      return m.reply("No mods were found for the application you were looking for.");
    }

    let caption = `Search results for *${text}*:\n\n`;

    data.result.forEach((result, index) => {
      if (result.title && result.url && result.updated && result.size && result.version) {
        caption += `
${index + 1}. *Title:* ${result.title}
*Version:* ${result.version}
*Size:* ${result.size}
*Updated:* ${result.updated}
*Download Link:* ${result.url}
`;
      }
    });

    await m.reply(caption);
    await m.react('✅');

  } catch (error) {
    console.error(error);
    await m.react('❌');
    m.reply("An error occurred while searching for the mod.");
  }
};
handler.help = ['apksearch'];
handler.tags = ['search'];
handler.command = /^(apksearch|searchapk)$/i;

export default handler;

