#!/usr/bin/env node
// diag-r147-resume.js — DIAGNOSIS SCRATCH (kept; r147): can the resume
// opener + dlg:help turn be constructed for an ask_favor want?
// Shape: convo 1 states the ask and DEFLECTS it (plants an open thread
// about the wound, plants NO seed, suppresses ask_favor for 3 days);
// advance 4 days past the suppression; convo 2 should open on the
// resume opener with ask_favor stage 0 and dlg:help offered from the
// beat pool. (The leave-mid-thread shape plants no thread; the 8-day
// advance shape fails because the competent bot refreshes the seed; the
// 4-day competent advance fails because the bot consumes the open thread
// and plants a seek_taken seed. This shape uses an IDLE policy for the
// advance so the thread and the suppression age untouched.)
// Usage: node scripts/diag-r147-resume.js [seed]
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');

async function main() {
  const seed = parseInt(process.argv[2] || '5512', 10);
  const { Game } = await loadGame({ seed, mode: 'succession-r147-diag-resume', fullTelemetry: true });
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
  console.log('seed', seed, 'need:', need && need.kind, 'day:', (Game.state.scholar || {}).day);

  // Convo 1: state the ask, deflect it.
  Game.startConvo(vid);
  const c1 = Game.convoGet(vid);
  console.log('convo1 want:', c1.want && c1.want.id, 'stage:', c1.want && c1.want.stage, 'favor:', !!(c1.want && c1.want.favor));
  const ch1 = Game.convoChoices(vid) || [];
  if (ch1.some(x => x.id === 'dlg:cant')) Game.convoTurn(vid, 'dlg:cant');
  else console.log('convo1: dlg:cant NOT offered; menu:', ch1.map(x => x.id).join(','));
  try { Game.endConvo(vid, 'left'); } catch (e) { console.log('endConvo threw', e.message); }
  console.log('seed planted:', JSON.stringify((Game.state.village.convoSeeds || {})[vid] || null));
  let threads = [];
  try { threads = Game.convoOpenThreads(vid) || []; } catch (e) { console.log('convoOpenThreads threw', e.message); }
  console.log('open threads after convo1:', threads.length, JSON.stringify(threads.map(t => ({ tid: t.tid, label: t.label, day: t.day }))));
  console.log('stored favor:', JSON.stringify(Game.convoGetFavor(vid) && { id: Game.convoGetFavor(vid).id, kind: Game.convoGetFavor(vid).kind, state: Game.convoGetFavor(vid).state }));

  // Advance 4 days past the 3-day deflect suppression — with an IDLE
// policy, so no bot conversation consumes the open thread or plants a
// seed in between (the competent bot did both).
  const idle = { id: 'r147-idle' };
  const res = await runDays(Game, idle, { days: 4 });
  console.log('runDays done: day', (Game.state.scholar || {}).day, 'endReason:', res && res.endReason);
  const need2 = Game.convoFindFavorNeed(vid);
  const fav2 = Game.convoGetFavor(vid);
  console.log('after 4d: alive:', (Game.state.village.roster || []).includes(vid),
    'need:', need2 && need2.kind, 'favor:', fav2 && fav2.kind, fav2 && fav2.state,
    'seed:', JSON.stringify((Game.state.village.convoSeeds || {})[vid] || null));
  try { threads = Game.convoOpenThreads(vid) || []; } catch (e) {}
  console.log('open threads after 4d:', threads.length);

  // Convo 2: resume?
  const r2 = Game.startConvo(vid);
  const c2 = Game.convoGet(vid);
  const tr = (c2 && c2.transcript) || [];
  console.log('convo2 refused:', r2 && r2.refused, 'opener:', tr.length ? String(tr[tr.length - 1].text || '').slice(0, 170) : '(none)');
  console.log('convo2 want:', c2.want && c2.want.id, 'stage:', c2.want && c2.want.stage,
    'fromSeed:', c2.want && c2.want.fromSeed, 'thread:', c2.thread, 'favor:', !!(c2.want && c2.want.favor));
  console.log('convo2 menu:', (Game.convoChoices(vid) || []).map(x => x.id).join(','));
  const ch = Game.convoChoices(vid) || [];
  if (ch.some(x => x.id === 'dlg:help')) {
    Game.convoTurn(vid, 'dlg:help');
    const tr2 = (Game.convoGet(vid).transcript || []);
    console.log('help reply:', tr2.length ? String(tr2[tr2.length - 1].text || '').slice(0, 170) : '(none)');
  } else {
    console.log('dlg:help NOT offered in convo2');
  }
  try { Game.endConvo(vid, 'left'); } catch (e) {}
}

main().catch(e => { console.error('THREW', e); process.exit(1); });
