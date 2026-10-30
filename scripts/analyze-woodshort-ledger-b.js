#!/usr/bin/env node
// analyze-woodshort-ledger-b.js — census + staged-route linkage for
// sim-woodshort-ledger-b corpora (scripts/woodshort-ledger-trace-b.js).
// Usage: node scripts/analyze-woodshort-ledger-b.js <corpusDir> [outJson]
// Reads one JSON file per seed, prints a human summary, and writes the
// machine census to outJson when given. Pure reads; no game code.
'use strict';
const fs = require('fs');
const path = require('path');

const dir = process.argv[2];
if (!dir) { console.error('usage: analyze-woodshort-ledger-b.js <corpusDir> [outJson]'); process.exit(2); }
const outJson = process.argv[3] || null;

const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
const perSeed = {};
const missReasons = {};
const stillSkip = {};
const woodVals = [], kcalVals = [], tickVals = [];
let seeds = 0, evenings = 0, creekEvenings = 0, stillRefused = 0, rescued = 0;
let campActed = 0, campLogSpent = 0, campFireFailed = 0, campRecords = 0;
const staged = []; // {seed, nightN, nightNp1, woodPlayer, narration}
const nextNightAfterSpend = []; // {seed, nightN, nightNp1, outcome}
const pileByDay = {}; // loopDay -> [pileBefore] on haven mornings
let pileFloorAfterDay1 = 0, havenMornings = 0;
let offLeverLines = 0, offCampRecords = 0;

for (const f of files) {
  const inst = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const s = inst.seed;
  seeds++;
  const evs = inst.evenings || [];
  evenings += evs.length;
  const byDay = {};
  for (const e of evs) byDay[e.loopDay] = e;
  perSeed[s] = { evenings: evs.length, creek: 0, still: 0, rescued: 0, campActed: 0, campLogSpent: 0 };
  for (const e of evs) {
    const wc = e.woodcarry || {};
    const cf = e.campfire || null;
    if (cf) {
      campRecords++;
      if (cf.acted) {
        campActed++; perSeed[s].campActed++;
        if (cf.fireLit && cf.logSpent && cf.logSpent >= 1) { campLogSpent++; perSeed[s].campLogSpent++; }
        else if (cf.acted && !cf.fireLit) campFireFailed++;
      } else if (cf.miss && cf.miss !== 'lever-off') {
        missReasons[cf.miss] = (missReasons[cf.miss] || 0) + 1;
      } else if (cf.miss === 'lever-off') {
        // OFF leg: no camp action expected.
      } else if (cf.acted === false && !cf.miss) {
        missReasons['(no-miss-recorded)'] = (missReasons['(no-miss-recorded)'] || 0) + 1;
      }
      if (cf.acted === true && cf.fireLit) {
        // OFF-guard check helper: camp acted on an OFF leg would be a violation;
        // caller distinguishes by leg (WOODCARRY env), not here.
      }
    }
    // OFF guard: lever lines in say tails.
    for (const line of (e.eveningSayTail || [])) {
      if (typeof line === 'string' && line.indexOf('No bridge tonight') >= 0) offLeverLines++;
    }
    // Pile ledger: morning carry records live on the evening row.
    const cr = e.woodcarryCarry || null;
    if (cr && cr.skip && cr.skip !== 'not-at-haven' && cr.skip !== 'game-over' && cr.skip !== 'combat' && cr.skip !== 'lever-off' && cr.pileBefore !== undefined && cr.pileBefore !== null) {
      havenMornings++;
      (pileByDay[e.loopDay] = pileByDay[e.loopDay] || []).push(cr.pileBefore);
      if (e.loopDay > 1 && cr.skip === 'pile-floor') pileFloorAfterDay1++;
    }
    if (wc.bucket !== 'creek') continue;
    creekEvenings++; perSeed[s].creek++;
    const cls = wc.classification || {};
    woodVals.push(cls.woodPlayer); kcalVals.push(cls.kcalLive === null || cls.kcalLive === undefined ? cls.kcal : cls.kcalLive); tickVals.push(cls.ticksToDayEnd);
    if (wc.rescued) { rescued++; perSeed[s].rescued++; }
    else {
      stillRefused++; perSeed[s].still++;
      const sk = (wc.bridge && wc.bridge.skip) || '(no-bridge-record)';
      stillSkip[sk] = (stillSkip[sk] || 0) + 1;
    }
    // Staged linkage: this evening is wood-short AND the previous
    // loop-day evening has a camp record with a log spent + fire lit.
    const prev = byDay[e.loopDay - 1];
    const prevCf = prev ? prev.campfire : null;
    if (wc.bridge && wc.bridge.skip === 'wood-short' && prevCf && prevCf.acted && prevCf.fireLit && prevCf.logSpent >= 1) {
      staged.push({ seed: s, nightN: e.loopDay - 1, nightNp1: e.loopDay,
        woodPlayer: cls.woodPlayer, kcal: cls.kcalLive, ticks: cls.ticksToDayEnd,
        narration: wc.narration || null,
        campWoodBefore: prevCf.woodBefore, campWoodAfter: prevCf.woodAfter,
        campCooked: prevCf.cooked, campCookedName: prevCf.cookedName });
    }
  }
  // Next-night outcomes after every log-spend camp event.
  for (const e of evs) {
    const cf = e.campfire || null;
    if (!(cf && cf.acted && cf.fireLit && cf.logSpent >= 1)) continue;
    const nxt = byDay[e.loopDay + 1];
    if (!nxt) { nextNightAfterSpend.push({ seed: s, nightN: e.loopDay, nightNp1: null, outcome: '(no-next-evening)' }); continue; }
    const nwc = nxt.woodcarry || {};
    nextNightAfterSpend.push({ seed: s, nightN: e.loopDay, nightNp1: e.loopDay + 1,
      outcome: nxt.eveningOutcome, bucket: nwc.bucket || null,
      bridgeSkip: (nwc.bridge && nwc.bridge.skip) || null,
      rescued: !!nwc.rescued, woodPlayer: (nwc.classification || {}).woodPlayer ?? null,
      inside: nxt.inside, tile: nxt.tile });
  }
  // OFF-guard camp check: any camp acted record on this seed.
  for (const e of evs) if (e.campfire && e.campfire.acted) offCampRecords++;
}

// Pile summary: min pileBefore on haven mornings, days 2+.
let pileMinAfterDay1 = null, pileMinDay = null;
for (const d of Object.keys(pileByDay).map(Number).sort((a, b) => a - b)) {
  if (d <= 1) continue;
  for (const v of pileByDay[d]) {
    if (pileMinAfterDay1 === null || v < pileMinAfterDay1) { pileMinAfterDay1 = v; pileMinDay = d; }
  }
}
const pileDay1 = pileByDay[1] || [];

const census = { dir, seeds, files: files.length, evenings, creekEvenings, stillRefused, rescued,
  stillSkip, woodVals, kcalVals, tickVals, perSeed,
  campRecords, campActed, campLogSpent, campFireFailed, missReasons,
  staged, nextNightAfterSpend,
  havenMornings, pileMinAfterDay1, pileMinDay, pileDay1, pileFloorAfterDay1,
  offLeverLines, offCampRecords };

console.log('seeds: ' + seeds + ' files: ' + files.length + ' evenings: ' + evenings);
console.log('creek evenings: ' + creekEvenings + ' still-refused: ' + stillRefused + ' rescued: ' + rescued);
console.log('still skip breakdown: ' + JSON.stringify(stillSkip));
console.log('wood values on creek evenings: ' + JSON.stringify(woodVals));
console.log('camp records: ' + campRecords + ' acted: ' + campActed + ' log-spent: ' + campLogSpent + ' fire-failed: ' + campFireFailed);
console.log('camp miss reasons: ' + JSON.stringify(missReasons));
console.log('STAGED wood-short evenings: ' + staged.length);
for (const st of staged) console.log('  STAGED seed ' + st.seed + ' nightN ' + st.nightN + ' -> night ' + st.nightNp1 + ' wood ' + st.woodPlayer + ' camp ' + st.campWoodBefore + '->' + st.campWoodAfter + ' cooked ' + st.campCooked + ' ' + (st.campCookedName || '') + ' | ' + st.narration);
console.log('next nights after log-spend camps: ' + nextNightAfterSpend.length);
for (const nn of nextNightAfterSpend) console.log('  seed ' + nn.seed + ' N ' + nn.nightN + ' -> ' + nn.nightNp1 + ' outcome ' + nn.outcome + ' bucket ' + nn.bucket + ' skip ' + nn.bridgeSkip + ' rescued ' + nn.rescued + ' wood ' + nn.woodPlayer + ' inside ' + nn.inside);
console.log('haven mornings with pile: ' + havenMornings + ' pile min days 2+: ' + pileMinAfterDay1 + ' (day ' + pileMinDay + ') pile day1: ' + JSON.stringify(pileDay1) + ' pile-floor after day1: ' + pileFloorAfterDay1);
console.log('lever lines in tails: ' + offLeverLines + ' camp acted records: ' + offCampRecords + ' (guard: both must be 0 on OFF legs)');
console.log('per-seed: ' + JSON.stringify(perSeed));
if (outJson) { fs.mkdirSync(path.dirname(outJson), { recursive: true }); fs.writeFileSync(outJson, JSON.stringify(census, null, 2)); console.log('wrote ' + outJson); }
