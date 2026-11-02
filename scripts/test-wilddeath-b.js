// test-wilddeath-b.js — proof for the wild-death cause instrument.
// Synthetic only (no sims): proves the analyzer classifies from the
// WRAPPER TRACE, never from the tele string alone.
//   node scripts/test-wilddeath-b.js
'use strict';
const assert = require('assert');
const { analyze, classifyWildDeath } = require('./analyze-wilddeath-b');
const { execSync } = require('child_process');
const path = require('path');

let n = 0;
function check(name, fn) { fn(); n++; console.log('ok ' + n + ' - ' + name); }

function baseRow(over) {
  return Object.assign({
    seed: 61901,
    deaths: [{ day: 10, kind: 'villager', who: 'gen_phep6cl', cause: 'the wild', player: true }],
    dayEnds: [
      { d: 9, tile: [4, 4], away: false, kcal: 1099, scholarKey: 'gen_phep6cl' },
      { d: 10, tile: [4, 4], away: false, kcal: 2210, scholarKey: 'gen_5edtrls' },
    ],
    deathCaptures: [], regCaptures: [], hurtTrail: [], fallen: [], corpses: [],
  }, over || {});
}
function wildFightCap() {
  return { rawArg: 'the wild',
    stack: ['at Game.tbEnd (/worktrees/x/src/js/game.js:44907:20)', 'at Object.playerDeath (/worktrees/x/src/js/ledger.js:629:1)'],
    snap: { day: 10, scholarKey: 'gen_phep6cl', tile: [4, 4], tileType: 'haven', atHaven: true, kcal: 1099, kcalCap: 2400, health: 0, sick: null,
      fight: { live: true, betrayal: false, tableTrial: false, coalitionArena: false, arenaContest: false,
        fighters: [{ kind: 'villager', villagerId: 'gen_phep6cl', alive: false, hp: 0 }, { kind: 'monster', monsterId: 'hushwolf', alive: true, hp: 40 }] } },
    sayTail: [{ d: 10, line: '🕯️ Someone is dead — the wild. The village stops.' }], hurtTail: [] };
}

check('tele-only wild death is UNRESOLVED, never attributed from the string', () => {
  const c = classifyWildDeath(baseRow({}), baseRow({}).deaths[0]);
  assert.strictEqual(c.class, 'UNRESOLVED');
  assert.strictEqual(c.fedAtHome, true); // 1099 kcal at home day 9 still joins
});
check('WILD-FIGHT: tbEnd + monster fighter + no hostile + home tile flags location-misleading', () => {
  const row = baseRow({ deathCaptures: [wildFightCap()] });
  const c = classifyWildDeath(row, row.deaths[0]);
  assert.strictEqual(c.class, 'WILD-FIGHT');
  assert.strictEqual(c.fedAtHome, true);
  assert.strictEqual(c.locationMisleading, true);
});
check('FALLBACK: falsy raw arg with wild tele', () => {
  const cap = wildFightCap(); cap.rawArg = null; cap.stack = ['at Game.resolveDay (/worktrees/x/src/js/game.js:32273:10)'];
  const row = baseRow({ deathCaptures: [cap] });
  assert.strictEqual(classifyWildDeath(row, row.deaths[0]).class, 'FALLBACK');
});
check('WILD-UNCONFIRMED: wild arg but no tbEnd / no live fight is not proof', () => {
  const cap = wildFightCap(); cap.stack = ['at somewhereElse (/worktrees/x/src/js/game.js:8101:10)'];
  cap.snap.fight = { live: false };
  const row = baseRow({ deathCaptures: [cap] });
  assert.strictEqual(classifyWildDeath(row, row.deaths[0]).class, 'WILD-UNCONFIRMED');
});
check('OTHER-NAMED: raw arg starvation with wild tele is a mismatch, not a wild death', () => {
  const cap = wildFightCap(); cap.rawArg = 'starvation'; cap.snap.fight = { live: false };
  const row = baseRow({ deathCaptures: [cap] });
  assert.strictEqual(classifyWildDeath(row, row.deaths[0]).class, 'OTHER-NAMED');
});
check('fed-at-home gate: away day-end is not at-home; low kcal is not fed', () => {
  const awayRow = baseRow({ dayEnds: [{ d: 9, tile: [3, 3], away: true, kcal: 2400, scholarKey: 'gen_phep6cl' }] });
  assert.strictEqual(classifyWildDeath(awayRow, awayRow.deaths[0]).fedAtHome, false);
  const hungryRow = baseRow({ dayEnds: [{ d: 9, tile: [4, 4], away: false, kcal: 200, scholarKey: 'gen_phep6cl' }] });
  assert.strictEqual(classifyWildDeath(hungryRow, hungryRow.deaths[0]).fedAtHome, false);
});
check('analyzer verdict: one attributed fed-at-home wild death is DIAG-GO', () => {
  const corpus = { meta: {}, rows: [baseRow({ deathCaptures: [wildFightCap()] })] };
  const out = analyze(corpus);
  assert.strictEqual(out.verdict, 'DIAG-GO');
  assert.strictEqual(out.fedAtHomeWildCount, 1);
  assert.strictEqual(out.playerDeathCensus['the wild'], 1);
});
check('analyzer verdict: tele-only fed-at-home wild death is DIAG-NO-GO, not GO', () => {
  const out = analyze({ meta: {}, rows: [baseRow({})] });
  assert.strictEqual(out.verdict, 'DIAG-NO-GO');
});
check('analyzer verdict: no fed-at-home wild death is NO-INSTANCE', () => {
  const row = baseRow({ deaths: [{ day: 8, kind: 'villager', who: 'gen_phep6cl', cause: 'starvation', player: true }] });
  assert.strictEqual(analyze({ meta: {}, rows: [row] }).verdict, 'NO-INSTANCE');
});
check('driver + analyzer parse clean (node --check)', () => {
  for (const f of ['sweep-wilddeath-b.js', 'analyze-wilddeath-b.js']) {
    execSync('node --check ' + path.join(__dirname, f), { stdio: 'pipe' });
  }
});

console.log('test-wilddeath-b: ' + n + '/' + n + ' passed');
