#!/usr/bin/env node
// test-wave-drop-reactions-20261012.js — longsim wave lever r5 (2026-10-12).
// PROOF: villagers react when a wave DROPS (r4's documented blank — "the
// System's RATINGS beat is the only voice"). The village should be terrified
// of the treeline when wave 3 arrives: someone at the fire says a word.
// Beats fire from checkWaveUnlockBeat (the real path), idempotent, living
// villagers only, temperament-varied, present-tense one-liners.
// SENSE: the test prints every fired line across seeds for the human read;
// structural asserts keep the copy honest (named living speaker, <=140
// chars, no dead villagers, no repeat-fire).
'use strict';
const assert = require('assert');
const { loadGame, setupGame } = require('./sim-harness');

const FIRE_RE = /\u{1F525} (\S+), at the fire: "(.+)"/u;

async function fresh(seed) {
  const { Game } = await loadGame({ seed, mode: 'reach' });
  await setupGame(Game);
  Game.state.scholar.day = 30; // past the day-25 floor
  return Game;
}

// Drive the real path: w2 kills -> wave-3 unlock -> beats.
function forceWave3(Game) {
  Game.checkWaveUnlockBeat(); // adopt-on-first-seen (wave 1, silent)
  for (let i = 0; i < 4; i++) Game.recordWaveKill('voice_mimic_radio'); // w2, cap 2
  for (let i = 0; i < 4; i++) Game.recordWaveKill('review_drone');      // w2, cap 2
  assert.strictEqual(Game.unlockedWave(), 3, 'pre: wave 3 unlocked');
}

function livingRoster(Game) {
  const v = Game.state.village || {};
  const me = Game.villagerId;
  return (v.roster || []).filter(id => {
    if (!id || id === me) return false;
    const p = Game.getPerson(id);
    return !!(p && !p.dead && p.name);
  }).map(id => ({ id, first: String(Game.getPerson(id).name).split(' ')[0] }));
}

(async () => {
  let pass = 0, fail = 0;
  const t = (name, fn) => { try { fn(); pass++; console.log('ok -', name); } catch (e) { fail++; console.log('FAIL -', name, '::', e.message); } };
  const allLines = [];

  // RED CONTROL: with the new function removed, the real unlock path emits
  // no fire-side lines — proves the beats come from the new function.
  {
    const Game = await fresh(301);
    const keep = Game.waveDropVillagerReactions;
    delete Game.waveDropVillagerReactions; // checkWaveUnlockBeat try/catches it
    const said = [];
    const orig = Game.say; Game.say = function (...a) { said.push(a.join(' ')); return orig.apply(this, arguments); };
    forceWave3(Game);
    Game.say = orig; Game.waveDropVillagerReactions = keep;
    t('RED: no fire-side lines without the new function', () =>
      assert.strictEqual(said.filter(s => FIRE_RE.test(s)).length, 0));
  }

  // WAVE 3 PATH: two fire-side lines, named living speakers, sane copy.
  {
    const Game = await fresh(302);
    const said = [];
    const orig = Game.say; Game.say = function (...a) { said.push(a.join(' ')); return orig.apply(this, arguments); };
    forceWave3(Game);
    Game.say = orig;
    const fires = said.filter(s => FIRE_RE.test(s));
    fires.forEach(l => allLines.push('w3: ' + l));
    const roster = livingRoster(Game);
    t('wave 3: exactly 2 fire-side lines', () => assert.strictEqual(fires.length, 2));
    t('wave 3: speakers are living roster members', () => {
      const names = fires.map(s => s.match(FIRE_RE)[1]);
      assert.strictEqual(new Set(names).size, 2, 'two distinct speakers');
      for (const n of names) assert.ok(roster.some(r => r.first === n), `${n} is a living roster member`);
    });
    t('wave 3: one-liners, sane length', () => {
      for (const f of fires) {
        const line = f.match(FIRE_RE)[2];
        assert.ok(line.length <= 140, `one-liner (${line.length} chars)`);
        assert.ok(/[.!?]$/.test(line), 'terminal punctuation');
        assert.ok(!/  /.test(f), 'no double spaces');
      }
    });
    t('wave 3: no dead villagers, not the scholar', () => {
      const names = fires.map(s => s.match(FIRE_RE)[1]);
      const me = Game.villagerId ? String((Game.getPerson(Game.villagerId) || {}).name || '').split(' ')[0] : null;
      for (const n of names) assert.notStrictEqual(n, me, 'speaker is not the scholar');
    });
    // IDEMPOTENCY: the beat already fired — more unlocks change nothing.
    const said2 = [];
    Game.say = function (...a) { said2.push(a.join(' ')); return orig.apply(this, arguments); };
    Game.recordWaveKill('voice_mimic_radio');
    Game.checkWaveUnlockBeat();
    Game.say = orig;
    t('wave 3: idempotent — no re-fire', () =>
      assert.strictEqual(said2.filter(s => FIRE_RE.test(s)).length, 0));
  }

  // DEAD-VILLAGER EXCLUSION: kill all but 2 — the survivors must speak.
  {
    const Game = await fresh(303);
    const roster = livingRoster(Game);
    assert.ok(roster.length >= 4, 'enough roster to rig');
    const survivors = roster.slice(0, 2).map(r => r.first);
    for (const r of roster.slice(2)) Game.getPerson(r.id).dead = true;
    const said = [];
    const orig = Game.say; Game.say = function (...a) { said.push(a.join(' ')); return orig.apply(this, arguments); };
    forceWave3(Game);
    Game.say = orig;
    const fires = said.filter(s => FIRE_RE.test(s));
    t('dead exclusion: only survivors speak', () => {
      assert.strictEqual(fires.length, 2);
      for (const f of fires) assert.ok(survivors.includes(f.match(FIRE_RE)[1]), `survivor speaks: ${f.match(FIRE_RE)[1]}`);
    });
  }

  // WAVES 4/5: one line each, sane copy (direct call — scale floor unriggable in unit).
  for (const w of [4, 5]) {
    const Game = await fresh(310 + w);
    const said = [];
    const orig = Game.say; Game.say = function (...a) { said.push(a.join(' ')); return orig.apply(this, arguments); };
    Game.waveDropVillagerReactions(w);
    Game.say = orig;
    const fires = said.filter(s => FIRE_RE.test(s));
    fires.forEach(l => allLines.push(`w${w}: ` + l));
    const roster = livingRoster(Game);
    t(`wave ${w}: exactly 1 fire-side line`, () => assert.strictEqual(fires.length, 1));
    t(`wave ${w}: speaker living, line sane`, () => {
      const [, name, line] = fires[0].match(FIRE_RE);
      assert.ok(roster.some(r => r.first === name), `${name} living`);
      assert.ok(line.length <= 140 && /[.!?]$/.test(line), 'one-liner');
    });
  }

  // WAVE 2: no villager drop-beat (its beat lives in checkSystemArrival).
  {
    const Game = await fresh(320);
    const said = [];
    const orig = Game.say; Game.say = function (...a) { said.push(a.join(' ')); return orig.apply(this, arguments); };
    Game.waveDropVillagerReactions(2);
    Game.waveDropVillagerReactions(1);
    Game.say = orig;
    t('waves 1-2: no fire-side lines', () =>
      assert.strictEqual(said.filter(s => FIRE_RE.test(s)).length, 0));
  }

  // VARIETY: across seeds, the wave-3 voice is not one fixed line.
  // NO-ECHO: the two speakers in one drop never say the identical line.
  {
    const seen = new Set();
    let echoes = 0;
    for (const seed of [401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412]) {
      const Game = await fresh(seed);
      const said = [];
      const orig = Game.say; Game.say = function (...a) { said.push(a.join(' ')); return orig.apply(this, arguments); };
      forceWave3(Game);
      Game.say = orig;
      const lines = [];
      for (const s of said) { const m = s.match(FIRE_RE); if (m) { seen.add(m[2]); lines.push(m[2]); } }
      if (new Set(lines).size < lines.length) { echoes++; allLines.push(`ECHO seed ${seed}: ` + lines.join(' | ')); }
    }
    for (const l of seen) allLines.push('variety: ' + l);
    t('variety: >=3 distinct wave-3 lines across 12 seeds', () => assert.ok(seen.size >= 3, `saw ${seen.size}`));
    t('no-echo: two speakers never parrot one line', () => assert.strictEqual(echoes, 0, `${echoes} echo drops`));
  }

  console.log('\n--- SENSE READ: every fired line ---');
  for (const l of allLines) console.log(l);
  console.log(`\n${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
})();
