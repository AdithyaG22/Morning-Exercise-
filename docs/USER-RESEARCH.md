> Research behind Morning Move's habit and comfort features (weekly goal, desk break, feedback, no-jump option, first-run setup, backup). Compiled from web-search excerpts; each claim is rated by evidence strength.

# Morning Move: user research and feature recommendations

Date: 2026-10-10. Method: web search (search excerpts only; full papers were not read), plus a read of
`CLAUDE.md`, `README.md`, `js/app.js`, `js/plan.js`, `js/exercises.js`, `index.html`. No repo files were changed.

Evidence-strength labels used below:
- **Strong**: guideline, large cohort, or systematic review/meta-analysis with consistent results.
- **Moderate**: RCTs or reviews with caveats, or consistent findings across several smaller studies.
- **Weak**: single small study, industry survey, vendor blog, or secondary news summary.

---

## 1. Summary

- People download home-workout apps mainly for **convenience, time efficiency, low cost and privacy**
  (no gym, no audience). Lack of time is the most consistently reported barrier to exercise in adults
  aged 18–64. Morning Move already fits this well: free, offline, short, no account.
- People stop mainly because of **lost motivation and boredom**, then **cost/paywalls, privacy concerns,
  friction, and life getting in the way**. Many lapsed users want to come back but feel guilt, which
  means the app should make returning easy rather than punishing a gap.
- **Daily streaks are a double-edged tool.** Experiments show streaks motivate, but a broken streak
  lowers later engagement. Habit research shows a single missed day does not stop a habit from forming,
  and health benefits depend on weekly volume, not on doing something every single day. Morning Move's
  only goal signal today is a daily streak (`streak()` in `js/app.js`), and the done screen says
  "Keep the streak alive tomorrow!". That is the most fragile design choice in the app.
- **Desk workers**: home workers report more upper-back, neck and shoulder pain and more long sitting
  days. Sitting partly explains the pain. Breaking up sitting and short "exercise snacks" have growing,
  moderate-quality support. The app's minimum session is 5 minutes and the "Desk relief" focus includes
  floor (mat) moves, so there is no true "2-minute break at the desk" option today.
- **Safety and comfort**: the app has no low-impact switch (5 moves have jumps), no first-run safety
  note, and no way to say "this was too hard". These are cheap to add.

**Top 5 to implement now** (impact ÷ effort):
1. Weekly goal with a forgiving streak (replaces fragile daily streak messaging).
2. "Quick break" 2–5 minute desk mode (standing only, no mat, no jumps).
3. "How did that feel?" check after each workout, with a suggested adjustment.
4. Low-impact / quiet toggle (no jumping).
5. Short first-run setup (goal, days per week, level, impact) with a plain-language safety note.

---

## 2. Who downloads exercise apps, and why

| Segment | Main job to be done | Evidence (strength) |
|---|---|---|
| Busy people / everyone 18–64 | "Fit exercise into a day that feels full." Lack of time is the top reported barrier, though one study suggests perceived time shortage does not fully explain who is active. | Cross-regional survey: lack of time was "consistently the most commonly identified" barrier for adults 18–64 (Moderate). Australian study (Rebar et al. 2019, n=725) questions whether it is the real cause (Moderate). |
| People avoiding gyms (cost, intimidation, privacy) | "Exercise at home without being watched or paying for a gym or trainer." | GLL-commissioned UK survey: 27% sometimes prefer home (convenience, flexibility, privacy); 30% say feeling intimidated would stop them using a gym; 18% say schedule makes regular gym visits hard (Weak: commissioned, one region). |
| App users in general | "A tool that is useful, enjoyable and fits my habits." | US survey of 839 fitness-app users (UTAUT2): performance expectancy, hedonic motivation, price value and habit predicted continued use (Moderate). German study of 403 users: usefulness and "flow" drive satisfaction; ease of use, enjoyment, social influence sustain use (Moderate). |
| Desk / remote workers | "Undo the stiffness and fatigue of sitting all day; feel more energetic." | Dutch Lifelines cohort (n=28,586): home workers more often sat >9 h per work day and had more upper-back and neck/shoulder/arm pain (OR 1.17 and 1.32), partly explained by sitting, not by less exercise (Moderate, observational). |
| Beginners | "Show me exactly what to do, safely, at my level." | Indirect: preparticipation-screening literature and affect research (sections 5–6). Fitness apps are now ACSM's #2 trend for 2025, up from #20 two years earlier (survey of ~2,000 professionals; trend, not user need) (Weak–Moderate). |

Context: about 1 in 5 US adults (21%) regularly wore a smartwatch or fitness tracker in 2019, higher
among higher-income households (31% vs 12%) (Pew; data is old). Cost and privacy are named reasons
for *not* downloading health apps (US survey via TechRadar; Weak). Morning Move's free, offline,
no-account design directly answers both.

**Implication for this app:** the user (23, laptop worker, wants general fitness) is in the busy +
desk-worker + home segments at once. Their jobs are: short sessions, relief for neck/back/hips,
more energy, and a habit that survives busy weeks.

---

## 3. Why people quit

| Reason | Evidence (strength) | Does Morning Move already address it? |
|---|---|---|
| Loss of motivation / interest, boredom | mHealth abandonment study (PMC8872344): amotivation and loss of interest were critical drivers, plus "trying other apps" (Moderate). Gartner via Finder: boredom the top stated reason (19%) for tracker abandonment (Weak). Chemnitz study (n=159): demotivation main cause (Weak, via blog). | Partly: daily seeded plan and shuffle give variety. Nothing reacts to the user's feelings or shows meaningful progress beyond counts. |
| Cost, paywalls, subscriptions | Same mHealth study: cost "crucial"; TechRadar survey: cost a top reason among the 46% who stopped (Weak). Review-mining blogs: subscription pricing/free-tier limits ~24% of negative reviews; complaints about hard-to-cancel subscriptions and ads mid-workout (Weak, vendor data). | Yes. Free, no ads. Say so clearly. |
| Privacy concerns | TechRadar survey; Chinese study (n=310): privacy weighed more than cost (Weak–Moderate). | Yes. No data leaves the device. |
| Life events / time pressure push it aside | Chemnitz study: "external factors" (Weak). Lack of time (section 2). | Partly: 5–30 min slider. No 2–3 minute option, no "minimum day". |
| Guilt after stopping; want to return | University of Washington study of 141 former Fitbit owners: half felt guilt; nearly all who left the device in a drawer were interested in using it again (Moderate). | No. A broken daily streak resets to 0 with no "welcome back". |
| Broken streak demotivates | Silverman & Barasch, Journal of Consumer Research 2023 (via news/Psychology Today): streaks motivate, but users whose streak breaks are less likely to keep going, and highlighting the break makes it worse (Moderate: experiments, read via secondary sources). | Risk: the app shows "🔥 0" and "day streak" as a headline stat. |
| Too hard / unpleasant | Affect research: pleasure during exercise predicts future exercise; pleasure falls as intensity rises above the ventilatory threshold; self-selected intensity tends to be both pleasant and effective (Moderate, mostly cross-sectional). | Partly: levels, adjustable work/rest. No feedback loop after a session. |
| Inaccurate data | Chemnitz study; review-mining blog (28% of negative reviews about tracking accuracy) (Weak). | Calories are labelled "est." Keep it that way; do not over-claim. |

Not well supported by what I found: "notification fatigue" and "injury fear" as top quit reasons.
They are plausible and appear in UX writing, but I did not find solid primary data. The often-quoted
"71% abandon by month three" and "77% lost in 3 days" figures have no traceable primary source; do not use them.

---

## 4. What helps people keep going

| Technique | Evidence (strength) | Notes for this app |
|---|---|---|
| **Flexible habits over perfect streaks** | Lally et al. (Eur J Soc Psychol, 2009/10, n=96): median ~66 days to automaticity (range 18–254); missing a single day did not reduce habit formation, but repeated misses had a cumulative cost (Moderate). | Daily-or-nothing streaks punish exactly the misses that do not matter. |
| **Weekly volume is what counts for health** | WHO 2020 guidelines: 150–300 min moderate or 75–150 min vigorous per week, muscle-strengthening on 2+ days, reduce sitting; "some physical activity is better than none" (Strong). JAMA Internal Medicine 2022 (n=350,978): "weekend warriors" (1–2 sessions/week) had mortality similar to regularly active people (Moderate, observational). | Supports a **weekly** target (days or minutes) rather than a daily streak. |
| **Streaks, done carefully** | Silverman & Barasch 2023: streaks motivate; breaks demotivate; don't highlight the break (Moderate). | Use "weeks in a row" with a weekly goal, and quietly show "welcome back" rather than a red zero. |
| **Implementation intentions ("if-then" plans: when/where)** | Gollwitzer & Sheeran 2006: 94 tests, d = 0.65 on goal attainment (Strong overall, not PA-specific). For physical activity, studies are fewer but "promising"; a 2022 meta-analysis in patients with chronic conditions found it works better combined with barrier planning (Moderate). | A one-tap "I'll do it after ___ at ___" plan plus a calendar (.ics) export is a cheap way to deliver this offline. |
| **Self-monitoring, goal setting, graded tasks, action planning** | Most common technique in PA apps is self-monitoring; in a 2022 meta-regression of CVD apps, action planning and graded tasks had medium positive associations with activity (Moderate). Apps include ~5 behaviour-change techniques on average (Moderate, descriptive). | The app already self-monitors (history). Add a goal and graded progression. |
| **Adaptive goals rather than static ones** | Review conclusion that adaptively tailored goals seem more effective than static generic goals; RCT (Nuijten et al. 2022) found personalised goals raised engagement (Moderate, outcome was engagement). Counterpoint: Conn et al. meta-analysis (358 studies) found generic interventions no worse than tailored, though only 10 tailored ones were included (Moderate). | Personalise lightly and transparently (suggest, don't silently change). Don't over-invest in "AI personalisation". |
| **Enjoyment / right intensity** | Pleasure during exercise predicts future exercise (Moderate). | A "how did it feel?" check is the simplest proxy for affect. |
| **Reminders and progress tracking** | GLL survey: 45% say reminders, progress tracking and goal tools help them stay focused (Weak). | PWA reminder options are limited (see Recommendations, R7). |
| **Exercise snacks / short bouts** | BJSM 2025 systematic review (11 RCTs, 414 inactive adults): exercise snacks improved cardiorespiratory fitness (g = 1.37, moderate certainty); adherence ~83%; no clear effect on strength, blood pressure, lipids (Moderate). A Frontiers review (22 studies) is more cautious after publication-bias adjustment (Moderate). | Short sessions have very high adherence. Good fit for a desk-break mode. |

---

## 5. The health problems of sitting all day, and what helps

| Problem | Evidence (strength) | What helps |
|---|---|---|
| Neck, shoulder and upper-back pain | Lifelines cohort: home workers more neck/shoulder/arm and upper-back pain, partly via more sitting (Moderate, observational). | VIMS trial (Andersen et al., BJSM 2012, n=447 office workers): specific strength training for neck/shoulder, and the total weekly time could be split as 1×60, 3×20 or 9×7 min (the authors: "some flexibility regarding time-wise distribution") (Moderate; effect sizes not read). Short, frequent sessions are fine. |
| Low back pain | Cochrane 2021 (Hayden et al., 249 trials): exercise probably reduces pain in chronic non-specific low back pain vs no treatment; advantage over other conservative care is small (Moderate). | General exercise, core and mobility work. No single "best" exercise. |
| Prolonged sitting and metabolic/mortality risk | REGARDS cohort (~8,000 adults 45+): breaking up sitting at least every 30 min associated with lowest mortality (Moderate, observational). UK Biobank (PLOS Med, n=91,292): each extra hour of sitting in 30+ min bouts linked to higher cancer mortality (Moderate, observational). Small trials: breaking sitting every 20–30 min with light walking or simple resistance moves lowers post-meal glucose in some groups (Weak–Moderate, small acute trials). WHO: evidence too weak to set a sitting threshold (Strong statement of uncertainty). | Get up and move briefly every 30–60 min. Honest framing: "likely helps", not a guaranteed effect. |
| Low fitness / low energy | WHO 2020: 150–300 min moderate/week + strength 2 days (Strong). Exercise snacks raise cardiorespiratory fitness (Moderate). Direct evidence on "energy" was not found in this search. | Morning session + 1–3 short breaks per workday. |
| Eye strain | Aston study (n=29): 20-20-20 break reminders reduced symptoms, but the effect faded a week after reminders stopped; a SUNY study (secondary source) found little support for the rule (Weak). | Optional "look into the distance" cue during desk breaks is harmless, but do not claim much. |
| Tight hip flexors / "posture" | No good evidence found in this search for "sitting shortens hip flexors" or that posture correction prevents pain. | Include hip-flexor and chest-opening stretches because they feel good and suit the user, but avoid medical claims. |

**Practical target for this user** (from WHO numbers): a 15-minute morning session 5 days a week is
75 minutes, of which only the work intervals are moderate-to-vigorous. The app alone will not reach
150 minutes, so the progress screen should count it honestly as "part of your week" and encourage
walking and breaks too. Don't imply the app covers the full guideline.

---

## 6. Safety and accessibility needs

- **Screening:** PAR-Q+ (Warburton et al., evidence-based revision of PAR-Q) is the standard self-check;
  ACSM's current algorithm (per secondary study guides) does not require medical clearance for an
  inactive, symptom-free adult without known heart/metabolic/kidney disease to start **light-to-moderate**
  exercise (Moderate; ACSM text not read directly). A 2024 preprint found only 3 of 7 PAR-Q+ questions
  were easily understood (Weak). **Implication:** a short, plain "check with a doctor if…" note at first
  run is proportionate; a full questionnaire is not.
- **Warm-up:** already built in (~15% of rounds in `buildPlan`).
- **Low impact:** jumping moves in the library: Jumping Jacks, High Knees, Butt Kicks, Squat Jumps,
  Burpees (all have `lift` > 0 in frames), plus Plank Jacks. Jumping is also a noise problem in flats,
  a real home-workout constraint. There is no way to exclude them today except choosing a gentle focus.
- **Modifications:** Knee Push-ups exist as an easier push-up; there is no in-workout "easier version"
  link or swap.
- **Pain:** the README warns "stop any exercise that causes pain", but this is not shown in the app at
  first run or during a session.
- **Data safety:** all history lives in `localStorage`. Safari can clear script-written storage after
  7 days without use for websites; WebKit says home-screen web apps have their own counter and first-party
  data should not be deleted there, though developers report edge cases (Moderate, WebKit statements in bug
  threads). A user's streak/history could vanish if they use it in a browser tab on iPhone. An export/backup
  option and `navigator.storage.persist()` reduce this risk.

---

## 7. Recommendations, ranked by impact ÷ effort

Effort: S = under a day, M = 1–3 days, L = more. Impact is for this user and similar users.

### R1. Weekly goal and a forgiving streak — **IMPLEMENT NOW** (Impact high, Effort S)
- **Problem:** one missed day turns "🔥 12" into "🔥 0"; broken streaks reduce later engagement, and
  the guilt-after-stopping pattern stops people coming back.
- **Evidence:** Lally (single misses don't hurt habit formation); Silverman & Barasch (broken streaks
  demotivate); WHO weekly targets; weekend-warrior cohort (weekly volume matters).
- **UX:**
  - Profile → "Your goal": segmented control `2 · 3 · 4 · 5 · 6 days a week` (default 4).
  - Home header pill changes from `🔥 12` to `3/4 this week` with a small ring; the existing 7-day row
    (`#week`) becomes Mon–Sun of the current week.
  - Stats: "Weeks in a row on goal" replaces "day streak" as the headline; keep day streak as a smaller
    secondary stat if wanted.
  - Done screen: "3 of 4 this week. One more and the week is done." / "Week complete! 5 weeks in a row."
  - After a gap: "Welcome back. Every bit counts." (no red zero, no "you lost your streak").
- **Implementation:** add `weeklyGoal: 4` to the `mm.settings` defaults in `js/app.js` (`store.get`
  merges, so old saves keep working). Add `weekStart(d)` and `weeksInARow()` next to `streak()`;
  count distinct `dayKey`s from `mm.history` per ISO week. Current (unfinished) week does not break the
  run. Update `renderStats()`, the `#streak` pill, and the `done-msg` text in `finish()`. No new storage key.
  Optional later: one "rest week" token per month.

### R2. "Quick break" 2–5 minute desk mode — **IMPLEMENT NOW** (Impact high, Effort S–M)
- **Problem:** the user sits all day; the shortest session is 5 min and "Desk relief" can pick floor
  (`mat: true`) moves like Cat-Cow, Child's Pose and Cobra that are impractical in work clothes at a desk.
- **Evidence:** exercise-snack review (fitness gains, ~83% adherence); breaking up sitting every 30 min
  (REGARDS, UK Biobank, small glucose trials); Lifelines (sitting partly explains neck/back pain);
  VIMS (short frequent sessions work for neck/shoulder pain).
- **UX:** a card on Home under Today's workout: "☕ Desk break · 3 min · no mat, no jumping"
  with a single Start button and `2 / 3 / 5 min` chips. Plan: 1 warm-up move → 3–6 standing mobility /
  light-strength moves (neck tilts, arm circles, torso twists, side bends, squats, calf raises, shoulder
  stretch, quad stretch, forward fold, deep breathing). Ends with "Look out of a window for 20 seconds"
  (low claim; optional). Done screen: "Break done. Back to it." Logged in history with `focus: 'break'`.
- **Implementation:** in `js/plan.js`, add `FOCUS.break = { name: 'Desk break', main: ['stretch','warmup','strength'], extra: [] }`
  or a separate `buildBreakPlan({minutes, seed})` that filters `!e.mat && !e.props && !isJump(e)` and
  skips the 4-round minimum and the cool-down split (`rounds = max(3, …)`). Start it via `startWorkout(plan)`
  which already accepts a plan. The 60-second-of-work rule in `finish()` lets a 2-min break count;
  decide whether breaks count toward the weekly goal (suggest: count minutes, not goal days). Later: add
  desk-specific exercises (R9).

### R3. "How did that feel?" after each workout — **IMPLEMENT NOW** (Impact medium-high, Effort S)
- **Problem:** sessions that are too hard feel bad and reduce return; too easy gets boring. The app
  never asks.
- **Evidence:** affect during exercise predicts future exercise; adaptive goals beat static goals in
  some trials; graded tasks associated with more activity (CVD app meta-regression). Personalisation
  evidence is mixed, so keep it as a suggestion the user accepts.
- **UX:** on the done screen, three buttons: `😮‍💨 Too hard · 🙂 Just right · 💪 Too easy`.
  If "too hard" twice in the last 3 sessions: "Want gentler sessions? [Rest 15 s] [Beginner] [Low impact]".
  If "too easy" 3 times at the same level: "Ready for more? [Work 30 s] [Intermediate]". Never change
  settings silently.
- **Implementation:** add optional `feel: -1 | 0 | 1` to the history entry pushed in `finish()` (old
  entries simply lack it). A small `suggestAdjust(history, settings)` helper in `js/app.js` returns a
  suggestion; buttons call the existing `save(); renderSettings(); rebuild();`. Because the entry is
  already saved before the buttons appear, update `history[history.length - 1].feel` and re-save.

### R4. Low-impact / quiet mode toggle — **IMPLEMENT NOW** (Impact medium, Effort S)
- **Problem:** jumping is hard on joints for beginners and heavier users, and noisy in flats.
- **Evidence:** safety guidance for beginners (light-to-moderate start), affect research (lower
  intensity is more pleasant); home-workout context (Weak but common sense).
- **UX:** a toggle on Home next to level: "🔇 No jumping". Plan list shows a small "low impact" note.
  In the library, jumping moves get a "jump" tag.
- **Implementation:** in `js/exercises.js` either add `impact: 'high'` to Jumping Jacks, High Knees,
  Butt Kicks, Squat Jumps, Burpees, Plank Jacks, or compute `isJump = ex.frames.some(f => f.lift > 0)`
  (catches the first five; mark Plank Jacks explicitly). In `buildPlan` extend `ok(e)` with
  `&& !(lowImpact && isJump(e))`. Store `lowImpact: false` in `mm.settings`. Cardio focus then relies on
  March in Place, Standing Knee to Elbow, Twisters, Mountain Climbers; check the pool is not too small
  and fall back to strength moves if it is.

### R5. Short first-run setup with a safety note — **IMPLEMENT NOW** (Impact medium-high, Effort M)
- **Problem:** new users see a 15-minute full-body Beginner plan whatever their goal; the
  pain/safety warning lives only in the README.
- **Evidence:** proportionate screening (PAR-Q+ / ACSM: light-moderate start is fine for healthy adults);
  implementation intentions (d ≈ 0.65 overall); goal setting is a common, useful technique; adaptive
  goals help engagement.
- **UX:** shown once, 3 screens, every one skippable ("Skip, use defaults"):
  1. "What do you want most?" `Feel less stiff from sitting` → focus `desk` / `Get fitter and more energetic` → `full` / `Calm and flexible` → `yoga` / `Stronger core and back` → `core`.
  2. "How many days a week is realistic?" `2–6` (sets R1 goal) and "When?" `After waking / Before work / Lunch / Evening` (used for the R7 reminder text and the .ics).
  3. "Your level" Beginner/Intermediate/Advanced + "No jumping" (R4) + height/weight (optional; sizes the trainer).
  Safety card (one line + "Got it"): "Check with a doctor first if you have a heart condition, chest pain, dizziness, or an injury. Stop any move that hurts; mild effort is fine, sharp pain is not."
- **Implementation:** a new hidden section in `index.html` (like `#done`) and a `renderOnboarding()`
  in `js/app.js`; show it when `localStorage['mm.settings']` is absent (first run). Write into existing
  `mm.settings` / `mm.profile` plus new `onboarded: true`, `weeklyGoal`, `lowImpact`, `when`. Existing
  users never see it (their `mm.settings` exists). Keep the "Pain areas" question out of v1 (see R8).

### R6. Progress you can feel: weekly summary and milestones (Impact medium, Effort S–M)
- **Problem:** "no visible progress" and boredom; current stats are lifetime totals only.
- **Evidence:** self-monitoring and feedback are core behaviour-change techniques (Moderate); WHO
  weekly targets give a meaningful yardstick (Strong).
- **UX:** Profile → "This week": active minutes (work time only) vs a personal target, sessions by
  focus, plus a simple 8-week bar row. Milestones on the done screen: 1st, 5th, 10th, 25th, 50th,
  100th workout; first full week on goal; 4 weeks in a row. Copy is factual ("10 workouts, 2 h 30 min
  moving"), no badges wall.
- **Implementation:** derive everything from `mm.history` (`secs`, `focus`, `date`). Note `secs`
  includes rest; to show active minutes honestly, add optional `work` seconds to new history entries in
  `finish()` (`workSecs` is already computed there).

### R7. Reminders that work without a server (Impact medium, Effort S for .ics, M for in-app)
- **Problem:** forgetting; no cues. PWAs cannot schedule local notifications reliably: the Chrome
  Notification Triggers API never shipped beyond an origin trial, and Web Push needs a server (ruled out).
- **Evidence:** implementation intentions; 45% say reminders help (Weak survey).
- **UX (feasible pieces):**
  - "📅 Add to my calendar": downloads an `.ics` with a weekly recurring event (`RRULE:FREQ=WEEKLY;BYDAY=…`)
    at the chosen time, title "Morning Move – 15 min", URL to the app. The phone's calendar does the reminding,
    fully offline and private. Works on iOS and Android.
  - While the app is open (e.g. on the laptop during work): optional "Remind me to take a desk break every
    45 min" → in-page banner plus a `Notification` (permission asked only when the user enables it).
    Only works while the tab/app is open; say so in the UI.
- **Implementation:** a tiny `.ics` builder in `js/app.js` (Blob + `a.download`); in the claude.ai
  preview downloads may be limited, so test in the real PWA. Break timer: `setInterval` + `document.visibilityState`;
  settings `breakEvery: 0|30|45|60`.

### R8. Pain/sensitive areas to avoid (Impact medium for affected users, Effort M–L)
- **Problem:** users with sore wrists, knees or lower back hit moves that aggravate them and quit.
- **Evidence:** low back pain: exercise helps overall (Cochrane), so avoid blanket exclusion of core
  work; but per-move comfort matters for adherence (affect research). No direct app evidence found.
- **UX:** Profile → "Go easy on: Wrists · Knees · Lower back · Neck". The planner swaps out moves that load
  those areas (e.g. wrists: push-ups, planks on hands, mountain climbers; knees: lunges, squat jumps; neck: crunches).
  Always with the note "If something hurts, skip it with ⏭ and tell a professional if pain persists."
- **Implementation:** needs a new `loads: ['wrists', …]` field on each of the 59 exercises in
  `js/exercises.js` (judgement per move, ideally sourced in `docs/EXERCISE-TECHNIQUE.md`), then a filter
  in `buildPlan`. This is the main cost. Do after R5 so onboarding can ask it.

### R9. Desk-specific moves for neck, upper back, chest and hip flexors (Impact medium-high, Effort L)
- **Problem:** the library lacks the moves most relevant to laptop workers: chin tucks, scapular
  squeezes / "W" retractions, doorway or hands-behind chest opener, thoracic extension, kneeling or standing
  hip-flexor stretch, wrist flexor/extensor stretches, seated versions for the office.
- **Evidence:** VIMS (specific neck/shoulder strength training helps office workers' pain); Lifelines.
  Hip-flexor/posture claims are weakly supported, so frame as comfort, not cure.
- **Implementation:** each is a new entry in `EXERCISES` with keyframes, `on`, `muscles`, technique
  source, a passing `node tools/check-poses.mjs`, and a visual check. Several need new muscle ids or
  chair support (no chair prop or `on: 'seat'` on a chair exists; seated moves would need a chair prop like
  the dumbbells). High value but the slowest item. Start with 3–4 standing ones (chin tuck, standing hip-flexor
  stretch in split stance, scapular squeeze, wrist stretches).

### R10. Backup and restore of progress (Impact medium, Effort S)
- **Problem:** all history is in `localStorage`; clearing site data, switching phone, or Safari's
  storage rules can wipe it, and losing history feels like losing a streak.
- **Evidence:** WebKit 7-day storage cap for Safari websites (home-screen apps exempt by WebKit's statement,
  with reported edge cases).
- **UX:** Profile → "Your data": `Download backup` (JSON file) / `Restore from file`. One line: "Your data
  only lives on this device."
- **Implementation:** serialize `mm.settings`, `mm.profile`, `mm.history`; restore validates shape and merges
  history by `date`. Also call `navigator.storage?.persist?.()` once after the first saved workout.

### R11. Rest and recovery cues (Impact low-medium, Effort S)
- **Problem:** beginners overdo it or feel guilty on rest days.
- **Evidence:** WHO muscle-strengthening on 2+ days per week (not daily); weekly-volume findings. Direct
  evidence on in-app rest-day prompts not found.
- **UX:** if the user did a strength-heavy plan yesterday and today's plan is also strength-heavy, show
  "Yesterday was strength. Today's suggestion: Yoga or Desk relief" with a one-tap switch. When the weekly goal
  is met: "Goal met. Extra sessions are a bonus; rest is fine too."
- **Implementation:** history already stores `focus`; a rule in `rebuild()` that sets a suggestion banner
  (do not change `settings.focus` automatically).

### R12. In-workout "easier version" swap (Impact medium, Effort M)
- **Problem:** a single move that is too hard (e.g. push-ups) ruins the session.
- **UX:** during work, a small "Easier" button for moves with a known regression (Push-ups → Knee Push-ups,
  Squat Jumps → Squats, Burpees → Squats, Lunges → Squat Hold, Leg Raises → Dead Bug).
- **Implementation:** `easier: 'knee-pushups'` field in `js/exercises.js`; the player swaps
  `session.plan.items[i].ex` and calls `stage.play`. Combine with R3 data.

### Evaluated and not recommended now
- **Social features, leaderboards:** need a backend; conflict with privacy stance.
- **Automatic difficulty changes:** mixed personalisation evidence; silent changes erode trust. Use R3 suggestions.
- **Full PAR-Q+ questionnaire:** disproportionate for a light-to-moderate home app; comprehension problems reported.
- **Calorie targets / weight-loss framing:** not the user's goal; calorie estimates are rough.
- **Daily push notifications:** not feasible without a server; the .ics route (R7) covers the need.

### Ranking table

| Rank | Recommendation | Impact | Effort | Status |
|---|---|---|---|---|
| 1 | R1 Weekly goal + forgiving streak | High | S | **Implement now** |
| 2 | R2 Desk break 2–5 min | High | S–M | **Implement now** |
| 3 | R3 How did that feel? | Med-High | S | **Implement now** |
| 4 | R4 Low-impact / no-jumping toggle | Medium | S | **Implement now** |
| 5 | R5 First-run setup + safety note | Med-High | M | **Implement now** |
| 6 | R10 Backup / restore | Medium | S | Next |
| 7 | R7 Calendar .ics + in-app break reminder | Medium | S–M | Next |
| 8 | R6 Weekly summary + milestones | Medium | S–M | Next |
| 9 | R11 Rest/recovery suggestion | Low-Med | S | Later |
| 10 | R12 Easier-version swap | Medium | M | Later |
| 11 | R8 Areas to go easy on | Medium | M–L | Later |
| 12 | R9 Desk-specific exercises | Med-High | L | Later (high value, slow) |

Release notes for whoever implements: bump `CACHE` in `sw.js` and keep `mm.*` keys backward-compatible
(all new fields are optional additions to existing objects; no new keys are required except possibly
an onboarding flag inside `mm.settings`).

---

## 8. Sources

Guidelines and large studies
- WHO 2020 guidelines on physical activity and sedentary behaviour (Bull et al., BJSM): https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7719906/
- Weekend warrior vs regularly active, JAMA Internal Medicine 2022: https://pubmed.ncbi.nlm.nih.gov/35788615/ and https://read.qxmd.com/doi/10.1001/jamainternmed.2022.2488
- Cochrane review, exercise therapy for chronic low back pain (2021): https://cochranelibrary.com/cdsr/doi/10.1002/14651858.CD009790.pub2/information and https://pmc.ncbi.nlm.nih.gov/articles/PMC8477273
- Working from home, sitting and musculoskeletal pain (Lifelines, Frontiers in Public Health 2022): https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9757165/
- 2025 ACSM Worldwide Fitness Trends: https://acsm.org/top-fitness-trends-2025/ and https://www.newswise.com/articles/acsm-announces-worldwide-fitness-trends-for-2025
- Pew Research, smartwatch/fitness tracker use (2020): https://www.pewresearch.org/short-reads/2020/01/09/about-one-in-five-americans-use-a-smart-watch-or-fitness-tracker/

Exercise snacks and breaking up sitting
- BJSM blog on the 2025 exercise-snacks systematic review: https://blogs.bmj.com/bjsm/2025/10/24/exercise-snacks-small-bouts-big-benefits/
- HealthDay summary: https://www.healthday.com/healthpro-news/general-health/brief-bouts-of-exercise-improve-cardiorespiratory-fitness
- Prolonged sitting and cancer mortality (UK Biobank, via news): https://www.outlookindia.com/healthcare-spotlight/prolonged-sitting-linked-to-higher-cancer-risk-light-activity-may-lower-mortality-study-finds
- Breaking sitting, REGARDS summary: https://www.unm.edu/~lkravitz/Article%20folder/move3forevery30.html
- Breaking sitting and glucose (thesis): https://bura.brunel.ac.uk/bitstream/2438/24034/3/FullText.pdf
- VIMS trial protocol (office workers, neck/shoulder strength training): https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2921353/ ; results: https://pmc.ncbi.nlm.nih.gov/articles/PMC3596862
- 20-20-20 rule, Aston study: https://research.aston.ac.uk/en/publications/the-effects-of-breaks-on-digital-eye-strain-dry-eye-and-binocular/ ; skeptical summary: https://www.insightnews.com.au/does-the-20-20-20-rule-work-for-digital-eye-strain/

Adherence, habits, behaviour change
- Habit formation (Lally et al.), BPS Research Digest summary: https://bps.org.uk/research-digest/seven-ways-be-good-1-learn-healthier-habits ; https://www.spring.org.uk/2023/01/form-a-habit.php
- Streaks research (Silverman & Barasch): https://www.psychologytoday.com/us/blog/ulterior-motives/202306/how-broken-streaks-sap-motivation ; https://lerner.udel.edu/seeing-opportunity/lerner-professor-researches-how-streaks-motivate-us/ ; https://www.newswise.com/articles/research-explains-why-streaks-make-resolutions-stick
- Implementation intentions (Gollwitzer & Oettingen): https://www.socmot.uni-konstanz.de/sites/default/files/gollwitzer_oettingen_2013-Implementation_Intentions.pdf ; PA meta-analysis 2022: https://frontiersin.org/journals/public-health/articles/10.3389/fpubh.2022.721223/full ; https://link.springer.com/article/10.1186/1479-5868-6-11
- Behaviour change techniques in CVD PA apps (meta-regression): https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9261070/
- Content analysis of PA apps: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4132213/
- Adaptive personalised goal setting RCT: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9015741/
- Personalised mobile technologies meta-analysis: https://pubmed.ncbi.nlm.nih.gov/33774008/
- Affect and exercise adherence: https://pmc.ncbi.nlm.nih.gov/articles/PMC4182279 ; https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2025.1533785/pdf

Why people use and quit apps
- mHealth app abandonment drivers: https://pmc.ncbi.nlm.nih.gov/articles/PMC8872344
- Fitness app continuance (EMAC 2025): https://proceedings.emac-online.org/pdfs/A2025-123435.pdf
- Former Fitbit users (UW study, news): https://m.startribune.com/why-people-quit-their-fitbits/393122361/
- Tracker abandonment reasons: https://the5krunner.com/2022/10/13/sport-tracker-watches-reasons-abandonment/ ; https://www.finder.com.au/why-we-get-bored-with-fitness-trackers-and-smartwatches
- Health app survey (cost, privacy): https://www.techradar.com/news/phone-and-communications/mobile-phones/lots-of-people-download-health-apps-but-here-s-why-many-stop-using-them-1308267
- UTAUT2 fitness-app study: https://innovationcenter.msu.edu/wp-content/uploads/2021/07/Keep-Using-My-Health-Apps-Discover-Users-Perception-of-Health-and-Fitness-Apps-with-the-UTAUT2-Model.pdf
- GLL survey (home vs gym, reminders): https://www.thepost.uk.com/news/new-research-shows-rising-demand-for-fitness-apps-in-region-867920
- Weight-tracking app reviews (JMIR mHealth 2017): https://mhealth.jmir.org/2017/12/e203/PDF
- App review analysis (vendor blog, weak): https://unstar.app/blog/health-fitness-app-reviews-what-users-really-want-2026
- Lack of time as barrier: https://acquire.cqu.edu.au/articles/journal_contribution/A_test_of_how_Australian_adults_allocate_time_for_physical_activity/13396235 ; https://programme.exordo.com/icuh2016/delegates/presentation/421/

Safety and platform
- PAR-Q+ background: https://hfjc.library.ubc.ca/index.php/HFJC/article/view/103 ; https://pmc.ncbi.nlm.nih.gov/articles/PMC3596208 ; rapid review: https://www.medrxiv.org/content/10.1101/2025.09.19.25336065.full.pdf
- ACSM screening (study guide, secondary): https://open-exam-prep.com/study-guides/ace-cpt/health-screening/preparticipation-health-screening
- Notification Triggers API status: https://developer.chrome.com/docs/web-platform/notification-triggers
- Safari 7-day storage cap and home-screen apps: https://bugs.webkit.org/show_bug.cgi?id=237350 ; https://searchengineland.com/what-safaris-7-day-cap-on-script-writeable-storage-means-for-pwa-developers-332519
