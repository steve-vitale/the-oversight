#!/usr/bin/env node
// scripts/test-beatidentity-20261019.js — beat-identity proof (RED->GREEN).
//
// Two filed narration/sense blanks (sim-findings.md, both 2026-10-13):
//   (1) devotion beat: the surge-arming line slotted only the item NAME into
//       a fixed string — Contract Quill, Mixtape, Hard Candy, Grandma's Tin
//       Cup read word-identical. Fix: thread the item's `memory` (the
//       holder's lived story of THIS object) into both arming lanes, so the
//       beat knows which item it holds.
//   (2) pantry-spoil mutter: the full teaching fired byte-identical from a
//       different named speaker every day (Walt d16, Nina d17, Jesse d21,
//       Caleb d76, seed 22); the condensed mutters were anonymous
//       ("Someone"). Fix: the mutter names a real villager chosen
//       deterministically by DAY (no RNG draws — det-gate safe), variant
//       keeps rotating on the per-run counter. The once-per-run teaching and
//       condensed repeats are unchanged.
//
// PART 0 (RED characterization, pre-fix tree pinned via BEATIDENTITY_BASE):
//   the blanks exist on the base.
// PART A (GREEN fixtures on the fixed tree): identity-aware devotion lines;
//   speaker/day-varied mutters; old prosefix invariants preserved.
// PART B (sense read): prints the actual lines for human judgment.
//
// Usage: node scripts/test-beatidentity-20261019.js [--red-only]
// Exit 0 only when every applicable part passes.
'use strict';
const { execSync } = require('child_process');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, quietLog } = require('./sim-harness');

const RED_ONLY = process.argv.includes('--red-only');
let fails = [];
function ok(cond, name, extra) {
  console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${extra ? ' — ' + extra : ''}`);
  if (!cond) fails.push(name);
}
function headFile(p) {
  // RED characterization pins the PRE-fix base (f53227a4, the tree this work
  // started from) — not HEAD, which carries the fix after commit.
  const ref = process.env.BEATIDENTITY_BASE || 'f53227a4dd08eab1750434e89de5104b4bba74ba';
  return execSync(`git -C "${ROOT}" show ${ref}:${p}`, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
}

// ---------------- PART 0: RED characterization (pre-fix tree) ----------------
function part0() {
  console.log('== PART 0: RED characterization (pre-fix blanks) ==');
  const progHead = headFile('src/js/progression.js');
  const foodHead = headFile('src/js/food.js');
  // (1) devotion line: name-only slot, verbatim across items.
  ok(/Your gifts are not mastered — but they are lived-in, worn smooth by use, and they are with you\. The feast was the weapon/.test(progHead),
    'RED-1: base devotion line slots only ${name} (verbatim across items)');
  ok(!/def\.memory/.test(progHead.split('channelSentiment')[1] || ''),
    'RED-1: base channelSentiment never reads the item memory');
  // (2) spoil mutter: anonymous "Someone" rotation.
  ok(/Someone mutters about the smoke rack going cold/.test(foodHead),
    'RED-2: base spoil mutters are anonymous ("Someone")');
  ok(!/_spoilMutterSpeaker/.test(foodHead),
    'RED-2: base food.js has no speaker/day mutterer');
}

// The four items from the finding, with a distinctive memory phrase each.
const ITEMS = [
  ['tin_cup', "Grandma's Tin Cup", 'poured a finger'],
  ['contract_quill', 'Contract Quill', 'terrible contract'],
  ['mixtape', 'Mixtape', 'FOR THE DRIVE'],
  ['hard_candy', 'Hard Candy', 'brave dentist'],
];

async function channelAs(Game, itemId, name, lane) {
  const s = Game.state.scholar;
  const pg = Game.progState();
  pg.sentimentTaught = true;
  s.trauma = 0;
  pg.surgeResonance = 35;
  if (lane === 'devotion') {
    s.abilities = [
      { id: 'a1', name: 'Gift One', level: 1, xp: 0 },
      { id: 'a2', name: 'Gift Two', level: 2, xp: 0 },
    ];
    s.backgroundAbilities = [];
  } else {
    s.abilities = [
      { id: 'a1', name: 'Gift One', level: 3, xp: 0 },
      { id: 'a2', name: 'Gift Two', level: 3, xp: 0 },
      { id: 'a3', name: 'Gift Three', level: 3, xp: 0 },
    ];
    s.backgroundAbilities = [];
  }
  s.inventory = [{ itemId, name, sentimental: true }];
  pg.chanDay = {};
  const said = [];
  const oSay = Game.say;
  Game.say = function (t) { try { said.push(String(t)); } catch (e) {} return oSay.apply(this, arguments); };
  let msg;
  try { msg = Game.channelSentiment(0); } finally { Game.say = oSay; }
  return { msg, said };
}

// ---------------- PART A: GREEN fixtures ----------------
async function partA() {
  console.log('== PART A: GREEN fixtures ==');
  const { Game } = await quietLog(async () => loadGame({ seed: 7, mode: 'beatidentity-fixture' }));
  await quietLog(async () => setupGame(Game));

  // ---- (1) devotion lane: item identity threaded in ----
  console.log('-- devotion lane (surgeResonance >= 35, <3 mastered) --');
  const devLines = [];
  for (const [id, name, phrase] of ITEMS) {
    const { msg } = await quietLog(async () => channelAs(Game, id, name, 'devotion'));
    devLines.push(msg);
    ok(typeof msg === 'string' && msg.includes(name),
      `A-1: devotion line holds ${name}`, String(msg).slice(0, 60));
    ok(new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(msg || ''),
      `A-1: devotion line for ${name} carries its own memory ("${phrase}")`);
    ok(/Your gifts are not mastered — but they are lived-in/.test(msg || ''),
      `A-1: devotion line for ${name} keeps the beat's core`);
    ok(/FEASTED/.test(msg || ''), `A-1: devotion line for ${name} keeps the honest buff terms`);
  }
  ok(new Set(devLines).size === 4, 'A-1: four items -> four DISTINCT devotion lines',
    `${new Set(devLines).size} distinct`);
  ok(!/worn smooth by use/.test(devLines.join(' ')),
    'A-1: generic "worn smooth by use" retired (the memory now evidences it)');

  // ---- (1b) mastery lane: same beat, same identity ----
  console.log('-- mastery lane (3+ mastered) --');
  const masLines = [];
  for (const [id, name, phrase] of ITEMS) {
    const { msg } = await quietLog(async () => channelAs(Game, id, name, 'mastery'));
    masLines.push(msg);
    ok(new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(msg || ''),
      `A-1b: mastery line for ${name} carries its own memory ("${phrase}")`);
    ok(/The feast was the weapon/.test(msg || ''), `A-1b: mastery line keeps the payoff`);
  }
  ok(new Set(masLines).size === 4, 'A-1b: four items -> four DISTINCT mastery lines');

  // ---- (2) spoil mutter: speaker/day variety ----
  console.log('-- spoil mutter (knows smoking) --');
  const vv = Game.state.village;
  const realKnows = Game.knowsTechnique;
  try {
    Game.knowsTechnique = () => true;
    // The honest property (finding 2026-10-13): identical strings must only
    // ever come from the SAME speaker — never two different speakers on
    // different days. The speaker is embedded in every mutter, so this holds
    // by construction; the sweep below pins it over 60 days. Same-speaker
    // repetition (a person repeating themselves weeks apart) is human, not
    // the theater-class bug.
    const seen = new Map(); // line -> {day, who}
    let propOk = true, propNote = '';
    for (let d = 1; d <= 60 && propOk; d++) {
      Game.state.scholar.day = d;
      delete vv._spoilVoice;
      const who = Game._spoilMutterSpeaker(d);
      const line = Game.spoilVoiceLine('venison');
      if (/Someone/.test(line)) propOk = false, propNote = `d${d}: anonymous mutter`;
      else if (who === 'Someone' || !line.includes(who)) propOk = false, propNote = `d${d}: speaker ${who} not in line`;
      else if (/Should've smoked that/.test(line)) propOk = false, propNote = `d${d}: teaching leaked into mutter path`;
      else if (!/smoke rack|ash pile|long look/.test(line)) propOk = false, propNote = `d${d}: lost the smoke-rack image`;
      else if (seen.has(line) && seen.get(line).who !== who) {
        const p = seen.get(line);
        propOk = false; propNote = `d${p.day} (${p.who}) and d${d} (${who}) byte-identical`;
      } else if (!seen.has(line)) seen.set(line, { day: d, who });
    }
    ok(propOk, 'A-2: identical strings only ever repeat from the SAME speaker (60-day sweep)',
      propNote || `${seen.size} distinct strings / 60 days`);
    // the finding's days: each voicing names its day-speaker, none anonymous.
    for (const d of [16, 17, 21, 76]) {
      Game.state.scholar.day = d;
      delete vv._spoilVoice;
      const who = Game._spoilMutterSpeaker(d);
      const line = Game.spoilVoiceLine('venison');
      ok(who !== 'Someone' && line.includes(who),
        `A-2: day-${d} mutter is voiced by its day-speaker`, who);
    }
    // determinism: same day -> same line (no RNG draws)
    Game.state.scholar.day = 16;
    delete vv._spoilVoice;
    const r1 = Game.spoilVoiceLine('venison');
    delete vv._spoilVoice;
    const r2 = Game.spoilVoiceLine('venison');
    ok(r1 === r2, 'A-2: deterministic given day (no RNG draws)');
    // prosefix invariants preserved: same-day rotation m4===m1, >=2 distinct
    delete vv._spoilVoice;
    const m1 = Game.spoilVoiceLine('venison');
    const m2 = Game.spoilVoiceLine('venison');
    const m3 = Game.spoilVoiceLine('venison');
    const m4 = Game.spoilVoiceLine('venison');
    ok(new Set([m1, m2, m3]).size >= 2, 'A-2: same-day variants still rotate', `${new Set([m1, m2, m3]).size} distinct`);
    ok(m4 === m1, 'A-2: rotation counter preserved (m4===m1)');
  } finally { Game.knowsTechnique = realKnows; }

  // ---- (2b) teaching + condensed paths unchanged ----
  console.log('-- teaching / condensed paths (unchanged) --');
  try {
    Game.knowsTechnique = () => false;
    delete vv._spoilVoice;
    const first = Game.spoilVoiceLine('smoked fish, berries');
    const second = Game.spoilVoiceLine('turnips');
    ok(/Should've smoked that\. Fresh stuff keeps a day or two on the shelf/.test(first),
      'A-2b: FIRST voicing keeps the full teaching verbatim', first.slice(60, 120));
    ok(!/Should've smoked that|smoke rack/i.test(second),
      'A-2b: repeat stays condensed (teaching delivered once per run)', second);
  } finally { Game.knowsTechnique = realKnows; }
}

// ---------------- PART B: sense read ----------------
async function partB() {
  console.log('== PART B: sense read (full lines for human judgment) ==');
  const { Game } = await quietLog(async () => loadGame({ seed: 22, mode: 'beatidentity-sense' }));
  await quietLog(async () => setupGame(Game));
  console.log('\n--- devotion lines (the finding: these were word-identical) ---');
  for (const [id, name] of ITEMS) {
    const { msg } = await quietLog(async () => channelAs(Game, id, name, 'devotion'));
    console.log(`\n[${name}]\n${msg}`);
  }
  console.log('\n--- spoil mutters, days 16/17/21/76 (the finding: Walt/Nina/Jesse/Caleb, identical) ---');
  const vv = Game.state.village;
  const realKnows = Game.knowsTechnique;
  try {
    Game.knowsTechnique = () => true;
    delete vv._spoilVoice;
    for (const d of [16, 17, 21, 76]) {
      Game.state.scholar.day = d;
      console.log(`\n[d${d}] ${Game.spoilVoiceLine('venison, smoked fish')}`);
    }
  } finally { Game.knowsTechnique = realKnows; }
}

(async () => {
  try {
    part0();
    if (RED_ONLY) { console.log('\n--red-only: stopping after PART 0'); process.exit(fails.length ? 1 : 0); }
    await partA();
    await partB();
  } catch (e) { console.error('HARNESS ERROR: ' + (e && e.stack || e)); fails.push('harness'); }
  console.log(`\n${fails.length ? 'RED/FAIL' : 'GREEN'} — ${fails.length} failure(s)${fails.length ? ': ' + fails.join('; ') : ''}`);
  process.exit(fails.length ? 1 : 0);
})();
