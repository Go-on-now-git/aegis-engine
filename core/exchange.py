import ccxt
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

def get_exchange(paper=True):
    ex = ccxt.kraken({
        'apiKey': os.getenv('KRAKEN_API_KEY'),
        'secret': os.getenv('KRAKEN_API_SECRET'),
        'enableRateLimit': True,
        'options': {'defaultType': 'spot'},
    })
    return ex

def get_balance(ex):
    b = ex.fetch_balance()
    return {k: v for k, v in b['total'].items() if v and v > 0}

def get_usdt_value(ex):
    bal = get_balance(ex)
    total = 0
    tickers = ex.fetch_tickers()
    for coin, amount in bal.items():
        if coin in ('USD', 'USDT', 'ZUSD'):
            total += amount
        else:
            sym = f"{coin}/USDT"
            if sym in tickers and tickers[sym].get('last'):
                total += amount * tickers[sym]['last']
    return round(total, 4)
