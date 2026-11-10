#!/usr/bin/env node
// test-journey-succession-r170-lately-dry.js — proof test for the r170
// ASK:LATELY-DRY fix (journey-succession r169 finding, carried by r169).
//
// The r169 wild case (seed 34016 d62 Catalina, successor-life d+30):
// the player asks "How are you holding up — really?" (ask:lately)
// and hears "...Sorry, lost my train of thought." The sayTrace pins
// it: pick ask:lately, key '"Huh. Let me think about that." "You
// asked me that before. It\'s a different question now." "Have you
// felt it? Like the air before a storm, but — bigger. Something\'s
// on its way."', preSelf=false, preRun=TRUE, fellBack=true. The
// lately topic is the village-wide table-waiting event (t2gen_lately
// 'table'/'waiting', 2 variants); topic2Ask picks the event line,
// prepends the t2changeLine ack when re-asked after the clock moves,
// and _convoTurn's convoComposeBeat prepends a random topic ack
// (1 of 3) — so the composed line is ack + change + event. With 3
// acks x 3 change lines x 2 event lines, two villagers can compose
// the IDENTICAL string; the first speaker ledgers it, the second
// speaker's sayLine (structural:false at conversation.js:7169)
// run-blocks it and dry-replaces it — and the dry line comes back
// TRUTHY, so the `|| line` fallback never fires (the r166 lesson).
//
// The event line is village-wide news: every villager feels the same
// storm coming. Two villagers reporting the same shared event in the
// same words is not parroting. The fix (src/js, conversation.js
// ask: branch): `if (topic === 'lately') structuralTurn = true;` —
// the generic emission skips the run-ledger block for the lately
// answer, the same class as the r17 structural beats and the r25
// mood-silence line. The per-sitting ledger still applies; the
// event/ack/change pools still cycle per villager.
//
// Staging note (the 2-speaker search found 0 hits in 150 seeds):
// convoPick's village-fresh preference steers each speaker to the
// variant nobody said yet, so two speakers can never compose the
// same line. Three speakers fix it: A speaks one variant, C speaks
// the other, both are village-stale for B, and B's event pick is a
// free draw. Seed 5600 collides on the first try (B composes A's
// exact line). Both event variants are poisoned in the run ledger
// so the event pick is a free draw for every speaker.
//
// Cases (each in its own process — never two harnesses in one process):
//   collision : A + C speak lately, then B asks lately; B composes
//     A's exact line. B's reply must be the honest event line,
//     never a dry line, with no dry line anywhere in B's
//     transcript. RED on unfixed code (B dries).
//   control   : seed 5601, no poisoning — B's composed line does not
//     collide with A's or C's (match=false on the search), so B's
//     turn is genuinely unblocked. All three answer honestly. The
//     fix must not change any unblocked path.
// Usage: node scripts/test-journey-succession-r170-lately-dry.js [case]
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
// The table-waiting event lines, verbatim from t2gen_lately.
const isEventLine = (t) => /table's coming|air before a storm/i.test(String(t || ''));

const EVENTS = [
  '"They say the table\'s coming. For us. I keep thinking about what we\'d even bring to it."',
  '"Have you felt it? Like the air before a storm, but — bigger. Something\'s on its way."',
];

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

// TRANSCRIPT-SCAN (r169 lesson): the last-line check alone is NOT
// enough — a fall-through after sayLine can leave the dry line
// visible ahead of the closer. Assert no dry line anywhere in the
// transcript.
function transcriptHasDry(Game, vid) {
  const c = Game.convoGet(vid);
  const tr = (c && c.transcript) || [];
  return tr.some(e => e.who === 'them' && isDry(e.text));
}

async function runCase(mode) {
  // Collision seed 5600 (B composes A's exact line); control seed 5601
  // (B's line does not collide — a genuinely unblocked turn).
  const seed = mode === 'control' ? 5601 : 5600;
  const { Game } = await loadGame({ seed, mode: 'succession-r170-lately-dry-proof', fullTelemetry: true });
  await setupGame(Game);
  Game.progState().tableWaiting = true;
  const v = Game.state.village || {};
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  check(`${mode}: three villagers available`, roster.length >= 3, `roster=${roster.length}`);
  if (roster.length < 3) return;
  const [A, C, B] = roster;
  v.trust = v.trust || {};
  v.trust[A] = 90; v.trust[C] = 90; v.trust[B] = 90;
  if (mode === 'collision') {
    // Poison both event variants so the event pick is a free draw for
    // every speaker (otherwise the village-fresh preference steers each
    // speaker to the other variant and no collision can form).
    poisonRunLedger(Game, EVENTS.map(e => firstChunk(Game, e)));
  }
  const ev = Game.t2LatelyEvent(A);
  check(`${mode}: lately event is table/waiting`, !!(ev && ev.kind === 'table' && ev.phase === 'waiting'), `event=${ev && ev.kind + '/' + ev.phase}`);
  if (!ev || ev.kind !== 'table' || ev.phase !== 'waiting') return;
  const lines = {};
  for (const [who, vid] of [['A', A], ['C', C], ['B', B]]) {
    const r = Game.startConvo(vid);
    check(`${mode}: ${who} convo opened`, !!(r && !r.refused), `refused=${r && r.refused}`);
    if (!r || r.refused) return;
    Game.convoTurn(vid, 'ask:lately');
    lines[who] = lastNpcLine(Game, vid);
    try { Game.endConvo(vid, 'left'); } catch (e) {}
  }
  check(`${mode}: A speaks the event line, not dry`, isEventLine(lines.A) && !isDry(lines.A), String(lines.A).slice(0, 120));
  check(`${mode}: C speaks the event line, not dry`, isEventLine(lines.C) && !isDry(lines.C), String(lines.C).slice(0, 120));
  check(`${mode}: B reply is NOT a dry line`, !isDry(lines.B), String(lines.B).slice(0, 120));
  check(`${mode}: B reply IS the honest event line`, isEventLine(lines.B), String(lines.B).slice(0, 120));
  if (mode === 'collision') {
    // The sharp assertion: B speaks the SAME shared line A (or C)
    // spoke — the village's shared words about the same storm, not a
    // paraphrase. On unfixed code B dries instead, so this fails RED.
    const shared = firstChunk(Game, lines.B) === firstChunk(Game, lines.A)
      || firstChunk(Game, lines.B) === firstChunk(Game, lines.C);
    check('collision: B speaks the shared line (same first chunk as A or C)', shared, `B=${String(lines.B).slice(0, 100)}`);
  }
  check(`${mode}: NO dry line anywhere in B's transcript`, !transcriptHasDry(Game, B), 'dry line present in B transcript');
}

async function main() {
  const mode = process.argv[2];
  if (mode && ['collision', 'control'].includes(mode)) {
    await runCase(mode);
  } else {
    await runCase('collision');
    for (const m of ['control']) {
      try {
        const out = execFileSync('node', [path.join(__dirname, 'test-journey-succession-r170-lately-dry.js'), m],
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
