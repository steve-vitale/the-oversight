#!/usr/bin/env node
// test-succession-exile-docket-20261018.js — PROOF for journey-succession r24:
// "the sentence dies with the bearer."
//
// The bearer <redacted> EXILED. The uprising-'lost' path already implements the design
// (brawler loop 2026-10-08, justice.js ~880): "the crimes died with the
// criminal" — the formal docket resets, s.exiled=false, because "the
// successor must not inherit the dead bearer's exile." But the
// exile-then-die-in-the-wild path goes through playerDeath (ledger.js),
// which never touches s.exiled / s.drifting / s.founding / s.exileStartDay /
// v.justice. Suspected live bug (2026-10-06 BUG 1 class): the innocent
// successor wakes at Haven with s.exiled=true and a live docket, and the
// next justiceTick fires startVillageUprising('defied exile') against them —
// while justiceExiled() misfires r20b's cold shoulders, the pantry denial,
// and the contest gates on the new body.
//
// FIX (ledger.js playerDeath): on the mantle, reset the formal docket
// (mirroring the uprising-'lost' field list) and clear the exile-family
// flags; name it once when the docket was live ("The village's quarrel was
// with {old} — and {old} is dead. The sentence doesn't cross the grave.").
// Clean-docket deaths: mechanical no-op, no voice (old behavior preserved).
//
// RED: run on the pre-fix tree -> the docket/state assertions fail.
// GREEN: re-apply the fix -> all pass. (Patch-file round-trip, never stash.)
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(cond, name) {
  if (cond) { pass++; }
  else { fail++; console.error('FAIL:', name); }
}
function firstName(Game, vid) {
  try { const ch = (Game.data.villagers || []).find(x => x.id === vid); if (ch && ch.name) return ch.name.split(' ')[0]; } catch (e) {}
  return String(vid).slice(0, 8);
}

// One handoff: fresh game, forced successor, optional live exile docket.
// Returns post-mantle state + captured handoff lines.
async function handoffCase(seed, exiled) {
  const { Game } = await loadGame({ seed, mode: 'succession-exile-proof' });
  await setupGame(Game);
  const v = Game.state.village;
  const oldId = Game.villagerId;
  const others = (v.roster || []).filter(id => id !== oldId);
  const succ = others[0];
  v.trust = v.trust || {};
  for (const id of others) v.trust[id] = 10;
  v.trust[succ] = 100;
  if (exiled) {
    // the game's own moot-exile flow, in the real order:
    // resolveCase('exile') -> exilePlayer('moot') -> syncJusticeAfterMoot('exile')
    // (the last sets j.stage = 3 — "exiled: enforcement + defiance rules apply").
    Game.exilePlayer('moot');
    try { Game.syncJusticeAfterMoot('exile'); } catch (e) {}
    // the exile's solo life: drifting + a founding project underway
    Game.state.scholar.drifting = true;
    Game.state.scholar.founding = { siteClaimed: true, shelterTier: 1, stockpileKcal: 800 };
  }
  const said = [];
  const _say = Game.say;
  Game.say = function (t) { said.push(String(t || '')); return _say ? _say.call(this, t) : undefined; };
  Game.playerDeath('the wild');
  Game.say = _say;
  const s = Game.state.scholar || {};
  let j = null;
  try { j = Game.justiceState(); } catch (e) {}
  return {
    Game, oldId, succ,
    choseRight: Game.villagerId === succ,
    sExiled: !!s.exiled, sDrifting: !!s.drifting, sFounding: s.founding || null,
    sExileStartDay: s.exileStartDay != null ? s.exileStartDay : null,
    jStage: j ? (j.stage || 0) : 'n/a',
    jExiled: j ? !!j.exiled : 'n/a',
    jCrimes: j ? (j.crimes || []).length : 'n/a',
    jExileDay: j ? (j.exileDay != null ? j.exileDay : null) : 'n/a',
    justiceExiledNow: (() => { try { return Game.justiceExiled(); } catch (e) { return 'err'; } })(),
    docketVoice: said.filter(t => /quarrel was with|sentence doesn't cross the grave/i.test(t)),
    said,
  };
}

async function main() {
  // 1. EXILED bearer <redacted> -> the sentence dies with them
  {
    const r = await handoffCase(801, true);
    ok(r.choseRight, 'exiled: successor chosen by trust');
    ok(r.sExiled === false, `exiled: s.exiled cleared on the successor (got ${r.sExiled})`);
    ok(r.sDrifting === false, `exiled: s.drifting cleared (got ${r.sDrifting})`);
    ok(r.sFounding === null, `exiled: s.founding cleared (got ${JSON.stringify(r.sFounding)})`);
    ok(r.sExileStartDay === null, `exiled: s.exileStartDay cleared (got ${r.sExileStartDay})`);
    ok(r.jStage === 0, `exiled: docket stage reset to 0 (got ${r.jStage})`);
    ok(r.jExiled === false, `exiled: docket exiled cleared (got ${r.jExiled})`);
    ok(r.jCrimes === 0, `exiled: docket crimes cleared (got ${r.jCrimes})`);
    ok(r.jExileDay === null, `exiled: docket exileDay cleared (got ${r.jExileDay})`);
    ok(r.justiceExiledNow === false, `exiled: justiceExiled() false for the successor (got ${r.justiceExiledNow})`);
    ok(r.docketVoice.length === 1, `exiled: docket-voice line fires exactly once (got ${r.docketVoice.length})`);
    ok(/quarrel was with/.test(r.docketVoice[0] || ''), 'exiled: voice names the dead bearer');
  }
  // 2. CLEAN-docket death -> mechanical no-op, no voice (old behavior preserved)
  {
    const r = await handoffCase(802, false);
    ok(r.choseRight, 'clean: successor chosen by trust');
    ok(r.sExiled === false, 'clean: s.exiled false (was already false)');
    ok(r.jStage === 0 && r.jExiled === false && r.jCrimes === 0, 'clean: docket still clean');
    ok(r.docketVoice.length === 0, `clean: no docket-voice on a clean death (got ${r.docketVoice.length})`);
    ok(r.justiceExiledNow === false, 'clean: justiceExiled() false');
  }
  // 3. THE TEETH: with the docket live pre-death, the next justiceTick must
  //    NOT rise against the successor. Simulate the successor waking at Haven
  //    the day after the sentence day (the exact defied-exile gate inputs).
  {
    const r = await handoffCase(803, true);
    const { Game } = r;
    let uprising = null;
    const _up = Game.startVillageUprising;
    Game.startVillageUprising = function (reason) { uprising = String(reason || ''); return undefined; };
    try {
      // successor is at Haven (playerDeath pins mx=4,my=4 + map to the village)
      Game.state.scholar.day = (Game.state.scholar.day || 0) + 2;
      if (typeof Game.justiceTick === 'function') Game.justiceTick();
    } catch (e) { console.error('note: justiceTick threw in fixture: ' + e.message); }
    Game.startVillageUprising = _up;
    ok(uprising === null, `teeth: no uprising against the successor post-mantle (got ${uprising})`);
  }
  // 4. REGRESSION: the r23 grief beat still fires on a close bond (untouched path)
  {
    const { Game } = await loadGame({ seed: 804, mode: 'succession-exile-proof' });
    await setupGame(Game);
    const v = Game.state.village;
    const oldId = Game.villagerId;
    const others = (v.roster || []).filter(id => id !== oldId);
    const succ = others[0];
    v.trust = v.trust || {};
    for (const id of others) v.trust[id] = 10;
    v.trust[succ] = 100;
    v.bonds = v.bonds || {};
    v.bonds[Game.bondKey(oldId, succ)] = { v: 55, depth: 2, day: 1, dayGain: 0 };
    const said = [];
    const _say = Game.say;
    Game.say = function (t) { said.push(String(t || '')); return _say ? _say.call(this, t) : undefined; };
    Game.playerDeath('test-cause');
    Game.say = _say;
    const grief = said.filter(t => /not the office, the person/.test(t));
    const docket = said.filter(t => /quarrel was with|sentence doesn't cross the grave/i.test(t));
    ok(grief.length === 1, `regression: r23 grief beat still fires once on close bond (got ${grief.length})`);
    ok(Game.state.scholar.trauma === 15, `regression: close-bond trauma still 15 (got ${Game.state.scholar.trauma})`);
    ok(docket.length === 0, `regression: no docket voice on clean death even with close bond (got ${docket.length})`);
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('PROOF FATAL: ' + (e && e.stack || e)); process.exit(1); });
