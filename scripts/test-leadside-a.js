#!/usr/bin/env node
// scripts/test-leadside-a.js — proof test, arm sim-leadside-a
// (findings #2628/#2599: LEAD-SIDE — the gun to the fighters already
// going; #2635: gun-vanish sink instrumentation rides in the driver).
// The lever, env-gated LEADSIDE=1; unset = the old redirect,
// byte-identical:
// (a) RECORDER: a villager who LEADS a wave-4+ fight through
//     resolveWildMonsterEncounter (real fight outcome vKill/mFlee/
//     vFlee/vDie, non-raid) gains one `state.wave4Leads[vid]` count.
//     No count for a wave-3 fight, a raid, an evade, a scholar-led
//     fight, or with LEADSIDE unset. The counter lives OUTSIDE
//     notability on purpose (notability feeds contest/show casting
//     weights — the lead record must not move casting). Zero draws.
// (b) TERM: `_gunRateFighter` adds +4 per wave-4+ launch led,
//     capped +12 (three leads saturate), augmenting — not replacing
//     — the expedition term. 1 lead beats a plain villager, 2 leads
//     tie a current expedition holder (roster-order tie-break),
//     3 leads beat one outright; the cap is proven against a
//     +13 contest-win rival. Dead leaders are skipped; the scholar
//     is never picked even with a wave4Leads entry.
// (c) DRAW-NEUTRALITY: the lever adds ZERO Math.random() draws on
//     either leg (asserted draw counts on `_cxItemPrize` and on the
//     router with a stubbed fieldFight, LEADSIDE on vs off).
// (d) GATE HOLD/FIRE UNCHANGED: under LEADSIDE=1 + CELLGATE=1 the
//     armed searcaster still holds below wave 4 (0 shots, cells
//     kept) and fires at wave 4+ (shots > 0, cells spent).
// The mirror-term honesty note (prereg §1): the wave-3-kill term
// this mirrors is never set by game code in src/ — only read — so
// the recorder test proves the live path, not a fixture value.
// The encounter-gear fixture (a geared villager fighter with a
// party — never a fresh un-geared solo scholar) is shared with the
// gunrate/cellgate tests. The GUNRATE/CELLGATE substrate itself is
// proven by scripts/test-gunrate-a.js (39/39), test-cellgate-a.js
// (12/12) and test-lendpool-a.js (35/35); this test proves ONLY the
// lead-side recorder + term + draw-neutrality + gate hold/fire.
//
// Usage: node scripts/test-leadside-a.js
// Exit 0 = all checks pass. Exit 1 = a failure (listed).
// Writes NOTHING into the repo; prints PASS/FAIL lines to stdout.
// Harness: shared sim-harness (seeded Math.random BEFORE eval, full
// src/js list in index.html order minus DOM-only files).
'use strict';
const path = require('path');
const { execFileSync } = require('child_process');
const { loadGame, setupGame, quietLog } = require('./sim-harness');
const { ammoCountOf, rangedKitOf } = require('./gunrate-driver-a');
const REPO = path.join(__dirname, '..');

let passed = 0, failed = 0;
const fails = [];
function check(name, cond, extra) {
  if (cond) { passed++; console.log('  PASS ' + name); }
  else { failed++; fails.push(name); console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}
function personOf(Game, vid) {
  try { if (Game.getPerson) { const p = Game.getPerson(vid); if (p) return p; } } catch (e) {}
  return ((Game.data.villagers || []).find(x => x.id === vid) ||
    (Game.data.background_survivors || []).find(x => x.id === vid) || {});
}
function resetVillager(Game, p) {
  p.items = []; p.equipped = {}; p.stashed = [];
  try { Game.state.village.ammoCraft = Game.state.village.ammoCraft || {}; delete Game.state.village.ammoCraft[p.id]; } catch (e) {}
  try { Game.state.village.arrowCraftCd = Game.state.village.arrowCraftCd || {}; delete Game.state.village.arrowCraftCd[p.id]; } catch (e) {}
}
function itemDef(Game, id) {
  return (Game.data.items || []).find(function (d) { return d.id === id; }) || null;
}
// Feed Math.random a fixed draw sequence; returns how many draws were consumed.
function withDraws(draws, fn) {
  const saved = Math.random;
  let di = 0;
  Math.random = function () { const v = draws[di % draws.length]; di++; return v; };
  try { return { out: fn(), used: di }; }
  finally { Math.random = saved; }
}
function setLeadside(on) { if (on) process.env.LEADSIDE = '1'; else delete process.env.LEADSIDE; }
function setGunrate(on) { if (on) process.env.GUNRATE = '1'; else delete process.env.GUNRATE; }
function setCellgate(on) { if (on) process.env.CELLGATE = '1'; else delete process.env.CELLGATE; }
const FIGHT_OUTCOMES = ['vKill', 'mFlee', 'vFlee', 'vDie'];

async function main() {
  const { Game } = await loadGame({ seed: 7, mode: 'leadside-unit' });
  await quietLog(async () => { await setupGame(Game); });
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const vid = roster[0];
  const p = personOf(Game, vid);
  // Recorder fights (section 2) use the LAST roster member, so a
  // recorder-fight death/removal can never disturb the roster[0..6]
  // fixtures in sections 3-5.
  const vidR = roster[roster.length - 1];
  console.log('fighter=' + vid + ' recorder=' + vidR + ' roster=' + roster.length);

  // ---- 1. live data agreement ----
  const sear = itemDef(Game, 'searcaster');
  check('searcaster def: alien tier-4, range 8, ammo fusion_cell',
    sear && sear.origin === 'alien' && (sear.lootTier || 0) === 4 &&
    sear.weapon && sear.weapon.range === 8 && sear.weapon.ammo === 'fusion_cell',
    JSON.stringify(sear && sear.weapon));
  const cell = itemDef(Game, 'fusion_cell');
  check('fusion_cell def: material, alien, lootTier 4',
    cell && cell.class === 'material' && cell.origin === 'alien' && (cell.lootTier || 0) === 4,
    JSON.stringify(cell));
  const eulogy = (Game.data.monsters || []).find(function (m) { return m.id === 'eulogy'; });
  check('eulogy fixture is wave 4', eulogy && (eulogy.wave || 1) === 4, JSON.stringify(eulogy && eulogy.wave));
  const w3 = (Game.data.monsters || []).find(function (m) { return (m.wave || 1) === 3; });
  check('a wave-3 monster exists for the recorder negative', !!w3, w3 && w3.id);
  const moth = (Game.data.monsters || []).find(function (m) { return m.id === 'mirrormoth'; });
  check('mirrormoth fixture is wave 1', moth && (moth.wave || 1) === 1, JSON.stringify(moth && moth.wave));

  // ---- 2. recorder: real fights through resolveWildMonsterEncounter ----
  // Encounter-gear fixture: searcaster + 4 cells, geared up.
  function armFighter(v, cells) {
    const pp = personOf(Game, v);
    resetVillager(Game, pp);
    pp.items = [{ itemId: 'searcaster', name: 'Searcaster', units: 1, kg: 1.0 }];
    if (cells > 0) pp.items.push({ itemId: 'fusion_cell', name: 'Fusion cell', units: cells, kg: 0.4 });
    Game.villagerGearUp(v, true);
    return pp;
  }
  function revive(v) {
    // Fixture management between fights: full health, no post-flee
    // rest flag, alive — the test proves the recorder, not the fight.
    const pp = personOf(Game, v);
    try { if (pp) pp.dead = false; } catch (e) {}
    try { Game.state.village.health = Game.state.village.health || {}; Game.state.village.health[v] = 100; } catch (e) {}
    try { if (Game._postFleeRest) delete Game._postFleeRest[v]; } catch (e) {}
  }
  function leadsOf(v) { return ((Game.state.wave4Leads || {})[v] || 0); }
  setLeadside(true);
  armFighter(vidR, 4);
  revive(vidR);
  let rec1 = null;
  try { rec1 = Game.resolveWildMonsterEncounter(vidR, { id: 'eulogy', tx: 4, ty: 4 }, {}); } catch (e) { console.log('encounter error: ' + e.message); }
  check('recorder: real wave-4 fight resolves to a fight outcome',
    rec1 && FIGHT_OUTCOMES.indexOf(rec1.outcome) !== -1, JSON.stringify(rec1 && rec1.outcome));
  check('recorder: one wave-4 lead counts 1', leadsOf(vidR) === 1, 'wave4Leads[' + vidR + ']=' + leadsOf(vidR));
  // Second fight by the same villager counts 2 (fixture revived).
  armFighter(vidR, 4);
  revive(vidR);
  let rec2 = null;
  try { rec2 = Game.resolveWildMonsterEncounter(vidR, { id: 'eulogy', tx: 4, ty: 4 }, {}); } catch (e) { console.log('encounter error: ' + e.message); }
  check('recorder: second real wave-4 fight by the same villager counts 2',
    rec2 && FIGHT_OUTCOMES.indexOf(rec2.outcome) !== -1 && leadsOf(vidR) === 2,
    'outcome=' + JSON.stringify(rec2 && rec2.outcome) + ' leads=' + leadsOf(vidR));
  // Wave-3 fight: a real fight, no count.
  const vid2 = roster[1];
  armFighter(vid2, 4);
  revive(vid2);
  let rec3 = null;
  try { rec3 = Game.resolveWildMonsterEncounter(vid2, { id: w3.id, tx: 4, ty: 4 }, {}); } catch (e) { console.log('encounter error: ' + e.message); }
  check('recorder: real wave-3 fight resolves to a fight outcome',
    rec3 && FIGHT_OUTCOMES.indexOf(rec3.outcome) !== -1, JSON.stringify(rec3 && rec3.outcome));
  check('recorder: wave-3 lead counts 0', leadsOf(vid2) === 0, 'wave4Leads[' + vid2 + ']=' + leadsOf(vid2));
  // Raid fight at wave 4: a real fight, no count.
  const beforeRaid = leadsOf(vidR);
  armFighter(vidR, 4);
  revive(vidR);
  let recR = null;
  try { recR = Game.resolveWildMonsterEncounter(vidR, { id: 'eulogy', tx: 4, ty: 4 }, { raid: true }); } catch (e) { console.log('encounter error: ' + e.message); }
  check('recorder: wave-4 raid resolves to a fight outcome',
    recR && FIGHT_OUTCOMES.indexOf(recR.outcome) !== -1, JSON.stringify(recR && recR.outcome));
  check('recorder: raid lead counts 0 (defence, not a launch led)',
    leadsOf(vidR) === beforeRaid, 'before=' + beforeRaid + ' after=' + leadsOf(vidR));
  // LEADSIDE unset: a real wave-4 fight records nothing.
  setLeadside(false);
  const snapBefore = JSON.stringify(Game.state.wave4Leads || {});
  armFighter(vidR, 4);
  revive(vidR);
  let recOff = null;
  try { recOff = Game.resolveWildMonsterEncounter(vidR, { id: 'eulogy', tx: 4, ty: 4 }, {}); } catch (e) { console.log('encounter error: ' + e.message); }
  check('recorder: LEADSIDE unset, real wave-4 fight resolves',
    recOff && FIGHT_OUTCOMES.indexOf(recOff.outcome) !== -1, JSON.stringify(recOff && recOff.outcome));
  check('recorder: LEADSIDE unset records nothing (map unchanged)',
    JSON.stringify(Game.state.wave4Leads || {}) === snapBefore, 'before=' + snapBefore + ' after=' + JSON.stringify(Game.state.wave4Leads || {}));
  setLeadside(true);
  // Evade: the router never passes awareness, so force the outcome
  // with a stubbed fieldFight (restored immediately) — the filter
  // is what is proven here; the live path is proven above.
  const realFF = Game.fieldFight;
  let evadeRec = null;
  try {
    Game.fieldFight = function () { return { outcome: 'evade', rounds: 0, vTaken: 0, log: [] }; };
    evadeRec = Game.resolveWildMonsterEncounter(vidR, { id: 'eulogy', tx: 4, ty: 4 }, {});
  } finally { Game.fieldFight = realFF; }
  check('recorder: stubbed evade returns the evade record', evadeRec && evadeRec.outcome === 'evade', JSON.stringify(evadeRec && evadeRec.outcome));
  check('recorder: evade counts 0', leadsOf(vidR) === 2, 'leads=' + leadsOf(vidR));
  // Scholar-led fight: stubbed vFlee so the router runs its full
  // branch shape with the scholar id; the guard must still hold.
  let scholarRec = null;
  try {
    Game.fieldFight = function () { return { outcome: 'vFlee', rounds: 1, vTaken: 0, log: [] }; };
    scholarRec = Game.resolveWildMonsterEncounter(Game.villagerId, { id: 'eulogy', tx: 4, ty: 4 }, {});
  } finally { Game.fieldFight = realFF; }
  check('recorder: scholar-led stubbed fight returns the fight record', scholarRec && scholarRec.outcome === 'vFlee', JSON.stringify(scholarRec && scholarRec.outcome));
  check('recorder: scholar-led fight counts 0 (no wave4Leads entry for the scholar)',
    ((Game.state.wave4Leads || {})[Game.villagerId] || 0) === 0, 'scholarLeads=' + ((Game.state.wave4Leads || {})[Game.villagerId] || 0));
  // Draw-neutrality of the recorder: stubbed fieldFight (no draws),
  // same fight, LEADSIDE on vs off — the draw count must be identical.
  const longDraws = [];
  for (let i = 0; i < 200; i++) longDraws.push(0.5);
  function routerDraws(on) {
    setLeadside(on);
    let used = -1;
    try {
      Game.fieldFight = function () { return { outcome: 'vFlee', rounds: 1, vTaken: 0, log: [] }; };
      const r = withDraws(longDraws, function () { return Game.resolveWildMonsterEncounter(vidR, { id: 'eulogy', tx: 4, ty: 4 }, {}); });
      used = r.used;
    } finally { Game.fieldFight = realFF; }
    return used;
  }
  revive(vidR);
  const drawsOn = routerDraws(true);
  revive(vidR);
  const drawsOff = routerDraws(false);
  check('draw-neutrality: router consumes identical draws LEADSIDE on vs off (recorder adds zero)',
    drawsOn >= 0 && drawsOn === drawsOff, 'on=' + drawsOn + ' off=' + drawsOff);
  setLeadside(true);

  // ---- 3. term in _gunRateFighter ----
  const vidL = roster[2], vidE = roster[3], vidD = roster[4], vid1 = roster[5], vidW = roster[6];
  const agency = Game.agencyState ? Game.agencyState() : null;
  check('agencyState reads exped + stats maps', !!agency && !!agency.exped && !!agency.stats,
    JSON.stringify(agency && Object.keys(agency)));
  function clearScores() {
    Game.state.notability = Game.state.notability || {};
    for (const id of roster) {
      Game.state.notability[id] = Object.assign({}, Game.state.notability[id], { wave3Kill: false, wave2Kill: false, contestWin: 0 });
    }
    try { for (const k of Object.keys(agency.exped)) delete agency.exped[k]; } catch (e) {}
    try { for (const k of Object.keys(agency.stats)) delete agency.stats[k]; } catch (e) {}
    Game.state.wave4Leads = {};
  }
  function expedFixture(v) {
    agency.exped[v] = { tx: 6, ty: 6, dist: 2, legs: 0, sinceDay: 1, sincePart: 0, duration: 10, finds: [], encounters: [] };
  }
  // (a) 2 leads (+8) beat 1 launch (+2).
  clearScores();
  Game.state.wave4Leads[vidL] = 2;
  agency.stats[vidD] = { expeditions: 1, monsterKills: 0, caches: 0, nodes: {} };
  let fighter = Game._gunRateFighter ? Game._gunRateFighter() : null;
  check('term: 2 leads (+8) beat 1 launch (+2)', fighter === vidL, 'fighter=' + fighter + ' want=' + vidL);
  // (b) 3 leads (+12) beat the current expedition holder (+8).
  clearScores();
  Game.state.wave4Leads[vidL] = 3;
  expedFixture(vidE);
  fighter = Game._gunRateFighter ? Game._gunRateFighter() : null;
  check('term: 3 leads (+12) beat the expedition holder (+8)', fighter === vidL, 'fighter=' + fighter + ' want=' + vidL);
  // (c) 2 leads (+8) tie the expedition holder (+8): roster order wins.
  clearScores();
  Game.state.wave4Leads[vidL] = 2;
  expedFixture(vidE);
  const earlier = roster.indexOf(vidL) < roster.indexOf(vidE) ? vidL : vidE;
  fighter = Game._gunRateFighter ? Game._gunRateFighter() : null;
  check('term: 2 leads tie expedition (+8 = +8) — earlier roster id wins',
    fighter === earlier, 'fighter=' + fighter + ' want=' + earlier + ' (vidL idx ' + roster.indexOf(vidL) + ', vidE idx ' + roster.indexOf(vidE) + ')');
  // (d) the cap: 5 leads score +12, not +20 — a +13 contest-win rival wins.
  clearScores();
  Game.state.wave4Leads[vidL] = 5;
  Game.state.notability[vidW] = Object.assign({}, Game.state.notability[vidW], { contestWin: 13 });
  fighter = Game._gunRateFighter ? Game._gunRateFighter() : null;
  check('term cap: 5 leads (+12 capped) lose to a +13 contest-win rival', fighter === vidW, 'fighter=' + fighter + ' want=' + vidW);
  // (e) 1 lead (+4) beats a plain villager (0).
  clearScores();
  Game.state.wave4Leads[vid1] = 1;
  fighter = Game._gunRateFighter ? Game._gunRateFighter() : null;
  check('term: 1 lead (+4) beats a plain villager (0)', fighter === vid1, 'fighter=' + fighter + ' want=' + vid1);
  // (f) LEADSIDE unset: the same wave4Leads map does NOT move the pick.
  clearScores();
  Game.state.wave4Leads[vidL] = 3;
  expedFixture(vidE);
  setLeadside(false);
  fighter = Game._gunRateFighter ? Game._gunRateFighter() : null;
  check('term off: LEADSIDE unset, expedition holder wins over the 3-lead villager',
    fighter === vidE, 'fighter=' + fighter + ' want=' + vidE);
  setLeadside(true);
  // (g) a dead leader is skipped, not picked.
  clearScores();
  Game.state.wave4Leads[vidL] = 3;
  const pL = personOf(Game, vidL);
  const wasDead = pL.dead;
  pL.dead = true;
  fighter = Game._gunRateFighter ? Game._gunRateFighter() : null;
  check('term: dead 3-lead villager is skipped', fighter !== vidL, 'fighter=' + fighter + ' (must not be ' + vidL + ')');
  pL.dead = wasDead;
  // (h) the scholar is never picked even with a wave4Leads entry.
  clearScores();
  Game.state.wave4Leads[Game.villagerId] = 99;
  fighter = Game._gunRateFighter ? Game._gunRateFighter() : null;
  check('term: scholar never picked even with 99 recorded leads',
    fighter !== Game.villagerId, 'fighter=' + fighter + ' (must not be scholar ' + Game.villagerId + ')');
  // Restore the (b) fixture for the prize tests: vidL the 3-lead fighter.
  clearScores();
  Game.state.wave4Leads[vidL] = 3;
  fighter = Game._gunRateFighter ? Game._gunRateFighter() : null;
  check('term restored: 3-lead villager leads the pick', fighter === vidL, 'fighter=' + fighter + ' want=' + vidL);
  const pL2 = personOf(Game, vidL);

  // ---- 4. _cxItemPrize: draw-count identity + redirect follows the leader ----
  const reward = Game.data.rewardEconomy || {};
  const extra4 = ((reward.extraItems || {})[4]) || [];
  const contestPool = (Game.data.items || []).filter(function (i) {
    return (i.origin === 'alien' || extra4.indexOf(i.id) !== -1) && (i.lootTier || 1) === 4;
  }).map(function (i) { return i.id; });
  const searIdx = contestPool.indexOf('searcaster');
  const realWave = Game.unlockedWave;
  try { Game.unlockedWave = function () { return 4; }; } catch (e) {}
  check('wave stub reads 4', Game.unlockedWave() === 4);
  const ac = { variant: 'hardened' };
  const contest = { risk: 'extreme' };
  // Player searcaster, LEADSIDE on: redirected to the 3-lead villager + 2 cells, 3 draws.
  setGunrate(true); setLeadside(true);
  resetVillager(Game, pL2);
  const scholarInv = (Game.state.scholar || {}).inventory || [];
  const searsBeforeS = scholarInv.filter(function (e) { return (e.itemId || e.id) === 'searcaster'; }).length;
  const cellsBeforeL = ammoCountOf(pL2.items, 'fusion_cell');
  let r = withDraws([0.1, 0.0, (searIdx + 0.5) / 18], function () { return Game._cxItemPrize(ac, contest, 'player'); });
  check('redirect (player searcaster, LEADSIDE on): prize granted, 3 draws', r.out !== false && r.out !== null && r.used === 3, 'ret=' + JSON.stringify(r.out) + ' draws=' + r.used);
  check('redirect (player searcaster, LEADSIDE on): searcaster lands on the 3-lead villager, not the scholar pack',
    pL2.items.some(function (e) { return (e.itemId || e.id) === 'searcaster'; }) &&
    scholarInv.filter(function (e) { return (e.itemId || e.id) === 'searcaster'; }).length === searsBeforeS,
    'holderHas=' + pL2.items.some(function (e) { return (e.itemId || e.id) === 'searcaster'; }));
  check('redirect (player searcaster, LEADSIDE on): +2 cells bundled to the leader',
    ammoCountOf(pL2.items, 'fusion_cell') === cellsBeforeL + 2,
    'cells=' + ammoCountOf(pL2.items, 'fusion_cell') + ' before=' + cellsBeforeL);
  // Same prize, LEADSIDE off: the leader loses the pick (roster-first
  // plain villager wins the 0-score tie) — and the draw count is identical.
  setLeadside(false);
  resetVillager(Game, pL2);
  const p0 = personOf(Game, roster[0]);
  resetVillager(Game, p0);
  const searsBefore0 = p0.items.filter(function (e) { return (e.itemId || e.id) === 'searcaster'; }).length;
  r = withDraws([0.1, 0.0, (searIdx + 0.5) / 18], function () { return Game._cxItemPrize(ac, contest, 'player'); });
  check('redirect (player searcaster, LEADSIDE off): prize granted, 3 draws (draw-neutral)',
    r.out !== false && r.out !== null && r.used === 3, 'ret=' + JSON.stringify(r.out) + ' draws=' + r.used);
  check('redirect (player searcaster, LEADSIDE off): searcaster lands on the roster-first plain villager, not the leader',
    p0.items.some(function (e) { return (e.itemId || e.id) === 'searcaster'; }) &&
    p0.items.filter(function (e) { return (e.itemId || e.id) === 'searcaster'; }).length === searsBefore0 + 1 &&
    !pL2.items.some(function (e) { return (e.itemId || e.id) === 'searcaster'; }),
    'roster0Has=' + p0.items.some(function (e) { return (e.itemId || e.id) === 'searcaster'; }) + ' leaderHas=' + pL2.items.some(function (e) { return (e.itemId || e.id) === 'searcaster'; }));
  try { Game.unlockedWave = realWave; } catch (e) {}
  setGunrate(false); setLeadside(false);

  // ---- 5. the gate hold/fire is unchanged under LEADSIDE=1 ----
  function armSearcaster(v, cells) {
    const pp = personOf(Game, v);
    resetVillager(Game, pp);
    pp.items = [{ itemId: 'searcaster', name: 'Searcaster', units: 1, kg: 1.0 }];
    if (cells > 0) pp.items.push({ itemId: 'fusion_cell', name: 'Fusion cell', units: cells, kg: 0.4 });
    Game.villagerGearUp(v, true);
  }
  setLeadside(true); setCellgate(true);
  armSearcaster(vid, 4);
  let recH = null;
  try { recH = Game.fieldFight(vid, moth, null, { allies: 1 }); } catch (e) { console.log('fieldFight error: ' + e.message); }
  check('gate holds below wave 4 under LEADSIDE=1 (0 shots, CELLGATE=1)',
    recH && recH.volley && recH.volley.shots === 0, JSON.stringify(recH && recH.volley));
  check('gate keeps all 4 cells below wave 4 under LEADSIDE=1',
    recH && recH.volley && ammoCountOf(p.items, 'fusion_cell') === 4,
    'cells=' + ammoCountOf(p.items, 'fusion_cell'));
  armSearcaster(vid, 4);
  let recW = null;
  try { recW = Game.fieldFight(vid, eulogy, null, { allies: 1 }); } catch (e) { console.log('fieldFight error: ' + e.message); }
  check('gate fires at wave 4+ under LEADSIDE=1 (shots > 0, CELLGATE=1)',
    recW && recW.volley && recW.volley.shots > 0, JSON.stringify(recW && recW.volley));
  check('wave-4+ volley spends exactly its shots in cells under LEADSIDE=1',
    recW && recW.volley && ammoCountOf(p.items, 'fusion_cell') === 4 - recW.volley.shots,
    'left=' + ammoCountOf(p.items, 'fusion_cell') + ' shots=' + (recW && recW.volley && recW.volley.shots));
  setLeadside(false); setCellgate(false);

  // ---- 6. analyzer selftest (analyze-leadside-a --selftest) ----
  console.log('\n=== Analyzer selftest (analyze-leadside-a --selftest) ===');
  let anaSelf = null;
  try {
    const anaOut = execFileSync(process.execPath, [path.join(REPO, 'scripts', 'analyze-leadside-a.js'), '--selftest'],
      { encoding: 'utf8', timeout: 120000, maxBuffer: 16 * 1024 * 1024, env: process.env });
    console.log('  ' + anaOut.trim().split('\n').filter(Boolean).pop());
    anaSelf = /94 passed, 0 failed/.test(anaOut);
  } catch (e) {
    console.log('  (analyzer selftest failed: ' + (e && e.message) + ')');
  }
  check('analyzer selftest passes (94 passed, 0 failed — incl. judgeLeadside + sinkCensus)', anaSelf === true, anaSelf === null ? 'no output' : 'see output above');

  console.log('LEADSIDE_FAILS ' + failed + (fails.length ? ' ' + fails.join(',') : ''));
  console.log('LEADSIDE_PASSED ' + passed + '/' + (passed + failed));
  if (failed) process.exitCode = 1;
}

main().catch(e => { console.error('FATAL ' + (e && e.stack || e)); process.exit(1); });
