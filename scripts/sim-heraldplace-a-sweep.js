#!/usr/bin/env node
// sim-heraldplace-a-sweep.js — HERALD PLACEMENT VS WANDERING census
// (DIAG ONLY). Position instrument for backlog #1617.
//
// Substrate (named exactly, see the prereg): tableseat-nowait
// (LEANLINKRESCUE=1, TABLESEATNOWAIT=1) + fullseat-diag +
// wavegate-diag + vet2-diag + vet2mfg-diag, all REUSED UNMODIFIED,
// plus muster-diag (MUSTER=1, REUSED UNMODIFIED, SECONDARY CHECK
// ONLY: verb counters + herald refusal snapshots).
//
// New capture (this arm) wraps ONLY, all pure observation (call
// through with identical arguments and return values, never mutate
// game state, never draw RNG, never throw into the engine):
//   spawnWorldMonster (herald lair events),
//   removeWorldMonster (herald departures),
//   wanderWorldMonsters (before/after herald tile steps),
//   villagerMonsterTick (NPCs on the herald tile per tick),
//   worldTick (wander-opportunity counter),
//   titanDawnTick (dawn position snapshots),
//   startCombat (scholar herald contacts),
//   resolveWildMonsterEncounter (villager herald contacts),
//   Game.say (omen2 / pads-into-clearing / refusal needles + ring).
//
// STDOUT-RUNNER (titangate lesson): the game-loaded process never
// writes a file — it prints EXACTLY ONE JSON line per seed to
// stdout (progress to stderr). Split with the brace-depth splitter
// (scripts/sim-muster-a-split.js, plain node, no game loaded) or
// any newline splitter — this sweep writes a REAL newline
// separator (the sim-muster-a sweep's literal-separator bug is
// fixed here by construction; see that arm's evidence).
//
//   LEANLINKRESCUE=1 TABLESEATNOWAIT=1 FULLSEAT=1 WAVEGATE=1 VET2=1 VET2MFG=1 \
//     MUSTER=1 SIMHERALDPLACE=1 SEEDS=95304 node scripts/sim-heraldplace-a-sweep.js > out.jsonl 2> out.err
//   node scripts/sim-muster-a-split.js out.jsonl <evid-dir>
//
// Legs: ON = SIMHERALDPLACE=1 (this capture + muster-diag).
// OFF = SIMHERALDPLACE unset (same substrate + diag policies,
// neither capture installed; the neutrality leg's OFF side).
'use strict';
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { tableseatNowait } = require(path.join(REPO, 'scripts', 'policies', 'tableseat-nowait'));
const WG = require(path.join(REPO, 'scripts', 'policies', 'wavegate-diag'));
const FD = require(path.join(REPO, 'scripts', 'policies', 'fullseat-diag'));
const V2 = require(path.join(REPO, 'scripts', 'policies', 'vet2-diag'));
const MFG = require(path.join(REPO, 'scripts', 'policies', 'vet2mfg-diag'));
const MD = require(path.join(REPO, 'scripts', 'policies', 'muster-diag'));
const HPL = require(path.join(REPO, 'scripts', 'sim-heraldplace-a-lib'));
const MUSTERLIB = require(path.join(REPO, 'scripts', 'sim-muster-a-lib'));

for (const k of ['LEANLINKRESCUE', 'TABLESEATNOWAIT', 'FULLSEAT', 'WAVEGATE', 'VET2', 'VET2MFG']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required.`); process.exit(2); }
}
const CAP_ON = process.env.SIMHERALDPLACE === '1';
if (CAP_ON && process.env.MUSTER !== '1') { console.error('SWEEP STOP: MUSTER=1 is required on the ON leg.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : []).filter(Number.isFinite);
if (!SEEDS.length) { console.error('SWEEP STOP: SEEDS required.'); process.exit(2); }
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function policyFor() {
  const wg = WG.withWavegateDiag(tableseatNowait, 'wavegate-diag', 'tableseat-nowait + wave-gate recorder');
  const fd = FD.withFullseatDiag(wg, 'fullseat-diag', 'tableseat-nowait + full-seat recorder');
  const v2 = V2.withVet2Diag(fd, 'vet2-diag', 'tableseat-nowait + veteran recorder');
  return MFG.withVet2mfgDiag(v2, 'vet2mfg-diag', 'tableseat-nowait + wave-4 funnel recorder');
}

function installHeraldPlaceCapture(Game, store) {
  const dayOf = () => { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } };
  const scholarTile = () => { try { return { x: Game.map.px, y: Game.map.py }; } catch (e) { return null; } };
  const havenTile = () => { try { const v = Game.state.village || {}; return { x: (v.px == null ? 4 : v.px), y: (v.py == null ? 4 : v.py) }; } catch (e) { return { x: 4, y: 4 }; } };
  const heraldMon = () => { try { return (Game.worldMonsters() || []).find(m => m && m.id === 'herald') || null; } catch (e) { return null; } };
  const heraldTile = () => { const m = heraldMon(); return m ? { x: m.tx, y: m.ty } : null; };
  const omenStage = () => { try { const o = ((Game.state || {}).titans || {}).omens || {}; return o.herald ? (o.herald.stage != null ? o.herald.stage : null) : null; } catch (e) { return null; } };
  const tileType = (t) => { try { const tl = Game.tileAt(t.x, t.y); return tl ? (tl.type || null) : null; } catch (e) { return null; } };
  const npcsOn = (t) => { try { return t ? (Game.npcsOnNode(t.x, t.y) || []) : []; } catch (e) { return []; } };
  const npcHistogram = () => {
    try {
      const roster = ((Game.state || {}).village || {}).roster || [];
      const hist = {};
      let counted = 0;
      roster.forEach(function (rid) {
        if (rid === Game.villagerId) return;
        try { const n = Game.npcNode(rid); if (n) { const k = n.nx + ',' + n.ny; hist[k] = (hist[k] || 0) + 1; counted++; } } catch (e) {}
      });
      return { hist: hist, counted: counted, distinctTiles: Object.keys(hist).length };
    } catch (e) { return { hist: {}, counted: 0, distinctTiles: 0 }; }
  };
  // Hypothetical muster yield at a moment (secondary check only;
  // same replication as sim-muster-a, via its shared lib).
  function yieldNow() {
    try {
      const titans = (Game.state || {}).titans || {};
      const muster = (titans.musters || {}).herald || null;
      const already = {};
      (muster && muster.allies || []).forEach(function (a) { if (a && a.villageId) already[a.villageId] = (already[a.villageId] || 0) + 1; });
      const committed = {};
      Object.keys(titans.musters || {}).forEach(function (t2) {
        if (titans.slain && titans.slain[t2]) return;
        ((titans.musters[t2] || {}).allies || []).forEach(function (a) { if (a && a.vid) committed[a.villageId + ':' + a.vid] = true; });
      });
      let links = [];
      try { links = (typeof Game.hierarchyState === 'function') ? Game.hierarchyState() : []; } catch (e) { links = []; }
      const plain = [];
      (links || []).filter(function (l) { return l && l.status === 'active'; }).forEach(function (link) {
        try {
          let vid = null;
          try { vid = (typeof Game._linkOther === 'function') ? Game._linkOther(link, 'haven') : (link.primary === 'haven' ? link.subordinate : link.primary); } catch (e) { vid = null; }
          let ov = null;
          try { ov = (typeof Game._otherVillage === 'function') ? Game._otherVillage(vid) : null; } catch (e) { ov = null; }
          let facesFree = 0;
          try {
            facesFree = ((ov && ov.roster) || []).filter(function (r) {
              return r && r.alive && (r.age == null || r.age >= 18) && (r.health === undefined || r.health > 0) && !committed[vid + ':' + r.id];
            }).length;
          } catch (e) { facesFree = 0; }
          plain.push({ villageId: vid, trust: link.trust || 0, opinion: (ov && ov.opinion) || 0, arrears: link.arrears || 0, facesFree: facesFree });
        } catch (e) {}
      });
      const cfg = ((Game.data || {}).titans || {})._coalition || {};
      return MUSTERLIB.hypotheticalYield(plain, cfg, already).total;
    } catch (e) { return null; }
  }

  const origs = {};
  const wrap = (method, fn) => {
    const orig = Game[method];
    if (typeof orig !== 'function') { store.captureErrs++; if (store.errors.length < 20) store.errors.push('missing:' + method); return; }
    origs[method] = orig;
    Game[method] = fn(orig);
  };
  const noteErr = (where, e) => { store.captureErrs++; if (store.errors.length < 20) store.errors.push(where + ': ' + String((e && e.message) || e).slice(0, 120)); };

  // Dawn snapshot (after the dawn tick: omen advance + upkeep applied).
  wrap('titanDawnTick', (orig) => function () {
    const r = orig.apply(this, arguments);
    try {
      const ht = heraldTile(), st = scholarTile(), hv = havenTile();
      const hist = npcHistogram();
      let npcNear = 0;
      if (ht) {
        Object.keys(hist.hist).forEach(function (k) {
          const parts = k.split(',').map(Number);
          if (Math.max(Math.abs(parts[0] - ht.x), Math.abs(parts[1] - ht.y)) <= 1) npcNear += hist.hist[k];
        });
      }
      store.dawns.push({
        day: dayOf(), omenStage: omenStage(), heraldTile: ht, scholarTile: st, havenTile: hv,
        distHavenMan: HPL.manhattan(ht, hv), distHavenCheb: HPL.chebyshev(ht, hv),
        distScholarMan: HPL.manhattan(ht, st), distScholarCheb: HPL.chebyshev(ht, st),
        npcOnHeraldTile: ht ? npcsOn(ht).length : 0,
        npcNearHerald: npcNear, npcDistinctTiles: hist.distinctTiles, npcCounted: hist.counted,
        worldTicks: store.worldTickCount,
      });
    } catch (e) { noteErr('dawn', e); }
    return r;
  });

  wrap('worldTick', (orig) => function () {
    store.worldTickCount++;
    return orig.apply(this, arguments);
  });

  wrap('spawnWorldMonster', (orig) => function () {
    const r = orig.apply(this, arguments);
    try {
      const mon = r;
      if (mon && mon.id === 'herald') {
        const t = { x: mon.tx, y: mon.ty }, st = scholarTile(), hv = havenTile();
        store.lairs.push({
          day: dayOf(), tx: t.x, ty: t.y, tileType: tileType(t),
          scholarTile: st, havenTile: hv,
          distHavenMan: HPL.manhattan(t, hv), distHavenCheb: HPL.chebyshev(t, hv),
          distScholarMan: HPL.manhattan(t, st), distScholarCheb: HPL.chebyshev(t, st),
        });
        if (!store.firstEvents.beatOmen2) store.firstEvents.beatOmen2 = store.ring.slice();
      }
    } catch (e) { noteErr('spawn', e); }
    return r;
  });

  wrap('removeWorldMonster', (orig) => function () {
    try {
      const m = arguments.length ? arguments[0] : null;
      if (m && m.id === 'herald') store.removals.push({ day: dayOf(), tx: m.tx, ty: m.ty });
    } catch (e) { noteErr('remove', e); }
    return orig.apply(this, arguments);
  });

  wrap('wanderWorldMonsters', (orig) => function () {
    let before = null;
    try { before = heraldTile(); } catch (e) { before = null; }
    const stBefore = scholarTile(), hvBefore = havenTile();
    const r = orig.apply(this, arguments);
    try {
      const after = heraldTile();
      store.wanderCalls++;
      if (before || after) {
        store.steps.push({
          day: dayOf(), from: before, to: after,
          scholarTile: stBefore, havenTile: hvBefore,
          classScholar: HPL.stepClass(before, after, stBefore),
          classHaven: HPL.stepClass(before, after, hvBefore),
        });
      }
    } catch (e) { noteErr('wander', e); }
    return r;
  });

  wrap('villagerMonsterTick', (orig) => function () {
    try {
      const ht = heraldTile();
      if (ht) {
        const ids = npcsOn(ht);
        store.vtTicksHeraldPresent++;
        if (ids.length) {
          store.vtTicksNpcOnTile++;
          store.vtNpcEvents.push({ day: dayOf(), heraldTile: ht, npcIds: ids.slice(), npcCount: ids.length });
        }
      }
    } catch (e) { noteErr('vt', e); }
    return orig.apply(this, arguments);
  });

  const NEEDLES = [
    ['omen2', /Scouts found its lair/],
    ['pads', /pads into the clearing/],
    ['refusal', /does not notice you/],
    ['call', /THE CALL GOES OUT/],
    ['omen0', /Scouts come back pale/],
    ['omen1', /They name it/],
  ];
  wrap('say', (orig) => function () {
    try {
      const raw = (arguments.length && arguments[0] != null) ? String(arguments[0]) : '';
      store.ring.push({ day: dayOf(), text: raw.slice(0, 500) });
      if (store.ring.length > 12) store.ring.shift();
      NEEDLES.forEach(function (spec) {
        if (spec[1].test(raw)) {
          store.sayLines.push({ day: dayOf(), kind: spec[0], text: raw.slice(0, 500) });
          if (spec[0] === 'omen2' && !store.firstEvents.beatOmen2) store.firstEvents.beatOmen2 = store.ring.slice();
        }
      });
    } catch (e) { store.captureErrs++; }
    return orig.apply(this, arguments);
  });

  wrap('startCombat', (orig) => function () {
    let r;
    try { r = orig.apply(this, arguments); } catch (e) { throw e; }
    try {
      const mid = arguments.length ? arguments[0] : null;
      if (mid === 'herald') {
        let outcome = (r === null || r === undefined) ? 'refused' : 'fought';
        try {
          const outs = ((Game.state || {}).titans || {}).outcomes || [];
          for (let i = outs.length - 1; i >= 0; i--) {
            const o = outs[i];
            if (o && o.titan === 'herald' && o.outcome === 'refused') { outcome = 'refused'; break; }
          }
        } catch (e) {}
        const c = { day: dayOf(), channel: 'scholar', mid: mid, outcome: outcome,
          scholarTile: scholarTile(), heraldTile: heraldTile(), yieldNow: yieldNow() };
        store.contacts.push(c);
        if (!store.firstEvents.beatFirstContact) store.firstEvents.beatFirstContact = store.ring.slice();
      }
    } catch (e) { noteErr('startCombat', e); }
    return r;
  });

  wrap('resolveWildMonsterEncounter', (orig) => function () {
    let r;
    try { r = orig.apply(this, arguments); } catch (e) { throw e; }
    try {
      const m = arguments.length > 1 ? arguments[1] : null;
      if (m && m.id === 'herald') {
        const vid = arguments.length ? arguments[0] : null;
        const c = { day: dayOf(), channel: 'villager', mid: 'herald',
          outcome: (r && r.outcome) || null, vid: vid,
          scholarTile: scholarTile(), heraldTile: heraldTile(), yieldNow: yieldNow() };
        store.contacts.push(c);
        if (!store.firstEvents.beatFirstContact) store.firstEvents.beatFirstContact = store.ring.slice();
      }
    } catch (e) { noteErr('resolve', e); }
    return r;
  });

  return function uninstall() {
    Object.keys(origs).forEach(function (m) { try { Game[m] = origs[m]; } catch (e) {} });
  };
}

async function oneRun(seed) {
  const policy = policyFor();
  const wg = policy.wavegateStore || null;
  const v2 = policy.vet2Store || null;
  const mfg = policy.vet2mfgStore || null;
  const { Game } = await loadGame({ seed, mode: 'herald', fullTelemetry: false });
  await setupGame(Game);
  const store = {
    lairs: [], removals: [], dawns: [], steps: [], contacts: [], sayLines: [], ring: [],
    firstEvents: {}, captureErrs: 0, errors: [],
    worldTickCount: 0, wanderCalls: 0,
    vtTicksHeraldPresent: 0, vtTicksNpcOnTile: 0, vtNpcEvents: [],
  };
  let mstore = null, uninstall = function () {};
  if (CAP_ON) {
    mstore = MD.newStore();
    MD.installMusterDiag(Game, mstore);
    uninstall = installHeraldPlaceCapture(Game, store);
  }
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { uninstall(); } catch (e) {}
  const st = Game.state || {};
  let national = 0, table = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  const maxWave = result.maxWaveUnlocked || 1;
  let won = 0;
  try { won = !!Game.won ? 1 : 0; } catch (e) {}
  let gameDays = 0;
  try { gameDays = (st.scholar && st.scholar.day) || 0; } catch (e) {}
  let endSnap = null;
  try { endSnap = FD.snapFullSeat(Game); } catch (e) { endSnap = { error: String((e && e.message) || e).slice(0, 120) }; }
  let endHerald = null;
  try {
    const m = (Game.worldMonsters() || []).find(x => x && x.id === 'herald') || null;
    const omen = ((st.titans || {}).omens || {}).herald || null;
    endHerald = { present: !!m, tile: m ? { x: m.tx, y: m.ty } : null, omenStage: omen ? (omen.stage != null ? omen.stage : null) : null };
  } catch (e) { endHerald = { error: String((e && e.message) || e).slice(0, 120) }; }

  const out = {
    seed, instrument: CAP_ON ? 'heraldplace-a-v1+muster-diag' : 'substrate-only',
    substrate: 'withVet2mfgDiag(withVet2Diag(withFullseatDiag(withWavegateDiag(tableseatNowait))))' + (CAP_ON ? ' + muster-diag + sim-heraldplace-a capture' : ' (capture off)'),
    anchorCommit: ANCHOR,
    maxWave, wave4: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    national, table, won,
    days: result.days, gameDays, endReason: result.endReason,
    endScaleRank: (function () { try { return Game.scaleRank ? Game.scaleRank() : null; } catch (e) { return null; } })(),
    endSnap, endHerald,
    rows: wg ? wg.rows : [], recorderErrs: wg ? wg.errs : 0,
    vetRows: v2 ? v2.rows : [], vetErrs: v2 ? v2.errs : 0,
    mfgRows: mfg ? mfg.rows : [], mfgErrs: mfg ? mfg.errs : 0,
    lairs: store.lairs, removals: store.removals, dawns: store.dawns,
    steps: store.steps, contacts: store.contacts, sayLines: store.sayLines,
    firstEvents: store.firstEvents, captureErrs: store.captureErrs, captureErrors: store.errors,
    worldTickCount: store.worldTickCount, wanderCalls: store.wanderCalls,
    vtTicksHeraldPresent: store.vtTicksHeraldPresent, vtTicksNpcOnTile: store.vtTicksNpcOnTile,
    vtNpcEvents: store.vtNpcEvents,
    musterDiag: mstore ? { calls: mstore.calls, callTotals: mstore.callTotals, commitReturns: mstore.commitReturns, refusals: mstore.refusals, errs: mstore.errs, errors: mstore.errors } : null,
  };
  process.stdout.write(JSON.stringify(out) + '\n');
  const nC = store.contacts.length;
  const verbs = mstore ? JSON.stringify(mstore.callTotals) : 'off';
  console.error(`done s${seed}: lairs=${store.lairs.length} contacts=${nC} steps=${store.steps.length} dawns=${store.dawns.length} worldTicks=${store.worldTickCount} vtNpc=${store.vtTicksNpcOnTile}/${store.vtTicksHeraldPresent} verbs=${verbs} maxWave=${maxWave} nat=${national} table=${table} won=${won} end=${result.endReason} days=${gameDays} rank=${out.endScaleRank} capErrs=${store.captureErrs} mdErrs=${mstore ? mstore.errs : 'off'}`);
  return out;
}

(async () => {
  for (const seed of SEEDS) {
    try { await oneRun(seed); }
    catch (e) { console.error(`ERROR s${seed}: ${e && e.message}`); process.exitCode = 1; }
  }
})();
