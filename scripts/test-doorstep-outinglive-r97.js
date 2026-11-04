// Proof test for the r97 landing finding / r98 driver fix (R98
// DOORSTEP-OUTINGLIVE, driver policy, zero src/js):
//   r97 seed 843 d13: scholar Gilberto stood at Haven outside the hall at
//   kcal 728 with pantry 16350, but havenDoorstepStep skipped as
//   'outing-live' (Caleb's outing live) BEFORE need was computed, and
//   Gilberto starved that day (class-E scholar starvation death).
//   The r98 driver computes need first and skips on outing-live only when
//   the scholar is NOT hungry/thirsty.
// Usage: node scripts/test-doorstep-outinglive-r97.js <census-843.json>
//   Exits 0 with PASS lines on the r98 replay corpus; exits 1 (FAIL) on the
//   r97 corpus, which is the before/after proof.
const fs = require('fs');
const path = process.argv[2];
if (!path) { console.error('usage: node test-doorstep-outinglive-r97.js <census-843.json>'); process.exit(2); }
const d = JSON.parse(fs.readFileSync(path, 'utf8'));
let fail = 0;
const check = (name, ok, detail) => { console.log(`${ok ? 'ok' : 'FAIL'}: ${name}${detail ? ' — ' + detail : ''}`); if (!ok) fail++; };
const steps = d.doorstepSteps || [];
const d13 = steps.find(s => s.day === 13);
check('doorstep step recorded for day 13', !!d13, d13 ? JSON.stringify({ kcal: d13.kcal, skipped: d13.skipped || null, triggered: !!d13.triggered }) : 'none');
check('day-13 doorstep step TRIGGERED (not skipped outing-live)', !!(d13 && d13.triggered), d13 ? `skipped=${d13.skipped || 'none'}` : 'none');
check('day-13 eat actually ate and raised kcal', !!(d13 && d13.eatRec && d13.eatRec.ate && d13.eatRec.kcalAfter > d13.eatRec.kcalBefore),
  d13 && d13.eatRec ? `kcal ${d13.eatRec.kcalBefore}->${d13.eatRec.kcalAfter}, pantry ${d13.eatRec.pantryBefore}->${d13.eatRec.pantryAfter}` : 'no eatRec');
const gilbertoStarved = (d.villagerDeaths || []).some(x => x.day === 13 && /starv/i.test(x.cause || ''));
check('no day-13 starvation death in villagerDeaths', !gilbertoStarved);
const mantleFromGilberto = (d.mantleLog || []).some(m => m.day <= 14 && m.fromName === 'Gilberto');
check('no mantle transition away from Gilberto by day 14 (scholar alive)', !mantleFromGilberto);
console.log(fail === 0 ? 'DOORSTEP-OUTINGLIVE: PASS' : 'DOORSTEP-OUTINGLIVE: FAIL');
process.exit(fail === 0 ? 0 : 1);
