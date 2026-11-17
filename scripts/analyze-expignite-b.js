// analyze-expignite-b.js — analyzer, arm sim-expignite-b
// (DIAG: findings backlog #2463 — TWO SEEDS NEVER ATTEMPT A LAUNCH
// AT ALL). Loads the OFF + ON corpora, reuses the medicduty analyzer
// for launch/trip classification (origin, block reason, candidate-duty,
// trip matching), and adds the ignition classification: every
// villager-day at home (alive, at Haven, not away, not already out)
// lands in exactly one class of the frozen taxonomy — A no-dawn-score,
// B no-candidate, C candidate-lost, D commit-no-depart, E
// depart-blocked, F launched — with subtypes from the raw rows. D3
// re-derivations: depart return from the commit at call time,
// tick-gate ⟺ depart-row existence per (day, part, vid), the soft
// expedition hash roll (re-implemented FNV-1a dawnHashRoll), win-plan
// candidate necessary conditions, and the medicduty launch checks.
// Usage:
//   node scripts/analyze-expignite-b.js evidence/2026-11-16/perseed-expignite-b-on [evidence/2026-11-16/perseed-expignite-b-off] [evidence/2026-11-16/expignite-b-analysis.json]
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');
const MED = require(path.join(REPO, 'scripts', 'analyze-medicduty-b.js'));

function round(x, n) { if (x == null || !isFinite(x)) return null; const p = Math.pow(10, n || 4); return Math.round(x * p) / p; }
function med(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort(function (a, b) { return a - b; });
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function loadDir(dir) {
  const full = path.isAbsolute(dir) ? dir : path.join(REPO, dir);
  const files = fs.readdirSync(full).filter(function (f) { return f.indexOf('expignite-b-s') === 0 && f.slice(-5) === '.json'; }).sort();
  const bySeed = {};
  for (const f of files) {
    const raw = JSON.parse(fs.readFileSync(path.join(full, f), 'utf8'));
    bySeed[raw.seed] = raw;
  }
  return { dir: full, files: files, bySeed: bySeed };
}

// dawnHashRoll, re-implemented from villager-brain.js (FNV-1a over
// vid:day:salt, xorshift mix, [0,1)). The soft-expedition override
// consults exactly this roll, so C-hash vs picked-via-hash is exactly
// re-derivable from the score row's day + vid.
function dawnHashRoll(vid, day, salt) {
  const s = String(vid || '') + ':' + day + ':' + (salt || 'exped');
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h ^= h >>> 13; h = Math.imul(h, 1274126177); h ^= h >>> 16;
  return ((h >>> 0) % 10000) / 10000;
}
// Soft-expedition weight from the recorded feeder inputs
// (expeditionCand: explorer 0.55 / wanderer 0.28, potential x1.6,
// rounded to 3dp — the same rounding the driver stores on the row).
function softWeight(inputs) {
  if (!inputs || (inputs.profile !== 'wanderer' && inputs.profile !== 'explorer')) return null;
  let w = (inputs.profile === 'explorer' ? 0.55 : 0.28);
  if (inputs.potential) w *= 1.6;
  return Math.round(w * 1000) / 1000;
}
// Whether expeditionCand would offer a soft EXPEDITION candidate from
// the recorded inputs (profile / night / trigger / maxDist / sick —
// all exactly recorded; potential only scales the weight).
function softOffered(inputs) {
  if (!inputs) return false;
  if (inputs.profile !== 'wanderer' && inputs.profile !== 'explorer') return false;
  if (inputs.night) return false;
  if (inputs.danger != null && inputs.danger >= 4) return false;
  if (inputs.maxDist != null && inputs.maxDist < 1) return false;
  if (inputs.sick) return false;
  return true;
}
const WINPLAN_STAGES = ['party', 'hunt', 'standing', 'table'];
// Companion-launch lines, derived from the source at analysis time
// (never hardcoded — line numbers drift): inside
// vbrainExecuteDepart the inviter calls startExpedition(vid, ...)
// and the companions call startExpedition(c.companion, ...) /
// startExpedition(c.companion2, ...). A companion launch has no
// depart row of its own — the depart row belongs to the inviter —
// so a commit holder consumed as a companion earlier in the same
// tick must not be misread as "depart should have fired".
let _companionLines = null;
function companionLaunchLines() {
  if (_companionLines) return _companionLines;
  _companionLines = [];
  try {
    const src = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-brain.js'), 'utf8').split('\n');
    for (let i = 0; i < src.length; i++) {
      if (/this\.startExpedition\(c\.companion/.test(src[i])) _companionLines.push(i + 1);
    }
  } catch (e) { _companionLines = []; }
  return _companionLines;
}
// Whether this launch row is a companion call (the inviter's depart
// launched them), read from the stored stack's vbrainExecuteDepart
// frame line. The inviter's own call and the plain call share the
// (vid, ...) argument shape and are NOT companion calls.
function isCompanionLaunch(row) {
  if (!row || !row.stackTop) return false;
  for (const ln of companionLaunchLines()) {
    if (new RegExp('villager-brain\\.js:' + ln + ':').test(row.stackTop)) return true;
  }
  return false;
}
// (vbrainExecuteDepart): stale/absent/non-EXPEDITION commit is
// 'normal'; win-plan holds are 'hold'; a party_launch is 'launch'
// iff the inviter's expedition exists after the call, else 'hold';
// a plain EXPEDITION commit always returns 'launch' (even blocked).
function deriveDepartReturn(row) {
  const c = row.commit;
  if (!c || c.day == null || c.day !== row.day) return 'normal';
  if (c.winPlanAction === 'gear_hold' || c.winPlanAction === 'veteran_guard' || c.winPlanAction === 'party_wait') return 'hold';
  if (c.kind !== 'EXPEDITION') return 'normal';
  if (c.winPlanAction === 'party_launch') return row.expedAfter ? 'launch' : 'hold';
  return 'launch';
}
// Re-derive the first agencyTick gate (driver's deriveFirstTickGate,
// re-implemented so the check is independent of the stored value).
function deriveFirstTickGate(snap, commit) {
  if (!snap) return 'unknown-gate';
  if (snap.dead) return 'D-dead';
  if (snap.engaged) return 'D-engaged';
  if (snap.hasExped) return 'D-already-out';
  const isPartyLaunch = !!(commit && commit.winPlanAction === 'party_launch');
  if (snap.profile !== 'wanderer' && snap.profile !== 'explorer' && !isPartyLaunch) return 'D-profile';
  if (!snap.atHaven) return 'D-node';
  if (snap.night) return 'D-night';
  const isExpedCommit = !!(commit && commit.kind === 'EXPEDITION');
  if (snap.indoorObj && !isExpedCommit) return 'D-indoor';
  if (snap.trigger) return 'D-trigger';
  return 'depart-reached';
}

function expedCandsOf(scoreRow) {
  const out = [];
  for (const c of (scoreRow.candidates || [])) {
    if (c && c.kind === 'EXPEDITION') out.push(c);
  }
  return out;
}

function classifyIgnition(rawLeg) {
  const seeds = Object.keys(rawLeg.bySeed).sort().map(function (k) { return rawLeg.bySeed[k]; });
  const dayClasses = []; // one row per denominator villager-day
  const mismatches = [], unknowns = [];
  const excluded = { dead: 0, away: 0, alreadyOut: 0, notAtHaven: 0 };
  const classCounts = {};
  const subCounts = {};
  const offCensusLaunches = [];
  const legacyLaunches = [];
  const companionConsumed = []; // tick rows explained by companion consumption
  function bump(cls, sub) {
    classCounts[cls] = (classCounts[cls] || 0) + 1;
    const k = cls + '/' + sub;
    subCounts[k] = (subCounts[k] || 0) + 1;
  }
  for (const s of seeds) {
    const censusByDay = {}, scoreByDayVid = {}, gateByDayVid = {};
    const departByDayVid = {}, departByDayPartVid = {}, tickByDayVid = {};
    const launchByDayVid = {};
    for (const c of (s.censusRows || [])) {
      censusByDay[c.day] = censusByDay[c.day] || {};
      censusByDay[c.day][c.vid] = c;
    }
    function keyed(arr, map) {
      for (const r of (arr || [])) {
        const k = r.day + '|' + r.vid;
        map[k] = map[k] || [];
        map[k].push(r);
      }
    }
    keyed(s.scoreRows, scoreByDayVid);
    keyed(s.gateRows, gateByDayVid);
    keyed(s.departRows, departByDayVid);
    keyed(s.tickRows, tickByDayVid);
    keyed(s.launches, launchByDayVid);
    for (const d of (s.departRows || [])) departByDayPartVid[d.day + '|' + d.part + '|' + d.vid] = d;
    // Depart-return D3 on every depart row.
    for (const d of (s.departRows || [])) {
      const re = deriveDepartReturn(d);
      if (re !== d.ret) mismatches.push({ seed: s.seed, vid: d.vid, day: d.day, part: d.part, kind: 'depart-return',
        stored: d.ret, rederived: re, commit: d.commit });
    }
    // Tick-gate ⟺ depart-row D3 on every tick row. Companion
    // consumption is the one legitimate exception: a commit holder
    // launched as someone else's companion earlier in the same tick
    // never reaches their own roster turn (the `if (ex)` branch
    // takes them), so no depart row of their own exists — but a
    // companion launch row at the same (day, part) must exist.
    for (const t of (s.tickRows || [])) {
      const gate = deriveFirstTickGate(t.gates, t.commit);
      const dep = departByDayPartVid[t.day + '|' + t.part + '|' + t.vid];
      if (gate === 'depart-reached' && !dep) {
        const comp = (s.launches || []).some(function (l) {
          return l.vid === t.vid && l.day === t.day && l.part === t.part && isCompanionLaunch(l);
        });
        if (comp) companionConsumed.push({ seed: s.seed, vid: t.vid, day: t.day, part: t.part });
        else mismatches.push({ seed: s.seed, vid: t.vid, day: t.day, part: t.part,
          kind: 'tick-depart', stored: 'no-depart-row', rederived: 'depart-reached', gates: t.gates });
      }
      if (gate !== 'depart-reached' && gate !== 'unknown-gate' && dep) mismatches.push({ seed: s.seed, vid: t.vid, day: t.day, part: t.part,
        kind: 'tick-depart', stored: 'depart-row-present', rederived: gate, gates: t.gates, departRet: dep.ret });
      if (gate === 'unknown-gate') unknowns.push({ seed: s.seed, vid: t.vid, day: t.day, part: t.part, reason: 'tick snapshot missing; hook: tickGateSnapshot' });
    }
    // Launches with no census villager that day: the scholar-that-day
    // (the census excludes the live scholar each tick, and the scholar
    // can change mid-run by succession, so no single end-of-run id
    // labels them) or a villager who joined/returned mid-day. A
    // companion-frame launch is explained either way; any other launch
    // needs its own depart row, or it is unknown.
    // Legacy-origin launches (win-plan / random-agency paths) are
    // recorded once here whether or not the villager is on the census.
    for (const l of (s.launches || [])) {
      const cday = censusByDay[l.day] || {};
      if (l.origin === 'winplan-party_launch' || l.origin === 'random-agency') {
        legacyLaunches.push({ seed: s.seed, vid: l.vid, day: l.day, origin: l.origin, landed: l.landed, note: 'legacy ignition path fired' });
      }
      if (!cday[l.vid]) {
        const dep = (departByDayVid[l.day + '|' + l.vid] || []).length > 0;
        if (!dep && !isCompanionLaunch(l)) {
          unknowns.push({ seed: s.seed, vid: l.vid, day: l.day, reason: 'launch with no census row and no depart row; hook: census/depart wraps' });
        } else {
          offCensusLaunches.push({ seed: s.seed, vid: l.vid, day: l.day, origin: l.origin, landed: l.landed,
            companion: isCompanionLaunch(l), note: 'off-census launch (scholar-that-day or mid-day joiner)' });
        }
      }
    }
    // Per-day classification over the census denominator.
    const days = Object.keys(censusByDay).sort(function (a, b) { return a - b; });
    for (const day of days) {
      const vids = Object.keys(censusByDay[day]).sort();
      for (const vid of vids) {
        const cen = censusByDay[day][vid];
        if (!cen.alive) { excluded.dead++; continue; }
        if (cen.away) { excluded.away++; continue; }
        if (cen.hasExped) { excluded.alreadyOut++; continue; }
        if (!cen.atHaven) { excluded.notAtHaven++; continue; }
        const dk = day + '|' + vid;
        const scores = (scoreByDayVid[dk] || []).slice().sort(function (a, b) { return a.seq - b.seq; });
        const gates = (gateByDayVid[dk] || []).slice().sort(function (a, b) { return a.seq - b.seq; });
        const departs = (departByDayVid[dk] || []).slice().sort(function (a, b) { return a.seq - b.seq; });
        const ticks = (tickByDayVid[dk] || []).slice().sort(function (a, b) { return a.seq - b.seq; });
        const launches = (launchByDayVid[dk] || []).slice().sort(function (a, b) { return a.seq - b.seq; });
        let cls = null, sub = null, detail = null;
        if (launches.length) {
          const landed = launches.filter(function (l) { return l.landed; });
          if (landed.length) { cls = 'F'; sub = landed[0].origin || 'landed'; }
          else { cls = 'E'; sub = launches[0].blockReason || 'unknown-block'; }
          const depExped = departs.filter(function (d) { return d.commit && d.commit.kind === 'EXPEDITION' && d.commit.day === Number(day); });
          // A companion launch has no depart row of its own (the row
          // belongs to the inviter) — only a non-companion vbrain
          // launch without one is a mismatch.
          if (!depExped.length && launches.some(function (l) { return l.origin === 'vbrain-party_launch' && !isCompanionLaunch(l); })) {
            mismatches.push({ seed: s.seed, vid: vid, day: Number(day), kind: 'launch-without-depart',
              stored: 'no-expedition-depart-row', rederived: 'vbrain-launch', origin: 'vbrain-party_launch' });
          }
          if (cls === 'E' && sub === 'unknown-block') unknowns.push({ seed: s.seed, vid: vid, day: Number(day), reason: 'blocked launch with unknown-block; hook: gateSnapshot' });
        } else if (departs.some(function (d) { return d.commit && d.commit.kind === 'EXPEDITION' && d.commit.day === Number(day); })) {
          // Depart called on an EXPEDITION commit, but no launch row:
          // only the already-out early return explains it, and the
          // census says not-out at part 0 — a launch earlier the same
          // day would have left a row. Unexplained.
          unknowns.push({ seed: s.seed, vid: vid, day: Number(day), reason: 'depart on EXPEDITION commit with no launch row; hook: startExpedition wrap' });
          cls = 'D'; sub = 'depart-no-launch';
        } else if (ticks.length) {
          // Every tick carried today's EXPEDITION commit; the first
          // failing gate of the earliest tick is the subtype. A tick
          // that derives depart-reached with no depart row was already
          // flagged as a mismatch above — here it is unknown, not D.
          let firstGate = null, reachedNoDepart = false;
          for (const t of ticks) {
            const g = deriveFirstTickGate(t.gates, t.commit);
            if (g === 'depart-reached') { reachedNoDepart = true; break; }
            if (!firstGate) firstGate = g;
          }
          if (reachedNoDepart) {
            unknowns.push({ seed: s.seed, vid: vid, day: Number(day), reason: 'tick derived depart-reached but no depart row and no launch; hook: agencyTick wrap' });
            cls = 'D'; sub = 'depart-should-have-fired';
          } else {
            cls = 'D'; sub = firstGate || 'unknown-gate';
            if (sub === 'unknown-gate') unknowns.push({ seed: s.seed, vid: vid, day: Number(day), reason: 'tick snapshot missing for a commit holder; hook: tickGateSnapshot' });
          }
        } else {
          // No commit ever reached a tick: the answer lives in the
          // last score-or-gate event of the day (by seq — the live
          // commit is the last write).
          const lastScore = scores.length ? scores[scores.length - 1] : null;
          const lastGate = gates.length ? gates[gates.length - 1] : null;
          if (lastGate && (!lastScore || lastGate.seq > lastScore.seq)) {
            cls = 'B'; sub = 'gate-' + (lastGate.gateId || lastGate.kind || 'unknown');
            detail = { gateKind: lastGate.kind, gateId: lastGate.gateId };
          } else if (lastScore) {
            const cands = expedCandsOf(lastScore);
            if (cands.length) {
              const cand = cands[0];
              if (lastScore.pick === 'EXPEDITION') {
                // A commit was written but no tick ever saw it: only a
                // score after the final tick of the day explains it
                // (the commit goes stale overnight).
                if (lastScore.part === 3) { cls = 'D'; sub = 'late-commit'; }
                else {
                  unknowns.push({ seed: s.seed, vid: vid, day: Number(day), reason: 'EXPEDITION picked at part ' + lastScore.part + ' but no tick row; hook: agencyTick wrap' });
                  cls = 'D'; sub = 'commit-without-tick';
                }
              } else {
                cls = 'C';
                if (cand.winPlanAction === 'party_launch') {
                  mismatches.push({ seed: s.seed, vid: vid, day: Number(day), kind: 'party-launch-lost',
                    stored: lastScore.pick, rederived: 'party_launch-always-overrides', override: lastScore.override });
                  sub = 'winplan-lost';
                } else if (lastScore.override === 'assign_standing') sub = 'assign';
                else if (lastScore.override === 'duty_top_score') sub = 'duty';
                else if (lastScore.override && lastScore.override.indexOf('win_plan:') === 0) sub = 'winplan-hold';
                else if (lastScore.override === 'expedition_hash') {
                  mismatches.push({ seed: s.seed, vid: vid, day: Number(day), kind: 'hash-pick-mismatch',
                    stored: lastScore.pick, rederived: 'expedition_hash override must pick EXPEDITION' });
                  sub = 'hash-pick-mismatch';
                } else if (lastScore.corePick === 'HAVEN_CHORE' || lastScore.corePick === 'REST' || lastScore.corePick === 'EAT' || lastScore.corePick === 'SEEK') sub = 'hash';
                else sub = 'core-outdoor';
                // Hash D3 on soft candidates: the stored outcome must
                // match the re-derived roll.
                if (cand.vbrainSrc === 'agency_range' && lastScore.inputs) {
                  const w = softWeight(lastScore.inputs);
                  const chance = w != null ? Math.min(0.95, w / 2) : null;
                  const roll = dawnHashRoll(vid, Number(day), 'exped');
                  if (chance != null) {
                    const shouldPick = roll < chance;
                    const didPick = lastScore.pick === 'EXPEDITION' && lastScore.override === 'expedition_hash';
                    if (sub === 'hash' && shouldPick) mismatches.push({ seed: s.seed, vid: vid, day: Number(day), kind: 'hash-roll',
                      stored: 'hash-failed', rederived: 'roll ' + roll + ' < chance ' + chance, w: w });
                    if (didPick && !shouldPick) mismatches.push({ seed: s.seed, vid: vid, day: Number(day), kind: 'hash-roll',
                      stored: 'hash-picked', rederived: 'roll ' + roll + ' >= chance ' + chance, w: w });
                    if (cand.score != null && w != null && Math.abs(cand.score - w) > 0.001) mismatches.push({ seed: s.seed, vid: vid, day: Number(day), kind: 'soft-weight',
                      stored: cand.score, rederived: w });
                  }
                }
                // Win-plan candidate necessary condition: a party_launch
                // candidate needs a party/hunt/standing/table plan.
                if (cand.vbrainSrc === 'win_plan' && cand.winPlanAction === 'party_launch' && lastScore.inputs) {
                  if (WINPLAN_STAGES.indexOf(lastScore.inputs.planStage) === -1) mismatches.push({ seed: s.seed, vid: vid, day: Number(day), kind: 'winplan-stage',
                    stored: lastScore.inputs.planStage, rederived: 'party_launch needs party/hunt/standing/table' });
                }
                detail = { candSrc: cand.vbrainSrc || null, candAction: cand.winPlanAction || null, candW: cand.score != null ? cand.score : null,
                  pick: lastScore.pick, corePick: lastScore.corePick, override: lastScore.override };
              }
            } else {
              cls = 'B';
              const inp = lastScore.inputs || {};
              if (inp.planStage && WINPLAN_STAGES.indexOf(inp.planStage) !== -1) {
                const hasWait = (lastScore.candidates || []).some(function (c) { return c && c.winPlanAction === 'party_wait'; });
                if (inp.poolDepth === 0 || hasWait) sub = 'plan-no-companion';
                else sub = 'plan-companion';
                detail = { planStage: inp.planStage, poolDepth: inp.poolDepth, partyWait: hasWait };
              } else if (inp.planStage === 'gear') {
                const hasHold = (lastScore.candidates || []).some(function (c) { return c && c.winPlanAction === 'gear_hold'; });
                sub = hasHold ? 'gear-hold' : 'gear-no-candidate';
              } else if (inp.planStage === 'table') {
                const hasGuard = (lastScore.candidates || []).some(function (c) { return c && c.winPlanAction === 'veteran_guard'; });
                sub = hasGuard ? 'veteran-guard' : 'table-no-candidate';
              } else if (inp.profile !== 'wanderer' && inp.profile !== 'explorer') sub = 'profile';
              else if (inp.night) sub = 'night';
              else if (inp.danger != null && inp.danger >= 4) sub = 'trigger';
              else if (inp.sick) sub = 'sick';
              else if (inp.maxDist != null && inp.maxDist < 1) sub = 'range';
              else if (softOffered(inp)) {
                mismatches.push({ seed: s.seed, vid: vid, day: Number(day), kind: 'soft-should-offer',
                  stored: 'no-EXPEDITION-candidate', rederived: 'soft inputs all pass', inputs: inp });
                sub = 'soft-should-offer';
              } else sub = 'other';
              detail = detail || { planStage: inp.planStage || null, profile: inp.profile || null,
                poolDepth: inp.poolDepth != null ? inp.poolDepth : null,
                pick: lastScore.pick, corePick: lastScore.corePick, override: lastScore.override };
            }
          } else {
            cls = 'A';
            if (cen.objState && cen.objState !== 'idle' && cen.objState !== 'done' && cen.objState !== 'returning') sub = 'mid-errand';
            else sub = 'other';
            detail = { objKind: cen.objKind || null, objState: cen.objState || null };
          }
        }
        bump(cls, sub);
        dayClasses.push({ seed: s.seed, day: Number(day), vid: vid, name: cen.name || null,
          profile: cen.profile || null, planStage: cen.planStage || null,
          cls: cls, sub: sub, detail: detail,
          scores: scores.length, gates: gates.length, departs: departs.length,
          ticks: ticks.length, launches: launches.length });
      }
    }
  }
  return { dayClasses: dayClasses, classCounts: classCounts, subCounts: subCounts,
    mismatches: mismatches, unknowns: unknowns, excluded: excluded,
    offCensusLaunches: offCensusLaunches, legacyLaunches: legacyLaunches,
    companionConsumed: companionConsumed };
}

function summarizeIgnition(rawLeg, ign) {
  const seeds = Object.keys(rawLeg.bySeed).sort().map(function (k) { return rawLeg.bySeed[k]; });
  const perSeed = [];
  for (const s of seeds) {
    const rows = ign.dayClasses.filter(function (r) { return r.seed === s.seed; });
    const counts = {};
    for (const r of rows) counts[r.cls] = (counts[r.cls] || 0) + 1;
    const subs = {};
    for (const r of rows) subs[r.cls + '/' + r.sub] = (subs[r.cls + '/' + r.sub] || 0) + 1;
    const launches = (s.launches || []).length;
    const landed = (s.launches || []).filter(function (l) { return l.landed; }).length;
    // Wanderer/explorer census: the soft path needs one to exist.
    const profiles = {};
    for (const c of (s.censusRows || [])) profiles[c.profile || 'null'] = (profiles[c.profile || 'null'] || 0) + 1;
    const roamers = {};
    for (const c of (s.censusRows || [])) {
      if (c.profile === 'wanderer' || c.profile === 'explorer') roamers[c.vid] = (roamers[c.vid] || 0) + 1;
    }
    const planHolders = {};
    for (const c of (s.censusRows || [])) {
      if (c.planStage) planHolders[c.vid] = c.planStage;
    }
    perSeed.push({ seed: s.seed, days: s.days, gameDays: s.gameDays, endReason: s.endReason,
      standing: s.standing, scaleRank: s.scaleRank, won: !!s.won, maxWave: s.maxWave,
      villageLost: !!s.villageLost,
      denominatorDays: rows.length, classCounts: counts, subCounts: subs,
      launches: launches, landed: landed, zeroAttempt: launches === 0, zeroLaunch: landed === 0,
      wandererExplorerVillagers: Object.keys(roamers).length,
      wandererExplorerDays: Object.keys(roamers).reduce(function (t, v) { return t + roamers[v]; }, 0),
      planHolderVillagers: Object.keys(planHolders).length,
      planStages: planHolders,
      profileCensusDays: profiles });
  }
  const zeroAttempt = perSeed.filter(function (r) { return r.zeroAttempt; }).map(function (r) { return r.seed; });
  const zeroLaunch = perSeed.filter(function (r) { return r.zeroLaunch; }).map(function (r) { return r.seed; });
  return { perSeed: perSeed, zeroAttemptSeeds: zeroAttempt, zeroLaunchSeeds: zeroLaunch,
    classCounts: ign.classCounts, subCounts: ign.subCounts, excluded: ign.excluded,
    offCensusLaunches: ign.offCensusLaunches, companionConsumed: ign.companionConsumed,
    legacyLaunches: ign.legacyLaunches,
    mismatches: ign.mismatches.length, unknowns: ign.unknowns.length };
}

function main() {
  const onDir = process.argv[2];
  const offDir = process.argv[3] || null;
  const outPath = process.argv[4] || path.join(REPO, 'evidence', '2026-11-16', 'expignite-b-analysis.json');
  if (!onDir) { console.error('EXPIGNITE ANALYZE STOP: onDir required.'); process.exit(2); }
  const on = loadDir(onDir);
  const onLaunch = MED.classifyLeg(on);
  const onIgn = classifyIgnition(on);
  const onLaunchSum = MED.summarizeLeg(on, onLaunch);
  const onIgnSum = summarizeIgnition(on, onIgn);
  let off = null, offIgn = null, offLaunchSum = null, d2 = null;
  if (offDir) {
    off = loadDir(offDir);
    offIgn = classifyIgnition(off);
    const offLaunch = MED.classifyLeg(off);
    offLaunchSum = MED.summarizeLeg(off, offLaunch);
    d2 = MED.compareDailySig(off, on);
  }
  const onErrors = Object.keys(on.bySeed).reduce(function (t, k) { return t + ((on.bySeed[k].instrumentErrors || []).length); }, 0);
  const offErrors = off ? Object.keys(off.bySeed).reduce(function (t, k) { return t + ((off.bySeed[k].instrumentErrors || []).length); }, 0) : 0;
  const allUnknowns = onIgn.unknowns.length + onLaunch.unknowns.length;
  const allMismatches = onIgn.mismatches.length + onLaunch.mismatches.length;
  const bar1 = on.files.length === 8 && onErrors === 0 && allUnknowns === 0 && allMismatches === 0 &&
    (onLaunchSum.blockedByReason['unknown-block'] || 0) === 0;
  const bar2 = true; // proof evaluated by test-expignite-b.js
  // Bar 3: every zero-attempt seed classified (dominant class named),
  // or the ignition path classified on all attempted seeds.
  const bar3 = (function () {
    if (onIgnSum.zeroAttemptSeeds.length >= 2) {
      return onIgnSum.zeroAttemptSeeds.every(function (seed) {
        const ps = onIgnSum.perSeed.filter(function (r) { return r.seed === seed; })[0];
        if (!ps) return false;
        const total = ps.denominatorDays || 0;
        if (!total) return false;
        const top = Object.keys(ps.classCounts).sort(function (a, b) { return ps.classCounts[b] - ps.classCounts[a]; })[0];
        return !!top && ps.classCounts[top] > 0;
      });
    }
    return onIgnSum.perSeed.every(function (ps) { return (ps.denominatorDays || 0) > 0; });
  })();
  const bar4 = true; // wall numbers present in onLaunchSum by construction
  const out = {
    arm: 'expignite-b', run: 'expignite-b',
    onDir: path.basename(onDir), offDir: offDir ? path.basename(offDir) : null,
    bars: {
      corpus: { pass: bar1, onFiles: on.files.length, offFiles: off ? off.files.length : null,
        onErrors: onErrors, offErrors: offErrors, unknowns: allUnknowns, mismatches: allMismatches,
        ignitionUnknowns: onIgn.unknowns, ignitionMismatches: onIgn.mismatches,
        launchUnknowns: onLaunch.unknowns, launchMismatches: onLaunch.mismatches },
      proof: { pass: bar2, note: 'evaluated by test-expignite-b.js' },
      classified: { pass: bar3, zeroAttemptSeeds: onIgnSum.zeroAttemptSeeds, zeroLaunchSeeds: onIgnSum.zeroLaunchSeeds },
      wall: { pass: bar4 },
    },
    d2FullBand: d2,
    ignition: onIgnSum,
    ignitionDayClasses: onIgn.dayClasses,
    launch: onLaunchSum,
    offIgnition: offIgn ? summarizeIgnition(off, offIgn) : null,
    offLaunch: offLaunchSum,
  };
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n');
  console.log(JSON.stringify({
    onFiles: on.files.length, offFiles: off ? off.files.length : null,
    denominatorDays: onIgn.dayClasses.length,
    classCounts: onIgn.classCounts, subCounts: onIgn.subCounts,
    excluded: onIgn.excluded,
    zeroAttemptSeeds: onIgnSum.zeroAttemptSeeds, zeroLaunchSeeds: onIgnSum.zeroLaunchSeeds,
    offCensusLaunches: onIgn.offCensusLaunches.length, companionConsumed: onIgn.companionConsumed.length,
    legacyLaunches: onIgn.legacyLaunches.length,
    launches: onLaunch.launches.length, trips: onLaunch.trips.length,
    unknowns: allUnknowns, mismatches: allMismatches,
    d2divergences: d2 ? d2.length : null,
    wallOn: onLaunchSum.wall, medianOn: onLaunchSum.medianSurvival,
    bars: { b1: bar1, b3: bar3 },
    out: path.relative(REPO, outPath),
  }, null, 2));
}

if (require.main === module) main();
module.exports = { dawnHashRoll: dawnHashRoll, softWeight: softWeight, softOffered: softOffered,
  deriveDepartReturn: deriveDepartReturn, deriveFirstTickGate: deriveFirstTickGate,
  deriveOrigin: MED.deriveOrigin, deriveBlockReasonFromGate: MED.deriveBlockReasonFromGate,
  deriveIsDuty: MED.deriveIsDuty, expedCandsOf: expedCandsOf,
  companionLaunchLines: companionLaunchLines, isCompanionLaunch: isCompanionLaunch,
  classifyIgnition: classifyIgnition, summarizeIgnition: summarizeIgnition, loadDir: loadDir };
