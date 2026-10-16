// census-counterwired-20261016.js — STATIC counter-wiring census (sim-counterwired,
// 2026-10-16, axis scale-onramp). Zero game code touched; pure reads of
// src/data/monsters.json + src/js engine wiring. Answers: which species have
// (a) a `counter` field (ledger convention), (b) a wave-3 villagerTricks def,
// (c) engine-real signature counterplay, (d) which perform-the-trick kinds
// are actually wired in checkMonsterCounter's switch.
// Diagnostic instrument — no game logic, no policy, read-only.
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

function loadMonsters() {
  const m = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/monsters.json'), 'utf8'));
  return Array.isArray(m) ? m : Object.values(m);
}

// Perform-the-trick kinds wired in Game.checkMonsterCounter's switch (game.js).
// Read as of 2026-10-16: shout, offer_food, wait, move_windup, move_x2,
// approach (retired, switch case kept), sidestep, keep_distance, strike_lead,
// strike_windup, strike_recovery, strike_first, strike_nonhead, fresh_weapon.
// Data uses three kinds with NO switch case: blindside, face_it, eyes.
const CHECK_MONSTER_COUNTER_KINDS = new Set([
  'shout', 'offer_food', 'wait', 'move_windup', 'move_x2', 'approach',
  'sidestep', 'keep_distance', 'strike_lead', 'strike_windup',
  'strike_recovery', 'strike_first', 'strike_nonhead', 'fresh_weapon',
]);

// Wave-3 signature counterplay wired as village-learnable tricks
// (Game.villagerTrickDefs, game.js). Only the actuable subset.
const VILLAGER_TRICK_DEFS = ['spool', 'chorus_line', 'buffering'];

// Wave-4/5 signature counterplay counterplay concept per monster (from
// src/js/sigW4.js / sigW5.js headers — engine-real mechanics, 2026-10-11).
// Used by the census to name what the unwired trick IS.
const W4_COUNTERPLAY = {
  congregation: 'heresy breaks the geas (25 dmg, geas snaps)',
  strike: 'meet a demand, or scab during shutdown rounds',
  influencer: 'kill follower adds, or out-entertain it',
  audit: 'deliberate jank, or read the clipboard',
  reunion: 'novelty — repeat verbs weaken, new verbs empower',
  suburb: 'escape (walk to edge), or bring something alive',
  eulogy: 'contradict verses, or rewrite the ending',
  algorithm: 'be unpredictable, or tank on purpose (2 rounds soft)',
  eater: 'poison the meal, or starve the field',
  herald: '(see sigW4.js — engine hook present)',
};
const W5_COUNTERPLAY = {
  cancellation: 'go off-script, or spend favor',
  editor: 'retrieve from the cutting-room floor, or contradict yourself to jam the blades',
  rerun: 'leave margin messages, or win fast',
  spoiler: 'ask binding questions, cheap fulfillment, or make it a lie',
  timeslot: 'own the venue, or get bumped',
  nielsen: 'FIGHT BORING',
  finale: 'feed it a sacrifice, or end it first',
  network_note: 'kill it first, or feed it bad notes',
  finale_crew: '(see sigW5.js — engine hook present)',
  finale_opening: '(see sigW5.js — engine hook present)',
};
const W3_COUNTERPLAY = {
  redactor: 'carry a decoy rattle; go quiet 2 turns (starve it); watch the handles',
  gavel: 'object (3 viewership), recess (once), confess first; flank the sound-block',
  focus_group: 'be boring 3 rounds (they leave); pop the 3 mouth-parts',
  spool: 'feed it waits/heals during record — the replay is silence [WIRED]',
  chorus_line: 'dance on the downbeat [WIRED]',
  terms_of_service: 'read 3 clauses — the §0 TERMINATION loophole dismisses it',
  callback: 'hold a funeral (speak as the person); or NAME IT as not-them',
  buffering: 'stand still — it aims at your future position [WIRED]',
  ad_break: 'patience (wait for skip beat); look away; kill the 40-HP sponsor',
};

function census() {
  const monsters = loadMonsters();
  const rows = [];
  for (const m of monsters) {
    const wave = m.wave || 1;
    const id = m.id;
    const ctr = m.counter || null;
    const sig = wave >= 4 ? 'sigW4/sigW5 engine-real (see map)' :
      wave === 3 ? (W3_COUNTERPLAY[id] || 'engine-real (sigW3a/b/c)') :
      (ctr ? 'counter field' : 'none');
    rows.push({
      wave, id, name: m.name,
      counter: !!ctr,
      kind: ctr ? ctr.kind : null,
      trickWired: ctr ? CHECK_MONSTER_COUNTER_KINDS.has(ctr.kind) : null, // perform-the-trick channel
      trickText: ctr ? (ctr.trick || '').slice(0, 120) : null,
      villagerTrick: VILLAGER_TRICK_DEFS.includes(id),
      signatureCounterplay: wave >= 3 ? (W4_COUNTERPLAY[id] || W5_COUNTERPLAY[id] || W3_COUNTERPLAY[id] || 'check sigW4/sigW5') : null,
      weaknesses: Array.isArray(m.weaknesses) ? m.weaknesses.length : (m.weaknesses ? 1 : 0),
    });
  }
  rows.sort((a, b) => a.wave - b.wave || a.id.localeCompare(b.id));
  return rows;
}

function summary(rows) {
  const byWave = {};
  for (const r of rows) {
    const w = 'w' + r.wave;
    byWave[w] = byWave[w] || { n: 0, counter: 0, kindWired: 0, kindUnwired: [], villagerTrick: 0, noCounter: [] };
    byWave[w].n++;
    if (r.counter) { byWave[w].counter++; if (r.trickWired) byWave[w].kindWired++; else byWave[w].kindUnwired.push(r.id + ':' + r.kind); }
    else byWave[w].noCounter.push(r.id);
    if (r.villagerTrick) byWave[w].villagerTrick++;
  }
  return byWave;
}

if (require.main === module) {
  const rows = census();
  const sum = summary(rows);
  console.log('=== COUNTER-WIRING CENSUS (static) ===');
  for (const w of Object.keys(sum).sort()) {
    const s = sum[w];
    console.log(`${w}: n=${s.n} counter=${s.counter} performKindWired=${s.kindWired} performKindUnwired=[${s.kindUnwired.join(', ') || '-'}] villagerTricks=${s.villagerTrick}`);
    if (s.noCounter.length) console.log(`   no counter field: ${s.noCounter.join(', ')}`);
  }
  console.log('\nper-species:');
  for (const r of rows) console.log(`w${r.wave} ${r.id} | counter=${r.counter} kind=${r.kind || '-'} kindWired=${r.trickWired === null ? '-' : r.trickWired} villagerTrick=${r.villagerTrick} weaknesses=${r.weaknesses}`);
}

module.exports = { census, summary, CHECK_MONSTER_COUNTER_KINDS, VILLAGER_TRICK_DEFS, W3_COUNTERPLAY, W4_COUNTERPLAY, W5_COUNTERPLAY, loadMonsters };
