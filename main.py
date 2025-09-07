from fastapi import FastAPI, HTTPException
from app.services.exchange_connector import get_all_tickers
from app.core.arbitrage import find_opportunities
app = FastAPI(title="AEGIS-MVP API", description="API for finding cryptocurrency arbitrage opportunities.", version="1.0.0")
EXCHANGES_TO_SCAN = ['binance', 'kraken', 'kucoin', 'gateio', 'coinbase']
@app.get("/api/v1/scan", tags=["Arbitrage"])
async def run_arbitrage_scan():
    print("Starting arbitrage scan...")
    try:
        print(f"Fetching tickers from: {EXCHANGES_TO_SCAN}")
        aggregated_tickers = await get_all_tickers(EXCHANGES_TO_SCAN)
        print(f"Successfully aggregated data for {len(aggregated_tickers)} unique symbols.")
        profit_threshold_pct = 0.2
        print(f"Finding opportunities with a profit threshold of {profit_threshold_pct}%...")
        opportunities = find_opportunities(aggregated_tickers, profit_threshold_pct)
        print(f"Scan complete. Found {len(opportunities)} potential opportunities.")
        return {"status": "success", "exchanges_scanned": EXCHANGES_TO_SCAN, "profit_threshold_pct": profit_threshold_pct, "opportunities_found": len(opportunities), "data": opportunities}
    except Exception as e:
        print(f"An error occurred during the scan: {e}")
        raise HTTPException(status_code=500, detail=f"An internal error occurred: {str(e)}")
@app.get("/", include_in_schema=False)
def root():
    return {"message": "AEGIS-MVP API is running. See /docs for documentation."}
