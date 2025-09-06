class AegisApp {
    constructor() {
        this.appContainer = document.getElementById('app-container');
        this.LOG_URL = 'https://raw.githubusercontent.com/Go-on-now-git/aegis-engine/main/data/run_log.txt';
        this.DATA_URL = 'https://raw.githubusercontent.com/Go-on-now-git/aegis-engine/main/data/latest_scan_results.json';
        this.allOpportunities = [];
        this.renderStructure();
        this.initialize();
    }

    renderStructure() {
        this.appContainer.innerHTML = `
            <div class="container mx-auto p-4 md:p-8 max-w-7xl">
                <header class="text-center mb-10">
                    <h1 class="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">AEGIS ENGINE</h1>
                    <p id="status-line" class="text-gray-400 mt-2 flex items-center justify-center font-mono text-sm"><span class="status-dot"></span>Initializing...</p>
                </header>
                <main>
                    <div id="log-stream-container" class="glass-card rounded-lg shadow-2xl p-4 font-mono text-xs h-52 overflow-y-auto mb-8"></div>
                    <div id="controls-container" class="glass-card rounded-lg shadow-2xl p-4 mb-8 hidden"></div>
                    <div id="table-container" class="glass-card rounded-lg shadow-2xl overflow-hidden"></div>
                </main>
                <div id="donate-button-container" class="mt-12 text-center hidden">
                    <a href="https://notsoinc.gumroad.com/l/AEGIS" target="_blank" class="inline-block bg-amber-400 text-gray-900 font-bold text-lg px-8 py-4 rounded-lg shadow-lg hover:bg-amber-300">Support the Project</a>
                </div>
                <footer class="text-center mt-16 text-gray-600 text-xs">
                    <p class="cursor-pointer hover:text-amber-400" onclick="window.aegisApp.toggleModal()">#StayAbove | System Doctrine</p>
                </footer>
            </div>
            <div id="doctrine-modal" class="hidden fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4">
                <div class="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full p-6 border border-amber-400/50">
                    <h2 class="text-2xl font-bold text-amber-400 mb-4">AEGIS Doctrine: #StayAbove</h2>
                    <p class="mb-4">AEGIS is built on a principle of systemic independence. It operates without servers, databases, or costs, making it resilient and unstoppable.</p>
                    <div class="bg-black p-4 rounded-md text-sm space-y-2">
                        <p><span class="text-blue-400 font-bold">1. Control (Termux):</span> Mobile, decentralized command origin.</p>
                        <p><span class="text-purple-400 font-bold">2. Execution (GitHub Actions):</span> Serverless, ephemeral cloud scan.</p>
                        <p><span class="text-green-400 font-bold">3. Dissemination (GitHub Pages):</span> Static, global, high-availability intelligence.</p>
                    </div>
                    <button onclick="window.aegisApp.toggleModal()" class="mt-6 w-full bg-amber-400 text-gray-900 font-bold py-2 rounded">Close</button>
                </div>
            </div>
        `;
        this.logContainer = document.getElementById('log-stream-container');
        this.statusLine = document.getElementById('status-line');
        this.statusDot = this.statusLine.querySelector('.status-dot');
    }

    updateStatus(message, type = 'loading') {
        this.statusLine.innerHTML = `<span class="status-dot ${type}"></span>${message}`;
    }

    async initialize() {
        try {
            this.updateStatus('Connecting to log stream...');
            await this.fetchAndDisplayLog();
            this.updateStatus('Fetching market data...');
            await this.fetchData();
            this.updateStatus('System Online. Last Scan Complete.', 'online');
            document.getElementById('controls-container').classList.remove('hidden');
            document.getElementById('donate-button-container').classList.remove('hidden');
        } catch (error) {
            console.error("Omega Protocol Initialization Failed:", error);
            this.updateStatus(`Critical Error: ${error.message}`, 'error');
        }
    }

    async fetchAndDisplayLog() {
        try {
            const response = await fetch(`${this.LOG_URL}?t=${new Date().getTime()}`);
            if (!response.ok) throw new Error('Log file not found.');
            const text = await response.text();
            this.logContainer.innerHTML = text.split('\n').map(line => `<p>${line}</p>`).join('');
            this.logContainer.scrollTop = this.logContainer.scrollHeight;
        } catch (error) {
            this.logContainer.innerHTML = `<p class="text-amber-400">${error.message}</p>`;
        }
    }

    async fetchData() {
        try {
            const response = await fetch(`${this.DATA_URL}?t=${new Date().getTime()}`);
            if (!response.ok) throw new Error('Opportunity data source not found.');
            const data = await response.json();
            if (!data || !data.data) throw new Error('Invalid data format received.');
            this.allOpportunities = data.data.filter(op => op.profit_pct < 1000);
            this.renderControls();
            this.renderData();
        } catch (error) {
            document.getElementById('table-container').innerHTML = `<p class="text-center p-8 text-red-500 font-bold">${error.message}</p>`;
            throw error; // Propagate error to stop initialization
        }
    }

    renderControls() {
        const controlsContainer = document.getElementById('controls-container');
        controlsContainer.innerHTML = `
            <div class="flex flex-wrap items-center gap-4 w-full">
                <div class="flex-grow">
                    <label for="margin-filter" class="text-sm font-semibold text-gray-400 mr-2">Min. Margin</label>
                    <input type="number" id="margin-filter" value="0.2" step="0.1" class="bg-gray-900/50 border border-gray-600 rounded px-3 py-2 w-28 focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                    <label for="exchange-filter" class="text-sm font-semibold text-gray-400 mr-2">Exchange</label>
                    <select id="exchange-filter" class="bg-gray-900/50 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="all">All</option><option value="binance">Binance</option><option value="kraken">Kraken</option><option value="kucoin">KuCoin</option><option value="gateio">Gate.io</option>
                    </select>
                </div>
                <button id="apply-filters" class="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-5 rounded-lg">Filter</button>
            </div>
        `;
        document.getElementById('apply-filters').addEventListener('click', () => this.renderData());
    }

    renderData() {
        const marginFilter = parseFloat(document.getElementById('margin-filter').value) || 0;
        const exchangeFilter = document.getElementById('exchange-filter').value;
        let filteredData = this.allOpportunities.filter(op => op.profit_pct >= marginFilter);
        if (exchangeFilter !== 'all') {
            filteredData = filteredData.filter(op => op.buy_on === exchangeFilter || op.sell_on === exchangeFilter);
        }
        filteredData.sort((a, b) => b.profit_pct - a.profit_pct);
        document.getElementById('table-container').innerHTML = this.createTable(filteredData);
    }

    createTable(data) {
        if (!data || data.length === 0) return '<p class="text-center p-8 text-gray-400">No opportunities match your criteria.</p>';
        const rows = data.map(op => {
            const [base, quote] = op.symbol.split('/');
            const buyUrl = `https://www.kucoin.com/trade/${base}-${quote}`;
            const sellUrl = `https://www.gate.io/trade/${base}_${quote}`;
            return `
                <tr class="border-b border-gray-800 hover:bg-gray-900/50">
                    <td class="p-4 font-bold text-lg text-green-400">+${op.profit_pct.toFixed(2)}%</td>
                    <td class="p-4 font-mono text-gray-300">${op.symbol}</td>
                    <td class="p-4 text-xs">
                        <div class="flex flex-col">
                            <span>BUY on ${op.buy_on} at ${op.buy_price.toFixed(6)}</span>
                            <span>SELL on ${op.sell_on} at ${op.sell_price.toFixed(6)}</span>
                        </div>
                    </td>
                    <td class="p-4 text-center">
                        <a href="${buyUrl}" target="_blank" class="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-3 text-xs rounded">BUY</a>
                        <a href="${sellUrl}" target="_blank" class="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-3 text-xs rounded ml-2">SELL</a>
                    </td>
                </tr>
            `;
        }).join('');
        return `
            <div class="overflow-x-auto">
                <table class="w-full text-left">
                    <thead>
                        <tr class="border-b border-gray-700">
                            <th class="p-4 font-semibold text-gray-400 uppercase tracking-wider">Margin</th>
                            <th class="p-4 font-semibold text-gray-400 uppercase tracking-wider">Pair</th>
                            <th class="p-4 font-semibold text-gray-400 uppercase tracking-wider">Opportunity</th>
                            <th class="p-4 font-semibold text-gray-400 uppercase tracking-wider text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    }

    toggleModal() {
        document.getElementById('doctrine-modal').classList.toggle('hidden');
    }
}

window.aegisApp = new AegisApp();
