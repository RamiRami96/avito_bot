import requests
from bs4 import BeautifulSoup 
import json

# page = 1

# while True:
#     req = requests.get('https://www.avito.ru/kazan/tovary_dlya_kompyutera/komplektuyuschie/videokarty-ASgBAgICAkTGB~pm7gmmZw?p='+str(page))
#     html = BeautifulSoup(req.content, 'html.parser')
#     items = html.select('.items-items-38oUm > .iva-item-root-G3n7v')

#     print(len(items))

#     if(len(items)):
#         for el in items:
#             title = el.select('.iva-item-content-m2FiN>.iva-item-body-NPl6W>.iva-item-titleStep-2bjuh>a')
#             price = el.select('.iva-item-content-m2FiN>.iva-item-body-NPl6W>.iva-item-priceStep-2qRpg>span')
#             print(title[0].text + '-' + price[0].text )
#         page+=1    
#     else:
#         break    

def get_products():
    headers={
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }

    main_url = 'https://www.avito.ru'

    url =main_url + '/kazan/tovary_dlya_kompyutera/komplektuyuschie/videokarty-ASgBAgICAkTGB~pm7gmmZw?p=1'

    r = requests.get(url=url, headers=headers)

    soup = BeautifulSoup(r.text, "lxml")  

    products_card = soup.find_all("div", class_="iva-item-body-NPl6W")

    product_dict={}

    for product in products_card:
        product_title = product.find_all('h3', class_="title-root-395AQ")[0].text
        product_price = product.find_all('span', class_="price-root-1n2wM")[0].text
        product_link = main_url + product.find_all('a', class_="link-link-39EVK")[0].get('href')
        product_id = product_link.split('/')[-1].split('_')[-1]

        product_dict[product_id]={
            "product_title":product_title,
            "product_price":product_price,
            "product_link":product_link
        }

        with open("product_dict.json","w",encoding="utf-8") as file:
            json.dump(product_dict, file, indent=4, ensure_ascii=False)

def check_new_products():
    with open('product_dict.json', encoding='utf-8') as file:
        product_dict = json.load(file)

    headers={
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }

    main_url = 'https://www.avito.ru'

    url =main_url + '/kazan/tovary_dlya_kompyutera/komplektuyuschie/videokarty-ASgBAgICAkTGB~pm7gmmZw?p=1'

    r = requests.get(url=url, headers=headers)

    soup = BeautifulSoup(r.text, "lxml")  

    products_card = soup.find_all("div", class_="iva-item-body-NPl6W")

    fresh_product_dict={}

    for product in products_card:
        product_link = main_url + product.find_all('a', class_="link-link-39EVK")[0].get('href')
        product_id = product_link.split('/')[-1].split('_')[-1]

        if product_id in product_dict:
            continue
        else:
            product_title = product.find_all('h3', class_="title-root-395AQ")[0].text
            product_price = product.find_all('span', class_="price-root-1n2wM")[0].text
            product_link = main_url + product.find_all('a', class_="link-link-39EVK")[0].get('href')

            product_dict[product_id]={
            "product_title":product_title,
            "product_price":product_price,
            "product_link":product_link
            }

            fresh_product_dict[product_id]={
            "product_title":product_title,
            "product_price":product_price,
            "product_link":product_link
            }

    with open("product_dict.json","w",encoding="utf-8") as file:
            json.dump(product_dict, file, indent=4, ensure_ascii=False)

    return fresh_product_dict

def main():
    # get_products()
    check_new_products()  

if __name__ == '__main__':
    main()


main()