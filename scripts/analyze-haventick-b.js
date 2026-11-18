// analyze-haventick-b.js — classifier for arm sim-haventick-b (DIAG).
// Requires the seedpaths analyzer (not copied): reuses its
// classifySeedPaths for the seedpaths-frame comparison, then counts
// the HAVENTICK fifth plan-creation path (plus the winPlanOf sixth
// creator) per episode and per launch from the v4creates creation
// ledger (recorded by the driver wraps on winPlanHavenTick,
// winPlanSeedFromFight, and winPlanOf).
// Frozen definitions: evidence/2026-11-16/sim-haventick-b-prereg.md.
// Episode = one continuous plan lifetime for one holder. Opens on a
// v4creates row (havenTick / winPlanOf always; a wave-4 seed creation
// iff stageAfter is gear/party; a wave-3 seed creation opens nothing
// and is counted in a side table). Closes on retarget (a later seed
// row with a different target), holder death, plan deletion, or end
// of run. Attribution rule (frozen): FIRST-CREATOR WINS — the
// episode's creator is the path that created the plan. A seed row
// that finds an existing plan (planExistedBefore) is a refresh (same
// target) or a retarget (different target), never a creation.
// Bucket taxonomy: the dawnbid buckets with the dawnbid precedence
// (launched > target-killed > selected-blocked > bid-not-selected >
// plan-churned-before-dawn > candidate-not-bid > unknown), computed
// exactly as classifySeed computes them. target-killed is
// structurally N/A for target-null episodes (recorded null, never
// counted).
// Ledger check (independent denominator): every planCensus row must
// fall inside some episode's [openDay, closeDay] with matching
// target — a census row with no episode means a missed creation.
// Usage:
//   node scripts/analyze-haventick-b.js <instrumentDir> [controlDir]
// Writes evidence/2026-11-16/haventick-b-analysis.json. Exits 0 iff
// zero unclassified episodes on EACH leg, the ledger check is clean
// (every census holder traces to a recorded creation — prereg bar 2
// as written; census rows outside any episode window are reported
// with their cause, not gated), the seedpaths frame reconciles with
// the creation frame, all files parse, and no instrument errors.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const SEEDPATHS = require(path.join(REPO, 'scripts', 'analyze-seedpaths-b.js'));

const W4_IDS_FROZEN = ['congregation', 'strike', 'influencer', 'audit', 'reunion', 'suburb', 'eulogy', 'algorithm', 'eater', 'herald'];
const W4_SET = new Set(W4_IDS_FROZEN);
const SEED_PATHS = ['world-tick', 'agency-evade', 'agency-flee', 'gate-avoid'];
const CREATORS = ['havenTick', 'world-tick', 'agency-evade', 'agency-flee', 'gate-avoid', 'winPlanOf'];
const BUCKETS = ['launched', 'target-killed', 'selected-blocked', 'bid-not-selected', 'plan-churned-before-dawn', 'candidate-not-bid', 'unknown'];

function loadDir(dir) {
  const out = {};
  const files = fs.readdirSync(dir).filter(function (x) { return x.endsWith('.json'); }).sort();
  for (const f of files) {
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    out[j.seed] = j;
  }
  return { bySeed: out, files: files };
}
function round(x, n) { return Math.round(x * Math.pow(10, n)) / Math.pow(10, n); }
function med(a) {
  if (!a.length) return null;
  const s = a.slice().sort(function (x, y) { return x - y; });
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}
function isNamedCreator(c) { return CREATORS.indexOf(c) !== -1; }
function mapVidBlock(b) {
  if (b === 'sick') return 'inviter-sick';
  if (b === 'range-0') return 'inviter-range-0';
  if (b === 'hurt-no-medicine-no-healer') return 'inviter-hurt';
  return 'inviter-exped-failed-unknown';
}

// classifyHavenTick(j): seedpaths-frame classification + the
// creation-frame episode classification. Attaches the episode list
// (with buckets, firings, launch-kill evidence) and the ledger check.
function classifyHavenTick(j) {
  const base = SEEDPATHS.classifySeedPaths(j);
  const creates = (j.v4creates || []).slice();
  const seedRows = (j.v4seeds || []).slice();
  const scoreRows = (j.dawnbidScores || []).slice();
  const departRows = (j.dawnbidDeparts || []).slice();
  const censusRows = (j.planCensus || []).slice();
  const daily = (j.daily || []).slice();
  const finalDay = j.gameDays || j.days || 0;
  let finalKillLog = [];
  try {
    const last = daily.length ? daily[daily.length - 1] : null;
    if (last && last.waveKillLog) finalKillLog = last.waveKillLog;
  } catch (e) {}

  // Consistency: every seed creation (planExistedBefore === false)
  // must have a matching v4creates row (same vid, day, creator).
  const creationRowMissing = [];
  for (const s of seedRows) {
    if (s.planExistedBefore === false) {
      const found = creates.some(function (c) { return c.vid === s.vid && c.day === s.day && c.creator === s.path; });
      if (!found) creationRowMissing.push({ day: s.day, vid: s.vid, mid: s.mid, wave: s.wave, path: s.path || null });
    }
  }

  // ---- Episode machine over merged creation + seed events ----
  // Per-vid event order within a day: (0) seed creations
  // (planExistedBefore === false — no plan existed at seed time, so
  // any same-day havenTick creation came after), (1) havenTick /
  // winPlanOf creations, (2) seed refresh/retarget rows
  // (planExistedBefore === true — the plan existed at seed time, so
  // any same-day creation came before).
  const episodes = [];
  const openByVid = {};
  const wave3Creations = [];
  const nonOpeningSeedCreations = [];
  function closeEpisode(ep, kind, day) {
    if (ep.closeDay != null) return;
    ep.closeDay = day;
    ep.closeKind = kind;
    if (openByVid[ep.vid] === ep) delete openByVid[ep.vid];
  }
  function newEpisode(vid, creator, openDay, target, seedOutcome) {
    const ep = { vid: vid, creator: creator, target: target, seedDay: openDay, openDay: openDay,
      seedOutcome: seedOutcome || null, refreshes: 0, lastSeedDay: openDay, closeDay: null,
      closeKind: null, history: [] };
    episodes.push(ep);
    openByVid[vid] = ep;
    return ep;
  }
  // Build per-vid event lists.
  const eventsByVid = {};
  function addEvent(vid, ev) {
    if (!eventsByVid[vid]) eventsByVid[vid] = [];
    eventsByVid[vid].push(ev);
  }
  for (let i = 0; i < creates.length; i++) {
    const c = creates[i];
    const order = SEED_PATHS.indexOf(c.creator) !== -1 ? 0 : 1;
    addEvent(c.vid, { day: c.day, order: order, idx: i, kind: 'create', row: c });
  }
  for (let i = 0; i < seedRows.length; i++) {
    const s = seedRows[i];
    if (s.planExistedBefore !== true) continue; // creation: represented by its v4creates row
    addEvent(s.vid, { day: s.day, order: 2, idx: i, kind: 'seed', row: s });
  }
  for (const vid of Object.keys(eventsByVid)) {
    const evs = eventsByVid[vid].sort(function (a, b) {
      return (a.day - b.day) || (a.order - b.order) || (a.idx - b.idx);
    });
    for (const ev of evs) {
      if (ev.kind === 'create') {
        const c = ev.row;
        const open = openByVid[vid] || null;
        if (open) closeEpisode(open, 'plan-deleted', ev.day); // a creation implies the old plan is gone
        if (c.creator === 'havenTick' || c.creator === 'winPlanOf') {
          newEpisode(vid, c.creator, ev.day, (c.target != null ? c.target : null), null);
        } else if (SEED_PATHS.indexOf(c.creator) !== -1) {
          const needWave = (c.needWave != null ? c.needWave : null);
          const stageAfter = c.stageAfter || null;
          if ((needWave | 0) >= 4 && (stageAfter === 'gear' || stageAfter === 'party')) {
            // Opening seed row (find its outcome from the seed rows).
            let outcome = null;
            for (const s of seedRows) {
              if (s.vid === vid && s.day === ev.day && s.path === c.creator) { outcome = s.outcome || null; break; }
            }
            newEpisode(vid, c.creator, ev.day, (c.target != null ? c.target : null), outcome);
          } else if ((needWave | 0) < 4) {
            wave3Creations.push({ day: ev.day, vid: vid, creator: c.creator, target: c.target || null, needWave: needWave });
          } else {
            nonOpeningSeedCreations.push({ day: ev.day, vid: vid, creator: c.creator, target: c.target || null, stageAfter: stageAfter });
          }
        } else {
          // Unknown creator: an episode attributed to nothing — the
          // analyzer counts it as unattributed below (never silent).
          newEpisode(vid, c.creator || 'unknown-no-creator', ev.day, (c.target != null ? c.target : null), null);
        }
      } else { // seed refresh / retarget
        const s = ev.row;
        const open = openByVid[vid] || null;
        if ((s.wave | 0) < 4) {
          if (open && open.target !== s.target) closeEpisode(open, 'retargeted-w3', ev.day);
          continue;
        }
        if (open) {
          if (open.target === s.target) { open.refreshes++; open.lastSeedDay = ev.day; }
          else {
            closeEpisode(open, 'retargeted', ev.day);
            if (s.stageAfter === 'gear' || s.stageAfter === 'party') {
              newEpisode(vid, s.path || 'unknown-no-path', ev.day, (s.target != null ? s.target : null), s.outcome || null);
            }
          }
        } else {
          if (s.stageAfter === 'gear' || s.stageAfter === 'party') {
            newEpisode(vid, s.path || 'unknown-no-path', ev.day, (s.target != null ? s.target : null), s.outcome || null);
          }
        }
      }
    }
  }

  // Episode target: the target observed in the first planCensus row
  // for the holder on/after the creation day (the caller may set it
  // after the winPlanOf wrap returns); fall back to the creation
  // row's target. Within an episode the target is constant (only a
  // seed row sets a holder's own plan target, and a different-target
  // seed row closes the episode).
  for (const ep of episodes) {
    let target = ep.target;
    let first = null;
    for (const r of censusRows) {
      if (r.vid === ep.vid && r.day >= ep.openDay && (ep.closeDay == null || r.day <= ep.closeDay)) {
        if (!first || r.day < first.day) first = r;
      }
    }
    if (first) target = (first.target != null ? first.target : null);
    ep.target = target;
  }

  // ---- Per-episode evidence (mirrors classifySeed) ----
  const attributedEpisodes = [];
  const unattributedEpisodes = [];
  const episodesByCreator = {};
  const launchesByCreator = {};
  for (const c of CREATORS.concat(['unknown'])) { episodesByCreator[c] = 0; launchesByCreator[c] = 0; }
  let multiPathEpisodes = 0;
  const launches = [];
  const launchKills = [];
  for (const ep of episodes) {
    const vid = ep.vid;
    const myScores = scoreRows.filter(function (r) {
      return r.vid === vid && r.plan && r.plan.target === ep.target && r.day >= ep.openDay &&
        (ep.closeDay == null || r.day <= ep.closeDay);
    });
    const dawnRows = myScores.filter(function (r) { return r.part === 0; });
    const dawnByDay = {};
    for (const r of dawnRows) dawnByDay[r.day] = r;
    const dawnDays = Object.keys(dawnByDay).map(Number).sort(function (a, b) { return a - b; });
    ep.scoredDawns = dawnDays.length;
    ep.firstScoredDawn = dawnDays.length ? dawnDays[0] : null;
    const stages = [];
    for (const r of myScores) {
      if (r.plan && r.plan.stage && (stages.length === 0 || stages[stages.length - 1] !== r.plan.stage)) stages.push(r.plan.stage);
    }
    ep.stageHistory = stages;
    ep.bids = [];
    for (const r of dawnRows) {
      const cand = (r.cands || []).find(function (c) { return c && c.winPlanAction === 'party_launch'; });
      if (!cand) continue;
      let score = null, rank = null;
      try {
        const lc = (r.logCands || []);
        for (let i = 0; i < lc.length; i++) {
          if (lc[i] && lc[i].winPlanAction === 'party_launch') { score = lc[i].score; rank = i; break; }
        }
      } catch (e) {}
      ep.bids.push({ day: r.day, w: cand.w, score: score, rank: rank, totalCands: (r.logCands || []).length });
    }
    ep.selections = [];
    for (const d of dawnDays) {
      const r = dawnByDay[d];
      const act = r.commit ? (r.commit.winPlanAction || null) : ((r.pick && r.pick.winPlanAction) || null);
      if (act === 'party_launch') ep.selections.push({ day: d, companion: (r.commit && r.commit.companion) || null });
    }
    ep.resolved = [];
    for (const sel of ep.selections) {
      const D = sel.day;
      const deps = departRows.filter(function (r) { return r.vid === vid && r.day === D && r.winPlanAction === 'party_launch'; });
      let res = null;
      for (const r of deps) {
        if (r.result === 'launch' && r.vidExped && r.companionExped) { res = { outcome: 'launched', day: D, companion: r.companion }; break; }
      }
      if (!res) for (const r of deps) {
        if (r.result === 'launch' && r.vidExped && !r.companionExped) { res = { outcome: 'blocked', reason: 'companion-not-started:' + (r.companionBlock || 'unknown'), day: D }; break; }
      }
      if (!res) for (const r of deps) {
        if (r.result === 'hold') { res = { outcome: 'blocked', reason: r.vidBlock ? mapVidBlock(r.vidBlock) : 'inviter-exped-failed-unknown', day: D }; break; }
      }
      if (!res) for (const r of deps) {
        if (r.result === 'normal') { res = { outcome: 'blocked', reason: 'inviter-exped-failed-unknown', day: D }; break; }
      }
      if (!res) {
        const midday = myScores.filter(function (r) { return r.day === D && r.part !== 0; });
        let overwrote = null;
        for (const m of midday) {
          const a = (m.commit && m.commit.winPlanAction) || null;
          if (a && a !== 'party_launch') { overwrote = a; break; }
        }
        res = overwrote
          ? { outcome: 'blocked', reason: 'commit-overwritten-midday:' + overwrote, day: D }
          : { outcome: 'blocked', reason: 'selected-not-executed', day: D };
      }
      ep.resolved.push(res);
    }
    // Target-killed: holder slew the target type while open. For
    // target-null episodes this can never fire (mid === null never
    // matches) — structurally N/A, recorded as null.
    ep.targetKilledDay = null;
    if (ep.target != null) {
      for (const e of finalKillLog) {
        if (e && e.by === vid && e.mid === ep.target && (e.d | 0) >= ep.openDay &&
          (ep.closeDay == null || (e.d | 0) <= ep.closeDay)) {
          if (ep.targetKilledDay == null || (e.d | 0) < ep.targetKilledDay) ep.targetKilledDay = e.d | 0;
        }
      }
    }
    // Firings: seed rows for the vid while live whose post-call
    // target is the episode target. (For target-null episodes any
    // seed row retargets, so the firings list is empty by
    // construction — the retarget closed the episode instead.)
    ep.firings = [];
    ep.firingPaths = [];
    for (const s of seedRows) {
      if (s.vid !== vid) continue;
      if (s.day < ep.openDay) continue;
      if (ep.closeDay != null && s.day > ep.closeDay) continue;
      if (s.target !== ep.target) continue;
      ep.firings.push({ day: s.day, path: s.path || null, outcome: s.outcome || null, mid: s.mid, wave: s.wave, stageAfter: s.stageAfter || null });
      if (ep.firingPaths.indexOf(s.path) === -1) ep.firingPaths.push(s.path || null);
    }
    if (ep.firingPaths.filter(function (p) { return SEED_PATHS.indexOf(p) !== -1; }).length >= 2) multiPathEpisodes++;
    // Churn (same rules as classifySeed, read off planCensus).
    // RECORDER FIX (sim-closekind-a, finding #2508): the deaths array is
    // the authoritative holder-death source and is consulted FIRST.
    // Census holderAlive=false and the daily-roster backup miss most
    // deaths — dead villagers drop out of the daily roster, and census
    // rows stop when the plan is deleted on death — so a holder death
    // closed as plan-deleted.
    if (ep.closeKind == null) {
      const myCensus = censusRows.filter(function (r) {
        return r.vid === vid && r.target === ep.target && r.day >= ep.openDay;
      }).sort(function (a, b) { return a.day - b.day; });
      let diedDay = null;
      for (const e of (j.deaths || [])) {
        if (e && e.kind === 'villager' && e.who === vid && (e.day | 0) >= ep.openDay) {
          if (diedDay == null || (e.day | 0) < diedDay) diedDay = e.day | 0;
        }
      }
      if (diedDay == null) {
        for (const c of myCensus) if (!c.holderAlive) { diedDay = c.day; break; }
      }
      if (diedDay == null) {
        for (const snap of daily) {
          if (!snap.roster) continue;
          const row = snap.roster.find(function (x) { return x && x.vid === vid; });
          if (row && row.dead) { diedDay = snap.day; break; }
        }
      }
      if (diedDay != null && diedDay >= ep.openDay) {
        ep.closeDay = diedDay;
        ep.closeKind = 'holder-died';
      } else if (myCensus.length) {
        const lastCensusDay = myCensus[myCensus.length - 1].day;
        if (lastCensusDay < finalDay) {
          ep.closeDay = lastCensusDay + 1;
          ep.closeKind = 'plan-deleted';
        }
      }
    }
    // ---- Classification (frozen dawnbid precedence) ----
    const launched = ep.resolved.find(function (r) { return r.outcome === 'launched'; });
    const blocked = ep.resolved.find(function (r) { return r.outcome === 'blocked'; });
    const churnedBeforeDawn = ep.closeDay != null && ep.closeKind != null &&
      (ep.firstScoredDawn == null || ep.closeDay < ep.firstScoredDawn);
    let bucket = null, sub = null;
    if (launched) { bucket = 'launched'; sub = 'companion:' + (launched.companion || 'none'); }
    else if (ep.targetKilledDay != null) { bucket = 'target-killed'; sub = 'day:' + ep.targetKilledDay; }
    else if (blocked) { bucket = 'selected-blocked'; sub = blocked.reason; }
    else if (ep.bids.length) { bucket = 'bid-not-selected'; sub = 'bids:' + ep.bids.length; }
    else if (churnedBeforeDawn) { bucket = 'plan-churned-before-dawn'; sub = ep.closeKind; }
    else {
      bucket = 'candidate-not-bid';
      const tally = {};
      for (const d of dawnDays) {
        const r = dawnByDay[d];
        const acts = (r.cands || []).map(function (c) { return c && c.winPlanAction; }).filter(Boolean);
        let reason;
        if (acts.indexOf('gear_hold') !== -1) reason = 'gear-stage';
        else if (acts.indexOf('party_wait') !== -1) reason = 'no-companion-party';
        else if (acts.indexOf('veteran_guard') !== -1) reason = 'veteran-guard';
        else if (acts.length === 0) reason = 'no-companion-hunt-plus';
        else reason = 'other-action:' + acts.join(',');
        tally[reason] = (tally[reason] || 0) + 1;
      }
      if (dawnDays.length === 0) sub = 'not-scored';
      else {
        let best = null, bestN = -1;
        for (const k of Object.keys(tally)) if (tally[k] > bestN) { best = k; bestN = tally[k]; }
        sub = best;
      }
    }
    if (!bucket) { bucket = 'unknown'; sub = 'no-rule-matched'; }
    ep.bucket = bucket;
    ep.sub = sub;
    ep.churnedBeforeDawn = churnedBeforeDawn;
    ep.tally = { scoredDawns: ep.scoredDawns, bids: ep.bids.length, selections: ep.selections.length };
    // Launch-kill check: kills by the holder or any party member of
    // wave >= 3 beasts on/after the launch day, while the episode is
    // live. Reported separately for wave >= 4.
    ep.launchKills = [];
    ep.launchKillsW4 = [];
    if (launched) {
      let party = [];
      try {
        const dep = (j.v4departs || []).filter(function (r) { return r.vid === vid && r.day === launched.day; });
        for (const d of dep) if (d.party) party = party.concat(d.party);
      } catch (e) {}
      const killers = [vid];
      if (launched.companion && killers.indexOf(launched.companion) === -1) killers.push(launched.companion);
      for (const p of party) if (killers.indexOf(p) === -1) killers.push(p);
      for (const e of finalKillLog) {
        if (!e || killers.indexOf(e.by) === -1) continue;
        if (((e.w | 0) < 3)) continue;
        if ((e.d | 0) < launched.day) continue;
        if (ep.closeDay != null && (e.d | 0) > ep.closeDay) continue;
        const kill = { day: e.d | 0, by: e.by, mid: e.mid, wave: e.w | 0, via: e.via || null };
        ep.launchKills.push(kill);
        if ((e.w | 0) >= 4) ep.launchKillsW4.push(kill);
      }
      if (ep.launchKills.length) {
        launchKills.push({ vid: vid, creator: ep.creator, target: ep.target, launchDay: launched.day,
          companion: launched.companion || null, kills: ep.launchKills });
      }
    }
    // Attribution.
    const attributed = isNamedCreator(ep.creator);
    ep.attributed = attributed;
    ep.unattributedReason = null;
    if (!attributed) {
      let caller = null;
      for (const c of creates) if (c.vid === vid && c.day === ep.openDay) { caller = c.caller || null; break; }
      ep.unattributedReason = 'creator ' + String(ep.creator) + ' caller ' + String(caller || 'none');
      unattributedEpisodes.push({ vid: ep.vid, target: ep.target, openDay: ep.openDay, bucket: ep.bucket,
        reason: ep.unattributedReason, firings: ep.firings.length });
    } else {
      attributedEpisodes.push(ep);
    }
    const key = attributed ? ep.creator : 'unknown';
    episodesByCreator[key]++;
    if (ep.bucket === 'launched') {
      launchesByCreator[key]++;
      let companion = null;
      try {
        const res = (ep.resolved || []).find(function (r) { return r.outcome === 'launched'; });
        companion = res ? (res.companion || null) : null;
      } catch (e) {}
      launches.push({ vid: ep.vid, target: ep.target, openDay: ep.openDay, creator: ep.creator,
        firingPaths: ep.firingPaths, companion: companion,
        launchKills: ep.launchKills.length, launchKillsW4: ep.launchKillsW4.length });
    }
  }

  // ---- Ledger check (independent denominator, prereg bar 2 as written) ----
  // Every planCensus HOLDER traces to a v4creates row on/before its
  // first observed day — no plan holder is ever observed without a
  // recorded creation. The row-in-episode-window count
  // (censusRowWithoutEpisode) is a DIAGNOSTIC only, never the gate:
  // the frozen episode definitions themselves produce rows outside
  // any episode window — wave-3 seed creations open no episode by
  // design yet their plans live in the census; dead holders' plans
  // linger in winPlan (no death cleanup) past the holder-died close;
  // a retarget shows the new target on the close day and a wave-3
  // retarget leaves the plan census-visible with no new episode. Each
  // such row is classified by cause (w3PlanNoEpisode / postDeathTail /
  // sameDayRetargetTarget / w3RetargetContinuation / unexplained); an
  // unexplained row is a finding, and a holder with no creation at
  // all fails the bar.
  // Gate: holdersWithoutCreation — census holders with no v4creates
  // row on/before their first census day.
  const holdersWithoutCreation = [];
  const firstCensusDay = {};
  for (const r of censusRows) {
    if (firstCensusDay[r.vid] == null || r.day < firstCensusDay[r.vid]) firstCensusDay[r.vid] = r.day;
  }
  for (const vid of Object.keys(firstCensusDay)) {
    const ok = creates.some(function (c) { return c.vid === vid && c.day <= firstCensusDay[vid]; });
    if (!ok) holdersWithoutCreation.push({ vid: vid, firstDay: firstCensusDay[vid] });
  }
  // Diagnostic: rows outside any episode window, classified by cause.
  function ledgerMissCause(r) {
    const vidEps = episodes.filter(function (e) { return e.vid === r.vid; });
    const vidCreates = creates.filter(function (c) { return c.vid === r.vid; })
      .sort(function (a, b) { return a.day - b.day; });
    const first = vidCreates[0] || null;
    if (first && SEED_PATHS.indexOf(first.creator) !== -1 &&
      ((first.needWave | 0) === 3 || (first.wave | 0) === 3)) return 'w3PlanNoEpisode';
    if (r.holderAlive === false && vidEps.some(function (e) {
      return e.closeKind === 'holder-died' && e.closeDay != null && r.day > e.closeDay;
    })) return 'postDeathTail';
    if (vidEps.some(function (e) {
      return (e.closeKind === 'retargeted' || e.closeKind === 'retargeted-w3') &&
        e.closeDay === r.day && e.target !== (r.target != null ? r.target : null);
    })) return 'sameDayRetargetTarget';
    if (vidEps.some(function (e) {
      return e.closeKind === 'retargeted-w3' && e.closeDay != null && r.day > e.closeDay;
    })) return 'w3RetargetContinuation';
    return 'unexplained';
  }
  const censusRowWithoutEpisode = [];
  const censusRowWithoutEpisodeCauses = {
    w3PlanNoEpisode: 0, postDeathTail: 0, sameDayRetargetTarget: 0,
    w3RetargetContinuation: 0, unexplained: 0,
  };
  for (const r of censusRows) {
    const ok = episodes.some(function (ep) {
      return ep.vid === r.vid && ep.target === (r.target != null ? r.target : null) &&
        r.day >= ep.openDay && (ep.closeDay == null || r.day <= ep.closeDay);
    });
    if (!ok) {
      const cause = ledgerMissCause(r);
      censusRowWithoutEpisodeCauses[cause]++;
      censusRowWithoutEpisode.push({ day: r.day, vid: r.vid, target: r.target || null, stage: r.stage || null, cause: cause });
    }
  }
  // Unknown havenTick sources / unknown seed paths.
  const unknownHavenSources = [];
  for (const c of creates) {
    if (c.creator === 'havenTick' && (!c.source || c.source.indexOf('unknown-') === 0)) {
      unknownHavenSources.push({ day: c.day, vid: c.vid, source: c.source || null, foughtN: c.foughtN, slainN: c.slainN });
    }
  }
  const unknownSeedRows = (base.unknownSeedRows || []).slice();
  // Handoffs: episodes closed by a seed retarget (their plan's story
  // continues under a seed episode).
  const handoffs = episodes.filter(function (ep) {
    return ep.closeKind === 'retargeted' || ep.closeKind === 'retargeted-w3';
  }).map(function (ep) {
    return { vid: ep.vid, creator: ep.creator, target: ep.target, openDay: ep.openDay,
      closeDay: ep.closeDay, closeKind: ep.closeKind, bucket: ep.bucket };
  });
  // Seedpaths-frame reconciliation: the seedpaths-frame instance
  // count must equal the creation-frame count of episodes whose
  // creator is one of the four seed paths. Any difference is a
  // machine divergence, never silently reconciled.
  const seedEpisodes = episodes.filter(function (ep) { return SEED_PATHS.indexOf(ep.creator) !== -1; }).length;
  const frameDifference = (base.instancesOpened || 0) - seedEpisodes;
  const byBucket = {};
  for (const b of BUCKETS) byBucket[b] = 0;
  for (const ep of episodes) byBucket[ep.bucket]++;
  const coverage = episodes.length ? round(attributedEpisodes.length / episodes.length, 4) : null;
  return Object.assign({}, base, {
    episodes: episodes,
    episodesOpened: episodes.length,
    episodesByCreator: episodesByCreator,
    launchesByCreator: launchesByCreator,
    launches: launches,
    launchKills: launchKills,
    multiPathEpisodes: multiPathEpisodes,
    attributedEpisodes: attributedEpisodes.length,
    unattributedEpisodes: unattributedEpisodes,
    attributionCoverage: coverage,
    byBucketEpisodes: byBucket,
    wave3Creations: wave3Creations,
    nonOpeningSeedCreations: nonOpeningSeedCreations,
    creationRowMissing: creationRowMissing,
    holdersWithoutCreation: holdersWithoutCreation,
    censusRowWithoutEpisode: censusRowWithoutEpisode,
    censusRowWithoutEpisodeCauses: censusRowWithoutEpisodeCauses,
    unknownHavenSources: unknownHavenSources,
    unknownSeedRows: unknownSeedRows,
    handoffs: handoffs,
    frameReconciliation: {
      seedpathsFrameInstances: base.instancesOpened || 0,
      creationFrameSeedEpisodes: seedEpisodes,
      difference: frameDifference,
    },
    havenTickCreates: creates.filter(function (c) { return c.creator === 'havenTick'; }).length,
    winPlanOfCreates: creates.filter(function (c) { return c.creator === 'winPlanOf'; }).length,
    totalCreates: creates.length,
    firstHavenTickDay: (function () {
      let d = null;
      for (const c of creates) if (c.creator === 'havenTick' && (d == null || c.day < d)) d = c.day;
      return d;
    })(),
  });
}

function summarizeHavenTick(leg) {
  const seedpaths = SEEDPATHS.summarizeSeedPaths(leg);
  const seeds = Object.keys(leg.bySeed).sort().map(function (k) { return leg.bySeed[k]; });
  const episodesByCreator = {};
  const launchesByCreator = {};
  for (const c of CREATORS.concat(['unknown'])) { episodesByCreator[c] = 0; launchesByCreator[c] = 0; }
  let episodes = 0, attributed = 0, unattributed = 0, launches = 0, multiPath = 0;
  let unknownSeedRows = 0, unknownHaven = 0, censusNoEp = 0, createMissing = 0, handoffs = 0;
  let holdersNoCreate = 0;
  const holdersNoCreateList = [];
  const censusCauses = {
    w3PlanNoEpisode: 0, postDeathTail: 0, sameDayRetargetTarget: 0,
    w3RetargetContinuation: 0, unexplained: 0,
  };
  let wave3 = 0, nonOpening = 0, havenCreates = 0, winPlanOfCreates = 0, totalCreates = 0;
  let launchKills = 0, launchKillsW4 = 0;
  const unattributedList = [];
  const handoffList = [];
  const launchKillList = [];
  const perSeed = [];
  let frameDifference = 0;
  for (const s of seeds) {
    episodes += s.episodesOpened;
    attributed += s.attributedEpisodes;
    unattributed += s.unattributedEpisodes.length;
    launches += s.launches.length;
    multiPath += s.multiPathEpisodes;
    unknownSeedRows += (s.unknownSeedRows || []).length;
    unknownHaven += (s.unknownHavenSources || []).length;
    censusNoEp += (s.censusRowWithoutEpisode || []).length;
    createMissing += (s.creationRowMissing || []).length;
    holdersNoCreate += (s.holdersWithoutCreation || []).length;
    for (const h of (s.holdersWithoutCreation || [])) holdersNoCreateList.push(Object.assign({ seed: s.seed }, h));
    for (const k of Object.keys(censusCauses)) {
      censusCauses[k] += ((s.censusRowWithoutEpisodeCauses || {})[k] || 0);
    }
    handoffs += (s.handoffs || []).length;
    wave3 += (s.wave3Creations || []).length;
    nonOpening += (s.nonOpeningSeedCreations || []).length;
    havenCreates += s.havenTickCreates;
    winPlanOfCreates += s.winPlanOfCreates;
    totalCreates += s.totalCreates;
    frameDifference += (s.frameReconciliation ? s.frameReconciliation.difference : 0);
    for (const k of Object.keys(episodesByCreator)) {
      episodesByCreator[k] += s.episodesByCreator[k] || 0;
      launchesByCreator[k] += s.launchesByCreator[k] || 0;
    }
    for (const u of s.unattributedEpisodes) unattributedList.push(Object.assign({ seed: s.seed }, u));
    for (const h of s.handoffs) handoffList.push(Object.assign({ seed: s.seed }, h));
    for (const lk of s.launchKills) {
      launchKillList.push(Object.assign({ seed: s.seed }, lk));
      launchKills += lk.kills.length;
      launchKillsW4 += lk.kills.filter(function (k) { return (k.wave | 0) >= 4; }).length;
    }
    perSeed.push({ seed: s.seed, days: s.days, gameDays: s.gameDays, endReason: s.endReason,
      standing: s.standing, scaleRank: s.scaleRank, won: s.won, maxWave: s.maxWave,
      seedCallsW4: s.seedCallsW4, seedpathsInstances: s.instancesOpened,
      episodesOpened: s.episodesOpened, attributedEpisodes: s.attributedEpisodes,
      unattributedEpisodes: s.unattributedEpisodes.length,
      attributionCoverage: s.attributionCoverage,
      episodesByCreator: s.episodesByCreator, launches: s.launches.length,
      launchesByCreator: s.launchesByCreator,
      havenTickCreates: s.havenTickCreates, winPlanOfCreates: s.winPlanOfCreates,
      totalCreates: s.totalCreates, handoffs: (s.handoffs || []).length,
      wave3Creations: (s.wave3Creations || []).length,
      firstHavenTickDay: s.firstHavenTickDay,
      firstWorldTickDay: s.firstWorldTickDay,
      scoredDawns: s.marginalScoredDawns, byBucket: s.byBucketEpisodes });
  }
  const coverage = episodes ? round(attributed / episodes, 4) : null;
  const bareUnknown = unattributedList.filter(function (u) {
    return !u.reason || u.reason === 'unknown' || u.reason === 'null';
  });
  return {
    seedpathsFrame: seedpaths,
    episodesOpened: episodes,
    attributedEpisodes: attributed,
    unattributedEpisodes: unattributed,
    unattributedList: unattributedList,
    bareUnknownReasons: bareUnknown.length,
    attributionCoverage: coverage,
    episodesByCreator: episodesByCreator,
    launchesByCreator: launchesByCreator,
    launches: launches,
    launchKills: launchKills,
    launchKillsW4: launchKillsW4,
    launchKillList: launchKillList,
    multiPathEpisodes: multiPath,
    unknownSeedRows: unknownSeedRows,
    unknownHavenSources: unknownHaven,
    censusRowWithoutEpisode: censusNoEp,
    censusRowWithoutEpisodeCauses: censusCauses,
    holdersWithoutCreation: holdersNoCreate,
    holdersWithoutCreationList: holdersNoCreateList,
    creationRowMissing: createMissing,
    handoffs: handoffs,
    handoffList: handoffList,
    wave3Creations: wave3,
    nonOpeningSeedCreations: nonOpening,
    havenTickCreates: havenCreates,
    winPlanOfCreates: winPlanOfCreates,
    totalCreates: totalCreates,
    frameDifference: frameDifference,
    wall: seedpaths.wall,
    medianSurvival: seedpaths.medianSurvival,
    perSeed: perSeed,
  };
}

function main() {
  const instrumentDir = process.argv[2];
  const controlDir = process.argv[3] || null;
  if (!instrumentDir) { console.error('HAVENTICK ANALYZE STOP: instrumentDir required.'); process.exit(2); }
  let liveW4 = null;
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
    const list = raw.monsters || raw;
    liveW4 = list.filter(function (m) { return m.wave === 4; }).map(function (m) { return m.id; }).sort();
  } catch (e) {}
  const frozenSorted = W4_IDS_FROZEN.slice().sort();
  const w4Match = liveW4 && JSON.stringify(liveW4) === JSON.stringify(frozenSorted);

  const inst = loadDir(instrumentDir);
  for (const k of Object.keys(inst.bySeed)) inst.bySeed[k] = classifyHavenTick(inst.bySeed[k]);
  const instSummary = summarizeHavenTick(inst);
  let ctrlSummary = null;
  if (controlDir) {
    const ctrl = loadDir(controlDir);
    for (const k of Object.keys(ctrl.bySeed)) ctrl.bySeed[k] = classifyHavenTick(ctrl.bySeed[k]);
    ctrlSummary = summarizeHavenTick(ctrl);
  }
  const instErrors = instSummary.seedpathsFrame.marginals.firstFail.perSeed.reduce(function (t, s) { return t + s.instrumentErrors; }, 0);
  const ctrlErrors = ctrlSummary ? ctrlSummary.seedpathsFrame.marginals.firstFail.perSeed.reduce(function (t, s) { return t + s.instrumentErrors; }, 0) : 0;
  function attributionPass(summary) {
    if (!summary) return true;
    return summary.bareUnknownReasons === 0 &&
      summary.unattributedEpisodes === 0 &&
      summary.unknownHavenSources === 0 &&
      summary.unknownSeedRows === 0 &&
      summary.holdersWithoutCreation === 0 &&
      summary.creationRowMissing === 0 &&
      summary.frameDifference === 0;
  }
  const bar1 = attributionPass(instSummary) && attributionPass(ctrlSummary);
  const bar2 = inst.files.length === 8 && (!ctrlSummary || ctrlSummary.seedpathsFrame.marginals.firstFail.files === 8);
  const bar3 = instErrors === 0 && ctrlErrors === 0;

  const out = {
    arm: 'haventick-b', run: 'haventick-b',
    instrumentDir: path.basename(instrumentDir), controlDir: controlDir ? path.basename(controlDir) : null,
    wave4IdsMatch: !!w4Match, wave4IdsLive: liveW4, wave4IdsFrozen: frozenSorted,
    instrument: instSummary, control: ctrlSummary,
    bars: {
      attribution: { pass: bar1,
        instrumentCoverage: instSummary.attributionCoverage, instrumentEpisodes: instSummary.episodesOpened,
        instrumentAttributed: instSummary.attributedEpisodes, instrumentUnattributed: instSummary.unattributedEpisodes,
        controlCoverage: ctrlSummary ? ctrlSummary.attributionCoverage : null,
        controlEpisodes: ctrlSummary ? ctrlSummary.episodesOpened : null,
        bareUnknownReasons: instSummary.bareUnknownReasons + (ctrlSummary ? ctrlSummary.bareUnknownReasons : 0),
        unknownHavenSources: instSummary.unknownHavenSources + (ctrlSummary ? ctrlSummary.unknownHavenSources : 0),
        unknownSeedRows: instSummary.unknownSeedRows + (ctrlSummary ? ctrlSummary.unknownSeedRows : 0),
        censusRowWithoutEpisode: instSummary.censusRowWithoutEpisode + (ctrlSummary ? ctrlSummary.censusRowWithoutEpisode : 0),
        censusRowWithoutEpisodeCauses: {
          w3PlanNoEpisode: instSummary.censusRowWithoutEpisodeCauses.w3PlanNoEpisode + (ctrlSummary ? ctrlSummary.censusRowWithoutEpisodeCauses.w3PlanNoEpisode : 0),
          postDeathTail: instSummary.censusRowWithoutEpisodeCauses.postDeathTail + (ctrlSummary ? ctrlSummary.censusRowWithoutEpisodeCauses.postDeathTail : 0),
          sameDayRetargetTarget: instSummary.censusRowWithoutEpisodeCauses.sameDayRetargetTarget + (ctrlSummary ? ctrlSummary.censusRowWithoutEpisodeCauses.sameDayRetargetTarget : 0),
          w3RetargetContinuation: instSummary.censusRowWithoutEpisodeCauses.w3RetargetContinuation + (ctrlSummary ? ctrlSummary.censusRowWithoutEpisodeCauses.w3RetargetContinuation : 0),
          unexplained: instSummary.censusRowWithoutEpisodeCauses.unexplained + (ctrlSummary ? ctrlSummary.censusRowWithoutEpisodeCauses.unexplained : 0),
        },
        holdersWithoutCreation: instSummary.holdersWithoutCreation + (ctrlSummary ? ctrlSummary.holdersWithoutCreation : 0),
        creationRowMissing: instSummary.creationRowMissing + (ctrlSummary ? ctrlSummary.creationRowMissing : 0),
        frameDifference: instSummary.frameDifference + (ctrlSummary ? ctrlSummary.frameDifference : 0) },
      corpus: { pass: bar2, instrumentFiles: inst.files.length, controlFiles: ctrlSummary ? ctrlSummary.seedpathsFrame.marginals.firstFail.files : null },
      instrumentErrors: { pass: bar3, instrument: instErrors, control: ctrlErrors },
    },
  };
  const outFile = path.join(REPO, 'evidence', '2026-11-16', 'haventick-b-analysis.json');
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(out, null, 2) + '\n');

  function printLeg(name, sum) {
    const ff = sum.seedpathsFrame.marginals.firstFail;
    console.log('=== haventick-b ' + name + ' leg ===');
    console.log('seeds: ' + ff.seeds + '  files: ' + ff.files +
      '  seedCallsW4: ' + ff.seedCallsW4 + '  seedpathsInstances: ' + sum.seedpathsFrame.instancesOpened +
      '  episodesOpened: ' + sum.episodesOpened + '  scoredDawns: ' + sum.seedpathsFrame.marginals.marginalScoredDawns);
    console.log('episodes by creator: ' + JSON.stringify(sum.episodesByCreator) +
      '  coverage: ' + sum.attributionCoverage + ' (' + sum.attributedEpisodes + '/' + sum.episodesOpened + ')' +
      '  unattributed: ' + sum.unattributedEpisodes + '  handoffs: ' + sum.handoffs);
    console.log('launches by creator: ' + JSON.stringify(sum.launchesByCreator) + '  launches: ' + sum.launches +
      '  launchKills(w3+): ' + sum.launchKills + '  launchKills(w4+): ' + sum.launchKillsW4);
    console.log('creates: havenTick=' + sum.havenTickCreates + ' winPlanOf=' + sum.winPlanOfCreates +
      ' total=' + sum.totalCreates + ' wave3Creations=' + sum.wave3Creations +
      ' nonOpeningSeed=' + sum.nonOpeningSeedCreations);
    console.log('ledger: censusRowWithoutEpisode=' + sum.censusRowWithoutEpisode +
      ' causes=' + JSON.stringify(sum.censusRowWithoutEpisodeCauses) +
      ' holdersWithoutCreation=' + sum.holdersWithoutCreation +
      ' creationRowMissing=' + sum.creationRowMissing + ' unknownHaven=' + sum.unknownHavenSources +
      ' unknownSeedRows=' + sum.unknownSeedRows + ' frameDifference=' + sum.frameDifference);
    console.log('wall: ' + JSON.stringify(sum.wall) + '  medianSurvival: ' + sum.medianSurvival);
    if (sum.unattributedList.length) console.log('unattributed episodes: ' + JSON.stringify(sum.unattributedList));
    if (sum.launchKillList.length) console.log('launch kills: ' + JSON.stringify(sum.launchKillList));
  }
  printLeg('instrument', instSummary);
  if (ctrlSummary) printLeg('control', ctrlSummary);
  console.log('bars: attribution=' + (bar1 ? 'PASS' : 'FAIL') +
    ' corpus=' + (bar2 ? 'PASS' : 'FAIL') + ' instrumentErrors=' + (bar3 ? 'PASS' : 'FAIL') +
    ' wave4Ids=' + (w4Match ? 'MATCH' : 'MISMATCH'));
  console.log('analysis: ' + path.relative(REPO, outFile));
  if (!bar1 || !bar2 || !bar3 || !w4Match) process.exitCode = 1;
}

if (require.main === module) main();
module.exports = { classifyHavenTick: classifyHavenTick, summarizeHavenTick: summarizeHavenTick, CREATORS: CREATORS };
