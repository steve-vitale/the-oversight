// arenadeath-diag — the killer-survivorship / arena-death recorder
// (sim-arenadeath-a, 2026-10-24, flesh-out loop, axis scale-onramp,
// the KILLED-DEAD-KILLER blank from sim-vetkill-a).
//
// THE QUESTION: sim-vetkill-a proved 4/8 band seeds are KILLED-DEAD-KILLER
// (wave-3+ killers who then die, 7/8 dead killers carrying fallen cause
// "the arena", lifespans 0-27 days after first blood) — but it recorded
// fallen as a FIRST-WINS MAP per vid, so it cannot answer: (a) the FULL
// fallen list per killer (backlog item #949: the 73672 ethan_hunt
// day-56-before-day-103-kill anomaly — does a later fallen entry exist
// that first-wins hid, or is the kill really attributed to a dead vid?);
// (b) each killer's arena history from the surfaces the engine actually
// keeps; (c) whether arena participation for killers is mandatory,
// voluntary, or mixed — from code, not guesswork; (d) whether the arena
// is disproportionately lethal to wave-3+ killers vs villagers overall.
//
// CODE FACTS THIS RECORDER IS BUILT ON (investigated from src, not
// invented — see evidence/2026-10-24/sim-arenadeath-a.md):
// - Fallen cause 'the arena' has exactly one producer: playerDeath('the
//   arena') (ledger.js playerDeath pushes fallen with the passed cause;
//   the arena-fight loss path is game.js tbEnd playerDeath('the arena')
//   when state.arenaContest is set, plus legacy ledger.js arenaDeath).
//   It is therefore ALWAYS a scholar death. A villager contest death
//   can never carry it.
// - Villager contest deaths split two ways, only one leaving a fallen
//   entry: (a) contest-engine hurt path (hurtVillager(pid, taken,
//   'contest')) lethal -> fallen cause 'contest'; (b) _contestDie /
//   _contestResolveOthers -> _cxKillContestant -> roster removal with NO
//   fallen push. Path (b) deaths leave only gossip (contest_died),
//   village.lastContest.died, and state.contestDeathsById (aggregate).
//   "No fallen entry" therefore does NOT mean "not a contest death".
// - Mandatory vs voluntary, as structured in code: casting (fireContest)
//   takes whoever it takes, no consent at casting; villagers NEVER get
//   a choice screen (watch-mode and multi-take co-taken villagers
//   resolve through the engine with no participate/refuse step) —
//   villager participation is MANDATORY by construction. The scholar
//   DOES get a choice screen sometimes (contestInterruption: givesChoice
//   or a 30% roll; otherwise "you're grabbed. No choice") — scholar
//   participation is MIXED. But the engine records NEITHER the
//   givesChoice flag NOR the choice taken for any resolved contest:
//   state.activeContest is transient (cleared at every end path) and no
//   per-contest choice log exists. A scholar arena death therefore
//   cannot be split mandatory/voluntary from post-run state — that
//   distinction is UNRECORDED, and the missing distinction IS a finding.
//   (Sim-bot note: scripts/sim-harness.js driveContests picks choice 0,
//   and choice 0 on the participate/refuse screen is Participate — so in
//   sims a scholar offered a choice always participates, but the
//   grab-vs-choice split per contest is still unrecorded.)
// - No per-villager arena-participation history (events entered,
//   opponents, outcomes) exists in the engine. The recorder assembles
//   the closest available approximation from the persisting surfaces:
//   full fallen list, _contestPullDays (bounded 24/vid), _showPullDays,
//   village.lastContest (LAST contest only), gossip contest_* entries,
//   contestDeathsById (aggregate), progState deathReel, lineage() —
//   plus DAILY lastContest snapshots (a contest announced one day and
//   resolved the next survives in lastContest across the day boundary,
//   so daily sampling catches most takes).
//
// PURE-READ DISCIPLINE (the vetkill discipline, kept): this recorder
// NEVER calls villageStandingTotal() during a run; it copies state
// (never holds live references) and reads waveUnlockReady(4/5) veteran
// counts. It writes nothing to game state, draws no RNG, and every read
// failure is counted (no silent empty catches).
//
// COMPOSE UPON (never edit): tableseat-nowait (which wraps
// leanlinkrescue). ARENADEATH=1 is the only on-switch. Unset delegates
// byte-identically.
//
// POLICY-SIDE ONLY — zero src/js changes, no default flips.
'use strict';

function layerOn() { return process.env.ARENADEATH === '1'; }

function n0(x) { const n = x | 0; return n > 0 ? n : 0; }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function scholarVidOf(Game) { try { return Game.villagerId || ((Game.state || {}).scholar || {}).villagerId || null; } catch (e) { return null; } }

// copyKillLog(Game): defensive COPY of the live waveKillLog (same shape
// as vetkill-diag's copy, re-implemented here so this policy is
// self-contained).
function copyKillLog(Game) {
  const out = { entries: [], errs: 0, error: null };
  try {
    const log = (Game.state && Game.state.waveKillLog) || [];
    if (!Array.isArray(log)) { out.errs++; out.error = 'waveKillLog-not-array'; return out; }
    for (const e of log) {
      if (!e || typeof e !== 'object') { out.errs++; continue; }
      out.entries.push({
        d: n0(e.d), mid: e.mid || null, w: n0(e.w),
        by: e.by || null, via: e.via || 'unknown', trick: e.trick || null,
      });
    }
  } catch (e) { out.errs++; out.error = 'waveKillLog: ' + String((e && e.message) || e).slice(0, 100); }
  return out;
}

// copyFallenList(Game): the FULL fallen array — every entry, in order.
// This is the #949 fix: vetkill-diag kept only the FIRST entry per vid,
// which hid any later death record for the same vid.
function copyFallenList(Game) {
  const out = { entries: [], errs: 0, error: null };
  try {
    const list = (((Game.state || {}).village || {}).fallen) || [];
    if (!Array.isArray(list)) { out.errs++; out.error = 'fallen-not-array'; return out; }
    for (const f of list) {
      if (!f || typeof f !== 'object') { out.errs++; continue; }
      out.entries.push({
        villagerId: f.villagerId || null, day: f.day != null ? (f.day | 0) : null,
        cause: f.cause || null, name: f.name || null,
        monsterId: f.monsterId || null, monsterName: f.monsterName || null,
      });
    }
  } catch (e) { out.errs++; out.error = 'fallen: ' + String((e && e.message) || e).slice(0, 100); }
  return out;
}

// copyContestMemory(Game): every persisting arena/contest memory surface.
function copyContestMemory(Game) {
  const out = {
    contestPullDays: {}, showPullDays: {}, lastContest: null,
    gossipContest: [], contestDeathsById: {}, deathReel: [], lineage: [],
    errs: 0, error: null,
  };
  const err = (msg) => { out.errs++; out.error = (out.error ? out.error + '; ' : '') + msg; };
  try {
    const v = (Game.state || {}).village || {};
    const cpd = v._contestPullDays || {};
    for (const k of Object.keys(cpd)) out.contestPullDays[k] = Array.isArray(cpd[k]) ? cpd[k].slice() : [];
    const spd = v._showPullDays || {};
    for (const k of Object.keys(spd)) out.showPullDays[k] = Array.isArray(spd[k]) ? spd[k].slice() : [];
    const lc = v.lastContest;
    if (lc && typeof lc === 'object') {
      out.lastContest = {
        day: lc.day != null ? (lc.day | 0) : null, name: lc.name || null,
        ids: Array.isArray(lc.ids) ? lc.ids.slice() : [],
        died: Array.isArray(lc.died) ? lc.died.slice() : [],
      };
    }
    const gossip = v.gossip || [];
    if (Array.isArray(gossip)) {
      for (const g of gossip) {
        if (g && typeof g.action === 'string' && g.action.indexOf('contest_') === 0) {
          out.gossipContest.push({
            action: g.action, who: (g.dims || {}).who || null,
            contest: (g.dims || {}).contest || null, day: g.day != null ? (g.day | 0) : null,
          });
        }
      }
    }
  } catch (e) { err('village-memory: ' + String((e && e.message) || e).slice(0, 100)); }
  try {
    const dl = Game.state.contestDeathsById || {};
    for (const k of Object.keys(dl)) out.contestDeathsById[k] = dl[k] | 0;
  } catch (e) { err('contestDeathsById: ' + String((e && e.message) || e).slice(0, 100)); }
  try {
    if (typeof Game.progState === 'function') {
      const pg = Game.progState() || {};
      const reel = pg.deathReel || [];
      if (Array.isArray(reel)) {
        for (const r of reel) {
          if (r && typeof r === 'object') out.deathReel.push({ name: r.name || null, day: r.day != null ? (r.day | 0) : null, challenge: r.challenge || null });
        }
      }
    }
  } catch (e) { err('deathReel: ' + String((e && e.message) || e).slice(0, 100)); }
  try {
    if (typeof Game.lineage === 'function') {
      const lin = Game.lineage() || [];
      if (Array.isArray(lin)) {
        for (const l of lin) {
          if (l && typeof l === 'object') out.lineage.push({ name: l.name || null, villagerId: l.villagerId || null, day: l.day != null ? (l.day | 0) : null, cause: l.cause || null });
        }
      }
    }
  } catch (e) { err('lineage: ' + String((e && e.message) || e).slice(0, 100)); }
  return out;
}

function snapVeterans(Game) {
  const out = { rd4vets: null, rd5vets: null, errs: 0, error: null };
  try {
    const rd4 = (typeof Game.waveUnlockReady === 'function') ? Game.waveUnlockReady(4) : null;
    const rd5 = (typeof Game.waveUnlockReady === 'function') ? Game.waveUnlockReady(5) : null;
    if (!rd4 || !rd5) { out.errs++; out.error = 'no-waveUnlockReady'; return out; }
    out.rd4vets = n0(rd4.veterans); out.rd5vets = n0(rd5.veterans);
  } catch (e) { out.errs++; out.error = 'veterans: ' + String((e && e.message) || e).slice(0, 100); }
  return out;
}

function ensureAD(ctx) {
  let D = ctx._arenadeathdiag;
  if (!D) D = ctx._arenadeathdiag = { days: 0, errs: 0, traj: [], lastLogLen: 0 };
  return D;
}

// recordDaily(Game, ctx): one end-of-day point. Stores the kill-log
// deltas (as vetkill-diag does), the current scholar vid (the scholar
// lineage over time — needed to test vid reuse, e.g. ethan_hunt), and a
// copy of village.lastContest (announced one day, resolved the next,
// so daily sampling catches most takes even though lastContest holds
// only the LAST contest).
function recordDaily(Game, ctx) {
  const D = ensureAD(ctx);
  const p = { day: dayOf(Game), scholarVid: scholarVidOf(Game), errs: 0 };
  const log = copyKillLog(Game);
  p.logLen = log.entries.length;
  p.errs += log.errs; if (log.error) p.error = log.error;
  if (log.entries.length < D.lastLogLen) {
    p.resync = true;
    p.newEntries = log.entries.slice();
  } else {
    p.newEntries = log.entries.slice(D.lastLogLen);
  }
  D.lastLogLen = log.entries.length;
  const v = snapVeterans(Game);
  p.rd4vets = v.rd4vets; p.rd5vets = v.rd5vets;
  p.errs += v.errs; if (v.error) p.error = (p.error ? p.error + '; ' : '') + v.error;
  try {
    const lc = ((Game.state || {}).village || {}).lastContest;
    p.lastContest = (lc && typeof lc === 'object')
      ? { day: lc.day != null ? (lc.day | 0) : null, name: lc.name || null, ids: Array.isArray(lc.ids) ? lc.ids.slice() : [], died: Array.isArray(lc.died) ? lc.died.slice() : [] }
      : null;
  } catch (e) { p.errs++; p.lastContestError = String((e && e.message) || e).slice(0, 100); }
  D.days++;
  D.errs += p.errs;
  D.traj.push(p);
  return D;
}

function withArenadeathDiag(inner, id, desc) {
  return Object.assign({}, inner, {
    id, desc,
    daily(Game, ctx) {
      const r = inner.daily(Game, ctx);
      if (layerOn()) recordDaily(Game, ctx);
      return r;
    },
  });
}

// resolveKillerStatus(Game, vid, fallenByVidFull): post-run pure-read
// status for one killer vid. fallenByVidFull maps vid -> FULL array of
// fallen entries (not first-wins). Scholar check first: the current
// adventurer is living by the gate's own definition.
function resolveKillerStatus(Game, vid, fallenByVidFull) {
  if (vid == null) return { alive: null, deathDay: null, deathDayObservable: false, cause: null, source: 'null-killer' };
  try {
    if (Game.villagerId && vid === Game.villagerId) {
      return { alive: true, deathDay: null, deathDayObservable: false, cause: null, source: 'current-scholar' };
    }
  } catch (e) { /* scholar check best-effort */ }
  const fallenAll = (fallenByVidFull && fallenByVidFull[vid]) || [];
  const fallen = fallenAll.length ? fallenAll[0] : null;
  let person = null, personRead = false;
  try {
    if (typeof Game.getPerson === 'function') { person = Game.getPerson(vid); personRead = true; }
  } catch (e) { person = null; }
  if (!person) {
    try {
      if (typeof Game.vpOf === 'function') { person = Game.vpOf(vid); personRead = true; }
    } catch (e) { person = null; }
  }
  if (person) {
    if (!person.dead) return { alive: true, deathDay: null, deathDayObservable: false, cause: null, source: 'person-alive' };
    if (fallen) return { alive: false, deathDay: (fallen.day | 0), deathDayObservable: true, cause: fallen.cause || null, source: 'person-dead+fallen' };
    return { alive: false, deathDay: null, deathDayObservable: false, cause: null, source: 'person-dead-no-fallen' };
  }
  if (fallen) return { alive: false, deathDay: (fallen.day | 0), deathDayObservable: true, cause: fallen.cause || null, source: 'fallen-only' };
  return { alive: null, deathDay: null, deathDayObservable: false, cause: null, source: personRead ? 'no-person-no-fallen' : 'unreadable' };
}

// classifyArenaKiller(killer, ev): the per-killer arena-death verdict.
// killer: {by, kills, firstDay}. ev: {status, fallenAll, gossipDied,
// gossipAll, pullDays, showPullDays, lineageEntries, lastContestDied,
// scholarAtDeath (bool: a lineage entry names this vid — i.e. this vid
// held the mantle and died as scholar)}.
// Classes (fixed before sweeping; NEVER guess):
// - LIVING: killer alive at run end (not a death class).
// - UNRECORDED-DISTINCTION: fallen cause 'the arena' (scholar
//   arena-fight death — sole producer playerDeath('the arena')) or a
//   scholar (lineage) contest death with fallen cause 'contest'.
//   The grab-vs-participate split is unrecorded in the engine, so the
//   mandatory/voluntary distinction cannot be made from state.
// - ARENA-MANDATORY: villager (non-scholar) contest death — fallen
//   cause 'contest' via the engine hurt path, or gossip contest_died /
//   lastContest.died with no fallen entry (the _contestDie path, which
//   pushes no fallen). Villagers never get a choice screen, so the take
//   was mandatory by construction.
// - ARENA-VOLUNTARY: a scholar death where the record shows the scholar
//   CHOSE to participate. The engine keeps no such record, so this
//   class is structurally unemittable from post-run state — it is
//   defined here so its absence is visible, not hidden. Any future
//   instrument that wraps contestInterruption/contestChoose could
//   emit it; this pure-read recorder must not.
// - NON-ARENA: dead with fallen entries, none 'the arena'/'contest',
//   and no contest-died gossip/lastContest evidence.
// - UNCLASSIFIED: dead (or unobservable) with no fallen entry and no
//   contest evidence — cannot tell a no-fallen contest death (path b)
//   from another no-fallen death path. Reason names the gap.
function classifyArenaKiller(killer, ev) {
  const e = ev || {};
  const st = e.status || { alive: null };
  const fallenAll = e.fallenAll || [];
  const arenaFallen = fallenAll.filter(f => f.cause === 'the arena');
  const contestFallen = fallenAll.filter(f => f.cause === 'contest');
  const otherFallen = fallenAll.filter(f => f.cause !== 'the arena' && f.cause !== 'contest');
  const gossipDied = e.gossipDied || [];
  const diedOnCamera = gossipDied.length > 0 || !!e.lastContestDied;
  const isScholarDeath = !!e.scholarAtDeath;
  const firstDay = killer.firstDay;
  let arenaDeathDay = null, contestDeathDay = null;
  if (arenaFallen.length) arenaDeathDay = arenaFallen[0].day;
  if (contestFallen.length) contestDeathDay = contestFallen[0].day;
  // Chronology vs first kill (the #949 question, per killer):
  // earliest fallen day before the first kill + a later fallen entry
  // after it = first-wins hid the real death (RESOLVED); earliest
  // before first kill and nothing later = PERSISTS.
  const days = fallenAll.map(f => f.day).filter(d => d != null);
  const earliestFallenDay = days.length ? Math.min.apply(null, days) : null;
  const laterFallen = firstDay != null ? fallenAll.filter(f => f.day != null && f.day >= firstDay) : [];
  let chronology = null;
  if (earliestFallenDay != null && firstDay != null && earliestFallenDay < firstDay) {
    chronology = laterFallen.length ? 'RESOLVED-first-wins-hid-later-entry' : 'PERSISTS-no-later-entry';
  } else if (earliestFallenDay != null && firstDay != null) {
    chronology = 'consistent-death-after-first-kill';
  }
  // Days from first kill to arena/contest death (first such entry).
  let daysToArenaDeath = null;
  const deathDayForTiming = arenaDeathDay != null ? arenaDeathDay : contestDeathDay;
  if (deathDayForTiming != null && firstDay != null) daysToArenaDeath = deathDayForTiming - firstDay;

  if (st.alive === true) {
    return { by: killer.by, kills: killer.kills, firstDay, class: 'LIVING', reason: 'killer alive at run end',
      statusSource: st.source || null, fallenAll, arenaFallen, contestFallen, otherFallen,
      gossipDied, pullDays: e.pullDays || [], showPullDays: e.showPullDays || [],
      lineageEntries: e.lineageEntries || [], daysToArenaDeath, chronology, arenaDeathDay, contestDeathDay };
  }
  if (arenaFallen.length) {
    return { by: killer.by, kills: killer.kills, firstDay, class: 'UNRECORDED-DISTINCTION',
      reason: "fallen cause 'the arena' = scholar arena-fight death (playerDeath('the arena') is the sole producer); grab-vs-participate is unrecorded (no choice log; activeContest transient)",
      statusSource: st.source || null, fallenAll, arenaFallen, contestFallen, otherFallen,
      gossipDied, pullDays: e.pullDays || [], showPullDays: e.showPullDays || [],
      lineageEntries: e.lineageEntries || [], daysToArenaDeath, chronology, arenaDeathDay, contestDeathDay };
  }
  if (contestFallen.length) {
    if (isScholarDeath) {
      return { by: killer.by, kills: killer.kills, firstDay, class: 'UNRECORDED-DISTINCTION',
        reason: "scholar contest death (fallen 'contest' + lineage entry); scholar contest participation is mixed (choice ~30%+ vs grab) and the choice is unrecorded",
        statusSource: st.source || null, fallenAll, arenaFallen, contestFallen, otherFallen,
        gossipDied, pullDays: e.pullDays || [], showPullDays: e.showPullDays || [],
        lineageEntries: e.lineageEntries || [], daysToArenaDeath, chronology, arenaDeathDay, contestDeathDay };
    }
    return { by: killer.by, kills: killer.kills, firstDay, class: 'ARENA-MANDATORY',
      reason: "villager contest-engine hurt death (fallen 'contest'); villagers never get a participate/refuse screen — the take was mandatory by construction",
      statusSource: st.source || null, fallenAll, arenaFallen, contestFallen, otherFallen,
      gossipDied, pullDays: e.pullDays || [], showPullDays: e.showPullDays || [],
      lineageEntries: e.lineageEntries || [], daysToArenaDeath, chronology, arenaDeathDay, contestDeathDay };
  }
  if (diedOnCamera) {
    if (isScholarDeath) {
      return { by: killer.by, kills: killer.kills, firstDay, class: 'UNRECORDED-DISTINCTION',
        reason: 'contest-died evidence (gossip/lastContest) with a scholar lineage entry but no fallen entry; scholar choice unrecorded',
        statusSource: st.source || null, fallenAll, arenaFallen, contestFallen, otherFallen,
        gossipDied, pullDays: e.pullDays || [], showPullDays: e.showPullDays || [],
        lineageEntries: e.lineageEntries || [], daysToArenaDeath, chronology, arenaDeathDay, contestDeathDay };
    }
    return { by: killer.by, kills: killer.kills, firstDay, class: 'ARENA-MANDATORY',
      reason: 'died on camera with no fallen entry (the _contestDie/_cxKillContestant path pushes no fallen); villagers never get a choice screen — the take was mandatory by construction',
      statusSource: st.source || null, fallenAll, arenaFallen, contestFallen, otherFallen,
      gossipDied, pullDays: e.pullDays || [], showPullDays: e.showPullDays || [],
      lineageEntries: e.lineageEntries || [], daysToArenaDeath, chronology, arenaDeathDay, contestDeathDay };
  }
  if (st.alive === false && otherFallen.length) {
    return { by: killer.by, kills: killer.kills, firstDay, class: 'NON-ARENA',
      reason: 'dead with fallen entries, none arena/contest: ' + otherFallen.map(f => 'd' + f.day + ':' + f.cause).join(', '),
      statusSource: st.source || null, fallenAll, arenaFallen, contestFallen, otherFallen,
      gossipDied, pullDays: e.pullDays || [], showPullDays: e.showPullDays || [],
      lineageEntries: e.lineageEntries || [], daysToArenaDeath, chronology, arenaDeathDay, contestDeathDay };
  }
  if (st.alive === false) {
    return { by: killer.by, kills: killer.kills, firstDay, class: 'UNCLASSIFIED',
      reason: 'dead in person record but no fallen entry and no contest-died evidence: cannot tell a no-fallen contest death from another no-fallen death path — do not guess',
      statusSource: st.source || null, fallenAll, arenaFallen, contestFallen, otherFallen,
      gossipDied, pullDays: e.pullDays || [], showPullDays: e.showPullDays || [],
      lineageEntries: e.lineageEntries || [], daysToArenaDeath, chronology, arenaDeathDay, contestDeathDay };
  }
  return { by: killer.by, kills: killer.kills, firstDay, class: 'UNCLASSIFIED',
    reason: 'killer status unobservable: no person record, no fallen entry, not the current scholar',
    statusSource: st.source || null, fallenAll, arenaFallen, contestFallen, otherFallen,
    gossipDied, pullDays: e.pullDays || [], showPullDays: e.showPullDays || [],
    lineageEntries: e.lineageEntries || [], daysToArenaDeath, chronology, arenaDeathDay, contestDeathDay };
}

// arenaSnapshot(Game, traj): post-run pure-read snapshot. traj is the
// armed recorder trajectory (optional; used for the daily lastContest
// timeline per killer).
function arenaSnapshot(Game, traj) {
  const log = copyKillLog(Game);
  const fallen = copyFallenList(Game);
  const mem = copyContestMemory(Game);
  const fallenByVidFull = {};
  for (const f of fallen.entries) {
    if (!f.villagerId) continue;
    (fallenByVidFull[f.villagerId] = fallenByVidFull[f.villagerId] || []).push(f);
  }
  const statusOf = (vid) => resolveKillerStatus(Game, vid, fallenByVidFull);
  // Wave-3+ killers grouped by vid.
  const byVid = {};
  for (const e of log.entries) {
    if ((e.w | 0) < 3) continue;
    const vid = e.by || null;
    if (!byVid[vid]) byVid[vid] = [];
    byVid[vid].push(e);
  }
  // Daily lastContest timeline per vid (from the armed trajectory).
  const lastContestTimeline = {};
  if (Array.isArray(traj)) {
    for (const p of traj) {
      const lc = p.lastContest;
      if (!lc || !Array.isArray(lc.ids)) continue;
      for (const id of lc.ids) {
        const arr = lastContestTimeline[id] || (lastContestTimeline[id] = []);
        const key = (lc.day || 0) + '|' + (lc.name || '') + '|' + (lc.died || []).join(',');
        if (!arr.some(x => x.key === key)) arr.push({ key, day: lc.day, name: lc.name, ids: lc.ids.slice(), died: (lc.died || []).slice(), sampleDay: p.day });
      }
    }
  }
  const killers = [];
  for (const vid of Object.keys(byVid)) {
    const entries = byVid[vid];
    const firstDay = Math.min.apply(null, entries.map(e => e.d | 0));
    const killer = { by: vid === 'null' ? null : vid, kills: entries.length, firstDay, entries: entries.slice() };
    const st = statusOf(killer.by);
    const fallenAll = killer.by ? (fallenByVidFull[killer.by] || []) : [];
    const gossipAll = (mem.gossipContest || []).filter(g => g.who === killer.by);
    const gossipDied = gossipAll.filter(g => g.action === 'contest_died');
    const lineageEntries = killer.by ? (mem.lineage || []).filter(l => l.villagerId === killer.by) : [];
    const ev = {
      status: st,
      fallenAll,
      gossipDied,
      gossipAll,
      pullDays: killer.by ? (mem.contestPullDays[killer.by] || []) : [],
      showPullDays: killer.by ? (mem.showPullDays[killer.by] || []) : [],
      lineageEntries,
      lastContestDied: !!(mem.lastContest && Array.isArray(mem.lastContest.died) && killer.by && mem.lastContest.died.indexOf(killer.by) >= 0),
      scholarAtDeath: lineageEntries.length > 0,
    };
    const c = classifyArenaKiller(killer, ev);
    c.entries = entries.slice();
    c.gossipAll = gossipAll;
    c.lastContestTimeline = killer.by ? (lastContestTimeline[killer.by] || []) : [];
    c.alive = st.alive === true; c.dead = st.alive === false; c.unknown = st.alive !== true && st.alive !== false;
    c.deathDay = st.deathDay != null ? (st.deathDay | 0) : null;
    c.deathDayObservable = !!st.deathDayObservable;
    killers.push(c);
  }
  // Arena-death rates: killers vs villagers overall, on fallen evidence.
  const deadKillers = killers.filter(k => k.dead);
  const arenaDeadKillers = deadKillers.filter(k => k.class === 'UNRECORDED-DISTINCTION' || k.class === 'ARENA-MANDATORY');
  const distinctFallenVids = Object.keys(fallenByVidFull);
  const arenaDistinct = distinctFallenVids.filter(v => fallenByVidFull[v].some(f => f.cause === 'the arena'));
  const contestDistinct = distinctFallenVids.filter(v => fallenByVidFull[v].some(f => f.cause === 'contest'));
  const arenaOrContestDistinct = distinctFallenVids.filter(v => fallenByVidFull[v].some(f => f.cause === 'the arena' || f.cause === 'contest'));
  const causeCounts = {};
  for (const f of fallen.entries) causeCounts[f.cause || 'unknown'] = (causeCounts[f.cause || 'unknown'] || 0) + 1;
  const vet = snapVeterans(Game);
  return {
    logErrs: log.errs, logError: log.error,
    entries: log.entries,
    fallen: fallen.entries,
    fallenByVidFull,
    memory: mem,
    fallenErrs: fallen.errs, fallenError: fallen.error,
    memErrs: mem.errs, memError: mem.error,
    killers,
    rates: {
      killersTotal: killers.length,
      killersDead: deadKillers.length,
      killersLiving: killers.filter(k => k.alive).length,
      killersArenaDead: arenaDeadKillers.length,
      killersArenaRateOfDead: deadKillers.length ? arenaDeadKillers.length / deadKillers.length : null,
      killersClassCounts: killers.reduce((m, k) => { m[k.class] = (m[k.class] || 0) + 1; return m; }, {}),
      fallenDistinctVids: distinctFallenVids.length,
      fallenArenaDistinct: arenaDistinct.length,
      fallenContestDistinct: contestDistinct.length,
      fallenArenaOrContestDistinct: arenaOrContestDistinct.length,
      fallenArenaRateOfDistinct: distinctFallenVids.length ? arenaOrContestDistinct.length / distinctFallenVids.length : null,
      fallenEntriesTotal: fallen.entries.length,
      fallenCauseCounts: causeCounts,
    },
    endVets: { rd4vets: vet.rd4vets, rd5vets: vet.rd5vets, errs: vet.errs, error: vet.error },
  };
}

module.exports = { layerOn, withArenadeathDiag, copyKillLog, copyFallenList, copyContestMemory, snapVeterans, recordDaily, ensureAD, resolveKillerStatus, classifyArenaKiller, arenaSnapshot };
