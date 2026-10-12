#!/usr/bin/env node
// probe-w3-ceiling-20261012.js — longsim wave lever r7 (2026-10-12).
// W4-GATE CEILING PROBE (the open lever-2 blank from r6):
//   wave 4 needs 4 wave-3 LEDGER points + scaleRank >= 'regional'.
//   r6/r7 measured w3 kills at ~0.1-0.2/run under competent, 0/20 w4 reach.
//   Question: is the w4 gate REACHABLE or decoration?
// A "w3-farmer" policy plays maximal effort with HONEST mechanics only:
//   Phase 1 (courting, from day 1): real courtship verbs — rumors arrive on
//     their own -> travel to their fire -> studyVillageCodex (+3 once) ->
//     broadcast wins (competent's contest play) -> proposeLink (judgeLink>=50)
//     as subordinate w/ real tribute cost. Bond then ages toward the Dawn.
//   Phase 2 (hunting, from w3 unlock): 4 dedicated thicket/ruin hunting
//     legs/day (a real player's cadence — travelTo is tick-free, so the
//     count is capped, not exploited), committed fights vs w3 (flee only
//     under 30% HP), real TB through driveFights, heal/eat via competent.
// Measures BOTH halves separately: ledger points/day and scale rank/day.
// No grants, no test hooks, no teleports — the ceiling is what a committed
// player can actually do.
// Usage: SEEDS="1,2,3,4,5,6,7,8,9,10" DAYS=200 OUT=/tmp/w3ceil.json \
//   node scripts/probe-w3-ceiling-20261012.js
'use strict';
const { loadGame, setupGame, runDays, driveFights, driveContests } = require('./sim-harness');
const { competent } = require('./policies/competent');

const LEGS = parseInt(process.env.HUNT_LEGS || '4', 10);

function waveOf(Game, mid) {
  try {
    const d = ((Game.data || {}).monsters || []).find(x => x.id === mid);
    return (d && d.wave) || 1;
  } catch (e) { return 1; }
}

function scaleRankOf(Game) {
  try { return Game.scaleRank ? Game.scaleRank() : 'village'; } catch (e) { return 'village'; }
}

function w3points(Game) {
  try { return Game.waveLedgerPoints ? (Game.waveLedgerPoints(3) || 0) : 0; } catch (e) { return 0; }
}

function gearLine(Game) {
  // weapon bonus + worn armor protection, for the "is throughput gear-bound?" read
  let wb = 0, prot = [];
  try {
    const w = (Game.equippedWeapon && Game.equippedWeapon()) || {};
    wb = (w.weapon && w.weapon.bonus) || w.bonus || 0;
  } catch (e) {}
  try {
    const eq = (Game.state.scholar || {}).equipped || {};
    for (const sl of Object.keys(eq)) {
      const it = eq[sl]; if (!it) continue;
      const def = ((Game.data || {}).items || []).find(d => d.id === (it.itemId || it.id));
      if (def && def.armor) prot.push(def.armor.protection || 0);
    }
  } catch (e) {}
  const P = prot.reduce((a, b) => a + b, 0);
  return { wb, P, pieces: prot.join('+') || 'none' };
}

const farmer = Object.assign({}, competent, { id: 'w3-farmer' });

// ---- committed fight hook: same tactics as competent, farmer thresholds ----
farmer.fight = function (Game, ctx) {
  try {
    const f = Game.tbfight;
    if (!f || f.over || !Game.tbIsPlayerTurn()) return false;
    const p = Game.tbFighter('p');
    const hpPct = (p.hp || 0) / Math.max(1, p.maxHp || p.hp || 1);
    const endTurn = () => {
      try { const q = Game.tbFighter('p'); q.moveLeft = 0; q.acted = true; Game.tbAfterPlayerAction(); } catch (e) {}
    };
    const flee = () => {
      try {
        const px = p.mx != null ? p.mx : 4, py = p.my != null ? p.my : 4;
        const tx = px <= 4 ? 0 : 8;
        try { Game.tbPlayerMove(tx, py); ctx.fled = (ctx.fled || 0) + 1; } catch (e) {}
      } catch (e) {}
      endTurn(); return true;
    };
    if (ctx._fightObj !== f) {
      ctx._fightObj = f;
      try {
        const monsters = f.fighters.filter(x => x.kind === 'monster' && (x.hp || 0) > 0);
        let totalMhp = 0, maxWave = 1;
        for (const m of monsters) {
          totalMhp += m.maxHp || m.hp || 0;
          const md = ((Game.data || {}).monsters || []).find(d => d.id === (m.monsterId || (m.mdef || {}).id));
          if (md && md.wave) maxWave = Math.max(maxWave, md.wave);
        }
        ctx.fightStarts = ctx.fightStarts || {};
        ctx.fightStarts[maxWave] = (ctx.fightStarts[maxWave] || 0) + 1;
        const pmax = p.maxHp || 100;
        // FARMER: commits to wave-3. Walks away from w3 only under half HP
        // at fight start or 4x HP bulk; w1/w2 keep competent's caution.
        const outmatched = totalMhp > 4 * pmax ||
          (maxWave >= 3 ? hpPct < 0.5 : (maxWave >= 2 && hpPct < 0.7)) ||
          hpPct < 0.5;
        if (outmatched && monsters.length) { ctx.fledBad = (ctx.fledBad || 0) + 1; return flee(); }
      } catch (e) {}
    }
    if (hpPct < 0.30) return flee(); // committed: w3 fights are taken at real risk
    const alive = f.fighters.filter(x => x.kind === 'monster' && (x.hp || 0) > 0);
    if (!alive.length) return false;
    alive.sort((a, b) => (a.hp || 0) - (b.hp || 0));
    const tgt = alive[0];
    const px = p.mx != null ? p.mx : 4, py = p.my != null ? p.my : 4;
    const tmx = tgt.mx != null ? tgt.mx : 4, tmy = tgt.my != null ? tgt.my : 4;
    try {
      const w = (Game.equippedWeapon && Game.equippedWeapon()) || { range: 1 };
      const d0 = Math.max(Math.abs(tmx - px), Math.abs(tmy - py));
      if (d0 > (w.range || 1)) {
        const occupied = new Set(f.fighters.filter(x => x.alive && x.key !== 'p').map(x => x.mx + ',' + x.my));
        let bx = null, by = null, bd = 1e9;
        for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
          if (!dx && !dy) continue;
          const cx = tmx + dx, cy = tmy + dy;
          if (cx < 0 || cx > 8 || cy < 0 || cy > 8) continue;
          if (occupied.has(cx + ',' + cy)) continue;
          const dd = Math.max(Math.abs(cx - px), Math.abs(cy - py));
          if (dd < bd) { bd = dd; bx = cx; by = cy; }
        }
        if (bx != null) {
          try {
            let dx = bx, dy = by;
            const ml = (p.moveLeft || 0);
            if (ml > 0 && typeof Game.findPath === 'function') {
              const path = Game.findPath(px, py, bx, by);
              if (path && path.length > ml) { const step = path[ml - 1]; dx = step[0]; dy = step[1]; }
            }
            Game.tbPlayerMove(dx, dy);
          } catch (e) {}
          ctx.closed = (ctx.closed || 0) + 1;
        }
        endTurn(); return true;
      }
    } catch (e) {}
    try { Game.tbPlayerStrike(tgt.key); ctx.struck = (ctx.struck || 0) + 1; } catch (e) {}
    endTurn(); return true;
  } catch (e) { return false; }
};

function drivePending(Game, ctx) {
  // encounters and fights that started during daily
  try { driveFights(Game, farmer, ctx); } catch (e) {}
  try { driveContests(Game, farmer, ctx); } catch (e) {}
  try {
    if (Game.pendingEncounter && Game.pendingMonsterId && !(Game.tbfight && !Game.tbfight.over)) {
      const mid = Game.pendingMonsterId;
      Game.pendingEncounter = false; Game.pendingMonsterId = null;
      try { Game.startCombat(mid); } catch (e) {}
      driveFights(Game, farmer, ctx);
    }
  } catch (e) {}
}

function homeXY(Game) {
  // haven: center of the 9x9 world map (game.js maybeVillageRumor)
  return { x: 4, y: 4 };
}

farmer.daily = function (Game, ctx) {
  if (competent.daily) competent.daily(Game, ctx);
  try { Game._w3farmer = ctx; } catch (e) {} // recoverable after runDays
  const day = (Game.state.scholar || {}).day || 0;
  const hx = Game.map.px, hy = Game.map.py;
  const goHome = () => { try { Game.travelTo(homeXY(Game).x, homeXY(Game).y); } catch (e) {} };

  // ---------- Phase 1: courtship (real verbs, every day it's useful) ----------
  try {
    const links = (Game.hierarchyState ? Game.hierarchyState() : []).filter(l => l.status === 'active');
    ctx._linkDay = ctx._linkDay || (links.length ? day : null);
    // answer the table: a counter-offer is the negotiation, not a no.
    // 'accept' forms the link on their terms — the honest maximal-effort move.
    if (Game.state.pendingCounter && !links.length) {
      try {
        const ar = Game.answerCounter ? Game.answerCounter('accept') : null;
        if (ar && ar !== 'counter') { ctx.counterAccepted = (ctx.counterAccepted || 0) + 1; }
        const links2 = (Game.hierarchyState ? Game.hierarchyState() : []).filter(l => l.status === 'active');
        if (links2.length && !ctx.linkDay) { ctx.linkDay = day; ctx._linkDay = day; }
      } catch (e) {}
      drivePending(Game, ctx);
    }
    if (!links.length && !Game.state.pendingCounter) {
      const ovs = (Game.state.otherVillages || []).filter(v => v.id !== 'haven' && Game.knowsVillage && Game.knowsVillage(v));
      if (ovs.length) {
        const near = ovs.map(v => ({ v, d: Math.abs(v.x - 4) + Math.abs(v.y - 4) })).sort((a, b) => a.d - b.d)[0].v;
        // visit every 5 days: study their book (opinion +3 once, real knowledge)
        if (!near._codexOpinionGiven && (day % 5 === 1)) {
          ctx.courtVisits = (ctx.courtVisits || 0) + 1;
          try { Game.travelTo(near.x, near.y); } catch (e) {}
          let r = null;
          try { r = Game.studyVillageCodex(near.id); } catch (e) {}
          const ok = typeof r === 'string' && r.indexOf('No codex here.') !== 0 && r.indexOf('You need to be at the village') !== 0;
          if (ok) ctx.codexStudied = (ctx.codexStudied || 0) + 1;
          goHome(); drivePending(Game, ctx);
        }
        // propose when the read says the table is warm (judgeLink>=50)
        if (Game.judgeLink && Game.proposeLink) {
          const ov = (Game.state.otherVillages || []).find(x => x.id === near.id);
          if (ov && (ov.opinion || 0) > -20) {
            let j = null;
            try { j = Game.judgeLink(near.id, { asSubordinate: true, tributeKcalPerWeek: 3500 }); } catch (e) {}
            if (j && j.score >= 50 && !ctx._proposedRecently) {
              ctx.proposals = (ctx.proposals || 0) + 1;
              ctx._proposedRecently = day;
              let res = null;
              try { res = Game.proposeLink(near.id, { asSubordinate: true, tributeKcalPerWeek: 3500 }); } catch (e) {}
              // res is the link (accept) or 'counter' (negotiation) — a real
              // link is verified via hierarchyState, not the return value.
              const linksNow = (Game.hierarchyState ? Game.hierarchyState() : []).filter(l => l.status === 'active');
              if (linksNow.length) { ctx.linkDay = day; ctx._linkDay = day; }
              else if (!res) ctx.declines = (ctx.declines || 0) + 1;
              else ctx.counters = (ctx.counters || 0) + 1;
              drivePending(Game, ctx);
            }
            if (ctx._proposedRecently && day - ctx._proposedRecently > 6) ctx._proposedRecently = null;
          }
        }
      }
    }
  } catch (e) { ctx._courtErr = String((e && e.message) || e).slice(0, 80); }

  // ---------- Phase 2: w3 hunting (dedicated legs, capped cadence) ----------
  try {
    const uw = Game.unlockedWave ? Game.unlockedWave() : 1;
    if (uw >= 3 && !ctx.gearAtW3) {
      ctx.gearAtW3 = gearLine(Game); ctx.w3unlockDay = day;
      // GRANT_MID (measurement cheat, loudly documented): give the farmer
      // the CANON mid-anchor build's gear (dps-anchor 2026-10-10: P~58-64,
      // fire-hardened spear wb 15) — no HP/ability grants. Isolates whether
      // the w3->4 BAR is reachable at designed gear, vs the full pipeline
      // (natural gear development + encounters + kills).
      if (process.env.GRANT_MID === '1') {
        try {
          const s = Game.state.scholar;
          s.equipped = s.equipped || {};
          s.equipped.melee = { itemId: 'fire_hardened_spear', name: 'Fire-hardened spear' };
          s.equipped.torso = { itemId: 'hide_armor', name: 'Hide armor' };
          s.equipped.head = { itemId: 'skull_helm', name: 'Skull Helm' };
          s.equipped.shoes = { itemId: 'deep_earth_boots', name: 'Deep-earth boots' };
          s.equipped.hands = { itemId: 'rage_bindings', name: 'Rage Bindings' };
          ctx.midGranted = true;
        } catch (e) {}
      }
    }
    if (uw >= 3) {
      const pts = w3points(Game);
      for (const th of [1, 2, 3, 4]) {
        if (ctx['ptsDay' + th] == null && pts >= th) ctx['ptsDay' + th] = day;
      }
      // thickets/ruins are the dangerous ground: thicket 15%, ruin 12% per entry
      let spots = [];
      try {
        for (const tt of (Game.travelTargets() || [])) {
          const t = Game.tileAt(tt.x, tt.y);
          if (!t || t.type === 'haven' || (t.type !== 'thicket' && t.type !== 'ruin')) continue;
          let blocked = false;
          try { blocked = !!Game.travelBlockage(tt.x, tt.y); } catch (e) {}
          if (blocked) continue;
          spots.push({ x: tt.x, y: tt.y, d: tt.d, type: t.type, revealed: !!t.revealed });
        }
      } catch (e) {}
      // a real hunter walks to NEAR, KNOWN dangerous ground first
      spots.sort((a, b) => ((a.revealed ? 0 : 5) + a.d) - ((b.revealed ? 0 : 5) + b.d));
      spots = spots.slice(0, LEGS);
      for (const s of spots) {
        if (Game.over) break;
        try { Game.travelTo(s.x, s.y); } catch (e) {}
        ctx.huntLegs = (ctx.huntLegs || 0) + 1;
        drivePending(Game, ctx);
        if (Game.over) break;
      }
      goHome(); drivePending(Game, ctx);
      if (Game.over) return;
    }
  } catch (e) { ctx._huntErr = String((e && e.message) || e).slice(0, 80); }

  // scale timeline sampling
  try {
    const r = scaleRankOf(Game);
    if (!ctx._rankSeen) ctx._rankSeen = {};
    if (!ctx._rankSeen[r]) { ctx._rankSeen[r] = day; }
  } catch (e) {}
};

module.exports = { farmer };

if (require.main === module) (async () => {
  const seeds = (process.env.SEEDS || '1,2,3,4,5,6,7,8,9,10').split(',').map(s => parseInt(s.trim(), 10));
  const days = parseInt(process.env.DAYS || '200', 10);
  const outFile = process.env.OUT || null;
  const runs = [];
  for (const seed of seeds) {
    const { Game, manifest } = await loadGame({ seed, mode: 'farmer', fullTelemetry: true });
    await setupGame(Game);
    const res = await runDays(Game, farmer, { days, manifest, sampleEvery: 10 });
    const fc = Game._w3farmer || {};
    const run = {
      seed, days: res.days, gameDays: res.gameDays, endReason: res.endReason,
      maxWaveUnlocked: res.maxWaveUnlocked,
      w3points: w3points(Game),
      scaleRankEnd: scaleRankOf(Game),
      networkLiveDay: (Game.state || {}).networkLiveDay || null,
      w3unlockDay: fc.w3unlockDay || null,
      gearAtW3: fc.gearAtW3 || null,
      midGranted: !!fc.midGranted,
      fightStarts: fc.fightStarts || {},
      ptsDay: [fc.ptsDay1, fc.ptsDay2, fc.ptsDay3, fc.ptsDay4],
      huntLegs: fc.huntLegs || 0,
      courtVisits: fc.courtVisits || 0,
      codexStudied: fc.codexStudied || 0,
      proposals: fc.proposals || 0,
      declines: fc.declines || 0,
      counters: fc.counters || 0,
      counterAccepted: fc.counterAccepted || 0,
      linkDay: fc.linkDay || null,
      rankSeen: fc._rankSeen || {},
      fled: fc.fled || 0, fledBad: fc.fledBad || 0, struck: fc.struck || 0,
      courtErr: fc._courtErr || null, huntErr: fc._huntErr || null,
      ms: res.ms,
    };
    try {
      run.deaths = (Game.state.telemetry || []).filter(e => e.type === 'death')
        .map(e => ({ day: e.day, kind: e.kind, who: e.who, cause: String(e.cause || '').slice(0, 60) }));
    } catch (e) { run.deaths = []; }
    try {
      const L = (Game.state.waveLedger && Game.state.waveLedger[3]) || Game.state.waveLedger3 || null;
      run.w3kills = (Game.state.waveKills && Game.state.waveKills[3]) || null;
    } catch (e) {}
    runs.push(run);
    console.log(`seed ${seed}: days=${res.days} w3pts=${w3points(Game)} rank=${scaleRankOf(Game)} linkDay=${run.linkDay} proposals=${run.proposals} legs=${run.huntLegs} end=${res.endReason}`);
  }
  if (outFile) require('fs').writeFileSync(outFile, JSON.stringify({ meta: { seeds, days, legs: LEGS }, runs }, null, 1));
})().catch(e => { console.error('FATAL', e); process.exit(1); });
