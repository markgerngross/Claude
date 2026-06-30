'use strict';

/* Stuhl-Tai-Chi – Frontend-Logik (PWA, mobil-first). */

// ---------------------------------------------------------------------------
// Status & Persistenz
// ---------------------------------------------------------------------------
const LS_KEY = 'stuhl-taichi-state';
let state = null;
let currentView = 'heute';

function defaultState() {
  return {
    version: 1,
    profile: { name: '', weightKg: null, startDate: null, partner: null },
    days: {},
    weightLog: [],
    updatedAt: null,
  };
}

async function loadState() {
  // Zuerst Server (Quelle der Wahrheit, synchronisiert iPhone+iPad),
  // bei Fehler localStorage als Offline-Fallback.
  try {
    const res = await fetch('/api/state', { cache: 'no-store' });
    if (res.ok) {
      state = await res.json();
      localStorage.setItem(LS_KEY, JSON.stringify(state));
      return;
    }
  } catch (_) { /* offline */ }
  const local = localStorage.getItem(LS_KEY);
  state = local ? JSON.parse(local) : defaultState();
}

let saveTimer = null;
function saveState() {
  state.updatedAt = new Date().toISOString();
  localStorage.setItem(LS_KEY, JSON.stringify(state));
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    fetch('/api/state', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    }).catch(() => { /* offline – localStorage haelt den Stand */ });
  }, 400);
}

// ---------------------------------------------------------------------------
// Helfer
// ---------------------------------------------------------------------------
const $ = (sel, el = document) => el.querySelector(sel);
const view = () => document.getElementById('view');
const todayISO = () => new Date().toISOString().slice(0, 10);

function completedCount() {
  return Object.values(state.days).filter((d) => d && d.done).length;
}

// Welcher Tag ist "heute" dran? Der erste nicht erledigte Tag (1..28).
function activeDay() {
  for (let n = 1; n <= 28; n++) {
    if (!(state.days[n] && state.days[n].done)) return n;
  }
  return 28; // alles fertig
}

function totalMinutes() {
  return Object.values(state.days).reduce((s, d) => s + (d && d.minutes ? d.minutes : 0), 0);
}

function estKcal() {
  const w = state.profile.weightKg || 85; // konservativer Standard
  const hours = totalMinutes() / 60;
  return Math.round(window.TAICHI_MET * w * hours);
}

// Serie: aufeinanderfolgende Tage mit Abschluss, bis heute/gestern.
function streak() {
  const dates = Object.values(state.days)
    .filter((d) => d && d.done && d.dateISO)
    .map((d) => d.dateISO)
    .sort();
  if (!dates.length) return 0;
  const set = new Set(dates);
  let count = 0;
  const cur = new Date();
  // Erlaube, dass die Serie heute oder gestern endet.
  const last = dates[dates.length - 1];
  const diffToday = Math.round((new Date(todayISO()) - new Date(last)) / 86400000);
  if (diffToday > 1) return 0;
  let cursor = new Date(last);
  while (set.has(cursor.toISOString().slice(0, 10))) {
    count++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

function fmtTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// ---------------------------------------------------------------------------
// Render-Router
// ---------------------------------------------------------------------------
function render() {
  // Onboarding erzwingen, wenn noch kein Partner/Start gesetzt.
  if (!state.profile.partner || !state.profile.startDate) {
    renderOnboarding();
    setActiveTab(null);
    return;
  }
  setActiveTab(currentView);
  updateStreakBadge();
  switch (currentView) {
    case 'heute': return renderHeute();
    case 'programm': return renderProgramm();
    case 'fortschritt': return renderFortschritt();
    case 'partner': return renderPartner();
    default: return renderHeute();
  }
}

function setActiveTab(name) {
  document.querySelectorAll('.tab').forEach((t) => {
    t.classList.toggle('active', t.dataset.view === name);
  });
}

function updateStreakBadge() {
  const s = streak();
  const badge = document.getElementById('streakBadge');
  if (s > 0) {
    badge.hidden = false;
    document.getElementById('streakNum').textContent = s;
  } else {
    badge.hidden = true;
  }
}

// ---------------------------------------------------------------------------
// Onboarding
// ---------------------------------------------------------------------------
function renderOnboarding() {
  const partners = window.PARTNERS;
  view().innerHTML = `
    <span class="pill">Willkommen</span>
    <h1>Stuhl Tai-Chi · 28 Tage</h1>
    <p class="sub">Sanftes Training im Sitzen. Gut fuer Beweglichkeit, Kreislauf
      und als ruhiger Begleiter beim Abnehmen. In wenigen Minuten startklar.</p>

    <div class="card">
      <label class="field">Dein Name (optional)
        <input id="ob-name" type="text" placeholder="z. B. Mark" />
      </label>
      <label class="field">Aktuelles Gewicht in kg (fuer die Kalorien-Schaetzung)
        <input id="ob-weight" type="number" inputmode="decimal" placeholder="z. B. 88" />
      </label>
    </div>

    <h2>Waehle deinen Trainingspartner</h2>
    <p class="sub">Begleitet dich den ganzen Monat und meldet sich jeden Tag.</p>
    <div class="partner-pick" id="ob-partners">
      ${partners.map((p) => `
        <div class="partner-opt" data-id="${p.id}">
          <div class="pe">${p.emoji}</div>
          <div>
            <div class="pn">${p.name}</div>
            <div class="ps">${p.stil}</div>
          </div>
        </div>`).join('')}
    </div>

    <button class="btn" id="ob-start" disabled>Monat starten</button>
    <p class="note">Diese App ersetzt keine aerztliche Beratung. Wenn du Beschwerden hast
      oder unsicher bist, sprich vor Trainingsbeginn mit deinem Arzt.</p>
  `;

  let picked = null;
  view().querySelectorAll('.partner-opt').forEach((el) => {
    el.addEventListener('click', () => {
      view().querySelectorAll('.partner-opt').forEach((e) => e.classList.remove('selected'));
      el.classList.add('selected');
      picked = el.dataset.id;
      $('#ob-start').disabled = false;
    });
  });

  $('#ob-start').addEventListener('click', () => {
    if (!picked) return;
    state.profile.name = $('#ob-name').value.trim();
    const w = parseFloat($('#ob-weight').value.replace(',', '.'));
    state.profile.weightKg = isFinite(w) && w > 0 ? w : null;
    if (state.profile.weightKg) {
      state.weightLog.push({ dateISO: todayISO(), kg: state.profile.weightKg });
    }
    state.profile.partner = picked;
    state.profile.startDate = todayISO();
    saveState();
    currentView = 'heute';
    render();
  });
}

// ---------------------------------------------------------------------------
// Heute
// ---------------------------------------------------------------------------
function getPartner() {
  return window.PARTNERS.find((p) => p.id === state.profile.partner) || window.PARTNERS[0];
}

function renderHeute() {
  const n = activeDay();
  const day = window.PROGRAM[n - 1];
  const dayState = state.days[n] || {};
  const allDone = completedCount() >= 28;
  const partner = getPartner();
  const msg = window.partnerMessage(partner.id, {
    tag: n, streak: streak(), done: !!dayState.done, totalDone: completedCount(),
  });

  if (allDone) {
    view().innerHTML = `
      <div class="celebrate">
        <div class="big">&#127881;</div>
        <h1>28 Tage geschafft!</h1>
        <p class="sub">Du hast den kompletten Monat durchgezogen. Respekt.</p>
      </div>
      <div class="stats">
        ${statCard(completedCount(), 'Einheiten')}
        ${statCard(totalMinutes(), 'Minuten')}
        ${statCard(estKcal(), 'kcal (geschaetzt)')}
        ${statCard(streak(), 'Tage-Serie')}
      </div>
      <button class="btn secondary" style="margin-top:16px" id="restart">Neuen Monat starten</button>
      <p class="note">Wiederhole das Programm fuer noch mehr Routine – jede Runde faellt leichter.</p>
    `;
    $('#restart').addEventListener('click', () => {
      if (confirm('Fortschritt zuruecksetzen und neuen 28-Tage-Monat starten?')) {
        state.days = {};
        state.profile.startDate = todayISO();
        saveState();
        render();
      }
    });
    return;
  }

  view().innerHTML = `
    <div class="partner-chat">
      <div class="pe">${partner.emoji}</div>
      <div class="bubble"><span class="who">${partner.name}</span>${msg}</div>
    </div>

    <div class="hero">
      <div class="day-num">${day.wochenName}</div>
      <h1>Tag ${n} von 28</h1>
      <p style="margin:0;opacity:.9">${day.intro}</p>
      <div class="meta">
        <div><b>${day.minuten}</b>Minuten</div>
        <div><b>${day.blocks.length}</b>Uebungen</div>
        <div><b>${streak()}</b>Tage-Serie</div>
      </div>
      <button class="btn" id="startSession">${dayState.done ? 'Heute wiederholen' : 'Training starten'}</button>
    </div>

    <h2>Heutige Uebungen</h2>
    <div class="card">
      ${day.blocks.map((b, i) => {
        const m = window.MOVES[b.move];
        return `<div class="weight-row"><span>${i + 1}. ${m.name}</span><span style="color:var(--muted)">${fmtTime(b.seconds)}</span></div>`;
      }).join('')}
    </div>
    <p class="note">Trink vorher und nachher ein Glas Wasser. Bewege dich nur so weit,
      wie es sich angenehm anfuehlt – nie in den Schmerz hinein.</p>
  `;
  $('#startSession').addEventListener('click', () => startSession(n));
}

function statCard(num, lbl) {
  return `<div class="stat"><div class="num">${num}</div><div class="lbl">${lbl}</div></div>`;
}

// ---------------------------------------------------------------------------
// Session-Player
// ---------------------------------------------------------------------------
let sessionTimer = null;

function startSession(dayNumber) {
  const day = window.PROGRAM[dayNumber - 1];
  let idx = 0;
  let remaining = day.blocks[0].seconds;
  let paused = false;

  function drawRing(frac) {
    const r = 100;
    const c = 2 * Math.PI * r;
    return `
      <svg width="100%" height="100%" viewBox="0 0 220 220">
        <circle cx="110" cy="110" r="${r}" fill="none" stroke="#e2e0d6" stroke-width="14"/>
        <circle cx="110" cy="110" r="${r}" fill="none" stroke="#c9a24b" stroke-width="14"
          stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - frac)}"/>
      </svg>`;
  }

  function paint() {
    const b = day.blocks[idx];
    const m = window.MOVES[b.move];
    const vid = (window.MOVE_VIDEO || {})[b.move];
    const frac = remaining / b.seconds;
    const dots = day.blocks.map((_, i) =>
      `<i class="${i < idx ? 'passed' : i === idx ? 'active' : ''}"></i>`).join('');

    view().innerHTML = `
      <div class="player">
        <span class="pill">Tag ${dayNumber} · Uebung ${idx + 1}/${day.blocks.length}</span>
        <div class="phase-name">${m.name}</div>
        <div class="phase-origin">${m.origin} · ${m.focus}</div>
        <div class="figure-wrap" id="figWrap">
          ${window.buildFigureSVG(b.move)}
          ${vid ? `<video class="figure-video" src="${vid}" loop muted playsinline preload="metadata"></video>` : ''}
        </div>
        ${vid ? `<button class="btn ghost small vid-toggle" id="toggleVid">&#9654; Echte Person zeigen</button>` : ''}
        <div class="timer-ring">${drawRing(frac)}<div class="time">${fmtTime(remaining)}</div></div>
        <div class="progress-dots">${dots}</div>
        <div class="breath"><b>Atem:</b> ${m.breathing}</div>
        <ol class="howto">${m.howto.map((h) => `<li>${h}</li>`).join('')}</ol>
        <div class="player-controls">
          <button class="btn secondary" id="pp">${paused ? 'Weiter' : 'Pause'}</button>
          <button class="btn ghost" id="skip">Naechste &#8594;</button>
        </div>
        <button class="btn ghost" id="quit" style="margin-top:10px">Abbrechen</button>
      </div>`;

    $('#pp').addEventListener('click', () => { paused = !paused; paint(); });
    $('#skip').addEventListener('click', nextBlock);
    const tv = $('#toggleVid');
    if (tv) tv.addEventListener('click', () => {
      const wrap = $('#figWrap');
      const video = wrap.querySelector('.figure-video');
      const on = wrap.classList.toggle('show-video');
      tv.innerHTML = on ? '✎ Animierte Figur zeigen' : '▶ Echte Person zeigen';
      if (video) { if (on) { video.play().catch(() => {}); } else { video.pause(); } }
    });
    $('#quit').addEventListener('click', () => {
      clearInterval(sessionTimer);
      render();
    });
  }

  function nextBlock() {
    idx++;
    if (idx >= day.blocks.length) return finish();
    remaining = day.blocks[idx].seconds;
    paint();
  }

  function finish() {
    clearInterval(sessionTimer);
    const wasDone = state.days[dayNumber] && state.days[dayNumber].done;
    state.days[dayNumber] = { done: true, dateISO: todayISO(), minutes: day.minuten };
    saveState();
    const partner = getPartner();
    view().innerHTML = `
      <div class="celebrate">
        <div class="big">&#10024;</div>
        <h1>Tag ${dayNumber} geschafft!</h1>
      </div>
      <div class="partner-chat">
        <div class="pe">${partner.emoji}</div>
        <div class="bubble"><span class="who">${partner.name}</span>${
          window.partnerMessage(partner.id, { tag: dayNumber, streak: streak(), done: true, totalDone: completedCount() })
        }</div>
      </div>
      <div class="stats">
        ${statCard(completedCount() + '/28', 'Einheiten')}
        ${statCard('+' + day.minuten, 'Minuten heute')}
        ${statCard(streak(), 'Tage-Serie')}
        ${statCard(estKcal(), 'kcal gesamt')}
      </div>
      <button class="btn" style="margin-top:16px" id="backHome">${wasDone ? 'Fertig' : 'Weiter'}</button>
    `;
    $('#backHome').addEventListener('click', () => { currentView = 'heute'; render(); });
  }

  paint();
  sessionTimer = setInterval(() => {
    if (paused) return;
    remaining--;
    if (remaining <= 0) {
      nextBlock();
    } else {
      // Nur Ring + Zahl aktualisieren (kein voller Re-Render), damit Buttons reagieren.
      const b = day.blocks[idx];
      const ring = $('.timer-ring');
      if (ring) {
        const r = 100, c = 2 * Math.PI * r, frac = remaining / b.seconds;
        const prog = ring.querySelectorAll('circle')[1];
        if (prog) prog.setAttribute('stroke-dashoffset', c * (1 - frac));
        const t = $('.timer-ring .time');
        if (t) t.textContent = fmtTime(remaining);
      }
    }
  }, 1000);
}

// ---------------------------------------------------------------------------
// Programm-Uebersicht
// ---------------------------------------------------------------------------
function renderProgramm() {
  const active = activeDay();
  let html = '<h1>Programm</h1><p class="sub">28 Tage in vier Wochen. Tippe einen Tag fuer Details.</p><div class="daylist">';
  let lastWeek = 0;
  window.PROGRAM.forEach((day) => {
    if (day.woche !== lastWeek) {
      html += `<div class="week-head">${day.wochenName}</div>`;
      lastWeek = day.woche;
    }
    const done = state.days[day.nummer] && state.days[day.nummer].done;
    const isToday = day.nummer === active;
    html += `
      <div class="day-row ${done ? 'done' : ''} ${isToday ? 'today' : ''}" data-day="${day.nummer}">
        <div class="dot">${done ? '&#10003;' : day.nummer}</div>
        <div class="info">
          <div class="t">Tag ${day.nummer}${isToday ? ' · heute' : ''}</div>
          <div class="s">${day.minuten} Min · ${day.blocks.length} Uebungen</div>
        </div>
        <div class="chev">&#8250;</div>
      </div>`;
  });
  html += '</div>';
  view().innerHTML = html;
  view().querySelectorAll('.day-row').forEach((row) => {
    row.addEventListener('click', () => startSession(parseInt(row.dataset.day, 10)));
  });
}

// ---------------------------------------------------------------------------
// Fortschritt
// ---------------------------------------------------------------------------
function renderFortschritt() {
  const done = completedCount();
  const pct = Math.round((done / 28) * 100);
  const log = [...state.weightLog].reverse();
  let weightChange = '';
  if (state.weightLog.length >= 2) {
    const first = state.weightLog[0].kg;
    const last = state.weightLog[state.weightLog.length - 1].kg;
    const diff = (last - first).toFixed(1);
    weightChange = `${diff > 0 ? '+' : ''}${diff} kg seit Start`;
  }

  view().innerHTML = `
    <h1>Fortschritt</h1>
    <p class="sub">${pct}% des Monats geschafft.</p>
    <div class="stats">
      ${statCard(done + '/28', 'Einheiten')}
      ${statCard(totalMinutes(), 'Minuten gesamt')}
      ${statCard(estKcal(), 'kcal (geschaetzt)')}
      ${statCard(streak(), 'Tage-Serie')}
    </div>

    <h2>Gewicht</h2>
    <div class="card">
      <label class="field">Heutiges Gewicht in kg
        <input id="w-input" type="number" inputmode="decimal" placeholder="z. B. 87.5" />
      </label>
      <button class="btn small" id="w-save">Eintragen</button>
      ${weightChange ? `<p class="sub" style="margin-top:12px">${weightChange}</p>` : ''}
      <div style="margin-top:10px">
        ${log.length ? log.map((e) => `<div class="weight-row"><span>${e.dateISO}</span><span><b>${e.kg} kg</b></span></div>`).join('')
          : '<p class="sub" style="margin:0">Noch kein Eintrag.</p>'}
      </div>
    </div>
    <p class="note">Abnehmen passiert vor allem ueber Ernaehrung und Alltag. Stuhl Tai-Chi
      hilft mit Bewegung, Stressabbau und Routine – die Kalorienangabe ist eine grobe Schaetzung.</p>
  `;

  $('#w-save').addEventListener('click', () => {
    const w = parseFloat($('#w-input').value.replace(',', '.'));
    if (!isFinite(w) || w <= 0) return;
    // Pro Tag nur ein Eintrag (ueberschreiben).
    const t = todayISO();
    state.weightLog = state.weightLog.filter((e) => e.dateISO !== t);
    state.weightLog.push({ dateISO: t, kg: w });
    state.weightLog.sort((a, b) => a.dateISO.localeCompare(b.dateISO));
    state.profile.weightKg = w;
    saveState();
    renderFortschritt();
  });
}

// ---------------------------------------------------------------------------
// Partner
// ---------------------------------------------------------------------------
function renderPartner() {
  const partner = getPartner();
  const n = activeDay();
  view().innerHTML = `
    <h1>Dein Trainingspartner</h1>
    <p class="sub">Begleitet dich durch den ganzen Monat.</p>
    <div class="partner-chat">
      <div class="pe">${partner.emoji}</div>
      <div class="bubble"><span class="who">${partner.name}</span>${
        window.partnerMessage(partner.id, { tag: n, streak: streak(), done: false, totalDone: completedCount() })
      }</div>
    </div>

    <h2>Partner wechseln</h2>
    <div class="partner-pick" id="pl">
      ${window.PARTNERS.map((p) => `
        <div class="partner-opt ${p.id === partner.id ? 'selected' : ''}" data-id="${p.id}">
          <div class="pe">${p.emoji}</div>
          <div>
            <div class="pn">${p.name}</div>
            <div class="ps">${p.stil}</div>
          </div>
        </div>`).join('')}
    </div>
    <p class="note">${state.profile.name ? 'Eingeloggt als ' + state.profile.name + '. ' : ''}Dein Partner bleibt den
      ganzen Monat an deiner Seite und meldet sich jeden Tag aufs Neue.</p>
  `;
  view().querySelectorAll('.partner-opt').forEach((el) => {
    el.addEventListener('click', () => {
      state.profile.partner = el.dataset.id;
      saveState();
      renderPartner();
    });
  });
}

// ---------------------------------------------------------------------------
// Tab-Navigation & Start
// ---------------------------------------------------------------------------
document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    clearInterval(sessionTimer);
    currentView = tab.dataset.view;
    render();
  });
});

(async function init() {
  await loadState();
  render();
  // Service Worker fuer Offline-Nutzung & Installierbarkeit.
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
