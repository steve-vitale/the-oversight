// scripts/ladder-instrument-20261108.js — journey-scale r111 Q1
// (lane A, leg 3 SCALE). The Standing-ladder trace.
//
// POLICY-SIDE ONLY. ZERO src/js changes. Read-only daily snapshot +
// pure-delegation wrappers (same pattern as the feast-chain instrument
// and the regionalstep recorder): every wrapper logs its call and
// forwards exactly — no behavior change, no RNG draw, no state write
// of its own.
//
// The ladder, read from code (src/js/ladder.js + table.js, leg 1+2):
//   villageLadder() — the full breakdown, PURE READ: stage 0-3, peak,
//     counted, cap, tracks{ fight, forage, craft, talk, explore },
//     countedTracks, capped[], nextThreshold, shortfall, detail{...}.
//     Thresholds come from ladderCfg() (live, never hardcoded here).
//   ladderCapstoneReady(kind) — military_tribute (2 living wave-4
//     veterans), trade_charter (sealed chartered trade link + national+
//     scale), feast_embassy (feast bundle done at National stage).
//   ladderCapstoneDelivered() — the delivered kind, or null.
//   tableSeat() — lesser needs sentimentTaught + ladder peak >= Village
//     (12); full needs deedGateReady + peak >= National (40) + capstone.
//   tablePreview().ladder — the panel block (leg 3 renders it).
//   ladderDeliverCapstone(kind) — the delivery (wired-exempt: app.js
//     panelHaven only). The driver attempts it when ready (see the
//     prereg's delivery verb); this wrapper logs whoever calls it.
//
// Daily snapshot fields (same point as the driver's tableWatch — after
// baseDaily, before endDay):
//   day, stage, peakStage, counted, cap, nextThreshold, nextStageName,
//   shortfall, tracks, countedTracks, capped, detail, thresholds,
//   capstones {kind: {ready, reason, veterans|charteredLinks|stage|bundle}},
//   delivered, seat, seatDetail, previewLadder.
// The snapshot never calls ladderStageBeat/ladderCapBeat (those fire
// from ladderTick at endDay); stage transitions are derived from the
// daily rows by the analyzer. tableSeat()/tablePreview() are the same
// reads the driver already makes daily (tableWatch) — no new engine
// call shape.
//
// Fights: startCombat is wrapped to count fights and attribute the
// wave from the monster def (Game.data.monsters, .wave); a call with
// no id records wave null. Fights built directly (uprising, party
// betrayal) bypass startCombat and are NOT counted here — the same
// scope the feast instrument used, and the analyzer says so.
//
// Usage (driver):
//   const LI = require('./ladder-instrument-20261108');
//   const li = LI.install(Game);            // after setupGame
//   li.snapshot(ctx);                        // once per policy day
//   const fin = li.finalize();               // at seed end
//   li.uninstall();
// PRE-REGISTER: evidence/2026-11-08/journey-scale-r111-prereg.md
'use strict';

// The delivery order, pre-registered in the prereg: free deeds first,
// the costly tribute last. Pure: given a readiness map
// {kind: {ready}}, returns the first ready kind in that order, or null.
const DELIVERY_ORDER = ['trade_charter', 'feast_embassy', 'military_tribute'];
function pickCapstoneOrder(readiness) {
  if (!readiness || typeof readiness !== 'object') return null;
  for (const kind of DELIVERY_ORDER) {
    const r = readiness[kind];
    if (r && r.ready) return kind;
  }
  return null;
}

function install(Game) {
  const t = { daily: [], deliveries: [], fights: [], errors: [] };
  const orig = {};
  const gday = () => { try { return (Game.state && Game.state.scholar && Game.state.scholar.day) || 0; } catch (e) { return 0; } };
  const wrap = (name, log) => {
    try {
      const fn = Game[name];
      if (typeof fn !== 'function') { t.errors.push({ day: gday(), where: 'install:' + name, err: 'missing' }); return; }
      orig[name] = fn;
      Game[name] = function (...a) {
        const r = fn.apply(this, a);
        try { log(r, a); } catch (e) { t.errors.push({ day: gday(), where: 'log:' + name, err: String(e && e.message) }); }
        return r;
      };
    } catch (e) { t.errors.push({ day: gday(), where: 'install:' + name, err: String(e && e.message) }); }
  };
  // The delivery itself — whoever calls it, driver or engine.
  wrap('ladderDeliverCapstone', (r, a) => {
    t.deliveries.push({ day: gday(), kind: (a && a[0] != null) ? String(a[0]) : null, ok: !!(r && r.ok), reason: (r && r.reason) ? String(r.reason).slice(0, 120) : null });
  });
  // Every fight start, with the monster's wave from its def.
  wrap('startCombat', (r, a) => {
    let wave = null;
    try {
      const id = (a && a[0] != null) ? String(a[0]) : null;
      if (id && Game.data && Array.isArray(Game.data.monsters)) {
        const def = Game.data.monsters.find(m => m && m.id === id);
        wave = (def && def.wave != null) ? def.wave : null;
      }
      t.fights.push({ day: gday(), monsterId: id, wave });
    } catch (e) { t.errors.push({ day: gday(), where: 'log:startCombat', err: String(e && e.message) }); }
  });

  function snapshot(ctx) {
    try {
      const day = gday();
      let ladder = null, thresholds = null;
      try { ladder = (typeof Game.villageLadder === 'function') ? Game.villageLadder() : null; } catch (e) { t.errors.push({ day, where: 'snapshot:villageLadder', err: String(e && e.message) }); }
      try { const cfg = (typeof Game.ladderCfg === 'function') ? Game.ladderCfg() : null; thresholds = (cfg && cfg.thresholds) ? cfg.thresholds.slice() : null; } catch (e) { thresholds = null; }
      const capstones = {};
      for (const kind of DELIVERY_ORDER) {
        try {
          const r = (typeof Game.ladderCapstoneReady === 'function') ? Game.ladderCapstoneReady(kind) : null;
          capstones[kind] = r ? { ready: !!r.ready, reason: r.reason || null, veterans: (r.veterans != null) ? r.veterans : null, charteredLinks: (r.charteredLinks != null) ? r.charteredLinks : null, stage: (r.stage != null) ? r.stage : null, bundle: (r.bundle != null) ? !!r.bundle : null } : null;
        } catch (e) { capstones[kind] = null; t.errors.push({ day, where: 'snapshot:capstoneReady:' + kind, err: String(e && e.message) }); }
      }
      let delivered = null;
      try { delivered = (typeof Game.ladderCapstoneDelivered === 'function') ? Game.ladderCapstoneDelivered() : null; } catch (e) { delivered = null; }
      let seat = null, seatDetail = null;
      try { const s = (typeof Game.tableSeat === 'function') ? Game.tableSeat() : null; seat = (s && s.seat) || 'none'; seatDetail = (s && s.detail) || null; } catch (e) { seat = null; }
      let previewLadder = null;
      try { const pv = (typeof Game.tablePreview === 'function') ? Game.tablePreview() : null; previewLadder = (pv && pv.ladder) || null; } catch (e) { previewLadder = null; }
      t.daily.push({
        day,
        stage: (ladder && ladder.stage != null) ? ladder.stage : null,
        peakStage: (ladder && ladder.peakStage != null) ? ladder.peakStage : null,
        counted: (ladder && ladder.counted != null) ? ladder.counted : null,
        cap: (ladder && ladder.cap != null) ? ladder.cap : null,
        nextThreshold: (ladder && ladder.nextThreshold != null) ? ladder.nextThreshold : null,
        nextStageName: (ladder && ladder.nextStageName) || null,
        shortfall: (ladder && ladder.shortfall != null) ? ladder.shortfall : null,
        tracks: (ladder && ladder.tracks) ? Object.assign({}, ladder.tracks) : null,
        countedTracks: (ladder && ladder.countedTracks) ? Object.assign({}, ladder.countedTracks) : null,
        capped: (ladder && ladder.capped) ? ladder.capped.slice() : null,
        detail: (ladder && ladder.detail) ? Object.assign({}, ladder.detail) : null,
        thresholds,
        capstones,
        delivered,
        seat,
        seatDetail,
        previewLadder,
      });
    } catch (e) { t.errors.push({ day: gday(), where: 'snapshot', err: String(e && e.message) }); }
  }
  function finalize() {
    return {
      daily: t.daily.slice(), deliveries: t.deliveries.slice(),
      fights: t.fights.slice(), errors: t.errors.slice(),
    };
  }
  function uninstall() {
    for (const name of Object.keys(orig)) {
      try { Game[name] = orig[name]; } catch (e) { t.errors.push({ day: gday(), where: 'uninstall:' + name, err: String(e && e.message) }); }
    }
  }
  return { t, snapshot, finalize, uninstall };
}

module.exports = { install, pickCapstoneOrder, DELIVERY_ORDER };
