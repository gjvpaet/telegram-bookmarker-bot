require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');

const db = require('./database');
db.connect();

const token = process.env.TOKEN;

const bot = new TelegramBot(token, { polling: true });

let prevBotMsg = '';
let content = '';
let title = '';
let keywords = [];

bot.on('message', async msg => {
    console.log('msg: ', msg);
    const chatId = msg.chat.id;

    if (msg.entities && msg.entities[0].type === 'bot_command') {
        switch (msg.text) {
            case '/start':
                db.createDirectory();
                db.createModelFile(chatId);
                break;
            case '/bookmark':
                prevBotMsg = 'Okay, please enter your bookmark';
                bot.sendMessage(chatId, prevBotMsg);
                break;
            default:
                bot.sendMessage(chatId, `Whoops! Sorry, I don't know that command`);
                break;
        }

        return;
    }

    if (prevBotMsg !== '') {
        switch (prevBotMsg) {
            case 'Okay, please enter your bookmark':
                if (msg.text !== '') {
                    content = msg.text;

                    prevBotMsg = `Now let's give your bookmark a title`;
                    bot.sendMessage(chatId, prevBotMsg);
                }
                break;
            case `Now let's give your bookmark a title`:
                console.log('pumasok');
                if (msg.text !== '') {
                    title = msg.text;

                    prevBotMsg = 'Maybe add some keywords too (comma separated)';
                    bot.sendMessage(chatId, prevBotMsg);
                }
                break;
            case 'Maybe add some keywords too (comma separated)':
                if (msg.text !== '') {
                    keywords = msg.text.split(',');

                    let data = {
                        content,
                        title,
                        keywords,
                    };

                    const res = await db.addBookmark(chatId, data);

                    bot.sendMessage(chatId, res.message);
                }
                break;
        }
    }
});