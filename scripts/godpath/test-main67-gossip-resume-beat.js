#!/usr/bin/env node
// test-gossip-resume-beat-20261019.js — PROOF for journey-social r28
// (lane B, leg 5): the r27-documented blank — resuming an OPEN gossip
// thread ("About the gossip — we never finished.") produced the generic
// resume echo and then the thread stalled to winddown with no content,
// because convoThreadBeat has no gossip branch (goal/past/plans/want/topic2
// only). The fix delivers the gossip engine's next beat on resume.
//
// RED on master: convoThreadBeat(vid) with c.thread='gossip' returns null;
// the alive:thread:gossip resume speaks the generic echo and nothing more.
// GREEN: the resume delivers a real gossip beat; follow-ups keep the thread
// alive; a dry gossip pool honestly declines ("Quiet lately") instead of
// stalling.
'use strict';
const { loadGame, setupGame } = require('../sim-harness');

const GENERIC_RE = /never did get back to that|we never finished/i;

async function main() {
  const { Game } = await loadGame({ seed: 424242, mode: 'mvc' });
  setupGame(Game);

  let pass = 0, fail = 0;
  const t = (name, cond, extra) => {
    if (cond) { pass++; }
    else { fail++; console.log('  FAIL: ' + name + (extra ? ' :: ' + extra : '')); }
  };

  const v = Game.state.village;
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  t('roster has NPCs', roster.length >= 5);
  const vid = roster[0];
  const other = roster[1];
  // gossip needs rapport (effTrust>=20); the test grants it directly.
  v.trust = v.trust || {}; v.trust[vid] = 30;

  // Seed a meaty rumor this NPC has heard: the engine's salience order will
  // lead with a scandal about another villager.
  v.gossip = v.gossip || [];
  v.gossip.push({ heard: [vid], dims: { who: other }, action: 'generous', distortion: 0 });

  // --- 1. natural flow: ask gossip, then walk away mid-thread ---
  // (ask:gossip is driven directly — the test targets the resume path, not
  // menu gating; the handler parses the choiceId either way.)
  let st = Game.startConvo(vid);
  t('startConvo opens', !!st && !!st.line);
  let choices = Game.convoChoices(vid) || [];
  const ans0 = choices.find(c => c && /^ans:/.test(c.id)) || choices.find(c => c && c.id === 'deflect_q');
  if (ans0) Game.convoTurn(vid, ans0.id); // clear their opening question first
  const g1 = Game.convoTurn(vid, 'ask:gossip');
  t('gossip ask delivers a line', !!(g1 && g1.line), String(g1 && g1.line).slice(0, 120));
  console.log('  GOSSIP LINE: ' + String(g1 && g1.line).slice(0, 220));
  t('gossip thread set', Game.convoGet(vid).thread === 'gossip');
  Game.convoTurn(vid, 'leave'); // walk away mid-thread -> plants open thread
  const open = Game.convoOpenThreads(vid) || [];
  t('open gossip thread planted', open.some(o => o && o.tid === 'gossip'),
    JSON.stringify(open.map(o => o.tid)));

  // --- 2. resume: the alive:thread:gossip choice must exist and deliver ---
  st = Game.startConvo(vid);
  choices = Game.convoChoices(vid) || [];
  const ans1 = choices.find(c => c && /^ans:/.test(c.id)) || choices.find(c => c && c.id === 'deflect_q');
  if (ans1) Game.convoTurn(vid, ans1.id);
  choices = Game.convoChoices(vid) || [];
  const resume = choices.find(c => c && c.id === 'alive:thread:gossip');  t('alive:thread:gossip offered on resume', !!resume,
    JSON.stringify(choices.map(c => c.id).slice(0, 16)));
  const r = Game.convoTurn(vid, 'alive:thread:gossip');
  const rline = String((r && r.line) || '');
  t('resume speaks a line', rline.length > 10, rline.slice(0, 120));
  t('resume is NOT the generic echo', !GENERIC_RE.test(rline), rline.slice(0, 160));
  t('resume carries gossip content', /generous|sharing|Word is/i.test(rline), rline.slice(0, 160));
  console.log('  RESUME LINE: ' + rline.slice(0, 220));

  // --- 3. follow-up on the resumed thread keeps it alive ---
  const beat = Game.convoThreadBeat(vid);
  t('convoThreadBeat returns a beat for thread=gossip', !!(beat && String(beat).length > 10),
    String(beat).slice(0, 120));
  console.log('  FOLLOWUP BEAT: ' + String(beat).slice(0, 220));

  // --- 4. dry pool: honest decline, not a stall ---
  v.gossip = [];
  const c = Game.convoGet(vid);
  c.thread = 'gossip'; c.depth = 1;
  const dry = Game.convoThreadBeat(vid);
  const dryLine = String(dry || '');
  t('dry gossip pool yields an honest beat, not null', dryLine.length > 5, dryLine.slice(0, 120));
  t('dry beat admits the quiet', /quiet|nothing new|keeping to themselves/i.test(dryLine), dryLine.slice(0, 160));
  console.log('  DRY BEAT: ' + dryLine.slice(0, 220));

  const oldAsk = Game.askAbout, oldSay = Game.say, oldWarn = console.warn, errors = [];
  try {
    Game.askAbout = () => { throw Error('injected gossip failure'); };
    console.warn = (...args) => errors.push(args);
    t('failed gossip still restores the real narrator', Game.convoGossipBeat(vid) === '' && Game.say === oldSay);
    t('failed gossip reports the fault for diagnostics', errors.length === 1 && String(errors[0][1]).includes('injected gossip failure'));
  } finally { Game.askAbout = oldAsk; Game.say = oldSay; console.warn = oldWarn; }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('PROOF CRASH:', e); process.exit(2); });
