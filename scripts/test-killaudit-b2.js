#!/usr/bin/env node
// scripts/test-killaudit-b2.js — kill-audit census instrument honesty proof.
// PART A — fixture-level RED/GREEN (honest: RED = the naive expectation that
//   FAILS, documenting the actual gate; GREEN = the instrument counting it):
//   A1 static trap-table x fat join (Game data, not guess)
//   A2 hunt-duty pipeline bypass: a rigged BOAR kill through the real 'hunt'
//      duty branch -> carcassToMeat NOT called, pantry 'Game meat' (RED: the
//      naive carcass->butcher->fat pipeline does not exist for village kills)
//   A3 bear canon: REAL villagerHuntResolve on a bear-only tile -> bear drawn
//      and resolved as a stalk "clean kill", no fight, no maul (RED: BEAR.md
//      canon says the bear is a FIGHT)
//   A4 staffing instruments: assignTask('hunt') recorded; v.taskLeads.hunt
//      snapshotted daily while assignTask stays blind (finding #528)
//   A5 death-tele kind capture: monster vs villager separated (b3/b4 lesson)
//   A6 carcassToMeat fat pin: boar carcass -> 3 slabs, caller 'scholar'
//   A7 wound->fever chain: hunt wound + villager death (cause 'sickness')
//      within 7d -> 1 chain (b4 lesson)
// PART B — det-gate: instrument on vs off, byte-identical trajectories.
// SMOKE=1: PART A + 1-seed 12d det comparison.
// Usage: node scripts/test-killaudit-b2.js [SMOKE=1]
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const ka = require('./sweep-killaudit-b2');

let failures = 0;
function check(name, cond, detail) {
  if (cond) console.log(`  PASS ${name}${detail ? ' — ' + detail : ''}`);
  else { console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); failures++; }
}

function dayHash(Game) {
  const s = Game.state.scholar || {}, v = Game.state.village || {};
  const parts = [s.day, Math.round(s.health || 0), Math.round(s.kcal || 0),
    (v.roster || []).length, Game.map.px, Game.map.py,
    Game.unlockedWave ? Game.unlockedWave() : 0,
    Math.round((((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0))) / 100)];
  return parts.join('|');
}

const fatOf = (Game, aid) => {
  const a = (Game.data.animals || []).find(x => x.id === aid) || {};
  return ((a.butcher || {}).fat) || 0;
};

async function partA() {
  console.log('PART A — fixtures');
  const { Game } = await loadGame({ seed: 99101, mode: 'killaudit-proof' });
  await quietLog(async () => { await setupGame(Game); });
  Game.state.scholar.day = 40;

  // A1 — static trap-table x fat join (live Game data)
  const recipes = Game.data.recipes || [];
  const tbl = (id) => (recipes.find(r => r.id === id) || {}).catches || [];
  const fatIn = (ids) => ids.filter(id => fatOf(Game, id) > 0);
  const pit = tbl('pit_trap'), snare = tbl('snare'), dead = tbl('deadfall'),
        box = tbl('box_trap'), spring = tbl('spring_snare');
  check('A1a pit_trap table holds wild_boar (1/5 weight)', pit.includes('wild_boar') && pit.filter(x => x === 'wild_boar').length === 1, JSON.stringify(pit));
  check('A1b pit_trap: wild_boar is its ONLY fat species', fatIn(pit).join(',') === 'wild_boar', JSON.stringify(fatIn(pit)));
  check('A1c snare/deadfall/box/spring: ZERO fat-bearing species (table gate)',
    fatIn(snare).length === 0 && fatIn(dead).length === 0 && fatIn(box).length === 0 && fatIn(spring).length === 0,
    `snare=${fatIn(snare)} deadfall=${fatIn(dead)} box=${fatIn(box)} spring=${fatIn(spring)}`);

  // A2 — hunt-duty pipeline bypass (rigged boar kill, real duty branch)
  {
    const t = { errors: 0 };
    const vid = (Game.state.village.roster || [])[0];
    const realResolve = Game.villagerHuntResolve.bind(Game);
    Game.villagerHuntResolve = function () { return { kcal: 5000, aid: 'wild_boar', msg: 'rigged', note: null }; };
    ka.attachKillInstrument(Game, t);
    const panBefore = JSON.stringify((Game.state.village.pantry || []).map(i => [i.name, i.kcalEach, i.units]));
    Game.resolveOneAssignment(vid, { task: 'hunt' });
    Game.villagerHuntResolve = realResolve;
    check('A2a rigged boar kill resolved through the duty', t.huntResolves.length >= 1 && t.huntResolves[t.huntResolves.length - 1].aid === 'wild_boar',
      JSON.stringify(t.huntResolves[t.huntResolves.length - 1] || null));
    check('A2b RED (naive): carcassToMeat called on the village boar kill — NOT called (pipeline bypass)',
      t.carcassButchers.length === 0, `calls=${t.carcassButchers.length}`);
    const meat = (t.pantryStocks || []).filter(p => p.label === 'Game meat');
    check('A2c kill anonymized to pantry "Game meat" kcal (no carcass item)', meat.length >= 1 && meat[meat.length - 1].kcal === 5000,
      JSON.stringify(meat[meat.length - 1] || null));
    check('A2d no instrument errors', t.errors === 0, `${t.errors}`);
    void panBefore;
  }

  // A3 — bear canon: real villagerHuntResolve on a bear-only tile
  {
    const t = { errors: 0 };
    ka.attachKillInstrument(Game, t);
    const vid = (Game.state.village.roster || [])[1] || (Game.state.village.roster || [])[0];
    const v = Game.state.village;
    const hx = v.px ?? 4, hy = v.py ?? 4;
    for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++) {
      const tl = Game.tileAt(x, y);
      if (tl) tl.wildlife = {};
    }
    const bx = Math.min(8, hx + 1), by = hy;
    const bt = Game.tileAt(bx, by);
    if (bt && bt.type !== 'haven') bt.wildlife = { black_bear: 4 };
    let bearKill = null, draws = 0;
    for (let i = 0; i < 60 && !bearKill; i++) {
      const r0 = t.huntResolves.length;
      Game.villagerHuntResolve(vid, 1.0);
      const rec = t.huntResolves[r0];
      if (rec && rec.bearDrawn) { draws++; if (rec.killed) bearKill = rec; }
    }
    check('A3a bear drawn from tile wildlife', draws > 0, `draws=${draws}`);
    check('A3b RED (canon): bear resolved as a FIGHT — resolved as stalk "clean kill", no maul',
      !!bearKill, bearKill ? `kcal=${bearKill.kcal} (bear gross 30000, no fight)` : 'no kill in 60 tries');
    check('A3c instrument recorded difficulty=hard on the bear draw', t.huntResolves.some(r => r.bearDrawn && r.difficulty === 'hard'));
    check('A3d no instrument errors', t.errors === 0, `${t.errors}`);
  }

  // A4 — staffing: assignTask recorded; taskLeads snapshotted while assignTask stays blind
  {
    const t = { errors: 0 };
    ka.attachKillInstrument(Game, t);
    const vid = (Game.state.village.roster || [])[2] || (Game.state.village.roster || [])[0];
    const vid2 = (Game.state.village.roster || [])[3] || vid;
    Game.assignTask(vid, 'hunt');
    check('A4a assignTask(hunt) attempt recorded', t.assignHunts.length === 1 && t.assignHunts[0].vid === String(vid),
      JSON.stringify(t.assignHunts[0] || null));
    const v = Game.state.village;
    v.taskLeads = v.taskLeads || {};
    v.taskLeads.hunt = vid2; // the engine's contender-challenge path (finding #528)
    ka.dailySnapshot(Game, t, {});
    const last = t.taskLeadsDays[t.taskLeadsDays.length - 1];
    check('A4b daily snapshot sees the task-lead hunt duty', last && last.huntLead === vid2, JSON.stringify(last && last.huntLead));
    check('A4c assignTask wrap stays blind to the lead (the b3 caveat)', t.assignHunts.length === 1, `assignHunts=${t.assignHunts.length}`);
    delete v.taskLeads.hunt;
    check('A4d no instrument errors', t.errors === 0, `${t.errors}`);
  }

  // A5 — death-tele kind capture (b3/b4 lesson)
  {
    const t = { errors: 0 };
    ka.attachKillInstrument(Game, t);
    const vid = (Game.state.village.roster || [])[0];
    Game.tele('death', { kind: 'monster', who: 'drumbelly_tanuki', cause: 'villager combat' });
    Game.tele('death', { kind: 'villager', who: vid, cause: 'starvation' });
    const persons = t.deaths.filter(d => d.kind === 'person' || d.kind === 'villager');
    const monsters = t.deaths.filter(d => d.kind === 'monster');
    check('A5a kinds captured on both records', t.deaths.length === 2 && t.deaths.every(d => d.kind != null));
    check('A5b person filter excludes the monster kill (the b2 pollution class)', persons.length === 1 && monsters.length === 1,
      `persons=${persons.length} monsters=${monsters.length}`);
    check('A5c no instrument errors', t.errors === 0, `${t.errors}`);
  }

  // A6 — carcassToMeat fat pin (the engine verb works)
  {
    const t = { errors: 0 };
    ka.attachKillInstrument(Game, t);
    Game.state.scholar.inventory = [
      { name: 'Stone knife', kcalEach: 0, units: 1, kg: 0.3 },
      { name: 'Wild boar (carcass)', foodKind: 'meat', foodState: 'carcass', hiddenKcal: 8000, kcalEach: 0, units: 1, spoilDay: 400, plantId: 'meat_wild_boar', kg: 3.0 },
    ];
    Game.cleanCarcass();
    const b = t.carcassButchers[0];
    check('A6a exactly 1 butcher call recorded', t.carcassButchers.length === 1, `${t.carcassButchers.length}`);
    check('A6b 3 fat slabs from the boar (canon BEAR.md)', b && b.fatUnits === 3, b ? `fatUnits=${b.fatUnits}` : 'none');
    check('A6c caller classified scholar (cleanCarcass)', b && b.caller === 'scholar', b ? b.caller : 'none');
    check('A6d fat hidden kcal each = 533 (8000*0.20/3)', b && b.fatHiddenKcalEach === 533, `${b && b.fatHiddenKcalEach}`);
    check('A6e no instrument errors', t.errors === 0, `${t.errors}`);
  }

  // A7 — wound->fever chain (b4 lesson)
  {
    const t = { errors: 0 };
    ka.attachKillInstrument(Game, t);
    const vid = (Game.state.village.roster || [])[0];
    Game.state.scholar.day = 40;
    Game.hurtVillager(vid, 20, 'hunting');
    Game.state.scholar.day = 44;
    Game.tele('death', { kind: 'villager', who: vid, cause: 'sickness' });
    const chains = ka.computeWoundChains(t);
    check('A7a hunt wound recorded', t.huntWounds.length === 1, `${t.huntWounds.length}`);
    check('A7b wound->fever chain attributed (cause sickness, 4d later)', chains.length === 1 && chains[0].cause === 'sickness',
      JSON.stringify(chains[0] || null));
    check('A7c no instrument errors', t.errors === 0, `${t.errors}`);
  }
}

async function detOne(seed, policyId, days, withInstrument) {
  process.env.FEASTSCALE_R13 = '1';
  process.env.SEATDRIVE = '0';
  const pPath = './policies/feastscale';
  delete require.cache[require.resolve(pPath)];
  const fsp = require(pPath);
  const policy = fsp[policyId];
  const { Game } = await loadGame({ seed, mode: 'killaudit-det' });
  await setupGame(Game);
  const t = { errors: 0 };
  if (withInstrument) ka.attachKillInstrument(Game, t);
  const wrapped = Object.assign({}, policy);
  const bDaily = policy.daily;
  const hs = [];
  const hist = {};
  wrapped.daily = (G, ctx) => {
    hs.push(G.state.scholar.day + ':' + dayHash(G));
    if (withInstrument) {
      // exercise the read-only daily paths (wildlife scan, taskLeads copy,
      // knowledge reads) — the det-gate must prove them inert
      ka.dailySnapshot(G, t, hist);
    }
    return bDaily ? bDaily(G, ctx) : undefined;
  };
  await quietLog(async () => { await runDays(Game, wrapped, { days, sampleEvery: days + 1 }); });
  return { hashes: hs.join('\n'), errors: t.errors };
}

async function partB(seeds, policies, days) {
  console.log(`PART B — det-gate: ${seeds.length} seeds x ${policies.length} policies x {off,on}, ${days}d`);
  process.env.FEASTSCALE_R13 = '1';
  process.env.SEATDRIVE = '0';
  let pass = 0, fail = 0, errOn = 0;
  for (const pid of policies) {
    for (const seed of seeds) {
      const off = await detOne(seed, pid, days, false);
      const on = await detOne(seed, pid, days, true);
      const same = off.hashes === on.hashes;
      errOn += on.errors;
      if (same) pass++; else { fail++; console.log(`  MISMATCH ${pid}-${seed}`); }
    }
  }
  check('det-gate byte-identical trajectories', fail === 0, `${pass}/${pass + fail}`);
  check('instrument reported 0 errors', errOn === 0, `${errOn}`);
}

async function main() {
  const SMOKE = process.env.SMOKE === '1';
  await partA();
  if (SMOKE) await partB([99101], ['leadfeast'], 12);
  else await partB([99101, 99102, 99103, 99104], ['leadfeast', 'belongfeast'], 60);
  console.log(failures ? `\nRESULT: ${failures} FAILURE(S)` : '\nRESULT: ALL GREEN');
  process.exit(failures ? 1 : 0);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
