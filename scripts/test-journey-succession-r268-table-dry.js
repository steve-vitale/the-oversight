#!/usr/bin/env node
// test-journey-succession-r268-table-dry.js — proof test for the r268
// TABLE-DRY fix (journey-succession r267 finding, DRY-CENSUS FAIL).
//
// The r267 wild case (Lokman 34512 d86): the player picks
// [alive:event:table] ("They say the table's coming. For us. ...") and
// hears "...Sorry, lost my train of thought." The sayTrace pins it:
// pick alive:event:table, preSelf=false, preRun=TRUE, structural=false,
// fellBack=true. The waiting-phase table pool has exactly 2 candidates;
// both were served plain on d71 (ledgering their content as first
// chunks); at d86 Lokman asked the table topic for the first time (no
// ack — c.t2snap empty for him), so his pick carried no ack, the r267
// stage-1 retry's bare alternate was blocked too, and the retry
// returned the original line unchanged, which sayLine dried.
//
// The fix (src/js/convoTopics.js, topic2Ask): a STAGE-2 PREFIXED
// RETRY — after the stage-1 bare-alternate retry fails, try each
// alternate again with a fresh PREFIX as its first chunk. sayLine
// blocks on the first chunk only, so a fresh prefix lets the content
// through. Prefixes are honest delivery, never history claims — the
// generic thinking preambles from convoAckLines() ('Good question.',
// 'Huh. Let me think about that.', 'You want to know about that?
// Okay.', 'Me? Okay.'). The change-ack variants are NOT used: all
// three claim a prior ask, which would be false history for a
// first-time asker like Lokman.
//
// MOURNING CARVE-OUT: stage 2 does NOT engage when the lately event
// is mourning — a preamble-prefixed re-serve of a name-parameterized
// mourning template still matches the same MOURN-TEMPLATE shape
// (the analyzer matches content regardless of a leading prefix
// chunk), so it would trade a DRY fail for a MOURN-TEMPLATE fail.
// For mourning, total exhaustion stays a dry (the filed last-resort
// gap, unchanged from r267).
//
// Staging note: the table waiting event is staged directly via
// progState().tableWaiting = true (the debug-scenarios.js staging:
// pg.arc = 4; pg.tableWaiting = true; pg.tableAnnounced = true) with
// no corpses/grief — the exact event path the game uses for the
// waiting phase (t2LatelyEvent table branch). The mourning case
// reuses the r267 staging (corpses in state.corpses, village.grief
// = 1, stranger speaker, 5 generic templates).
//
// Cases (each in its own process — never two harnesses in one process):
//   table-exhaustion : stage table waiting; poison the run ledger
//     with BOTH filled table lines (no fill variables — template ==
//     filled). Drive [alive:event:table] once via convoTurn.
//     convoPick's run-ledger awareness is a preference, not a hard
//     filter, so the pick still returns a blocked line and the retry
//     must engage. FIXED: the served line IS a preamble-prefixed
//     alternate (one of the two table lines, led by one of the four
//     generic preambles), no dry line anywhere in the transcript.
//     UNFIXED: the dry line (RED — pick drew blocked, stage 1 found
//     nothing, no stage 2).
//   control   : same staging, NO poisoning. The pick serves honestly
//     (one of the two table lines, plain), none dry — the fix must
//     not change any unblocked path.
//   mourning-all-blocked (descriptive, the carve-out check): poison
//     ALL 5 filled mourning generics; drive [alive:event:mourning].
//     The line dries exactly as on base — stage 2 must NOT engage
//     for mourning. Asserts no crash and no wrong-dead line served.
// Usage: node scripts/test-journey-succession-r268-table-dry.js [case]
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
const TABLE_LINES = [
  "They say the table's coming",
  'Have you felt it? Like the air before a storm',
];
const PREAMBLES = [
  'Good question.',
  'Huh. Let me think about that.',
  'You want to know about that? Okay.',
  'Me? Okay.',
];
const isTableLine = (t) => TABLE_LINES.some(l => String(t || '').indexOf(l) !== -1);
const hasPreamble = (t) => PREAMBLES.some(p => String(t || '').indexOf(p) !== -1);

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
  const seed = mode === 'control' ? 5606 : mode === 'mourning-all-blocked' ? 5607 : 5605;
  const { Game } = await loadGame({ seed, mode: 'succession-r268-table-dry-proof', fullTelemetry: true });
  await setupGame(Game);
  const v = Game.state.village || {};
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  v.trust = v.trust || {};
  for (const vid of roster) v.trust[vid] = 90;
  Game.state.scholar.day = 40;
  check(`${mode}: roster has >= 2 villagers`, roster.length >= 2, `roster=${roster.length}`);
  if (roster.length < 2) return;
  const speaker = roster[0];

  if (mode === 'mourning-all-blocked') {
    // r267 staging, verbatim: fresh named corpse, stranger speaker.
    v.grief = 1;
    const deadVid = roster[1];
    const dname = stageDeath(Game, deadVid, []);
    const ev = (typeof Game.t2LatelyEvent === 'function') ? Game.t2LatelyEvent(speaker) : null;
    check(`${mode}: lately event is named mourning for ${dname}`, !!(ev && ev.kind === 'mourning' && ev.name === dname), JSON.stringify(ev));
    if (!ev || ev.kind !== 'mourning') return;
    const pool = (typeof Game.t2gen_lately === 'function') ? Game.t2gen_lately(speaker) : [];
    check(`${mode}: mourning pool is the 5 generics`, Array.isArray(pool) && pool.length === 5, `pool=${pool.length}`);
    if (!Array.isArray(pool) || pool.length !== 5) return;
    const filled = pool.map(t => {
      try { return Game.t2fill(t, Game.vpOf(speaker), speaker); } catch (e) { return String(t); }
    });
    poisonRunLedger(Game, filled.map(f => firstChunk(Game, f)));
    check(`${mode}: poisoned all 5 filled generics`, true);
    const r = Game.startConvo(speaker);
    check(`${mode}: convo opened`, !!(r && !r.refused), `refused=${r && r.refused}`);
    if (!r || r.refused) return;
    Game.convoTurn(speaker, 'alive:event:mourning');
    const line = lastNpcLine(Game, speaker);
    try { Game.endConvo(speaker, 'left'); } catch (e) {}
    // Carve-out: stage 2 must NOT engage for mourning — the line dries
    // exactly as on base. The fix must not crash and must not serve a
    // wrong-dead (preamble-prefixed repeat) line.
    check('mourning-all-blocked: reply is the dry line (carve-out holds, as on base)', isDry(line), String(line).slice(0, 120));
    check('mourning-all-blocked: no preamble-prefixed mourning line served', !hasPreamble(line) || isDry(line), String(line).slice(0, 120));
    check('mourning-all-blocked: no wrong-dead line served', line.indexOf(dname) === -1 || isDry(line), String(line).slice(0, 120));
    return;
  }

  // Table cases: stage the waiting event, no corpses/grief.
  try {
    const pg = Game.progState();
    pg.arc = 4; pg.tableWaiting = true; pg.tableAnnounced = true;
  } catch (e) { check(`${mode}: progState staging works`, false, String(e && e.message)); return; }
  const ev = (typeof Game.t2LatelyEvent === 'function') ? Game.t2LatelyEvent(speaker) : null;
  check(`${mode}: lately event is table/waiting`, !!(ev && ev.kind === 'table' && ev.phase === 'waiting'), JSON.stringify(ev));
  if (!ev || ev.kind !== 'table' || ev.phase !== 'waiting') return;
  const pool = (typeof Game.t2gen_lately === 'function') ? Game.t2gen_lately(speaker) : [];
  check(`${mode}: table waiting pool is the 2 lines`, Array.isArray(pool) && pool.length === 2, `pool=${pool.length}`);
  if (!Array.isArray(pool) || pool.length !== 2) return;
  check(`${mode}: pool holds both known table lines`, pool.some(t => String(t).indexOf(TABLE_LINES[0]) !== -1) && pool.some(t => String(t).indexOf(TABLE_LINES[1]) !== -1), JSON.stringify(pool));
  if (mode === 'table-exhaustion') {
    poisonRunLedger(Game, pool.map(f => firstChunk(Game, f)));
    check(`${mode}: poisoned both table lines`, true);
  }
  const r = Game.startConvo(speaker);
  check(`${mode}: convo opened`, !!(r && !r.refused), `refused=${r && r.refused}`);
  if (!r || r.refused) return;
  Game.convoTurn(speaker, 'alive:event:table');
  const line = lastNpcLine(Game, speaker);
  try { Game.endConvo(speaker, 'left'); } catch (e) {}
  if (mode === 'table-exhaustion') {
    check('table-exhaustion: reply is NOT a dry line', !isDry(line), String(line).slice(0, 160));
    check('table-exhaustion: reply IS a table line (content served)', isTableLine(line), String(line).slice(0, 160));
    check('table-exhaustion: reply carries a thinking preamble (stage-2 prefix)', hasPreamble(line), String(line).slice(0, 160));
    check('table-exhaustion: NO dry line anywhere in the transcript', !transcriptHasDry(Game, speaker), 'dry line present in transcript');
  } else if (mode === 'control') {
    check('control: reply is NOT a dry line', !isDry(line), String(line).slice(0, 160));
    check('control: reply IS a table line', isTableLine(line), String(line).slice(0, 160));
    check('control: reply is plain (no preamble on an unblocked path)', !hasPreamble(line), String(line).slice(0, 160));
    check('control: NO dry line anywhere in the transcript', !transcriptHasDry(Game, speaker), 'dry line present in transcript');
  }
}

const CASES = ['table-exhaustion', 'control', 'mourning-all-blocked'];

async function main() {
  const mode = process.argv[2];
  if (mode && CASES.includes(mode)) {
    await runCase(mode);
  } else {
    await runCase('table-exhaustion');
    for (const m of CASES.slice(1)) {
      try {
        const out = execFileSync('node', [path.join(__dirname, 'test-journey-succession-r268-table-dry.js'), m],
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
