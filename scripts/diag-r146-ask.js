#!/usr/bin/env node
// DIAGNOSTIC (temporary, not a proof test): why didn't the ask-case
// poison block the stage-0 opener? Prints ledger length/content at
// poison time and at pick time, the want stage, and fellBack.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

function firstChunk(Game, line) {
  try { return Game.convoSplitBeats(line)[0].trim(); } catch (e) { return String(line); }
}

async function main() {
  const { Game } = await loadGame({ seed: 4412, mode: 'succession-r146-askfavor-diag', fullTelemetry: true });
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
  v.trust = v.trust || {};
  v.trust[vid] = 90;
  v.talkRequests = v.talkRequests || {};
  v.talkRequests[vid] = { line: '"Can we talk? I wanted to ask you something."', day: 1 };
  const need = Game.convoFindFavorNeed(vid);
  console.log('need:', need && need.kind);
  const whyLine = '"It\'s getting worse, not better. If it festers I\'m no good to anyone — can\'t haul, can\'t hunt, can\'t watch. Just clean it out and wrap it tight."';
  const poison = [firstChunk(Game, whyLine)];
  for (const w of ['wound', 'cut']) {
    poison.push(firstChunk(Game, `"This ${w} — I can't clean it properly one-handed. Could you take a look?"`));
    poison.push(firstChunk(Game, `"My ${w} needs a second pair of hands. Will you help me clean it?"`));
    poison.push(firstChunk(Game, `"I can't reach this properly. Could you clean it out for me? Please."`));
    poison.push(firstChunk(Game, `"About this ${w} — still need hands. Are you in?"`));
  }
  const rl = Game.convoRunLedger();
  console.log('ledger length BEFORE poison:', rl.length);
  console.log('ledger before (last 5):', JSON.stringify(rl.slice(-5)));
  for (const k of poison) if (k && !rl.includes(k)) rl.push(k);
  while (rl.length > 48) rl.shift();
  console.log('ledger length AFTER poison:', rl.length);
  console.log('poison present after push:', poison.map(k => rl.includes(k)));
  const r = Game.startConvo(vid);
  console.log('startConvo refused:', r && r.refused, 'stage:', Game.convoGet(vid).want && Game.convoGet(vid).want.stage);
  // drive like driveToWant
  for (let t = 0; t < 6; t++) {
    const choices = Game.convoChoices(vid) || [];
    if (choices.some(x => x.id === 'alive:want:ask_favor')) break;
    const next = choices.find(x => x.id === 'dlg:subject') || choices.find(x => x.id === 'dlg:more') || choices.find(x => x.id === 'dlg:react') || choices.find(x => x.id === 'silence');
    if (!next) { console.log('no drive pick at turn', t); break; }
    console.log('drive pick:', next.id, 'stage before:', Game.convoGet(vid).want && Game.convoGet(vid).want.stage);
    Game.convoTurn(vid, next.id);
    console.log('  stage after:', Game.convoGet(vid).want && Game.convoGet(vid).want.stage, 'ledger len:', Game.convoRunLedger().length);
  }
  const rl2 = Game.convoRunLedger();
  console.log('ledger length AT PICK:', rl2.length);
  console.log('poison present at pick:', poison.map(k => rl2.includes(k)));
  const c = Game.convoGet(vid);
  console.log('stage at pick:', c.want && c.want.stage, 'favor?', !!(c.want && c.want.favor));
  const wline = (() => { try { const o = Game.convoWantOpener(vid, c.want); return o && o.line; } catch (e) { return 'THREW ' + e.message; } })();
  console.log('opener line (fresh call):', wline);
  console.log('wouldBlock(opener):', Game.convoWouldBlock(vid, wline));
  console.log('favor stored after opener call:', !!(c.want && c.want.favor));
  Game.convoTurn(vid, 'alive:want:ask_favor');
  const tr = Game.convoGet(vid).transcript || [];
  console.log('last NPC line:', JSON.stringify(tr.filter(e => e.who === 'them').slice(-1)[0]));
  console.log('fellBack:', Game.convoGet(vid)._sayFellBack);
  try { Game.endConvo(vid, 'left'); } catch (e) {}
}
main().catch(e => { console.error('THREW', e); process.exit(1); });
