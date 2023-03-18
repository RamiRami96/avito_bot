const puppeteer = require("puppeteer");
const TelegramBot = require("node-telegram-bot-api");
const checkDifference = require("./helpers/checkDifference");
const saveData = require("./helpers/saveData");

const TOKEN = "YOUR_TELEGRAM_BOT_TOKEN_HERE";

const URL =
  "https://www.avito.ru/kazan/tovary_dlya_kompyutera/komplektuyuschie/videokarty-ASgBAgICAkTGB~pm7gmmZw?cd=1&s=104";

class GC_BOT {
  constructor(url) {
    this.url = url;
    this.cards = [];
    this.id = null;
    this.bot = new TelegramBot(TOKEN, { polling: true });
    this.intervalId = null;
    this.browser = null;
  }

  async start() {
    try {
      this.bot.setMyCommands([
        { command: "/start", description: "Run GC_BOT" },
        { command: "/stop", description: "Stop GC_BOT" },
      ]);

      this.bot.onText(/start/, async (msg) => {
        this.id = msg.chat.id;
        await this.bot.sendMessage(this.id, "GC_BOT run!");
        await saveData(this.id, "id.json");
      });

      this.intervalId = setInterval(async () => {
        try {
          this.browser = await puppeteer.launch({
            headless: true,
            devtools: false,
          });

          const page = await this.browser.newPage();

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
                const a = div.querySelector("a.iva-item-title-link");
                const price = div.querySelector(
                  "span.price-text-E1Y7h:nth-child(1) > span:nth-child(1) > meta:nth-child(1)"
                );

                arr.push({
                  link: a.href,
                  title: a.textContent.trim(),
                  price: price.getAttribute("content"),
                });
              });
            } catch (error) {
              console.log(error);
            }
            return arr;
          });

          await this.browser.close();

          let differenceArray = checkDifference(this.cards, html);
          this.cards = html;

          let message;

          if (!differenceArray.length) {
            message = "No new graphic cards found";
          } else {
            message = differenceArray
              .map((card) => {
                return `<b>${card.title}</b>\n<i>${card.price} ₽</i>\n${card.link}`;
              })
              .join("\n\n");
          }

          if (this.id) {
            await this.bot.sendMessage(this.id, message, {
              parse_mode: "HTML",
            });
          }

          await saveData(this.cards, "cards.json");
        } catch (error) {
          console.log(error);
        }
      }, 1000);

      this.bot.onText(/stop/, async (msg) => {
        await this.bot.sendMessage(msg.chat.id, "GC_BOT stop!");
        clearInterval(this.intervalId);
      });
    } catch (error) {
      console.log(error);
    }
  }
}

const gc_bot = new GC_BOT(URL);

gc_bot.start();
