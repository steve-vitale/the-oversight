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
// initialRoster + joins == finalRoster + deaths + leavers.
// Any residual is reported by name + day, never averaged away.
//
// Daily context rows carry the conditions a multi-death day needs
// for attribution: pantry, water, hungryDays, sick count, medic
// duty holder, camp healer — so a day's deaths can be read against
// what the village was living through, not just the cause string.
//
// Usage (driver):
//   const DC = require('./deathcensus-instrument-20261110');
//   const dc = DC.install(Game);        // after setupGame
//   dc.snapshot(ctx);                   // once per policy day
//   const fin = dc.finalize();          // at seed end
//   dc.uninstall();                     // no-op (no wrappers)
'use strict';

function install(Game) {
  const t = {
    daily: [], deaths: [], teleDeaths: [], joins: [], leavers: [],
    errors: [],
    _fallenSeen: 0, _teleSeen: 0, _rosterSet: null, _initialRosterLen: 0,
    _deadVids: {}, _deathDepartures: 0,
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
  // exact diffs, not guesses.
  try {
    const r0 = ((Game.state && Game.state.village && Game.state.village.roster) || []).slice();
    t._rosterSet = new Set(r0);
    t._initialRosterLen = r0.length;
  } catch (e) {
    t._rosterSet = new Set();
    t.errors.push({ day: gday(), where: 'install:rosterSet', err: String(e && e.message) });
  }

  function snapshot(ctx) {
    try {
      const day = gday();
      const v = (Game.state && Game.state.village) || {};
      // (1) FALLEN DIFF — the memorial roll. Index-based: append-only,
      // person-only, cause-named. New entries carry their OWN day.
      let deathsToday = 0;
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
          });
          if (f.villagerId) t._deadVids[f.villagerId] = true;
          deathsToday++;
        }
      } catch (e) { t.errors.push({ day, where: 'snapshot:fallen', err: String(e && e.message) }); }
      // (2) TELEMETRY DRAIN — every death hook, kind/wave/player kept.
      // Index-based; a daily drain can never lose rows to the ring.
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
          if ((e.kind === 'villager' || e.kind === 'person') && e.who != null) t._deadVids[e.who] = true;
        }
      } catch (e) { t.errors.push({ day, where: 'snapshot:telemetry', err: String(e && e.message) }); }
      // (3) ROSTER ID-SET DIFF — joins, departures, leavers.
      let joinsToday = 0, leaversToday = 0;
      try {
        const cur = new Set((v.roster || []).slice());
        for (const id of cur) {
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
      } catch (e) { t.errors.push({ day, where: 'snapshot:rosterSet', err: String(e && e.message) }); }
      // (4) DAILY CONTEXT — the conditions the day's deaths happened in.
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
    const telePerson = t.teleDeaths.filter(e => e.kind === 'villager' || e.kind === 'person').length;
    const teleMonster = t.teleDeaths.length - telePerson;
    const finalRosterLen = (t._rosterSet ? t._rosterSet.size : null);
    const booksClose = (finalRosterLen != null)
      && ((t._initialRosterLen + t.joins.length) === (finalRosterLen + t.deaths.length + t.leavers.length));
    const unattributed = t.deaths.filter(d => d.cause == null || d.cause === '').length;
    return {
      daily: t.daily, deaths: t.deaths, teleDeaths: t.teleDeaths,
      joins: t.joins, leavers: t.leavers, errors: t.errors,
      summary: {
        deaths: t.deaths.length, byCause, multiDeathDays,
        teleDeaths: t.teleDeaths.length, telePerson, teleMonster,
        joins: t.joins.length, leavers: t.leavers.length,
        deathDepartures: t._deathDepartures,
        initialRosterLen: t._initialRosterLen, finalRosterLen,
        booksClose, unattributed,
      },
    };
  }

  function uninstall() { /* read-only: nothing to restore */ }
  return { t, snapshot, finalize, uninstall };
}

module.exports = { install };
