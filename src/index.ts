import puppeteer from "puppeteer";
import TelegramBot from "node-telegram-bot-api";
import checkDifference from "./helpers/checkDifference";
import saveData from "./helpers/saveData";
import { Card } from "./interfaces/cards";

const TOKEN = "YOUR_TELEGRAM_BOT_TOKEN_HERE";

const URL =
  "https://www.avito.ru/kazan/tovary_dlya_kompyutera/komplektuyuschie/videokarty-ASgBAgICAkTGB~pm7gmmZw?cd=1&s=104";

class GC_BOT {
  private url: string;
  private cards: Card[];
  private id: number | null;
  private bot: TelegramBot;
  private intervalId: NodeJS.Timeout | null;
  private browser: puppeteer.Browser | null;

  constructor(url: string) {
    this.url = url;
    this.cards = [];
    this.id = null;
    this.bot = new TelegramBot(TOKEN, { polling: true });
    this.intervalId = null;
    this.browser = null;
  }

  public async start(): Promise<void> {
    try {
      this.bot.setMyCommands([
        { command: "/start", description: "Run GC_BOT" },
        { command: "/stop", description: "Stop GC_BOT" },
      ]);

      this.bot.onText(/start/, async (msg) => {
        this.id = msg.chat.id;
        await this.bot.sendMessage(this.id!, "GC_BOT run!");
        await saveData(this.id!, "id.json");
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
            const arr: Card[] = [];
            try {
              const divs = document.querySelectorAll("div.iva-item-root-G3n7v");
              divs.forEach((div) => {
                const a = div.querySelector(
                  "a.iva-item-title-link"
                ) as HTMLAnchorElement;
                const price = div.querySelector(
                  "span.price-text-E1Y7h:nth-child(1) > span:nth-child(1) > meta:nth-child(1)"
                );

                const link = a?.href;
                const title = a?.textContent?.trim();
                const priceValue = price?.getAttribute("content");

                if (link && title && priceValue) {
                  arr.push({
                    link,
                    title,
                    price: priceValue,
                  });
                }
              });
            } catch (error) {
              console.log(error);
            }
            return arr;
          });

          await this.browser.close();

          let differenceArray = checkDifference(this.cards, html);
          this.cards = html;

          let message: string;

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
        if (this.intervalId) {
          clearInterval(this.intervalId);
        }
      });
    } catch (error) {
      console.log(error);
    }
  }
}

const gc_bot = new GC_BOT(URL);
gc_bot.start();
