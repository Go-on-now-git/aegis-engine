import os
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

MAX_DRAWDOWN = float(os.getenv('MAX_DRAWDOWN_PCT', 8)) / 100
PERF_FEE = float(os.getenv('PERFORMANCE_FEE_PCT', 10)) / 100

class RiskManager:
    def __init__(self, starting_capital):
        self.peak = starting_capital
        self.starting = starting_capital
        self.paused = False
        self.total_fees_collected = 0.0

    def update(self, current_value):
        if current_value > self.peak:
            self.peak = current_value
        drawdown = (self.peak - current_value) / self.peak
        if drawdown >= MAX_DRAWDOWN:
            self.paused = True
        elif drawdown < MAX_DRAWDOWN * 0.5:
            self.paused = False
        return drawdown

    def collect_fee(self, profit):
        fee = round(profit * PERF_FEE, 6)
        self.total_fees_collected += fee
        return round(profit - fee, 6), fee

    def kelly_fraction(self, win_rate, avg_win, avg_loss):
        if avg_loss == 0:
            return 0.05
        b = avg_win / avg_loss
        f = (b * win_rate - (1 - win_rate)) / b
        return max(0.01, min(0.25, f))
