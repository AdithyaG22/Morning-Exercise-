// Exercise library. Each exercise is a loop of keyframe poses (joint angles in degrees).
// Pose keys: pitch/yaw/roll (whole body), lift (jump height m), spineF/spineSide/spineTwist,
// neckF/neckSide/neckTurn, and per-limb shF, shAbd, shRot, elbow, wrist, hipF, hipAbd,
// hipRot, knee, ankle. A limb key without _L/_R applies to both sides.
//
// level: 1 beginner, 2 intermediate, 3 advanced
// cat: warmup | cardio | strength | core | yoga | stretch
// sides: hold one side for the first half, mirror for the second half
// met: metabolic equivalent, used for the calorie estimate

// ---- Reusable poses ----
const STAND = {};
const HANDS_ON_HIPS = { shAbd: 35, elbow: 100, shRot: -75 };

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
const SQUAT_HANDS_DOWN = { pitch: 26, spineF: 53, hipF: 128, knee: 154, ankle: -40, shF: 54, shAbd: 10, wrist: 80, hipAbd: 8 };

export const EXERCISES = [
  // ---------------- Warm-up ----------------
  {
    id: 'march', on: 'feet', name: 'March in Place', cat: 'warmup', level: 1, met: 3.5, cycle: 1.5, view: 'threeq',
    muscles: ['hipFlexors', 'quads', 'calves'],
    tips: 'Lift your knees to hip height and swing your arms naturally. Stand tall.',
    frames: [
      { hipF_L: 70, knee_L: 80, ankle_L: 15, shF_R: 40, shF_L: -25, elbow: 80, roll: 4, hipAbd_R: 0, on: 'foot_R' },
      { elbow: 80 },
      { hipF_R: 70, knee_R: 80, ankle_R: 15, shF_L: 40, shF_R: -25, elbow: 80, roll: -4, hipAbd_L: 0, on: 'foot_L' },
      { elbow: 80 },
    ],
  },
  {
    id: 'arm-circles', on: 'feet', name: 'Arm Circles', cat: 'warmup', level: 1, met: 3, cycle: 1.4, view: 'front',
    muscles: ['shoulders', 'traps', 'back'],
    tips: 'Arms straight out to the sides. Make small, controlled circles.',
    frames: [
      { shAbd: 104, shF: 0, elbow: 0 },
      { shAbd: 90, shF: 14, elbow: 0 },
      { shAbd: 76, shF: 0, elbow: 0 },
      { shAbd: 90, shF: -14, elbow: 0 },
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
    tips: 'Hands on hips, feet shoulder-width. Draw big slow circles with your hips.',
    frames: [
      { ...HANDS_ON_HIPS, hipAbd: 10, x: 0.06, spineSide: 8 },
      { ...HANDS_ON_HIPS, hipAbd: 10, z: 0.05, pitch: -5, spineF: 10 },
      { ...HANDS_ON_HIPS, hipAbd: 10, x: -0.06, spineSide: -8 },
      { ...HANDS_ON_HIPS, hipAbd: 10, z: -0.05, pitch: 6, spineF: -6 },
    ],
  },
  {
    id: 'torso-twist', on: 'feet', name: 'Torso Twists', cat: 'warmup', level: 1, met: 3, cycle: 2, view: 'front',
    muscles: ['obliques', 'abs', 'lowerBack'],
    tips: 'Keep hips facing forward and rotate from your waist. Arms loose at chest height.',
    frames: [
      { spineTwist: 45, neckTurn: 15, shAbd: 75, elbow: 115, shRot: -35, hipAbd: 9 },
      { spineTwist: -45, neckTurn: -15, shAbd: 75, elbow: 115, shRot: -35, hipAbd: 9 },
    ],
  },
  {
    id: 'side-bend', on: 'feet', name: 'Standing Side Bends', cat: 'warmup', level: 1, met: 2.5, cycle: 3.5, view: 'front',
    muscles: ['obliques', 'back'],
    tips: 'Reach one arm overhead and lean to the opposite side. Do not lean forward.',
    frames: [
      { spineSide: 32, shAbd_R: 165, elbow_R: 15, shAbd_L: 15, hipAbd: 9 },
      { hipAbd: 9 },
      { spineSide: -32, shAbd_L: 165, elbow_L: 15, shAbd_R: 15, hipAbd: 9 },
      { hipAbd: 9 },
    ],
  },
  {
    id: 'tadasana-reach', on: 'feet', name: 'Mountain Reach', cat: 'warmup', level: 1, met: 2.3, cycle: 6, view: 'threeq',
    muscles: ['shoulders', 'back', 'calves', 'abs'],
    tips: 'Breathe in as you reach up and rise onto your toes. Breathe out as you lower.',
    frames: [{ d: 0.8 }, { shAbd: 172, elbow: 0, ankle: 25, neckF: -10, pitch: 4, hipF: -3, on: 'toes' }],
  },

  // ---------------- Cardio ----------------
  {
    id: 'jumping-jacks', on: 'feet', name: 'Jumping Jacks', cat: 'cardio', level: 1, met: 8, cycle: 1.1, view: 'front',
    muscles: ['calves', 'shoulders', 'glutes', 'adductors'],
    tips: 'Land softly on the balls of your feet. Low impact option: step one leg out at a time.',
    frames: [
      { shAbd: 12, hipAbd: 3 },
      { shAbd: 90, hipAbd: 10, lift: 0.07, ankle: 30, d: 0.6 },
      { shAbd: 172, hipAbd: 17, elbow: 5 },
      { shAbd: 90, hipAbd: 10, lift: 0.07, ankle: 30, d: 0.6 },
    ],
  },
  {
    id: 'high-knees', on: 'feet', name: 'High Knees', cat: 'cardio', level: 2, met: 8, cycle: 0.75, view: 'threeq',
    muscles: ['hipFlexors', 'quads', 'calves', 'abs'],
    tips: 'Drive your knees up to hip height quickly. Stay on the balls of your feet.',
    frames: [
      { hipF_L: 95, knee_L: 95, ankle_L: 20, shF_R: 55, shF_L: -30, elbow: 85, lift: 0.04, ankle_R: 20 },
      { hipF_R: 95, knee_R: 95, ankle_R: 20, shF_L: 55, shF_R: -30, elbow: 85, lift: 0.04, ankle_L: 20 },
    ],
  },
  {
    id: 'butt-kicks', on: 'feet', name: 'Butt Kicks', cat: 'cardio', level: 1, met: 7, cycle: 0.8, view: 'side',
    muscles: ['hamstrings', 'calves', 'quads'],
    tips: 'Jog in place and kick your heels toward your glutes.',
    frames: [
      { knee_L: 130, hipF_L: -5, ankle_L: 20, shF_R: 35, shF_L: -25, elbow: 85, lift: 0.03, ankle_R: 15 },
      { knee_R: 130, hipF_R: -5, ankle_R: 20, shF_L: 35, shF_R: -25, elbow: 85, lift: 0.03, ankle_L: 15 },
    ],
  },
  {
    id: 'knee-elbow', on: 'feet', name: 'Standing Knee to Elbow', cat: 'cardio', level: 1, met: 5, cycle: 1.8, view: 'front',
    muscles: ['obliques', 'abs', 'hipFlexors'],
    tips: 'Hands behind your head. Bring your knee up to meet the opposite elbow.',
    frames: [
      { hipF_L: 90, knee_L: 90, spineTwist: 30, spineF: 20, spineSide: -10, shAbd: 120, elbow: 150, shRot: -20, roll: 4, hipAbd_R: 1, on: 'foot_R' },
      { shAbd: 120, elbow: 150, shRot: -20, hipAbd: 8 },
      { hipF_R: 90, knee_R: 90, spineTwist: -30, spineF: 20, spineSide: 10, shAbd: 120, elbow: 150, shRot: -20, roll: -4, hipAbd_L: 1, on: 'foot_L' },
      { shAbd: 120, elbow: 150, shRot: -20, hipAbd: 8 },
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
      { ...SQUAT_LOW, shF: 20, shRot: 0, d: 1.2 },
      { shAbd: 20, shF: 160, ankle: 35, lift: 0.2, d: 0.7 },
      { lift: 0.05, shF: 60, ankle: 15, d: 0.5 },
    ],
  },
  {
    id: 'burpees', on: 'feet', name: 'Burpees', cat: 'cardio', level: 3, met: 10, cycle: 3.4, view: 'side', mat: true,
    muscles: ['quads', 'chest', 'shoulders', 'abs', 'glutes'],
    tips: 'Squat, hands down, jump back to plank, jump feet in, then jump up. Move with control.',
    frames: [
      { d: 0.6 },
      { ...SQUAT_HANDS_DOWN, d: 0.7, on: 'feet hands' },
      { ...HIGH_PLANK, d: 0.9, on: 'hands toes' },
      { ...SQUAT_HANDS_DOWN, d: 0.6, on: 'feet hands' },
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
    frames: [{ shF: 15, hipAbd: 8, d: 0.8 }, { ...SQUAT_LOW, d: 1.2 }],
  },
  {
    id: 'lunges', on: 'feet', name: 'Alternating Lunges', cat: 'strength', level: 2, met: 5.5, cycle: 4, view: 'side',
    muscles: ['quads', 'glutes', 'hamstrings', 'calves'],
    tips: 'Step forward, lower until both knees are about 90°. Front knee stays over the ankle.',
    frames: [
      { ...HANDS_ON_HIPS, d: 0.6 },
      { ...HANDS_ON_HIPS, hipF_L: 82, knee_L: 84, ankle_L: -6, hipF_R: -9, knee_R: 87, ankle_R: -37 },
      { ...HANDS_ON_HIPS, d: 0.6 },
      { ...HANDS_ON_HIPS, hipF_R: 82, knee_R: 84, ankle_R: -6, hipF_L: -9, knee_L: 87, ankle_L: -37 },
    ],
  },
  {
    id: 'calf-raises', on: 'feet', name: 'Calf Raises', cat: 'strength', level: 1, met: 3, cycle: 1.8, view: 'side',
    muscles: ['calves'],
    tips: 'Rise slowly onto your toes, pause at the top, lower with control.',
    frames: [{ ...HANDS_ON_HIPS }, { ...HANDS_ON_HIPS, ankle: 38, pitch: 2, hipF: -2, on: 'toes' }],
  },
  {
    id: 'knee-pushups', on: 'hands knees', name: 'Knee Push-ups', cat: 'strength', level: 1, met: 4, cycle: 2.4, view: 'side', mat: true,
    muscles: ['chest', 'triceps', 'shoulders'],
    tips: 'Knees down, body straight from knees to head. Lower your chest toward the floor.',
    frames: [KNEE_PLANK, KNEE_PUSH_DOWN],
  },
  {
    id: 'pushups', on: 'hands toes', name: 'Push-ups', cat: 'strength', level: 2, met: 6, cycle: 2.2, view: 'side', mat: true,
    muscles: ['chest', 'triceps', 'shoulders', 'abs'],
    tips: 'Hands under shoulders, body in one straight line. Lower until chest is near the floor.',
    frames: [HIGH_PLANK, PUSHUP_DOWN],
  },
  {
    id: 'glute-bridge', on: 'back feet arms', name: 'Glute Bridge', cat: 'strength', level: 1, met: 3.5, cycle: 2.6, view: 'side', mat: true,
    muscles: ['glutes', 'hamstrings', 'lowerBack'],
    tips: 'Feet flat, push through your heels and squeeze your glutes at the top.',
    frames: [
      BACK_KNEES,
      { pitch: -118, hipF: -16, knee: 96, ankle: 20, shF: -45, shAbd: 12, elbow: 0 },
    ],
  },
  {
    id: 'superman', on: 'front arms knees', name: 'Superman', cat: 'strength', level: 1, met: 3.5, cycle: 3, view: 'side', mat: true,
    muscles: ['lowerBack', 'glutes', 'back', 'hamstrings'],
    tips: 'Lying face down, lift your arms, chest and legs a few centimetres. Look at the floor.',
    frames: [PRONE, { ...PRONE, spineF: -25, neckF: -5, shF: 175, hipF: -14, ankle: 60, on: 'front' }],
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
    tips: 'Lift your shoulders off the floor using your abs. Do not pull on your neck.',
    frames: [
      { ...BACK_KNEES, shF: 40 },
      { ...BACK_KNEES, spineF: 45, neckF: 15, shF: 55 },
    ],
  },
  {
    id: 'dead-bug', on: 'back', name: 'Dead Bug', cat: 'core', level: 1, met: 3, cycle: 4, view: 'side', mat: true,
    muscles: ['abs', 'hipFlexors'],
    tips: 'Press your lower back into the floor. Extend opposite arm and leg slowly.',
    frames: [
      { pitch: -90, shF: 90, elbow: 0, hipF: 90, knee: 90, ankle: 0 },
      { pitch: -90, shF_L: 90, shF_R: 175, elbow: 0, hipF_R: 90, knee_R: 90, hipF_L: 25, knee_L: 5, ankle: 0 },
      { pitch: -90, shF: 90, elbow: 0, hipF: 90, knee: 90, ankle: 0 },
      { pitch: -90, shF_R: 90, shF_L: 175, elbow: 0, hipF_L: 90, knee_L: 90, hipF_R: 25, knee_R: 5, ankle: 0 },
    ],
  },
  {
    id: 'leg-raises', on: 'back', name: 'Leg Raises', cat: 'core', level: 2, met: 4, cycle: 3, view: 'side', mat: true,
    muscles: ['abs', 'hipFlexors'],
    tips: 'Legs straight, lift them to 90°, lower slowly without touching the floor.',
    frames: [{ ...BACK_FLAT, hipF: 8 }, { ...BACK_FLAT, hipF: 85 }],
  },
  {
    id: 'flutter-kicks', on: 'back', name: 'Flutter Kicks', cat: 'core', level: 2, met: 4, cycle: 0.8, view: 'side', mat: true,
    muscles: ['abs', 'hipFlexors', 'quads'],
    tips: 'Legs straight and low, kick up and down in small quick movements.',
    frames: [
      { ...BACK_FLAT, hipF_L: 35, hipF_R: 15, neckF: 15 },
      { ...BACK_FLAT, hipF_L: 15, hipF_R: 35, neckF: 15 },
    ],
  },
  {
    id: 'bicycle', on: 'back', name: 'Bicycle Crunches', cat: 'core', level: 2, met: 5, cycle: 1.8, view: 'threeq', mat: true,
    muscles: ['abs', 'obliques', 'hipFlexors'],
    tips: 'Bring elbow toward the opposite knee while extending the other leg. Slow and controlled.',
    frames: [
      { pitch: -90, spineF: 35, spineTwist: 30, neckF: 10, shAbd: 120, elbow: 150, shRot: -30, hipF_L: 90, knee_L: 95, hipF_R: 25, knee_R: 5, ankle: 10 },
      { pitch: -90, spineF: 35, spineTwist: -30, neckF: 10, shAbd: 120, elbow: 150, shRot: -30, hipF_R: 90, knee_R: 95, hipF_L: 25, knee_L: 5, ankle: 10 },
    ],
  },
  {
    id: 'side-plank', on: 'forearm_R foot_R', name: 'Side Plank', cat: 'core', level: 2, met: 4, view: 'front', mat: true, sides: true,
    muscles: ['obliques', 'shoulders', 'abs', 'glutes'],
    tips: 'Elbow under shoulder, lift your hips so your body forms a straight line.',
    frames: [{ roll: 72, shAbd_R: 72, elbow_R: 90, shRot_R: 90, shAbd_L: 100, elbow_L: 0, hipAbd: 0, neckSide: 20 }],
  },

  // ---------------- Yoga ----------------
  {
    id: 'cat-cow', on: 'hands knees', name: 'Cat-Cow', cat: 'yoga', level: 1, met: 2.5, cycle: 6, view: 'side', mat: true,
    muscles: ['lowerBack', 'abs', 'back', 'neck'],
    tips: 'Inhale: drop belly, lift head (cow). Exhale: round your back, tuck chin (cat).',
    frames: [
      { ...TABLETOP, spineF: -3, neckF: -25, shF: 59, hipF: 87 },
      { ...TABLETOP, spineF: 21, neckF: 30, shF: 118, hipF: 97 },
    ],
  },
  {
    id: 'downward-dog', on: 'hands feet', name: 'Downward Dog', cat: 'yoga', level: 1, met: 2.8, view: 'side', mat: true,
    muscles: ['hamstrings', 'calves', 'shoulders', 'back'],
    tips: 'Hips high, press the floor away, heels toward the floor. Bend knees slightly if needed.',
    frames: [{ pitch: 132, shF: 174, shAbd: 8, wrist: 50, hipF: 89, ankle: -35, neckF: -10 }],
  },
  {
    id: 'cobra', on: 'hands forearms front knees', name: 'Cobra Pose', cat: 'yoga', level: 1, met: 2.5, view: 'side', mat: true,
    muscles: ['lowerBack', 'chest', 'abs'],
    tips: 'Low cobra: hands under shoulders, elbows bent and close to your sides. Lift your chest using your back, not your arms.',
    frames: [{ pitch: 89, spineF: -58, neckF: -12, shF: 45, shAbd: 10, elbow: 44, wrist: 86, ankle: 60 }],
  },
  {
    id: 'childs-pose', on: 'knees head arms', name: "Child's Pose", cat: 'yoga', level: 1, met: 2, view: 'side', mat: true,
    muscles: ['lowerBack', 'back', 'glutes'],
    tips: 'Sit back on your heels, stretch your arms forward and relax your forehead down.',
    frames: [{ pitch: 73, spineF: 39, hipF: 130, knee: 155, ankle: 31, shF: 180, shAbd: 10, elbow: 0, neckF: 30 }],
  },
  {
    id: 'tree', on: 'foot_R', name: 'Tree Pose', cat: 'yoga', level: 1, met: 2.3, view: 'front', sides: true,
    muscles: ['calves', 'glutes', 'abs', 'adductors'],
    tips: 'Foot on your inner calf or thigh (never on the knee). Fix your eyes on one point.',
    frames: [{ hipF_L: 40, hipAbd_L: 50, hipRot_L: 55, knee_L: 135, ankle_L: 20, shAbd: 168, elbow: 15, hipAbd_R: -2.5, roll: 3 }],
  },
  {
    id: 'warrior2', on: 'feet', name: 'Warrior II', cat: 'yoga', level: 1, met: 3, view: 'front', mat: true, sides: true,
    muscles: ['quads', 'glutes', 'shoulders', 'adductors'],
    tips: 'Front knee over ankle, arms long and level, gaze over your front hand.',
    frames: [{ yaw: 30, spineTwist: -30, hipRot_L: 60, hipAbd_L: 44, hipF_L: 20, knee_L: 72, hipAbd_R: 31, hipRot_R: -10, shAbd: 90, elbow: 0, neckTurn: 60 }],
  },
  {
    id: 'triangle', on: 'feet', touch: [['hand_L', 'shin_L', 0.1]], name: 'Triangle Pose', cat: 'yoga', level: 2, met: 2.5, view: 'front', mat: true, sides: true,
    muscles: ['obliques', 'hamstrings', 'adductors', 'shoulders'],
    tips: 'Legs straight and wide. Reach forward, then tip down toward your front shin.',
    frames: [{ hipRot_L: 60, hipAbd_L: 50, hipAbd_R: 8.4, hipF: 3.8, roll: -15.9, spineSide: 40, shAbd: 92, shAbd_L: 62.6, elbow: 0, neckTurn: 50 }],
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
    tips: 'Lift your hips, roll your shoulders under and breathe deeply.',
    frames: [{ pitch: -122, hipF: -22, knee: 105, ankle: 26, shF: -51, shAbd: 10, elbow: 0 }],
  },

  // ---------------- Stretch / cool-down ----------------
  {
    id: 'forward-fold', on: 'feet', name: 'Standing Forward Fold', cat: 'stretch', level: 1, met: 2.3, view: 'side',
    muscles: ['hamstrings', 'lowerBack', 'calves'],
    tips: 'Hinge at your hips and let your upper body hang. Bend your knees if your back rounds a lot.',
    frames: [{ pitch: 75, spineF: 35, hipF: 81, knee: 5, ankle: -5, shF: 105, shAbd: 5, elbow: 10, neckF: 10 }],
  },
  {
    id: 'seated-fold', on: 'seat heels', name: 'Seated Forward Bend', cat: 'stretch', level: 1, met: 2.3, view: 'side', mat: true,
    muscles: ['hamstrings', 'lowerBack', 'calves'],
    tips: 'Sit tall, legs straight, reach forward from your hips toward your feet.',
    frames: [{ pitch: 40, spineF: 35, hipF: 130, ankle: 0, shF: 150, shAbd: 8, elbow: 5, neckF: 5 }],
  },
  {
    id: 'quad-stretch', on: 'foot_R', touch: [['hand_L', 'foot-top_L', 0.06]], name: 'Standing Quad Stretch', cat: 'stretch', level: 1, met: 2.3, view: 'side', sides: true,
    muscles: ['quads', 'hipFlexors'],
    tips: 'Hold your foot behind you, knees together, hips pushed slightly forward.',
    frames: [{ knee_L: 155, hipF_L: -7, ankle_L: 30, shF_L: -42.7, shAbd_L: -6, elbow_L: 31.6, shF_R: 70, elbow_R: 5, roll: 6.2 }],
  },
  {
    id: 'shoulder-stretch', on: 'feet', name: 'Cross-body Shoulder Stretch', cat: 'stretch', level: 1, met: 2, view: 'front', sides: true,
    muscles: ['shoulders', 'back', 'triceps'],
    tips: 'Pull one straight arm across your chest with the other arm. Keep the shoulder down.',
    frames: [{ shF_L: 88, shAbd_L: -45, elbow_L: 0, shF_R: 70, shAbd_R: -15, elbow_R: 110, shRot_R: 20, hipAbd: 6 }],
  },
  {
    id: 'deep-breath', on: 'feet', name: 'Deep Breathing', cat: 'stretch', level: 1, met: 1.8, cycle: 8, view: 'front',
    muscles: ['chest', 'back', 'shoulders'],
    tips: 'Inhale slowly as your arms rise, exhale as they lower. Relax your whole body.',
    frames: [{ shAbd: 10, hipAbd: 6 }, { shAbd: 170, elbow: 5, hipAbd: 6, neckF: -8 }],
  },
];

export const CATEGORIES = {
  warmup: 'Warm-up', cardio: 'Cardio', strength: 'Strength', core: 'Core', yoga: 'Yoga', stretch: 'Stretch',
};

export const LEVELS = { 1: 'Beginner', 2: 'Intermediate', 3: 'Advanced' };

export const byId = (id) => EXERCISES.find((e) => e.id === id);
