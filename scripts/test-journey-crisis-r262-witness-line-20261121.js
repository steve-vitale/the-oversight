#!/usr/bin/env node
'use strict';
// Proof: the witness pick speaks the witness line, not a fixed label
// (journey-crisis r262, fix 4 — r261 blemish 1: "Names, named." is a
// transcript label, not the game's answer).
//
// THE LABEL (r261 panel, every case): every witness pick printed
// `NPC: Names, named.` in the driven transcript — but the game's own
// sayLines answered honestly ("No one saw Sanne leave. Just trees.").
// betrayal.js called nameWitnesses (which speaks the real line into
// sayLines) and then returned finish('Names, named.'), which is what
// the transcript recorded. On r261's panel every case's witness list
// was empty, so the r258 self-witness fix held vacuously — but the
// transcript label claimed names were named when the game said no one
// saw.
//
// GREEN (post-fix): nameWitnesses returns the line it said, and the
// 'witnesses' pick speaks that line into the transcript — the empty
// case records "No one saw you leave. Just trees." and the named case
// records the witness's name; neither records 'Names, named.'.
// Staging mirrors test-betrayal.js (arm a plot, spring the ambush,
// take the aftermath case, drive the pick through betrayalTurn), loaded
// through the shared harness (scripts/godpath/lib) — the raw-eval list
// in test-betrayal.js is missing src/js/text.js on this base and fails
// before it starts (pre-existing, not this run).
// Exits nonzero on failure.
const assert = require('assert');
const K = require('./godpath/lib');

let pass = 0;
function check(name, condition, extra) {
  assert(condition, name + (extra ? ' :: ' + extra : ''));
  pass++;
  console.log('  ok ' + name);
}

async function main() {
  const Game = await K.load({ seed: parseInt(process.env.SEED || '4242', 10) });
  K.newRun(Game);
  const said = [];
  const realSay = Game.say.bind(Game);
  Game.say = (t) => { said.push(String(t)); return realSay(t); };

  const v = Game.state.village;
  const npcs = () => v.roster.filter(id => id !== Game.villagerId);
  const [A, B, C, D, E, F] = npcs();

  function stageCase(leader, accomplices, target, witnesses) {
    const p = Game.armPlot(leader, accomplices, target, { score: 60, reasons: ['grievance'] });
    Game.inviteHistory(p.inviter).pending = null;
    Game.springAmbush(p);
    p.woundsTaken = 8;
    const after = Game.ambushAftermath(p, 'escaped');
    const cs = Game.getCase(after.caseId);
    if (!cs) throw new Error('case did not open');
    // The aftermath re-derives plot.witnesses from who was actually around
    // (betrayal.js ~1331), so the staged witness list must be set AFTER
    // it — on the stored plot, which nameWitnesses reads at call time.
    const stored = (Game.betrayalState().plots || []).find(x => x.id === p.id);
    if (stored) stored.witnesses = witnesses; // the geometry under test: none saw, or one did
    return cs;
  }
  const transcriptText = (res) => (res && res.transcript ? res.transcript.map(e => String(e.text || '')).join(' ') : '');

  // ---- 1. empty witness list: the transcript says no one saw. ----
  const c1 = stageCase(A, [B, C], Game.villagerId, []);
  const opened1 = Game.startConvo(B);
  check('case-1 conversation opens', !!(opened1 && !opened1.refused && !opened1.ended));
  const r1 = Game.betrayalTurn(B, 'betrayal:witnesses:' + c1.id);
  console.log('  empty-witness pick -> ' + JSON.stringify(r1 && r1.line));
  check('empty witnesses: the pick speaks "No one saw you leave"',
    typeof r1.line === 'string' && /No one saw you leave\. Just trees\./.test(r1.line), 'got: ' + r1.line);
  check('empty witnesses: the transcript never says "Names, named."',
    !/Names, named\./.test(transcriptText(r1)), 'transcript: ' + transcriptText(r1).slice(0, 200));
  check('empty witnesses: the day log agrees',
    said.some(s => /No one saw you leave\. Just trees\./.test(s)), 'said: ' + said.slice(-3).join(' | '));
  Game.endConvo(B, 'left');

  // ---- 2. a witness saw: the transcript names them. ----
  const c2 = stageCase(D, [E, F], Game.villagerId, [A]);
  const opened2 = Game.startConvo(E);
  check('case-2 conversation opens', !!(opened2 && !opened2.refused && !opened2.ended));
  const r2 = Game.betrayalTurn(E, 'betrayal:witnesses:' + c2.id);
  console.log('  named-witness pick -> ' + JSON.stringify(r2 && r2.line));
  // whoTag is the rendered tag (knowledge-gated: a stranger is described,
  // not named) — assert against it, not the raw id or disp name.
  const witName = String(Game.whoTag(A));
  check('named witness: the pick names the witness (' + witName + ')',
    // nameWitnesses capitalizes the tag (capFirst) — compare ignoring case.
    typeof r2.line === 'string' && r2.line.toLowerCase().includes(witName.toLowerCase()), 'got: ' + r2.line);
  check('named witness: the pick says they saw the walk out',
    typeof r2.line === 'string' && /saw you walk out together/.test(r2.line), 'got: ' + r2.line);
  check('named witness: the transcript never says "Names, named."',
    !/Names, named\./.test(transcriptText(r2)), 'transcript: ' + transcriptText(r2).slice(0, 200));
  Game.endConvo(E, 'left');

  // ---- 3. contract: nameWitnesses returns the line it said. ----
  const c3 = stageCase(A, [B, C], Game.villagerId, []);
  const ret = Game.nameWitnesses(c3.id);
  check('nameWitnesses returns its spoken line',
    typeof ret === 'string' && /No one saw you leave\. Just trees\./.test(ret), 'got: ' + JSON.stringify(ret));

  Game.say = realSay;
  console.log(`\nRESULT: ${pass} pass, 0 fail`);
}

main().catch(error => { console.error(error.stack); process.exitCode = 1; });
