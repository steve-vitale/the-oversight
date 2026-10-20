#!/usr/bin/env node
// test-trialgod-20261019.js — proof for the sim-trialgod god-build trial
// driver (scripts/policies/trialgod.js).
//
// Suites:
//   GATE — TRIALGOD unset: withTrialGod delegates daily+fight to the inner
//     stack byte-identically (the det-gate's unit pin).
//   PREP — on a real crafted table (the tablepaths texture: feared earned),
//     walking feared to beat 2 and choosing 'beat:trial' starts the REAL
//     startCombat('finale'). On the trial fight's first player turn the
//     driver's fight hook runs godPrep through REAL verbs: the base
//     policy's own gearUp equips the best owned melee weapon (machete 35
//     over hatchet 15), and Game.eat() tops the kcal bank (>= 98% cap —
//     overcharged). The prep snapshot records weapon/armor/kcal/HP/
//     abilities/finale HP through pure reads.
//   SACRIFICE — with the Finale's fiCountdown live (harness-only state
//     setup; the proof is the DRIVER), the hook calls the engine's real
//     Game.tbFiSacrifice('item'): the countdown clears (the title card
//     never falls), one inventory unit is spent, the turn is consumed.
//   ABILITY — with dead_aim held (in-harness grant in the engine's own
//     {id,name,level,xp} shape; the proof is the DRIVER, not the grant
//     bars), the hook fires Game.useAbility('dead_aim','dead_aim_shot')
//     through the real dispatcher: the 3x+ignore-armor flag is set, the
//     turn is spent, the use is recorded. RED: with no combat ability
//     held, godAbility returns false and the hook falls through to the
//     default strike.
//   SMOKE — 1 seed x 30d, TRIALGOD=1: run completes, 0 instrument errors.
//   DET — 2 seeds x 60d: TRIALGOD=1 (bare+live) vs TRIALGOD unset —
//     byte-identical trajectories (the layer is a pre-table no-op).
//   COMPLETENESS — post-sweep (COMPLETE=1): 16/16 armed per-seed files
//     valid, >=14/16 runs complete, invitation->sitting >= 70%, >=8 trials
//     reached (the pre-registered corpus bar), trial verdict fields
//     present (resumes + damage ledger + prep snapshots).
//
// The in-harness grants (seat, fiCountdown, ability) are IN-HARNESS ONLY —
// the proof is the DRIVER's verb use, not the bars (the tablepaths proof's
// precedent).
//
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=1 NODEWITNESS=1 KILLDISC=1 TABLEPATHS=1 TRIALGOD=1 \
//   node scripts/test-trialgod-20261019.js
// Post-sweep: COMPLETE=1 ... node scripts/test-trialgod-20261019.js
'use strict';
const fs = require('fs');
const path = require('path');
const TGD = require('./policies/trialgod');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

// ---------------------------------------------------------------- texture
// The tablepaths proof's crafted table: ledger earns feared + defiant +
// assimilated; beat 2 (CALIBRATION) offers 'beat:trial'.
async function craftTable(ledger) {
  const { loadGame, setupGame } = require('./sim-harness');
  const { Game } = await loadGame({ seed: 777002 });
  await setupGame(Game);
  Game.state.scholar.day = 140;
  Game.state.systemArrived = true;
  Game.state.scholar.integration = 55;
  Game.state.scholar.grounding = 100;
  for (const k of Object.keys(ledger || {})) { try { Game.ledgerAdd(k, ledger[k]); } catch (e) {} }
  const monstersOfWave = (w, n) => (Game.data.monsters || []).filter(m => (m.wave || 1) === w).slice(0, n).map(m => m.id);
  for (const w of [1, 2, 3]) for (const id of monstersOfWave(w, w === 3 ? 3 : 4)) { try { Game.recordDeedFight(id); } catch (e) {} }
  try { Game.deedState().contestsSurvived = 2; } catch (e) {}
  try { Game.fireCrisis('breach'); Game.fireCrisis('first-grave'); } catch (e) {}
  try { Game.progState().sentimentTaught = true; } catch (e) {}
  Game.state.scholar.prog = Game.state.scholar.prog || {};
  Game.state.scholar.prog.feastSurgeUsed = true;
  const v = Game.state.village; v.pantry = v.pantry || [];
  v.pantry.push({ kcalEach: 5000, units: 10 });
  Game.state.village.viewership = 0;
  // IN-HARNESS seat grant (the tablepaths proof's precedent).
  Game.tableSeat = function () {
    return { seat: 'lesser', detail: { w1: 4, w2: 4, w3: 3, contestsN: 2, crisesN: 2, rank: 'regional', stage: 2, foodDeeds: true } };
  };
  const pg = Game.progState();
  pg.tableDone = false; pg.table = null; pg.tableWaiting = false;
  Game.state.scholar.tableChoices = null;
  Game.over = false; Game.won = false;
  const said = [];
  Game.say = function (t) { said.push(String(t)); };
  Game.sysSay = function (t) { said.push('SYS: ' + String(t)); };
  Game.save = function () {};
  Game.wipe = function () {};
  return { Game, said };
}

const LEDGER = { might: 9, killed: 3, protected: 8, defiance: 6, embrace: 2, foodShared: 6, foodHoarded: 0, showmanship: 8 };

// Walk the real machine to the live trial fight: feared door, beat 0 -> 1,
// then 'beat:trial'. Returns {Game, said}.
async function craftTrialFight() {
  const { Game, said } = await craftTable(LEDGER);
  Game.tableScene();
  Game.chooseTableOption('path:feared');
  let ms = TGD && null;
  // beat 0 -> first option -> beat 1 (CALIBRATION)
  const tc0 = Game.state.scholar.tableChoices;
  Game.chooseTableOption(tc0.options[0].id);
  const tc1 = Game.state.scholar.tableChoices;
  const ids = (tc1.options || []).map(o => String(o.id));
  if (ids.indexOf('beat:trial') < 0) throw new Error('beat:trial not offered on the real beat 1: ' + ids.join(','));
  Game.chooseTableOption('beat:trial');
  void ms;
  return { Game, said };
}

function trialMonster(Game) {
  const f = Game.tbfight;
  if (!f) return null;
  return (f.fighters || []).find(x => x && x.kind === 'monster' && (x.hp || 0) > 0 && !x.fled) || null;
}

async function main() {
  // ---------------------------------------------------------------- GATE
  {
    const calls = [];
    const inner = {
      daily(G, c) { calls.push('daily'); return 'd'; },
      fight(G, c) { calls.push('fight'); return false; },
      gearUp(G, c) { calls.push('gearUp'); },
    };
    const otp = process.env.TRIALGOD;
    delete process.env.TRIALGOD; // gate off
    check('GATE layerOn() false when TRIALGOD unset', TGD.layerOn() === false);
    const w = TGD.withTrialGod(inner, 'x-tg', 'x');
    const G = {}, C = {};
    check('GATE off: daily delegates', w.daily(G, C) === 'd' && calls.join(',') === 'daily', calls.join(','));
    check('GATE off: fight delegates', w.fight(G, C) === false && calls.join(',') === 'daily,fight', calls.join(','));
    process.env.TRIALGOD = '1';
    check('GATE layerOn() true when TRIALGOD=1', TGD.layerOn() === true);
    calls.length = 0;
    check('GATE on: daily still delegates (pre-trial untouched)', w.daily(G, C) === 'd' && calls.join(',') === 'daily', calls.join(','));
    if (otp === undefined) delete process.env.TRIALGOD; else process.env.TRIALGOD = otp;
  }

  // ---------------------------------------------------------------- PREP
  {
    const { Game, said } = await craftTrialFight();
    check('PREP the real trial fight is live', !!Game.tbfight && TGD.trialFight(Game),
      `tbfight=${!!Game.tbfight} trial=${TGD.trialFight(Game)}`);
    const m = trialMonster(Game);
    check('PREP the Finale is the foe', !!m && /finale/.test(String((m.mdef || {}).id || m.monsterId || '')), m && ((m.mdef || {}).id || m.monsterId));
    // In-harness kit: two melee weapons (machete 35 > hatchet 15), food, low kcal.
    const s = Game.state.scholar;
    s.inventory = s.inventory || [];
    s.inventory.push({ itemId: 'machete', name: 'Machete', units: 1 });
    s.inventory.push({ itemId: 'hatchet', name: 'Hatchet', units: 1 });
    s.inventory.push({ name: 'Dried meat', kcalEach: 400, units: 6 });
    s.kcal = 300;
    const policy = TGD.composedFor('leadfeast');
    const ctx = {};
    check('PREP player turn at fight start', Game.tbIsPlayerTurn() === true);
    const handled = policy.fight(Game, ctx);
    const TG = ctx._trialgod;
    check('PREP godPrep ran once', TG && TG.preps.length === 1, JSON.stringify(TG && TG.preps.length));
    const prep = TG && TG.preps[0];
    check('PREP gearUp equipped the best OWNED melee weapon (machete 35, real verb)',
      prep && prep.weapon && prep.weapon.bonus === 35, JSON.stringify(prep && prep.weapon));
    const cap = (typeof Game.kcalCap === 'function') ? Game.kcalCap() : 2400;
    check('PREP eat topped the kcal bank (>=98% cap, overcharged)',
      prep && prep.kcalAfter >= cap * 0.98, `after=${prep && prep.kcalAfter} cap=${cap}`);
    check('PREP overcharged true', prep && prep.overcharged === true, String(prep && prep.overcharged));
    check('PREP snapshot has HP + finale HP', prep && prep.hp > 0 && prep.finaleHp > 0,
      `hp=${prep && prep.hp} finaleHp=${prep && prep.finaleHp}`);
    check('PREP no combat ability held: hook falls through to the default strike',
      handled === false, `handled=${handled}`);
    void said;
  }

  // ---------------------------------------------------------------- SACRIFICE
  {
    const { Game } = await craftTrialFight();
    const s = Game.state.scholar;
    s.inventory = s.inventory || [];
    s.inventory.push({ name: 'Dried meat', kcalEach: 400, units: 6 });
    s.inventory.push({ name: 'Spare battery', units: 1 });
    s.kcal = 2000;
    const m = trialMonster(Game);
    m.fiCountdown = 3; // harness-only state setup — the proof is the DRIVER
    const invBefore = s.inventory.length;
    const policy = TGD.composedFor('leadfeast');
    const ctx = {};
    const handled = policy.fight(Game, ctx);
    const TG = ctx._trialgod;
    check('SACRIFICE countdown live: driver feeds the Finale (handled)',
      handled === true, `handled=${handled}`);
    check('SACRIFICE the countdown passes (title card never falls)',
      m.fiCountdown == null, `fiCountdown=${m.fiCountdown}`);
    check('SACRIFICE one inventory unit spent (real cost)',
      s.inventory.length === invBefore - 1 || (s.inventory[0] && (s.inventory[0].units | 0) < 6),
      `inv ${invBefore} -> ${s.inventory.length}`);
    check('SACRIFICE recorded', TG && TG.sacrifices === 1, `sacrifices=${TG && TG.sacrifices}`);
  }

  // ---------------------------------------------------------------- ABILITY
  {
    // RED: no combat ability held -> godAbility false, hook falls through.
    const { Game: G1 } = await craftTrialFight();
    const ctx1 = {};
    const r1 = TGD.godAbility(G1, ctx1);
    check('ABILITY RED: no combat ability held -> godAbility false', r1 === false, `got ${r1}`);

    // GREEN: dead_aim held (in-harness grant in the engine's own shape) ->
    // the driver fires the REAL useAbility: 3x+ignore-armor flag set, turn spent.
    const { Game: G2 } = await craftTrialFight();
    const s2 = G2.state.scholar;
    s2.inventory = s2.inventory || [];
    s2.inventory.push({ name: 'Dried meat', kcalEach: 400, units: 6 });
    s2.kcal = 2000;
    s2.abilities = [{ id: 'dead_aim', name: 'Dead Aim', desc: 'x', level: 1, xp: 0 }];
    const policy = TGD.composedFor('leadfeast');
    const ctx2 = {};
    const handled = policy.fight(G2, ctx2);
    const TG = ctx2._trialgod;
    check('ABILITY GREEN: hook handles the turn', handled === true, `handled=${handled}`);
    check('ABILITY GREEN: dead_aim fired through the real dispatcher (flag set)',
      !!(s2.deadAimShot && s2.deadAimShot.mult === 3), JSON.stringify(s2.deadAimShot));
    check('ABILITY GREEN: use recorded', TG && TG.abilities === 1, `abilities=${TG && TG.abilities}`);
    check('ABILITY GREEN: fight log names the ability',
      TG && TG.fights.some(e => e.did === 'ability:dead_aim.dead_aim_shot'),
      JSON.stringify(TG && TG.fights.map(e => e.did)));

    // LOADED SHOT: a second take_aim over a loaded aim falls through to the
    // strike instead of overwriting the flag (the 9/12 zero-damage bug).
    const { Game: G3 } = await craftTrialFight();
    const s3 = G3.state.scholar;
    s3.inventory = s3.inventory || [];
    s3.inventory.push({ name: 'Dried meat', kcalEach: 400, units: 6 });
    s3.kcal = 2000;
    s3.abilities = [{ id: 'patient_aim', name: 'Patient Aim', desc: 'x', level: 1, xp: 0 }];
    const ctx3 = {};
    const h3a = policy.fight(G3, ctx3); // loads the aim
    check('ABILITY LOADED: first take_aim fires', h3a === true && !!s3.aimBonus, `handled=${h3a} aim=${!!s3.aimBonus}`);
    const h3b = policy.fight(G3, ctx3); // aim loaded -> falls through to strike
    check('ABILITY LOADED: re-aim over a loaded shot falls through to the strike',
      h3b === false, `handled=${h3b}`);

    // LOADED RAGE: a second unleash_rage over loaded rage also falls through.
    const { Game: G4 } = await craftTrialFight();
    const s4 = G4.state.scholar;
    s4.inventory = s4.inventory || [];
    s4.inventory.push({ name: 'Dried meat', kcalEach: 400, units: 6 });
    s4.kcal = 2000;
    s4.abilities = [{ id: 'rage', name: 'Rage', desc: 'x', level: 1, xp: 0 }];
    const ctx4 = {};
    const h4a = policy.fight(G4, ctx4); // loads rage
    check('ABILITY LOADED: first unleash_rage fires', h4a === true && !!(s4.rageActive && s4.rageActive.rounds > 0),
      `handled=${h4a} rage=${!!(s4.rageActive && s4.rageActive.rounds)}`);
    const h4b = policy.fight(G4, ctx4); // rage loaded -> falls through to strike
    check('ABILITY LOADED: re-rage over loaded rage falls through to the strike',
      h4b === false, `handled=${h4b}`);
  }

  // ---------------------------------------------------------------- SMOKE + DET (the sweep harness)
  const SW = require('./probe-trialgod-20261019');
  {
    const odays = process.env.DAYS; process.env.DAYS = '30';
    const otg = process.env.TRIALGOD; process.env.TRIALGOD = '1';
    const otp = process.env.TABLEPATHS; process.env.TABLEPATHS = '1';
    const out = await SW.runOne(64201, 'leadfeast', { noWrite: true });
    process.env.TRIALGOD = otg;
    process.env.TABLEPATHS = otp;
    if (odays === undefined) delete process.env.DAYS; else process.env.DAYS = odays;
    check('SMOKE run completes', out.gameDays > 0 && out.recs.length > 0, `days=${out.gameDays}`);
    check('SMOKE feared assigned on every run', out.tgAssigned === 'feared', `got ${out.tgAssigned}`);
    check('SMOKE 0 instrument errors', (out.instrumentErrors | 0) === 0 && (out.kdErrors | 0) === 0,
      `ierr=${out.instrumentErrors} kdErr=${out.kdErrors}`);
  }
  {
    // DET: TRIALGOD=1 vs unset on identical seeds — byte-identical pre-table.
    const odays = process.env.DAYS; process.env.DAYS = '60';
    const otg = process.env.TRIALGOD;
    let ok = true;
    for (const seed of [64201, 64202]) {
      process.env.TRIALGOD = '1';
      const a = await SW.runOne(seed, 'leadfeast', { noWrite: true });
      delete process.env.TRIALGOD;
      const b = await SW.runOne(seed, 'leadfeast', { noWrite: true });
      process.env.TRIALGOD = otg;
      const same = a.hashes.join('|') === b.hashes.join('|') && a.hashes.length > 0;
      check(`DET s${seed} TRIALGOD=1 vs unset byte-identical`, same, `lens ${a.hashes.length}/${b.hashes.length}`);
      if (!same) ok = false;
    }
    if (odays === undefined) delete process.env.DAYS; else process.env.DAYS = odays;
    void ok;
  }

  // ---------------------------------------------------------------- COMPLETENESS (COMPLETE=1, post-sweep)
  if (process.env.COMPLETE === '1') {
    const AZ = require('./analyze-trialgod-20261019');
    const dir = path.join(__dirname, '..', 'evidence', '2026-10-19', 'perseed-trialgod');
    const SEEDS = [64201, 64202, 64203, 64204, 64205, 64206, 64207, 64208];
    const POLICIES = ['leadfeast', 'belongfeast'];
    let valid = 0, complete = 0, invited = 0, sat = 0, trials = 0, bearerWins = 0;
    for (const policyId of POLICIES) {
      for (const seed of SEEDS) {
        const fp = path.join(dir, policyId, `s${seed}.json`);
        if (!fs.existsSync(fp)) { check(`COMPLETE file ${policyId}/s${seed}`, false, 'missing'); continue; }
        let r; try { r = JSON.parse(fs.readFileSync(fp, 'utf8')); } catch (e) { check(`COMPLETE parse ${policyId}/s${seed}`, false, String(e)); continue; }
        valid++;
        const a = AZ.analyzeRun(r);
        if (a.complete) complete++;
        if (a.invited) invited++;
        if (a.sat) sat++;
        trials += a.trialFired;
        bearerWins += a.trialResumes.filter(t => t.result === 'won' && !t.bearerDied).length;
        const hasVerdict = !a.trialFired || (Array.isArray(r.trialDmg) && r.tg && Array.isArray(r.tg.preps));
        check(`COMPLETE verdict fields ${policyId}/s${seed}${a.trialFired ? '' : ' (no trial — vacuous)'}`, !!hasVerdict, 'trialDmg/tg.preps missing');
      }
    }
    check('COMPLETE 16/16 files valid', valid === 16, `valid=${valid}`);
    check('COMPLETE >=14/16 runs complete', complete >= 14, `complete=${complete}`);
    check('COMPLETE invitation->sitting >= 70%', invited > 0 && sat / invited >= 0.7, `invited=${invited} sat=${sat}`);
    check('COMPLETE >=8 trials reached (the pre-registered corpus bar)', trials >= 8, `trials=${trials}`);
    console.log(`  COMPLETE trials=${trials} bearerWins=${bearerWins}`);
  }

  console.log(`\ntest-trialgod: ${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('PROOF FATAL:', e && e.stack || e); process.exit(2); });
