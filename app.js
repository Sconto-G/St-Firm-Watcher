// ST-FIRM WATCHER - shared brain (v2). Safe on every page: missing elements are skipped, never thrown.
const API_BASE = "https://st-firm-backend.onrender.com";

// ---------- helpers
const $all = (id) => document.querySelectorAll(`[id="${id}"]`);          // also catches duplicate ids
const setText = (id, txt) => $all(id).forEach(el => { el.textContent = txt; });
const fmt = (v, ok = true) => (ok && Number.isFinite(v) && v !== 0) ? v.toFixed(2) : "----.--";

// ---------- 1. LIVE EAT CLOCK
function updateEATClock() {
    const els = document.querySelectorAll('.eat-live-clock');
    if (!els.length) return;
    const n = new Date();
    const t = `EAT ${String((n.getUTCHours() + 3) % 24).padStart(2, '0')}:${String(n.getUTCMinutes()).padStart(2, '0')}:${String(n.getUTCSeconds()).padStart(2, '0')}`;
    els.forEach(el => el.textContent = t);
}
setInterval(updateEATClock, 1000);
updateEATClock();

// ---------- 2. FEED BADGE (created once, under the header price)
function ensureFeedBadge() {
    let b = document.getElementById('feed-badge');
    if (b) return b;
    const hp = document.getElementById('header-price');
    if (!hp || !hp.parentElement) return null;
    b = document.createElement('div');
    b.id = 'feed-badge';
    b.style.cssText = 'font:700 8px/10px "JetBrains Mono",monospace;letter-spacing:.08em;text-align:right;margin-top:2px;';
    hp.parentElement.appendChild(b);
    return b;
}
function showFeed(label, color, title) {
    const b = ensureFeedBadge();
    if (!b) return;
    b.textContent = label; b.style.color = color; b.title = title || '';
}

const SESSION_NAMES = {
    ASIAN_JUDAS_WINDOW: "ASIA",
    DOCK_1_RECOVERY_WINDOW: "ASIA REC",
    LONDON_OPEN_MACRO: "LONDON",
    NY_OPEN_MACRO: "NEW YORK",
    PM_DISTRIBUTION_WALL: "PM DIST",
    HIBERNATION: "OFF-HRS"
};

// ---------- 3. THE MASTER FETCH ENGINE
let inFlight = false;
let failStreak = 0;

function applyOffline() {
    setText('header-price', '----.--');
    setText('compass-price', '----.--');
    setText('active-session-text', failStreak > 2 ? 'WAKING...' : 'OFFLINE');
    showFeed('NO LINK', '#ffb4ab', 'Backend not answering (Render may be waking up, ~30-60s).');
}

function applyData(data) {
    const feed = data.feed || {};
    const live = feed.ok === true;
    const price = parseFloat(data.current_price || "0");

    // price + session + feed badge
    const priceTxt = live ? price.toFixed(2) : '----.--';
    setText('header-price', priceTxt);
    setText('compass-price', priceTxt);
    setText('macro-state-text', data.macro_state || '');
    setText('active-session-text', live ? (SESSION_NAMES[data.macro_state] || data.macro_state) : 'NO FEED');
    if (!live) showFeed('NO FEED', '#ffb4ab', 'Server has no fresh price from any source.');
    else if (feed.proxy) showFeed('PROXY', '#ffc174', 'Price is PAXG (gold token), not exact XAUUSD. Add TWELVEDATA_API_KEY on Render to calibrate.');
    else showFeed('LIVE', '#56e5a9', `Source ${feed.source}, offset ${feed.offset}`);

    // liquidity matrix (levels only meaningful once the Asian range is frozen)
    if (data.liquidity_matrix) {
        const lm = data.liquidity_matrix;
        const rr = data.range_ready === true || (lm.buyside.price > 0 && lm.sellside.price > 0);
        setText('liq-buy-price', fmt(lm.buyside.price, rr));
        setText('liq-buy-dist', rr ? `+${lm.buyside.distance.toFixed(2)} pts` : '--.-- pts');
        setText('liq-eq-price', fmt(lm.equilibrium.price, live));
        setText('liq-eq-dist', live ? `${lm.equilibrium.distance.toFixed(2)} pts` : '--.-- pts');
        setText('liq-sell-price', fmt(lm.sellside.price, rr));
        setText('liq-sell-dist', rr ? `-${lm.sellside.distance.toFixed(2)} pts` : '--.-- pts');
    }

    // checklist
    if (data.checklist) {
        const pill = (id, ok) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.className = ok ? "text-[#4cd7f6] font-bold" : "text-gray-500 font-bold";
            el.textContent = ok ? "✅" : "⏳";
        };
        pill('check-sweep', data.checklist.sweep);
        pill('check-disp', data.checklist.displacement);
        pill('check-fvg', data.checklist.fvg);
    }

    // execution deck
    const deck = document.getElementById('execution-deck');
    const glow = ['border-[#4cd7f6]', 'shadow-[0_0_15px_rgba(76,215,246,0.2)]'];
    if (data.execution && data.execution.entry > 0) {
        setText('exec-grade', data.execution.grade);
        setText('exec-entry', data.execution.entry.toFixed(2));
        setText('exec-sl', data.execution.sl.toFixed(2));
        setText('exec-tp', data.execution.tp.toFixed(2));
        if (deck) deck.classList.add(...glow);
    } else {
        setText('exec-grade', 'SCANNING...');
        setText('exec-entry', '----.--'); setText('exec-sl', '----.--'); setText('exec-tp', '----.--');
        if (deck) deck.classList.remove(...glow);
    }

    // AI briefing (textContent only - never innerHTML)
    if (data.ai_briefing) {
        setText('ai-observation', data.ai_briefing.observation);
        setText('ai-inference', data.ai_briefing.inference);
        const decEl = document.getElementById('ai-decision');
        if (decEl) {
            const d = String(data.ai_briefing.decision || 'WAIT');
            decEl.textContent = d;
            decEl.className = d.includes('BUY') ? "text-sm font-bold text-[#4cd7f6] mt-1 drop-shadow-[0_0_8px_rgba(76,215,246,0.5)]"
                : d.includes('SELL') ? "text-sm font-bold text-[#ffb4ab] mt-1 drop-shadow-[0_0_8px_rgba(255,180,171,0.5)]"
                : "text-sm font-bold text-white mt-1";
        }
    }
}

async function fetchMarketData() {
    if (inFlight) return;                    // never pile up requests when Render is slow
    inFlight = true;
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 8000);
    try {
        const res = await fetch(`${API_BASE}/api/v1/market/xauusd`, { signal: ctl.signal, cache: 'no-store' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        applyData(await res.json());
        failStreak = 0;
    } catch (err) {
        failStreak++;
        applyOffline();
        if (failStreak === 1) console.warn('Market fetch failed:', err);
    } finally {
        clearTimeout(timer);
        inFlight = false;
    }
}
setInterval(fetchMarketData, 1000);
fetchMarketData();
