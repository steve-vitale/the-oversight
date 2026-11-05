// Proof test for the r105 landing finding / R105-DOORSTEP-DRINK-ENTRY
// driver fix (driver policy, zero src/js):
//   r105 seed 883: scholar sat at Haven hyd 0 for 3 days (d26-28) with
//   22-25 clean liters in the village and 0 bottles, because the doorstep
//   water branch never entered the hall: guardEatOnArrival's door step
//   ran only when needEat, and a fed scholar (kcal 2272) has no eat need.
//   fillWater off the haven tile silently refuses ("No water here"), so
//   the old code recorded filled=true while bottles stayed 0, drinks 0,
//   hyd 0->0. The fix enters the hall when (needEat || needDrink) and
//   records filled only for bottles actually gained.
// Usage: node scripts/test-landing-r105-doorstep-drink-entry.js <census-883.json>
//   Exits 0 with PASS lines on the fixed-driver replay corpus; exits 1
//   (FAIL) on the r105 panel corpus, which is the before/after proof.
const fs = require('fs');
const path = process.argv[2];
if (!path) { console.error('usage: node test-landing-r105-doorstep-drink-entry.js <census-883.json>'); process.exit(2); }
const d = JSON.parse(fs.readFileSync(path, 'utf8'));
let fail = 0;
const check = (name, ok, detail) => { console.log(`${ok ? 'ok' : 'FAIL'}: ${name}${detail ? ' — ' + detail : ''}`); if (!ok) fail++; };
const steps = d.doorstepSteps || [];
const w26 = steps.find(s => s.day === 26 && s.triggered && s.branch === 'water');
const w27 = steps.find(s => s.day === 27 && s.triggered && s.branch === 'water');
const w = w26 || w27;
check('a water-branch doorstep step triggered on d26 or d27', !!w, w ? `day=${w.day}` : 'none');
const eatRec = w && w.eatRec;
check('doorstep step entered the hall (enterResult true / insideAfter true)',
  !!(eatRec && (eatRec.enterResult === true || eatRec.insideAfter === true)),
  eatRec ? `enterResult=${eatRec.enterResult} insideAfter=${eatRec.insideAfter} storesAfter=${eatRec.storesAfter}` : 'no eatRec');
check('the step drank (drank true, hyd rose)',
  !!(eatRec && eatRec.drank === true && (eatRec.hydAfter || 0) > (eatRec.hydBefore || 0)),
  eatRec ? `drank=${eatRec.drank} hyd ${eatRec.hydBefore}->${eatRec.hydAfter} bottles ${eatRec.bottlesBefore}->${eatRec.bottlesAfter} filled=${eatRec.filled}` : 'no eatRec');
check('filled records only real bottles (filled matches filledBottles)',
  !!(eatRec && eatRec.filled === ((eatRec.filledBottles || 0) > 0) && (eatRec.filledBottles || 0) > 0),
  eatRec ? `filled=${eatRec.filled} filledBottles=${eatRec.filledBottles} bottles ${eatRec.bottlesBefore}->${eatRec.bottlesAfter} (bottlesAfter is post-drink — the filled bottle was drunk in the same step)` : 'no eatRec');
const s28 = (d.series || []).find(s => s.day === 28);
check('day-28 snapshot: scholar hydrated above 0',
  !!(s28 && (s28.scholarHydration || 0) > 0),
  s28 ? `hyd=${s28.scholarHydration} kcal=${s28.scholarKcal} loc=${s28.loc}` : 'no day-28 snap');
console.log(fail === 0 ? 'DOORSTEP-DRINK-ENTRY: PASS' : 'DOORSTEP-DRINK-ENTRY: FAIL');
process.exit(fail === 0 ? 0 : 1);
