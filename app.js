// 1. LIVE EAT CLOCK
function updateEATClock() {
    const clockElements = document.querySelectorAll('.eat-live-clock');
    if (clockElements.length === 0) return;
    const now = new Date();
    const eatHours = (now.getUTCHours() + 3) % 24;
    const timeString = `EAT ${String(eatHours).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')}`;
    clockElements.forEach(el => el.textContent = timeString);
}
setInterval(updateEATClock, 1000);
updateEATClock();

// 2. THE MASTER FETCH ENGINE
async function fetchMarketData() {
    try {
        const response = await fetch("https://st-firm-backend.onrender.com/api/v1/market/xauusd");
        const data = await response.json();
        
        // --- 1. Update Prices & Clock ---
        const price = parseFloat(data.current_price || "0.00");
        document.getElementById('header-price').textContent = price.toFixed(2);
        document.getElementById('compass-price').textContent = price.toFixed(2);
        
        // Update Macro State Badge (If you have one)
        const macroEl = document.getElementById('macro-state-text');
        if (macroEl) macroEl.textContent = data.macro_state;

        // --- 2. Liquidity Matrix ---
        if (data.liquidity_matrix) {
            const lm = data.liquidity_matrix;
            document.getElementById('liq-buy-price').textContent = lm.buyside.price.toFixed(2);
            document.getElementById('liq-buy-dist').textContent = `+${lm.buyside.distance.toFixed(2)} pts`;
            
            document.getElementById('liq-eq-price').textContent = lm.equilibrium.price.toFixed(2);
            document.getElementById('liq-eq-dist').textContent = `${lm.equilibrium.distance.toFixed(2)} pts`;
            
            document.getElementById('liq-sell-price').textContent = lm.sellside.price.toFixed(2);
            document.getElementById('liq-sell-dist').textContent = `-${lm.sellside.distance.toFixed(2)} pts`;
        }

        // --- 3. Radar Checklist ---
        if (data.checklist) {
            const updatePill = (id, isTrue) => {
                const el = document.getElementById(id);
                if (!el) return;
                el.className = isTrue ? "text-[#4cd7f6] font-bold" : "text-gray-500 font-bold";
                el.textContent = isTrue ? "✅" : "⏳";
            };
            updatePill('check-sweep', data.checklist.sweep);
            updatePill('check-disp', data.checklist.displacement);
            updatePill('check-fvg', data.checklist.fvg);
        }

        // --- 4. Execution Deck ---
        if (data.execution && data.execution.entry > 0) {
            document.getElementById('exec-grade').textContent = data.execution.grade;
            document.getElementById('exec-entry').textContent = data.execution.entry.toFixed(2);
            document.getElementById('exec-sl').textContent = data.execution.sl.toFixed(2);
            document.getElementById('exec-tp').textContent = data.execution.tp.toFixed(2);
            
            // Light up the deck
            document.getElementById('execution-deck').classList.add('border-[#4cd7f6]', 'shadow-[0_0_15px_rgba(76,215,246,0.2)]');
        } else {
            document.getElementById('exec-grade').textContent = "SCANNING...";
            document.getElementById('exec-entry').textContent = "----.--";
            document.getElementById('exec-sl').textContent = "----.--";
            document.getElementById('exec-tp').textContent = "----.--";
            document.getElementById('execution-deck').classList.remove('border-[#4cd7f6]', 'shadow-[0_0_15px_rgba(76,215,246,0.2)]');
        }

        // --- 5. Overlord AI Briefing ---
        if (data.ai_briefing) {
            document.getElementById('ai-observation').textContent = data.ai_briefing.observation;
            document.getElementById('ai-inference').textContent = data.ai_briefing.inference;
            
            const decEl = document.getElementById('ai-decision');
            decEl.textContent = data.ai_briefing.decision;
            
            if (data.ai_briefing.decision.includes("BUY")) {
                decEl.className = "text-sm font-bold text-[#4cd7f6] mt-1 drop-shadow-[0_0_8px_rgba(76,215,246,0.5)]";
            } else if (data.ai_briefing.decision.includes("SELL")) {
                decEl.className = "text-sm font-bold text-[#ffb4ab] mt-1 drop-shadow-[0_0_8px_rgba(255,180,171,0.5)]";
            } else {
                decEl.className = "text-sm font-bold text-white mt-1";
            }
        }

    } catch (error) {
        console.error("Master System Error:", error);
    }
}
setInterval(fetchMarketData, 1000);
fetchMarketData(); 
