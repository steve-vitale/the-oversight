// test-talkturn-confirm-b.js — proof test for the talk-turn CONFIRM arm
// (arm sim-talkturn-confirm-b, run fleshout-loop-b-20261111T0330Z).
// Proves ONLY the confirm delta over the pilot (the pilot proof,
// scripts/test-talkturn-a.js 11/11, is re-run as the legs-reproduction
// check on current master): (a) the REVISED cost bar (deaths per 100
// village-days, +10% cap) on synthetic inputs — including the pilot's
// exact numbers as a fixture (raw deaths higher, rate identical ->
// PASS); (b) the snapshot-based counter-stall classification
// (stalled / answered / no-counter, fresh vs blocked re-knock);
// (c) second-link counting parity between the pilot analyzer and the
// confirm analyzer on the same synthetic seed; (d) the confirm
// driver writes to perseed-talkturn-confirm-b and refuses to
// overwrite (live spawn check with a planted file, removed after).
// Usage: node scripts/test-talkturn-confirm-b.js
'use strict';
const path = require('path');
const fs = require('fs');
const assert = require('assert');
const { spawnSync } = require('child_process');
const TA = require(path.join(__dirname, 'talkturn-analyze-20261110'));
const TCA = require(path.join(__dirname, 'talkturn-confirm-analyze-20261110'));

let pass = 0;
function ok(name, fn) { fn(); pass++; console.log('ok ' + pass + ' - ' + name); }

// --- Revised cost bar ---
// Pilot numbers as a fixture: armed 696 deaths / 985 village-days =
// 70.66 per 100d; control 603 / 851 = 70.86 per 100d. Raw total higher,
// rate identical -> the revised bar PASSES where the pilot's raw-total
// clause FAILED. That is the whole point of the revision.
ok('costBar: pilot numbers pass under the per-day form (raw higher, rate identical)', function () {
  const ctrl = { starvation: 0, deaths: 603, villageDays: 851, deathsPer100Days: (603 / 851) * 100, armOnlyStarvation: 0, median: 101.5 };
  const armed = { starvation: 0, deaths: 696, villageDays: 985, deathsPer100Days: (696 / 985) * 100, armOnlyStarvation: 0, median: 129.5 };
  const r = TCA.costBar(armed, ctrl);
  assert.strictEqual(r.pass, true, 'pilot numbers must pass the revised bar: ' + JSON.stringify(r));
  assert.strictEqual(r.reasons.length, 0);
});

ok('costBar: rate above +10% fails even when raw totals are close', function () {
  const ctrl = { starvation: 0, deaths: 600, villageDays: 800, deathsPer100Days: 75, armOnlyStarvation: 0, median: 100 };
  const armed = { starvation: 0, deaths: 660, villageDays: 790, deathsPer100Days: 83.54, armOnlyStarvation: 0, median: 100 };
  const r = TCA.costBar(armed, ctrl);
  assert.strictEqual(r.pass, false);
  assert.ok(r.reasons.some(function (x) { return x.indexOf('deaths/100d') === 0; }), 'rate reason present: ' + JSON.stringify(r.reasons));
});

ok('costBar: starvation above control+2 fails', function () {
  const ctrl = { starvation: 0, deaths: 600, villageDays: 800, deathsPer100Days: 75, armOnlyStarvation: 0, median: 100 };
  const armed = { starvation: 3, deaths: 600, villageDays: 800, deathsPer100Days: 75, armOnlyStarvation: 3, median: 100 };
  assert.strictEqual(TCA.costBar(armed, ctrl).pass, false);
  const edge = { starvation: 2, deaths: 600, villageDays: 800, deathsPer100Days: 75, armOnlyStarvation: 2, median: 100 };
  assert.strictEqual(TCA.costBar(edge, ctrl).pass, true, 'starvation at exactly control+2 passes');
});

ok('costBar: arm-only starvation above 2 fails on its own', function () {
  const ctrl = { starvation: 0, deaths: 600, villageDays: 800, deathsPer100Days: 75, armOnlyStarvation: 0, median: 100 };
  // Total starvation 2 is within control+2, but all 3 arm-only deaths
  // sit on seeds where the control twin starved nobody.
  const armed = { starvation: 2, deaths: 600, villageDays: 800, deathsPer100Days: 75, armOnlyStarvation: 3, median: 100 };
  const r = TCA.costBar(armed, ctrl);
  assert.strictEqual(r.pass, false);
  assert.ok(r.reasons.some(function (x) { return x.indexOf('arm-only') === 0; }), 'arm-only reason present: ' + JSON.stringify(r.reasons));
});

ok('costBar: median below 0.8x control fails', function () {
  const ctrl = { starvation: 0, deaths: 600, villageDays: 800, deathsPer100Days: 75, armOnlyStarvation: 0, median: 100 };
  const armed = { starvation: 0, deaths: 600, villageDays: 800, deathsPer100Days: 75, armOnlyStarvation: 0, median: 79 };
  assert.strictEqual(TCA.costBar(armed, ctrl).pass, false);
  const edge = { starvation: 0, deaths: 600, villageDays: 800, deathsPer100Days: 75, armOnlyStarvation: 0, median: 80 };
  assert.strictEqual(TCA.costBar(edge, ctrl).pass, true, 'median at exactly 0.8x passes');
});

// --- Counter-stall classification fixtures (same shape as test-talkturn-a) ---
function fakeSeed(opts) {
  const base = {
    seed: 150233, days: 30, gameDays: 30, endReason: 'horizon', won: false,
    scaleRank: 'regional', maxWave: 4, standing: 100,
    instrumentErrors: [], bondEvents: [], stageCalls: [], acceptCalls: [],
    declineCalls: [], proposeCalls: [], linkTickCalls: 0, daily: [],
    talk: { talks: 0, turns: 0, linkPicks: 0, bondPicks: 0, talksWithRaiserPending: 0, deepConvos: 0, deepTurns: 0 },
    deaths: [],
  };
  return Object.assign(base, opts || {});
}
function fakeDay(day, extra) {
  return Object.assign({
    day: day, scholarId: 'scholar1', standing: 100, scaleRank: 'regional',
    polity: null, pending: { counter: false, accord: false, national: false, global: false },
    pendingRaises: [], raiseState: [], links: [], linkTotal: 0,
    villages: [{ id: 'emberhold', name: 'Emberhold', opinion: 10, linked: false }],
    scholarLore: ['emberhold'], linkTickRoll: 0.7,
    raisers: [],
    eligibleRaisers: 0,
  }, extra || {});
}

ok('counterOf: stalled seed — counter pending at end, fresh 1 + blocked 2', function () {
  const j = fakeSeed({
    proposeCalls: [
      { day: 12, villageId: 'emberhold', outcome: 'counter', stack: '' },
      { day: 15, villageId: 'emberhold', outcome: 'counter', stack: '' },
      { day: 20, villageId: 'emberhold', outcome: 'counter', stack: '' },
    ],
    daily: [
      fakeDay(10),
      fakeDay(12, { pending: { counter: true, accord: false, national: false, global: false } }),
      fakeDay(15, { pending: { counter: true, accord: false, national: false, global: false } }),
      fakeDay(20, { pending: { counter: true, accord: false, national: false, global: false } }),
      fakeDay(30, { pending: { counter: true, accord: false, national: false, global: false } }),
    ],
  });
  const c = TCA.counterOf(j);
  assert.strictEqual(c.stalledAtEnd, true);
  assert.strictEqual(c.fresh, 1, 'first counter propose is fresh: ' + JSON.stringify(c));
  assert.strictEqual(c.blocked, 2, 'later proposes while pending are re-knocks: ' + JSON.stringify(c));
  assert.strictEqual(c.pendingCounterDays, 4);
});

ok('counterOf: answered counter — pending clears, fresh 1, not stalled', function () {
  const j = fakeSeed({
    proposeCalls: [
      { day: 12, villageId: 'emberhold', outcome: 'counter', stack: '' },
      { day: 13, villageId: 'emberhold', outcome: 'formed', stack: '' },
    ],
    daily: [
      fakeDay(10),
      fakeDay(12, { pending: { counter: true, accord: false, national: false, global: false } }),
      fakeDay(13, { pending: { counter: false, accord: false, national: false, global: false } }),
      fakeDay(30, { pending: { counter: false, accord: false, national: false, global: false } }),
    ],
  });
  const c = TCA.counterOf(j);
  assert.strictEqual(c.stalledAtEnd, false);
  assert.strictEqual(c.fresh, 1);
  assert.strictEqual(c.blocked, 0);
  assert.strictEqual(c.pendingCounterDays, 1);
});

ok('counterOf: no counter at all — zeroed, not stalled', function () {
  const j = fakeSeed({ daily: [fakeDay(10), fakeDay(30)] });
  const c = TCA.counterOf(j);
  assert.deepStrictEqual(c, { fresh: 0, blocked: 0, stalledAtEnd: false, pendingCounterDays: 0 });
});

// --- Second-link counting parity: pilot analyzer vs confirm analyzer ---
function fakeLink(other) {
  return { key: other + '|LEAD|haven>' + other + '|:', other: other, kind: 'LEAD', primary: 'haven', subordinate: other, a: null, b: null, age: 30, trust: 40, conquered: false, status: 'active', seasoned: false, regional: false, reason: 'too-young' };
}

ok('analyzer parity: confirm analyzer counts second links exactly like the pilot analyzer', function () {
  const j = fakeSeed({
    bondEvents: [
      { day: 10, initiator: 'nathan', target: 'emberhold', kind: 'link', outcome: 'staged', chance: null, reason: null },
      { day: 11, initiator: 'nathan', target: 'emberhold', kind: 'link', outcome: 'accepted', chance: null, reason: null },
      { day: 20, initiator: 'mara', target: 'stonebridge', kind: 'link', outcome: 'staged', chance: null, reason: null },
      { day: 21, initiator: 'mara', target: 'stonebridge', kind: 'link', outcome: 'accepted', chance: null, reason: null },
    ],
    proposeCalls: [
      { day: 11, villageId: 'emberhold', outcome: 'formed', stack: '' },
      { day: 21, villageId: 'stonebridge', outcome: 'formed', stack: '' },
    ],
    daily: [
      fakeDay(10),
      fakeDay(11, { links: [fakeLink('emberhold')], linkTotal: 1 }),
      fakeDay(20, { links: [fakeLink('emberhold')], linkTotal: 1 }),
      fakeDay(21, { links: [fakeLink('emberhold'), fakeLink('stonebridge')], linkTotal: 2 }),
    ],
  });
  const p = TA.analyzeSeedTalkturn(j);
  const c = TCA.analyzeSeedTalkturnConfirm(j);
  assert.strictEqual(c.secondLinkFormed, p.secondLinkFormed);
  assert.strictEqual(c.secondLinksViaRaise, p.secondLinksViaRaise);
  assert.strictEqual(c.firstLinkSource, p.firstLinkSource);
  assert.strictEqual(c.answered.accepted, p.answered.accepted);
  assert.strictEqual(c.secondLinkFormed, true);
  assert.strictEqual(c.secondLinksViaRaise, 1);
  assert.deepStrictEqual(c.counter, { fresh: 0, blocked: 0, stalledAtEnd: false, pendingCounterDays: 0 });
});

// --- Confirm driver paths ---
ok('driver: confirm driver points at the confirm corpus dir and RUN, not the pilot ones', function () {
  const src = fs.readFileSync(path.join(__dirname, 'talkturn-confirm-driver-20261110.js'), 'utf8');
  assert.ok(src.indexOf('perseed-talkturn-confirm-b') !== -1, 'confirm outDir present');
  assert.ok(src.indexOf("RUN = 'talkturn-confirm'") !== -1, 'confirm RUN default present');
  assert.ok(src.indexOf('talkturn-confirm-s') !== -1, 'confirm file prefix present');
  assert.ok(src.indexOf('perseed-talkturn-a') === -1, 'pilot outDir must not appear');
  assert.ok(src.indexOf("RUN = 'talkturn-pilot'") === -1, 'pilot RUN default must not appear');
});

ok('driver: refuses to overwrite an existing per-seed file (live spawn)', function () {
  const repo = path.join(__dirname, '..');
  const dir = path.join(repo, 'evidence', '2026-11-10', 'perseed-talkturn-confirm-b');
  const file = path.join(dir, 'talkturn-confirm-s150233-talkturn-confirm-armed.json');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, '{}\n');
  try {
    const r = spawnSync(process.execPath, [path.join(__dirname, 'talkturn-confirm-driver-20261110.js')], {
      cwd: repo,
      env: Object.assign({}, process.env, { SEEDS: '150233', RUN: 'talkturn-confirm', TALKTURN_MODE: 'armed', DAYS: '150' }),
      encoding: 'utf8',
      timeout: 60000,
    });
    assert.strictEqual(r.status, 3, 'refuse exit code 3, got ' + r.status + ' stderr=' + (r.stderr || ''));
    assert.ok((r.stderr || '').indexOf('refusing to overwrite') !== -1, 'refuse message present: ' + (r.stderr || ''));
    assert.strictEqual(fs.readFileSync(file, 'utf8'), '{}\n', 'planted file untouched');
  } finally {
    try { fs.unlinkSync(file); } catch (e) {}
    try { fs.rmdirSync(dir); } catch (e) {}
  }
});

console.log('PASS ' + pass + '/' + pass);
