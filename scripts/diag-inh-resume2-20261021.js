#!/usr/bin/env node
// diag-inh-resume2-20261021.js — decisive test for the "You're wearing X's
// shoes now" opener variant. Drives REAL convos (full r31 driver) until >=1
// thread is open with the plant NPC, kills the bearer <redacted> the REAL
// playerDeath, then the next day runs 12 startConvo/endConvo cycles and
// records the opener's first NPC line each time. Counts: inherited-naming
// variants vs generic vs other openers. Usage: SEED=xxxx node ...
'use strict';
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const SEED = parseInt(process.env.SEED || '9821', 10);
function firstName(n) { return String(n || 'Someone').split(' ')[0]; }
function rawName(Game, vid) {
  try { const rc = ((Game.state.village || {}).rosterChars || {})[vid]; if (rc && rc.name) return rc.name; } catch (e) {}
  return String(vid).slice(0, 12);
}
function dayOf(Game) { try { return Game.state.scholar.day || 0; } catch (e) { return 0; } }
function nOpen(Game, vid) { try { return (Game.convoOpenThreads(vid) || []).length; } catch (e) { return -1; } }

// full r31 driver, verbatim pick order
function drive(Game, vid, maxTurns) {
  maxTurns = maxTurns || 14;
  try { Game.startConvo(vid); } catch (e) { return 'startConvo threw'; }
  const c0 = Game.convoGet(vid);
  if (!c0 || !c0.active) return 'refused';
  const picked = [];
  for (let t = 0; t < maxTurns; t++) {
    const choices = Game.convoChoices(vid) || [];
    if (!choices.length) break;
    const c = Game.convoGet(vid);
    const wantId = (c && c.want && c.want.id) || '';
    let pick = null;
    const commitChoice = choices.find(x => x.id === 'dlg:commit');
    if (!pick) pick = choices.find(x => /^want:/.test(x.id) && !/favor/i.test(x.text || ''));
    if (!pick) pick = choices.find(x => /^want:/.test(x.id));
    if (!pick) pick = choices.find(x => /^(dlg:help|dlg:details)$/.test(x.id));
    if (!pick) {
      const fb = choices.find(x => !/^(leave|bye|goodbye|dlg:cant|dlg:commit)/.test(x.id) && !picked.includes(x.id));
      if (fb) pick = fb;
      else pick = choices.find(x => x.id === 'dlg:cant') || null;
    }
    if (!pick || /^(leave|bye|goodbye)/.test(pick.id)) break;
    picked.push(pick.id);
    try { Game.convoTurn(vid, pick.id); } catch (e) { break; }
    const cc = Game.convoGet(vid);
    if (!cc || !cc.active) break;
  }
  try { Game.endConvo(vid, 'left'); } catch (e) {}
  return 'drove ' + picked.length + ' turns';
}

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'diag-inh-resume2', fullTelemetry: true });
  await setupGame(Game);
  const E = console.error;
  for (let d = 1; d <= 6; d++) { if (!Game.over) await runDays(Game, competent, { days: 1 }); }
  const v = Game.state.village || {};
  const bearer0 = Game.villagerId;
  // plant with TWO NPCs (the first may become the successor — self-talk is
  // degenerate for the opener; trials run against the non-successor)
  const tgts = (v.roster || []).filter(id => id !== bearer0).slice(0, 2);
  E(`bearer <redacted> ${firstName(rawName(Game, bearer0))}, plant targets ${tgts.map(t => firstName(rawName(Game, t))).join(', ')}`);
  let tgt = null;
  for (const cand of tgts) {
    let rounds = 0;
    while (nOpen(Game, cand) < 1 && rounds < 8 && !Game.over) {
      drive(Game, cand, 14);
      rounds++;
      if (nOpen(Game, cand) < 1) await runDays(Game, competent, { days: 1 });
    }
    E(`plant ${firstName(rawName(Game, cand))}: ${rounds} rounds, open=${nOpen(Game, cand)}`);
    if (nOpen(Game, cand) >= 1 && !tgt) tgt = cand; // prefer the first that opened
  }
  if (!tgt) { E('NO THREAD OPENED in 8 rounds x2 — abort'); process.exit(2); }
  const planted = Game.convoOpenThreads(tgt).map(o => ({ tid: o.tid, day: o.day, label: (o.label || '').slice(0, 30) }));
  E('planted: ' + JSON.stringify(planted));
  const oldFirst = firstName(rawName(Game, bearer0));
  Game.playerDeath('a hushwolf');
  const newFirst = firstName(rawName(Game, Game.villagerId));
  E(`death d${dayOf(Game)}: ${oldFirst} -> ${newFirst}`);
  if (tgt === Game.villagerId) {
    // plant target became the successor — use the other planted NPC
    const alt = tgts.find(t => t !== tgt && nOpen(Game, t) >= 1);
    if (alt) { E(`trial target was the successor — switching to ${firstName(rawName(Game, alt))}`); tgt = alt; }
    else { E('trial target became successor and no alt planted — abort'); process.exit(3); }
  }
  const stamped = Game.convoOpenThreads(tgt).map(o => ({ tid: o.tid, day: o.day, inh: o.inh || null }));
  E('post-death threads: ' + JSON.stringify(stamped));
  await runDays(Game, competent, { days: 1 });
  // gate-state dump: why would the resume opener decline?
  try {
    const vv = Game.state.village || {};
    const seeds = Object.keys(vv.convoSeeds || {}).filter(sid => { const sd = vv.convoSeeds[sid] || {}; return sd.vid === tgt; });
    const treq = (vv.talkRequests || {})[tgt];
    const trust = ((vv.trust || {})[tgt] || 10);
    let sitting = '?';
    try { sitting = Game.convoTableSitting ? !!Game.convoTableSitting() : 'n/a'; } catch (e) { sitting = 'err'; }
    E(`GATES pre-trial: seedsForTgt=${seeds.length} talkReq=${treq ? (treq.delivered ? 'delivered' : 'UNDELIVERED') : 'none'} trust=${trust} tableSitting=${sitting}`);
    E(`  seed detail: ${JSON.stringify(seeds.slice(0, 3).map(sid => { const sd = vv.convoSeeds[sid] || {}; return { sid: String(sid).slice(0, 16), kind: sd.kind, inh: sd.inh || null }; }))}`);
  } catch (e) { E('gate dump threw: ' + e.message); }
  E(`--- 12 opener trials d${dayOf(Game)} ---`);
  let inhNamed = 0, generic = 0, other = 0;
  const samples = [];
  for (let i = 0; i < 12; i++) {
    try { Game.startConvo(tgt); } catch (e) { other++; continue; }
    const c = Game.convoGet(tgt);
    const resumedOnce = !!(c && c._resumedOnce);
    const first = (((c && c.transcript) || []).find(e2 => e2.who !== 'you') || {});
    const line = String(first.text || '');
    try { Game.endConvo(tgt, 'left'); } catch (e) {}
    if (i < 3) E(`  trial${i}: _resumedOnce=${resumedOnce} line="${line.slice(0, 130)}"`);
    const namesPred = line.includes(oldFirst);
    const isResume = /never finished talking about|never did finish talking about|wearing .*shoes now|was .*'s thread/.test(line);
    if (isResume && namesPred) { inhNamed++; if (samples.length < 3) samples.push('[INH] ' + line.slice(0, 200)); }
    else if (isResume) { generic++; if (samples.length < 6) samples.push('[GEN] ' + line.slice(0, 200)); }
    else { other++; }
  }
  E(`RESULT seed ${SEED}: inherited-naming=${inhNamed}/12 generic-resume=${generic}/12 other=${other}/12`);
  for (const s of samples) E('  ' + s);
}
main().catch(e => { console.error('FATAL: ' + (e && e.stack || e)); process.exit(1); });
