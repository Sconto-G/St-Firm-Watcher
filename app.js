// --- ST-FIRM MASTER NERVOUS SYSTEM ---

// 1. LIVE EAT CLOCK
function updateEATClock() {
    const clockElements = document.querySelectorAll('.eat-live-clock');
    if (clockElements.length === 0) return;
    const now = new Date();
    const eatHours = (now.getUTCHours() + 3) % 24;
    const timeString = `EAT ${String(eatHours).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')} NAIROBI (UTC+3)`;
    clockElements.forEach(el => el.textContent = timeString);
}
setInterval(updateEATClock, 1000);

// 2. LIVE MARKET DATA
async function fetchMarketData() {
    try {
        const response = await fetch("https://st-firm-backend.onrender.com/api/v1/market/xauusd");
        const data = await response.json();
        
        const liveBid = parseFloat(data.current_price || "0.00");
        
        // --- Update Prices ---
        const headerPriceElem = document.getElementById('header-price');
        if (headerPriceElem) headerPriceElem.textContent = liveBid.toFixed(2);
        const compassPriceElem = document.getElementById('compass-price');
        if (compassPriceElem) { compassPriceElem.textContent = liveBid.toFixed(2); compassPriceElem.style.color = "#4cd7f6"; }

        // --- Update Bloodlust ---
        const bloodlustBar = document.getElementById('bloodlust-bar');
        const bloodlustText = document.getElementById('bloodlust-text');
        if (bloodlustBar && data.bloodlust !== undefined) {
            bloodlustBar.style.width = data.bloodlust + '%';
            if (bloodlustText) bloodlustText.innerText = data.bloodlust + '%';
            if (data.bloodlust > 75) { bloodlustBar.className = "h-full bg-red-500 transition-all duration-500"; if (bloodlustText) bloodlustText.className = "text-red-500 font-bold"; }
            else if (data.bloodlust > 40) { bloodlustBar.className = "h-full bg-orange-400 transition-all duration-500"; if (bloodlustText) bloodlustText.className = "text-orange-400 font-bold"; }
            else { bloodlustBar.className = "h-full bg-cyan-400 transition-all duration-500"; if (bloodlustText) bloodlustText.className = "text-cyan-400 font-bold"; }
        }

        // --- Update Timeframes (Trend + Candle Color) ---
        const updateTF = (id, tfData) => {
            const el = document.getElementById(id);
            if (!el || !tfData) return;
            const isBull = tfData.trend === "BULL" || tfData.trend === "BULLISH" || tfData.trend === "UPTREND";
            el.textContent = isBull ? "BULL" : "BEAR";
            el.className = isBull ? "text-xs font-bold text-[#4cd7f6]" : "text-xs font-bold text-[#ffb4ab]";
        };
        if (data.timeframes) {
            updateTF("tf-1m", data.timeframes["M5"]); 
            updateTF("tf-5m", data.timeframes["M5"]);
            updateTF("tf-15m", data.timeframes["M30"]);
            updateTF("tf-30m", data.timeframes["M30"]);
            updateTF("tf-1h", data.timeframes["H1"]);
            updateTF("tf-1d", data.timeframes["H4"]);
        }

        // --- Update Structure & Target Lock ---
        if (data.strategy && data.structure) {
            const targetElem = document.getElementById('target-lock-text');
            const killZoneElem = document.getElementById('kill-zone-text');
            const structTrendElem = document.getElementById('structure-trend');
            const structBosElem = document.getElementById('structure-bos');
            const swingHighElem = document.getElementById('swing-high-text');
            const swingLowElem = document.getElementById('swing-low-text');

            if (targetElem) targetElem.textContent = `${data.strategy.target_name} (${parseFloat(data.strategy.target_level).toFixed(2)})`;
            if (killZoneElem) killZoneElem.textContent = data.strategy.playbook_state;
            
            if (structTrendElem) {
                structTrendElem.textContent = data.structure.trend;
                structTrendElem.className = data.structure.trend === "BULLISH" ? "text-[#4cd7f6] font-bold" : "text-[#ffb4ab] font-bold";
            }
            if (structBosElem) structBosElem.textContent = data.structure.bos;
            if (swingHighElem) swingHighElem.textContent = parseFloat(data.structure.swing_high).toFixed(2);
            if (swingLowElem) swingLowElem.textContent = parseFloat(data.structure.swing_low).toFixed(2);
        }

        // --- Update Ignition Button ---
        if (data.ignition) {
            const ignBtn = document.getElementById('ignition-button');
            const ignText = document.getElementById('ignition-text');
            const ignIcon = ignBtn ? ignBtn.querySelector('.material-symbols-outlined') : null;
            
            if (ignBtn && ignText && ignIcon) {
                if (data.ignition.status === "BUY") {
                    ignBtn.className = "w-full py-3 rounded-lg border-2 border-[#4cd7f6] bg-[#4cd7f6]/10 flex items-center justify-center gap-2 transition-all duration-300 shadow-[0_0_20px_rgba(76,215,246,0.3)] animate-pulse";
                    ignText.textContent = "IGNITION: BUY";
                    ignText.className = "text-sm font-bold uppercase tracking-widest text-[#4cd7f6]";
                    ignIcon.textContent = "trending_up";
                    ignIcon.className = "material-symbols-outlined text-[#4cd7f6]";
                } else if (data.ignition.status === "SELL") {
                    ignBtn.className = "w-full py-3 rounded-lg border-2 border-[#ffb4ab] bg-[#ffb4ab]/10 flex items-center justify-center gap-2 transition-all duration-300 shadow-[0_0_20px_rgba(255,180,171,0.3)] animate-pulse";
                    ignText.textContent = "IGNITION: SELL";
                    ignText.className = "text-sm font-bold uppercase tracking-widest text-[#ffb4ab]";
                    ignIcon.textContent = "trending_down";
                    ignIcon.className = "material-symbols-outlined text-[#ffb4ab]";
                } else {
                    ignBtn.className = "w-full py-3 rounded-lg border-2 border-gray-600 bg-[#1b2028] flex items-center justify-center gap-2 transition-all duration-300";
                    ignText.textContent = "IGNITION: WAITING";
                    ignText.className = "text-sm font-bold uppercase tracking-widest text-gray-500";
                    ignIcon.textContent = "power_settings_new";
                    ignIcon.className = "material-symbols-outlined text-gray-500";
                }
            }
        }

        // --- Trigger AI Feed ---
        updateCognitiveFeed(data);
        
    } catch (error) {
        console.error("Master System: Error fetching live data:", error);
    }
}
setInterval(fetchMarketData, 1000); 
fetchMarketData(); 

// 3. AI COGNITIVE FEED (Throttled)
let lastLogTime = 0;
function updateCognitiveFeed(data) {
    const container = document.getElementById('ai-feed-container');
    if (!container) return;
    const currentTime = Date.now();
    if (currentTime - lastLogTime < 15000) return; // 15s throttle

    let newLog = null;
    const timeStr = `[${new Date().toLocaleTimeString('en-GB')}]`;

    if (data.ignition && data.ignition.status !== "WAITING") {
        newLog = { text: `${timeStr} 🎯 ${data.ignition.status} IGNITION FIRED: ${data.ignition.reason}`, color: data.ignition.status === "BUY" ? "text-[#4cd7f6]" : "text-[#ffb4ab]" };
    } else if (data.structure && data.structure.bos !== "NONE") {
        newLog = { text: `${timeStr} ⚠️ Structure BOS detected: ${data.structure.bos}`, color: "text-[#ffc174]" };
    } else if (data.bloodlust > 80) {
        newLog = { text: `${timeStr} ⚡ High volatility. Bloodlust: ${data.bloodlust}%`, color: "text-orange-400" };
    }

    if (newLog) {
        const logDiv = document.createElement('div');
        logDiv.className = newLog.color + " mb-1";
        logDiv.innerHTML = newLog.text;
        container.prepend(logDiv);
        lastLogTime = currentTime;
        if (container.children.length > 5) container.removeChild(container.lastChild);
    }
}

// 4. DYNAMIC SESSION ENGINE
function updateSession() {
    const sessionElem = document.getElementById('active-session-text');
    if (!sessionElem) return;
    const eatHours = (new Date().getUTCHours() + 3) % 24; 
    let session = "SYDNEY", color = "text-gray-400";
    if (eatHours >= 16 || eatHours < 1) { session = "NEW YORK"; color = "text-[#4cd7f6]"; } 
    if (eatHours >= 11 && eatHours < 20) { session = "LONDON"; color = "text-[#ffc174]"; }
    if (eatHours >= 16 && eatHours < 20) { session = "LDN / NY OVERLAP"; color = "text-purple-400"; }
    else if (eatHours >= 3 && eatHours < 11) { session = "TOKYO"; color = "text-blue-400"; }
    sessionElem.textContent = session;
    sessionElem.className = color + " font-bold uppercase tracking-wider text-xs";
}
updateSession();
setInterval(updateSession, 60000); 

// 5. NEWS TICKER
async function updateNewsTicker() {
    const ticker = document.getElementById('news-ticker-content');
    if (!ticker) return;
    try {
        const res = await fetch("https://st-firm-backend.onrender.com/api/v1/news/calendar");
        const data = await res.json();
        if (data.status !== "success" || !data.news || data.news.length === 0) {
            ticker.innerHTML = `<span class="text-gray-500 px-4">No high-impact news.</span>`;
            return;
        }
        let html = "";
        data.news.forEach((item, index) => {
            let color = item.impact === "High" ? "text-[#ffb4ab]" : "text-orange-400";
            let icon = item.impact === "High" ? "🔴" : "🟠";
            html += `<div class="flex items-center gap-2 px-2"><span class="${color} font-bold text-[12px]">${icon} ${item.time} - [${item.country}] ${item.title}</span>${index < data.news.length - 1 ? '<span class="text-gray-600 mx-4">|</span>' : ''}</div>`;
        });
        ticker.innerHTML = html;
        ticker.style.animation = 'none'; ticker.offsetHeight; ticker.style.animation = null; 
    } catch (e) { ticker.innerHTML = `<span class="text-gray-500 px-4">News offline.</span>`; }
}
updateNewsTicker();
setInterval(updateNewsTicker, 300000); 
