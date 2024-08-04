// const { Telegraf } = require('telegraf');
// const axios = require('axios');
// const fs = require('fs');
// const path = require('path');
// const dotenv = require('dotenv');

// // Load environment variables from .env file
// dotenv.config();

// // Replace with your bot's API token
// const TOKEN = '7199609523:AAG3FTLS2oK-0NJOvGgLuO2mEp9iNippSEs'
// const bot = new Telegraf(TOKEN);

// bot.catch((err) => {
//   console.error('Bot encountered an error:', err);
// });

// // Listen for video messages
// bot.on('video', async (ctx) => {
//   const chatId = ctx.message.chat.id;
//   const fileId = ctx.message.video.file_id;

//   console.log('Chat ID:', chatId);
//   console.log('File ID:', fileId);

//   try {
//     // Get file details
//     const file = await ctx.telegram.getFile(fileId);
//     const filePath = file.file_path;
//     const fileUrl = `https://api.telegram.org/file/bot${TOKEN}/${filePath}`;

//     // Path to save the video
//     const downloadsFolder = path.join('C:', 'Users', 'tehmi', 'Downloads');
//     const uniqueFileName = `video_${Date.now()}.mp4`;
//     const fileName = path.join(downloadsFolder, uniqueFileName);

//     console.log('File URL:', fileUrl);
//     console.log('Saving to:', fileName);

//     // Ensure the downloads folder exists
//     if (!fs.existsSync(downloadsFolder)) {
//       fs.mkdirSync(downloadsFolder, { recursive: true });
//     }

//     // Download video with retry mechanism
//     await downloadFileWithRetry(fileUrl, fileName);

//     // Notify user
//     await ctx.reply('Video downloaded successfully!');
//   } catch (error) {
//     console.error('Error downloading video:', error.message);
//     await ctx.reply('Failed to download the video.');
//   }
// });

// async function downloadFileWithRetry(url, filePath, retries = 5) {
//   try {
//     console.log(`Starting download from ${url}`);
//     const response = await axios({
//       url,
//       method: 'GET',
//       responseType: 'stream',
//       timeout: 60000 // 60 seconds
//     });

//     const writer = fs.createWriteStream(filePath);
//     response.data.pipe(writer);

//     return new Promise((resolve, reject) => {
//       writer.on('finish', () => {
//         console.log('File downloaded successfully:', filePath);
//         resolve();
//       });
//       writer.on('error', (err) => {
//         console.error('Error writing file:', err.message);
//         reject(err);
//       });
//     });

//   } catch (error) {
//     console.error('Error during download:', error.message);
//     if (retries > 0) {
//       console.log('Retrying download...', retries);
//       await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds before retrying
//       return downloadFileWithRetry(url, filePath, retries - 1);
//     } else {
//       console.error('Failed to download file after retries:', error.message);
//       throw error;
//     }
//   }
// }

// bot.launch()
//   .then(() => console.log('Bot is running...'))
//   .catch((error) => {
//     console.error('Error starting bot:', error);
//   });
const { Telegraf } = require('telegraf');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Replace with your bot's API token
const TOKEN = process.env.BOT_TOKEN || '7199609523:AAG3FTLS2oK-0NJOvGgLuO2mEp9iNippSEs';
const bot = new Telegraf(TOKEN);

bot.catch((err) => {
  console.error('Bot encountered an error:', err);
});

// Rest of your code remains the same...

// Modified bot.launch() section
bot.launch({
  webhook: {
    domain: 'https://your-domain.com',
    port: process.env.PORT || 3000
  }
})
.then(() => console.log('Bot is running...'))
.catch((error) => {
  console.error('Error starting bot:', error);
  if (error.code === 'ECONNRESET') {
    console.log('Connection reset. This might be due to network issues or firewall restrictions.');
  }
  if (error.response) {
    console.log('Response data:', error.response.data);
    console.log('Response status:', error.response.status);
  }
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));