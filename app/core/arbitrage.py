import pandas as pd
def find_opportunities(aggregated_tickers: dict, profit_threshold_pct: float) -> list:
    opportunities = []
    for symbol, listings in aggregated_tickers.items():
        if len(listings) < 2:
            continue
        df = pd.DataFrame(listings).dropna(subset=['ask', 'bid'])
        if len(df) < 2:
            continue
        lowest_ask_row = df.loc[df['ask'].idxmin()]
        highest_bid_row = df.loc[df['bid'].idxmax()]
        lowest_ask, buy_exchange = lowest_ask_row['ask'], lowest_ask_row['exchange']
        highest_bid, sell_exchange = highest_bid_row['bid'], highest_bid_row['exchange']
        if buy_exchange != sell_exchange and highest_bid > lowest_ask:
            profit_pct = ((highest_bid - lowest_ask) / lowest_ask) * 100
            if profit_pct >= profit_threshold_pct:
                opportunities.append({"symbol": symbol, "buy_on": buy_exchange, "buy_price": lowest_ask, "sell_on": sell_exchange, "sell_price": highest_bid, "profit_pct": round(profit_pct, 4)})
    return sorted(opportunities, key=lambda x: x['profit_pct'], reverse=True)
