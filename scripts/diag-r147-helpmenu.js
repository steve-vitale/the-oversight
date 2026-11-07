#!/usr/bin/env node
// diag-r147-helpmenu.js — DIAGNOSIS SCRATCH (kept; r147): where is dlg:help
// offered for an ask_favor want?
// David d+53 (r146) picked dlg:help FIRST after a followup opener, yet
// menuOptions' favor branch offers no dlg:help. Probe the menu in the
// seed shape: convo 1 states the ask and ends unresolved (plants the
// seed); convo 2 opens on the followup; print the menu at each step.
// Usage: node scripts/diag-r147-helpmenu.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

async function main() {
  const { Game } = await loadGame({ seed: 5512, mode: 'succession-r147-diag-helpmenu', fullTelemetry: true });
  await setupGame(Game);
  const v = Game.state.village || {};
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  const vid = roster[0];
  v.health = v.health || {};
  v.health[vid] = 50;
  v.sick = v.sick || {};
  delete v.sick[vid];
  v.promises = v.promises || {};
  delete v.promises[vid];
  v.favorDeclined = v.favorDeclined || {};
  delete v.favorDeclined[vid];
  v.trust = v.trust || {};
  v.trust[vid] = 90;
  const need = Game.convoFindFavorNeed(vid);
  console.log('need:', need && need.kind);

  // Convo 1: fresh ask.
  let r = Game.startConvo(vid);
  console.log('convo1 opened, want:', Game.convoGet(vid).want && Game.convoGet(vid).want.id,
    'stage:', Game.convoGet(vid).want && Game.convoGet(vid).want.stage,
    'favor:', !!(Game.convoGet(vid).want && Game.convoGet(vid).want.favor));
  console.log('convo1 menu:', (Game.convoChoices(vid) || []).map(x => x.id).join(','));
  // Engage: pick dlg:details to move stage to 1, then leave unresolved.
  const ch1 = Game.convoChoices(vid) || [];
  if (ch1.some(x => x.id === 'dlg:details')) Game.convoTurn(vid, 'dlg:details');
  const c1 = Game.convoGet(vid);
  console.log('after details: stage:', c1.want && c1.want.stage, 'favorExplained:', c1.want && c1.want.favorExplained);
  console.log('menu after details:', (Game.convoChoices(vid) || []).map(x => x.id).join(','));
  try { Game.endConvo(vid, 'left'); } catch (e) { console.log('endConvo threw', e.message); }
  console.log('seed planted:', JSON.stringify((Game.state.village.convoSeeds || {})[vid] || null));
  console.log('stored favor:', JSON.stringify(Game.convoGetFavor(vid) && { id: Game.convoGetFavor(vid).id, kind: Game.convoGetFavor(vid).kind, state: Game.convoGetFavor(vid).state }));

  // Convo 2: opens on the seed followup.
  r = Game.startConvo(vid);
  const c2 = Game.convoGet(vid);
  const tr = (c2 && c2.transcript) || [];
  console.log('convo2 opener:', tr.length ? String(tr[tr.length - 1].text || '').slice(0, 140) : '(none)');
  console.log('convo2 want:', c2.want && c2.want.id, 'stage:', c2.want && c2.want.stage,
    'fromSeed:', c2.want && c2.want.fromSeed, 'favor:', !!(c2.want && c2.want.favor));
  console.log('convo2 menu:', (Game.convoChoices(vid) || []).map(x => x.id).join(','));
  // If dlg:help is offered, pick it and show the reply.
  const ch2 = Game.convoChoices(vid) || [];
  if (ch2.some(x => x.id === 'dlg:help')) {
    Game.convoTurn(vid, 'dlg:help');
    const tr2 = (Game.convoGet(vid).transcript || []);
    console.log('help reply:', tr2.length ? String(tr2[tr2.length - 1].text || '').slice(0, 160) : '(none)');
  } else {
    console.log('dlg:help NOT offered in convo2 — deflecting the ask so no new seed plants');
    const ch2b = Game.convoChoices(vid) || [];
    if (ch2b.some(x => x.id === 'dlg:cant')) Game.convoTurn(vid, 'dlg:cant');
  }
  try { Game.endConvo(vid, 'left'); } catch (e) {}
  console.log('seed after convo2:', JSON.stringify((Game.state.village.convoSeeds || {})[vid] || null));
  // Convo 3: the seed is consumed; an open thread may resume instead.
  // (David d+53 shape: resume opener preempts the want opener, the
  // thread is not 'want', so the beat pool offers dlg:help.)
  // First plant an open thread: convo 2's subject change left one?
  // Re-open and print whatever fires.
  const r3 = Game.startConvo(vid);
  const c3 = Game.convoGet(vid);
  const tr3 = (c3 && c3.transcript) || [];
  console.log('convo3 opener:', tr3.length ? String(tr3[tr3.length - 1].text || '').slice(0, 160) : '(none)');
  console.log('convo3 want:', c3.want && c3.want.id, 'stage:', c3.want && c3.want.stage,
    'fromSeed:', c3.want && c3.want.fromSeed, 'thread:', c3.thread, 'favor:', !!(c3.want && c3.want.favor));
  console.log('convo3 menu:', (Game.convoChoices(vid) || []).map(x => x.id).join(','));
  const ch3 = Game.convoChoices(vid) || [];
  if (ch3.some(x => x.id === 'dlg:help')) {
    Game.convoTurn(vid, 'dlg:help');
    const tr3b = (Game.convoGet(vid).transcript || []);
    console.log('convo3 help reply:', tr3b.length ? String(tr3b[tr3b.length - 1].text || '').slice(0, 160) : '(none)');
  } else {
    console.log('dlg:help NOT offered in convo3');
  }
  try { Game.endConvo(vid, 'left'); } catch (e) {}
}

main().catch(e => { console.error('THREW', e); process.exit(1); });
