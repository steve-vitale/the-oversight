#!/usr/bin/env node
// probe-eggroad-a-20261026.js — eggroad pilot probe (sim-eggroad-a, 2026-10-26).
//
// Substrate: r53 endgame stack exactly (capable + deedhunt + vetcommit +
// armorydrive + vetguard + fullseat-diag) with ONE deliberate change:
// CAPABLE_GREEDY is OFF and a probe-local sit-gate replaces it — the bot
// NEVER sits until pg.networkFallen (the eggroad deferral). Greedy's
// defaults (sit by tier 4 / day 145) would kill the road before tier 3 +
// three titan kills can complete.
//
// Titan drive: r42's daily driver, adapted — omen stage >= 2 -> war
// council -> sound the call -> commit Haven's own (up to 3) -> march and
// fight when muster-ready -> stand down on stall (20 days no growth
// below half the gate, or 45 days held unanswered). The Network joins
// the drive list once summoned (current node monster).
//
// Env (required): FULLSEAT=1 VETCOMMIT=1 ARMORYDRIVE=1 CAPABLE_VETGUARD=1.
// CAPABLE_GREEDY must be UNSET (the sit-gate owns sitting, not greedy).
// Usage:
//   FULLSEAT=1 VETCOMMIT=1 ARMORYDRIVE=1 CAPABLE_VETGUARD=1 node scripts/probe-eggroad-a-20261026.js
//   SEEDS=88101,88102 DAYS=180 ... (defaults: seeds 88101-88108, 180d)
// Output: evidence/2026-10-26/perseed-eggroad-a/<seed>.json per seed.
// Exports (for the proof test): sitAllowed, eggroadCensus, titanIds.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const DS = require('./policies/deed-seeking');
const CAP = require('./policies/capable');
const FSD = require('./policies/fullseat-diag');
const VC = require('./policies/vetcommit');
const AD = require('./policies/armorydrive');
const CMP = require('./policies/competent');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [88101, 88102, 88103, 88104, 88105, 88106, 88107, 88108]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-26', 'perseed-eggroad-a');
const MIN_ALLIES = { finale: 20, nielsen: 12, herald: 10, the_network: 20 };

const day = (G) => { try { return (G.state.scholar || {}).day || 0; } catch (e) { return 0; }; };
const stripHtml = (s) => String(s == null ? '' : s).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

// ---- sit-gate (the eggroad deferral; probe-local, reversible) ----
function sitAllowed(G) {
  try { return !!((G.progState && G.progState()) || {}).networkFallen; } catch (e) { return false; }
}

// ---- chain census (pure reads; never writes, never draws RNG) ----
function omenOf(G, tid) {
  try {
    const st = (G.state || {}).titans || {};
    return (st.omens || {})[tid] || null;
  } catch (e) { return null; }
}
function slainOf(G, tid) {
  try {
    const st = G._titanTest && G._titanTest.titanState ? G._titanTest.titanState() : null;
    return !!(st && st.slain && st.slain[tid]);
  } catch (e) { return false; }
}
function titanIds(G) {
  const ids = [];
  try {
    const cast = G.titanCast ? G.titanCast() : null;
    if (cast) {
      if (cast.herald && ids.indexOf(cast.herald) < 0) ids.push(cast.herald);
      if (cast.apocalypse && ids.indexOf(cast.apocalypse) < 0) ids.push(cast.apocalypse);
    }
  } catch (e) {}
  try {
    const third = G.overtimeThirdTitan ? G.overtimeThirdTitan() : null;
    if (third && ids.indexOf(third) < 0) ids.push(third);
  } catch (e) {}
  try {
    const pg = (G.progState && G.progState()) || {};
    if (pg.networkSummoned && !pg.networkFallen && !pg.networkLost && ids.indexOf('the_network') < 0) ids.push('the_network');
  } catch (e) {}
  return ids;
}
function eggroadCensus(G, extra) {
  const c = { day: day(G) };
  try {
    const pg = (G.progState && G.progState()) || {};
    const s = G.state.scholar || {};
    c.alive = !G.over;
    c.won = !!G.won;
    c.endDay = s.day || 0;
    c.seat = null; c.seatDetail = null;
    try { const st = G.tableSeat ? G.tableSeat() : null; if (st) { c.seat = st.seat; c.seatDetail = st.detail || null; } } catch (e) {}
    try { c.fullSeat = G.deedGateReady ? !!G.deedGateReady().ok : null; } catch (e) { c.fullSeat = null; }
    c.tableAnnounced = !!pg.tableAnnounced;
    c.tableWaiting = !!pg.tableWaiting;
    c.tableDone = !!pg.tableDone;
    try { c.overtimeTier = G.overtimeTier ? G.overtimeTier() : 0; } catch (e) { c.overtimeTier = null; }
    try { c.unlockedWave = G.unlockedWave ? G.unlockedWave() : null; } catch (e) { c.unlockedWave = null; }
    try { const st = G.villageStanding ? G.villageStanding() : null; c.standing = st ? { total: st.total, war: st.war, diplomacy: st.diplomacy, plenty: st.plenty, warPts: st.warPts, links: st.links, feasts: st.feasts } : null; } catch (e) { c.standing = null; }
    try { const r4 = G.waveCombatReadiness ? G.waveCombatReadiness(4) : null; c.ready4 = r4 ? { ready: r4.ready, armored: r4.armored, armed: r4.armed, tricks: r4.tricks, veterans: r4.veterans, short: r4.short } : null; } catch (e) { c.ready4 = null; }
    try { const r5 = G.waveCombatReadiness ? G.waveCombatReadiness(5) : null; c.ready5 = r5 ? { ready: r5.ready, armored: r5.armored, armed: r5.armed, tricks: r5.tricks, veterans: r5.veterans, short: r5.short } : null; } catch (e) { c.ready5 = null; }
    try { c.scaleRank = G.scaleRank ? G.scaleRank() : null; } catch (e) { c.scaleRank = null; }
    try { c.stage = G.integrationStage ? G.integrationStage() : null; } catch (e) { c.stage = null; }
    try {
      const log = G.state.waveKillLog || [];
      const killers = [...new Set(log.map(e => e && e.by).filter(Boolean))];
      c.veteranKillers = killers.length;
      c.livingVeterans = killers.filter(vid => {
        if (vid === G.villagerId) return true;
        try { const vp = G.vpOf ? G.vpOf(vid) : null; return !!(vp && !vp.dead); } catch (e) { return ((G.state.village || {}).roster || []).indexOf(vid) >= 0; }
      }).length;
    } catch (e) { c.livingVeterans = null; c.veteranKillers = null; }
    c.titans = {};
    for (const tid of ['herald', 'nielsen', 'finale', 'the_network']) {
      const o = omenOf(G, tid);
      let ready = null;
      try { ready = G.titanMusterReady ? !!G.titanMusterReady(tid) : null; } catch (e) {}
      c.titans[tid] = { omenStage: o ? (o.stage | 0) : null, omenExists: !!o, ready, slain: slainOf(G, tid) };
    }
    c.networkSummoned = !!pg.networkSummoned;
    c.networkFallen = !!pg.networkFallen;
    c.networkLost = !!pg.networkLost;
    try { const nc = G.networkCampaign ? G.networkCampaign() : null; c.networkIdx = nc ? nc.idx : null; c.networkCleared = nc ? (nc.cleared || []).slice() : null; } catch (e) {}
    try { c.rosterAlive = ((G.state.village || {}).roster || []).length; } catch (e) {}
    if (extra) Object.assign(c, extra);
  } catch (e) { c.censusErr = String(e && e.message || e).slice(0, 200); }
  return c;
}

// ---- titan drive (r42 keyTitanDaily, adapted; probe-local) ----
function titanMonsterId(G, tid) {
  try {
    if (tid === 'finale') {
      const c = G.finaleCampaign ? G.finaleCampaign() : null;
      if (!c || !c.crew) return 'finale_crew';
      if (!c.opening) return 'finale_opening';
      return 'finale';
    }
    if (tid === 'the_network') {
      const cur = G.networkCurrentNode ? G.networkCurrentNode() : null;
      return cur ? cur.monster : null;
    }
    return tid;
  } catch (e) { return null; }
}
function findWorldMonster(G, mid) {
  try {
    const list = G.worldMonsters ? G.worldMonsters() : [];
    for (const w of list) {
      if (!w) continue;
      if (w.id === mid || w.monster === mid) return w;
    }
  } catch (e) {}
  return null;
}
function musterBlades(G, tid) {
  try {
    const TT = G._titanTest || {};
    const st2 = TT.titanState ? TT.titanState() : null;
    const muster = st2 && st2.musters ? st2.musters[tid] : null;
    if (!muster) return { total: 0, haven: 0 };
    const allies = (muster.allies || []).length;
    let haven = 0;
    try { haven = (G.titanHavenBlades ? G.titanHavenBlades(muster) : []).length; } catch (e) {}
    return { total: allies + haven, haven };
  } catch (e) { return { total: 0, haven: 0 }; }
}
function eggroadTitanDaily(G, ctx, m) {
  const k = ctx._eggk = ctx._eggk || {};
  const TT = G._titanTest || {};
  const dNow = day(G);
  for (const tid of titanIds(G)) {
    const s = k[tid] = k[tid] || { stage: 0, council: false, called: false, callDay: null, commits: 0, fights: 0, slain: false, ready: false, stoodDown: null, bladeHist: [] };
    if (s.stoodDown != null) continue;
    if (slainOf(G, tid)) { s.slain = true; continue; }
    const o = omenOf(G, tid);
    const stage = o ? (o.stage | 0) : 0;
    s.stage = stage;
    if (stage < 2) continue;
    if (!s.council) {
      try { G.titanWarCouncil(tid); } catch (e) { s.councilErr = String(e && e.message || e).slice(0, 120); }
      s.council = true;
    }
    if (!s.called) {
      try { G.soundTitanCall(tid); s.callDay = dNow; } catch (e) { s.callErr = String(e && e.message || e).slice(0, 120); }
      s.called = true;
    }
    try {
      let blades = 0;
      const st2 = TT.titanState ? TT.titanState() : null;
      const muster = st2 && st2.musters ? st2.musters[tid] : null;
      blades = muster ? ((muster.haven || []).length) : 0;
      s.havenBlades = blades;
      if (blades < 3 && s.commits < 8) {
        const r = TT.titanCommitOwn ? TT.titanCommitOwn(tid) : null;
        s.commits++;
        if (r === 'confirm') { try { TT.titanCommitOwn(tid); } catch (e) {} }
      }
    } catch (e) { s.commitErr = String(e && e.message || e).slice(0, 120); }
    let ready = false;
    try { ready = G.titanMusterReady ? !!G.titanMusterReady(tid) : false; } catch (e) {}
    s.ready = ready;
    if (!ready) {
      try {
        const mb = musterBlades(G, tid);
        const need = MIN_ALLIES[tid] || 12;
        if (s.bladeHist.length === 0 || s.bladeHist[s.bladeHist.length - 1].day < dNow) {
          s.bladeHist.push({ day: dNow, blades: mb.total });
          if (s.bladeHist.length > 60) s.bladeHist.shift();
        }
        const daysHeld = s.callDay != null ? dNow - s.callDay : 0;
        const recent = s.bladeHist.filter(h => h.day >= dNow - 15);
        const maxRecent = recent.length ? Math.max.apply(null, recent.map(h => h.blades)) : 0;
        const stalled = daysHeld >= 20 && mb.total < need && mb.total <= maxRecent && mb.total < Math.ceil(need / 2);
        const hardStop = daysHeld >= 45 && mb.total < need;
        if ((stalled || hardStop) && typeof G.titanSelfDo === 'function') {
          const acts = (G.titanSelfActions ? G.titanSelfActions() : []) || [];
          if (acts.some(a => a && a.id === 'titan:standdown:' + tid)) {
            try {
              G.titanSelfDo('titan:standdown:' + tid);
              s.stoodDown = dNow;
              s.stoodDownBlades = mb.total;
              s.stoodDownReason = stalled ? 'stalled-15d-below-half-gate' : 'held-45d-unanswered';
              if (m && m.key && m.key.standdowns) m.key.standdowns.push({ day: dNow, tid, blades: mb.total, need, reason: s.stoodDownReason });
            } catch (e) { s.standdownErr = String(e && e.message || e).slice(0, 120); }
          }
        }
        s.musterSnap = JSON.stringify({ blades: mb.total, need, daysHeld });
      } catch (e) {}
      continue;
    }
    if (s.fights >= 8) continue;
    if (G.tbfight && !G.tbfight.over) continue;
    const mid = titanMonsterId(G, tid);
    if (!mid) { s.noMonster = (s.noMonster | 0) + 1; continue; }
    const w = findWorldMonster(G, mid);
    if (!w) { s.noMonster = (s.noMonster | 0) + 1; continue; }
    try {
      if (G.map.px !== w.tx || G.map.py !== w.ty) CMP.walkTo(G, w.tx, w.ty);
    } catch (e) { s.walkErr = String(e && e.message || e).slice(0, 120); }
    if (G.over) return;
    if (G.tbfight && !G.tbfight.over) continue;
    let here = null;
    try { here = (G.monsterAt ? G.monsterAt(G.map.px, G.map.py) : null) || (G.playerMonster ? G.playerMonster() : null); } catch (e) {}
    if (!here || (here.id !== mid && here.monster !== mid)) { s.noMonster = (s.noMonster | 0) + 1; continue; }
    try { G.startCombat(mid); s.fights++; } catch (e) { s.fightErr = String(e && e.message || e).slice(0, 120); }
  }
}

// ---- policy composition (r53 stack, greedy OFF) ----
function capableDeedHunt() {
  const p = Object.assign({}, CAP.capable);
  const oDaily = p.daily.bind(p);
  p.id = 'capable-deedhunt';
  p.desc = 'capable base + deed-seeking patrols/surge';
  p.daily = (G, c) => { oDaily(G, c); DS.deedPatrol(G, c); DS.surgeUpkeep(G, c); };
  return p;
}
function eggroadPolicy() {
  const inner = FSD.withFullseatDiag(
    AD.withArmoryDrive(
      VC.withVetCommit(capableDeedHunt(), 'capabledeedhunt+vetcommit', 'capable + deed-hunt + VETCOMMIT'),
      'capabledeedhunt+vetcommit+armorydrive', 'capable + deed-hunt + vetcommit + ARMORYDRIVE'),
    'capabledeedhunt+vetcommit+armorydrive+fullseatdiag', 'capable + deed-hunt + vetcommit + armorydrive + full-seat recorder');
  const oDaily = inner.daily.bind(inner);
  inner.daily = (G, c) => {
    oDaily(G, c);
    try { eggroadTitanDaily(G, c, null); } catch (e) { c.eggDriveErr = String(e && e.message || e).slice(0, 160); }
    try {
      const tc = (G.state.scholar || {}).tableChoices;
      if (tc && tc.options && tc.options.some(o => o && o.id === 'final:hosts')) c.hostsOffered = true;
      if (tc && tc.frame) c.lastTableFrame = tc.frame;
    } catch (e) {}
  };
  return inner;
}

async function runSeed(seed, days) {
  const m = { seed, key: { standdowns: [] } };
  let announceDay = null, networkSummonDay = null, hostsOfferedDay = null;
  let refusedSits = 0;
  const ctx = {};
  const { Game } = await loadGame({ seed, mode: 'endgame-r40', fullTelemetry: true });
  await setupGame(Game);
  // sit-gate wrap (probe-local): refuse every sit until the key falls.
  const origTakeSeat = Game.tableTakeSeat ? Game.tableTakeSeat.bind(Game) : null;
  if (origTakeSeat) {
    Game.tableTakeSeat = function () {
      if (!sitAllowed(Game)) { refusedSits++; return { ok: false, msg: '' }; }
      return origTakeSeat.apply(this, arguments);
    };
  }
  const policy = eggroadPolicy();
  const oDailyWrap = policy.daily.bind(policy);
  policy.daily = (G, c) => {
    oDailyWrap(G, c);
    if (announceDay == null && (G.progState && G.progState()).tableAnnounced) announceDay = day(G);
    if (networkSummonDay == null && (G.progState && G.progState()).networkSummoned) networkSummonDay = day(G);
    if (hostsOfferedDay == null && c.hostsOffered) hostsOfferedDay = day(G);
    Object.assign(ctx, c);
  };
  let result = null;
  const quiet = process.env.QUIET !== '0';
  if (quiet) {
    const { quietLog } = require('./sim-harness');
    await quietLog(async () => { result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 1 }); });
  } else {
    result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 1 });
  }
  const end = eggroadCensus(Game, {
    announceDay, networkSummonDay, hostsOfferedDay, refusedSits,
    titanDrive: ctx._eggk || null,
    capSeatDay: ctx.capSeatDay || null, capTablePath: ctx.capTablePath || null,
    endReason: (result && result.endReason) || (Game.over ? (Game.won ? 'won' : 'dead') : 'horizon'),
  });
  m.result = end;
  m.census = end;
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, seed + '.json'), JSON.stringify(m, null, 1));
  return m;
}

async function main() {
  for (const k of ['FULLSEAT', 'VETCOMMIT', 'ARMORYDRIVE', 'CAPABLE_VETGUARD']) {
    if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required.`); process.exit(2); }
  }
  if (process.env.CAPABLE_GREEDY === '1') { console.error('SWEEP STOP: CAPABLE_GREEDY must be UNSET (the sit-gate owns sitting).'); process.exit(2); }
  const rows = [];
  for (const s of SEEDS) {
    const r = await runSeed(s, DAYS);
    const c = r.census;
    rows.push({ seed: s, announceDay: c.announceDay, seat: c.seat, tier: c.overtimeTier, wave: c.unlockedWave, scale: c.scaleRank, heraldSlain: c.titans.herald.slain, nielsenSlain: c.titans.nielsen.slain, finaleSlain: c.titans.finale.slain, network: c.networkSummoned, fallen: c.networkFallen, end: c.endReason });
    console.log(`seed ${s}: announce=${c.announceDay} seat=${c.seat} tier=${c.overtimeTier} wave=${c.unlockedWave} scale=${c.scaleRank} heraldSlain=${c.titans.herald.slain} nielsenSlain=${c.titans.nielsen.slain} finaleSlain=${c.titans.finale.slain} networkSummoned=${c.networkSummoned} fallen=${c.networkFallen} end=${c.endReason}`);
  }
  console.log(JSON.stringify(rows));
}

if (require.main === module) main().catch(e => { console.error(e); process.exit(1); });
module.exports = { sitAllowed, eggroadCensus, titanIds, eggroadPolicy };
