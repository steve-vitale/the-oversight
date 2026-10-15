#!/usr/bin/env node
// scripts/succhain-lib-20261015.js — BEARER-DEATH CHAIN DIAGNOSTIC
// (sim-succhain, 2026-10-15, scale-onramp axis).
//
// INSTRUMENT-ONLY: every function here READS persisted run records and
// returns plain data. Nothing writes game state, consumes RNG, or calls
// Date.now(). Pure-classifier design — the proof test
// (scripts/test-succhain-20261015.js) pins every bucket.
//
// THE QUESTION: r4's holdloss census named succession-chain the modal NAMED
// national-hold loss (2/3); the landed succpolity arm (ee5d1803) fixed
// polity-persistence through succession but NOT the bearer-death cascade
// itself. This instrument chains every bearer <redacted> young nationals
// (first 60 hold-days): chain length, cause per death, inter-death gaps,
// polity state at each death (links, trust, tribute arrears), tribute-snap
// / rival-raid co-occurrence, pantry trajectory through the chain.
//
// Bearer deaths: registerDeath opts.player === true (the r17 deathattr
// instrument — ledger.js playerDeath passes player:true through corpses.js
// into the tele('death') record; the sweeps here capture it on the
// registerDeath wrapper, the gameplay-identical path the finding
// validated). Fallback: kind /player|scholar/i.
//
// Chain definition: a MAXIMAL run of bearer deaths where each consecutive
// death is <= CHAIN_GAP_DAYS (7) after the previous. The window is
// arbitrary — 7d = one siege episode; the s22 holdloss chain (Elif d141,
// Zoe d148, gap exactly 7) sits AT the boundary and must chain. Proof pins
// the boundary (gap 7 chains, gap 8 splits).
//
// Attribution: a chain counts as attributed iff it carries all three —
// (1) chain length, (2) cause sequence (every death named: family via
// holdloss-lib's classifyDeathFamily, unnameable causes named raw with the
// trail kept — the holdloss honest-remainder convention), (3) polity
// impact named (polity state at each death AND start->end delta AND
// rank/snap/raid co-occurrence). A chain the instrument cannot read polity
// state for counts AGAINST the 90% bar.
'use strict';

const HL = require('./holdloss-lib-20261015');

const CHAIN_GAP_DAYS = 7;      // chain-continuation window
const YOUNG_WINDOW_DAYS = 60;  // "young nationals" = first 60 hold-days
const COOCCUR_DAYS = 3;        // snap/raid co-occurrence window

const NATL = { national: true, global: true };
const BEARER_KIND = /player|scholar/i;

const SNAP_RE = /the neglected link snaps|realm came apart/i;
const RAID_RE = /shouts from the treeline|unanswered raid|held the treeline|outnumbered/i;
const TRIBSHORT_RE = /tribute short|missing tribute|arrears/i;
const SUCC_RE = /dead hold no treaties|succession/i;

function num(x, d) { const n = Number(x); return Number.isFinite(n) ? n : (d == null ? 0 : d); }

// isBearerDeath(d): the r17 deathattr player-flag first, kind fallback.
function isBearerDeath(d) {
  if (!d) return false;
  if (d.player === true) return true;
  return BEARER_KIND.test(String(d.kind || ''));
}

// bearerDeaths(rec): every bearer <redacted> ascending day order.
function bearerDeaths(rec) {
  const out = ((rec || {}).deaths || []).filter(isBearerDeath)
    .map(d => {
      const f = HL.classifyDeathFamily(d.cause);
      return {
        day: num(d.day, 0), name: String(d.name || '?'),
        cause: String(d.cause || '?'), family: f.family || 'other-named',
        rawCause: f.raw,
      };
    });
  out.sort((a, b) => a.day - b.day);
  return out;
}

// youngNationalWindow(scaleRows): firstDay..firstDay+60 of the hold, or
// null when national was never reached. Global counts as national (the
// holdloss NATL convention — the hold is one thing).
function youngNationalWindow(scaleRows) {
  const natRows = (scaleRows || []).filter(r => NATL[r.rank]);
  if (!natRows.length) return null;
  const firstDay = Math.min.apply(null, natRows.map(r => r.day));
  return { firstDay, lastDay: firstDay + YOUNG_WINDOW_DAYS };
}

// nearestRow(rows, day): the last row with row.day <= day (instrument reads
// what the village knew on that day — never forward-looking).
function nearestRow(rows, day) {
  let best = null;
  for (const r of (rows || [])) {
    if (num(r.day, 0) <= day && (!best || r.day > best.day)) best = r;
  }
  return best;
}

// polityStateAt(rec, day): links/trust/arrears/rank from the nearest
// scaleRow <= day. Returns null when no row exists (attribution penalty).
function polityStateAt(rec, day) {
  const row = nearestRow((rec || {}).scaleRows, day);
  if (!row) return null;
  const links = (row.links || []).map(l => ({
    vid: l.vid, kind: l.kind, trust: num(l.trust, 0),
    arrears: num(l.arrears, 0), perWeek: num(l.perWeek, 0), age: num(l.age, 0),
  }));
  return {
    day: row.day, rank: String(row.rank || '?'), exiled: !!row.exiled,
    nLinks: links.length, links,
    totalArrears: links.reduce((t, l) => t + l.arrears, 0),
    minTrust: links.length ? Math.min.apply(null, links.map(l => l.trust)) : null,
  };
}

// pantryAt(rec, day): the nearest foodRow <= day.
function pantryAt(rec, day) {
  const row = nearestRow((rec || {}).foodRows, day);
  if (!row) return null;
  return { day: row.day, pop: num(row.pop, 0), pantryDays: num(row.pantryDays, 0), pantryKcal: num(row.pantryKcal, 0), ateShare: row.ateShare == null ? null : num(row.ateShare, 0) };
}

// coOccur(rec, day): snap/raid/tribute-short/succession beats within
// +/- COOCCUR_DAYS of a death day. Returns named buckets with day+text.
function coOccur(rec, day) {
  const out = { snaps: [], raids: [], tributeShorts: [], successions: [] };
  for (const b of ((rec || {}).beats || [])) {
    const bd = num(b.day, 0);
    if (Math.abs(bd - day) > COOCCUR_DAYS) continue;
    const t = String(b.text || '');
    if (SNAP_RE.test(t)) out.snaps.push({ day: bd, text: t.slice(0, 160) });
    if (RAID_RE.test(t)) out.raids.push({ day: bd, text: t.slice(0, 160) });
    if (TRIBSHORT_RE.test(t)) out.tributeShorts.push({ day: bd, text: t.slice(0, 160) });
    if (SUCC_RE.test(t)) out.successions.push({ day: bd, text: t.slice(0, 160) });
  }
  return out;
}

// buildChains(rec, gapDays): every bearer death chained by the gap rule,
// restricted to the young-national window. Returns {window, chains,
// outsideWindow} — the denominator is chains in the window; pre-national
// and post-window bearer deaths are reported as context only.
function buildChains(rec, gapDays) {
  const gap = gapDays == null ? CHAIN_GAP_DAYS : gapDays;
  const window = youngNationalWindow((rec || {}).scaleRows);
  const deaths = bearerDeaths(rec);
  const out = { window, chains: [], outsideWindow: [] };
  if (!window) { out.outsideWindow = deaths; return out; }
  const inside = deaths.filter(d => d.day >= window.firstDay && d.day <= window.lastDay);
  out.outsideWindow = deaths.filter(d => !(d.day >= window.firstDay && d.day <= window.lastDay));
  // maximal runs with consecutive gaps <= window
  let cur = [];
  const flush = () => { if (cur.length) out.chains.push(enrichChain(rec, cur)); cur = []; };
  for (const d of inside) {
    if (cur.length && d.day - cur[cur.length - 1].day > gap) flush();
    cur.push(d);
  }
  flush();
  return out;
}

// enrichChain(rec, seq): the full attribution packet for one chain.
function enrichChain(rec, seq) {
  const deaths = seq.map((d, i) => {
    const gap = i === 0 ? null : d.day - seq[i - 1].day;
    return {
      day: d.day, name: d.name, cause: d.cause, family: d.family,
      gapFromPrev: gap,
      polity: polityStateAt(rec, d.day),
      pantry: pantryAt(rec, d.day),
      cooccur: coOccur(rec, d.day),
    };
  });
  const start = deaths[0], end = deaths[deaths.length - 1];
  // polity impact: start->end delta + rank 7d after the last death.
  let impact = { attributed: true, evidence: [] };
  const sp = start.polity, ep = end.polity;
  if (!sp || !ep) {
    impact.attributed = false;
    impact.evidence.push('polity state unreadable for a chain death (no scaleRow <= death day) — attribution FAILS honestly');
  } else {
    impact.start = { day: sp.day, rank: sp.rank, nLinks: sp.nLinks, totalArrears: sp.totalArrears, minTrust: sp.minTrust };
    impact.end = { day: ep.day, rank: ep.rank, nLinks: ep.nLinks, totalArrears: ep.totalArrears, minTrust: ep.minTrust };
    const after = nearestRow((rec || {}).scaleRows, end.day + 7);
    impact.rank7dAfter = after ? String(after.rank || '?') : '?';
    impact.rankFell7d = !!(sp.rank && NATL[sp.rank] && after && !NATL[after.rank]);
    const snaps = deaths.reduce((n, d) => n + d.cooccur.snaps.length, 0);
    const raids = deaths.reduce((n, d) => n + d.cooccur.raids.length, 0);
    const trib = deaths.reduce((n, d) => n + d.cooccur.tributeShorts.length, 0);
    impact.snapsInChain = snaps; impact.raidsInChain = raids; impact.tributeShortsInChain = trib;
    impact.evidence.push(
      `chain d${start.day}->d${end.day} (${deaths.length} bearers): polity ${sp.rank} ${sp.nLinks} links arrears ${sp.totalArrears}kcal -> ${ep.rank} ${ep.nLinks} links arrears ${ep.totalArrears}kcal; rank 7d after: ${impact.rank7dAfter}${impact.rankFell7d ? ' (RANK FELL)' : ''}`,
      `co-occurrence through the chain: ${snaps} tribute-snap beats, ${raids} rival-raid beats, ${trib} tribute-short beats (±${COOCCUR_DAYS}d per death)`,
    );
    const startPan = start.pantry, endPan = end.pantry;
    if (startPan && endPan) {
      impact.evidence.push(`pantry through the chain: ${startPan.pantryDays.toFixed(1)}d (${startPan.pantryKcal | 0}kcal, pop ${startPan.pop}) -> ${endPan.pantryDays.toFixed(1)}d (${endPan.pantryKcal | 0}kcal, pop ${endPan.pop})`);
    }
  }
  // cause sequence — every death named (family, or raw cause when the
  // family is unnameable; the holdloss honest-remainder convention).
  impact.causeSeq = deaths.map(d => `d${d.day} ${d.name} (${d.cause} [${d.family}])`).join(' ; ');
  return {
    length: deaths.length, firstDay: start.day, lastDay: end.day,
    gaps: deaths.slice(1).map(d => d.gapFromPrev),
    deaths, impact,
  };
}

// attributeChains(rec): the full young-national bearer-death census for one
// run. Returns the attribution packet the 90% bar is computed over.
function attributeChains(rec) {
  const built = buildChains(rec);
  const chains = built.chains;
  const attributed = chains.filter(c => c.impact.attributed);
  return {
    window: built.window,
    nChains: chains.length,
    nAttributed: attributed.length,
    attribRate: chains.length ? attributed.length / chains.length : null,
    chains,
    outsideWindow: built.outsideWindow,
  };
}

// chainNarrative(rec, chain): the chain in plain words — a first-class
// deliverable under the SENSE-TESTING LAW (read, not counted).
function chainNarrative(rec, chain) {
  const lines = [];
  lines.push(`bearer-death chain: ${chain.length} bearers, d${chain.firstDay}->d${chain.lastDay} (gaps ${chain.gaps.length ? chain.gaps.join('d,') + 'd' : 'n/a'}).`);
  for (const d of chain.deaths) {
    const p = d.polity, pan = d.pantry;
    lines.push(`  d${d.day} ${d.name} dies (${d.cause} [${d.family}])` +
      (d.gapFromPrev != null ? ` — ${d.gapFromPrev}d after the previous bearer` : ' — the first bearer of this chain') + '.');
    if (p) {
      const linkStr = p.links.length
        ? p.links.map(l => `${l.vid}(${l.kind},trust ${l.trust},arrears ${l.arrears})`).join(' | ') : 'no links';
      lines.push(`    polity then: ${p.rank}, ${p.nLinks} link(s) — ${linkStr}; total arrears ${p.totalArrears}kcal.`);
    } else {
      lines.push('    polity then: UNREADABLE (no scale row).');
    }
    if (pan) lines.push(`    pantry then: ${pan.pantryDays.toFixed(1)}d (${pan.pantryKcal | 0}kcal), pop ${pan.pop}.`);
    for (const b of d.cooccur.snaps) lines.push(`    [snap] d${b.day} ${b.text}`);
    for (const b of d.cooccur.raids) lines.push(`    [raid] d${b.day} ${b.text}`);
    for (const b of d.cooccur.tributeShorts) lines.push(`    [tribute] d${b.day} ${b.text}`);
    for (const b of d.cooccur.successions.slice(0, 2)) lines.push(`    [succ] d${b.day} ${b.text.slice(0, 110)}`);
  }
  const im = chain.impact;
  if (im.start && im.end) {
    lines.push(`  impact: polity ${im.start.rank} ${im.start.nLinks} links (arrears ${im.start.totalArrears}kcal) -> ${im.end.rank} ${im.end.nLinks} links (arrears ${im.end.totalArrears}kcal); rank 7d after last death: ${im.rank7dAfter}${im.rankFell7d ? ' — THE RANK FELL' : ''}.`);
  }
  lines.push(`  cause sequence: ${im.causeSeq}.`);
  return lines.join('\n');
}

module.exports = {
  CHAIN_GAP_DAYS, YOUNG_WINDOW_DAYS, COOCCUR_DAYS,
  isBearerDeath, bearerDeaths, youngNationalWindow, nearestRow,
  polityStateAt, pantryAt, coOccur, buildChains, enrichChain,
  attributeChains, chainNarrative,
};
