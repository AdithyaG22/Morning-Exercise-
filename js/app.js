import { Stage } from './stage.js';
import { MUSCLES } from './avatar.js';
import { EXERCISES, CATEGORIES, LEVELS } from './exercises.js';
import { buildPlan, FOCUS, todaySeed } from './plan.js';
import { beep, say, sound, unlockAudio } from './audio.js';

const $ = (id) => document.getElementById(id);

// ---------- Storage ----------
const store = {
  get(key, fallback) {
    try { const v = localStorage.getItem('mm.' + key); return v ? { ...fallback, ...JSON.parse(v) } : fallback; }
    catch { return fallback; }
  },
  list(key) {
    try { return JSON.parse(localStorage.getItem('mm.' + key)) || []; } catch { return []; }
  },
  set(key, v) { try { localStorage.setItem('mm.' + key, JSON.stringify(v)); } catch { /* private mode */ } },
};

const settings = store.get('settings', { minutes: 15, level: 1, focus: 'full', work: 20, rest: 10, voice: true, beeps: true });
const profile = store.get('profile', { heightCm: 170, weightKg: 65, sex: 'male' });
let history = store.list('history');
let shuffleN = 0;
sound.voice = settings.voice;
sound.beeps = settings.beeps;

// ---------- 3D stage ----------
const canvas = $('stage');
const stage = new Stage(canvas);
stage.setBody(profile);
function mountStage(slot) {
  slot.appendChild(canvas);
  stage.userYaw = 0;
  stage.userPitch = 0;
  stage.resize();
}
mountStage($('hero-slot'));

// ---------- Helpers ----------
const fmtTime = (s) => {
  const m = Math.floor(s / 60), r = Math.round(s % 60);
  return r ? `${m}:${String(r).padStart(2, '0')} min` : `${m} min`;
};
const muscleNames = (ex) => ex.muscles.map((m) => MUSCLES[m]);
const levelTag = (l) => `<span class="tag l${l}">${LEVELS[l]}</span>`;
const dayKey = (d) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

function chipsHTML(list) {
  return list.map((n) => `<span>${n}</span>`).join('');
}

// ---------- Home / plan ----------
let plan;

function renderSettings() {
  $('min-label').textContent = `${settings.minutes} min`;
  $('minutes').value = settings.minutes;
  $('work-label').textContent = `${settings.work}s`;
  $('rest-label').textContent = `${settings.rest}s`;
  for (const b of $('level').children) b.classList.toggle('on', +b.dataset.v === settings.level);
  $('focus').innerHTML = Object.entries(FOCUS)
    .map(([k, f]) => `<button class="chip ${k === settings.focus ? 'on' : ''}" data-v="${k}">${f.name}</button>`).join('');
}

function rebuild() {
  plan = buildPlan({ ...settings, seed: todaySeed() + shuffleN * 997 });
  const kcal = estimateKcal(plan.items.map((i) => ({ ex: i.ex, secs: plan.work })), plan.rest * (plan.rounds - 1));
  $('plan-summary').textContent =
    `${plan.rounds} exercises · ${plan.work}s on / ${plan.rest}s rest · ${fmtTime(plan.seconds)} · ~${kcal} kcal`;
  const nWarm = plan.items.findIndex((i) => i.ex.cat !== 'warmup');
  let html = '';
  plan.items.forEach((it, i) => {
    if (i === 0) html += '<li class="sec-h">Warm-up</li>';
    if (i === nWarm) html += '<li class="sec-h">Main</li>';
    if (i === plan.items.length - Math.max(2, Math.round(plan.rounds * 0.12))) html += '<li class="sec-h">Cool-down</li>';
    html += `<li data-id="${it.ex.id}"><span class="nm">${it.ex.name}<span class="sub">${muscleNames(it.ex).slice(0, 3).join(' · ')}</span></span>${levelTag(it.ex.level)}</li>`;
  });
  $('plan-list').innerHTML = html;
  heroIndex = 0;
  heroShow();
}

function save() { store.set('settings', settings); }

$('minutes').addEventListener('input', (e) => { settings.minutes = +e.target.value; $('min-label').textContent = `${settings.minutes} min`; });
$('minutes').addEventListener('change', () => { save(); rebuild(); });
$('level').addEventListener('click', (e) => {
  const v = e.target.dataset?.v; if (!v) return;
  settings.level = +v; save(); renderSettings(); rebuild();
});
$('focus').addEventListener('click', (e) => {
  const v = e.target.dataset?.v; if (!v) return;
  settings.focus = v; save(); renderSettings(); rebuild();
});
document.querySelectorAll('[data-step]').forEach((b) => b.addEventListener('click', () => {
  const k = b.dataset.step, d = +b.dataset.d;
  const [lo, hi] = k === 'work' ? [10, 90] : [5, 60];
  settings[k] = Math.max(lo, Math.min(hi, settings[k] + d));
  save(); renderSettings(); rebuild();
}));
$('shuffle').addEventListener('click', () => { shuffleN++; rebuild(); });
$('plan-list').addEventListener('click', (e) => {
  const li = e.target.closest('li[data-id]');
  if (li) openPreview(EXERCISES.find((x) => x.id === li.dataset.id));
});

// Hero: cycle through the plan's exercises
let heroIndex = 0, heroTimer = null;
function heroShow() {
  clearTimeout(heroTimer);
  if (!plan || canvas.parentElement !== $('hero-slot')) return;
  const ex = plan.items[heroIndex % plan.items.length].ex;
  stage.speed = 1;
  stage.play(ex);
  $('hero-caption').textContent = `${ex.name} · drag to rotate`;
  heroTimer = setTimeout(() => { heroIndex++; heroShow(); }, 6000);
}

// ---------- Greeting & stats ----------
function greet() {
  const h = new Date().getHours();
  $('hello').textContent = h < 12 ? 'Good morning ☀️' : h < 17 ? 'Good afternoon' : 'Good evening';
}

function streak() {
  const days = new Set(history.map((h) => dayKey(new Date(h.date))));
  const d = new Date();
  if (!days.has(dayKey(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (days.has(dayKey(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

function renderStats() {
  const s = streak();
  $('streak').innerHTML = `🔥 <b>${s}</b>`;
  const mins = Math.round(history.reduce((a, h) => a + h.secs, 0) / 60);
  const kcal = history.reduce((a, h) => a + h.kcal, 0);
  $('stats').innerHTML = `
    <div class="stat"><b>${history.length}</b><span>workouts</span></div>
    <div class="stat"><b>${mins}</b><span>minutes</span></div>
    <div class="stat"><b>${s}</b><span>day streak</span></div>`;
  const days = new Set(history.map((h) => dayKey(new Date(h.date))));
  let week = '';
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    week += `<div class="day ${days.has(dayKey(d)) ? 'on' : ''}"><i></i>${d.toLocaleDateString(undefined, { weekday: 'narrow' })}</div>`;
  }
  $('week').innerHTML = week;
  $('stats').title = `${kcal} kcal total`;
}

// ---------- Tabs ----------
$('tabs').addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  for (const x of $('tabs').children) x.classList.toggle('on', x === b);
  document.querySelectorAll('.view').forEach((v) => v.classList.toggle('active', v.id === 'view-' + b.dataset.view));
  if (b.dataset.view === 'profile') renderStats();
  window.scrollTo(0, 0);
});

// ---------- Library ----------
let libCat = 'all';
function renderLibrary() {
  $('lib-filter').innerHTML = [['all', 'All'], ...Object.entries(CATEGORIES)]
    .map(([k, n]) => `<button class="chip ${k === libCat ? 'on' : ''}" data-v="${k}">${n}</button>`).join('');
  $('lib-grid').innerHTML = EXERCISES.filter((e) => libCat === 'all' || e.cat === libCat).map((e) => `
    <button class="lib-item" data-id="${e.id}">
      <b>${e.name}</b>
      <div class="tags"><span class="tag">${CATEGORIES[e.cat]}</span>${levelTag(e.level)}</div>
      <small>${muscleNames(e).join(', ')}</small>
    </button>`).join('');
}
$('lib-filter').addEventListener('click', (e) => { const v = e.target.dataset?.v; if (v) { libCat = v; renderLibrary(); } });
$('lib-grid').addEventListener('click', (e) => {
  const b = e.target.closest('[data-id]');
  if (b) openPreview(EXERCISES.find((x) => x.id === b.dataset.id));
});

// ---------- Preview sheet ----------
let previewTimer = null;
function openPreview(ex) {
  clearTimeout(heroTimer);
  $('preview').hidden = false;
  mountStage($('preview-slot'));
  stage.speed = 1;
  stage.play(ex);
  $('pv-name').textContent = ex.name;
  $('pv-tip').textContent = ex.tips + (ex.sides ? ' Do both sides.' : '');
  $('pv-tags').innerHTML = `<span class="tag">${CATEGORIES[ex.cat]}</span>${levelTag(ex.level)}`;
  $('pv-muscles').innerHTML = chipsHTML(muscleNames(ex));
  clearInterval(previewTimer);
  if (ex.sides) {
    let m = false;
    previewTimer = setInterval(() => { m = !m; stage.play(ex, { mirrored: m }); }, 5000);
  }
}
function closePreview() {
  clearInterval(previewTimer);
  $('preview').hidden = true;
  mountStage($('hero-slot'));
  heroShow();
}
$('pv-close').addEventListener('click', closePreview);
$('preview').addEventListener('click', (e) => { if (e.target === $('preview')) closePreview(); });

// ---------- Profile ----------
function renderProfile() {
  $('height').value = profile.heightCm;
  $('weight').value = profile.weightKg;
  for (const b of $('sex').children) b.classList.toggle('on', b.dataset.v === profile.sex);
  $('opt-voice').checked = settings.voice;
  $('opt-beeps').checked = settings.beeps;
}
function saveProfile() {
  store.set('profile', profile);
  stage.setBody(profile);
}
$('height').addEventListener('change', (e) => { profile.heightCm = Math.max(120, Math.min(220, +e.target.value || 170)); e.target.value = profile.heightCm; saveProfile(); });
$('weight').addEventListener('change', (e) => { profile.weightKg = Math.max(30, Math.min(200, +e.target.value || 65)); e.target.value = profile.weightKg; saveProfile(); });
$('sex').addEventListener('click', (e) => { const v = e.target.dataset?.v; if (v) { profile.sex = v; renderProfile(); saveProfile(); } });
$('opt-voice').addEventListener('change', (e) => { settings.voice = sound.voice = e.target.checked; save(); });
$('opt-beeps').addEventListener('change', (e) => { settings.beeps = sound.beeps = e.target.checked; save(); });

// ---------- Calories ----------
function estimateKcal(workParts, restSecs) {
  const kg = profile.weightKg;
  let kcal = workParts.reduce((a, p) => a + (p.ex.met * kg * p.secs) / 3600, 0);
  kcal += (2 * kg * restSecs) / 3600;
  return Math.round(kcal);
}

// ---------- Workout player ----------
const READY_SECS = 10;
let session = null;

function buildSegments(p) {
  const segs = [{ type: 'ready', dur: READY_SECS, i: 0 }];
  p.items.forEach((_, i) => {
    segs.push({ type: 'work', dur: p.work, i });
    if (i < p.items.length - 1) segs.push({ type: 'rest', dur: p.rest, i: i + 1 });
  });
  return segs;
}

async function keepAwake(on) {
  try {
    if (on && 'wakeLock' in navigator) session.lock = await navigator.wakeLock.request('screen');
    else if (session?.lock) { session.lock.release(); session.lock = null; }
  } catch { /* not supported */ }
}

function startWorkout() {
  unlockAudio();
  clearTimeout(heroTimer);
  session = {
    plan, segs: buildSegments(plan), seg: 0, left: READY_SECS, last: performance.now(),
    paused: false, worked: [], restSecs: 0, lastBeep: null, switched: false, start: Date.now(),
  };
  $('player').hidden = false;
  mountStage($('player-slot'));
  keepAwake(true);
  enterSegment();
  session.timer = setInterval(tick, 100);
}

function enterSegment() {
  const s = session, seg = s.segs[s.seg], item = s.plan.items[seg.i], ex = item.ex;
  s.left = seg.dur;
  s.switched = false;
  s.lastBeep = null;
  const total = s.plan.items.length;
  const ph = $('p-phase'), ring = $('p-ring');
  ph.className = 'phase ' + (seg.type === 'work' ? '' : seg.type);
  ring.className = 'ring ' + (seg.type === 'work' ? '' : seg.type);
  $('p-name').textContent = ex.name;
  $('p-count').textContent = `Exercise ${seg.i + 1} of ${total}`;
  $('p-tip').textContent = ex.tips + (ex.sides ? ' Switch sides halfway.' : '');
  $('p-muscles').innerHTML = chipsHTML(muscleNames(ex));
  $('p-muscles').classList.toggle('next', seg.type !== 'work');
  const nextItem = s.plan.items[seg.i + 1];
  $('p-nextup').textContent = seg.type === 'work' && nextItem ? `Next: ${nextItem.ex.name}` : '';
  $('p-bar').style.width = `${(s.seg / s.segs.length) * 100}%`;

  if (seg.type === 'work') {
    ph.textContent = 'GO!';
    stage.speed = 1;
    stage.play(ex, { highlight: 'active' });
    beep(1320, 380, 0.3);
    if (seg.i === Math.floor(total / 2) && total > 6) setTimeout(() => say('Halfway there. Keep going!'), 500);
  } else {
    ph.textContent = seg.type === 'rest' ? 'REST' : 'GET READY';
    stage.speed = 0.6;
    stage.play(ex, { highlight: 'next' });
    say(seg.type === 'rest' ? `Rest. Next: ${ex.name}` : `Get ready. First: ${ex.name}`);
  }
  renderTime();
}

function renderTime() {
  const s = session, seg = s.segs[s.seg];
  const shown = Math.ceil(s.left - 0.001);
  $('p-time').textContent = Math.max(0, shown);
  const frac = 1 - s.left / seg.dur;
  $('p-ring-fill').style.strokeDashoffset = String(326.7 * frac);
}

function tick() {
  const s = session; if (!s) return;
  const now = performance.now();
  const dt = (now - s.last) / 1000;
  s.last = now;
  if (s.paused) return;
  const seg = s.segs[s.seg];
  s.left -= dt;
  if (seg.type === 'work') {
    const ex = s.plan.items[seg.i].ex;
    s.worked[seg.i] = (s.worked[seg.i] || 0) + dt;
    if (ex.sides && !s.switched && s.left <= seg.dur / 2) {
      s.switched = true;
      stage.play(ex, { mirrored: true });
      say('Switch sides');
      beep(990, 150);
    }
  } else if (seg.type === 'rest') s.restSecs += dt;

  const sec = Math.ceil(s.left);
  if (sec <= 3 && sec >= 1 && s.lastBeep !== sec) { s.lastBeep = sec; beep(880, 120); }
  if (s.left <= 0) {
    if (s.seg >= s.segs.length - 1) return finish(true);
    s.seg++;
    enterSegment();
    return;
  }
  renderTime();
}

function jump(dir) {
  const s = session;
  let i = s.seg + dir;
  // Skip over rests so prev/next land on exercises
  while (s.segs[i] && s.segs[i].type === 'rest') i += dir;
  if (i < 0) i = 0;
  if (i >= s.segs.length) return finish(true);
  s.seg = i;
  enterSegment();
}

function setPaused(p) {
  session.paused = p;
  stage.paused = p;
  $('p-pause').textContent = p ? '▶ Resume' : '⏸ Pause';
  if (!p) $('p-end').hidden = true;
  if (p) $('p-phase').textContent = 'PAUSED';
  else enterPhaseLabel();
}
function enterPhaseLabel() {
  const seg = session.segs[session.seg];
  $('p-phase').textContent = seg.type === 'work' ? 'GO!' : seg.type === 'rest' ? 'REST' : 'GET READY';
}

function finish(completed) {
  const s = session;
  clearInterval(s.timer);
  keepAwake(false);
  stage.paused = false;
  const workSecs = s.worked.reduce((a, b) => a + (b || 0), 0);
  const parts = s.worked.map((secs, i) => ({ ex: s.plan.items[i].ex, secs: secs || 0 }));
  const kcal = estimateKcal(parts, s.restSecs);
  const secs = Math.round(workSecs + s.restSecs);
  const done = s.worked.filter((x) => x > 5).length;
  session = null;
  $('player').hidden = true;
  $('p-end').hidden = true;
  $('p-pause').textContent = '⏸ Pause';
  if (workSecs >= 60) {
    history.push({ date: new Date().toISOString(), secs, kcal, count: done, focus: settings.focus });
    history = history.slice(-400);
    store.set('history', history);
  }
  if (!completed && workSecs < 60) { backHome(); return; }
  say(completed ? 'Workout complete. Great job!' : 'Nice effort!');
  $('done').hidden = false;
  $('done').querySelector('h1').textContent = completed ? 'Workout complete!' : 'Good effort!';
  const st = streak();
  $('done-msg').textContent = st > 1 ? `${st} days in a row. Keep the streak alive tomorrow!` : 'Great way to start the day. See you tomorrow!';
  $('done-stats').innerHTML = `
    <div class="stat"><b>${Math.round(secs / 60)}</b><span>minutes</span></div>
    <div class="stat"><b>${done}</b><span>exercises</span></div>
    <div class="stat"><b>${kcal}</b><span>kcal (est.)</span></div>`;
}

function backHome() {
  $('done').hidden = true;
  mountStage($('hero-slot'));
  renderStats();
  heroShow();
}

$('start').addEventListener('click', startWorkout);
$('p-pause').addEventListener('click', () => setPaused(!session.paused));
$('p-next').addEventListener('click', () => jump(1));
$('p-prev').addEventListener('click', () => jump(-1));
// ✕ pauses and reveals an "End workout" button (in-page confirm instead of a browser dialog)
$('p-exit').addEventListener('click', () => {
  setPaused(true);
  $('p-end').hidden = false;
});
$('p-end').addEventListener('click', () => finish(false));
$('p-sound').addEventListener('click', () => {
  const on = !(sound.voice || sound.beeps);
  sound.voice = on && settings.voice;
  sound.beeps = on && settings.beeps;
  if (on && !settings.voice && !settings.beeps) sound.voice = sound.beeps = true;
  $('p-sound').textContent = sound.voice || sound.beeps ? '🔊' : '🔇';
  if (!sound.voice) speechSynthesis?.cancel();
});
$('done-ok').addEventListener('click', backHome);
document.addEventListener('keydown', (e) => {
  if (!session) return;
  if (e.code === 'Space') { e.preventDefault(); setPaused(!session.paused); }
  if (e.code === 'ArrowRight') jump(1);
  if (e.code === 'ArrowLeft') jump(-1);
});
document.addEventListener('visibilitychange', () => {
  if (session && document.visibilityState === 'visible') keepAwake(true);
});

// ---------- Init ----------
greet();
renderSettings();
renderProfile();
renderLibrary();
renderStats();
rebuild();

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
