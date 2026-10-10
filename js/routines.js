// Ready-made routines: fixed exercise lists grouped into circuits, with a breathing break between circuits.
// Every id must exist in exercises.js (the pose checker and plan builder look them up).

export const ROUTINES = [
  {
    id: 'beginner-full-body',
    name: 'Beginner Full Body',
    level: 1,
    work: 20,
    rest: 10,
    circuitRest: 30,
    description: 'A full-body routine for men and women: 4 circuits of about 4 minutes, warm-up to core.',
    note: 'No dumbbells? Use two water bottles, or do the moves with empty hands.',
    circuits: [
      { name: 'Warm-up', ids: ['arm-swings', 'torso-twist', 'side-leg-raise', 'knee-elbow', 'twisters', 'butt-kicks', 'cross-toe-touch', 'jumping-jacks'] },
      { name: 'Push-ups & squats', ids: ['pushups', 'squats', 'squat-jumps', 'diamond-pushups', 'squat-jumps', 'pushups', 'squat-hold', 'diamond-pushups'] },
      { name: 'Dumbbells', ids: ['db-rows', 'shoulder-press', 'front-raises', 'lateral-raises', 'bicep-curls', 'tricep-kickbacks', 'calf-raises'] },
      { name: 'Core', ids: ['knee-touch', 'russian-twists', 'bicycle', 'plank-knee-elbow', 'knee-touch', 'russian-twists', 'bicycle', 'plank-knee-elbow'] },
    ],
  },
];
