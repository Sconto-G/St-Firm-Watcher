// ST-FIRM WATCHER - shared brain (v3)
//  * Price ticks come STRAIGHT from Binance (websocket, ~100ms) in your own browser, so the HUD no longer
//    waits on Render. The server still supplies structure (levels, sweeps, AI) once per second.
//  * Tap the small badge under the price to SYNC the HUD to the price on your MT5 screen.
//  * Safe on every page: missing elements are skipped, never thrown.
const API_BASE = "https://st-firm-backend.onrender.com";
const WS_URLS = ["wss://stream.binance.com:9443/ws/paxgusdt@bookTicker",
                 "wss://stream.binance.com:443/ws/paxgusdt@bookTicker"];
const LS_OFFSET = "stfirm_offset", LS_TOKEN = "stfirm_token";

// ---------- helpers
const $all = (id) => document.querySelectorAll(`[id="${id}"]`);          // also catches duplicate ids
const setText = (id, txt) => $all(id).forEach(el => { el.textContent = txt; });
const fmt = (v, ok = true) => (ok && Number.isFinite(v) && v !== 0) ? v.toFixed(2) : "----.--";
const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } }
};

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

// ---------- 2. STATE
const ws = { bid: null, ts: 0, sock: null, tries: 0 };
let lastServer = null;                      // last good /market response
let localOffset = (() => { const v = parseFloat(store.get(LS_OFFSET)); return Number.isFinite(v) ? v : null; })();
let lastShown = null, lastRender = 0, resynced = false;

const wsFresh = () => ws.bid !== null && (Date.now() - ws.ts) < 5000;
const srvFeed = () => (lastServer && lastServer.feed) ? lastServer.feed : null;

function activeOffset() {
    if (localOffset !== null) return localOffset;                       // your MT5 sync wins
    const f = srvFeed();
    return (f && f.calibrated) ? (f.offset || 0) : 0;
}

// ---------- 3. BINANCE WEBSOCKET (browser -> Binance, no Render hop)
function connectWS() {
    if (typeof WebSocket === 'undefined') return;
    let sock;
    try { sock = new WebSocket(WS_URLS[ws.tries % WS_URLS.length]); } catch (e) { return scheduleReconnect(); }
    ws.sock = sock;
    sock.onmessage = (ev) => {
        try {
            const d = JSON.parse(ev.data);
            const bid = parseFloat(d.b);
            if (Number.isFinite(bid)) { ws.bid = bid; ws.ts = Date.now(); ws.tries = 0; scheduleRender(); }
        } catch (e) { /* ignore bad frame */ }
    };
    sock.onclose = scheduleReconnect;
    sock.onerror = () => { try { sock.close(); } catch (e) { /* ignore */ } };
}
function scheduleReconnect() {
    ws.tries++;
    setTimeout(connectWS, Math.min(1000 * Math.pow(2, Math.min(ws.tries, 4)), 15000));
}

// ---------- 4. PRICE + FEED BADGE
function ensureFeedBadge() {
    let b = document.getElementById('feed-badge');
    if (b) return b;
    const hp = document.getElementById('header-price');
    if (!hp || !hp.parentElement) return null;
    b = document.createElement('div');
    b.id = 'feed-badge';
    b.style.cssText = 'font:700 8px/10px "JetBrains Mono",monospace;letter-spacing:.08em;text-align:right;margin-top:2px;padding:6px 2px 2px 8px;cursor:pointer;';
    if (b.addEventListener) b.addEventListener('click', syncToBroker);
    hp.parentElement.appendChild(b);
    return b;
}
function showFeed(label, color, title) {
    const b = ensureFeedBadge();
    if (!b) return;
    b.textContent = label; b.style.color = color; b.title = title || '';
}

function currentPrice() {
    if (wsFresh()) return { price: ws.bid + activeOffset(), live: true };
    if (lastServer && lastServer.feed && lastServer.feed.ok) return { price: parseFloat(lastServer.current_price), live: false };
    return null;
}

function flash(up) {
    ['header-price', 'compass-price'].forEach(id => $all(id).forEach(el => {
        el.style.color = up ? '#56e5a9' : '#ffb4ab';
        setTimeout(() => { el.style.color = ''; }, 160);
    }));
}

function renderPrice() {
    const cp = currentPrice();
    const f = srvFeed();
    const bolt = wsFresh() ? ' ⚡' : '';
    if (!cp) {
        setText('header-price', '----.--'); setText('compass-price', '----.--');
        return;
    }
    const txt = cp.price.toFixed(2);
    setText('header-price', txt); setText('compass-price', txt);
    if (lastShown !== null && cp.price !== lastShown) flash(cp.price > lastShown);
    lastShown = cp.price;

    if (localOffset !== null) showFeed('SYNCED' + bolt, '#56e5a9', `Aligned to your MT5 (offset ${localOffset.toFixed(2)}). Tap to re-sync.`);
    else if (f && f.calibrated) showFeed('LIVE' + bolt, '#56e5a9', `Auto-aligned to spot (offset ${f.offset}). Tap to sync to your MT5.`);
    else showFeed('PROXY' + bolt, '#ffc174', 'Gold-token price, not exact XAUUSD. TAP to sync to the price on your MT5.');
}
function scheduleRender() {
    const now = Date.now();
    if (now - lastRender < 80) return;          // max ~12 repaints/second
    lastRender = now;
    renderPrice();
}

// ---------- 5. SYNC TO YOUR BROKER (MT5)
async function pushOffset(offset) {
    const token = store.get(LS_TOKEN);
    if (!token) return { status: 'no-token' };
    try {
        const r = await fetch(`${API_BASE}/api/v1/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token },
            body: JSON.stringify(offset === null ? { clear: true } : { offset })
        });
        if (r.status === 401) store.del(LS_TOKEN);
        return await r.json();
    } catch (e) { return { status: 'error' }; }
}

async function syncToBroker() {
    const f = srvFeed();
    const live = wsFresh() ? ws.bid : (f && f.raw_price != null ? f.raw_price : null);
    if (live === null) { alert('No live price yet. Wait a second and tap again.'); return; }
    const txt = prompt('Type the SELL price you see on your MT5 right now (example 3650.83).\nType CLEAR to remove the sync.');
    if (txt === null) return;
    if (txt.trim().toUpperCase() === 'CLEAR') {
        localOffset = null; store.del(LS_OFFSET); await pushOffset(null); renderPrice(); return;
    }
    const mt5 = parseFloat(txt);
    if (!Number.isFinite(mt5) || mt5 < 100) { alert('That does not look like a gold price.'); return; }
    const off = mt5 - live;
    if (Math.abs(off) > 0.05 * live) { alert('That is more than 5% away from the live price. Check the number.'); return; }
    localOffset = off; store.set(LS_OFFSET, String(off));
    renderPrice();
    if (!store.get(LS_TOKEN)) {
        const tok = prompt('Optional: paste your ADMIN_TOKEN so the server levels use the same sync. Cancel = this screen only.');
        if (tok && tok.trim()) store.set(LS_TOKEN, tok.trim());
    }
    const res = await pushOffset(off);
    if (res && res.status === 'ok') showFeed('SYNCED ✓', '#56e5a9', 'Screen and server are aligned to your MT5.');
}

// ---------- 6. SERVER DATA (structure, levels, AI)
const SESSION_NAMES = {
    ASIAN_JUDAS_WINDOW: "ASIA", DOCK_1_RECOVERY_WINDOW: "ASIA REC", LONDON_OPEN_MACRO: "LONDON",
    NY_OPEN_MACRO: "NEW YORK", PM_DISTRIBUTION_WALL: "PM DIST", HIBERNATION: "OFF-HRS"
};
let inFlight = false, failStreak = 0;

function applyOffline() {
    lastServer = null;
    renderPrice();                                         // the browser websocket may still be live
    setText('active-session-text', wsFresh() ? 'NO SERVER' : (failStreak > 2 ? 'WAKING...' : 'OFFLINE'));
    if (!wsFresh()) showFeed('NO LINK', '#ffb4ab', 'Backend not answering (Render may be waking up, ~30-60s).');
}

function applyData(data) {
    lastServer = data;
    const feed = data.feed || {};
    const live = feed.ok === true;
    renderPrice();
    setText('macro-state-text', data.macro_state || '');
    setText('active-session-text', (live || wsFresh()) ? (SESSION_NAMES[data.macro_state] || data.macro_state) : 'NO FEED');
    if (!live && !wsFresh()) showFeed('NO FEED', '#ffb4ab', 'Server has no fresh price from any source.');

    if (data.liquidity_matrix) {
        const lm = data.liquidity_matrix;
        const rr = lm.buyside.price > 0 && lm.sellside.price > 0;
        setText('liq-buy-price', fmt(lm.buyside.price, rr));
        setText('liq-buy-dist', rr ? `+${lm.buyside.distance.toFixed(2)} pts` : '--.-- pts');
        setText('liq-eq-price', fmt(lm.equilibrium.price, live));
        setText('liq-eq-dist', live ? `${lm.equilibrium.distance.toFixed(2)} pts` : '--.-- pts');
        setText('liq-sell-price', fmt(lm.sellside.price, rr));
        setText('liq-sell-dist', rr ? `-${lm.sellside.distance.toFixed(2)} pts` : '--.-- pts');
    }
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
    if (data.ai_briefing) {
        setText('ai-observation', data.ai_briefing.observation);       // textContent only, never innerHTML
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
    // after a Render restart the server forgets your MT5 sync: re-send it once per page load
    if (!resynced && localOffset !== null && store.get(LS_TOKEN) &&
        (feed.manual !== true || Math.abs((feed.offset || 0) - localOffset) > 0.02)) {
        resynced = true;
        pushOffset(localOffset);
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

connectWS();
setInterval(fetchMarketData, 1000);
setInterval(renderPrice, 1000);              // keeps the badge honest when the websocket goes quiet
fetchMarketData();
