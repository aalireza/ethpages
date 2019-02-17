const TelegramBot = require('node-telegram-bot-api');
const token = "713643769:AAGLXf4qbajY1F3B49oC5ZPqCdANqpj1GrQ";

const bot = new TelegramBot(token, {polling: true});

module.exports = bot;
