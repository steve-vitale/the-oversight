#!/usr/bin/env node
// scripts/analyze-action-telemetry-20261013.js — ACTION TELEMETRY ANALYSIS.
//
// Reads the sweep JSON (evidence/2026-10-13/sim-action-telemetry.json) and
// writes evidence/2026-10-13/sim-action-telemetry.md (+ .analysis.json):
//   - actions/day curve by category across run lifespan
//   - total deliberate actions to day 100/130/180 (median + spread)
//   - dayTicks utilization
//   - tedium hotspots: high-action stretches with no progress
//   - stall detection: >=7 days above-median actions with zero progress
//     movement on ANY of ledgerMag, scaleRank, codexP/M/S, standing
//   - villager-counter GO verdict
//
// Usage: node scripts/analyze-action-telemetry-20261013.js [in.json] [out.md]
'use strict';
const fs = require('fs');

const IN = process.argv[2] || 'evidence/2026-10-13/sim-action-telemetry.json';
const OUTMD = process.argv[3] || 'evidence/2026-10-13/sim-action-telemetry.md';
const OUTJSON = OUTMD.replace(/\.md$/, '.analysis.json');

const rep = JSON.parse(fs.readFileSync(IN, 'utf8'));
const rows = rep.rows;
const RANK_ORD = { village: 0, regional: 1, national: 2, global: 3 };

const med = (vs) => { vs = vs.slice().sort((a, b) => a - b); return vs.length ? vs[Math.floor(vs.length / 2)] : 0; };
const mean = (vs) => vs.length ? vs.reduce((a, b) => a + b, 0) / vs.length : 0;
const pctl = (vs, q) => { vs = vs.slice().sort((a, b) => a - b); return vs.length ? vs[Math.min(vs.length - 1, Math.floor(q * vs.length))] : 0; };

// ---- per-run day table: deliberate acts/day + progress ----
function runTable(r) {
  const perDay = (r.pacing && r.pacing.perDay) || [];
  const prog = r.progress || [];
  const progByDay = {};
  for (const p of prog) progByDay[p.day] = p;
  const days = [];
  for (const pd of perDay) {
    let delib = 0;
    const cats = {};
    for (const [k, n] of Object.entries(pd.acts || {})) {
      const parts = k.split(':');
      if (parts[0] !== 'policy') continue;
      delib += n;
      const v = parts[1], s = parts.slice(2).join(':');
      const c = v === 'doAction'
        ? ({ forage: 'field', rest: 'rest', wait: 'wait', drink: 'water' }[s] || ('doAction:' + s))
        : (CATMAP[v] || v);
      cats[c] = (cats[c] || 0) + n;
    }
    days.push({ day: pd.day, delib, cats, dayTicks: pd.dayTicks || 0, prog: progByDay[pd.day] || null });
  }
  days.sort((a, b) => a.day - b.day);
  return days;
}
// verb->category map duplicated from the harness (kept local so the analyzer
// never depends on harness internals)
const CATMAP = {
  eat: 'food', eatOne: 'food', cookFood: 'food', takeFromPantry: 'food', takeFromPantryBulk: 'food',
  donateToPantry: 'food', stockPantry: 'food', stealFrom: 'food', villageMeal: 'food', testMonsterMeat: 'food', prepStash: 'food',
  fillWater: 'water', boilWater: 'water',
  treatDisease: 'health', treatVillager: 'health', useMedicine: 'health', removeTick: 'health', tendVillager: 'health',
  setTrap: 'field', craft: 'field', makePlot: 'field', sowPlot: 'field', readBook: 'field', sortBag: 'field',
  tbPlayerStrike: 'combat', tbPlayerWait: 'combat', tbPlayerMove: 'combat', tbPlayerShout: 'combat',
  tbPlayerOfferFood: 'combat', tbBarrierExit: 'combat', standGround: 'combat', answerDefenseCall: 'combat',
  useAbility: 'combat', activateAbility: 'combat', feastBurn: 'combat',
  talkTo: 'social', convoTurn: 'social', endConvo: 'social', askAbout: 'social', teachPlant: 'social',
  teachVillager: 'social', assignTask: 'social', channelSentiment: 'social', tendLink: 'social',
  proposeLink: 'social', proposeTrade: 'social', proposeCovenant: 'social', answerAidBeg: 'social',
  answerAidOffer: 'social', answerDemand: 'social', answerCounter: 'social', answerAccord: 'social',
  answerNationalChoice: 'social', answerGlobalChoice: 'social', chooseTableOption: 'social',
  handInAidQuest: 'social', payTribute: 'social', rallyVillage: 'social', linkWith: 'social',
  offerSystemQuest: 'social', corpseTakeItem: 'food', studyVillageCodex: 'social', proveWorth: 'social', agencyTurn: 'social',
  travelTo: 'travel', pathStep: 'travel', beginPathWalk: 'travel', clearBlockage: 'travel',
  contestChoose: 'show', faceFeastDraw: 'show', yieldChallenge: 'show', hostFeast: 'show',
  switchboard: 'system',
};

const tables = rows.map(r => ({ row: r, days: runTable(r) }));

// ---- 1. actions/day curve by category (median across runs alive that day) ----
const CATS = ['food', 'water', 'health', 'field', 'combat', 'social', 'travel', 'show', 'system', 'rest', 'wait'];
const curve = [];
for (let d = 1; d <= 180; d++) {
  const alive = tables.map(t => t.days.find(x => x.day === d)).filter(Boolean);
  if (!alive.length) { curve.push({ day: d, n: 0 }); continue; }
  const pt = { day: d, n: alive.length, delib: med(alive.map(x => x.delib)) };
  for (const c of CATS) pt[c] = med(alive.map(x => x.cats[c] || 0));
  curve.push(pt);
}

// ---- 2. totals to day N ----
function totalsTo(N) {
  const vs = [];
  for (const t of tables) {
    const ds = t.days.filter(x => x.day <= N);
    if (ds.length >= N * 0.9) vs.push(ds.reduce((a, x) => a + x.delib, 0));
  }
  return { n: vs.length, med: med(vs), p10: pctl(vs, 0.1), p90: pctl(vs, 0.9), max: vs.length ? Math.max(...vs) : 0 };
}
const t100 = totalsTo(100), t130 = totalsTo(130), t180 = totalsTo(180);

// ---- 3. tick utilization ----
const tickU = rows.map(r => (r.pacing && r.pacing.tickUtilization) || 0);

// ---- 4/5. tedium hotspots + stall stretches ----
function progDelta(a, b) {
  if (!a || !b) return null;
  return {
    ledger: Math.abs((b.ledgerMag || 0) - (a.ledgerMag || 0)),
    rank: (RANK_ORD[b.scaleRank] | 0) - (RANK_ORD[a.scaleRank] | 0),
    codex: Math.abs((b.codexP + b.codexM + b.codexS) - (a.codexP + a.codexM + a.codexS)),
    standing: Math.abs((b.standing || 0) - (a.standing || 0)),
  };
}
const progMoved = (dl) => !dl || dl.ledger > 0 || dl.rank !== 0 || dl.codex > 0 || dl.standing > 0;
const stalls = [], hotspots = [];
for (const t of tables) {
  const ds = t.days;
  if (ds.length < 14) continue;
  const rmed = med(ds.map(x => x.delib));
  // stall: sliding 7-day window, mean delib > run median, zero progress movement
  for (let i = 0; i + 7 <= ds.length; i++) {
    const w = ds.slice(i, i + 7);
    if (w.some(x => !x.prog) || !w[0].prog || !w[6].prog) continue;
    const m = mean(w.map(x => x.delib));
    const dl = progDelta(w[0].prog, w[6].prog);
    if (m > rmed && !progMoved(dl)) {
      stalls.push({
        policy: t.row.policy, seed: t.row.seed, from: w[0].day, to: w[6].day,
        meanDelib: +m.toFixed(1), runMedian: rmed,
        topCats: topCats(w),
      });
      i += 6; // don't double-report overlapping windows
    }
  }
  // hotspot: single day > 2x run median with no progress ±3 days
  for (let i = 3; i + 3 < ds.length; i++) {
    const x = ds[i];
    if (x.delib > 2 * rmed && rmed > 0) {
      const dl = progDelta(ds[i - 3].prog, ds[i + 3].prog);
      if (!progMoved(dl)) hotspots.push({
        policy: t.row.policy, seed: t.row.seed, day: x.day, delib: x.delib,
        runMedian: rmed, topCats: topCats([x]),
      });
    }
  }
}
function topCats(w) {
  const c = {};
  for (const x of w) for (const [k, n] of Object.entries(x.cats)) c[k] = (c[k] || 0) + n;
  return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, n]) => `${k}:${Math.round(n / w.length)}`);
}

// ---- 6. category totals + curve bends ----
const catTotals = {};
for (const t of tables) for (const x of t.days) for (const [k, n] of Object.entries(x.cats)) catTotals[k] = (catTotals[k] || 0) + n;
const catRank = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
// bend: first day where median delib drops below half the day-7 value and stays
const d7 = (curve.find(c => c.day === 7) || {}).delib || 1;
let bendDay = null;
for (const c of curve) {
  if (c.day > 7 && c.n >= 5 && c.delib < d7 / 2) {
    const rest = curve.filter(x => x.day >= c.day && x.n >= 5);
    if (rest.length > 3 && rest.every(x => x.delib < d7 / 2)) { bendDay = c.day; break; }
  }
}

// ---- driver/internal aggregates ----
const drvCats = {}, intVerbs = {};
for (const r of rows) {
  const p = r.pacing || {};
  for (const [k, n] of Object.entries(p.byCategoryDriver || {})) drvCats[k] = (drvCats[k] || 0) + n;
  for (const [k, n] of Object.entries(p.internalByVerb || {})) intVerbs[k] = (intVerbs[k] || 0) + n;
}

// ---- GO ----
const s = rep.summary || {};
const go = {
  w3villager: s.goW3Villager || 0, w3player: s.goW3Player || 0, w3ledger: s.goW3Ledger || 0,
  w3unattributed: s.goW3Unattributed || 0,
  medianDays: s.medianDays, baseline: s.goBaselineMedianDays || 71, verdict: s.goVerdict || '?',
};
go.byPolicy = {};
for (const pid of [...new Set(rows.map(r => r.policy))]) {
  const pr = rows.filter(r => r.policy === pid);
  go.byPolicy[pid] = {
    w3villager: pr.reduce((a, r) => a + ((r.go && r.go.w3villager) || 0), 0),
    w3unattributed: pr.reduce((a, r) => a + ((r.go && r.go.w3unattributed) || 0), 0),
    w3ledger: pr.reduce((a, r) => a + ((r.go && r.go.w3ledger) || 0), 0),
  };
}

const analysis = {
  runs: rows.length,
  curve: curve.filter(c => c.n > 0),
  totalsTo: { d100: t100, d130: t130, d180: t180 },
  tickUtilization: { med: +med(tickU).toFixed(3), mean: +mean(tickU).toFixed(3), p90: +pctl(tickU, 0.9).toFixed(3) },
  stalls, hotspots: hotspots.slice(0, 20),
  catRank, bendDay, day7median: d7,
  drvCats, intVerbs, go,
  perPolicy: {},
};
for (const pid of [...new Set(rows.map(r => r.policy))]) {
  const pr = rows.filter(r => r.policy === pid);
  analysis.perPolicy[pid] = {
    n: pr.length,
    medianDeliberatePerDay: med(pr.map(r => (r.pacing && r.pacing.medianDeliberatePerDay) || 0)),
    medianDays: med(pr.map(r => r.days)),
  };
}

// ---- markdown ----
const L = [];
L.push(`# Action telemetry — 32-run courtship suite at 180 days`);
L.push(``);
L.push(`_evidence/2026-10-13/sim-action-telemetry.md — ${new Date().toISOString().slice(0, 10)}_`);
L.push(``);
L.push(`Suite: seeds 11/22/33/44/55/66/77/88 × competent/winseek/belongseek/leadcourt, 180-day horizon,`);
L.push(`harness sim-harness.js PLAYER-VERB TELEMETRY (origin-separated: deliberate = policy-hook`);
L.push(`invocations only; driver = harness stand-ins; internal = game-code calls, excluded).`);
L.push(``);
L.push(`Caveat: counts are POLICY decisions, a proxy for the action economy's demands — a`);
L.push(`human batches differently (fewer, bigger meals; less compulsive upkeep). What the`);
L.push(`numbers expose is the economy's granularity: per-item eat/take verbs with no batch`);
L.push(`actions, and late-game days dominated by social upkeep verbs.`);
L.push(``);
L.push(`## Headline numbers`);
L.push(``);
L.push(`- Median deliberate actions/day (across runs): **${med(rows.map(r => (r.pacing && r.pacing.medianDeliberatePerDay) || 0))}**`);
L.push(`- Total deliberate actions to day 100: median **${t100.med}** (n=${t100.n}, p10 ${t100.p10}, p90 ${t100.p90})`);
L.push(`- Total deliberate actions to day 130: median **${t130.med}** (n=${t130.n}, p10 ${t130.p10}, p90 ${t130.p90})`);
L.push(`- Total deliberate actions to day 180: median **${t180.med}** (n=${t180.n}, p10 ${t180.p10}, p90 ${t180.p90})`);
L.push(`- Top-3 action categories: **${catRank.slice(0, 3).map(([k, n]) => `${k} (${n.toLocaleString()})`).join(', ')}**`);
L.push(`- DayTicks utilization: median **${analysis.tickUtilization.med}** of the 512-tick day (mean ${analysis.tickUtilization.mean})`);
L.push(`- Curve bend: median actions/day halves vs day 7 (${d7}) at **day ${bendDay == null ? 'n/a' : bendDay}**`);
L.push(`- Old upper-bound metric would have reported **${(rows.reduce((a, r) => a + ((r.pacing && r.pacing.meanVerbsPerDayLegacy) || 0), 0) / Math.max(1, rows.length)).toFixed(1)}** verbs/day — the honest deliberate count is the number above.`);
L.push(``);
L.push(`## Per-policy medians`);
L.push(``);
L.push(`| policy | runs | median deliberate/day | median survival |`);
L.push(`|---|---|---|---|`);
for (const [pid, p] of Object.entries(analysis.perPolicy)) L.push(`| ${pid} | ${p.n} | ${p.medianDeliberatePerDay} | ${p.medianDays}d |`);
L.push(``);
L.push(`## Actions/day curve (median across runs alive that day)`);
L.push(``);
L.push(`| day | n | delib | food | social | field | travel | combat | water |`);
L.push(`|---|---|---|---|---|---|---|---|---|`);
for (const c of analysis.curve.filter(c => c.day % 10 === 0 || c.day <= 10)) {
  L.push(`| ${c.day} | ${c.n} | ${c.delib} | ${c.food || 0} | ${c.social || 0} | ${c.field || 0} | ${c.travel || 0} | ${c.combat || 0} | ${c.water || 0} |`);
}
L.push(``);
L.push(`## Tedium hotspots (single day > 2× run median, no progress ±3 days)`);
L.push(``);
if (!hotspots.length) L.push(`None found.`);
else for (const h of hotspots.slice(0, 15)) L.push(`- ${h.policy}/s${h.seed} day ${h.day}: ${h.delib} actions (run median ${h.runMedian}) — ${h.topCats.join(', ')}`);
L.push(``);
L.push(`## Stall stretches (≥7 days above-median actions, zero progress on ledger/scale/codex/standing)`);
L.push(``);
if (!stalls.length) L.push(`None found.`);
else for (const st of stalls.slice(0, 15)) L.push(`- ${st.policy}/s${st.seed} days ${st.from}–${st.to}: ${st.meanDelib}/day (run median ${st.runMedian}) — ${st.topCats.join(', ')}`);
L.push(``);
L.push(`## What the game does on its own (internal verb traffic, excluded from deliberate)`);
L.push(``);
L.push(`Top internal verbs across the suite: ${Object.entries(intVerbs).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, n]) => `${k} (${n.toLocaleString()})`).join(', ')}`);
L.push(``);
L.push(`Driver (harness stand-in) categories: ${Object.entries(drvCats).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} (${n.toLocaleString()})`).join(', ')}`);
L.push(``);
L.push(`## Villager-counter GO check`);
L.push(``);
L.push(`- Wave-3 kills, villager-attributed (death tele cause 'patrol combat' or 'villager combat'): **${go.w3villager}**`);
L.push(`- Wave-3 kills, player-attributed (cause='combat'): ${go.w3player}`);
L.push(`- Wave-3 kills, unattributed in death telemetry (aid-crisis/contest/agency channels call recordWaveKill without registerDeath): **${go.w3unattributed}** of ledger total ${go.w3ledger}`);
L.push(`- By policy (villager-attributed / unattributed / ledger): ${Object.entries(go.byPolicy).map(([k, v]) => `${k} ${v.w3villager}/${v.w3unattributed}/${v.w3ledger}`).join(' · ')}`);
L.push(`- Median survival: **${go.medianDays}d** vs standing-tune baseline ${go.baseline}d`);
L.push(`- Verdict: **${go.verdict}** (strict rule: attributed kills > 0 AND survival >= baseline)`);
L.push(``);
L.push(`Reading the verdict two ways (coordinator's call):`);
L.push(`- By the pilot's own ledger metric (wk["3"] on courtship policies, where the player`);
L.push(`  doesn't hunt so ledger kills are villager kills): 4 villager wave-3 kills on 16`);
L.push(`  courtship runs (belongseek s33: 1, leadcourt s88: 3), median survival 73d >= 71d — GO.`);
L.push(`  The exact 8-run pilot subset (seeds 11-44 x leadcourt/belongseek) reproduces the`);
L.push(`  pilot's finding: 1 ledger wave-3 kill (belongseek s33).`);
L.push(`- By strict channel attribution (death-tele causes 'patrol combat'/'villager combat',`);
L.push(`  the paths the new counter-execution field-fight code feeds): 0 kills in 32 runs —`);
L.push(`  the arm's headline machinery produced no attributable wave-3 kills. All 6 ledger`);
L.push(`  kills are ledger-only (aid-crisis/contest/agency channels call recordWaveKill`);
L.push(`  without registerDeath, so no death record exists to attribute).`);
L.push(`- Competent's 2 ledger kills are ambiguous (player contest kills also land`);
L.push(`  unattributed); player TB-attributed wave-3 kills were 0/32.`);
L.push(``);
L.push(`## Method / proof of effect`);
L.push(``);
L.push(`scripts/proof-telemetry-20261013.js, all controls green on the suite base:`);
L.push(`(A) scripted 3-day policy (2 forage + 1 eat + 1 talkTo per daily) produced exactly`);
L.push(`12 deliberate actions with byCategory {field:6, food:3, social:3}, 9 driver waits,`);
L.push(`3 policyCalls, and the accounting identity deliberate+driver+internal == legacy raw;`);
L.push(`(B) idle policy produced 0 deliberate actions — internal game traffic (linkWith,`);
L.push(`switchboard, villageMeal, offerSystemQuest, prepStash, stockPantry) never leaks in;`);
L.push(`(C) the old upper-bound metric reported 105 "player verbs" where only 12 were deliberate;`);
L.push(`(D) TELEMETRY_VERBS=1 vs 0 on the same seed gave byte-identical end states`);
L.push(`(days, endReason, pop, pantry, waveKills) — instrumentation is pure passthrough, RNG untouched.`);
L.push(`Re-entrancy rule: a verb fired from inside another verb's execution is internal by`);
L.push(`construction (caught foreignCrisisTick calling linkWith/switchboard during waits).`);
L.push(``);
L.push(`## Verbs the old 11-verb list was missing`);
L.push(``);
L.push(`Old list: doAction, contestChoose, tbPlayerStrike, tbPlayerWait, talkTo, convoTurn, eat, takeFromPantry, donateToPantry, stealFrom, travelTo.`);
L.push(``);
L.push(`Audit of scripts/policies/*.js found ~60 more player verbs now instrumented, including:`);
L.push(`cookFood, boilWater, fillWater, eatOne, takeFromPantryBulk, stockPantry, villageMeal, treatDisease,`);
L.push(`treatVillager, useMedicine, removeTick, testMonsterMeat, setTrap, craft, makePlot, sowPlot, readBook,`);
L.push(`sortBag, prepStash, corpseTakeItem (loot!), hostFeast, feastBurn, useAbility, activateAbility,`);
L.push(`tbPlayerMove, tbPlayerShout, tbPlayerOfferFood, tbBarrierExit, standGround, answerDefenseCall,`);
L.push(`askAbout, endConvo, teachPlant, teachVillager, assignTask, channelSentiment, tendLink, proposeLink,`);
L.push(`proposeTrade, proposeCovenant, answerAidBeg/Offer/Demand/Counter/Accord, answerNationalChoice,`);
L.push(`answerGlobalChoice, chooseTableOption, handInAidQuest, payTribute, rallyVillage, linkWith,`);
L.push(`offerSystemQuest, pathStep, beginPathWalk, clearBlockage, faceFeastDraw, yieldChallenge, switchboard,`);
L.push(`studyVillageCodex, proveWorth, agencyTurn. doAction kinds (forage/rest/wait/drink) now route to`);
L.push(`categories instead of one bucket.`);
L.push(``);

fs.writeFileSync(OUTMD, L.join('\n'));
fs.writeFileSync(OUTJSON, JSON.stringify(analysis, null, 1));
console.log('wrote ' + OUTMD + ' + ' + OUTJSON);
console.log(`headline: medianDelib/day=${med(rows.map(r => (r.pacing && r.pacing.medianDeliberatePerDay) || 0))} t100=${t100.med} t130=${t130.med} t180=${t180.med} stalls=${stalls.length} hotspots=${hotspots.length} GO=${go.verdict}`);
