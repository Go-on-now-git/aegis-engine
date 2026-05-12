"""
Grid trading strategy — places buy/sell ladders around current price.
Collects spread profit as price oscillates. Auto-compounds on each fill.
"""
import os
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

LEVELS = int(os.getenv('GRID_LEVELS', 10))
SPREAD = float(os.getenv('GRID_SPREAD_PCT', 0.4)) / 100

class GridEngine:
    def __init__(self, symbol, capital_usdt, current_price):
        self.symbol = symbol
        self.capital = capital_usdt
        self.price = current_price
        self.grids = self._build_grids()
        self.open_orders = {}
        self.realized_pnl = 0.0
        self.trades = 0

    def _build_grids(self):
        grids = []
        half = LEVELS // 2
        for i in range(-half, half + 1):
            if i == 0:
                continue
            level_price = round(self.price * (1 + i * SPREAD), 6)
            side = 'buy' if i < 0 else 'sell'
            size = round((self.capital / LEVELS) / level_price, 6)
            grids.append({'price': level_price, 'side': side, 'size': size, 'filled': False})
        return grids

    def check_fills(self, current_price):
        profits = []
        for g in self.grids:
            if g['filled']:
                continue
            if g['side'] == 'buy' and current_price <= g['price']:
                g['filled'] = True
                cost = g['price'] * g['size']
                profits.append({'side': 'buy', 'price': g['price'], 'size': g['size'], 'cost': cost})
                self.trades += 1
            elif g['side'] == 'sell' and current_price >= g['price']:
                g['filled'] = True
                revenue = g['price'] * g['size']
                profits.append({'side': 'sell', 'price': g['price'], 'size': g['size'], 'revenue': revenue})
                self.trades += 1
        return profits

    def compound(self, profit_usdt):
        self.capital += profit_usdt
        self.realized_pnl += profit_usdt
        # Rebuild grids with larger capital
        self.grids = self._build_grids()

    def status(self):
        return {
            'symbol': self.symbol,
            'capital': round(self.capital, 4),
            'realized_pnl': round(self.realized_pnl, 4),
            'trades': self.trades,
            'grid_levels': len(self.grids),
            'filled': sum(1 for g in self.grids if g['filled']),
        }
