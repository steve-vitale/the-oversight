#!/usr/bin/env node
// probe: why don't curious seeds plant in the r14 natural-play driver?
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { socialite } = require('./policies/socialite');

async function main() {
  const { Game, manifest } = await loadGame({ seed: 818, mode: 'probe' });
  await setupGame(Game);
  let nConvos = 0, nLeft = 0, nPendingAtLeft = 0, nCuriousSeeds = 0, nAnySeeds = 0;
  const seedKinds = {};

  function driveOne(vid) {
    nConvos++;
    try { Game.startConvo(vid); } catch (e) { return; }
    for (let t = 0; t < 12; t++) {
      let c = null; try { c = Game.convoGet(vid); } catch (e) {}
      if (!c || !c.active) break;
      let choices = []; try { choices = Game.convoChoices(vid) || []; } catch (e) {}
      if (!choices.length) break;
      let pick = null;
      if (t >= 3 && !pick) {
        const r = choices.find(x => x && /^recap$/.test(String(x.id || '')));
        if (r && !driveOne._recapped) { pick = r; driveOne._recapped = 1; }
      }
      if (!pick) {
        const ansChoices = choices.filter(x => x && /^ans:/.test(String(x.id || '')));
        pick = ansChoices.find(x => !/honest_pass/.test(String(x.id || '')));
        if (!pick) pick = choices.find(x => x && /^gq:/.test(String(x.id || '')));
        if (!pick) pick = choices.find(x => x && /^(dlg:help|dlg:details|want:)/.test(String(x.id || '')));
        if (!pick) pick = choices.find(x => x && /^ask:/.test(String(x.id || '')));
        if (!pick) pick = choices.find(x => x && !/^(leave|bye|goodbye)/.test(String(x.id || '')));
        if (!pick) pick = choices[0];
      }
      if (!pick) break;
      try { Game.convoTurn(vid, pick.id); } catch (e) { break; }
    }
    driveOne._recapped = 0;
    // walk away like the driver does on budget exhaustion
    let c = null; try { c = Game.convoGet(vid); } catch (e) {}
    if (c && c.active) {
      nLeft++;
      if (c.pendingQ) nPendingAtLeft++;
      try { Game.endConvo(vid, 'left'); } catch (e) {}
      const seed = (((Game.state || {}).village || {}).convoSeeds || {})[vid] || null;
      if (seed) {
        nAnySeeds++;
        seedKinds[seed.wantId] = (seedKinds[seed.wantId] || 0) + 1;
        if (seed.wantId === 'curious') nCuriousSeeds++;
      }
    } else {
      try { Game.endConvo(vid, 'left'); } catch (e) {}
    }
  }

  const pol = Object.assign({}, socialite, {
    id: 'probe-curious',
    daily(Game2, ctx) {
      if (socialite.daily) socialite.daily(Game2, ctx);
      const vv = Game2.state.village || {};
      const roster = (vv.roster || []).filter(id => id !== Game2.villagerId);
      for (const vid of roster) driveOne(vid);
    },
  });
  await runDays(Game, pol, { days: 20, manifest });
  console.log({ nConvos, nLeft, nPendingAtLeft, nAnySeeds, nCuriousSeeds, seedKinds });
}
main().catch(e => { console.error('ERROR: ' + (e && e.stack || e)); process.exit(1); });
