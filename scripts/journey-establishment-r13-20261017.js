#!/usr/bin/env node
// Journey leg: ESTABLISHMENT (days 14-40) R13 — K1b'' take-rate follow-up
// (2026-10-17). Queue jump from rotation 2 (deepening); rotation stays at 2.
//
// r12 queued this run: "measure the take rate with more seeds or tighten
// offer timing (e.g., the killer's dawn-after-kill prioritization)."
//
// THE FIX (this run, villager-objectives.js): dawn-after-kill
// prioritization — after the body-first gates (rest/eat), a remembered
// corpse killed yesterday/today with unrevealed flesh and a feasible haul
// takes the HAUL objective directly (deterministic, not lottery).
// Proof: scripts/test-haul-takerate-r13-20261017.js (ALL GREEN).
//
// Pre-registered (docs/MEASUREMENT.md §§9-12, 14 — written BEFORE any run,
// in hidden_files/evidence/2026-10-17/journey-establishment-r13-note.md):
//   Seeds: 7, 61, 82, 103, 41, 77 (6 seeds). Horizon: 40 game-days.
//   Policy: competent PINNED + delegate (withDelegate(competent)).
//   Binding metrics:
//     K1b'': take rate = daysHaulTaken / daysCandOffered >= 50% per seed on
//       seeds with >=1 offer; >=1 completed round trip delivering unknown
//       flesh to pantry per seed.
//     K2'': delegate issues >=1 assignment/week/seed; task diversity >=4
//       distinct task types/seed; teaching lines >=1/seed.
//     K3: >=6 full transcripts sense-read, 0 senseless flags.
//     Guardrails: 0 starvation deaths; pantry unit atom <=500 kcal;
//       0 villagers eat unrevealed monster meat as ordinary food;
//       wave-2 gate respected.
// Usage: node scripts/journey-establishment-r13-20261017.js
//        SEEDS=7,61 node scripts/journey-establishment-r13-20261017.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVID = '/home/hatch/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-17';
const { loadGame, setupGame, driveFights, driveContests } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { delegate } = require('./policies/delegate');

const FULL = true; // r13 always runs the full pilot (both policies)
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [7, 61, 82, 103, 41, 77]);
const DAYS = parseInt(process.env.DAYS || '40', 10);

function pantryKcal(Game) {
  try {
    return ((Game.state.village || {}).pantry || [])
      .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  } catch (e) { return 0; }
}
function livingVids(Game) {
  try {
    const v = Game.state.village || {};
    const sid = Game.villagerId;
    return (v.roster || []).filter(id => {
      if (id === sid) return false;
      try { if ((Game.getPerson(id) || {}).dead) return false; } catch (e) {}
      return true;
    });
  } catch (e) { return []; }
}
function havenXY(Game) {
  try { return { hx: (Game.state.village.px ?? 4), hy: (Game.state.village.py ?? 4) }; }
  catch (e) { return { hx: 4, hy: 4 }; }
}
function unknownFleshCount(Game) {
  try {
    return ((Game.state.village || {}).pantry || [])
      .filter(i => i && i.name === 'Unknown flesh')
      .reduce((t, i) => t + (i.units || 1), 0);
  } catch (e) { return 0; }
}

// ---- the contact-probe snapshot: where does the haul pipeline stand today?
function probeSnap(Game) {
  const out = { pantry: Math.round(pantryKcal(Game)), living: livingVids(Game).length };
  const { hx, hy } = havenXY(Game);
  let corpsesWithMeat = 0, rememberedWithMeat = 0, bestHaulHits = 0;
  let candOffered = 0; const candDetail = [];
  let gateWouldPass = 0, haulTaken = 0;
  const vil = [];
  try {
    for (const c of (Game.corpses ? Game.corpses() : [])) {
      if (!c || c.buried) continue;
      let meat = null;
      try { meat = Game.mapmemMeatItem ? Game.mapmemMeatItem(c) : null; } catch (e) {}
      if (meat) corpsesWithMeat++;
    }
  } catch (e) {}
  let os = {};
  try { os = Game.objState ? (Game.objState() || {}) : {}; } catch (e) {}
  for (const vid of livingVids(Game)) {
    let sites = 0, withMeat = 0;
    try {
      const mem = Game.mapmemOf ? Game.mapmemOf(vid) : null;
      const cs = Game.corpses ? Game.corpses() : [];
      for (const s of ((mem || {}).sites || [])) {
        if (!s || s.kind !== 'corpse') continue;
        sites++;
        const c = cs.find(x => x && x.id === s.ref);
        if (c) { try { if (Game.mapmemMeatItem(c)) withMeat++; } catch (e) {} }
      }
    } catch (e) {}
    let bh = null;
    try { bh = Game.mapmemBestHaul ? Game.mapmemBestHaul(vid, hx, hy) : null; } catch (e) {}
    let cand = null, candMid = null, candSafe = null;
    try { cand = Game.mapmemHaulCandidate ? Game.mapmemHaulCandidate(vid, hx, hy) : null; } catch (e) {}
    if (bh) {
      try {
        const cs = Game.corpses ? Game.corpses() : [];
        const c = cs.find(x => x && x.id === bh.ref);
        if (c) {
          candMid = c.monsterId || c.kind || '?';
          candSafe = Game.mapmemFoodKnown ? !!Game.mapmemFoodKnown(c) : null;
        }
      } catch (e) {}
    }
    let hunger = null;
    try { hunger = (Game.npcNeeds ? (Game.npcNeeds(vid) || {}) : {}).hunger || 0; } catch (e) {}
    const o = os[vid] || {};
    const isHaul = o && o.kind === 'HAUL';
    if (withMeat > 0) rememberedWithMeat++;
    if (bh) bestHaulHits++;
    if (cand) { candOffered++; candDetail.push({ v: String(vid).slice(0, 8), mid: candMid, safe: candSafe, estKcal: Math.round(bh.estKcal || 0) }); }
    if (bh && (out.pantry < 5000 || (hunger || 0) > 50)) gateWouldPass++;
    if (isHaul) haulTaken++;
    vil.push({ v: String(vid).slice(0, 8), sites, withMeat, bh: bh ? Math.round(bh.estKcal || 0) : 0, hunger: Math.round(hunger || 0), obj: (o && o.kind) || 'idle' });
  }
  out.corpsesWithMeat = corpsesWithMeat;
  out.rememberedWithMeat = rememberedWithMeat; // villagers having >=1 meat-memory
  out.bestHaulHits = bestHaulHits;             // bestHaul returned a site
  out.candOffered = candOffered;               // NEW predicate offered the candidate
  out.candDetail = candDetail;
  out.gateWouldPass = gateWouldPass;           // OLD famine gate (for comparison)
  out.haulTaken = haulTaken;                   // HAUL objective active now
  out.unknownFlesh = unknownFleshCount(Game);
  out.vil = vil;
  return out;
}

async function runSeed(seed, policy) {
  const { Game } = await loadGame({ seed, mode: 'mvc', fullTelemetry: true });
  await setupGame(Game);
  const ctx = { policyId: policy.id, notes: [] };
  if (policy.setup) { try { await policy.setup(Game, ctx); } catch (e) {} }
  // FULL-pilot narration capture (r8 wrapStream pattern; sim-harness silences say)
  const capLines = [];
  if (FULL) {
    try {
      const _say = Game.say;
      if (typeof _say === 'function') {
        Game.say = function (...a) { try { capLines.push(String(a[0] == null ? '' : a[0])); } catch (e) {} };
      }
      if (typeof Game.sysSay === 'function') {
        Game.sysSay = function (...a) {
          try { capLines.push('📺 SYSTEM: "' + String(a[0] == null ? '' : a[0]).replace(/^📺\s*/, '') + '"'); } catch (e) {}
        };
      }
    } catch (e) {}
  }
  function driveOneConvo(day, vid) {
    const L = [];
    const log = s => L.push(s);
    const tag = (Game.displayName ? Game.displayName(vid) : vid) || vid;
    const fp = `${EVID}/journey-establishment-r13-transcript-${seed}-day${day}-${policy.id}.txt`;
    try {
      const nm = tag, p = (Game.getPerson ? Game.getPerson(vid) : {}) || {};
      log(`=== seed ${seed} day ${day} policy ${policy.id} — conversation with ${nm} (${vid}) ===`);
      log(`occupation=${p.occupation || p.formerOccupation || '?'} temperament=${p.temperament || '?'} trust=${((Game.state.village.trust || {})[vid] ?? '?')} dead=${!!p.dead}`);
      let r = Game.startConvo(vid);
      const c0 = Game.convoGet(vid) || {};
      log(`want: ${((c0.want || {}).id) || 'none'} (stage ${((c0.want || {}).stage) || 0})`);
      log(`OPENING: ${r.line}`);
      log('choices: ' + ((r.choices || []).map(ch => `[${ch.id}] ${String(ch.label || '').slice(0, 90)}`).join(' | ')));
      for (let turn = 0; turn < 8; turn++) {
        let choices = (r.choices && r.choices.length) ? r.choices : [];
        if (!choices.length) { try { choices = Game.convoChoices(vid) || []; } catch (e) {} }
        if (!choices.length) break;
        const wantId = (((Game.convoGet(vid) || {}).want || {}).id) || null;
        let pick = (wantId && choices.find(ch => ch.id === 'want:' + wantId))
          || choices.find(ch => /^want:/.test(ch.id))
          || choices.find(ch => ch.id === 'ask:gossip')
          || choices.find(ch => /gossip/.test(ch.id))
          || choices.find(ch => ch.id !== 'leave');
        if (!pick) { log('YOU: (leave)'); break; }
        log(`YOU: [${pick.id}] ${pick.label}`);
        r = Game.convoTurn(vid, pick.id);
        log(`THEM: ${r.line}`);
        if (r.ended) { log('(ended by engine)'); break; }
      }
      let end = null;
      try { end = Game.endConvo(vid, 'done'); } catch (e) { log('endConvo ERROR: ' + e.message); }
      log('--- END ---');
      if (end && end.line) log('closing: ' + end.line);
    } catch (e) { log('ERROR: ' + e.message); }
    try { fs.writeFileSync(fp, L.join('\n')); } catch (e) {}
    return fp;
  }
  function pickConvoVid() {
    // a villager with a live want if possible, else any living non-scholar
    try {
      const vids = livingVids(Game);
      const sid = Game.villagerId;
      for (const vid of vids) {
        try { if (vid !== sid && ((Game.convoGet(vid) || {}).want || {}).id) return vid; } catch (e) {}
      }
      return vids.find(v => v !== sid) || null;
    } catch (e) { return null; }
  }
  // practice-XP snapshots for specialist emergence (day 14 vs day 40)
  function xpSnap() {
    const out = {};
    try {
      for (const vid of livingVids(Game)) {
        const p = (Game.getPerson ? Game.getPerson(vid) : {}) || {};
        const fx = ((p._src || {}).foodXp) || {};
        out[vid] = {
          occ: p.occupation || p.formerOccupation || '?',
          cook: Game.specialistSkill ? Game.specialistSkill(p, 'cook') : 0,
          preserver: Game.specialistSkill ? Game.specialistSkill(p, 'preserver') : 0,
          butcher: Game.specialistSkill ? Game.specialistSkill(p, 'butcher') : 0,
          foodXp: Object.keys(fx).map(k => k + ':' + fx[k]).join(',') || '-',
        };
      }
    } catch (e) {}
    return out;
  }
  let xp14 = null;
  // r13 instrument: count haul OFFERS (candidate non-null) and TAKES (HAUL
  // chosen) per game-day, at the objPick source. End-of-day snapshots miss
  // transient offers (the dogpile cap hides the candidate once taken), so
  // the take-rate must be measured where the decision happens.
  const offerDays = new Set(), takeDays = new Set();
  const _objPick = Game.objPick ? Game.objPick.bind(Game) : null;
  if (_objPick) {
    Game.objPick = function (vid, hx, hy) {
      const day = (Game.state.scholar || {}).day || 0;
      try {
        const cand = Game.mapmemHaulCandidate ? Game.mapmemHaulCandidate(vid, hx, hy) : null;
        if (cand) offerDays.add(day);
      } catch (e) {}
      const o = _objPick(vid, hx, hy);
      try { if (o && o.kind === 'HAUL') takeDays.add(day); } catch (e) {}
      return o;
    };
  }
  // wrap mapmemRemember to count memory acquisition (probe instrument)
  let remembers = { monster: 0, animal: 0, other: 0 };
  const _mr = Game.mapmemRemember ? Game.mapmemRemember.bind(Game) : null;
  if (_mr) {
    Game.mapmemRemember = function (vid, corpse) {
      try {
        const k = (corpse && corpse.kind) || 'other';
        if (k === 'monster') remembers.monster++;
        else if (k === 'animal') remembers.animal++;
        else remembers.other++;
      } catch (e) {}
      return _mr(vid, corpse);
    };
  }
  const snaps = [];
  let haulPeak = 0, ufPeak = 0, bestHaulPeakDay = null;
  let ufArrivals = 0, ufPrev = 0; // completed round trips: unknown flesh arriving in pantry
  const dayStart = (Game.state.scholar || {}).day || 0;
  for (let d = 1; d <= DAYS; d++) {
    for (let p = 0; p < 3; p++) {
      if (policy.upkeep) { try { policy.upkeep(Game, ctx); } catch (e) {} }
      try { driveFights(Game, policy, ctx); } catch (e) {}
      try { driveContests(Game, policy, ctx); } catch (e) {}
      if (Game.over) break;
      try { Game.doAction('wait'); } catch (e) {}
      try { driveFights(Game, policy, ctx); } catch (e) {}
      try { driveContests(Game, policy, ctx); } catch (e) {}
      if (Game.over) break;
    }
    if (Game.over) break;
    if (policy.daily) { try { policy.daily(Game, ctx); } catch (e) {} }
    try { Game.sleep(); } catch (e) {}
    try { driveContests(Game, policy, ctx); } catch (e) {}
    if (Game.over) break;
    const gd = (Game.state.scholar || {}).day || 0;
    const s = probeSnap(Game);
    s.gday = gd;
    snaps.push(s);
    if (s.haulTaken > haulPeak) haulPeak = s.haulTaken;
    if (s.unknownFlesh > ufPeak) ufPeak = s.unknownFlesh;
    if (s.unknownFlesh > ufPrev) ufArrivals++; // pantry gained unknown flesh: a round trip completed
    ufPrev = s.unknownFlesh;
    if (s.bestHaulHits > 0 && bestHaulPeakDay === null) bestHaulPeakDay = gd;
    if (FULL && gd === 14 && !xp14) xp14 = xpSnap();
    if (FULL && (gd === 20 || gd === 35)) {
      const cv = pickConvoVid();
      if (cv) { try { driveOneConvo(gd, cv); } catch (e) {} }
    }
    // death-aware: stop if the village is gone (+10d tail)
    const liv = livingVids(Game).length;
    if (liv === 0) { ctx._deadTail = (ctx._deadTail || 0) + 1; if (ctx._deadTail >= 10) break; }
    else ctx._deadTail = 0;
  }
  // final census bits
  const deaths = [];
  try {
    for (const t of (Game.state.telemetry || [])) {
      if (t && t.type === 'death') deaths.push({ day: t.day, who: t.who, cause: t.cause, kind: t.kind });
    }
  } catch (e) {}
  let assignmentsEver = 0, assignmentsPeak = 0;
  try {
    // assignments are per-part; the ctx counter from delegate tracks issues
    assignmentsEver = ctx.delegated || 0;
  } catch (e) {}
  const pantryEnd = Math.round(pantryKcal(Game));
  // FULL-pilot line census: teaching, contests, haul, experiment beats
  let lineCounts = null;
  if (FULL) {
    const c = (re) => capLines.filter(l => re.test(l)).length;
    lineCounts = {
      lines: capLines.length,
      taught: c(/taught/i),
      contest: c(/contest|challenge|OVERSIGHT/i),
      pilot: c(/pilot episode/i),
      haul: c(/hauls? .*flesh|unknown flesh|brings? .*meat/i),
      experiment: c(/experiment|test.*flesh|tastes? the/i),
      promise_kept: c(/kept your word/i),
      promise_broken: c(/promises rot/i),
      assign: c(/assign|delegation|task/i),
    };
  }
  const xp40 = FULL ? xpSnap() : null;
  // task diversity: distinct delegated task types (K2'')
  const taskTypes = [];
  try {
    for (const k of Object.keys(ctx)) {
      if (k.indexOf('delegated_') === 0 && ctx[k] > 0) taskTypes.push(k.slice(10));
    }
  } catch (e) {}
  return { seed, policy: policy.id, snaps, remembers, deaths,
           haulPeak, ufPeak, ufArrivals, bestHaulPeakDay, assignmentsEver, pantryEnd,
           taskTypes,
           offerDays: Array.from(offerDays), takeDays: Array.from(takeDays),
           gameDays: (Game.state.scholar || {}).day || 0, over: !!Game.over,
           lineCounts, xp14, xp40, ctxCounts: { delegated: ctx.delegated || 0,
             delegateRefused: ctx.delegateRefused || 0 } };
}

function probeVerdict(r) {
  // aggregate the pipeline stages over days 14-40
  const win = r.snaps.filter(s => s.gday >= 14);
  const days = win.length || 1;
  const agg = (k) => win.reduce((t, s) => t + (s[k] || 0), 0);
  const daysWith = (k) => win.filter(s => (s[k] || 0) > 0).length;
  // K1b'': take rate from the objPick instrument (offers/takes at the source,
  // restricted to the leg window days 14-40). End-of-day snapshots miss
  // transient offers, so the instrument is the binding measure.
  const winDays = new Set(win.map(s => s.gday));
  const offered = (r.offerDays || []).filter(d => winDays.has(d)).length;
  const taken = (r.takeDays || []).filter(d => winDays.has(d)).length;
  return {
    seed: r.seed, policy: r.policy, days: win.length,
    rememberMonster: r.remembers.monster, rememberAnimal: r.remembers.animal,
    daysCorpsesWithMeat: daysWith('corpsesWithMeat'),
    daysRememberedWithMeat: daysWith('rememberedWithMeat'),
    daysBestHaul: daysWith('bestHaulHits'),
    daysCandOffered: offered,
    daysHaulTaken: taken,
    // K1b'': take rate + completed round trips
    takeRate: offered > 0 ? (taken / offered).toFixed(2) : 'n/a',
    takeRateGO: offered === 0 ? 'n/a (no offers)' : (taken / offered >= 0.5 ? 'GO' : 'NO-GO'),
    ufArrivals: r.ufArrivals,
    ufArrivalsGO: r.ufArrivals >= 1 ? 'GO' : 'NO-GO',
    haulPeak: r.haulPeak, ufPeak: r.ufPeak, bestHaulPeakDay: r.bestHaulPeakDay,
    // K2'': delegate volume + diversity + teaching
    assignments: r.assignmentsEver,
    assignPerWeek: (r.assignmentsEver / Math.max(1, win.length / 7)).toFixed(1),
    taskTypes: r.taskTypes, taskDiversity: r.taskTypes.length,
    taskDiversityGO: r.taskTypes.length >= 4 ? 'GO' : 'NO-GO',
    taught: r.lineCounts ? r.lineCounts.taught : null,
    taughtGO: r.lineCounts && r.lineCounts.taught >= 1 ? 'GO' : 'NO-GO',
    pantryEnd: r.pantryEnd,
    gameDays: r.gameDays, over: r.over,
  };
}

async function main() {
  const policies = [competent, delegate];
  const results = [];
  for (const seed of SEEDS) {
    for (const pol of policies) {
      console.log(`--- r13 pilot seed=${seed} policy=${pol.id} ---`);
      const r = await runSeed(seed, pol);
      results.push(r);
      console.log(JSON.stringify(probeVerdict(r), null, 1));
      // heartbeat between seeds — this run is long
      try { require('child_process').execSync('bash scripts/worktree-heartbeat.sh journey-establishment', { cwd: ROOT, timeout: 15000 }); } catch (e) {}
    }
  }
  const outPath = path.join(EVID, `journey-establishment-r13-pilot-${Date.now()}.json`);
  fs.writeFileSync(outPath, JSON.stringify(results.map(r => ({
    seed: r.seed, policy: r.policy, verdict: probeVerdict(r),
    remembers: r.remembers, deaths: r.deaths, haulPeak: r.haulPeak,
    ufPeak: r.ufPeak, ufArrivals: r.ufArrivals, assignmentsEver: r.assignmentsEver,
    taskTypes: r.taskTypes, pantryEnd: r.pantryEnd,
    gameDays: r.gameDays, over: r.over,
    lineCounts: r.lineCounts, xp14: r.xp14, xp40: r.xp40, ctxCounts: r.ctxCounts,
    snaps: r.snaps.map(s => ({ gday: s.gday, pantry: s.pantry, living: s.living,
      corpsesWithMeat: s.corpsesWithMeat, rememberedWithMeat: s.rememberedWithMeat,
      bestHaulHits: s.bestHaulHits, candOffered: s.candOffered, candDetail: s.candDetail,
      gateWouldPass: s.gateWouldPass,
      haulTaken: s.haulTaken, unknownFlesh: s.unknownFlesh })),
  })), null, 1));
  console.log('wrote ' + outPath);
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
