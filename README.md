# AEGIS 2026 — Autonomous Trading Engine
### Free flagship by [NSAI — Not So Artificial Intelligence](https://nsai.tech)

> Grid trading + triangular arbitrage on Kraken. Auto-compounds every profit. Runs 24/7 on any device.

---

## How It Works

AEGIS runs two strategies simultaneously:

**1. Triangular Arbitrage** — Finds 3-coin cycles where the math nets positive after fees (USDT → BTC → ETH → USDT). Executes when edge > 0.35%.

**2. Grid Trading** — Places buy/sell ladders around current BTC price. Collects spread profit as price oscillates. Every profit auto-reinvests.

**Auto-Compound** — 100% of net profit goes back into position size. $25 growing at 0.5%/day becomes $54 in 90 days.

---

## Quick Start

```bash
git clone https://github.com/Go-on-now-git/aegis-engine
cd aegis-engine
pip install -r requirements.txt
cp .env.template .env
# Edit .env with your Kraken API key
python3 aegis.py
```

Dashboard available at `http://localhost:7070`

---

## Get a Kraken Account

> Recommended exchange for US traders — lowest fees, strong API, regulated.

**[Sign up on Kraken →](https://kraken.com)**

Permissions needed on your API key:
- ✅ Query Funds
- ✅ Create & Modify Orders
- ✅ Cancel Orders
- ❌ Withdrawals (keep this OFF for safety)

---

## Paper Mode First

`PAPER_MODE=true` is the default. The engine runs live market scans and simulates every trade without touching real money. Watch it for 48-72 hours before going live.

---

## Performance Fee

AEGIS is free. To keep it that way, 10% of each profitable trade is logged as an NSAI fee. This is configurable in `.env` — set `PERFORMANCE_FEE_PCT=0` to disable. If the engine makes you money, consider leaving it on.

---

## Built by NSAI

[nsai.tech](https://nsai.tech) · [youtube.com/@nsaitech](https://youtube.com/@nsaitech) · [nub@nsai.tech](mailto:nub@nsai.tech)

Not financial advice. Trade at your own risk. Past performance does not guarantee future results.
