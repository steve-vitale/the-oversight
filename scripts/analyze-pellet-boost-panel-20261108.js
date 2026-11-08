// scripts/analyze-pellet-boost-panel-20261108.js — judge the pellet rads
// panel bars (RB-1/P1, RB-2/P2 organic, RB-3/P3) from
// evidence/2026-11-08/sim-pellet-rads-panel.jsonl.
// Usage: node scripts/analyze-pellet-boost-panel-20261108.js [path]
// Exit 0 when every bar passes, 1 otherwise. Prints the per-seed table +
// the verdict per bar. The P4 (pass) comparison is a separate diff against
// evidence/2026-11-07/sim-pelletpass-panel.jsonl (see the run note).
'use strict';
const fs = require('fs');
const path = require('path');
const file = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-11-08', 'sim-pellet-rads-panel.jsonl');
const rows = fs.readFileSync(file, 'utf8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l));
const bearer = rows.filter(r => r.panel === 'bearer');
let fail = 0;
function bar(name, cond, detail) {
  console.log((cond ? '  PASS ' : '  FAIL ') + name + (detail ? ' — ' + detail : ''));
  if (!cond) fail++;
}
console.log('BEARER PANEL (P1/P2/P3): ' + bearer.length + ' seeds');
for (const r of bearer) {
  console.log(`  seed ${r.seed}: days=${r.days} end=${r.endReason} boosts=${r.ledger.boosts} floors=${r.ledger.floors} rads=${r.ledger.rads} ledgerMatch=${r.ledgerMatchesBurns} burnRads=${r.everyBurnCostsRads} pantryUntouched=${r.everyBoostPantryUntouched} perBearer=${r.perBearerMatches} maxBoostsDay=${r.maxBoostsPerDay} heavyUse=${r.heavyUseDay} maxExposure=${r.maxHolderExposure} sickObserved=${r.sicknessObserved} cureObserved=${r.cureObserved} surgeUsed=${r.feastSurgeUsed} surgeBy=${r.feastSurgeBy} pantry ${r.pantryKcalStart}->${r.pantryKcalEnd} deaths=${r.deaths}`);
}
if (bearer.length) {
  const boostedSeeds = bearer.filter(r => r.ledger.boosts >= 1).length;
  bar('P1a: >=1 boost on >=4/8 bearer seeds', boostedSeeds >= 4, boostedSeeds + '/' + bearer.length + ' seeds boosted');
  bar('P1b: ledger.rads equals observed boost rads, every seed', bearer.every(r => r.ledgerMatchesBurns),
    bearer.filter(r => !r.ledgerMatchesBurns).map(r => r.seed).join(',') || 'all match');
  bar('P1c: every paid burn costs exactly radsPerBoost (2)', bearer.every(r => r.everyBurnCostsRads),
    bearer.filter(r => !r.everyBurnCostsRads).map(r => r.seed).join(',') || 'all cost 2');
  bar('P1d: no burn moves the pantry (pre == post at the burn), every seed', bearer.every(r => r.everyBoostPantryUntouched),
    bearer.filter(r => !r.everyBoostPantryUntouched).map(r => r.seed).join(',') || 'pantry untouched');
  bar('P1e: per-bearer burn rads match per-bearer boost counts, every seed', bearer.every(r => r.perBearerMatches),
    bearer.filter(r => !r.perBearerMatches).map(r => r.seed).join(',') || 'all match');
  const marked = bearer.filter(r => r.feastSurgeUsed).length;
  bar('P3: feastSurgeUsed marks on >=1 bearer seed via a paid boost', marked >= 1, marked + '/' + bearer.length + ' seeds marked');
  const heavy = bearer.filter(r => r.heavyUseDay).length;
  bar('P2-organic: a heavy-use bearer-day (>=5 boosts in a day) exists somewhere in the panel', heavy >= 1,
    heavy + '/' + bearer.length + ' seeds have one — none = NO-GO on tuning (cost cannot bind in the wild)');
  const hot = bearer.filter(r => r.maxHolderExposure >= 10);
  if (hot.length) {
    bar('P2-organic: every bearer that reached exposure >=10 was observed sick', hot.every(r => r.sicknessObserved),
      hot.filter(r => !r.sicknessObserved).map(r => r.seed).join(',') || 'all sick-observed');
  } else {
    console.log('  NOTE P2-organic: no bearer reached exposure >=10 on any seed — the sickness-in-the-wild half is unobserved; see the run note.');
  }
  // Cure observation (recorded, not a bar): recomputed here from the daily
  // series with the same-holder guard — the stored flag from the first
  // run compared across a holder change and read a key swap as a cure.
  // A genuine cure is an exposure drop > the 1/day decay across two days
  // with the SAME holder.
  function cureObservedFor(r) {
    const d = r.daily || [];
    for (let i = 1; i < d.length; i++) {
      if (d[i].holder !== d[i - 1].holder) continue;
      const a = d[i - 1].holderExposure, b = d[i].holderExposure;
      if (a != null && b != null && (a - b) > 1) return true;
    }
    return false;
  }
  const cures = bearer.filter(r => cureObservedFor(r)).length;
  console.log('  NOTE P2 cure observation (recorded, not a bar): ' + cures + '/' + bearer.length + ' seeds show an exposure drop larger than the 1/day decay across same-holder days.');
}
console.log(fail ? `\nVERDICT: ${fail} bar(s) FAIL` : '\nVERDICT: all bars PASS');
process.exit(fail ? 1 : 0);
