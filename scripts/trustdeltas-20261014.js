#!/usr/bin/env node
// scripts/trustdeltas-20261014.js — TRUST-DELTAS-BY-SOURCE instrument
// (longsim scale-onramp r32, sim-trustdeltas diagnostic arm, 2026-10-14).
//
// Answers sim-findings #182: the mealonly pilot removed the -2/take sting's
// fuel line entirely (voluntary takes = 0 armed) yet the trust<30
// scholar-day share did not move — which NON-PENALTY sources hold trust
// below 30 on the belongseek/leadcourt road?
//
// ZERO game-code changes. Reuses the r31 census (trustgain-20261014.js) for
// write capture — the delta layer on top:
//   1. succession-set decomposition: each set:succession-inherit SET is
//      split into office-40% / own-40% / vouch / floor-10, reconstructed
//      from the writes log around the succession (read-only).
//   2. tenure decomposition: per-scholar-tenure start/end trust, strict
//      per-day deltas by source, crossed-30 flags, below-30 day
//      attribution (born-below vs drained-below vs mixed).
//   3. sting ablation: in-silico replay of each tenure's delta stream with
//      drain:pantry-take-sting writes removed (clamp-faithful), reporting
//      days>=30 gained — the counterfactual the mealonly pilot measured
//      for real. Agreement between the two is the cross-check.
//   4. periodic-drain hunt: any source draining the sitting scholar at a
//      regular cadence (the "trust decay" hypothesis named in #182).
//   5. progressive-at-threshold: scholar-gain applied/base by trust band,
//      testing whether the curve binds exactly at the 30 line.
//
// SUCCESSION-AWARE per the r30 lesson: no per-vid ledger reads anywhere —
// every write is an event, and the scholar lineage joins by (day, vid)
// with the strict per-day map.
'use strict';
const tg = require('./trustgain-20261014');
const { classifyWrite, CHANNELS } = tg;

// Extended channel map for drain-side callers the r31 census never saw
// fire (or saw only as other:). Zero game-code changes — classification
// only. Unknown callers still surface as other:<caller> (completeness).
const DELTA_CHANNELS = Object.assign({}, CHANNELS, {
  groundingReactionBeats: 'drain:relay-fray-junk', // table.js — bumpTrust(null,-2): writes to a junk "null" key, never read
  crowdingTick: 'drain:overcrowding',               // membership.js — -1/person, skips the scholar's own vid
  confront: 'drain:confrontation',                  // game.js justice confrontations (-10)
  theftConfrontation: 'drain:theft-confrontation',  // game.js Route A (dormant on current base)
  exileMoot: 'drain:exile-moot',                    // justice.js — exile path trust hits
  breakBond: 'drain:party-break',                   // party.js — removed from party (-8)
  disbandParty: 'drain:party-disband',              // party.js — party disbandment hits
  duelYield: 'drain:duel-yield',                    // party.js — duel fallout (-10/-20)
  cannibalExpose: 'drain:cannibal-expose',          // corruption.js — exposed cannibal (-25)
  interrogate: 'drain:interrogate',                 // truth.js — interrogation fallout
  graveRob: 'drain:grave-rob',                      // abilityActions.js — posturing resentment (-5)
  lashOut: 'drain:lashout',                         // game.js — gristlefit friendly fire (-10 on scholar's own entry)
});

function classifyDelta(w) {
  // Sign-split for mixed channels: the taxonomy names the direction.
  const base = DELTA_CHANNELS[w.caller] || classifyWrite(w);
  if (base === 'other:delete') return base;
  const dir = w.delta > 0 ? '+' : '-';
  // Pure channels keep their r31 name (comparability); mixed channels
  // (rep-drift, fireside-conflict, teaching-callout, theorize-talk)
  // get a direction suffix so the drain table reads cleanly.
  const MIXED = new Set(['gain:rep-drift', 'gain:fireside-conflict', 'gain:teaching-callout',
    'gain:theorize-talk', 'gain:convo-respond', 'gain:promise-made', 'gain:appeal-goal',
    'gain:confrontation-gossip', 'gain:confrontation-mediate']);
  if (MIXED.has(base)) return base + dir;
  if (base.indexOf('other:') === 0 || base.indexOf('drain:') === 0 ||
      base.indexOf('gain:') === 0 || base.indexOf('set:') === 0 || base.indexOf('link:') === 0) {
    // direction sanity: a 'gain:' channel carrying a negative write is
    // re-homed to drain so the drain table is complete by construction.
    if (w.delta < 0 && base.indexOf('gain:') === 0) return 'drain:' + base.slice(5);
    if (w.delta > 0 && base.indexOf('drain:') === 0) return 'gain:' + base.slice(6);
    return base;
  }
  return base;
}

// --- succession-set decomposition -------------------------------------
// For each succession (vid change between consecutive sampled days), find
// the set:succession-inherit write on the new vid that day and split the
// SET into its three priced components (ledger.js: inherit =
// max(10, min(100, round(office*0.4 + own*0.4 + vouchBonus)))):
//   office = dead bearer's last trust entry (missing -> 20 default)
//   own    = successor's trust entry just before the SET (missing -> 0)
//   vouch  = implied elders' vouching (multiple of 4, capped 16), only
//            identifiable when neither clamp binds.
// Returns [{day, oldId, newId, neu, office, own, vouch, clamped, check}]
function decomposeSuccessions(census) {
  const out = [];
  const samples = census.daySamples || [];
  const writes = census.writes || [];
  // index: last write per (vid) before a given sequence position
  for (let i = 1; i < samples.length; i++) {
    const prev = samples[i - 1], cur = samples[i];
    if (!prev || !cur || prev.vid === cur.vid) continue;
    const oldId = String(prev.vid), newId = String(cur.vid), day = cur.day;
    // The SET write lands on the succession day or the day before
    // (playerDeath fires after that day's sampleDay). The death flow emits
    // several small playerDeath-caller writes; the SET is the one with the
    // largest |delta| on the new scholar's entry.
    const cands = writes.filter(w => String(w.vid) === newId && (w.day === day || w.day === day - 1) &&
      classifyDelta(w).indexOf('set:succession-inherit') === 0);
    cands.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
    const setW = cands[0];
    if (!setW) { out.push({ day, oldId, newId, neu: null, note: 'no-set-write-found' }); continue; }
    const own = (typeof setW.old === 'number') ? setW.old : 0;
    // office: the dead bearer's entry as the SET saw it — the last write on
    // oldId strictly BEFORE the SET write in stream order (not just
    // day-bounded; the death flow can write oldId on the same day).
    const setIdx = writes.indexOf(setW);
    let office = 20; // engine default for a missing entry
    for (let j = setIdx - 1; j >= 0; j--) {
      const w = writes[j];
      if (String(w.vid) === oldId) { office = w.neu; break; }
    }
    // fall back to the sampled trajectory if no write exists
    if (office === 20) {
      const ps = samples.filter(s => String(s.vid) === oldId && s.scholarTrust != null);
      if (ps.length) office = ps[ps.length - 1].scholarTrust;
    }
    const raw = 0.4 * office + 0.4 * own;
    const rounded = Math.round(raw);
    const clamped = setW.neu >= 100 || setW.neu <= 10;
    // vouchBonus = what the engine added beyond round(0.4*office+0.4*own),
    // recoverable only when no clamp binds and the pre-round value is
    // consistent (engine: round(raw + vouchBonus)).
    let vouch = null, check = null;
    if (!clamped) {
      vouch = Math.round(setW.neu - raw);
      check = (vouch % 4 === 0 && vouch >= 0 && vouch <= 16) ? 'ok' : 'UNEXPECTED';
    }
    out.push({ day, oldId, newId, neu: setW.neu, office, own, raw: +raw.toFixed(1), vouch, clamped, check });
  }
  return out;
}

// --- tenure decomposition ---------------------------------------------
// Tenures: maximal consecutive sampled days with the same vid. Each tenure
// gets its strict delta stream, start/end trust, crossed-30 flags, and a
// below-30 attribution class:
//   born-below  — start < 30 and tenure never reaches 30 (structural:
//                  inheritance landing + gainlessness, not drains)
//   drained-below — start >= 30 but the tenure drops below 30 (drains did it)
//   mixed — crosses 30 both ways
//   held-above — never below 30
function buildTenures(census, successions) {
  const samples = census.daySamples || [];
  const writes = census.writes || [];
  const tenures = [];
  let cur = null;
  for (const s of samples) {
    if (!cur || cur.vid !== String(s.vid)) {
      if (cur) tenures.push(cur);
      cur = { vid: String(s.vid), days: [], startTrust: s.scholarTrust, endTrust: s.scholarTrust };
    }
    cur.days.push(s);
    cur.endTrust = s.scholarTrust;
  }
  if (cur) tenures.push(cur);
  const setByDay = {};
  for (const su of successions) if (su.neu != null) setByDay[su.day + ':' + su.newId] = su;
  tenures.forEach((t, ti) => {
    const day0 = t.days[0].day, dayN = t.days[t.days.length - 1].day;
    const strict = writes.filter(w => String(w.vid) === t.vid && w.day >= day0 && w.day <= dayN);
    t.writes = strict.map(w => Object.assign({}, w, { channel: classifyDelta(w) }));
    t.startTrust = t.days[0].scholarTrust;
    t.endTrust = t.days[t.days.length - 1].scholarTrust;
    t.maxTrust = Math.max.apply(null, t.days.map(s => s.scholarTrust == null ? -1 : s.scholarTrust));
    t.minTrust = Math.min.apply(null, t.days.map(s => s.scholarTrust == null ? 999 : s.scholarTrust));
    t.daysBelow30 = t.days.filter(s => s.scholarTrust != null && s.scholarTrust < 30).length;
    t.daysAtOrAbove30 = t.days.filter(s => s.scholarTrust != null && s.scholarTrust >= 30).length;
    const set = setByDay[day0 + ':' + t.vid];
    t.inherit = set || null;
    t.firstTenure = (ti === 0);
    const st = (t.startTrust == null ? 15 : t.startTrust);
    if (t.maxTrust < 30) t.belowClass = (st < 30) ? 'born-below' : 'drained-below';
    else if (t.minTrust >= 30) t.belowClass = 'held-above';
    else t.belowClass = (st < 30) ? 'born-below-mixed' : 'drained-below-mixed';
    // drain/gain/set totals, strict
    t.drainByChannel = {}; t.gainByChannel = {}; t.setTotal = 0;
    for (const w of t.writes) {
      if (w.channel.indexOf('set:') === 0) { t.setTotal += w.delta; continue; }
      if (w.delta < 0) t.drainByChannel[w.channel] = (t.drainByChannel[w.channel] || 0) + w.delta;
      else t.gainByChannel[w.channel] = (t.gainByChannel[w.channel] || 0) + w.delta;
    }
    t.drainTotal = Object.values(t.drainByChannel).reduce((a, b) => a + b, 0);
    t.gainTotal = Object.values(t.gainByChannel).reduce((a, b) => a + b, 0);
  });
  return tenures;
}

// --- sting ablation ----------------------------------------------------
// Replay a tenure's strict delta stream WITHOUT drain:pantry-take-sting
// writes, clamp-faithful (engine: Math.max(0, Math.min(100, cur+adj))).
// Returns {actualDaysAbove, ablatedDaysAbove, gained} — days>=30 gained by
// removing the sting with no behavioral change. This is the in-silico twin
// of the mealonly pilot; agreement between the two is the cross-check.
function ablateSting(tenure) {
  const byDay = {};
  for (const w of tenure.writes) (byDay[w.day] || (byDay[w.day] = [])).push(w);
  // set: writes (succession inheritance) are INITIALIZATION, not flow:
  // startTrust already reflects the post-SET value, so replaying the SET
  // would double-count it (and net-negative SETs deflated the ablated
  // stream below reality — measured -458 phantom days on the first pass).
  // Both streams skip set: channels; only flows replay.
  const isFlow = w => w.channel.indexOf('set:') !== 0;
  let abl = tenure.startTrust == null ? 15 : tenure.startTrust;
  let chk = abl; // full replay incl. sting — must match the sampled trajectory
  let actualAbove = 0, ablatedAbove = 0;
  for (const d of tenure.days) {
    for (const w of (byDay[d.day] || [])) {
      if (!isFlow(w)) continue;
      chk = Math.max(0, Math.min(100, chk + w.delta));
      if (w.channel !== 'drain:pantry-take-sting') abl = Math.max(0, Math.min(100, abl + w.delta));
    }
    if (d.scholarTrust != null) {
      if (d.scholarTrust >= 30) actualAbove++; // ground truth: the sampled line
      if (abl >= 30) ablatedAbove++;
    }
  }
  const endT = tenure.endTrust == null ? 15 : tenure.endTrust;
  return { actualDaysAbove: actualAbove, ablatedDaysAbove: ablatedAbove, gained: ablatedAbove - actualAbove,
    startTrust: tenure.startTrust, stingRemoved: tenure.drainByChannel['drain:pantry-take-sting'] || 0,
    replayError: +Math.abs(chk - endT).toFixed(2) };
}

// --- periodic-drain hunt (#182's "trust decay" hypothesis) --------------
// For the sitting scholar: group negative writes by channel; flag any
// source firing at a regular cadence (median gap <= 2 days, >= 5 fires).
function huntPeriodicDrains(census, scholarDayMap) {
  const per = {};
  for (const w of census.writes || []) {
    if (w.delta >= 0) continue;
    if (scholarDayMap.get(w.day) !== String(w.vid)) continue;
    const ch = classifyDelta(w);
    const e = per[ch] || (per[ch] = { channel: ch, days: [], total: 0 });
    e.days.push(w.day); e.total += w.delta;
  }
  const out = [];
  for (const ch of Object.keys(per)) {
    const e = per[ch];
    e.days.sort((a, b) => a - b);
    const gaps = [];
    for (let i = 1; i < e.days.length; i++) gaps.push(e.days[i] - e.days[i - 1]);
    gaps.sort((a, b) => a - b);
    const med = gaps.length ? gaps[Math.floor(gaps.length / 2)] : null;
    out.push({ channel: ch, fires: e.days.length, total: +e.total.toFixed(1),
      medianGapDays: med, regular: (med != null && med <= 2 && e.days.length >= 5) });
  }
  return out.sort((a, b) => a.total - b.total);
}

// --- full delta taxonomy ------------------------------------------------
// Every source named, positive and negative shares, per 100 village-days,
// village-wide AND strict sitting-scholar scope.
function rankDeltas(census, scholarDayMap, villageDays) {
  const by = {};
  const vd = villageDays > 0 ? villageDays : 1;
  for (const w of census.writes || []) {
    const ch = classifyDelta(w);
    const strict = scholarDayMap.get(w.day) === String(w.vid);
    const e = by[ch] || (by[ch] = { channel: ch, fires: 0, pos: 0, neg: 0,
      sPos: 0, sNeg: 0, sFires: 0, combos: 0 });
    e.fires++;
    if (w.delta > 0) { e.pos += w.delta; if (strict) { e.sPos += w.delta; e.sFires++; } }
    else { e.neg += w.delta; if (strict) { e.sNeg += w.delta; e.sFires++; } }
  }
  const rows = Object.values(by).map(e => Object.assign(e, {
    per100vd_pos: +(e.pos / vd * 100).toFixed(2),
    per100vd_neg: +(e.neg / vd * 100).toFixed(2),
    per100vd_sPos: +(e.sPos / vd * 100).toFixed(2),
    per100vd_sNeg: +(e.sNeg / vd * 100).toFixed(2),
  })).sort((a, b) => (b.pos - a.pos) || (a.neg - b.neg));
  return rows;
}

// --- progressive efficiency at the trust-30 threshold -------------------
// Join progressive rows to the scholar's trust band that day (strict).
function progressiveAtThreshold(census, scholarDayMap) {
  const bands = { '<30': { calls: 0, base: 0, scaled: 0 }, '30-49': { calls: 0, base: 0, scaled: 0 }, '50+': { calls: 0, base: 0, scaled: 0 } };
  const trustByDay = {};
  for (const s of census.daySamples || []) trustByDay[s.day] = s.scholarTrust;
  for (const p of census.progressive || []) {
    if (scholarDayMap.get(p.day) !== String(p.vid)) continue;
    const t = trustByDay[p.day];
    if (t == null) continue;
    const band = t < 30 ? '<30' : (t < 50 ? '30-49' : '50+');
    const e = bands[band];
    e.calls++; e.base += p.base; e.scaled += p.scaled;
  }
  for (const k of Object.keys(bands)) {
    const e = bands[k];
    e.eff = e.base > 0 ? +(e.scaled / e.base).toFixed(2) : null;
  }
  return bands;
}

module.exports = { installTrustCensus: tg.installTrustCensus, classifyDelta, DELTA_CHANNELS,
  decomposeSuccessions, buildTenures, ablateSting, huntPeriodicDrains,
  rankDeltas, progressiveAtThreshold };
