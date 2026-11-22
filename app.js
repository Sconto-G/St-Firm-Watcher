// --- ST-FIRM MASTER NERVOUS SYSTEM ---

// 1. LIVE EAT CLOCK
function updateEATClock() {
    const clockElements = document.querySelectorAll('.eat-live-clock');
    if (clockElements.length === 0) return;
    
    const now = new Date();
    const eatHours = (now.getUTCHours() + 3) % 24;
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    const seconds = String(now.getUTCSeconds()).padStart(2, '0');
    const hours = String(eatHours).padStart(2, '0');
    
    const timeString = `EAT ${hours}:${minutes}:${seconds} NAIROBI (UTC+3)`;
    
    clockElements.forEach(el => {
        el.textContent = timeString;
    });
}
setInterval(updateEATClock, 1000);

// 2. LIVE MARKET DATA FETCHER
async function fetchMarketData() {
    try {
        const renderUrl = "https://st-firm-backend.onrender.com/api/v1/market/xauusd";
        const response = await fetch(renderUrl);
        const data = await response.json();
        
        const liveBid = parseFloat(data.current_price || "3525.78");
        
        // --- Update Prices ---
        const headerPriceElem = document.getElementById('header-price');
        if (headerPriceElem) headerPriceElem.textContent = liveBid.toFixed(2);

        const compassPriceElem = document.getElementById('compass-price');
        if (compassPriceElem) {
            compassPriceElem.textContent = liveBid.toFixed(2);
            compassPriceElem.style.color = "#4cd7f6"; 
        }

        // --- Update Posture & Confidence ---
        const postureElem = document.getElementById('market-posture-text');
        if (postureElem && data.market_posture) {
            postureElem.textContent = data.market_posture;
            postureElem.style.color = data.market_posture === "BUY" ? "#4cd7f6" : "#ffb4ab";
        }

        const confidenceElem = document.getElementById('confidence-text');
        if (confidenceElem && data.confidence !== undefined) {
            confidenceElem.textContent = data.confidence + "%";
        }

        // --- Update Bloodlust Gauge ---
        const bloodlustBar = document.getElementById('bloodlust-bar');
        const bloodlustText = document.getElementById('bloodlust-text');
        
        if (bloodlustBar && data.bloodlust !== undefined) {
            bloodlustBar.style.width = data.bloodlust + '%';
            if (bloodlustText) bloodlustText.innerText = data.bloodlust + '%';
            
            if (data.bloodlust > 75) {
                bloodlustBar.className = "h-full bg-red-500 transition-all duration-500";
                if (bloodlustText) bloodlustText.className = "text-red-500 font-bold";
            } else if (data.bloodlust > 40) {
                bloodlustBar.className = "h-full bg-orange-400 transition-all duration-500";
                if (bloodlustText) bloodlustText.className = "text-orange-400 font-bold";
            } else {
                bloodlustBar.className = "h-full bg-cyan-400 transition-all duration-500";
                if (bloodlustText) bloodlustText.className = "text-cyan-400 font-bold";
            }
        }

        // --- Update Kill Chain Strategy (The Playbook) ---
        if (data.strategy) {
            const tacticalElem = document.getElementById('tactical-posture-text');
            const targetElem = document.getElementById('target-lock-text');
            const telemetryElem = document.getElementById('range-telemetry-text');
            const killZoneElem = document.getElementById('kill-zone-text');

            if (tacticalElem && data.market_posture) {
                tacticalElem.textContent = `${data.market_posture} (${data.confidence}%)`;
                tacticalElem.style.color = data.market_posture === "BUY" ? "#4cd7f6" : "#ffb4ab";
            }

            if (targetElem) {
                targetElem.textContent = `${data.strategy.target_name} (${parseFloat(data.strategy.target_level).toFixed(2)})`;
            }

            if (telemetryElem) {
                const dist = data.strategy.distance_pips;
                telemetryElem.textContent = dist + " PIPS";
                telemetryElem.style.color = dist <= 2.0 ? "#ffc174" : "#dee2ee"; 
            }

            if (killZoneElem) {
                killZoneElem.textContent = data.strategy.playbook_state;
                
                if (data.strategy.playbook_state.includes("READY")) {
                    killZoneElem.style.color = "#4cd7f6"; // Cyan glow
                } else if (data.strategy.playbook_state.includes("BLEED")) {
                    killZoneElem.style.color = "#ffb4ab"; // Red warning
                } else {
                    killZoneElem.style.color = "#8e95a3"; // Gray waiting
                }
            }
        }
        
    } catch (error) {
        // --- UPDATE KILL CHAIN TIMEFRAMES ---
if (data.timeframes) {
    // Helper function to update the UI
    const updateTF = (id, trend, bias) => {
        const el = document.getElementById(id);
        if (!el) return;
        
        if (bias === "BULLISH" || trend === "UPTREND") {
            el.textContent = "BULL";
            el.className = "text-xs font-bold text-[#4cd7f6] drop-shadow-[0_0_5px_rgba(76,215,246,0.5)]";
        } else if (bias === "BEARISH" || trend === "DOWNTREND") {
            el.textContent = "BEAR";
            el.className = "text-xs font-bold text-[#ffb4ab] drop-shadow-[0_0_5px_rgba(255,180,171,0.5)]";
        } else {
            el.textContent = "WAIT";
            el.className = "text-xs font-bold text-gray-500";
        }
    };

    // Map the backend data to our new HTML IDs
    const tf = data.timeframes;
    
    if (tf["M5"]) updateTF("tf-1m", tf["M5"].trend, tf["M5"].bias); 
    if (tf["M5"]) updateTF("tf-5m", tf["M5"].trend, tf["M5"].bias);
    if (tf["M30"]) updateTF("tf-15m", tf["M30"].trend, tf["M30"].bias);
    if (tf["M30"]) updateTF("tf-30m", tf["M30"].trend, tf["M30"].bias);
    if (tf["H1"]) updateTF("tf-1h", tf["H1"].trend, tf["H1"].bias);
    if (tf["D1"]) updateTF("tf-1d", tf["D1"].trend, tf["D1"].bias);
}
        console.error("Master System: Error fetching live data:", error);
    }
}
setInterval(fetchMarketData, 1000); // 1-second refresh for sniper accuracy
fetchMarketData(); 

// 3. DYNAMIC SESSION ENGINE
function updateSession() {
    const sessionElem = document.getElementById('active-session-text');
    if (!sessionElem) return;

    const now = new Date();
    const eatHours = (now.getUTCHours() + 3) % 24; 

    let currentSession = "SYDNEY / CLOSED";
    let colorClass = "text-gray-400";

    if (eatHours >= 16 || eatHours < 1) {
        currentSession = "NEW YORK";
        colorClass = "text-[#4cd7f6]"; 
    } 
    
    if (eatHours >= 11 && eatHours < 20) {
        currentSession = "LONDON";
        colorClass = "text-[#ffc174]"; 
    }

    if (eatHours >= 16 && eatHours < 20) {
        currentSession = "LONDON / NY OVERLAP";
        colorClass = "text-purple-400"; 
    } else if (eatHours >= 11 && eatHours < 12) {
        currentSession = "TOKYO / LONDON OVERLAP";
        colorClass = "text-purple-400";
    } else if (eatHours >= 3 && eatHours < 11) {
        currentSession = "TOKYO";
        colorClass = "text-blue-400";
    }

    sessionElem.textContent = currentSession;
    sessionElem.className = colorClass + " font-bold uppercase tracking-wider text-xs";
}
updateSession();
setInterval(updateSession, 60000); 

// 4. LIVE FOREX FACTORY NEWS TICKER
async function updateNewsTicker() {
    const ticker = document.getElementById('news-ticker-content');
    if (!ticker) return;

    try {
        const response = await fetch("https://st-firm-backend.onrender.com/api/v1/news/calendar");
        const data = await response.json();

        if (data.status !== "success" || !data.news || data.news.length === 0) {
            ticker.innerHTML = `<span class="text-gray-500 px-4">No upcoming high-impact news for today. Trade with caution.</span>`;
            return;
        }

        let newsHTML = "";
        data.news.forEach((item, index) => {
            let colorClass = "text-[#4cd7f6]"; 
            let icon = "🟡";
            
            if (item.impact === "High") {
                colorClass = "text-[#ffb4ab] drop-shadow-[0_0_8px_rgba(255,180,171,0.5)]"; 
                icon = "🔴";
            } else if (item.impact === "Medium") {
                colorClass = "text-orange-400"; 
                icon = "🟠";
            }

            const divider = index < data.news.length - 1 ? `<span class="text-gray-600 mx-4">|</span>` : "";

            newsHTML += `
                <div class="flex items-center gap-2 px-2">
                    <span class="${colorClass} font-bold text-[12px]">${icon} ${item.time} EAT - [${item.country}] ${item.title}</span>
                    ${divider}
                </div>
            `;
        });

        // Inject the live news into the ticker
        ticker.innerHTML = newsHTML;
        
        // Restart the scrolling animation
        ticker.style.animation = 'none';
        ticker.offsetHeight; 
        ticker.style.animation = null; 

    } catch (error) {
        console.error("News Engine Error:", error);
        ticker.innerHTML = `<span class="text-gray-500 px-4">News radar offline. Reconnecting...</span>`;
    }
}

// Run immediately, then update every 5 minutes
updateNewsTicker();
setInterval(updateNewsTicker, 300000); 
// 5. OVERLORD COGNITIVE FEED ENGINE
let lastLoggedState = "";
let lastLoggedPosture = "";

function updateCognitiveFeed(data) {
    const container = document.getElementById('ai-feed-container');
    if (!container) return;

    const now = new Date();
    const timeStr = `[${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}]`;
    
    let newLog = null;

    // Logic 1: Posture Change
    if (data.market_posture && data.market_posture !== lastLoggedPosture) {
        lastLoggedPosture = data.market_posture;
        if (data.market_posture === "BUY") {
            newLog = { text: `${timeStr} 🟢 Neural Confluence: BULLISH flip detected. Posture updated to BUY.`, color: "text-[#4cd7f6]" };
        } else if (data.market_posture === "SELL") {
            newLog = { text: `${timeStr} 🔴 Neural Confluence: BEARISH flip detected. Posture updated to SELL.`, color: "text-[#ffb4ab]" };
        }
    }

    // Logic 2: Strategy State Change
    if (data.strategy && data.strategy.playbook_state && data.strategy.playbook_state !== lastLoggedState) {
        lastLoggedState = data.strategy.playbook_state;
        
        if (data.strategy.playbook_state.includes("READY")) {
            newLog = { text: `${timeStr} 🎯 ALERT: Target zone breached. ${data.strategy.playbook_state}`, color: "text-[#ffc174] animate-pulse" };
        } else if (data.strategy.playbook_state.includes("BLEED")) {
            newLog = { text: `${timeStr} ⚠️ Institutional manipulation active. ${data.strategy.playbook_state}`, color: "text-[#ffb4ab]" };
        } else {
            newLog = { text: `${timeStr} ℹ️ Playbook phase: ${data.strategy.playbook_state}`, color: "text-gray-400" };
        }
    }

    // Logic 3: High Bloodlust
    if (data.bloodlust > 75 && Math.random() > 0.8) { 
        newLog = { text: `${timeStr} ⚡ EXTREME VOLATILITY: Bloodlust at ${data.bloodlust}%. Retail stops being hunted.`, color: "text-orange-400" };
    }

    // Inject the log if a condition was met
    if (newLog) {
        const logDiv = document.createElement('div');
        logDiv.className = newLog.color;
        logDiv.innerHTML = newLog.text;
        
        container.prepend(logDiv);
        
        if (container.children.length > 5) {
            container.removeChild(container.lastChild);
        }
    }
}
