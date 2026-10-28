#!/usr/bin/env node
// probe-eggdriver-a-20261026.js — eggroad driver arms P6 + P10 (sim-eggdriver-a).
//
// Steve's order 2026-10-26: proceed with fleshed-out proposals, adversarial
// review. This probe tests the eggroad pilot's driver proposals P6
// (snapshot-gated re-call) and P10 (muster-feeding call gate) as OPT-IN
// driver variants only. The pilot probe (probe-eggroad-a-20261026.js) is
// UNTOUCHED — this file copies its driver verbatim and adds gated hooks.
// No game code, no policy defaults changed. Default (ARM=base) must
// reproduce the pilot before any variant result is trusted.
//
// Substrate: r53 stack exactly (capable + deedhunt + vetcommit +
// armorydrive + vetguard + fullseat-diag), CAPABLE_GREEDY OFF, probe-local
// sit-gate (never sit until pg.networkFallen).
//
// Env (required): FULLSEAT=1 VETCOMMIT=1 ARMORYDRIVE=1 CAPABLE_VETGUARD=1,
// EGGDRIVER_ARM=base|p6|p10|p6p10. CAPABLE_GREEDY must be UNSET.
// Usage:
//   FULLSEAT=1 VETCOMMIT=1 ARMORYDRIVE=1 CAPABLE_VETGUARD=1 EGGDRIVER_ARM=p6 node scripts/probe-eggdriver-a-20261026.js
//   SEEDS=88101,88102 DAYS=180 ... (defaults: matched 88101-88108 + 88111, 180d)
// Output: evidence/2026-10-26/perseed-eggdriver-a/<arm>-<seed>.json per seed.
// Exports (for the proof test): predictedBlades, snapshotImproves,
// pantryGateOk, reserveFloor, topupDeficit, topupAllowedDraw, armFlags.
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
const P = require('./probe-eggroad-a-20261026');

const ARM = process.env.EGGDRIVER_ARM || '';
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [88101, 88102, 88103, 88104, 88105, 88106, 88107, 88108, 88111]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-26', 'perseed-eggdriver-a');
const MIN_ALLIES = { finale: 20, nielsen: 12, herald: 10, the_network: 20 };
const P10_RUNWAY_DAYS = 7;      // pre-registered: gate = minAllies x 1000 x 7
const RESERVE_DAYS = 3;         // pre-registered: reserve = rosterAlive x 2000 x 3
const DAILY_NEED = 2000;        // documented village daily need per person
const MUSTER_UPKEEP = 1000;     // titans.js: kcal/blade/day, drawn from pack

function armFlags(arm) {
  const a = String(arm || '').toLowerCase();
  return { p6: a === 'p6' || a === 'p6p10', p10: a === 'p10' || a === 'p6p10' };
}
const day = (G) => { try { return (G.state.scholar || {}).day || 0; } catch (e) { return 0; }; };
const stripHtml = (s) => String(s == null ? '' : s).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

// ---- pure variant predicates (proof-tested; no game state) ----
function predictedBlades(links) {
  let total = 0;
  for (const l of (links || [])) {
    if (!l) continue;
    const trust = l.trust || 0, opinion = (l.opinion == null ? 0 : l.opinion), arrears = l.arrears || 0;
    if (trust < 25 || opinion < -10 || arrears > 0) continue;
    total += (trust >= 70 && opinion >= 10) ? 6 : 2;
  }
  return total;
}
function pantryGateOk(gate, pantryKcal, packKcal) {
  return (pantryKcal || 0) + (packKcal || 0) >= (gate || 0) * MUSTER_UPKEEP * P10_RUNWAY_DAYS;
}
function reserveFloor(rosterAlive) {
  return (rosterAlive || 0) * DAILY_NEED * RESERVE_DAYS;
}
function topupDeficit(blades, packKcal) {
  return Math.max(0, (blades || 0) * MUSTER_UPKEEP + DAILY_NEED - (packKcal || 0));
}
function topupAllowedDraw(pantryKcal, reserve, deficit) {
  return Math.max(0, Math.min(deficit || 0, (pantryKcal || 0) - (reserve || 0)));
}
// snapshotImproves(prevSnap, currSnap, stoodDownAllies):
// prevSnap/currSnap = [{other, trust, opinion, arrears}]. Returns
// {improved, reasons[]} per the pre-registered P6 conditions.
function snapshotImproves(prevSnap, currSnap, stoodDownAllies) {
  const reasons = [];
  const prev = {};
  for (const l of (prevSnap || [])) if (l && l.other) prev[l.other] = l;
  for (const l of (currSnap || [])) {
    if (!l || !l.other) continue;
    const p = prev[l.other];
    if (!p) { reasons.push('new-link:' + l.other); continue; }
    const pAns = (p.trust || 0) >= 25 && (p.opinion == null ? 0 : p.opinion) >= -10 && (p.arrears || 0) <= 0;
    const cAns = (l.trust || 0) >= 25 && (l.opinion == null ? 0 : l.opinion) >= -10 && (l.arrears || 0) <= 0;
    if (!pAns && cAns) reasons.push('cross-25:' + l.other);
    const pTrust = (p.trust || 0) >= 70 && (p.opinion == null ? 0 : p.opinion) >= 10;
    const cTrust = (l.trust || 0) >= 70 && (l.opinion == null ? 0 : l.opinion) >= 10;
    if (!pTrust && cTrust) reasons.push('cross-70:' + l.other);
  }
  const pred = predictedBlades(currSnap);
  if (pred > (stoodDownAllies || 0)) reasons.push('predicted:' + pred + '>stood:' + (stoodDownAllies || 0));
  return { improved: reasons.length > 0, reasons, predicted: pred };
}

// ---- game-state readers (pure reads; never draw RNG) ----
function pantryKcal(G) {
  try { return ((G.state.village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 0), 0); } catch (e) { return 0; }
}
function packKcal(G) {
  try {
    if (G.playerPackKcal) return G.playerPackKcal();
    return ((G.state.scholar || {}).inventory || []).reduce((t, i) => t + (((i.kcalEach || 0) > 0 && (i.units || 0) > 0 && !i.bonded) ? (i.kcalEach * i.units) : 0), 0);
  } catch (e) { return 0; }
}
function rosterAlive(G) {
  try {
    return ((G.state.village || {}).roster || []).filter(r => r && r.alive !== false && (r.health === undefined || r.health > 0)).length;
  } catch (e) { return 0; }
}
function linkSnapshot(G) {
  const out = [];
  try {
    const links = (G.hierarchyState ? G.hierarchyState() : []).filter(l => l && l.status === 'active');
    for (const l of links) {
      let other = null;
      try { other = G._linkOther ? G._linkOther(l, 'haven') : (l.primary === 'haven' ? l.subordinate : l.primary); } catch (e) {}
      let roster = 0, adults = 0, opinion = null;
      try {
        const ov = G._otherVillage ? G._otherVillage(other) : null;
        if (ov) {
          roster = (ov.roster || []).length;
          adults = (ov.roster || []).filter(r => r && r.alive && (r.age == null || r.age >= 18) && (r.health === undefined || r.health > 0)).length;
          opinion = ov.opinion;
        }
      } catch (e) {}
      out.push({ other, kind: l.kind, trust: l.trust || 0, opinion, arrears: l.arrears || 0, roster, adults });
    }
  } catch (e) { out.push({ err: String(e && e.message || e).slice(0, 120) }); }
  return out;
}
function omenOf(G, tid) {
  try { const st = (G.state || {}).titans || {}; return (st.omens || {})[tid] || null; } catch (e) { return null; }
}
function slainOf(G, tid) {
  try {
    const st = G._titanTest && G._titanTest.titanState ? G._titanTest.titanState() : null;
    return !!(st && st.slain && st.slain[tid]);
  } catch (e) { return false; }
}
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
    if (!muster) return { total: 0, haven: 0, allies: 0 };
    const allies = (muster.allies || []).length;
    let haven = 0;
    try { haven = (G.titanHavenBlades ? G.titanHavenBlades(muster) : []).length; } catch (e) {}
    return { total: allies + haven, haven, allies };
  } catch (e) { return { total: 0, haven: 0, allies: 0 }; }
}
function doStandDown(G, tid, s, reason, m) {
  try {
    if (typeof G.titanSelfDo !== 'function') return false;
    const acts = (G.titanSelfActions ? G.titanSelfActions() : []) || [];
    if (!acts.some(a => a && a.id === 'titan:standdown:' + tid)) return false;
    G.titanSelfDo('titan:standdown:' + tid);
    return true;
  } catch (e) { return false; }
}

// ---- titan drive (pilot driver verbatim + EGGDRIVER hooks) ----
function eggdriverTitanDaily(G, ctx, m, opts) {
  const k = ctx._eggk = ctx._eggk || {};
  const TT = G._titanTest || {};
  const dNow = day(G);
  const p6 = !!(opts && opts.p6), p10 = !!(opts && opts.p10);
  for (const tid of P.titanIds(G)) {
    const s = k[tid] = k[tid] || { stage: 0, council: false, called: false, callDay: null, commits: 0, fights: 0, slain: false, ready: false, stoodDown: null, bladeHist: [] };
    // EGGDRIVER P6 hook: a stood-down titan may be re-called ONLY on an
    // improved snapshot. Otherwise the pilot's permanent block stands.
    if (s.stoodDown != null) {
      if (!p6) continue;
      let cur = null;
      try { cur = linkSnapshot(G); } catch (e) { cur = []; }
      const chk = snapshotImproves(s.stoodDownSnap || [], cur, s.stoodDownAllies || 0);
      if (!chk.improved) continue;
      // Permitted re-call: fresh muster, fresh counters. Council stays sat.
      s.stoodDown = null; s.stoodDownSnap = null; s.stoodDownAllies = null;
      s.called = false; s.callDay = null; s.commits = 0; s.bladeHist = [];
      s.reCalls = (s.reCalls | 0) + 1;
      s.reCallReasons = s.reCallReasons || [];
      s.reCallReasons.push({ day: dNow, reasons: chk.reasons, predicted: chk.predicted });
    }
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
      // EGGDRIVER P10 hook: defer the call while the reservoir cannot
      // cover gate x 1000 x 7 days. The omen does not expire, so deferral
      // costs time only — measured, never hidden.
      const gate = MIN_ALLIES[tid] || 12;
      const pk = pantryKcal(G), ck = packKcal(G);
      if (p10 && !pantryGateOk(gate, pk, ck)) {
        s.deferDays = s.deferDays || [];
        if (s.deferDays.length === 0 || s.deferDays[s.deferDays.length - 1].day < dNow) {
          s.deferDays.push({ day: dNow, pantry: Math.round(pk), pack: Math.round(ck), gate, need: gate * MUSTER_UPKEEP * P10_RUNWAY_DAYS });
        }
        continue;
      }
      try {
        G.soundTitanCall(tid);
        s.callDay = dNow;
        const mb0 = musterBlades(G, tid);
        s.callRecords = s.callRecords || [];
        s.callRecords.push({ day: dNow, kind: (s.reCalls ? 'recall' : 'call'), pantry: Math.round(pantryKcal(G)), pack: Math.round(packKcal(G)), links: linkSnapshot(G), bladesAfter: mb0.total, alliesAfter: mb0.allies, havenAfter: mb0.haven });
      } catch (e) { s.callErr = String(e && e.message || e).slice(0, 120); }
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
    // EGGDRIVER P10 hook: pack top-up while a muster stands (once/day,
    // global across titans — dawn upkeep draws the SUM of standing
    // musters, so the deficit is on total standing blades, not one
    // muster's). Deficit-only, never below the reserve floor, Haven
    // node only.
    if (p10 && !G.over && !G.tbfight) {
      try {
        const mb = musterBlades(G, tid);
        if (mb.total > 0 && k._topupDay !== dNow) {
          k._topupDay = dNow;
          let totalBlades = 0;
          for (const t2 of P.titanIds(G)) { try { totalBlades += musterBlades(G, t2).total; } catch (e) {} }
          const deficit = topupDeficit(totalBlades, packKcal(G));
          if (deficit > 0 && G.playerAtHaven && G.playerAtHaven() && !G.state.scholar.insideHaven && !G.inCombat()) {
            let entered = false;
            try { entered = !!G.enterBuilding(); } catch (e) {}
            if (entered) {
              const pantry = (G.state.village || {}).pantry || [];
              const reserve = reserveFloor(rosterAlive(G));
              let allowed = topupAllowedDraw(pantryKcal(G), reserve, deficit);
              let took = 0;
              for (let pass = 0; pass < 2 && took < allowed; pass++) {
                for (let i = pantry.length - 1; i >= 0 && took < allowed; i--) {
                  const it = pantry[i];
                  if (!it || (it.kcalEach || 0) <= 0 || (it.units || 0) <= 0) continue;
                  if (pass === 0 && it.foodState === 'raw') continue;
                  const before = packKcal(G);
                  try { G.takeFromPantry(i); } catch (e) { break; }
                  const got = packKcal(G) - before;
                  if (got <= 0) break;
                  took += got;
                  allowed = topupAllowedDraw(pantryKcal(G), reserve, deficit - took);
                }
              }
              s.topups = s.topups || [];
              s.topups.push({ day: dNow, tookKcal: Math.round(took), deficit: Math.round(deficit), reserve: Math.round(reserve), totalBlades });
              try { G.exitBuilding(); } catch (e) {}
            }
          }
        }
      } catch (e) { s.topupErr = String(e && e.message || e).slice(0, 120); }
    }
    let ready = false;
    try { ready = G.titanMusterReady ? !!G.titanMusterReady(tid) : false; } catch (e) {}
    s.ready = ready;
    if (!ready) {
      try {
        const mb = musterBlades(G, tid);
        const need = MIN_ALLIES[tid] || 12;
        // EGGDRIVER P10 hook: reserve guard — a not-ready muster never eats
        // the village's last 3 days of food. Ready musters are exempt.
        if (p10 && mb.total > 0) {
          const pk = pantryKcal(G), reserve = reserveFloor(rosterAlive(G));
          if (pk < reserve) {
            const ok = doStandDown(G, tid, s, 'reserve-guard', m);
            if (ok) {
              s.earlyStanddowns = s.earlyStanddowns || [];
              s.earlyStanddowns.push({ day: dNow, pantry: Math.round(pk), reserve: Math.round(reserve), blades: mb.total });
              s.stoodDown = dNow; s.stoodDownBlades = mb.total;
              try { s.stoodDownSnap = linkSnapshot(G); } catch (e) { s.stoodDownSnap = []; }
              s.stoodDownAllies = mb.allies;
              if (m && m.key && m.key.standdowns) m.key.standdowns.push({ day: dNow, tid, blades: mb.total, need, reason: 'reserve-guard' });
              continue;
            }
          }
        }
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
              try { s.stoodDownSnap = linkSnapshot(G); } catch (e) { s.stoodDownSnap = []; }
              s.stoodDownAllies = mb.allies;
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

// ---- policy composition (pilot stack, driver swapped) ----
function capableDeedHunt() {
  const p = Object.assign({}, CAP.capable);
  const oDaily = p.daily.bind(p);
  p.id = 'capable-deedhunt';
  p.desc = 'capable base + deed-seeking patrols/surge';
  p.daily = (G, c) => { oDaily(G, c); DS.deedPatrol(G, c); DS.surgeUpkeep(G, c); };
  return p;
}
function eggdriverPolicy(opts) {
  const inner = FSD.withFullseatDiag(
    AD.withArmoryDrive(
      VC.withVetCommit(capableDeedHunt(), 'capabledeedhunt+vetcommit', 'capable + deed-hunt + VETCOMMIT'),
      'capabledeedhunt+vetcommit+armorydrive', 'capable + deed-hunt + vetcommit + ARMORYDRIVE'),
    'capabledeedhunt+vetcommit+armorydrive+fullseatdiag', 'capable + deed-hunt + vetcommit + armorydrive + full-seat recorder');
  const oDaily = inner.daily.bind(inner);
  inner.daily = (G, c) => {
    oDaily(G, c);
    try { eggdriverTitanDaily(G, c, null, opts); } catch (e) { c.eggDriveErr = String(e && e.message || e).slice(0, 160); }
    try {
      const tc = (G.state.scholar || {}).tableChoices;
      if (tc && tc.options && tc.options.some(o => o && o.id === 'final:hosts')) c.hostsOffered = true;
      if (tc && tc.frame) c.lastTableFrame = tc.frame;
    } catch (e) {}
  };
  return inner;
}

const THEFT_RE = /red-handed|freeloader|Caught|steal|Too heavy/i;

async function runSeed(seed, days, arm, opts) {
  const m = { seed, arm, key: { standdowns: [] } };
  let announceDay = null, networkSummonDay = null, hostsOfferedDay = null;
  let refusedSits = 0;
  const ctx = {};
  const sayLines = [];
  const { Game } = await loadGame({ seed, mode: 'endgame-r40', fullTelemetry: true });
  await setupGame(Game);
  const oSay = Game.say.bind(Game);
  Game.say = function (l) {
    try {
      const s = stripHtml(l).slice(0, 300);
      if (THEFT_RE.test(s)) sayLines.push({ day: day(Game), text: s });
    } catch (e) {}
    return oSay.apply(this, arguments);
  };
  const origTakeSeat = Game.tableTakeSeat ? Game.tableTakeSeat.bind(Game) : null;
  if (origTakeSeat) {
    Game.tableTakeSeat = function () {
      if (!P.sitAllowed(Game)) { refusedSits++; return { ok: false, msg: '' }; }
      return origTakeSeat.apply(this, arguments);
    };
  }
  const policy = eggdriverPolicy(opts);
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
  const end = P.eggroadCensus(Game, {
    announceDay, networkSummonDay, hostsOfferedDay, refusedSits,
    titanDrive: ctx._eggk || null,
    capSeatDay: ctx.capSeatDay || null, capTablePath: ctx.capTablePath || null,
    endReason: (result && result.endReason) || (Game.over ? (Game.won ? 'won' : 'dead') : 'horizon'),
    finalPantry: Math.round(pantryKcal(Game)), finalPack: Math.round(packKcal(Game)),
    sayLines,
  });
  m.result = end;
  m.census = end;
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, arm + '-' + seed + '.json'), JSON.stringify(m, null, 1));
  return m;
}

async function main() {
  for (const k of ['FULLSEAT', 'VETCOMMIT', 'ARMORYDRIVE', 'CAPABLE_VETGUARD']) {
    if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required.`); process.exit(2); }
  }
  if (process.env.CAPABLE_GREEDY === '1') { console.error('SWEEP STOP: CAPABLE_GREEDY must be UNSET (the sit-gate owns sitting).'); process.exit(2); }
  const flags = armFlags(ARM);
  if (!ARM || (ARM !== 'base' && !flags.p6 && !flags.p10)) { console.error('SWEEP STOP: EGGDRIVER_ARM must be base|p6|p10|p6p10.'); process.exit(2); }
  const rows = [];
  for (const s of SEEDS) {
    const r = await runSeed(s, DAYS, ARM, flags);
    const c = r.census;
    const drv = c.titanDrive || {};
    const readyN = Object.keys(drv).filter(t => drv[t] && drv[t].ready).length;
    const calls = Object.keys(drv).reduce((n, t) => n + ((drv[t].callRecords || []).length), 0);
    const recalls = Object.keys(drv).reduce((n, t) => n + (drv[t].reCalls || 0), 0);
    const defers = Object.keys(drv).reduce((n, t) => n + ((drv[t].deferDays || []).length), 0);
    rows.push({ seed: s, arm: ARM, announceDay: c.announceDay, seat: c.seat, tier: c.overtimeTier, wave: c.unlockedWave, scale: c.scaleRank, heraldSlain: c.titans.herald.slain, nielsenSlain: c.titans.nielsen.slain, finaleSlain: c.titans.finale.slain, network: c.networkSummoned, fallen: c.networkFallen, ready: readyN, calls, recalls, defers, end: c.endReason });
    console.log(`seed ${s} arm=${ARM}: announce=${c.announceDay} seat=${c.seat} tier=${c.overtimeTier} wave=${c.unlockedWave} scale=${c.scaleRank} heraldSlain=${c.titans.herald.slain} nielsenSlain=${c.titans.nielsen.slain} finaleSlain=${c.titans.finale.slain} networkSummoned=${c.networkSummoned} fallen=${c.networkFallen} ready=${readyN} calls=${calls} recalls=${recalls} defers=${defers} end=${c.endReason}`);
  }
  console.log(JSON.stringify(rows));
}

if (require.main === module) main().catch(e => { console.error(e); process.exit(1); });
module.exports = { predictedBlades, snapshotImproves, pantryGateOk, reserveFloor, topupDeficit, topupAllowedDraw, armFlags, eggdriverPolicy, eggdriverTitanDaily };
