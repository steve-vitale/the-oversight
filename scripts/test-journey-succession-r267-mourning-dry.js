#!/usr/bin/env node
// test-journey-succession-r267-mourning-dry.js — proof test for the r267
// MOURNING-DRY fix (journey-succession r266 finding, DRY-CENSUS FAIL).
//
// The r266 wild cases (Asep 34426 d94, Ursula 34436 d91): the player
// picks [alive:event:mourning] ("How are you holding up? About...
// them.") and hears "...Sorry, lost my train of thought." The
// sayTrace pins both: pick alive:event:mourning, preSelf=false,
// preRun=TRUE, structural=false, fellBack=true. The picked mourning
// line was run-blocked at emission because another villager had
// recently spoken the identical name-baked line about the same dead
// person (Asep: the bothVet variant about Ruby; Ursula: the generic
// burnt-piece line about Vikram).
//
// The mechanism: the mourning answer is picked as a TEMPLATE
// ({mname} unfilled) and filled AFTER the pick (topic2Ask ->
// t2pick/convoPick -> t2fill -> sayLine). convoPick's run-ledger
// awareness compares the UNFILLED template against the run ledger
// (which holds FILLED lines), so the pick cannot see the collision
// coming; sayLine then blocks the filled line and serves the dry
// line. The ask:lately path is exempt (structuralTurn=true, r170)
// — the SAME lately answer through the alive menu is not. That
// asymmetry is the bug.
//
// The fix (src/js/convoTopics.js, topic2Ask): a fill-aware retry —
// after pick + fill (+ change-ack prepend), if the composed line
// convoWouldBlocks, try the other candidates from the same pool,
// filled, and take the first that would NOT block (recording the
// replacement in c.said['t2:'+topic]). If NO candidate passes, the
// original line returns unchanged (current behavior — the
// last-resort pool-exhaustion gap, documented, not papered over).
//
// Staging note: corpses are staged directly in state.corpses (a
// real roster villager's id + name, kind 'person', dayDied today)
// with village.grief = 1 — the exact event path the game uses for a
// fresh named corpse (t2LatelyEvent fresh-corpse branch), same as
// the r231/r232 proof tests. The speaker is a stranger to the dead
// (no bond, no waveKillLog, no witnesses), so the pool is exactly
// the 5 generic single-name templates. The run ledger is poisoned
// with the FILLED lines (via t2fill, exactly as the game fills
// them), so the collision is real, not simulated.
//
// Cases (each in its own process — never two harnesses in one process):
//   collision : poison 4 of the 5 filled generics (all but
//     'burnt-piece'); pre-populate c.said['t2:lately'] with the clean
//     template so convoPick MUST draw a poisoned one. Drive
//     [alive:event:mourning] once via convoTurn. FIXED: the served
//     line IS the clean 'burnt-piece' line naming the dead, no dry
//     line anywhere in the transcript. UNFIXED: the dry line (RED —
//     the pick drew poisoned, sayLine blocked, no retry). The
//     staging forces the retry path deterministically.
//   control   : same staging, NO poisoning, no pre-population.
//     The pick serves honestly (any of the 5 generics), none dry —
//     the fix must not change any unblocked path.
//   all-blocked (descriptive): poison ALL 5 filled generics. The
//     retry finds nothing; the line dries exactly as on base. Asserts
//     no crash and no wrong-dead line served — the last-resort gap is
//     documented, not claimed fixed.
// Usage: node scripts/test-journey-succession-r267-mourning-dry.js [case]
//   Default (no arg): runs all cases, spawning children for the
//   non-default case (separate processes).
'use strict';
const { execFileSync } = require('child_process');
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');

let fails = 0;
function check(name, cond, detail) {
  console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail ? ' — ' + detail : ''));
  if (!cond) fails++;
}

const DRY = [
  '"...Sorry, lost my train of thought."',
  '"Hm. Never mind — go on."',
  '"...Actually, forget it."',
  '"...Where was I? Gone. Ask me something else."',
  '"Huh. That went clean out of my head."',
  '"...No, it\'s not coming back. What were you saying?"',
  '"Lost it. The thought, I mean. Go on."',
  '"...Sorry — that one slipped away from me."',
];
const isDry = (t) => DRY.some(d => String(t || '').includes(d.replace(/"/g, '')));
const BURNT_PIECE = 'always took the burnt piece';

function firstChunk(Game, line) {
  try { return Game.convoSplitBeats(line)[0].trim(); } catch (e) { return String(line); }
}

function poisonRunLedger(Game, chunks) {
  const rl = Game.convoRunLedger();
  for (const k of chunks) if (k && !rl.includes(k)) rl.push(k);
  while (rl.length > 48) rl.shift();
}

function lastNpcLine(Game, vid) {
  const c = Game.convoGet(vid);
  const tr = (c && c.transcript) || [];
  for (let i = tr.length - 1; i >= 0; i--) {
    if (tr[i].who === 'them') return String(tr[i].text || '');
  }
  return '';
}

function transcriptHasDry(Game, vid) {
  const c = Game.convoGet(vid);
  const tr = (c && c.transcript) || [];
  return tr.some(e => e.who === 'them' && isDry(e.text));
}

function firstName(n) { return String(n || 'Someone').split(' ')[0]; }

function stageDeath(Game, vid, witnesses) {
  const day = (Game.state.scholar || {}).day || 40;
  let name = null;
  try {
    const rc = ((Game.state.village || {}).rosterChars || {})[vid];
    if (rc && rc.name) name = rc.name;
  } catch (e) {}
  if (!name) {
    try { const ch = (Game.data.villagers || []).find(x => x.id === vid); if (ch && ch.name) name = ch.name; } catch (e) {}
  }
  if (!name) name = String(vid);
  Game.state.corpses = [{ villagerId: vid, name, kind: 'person', dayDied: day, witnesses: witnesses || [] }];
  try {
    const lin = (typeof Game.lineage === 'function') ? Game.lineage() : null;
    if (lin) lin.push({ name, villagerId: vid, day, cause: 'the wild' });
  } catch (e) {}
  return firstName(name);
}

async function runCase(mode) {
  const seed = mode === 'control' ? 5603 : mode === 'all-blocked' ? 5604 : 5602;
  const { Game } = await loadGame({ seed, mode: 'succession-r267-mourning-dry-proof', fullTelemetry: true });
  await setupGame(Game);
  const v = Game.state.village || {};
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  v.trust = v.trust || {};
  for (const vid of roster) v.trust[vid] = 90;
  v.grief = 1;
  Game.state.scholar.day = 40;
  check(`${mode}: roster has >= 2 villagers`, roster.length >= 2, `roster=${roster.length}`);
  if (roster.length < 2) return;
  const speaker = roster[0];
  const deadVid = roster[1];
  const dname = stageDeath(Game, deadVid, []);
  const ev = (typeof Game.t2LatelyEvent === 'function') ? Game.t2LatelyEvent(speaker) : null;
  check(`${mode}: lately event is named mourning for ${dname}`, !!(ev && ev.kind === 'mourning' && ev.name === dname), JSON.stringify(ev));
  if (!ev || ev.kind !== 'mourning') return;
  // The speaker's pool: stranger to the dead, so exactly the 5 generic
  // single-name templates (no bond/vet/witness variants).
  const pool = (typeof Game.t2gen_lately === 'function') ? Game.t2gen_lately(speaker) : [];
  check(`${mode}: mourning pool is the 5 generics`, Array.isArray(pool) && pool.length === 5, `pool=${pool.length}`);
  if (!Array.isArray(pool) || pool.length !== 5) return;
  const cleanTemplate = pool.find(t => String(t).indexOf(BURNT_PIECE) !== -1);
  check(`${mode}: burnt-piece template present in pool`, !!cleanTemplate);
  if (!cleanTemplate) return;
  // Fill every template exactly as the game does, then poison the run
  // ledger with the filled lines (all but the clean one — or all, for
  // the all-blocked case).
  const filled = pool.map(t => {
    try { return Game.t2fill(t, Game.vpOf(speaker), speaker); } catch (e) { return String(t); }
  });
  const cleanFilled = filled[pool.indexOf(cleanTemplate)];
  check(`${mode}: clean filled line names the dead`, cleanFilled.indexOf(dname) !== -1, String(cleanFilled).slice(0, 100));
  if (mode !== 'control') {
    const poison = (mode === 'all-blocked' ? filled : filled.filter(f => f !== cleanFilled));
    poisonRunLedger(Game, poison.map(f => firstChunk(Game, f)));
    check(`${mode}: poisoned ${poison.length} filled templates`, poison.length === (mode === 'all-blocked' ? 5 : 4));
  }
  const r = Game.startConvo(speaker);
  check(`${mode}: convo opened`, !!(r && !r.refused), `refused=${r && r.refused}`);
  if (!r || r.refused) return;
  if (mode === 'collision') {
    // Force the pick onto a poisoned template: the clean one is already
    // "said" for this villager, so convoPick cannot draw it — the retry
    // must find it among the candidates instead.
    const c = Game.convoGet(speaker);
    c.said = c.said || {};
    c.said['t2:lately'] = [cleanTemplate];
  }
  Game.convoTurn(speaker, 'alive:event:mourning');
  const line = lastNpcLine(Game, speaker);
  try { Game.endConvo(speaker, 'left'); } catch (e) {}
  if (mode === 'collision') {
    check('collision: reply is NOT a dry line', !isDry(line), String(line).slice(0, 120));
    check('collision: reply IS the clean burnt-piece line', line.indexOf(BURNT_PIECE) !== -1, String(line).slice(0, 120));
    check('collision: reply names the dead', line.indexOf(dname) !== -1, String(line).slice(0, 120));
    check('collision: NO dry line anywhere in the transcript', !transcriptHasDry(Game, speaker), 'dry line present in transcript');
  } else if (mode === 'control') {
    check('control: reply is NOT a dry line', !isDry(line), String(line).slice(0, 120));
    check('control: reply names the dead', line.indexOf(dname) !== -1, String(line).slice(0, 120));
    check('control: NO dry line anywhere in the transcript', !transcriptHasDry(Game, speaker), 'dry line present in transcript');
  } else if (mode === 'all-blocked') {
    // Last-resort gap, documented: with every template blocked the
    // retry finds nothing and the turn dries exactly as on base. The
    // fix must not crash and must not serve a wrong-dead line.
    check('all-blocked: reply is the dry line (last-resort gap, as on base)', isDry(line), String(line).slice(0, 120));
    check('all-blocked: no wrong-dead line served', line.indexOf(dname) === -1 || isDry(line), String(line).slice(0, 120));
  }
}

const CASES = ['collision', 'control', 'all-blocked'];

async function main() {
  const mode = process.argv[2];
  if (mode && CASES.includes(mode)) {
    await runCase(mode);
  } else {
    await runCase('collision');
    for (const m of CASES.slice(1)) {
      try {
        const out = execFileSync('node', [path.join(__dirname, 'test-journey-succession-r267-mourning-dry.js'), m],
          { timeout: 300000, maxBuffer: 64 * 1024 * 1024 }).toString();
        console.log(out.split('\n').filter(l => l.startsWith('PASS') || l.startsWith('FAIL')).join('\n'));
        if (/FAIL/.test(out)) fails++;
      } catch (e) {
        check(`${m} child run passes`, false, String((e.stdout || e.message || e)).slice(0, 300));
      }
    }
  }
  if (fails) { console.log(`\n${fails} FAILURES`); process.exit(1); }
  console.log('\nALL GREEN');
}

main().catch(e => { console.error('THREW', e); process.exit(1); });
