// The starting workout program. Everything here can be changed later inside the app.
// rest = rest time in seconds, inc = suggested weight step in kg (0 = "add a little").

function defaultProgram() {
  const W = (name, detail) => ({ name, detail: detail || '' });
  const M = (name, sets, reps, rpe, rest, inc, tag) => ({ name, sets, reps, rpe, rest, inc: inc || 0, tag: tag || '' });
  const C = (name, detail, sets) => ({ name, detail, core: true, sets: sets || 3 });
  const S = (name, detail) => ({ name, detail, core: false });
  const breathing = S('Slow nasal breathing', '1 min');

  const program = {
    1: {
      name: 'Lower Body (Legs)',
      warmNote: '5 to 8 min', coolNote: '8 to 10 min',
      warm: [
        W('Easy bike or incline walk', '5 min'),
        W('Bodyweight Squat', 'x 15'),
        W('Walking Lunge, bodyweight', 'x 10/leg'),
        W('Ankle Rocks', 'x 10/side'),
        W('Barbell ramp-up', 'bar x 10, 40% x 5, 60% x 3, 75% x 2, 85% x 1')
      ],
      main: [
        M('Back Squat', 4, '5', '7-9', 180, 5),
        M('Front Squat', 3, '6', '7', 120),
        M('Dumbbell Walking Lunge', 3, '10/leg', '7', 90),
        M('Nordic Hamstring Curl', 3, '6-8', '7', 60),
        M('Standing Calf Raise (dumbbells, off a step)', 3, '15', '8', 45)
      ],
      cool: [
        C('Plank', '3 x 45 sec'),
        C('Dead Bug', '3 x 10/side'),
        S('Standing Quad Stretch', '30 sec/side'),
        S('Seated Hamstring Stretch', '30 sec/side'),
        S('Calf Stretch on a wall', '30 sec/side'),
        S("Child's Pose", '45 sec'),
        breathing
      ]
    },
    2: {
      name: 'Upper Body (Push and Pull)',
      warmNote: '5 to 8 min', coolNote: '8 to 10 min',
      warm: [
        W('Bike or row', '5 min'),
        W('Band Pull-Apart', 'x 15 (arm circles if no band)'),
        W('Scapular Push-up', 'x 10'),
        W('Shoulder Dislocates with band or broomstick', 'x 10'),
        W('Barbell ramp-up', 'bar x 10, 50% x 5, 70% x 3, 85% x 1')
      ],
      main: [
        M('Bench Press', 4, '5', '7-9', 180, 2.5, 'Push'),
        M('Barbell Row', 4, '6', '7', 120, 2.5, 'Pull'),
        M('Incline Dumbbell Press', 3, '8', '7', 90, 0, 'Push'),
        M('Pull-up or Lat Pulldown', 3, '8-10', '8', 90, 0, 'Pull'),
        M('Seated DB Shoulder Press', 3, '10', '7', 90, 0, 'Push'),
        M('Face Pull', 3, '15', '8', 45, 0, 'Pull'),
        M('Triceps Pushdown', 3, '12', '8', 60, 0, 'Push'),
        M('Barbell or DB Curl', 3, '12', '8', 45, 0, 'Pull')
      ],
      cool: [
        C('Hanging or Lying Leg Raise', '3 x 12'),
        C('Pallof Press', '3 x 10/side'),
        S('Doorway Chest Stretch', '30 sec/side'),
        S('Cross-body Shoulder Stretch', '20 sec/side'),
        S('Overhead Triceps Stretch', '20 sec/side'),
        S("Child's Pose reaching forward", '45 sec'),
        breathing
      ]
    },
    3: { name: 'Rest', rest: true, note: 'Rest day. Recover, walk, and drink your water.' },
    4: {
      name: 'Full Body',
      warmNote: '5 to 8 min', coolNote: '8 to 10 min',
      warm: [
        W('Row or jump rope', '5 min'),
        W("World's Greatest Stretch", 'x 5/side'),
        W('Arm Circles', 'x 10 each direction'),
        W('Bodyweight Squat-to-Overhead-Reach', 'x 10'),
        W('Ramp-up sets into first working weight', '')
      ],
      main: [
        M('Trap Bar or Conventional Deadlift', 3, '6', '7-9', 180, 5),
        M('Overhead Press', 3, '6', '7', 120, 2.5),
        M('Chin-up or Lat Pulldown', 3, '8', '7', 90),
        M('Goblet Squat', 3, '10', '7', 90),
        M("Farmer's Carry", 3, '30-40 m', '8', 60)
      ],
      cool: [
        C('Weighted Plank', '3 x 45 sec'),
        S('Downward Dog to Cobra flow', 'x 5'),
        S('Standing Forward Fold', '30-45 sec'),
        S('Cross-body Shoulder Stretch', '20 sec/side'),
        S("Child's Pose", '45 sec'),
        breathing
      ]
    },
    5: {
      name: 'Glutes, Core and Cardio',
      warmNote: '5 to 8 min', coolNote: '8 to 10 min',
      cardio: true, cardioNote: '15-20 min (incline walk, bike or rower)',
      warm: [
        W('Incline walk or bike', '5 min'),
        W('Glute Bridge', 'x 15'),
        W('Bodyweight Lateral Lunge', 'x 10/side (banded lateral walk if I have a band)'),
        W('Fire Hydrant', 'x 10/side'),
        W('Bodyweight Hip Thrust', 'x 10, then a light loaded ramp-up')
      ],
      main: [
        M('Barbell Hip Thrust', 4, '8', '7-9', 150, 5),
        M('Romanian Deadlift', 3, '8', '7', 120),
        M('Bulgarian Split Squat', 3, '10/leg', '7', 90),
        M('Single-Leg Romanian Deadlift', 3, '10/leg', '8', 60),
        M('Cable or Band Pull-Through', 3, '12', '8', 60)
      ],
      cool: [
        C('Side Plank', '3 x 30 sec/side'),
        C('Bird Dog', '3 x 8/side'),
        S('Pigeon Pose', '30-45 sec/side'),
        S('Lying Figure-4 Stretch', '30 sec/side'),
        S('Seated Glute Stretch', '30 sec/side'),
        S("Child's Pose", '45 sec'),
        breathing
      ]
    },
    6: { name: 'Rest', rest: true, note: 'Rest day, plus grocery shopping and meal prep for next week.' },
    0: { name: 'Rest', rest: true, note: 'Rest day. Recover and get ready for Monday.' }
  };

  // Give every exercise a permanent id so its history can be tracked.
  for (const d in program) {
    for (const sec of ['warm', 'main', 'cool']) {
      (program[d][sec] || []).forEach((x, i) => {
        program[d][sec][i] = Object.assign({ id: 'd' + d + sec[0] + i }, x);
      });
    }
  }
  return program;
}

// Demo pictures and muscles for the built-in exercises.
// img = photo pair in the img folder (public-domain photos from the Free Exercise DB project),
// m = main muscles, m2 = muscles that also work. All of it can be changed in the app's Edit screen.
const LIB = {
  // Monday
  d1w0: { img: 'Bicycling_Stationary', m: 'Whole-body warm-up' },
  d1w1: { img: 'Bodyweight_Squat', m: 'Quads, Glutes' },
  d1w2: { img: 'Bodyweight_Walking_Lunge', m: 'Quads, Glutes' },
  d1w3: { img: 'Standing_Soleus_And_Achilles_Stretch', m: 'Ankles, Calves' },
  d1w4: { img: 'Barbell_Squat', m: 'Squat practice: Quads, Glutes' },
  d1m0: { img: 'Barbell_Squat', m: 'Quads, Glutes', m2: 'Hamstrings, Lower back, Core' },
  d1m1: { img: 'Front_Barbell_Squat', m: 'Quads', m2: 'Glutes, Upper back, Core' },
  d1m2: { img: 'Dumbbell_Lunges', m: 'Quads, Glutes', m2: 'Hamstrings, Calves' },
  d1m3: { img: 'Floor_Glute-Ham_Raise', m: 'Hamstrings', m2: 'Glutes, Calves' },
  d1m4: { img: 'Standing_Dumbbell_Calf_Raise', m: 'Calves' },
  d1c0: { img: 'Plank', m: 'Deep abs (transverse abdominis)', m2: 'Abs, Shoulders, Glutes' },
  d1c1: { img: 'Dead_Bug', m: 'Deep abs (transverse abdominis)', m2: 'Abs, Hip flexors' },
  d1c2: { img: 'Standing_Elevated_Quad_Stretch', m: 'Quads, Hip flexors' },
  d1c3: { img: 'Seated_Floor_Hamstring_Stretch', m: 'Hamstrings' },
  d1c4: { img: 'Calf_Stretch_Hands_Against_Wall', m: 'Calves' },
  d1c5: { img: 'Childs_Pose', m: 'Lower back, Hips' },
  d1c6: { m: 'Breathing muscle (diaphragm), relaxation' },
  // Tuesday
  d2w0: { img: 'Rowing_Stationary', m: 'Whole-body warm-up' },
  d2w1: { img: 'Band_Pull_Apart', m: 'Rear shoulders, Upper back' },
  d2w2: { img: 'Pushup_Position', m: 'Shoulder blade muscles (serratus)' },
  d2w3: { img: 'Chest_And_Front_Of_Shoulder_Stretch', m: 'Shoulder mobility' },
  d2w4: { img: 'Barbell_Bench_Press_-_Medium_Grip', m: 'Bench practice: Chest, Shoulders, Triceps' },
  d2m0: { img: 'Barbell_Bench_Press_-_Medium_Grip', m: 'Chest', m2: 'Front shoulders, Triceps' },
  d2m1: { img: 'Bent_Over_Barbell_Row', m: 'Mid back, Lats', m2: 'Rear shoulders, Biceps, Lower back' },
  d2m2: { img: 'Incline_Dumbbell_Press', m: 'Upper chest', m2: 'Front shoulders, Triceps' },
  d2m3: { img: 'Pullups', m: 'Lats', m2: 'Biceps, Mid back' },
  d2m4: { img: 'Dumbbell_Shoulder_Press', m: 'Shoulders', m2: 'Triceps' },
  d2m5: { img: 'Face_Pull', m: 'Rear shoulders', m2: 'Upper back (traps, rhomboids)' },
  d2m6: { img: 'Triceps_Pushdown', m: 'Triceps' },
  d2m7: { img: 'Barbell_Curl', m: 'Biceps', m2: 'Forearms' },
  d2c0: { img: 'Hanging_Leg_Raise', m: 'Lower abs', m2: 'Hip flexors, Grip' },
  d2c1: { img: 'Pallof_Press', m: 'Obliques, Deep abs', m2: 'Shoulders, Glutes' },
  d2c2: { img: 'One_Arm_Against_Wall', m: 'Chest, Front shoulders' },
  d2c3: { img: 'Shoulder_Stretch', m: 'Rear shoulders' },
  d2c4: { img: 'Triceps_Stretch', m: 'Triceps' },
  d2c5: { img: 'Childs_Pose', m: 'Lats, Lower back' },
  d2c6: { m: 'Breathing muscle (diaphragm), relaxation' },
  // Thursday
  d4w0: { img: 'Rope_Jumping', m: 'Whole-body warm-up' },
  d4w1: { img: 'Worlds_Greatest_Stretch', m: 'Hips, Hamstrings, Upper back' },
  d4w2: { img: 'Arm_Circles', m: 'Shoulders' },
  d4w3: { img: 'Overhead_Squat', m: 'Hips, Shoulders, Upper back' },
  d4w4: { img: 'Trap_Bar_Deadlift', m: 'Deadlift practice' },
  d4m0: { img: 'Trap_Bar_Deadlift', m: 'Glutes, Hamstrings', m2: 'Quads, Lower back, Upper back, Grip' },
  d4m1: { img: 'Standing_Military_Press', m: 'Shoulders', m2: 'Triceps, Upper chest, Core' },
  d4m2: { img: 'Chin-Up', m: 'Lats, Biceps', m2: 'Mid back' },
  d4m3: { img: 'Goblet_Squat', m: 'Quads, Glutes', m2: 'Core, Upper back' },
  d4m4: { img: 'Farmers_Walk', m: 'Grip, Traps, Core', m2: 'Legs, Shoulders' },
  d4c0: { img: 'Plank', m: 'Deep abs (transverse abdominis)', m2: 'Abs, Shoulders, Glutes' },
  d4c1: { img: 'Down_Dog_Cobra', m: 'Spine, Shoulders, Hamstrings' },
  d4c2: { img: 'Standing_Toe_Touches', m: 'Hamstrings, Lower back' },
  d4c3: { img: 'Shoulder_Stretch', m: 'Rear shoulders' },
  d4c4: { img: 'Childs_Pose', m: 'Lower back, Hips' },
  d4c5: { m: 'Breathing muscle (diaphragm), relaxation' },
  // Friday
  d5w0: { img: 'Walking_Treadmill', m: 'Whole-body warm-up' },
  d5w1: { img: 'Butt_Lift_Bridge', m: 'Glutes' },
  d5w2: { m: 'Inner thighs, Glutes' },
  d5w3: { img: 'Hip_Circles_prone', m: 'Side glutes (glute medius)' },
  d5w4: { img: 'Barbell_Hip_Thrust', m: 'Glutes' },
  d5m0: { img: 'Barbell_Hip_Thrust', m: 'Glutes', m2: 'Hamstrings' },
  d5m1: { img: 'Romanian_Deadlift', m: 'Hamstrings, Glutes', m2: 'Lower back' },
  d5m2: { img: 'Split_Squat_with_Dumbbells', m: 'Quads, Glutes', m2: 'Hamstrings, Balance' },
  d5m3: { img: 'Kettlebell_One-Legged_Deadlift', m: 'Hamstrings, Glutes', m2: 'Side glutes, Core (balance)' },
  d5m4: { img: 'Pull_Through', m: 'Glutes', m2: 'Hamstrings' },
  d5c0: { img: 'Side_Bridge', m: 'Obliques (side abs)', m2: 'Deep abs, Side glutes' },
  d5c1: { img: 'Bird_Dog', m: 'Deep abs, Lower back', m2: 'Glutes, Shoulders' },
  d5c2: { m: 'Glutes, Hip flexors' },
  d5c3: { img: 'Ankle_On_The_Knee', m: 'Glutes (piriformis)' },
  d5c4: { img: 'Seated_Glute_Stretch', m: 'Glutes' },
  d5c5: { img: 'Childs_Pose', m: 'Lower back, Hips' },
  d5c6: { m: 'Breathing muscle (diaphragm), relaxation' }
};

// The weekly pre-meal and snack plan. Keys are days (0 = Sunday ... 6 = Saturday).
// name = what to have, buy = the groceries it needs (these go on the grocery list automatically).
// Pre-meals are small, fast-digesting carbs plus coffee, since they are eaten 30 minutes before training.
function defaultPlan() {
  const P = (name, buy) => ({ name, buy });
  return {
    pre: {
      1: P('Small coffee + 1 banana', 'Coffee, Bananas'),
      2: P('Small coffee + 2 dates', 'Coffee, Dates'),
      4: P('Small coffee + 1 slice of toast with honey', 'Coffee, Bread, Honey'),
      5: P('Small coffee + 1 banana', 'Coffee, Bananas')
    },
    snack: {
      1: P('Milkshake (milk + banana)', 'Milk, Bananas'),
      2: P('A handful of almonds', 'Almonds'),
      3: P('Fruit: an apple', 'Apples'),
      4: P('Milkshake (milk + banana)', 'Milk, Bananas'),
      5: P('A handful of cashews', 'Cashews'),
      6: P('A glass of juice', 'Juice'),
      0: P('Fruit: an orange', 'Oranges')
    }
  };
}

function defaultState() {
  return {
    v: 1,
    settings: {
      bottleMl: 750,
      plan: defaultPlan(),
      routine: [
        { id: 'pre', time: '06:15', label: 'Have my pre-meal' },
        { id: 'leave', time: '06:30', label: 'Leave home' },
        { id: 'gym', time: '06:45', label: 'Arrive at the gym and start the workout' }
      ]
    },
    program: defaultProgram(),
    logs: {},      // workout logs, one per date + workout day
    routine: {},   // ticked morning steps per date
    food: {},      // meals and water per date
    grocery: { items: [], last: [] }
  };
}
