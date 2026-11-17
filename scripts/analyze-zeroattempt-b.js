// analyze-zeroattempt-b.js — analyzer, arm sim-zeroattempt-b
// (DIAG: decompose the dawn scorer's decision chain per villager-day
// — (a) which sub-gate fires when no EXPEDITION candidate is offered,
// (b) what ASSIGN picks instead and why it always wins, (c) why
// 0-plan-holder villages never get a plan, (d) whether the soft path
// ever reaches its chance roll. Extends the expignite analyzer: loads
// the OFF + ON corpora, reuses the medicduty analyzer for launch/trip
// classification (origin, block reason, candidate-duty, trip
// matching), and adds the ignition classification: every villager-day
// at home (alive, at Haven, not away, not already out) lands in
// exactly one class of the frozen taxonomy — A no-dawn-score, B
// no-candidate, C candidate-lost, D commit-no-depart, E
// depart-blocked, F launched — with subtypes from the raw rows, PLUS
// the zeroattempt decompositions: B code-order gate + plan context,
// C/assign task/via/weights, the soft-hash consultation table, and
// the plan-store decomposition (first initializer, havenTick
// store-missing calls, creation ledger). D3 re-derivations: depart
// return from the commit at call time, tick-gate ⟺ depart-row
// existence per (day, part, vid), the soft expedition hash roll
// (re-implemented FNV-1a dawnHashRoll), win-plan candidate necessary
// conditions, hash consistency on every soft row, the plan-ledger
// check (every holder traces to a creation), and the medicduty launch
// checks.
// Usage:
//   node scripts/analyze-zeroattempt-b.js evidence/2026-11-16/perseed-zeroattempt-b-on [evidence/2026-11-16/perseed-zeroattempt-b-off] [evidence/2026-11-16/zeroattempt-b-analysis.json]
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
  const files = fs.readdirSync(full).filter(function (f) { return f.indexOf('zeroattempt-b-s') === 0 && f.slice(-5) === '.json'; }).sort();
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

// codeOrderGate: the FIRST failing expeditionCand gate, in the
// code's own check order (villager-brain.js expeditionCand): profile
// -> night -> trigger (danger >= 4) -> maxDist < 1 -> sick. A later
// gate is never consulted once an earlier one fires, so the fired
// gate is the reason no soft candidate was offered. Returns the gate
// id, 'soft-should-offer' when every gate passes (a mismatch — the
// candidate should have been offered), or 'other'.
function codeOrderGate(inputs) {
  if (!inputs) return 'other';
  if (inputs.profile !== 'wanderer' && inputs.profile !== 'explorer') return 'profile';
  if (inputs.night) return 'night';
  if (inputs.danger != null && inputs.danger >= 4) return 'trigger';
  if (inputs.maxDist != null && inputs.maxDist < 1) return 'range';
  if (inputs.sick) return 'sick';
  return 'soft-should-offer';
}
// planCtxOf: the win-plan context of a score row, as a separate
// dimension from the fired gate (never the sub-gate itself): the plan
// stage, the companion-pool depth, and which win-plan hold (if any)
// was in the candidate list.
function planCtxOf(scoreRow) {
  const inp = (scoreRow && scoreRow.inputs) || {};
  const cands = (scoreRow && scoreRow.candidates) || [];
  let partyWait = false, gearHold = false, veteranGuard = false;
  for (const c of cands) {
    if (!c) continue;
    if (c.winPlanAction === 'party_wait') partyWait = true;
    if (c.winPlanAction === 'gear_hold') gearHold = true;
    if (c.winPlanAction === 'veteran_guard') veteranGuard = true;
  }
  return { planStage: inp.planStage || null, poolDepth: inp.poolDepth != null ? inp.poolDepth : null,
    partyWait: partyWait, gearHold: gearHold, veteranGuard: veteranGuard };
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
                // C/assign decomposition (b): the standing order that
                // beat the candidate — task, via, assigned day, the
                // ASSIGN weight (99) vs the EXPEDITION weight and the
                // core pick weight it beat.
                let assignCand = null, coreW = null;
                for (const cc of (lastScore.candidates || [])) {
                  if (cc && cc.kind === 'ASSIGN' && !assignCand) assignCand = cc;
                  if (cc && cc.kind === lastScore.corePick && coreW == null) coreW = (cc.score != null ? cc.score : null);
                }
                const asgInp = (lastScore.inputs && lastScore.inputs.assignedTask) || null;
                detail = { candSrc: cand.vbrainSrc || null, candAction: cand.winPlanAction || null, candW: cand.score != null ? cand.score : null,
                  pick: lastScore.pick, corePick: lastScore.corePick, override: lastScore.override,
                  assignTask: assignCand ? (assignCand.assignTask || null) : null,
                  assignVia: asgInp ? (asgInp.via || null) : null,
                  assignedDay: asgInp ? (asgInp.assignedDay != null ? asgInp.assignedDay : null) : null,
                  assignW: assignCand ? (assignCand.score != null ? assignCand.score : null) : null,
                  coreW: coreW, planCtx: planCtxOf(lastScore) };
              }
            } else {
              // B-sub is the FIRST failing expeditionCand gate, in
              // code order (profile -> night -> trigger -> range ->
              // sick). The win-plan context rides along as planCtx —
              // it explains why the plan path did not rescue the
              // villager, but it is never the fired gate.
              cls = 'B';
              const inp = lastScore.inputs || {};
              sub = codeOrderGate(inp);
              if (sub === 'soft-should-offer') {
                mismatches.push({ seed: s.seed, vid: vid, day: Number(day), kind: 'soft-should-offer',
                  stored: 'no-EXPEDITION-candidate', rederived: 'soft inputs all pass', inputs: inp });
              }
              detail = { gate: sub, planCtx: planCtxOf(lastScore),
                planStage: inp.planStage || null, profile: inp.profile || null,
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

// deriveHashStats: (d) — for every score row carrying a soft
// EXPEDITION candidate (vbrainSrc 'agency_range'), was the hash
// consulted, and what did it return? Consulted iff no override fired
// AND the core pick is indoor; otherwise the pre-empting reason is
// named. The roll/chance are re-derived (D3), never trusted from the
// row. Consistency: consulted+pass must pick EXPEDITION via
// expedition_hash; anything else must not.
function deriveHashStats(rawLeg) {
  const seeds = Object.keys(rawLeg.bySeed).sort().map(function (k) { return rawLeg.bySeed[k]; });
  const totals = { softRows: 0, consulted: 0, passed: 0, failed: 0,
    preempt: { 'outdoor-core': 0, assign: 0, duty: 0, winplan: 0 } };
  const bySeed = {};
  const mismatches = [];
  const INDOOR = { HAVEN_CHORE: 1, REST: 1, EAT: 1, SEEK: 1 };
  for (const s of seeds) {
    const st = { softRows: 0, consulted: 0, passed: 0, failed: 0,
      preempt: { 'outdoor-core': 0, assign: 0, duty: 0, winplan: 0 } };
    for (const r of (s.scoreRows || [])) {
      const cands = r.candidates || [];
      let soft = null;
      for (const c of cands) if (c && c.kind === 'EXPEDITION' && c.vbrainSrc === 'agency_range') { soft = c; break; }
      if (!soft) continue;
      st.softRows++; totals.softRows++;
      const w = softWeight(r.inputs);
      const chance = (w != null ? Math.min(0.95, w / 2) : null);
      const roll = dawnHashRoll(r.vid, Number(r.day), 'exped');
      const indoorCore = !!INDOOR[r.corePick];
      const isHashPick = r.pick === 'EXPEDITION' && r.override === 'expedition_hash';
      // Weight D3 on rows the C-branch check never sees (picked rows).
      if (r.pick === 'EXPEDITION' && soft.score != null && w != null && Math.abs(soft.score - w) > 0.001) {
        mismatches.push({ seed: s.seed, vid: r.vid, day: Number(r.day), kind: 'soft-weight',
          stored: soft.score, rederived: w });
      }
      // Consulted iff the core pick is indoor AND no earlier override
      // fired — a passed hash SETS override to 'expedition_hash', so
      // that override value means consulted-and-passed, not pre-empted.
      const consulted = indoorCore && (r.override == null || r.override === 'expedition_hash');
      if (consulted) {
        st.consulted++; totals.consulted++;
        if (chance == null) { mismatches.push({ seed: s.seed, vid: r.vid, day: Number(r.day), kind: 'hash-no-chance', stored: 'soft candidate, no weight', rederived: 'inputs ' + JSON.stringify(r.inputs) }); continue; }
        const pass = roll < chance;
        if (pass) { st.passed++; totals.passed++; } else { st.failed++; totals.failed++; }
        if (pass && !isHashPick) mismatches.push({ seed: s.seed, vid: r.vid, day: Number(r.day), kind: 'hash-consistency',
          stored: 'roll ' + roll + ' < chance ' + chance + ' but pick ' + r.pick + '/' + r.override, rederived: 'hash-picked' });
        if (!pass && isHashPick) mismatches.push({ seed: s.seed, vid: r.vid, day: Number(r.day), kind: 'hash-consistency',
          stored: 'roll ' + roll + ' >= chance ' + chance + ' but hash-picked', rederived: 'hash-failed' });
      } else if (isHashPick) {
        // A hash pick without consultation is a contradiction, not a
        // pre-emption — it is never counted under preempt.
        mismatches.push({ seed: s.seed, vid: r.vid, day: Number(r.day), kind: 'hash-consistency',
          stored: 'hash-picked but hash never consulted (' + (r.override || 'outdoor-core') + ')', rederived: 'not-consulted' });
      } else {
        let pre = null;
        if (r.override === 'assign_standing') pre = 'assign';
        else if (r.override === 'duty_top_score') pre = 'duty';
        else if (r.override && r.override.indexOf('win_plan:') === 0) pre = 'winplan';
        else pre = 'outdoor-core';
        st.preempt[pre]++; totals.preempt[pre]++;
      }
    }
    bySeed[s.seed] = st;
  }
  return { totals: totals, bySeed: bySeed, mismatches: mismatches };
}

// decomposeStore: (c) — the plan-store story per seed, from the
// census (store-exists per day), the havenTick call ledger
// (store-before per call), the creation ledger, and the store-init
// rows. The planignite-a store diagnostic, in the ignition frame.
function decomposeStore(rawLeg) {
  const seeds = Object.keys(rawLeg.bySeed).sort().map(function (k) { return rawLeg.bySeed[k]; });
  const perSeed = [];
  const mismatches = [], unknowns = [];
  for (const s of seeds) {
    const census = s.censusRows || [];
    const haven = s.havenRows || [];
    const creates = s.v4creates || [];
    const inits = s.storeInitRows || [];
    let storeEverInit = !!s.storeExistsFinal;
    let firstStoreDay = null;
    for (const c of census) if (c.winPlanStoreExists) { storeEverInit = true; if (firstStoreDay == null || c.day < firstStoreDay) firstStoreDay = c.day; }
    if (inits.length) storeEverInit = true;
    let firstInit = null;
    for (const r of inits) if (!firstInit || r.day < firstInit.day) firstInit = r;
    if (storeEverInit && !firstInit) {
      firstInit = { day: firstStoreDay, creator: 'unrecorded-init', vid: null };
      mismatches.push({ seed: s.seed, kind: 'store-init-unrecorded',
        stored: 'store exists from day ' + firstStoreDay + ' with no init row', rederived: 'seedFromFight/noteKill/winPlanOf only' });
    }
    let firstSlainDay = null, firstFoughtDay = null;
    for (const c of census) {
      if (firstSlainDay == null && c.villageSlainN != null && c.villageSlainN > 0) firstSlainDay = c.day;
      if (firstFoughtDay == null && c.knowFoughtN != null && c.knowFoughtN > 0) firstFoughtDay = c.day;
    }
    let havenCalls = haven.length, storeMissing = 0, engagedStoreMissing = 0, engagementFail = 0, rangerCalls = 0;
    for (const h of haven) {
      if (h.profile === 'wanderer' || h.profile === 'explorer') rangerCalls++;
      if (!h.storeBefore) {
        storeMissing++;
        if ((h.foughtN | 0) > 0 || (h.slainN | 0) > 0) engagedStoreMissing++;
      } else if (!h.planBefore && (h.foughtN | 0) === 0 && (h.slainN | 0) === 0) {
        engagementFail++;
      }
    }
    const createsByCreator = {};
    let firstPlanDay = null, firstCreateCreator = null;
    const holders = {};
    for (const cr of creates) {
      createsByCreator[cr.creator] = (createsByCreator[cr.creator] || 0) + 1;
      if (firstPlanDay == null || cr.day < firstPlanDay) { firstPlanDay = cr.day; firstCreateCreator = cr.creator; }
      holders[cr.vid] = true;
    }
    let planHolderDays = 0;
    const firstHolderDayByVid = {};
    for (const c of census) {
      if (c.planStage) {
        planHolderDays++;
        if (firstHolderDayByVid[c.vid] == null || c.day < firstHolderDayByVid[c.vid]) firstHolderDayByVid[c.vid] = c.day;
      }
    }
    // Ledger check: every census holder traces to a creation on/before
    // its first observed day (prereg unknown bucket).
    for (const vid of Object.keys(firstHolderDayByVid)) {
      const firstCreate = creates.filter(function (cr) { return cr.vid === vid; })
        .sort(function (a, b) { return a.day - b.day; })[0];
      if (!firstCreate) unknowns.push({ seed: s.seed, vid: vid, day: firstHolderDayByVid[vid],
        reason: 'plan holder with no creation row; hook: creation-ledger wraps' });
      else if (firstCreate.day > firstHolderDayByVid[vid]) unknowns.push({ seed: s.seed, vid: vid, day: firstHolderDayByVid[vid],
        reason: 'holder observed day ' + firstHolderDayByVid[vid] + ' but first creation day ' + firstCreate.day + '; hook: creation-ledger wraps' });
    }
    if (firstPlanDay != null && firstInit && firstPlanDay < firstInit.day) {
      mismatches.push({ seed: s.seed, kind: 'plan-before-store',
        stored: 'first plan day ' + firstPlanDay, rederived: 'first init day ' + firstInit.day });
    }
    perSeed.push({ seed: s.seed, storeEverInit: storeEverInit,
      firstInitDay: firstInit ? firstInit.day : null, firstInitCreator: firstInit ? firstInit.creator : null,
      firstSlainDay: firstSlainDay, firstFoughtDay: firstFoughtDay,
      havenCalls: havenCalls, storeMissing: storeMissing,
      engagedStoreMissing: engagedStoreMissing, engagementFail: engagementFail,
      rangerCalls: rangerCalls, createsByCreator: createsByCreator,
      firstPlanDay: firstPlanDay, firstCreateCreator: firstCreateCreator,
      planHolderVillagers: Object.keys(holders).length, planHolderDays: planHolderDays,
      winPlanStats: s.winPlanStats || null });
  }
  return { perSeed: perSeed, mismatches: mismatches, unknowns: unknowns };
}

function summarizeIgnition(rawLeg, ign) {
  const hashStats = deriveHashStats(rawLeg);
  const storeStats = decomposeStore(rawLeg);
  const storeBySeed = {};
  for (const st of storeStats.perSeed) storeBySeed[st.seed] = st;
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
    // WHY per seed: dominant class/sub, dominant B code-order gate,
    // dominant C/assign task, hash outcome, store state.
    const topClass = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; })[0] || null;
    const topSub = Object.keys(subs).sort(function (a, b) { return subs[b] - subs[a]; })[0] || null;
    const bGates = {};
    for (const r of rows) if (r.cls === 'B' && r.detail && r.detail.gate) bGates[r.detail.gate] = (bGates[r.detail.gate] || 0) + 1;
    const bGateTop = Object.keys(bGates).sort(function (a, b) { return bGates[b] - bGates[a]; })[0] || null;
    const assignTasks = {};
    for (const r of rows) if (r.cls === 'C' && r.sub === 'assign' && r.detail && r.detail.assignTask) assignTasks[r.detail.assignTask] = (assignTasks[r.detail.assignTask] || 0) + 1;
    const assignTop = Object.keys(assignTasks).sort(function (a, b) { return assignTasks[b] - assignTasks[a]; })[0] || null;
    const store = storeBySeed[s.seed] || null;
    const hash = hashStats.bySeed[s.seed] || null;
    const why = { dominantClass: topClass, dominantSub: topSub, bGateTop: bGateTop,
      bGates: bGates, assignTop: assignTop, assignTasks: assignTasks,
      storeEverInit: store ? store.storeEverInit : null,
      firstInitDay: store ? store.firstInitDay : null,
      firstInitCreator: store ? store.firstInitCreator : null,
      engagedStoreMissing: store ? store.engagedStoreMissing : null,
      hashConsulted: hash ? hash.consulted : null, hashPassed: hash ? hash.passed : null,
      hashFailed: hash ? hash.failed : null };
    perSeed.push({ seed: s.seed, days: s.days, gameDays: s.gameDays, endReason: s.endReason,
      standing: s.standing, scaleRank: s.scaleRank, won: !!s.won, maxWave: s.maxWave,
      villageLost: !!s.villageLost,
      denominatorDays: rows.length, classCounts: counts, subCounts: subs,
      launches: launches, landed: landed, zeroAttempt: launches === 0, zeroLaunch: landed === 0,
      wandererExplorerVillagers: Object.keys(roamers).length,
      wandererExplorerDays: Object.keys(roamers).reduce(function (t, v) { return t + roamers[v]; }, 0),
      planHolderVillagers: Object.keys(planHolders).length,
      planStages: planHolders,
      profileCensusDays: profiles,
      store: store, hash: hash, why: why });
  }
  // Band-wide ASSIGN table (b): every C/assign day by task + via,
  // and assignment persistence (days continuously assigned per villager).
  const assignByTask = {}, assignByVia = {};
  const assignedDays = {};
  for (const r of ign.dayClasses) {
    if (r.cls === 'C' && r.sub === 'assign' && r.detail) {
      if (r.detail.assignTask) assignByTask[r.detail.assignTask] = (assignByTask[r.detail.assignTask] || 0) + 1;
      if (r.detail.assignVia) assignByVia[r.detail.assignVia] = (assignByVia[r.detail.assignVia] || 0) + 1;
    }
  }
  for (const s of seeds) {
    const byVid = {};
    for (const c of (s.censusRows || [])) {
      if (c.assignedTask && c.assignedTask.task) {
        const k = c.vid + '|' + c.assignedTask.task;
        byVid[k] = (byVid[k] || 0) + 1;
      }
    }
    for (const k of Object.keys(byVid)) assignedDays[s.seed + '|' + k] = byVid[k];
  }
  const zeroAttempt = perSeed.filter(function (r) { return r.zeroAttempt; }).map(function (r) { return r.seed; });
  const zeroLaunch = perSeed.filter(function (r) { return r.zeroLaunch; }).map(function (r) { return r.seed; });
  return { perSeed: perSeed, zeroAttemptSeeds: zeroAttempt, zeroLaunchSeeds: zeroLaunch,
    classCounts: ign.classCounts, subCounts: ign.subCounts, excluded: ign.excluded,
    offCensusLaunches: ign.offCensusLaunches, companionConsumed: ign.companionConsumed,
    legacyLaunches: ign.legacyLaunches,
    mismatches: ign.mismatches.length, unknowns: ign.unknowns.length,
    hashStats: hashStats, storeStats: storeStats,
    assignStats: { byTask: assignByTask, byVia: assignByVia, assignedDays: assignedDays } };
}

function main() {
  const onDir = process.argv[2];
  const offDir = process.argv[3] || null;
  const outPath = process.argv[4] || path.join(REPO, 'evidence', '2026-11-16', 'zeroattempt-b-analysis.json');
  if (!onDir) { console.error('ZEROATTEMPT ANALYZE STOP: onDir required.'); process.exit(2); }
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
  const allUnknowns = onIgn.unknowns.length + onLaunch.unknowns.length + onIgnSum.storeStats.unknowns.length;
  const allMismatches = onIgn.mismatches.length + onLaunch.mismatches.length +
    onIgnSum.hashStats.mismatches.length + onIgnSum.storeStats.mismatches.length;
  const bar1 = on.files.length === 8 && onErrors === 0 && allUnknowns === 0 && allMismatches === 0 &&
    (onLaunchSum.blockedByReason['unknown-block'] || 0) === 0;
  const bar2 = true; // proof evaluated by test-zeroattempt-b.js
  // Bar 3: every zero-attempt / zero-launch seed classified with a
  // dominant class AND a WHY (dominant B code-order gate, C/assign
  // task, hash outcome, store-init state all present). If no
  // zero-attempt seed occurs, the ignition rate + decomposition is the
  // report and the classification is N/A with reason (prereg bar 3).
  const bar3 = (function () {
    const targets = onIgnSum.perSeed.filter(function (ps) { return ps.zeroAttempt || ps.zeroLaunch; });
    if (!targets.length) return true;
    return targets.every(function (ps) {
      return ps.why && ps.why.dominantClass && ps.why.bGateTop != null &&
        ps.why.storeEverInit != null && ps.why.hashConsulted != null;
    });
  })();
  const bar4 = true; // wall numbers present in onLaunchSum by construction
  const out = {
    arm: 'zeroattempt-b', run: 'zeroattempt-b',
    onDir: path.basename(onDir), offDir: offDir ? path.basename(offDir) : null,
    bars: {
      corpus: { pass: bar1, onFiles: on.files.length, offFiles: off ? off.files.length : null,
        onErrors: onErrors, offErrors: offErrors, unknowns: allUnknowns, mismatches: allMismatches,
        ignitionUnknowns: onIgn.unknowns, ignitionMismatches: onIgn.mismatches,
        launchUnknowns: onLaunch.unknowns, launchMismatches: onLaunch.mismatches,
        hashMismatches: onIgnSum.hashStats.mismatches, storeMismatches: onIgnSum.storeStats.mismatches,
        storeUnknowns: onIgnSum.storeStats.unknowns },
      proof: { pass: bar2, note: 'evaluated by test-zeroattempt-b.js' },
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
    hashTotals: onIgnSum.hashStats.totals,
    storeNeverInit: onIgnSum.storeStats.perSeed.filter(function (r) { return !r.storeEverInit; }).map(function (r) { return r.seed; }),
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
  classifyIgnition: classifyIgnition, summarizeIgnition: summarizeIgnition, loadDir: loadDir,
  codeOrderGate: codeOrderGate, planCtxOf: planCtxOf,
  deriveHashStats: deriveHashStats, decomposeStore: decomposeStore };
