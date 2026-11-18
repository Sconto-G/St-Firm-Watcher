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

// 2. Live Market Data Fetcher (Price, Trend, Posture)
async function fetchMarketData() {
    try {
        const renderUrl = "https://st-firm-backend.onrender.com/api/v1/market/xauusd";
        const response = await fetch(renderUrl);
        const data = await response.json();
        
        const liveBid = parseFloat(data.current_price || "4586.11");
        
        // Update Price (works on any page that has this ID)
        const spotPriceElem = document.getElementById('live-spot-price');
        if (spotPriceElem) {
            spotPriceElem.textContent = liveBid.toFixed(2);
            spotPriceElem.style.color = "#4cd7f6"; 
        }

        // Update Posture (HUD Page)
        const postureElem = document.getElementById('market-posture-text');
        if (postureElem && data.market_posture) {
            postureElem.textContent = data.market_posture;
            postureElem.style.color = data.market_posture === "BUY" ? "#4cd7f6" : "#ffb4ab";
        }

        // Update Confidence (HUD Page)
        const confidenceElem = document.getElementById('confidence-text');
        if (confidenceElem && data.confidence !== undefined) {
            confidenceElem.textContent = data.confidence + "%";
        }
        
    } catch (error) {
        console.error("Master System: Error fetching live data:", error);
    }
}

// Start the data engine
setInterval(fetchMarketData, 5000);
fetchMarketData(); // Run immediately on load
