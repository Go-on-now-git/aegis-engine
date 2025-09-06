document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="container mx-auto p-4 md:p-8 max-w-7xl">
            <header class="text-center mb-10">
                <h1 class="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
                    AEGIS ENGINE
                </h1>
                <p class="text-gray-400 mt-2">Real-Time Arbitrage Intelligence</p>
            </header>
            <main>
                <div id="log-stream-container" class="glass-card rounded-lg shadow-2xl p-4 font-mono text-xs h-52 overflow-y-auto mb-8">
                    <p>Connecting to AEGIS Engine log stream...</p>
                </div>
                <div class="glass-card rounded-lg shadow-2xl p-4 mb-8">
                    <div id="controls-container" class="flex flex-wrap items-center gap-4">
                        <div>
                            <label for="margin-filter" class="text-sm font-semibold text-gray-400">Min. Margin</label>
                            <input type="number" id="margin-filter" value="0.2" step="0.1" class="bg-gray-900/50 border border-gray-600 rounded px-3 py-2 w-28 ml-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        <div>
                            <label for="exchange-filter" class="text-sm font-semibold text-gray-400">Exchange</label>
                            <select id="exchange-filter" class="bg-gray-900/50 border border-gray-600 rounded px-3 py-2 ml-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="all">All</option><option value="binance">Binance</option><option value="kraken">Kraken</option><option value="kucoin">KuCoin</option><option value="gateio">Gate.io</option>
                            </select>
                        </div>
                        <button id="apply-filters" class="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-5 rounded-lg transition-transform transform hover:scale-105">Filter</button>
                    </div>
                </div>
                <div id="table-container" class="glass-card rounded-lg shadow-2xl overflow-hidden"></div>
            </main>
            <div class="mt-12 text-center">
                <a href="https://notsoinc.gumroad.com/l/AEGIS" target="_blank" class="inline-block bg-amber-400 text-gray-900 font-bold text-lg px-8 py-4 rounded-lg shadow-lg hover:bg-amber-300">
                    Unlock Pro Features
                </a>
            </div>
            <footer class="text-center mt-16 text-gray-600 text-xs">
                <p class="cursor-pointer hover:text-amber-400 transition" onclick="toggleModal()">#StayAbove | System Doctrine</p>
            </footer>
        </div>
        <div id="doctrine-modal" class="hidden fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4">
            <div class="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full p-6 border border-amber-400/50">
                <h2 class="text-2xl font-bold text-amber-400 mb-4">AEGIS Doctrine: #StayAbove</h2>
                <p class="mb-4">AEGIS is built on a principle of systemic independence. It operates without servers, databases, or costs, making it resilient and unstoppable.</p>
                <div class="bg-black p-4 rounded-md text-sm">
                    <p><span class="text-blue-400">1. Control (Termux on Android):</span> All commands originate from a mobile, decentralized node.</p>
                    <p><span class="text-purple-400">2. Execution (GitHub Actions):</span> A serverless cloud runner performs the scan, leaving no footprint.</p>
                    <p><span class="text-green-400">3. Dissemination (GitHub Pages):</span> Intelligence is published to a static, high-availability global network.</p>
                </div>
                <p class="mt-4 text-xs text-gray-400">This architecture ensures the engine remains free, private, and always operational. That is how we Stay Above.</p>
                <button onclick="toggleModal()" class="mt-6 w-full bg-amber-400 text-gray-900 font-bold py-2 rounded">Close</button>
            </div>
        </div>
    `;

    // Attach event listeners after rendering the HTML
    document.getElementById('apply-filters').addEventListener('click', renderData);
    
    // --- Data Fetching and Rendering Logic ---
    const LOG_URL = 'https://raw.githubusercontent.com/Go-on-now-git/aegis-engine/main/data/run_log.txt';
    const DATA_URL = 'https://raw.githubusercontent.com/Go-on-now-git/aegis-engine/main/data/latest_scan_results.json';
    let allOpportunities = [];

    async function fetchAndDisplayLog() {
        const logContainer = document.getElementById('log-stream-container');
        logContainer.innerHTML = '';
        try {
            const response = await fetch(LOG_URL + '?t=' + new Date().getTime());
            if (!response.ok) { logContainer.innerHTML = '<p class="text-red-500">Log stream unavailable. Awaiting next scan cycle.</p>'; fetchData(); return; }
            const text = await response.text();
            const lines = text.split('\n');
            for (const line of lines) {
                await new Promise(resolve => setTimeout(resolve, 25));
                const p = document.createElement('p'); p.textContent = line; logContainer.appendChild(p); logContainer.scrollTop = logContainer.scrollHeight;
            }
            fetchData();
        } catch (error) { logContainer.innerHTML = '<p class="text-red-500">Error connecting to log stream.</p>'; fetchData(); }
    }

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
        const freeOpportunities = filteredData.slice(0, 5);
        document.getElementById('table-container').innerHTML = createTable(freeOpportunities);
    }

    function createTable(data) {
        if (!data || data.length === 0) return '<p class="text-center p-8 text-gray-400">No opportunities match your criteria.</p>';
        let table = '<div class="overflow-x-auto"><table class="w-full text-left"><thead><tr class="border-b border-gray-700"><th class="p-4 font-semibold text-gray-400 uppercase tracking-wider">Margin</th><th class="p-4 font-semibold text-gray-400 uppercase tracking-wider">Pair</th><th class="p-4 font-semibold text-gray-400 uppercase tracking-wider">Low (Exchange)</th><th class="p-4 font-semibold text-gray-400 uppercase tracking-wider">High (Exchange)</th></tr></thead><tbody>';
        data.forEach(op => {
            table += `<tr class="border-b border-gray-700/50 hover:bg-gray-700/50">
                <td class="p-4 font-bold text-lg text-green-400">+${op.profit_pct.toFixed(2)}%</td>
                <td class="p-4 font-mono text-gray-300">${op.symbol}</td>
                <td class="p-4 text-gray-400">${op.buy_price.toFixed(6)} <span class="font-semibold text-gray-300">${op.buy_on}</span></td>
                <td class="p-4 text-gray-400">${op.sell_price.toFixed(6)} <span class="font-semibold text-gray-300">${op.sell_on}</span></td>
            </tr>`;
        });
        return table + '</tbody></table></div>';
    }

    window.toggleModal = () => {
        document.getElementById('doctrine-modal').classList.toggle('hidden');
    }

    fetchAndDisplayLog();
});
