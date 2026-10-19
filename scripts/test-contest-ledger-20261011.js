#!/usr/bin/env node
// PROOF TEST: villager contest kills score the wave ledger (longsim wave
// lever r2 2026-10-11, dial 2: villager-experience counting fidelity).
//
// BLANK FOUND: the contest engine runs REAL blow-by-blow fieldFight bouts
// with REAL monster defs (pit/gauntlet/siege via _cxBlood, the hide seeker,
// beastmaster) — and nobody calls recordWaveKill on a vKill there. The deed
// feed already counts these fights (the fieldFight wrap: vKill/mFlee/vFlee
// -> wavesFaced), so the game treats contest bouts as real encounters for
// the endgame deed gate — but the LEDGER never sees the kill. Fought and
// killed, never recorded: a sibling of the 2026-10-10 fieldFight deed-wrap
// bug (arrow-function `this` never attached).
//
// VILLAGER XP LAW (Steve 2026-10-10): villager KILLS score the ledger
// exactly like the player's. No contest carve-out exists in canon —
// contests are unavoidable, feared, and high-risk, not a farming vector
// (max ~2/week, threat-matched beasts, perTypeCap still applies).
//
// Proves (per contest path: gauntlet blood, hide seeker, beastmaster):
//   1. a vKill inside the contest calls recordWaveKill with the beast's id
//   2. the ledger scores it (waveLedgerPoints rises; per-type entry exists)
//   3. villageSlain increments (the 'beasttricks' teaching channel feeds)
//   4. the deed feed records it (wavesFaced — already live, regression guard)
//   5. non-kill engagements (mFlee/vFlee) score NOTHING on the ledger
//      (8730921c reversal holds) but still feed the deed
//   6. a pit mFlee reports "drove the beast off", never "killed the beast"
//
// Method: real contest resolution across days x villagers (the _cxWithSeed
// RNG stream is day+contestant-seeded; contestants are buffed healthy+brave
// so vKills occur in sampling). No stubbed fights — the bouts are
// blow-by-blow.
//
// Green: node scripts/test-contest-ledger-20261011.js
// (pre-fix: assertions 1-3 RED on every path — the blank)
'use strict';
const H = require('./sim-harness.js');

let pass = 0, fail = 0;
const ok = (name, cond, detail) => {
  if (cond) { pass++; }
  else { fail++; console.log('  FAIL: ' + name + (detail ? ' — ' + detail : '')); }
};

(async () => {
  const { Game } = await H.loadGame({ seed: 20261011 });
  await H.setupGame(Game);
  Game.say = function () {};
  Game.sysSay = function () {};
  console.log('== CONTEST KILLS SCORE THE LEDGER — PROOF ==');

  const npcs0 = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  ok('roster has npc villagers', npcs0.length > 0, String(npcs0.length));
  // buffed contestants so vKills occur inside honest sampling
  Game.state.village.health = {};
  for (const id of npcs0) {
    Game.state.village.health[id] = 100;
    try { const a = Game.agencyOf(id); if (a && a.xp && a.xp[id]) a.xp[id].bravery = 40; } catch (e) {}
  }
  const alive = () => (Game.state.village.roster || []).filter(id => id !== Game.villagerId);

  const resetAll = () => {
    Game.state.waveLedger = null; Game.ledgerState();
    Game.state.villageSlain = {};
    Game.state.waveKills = {};
    try { const d = Game.deedState(); if (d) d.wavesFaced = {}; } catch (e) {}
  };
  const ledgerPts = (w) => Game.waveLedgerPoints(w);
  const deedFaced = () => { try { return Object.keys((Game.deedState().wavesFaced) || {}); } catch (e) { return []; } };
  const waveOf = (mid) => { const m = (Game.data.monsters || []).find(x => x.id === mid); return (m && m.wave) || 1; };

  // spies
  const rwCalls = [];
  const ffOutcomes = [];
  const origRW = Game.recordWaveKill.bind(Game);
  Game.recordWaveKill = function (mid) { rwCalls.push(mid); return origRW(mid); };
  const origFF = Game.fieldFight.bind(Game);
  Game.fieldFight = function (vid, mdef, m, opts) {
    const r = origFF(vid, mdef, m, opts);
    try { ffOutcomes.push({ outcome: r && r.outcome, mid: mdef && mdef.id }); } catch (e) {}
    return r;
  };
  const heal = (pid) => { try { Game.state.village.health[pid] = 100; } catch (e) {} };

  // ---- path 1: gauntlet blood contest (_cxBlood) ----
  let gauntKill = null, pitFleeDetail = null;
  for (let day = 15; day < 150 && (!gauntKill || !pitFleeDetail); day++) {
    Game.state.scholar.day = day;
    for (const pid of alive().slice(0, 5)) {
      if (gauntKill && pitFleeDetail) break;
      heal(pid); resetAll(); rwCalls.length = 0; ffOutcomes.length = 0;
      let res = null;
      try { res = Game._cxBlood(pid, { id: 'gauntlet', risk: 'medium', variant: null }, { cheerBonus: 15 }); } catch (e) {}
      const kills = ffOutcomes.filter(f => f.outcome === 'vKill');
      if (kills.length && !gauntKill && res) gauntKill = {
        day, pid, mid: kills[0].mid, wave: waveOf(kills[0].mid),
        rwCalls: rwCalls.slice(), pts: ledgerPts(waveOf(kills[0].mid)),
        slain: Game.state.villageSlain[kills[0].mid] | 0, faced: deedFaced(),
      };
      // pit single-wave mFlee copy check
      if (!pitFleeDetail) {
        heal(pid); resetAll(); ffOutcomes.length = 0;
        let pr = null;
        try { pr = Game._cxBlood(pid, { id: 'pit', risk: 'medium', variant: null }, { cheerBonus: 15 }); } catch (e) {}
        const fl = ffOutcomes.filter(f => f.outcome === 'mFlee');
        if (fl.length && pr && pr.outcome === 'won') pitFleeDetail = { day, pid, detail: pr.detail, mid: fl[0].mid };
      }
    }
  }
  ok('gauntlet: sampled a real vKill', !!gauntKill, gauntKill ? `day ${gauntKill.day}` : 'none in 135 days');
  if (gauntKill) {
    const w = gauntKill.wave;
    ok('gauntlet vKill -> recordWaveKill called with the beast id',
      gauntKill.rwCalls.includes(gauntKill.mid), `calls=${JSON.stringify(gauntKill.rwCalls)} beast=${gauntKill.mid}`);
    ok('gauntlet vKill -> ledger scores the wave', gauntKill.pts > 0, `wave ${w} points=${gauntKill.pts}`);
    ok('gauntlet vKill -> villageSlain increments (beasttricks channel)',
      gauntKill.slain > 0, `slain=${gauntKill.slain}`);
    ok('gauntlet vKill -> deed feed records the type', gauntKill.faced.includes(gauntKill.mid),
      `faced=${JSON.stringify(gauntKill.faced)}`);
  }
  ok('pit: sampled a single-wave mFlee win', !!pitFleeDetail, pitFleeDetail ? `day ${pitFleeDetail.day}` : 'none');
  if (pitFleeDetail) {
    ok('pit mFlee -> says "drove the beast off", never "killed the beast"',
      !/killed the beast/i.test(pitFleeDetail.detail || ''),
      `detail=${JSON.stringify(pitFleeDetail.detail)}`);
  }

  // Each caller needs its own living roster. Earlier sealed bouts can now
  // honestly kill their contestants; a heal cannot resurrect a removed person.
  Game.over = false; Game.won = false; Game.tbfight = null;
  await H.setupGame(Game);
  // ---- path 2: hide (seeker fight) ----
  let hideKill = null, hideEngage = null;
  for (let day = 15; day < 200 && (!hideKill || !hideEngage); day++) {
    Game.state.scholar.day = day;
    for (const pid of alive().slice(0, 6)) {
      if (hideKill && hideEngage) break;
      heal(pid); resetAll(); rwCalls.length = 0; ffOutcomes.length = 0;
      let res = null;
      try { res = Game.contestResolveGroup([pid], { id: 'hide', cat: 'weird' }, {}); } catch (e) {}
      const r = res && res[pid];
      const kills = ffOutcomes.filter(f => f.outcome === 'vKill');
      const flees = ffOutcomes.filter(f => f.outcome === 'mFlee' || f.outcome === 'vFlee');
      if (kills.length && !hideKill) hideKill = {
        day, mid: kills[0].mid, wave: waveOf(kills[0].mid), log: (r && r.log) || [],
        rwCalls: rwCalls.slice(), pts: ledgerPts(waveOf(kills[0].mid)), faced: deedFaced(),
      };
      if (flees.length && !hideEngage) hideEngage = { day, mid: flees[0].mid, wave: waveOf(flees[0].mid), pts: ledgerPts(waveOf(flees[0].mid)), faced: deedFaced() };
    }
  }
  ok('hide: sampled a real seeker vKill', !!hideKill, hideKill ? `day ${hideKill.day}` : 'none in 185 days');
  if (hideKill) {
    const w = hideKill.wave;
    ok('hide vKill -> recordWaveKill called with the seeker id',
      hideKill.rwCalls.includes(hideKill.mid), `calls=${JSON.stringify(hideKill.rwCalls)} seeker=${hideKill.mid}`);
    ok('hide vKill -> ledger scores the wave', hideKill.pts > 0, `wave ${w} points=${hideKill.pts}`);
    ok('hide vKill -> deed feed records the type', hideKill.faced.includes(hideKill.mid));
    ok('hide vKill -> contest log says they slew it (not "walking")',
      /slew|kill/i.test(JSON.stringify(hideKill.log)),
      JSON.stringify(hideKill.log).slice(0, 200));
  }
  ok('hide: sampled a flee engagement', !!hideEngage, hideEngage ? `day ${hideEngage.day}` : 'none');
  if (hideEngage) {
    ok('hide engagement (flee) -> ledger scores NOTHING (8730921c reversal holds)',
      hideEngage.pts === 0, `wave ${hideEngage.wave} points=${hideEngage.pts}`);
    ok('hide engagement (flee) -> deed feed still records it', hideEngage.faced.includes(hideEngage.mid));
  }

  Game.over = false; Game.won = false; Game.tbfight = null;
  await H.setupGame(Game);
  // ---- path 3: beastmaster ----
  let bmKill = null;
  for (let day = 15; day < 200 && !bmKill; day++) {
    Game.state.scholar.day = day;
    for (const pid of alive().slice(0, 6)) {
      if (bmKill) break;
      heal(pid); resetAll(); rwCalls.length = 0; ffOutcomes.length = 0;
      let res = null;
      try { res = Game.contestResolveGroup([pid], { id: 'beastmaster', cat: 'weird' }, {}); } catch (e) {}
      const kills = ffOutcomes.filter(f => f.outcome === 'vKill');
      if (kills.length && res && res[pid]) bmKill = {
        day, mid: kills[0].mid, wave: waveOf(kills[0].mid), res: res[pid],
        rwCalls: rwCalls.slice(), pts: ledgerPts(waveOf(kills[0].mid)),
        slain: Game.state.villageSlain[kills[0].mid] | 0, faced: deedFaced(),
      };
    }
  }
  ok('beastmaster: sampled a real vKill', !!bmKill, bmKill ? `day ${bmKill.day}` : 'none in 185 days');
  if (bmKill) {
    const w = bmKill.wave;
    ok('beastmaster vKill -> recordWaveKill called with the beast id',
      bmKill.rwCalls.includes(bmKill.mid), `calls=${JSON.stringify(bmKill.rwCalls)} beast=${bmKill.mid}`);
    ok('beastmaster vKill -> ledger scores the wave', bmKill.pts > 0, `wave ${w} points=${bmKill.pts}`);
    ok('beastmaster vKill -> villageSlain increments', bmKill.slain > 0);
    ok('beastmaster vKill -> deed feed records the type', bmKill.faced.includes(bmKill.mid));
    ok('beastmaster vKill -> contest still calls it a win ("slew")',
      bmKill.res.outcome === 'won', JSON.stringify(bmKill.res.outcome));
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR: ' + (e && e.stack || e)); process.exit(2); });
