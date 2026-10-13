#!/usr/bin/env node
// test-blitz-fightres.js — blitz-fightres proof (2026-10-13).
//
// TASK 1 — zero-monster fights must end.
//   WHERE: fight resolution lives in tbEndCheck() (game.js), wrapped by
//   party.js (betrayal: hostiles are the enemy) and encounters.js (alien
//   hostiles).
//   HOW IT PERSISTED: tbEndCheck ran after AI turns, player verbs, and
//   damage/status sites — but never when the turn driver itself ARRIVED at
//   the player's turn. tbAdvance() lands on the player via tbBeginTurn() and
//   returns with no end check; tbBeginTurn() never checked either. So a
//   fight at zero monsters sat forever waiting for a verb nobody issues (a
//   turn-driving sim, an AFK player, a UI with no valid actions): no
//   resolution path. The barrier exit — the other natural "walk away" —
//   explicitly no-op'd on zero live monsters (`return false`, push swallowed,
//   fight left live).
//   MECHANISM CHOSEN: resolve at turn arrival. tbBeginTurn() consults
//   tbEndCheck() first — one choke point covering the sync tbAdvance, the
//   async stepper, and direct callers (justice.js). A turn arriving at an
//   empty field ends the fight instead of starting a turn. The async path
//   skips its player-turn event when the fight just ended. tbBarrierExit
//   with no live monsters now resolves honestly through tbEndCheck
//   ('won' if they died, 'routed' if they fled) instead of no-op'ing.
//   NOT chosen: auto-fleeing the player (dishonest — nobody ran) or a
//   turn-count fuse (arbitrary; arrival-resolution is exact). The belltoad
//   chorus is unaffected: pending reinforcements hold the fight open by
//   design (tbEndCheck returns false), verified by A4.
//   BOUND: resolution happens on the NEXT turn arrival (1 turn). The test
//   bound of 10 turns is generous headroom, not the mechanism.
//
// TASK 2 — literal "undefined" in villager dialogue.
//   FOUND BY FUZZING (multi-seed, archetype/background rotation, trust and
//   language variants, old-save field-stripping): revealName() and npcName()
//   did unguarded `v.name.split(' ')[0]` — a nameless person record (old
//   save, corrupt seed) threw TypeError and killed the entire conversation.
//   Fixed: unified getPerson() lookup + 'Someone' fallback (never blank,
//   never "undefined"). Battery below asserts zero literal "undefined"
//   across ~2000 generated strings per run.
//
// RED on pristine (stash-verified 2026-10-13): A2 still live after 10 turns,
//   A3 returns false with the fight live, B2 throws TypeError.
// GREEN after fix.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let failures = 0;
function fail(msg) { failures++; console.error('FAIL: ' + msg); }
function ok(msg) { console.log('ok: ' + msg); }
function scanUndefined(hits, text, where) {
  if (text == null) return;
  const s = String(text);
  if (s.includes('undefined')) hits.push(where + ' :: ' + s.slice(0, 200));
}

async function newGame(seed) {
  const { Game, loadFails } = await loadGame({ seed, mode: 'test' });
  if (loadFails && loadFails.length) throw new Error('module load failures: ' + loadFails.join('; '));
  await setupGame(Game);
  return Game;
}

// ---------- TASK 1 ----------

async function caseA1() {
  // Control: a normal fight where the player drops every monster through the
  // real damage pipeline ends promptly.
  const Game = await newGame(101);
  Game.startCombat('hummice');
  let turns = 0;
  while (Game.inCombat() && turns < 40) {
    for (const m of Game.tbfight.fighters.filter(x => x.kind === 'monster' && x.alive && !x.fled))
      Game.tbDamage(m.key, 99999, 'debug', null, { quiet: true });
    if (Game.inCombat()) { if (Game.tbIsPlayerTurn()) Game.tbPlayerWait(); else Game.tbAdvance(); }
    turns++;
  }
  if (Game.inCombat()) fail('A1: real kill-all fight did not end in 40 turns');
  else ok('A1: real kill-all fight ended in ' + turns + ' turns');
}

async function caseA2() {
  // The defect: zero monsters with a live fight and NO tbEndCheck having
  // run (the missed-call class: barrier early-return, guard-exit, any
  // removal path that skips the check). Drive ONLY the turn engine — no
  // player verbs. Pristine: hangs forever. Fixed: ends on next arrival.
  const Game = await newGame(102);
  Game.startCombat('hummice');
  for (const m of Game.tbfight.fighters.filter(x => x.kind === 'monster')) m.fled = true; // no tbEndCheck
  let turns = 0;
  while (Game.inCombat() && turns < 10) { Game.tbAdvance(); turns++; }
  if (Game.inCombat()) fail('A2: zero-monster fight still live after 10 turn-driver turns (hang)');
  else ok('A2: zero-monster fight resolved in ' + turns + ' turn-driver turn(s) (bound 10)');
}

async function caseA3() {
  // Barrier push on an empty field: was `return false` (fight live, push
  // swallowed). Now resolves honestly and consumes the push.
  const Game = await newGame(103);
  Game.startCombat('hummice');
  for (const m of Game.tbfight.fighters.filter(x => x.kind === 'monster')) m.alive = false; // no tbEndCheck
  let g = 0;
  while (!Game.tbIsPlayerTurn() && Game.inCombat() && g++ < 20) Game.tbAdvance();
  if (!Game.inCombat()) { ok('A3: fight already resolved at turn arrival (barrier case subsumed)'); return; }
  Game.tbFighter('p').mx = 0;
  const r = Game.tbBarrierExit(-1, 0);
  if (r !== true) fail('A3: tbBarrierExit on empty field returned ' + r + ' (expected true)');
  else if (Game.inCombat()) fail('A3: fight still live after barrier exit on empty field');
  else ok('A3: barrier exit on empty field returned true and ended the fight');
}

async function caseA4() {
  // No-regression: the belltoad chorus MUST still hold a zero-monster fight
  // open while reinforcements are pending — the fix must not end it.
  const Game = await newGame(104);
  Game.startCombat('belltoad');
  const toad = Game.tbfight.fighters.find(x => x.kind === 'monster');
  if (!Game._pendingPack) Game._pendingPack = { id: 'belltoad', count: 2, mdef: toad.mdef };
  for (const m of Game.tbfight.fighters.filter(x => x.kind === 'monster'))
    Game.tbDamage(m.key, 99999, 'debug', null, { quiet: true });
  const held = Game.tbEndCheck() === false && Game.inCombat();
  if (!held) fail('A4: chorus hold broken — zero-monster belltoad fight ended with pending pack');
  else ok('A4: chorus still holds the fight open with reinforcements pending');
  // And the player's turn still arrives fine mid-chorus (no crash, no event).
  let g = 0;
  while (!Game.tbIsPlayerTurn() && Game.inCombat() && g++ < 20) Game.tbAdvance();
  if (!Game.inCombat()) fail('A4: chorus fight died while driving to player turn');
  else ok('A4: player turn arrives mid-chorus without incident');
}

// ---------- TASK 2 ----------

function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

async function caseB1() {
  // Battery: generated dialogue across seeds, archetypes, trust/language
  // variants, and old-save field-stripping. Zero literal "undefined".
  const hits = [];
  let strings = 0;
  const scan = (t, w) => { strings++; scanUndefined(hits, t, w); };
  const STRIP_SETS = [['name'], ['formerOccupation'], ['homeRegion'], ['personality'],
    ['name', 'formerOccupation', 'homeRegion'], ['languages']];
  for (const seed of [201, 202, 203]) {
    const Game = await newGame(seed);
    const rng = mulberry32(seed * 31 + 5);
    const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
    roster.forEach((vid, i) => {
      const mode = i % 4;
      try {
        if (mode === 1) { // no shared language
          Game.state.scholar.languages = {}; Game.state.scholar.englishLevel = 0;
          const p = Game.getPerson(vid) || {}; p.languages = { native: 'quechua', quechua: 2 };
        } else if (mode === 2) { Game.state.systemArrived = true; }
        else if (mode === 3) { // planted talk request
          const v = Game.state.village; v.talkRequests = v.talkRequests || {};
          v.talkRequests[vid] = { line: '__NAME__ wants to talk. (Talk to __NAME__.)', delivered: false };
        }
        (Game.state.village.trust || (Game.state.village.trust = {}))[vid] = [0, 15, 50, 85][i % 4];
      } catch (e) {}
      const person = Game.getPerson(vid) || {};
      const strips = STRIP_SETS[i % STRIP_SETS.length];
      const saved = {};
      for (const k of strips) { saved[k] = person[k]; delete person[k]; }
      const tag = `seed${seed}:v${i}:mode${mode}:strip[${strips.join(',')}]`;
      const logFrom = (Game.log || []).length;
      try {
        let st = null;
        try { st = Game.startConvo(vid); } catch (e) { scan('THREW: ' + e.message, tag + ':start:throw'); }
        if (st) {
          scan(st.line, tag + ':open');
          (st.choices || []).forEach(ch => ch && scan(ch.label, tag + ':openChoice'));
          let cur = st, guard = 0;
          while (cur && !cur.ended && guard++ < 20) {
            const choices = (cur.choices || []).filter(c => c && c.id);
            if (!choices.length) break;
            const pick = choices[Math.floor(rng() * choices.length)];
            let res = null;
            try { res = Game.convoTurn(vid, pick.id); } catch (e) { scan('THREW: ' + e.message, tag + ':turn:throw'); break; }
            if (!res) break;
            scan(res.line, tag + ':turn');
            (res.choices || []).forEach(ch => ch && scan(ch.label, tag + ':turnChoice'));
            (res.transcript || []).forEach(t => scan((t && t.text) || t, tag + ':transcript'));
            cur = res;
            if (res.ended) break;
          }
          try { Game.endConvo(vid, 'left'); } catch (e) { scan('THREW: ' + e.message, tag + ':end:throw'); }
        }
      } finally {
        for (const k of strips) if (saved[k] !== undefined) person[k] = saved[k];
        try { Game.state.scholar.languages = { english: 2 }; Game.state.scholar.englishLevel = 2; Game.state.systemArrived = false; } catch (e) {}
      }
      const log = Game.log || [];
      for (let li = logFrom; li < log.length; li++) {
        const e = log[li];
        scan((e && e.text !== undefined) ? e.text : String(e), tag + ':gamelog');
      }
    });
  }
  if (hits.length) fail('B1: ' + hits.length + ' "undefined" hits in ' + strings + ' dialogue strings:\n  ' + hits.slice(0, 8).join('\n  '));
  else ok('B1: zero literal "undefined" across ' + strings + ' dialogue strings (3 seeds, archetype/background rotation)');
}

async function caseB2() {
  // Nameless person record: conversation must open, names fall back.
  const Game = await newGame(204);
  const vid = Game.state.village.roster.find(id => id !== Game.villagerId);
  const person = Game.getPerson(vid);
  const savedName = person.name;
  delete person.name;
  try {
    let st = null;
    try { st = Game.startConvo(vid); } catch (e) { fail('B2: startConvo threw on nameless villager: ' + e.message); }
    if (st) {
      scanUndefined([], st.line, 'B2'); // throws on hit via fail below
      if (String(st.line).includes('undefined')) fail('B2: opening line contains "undefined"');
      else ok('B2: nameless villager conversation opens cleanly');
      try { Game.endConvo(vid, 'left'); } catch (e) {}
    }
    const nn = (() => { try { return Game.npcName(vid); } catch (e) { fail('B2: npcName threw on nameless villager: ' + e.message); return 'THREW'; } })();
    const dn = (() => { try { return Game.displayName(vid); } catch (e) { fail('B2: displayName threw on nameless villager: ' + e.message); return 'THREW'; } })();
    if (nn === 'Someone' && !String(dn).includes('undefined')) ok('B2: npcName/displayName fall back ("Someone"), no "undefined"');
    else fail('B2: bad fallbacks npcName=' + JSON.stringify(nn) + ' displayName=' + JSON.stringify(dn));
  } finally { person.name = savedName; }
}

async function caseB3() {
  // Adversarial template calls: sparse/unknown inputs, never "undefined".
  const Game = await newGame(205);
  const hits = [];
  const t = (v, w) => { const s = String(v); if (s.includes('undefined')) hits.push(w + ' :: ' + s.slice(0, 160)); return s; };
  try {
    t(Game.fillTalkLine('I was a {an_occ} from {origin}, {first}.', {}), 'fillTalkLine:{}');
    t(Game.fillTalkLine('{first} the {occ} ({Occ})', null), 'fillTalkLine:null');
    t(Game.renderTalkLine('__NAME__ says hi', 'no_such_villager'), 'renderTalkLine:unknown');
    t(Game.convoFillPeople('We are {people} people strong.'), 'convoFillPeople');
    t(Game.displayName('no_such_villager'), 'displayName:unknown');
    t(Game.firstRef('no_such_villager'), 'firstRef:unknown');
    t(Game.npcName('no_such_villager'), 'npcName:unknown');
    t(Game.talkTo(Game.state.village.roster.find(id => id !== Game.villagerId)), 'talkTo');
  } catch (e) { fail('B3: adversarial template call threw: ' + e.message); }
  if (hits.length) fail('B3: "undefined" in adversarial templates:\n  ' + hits.join('\n  '));
  else ok('B3: adversarial template calls render clean fallbacks');
}

async function main() {
  const t0 = Date.now();
  await caseA1();
  await caseA2();
  await caseA3();
  await caseA4();
  await caseB1();
  await caseB2();
  await caseB3();
  console.log('---');
  console.log(failures ? ('RESULT: FAIL (' + failures + ' failures, ' + ((Date.now() - t0) / 1000).toFixed(1) + 's)') : ('RESULT: PASS (' + ((Date.now() - t0) / 1000).toFixed(1) + 's)'));
  process.exitCode = failures ? 1 : 0;
}

main().catch(e => { console.error('HARNESS THREW:', e); process.exit(2); });
