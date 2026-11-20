// --- ST-FIRM MASTER NERVOUS SYSTEM ---

// 1. Live EAT Clock
function updateEATClock() {
    // This looks for any element with the class "eat-live-clock"
    const clockElements = document.querySelectorAll('.eat-live-clock');
    if (clockElements.length === 0) return;
    
    const now = new Date();
    const eatHours = (now.getUTCHours() + 3) % 24;
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    const seconds = String(now.getUTCSeconds()).padStart(2, '0');
    const hours = String(eatHours).padStart(2, '0');
    
    const timeString = `EAT ${hours}:${minutes}:${seconds} NAIROBI (UTC+3)`;
    
    // Updates every element on the page that has this class
    clockElements.forEach(el => {
        el.textContent = timeString;
    });
}
setInterval(updateEATClock, 1000);

// 2. Live Market Data Fetcher (Price, Trend, Posture)
async function fetchMarketData() {
  try {
    const renderUrl = "https://st-firm-backend.onrender.com/api/v1/market/xauusd";
    const response = await fetch(renderUrl, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const rawPrice = data.current_price ?? data.price ?? data.bid;
    const parsedPrice = Number.parseFloat(rawPrice);
    const liveBid = Number.isFinite(parsedPrice) ? parsedPrice : 3525.72;
    const formattedPrice = liveBid.toFixed(2);

    // Update Price (Header)
    const headerPriceElem = document.getElementById("header-price");
    if (headerPriceElem) {
      headerPriceElem.textContent = formattedPrice;
    }

    // Update Price (Compass / Kill Chain)
    const compassPriceElem = document.getElementById("compass-price");
    if (compassPriceElem) {
      compassPriceElem.textContent = formattedPrice;
      compassPriceElem.style.color = "#4cd7f6";
    }

    // Update Price (Campaign Live Tick)
    const liveTickElem = document.getElementById("live-tick-price");
    if (liveTickElem) {
      liveTickElem.textContent = formattedPrice;
    }

    // Update Posture (Specifically for the HUD Page)
    const postureElem = document.getElementById("market-posture-text");
    if (postureElem && data.market_posture) {
      const posture = String(data.market_posture).toUpperCase();
      postureElem.textContent = posture;
      postureElem.style.color = posture === "BUY" ? "#4cd7f6" : "#ffb4ab";
    }

    // Update Confidence (Specifically for the HUD Page)
    const confidenceElem = document.getElementById("confidence-text");
    if (confidenceElem && data.confidence !== undefined && data.confidence !== null) {
      confidenceElem.textContent = `${data.confidence}%`;
    }

    // Update Bloodlust Gauge
    const bloodlustBar = document.getElementById("bloodlust-bar");
    const bloodlustText = document.getElementById("bloodlust-text");
    if (data.bloodlust !== undefined && data.bloodlust !== null) {
      const level = Math.max(0, Math.min(100, Number(data.bloodlust) || 0));

      if (bloodlustBar) {
        bloodlustBar.style.width = `${level}%`;
        if (level > 75) {
          bloodlustBar.className = "h-full bg-red-500 transition-all duration-500";
        } else if (level > 40) {
          bloodlustBar.className = "h-full bg-orange-400 transition-all duration-500";
        } else {
          bloodlustBar.className = "h-full bg-cyan-400 transition-all duration-500";
        }
      }

      if (bloodlustText) {
        bloodlustText.textContent = `${level}%`;
        if (level > 75) {
          bloodlustText.className = "text-red-500 font-bold";
        } else if (level > 40) {
          bloodlustText.className = "text-orange-400 font-bold";
        } else {
          bloodlustText.className = "text-cyan-400 font-bold";
        }
      }
    }
  } catch (error) {
    console.error("Master System: Error fetching live data.", error);
  }
}


// Start the data engine
setInterval(fetchMarketData, 5000);
fetchMarketData(); // Run immediately on load
// 3. DYNAMIC SESSION ENGINE
function updateSession() {
    const sessionElem = document.getElementById('active-session-text');
    if (!sessionElem) return;

    const now = new Date();
    const eatHours = (now.getUTCHours() + 3) % 24; // EAT is UTC+3

    let currentSession = "SYDNEY / CLOSED";
    let colorClass = "text-gray-400";

    // Define Session Times (EAT)
    if (eatHours >= 16 || eatHours < 1) {
        currentSession = "NEW YORK";
        colorClass = "text-[#4cd7f6]"; // Cyan
    } 
    
    if (eatHours >= 11 && eatHours < 20) {
        currentSession = "LONDON";
        colorClass = "text-[#ffc174]"; // Gold
    }

    // Handle Overlaps
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
    sessionElem.className = colorClass; 
}

// Run immediately, then update every minute
updateSession();
setInterval(updateSession, 60000); 
