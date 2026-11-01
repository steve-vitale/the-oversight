#!/usr/bin/env node
// analyze-journey-succession-r91-naming-20261101.js — WEEK1-NAMING scorer.
// Scores dead-bearer naming in the driven d+3/d+7 conversations of a
// succession run: per transcript (names dead? + line extracts), per seed
// (named/total transcripts), and per lately+mourning DRAW (the
// mechanism-level denominator — a seed with 0 naming but 0 draws is
// uninformative, while 0 naming across several draws is a real silence).
// Dead name comes from the seed's stdout JSON (death.oldFirst); a
// collision flag fires when a living partner shares the dead first name
// (a mechanical hit could then refer to the living namesake, and the
// sense-read — not the count — decides).
// r91 ADDITION (prereg proposal from r89): NAMING-ANY. A transcript
// also counts if it names ANY person dead within 14 days before the
// transcript's day — the first bearer (death.day) plus later bearers
// (chainDeaths detectedDay). First-bearer fields are unchanged, so
// r83/r89 fixture expectations still bind; any-recent fields are
// additive (namedAny, anyLines, anyHitLines per transcript).
// Usage: node scripts/analyze-journey-succession-r91-naming-20261101.js [evidDir] [seedsCsv] [tag]
//   Defaults: evidence/2026-11-01, 28151..28154, r91.
// Exported scoreWeek1(evidDir, seeds, tag) / scoreSeed(...) for tests.
'use strict';
const fs = require('fs');
const path = require('path');

function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function scoreSeed(evidDir, seed, tag, deadOverride) {
  tag = tag || 'r91';
  const rec = JSON.parse(fs.readFileSync(
    path.join(evidDir, `journey-succession-${tag}-${seed}.stdout.json`), 'utf8'));
  const dead = deadOverride || (rec.death && rec.death.oldFirst);
  if (!dead) return { seed, error: 'no death.oldFirst' };
  const reads = (rec.convoReads || []).filter(c => c.dplus === 3 || c.dplus === 7);
  // Filenames key on the ACTUAL days-since-death at firing time, not the
  // checkpoint label: the driver fires a checkpoint on the first day with
  // daysSince >= cp, so a checkpoint can fire late (label d+7, file d+8).
  // The label-only lookup silently missed such transcripts (found on the
  // rebased tip, proof seed 24998: d+7 fired at d+8). Fall back to the
  // label only when day/death-day are unavailable.
  const deathDay = (rec.death && rec.death.day != null) ? rec.death.day : null;
  const livingNames = new Set();
  for (const c of (rec.convoReads || [])) if (c.vid) livingNames.add(c.vid);
  for (const ch of (rec.chainDeaths || [])) if (ch.newFirst) livingNames.add(ch.newFirst);
  const collision = livingNames.has(dead);
  const re = new RegExp(`\\b${esc(dead)}\\b`);
  // r91 any-recent dead list: first bearer + chain deaths, each with its death day.
  const recentDead = [];
  if (deathDay != null) recentDead.push({ first: dead, day: deathDay });
  for (const ch of (rec.chainDeaths || [])) {
    if (ch.deadFirst && ch.detectedDay != null) recentDead.push({ first: ch.deadFirst, day: ch.detectedDay });
  }
  const recentRes = recentDead.map(d => ({ first: d.first, day: d.day, re: new RegExp(`\\b${esc(d.first)}\\b`) }));
  const anyCollision = recentDead.some(d => livingNames.has(d.first));
  const transcripts = [];
  let draws = 0, namingLines = 0, anyLines = 0;
  for (const c of reads) {
    const actual = (c.day != null && deathDay != null) ? c.day - deathDay : c.dplus;
    const fn = path.join(evidDir,
      `journey-succession-${tag}-transcript-${seed}-dplus${actual}-${c.vid}.txt`);
    if (!fs.existsSync(fn)) { transcripts.push({ dplus: c.dplus, vid: c.vid, missing: true }); continue; }
    const text = fs.readFileSync(fn, 'utf8');
    const tm = text.match(/\(trust (\d+)\)/);
    const lately = (text.match(/YOU PICK \[ask:lately\]/g) || []).length;
    const mourning = (text.match(/YOU PICK \[alive:event:mourning\]/g) || []).length;
    const reactMore = (text.match(/YOU PICK \[dlg:(react|more)\]/g) || []).length;
    draws += lately + mourning;
    const hitLines = [];
    const anyHitLines = [];
    // Transcript absolute day: c.day when present, else first-death day + label.
    const tday = (c.day != null) ? c.day : (deathDay != null ? deathDay + c.dplus : null);
    for (const ln of text.split('\n')) {
      if (re.test(ln)) hitLines.push(ln.trim().slice(0, 200));
      if (tday != null && recentRes.some(d => (tday - d.day) >= 0 && (tday - d.day) <= 14 && d.re.test(ln))) {
        anyHitLines.push(ln.trim().slice(0, 200));
      }
    }
    namingLines += hitLines.length;
    anyLines += anyHitLines.length;
    transcripts.push({ dplus: c.dplus, actual, late: actual !== c.dplus, vid: c.vid, trust: tm ? +tm[1] : null,
      bond: !!c.bond, bondDepth: c.bondDepth || null, bondV: c.bondV || null,
      lately, mourning, reactMore, hits: hitLines.length, hitLines,
      names: hitLines.length > 0,
      anyHits: anyHitLines.length, anyHitLines, anyRecent: anyHitLines.length > 0 });
  }
  const named = transcripts.filter(t => t.names).length;
  const namedAny = transcripts.filter(t => t.anyRecent).length;
  return { seed, dead, collision, transcripts, named, total: transcripts.length, draws, namingLines,
    recentDead, anyCollision, namedAny, anyLines };
}

function scoreWeek1(evidDir, seeds, tag, deadOverrideBySeed) {
  const perSeed = seeds.map(s => scoreSeed(evidDir, s, tag,
    deadOverrideBySeed ? deadOverrideBySeed[s] : null));
  const pooled = {
    transcripts: perSeed.reduce((a, r) => a + (r.total || 0), 0),
    named: perSeed.reduce((a, r) => a + (r.named || 0), 0),
    draws: perSeed.reduce((a, r) => a + (r.draws || 0), 0),
    namingLines: perSeed.reduce((a, r) => a + (r.namingLines || 0), 0),
    namedAny: perSeed.reduce((a, r) => a + (r.namedAny || 0), 0),
    anyLines: perSeed.reduce((a, r) => a + (r.anyLines || 0), 0),
  };
  return { perSeed, pooled };
}

if (require.main === module) {
  const evidDir = path.join(__dirname, '..', 'evidence', process.argv[2] || '2026-11-01');
  const seeds = (process.argv[3] || '28151,28152,28153,28154').split(',').map(Number);
  const tag = process.argv[4] || 'r91';
  const out = scoreWeek1(evidDir, seeds, tag);
  for (const r of out.perSeed) {
    if (r.error) { console.log(`seed ${r.seed}: ERROR ${r.error}`); continue; }
    console.log(`seed ${r.seed} dead=${r.dead} collision=${r.collision} named=${r.named}/${r.total} namedAny=${r.namedAny}/${r.total} draws(lately+morning)=${r.draws} namingLines=${r.namingLines} anyLines=${r.anyLines} recentDead=${JSON.stringify(r.recentDead || [])}`);
    for (const t of r.transcripts) {
      if (t.missing) { console.log(`  MISSING d+${t.dplus} ${t.vid}`); continue; }
      console.log(`  d+${t.dplus} ${t.vid}${t.trust != null ? ` trust=${t.trust}` : ''}${t.bond ? ` bond(depth=${t.bondDepth},v=${t.bondV})` : ''} lately=${t.lately} mourning=${t.mourning} reactMore=${t.reactMore} hits=${t.hits} names=${t.names} anyHits=${t.anyHits} anyRecent=${t.anyRecent}`);
      for (const ln of t.hitLines) console.log(`    HIT: ${ln}`);
      for (const ln of (t.anyHitLines || [])) if (!t.hitLines.includes(ln)) console.log(`    ANY-HIT: ${ln}`);
    }
  }
  console.log(`POOLED named=${out.pooled.named}/${out.pooled.transcripts} namedAny=${out.pooled.namedAny}/${out.pooled.transcripts} draws=${out.pooled.draws} namingLines=${out.pooled.namingLines} anyLines=${out.pooled.anyLines}`);
}
module.exports = { scoreWeek1, scoreSeed };
