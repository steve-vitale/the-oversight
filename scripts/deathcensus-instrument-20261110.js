// scripts/deathcensus-instrument-20261110.js — journey-scale r125 Q2
// (lane A, leg 3 SCALE). The death-cause census.
//
// POLICY-SIDE ONLY. ZERO src/js changes. Read-only daily snapshot +
// append-only diffs, no wrappers, no RNG, no state writes.
//
// WHY THIS EXISTS: r123's survival collapse (0/4 alive, 488 vs 646
// band days) has no attributed cause — "the death-cause census does
// not exist yet" (r123 metric review). The engine DOES record every
// home-village villager death twice over: (1) the memorial roll
// `Game.state.village.fallen` — every death path pushes
// {villagerId, day, cause, name, monsterId?, monsterName?}, never
// pruned, double-death-guarded (corpses.js); (2) the telemetry death
// hook `registerDeath` → `tele('death', {kind, who, cause, wave,
// player})`. This instrument drains BOTH every policy day (a daily
// drain can never lose rows to the 300-event ring, and the fallen
// diff is index-based so same-day duplicate monster kills cannot
// collapse the way the ladder instrument's (day|who|cause) key can).
//
// THE CENSUS IS THE UNION (pilot finding, r125): neither source
// alone is complete —
//  (a) ALIEN-KILL GAP: the alien kill path (alienPlayers.js ~2435)
//  calls registerDeath + removeVillager but never pushes `v.fallen`
//  — an alien-killed villager is in telemetry and NOT in the
//  memorial roll. (Every other death path pushes both.) Those rows
//  enter the census as source 'telemetry-only', cause from the tele
//  row. This is an ENGINE GAP to report, not to fix here.
//  (b) FINAL-ENDDAY GAP: deaths in the last endDay (after the last
//  policy.daily snapshot) are invisible to every snapshot instrument
//  — on the pilot seed the last survivor died in endDay d129 and no
//  snapshot saw it. The driver calls drain() after runDays returns,
//  before finalize, so the final fallen/telemetry additions land.
//  drain() is idempotent (index-based diffs) and writes no daily row.
// Deaths are therefore `fallen ∪ telemetry-person`, keyed by vid,
// each row carrying its source. Telemetry person-deaths for vids
// that were NEVER in Haven's roster (other-village people, if any
// ever register) are listed as teleOutOfScope, never silently
// counted as Haven deaths.
//
// CAUSE VOCABULARY (read from code, not invented — see the r125
// prereg): 'the wild' (field fight, tbFightDeathCause), 'monster'
// (hurtVillager monster damage), 'sickness' or a disease id
// (villageSicknessTick via hurtVillager), "a wound that wouldn't
// close" (wound attrition tick), 'thirst' (villageDrinks),
// 'contest' / 'the arena' / 'betrayal' / 'the table trial'
// (tbFightDeathCause), 'alien' / 'alien_beam', 'schism',
// 'hunting', 'injuries', 'the phoenix link (ash|broken|released)',
// monster-name causes ('Gavel', 'the night', 'ambush' — the killer
// named as the cause). Distant-village 'hunger' / 'old age' deaths
// set roster .cause on OTHER villages and never reach Haven's
// fallen — out of scope here; a home-village hunger death, if the
// engine ever records one, arrives with its own cause string and
// is listed verbatim, never bucketed silently.
//
// RECONCILIATION (the bar): the roster id-set is tracked daily.
// joins = ids appearing; departures = ids vanishing; of the
// departures, those in fallen/telemetry-person = deaths, the rest
// = leavers (fled/splinter/exiled). The books close when
// initialRoster + joins == finalRoster + deaths(union) + leavers.
// Any residual is reported by name + day, never averaged away.
// Identity: deaths(union) == telePersonHaven + fallenOnly.
//
// Daily context rows carry the conditions a multi-death day needs
// for attribution: pantry, water, hungryDays, sick count, medic
// duty holder, camp healer — so a day's deaths can be read against
// what the village was living through, not just the cause string.
//
// NOTE (observed, not a defect): some days carry TWO daily rows
// (pilot seed: days 2, 4, 30) — the ladder instrument's rows show
// the identical duplicates, so policy.daily is invoked twice on
// those days by the driver/harness (succession days, most likely).
// Deaths are index-diffed, so a duplicate row can never double-
// count a death; the analyzer uses the last row per day for
// end-state reads.
//
// Usage (driver):
//   const DC = require('./deathcensus-instrument-20261110');
//   const dc = DC.install(Game);        // after setupGame
//   dc.snapshot(ctx);                   // once per policy day
//   dc.drain();                         // once after runDays, before finalize
//   const fin = dc.finalize();          // at seed end
//   dc.uninstall();                     // no-op (no wrappers)
'use strict';

function install(Game) {
  const t = {
    daily: [], deaths: [], teleDeaths: [], joins: [], leavers: [],
    teleOutOfScope: [], errors: [],
    _fallenSeen: 0, _teleSeen: 0, _rosterSet: null, _everRoster: null,
    _initialRosterLen: 0, _deadVids: {}, _unionVids: {},
    _telePersonVids: {}, _deathDepartures: 0,
  };
  const gday = () => { try { return (Game.state && Game.state.scholar && Game.state.scholar.day) || 0; } catch (e) { return 0; } };
  const vname = (vid) => { try { return (Game.displayName ? Game.displayName(vid) : null) || vid; } catch (e) { return vid; } };
  const pantryKcal = () => {
    try {
      return ((Game.state.village || {}).pantry || [])
        .reduce((s, i) => s + (i.kcalEach || 0) * (i.units || i.count || 1), 0);
    } catch (e) { return null; }
  };

  // Baseline the roster id-set at install (post-setupGame, day 0
  // state) so joins/departures from the first policy day on are
  // exact diffs, not guesses. _everRoster is the scope key for
  // telemetry person-deaths: a tele death counts as Haven's iff its
  // vid was ever in Haven's roster.
  try {
    const r0 = ((Game.state && Game.state.village && Game.state.village.roster) || []).slice();
    t._rosterSet = new Set(r0);
    t._everRoster = new Set(r0);
    t._initialRosterLen = r0.length;
  } catch (e) {
    t._rosterSet = new Set();
    t._everRoster = new Set();
    t.errors.push({ day: gday(), where: 'install:rosterSet', err: String(e && e.message) });
  }

  // diffDeaths(day): drain the fallen roll + the telemetry ring into
  // the union census. Returns the number of NEW union deaths found.
  // Idempotent: index-based slices, so a second call finds nothing
  // new. Called by snapshot() (daily) and drain() (post-run).
  function diffDeaths(day) {
    let added = 0;
    const v = (Game.state && Game.state.village) || {};
    // (1) FALLEN DIFF — the memorial roll. Index-based: append-only,
    // person-only, cause-named. New entries carry their OWN day.
    try {
      const fallen = Array.isArray(v.fallen) ? v.fallen : [];
      const fresh = fallen.slice(t._fallenSeen);
      t._fallenSeen = fallen.length;
      for (const f of fresh) {
        if (!f) continue;
        t.deaths.push({
          vid: f.villagerId || null, day: (f.day == null ? day : f.day),
          cause: (f.cause == null ? null : String(f.cause)),
          name: f.name || null,
          monsterId: f.monsterId || null, monsterName: f.monsterName || null,
          scholarVid: Game.villagerId || null, observedDay: day,
          source: 'fallen',
        });
        if (f.villagerId) { t._deadVids[f.villagerId] = true; t._unionVids[f.villagerId] = true; }
        added++;
      }
    } catch (e) { t.errors.push({ day, where: 'diffDeaths:fallen', err: String(e && e.message) }); }
    // (2) TELEMETRY DRAIN — every death hook, kind/wave/player kept.
    // Index-based; a daily drain can never lose rows to the ring.
    // Person rows for Haven vids NOT in fallen enter the union as
    // 'telemetry-only' (the alien-kill gap); other-village person
    // rows are listed out-of-scope, never counted.
    try {
      const tel = ((Game.state && Game.state.telemetry) || []);
      const fresh = tel.slice(t._teleSeen);
      t._teleSeen = tel.length;
      for (const e of fresh) {
        if (!e || e.type !== 'death') continue;
        t.teleDeaths.push({
          day: (e.day == null ? day : e.day),
          kind: e.kind || null, who: (e.who == null ? null : e.who),
          cause: (e.cause == null ? null : String(e.cause)),
          wave: (e.wave == null ? null : e.wave),
          player: !!e.player,
        });
        if ((e.kind === 'villager' || e.kind === 'person') && e.who != null) {
          t._telePersonVids[e.who] = true;
          if (t._everRoster.has(e.who)) {
            t._deadVids[e.who] = true;
            if (!t._unionVids[e.who]) {
              t.deaths.push({
                vid: e.who, day: (e.day == null ? day : e.day),
                cause: (e.cause == null ? null : String(e.cause)),
                name: vname(e.who),
                monsterId: null, monsterName: null,
                scholarVid: Game.villagerId || null, observedDay: day,
                source: 'telemetry-only',
              });
              t._unionVids[e.who] = true; // union key: one row per vid
              added++;
            }
          } else {
            t.teleOutOfScope.push({ day: (e.day == null ? day : e.day), who: e.who, cause: (e.cause == null ? null : String(e.cause)), kind: e.kind || null });
          }
        }
      }
    } catch (e) { t.errors.push({ day, where: 'diffDeaths:telemetry', err: String(e && e.message) }); }
    return added;
  }

  // diffRoster(day): joins / departures since the last call.
  // Departures in _deadVids are deaths (already in the union);
  // the rest are leavers. Returns {joinsToday, leaversToday}.
  function diffRoster(day) {
    let joinsToday = 0, leaversToday = 0;
    try {
      const v = (Game.state && Game.state.village) || {};
      const cur = new Set((v.roster || []).slice());
      for (const id of cur) {
        t._everRoster.add(id);
        if (!t._rosterSet.has(id)) {
          t.joins.push({ day, vid: id, name: vname(id) });
          joinsToday++;
        }
      }
      for (const id of t._rosterSet) {
        if (!cur.has(id)) {
          if (t._deadVids[id]) { t._deathDepartures++; }
          else { t.leavers.push({ day, vid: id, name: vname(id) }); leaversToday++; }
        }
      }
      t._rosterSet = cur;
    } catch (e) { t.errors.push({ day, where: 'diffRoster', err: String(e && e.message) }); }
    return { joinsToday, leaversToday };
  }

  function snapshot(ctx) {
    try {
      const day = gday();
      const v = (Game.state && Game.state.village) || {};
      // Ever-roster first (a join who dies the same day they join
      // must already be in scope when the tele drain runs).
      try { for (const id of (v.roster || [])) t._everRoster.add(id); } catch (e) {}
      const deathsToday = diffDeaths(day);
      const { joinsToday, leaversToday } = diffRoster(day);
      // DAILY CONTEXT — the conditions the day's deaths happened in.
      let alive = null, sickCount = null, sickSev2 = null, dutyHolder = null, healerId = null;
      let waterClean = null, waterDirty = null;
      try {
        const roster = (v.roster || []);
        let n = 0;
        for (const id of roster) {
          let dead = false;
          try { const vp = (typeof Game.vpOf === 'function') ? Game.vpOf(id) : null; dead = !!(vp && vp.dead); } catch (e2) { dead = false; }
          if (!dead) n++;
        }
        alive = n;
      } catch (e) { alive = null; }
      try {
        const sick = v.sick || {};
        const ids = Object.keys(sick);
        sickCount = ids.length;
        sickSev2 = ids.filter(id => (sick[id] && (sick[id].severity || 1) >= 2)).length;
      } catch (e) { sickCount = null; sickSev2 = null; }
      try { dutyHolder = v.medicDuty || null; } catch (e) { dutyHolder = null; }
      try { healerId = (typeof Game.campHealerId === 'function') ? (Game.campHealerId('haven') || null) : null; } catch (e) { healerId = null; }
      try { const w = v.water || {}; waterClean = (w.clean == null ? null : w.clean); waterDirty = (w.dirty == null ? null : w.dirty); } catch (e) {}
      t.daily.push({
        day, alive, rosterLen: ((v.roster || []).length),
        sickCount, sickSev2, dutyHolder, healerId,
        pantryKcal: pantryKcal(), waterClean, waterDirty,
        hungryDays: (v.hungryDays == null ? null : v.hungryDays),
        scholarVid: Game.villagerId || null,
        fallenLen: (Array.isArray(v.fallen) ? v.fallen.length : null),
        deathsToday, joinsToday, leaversToday,
      });
    } catch (e) { t.errors.push({ day: gday(), where: 'snapshot', err: String(e && e.message) }); }
  }

  // drain(): post-run catch-up — the final endDay's deaths land
  // here (they happen after the last snapshot). No daily row;
  // idempotent (a second call finds nothing new).
  function drain() {
    try {
      const day = gday();
      const v = (Game.state && Game.state.village) || {};
      try { for (const id of (v.roster || [])) t._everRoster.add(id); } catch (e) {}
      diffDeaths(day);
      diffRoster(day);
    } catch (e) { t.errors.push({ day: gday(), where: 'drain', err: String(e && e.message) }); }
  }

  function finalize() {
    const byCause = {};
    for (const d of t.deaths) {
      const k = (d.cause == null || d.cause === '') ? '(none)' : d.cause;
      byCause[k] = (byCause[k] || 0) + 1;
    }
    const byDay = {};
    for (const d of t.deaths) byDay[d.day] = (byDay[d.day] || 0) + 1;
    const multiDeathDays = Object.keys(byDay)
      .map(k => ({ day: +k, deaths: byDay[k] }))
      .filter(x => x.deaths >= 3)
      .sort((a, b) => a.day - b.day);
    const telePersonHaven = Object.keys(t._telePersonVids).filter(vid => t._everRoster.has(vid)).length;
    const telePerson = Object.keys(t._telePersonVids).length;
    const teleMonster = t.teleDeaths.length - telePerson;
    const teleOnly = t.deaths.filter(d => d.source === 'telemetry-only').length;
    const fallenOnly = t.deaths.filter(d => d.source === 'fallen' && !t._telePersonVids[d.vid]).length;
    const finalRosterLen = (t._rosterSet ? t._rosterSet.size : null);
    const booksClose = (finalRosterLen != null)
      && ((t._initialRosterLen + t.joins.length) === (finalRosterLen + t.deaths.length + t.leavers.length));
    const unattributed = t.deaths.filter(d => d.cause == null || d.cause === '').length;
    return {
      daily: t.daily, deaths: t.deaths, teleDeaths: t.teleDeaths,
      joins: t.joins, leavers: t.leavers, teleOutOfScope: t.teleOutOfScope,
      errors: t.errors,
      summary: {
        deaths: t.deaths.length, byCause, multiDeathDays,
        fallenDeaths: t.deaths.filter(d => d.source === 'fallen').length,
        teleDeaths: t.teleDeaths.length, telePerson, telePersonHaven, teleMonster,
        teleOnly, fallenOnly, teleOutOfScope: t.teleOutOfScope.length,
        joins: t.joins.length, leavers: t.leavers.length,
        deathDepartures: t._deathDepartures,
        initialRosterLen: t._initialRosterLen, finalRosterLen,
        booksClose, unattributed,
      },
    };
  }

  function uninstall() { /* read-only: nothing to restore */ }
  return { t, snapshot, drain, finalize, uninstall };
}

module.exports = { install };
