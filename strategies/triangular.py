"""
Triangular arbitrage on Kraken.
Finds cycles: USDT -> A -> B -> USDT where math > 1 after fees.
"""
import itertools

TAKER_FEE = 0.0026  # Kraken taker 0.26%

def find_triangles(tickers: dict, min_profit_pct: float = 0.35) -> list:
    opportunities = []

    # Build price lookup
    prices = {}
    for sym, t in tickers.items():
        if t.get('ask') and t.get('bid'):
            prices[sym] = {'ask': t['ask'], 'bid': t['bid']}

    # Get all base/quote pairs
    pairs = list(prices.keys())
    bases = set()
    for p in pairs:
        if '/' in p:
            b, q = p.split('/')
            bases.add(b)
            bases.add(q)

    # Try all 3-leg cycles starting and ending at USDT
    start = 'USDT'
    candidates = [b for b in bases if b not in ('USDT',)]

    for a, b in itertools.permutations(candidates, 2):
        legs = [
            (f"{a}/USDT", 'buy', start, a),
            (f"{a}/{b}", 'sell', a, b) if f"{a}/{b}" in prices else (f"{b}/{a}", 'buy', a, b),
            (f"{b}/USDT", 'sell', b, start),
        ]

        try:
            amount = 1.0
            valid = True
            for sym, side, frm, to in legs:
                if sym not in prices:
                    valid = False
                    break
                fee_mult = 1 - TAKER_FEE
                if side == 'buy':
                    amount = (amount / prices[sym]['ask']) * fee_mult
                else:
                    amount = (amount * prices[sym]['bid']) * fee_mult

            if not valid:
                continue

            profit_pct = (amount - 1.0) * 100
            if profit_pct >= min_profit_pct:
                opportunities.append({
                    'type': 'triangular',
                    'path': f"USDT→{a}→{b}→USDT",
                    'profit_pct': round(profit_pct, 4),
                    'multiplier': round(amount, 6),
                    'legs': [(s, side) for s, side, _, _ in legs],
                })
        except Exception:
            continue

    return sorted(opportunities, key=lambda x: x['profit_pct'], reverse=True)
