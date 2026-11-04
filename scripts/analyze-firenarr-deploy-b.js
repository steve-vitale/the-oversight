#!/usr/bin/env node
// analyze-firenarr-deploy-b.js — (v**) analyzer over DEPLOY-INPUT
// series (evenings recorded by trace-firenarr-deploy-b.js wrapping
// Game.villageEats: post-meal store, post-meal hungryStreak, gate
// read at the same point). Pure functions; no game load, no RNG.
// Rule verbatim from evidence/2026-11-03/sim-firenarr-b.md §3 and
// the deploy in src/js/game.js _firenarrEvening():
//   stretches = runs of gateEngaged=false evenings; S = stretch start.
//   peak(D) = max store over S..D; falls(D) = evenings in (S..D]
//     with store lower than the previous evening's store.
//   First firing per stretch: first D with D > S, D >= 8, where
//     (e**): streak >= 1 AND ((E1) falls >= 2 AND store <= 0.85*peak
//       OR (E2) store <= 0.65*peak), or (F): falls >= 3 AND
//       store <= 0.80*peak (no streak condition). Tie -> (e**);
//       E2 beats E1 when both (e**) clauses hold.
//   Escalation: once per stretch, on a LATER evening than the
//     first firing, when the first firing was E1 or (F) and
//     store <= 0.65*peak. Repeats otherwise silent.
//   Later stretches use "again" variants (stretch index > 1).
//   An engaged evening ends the stretch and never fires.
'use strict';
const E1_FRAC = 0.85;
const CLIFF_FRAC = 0.65;
const FALLBACK_FRAC = 0.80;
const ELIGIBLE_DAY = 8;

const TEMPLATES = {
  E1: '⚠ The store has fallen from its recent high — the shelves are thinning.',
  E2: '⚠ The store has fallen far from its recent high — the shelves are nearly bare.',
  F: '⚠ The store keeps slipping from its recent high — evening after evening, lower.',
  ESC: '⚠ The store has fallen further still from its recent high.',
  E1_AGAIN: '⚠ The store has fallen from its recent high again — the shelves are thinning.',
  E2_AGAIN: '⚠ The store has fallen far from its recent high again — the shelves are nearly bare.',
  F_AGAIN: '⚠ The store keeps slipping from its recent high again — evening after evening, lower.',
};
const ALL_TEMPLATES = Object.values(TEMPLATES);
function isFirenarrLine(line) { return ALL_TEMPLATES.includes(line); }
function templateFor(kind, again) {
  if (kind === 'ESC') return TEMPLATES.ESC;
  return TEMPLATES[again ? kind + '_AGAIN' : kind];
}

// rows: [{day, pantryKcal, hungryStreak, gateEngaged}] in day order.
function predictedEvents(rows) {
  const events = [];
  let stretchIdx = 0;
  let cur = null;
  function endStretch() { cur = null; }
  for (const r of rows) {
    if (r == null || r.pantryKcal == null) continue;
    if (r.gateEngaged) { endStretch(); continue; }
    if (cur == null) {
      stretchIdx += 1;
      cur = { start: r.day, peak: r.pantryKcal, prev: r.pantryKcal, falls: 0, fired: null, escalation: false, idx: stretchIdx };
      continue;
    }
    if (r.pantryKcal < cur.prev) cur.falls += 1;
    if (r.pantryKcal > cur.peak) cur.peak = r.pantryKcal;
    cur.prev = r.pantryKcal;
    const D = r.day;
    if (!(D >= ELIGIBLE_DAY && D > cur.start)) continue;
    const again = cur.idx > 1;
    if (!cur.fired) {
      const e2 = r.hungryStreak >= 1 && r.pantryKcal <= CLIFF_FRAC * cur.peak;
      const e1 = r.hungryStreak >= 1 && cur.falls >= 2 && r.pantryKcal <= E1_FRAC * cur.peak;
      const f = cur.falls >= 3 && r.pantryKcal <= FALLBACK_FRAC * cur.peak;
      if (e2) { cur.fired = 'E2'; events.push({ day: D, kind: 'E2', again, template: templateFor('E2', again) }); }
      else if (e1) { cur.fired = 'E1'; events.push({ day: D, kind: 'E1', again, template: templateFor('E1', again) }); }
      else if (f) { cur.fired = 'F'; events.push({ day: D, kind: 'F', again, template: templateFor('F', again) }); }
    } else if (!cur.escalation && (cur.fired === 'E1' || cur.fired === 'F')
      && r.pantryKcal <= CLIFF_FRAC * cur.peak) {
      cur.escalation = true;
      events.push({ day: D, kind: 'ESC', again: false, template: TEMPLATES.ESC });
    }
  }
  return events;
}

function summarizeSeed(seedJson) {
  const rows = (seedJson.rows || []).slice().sort((a, b) => a.day - b.day);
  const predicted = predictedEvents(rows);
  const observed = (seedJson.firenarrByNight || []).map((n) => ({ day: n.day, line: n.line }));
  const predKey = predicted.map((e) => e.day + '|' + e.template).join('\n');
  const obsKey = observed.map((o) => o.day + '|' + o.line).join('\n');
  return {
    seed: seedJson.seed, daysAlive: seedJson.daysAlive, endReason: seedJson.endReason,
    predicted, observed, match: predKey === obsKey,
    firstKind: predicted.length ? predicted[0].kind : null,
    stretchCount: predicted.length ? null : null,
  };
}

module.exports = { E1_FRAC, CLIFF_FRAC, FALLBACK_FRAC, ELIGIBLE_DAY, TEMPLATES, ALL_TEMPLATES, isFirenarrLine, templateFor, predictedEvents, summarizeSeed };
if (require.main === module) {
  const fs = require('fs');
  const path = process.argv[2];
  if (!path) { console.error('usage: analyze-firenarr-deploy-b.js <jsonl>'); process.exit(2); }
  const lines = fs.readFileSync(path, 'utf8').split('\n').filter((l) => l.trim());
  let match = 0, total = 0, firing = 0;
  for (const l of lines) {
    const sj = JSON.parse(l);
    const s = summarizeSeed(sj);
    total++;
    if (s.match) match++;
    if (s.predicted.length) firing++;
    console.log(s.seed + ' match=' + s.match + ' predicted=' + s.predicted.map((e) => e.day + ':' + e.kind + (e.again ? ':again' : '')).join(',') + ' observed=' + s.observed.map((o) => o.day).join(',') + ' daysAlive=' + s.daysAlive + ' ' + s.endReason);
  }
  console.log(`summary: ${match}/${total} match, ${firing} firing legs`);
}
