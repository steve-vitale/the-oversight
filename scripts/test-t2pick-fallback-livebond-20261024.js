#!/usr/bin/env node
// test-t2pick-fallback-livebond-20261024.js — LIVE-BOND FALLBACK proof
// (journey-social 2026-10-24 r49).
//
// Finding (r49 FOLLOW-THROUGH): r47 fixed the deep-bond read, but the
// fallback still names strangers. The groups fallback in t2pickOther
// returns a member of the FIRST group in list order — it never checks
// whether the SPEAKER is in that group. Wild proof (seed 4503): 8
// different speakers all named Sergio at ledger depth 0/1, none of them
// sharing a group with him; pooled late-null share 4/14 = 28.6%, which
// fired r49's pre-registered fallback trigger (>= 20% late null).
//
// Fix (src/js/convoTopics.js t2pickOther, r49): after the deep-bond
// (>= 2) loop, prefer the deepest LIVE bond (depth >= 1 — a real,
// repeated relationship) and name it with why='close'; when the speaker
// holds no live bond at all, fall through to the neutral roster pick
// (why='neutral', honest non-claim lines). The groups loop is deleted:
// no more first-group strangers, no more trust-claims about people with
// no ledger record at all. Grievance branches keep priority; dead
// partners are never named (both loops check).
//
// Proves (RED-verified on the pre-fix code: A, B, F fail there):
//   A. Speaker NOT in the first group, no bonds -> neutral (not the
//      first-group stranger with a close claim).
//   B. Depth>=1 live bond named with why='close' (not the group fallback).
//   C. Deep bond (>= 2) still beats a live bond (r47 regression).
//   D. Grievance branch keeps priority over every close read (regression).
//   E. Dead deep bond skipped; live bond named instead.
// Usage: node scripts/test-t2pick-fallback-livebond-20261024.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(cond, name, extra) {
  if (cond) { pass++; console.log('  ok - ' + name); }
  else { fail++; console.log('  FAIL - ' + name + (extra ? ' (' + extra + ')' : '')); }
}

function setDepth(Game, a, b, depth) {
  const v = Game.state.village;
  void v;
  for (let i = 0; i < depth * 5; i++) {
    Game.state.scholar.day += 1;
    Game.bondAdd(a, b, 6, 'proof');
  }
  const bnd = Game.bondGet(a, b) || {};
  return bnd.depth || 0;
}

(async () => {
  const { Game } = await loadGame({ seed: 4545, mode: 'proof' });
  await setupGame(Game);
  const v = Game.state.village;
  const me = Game.villagerId;
  const npcs = Game.npcIds().filter(id => id !== me);
  ok(npcs.length >= 8, 'roster has NPCs', 'npcs=' + npcs.length);

  const roster = (v.roster || []).filter(id => id !== me);
  const living = (id) => { try { return !((Game.getPerson(id) || {}).dead); } catch (e) { return true; } };
  // first group the OLD fallback would serve: first group with a living roster mate
  let firstGroup = null;
  for (const g of (v.groups || [])) {
    const mates = (g.members || []).filter(id => roster.indexOf(id) !== -1 && living(id));
    if (mates.length) { firstGroup = g; break; }
  }
  ok(!!firstGroup, 'a first group with living mates exists', 'groups=' + (v.groups || []).length);

  const hasBond = (id) => Object.keys(v.bonds || {}).some(k => String(k).split('|').indexOf(id) !== -1);
  const inConflict = (id) => (v.conflicts || []).some(c => !c.resolved && (c.a === id || c.b === id));
  const cleanSpeakers = npcs.filter(id => !hasBond(id) && !inConflict(id) && living(id));
  ok(cleanSpeakers.length >= 4, 'enough clean speakers (no bonds, no conflicts)', 'clean=' + cleanSpeakers.length);

  const firstMembers = new Set(firstGroup ? (firstGroup.members || []) : []);
  // SA: speaker NOT in the first group (the stranger case)
  const SA = cleanSpeakers.find(id => !firstMembers.has(id));
  ok(!!SA, 'found a speaker outside the first group', 'SA=' + SA);
  // SB + F: live-bond pair, F NOT in the first group (else the old
  // fallback could name F by coincidence and mask the RED)
  const SB = cleanSpeakers.find(id => id !== SA);
  const F = npcs.find(id => id !== SA && id !== SB && !firstMembers.has(id) && !hasBond(id) && living(id));
  ok(!!SB && !!F, 'found a live-bond pair outside the first group', 'SB=' + SB + ' F=' + F);
  const SC = cleanSpeakers.find(id => id !== SA && id !== SB);
  const D = npcs.find(id => id !== SA && id !== SB && id !== SC && id !== F && !hasBond(id) && living(id));
  ok(!!SC && !!D, 'found a deep-bond pair', 'SC=' + SC + ' D=' + D);
  const SD = cleanSpeakers.find(id => id !== SA && id !== SB && id !== SC);
  const O = npcs.find(id => id !== SA && id !== SB && id !== SC && id !== SD && id !== F && id !== D && living(id));
  ok(!!SD && !!O, 'found a grievance pair', 'SD=' + SD + ' O=' + O);
  if (!SA || !SB || !F || !SC || !D || !SD || !O) { console.log(`\n${pass} passed, ${fail} failed (setup short).`); process.exit(1); }

  // ---- A. no bonds, speaker outside the first group -> neutral, not a stranger-close ----
  const preA = Game.t2pickOther(SA);
  ok(preA && preA.why === 'neutral', 'A: no live bond + outside first group -> neutral (not first-group stranger close)',
    JSON.stringify(preA && { id: preA.id, why: preA.why }));

  // ---- B. depth>=1 live bond named with close ----
  const d1 = setDepth(Game, SB, F, 1);
  ok(d1 >= 1, 'live bond driven to depth>=1', 'depth=' + d1);
  const postB = Game.t2pickOther(SB);
  ok(postB && postB.id === F && postB.why === 'close', 'B: depth>=1 live bond named with close, not the group fallback',
    JSON.stringify(postB && { id: postB.id, why: postB.why }));

  // ---- C. deep bond still beats a live bond (r47 regression) ----
  const d2 = setDepth(Game, SC, D, 2);
  ok(d2 >= 2, 'deep bond driven to depth>=2', 'depth=' + d2);
  const postC = Game.t2pickOther(SC);
  ok(postC && postC.id === D && postC.why === 'close', 'C: deep bond wins',
    JSON.stringify(postC && { id: postC.id, why: postC.why }));

  // ---- E. dead deep bond skipped; live bond named instead ----
  const F2 = npcs.find(id => id !== SA && id !== SB && id !== SC && id !== SD && id !== F && id !== D && id !== O && living(id));
  ok(!!F2, 'found a second deep partner for E', 'F2=' + F2);
  if (F2) {
    const dE = setDepth(Game, SB, F2, 2);
    ok(dE >= 2, 'second deep bond driven', 'depth=' + dE);
    const gp2 = Game.getPerson(F2);
    if (gp2) gp2.dead = true;
    const postE = Game.t2pickOther(SB);
    ok(postE && postE.id === F && postE.why === 'close', 'E: dead deep bond skipped, live bond named',
      JSON.stringify(postE && { id: postE.id, why: postE.why }));
  }

  // ---- D. grievance keeps priority (regression) ----
  Game.recordGrievance(SD, O, 'ambushed', 30);
  const gp = Game.t2pickOther(SD);
  ok(gp && (gp.why === 'vgrievance' || gp.why === 'grievance') && gp.id === O,
    'D: grievance branch keeps priority over close reads', JSON.stringify(gp && { id: gp.id, why: gp.why }));

  console.log(`\n${pass} passed, ${fail} failed.`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(2); });
