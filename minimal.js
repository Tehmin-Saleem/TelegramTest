const TelegramBot = require('node-telegram-bot-api');

// Replace with your bot's API token
const TOKEN = '7199609523:AAH4aV4V17KBkSacR3Tlco8ZlpFRDN_CZfQ';

// Create a bot instance with polling enabled
const bot = new TelegramBot(TOKEN, { polling: true });

// Basic command handler
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Hello! This is a minimal bot.');
});

bot.onText(/\/ping/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Pong!');
});

// Error handling for polling errors
bot.on('polling_error', (error) => {
  console.error('Polling error:', error.message);
});

console.log('Minimal bot is running...');
