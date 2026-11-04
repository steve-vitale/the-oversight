// PROOF: NPC skill twins (ability-use game-code, 2026-11-03).
// Per-twin fixture: staged TB fight, villager holding exactly one twin
// ability. SET tests call Game.tbVillagerAbility directly and assert the
// flag/effect + narration + once-per-fight gate. CONSUMPTION tests run
// Game.tbVillagerTurn with the flag preset and compare the tbDamage
// REQUESTED damage against the same strike unflagged under a re-seeded
// RNG (mulberry32, same algorithm the harness installs) — the ratio must
// be exactly the twin's multiplier (modulo rounding).
// Usage: node scripts/test-abilityuse-twins-20261103.js
'use strict';
const H = require('./sim-harness.js');
const L = require('./godpath/lib.js');

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  ok  ' + name); }
  else { fail++; console.log('  FAIL ' + name + (detail !== undefined ? ' :: ' + detail : '')); }
}

async function main() {
  const Game = await L.load({ seed: 99101 });
  const scholar = L.newRun(Game, 'Columbus, Ohio');
  const village = Game.state.village;
  const vid = (village.roster || []).find(id => id !== Game.villagerId);
  if (!vid) { console.log('FAIL no roster villager'); process.exit(1); }
  village.npcAbilities = village.npcAbilities || {};
  village.health = village.health || {};
  village.health[vid] = 100;

  // End a staged fight safely whether or not the fight already ended.
  function endFight() {
    try { if (Game.tbfight && !Game.tbfight.over) Game.tbEnd('fled'); }
    catch (e) { console.warn('endFight', e); }
    Game.tbfight = null;
  }

  // Stage one fight: monster at (6,4), villager fighter adjacent at (5,4).
  // 'hummice' is wave-1, small, no dodge tricks — a clean strike target.
  function stage(abilityIds) {
    village.npcAbilities[vid] = abilityIds.slice();
    const mf = L.fight(Game, 'hummice', { party: true });
    const f = Game.tbfight.fighters;
    let v = f.find(o => o.villagerId === vid);
    if (!v) {
      v = Game.tbHumanFighter(vid, 'villager', { mx: 5, my: 4 });
      if (!v) throw new Error('tbHumanFighter refused ' + vid);
      f.push(v);
    }
    v.mx = 5; v.my = 4; v.ai = 'brave'; v.hp = 100; v.maxHp = 100;
    v.acted = false; v.fled = false; v.alive = true;
    const m = f.find(o => o.kind === 'monster');
    m.mx = 6; m.my = 4; m.hp = m.maxHp;
    const p = f.find(o => o.kind === 'player');
    if (p) { p.mx = 2; p.my = 4; p.hp = p.maxHp; }
    return { v, m, p };
  }

  // ---- SET tests: tbVillagerAbility directly ----
  console.log('SET: ambush (nontrivial: hummice maxHp may be < 40 — force nontrivial via a second monster)');
  {
    const { v, m } = stage(['ambush']);
    // hummice alone may be trivial; add a second live monster fighter to
    // clear the nontrivial gate honestly (two monsters on the field).
    const m2 = Object.assign({}, m, { key: 'm_1', mx: 6, my: 5, hp: m.maxHp });
    Game.tbfight.fighters.push(m2);
    const says = L.captureSays(Game);
    const fired = Game.tbVillagerAbility(v);
    says.restore();
    check('ambush fires', fired === true, fired);
    check('ambush flag set x2', v._vAmbushReady && v._vAmbushReady.mult === 2.0, JSON.stringify(v._vAmbushReady));
    check('ambush narrated', says.some(s => /Ambush/.test(s)), says.join(' | ').slice(0, 200));
    const fired2 = Game.tbVillagerAbility(v);
    check('ambush once-per-fight', fired2 === false, fired2);
    endFight();
  }

  console.log('SET: haymaker (adjacent, nontrivial)');
  {
    const { v, m } = stage(['haymaker']);
    const m2 = Object.assign({}, m, { key: 'm_1', mx: 6, my: 5, hp: m.maxHp });
    Game.tbfight.fighters.push(m2);
    const says = L.captureSays(Game);
    const fired = Game.tbVillagerAbility(v);
    says.restore();
    check('haymaker fires', fired === true, fired);
    check('haymaker flag set x2.5', v._vHaymakerReady && v._vHaymakerReady.mult === 2.5, JSON.stringify(v._vHaymakerReady));
    check('haymaker narrated', says.some(s => /Haymaker/.test(s)), says.join(' | ').slice(0, 200));
    check('haymaker once-per-fight', Game.tbVillagerAbility(v) === false);
    endFight();
  }

  console.log('SET: dead_aim + take_aim (nontrivial, first-match order)');
  {
    const { v, m } = stage(['dead_aim', 'patient_aim']);
    const m2 = Object.assign({}, m, { key: 'm_1', mx: 6, my: 5, hp: m.maxHp });
    Game.tbfight.fighters.push(m2);
    const fired = Game.tbVillagerAbility(v);
    check('dead_aim fires first (order)', fired === true && !!v._vDeadAim && v._vDeadAim.mult === 3.0, JSON.stringify(v._vDeadAim));
    check('take_aim still unpressed after dead_aim turn', !v._vAimed, JSON.stringify(v._vAimBonus));
    endFight();
  }

  console.log('SET: war_cry (losing) + tripwire + goad + hogtie gates');
  {
    const { v, m } = stage(['war_cry']);
    v.hp = 40; // losing (<50%)
    const says = L.captureSays(Game);
    const fired = Game.tbVillagerAbility(v);
    says.restore();
    check('war_cry fires when losing', fired === true && v._warCried === true, fired + ' ' + v._warCried);
    check('war_cry narrated', says.some(s => /War Cry/.test(s)), says.join(' | ').slice(0, 200));
    check('war_cry once-per-fight', Game.tbVillagerAbility(v) === false);
    endFight();
  }
  {
    const { v, m } = stage(['tripwire']);
    const fired = Game.tbVillagerAbility(v);
    check('tripwire sets flag', fired === true && Game.tbfight._tripwireSet === true, fired + ' ' + Game.tbfight._tripwireSet);
    endFight();
  }
  {
    const { v, m } = stage(['come_get_some']);
    m.blind = 2; // blinded within 3
    const fired = Game.tbVillagerAbility(v);
    check('goad marks blinded foe', fired === true && m._goadedBy === v.key, fired + ' ' + m._goadedBy);
    endFight();
  }
  {
    const { v, m } = stage(['hogtie']);
    m.stunned = 1; // controlled + adjacent + size 1
    const fired = Game.tbVillagerAbility(v);
    check('hogtie binds', fired === true && m._bound >= 1 && m._bindCount === 1, fired + ' bound=' + m._bound);
    endFight();
  }

  console.log('SET: stare_down (fearless holds honestly) + walk_in failure exposes');
  {
    const { v, m } = stage(['intimidating_presence']);
    m.fearless = true;
    const says = L.captureSays(Game);
    const fired = Game.tbVillagerAbility(v);
    says.restore();
    check('stare_down spends turn on fearless', fired === true && v._vStared === true && !m.fled, fired + ' fled=' + m.fled);
    check('stare_down honest narration', says.some(s => /truly fearless/.test(s)), says.join(' | ').slice(0, 200));
    endFight();
  }
  {
    const { v, m } = stage(['peacemaker']);
    v.hp = 40; // losing
    m.elderCalm = true; // no talkable foe -> failure path
    const fired = Game.tbVillagerAbility(v);
    check('walk_in failure exposes', fired === true && v.exposedTurns === 1, fired + ' exposed=' + v.exposedTurns);
    endFight();
  }

  console.log('SET: trade + settle + read_fight');
  {
    const { v, m } = stage(['trade_of_blows']);
    const m2 = Object.assign({}, m, { key: 'm_1', mx: 6, my: 5, hp: m.maxHp });
    Game.tbfight.fighters.push(m2);
    const fired = Game.tbVillagerAbility(v);
    check('open_trade fires', fired === true && v._vTradeOpen && v._vTradeOpen.attacksLeft === 3 && v._vTradeOpen.bonus === 0.5, JSON.stringify(v._vTradeOpen));
    endFight();
  }
  {
    const { v, m } = stage(['trade_of_blows']);
    v._taken = 40;
    const fired = Game.tbVillagerAbility(v);
    // open_trade fires first (same ability, earlier row) — settle is the
    // second row: assert the OPEN row, then press again for SETTLE.
    check('trade open first row', fired === true && !!v._vTradeOpen, JSON.stringify(v._vTradeOpen));
    // Simulate the trade window consumed, then settle must fire.
    delete v._vTradeOpen;
    const fired2 = Game.tbVillagerAbility(v);
    check('settle fires after open consumed', fired2 === true && v._vSettleDebtBonus === 20, fired2 + ' bonus=' + v._vSettleDebtBonus);
    endFight();
  }
  {
    const { v, m } = stage(['brawler_instinct']);
    const m2 = Object.assign({}, m, { key: 'm_1', mx: 6, my: 5, hp: m.maxHp });
    Game.tbfight.fighters.push(m2);
    const sp0 = v.speed;
    const fired = Game.tbVillagerAbility(v);
    check('read_fight +2 speed', fired === true && v.speed === sp0 + 2, fired + ' ' + sp0 + '->' + v.speed);
    endFight();
  }

  console.log('SET: trivial fight does NOT burn a setup turn');
  {
    const { v, m } = stage(['ambush']);
    // startCombat spawns hummice as a pack (4 monsters, totalMaxHp 47) —
    // nontrivial by the pack rule. Force a genuinely trivial fixture: a
    // single 10-HP monster on the field.
    Game.tbfight.fighters = Game.tbfight.fighters.filter(o => o.kind !== 'monster' || o.key === m.key);
    m.hp = m.maxHp = 10;
    const fired = Game.tbVillagerAbility(v);
    check('ambush withheld on trivial fight', fired === false && !v._vAmbushReady, fired);
    endFight();
  }

  console.log('SET: scholar kcal untouched by a twin press (G2)');
  {
    const { v, m } = stage(['ambush']);
    const m2 = Object.assign({}, m, { key: 'm_1', mx: 6, my: 5, hp: m.maxHp });
    Game.tbfight.fighters.push(m2);
    const kcal0 = Game.state.scholar.bellyKcal;
    Game.tbVillagerAbility(v);
    check('scholar kcal unchanged', Game.state.scholar.bellyKcal === kcal0, kcal0 + ' -> ' + Game.state.scholar.bellyKcal);
    endFight();
  }

  // ---- CONSUMPTION tests: identical RNG, flagged vs unflagged ----
  console.log('CONSUME: flagged strike damage == round(unflagged x mult)');
  async function consumeCase(ability, flag, mult, extra) {
    const { v, m } = stage([ability]);
    const m2 = Object.assign({}, m, { key: 'm_1', mx: 6, my: 5, hp: m.maxHp });
    Game.tbfight.fighters.push(m2);
    // Fat monsters: no killing blow can end the fight mid-comparison.
    m.hp = m.maxHp = 900; m2.hp = m2.maxHp = 900;
    // Gates preset BEFORE both runs, so tbVillagerAbility fires nothing
    // in either run and villagerDecide strikes in both; only the
    // consumption flag differs between baseline and flagged.
    function presetGates() {
      v._vAmbushed = true; v._vHaymakerPressed = true; v._vDeadAimed = true;
      v._vAimed = true; v._vTradeOpened = true; v._vReadFight = true;
      v._vDebtSettled = true;
    }
    const seen = [];
    const orig = Game.tbDamage;
    Game.tbDamage = function (k, dmg) { seen.push(dmg); return orig.apply(this, arguments); };
    try {
      // Unflagged baseline.
      presetGates();
      Math.random = mulberry32(424242);
      v.acted = false;
      Game.tbVillagerTurn(v);
      const base = seen[seen.length - 1];
      // Flagged: same RNG, same staging (monster HP restored).
      m.hp = m.maxHp;
      v.hp = 100; v.acted = false;
      presetGates();
      v[flag] = extra;
      seen.length = 0;
      Math.random = mulberry32(424242);
      Game.tbVillagerTurn(v);
      const flagged = seen[seen.length - 1];
      const expect = (typeof mult === 'function') ? mult(base) : Math.round(base * mult);
      check('consume ' + ability + ' (' + base + ' -> ' + flagged + ', expect ' + expect + ')',
        flagged === expect, 'base=' + base + ' flagged=' + flagged + ' expect=' + expect);
    } finally {
      Game.tbDamage = orig;
      endFight();
    }
  }
  await consumeCase('ambush', '_vAmbushReady', 2.0, { mult: 2.0 });
  await consumeCase('haymaker', '_vHaymakerReady', 2.5, { mult: 2.5 });
  await consumeCase('dead_aim', '_vDeadAim', 3.0, { mult: 3.0 });
  await consumeCase('patient_aim', '_vAimBonus', 2.5, { mult: 2.5 });
  await consumeCase('trade_of_blows', '_vTradeOpen', 1.5, { attacksLeft: 3, bonus: 0.5 });
  // Settle: flat bonus, not a multiplier.
  {
    const { v, m } = stage(['trade_of_blows']);
    const m2 = Object.assign({}, m, { key: 'm_1', mx: 6, my: 5, hp: m.maxHp });
    Game.tbfight.fighters.push(m2);
    m.hp = m.maxHp = 900; m2.hp = m2.maxHp = 900;
    const seen = [];
    const orig = Game.tbDamage;
    Game.tbDamage = function (k, dmg) { seen.push(dmg); return orig.apply(this, arguments); };
    try {
      // Gates preset before both runs (see consumeCase); only the flat
      // bonus differs. _vDebtSettled stays true so no twin fires either run.
      v._vTradeOpened = true; v._vDebtSettled = true;
      Math.random = mulberry32(424242);
      v.acted = false;
      Game.tbVillagerTurn(v);
      const base = seen[seen.length - 1];
      m.hp = m.maxHp;
      v.hp = 100; v.acted = false;
      v._vTradeOpened = true; v._vDebtSettled = true;
      v._vSettleDebtBonus = 20;
      seen.length = 0;
      Math.random = mulberry32(424242);
      Game.tbVillagerTurn(v);
      const flagged = seen[seen.length - 1];
      check('consume settle_debt (' + base + ' -> ' + flagged + ', expect ' + (base + 20) + ')',
        flagged === base + 20, 'base=' + base + ' flagged=' + flagged);
    } finally {
      Game.tbDamage = orig;
      endFight();
    }
  }

  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('PROOF CRASH', e); process.exit(2); });
