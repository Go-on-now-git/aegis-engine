#!/usr/bin/env python3
"""
AEGIS 2026 — Autonomous Trading Engine
Triangular arb + grid trading on Kraken. Auto-compounds. 10% performance fee to NSAI.
"""
import os, time, json, asyncio, logging
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

from core.exchange import get_exchange, get_balance, get_usdt_value
from core.risk import RiskManager
from strategies.triangular import find_triangles
from strategies.grid import GridEngine

logging.basicConfig(level=logging.INFO, format='%(asctime)s [AEGIS] %(message)s')
log = logging.getLogger('aegis')

PAPER = os.getenv('PAPER_MODE', 'true').lower() == 'true'
CAPITAL = float(os.getenv('CAPITAL_USDT', 25.0))
STATE_FILE = os.path.join(os.path.dirname(__file__), 'state.json')

def load_state():
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE) as f:
            return json.load(f)
    return {'capital': CAPITAL, 'peak': CAPITAL, 'pnl': 0.0, 'trades': 0,
            'fees_collected': 0.0, 'log': [], 'started': datetime.now().isoformat()}

def save_state(state):
    with open(STATE_FILE, 'w') as f:
        json.dump(state, f, indent=2)

def log_trade(state, entry):
    entry['time'] = datetime.now().isoformat()
    state['log'].insert(0, entry)
    state['log'] = state['log'][:200]  # keep last 200

def run():
    log.info(f"AEGIS 2026 starting — {'PAPER' if PAPER else 'LIVE'} mode — capital: ${CAPITAL}")
    ex = get_exchange()
    state = load_state()
    risk = RiskManager(state['capital'])

    grid = None
    scan_count = 0

    while True:
        try:
            scan_count += 1
            log.info(f"Scan #{scan_count} — capital: ${round(state['capital'],2)} | PnL: ${round(state['pnl'],4)}")

            if risk.paused:
                log.warning("Risk circuit open — drawdown limit hit. Waiting...")
                time.sleep(60)
                continue

            # ── Fetch market data ──────────────────────────────────────────
            tickers = ex.fetch_tickers()

            # ── Strategy 1: Triangular Arbitrage ──────────────────────────
            min_pct = float(os.getenv('TRI_ARB_MIN_PROFIT_PCT', 0.35))
            opps = find_triangles(tickers, min_profit_pct=min_pct)

            if opps:
                best = opps[0]
                log.info(f"TRI-ARB found: {best['path']} → {best['profit_pct']}% profit")

                raw_profit = state['capital'] * (best['profit_pct'] / 100)
                net_profit, fee = risk.collect_fee(raw_profit)

                if PAPER:
                    state['capital'] += net_profit
                    state['pnl'] += net_profit
                    state['fees_collected'] += fee
                    state['trades'] += 1
                    log_trade(state, {
                        'type': 'tri_arb', 'path': best['path'],
                        'profit_pct': best['profit_pct'],
                        'profit_usdt': round(net_profit, 6),
                        'fee_usdt': round(fee, 6),
                    })
                    log.info(f"  [PAPER] +${round(net_profit,4)} (fee ${round(fee,6)}) → capital now ${round(state['capital'],4)}")
                else:
                    # Live execution would go here
                    pass

            # ── Strategy 2: Grid Trading ───────────────────────────────────
            btc_sym = 'BTC/USDT'
            if btc_sym in tickers and tickers[btc_sym].get('last'):
                current_price = tickers[btc_sym]['last']

                if grid is None:
                    grid_capital = state['capital'] * 0.6  # 60% to grid
                    grid = GridEngine(btc_sym, grid_capital, current_price)
                    log.info(f"Grid initialized — {len(grid.grids)} levels around ${current_price}")

                fills = grid.check_fills(current_price)
                for fill in fills:
                    if fill['side'] == 'sell':
                        spread_profit = fill.get('revenue', 0) * float(os.getenv('GRID_SPREAD_PCT', 0.4)) / 100
                        net, fee = risk.collect_fee(spread_profit)
                        grid.compound(net)
                        state['capital'] += net
                        state['pnl'] += net
                        state['fees_collected'] += fee
                        state['trades'] += 1
                        log_trade(state, {
                            'type': 'grid', 'side': 'sell',
                            'price': fill['price'], 'profit_usdt': round(net, 6),
                        })

            # ── Update risk & save ────────────────────────────────────────
            dd = risk.update(state['capital'])
            state['peak'] = risk.peak
            save_state(state)

            if scan_count % 10 == 0:
                log.info(f"SUMMARY — Capital: ${round(state['capital'],2)} | Total PnL: ${round(state['pnl'],4)} | Trades: {state['trades']} | Drawdown: {round(dd*100,2)}%")

            time.sleep(15)  # scan every 15 seconds

        except KeyboardInterrupt:
            log.info("Shutting down cleanly.")
            save_state(state)
            break
        except Exception as e:
            log.error(f"Error: {e}")
            time.sleep(30)

if __name__ == '__main__':
    run()
