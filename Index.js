const { Telegraf } = require('telegraf');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const https = require('https');


const TOKEN =  '7199609523:AAGOGQrHOPzexjiP92ixW1UdB9L1R-QY_E8';

// Create a custom HTTPS agent with longer timeout
const agent = new https.Agent({
  keepAlive: true,
  timeout: 60000, // 60 seconds
});

// Create bot instance with custom agent and timeout
const bot = new Telegraf(TOKEN, {
  telegram: { 
    agent,
    timeout: 30000, // 30 seconds
  },
});

// Error handling middleware
bot.catch((err, ctx) => {
  console.error(`Error for ${ctx.updateType}:`, err);
});

// Listen for video messages
bot.on('video', async (ctx) => {
  const chatId = ctx.message.chat.id;
  const fileId = ctx.message.video.file_id;

  console.log('Chat ID:', chatId);
  console.log('File ID:', fileId);

  try {
    // Get file details
    const file = await ctx.telegram.getFile(fileId);
    const filePath = file.file_path;
    const fileUrl = `https://api.telegram.org/file/bot${TOKEN}/${filePath}`;

    // Path to save the video
    const downloadsFolder = path.join('C:', 'Users', 'tehmi', 'Downloads');
    const uniqueFileName = `video_${Date.now()}.mp4`;
    const fileName = path.join(downloadsFolder, uniqueFileName);

    console.log('File URL:', fileUrl);
    console.log('Saving to:', fileName);

    // Ensure the downloads folder exists
    if (!fs.existsSync(downloadsFolder)) {
      fs.mkdirSync(downloadsFolder, { recursive: true });
    }

    // Download video with retry mechanism
    await downloadFileWithRetry(fileUrl, fileName);

    // Notify user
    await ctx.reply('Video downloaded successfully!');
  } catch (error) {
    console.error('Error downloading video:', error.message);
    await ctx.reply('Failed to download the video.');
  }
});

async function downloadFileWithRetry(url, filePath, retries = 5) {
  try {
    console.log(`Starting download from ${url}`);
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
      timeout: 60000 // 60 seconds
    });

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        console.log('File downloaded successfully:', filePath);
        resolve();
      });
      writer.on('error', (err) => {
        console.error('Error writing file:', err.message);
        reject(err);
      });
    });

  } catch (error) {
    console.error('Error during download:', error.message);
    if (retries > 0) {
      console.log('Retrying download...', retries);
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds before retrying
      return downloadFileWithRetry(url, filePath, retries - 1);
    } else {
      console.error('Failed to download file after retries:', error.message);
      throw error;
    }
  }
}

// Implement exponential backoff retry mechanism for bot launch
const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 1000; // 1 second

function launchBotWithRetry(retryCount = 0) {
  bot.launch()
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
      if (retryCount < MAX_RETRIES) {
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
        console.log(`Retrying in ${delay/1000} seconds...`);
        setTimeout(() => launchBotWithRetry(retryCount + 1), delay);
      } else {
        console.log('Max retries reached. Please check your network connection.');
      }
    });
}

// Start the bot with retry mechanism
launchBotWithRetry();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));