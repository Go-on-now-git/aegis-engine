document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="container mx-auto p-4 md:p-8 max-w-7xl">
            <header class="text-center mb-10">
                <h1 class="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
                    AEGIS ENGINE
                </h1>
                <p class="text-gray-400 mt-2">Universal Arbitrage Intelligence</p>
            </header>
            <main>
                <div id="log-stream-container" class="glass-card rounded-lg shadow-2xl p-4 font-mono text-xs h-52 overflow-y-auto mb-8"></div>
                <div class="glass-card rounded-lg shadow-2xl p-4 mb-8">
                    <div id="controls-container" class="flex flex-wrap items-center gap-4">
                        <div>
                            <label for="margin-filter" class="text-sm font-semibold text-gray-400">Min. Margin</label>
                            <input type="number" id="margin-filter" value="0.2" step="0.1" class="bg-gray-900/50 border border-gray-600 rounded px-3 py-2 w-28 ml-2">
                        </div>
                        <div>
                            <label for="exchange-filter" class="text-sm font-semibold text-gray-400">Exchange</label>
                            <select id="exchange-filter" class="bg-gray-900/50 border border-gray-600 rounded px-3 py-2 ml-2">
                                <option value="all">All</option><option value="binance">Binance</option><option value="kraken">Kraken</option><option value="kucoin">KuCoin</option><option value="gateio">Gate.io</option>
                            </select>
                        </div>
                        <button id="apply-filters" class="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-5 rounded-lg">Filter</button>
                    </div>
                </div>
                <div id="table-container" class="glass-card rounded-lg shadow-2xl overflow-hidden"></div>
            </main>
            <div class="mt-12 text-center">
                <a href="https://notsoinc.gumroad.com/l/AEGIS" target="_blank" class="inline-block bg-amber-400 text-gray-900 font-bold text-lg px-8 py-4 rounded-lg shadow-lg hover:bg-amber-300">
                    Support the Project (Donate)
                </a>
            </div>
            <footer class="text-center mt-16 text-gray-600 text-xs">
                <p class="cursor-pointer hover:text-amber-400" onclick="toggleModal()">#StayAbove | System Doctrine</p>
            </footer>
        </div>
        <div id="doctrine-modal" class="hidden fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4">
            <!-- Modal content is unchanged -->
        </div>
    `;

    document.getElementById('apply-filters').addEventListener('click', renderData);
    
    const LOG_URL = 'https://raw.githubusercontent.com/Go-on-now-git/aegis-engine/main/data/run_log.txt';
    const DATA_URL = 'https://raw.githubusercontent.com/Go-on-now-git/aegis-engine/main/data/latest_scan_results.json';
    let allOpportunities = [];

    async function fetchAndDisplayLog() { /* ... unchanged ... */ }
    function fetchData() {
        fetch(DATA_URL + '?t=' + new Date().getTime())
            .then(response => response.json())
            .then(data => {
                allOpportunities = data.data.filter(op => op.profit_pct < 1000);
                renderData();
            }).catch(error => console.error("Failed to fetch data:", error));
    }

    function renderData() {
        const marginFilter = parseFloat(document.getElementById('margin-filter').value) || 0;
        const exchangeFilter = document.getElementById('exchange-filter').value;
        let filteredData = allOpportunities.filter(op => op.profit_pct >= marginFilter);
        if (exchangeFilter !== 'all') {
            filteredData = filteredData.filter(op => op.buy_on === exchangeFilter || op.sell_on === exchangeFilter);
        }
        filteredData.sort((a, b) => b.profit_pct - a.profit_pct);
        // The key change: We no longer slice the array. We show ALL data.
        document.getElementById('table-container').innerHTML = createTable(filteredData);
    }

    function createTable(data) {
        if (!data || data.length === 0) return '<p class="text-center p-8 text-gray-400">No opportunities match your criteria.</p>';
        let table = '<div class="overflow-x-auto"><table class="w-full text-left"><thead><tr class="border-b border-gray-700"><th class="p-4 font-semibold text-gray-400 uppercase tracking-wider">Margin</th><th class="p-4 font-semibold text-gray-400 uppercase tracking-wider">Pair</th><th class="p-4 font-semibold text-gray-400 uppercase tracking-wider">Opportunity</th><th class="p-4 font-semibold text-gray-400 uppercase tracking-wider text-center">Action</th></tr></thead><tbody>';
        data.forEach(op => {
            const [base, quote] = op.symbol.split('/');
            const buyUrl = `https://www.kucoin.com/trade/${base}-${quote}`;
            const sellUrl = `https://www.gate.io/trade/${base}_${quote}`;
            table += `<tr class="border-b border-gray-700/50 hover:bg-gray-700/50">
                <td class="p-4 font-bold text-lg text-green-400">+${op.profit_pct.toFixed(2)}%</td>
                <td class="p-4 font-mono text-gray-300">${op.symbol}</td>
                <td class="p-4 text-xs">
                    <div class="flex flex-col">
                        <span>BUY on ${op.buy_on} at ${op.buy_price.toFixed(6)}</span>
                        <span>SELL on ${op.sell_on} at ${op.sell_price.toFixed(6)}</span>
                    </div>
                </td>
                <td class="p-4 text-center">
                    <a href="${buyUrl}" target="_blank" class="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-3 text-xs rounded transition-transform transform hover:scale-105">BUY</a>
                    <a href="${sellUrl}" target="_blank" class="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-3 text-xs rounded transition-transform transform hover:scale-105 ml-2">SELL</a>
                </td>
            </tr>`;
        });
        return table + '</tbody></table></div>';
    }
    window.toggleModal = () => { /* ... unchanged ... */ }
    fetchAndDisplayLog();
});
