const puppeteer = require("puppeteer");
const TelegramBot = require("node-telegram-bot-api");
const checkDifference = require("./helpers/checkDifference");
const saveData = require("./helpers/saveData");
const Cards = require("./cards");
const Id = require("./id");

const token = "Your Telegram bot token here";

class GcBot {
  constructor(url, chatId) {
    this.url = url;
    this.chatId = chatId;
    this.bot = new TelegramBot(token, { polling: true });
    this.intervalId = null;
  }

  async start() {
    await this.bot.setMyCommands([
      { command: "/start", description: "Run GC_BOT" },
      { command: "/stop", description: "Stop GC_BOT" },
    ]);

    this.bot.onText(/\/start/, async (msg) => {
      this.chatId = msg.chat.id;
      await this.bot.sendMessage(msg.chat.id, "GC_BOT run!");
      await saveData(this.chatId, "id.json");
    });

    this.intervalId = setInterval(async () => {
      let res = [];
      try {
        const browser = await puppeteer.launch({
          headless: false,
          slowMo: 100,
          devtools: false,
        });

        const page = await browser.newPage();

        await page.setViewport({
          width: 1400,
          height: 900,
        });

        await page.goto(this.url);

        const html = await page.evaluate(() => {
          let arr = [];
          try {
            const divs = document.querySelectorAll("div.iva-item-root-G3n7v");
            divs.forEach((div) => {
              const a = div.querySelector("h3.iva-item-title-1Rmmj a");
              const price = div.querySelector(
                "span.iva-item-price-price-32jxI span.price-text-E1Y7h.text-text-1PdBw.text-size-s-1PUdo"
              );

              arr.push({
                link: a.href,
                title: a.textContent,
                price: price.textContent,
              });
            });
          } catch (error) {
            console.log(error);
          }
          return arr;
        });
        res.push(html);

        await browser.close();

        res = res.flat();

        let differenceArray = checkDifference(Cards.data, res);

        let message;

        if (!differenceArray.length) {
          message = "No new graphic cards found";
        } else {
          message = differenceArray
            .map(
              (card) =>
                `<b>${card.title}</b>\n<i>${card.price} ₽</i>\n${card.link}`
            )
            .join("\n\n");
        }

        if (Id.data) {
          await this.bot.sendMessage(Id.data, message, {
            parse_mode: "HTML",
          });
        }

        await saveData(res, "cards.json");
      } catch (error) {
        console.log(error);
      }
    }, 300000); // run the bot every 5 minutes
  }
}

module.exports = GcBot;
