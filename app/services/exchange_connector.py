import ccxt.async_support as ccxt
import asyncio

async def fetch_tickers_from_exchange(exchange_id: str, aggregated_tickers: dict):
    try:
        exchange_class = getattr(ccxt, exchange_id)
        
        # Resilience Upgrade: Add proxy for Binance to bypass geoblocking
        if exchange_id == 'binance':
            exchange = exchange_class({
                'options': {
                    'defaultType': 'spot',
                },
                'proxies': {
                    'http': 'http://185.137.234.14:80', # A public proxy
                    'https': 'https://185.137.234.14:80',
                }
            })
        else:
            exchange = exchange_class()

        tickers = await exchange.fetch_tickers()
        for symbol, ticker_data in tickers.items():
            if ticker_data.get('ask') and ticker_data.get('bid'):
                if symbol not in aggregated_tickers:
                    aggregated_tickers[symbol] = []
                aggregated_tickers[symbol].append({
                    'exchange': exchange_id,
                    'ask': ticker_data['ask'],
                    'bid': ticker_data['bid']
                })
    except Exception as e:
        print(f"Could not fetch tickers from {exchange_id}: {e}")
    finally:
        if 'exchange' in locals() and hasattr(exchange, 'close'):
            await exchange.close()

async def get_all_tickers(exchange_ids: list) -> dict:
    aggregated_tickers = {}
    tasks = [fetch_tickers_from_exchange(eid, aggregated_tickers) for eid in exchange_ids]
    await asyncio.gather(*tasks)
    return aggregated_tickers
