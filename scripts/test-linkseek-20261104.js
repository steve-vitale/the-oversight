// test-linkseek-20261104.js — proof for the linkseek instrument +
// analyzer (arm sim-linkseek-b). Fixture tests for the tight say
// filter, the offer-point table, the critical-path stall rule and
// the stall-majority judge, plus a live harness smoke test
// (install + snapshot shape + 2-day competent run, 0 instrument
// errors, convoTurn 0 under default env) and a determinism leg
// (LINKSEEK_FINGERPRINT=1 prints a 2-day fingerprint; run twice
// in separate processes and diff — never two harnesses in one
// process).
// Usage: node scripts/test-linkseek-20261104.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const AN = require(path.join(REPO, 'scripts', 'linkseek-analyze-20261104'));
const INST = require(path.join(REPO, 'scripts', 'linkseek-instrument-20261104'));

let pass = 0, fail = 0;
function eq(name, got, want) {
  const g = JSON.stringify(got), w = JSON.stringify(want);
  if (g === w) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + ' got=' + g + ' want=' + w); }
}
function baseOut(over) {
  return Object.assign({
    seed: 1, policy: 'competent', run: 'test', anchorCommit: 'test',
    days: 10, endReason: 'horizon', won: false, villageLost: false,
    scaleRank: 'village', maxWave: 1, endUnlockedWave: 1, endCallMovedPeak: false,
    daily: [], proposalEvents: [], courtshipEvents: [], decisionEvents: [],
    convoEvents: [], travelCalls: [],
    linkFormedEvents: [], deathEvents: [], sayLines: [], wrapCounts: {},
    instrumentErrors: [],
  }, over || {});
}
function snap(day, ovs, extra) {
  return Object.assign({ day: day, tile: { x: 4, y: 4 }, insideHaven: true,
    ovs: ovs, onVillageTile: null, linkFunnel: { total: 0, active: 0, seasoned: 0, regionalPlus: 0, seasonedNotRegional: 0, detail: [] },
    linkTotal: 0, everFormed: 0,
    pending: { counter: false, accord: false, national: false, global: false, raid: false, aidOffer: false, aidBeg: false, counterDetail: null },
    standing: null, capped: null, peak: null, scaleRank: 'village', readiness5: { ready: false },
    w4faced: false, w5faced: false, roster: [], livingCount: 3, pantryKcal: 10000 }, extra || {});
}
function ov(id, known, opinion) {
  return { id: id, name: id, x: 1, y: 1, opinion: opinion, known: known, generated: true,
    rumored: false, isSplinter: false, parentVillage: null, codexGiven: false, allied: false, linkWith: null };
}

// 1-8. Tight say filter: matches the brief's patterns + link lines,
// rejects the pantry noise standaccum found.
eq('say matches Standing N', INST.SAY_RE.test('Standing 210 (war 150)'), true);
eq('say matches FEAST', INST.SAY_RE.test('FEAST hosted by Mara'), true);
eq('say matches HELD', INST.SAY_RE.test('HELD at wave 4: the fifth draft waits'), true);
eq('say matches draft waits', INST.SAY_RE.test('the draft waits for veterans'), true);
eq('say matches link line bows', INST.SAY_RE.test('Diana brings it home: The Hungry Road bows to Haven'), true);
eq('say matches Tribute:', INST.SAY_RE.test('Tribute: 4,000 kcal/week'), true);
eq('say matches Word will travel', INST.SAY_RE.test('Word will travel: Haven is clean hands'), true);
eq('say rejects pantry standing', INST.SAY_RE.test('Mara leaves the fish nets standing'), false);
eq('say rejects blink', INST.SAY_RE.test('the watcher does not blink'), false);
eq('say rejects bare bond noise', INST.SAY_RE.test('a keepsake bond with her brother'), false);

// 9. Stall S1: villages exist, none known.
eq('stall S1', AN.summarizeSeed(baseOut({ daily: [snap(1, [ov('v1', false, 0)])] })).stall, 'S1');
// 10. Stall S4: known, opinion 12, zero offer points.
eq('stall S4', AN.summarizeSeed(baseOut({ daily: [snap(1, [ov('v1', true, 12)])] })).stall, 'S4');
// 11. Stall S4 despite S2+S3 context: tile day + opinion 12, no offers.
// (Critical path ignores S2/S3 by design — travel is not a prerequisite.)
eq('stall S4 ignores S2/S3', AN.summarizeSeed(baseOut({
  daily: [snap(1, [ov('v1', true, 12)], { onVillageTile: 'v1' })],
})).stall, 'S4');
// 12. Stall S4-refused: propose fired, null return, no link/judged.
eq('stall S4-refused', AN.summarizeSeed(baseOut({
  daily: [snap(1, [ov('v1', true, 12)])],
  proposalEvents: [{ day: 1, fn: 'proposeLink', target: 'v1', ret: null }],
})).stall, 'S4-refused');
// 13. Stall S5-declined: propose judged (non-null), no link.
eq('stall S5-declined', AN.summarizeSeed(baseOut({
  daily: [snap(1, [ov('v1', true, 12)])],
  proposalEvents: [{ day: 1, fn: 'proposeLink', target: 'v1', ret: { score: 30 } }],
})).stall, 'S5-declined');
// 14. Pending counter with no answering call counts as an offer point.
eq('pending-unanswered counts', AN.summarizeSeed(baseOut({
  daily: [snap(1, [ov('v1', true, 12)], { pending: { counter: true, accord: false, national: false, global: false, raid: false, aidOffer: false, aidBeg: false, counterDetail: null } })],
})).offerPoints.pendingUnanswered, 1);
eq('stall S4-refused via pending', AN.summarizeSeed(baseOut({
  daily: [snap(1, [ov('v1', true, 12)], { pending: { counter: true, accord: false, national: false, global: false, raid: false, aidOffer: false, aidBeg: false, counterDetail: null } })],
})).stall, 'S4-refused');
// 15. Convo link menu counts as an offer point; aid answers do not.
eq('convo link menu counts', AN.summarizeSeed(baseOut({
  daily: [snap(1, [ov('v1', true, 12)])],
  convoEvents: [{ day: 2, fn: 'convoTurn', target: 'v1', pick: 'ask', menuIds: ['ask', 'bond:offer'] }],
})).offerPoints.convoLinkMenus, 1);
eq('aid answers excluded', AN.summarizeSeed(baseOut({
  daily: [snap(1, [ov('v1', true, 12)])],
  decisionEvents: [{ day: 2, fn: 'answerAidOffer', target: null, ret: 'accepted' }, { day: 3, fn: 'answerAidBeg', target: null, ret: 'gave' }],
})).offerPoints.total, 0);
// 16. firstKnownDay / firstOpinion10Day from snapshots.
eq('firstKnownDay', AN.summarizeSeed(baseOut({ daily: [
  snap(1, [ov('v1', false, null)]), snap(3, [ov('v1', true, 2)]), snap(5, [ov('v1', true, 12)])] })).firstKnownDay, 3);
eq('firstOpinion10Day', AN.summarizeSeed(baseOut({ daily: [
  snap(1, [ov('v1', false, null)]), snap(3, [ov('v1', true, 2)]), snap(5, [ov('v1', true, 12)])] })).firstOpinion10Day, 5);
// 17. judgeGo: 6/8 same stall + 0 errors -> DIAG-GO.
eq('judgeGo stall majority', AN.judgeGo([
  { stall: 'S4', instrumentErrors: 0, ovAtDay1: 3 }, { stall: 'S4', instrumentErrors: 0, ovAtDay1: 3 },
  { stall: 'S4', instrumentErrors: 0, ovAtDay1: 3 }, { stall: 'S4', instrumentErrors: 0, ovAtDay1: 3 },
  { stall: 'S4', instrumentErrors: 0, ovAtDay1: 3 }, { stall: 'S4', instrumentErrors: 0, ovAtDay1: 3 },
  { stall: 'S1', instrumentErrors: 0, ovAtDay1: 3 }, { stall: 'S4', instrumentErrors: 0, ovAtDay1: 3 },
]).verdict, 'DIAG-GO');
// 18. judgeGo: same stall but an instrument error -> clause 2 fails.
eq('judgeGo error blocks GO', AN.judgeGo([
  { stall: 'S4', instrumentErrors: 1, ovAtDay1: 3 }, { stall: 'S4', instrumentErrors: 0, ovAtDay1: 3 },
  { stall: 'S4', instrumentErrors: 0, ovAtDay1: 3 }, { stall: 'S4', instrumentErrors: 0, ovAtDay1: 3 },
  { stall: 'S4', instrumentErrors: 0, ovAtDay1: 3 }, { stall: 'S4', instrumentErrors: 0, ovAtDay1: 3 },
  { stall: 'S4', instrumentErrors: 0, ovAtDay1: 3 }, { stall: 'S4', instrumentErrors: 0, ovAtDay1: 3 },
]).verdict, 'DIAG-NO-CANDIDATE');
// 19. judgeGo: > 2 bad seeds -> INSUFFICIENT-DATA.
eq('judgeGo insufficient', AN.judgeGo([
  { stall: 'S4', instrumentErrors: 1, ovAtDay1: 3 }, { stall: 'S4', instrumentErrors: 1, ovAtDay1: 3 },
  { stall: 'S4', instrumentErrors: 1, ovAtDay1: 3 }, { stall: 'S4', instrumentErrors: 0, ovAtDay1: 3 },
  { stall: 'S4', instrumentErrors: 0, ovAtDay1: 3 }, { stall: 'S4', instrumentErrors: 0, ovAtDay1: 3 },
  { stall: 'S4', instrumentErrors: 0, ovAtDay1: 3 }, { stall: 'S4', instrumentErrors: 0, ovAtDay1: 3 },
]).verdict, 'INSUFFICIENT-DATA');
// 20. judgeGo: scattered stalls -> DIAG-NO-CANDIDATE.
eq('judgeGo scattered', AN.judgeGo([
  { stall: 'S4', instrumentErrors: 0, ovAtDay1: 3 }, { stall: 'S1', instrumentErrors: 0, ovAtDay1: 3 },
  { stall: 'S4', instrumentErrors: 0, ovAtDay1: 3 }, { stall: 'S1', instrumentErrors: 0, ovAtDay1: 3 },
  { stall: 'S4', instrumentErrors: 0, ovAtDay1: 3 }, { stall: 'S1', instrumentErrors: 0, ovAtDay1: 3 },
  { stall: 'S4', instrumentErrors: 0, ovAtDay1: 3 }, { stall: 'S1', instrumentErrors: 0, ovAtDay1: 3 },
]).verdict, 'DIAG-NO-CANDIDATE');

async function smoke() {
  const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
  const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
  const { Game } = await loadGame({ seed: 12345, mode: 'linkseek-smoke', fullTelemetry: false });
  await setupGame(Game);
  const inst = INST.install(Game);
  const s0 = inst.snapshot();
  return { Game: Game, inst: inst, s0: s0, run: async function () {
    await quietLog(async function () { await runDays(Game, competent, { days: 2, manifest: undefined, sampleEvery: 30 }); });
  } };
}

(async function () {
  try {
    if (process.env.LINKSEEK_FINGERPRINT === '1') {
      const { inst, s0, run } = await smoke();
      await run();
      inst.snapshot();
      console.log(JSON.stringify({ seed: 12345, day1ovs: (s0.ovs || []).length,
        talkTo: inst.t.wrapCounts.talkTo || 0, convoTurn: inst.t.wrapCounts.convoTurn || 0,
        errors: inst.t.instrumentErrors.length, snaps: inst.t.daily.length }));
      inst.uninstall();
      return;
    }
    const { inst, s0, run } = await smoke();
    eq('smoke snapshot ovs array', Array.isArray(s0.ovs), true);
    eq('smoke snapshot ovs non-empty', (s0.ovs || []).length > 0, true);
    eq('smoke snapshot pending raid/aid fields', (s0.pending && 'raid' in s0.pending && 'aidOffer' in s0.pending), true);
    eq('smoke snapshot linkTotal/everFormed', (typeof s0.linkTotal === 'number' && typeof s0.everFormed === 'number'), true);
    await run();
    inst.snapshot();
    eq('smoke instrument errors zero', inst.t.instrumentErrors.length, 0);
    eq('smoke talkTo exercised', (inst.t.wrapCounts.talkTo || 0) >= 1, true);
    eq('smoke convoTurn zero default env', inst.t.wrapCounts.convoTurn || 0, 0);
    eq('smoke no offer points in 2 days', AN.offerPoints({ decisionEvents: inst.t.decisionEvents, convoEvents: inst.t.convoEvents, courtshipEvents: inst.t.courtshipEvents, proposalEvents: inst.t.proposalEvents, daily: inst.t.daily }).total, 0);
    inst.uninstall();
  } catch (e) {
    fail++;
    console.log('FAIL live smoke: ' + (e && e.stack ? e.stack.slice(0, 500) : e));
  }
  console.log('TOTAL ' + pass + ' pass, ' + fail + ' fail');
  process.exitCode = fail ? 1 : 0;
})().catch(function (e) { console.log('FAIL harness: ' + e.stack); process.exitCode = 1; });
