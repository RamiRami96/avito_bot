from aiogram import Bot, Dispatcher, executor, types
import asyncio
from main import check_new_products

token = "1864216628:AAED5lLeMTgKEWFSOBbTYiR30jzRvGaSWqI"
user_id = "271298230"

bot = Bot(token)
dp = Dispatcher(bot)

@dp.message_handler(commands="start")
async def get_new_cards(message:types.Message):
    new_cards = check_new_products()
    if len(new_cards)>=1:
        for k, v in new_cards.items():
            product =   f"{v['product_title']}\n" \
                        f"{v['product_price']}\n" \
                        f"{v['product_link']}\n" 
            await message.answer(product)
    else:
        await message.answer("Пока нет новых обьявлений...")

async def refresh_new_card():
    while True:
        new_cards = check_new_products()
        if len(new_cards)>=1:
            for k, v in new_cards.items():
                product =   f"{v['product_title']}\n" \
                            f"{v['product_price']}\n" \
                            f"{v['product_link']}\n" 
                await bot.send_message(user_id, product)
        else:
            await bot.send_message(user_id, "Пока нет новых обьявлений...", disable_notification=True)

        await asyncio.sleep(60)

if __name__ == '__main__':
    loop = asyncio.get_event_loop()
    loop.create_task(refresh_new_card())
    executor.start_polling(dp)