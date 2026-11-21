// --- ST-FIRM MASTER NERVOUS SYSTEM ---

// 1. Live EAT Clock
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

// 2. Live Market Data Fetcher
async function fetchMarketData() {
    try {
        const renderUrl = "https://st-firm-backend.onrender.com/api/v1/market/xauusd";
        const response = await fetch(renderUrl);
        const data = await response.json();
        
        const liveBid = parseFloat(data.current_price || "4586.11");
        
        // Update Header Price
        const headerPriceElem = document.getElementById('header-price');
        if (headerPriceElem) {
            headerPriceElem.textContent = liveBid.toFixed(2);
        }

        // Update Compass Price
        const compassPriceElem = document.getElementById('compass-price');
        if (compassPriceElem) {
            compassPriceElem.textContent = liveBid.toFixed(2);
            compassPriceElem.style.color = "#4cd7f6"; 
        }

        // Update Posture
        const postureElem = document.getElementById('market-posture-text');
        if (postureElem && data.market_posture) {
            postureElem.textContent = data.market_posture;
            postureElem.style.color = data.market_posture === "BUY" ? "#4cd7f6" : "#ffb4ab";
        }

        // Update Confidence
        const confidenceElem = document.getElementById('confidence-text');
        if (confidenceElem && data.confidence !== undefined) {
            confidenceElem.textContent = data.confidence + "%";
        }

        // Update Bloodlust Gauge
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
        
    } catch (error) {
        console.error("Master System: Error fetching live data:", error);
    }
}

// Start the data engine
setInterval(fetchMarketData, 5000);
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
