#!/usr/bin/env node
'use strict';
// fieldpace-20261016.js — READ-ONLY wave-4/5 field-fight PACING census
// instrument (flesh-out loop run fleshout-20261016T1715Z, arm sim-fieldpace,
// scale-onramp axis).
//
// DIAGNOSTIC — no lever, zero src/js changes, zero policy behavior changes.
// The mortality bind is now precisely located in non-rerun wave-4/5 field
// exposure, and the execution funnel's sharpest break is that 65% of
// post-learning wave-4/5 field fights end CONDITIONS-NEVER-MET — hyper-lethal
// fights end in 1-2 rounds, but nobody has measured the pacing precisely.
// This census is the measurement the execution-funnel arms need: can ANY
// trick/counter approach work in fights this short?
//
// Per death: wave, species by canonical m.id (NEVER the prose alias —
// finding #405: beat text uses knowledge-gated aliases like "The Big Loud";
// read m.id at the death beat), round-of-death, one-round-kill flag, killer
// species, fight length in rounds, channel (expedition/raid/wild).
//
// Built ON TOP of the fieldfightsrc instrument (scripts/fieldfightsrc-
// 20261016.js, the (a)-channel census): it supplies ctx._ffs (fight-context
// stack, death records with srcOf channel classification, day tiers, travel
// days). This arm adds the pacing layer: a per-fight record at the
// fieldFight wrap level (mdef.id = canonical species, mdef.wave, rec.rounds,
// rec.outcome) and a registerDeath wrap that links each villager
// 'monster'-family death to its vDie fight record.
//
// Substrate: pre-seat courtship — SEATDRIVE=0 explicit (seatdrive.js is a
// composition wrapper; do NOT compose it), FEASTSCALE_R13=1, NODEWITNESS=1.
// Policies leadfeast/belongfeast. 8 FRESH seeds x 2 roads = 16 runs, 180d
// death-aware. Control substrate only — no armed side; this census IS the
// baseline measurement.
//
// Read-only: the wraps record into ctx._fp only; they write nothing to game
// state. Proven by the det-gate: 4 identical-seed pairs with/without the
// instrument trajectory-identical (both-repeat design: plain-repeat +
// instr-repeat + plain==instr).
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 NODEWITNESS=1 SMOKE=1 node scripts/fieldpace-20261016.js
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 NODEWITNESS=1 DET=1 node scripts/fieldpace-20261016.js
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 NODEWITNESS=1 node scripts/fieldpace-20261016.js
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 NODEWITNESS=1 SEEDS="41" ONLY="leadfeast" node scripts/fieldpace-20261016.js
const fs = require('fs');
const path = require('path');
const FFS = require('./fieldfightsrc-20261016');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

// --- substrate gates (the pre-seat stack presubstrate/seatpath/overtimedeath measured) ---
for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER', 'NODEWITNESS']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
for (const k of ['WAVE5REACH', 'W3DRIVE', 'SEATDRIVE']) {
  if (process.env[k] === '1') { console.error(`SWEEP STOP: ${k} must be UNSET on the pre-seat substrate.`); process.exit(2); }
}

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [41, 42, 43, 46, 47, 49, 50, 52]).filter(Number.isFinite);
const DAYS = 180;
const POLICIES = ['belongfeast', 'leadfeast'];
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-16', 'perseed-fieldpace');
const BEATS = path.join(__dirname, '..', 'evidence', '2026-10-16', 'fieldpace-beats');
const BEAT_CAP = 2000;
const BEAT_LEN = 300;
const OD_BEAT = /OVERTIME|RERUN|Take your seat|take your seat|Nothing is final|Seven doors|THE TABLE is set|ring of pale|Herald|herald|invitation|died|funeral|Funeral|buried|bury |killed|slain|fallen|succession|mantle|exile|Exile|RAID|raiders|treeline|round/i;

// Canonical species -> wave, read once from data (read-only). Used only to
// classify residue deaths that never passed through our fieldFight record
// (e.g. doom/ash deaths with a field context but no vDie outcome record).
let WAVE_BY_ID = null;
function waveById(mid) {
  try {
    if (!WAVE_BY_ID) {
      const raw = fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'monsters.json'), 'utf8');
      const arr = JSON.parse(raw);
      WAVE_BY_ID = {};
      for (const d of arr) { if (d && d.id) WAVE_BY_ID[d.id] = (d.wave | 0) || null; }
    }
    return (mid && WAVE_BY_ID[mid]) || null;
  } catch (e) { return null; }
}

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

function newFpRec() {
  return {
    fights: [],     // wave>=4 field fights: day, vid, allyVids, mId, wave, rounds, outcome, vTaken, player
    deaths: [],     // attributed villager deaths: day,name,vid,wave,mId,roundOfDeath,oneRoundKill,channel
    residue: [],    // monster-verb villager deaths with no matching vDie fight record
    playerDeaths: 0,
    monsterVerbVillagerDeaths: 0,
    examples: [],   // up to 3 full vDie fight logs (sense-read)
  };
}

// Pure attribution, exported for the proof test.
// linkDeath(deathCtx, fightRec) -> attributed record or null.
// NEVER consults prose: the species comes from fightRec.mId (mdef.id at the
// fight), not from any beat text.
function linkDeath(d, f) {
  if (!d || !f || f.outcome !== 'vDie') return null;
  const rounds = f.rounds | 0;
  return {
    day: d.day, name: d.name, vid: d.vid,
    wave: f.wave, mId: f.mId, killer: f.mId,
    roundOfDeath: rounds,
    oneRoundKill: rounds === 1,
    fightRounds: rounds,
    channel: d.src || 'unattributed',
  };
}
const isVillager = (d) => (/person|villager/i.test(d.kind || '') || d.player === true) && d.player !== true;

function installFightPace(Game, ctx) {
  if (ctx._fpInstalled) return;
  ctx._fpInstalled = true;
  const C = () => ctx._fp;

  // fieldFight wrap — OUTERMOST (fieldfightsrc's wrap is inside; it manages
  // its own stack; we only observe the returned rec). The canonical species
  // m.id is read here, from mdef at the fight — never from beat prose.
  if (typeof Game.fieldFight === 'function' && !Game.fieldFight.__fpWrapped) {
    const prevFfs = Game.fieldFight.__ffsWrapped === true; // composition marker
    const orig = Game.fieldFight.bind(Game);
    const w = function (vid, mdef, m, opts) {
      let rec = null;
      try { rec = orig.apply(this, arguments); }
      finally {
        try {
          const c = C();
          const wv = mdef ? (mdef.wave | 0) : null;
          if (c && mdef && mdef.id && wv >= 4 && rec) {
            const fr = {
              day: gday(Game),
              vid: String(vid || '?'),
              allyVids: (opts && opts.allyVids) ? opts.allyVids.map(String) : [],
              mId: String(mdef.id),
              wave: wv,
              rounds: rec.rounds | 0,
              outcome: rec.outcome,
              vTaken: rec.vTaken | 0,
              player: vid === 'player',
            };
            c.fights.push(fr);
            if (fr.outcome === 'vDie' && !fr.player && c.examples.length < 3) {
              // Cap the log; the fight log is a capped engine record.
              c.examples.push({
                day: fr.day, vid: fr.vid, mId: fr.mId, wave: fr.wave,
                rounds: fr.rounds, vTaken: fr.vTaken,
                log: (rec.log || []).slice(-60),
              });
            }
          }
        } catch (e) {}
      }
      return rec;
    };
    w.__fpWrapped = true;
    w.__ffsWrapped = prevFfs; // the inner wrap is fieldfightsrc's; carry its marker outward
    Game.fieldFight = w;
  }

  // registerDeath wrap — OUTERMOST (fieldfightsrc's wrap runs inside first
  // and records its dctx with the srcOf channel; we then link by vid+day).
  if (typeof Game.registerDeath === 'function' && !Game.registerDeath.__fpWrapped) {
    const prevFfs = Game.registerDeath.__ffsWrapped === true; // composition marker
    const orig = Game.registerDeath.bind(Game);
    const w = function (opts) {
      let r;
      try { r = orig.apply(this, arguments); }
      finally {
        try {
          const c = C();
          const F = ctx._ffs;
          if (c && F && F.deaths.length) {
            const d = F.deaths[F.deaths.length - 1]; // this death's dctx (fieldfightsrc)
            if (/person|villager/i.test(d.kind || '') || d.player === true) {
              if (d.player === true) { c.playerDeaths++; }
              else if (d.family === 'monster') {
                c.monsterVerbVillagerDeaths++;
                const vid = String(d.vid || '');
                const cand = c.fights.filter((f) =>
                  f.day === d.day && f.outcome === 'vDie' && !f.player &&
                  (f.vid === vid || f.allyVids.indexOf(vid) >= 0));
                const f = cand.length ? cand[cand.length - 1] : null;
                const linked = linkDeath(d, f);
                if (linked) c.deaths.push(linked);
                else {
                  // Residue: classify honestly — is this even a wave-4/5
                  // field-fight death? The stack monsterId (m.id at the death
                  // beat, fieldfightsrc's via fieldFight upgrade) resolves
                  // the wave without touching prose.
                  const wByCtx = waveById(d.monsterId);
                  c.residue.push({
                    day: d.day, vid, name: d.name,
                    cause: String(d.cause || '').slice(0, 60),
                    via: d.via, src: d.src, monsterId: d.monsterId,
                    waveByMonsterId: wByCtx,
                    reason: d.monsterId && wByCtx >= 4
                      ? 'wave45-field-death-but-no-vDie-fight-record'
                      : (d.via ? 'monster-death-no-fieldfight-record' : 'monster-death-no-field-context'),
                  });
                }
              }
            }
          }
        } catch (e) {}
      }
      return r;
    };
    w.__fpWrapped = true;
    w.__ffsWrapped = prevFfs; // the inner wrap is fieldfightsrc's; carry its marker outward
    Game.registerDeath = w;
  }
}

function withFieldPace(base, id, desc) {
  const ffsWrapped = FFS.withFieldFightSrc(base, id + '-ffs', (desc || base.desc) + ' [FFS]');
  const wrapped = Object.assign({}, ffsWrapped, {
    id, desc,
    setup(G, ctx) {
      ffsWrapped.setup(G, ctx); // installs ctx._ffs (stack, death capture, travel days)
      ctx._fp = newFpRec();
      installFightPace(G, ctx);
    },
  });
  return wrapped;
}

// ---------------------------------------------------------------------
// SMOKE gate: both policies drive with the pacing layer live.
async function smokeGate() {
  const fails = [];
  const check = (name, cond, detail) => {
    console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!cond) fails.push(name);
  };
  for (const policyId of POLICIES) {
    const base = FFS.policyFor(policyId);
    check(`[${policyId}] base id = ${policyId}`, base.id === policyId, 'got ' + base.id);
    const policy = withFieldPace(base, base.id + '-fp', base.desc + ' [FP]');
    let paceLive = false, fightWrap = false, regWrap = false, runCtxForMarkers = null;
    const oSetup = policy.setup;
    policy.setup = (G, ctx) => { if (oSetup) oSetup(G, ctx); paceLive = !!(ctx && ctx._fp); runCtxForMarkers = ctx; };
    const { Game } = await loadGame({ seed: 41, mode: 'fp-smoke', fullTelemetry: false });
    await setupGame(Game);
    let r = null;
    await quietLog(async () => { r = await runDays(Game, policy, { days: 15, sampleEvery: 30 }); });
    fightWrap = !!(Game.fieldFight.__fpWrapped && Game.fieldFight.__ffsWrapped);
    // fieldfightsrc marks only its three router wraps (not registerDeath);
    // fp carries no ffs marker there either (prevFfs=false, honestly).
    regWrap = !!(Game.registerDeath.__fpWrapped && runCtxForMarkers && runCtxForMarkers._ffsDeathInstalled);
    check(`[${policyId}] pacing layer live`, paceLive === true, '');
    check(`[${policyId}] wraps composed (ffs inside, fp outside)`, fightWrap && regWrap, '');
    check(`[${policyId}] 15d run completes`, !!(r && r.days >= 15), `days=${r && r.days}`);
    check(`[${policyId}] pure linkDeath`, !!linkDeath({ day: 5, name: 'A', vid: 'v1', src: 'RAID' }, { outcome: 'vDie', rounds: 1, mId: 'eater', wave: 4 }), '');
  }
  if (fails.length) { console.log(`\nSMOKE STOP: ${fails.length} failure(s).`); process.exit(1); }
  console.log('\nSMOKE GATE: both policies drive, pacing layer live, wraps composed.');
}

// ---------------------------------------------------------------------
// DET-GATE: instrument-on vs instrument-off trajectory-identical, 4
// identical-seed pairs, both-repeat design (plain-repeat + instr-repeat +
// plain==instr). Proves the pacing layer is read-only.
async function runHashes(policy, seed, days) {
  const { Game } = await loadGame({ seed, mode: 'fp-det', fullTelemetry: false });
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
  const pairs = [['leadfeast', 41], ['leadfeast', 42], ['belongfeast', 41], ['belongfeast', 42]];
  const days = 60;
  let green = 0;
  for (const [pid, seed] of pairs) {
    const plain = FFS.policyFor(pid);
    const instr = withFieldPace(FFS.policyFor(pid), pid + '-fp', pid + ' [FP DET]');
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
  console.log(`DET-GATE: ${green}/${pairs.length} identical (plain-repeat + instr-repeat + plain==instr, ends agree).`);
  if (green < pairs.length) { console.error('DET GATE FAILED — instrument is not provably read-only.'); process.exit(4); }
  console.log('DET gate green.');
}

// ---------------------------------------------------------------------
// The sweep.
function summarize(C) {
  const deaths = C.deaths;
  const byWave = { 4: [], 5: [], 6: [] };
  for (const d of deaths) (byWave[d.wave] = byWave[d.wave] || []).push(d);
  const orkShare = (arr) => arr.length ? arr.filter((d) => d.oneRoundKill).length / arr.length : null;
  const roundHist = (arr) => {
    const h = {};
    for (const d of arr) h[d.roundOfDeath] = (h[d.roundOfDeath] || 0) + 1;
    return h;
  };
  const killers = {};
  for (const d of deaths) killers[d.mId] = (killers[d.mId] || 0) + 1;
  const topKillers = Object.entries(killers).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const fights = C.fights.filter((f) => !f.player);
  const rounds = fights.map((f) => f.rounds).sort((a, b) => a - b);
  const median = rounds.length ? rounds[Math.floor(rounds.length / 2)] : null;
  const chan = { RAID: 0, EXPEDITION: 0, 'WILD-ENCOUNTER': 0, unattributed: 0 };
  for (const d of deaths) chan[d.channel] = (chan[d.channel] || 0) + 1;
  const pop = C.monsterVerbVillagerDeaths;
  return {
    wave45Deaths: deaths.length,
    monsterVerbVillagerDeaths: pop,
    attributionRate: pop ? deaths.length / pop : 1,
    orkShareW4: orkShare(byWave[4] || []),
    orkShareW5: orkShare(byWave[5] || []),
    roundHistW4: roundHist(byWave[4] || []),
    roundHistW5: roundHist(byWave[5] || []),
    nW4: (byWave[4] || []).length, nW5: (byWave[5] || []).length, nW6: (byWave[6] || []).length,
    medianFightRoundsW45: median,
    nFightsW45: fights.length,
    topKillers,
    channelSplit: chan,
    residueN: C.residue.length,
    residueReasons: C.residue.reduce((m, r) => { m[r.reason] = (m[r.reason] || 0) + 1; return m; }, {}),
    playerDeaths: C.playerDeaths,
  };
}

async function oneRun(seed, policyId) {
  const base = FFS.policyFor(policyId);
  const policy = withFieldPace(base, base.id + '-fp', base.desc + ' [FP]');
  const { Game } = await loadGame({ seed, mode: 'fp', fullTelemetry: false });
  await setupGame(Game);
  let runCtx = null;
  const oSetup = policy.setup;
  policy.setup = (G, ctx) => { runCtx = ctx; return oSetup(G, ctx); };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  const C = (runCtx && runCtx._fp) || newFpRec();
  const F = (runCtx && runCtx._ffs) || null;
  const sum = summarize(C);
  const out = {
    seed, policyId, mode: 'fieldpace',
    days: result.days, gameDays: result.gameDays,
    endReason: result.endReason,
    won: !!Game.won,
    inviteDay: F ? F.inviteDay : null,
    maxWave: F ? Math.max(1, ...F.dayTiers.map((r) => r.wave || 1)) : null,
    national: F ? (F.dayTiers.some((r) => r.scale === 'national' || r.scale === 'global') ? 1 : 0) : 0,
    table: F ? (F.inviteDay != null ? 1 : 0) : 0,
    wins: !!Game.won ? 1 : 0, exiled: 0,
    summary: sum,
    fights: C.fights,
    deaths: C.deaths,
    residue: C.residue,
    examples: C.examples,
  };
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `${policyId}-s${seed}.json`), JSON.stringify(out, null, 1));
  console.log(`  [${policyId} s${seed}] days=${out.gameDays} end=${out.endReason} ` +
    `w45deaths=${sum.wave45Deaths}/${sum.monsterVerbVillagerDeaths} attr=${(sum.attributionRate * 100).toFixed(0)}% ` +
    `ORK w4=${sum.orkShareW4 == null ? 'n/a' : sum.orkShareW4.toFixed(2)} w5=${sum.orkShareW5 == null ? 'n/a' : sum.orkShareW5.toFixed(2)} ` +
    `medRounds=${sum.medianFightRoundsW45} nat=${out.national} table=${out.table} won=${out.wins}`);
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
  console.log('\nSWEEP DONE — per-seed JSONs in evidence/2026-10-16/perseed-fieldpace/.');
})().catch((e) => { console.error('SWEEP CRASH:', e); process.exit(2); });

module.exports = { withFieldPace, newFpRec, linkDeath, isVillager, waveById, summarize };
