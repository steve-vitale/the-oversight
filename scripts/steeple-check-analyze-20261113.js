// steeple-check-analyze-20261113.js — analyzer for the steeple check leg.
// Reads evidence/2026-11-13/perseed-steeple-a-check/*.json (default) and
// prints the check table + the per-line verdicts against the prereg
// decision rules. Usage:
//   node scripts/steeple-check-analyze-20261113.js [dir]
'use strict';
const fs = require('fs');
const path = require('path');
const DIR = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-11-13', 'perseed-steeple-a-check');

const files = fs.readdirSync(DIR).filter(function (f) { return f.endsWith('.json'); }).sort();
if (!files.length) { console.error('STEEPLE-ANALYZE STOP: no JSONs in ' + DIR); process.exit(2); }

let totRage = 0, totSteeple = 0, totIgnAbs = 0, totIgnExc = 0, totFreeze = 0, totApply = 0, totBellow = 0;
let totPress = 0, totFresh = 0, totRefresh = 0, totRefreshUnspent = 0, totHook = 0;
console.log('seed days end maxWave standing rage rage/d fight ragePress fresh refresh unspent steeple steeple/d (f,m) ignAbs ignExc hooks freeze apply bellow');
for (const f of files) {
  const d = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
  totRage += d.rageCount; totSteeple += d.steepleCount;
  totIgnAbs += d.igniteAbsolutionCount; totIgnExc += d.igniteExcommCount;
  totFreeze += d.freezelineCount; totApply += d.applyCount; totBellow += d.bellowCount;
  totPress += d.ragePressCount; totFresh += d.ragePressFresh;
  totRefresh += d.ragePressRefresh; totRefreshUnspent += d.ragePressRefreshUnspent;
  totHook += d.congHookCallCount;
  console.log([
    d.seed, d.days, d.endReason, d.maxWave, d.standing,
    d.rageCount, d.rageMaxPerDay + ' d' + d.rageMaxPerDayDay,
    d.rageMaxPerFight.size + ' ' + String(d.rageMaxPerFight.key || '').slice(0, 12),
    d.ragePressCount, d.ragePressFresh, d.ragePressRefresh, d.ragePressRefreshUnspent,
    d.steepleCount, d.steepleMaxPerDay + ' d' + d.steepleMaxPerDayDay,
    d.steepleMaxPerFightMonster.size + ' ' + String(d.steepleMaxPerFightMonster.key || '').slice(0, 20),
    d.igniteAbsolutionCount, d.igniteExcommCount, d.congHookCallCount,
    d.freezelineCount, d.applyCount, d.bellowCount,
  ].join(' '));
  if ((d.instrumentErrors || []).length) console.log('  ERRORS seed ' + d.seed + ': ' + JSON.stringify(d.instrumentErrors));
}
console.log('TOTAL rage ' + totRage + ' presses ' + totPress + ' fresh ' + totFresh +
  ' refresh ' + totRefresh + ' refreshUnspent ' + totRefreshUnspent);
console.log('TOTAL steeple ' + totSteeple + ' igniteAbsolution ' + totIgnAbs +
  ' igniteExcomm ' + totIgnExc + ' congHookCalls ' + totHook);
console.log('TOTAL controls: freezeline ' + totFreeze + ' (expect 21) apply ' + totApply +
  ' (expect 10) bellow ' + totBellow);

// Per-(fight, monster) steeple vs ignitions, worst fights (190396 d130).
for (const f of files) {
  const d = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
  const per = {};
  for (const c of d.congHookCalls) {
    if (!c.steepleFired) continue;
    const k = (c.fight || '?') + '|' + (c.mkey || '?');
    per[k] = (per[k] || 0) + 1;
  }
  const worst = Object.keys(per).sort(function (a, b) { return per[b] - per[a]; }).slice(0, 4);
  for (const k of worst) {
    const fight = k.split('|')[0];
    const ign = d.ignitePerFight[fight] || 0;
    console.log('seed ' + d.seed + ' steeple (fight,monster) ' + k.slice(0, 24) + ' = ' + per[k] +
      ' vs ignitions in that fight = ' + ign);
  }
  // Rage: worst fight press split.
  const byFight = {};
  for (const p of d.ragePresses) {
    const k = p.fight || '?';
    byFight[k] = byFight[k] || { n: 0, fresh: 0, refresh: 0, unspent: 0 };
    byFight[k].n++;
    if (!p.rageActive) byFight[k].fresh++;
    else { byFight[k].refresh++; if (p.rageActiveRounds === 3) byFight[k].unspent++; }
  }
  const wFight = Object.keys(byFight).sort(function (a, b) { return byFight[b].n - byFight[a].n; })[0];
  if (wFight) {
    const b = byFight[wFight];
    console.log('seed ' + d.seed + ' rage worst fight ' + String(wFight).slice(0, 14) +
      ' presses=' + b.n + ' fresh=' + b.fresh + ' refresh=' + b.refresh + ' unspent=' + b.unspent);
  }
}
