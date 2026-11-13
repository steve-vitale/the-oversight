#!/usr/bin/env node
// test-raid-defense-beat-fallen-wording-20261112.js — JOURNEY ENDGAME r188 (lane B) proof.
// Blank: pass A 89703's transcript reads "🛡️ Tama met them at the door —
// met them and lived. Tama didn't come back." — one line saying the sole
// defender both lived and died. The pick was CORRECT (Tama was alive at
// the pick and died IN that raid fight vs The Loud Beast; the death page
// is immediate while the beat relays to the next Haven night, so the
// transcript order only looks like a corpse defended). The defect is the
// beat's wording: when the defenders earned no bit (no kill/stood/fled)
// and one fell, the fallback "met them and lived" contradicts the
// "didn't come back" that follows.
// Fix (havenGrowth.js): drop the lived-clause when someone fell and no
// bit was earned; the fallen sentence carries the cost. No-bit/no-fallen
// (already-dead monster) keeps "met them and lived".
// RED (pristine): the vDie beat contains "met them and lived" AND
// "didn't come back" in one line.
// GREEN (fixed): the vDie beat contains "didn't come back" and NOT
// "met them and lived"; the vKill beat still says "put down"; the
// alreadyDead beat still says "met them and lived".
// Usage: node scripts/test-raid-defense-beat-fallen-wording-20261112.js
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require(path.join(ROOT, 'scripts', 'sim-harness'));
const { oracleV2 } = require(path.join(ROOT, 'scripts', 'policies', 'oracleV2'));

const SEED = 777;
function dayOf(Game) { try { return Game.state.scholar.day || 0; } catch (e) { return 0; } }
function pantryKcal(Game) {
  const v = Game.state.village || {};
  return Math.round((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0));
}

let pass = 0, fail = 0;
function ok(cond, label) {
  if (cond) { pass++; console.log('  PASS ' + label); }
  else { fail++; console.log('  FAIL ' + label); }
}

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'raid-defense-beat-fallen-wording-proof' });
  await setupGame(Game);
  await runDays(Game, oracleV2, { days: 10 });

  const v = Game.state.village;
  const hx = (v.px !== undefined && v.px !== null) ? v.px : 4;
  const hy = (v.py !== undefined && v.py !== null) ? v.py : 4;
  let mons = Game.worldMonsters ? Game.worldMonsters().length : 0;
  const ids = ['hushwolf', 'bulldozer', 'choir_toad'];
  for (let i = 0; mons + i < 3 && i < 3; i++) {
    try { Game.spawnWorldMonster({ id: ids[i % ids.length] }, hx + 2, hy + 1, {}); } catch (e) {}
  }
  let extra = 0;
  while (pantryKcal(Game) < 3000 && extra < 15 && !Game.over) {
    await runDays(Game, oracleV2, { days: 2 }); extra += 2;
  }
  ok(pantryKcal(Game) >= 3000, `pantry gate met (${pantryKcal(Game)} kcal)`);
  ok(Game.worldMonsters().length >= 3, `monster gate met (${Game.worldMonsters().length})`);

  // capture say output + the haven-news queue (the beat relays when away)
  const said = [];
  const _say = Game.say.bind(Game);
  Game.say = function (txt) { said.push(String(txt || '')); return _say(txt); };
  const beatTexts = () => {
    const fromSay = said.filter(s => /🛡️/.test(s) && /met them at the door/.test(s));
    const queued = ((Game.state || {}).pendingHavenNews || []).map(q => String(q.text || ''))
      .filter(s => /🛡️/.test(s) && /met them at the door/.test(s));
    return fromSay.concat(queued);
  };

  // fire one raid with a stubbed fight outcome; returns the beat lines said for it
  const realResolve = Game.resolveWildMonsterEncounter;
  function fireRaidWith(outcome, vTaken) {
    Game.resolveWildMonsterEncounter = function () { return { outcome, vTaken: vTaken || 0 }; };
    let fired = false, tries = 0;
    const before = beatTexts().length;
    while (!fired && tries < 6 && !Game.over) {
      tries++;
      v.lastRaidDay = dayOf(Game) - 8;
      const raidBefore = said.filter(s => /🐗 RAID/.test(s)).length
        + ((Game.state || {}).pendingHavenNews || []).filter(q => /🐗 RAID/.test(String(q.text || ''))).length;
      try { Game.havenRaidTick(); } catch (e) { console.log('  raid tick threw: ' + e.message); }
      const raidAfter = said.filter(s => /🐗 RAID/.test(s)).length
        + ((Game.state || {}).pendingHavenNews || []).filter(q => /🐗 RAID/.test(String(q.text || ''))).length;
      fired = raidAfter > raidBefore;
    }
    const beats = beatTexts().slice(before);
    return { fired, tries, beats };
  }

  // CASE 1: sole defender dies (the r188 89703 shape)
  const c1 = fireRaidWith('vDie', 50);
  ok(c1.fired, `raid fired for vDie case (tries=${c1.tries})`);
  ok(c1.beats.length >= 1, `vDie defense beat said (${c1.beats.length})`);
  if (c1.beats.length) {
    const beat = c1.beats[0];
    console.log('  BEAT vDie: ' + beat.slice(0, 220));
    ok(/didn't come back/.test(beat), 'vDie beat names the fallen ("didn\'t come back")');
    ok(!/met them and lived/.test(beat), 'vDie beat does NOT say "met them and lived" (no contradiction)');
    ok(!/met them and lived.*didn't come back|didn't come back.*met them and lived/.test(beat), 'vDie beat has no lived-then-died contradiction');
  }

  // CASE 2 (control): defender kills — existing "put down" wording preserved
  const c2 = fireRaidWith('vKill', 0);
  ok(c2.fired, `raid fired for vKill case (tries=${c2.tries})`);
  ok(c2.beats.length >= 1, `vKill defense beat said (${c2.beats.length})`);
  if (c2.beats.length) {
    const beat = c2.beats[0];
    console.log('  BEAT vKill: ' + beat.slice(0, 220));
    ok(/put down/.test(beat), 'vKill beat still says "put down"');
  }

  // CASE 3 (control): monster already dead — "met them and lived" fallback preserved
  const c3 = fireRaidWith('alreadyDead', 0);
  ok(c3.fired, `raid fired for alreadyDead case (tries=${c3.tries})`);
  ok(c3.beats.length >= 1, `alreadyDead defense beat said (${c3.beats.length})`);
  if (c3.beats.length) {
    const beat = c3.beats[0];
    console.log('  BEAT alreadyDead: ' + beat.slice(0, 220));
    ok(/met them and lived/.test(beat), 'alreadyDead beat still says "met them and lived" (nobody fell)');
    ok(!/didn't come back/.test(beat), 'alreadyDead beat names no fallen');
  }

  Game.resolveWildMonsterEncounter = realResolve;
  Game.say = _say;
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(2); });
