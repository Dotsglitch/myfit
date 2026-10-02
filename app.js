'use strict';

/* ---------- small helpers ---------- */
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const ORDER = [1, 2, 3, 4, 5, 6, 0]; // week shown Monday first
const KEY = 'myfit-data-v1';
const WATER_GOAL = 4;
const CARDIO_TYPES = ['Incline walk', 'Bike', 'Rower', 'Other'];
const PRESETS = [30, 45, 60, 90, 120, 180];

const $ = s => document.querySelector(s);
const h = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Math.random().toString(36).slice(2, 9);
const ymd = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const today = () => ymd(new Date());
const parseYmd = s => { const [a, b, c] = s.split('-').map(Number); return new Date(a, b - 1, c); };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const num = v => { const n = parseFloat(String(v).replace(',', '.')); return isNaN(n) ? 0 : n; };
const shortDate = d => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
const kg = n => (Math.round(n * 100) / 100) + ' kg';
const fmtRest = s => s >= 120 ? (Math.round(s / 30) / 2) + ' min' : s + ' sec';
const fmtClock = s => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
const fmtTime = t => { const [hh, mm] = t.split(':').map(Number); return ((hh + 11) % 12 + 1) + ':' + String(mm).padStart(2, '0') + (hh < 12 ? ' AM' : ' PM'); };
const parseReps = str => { const m = /(\d+)(?:\s*[-–]\s*(\d+))?/.exec(str || ''); return m ? { low: +m[1], high: +(m[2] || m[1]) } : { low: 0, high: 0 }; };

const ICON = {
  today: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></svg>',
  workout: '<svg viewBox="0 0 24 24"><path d="M3 9v6M6 6v12M18 6v12M21 9v6M6 12h12"/></svg>',
  food: '<svg viewBox="0 0 24 24"><path d="M6 3v7a2 2 0 0 0 4 0V3M8 3v18M17 3c-2 2-3 5-3 8h3v10"/></svg>',
  groceries: '<svg viewBox="0 0 24 24"><path d="M3 4h2l2.5 11h10L20 7H6.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/></svg>',
  progress: '<svg viewBox="0 0 24 24"><path d="M4 20V4M4 20h16M8 15l4-5 3 3 5-7"/></svg>',
  gear: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></svg>',
  bottle: '<svg viewBox="0 0 40 80"><path class="b-fill" d="M9 30h22v40a5 5 0 0 1-5 5H14a5 5 0 0 1-5-5z"/><path class="b-line" d="M15 4h10v9c0 5 6 7 6 15v42a5 5 0 0 1-5 5H14a5 5 0 0 1-5-5V28c0-8 6-10 6-15z"/></svg>'
};
const TABS = [['today', 'Today'], ['workout', 'Workout'], ['food', 'Food & Water'], ['groceries', 'Groceries'], ['progress', 'Progress']];

/* ---------- data: everything is saved on this phone ---------- */
let S = load();
function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && s.program) { if (!s.settings.plan) s.settings.plan = defaultPlan(); return s; }
  } catch (e) { }
  return defaultState();
}
let saveFailed = false;
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); saveFailed = false; }
  catch (e) { if (!saveFailed) { saveFailed = true; alert('Could not save your data on this device. Please make a backup from Settings.'); } }
}

const ui = { tab: 'today', day: new Date().getDay(), edit: false, foodDate: today(), week: 0, date: today() };

function food(date) {
  return S.food[date] || (S.food[date] = { pre: { done: false, note: '' }, snack: { done: false }, water: 0 });
}
function getLog(day) {
  const k = today() + '_' + day;
  return S.logs[k] || (S.logs[k] = { date: today(), day, warm: {}, main: {}, cool: {}, cardio: { type: '', min: '', dist: '' }, finished: false });
}
function exLog(log, ex) {
  const e = log.main[ex.id] || (log.main[ex.id] = { name: ex.name, sets: [], feel: '', done: false });
  while (e.sets.length < ex.sets) e.sets.push({ w: '', r: '', done: false });
  return e;
}
function coreLog(log, x) {
  const c = log.cool[x.id] || (log.cool[x.id] = { sets: [], easy: false, done: false });
  if (x.core) while (c.sets.length < (x.sets || 3)) c.sets.push(false);
  return c;
}
// Earlier sessions of one exercise, newest first.
function history(sec, id) {
  const t = today();
  return Object.keys(S.logs).filter(k => k.slice(0, 10) < t && S.logs[k][sec] && S.logs[k][sec][id])
    .sort().reverse().map(k => Object.assign({ date: k.slice(0, 10) }, S.logs[k][sec][id]))
    .filter(e => sec === 'main' ? e.sets.some(s => s.done) : (e.sets || []).some(Boolean));
}
const topWeight = e => Math.max(0, ...e.sets.filter(s => s.done).map(s => num(s.w)));
const isGymDay = d => !S.program[d].rest;

/* ---------- progression helper ---------- */
function suggestion(ex, isMain, hist) {
  if (!hist.length) return '';
  const t = parseReps(ex.reps);
  const full = (e, target) => { const d = e.sets.filter(s => s.done); return d.length >= ex.sets && d.every(s => num(s.r) >= target); };
  const last = hist[0], w = topWeight(last);
  if (isMain) {
    if (full(last, t.low)) {
      if (last.feel === 'hard') return 'All reps done but it felt too hard. Stay at ' + kg(w) + ' today.';
      return w ? 'You hit every set last time. Try ' + kg(w + (ex.inc || 2.5)) + ' today (+' + (ex.inc || 2.5) + ' kg).' : 'You hit every set last time. Add a little weight today.';
    }
    if (hist[1] && !full(hist[1], t.low) && w) return 'Reps missed two sessions in a row. Drop to about ' + kg(Math.round(w * 0.9 / 2.5) * 2.5) + ' (-10%) and build back up.';
    return 'Reps were missed last time. Stay at ' + (w ? kg(w) : 'the same weight') + ' and aim for every rep.';
  }
  if (full(last, t.high)) return 'Top of the rep range on all sets last time. Add ' + (ex.inc ? ex.inc + ' kg' : 'a little weight') + ' today.';
  return '';
}

/* ---------- rest timer ---------- */
const timer = { end: 0, total: 0, beeped: true };
let audio = null, wakeLock = null;
function unlockAudio() {
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === 'suspended') audio.resume();
  } catch (e) { }
}
function beep() {
  if (!audio) return;
  [0, 0.4, 0.8].forEach(t => {
    const o = audio.createOscillator(), g = audio.createGain(), s = audio.currentTime + t;
    o.frequency.value = 880; o.connect(g); g.connect(audio.destination);
    g.gain.setValueAtTime(0.0001, s);
    g.gain.exponentialRampToValueAtTime(0.7, s + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, s + 0.3);
    o.start(s); o.stop(s + 0.32);
  });
}
function startTimer(sec) {
  unlockAudio();
  timer.total = sec; timer.end = Date.now() + sec * 1000; timer.beeped = false;
  // keep the screen awake while resting, where the phone supports it
  if (navigator.wakeLock) navigator.wakeLock.request('screen').then(l => wakeLock = l).catch(() => { });
  renderTimer();
}
function stopTimer() {
  timer.end = 0; timer.beeped = true;
  if (wakeLock) { wakeLock.release().catch(() => { }); wakeLock = null; }
  renderTimer();
}
function renderTimer() {
  const el = $('#timer'), running = timer.end > 0;
  const show = running || (ui.tab === 'workout' && isGymDay(ui.day));
  el.hidden = !show;
  document.body.classList.toggle('has-timer', show);
  if (!show) return;
  const presets = PRESETS.map(p => `<button class="chip" data-act="timer" data-s="${p}">${p < 120 ? p + 's' : p / 60 + ' min'}</button>`).join('');
  el.innerHTML = running
    ? `<div class="t-run"><div><div class="sub">Rest</div><div class="t-clock" id="tclock"></div></div>
       <div class="t-btns"><button class="btn ghost" data-act="timer-add">+30s</button><button class="btn" data-act="timer-stop">Stop</button></div></div>
       <div class="t-bar"><div id="tbar"></div></div><div class="chips scroll">${presets}</div>`
    : `<div class="chips scroll"><span class="sub t-label">Rest timer</span>${presets}</div>`;
  tick();
}
function tick() {
  if (timer.end) {
    const left = Math.ceil((timer.end - Date.now()) / 1000);
    if (left <= 0) {
      if (!timer.beeped) { timer.beeped = true; if (left > -5) beep(); }
      const c = $('#tclock'); if (c) { c.textContent = 'Go!'; c.classList.add('go'); }
      const b = $('#tbar'); if (b) b.style.width = '100%';
      if (left < -8) stopTimer();
    } else {
      const c = $('#tclock'); if (c) c.textContent = fmtClock(left);
      const b = $('#tbar'); if (b) b.style.width = (100 - left / timer.total * 100) + '%';
    }
  }
  const cd = $('#cd'); if (cd) cd.innerHTML = countdownText();
  if (today() !== ui.date) { ui.date = today(); ui.day = new Date().getDay(); ui.foodDate = ui.date; render(); }
}

/* ---------- morning routine ---------- */
function stepDone(date, id) { return id === 'pre' ? food(date).pre.done : !!(S.routine[date] && S.routine[date][id]); }
function nextStep() {
  const now = new Date(), steps = S.settings.routine.slice().sort((a, b) => a.time.localeCompare(b.time));
  for (let off = 0; off < 8; off++) {
    const d = addDays(now, off);
    if (!isGymDay(d.getDay())) continue;
    for (const st of steps) {
      const [hh, mm] = st.time.split(':').map(Number);
      const at = new Date(d.getFullYear(), d.getMonth(), d.getDate(), hh, mm);
      if (at > now && !(off === 0 && stepDone(ymd(d), st.id))) return { st, at, off };
    }
  }
  return null;
}
function countdownText() {
  const n = nextStep();
  if (!n) return 'No gym days set';
  let s = Math.max(0, Math.round((n.at - Date.now()) / 1000));
  const d = Math.floor(s / 86400), hh = Math.floor(s % 86400 / 3600), mm = Math.floor(s % 3600 / 60), ss = s % 60;
  const left = d ? d + 'd ' + hh + 'h ' + mm + 'm' : hh + ':' + String(mm).padStart(2, '0') + ':' + String(ss).padStart(2, '0');
  const when = n.off === 0 ? '' : (n.off === 1 ? 'Tomorrow' : DAYS[n.at.getDay()]) + ' · ';
  return `<span class="sub">Next: ${when}${fmtTime(n.st.time)} ${h(n.st.label)}</span><span class="cd-num">${left}</span>`;
}

/* ---------- demo pictures + muscles ---------- */
// What the user typed in the editor wins; otherwise fall back to the built-in library entry.
function info(x) {
  const lib = LIB[x.id] || {};
  return { img: x.img !== undefined ? x.img : lib.img || '', m: x.m !== undefined ? x.m : lib.m || '', m2: x.m2 !== undefined ? x.m2 : lib.m2 || '', video: x.video || '' };
}
const frames = img => `<img src="img/${img}.jpg" alt="" loading="lazy">`; // one file holding both positions side by side
function thumb(sec, x) {
  const d = info(x);
  return `<button class="demo${d.img ? '' : ' none'}" data-act="demo" data-sec="${sec}" data-id="${x.id}" aria-label="How to do ${h(x.name)}">${d.img ? frames(d.img) : 'i'}</button>`;
}
function muscles(x) {
  const d = info(x);
  return d.m ? `<div class="muscles">${h(d.m)}${d.m2 ? `<span> + ${h(d.m2)}</span>` : ''}</div>` : '';
}
function openDemo(sec, x) {
  const d = info(x);
  const url = d.video || 'https://www.youtube.com/results?search_query=' + encodeURIComponent(x.name + ' exercise form');
  openModal(x.name,
    (d.img ? `<div class="demo big">${frames(d.img)}</div>` : '<p class="sub">No picture for this one yet.</p>') +
    (d.m ? `<div><div class="sub">Main muscles</div><b>${h(d.m)}</b></div>` : '') +
    (d.m2 ? `<div><div class="sub">Also works</div>${h(d.m2)}</div>` : '') +
    `<a class="btn ghost" href="${h(url)}" target="_blank" rel="noopener">${d.video ? 'Watch video' : 'Find a video'} (needs internet)</a>`);
}

/* ---------- shared bits ---------- */
const chk = (on, attrs, label) => `<button class="chk${on ? ' on' : ''}" ${attrs} aria-pressed="${!!on}" aria-label="${h(label || 'Done')}">✓</button>`;

function waterCard(date) {
  const f = food(date);
  let b = '';
  for (let i = 0; i < WATER_GOAL; i++) b += `<button class="bottle${i < f.water ? ' full' : ''}" data-act="water" data-date="${date}" data-i="${i}" aria-label="Bottle ${i + 1}">${ICON.bottle}</button>`;
  return `<section class="card"><div class="row between"><h2>Water</h2><span class="sub">${f.water} of ${WATER_GOAL} bottles · ${f.water * S.settings.bottleMl} ml</span></div>
    <div class="bottles">${b}</div>
    <div class="row between"><span class="sub">Bottle size: ${S.settings.bottleMl} ml</span><button class="link" data-act="bottle-size">Change size</button></div></section>`;
}

/* ---------- TODAY ---------- */
function viewToday() {
  const now = new Date(), t = today(), dow = now.getDay(), p = S.program[dow];
  const log = S.logs[t + '_' + dow];
  let out = `<header class="cover"><img src="img/hero.jpg" alt="">
    <div><div class="sub">${DAYS[dow]}</div><h1>${now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}</h1></div>
    <button class="iconbtn" data-act="settings" aria-label="Settings">${ICON.gear}</button></header>`;
  if (dow === 6) out += `<button class="banner" data-act="tab" data-tab="groceries"><b>Saturday: grocery shopping and meal prep</b><span>Tap to open your grocery list</span></button>`;

  out += p.rest
    ? `<section class="card"><div class="sub">Today</div><h2>Rest day</h2><p>${h(p.note || '')}</p></section>`
    : `<section class="card"><div class="sub">Today's workout</div><h2>${h(p.name)}</h2>
       <p class="sub">${p.main.length} exercises · main lift: ${h(p.main[0] ? p.main[0].name : 'none')}</p>
       <button class="btn big" data-act="tab" data-tab="workout">${log && log.finished ? '✓ Workout finished · view' : 'Open workout'}</button></section>`;

  out += `<section class="card"><h2>Morning routine</h2><div class="countdown" id="cd">${countdownText()}</div>`;
  if (!p.rest) {
    out += S.settings.routine.map(st => {
      const on = stepDone(t, st.id);
      return `<div class="line${on ? ' done' : ''}">${chk(on, `data-act="step" data-id="${st.id}"`, st.label)}<div><b>${fmtTime(st.time)}</b><div>${h(st.label)}</div>${st.id === 'pre' ? `<div class="muscles">${h(planFor('pre', dow).name)}</div>` : ''}</div></div>`;
    }).join('');
  } else out += `<p class="sub">No gym this morning. Your routine starts again on your next gym day.</p>`;
  out += `<button class="link" data-act="settings">Edit times</button></section>`;
  out += waterCard(t);
  return out;
}

/* ---------- WORKOUT ---------- */
function editRow(sec, id) {
  return ui.edit ? `<div class="editrow"><button class="mini" data-act="move" data-sec="${sec}" data-id="${id}" data-dir="-1" aria-label="Move up">↑</button>
    <button class="mini" data-act="move" data-sec="${sec}" data-id="${id}" data-dir="1" aria-label="Move down">↓</button>
    <button class="mini" data-act="edit-ex" data-sec="${sec}" data-id="${id}">Edit</button>
    <button class="mini danger" data-act="del-ex" data-sec="${sec}" data-id="${id}">Remove</button></div>` : '';
}
const addBtn = sec => ui.edit ? `<button class="btn ghost" data-act="add-ex" data-sec="${sec}">+ Add ${sec === 'warm' ? 'warm-up step' : sec === 'main' ? 'exercise' : 'cool-down item'}</button>` : '';

function mainCard(ex, i, log) {
  const e = exLog(log, ex), hist = history('main', ex.id), last = hist[0], tip = suggestion(ex, i === 0, hist);
  const rows = e.sets.map((s, j) => {
    const ph = j > 0 && e.sets[j - 1].w !== '' ? e.sets[j - 1].w : last ? (last.sets[j] || last.sets[last.sets.length - 1]).w : '';
    return `<div class="setrow${s.done ? ' done' : ''}"><span class="setn">Set ${j + 1}</span>
      <label><input inputmode="decimal" value="${h(s.w)}" placeholder="${h(ph || 'kg')}" data-in="set" data-k="w" data-id="${ex.id}" data-i="${j}" aria-label="Weight in kg"><span>kg</span></label>
      <label><input inputmode="numeric" value="${h(s.r)}" placeholder="${parseReps(ex.reps).low || 'reps'}" data-in="set" data-k="r" data-id="${ex.id}" data-i="${j}" aria-label="Reps"><span>reps</span></label>
      ${chk(s.done, `data-act="set" data-id="${ex.id}" data-i="${j}"`, 'Set ' + (j + 1) + ' done')}</div>`;
  }).join('');
  const feel = [['easy', 'Easy'], ['ok', 'On target'], ['hard', 'Too hard']].map(([v, l]) =>
    `<button class="chip${e.feel === v ? ' on' : ''}" data-act="feel" data-id="${ex.id}" data-v="${v}">${l}</button>`).join('');
  return `<section class="card ex${i === 0 ? ' mainlift' : ''}${e.done ? ' exdone' : ''}">
    ${i === 0 ? '<div class="badge">MAIN LIFT</div>' : ''}
    <div class="exhead">${chk(e.done, `data-act="exdone" data-id="${ex.id}"`, 'Exercise done')}
      <div class="grow"><h3>${h(ex.name)}${ex.tag ? ` <span class="tag ${ex.tag.toLowerCase()}">${h(ex.tag)}</span>` : ''}</h3>
      <div class="targets">${ex.sets} × ${h(ex.reps)} · RPE ${h(ex.rpe)} · Rest ${fmtRest(ex.rest)}</div>${muscles(ex)}</div>${thumb('main', ex)}</div>
    ${last ? `<div class="last">Last time (${shortDate(parseYmd(last.date))}): ${last.sets.filter(s => s.done).map(s => (num(s.w) ? num(s.w) + ' kg × ' : '') + (s.r || '?')).join(', ')}</div>` : '<div class="last">No previous session yet</div>'}
    ${tip ? `<div class="tip">${h(tip)}</div>` : ''}
    ${rows}
    <div class="row between wrap"><div class="chips"><span class="sub">Felt:</span>${feel}</div>
    <button class="link" data-act="add-set" data-id="${ex.id}">+ set</button></div>
    ${editRow('main', ex.id)}</section>`;
}

function coolItem(x, log) {
  const c = coreLog(log, x);
  if (!x.core) return `<div class="line${c.done ? ' done' : ''}">${chk(c.done, `data-act="tick" data-sec="cool" data-id="${x.id}"`, x.name)}<div class="grow"><b>${h(x.name)}</b><div class="sub">${h(x.detail)}</div>${muscles(x)}</div>${thumb('cool', x)}</div>${editRow('cool', x.id)}`;
  const hist = history('cool', x.id), last = hist[0];
  const tip = last && last.easy && last.sets.every(Boolean) ? 'All sets felt easy last time. Add 5-10 seconds or 2-3 reps today.' : '';
  return `<div class="core"><div class="row between"><div class="grow"><span class="tag core-tag">Core</span> <b>${h(x.name)}</b><div class="targets">${h(x.detail)}</div>${muscles(x)}</div>${thumb('cool', x)}</div>
    ${last ? `<div class="last">Last time (${shortDate(parseYmd(last.date))}): ${last.sets.filter(Boolean).length} of ${last.sets.length} sets${last.easy ? ', felt easy' : ''}</div>` : ''}
    ${tip ? `<div class="tip">${tip}</div>` : ''}
    <div class="row wrap coresets">${c.sets.map((d, j) => `<div class="cset"><span class="sub">Set ${j + 1}</span>${chk(d, `data-act="coreset" data-id="${x.id}" data-i="${j}"`, 'Set ' + (j + 1))}</div>`).join('')}
    <button class="chip${c.easy ? ' on' : ''}" data-act="easy" data-id="${x.id}">All sets felt easy</button></div>${editRow('cool', x.id)}</div>`;
}

function viewWorkout() {
  const d = ui.day, p = S.program[d], tdow = new Date().getDay();
  let out = `<header class="top"><div><div class="sub">${DAYS[d]}${d === tdow ? ' · today' : ''}</div><h1>${h(p.rest ? 'Rest day' : p.name)}</h1></div>
    ${p.rest ? '' : `<button class="btn ghost small" data-act="toggle-edit">${ui.edit ? 'Done editing' : 'Edit'}</button>`}</header>
    <div class="chips days">${ORDER.map(x => `<button class="chip${x === d ? ' on' : ''}${x === tdow ? ' is-today' : ''}" data-act="day" data-d="${x}">${DAYS[x].slice(0, 3)}</button>`).join('')}</div>`;
  if (p.rest) return out + `<section class="card"><h2>Rest</h2><p>${h(p.note || '')}</p>${d === 6 ? '<button class="btn big" data-act="tab" data-tab="groceries">Open grocery list</button>' : ''}</section>`;
  if (d !== tdow) out += `<p class="note">This is ${DAYS[d]}'s workout. Anything you log now is saved under today's date.</p>`;
  const log = getLog(d);

  out += `<h2 class="sec">1. Warm-up <span class="sub">${h(p.warmNote || '')}</span></h2><section class="card">` +
    p.warm.map(x => `<div class="line${log.warm[x.id] ? ' done' : ''}">${chk(log.warm[x.id], `data-act="tick" data-sec="warm" data-id="${x.id}"`, x.name)}<div class="grow"><b>${h(x.name)}</b><div class="sub">${h(x.detail)}</div>${muscles(x)}</div>${thumb('warm', x)}</div>${editRow('warm', x.id)}`).join('') +
    addBtn('warm') + `</section>`;

  out += `<h2 class="sec">2. Main exercises</h2>` + p.main.map((ex, i) => mainCard(ex, i, log)).join('') + addBtn('main');

  if (p.cardio) {
    const c = log.cardio;
    out += `<h2 class="sec">Cardio <span class="sub">${h(p.cardioNote || '')}</span></h2><section class="card">
      <div class="chips">${CARDIO_TYPES.map(t => `<button class="chip${c.type === t ? ' on' : ''}" data-act="cardio-type" data-v="${t}">${t}</button>`).join('')}</div>
      <div class="row gap"><label class="field"><span>Minutes</span><input inputmode="decimal" value="${h(c.min)}" data-in="cardio" data-k="min"></label>
      <label class="field"><span>Distance (km)</span><input inputmode="decimal" value="${h(c.dist)}" data-in="cardio" data-k="dist"></label></div></section>`;
  }
  if (ui.edit) out += `<button class="btn ghost" data-act="toggle-cardio">${p.cardio ? 'Remove cardio section from this day' : '+ Add a cardio section to this day'}</button>`;

  out += `<h2 class="sec">3. Cool-down: core + stretching <span class="sub">${h(p.coolNote || '')}</span></h2><section class="card">` +
    p.cool.map(x => coolItem(x, log)).join('') + addBtn('cool') + `</section>`;

  out += `<button class="btn big${log.finished ? ' ok' : ''}" data-act="finish">${log.finished ? '✓ Workout finished (tap to undo)' : 'Finish workout'}</button>`;
  return out;
}

/* ---------- FOOD & WATER ---------- */
// The weekly plan says what the pre-meal and snack are each day, and which groceries they need.
function planFor(kind, dow) {
  const e = S.settings.plan[kind][dow];
  return e || (S.settings.plan[kind][dow] = kind === 'pre' ? { name: 'Small coffee', buy: 'Coffee' } : { name: '', buy: '' });
}
// Keeps the grocery list in step with the plan: adds what the plan needs, removes what it no longer needs.
function syncPlan() {
  const need = {};
  for (const kind of ['pre', 'snack']) for (const d of ORDER) {
    if (kind === 'pre' && !isGymDay(d)) continue;
    (planFor(kind, d).buy || '').split(',').map(s => s.trim()).filter(Boolean).forEach(n => {
      const k = n.toLowerCase();
      (need[k] = need[k] || { name: n, days: 0 }).days++;
    });
  }
  const g = S.grocery;
  g.items = g.items.filter(i => !i.plan || need[i.plan]);
  for (const k in need) {
    let it = g.items.find(i => i.plan === k) || g.items.find(i => i.name.toLowerCase() === k);
    if (!it) g.items.push(it = { id: uid(), name: need[k].name, done: false });
    it.plan = k; it.days = need[k].days;
  }
}

function viewFood() {
  const date = ui.foodDate, f = food(date), d = parseYmd(date), dow = d.getDay(), isToday = date === today(), gym = isGymDay(dow);
  const planRow = (kind, x) => {
    const e = planFor(kind, x);
    return `<button class="planrow${x === dow ? ' now' : ''}" data-act="plan-edit" data-kind="${kind}" data-d="${x}"><span class="sub">${DAYS[x].slice(0, 3)}</span><span class="grow">${h(e.name || 'Nothing planned')}</span><span class="link">Change</span></button>`;
  };
  return `<header class="top"><div><div class="sub">${isToday ? 'Today' : DAYS[dow]}</div><h1>${shortDate(d)}</h1></div>
    <div class="row gap"><button class="iconbtn" data-act="food-day" data-dir="-1" aria-label="Previous day">‹</button>
    <button class="iconbtn" data-act="food-day" data-dir="1" aria-label="Next day" ${isToday ? 'disabled' : ''}>›</button></div></header>
    <section class="card"><div class="sub">Pre-meal · ${fmtTime(S.settings.routine[0].time)}</div>
    ${gym ? `<div class="line${f.pre.done ? ' done' : ''}">${chk(f.pre.done, `data-act="pre" data-date="${date}"`, 'Pre-meal')}<h2 class="grow">${h(planFor('pre', dow).name)}</h2></div>`
      : '<p class="sub">Rest day, no pre-meal needed.</p>'}</section>
    <section class="card"><div class="sub">Snack · 2 PM</div>
    <div class="line${f.snack.done ? ' done' : ''}">${chk(f.snack.done, 'data-act="snack"', 'Snack')}<h2 class="grow">${h(planFor('snack', dow).name || 'Nothing planned')}</h2></div></section>
    ${waterCard(date)}
    <h2 class="sec">My weekly plan <span class="sub">tap a day to change it</span></h2>
    <section class="card"><h3>Pre-meals</h3>${ORDER.filter(isGymDay).map(x => planRow('pre', x)).join('')}</section>
    <section class="card"><h3>Snacks</h3>${ORDER.map(x => planRow('snack', x)).join('')}</section>
    <p class="note">What the plan needs is added to your grocery list automatically.</p>`;
}

/* ---------- GROCERIES ---------- */
function viewGroceries() {
  const g = S.grocery, left = g.items.filter(i => !i.done).length;
  const row = i => `<div class="line${i.done ? ' done' : ''}">${chk(i.done, `data-act="gtick" data-id="${i.id}"`, i.name)}<div class="grow"><div class="strike">${h(i.name)}</div>${i.plan ? `<div class="sub">Meal plan · ${i.days} day${i.days > 1 ? 's' : ''} this week</div>` : ''}</div>${i.plan ? '' : `<button class="mini danger" data-act="gdel" data-id="${i.id}" aria-label="Remove ${h(i.name)}">✕</button>`}</div>`;
  const plan = g.items.filter(i => i.plan), mine = g.items.filter(i => !i.plan);
  return `<header class="top"><div><div class="sub">Saturday shop + meal prep</div><h1>Groceries</h1></div><span class="sub">${left} left of ${g.items.length}</span></header>
    ${new Date().getDay() === 6 ? '<div class="banner"><b>It\'s Saturday</b><span>Time to shop and prep for next week.</span></div>' : ''}
    ${plan.length ? `<section class="card"><h2>For my pre-meals and snacks</h2>${plan.map(row).join('')}</section>` : ''}
    <section class="card"><h2>My other items</h2><form class="row gap" data-form="grocery"><input class="text" id="gitem" placeholder="Add an item" autocomplete="off" enterkeyhint="done"><button class="btn" type="submit">Add</button></form>
    ${mine.map(row).join('')}
    ${!mine.length && g.last.length ? `<button class="btn ghost" data-act="glast">Reuse last week's items (${g.last.length})</button>` : ''}</section>
    <button class="btn big" data-act="gnew">New week: untick everything</button>
    ${mine.length ? '<button class="btn ghost" data-act="gclear">Clear my other items</button>' : ''}`;
}

/* ---------- PROGRESS ---------- */
function liftChart(ex) {
  const pts = Object.keys(S.logs).sort().map(k => ({ date: k.slice(0, 10), e: S.logs[k].main && S.logs[k].main[ex.id] }))
    .filter(p => p.e && topWeight(p.e) > 0).map(p => ({ date: p.date, v: topWeight(p.e) }));
  if (!pts.length) return `<section class="card"><h3>${h(ex.name)}</h3><p class="sub">No sessions logged yet. Your chart will appear after your first workout.</p></section>`;
  const W = 320, H = 150, L = 36, R = 16, T = 16, B = 26;
  let lo = Math.min(...pts.map(p => p.v)), hi = Math.max(...pts.map(p => p.v));
  if (lo === hi) { lo -= 5; hi += 5; }
  const x = i => pts.length === 1 ? (L + W - R) / 2 : L + i * (W - L - R) / (pts.length - 1);
  const y = v => T + (hi - v) * (H - T - B) / (hi - lo);
  const first = pts[0], last = pts[pts.length - 1], diff = last.v - first.v;
  return `<section class="card"><div class="row between"><h3>${h(ex.name)}</h3><span class="sub">top set weight</span></div>
    <div class="hero">${kg(last.v)} <span class="sub">${pts.length > 1 ? (diff >= 0 ? '+' : '') + kg(diff) + ' since ' + shortDate(parseYmd(first.date)) : 'first session'}</span></div>
    <svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${h(ex.name)} weight history">
      ${[hi, (hi + lo) / 2, lo].map(v => `<line class="grid" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/><text class="axis" x="${L - 6}" y="${y(v) + 4}" text-anchor="end">${Math.round(v * 10) / 10}</text>`).join('')}
      <text class="axis" x="${L}" y="${H - 6}">${shortDate(parseYmd(first.date))}</text>
      ${pts.length > 1 ? `<text class="axis" x="${W - R}" y="${H - 6}" text-anchor="end">${shortDate(parseYmd(last.date))}</text>` : ''}
      <polyline class="series" points="${pts.map((p, i) => x(i) + ',' + y(p.v)).join(' ')}"/>
      ${pts.map((p, i) => `<circle class="dot" cx="${x(i)}" cy="${y(p.v)}" r="4.5"/><circle class="hit" cx="${x(i)}" cy="${y(p.v)}" r="16" data-act="point" data-t="${shortDate(parseYmd(p.date))}: ${kg(p.v)}"/>`).join('')}
    </svg><div class="sub pointinfo">Tap a dot to see that session.</div></section>`;
}

function viewProgress() {
  const now = new Date(), mon = addDays(now, -((now.getDay() + 6) % 7) + ui.week * 7);
  const dates = ORDER.map((d, i) => ymd(addDays(mon, i)));
  const doneDays = {};
  for (const k in S.logs) if (dates.includes(k.slice(0, 10)) && S.logs[k].finished) doneDays[S.logs[k].day] = true;
  const gym = ORDER.filter(isGymDay), nDone = gym.filter(d => doneDays[d]).length;
  const water = dates.map(dt => (S.food[dt] ? S.food[dt].water : 0) >= WATER_GOAL), nWater = water.filter(Boolean).length;
  const mark = on => `<span class="mark${on ? ' on' : ''}">${on ? '✓' : ''}</span>`;
  return `<header class="top"><div><div class="sub">${ui.week === 0 ? 'This week' : 'Week of'}</div><h1>${shortDate(mon)} – ${shortDate(addDays(mon, 6))}</h1></div>
    <div class="row gap"><button class="iconbtn" data-act="week" data-dir="-1" aria-label="Previous week">‹</button>
    <button class="iconbtn" data-act="week" data-dir="1" aria-label="Next week" ${ui.week >= 0 ? 'disabled' : ''}>›</button></div></header>
    <section class="card"><div class="row between"><h2>Workouts</h2><span class="hero small">${nDone}<span class="sub"> of ${gym.length}</span></span></div>
    ${gym.map(d => `<div class="line">${mark(doneDays[d])}<div><b>${DAYS[d]}</b><div class="sub">${h(S.program[d].name)}</div></div></div>`).join('')}</section>
    <section class="card"><div class="row between"><h2>Water goal</h2><span class="hero small">${nWater}<span class="sub"> of 7 days</span></span></div>
    <div class="weekdots">${ORDER.map((d, i) => `<div>${mark(water[i])}<span class="sub">${DAYS[d].slice(0, 3)}</span></div>`).join('')}</div></section>
    <h2 class="sec">Main lifts</h2>${gym.filter(d => S.program[d].main[0]).map(d => liftChart(S.program[d].main[0])).join('')}`;
}

/* ---------- render ---------- */
const VIEWS = { today: viewToday, workout: viewWorkout, food: viewFood, groceries: viewGroceries, progress: viewProgress };
function render() {
  $('#view').innerHTML = VIEWS[ui.tab]();
  $('#tabs').innerHTML = TABS.map(([k, l]) => `<button class="tab${ui.tab === k ? ' on' : ''}" data-act="tab" data-tab="${k}">${ICON[k]}<span>${l}</span></button>`).join('');
  renderTimer();
}

/* ---------- pop-up windows ---------- */
let modalSave = null;
function openModal(title, body, onSave, saveLabel) {
  modalSave = onSave;
  const m = $('#modal');
  m.innerHTML = `<form class="sheet" data-form="modal"><h2>${h(title)}</h2>${body}
    <div class="row gap">${onSave ? `<button class="btn ghost grow" type="button" data-act="close">Cancel</button><button class="btn grow" type="submit">${saveLabel || 'Save'}</button>`
      : '<button class="btn grow" type="button" data-act="close">Close</button>'}</div></form>`;
  m.hidden = false;
}
function closeModal() { $('#modal').hidden = true; $('#modal').innerHTML = ''; modalSave = null; }
const field = (name, label, value, attrs) => `<label class="field"><span>${label}</span><input name="${name}" value="${h(value)}" ${attrs || ''}></label>`;

function exForm(sec, x) {
  x = x || {};
  const d = info(x), pics = [...new Set(Object.values(LIB).map(l => l.img).filter(Boolean))].sort();
  const extra = field('m', 'Main muscles', d.m) + field('m2', 'Also works (optional)', d.m2) +
    `<label class="field"><span>Picture</span><select name="img"><option value="">None</option>${pics.map(p => `<option value="${p}"${p === d.img ? ' selected' : ''}>${p.replace(/_/g, ' ')}</option>`).join('')}</select></label>` +
    field('video', 'Video link (optional)', d.video, 'inputmode="url" placeholder="https://..."');
  if (sec === 'warm') return field('name', 'Name', x.name, 'required') + field('detail', 'Details (e.g. x 10/side)', x.detail) + extra;
  if (sec === 'cool') return field('name', 'Name', x.name, 'required') + field('detail', 'Details (e.g. 3 x 45 sec)', x.detail) +
    `<label class="check"><input type="checkbox" name="core" ${x.core ? 'checked' : ''}> This is a core exercise (track each set)</label>` +
    field('sets', 'Number of sets (core only)', x.sets || 3, 'inputmode="numeric"') + extra;
  return field('name', 'Name', x.name, 'required') + extra +
    `<div class="row gap">${field('sets', 'Sets', x.sets || 3, 'inputmode="numeric"')}${field('reps', 'Reps (e.g. 8-10)', x.reps || '10')}</div>
     <div class="row gap">${field('rpe', 'RPE', x.rpe || '7')}${field('rest', 'Rest (seconds)', x.rest || 90, 'inputmode="numeric"')}</div>
     <div class="row gap">${field('inc', 'Weight step (kg)', x.inc || '', 'inputmode="decimal" placeholder="optional"')}
     <label class="field"><span>Label</span><select name="tag">${['', 'Push', 'Pull'].map(t => `<option${(x.tag || '') === t ? ' selected' : ''} value="${t}">${t || 'None'}</option>`).join('')}</select></label></div>
     <p class="sub">The first exercise in the list is treated as the main lift.</p>`;
}
function readEx(sec, fd) {
  const video = fd.get('video').trim();
  const o = { name: fd.get('name').trim(), m: fd.get('m').trim(), m2: fd.get('m2').trim(), img: fd.get('img'), video: /^https?:\/\//i.test(video) ? video : '' };
  if (sec === 'main') Object.assign(o, { sets: Math.max(1, Math.round(num(fd.get('sets'))) || 3), reps: fd.get('reps').trim() || '10', rpe: fd.get('rpe').trim() || '7', rest: Math.max(5, Math.round(num(fd.get('rest'))) || 90), inc: num(fd.get('inc')), tag: fd.get('tag') });
  else { o.detail = fd.get('detail').trim(); if (sec === 'cool') { o.core = !!fd.get('core'); o.sets = Math.max(1, Math.round(num(fd.get('sets'))) || 3); } }
  return o;
}

function openSettings() {
  const r = S.settings.routine;
  openModal('Settings', `<h3>Morning routine</h3>` +
    r.map((st, i) => `<div class="row gap"><label class="field time"><span>Time</span><input type="time" name="t${i}" value="${st.time}" required></label>${field('l' + i, 'Step', st.label, 'required')}</div>`).join('') +
    `<h3>Water</h3>${field('ml', 'Bottle size (ml)', S.settings.bottleMl, 'inputmode="numeric"')}
     <h3>My data</h3><p class="sub">Everything is stored only on this phone. Make a backup now and then so you never lose it.</p>
     <button class="btn ghost" type="button" data-act="backup">Back up my data</button>
     <button class="btn ghost" type="button" data-act="restore">Restore from a backup file</button>
     <input type="file" id="restorefile" accept=".json,application/json" hidden>
     <h3>Photo credits</h3><p class="sub">Exercise photos: Free Exercise DB (public domain). Bird Dog photo by PTPioneer (www.ptpioneer.com), CC BY 2.0. Downward Dog photo by Iveto, CC BY 3.0. Cobra photo by Kennguru, CC BY 3.0. Via Wikimedia Commons, resized.</p>`,
    fd => {
      r.forEach((st, i) => { st.time = fd.get('t' + i) || st.time; st.label = fd.get('l' + i).trim() || st.label; });
      S.settings.bottleMl = Math.max(50, Math.round(num(fd.get('ml'))) || 750);
    });
}

async function backup() {
  const name = 'yuchi-fit-backup-' + today() + '.json';
  const file = new File([JSON.stringify(S, null, 1)], name, { type: 'application/json' });
  const isPhone = /iPhone|iPad|Android/.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Mac/.test(navigator.userAgent));
  if (isPhone && navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file] }); return; }
    catch (e) { if (e.name === 'AbortError') return; }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(file); a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 10000);
}
function restore(file) {
  const rd = new FileReader();
  rd.onload = () => {
    try {
      const s = JSON.parse(rd.result);
      if (!s || !s.program || !s.settings || !s.logs) throw 0;
      if (!confirm('Replace everything in the app with this backup?')) return;
      S = Object.assign(defaultState(), s); save(); closeModal(); render();
      alert('Backup restored.');
    } catch (e) { alert('That file is not a Yuchi Fit backup.'); }
  };
  rd.readAsText(file);
}

/* ---------- taps ---------- */
document.addEventListener('click', ev => {
  const el = ev.target.closest('[data-act]');
  if (!el) { if (ev.target.id === 'modal') closeModal(); return; }
  const a = el.dataset.act, id = el.dataset.id, i = +el.dataset.i, p = S.program[ui.day];
  let redraw = true;
  switch (a) {
    case 'tab': ui.tab = el.dataset.tab; ui.edit = false; if (ui.tab === 'workout') ui.day = new Date().getDay(); window.scrollTo(0, 0); break;
    case 'day': ui.day = +el.dataset.d; ui.edit = false; break;
    case 'settings': openSettings(); redraw = false; break;
    case 'close': closeModal(); redraw = false; break;
    case 'demo': openDemo(el.dataset.sec, p[el.dataset.sec].find(x => x.id === id)); redraw = false; break;
    case 'backup': backup(); redraw = false; break;
    case 'restore': $('#restorefile').click(); redraw = false; break;
    case 'step': {
      const t = today();
      if (id === 'pre') food(t).pre.done = !food(t).pre.done;
      else { const r = S.routine[t] || (S.routine[t] = {}); r[id] = !r[id]; }
      break;
    }
    case 'pre': { const f = food(el.dataset.date); f.pre.done = !f.pre.done; break; }
    case 'water': { const f = food(el.dataset.date); f.water = i < f.water ? i : i + 1; break; }
    case 'bottle-size':
      openModal('Bottle size', field('ml', 'Size of one bottle (ml)', S.settings.bottleMl, 'inputmode="numeric" required'),
        fd => { S.settings.bottleMl = Math.max(50, Math.round(num(fd.get('ml'))) || 750); });
      redraw = false; break;

    // workout logging
    case 'tick': { const log = getLog(ui.day); if (el.dataset.sec === 'warm') log.warm[id] = !log.warm[id]; else { const c = coreLog(log, p.cool.find(x => x.id === id)); c.done = !c.done; } break; }
    case 'set': {
      const ex = p.main.find(x => x.id === id), e = exLog(getLog(ui.day), ex), s = e.sets[i];
      if (!s.done) {
        // one tap logs the set: empty boxes are filled with the suggested weight and target reps
        const inputs = el.closest('.setrow').querySelectorAll('input');
        if (s.w === '' && /\d/.test(inputs[0].placeholder)) s.w = inputs[0].placeholder;
        if (s.r === '') s.r = String(parseReps(ex.reps).low || '');
        s.done = true; startTimer(ex.rest);
      } else s.done = false;
      e.done = e.sets.every(x => x.done);
      break;
    }
    case 'add-set': exLog(getLog(ui.day), p.main.find(x => x.id === id)).sets.push({ w: '', r: '', done: false }); break;
    case 'exdone': { const e = exLog(getLog(ui.day), p.main.find(x => x.id === id)); e.done = !e.done; break; }
    case 'feel': { const e = exLog(getLog(ui.day), p.main.find(x => x.id === id)); e.feel = e.feel === el.dataset.v ? '' : el.dataset.v; break; }
    case 'coreset': {
      const x = p.cool.find(x => x.id === id), c = coreLog(getLog(ui.day), x);
      c.sets[i] = !c.sets[i]; c.done = c.sets.every(Boolean);
      if (c.sets[i]) startTimer(30);
      break;
    }
    case 'easy': { const c = coreLog(getLog(ui.day), p.cool.find(x => x.id === id)); c.easy = !c.easy; break; }
    case 'cardio-type': { const c = getLog(ui.day).cardio; c.type = c.type === el.dataset.v ? '' : el.dataset.v; break; }
    case 'finish': { const log = getLog(ui.day); log.finished = !log.finished; if (log.finished) stopTimer(); break; }

    // editing the program
    case 'toggle-edit': ui.edit = !ui.edit; break;
    case 'toggle-cardio': p.cardio = !p.cardio; if (p.cardio && !p.cardioNote) p.cardioNote = '15-20 min'; break;
    case 'move': {
      const list = p[el.dataset.sec], from = list.findIndex(x => x.id === id), to = from + +el.dataset.dir;
      if (to >= 0 && to < list.length) list.splice(to, 0, list.splice(from, 1)[0]);
      break;
    }
    case 'del-ex': {
      const list = p[el.dataset.sec], x = list.find(x => x.id === id);
      if (confirm('Remove "' + x.name + '" from ' + DAYS[ui.day] + '? Your past logs are kept.')) list.splice(list.indexOf(x), 1);
      break;
    }
    case 'edit-ex': case 'add-ex': {
      const sec = el.dataset.sec, x = a === 'edit-ex' ? p[sec].find(x => x.id === id) : null;
      openModal(x ? 'Edit' : 'Add', exForm(sec, x), fd => { const o = readEx(sec, fd); if (x) Object.assign(x, o); else p[sec].push(Object.assign({ id: uid() }, o)); });
      redraw = false; break;
    }

    // rest timer
    case 'timer': startTimer(+el.dataset.s); redraw = false; break;
    case 'timer-add': timer.end += 30000; timer.total += 30; timer.beeped = false; tick(); redraw = false; break;
    case 'timer-stop': stopTimer(); redraw = false; break;

    // food
    case 'food-day': ui.foodDate = ymd(addDays(parseYmd(ui.foodDate), +el.dataset.dir)); break;
    case 'snack': { const s = food(ui.foodDate).snack; s.done = !s.done; break; }
    case 'plan-edit': {
      const kind = el.dataset.kind, e = planFor(kind, +el.dataset.d);
      openModal(DAYS[+el.dataset.d] + (kind === 'pre' ? ' pre-meal' : ' snack'),
        field('name', 'What I will have', e.name) + field('buy', 'What to buy for it (separate with commas)', e.buy) +
        '<p class="sub">The items to buy go on your grocery list automatically.</p>',
        fd => { e.name = fd.get('name').trim(); e.buy = fd.get('buy').trim(); syncPlan(); });
      redraw = false; break;
    }

    // groceries
    case 'gtick': { const it = S.grocery.items.find(x => x.id === id); it.done = !it.done; break; }
    case 'gdel': S.grocery.items = S.grocery.items.filter(x => x.id !== id); break;
    case 'gnew': S.grocery.items.forEach(x => x.done = false); break;
    case 'gclear': if (confirm('Clear your other items? They are kept as "last week\'s items" so you can bring them back.')) { S.grocery.last = S.grocery.items.filter(x => !x.plan).map(x => x.name); S.grocery.items = S.grocery.items.filter(x => x.plan); } break;
    case 'glast': S.grocery.last.forEach(name => { if (!S.grocery.items.some(x => x.name.toLowerCase() === name.toLowerCase())) S.grocery.items.push({ id: uid(), name, done: false }); }); break;

    // progress
    case 'week': ui.week = Math.min(0, ui.week + +el.dataset.dir); break;
    case 'point': el.closest('.card').querySelector('.pointinfo').textContent = el.dataset.t; redraw = false; break;
  }
  save();
  if (redraw) render();
});

/* ---------- typing ---------- */
let saveSoon = 0;
document.addEventListener('input', ev => {
  const el = ev.target, kind = el.dataset.in;
  if (!kind) return;
  if (kind === 'set') {
    const ex = S.program[ui.day].main.find(x => x.id === el.dataset.id);
    exLog(getLog(ui.day), ex).sets[+el.dataset.i][el.dataset.k] = el.value.trim();
  } else if (kind === 'cardio') getLog(ui.day).cardio[el.dataset.k] = el.value.trim();
  else if (kind === 'food') {
    const f = food(ui.foodDate), k = el.dataset.k;
    f[k] = el.value;
  }
  clearTimeout(saveSoon); saveSoon = setTimeout(save, 300);
});

document.addEventListener('submit', ev => {
  ev.preventDefault();
  const kind = ev.target.dataset.form;
  if (kind === 'grocery') {
    const name = $('#gitem').value.trim();
    if (name) { S.grocery.items.push({ id: uid(), name, done: false }); save(); render(); $('#gitem').focus(); }
  } else if (kind === 'modal' && modalSave) {
    modalSave(new FormData(ev.target)); save(); closeModal(); render();
  }
});
document.addEventListener('change', ev => { if (ev.target.id === 'restorefile' && ev.target.files[0]) restore(ev.target.files[0]); });

/* ---------- start ---------- */
syncPlan(); save();
render();
setInterval(tick, 250);
document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); else save(); });
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => { });
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => { }));
