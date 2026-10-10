import { Stage } from './stage.js';
import { MUSCLES } from './avatar.js';
import { EXERCISES, CATEGORIES, LEVELS } from './exercises.js';
import { buildPlan, buildBreakPlan, buildRoutinePlan, isJumping, FOCUS, todaySeed } from './plan.js';
import { ROUTINES } from './routines.js';
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

// Defaults. Newer fields (weeklyGoal, lowImpact, breakMinutes, tipSeen) are optional: store.get fills them in
// for people who saved settings with an older version.
const DEFAULT_SETTINGS = {
  minutes: 15, level: 1, focus: 'full', work: 20, rest: 10, voice: true, beeps: true, theme: 'light',
  weeklyGoal: 3, lowImpact: false, breakMinutes: 3, tipSeen: '',
};
const DEFAULT_PROFILE = { heightCm: 170, weightKg: 65, sex: 'male' };
const hasSaved = (key) => { try { return localStorage.getItem('mm.' + key) !== null; } catch { return true; } };
// First run = nothing saved at all, so people who already use the app never see the setup screens.
const firstRun = !hasSaved('settings') && !hasSaved('profile') && !hasSaved('history');
const settings = store.get('settings', { ...DEFAULT_SETTINGS });
const profile = store.get('profile', { ...DEFAULT_PROFILE });
let history = store.list('history');
let shuffleN = 0;
sound.voice = settings.voice;
sound.beeps = settings.beeps;

// ---------- 3D stage ----------
const canvas = $('stage');
const stage = new Stage(canvas);
window.__stage = stage;
// Build the smooth skin just after the first paint so the app appears instantly.
setTimeout(() => stage.setBody(profile), 60);
function applyTheme() {
  document.documentElement.dataset.theme = settings.theme;
  document.querySelector('meta[name=theme-color]')?.setAttribute('content', settings.theme === 'dark' ? '#0d141c' : '#0f766e');
  stage.setTheme(settings.theme);
}
applyTheme();
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
  $('low-impact').checked = settings.lowImpact;
  for (const b of $('break-min').children) b.classList.toggle('on', +b.dataset.v === settings.breakMinutes);
  $('break-sub').textContent = `${settings.breakMinutes} min · standing, no mat, no jumping`;
}

function rebuild() {
  plan = buildPlan({ ...settings, seed: todaySeed() + shuffleN * 997 });
  const kcal = estimateKcal(plan.items.map((i) => ({ ex: i.ex, secs: plan.work })), plan.rest * (plan.rounds - 1));
  $('plan-summary').textContent =
    `${plan.rounds} exercises · ${plan.work}s on / ${plan.rest}s rest · ${fmtTime(plan.seconds)} · ~${kcal} kcal` +
    (settings.lowImpact ? ' · no jumping' : '');
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
// "No jumping" lives on Home and in the You tab; both switches stay in step.
function setLowImpact(on) {
  settings.lowImpact = on; save(); renderSettings(); renderProfile(); rebuild(); renderSuggest();
}
$('low-impact').addEventListener('change', (e) => setLowImpact(e.target.checked));

// ---------- Desk break ----------
let breakN = 0;
$('break-min').addEventListener('click', (e) => {
  const v = e.target.dataset?.v; if (!v) return;
  settings.breakMinutes = +v; save(); renderSettings();
});
$('break-start').addEventListener('click', () => {
  // A new mix each time, so several breaks in one day do not feel the same.
  startWorkout(buildBreakPlan({ minutes: settings.breakMinutes, work: settings.work, rest: settings.rest, seed: todaySeed() + ++breakN * 131 }));
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

// ---------- Routines ----------
function renderRoutines() {
  $('routine-list').innerHTML = ROUTINES.map((r) => {
    const p = buildRoutinePlan(r);
    const circuits = r.circuits.map((c, ci) => `
      <li class="sec-h">Circuit ${ci + 1} · ${c.name}</li>
      ${c.ids.map((id) => {
        const ex = p.items.find((it) => it.ex.id === id).ex;
        return `<li data-id="${id}"><span class="nm">${ex.name}<span class="sub">${muscleNames(ex).slice(0, 3).join(' · ')}</span></span>${ex.props ? '<span class="tag">Dumbbells</span>' : ''}</li>`;
      }).join('')}`).join('');
    return `
      <div class="routine">
        <div class="row between gap">
          <div>
            <b>${r.name}</b>
            <div class="muted small">${fmtTime(p.seconds)} · ${r.circuits.length} circuits · ${p.items.length} exercises · ${r.work}s on / ${r.rest}s rest</div>
          </div>
          ${levelTag(r.level)}
        </div>
        <p class="small">${r.description}</p>
        ${r.note ? `<p class="small note">🧴 ${r.note}</p>` : ''}
        <details><summary>See all exercises</summary><ol class="ex-list plain">${circuits}</ol></details>
        <button class="primary big" data-routine="${r.id}">▶ Start ${r.name}</button>
      </div>`;
  }).join('');
}
$('routine-list').addEventListener('click', (e) => {
  const b = e.target.closest('[data-routine]');
  if (b) return startWorkout(buildRoutinePlan(ROUTINES.find((r) => r.id === b.dataset.routine)));
  const li = e.target.closest('li[data-id]');
  if (li) openPreview(EXERCISES.find((x) => x.id === li.dataset.id));
});

// ---------- Greeting & stats ----------
function greet() {
  const h = new Date().getHours();
  // After a few days away, a warm welcome instead of anything about a lost streak.
  $('hello').textContent = history.length && daysSinceLast() >= 3 ? 'Welcome back 👋'
    : h < 12 ? 'Good morning ☀️' : h < 17 ? 'Good afternoon' : 'Good evening';
}

// ---------- Weekly goal ----------
// Progress is counted per week (Monday to Sunday) in days with at least one workout or break.
// Missing a day never resets anything; only the weekly total matters.
const workoutDays = () => new Set(history.map((h) => dayKey(new Date(h.date))));
function weekStart(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
}
function daysInWeek(start, days = workoutDays()) {
  let n = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(start); d.setDate(d.getDate() + i);
    if (days.has(dayKey(d))) n++;
  }
  return n;
}
/** Weeks in a row that reached the goal. The current week adds to the run once it is reached, but never breaks it. */
function weeksOnGoal() {
  const days = workoutDays(), goal = settings.weeklyGoal;
  const w = weekStart();
  let n = daysInWeek(w, days) >= goal ? 1 : 0;
  for (;;) {
    w.setDate(w.getDate() - 7);
    if (daysInWeek(w, days) < goal) return n;
    n++;
  }
}
/** Whole days since the last saved workout (Infinity if there is none). */
function daysSinceLast(list = history) {
  if (!list.length) return Infinity;
  const last = new Date(list[list.length - 1].date), today = new Date();
  last.setHours(0, 0, 0, 0); today.setHours(0, 0, 0, 0);
  return Math.round((today - last) / 864e5);
}

function renderStats() {
  const days = workoutDays(), goal = settings.weeklyGoal;
  const start = weekStart(), n = daysInWeek(start, days);
  $('streak').innerHTML = `🎯 <b>${n}/${goal}</b> this week`;
  $('streak').classList.toggle('met', n >= goal);
  const mins = Math.round(history.reduce((a, h) => a + h.secs, 0) / 60);
  const kcal = history.reduce((a, h) => a + h.kcal, 0);
  $('stats').innerHTML = `
    <div class="stat"><b>${history.length}</b><span>workouts</span></div>
    <div class="stat"><b>${mins}</b><span>minutes</span></div>
    <div class="stat"><b>${weeksOnGoal()}</b><span>weeks in a row on goal</span></div>`;
  // This week, Monday to Sunday.
  const today = dayKey(new Date());
  let week = '', past = true;
  for (let i = 0; i < 7; i++) {
    const d = new Date(start); d.setDate(d.getDate() + i);
    const k = dayKey(d);
    week += `<div class="day ${days.has(k) ? 'on' : ''} ${k === today ? 'today' : ''} ${past ? '' : 'future'}"><i></i>${d.toLocaleDateString(undefined, { weekday: 'narrow' })}</div>`;
    if (k === today) past = false;
  }
  $('week').innerHTML = week;
  $('week-note').textContent = n >= goal
    ? 'Goal reached this week 🎯 Extra sessions are a bonus, and rest is fine too.'
    : `${n} of ${goal} days this week. Any workout or desk break counts.`;
  $('stats').title = `${kcal} kcal total`;
  for (const b of $('goal').children) b.classList.toggle('on', +b.dataset.v === goal);
  $('goal-label').textContent = goal === 1 ? '1 day a week' : `${goal} days a week`;
}
$('goal').addEventListener('click', (e) => {
  const v = e.target.dataset?.v; if (!v) return;
  settings.weeklyGoal = +v; save(); renderStats();
});

// ---------- "How did that feel?" suggestion ----------
// When 2 of the last 3 rated workouts felt too hard (or too easy), offer a one-tap change.
// Nothing changes unless the user taps; "No thanks" hides it until the next rating.
let suggestNow = null;
function suggestion() {
  const rated = history.filter((h) => h.feel).slice(-3);
  if (!rated.length) return null;
  const key = rated[rated.length - 1].date;
  if (settings.tipSeen === key) return null;
  const count = (v) => rated.filter((h) => h.feel === v).length;
  if (count('hard') >= 2) {
    const ch = {}, parts = [];
    if (settings.rest < 15) { ch.rest = 15; parts.push('Rest 15 s'); }
    if (!settings.lowImpact) { ch.lowImpact = true; parts.push('No jumping'); }
    if (!parts.length && settings.level > 1) { ch.level = settings.level - 1; parts.push(`Switch to ${LEVELS[ch.level]}`); }
    if (!parts.length && settings.minutes > 5) { ch.minutes = Math.max(5, settings.minutes - 5); parts.push(`${ch.minutes} min workouts`); }
    if (!parts.length) return null;
    return { key, title: 'Make it easier?', text: 'Your last workouts felt too hard. Easier sessions you enjoy beat hard ones you skip.', options: [{ label: parts.join(' + '), ch }] };
  }
  if (count('easy') >= 2) {
    const options = [];
    if (settings.work < 30) options.push({ label: 'Work 30 s', ch: { work: 30 } });
    if (settings.level < 3) options.push({ label: `Try ${LEVELS[settings.level + 1]}`, ch: { level: settings.level + 1 } });
    if (!options.length && settings.minutes < 30) {
      const m = Math.min(30, settings.minutes + 5);
      options.push({ label: `${m} min workouts`, ch: { minutes: m } });
    }
    if (!options.length) return null;
    return { key, title: 'Ready for more?', text: 'Your last workouts felt too easy. Want a small step up?', options };
  }
  return null;
}
function renderSuggest() {
  suggestNow = suggestion();
  $('suggest').hidden = !suggestNow;
  if (!suggestNow) return;
  $('suggest').innerHTML = `
    <div class="row between"><h2>${suggestNow.title}</h2><button class="x" data-dismiss aria-label="Dismiss">✕</button></div>
    <p class="small muted">${suggestNow.text}</p>
    <div class="row gap wrap">
      ${suggestNow.options.map((o, i) => `<button class="primary" data-opt="${i}">${o.label}</button>`).join('')}
      <button class="chip" data-dismiss>No thanks</button>
    </div>`;
}
$('suggest').addEventListener('click', (e) => {
  if (!suggestNow) return;
  const opt = e.target.closest('[data-opt]');
  if (!opt && !e.target.closest('[data-dismiss]')) return;
  if (opt) Object.assign(settings, suggestNow.options[+opt.dataset.opt].ch);
  settings.tipSeen = suggestNow.key;
  save(); renderSettings(); renderProfile(); renderSuggest();
  if (opt) rebuild();
});

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
      <div class="tags"><span class="tag">${CATEGORIES[e.cat]}</span>${levelTag(e.level)}${e.props ? '<span class="tag">Dumbbells</span>' : ''}${e.cat === 'cardio' && !isJumping(e) ? '<span class="tag">No-jump</span>' : ''}</div>
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
  $('pv-tags').innerHTML = `<span class="tag">${CATEGORIES[ex.cat]}</span>${levelTag(ex.level)}${ex.props ? '<span class="tag">Dumbbells</span>' : ''}`;
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
  $('opt-low-impact').checked = settings.lowImpact;
  for (const b of $('theme').children) b.classList.toggle('on', b.dataset.v === settings.theme);
}
$('opt-low-impact').addEventListener('change', (e) => setLowImpact(e.target.checked));
function saveProfile() {
  store.set('profile', profile);
  stage.setBody(profile);
}
$('height').addEventListener('change', (e) => { profile.heightCm = Math.max(120, Math.min(220, +e.target.value || 170)); e.target.value = profile.heightCm; saveProfile(); });
$('weight').addEventListener('change', (e) => { profile.weightKg = Math.max(30, Math.min(200, +e.target.value || 65)); e.target.value = profile.weightKg; saveProfile(); });
$('sex').addEventListener('click', (e) => { const v = e.target.dataset?.v; if (v) { profile.sex = v; renderProfile(); saveProfile(); } });
$('opt-voice').addEventListener('change', (e) => { settings.voice = sound.voice = e.target.checked; save(); });
$('theme').addEventListener('click', (e) => {
  const v = e.target.closest('[data-v]')?.dataset.v;
  if (v) { settings.theme = v; save(); applyTheme(); renderProfile(); }
});
$('opt-beeps').addEventListener('change', (e) => { settings.beeps = sound.beeps = e.target.checked; save(); });

// ---------- Backup & restore ----------
// A small JSON file with settings, body and history. It is made and read on the device; nothing is uploaded.
$('backup').addEventListener('click', () => {
  const data = { app: 'morning-move', version: 1, saved: new Date().toISOString(), settings, profile, history };
  const url = URL.createObjectURL(new Blob([JSON.stringify(data)], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `morning-move-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  $('data-msg').textContent = `Backup saved (${history.length} workouts). Keep the file somewhere safe.`;
});
$('restore').addEventListener('click', () => $('restore-file').click());
$('restore-file').addEventListener('change', async (e) => {
  const file = e.target.files?.[0];
  e.target.value = '';
  if (!file) return;
  try {
    const added = restoreBackup(JSON.parse(await file.text()));
    $('data-msg').textContent = `Restored. ${added === 1 ? '1 workout' : `${added} workouts`} added, and your settings are back.`;
  } catch {
    $('data-msg').textContent = 'That file does not look like a Morning Move backup. Nothing was changed.';
  }
});

/** Keep only known keys with the right type, and clamp numbers to the ranges the app uses. */
function cleanSettings(src) {
  const out = {};
  for (const [k, v] of Object.entries(src || {})) if (k in DEFAULT_SETTINGS && typeof v === typeof DEFAULT_SETTINGS[k]) out[k] = v;
  const clamp = (k, lo, hi) => { if (k in out) out[k] = Math.max(lo, Math.min(hi, Math.round(out[k]) || DEFAULT_SETTINGS[k])); };
  clamp('minutes', 5, 30); clamp('level', 1, 3); clamp('work', 10, 90); clamp('rest', 5, 60); clamp('weeklyGoal', 1, 7);
  if ('breakMinutes' in out && ![2, 3, 5].includes(out.breakMinutes)) delete out.breakMinutes;
  if ('focus' in out && !FOCUS[out.focus]) delete out.focus;
  if ('theme' in out && !['light', 'dark'].includes(out.theme)) delete out.theme;
  return out;
}
function cleanProfile(src) {
  const out = {};
  const p = src || {};
  if (typeof p.heightCm === 'number') out.heightCm = Math.max(120, Math.min(220, p.heightCm));
  if (typeof p.weightKg === 'number') out.weightKg = Math.max(30, Math.min(200, p.weightKg));
  if (['male', 'female'].includes(p.sex)) out.sex = p.sex;
  return out;
}
function restoreBackup(d) {
  if (!d || typeof d !== 'object' || Array.isArray(d)) throw new Error('not an object');
  const rows = Array.isArray(d.history) ? d.history : [];
  if (!rows.length && !d.settings && !d.profile) throw new Error('empty');
  // Merge history by date so restoring twice does not double anything.
  const byDate = new Map(history.map((h) => [h.date, h]));
  let added = 0;
  for (const h of rows) {
    if (!h || typeof h.date !== 'string' || isNaN(Date.parse(h.date)) || typeof h.secs !== 'number') continue;
    if (byDate.has(h.date)) continue;
    const row = { date: h.date, secs: h.secs, kcal: +h.kcal || 0, count: +h.count || 0, focus: String(h.focus || 'full') };
    if (['hard', 'right', 'easy'].includes(h.feel)) row.feel = h.feel;
    byDate.set(h.date, row);
    added++;
  }
  history = [...byDate.values()].sort((a, b) => Date.parse(a.date) - Date.parse(b.date)).slice(-400);
  Object.assign(settings, cleanSettings(d.settings));
  Object.assign(profile, cleanProfile(d.profile));
  store.set('history', history);
  save();
  store.set('profile', profile);
  sound.voice = settings.voice;
  sound.beeps = settings.beeps;
  applyTheme();
  stage.setBody(profile);
  greet(); renderSettings(); renderProfile(); renderStats(); renderSuggest(); rebuild();
  return added;
}

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
    const it = p.items[i];
    if (i < p.items.length - 1) segs.push({ type: 'rest', dur: it.restAfter ?? p.rest, i: i + 1, breather: !!it.circuitEnd });
  });
  return segs;
}

async function keepAwake(on) {
  try {
    if (on && 'wakeLock' in navigator) session.lock = await navigator.wakeLock.request('screen');
    else if (session?.lock) { session.lock.release(); session.lock = null; }
  } catch { /* not supported */ }
}

function startWorkout(p = plan) {
  unlockAudio();
  clearTimeout(heroTimer);
  session = {
    plan: p, segs: buildSegments(p), seg: 0, left: READY_SECS, last: performance.now(),
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
  $('p-count').textContent = item.circuitName
    ? `Circuit ${item.circuit + 1} of ${s.plan.routine.circuits.length} · ${item.circuitName} · ${item.indexInCircuit + 1}/${item.circuitSize}`
    : `Exercise ${seg.i + 1} of ${total}`;
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
    ph.textContent = phaseLabel(seg);
    stage.play(ex, { highlight: 'next' });
    if (seg.breather) {
      $('p-nextup').textContent = `Next: Circuit ${item.circuit + 1} · ${item.circuitName}`;
      say(`Circuit ${item.circuit} done. Breathe deeply. Next: ${item.circuitName}, starting with ${ex.name}`);
    } else say(seg.type === 'rest' ? `Rest. Next: ${ex.name}` : `Get ready. First: ${ex.name}`);
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
function phaseLabel(seg) {
  if (seg.type === 'work') return 'GO!';
  if (seg.breather) return 'BREATHE DEEPLY';
  return seg.type === 'rest' ? 'REST' : 'GET READY';
}
function enterPhaseLabel() {
  $('p-phase').textContent = phaseLabel(session.segs[session.seg]);
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
  const isBreak = s.plan.kind === 'break';
  const minWork = isBreak ? 30 : 60;   // a desk break counts after 30 s of moving, a workout after 60 s
  const gap = daysSinceLast();
  const today = dayKey(new Date());
  const newDay = !history.some((h) => dayKey(new Date(h.date)) === today);
  savedEntry = null;
  if (workSecs >= minWork) {
    savedEntry = { date: new Date().toISOString(), secs, kcal, count: done, focus: isBreak ? 'break' : s.plan.routine?.id || settings.focus };
    history.push(savedEntry);
    history = history.slice(-400);
    store.set('history', history);
  }
  if (!completed && workSecs < minWork) { backHome(); return; }
  say(isBreak ? 'Break done. Back to it!' : completed ? 'Workout complete. Great job!' : 'Nice effort!');
  $('done').hidden = false;
  $('done').querySelector('h1').textContent = isBreak ? 'Break done!' : completed ? 'Workout complete!' : 'Good effort!';
  $('done-msg').textContent = doneMessage(savedEntry, gap, newDay, isBreak);
  $('done-feel').hidden = !savedEntry;
  $('feel-thanks').hidden = true;
  for (const b of $('feel').children) b.classList.remove('on');
  $('done-stats').innerHTML = `
    <div class="stat"><b>${Math.round(secs / 60)}</b><span>minutes</span></div>
    <div class="stat"><b>${done}</b><span>exercises</span></div>
    <div class="stat"><b>${kcal}</b><span>kcal (est.)</span></div>`;
}

/** Done-screen message: progress toward the weekly goal, never anything about a lost streak. */
function doneMessage(entry, gap, newDay, isBreak) {
  if (!entry) return isBreak ? 'Short and sweet. Move for 30 seconds or more to count it toward your week.'
    : 'Every bit helps. Move for a minute or more to count it toward your week.';
  const n = daysInWeek(weekStart()), goal = settings.weeklyGoal;
  const hello = gap === Infinity ? 'Your first one is done! ' : gap >= 3 ? 'Welcome back! ' : isBreak ? 'Back to it, a bit looser. ' : '';
  if (n < goal) {
    const left = goal - n;
    return `${hello}${n} of ${goal} this week — ${left === 1 ? 'one more' : `${left} more`} to hit your goal.`;
  }
  if (n === goal && newDay) {
    const w = weeksOnGoal();
    return `${hello}Weekly goal reached! 🎯 ${w > 1 ? `That's ${w} weeks in a row.` : 'Great week.'}`;
  }
  return `${hello}You already hit your goal this week (${n} of ${goal}). This one is a bonus!`;
}

// "How did that feel?" is saved on the workout that was just recorded.
let savedEntry = null;
const FEEL_THANKS = {
  hard: 'Thanks. If it keeps feeling hard, we will suggest easier settings.',
  right: 'Great, that is the sweet spot.',
  easy: 'Nice! If it keeps feeling easy, we will suggest a step up.',
};
$('feel').addEventListener('click', (e) => {
  const v = e.target.closest('[data-v]')?.dataset.v;
  if (!v || !savedEntry) return;
  savedEntry.feel = v;
  store.set('history', history);
  for (const b of $('feel').children) b.classList.toggle('on', b.dataset.v === v);
  $('feel-thanks').textContent = FEEL_THANKS[v];
  $('feel-thanks').hidden = false;
});

function backHome() {
  $('done').hidden = true;
  mountStage($('hero-slot'));
  greet();
  renderStats();
  renderSuggest();
  heroShow();
}

$('start').addEventListener('click', () => startWorkout());
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

// ---------- First-run setup ----------
// Three short, skippable screens. Choices go into a draft and are saved when the user finishes or skips.
let obStep = 0, draft = null;
function openWelcome() {
  draft = { focus: settings.focus, weeklyGoal: settings.weeklyGoal, level: settings.level, lowImpact: settings.lowImpact };
  $('ob-height').value = profile.heightCm;
  $('ob-weight').value = profile.weightKg;
  draft.sex = profile.sex;
  obStep = 0;
  $('welcome').hidden = false;
  renderWelcome();
}
function renderWelcome() {
  document.querySelectorAll('#welcome .ob-step').forEach((el) => { el.hidden = +el.dataset.page !== obStep; });
  [...$('ob-dots').children].forEach((d, i) => d.classList.toggle('on', i === obStep));
  for (const b of $('ob-goal').children) b.classList.toggle('on', b.dataset.v === draft.focus);
  for (const b of $('ob-days').children) b.classList.toggle('on', +b.dataset.v === draft.weeklyGoal);
  $('ob-days-label').textContent = draft.weeklyGoal === 1 ? '1 day' : `${draft.weeklyGoal} days`;
  for (const b of $('ob-level').children) b.classList.toggle('on', +b.dataset.v === draft.level);
  for (const b of $('ob-sex').children) b.classList.toggle('on', b.dataset.v === draft.sex);
  $('ob-low').checked = draft.lowImpact;
  $('ob-back').style.visibility = obStep ? 'visible' : 'hidden';
  $('ob-next').textContent = obStep === 2 ? "Let's go ▶" : 'Next →';
}
function closeWelcome() {
  const { sex, ...picked } = draft;
  Object.assign(settings, picked);
  save();
  const h = Math.max(120, Math.min(220, +$('ob-height').value || profile.heightCm));
  const w = Math.max(30, Math.min(200, +$('ob-weight').value || profile.weightKg));
  const changed = h !== profile.heightCm || w !== profile.weightKg || sex !== profile.sex;
  Object.assign(profile, { heightCm: h, weightKg: w, sex });
  store.set('profile', profile);
  if (changed) stage.setBody(profile);
  $('welcome').hidden = true;
  renderSettings(); renderProfile(); renderStats(); rebuild();
}
const pick = (id, key, num) => $(id).addEventListener('click', (e) => {
  const v = e.target.closest('[data-v]')?.dataset.v; if (!v) return;
  draft[key] = num ? +v : v; renderWelcome();
});
pick('ob-goal', 'focus');
pick('ob-days', 'weeklyGoal', true);
pick('ob-level', 'level', true);
pick('ob-sex', 'sex');
$('ob-low').addEventListener('change', (e) => { draft.lowImpact = e.target.checked; });
$('ob-skip').addEventListener('click', closeWelcome);
$('ob-back').addEventListener('click', () => { obStep = Math.max(0, obStep - 1); renderWelcome(); });
$('ob-next').addEventListener('click', () => {
  if (obStep === 2) return closeWelcome();
  obStep++; renderWelcome();
});

// ---------- Init ----------
greet();
renderSettings();
renderProfile();
renderLibrary();
renderRoutines();
renderStats();
renderSuggest();
rebuild();
if (firstRun) openWelcome();

// Install to home screen: Android/desktop Chrome fire beforeinstallprompt; iPhone needs Safari's Share menu.
let installEvent = null;
const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  installEvent = e;
  $('install').hidden = false;
});
$('install').addEventListener('click', async () => {
  if (!installEvent) return;
  installEvent.prompt();
  await installEvent.userChoice.catch(() => {});
  installEvent = null;
  $('install').hidden = true;
});
window.addEventListener('appinstalled', () => { $('install').hidden = true; });
if (!standalone && /iphone|ipad|ipod/i.test(navigator.userAgent)) {
  $('install-hint').hidden = false;
  $('install-hint').innerHTML = 'To install: open this page in <b>Safari</b>, tap the <b>Share</b> button (square with an arrow), then <b>Add to Home Screen</b>.';
}

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
