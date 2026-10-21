#!/usr/bin/env node
// diag-inh-resume-20261021.js — r33 Q2 follow-up diagnostic: WHY doesn't the
// "You're wearing X's shoes now" opener variant fire in the succession
// profile? The r33 pilot (seeds 9801-9804) showed:
//  - threads DO open with the smart driver and DO get inh-stamped at death;
//  - post-death driven convos fire the resume opener, but always the
//    NON-inherited variant ("We never finished... 7 days back") —
//    inheritedName(o) apparently returned null for the thread that fired.
// This diag snapshots the engine's OWN open-thread view
// (Game.convoOpenThreads) with tids/days/inh at: post-plant, post-death,
// and immediately pre/post startConvo on death-day+1, then reports the
// opener's first NPC line and which thread was spent.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const SEED = parseInt(process.env.SEED || '9805', 10);
function firstName(n) { return String(n || 'Someone').split(' ')[0]; }
function rawName(Game, vid) {
  try { const rc = ((Game.state.village || {}).rosterChars || {})[vid]; if (rc && rc.name) return rc.name; } catch (e) {}
  return String(vid).slice(0, 12);
}
function dayOf(Game) { try { return Game.state.scholar.day || 0; } catch (e) { return 0; } }
function threadsOf(Game, vid) {
  try {
    return (Game.convoOpenThreads(vid) || []).map(o => ({
      tid: o.tid, day: o.day, inh: o.inh || null,
      inhName: Game.inheritedName ? Game.inheritedName(o) : '?',
      label: (o.label || '').slice(0, 40),
    }));
  } catch (e) { return [{ err: e.message }]; }
}
function snap(Game, vid, label) {
  const ts = threadsOf(Game, vid);
  console.error(`THREADS ${label} d${dayOf(Game)} (${firstName(rawName(Game, vid))}): ${ts.length} open`);
  for (const t of ts) console.error(`   ${JSON.stringify(t)}`);
  return ts;
}

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'diag-inh-resume', fullTelemetry: true });
  await setupGame(Game);
  const E = console.error;
  for (let d = 1; d <= 9; d++) { if (!Game.over) await runDays(Game, competent, { days: 1 }); }
  const v = Game.state.village || {};
  const bearer0 = Game.villagerId;
  const tgt = (v.roster || []).find(id => id !== bearer0);
  E(`bearer <redacted> ${firstName(rawName(Game, bearer0))}, planting with ${firstName(rawName(Game, tgt))} (trust ${((v.trust || {})[tgt] || 0)})`);
  // smart-driver plant (r31 verbatim, 10 turns)
  Game.startConvo(tgt);
  for (let t = 0; t < 10; t++) {
    const choices = Game.convoChoices(tgt) || [];
    if (!choices.length) break;
    const c = Game.convoGet(tgt);
    const wantId = (c && c.want && c.want.id) || '';
    let pick = choices.find(x => /^want:/.test(x.id) && !/favor/i.test(x.text || ''));
    if (!pick) pick = choices.find(x => /^want:/.test(x.id));
    if (!pick) pick = choices.find(x => /^(dlg:help|dlg:details)$/.test(x.id));
    if (!pick || /^(leave|bye|goodbye)/.test(pick.id)) break;
    Game.convoTurn(tgt, pick.id);
    const cc = Game.convoGet(tgt);
    if (!cc || !cc.active) break;
  }
  try { Game.endConvo(tgt, 'left'); } catch (e) {}
  snap(Game, tgt, 'POST-PLANT');
  const before = threadsOf(Game, tgt).map(t => t.tid).sort().join(',');
  const oldFirst = firstName(rawName(Game, bearer0));
  Game.playerDeath('a hushwolf');
  const newFirst = firstName(rawName(Game, Game.villagerId));
  E(`death d${dayOf(Game)}: ${oldFirst} -> ${newFirst}`);
  snap(Game, tgt, 'POST-DEATH');
  // +1 day of competent play, then drive the convo and watch the opener
  await runDays(Game, competent, { days: 1 });
  snap(Game, tgt, 'PRE-CONVO d+1');
  E('--- startConvo ---');
  Game.startConvo(tgt);
  const c0 = Game.convoGet(tgt);
  const tr0 = ((c0 && c0.transcript) || []).map(e2 => `${e2.who === 'you' ? 'YOU' : 'NPC'}: ${String(e2.text).slice(0, 300)}`);
  E('OPENER-FIRST-LINES:');
  for (const l of tr0.slice(0, 4)) E('  ' + l);
  const after = threadsOf(Game, tgt).map(t => t.tid).sort().join(',');
  snap(Game, tgt, 'POST-OPENER');
  E(`spent-diff: before=[${before}] after=[${after}]`);
  // full first-turn readout for the sense check
  try { Game.endConvo(tgt, 'left'); } catch (e) {}
  // verdict: did any opener variant name the predecessor?
  const named = tr0.some(l => new RegExp(oldFirst).test(l));
  E(`VERDICT: opener named predecessor (${oldFirst}): ${named}`);
}
main().catch(e => { console.error('FATAL: ' + (e && e.stack || e)); process.exit(1); });
