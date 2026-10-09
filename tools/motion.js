// Movement vocabulary used by exercises.js and checked by check-poses.mjs.
//
// Joint angles follow the clinical convention (ISB / AAOS range-of-motion charts):
// every joint starts at 0° in the anatomical standing position, and each key names one
// anatomical motion. Positive and negative directions:
//
//   spineF      + flexion (bend forward)         − extension (arch back)
//   spineSide   + lateral flexion to the LEFT    − to the right
//   spineTwist  + rotation to the LEFT           − to the right
//   neckF / neckSide / neckTurn                  same as the spine
//   shF         + flexion (arm forward/up)       − extension (arm back)
//   shAbd       + abduction (arm out to side)    − adduction (across the body)
//   shRot       + external rotation              − internal rotation
//   elbow       + flexion
//   wrist       + extension (back of hand up)    − flexion
//   hipF        + flexion (knee up/forward)      − extension (leg back)
//   hipAbd      + abduction (leg out)            − adduction (across)
//   hipRot      + external rotation (toes out)   − internal rotation
//   knee        + flexion
//   ankle       + plantarflexion (point toes)    − dorsiflexion (toes up)
//
// Whole-body orientation (not joints): pitch (+ lean forward, 90 = face down, −90 = face up),
// yaw (turn), roll (+ tip to the right side). `lift` raises the body off the floor in metres (jumps).

/** Normal active range of motion in degrees [min, max] (AAOS / clinical norms, slightly widened
 *  for yoga). Values outside this range are physically unrealistic for most people. */
export const ROM = {
  spineF: [-60, 90],   // extension up to 60° covers yoga backbends such as cobra
  spineSide: [-40, 40],
  spineTwist: [-45, 45],
  neckF: [-60, 50],
  neckSide: [-45, 45],
  neckTurn: [-80, 80],
  shF: [-60, 180],
  shAbd: [-45, 180],
  shRot: [-80, 90],
  elbow: [0, 150],
  wrist: [-80, 90],
  hipF: [-30, 130],
  hipAbd: [-30, 50],
  hipRot: [-40, 60],
  knee: [0, 155],
  ankle: [-40, 60],   // dorsiflexion reaches ~40° when standing in a deep squat or lunge
};

/** Words an exercise can use in `on` to say which body parts rest on the floor.
 *  all: every group must touch; any: at least one point must touch. */
const foot = (s) => [`heel_${s}`, `toes_${s}`, `foot-top_${s}`];
const shin = (s) => [`knee_${s}`, `shin_${s}`, `foot-top_${s}`, `toes_${s}`];
const arm = (s) => [`hand_${s}`, `forearm_${s}`, `elbow_${s}`];
export const SUPPORT_TERMS = {
  feet: { all: [foot('L'), foot('R')] },
  foot_L: { any: foot('L') },
  foot_R: { any: foot('R') },
  toes: { all: [[`toes_L`, `foot-top_L`], [`toes_R`, `foot-top_R`]] },
  heels: { all: [[`heel_L`, `calf_L`], [`heel_R`, `calf_R`]] },
  hands: { all: [[`hand_L`], [`hand_R`]] },
  hand_L: { any: [`hand_L`] },
  hand_R: { any: [`hand_R`] },
  knees: { all: [shin('L'), shin('R')] },
  knee_L: { any: shin('L') },
  knee_R: { any: shin('R') },
  forearms: { all: [[`forearm_L`, `elbow_L`, `hand_L`], [`forearm_R`, `elbow_R`, `hand_R`]] },
  forearm_L: { any: [`forearm_L`, `elbow_L`, `hand_L`] },
  forearm_R: { any: [`forearm_R`, `elbow_R`, `hand_R`] },
  arms: { all: [arm('L'), arm('R')] },
  back: { any: ['back', 'seat', 'sit-bones', 'head-back', 'shoulder_L', 'shoulder_R'] },
  front: { any: ['chest', 'belly', 'hips-front', 'face', 'chin'] },
  seat: { any: ['seat', 'sit-bones', 'hips-front'] },
  head: { any: ['face', 'chin', 'head'] },
  side_R: { any: ['shoulder_R', 'seat'] },
};
