#!/usr/bin/env node
// scripts/test-holdsjoin-a.js — sim-holdsjoin-a joined analyzer (DIAG ONLY).
// PURE READS over the landed hunthold corpora
// (evidence/2026-10-29/perseed-hunthold-off|on/, seeds 75101-75108)
// + src/data/monsters.json wave lookup. No game code, no policy, no RNG.
//
// The join, per the committed prereg (evidence/2026-10-29/
// sim-holdsjoin-a-prereg.md):
//   Universe 1 — every funnel HUNT pick gets BOTH the departlag lag
//     class (verbatim from scripts/test-departlag-a.js) AND the
//     departhold class (verbatim priority from
//     scripts/test-departhold-a.js). If the departhold class is
//     overwritten-danger, the joined class is OVERWRITTEN-BY-VERDICT
//     regardless of the pick-only reading: a pick-only SUPERSEDED
//     reading is a MISREAD whenever a verdict overwrite sits
//     between the pick and the next pick (the murkcap caveat).
//   Universe 2 — evaluation chains (ALL waves): departhold
//     evaluations grouped by (seed, vid, mid, huntDay), split at
//     every terminal action (departed / overwritten), giving a
//     terminal class + held split per chain.
// Danger verdicts are deduped per evaluation (the ON corpus carries
// exact-duplicate danger records on delegated evaluations: the
// lever's pre-check plus the engine's identical re-check).
//
// Usage:
//   node scripts/test-holdsjoin-a.js [--out <json>]
// Exit 0 only when all DIAG-GO legs pass; the JSON is written
// regardless, so a failed leg still leaves its numbers readable.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const SEEDS = [75101, 75102, 75103, 75104, 75105, 75106, 75107, 75108];
const OFF_DIR = path.join(REPO, 'evidence', '2026-10-29', 'perseed-hunthold-off');
const ON_DIR = path.join(REPO, 'evidence', '2026-10-29', 'perseed-hunthold-on');

function waveMap() {
  const m = {};
  try {
    const defs = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
    const list = Array.isArray(defs) ? defs : (defs.monsters || []);
    for (const d of list) if (d && d.id) m[d.id] = (d.wave | 0) || null;
  } catch (e) { /* surfaces as unknownWave below */ }
  return m;
}
const WAVES = waveMap();
function waveOf(mid) { return Object.prototype.hasOwnProperty.call(WAVES, mid) ? WAVES[mid] : null; }

// Dedupe identical danger records inside one evaluation.
function dedupeDanger(e) {
  const seen = new Set(), out = [];
  for (const v of (e.danger || [])) {
    const k = [v.vid, v.tx, v.ty, v.score, v.verdict].join('|');
    if (!seen.has(k)) { seen.add(k); out.push(v); }
  }
  return out;
}
function verdictsOf(e) { return dedupeDanger(e).map(v => v.verdict); }

// ---- departlag class, verbatim from scripts/test-departlag-a.js ----
function classifyDepartlag(pick, row) {
  const ch = (pick && pick.chosen) || {};
  const vid = pick.vid, mid = ch.huntMid, huntDay = ch.huntDay;
  const picks = (row.funnel && row.funnel.picks) || [];
  const deps = (row.returns && row.returns.departures) || [];
  const drops = (row.returns && row.returns.drops) || [];
  const deaths = row.deathsList || [];
  const nextPick = picks.filter(p => p.vid === vid && (p.part | 0) > (pick.part | 0))
    .sort((a, b) => (a.part | 0) - (b.part | 0))[0] || null;
  const depCands = deps.filter(d => d.vid === vid && d.objective && d.objective.kind === 'HUNT'
    && d.objective.huntMid === mid && d.objective.huntDay === huntDay && (d.part | 0) >= (pick.part | 0))
    .sort((a, b) => (a.part | 0) - (b.part | 0));
  const dep = depCands[0] || null;
  const depBeforeNext = dep && (!nextPick || (dep.part | 0) < (nextPick.part | 0));
  const death = deaths.filter(d => d.who === vid && (d.day | 0) >= (pick.day | 0))
    .sort((a, b) => (a.day | 0) - (b.day | 0))[0] || null;
  const base = { seed: row.seed, vid, mid, huntDay, pickDay: pick.day, pickPart: pick.part,
    ageAtPick: (pick.day | 0) - (huntDay | 0) };
  const subDeath = death ? ` later died d${death.day} cause=${death.cause}` : '';
  if (depBeforeNext) {
    if (death && (death.day | 0) <= (dep.day | 0)) {
      return Object.assign({}, base, { cls: 'UNKNOWN',
        sub: `departure d${dep.day} on/after death day d${death.day} (day-granular death, part order unresolvable)`,
        depDay: dep.day, depPart: dep.part });
    }
    const drop = drops.filter(d => d.vid === vid && d.mid === mid && (d.part | 0) >= (dep.part | 0) && d.dropped === true)
      .sort((a, b) => (a.part | 0) - (b.part | 0))[0] || null;
    return Object.assign({}, base, { cls: 'DEPARTED', depDay: dep.day, depPart: dep.part,
      lagDays: (dep.day | 0) - (pick.day | 0), lagParts: (dep.part | 0) - (pick.part | 0),
      ageAtDeparture: (dep.day | 0) - (huntDay | 0),
      staleAtDeparture: ((dep.day | 0) - (huntDay | 0)) > 3,
      dropped: !!drop, dropDay: drop ? drop.day : null, dropPart: drop ? drop.part : null,
      sub: `departed d${dep.day} part=${dep.part} lag=${(dep.day | 0) - (pick.day | 0)}d/${(dep.part | 0) - (pick.part | 0)}p age ${((dep.day | 0) - (huntDay | 0))} (pick age ${base.ageAtPick})${drop ? ` true drop d${drop.day}` : ' no true drop'}` });
  }
  if (nextPick && (!dep || (nextPick.part | 0) < (dep.part | 0))) {
    const nk = (nextPick.chosen && nextPick.chosen.kind) || '?';
    const subKind = nk === 'HUNT' && nextPick.chosen.huntMid === mid ? 'RE-PICK'
      : nk === 'HUNT' ? 'OTHER-HUNT'
      : (nk === 'EAT' || nk === 'WATER') ? 'NEEDS' : 'OTHER';
    return Object.assign({}, base, { cls: 'SUPERSEDED', subKind, nextKind: nk,
      nextDay: nextPick.day, nextPart: nextPick.part,
      lagDays: (nextPick.day | 0) - (pick.day | 0), lagParts: (nextPick.part | 0) - (pick.part | 0),
      sub: `superseded d${nextPick.day} by ${nk} (${subKind}) lag=${(nextPick.day | 0) - (pick.day | 0)}d/${(nextPick.part | 0) - (pick.part | 0)}p${subDeath}` });
  }
  if (death) {
    return Object.assign({}, base, { cls: 'DIED-HOLDING', deathDay: death.day, deathCause: death.cause,
      sameDayAmbiguous: (death.day | 0) === (pick.day | 0),
      sub: `died d${death.day} cause=${death.cause}${(death.day | 0) === (pick.day | 0) ? ' (SAME-DAY-AMBIGUOUS)' : ''}` });
  }
  return Object.assign({}, base, { cls: 'HELD-TO-HORIZON', holdDays: (row.days | 0) - (pick.day | 0),
    sub: `held to horizon (row days=${row.days}, hold=${(row.days | 0) - (pick.day | 0)}d, horizon-capped)` });
}

// ---- departhold class, verbatim priority from scripts/test-departhold-a.js ----
function evalsForObjective(evals, vid, mid, pickPart) {
  return (evals || []).filter(e => e.vid === vid && e.part >= pickPart
    && ((e.pre && e.pre.huntMid === mid) || (e.freshPickInCall && e.post && e.post.huntMid === mid)));
}
function classifyDeparthold(row, pick) {
  const vid = pick.vid;
  const mid = pick.chosen.huntMid;
  const picks = (row.funnel.picks || []).filter(p => p.vid === vid).sort((a, b) => a.part - b.part);
  const laterPicks = picks.filter(p => p.part > pick.part);
  const firstLater = laterPicks.length ? laterPicks[0] : null;
  const deps = (row.returns.departures || []).filter(d =>
    d.vid === vid && d.objective && d.objective.huntMid === mid && d.part >= pick.part);
  let linkedDep = null;
  for (const d of deps.sort((a, b) => a.part - b.part)) {
    const intervening = picks.some(p => p.part > pick.part && p.part < d.part);
    if (!intervening) { linkedDep = d; break; }
  }
  const evals = evalsForObjective((row.departhold || {}).evaluations || [], vid, mid, pick.part);
  if (linkedDep) {
    return { cls: 'departed-pick-linked', reason: `dep part=${linkedDep.part} day=${linkedDep.day}`, dep: linkedDep, evals, depPart: linkedDep.part, firstLaterPart: firstLater ? firstLater.part : null };
  }
  const deaths = (row.deathsList || []).filter(d => d.who === vid && d.day >= pick.day);
  if (deaths.length && !firstLater) {
    const sameDay = deaths[0].day === pick.day ? ' SAME-DAY' : '';
    return { cls: 'died-before-departure', reason: `death d${deaths[0].day} cause ${deaths[0].cause}, no later pick${sameDay}`, dep: null, evals, depPart: null, firstLaterPart: null };
  }
  const overwrite = evals.filter(e => e.action === 'overwritten'
    && (e.part === pick.part || !firstLater || e.part < firstLater.part))
    .sort((a, b) => a.part - b.part)[0];
  if (overwrite) {
    const dg = dedupeDanger(overwrite)[0] || null;
    return { cls: 'overwritten-danger',
      reason: `eval part=${overwrite.part} day=${overwrite.day} danger=${dg ? dg.verdict + '/' + dg.score : 'NONE'} sub=${overwrite.sub}`,
      dep: null, evals, overwrite, depPart: null, firstLaterPart: firstLater ? firstLater.part : null };
  }
  if (firstLater) {
    const ck = (firstLater.chosen || {}).kind;
    if (ck === 'EAT' || ck === 'WATER') {
      return { cls: 'superseded-by-needs-pick', reason: `first later pick part=${firstLater.part} day=${firstLater.day} chose ${ck}`, dep: null, evals, depPart: null, firstLaterPart: firstLater.part };
    }
    const cand = firstLater.candidate || null;
    const preHas = (firstLater.preSightings || []).some(s => s[0] === mid);
    const pickHas = (pick.preSightings || []).some(s => s[0] === mid);
    if ((!cand || cand.mid !== mid) && (preHas || pickHas)) {
      const mem = (firstLater.preSightings || []).find(s => s[0] === mid);
      const memDay = mem ? mem[3] : (pick.chosen.huntDay != null ? pick.chosen.huntDay : null);
      const age = memDay != null ? (firstLater.day - memDay) : null;
      let gate = 'unknown-gate';
      if (age != null && age > 3) gate = 'age';
      else if (firstLater.gates) {
        if (firstLater.gates.postFleeResting) gate = 'postFleeResting';
        else if (firstLater.gates.sheltered) gate = 'sheltered';
        else if (!firstLater.gates.armed) gate = 'unarmed';
        else if (firstLater.gates.maxD != null && mem && (Math.max(Math.abs(mem[1] - 4), Math.abs(mem[2] - 4)) > firstLater.gates.maxD)) gate = 'range';
      }
      return { cls: 'candidate-null-after-pick', reason: `first later pick part=${firstLater.part} day=${firstLater.day} chose ${ck} candidate null gate=${gate} age=${age}`, dep: null, evals, depPart: null, firstLaterPart: null };
    }
    return { cls: 'superseded-by-re-pick', reason: `first later pick part=${firstLater.part} day=${firstLater.day} chose ${ck} candidate=${cand ? cand.mid : 'null'}`, dep: null, evals, depPart: null, firstLaterPart: null };
  }
  const held = evals.filter(e => e.action === 'held-ready' || e.action === 'skipped-not-at-haven');
  if (held.length) {
    return { cls: 'held-ready-at-end', reason: `${held.length} held/skipped evaluation(s), last part=${held[held.length - 1].part} action=${held[held.length - 1].action}`, dep: null, evals, depPart: null, firstLaterPart: null };
  }
  const g = pick.gates || {};
  if (g.postFleeResting || g.sheltered || g.armed === false) {
    const flag = g.postFleeResting ? 'postFleeResting' : (g.sheltered ? 'sheltered' : 'unarmed');
    return { cls: 'gate-blocked', reason: `pick-time gate flag ${flag}`, dep: null, evals, depPart: null, firstLaterPart: null };
  }
  return { cls: 'horizon', reason: 'no later pick, no departure, no overwrite, no hold, gates green', dep: null, evals, depPart: null, firstLaterPart: null };
}

// Joined class for one funnel HUNT pick.
function joinPick(row, pick) {
  const lag = classifyDepartlag(pick, row);
  const dh = classifyDeparthold(row, pick);
  const picks = (row.funnel.picks || []).filter(p => p.vid === pick.vid).sort((a, b) => a.part - b.part);
  const firstLater = picks.filter(p => p.part > pick.part)[0] || null;
  const windowed = evalsForObjective((row.departhold || {}).evaluations || [], pick.vid, pick.chosen.huntMid, pick.part)
    .filter(e => !firstLater || e.part < firstLater.part);
  const neverChecked = windowed.length === 0;
  let joined;
  if (dh.cls === 'overwritten-danger') joined = 'OVERWRITTEN-BY-VERDICT';
  else joined = dh.cls;
  return { seed: row.seed, vid: pick.vid, mid: pick.chosen.huntMid, wave: waveOf(pick.chosen.huntMid),
    huntDay: pick.chosen.huntDay, pickDay: pick.day, pickPart: pick.part,
    lagCls: lag.cls, lagSubKind: lag.subKind || null, lagDays: lag.lagDays != null ? lag.lagDays : null,
    lagParts: lag.lagParts != null ? lag.lagParts : null,
    dhCls: dh.cls, joinedCls: joined, neverChecked,
    evalCount: windowed.length,
    reclassified: lag.cls === 'SUPERSEDED' && joined === 'OVERWRITTEN-BY-VERDICT',
    lagSub: lag.sub, dhReason: dh.reason };
}

// ---- evaluation chains (Universe 2) ----
function chainKey(e) {
  const mid = (e.pre && e.pre.huntMid) || (e.freshPickInCall && e.post && e.post.huntMid) || null;
  const huntDay = (e.pre && e.pre.huntDay != null) ? e.pre.huntDay
    : (e.post && e.post.huntDay != null ? e.post.huntDay : null);
  return mid ? { mid, huntDay } : null;
}
function buildChains(row) {
  // Group by (vid, mid, huntDay) — NOT by consecutive run in part
  // order. Evaluations interleave across villagers, so a
  // consecutive-run grouping fragments one pick's chain at every
  // other villager's evaluation and mislabels the fragments
  // (a held fragment followed by a later fragment of the same
  // pick reads as DIED-HOLDING). Groups split at terminal actions
  // only, per the prereg. Residual limit, noted in evidence:
  // a same-key re-pick after an UNRECORDED supersession (held,
  // replaced by a non-HUNT pick, re-picked same sighting) merges
  // into one chain; its terminal class is still the last
  // fragment's terminal.
  const evals = ((row.departhold || {}).evaluations || []).slice().sort((a, b) => a.part - b.part);
  const groups = new Map();
  let skippedNoMid = 0;
  for (const e of evals) {
    const k = chainKey(e);
    if (!k) { skippedNoMid++; continue; }
    const gk = e.vid + '|' + k.mid + '|' + k.huntDay;
    if (!groups.has(gk)) groups.set(gk, []);
    groups.get(gk).push(e);
  }
  const chains = [];
  for (const list of groups.values()) {
    let cur = null;
    for (const e of list) {
      if (!cur || cur.terminal) {
        const k = chainKey(e);
        cur = { seed: row.seed, vid: e.vid, mid: k.mid, wave: waveOf(k.mid), huntDay: k.huntDay,
          evals: [], terminal: null };
        chains.push(cur);
      }
      cur.evals.push(e);
      if (e.action === 'departed' || e.action === 'overwritten') cur.terminal = e.action;
    }
  }
  chains.sort((a, b) => a.evals[0].part - b.evals[0].part);
  chains.skippedNoMid = skippedNoMid;
  return chains;
}
function chainVerdicts(chain) {
  const v = new Set();
  for (const e of chain.evals) for (const d of dedupeDanger(e)) v.add(d.verdict);
  return v;
}
function chainHasHealSatOut(chain) {
  return chain.evals.some(e => (e.heal || []).some(h => h.ret === false && h.satOut === true)
    || e.sub === 'heal-sat-out');
}
function chainHasNonGoDanger(chain) {
  return Array.from(chainVerdicts(chain)).some(v => v !== 'go');
}
function chainHasOtherHeld(chain) {
  return chain.evals.some(e => e.action === 'held-ready' && e.sub === 'other-held');
}
function classifyChain(row, chain) {
  const last = chain.evals[chain.evals.length - 1];
  const deaths = (row.deathsList || []).filter(d => d.who === chain.vid);
  let terminal;
  if (last.action === 'departed') terminal = 'DEPARTED';
  else if (last.action === 'overwritten') terminal = 'OVERWRITTEN';
  else {
    const deathAfter = deaths.filter(d => (d.day | 0) > (last.day | 0)).sort((a, b) => a.day - b.day)[0] || null;
    const deathSameDay = deaths.filter(d => (d.day | 0) === (last.day | 0))[0] || null;
    if (deathAfter) terminal = 'DIED-HOLDING';
    else if (deathSameDay) terminal = 'DIED-HOLDING-SAME-DAY-AMBIGUOUS';
    else terminal = 'HELD-TO-HORIZON-OR-UNRECORDED';
  }
  return { seed: chain.seed, vid: chain.vid, mid: chain.mid, wave: chain.wave, huntDay: chain.huntDay,
    nEvals: chain.evals.length, firstPart: chain.evals[0].part, lastPart: last.part,
    firstDay: chain.evals[0].day, lastDay: last.day, terminal,
    verdicts: Array.from(chainVerdicts(chain)).sort(),
    hasNonGoDanger: chainHasNonGoDanger(chain), hasHealSatOut: chainHasHealSatOut(chain),
    hasOtherHeld: chainHasOtherHeld(chain),
    terminalOverwriteVerdict: terminal === 'OVERWRITTEN'
      ? ((dedupeDanger(last)[0] || {}).verdict || 'NONE') : null,
    terminalOverwriteVerdictless: terminal === 'OVERWRITTEN' && dedupeDanger(last).length === 0 };
}
function heldBucket(chainRow) {
  // Only for terminal-HELD chains (HELD-TO-HORIZON-OR-UNRECORDED).
  if (chainRow.hasNonGoDanger) return 'danger-held';
  if (chainRow.hasHealSatOut) return 'heal-held';
  return 'sick-early-held';
}

function loadRow(dir, seed) {
  return JSON.parse(fs.readFileSync(path.join(dir, `s${seed}-fresh.json`), 'utf8'));
}
function analyzeArm(dir) {
  const out = { picks: [], chains: [], evalLevel: null, huntholdStore: null };
  let evalActions = {}, verdictSetCounts = {}, overwriteWithoutVerdict = 0, nEvals = 0,
    dangerOutside = 0, skippedNoMid = 0;
  for (const seed of SEEDS) {
    const row = loadRow(dir, seed);
    const dh = row.departhold || {};
    nEvals += (dh.evaluations || []).length;
    dangerOutside += (dh.dangerOutside || []).length;
    for (const e of (dh.evaluations || [])) {
      evalActions[e.action] = (evalActions[e.action] || 0) + 1;
      const vs = verdictsOf(e).slice().sort().join(',') || '(none)';
      verdictSetCounts[e.action + '|' + vs] = (verdictSetCounts[e.action + '|' + vs] || 0) + 1;
      if (e.action === 'overwritten' && dedupeDanger(e).length === 0) overwriteWithoutVerdict++;
      if (!chainKey(e)) skippedNoMid++;
    }
    const picks = ((row.funnel || {}).picks || []).filter(p => (p.chosen || {}).kind === 'HUNT');
    for (const p of picks) out.picks.push(joinPick(row, p));
    const chains = buildChains(row);
    const classified = chains.map(c => classifyChain(row, c));
    // Later-chain flag: a later chain for the same vid exists after this chain's last part.
    for (let i = 0; i < classified.length; i++) {
      classified[i].laterChainSameVid = classified.some((c2, j) => j !== i
        && c2.vid === classified[i].vid && c2.firstPart > classified[i].lastPart);
      classified[i].heldBucket = classified[i].terminal === 'HELD-TO-HORIZON-OR-UNRECORDED'
        ? heldBucket(classified[i]) : null;
      classified[i].everDangerHeldThenDeparted = classified[i].terminal === 'DEPARTED' && classified[i].hasNonGoDanger;
      classified[i].everHealHeldThenDeparted = classified[i].terminal === 'DEPARTED' && classified[i].hasHealSatOut;
    }
    out.chains.push.apply(out.chains, classified);
    if (row.hunthold) {
      out.huntholdStore = out.huntholdStore || { holds: 0, exhausted: 0, narrated: 0 };
      out.huntholdStore.holds += row.hunthold.holds || 0;
      out.huntholdStore.exhausted += row.hunthold.exhausted || 0;
      out.huntholdStore.narrated += row.hunthold.narrated || 0;
    }
  }
  out.evalLevel = { nEvals, evalActions, verdictSetCounts, overwriteWithoutVerdict,
    dangerOutside, skippedNoMid };
  return out;
}
function summarizeArm(a) {
  const by = (arr, k) => { const o = {}; for (const x of arr) o[x[k]] = (o[x[k]] || 0) + 1; return o; };
  const chainByTerminal = by(a.chains, 'terminal');
  const chainByTerminalWave4 = by(a.chains.filter(c => c.wave === 4), 'terminal');
  const heldChains = a.chains.filter(c => c.terminal === 'HELD-TO-HORIZON-OR-UNRECORDED');
  const heldBuckets = by(heldChains, 'heldBucket');
  const neverChecked = a.picks.filter(p => p.neverChecked);
  return {
    nPicks: a.picks.length, picksByJoined: by(a.picks, 'joinedCls'),
    picksByLag: by(a.picks, 'lagCls'), reclassified: a.picks.filter(p => p.reclassified).length,
    neverCheckedPicks: neverChecked.length,
    neverCheckedByJoined: by(neverChecked, 'joinedCls'),
    nChains: a.chains.length, chainByTerminal, chainByTerminalWave4,
    heldBuckets, heldTotal: heldChains.length,
    heldPlusNeverChecked: heldChains.length + neverChecked.length,
    heldSplitReconciles: (heldBuckets['danger-held'] || 0) + (heldBuckets['heal-held'] || 0)
      + (heldBuckets['sick-early-held'] || 0) === heldChains.length,
    overwrittenChains: a.chains.filter(c => c.terminal === 'OVERWRITTEN').length,
    overwrittenChainsVerdictless: a.chains.filter(c => c.terminalOverwriteVerdictless).length,
    overwrittenChainsByVerdict: by(a.chains.filter(c => c.terminal === 'OVERWRITTEN'), 'terminalOverwriteVerdict'),
    departedChains: a.chains.filter(c => c.terminal === 'DEPARTED').length,
    departedEverDangerHeld: a.chains.filter(c => c.everDangerHeldThenDeparted).length,
    departedEverHealHeld: a.chains.filter(c => c.everHealHeldThenDeparted).length,
    diedHoldingChains: a.chains.filter(c => c.terminal === 'DIED-HOLDING' || c.terminal === 'DIED-HOLDING-SAME-DAY-AMBIGUOUS').length,
  };
}

function main() {
  const args = process.argv.slice(2);
  let outPath = path.join(REPO, 'evidence', '2026-10-29', 'holdsjoin-a-analysis.json');
  for (let i = 0; i < args.length; i++) if (args[i] === '--out') outPath = args[++i];
  const off = analyzeArm(OFF_DIR);
  const on = analyzeArm(ON_DIR);
  const sumOff = summarizeArm(off), sumOn = summarizeArm(on);
  // Murkcap pair check (OFF, seed 75106, visjoin_102).
  const murk = off.chains.filter(c => c.seed === 75106 && c.vid === 'visjoin_102' && c.mid === 'murkcap');
  const murkOk = murk.length === 2 && murk.every(c => c.terminal === 'OVERWRITTEN')
    && murk.map(c => c.terminalOverwriteVerdict).sort().join(',') === 'tighten,tighten';
  // Sense trace: ON seed 75101 jorge_silva murkcap chain (lever-held), OFF pair above.
  const jorge = on.chains.filter(c => c.seed === 75101 && c.vid === 'jorge_silva' && c.mid === 'murkcap');
  const jorgeRow = loadRow(ON_DIR, 75101);
  const jorgeEvals = ((jorgeRow.departhold || {}).evaluations || [])
    .filter(e => e.vid === 'jorge_silva' && (e.pre && e.pre.huntMid === 'murkcap'));
  const legs = {
    leg1_joinCompleteness: off.picks.every(p => p.joinedCls && p.joinedCls !== 'UNKNOWN')
      && on.picks.every(p => p.joinedCls && p.joinedCls !== 'UNKNOWN')
      && off.chains.every(c => !!c.terminal) && on.chains.every(c => !!c.terminal)
      && off.picks.every(p => p.lagCls !== 'UNKNOWN') && on.picks.every(p => p.lagCls !== 'UNKNOWN'),
    leg2_caveatClosed: murkOk,
    leg3_verdictChannelComplete: off.evalLevel.overwriteWithoutVerdict === 0
      && on.evalLevel.overwriteWithoutVerdict === 0
      && sumOff.overwrittenChainsVerdictless === 0 && sumOn.overwrittenChainsVerdictless === 0,
    leg4_distributionAnswered: !!(off.evalLevel && on.evalLevel && sumOff.nChains && sumOn.nChains),
    leg5_heldSplitReconciles: sumOff.heldSplitReconciles && sumOn.heldSplitReconciles,
  };
  legs.all = Object.values(legs).every(Boolean);
  const result = { seeds: SEEDS, off: { summary: sumOff, evalLevel: off.evalLevel, picks: off.picks, chains: off.chains,
      huntholdStore: off.huntholdStore },
    on: { summary: sumOn, evalLevel: on.evalLevel, picks: on.picks, chains: on.chains,
      huntholdStore: on.huntholdStore },
    murkcapPair: { chains: murk.map(c => ({ vid: c.vid, mid: c.mid, huntDay: c.huntDay, firstPart: c.firstPart,
      lastPart: c.lastPart, terminal: c.terminal, verdict: c.terminalOverwriteVerdict, verdicts: c.verdicts })),
      ok: murkOk },
    senseTrace: { jorgeOnChains: jorge.map(c => ({ terminal: c.terminal, nEvals: c.nEvals, firstPart: c.firstPart,
      lastPart: c.lastPart, verdicts: c.verdicts, hasOtherHeld: c.hasOtherHeld })),
      jorgeOnEvals: jorgeEvals.map(e => ({ day: e.day, part: e.part, action: e.action, sub: e.sub,
        danger: dedupeDanger(e), heal: e.heal, tighten: e.tighten, depart: e.depart,
        preState: e.pre && e.pre.state, postKind: e.post && e.post.kind, postState: e.post && e.post.state })) },
    legs };
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2) + '\n');
  console.log('OFF picks n=' + sumOff.nPicks + ' joined=' + JSON.stringify(sumOff.picksByJoined)
    + ' lag=' + JSON.stringify(sumOff.picksByLag) + ' reclassified=' + sumOff.reclassified
    + ' neverChecked=' + sumOff.neverCheckedPicks);
  console.log('ON  picks n=' + sumOn.nPicks + ' joined=' + JSON.stringify(sumOn.picksByJoined)
    + ' lag=' + JSON.stringify(sumOn.picksByLag) + ' reclassified=' + sumOn.reclassified
    + ' neverChecked=' + sumOn.neverCheckedPicks);
  console.log('OFF chains n=' + sumOff.nChains + ' terminal=' + JSON.stringify(sumOff.chainByTerminal)
    + ' wave4=' + JSON.stringify(sumOff.chainByTerminalWave4));
  console.log('ON  chains n=' + sumOn.nChains + ' terminal=' + JSON.stringify(sumOn.chainByTerminal)
    + ' wave4=' + JSON.stringify(sumOn.chainByTerminalWave4));
  console.log('OFF held buckets=' + JSON.stringify(sumOff.heldBuckets) + ' heldTotal=' + sumOff.heldTotal
    + ' departedEverDangerHeld=' + sumOff.departedEverDangerHeld + ' departedEverHealHeld=' + sumOff.departedEverHealHeld);
  console.log('ON  held buckets=' + JSON.stringify(sumOn.heldBuckets) + ' heldTotal=' + sumOn.heldTotal
    + ' departedEverDangerHeld=' + sumOn.departedEverDangerHeld + ' departedEverHealHeld=' + sumOn.departedEverHealHeld);
  console.log('OFF evals=' + off.evalLevel.nEvals + ' actions=' + JSON.stringify(off.evalLevel.evalActions)
    + ' overwriteWithoutVerdict=' + off.evalLevel.overwriteWithoutVerdict
    + ' overwrittenChains=' + sumOff.overwrittenChains + ' byVerdict=' + JSON.stringify(sumOff.overwrittenChainsByVerdict));
  console.log('ON  evals=' + on.evalLevel.nEvals + ' actions=' + JSON.stringify(on.evalLevel.evalActions)
    + ' overwriteWithoutVerdict=' + on.evalLevel.overwriteWithoutVerdict
    + ' overwrittenChains=' + sumOn.overwrittenChains + ' byVerdict=' + JSON.stringify(sumOn.overwrittenChainsByVerdict)
    + ' huntholdStore=' + JSON.stringify(on.huntholdStore));
  console.log('MURKCAP pair ok=' + murkOk + ' chains=' + JSON.stringify(result.murkcapPair.chains));
  console.log('LEGS ' + JSON.stringify(legs));
  console.log('WROTE ' + outPath);
  if (!legs.all) { console.error('DIAG-NO-GO: a leg failed'); process.exit(1); }
  console.log('DIAG-GO: all legs pass');
}
if (require.main === module) main();
module.exports = { classifyDepartlag, classifyDeparthold, joinPick, buildChains, classifyChain,
  heldBucket, dedupeDanger, verdictsOf, waveOf };
