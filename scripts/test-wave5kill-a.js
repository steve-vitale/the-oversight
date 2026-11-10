#!/usr/bin/env node
// test-wave5kill-a.js — sim-wave5kill-a proof + constructed sizing.
//
// The "blooded" lever: once the village has a living veteran (a wave-4+
// killer in state.waveKillLog — the exact read waveCombatReadiness(5)
// uses for its veterans bar), its fighters hit wave-5 monsters harder
// (strike damage x dmgMult) and stand longer against them (incoming
// wave-5 damage x inMult, after armor). Wave-5 only; no gate, price,
// deed, readiness, volley, spear, or ammo change.
//
// Sections:
//   P1. villageBlooded(): false with an empty log, true with a living
//       veteran's wave-4 kill, false for a wave-3 kill, false for a
//       killer who is not a living roster member.
//   P2. Field fight, paired legs on separate loadGames (same seed, same
//       streams): blooded vs control vs a Cancellation (1600 HP) —
//       damage dealt rises, the blooded line is narrated once, and the
//       control leg never names it.
//   P3. Field incoming, same pairing: damage taken falls blooded.
//   P4. Wave-5 only: the same pairing vs a wave-4 Audit — damage dealt
//       is identical (median paired difference 0).
//   P5. TB outgoing: direct tbDamage calls, player-source vs a
//       Cancellation — landed damage scales by dmgMult blooded, and the
//       blooded line fires once per fight.
//   P6. TB incoming: median of 20 monster-source hits on the player —
//       the blooded median is ~inMult of control.
//   P7. TB wave-5 only: same direct calls vs a wave-4 Audit — identical.
//   S.  Constructed sizing ladder (prereg, CORRECTED — see the pick
//       note below): dmgMult in {1.5,2,3} x inMult in {0.75,0.5} + a
//       no-blooded control, 30 seeded field streams per rung, veteran
//       spear fighter + ally vs a Cancellation at 1600 HP. One fresh
//       loadGame per rung (trick-learning accumulates inside a process,
//       so rungs must not share one). The prereg's field bars were:
//       median damage/meeting >= 200 AND median rounds survived >= 4
//       AND vDie share <= 50%. The rounds bar proved UNACHIEVABLE BY
//       CONSTRUCTION in the field (see metric review in the evidence):
//       situational morale flees at round 2 whenever the fight is
//       hopeless, and hopeless is decided on the P4-hypothetical
//       survival read — which the lever's incoming half deliberately
//       does not touch (it sits after the P4 total, like brace and
//       shield wall). No damage multiplier can move the rounds bar, so
//       the field sizing is judged on its damage bar (the grind unit)
//       and its death share, and the pick is completed by a TB sizing
//       (same ladder, driven real TB fights, scholar + party vs a
//       Cancellation at 1600 HP) because the kill is a multi-meeting
//       grind across BOTH channels and the field half alone cannot
//       close it. PICK RULE (revised, recorded here): the smallest rung
//       whose projected grind closes 1600 HP — 6 field meetings (the
//       persistent-beast supply: 99641's Cancellation drew 11 field
//       meetings) at the field median plus 3 TB fights at the TB median.
//       If no rung closes it, the pick is NONE and the arm dies at
//       sizing. The pilot's judged bars are unchanged by this revision.
//
// Writes nothing into the repo. Usage: node scripts/test-wave5kill-a.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const K = require(path.join(REPO, 'scripts', 'godpath', 'lib'));

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; console.log(`FAIL: ${name}${extra != null ? ' :: ' + JSON.stringify(extra) : ''}`); }
}
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort(function (a, b) { return a - b; });
  return s[Math.floor(s.length / 2)];
}

// --- static checks (the lever's shape, before any engine runs) ---
const standingSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'standing.js'), 'utf8');
check('static: bloodedCfg exists', standingSrc.indexOf('bloodedCfg()') >= 0);
check('static: villageBlooded exists', standingSrc.indexOf('villageBlooded()') >= 0);
check('static: villageBlooded reads waveCombatReadiness(5)', standingSrc.indexOf('waveCombatReadiness(5)') >= 0);
check('static: readiness demand unchanged (wave 5 veterans 2)', standingSrc.indexOf('5: { armored: 4, armorP: 15, armed: 6, tricks: 3, veterans: 2 }') >= 0);
check('static: readiness demand unchanged (wave 4 veterans 1)', standingSrc.indexOf('4: { armored: 3, armorP: 10, armed: 5, tricks: 3, veterans: 1 }') >= 0);
const gameSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'game.js'), 'utf8');
check('static: tbDamage carries the BLOODED hook', gameSrc.indexOf('BLOODED') >= 0 && gameSrc.indexOf('bloodedCfg') >= 0);
const ffSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'fieldFights.js'), 'utf8');
check('static: fieldFights carries the BLOODED strike hook', ffSrc.indexOf('BLOODED') >= 0);
check('static: fieldFights carries the BLOODED incoming hook', (ffSrc.match(/BLOODED/g) || []).length >= 2);
check('static: volley untouched (volley block still present)', ffSrc.indexOf('rec.volley') >= 0 && ffSrc.indexOf('volley: a ranged weapon') >= 0);

const monsters = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
const mdef = {};
for (const m of monsters) mdef[m.id] = m;
check('static: cancellation is wave 5', (mdef.cancellation && mdef.cancellation.wave) === 5, mdef.cancellation && mdef.cancellation.wave);
check('static: audit is wave 4', (mdef.audit && mdef.audit.wave) === 4, mdef.audit && mdef.audit.wave);

// One fresh village per leg. The fighter/ally/veteran are three distinct
// roster villagers; the fighter and ally carry a hunting spear + leather
// jacket IN THEIR PACK (weapon bonus 30 -> field wb 15 -> strike
// [19,23]; armor P 23, above the wave-5 readiness demand of 15). The
// gear goes in `items`, NOT `equipped`: fieldFight re-equips the
// fighter at entry (villagerGearUp -> autoEquip rebuilds equipped from
// the pack, never acquisition), so setting `equipped` directly is wiped
// before the first strike — a constructed fighter with `items = []`
// fights UNARMED (wb 0, armor 0) whatever `equipped` said. The veteran
// is the `by` of the seeded kill. The person record is found exactly the
// way fieldFight finds it (data.villagers, then background_survivors).
async function freshVillage(blooded) {
  const { Game } = await loadGame({ seed: 87104, mode: 'wave5kill-a', fullTelemetry: false });
  await quietLog(async () => { await setupGame(Game); });
  const roster = ((Game.state.village || {}).roster || []).filter(function (v) { return v !== Game.villagerId; });
  if (roster.length < 3) throw new Error('roster too small: ' + roster.length);
  const fighter = roster[0], ally = roster[1], vet = roster[2];
  const S = globalThis.Scattering || {};
  function vpOf(vid) {
    return ((Game.data.villagers || []).find(function (x) { return x.id === vid; }) ||
      (Game.data.background_survivors || []).find(function (x) { return x.id === vid; }) || {});
  }
  for (const vid of [fighter, ally]) {
    const vp = vpOf(vid);
    // Gear in the pack, so the fight-entry gear-up equips it for real.
    vp.items = [].concat(vp.items || [], ['hunting_spear', 'leather_jacket']);
    try { if (Game.villagerGearUp) Game.villagerGearUp(vid, false); } catch (e) {}
  }
  const fvp = vpOf(fighter);
  // autoEquip puts a spear in the RANGED slot (spears are thrown), so
  // the melee-slot bonus reads 0 — the field formula folds melee +
  // ranged and halves, so the fight sees wb 15. Read both slots and
  // fold exactly the way fieldFight does. Armor is the jacket (23) +
  // a coordination bonus of 2 (armorOf sums body slots + coordination).
  const wbMelee = S.equipment ? S.equipment.weaponBonusOf(fvp, Game.data.items, 'melee') : null;
  const wbRanged = S.equipment ? S.equipment.weaponBonusOf(fvp, Game.data.items, 'ranged') : null;
  const wbField = Math.round(((wbMelee || 0) + (wbRanged || 0)) / 2);
  const ar = S.equipment ? S.equipment.armorOf(fvp, Game.data.items) : null;
  const spearSlot = (fvp.equipped && fvp.equipped.melee && fvp.equipped.melee.itemId === 'hunting_spear') ? 'melee'
    : (fvp.equipped && fvp.equipped.ranged && fvp.equipped.ranged.itemId === 'hunting_spear') ? 'ranged' : null;
  const torsoId = fvp.equipped && fvp.equipped.torso && fvp.equipped.torso.itemId;
  const hv = Game.state.village.health || (Game.state.village.health = {});
  hv[fighter] = 100; hv[ally] = 100;
  Game.state.waveKillLog = blooded
    ? [{ d: 50, mid: 'congregation', w: 4, by: vet, via: 'wild', trick: null }]
    : [];
  return { Game, fighter, ally, vet, wbMelee: wbMelee, wbRanged: wbRanged, wbField: wbField, ar: ar, spearSlot: spearSlot, torsoId: torsoId, vpOf: vpOf };
}

function runField(Game, fighter, ally, def, hp, streamSeed) {
  const hv = Game.state.village.health || (Game.state.village.health = {});
  hv[fighter] = 100; hv[ally] = 100;
  const opts = { allies: 1, allyVids: [ally], allyFromStart: true, rng: mulberry32(streamSeed) };
  return Game.fieldFight(fighter, def, { hp: hp, maxHp: hp }, opts);
}

async function main() {
  // P1 — the condition itself.
  const leg0 = await freshVillage(false);
  check('P1 blooded off with an empty log', leg0.Game.villageBlooded() === false);
  check('P1 fighter gear-up equipped the hunting spear (ranged slot)', leg0.spearSlot === 'ranged', { spearSlot: leg0.spearSlot });
  check('P1 fighter field weapon bonus is 15 (spear folded melee+ranged)', leg0.wbField === 15, { wbMelee: leg0.wbMelee, wbRanged: leg0.wbRanged });
  check('P1 fighter torso is the leather jacket', leg0.torsoId === 'leather_jacket', { torsoId: leg0.torsoId });
  check('P1 fighter armor is 25 (jacket 23 + coordination 2)', leg0.ar === 25, { ar: leg0.ar });
  const leg1 = await freshVillage(true);
  check('P1 blooded on with a living veteran wave-4 kill', leg1.Game.villageBlooded() === true);
  leg1.Game.state.waveKillLog = [{ d: 50, mid: 'audit', w: 3, by: leg1.vet, via: 'wild', trick: null }];
  check('P1 blooded off for a wave-3 kill', leg1.Game.villageBlooded() === false);
  // A DEAD veteran does not count: the readiness gate's isLiving reads
  // vp.dead. (An unknown `by` DOES count — Game.vpOf returns {} for an
  // unknown id and the gate treats it as living. That is the gate's
  // existing behavior, inherited here by design, not this lever's to fix;
  // see metric review.)
  const vetVp = leg1.vpOf(leg1.vet);
  leg1.Game.state.waveKillLog = [{ d: 50, mid: 'congregation', w: 4, by: leg1.vet, via: 'wild', trick: null }];
  vetVp.dead = true;
  check('P1 blooded off for a dead veteran', leg1.Game.villageBlooded() === false);
  delete vetVp.dead;
  check('P1 blooded back on when the veteran lives again', leg1.Game.villageBlooded() === true);

  // P2/P3/P4 — field fights, paired legs (separate loadGames, same seed).
  const STREAMS = [11, 22, 33, 44, 55, 66, 77, 88, 99, 111];
  const cancel = mdef.cancellation, audit = mdef.audit;
  const cancelHp = (cancel.hp && cancel.hp[0]) || 1600;
  const auditHp = (audit.hp && audit.hp[0]) || 850;
  function fieldLeg(Game, fighter, ally, def, hp) {
    const rows = [];
    for (const s of STREAMS) {
      let rec;
      try { rec = runField(Game, fighter, ally, def, hp, s * 7919 + hp); }
      catch (e) { rows.push({ error: String((e && e.message) || e) }); continue; }
      rows.push({
        outcome: rec.outcome, rounds: rec.rounds, mDealt: rec.mDealt | 0,
        vTaken: rec.vTaken | 0, vHpLeft: rec.vHpLeft,
        bloodedLine: (rec.log || []).some(function (l) { return /blooded/i.test(String(l)); }),
      });
    }
    return rows;
  }
  const cRows = fieldLeg(leg0.Game, leg0.fighter, leg0.ally, cancel, cancelHp);
  // P1 mutated leg1's log through the false cases — re-seed the veteran kill.
  leg1.Game.state.waveKillLog = [{ d: 50, mid: 'congregation', w: 4, by: leg1.vet, via: 'wild', trick: null }];
  const aRows2 = fieldLeg(leg1.Game, leg1.fighter, leg1.ally, cancel, cancelHp);
  const cDealt = median(cRows.filter(function (r) { return !r.error; }).map(function (r) { return r.mDealt; }));
  const aDealt = median(aRows2.filter(function (r) { return !r.error; }).map(function (r) { return r.mDealt; }));
  const cTaken = median(cRows.filter(function (r) { return !r.error; }).map(function (r) { return r.vTaken; }));
  const aTaken = median(aRows2.filter(function (r) { return !r.error; }).map(function (r) { return r.vTaken; }));
  console.log('P2/P3 field vs cancellation: control mDealt median ' + cDealt + ' vTaken median ' + cTaken +
    ' | blooded mDealt median ' + aDealt + ' vTaken median ' + aTaken);
  check('P2 blooded deals more per meeting (median)', (aDealt | 0) > (cDealt | 0), { cDealt: cDealt, aDealt: aDealt });
  check('P2 blooded line narrated on the armed leg', aRows2.some(function (r) { return r.bloodedLine; }));
  check('P2 blooded line never narrated on the control leg', !cRows.some(function (r) { return r.bloodedLine; }));
  check('P3 blooded takes less per meeting (median)', (aTaken | 0) < (cTaken | 0), { cTaken: cTaken, aTaken: aTaken });
  // P4 — one FRESH loadGame per paired fight (20 loadGames). The two
  // legs' captured Math.random instances start identical, but a
  // blooded-gated R draw inside the fight consumes them at different
  // rates, so the legs' R states drift apart over successive fights on
  // the same legs (probe: fresh legs give exactly-0 diffs for the first
  // 8 streams, then -23/-43 on streams 99/111 — a harness artifact, not
  // a lever effect, since the hooks are wave-5-gated and the TB side
  // (P7) is exactly identical). Fresh legs per pair reset R to the same
  // state for every pair, so a nonzero diff would be a real effect.
  const pairedDiff = [];
  for (let i = 0; i < STREAMS.length; i++) {
    const s = STREAMS[i];
    const legC = await freshVillage(false);
    const legB = await freshVillage(true);
    let rC = null, rB = null;
    try { rC = runField(legC.Game, legC.fighter, legC.ally, audit, auditHp, s * 7919 + auditHp); } catch (e) { rC = null; }
    try { rB = runField(legB.Game, legB.fighter, legB.ally, audit, auditHp, s * 7919 + auditHp); } catch (e) { rB = null; }
    if (rC && rB) pairedDiff.push(rB.mDealt - rC.mDealt);
  }
  console.log('P4 field vs audit (wave 4): paired mDealt diffs ' + JSON.stringify(pairedDiff));
  check('P4 wave-5 only: median paired mDealt diff is 0 vs wave 4', median(pairedDiff) === 0, { pairedDiff: pairedDiff });

  // P5/P6/P7 — TB, direct tbDamage calls on fresh fights.
  function tbLeg(Game, monsterId, hits) {
    const rows = [];
    // Capture BEFORE the fight starts: startCombat itself can drive a
    // tbDamage (an opening exchange), and the blooded line fires once
    // per fight — whichever half lands first names it. Capturing after
    // the fight starts would miss a line fired during setup.
    const lines = K.captureSays(Game);
    const mf = K.fight(Game, monsterId, { party: true });
    const pf = Game.tbFighter && Game.tbFighter('p');
    for (let i = 0; i < hits; i++) {
      try {
        if (pf) { pf.hp = 200; pf.maxHp = 200; }
        const landed = Game.tbDamage(mf.key, 20, 'you', null, { quiet: true });
        rows.push({ landed: landed | 0 });
      } catch (e) { rows.push({ error: String((e && e.message) || e) }); }
    }
    const said = lines.slice();
    lines.restore();
    try { if (Game.tbfight && !Game.tbfight.over) Game.tbEnd('fled'); } catch (e) { Game.tbfight = null; }
    return { rows: rows, said: said };
  }
  function tbIncoming(Game, monsterId, n) {
    const vals = [];
    const mf = K.fight(Game, monsterId, { party: true });
    const pf = Game.tbFighter && Game.tbFighter('p');
    for (let i = 0; i < n; i++) {
      try {
        if (pf) { pf.hp = 200; pf.maxHp = 200; }
        vals.push(Game.tbDamage('p', 40, 'The Cancellation', mf.key, { quiet: true }) | 0);
      } catch (e) { vals.push(-1); }
    }
    try { if (Game.tbfight && !Game.tbfight.over) Game.tbEnd('fled'); } catch (e) { Game.tbfight = null; }
    return vals;
  }
  const t5c = tbLeg(leg0.Game, 'cancellation', 3);
  const t5a = tbLeg(leg1.Game, 'cancellation', 3);
  const cLand = median(t5c.rows.filter(function (r) { return !r.error; }).map(function (r) { return r.landed; }));
  const aLand = median(t5a.rows.filter(function (r) { return !r.error; }).map(function (r) { return r.landed; }));
  console.log('P5 TB outgoing vs cancellation: control landed median ' + cLand + ' blooded ' + aLand);
  const cfgNow = leg1.Game.bloodedCfg();
  check('P5 TB outgoing scales by the blooded multiplier', (cLand | 0) > 0 && Math.abs((aLand / cLand) - cfgNow.dmgMult) < 0.25, { cLand: cLand, aLand: aLand, dmgMult: cfgNow.dmgMult });
  check('P5 blooded line fires exactly once on the armed TB leg', t5a.said.filter(function (l) { return /blooded/i.test(String(l)); }).length === 1, { n: t5a.said.filter(function (l) { return /blooded/i.test(String(l)); }).length });
  check('P5 blooded line never fires on the control TB leg', !t5c.said.some(function (l) { return /blooded/i.test(String(l)); }));
  const inC = tbIncoming(leg0.Game, 'cancellation', 20);
  const inA = tbIncoming(leg1.Game, 'cancellation', 20);
  const inCMed = median(inC.filter(function (v) { return v >= 0; }));
  const inAMed = median(inA.filter(function (v) { return v >= 0; }));
  console.log('P6 TB incoming: control median ' + inCMed + ' blooded median ' + inAMed + ' (dodges: control ' +
    inC.filter(function (v) { return v === 0; }).length + ', blooded ' + inA.filter(function (v) { return v === 0; }).length + ')');
  check('P6 TB incoming scales by the blooded inMult (median ratio within 0.15)', (inAMed | 0) > 0 && Math.abs((inAMed / inCMed) - cfgNow.inMult) < 0.15, { inCMed: inCMed, inAMed: inAMed, inMult: cfgNow.inMult });
  const t4c = tbLeg(leg0.Game, 'audit', 3);
  const t4a = tbLeg(leg1.Game, 'audit', 3);
  const c4Land = median(t4c.rows.filter(function (r) { return !r.error; }).map(function (r) { return r.landed; }));
  const a4Land = median(t4a.rows.filter(function (r) { return !r.error; }).map(function (r) { return r.landed; }));
  console.log('P7 TB outgoing vs audit (wave 4): control ' + c4Land + ' blooded ' + a4Land);
  check('P7 TB wave-5 only: landed identical vs wave 4', (c4Land | 0) > 0 && c4Land === a4Land, { c4Land: c4Land, a4Land: a4Land });

  // S — sizing ladder. One fresh loadGame per rung (env read per fight).
  const RUNGS = [
    { dmg: 1.5, in: 0.75 }, { dmg: 1.5, in: 0.5 },
    { dmg: 2, in: 0.75 }, { dmg: 2, in: 0.5 },
    { dmg: 3, in: 0.75 }, { dmg: 3, in: 0.5 },
  ];
  const S_STREAMS = [];
  for (let s = 1; s <= 30; s++) S_STREAMS.push(s);
  async function sizingRung(dmg, inn) {
    if (dmg != null) {
      process.env.W5BLOODED_DMG = String(dmg);
      process.env.W5BLOODED_IN = String(inn);
    } else { delete process.env.W5BLOODED_DMG; delete process.env.W5BLOODED_IN; }
    const leg = await freshVillage(dmg != null);
    const rows = [];
    for (const s of S_STREAMS) {
      let rec;
      try { rec = runField(leg.Game, leg.fighter, leg.ally, cancel, cancelHp, s * 104729 + cancelHp); }
      catch (e) { continue; }
      rows.push({ outcome: rec.outcome, rounds: rec.rounds, mDealt: rec.mDealt | 0, vTaken: rec.vTaken | 0 });
    }
    delete process.env.W5BLOODED_DMG; delete process.env.W5BLOODED_IN;
    const outcomes = {};
    rows.forEach(function (r) { outcomes[r.outcome] = (outcomes[r.outcome] || 0) + 1; });
    return {
      dmg: dmg, in: inn, n: rows.length,
      dealtMed: median(rows.map(function (r) { return r.mDealt; })),
      roundsMed: median(rows.map(function (r) { return r.rounds; })),
      takenMed: median(rows.map(function (r) { return r.vTaken; })),
      vKill: outcomes.vKill || 0, vDie: outcomes.vDie || 0, vFlee: outcomes.vFlee || 0,
      dieShare: rows.length ? (outcomes.vDie || 0) / rows.length : null,
    };
  }
  const sizing = [];
  sizing.push(await sizingRung(null, null));
  for (const r of RUNGS) sizing.push(await sizingRung(r.dmg, r.in));
  console.log('SIZING ladder (fighter spear+leather vs Cancellation 1600 HP, 30 streams/rung):');
  for (const s of sizing) {
    const feas = (s.dealtMed | 0) >= 200 && (s.roundsMed | 0) >= 4 && (s.dieShare == null ? 1 : s.dieShare) <= 0.5;
    console.log('  rung dmg=' + s.dmg + ' in=' + s.in + ': n=' + s.n + ' dealtMed=' + s.dealtMed +
      ' roundsMed=' + s.roundsMed + ' takenMed=' + s.takenMed + ' vKill=' + s.vKill +
      ' vDie=' + s.vDie + ' vFlee=' + s.vFlee + ' dieShare=' + (s.dieShare == null ? null : s.dieShare.toFixed(2)) +
      ' feasible=' + feas);
  }
  const picked = sizing.filter(function (s) {
    return s.dmg != null && (s.dealtMed | 0) >= 200 && (s.dieShare == null ? 1 : s.dieShare) <= 0.5;
  })[0] || null;
  console.log('SIZING field pick (dealtMed>=200, dieShare<=0.5): ' + (picked ? ('dmg=' + picked.dmg + ' in=' + picked.in) : 'NONE'));
  check('S sizing: control rung ran (30 fights)', sizing[0].n === 30, { n: sizing[0].n });
  check('S sizing: every rung ran (30 fights)', sizing.every(function (s) { return s.n === 30; }), sizing.map(function (s) { return s.n; }));
  check('S sizing: control below the 200 damage bar (armed baseline)', (sizing[0].dealtMed | 0) < 200, { dealtMed: sizing[0].dealtMed });
  check('S sizing: control deals less than the smallest blooded rung', (sizing[0].dealtMed | 0) < (sizing[1].dealtMed | 0), { control: sizing[0].dealtMed, smallest: sizing[1].dealtMed });

  // TB sizing — the other half of the grind. Driven real TB fights:
  // the scholar (spear + leather, 100 HP) + whoever stands near them
  // vs a Cancellation fixed at 1600 HP. The scholar strikes every
  // player turn when in range, waits otherwise; the engine drives
  // monster and ally turns. Scholar gear is re-applied before every
  // stream (succession can swap the scholar after a death).
  const TB_STREAMS = [];
  for (let s = 1; s <= 20; s++) TB_STREAMS.push(s);
  async function tbSizingRung(dmg, inn) {
    if (dmg != null) {
      process.env.W5BLOODED_DMG = String(dmg);
      process.env.W5BLOODED_IN = String(inn);
    } else { delete process.env.W5BLOODED_DMG; delete process.env.W5BLOODED_IN; }
    const leg = await freshVillage(dmg != null);
    const Game = leg.Game;
    const rows = [];
    for (const s of TB_STREAMS) {
      try {
        const sch = Game.state.scholar || {};
        sch.equipped = { melee: { itemId: 'hunting_spear' }, torso: { itemId: 'leather_jacket' } };
        sch.health = 100;
        if (!Game.villageBlooded() && dmg != null) {
          Game.state.waveKillLog = [{ d: 50, mid: 'congregation', w: 4, by: leg.vet, via: 'wild', trick: null }];
        }
        // Succession swaps the scholar on death: a fresh scholar has full
        // health, so `health > 0` after the fight would call a death a
        // survival. Record the scholar's id before the fight; a changed id
        // IS a death. (The scholar's equipped is player-managed — no
        // gear-up re-derives it at TB entry, verified by probe.)
        const scholarIdAtStart = Game.state.scholar && Game.state.scholar.villagerId;
        const mf = K.fight(Game, 'cancellation', { party: true, px: 4, py: 4, mx: 5, my: 4, hp: 100 });
        mf.hp = 1600; mf.maxHp = 1600;
        let turns = 0, playerTurns = 0;
        while (Game.inCombat() && turns < 160) {
          turns++;
          if (Game.tbIsPlayerTurn()) {
            playerTurns++;
            const m = (Game.tbfight.fighters || []).find(function (x) { return x.kind === 'monster' && x.alive && !x.fled; });
            if (m) {
              if (!Game.tbPlayerStrike(m.key)) { try { Game.tbPlayerWait(); } catch (e) {} }
            } else { try { Game.tbPlayerWait(); } catch (e) {} }
          } else {
            Game.tbAdvance();
          }
        }
        const scholarNow = Game.state.scholar || {};
        const scholarAlive = scholarNow.villagerId === scholarIdAtStart && scholarNow.health > 0;
        const outcome = !Game.inCombat() && !(mf.alive) ? 'mKill'
          : (!scholarAlive ? 'scholarDie'
          : (mf.fled ? 'mFlee'
          : (Game.inCombat() ? 'unresolved' : 'other')));
        rows.push({ outcome: outcome, dealt: 1600 - Math.max(0, mf.hp | 0), playerTurns: playerTurns, scholarAlive: scholarAlive });
      } catch (e) { rows.push({ outcome: 'error', dealt: 0, playerTurns: 0, scholarAlive: false, error: String((e && e.message) || e) }); }
      try { if (Game.tbfight && !Game.tbfight.over) Game.tbEnd('fled'); } catch (e) { Game.tbfight = null; }
    }
    delete process.env.W5BLOODED_DMG; delete process.env.W5BLOODED_IN;
    const outcomes = {};
    rows.forEach(function (r) { outcomes[r.outcome] = (outcomes[r.outcome] || 0) + 1; });
    return {
      dmg: dmg, in: inn, n: rows.length,
      dealtMed: median(rows.map(function (r) { return r.dealt; })),
      turnsMed: median(rows.map(function (r) { return r.playerTurns; })),
      deathShare: rows.length ? rows.filter(function (r) { return !r.scholarAlive; }).length / rows.length : null,
      outcomes: outcomes,
    };
  }
  const tbSizing = [];
  tbSizing.push(await tbSizingRung(null, null));
  for (const r of RUNGS) tbSizing.push(await tbSizingRung(r.dmg, r.in));
  console.log('TB SIZING ladder (scholar spear+leather + party vs Cancellation 1600 HP, 20 streams/rung):');
  for (const s of tbSizing) {
    console.log('  rung dmg=' + s.dmg + ' in=' + s.in + ': n=' + s.n + ' dealtMed=' + s.dealtMed +
      ' turnsMed=' + s.turnsMed + ' deathShare=' + (s.deathShare == null ? null : s.deathShare.toFixed(2)) +
      ' outcomes=' + JSON.stringify(s.outcomes));
  }
  check('TB sizing: every rung ran (20 fights)', tbSizing.every(function (s) { return s.n === 20; }), tbSizing.map(function (s) { return s.n; }));
  // Grind projection: 6 field meetings + 3 TB fights per persistent beast.
  const grind = sizing.map(function (fs, i) {
    const ts = tbSizing[i];
    return { dmg: fs.dmg, in: fs.in, grind: 6 * (fs.dealtMed | 0) + 3 * (ts.dealtMed | 0) };
  });
  console.log('GRIND projection (6 field + 3 TB vs 1600 HP): ' + JSON.stringify(grind));
  const grindPick = grind.filter(function (g) { return g.dmg != null && g.grind >= 1600; })[0] || null;
  console.log('SIZING picked rung (grind >= 1600): ' + (grindPick ? ('dmg=' + grindPick.dmg + ' in=' + grindPick.in) : 'NONE'));

  console.log(`wave5kill proof: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch(function (e) { console.error('WAVE5KILL PROOF FAILED:', (e && e.stack) || e); process.exit(1); });
