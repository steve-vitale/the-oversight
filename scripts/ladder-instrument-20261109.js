// scripts/ladder-instrument-20261109.js — journey-scale r112 Q1+Q2
// (lane A, leg 3 SCALE). The Standing-ladder trace + veteran attribution.
//
// POLICY-SIDE ONLY. ZERO src/js changes. Read-only daily snapshot +
// pure-delegation wrappers (same pattern as the r111 ladder instrument):
// every wrapper logs its call and forwards exactly — no behavior
// change, no RNG draw, no state write of its own.
//
// R112 additions over the r111 instrument (all reads, no new wrappers):
//   - daily snapshot: scholarVid (Game.villagerId that day),
//     sentimentTaught (Game.sentimentTaught()), killAttr — wave-4+
//     kill counts from state.waveKillLog with living checks via vpOf
//     (the same read _ladderLivingVeterans uses): {w4total,
//     w4scholar, w4villager, w4null, w4distinctVillagers,
//     w4livingVillagers}. Classification is the DAY-JOINED rule
//     (classifyKill + scholarVidsByDay): a past scholar life's kill
//     stays a scholar kill after succession.
//   - finalize(): the full waveKillLog (wave >= 3 rows), the
//     waveKillByChannel map, and scholarVidsByDay (the daily
//     scholarVid map) so the analyzer can attribute every kill and
//     every killer's fate without re-running the engine.
//
// The ladder, read from code (src/js/ladder.js + table.js, legs 1-3):
//   villageLadder() — the full breakdown, PURE READ: stage 0-3, peak,
//     counted, cap, tracks{ fight, forage, craft, talk, explore },
//     countedTracks, capped[], nextThreshold, shortfall, detail{...}.
//     Thresholds come from ladderCfg() (live, never hardcoded here).
//   ladderCapstoneReady(kind) — military_tribute (2 living NON-SCHOLAR
//     wave-4 veterans, leg 3 — the scholar never counts), trade_charter
//     (sealed chartered trade link + national+ scale), feast_embassy
//     (feast bundle done at National stage).
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
//   delivered, seat, seatDetail, previewLadder,
//   scholarVid, sentimentTaught, killAttr.
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
//   const LI = require('./ladder-instrument-20261109');
//   const li = LI.install(Game);            // after setupGame
//   li.snapshot(ctx);                        // once per policy day
//   const fin = li.finalize();               // at seed end
//   li.uninstall();
// PRE-REGISTER: evidence/2026-11-09/journey-scale-r112-prereg.md
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

// classifyKill(by, scholarVidToday, scholarVidYesterday) — pure.
// A waveKillLog entry's killer class, per the r112 prereg: SCHOLAR iff
// `by` is the literal 'player' (the contest path logs the scholar that
// way) or equals the scholarVid of the kill's day or the day before
// (succession changes the vid at day boundaries; the old scholar's
// body is dead, so a d-1 match can only be a scholar life); VILLAGER
// iff `by` is a non-null vid that is neither; UNKNOWN iff `by` is null.
function classifyKill(by, scholarVidToday, scholarVidYesterday) {
  if (by == null) return 'unknown';
  if (by === 'player') return 'scholar';
  if (by === scholarVidToday) return 'scholar';
  if (scholarVidYesterday != null && by === scholarVidYesterday) return 'scholar';
  return 'villager';
}

function install(Game) {
  const t = { daily: [], deliveries: [], fights: [], errors: [], scholarVidsByDay: {}, deaths: [], deathSeen: {}, deadVids: {} };
  const orig = {};
  const gday = () => { try { return (Game.state && Game.state.scholar && Game.state.scholar.day) || 0; } catch (e) { return 0; } };
  // isLivingVillager: the same read _ladderLivingVeterans uses — a
  // non-scholar vid whose person record exists and is not dead. The
  // scholar (current villagerId) is never a living villager here (leg 3).
  const isLivingVillager = (vid) => {
    if (!vid || vid === Game.villagerId) return false;
    try { const vp = (typeof Game.vpOf === 'function') ? Game.vpOf(vid) : null; return !!(vp && !vp.dead); }
    catch (e) { return true; }
  };
  // killAttr: wave-4+ kills from state.waveKillLog, classified with
  // the DAY-JOINED rule (classifyKill + scholarVidsByDay): a kill is
  // the scholar's iff `by` is 'player' or the scholarVid of the kill's
  // day or the day before. The CURRENT-vid-only rule mislabels past
  // scholar lives as villagers (pilot: all 3 wave-4 kills were the
  // scholar's, across two lives — the old rule called them villager
  // kills). The map is populated by snapshot() before this runs, so
  // the current day is always present; days before install read null
  // and classify as villager unless `by` is 'player'.
  function computeKillAttr() {
    const out = { w4total: 0, w4scholar: 0, w4villager: 0, w4null: 0, w4distinctVillagers: 0, w4livingVillagers: 0 };
    try {
      const log = (Game.state && Game.state.waveKillLog) || [];
      const distinct = {};
      for (const e of log) {
        if (!e || ((e.w | 0) < 4)) continue;
        out.w4total++;
        const cls = classifyKill(e.by, t.scholarVidsByDay[String(e.d)], t.scholarVidsByDay[String((e.d | 0) - 1)]);
        if (cls === 'scholar') out.w4scholar++;
        else if (cls === 'unknown') out.w4null++;
        else { out.w4villager++; distinct[e.by] = true; }
      }
      out.w4distinctVillagers = Object.keys(distinct).length;
      let living = 0;
      for (const vid of Object.keys(distinct)) if (isLivingVillager(vid)) living++;
      out.w4livingVillagers = living;
    } catch (e) { t.errors.push({ day: gday(), where: 'killAttr', err: String(e && e.message) }); }
    return out;
  }
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
      // R112 attribution fields (reads only): today's scholar vid (the
      // day-joined kill classification needs the vid per day), whether
      // the sentiment has been taught yet (lesser-seat slow leg), and
      // the running wave-4+ kill attribution counts.
      let scholarVid = null, sentimentTaught = null, killAttr = null;
      try { scholarVid = Game.villagerId || null; } catch (e) { scholarVid = null; }
      try { sentimentTaught = (typeof Game.sentimentTaught === 'function') ? !!Game.sentimentTaught() : null; } catch (e) { sentimentTaught = null; }
      try { t.scholarVidsByDay[day] = scholarVid; } catch (e) {}
      try { killAttr = computeKillAttr(); } catch (e) { killAttr = null; }
      // R112 death watch (read-only): the telemetry deathLog is a
      // 300-event ring, so early deaths fall out of it before the run
      // ends — and dead villagers leave the roster, so a roster scan
      // alone recorded 0 of 56 deaths on the pilot. PRIMARY: drain the
      // telemetry ring every snapshot (one day's events can never
      // exceed the 300 cap, so a daily drain loses nothing) and record
      // each unseen death {vid, day, cause}. BACKUP: scan the roster
      // for vids that newly read dead (catches death paths that never
      // emit a telemetry death); a backup record carries cause null.
      // Death day is exact to the day (telemetry stamps the death's
      // own day, not the snapshot day).
      try {
        const tel = ((Game.state && Game.state.telemetry) || []);
        for (const e of tel) {
          if (!e || e.type !== 'death') continue;
          const key = (e.day | 0) + '|' + String(e.who == null ? '?' : e.who) + '|' + String(e.cause == null ? '?' : e.cause);
          if (t.deathSeen[key]) continue;
          t.deathSeen[key] = true;
          t.deaths.push({ vid: (e.who == null ? null : e.who), day: (e.day | 0), cause: (e.cause == null ? null : String(e.cause)) });
          if (e.who != null) t.deadVids[e.who] = true;
        }
      } catch (e) { t.errors.push({ day, where: 'deathWatch:telemetry', err: String(e && e.message) }); }
      try {
        const roster = ((Game.state && Game.state.village && Game.state.village.roster) || []);
        for (const vid of roster) {
          if (!vid || t.deadVids[vid]) continue;
          let dead = false;
          try { const vp = (typeof Game.vpOf === 'function') ? Game.vpOf(vid) : null; dead = !!(vp && vp.dead); } catch (e) { dead = false; }
          if (dead) { t.deadVids[vid] = true; t.deaths.push({ vid, day, cause: null }); }
        }
      } catch (e) { t.errors.push({ day, where: 'deathWatch:roster', err: String(e && e.message) }); }
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
        scholarVid,
        sentimentTaught,
        killAttr,
      });
    } catch (e) { t.errors.push({ day: gday(), where: 'snapshot', err: String(e && e.message) }); }
  }
  function finalize() {
    // R112 attribution corpus (reads only): the waveKillLog rows the
    // analyzer attributes (wave >= 3 — wave 1-2 kills cannot make a
    // veteran and would only bloat the dump), the per-channel counters,
    // and the daily scholar-vid map for the day-joined classification.
    let waveKillLog = null, waveKillByChannel = null;
    try {
      const log = (Game.state && Game.state.waveKillLog) || [];
      waveKillLog = log.filter(e => e && ((e.w | 0) >= 3)).map(e => ({ d: e.d, mid: e.mid, w: e.w, by: e.by == null ? null : e.by, via: e.via || null, trick: e.trick || null }));
    } catch (e) { waveKillLog = null; t.errors.push({ day: gday(), where: 'finalize:waveKillLog', err: String(e && e.message) }); }
    try { waveKillByChannel = Object.assign({}, (Game.state && Game.state.waveKillByChannel) || {}); } catch (e) { waveKillByChannel = null; }
    // R112: the death watch (first-dead-day per roster vid) and the
    // end roster with dead flags, so the analyzer can say whether each
    // killer is alive at end without trusting the 300-event ring.
    let finalRoster = null;
    try {
      const roster = ((Game.state && Game.state.village && Game.state.village.roster) || []);
      finalRoster = roster.map(vid => {
        let dead = null;
        try { const vp = (typeof Game.vpOf === 'function') ? Game.vpOf(vid) : null; dead = (vp && vp.dead != null) ? !!vp.dead : null; } catch (e) { dead = null; }
        return { vid, dead };
      });
    } catch (e) { finalRoster = null; t.errors.push({ day: gday(), where: 'finalize:finalRoster', err: String(e && e.message) }); }
    return {
      daily: t.daily.slice(), deliveries: t.deliveries.slice(),
      fights: t.fights.slice(), errors: t.errors.slice(),
      waveKillLog, waveKillByChannel,
      scholarVidsByDay: Object.assign({}, t.scholarVidsByDay),
      deaths: t.deaths.slice(), finalRoster,
    };
  }
  function uninstall() {
    for (const name of Object.keys(orig)) {
      try { Game[name] = orig[name]; } catch (e) { t.errors.push({ day: gday(), where: 'uninstall:' + name, err: String(e && e.message) }); }
    }
  }
  return { t, snapshot, finalize, uninstall };
}

module.exports = { install, pickCapstoneOrder, DELIVERY_ORDER, classifyKill };
