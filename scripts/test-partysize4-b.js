// test-partysize4-b.js — proof test, arm sim-partysize4-b.
// Proves, on synthetic fixtures and live driver runs (no corpus
// numbers): the wave-4 id set; the static lever presence (PARTYSIZE4
// markers, exactly two src files changed vs the frozen prereg, the
// writeCommit companion carry); the analyzer's bars on synthetic
// legs (pool floor, primary quad-fire, trio accounting, no-misfire,
// cost bars) and the size-4 damage-share report; driver determinism
// (pilot seed 105201, 60d, armed, twice) with the mHpStart fix
// verified on expedition encounter rows; and the lever units
// (third-companion pick, trio preservation, winPlanDepart quad,
// brain quad mirror, off-mode, and the dawn-commit carry that lets
// the brain path launch a trio/quad at all). The lever is BUILT on
// this branch (a port of 6f15dbc2b onto current master, carrying the
// partyQuads counter on both launch paths) — the §5 sections run,
// they do not skip. Fixture pattern follows test-vetreengage-a.js
// (the direct precedent for the win-plan / villager-brain method
// calls, which need a hand-built ctx); the repo AGENTS.md shared-kit
// rule is noted as a deliberate deviation for these two modules.
// Usage: node scripts/test-partysize4-b.js
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
  const driver = require(path.join(REPO, 'scripts', 'partysize4-driver-b'));
  check('§0 driver loadWave4Ids matches the frozen 10', eq(driver.loadWave4Ids(), W4_FROZEN));
})();

// ---- §1 static lever presence ----
const winplanSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'win-plan.js'), 'utf8');
const brainSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-brain.js'), 'utf8');
const LEVER = {
  gate: winplanSrc.indexOf('partysize4On') !== -1 && /PARTYSIZE4\s*===\s*'1'/.test(winplanSrc),
  thirdPick: winplanSrc.indexOf('winPlanThirdCompanion') !== -1,
  quadStat: winplanSrc.indexOf('partyQuads') !== -1,
  brainPick: brainSrc.indexOf('companion3') !== -1 && brainSrc.indexOf('winPlanThirdCompanion') !== -1,
  commitCarry: brainSrc.indexOf('companion2: chosen.companion2') !== -1 && brainSrc.indexOf('companion3: chosen.companion3') !== -1,
};
const LEVER_BUILT = LEVER.gate && LEVER.thirdPick && LEVER.quadStat && LEVER.brainPick && LEVER.commitCarry;
function frozenBase() {
  // The frozen base is the prereg commit itself: the lever + instruments
  // land AFTER it, so `git diff <prereg> -- src/js` is exactly the lever.
  try {
    const c = execSync('git log --format=%H --diff-filter=A -- evidence/2026-11-18/sim-partysize4-b-prereg.md', { cwd: REPO }).toString().trim().split('\n')[0];
    if (c) return c;
  } catch (e) {}
  return null;
}
(function section1() {
  if (!LEVER_BUILT) {
    skip('§1 lever static check', 'not-built-yet: ' + JSON.stringify(LEVER));
    return;
  }
  check('§1 win-plan.js carries the PARTYSIZE4 env gate', LEVER.gate);
  check('§1 win-plan.js carries winPlanThirdCompanion', LEVER.thirdPick);
  check('§1 win-plan.js counts partyQuads', LEVER.quadStat);
  check('§1 win-plan.js exposes winPlanExtraCompanion', winplanSrc.indexOf('winPlanExtraCompanion') !== -1);
  check('§1 villager-brain.js carries companion3 through the quad mirror', LEVER.brainPick);
  check('§1 writeCommit carries companion2 + companion3 to the dawn commit', LEVER.commitCarry);
  // No other src/js file carries the lever markers.
  const others = fs.readdirSync(path.join(REPO, 'src', 'js')).filter(function (f) { return f.endsWith('.js'); })
    .filter(function (f) { return ['win-plan.js', 'villager-brain.js'].indexOf(f) === -1; })
    .filter(function (f) { const s = fs.readFileSync(path.join(REPO, 'src', 'js', f), 'utf8'); return s.indexOf('PARTYSIZE4') !== -1 || s.indexOf('winPlanThirdCompanion') !== -1 || s.indexOf('partyQuads') !== -1; });
  check('§1 no other src/js file carries the lever', others.length === 0, others.join(','));
  // The lever touches exactly two src files vs the frozen prereg.
  const base = frozenBase();
  if (!base) { skip('§1 src diff vs frozen base', 'frozen base not found'); return; }
  const names = execSync('git diff --name-only ' + base + ' -- src/js', { cwd: REPO }).toString().trim().split('\n').filter(Boolean).sort();
  check('§1 src/js diff vs frozen prereg is exactly win-plan.js + villager-brain.js',
    eq(names, ['src/js/villager-brain.js', 'src/js/win-plan.js']), JSON.stringify(names));
})();

// ---- §2 analyzer fixtures (synthetic legs) ----
(function section2() {
  const A = require(path.join(REPO, 'scripts', 'analyze-partysize4-b'));
  const os = require('os');
  function seed(o) {
    return {
      seed: o.seed, days: 150, gameDays: o.gameDays || 147, endReason: 'horizon', standing: 120, scaleRank: 'village',
      won: false, maxWave: 4, villageLost: false, instrumentErrors: [],
      winPlanStats: { partyTrios: o.trios || 0, partyQuads: o.quads || 0 },
      v4departs: o.departs || [], dawnbidScores: o.scores || [], v4encounters: o.encounters || [],
      companionPool: o.pool || [], deaths: o.deaths || [], daily: [{ day: 1 }, { day: 147 }],
    };
  }
  // perSeed on a synthetic corpus dir: quad counted, trio counted,
  // wave-3 launch ignored, partySize fallback from party length.
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ps4-analyze-'));
  const dir = path.join(tmp, 'leg');
  fs.mkdirSync(dir);
  const quadSeed = seed({
    seed: 105201, trios: 2, quads: 1,
    departs: [
      { day: 98, vid: 'giulia', result: 'launch', source: 'brain', target: 'strike', targetWave: 4, party: ['yara', 'james', 'omar'], partySize: 4, companion: 'yara', companion2: 'james', companion3: 'omar' },
      { day: 110, vid: 'giulia', result: 'launch', source: 'brain', target: 'eater', targetWave: 4, party: ['yara', 'james'], partySize: 3, companion: 'yara', companion2: 'james' },
      { day: 120, vid: 'giulia', result: 'launch', source: 'brain', target: 'herald', targetWave: 3, party: ['yara'], partySize: 2, companion: 'yara' },
    ],
    encounters: [{ day: 100, vid: 'giulia', mid: 'strike', wave: 4, outcome: 'fled', rounds: 4, mDealt: 180, mHpStart: 900, alliesN: 2, origin: 'expedition' }],
    deaths: [{ day: 40, cause: 'expedition' }],
  });
  fs.writeFileSync(path.join(dir, 's105201.json'), JSON.stringify(quadSeed));
  const rows = A.perSeed(dir);
  check('§2 perSeed counts observed quads 1, trios 2, partyQuads 1',
    rows.length === 1 && rows[0].observedQuads === 1 && rows[0].observedTrios === 2 && rows[0].partyQuads === 1 && rows[0].launches === 2,
    JSON.stringify(rows));
  check('§2 perSeed ignores wave-3 launches', rows[0].launches === 2);
  const w = A.wall(rows);
  check('§2 wall counts wave4 1, wave5 0, wins 0, survived 0 (147d)',
    w.wave4 === 1 && w.wave5 === 0 && w.wins === 0 && w.survived === 0, JSON.stringify(w));
  // size4Shares: the one launched size-4 fought meeting shares 0.2.
  const sh = A.size4Shares(dir);
  check('§2 size4Shares reports the launched size-4 meeting share 0.2',
    sh.n === 1 && sh.fought === 1 && sh.noHp === 0 && sh.mean === 0.2, JSON.stringify(sh));
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
  // judge shapes (synthetic legs, same mkLeg shape as the analyzer selftest).
  function mkLeg(o) {
    return Object.assign({ launches: 8, trioLaunches: 0, trioRate: 0, partyTrios: 0,
      quadLaunches: 0, partyQuads: 0, perSeed: [],
      starvation: 0, starvationVillager: 0, medianDays: 150, errors: 0 }, o);
  }
  function mkSeeds(n) {
    const rws = [];
    for (let i = 0; i < n; i++) rws.push({ seed: 105201 + i, observedQuads: 0, partyQuads: 0, observedTrios: 1, partyTrios: 1 });
    return rws;
  }
  let j = A.judge(
    mkLeg({ trioLaunches: 10, partyTrios: 10, perSeed: mkSeeds(8).map(function (r, i) { return { seed: r.seed, observedQuads: 0, partyQuads: 0, observedTrios: i < 2 ? 2 : 1, partyTrios: i < 2 ? 2 : 1 }; }) }),
    mkLeg({ trioLaunches: 9, partyTrios: 10, quadLaunches: 6, partyQuads: 6,
      perSeed: mkSeeds(8).map(function (r, i) { return { seed: r.seed, observedQuads: i < 6 ? 1 : 0, partyQuads: i < 6 ? 1 : 0, observedTrios: i < 6 ? 2 : 1, partyTrios: i < 6 ? 2 : 1 }; }) }));
  check('§2 judge GO shape (6/6 quads, exact per seed, ctl 0/0)', j.verdict === 'GO' && j.bars.every(function (b) { return b.pass; }), JSON.stringify(j));
  j = A.judge(mkLeg({ perSeed: mkSeeds(8) }),
    mkLeg({ quadLaunches: 0, partyQuads: 0, perSeed: mkSeeds(8) }));
  check('§2 judge NO-QUAD-POOL when no quads launch on either leg', j.verdict === 'NO-GO' && j.kind === 'NO-QUAD-POOL', JSON.stringify(j));
  j = A.judge(mkLeg({ perSeed: mkSeeds(8) }),
    mkLeg({ quadLaunches: 6, partyQuads: 6, perSeed: mkSeeds(8).map(function (r, i) { return { seed: r.seed, observedQuads: i < 6 ? 1 : 0, partyQuads: i < 6 ? 1 : 0, observedTrios: 1, partyTrios: 1 }; }) }));
  check('§2 judge GO even when trio totals move across legs', j.verdict === 'GO', JSON.stringify(j.bars));
  j = A.judge(mkLeg({ perSeed: mkSeeds(8).map(function (r) { return { seed: r.seed, observedQuads: 0, partyQuads: 0, observedTrios: 2, partyTrios: 1 }; }) }),
    mkLeg({ quadLaunches: 6, partyQuads: 6, perSeed: mkSeeds(8).map(function (r, i) { return { seed: r.seed, observedQuads: i < 6 ? 1 : 0, partyQuads: i < 6 ? 1 : 0, observedTrios: 1, partyTrios: 1 }; }) }));
  check('§2 judge NO-GO when trio accounting breaks', j.verdict === 'NO-GO' && !j.bars[3].pass, JSON.stringify(j.bars));
})();

// ---- §4 determinism (live, child processes; armed leg) ----
(function section4() {
  const det1 = 'perseed-partysize4-b-det1';
  const det2 = 'perseed-partysize4-b-det2';
  const dir1 = path.join(REPO, 'evidence', '2026-11-18', det1);
  const dir2 = path.join(REPO, 'evidence', '2026-11-18', det2);
  function runDet(outdir) {
    const r = spawnSync(process.execPath, [path.join(REPO, 'scripts', 'partysize4-driver-b.js')], {
      cwd: REPO,
      env: Object.assign({}, process.env, { VETREENGAGE: '1', PARTYSIZE4: '1', FLEEREPAIR2: '1', SEEDS: '105201', DAYS: '60', MODE: 'arm', RUN: 'partysize4-b-det', OUTDIR: outdir }),
      encoding: 'utf8', timeout: 600000, maxBuffer: 64 * 1024 * 1024,
    });
    if (r.status !== 0) throw new Error('driver exit ' + r.status + ': ' + (r.stderr || r.stdout || '').slice(-2000));
    return r.stdout;
  }
  try {
    runDet(det1);
    runDet(det2);
    const f1 = JSON.parse(fs.readFileSync(path.join(dir1, 'partysize4-b-s105201-partysize4-b-det-arm.json'), 'utf8'));
    const f2 = JSON.parse(fs.readFileSync(path.join(dir2, 'partysize4-b-s105201-partysize4-b-det-arm.json'), 'utf8'));
    const detFields = function (f) {
      return { seed: f.seed, days: f.days, gameDays: f.gameDays, endReason: f.endReason,
        maxWave: f.maxWave, standing: f.standing, deaths: f.deaths,
        daily: (f.daily || []).map(function (s) { return { day: s.day }; }),
        v4seeds: f.v4seeds, v4departs: f.v4departs, v4gates: f.v4gates, v4encounters: f.v4encounters,
        instrumentErrors: f.instrumentErrors };
    };
    check('§4 determinism: seed 105201 60d twice identical (armed)', eq(detFields(f1), detFields(f2)));
    check('§4 determinism run has zero instrument errors', (f1.instrumentErrors || []).length === 0,
      JSON.stringify((f1.instrumentErrors || []).slice(0, 3)));
    check('§4 recorder arrays present on the live run',
      Array.isArray(f1.v4seeds) && Array.isArray(f1.v4departs) && Array.isArray(f1.v4gates) && Array.isArray(f1.v4encounters));
    // The driver fix: expedition-origin encounters must carry the live
    // monster's spawned HP (mHpStart), never null — on rows where a
    // fight actually happened. A no-contact evade (rounds 0, mDealt 0:
    // "saw The Eater in time and gave it room") never spawns a
    // monster — the wrap sees only the def, whose hp is a RANGE
    // [950,1150], never a spawned number — so null there is correct
    // instrument behavior, and the analyzer excludes + counts such
    // rows (missingHp) rather than sharing them.
    const expRows = (f1.v4encounters || []).filter(function (e) { return e.origin === 'expedition'; });
    const foughtRows = expRows.filter(function (e) { return (e.rounds || 0) > 0 || (e.mDealt || 0) > 0; });
    const nullHpFought = foughtRows.filter(function (e) { return e.mHpStart == null; }).length;
    const nullHpEvade = expRows.filter(function (e) { return e.mHpStart == null && (e.rounds || 0) === 0 && (e.mDealt || 0) === 0; }).length;
    check('§4 mHpStart non-null on fought expedition rows (driver fix)', nullHpFought === 0,
      'fought expedition rows=' + foughtRows.length + ' nullHp=' + nullHpFought);
    check('§4 null mHpStart only on no-contact evades (no monster spawned)',
      expRows.filter(function (e) { return e.mHpStart == null; }).length === nullHpEvade,
      'expedition rows=' + expRows.length + ' nullHpEvades=' + nullHpEvade);
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
  // The lever is env-gated: units run with both flags ON; §5e re-runs
  // the same fixtures with PARTYSIZE4 OFF and asserts no quad behavior.
  process.env.VETREENGAGE = '1';
  process.env.PARTYSIZE4 = '1';
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
      npcRangeProfile: function () { return 'explorer'; },
      unlockedWave: function () { return (o.unlockedWave != null) ? o.unlockedWave : 4; },
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
    // winPlanDepart / the brain depart call the extra-companion
    // methods off `this` — a hand-built ctx has no Game methods of
    // its own, so bind the real ones (the trio proof never exercised
    // winPlanDepart, which is why this hole survived: without the
    // binding the depart silently falls back to a pair launch).
    ctx.winPlanSecondCompanion = function (vid, hx, hy, firstCid) { return Game.winPlanSecondCompanion.call(ctx, vid, hx, hy, firstCid); };
    ctx.winPlanThirdCompanion = function (vid, hx, hy, firstCid, secondCid) { return Game.winPlanThirdCompanion.call(ctx, vid, hx, hy, firstCid, secondCid); };
    ctx.winPlanExtraCompanion = function (vid, hx, hy, exclude) { return Game.winPlanExtraCompanion.call(ctx, vid, hx, hy, exclude); };
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

  // 5a. Third companion prefers a living wave-3 killer at Haven,
  // excludes the first two companions, and is gated on wave-4 unlock.
  (function () {
    const people = makePeople({
      v1: { node: [5, 5] }, v2: { node: [5, 5], weaponB: 5, items: [{ id: 'spear' }] },
      v3: { node: [5, 5], weaponB: 5, items: [{ id: 'spear' }] },
      v4: { node: [5, 5], weaponB: 5, items: [{ id: 'spear' }] },
      v5: { node: [5, 5], weaponB: 5, items: [{ id: 'spear' }] },
      v6: { node: [1, 1], weaponB: 5, items: [{ id: 'spear' }] },
    });
    const plan = { stage: 'party', target: 'herald', needWave: 4, node: { nx: 3, ny: 3 }, party: [], sinceDay: 10, holdSinceDay: -1 };
    const ctx = makeCtx({ people: people, trust: { v2: 20, v3: 20, v4: 20, v5: 20, v6: 20 },
      waveKillLog: [{ by: 'v4', w: 3, d: 10, mid: 'redactor', via: 'wild' }],
      winPlan: { v1: plan } });
    const pick = Game.winPlanThirdCompanion.call(ctx, 'v1', 5, 5, 'v2', 'v3');
    check('§5a third companion prefers the living wave-3 killer', pick === 'v4', 'pick=' + pick);
    // Killer dead -> falls to the armed non-killer at Haven (v5; v2/v3 excluded).
    people.v4.dead = true;
    const pick2 = Game.winPlanThirdCompanion.call(ctx, 'v1', 5, 5, 'v2', 'v3');
    check('§5a dead killer falls through to the armed villager', pick2 === 'v5', 'pick=' + pick2);
    // Non-wave-4 plan -> null.
    people.v4.dead = false;
    plan.needWave = 3;
    const pick3 = Game.winPlanThirdCompanion.call(ctx, 'v1', 5, 5, 'v2', 'v3');
    check('§5a non-wave-4 plan gets no third companion', pick3 === null, 'pick=' + pick3);
    // Wave 4 not yet unlocked -> null (earned on the unlock).
    plan.needWave = 4;
    const lockedCtx = makeCtx({ people: people, trust: { v2: 20, v3: 20, v4: 20, v5: 20, v6: 20 }, unlockedWave: 3,
      waveKillLog: [{ by: 'v4', w: 3, d: 10, mid: 'redactor', via: 'wild' }],
      winPlan: { v1: plan } });
    const pick4 = Game.winPlanThirdCompanion.call(lockedCtx, 'v1', 5, 5, 'v2', 'v3');
    check('§5a locked wave-4 door gets no third companion', pick4 === null, 'pick=' + pick4);
    // Scholar never picked.
    people.scholar1 = { id: 'scholar1', name: 'scholar1', dead: false, _armorP: 10, _weaponB: 5, items: [{ id: 'spear' }], node: [5, 5] };
    ctx.state.village.roster.push('scholar1');
    ctx.state.village.trust.scholar1 = 99;
    const pick5 = Game.winPlanThirdCompanion.call(ctx, 'v1', 5, 5, 'v2', 'v3');
    check('§5a scholar is never picked as third companion', pick5 === 'v4', 'pick=' + pick5);
  })();

  // 5b. Trio preservation: winPlanSecondCompanion returns the same
  // picks as before the shared-scan refactor.
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
    check('§5b second companion still prefers the living wave-3 killer', pick === 'v3', 'pick=' + pick);
    people.v3.dead = true;
    const pick2 = Game.winPlanSecondCompanion.call(ctx, 'v1', 5, 5, 'v2');
    check('§5b dead killer skipped, no other eligible at Haven -> null', pick2 === null, 'pick=' + pick2);
    people.v3.dead = false;
    plan.needWave = 3;
    const pick3 = Game.winPlanSecondCompanion.call(ctx, 'v1', 5, 5, 'v2');
    check('§5b non-wave-4 plan still gets no second companion', pick3 === null, 'pick=' + pick3);
  })();

  // 5c. winPlanDepart quad: staged plan + 3 eligible companions ->
  // party of 3 on one target, partyQuads bumped; blocked third -> trio.
  (function () {
    function departCtx(blockV4) {
      const exped = {};
      const people = makePeople({
        v1: { node: [5, 5] },
        v2: { node: [5, 5], weaponB: 5, items: [{ id: 'spear' }] },
        v3: { node: [5, 5], weaponB: 5, items: [{ id: 'spear' }] },
        v4: { node: [5, 5], weaponB: 5, items: [{ id: 'spear' }] },
        v5: { node: [5, 5], weaponB: 5, items: [{ id: 'spear' }] },
      });
      const plan = { stage: 'party', target: 'herald', needWave: 4, node: { nx: 3, ny: 3 }, party: [], sinceDay: 10, holdSinceDay: -1 };
      const ctx = makeCtx({ people: people, exped: exped, trust: { v2: 20, v3: 20, v4: 20, v5: 20 },
        waveKillLog: [{ by: 'v3', w: 3, d: 10, mid: 'redactor', via: 'wild' }],
        winPlan: { v1: plan } });
      ctx.startExpedition = function (vid, hx, hy, announce, opts) {
        if (blockV4 && vid === 'v4') return; // blocked: no expedition starts
        exped[vid] = { tx: opts.tx, ty: opts.ty, duration: opts.duration };
      };
      return { ctx: ctx, plan: plan, exped: exped };
    }
    const a = departCtx(false);
    const r1 = Game.winPlanDepart.call(a.ctx, 'v1', 5, 5, false);
    const quads1 = (Game.winPlanStats.call(a.ctx) || {}).partyQuads || 0;
    check('§5c winPlanDepart launches a quad on one target',
      r1 === 'launch' && !!a.exped.v1 && !!a.exped.v2 && !!a.exped.v3 && !!a.exped.v4 &&
      a.exped.v1.tx === a.exped.v2.tx && a.exped.v2.tx === a.exped.v3.tx && a.exped.v3.tx === a.exped.v4.tx &&
      a.exped.v1.tx === 3 && a.exped.v1.ty === 3 &&
      a.plan.party.length === 3 && a.plan.party.indexOf('v2') !== -1 && a.plan.party.indexOf('v3') !== -1 && a.plan.party.indexOf('v4') !== -1 &&
      quads1 === 1,
      JSON.stringify({ r: r1, exped: Object.keys(a.exped), party: a.plan.party, quads: quads1 }));
    // Mirror record: the third companion's plan lists the whole party.
    const cplan3 = a.ctx.winPlanOf('v4');
    check('§5c third companion mirror plan lists the quad', cplan3.stage === 'hunt' && eq(cplan3.party, ['v1', 'v2', 'v3']),
      JSON.stringify({ stage: cplan3.stage, party: cplan3.party }));
    const b = departCtx(true);
    const r2 = Game.winPlanDepart.call(b.ctx, 'v1', 5, 5, false);
    const quads2 = (Game.winPlanStats.call(b.ctx) || {}).partyQuads || 0;
    check('§5c blocked third companion falls back to a trio launch',
      r2 === 'launch' && !!b.exped.v1 && !!b.exped.v2 && !!b.exped.v3 && !b.exped.v4 &&
      b.plan.party.length === 2 && b.plan.party.indexOf('v2') !== -1 && b.plan.party.indexOf('v3') !== -1 && quads2 === 0,
      JSON.stringify({ r: r2, exped: Object.keys(b.exped), party: b.plan.party, quads: quads2 }));
  })();

  // 5d. Brain quad mirror: launches vid + companion + companion2 +
  // companion3 on one target; falls back to a trio.
  (function () {
    function brainCtx(blockV4) {
      const exped = {};
      const people = makePeople({ v1: { node: [5, 5] }, v2: { node: [5, 5] }, v3: { node: [5, 5] }, v4: { node: [5, 5] } });
      const plan1 = { stage: 'party', target: 'herald', needWave: 4, node: { nx: 3, ny: 3 }, party: [], sinceDay: 10, holdSinceDay: -1 };
      const plan2 = { stage: 'gear', target: null, node: null, party: [], sinceDay: 0, holdSinceDay: -1 };
      const plan3 = { stage: 'gear', target: null, node: null, party: [], sinceDay: 0, holdSinceDay: -1 };
      const plan4 = { stage: 'gear', target: null, node: null, party: [], sinceDay: 0, holdSinceDay: -1 };
      const commit = { kind: 'EXPEDITION', winPlanAction: 'party_launch', companion: 'v2', companion2: 'v3', companion3: 'v4', day: 60 };
      const ctx = makeCtx({ people: people, exped: exped,
        winPlan: { v1: plan1, v2: plan2, v3: plan3, v4: plan4 },
        vbrain: { commit: { v1: commit }, perception: {}, logs: [], stats: { picks: 0, gates: 0, expeditions: 0, winPlan: 0 } } });
      ctx.startExpedition = function (vid, hx, hy, announce, opts) {
        if (blockV4 && vid === 'v4') return; // blocked: no expedition starts
        exped[vid] = { tx: opts.tx, ty: opts.ty, duration: opts.duration };
      };
      return { ctx: ctx, plan1: plan1, exped: exped };
    }
    const a = brainCtx(false);
    const r1 = Game.vbrainExecuteDepart.call(a.ctx, 'v1', 5, 5, false);
    check('§5d brain quad mirror launches all four on one target',
      r1 === 'launch' && !!a.exped.v1 && !!a.exped.v2 && !!a.exped.v3 && !!a.exped.v4 &&
      a.exped.v1.tx === a.exped.v2.tx && a.exped.v2.tx === a.exped.v3.tx && a.exped.v3.tx === a.exped.v4.tx &&
      a.plan1.party.length === 3 && a.plan1.party.indexOf('v2') !== -1 && a.plan1.party.indexOf('v3') !== -1 && a.plan1.party.indexOf('v4') !== -1,
      JSON.stringify({ r: r1, exped: Object.keys(a.exped), party: a.plan1.party }));
    const b = brainCtx(true);
    const r2 = Game.vbrainExecuteDepart.call(b.ctx, 'v1', 5, 5, false);
    check('§5d blocked third companion falls back to a trio launch',
      r2 === 'launch' && !!b.exped.v1 && !!b.exped.v2 && !!b.exped.v3 && !b.exped.v4 &&
      b.plan1.party.length === 2 && b.plan1.party.indexOf('v2') !== -1 && b.plan1.party.indexOf('v3') !== -1,
      JSON.stringify({ r: r2, exped: Object.keys(b.exped), party: b.plan1.party }));
  })();

  // 5e. Off-mode: with PARTYSIZE4 unset, no quad behavior anywhere.
  (function () {
    delete process.env.PARTYSIZE4;
    const people = makePeople({
      v1: { node: [5, 5] }, v2: { node: [5, 5], weaponB: 5, items: [{ id: 'spear' }] },
      v3: { node: [5, 5], weaponB: 5, items: [{ id: 'spear' }] },
      v4: { node: [5, 5], weaponB: 5, items: [{ id: 'spear' }] },
    });
    const plan = { stage: 'party', target: 'herald', needWave: 4, node: { nx: 3, ny: 3 }, party: [], sinceDay: 10, holdSinceDay: -1 };
    const ctx = makeCtx({ people: people, trust: { v2: 20, v3: 20, v4: 20 },
      waveKillLog: [{ by: 'v4', w: 3, d: 10, mid: 'redactor', via: 'wild' }],
      winPlan: { v1: plan } });
    check('§5e off-mode: third companion is null with the flag unset',
      Game.winPlanThirdCompanion.call(ctx, 'v1', 5, 5, 'v2', 'v3') === null);
    // The second-companion pick is untouched by the flag.
    check('§5e off-mode: second companion still picks (trio substrate intact)',
      Game.winPlanSecondCompanion.call(ctx, 'v1', 5, 5, 'v2') === 'v4');
    // Brain mirror off-mode: companion3 in the commit is ignored (trio only).
    const exped = {};
    const bpeople = makePeople({ v1: { node: [5, 5] }, v2: { node: [5, 5] }, v3: { node: [5, 5] }, v4: { node: [5, 5] } });
    const bplan1 = { stage: 'party', target: 'herald', needWave: 4, node: { nx: 3, ny: 3 }, party: [], sinceDay: 10, holdSinceDay: -1 };
    const bplan2 = { stage: 'gear', target: null, node: null, party: [], sinceDay: 0, holdSinceDay: -1 };
    const bplan3 = { stage: 'gear', target: null, node: null, party: [], sinceDay: 0, holdSinceDay: -1 };
    const bplan4 = { stage: 'gear', target: null, node: null, party: [], sinceDay: 0, holdSinceDay: -1 };
    const bcommit = { kind: 'EXPEDITION', winPlanAction: 'party_launch', companion: 'v2', companion2: 'v3', companion3: 'v4', day: 60 };
    const bctx = makeCtx({ people: bpeople, exped: exped,
      winPlan: { v1: bplan1, v2: bplan2, v3: bplan3, v4: bplan4 },
      vbrain: { commit: { v1: bcommit }, perception: {}, logs: [], stats: { picks: 0, gates: 0, expeditions: 0, winPlan: 0 } } });
    bctx.startExpedition = function (vid, hx, hy, announce, opts) { exped[vid] = { tx: opts.tx, ty: opts.ty, duration: opts.duration }; };
    const br = Game.vbrainExecuteDepart.call(bctx, 'v1', 5, 5, false);
    check('§5e off-mode: brain mirror ignores companion3 (trio launch)',
      br === 'launch' && !!exped.v1 && !!exped.v2 && !!exped.v3 && !exped.v4 && bplan1.party.length === 2 && bplan1.party.indexOf('v2') !== -1 && bplan1.party.indexOf('v3') !== -1,
      JSON.stringify({ r: br, exped: Object.keys(exped), party: bplan1.party }));
    // Restore the flag for any later live work in this process.
    process.env.PARTYSIZE4 = '1';
  })();

  // 5f. Commit carry: the dawn scorer must carry the picked extra
  // companions through writeCommit, or the brain depart can never
  // launch them (the probe found 7 c2 picks, 0 trio launches, because
  // the whitelist dropped companion2). This is the hole the trio
  // proof never exercised: it set the commit directly.
  (function () {
    function scoreCtx(candExtras) {
      const people = makePeople({ v1: { node: [5, 5] }, v2: { node: [5, 5] }, v3: { node: [5, 5] }, v4: { node: [5, 5] } });
      const ctx = makeCtx({ people: people });
      const core = { kind: 'HAVEN_CHORE', w: 0.1 };
      const extra = Object.assign({ kind: 'EXPEDITION', vbrainSrc: 'win_plan', winPlanAction: 'party_launch', companion: 'v2', w: 1 }, candExtras);
      Game.vbrainScorePick.call(ctx, 'v1', [core, extra], {});
      return Game.vbrainCommit.call(ctx, 'v1');
    }
    const full = scoreCtx({ companion2: 'v3', companion3: 'v4' });
    check('§5f commit carries companion2 + companion3 from the scored candidate',
      !!full && full.companion === 'v2' && full.companion2 === 'v3' && full.companion3 === 'v4' && full.winPlanAction === 'party_launch',
      JSON.stringify(full));
    // Trio-only candidate (PARTYSIZE4 off at scoring): companion2
    // carries, companion3 stays null.
    const trio = scoreCtx({ companion2: 'v3' });
    check('§5f trio candidate commits companion2, companion3 null',
      !!trio && trio.companion2 === 'v3' && trio.companion3 == null,
      JSON.stringify(trio));
    // Pair candidate (VETREENGAGE off at scoring): no extra companions.
    const pair = scoreCtx({});
    check('§5f pair candidate commits no extra companions',
      !!pair && pair.companion2 == null && pair.companion3 == null,
      JSON.stringify(pair));
  })();
})();

console.log('test-partysize4-b: passed ' + passed + ', failed ' + failed + ', skipped ' + skipped +
  (LEVER_BUILT ? ' (lever built)' : ' (lever not-built-yet)'));
if (failed) { console.log(notes.join('\n')); process.exitCode = 1; }
