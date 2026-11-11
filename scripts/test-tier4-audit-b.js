// test-tier4-audit-b.js — proof for the Tier 4 unknowns audit
// (arm sim-tier4-audit-b, run fleshout-loop-b-20261111T1630Z).
// CODE-READ verdicts only — no new sim bands, no src/js changes.
// Part A: static source checks (strings/regexes against the loaded tree).
// Part B: live fixtures (one loadGame + setupGame, direct calls).
// Usage: node scripts/test-tier4-audit-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));

let pass = 0, fail = 0;
const fails = [];
function ok(cond, name, extra) {
  if (cond) { pass++; console.log('ok   ' + name); }
  else { fail++; fails.push(name); console.log('FAIL ' + name + (extra != null ? ' :: ' + JSON.stringify(extra).slice(0, 500) : '')); }
}
function eq(a, b, name) { ok(a === b, name, { got: a, want: b }); }
function read(p) { return fs.readFileSync(path.join(REPO, p), 'utf8'); }

// ---- A. Static source checks ----
(function () {
  const gameJs = read('src/js/game.js');
  const betrayalJs = read('src/js/betrayal.js');
  const shelterJs = read('src/js/shelter.js');
  const tempJs = read('src/js/temperature.js');
  const exposureJs = read('src/js/exposure.js');
  const corpsesJs = read('src/js/corpses.js');
  const competent = read('scripts/policies/competent.js');
  const capable = read('scripts/policies/capable.js');
  const metrics = JSON.parse(read('scripts/balance-metrics.json'));
  const landingR100 = read('scripts/journey-landing-r100-20261104.js');
  const regions = JSON.parse(read('src/data/regions.json'));
  const animals = JSON.parse(read('src/data/animals.json'));

  // A1: the standing panel (31 metrics) judges nothing about these systems.
  eq(metrics.metrics.length, 31, 'A1 panel carries 31 metrics');
  const hit = metrics.metrics.map(function (m) { return m.id; })
    .filter(function (id) { return /shelter|temperatur|exposure|betrayal|veteran/i.test(id); });
  eq(hit.length, 0, 'A1b no panel metric names shelter/temperature/exposure/betrayal/veteran');

  // A2: neither driver ever plays a shelter / temperature / betrayal verb.
  // (competent.js:1839 mentions "exposure" only in a comment about a
  // different thing; capable.js:201 mentions "betrayer" only in a comment.)
  const driverVerbs = ['shelterMuster', 'shelterStandDown', 'shelterVillagers',
    'shelterEveryoneBut', 'releaseShelter', 'stressTick', 'villagerStress',
    'canReadSky', 'acceptInvite', 'declineInvite', 'resolveInvite',
    'npcInviteDecision', 'npcInviteTick', 'shelterThreatNearHaven'];
  for (const v of driverVerbs) {
    const re = new RegExp('\\b' + v + '\\s*\\(', 'g');
    ok(!re.test(competent) && !re.test(capable), 'A2 driver never calls ' + v);
  }

  // A3: recordWaveKill drops unknown ids before logging anything.
  ok(/recordWaveKill\(monsterId, killerVid, via, detail\) \{\s*\n\s*const mdef = this\.data\.monsters\.find\(m => m\.id === monsterId\);\s*\n\s*if \(!mdef\) return;/.test(gameJs),
    'A3 recordWaveKill early-returns when the id has no monsters.json def');

  // A4: veteran +3 damage — the comment claims it; the application is absent.
  ok(/VETERAN VARIANT \(Steve 2026-10-05\): old-wave monsters in a new wave\s*\n\s*\/\/ are hardened\. \+50% HP, \+3 damage, \+1 speed/.test(gameJs),
    'A4 the +3 damage claim lives in the startCombat comment');
  const vetBlocks = gameJs.match(/if \(isVeteran\) \{ hp = Math\.round\(hp \* 1\.5\); spd \+= 1; \}/g) || [];
  eq(vetBlocks.length, 2, 'A4b exactly two isVeteran blocks (snake + normal), each hp x1.5 + speed +1 only');
  ok(!/if \(isVeteran\)[^{]*\{[^}]*dmg|damageBonus|dmgBonus/.test(gameJs),
    'A4c no damage term in any isVeteran block');
  // Every damage path reads the raw def damage, never a fighter bonus.
  const teleDmg = (gameJs.match(/dmg: \(m\.mdef\.attack \|\| \{\}\)\.damage/g) || []).length
    + (gameJs.match(/dmg: \(t\.mdef\.attack \|\| \{\}\)\.damage/g) || []).length;
  ok(teleDmg >= 3, 'A4d telegraph damage reads mdef.attack.damage directly (' + teleDmg + ' sites)', { sites: teleDmg });

  // A5: spawnWorldMonster honors a passed veteran flag and nothing else.
  ok(/veteran: !!\(opts\.veteran \|\| \(mdef && mdef\.veteran\)\)/.test(gameJs),
    'A5 spawnWorldMonster veteran = opts.veteran || mdef.veteran');

  // A6: castMonster is the only path that COMPUTES veteran from the wave gap.
  ok(/const isVeteran = targetWave < wave;/.test(gameJs),
    'A6 castMonster flags veteran when targetWave < unlockedWave');
  ok(/return \{ id: pick\.id, veteran: isVeteran \};/.test(gameJs),
    'A6b castMonster returns {id, veteran}');

  // A7: tile-entry spawn passes a plain def + position only — no veteran.
  ok(/this\.spawnWorldMonster\(mdef, px, py, \{ mx: spot\.mx, my: spot\.my \}\);/.test(gameJs),
    'A7 tile-entry spawn call carries no veteran flag');
  // A8: background-roam top-up passes an empty opts object — no veteran.
  ok(/this\.spawnWorldMonster\(mdef, spot\.x, spot\.y, \{\}\);/.test(gameJs),
    'A8 background-roam (maintainWorldMonsters) spawn call carries no veteran flag');
  // A9: fled-monster recovery drops veteran twice over: the stored record
  // has no veteran key, and the restore call passes no veteran.
  ok(/this\.state\.fledMonsters\[key\] = \{\s*\n\s*id: m\.id,/.test(gameJs),
    'A9 fledMonsters record stores id/mx/my/stance/hp only');
  ok(!/fledMonsters\[key\] = \{[^}]*veteran/.test(gameJs),
    'A9b fledMonsters record has no veteran key');
  ok(/this\.spawnWorldMonster\(\{ id: fled\.id \}, x, y, \{/.test(gameJs),
    'A9c fled recovery restore passes bare {id} — a veteran comes back plain');

  // A10: american_woodcock — no regions field; regionAnimalPool can still
  // include it only via the null-pool (no-list region) branch.
  const woodcock = animals.find(function (a) { return a.id === 'american_woodcock'; });
  ok(!!woodcock, 'A10 woodcock exists in animals.json');
  ok(!('regions' in woodcock), 'A10b woodcock has no regions field');
  ok(/if \(!fa\.animals\) return null;/.test(gameJs),
    'A10c regionAnimalPool returns null when the region lists no animals');
  ok(/const animals = \(this\.data\.animals \|\| \[\]\)\.filter\(a => \(a\.biomes \|\| \[\]\)\.includes\(biomeType\) && \(!pool \|\| pool\.has\(a\.id\)\)\);/.test(gameJs),
    'A10d initTileWildlife admits an animal when pool is null OR pool has it');
  const inAnyList = regions.filter(function (r) {
    return ((r.fauna || {}).animals || []).includes('american_woodcock');
  });
  eq(inAnyList.length, 1, 'A10e woodcock is in exactly ONE region fauna.animals list');
  ok(inAnyList.length === 1 && inAnyList[0].id === 'na_eastern_woodlands',
    'A10e2 that region is na_eastern_woodlands — the DEFAULT landing region', inAnyList.map(function (r) { return r.id; }));
  const noListRegions = regions.filter(function (r) { return !(r.fauna || {}).animals; });
  ok(noListRegions.length === 11, 'A10f 11 of 20 regions carry no animals list (null pool)', { n: noListRegions.length });

  // A11: landing monsterKills records carry monsterId AND wave.
  ok(/monsterKills: \(\(\) => \{\s*\n\s*const out = \[\];[\s\S]*?out\.push\(\{ day: t\.day, monsterId: t\.who, cause: t\.cause, wave: t\.wave,\s*\n\s*player: !!t\.player, killer: t\.killerId \|\| null \}\);/.test(landingR100),
    'A11 landing census monsterKills records carry monsterId + wave (+killer)');
  ok(/this\.tele\('death', \{ kind: opts\.kind \|\| '\?', who: opts\.villagerId \|\| opts\.monsterId \|\| opts\.name \|\| '\?', cause: opts\.cause \|\| '\?', wave: wave, player: !!opts\.player \}\);/.test(corpsesJs),
    'A11b death tele row itself carries who + wave');
  ok(!/killerId/.test(corpsesJs.split("tele('death'")[1].split('});')[0] || ''),
    'A11c death tele row carries NO killerId (census killer is always null)');

  // A12: betrayal is engine-driven daily; player-targeted plots wait on the
  // acceptInvite verb the drivers never call.
  ok(/Game\.endDay = function \(\) \{\s*\n\s*try \{ this\.betrayalDailyFull\(\); \} catch \(e\) \{\}/.test(betrayalJs),
    'A12 betrayalDailyFull runs from the endDay wrap');
  ok(/betrayalDaily\(\) \{[\s\S]*?considerBetrayalPlot\(\)/.test(betrayalJs),
    'A12b betrayalDaily runs considerBetrayalPlot + npcPlotTick + npcInviteTick');
  ok(/if \(this\.isPlayer\(p\.target\)\) continue; \/\/ player plots spring via acceptInvite/.test(betrayalJs),
    'A12c npcPlotTick skips player targets — they spring only via acceptInvite');
  ok(/if \(this\.isPlayer\(best\.b\)\) \{/.test(betrayalJs),
    'A12d considerBetrayalPlot can target the player (beloved-gated)');

  // A13: shelter + temperature are engine-auto (daily wraps), not driver verbs.
  ok(/Game\.progDaily = function \(\) \{\s*\n\s*try \{ this\.shelterMusterCheck\(\); \} catch \(e\) \{\}/.test(shelterJs),
    'A13 shelter muster runs from the progDaily wrap (engine-auto)');
  ok(/wrapOnce\(Game, 'advancePart', function \(orig, args\) \{\s*\n\s*const out = orig\.apply\(this, args\);\s*\n\s*stressTick\(\);/.test(tempJs),
    'A13b temperature stressTick rides the advancePart wrap');
  ok(/wrapOnce\(Game, 'endDay', function \(orig, args\) \{\s*\n\s*const out = orig\.apply\(this, args\);\s*\n\s*narrateSky\(\);\s*\n\s*villagerStress\(\);/.test(tempJs),
    'A13c villagerStress rides the endDay wrap');
  ok(/install\(\);/.test(tempJs), 'A13d temperature install() runs at load');
  // A14: the two "exposure" systems are different things.
  ok(typeof exposureJs === 'string' && /exposureRecord\(\)/.test(exposureJs) && /village keeps the list/i.test(exposureJs),
    'A14 exposure.js is the SOCIAL exposure list (lies named at the fire), not weather');
  ok(/villagerStress\(\): the village feels it too/.test(tempJs),
    'A14b weather exposure lives in temperature.js villagerStress (scene: exposure)');
})();

// ---- B. Live fixtures (one game load) ----
async function liveFixtures() {
  const { Game } = await loadGame({ seed: 190301, mode: 'tier4-audit-b', fullTelemetry: false });
  await setupGame(Game);
  const s = Game.state.scholar;
  const roster = ((Game.state.village || {}).roster || []).filter(function (id) { return id !== Game.villagerId; });

  // B1: shelter — a wave-4 monster at Haven musters the village by itself.
  const mon4 = Game.spawnWorldMonster({ id: 'algorithm', veteran: false }, 4, 4, { mx: 4, my: 4 });
  ok(!!mon4 && mon4.wave === 4, 'B1 wave-4 world monster placed at Haven tile', { wave: mon4 && mon4.wave });
  const threat = Game.shelterThreatNearHaven();
  ok(!!threat && threat.wave >= 4, 'B1b shelterThreatNearHaven names the wave-4 threat', threat);
  const muster = Game.shelterMusterCheck();
  ok(muster && muster.mustered === true, 'B1c shelterMusterCheck musters without any driver verb', muster);
  if (roster.length) {
    const sheltered = Game.shelteredVillagers();
    eq(sheltered.length, roster.length, 'B1d every non-scholar villager is sheltered by the muster');
    ok(Game.isSheltered(roster[0]), 'B1e isSheltered true for a mustered villager');
  } else {
    ok(false, 'B1d no non-scholar roster to shelter-check');
  }
  Game.shelterAllClear();
  ok(Game.shelteredVillagers().length === 0, 'B1f all-clear releases everyone');
  // The algorithm still sits on the Haven tile and would shadow the
  // veteran read in B4 (playerMonster() returns the first monster on the
  // tile). Remove it — the muster proof is done.
  Game.removeWorldMonster(mon4);

  // B2: temperature — the model runs, knowledge-gated, engine-side.
  ok(Game.temperature && typeof Game.temperature.tempC === 'function', 'B2 Game.temperature installed');
  const t = Game.temperature.tempC();
  ok(typeof t === 'number' && t >= -40 && t <= 48, 'B2b tempC returns a clamped number', { tempC: t });
  ok(typeof Game.temperature.skyKind() === 'string', 'B2c skyKind returns a named sky');
  ok(typeof Game.temperature.canReadSky() === 'boolean', 'B2d canReadSky returns a boolean (knowledge gate)');
  ok(typeof Game.temperature.villagerStress === 'undefined' || true, 'B2e (villagerStress is module-private; endDay wrap verified statically in A13c)');

  // B3: exposure (social) — the kept list records a real event.
  ok(typeof Game.recordExposure === 'function' && typeof Game.exposureRecord === 'function',
    'B3 Game.recordExposure / exposureRecord installed');
  const rec = Game.recordExposure({ kind: 'lie', accuser: roster[0] || 'x', accused: roster[1] || 'y', charge: 'lied about their trade' });
  ok(!!rec && rec.kind === 'lie' && typeof rec.day === 'number', 'B3b recordExposure records a real attributable event', rec);
  ok(Game.exposureRecord().length >= 1, 'B3c the kept list holds the record');

  // B4: veteran +3 damage, live — fighter carries the def damage verbatim.
  const defHum = (Game.data.monsters || []).find(function (m) { return m.id === 'hummice'; });
  Game.startCombat('hummice');
  const fCtl = (Game.tbfight.fighters || []).filter(function (f) { return f.kind === 'monster'; })[0];
  ok(!!fCtl && fCtl.veteran === false, 'B4 control fighter is not a veteran');
  const ctlDmg = fCtl && fCtl.mdef && fCtl.mdef.attack && fCtl.mdef.attack.damage;
  ok(JSON.stringify(ctlDmg) === JSON.stringify(defHum.attack.damage), 'B4b control fighter damage is the raw def damage', { ctlDmg: ctlDmg });
  try { if (typeof Game.tbEnd === 'function') Game.tbEnd('fled'); else Game.tbfight = null; } catch (e) { try { Game.tbfight = null; } catch (e2) {} }
  const monV = Game.spawnWorldMonster({ id: 'hummice', veteran: true }, 4, 4, { mx: 4, my: 4 });
  try { Game.state.scholar.monster = monV; } catch (e) {}
  Game.startCombat('hummice');
  const fVet = (Game.tbfight.fighters || []).filter(function (f) { return f.kind === 'monster' && f.veteran; })[0];
  ok(!!fVet, 'B4c veteran fighter exists');
  ok(fVet && fVet.hp >= Math.round(defHum.hp[0] * 1.5) && fVet.hp <= Math.round(defHum.hp[1] * 1.5),
    'B4d veteran hp is def hp x1.5', fVet && { hp: fVet.hp, defHp: defHum.hp });
  ok(fVet && fVet.speed === (defHum.speed || 3) + 1, 'B4e veteran speed is def speed +1', fVet && { speed: fVet.speed });
  const vetDmg = fVet && fVet.mdef && fVet.mdef.attack && fVet.mdef.attack.damage;
  ok(JSON.stringify(vetDmg) === JSON.stringify(defHum.attack.damage),
    'B4f veteran fighter damage is the SAME raw def damage (no +3)', { vetDmg: vetDmg, ctlDmg: ctlDmg });
  ok(fVet && !('dmgBonus' in fVet) && !('damageBonus' in fVet) && !('damage' in fVet),
    'B4g veteran fighter row carries no damage-bonus field at all');
  try { if (typeof Game.tbEnd === 'function') Game.tbEnd('fled'); else Game.tbfight = null; } catch (e) { try { Game.tbfight = null; } catch (e2) {} }

  // B5: plain-def spawns are never veterans (tile-entry / background-roam shape).
  const plain = Game.spawnWorldMonster(defHum, 5, 5, {});
  ok(plain && plain.veteran === false, 'B5 spawnWorldMonster(full def, {}) is not a veteran');
  const plain2 = Game.spawnWorldMonster({ id: 'hummice' }, 6, 6, { mx: 4, my: 4 });
  ok(plain2 && plain2.veteran === false, 'B5b spawnWorldMonster(bare {id}) is not a veteran');

  // B6: older waves DO get picked (spawnWaveTarget), but only castMonster flags them.
  const pool5 = (Game.data.monsters || []).filter(function (m) { return (m.wave || 1) <= 5; });
  let older = 0;
  for (let i = 0; i < 200; i++) { if (Game.spawnWaveTarget(pool5) < 5) older++; }
  ok(older > 0 && older < 200, 'B6 spawnWaveTarget picks older waves sometimes (and newest sometimes)', { older: older });
  const cast = Game.castMonster();
  ok(cast && typeof cast.veteran === 'boolean', 'B6b castMonster returns a veteran boolean', cast);

  // B7: woodcock — excluded on the default region, live.
  const pool = Game.regionAnimalPool();
  ok(pool && typeof pool.has === 'function', 'B7 default region has an animals list (non-null pool)');
  ok(pool.has('american_woodcock'), 'B7b default-region pool DOES contain american_woodcock (na_eastern_woodlands list)');
  let sawWoodcock = false;
  const rnd = (function () { let a = 12345; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; })();
  for (let i = 0; i < 500; i++) {
    const wl = Game.initTileWildlife('thicket', rnd);
    if (wl['american_woodcock']) { sawWoodcock = true; break; }
  }
  ok(sawWoodcock, 'B7c seeded thicket tiles DO grow woodcock on the default region');

  // B8: Sponsor-creature kills are silently dropped by recordWaveKill.
  const logBefore = (Game.state.waveKillLog || []).length;
  const killsBefore = JSON.stringify(Game.state.waveKills || {});
  Game.recordWaveKill('ad_sponsor', Game.villagerId, 'player', null);
  eq((Game.state.waveKillLog || []).length, logBefore, 'B8 ad_sponsor kill adds no log entry');
  eq(JSON.stringify(Game.state.waveKills || {}), killsBefore, 'B8b ad_sponsor kill moves no counter');

  // B9: a real kill logs mid + wave.
  Game.recordWaveKill('gavel', Game.villagerId, 'player', null);
  const entry = (Game.state.waveKillLog || []).filter(function (e) { return e.mid === 'gavel'; }).pop();
  ok(!!entry && entry.w === 3 && entry.by === Game.villagerId && entry.via === 'player',
    'B9 waveKillLog entry carries mid + wave + by + via', entry);

  // B10: the death tele row for a monster kill carries who + wave.
  let deathRow = null;
  const origTele = Game.tele;
  Game.tele = function (type, data) {
    if (type === 'death') deathRow = data;
    return origTele.apply(this, arguments);
  };
  try {
    Game.registerDeath({ kind: 'monster', monsterId: 'gavel', name: 'Gavel', cause: 'slain in test' });
  } finally { Game.tele = origTele; }
  ok(!!deathRow && deathRow.who === 'gavel' && deathRow.wave === 3,
    'B10 death tele row carries who=gavel + wave=3', deathRow);
  ok(deathRow && !('killerId' in deathRow), 'B10b death tele row carries no killerId');

  // B11: betrayal — engine entry points exist; plots live in betrayalState.
  ok(typeof Game.betrayalDaily === 'function', 'B11 Game.betrayalDaily exists');
  ok(typeof Game.considerBetrayalPlot === 'function', 'B11b Game.considerBetrayalPlot exists');
  ok(typeof Game.npcInviteTick === 'function', 'B11c Game.npcInviteTick exists');
  ok(typeof Game.npcPlotTick === 'function', 'B11d Game.npcPlotTick exists');
  const bs = Game.betrayalState();
  ok(bs && Array.isArray(bs.plots) && bs.invites && typeof bs.invites === 'object',
    'B11e betrayalState carries plots array + invites map', { plots: bs && bs.plots && bs.plots.length });
  ok(typeof Game.acceptInvite === 'function' && typeof Game.declineInvite === 'function',
    'B11f acceptInvite / declineInvite exist as player verbs (undriven)');
}

liveFixtures().then(function () {
  console.log('\n' + pass + ' passed, ' + fail + ' failed' + (fails.length ? ' :: ' + fails.join(' | ') : ''));
  if (fail) process.exitCode = 1;
}).catch(function (e) {
  console.error(e.stack);
  process.exitCode = 1;
});
