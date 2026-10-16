#!/usr/bin/env node
'use strict';
// apexpredators-20261016.js — READ-ONLY apex-predator attribution instrument
// (flesh-out loop, 2026-10-16 arm sim-apexpredators, scale-onramp axis).
//
// DIAGNOSTIC — no lever, zero src/js changes, zero policy behavior changes.
// sim-fieldfightsrc (evidence/2026-10-16/sim-fieldfightsrc.md) delivered the
// fork verdict FIELD-EXPOSURE-DOMINANT: 74 post-invite monster-verb villager
// deaths = 21 RAID (28.4%) + 51 EXPEDITION (68.9%) + 2 WILD-ENCOUNTER (2.7%).
// This arm NAMES THE PREDATORS: for every post-invite monster-verb villager
// death, record species, wave, one-round-kill?, context tag (fieldfightsrc's
// srcOf), counter-known?, species-discovered? (codex stage), days-since-
// wave4-unlock, roster size at death, scholar-away at death.
//
// Composes scripts/fieldfightsrc-20261016.js (same seeds, same substrate, same
// srcOf classification) and adds read-only apex wraps. Proven read-only by
// the same det-gate design (4 identical-seed pairs, plain-repeat +
// instr-repeat + plain==instr).
//
// ENGINE-GROUNDED READS (never prose-reconstructed):
//   - species/wave: the fight entity's m.id -> Game.data.monsters def
//     (fieldFights.js: the entity is the engine's own monster; villager-
//     agency.js pushes a.know[vid].fought with m.id — the id is canonical).
//   - one-round-kill: the fight's returned rec.rounds (fieldFights.js sets
//     rec.rounds = round per round; fieldFightSummary renders "killed X in
//     N rounds" from the same number). ork = rounds <= 1 (the 0-round volley
//     phase counts — documented in the evidence file).
//   - context: fieldfightsrc's srcOf on the same death record.
//   - counter-known: Game.monsterCounterKnown(monsterId) at the death beat
//     (waveLedger.js: state.monsterCounters[id] AND the def carries counter).
//   - species-discovered: state.codex.monsters[id].stage in
//     {observed, slain} (game.js knowledge aggregator, 'name' aspect).
//   - roster: (Game.data.villagers||[]).length at the death beat — read
//     BEFORE orig registerDeath (hurtVillager/expedDeath remove the villager
//     after registering).
//   - days-since-wave4-unlock: analyzer-side from dayTiers (first wave>=4 day).
//   - scholar-away: fieldfightsrc's existing capture.
//
// Usage: same env as fieldfightsrc-20261016.js, SEATDRIVE=0 explicit.
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 SMOKE=1 node scripts/apexpredators-20261016.js
//   ... DET=1 node scripts/apexpredators-20261016.js   (det-gate)
//   ... node scripts/apexpredators-20261016.js         (the 16-run sweep)
const fs = require('fs');
const path = require('path');
// Lazy: requiring fieldfightsrc at module load would fire its substrate gates
// (they run at load, before require.main's guard) — the unit test must load
// this module gate-free. The sweep/SMOKE/DET paths require it on demand.
const FFS = () => require('./fieldfightsrc-20261016');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [205, 246, 321, 412, 523, 634, 745, 856]).filter(Number.isFinite);
const DAYS = 180;
const POLICIES = ['belongfeast', 'leadfeast'];
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-16', 'perseed-apexpredators');
const BEATS = path.join(__dirname, '..', 'evidence', '2026-10-16', 'apexpredators-beats');

// ---------------------------------------------------------------------
// Pure attribution functions (exported for the proof test).
function speciesOf(monsterId, defs) {
  if (!monsterId || !defs) return null;
  const d = defs.find(m => m && m.id === monsterId);
  if (!d) return null;
  return { name: d.name || monsterId, wave: (d.wave | 0) || null };
}
function monsterIdFromName(name, defs) {
  if (!name || !defs) return null;
  const n = String(name).trim().toLowerCase();
  const d = defs.find(m => String((m && m.name) || '').trim().toLowerCase() === n);
  return d ? d.id : null;
}
// One-round kill: died in round 1 of the fight. The 0-round volley phase
// (pre-round-1 ranged shots, fieldFights.js) counts — a villager dropped
// before round 1 is the same lethality story.
function orkOf(fightRounds) {
  if (fightRounds == null) return false;
  return (fightRounds | 0) <= 1;
}
// Monster-id resolution order (the contract): the engine's fight-context
// marker first (ffs stack top), then the just-finished fight's entity id
// (vid-matched — the agency-expedition path), then the cause-name fallback
// (expedDeath registers cause = the monster's display name).
function resolveMonsterId(parts, defs) {
  const p = parts || {};
  if (p.stackTopId) return p.stackTopId;
  const lf = p.lastFight;
  if (lf && lf.vid && lf.vid === p.deathVid && lf.monsterId) return lf.monsterId;
  if (p.causeName) return monsterIdFromName(p.causeName, defs);
  return null;
}
// The fieldfightsrc population filter, verbatim: post-invite 'monster'-verb
// villager(/player) combat deaths. Reused so the 74/74 bar is comparable.
function isTargetDeath(d, inviteDay) {
  if (!d || inviteDay == null) return false;
  if (d.day == null || d.day < inviteDay) return false;
  if (d.family !== 'monster') return false;
  if (!(/person|villager/i.test(d.kind || '') || d.player === true)) return false;
  return true;
}
function codexStageOf(state, monsterId) {
  try {
    const e = ((((state || {}).codex || {}).monsters || {})[monsterId]) || {};
    return (e.stage === 'observed' || e.stage === 'slain') ? e.stage : null;
  } catch (e2) { return null; }
}

// ---------------------------------------------------------------------
// Read-only wraps.
function apexOf(ctx) {
  const C = ctx && ctx._ffs;
  if (C && !C._apex) C._apex = { lastFight: null };
  return C ? C._apex : null;
}
function monsterDefsOf(Game) {
  try { return (Game.data && Game.data.monsters) || []; } catch (e) { return []; }
}
// Pre-death reads: everything that must be observed BEFORE orig
// registerDeath runs (roster/codex/counter state is read at the beat).
function readApexPre(Game, ctx, opts) {
  const C = ctx._ffs;
  const vid = String(opts.villagerId || opts.monsterId || '');
  const top = (C.stack && C.stack.length) ? C.stack[C.stack.length - 1] : null;
  const A = apexOf(ctx);
  const lf = A ? A.lastFight : null;
  const defs = monsterDefsOf(Game);
  const monsterId = resolveMonsterId({
    stackTopId: top ? top.monsterId : null,
    lastFight: lf, deathVid: vid, causeName: opts.cause,
  }, defs);
  const sp = speciesOf(monsterId, defs);
  let roster = null, stage = null, slain = 0, counterKnown = false;
  try { roster = ((Game.data && Game.data.villagers) || []).length; } catch (e) {}
  try { stage = codexStageOf(Game.state, monsterId); } catch (e) {}
  try { slain = (((Game.state || {}).villageSlain) || {})[monsterId] || 0; } catch (e) {}
  try {
    counterKnown = !!(monsterId && typeof Game.monsterCounterKnown === 'function' && Game.monsterCounterKnown(monsterId));
  } catch (e) { counterKnown = false; }
  return {
    vid,
    fields: {
      monsterId: monsterId,
      species: sp ? sp.name : null,
      wave: sp ? sp.wave : null,
      rosterAtDeath: roster,
      codexStage: stage,
      speciesDiscovered: stage != null,
      villageSlain: slain | 0,
      counterKnown: counterKnown === true,
    },
  };
}
function stampFromLastFight(A, d) {
  const lf = A ? A.lastFight : null;
  if (!lf || !lf.vid || lf.vid !== d.vid) return {};
  const rounds = (lf.rounds == null) ? null : (lf.rounds | 0);
  return { fightRounds: rounds, fightOutcome: lf.outcome || null, oneRoundKill: orkOf(rounds) };
}
function installApexRegisterDeath(Game, ctx) {
  if (ctx._apexRegInstalled) return;
  ctx._apexRegInstalled = true;
  const orig = Game.registerDeath.bind(Game);
  const w = function (opts) {
    let pending = null;
    try { if (ctx._ffs) pending = readApexPre(Game, ctx, opts || {}); } catch (e) {}
    const r = orig.apply(this, arguments);
    try {
      const C = ctx._ffs;
      if (C && pending) {
        const d = C.deaths[C.deaths.length - 1];
        // The vid check guards the 1200-death cap: if ffs didn't record this
        // death, the last entry belongs to someone else — never stamp it.
        if (d && d.vid === pending.vid) Object.assign(d, pending.fields, stampFromLastFight(apexOf(ctx), d));
      }
    } catch (e) {}
    return r;
  };
  w.__apexWrapped = true;
  Game.registerDeath = w;
}
function installApexFieldFight(Game, ctx) {
  if (ctx._apexFightInstalled) return;
  ctx._apexFightInstalled = true;
  const orig = Game.fieldFight.bind(Game);
  const w = function (vid, mdef, m, opts) {
    const rec = orig.apply(this, arguments);
    try {
      const A = apexOf(ctx);
      if (A && rec && typeof rec === 'object') {
        A.lastFight = {
          vid: String(vid || ''),
          monsterId: (m && m.id) ? String(m.id) : null,
          monsterName: (m && m.name) ? String(m.name) : null,
          rounds: (rec.rounds == null) ? null : (rec.rounds | 0),
          outcome: rec.outcome || null,
        };
      }
    } catch (e) {}
    return rec;
  };
  w.__apexWrapped = true;
  Game.fieldFight = w;
}
// installApexCapture: applied AFTER withFieldFightSrc's setup, so the apex
// registerDeath wrap is OUTERMOST (its pre-hook reads the ffs fight stack
// before ffs records the death; its post-hook stamps the recorded death)
// and the apex fieldFight wrap is outermost (post-hook runs after the ffs
// wrap pops, so lastFight is fresh for the post-fight registerDeath paths:
// resolveWildMonsterEncounter's hurtVillager and expedDeath).
function installApexCapture(Game, ctx) {
  if (!ctx || !ctx._ffs) return;
  apexOf(ctx); // initialize C._apex eagerly — the SMOKE check reads it before any fight
  installApexFieldFight(Game, ctx);
  installApexRegisterDeath(Game, ctx);
}
function withApexPredators(base, id, desc) {
  const wrapped = FFS().withFieldFightSrc(base, id, desc);
  const oSetup = wrapped.setup;
  wrapped.setup = function (Game, ctx) {
    const r = oSetup ? oSetup(Game, ctx) : undefined;
    installApexCapture(Game, ctx);
    return r;
  };
  return wrapped;
}

// ---------------------------------------------------------------------
// SMOKE gate: both base policies drive with the instrument live.
async function smokeGate() {
  const ffs = FFS();
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const fails = [];
  const check = (name, cond, detail) => {
    console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!cond) fails.push(name);
  };
  for (const policyId of POLICIES) {
    process.env.WINPURSUIT = '1'; process.env.WINDEFER = '1';
    const base = ffs.policyFor(policyId);
    const policy = withApexPredators(base, base.id + '-apex', base.desc + ' [APEX]');
    let live = null, apexLive = false;
    const oSetup = policy.setup;
    policy.setup = (G, ctx) => { if (oSetup) oSetup(G, ctx); live = !!(ctx && ctx._ffs); apexLive = live && !!ctx._ffs._apex; };
    const { Game } = await loadGame({ seed: 205, mode: 'apex-smoke', fullTelemetry: false });
    await setupGame(Game);
    let r = null;
    await quietLog(async () => { r = await runDays(Game, policy, { days: 15, sampleEvery: 30 }); });
    check(`[${policyId}] instrument live`, live === true, '');
    check(`[${policyId}] apex state live`, apexLive === true, '');
    check(`[${policyId}] apex wraps attached`, !!(Game.fieldFight.__apexWrapped && Game.registerDeath.__apexWrapped), '');
    check(`[${policyId}] 15d run completes`, !!(r && r.days >= 15), `days=${r && r.days}`);
  }
  delete process.env.WINDEFER;
  if (fails.length) { console.log(`\nSMOKE STOP: ${fails.length} failure(s).`); process.exit(1); }
  console.log('\nSMOKE GATE: both policies drive, apex instrument live, runs complete.');
}

// ---------------------------------------------------------------------
// DET-GATE: instrument-on vs instrument-off trajectory-identical, 4
// identical-seed pairs, both-repeat design (plain-repeat + instr-repeat +
// plain==instr) — the seatpath/fieldfightsrc convention.
async function runHashes(policy, seed, days) {
  process.env.WINPURSUIT = '1'; process.env.WINDEFER = '1';
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const { dayHash } = require('./det-gate');
  const { Game } = await loadGame({ seed, mode: 'apex-det', fullTelemetry: false });
  await setupGame(Game);
  const hashes = [];
  const wrapped = Object.assign({}, policy);
  const base = policy.daily;
  wrapped.daily = (G, ctx) => { hashes.push(Game.state.scholar.day + ':' + dayHash(Game)); return base ? base(G, ctx) : undefined; };
  let r = null;
  await quietLog(async () => { r = await runDays(Game, wrapped, { days, sampleEvery: 1 }); });
  return { h: hashes.join('\n'), endReason: r && r.endReason, days: r && r.days };
}
async function detGate() {
  const ffs = FFS();
  const pairs = [['leadfeast', 205], ['leadfeast', 246], ['belongfeast', 205], ['belongfeast', 246]];
  const days = 60;
  let green = 0;
  for (const [pid, seed] of pairs) {
    const plain = ffs.policyFor(pid);
    const instr = withApexPredators(ffs.policyFor(pid), pid + '-apex', pid + ' [APEX DET]');
    const p1 = await runHashes(plain, seed, days);
    const p2 = await runHashes(plain, seed, days);
    const c1 = await runHashes(instr, seed, days);
    const c2 = await runHashes(instr, seed, days);
    const plainStable = p1.h === p2.h;
    const instrStable = c1.h === c2.h;
    const identical = plainStable && instrStable && p1.h === c1.h;
    const endsSame = p1.endReason === c1.endReason;
    if (identical && endsSame) green++;
    console.log(`  ${pid} s${seed}: plain-stable=${plainStable} instr-stable=${instrStable} ` +
      `instrument-identical=${p1.h === c1.h} ends=${p1.endReason}/${c1.endReason} ${identical && endsSame ? 'PASS' : 'FAIL'}`);
  }
  delete process.env.WINDEFER;
  console.log(`DET-GATE: ${green}/${pairs.length} identical (plain-repeat + instr-repeat + plain==instr, ends agree).`);
  if (green < pairs.length) { console.error('DET GATE FAILED — instrument is not provably read-only.'); process.exit(4); }
  console.log('DET gate green.');
}

// ---------------------------------------------------------------------
// The sweep.
async function oneRun(seed, policyId) {
  const ffs = FFS();
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  process.env.WINPURSUIT = '1'; process.env.WINDEFER = '1';
  const base = ffs.policyFor(policyId);
  const policy = withApexPredators(base, base.id + '-apex', base.desc + ' [APEX]');
  const { Game } = await loadGame({ seed, mode: 'apex', fullTelemetry: false });
  await setupGame(Game);
  let runCtx = null;
  const oSetup = policy.setup;
  policy.setup = (G, ctx) => { runCtx = ctx; return oSetup(G, ctx); };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  const C = (runCtx && runCtx._ffs) || { deaths: [], dayTiers: [], travelDays: {}, srcCounts: {}, inviteDay: null };
  for (const d of C.deaths) {
    d.late = d.day > result.days ? 1 : 0;
    d.beyondWindow = d.day > (result.gameDays || result.days) + 1 ? 1 : 0;
  }
  const postInvite = C.deaths.filter(d => isTargetDeath(d, C.inviteDay));
  const attributed = postInvite.filter(d => d.species != null && d.src && d.src !== 'unattributed');
  const srcShare = { RAID: 0, EXPEDITION: 0, 'WILD-ENCOUNTER': 0, unattributed: 0 };
  for (const d of postInvite) srcShare[d.src] = (srcShare[d.src] || 0) + 1;
  const out = {
    seed, policyId, mode: 'apexpredators',
    days: result.days, gameDays: result.gameDays,
    endReason: result.endReason,
    won: !!Game.won,
    inviteDay: C.inviteDay, seatAtInvite: C.seatAtInvite, sittings: C.sittings,
    maxWave: Math.max(1, ...C.dayTiers.map(r => r.wave || 1)),
    national: C.dayTiers.some(r => r.scale === 'national' || r.scale === 'global') ? 1 : 0,
    table: C.inviteDay != null ? 1 : 0,
    wins: !!Game.won ? 1 : 0, exiled: 0,
    nDeaths: C.deaths.length,
    postInviteMonsterVerb: postInvite.length,
    postInviteSrcShare: srcShare,
    attributed: attributed.length,
    attributionRate: postInvite.length ? attributed.length / postInvite.length : 1,
    deaths: C.deaths,
    dayTiers: C.dayTiers,
    travelDays: C.travelDays,
    beatsDropped: C.beatsDropped,
  };
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `${policyId}-s${seed}.json`), JSON.stringify(out, null, 1));
  try {
    if (C.beats && C.beats.length) {
      fs.mkdirSync(BEATS, { recursive: true });
      fs.writeFileSync(path.join(BEATS, `${policyId}-s${seed}.json`), JSON.stringify(C.beats, null, 1));
    }
  } catch (e) {}
  console.log(`  [${policyId} s${seed}] days=${out.gameDays} end=${out.endReason} invDay=${C.inviteDay} ` +
    `deaths=${C.deaths.length} monsterverb-post=${postInvite.length} attributed=${attributed.length} maxWave=${out.maxWave} nat=${out.national}`);
}

(async () => {
  if (require.main !== module) return; // require() by the proof test must not launch the sweep
  let only = null;
  if (process.env.ONLY) {
    only = {};
    for (const part of process.env.ONLY.split(';')) {
      const p = part.trim();
      if (p) only[p] = true;
    }
  }
  if (process.env.SMOKE === '1') await smokeGate();
  else if (process.env.DET === '1') await detGate();
  else {
    for (const policyId of POLICIES) {
      if (only && !only[policyId]) continue;
      for (const seed of SEEDS) {
        await oneRun(seed, policyId);
      }
    }
  }
  delete process.env.WINDEFER;
  console.log('\nSWEEP DONE — per-seed JSONs in evidence/2026-10-16/perseed-apexpredators/.');
})().catch(e => { console.error('SWEEP CRASH:', e); process.exit(2); });

module.exports = { speciesOf, monsterIdFromName, orkOf, resolveMonsterId, isTargetDeath, codexStageOf, installApexCapture, withApexPredators };
