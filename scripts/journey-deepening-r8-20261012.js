#!/usr/bin/env node
// journey-deepening-r8-20261012.js — DEEPENING leg R8: SICKNESS IN THE DEEPENING LEG.
//
// R7 covered the knowledge economy + wave pacing. R8 asks the disease questions
// nobody has asked in a journey leg (canon: docs/DISEASES.md — read before
// touching; no canon changes expected):
//
// HONEST (competent + treatment-seeking policy, days 1->110):
//   H1. How often does sickness touch a competent village? Which mundane
//       diseases, via which vectors (wounds from wave-1/2 fights, ambient
//       ticks, water, food)?
//   H2. Does the diagnosis -> cure chain close in played runs? (treatment-seeking
//       policy: examine, pills/training, ruin medicine runs.)
//   H3. Do the alien vectors ever fire naturally — giant mosquito / alien tick
//       monster fights, bites, eurika/east_nile/lemons?
//   H4. Do monster-meat quirks (howlbelly etc.) ever fire naturally?
//   H5. Villager sickness (light sim): incidence, deaths, narration sense.
//   H6. People check: full transcripts incl. sick villagers — do NPCs talk
//       about sickness like people?
//
// PROBE (PROBE_SICK=1, at day 30 — post-bite/post-exposure PIPELINE measurement;
//   the bite mechanics themselves (mosquito dive/drink/heavy, tick latch) were
//   proven by break-it combat r8; the probe measures what happens after):
//   P1. Alien virus: mosquitoBiteVirus() -> symptom-only text (no name leak),
//       diagnoseDisease REFUSES ("no earthly diagnosis"), cureStatus REFUSES
//       (two pools), permanence.
//   P2. Mundane: contractDisease(gutrot) -> examineSick -> diagnose names it ->
//       treatDisease tier works.
//   P3. Monster-meat weirdness: maybeMonsterWeirdness honest rolls until it
//       fires -> onset text, codex memory, witness_maw trust effect.
//
// Method: full games day 1->110 via sim-harness runDays. treatment_seeking
// policy (competent + seeks treatment when sick). Text capture ON. Village
// census + death causes at end. Conversations on days 45/65/85, sense-read.
//
// Usage: SEEDS=71001,71002 DAYCAP=110 node scripts/journey-deepening-r8-20261012.js
//        PROBE_SICK=1 SEEDS=71001 node scripts/journey-deepening-r8-20261012.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [71001, 71002, 71003, 71004, 71005, 71006]);
const DAYCAP = parseInt(process.env.DAYCAP || '110', 10);
const PROBE_SICK = process.env.PROBE_SICK === '1';

const { mulberry32, loadGame, setupGame, runDays, driveFights, driveContests } = require('./sim-harness');
const { treatment_seeking } = require('./policies/treatment-seeking');
const { competent } = require('./policies/competent');

const EVIDIR = path.join(ROOT, 'evidence', '2026-10-12');

// ---- per-seed globals (reset per seed) ----
let capture = [];
let _currentSeed = null;
let _G = null;
function cap(line) {
  if (line == null) return;
  const s = String(line);
  if (capture.length && capture[capture.length - 1] === s) return;
  capture.push(s);
}

function gday() { try { return (_G.state.scholar || {}).day || 0; } catch (e) { return 0; } }
function person(id) { try { return _G.getPerson(id); } catch (e) { return { dead: true }; } }
function vname(id) { try { const p = person(id); return (p.name || String(id)).split(' ')[0]; } catch (e) { return String(id); } }
function popAlive() {
  try { return (_G.state.village.roster || []).filter(id => !person(id).dead).length; } catch (e) { return null; }
}
function pantryKcal() {
  try { return ((_G.state.village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0); } catch (e) { return 0; }
}
function scholarStatuses() {
  try {
    const list = _G.seList ? _G.seList('scholar') : [];
    return list.map(e => ({ id: e.id, diagnosed: !!(_G.isDiagnosed && _G.isDiagnosed('scholar', e.id)) }));
  } catch (e) { return []; }
}
function villageSick() {
  try {
    const sick = (_G.state.village || {}).sick || {};
    return Object.keys(sick).map(vid => ({ vid, name: vname(vid), rec: sick[vid] && sick[vid].name, days: sick[vid] && sick[vid].days }));
  } catch (e) { return []; }
}

// disease marker scan over captured text (r7 pattern)
const DZ_MARKERS = {
  tick_attach: ['tick', 'unwelcome passenger', 'latched'],
  mosquito_fight: ['whine', 'proboscis', 'size of your thumb'],
  diagnosis: ['diagnos', 'true name', 'no earthly diagnosis'],
  treatment: ['treat', 'poultice', 'antibiotics', 'antiparasitic', 'bitter tea'],
  alien_symptom: ['howl', 'ribbit', 'clank', 'black tears', 'quack', 'static', 'fever dreams', 'ringed'],
  sickness_talk: ['sick', 'fever', 'wound', 'infected', 'healer', 'medicine'],
};

// ---- the sickness probe (PROBE_SICK=1, day 50) ----
function runSickProbe(ctx) {
  const G = _G;
  const L = [];
  const log = s => L.push(s);
  if (G.over) { log('probe skipped: game over'); ctx.probeLog = L; ctx.probed = true; return; }
  log(`=== SICKNESS PROBE day ${gday()} ===`);
  try {
    // P1: alien virus via the honest post-bite path (mosquitoBiteVirus does the
    // 50/50 virus assignment per landed bite).
    const b0 = capture.length;
    const virus = G.mosquitoBiteVirus();
    log(`P1 mosquitoBiteVirus() -> ${virus}; hasStatus=${G.hasStatus('scholar', virus)}`);
    const newText = capture.slice(b0).join('\n').toLowerCase();
    const leaks = ['eurika', 'east nile', 'east_nile'].filter(w => newText.includes(w));
    log(`P1 name-leak in apply text: ${leaks.length ? 'RED: ' + leaks.join(',') : 'none (symptom-only, honest)'}`);
    log(`P1 apply text: ${(capture.slice(b0).join(' | ') || '').slice(0, 220)}`);
    // P1b: diagnosis must REFUSE alien biology.
    const b1 = capture.length;
    let dres = null;
    try { dres = G.diagnoseDisease('scholar', virus, {}); } catch (e) { dres = 'threw: ' + e.message; }
    log(`P1b diagnoseDisease(${virus}) -> ${JSON.stringify(dres)}; text: ${(capture.slice(b1).join(' | ') || '').slice(0, 160)}`);
    // P1c: mundane cure must REFUSE alien biology (two pools).
    let cres = null;
    try { cres = G.cureStatus('scholar', virus, 'herbal_remedy'); } catch (e) { cres = 'threw: ' + e.message; }
    log(`P1c cureStatus(${virus}, herbal_remedy) -> ${JSON.stringify(cres)}; still held: ${G.hasStatus('scholar', virus)}`);
    // P1d: lemons via honest apply path (the 50%/latch roll lives in tbTickTurn).
    const b2 = capture.length;
    G.applyStatus('scholar', 'lemons', { source: "the tick's bite (probe)" });
    log(`P1d lemons apply: ${(capture.slice(b2).join(' | ') || '').slice(0, 220)}`);
    log(`P1d lemons held: ${G.hasStatus('scholar', 'lemons')}`);
    // P2: mundane chain — contract -> examine -> diagnose names -> treat cures.
    const b3 = capture.length;
    G.contractDisease('gutrot', { source: 'risky creek water (probe)' });
    const sick1 = (G.sickDiseases ? G.sickDiseases() : []).map(e => e.id);
    log(`P2 contractDisease(gutrot): sick=[${sick1.join(',')}]`);
    let diagOk = false, diagText = '';
    try { if (G.examineSick) G.examineSick(); } catch (e) { log('P2 examineSick threw: ' + e.message); }
    try { diagOk = !!G.isDiagnosed('scholar', 'gutrot'); } catch (e) {}
    diagText = (capture.slice(b3).join(' | ') || '').slice(0, 320);
    log(`P2 examineSick -> isDiagnosed(gutrot)=${diagOk}`);
    log(`P2 diagnosis text: ${diagText}`);
    let cured = 'n/a', treatNote = '';
    const sickNow = (G.sickDiseases ? G.sickDiseases() : []).map(e => e.id);
    if (sickNow.includes('gutrot')) {
      if (G.hasAbility && G.hasAbility('herbal_remedy') && G.treatDisease) {
        try { G.treatDisease('herbal_remedy'); treatNote = 'treatDisease(herbal_remedy)'; }
        catch (e) { treatNote = 'threw: ' + e.message; }
      } else if (G.useMedicine) {
        treatNote = 'no herbal_remedy; trying useMedicine path skipped (no pills expected)';
      } else treatNote = 'no treatment ability available';
      const sickAfter = (G.sickDiseases ? G.sickDiseases() : []).map(e => e.id);
      cured = String(!sickAfter.includes('gutrot'));
      log(`P2 ${treatNote} -> cured=${cured}; remaining=[${sickAfter.join(',')}]`);
    } else log('P2 gutrot already gone (expired or policy treated)');
    // P3: monster-meat weirdness — honest rolls until it fires (20%/cooked).
    let weird = false, rolls = 0;
    for (; rolls < 30 && !G.hasStatus('scholar', 'howlbelly'); rolls++) {
      try { if (G.maybeMonsterWeirdness({ plantId: 'meat_hushwolf', name: 'hushwolf meat', foodState: 'cooked' })) { weird = true; break; } } catch (e) { break; }
    }
    log(`P3 maybeMonsterWeirdness(hushwolf,cooked): fired=${weird} after ${rolls + 1} honest rolls; hasStatus(howlbelly)=${G.hasStatus('scholar', 'howlbelly')}`);
    try {
      const me = ((G.state.codex || {}).monsters || {}).hushwolf || {};
      log(`P3 codex.monsters.hushwolf.meatDisease=${me.meatDisease || 'none'}`);
    } catch (e) {}
  } catch (e) { log('PROBE ERROR: ' + (e && e.stack || e)); }
  ctx.probeLog = L;
  ctx.probed = true;
}

// ---- policy ----
const CONVO_DAYS = [45, 65, 85];
function makePolicy() {
  const policy = Object.create(treatment_seeking);
  policy.id = 'journey-deepening-r8';
  policy.setup = function (G, ctx) {
    treatment_seeking.setup(G, ctx);
    policy._ctx = ctx;
    ctx.dzEvents = [];       // every applyStatus: {day, scope, target, id, pool, source}
    ctx.diagEvents = [];     // diagnoseDisease calls
    ctx.cureEvents = [];     // cureStatus / easeDisease calls
    ctx.contractEvents = []; // contractDisease calls (mundane path)
    ctx.dzChecks = [];       // day checkpoints
    ctx.fightMonsters = [];  // monster ids seen at fight starts
    ctx.convoFiles = [];
    ctx.probed = false;
    const poolOf = (id) => { try { const d = G.seDef(id); return (d && d.pool) || '?'; } catch (e) { return '?'; } };
    try {
      const _ap = G.applyStatus;
      G.applyStatus = function (scope, id, opts) {
        try {
          let tgt = '?';
          if (scope === 'scholar') tgt = 'player';
          else if (opts && opts.vid) tgt = 'villager:' + opts.vid;
          else if (typeof scope === 'object' && scope) tgt = 'villager:' + ((scope.name || '?').split(' ')[0]);
          ctx.dzEvents.push({ day: gday(), scope: String(scope), target: tgt, id: String(id), pool: poolOf(id), source: (opts && opts.source) || '' });
        } catch (e) {}
        return _ap.apply(this, arguments);
      };
    } catch (e) {}
    try {
      const _dg = G.diagnoseDisease;
      G.diagnoseDisease = function (target, id, opts) {
        const r = _dg.apply(this, arguments);
        try { ctx.diagEvents.push({ day: gday(), id: String(id), ret: JSON.stringify(r).slice(0, 80) }); } catch (e) {}
        return r;
      };
    } catch (e) {}
    try {
      const _cu = G.cureStatus;
      G.cureStatus = function (target, id, source) {
        const r = _cu.apply(this, arguments);
        try { ctx.cureEvents.push({ day: gday(), kind: 'cure', id: String(id), ret: JSON.stringify(r).slice(0, 80) }); } catch (e) {}
        return r;
      };
    } catch (e) {}
    try {
      const _ea = G.easeDisease;
      if (typeof _ea === 'function') {
        G.easeDisease = function (target, id, parts, source) {
          const r = _ea.apply(this, arguments);
          try { ctx.cureEvents.push({ day: gday(), kind: 'ease', id: String(id), ret: JSON.stringify(r).slice(0, 80) }); } catch (e) {}
          return r;
        };
      }
    } catch (e) {}
    try {
      const _cd = G.contractDisease;
      if (typeof _cd === 'function') {
        G.contractDisease = function (id, opts) {
          try { ctx.contractEvents.push({ day: gday(), id: String(id), source: (opts && opts.source) || '' }); } catch (e) {}
          return _cd.apply(this, arguments);
        };
      }
    } catch (e) {}
  };
  policy.upkeep = function (G, ctx) {
    try { treatment_seeking.upkeep(G, ctx); } catch (e) {}
  };
  policy.daily = function (G, ctx) {
    try { treatment_seeking.daily(G, ctx); } catch (e) {}
    const gd = gday();
    // record vector-fight monsters at fight starts (policy.fight sees tbfight)
    if (PROBE_SICK && !ctx.probed && gd >= 30) runSickProbe(ctx);
    if ([40, 60, 80, 100, 110].includes(gd)) {
      ctx.dzChecks.push({
        day: gd, pop: popAlive(), pantry: pantryKcal(),
        scholar: scholarStatuses(),
        villageSick: villageSick(),
      });
    }
    if (CONVO_DAYS.includes(gd)) {
      let vid = null;
      try {
        // prefer a SICK villager for the people check — sickness talk is the question
        const sickVids = Object.keys((_G.state.village || {}).sick || {}).filter(id => !person(id).dead);
        if (sickVids.length) vid = sickVids[0];
        else {
          const roster = (_G.state.village.roster || []).filter(id => id !== _G.villagerId);
          for (const id of roster) {
            if (person(id).dead) continue;
            try { const comm = _G.npcComm ? _G.npcComm(id) : { level: 'full' }; if (comm.level === 'none') continue; } catch (e) {}
            let cnt = -1;
            try { const c0 = _G.convoGet(id); cnt = (c0 && c0.count) || 0; } catch (e) {}
            if (cnt < 2) { vid = id; break; }
          }
          if (!vid && roster.length) vid = roster.find(id => !person(id).dead) || null;
        }
      } catch (e) {}
      if (vid) { try { ctx.convoFiles.push(runConversation(gd, vid)); } catch (e) {} }
    }
  };
  // record monsters at fight start (vector-fight census), then delegate to
  // competent's real fight driver (treatment_seeking.fight = competent.fight)
  policy.fight = function (G, ctx) {
    try {
      const f = G.tbfight;
      if (f && f.id && !(ctx._seenFights || {})[f.id]) {
        ctx._seenFights = ctx._seenFights || {};
        ctx._seenFights[f.id] = true;
        const mons = (f.fighters || []).filter(x => x.kind === 'monster').map(x => (x.mdef || {}).id || x.id || '?');
        if (mons.length) ctx.fightMonsters.push({ day: gday(), monsters: mons });
      }
    } catch (e) {}
    try { return competent.fight(G, ctx); } catch (e) { return false; }
  };
  return policy;
}

// ---- conversation driver (r7's engage-first, 8 turns) ----
const ENGAGE = ['dlg:help', 'dlg:commit', 'dlg:heed', 'dlg:stay', 'dlg:comfort', 'dlg:empathize', 'dlg:more', 'dlg:details', 'dlg:askwhy',
  'gq:open:take', 'gq:open:unsure', 'agency:ask_field', 'alive:want:share_news', 'alive:want:ask_favor', 'alive:want:warn_you', 'alive:want:seek_comfort', 'alive:want:curious'];
const ENGAGE2 = ['goon', 'ask:gossip', 'ask:lately', 'ask:personal', 'alive:event:mourning', 'ask:fears', 'ask:you', 'teach'];
const DEFLECT = ['dlg:cant', 'gq:open:honest_pass'];
function pickChoice(choices, turn) {
  const list = choices || [];
  for (const id of ENGAGE) { const c = list.find(x => x && x.id === id); if (c) return c; }
  const ans = list.find(x => x && x.id && x.id.indexOf('ans:') === 0 && x.id.indexOf('honest_pass') === -1);
  if (ans) return ans;
  for (const id of ENGAGE2) { const c = list.find(x => x && x.id === id); if (c) return c; }
  for (const id of DEFLECT) { const c = list.find(x => x && x.id === id); if (c) return c; }
  const react = list.find(x => x && x.id === 'dlg:react');
  if (react && turn < 6) return react;
  return list.find(x => x && x.id === 'leave') || null;
}
function runConversation(day, vid) {
  const fp = `/tmp/journey-deep-r8-transcript-${_currentSeed}-day${day}.txt`;
  const L = [];
  const log = (s) => L.push(s);
  try {
    const nm = vname(vid);
    const p = person(vid);
    const sickRec = ((_G.state.village || {}).sick || {})[vid];
    const r0 = _G.startConvo(vid);
    const c = _G.convoGet(vid);
    const want = (c && c.want) || {};
    log(`=== seed ${_currentSeed} day ${day} — conversation with ${nm} (${vid}) ===`);
    let pmood = '?';
    try { pmood = _G.npcMood ? _G.npcMood(vid) : '?'; } catch (e) {}
    log(`occupation=${p.formerOccupation || p.occupation || '?'} temperament=${(p.personality && p.personality.temperament) || p.temperament || '?'} trust=${((_G.state.village.trust || {})[vid] ?? '?')} dead=${!!p.dead} mood=${pmood} sick=${sickRec ? sickRec.name : 'no'}`);
    log(`want: ${want.id || 'none'} (stage ${want.stage || 0}${want.fromSeed ? ', fromSeed' : ''})`);
    log('');
    log(`THEM: ${r0.line || '(no line)'}`);
    let r = r0;
    for (let turn = 0; turn < 8; turn++) {
      let choices = (r.choices && r.choices.length) ? r.choices : null;
      if (!choices) { try { choices = _G.convoChoices(vid); } catch (e) { choices = []; } }
      const pick = pickChoice(choices, turn);
      if (!pick || pick.id === 'leave') { log('YOU: (leave)'); break; }
      log(`YOU: [${pick.id}] ${pick.label}`);
      r = _G.convoTurn(vid, pick.id);
      if (r.line) log(`THEM: ${r.line}`);
      const w = (_G.convoGet(vid).want) || {};
      log(`(want=${w.id || 'none'} stage=${w.stage || 0})`);
      if (r.ended) { log('(ended by engine)'); break; }
    }
    let endR = null;
    try { endR = _G.endConvo(vid, 'left'); } catch (e) { log('endConvo ERROR: ' + (e && e.message)); }
    if (endR && endR.line) log(`closing line: ${endR.line}`);
    const c2 = _G.convoGet(vid);
    const w2 = (c2 && c2.want) || {};
    log(`want final: id=${w2.id || 'none'} stage=${w2.stage || 0} resolution=${w2.resolution || 'none'}`);
    const t = (c2 && c2.transcript) || [];
    const themLines = t.filter(e => e.who === 'them').map(e => String(e.text));
    const dupes = themLines.filter((x, i) => themLines.indexOf(x) !== i);
    if (dupes.length) log(`!! VERBATIM REPEATS: ${dupes.slice(0, 3).join(' || ').slice(0, 240)}`);
  } catch (e) {
    log('CONVO ERROR: ' + (e && e.stack || e));
  }
  let out = L.join('\n');
  if (out.length > 200 * 1024) out = out.slice(0, 200 * 1024) + '\n[TRUNCATED at 200KB]';
  fs.writeFileSync(fp, out);
  return fp;
}

// ---- census ----
function deathsSoFar() {
  try { return (_G.state.telemetry || []).filter(e => e && e.type === 'death'); } catch (e) { return []; }
}
function buildCensus() {
  const roster = (_G.state.village && _G.state.village.roster) || [];
  const trust = (_G.state.village && _G.state.village.trust) || {};
  return roster.map(id => {
    const p = person(id);
    let plants = 0;
    try { plants = (_G.plantsKnownBy(id) || []).length; } catch (e) {}
    let mood = null;
    try { mood = _G.npcMood ? _G.npcMood(id) : null; } catch (e) {}
    return {
      id, name: vname(id), alive: !p.dead,
      occupation: p.formerOccupation || p.occupation || null,
      temperament: (p.personality && p.personality.temperament) || p.temperament || null,
      trust: (trust[id] !== undefined) ? trust[id] : null,
      mood, plantsKnown: plants,
    };
  });
}

async function runSeed(seed) {
  _currentSeed = seed;
  capture = [];
  console.log(`\n########## SEED ${seed} (PROBE_SICK=${PROBE_SICK}) ##########`);
  const { Game } = await loadGame({ seed, mode: 'journey-deepening-r8', fullTelemetry: true });
  _G = Game;
  const _say = Game.say, _sys = Game.sysSay, _emit = Game.emit;
  Game.say = function (...a) { cap(a[0]); try { return _say.apply(this, a); } catch (e) { return a[0]; } };
  Game.sysSay = function (...a) { cap(a[0]); try { return _sys.apply(this, a); } catch (e) { return a[0]; } };
  if (typeof _emit === 'function') {
    Game.emit = function (...a) { cap(a[0]); try { return _emit.apply(this, a); } catch (e) { return a[0]; } };
  }
  await setupGame(Game);
  const policy = makePolicy();
  const result = await runDays(Game, policy, { days: DAYCAP, manifest: { seed, mode: 'journey-deepening-r8', date: new Date().toISOString().slice(0, 10), node: process.version, probe: PROBE_SICK } });
  const ctx = policy._ctx || {};
  // disease marker scan over captured text
  const capText = capture.join('\n');
  const dzCounts = {};
  for (const [k, marks] of Object.entries(DZ_MARKERS)) {
    dzCounts[k] = 0;
    for (const mk of marks) {
      let ix = 0, n = 0;
      const low = capText.toLowerCase(), mkl = mk.toLowerCase();
      while ((ix = low.indexOf(mkl, ix)) >= 0) { n++; ix += mkl.length; }
      dzCounts[k] += n;
    }
  }
  // alien name-leak audit: alien disease true names should NEVER appear in
  // say/sysSay text (symptom-only law). Mundane names may appear post-diagnosis.
  const alienNames = { eurika: 'eurika', east_nile: 'east nile', lemons: 'lemons', howlbelly: 'howlbelly', gristlefit: 'gristlefit', croakbelly: 'croakbelly', shellgut: 'shellgut', witness_maw: 'witness maw', flockmind: 'flockmind' };
  const low = capText.toLowerCase();
  const alienLeaks = {};
  for (const [id, nm] of Object.entries(alienNames)) {
    let ix = 0, n = 0;
    while ((ix = low.indexOf(nm, ix)) >= 0) { n++; ix += nm.length; }
    if (n) alienLeaks[id] = n;
  }
  // vector fights naturally: giant_mosquito / alien_tick in fightMonsters
  const vectorFights = (ctx.fightMonsters || []).filter(f => f.monsters.some(m => m === 'giant_mosquito' || m === 'alien_tick'));
  const out = {
    seed, probe: PROBE_SICK, maxGameDay: result.gameDays, endReason: result.endReason,
    probed: !!ctx.probed, probeLog: ctx.probeLog || null,
    dzEvents: ctx.dzEvents || [],
    diagEvents: ctx.diagEvents || [],
    cureEvents: ctx.cureEvents || [],
    contractEvents: ctx.contractEvents || [],
    dzChecks: ctx.dzChecks || [],
    dzCounts, alienLeaks,
    fightMonsters: ctx.fightMonsters || [],
    vectorFights,
    census: buildCensus(),
    deaths: deathsSoFar().map(d => ({ day: d.day, who: d.who, cause: d.cause, kind: d.kind })),
    convoFiles: ctx.convoFiles || [],
    pacing: result.pacing,
    ms: result.ms,
  };
  const fp = path.join(EVIDIR, `journey-deepening-r8-${seed}.json`);
  fs.writeFileSync(fp, JSON.stringify(out, null, 1));
  const ndz = (ctx.dzEvents || []).length;
  console.log(`SEED ${seed} DONE: day=${result.gameDays} end=${result.endReason} dzEvents=${ndz} diag=${(ctx.diagEvents || []).length} vectorFights=${vectorFights.length} pop=${popAlive()} ms=${result.ms} -> ${fp}`);
  return out;
}

async function main() {
  const summary = [];
  for (const seed of SEEDS) {
    try { summary.push(await runSeed(seed)); }
    catch (e) { console.log(`SEED ${seed} FATAL: ` + (e && e.stack || e)); summary.push({ seed, fatal: String(e && e.message || e) }); }
  }
  console.log('\n########## ALL SEEDS COMPLETE ##########');
  for (const s of summary) {
    console.log(`seed ${s.seed}: day=${s.maxGameDay} end=${s.endReason} dz=${(s.dzEvents || []).length} diag=${(s.diagEvents || []).length} vfights=${(s.vectorFights || []).length} pop=${(s.census || []).filter(c => c.alive).length}/${(s.census || []).length}${s.fatal ? ' FATAL: ' + s.fatal : ''}`);
  }
}
main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
