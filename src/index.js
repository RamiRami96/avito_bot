const puppeteer = require("puppeteer");
const cards = require("./cards.json");
const id = require("./id.json");
const TelegramBot = require("node-telegram-bot-api");
const checkDifference = require("./helpers/checkDifference");
const saveData = require("./helpers/saveData");

const token = "YOUR TELEGRAM ID";

const bot = new TelegramBot(token, { polling: true });

const url =
  "https://www.avito.ru/kazan/tovary_dlya_kompyutera/komplektuyuschie/videokarty-ASgBAgICAkTGB~pm7gmmZw?cd=1&s=104";

bot.setMyCommands([
  { command: "/start", description: "Run GC_BOT" },
  { command: "/stop", description: "Stop GC_BOT" },
]);

bot.onText(/start/, async (msg) => {
  await bot.sendMessage(msg.from.id, "GC_BOT run!");
  await saveData(msg.from.id, "id.json");
});

let intervalId = setInterval(async () => {
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

    await page.goto(url);

    await page.waitForSelector("div.iva-item-body-R_Q9c");

    const html = await page.evaluate(async () => {
      let arr = [];
      try {
        const divs = document.querySelectorAll("div.iva-item-body-R_Q9c");
        divs.forEach((div) => {
          const a = div.querySelector("div.iva-item-titleStep-_CxvN > a");
          const price = div.querySelector(
            "div.iva-item-priceStep-QN8Kl > span.price-root-_Uey3 > span.price-price-BQkOZ > meta[itemprop=price]"
          );

          arr.push({
            link: a.href,
            title: a.title,
            price: price.content,
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

    let differenceArray = checkDifference(cards, res);

    let message = "";

    if (!differenceArray.length) {
      message = "No new graphic cards found";
    } else {
      differenceArray.map((card) => {
        message = `<b>${card.title}</b>\n<i>${card.price} ₽</i>\n${card.link}`;
      });
    }

    if (id) {
      await bot.sendMessage(id, message, {
        parse_mode: "HTML",
      });
    }

    await saveData(res, "cards.json");
  } catch (error) {
    console.log(error);
  }
}, 60000);

bot.onText(/stop/, async (msg) => {
  await bot.sendMessage(msg.from.id, "GC_BOT stop!");
  clearInterval(intervalId);
});
