#!/usr/bin/env node
// test-succession-open-book-20261018.js — PROOF for journey-succession r25:
// "the ledger across the grave."
//
// When the bearer <redacted> with open PROMISED favors, playerDeath (ledger.js)
// releases each promise (kept='released', inherited=true) and reverts its
// favor to 'asked' — SILENTLY. The designed delivery beat (the NPC re-ask
// naming the predecessor, convo-wants.js INHERITED ASK) is nearly
// unreachable in competent play: r25's 4-seed pilot fired it 1/4 (needs
// churn within days; the want economy rarely selects ask_favor first).
// The successor never learns what the dead bearer <redacted> The office inherits
// the KNOWLEDGE even though the obligation is released.
//
// FIX (ledger.js playerDeath, in the MANTLE HANDOFF RECORD block): when
// releasing open promises, name them once — asker + task, the promise died
// with its maker, the needs didn't. Fires only when >=1 open promise
// existed; clean books stay silent (old behavior preserved).
//
// RED: pre-fix tree -> the open-book line is absent (all other assertions
// hold — the release machinery itself is GO). GREEN: fix -> all pass.
// (Patch-file round-trip for RED, never stash.)
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(cond, name) {
  if (cond) { pass++; }
  else { fail++; console.error('FAIL:', name); }
}
function firstName(Game, vid) {
  try { const ch = (Game.data.villagers || []).find(x => x.id === vid); if (ch && ch.name) return ch.name.split(' ')[0]; } catch (e) {}
  return String(vid).slice(0, 8);
}

// Forced-promise handoff: fresh game, one promised favor, then the mantle.
async function handoffCase(seed, withPromise) {
  const { Game } = await loadGame({ seed, mode: 'succession-openbook-proof' });
  await setupGame(Game);
  const v = Game.state.village;
  const oldId = Game.villagerId;
  const oldFirst = firstName(Game, oldId);
  const others = (v.roster || []).filter(id => id !== oldId);
  const succ = others[0];
  v.trust = v.trust || {};
  for (const id of others) v.trust[id] = 10;
  v.trust[succ] = 100;
  let asker = null, task = null;
  if (withPromise) {
    // highest-trust non-successor NPC with a live need (mirrors r25 script)
    const pool = others.filter(id => id !== succ);
    for (const vid of pool) {
      let nd = null;
      try { nd = Game.convoFindFavorNeed(vid); } catch (e) {}
      if (!nd) continue;
      let f = null;
      try { f = Game.convoBuildFavor(vid, nd); } catch (e) {}
      if (!f || !f.task) continue;
      try { Game.convoStoreFavor(f); } catch (e) {}
      let cr = null;
      try { cr = Game.convoFavorCommit(vid, f); } catch (e) {}
      if (cr && cr.ok) { asker = vid; task = f.task; break; }
    }
  }
  const said = [];
  const _say = Game.say;
  Game.say = function (t) { said.push(String(t || '')); return _say ? _say.call(this, t) : undefined; };
  Game.playerDeath('the expedition');
  Game.say = _say;
  const vv = Game.state.village || {};
  const p = asker ? (vv.promises || {})[asker] : null;
  const f = asker ? (vv.favorLedger || {})[asker] : null;
  return {
    Game, oldId, oldFirst, succ, asker,
    askerFirst: asker ? firstName(Game, asker) : null,
    task,
    choseRight: Game.villagerId === succ,
    promise: p ? { kept: p.kept, inherited: !!p.inherited } : null,
    favorState: f ? f.state : null,
    openBook: said.filter(t => /book stays open/i.test(t)),
    said,
  };
}

async function main() {
  // Case 1: open promise at death -> the book is named once.
  const c1 = await handoffCase(4242, true);
  ok(c1.choseRight, 'successor chosen by trust');
  ok(!!c1.asker, 'a promised favor was forced (test fixture valid)');
  ok(c1.promise && c1.promise.kept === 'released' && c1.promise.inherited === true,
    'promise released+inherited (release machinery intact)');
  ok(c1.favorState === 'asked', 'favor reverted to asked');
  ok(c1.openBook.length === 1, `open-book line fires exactly once (got ${c1.openBook.length})`);
  if (c1.openBook.length === 1) {
    const line = c1.openBook[0];
    // knowledge-gated: the line must carry the task (which names the asker
    // as the game knows them — true name or descriptor), and the dead bearer.
    ok(line.includes(c1.task), 'line carries the promised task verbatim');
    ok(line.includes(c1.oldFirst), `line names the dead bearer <redacted>`);
    ok(/died with/i.test(line), 'line says the promise died with its maker (released, not broken)');
    ok(!/broken|betrayed|oathbreaker/i.test(line), 'line carries no broken-word stigma');
    console.log('   LINE:', line.slice(0, 220));
  }

  // Case 2: clean book -> silence (old behavior preserved).
  const c2 = await handoffCase(4243, false);
  ok(c2.choseRight, 'case2: successor chosen by trust');
  ok(c2.openBook.length === 0, `case2: no open-book line on a clean book (got ${c2.openBook.length})`);

  // Case 3: two open promises -> both named, still one line.
  const c3 = await (async () => {
    const { Game } = await loadGame({ seed: 4244, mode: 'succession-openbook-proof' });
    await setupGame(Game);
    const v = Game.state.village;
    const oldId = Game.villagerId;
    const oldFirst = firstName(Game, oldId);
    const others = (v.roster || []).filter(id => id !== oldId);
    const succ = others[0];
    v.trust = v.trust || {};
    for (const id of others) v.trust[id] = 10;
    v.trust[succ] = 100;
    const askers = [];
    for (const vid of others.filter(id => id !== succ)) {
      if (askers.length >= 2) break;
      let nd = null;
      try { nd = Game.convoFindFavorNeed(vid); } catch (e) {}
      if (!nd) continue;
      let f = null;
      try { f = Game.convoBuildFavor(vid, nd); } catch (e) {}
      if (!f || !f.task) continue;
      try { Game.convoStoreFavor(f); } catch (e) {}
      let cr = null;
      try { cr = Game.convoFavorCommit(vid, f); } catch (e) {}
      if (cr && cr.ok) askers.push({ vid, first: firstName(Game, vid), task: f.task });
    }
    const said = [];
    const _say = Game.say;
    Game.say = function (t) { said.push(String(t || '')); return _say ? _say.call(this, t) : undefined; };
    Game.playerDeath('the expedition');
    Game.say = _say;
    return { askers, tasks: askers.map(a => a.task), openBook: said.filter(t => /book stays open/i.test(t)), choseRight: Game.villagerId === succ, oldFirst };
  })();
  if (c3.askers.length >= 2) {
    ok(c3.openBook.length === 1, `case3: one line for two promises (got ${c3.openBook.length})`);
    if (c3.openBook.length === 1) {
      ok(c3.tasks.every(t => c3.openBook[0].includes(t)),
        `case3: line carries both promised tasks`);
    }
  } else {
    console.log(`   (case3 skipped: only ${c3.askers.length} promisable NPC found — fixture, not code)`);
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('FATAL: ' + (e && e.stack || e)); process.exit(1); });
