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
    const data = await response.json();
      
    const liveBid = parseFloat(data.current_price || "4586.11");
      
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
        const postureElem = document.getElementById('market-posture-text');
        if (postureElem && data.market_posture) {
            postureElem.textContent = data.market_posture;
            postureElem.style.color = data.market_posture === "BUY" ? "#4cd7f6" : "#ffb4ab";
        }

    // Update Confidence (Specifically for the HUD Page)
    const confidenceElem = document.getElementById("confidence-text");
    if (confidenceElem && data.confidence !== undefined && data.confidence !== null) {
      confidenceElem.textContent = `${data.confidence}%`;
    }
      
      // Update Bloodlust Gauge
const bloodlustBar = document.getElementById('bloodlust-bar');
const bloodlustText = document.getElementById('bloodlust-text');

if (bloodlustBar && data.bloodlust !== undefined) {
    bloodlustBar.style.width = data.bloodlust + '%';
    if (bloodlustText) bloodlustText.innerText = data.bloodlust + '%';
    
    // Change color based on intensity
    if (data.bloodlust > 75) {
        bloodlustBar.className = "h-full bg-red-500 transition-all duration-500"; // Extreme
        if (bloodlustText) bloodlustText.className = "text-red-500 font-bold";
    } else if (data.bloodlust > 40) {
        bloodlustBar.className = "h-full bg-orange-400 transition-all duration-500"; // Volatile
        if (bloodlustText) bloodlustText.className = "text-orange-400 font-bold";
    } else {
        bloodlustBar.className = "h-full bg-cyan-400 transition-all duration-500"; // Calm
        if (bloodlustText) bloodlustText.className = "text-cyan-400 font-bold";
    }
}
              // Update Institutional Metrics HUD
        const hud = data.institutional_hud || {};
        const setHudText = (id, val) => {
          const el = document.getElementById(id);
          if (el && val !== undefined && val !== null) el.textContent = val;
        };

        setHudText("hud-weekly-open", hud.weekly_open ?? "2410.50");
        setHudText("hud-weekly-bias", hud.weekly_bias_text ?? "-1.07% RED BIAS");
        setHudText("hud-pdh-price", hud.pdh_price ?? "2415.80");
        setHudText("hud-pdh-status", hud.pdh_status ?? "SWEPT ✓");
        setHudText("hud-pdh-sub", hud.pdh_subtext ?? "BUY-STOPS PURGED");
        setHudText("hud-pdl-price", hud.pdl_price ?? "2378.20");
        setHudText("hud-pdl-badge", hud.pdl_badge ?? "MAGNET");
        setHudText("hud-pdl-sub", hud.pdl_subtext ?? "RUN EXPECTED D1");

        const fuelPct = Math.max(0, Math.min(100, Number(hud.fuel_pct ?? data.bloodlust ?? 78)));
        setHudText("hud-fuel-pct", hud.fuel_label ?? `${fuelPct}% USED`);
        setHudText("hud-fuel-pips", hud.fuel_pips_text ?? "142 / 182 PIPS EXP");

        const fuelBar = document.getElementById("hud-fuel-bar");
        if (fuelBar) fuelBar.style.width = `${fuelPct}%`;
    
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
