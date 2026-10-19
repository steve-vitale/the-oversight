#!/usr/bin/env node
// analyze-recourt-20261019.js — re-court death-mode attribution (flesh-out
// loop arm sim-recourt, run fleshout-20261019T2115Z).
//
// Reads evidence/2026-10-19/perseed-recourt/belongfeast/s{64201,64202,64207}.json
// and names, per re-court bond, the death mode + day-exact mechanism:
//   - bond's own death: neglect snap (break note 'Link broken (succession).'
//     at day D), walk ('(walked).'), or still active when the village died.
//   - village's death: 'scattering' (famine: v.scattered, hungryDays hit the
//     famine limit), 'extinction' (v.extinct, zero living), 'no-successor'
//     (scholar dead, no candidates — the ledger "No one is left to pick up
//     the Codex." line), or 'survived'/'over-other'.
//   - mechanism tail: pantry trajectory, tribute/arrears pressure, deaths by
//     channel in the final 15 days, succession churn.
//
// The re-court bond is the link in linkDump whose fday is maximal among
// re-formed upward links (the bond formed after the v3 d55-57 walk or the
// neglect snap). Day-exact: the analyzer fails closed — a re-court with no
// named mechanism is 'unexplained'.
'use strict';
const fs = require('fs');
const path = require('path');

const EVID = path.join(__dirname, '..', 'evidence', '2026-10-19', 'perseed-recourt');
const STALL = [64201, 64202, 64207];

// nameReset: breakLink's history note -> the reset cause (same classifier
// as seasonblock's analyzer, re-declared so this analyzer is self-contained
// and fixture-testable).
function nameReset(note) {
  const n = String(note || '');
  if (n.includes('(walked)')) return 'walk';
  if (n.includes('(succession)')) return 'neglect-snap';
  return 'other (' + n.slice(0, 80) + ')';
}

// bondDeath: the re-court bond's own death — {mode, day, age} or
// {mode:'active-at-village-death', ...}.
function bondDeath(run) {
  const links = (run.linkDump || []).filter(l => l && l.sub === 'haven' && l.prim !== 'haven');
  if (!links.length) return { mode: 'no-upward-bond', day: null };
  // The re-court: the upward link with the LATEST fday (after the first).
  const recourt = links.reduce((a, b) => ((b.fday | 0) > (a.fday | 0) ? b : a));
  const endDay = run.gameDays;
  const fday = recourt.fday | 0;
  if (recourt.st === 'active') {
    return { mode: 'active-at-village-death', prim: recourt.prim, fday, day: endDay, age: endDay - fday, endTrust: recourt.endTrust };
  }
  // Broken: find the day-exact break note in history.
  const hist = (recourt.history || []).filter(h => String(h.kind || '').toLowerCase().includes('broken') || String(h.note || '').includes('Link broken'));
  const brk = hist[hist.length - 1] || {};
  const mode = nameReset(brk.note);
  return { mode: mode === 'walk' ? 'walked' : mode, prim: recourt.prim, fday, day: (brk.day | 0) || null, age: ((brk.day | 0) || endDay) - fday, endTrust: recourt.endTrust, note: String(brk.note || '').slice(0, 120) };
}

// villageDeath: which village-lost path fired, day-exact via endFlags and
// the engine-verbatim say lines on the final days.
function villageDeath(run) {
  const endDay = run.gameDays;
  const f = run.endFlags || {};
  const say = (run.sayLog || []).filter(s => s && s.day >= endDay - 2);
  const txt = say.map(s => String(s.text || '').toLowerCase()).join('\n');
  let mode = 'unexplained', day = null, fiction = null;
  if (f.scattered) {
    mode = 'scattering'; day = endDay;
    fiction = say.find(s => /scattering/i.test(s.text || '')) || null;
  } else if (f.extinct) {
    mode = 'extinction'; day = endDay;
    fiction = say.find(s => /not scattered, not gone|dead, every one/i.test(s.text || '')) || null;
  } else if (f.scholarDead && run.endReason === 'village-lost') {
    const ns = say.find(s => /pick up the codex/i.test(s.text || ''));
    if (ns) { mode = 'no-successor'; day = endDay; fiction = ns; }
  } else if (run.endReason !== 'village-lost') {
    mode = run.endReason; day = endDay;
  }
  return { mode, day, fiction: fiction ? { day: fiction.day, text: fiction.text } : null, flags: { scattered: !!f.scattered, extinct: !!f.extinct, scholarDead: !!f.scholarDead } };
}

// mechanismTail: the last 20 days of pantry / hungryDays / tribute / deaths.
function mechanismTail(run, endDay, window) {
  window = window || 20;
  const vday = (run.vday || []).filter(r => r && r.d >= endDay - window && r.d <= endDay);
  const pan = vday.map(r => [r.d, r.pantry]);
  const hungry = vday.map(r => [r.d, r.hungryDays]);
  const living = vday.map(r => [r.d, r.living + '/' + r.roster]);
  const trib = (run.flows || []).filter(f => f[1] === 'tribute' && f[0] >= endDay - window).map(f => [f[0], f[2]]);
  const tribTotal = trib.reduce((t, f) => t + (f[1] | 0), 0);
  const deaths = (run.deathsFull || []).filter(d => d && d.day >= endDay - window && d.day <= endDay)
    .map(d => ({ day: d.day, who: d.who, cause: d.cause, channel: d.channel, wave: d.killerWave }));
  const byChannel = {};
  for (const d of deaths) byChannel[d.channel] = (byChannel[d.channel] || 0) + 1;
  const succ = (run.successionDays || []).filter(s => s && s.day >= endDay - window).map(s => s.day);
  const say = (run.sayLog || []).filter(s => s && s.day >= endDay - window && s.day <= endDay);
  return { pan, hungry, living, trib, tribTotal, deaths, byChannel, succ, sayCount: say.length, sayTail: say.slice(-12) };
}

function attribute(run) {
  const bd = bondDeath(run);
  const vd = villageDeath(run);
  const tail = mechanismTail(run, run.gameDays, 20);
  const verdict = {};
  // PRIMARY attribution: per re-court, one death mode + day-exact mechanism.
  // A re-court is 'unexplained' if neither the bond nor the village death
  // carries a named, day-exact mechanism.
  if (bd.mode === 'neglect-snap' && bd.day != null) {
    verdict.bond = { mode: 'neglect-snap', day: bd.day, detail: 'bond broke: ' + (bd.note || '') + ' at age ' + bd.age };
  } else if (bd.mode === 'active-at-village-death') {
    verdict.bond = { mode: 'active-at-village-death', day: bd.day, detail: 'bond ' + bd.prim + ' alive at trust ' + bd.endTrust + ', age ' + bd.age + ' — the village died, not the bond' };
  } else {
    verdict.bond = { mode: bd.mode, day: bd.day, detail: JSON.stringify(bd) };
  }
  if (vd.mode !== 'unexplained') {
    verdict.village = { mode: vd.mode, day: vd.day, detail: vd.fiction ? ('"' + vd.fiction.text.slice(0, 200) + '"') : JSON.stringify(vd.flags) };
  } else {
    verdict.village = { mode: 'unexplained', day: run.gameDays, detail: 'no named village-lost path fired — INVESTIGATE' };
  }
  // Mechanism summary: the analyst (evidence file) names the causal chain;
  // the analyzer supplies the day-exact ingredients.
  return {
    seed: run.seed, policyId: run.policyId, endDay: run.gameDays, endReason: run.endReason,
    recourt: bd, village: vd, tail, verdict,
    unexplained: (verdict.village.mode === 'unexplained'),
  };
}

function load(seed) {
  const p = path.join(EVID, 'belongfeast', `s${seed}.json`);
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function main() {
  const out = { run: 'fleshout-20261019T2115Z', arm: 'sim-recourt', seeds: STALL, results: [] };
  let unexplained = 0;
  for (const s of STALL) {
    const run = load(s);
    const a = attribute(run);
    out.results.push(a);
    if (a.unexplained) unexplained++;
    console.log(`  s${s}: re-court ${a.recourt.prim} f${a.recourt.fday} -> ${a.recourt.mode} d${a.recourt.day} (age ${a.recourt.age}); ` +
      `village: ${a.village.mode} d${a.village.day}; tail deaths ${JSON.stringify(a.tail.byChannel)}; ` +
      `tribTotal20d=${a.tail.tribTotal}; pantry@tailEnd=${JSON.stringify(a.tail.pan.slice(-3))}; living@tailEnd=${JSON.stringify(a.tail.living.slice(-3))}`);
  }
  out.unexplained = unexplained;
  const sp = path.join(__dirname, '..', 'evidence', '2026-10-19', 'recourt-analysis.json');
  fs.writeFileSync(sp, JSON.stringify(out, null, 1));
  console.log(`\n  unexplained re-courts: ${unexplained}/3 — wrote ${sp}`);
}

module.exports = { nameReset, bondDeath, villageDeath, mechanismTail, attribute, STALL, EVID };

if (require.main === module) {
  try { main(); } catch (e) { console.error('ANALYZER CRASH:', e); process.exit(2); }
}
