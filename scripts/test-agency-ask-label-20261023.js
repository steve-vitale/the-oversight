#!/usr/bin/env node
// test-agency-ask-label-20261023.js — PROOF (journey-establishment r27):
// The field-teach ask ("agency:ask_field") teaches monster > plant > place
// in priority order, but the menu label always promised "from the wild" —
// so when only places remained, "Teach me something from the wild." was
// answered with "a burned farmhouse — I'll show you on the map sometime."
// Four runs of sense-reads (r24–r27) flagged the misfire; root cause is the
// label, not the content (places are legitimate explorer knowledge, spent
// once, per journey-establishment r6 / journey-succession 2026-10-12).
// Fix: agencyChoices/agencyTurn share a topic-aware label
// (agencyAskFieldLabel) — places-only pools offer "What places have you
// found out there?", wild topics keep the old label, and the transcript's
// player echo matches the label actually picked.
// Exit 0 = green, 1 = failure.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let fails = 0;
function check(id, ok, detail) {
  console.log(`  [${ok ? 'OK' : 'FAIL'}] ${id}${detail ? ' -- ' + detail : ''}`);
  if (!ok) fails++;
}

const WILD = '"Teach me something from the wild."';
const PLACES = '"What places have you found out there?"';

function labelFor(Game, vid) {
  Game.startConvo(vid);
  // A pending reactive question owns the menu (convoMenuPage 'owns'
  // filter, r16 answers+2 contract) — answer it first so the agency
  // choice can surface. This is the same dance the r12 spent-choices
  // proof does.
  for (let i = 0; i < 4; i++) {
    const ch = (Game.convoChoices(vid) || []);
    if (ch.some(c => c && c.id === 'agency:ask_field')) break;
    const qpick = ch.map(c => c && c.id).find(id => /^ans:[a-z_]+:[a-z_]+$/.test(id || '') || /^gq:[a-z_]+:yes$/.test(id || ''));
    if (!qpick) break;
    Game.convoTurn(vid, qpick);
  }
  const ch = (Game.convoChoices(vid) || []).find(c => c && c.id === 'agency:ask_field');
  Game.endConvo(vid, 'left');
  return ch ? ch.label : null;
}

function turnAskField(Game, vid) {
  // Answer pending reactive questions, then take the agency ask and
  // return the transcript's player echo + npc reply lines.
  for (let i = 0; i < 4; i++) {
    const ch = (Game.convoChoices(vid) || []);
    if (ch.some(c => c && c.id === 'agency:ask_field')) break;
    const qpick = ch.map(c => c && c.id).find(id => /^ans:[a-z_]+:[a-z_]+$/.test(id || '') || /^gq:[a-z_]+:yes$/.test(id || ''));
    if (!qpick) break;
    Game.convoTurn(vid, qpick);
  }
  Game.convoTurn(vid, 'agency:ask_field');
  const tr = (Game.convoGet(vid).transcript || []);
  return {
    you: tr.filter(e => e.who === 'you').map(e => e.text),
    them: tr.filter(e => e.who === 'them').map(e => e.text),
  };
}

(async () => {
  const { Game } = await loadGame({ seed: 90223, mode: 'test-ask-label' });
  Game.say = () => {}; Game.sysSay = () => {};
  await setupGame(Game);
  const v = Game.state.village;
  const oldId = Game.villagerId;
  const npcs = (v.roster || []).filter(id => id !== oldId);
  const vid = npcs[0];
  v.trust[vid] = 90;
  const st = Game.agencyState();

  // ---- 1. places-only pool: label names places ----
  st.teachable[vid] = [];
  st.know[vid] = st.know[vid] || { plants: 0, monsters: 0, places: [], fought: [] };
  st.know[vid].places = ['a burned farmhouse', 'a ridge with a view for miles'];
  st.know[vid].fought = [];
  const l1 = labelFor(Game, vid);
  check('label:places-only', l1 === PLACES, `label=${l1}`);

  // ---- 2. plants available: wild label stands ----
  st.teachable[vid] = ['x', 'y'];
  const l2 = labelFor(Game, vid);
  check('label:plants-wild', l2 === WILD, `label=${l2}`);

  // ---- 3. teachable monster available: wild label stands ----
  st.teachable[vid] = [];
  st.know[vid].places = [];
  st.know[vid].fought = ['nevermore'];
  try { Game.state.codex.monsters = {}; } catch (e) {}
  const l3 = labelFor(Game, vid);
  check('label:monster-wild', l3 === WILD, `label=${l3}`);

  // ---- 4. transcript echo matches the picked label (places case) ----
  st.teachable[vid] = [];
  st.know[vid].fought = [];
  st.know[vid].places = ['a spring that runs clear'];
  const offered = labelFor(Game, vid);
  Game.startConvo(vid);
  const { you, them } = turnAskField(Game, vid);
  check('echo:label-matches', you.some(t => t === PLACES), `you said ${JSON.stringify(you.slice(-1))}, offered ${offered}`);
  check('echo:place-taught', them.some(t => /spring that runs clear/.test(t)), 'place taught in reply');
  Game.endConvo(vid, 'left');

  // ---- 5. dry pool: choice leaves the menu (r12 regression guard) ----
  st.know[vid].places = [];
  Game.startConvo(vid);
  const ch5 = (Game.convoChoices(vid) || []).map(c => c && c.id).filter(Boolean);
  check('menu:dry-pool-gone', !ch5.includes('agency:ask_field'), 'no ask when nothing to teach');
  Game.endConvo(vid, 'left');

  console.log(fails ? `\n${fails} FAILURES` : '\nALL GREEN');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('THREW:', e && e.stack || e); process.exit(1); });
