async function fetchMarketData() {
    try {
        const response = await fetch("https://st-firm-backend.onrender.com/api/v1/market/xauusd");
        const data = await response.json();
        
        // Update Compass & Header
        const price = parseFloat(data.current_price || "0.00");
        document.getElementById('header-price').textContent = price.toFixed(2);
        document.getElementById('compass-price').textContent = price.toFixed(2);

        // Update Timeframes
        const updateTF = (id, val) => {
            const el = document.getElementById(id);
            if (!el) return;
            const isBull = val.includes("BULL");
            el.textContent = isBull ? "BULL" : "BEAR";
            el.className = isBull ? "text-xs font-bold text-[#4cd7f6]" : "text-xs font-bold text-[#ffb4ab]";
        };
        if(data.timeframes) {
            updateTF("tf-1m", data.timeframes.M5); 
            updateTF("tf-15m", data.timeframes.M30); 
            updateTF("tf-1h", data.timeframes.H1);
            updateTF("tf-1d", data.timeframes.H4);
        }

        // Update Target & Gate
        document.getElementById('target-lock-text').textContent = `${data.target.name} (${data.target.price})`;
        const gateEl = document.getElementById('gate-status');
        const reasonEl = document.getElementById('gate-reason');
        if (data.gate) {
            gateEl.textContent = data.gate.status;
            reasonEl.textContent = data.gate.reason;
            
            if(data.gate.status === "CLEARED") gateEl.className = "text-[#4cd7f6] font-bold animate-pulse";
            else if(data.gate.status === "TRAP LOCKED") gateEl.className = "text-[#ffb4ab] font-bold animate-pulse";
            else gateEl.className = "text-orange-400 font-bold";
        }

        // Update Predator Eyes
        if (data.predator) {
            document.getElementById('predator-entry').textContent = data.predator.entry > 0 ? data.predator.entry : "----.--";
            document.getElementById('predator-tp').textContent = data.predator.tp > 0 ? data.predator.tp : "----.--";
        }

        // Update AI Briefing
        if (data.ai_briefing) {
            document.getElementById('ai-observation').textContent = data.ai_briefing.observation;
            document.getElementById('ai-inference').textContent = data.ai_briefing.inference;
            const decEl = document.getElementById('ai-decision');
            decEl.textContent = data.ai_briefing.decision;
            if(data.ai_briefing.decision.includes("BUY")) decEl.className = "text-sm font-bold text-[#4cd7f6] mt-1";
            else if(data.ai_briefing.decision.includes("SELL")) decEl.className = "text-sm font-bold text-[#ffb4ab] mt-1";
            else decEl.className = "text-sm font-bold text-white mt-1";
        }

    } catch (e) {
        console.error("Master Brain Offline:", e);
    }
}
setInterval(fetchMarketData, 1000);
fetchMarketData();
