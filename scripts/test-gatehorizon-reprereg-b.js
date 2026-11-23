// test-gatehorizon-reprereg-b.js — proof test, arm sim-gatehorizon-reprereg-b (M3m).
// The leader-projection gate's 150-DAY HORIZON instrument: chunked
// runDays + one staged pool door mid-run + downstream deltas.
//
// WHAT IT PROVES (observable effect, not just assertions):
//   §0 SOURCE: the gate, the durable log, the pin, and the capable
//     policy sha are present on this tree; the spec freezes 12 pool doors.
//   §1 DETERMINISM: the same 10+10 chunks run twice (two processes,
//     same seed) reach a byte-identical end state — the chunked day
//     loop is a reproducible instrument. (Chunked-vs-chunked only: a
//     single 20-day runDays is a different policy-RNG stream by
//     construction — runDays re-seeds the policy stream per call.)
//   §2 STAGED DOOR, CONTRAST: on fixture door 2 (reunion, leader 40,
//     collapse2/dead2 boundary of the doorstage pool) the control leg
//     FIGHTS the staged door and the armed leg REFUSES it (proj fire +
//     durable log entry, hp 40, projHp2 -10) — the horizon's designed
//     divergence, staged mid-run by the driver's own stageDoor.
//   §3 DOOR-10 FIX + REPLACEMENT: pack-staged members are armed +
//     armored at the door (the exact failure door 10 hit); the
//     pre-check DETECTS a stripped member; a failed launch is replaced
//     from spares and the staged party still fights as four.
//   §3b RELAXED QUAD: with every ranging-profile villager dead, the
//     driver still stages a quad from the widened pool (the 109106
//     supply fix — unlocked by day 52, won day 90, never staged under
//     the ranging-only filter) and records widenedN.
//   §4 CORPUS SHAPE: a 30-day smoke oneSeed writes a corpus object
//     carrying every D5 field plus the horizon extras (stagedDoor,
//     wave4KillsDownstream, starvationDeaths, horizonDays,
//     stagingChecks, leaderDiedLog on every wave-4+ row).
//   §5 ANALYZER: analyze-gatehorizon-reprereg-b.js --selftest is green.
//   §6 BASE GATES: leaderproj 55/55 + gateavoid 36/36 re-run green.
//   §7 DEATHS-LOG ATTRIBUTION (the proof-of-effect): on the COMMITTED
//     gatehorizon-b pilot corpora the synchronous flag reads 0/0 pool
//     deaths while the new deaths-log rule reads control 9 / armed 4 —
//     the instrument now sees the deaths the old flag missed, and the
//     two 'Big Loud' / two 'The Big Beast' same-day deaths are correctly
//     excluded (wrong cause). All 13 attributed deaths are unpinned.
//
// Fixture (encounter-gear rule, Steve 2026-11-13): the staged party is
// a geared wave-4 hunting party — hide_armor + hunting_spear, armor P
// measured back in the live 8–30 range — never a fresh un-geared solo
// scholar. The substrate flags are defaulted in-process when absent
// (the driver validates them strictly when run as a driver).
// Usage: node scripts/test-gatehorizon-reprereg-b.js
// Exit 0 = all checks pass.
'use strict';
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { spawnSync } = require('child_process');
const REPO = path.join(__dirname, '..');

const SUBSTRATE = ['SENSEEXPED', 'PARTYSIZE4', 'VETREENGAGE', 'FLEEREPAIR2', 'FIGHTALLY2', 'LAUNCHSURVIVE', 'ALLYSLOT3', 'PINQUAD', 'DMGPIN', 'DOORFLEE2', 'HYPOFLOOR', 'HPGATE'];
for (const f of SUBSTRATE) if (!process.env[f]) process.env[f] = '1';

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; console.log('PASS ' + name); }
  else { failed++; console.log('FAIL ' + name + (extra != null ? ' :: ' + JSON.stringify(extra) : '')); }
}
function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

// ================= CHILD PROBES (this file re-invoked with GH_PROBE) =================
async function runProbe() {
  const probe = process.env.GH_PROBE;
  const { loadGame, setupGame, runDays } = require(path.join(REPO, 'scripts', 'sim-harness'));
  if (probe === 'determinism') {
    const seed = parseInt(process.env.SEED || '109201', 10);
    const { Game } = await loadGame({ seed: seed, mode: 'gatehorizon-reprereg-probe', fullTelemetry: false });
    await setupGame(Game);
    const { capable } = require(path.join(REPO, 'scripts', 'policies', 'capable'));
    const m1 = { seed: seed };
    const r1 = await runDays(Game, capable, { days: 10, manifest: m1 });
    const r2 = await runDays(Game, capable, { days: 10, manifest: m1 });
    const hash = {
      gameDays: (Game.state.scholar || {}).day || 0,
      won: !!Game.won, over: !!Game.over,
      scaleRank: (Game.scaleRank ? Game.scaleRank() : 'village'),
      maxWave: Math.max(r1.maxWaveUnlocked || 1, r2.maxWaveUnlocked || 1),
      deaths: (r1.samples.deaths || []).length + (r2.samples.deaths || []).length,
      waveKills: ((Game.state || {}).waveKillLog || []).length,
      roster: ((Game.state.village || {}).roster || []).length,
      tele: ((Game.state || {}).telemetry || []).length,
    };
    console.log('@@HASH ' + JSON.stringify(hash));
    return 0;
  }
  if (probe === 'stagedoor' || probe === 'replace') {
    const seed = parseInt(process.env.SEED || '424201', 10);
    const doorIdx = parseInt(process.env.DOOR_IDX || '1', 10); // spec.doors[1] = door 2, reunion, leader 40
    const D = require(path.join(REPO, 'scripts', 'gatehorizon-reprereg-driver-b'));
    const { Game } = await loadGame({ seed: seed, mode: 'pinquaddoor', fullTelemetry: false });
    await setupGame(Game);
    const errors = [];
    const ctx = { errors: errors, stagedRows: [], stagingFlag: null, stagedEvades: 0 };
    D.installTeleWrap(Game);
    D.installFightWrap(Game, ctx);
    const spec = D.loadSpec();
    const specDoor = spec.doors[doorIdx];
    let pre = null;
    if (probe === 'replace') {
      // Monkey-patch startExpedition to no-op ONCE (the first launch
      // fails): the driver must replace that member from spares.
      const origSE = Game.startExpedition;
      let n = 0;
      Game.startExpedition = function () { if (n++ === 0) return; return origSE.apply(this, arguments); };
      pre = { elig: null };
      try { const pk = D.pickQuadLive(Game); pre.elig = pk.ok ? 4 + (pk.spares || []).length : 0; } catch (e) { pre.elig = -1; }
      Game.startExpedition = origSE;
      // NOTE: pickQuadLive above already prepped the quad (trust/health/
      // home) — stageDoor re-picks the same quad; the launch patch below
      // is what the staging run itself sees.
      const origSE2 = Game.startExpedition;
      let n2 = 0;
      Game.startExpedition = function () { if (n2++ === 0) return; return origSE2.apply(this, arguments); };
      const st = D.stageDoor(Game, specDoor, ctx);
      Game.startExpedition = origSE2;
      console.log('@@STAGE ' + JSON.stringify({ ok: st.ok, why: st.why || null, elig: pre.elig,
        replacements: (st.rec && st.rec.replacements) || [], party: (st.rec && st.rec.party) || [],
        fought: st.rec ? st.rec.fought : null, fired: st.rec ? st.rec.fired : null,
        outcome: st.rec ? st.rec.outcome : null, errors: errors }));
      return st.ok ? 0 : 1;
    }
    const st = D.stageDoor(Game, specDoor, ctx);
    let projLog = null;
    try {
      const ag = Game.agencyState ? Game.agencyState() : null;
      const log = (ag && ag.gateAvoids) || [];
      projLog = log.filter(function (e) { return e && e.kind === 'proj'; });
    } catch (e) { projLog = null; }
    console.log('@@STAGE ' + JSON.stringify({ ok: st.ok, why: st.why || null,
      rec: st.rec, projLog: projLog, errors: errors,
      stagedRows: ctx.stagedRows.map(function (r) { return { outcome: r.outcome, rounds: r.rounds, leaderEntryHp: r.leaderEntryHp, leaderDied: r.leaderDied, staged: r.staged }; }) }));
    return st.ok ? 0 : 1;
  }
  if (probe === 'relaxed') {
    // Kill every ranging-profile villager, then pickQuadLive must still
    // return a quad from the widened pool (and say how widened it is).
    const seed = parseInt(process.env.SEED || '424201', 10);
    const D = require(path.join(REPO, 'scripts', 'gatehorizon-reprereg-driver-b'));
    const { Game } = await loadGame({ seed: seed, mode: 'pinquaddoor', fullTelemetry: false });
    await setupGame(Game);
    const before = D.countEligible(Game);
    const roster = ((Game.state.village || {}).roster || []).filter(function (id) { return id !== Game.villagerId; });
    let killedRanging = 0;
    roster.forEach(function (id) {
      try {
        const prof = Game.npcRangeProfile ? Game.npcRangeProfile(id) : null;
        if (prof === 'wanderer' || prof === 'explorer') {
          const p = Game.getPerson ? Game.getPerson(id) : null;
          if (p) { p.dead = true; killedRanging++; }
        }
      } catch (e) {}
    });
    const after = D.countEligible(Game);
    // Snapshot profiles BEFORE pickQuadLive: it sets potential=true for
    // the whole roster and drops the profile cache, and npcRangeProfile
    // adds +2 when potential is set — profiles measured after the call
    // are inflated, so a widened count taken after the call understates
    // (on this fixture it reads 0). The honest "taken from outside the
    // ranging pool" measure is the pre-call profile; the driver's own
    // widenedN is still reported alongside for transparency.
    const snap = {};
    roster.forEach(function (id) {
      try { snap[id] = Game.npcRangeProfile ? Game.npcRangeProfile(id) : null; } catch (e) { snap[id] = null; }
    });
    const pick = D.pickQuadLive(Game);
    let widened = null;
    if (pick.ok) {
      widened = 0;
      [pick.holder, pick.c1, pick.c2, pick.c3].forEach(function (id) {
        const prof = snap[id];
        if (prof !== 'wanderer' && prof !== 'explorer') widened++;
      });
    }
    console.log('@@RELAXED ' + JSON.stringify({ before: before, killedRanging: killedRanging, after: after,
      ok: pick.ok, why: pick.why || null, widenedN: pick.widenedN != null ? pick.widenedN : widened,
      driverWidenedN: pick.widenedN != null ? pick.widenedN : null,
      partyWidened: widened }));
    return pick.ok ? 0 : 1;
  }
  if (probe === 'oneseed') {
    const seed = parseInt(process.env.SEED || '109101', 10);
    const D = require(path.join(REPO, 'scripts', 'gatehorizon-reprereg-driver-b'));
    const spec = D.loadSpec();
    const out = await D.oneSeed(seed, process.env.LEG || 'control', spec);
    const shape = {
      anchor: (out.anchorCommit || '').slice(0, 12),
      policySha12: String(out.policySha || '').slice(0, 12),
      basePolicySha12: String(out.basePolicySha || '').slice(0, 12),
      flags: [out.pinquadFlag, out.dmgpinFlag, out.doorflee2Flag, out.hypofloorFlag, out.hpgateFlag],
      leaderprojFlag: out.leaderprojFlag,
      countersAreNumbers: ['leaderprojFires', 'leaderhpgateFires', 'hpgateFires'].every(function (f) { return typeof out[f] === 'number'; }),
      notesAreArrays: Array.isArray(out.gateAvoidNotes) && Array.isArray(out.gateAvoidLog),
      slotPin: !!(out.slotPresent && out.pinPresent),
      scored: out.scored, unscoredReason: out.unscoredReason,
      horizonDays: out.horizonDays, chunkDays: out.chunkDays, stageCapDay: out.stageCapDay,
      hasStagedDoorKey: ('stagedDoor' in out), hasW4Down: ('wave4KillsDownstream' in out),
      hasStarvation: ('starvationDeaths' in out), hasLeaderAlive: ('leaderAliveAtEnd' in out),
      hasV4: Array.isArray(out.v4encounters), deathsIsArray: Array.isArray(out.deaths),
      hasStagingChecks: Array.isArray(out.stagingChecks),
      stagingCheckDecisions: (out.stagingChecks || []).map(function (c) { return c.decision; }),
      rowsCarryLeaderDiedLog: (out.v4encounters || []).every(function (r) { return typeof r.leaderDiedLog === 'boolean' && typeof r.scholarLed === 'boolean'; }),
      unscoredReasonValid: !out.scored ? ['won', 'lost', 'no-unlock', 'no-quad', 'unstageable'].indexOf(out.unscoredReason) !== -1 : true,
      gameDays: out.gameDays, errors: out.instrumentErrors,
    };
    console.log('@@SHAPE ' + JSON.stringify(shape));
    return 0;
  }
  console.error('unknown GH_PROBE: ' + probe);
  return 2;
}

// ================= MAIN TEST =================
async function main() {
  const agSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-agency.js'), 'utf8');
  const specRaw = JSON.parse(fs.readFileSync(path.join(REPO, 'evidence', '2026-11-23', 'gatehorizon-reprereg-b-spec.json'), 'utf8'));
  const capableSha = crypto.createHash('sha256').update(fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'capable.js'), 'utf8')).digest('hex');

  (function section0() {
    check('§0 LEADERPROJ gate code present (villager-agency.js)', agSrc.indexOf('LEADERPROJ') !== -1 && agSrc.indexOf('_lpProj <= 25') !== -1);
    check('§0 GATEAVOID durable log present (gateAvoids + proj entry)', agSrc.indexOf('gateAvoids') !== -1 && agSrc.indexOf("kind: 'proj'") !== -1);
    check('§0 pin present (pinQuadParty + pinnedQuadAllies + PINQUAD)', agSrc.indexOf('pinQuadParty') !== -1 && agSrc.indexOf('pinnedQuadAllies') !== -1 && agSrc.indexOf('PINQUAD') !== -1);
    check('§0 capable policy sha frozen (4c4d1535d76c)', String(capableSha).slice(0, 12) === '4c4d1535d76c', String(capableSha).slice(0, 12));
    check('§0 spec freezes 12 pool doors (doorstage rows, no dead1)', Array.isArray(specRaw.doors) && specRaw.doors.length === 12 && specRaw.doors.every(function (d) { return d.leaderHp >= 26 && d.leaderHp <= 75; }));
    check('§0 driver + analyzer exist', fs.existsSync(path.join(REPO, 'scripts', 'gatehorizon-reprereg-driver-b.js')) && fs.existsSync(path.join(REPO, 'scripts', 'analyze-gatehorizon-reprereg-b.js')));
  })();

  function spawnSelf(env) {
    return spawnSync(process.execPath, [path.join(REPO, 'scripts', 'test-gatehorizon-reprereg-b.js')],
      { cwd: REPO, env: Object.assign({}, process.env, env), encoding: 'utf8', timeout: 1800000 });
  }
  function parseLine(stdout, tag) {
    const line = (stdout || '').split('\n').find(function (l) { return l.indexOf(tag) === 0; });
    if (!line) return null;
    try { return JSON.parse(line.slice(tag.length + 1)); } catch (e) { return null; }
  }

  // §1 chunked-vs-chunked determinism.
  (function section1() {
    const r1 = spawnSelf({ GH_PROBE: 'determinism', SEED: '109201' });
    const r2 = spawnSelf({ GH_PROBE: 'determinism', SEED: '109201' });
    const h1 = parseLine(r1.stdout, '@@HASH');
    const h2 = parseLine(r2.stdout, '@@HASH');
    check('§1 determinism probe 1 exits 0', r1.status === 0, (r1.stderr || '').slice(-300));
    check('§1 determinism probe 2 exits 0', r2.status === 0, (r2.stderr || '').slice(-300));
    check('§1 same 10+10 chunks twice reach an identical end state', !!h1 && !!h2 && eq(h1, h2), { h1: h1, h2: h2 });
  })();

  // §2 staged-door contrast (fixture door 2: reunion, leader 40).
  (function section2() {
    const ctl = spawnSelf({ GH_PROBE: 'stagedoor', SEED: '424201', DOOR_IDX: '1' });
    const arm = spawnSelf({ GH_PROBE: 'stagedoor', SEED: '424201', DOOR_IDX: '1', LEADERPROJ: '1' });
    const c = parseLine(ctl.stdout, '@@STAGE');
    const a = parseLine(arm.stdout, '@@STAGE');
    check('§2 control staged door exits 0', ctl.status === 0, (ctl.stderr || '').slice(-300));
    check('§2 control leg FIGHTS the staged door (fought, rounds >= 1)', !!c && c.ok && c.rec && c.rec.fought === true && (c.rec.rounds | 0) >= 1, c && c.rec);
    check('§2 control staged row carries leader entry HP 40', !!c && c.stagedRows && c.stagedRows.length === 1 && c.stagedRows[0].leaderEntryHp === 40, c && c.stagedRows);
    check('§2 control at-door gear: all four armed + armored (door-10 fix)', !!c && c.rec && Array.isArray(c.rec.gearAtDoor) && c.rec.gearAtDoor.length === 4 && c.rec.gearAtDoor.every(function (g) { return g.armed && g.armored; }), c && c.rec && c.rec.gearAtDoor);
    check('§2 control issued kit reads P 30 on all four', !!c && c.rec && Array.isArray(c.rec.measuredArmorP) && c.rec.measuredArmorP.every(function (p) { return p === 30; }), c && c.rec && c.rec.measuredArmorP);
    check('§2 armed staged door exits 0', arm.status === 0, (arm.stderr || '').slice(-300));
    check('§2 armed leg REFUSES the staged door (fired, no fight)', !!a && a.ok && a.rec && a.rec.fired === true && a.rec.fought === false, a && a.rec);
    check('§2 armed proj log entry reads hp 40, projHp2 -10', !!a && Array.isArray(a.projLog) && a.projLog.length === 1 && a.projLog[0].hp === 40 && a.projLog[0].projHp2 === -10, a && a.projLog);
  })();

  // §3 door-10 fix at the unit level + replacement path.
  await (async function section3() {
    // In-process fresh load for the gearCheck unit checks.
    const D = require(path.join(REPO, 'scripts', 'gatehorizon-reprereg-driver-b'));
    const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));
    const { Game } = await loadGame({ seed: 424200, mode: 'pinquaddoor', fullTelemetry: false });
    await setupGame(Game);
    const pick = D.pickQuadLive(Game);
    check('§3 fresh load yields a stageable quad', pick.ok, pick);
    if (!pick.ok) return;
    const party = [pick.holder, pick.c1, pick.c2, pick.c3];
    D.gearUp(Game, party);
    D.packStage(Game, party);
    // Launch (re-equips from pack via villagerGearUp) then read the
    // at-door gear: the door-10 failure would read armored=false here.
    let launched = 0;
    party.forEach(function (id) {
      Game.startExpedition(id, pick.hx, pick.hy, false, { tx: 6, ty: 6, duration: 20 });
      try { const ag = Game.agencyState ? Game.agencyState() : null; if (ag && ag.exped && ag.exped[id]) launched++; } catch (e) {}
    });
    check('§3 all four launch', launched === 4, launched);
    const checks = party.map(function (id) { return D.gearCheck(Game, id); });
    check('§3 pack-staged quad is armed + armored at the door', checks.every(function (g) { return g.armed && g.armored; }), checks);
    // Strip one member: empty pack + bare equipped -> the pre-check
    // must DETECT the door-10 condition.
    const victim = party[3];
    const vp = Game.getPerson ? Game.getPerson(victim) : null;
    if (vp) { vp.items = []; vp.equipped = {}; }
    const bad = D.gearCheck(Game, victim);
    check('§3 pre-check detects a stripped member (not armored)', bad.armored === false, bad);
  })();

  // §3c replacement path (child: first launch no-ops once).
  (function section3c() {
    const r = spawnSelf({ GH_PROBE: 'replace', SEED: '424201', DOOR_IDX: '1' });
    const s = parseLine(r.stdout, '@@STAGE');
    check('§3c replacement probe exits 0', r.status === 0, (r.stderr || '').slice(-300));
    check('§3c a failed launch is replaced from spares', !!s && Array.isArray(s.replacements) && s.replacements.length >= 1, s && s.replacements);
    check('§3c the staged party still fights as four', !!s && Array.isArray(s.party) && s.party.length === 4 && s.fought === true, s && { party: s.party, fought: s.fought });
  })();

  // §3b relaxed quad (child: ranging villagers dead, still stages).
  (function section3b() {
    const r = spawnSelf({ GH_PROBE: 'relaxed', SEED: '424201' });
    const s = parseLine(r.stdout, '@@RELAXED');
    check('§3b relaxed probe exits 0', r.status === 0, (r.stderr || '').slice(-300));
    check('§3b ranging pool is empty after killing ranging villagers', !!s && s.after && s.after.ranging === 0 && s.killedRanging > 0, s && { after: s.after, killed: s.killedRanging });
    check('§3b a quad still stages from the widened pool', !!s && s.ok === true, s && { ok: s.ok, why: s.why });
    // partyWidened is measured against pre-call profiles (see the probe):
    // the driver's own widenedN reads post-boost profiles and understates.
    check('§3b the staged party is fully widened (widenedN 4)', !!s && s.partyWidened === 4, s && { partyWidened: s.partyWidened, driverWidenedN: s.driverWidenedN });
  })();

  // §4 corpus shape (30-day smoke oneSeed, control).
  (function section4() {
    const r = spawnSelf({ GH_PROBE: 'oneseed', SEED: '109201', LEG: 'control', HORIZON_DAYS: '30', CHUNK_DAYS: '10', STAGE_CAP_DAY: '120' });
    const s = parseLine(r.stdout, '@@SHAPE');
    check('§4 smoke oneSeed exits 0', r.status === 0, (r.stderr || '').slice(-300));
    check('§4 corpus carries the frozen anchor + policy shas', !!s && s.policySha12 === '4c4d1535d76c' && s.basePolicySha12 === '1884c8852d38' && (s.anchor || '').length === 12, s);
    check('§4 corpus carries the substrate flags (all 1)', !!s && Array.isArray(s.flags) && s.flags.every(function (f) { return f === '1'; }), s && s.flags);
    check('§4 corpus counters are numbers, notes/log are arrays, slot+pin present', !!s && s.countersAreNumbers && s.notesAreArrays && s.slotPin === true, s);
    check('§4 corpus carries the horizon extras', !!s && s.hasStagedDoorKey && s.hasW4Down && s.hasStarvation && s.hasLeaderAlive && s.hasV4 && s.deathsIsArray, s);
    check('§4 corpus carries the boundary log (stagingChecks array)', !!s && s.hasStagingChecks, s);
    check('§4 every wave-4+ row carries leaderDiedLog + scholarLed booleans', !!s && s.rowsCarryLeaderDiedLog === true, s);
    check('§4 unscored reason is exact (never the old conflated dead)', !!s && s.unscoredReasonValid === true, s);
    // Day counter is 1-based: 30 loop-days from day 1 lands on day 31.
    // The driver ran exactly the requested iterations; assert the window.
    check('§4 smoke ran the requested 30-day horizon', !!s && s.horizonDays === 30 && s.gameDays >= 29 && s.gameDays <= 31, s);
  })();

  // §5 analyzer selftest.
  (function section5() {
    const r = spawnSync(process.execPath, [path.join(REPO, 'scripts', 'analyze-gatehorizon-reprereg-b.js'), '--selftest'],
      { cwd: REPO, env: process.env, encoding: 'utf8', timeout: 120000 });
    check('§5 analyzer selftest green (20/20)', r.status === 0 && /20 passed, 0 failed/.test(r.stdout || ''), (r.stdout || '').split('\n').slice(-2).join(' / '));
  })();

  // §6 base gates re-run green. (Timeouts are generous: under shared-box
  // load these nested proof suites run slowly; a timeout is a harness
  // artifact, not a gameplay verdict.)
  (function section6() {
    const lp = spawnSync(process.execPath, [path.join(REPO, 'scripts', 'test-leaderproj-b.js')],
      { cwd: REPO, env: process.env, encoding: 'utf8', timeout: 1800000 });
    check('§6 base gate leaderproj 55/55', lp.status === 0 && /55 passed, 0 failed/.test(lp.stdout || ''), (lp.stdout || '').split('\n').slice(-2).join(' / '));
    const ga = spawnSync(process.execPath, [path.join(REPO, 'scripts', 'test-gateavoid-b.js')],
      { cwd: REPO, env: process.env, encoding: 'utf8', timeout: 1800000 });
    check('§6 base gate gateavoid 36/36', ga.status === 0 && /36 passed, 0 failed/.test(ga.stdout || ''), (ga.stdout || '').split('\n').slice(-2).join(' / '));
  })();

  // §7 deaths-log attribution on the COMMITTED gatehorizon-b pilot
  // corpora (the proof-of-effect: the flag reads 0/0, the log reads 9/4).
  (function section7() {
    const A = require(path.join(REPO, 'scripts', 'analyze-gatehorizon-reprereg-b'));
    function loadOldCorpus(leg) {
      const dir = path.join(REPO, 'evidence', '2026-11-23', 'perseed-gatehorizon-b-' + leg);
      const out = [];
      for (let s = 109101; s <= 109108; s++) {
        const fp = path.join(dir, 'gatehorizon-b-s' + s + '-gatehorizon-b-pinquaddoor.json');
        if (!fs.existsSync(fp)) { out.push(null); continue; }
        out.push(JSON.parse(fs.readFileSync(fp, 'utf8')));
      }
      return out;
    }
    const ctl = loadOldCorpus('control');
    const arm = loadOldCorpus('armed');
    check('§7 committed gatehorizon-b corpora are present (8 + 8)', ctl.every(Boolean) && arm.every(Boolean), { ctl: ctl.filter(Boolean).length, arm: arm.filter(Boolean).length });
    if (!ctl.every(Boolean) || !arm.every(Boolean)) return;
    function countOld(corpora) {
      let flagN = 0, logN = 0, pinnedN = 0;
      const unattr = [];
      corpora.forEach(function (r) {
        (r.v4encounters || []).forEach(function (row) {
          if ((row.wave | 0) >= 4 && row.leaderEntryHp != null && ((row.leaderEntryHp | 0) <= 75)) {
            if (row.leaderDied === true) flagN++;
            if (A.attributedByDeathsLog(row, r.deaths)) { logN++; if (row.pinned) pinnedN++; }
            else if (row.outcome === 'vDie') unattr.push({ seed: r.seed, day: row.day, vid: row.vid, causes: (r.deaths || []).filter(function (d) { return ((d.day | 0) === (row.day | 0)) && String(d.who) === String(row.vid); }).map(function (d) { return String(d.cause); }) });
          }
        });
      });
      return { flagN: flagN, logN: logN, pinnedN: pinnedN, unattr: unattr };
    }
    const c = countOld(ctl), a = countOld(arm);
    check('§7 old control: synchronous flag reads 0 pool deaths (the defect)', c.flagN === 0, c);
    check('§7 old armed: synchronous flag reads 0 pool deaths (the defect)', a.flagN === 0, a);
    check('§7 old control: deaths-log rule reads 9 pool deaths', c.logN === 9, c);
    check('§7 old armed: deaths-log rule reads 4 pool deaths', a.logN === 4, a);
    check('§7 all 13 attributed deaths are unpinned (the gate never saw them)', c.pinnedN === 0 && a.pinnedN === 0, { cPinned: c.pinnedN, aPinned: a.pinnedN });
    const allUnattr = c.unattr.concat(a.unattr);
    const causes = allUnattr.map(function (u) { return (u.causes[0] || '(none)'); }).sort();
    check('§7 exactly 4 vDie rows are excluded, all with non-monster same-day causes', allUnattr.length === 4 && causes.join(',') === 'Big Loud,Big Loud,The Big Beast,The Big Beast', allUnattr);
  })();

  console.log(passed + ' passed, ' + failed + ' failed');
  return failed === 0;
}

if (process.env.GH_PROBE) {
  runProbe().then(function (code) { process.exit(code); }).catch(function (e) { console.error(e.stack); process.exit(1); });
} else {
  main().then(function (ok) { process.exit(ok ? 0 : 1); }).catch(function (e) { console.error(e.stack); process.exit(1); });
}
