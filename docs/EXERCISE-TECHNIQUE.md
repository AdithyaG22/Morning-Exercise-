# Exercise technique reference

How each exercise in Morning Move is done correctly, with sources, compared against the app's
poses. Use this when adding or changing an exercise, alongside [EXERCISES.md](EXERCISES.md)
(the joint-angle system and the pose checker).

**How this was compiled.** Three research passes covered all 59 exercises. Sources are mainly the
ACE exercise library (acefitness.org), plus NASM, Mayo Clinic, Yoga Journal, Physitrack and others.
The research ran in a sandbox where web search worked but opening pages did not, so each technique
note is based on the search engine's excerpts of the cited page, not the full article. Every URL
is a real page returned by search. Notes marked "(own knowledge)" or "(no source reached)" are
standard technique without a direct excerpt.

**Status of the "App check" notes.** Each section's *App check* describes the app **before**
these fixes. All the mismatches listed below have since been fixed in `js/exercises.js`, and every
keyframe passes `node tools/check-poses.mjs`:

- **Warm-up / cardio:** arm swings (full circles), arm circles (true circles, forward then
  backward), hip circles (trunk moves against the hips, feet planted), standing knee-to-elbow
  (hands behind the head), march (knees to hip height), squat jumps (arms swing back, soft landing),
  high knees and butt kicks (standing foot on the floor), cross toe touch (soft knees).
- **Strength:** dumbbell rows (vertical forearm at the top), superman (no lower-back arch),
  glute bridge (shoulders–hips–knees line), tricep kickbacks (torso near parallel), bicep curls
  (elbows at the sides), calf raises (pause at the top, slow lowering), diamond push-ups (hands
  under the chest).
- **Core / yoga:** crunches and knee touches (shoulder blades lift, not the lower back), Russian
  twists (≈45° lean), knee-to-elbow plank (knee comes out to the side), side plank (head in line),
  cat-cow (real "cow" arch, wrists under shoulders), cobra (true low cobra), Warrior II (front
  knee ≈90°), triangle (more tilt from the hips, arms in one vertical line).

Two suggestions were applied only partly, because the 3D body has limits:
- **Triangle:** tilts 24° from the hips rather than 40–50°. A larger tilt with straight legs would need
  more hip abduction than the normal range allows in this rig.
- **Knee-to-elbow plank:** the knee reaches about 30 cm from the elbow, not touching it.

---

## Morning Move: technique research, batch 1

**Web access:** WebSearch worked. WebFetch and direct HTTPS were **blocked** (`getaddrinfo ENOTFOUND` / proxy `403 CONNECT` for acefitness.org, nasm.org and nhs.uk). The URLs below are pages that WebSearch returned and summarised or excerpted. I could not open them in full. ACE has library entries for squat jumps, mountain climbers, burpee and standing hip abduction, but search returned only part of each one's text. Anything not backed by a search excerpt is marked "(own knowledge)".

**How the rig works (from `js/avatar.js` `applyPose`).** The shoulder uses Euler order `'XZY'`, so `direction = Rx(-shF) · Rz(shAbd) · Ry(shRot) · down`. Abduction is applied first. Flexion is then applied about the body's left-right axis. This has two effects:
- When the arm is straight out to the side (shAbd ≈ 90), changing `shF` only spins the arm about its own axis. The hand does not move.
- A closed circle with straight arms around the side-to-side axis can only be keyframed by sweeping `shF` through a full 0→360°. The ROM table in `tools/motion.js` allows shF −60…180. `lerpPose` interpolates linearly, so it would take the wrong way round on the 270→0 loop. Both points matter for `arm-circles` and `arm-swings` below.

Also: `x`/`z` move the whole pelvis, legs included, so the feet slide with it.

---

### March in Place (`march`)
**How to do it**
1. Stand tall with feet hip-width apart and arms relaxed, elbows bent about 90°.
2. Lift one knee to about hip height (moderate tempo). Keep the torso upright and don't lean back.
3. Swing the opposite arm forward and the same-side arm back.
4. Set the foot down softly and alternate legs. Knees track straight ahead.

**Key positions:** lifted leg hipF 70–90, knee 80–90, ankle ~10. Stance leg straight. Forward arm shF 30–45, back arm shF −20 to −30, elbow ~90. Spine neutral.

**Sources:** https://getfitcraft.com/exercises/marching-in-place ; https://uofmhealth.org/health-library/zm2304 ; https://melioguide.com/osteoporosis-exercises/marching-in-place-exercise/

**App check:** Mostly matches. One mismatch: the tip says "lift your knees to **hip height**" but `hipF_L/R: 70`, which puts the thigh about 20° below horizontal. Set hipF to 85–90 with knee 85–90, or change the tip to "lift your knees toward hip height".

---

### Arm Circles (`arm-circles`)
**How to do it**
1. Stand with feet shoulder-width apart. Raise straight arms out to the sides at shoulder height (T shape), palms down or forward.
2. Draw small circles with the hands, about 15–30 cm across, and make them gradually larger.
3. After 10–15 circles (or about 30 s) forward, reverse to backward circles.
4. Keep the elbows straight, the core braced and the torso still. Don't shrug.

**Key positions:** whole arm about the shoulder. The arm direction moves on a cone around the horizontal-lateral axis with a half-angle of about 10–20° for small circles, growing to 30–40°. The arm passes in turn through:
- below horizontal: shAbd ≈ 75
- in front: arm out to the side but angled ~15° forward
- above horizontal: shAbd ≈ 105
- behind: ~15° behind the frontal plane

elbow 0.

**Sources:** https://www.thegymgroup.com/exercises/stretching-and-warmups-exercises/how-to-do-arm-circles ; https://motra.com/exercises/armCircles ; https://specialolympicspa.org/media/attachments/2023/09/19/arm_circles.pdf ; ACE beginner at-home guide (arm circles "both directions"): https://www.acefitness.org/resources/everyone/blog/7855/a-guide-to-at-home-workouts-for-beginners/

**App check: MISMATCH (significant).**
- Frames are `(shAbd, shF)` = (104,0) → (90,14) → (76,0) → (90,−14). Under this rig the shAbd-90 frames point the arm straight out sideways regardless of shF (see the rig note). The arm just **flaps up and down ±14°** and never travels forward or backward. There is no circle.
- There is no direction reversal and no growth from small to large.

Suggested fix:
- Hold `shAbd: 75` (≈15° circle radius) and sweep `shF` 0 → 90 → 180 → 270 → 360. Under XZY that traces:

  | shF | arm position |
  |---|---|
  | 0 | 15° below horizontal |
  | 90 | 15° forward |
  | 180 | 15° above |
  | 270 | 15° behind |

  That is a forward circle; reverse the order for backward.
- This needs code support: allow `shF` outside −60…180 for this exercise and loop without lerping back from 360 to 0. For example, mark the exercise `continuous: ['shF']` and wrap modulo 360.
- An alternative is to add a horizontal-abduction key to the rig.
- For the "grow larger" cue, optionally use shAbd 80 for the first half and 65 for the second.
- Reverse direction halfway, for example with a `sides`-style mirror of the frame order.

---

### Arm Swings (`arm-swings`)
**What "arm swings" usually means:** sources use the name for three different drills:
- **Horizontal open/cross "hug" swings:** arms in a T, cross them in front, then swing them back as far as possible. This is what the app does now. Sources: JMU dynamic flexibility handout and the caliverse search summary.
- **Sagittal/overhead swings:** both arms swing continuously overhead, then forward, down and back. Source: brianmac.co.uk.
- **Full arm circles or "windmills":** the forward/backward circles in the ACE warm-ups, plus Physitrack's large single-arm shoulder circle.

There is no single standard. The user wants the **full-rotation version**, which is the big-circle (windmill) swing. Its precise form:

**How to do it (full-rotation version)**
1. Stand tall with feet shoulder-width apart, knees soft and core braced. Arms hang straight at the sides.
2. **Both arms together, in phase** (mirror images). Swing them forward and up past shoulder height to straight overhead, close to the ears.
3. Keep going back behind the head and down behind the body. Let the arms drift slightly out to the sides on the back half so the shoulders stay comfortable. Arrive back at the sides. That is one **forward** circle.
4. Keep the elbows straight but not locked. Move the arms only, with no torso sway or arching of the lower back.
5. Tempo: smooth, about 1–1.5 s per full circle. Start with a few smaller circles if stiff, then use full range.
6. Do about 10 forward, then reverse to **backward** circles (down → back → overhead → forward → down) for about 10.

An alternating backstroke/freestyle version, with one arm half a cycle behind the other, exists. It is a harder coordination drill and less common in beginner warm-ups (own knowledge).

**Key positions (world description → this rig's keys, both arms):**

| Frame | Arm position | Keys |
|---|---|---|
| 1 | Down at side | `shF: 0, shAbd: 12, elbow: 5` |
| 2 | Forward, horizontal | `shF: 90, shAbd: 12, elbow: 5` |
| 3 | Overhead, by the ears | `shF: 180, shAbd: 18, elbow: 5` |
| 4 | Back half: horizontal, out to the side and ~30° behind the frontal plane | `shF: 270, shAbd: 60, elbow: 5` |
| 5 | Back to frame 1 | `shF: 360` ≡ 0 |

- A 45° tween at frame 3.5 is (shF 225, shAbd 40), which points up, out and back.
- Optional slight spine extension at overhead: `spineF: -5`, `neckF: -5`.
- Backward circles: the same frames in reverse order.

**Sources:** https://educ.jmu.edu/~strength/JMU_Summer_2000_WebPage/JMU_Summer_2000_Sections/9_summer_dynamic_flexibilty.htm ; https://www.brianmac.co.uk/articles/scni8a2.htm ; https://nz.physitrack.com/home-exercise-video/shoulder-circles ; https://www.acefitness.org/resources/everyone/blog/7855/a-guide-to-at-home-workouts-for-beginners/ (search summary: "arms moving in wide circles, forward and backward")

**App check: MISMATCH (per user requirement).**
- The current frames, (shAbd 85, shF 10) ↔ (shF 90, shAbd −25), give a horizontal open/cross swing. Under this rig the arc also sags about 35° below horizontal mid-swing.
- Replace them with the full-circle frames above, forward for the first half of the set and reverse for the second.
- Update the tip, for example: "Swing both straight arms in big circles: forward, up past your ears, back and down. Reverse halfway."
- Same code caveat as Arm Circles: `shF` must sweep past 180 to 360 and wrap without lerping backward. The ROM check needs an exemption, or a horizontal-abduction key needs adding.
- cycle 1.4 s is fine. 1.5–2 s reads better at full range.

---

### Neck Tilts (`neck-tilt`)
**How to do it**
1. Sit or stand tall with shoulders relaxed and down, looking straight ahead.
2. Slowly tip one ear toward the same-side shoulder. Don't lift the shoulder or rotate the head.
3. Hold briefly or move slowly, return to center, then go to the other side.

**Key positions:** neckSide ±30–40 (normal ROM ~45). neckF 0, neckTurn 0. Shoulders neutral.

**Sources:** https://uhs.berkeley.edu/sites/default/files/ergo-neckstretch.pdf ; https://commonspirit.org/conditions-treatments/neck-stretch-to-the-side-upper-trap-stretch ; https://stcloudorthopedics.com/?p=3318

**App check:** Matches (neckSide ±32, through neutral, 5 s cycle).

---

### Hip Circles (`hip-circles`)
**How to do it**
1. Stand with feet hip- to shoulder-width apart, knees softly bent, hands on hips.
2. Move the pelvis in a slow continuous circle: to one side, forward, to the other side, back.
3. The hips lead. Keep the feet planted and the upper body as still as possible, with shoulders roughly over the feet.
4. Do 5–15 circles, then reverse direction.

**Key positions:** pelvis shift ±5–8 cm. Trunk counter-leans slightly opposite the hip shift (spineSide ∓5–10) so the head stays centered. Forward shift comes with a slight posterior tilt; backward shift with a slight hip hinge. Knees 5–10.

**Sources:** https://www.caliverse.app/exercises/hip-circles-261 ; https://fitbod.me/exercises/standing-hip-circle ; https://hrs.byu.edu/stretching/warmups

**App check: MISMATCH (moderate).**
- Frame 1 has `x: 0.06` (hips to the avatar's left, since +x = left) with `spineSide: 8` (lean left). Frame 3 mirrors it. The trunk leans the **same** way the hips move, so the whole body sways sideways instead of the hips circling under a still torso. Use `spineSide: -8` at `x: 0.06` and `+8` at `x: -0.06`.
- `x`/`z` move the pelvis and the legs with it, so the feet slide about 6 cm. To keep the feet planted, counter-angle the legs:
  - At `x: +0.06`: about `hipAbd_L: 6, hipAbd_R: 14`.
  - At `z: +0.05`: about `hipF: -3`, plus the existing pitch.
- Add `knee: 8`.
- Optionally reverse direction halfway.

---

### Torso Twists (`torso-twist`)
**How to do it**
1. Stand with feet shoulder-width or wider and knees slightly bent. Arms at chest height: elbows bent and loose, or hands together in front.
2. Rotate the upper body to one side. Keep the hips and knees facing forward as much as possible, and let the head follow.
3. Rotate smoothly through center to the other side. Keep the spine tall, with no side lean or forward bend.

**Key positions:** spineTwist ±35–45. neckTurn ±10–20 in the same direction. Pelvis and yaw 0. Arms about shAbd 70–80, elbow 90–120 (forearms in front of the chest). Knees 5–10.

**Sources:** https://www.physitrack.com/exercise-library/how-to-perform-the-torso-twist-exercise ; https://www.pdx.edu/recreation/sites/g/files/znldhr2076/files/2020-12/Week%202%20Mobility%20Routine.pdf ; https://hrs.byu.edu/stretching/warmups

**App check:** Matches. spineTwist ±45 is at the ROM ceiling; ±40 would look less forced. Optional `knee: 5`.

---

### Standing Side Bends (`side-bend`)
**How to do it**
1. Stand with feet about shoulder-width apart.
2. Raise one arm overhead.
3. Bend sideways at the waist toward the opposite side, reaching up and over. The other hand slides down the thigh.
4. Stay in the frontal plane: no twisting and no leaning forward or back.
5. Return to upright and switch sides.

**Key positions:** spineSide ±25–35 (toward the side opposite the raised arm). Raised arm shAbd 160–180, elbow 0–15. Other arm shAbd 5–15. Hips may shift slightly away from the bend. spineF 0, spineTwist 0.

**Sources:** https://www.columbiadoctors.org/health-library/multimedia/side-stretch/ ; https://motra.com/exercises/standingSideBendStretch ; https://us.physitrack.com/home-exercise-video/standing-side-stretch

**App check:** Matches. spineSide +32 (left) goes with `shAbd_R: 165` (right arm up), which is correct.

---

### Mountain Reach (`tadasana-reach`)
**How to do it**
1. Stand in Tadasana: feet together or hip-width, weight even, arms at the sides.
2. Inhale and sweep the arms out to the sides and up overhead, alongside the ears. Keep the shoulders down away from the ears.
3. Optional variation: rise onto the balls of the feet at the top. This is not part of classic Urdhva Hastasana, but the app's tip includes it (own knowledge).
4. Exhale and lower the arms (and heels).

**Key positions:** shAbd 165–180, elbow 0–5. Optional slight upward gaze (neckF −5 to −10). If rising: ankle 20–30 plantarflexion. Spine neutral.

**Sources:** https://www.yogajournal.com/practice/5-steps-master-upward-salute-urdhva-hastasana ; https://www.brettlarkin.com/upward-salute-pose-urdhva-hastasana/ ; https://lessons.com/yoga-classes/yoga-poses/upward-salute-pose

**App check:** Matches (shAbd 172, ankle 25 on toes, neckF −10).

---

### Side Leg Raises (`side-leg-raise`)
**How to do it**
1. Stand tall with hands on hips (or a hand on a wall/chair for balance).
2. Keep the leg straight and the toes pointing forward. Lift it out to the side to about 30–45°.
3. Don't lean the trunk toward the standing leg, and don't rotate the toes up.
4. Lower with control and alternate sides.

**Key positions:** moving leg hipAbd 30–45, knee 0, hipRot 0. Stance leg hipAbd ~0. Trunk lean ≤5°. ACE notes the thigh itself can only abduct about 45° before the pelvis tilts.

**Sources:** https://www.acefitness.org/resources/everyone/exercise-library/155/standing-hip-abduction/ (metadata only reached) ; https://www.acefitness.org/resources/everyone/exercise-library/38/side-lying-hip-abduction/ (the "≈45°" note)

**App check:** Matches (hipAbd 40, roll ±4 weight shift, hands on hips).

---

### Cross Toe Touch (`cross-toe-touch`)
**How to do it** (windmill toe touch)
1. Stand with feet wider than shoulder-width, knees slightly bent, arms out at shoulder height (T).
2. Hinge at the hips and rotate the trunk. Reach one hand down to the **opposite** foot, while the other arm reaches up toward the ceiling, so both arms stay roughly in one line.
3. Return to upright with arms in the T, then repeat to the other side. About 10 per side.

**Key positions:** stance hipAbd 15–20. Hinge: hipF 80–100 relative to the trunk. spineF 30–40, spineTwist ±30–40. Bottom arm reaches the toes. Top arm points up, roughly shAbd 90 in the twisted trunk. **Knees 10–20 (soft)**.

**Sources:** https://www.trngcmd.marines.mil/Portals/207/Docs/SOI-W/MCIC/FY24_Training%20Updates/Dynamic_Warm-Up_And_Stretching_Cards_002.pdf ; https://sites.udel.edu/sussexconnection/files/2015/11/Updated-Poses-1.pdf ; https://resources.specialolympics.org/sports-essentials/sports-and-coaching/warm-up-and-cool-down-videos/dynamic-warm-up-windmill-toe-touches

**App check:** Matches overall: T start, opposite hand to toe via the touch constraint, twist ±33.6, other arm up. Minor: `knee: 0`. Sources say knees slightly bent, so use `knee: 10–15`. Re-run check-poses afterwards, because the touch distance will change.

---

### Jumping Jacks (`jumping-jacks`)
**How to do it**
1. Stand with feet together and arms at the sides.
2. Jump. The feet land wider than the hips (about shoulder-width or slightly more), and the straight arms sweep out to the sides and overhead, almost clapping.
3. Jump back to feet together with arms down.
4. Land softly on the balls of the feet with knees slightly bent.

**Key positions:** arms shAbd 10 → 170–180, elbow 0–5. Legs hipAbd ~3 → 15–20 each. Ankle 20–30 in the air. Knee 5–15 on landing.

**Sources:** https://healthanswers.pfizer.com/physical-activity/aerobic/how-to-do-jumping-jacks ; https://www.nasm.org/resource-center/exercise-library/jumping-jacks (search summary only) ; https://www.acefitness.org/resources/everyone/blog/5430/rev-up-your-cardio-with-this-15-minute-drill/

**App check:** Matches. Optional: add `knee: 8` on the two ground frames to show the soft landing.

---

### High Knees (`high-knees`)
**How to do it**
1. Feet hip-width apart, chest up, core tight.
2. Run in place, driving each knee up to hip height or slightly above (thigh parallel to the floor).
3. Pump the opposite arm with elbows about 90°. The forward hand reaches about chin height.
4. Stay on the balls of the feet with light landings. Stay upright: no leaning back.

**Key positions:** lifted leg hipF 90–100, knee 90–100. Stance ankle 15–25. Forward arm shF 50–70, back arm shF −30, elbow 85–90. Short flight phase.

**Sources:** https://freeletics.com/en/blog/posts/freeletics-exercises-high-knees ; https://motra.com/exercises/highKnees ; https://exrx.net/Aerobic/Exercises/HighKneeRun

**App check:** Matches the joint angles (hipF 95, knee 95, opposite arms). Minor: both frames have `lift: 0.04`, so the stance foot never touches the floor. Use `lift: 0` at the knee-peak frames and add short in-between frames with `lift: 0.04, d: 0.3`.

---

### Butt Kicks (`butt-kicks`)
**How to do it**
1. Stand tall, then jog in place.
2. Kick each heel up toward the glutes. Keep the knee pointing **down** (thigh about vertical, not driven forward).
3. Stay on the balls of the feet, light and springy. Arms move naturally (bent ~90°). No forward lean.

**Key positions:** kicking leg knee 120–140, hipF −5 to +10. Ankle 15–20. Arms shF ±25–35, elbow ~85.

**Sources:** https://darebee.com/exercises/butt-kicks.html ; https://livestrong.com/article/13770360-butt-kicks-exercise ; https://www.caliverse.app/exercises/butt-kicks-1523

**App check:** Matches (knee 130, hipF −5). Minor: both frames have `lift: 0.03`, which is the same constant-airborne issue as High Knees.

---

### Standing Knee to Elbow (`knee-elbow`)
**How to do it**
1. Feet shoulder-width apart. Hands lightly behind the head (don't interlock the fingers), elbows wide, core braced.
2. Lift one knee up and across while bringing the **opposite** elbow down to meet it. Twist slightly at the waist and crunch the side, but don't hunch over.
3. Return to standing and alternate sides.

**Key positions:**
- Lifted leg hipF 90–100, knee 90.
- spineTwist about ±25–35 (rotate toward the lifted knee's side), spineF 15–25, spineSide toward the elbow side ~10.
- Hands behind head: shAbd ~100–110, external rotation shRot +60 to +90, elbow 130–150. Hands sit beside or behind the ears, elbows out.

**Sources:** https://blog.healthadvocate.com/2023/06/workout-of-the-week-standing-knee-crunch/ ; https://fitbod.me/exercises/standing-elbow-to-knee-crunch ; https://www.thisiswhyimfit.com/knee-to-elbow

**App check: MISMATCH (arms).**
- Leg and spine values match: left knee with spineTwist +30 brings the right elbow across.
- The arm pose `shAbd: 120, elbow: 150, shRot: -20` uses **internal** rotation. Computed through the rig (XZY order), it puts the wrists about at shoulder height and ~12 cm **in front of** the shoulders, like a boxing guard, not behind the head.
- Suggested fix: `shAbd: 105, shRot: 75, elbow: 145`. That puts the forearms up and back with the hands beside the head.
- Ideally add `touch: [['hand_L','head',0.12],['hand_R','head',0.12]]` and adjust until check-poses passes.
- The same arm pose is used by `bicycle` (not my exercise), so worth checking.

---

### Twisters (`twisters`)
**How to do it**
1. Feet hip-width apart, knees soft, arms bent ~90° and held out in front/to the sides for balance.
2. Hop slightly. In the air, rotate the hips and legs to one side while the shoulders and gaze stay facing forward, so the upper and lower body counter-rotate.
3. Land softly, twisted. Hop and rotate to the other side. Only twist as far as stays balanced, with the head and shoulders over the feet.

**Key positions:** lower body yaw ±30–45. Chest stays forward (spineTwist = −yaw). Arms shAbd 60–80, elbow 70–90. Ankle 20–30 in flight. Small lift.

**Sources:** https://dieringe.com/exercises/twist-jumps ; https://exercises.virtuagym.com/?p=27322 ; https://brentwood-trampoline.org/about-trampolining/basic-skills/basic-twists/

**App check:** Matches. `yaw ±35` with `spineTwist ∓35` keeps the chest forward. The flight is between the twisted landing frames. Optional `knee: 8` on the landing frames.

---

### Mountain Climbers (`mountain-climbers`)
**How to do it**
1. High plank: hands under the shoulders, body in a straight line from head to heels, abs braced, shoulder blades down and back.
2. Drive one knee toward the chest without letting the hips rise, then switch legs quickly. It is like running in a plank.
3. Keep the weight over the hands and the back flat. Hips stay low and level.

**Key positions:** plank: arms vertical (shF ≈ pitch), elbows straight, spine neutral. Driving leg hipF 100–120, knee 100–150, foot near the chest. Back leg hip 0 and knee 0, on the toes.

**Sources:** https://www.acefitness.org/resources/everyone/exercise-library/258/mountain-climbers/ (search summary) ; https://www.physitrack.com/exercise-library/how-to-perform-the-mountain-climber-exercise ; https://www.masterclass.com/articles/mountain-climber-exercise

**App check:** Matches (HIGH_PLANK, hipF 119, knee 150, alternating).

---

### Squat Jumps (`squat-jumps`)
**How to do it**
1. Feet hip- to shoulder-width apart, core braced.
2. Squat by pushing the hips back and bending the knees. ACE: until the heels are about to lift. NASM: a quarter to half squat for beginners. Keep the back flat and chest up. **Arms swing back.**
3. Explode up. Swing the arms forward and overhead, and fully extend the hips, knees and ankles in the air.
4. Land softly mid-foot to heel, with knees bent and hips back, and sink straight into the next squat.

**Key positions:**
- Bottom: hipF 90–110, knee 90–110, ankle −25 to −35 (dorsiflexion), pitch 25–40, **arms shF −30 to −45**.
- Flight: hip, knee and ankle extended (ankle 30–40), arms shF 150–170.
- Landing: knee 30–45, hipF 30–45.

**Sources:** https://www.acefitness.org/resources/everyone/exercise-library/116/squat-jumps/ ; https://www.nasm.org/resource-center/exercise-library/squat-jump ; https://redefiningstrength.com/?p=12138

**App check:** Mostly matches. Two minor fixes:
1. At the bottom, `shF: 20` holds the arms slightly forward. Sources have the arms swing back during the dip, so use `shF: -35, elbow: 10`.
2. The landing frame `{ lift: 0.05, shF: 60, ankle: 15 }` has straight knees. Use about `knee: 35, hipF: 35, pitch: 10, ankle: -10` (absorbing).

---

### Burpees (`burpees`)
**How to do it**
1. Stand. Squat down and put the hands on the floor just outside the feet.
2. Jump or step both feet back to a high plank. The body is straight with hands under the shoulders.
3. Optionally do a push-up (on the knees for beginners).
4. Jump the feet back in toward the hands.
5. Stand and jump up, extending the arms overhead. Land softly with knees and hips absorbing the impact.

**Key positions:** squat-hands-down: hipF ~120+, knee ~140+, hands on floor. Plank as HIGH_PLANK. Jump: shF 160–180, ankle 30–40. Landing knee 20–40.

**Sources:** https://www.physitrack.com/exercise-library/how-to-perform-the-burpees-exercise ; https://www.thegymgroup.com/exercises/total-body-exercises/how-to-do-burpees/ ; https://www.acefitness.org/resources/pros/expert-articles/3774/try-this-jiu-jitsu-inspired-workout/ (ACE bodyweight sequence; the ACE library entry 306 is a BOSU variant)

**App check:** Matches: stand, squat-hands-down, plank, squat, jump with arms overhead. The push-up is optional in sources, so leaving it out is fine.

---

### Plank Jacks (`plank-jacks`)
**How to do it**
1. High plank with hands under the shoulders and the body in a straight line from head to heels.
2. Jump both feet out to slightly wider than hip-width, then jump them back together, like a jumping jack with the legs.
3. Hips stay level: no piking, sagging or rocking. Land softly on the toes.

**Key positions:** HIGH_PLANK. hipAbd 0–3 → 12–18 each side (feet ~40–50 cm apart). Shoulders over wrists.

**Sources:** https://www.sweat.com/exercises/plank-jack ; https://exercises.virtuagym.com/exercise/plank-jacks/ ; https://planfit.ai/exercise/plank-jack-with-towel

**App check:** Matches (hipAbd 2 ↔ 16 on HIGH_PLANK).

---

## Technique research, batch 2

**Web access note:** WebSearch worked, but WebFetch and curl could not reach any page. acefitness.org and nhs.uk were refused by the egress proxy ("connect_rejected" / ENOTFOUND). So none of these pages was opened directly. Every "Source" below is a real URL that WebSearch returned, and the technique comes from the excerpts and summaries of that page in the search results. Where the search gave no ACE/NHS/Mayo page, I say so and list the next-best source it returned.

**How I read the angles.** I take segment directions from vertical, with forward as positive. Thigh = hipF − pitch. Shin = thigh − knee. Upper arm = shF − pitch. Forearm = upper arm + elbow. So `HIGH_PLANK` (pitch 75, shF 75) gives vertical arms, and `HINGE` (pitch 45) gives a trunk leaning 45° forward.

---

### Bodyweight Squats (`squats`)
**How to do it**
1. Stand with feet a little wider than hip-width and toes turned slightly out. Shoulders down and back, core braced.
2. Lift the chest. Shift your weight toward the heels and push the hips back, then down. Hips and knees bend together, and the back stays flat.
3. Knees track over the second toe. The shins move forward a controlled amount, and the heels stay down.
4. Lower until the thighs are parallel or nearly parallel to the floor. Stop earlier if the heels lift or the back starts to round.
5. Breathe out and drive through the heels to stand back up.

**Key positions:** bottom: pitch (trunk lean) ≈ 30–45, hipF ≈ 110–125, knee ≈ 110–125 (thigh about parallel), ankle ≈ −30 to −35, hipAbd ≈ 8–10, hipRot ≈ 10–15 (toes out). Arms forward as a counterweight, horizontal (shF ≈ pitch + 90). Spine neutral (spineF ≈ 0).

**Sources:** https://www.acefitness.org/resources/everyone/exercise-library/135/bodyweight-squat/

**App check:** **Matches.** In `SQUAT_LOW` the thigh is at 112 − 35 = 77° from vertical, about 13° above parallel. That is within ACE's "parallel or nearly parallel". The shin leans 35°, ankle −35 matches it, and the arms are horizontal (125 − 35 = 90). Optional tweaks: add `hipRot: 12` for ACE's "toes turned slightly out". For full parallel depth, use hipF 122, knee 122, ankle −35 (re-run the checker).

### Squat Hold (`squat-hold`)
**How to do it**
1. Feet about shoulder-width, toes slightly out.
2. Sit down and back into a squat until the thighs are at or near parallel.
3. Chest up and spine neutral. Knees over the ankles and toes, heels planted, weight in the heels and mid-foot.
4. Hold and keep breathing steadily. Use a higher position or a chair or wall if you can't reach parallel.

**Key positions:** same as the squat bottom: pitch ≈ 30–40, hipF ≈ 110–125, knee ≈ 110–125, ankle ≈ −30 to −35, spineF ≈ 0. Arms forward (shF ≈ 100–125).

**Sources:** https://www.trainwell.net/exercises/bodyweight-squat-hold, https://fitbod.me/exercises/bodyweight-squat-hold (search found no ACE/NHS/Mayo page for the hold). The ACE squat page above covers the base position.

**App check:** **Matches.** It reuses `SQUAT_LOW` with shF 100, so the arms point 25° below horizontal, which is fine. The same optional `hipRot: 12` applies.

### Alternating Lunges (`lunges`)
**How to do it**
1. Stand tall, shoulders down and back, core braced.
2. Step forward with one leg and let the hips drop straight toward the floor. Don't drive them forward.
3. Lower until the front thigh is parallel to the floor. The front knee sits roughly over the ankle (ACE: shin "slightly forward"), and the back knee hovers just above the floor. Both knees end near 90°.
4. Torso stays upright. Push off the front foot to return, then alternate legs.

**Key positions:** front leg hipF ≈ 80–90, knee ≈ 85–95, ankle ≈ −5 to −15. Back leg hipF ≈ −5 to −15 (thigh about vertical), knee ≈ 85–95, ankle ≈ −30 to −40 (on the ball of the foot). pitch ≈ 0, spineF ≈ 0.

**Sources:** https://acefitness.org/resources/everyone/exercise-library/94/forward-lunge/, https://www.trainwell.net/exercises/forward-lunge

**App check:** **Matches.** Front thigh 82°, front shin about vertical (82 − 84), back thigh −9°, back knee 87, trunk upright, hands on hips. All agree with the sources.

### Calf Raises (`calf-raises`)
**How to do it**
1. Stand tall with feet hip-width apart. Hold onto something for balance if needed.
2. Push evenly through the balls of the feet and raise the heels as high as you can. Keep the knees straight but not locked.
3. Pause at the top.
4. Lower the heels slowly and with control. Don't bounce or swing.

**Key positions:** top: ankle ≈ 35–45 (plantarflexion), knee ≈ 0–5, hipF ≈ 0, pitch ≈ 0–3. Bottom: ankle 0.

**Sources:** https://www.acefitness.org/resources/everyone/exercise-library/294/calf-raise/ (ACE machine version: "press through the toes as far as you can… then lower slowly"), https://www.physitrack.com/exercise-library/how-to-perform-the-calf-raises-exercise

**App check:** **Range of motion matches** (ankle 38). **Tempo is a minor mismatch.** The app's own tip says "pause at the top, lower with control", but the cycle is 1.8 s with only two frames, so there is no pause. Suggested fix: `cycle: 3`, with frames `[{...HANDS_ON_HIPS, d: 1.2}, {...top, d: 0.6}, {...top, d: 0.5}, …]`. That holds the top frame for a moment and makes the lowering slower than the rise.

### Knee Push-ups (`knee-pushups`)
**How to do it**
1. Kneel on hands and knees and look at the floor. Hands slightly wider than shoulder-width, under or just outside the shoulders.
2. Walk the hands forward so there is a straight line from knees to head. Brace the abs.
3. Bend the elbows to lower the chest until the chin or chest nearly touches the floor. Elbows stay near the torso or flare slightly. Don't let the hips sag or pike.
4. Press back up until the elbows are straight. Move slowly and smoothly.

**Key positions:** top: arms vertical (shF = pitch), elbow 0, hipF 0, knee ≈ 90. Bottom: elbow ≈ 80–95, upper arm about horizontal, forearm about vertical, shAbd ≈ 15–45 (elbow flare), hipF 0, spineF 0.

**Sources:** https://www.acefitness.org/exerciselibrary/13/bent-knee-push-up, https://www.mayoclinic.org/healthy-lifestyle/fitness/multimedia/pushups/vid-20084674

**App check:** **Matches.** Knee-to-head line is straight (no hipF). At the bottom the upper arm is at −77° and the forearm about vertical, with elbow 81. shAbd 18 fits ACE's "elbows near the torso". Optional: shAbd 10–12 at the top for "slightly wider than shoulder-width" hands.

### Push-ups (`pushups`)
**How to do it**
1. High plank with hands about shoulder-width, fingers forward, shoulders directly over the hands.
2. Brace the core so the body is one rigid line from head to heels.
3. Lower until the chest is near the floor. Elbows stay near the torso or flare slightly (about 45° at most).
4. Press back up until the elbows are fully extended.

**Key positions:** top: pitch ≈ 70–75, shF = pitch, elbow 0, wrist ≈ 90, hipF 0. Bottom: pitch ≈ 85–88, elbow ≈ 85–95, upper arm about horizontal and forearm vertical, shAbd ≈ 15–45, spineF 0.

**Sources:** https://www.acefitness.org/resources/everyone/exercise-library/13/bent-knee-push-up/ (ACE push-up cues; search did not surface ACE's full push-up page), https://catalystathletics.com/exercise/869/Push-Up/

**App check:** **Matches.** `HIGH_PLANK` has the hands under the shoulders. `PUSHUP_DOWN` has the chest near the floor (pitch 85), elbow 80, forearm about vertical, and elbows tucked (shAbd 18).

### Diamond Push-ups (`diamond-pushups`)
**How to do it**
1. Plank position with the hands together under the chest (sternum). Thumbs and index fingers form a diamond.
2. Body rigid from head to heels, with no sagging or piking.
3. Lower until the chest nearly touches the hands. Keep the elbows close to the body, pointing back rather than out.
4. Press back up to straight arms. Beginners can do it from the knees.

**Key positions:** top: hands under the sternum, so shF a little less than pitch (≈ pitch − 5 to −10). shAbd negative (≈ −15 to −20) so the hands meet, elbow 0. Bottom: elbow ≈ 75–95, shAbd ≈ −5 to +10 (tucked), pitch ≈ 85–88.

**Sources:** https://www.garagegymreviews.com/diamond-push-up, https://www.liftosaur.com/exercises/bodyweight-diamond-pushup (no ACE/NASM page surfaced)

**App check:** **Mostly matches.** The hands meet (shAbd −19 plus the touch constraint), the elbows stay tucked at the bottom (shAbd −2), and the chest goes low (pitch 88). One minor point: at the top, shF 75 equals pitch, which puts the hands under the shoulders, not under the sternum. Suggested: top `shF: 68` (hands about 5–8 cm toward the feet). Re-check balance and wrist contact.

### Glute Bridge (`glute-bridge`)
**How to do it**
1. Lie on your back with knees bent and feet flat, hip-width apart. Arms rest on the floor at your sides.
2. Brace the core. Press through the heels and squeeze the glutes to lift the hips.
3. Stop at a straight line from shoulders to knees. Don't arch the lower back or push the hips past that line.
4. Pause, then lower the hips slowly to the floor.

**Key positions:** down: pitch −90, hipF ≈ 45–55, knee ≈ 100–110, feet flat. Top: hipF ≈ 0 (shoulder, hip and knee in line), spineF 0, knee ≈ 90–100, shins about vertical, trunk ≈ 30–40° off the floor (pitch ≈ −120 to −130), arms on the floor.

**Sources:** https://www.physitrack.com/exercise-library/how-to-perform-the-glute-bridge-exercise, https://www.muscleandstrength.com/exercises/bodyweight-glute-bridge, https://www.acefitness.org/resources/everyone/exercise-library/66/glute-bridge (ACE's entry is the stability-ball version: "straight line from the knees to the head")

**App check:** **Minor mismatch.** The top frame has `hipF: -16`, which is 16° of hip hyperextension, so the hips go past the shoulder–knee line. The sources all cue a straight line from shoulders to knees (hipF ≈ 0). Suggested top frame: `{ pitch: -125, hipF: -3, knee: 95, ankle: ~15–20, shF: ~-50, shAbd: 12, elbow: 0 }`. Pitch drops to about −125 so that the straight line still clears the floor with the feet planted. Re-run the checker and adjust knee and ankle to keep the feet flat.

### Superman (`superman`)
**How to do it**
1. Lie face down with legs straight and arms overhead, palms facing each other. Head relaxed, in line with the spine.
2. Breathe out and brace the core. Slowly lift both arms and both legs a few inches off the floor, keeping elbows and knees straight.
3. ACE says to hold the head and torso steady, without arching the back or lifting the head. Keep looking at the floor.
4. Hold briefly, then breathe in and lower.

**Key positions:** lift: shF ≈ 175–185 relative to the body (arms a few inches up), hipF ≈ −10 to −15, knee 0, elbow 0. spineF ≈ 0 to −10 (small, not a backbend), neckF ≈ 0.

**Sources:** https://www.acefitness.org/resources/everyone/exercise-library/9/supermans, https://library.theprehabguys.com/vimeo-video/prone-superman-2/

**App check:** **Mismatch.** The lift frame uses `spineF: -25`, a clear back arch, and its `tips` say "lift your arms, chest and legs". ACE says to lift only the arms and legs a few inches and to keep the torso steady without arching. The arm and leg lifts (shF 175, hipF −14) are right. Suggested lift frame: `{ ...PRONE, spineF: -8, neckF: 0, shF: 178, hipF: -14, ankle: 60, on: 'front' }`. Suggested tip: "lift your arms and legs a few centimetres, keep your chest low and look at the floor." (Prehab Guys allows a bigger lift, so spineF down to about −15 is defensible, but −25 goes beyond ACE.)

### Bird Dog (`bird-dog`)
**How to do it**
1. Hands and knees: hands under the shoulders, knees under the hips, spine neutral, core braced.
2. Press the hands into the floor to steady the shoulders.
3. Reach one arm forward and the opposite leg back at the same time, until both are about in line with the torso. Only lift as high as you can without the lower back moving.
4. Keep the hips level with no rotation. Hold, return to the start, then switch sides.

**Key positions:** base `TABLETOP` (pitch ≈ 87, shF ≈ pitch, hipF ≈ 87–90, knee ≈ 90). Reach arm shF ≈ pitch + 90 (≈ 175–180), elbow 0. Reach leg hipF ≈ 0, knee 0 (leg horizontal). spineF 0, no roll.

**Sources:** https://www.acefitness.org/resources/everyone/exercise-library/14/bird-dog/, https://www.nasm.org/exercise-library/bird-dog

**App check:** **Matches.** The arm (178 − 87 = 91°, horizontal) and the opposite leg (hipF 0, knee 0) reach out together, and the trunk stays still.

### Dumbbell Rows (`db-rows`)
**How to do it**
1. Hold a dumbbell in each hand. Hinge at the hips with a flat back until the torso is well forward. Sources range from 45° to "slightly above parallel"; Physitrack says "parallel to the floor". Arms hang straight down.
2. Brace the core and keep the spine neutral. Shoulder blades back and down.
3. Lead with the elbows and pull the weights toward the lower ribs or hips. The upper arms stay fairly close to the body (no wide flare), and the **forearms stay vertical** through the whole pull.
4. Squeeze the shoulder blades at the top, then lower slowly to straight arms.

**Key positions:** hinge pitch ≈ 45–75, hipF ≈ pitch + 5 to + 10, knee ≈ 15–20. Bottom: shF = pitch (arms vertical), elbow ≈ 0–5. Top: the upper arm is roughly in line with or slightly past the torso (shF ≈ −10 to −30), with **elbow ≈ pitch − shF** so the forearm stays vertical. shAbd ≈ 10–20.

**Sources:** https://www.acefitness.org/resources/everyone/exercise-library/12/bent-over-row/ (ACE barbell version), https://www.physitrack.com/exercise-library/how-to-perform-the-bent-over-dumbbell-row-exercise, https://nfpt.com/proper-form-for-a-one-arm-dumbbell-row/ ("forearm should remain perpendicular to the floor")

**App check:** **Mismatch at the top of the pull.** With `HINGE` pitch 45, the top frame (shF −10, elbow 95) puts the upper arm at −55° and the forearm at −55 + 95 = **+40° forward of vertical**. The dumbbell ends up swung forward under the chest instead of hanging below the elbow beside the ribs, which reads as a curl-row. Suggested top frame: `{ ...HINGE, shF: -25, shAbd: 12, elbow: 70 }`. That gives an upper arm at −70° and a forearm at about −0°, vertical, with the elbow pulled well back. Optional: a deeper hinge (pitch ≈ 60–70) is closer to the sources. In that case the bottom shF = pitch and the top elbow = pitch − shF.

### Shoulder Press (`shoulder-press`)
**How to do it**
1. Stand tall with feet about hip-width and core braced. Bring the dumbbells to shoulder height, palms facing forward, elbows under the wrists.
2. Press both weights straight up overhead until the arms are nearly straight. Don't arch the lower back.
3. Lower slowly back to shoulder height.

**Key positions:** start: shAbd ≈ 80–90 (upper arm about horizontal; a slight shF of 10–30 toward the scapular plane is fine), elbow ≈ 90–100, shRot ≈ 80–90 so the forearm is vertical. Top: shAbd ≈ 165–175, elbow ≈ 0–10. spineF 0 (no arch).

**Sources:** https://www.acefitness.org/education-and-resources/lifestyle/exercise-library/71/standing-shoulder-press (ACE barbell version: "press it overhead with a straight back, slowly return to the shoulders"), https://catalystathletics.com/exercise/830/Dumbbell-Press/

**App check:** **Matches.** Start is shAbd 85 with elbow 95 and shRot 90 (forearm vertical, weights at shoulder height). Top is shAbd 168 with elbow 10. Optional: add `shF: 20` to both frames to put the elbows slightly forward in the scapular plane.

### Front Raises (`front-raises`)
**How to do it**
1. Stand tall with the dumbbells hanging in front of the thighs, palms facing the body.
2. With arms straight or nearly straight, lift the weights forward to shoulder height. Catalyst allows slightly above.
3. Don't swing or lean back. Lower slowly under control.

**Key positions:** start shF ≈ 0–10, elbow ≈ 5–10. Top shF ≈ 85–95, elbow ≈ 5–10. pitch 0, spineF 0.

**Sources:** https://catalystathletics.com/exercise/823/Dumbbell-Front-Raise/ (no ACE/NASM front-raise page surfaced)

**App check:** **Matches** (shF 8 → 88, elbow 8).

### Lateral Raises (`lateral-raises`)
**How to do it**
1. Stand tall with the dumbbells at your sides, palms facing the body, elbows slightly bent.
2. Lift the weights out to the sides until the arms are about parallel to the floor, or just below shoulder height.
3. Keep the shoulders down and don't shrug or use momentum. Lower slowly.

**Key positions:** start shAbd ≈ 10–15, elbow ≈ 10–15. Top shAbd ≈ 80–90, elbow ≈ 10–15. Optional shF ≈ 10–20 (scapular plane). shRot about neutral to slightly internal.

**Sources:** https://catalystathletics.com/exercise/825/Dumbbell-Lateral-Raise/, https://trainwell.net/exercises/dumbbell-lateral-raise

**App check:** **Matches** (shAbd 12 → 85, elbow 10–12).

### Bicep Curls (`bicep-curls`)
**How to do it**
1. Stand tall with the dumbbells beside the thighs and elbows straight. Torso upright, no arch in the lower back.
2. Keep the upper arms still at your sides and curl the weights up toward the shoulders. ACE: **don't move the elbows forward**.
3. Squeeze at the top, then lower slowly until the elbows are fully extended.

**Key positions:** start shF 0, shAbd ≈ 5–10, elbow ≈ 0–10. Top shF ≈ 0–5, elbow ≈ 130–145. pitch 0, spineF 0.

**Sources:** https://www.acefitness.org/exerciselibrary/44/seated-dumbbell-bicep-curl, https://catalystathletics.com/exercise/821/Dumbbell-Curl/

**App check:** **Minor mismatch.** The top frame adds `shF: 10`, which brings the elbows forward. ACE cues specifically against this. Suggested top frame: `{ shAbd: 10, shF: 3, elbow: 135, hipAbd: 6 }`, or leave out shF. Everything else matches: the full range of motion is 8 → 135, and the bottom frame has full extension.

### Tricep Kickbacks (`tricep-kickbacks`)
**How to do it**
1. Hinge forward with a flat, neutral back. Sources say the torso should be nearly parallel to the floor. ACE uses a staggered stance with the core braced.
2. Bring the upper arm up beside the torso so it is about parallel to the torso and the floor. Elbow at about 90°, forearm hanging straight down.
3. Keep the upper arm still and straighten the elbow to push the weight back until the arm is fully extended.
4. Lower the forearm back to 90° under control. Only the forearm moves.

**Key positions:** hinge pitch ≈ 70–85 (torso nearly parallel), hipF ≈ pitch + 5, knee ≈ 15–25. Upper arm alongside the torso: shF ≈ 0 to −15, which is about horizontal when the torso is near parallel. Start elbow ≈ 90 (forearm vertical), end elbow ≈ 0–5.

**Sources:** https://www.acefitness.org/resources/everyone/exercise-library/55/triceps-kickback/ (upper arm "parallel to the torso", stays still), https://bodybuilding.com/exercises/tricep-dumbbell-kickback (torso "almost parallel to the floor", upper arm parallel to the floor, elbow 90°)

**App check:** **Minor mismatch in the setup. The motion matches.** The upper arm is horizontal (−45 − 45 = −90) and the forearm vertical at elbow 95, and the elbow extends to 5 with the upper arm fixed. Both are correct. But the torso is only hinged 45° (`HINGE`), so the arm sits 45° behind the torso line (shF −45) instead of alongside it, as ACE describes. Suggested: use a deeper hinge for this exercise, e.g. `{ pitch: 75, hipF: 82, knee: 20, ankle: -8 }`. Then use shF −15, elbow 90 → 5. The upper arm stays horizontal and alongside the torso. If the 45° hinge has to stay for balance, shF −30 is a compromise, with a start elbow of 75 to keep the forearm vertical.

---

## Technique research, batch 3 (core, yoga, stretch)

> **Web access note.** WebSearch worked, but **WebFetch and direct HTTPS were blocked** in this environment: DNS failed for acefitness.org, nasm.org, yogajournal.com and livestrong.com, and the egress proxy refused CONNECT. So no page was opened in full. Each URL under **Sources** was returned by WebSearch, and the cues come from the summary and snippets the search returned for that URL. They were not read from the full page. Where no reputable source came back, the entry says "(no source reached)" and relies on standard technique.
>
> **Angle conventions** (tools/motion.js; avatar.js applies spineF to spine and chest, rooted at the pelvis). The upper-torso pitch is about `pitch + spineF`. An arm hangs vertically toward the floor when `shF ≈ pitch + spineF`. On the back (pitch −90), `hipF` equals the thigh's elevation above the floor.

---

### Forearm Plank (`plank`)
**How to do it**
1. Lie face down. Put your forearms on the floor with your elbows directly under your shoulders and your forearms parallel.
2. Tuck your toes and lift your body so it makes one straight line from head to heels.
3. Brace your core and squeeze your glutes. Don't let your hips sag or pike. Keep your neck neutral and look at the floor.
4. Hold for 30–60 s while breathing normally.

**Key positions:** pitch ≈ 80–85 (the shoulders sit higher than the feet because of the forearms); upper arm vertical (shF ≈ pitch); elbow 90; forearms flat (wrist 0); hipF 0; knee 0; ankle ≈ 10–20 (on toes); spineF 0; neckF ≈ 0 to −5.

**Sources:** https://www.mayoclinic.org/connected-care/want-to-strengthen-your-abs-try-a-plank/vid-20307379 ; https://www.muscleandstrength.com/node/3628

**App check:** Matches. FOREARM_PLANK has pitch 84, shF 84, elbow 90, hips straight and ankle 17.

---

### Crunches (`crunches`)
**How to do it**
1. Lie on your back with knees bent and feet flat, about hip-width apart.
2. Fold your arms across your chest, or put your fingertips lightly behind your head without pulling.
3. Tighten your abs and curl your head and shoulders up until your shoulder blades just clear the floor. Your **lower back stays on the floor**.
4. Pause, then roll back down slowly.

**Key positions:** BACK_KNEES legs (hipF ≈ 45–60, knee ≈ 90–110, feet flat). Top of the curl: upper-trunk flexion **spineF ≈ 25–30** (shoulder blades just off the floor), neckF ≈ 10–15. Arms crossed on the chest: shF ≈ 20–40, shAbd ≈ −30, elbow ≈ 130.

**Sources:** https://www.mayoclinic.org/healthy-lifestyle/fitness/multimedia/abdominal-crunch/vid-20084664 ; https://www.unthsc.edu/students/wp-content/uploads/sites/26/Abdominal_Exercises.pdf

**App check:** Mismatch.
- Up frame `spineF: 45` is closer to a partial sit-up, because it would lift the lower back. **Fix:** spineF 25–30 and neckF 12–15.
- Arms reach forward (shF 40 to 55) where Mayo Clinic has them folded on the chest. This is an accepted variation, so it's optional. To follow Mayo, use about `shF: 30, shAbd: -30, elbow: 130` in both frames.

---

### Knee Touches (`knee-touch`)
**How to do it**
1. Lie on your back with knees bent and feet flat, hands resting on the fronts of your thighs.
2. Tighten your abs and lift your head and shoulders, **sliding your hands up your thighs toward your knees**.
3. Keep your lower back on the mat, then lower slowly.

**Key positions:** same as the crunch. Top: spineF ≈ 30–40, neckF ≈ 15. Arms straight along the thighs (elbow 0, shF ≈ 40–60).

**Sources:** https://ahc.aurorahealthcare.org/fywb/x24220.pdf ; https://www.myhexfit.com/en/exercise/700/crunch-hands-on-knees/

**App check:** Minor mismatch.
- `spineF: 56` is a deep curl that would bring the lumbar spine off the floor.
- **Fix:** spineF ≈ 38–40. The cue is "slide toward your knees", so the fingertips don't need to touch the knees. Loosen the touch tolerance on `hand_L`/`knee_L`, or aim at the lower thigh. Arms stay straight (elbow 0).

---

### Dead Bug (`dead-bug`)
**How to do it**
1. Lie on your back with your arms pointing straight up to the ceiling and your hips and knees at 90° (tabletop legs).
2. Brace so your lower back stays pressed to the floor.
3. Slowly reach one arm overhead toward the floor while you extend the **opposite** leg until it hovers just above the floor.
4. Return to the start and switch sides. Don't let your back arch.

**Key positions:**
- Start: shF 90, elbow 0, hipF 90, knee 90.
- Reaching arm: shF ≈ 160–180.
- Extending leg: hipF ≈ 10–30, knee ≈ 0–10.
- spineF 0, with the lower back flat on the floor.

**Sources:** https://www.nasm.org/resource-center/exercise-library/dead-bug ; https://www.healthline.com/health/exercise-fitness/dead-bug-exercise

**App check:** Matches. The right arm (shF 175) moves with the left leg (hipF 25, knee 5), so it is opposite-side, and the other side mirrors it.

---

### Leg Raises (`leg-raises`)
**How to do it**
1. Lie on your back with legs straight and arms by your sides, palms down. Hands under the hips is an easier option.
2. Keep your lower back pressed down and raise both straight legs until they are vertical (about 90°).
3. Lower them slowly until your heels hover just above the floor, without touching. Repeat.

**Key positions:** pitch −90; knee 0; hipF from about 5–10 (bottom) to 80–90 (top); ankle relaxed or pointed; shAbd ≈ 10–20 with arms on the floor.

**Sources:** https://www.coachweb.com/abs-exercises/8505/flutter-kicks (leg-height and back-contact cues) ; (no ACE or Mayo page reached for leg raises)

**App check:** Matches (hipF 8 to 85, knees straight).

---

### Flutter Kicks (`flutter-kicks`)
**How to do it**
1. Lie on your back with legs straight and hands at your sides or under your hips.
2. Lift your heels about 10–15 cm off the floor, keeping your lower back pressed down.
3. Alternate small, quick up-and-down kicks with straight legs.
4. If your back arches, lift your legs higher.

**Key positions:** pitch −90; knee 0; hipF alternating roughly 10–30° (a small range); head can be slightly lifted (neckF ≈ 10–20).

**Sources:** https://www.coachweb.com/abs-exercises/8505/flutter-kicks ; https://www.masterclass.com/articles/flutter-kicks-workout-guide

**App check:** Matches (hipF alternates 15 and 35, neckF 15).

---

### Bicycle Crunches (`bicycle`)
**How to do it**
1. Lie on your back with your hands lightly behind your head and elbows wide. Lift your shoulders off the floor.
2. Bring one knee toward your chest while you extend the other leg, low and straight.
3. Rotate your torso so the **opposite** elbow moves toward the bent knee.
4. Switch sides in a slow pedalling motion. Don't pull on your neck.

**Key positions:**
- Torso: spineF ≈ 30–40, spineTwist ≈ ±25–35 toward the bent-knee side.
- Arms: shAbd ≈ 110–130, elbow ≈ 140–150.
- Bent leg: hipF ≈ 90–100, knee ≈ 90–110.
- Extended leg: hipF ≈ 20–45, knee ≈ 0–10.

**Sources:** https://acefitness.org/about-ace/press-room/in-the-news/8311/how-to-do-a-bicycle-crunch-for-a-strong-stable-core-livestrong ; https://www.thegymgroup.com/exercises/abs-and-core-exercises/how-to-do-a-bicycle-crunch

**App check:** Matches. When the left knee is bent, spineTwist +30 (rotation to the left) brings the right elbow toward the left knee. The extended leg is at hipF 25.

---

### Russian Twists (`russian-twists`)
**How to do it**
1. Sit with knees bent and feet on the floor (lift them for a harder version).
2. Lean back with a long, straight spine until your torso is about **45° to the floor**, making a V with your thighs.
3. Clasp your hands in front of your chest and rotate your torso from side to side, moving from the core and not just the arms.
4. Don't round your back or lean back too far.

**Key positions:** torso about 45° from vertical (pitch ≈ −40 to −45); spineF ≈ 0 (straight back); hipF ≈ 110–125; knee ≈ 90; spineTwist ≈ ±30–45; hands together in front of the chest (shF ≈ 50–70, shAbd ≈ −20 to −30, elbow ≈ 60–90).

**Sources:** https://www.masterclass.com/articles/russian-twist-guide ; https://www.healthline.com/health/russian-twist

**App check:** Mismatch (small).
- `pitch: -29` puts the torso only 29° behind vertical, about 61° above the floor. That is a fairly upright sit and much less core load than the cited 45° lean.
- **Fix:** pitch ≈ −40 to −42 and raise hipF by the same amount (≈ 120) so the thighs and feet stay in place. Keep knee 95, ankle 4 and the arms as they are.
- Re-check balance with the checker, because the seat contact shifts.

---

### Knee to Elbow Plank (`plank-knee-elbow`)
**How to do it**
1. Start in a high plank with hands under your shoulders and your body in a straight line.
2. Bring one knee **out to the side** toward the same-side elbow. The knee travels sideways, outside the arm, not straight under the chest like a mountain climber.
3. Keep your hips low and square. Don't twist or pike.
4. Return the foot and switch sides. Move slowly and with control.

**Key positions:** HIGH_PLANK base. Moving leg: hipF ≈ 90–110, **hipAbd ≈ 40–60**, hipRot ≈ +20–40 (knee turned out), knee ≈ 110–130, foot off the floor. Pelvis level (no roll).

**Sources:** https://www.puregym.com/exercises/abs/plank-knee-to-elbow/ ; https://redefiningstrength.com/?p=29048

**App check:** Mismatch.
- The working leg uses `hipF 124, hipAbd 23, knee 149`. That is mostly a mountain-climber tuck (knee under the chest), with only a little sideways travel.
- **Fix:** about `hipF_L: 105, hipAbd_L: 50, hipRot_L: 30, knee_L: 125`, mirrored on the right. This brings the knee outside the arm toward the elbow.
- Keep the touch tolerance (0.15) or relax it a little. Sources say not to force contact.

---

### Side Plank (`side-plank`)
**How to do it**
1. Lie on one side with your feet stacked and your forearm on the floor, elbow directly under your shoulder and forearm pointing forward.
2. Brace and lift your hips until your body makes a straight line from head to feet.
3. Keep your neck neutral, in line with your spine. The top arm rests on your hip or reaches to the ceiling.
4. Don't let your hips sag. Hold, then switch sides.

**Key positions:** roll ≈ 70–75; support upper arm vertical (shAbd ≈ roll); elbow 90; forearm forward; hips straight (hipF 0, hipAbd 0); spineSide 0; **neckSide ≈ 0** (head in line); top arm shAbd ≈ 90–180 or hand on hip.

**Sources:** https://www.sussex.ac.uk/sport/documents/side-planks.pdf ; https://www.tn.gov/wfhtn/resources/physical-activity/how-to-do-a-plank-and-a-modified-plank.html

**App check:** Minor mismatch.
- `neckSide: 20` tilts the head about 20° off the spine line. The cue is a neutral neck in line with the body. **Fix:** neckSide 0 (at most 5).
- Everything else matches: the elbow is under the shoulder, the feet are stacked and the body is straight.

---

### Cat-Cow (`cat-cow`)
**How to do it**
1. Start on hands and knees, wrists under shoulders and knees under hips. Hands and knees stay put the whole time.
2. **Cow (inhale):** let your belly sink, lift your chest and sit bones, and look slightly up.
3. **Cat (exhale):** round your spine up toward the ceiling, tuck your tailbone, and let your head drop toward your chest.
4. Flow between the two, 10–20 times.

**Key positions:** TABLETOP base, with thighs vertical (hipF ≈ pitch) and arms vertical. In both phases the arms stay vertical, so **shF ≈ pitch + spineF**.
- Cow: spineF ≈ −20 to −30, neckF ≈ −20 to −30.
- Cat: spineF ≈ +25 to +35, neckF ≈ +25 to +35.

**Sources:** https://www.yorksj.ac.uk/media/content-assets/ysj-active/documents/5x5-a-day---Cat_cow.pdf ; https://www.healthlinkbc.ca/healthwise/yoga-cat-cow-pose

**App check:** Mismatch.
- **Cow** frame `spineF: -3`: the back is almost flat, with only the neck extending. **Fix:** spineF ≈ −20 to −25.
- **Arms off vertical:**
  - Cow has shF 59 against a torso pitch of 87 − 3 = 84, so the arms are about 25° off vertical.
  - Cat has shF 118 against a torso pitch of 87 + 21 = 108, about 10° off.
  - In the real movement the wrists stay under the shoulders.
  - **Fix:** shF ≈ pitch + spineF in each frame. For example cow `spineF −22, shF ≈ 65`, cat `spineF 28, shF ≈ 115`, then re-fit pitch and hipF with the checker so the hands and knees don't slide.
- Cat spineF 21 is acceptable, but could go to about 28.

---

### Downward Dog (`downward-dog`)
**How to do it**
1. From hands and knees, place your hands shoulder-width apart, fingers spread, and feet hip-width apart.
2. Tuck your toes, lift your knees and send your hips up and back into an inverted V.
3. Keep your arms straight and in line with your torso, your back long, and your head between your arms.
4. Press your heels toward the floor. Bending the knees slightly is fine.

**Key positions:** hip angle hipF ≈ 80–100; arms in line with the torso (shF ≈ 170–180); elbow 0; knee 0–15; ankle ≈ −30 to −45 (heels toward the floor); spineF ≈ 0; torso about 40–50° below horizontal (pitch ≈ 130–140).

**Sources:** https://www.acefitness.org/resources/everyone/exercise-library/18/downward-facing-dog/ ; https://rishikulyogshala.org/blog/?p=6868

**App check:** Matches. The app uses pitch 132, hipF 89, shF 174 and ankle −35. With these angles the heels sit slightly off the floor, which suits beginners.

---

### Cobra Pose (`cobra`)
**How to do it** (low cobra, as the app's tip describes)
1. Lie face down with legs extended and the tops of your feet on the floor.
2. Put your palms flat **under your shoulders**, with your elbows bent and hugging your sides.
3. Press your pubic bone and feet down and lift your chest **only slightly** using your back muscles, with little pressure through the hands.
4. Keep your neck long and look forward or slightly down. For full cobra, straighten your arms partway while keeping the pelvis down.

**Key positions:** pitch ≈ 90 (pelvis on the floor); hipF ≈ 0 (thighs down); ankle ≈ 60 (feet flat).
- Low cobra: spineF ≈ −20 to −35, elbow ≈ 80–100.
- Full cobra: spineF ≈ −45 to −60, elbow ≈ 10–30.
- Hands under the shoulders: shF ≈ pitch + spineF, with upper arms back along the ribs. shAbd ≈ 5–15. neckF ≈ −5 to −15.

**Sources:** https://liforme.com/blogs/blog/cobra-pose-bhujangasana ; https://beyogi.com/learn-yoga/poses/baby-cobra-pose/

**App check:** Mismatch (pose depth vs tip).
- The tip says "low cobra, elbows bent", but `spineF: -58` is at the backbend limit, which is full-cobra depth.
- shF 45 against a torso pitch of 89 − 58 = 31 puts the hands about 14° forward of the shoulders.
- **Fix, choose one:**
  - (a) Keep the depth but rename or re-tip it as Cobra with arms partly straight (elbow ≈ 20–30, shF ≈ 31).
  - (b) Make it a real low cobra: `spineF ≈ -30, elbow ≈ 90, shF ≈ 60` (pitch + spineF) and `neckF ≈ -10`. Re-fit so the hands stay under the shoulders and the pelvis stays down.

---

### Child's Pose (`childs-pose`)
**How to do it**
1. Kneel, then sit your hips back onto your heels. Knees can be together or slightly apart.
2. Fold forward and rest your forehead on the floor.
3. Stretch your arms forward with palms down (extended version), or rest them by your legs with palms up (Mayo Clinic version).
4. Breathe slowly for at least 8 breaths.

**Key positions:** knee ≈ 150–160 (full flexion); hipF ≈ 120–140; ankle ≈ 30–50 (tops of feet down); spineF ≈ 30–45 (rounded); arms extended (shF ≈ 170–180, elbow 0) or by the sides; neckF ≈ 20–30 with the forehead down.

**Sources:** https://mymlc.com/health-information/videos/lifestyle/stress-management/stress-relief/childs-pose ; https://www.yogajournal.com/poses/child-s-pose/

**App check:** Matches (knee 155, hipF 130, spineF 39, shF 180, forehead down).

---

### Tree Pose (`tree`)
**How to do it**
1. Stand tall on one leg with the standing knee soft, not locked.
2. Turn the other knee out and place the sole of that foot on your inner thigh or inner calf. **Never put it on the knee.**
3. Keep your hips level and don't let the standing hip jut out.
4. Hands go together at your heart or overhead. Fix your gaze on one point.

**Key positions:**
- Raised leg: hipAbd ≈ 40–60, hipRot ≈ +40–60, hipF ≈ 20–50. Knee ≈ 120–140 with the foot on the thigh, or ≈ 90–110 with the foot on the calf.
- Standing leg straight.
- Arms at the heart (shAbd ≈ 20–30, elbow ≈ 120) or overhead (shAbd ≈ 160–175).

**Sources:** https://liforme.com/blogs/blog/tree-pose ; https://beyogi.com/learn-yoga/poses/tree-pose/

**App check:** Matches (hipAbd 50, hipRot 55, knee 135, arms overhead at 168).

---

### Warrior II (`warrior2`)
**How to do it**
1. Take a wide stance. Turn the front foot to point forward and turn the back foot in slightly.
2. Bend the front knee until the **thigh is about parallel to the floor**, knee stacked over the ankle and tracking toward the front toes. If the thigh can't get level, widen your stance.
3. Keep the back leg straight. Hips and torso open to the side, not forced square.
4. Reach your arms out level at shoulder height and look over your front hand.

**Key positions:** front knee ≈ 90 with the shin vertical and the front thigh horizontal; front hip strongly abducted and externally rotated (hipRot ≈ 40–60); back knee 0 with hipRot ≈ −10 to −15 (foot turned in); arms shAbd 90, elbow 0; neckTurn ≈ 60–80 toward the front hand; spine upright.

**Sources:** https://yogainternational.com/article/view/the-five-most-common-alignment-mistakes-in-warrior-ii ; https://beyogi.com/poses/warrior-ii-pose/

**App check:** Mismatch.
- Front knee is 72, short of the full-expression 90°, so the front thigh is well above parallel.
- **Fix:** knee_L ≈ 88–90 and deepen the hip so the front thigh is level. That likely means raising hipAbd_L/hipF_L a little and lowering the pelvis (re-fit with the checker; a wider stance may be needed).
- A shallower bend is a valid beginner option. If 72 is intentional, consider noting that in the tip.
- Everything else matches: back foot turned in, arms level, gaze forward.

---

### Triangle Pose (`triangle`)
**How to do it**
1. Take a wide stance with both legs straight. Turn the front foot out 90° and the back foot in slightly.
2. Reach your arms out at shoulder height, then reach forward over the front leg and **hinge at the front hip**, keeping both sides of the waist long. This is a hip hinge, not a collapse at the waist.
3. Rest the bottom hand on the shin, ankle or a block, and stretch the top arm straight up so **both arms form one vertical line**.
4. Keep your chest open to the side and look up or forward.

**Key positions:** both knees 0; front hipRot ≈ 50–60. The pelvis and torso tip over the front leg, so the torso is ≈ 60–90° from vertical, mostly from the hip and only a little from the spine (spineSide ≈ 10–20). Both arms should be vertical in the world: for a torso tilt T from vertical, the top arm shAbd ≈ 180 − T and the bottom arm shAbd ≈ T. neckTurn upward.

**Sources:** https://courses.onlineyoga.school/pages/triangle-pose-instructions-how-to-do-trikonasana-yoga-pose ; https://www.artofliving.org/us-en/triangle-pose-trikonasana

**App check:** Mismatch.
- **Bend comes from the spine.** spineSide is 40 (the ROM maximum) and roll is only −15.9. The bend is mainly a waist side-bend, while sources say to keep both sides of the waist long and tip from the hips. **Fix:** move tilt into roll and the hips (roll ≈ −40 to −50, front hipAbd_L adjusted) and set spineSide ≈ 10–15.
- **Arms are not in one vertical line.** The total torso tilt is about 56°, but both arms sit near shAbd 90 (top arm 92, bottom 62.6), so the top arm leans about 32° toward the feet. **Fix:** at T ≈ 56, use shAbd_R ≈ 124 and shAbd_L ≈ 56. At a deeper T ≈ 70, use ≈ 110 and ≈ 70.
- Keep the hand-on-shin touch.

---

### Chair Pose (`chair`)
**How to do it**
1. Stand with your feet together or hip-width apart and raise your arms overhead.
2. Bend your knees and sit your hips back as if onto a chair, lowering toward thighs parallel (or as far as you can).
3. Keep your weight in your heels and lean your torso slightly forward, roughly at a right angle to your thighs.
4. Reach your arms up beside your ears with your shoulders down. Hold.

**Key positions:** knee ≈ 60–90; thigh ≈ 30–45° from horizontal; torso lean ≈ 20–45° (pitch); hipF ≈ 80–100 (torso and thigh roughly at a right angle); ankle ≈ −10 to −25; shF ≈ 160–180 (arms in line with the torso).

**Sources:** https://liforme.com/blogs/blog/chair-pose-utkatasana ; https://www.yogajournal.com/article/beginners/take-a-seat/

**App check:** Matches. With pitch 28, hipF 88 and knee 72, the thighs are about 30° from horizontal and the torso and thigh meet at about 90°. Arms are at 170.

---

### Bridge Pose (`bridge-yoga`)
**How to do it**
1. Lie on your back with knees bent and feet flat, hip-width apart. Your heels should be close enough to graze with your fingertips.
2. Press through your feet and arms and lift your hips until your **thighs are about parallel to the floor**, knees over your heels and not splaying out.
3. Roll your shoulders under. Arms stay on the floor (or hands clasp under you), and your neck stays still.
4. Breathe, then roll down slowly.

**Key positions:** shoulders and upper back on the floor; hips lifted with thighs about horizontal; shins about vertical, so knee ≈ 90–110; hipAbd ≈ 0 (knees hip-width); shF ≈ −40 to −60 with arms flat on the floor; neckF ≈ 0 (no turning).

**Sources:** https://www.yogajournal.com/poses/perfect-your-bridge-pose-in-6-steps/ ; https://liforme.com/blogs/blog/bridge-pose-setu-bandhasana

**App check:** Matches.
- With pitch −122 and hipF −22, the thighs rise only about 10° from hips to knees, which is about parallel, and knee 105 keeps the shins vertical.
- The −22° hip extension is a lot for a real hip, but it is how the rigid-torso avatar fakes the thoracic curve. No change needed.

---

### Standing Forward Fold (`forward-fold`)
**How to do it**
1. Stand with your feet hip-width apart and parallel.
2. Exhale and hinge forward by tipping your pelvis, keeping your back long. Let the spine round only once the hips have folded as far as they go.
3. Let your head and arms hang. Hands can go to the floor, your shins or opposite elbows.
4. Bend your knees as much as needed, especially if your back rounds a lot.

**Key positions:** hipF ≈ 70–100 (pelvis tipped forward); spineF ≈ 20–40 (relaxed rounding); knee ≈ 0–20; arms hanging (shF ≈ pitch + spineF); neckF ≈ 10–20 (head relaxed).

**Sources:** https://liforme.com/blogs/blog/yoga-poses-standing-forward-fold ; https://www.brettlarkin.com/category/yoga-pose/page/9/

**App check:** Matches. The app uses pitch 75, hipF 81, spineF 35 and knee 5. The arms (shF 105 against a torso pitch of 110) hang almost vertically.

---

### Seated Forward Bend (`seated-fold`)
**How to do it**
1. Sit with your legs straight out in front, feet flexed and toes pointing up.
2. Inhale to lengthen your spine, with arms up as an option.
3. Exhale and fold forward **from the hips** toward your thighs. Hold your shins, ankles or feet, or rest your hands on the floor.
4. Bend your knees if your hamstrings are tight. Reaching your toes is not the goal.

**Key positions:** legs on the floor (hipF − pitch ≈ 90, thighs horizontal); knee 0 (or ≈ 10–20 if tight); ankle ≈ 0 (feet flexed); pelvis tipped forward (pitch ≈ 30–50); spineF ≈ 20–40; arms reaching forward toward the feet (shF ≈ 120–160).

**Sources:** https://liforme.com/blogs/blog/seated-forward-fold-paschimottanasana ; https://www.brettlarkin.com/seated-forward-bend-pose-paschimottanasana/

**App check:** Matches (pitch 40, hipF 130, so the thighs are horizontal; spineF 35; ankle 0; shF 150).

---

### Standing Quad Stretch (`quad-stretch`)
**How to do it**
1. Stand tall, near a wall or chair for support if needed.
2. Grab one ankle with the same-side hand and pull your heel up and back toward your buttock until you feel a stretch in the front of your thigh.
3. Keep your **knees close together**, tighten your abs and push your hips slightly forward.
4. Hold about 30 s, then switch.

**Key positions:** knee ≈ 140–160; hipF ≈ 0 to −10 (thigh vertical or slightly back); hipAbd ≈ 0 (knees together); same-side arm reaching back (shF ≈ −30 to −50, elbow ≈ 20–40); other arm out or on support; trunk upright (spineF ≈ 0).

**Sources:** https://www.kuh.ku.edu.tr/mayo-clinic-care-network/mayo-clinic-health-information-library/first-aid/a-guide-to-basic-stretches ; https://www.columbiadoctors.org/health-library/multimedia/standing-quad-stretch/

**App check:** Matches (knee 155, hipF −7, same-side hand on the top of the foot, other arm forward).

---

### Cross-body Shoulder Stretch (`shoulder-stretch`)
**How to do it**
1. Stand tall with your shoulders relaxed and down.
2. Bring one straight arm across your chest at about shoulder height.
3. Hold it with your other arm just above or below the elbow and gently pull it closer to your chest.
4. Hold about 30 s, then switch.

**Key positions:**
- Stretched arm: shF ≈ 80–90, shAbd ≈ −30 to −50 (across the body), elbow 0.
- Helping arm: elbow ≈ 90–120, hand at the other arm's elbow.
- Trunk: no twist.

**Sources:** https://www.kuh.ku.edu.tr/mayo-clinic-care-network/mayo-clinic-health-information-library/first-aid/a-guide-to-basic-stretches ; https://news.publix.org/great-place-to-work/stretch-smart-to-stay-strong/

**App check:** Matches (shF_L 88, shAbd_L −45, elbow 0; right elbow 110 hooking the arm).

---

### Deep Breathing (`deep-breath`)
**How to do it**
1. Stand straight and relaxed with your feet hip-width apart.
2. Inhale slowly as you raise your arms out to the sides and up overhead, without arching your back.
3. Exhale slowly as you lower your arms back to your sides.
4. Repeat about 5 times, relaxing your shoulders.

**Key positions:** start shAbd ≈ 5–15; top shAbd ≈ 160–180 with elbows nearly straight (0–10); spineF ≈ 0 (no back arch); neckF ≈ 0 to −10 (slight upward gaze is optional).

**Sources:** https://au.physitrack.com/home-exercise-video/arms-overhead-and-breathing-in-standing---control ; https://www.yogaindailylife.org/system/en/level-1/sarva-hita-asanas-part-3/raising-and-lowering-the-arms

**App check:** Matches (shAbd 10 to 170, no spine extension, neckF −8).

---


---

## Morning Move: technique research, bodyweight strength, cardio & core batch

**Web access:** WebSearch worked; pages were not opened in full. Each note is based on the search
engine's excerpts of the cited pages. Every URL below was returned by search. Details not backed by
an excerpt are marked "(own knowledge)". Pose numbers are the app's joint angles (see EXERCISES.md).

---

### Reverse Lunges (`reverse-lunges`)
**How to do it**
1. Stand tall, feet hip-width apart, hands on hips.
2. Take a big step back with one foot and land on the ball of that foot.
3. Lower the back knee toward the floor (stop a few cm above it), chest lifted; front shin about vertical.
4. Push through the front foot to return to standing. Alternate legs.

**Key positions:** front leg hipF ≈ 90, knee ≈ 90, shin vertical; back thigh about vertical
(hipF ≈ 0), knee ≈ 90, on the toes (ankle ≈ −35); trunk upright or slightly forward (pitch ≈ 8).

**Sources:** https://acefitness.org/resources/everyone/exercise-library/319/reverse-lunge ;
https://catalystathletics.com/exercise/735/Reverse-Lunge/ ;
https://www.masterclass.com/articles/reverse-lunge-guide

**App check:** New. Bottom frame: front hipF 90 / knee 88, back hipF 1.8 / knee 90 / ankle −33,
pitch 8. Level 1 because stepping back is easier on the knee than a forward lunge (own knowledge);
the tip offers a chair for balance.

---

### Side Lunges (`side-lunges`)
**How to do it**
1. Stand with feet together, hands clasped in front of the chest.
2. Take a wide step to one side. Sit the hips back over that foot, bending that knee; the other leg
   stays straight.
3. Both heels stay flat on the floor. The bent knee tracks over the foot (shorten the step if it caves in).
4. Push off the bent leg back to the start and switch sides.

**Key positions:** bent leg hipF ≈ 80, knee ≈ 85, shin over foot; straight leg abducted ≈ 40°;
trunk leans forward ≈ 30° with a flat back; both feet flat.

**Sources:** https://acefitness.org/exerciselibrary/50 ;
https://www.acefitness.org/about-ace/press-room/in-the-news/8340/how-to-do-a-lateral-lunge-to-work-your-inner-thighs-and-glutes-livestrong/

**App check:** New. Bent leg hipF 80 / knee 85 / hipAbd 20, straight leg hipAbd 41, pitch 30,
both feet on the floor (checker BALANCE passes). Shown from the three-quarter view.

---

### Sumo Squats (`sumo-squats`)
**How to do it**
1. Stand with feet wider than shoulders, toes turned out about 30–45°.
2. Keep the chest up and lower the hips straight down, knees pushing out over the toes.
3. Go as low as you can with heels down and a neutral back.
4. Push through the whole foot to stand and squeeze the glutes at the top.

**Key positions:** wide stance (hipAbd ≈ 25 standing, ≈ 40 at the bottom); thighs near parallel
(hipF ≈ 83, knee ≈ 95); shins near vertical; trunk more upright than a normal squat.

**Sources:** https://healthline.com/health/fitness-exercise/sumo-squat-exercises ;
https://www.strengthlog.com/sumo-squat ; https://fitbod.me/exercises/sumo-squat

**App check:** New. Top: hipAbd 25, hipRot 35 (toes out). Bottom: hipAbd 40, hipRot 0, hipF 83,
knee 95, pitch 24. Note: in this rig, external rotation of a flexed hip swings the feet inward, so the
bottom frame uses abduction (not rotation) to keep knees over toes.

---

### Step Jacks (`step-jacks`)
**How to do it**
1. Stand tall, feet together, arms at your sides.
2. Step one foot out to the side and sweep both arms overhead, shifting your weight onto it.
3. Step back in and lower the arms with control.
4. Repeat to the other side. Core braced, do not arch the lower back as the arms go up.

**Key positions:** one leg out ≈ 25° abduction, both feet on the floor; arms overhead
(shAbd ≈ 165); no flight phase.

**Sources:** https://www.puregym.com/exercises/cardio/jumping-jack/step-jacks/ ;
https://trainwell.net/exercises/step-jack ; https://motra.com/exercises/stepJacks

**App check:** New, Level 1 low-impact cardio. Arms 165°, stepping leg hipAbd 25, small weight
shift (roll 10°).

---

### Skaters (`skaters`)
**How to do it**
1. Stand on one leg with a slight squat.
2. Hop (or step) sideways onto the other foot, landing softly with the knee bent.
3. Sweep the trailing leg behind the landing leg without putting it down, and swing the arms across the body.
4. Pause briefly to control the landing, then hop back the other way.

**Key positions:** landing leg hipF ≈ 60, knee ≈ 55; trunk forward ≈ 30°; trailing leg behind and
across (hipAbd ≈ −15, knee ≈ 50); trunk turned toward the landing leg.

**Sources:** https://www.builtlean.com/speed-skaters-exercise/ ;
https://us.physitrack.com/home-exercise-video/skate-jumps ;
https://prod.emoryhealthcare.org/centers-programs/acl-program/return-to-play/skaters-hold

**App check:** New, Level 2. Landing frames on one foot (BALANCE passes), airborne frames
`lift: 0.1`. Low-impact option (step instead of hop) is in the tip.

---

### Inchworm (`inchworm`)
**How to do it**
1. Stand tall. Hinge forward at the hips and put your hands on the floor (bend the knees as needed).
2. Walk the hands forward until you are in a high plank, body in one line.
3. Walk the hands back toward the feet.
4. Roll up to standing. (ACE adds a push-up at the plank; optional.)

**Key positions:** fold with hands on the floor; half-way "walked out" inverted V; high plank
(arms vertical, shF = pitch).

**Sources:** https://www.acefitness.org/exerciselibrary/254/inchworms ;
https://theprehabguys.com/vimeo-video/inch-worm-walking/

**App check:** New, Level 2 (ACE rates the push-up version advanced, so the app omits the push-up).
Six frames: stand → fold (knees 34°, hands down) → inverted V → plank (held longer) → inverted V → fold.
The hands do not visibly "walk"; the model blends between positions.

---

### Plank Shoulder Taps (`plank-shoulder-taps`)
**How to do it**
1. High plank, hands under shoulders, feet wider than hip-width for stability.
2. Lift one hand and tap the opposite shoulder.
3. Put it down and repeat with the other hand.
4. Keep the hips square and still (anti-rotation); squeeze glutes, brace the core, move slowly.

**Key positions:** HIGH_PLANK with feet apart (hipAbd 10); tapping hand at the opposite shoulder.

**Sources:** https://redefiningstrength.com/plank-with-shoulder-taps/ ;
https://www.muscleandstrength.com/exercises/shoulder-taps ;
https://www.bustle.com/wellness/plank-shoulder-tap-benefits

**App check:** New, Level 2. Touch rule: tapping hand within 10 cm of the opposite shoulder marker.
Tip gives the knees-down option.

---

### Reverse Crunches (`reverse-crunches`)
**How to do it**
1. Lie on your back, arms by your sides, knees bent 90° and lifted over the hips.
2. Exhale and use the abs to curl the pelvis up off the floor toward the ribs.
3. Keep the knee angle the same; no kicking or swinging.
4. Lower slowly back to the start.

**Key positions:** start hipF 90, knee 90; top: pelvis rolled up (pitch −110, spine flexed 20,
hipF 110); upper back, arms and head stay on the floor.

**Sources:** https://acefitness.org/exerciselibrary/76 ;
https://theprehabguys.com/vimeo-video/reverse-crunch/ ;
https://catalystathletics.com/exercise/320/Reverse-Crunch/ ;
https://www.healthline.com/health/reverse-crunches

**App check:** New, Level 1 (ACE lists it as intermediate; it is used here as a gentle core move,
small range). Both frames keep the back and arms on the floor.

---

### Heel Touches (`heel-touches`)
**How to do it**
1. Lie on your back, knees bent, feet flat and a little apart.
2. Lift the head and shoulders slightly; arms long by your sides.
3. Bend sideways to reach one hand toward the same-side heel, then the other.
4. Lower back stays on the floor; slow and controlled.

**Key positions:** BACK_KNEES with feet wider; spineF ≈ 27 (shoulders up), spineSide ±20; reaching
hand near the heel.

**Sources:** https://barbend.com/heel-touches ;
https://www.muscleandstrength.com/exercises/lying-heel-touches.html ;
https://fitnessvolt.com/alternate-heel-touchers-guide/

**App check:** New, Level 1. Touch rule hand → same heel ≤ 15 cm. The fitter left the heels about
5 cm up (on the balls of the feet); feet-flat would be slightly more accurate.

---

### Hollow Body Hold (`hollow-hold`)
**How to do it**
1. Lie on your back and press the lower back into the floor.
2. Lift the shoulders off the floor and reach the arms past the ears.
3. Lift straight legs a little off the floor, toes pointed.
4. Hold while breathing; if the back arches, bend the knees or bring the arms forward.

**Key positions:** lower back on the floor; spineF ≈ 22; shF ≈ 165; hipF ≈ 30, knees straight.

**Sources:** https://www.hingehealth.com/gb/en/resources/articles/hollow-body-hold/ ;
https://experiencelife.lifetime.life/article/break-it-down-the-hollow-body-hold/feed/ ;
https://www.caliverse.app/exercises/hollow-body-hold-32

**App check:** New, Level 3, single-frame hold; only the seat/lower back touch the floor.

---

### Donkey Kicks (`donkey-kicks`)
**How to do it**
1. On all fours, hands under shoulders, knees under hips, back flat.
2. Keep one knee bent at 90° and press that foot up toward the ceiling, squeezing the glute.
3. Small, controlled lift: stop before the lower back arches or the hips twist.
4. Lower without touching the knee down; alternate (or do all reps on one side).

**Key positions:** TABLETOP; working hip extended to about thigh-level with the body (hipF ≈ −10),
knee 90°, sole facing the ceiling.

**Sources:** https://www.thegymgroup.com/exercises/legs-and-glutes-exercises/how-to-do-donkey-kicks/ ;
https://www.strengthlog.com/donkey-kicks/ ; https://www.coachweb.com/glute-exercises/8105/donkey-kicks

**App check:** New, Level 1, alternating legs.

---

### Fire Hydrants (`fire-hydrants`)
**How to do it**
1. On all fours, wrists under shoulders, hips over knees, back flat.
2. Keep the knee bent at 90° and lift the leg out to the side, up toward hip height.
3. Do not rotate the trunk, lean away, or arch the back.
4. Lower with control and alternate.

**Key positions:** TABLETOP; working leg lifted out to the side; knee stays 90°.

**Sources:** https://library.theprehabguys.com/vimeo-video/quadruped-fire-hydrant/ ;
https://www.physitrack.com/exercise-library/how-to-perform-the-fire-hydrant-exercise ;
https://womenshealthsa.co.za/fire-hydrant-exercise/

**App check:** New, Level 1, shown from behind. Limitation: the rig applies hip abduction before
flexion, so a thigh that reaches horizontal from all fours would need ≈ 90° abduction, beyond the
50° range limit. The app uses 50°, so the knee rises to about 40° below hip height (a realistic
"moderate" lift); the tip says "up to hip height".

---

### Clamshells (`clamshells`)
**How to do it**
1. Lie on one side, head on the lower arm, hips and knees bent (about 45° at the hips, 90° at the knees), knees stacked.
2. Keep the feet together and the hips stacked (do not roll back).
3. Lift the top knee toward the ceiling like a clam opening.
4. Lower slowly. Do all reps, then switch sides.

**Key positions:** roll ≈ 90 (side-lying); hipF ≈ 50, knee 90; top hip opens ≈ 35° abduction plus
30° external rotation; feet stay together.

**Sources:** https://www.goodrx.com/well-being/movement-exercise/clamshell-exercise ;
https://www.msdmanuals.com/home/multimedia/video/side-lying-hip-external-rotation-clamshell-exercise ;
https://www.physitrack.com/exercise-library/how-to-perform-the-clamshell-exercise

**App check:** New, Level 1, `sides: true` (switches sides halfway). Bottom arm straight overhead
with elbow bent under the head. Sources disagree on knee angle (45° vs 90°); the app uses 90° knees.

---

### Good Mornings (`good-mornings`)
**How to do it**
1. Stand with feet hip-width, hands lightly behind the head, knees soft.
2. Push the hips back and tip the chest forward with a flat back.
3. Stop at about horizontal, or sooner when you feel the hamstrings.
4. Drive the hips forward to stand tall. Neck neutral.

**Key positions:** pitch ≈ 70 trunk, hipF ≈ 82, knee ≈ 15; spine neutral (spineF 0).

**Sources:** https://www.coachweb.com/exercises/back-exercises/184/good-morning ;
https://www.masterclass.com/articles/good-morning-exercise-guide ;
https://www.motra.com/exercises/bodyweightGoodMorning

**App check:** New, Level 1. Balance check passes with the hips shifted back.

---

### Standing Side Crunch (`standing-oblique-crunch`)
**How to do it**
1. Stand with feet about shoulder-width apart, hands behind the head (fingers not locked), elbows wide.
2. Lift one knee up and out to the side.
3. Bend sideways to bring the same-side elbow down to meet it; do not pull on the neck.
4. Return to standing and alternate.

**Key positions:** standing on one foot; lifted leg hipF ≈ 60, hipAbd ≈ 40, knee 90; spineSide ±25.

**Sources:** https://fitbod.me/exercises/standing-oblique-crunch ;
https://www.tomsguide.com/features/i-did-the-standing-bicycle-crunch-for-a-week-heres-what-happened-to-my-core ;
https://www.sweat.com/exercises/standing-x-crunch

**App check:** New, Level 1. Differs from `knee-elbow` (cross-body) by being a same-side crunch.

---

### Plank to Down Dog (`plank-to-dog`)
**How to do it**
1. Start in a high plank, hands under shoulders, body straight.
2. Press the floor away through the arms and shoulder blades and lift the hips up and back into an
   inverted V.
3. Heels reach toward the floor; bend the knees if the hamstrings are tight.
4. Shift forward and lower back to the plank with control.

**Key positions:** HIGH_PLANK ↔ the app's `downward-dog` pose (pitch 132, shF 174, hipF 89).

**Sources:** https://julielohre.com/plank-to-downward-dog/ ;
https://motra.com/exercises/plankToDownwardFacingDog ;
https://theprehabguys.com/vimeo-video/downward-dog-to-upward-dog/

**App check:** New, Level 2, reuses existing plank and dog angles.

---

### Shadow Boxing (`boxing-punches`)
**How to do it**
1. Feet about hip-width, knees soft, fists by the chin, elbows in, chin slightly tucked.
2. Punch one arm straight out at shoulder height, turning the torso with it; exhale.
3. Pull it straight back to the guard.
4. Punch with the other arm. Control over speed; no jumping, so it is low impact.

**Key positions:** guard shF ≈ 35, elbow ≈ 140; punch shF ≈ 88, elbow ≈ 5, trunk turned ≈ 20°;
knees ≈ 15.

**Sources:** https://experiencelife.lifetime.life/article/shadowboxing-cardio-workout/ ;
https://www.getphysical.com/blog/shadowboxing-for-cardiovascular-endurance ;
https://www.onepeloton.com/blog/what-is-shadowboxing

**App check:** New, Level 1 low-impact cardio. Feet are square rather than in a staggered boxing
stance (simpler for the planner's "standing" moves; own choice).

---

## Technique research, batch 4 (added yoga & stretching)

**Web access:** WebSearch worked; pages could not be opened, so each note is based on the search
engine's excerpts of the cited page. Every URL below is a page that search returned. Notes marked
"(own knowledge)" are standard technique without a direct excerpt.

These 14 exercises were added for people who sit at a laptop all day (hips, upper back, chest,
neck, wrists, hamstrings). Every keyframe passes `node tools/check-poses.mjs` and each pose was
viewed once in `pose-debug.html`.

---

### Half Sun Salutation (`sun-salutation-half`)
**How to do it**
1. Stand tall in Mountain pose, feet together or hip-width, arms by your sides.
2. Inhale and sweep your arms up overhead (Upward Salute).
3. Exhale and fold forward from the hips, knees soft (Standing Forward Bend).
4. Inhale and lift halfway: long flat back, hands on shins or thighs, gaze slightly forward (Half Standing Forward Bend).
5. Exhale and fold again; inhale and rise up with the arms overhead; exhale arms down. Repeat with the breath.

**Key positions:**
- Arms up: shF ≈ 170–180, elbow 0, slight neck extension.
- Fold: pitch + spineF ≈ 110, hipF ≈ 80, knees soft.
- Half lift: spine flat (spineF ≈ 0 to −5), torso about 10° above horizontal, hands to knees/shins, neckF ≈ −20.

**Sources:** https://www.ekhartyoga.com/blog/sun-salutation-a-sequence-with-breath ; https://www.healthline.com/health/fitness/sun-salutation-sequence ; https://www.yogajournal.com/article/poses/ray-of-light/?scope=anon

**App check:** 6 keyframes, 16 s per round: stand → arms up → fold → half lift → fold → arms up.
Half lift uses pitch 82, spineF −5, hands within 16 cm of the knees (`touch`). Hands reach the knees
rather than the shins, which is the common beginner variation.

---

### Low Lunge (`low-lunge`)
**How to do it**
1. From hands and knees or Downward Dog, step one foot forward between your hands, knee over the heel.
2. Lower the back knee to the mat (pad it if needed) and slide the back leg back until you feel a stretch at the front of the back hip.
3. Keep the hips level, lift the torso upright and sweep the arms overhead.
4. Hold for several breaths, then step back and switch sides.

**Key positions:** front hipF ≈ 90, knee ≈ 90–100, shin vertical; back hip extended (hipF ≈ −15 to −25), back knee on the floor, top of the back foot down (ankle ≈ 50); torso upright; arms shF ≈ 170.

**Sources:** https://www.yogajournal.com/poses/low-lunge?scope=anon ; https://liforme.com/blogs/blog/low-crescent-lunge-pose ; https://olaben.com/blogs/olaben-blog/how-to-do-low-lunge-pose-anjaneyasana

**App check:** Matches (front knee 95, back hipF −20.6, knee on the mat, arms 170). `on: 'foot_L knee_R'`, sides.

---

### Thread the Needle (`thread-needle`)
*(Replaces the planned Extended Side Angle, see "Not modelled" below.)*
**How to do it**
1. Start on hands and knees, hips over knees.
2. Optionally reach one arm up to open the chest on an inhale.
3. Exhale and slide that arm under the other arm, palm up, until the shoulder and the side of the head rest on the mat.
4. The other hand stays pressed into the mat (or reaches forward). Breathe for 5–10 breaths, then unwind and switch.

**Key positions:** thighs vertical (hipF ≈ pitch); upper back rotated (spineTwist ≈ 40); threading arm across under the chest (shF ≈ 85, shAbd ≈ −35 to −45, elbow 0); head side-down (neckSide ≈ 25–30).

**Sources:** https://www.yogamatters.com/blogs/pose-library/thread-the-needle-pose-parsva-balasana ; https://liforme.com/blogs/blog/how-to-do-thread-the-needle-stretch ; https://dimensions.com/element/threading-the-needle-pose

**App check:** Mostly matches: hips over knees (pitch = hipF 119.7), spineTwist −40, threading arm across, head on the mat. The threading shoulder stays about 10 cm above the mat, because the rig's spine twist stops at 45°.

---

### Seated Spinal Twist (`seated-twist`)
**How to do it** (Mayo Clinic version)
1. Sit on the floor, legs straight out in front, hands on the floor behind you, fingers pointing away.
2. Place one foot flat on the floor on the outside of the opposite knee.
3. Place the opposite elbow on the outside of the bent knee.
4. Turn your chest, head and eyes toward the bent knee and hold about a minute, breathing. Return head then chest to centre, and switch.

**Key positions:** straight leg on the floor (knee 0); bent leg hipF ≈ 120–130, knee ≈ 110–130, foot flat; spineTwist ≈ 40–45 toward the bent knee; back hand on the floor behind (shF ≈ −35); hugging elbow against the outside of the knee.

**Sources:** https://www.mayoclinic.org/healthy-lifestyle/stress-management/multimedia/seated-spinal-twist/vid-20453586 ; https://www.mymlc.com/health-information/videos/lifestyle/stress-management/stress-relief/seated-spinal-twist/

**App check:** Matches (`on: 'seat heels hand_L'`, spineTwist 40, right elbow within 17 cm of the left knee, left hand behind on the floor). The pelvis leans back 20° and the spine flexes 12° to keep the chest upright.

---

### Butterfly Stretch (`butterfly`)
**How to do it**
1. Sit on the floor with the soles of your feet together and let your knees fall out to the sides.
2. Hold your feet and draw the heels toward you (farther away is easier on the knees).
3. Sit tall, then lean forward from the hips without rounding the lower back or hunching the shoulders.
4. Breathe and hold 15–30 s; repeat about 3 times.

**Key positions:** hipAbd ≈ 45, hipRot ≈ 50, knee ≈ 130–140, soles together; hands on the feet; slight forward lean.

**Sources:** https://www.healthline.com/health/exercise-fitness/how-to-stretch-inner-thigh ; https://www.hingehealth.com/resources/articles/butterfly-stretch ; https://dummies.com/health/exercise/how-to-do-the-butterfly-stretch

**App check:** Matches (hipAbd 45, hipRot 50, knee 135, hands within 10 cm of the toes). The forward lean comes partly from the spine (spineF 35), so the back is a little rounder than the "lean from the hips" cue.

---

### Knees to Chest (`knees-to-chest`)
**How to do it**
1. Lie on your back with knees bent and feet flat.
2. Bring one knee, then both, toward your chest, holding the shins or the backs of the thighs.
3. Keep your head and shoulders relaxed on the mat and your lower back pressed down.
4. Hold 15–30 s (Mayo: 5 s holds, 2–3 repeats, morning and evening).

**Key positions:** pitch −90 (on the back); hipF ≈ 125–130, knee ≈ 130–140; arms around the shins (elbow ≈ 50–90).

**Sources:** https://www.mayoclinic.org/healthy-lifestyle/adult-health/multimedia/lower-back-stretches/vid-20084700 ; https://mayoclinic.org/healthy-lifestyle/adult-health/in-depth/back-pain/art-20546859?p=1 ; https://uofmhealth.org/health-library/abk4460

**App check:** Matches the double-knee version (hipF 129.5, knee 140, hands within 10 cm of the shins). The upper back curls slightly (spineF 15) so the hands can reach.

---

### Lying Spinal Twist (`supine-twist`)
**How to do it**
1. Lie on your back with knees bent and feet flat, arms out in a T.
2. Exhale and lower both knees to one side.
3. Keep both shoulder blades on the floor; turn your head the other way if comfortable. A block or cushion under the knees is fine.
4. Hold 5–10 breaths, then switch.

**Key positions:** hipF ≈ 90, knee ≈ 90; pelvis rolled 45–90° to the side; chest flat; arms out at shoulder height; neckTurn away from the knees.

**Sources:** https://yogainternational.com/article/view/reclining-abdominal-twist ; https://ca.liforme.com/blogs/blog/how-to-do-supine-spinal-twist-pose-supta-matsyendrasana ; https://www.motra.com/exercises/supineSpinalTwistPose ; https://beyogi.com/poses/supine-spinal-twist/

**App check:** Partly matches. The chest and both arms stay on the mat, but the pelvis rolls only about 45°, so the knees hover just above the floor (like the "rest the knee on a block" option). The arms make a wide V (shAbd 60) rather than a T so the hands reach the mat. Pelvis roll is expressed as `pitch −45, yaw 90, roll −90` (a roll about the body's long axis).

---

### Puppy Pose (`puppy-pose`)
**How to do it**
1. Come onto all fours, shoulders over wrists, hips over knees.
2. Walk your hands forward a few inches.
3. Exhale and let your chest sink toward the floor; keep the arms active with the elbows off the floor.
4. Rest your forehead on the mat (or a block) and keep a slight curve in the lower back.

**Key positions:** thighs near vertical (hipF ≈ pitch); chest low (pitch ≈ 120–130); arms overhead shF ≈ 170–180, elbow 0; forehead down; spineF slightly negative.

**Sources:** https://www.yogajournal.com/pose/extended-puppy-pose?scope=anon ; https://liforme.com/blogs/blog/puppy-pose-uttana-shishosana ; https://www.yogamatters.com/blogs/pose-library/puppy-pose-uttana-shishosana

**App check:** Matches (pitch 125, hipF 114, spineF −16, arms 175, forehead and hands on the mat, elbows up).

---

### Sphinx Pose (`sphinx`)
**How to do it**
1. Lie on your belly, legs extended, tops of the feet down.
2. Set your elbows under your shoulders with forearms flat and parallel.
3. Inhale and lift your upper torso and head into a mild backbend, pressing through the forearms so the shoulders stay away from the ears.
4. Keep the neck long; press the pubic bone and feet down.

**Key positions:** pitch ≈ 90; spineF ≈ −25 to −35; upper arms near vertical; elbow ≈ 90; neckF ≈ −10; ankle ≈ 60.

**Sources:** https://www.yogajournal.com/pose/sphinx-pose?scope=anon ; https://liforme.com/blogs/blog/how-to-practice-sphinx-pose-salamba-bhujangasana

**App check:** Matches (spineF −34.5, elbow 90, forearms, hips and knees on the mat). Elbows sit slightly ahead of the shoulders (upper arm about 17° forward of vertical), which is common in practice.

---

### Boat Pose (`boat-pose`, Intermediate)
**How to do it**
1. Sit with knees bent and feet flat, hands beside your thighs.
2. Lean back slightly with a long, straight spine and lift your feet so your shins are parallel to the floor (half boat).
3. Reach your arms forward, parallel to the floor, beside the legs.
4. Keep the chest lifted; don't let the back round. Straighten the legs for the full pose.

**Key positions:** pitch ≈ −35 to −45; hipF ≈ 100–115; knee ≈ 80–90 (shins level); arms horizontal (shF ≈ 90 + pitch ≈ 50); spine straight.

**Sources:** https://yogainternational.com/article/view/connecting-to-your-core-4-ways-to-practice-boat-pose ; https://yogauonline.com/yoga-health-benefits/yoga-wellness/how-to-do-boat-pose-in-yoga-navasana-free-online-yoga-video-with-natasha-rizopoulos/ ; https://pranayoga.co.in/asana/navasana-boat-posture/

**App check:** Matches half boat (pitch −40, hipF 110, knee 85, arms forward at shF 50). Category `yoga`; muscles abs, hip flexors, obliques, lower back. No ACE entry was found.

---

### Standing Chest Opener (`chest-opener`)
**How to do it**
1. Stand with feet hip-width apart.
2. Clasp your hands behind your back (or hold a towel).
3. Straighten your arms, draw the shoulder blades down and back and lift the chest; lift the hands slightly away from the back.
4. Don't arch the lower back or push the hips forward. Hold 15–30 s, breathing.

**Key positions:** shF ≈ −40 to −50, arms slightly in (shAbd ≈ −10 to −15), elbow 0, hands together; spine neutral; slight chin lift.

**Sources:** https://www.acefitness.org/education-and-resources/lifestyle/exercise-library/209/standing-chest-stretch/ ; https://us.physitrack.com/home-exercise-video/chest-and-upper-back-stretch ; https://motra.com/exercises/claspedHandsChestStretch

**App check:** Matches (shF −45, shAbd −14.5, hands within 6 cm of each other, no back arch). The rig has no shoulder-blade movement, so "draw the shoulder blades back" is only in the tip.

---

### Neck Rolls (`neck-rolls`)
**How to do it**
1. Sit or stand tall with shoulders relaxed.
2. Tilt one ear toward its shoulder.
3. Roll the chin slowly down across the chest to the other side, then back. Use half circles; do not drop the head backward.
4. Move slowly and stop before any pain.

**Key positions:** neckSide ≈ ±30–35; chin down neckF ≈ 30–40; no neck extension.

**Sources:** https://www.colorado.edu/ehs/media/329 ; https://www.wsh.nhs.uk/covid-staff-zone/Your-wellbeing/docs/New-neck-and-shoulders-loosening.pdf

**App check:** Matches: 4 keyframes (ear left, chin down, ear right, chin down), 8 s per cycle. Shoulder rolls (also in the NHS leaflet) could not be shown because the rig has no shoulder-blade/collarbone joint. Note: this is close to the existing `neck-tilt`, but adds the chin-down part of the arc.

---

### Wrist & Forearm Stretch (`wrist-stretch`)
**How to do it**
1. Hold one arm straight out in front, elbow straight.
2. **Flexor stretch:** palm facing forward, fingers up; with the other hand gently pull the fingers back toward you.
3. **Extensor stretch:** turn the palm down and gently press the back of the hand so the fingers point down.
4. Hold each 15–30 s, 2–4 times, then switch arms. Ease off if it hurts.

**Key positions:** stretched arm shF ≈ 90, elbow 0; wrist ≈ +70 (fingers back) then ≈ −70 (hand down); helping hand on the fingers.

**Sources:** https://www.healthlinkbc.ca/healthwise/stretches-ease-wrist-and-arm-aches-and-fatigue ; https://uofmhealth.org/health-library/zm2290 ; https://healthy.kaiserpermanente.org/health-wellness/health-encyclopedia/he.wrist-exercises.ad1518

**App check:** Matches: 4 keyframes over 12 s (flexor stretch held, then extensor stretch held), helping hand within 9 cm of the stretched hand, sides. The hands are simple blobs, so the finger pull is suggested rather than shown.

---

### Standing Hamstring Stretch (`hamstring-stretch`)
**How to do it**
1. Stand tall, then put one foot forward on its heel with the toes up and that knee straight (or nearly).
2. Bend the back knee slightly.
3. Keeping the back flat, hinge forward at the hips (hands on hips or the back thigh) until you feel a stretch in the back of the front leg.
4. Hold 15–30 s, 2–4 times each leg. No rounding, no bouncing.

**Key positions:** front leg knee 0, ankle ≈ −20 to −30 (toes up), heel on the floor; back knee ≈ 15–25; hip hinge pitch ≈ 40–45 with spineF ≈ 0.

**Sources:** https://www.columbiadoctors.org/health-library/multimedia/hamstring-stretch-standing/ ; https://fitwill.app/en/exercise/1909/standing-toe-up-hamstring-stretch ; https://www.concordhospital.org/patients-visitors/health-library/viewer/?id=acl0420

**App check:** Matches (front knee 0, ankle −25, back knee 21.6, hinge pitch 44 with a flat back, hands on hips, balanced). The front foot is only about 19° ahead of the body, a short stance.

---

### Not modelled
- **Extended Side Angle:** with the rig's hip-abduction limit (50°), a bent front knee with a horizontal thigh plus a 60° side tilt could not balance with both feet flat. The fitter only "passed" by lifting the heels or exceeding the ROM, so it was swapped for Thread the Needle (upper-back relief for desk workers).
- **Mountain pose with breathing:** skipped, because `deep-breath` and `tadasana-reach` already cover it.
- **Shoulder rolls:** the rig has no shoulder-blade joint, so only neck rolls were added.


## Accuracy audit (October 2026)

Every exercise was re-checked against the sources above with `tools/pose-data.mjs` (body data in cm)
and one final 3D view per change. Below: what was wrong, the fix, and the numbers that prove it.
"Before"/"after" positions are for a 175 cm body. Rig limits found during the audit are listed per group.


### Group 1 audit: warm-up and cardio exercises

Checker: `node tools/check-poses.mjs` gives **236/236 keyframes pass**.
Body numbers come from `tools/pose-data.mjs` and a nearest-marker/surface probe, on a 175 cm body.

#### Changed

##### Standing Knee to Elbow (`knee-elbow`): the main fix
- **Problem:** the elbow never reached the knee. In crunch frame #0, `elbow_R` was at (-45,135,35) and `knee_L` at (11,91,41), about **70 cm apart**. The knee came up only to hip height and the torso hardly crunched. The arm's elbow pointed out to the side, so twisting could not bring it across. Only the left hand had a (loose, 14 cm) head contact.
- **Fix, crunch frames (#0 and its manual mirror #2):**
  - Knee higher and slightly across: `hipF 125, knee 110, hipAbd -2.7`.
  - Twist and crunch: `spineTwist ±45, spineF 50, spineSide ∓9`.
  - The working arm swings its elbow forward and down while the hand stays behind the head: `shF 111.7, shAbd -21.2, shRot -25.7, elbow 124.7`. Without this, the rig's XZY shoulder cannot move a sideways-pointing elbow forward.
  - The other elbow stays wide.
- **Fix, upright frames:** both hands behind the head.
- **Other changes:** view `front` → `threeq`, because the elbow–knee contact happens in depth. Cycle 1.8 → 2 s. Clearer tip.
- **Contacts enforced (touch):**
  - `elbow_R ↔ knee_L ≤ 7 cm` (mirrored in #2).
  - `hand_L/hand_R ↔ head-back ≤ 8 cm` in the crunch and ≤ 7 cm upright.
- **After:** elbow↔knee 7 cm. Hands 5–6 cm from the back of the head. No CLIP.
- **Sources:**
  - https://fitbod.me/exercises/standing-elbow-to-knee-crunch
  - https://ie.physitrack.com/home-exercise-video/side-crunch-in-standing-with-knee-lifts ("bend the trunk to touch knee to elbow")
  - https://blog.healthadvocate.com/2023/06/workout-of-the-week-standing-knee-crunch/
- **Body limit:** the torso leans about 42° from vertical at the crunch. That is more "crunch" than the "don't hunch" cue suggests, but less flexion cannot close the gap with this body's proportions and shoulder rig.

##### Hip Circles (`hip-circles`)
- **Problem:** the shared `HANDS_ON_HIPS` arms put both hands **in front of the belly, touching each other** (hand_L ↔ hand_R 3 cm). The hands were not on the hips.
- **Fix:** I overrode the arms inside this entry, without touching the shared constant: `shF -25, shAbd 45, shRot -55, elbow 100`. The elbows now point out to the sides and the palms sit on the side of the pelvis, at the iliac-crest height. Fingertips are within -4…+1 cm of the pelvis surface and the palm is 5–7 cm from the waist. The tip now says "knees soft" and "shoulders stay over the feet".
- **Contact enforced:** `hand_L/R ↔ seat ≤ 20 cm`. The rig has no side-of-hip marker, so this uses the seat markers at the back corners of the pelvis. The old pose fails it (23 cm) and the new one passes.
- **Sources:**
  - https://fitbod.me/exercises/standing-hip-circle
  - https://www.caliverse.app/exercises/hip-circles-261
  - https://hrs.byu.edu/stretching/warmups
- **Note for the coordinator:** `HANDS_ON_HIPS` is wrong for every exercise that uses it. The hands meet at the belly. Consider changing the constant to `{ shF: -25, shAbd: 45, shRot: -55, elbow: 100 }` and re-checking its users.

##### Torso Twists (`torso-twist`)
- **Problem:** the "arms loose at chest height" pose ended up with one forearm angled down across the belly and the other behind the back (see the before shots). It did not read as any standard variant. The twist was ±45, at the ROM ceiling.
- **Fix:** arms folded across the chest, each hand on the opposite shoulder: `shF 68, shAbd -11, elbow 122, shRot -80`. I set twist to ±40, `knee 6`, cycle 2.4 s, and wrote a new tip.
- **Contacts enforced:** `hand_L ↔ shoulder_R ≤ 8 cm` and `hand_R ↔ shoulder_L ≤ 8 cm`. Measured 7 cm each, and the forearms cross (6 cm apart).
- **Sources:**
  - https://www.physitrack.com/exercise-library/how-to-perform-the-torso-twist-exercise
  - https://www.pdx.edu/recreation/sites/g/files/znldhr2076/files/2020-12/Week%202%20Mobility%20Routine.pdf
  - https://grandavehousing.calpoly.edu/news/standing-warm-up-guide-prime (hips stay forward, twist side to side)

##### Mountain Reach (`tadasana-reach`)
- **Problem:** at the top, the arms were straight up about 40 cm apart.
- **Fix:** palms pressed together overhead (`shAbd 180, elbow 28, shRot 90`), which is the Upward Salute "press palms together" cue. The tip is updated.
- **Contact enforced:** `hand_L ↔ hand_R ≤ 5 cm` at the top.
- **Body limit:** the rig has no shoulder blade or collarbone, and abduction is capped at 180°. The hands can only meet with the elbows about 28° bent, a soft diamond, not perfectly straight arms.
- **Sources:**
  - https://www.yogajournal.com/poses/upward-salute/
  - https://gymgeek.com/exercises/yoga-poses/upward-salute-pose/
  - https://pranayoga.co.in/asana/urdvah-hastasana-upward-hands-posture-upwards-salute/

##### Jumping Jacks (`jumping-jacks`)
- **Problem:** the overhead hands were about 40 cm apart (sources say "almost clapping"), and the knees were locked on landing.
- **Fix:** top frame `shAbd 180, elbow 23, shRot 90`. Both ground frames get `knee 10, hipF 5, ankle -5` for a soft landing. The tip is updated.
- **Contact enforced:** `hand_L ↔ hand_R ≤ 10 cm` at the top.
- **Sources:**
  - https://healthanswers.pfizer.com/physical-activity/aerobic/how-to-do-jumping-jacks
  - https://gymkee.com/sw/exercises/cardio/jumping-jacks
  - https://acibademinternational.com/?p=138642 (soft knees)

##### Butt Kicks (`butt-kicks`)
- **Problem:** the kicking heel stopped 22 cm from the glutes (knee 130).
- **Fix:** `knee 150, hipF -3`. The thigh stays vertical and the heel now reaches the seat. The tip is updated.
- **Contact enforced:** `heel ↔ seat ≤ 10 cm` on each kick frame.
- **Sources:**
  - https://livestrong.com/article/13770360-butt-kicks-exercise
  - https://www.caliverse.app/exercises/butt-kicks-1523
  - https://www.masterclass.com/articles/butt-kicks-guide

##### Squat Jumps (`squat-jumps`)
- **Problem:** the landing frame stood on the heels with the **toes 7 cm in the air** (`ankle -21.6`).
- **Fix:** the landing is `pitch 25, hipF 60, knee 45, ankle -12`. The feet are now flat (toes at 1 cm) and the knee is 45°, which matches the absorbing landing in the sources.
- **Sources:**
  - https://www.acefitness.org/resources/everyone/exercise-library/116/squat-jumps/
  - https://www.nasm.org/resource-center/exercise-library/squat-jump

##### Standing Side Bends (`side-bend`): contact only
- **Checked:** the pose was already right. The lower hand rests on the outside of the thigh (surface distance -2 cm) and the top arm reaches over the head.
- **Added:** a `touch` (hand ↔ same-side knee ≤ 18 cm) so the hand stays on the leg, plus a clearer tip ("slide the other hand down your thigh").

#### Checked, no change needed
- **`march`:** knee at hip height (thigh 92° from vertical), opposite arm swing, stance foot flat.
- **`arm-circles`:** true small circles (below → forward → above → behind), two forward then two backward.
- **`neck-tilt`:** ear to shoulder ±32° through neutral, shoulders still.
- **`high-knees`:** knee at hip height (knee y 98 vs hip y 101), on the ball of the standing foot, short flight frames.
- **`mountain-climbers`:** hands under the shoulders (wrist z = shoulder z = 44). The driving knee comes under the chest, 20 cm from the elbow, with the foot off the floor.
- **`burpees`:** stand → squat with hands on the floor just outside the feet → high plank → squat → jump with arms overhead.
- **`plank-jacks`:** high plank, ankles 24 → 62 cm apart, hips level.

#### Rig and tool limits hit
1. **No side-of-hip marker.** "Hands on hips" can only be enforced loosely through the `seat` markers. A `hip_L/R` marker on the pelvis side (about ±0.15, 0.02, 0) would make this exact.
2. **The shared `HANDS_ON_HIPS` constant puts the hands at the belly, touching each other.** It affects other exercises; the suggested values are above.
3. **No shoulder-blade elevation, and abduction is capped at 180°.** Hands can only meet overhead with bent elbows (Mountain Reach, Jumping Jacks).
4. **XZY shoulder order.** With the elbow out to the side (shAbd ≈ 90–120), `shF` only spins the arm. To bring an elbow forward (knee-to-elbow), you have to switch to a forward arm pose (high shF, negative shAbd) with negative rotation.
5. **The checker's fitter cost ignores CLIP.** For this work I used a scratch copy that adds a clip penalty. It also accepts wrapped angles (it suggested `shAbd 336.7`), a fitter trap worth guarding against in `romExcess`/`cost`.
6. **Contact with a body surface is approximated by marker-to-marker distances,** so thresholds of 7–10 cm mean real skin contact for hands, which are marker-centred.


### Group 2 audit notes

Squats, lunges, calf raises, knee push-ups, push-ups, glute bridge, superman, bird dog, plank, crunches, dead bug, leg raises, flutter kicks, bicycle and side plank.

Only the entries for these exercises in `js/exercises.js` changed. No shared constants were edited (overrides are spread inside the entries).
Checker: `236/236 keyframes pass`.


A key finding that affects every floor exercise: the renderer keeps the pelvis fixed in x/z. Any keyframe that rotates the whole body therefore makes the planted hands or feet **slide along the floor**. I fixed this with the existing `z` pelvis-shift key plus re-fitted angles, so the support points stay put.

Sources were reached through WebSearch excerpts only, because page fetching was blocked. I reused the URLs from docs/EXERCISE-TECHNIQUE.md and added the new ones below.

---

##### Push-ups (`pushups`): changed
- **Wrong:** between top and bottom the hands slid 25 cm toward the feet. Wrist-to-toes distance went from 145 to 120 cm. At the bottom the wrists ended up beside the waist, 29 cm behind the shoulders.
- **Fix:** top `{...HIGH_PLANK, pitch 73.8, shF 62, ankle 28.2}`, which puts the wrists 10 cm behind the shoulder joint (hands under the shoulders and upper chest). Bottom `{...PUSHUP_DOWN, pitch 88, shF -4.7, shAbd 24, elbow 105, ankle 4.4, z 0.059}`.
- **Numbers (after):** wrist z 35 → 32 (3 cm drift, before 25 cm). Toes −98 → −93 (toe roll). Chest 8–9 cm off the floor at the bottom. Elbow flare shAbd 24 (≈45° tuck cue).
- **Contacts:** `on: 'hands toes'` (checker). The hands staying planted is enforced by the fit, not by the checker (see limits).
- **Sources:** acefitness.org/resources/everyone/exercise-library/13/bent-knee-push-up/ ; catalystathletics.com/exercise/869/Push-Up/

##### Knee push-ups (`knee-pushups`): changed
- **Wrong:** the hands slid 13 cm (hand–knee 85 → 72 cm), and the chest stayed 16 cm up.
- **Fix:** top `pitch 58.7, shF 50`. Bottom `pitch 78.5, shF -9.4, shAbd 17.2, elbow 94.7, knee 73.9, z 0.093` (the knee angle keeps the raised feet where they were).
- **Numbers:** wrist z 32 → 31, knee z −38 → −36, chest 11 cm, hips-front 5 cm (no sag onto the floor).
- **Sources:** ACE bent-knee push-up (above) ; mayoclinic.org/healthy-lifestyle/fitness/multimedia/pushups/vid-20084674

##### Glute bridge (`glute-bridge`): changed
- **Wrong:** at the top the heels were 4 cm off the floor (the person was on tiptoe), and the hips were 3° past the line.
- **Fix:** top `{pitch -108.3, hipF 0, knee 88.8, ankle 19.5, shF -33.4, z -0.026}`. The fit kept the shoulders and heels at their start positions.
- **Numbers:** heel and toes y 0/0 (before 4/0). Heel z 51 = start. Shoulder joint z −48 = start. Shoulder 18, hip 35 and knee 48 cm sit on one line. Hands on the floor.
- **Note:** the old doc estimate of a trunk angle of 30–40° can't be reached together with vertical shins and a straight shoulder–knee line on this body. About 18–20° is the geometric result.
- **Contacts:** `on: 'back feet arms'`. Tips rewritten (hip-width feet, straight line, no arch).
- **Sources:** physitrack glute bridge ; acefitness.org/resources/everyone/exercise-library/66/glute-bridge

##### Crunches (`crunches`): changed
- **Wrong:** both arms pointed up at the ceiling (shF 40–50), which is not a recognised crunch arm position.
- **Fix:** arms crossed on the chest, as in the Mayo Clinic video, in both frames: `shF 40.5, shAbd -14.4, elbow 117.7, shRot -80.3`. Up frame `spineF 28, neckF 12`, so the shoulder blades clear the floor and the lower back stays down. In frame 1, `back` is 2 cm from the floor.
- **Contacts enforced:** `touch: hand_L→shoulder_R ≤ 9 cm, hand_R→shoulder_L ≤ 9 cm` (measured about 7 cm).
- **Sources:** https://www.mayoclinic.org/healthy-lifestyle/fitness/multimedia/abdominal-crunch/vid-20084664 (arms crossed, head and shoulders up, hands behind the head discouraged)

##### Bicycle crunches (`bicycle`): changed
- **Wrong:** the elbow never went near the knee. Right elbow to left knee was about 52 cm (elbow at x −39, knee at x +11). The hands floated about 20 cm from the back of the head.
- **Fix:** new frames fitted with spineTwist ±45 (the rig maximum) and spineF 45. The twisting-side arm brings its elbow forward across the body (`shAbd 10, shF 95, elbow 120, shRot -30`) with the fingertips at the side of the head. The other arm stays wide with the hand behind the head (`shAbd 153.6, shF 27.9, elbow 111.3, shRot 89.4`). Bent knee `hipF 102, knee 125, hipAbd -7`. Straight leg `hipF 25`. Frame 2 is a hand-written exact mirror. Cycle 1.8 → 2.4 s (slow and controlled).
- **Numbers:** elbow_R–knee_L ≈ 10 cm (before ≈ 52). hand_R–head ≤ 8 cm. hand_L–head-back ≈ 6 cm.
- **Contacts enforced (per frame):** `elbow_R→knee_L ≤ 12 cm`, `hand_R→head ≤ 10`, `hand_L→head-back ≤ 8`, and the mirror in frame 1.
- **Sources:** thegymgroup.com/exercises/abs-and-core-exercises/how-to-do-a-bicycle-crunch ; healthanswers.pfizer.com/physical-activity/cross-training/how-to-do-bicycle-crunches ; masterclass.com/articles/how-to-do-bicycle-crunches. These say "elbow toward the opposite knee; touching not required".

##### Side plank (`side-plank`): changed
- **Wrong:** the supporting forearm pointed along the body toward the head (shRot 90) instead of forward. The feet were about 18 cm apart, not stacked.
- **Fix:** `roll 68.5, shAbd_R 68.5, shRot_R 0` (forearm flat and pointing forward). `hipAbd_L 1.8, hipAbd_R -8.3, spineSide 3.3` keep the hips on the shoulder–ankle line and stack the feet.
- **Numbers:** elbow joint x −54 vs shoulder −52 (elbow under the shoulder). Wrist 25 cm in front of the elbow. Hip y 21 vs line 20.4 (straight). Ankles stacked 7 cm apart vertically.
- **Contacts enforced:** `touch heel_L→heel_R ≤ 10 cm`, `on: 'forearm_R foot_R'`.
- **Sources:** https://nasm.org/exercise-library/side-plank ; https://www.sussex.ac.uk/sport/documents/side-planks.pdf ; redefiningstrength.com/?p=12310

##### Alternating lunges (`lunges`): changed
- **Wrong:** the pelvis stayed in place, so both feet slid. The back foot shot 64 cm backwards instead of the front foot stepping forward.
- **Fix:** `z: 0.642` on both lunge frames, so the back foot's toes stay exactly where they stood (toes_R z 17 = standing) and the body travels forward with the step. The angles were already right (front shin vertical, back knee 9 cm off the floor). Tips rewritten.
- **Sources:** acefitness.org/resources/everyone/exercise-library/94/forward-lunge/

##### Squats (`squats`): small change
- `hipRot: 12` in both frames: feet a little wider than the hips with the toes slightly out, and the knees follow the toes (ACE). Heels stay down. Balance passes.
- **Source:** acefitness.org/resources/everyone/exercise-library/135/bodyweight-squat/

##### Leg raises (`leg-raises`): changed
- **Wrong:** the arms hovered 7–11 cm above the floor (sources: arms on the floor, palms down). The bottom heel was 17 cm up.
- **Fix:** `shF -10` (arms resting on the floor), `on: 'back arms'`, bottom `hipF 4` (heels hover about 10 cm up), top `hipF 88`. Slower lowering (`d` 1.2 / 0.8).
- **Source:** coachweb.com/abs-exercises/8505/flutter-kicks

##### Flutter kicks (`flutter-kicks`): changed
- **Wrong:** the arms were off the floor and the kicks were too high (heels 20–44 cm).
- **Fix:** `shF -10`, `on: 'back arms'`, kicks hipF 5 ↔ 18 (heels about 13–33 cm, small and low). Tips: if the back arches, raise the legs a little.
- **Sources:** coachweb.com/abs-exercises/8505/flutter-kicks ; masterclass.com/articles/flutter-kicks-workout-guide

##### Dead bug (`dead-bug`): small change
- The extended leg now hovers lower and fully straight (hipF 25 → 12, knee 5 → 0). Tips spell out the start position and the opposite arm/leg.
- **Source:** nasm.org/resource-center/exercise-library/dead-bug

##### Unchanged (verified correct)
- **Bird dog:** the support hand and knee stay put (wrist z 47, knee −5 in both frames). The reaching arm is horizontal (hand y 55 ≈ shoulder 54). The opposite leg is about horizontal. Opposite arm and leg are correct.
- **Forearm plank:** the elbow joint is directly under the shoulder (z 47/47), forearms forward, body straight, on the toes.
- **Superman:** arms and legs lift a few cm with a small spine extension (−8), as previously fixed to the ACE cue.
- **Calf raises:** ankle 38 at the top, pause, slow lowering. Fine.

##### Limits of the rig and tools
- **Hand/foot sliding is invisible to the checker.** No checker rule says "this support point must stay at the same floor position across keyframes". I fitted it by hand with `z`. **Suggestion:** a `pin` rule in check-poses that compares the named support markers' x/z between consecutive frames, with about 3 cm tolerance.
- **spineTwist is capped at 45°** (ROM), and the shoulders are a ball joint with no scapular protraction. In the bicycle, the elbow gets to about 10 cm from the knee, not touching. The sources say touching isn't required.
- **No scapula and a rigid trunk.** In a push-up with toes and hands planted, the wrists can only end up about 20 cm behind the shoulders. The toes roll about 5 cm (toe marker) at the bottom.
- **Knee push-ups** keep the feet raised behind (knee about 90°). The shins-on-the-floor version would need knee ≈ 30° and a longer plank. Both are valid; I kept the existing feet-up variant.


### Group 3 audit: yoga and stretch poses

Only exercise entries in `js/exercises.js` were changed. Shared pose constants were not touched.
Checker: `node tools/check-poses.mjs` → **236/236 keyframes pass**.

Numbers below come from `tools/pose-data.mjs` keypoints (cm, 175 cm body; x = trainer's left, y = up, z = forward)

#### Changed

##### Tree (`tree`)
- **Wrong:** the foot sat low, with the heel at 68 cm and the toes on the knee/shin area (toes_L 0.8 cm inside the right shin). Sources say never put the foot on the knee. The arms were overhead and apart, with no palms-together contact.
- **Fix:** I raised the foot so the sole presses the inner thigh: hipF_L 45, hipAbd_L 45, knee_L 150. The heel now sits at 81 cm, touching the right thigh surface (−1.0 cm), and the toes point down at 60 cm, above the 50 cm knee. The palms now meet at the chest (shF 35, shAbd 23, elbow 126, shRot −57).
- **Contacts enforced:** `heel_L→knee_R ≤ 34 cm` and `toes_L→knee_R ≤ 14 cm` keep the foot on the thigh above the knee (CLIP stops it from sinking in). `hand_L→hand_R ≤ 5 cm` keeps the palms together; the fingertips are 0.9 cm apart.
- **Tip:** says to press the sole into the inner thigh or calf, palms together at the chest.
- **Sources:** yogamatters.com/blogs/pose-library/tree-pose-vrikshasana ; canada.humankinetics.com/blogs/excerpt/tree-pose-asana-for-the-root-chakra ; liforme.com/blogs/blog/tree-pose (existing).
- **Limit:** the hands are blobs, so it reads as a "steeple". The wrists stay about 20 cm apart while the fingertips touch.

##### Cross-body Shoulder Stretch (`shoulder-stretch`)
- **Wrong:** the helping hand floated up at face height (hand_R at 162–172 cm, about 33 cm from the other elbow), so nothing held the stretched arm.
- **Fix:** I changed the helping arm to shF_R 20, shAbd_R 15, elbow_R 130 and shRot_R −60. The hand now holds the stretched arm just above the elbow (hand 0.2 cm from the upper-arm surface).
- **Contacts:** `hand_R→elbow_L ≤ 7 cm` (now 5 cm) and `elbow_L→chest ≤ 16 cm` (now 7 cm; the arm is pulled in to the chest).
- **Tip:** updated to "hold it just above the elbow".
- **Sources:** mayoclinic.org/healthy-lifestyle/adult-health/multimedia/shoulder-stretches/vid-20084699 ; au.physitrack.com/home-exercise-video/cross-body-stretch.

##### Seated Forward Bend (`seated-fold`)
- **Wrong:** the hands hung in the air about 16 cm short of and beside the feet, so they never held them.
- **Fix:** spineF 35→38, shF 150→145, shAbd 8→−6 (arms in line with the feet), elbow 5→25 (soft elbows as the hands wrap the feet). Now the wrist is at z 89 / y 19 against the sole (heel/toes at z 86).
- **Contacts:** `hand_L→toes_L ≤ 8 cm` and `hand_R→toes_R ≤ 8 cm` (now 7 cm). The seat and heels stay on the floor.
- **Tip:** says to hold the feet, ankles or shins, and to bend the knees if tight.
- **Sources:** en.wikipedia.org/wiki/Paschimottanasana ; workoutlabs.com/yoga-poses-guide/seated-forward-bend-paschimottanasana/ ; lessons.com/yoga-classes/yoga-poses/seated-forward-bend-pose.
- **Limit:** hipF is capped at 130 (ROM), so the pelvis can only tip 40°. More fold comes from the spine. I tried bent knees, but they lift the seat off the floor unless hipF goes past 130, so the legs stay straight.

##### Standing Forward Fold (`forward-fold`)
- **Wrong:** the arms dangled 44 cm in front of the feet and touched nothing (hands 21 cm above the floor).
- **Fix:** shF 105→72, shAbd −5, elbow 0, neckF 15 (head heavier). The fingertips now rest on the front of the shins (0.3 cm from the shin surface).
- **Contacts:** `hand_L→shin_L` and `hand_R→shin_R` ≤ 8 cm.
- **Tip:** says to rest the hands on the shins (or the floor) and let the head hang.
- **Sources:** ekhartyoga.com/poses/standing-forward-bend ; brettlarkin.com/standing-forward-fold-uttanasana ; yogamatters.com/blogs/pose-library/standing-forward-bend-uttanasana.

##### Bridge Pose (`bridge-yoga`)
- **Wrong:** the body rested on the **head**, not the shoulders. head-back was on the floor and the shoulders were 21 cm up, because the neck had no flexion. The heels were also lifted (ankle 26).
- **Fix:** neckF 0→50 (head lies flat, chin toward chest), hipF −22→−15, ankle 26→3 (feet flat), shF −51→−38 (arms long on the floor). The shoulder joints are now 10 cm up, which is just body thickness, and the upper-back marker is 5 cm up. Heels and toes are on the floor, shins vertical (178°), and hands and forearms flat.
- **Contacts:** the floor terms `back feet arms` cover this.
- **Tip:** says to keep the weight on the upper back and shoulders, not the neck.
- **Sources:** artofliving.org/yoga/yoga-poses/bridge-posture-setu-bandhasana ; lessons.com/yoga-poses/bridge-pose ; teens.aboutkidshealth.ca/yoga-poses-for-muscle-strengthening.
- **Limit:** the hips are at 35 cm (was 46 cm, but that was only possible by standing on the head). The thighs slope up about 17° to the knees, not level. A higher bridge needs more than 50° neck flexion (ROM max) or a flexible upper back, and the rig's chest is one rigid piece.

##### Warrior II (`warrior2`)
- **Wrong:** the front shin folded back under the body. The front ankle was at x 9 (the hip is at x 8), with the knee sticking out at x 37 and the heel 15 cm off the floor (only toes_L touched). The stance was narrow, with no vertical shin and no level thigh.
- **Fix:** a new pose fitted with custom goals (front foot pointing sideways, shin vertical, thigh near level, back leg straight, back foot turned about 20° in, centre of mass between the feet, chest facing front): `yaw 35, spineTwist −35, hipF_L 61, hipAbd_L 50, hipRot_L 25, knee_L 74, ankle_L 5, hipF_R −30, hipAbd_R 50, hipRot_R 34, ankle_R −7, roll 6`.
- **Result:** the stance is 124 cm heel to heel. The front knee is at x 50 over the ankle at x 52 (shin 177°, vertical), the front thigh 103° (13° below level), the back leg straight, both feet flat, the torso upright, and the arms level.
- **Tip:** describes the wide stance and foot directions.
- **Sources:** liforme.com/blogs/blog/how-to-do-warrior-two ; beyogi.com/poses/warrior-ii-pose/ ; lessons.com/yoga-poses/warrior-ii-pose.
- **Limits:** the front thigh cannot point straight sideways, because hipAbd is capped at 50. So the pelvis turns 35° toward the front leg and the chest twists back. knee_L reads 74° while the thigh is near level. Also, the exercise mat always lies front-to-back, so in this wide side stance the feet hang off it. That is a stage limit (`stage.js` mat orientation).

##### Triangle (`triangle`)
- **Wrong:** the lower hand hung beside the knee: wrist at (42, 52), 18 cm out from the leg and above the knee. The touch rule allowed 12 cm.
- **Fix:** roll −23.7→−26, hipF_L 18 / hipF_R −8 (hinge over the front leg), hipAbd_R −21, shAbd_L 57, shF_L 18 (lower hand forward onto the shin), back ankle −8 (heel down). The torso now tilts 52° (was 49°), the top arm is vertical (3°), the bottom arm points down (169°), and the fingertips are 3.6 cm from the shin surface.
- **Contact:** tightened to `hand_L→shin_L ≤ 9 cm` (marker to marker; was 12).
- **Tip:** says to tip from the hip, rest the hand on the shin, top arm up.
- **Sources:** liforme.com/blogs/blog/triangle-pose-trikonasana ; onepeloton.com/en-CA/blog/triangle-pose ; artofliving.org/us-en/triangle-pose.
- **Limit (unchanged, already in the docs):** spineSide 38 and hipAbd_L 50 are at their ROM limits. A deeper hip tilt (60–70°) and the hand lower on the shin need more hip abduction than the rig allows.

##### Cat-Cow (`cat-cow`)
- **Wrong:** in cow, the shins pointed up off the floor (heels at 26 cm). In cat, the knees floated 18 cm off the floor, held up only by the foot tops. The hips jumped from 44 to 59 cm between the frames, and the wrists slid 22 cm.
- **Fix:** I set both frames with the thighs vertical (hipF = pitch) and knee 90 (shins flat), so the knees stay on the floor. The arms are vertical, wrists under shoulders.
  - Cow: `pitch/hipF 100.1, spineF −24, neckF −25, shF 74`. The chest (47 cm) dips below the hips (48 cm) and the head lifts.
  - Cat: `pitch/hipF 71.7, spineF 28, neckF 30, shF 103`. The chest (54 cm) rises above the hips (50 cm) and the head drops.
- **Result:** knees and shins stay on the floor in both frames. The hips move only 48 → 50 cm and the wrists only z 43 → 48.
- **Tip:** adds "wrists under shoulders, knees under hips".
- **Sources:** healthlinkbc.ca/healthwise/yoga-cat-cow-pose ; yorksj.ac.uk 5x5-a-day Cat_cow PDF (existing).

##### Child's Pose (`childs-pose`)
- **Pose:** already correct (forehead on the floor at head 1 cm / face 3 cm, arms extended, hands down).
- **Added:** a contact rule for "hips sit back on the heels": `sit-bones→heel_L/R ≤ 10 cm`. The heel is 6 cm from the pelvis surface.
- **Sources:** ekhartyoga.com/poses/balasana ; beyogi.com/poses/childs-pose/.

##### Standing Quad Stretch (`quad-stretch`)
- **Wrong:** the hand already held the foot, but the bent knee splayed out. The knees were 22 cm apart at x 16 vs −6; sources say to keep the knees together.
- **Fix:** hipAbd_L −12.4, plus small refits (roll 5.7, shF_L −41.3, shAbd_L −7.7, elbow_L 34). The knees are now 10 cm apart (centre to centre, so touching).
- **Contacts:** `hand_L→foot-top_L ≤ 6 cm` (kept) and new `knee_L→knee_R ≤ 12 cm`.
- **Tip:** updated.
- **Sources:** au.physitrack.com/home-exercise-video/quads-stretch---stand ; uk.physitrack.com/home-exercise-video/quadriceps-stretch-in-standing ; ourspace.rjah.nhs.uk/?p=1807.

#### Checked, no change needed
- **Downward Dog:** inverted V. Torso 132° with the arms in line (137°), heels 3 cm off the floor (fine for beginners), head between the arms.
- **Cobra:** low cobra with the pelvis, thighs and foot tops down. Hands just behind the shoulders, elbows bent back by the ribs, chest lifted about 21°.
- **Chair:** thighs 30° below level, torso leaning 28° with the arms roughly in line (39°), knees over the feet, heels down.
- **Deep Breathing:** arms rise out to the sides from 10° to 170°, no back arch.
- **Arm Swings:** a full continuous circle (linear shF 0→360). Overhead the arms are 20° off vertical, behind the body they open out, and it loops seamlessly.

#### Rig / tool limits hit
1. **Hip abduction capped at 50°** (ROM) limits the Triangle tilt and the Warrior II front thigh direction. A pelvis yaw plus spine twist works around it for Warrior II.
2. **Neck flexion capped at 50°** and a rigid chest limit the bridge height, which stays at 35 cm with the shoulders down.
3. **hipF capped at 130°**: Seated Fold cannot bend the knees without lifting the seat.
4. **No inner-thigh, sole or palm markers.** Tree uses heel/toes→knee distances plus CLIP to keep the foot on the thigh. Palm contacts use the hand-centre markers. A `thigh_` (mid-thigh) marker and a `sole_` marker would make tree, butterfly and similar contacts exact.
5. **The mat is always front-to-back**, so wide side stances (Warrior II, Triangle) step off it. `stage.js` could rotate or scale the mat to the frame box.
6. **The checker only tests unmirrored frames.** I spot-checked the mirrored sides with `pose-data.mjs --mirror`: the contacts held.
7. `pose-debug.html` `show()` cannot switch frames of the same exercise, because `play()` ignores a repeat of the same exercise. The workaround is to set `stageRef.exercise = null` first.


### Group 4 exercise audit: notes

Checker: `node tools/check-poses.mjs` gives 236/236 keyframes pass.

The web searches worked, but pages could not be opened, so every source note below is based on search excerpts. Sources already listed in docs/EXERCISE-TECHNIQUE.md still apply. New excerpts from this pass:
- Knee-to-elbow / spiderman plank: puregym.com/exercises/abs/plank-knee-to-elbow/, caliverse.app/exercises/plank-spider-445 ("drive the knee toward the outside of the same elbow"), exercise.com/exercises/knee-to-elbow-plank, redefiningstrength.com/?p=29048 (hips level, go only as far as flexibility allows)
- Russian twist: physitrack.com/exercise-library/how-to-perform-the-russian-twist-exercise, library.theprehabguys.com/?p=32390, bodybuilding.com/exercises/russian-twist (flat back, lean back, rotate the torso)
- Triceps kickback: acefitness.org/exerciselibrary/55/dumbbell-triceps-kickback (upper arm parallel to and close to the torso, forearm hanging vertically, the upper arm stays still)
- Twist jumps: dieringe.com/exercises/twist-jumps, fitwill.app/exercise/7674/trunk-twist-hop (the twist comes from the hips, land softly)

#### Changed

##### Shared bug: hands-on-hips (side-leg-raise, reverse-lunges)
- **Wrong:** the shared `HANDS_ON_HIPS` puts both palms on the front of the belly. The palm sat at x = 2 cm (the midline), 9 cm from the belly marker, so the hands crossed in front instead of resting on the hips.
- **Fix:** these two entries now override the arms locally to `shF -10, shAbd 35, elbow 85, shRot -70`, found by a grid search for a palm on the side of the pelvis. The palm is now at x = ±16 cm, at iliac-crest height, halfway between front and back, with the elbows out to the sides. I did not edit the shared constant. Other exercises that use HANDS_ON_HIPS (lines ~88, 220, 231) have the same problem, so the coordinator may want to change the constant itself to these values.
- No touch goal was added, because there is no marker on the side of the hip.

##### twisters
- **Wrong:** stiff, straight-legged landings.
- **Fix:** each landing now has `hipF 12, knee 18, ankle -6`, so the knees are soft. The flight frame has knee 4. The hips still turn ±35° while the chest faces forward (spineTwist ∓35).

##### cross-toe-touch
- **Wrong:** the top arm pointed mostly sideways. The hand was 62 cm to the side and only 32 cm above the shoulder, not reaching to the ceiling. The touch tolerance was a loose 14 cm, aimed at the toes.
- **Fix:** top arm `shF -50, shAbd 45`. The hand is now 68 cm above the shoulder and only 21 cm to the side, so the arms form one near-vertical line. A grid search showed that a forward-bent trunk needs shoulder extension to point the arm up. The touch goal is now `hand → opposite foot-top ≤ 8 cm` (measured: 8 cm).

##### diamond-pushups
- **Wrong:** the hands slid about 24 cm along the floor during each rep. Wrist z was 38 at the top and 14 at the bottom.
- **Fix:** top `shF 58` and bottom `shF 20, elbow 89.5, pitch 86`. The hand-to-toe distance is now 143 cm at the top and 144 cm at the bottom, so the hands stay planted, under the chest (chest z 42, hands z 44). Hands touch: 7 cm at the top, 1–2 cm at the bottom. The elbows stay tucked. The view changed from side to sidefront so the diamond is visible.

##### db-rows
- **Wrong:** a shallow 45° hinge. Sources say 45° up to near parallel.
- **Fix:** pitch 60 with `hipF 71.5, knee 18, ankle -11`, balanced by the fitter. Bottom: arms vertical (`shF = pitch`). Top: `shF -20, elbow 80`. The elbow is at z 12 behind the shoulder (z 40) and level with the torso, and the hand is directly below the elbow (z 13 vs 12), so the forearm is vertical. Neutral grip: the bar runs front to back. Tips updated.

##### front-raises
- **Wrong:** neutral grip with the bar vertical at the top. Sources describe the weights in front of the thighs, palms facing you.
- **Fix:** `shRot -80, shAbd 2` in both frames. The bar now runs left to right (direction −0.98 x), so the palms face down at shoulder height. At the start the weights are in front of the thighs (hand z 12 vs hips-front 10). The view changed to sidefront. Tips updated.

##### knee-touch
- **Wrong:** at the start the hands floated out to the sides (x ±33, 30 cm above the thighs). At the top the fingertips stopped about 11 cm short, above the knees. There was a touch goal on the left hand only, at 20 cm.
- **Fix:** start `shF 22, shAbd -8`: the hands rest on the thighs, within 20 cm of the knees. Top `spineF 39.4, shF 52, shAbd -4`, with touch goals of 6 cm on **both** hands to the knees (measured 6 cm each). Arms stay straight. The shoulder blades lift and the lower back stays on the mat.

##### russian-twists
- **Wrong:** the clasped hands were up in front of the face, with the forearms pointing up along the torso. There was no contact goal.
- **Fix:** `shF 25, shAbd -22, elbow 60`. In body coordinates the hands are now at chest/belly height (y 20 vs chest 25), about 25–35 cm in front of the body, and they turn with the chest (twist ±40). New exercise-level touch goal: `hand_L ↔ hand_R ≤ 6 cm`. Lean −42° and feet on the floor are unchanged.

##### plank-knee-elbow
- **Wrong:** the leg was jammed into a full tuck (hipF 130, knee 155) with the foot tucked under the body. The knee was 32 cm from the elbow, and the touch tolerance was 32 cm.
- **Fix:** working leg `hipF 120, hipAbd 50, hipRot -8, knee 135, ankle 45`, so the knee comes out to the side and the toes stay off the mat. A side crunch toward that knee (`spineSide ±17`) was added, the hands are slightly wider on the knee side (`shAbd 25 / -12`), and `shF 72`, so the hands are almost under the shoulders. The knee is now ≤ 15 cm from the same elbow (`touch knee→elbow ≤ 0.15`, was 32 cm). Both sides are written explicitly. Tips updated ("toward the outside of the same elbow").

##### reverse-lunges
- Only the hands-on-hips fix. The bottom position was already correct: front shin vertical, back knee 13 cm off the floor, back foot on its toes.

#### Checked, no change needed
- **squat-hold:** SQUAT_LOW with arms forward matches the sources.
- **shoulder-press:** the bar runs left to right (palms forward). The forearms are vertical at the start, and the arms are nearly straight overhead at the top.
- **lateral-raises:** arms reach shoulder height, the bar runs front to back (palms down) and the elbows are soft.
- **bicep-curls:** the elbows stay fixed at the sides (elbow marker (25, 117, −5) → (25, 117, −4)) and the weight reaches the front of the shoulder.
- **tricep-kickbacks:** the torso is near parallel (pitch 75), and the upper arm is horizontal and alongside the torso, as ACE describes. Only the elbow moves, 90 → 5.

#### What the 3D body cannot do
- **No forearm rotation joint.** Turning the hand is only possible by rotating the whole upper arm (shRot), which also changes the direction the elbow bends. So bicep curls show a neutral "hammer" grip instead of palms up. Front raises can only show an overhand grip because their arms stay straight.
- **Knee cannot reach the elbow in the plank.** Hip abduction tops out at 50° and hip flexion at 130°. Even with a 17° side crunch, the knee gets to about 10–15 cm from the elbow without the hands sliding back. A real touch would need more flexed-hip abduction in the ROM table (about 60–70°, as people manage in a butterfly position).
- **No hip-side marker.** "Hands on hips" cannot be enforced with a touch goal. A `hip-side_L/R` marker on the pelvis (about ±0.16, +0.02) would allow it.
- **Shared HANDS_ON_HIPS constant** puts the hands on the belly. Suggested values: `{ shF: -10, shAbd: 35, elbow: 85, shRot: -70 }`.


### Group 5 animation audit (js/exercises.js only)

Checker after the changes: `node tools/check-poses.mjs` → **240/240 keyframes pass** (inchworm went from 6 to 10 frames).
No shared pose constants were edited. Every override is inside my own entries.

#### Changed

##### side-lunges
- **Wrong:** the hands floated near the face and did not touch each other (`shF 80, shAbd -20, elbow 70`).
- **Changed:** hands are now clasped in front of the chest in every frame (`shF 40, shAbd -10, elbow 120, shRot -40`). The tip now mentions the clasped hands and toes pointing forward.
- **Contacts enforced:** exercise-level `touch: hand_L↔hand_R ≤ 5 cm, hand_L↔chest ≤ 22 cm`. Hands went from ≈30 cm apart to 3.6 cm; hand to chest is ≈14 cm.
- **Sources:** Nike "The Perfect Lateral Lunge" (clasp hands in front, toes forward); MasterClass lateral lunge guide; womensfitness.co.uk (other leg straight).

##### sumo-squats
- **Wrong:** same as above: the hands were apart, near the face.
- **Changed:** same clasped-hands angles and touch rules. Tip updated.
- **Sources:** healthline.com sumo squat ("hold your hands together in front of your chest", toes out about 45°); livestrong.com.

##### step-jacks
- **Wrong:** the whole body tilted about 10° like a falling stick (the `roll` was not counter-balanced).
- **Changed:** added `spineSide -12 / +12` against `roll -10 / +10`. Torso tilt went from 10° to 2°.
- **Sources:** puregym.com step jacks; redefiningstrength.com (step out, arms overhead without arching).

##### skaters
- **Wrong:** the trailing leg was behind the body but did not cross behind the landing leg (trailing ankle at x −1 cm vs landing foot at −5 cm).
- **Changed:** trailing `hipAbd -15 → -24`, on both sides. The trailing ankle is now at x −11 cm, behind and past the landing foot (a curtsy-style sweep).
- **Sources:** builtlean.com speed skaters; motra.com skater hop (trailing leg sweeps behind, arms across); workoutlabs.com.

##### inchworm
- **Wrong:** the feet slid back 83 cm on the floor between the fold and the plank, and the hands never "walked".
- **Changed:** now 10 frames: stand, fold, walk step (left hand lifted 11 cm), inverted V, walk step (right hand lifted 12 cm), plank (held), and back the same way. A pelvis `z` shift (0.22 → 0.5 → 0.76 → 1.0 → 1.16) keeps the toes fixed at z ≈ 16 cm in every frame, so only the hands travel (40 → 101/120 → 154 → 171/185 → 169 cm). `cycle` 7 → 9 s. Tip rewritten: feet stay still, walk the hands one at a time.
- **Sources:** ACE Exercise Library #254 Inchworms (hinge, hands to floor, walk hands out to plank); theprehabguys.com inch-worm walking (walk out and back).
- **Limit:** the planted hand still slides a little between keyframes, because keyframe blending cannot pin a hand. The ACE version walks the feet in to the hands, which would move the body forward on every repetition, so the app walks the hands back instead (Prehab Guys variant).

##### heel-touches
- **Wrong:** the reaching hand stopped 15 cm short of the heel; the other arm was held up in the air; the heels were 5 cm off the floor.
- **Changed:** `pitch -86.8, hipF 64.6, knee 131.2, ankle 19.7, spineF 35.9, spineSide ±25`; reaching arm `shF 9, shAbd 7.1`, other arm long by the side (`shF 9, shAbd 20`). `on` changed from 'back feet' to 'back heels toes' so the feet must be flat. Tip updated.
- **Contacts enforced:** `hand↔same-side heel ≤ 7 cm` (was ≤ 15). The hand is now 7 cm from the heel (was 15), and both heels are on the floor.
- **Sources:** fitbod.me alternating heel touch (shoulders off the ground, hand as close to the heel as possible); barbend.com; fitnessvolt.com.

##### hollow-hold
- **Wrong:** arms 37° and legs 30° above the floor made a V-sit or boat shape, not a hollow.
- **Changed:** `shF 165 → 178`, `hipF 30 → 18`. Arms are now 24° above the floor, by the ears; legs 18°. The lower back and seat stay on the floor (back marker 2 cm).
- **Sources:** Tom's Guide and Yahoo Health hollow body hold (limbs a few inches off the floor, lower back pressed down); hingehealth.com.

##### clamshells
- **Wrong:** knees were 23 cm apart and feet were 22 cm apart when closed. When open the feet separated (23 cm) and the knees opened about 48 cm. The top hand floated in the air.
- **Changed:** closed frame: top leg `hipAbd_L -10.9, hipRot_L 7.8` (knees stacked). Open frame: `hipAbd_L 20, hipRot_L 39.2, hipF_L 42.4` (the leg pivots about the feet). Body `roll 87.4, pitch 1.2`. Top hand on the floor in front of the chest (`hand_L` added to `on`). Camera view `threeq → front` so the knee opening faces the viewer. Tip updated (head on lower arm, do not roll back).
- **Contacts enforced:** closed: `knee_L↔knee_R ≤ 12, heel_L↔heel_R ≤ 6, toes_L↔toes_R ≤ 10`. Open: heels ≤ 6, toes ≤ 10. Body-frame knee separation goes 12 → 36 cm while the heels stay 6 cm apart.
- **Sources:** Merck/MSD Manuals clamshell video (knees about 90°, feet together, top knee to the ceiling); physitrack.com (legs stacked, do not roll back); theprehabguys.com.

##### standing-oblique-crunch
- **Wrong:** the same-side elbow and knee stayed **63 cm** apart. This is the main defect: the crunch never met.
- **Changed (fitted with ROM respected):** lifted leg `hipF 82.9, hipAbd 46.1, hipRot 23.3, knee 85.9`; trunk `spineSide ±35.9, spineF 40.7, spineTwist ∓33.7`; working arm `shAbd 107.2, shF 17.8` (elbow drops forward). Mirrored for the right side. Tip now says "crunch down and sideways so the same-side elbow meets the knee".
- **Contacts enforced:** `elbow↔same-side knee ≤ 10 cm` (now 10 cm, was 63), both `hand↔head-back ≤ 14 cm` in every frame.
- **Sources:** physitrack.com "Side crunch in standing with knee lifts" (fingers behind the head, knee out to the side, bend the trunk to touch knee to elbow); Tom's Guide (do not pull on the neck).
- **Limit:** with a pure side-bend inside the normal range (spine side-bend ≤ 40°, hip abduction ≤ 50°) the elbow cannot reach the knee in this rig. The best pure side-bend got 18 cm, so the pose adds forward crunch and twist, as people do in practice.

##### plank-to-dog
- **Wrong:** going into the dog, the hands slid 26 cm forward and the feet 51 cm forward (span 150 → 125 cm), so the trainer "walked" without stepping.
- **Changed:** a wider V (`hipF 89 → 67, pitch 124.8, shF 173.6, wrist 35.8, ankle -16.2`) keeps the hand-to-toe span at 150 cm. `z: -0.34` keeps the hands at z ≈ 59 cm in both frames (feet −95 → −99 cm). Tip updated: hands and feet stay where they are, heels reaching down. Heels end 15 cm up (tight-hamstring dog).
- **Sources:** julielohre.com; motra.com plank to downward dog (press the hips up and back, heels toward the floor).

#### Checked, rules tightened, pose kept
- **plank-shoulder-taps:** the hand already reaches the opposite shoulder. Touch tightened from 10 to 9 cm (8 cm actual; the fitter cannot get closer without the forearm passing through the head). Sources: redefiningstrength.com, strengthlog.com (hips square, wide feet).
- **good-mornings:** the pose was already correct (torso 70°, soft knees). Added exercise-level `hand↔head-back ≤ 14 cm` for both hands. Sources: coachweb.com, healthline.com.

#### Checked, no change needed
- **reverse-crunches:** the upper back, head and arms stay on the floor; the pelvis lifts 6–8 cm and the knees curl 27 cm toward the chest. Matches healthline.com and fitbod.me.
- **donkey-kicks:** thigh level with the body, knee 90°, sole of the foot to the ceiling. Matches strengthlog.com and theprehabguys.com.
- **fire-hydrants:** thigh lifted about 50° out to the side, knee 90°, shin level. Matches healthline.com (about 45°).

#### Rig and tool notes for the coordinator
- `touch` has only a maximum distance. A **minimum distance** (e.g. clam knees ≥ 25 cm apart, skater foot behind) would stop the fitter from dropping the defining motion.
- The fitter's ROM penalty (`1e-4·deg²`) is much weaker than the touch penalty, so it happily goes 20° past the normal range. I used a scratch copy with ROM weight 0.05; it may be worth adding a CLI flag to the real checker.
- A frame-level `touch` replaces the exercise-level one, so frames that need both must repeat the shared rules.
- Keyframe blending cannot pin a supporting hand, so walking moves (inchworm) still slide a little between keyframes.
- The pose-debug `show()` keeps the old frames when it is called twice for the same exercise (`Stage.play` early-return). Set `stageRef.exercise = null` first.


### Group 6 exercise audit notes

Only exercise entries in `js/exercises.js` were edited. No shared pose constants were touched.
Numbers below come from `tools/pose-data.mjs` (175 cm body) and `tools/check-poses.mjs`.

Sources: web search worked but pages could not be opened, so each note relies on search excerpts.
New searches this pass covered the seated twist (Mayo Clinic video page and mirror pages, Yoga Journal
Half Lord of the Fishes, brettlarkin.com) and the supine twist (Yoga International, Yoga Matters,
yinyoga.com). For the rest, the sources already in `docs/EXERCISE-TECHNIQUE.md` were used.

---

#### Seated Spinal Twist (`seated-twist`): the owner's main complaint
**Correct form (Mayo Clinic video vid-20453586; Yoga Journal / Brett Larkin half lord of the fishes):** sit with one leg straight.
Cross the other foot over it and set it flat on the floor outside the straight leg's knee. Put the opposite
elbow on the outside of the bent knee, keep the other hand on the floor behind you, and turn the chest, head
and eyes toward the bent knee.
**What was wrong:**
- The bent leg was not crossed. In body coordinates the left ankle was at x = +4 (still on its own side)
  while the straight leg's knee was at x = −11.
- The elbow did not touch the knee. The touch goal allowed 17 cm and the measured gap was more than 8 cm.
- The bent foot rested on its heel only.
**Fix:**
- Bent hip adducted and externally rotated: `hipAbd_L −13, hipRot_L 29, hipF_L 128, knee_L 101`.
- Foot flat on the floor: `ankle_L 40`.
- Pelvis leans back 15°. Twist and head turn 40°.
**After (proof):**
- Left ankle x = −18 and left heel x = −16, so the foot sits outside the right knee (x = −11), at the
  knee's depth (heel z 37, knee z 39).
- NOTES: "ankles crossed … left foot is across the right leg". Both the left heel and toes are on the floor.
- TOUCHING: `elbow_R ↔ knee_L 5 cm`. The elbow is at body x +3 against the left knee at −1, so it is on the outside of the knee.
**Contacts enforced:**
- `on: 'seat heels foot_L hand_L'`.
- `touch: [['elbow_R','knee_L',0.06], ['heel_L','knee_R',0.14]]`.
- The CLIP check stops the foot from sitting on top of the shin. An earlier fitter run did put it there,
  and only this check catches it.

#### Butterfly Stretch (`butterfly`)
**Correct form (Healthline, Hinge Health):** the soles of the feet press together, the knees fall open,
both hands hold the feet, and you lean forward gently.
**What was wrong:** the two feet passed through each other. The left heel was at x −5 and the right at +5,
which is 10 cm of overlap. The hands sat together between the feet, and only one hand had a touch goal (10 cm).
**Fix:** `hipF 112, hipAbd 50, hipRot 50, knee 120, ankle 21.5, pitch −8.6, spineF 22`.
**After:** heels at x 0 and 0, `heel_L ↔ heel_R 0 cm`, `toes 4 cm`. The tops of the feet face outward, so the
soles face each other. `hand_L ↔ foot-top_L 5 cm` and `hand_R ↔ foot-top_R 5 cm`.
**Contacts:** touches for heels ≤ 3 cm, toes ≤ 4 cm and each hand to its own foot ≤ 5 cm.

#### Knees to Chest (`knees-to-chest`)
**Correct form (Mayo Clinic):** lie on your back, hug both knees in with the hands around the shins, and keep the head and shoulders on the mat.
**What was wrong:**
- The hands held nothing. TOUCHING was empty (the old goal allowed 10 cm, left side only).
- The head was 17 cm above the mat, because a 15° spine curl lifted the head and shoulders.
**Fix:** `pitch −95, spineF 3, neckF 5, hipF 128, knee 140`. Arms: `shF 10, shAbd −9.6, elbow 46`.
**After:** the back and the back of the head are on the floor (head-back 1 cm). `hand_L ↔ shin_L 5 cm` and `hand_R ↔ shin_R 5 cm`.
**Contacts:** each hand to its own shin ≤ 5 cm.

#### Lying Spinal Twist (`supine-twist`)
**Correct form (Yoga International, Yoga Matters, yinyoga.com):** lie on your back with the arms in a T. Lower
both bent knees together to one side, top knee over the bottom knee, and turn the head the other way. Keep the
shoulder blades down, and use a cushion under the knees if needed.
**What was wrong:** the knees were not together. They were 21 cm apart, with the bottom knee 18 cm and the top
knee 34 cm above the floor. Both feet floated in the air.
**Fix:**
- The pelvis rolls 55° instead of 45° (`pitch −35` with `yaw 90, roll −90`), with `spineTwist −45`.
- Legs: `hipAbd_L 24, hipAbd_R −25, hipRot_L −18, hipRot_R 28`.
- Arms reshaped so both hands reach the mat: `shAbd_L 80 / shF_L 15`, `shAbd_R 42 / shF_R −31`.
**After:** the bottom foot is on the floor (heel 1, toes 3), the top foot rests next to it (6–7 cm), and the
knees are stacked, about 16 cm apart centre to centre. The bottom knee is about 12 cm above the floor, as if on a cushion. The left forearm and hand lie on the mat, and the right hand is on the mat.
**Contacts:** `on: 'back arms foot_L'`, `touch: knees ≤ 16 cm, heels ≤ 14 cm`.
**Limit:** the rig's spine twist stops at 45°. Rolling the pelvis further lifts the whole body (tested), so
the right shoulder already sits about 7 cm higher than the left and the knees cannot reach the floor.
A real body gets the extra turn from the thoracic spine and the shoulder blades.

#### Thread the Needle (`thread-needle`)
**Correct form (Yoga Matters, Liforme):** start on hands and knees. Slide one arm under the chest, palm up,
between the other hand and the knees, until the shoulder and the side of the head rest on the mat. The other
hand stays planted under or slightly ahead of its shoulder.
**What was wrong:** the supporting right hand was placed far out to the side, next to the threading hand
(`hand_L ↔ hand_R 6 cm`). The threading arm therefore did not pass between that hand and the knee.
**Fix:** the support arm comes forward and in, with the elbow bent: `shF_R 99, shAbd_R −18, elbow_R 68, wrist_R 90`. Also `spineTwist −45`, `roll 2.3`.
**After:** the right hand is at x −30, z 55, in front of the threading arm (left wrist x −38, z 29). The hands
no longer touch each other, and the head, left hand, knees and feet are on the mat.
**Contacts:** `touch: ['hand_R','head',0.32]` keeps the support hand forward, near the head.
**Limit:** the threading shoulder stays about 12 cm up because of the 45° twist limit.
The right forearm comes within 3 cm of the mat.

#### Sphinx Pose (`sphinx`)
**Correct form (Yoga Journal):** elbows under the shoulders, forearms flat and parallel, palms down, chest lifted.
**What was wrong:** the forearms pointed 17° upward, so the hands were off the floor, and the upper arms leaned 20° forward.
**Fix:** `shF 52, elbow 86, wrist −14, spineF −41, neckF −5`.
**After:** the upper arm is 169° from vertical, almost straight down, and the forearm is level (90°). The elbow
(z 41) is under the shoulder (z 39). The forearms and hands are on the floor.
**Contacts:** `on: 'forearms hands front knees'`.
**Note:** the spine extension is now −41 (was −34.5), which is still a moderate backbend.

#### Boat Pose (`boat-pose`)
**Correct form (Yoga International, Prana Yoga):** in half boat the shins are parallel to the floor and the arms reach forward, also parallel.
**What was wrong:** the shins pointed 25° downward (115° from vertical), and the thighs were steep (30° from vertical).
**Fix:** `hipF 100, knee 50`.
**After:** thighs 40° from vertical, shins level (90°), arms level (90°).

#### Half Sun Salutation (`sun-salutation-half`)
**Correct form (Ekhart Yoga, Healthline, Yoga Journal):** fold with soft knees and the hands toward the shins or the floor; in the half lift, the back is flat and the hands rest on the shins.
**What was wrong:** in the fold the hands hung 44 cm in front of the feet, touching nothing. In the half lift the hands were 14 cm to the side of the knees, and TOUCHING was empty.
**Fix:**
- Fold (frames 2 and 4): `pitch 80.6, spineF 45, hipF 95, knee 15, shF 92.6, shAbd −6.2`.
- Half lift (frame 3): `knee 12, shAbd −6`.
**After:** in the fold, `hand ↔ shin 7 cm` (hands on the lower shins, 19 cm above the floor). In the half lift, `hand ↔ knee 6 cm` with a flat back (torso 79° from vertical).
**Contacts:** per-frame touches: fold, hand to its own shin ≤ 7 cm; half lift, hand to its own knee ≤ 7 cm.

#### Standing Chest Opener (`chest-opener`)
**What was wrong:** the hands were 6 cm apart, which is not a real clasp.
**Fix:** `shAbd −16`, plus a slight chest lift (`spineF −5`).
**After:** `hand_L ↔ hand_R 2 cm`. The touch goal was tightened to 4 cm.

#### Wrist & Forearm Stretch (`wrist-stretch`)
**Correct form (HealthLinkBC, Michigan Medicine, Kaiser Permanente):** hold the arm straight out. For the flexor stretch, the other hand holds the fingers and pulls them back toward you. For the extensor stretch, the hand bends down and the other hand presses on the back of it.
**What was wrong:**
- The helping hand never touched the stretched hand. TOUCHING showed only `elbow_R ↔ chest 6 cm`.
- The helping hand sat between the body and the stretched hand. From there it can't pull the fingers back.
**Fix:**
- The stretched arm comes toward the midline (`shAbd_L −25`), which is how people actually do this stretch.
- The helping arm reaches in front of it: flexor frames `shF_R 100, shAbd_R −20, elbow_R 0`; extensor frames `shF_R 85`.
**After:** `hand_L ↔ hand_R 6 cm` in the flexor frames and 5 cm in the extensor frames. The helping hand is now in front of the fingers or the back of the hand (z 53–63 versus the stretched hand's 50–58).
**Contacts:** `touch hand_R ↔ hand_L ≤ 7 cm`. It was 9 cm, and it never actually held in the old pose.
**Limit:** the hands are simple blobs with no fingers, so the "pull" is still only suggested.

#### Standing Hamstring Stretch (`hamstring-stretch`)
**What was wrong:** the stance was very short, with the front heel only 19 cm ahead of the back heel.
**Fix:** `hipF_L 68`. The back leg was refitted for balance: `hipF_R 70.4, knee_R 40, ankle_R −16`.
**After:** the front heel is 32 cm ahead. The hinge is unchanged (pitch 44, flat back), and the body balances.

#### Shadow Boxing (`boxing-punches`)
**What was wrong:** the guard fists sat about 10 cm below the chin.
**Fix:** guard `shF 45, elbow 135` (was 35 / 140).
**After:** the fists are level with the chin (hand 154 cm, chin 158 cm) and in front of the face.

#### Unchanged (checked with pose-data, already correct)
- **Low Lunge:** the front thigh is level and the shin vertical, the back knee and the top of the back foot are on the mat, and the arms are overhead.
- **Puppy Pose:** the thighs are near vertical, the forehead and hands are on the mat, and the arms are straight.
- **Neck Rolls:** ear to shoulder (±32°), then chin down (35°), with no backward roll.

#### Rig and tool limits hit
- **Spine twist stops at 45°.** This limits the supine twist (the knees can't reach the floor while both shoulders stay down) and thread the needle (the shoulder can't reach the floor).
- **No ankle inversion and no toe or finger joints.** In the butterfly, the soles face each other only through hip rotation. In the wrist stretch, the finger pull can only be suggested.
- **The checker cannot say "outside of".** A `touch` is only a distance, so the seated twist foot could just as well sit on top of the shin; only CLIP rules that out. Side-specific goals would help, for example a "left of" rule in body coordinates.
- **No floor term for one foot's toes.** The `on` vocabulary has no word meaning "this foot is flat on the floor", so a flat foot is checked by eye, using pose-data heights for the heel and toes.
