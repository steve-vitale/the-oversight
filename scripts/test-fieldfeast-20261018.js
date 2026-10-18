#!/usr/bin/env node
// scripts/test-fieldfeast-20261018.js — proof for sim-fieldfeast.
//
// Steve 2026-10-17 decision #441/#445 ("Food deeds: open the gate"), the
// field-fight child of the landed SEATBLOW-OPEN TB hook: a villager
// fighter's field-fight strikes carry the feast when the village is
// feasted (FIELDFEAST=1, default OFF), with fuel parity through the
// striker's OWN belly, and the first real feasted strike banks the
// food-thesis deed with the villager's share ('v:<villagerId>').
//
// RED  (FIELDFEAST unset): villager field-fight strikes get no uplift and
//       never mark the deed — the control tree behavior, byte-identical.
// GREEN (FIELDFEAST=1): uplift lands on all three strike sites (ambush,
//       volley, melee), narration names the striker, the deed banks to the
//       villager, overcharge works through the striker's own belly,
//       kind 'ally' stays out.
//
//   node scripts/test-fieldfeast-20261018.js          # RED (expect pass: gate closed)
//   FIELDFEAST=1 node scripts/test-fieldfeast-20261018.js  # GREEN (expect pass: gate open)
//


const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, quietLog } = require(path.join(ROOT, 'scripts/sim-harness'));
const fs = require('fs');
const _ffSrc = fs.readFileSync(path.join(ROOT, 'src/js/fieldFights.js'), 'utf8');
if (!_ffSrc.includes('FIELDFEAST')) {
  console.log('INFO-SKIP: FIELDFEAST layer absent (killed at sweep 2026-10-18); ' +
    'pre-kill proof 5/5 RED + 15/15 GREEN, see evidence/2026-10-17/sim-fieldfeast.md');
  process.exit(0);
}

const ARMED = process.env.FIELDFEAST === '1';

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (!cond) { fail++; console.error('FAIL: ' + name + (extra ? ' — ' + extra : '')); return; }
  pass++;
  console.log('ok: ' + name);
}

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const MDEF = { id: 'testmite', wave: 1, speed: 2, hp: [40, 40], attack: { name: 'nip', damage: [1, 2] } };

// Fixture: a real roster villager, a weak monster, a feasted (or not)
// village. Returns the fight record plus the scholar state.
async function fixture({ feasted, hunger, mult, kcal }) {
  const { Game } = await loadGame({ seed: 777001, mode: 'fieldfeast-fixture' });
  await setupGame(Game);
  const s = Game.state.scholar;
  s.day = 10;
  s.prog = s.prog || {};
  if (feasted) {
    s.prog.feastSurge = true; // devotion armed
    s.feastBuff = { untilDay: 12, mult: mult || 2.03, used: false };
  } else {
    s.feastBuff = null;
  }
  if (kcal != null) s.kcal = kcal;
  Game.villageFoodTier = () => 'secure';
  const roster = ((Game.state.village || {}).roster || []).filter(id => id && id !== Game.villagerId);
  if (!roster.length) throw new Error('no roster villagers in fixture');
  const vid = roster[0];
  Game.npcNeeds(vid).hunger = hunger;
  let rec = null;
  await quietLog(async () => { rec = Game.fieldFight(vid, MDEF, null, { rng: mulberry32(4242) }); });
  return { Game, rec, vid, s };
}

function strikeLines(rec) {
  return (rec.log || []).filter(l => /strikes for \d+/.test(l));
}
function firstStrikeDmg(rec) {
  const l = strikeLines(rec)[0];
  if (!l) return null;
  const m = /strikes for (\d+)/.exec(l);
  return m ? parseInt(m[1], 10) : null;
}
function tagLines(rec) {
  return (rec.log || []).filter(l => /FEASTED ×|OVERCHARGED ×/.test(l));
}

(async () => {
  console.log('tree: ' + ROOT + ' (' + (ARMED ? 'ARMED/FIELDFEAST=1' : 'CONTROL/gate closed') + ')');

  // 1. The gate: feasted villager field-fight, identical rng both trees.
  {
    const { Game, rec, vid } = await fixture({ feasted: true, hunger: 10, mult: 2.03 });
    const s = Game.state.scholar;
    const tags = tagLines(rec);
    const vName = (() => { try { return Game.firstRef(vid); } catch (e) { return 'Someone'; } })();
    if (ARMED) {
      ok('feasted strikes tagged', tags.length > 0, JSON.stringify(tags.slice(0, 2)));
      ok('narration names the striker', tags.every(l => l.indexOf(vName.split(' ')[0]) >= 0 || /'s (blow|arrow) carries the feast/.test(l)), vName + ' :: ' + JSON.stringify(tags.slice(0, 2)));
      ok('deed banks to the villager', s.prog.feastSurgeUsed === true && s.prog.feastSurgeBy === 'v:' + vid, `used=${s.prog.feastSurgeUsed} by=${s.prog.feastSurgeBy}`);
      ok('devotion spent once (idempotent)', s.prog.feastSurge === false, `feastSurge=${s.prog.feastSurge}`);
      // Uplift math: the first strike of the identical-rng control run,
      // multiplied. Re-run the control in-process with the flag dropped.
      const saved = process.env.FIELDFEAST; delete process.env.FIELDFEAST;
      let crec = null;
      await quietLog(async () => { crec = Game.fieldFight(vid, MDEF, null, { rng: mulberry32(4242) }); });
      if (saved !== undefined) process.env.FIELDFEAST = saved;
      const c0 = firstStrikeDmg(crec), a0 = firstStrikeDmg(rec);
      ok('uplift math exact on first strike', c0 != null && a0 === Math.round(c0 * 2.03), `control=${c0} armed=${a0} exp=${c0 != null ? Math.round(c0 * 2.03) : '?'}`);
    } else {
      ok('RED: no feasted tags', tags.length === 0, JSON.stringify(tags.slice(0, 2)));
      ok('RED: deed NOT marked by field fight', s.prog.feastSurgeUsed !== true, `used=${s.prog.feastSurgeUsed}`);
      ok('RED: fight still resolves', !!rec.outcome, `outcome=${rec.outcome}`);
    }
  }

  // 2. Overcharge — the striker's own belly, not the scholar's bank.
  {
    const { Game, rec, vid, s } = await fixture({ feasted: false, hunger: 10 });
    const tags = tagLines(rec);
    if (ARMED) {
      ok('well-fed villager strikes overcharged', tags.some(l => /OVERCHARGED ×1\.25/.test(l) && /fights on a full belly/.test(l)), JSON.stringify(tags.slice(0, 2)));
      ok('overcharge does NOT mark the deed', s.prog.feastSurgeUsed !== true, `used=${s.prog.feastSurgeUsed}`);
    } else {
      ok('RED: no overcharge tags', tags.length === 0);
    }
  }

  // 3. Hungry villager — no fuel, no uplift (armed tree).
  if (ARMED) {
    const { Game, rec } = await fixture({ feasted: false, hunger: 90 });
    ok('hungry villager strike NOT uplifted', tagLines(rec).length === 0, JSON.stringify(tagLines(rec).slice(0, 1)));
  }

  // 4. Kind 'ally' stays out — the second pair of hands never carries the feast.
  {
    const { Game } = await loadGame({ seed: 777002, mode: 'fieldfeast-ally' });
    await setupGame(Game);
    const s = Game.state.scholar;
    s.day = 10; s.prog = s.prog || {};
    if (ARMED) { s.prog.feastSurge = true; s.feastBuff = { untilDay: 12, mult: 2.03, used: false }; }
    Game.villageFoodTier = () => 'secure';
    const roster = ((Game.state.village || {}).roster || []).filter(id => id && id !== Game.villagerId);
    const vid = roster[0], allyVid = roster[1] || roster[0];
    Game.npcNeeds(vid).hunger = 10;
    const tank = Object.assign({}, MDEF, { hp: [120, 120] });
    let rec = null;
    await quietLog(async () => {
      rec = Game.fieldFight(vid, tank, null, { allies: 1, allyVids: [allyVid], allyFromStart: true, rng: mulberry32(99) });
    });
    let vNameFull = 'Someone', allyName = 'Someone';
    try { vNameFull = Game.firstRef(vid); } catch (e) {}
    try { allyName = Game.firstRef(allyVid); } catch (e) {}
    // Ally strikes: strike lines that are NOT the primary striker's.
    const allyStrikes = strikeLines(rec).filter(l => l.indexOf(vNameFull) < 0);
    const allyTagged = allyStrikes.filter(l => /FEASTED ×|OVERCHARGED ×/.test(l));
    if (ARMED) {
      ok('ally got strikes in', allyStrikes.length > 0, `allyStrikes=${allyStrikes.length} ally=${allyName} v=${vNameFull}`);
      ok("ally strikes never uplifted", allyTagged.length === 0, JSON.stringify(allyTagged.slice(0, 1)));
    } else {
      ok('RED: ally strikes plain', allyTagged.length === 0);
    }
  }

  // 5. Scholar as field striker — feasted uplift, deed banks as 'p'.
  if (ARMED) {
    const { Game } = await loadGame({ seed: 777003, mode: 'fieldfeast-scholar' });
    await setupGame(Game);
    const s = Game.state.scholar;
    s.day = 10; s.prog = s.prog || {};
    s.prog.feastSurge = true; s.feastBuff = { untilDay: 12, mult: 2.03, used: false };
    s.kcal = 2400;
    Game.villageFoodTier = () => 'secure';
    let rec = null;
    await quietLog(async () => { rec = Game.fieldFight('p', MDEF, null, { rng: mulberry32(4242) }); });
    ok('scholar field strikes feasted', tagLines(rec).some(l => /FEASTED ×2\.03/.test(l)), JSON.stringify(tagLines(rec).slice(0, 1)));
    ok("scholar banks deed as 'p'", s.prog.feastSurgeUsed === true && s.prog.feastSurgeBy === 'p', `by=${s.prog.feastSurgeBy}`);
  }

  // 6. Second feasted strike after the mark — still uplifted, mark not overwritten.
  if (ARMED) {
    const { Game, rec, vid, s } = await fixture({ feasted: true, hunger: 10, mult: 2.03 });
    const first = s.prog.feastSurgeBy;
    const tags = tagLines(rec);
    ok('multiple feasted strikes uplifted', tags.length >= 1, `tags=${tags.length}`);
    ok('deed mark not overwritten', s.prog.feastSurgeBy === first && first === 'v:' + vid, `by=${s.prog.feastSurgeBy}`);
  }

  // 7. Whiffed strikes carry nothing — editor-cut style zero (unit-level via
  // a second fixture is overkill; assert the guard in the uplift path by
  // confirming a 0-damage strike line never carries a tag in a long fight).
  if (ARMED) {
    const { Game } = await loadGame({ seed: 777004, mode: 'fieldfeast-whiff' });
    await setupGame(Game);
    const s = Game.state.scholar;
    s.day = 10; s.prog = s.prog || {};
    s.prog.feastSurge = true; s.feastBuff = { untilDay: 12, mult: 2.03, used: false };
    Game.villageFoodTier = () => 'secure';
    const roster = ((Game.state.village || {}).roster || []).filter(id => id && id !== Game.villagerId);
    const vid = roster[0];
    Game.npcNeeds(vid).hunger = 10;
    const brute = Object.assign({}, MDEF, { hp: [400, 400], attack: { name: 'slam', damage: [2, 4] } });
    let rec = null;
    await quietLog(async () => { rec = Game.fieldFight(vid, brute, null, { rng: mulberry32(7) }); });
    const zeroTagged = (rec.log || []).filter(l => /strikes for 0/.test(l) && /FEASTED ×|OVERCHARGED ×/.test(l));
    ok('zero-damage strikes never tagged', zeroTagged.length === 0, JSON.stringify(zeroTagged.slice(0, 1)));
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
