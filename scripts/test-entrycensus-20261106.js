// scripts/test-entrycensus-20261106.js
// Proof for sim-entrycensus-a: the entry-HP classifier must call the KNOWN
// traces right before the judged census run.
//   - 53006 d149 Congregation 20/20 (sim-congtrace-a, proven live) -> artifact
//   - ground-down Eulogy 675/900 (same seed) -> legitimate wounded entry
//   - 51005 d66 Reunion 123/1200 (fightinterior-b) -> legitimate wounded entry
//   - a tbFights-only row (no entry HP) -> unclassifiable (recorder gap)
// Run: node scripts/test-entrycensus-20261106.js
'use strict';
const assert = require('assert');
const { classifyTrace, extractTraces, extractKills, extractTbRows } = require('./entrycensus-analyze-20261106.js');

let n = 0;
function check(name, got, wantCls, wantReasonPart) {
  n++;
  assert.strictEqual(got.cls, wantCls, name + ': got ' + JSON.stringify(got));
  if (wantReasonPart) assert.ok(got.reason.includes(wantReasonPart), name + ': reason "' + got.reason + '" lacks "' + wantReasonPart + '"');
  console.log('ok ' + n + ' - ' + name + ' -> ' + got.cls);
}

// 1. THE anchor: 53006 d149 Congregation, born 20/20.
check('congregation 20/20 (53006 d149)', classifyTrace({ mid: 'congregation', wave: 4, entryHp: 20, entryMaxHp: 20 }), 'artifact', 'far below');
// 2. Same seed, genuine wounded entry.
check('eulogy 675/900', classifyTrace({ mid: 'eulogy', wave: 4, entryHp: 675, entryMaxHp: 900 }), 'legitimate', 'grind carryover');
check('strike 750/1000', classifyTrace({ mid: 'strike', wave: 4, entryHp: 750, entryMaxHp: 1000 }), 'legitimate', 'grind carryover');
// 3. fightinterior-b 51005 d66 Reunion, ground down to 123.
check('reunion 123/1200', classifyTrace({ mid: 'reunion', wave: 4, entryHp: 123, entryMaxHp: 1200 }), 'legitimate', 'grind carryover');
// 4. Recorder gap: tbFights-only row carries no entry HP.
check('tbFights-only row (no entryHp)', classifyTrace({ mid: 'eulogy', wave: 4 }), 'unclassifiable', 'recorder gap');
// 5. Born crippled then ground down further: max itself is the bug.
check('congregation 15/20', classifyTrace({ mid: 'congregation', wave: 4, entryHp: 15, entryMaxHp: 20 }), 'artifact', 'far below');
// 6. Entry < 100 at a CANONICAL max is wounded, not artifact.
check('eater 87/950', classifyTrace({ mid: 'eater', wave: 4, entryHp: 87, entryMaxHp: 950 }), 'legitimate', 'grind carryover');
// 7. Full-health entry at canonical max is legitimate, not artifact.
check('audit 1100/1100', classifyTrace({ mid: 'audit', wave: 4, entryHp: 1100, entryMaxHp: 1100 }), 'legitimate', 'full-health');
// 8. Wave-5 artifact signature.
check('finale 20/20', classifyTrace({ mid: 'finale', wave: 5, entryHp: 20, entryMaxHp: 20 }), 'artifact', 'far below');
// 9. Wave < 4 is out of scope even at 20/20 (wave-1/2 monsters legitimately have ~20 HP).
check('wave-2 monster 20/20', classifyTrace({ mid: 'moderator', wave: 2, entryHp: 20, entryMaxHp: 20 }), 'out-of-scope', 'wave < 4');
// 10. Unknown monster id cannot be judged.
check('unknown id', classifyTrace({ mid: 'mystery_beast', wave: 4, entryHp: 20, entryMaxHp: 20 }), 'artifact', 'far below'); // max<100 needs no band
check('unknown id canonical max', classifyTrace({ mid: 'mystery_beast', wave: 4, entryHp: 500, entryMaxHp: 900 }), 'unclassifiable', 'no canonical band');
// 11. Pack trace: 3 reunions born crippled (60/60) is an artifact.
check('reunion pack 60/60', classifyTrace({ mid: 'reunion', wave: 4, entryHp: 60, entryMaxHp: 60, mids: ['reunion', 'reunion', 'reunion'] }), 'artifact', 'far below');
// 12. Pack trace, ground down legitimately.
check('reunion pack 3567/3867', classifyTrace({ mid: 'reunion', wave: 4, entryHp: 3567, entryMaxHp: 3867, mids: ['reunion', 'reunion', 'reunion'] }), 'legitimate', 'grind carryover');
// 13. entryMaxHp between 100 and canonical low: no known mechanism.
check('eulogy 400/500', classifyTrace({ mid: 'eulogy', wave: 4, entryHp: 400, entryMaxHp: 500 }), 'unclassifiable', 'no known mechanism');
// 14. Veteran hardening (1.5x) stays legitimate.
check('eulogy veteran 900/1350', classifyTrace({ mid: 'eulogy', wave: 4, entryHp: 900, entryMaxHp: 1350 }), 'legitimate', 'grind carryover');
// 15. extractTraces finds wave-4+ entryHp traces and skips wave<4 ones.
{
  const doc = {
    seed: 53006,
    traces: [
      { seq: 6, day: 149, mid: 'congregation', wave: 4, entryHp: 20, entryMaxHp: 20, ending: 'kill', outcome: 'won' },
      { seq: 1, day: 8, mid: 'murkcap', wave: 1, entryHp: 20, entryMaxHp: 20, ending: 'kill', outcome: 'won' },
    ],
    tbFights: [{ seq: 1, day: 8, mid: 'murkcap', wave: 1, outcome: 'won' }],
  };
  const trs = extractTraces(doc, 'evidence/2026-11-06/perseed-congtrace-a/x.json', 53006);
  n++;
  assert.strictEqual(trs.length, 1, 'extractTraces keeps only wave-4+ traces, got ' + trs.length);
  assert.strictEqual(trs[0].cls, 'artifact');
  assert.strictEqual(trs[0].mid, 'congregation');
  console.log('ok ' + n + ' - extractTraces: wave-4 filter + artifact class');
}
// 16. extractKills pulls wave-4+ kills from both ledgers, skips wave<4.
{
  const text = JSON.stringify({
    seed: 53006,
    waveKillLog: [
      { d: 89, mid: 'strike', w: 4, by: 'olivia_bennett', via: 'player', trick: null },
      { d: 7, mid: 'murkcap', w: 1, by: 'lena_ruiz', via: 'wild', trick: null },
      { d: 149, mid: 'congregation', w: 4, by: 'gen_y8hmuwz', via: 'player', trick: null },
    ],
    killsLive: [
      { day: 89, mid: 'strike', wave: 4, by: 'olivia_bennett', via: 'player', scholarChannel: true },
    ],
  });
  const kills = extractKills(text, 53006);
  n++;
  assert.strictEqual(kills.length, 3, 'extractKills wave-4+ only, got ' + JSON.stringify(kills));
  assert.ok(kills.some((k) => k.mid === 'congregation' && k.day === 149 && k.src === 'waveKillLog'));
  assert.ok(kills.some((k) => k.mid === 'strike' && k.src === 'killsLive'));
  console.log('ok ' + n + ' - extractKills: both ledgers, wave-4+ only');
}
// 17. extractTbRows pulls wave-4+ turn-based rows (the stageally-class
// recorder's only fight record) with day/mid/outcome, skips wave<4.
{
  const text = JSON.stringify({
    seed: 53006,
    tbFights: [
      { seq: 9, day: 89, mid: 'strike', wave: 4, outcome: 'won', rounds: 10 },
      { seq: 8, day: 89, mid: 'eulogy', wave: 4, outcome: 'lost', rounds: 7 },
      { seq: 1, day: 8, mid: 'murkcap', wave: 1, outcome: 'won', rounds: 2 },
    ],
  });
  const rows = extractTbRows(text);
  n++;
  assert.strictEqual(rows.length, 2, 'extractTbRows wave-4+ only, got ' + JSON.stringify(rows));
  assert.ok(rows.some((r) => r.mid === 'strike' && r.day === 89 && r.outcome === 'won'));
  assert.ok(rows.some((r) => r.mid === 'eulogy' && r.outcome === 'lost'));
  console.log('ok ' + n + ' - extractTbRows: wave-4+ rows with outcome');
}

// 18. Entry-max ALIASES (found live during the judged run's
// verification): the tbretreat/finishprobe-class recorders carry the
// entry max as entryMaxHpPrimary / worldHpAtLift.maxHp, not entryMaxHp.
// 99722 d104 Reunion, tbretreat-b baseline: the ONLY fight row that day,
// 20 HP in, 1 round, 20 damage dealt, kill logged — born 20/20.
{
  const doc = {
    seed: 99722,
    fights: [
      { day: 104, mid: 'reunion', wave: 4, entryHp: 20, entryMaxHpPrimary: 20, worldHpAtLift: { hp: 20, maxHp: 20 }, ending: 'kill-or-rout', rounds: 1, damageDealt: 20 },
    ],
    waveKillLog: [{ d: 104, mid: 'reunion', w: 4, by: 'gen_fqc40em', via: 'player' }],
  };
  const trs = extractTraces(doc, 'evidence/2026-11-05/perseed-tbretreat-b/tbretreat-s99722-tbretreat-baseline.json', 99722);
  n++;
  assert.strictEqual(trs.length, 1, 'alias trace extracted, got ' + trs.length);
  assert.strictEqual(trs[0].cls, 'artifact', '99722 d104 Reunion 20/20 via alias must be artifact, got ' + JSON.stringify(trs[0]));
  assert.strictEqual(trs[0].entryMaxHp, 20);
  assert.strictEqual(trs[0].maxSource, 'entryMaxHpPrimary');
  console.log('ok ' + n + ' - extractTraces alias: 99722 d104 Reunion 20/20 -> artifact');
}
// 19. 99723 d53 Reunion, ground down to 3 of a 1200 max over six fights
// the same day (same file) — legitimate wounded entry, not artifact.
{
  const doc = {
    seed: 99723,
    fights: [
      { day: 53, mid: 'reunion', wave: 4, entryHp: 3, entryMaxHpPrimary: 1200, worldHpAtLift: { hp: 3, maxHp: 1200 }, ending: 'kill-or-rout', rounds: 2 },
    ],
  };
  const trs = extractTraces(doc, 'evidence/2026-11-05/perseed-tbretreat-b/tbretreat-s99723-tbretreat-armed.json', 99723);
  n++;
  assert.strictEqual(trs.length, 1);
  assert.strictEqual(trs[0].cls, 'legitimate', '99723 d53 Reunion 3/1200 must be legitimate, got ' + JSON.stringify(trs[0]));
  assert.strictEqual(trs[0].entryMaxHp, 1200);
  console.log('ok ' + n + ' - extractTraces alias: 99723 d53 Reunion 3/1200 -> legitimate');
}
// 20. Finishprobe d121 Strike: 695 damage dealt to a beast that entered
// at 695/1000 over 32 rounds — legitimate, and the worldHpAtLift-only
// fallback resolves the max when entryMaxHpPrimary is absent.
{
  const doc = {
    seed: 55005,
    fights: [
      { day: 121, mid: 'strike', wave: 4, entryHp: 695, entryMaxHpPrimary: 1000, worldHpAtLift: { hp: 695, maxHp: 1000 }, ending: 'kill-or-rout', rounds: 32, damageDealt: 695 },
      { day: 131, mid: 'eulogy', wave: 4, entryHp: 20, worldHpAtLift: { hp: 20, maxHp: 20 }, ending: 'vFlee', rounds: 1 },
    ],
  };
  const trs = extractTraces(doc, 'evidence/2026-11-06/perseed-finishprobe-a/finishprobe-s55005-finishprobe-probe.json', 55005);
  n++;
  assert.strictEqual(trs.length, 2, 'finishprobe alias traces, got ' + trs.length);
  assert.strictEqual(trs[0].cls, 'legitimate', '55005 d121 Strike 695/1000 must be legitimate');
  assert.strictEqual(trs[0].maxSource, 'entryMaxHpPrimary');
  assert.strictEqual(trs[1].cls, 'artifact', '55005 d131 Eulogy 20/20 via worldHpAtLift-only must be artifact');
  assert.strictEqual(trs[1].maxSource, 'worldHpAtLift.maxHp');
  console.log('ok ' + n + ' - extractTraces alias: finishprobe d121 legitimate + d131 artifact via worldHpAtLift-only');
}
// 21. Kill-or-rout matcher on a synthetic corpus: a logged kill whose
// only fight row ends 'kill-or-rout' matches that row (artifact and
// legitimate legs both). Runs the full census over a throwaway root.
{
  const fs = require('fs');
  const os = require('os');
  const path = require('path');
  const { runCensus } = require('./entrycensus-analyze-20261106.js');
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'entrycensus-test-'));
  const dir = path.join(root, 'evidence', '2026-11-06', 'perseed-test');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'test-s99999.json'), JSON.stringify({
    seed: 99999,
    fights: [{ day: 50, mid: 'reunion', wave: 4, entryHp: 20, entryMaxHpPrimary: 20, ending: 'kill-or-rout', rounds: 1, damageDealt: 20 }],
    waveKillLog: [{ d: 50, mid: 'reunion', w: 4, by: 'x', via: 'player' }],
    killsLive: [{ day: 50, mid: 'reunion', wave: 4, by: 'x', via: 'player' }],
  }));
  fs.writeFileSync(path.join(dir, 'test-s99998.json'), JSON.stringify({
    seed: 99998,
    fights: [{ day: 60, mid: 'strike', wave: 4, entryHp: 700, entryMaxHpPrimary: 1000, ending: 'kill-or-rout', rounds: 24, damageDealt: 700 }],
    waveKillLog: [{ d: 60, mid: 'strike', w: 4, by: 'y', via: 'player' }],
    killsLive: [{ day: 60, mid: 'strike', wave: 4, by: 'y', via: 'player' }],
  }));
  const res = runCensus(root);
  n++;
  assert.strictEqual(res.suspectKillsDistinct.length, 1, 'synthetic census must find exactly 1 suspect kill, got ' + JSON.stringify(res.suspectKillsDistinct));
  assert.strictEqual(res.suspectKillsDistinct[0].seed, 99999);
  assert.strictEqual(res.suspectKillsDistinct[0].mid, 'reunion');
  const legit = res.killEventsDistinct.find((e) => e.seed === 99998);
  assert.ok(legit, 'synthetic legitimate kill event present');
  assert.strictEqual(legit.match, 'trace-legitimate', 'kill-or-rout legitimate row must match trace-legitimate, got ' + legit.match);
  fs.rmSync(root, { recursive: true, force: true });
  console.log('ok ' + n + ' - runCensus synthetic: kill-or-rout artifact suspect + legitimate match');
}

console.log('test-entrycensus-20261106: ' + n + '/' + n + ' green');
