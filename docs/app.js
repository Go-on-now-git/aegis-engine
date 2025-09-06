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
        // Unchanged from Omega Protocol
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

    updateStatus(message, type = 'loading') { /* Unchanged */ }
    async initialize() { /* Unchanged */ }
    async fetchAndDisplayLog() { /* Unchanged */ }
    async fetchData() { /* Unchanged */ }
    renderControls() { /* Unchanged */ }
    renderData() { /* Unchanged */ }

    // --- createTable function is the only part that changes ---
    createTable(data) {
        if (!data || data.length === 0) return '<p class="text-center p-8 text-gray-300">No opportunities match your criteria.</p>';
        const rows = data.map(op => {
            const [base, quote] = op.symbol.split('/');
            const buyUrl = `https://www.kucoin.com/trade/${base}-${quote}`;
            const sellUrl = `https://www.gate.io/trade/${base}_${quote}`;
            return `
                <tr class="border-b border-gray-800 hover:bg-gray-900/50 transition-colors duration-200">
                    <td class="p-4 font-bold text-2xl text-green-400 align-middle">+${op.profit_pct.toFixed(2)}%</td>
                    <td class="p-4 align-middle">
                        <div class="font-mono text-lg text-white">${op.symbol}</div>
                        <div class="text-xs text-gray-400">Crypto Asset</div>
                    </td>
                    <td class="p-4 text-sm align-middle">
                        <div class="flex flex-col">
                            <span class="text-gray-300">BUY on <strong class="text-white font-semibold">${op.buy_on}</strong> at <span class="font-mono text-green-400">${op.buy_price.toFixed(6)}</span></span>
                            <span class="text-gray-300">SELL on <strong class="text-white font-semibold">${op.sell_on}</strong> at <span class="font-mono text-red-400">${op.sell_price.toFixed(6)}</span></span>
                        </div>
                    </td>
                    <td class="p-4 text-center align-middle">
                        <a href="${buyUrl}" target="_blank" class="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 text-xs rounded transition-transform transform hover:scale-105">BUY</a>
                        <a href="${sellUrl}" target="_blank" class="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 text-xs rounded ml-2 transition-transform transform hover:scale-105">SELL</a>
                    </td>
                </tr>
            `;
        }).join('');
        return `
            <div class="overflow-x-auto">
                <table class="w-full text-left">
                    <thead>
                        <tr class="border-b border-gray-700">
                            <th class="p-4 font-semibold text-gray-400 uppercase tracking-wider text-sm">Margin</th>
                            <th class="p-4 font-semibold text-gray-400 uppercase tracking-wider text-sm">Asset</th>
                            <th class="p-4 font-semibold text-gray-400 uppercase tracking-wider text-sm">Opportunity</th>
                            <th class="p-4 font-semibold text-gray-400 uppercase tracking-wider text-sm text-center">Execute</th>
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
