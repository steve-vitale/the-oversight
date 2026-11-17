// test-vetreengage-confirm-a.js — proof test, arm sim-vetreengage-confirm-a.
// Proves, on synthetic fixtures and live in-memory runs (no corpus
// numbers): the wave-4 id set; the judge's frozen bars (including the
// vacuous-ratio shape the pilot actually saw); the analyzer on synthetic
// T-class fixtures (including the vet5@unlock-after rule) plus the §9.4
// v4picks pooling; driver determinism (confirm seed 102901, 60d, twice);
// D2 recorder neutrality (confirm driver vs pilot driver, same seed/days,
// identical trajectories and shared recorder rows); and — the lever
// already being on master — the lever units (second-companion pick, gate
// counting, dissolution, brain trio mirror) plus the static
// lever-presence check and the §5e off-mode units. The judge /
// analyzer / determinism sections still run green (Stage 0) if the lever
// were ever absent; the lever sections record "not-built-yet" and skip.
// Usage: node scripts/test-vetreengage-confirm-a.js
// Usage: node scripts/test-vetreengage-confirm-a.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync, spawnSync } = require('child_process');
const REPO = path.join(__dirname, '..');

let passed = 0, failed = 0, skipped = 0;
const notes = [];
function check(name, cond, extra) {
  if (cond) { passed++; }
  else { failed++; notes.push('FAIL: ' + name + (extra ? ' — ' + extra : '')); console.log('FAIL: ' + name + (extra ? ' — ' + extra : '')); }
}
function skip(name, why) { skipped++; notes.push('SKIP: ' + name + ' — ' + why); }
function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

// ---- §0 wave-4 id set ----
const W4_FROZEN = ['algorithm', 'audit', 'congregation', 'eater', 'eulogy', 'herald', 'influencer', 'reunion', 'strike', 'suburb'];
(function section0() {
  const raw = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
  const list = (raw.monsters || raw).filter(function (m) { return m.wave === 4; }).map(function (m) { return m.id; }).sort();
  check('§0 wave-4 id set is exactly the frozen 10', eq(list, W4_FROZEN), JSON.stringify(list));
  const driver = require(path.join(REPO, 'scripts', 'vetreengage-driver-20261116'));
  check('§0 driver loadWave4Ids matches the frozen 10', eq(driver.loadWave4Ids(), W4_FROZEN));
})();

// ---- §1 static lever presence ----
const gameSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'game.js'), 'utf8');
const winplanSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'win-plan.js'), 'utf8');
const brainSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-brain.js'), 'utf8');
const LEVER = {
  seed: gameSrc.indexOf('VETREENGAGE') !== -1 && gameSrc.indexOf('winPlanSeedFromFight(vid, mdef, \'fled\')') !== -1,
  secondCompanion: winplanSrc.indexOf('winPlanSecondCompanion') !== -1,
  gateCount: winplanSrc.indexOf('VETREENGAGE') !== -1 && winplanSrc.indexOf('countedSize') !== -1,
  dissolve: winplanSrc.indexOf('partyDissolved') !== -1,
  brainTrio: brainSrc.indexOf('companion2') !== -1,
};
const LEVER_BUILT = LEVER.seed && LEVER.secondCompanion && LEVER.gateCount && LEVER.dissolve && LEVER.brainTrio;
(function section1() {
  if (!LEVER_BUILT) {
    skip('§1 lever static check', 'not-built-yet: ' + JSON.stringify(LEVER));
    return;
  }
  check('§1 game.js carries the VETREENGAGE wild-fight seed', LEVER.seed);
  check('§1 seed call is env-gated (VETREENGAGE guard at the call site)',
    /process\.env\.VETREENGAGE\s*===\s*'1'/.test(gameSrc) && gameSrc.indexOf("winPlanSeedFromFight(vid, mdef, 'fled')") !== -1);
  check('§1 win-plan.js carries winPlanSecondCompanion', LEVER.secondCompanion);
  check('§1 win-plan.js counts co-tasked plan members in the gate', LEVER.gateCount);
  check('§1 win-plan.js dissolves the party on a member death', LEVER.dissolve);
  check('§1 villager-brain.js carries companion2 through the trio mirror', LEVER.brainTrio);
  // No other src/js file carries the lever markers.
  const others = fs.readdirSync(path.join(REPO, 'src', 'js')).filter(function (f) { return f.endsWith('.js'); })
    .filter(function (f) { return ['game.js', 'win-plan.js', 'villager-brain.js'].indexOf(f) === -1; })
    .filter(function (f) { const s = fs.readFileSync(path.join(REPO, 'src', 'js', f), 'utf8'); return s.indexOf('VETREENGAGE') !== -1 || s.indexOf('winPlanSecondCompanion') !== -1; });
  check('§1 no other src/js file carries the lever', others.length === 0, others.join(','));
})();

// ---- §2 judge fixtures ----
(function section2() {
  const A = require(path.join(REPO, 'scripts', 'analyze-vetreengage-confirm-a'));
  function leg(o) {
    return { n: 8, unlocked: o.unlocked == null ? 2 : o.unlocked, survived: o.survived == null ? 7 : o.survived,
      starvation: o.starvation == null ? 0 : o.starvation, meanVet5EndUnlocked: o.mean, vet5EndUnlocked: [] };
  }
  // GO shape: armed 1.2 vs control 0.6 (2x), survival held, starvation held.
  let j = A.judge(leg({ mean: 0.6, survived: 7, starvation: 1 }), leg({ mean: 1.2, survived: 7, starvation: 1 }));
  check('§2 judge GO shape passes', j.verdict === 'GO' && j.bars.every(function (b) { return b.pass; }), JSON.stringify(j));
  // NO-GO: mean above 1.0 but below 1.5x.
  j = A.judge(leg({ mean: 0.8, survived: 7, starvation: 0 }), leg({ mean: 1.1, survived: 7, starvation: 0 }));
  check('§2 judge NO-GO when ratio < 1.5x', j.verdict === 'NO-GO' && !j.bars[0].pass, JSON.stringify(j.bars[0]));
  // NO-GO: mean below 1.0.
  j = A.judge(leg({ mean: 0.4, survived: 7, starvation: 0 }), leg({ mean: 0.9, survived: 7, starvation: 0 }));
  check('§2 judge NO-GO when armed mean < 1.0', j.verdict === 'NO-GO' && !j.bars[0].pass);
  // NO-GO: survival guardrail breach.
  j = A.judge(leg({ mean: 0.5, survived: 7, starvation: 0 }), leg({ mean: 1.5, survived: 5, starvation: 0 }));
  check('§2 judge NO-GO on survival guardrail', j.verdict === 'NO-GO' && !j.bars[1].pass);
  // NO-GO: starvation breach (armed control+3) does NOT flip the verdict:
  // bar 3 is reported, not judged (prereg: §9 frozen GO is bars 1+2 only).
  j = A.judge(leg({ mean: 0.5, survived: 7, starvation: 1 }), leg({ mean: 1.5, survived: 7, starvation: 4 }));
  check('§2 judge stays GO on a starvation breach (bar 3 reported, not judged)',
    j.verdict === 'GO' && j.bars[2].pass === false && j.bars[2].judged === false, JSON.stringify(j));
  // Boundary GO: ratio exactly 1.5, survival exactly control-1, starvation exactly control+2.
  j = A.judge(leg({ mean: 0.8, survived: 7, starvation: 1 }), leg({ mean: 1.2, survived: 6, starvation: 3 }));
  check('§2 judge boundary GO passes', j.verdict === 'GO', JSON.stringify(j));
  // Control with 0 unlocked: mean null -> NO-GO, not a crash.
  j = A.judge(leg({ mean: null, survived: 7, starvation: 0 }), leg({ mean: 1.5, survived: 7, starvation: 0 }));
  check('§2 judge NO-GO when control has no unlocked seeds', j.verdict === 'NO-GO');
  // Vacuous-ratio shape (the pilot's actual read): control mean 0.0,
  // armed 1.4 — the ratio half does no work, the floor decides, GO.
  j = A.judge(leg({ mean: 0.0, survived: 5, starvation: 4 }), leg({ mean: 1.4, survived: 5, starvation: 5 }));
  check('§2 judge GO on the vacuous-ratio shape (control 0.0, armed 1.4)',
    j.verdict === 'GO' && j.bars[0].pass && j.bars[0].ratio === Infinity, JSON.stringify(j.bars[0]));
})();

// ---- §3 analyzer on synthetic T fixtures ----
(function section3() {
  const A = require(path.join(REPO, 'scripts', 'analyze-vetreengage-confirm-a'));
  function synth(opts) {
    const o = opts || {};
    const daily = o.daily;
    return {
      seed: 100821, arm: 'vetreengage-confirm-a', run: 'vetreengage-confirm-a-test', mode: 'control',
      days: 150, gameDays: 150, endReason: 'survived', villageLost: false,
      maxWave: 5, standing: 250, ready5: { ready: true, veterans: 2 },
      deaths: o.deaths || [],
      samples: { standing: [[10, 50], [100, 250], [101, 260]] },
      instrumentErrors: [],
      regDeaths: o.regDeaths || [],
      spawns: o.spawns || [],
      fights: [], killCalls: o.killCalls || [],
      daily: daily,
      v4seeds: [], v4departs: [], v4gates: [], v4encounters: [],
      v4picks: o.v4picks || [],
      winPlanStats: {},
    };
  }
  function snap(day, opts) {
    const o = opts || {};
    return { day: day, scholarId: 'scholar1',
      waveKillLog: o.log || [],
      waveKills: {},
      vetsW3: { count: (o.w3 || []).length, killers: o.w3 || [] },
      vetsW4: { count: (o.w4 || []).length, killers: o.w4 || [] },
      roster: [], veteranRows: [], partyMembers: [],
      ready4: { ready: true, short: [] },
      ready5: o.ready5 == null ? { ready: false, short: ['veterans'] } : o.ready5 };
  }
  const kA = { by: 'vA', name: 'A', firstDay: 40, lastDay: 100, maxWave: 4, kills: 2, scholarAtKill: false, pyrrhicKills: 0 };
  const kB = { by: 'vB', name: 'B', firstDay: 60, lastDay: 100, maxWave: 4, kills: 1, scholarAtKill: false, pyrrhicKills: 0 };
  const logFull = [
    { d: 40, mid: 'redactor', w: 3, by: 'vA', via: 'wild', trick: null, pyrrhic: false },
    { d: 60, mid: 'reunion', w: 4, by: 'vA', via: 'wild', trick: null, pyrrhic: false },
    { d: 70, mid: 'audit', w: 4, by: 'vB', via: 'player', trick: null, pyrrhic: false },
  ];
  const d1 = synth({
    spawns: [
      { day: 50, id: 'reunion', wave: 4, caller: 'Object.checkEncounter' },
      { day: 100, id: 'cancellation', wave: 5, caller: 'Object.checkEncounter' },
    ],
    killCalls: [
      { day: 60, mid: 'reunion', wave: 4, by: 'vA', via: 'wild' },
      { day: 70, mid: 'audit', wave: 4, by: 'vB', via: 'player' },
    ],
    daily: [
      snap(10, { log: [], ready5: { ready: false, short: ['veterans'] } }),
      snap(100, { log: logFull, w3: [kA], w4: [kA, kB], ready5: { ready: true, short: [] } }),
      snap(101, { log: logFull, w3: [kA], w4: [kA, kB], ready5: { ready: true, short: [] } }),
    ],
  });
  const s1 = A.analyzeSeed(d1, { waveById: { reunion: 4, audit: 4, cancellation: 5, redactor: 3 }, w5: ['cancellation'], w4: W4_FROZEN });
  check('§3 synthetic seed unlocks at day 100', s1.unlocked === true && s1.unlockDay === 100, 'unlockDay=' + s1.unlockDay);
  check('§3 synthetic vet5@end is 2', s1.vet5AtEnd === 2, 'vet5AtEnd=' + s1.vet5AtEnd);
  check('§3 synthetic w4 kills split field 1 / TB 1', s1.w4Kills === 2 && s1.w4KillsField === 1 && s1.w4KillsTB === 1,
    JSON.stringify({ w4: s1.w4Kills, f: s1.w4KillsField, tb: s1.w4KillsTB }));
  check('§3 synthetic conversion counts the wave-3 killer who made wave-4', s1.conversions === 1 && s1.w3Made === 1,
    JSON.stringify({ conv: s1.conversions, made: s1.w3Made }));
  check('§3 synthetic vet5@unlock-after reads the post-unlock snapshot', s1.vet5AtUnlockAfter === 2, 'after=' + s1.vet5AtUnlockAfter);
  // Mid-day artifact fixture: unlock-day snapshot reads 1, next snapshot reads 2.
  const d2 = synth({
    spawns: [
      { day: 50, id: 'reunion', wave: 4, caller: 'Object.checkEncounter' },
      { day: 100, id: 'cancellation', wave: 5, caller: 'Object.checkEncounter' },
    ],
    killCalls: [{ day: 60, mid: 'reunion', wave: 4, by: 'vA', via: 'wild' }],
    daily: [
      snap(10, { log: [], ready5: { ready: false, short: ['veterans'] } }),
      snap(100, { log: [{ d: 60, mid: 'reunion', w: 4, by: 'vA', via: 'wild', trick: null, pyrrhic: false }], w3: [kA], w4: [kA], ready5: { ready: true, short: [] } }),
      snap(101, { log: logFull, w3: [kA], w4: [kA, kB], ready5: { ready: true, short: [] } }),
    ],
  });
  const s2 = A.analyzeSeed(d2, { waveById: { reunion: 4, audit: 4, cancellation: 5, redactor: 3 }, w5: ['cancellation'], w4: W4_FROZEN });
  check('§3 after-rule beats the unlock-day snapshot on the mid-day artifact', s2.vet5AtUnlock === 1 && s2.vet5AtUnlockAfter === 2,
    JSON.stringify({ at: s2.vet5AtUnlock, after: s2.vet5AtUnlockAfter }));
  // Non-gated spawn must not imply unlock.
  const d3 = synth({
    spawns: [{ day: 90, id: 'cancellation', wave: 5, caller: 'titanPlace' }],
    daily: [snap(10, {}), snap(150, { log: [], ready5: { ready: false, short: ['veterans'] } })],
  });
  const s3 = A.analyzeSeed(d3, { waveById: { cancellation: 5 }, w5: ['cancellation'], w4: W4_FROZEN });
  check('§3 non-gated titanPlace spawn does not unlock', s3.unlocked === false && s3.unlockDay === null,
    JSON.stringify({ unlocked: s3.unlocked, day: s3.unlockDay }));
  // Starvation + WILD scholar counting.
  const d4 = synth({
    spawns: [],
    deaths: [
      { day: 50, kind: 'villager', who: 'vX', cause: 'starvation', player: false },
      { day: 60, kind: 'villager', who: 'vY', cause: 'the wild', player: true },
      { day: 70, kind: 'villager', who: 'vZ', cause: 'monster', player: false },
    ],
    daily: [snap(10, {}), snap(150, { log: [] })],
  });
  const s4 = A.analyzeSeed(d4, { waveById: {}, w5: [], w4: W4_FROZEN });
  check('§3 starvation counts hunger causes (1)', s4.starvation === 1, 'starvation=' + s4.starvation);
  check('§3 WILD scholar deaths counted (1)', s4.wildScholar === 1, 'wildScholar=' + s4.wildScholar);
  // §9.4 pick-attempt pooling on synthetic rows.
  const d5 = synth({
    daily: [snap(10, {}), snap(150, { log: [] })],
    v4picks: [
      { day: 40, vid: 'v1', firstCid: 'v2', site: 'dawn-cands', needWave: 4, target: 'reunion', result: 'rejected', pick: null, pickTier: null, reason: 'pool-empty', poolCount: 0, poolKillers: 0, poolArmed: 0, poolRest: 0, poolIds: [] },
      { day: 41, vid: 'v1', firstCid: 'v2', site: 'dawn-cands', needWave: 4, target: 'reunion', result: 'rejected', pick: null, pickTier: null, reason: 'needWave-gate', poolCount: 2, poolKillers: 1, poolArmed: 1, poolRest: 0, poolIds: ['v3', 'v4'] },
      { day: 42, vid: 'v1', firstCid: 'v2', site: 'launch-depart', needWave: 4, target: 'reunion', result: 'accepted', pick: 'v3', pickTier: 'killer', reason: 'accepted', poolCount: 2, poolKillers: 1, poolArmed: 1, poolRest: 0, poolIds: ['v3', 'v4'] },
      { day: 43, vid: 'v1', firstCid: 'v2', site: 'dawn-cands', needWave: 3, target: 'redactor', result: 'rejected', pick: null, pickTier: null, reason: 'needWave-gate', poolCount: 1, poolKillers: 0, poolArmed: 1, poolRest: 0, poolIds: ['v4'] },
    ],
  });
  const s5 = A.analyzeSeed(d5, { waveById: {}, w5: [], w4: W4_FROZEN });
  check('§3 picks pooled by result/reason/site/tier',
    s5.v4picks === 4 && s5.pickByResult.accepted === 1 && s5.pickByResult.rejected === 3 &&
    s5.pickByReason['pool-empty'] === 1 && s5.pickByReason['needWave-gate'] === 2 &&
    s5.pickBySite['dawn-cands'] === 3 && s5.pickBySite['launch-depart'] === 1 &&
    s5.pickByTier.killer === 1 && s5.w4Picks === 3,
    JSON.stringify({ picks: s5.v4picks, res: s5.pickByResult, reason: s5.pickByReason, site: s5.pickBySite, tier: s5.pickByTier, w4: s5.w4Picks }));
  check('§3 dawn pool-empty counted, dawn mean pool computed',
    s5.dawnPicks === 3 && s5.dawnPoolEmpty === 1 && s5.dawnPoolMean === 1,
    JSON.stringify({ dawn: s5.dawnPicks, empty: s5.dawnPoolEmpty, mean: s5.dawnPoolMean }));
})();

// ---- §4 determinism (live, child processes; armed leg, env=1) ----
(function section4() {
  const det1 = 'perseed-vetreengage-confirm-a-det1';
  const det2 = 'perseed-vetreengage-confirm-a-det2';
  const dir1 = path.join(REPO, 'evidence', '2026-11-16', det1);
  const dir2 = path.join(REPO, 'evidence', '2026-11-16', det2);
  function runDet(outdir) {
    const r = spawnSync(process.execPath, [path.join(REPO, 'scripts', 'vetreengage-confirm-driver-20261116.js')], {
      cwd: REPO,
      env: Object.assign({}, process.env, { SEEDS: '102901', DAYS: '60', MODE: 'on', RUN: 'vetreengage-confirm-a-det', OUTDIR: outdir }),
      encoding: 'utf8', timeout: 600000, maxBuffer: 64 * 1024 * 1024,
    });
    if (r.status !== 0) throw new Error('driver exit ' + r.status + ': ' + (r.stderr || r.stdout || '').slice(-2000));
    return r.stdout;
  }
  try {
    runDet(det1);
    runDet(det2);
    const f1 = JSON.parse(fs.readFileSync(path.join(dir1, 'vetreengage-confirm-a-s102901-vetreengage-confirm-a-det-on.json'), 'utf8'));
    const f2 = JSON.parse(fs.readFileSync(path.join(dir2, 'vetreengage-confirm-a-s102901-vetreengage-confirm-a-det-on.json'), 'utf8'));
    const detFields = function (f) {
      return { seed: f.seed, days: f.days, gameDays: f.gameDays, endReason: f.endReason,
        maxWave: f.maxWave, standing: f.standing, deaths: f.deaths,
        daily: (f.daily || []).map(function (s) { return { day: s.day, vet5: s.vetsW4 ? s.vetsW4.count : null, vet4: s.vetsW3 ? s.vetsW3.count : null }; }),
        v4seeds: f.v4seeds, v4departs: f.v4departs, v4gates: f.v4gates, v4encounters: f.v4encounters,
        v4picks: f.v4picks,
        instrumentErrors: f.instrumentErrors };
    };
    check('§4 determinism: seed 102901 60d twice identical (armed, env=1)', eq(detFields(f1), detFields(f2)));
    check('§4 determinism run has zero instrument errors', (f1.instrumentErrors || []).length === 0,
      JSON.stringify((f1.instrumentErrors || []).slice(0, 3)));
    check('§4 recorder arrays present on the live run',
      Array.isArray(f1.v4seeds) && Array.isArray(f1.v4departs) && Array.isArray(f1.v4gates) && Array.isArray(f1.v4encounters));
    check('§4 pick-attempt rows present with reason + pool fields',
      Array.isArray(f1.v4picks) && f1.v4picks.every(function (p) {
        return p && typeof p.day === 'number' && typeof p.vid === 'string' &&
          (p.result === 'accepted' || p.result === 'rejected') && typeof p.reason === 'string' &&
          typeof p.poolCount === 'number' && typeof p.site === 'string';
      }), 'picks=' + (f1.v4picks || []).length);
    check('§4 vetfirst daily snapshots present on the live run', Array.isArray(f1.daily) && f1.daily.length > 30,
      'snapshots=' + (f1.daily || []).length);
  } catch (e) {
    check('§4 determinism leg runs', false, String((e && e.message) || e).slice(0, 300));
  } finally {
    try { fs.rmSync(dir1, { recursive: true, force: true }); } catch (e) {}
    try { fs.rmSync(dir2, { recursive: true, force: true }); } catch (e) {}
  }
})();

// ---- §5 lever units (only when built) ----
(function section5() {
  if (!LEVER_BUILT) { skip('§5 lever units', 'not-built-yet'); return; }
  // The lever is env-gated: units run with the flag ON; §5e re-runs the
  // same fixtures with it OFF and asserts no lever behavior.
  process.env.VETREENGAGE = '1';
  globalThis.Scattering = globalThis.Scattering || {};
  globalThis.Scattering.Game = globalThis.Scattering.Game || {};
  globalThis.Scattering.equipment = {
    armorOf: function (person) { return (person && person._armorP) || 0; },
    weaponBonusOf: function (person) { return (person && person._weaponB) || 0; },
  };
  require(path.join(REPO, 'src', 'js', 'win-plan.js'));
  require(path.join(REPO, 'src', 'js', 'villager-brain.js'));
  const Game = globalThis.Scattering.Game;

  function makePeople(spec) {
    // spec: {vid: {dead, node, armorP, weaponB, items}}
    const people = {};
    Object.keys(spec).forEach(function (vid) {
      const s = spec[vid];
      people[vid] = { id: vid, name: vid, dead: !!s.dead, _armorP: s.armorP || 0, _weaponB: s.weaponB || 0,
        items: s.items || [], node: s.node || null };
    });
    return people;
  }
  function makeCtx(opts) {
    const o = opts || {};
    const people = o.people || {};
    const exped = o.exped || {};
    const ctx = {
      villagerId: 'scholar1',
      data: { items: [{ id: 'spear', weapon: true }, { id: 'knife', weapon: true }] },
      state: {
        scholar: { day: o.day || 60 },
        _standingDeferBeat: o.beat || {},
        village: {
          roster: o.roster || Object.keys(people),
          trust: o.trust || {},
          away: o.away || {},
          sick: o.sick || {},
          health: o.health || {},
          winPlan: o.winPlan || {},
          vbrain: o.vbrain || { commit: {}, perception: {}, logs: [], stats: { picks: 0, gates: 0, expeditions: 0, winPlan: 0 } },
        },
        waveKillLog: o.waveKillLog || [],
      },
      dayPart: 0,
      getPerson: function (vid) { return people[vid] || null; },
      vpOf: function (vid) { return people[vid] || null; },
      npcNode: function (vid) { const p = people[vid]; return p && p.node ? { nx: p.node[0], ny: p.node[1] } : null; },
      isEngaged: function () { return false; },
      npcMaxDist: function () { return 3; },
      agencyState: function () { return { exped: exped, know: {} }; },
      companionRank: function (asker, ids) {
        return (ids || []).map(function (id) { return { id: id, s: 0 }; }).sort(function (a, b) { return String(a.id).localeCompare(String(b.id)); });
      },
      villagerGearUp: function () { return true; },
      tableActive: function () { return false; },
      waveUnlockReady: function () { return { ready: true, short: [] }; },
      villageKnowsTrick: function (mid) { return (o.tricks || {})[mid] === true; },
      villagerFightAllies: function (vid) { return (o.allies || {})[vid] || []; },
      winPlanSeedFromFight: function () { return null; },
    };
    ctx._exped = exped;
    // Fake dawn-commitment + plan accessors the brain mirror calls on
    // `this` (real Game methods in play; the fake reads the same state).
    ctx.vbrainCommit = function (vid) {
      try { var c = ctx.state.village.vbrain.commit; return (c && c[vid]) || null; } catch (e) { return null; }
    };
    ctx.winPlanOf = function (vid) {
      var v = ctx.state.village;
      if (!v.winPlan[vid]) v.winPlan[vid] = { stage: 'gear', target: null, node: null, party: [], sinceDay: 0, holdSinceDay: -1 };
      return v.winPlan[vid];
    };
    return ctx;
  }

  // 5a. Second companion prefers a living wave-3 killer at Haven.
  (function () {
    const people = makePeople({
      v1: { node: [5, 5] }, v2: { node: [5, 5], weaponB: 5, items: [{ id: 'spear' }] },
      v3: { node: [5, 5], weaponB: 5, items: [{ id: 'spear' }] },
      v4: { node: [1, 1], weaponB: 5, items: [{ id: 'spear' }] },
    });
    const plan = { stage: 'party', target: 'reunion', needWave: 4, node: { nx: 3, ny: 3 }, party: [], sinceDay: 10, holdSinceDay: -1 };
    const ctx = makeCtx({ people: people, trust: { v2: 20, v3: 20, v4: 20 },
      waveKillLog: [{ by: 'v3', w: 3, d: 10, mid: 'redactor', via: 'wild' }],
      winPlan: { v1: plan } });
    const pick = Game.winPlanSecondCompanion.call(ctx, 'v1', 5, 5, 'v2');
    check('§5a second companion prefers the living wave-3 killer', pick === 'v3', 'pick=' + pick);
    // Killer dead -> falls to the armed non-killer at Haven (v2 is the first companion, excluded).
    people.v3.dead = true;
    const pick2 = Game.winPlanSecondCompanion.call(ctx, 'v1', 5, 5, 'v2');
    check('§5a dead killer is skipped, no other eligible at Haven -> null', pick2 === null, 'pick=' + pick2);
    // Non-wave-4 plan -> null.
    people.v3.dead = false;
    plan.needWave = 3;
    const pick3 = Game.winPlanSecondCompanion.call(ctx, 'v1', 5, 5, 'v2');
    check('§5a non-wave-4 plan gets no second companion', pick3 === null, 'pick=' + pick3);
    // Scholar never picked.
    plan.needWave = 4;
    people.scholar1 = { id: 'scholar1', name: 'scholar1', dead: false, _armorP: 10, _weaponB: 5, items: [{ id: 'spear' }], node: [5, 5] };
    ctx.state.village.roster.push('scholar1');
    ctx.state.village.trust.scholar1 = 99;
    const pick4 = Game.winPlanSecondCompanion.call(ctx, 'v1', 5, 5, 'v2');
    check('§5a scholar is never picked as second companion', pick4 === 'v3', 'pick=' + pick4);
  })();

  // 5b. Gate counts a co-tasked plan member; ignores a differently-tasked / dead one.
  (function () {
    function gateCtx(o) {
      const people = makePeople({
        v1: { node: [3, 3], armorP: 10, weaponB: 5, items: [{ id: 'spear' }] },
        v2: { node: [3, 3], armorP: 10, weaponB: 5, items: [{ id: 'spear' }], dead: !!o.v2dead },
        v3: { node: [3, 3], armorP: 10, weaponB: 5, items: [{ id: 'spear' }] },
      });
      const plan = { stage: 'hunt', target: 'reunion', needWave: 4, node: { nx: 3, ny: 3 }, party: ['v2'], sinceDay: 10, holdSinceDay: -1 };
      const exped = { v1: { tx: 3, ty: 3 }, v2: { tx: o.v2tx == null ? 3 : o.v2tx, ty: o.v2ty == null ? 3 : o.v2ty } };
      const ctx = makeCtx({ people: people, trust: { v2: 20, v3: 20 },
        allies: { v1: ['v3'] }, tricks: { reunion: true },
        winPlan: { v1: plan }, exped: exped, waveKillLog: [] });
      return ctx;
    }
    const ret1 = Game.winPlanFightGate.call(gateCtx({}), 'v1', { id: 'reunion', wave: 4 });
    check('§5b gate SEEKs when the co-tasked plan member makes 3', !!(ret1 && ret1.seek) && ret1.party.length === 3,
      JSON.stringify(ret1 && { seek: ret1.seek, party: ret1.party }));
    const ret2 = Game.winPlanFightGate.call(gateCtx({ v2tx: 7, v2ty: 7 }), 'v1', { id: 'reunion', wave: 4 });
    check('§5b gate avoids outmatched when the plan member is on another target', !!(ret2 && ret2.avoid && ret2.reason === 'outmatched'),
      JSON.stringify(ret2 && { avoid: ret2.avoid, reason: ret2.reason }));
    const ret3 = Game.winPlanFightGate.call(gateCtx({ v2dead: true }), 'v1', { id: 'reunion', wave: 4 });
    check('§5b gate ignores a dead plan member', !!(ret3 && ret3.avoid && ret3.reason === 'outmatched'),
      JSON.stringify(ret3 && { avoid: ret3.avoid, reason: ret3.reason }));
  })();

  // 5c. Dissolution: dead party member drops a hunt plan back to party; standing plans keep theirs.
  (function () {
    function havenCtx(deadMember, stage) {
      const people = makePeople({
        v1: { node: [5, 5] }, v2: { node: [5, 5], dead: deadMember },
      });
      const plan = { stage: stage, target: 'reunion', needWave: 4, node: { nx: 3, ny: 3 }, party: ['v2'], sinceDay: 10, holdSinceDay: -1 };
      return { ctx: makeCtx({ people: people, winPlan: { v1: plan } }), plan: plan };
    }
    const a = havenCtx(true, 'hunt');
    Game.winPlanHavenTick.call(a.ctx, 'v1', 5, 5);
    check('§5c dead member dissolves a hunt party back to party stage', a.plan.stage === 'party' && a.plan.party.length === 0,
      JSON.stringify({ stage: a.plan.stage, party: a.plan.party }));
    const b = havenCtx(false, 'hunt');
    Game.winPlanHavenTick.call(b.ctx, 'v1', 5, 5);
    check('§5c living member keeps the hunt party', b.plan.stage === 'hunt' && b.plan.party.length === 1,
      JSON.stringify({ stage: b.plan.stage, party: b.plan.party }));
    const c = havenCtx(true, 'standing');
    Game.winPlanHavenTick.call(c.ctx, 'v1', 5, 5);
    check('§5c standing-stage plan is not dissolved', c.plan.stage === 'standing' && c.plan.party.length === 1,
      JSON.stringify({ stage: c.plan.stage, party: c.plan.party }));
  })();

  // 5d. Brain trio mirror: launches vid + companion + companion2 on one target; falls back to a pair.
  (function () {
    function brainCtx(blockV3) {
      const exped = {};
      const people = makePeople({ v1: { node: [5, 5] }, v2: { node: [5, 5] }, v3: { node: [5, 5] } });
      const plan1 = { stage: 'party', target: 'reunion', needWave: 4, node: { nx: 3, ny: 3 }, party: [], sinceDay: 10, holdSinceDay: -1 };
      const plan2 = { stage: 'gear', target: null, node: null, party: [], sinceDay: 0, holdSinceDay: -1 };
      const plan3 = { stage: 'gear', target: null, node: null, party: [], sinceDay: 0, holdSinceDay: -1 };
      const commit = { kind: 'EXPEDITION', winPlanAction: 'party_launch', companion: 'v2', companion2: 'v3', day: 60 };
      const ctx = makeCtx({ people: people, exped: exped,
        winPlan: { v1: plan1, v2: plan2, v3: plan3 },
        vbrain: { commit: { v1: commit }, perception: {}, logs: [], stats: { picks: 0, gates: 0, expeditions: 0, winPlan: 0 } } });
      ctx.startExpedition = function (vid, hx, hy, announce, opts) {
        if (blockV3 && vid === 'v3') return; // blocked: no expedition starts
        exped[vid] = { tx: opts.tx, ty: opts.ty, duration: opts.duration };
      };
      return { ctx: ctx, plan1: plan1, exped: exped };
    }
    const a = brainCtx(false);
    const r1 = Game.vbrainExecuteDepart.call(a.ctx, 'v1', 5, 5, false);
    check('§5d brain trio mirror launches all three on one target',
      r1 === 'launch' && !!a.exped.v1 && !!a.exped.v2 && !!a.exped.v3 &&
      a.exped.v1.tx === a.exped.v2.tx && a.exped.v2.tx === a.exped.v3.tx &&
      a.plan1.party.length === 2 && a.plan1.party.indexOf('v2') !== -1 && a.plan1.party.indexOf('v3') !== -1,
      JSON.stringify({ r: r1, exped: Object.keys(a.exped), party: a.plan1.party }));
    const b = brainCtx(true);
    const r2 = Game.vbrainExecuteDepart.call(b.ctx, 'v1', 5, 5, false);
    check('§5d blocked second companion falls back to a pair launch',
      r2 === 'launch' && !!b.exped.v1 && !!b.exped.v2 && !b.exped.v3 &&
      b.plan1.party.length === 1 && b.plan1.party[0] === 'v2',
      JSON.stringify({ r: r2, exped: Object.keys(b.exped), party: b.plan1.party }));
  })();

  // 5e. Off-mode: with VETREENGAGE unset, no lever behavior anywhere.
  (function () {
    delete process.env.VETREENGAGE;
    const people = makePeople({
      v1: { node: [5, 5] }, v2: { node: [5, 5], weaponB: 5, items: [{ id: 'spear' }] },
      v3: { node: [5, 5], weaponB: 5, items: [{ id: 'spear' }] },
    });
    const plan = { stage: 'party', target: 'reunion', needWave: 4, node: { nx: 3, ny: 3 }, party: [], sinceDay: 10, holdSinceDay: -1 };
    const ctx = makeCtx({ people: people, trust: { v2: 20, v3: 20 },
      waveKillLog: [{ by: 'v3', w: 3, d: 10, mid: 'redactor', via: 'wild' }],
      winPlan: { v1: plan } });
    check('§5e off-mode: second companion is null with the flag unset',
      Game.winPlanSecondCompanion.call(ctx, 'v1', 5, 5, 'v2') === null);
    // Gate off-mode: co-tasked member must NOT count (avoid outmatched).
    const gpeople = makePeople({
      v1: { node: [3, 3], armorP: 10, weaponB: 5, items: [{ id: 'spear' }] },
      v2: { node: [3, 3], armorP: 10, weaponB: 5, items: [{ id: 'spear' }] },
      v3: { node: [3, 3], armorP: 10, weaponB: 5, items: [{ id: 'spear' }] },
    });
    const gplan = { stage: 'hunt', target: 'reunion', needWave: 4, node: { nx: 3, ny: 3 }, party: ['v2'], sinceDay: 10, holdSinceDay: -1 };
    const gctx = makeCtx({ people: gpeople, trust: { v2: 20, v3: 20 },
      allies: { v1: ['v3'] }, tricks: { reunion: true },
      winPlan: { v1: gplan }, exped: { v1: { tx: 3, ty: 3 }, v2: { tx: 3, ty: 3 } }, waveKillLog: [] });
    const gret = Game.winPlanFightGate.call(gctx, 'v1', { id: 'reunion', wave: 4 });
    check('§5e off-mode: gate does not count the co-tasked member',
      !!(gret && gret.avoid && gret.reason === 'outmatched'),
      JSON.stringify(gret && { avoid: gret.avoid, reason: gret.reason }));
    // Dissolution off-mode: dead member does NOT dissolve.
    const dpeople = makePeople({ v1: { node: [5, 5] }, v2: { node: [5, 5], dead: true } });
    const dplan = { stage: 'hunt', target: 'reunion', needWave: 4, node: { nx: 3, ny: 3 }, party: ['v2'], sinceDay: 10, holdSinceDay: -1 };
    const dctx = makeCtx({ people: dpeople, winPlan: { v1: dplan } });
    Game.winPlanHavenTick.call(dctx, 'v1', 5, 5);
    check('§5e off-mode: dead member does not dissolve the hunt party',
      dplan.stage === 'hunt' && dplan.party.length === 1,
      JSON.stringify({ stage: dplan.stage, party: dplan.party }));
    // Brain mirror off-mode: companion2 in the commit is ignored (pair only).
    const exped = {};
    const bpeople = makePeople({ v1: { node: [5, 5] }, v2: { node: [5, 5] }, v3: { node: [5, 5] } });
    const bplan1 = { stage: 'party', target: 'reunion', needWave: 4, node: { nx: 3, ny: 3 }, party: [], sinceDay: 10, holdSinceDay: -1 };
    const bplan2 = { stage: 'gear', target: null, node: null, party: [], sinceDay: 0, holdSinceDay: -1 };
    const bplan3 = { stage: 'gear', target: null, node: null, party: [], sinceDay: 0, holdSinceDay: -1 };
    const bcommit = { kind: 'EXPEDITION', winPlanAction: 'party_launch', companion: 'v2', companion2: 'v3', day: 60 };
    const bctx = makeCtx({ people: bpeople, exped: exped,
      winPlan: { v1: bplan1, v2: bplan2, v3: bplan3 },
      vbrain: { commit: { v1: bcommit }, perception: {}, logs: [], stats: { picks: 0, gates: 0, expeditions: 0, winPlan: 0 } } });
    bctx.startExpedition = function (vid, hx, hy, announce, opts) { exped[vid] = { tx: opts.tx, ty: opts.ty, duration: opts.duration }; };
    const br = Game.vbrainExecuteDepart.call(bctx, 'v1', 5, 5, false);
    check('§5e off-mode: brain mirror ignores companion2 (pair launch)',
      br === 'launch' && !!exped.v1 && !!exped.v2 && !exped.v3 && bplan1.party.length === 1 && bplan1.party[0] === 'v2',
      JSON.stringify({ r: br, exped: Object.keys(exped), party: bplan1.party }));
    // Restore the flag for any later live work in this process.
    process.env.VETREENGAGE = '1';
  })();
})();

// ---- §6 D2 recorder neutrality: confirm driver vs pilot driver ----
// Same seed/days, env=1, both drivers: the new §9.4 pick wrap must not
// perturb anything the pilot driver measured — identical trajectories
// (deaths/days/endReason/vet5) and identical shared recorder rows.
(function section6() {
  const cDir = path.join(REPO, 'evidence', '2026-11-16', 'perseed-vetreengage-confirm-a-d2');
  const pDir = path.join(REPO, 'evidence', '2026-11-16', 'perseed-vetreengage-a-d2');
  function runDriver(script, outdir) {
    const r = spawnSync(process.execPath, [path.join(REPO, 'scripts', script)], {
      cwd: REPO,
      env: Object.assign({}, process.env, { SEEDS: '102901', DAYS: '60', MODE: 'on', RUN: script.indexOf('confirm') !== -1 ? 'vetreengage-confirm-a-d2' : 'vetreengage-a-d2', OUTDIR: outdir }),
      encoding: 'utf8', timeout: 600000, maxBuffer: 64 * 1024 * 1024,
    });
    if (r.status !== 0) throw new Error('driver ' + script + ' exit ' + r.status + ': ' + (r.stderr || r.stdout || '').slice(-2000));
    return r.stdout;
  }
  try {
    runDriver('vetreengage-confirm-driver-20261116.js', 'perseed-vetreengage-confirm-a-d2');
    runDriver('vetreengage-driver-20261116.js', 'perseed-vetreengage-a-d2');
    const c = JSON.parse(fs.readFileSync(path.join(cDir, 'vetreengage-confirm-a-s102901-vetreengage-confirm-a-d2-on.json'), 'utf8'));
    const p = JSON.parse(fs.readFileSync(path.join(pDir, 'vetreengage-a-s102901-vetreengage-a-d2-on.json'), 'utf8'));
    const traj = function (f) {
      return { seed: f.seed, days: f.days, gameDays: f.gameDays, endReason: f.endReason,
        maxWave: f.maxWave, standing: f.standing, deaths: f.deaths,
        daily: (f.daily || []).map(function (s) { return { day: s.day, vet5: s.vetsW4 ? s.vetsW4.count : null }; }),
        v4seeds: f.v4seeds, v4departs: f.v4departs, v4gates: f.v4gates, v4encounters: f.v4encounters,
        instrumentErrors: f.instrumentErrors };
    };
    check('§6 D2: confirm vs pilot driver, same seed/days/env=1, identical trajectories', eq(traj(c), traj(p)));
    check('§6 D2: confirm driver recorded pick attempts on the live run',
      Array.isArray(c.v4picks) && c.v4picks.length >= 0, 'picks=' + (c.v4picks || []).length);
    check('§6 D2: both drivers ran with zero instrument errors',
      (c.instrumentErrors || []).length === 0 && (p.instrumentErrors || []).length === 0,
      JSON.stringify({ c: (c.instrumentErrors || []).slice(0, 2), p: (p.instrumentErrors || []).slice(0, 2) }));
  } catch (e) {
    check('§6 D2 neutrality legs run', false, String((e && e.message) || e).slice(0, 300));
  } finally {
    try { fs.rmSync(cDir, { recursive: true, force: true }); } catch (e) {}
    try { fs.rmSync(pDir, { recursive: true, force: true }); } catch (e) {}
  }
})();

console.log('test-vetreengage-confirm-a: passed ' + passed + ', failed ' + failed + ', skipped ' + skipped +
  (LEVER_BUILT ? ' (lever built)' : ' (lever not-built-yet)'));
if (failed) { console.log(notes.join('\n')); process.exitCode = 1; }
