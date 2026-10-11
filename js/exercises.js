// Exercise library. Each exercise is a loop of keyframe poses (joint angles in degrees).
// Pose keys: pitch/yaw/roll (whole body), lift (jump height m), spineF/spineSide/spineTwist,
// neckF/neckSide/neckTurn, and per-limb shF, shAbd, shRot, elbow, wrist, hipF, hipAbd,
// hipRot, knee, ankle. A limb key without _L/_R applies to both sides.
//
// level: 1 beginner, 2 intermediate, 3 advanced
// cat: warmup | cardio | strength | core | yoga | stretch
// sides: hold one side for the first half, mirror for the second half
// props: ['dumbbells'] shows dumbbells in the hands (water bottles work too)
// ease: 'linear' keeps a constant speed between keyframes (use for circles); default eases in and out
// met: metabolic equivalent, used for the calorie estimate

// ---- Reusable poses ----
const STAND = {};
const HANDS_ON_HIPS = { shF: -10, shAbd: 35, elbow: 85, shRot: -70 };   // palms on the sides of the hips

// High plank (push-up top). Arms vertical: shF = pitch.
const HIGH_PLANK = { pitch: 75, shF: 75, shAbd: 8, elbow: 0, wrist: 90, ankle: 30 };
const PUSHUP_DOWN = { pitch: 85, shF: 0, shAbd: 18, elbow: 80, wrist: 90, ankle: 18, neckF: -10 };
const KNEE_PLANK = { pitch: 60, shF: 60, shAbd: 8, elbow: 0, wrist: 90, knee: 95, ankle: 30 };
const KNEE_PUSH_DOWN = { pitch: 75, shF: -2, shAbd: 18, elbow: 81, wrist: 90, knee: 95, ankle: 30, neckF: -10 };
const FOREARM_PLANK = { pitch: 84, shF: 84, shAbd: 6, elbow: 90, wrist: 0, ankle: 17, neckF: -5 };

// Lying on the back with knees bent, feet flat
const BACK_KNEES = { pitch: -90, hipF: 50, knee: 105, ankle: 35, shF: -16, shAbd: 16, elbow: 20 };
// Lying on the back, legs straight
const BACK_FLAT = { pitch: -90, ankle: 20, shAbd: 12, elbow: 0 };
// Face down, arms overhead
const PRONE = { pitch: 90, shF: 165, shAbd: 15, elbow: 5, ankle: 59, hipF: 3 };
// Hands and knees
const TABLETOP = { pitch: 87, shF: 87, shAbd: 4, elbow: 0, wrist: 90, hipF: 87, knee: 90, ankle: 59, hipAbd: 4 };

const SQUAT_LOW = { pitch: 35, hipF: 112, knee: 112, ankle: -35, shF: 125, shAbd: 6, elbow: 10, hipAbd: 8 };
// Hip hinge with soft knees, back flat (bent-over rows, kickbacks)
const HINGE = { pitch: 45, hipF: 52, knee: 15, ankle: -8 };

const SQUAT_HANDS_DOWN = { pitch: 26, spineF: 53, hipF: 128, knee: 154, ankle: -40, shF: 54, shAbd: 10, wrist: 80, hipAbd: 8 };

export const EXERCISES = [
  // ---------------- Warm-up ----------------
  {
    id: 'march', on: 'feet', name: 'March in Place', cat: 'warmup', level: 1, met: 3.5, cycle: 1.5, view: 'threeq',
    muscles: ['hipFlexors', 'quads', 'calves'],
    tips: 'Lift your knees to hip height and swing your arms naturally. Stand tall.',
    frames: [
      { hipF_L: 88, knee_L: 90, ankle_L: 15, shF_R: 40, shF_L: -25, elbow: 80, roll: 4, hipAbd_R: 0, on: 'foot_R' },
      { elbow: 80 },
      { hipF_R: 88, knee_R: 90, ankle_R: 15, shF_L: 40, shF_R: -25, elbow: 80, roll: -4, hipAbd_L: 0, on: 'foot_L' },
      { elbow: 80 },
    ],
  },
  {
    id: 'arm-circles', on: 'feet', name: 'Arm Circles', cat: 'warmup', level: 1, met: 3, cycle: 8, view: 'threeq', ease: 'linear',
    muscles: ['shoulders', 'traps', 'back'],
    tips: 'Arms straight out to the sides. Make small, controlled circles forward, then switch direction.',
    // Arms held out at 75°; shoulder flexion keeps turning, so each hand traces a small circle.
    // Two circles forward (0 → 720°), then two backward.
    frames: [
      { shF: 0, shAbd: 75, elbow: 0, hipAbd: 8 },
      { shF: 90, shAbd: 75, elbow: 0, hipAbd: 8 },
      { shF: 180, shAbd: 75, elbow: 0, hipAbd: 8 },
      { shF: 270, shAbd: 75, elbow: 0, hipAbd: 8 },
      { shF: 360, shAbd: 75, elbow: 0, hipAbd: 8 },
      { shF: 450, shAbd: 75, elbow: 0, hipAbd: 8 },
      { shF: 540, shAbd: 75, elbow: 0, hipAbd: 8 },
      { shF: 630, shAbd: 75, elbow: 0, hipAbd: 8 },
      { shF: 720, shAbd: 75, elbow: 0, hipAbd: 8 },
      { shF: 630, shAbd: 75, elbow: 0, hipAbd: 8 },
      { shF: 540, shAbd: 75, elbow: 0, hipAbd: 8 },
      { shF: 450, shAbd: 75, elbow: 0, hipAbd: 8 },
      { shF: 360, shAbd: 75, elbow: 0, hipAbd: 8 },
      { shF: 270, shAbd: 75, elbow: 0, hipAbd: 8 },
      { shF: 180, shAbd: 75, elbow: 0, hipAbd: 8 },
      { shF: 90, shAbd: 75, elbow: 0, hipAbd: 8 },
    ],
  },
  {
    id: 'neck-tilt', on: 'feet', name: 'Neck Tilts', cat: 'warmup', level: 1, met: 2, cycle: 5, view: 'front',
    muscles: ['neck', 'traps'],
    tips: 'Slowly tilt your ear toward your shoulder. Keep shoulders relaxed and down. Great after long screen time.',
    frames: [{ neckSide: 32 }, STAND, { neckSide: -32 }, STAND],
  },
  {
    id: 'hip-circles', on: 'feet', name: 'Hip Circles', cat: 'warmup', level: 1, met: 2.5, cycle: 3, view: 'front',
    muscles: ['obliques', 'lowerBack', 'glutes'],
    tips: 'Hands on hips, feet shoulder-width, knees soft. Draw big slow circles with your hips while your shoulders stay over your feet.',
    // Hands on the hip bones (elbows out to the sides), not in front of the belly. There is no
    // marker on the side of the hip, so the touch uses the seat markers (back corners of the
    // pelvis): within 20 cm keeps each hand at the side of its hip.
    touch: [['hand_L', 'seat', 0.2], ['hand_R', 'seat', 0.2]],
    frames: [
      { shF: -25, shAbd: 45, shRot: -55, elbow: 100, x: 0.06, hipAbd_L: 6, hipAbd_R: 14, spineSide: -8 },
      { shF: -25, shAbd: 45, shRot: -55, elbow: 100, hipAbd: 10, z: 0.05, pitch: -5, spineF: 10, hipF: -8.3, ankle: -3.3 },
      { shF: -25, shAbd: 45, shRot: -55, elbow: 100, x: -0.06, hipAbd_L: 14, hipAbd_R: 6, spineSide: 8 },
      { shF: -25, shAbd: 45, shRot: -55, elbow: 100, hipAbd: 10, z: -0.05, pitch: 6, spineF: -6, hipF: 9.3, ankle: 3.3 },
    ],
  },
  {
    id: 'torso-twist', on: 'feet', name: 'Torso Twists', cat: 'warmup', level: 1, met: 3, cycle: 2.4, view: 'front',
    muscles: ['obliques', 'abs', 'lowerBack'],
    tips: 'Feet shoulder-width, knees soft. Cross your arms over your chest, hands on the opposite shoulders. Keep your hips facing forward and turn your chest side to side, letting your head follow.',
    // Arms folded across the chest: each hand rests on the opposite shoulder (enforced by touch).
    touch: [['hand_L', 'shoulder_R', 0.08], ['hand_R', 'shoulder_L', 0.08]],
    frames: [
      { spineTwist: 40, neckTurn: 15, shF: 68, shAbd: -11, elbow: 122, shRot: -80, hipAbd: 9, knee: 6 },
      { spineTwist: -40, neckTurn: -15, shF: 68, shAbd: -11, elbow: 122, shRot: -80, hipAbd: 9, knee: 6 },
    ],
  },
  {
    id: 'side-bend', on: 'feet', name: 'Standing Side Bends', cat: 'warmup', level: 1, met: 2.5, cycle: 3.5, view: 'front',
    muscles: ['obliques', 'back'],
    tips: 'Reach one arm up and over your head and lean to the opposite side, sliding the other hand down the side of your thigh. Do not lean forward or twist.',
    // The lower hand slides down the outside of the thigh toward the knee (touch keeps it on the leg).
    frames: [
      { spineSide: 32, shAbd_R: 165, elbow_R: 15, shAbd_L: 15, hipAbd: 9, touch: [['hand_L', 'knee_L', 0.18]] },
      { hipAbd: 9 },
      { spineSide: -32, shAbd_L: 165, elbow_L: 15, shAbd_R: 15, hipAbd: 9, touch: [['hand_R', 'knee_R', 0.18]] },
      { hipAbd: 9 },
    ],
  },
  {
    id: 'tadasana-reach', on: 'feet', name: 'Mountain Reach', cat: 'warmup', level: 1, met: 2.3, cycle: 6, view: 'threeq',
    muscles: ['shoulders', 'back', 'calves', 'abs'],
    tips: 'Breathe in as you sweep your arms out and up, press your palms together overhead and rise onto your toes. Breathe out as you lower.',
    // Top: arms by the ears with the palms pressed together overhead (touch), heels lifted.
    frames: [{ d: 0.8 }, { shAbd: 180, elbow: 28, shRot: 90, ankle: 25, neckF: -10, pitch: 4, hipF: -3, on: 'toes', touch: [['hand_L', 'hand_R', 0.05]] }],
  },

  // ---------------- Cardio ----------------
  {
    id: 'jumping-jacks', on: 'feet', name: 'Jumping Jacks', cat: 'cardio', level: 1, met: 8, cycle: 1.1, view: 'front',
    muscles: ['calves', 'shoulders', 'glutes', 'adductors'],
    tips: 'Jump your feet out wider than your hips as your straight arms sweep up until your hands almost clap overhead, then jump back. Land softly with knees slightly bent.',
    // Ground frames land with soft knees; at the top the hands nearly meet overhead (touch).
    frames: [
      { shAbd: 12, hipAbd: 3, knee: 10, hipF: 5, ankle: -5 },
      { shAbd: 90, hipAbd: 10, lift: 0.07, ankle: 30, d: 0.6 },
      { shAbd: 180, hipAbd: 17, elbow: 23, shRot: 90, knee: 10, hipF: 5, ankle: -5, touch: [['hand_L', 'hand_R', 0.1]] },
      { shAbd: 90, hipAbd: 10, lift: 0.07, ankle: 30, d: 0.6 },
    ],
  },
  {
    id: 'high-knees', on: 'feet', name: 'High Knees', cat: 'cardio', level: 2, met: 8, cycle: 0.75, view: 'threeq',
    muscles: ['hipFlexors', 'quads', 'calves', 'abs'],
    tips: 'Drive your knees up to hip height quickly. Stay on the balls of your feet.',
    frames: [
      { hipF_L: 95, knee_L: 95, ankle_L: 20, shF_R: 55, shF_L: -30, elbow: 85, ankle_R: 20.8, roll: 5.2, pitch: 2.9, hipAbd_R: 1.1, on: 'foot_R' },
      { shF: 10, elbow: 85, lift: 0.04, ankle: 25, d: 0.4 },
      { hipF_R: 95, knee_R: 95, ankle_R: 20, shF_L: 55, shF_R: -30, elbow: 85, ankle_L: 20.8, roll: -5.2, pitch: 2.9, hipAbd_L: 1.1, on: 'foot_L' },
      { shF: 10, elbow: 85, lift: 0.04, ankle: 25, d: 0.4 },
    ],
  },
  {
    id: 'butt-kicks', on: 'feet', name: 'Butt Kicks', cat: 'cardio', level: 1, met: 7, cycle: 0.8, view: 'side',
    muscles: ['hamstrings', 'calves', 'quads'],
    tips: 'Jog in place on the balls of your feet and flick each heel up to your glutes. Knees point down, chest stays tall.',
    // The kicking heel comes up to the seat (touch); the thigh stays about vertical.
    frames: [
      { knee_L: 150, hipF_L: -3, ankle_L: 20, touch: [['heel_L', 'seat', 0.1]], shF_R: 35, shF_L: -25, elbow: 85, ankle_R: 15, roll: 5.7, pitch: 6.9, hipAbd_R: 1.5, on: 'foot_R' },
      { elbow: 85, lift: 0.03, ankle: 20, d: 0.4 },
      { knee_R: 150, hipF_R: -3, ankle_R: 20, touch: [['heel_R', 'seat', 0.1]], shF_L: 35, shF_R: -25, elbow: 85, ankle_L: 15, roll: -5.7, pitch: 6.9, hipAbd_L: 1.5, on: 'foot_L' },
      { elbow: 85, lift: 0.03, ankle: 20, d: 0.4 },
    ],
  },
  {
    id: 'knee-elbow', on: 'feet', name: 'Standing Knee to Elbow', cat: 'cardio', level: 1, met: 5, cycle: 2, view: 'threeq',
    muscles: ['obliques', 'abs', 'hipFlexors'],
    tips: 'Fingertips lightly behind your head, elbows wide. Lift one knee and twist so the opposite elbow meets it, then stand tall and switch.',
    // Crunch frames: the lifted knee comes up past hip height and the opposite elbow swings forward
    // and down to touch it (hand stays at the back of the head); the other elbow stays wide.
    frames: [
      { hipF_L: 125, knee_L: 110, hipAbd_L: -2.7, spineTwist: 45, spineF: 50, spineSide: -9, neckF: 10,
        shAbd: 122, shRot: 90, elbow: 134, shF: 16, shF_R: 111.7, shAbd_R: -21.2, shRot_R: -25.7, elbow_R: 124.7,
        roll: 5.4, hipAbd_R: 1, on: 'foot_R',
        touch: [['elbow_R', 'knee_L', 0.07], ['hand_L', 'head-back', 0.08], ['hand_R', 'head-back', 0.08]] },
      { shAbd: 122, elbow: 134, shRot: 90, shF: 16, hipAbd: 2, touch: [['hand_L', 'head-back', 0.07], ['hand_R', 'head-back', 0.07]] },
      { hipF_R: 125, knee_R: 110, hipAbd_R: -2.7, spineTwist: -45, spineF: 50, spineSide: 9, neckF: 10,
        shAbd: 122, shRot: 90, elbow: 134, shF: 16, shF_L: 111.7, shAbd_L: -21.2, shRot_L: -25.7, elbow_L: 124.7,
        roll: -5.4, hipAbd_L: 1, on: 'foot_L',
        touch: [['elbow_L', 'knee_R', 0.07], ['hand_R', 'head-back', 0.08], ['hand_L', 'head-back', 0.08]] },
      { shAbd: 122, elbow: 134, shRot: 90, shF: 16, hipAbd: 2, touch: [['hand_L', 'head-back', 0.07], ['hand_R', 'head-back', 0.07]] },
    ],
  },
  {
    id: 'mountain-climbers', on: 'hands toes', name: 'Mountain Climbers', cat: 'cardio', level: 2, met: 8, cycle: 0.9, view: 'side', mat: true,
    muscles: ['abs', 'shoulders', 'hipFlexors', 'quads'],
    tips: 'From a high plank, drive knees toward your chest one at a time. Keep hips low.',
    frames: [
      { ...HIGH_PLANK, hipF_L: 119, knee_L: 150, ankle_L: -16, ankle_R: 0, on: 'hands foot_R' },
      { ...HIGH_PLANK, hipF_R: 119, knee_R: 150, ankle_R: -16, ankle_L: 0, on: 'hands foot_L' },
    ],
  },
  {
    id: 'squat-jumps', on: 'feet', name: 'Squat Jumps', cat: 'cardio', level: 3, met: 9, cycle: 1.6, view: 'side',
    muscles: ['quads', 'glutes', 'calves', 'hamstrings'],
    tips: 'Squat down, then explode up. Land softly and go straight into the next squat.',
    frames: [
      { ...SQUAT_LOW, shF: -35, shRot: 0, d: 1.2 },
      { shAbd: 20, shF: 160, ankle: 35, lift: 0.2, d: 0.7 },
      { lift: 0.08, shF: 90, ankle: 25, d: 0.3 },
      { pitch: 25, hipF: 60, knee: 45, ankle: -12, shF: 40, d: 0.5 },   // land softly, feet flat
    ],
  },
  {
    id: 'burpees', on: 'feet', name: 'Burpees', cat: 'cardio', level: 3, met: 10, cycle: 3.6, view: 'side', mat: true,
    muscles: ['quads', 'chest', 'shoulders', 'abs', 'glutes'],
    tips: 'Squat, hands down, jump back to plank, jump feet in, then jump up. Move with control.',
    frames: [
      { d: 0.6 },
      { ...SQUAT_HANDS_DOWN, d: 0.6, on: 'feet hands' },
      // Hop the feet back (and later in): weight onto the hands, both feet off the floor mid-jump.
      { ...SQUAT_HANDS_DOWN, pitch: 55, shF: 83, on: 'hands', d: 0.15 },
      { ...HIGH_PLANK, hipF: 15, knee: 90, ankle: 20, on: 'hands', d: 0.25 },
      { ...HIGH_PLANK, d: 0.6, on: 'hands toes' },
      { ...HIGH_PLANK, hipF: 15, knee: 90, ankle: 20, on: 'hands', d: 0.25 },
      { ...SQUAT_HANDS_DOWN, pitch: 55, shF: 83, on: 'hands', d: 0.15 },
      { ...SQUAT_HANDS_DOWN, d: 0.4, on: 'feet hands' },
      { shAbd: 20, shF: 165, ankle: 35, lift: 0.18, d: 0.6 },
    ],
  },
  {
    id: 'plank-jacks', on: 'hands toes', name: 'Plank Jacks', cat: 'cardio', level: 3, met: 8, cycle: 1, view: 'threeq', mat: true,
    muscles: ['abs', 'shoulders', 'adductors', 'glutes'],
    tips: 'Hold a high plank and jump your feet wide and back together.',
    frames: [
      { ...HIGH_PLANK, hipAbd: 2 },
      { ...HIGH_PLANK, hipAbd: 16 },
    ],
  },

  // ---------------- Strength ----------------
  {
    id: 'squats', on: 'feet', name: 'Bodyweight Squats', cat: 'strength', level: 1, met: 5, cycle: 2.6, view: 'side',
    muscles: ['quads', 'glutes', 'hamstrings', 'adductors'],
    tips: 'Feet shoulder-width, chest up, push hips back. Knees follow your toes.',
    // Feet a little wider than hips with toes turned slightly out (hipRot); knees follow the toes.
    frames: [{ shF: 15, hipAbd: 8, hipRot: 12, d: 0.8 }, { ...SQUAT_LOW, hipAbd: 20.3, hipRot: -2.1, d: 1.2 }],
  },
  {
    id: 'lunges', on: 'feet', name: 'Alternating Lunges', cat: 'strength', level: 2, met: 5.5, cycle: 5, view: 'side',
    muscles: ['quads', 'glutes', 'hamstrings', 'calves'],
    tips: 'Hands on hips, chest up. Take a big step forward and lower straight down until both knees are about 90°, front knee over the ankle, back knee just above the floor. Push back to standing and switch legs.',
    frames: [
      { ...HANDS_ON_HIPS, d: 0.6 },
      // The stepping foot lifts on the way out and back (on: the standing foot), so it never glides.
      { ...HANDS_ON_HIPS, hipF_L: 50, knee_L: 70, ankle_L: -5, roll: 3.9, hipAbd_R: -0.2, on: 'foot_R', d: 0.4 },
      // Step forward: the back foot stays where it stood (z moves the body forward with the step).
      { ...HANDS_ON_HIPS, hipF_L: 82, knee_L: 84, ankle_L: -6, hipF_R: -9, knee_R: 87, ankle_R: -37, z: 0.642 },
      { ...HANDS_ON_HIPS, hipF_L: 50, knee_L: 70, ankle_L: -5, roll: 3.9, hipAbd_R: -0.2, on: 'foot_R', d: 0.4 },
      { ...HANDS_ON_HIPS, d: 0.6 },
      { ...HANDS_ON_HIPS, hipF_R: 50, knee_R: 70, ankle_R: -5, roll: -3.9, hipAbd_L: -0.2, on: 'foot_L', d: 0.4 },
      { ...HANDS_ON_HIPS, hipF_R: 82, knee_R: 84, ankle_R: -6, hipF_L: -9, knee_L: 87, ankle_L: -37, z: 0.642 },
      { ...HANDS_ON_HIPS, hipF_R: 50, knee_R: 70, ankle_R: -5, roll: -3.9, hipAbd_L: -0.2, on: 'foot_L', d: 0.4 },
    ],
  },
  {
    id: 'calf-raises', on: 'feet', name: 'Calf Raises', cat: 'strength', level: 1, met: 3, cycle: 3, view: 'side',
    muscles: ['calves'],
    tips: 'Rise slowly onto your toes, pause at the top, lower with control.',
    frames: [
      { ...HANDS_ON_HIPS, d: 0.8 },
      { ...HANDS_ON_HIPS, ankle: 38, pitch: 2, hipF: -2, on: 'toes', d: 0.6 },   // pause at the top
      { ...HANDS_ON_HIPS, ankle: 38, pitch: 2, hipF: -2, on: 'toes', d: 1.3 },   // lower slowly
    ],
  },
  {
    id: 'knee-pushups', on: 'hands knees', name: 'Knee Push-ups', cat: 'strength', level: 1, met: 4, cycle: 2.4, view: 'side', mat: true,
    muscles: ['chest', 'triceps', 'shoulders'],
    tips: 'Hands a little wider than your shoulders, knees down, body straight from knees to head. Lower your chest toward the floor between your hands, then press back up.',
    // Hands and knees stay planted: the body pivots on the knees (z shifts the pelvis so they don't slide).
    frames: [
      { ...KNEE_PLANK, pitch: 58.7, shF: 50 },
      { ...KNEE_PUSH_DOWN, pitch: 78.5, shF: -9.4, shAbd: 17.2, elbow: 94.7, knee: 73.9, z: 0.093 },
    ],
  },
  {
    id: 'pushups', on: 'hands toes', name: 'Push-ups', cat: 'strength', level: 2, met: 6, cycle: 2.2, view: 'side', mat: true,
    muscles: ['chest', 'triceps', 'shoulders', 'abs'],
    tips: 'Hands under your shoulders, body in one straight line from head to heels. Lower until your chest is near the floor, elbows about 45° from your sides.',
    // Hands and toes stay planted: the body pivots on the toes (z shifts the pelvis so the hands don't slide).
    frames: [
      { ...HIGH_PLANK, pitch: 74, shF: 57.2, ankle: 15.8 },
      { ...PUSHUP_DOWN, pitch: 88, shF: -4.7, shAbd: 24, elbow: 105, ankle: 4.4, z: 0.059 },
    ],
  },
  {
    id: 'glute-bridge', on: 'back feet arms', name: 'Glute Bridge', cat: 'strength', level: 1, met: 3.5, cycle: 2.6, view: 'side', mat: true,
    muscles: ['glutes', 'hamstrings', 'lowerBack'],
    tips: 'Feet flat and hip-width apart, arms on the floor. Push through your heels and lift your hips until shoulders, hips and knees form a straight line. Squeeze your glutes; do not arch your back.',
    frames: [
      BACK_KNEES,
      // Top: shoulders, hips and knees in one line (hipF 0), shins near vertical, feet flat and
      // in the same place as at the start (z keeps the shoulders from sliding).
      { pitch: -108.3, hipF: 0, knee: 88.8, ankle: 19.5, shF: -33.4, shAbd: 12, elbow: 0, z: -0.026 },
    ],
  },
  {
    id: 'superman', on: 'front arms knees', name: 'Superman', cat: 'strength', level: 1, met: 3.5, cycle: 3, view: 'side', mat: true,
    muscles: ['lowerBack', 'glutes', 'back', 'hamstrings'],
    tips: 'Lying face down, lift your arms and legs a few centimetres off the floor. Keep your neck long and look at the floor; do not arch your lower back.',
    frames: [PRONE, { ...PRONE, spineF: -8, neckF: 0, shF: 178, hipF: -14, ankle: 60, on: 'front' }],
  },
  {
    id: 'bird-dog', on: 'hands knees', name: 'Bird Dog', cat: 'strength', level: 1, met: 3, cycle: 4, view: 'side', mat: true,
    muscles: ['lowerBack', 'glutes', 'abs', 'shoulders'],
    tips: 'On hands and knees, reach one arm forward and the opposite leg back. Keep hips level.',
    frames: [
      TABLETOP,
      { ...TABLETOP, shF_L: 178, wrist_L: 0, hipF_R: 0, knee_R: 0, ankle_R: 60, on: 'hand_R knee_L' },
      TABLETOP,
      { ...TABLETOP, shF_R: 178, wrist_R: 0, hipF_L: 0, knee_L: 0, ankle_L: 60, on: 'hand_L knee_R' },
    ],
  },

  // ---------------- Core ----------------
  {
    id: 'plank', on: 'forearms toes', name: 'Forearm Plank', cat: 'core', level: 1, met: 4, view: 'side', mat: true,
    muscles: ['abs', 'shoulders', 'lowerBack', 'glutes', 'quads'],
    tips: 'Elbows under shoulders, body straight. Squeeze your glutes and breathe.',
    frames: [FOREARM_PLANK],
  },
  {
    id: 'crunches', on: 'back feet', name: 'Crunches', cat: 'core', level: 1, met: 3.8, cycle: 2.2, view: 'side', mat: true,
    muscles: ['abs'],
    tips: 'Knees bent, feet flat, arms crossed on your chest. Curl your head and shoulders up until your shoulder blades leave the floor; your lower back stays down. Lower slowly.',
    // Arms crossed on the chest (Mayo Clinic): each hand rests on the opposite shoulder.
    touch: [['hand_L', 'shoulder_R', 0.09], ['hand_R', 'shoulder_L', 0.09]],
    frames: [
      { ...BACK_KNEES, shF: 40.5, shAbd: -14.4, elbow: 117.7, shRot: -80.3, wrist: 0 },
      { ...BACK_KNEES, spineF: 28, neckF: 12, shF: 40.5, shAbd: -14.4, elbow: 117.7, shRot: -80.3, wrist: 0 },
    ],
  },
  {
    id: 'dead-bug', on: 'back', name: 'Dead Bug', cat: 'core', level: 1, met: 3, cycle: 4, view: 'side', mat: true,
    muscles: ['abs', 'hipFlexors'],
    tips: 'Arms up to the ceiling, hips and knees at 90°. Press your lower back into the floor, then slowly reach one arm overhead while the opposite leg straightens until it hovers just above the floor. Return and switch.',
    frames: [
      { pitch: -90, shF: 90, elbow: 0, hipF: 90, knee: 90, ankle: 0 },
      { pitch: -90, shF_L: 90, shF_R: 175, elbow: 0, hipF_R: 90, knee_R: 90, hipF_L: 12, knee_L: 0, ankle: 0 },
      { pitch: -90, shF: 90, elbow: 0, hipF: 90, knee: 90, ankle: 0 },
      { pitch: -90, shF_R: 90, shF_L: 175, elbow: 0, hipF_L: 90, knee_L: 90, hipF_R: 12, knee_R: 0, ankle: 0 },
    ],
  },
  {
    id: 'leg-raises', on: 'back arms', name: 'Leg Raises', cat: 'core', level: 2, met: 4, cycle: 3, view: 'side', mat: true,
    muscles: ['abs', 'hipFlexors'],
    tips: 'Arms on the floor by your sides, lower back pressed down. Lift your straight legs to vertical, then lower them slowly until your heels hover just above the floor.',
    // Arms rest on the floor beside the body (shF −10), palms down.
    frames: [{ ...BACK_FLAT, shF: -10, hipF: 4, d: 1.2 }, { ...BACK_FLAT, shF: -10, hipF: 88, d: 0.8 }],
  },
  {
    id: 'flutter-kicks', on: 'back arms', name: 'Flutter Kicks', cat: 'core', level: 2, met: 4, cycle: 0.8, view: 'side', mat: true,
    muscles: ['abs', 'hipFlexors', 'quads'],
    tips: 'Lower back pressed into the floor, heels a hand-width off it. Kick your straight legs up and down in small, quick movements. If your back arches, raise your legs a little.',
    frames: [
      { ...BACK_FLAT, shF: -10, hipF_L: 18, hipF_R: 5, neckF: 15 },
      { ...BACK_FLAT, shF: -10, hipF_L: 5, hipF_R: 18, neckF: 15 },
    ],
  },
  {
    id: 'bicycle', on: 'back', name: 'Bicycle Crunches', cat: 'core', level: 2, met: 5, cycle: 2.4, view: 'threeq', mat: true,
    muscles: ['abs', 'obliques', 'hipFlexors'],
    tips: 'Fingertips behind your head, shoulders off the floor. Twist so one elbow comes to the opposite knee while the other leg stretches out low. Slow and controlled; do not pull on your neck.',
    // Twist toward the bent knee: the opposite elbow swings across to meet it, the other hand stays
    // behind the head with the elbow wide.
    frames: [
      {
        pitch: -90, spineF: 45, spineTwist: 45, neckF: 10,
        shAbd_L: 153.6, shF_L: 27.9, elbow_L: 111.3, shRot_L: 89.4,
        shAbd_R: 10, shF_R: 95, elbow_R: 120.4, shRot_R: -30.1,
        hipF_L: 102.3, knee_L: 124.7, hipAbd_L: -7.3, hipF_R: 25, knee_R: 5, ankle: 10,
        touch: [['elbow_R', 'knee_L', 0.12], ['hand_R', 'head', 0.1], ['hand_L', 'head-back', 0.08]],
      },
      {
        pitch: -90, spineF: 45, spineTwist: -45, neckF: 10,
        shAbd_R: 153.6, shF_R: 27.9, elbow_R: 111.3, shRot_R: 89.4,
        shAbd_L: 10, shF_L: 95, elbow_L: 120.4, shRot_L: -30.1,
        hipF_R: 102.3, knee_R: 124.7, hipAbd_R: -7.3, hipF_L: 25, knee_L: 5, ankle: 10,
        touch: [['elbow_L', 'knee_R', 0.12], ['hand_L', 'head', 0.1], ['hand_R', 'head-back', 0.08]],
      },
    ],
  },
  {
    id: 'side-plank', on: 'forearm_R foot_R', name: 'Side Plank', cat: 'core', level: 2, met: 4, view: 'front', mat: true, sides: true,
    muscles: ['obliques', 'shoulders', 'abs', 'glutes'],
    tips: 'Elbow under your shoulder, forearm pointing forward, feet stacked. Lift your hips so your body forms a straight line from head to feet.',
    // Forearm flat on the floor pointing forward (shRot 0), top leg resting on the bottom one.
    touch: [['heel_L', 'heel_R', 0.1]],
    frames: [{ roll: 68.5, shAbd_R: 68.5, elbow_R: 90, shRot_R: 0, shAbd_L: 100, elbow_L: 0, hipAbd_L: 1.8, hipAbd_R: -8.3, spineSide: 3.3, neckSide: 0 }],
  },

  // ---------------- Yoga ----------------
  {
    id: 'cat-cow', on: 'hands knees', name: 'Cat-Cow', cat: 'yoga', level: 1, met: 2.5, cycle: 6, view: 'side', mat: true,
    muscles: ['lowerBack', 'abs', 'back', 'neck'],
    tips: 'Wrists under shoulders, knees under hips. Inhale: drop belly, lift head (cow). Exhale: round your back, tuck chin (cat).',
    frames: [
      { ...TABLETOP, pitch: 100.1, hipF: 100.1, knee: 90, spineF: -24, neckF: -25, shF: 74 },
      { ...TABLETOP, pitch: 71.7, hipF: 71.7, knee: 90, spineF: 28, neckF: 30, shF: 103 },
    ],
  },
  {
    id: 'downward-dog', on: 'hands feet', name: 'Downward Dog', cat: 'yoga', level: 1, met: 2.8, view: 'side', mat: true,
    muscles: ['hamstrings', 'calves', 'shoulders', 'back'],
    tips: 'Hips high, press the floor away, heels toward the floor. Bend knees slightly if needed.',
    frames: [{ pitch: 132, shF: 174, shAbd: 8, wrist: 50, hipF: 89, ankle: -35, neckF: -10 }],
  },
  {
    id: 'cobra', on: 'hands front knees', name: 'Cobra Pose', cat: 'yoga', level: 1, met: 2.5, view: 'side', mat: true,
    muscles: ['lowerBack', 'chest', 'abs'],
    tips: 'Low cobra: hands under shoulders, elbows bent and close to your sides. Lift your chest using your back, not your arms.',
    frames: [{ pitch: 88.7, spineF: -30, neckF: -10, shF: -13.6, shAbd: 10, elbow: 108.9, wrist: 89.3, ankle: 60 }],
  },
  {
    id: 'childs-pose', on: 'knees head arms', name: "Child's Pose", cat: 'yoga', level: 1, met: 2, view: 'side', mat: true,
    // Hips sit back on the heels; forehead rests on the mat (the 'head' floor term).
    touch: [['sit-bones', 'heel_L', 0.1], ['sit-bones', 'heel_R', 0.1]],
    muscles: ['lowerBack', 'back', 'glutes'],
    tips: 'Sit back on your heels, stretch your arms forward and relax your forehead down.',
    frames: [{ pitch: 73, spineF: 39, hipF: 130, knee: 155, ankle: 31, shF: 180, shAbd: 10, elbow: 0, neckF: 30 }],
  },
  {
    id: 'tree', on: 'foot_R', name: 'Tree Pose', cat: 'yoga', level: 1, met: 2.3, view: 'front', sides: true,
    // Sole of the bent leg pressed on the standing leg's inner thigh (heel high, toes down),
    // palms pressed together in front of the chest.
    touch: [['heel_L', 'knee_R', 0.34], ['toes_L', 'knee_R', 0.14], ['hand_L', 'hand_R', 0.05]],
    muscles: ['calves', 'glutes', 'abs', 'adductors'],
    tips: 'Press the sole of your foot into your inner thigh (or calf, never the knee), knee out to the side. Palms together at your chest, eyes on one point.',
    frames: [{ hipF_L: 45, hipAbd_L: 45, hipRot_L: 55, knee_L: 150, ankle_L: 20, shF: 35, shAbd: 23.2, shRot: -56.7, elbow: 126.3, hipAbd_R: -2.5, roll: 3 }],
  },
  {
    id: 'warrior2', on: 'feet', name: 'Warrior II', cat: 'yoga', level: 1, met: 3, view: 'front', mat: true, sides: true,
    muscles: ['quads', 'glutes', 'shoulders', 'adductors'],
    tips: 'Wide stance, front foot pointing to the side, back foot turned slightly in. Bend the front knee over the ankle, arms long and level, gaze over your front hand.',
    // Wide stance: front foot points to the side with the shin vertical and the thigh near level,
    // back leg straight with the foot turned slightly in. Pelvis turns a little toward the front leg
    // (the rig needs this to get the thigh level); the chest twists back to face the front.
    frames: [{ yaw: 35, spineTwist: -35, hipF_L: 61, hipAbd_L: 50, hipRot_L: 25, knee_L: 74, ankle_L: 5, hipF_R: -30, hipAbd_R: 50, hipRot_R: 34, ankle_R: -7, roll: 6, shAbd: 90, elbow: 0, neckTurn: 60 }],
  },
  {
    id: 'triangle', on: 'feet', touch: [['hand_L', 'shin_L', 0.09]], name: 'Triangle Pose', cat: 'yoga', level: 2, met: 2.5, view: 'front', mat: true, sides: true,
    muscles: ['obliques', 'hamstrings', 'adductors', 'shoulders'],
    tips: 'Legs straight and wide. Reach forward, then tip from the hip and rest your lower hand on your front shin. Top arm straight up, chest open.',
    frames: [{ hipRot_L: 60, hipAbd_L: 50, hipAbd_R: -21.4, hipF_L: 17.9, hipF_R: -8.4, ankle_R: -8, roll: -26, spineSide: 38, shAbd_R: 119, shAbd_L: 56.8, shF_L: 18, elbow: 0, neckTurn: 50 }],
  },
  {
    id: 'chair', on: 'feet', name: 'Chair Pose', cat: 'yoga', level: 2, met: 3.5, view: 'side',
    muscles: ['quads', 'glutes', 'shoulders', 'calves'],
    tips: 'Sit back as if into a chair, arms reaching up, weight in your heels.',
    frames: [{ pitch: 28, hipF: 88, knee: 72, ankle: -12, shF: 170, shAbd: 8, elbow: 0 }],
  },
  {
    id: 'bridge-yoga', on: 'back feet arms', name: 'Bridge Pose', cat: 'yoga', level: 1, met: 2.5, view: 'side', mat: true,
    muscles: ['glutes', 'hamstrings', 'lowerBack', 'chest'],
    tips: 'Feet flat and hip-width, arms long on the floor. Lift your hips, keep your weight on your upper back and shoulders, not your neck.',
    frames: [{ pitch: -122, hipF: -15, knee: 105, ankle: 3, shF: -38, shAbd: 10, elbow: 0, neckF: 50 }],
  },

  // ---------------- Stretch / cool-down ----------------
  {
    id: 'forward-fold', on: 'feet', name: 'Standing Forward Fold', cat: 'stretch', level: 1, met: 2.3, view: 'side',
    // Hands rest on the shins (easier than the floor for most people), head hangs heavy.
    touch: [['hand_L', 'shin_L', 0.08], ['hand_R', 'shin_R', 0.08]],
    muscles: ['hamstrings', 'lowerBack', 'calves'],
    tips: 'Hinge at your hips, rest your hands on your shins (or the floor) and let your head hang heavy. Bend your knees if your back rounds a lot.',
    frames: [{ pitch: 75, spineF: 35, hipF: 81, knee: 5, ankle: -5, shF: 72, shAbd: -5, elbow: 0, neckF: 15 }],
  },
  {
    id: 'seated-fold', on: 'seat heels', name: 'Seated Forward Bend', cat: 'stretch', level: 1, met: 2.3, view: 'side', mat: true,
    // Hands hold the feet (or ankles), fold from the hips with the knees a little soft.
    touch: [['hand_L', 'toes_L', 0.08], ['hand_R', 'toes_R', 0.08]],
    muscles: ['hamstrings', 'lowerBack', 'calves'],
    tips: 'Sit tall with legs straight, toes up. Fold forward from your hips and hold your feet, ankles or shins. Bend your knees if your hamstrings are tight.',
    frames: [{ pitch: 40, spineF: 38, hipF: 130, knee: 0, ankle: 0, shF: 145, shAbd: -6, elbow: 25, neckF: 5 }],
  },
  {
    id: 'quad-stretch', on: 'foot_R', touch: [['hand_L', 'foot-top_L', 0.06], ['knee_L', 'knee_R', 0.12]], name: 'Standing Quad Stretch', cat: 'stretch', level: 1, met: 2.3, view: 'side', sides: true,
    muscles: ['quads', 'hipFlexors'],
    tips: 'Hold your ankle behind you with the same-side hand and draw the heel toward your seat. Knees together, hips pushed slightly forward.',
    frames: [{ knee_L: 155, hipF_L: -7, hipAbd_L: -12.4, ankle_L: 30, shF_L: -41.3, shAbd_L: -7.7, elbow_L: 34, shF_R: 70, elbow_R: 5, roll: 5.7 }],
  },
  {
    id: 'shoulder-stretch', on: 'feet', name: 'Cross-body Shoulder Stretch', cat: 'stretch', level: 1, met: 2, view: 'front', sides: true,
    // The other hand holds the stretched arm just above the elbow and pulls it in to the chest.
    touch: [['hand_R', 'elbow_L', 0.07], ['elbow_L', 'chest', 0.16]],
    muscles: ['shoulders', 'back', 'triceps'],
    tips: 'Bring one straight arm across your chest. Hold it just above the elbow with your other hand and gently pull it closer. Keep the shoulder down.',
    frames: [{ shF_L: 88, shAbd_L: -45, elbow_L: 0, shF_R: 20, shAbd_R: 15, elbow_R: 130, shRot_R: -60, hipAbd: 6 }],
  },
  {
    id: 'deep-breath', on: 'feet', name: 'Deep Breathing', cat: 'stretch', level: 1, met: 1.8, cycle: 8, view: 'front',
    muscles: ['chest', 'back', 'shoulders'],
    tips: 'Inhale slowly as your arms rise, exhale as they lower. Relax your whole body.',
    frames: [{ shAbd: 10, hipAbd: 6 }, { shAbd: 170, elbow: 5, hipAbd: 6, neckF: -8 }],
  },

  // ---------------- Added for the Beginner Full Body routine ----------------
  {
    id: 'arm-swings', on: 'feet', name: 'Arm Swings', cat: 'warmup', level: 1, met: 3.5, cycle: 2, view: 'threeq', ease: 'linear',
    muscles: ['shoulders', 'chest', 'back', 'traps'],
    tips: 'Swing both arms in big full circles: forward, up past your ears, back and down. Keep arms long and relaxed.',
    // One continuous circle: shoulder flexion runs 0° → 360°. Behind the body the arm opens out to the
    // side (abduction), because no shoulder can swing straight back past 60°.
    frames: [
      { shF: 0, shAbd: 15, elbow: 5, hipAbd: 8 },
      { shF: 90, shAbd: 15, elbow: 5, hipAbd: 8 },
      { shF: 180, shAbd: 20, elbow: 5, hipAbd: 8 },
      { shF: 270, shAbd: 70, elbow: 5, hipAbd: 8 },
      { shF: 360, shAbd: 15, elbow: 5, hipAbd: 8, d: 0.001 },   // same as the first frame: loops seamlessly
    ],
  },
  {
    id: 'side-leg-raise', on: 'feet', name: 'Side Leg Raises', cat: 'warmup', level: 1, met: 3.5, cycle: 2.4, view: 'front',
    muscles: ['glutes', 'obliques', 'adductors'],
    tips: 'Hands on hips, lift one straight leg out to the side, lower it and switch. Stay tall.',
    frames: [
      { ...HANDS_ON_HIPS, shF: -10, shAbd: 35, elbow: 85, shRot: -70, hipAbd_L: 40, hipAbd_R: -3, roll: 4, on: 'foot_R' },
      { ...HANDS_ON_HIPS, shF: -10, shAbd: 35, elbow: 85, shRot: -70, d: 0.5 },
      { ...HANDS_ON_HIPS, shF: -10, shAbd: 35, elbow: 85, shRot: -70, hipAbd_R: 40, hipAbd_L: -3, roll: -4, on: 'foot_L' },
      { ...HANDS_ON_HIPS, shF: -10, shAbd: 35, elbow: 85, shRot: -70, d: 0.5 },
    ],
  },
  {
    id: 'twisters', on: 'feet', name: 'Twisters', cat: 'cardio', level: 1, met: 6, cycle: 1.2, view: 'front',
    muscles: ['obliques', 'abs', 'calves'],
    tips: 'Small hops, twisting your hips one way and your shoulders the other. Arms out for balance.',
    frames: [
      // Land twisted: hips and feet turned, chest still facing forward; soft knees
      { yaw: 35, spineTwist: -35, shAbd: 70, elbow: 70, shRot: -30, hipAbd: 6, hipF: 12, knee: 18, ankle: -6 },
      { shAbd: 70, elbow: 70, shRot: -30, hipAbd: 6, lift: 0.05, ankle: 25, knee: 4, d: 0.5 },
      { yaw: -35, spineTwist: 35, shAbd: 70, elbow: 70, shRot: -30, hipAbd: 6, hipF: 12, knee: 18, ankle: -6 },
      { shAbd: 70, elbow: 70, shRot: -30, hipAbd: 6, lift: 0.05, ankle: 25, knee: 4, d: 0.5 },
    ],
  },
  {
    id: 'cross-toe-touch', on: 'feet', name: 'Cross Toe Touch', cat: 'warmup', level: 1, met: 4, cycle: 2.6, view: 'threeq',
    muscles: ['hamstrings', 'obliques', 'lowerBack', 'shoulders'],
    tips: 'Feet wide. Reach one hand down to the opposite foot, other arm up. Stand and switch.',
    frames: [
      { hipAbd: 18, shAbd: 80, d: 0.6 },
      { hipAbd: 18, pitch: 80, hipF: 109.4, ankle: 18, spineF: 41.5, spineTwist: 33.8, shF_R: 117.3, shAbd_R: -15, shAbd_L: 45, shF_L: -50, knee: 12, touch: [['hand_R', 'foot-top_L', 0.08]] },
      { hipAbd: 18, shAbd: 80, d: 0.6 },
      { hipAbd: 18, pitch: 80, hipF: 109.4, ankle: 18, spineF: 41.5, spineTwist: -33.8, shF_L: 117.3, shAbd_L: -15, shAbd_R: 45, shF_R: -50, knee: 12, touch: [['hand_L', 'foot-top_R', 0.08]] },
    ],
  },
  {
    id: 'diamond-pushups', on: 'hands toes', name: 'Diamond Push-ups', cat: 'strength', level: 2, met: 6, cycle: 2.4, view: 'sidefront', mat: true,
    muscles: ['triceps', 'chest', 'shoulders', 'abs'],
    tips: 'Hands together under your chest, thumbs and fingers forming a diamond. Too hard? Drop to your knees.',
    touch: [['hand_L', 'hand_R', 0.08]],
    frames: [
      { ...HIGH_PLANK, shF: 58, shAbd: -19, shRot: 17 },
      { ...PUSHUP_DOWN, pitch: 86, shF: 20, elbow: 89.5, shAbd: -2, shRot: -45 },
    ],
  },
  {
    id: 'squat-hold', on: 'feet', name: 'Squat Hold', cat: 'strength', level: 1, met: 5, view: 'side',
    muscles: ['quads', 'glutes', 'hamstrings'],
    tips: 'Sit low as if on a chair and hold. Chest up, weight in your heels, keep breathing.',
    frames: [{ ...SQUAT_LOW, shF: 100 }],
  },
  {
    id: 'db-rows', on: 'feet', name: 'Dumbbell Rows', cat: 'strength', level: 1, met: 4, cycle: 2.4, view: 'side', props: ['dumbbells'],
    muscles: ['back', 'biceps', 'shoulders', 'lowerBack'],
    tips: 'Soft knees, hinge forward with a flat back until your chest is well forward. Pull the weights up beside your ribs, elbows close to your body, squeeze your shoulder blades, lower slowly.',
    frames: [
      // Deeper hinge (torso ~30° above horizontal); arms hang straight down, then the elbows drive
      // back past the ribs with the forearms vertical (elbow = pitch − shF)
      { ...HINGE, pitch: 60, hipF: 71.5, knee: 18, ankle: -11, shF: 60, shAbd: 8, elbow: 5 },
      { ...HINGE, pitch: 60, hipF: 71.5, knee: 18, ankle: -11, shF: -20, shAbd: 14, elbow: 80 },
    ],
  },
  {
    id: 'shoulder-press', on: 'feet', name: 'Shoulder Press', cat: 'strength', level: 1, met: 4, cycle: 2.4, view: 'front', props: ['dumbbells'],
    muscles: ['shoulders', 'triceps', 'traps'],
    tips: 'Weights at shoulder height, press straight up overhead, lower back to your shoulders.',
    frames: [
      { shAbd: 85, elbow: 95, shRot: 90, hipAbd: 6 },
      { shAbd: 168, elbow: 10, shRot: 90, hipAbd: 6 },
    ],
  },
  {
    id: 'front-raises', on: 'feet', name: 'Front Raises', cat: 'strength', level: 1, met: 3.5, cycle: 2.4, view: 'sidefront', props: ['dumbbells'],
    muscles: ['shoulders', 'chest'],
    tips: 'Weights in front of your thighs, palms facing you. Arms almost straight, lift them in front of you to shoulder height, palms down, then lower slowly. No swinging or leaning back.',
    // Overhand grip: the arms are turned in (shRot) so the bars run left-right, palms down at the top
    frames: [
      { shF: 10, shAbd: 2, shRot: -80, elbow: 8, hipAbd: 6 },
      { shF: 88, shAbd: 2, shRot: -80, elbow: 8, hipAbd: 6 },
    ],
  },
  {
    id: 'lateral-raises', on: 'feet', name: 'Lateral Raises', cat: 'strength', level: 1, met: 3.5, cycle: 2.4, view: 'front', props: ['dumbbells'],
    muscles: ['shoulders', 'traps'],
    tips: 'Lift the weights out to the sides to shoulder height, elbows soft. Do not shrug.',
    frames: [
      { shAbd: 12, elbow: 10, hipAbd: 6 },
      { shAbd: 85, elbow: 12, hipAbd: 6 },
    ],
  },
  {
    id: 'bicep-curls', on: 'feet', name: 'Bicep Curls', cat: 'strength', level: 1, met: 3.5, cycle: 2.2, view: 'threeq', props: ['dumbbells'],
    muscles: ['biceps', 'forearms'],
    tips: 'Elbows tucked at your sides, curl the weights up to your shoulders, lower all the way.',
    frames: [
      { shAbd: 10, elbow: 8, hipAbd: 6 },
      { shAbd: 10, shF: 2, elbow: 135, hipAbd: 6 },
    ],
  },
  {
    id: 'tricep-kickbacks', on: 'feet', name: 'Tricep Kickbacks', cat: 'strength', level: 1, met: 3.5, cycle: 2.2, view: 'side', props: ['dumbbells'],
    muscles: ['triceps', 'shoulders', 'back'],
    tips: 'Hinge forward, upper arms along your body. Straighten your elbows to push the weights back.',
    frames: [
      { ...HINGE, pitch: 75, hipF: 87, knee: 17, ankle: -3, shF: -15, shAbd: 6, elbow: 90 },
      { ...HINGE, pitch: 75, hipF: 87, knee: 17, ankle: -3, shF: -15, shAbd: 6, elbow: 5 },
    ],
  },
  {
    id: 'knee-touch', on: 'back feet', name: 'Knee Touches', cat: 'core', level: 1, met: 3.8, cycle: 2.2, view: 'side', mat: true,
    muscles: ['abs'],
    tips: 'Lying with knees bent, curl your shoulders up and slide your hands up your thighs toward your knees. Lower slowly.',
    frames: [
      { ...BACK_KNEES, shF: 22, shAbd: -8, elbow: 0, touch: [['hand_L', 'knee_L', 0.2], ['hand_R', 'knee_R', 0.2]] },
      { ...BACK_KNEES, spineF: 39.4, neckF: 12, shF: 52, shAbd: -4, elbow: 0, touch: [['hand_L', 'knee_L', 0.06], ['hand_R', 'knee_R', 0.06]] },
    ],
  },
  {
    id: 'russian-twists', on: 'seat feet', name: 'Russian Twists', cat: 'core', level: 1, met: 4, cycle: 2, view: 'threeq', mat: true,
    muscles: ['obliques', 'abs', 'hipFlexors'],
    tips: 'Sit leaning back with a straight back, feet on the floor. Hands clasped in front of your chest, rotate your chest side to side.',
    touch: [['hand_L', 'hand_R', 0.06]],
    frames: [
      { pitch: -42, hipF: 101.7, knee: 110.7, ankle: 15.1, spineTwist: 40, shF: 25, shAbd: -22, shRot: 0, elbow: 60 },
      { pitch: -42, hipF: 101.7, knee: 110.7, ankle: 15.1, spineTwist: -40, shF: 25, shAbd: -22, shRot: 0, elbow: 60 },
    ],
  },
  {
    id: 'plank-knee-elbow', on: 'hands toes', name: 'Knee to Elbow Plank', cat: 'core', level: 1, met: 5, cycle: 2.4, view: 'threeq', mat: true,
    muscles: ['abs', 'obliques', 'shoulders', 'hipFlexors'],
    tips: 'From a high plank, bring one knee out to the side up toward the outside of the same elbow, crunching that side of your waist. Step back and switch. Hips stay low and level.',
    frames: [
      { ...HIGH_PLANK, shF: 72, shAbd_L: 25, shAbd_R: -12, spineSide: 17, hipF_L: 120, hipAbd_L: 50, hipRot_L: -8, knee_L: 135, ankle_L: 45, ankle_R: 20, on: 'hands foot_R', touch: [['knee_L', 'elbow_L', 0.15]] },
      { ...HIGH_PLANK, d: 0.6 },
      { ...HIGH_PLANK, shF: 72, shAbd_R: 25, shAbd_L: -12, spineSide: -17, hipF_R: 120, hipAbd_R: 50, hipRot_R: -8, knee_R: 135, ankle_R: 45, ankle_L: 20, on: 'hands foot_L', touch: [['knee_R', 'elbow_R', 0.15]] },
      { ...HIGH_PLANK, d: 0.6 },
    ],
  },

  // ---------------- Added: bodyweight strength, cardio & core ----------------
  {
    id: 'reverse-lunges', on: 'feet', name: 'Reverse Lunges', cat: 'strength', level: 1, met: 5, cycle: 5, view: 'side',
    muscles: ['quads', 'glutes', 'hamstrings', 'calves'],
    tips: 'Step one foot back and lower your back knee toward the floor, chest up. Push through the front heel to stand. Hold a chair for balance if needed.',
    frames: [
      // The stepping foot lifts on the way back and on the way in (on: the standing foot), so it never glides.
      { ...HANDS_ON_HIPS, shF: -10, shAbd: 35, elbow: 85, shRot: -70, d: 0.6 },
      { ...HANDS_ON_HIPS, shF: -10, shAbd: 35, elbow: 85, shRot: -70, hipF_R: 25, knee_R: 90, ankle_R: -10, hipF_L: 10, knee_L: 12, ankle_L: -6, roll: -3.9, hipAbd_L: -0.2, on: 'foot_L', d: 0.4 },
      { ...HANDS_ON_HIPS, shF: -10, shAbd: 35, elbow: 85, shRot: -70, pitch: 8, hipF_L: 90, knee_L: 87.8, ankle_L: -4.7, hipF_R: 1.8, knee_R: 90, ankle_R: -33.1, z: -0.37 },
      { ...HANDS_ON_HIPS, shF: -10, shAbd: 35, elbow: 85, shRot: -70, hipF_R: 25, knee_R: 90, ankle_R: -10, hipF_L: 10, knee_L: 12, ankle_L: -6, roll: -3.9, hipAbd_L: -0.2, on: 'foot_L', d: 0.4 },
      { ...HANDS_ON_HIPS, shF: -10, shAbd: 35, elbow: 85, shRot: -70, d: 0.6 },
      { ...HANDS_ON_HIPS, shF: -10, shAbd: 35, elbow: 85, shRot: -70, hipF_L: 25, knee_L: 90, ankle_L: -10, hipF_R: 10, knee_R: 12, ankle_R: -6, roll: 3.9, hipAbd_R: -0.2, on: 'foot_R', d: 0.4 },
      { ...HANDS_ON_HIPS, shF: -10, shAbd: 35, elbow: 85, shRot: -70, pitch: 8, hipF_R: 90, knee_R: 87.8, ankle_R: -4.7, hipF_L: 1.8, knee_L: 90, ankle_L: -33.1, z: -0.37 },
      { ...HANDS_ON_HIPS, shF: -10, shAbd: 35, elbow: 85, shRot: -70, hipF_L: 25, knee_L: 90, ankle_L: -10, hipF_R: 10, knee_R: 12, ankle_R: -6, roll: 3.9, hipAbd_R: -0.2, on: 'foot_R', d: 0.4 },
    ],
  },
  {
    id: 'side-lunges', on: 'feet', touch: [['hand_L', 'hand_R', 0.05], ['hand_L', 'chest', 0.22]], name: 'Side Lunges', cat: 'strength', level: 2, met: 5, cycle: 5, view: 'threeq',
    muscles: ['adductors', 'glutes', 'quads', 'hamstrings'],
    tips: 'Hands clasped at your chest. Take a wide step to the side, sit your hips back over that foot and keep the other leg straight. Both feet stay flat, toes forward. Push back to the middle and switch.',
    frames: [
      // The stepping foot lifts on the way out and back (on: the standing foot), so it never glides;
      // x shifts the hips over the bent leg so the straight leg's foot stays where it stood.
      { shF: 40, shAbd: -10, elbow: 120, shRot: -40, hipAbd: 6, d: 0.6 },
      { shF: 40, shAbd: -10, elbow: 120, shRot: -40, hipF_L: 30, knee_L: 60, ankle_L: -10, hipAbd_L: 20, roll: 4, hipAbd_R: -1.1, on: 'foot_R', d: 0.4 },
      { shF: 40, shAbd: -10, elbow: 120, shRot: -40, pitch: 30.4, hipF_L: 80, knee_L: 85, ankle_L: -29.1, hipAbd_L: 20, hipRot_L: 10, hipF_R: 25.6, hipAbd_R: 41.3, ankle_R: -0.4, x: 0.4 },
      { shF: 40, shAbd: -10, elbow: 120, shRot: -40, hipF_L: 30, knee_L: 60, ankle_L: -10, hipAbd_L: 20, roll: 4, hipAbd_R: -1.1, on: 'foot_R', d: 0.4 },
      { shF: 40, shAbd: -10, elbow: 120, shRot: -40, hipAbd: 6, d: 0.6 },
      { shF: 40, shAbd: -10, elbow: 120, shRot: -40, hipF_R: 30, knee_R: 60, ankle_R: -10, hipAbd_R: 20, roll: -4, hipAbd_L: -1.1, on: 'foot_L', d: 0.4 },
      { shF: 40, shAbd: -10, elbow: 120, shRot: -40, pitch: 30.4, hipF_R: 80, knee_R: 85, ankle_R: -29.1, hipAbd_R: 20, hipRot_R: 10, hipF_L: 25.6, hipAbd_L: 41.3, ankle_L: -0.4, x: -0.4 },
      { shF: 40, shAbd: -10, elbow: 120, shRot: -40, hipF_R: 30, knee_R: 60, ankle_R: -10, hipAbd_R: 20, roll: -4, hipAbd_L: -1.1, on: 'foot_L', d: 0.4 },
    ],
  },
  {
    id: 'sumo-squats', on: 'feet', touch: [['hand_L', 'hand_R', 0.05], ['hand_L', 'chest', 0.22]], name: 'Sumo Squats', cat: 'strength', level: 1, met: 5, cycle: 2.8, view: 'front',
    muscles: ['adductors', 'glutes', 'quads', 'hamstrings'],
    tips: 'Feet wide, toes turned out, hands together at your chest. Sit straight down with your chest up and knees pushing out over your toes, then squeeze your glutes to stand.',
    frames: [
      { hipAbd: 9, hipRot: 52.7, ankle: 4, pitch: 3.4, shF: 40, shAbd: -10, elbow: 120, shRot: -40, d: 0.8 },
      { hipAbd: 48, hipRot: 24.9, hipF: 78.4, knee: 100, ankle: -28.3, pitch: 20.6, shF: 40, shAbd: -10, elbow: 120, shRot: -40, d: 1.2 },
    ],
  },
  {
    id: 'step-jacks', on: 'feet', name: 'Step Jacks', cat: 'cardio', level: 1, met: 4.5, cycle: 2.4, view: 'front',
    muscles: ['shoulders', 'glutes', 'adductors', 'calves'],
    tips: 'A quiet jumping jack: step one foot out to the side as both arms sweep overhead, chest staying tall, step back in, switch. No jumping, so it is kind to knees and neighbours.',
    frames: [
      // The stepping foot lifts on the way out and back in (on: the standing foot), so it never glides.
      { shAbd: 165, elbow: 5, hipAbd_L: 25, hipAbd_R: -8.6, roll: -10, spineSide: -12, d: 0.7 },
      { shAbd: 90, elbow: 5, hipF_L: 40, knee_L: 60, ankle_L: -15, hipAbd_L: 12, roll: 6.3, hipAbd_R: 2.3, on: 'foot_R', d: 0.4 },
      { shAbd: 12, hipAbd: 3, d: 0.6 },
      { shAbd: 90, elbow: 5, hipF_R: 40, knee_R: 60, ankle_R: -15, hipAbd_R: 12, roll: -6.3, hipAbd_L: 2.3, on: 'foot_L', d: 0.4 },
      { shAbd: 165, elbow: 5, hipAbd_R: 25, hipAbd_L: -8.6, roll: 10, spineSide: 12, d: 0.7 },
      { shAbd: 90, elbow: 5, hipF_R: 40, knee_R: 60, ankle_R: -15, hipAbd_R: 12, roll: -6.3, hipAbd_L: 2.3, on: 'foot_L', d: 0.4 },
      { shAbd: 12, hipAbd: 3, d: 0.6 },
      { shAbd: 90, elbow: 5, hipF_L: 40, knee_L: 60, ankle_L: -15, hipAbd_L: 12, roll: 6.3, hipAbd_R: 2.3, on: 'foot_R', d: 0.4 },
    ],
  },
  {
    id: 'skaters', on: 'foot_R', name: 'Skaters', cat: 'cardio', level: 2, met: 7, cycle: 1.6, view: 'threeq',
    muscles: ['glutes', 'quads', 'adductors', 'calves'],
    tips: 'Hop sideways onto one foot, sweep the other leg behind you and swing your arms across, like a speed skater. Low-impact option: step instead of hopping.',
    frames: [
      { pitch: 29, roll: 6.1, hipF_R: 60, knee_R: 55, ankle_R: -20.1, hipF_L: 5, hipAbd_L: -24, knee_L: 50, ankle_L: 30, spineTwist: 25, shF_L: 50, shAbd_L: -30, shF_R: -30, elbow: 20 },
      { pitch: 10, hipF: 25, knee: 30, ankle: 25, shF: 10, elbow: 20, lift: 0.1, d: 0.6 },
      { pitch: 29, roll: -6.1, hipF_L: 60, knee_L: 55, ankle_L: -20.1, hipF_R: 5, hipAbd_R: -24, knee_R: 50, ankle_R: 30, spineTwist: -25, shF_R: 50, shAbd_R: -30, shF_L: -30, elbow: 20, on: 'foot_L' },
      { pitch: 10, hipF: 25, knee: 30, ankle: 25, shF: 10, elbow: 20, lift: 0.1, d: 0.6 },
    ],
  },
  {
    id: 'inchworm', on: 'feet', name: 'Inchworm', cat: 'strength', level: 2, met: 4.5, cycle: 13, view: 'side', mat: true,
    muscles: ['abs', 'shoulders', 'hamstrings', 'chest'],
    tips: 'Bend forward and put your hands on the floor (bend your knees as much as you need). Keep your feet still and walk your hands out, one hand at a time, to a plank. Walk them back and roll up to stand.',
    frames: [
      { d: 0.6 },
      { pitch: 113.7, spineF: 35, hipF: 118.7, knee: 33.5, ankle: -20, shF: 117.7, wrist: 80, neckF: 10, z: 0.22, on: 'feet hands' },
      // L hand steps forward
      { pitch: 109.8, spineF: 37, hipF: 117.6, knee: 31.9, ankle: -20, wrist: 79, neckF: 9, roll: -3.8, shF_L: 140.5, shF_R: 119.2, elbow_L: 44.7, z: 0.171, on: 'hand_R feet', d: 0.3 },
      { pitch: 117.9, spineF: 31.6, hipF: 113.8, knee: 30.3, ankle: -20, wrist: 78, neckF: 8, shF_L: 154.1, shF_R: 108.4, z: 0.342, on: 'hands feet', d: 0.35 },
      // R hand steps forward
      { pitch: 115, spineF: 34.6, hipF: 110.4, knee: 30.8, ankle: -20, wrist: 76.5, neckF: 6.5, roll: -2.1, shF_L: 153.4, shF_R: 107, elbow_R: 72.9, z: 0.355, on: 'hand_L feet', d: 0.3 },
      { pitch: 113.9, spineF: 25.6, hipF: 107, knee: 31.3, ankle: -20, shF: 134.3, wrist: 75, neckF: 5, z: 0.395, on: 'hands feet', d: 0.35 },
      // L hand steps forward
      { pitch: 110.5, spineF: 20.1, hipF: 98.9, knee: 33.8, ankle: -20, wrist: 73.5, neckF: 2.5, roll: -1, spineTwist: -0.6, shF_L: 138.2, shF_R: 112.5, elbow_L: 29.5, z: 0.488, on: 'hand_R feet', d: 0.3 },
      { pitch: 117.5, spineF: -1.9, hipF: 90.5, knee: 36.3, ankle: -20, wrist: 72, shF_L: 128.6, shF_R: 70.8, spineTwist: -1.1, roll: -0.7, z: 0.721, on: 'hands feet', d: 0.35 },
      // R hand steps forward
      { pitch: 115, spineF: 10.9, hipF: 82.9, knee: 23.1, ankle: -20, wrist: 71, roll: -0.9, spineTwist: -0.6, shF_L: 143.6, shF_R: 81.1, elbow_R: 84.6, z: 0.701, on: 'hand_L feet', d: 0.3 },
      { pitch: 121.8, shF: 140.4, wrist: 70, hipF: 83.2, knee: 10, ankle: -20, z: 0.689, on: 'hands feet', d: 0.35 },
      // L hand steps forward
      { pitch: 100.1, spineF: 15.1, hipF: 51.3, knee: 5, ankle: -2.5, wrist: 80, shAbd: 4, roll: -0.1, spineTwist: 1.2, shF_L: 126.5, shF_R: 112.8, elbow_L: 32.1, wrist_R: 84.1, z: 0.841, on: 'hand_R feet', d: 0.3 },
      { pitch: 85, spineF: 9, shF_L: 100, shF_R: 68.6, shAbd: 8, wrist: 85, ankle: 14.1, hipF: 20, roll: -0.1, spineTwist: 0.5, wrist_R: 88.8, wrist_L: 69.1, z: 1.04, on: 'hands feet', d: 0.35 },
      // R hand steps forward
      { pitch: 78.5, spineF: 19.6, hipF: 12.8, knee: 0, ankle: 22.5, wrist: 90, shAbd: 8, roll: 1.6, spineTwist: 1.2, shF_L: 100.7, shF_R: 62.4, elbow_R: 72.5, wrist_L: 77.1, z: 1.071, on: 'hand_L feet', d: 0.3 },
      { ...HIGH_PLANK, z: 1.16, d: 1.2, on: 'hands toes' },
      // walk the hands back the same way
      { pitch: 78.5, spineF: 19.6, hipF: 12.8, knee: 0, ankle: 22.5, wrist: 90, shAbd: 8, roll: 1.6, spineTwist: 1.2, shF_L: 100.7, shF_R: 62.4, elbow_R: 72.5, wrist_L: 77.1, z: 1.071, on: 'hand_L feet', d: 0.3 },
      { pitch: 85, spineF: 9, shF_L: 100, shF_R: 68.6, shAbd: 8, wrist: 85, ankle: 14.1, hipF: 20, roll: -0.1, spineTwist: 0.5, wrist_R: 88.8, wrist_L: 69.1, z: 1.04, on: 'hands feet', d: 0.35 },
      { pitch: 100.1, spineF: 15.1, hipF: 51.3, knee: 5, ankle: -2.5, wrist: 80, shAbd: 4, roll: -0.1, spineTwist: 1.2, shF_L: 126.5, shF_R: 112.8, elbow_L: 32.1, wrist_R: 84.1, z: 0.841, on: 'hand_R feet', d: 0.3 },
      { pitch: 121.8, shF: 140.4, wrist: 70, hipF: 83.2, knee: 10, ankle: -20, z: 0.689, on: 'hands feet', d: 0.35 },
      { pitch: 115, spineF: 10.9, hipF: 82.9, knee: 23.1, ankle: -20, wrist: 71, roll: -0.9, spineTwist: -0.6, shF_L: 143.6, shF_R: 81.1, elbow_R: 84.6, z: 0.701, on: 'hand_L feet', d: 0.3 },
      { pitch: 117.5, spineF: -1.9, hipF: 90.5, knee: 36.3, ankle: -20, wrist: 72, shF_L: 128.6, shF_R: 70.8, spineTwist: -1.1, roll: -0.7, z: 0.721, on: 'hands feet', d: 0.35 },
      { pitch: 110.5, spineF: 20.1, hipF: 98.9, knee: 33.8, ankle: -20, wrist: 73.5, neckF: 2.5, roll: -1, spineTwist: -0.6, shF_L: 138.2, shF_R: 112.5, elbow_L: 29.5, z: 0.488, on: 'hand_R feet', d: 0.3 },
      { pitch: 113.9, spineF: 25.6, hipF: 107, knee: 31.3, ankle: -20, shF: 134.3, wrist: 75, neckF: 5, z: 0.395, on: 'hands feet', d: 0.35 },
      { pitch: 115, spineF: 34.6, hipF: 110.4, knee: 30.8, ankle: -20, wrist: 76.5, neckF: 6.5, roll: -2.1, shF_L: 153.4, shF_R: 107, elbow_R: 72.9, z: 0.355, on: 'hand_L feet', d: 0.3 },
      { pitch: 117.9, spineF: 31.6, hipF: 113.8, knee: 30.3, ankle: -20, wrist: 78, neckF: 8, shF_L: 154.1, shF_R: 108.4, z: 0.342, on: 'hands feet', d: 0.35 },
      { pitch: 109.8, spineF: 37, hipF: 117.6, knee: 31.9, ankle: -20, wrist: 79, neckF: 9, roll: -3.8, shF_L: 140.5, shF_R: 119.2, elbow_L: 44.7, z: 0.171, on: 'hand_R feet', d: 0.3 },
      { pitch: 113.7, spineF: 35, hipF: 118.7, knee: 33.5, ankle: -20, shF: 117.7, wrist: 80, neckF: 10, z: 0.22, on: 'feet hands', d: 1 },
    ],
  },
  {
    id: 'plank-shoulder-taps', on: 'hands toes', name: 'Plank Shoulder Taps', cat: 'core', level: 2, met: 5, cycle: 2, view: 'threeq', mat: true,
    muscles: ['abs', 'obliques', 'shoulders', 'triceps'],
    tips: 'High plank with feet wide. Lift one hand to tap the opposite shoulder without rocking your hips, then switch. Easier: do it with your knees down.',
    frames: [
      { ...HIGH_PLANK, hipAbd: 10, shF_L: 130.4, shAbd_L: -22, elbow_L: 113.1, shRot_L: -80, wrist_L: 0, spineTwist: -2.8, on: 'hand_R toes', touch: [['hand_L', 'shoulder_R', 0.09]] },
      { ...HIGH_PLANK, hipAbd: 10, d: 0.6 },
      { ...HIGH_PLANK, hipAbd: 10, shF_R: 130.4, shAbd_R: -22, elbow_R: 113.1, shRot_R: -80, wrist_R: 0, spineTwist: 2.8, on: 'hand_L toes', touch: [['hand_R', 'shoulder_L', 0.09]] },
      { ...HIGH_PLANK, hipAbd: 10, d: 0.6 },
    ],
  },
  {
    id: 'reverse-crunches', on: 'back arms', name: 'Reverse Crunches', cat: 'core', level: 1, met: 3.8, cycle: 2.6, view: 'side', mat: true,
    muscles: ['abs', 'hipFlexors'],
    tips: 'Lying on your back, knees bent at 90° over your hips. Use your abs to curl your hips off the floor toward your ribs, then lower slowly. No swinging.',
    frames: [
      { pitch: -90, hipF: 90, knee: 90, ankle: 10, shF: -9.9, shAbd: 14.2, elbow: 0 },
      { pitch: -110, spineF: 20, hipF: 110, knee: 90, ankle: 10, shF: -9.9, shAbd: 14.2, elbow: 0 },
    ],
  },
  {
    id: 'heel-touches', on: 'back heels toes', name: 'Heel Touches', cat: 'core', level: 1, met: 3.8, cycle: 1.6, view: 'threeq', mat: true,
    muscles: ['obliques', 'abs'],
    tips: 'Lie with knees bent, feet flat and arms long by your sides. Lift your shoulders slightly and bend sideways to tap one hand on the same-side heel, then the other. Keep your lower back on the floor.',
    frames: [
      { ...BACK_KNEES, pitch: -86.8, hipF: 64.6, knee: 131.2, ankle: 19.7, hipAbd: 12, spineF: 35.9, neckF: 10, spineSide: 25, shF_L: 9, shAbd_L: 7.1, shF_R: 9, shAbd_R: 20, touch: [['hand_L', 'heel_L', 0.07]] },
      { ...BACK_KNEES, pitch: -86.8, hipF: 64.6, knee: 131.2, ankle: 19.7, hipAbd: 12, spineF: 35.9, neckF: 10, spineSide: -25, shF_R: 9, shAbd_R: 7.1, shF_L: 9, shAbd_L: 20, touch: [['hand_R', 'heel_R', 0.07]] },
    ],
  },
  {
    id: 'hollow-hold', on: 'back', name: 'Hollow Body Hold', cat: 'core', level: 3, met: 4, view: 'side', mat: true,
    muscles: ['abs', 'hipFlexors', 'quads'],
    tips: 'Lower back pressed into the floor, shoulders and legs lifted, arms reaching past your ears. Too hard? Bend your knees or bring your arms forward.',
    frames: [{ pitch: -90, spineF: 22, neckF: 12, shF: 178, shAbd: 8, elbow: 0, hipF: 18, ankle: 30 }],
  },
  {
    id: 'donkey-kicks', on: 'hands knees', name: 'Donkey Kicks', cat: 'strength', level: 1, met: 3.5, cycle: 2.4, view: 'side', mat: true,
    muscles: ['glutes', 'hamstrings', 'abs'],
    tips: 'On hands and knees, keep one knee bent at 90° and press that foot up toward the ceiling. Small and controlled: do not arch your lower back.',
    frames: [
      TABLETOP,
      { ...TABLETOP, hipF_L: -10, knee_L: 90, ankle_L: 0, on: 'hands knee_R' },
      TABLETOP,
      { ...TABLETOP, hipF_R: -10, knee_R: 90, ankle_R: 0, on: 'hands knee_L' },
    ],
  },
  {
    id: 'fire-hydrants', on: 'hands knees', name: 'Fire Hydrants', cat: 'strength', level: 1, met: 3.5, cycle: 2.4, view: 'back', mat: true,
    muscles: ['glutes', 'abs', 'obliques'],
    tips: 'On hands and knees, keep the knee bent and lift one leg out to the side up to hip height. Keep your back flat and do not lean away.',
    frames: [
      TABLETOP,
      { ...TABLETOP, hipAbd_L: 50, on: 'hands knee_R' },
      TABLETOP,
      { ...TABLETOP, hipAbd_R: 50, on: 'hands knee_L' },
    ],
  },
  {
    id: 'clamshells', on: 'side_R forearm_R knee_R foot_R hand_L', name: 'Clamshells', cat: 'strength', level: 1, met: 2.8, cycle: 2.4, view: 'front', mat: true, sides: true,
    muscles: ['glutes'],
    tips: 'Lie on your side with your head on your lower arm and your top hand on the floor in front of you. Knees bent and stacked, feet together. Keep your feet touching and lift your top knee like a clam opening, then lower slowly. Do not roll back.',
    frames: [
      { roll: 87.4, pitch: 1.2, hipF: 52.4, knee: 90, hipAbd_L: -10.9, hipRot_L: 7.8, ankle_L: -12.2, shAbd_R: 180, elbow_R: 55.9, shF_L: 72.1, shAbd_L: -35.2, elbow_L: 24.2, touch: [['knee_L', 'knee_R', 0.12], ['heel_L', 'heel_R', 0.06], ['toes_L', 'toes_R', 0.1]] },
      { roll: 87.4, pitch: 1.2, hipF: 52.4, knee: 90, hipAbd_L: 20, hipRot_L: 39.2, hipF_L: 42.4, knee_L: 92.3, ankle_L: 6.1, shAbd_R: 180, elbow_R: 55.9, shF_L: 72.1, shAbd_L: -35.2, elbow_L: 24.2, touch: [['heel_L', 'heel_R', 0.06], ['toes_L', 'toes_R', 0.1]] },
    ],
  },
  {
    id: 'good-mornings', on: 'feet', touch: [['hand_L', 'head-back', 0.14], ['hand_R', 'head-back', 0.14]], name: 'Good Mornings', cat: 'strength', level: 1, met: 3.5, cycle: 3, view: 'side',
    muscles: ['hamstrings', 'glutes', 'lowerBack'],
    tips: 'Hands behind your head, knees soft. Push your hips back and tip your chest forward with a flat back until you feel your hamstrings, then stand tall.',
    frames: [
      { shAbd: 120, elbow: 132, shRot: 90, hipAbd: 6, d: 0.8 },
      { shAbd: 120, elbow: 132, shRot: 90, hipAbd: 6, pitch: 70, hipF: 81.9, knee: 15, ankle: -8.3, d: 1.2 },
    ],
  },
  {
    id: 'standing-oblique-crunch', on: 'feet', touch: [['hand_L', 'head-back', 0.14], ['hand_R', 'head-back', 0.14]], name: 'Standing Side Crunch', cat: 'core', level: 1, met: 4, cycle: 2, view: 'front',
    muscles: ['obliques', 'abs', 'hipFlexors'],
    tips: 'Hands behind your head, elbows wide. Lift one knee up and out to the side and crunch down and sideways so the same-side elbow meets the knee. Do not pull on your neck. Stand tall and switch.',
    frames: [
      { shAbd: 120, elbow: 132, shRot: 90, shAbd_L: 107.2, shF_L: 17.8, hipF_L: 82.9, hipAbd_L: 46.1, hipRot_L: 23.3, knee_L: 85.9, spineSide: 35.9, spineF: 40.7, spineTwist: -33.7, roll: 9.6, hipAbd_R: 0.9, on: 'foot_R', touch: [['elbow_L', 'knee_L', 0.1], ['hand_L', 'head-back', 0.14], ['hand_R', 'head-back', 0.14]] },
      { shAbd: 120, elbow: 132, shRot: 90, hipAbd: 0, d: 0.6 },
      { shAbd: 120, elbow: 132, shRot: 90, shAbd_R: 107.2, shF_R: 17.8, hipF_R: 82.9, hipAbd_R: 46.1, hipRot_R: 23.3, knee_R: 85.9, spineSide: -35.9, spineF: 40.7, spineTwist: 33.7, roll: -9.6, hipAbd_L: 0.9, on: 'foot_L', touch: [['elbow_R', 'knee_R', 0.1], ['hand_L', 'head-back', 0.14], ['hand_R', 'head-back', 0.14]] },
      { shAbd: 120, elbow: 132, shRot: 90, hipAbd: 0, d: 0.6 },
    ],
  },
  {
    id: 'plank-to-dog', on: 'hands toes', name: 'Plank to Down Dog', cat: 'core', level: 2, met: 4.5, cycle: 3.2, view: 'side', mat: true,
    muscles: ['shoulders', 'abs', 'hamstrings', 'calves'],
    tips: 'From a high plank, keep your hands and feet where they are, press the floor away and lift your hips up and back into an upside-down V, heels reaching down. Lower back to a straight plank. Bend your knees if your hamstrings are tight.',
    frames: [
      HIGH_PLANK,
      { pitch: 124.8, shF: 173.6, shAbd: 8, wrist: 35.8, hipF: 67, ankle: -16.2, neckF: -10, z: -0.34, on: 'hands feet' },
    ],
  },
  {
    id: 'boxing-punches', on: 'feet', name: 'Shadow Boxing', cat: 'cardio', level: 1, met: 5.5, cycle: 1.2, view: 'threeq',
    muscles: ['shoulders', 'chest', 'triceps', 'obliques'],
    tips: 'Soft knees, fists by your chin. Punch one arm straight out and turn your body with it, pull it back fast, then punch with the other. Keep it light and quick.',
    frames: [
      { hipAbd: 8, knee: 15, hipF: 12, ankle: -5, shF_L: 88, shAbd_L: -8, elbow_L: 5, shRot_L: -60, spineTwist: -20, shF_R: 45, shAbd_R: -20, elbow_R: 135, shRot_R: -20 },
      { hipAbd: 8, knee: 15, hipF: 12, ankle: -5, shF: 45, shAbd: -20, elbow: 135, shRot: -20, d: 0.6 },
      { hipAbd: 8, knee: 15, hipF: 12, ankle: -5, shF_R: 88, shAbd_R: -8, elbow_R: 5, shRot_R: -60, spineTwist: 20, shF_L: 45, shAbd_L: -20, elbow_L: 135, shRot_L: -20 },
      { hipAbd: 8, knee: 15, hipF: 12, ankle: -5, shF: 45, shAbd: -20, elbow: 135, shRot: -20, d: 0.6 },
    ],
  },
  // ---------------- Added: yoga & stretching ----------------
  {
    id: 'sun-salutation-half', on: 'feet', name: 'Half Sun Salutation', cat: 'yoga', level: 1, met: 3, cycle: 16, view: 'side',
    muscles: ['hamstrings', 'shoulders', 'lowerBack', 'back', 'calves'],
    tips: 'Breathe in, arms up. Breathe out, fold forward with soft knees and let your hands reach your shins. Breathe in, lift halfway with a flat back, hands just below your knees. Breathe out, fold. Breathe in, rise up.',
    frames: [
      { shAbd: 10, d: 0.7 },
      { shF: 172, shAbd: 10, elbow: 0, neckF: -10, spineF: -6 },
      { pitch: 80.6, spineF: 45, hipF: 95, knee: 15, ankle: -7.6, shF: 92.6, shAbd: -6.2, elbow: 10, neckF: 10, touch: [['hand_L', 'shin_L', 0.07], ['hand_R', 'shin_R', 0.07]] },
      { pitch: 82, spineF: -5, hipF: 102, knee: 12, ankle: 4, shF: 50, shAbd: -6, elbow: 0, neckF: -20, touch: [['hand_L', 'knee_L', 0.07], ['hand_R', 'knee_R', 0.07]] },
      { pitch: 80.6, spineF: 45, hipF: 95, knee: 15, ankle: -7.6, shF: 92.6, shAbd: -6.2, elbow: 10, neckF: 10, touch: [['hand_L', 'shin_L', 0.07], ['hand_R', 'shin_R', 0.07]] },
      { shF: 172, shAbd: 10, elbow: 0, neckF: -10, spineF: -6 },
    ],
  },
  {
    id: 'low-lunge', on: 'foot_L knee_R', name: 'Low Lunge', cat: 'yoga', level: 1, met: 2.8, view: 'side', mat: true, sides: true,
    muscles: ['hipFlexors', 'quads', 'glutes', 'shoulders'],
    tips: 'Front knee over the ankle, back knee down on the mat. Sink your hips forward and reach your arms up. Pad the knee if needed.',
    frames: [{ pitch: -6.6, hipF_L: 90, knee_L: 95, ankle_L: -10, hipF_R: -20.6, knee_R: 84.3, ankle_R: 50, shF: 170, shAbd: 10, elbow: 0, neckF: -5 }],
  },
  {
    id: 'thread-needle', on: 'knees hand_R forearm_L head', touch: [['hand_R', 'head', 0.32]], name: 'Thread the Needle', cat: 'yoga', level: 1, met: 2.2, view: 'side', mat: true, sides: true,
    muscles: ['back', 'shoulders', 'obliques'],
    tips: 'On hands and knees, slide one arm under your chest and out past your other hand, palm up. Lower that shoulder and the side of your head to the mat. Keep the other hand planted a little forward, hips over knees.',
    frames: [{ ...TABLETOP, pitch: 119.1, hipF: 119.1, spineTwist: -45, roll: 2.3, shF_R: 99.4, shAbd_R: -18, elbow_R: 68, wrist_R: 90, shF_L: 93.7, shAbd_L: -33, elbow_L: 0, wrist_L: 0, neckSide: 28.5, neckTurn: -9.6 }],
  },
  {
    id: 'seated-twist', on: 'seat heels foot_L hand_L', name: 'Seated Spinal Twist', cat: 'yoga', level: 1, met: 2.2, view: 'sidefront', mat: true, sides: true,
    // Left foot flat on the floor just outside the right knee (left hip adducted), right elbow pressed
    // against the outside of the left knee, left hand on the floor behind, chest and head turned left.
    touch: [['elbow_R', 'knee_L', 0.06], ['heel_L', 'knee_R', 0.14]],
    muscles: ['obliques', 'lowerBack', 'back', 'glutes'],
    tips: 'Sit tall, one leg straight. Cross the other foot over it and set it flat outside your straight knee. Press the opposite elbow against the outside of the bent knee, put your other hand on the floor behind you and turn to look over your shoulder.',
    frames: [{ pitch: -15, spineF: 5, spineTwist: 40, neckTurn: 40, hipF_R: 74, knee_R: 0, ankle_R: 0, hipF_L: 128, knee_L: 101, hipAbd_L: -13, hipRot_L: 29, ankle_L: 40, shF_R: 51.5, shAbd_R: -11.5, elbow_R: 72.5, shF_L: -38, shAbd_L: 10, elbow_L: 0, wrist_L: 80 }],
  },
  {
    id: 'butterfly', on: 'seat feet', touch: [['heel_L', 'heel_R', 0.03], ['toes_L', 'toes_R', 0.04], ['hand_L', 'foot-top_L', 0.05], ['hand_R', 'foot-top_R', 0.05]], name: 'Butterfly Stretch', cat: 'stretch', level: 1, met: 2, view: 'front', mat: true,
    muscles: ['adductors', 'hipFlexors', 'lowerBack'],
    tips: 'Sit tall with the soles of your feet pressed together and let your knees fall open. Hold your feet with both hands and lean gently forward, chest lifted.',
    frames: [{ pitch: -8.6, hipF: 112, hipAbd: 50, hipRot: 50, knee: 120, ankle: 21.5, spineF: 22, shF: 50, shAbd: -10.3, elbow: 6.4, neckF: -5 }],
  },
  {
    id: 'knees-to-chest', on: 'back', touch: [['hand_L', 'shin_L', 0.05], ['hand_R', 'shin_R', 0.05]], name: 'Knees to Chest', cat: 'stretch', level: 1, met: 2, view: 'side', mat: true,
    muscles: ['lowerBack', 'glutes'],
    tips: 'Lie on your back and hug both knees in, hands wrapped around your shins just below the knees. Keep your head and shoulders relaxed on the mat.',
    frames: [{ pitch: -95, spineF: 3, neckF: 5, hipF: 128, knee: 140, ankle: 20, shF: 10, shAbd: -9.6, shRot: 2, elbow: 46 }],
  },
  {
    id: 'supine-twist', on: 'back arms foot_L', touch: [['knee_R', 'knee_L', 0.16], ['heel_R', 'heel_L', 0.14]], name: 'Lying Spinal Twist', cat: 'yoga', level: 1, met: 2, view: 'front', mat: true, sides: true,
    muscles: ['obliques', 'lowerBack', 'glutes', 'chest'],
    tips: 'Lie on your back, arms out wide. Let your bent knees drop together to one side, top knee over the bottom knee, and turn your head the other way. Keep your shoulders as close to the mat as you can; a cushion under the knees is fine.',
    // Lying on the back, pelvis rolled about 55° toward the left (pitch -35 + yaw 90 + roll -90 is a roll about
    // the body's long axis) and the chest turned back with spineTwist -45 (the rig's limit), so the right shoulder
    // lifts a few cm. Knees stacked, bottom knee about 12 cm above the mat (as if on a cushion), bottom foot down.
    frames: [{ pitch: -35, yaw: 90, roll: -90, spineTwist: -45, hipF: 95, knee: 95, ankle: 20, hipAbd_L: 24, hipAbd_R: -25, hipRot_L: -18, hipRot_R: 28, shAbd_L: 80, shAbd_R: 42, shF_L: 15, shF_R: -31, elbow: 0, neckTurn: -30 }],
  },
  {
    id: 'puppy-pose', on: 'knees hands head', name: 'Puppy Pose', cat: 'yoga', level: 1, met: 2.2, view: 'side', mat: true,
    muscles: ['shoulders', 'back', 'lowerBack'],
    tips: 'From hands and knees, keep hips over knees and walk your hands forward. Melt your chest down and rest your forehead.',
    frames: [{ pitch: 125.3, spineF: -15.9, hipF: 114, knee: 90, ankle: 59, shF: 175, shAbd: 10, elbow: 0, wrist: 15, neckF: 30 }],
  },
  {
    id: 'sphinx', on: 'forearms hands front knees', name: 'Sphinx Pose', cat: 'yoga', level: 1, met: 2.2, view: 'side', mat: true,
    muscles: ['lowerBack', 'abs', 'chest'],
    tips: 'Lie on your belly, elbows under your shoulders, forearms flat and palms down. Press into your forearms to lift your chest gently and keep your neck long.',
    frames: [{ pitch: 88.6, spineF: -41, neckF: -5, shF: 52, shAbd: 10, elbow: 86, wrist: -14, ankle: 60 }],
  },
  {
    id: 'boat-pose', on: 'seat', name: 'Boat Pose', cat: 'yoga', level: 2, met: 3.5, view: 'side', mat: true,
    muscles: ['abs', 'hipFlexors', 'obliques', 'lowerBack'],
    tips: 'Lean back with a long, straight back and lift your feet so your shins are level with the floor. Reach your arms forward beside your knees. Keep your chest lifted.',
    frames: [{ pitch: -40, hipF: 100, knee: 50, ankle: 20, shF: 50, shAbd: 8, elbow: 0, neckF: 5 }],
  },
  {
    id: 'chest-opener', on: 'feet', touch: [['hand_L', 'hand_R', 0.04]], name: 'Standing Chest Opener', cat: 'stretch', level: 1, met: 2, view: 'side',
    muscles: ['chest', 'shoulders', 'biceps'],
    tips: 'Clasp your hands behind your back, straighten your arms and lift your chest. Shoulders down and back; do not arch your lower back.',
    frames: [{ shF: -45, shAbd: -16, shRot: -20, elbow: 0, spineF: -5, neckF: -8, hipAbd: 5 }],
  },
  {
    id: 'neck-rolls', on: 'feet', name: 'Neck Rolls', cat: 'warmup', level: 1, met: 2, cycle: 8, view: 'threeq',
    muscles: ['neck', 'traps'],
    tips: 'Drop your ear toward one shoulder, roll your chin slowly down across your chest to the other side, and back. Do not roll your head backward.',
    frames: [{ neckSide: 32 }, { neckF: 35 }, { neckSide: -32 }, { neckF: 35 }],
  },
  {
    id: 'wrist-stretch', on: 'feet', touch: [['hand_R', 'hand_L', 0.07]], name: 'Wrist & Forearm Stretch', cat: 'stretch', level: 1, met: 1.8, cycle: 12, view: 'sidefront', sides: true,
    muscles: ['forearms'],
    tips: 'Arm straight out in front of your chest, palm forward and fingers up. Hold the fingers with your other hand and gently pull them back, then turn the hand down and press on the back of it.',
    frames: [
      { shF_L: 90, shAbd_L: -25, elbow_L: 0, wrist_L: 70, shF_R: 100, shAbd_R: -20, elbow_R: 0, hipAbd: 5 },
      { shF_L: 90, shAbd_L: -25, elbow_L: 0, wrist_L: 70, shF_R: 100, shAbd_R: -20, elbow_R: 0, hipAbd: 5 },
      { shF_L: 90, shAbd_L: -25, elbow_L: 0, wrist_L: -70, shF_R: 85, shAbd_R: -20, elbow_R: 0, hipAbd: 5 },
      { shF_L: 90, shAbd_L: -25, elbow_L: 0, wrist_L: -70, shF_R: 85, shAbd_R: -20, elbow_R: 0, hipAbd: 5 },
    ],
  },
  {
    id: 'hamstring-stretch', on: 'feet', name: 'Standing Hamstring Stretch', cat: 'stretch', level: 1, met: 2, view: 'sidefront', sides: true,
    muscles: ['hamstrings', 'calves', 'lowerBack'],
    tips: 'Step one heel forward, toes up and that leg straight. Bend your back knee, hands on your hips, and hinge forward from the hips with a flat back until you feel the back of the front thigh.',
    frames: [{ ...HANDS_ON_HIPS, pitch: 44, hipF_L: 68, knee_L: 0, ankle_L: -25, hipF_R: 70.4, knee_R: 40.3, ankle_R: -16.2, neckF: -10 }],
  },
];

export const CATEGORIES = {
  warmup: 'Warm-up', cardio: 'Cardio', strength: 'Strength', core: 'Core', yoga: 'Yoga', stretch: 'Stretch',
};

export const LEVELS = { 1: 'Beginner', 2: 'Intermediate', 3: 'Advanced' };

export const byId = (id) => EXERCISES.find((e) => e.id === id);
