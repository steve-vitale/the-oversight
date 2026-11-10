#!/usr/bin/env node
// test-journey-succession-r169-dlgmore-dry.js — proof test for the r169
// DLG:MORE-DRY fix (journey-succession r165 finding, carried by r166).
//
// The r165 wild case (seed 34003 d71 Javier, successor-life d+30):
// after a secret ("I have been lying about my age") + buried bundle +
// promise, the player picks "Tell me more." (dlg:more) and hears
// "...Sorry, lost my train of thought." The sayTrace pins it: pick
// dlg:more, key '"I wish there was more to tell. That\'s it."'
// (variant 2 of the dlg:more dry pool), preSelf=false, preRun=TRUE,
// fellBack=true. The secret thread has no follow-ups, so
// convoThreadBeat returns null and the dlg:more handler falls to its
// dry pool — convoPickCycle(vid, 'dlg:more:dry', [3 closers]). All 3
// closers had already been spoken to Javier across sittings, so
// convoPick returned null and the cross-key reset freed the oldest;
// convoPick's run-ledger handling is a preference, not a filter, so
// it returned the freed variant anyway even though it sat in the
// 48-entry run ledger. sayLine ({tag:'endtopic'}, structural:false)
// run-blocked it and dry-replaced it — and the dry line comes back
// TRUTHY, so the handler's || fallback never fires (the r166 lesson).
//
// The dry line is honest when a CONTENT beat is blocked. As a thread
// wind-down closer it is dishonest: the villager is not forgetting,
// he is done. The fix (src/js, convo-dialogue.js dlg:more dry path):
// the closer is emitted with {structural: true} — thread wind-down
// closers are conversation GRAMMAR, not content, the same class as
// the r17 structural beats (resume openers, recap lines,
// thread-resume responses). The pool still cycles per villager
// (pickCycle keep=2, no immediate verbatim repeat); the line still
// lands in the per-villager ledgers, just not the run ledger; the
// dry line stays available for genuine content-beat blocks.
//
// Cases (each in its own process — never two harnesses in one process):
//   dry-allblocked : all 3 closers poisoned in the run ledger AND
//     said to this villager (the Javier state). The reply must be an
//     honest closer, never a dry line. RED on unfixed code (reply is
//     the dry line).
//   control        : no poisoning. The reply is a closer from the
//     pool and the thread is marked dry (dlg:more retires).
// Usage: node scripts/test-journey-succession-r169-dlgmore-dry.js [case]
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

// The dlg:more dry pool, verbatim from src/js/convo-dialogue.js.
const CLOSERS = [
  '"That\'s... pretty much all of it, honestly."',
  '"I wish there was more to tell. That\'s it."',
  '"That\'s the whole of it. Sorry."',
];
const isCloser = (t) => CLOSERS.some(c => String(t || '').includes(c.replace(/"/g, '').slice(0, 30)));

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

// Stage the Javier state: a conversation on a thread with no
// follow-ups ('secret' has no convoThreadBeat branch), no pending
// secret follow-up, all 3 dry closers already said to this villager
// (across sittings — c.said persists) and, in the allblocked case,
// all 3 in the run ledger too.
function stageDryThread(Game, vid, poison) {
  const c = Game.convoGet(vid);
  c.thread = 'secret';
  c.secretFollowup = null;
  c.threadDryFor = null;
  c.said = c.said || {};
  c.said['dlg:more:dry'] = CLOSERS.slice();
  if (poison) poisonRunLedger(Game, CLOSERS.map(cl => firstChunk(Game, cl)));
  return c;
}

async function runCase(mode) {
  const seed = { 'dry-allblocked': 5528, control: 5529 }[mode] || 5528;
  const { Game } = await loadGame({ seed, mode: 'succession-r169-dlgmore-dry-proof', fullTelemetry: true });
  await setupGame(Game);
  const v = Game.state.village || {};
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  check(`${mode}: villager available`, roster.length >= 1, `roster=${roster.length}`);
  if (!roster.length) return;
  const vid = roster[0];
  v.trust = v.trust || {};
  v.trust[vid] = 90;
  const r = Game.startConvo(vid);
  check(`${mode}: convo opened`, !!(r && !r.refused), `refused=${r && r.refused}`);
  if (!r || r.refused) return;
  stageDryThread(Game, vid, mode === 'dry-allblocked');
  const before = Game.convoGet(vid);
  check(`${mode}: threadBeat is null on the staged thread`, Game.convoThreadBeat(vid) === null, `beat=${String(Game.convoThreadBeat(vid)).slice(0, 60)}`);
  Game.convoTurn(vid, 'dlg:more');
  const reply = lastNpcLine(Game, vid);
  check(`${mode}: reply is NOT a dry line`, !isDry(reply), reply.slice(0, 120));
  check(`${mode}: reply IS an honest closer`, isCloser(reply), reply.slice(0, 120));
  const after = Game.convoGet(vid);
  check(`${mode}: thread marked dry (dlg:more retires)`, !!(after && after.threadDryFor === 'secret'), `threadDryFor=${after && after.threadDryFor}`);
  try { Game.endConvo(vid, 'left'); } catch (e) {}
  void before;
}

async function main() {
  const mode = process.argv[2];
  if (mode && ['dry-allblocked', 'control'].includes(mode)) {
    await runCase(mode);
  } else {
    await runCase('dry-allblocked');
    for (const m of ['control']) {
      try {
        const out = execFileSync('node', [path.join(__dirname, 'test-journey-succession-r169-dlgmore-dry.js'), m],
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
