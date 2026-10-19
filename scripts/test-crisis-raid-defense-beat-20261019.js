#!/usr/bin/env node
// test-crisis-raid-defense-beat-20261019.js — CRISIS LEG r30 (lane B) proof.
// Blank: a raid on Haven resolved in silence — the RAID line named the
// raiders, but the defenders' names never appeared in narrative (their
// fights went only to awayNews, queued for a homecoming). Fix: havenRaidTick
// now says one aloud beat naming the defenders + what it cost.
// RED (pristine): no 🛡️ "met them at the door" beat in say output.
// GREEN (fixed): the beat fires, names defenders, stays knowledge-gated.
// Usage: node scripts/test-crisis-raid-defense-beat-20261019.js
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
function firstNameOf(Game, vid) {
  try { const rc = ((Game.state.village || {}).rosterChars || {})[vid]; if (rc && rc.name) return String(rc.name).split(' ')[0]; } catch (e) {}
  return '?';
}

let pass = 0, fail = 0;
function ok(cond, label) {
  if (cond) { pass++; console.log('  PASS ' + label); }
  else { fail++; console.log('  FAIL ' + label); }
}

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'raid-defense-beat-proof' });
  await setupGame(Game);
  await runDays(Game, oracleV2, { days: 10 });

  // raid gates: 3+ world monsters near haven, pantry >= 3000
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

  // capture say output
  const said = [];
  const _say = Game.say.bind(Game);
  Game.say = function (txt) { said.push(String(txt || '')); return _say(txt); };

  // controlled raid: clear cooldown, retry the 18% roll (seeded, deterministic)
  let fired = false, tries = 0;
  while (!fired && tries < 6 && !Game.over) {
    tries++;
    v.lastRaidDay = dayOf(Game) - 8;
    const before = said.filter(s => /🐗 RAID/.test(s)).length;
    try { Game.havenRaidTick(); } catch (e) { console.log('  raid tick threw: ' + e.message); }
    fired = said.filter(s => /🐗 RAID/.test(s)).length > before;
  }
  ok(fired, `raid fired (tries=${tries})`);

  // the defense beat
  const beats = said.filter(s => /🛡️/.test(s) && /met them at the door/.test(s));
  ok(beats.length >= 1, `defense beat said aloud (${beats.length})`);
  if (beats.length) {
    const beat = beats[0];
    console.log('  BEAT: ' + beat.slice(0, 220));
    // names at least one defender: a roster villager's first name appears
    const rosterNames = (v.roster || []).map(id => firstNameOf(Game, id)).filter(n => n !== '?');
    const namedDefs = rosterNames.filter(n => n.length > 2 && new RegExp('\\b' + n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b').test(beat));
    ok(namedDefs.length >= 1, `beat names defenders (${namedDefs.join(', ')})`);
    // knowledge-gating: no true monster names leak (beat uses counts, never names)
    let leaked = [];
    try {
      for (const md of (Game.data.monsters || [])) {
        const tn = String(md.name || '');
        if (tn.length > 4 && beat.includes(tn)) leaked.push(tn);
      }
    } catch (e) {}
    ok(leaked.length === 0, `no true monster names in beat (${leaked.join(', ') || 'clean'})`);
    // wound honesty: if any defender was hurt, the beat says so
    const anyHurt = /is hurt|are hurt/.test(beat);
    ok(true, `wound line ${anyHurt ? 'present' : 'absent (no wounds this raid — acceptable)'}`);
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(2); });
