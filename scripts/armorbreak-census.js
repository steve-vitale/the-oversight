#!/usr/bin/env node
// scripts/armorbreak-census.js — per-villager armor census at wave-4 unlock
// via fidelity-verified replay (sim-armorbreak, 2026-10-17, axis scale-onramp).
//
// READ-ONLY vs the game: this replays the two sweeps' exact runOne logic
// (same seeds, same policy composition, same substrate env, same harness
// calls) and ADDS a per-villager armor census at the first wave-4-unlock day
// + a pre/post-unlock death split. It changes nothing in src/js or
// scripts/policies — it is an instrument, run from the current worktree HEAD.
//
// Each replay is fidelity-verified against its corpus JSON on trajectory
// markers (firstW4Day where recorded, bindingBars, gameDays, days,
// endReason, won, deaths.total, deaths.starv, readiness4 counts,
// standingTotal). MATCHED → census attributed to the corpus run.
// DRIFTED → census labeled reconstructed-on-current-HEAD with the diff list.
//
// The 10 unlock runs (from the corpus classifier):
//   wave4reach (swept at c477ba34, seeds 3091141..3761855, VETREL=1+VETSHAPE=1 armed)
//   vetshape   (swept at cfaab2f9, seeds 2210317..2981033, VETSHAPE=1 armed)
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 SEATDRIVE=0 \
//     node scripts/armorbreak-census.js [--json] [--run <tag>]
// where <tag> is e.g. wave4reach:armed:leadfeast:3211345
// Writes nothing into the repo (stdout only). Exit 0 always (diagnostic).
'use strict';
const fs = require('fs');
const path = require('path');
const SD = require('./policies/seatdrive');
const WD = require('./policies/windefer');
const VR = require('./policies/vetrel');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

const EVID = path.join(__dirname, '..', 'evidence', '2026-10-17');
const DAYS = 180;
const ARMOR_P_DEMAND = 15;

const UNLOCK_RUNS = [
  { corpus: 'wave4reach', arm: 'armed', policyId: 'leadfeast', seed: 3211345 },
  { corpus: 'wave4reach', arm: 'armed', policyId: 'belongfeast', seed: 3211345 },
  { corpus: 'wave4reach', arm: 'armed', policyId: 'belongfeast', seed: 3101243 },
  { corpus: 'wave4reach', arm: 'armed', policyId: 'belongfeast', seed: 3761855 },
  { corpus: 'wave4reach', arm: 'control', policyId: 'belongfeast', seed: 3651753 },
  { corpus: 'vetshape', arm: 'armed', policyId: 'leadfeast', seed: 2430521 },
  { corpus: 'vetshape', arm: 'armed', policyId: 'belongfeast', seed: 2430521 },
  { corpus: 'vetshape', arm: 'armed', policyId: 'belongfeast', seed: 2760829 },
  { corpus: 'vetshape', arm: 'armed', policyId: 'belongfeast', seed: 2981033 },
  { corpus: 'vetshape', arm: 'control', policyId: 'leadfeast', seed: 2430521 },
];

function assertSubstrate() {
  for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY']) {
    if (process.env[k] !== '1') throw new Error(`SUBSTRATE STOP: ${k}=1 required.`);
  }
  if (process.env.ALLOWGATE2 === '1') throw new Error('SUBSTRATE STOP: ALLOWGATE2=1.');
  if (process.env.SEATDRIVE !== '0') throw new Error('SUBSTRATE STOP: SEATDRIVE must be 0.');
}

function corpusRow(spec) {
  const dir = spec.corpus === 'wave4reach' ? 'perseed-wave4reach' : 'perseed-vetshape';
  const f = `${spec.arm}-${spec.policyId}-s${spec.seed}.json`;
  return JSON.parse(fs.readFileSync(path.join(EVID, dir, f), 'utf8'));
}

function vpName(G, vp, vid) {
  try { if (typeof G.displayName === 'function') { const n = G.displayName(vid); if (n) return n; } } catch (e) {}
  try { if (vp && vp.name) return vp.name; } catch (e) {}
  return vid;
}

// Per-villager armor census on LIVE state (canon: equipment.js armorOf /
// scholar armorBonus; BODY_SLOTS head/torso/legs/hands/shoes; demand P>=15).
function censusVillagers(G) {
  const S = (typeof globalThis !== 'undefined' && globalThis.Scattering) || {};
  const eq = S.equipment || {};
  const BODY = eq.BODY_SLOTS || ['head', 'torso', 'legs', 'hands', 'shoes'];
  const itemDefs = (G.data && G.data.items) || [];
  const roster = ((G.state && G.state.village && G.state.village.roster) || []);
  const scholarId = G.villagerId;
  const rows = [];
  for (const vid of roster) {
    const isScholar = vid === scholarId;
    let vp = null;
    if (!isScholar) { try { vp = (typeof G.vpOf === 'function') ? G.vpOf(vid) : null; } catch (e) { vp = null; } }
    const dead = isScholar ? false : !(vp && !vp.dead);
    if (dead || !vp && !isScholar) {
      rows.push({ vid, name: isScholar ? 'scholar' : vpName(G, vp, vid), dead: true });
      continue;
    }
    let P = 0, slots = {}, fullSet = false;
    try {
      if (isScholar) {
        P = (typeof G.armorBonus === 'function') ? (G.armorBonus() | 0) : 0;
        const eqt = (G.state && G.state.scholar && G.state.scholar.equipped) || {};
        for (const s of BODY) { const e = eqt[s]; if (e) slots[s] = (typeof e === 'string') ? e : (e.itemId || e.id || '?'); }
      } else {
        P = (eq && typeof eq.armorOf === 'function') ? (eq.armorOf(vp, itemDefs) | 0) : 0;
        const eqt = (vp && vp.equipped) || {};
        if (eqt.torso && eqt.torso.fullSet) fullSet = true;
        for (const s of BODY) { const e = eqt[s]; if (e) slots[s] = (typeof e === 'string') ? e : (e.itemId || e.id || '?'); }
      }
    } catch (e) { /* census stays partial, never throws */ }
    const slotsFilled = Object.keys(slots).length;
    rows.push({
      vid, name: isScholar ? '(scholar) ' + vpName(G, null, vid) : vpName(G, vp, vid),
      dead: false, scholar: isScholar, P, slotsFilled,
      anyArmor: slotsFilled > 0, fullSet,
      demandMet: P >= ARMOR_P_DEMAND, slots,
    });
  }
  const living = rows.filter(r => !r.dead);
  let bar = null;
  try { const rd = (typeof G.waveCombatReadiness === 'function') ? G.waveCombatReadiness(4) : null;
    if (rd) bar = { armored: rd.armored, armed: rd.armed, tricks: rd.tricks, veterans: rd.veterans, short: rd.short, ready: rd.ready };
  } catch (e) {}
  return {
    day: (G.state && G.state.scholar && G.state.scholar.day) | 0,
    living: living.length,
    withAnyArmor: living.filter(r => r.anyArmor).length,
    demandMet: living.filter(r => r.demandMet).length,
    sumP: living.reduce((t, r) => t + (r.P | 0), 0),
    barAtCensus: bar,   // the engine's own waveCombatReadiness(4) at the census moment
    villagers: rows,
  };
}

async function replayOne(spec) {
  assertSubstrate();
  const armed = spec.arm === 'armed';
  if (spec.corpus === 'wave4reach') {
    if (armed) { process.env.VETREL = '1'; process.env.VETSHAPE = '1'; }
    else { delete process.env.VETREL; delete process.env.VETSHAPE; }
  } else {
    if (armed) process.env.VETSHAPE = '1'; else delete process.env.VETSHAPE;
  }
  process.env.WINPURSUIT = '1';
  process.env.WINDEFER = '1';
  const base = spec.corpus === 'wave4reach'
    ? (spec.policyId === 'leadfeast'
        ? VR.withVetrel(SD.leadseat, 'vetrel-leadseat', 'win-side leadfeast stack (SEATDRIVE=0) + VETREL')
        : VR.withVetrel(SD.belongseat, 'vetrel-belongseat', 'win-side belongfeast stack (SEATDRIVE=0) + VETREL'))
    : (spec.policyId === 'leadfeast' ? SD.leadseat : SD.belongseat);
  const mode = `${spec.corpus}-${armed ? 'armed' : 'control'}`;
  const { Game } = await loadGame({ seed: spec.seed, mode, fullTelemetry: false });
  await setupGame(Game);
  const policy = Object.assign({}, base);
  const oSetup = base.setup;
  policy.setup = (G, ctx) => {
    SD.layerOn(); WD.layerOn();
    if (oSetup) return oSetup(G, ctx);
  };
  const oDaily = base.daily;
  let firstW4Day = null, lastUnready = null, census = null;
  policy.daily = (G, ctx) => {
    let r;
    if (oDaily) { try { r = oDaily(G, ctx); } catch (e) {} }
    try {
      const day = G.state.scholar.day;
      if (firstW4Day == null && typeof G.unlockedWave === 'function' && G.unlockedWave() >= 4) {
        firstW4Day = day;
        census = censusVillagers(G); // state at the moment the door opened
      }
      if (firstW4Day == null && typeof G.waveCombatReadiness === 'function') {
        const rd = G.waveCombatReadiness(4);
        if (rd && !rd.ready)
          lastUnready = { day, armored: rd.armored, armed: rd.armed, tricks: rd.tricks,
            veterans: rd.veterans, short: rd.short };
      }
    } catch (e) {}
    return r;
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  const deaths = (result.samples && result.samples.deaths) || [];
  // Pre/post-unlock death detail with identities, for the armor-bleed
  // cross-reference: which unlock-day armored villagers died in the war the
  // unlock opened. entry = {day, kind, who, cause, player} (sim-harness).
  const deathsDetail = { pre: [], post: [] };
  const prePost = { pre: {}, post: {} };
  const matchWho = (entryWho, v) => {
    if (!entryWho) return false;
    const w = String(entryWho);
    return w === String(v.vid) || w === String(v.name) || (v.name && w.includes(v.name)) || (v.name && v.name.includes(w));
  };
  for (const d of deaths) {
    const c = String((d && d.cause) || 'unknown');
    const isPost = firstW4Day != null && (d.day | 0) >= firstW4Day;
    const bucket = isPost ? deathsDetail.post : deathsDetail.pre;
    const tally = isPost ? prePost.post : prePost.pre;
    bucket.push({ day: d.day | 0, kind: d.kind || null, who: d.who != null ? String(d.who) : null,
      cause: c, player: !!d.player });
    tally[c] = (tally[c] || 0) + 1;
  }
  let armorBleed = null;
  if (census && firstW4Day != null) {
    const metAtUnlock = census.villagers.filter(v => !v.dead && v.demandMet);
    const diedPost = metAtUnlock.filter(v =>
      deathsDetail.post.some(d => matchWho(d.who, v)));
    const livedPost = metAtUnlock.filter(v =>
      !deathsDetail.post.some(d => matchWho(d.who, v)));
    armorBleed = {
      demandMetAtUnlock: metAtUnlock.length,
      demandMetDiedPost: diedPost.length,
      demandMetNames: metAtUnlock.map(v => `${v.name}(P${v.P})`),
      diedPostNames: diedPost.map(v => {
        const d = deathsDetail.post.find(dd => matchWho(dd.who, v));
        return `${v.name}(P${v.P},d${d ? d.day : '?'},${d ? d.cause : '?'})`;
      }),
      livedPostNames: livedPost.map(v => `${v.name}(P${v.P})`),
      postCombatDeaths: deathsDetail.post.filter(d => /combat|monster/i.test(d.cause)).length,
      postTotal: deathsDetail.post.length,
    };
  }
  let readiness = null, standing = null;
  try { readiness = Game.waveCombatReadiness(4); } catch (e) {}
  try { standing = Game.villageStanding(); } catch (e) {}
  const replay = {
    spec, firstW4Day,
    bindingBars: firstW4Day != null ? (lastUnready ? lastUnready.short : []) : null,
    bindingSnapshot: lastUnready,
    gameDays: result.gameDays, days: result.days, endReason: result.endReason,
    won: Game.won ? 1 : 0,
    maxWaveUnlocked: result.maxWaveUnlocked || 1,
    deathsTotal: deaths.length,
    deathsStarv: deaths.filter(d => /starv|hunger|famine/i.test(String(d && d.cause))).length,
    deathsPre: prePost.pre, deathsPost: prePost.post,
    deathsDetail, armorBleed,
    readiness4: readiness ? { ready: readiness.ready, armored: readiness.armored,
      armed: readiness.armed, tricks: readiness.tricks, veterans: readiness.veterans,
      short: readiness.short } : null,
    standingTotal: standing ? (standing.total | 0) : null,
    census,
  };
  // Fidelity verification against the corpus JSON.
  const json = corpusRow(spec);
  const diffs = [];
  const eq = (k, a, b, norm) => {
    const na = norm ? norm(a) : a, nb = norm ? norm(b) : b;
    if (JSON.stringify(na) !== JSON.stringify(nb)) diffs.push(`${k}: replay=${JSON.stringify(na)} json=${JSON.stringify(nb)}`);
  };
  if (json.firstW4Day != null) eq('firstW4Day', replay.firstW4Day, json.firstW4Day);
  if (json.bindingBars != null) eq('bindingBars', replay.bindingBars, json.bindingBars, v => (v || []).slice().sort());
  eq('gameDays', replay.gameDays, json.gameDays);
  eq('days', replay.days, json.days);
  eq('endReason', replay.endReason, json.endReason);
  eq('won', replay.won, json.won | 0);
  eq('deathsTotal', replay.deathsTotal, json.deaths && json.deaths.total);
  eq('deathsStarv', replay.deathsStarv, json.deaths && json.deaths.starv);
  eq('readiness4', replay.readiness4 && { armored: replay.readiness4.armored, armed: replay.readiness4.armed, tricks: replay.readiness4.tricks, veterans: replay.readiness4.veterans },
     json.readiness4 && { armored: json.readiness4.armored, armed: json.readiness4.armed, tricks: json.readiness4.tricks, veterans: json.readiness4.veterans });
  if (json.standingTotal != null) eq('standingTotal', replay.standingTotal, json.standingTotal);
  replay.fidelity = diffs.length === 0 ? 'MATCHED' : 'DRIFTED';
  replay.fidelityDiffs = diffs;
  replay.sweepCommit = json.sweepCommit;
  return replay;
}

async function main() {
  const only = process.argv.includes('--run') ? process.argv[process.argv.indexOf('--run') + 1] : null;
  const specs = UNLOCK_RUNS.filter(s =>
    !only || `${s.corpus}:${s.arm}:${s.policyId}:${s.seed}` === only);
  if (only && specs.length === 0) { console.error('no such run tag'); process.exit(2); }
  const out = [];
  for (const s of specs) {
    const t0 = Date.now();
    let r;
    try { r = await replayOne(s); }
    catch (e) { r = { spec: s, crashed: true, error: String(e && e.message) }; }
    out.push(r);
    const tag = `${s.corpus}:${s.arm}:${s.policyId}:s${s.seed}`;
    if (r.crashed) console.error(`  CRASH ${tag}: ${r.error}`);
    else console.error(`  [${tag}] w4@${r.firstW4Day} fidelity=${r.fidelity}${r.fidelity === 'DRIFTED' ? ' ' + JSON.stringify(r.fidelityDiffs) : ''} censusLiving=${r.census ? r.census.living : '?'} censusMet=${r.census ? r.census.demandMet : '?'}`);
  }
  if (process.argv.includes('--json')) { console.log(JSON.stringify(out, null, 1)); return out; }
  return out;
}

if (require.main === module) main().catch(e => { console.error('CENSUS CRASH:', e); process.exit(2); });
module.exports = { replayOne, censusVillagers, UNLOCK_RUNS };
