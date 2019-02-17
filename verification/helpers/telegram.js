const TelegramBot = require('node-telegram-bot-api');
const token = "580348882:AAF24Pt_T_6pLALZBMqcI2OPBw-rB_2EsIo";

const bot = new TelegramBot(token, {polling: true});

module.exports = bot;
