import fetch from 'node-fetch';

let handler = async (m, { conn, text }) => {
  if (!text) {
    return m.reply("Enter the name of the app to search for on the Play Store.");
  }

  try {
    await m.react('⏳');

    const apiKey = 'APIKEY'; // Replace with your actual API key
    const query = encodeURIComponent(text);
    const apiUrl = `https://gtech-api-xtp1.onrender.com/api/playstore?query=${query}&apikey=${apiKey}`;

    const response = await fetch(apiUrl);
    if (!response.ok) {
      await m.react('❌');
      return m.reply(`Failed to fetch data: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Play Store API Response:", data);

    // Check if the API returned a successful status and results array
    if (!data.status || !data.result || data.result.length === 0) {
      await m.react('✅');
      return m.reply("No apps were found on the Play Store for the application you were looking for.");
    }

    let caption = `Play Store search results for *${text}*:\n\n`;

    // Loop through the results and format the response
    data.result.forEach((result, index) => { // <-- Changed from data.forEach to data.result.forEach
      if (result.name && result.link && result.developer && result.rating_Num) {
        caption += `
${index + 1}. *Title:* ${result.name}
*Developer:* ${result.developer}
*Rating:* ${result.rating_Num} stars
*Download Link:* ${result.link}
*Developer Page:* ${result.link_dev || 'Not available'}
`;
      }
    });

    // Send the formatted message with app details
    await m.reply(caption);
    
    // React with "done" emoji after the process is complete
    await m.react('✅');

  } catch (error) {
    console.error("Error in Play Store search:", error);
    await m.react('❌'); // React with error emoji on exception
    m.reply("An error occurred while searching for apps on the Play Store.");
  }
};

handler.help = ['playstore'];
handler.tags = ['search'];
handler.command = /^(playstore)$/i;

export default handler;
