const TelegramBot = require("node-telegram-bot-api");

const token = process.env.TOKEN;

const bot = new TelegramBot(token, { polling: true });

const db = require("./database");

exports.botListener = () => {
  let prevBotMsg = "";
  let content = "";
  let title = "";
  let keywords = [];

  bot.on("message", async (msg) => {
    const chatId = msg.chat.id;

    if (msg.entities && msg.entities[0].type === "bot_command") {
      switch (msg.text) {
        case "/start":
          db.createDirectory();
          db.createModelFile(chatId);
          break;
        case "/bookmark":
          prevBotMsg = "Okay, please enter your bookmark";
          bot.sendMessage(chatId, prevBotMsg);
          break;
        case "/getbookmark":
          prevBotMsg =
            "Choose an option on how would you like to get your bookmark";
          bot.sendMessage(chatId, prevBotMsg, {
            reply_markup: {
              keyboard: [["Title"], ["Keywords"]],
              one_time_keyboard: true,
            },
          });
          break;
        default:
          bot.sendMessage(chatId, `Whoops! Sorry, I don't know that command`);
          break;
      }

      return;
    }

    if (prevBotMsg !== "") {
      switch (prevBotMsg) {
        case "Okay, please enter your bookmark":
          if (msg.text !== "") {
            content = msg.text;

            prevBotMsg = `Now let's give your bookmark a title`;
            bot.sendMessage(chatId, prevBotMsg);
          }
          break;
        case `Now let's give your bookmark a title`:
          if (msg.text !== "") {
            title = msg.text;

            prevBotMsg = "Maybe add some keywords too (comma separated)";
            bot.sendMessage(chatId, prevBotMsg);
          }
          break;
        case "Maybe add some keywords too (comma separated)":
          if (msg.text !== "") {
            keywords = msg.text.split(",");

            let data = {
              content,
              title,
              keywords,
            };

            const res = await db.addBookmark(chatId, data);

            bot.sendMessage(chatId, res.message);
          }
          break;
        case "Choose an option on how would you like to get your bookmark":
          if (msg.text !== "") {
            switch (msg.text) {
              case "Title":
                prevBotMsg = "Enter bookmark title";
                bot.sendMessage(chatId, prevBotMsg);
                break;
              case "Keywords":
                prevBotMsg = "Enter bookmark keyword(s) (comma separated)";
                bot.sendMessage(chatId, prevBotMsg);
                break;
            }
          }
          break;
        case "Enter bookmark title":
          if (msg.text !== "") {
            const res = await db.getBookmark(chatId, "title", msg.text);

            if (!res.bookmarks.length) {
              bot.sendMessage(chatId, res.message);
              return;
            }

            bot.sendMessage(chatId, res.message);

            res.bookmarks.map((bookmark) =>
              bot.sendMessage(chatId, bookmark.content)
            );
          }
          break;
        case "Enter bookmark keyword(s) (comma separated)":
          if (msg.text !== "") {
            const res = await db.getBookmark(chatId, "keywords", msg.text);

            if (!res.bookmarks.length) {
              bot.sendMessage(chatId, res.message);
              return;
            }

            bot.sendMessage(chatId, res.message);

            res.bookmarks.map((bookmark) =>
              bot.sendMessage(chatId, bookmark.content)
            );
          }
          break;
      }
    }
  });
};
