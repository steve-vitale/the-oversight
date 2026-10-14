#!/usr/bin/env node
// probe: when does a 'want' open thread get planted with the generic label?
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { socialite } = require('./policies/socialite');

async function main() {
  const { Game } = await loadGame({ seed: 1040, mode: 'probe' });
  await setupGame(Game);
  // wrap convoThreadOpen to log 'want' plants
  const orig = Game.convoThreadOpen.bind(Game);
  Game.convoThreadOpen = function (vid, tid, label, why, snippet) {
    if (tid === 'want') {
      let wid = null, pqid = null, stage = null;
      try { const c = Game.convoGet(vid); wid = c && c.want && c.want.id; stage = c && c.want && c.want.stage; pqid = c && c.pendingQ && c.pendingQ.id; } catch (e) {}
      console.log(`[plant] day=${(Game.state.scholar||{}).day} vid=${vid} why=${why} label="${label}" want=${wid} stage=${stage} pendingQ=${pqid}`);
    }
    return orig(vid, tid, label, why, snippet);
  };
  function driveOne(vid) {
    try { Game.startConvo(vid); } catch (e) { return; }
    for (let t = 0; t < 12; t++) {
      let c = null; try { c = Game.convoGet(vid); } catch (e) {}
      if (!c || !c.active) return;
      let choices = []; try { choices = Game.convoChoices(vid) || []; } catch (e) {}
      if (!choices.length) return;
      let pick = null;
      const ansChoices = choices.filter(x => x && /^ans:/.test(String(x.id || '')));
      pick = ansChoices.find(x => !/honest_pass/.test(String(x.id || '')));
      if (!pick) pick = choices.find(x => x && /^gq:/.test(String(x.id || '')));
      if (!pick) pick = choices.find(x => x && /^(dlg:help|dlg:details|want:)/.test(String(x.id || '')));
      if (!pick) pick = choices.find(x => x && /^ask:/.test(String(x.id || '')));
      if (!pick) pick = choices.find(x => x && !/^(leave|bye|goodbye)/.test(String(x.id || '')));
      if (!pick) pick = choices[0];
      if (!pick) break;
      try { Game.convoTurn(vid, pick.id); } catch (e) { break; }
    }
    try { Game.endConvo(vid, 'left'); } catch (e) {}
  }
  const pol = Object.assign({}, socialite, {
    id: 'probe-label',
    daily(Game2, ctx) {
      if (socialite.daily) socialite.daily(Game2, ctx);
      const vv = Game2.state.village || {};
      const roster = (vv.roster || []).filter(id => id !== Game2.villagerId);
      for (const vid of roster) driveOne(vid);
    },
  });
  await runDays(Game, pol, { days: 3 });
  // dump katarina's open threads
  const kat = 'katarina_novak';
  console.log('katarina open threads:', JSON.stringify(Game.convoOpenThreads(kat)));
}
main().catch(e => { console.error('ERROR: ' + (e && e.stack || e)); process.exit(1); });
