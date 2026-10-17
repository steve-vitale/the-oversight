#!/usr/bin/env node
// Journey leg: ESTABLISHMENT (days 14-40) R12 — the haul-contact probe +
// the delegation question (2026-10-17).
//
// r11 (2026-10-17) findings carried in:
//   - BLANK: the carcass->village haul link never fired in 3 seeds
//     (0 haul lines, 0 pantry arrivals; the policy never loots corpses,
//     and the villager HAUL-UNREVEALED objective never got taken).
//     r11's §14b prescription: run the pre-pilot CONTACT PROBE before
//     spending another pilot — does a villager ever take a HAUL objective
//     to a monster corpse? does the meat survive the trip unspoiled?
//   - POLICY GAP: the competent policy never uses assignTask (asg={}
//     empty on all seeds, all weeks) — the leader's core verb goes
//     unexercised, and specialist emergence is never measured through
//     the real channel.
//   - METRIC REVISIONS queued: split K1 (carcass meat -> haul -> reveal),
//     K2 via assignment usage + practice-XP, delegating policy.
//
// THIS RUN (r12):
//   Phase 1 — CONTACT PROBE (§14b, cheap): per-day snapshots of the haul
//     substrate on 2 seeds: remembers (who learned about corpses), memory
//     with meat still on the body, mapmemBestHaul results + the pantry/
//     hunger gate components, HAUL objectives actually taken, unknown-flesh
//     pantry arrivals. Pinpoints WHERE contact dies: no memory / gate
//     closed / offered-but-not-chosen / chosen-but-never-completed.
//   Phase 2 — PILOT (FULL=1): 3 seeds x 40d, competent vs delegate
//     (scripts/policies/delegate.js), K1a/K1b'/K2'/K3/guardrails.
//
// Pre-registered (docs/MEASUREMENT.md §§9-12, 14 — written BEFORE any run):
//   Leg: establishment (days 14-40). Rotation index was 1.
//   Question: (a) does the villager haul-unrevealed path fire when the
//     substrate is staged — where exactly does contact fail? (b) with a
//     delegating policy, do specialists emerge (assignments exercised,
//     practice-XP movement, named specialist roles)?
//   Interesting: probe localizes contact failure to one stage; delegate
//     produces >=1 assignment/week/seed and visible practice-XP or
//     specialist-role movement.
//   Seeds: probe 61, 82; pilot 61, 82, 103 (identical to r10/r11).
//   Horizon: 40 game-days (leg window); death-aware stop (+10d tail max).
//   Policy: competent PINNED + delegate (withDelegate(competent)).
//   Binding metrics:
//     P1 (probe): per-day table showing, for each stage — remembers,
//       sites-with-meat, bestHaul non-null, gate pass, HAUL taken,
//       unknown-flesh arrived — plus the verdict on which stage is empty.
//     K1a: >=50% of monster kills (days 14-40) produce meat entries on
//       the corpse (re-verify; was GO in r11).
//     K1b': >=1 villager haul of unknown flesh to the village per seed
//       (or the probe's verdict explains why not).
//     K2': >=1 assignment per week per seed via assignTask under delegate;
//       practice-XP movement or named specialist-role emergence on >=2
//       seeds; >=1 teaching event per seed.
//     K3: >=6 full transcripts sense-read, 0 senseless flags.
//     Guardrails: 0 starvation deaths; pantry unit atom <=500 kcal;
//       0 villagers eat unrevealed monster meat as ordinary food;
//       wave-2 gate respected (day 8 + wave-1 ledger).
//   Canon read: CANON.md; MONSTER-WAVES.md; CONTESTS.md; PRESERVATION.md;
//     CONVERSATIONS.md; DIRECTIVES.md; MEASUREMENT.md §§8,14,15. No new canon.
//   Metric review: (filled after the run — even if "none — metrics held").
//
// Usage: node scripts/journey-establishment-r12-20261017.js        (probe)
//        FULL=1 node scripts/journey-establishment-r12-20261017.js (pilot)
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVID = '/home/hatch/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-17';
const { loadGame, setupGame, driveFights, driveContests } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { delegate } = require('./policies/delegate');

const FULL = process.env.FULL === '1';
const PROBE_SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [61, 82]);
const PILOT_SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [61, 82, 103]);
const SEEDS = FULL ? PILOT_SEEDS : PROBE_SEEDS;
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
    const fp = `${EVID}/journey-establishment-r12-transcript-${seed}-day${day}-${policy.id}.txt`;
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
  return { seed, policy: policy.id, snaps, remembers, deaths,
           haulPeak, ufPeak, bestHaulPeakDay, assignmentsEver, pantryEnd,
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
  return {
    seed: r.seed, days: win.length,
    rememberMonster: r.remembers.monster, rememberAnimal: r.remembers.animal,
    daysCorpsesWithMeat: daysWith('corpsesWithMeat'),
    daysRememberedWithMeat: daysWith('rememberedWithMeat'),
    daysBestHaul: daysWith('bestHaulHits'),
    daysCandOffered: daysWith('candOffered'),
    daysGatePass: daysWith('gateWouldPass'),
    daysHaulTaken: daysWith('haulTaken'),
    haulPeak: r.haulPeak, ufPeak: r.ufPeak, bestHaulPeakDay: r.bestHaulPeakDay,
    pantryEnd: r.pantryEnd,
  };
}

async function main() {
  const policies = FULL ? [competent, delegate] : [competent];
  const results = [];
  for (const seed of SEEDS) {
    for (const pol of policies) {
      console.log(`--- r12 ${FULL ? 'pilot' : 'probe'} seed=${seed} policy=${pol.id} ---`);
      const r = await runSeed(seed, pol);
      results.push(r);
      console.log(JSON.stringify(probeVerdict(r), null, 1));
      // heartbeat between seeds — this run is long
      try { require('child_process').execSync('bash scripts/worktree-heartbeat.sh journey-establishment', { cwd: ROOT, timeout: 15000 }); } catch (e) {}
    }
  }
  const outPath = path.join(EVID, `journey-establishment-r12-${FULL ? 'pilot' : 'probe'}-${Date.now()}.json`);
  fs.writeFileSync(outPath, JSON.stringify(results.map(r => ({
    seed: r.seed, policy: r.policy, verdict: probeVerdict(r),
    remembers: r.remembers, deaths: r.deaths, haulPeak: r.haulPeak,
    ufPeak: r.ufPeak, assignmentsEver: r.assignmentsEver, pantryEnd: r.pantryEnd,
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
