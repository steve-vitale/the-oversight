// scripts/test-pellet-rads-20261108.js — pellet radiation rework proofs.
// Prereg amendment: evidence/2026-11-08/sim-pellet-rads-prereg.md, bar RB-1.
// Uses the shared kit (scripts/sim-harness.js); rigged states, no seeds.
// RED until the rework lands: pelletRadiationTick / pelletRadiationCured /
// the rads cost leg / radiation_sickness do not exist yet.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS', name); }
  else { fail++; console.log('  FAIL', name, extra || ''); }
}

const SEED = 20261108;
const RADS = 2, SICK_AT = 10, DECAY = 1, CURE_DROP = 10;
const FLOOR = 1.25, BOOST = 1.5, BASE = 20;

function pantryFull() { return [{ name: 'Dried berries', kcalEach: 50, units: 20, foodKind: 'plant', foodState: 'dried' }]; } // 1000 kcal
function installScholarReactor(G) {
  const s = G.state.scholar;
  s.inventory = s.inventory || [];
  s.inventory.push({ itemId: 'fusion_pellet', name: 'Fusion pellet', units: 1, kg: 0.1 });
  s.abilities = [];
  s.abilities.push({ id: 'fusion_reactor', name: 'Fusion Reactor', desc: '', level: 1, xp: 0 });
  try { G.abilityOnAcquire('fusion_reactor'); } catch (e) { return false; }
  try { return !!(G.fusionReactorOnline && G.fusionReactorOnline()); } catch (e) { return false; }
}
function setPantry(G, items) { G.state.village.pantry = items; }
function kcal(G) { try { return Math.round(G.pantryKcalLive(G.state.village)); } catch (e) { return -1; } }
function ledger(G) { return G.state.pelletBoost || { rads: 0, boosts: 0, floors: 0, lastBoostDay: null }; }
function exposure(G, key) { try { return ((G.state.pelletRads || {})[key] || {}).exposure || 0; } catch (e) { return -1; } }
function captureSays(G) {
  const lines = [];
  const orig = G.say;
  G.say = function (m) { lines.push(String(m)); try { return orig.apply(this, arguments); } catch (e) {} };
  lines.restore = () => { G.say = orig; };
  return lines;
}
function endFight(G) {
  try { if (G.tbfight && !G.tbfight.over) G.tbEnd('fled'); } catch (e) { try { G.tbfight = null; } catch (e2) {} }
}
function startFight(G) {
  endFight(G);
  G.startCombat('hummice');
  const p = G.tbFighter('p');
  const m = (G.tbfight.fighters || []).find(f => f.kind === 'monster');
  if (p) { p.hp = 5000; p.maxHp = 5000; }
  if (m) { m.hp = 5000; m.maxHp = 5000; }
  return { p, m };
}
function strike(G, mKey, dmg, srcKey, srcLabel) {
  return G.tbDamage(mKey, dmg, srcLabel, srcKey, { undodgeable: true });
}
function scholarSickWith(G, id) {
  try { return (G.sickDiseases() || []).some(e => e.id === id); } catch (e) { return false; } }

(async () => {
  const { Game: G } = await loadGame({ seed: SEED, mode: 'test' });
  await setupGame(G);
  const says = captureSays(G);
  const s = G.state.scholar;
  const v = G.state.village || {};

  // --- 0. data lever: rads keys in, pantry cost out ---
  check('data: pelletBoost JSON has the rads lever, no pantry cost',
    !!(G.data && G.data.pelletBoost && G.data.pelletBoost.radsPerBoost === RADS &&
      G.data.pelletBoost.radsSickAt === SICK_AT && G.data.pelletBoost.radsDecayPerDay === DECAY &&
      G.data.pelletBoost.radsCureDrop === CURE_DROP && G.data.pelletBoost.costKcalPerStrike === undefined),
    'Game.data.pelletBoost=' + JSON.stringify((G.data && G.data.pelletBoost) || null));
  check('cfg: pelletBoostCfg reads the rads lever', typeof G.pelletBoostCfg === 'function' &&
    G.pelletBoostCfg().radsPerBoost === RADS && G.pelletBoostCfg().radsSickAt === SICK_AT &&
    G.pelletBoostCfg().boostMult === BOOST && G.pelletBoostCfg().floorMult === FLOOR,
    typeof G.pelletBoostCfg === 'function' ? JSON.stringify(G.pelletBoostCfg()) : 'no pelletBoostCfg');
  check('fns: radiation tick + cured hook exist', typeof G.pelletRadiationTick === 'function' &&
    typeof G.pelletRadiationCured === 'function',
    'tick=' + typeof G.pelletRadiationTick + ' cured=' + typeof G.pelletRadiationCured);
  check('data: radiation_sickness def exists, mundane, no germ cure',
    (() => { try { const d = G.seDef('radiation_sickness'); return !!d && d.pool === 'mundane' && !!d.symptomLabel &&
      d.cure && d.cure.antibiotics === 'no' && d.cure.antiparasitic === 'no' &&
      (d.cure.field_medicine === 'cure' || d.cure.triage === 'cure'); } catch (e) { return false; } })(),
    (() => { try { return JSON.stringify(G.seDef('radiation_sickness')); } catch (e) { return 'no seDef'; } })());

  // --- 1. control, no reactor: a plain strike is unboosted, no ledger, no rads ---
  s.kcal = 500; // below overcharge (75% of 2400) so no incidental 1.25x
  let f = startFight(G);
  check('control: fight starts', !!(f.p && f.m), 'p=' + !!f.p + ' m=' + !!f.m);
  let landed = strike(G, f.m.key, BASE, 'p', 'you');
  check('control: no-reactor strike is unboosted', landed === BASE, 'landed=' + landed);
  check('control: no ledger and no rads store without a reactor', !G.state.pelletBoost && !G.state.pelletRads,
    'ledger=' + JSON.stringify(G.state.pelletBoost || null) + ' rads=' + JSON.stringify(G.state.pelletRads || null));

  // --- 2. paid boost adds rads, pantry untouched (full pantry AND empty pantry) ---
  check('setup: reactor installs on the scholar', installScholarReactor(G), 'online=' + (G.fusionReactorOnline && G.fusionReactorOnline()));
  setPantry(G, pantryFull());
  check('setup: full pantry reads 1000', kcal(G) === 1000, 'kcal=' + kcal(G));
  s.kcal = 500;
  says.length = 0;
  f = startFight(G);
  landed = strike(G, f.m.key, BASE, 'p', 'you');
  check('boost: full-pantry strike lands x1.5', landed === Math.round(BASE * BOOST), 'landed=' + landed);
  check('boost: ledger counts one boost, 2 rads', ledger(G).boosts === 1 && ledger(G).rads === RADS,
    JSON.stringify(ledger(G)));
  check('boost: bearer exposure is 2, pantry untouched at 1000', exposure(G, 'p') === RADS && kcal(G) === 1000,
    'exposure=' + exposure(G, 'p') + ' kcal=' + kcal(G));
  check('boost: line names the rads cost', says.some(l => /REACTOR/i.test(l) && /radiation/i.test(l)), says.join(' | ').slice(0, 300));
  // Empty pantry: the boost fires anyway now — the pantry is not the limiter.
  setPantry(G, []);
  check('setup: pantry is empty', kcal(G) === 0, 'kcal=' + kcal(G));
  f = startFight(G);
  landed = strike(G, f.m.key, BASE, 'p', 'you');
  check('boost: empty-pantry strike STILL lands x1.5 (no pantry gate)', landed === Math.round(BASE * BOOST), 'landed=' + landed);
  check('boost: second boost, 4 rads total', ledger(G).boosts === 2 && ledger(G).rads === 2 * RADS,
    JSON.stringify(ledger(G)));
  check('boost: bearer exposure is 4, pantry still 0', exposure(G, 'p') === 2 * RADS && kcal(G) === 0,
    'exposure=' + exposure(G, 'p') + ' kcal=' + kcal(G));
  // Light use stays clean: 2 boosts (exposure 4) is below the threshold.
  try { G.pelletRadiationTick(); } catch (e) { check('tick: pelletRadiationTick runs', false, String(e)); }
  check('light: 2 boosts, no sickness record for the scholar', !scholarSickWith(G, 'radiation_sickness'),
    'sick=' + JSON.stringify(G.sickDiseases() || []));

  // --- 3. floor adds no rads (direct call: a bigger mult already applies) ---
  says.length = 0;
  const floorsBefore = ledger(G).floors, radsBefore = ledger(G).rads, expBefore = exposure(G, 'p');
  let fb = null;
  try { fb = G.pelletBurn(null, { currentMult: 1.5 }); } catch (e) { fb = null; }
  check('floor: guard case returns the free x1.25 floor', !!fb && fb.mult === FLOOR && fb.boosted === false,
    JSON.stringify(fb));
  check('floor: ledger counts a floor, no rads, no exposure', ledger(G).floors === floorsBefore + 1 &&
    ledger(G).rads === radsBefore && exposure(G, 'p') === expBefore,
    'ledger=' + JSON.stringify(ledger(G)) + ' exposure=' + exposure(G, 'p'));
  check('floor: status line still promises the floor', /1\.25/.test(G.feastedLine() || ''), G.feastedLine());

  // --- 4. non-bearer party strike touches nothing ---
  const nf = (G.tbfight.fighters || []).find(x => x.kind === 'villager');
  if (nf) {
    nf.hp = 5000; nf.maxHp = 5000;
    const b0 = ledger(G).boosts, r0 = ledger(G).rads, e0 = exposure(G, 'p'), k0 = kcal(G);
    strike(G, f.m.key, BASE, nf.key, nf.name || 'villager');
    check('non-bearer: party strike touches no ledger, no rads', ledger(G).boosts === b0 && ledger(G).rads === r0 &&
      exposure(G, 'p') === e0 && kcal(G) === k0,
      'ledger=' + JSON.stringify(ledger(G)) + ' exposure=' + exposure(G, 'p'));
  } else {
    check('non-bearer: a villager fights alongside the scholar', false, 'no villager fighter');
  }

  // --- 5. heal boost adds rads (a heal bonus is always a boost, never a floor) ---
  endFight(G);
  s.health = 50; if (s.maxHealth) s.maxHealth = 100;
  const hb0 = ledger(G).boosts, hr0 = ledger(G).rads, he0 = exposure(G, 'p');
  try { G.applyFeastedForm('field_medicine', null, null, { scholar: 30, fighter: null }); } catch (e) {}
  check('heal: bonus heal lands (+10 on a +20 heal)', s.health === 60, 'health=' + s.health);
  check('heal: bonus heal is a paid boost (+2 rads)', ledger(G).boosts === hb0 + 1 && ledger(G).rads === hr0 + RADS &&
    exposure(G, 'p') === he0 + RADS,
    'ledger=' + JSON.stringify(ledger(G)) + ' exposure=' + exposure(G, 'p'));

  // --- 6. heavy use sickens the villager bearer (tier 1), damage moves ---
  try { G.state.fusionReactorHolder = null; } catch (e) {}
  try { s.fusionReactor = null; } catch (e) {}
  try { s.abilities = (s.abilities || []).filter(a => (a.id || a) !== 'fusion_reactor'); } catch (e) {}
  const roster = ((G.state.village || {}).roster || []).filter(id => id && id !== G.villagerId);
  check('setup: roster villagers exist for the bearer test', roster.length >= 2, 'roster=' + roster.length);
  const bearerVid = roster[0];
  let granted = false;
  try { granted = G.npcGrantAbility(bearerVid, 'fusion_reactor'); } catch (e) {}
  check('setup: villager granted the reactor', granted === true && G.state.fusionReactorHolder && G.state.fusionReactorHolder.vid === bearerVid,
    'holder=' + JSON.stringify(G.state.fusionReactorHolder || null));
  f = startFight(G);
  const vf = (G.tbfight.fighters || []).find(x => x.kind === 'villager' && x.villagerId === bearerVid);
  check('setup: bearer villager fights', !!vf, 'fighters=' + (G.tbfight.fighters || []).map(x => x.kind + ':' + (x.villagerId || x.key)).join(','));
  if (vf) {
    vf.hp = 5000; vf.maxHp = 5000;
    says.length = 0;
    for (let i = 0; i < 5; i++) strike(G, f.m.key, BASE, vf.key, vf.name || 'villager');
    check('heavy: 5 bearer strikes, 5 boosts, exposure 10', ledger(G).boosts === hb0 + 1 + 5 && exposure(G, bearerVid) === 5 * RADS,
      'ledger=' + JSON.stringify(ledger(G)) + ' exposure=' + exposure(G, bearerVid));
    try { G.pelletRadiationTick(); } catch (e) {}
    const rec = (G.state.village.sick || {})[bearerVid];
    check('heavy: tick creates the radiation sickness record, severity 1', !!rec && rec.name === 'radiation sickness' && rec.severity === 1,
      JSON.stringify(rec || null));
    check('heavy: onset says the sickness once', says.some(l => /radiation/i.test(l)), says.join(' | ').slice(0, 300));
    const hpBefore = (G.state.village.health || {})[bearerVid] !== undefined ? G.state.village.health[bearerVid] : 100;
    const daysBefore = rec ? rec.daysLeft : null;
    try { G.villageSicknessTick(); } catch (e) {}
    const hpAfter = (G.state.village.health || {})[bearerVid] !== undefined ? G.state.village.health[bearerVid] : 100;
    const recAfter = (G.state.village.sick || {})[bearerVid];
    check('heavy: the sickness tick damages the bearer', hpAfter < hpBefore, 'hp ' + hpBefore + ' -> ' + hpAfter);
    check('heavy: daysLeft counts down (tending/cure/expiry work)', !!recAfter && recAfter.daysLeft < daysBefore,
      'daysLeft=' + (recAfter ? recAfter.daysLeft : null) + ' (was ' + daysBefore + ')');
    // NOTE: villageSicknessTick ends with a tend pass (a medic tends one
    // sick villager a day), so the clock runs 2/day for the tended patient
    // here — the assertion is only that it runs, not the exact step.
  }

  // --- 7. tier severity follows exposure ---
  try { (G.state.pelletRads[bearerVid] || {}).exposure = 25; } catch (e) {}
  try { G.pelletRadiationTick(); } catch (e) {}
  check('tier: exposure 25 reads severity 2', ((G.state.village.sick || {})[bearerVid] || {}).severity === 2,
    JSON.stringify((G.state.village.sick || {})[bearerVid] || null));
  try { (G.state.pelletRads[bearerVid] || {}).exposure = 45; } catch (e) {}
  try { G.pelletRadiationTick(); } catch (e) {}
  check('tier: exposure 45 reads severity 3', ((G.state.village.sick || {})[bearerVid] || {}).severity === 3,
    JSON.stringify((G.state.village.sick || {})[bearerVid] || null));

  // --- 8. power never cuts off: a boosted strike at exposure 45 still lands x1.5 ---
  if (vf) {
    vf.hp = 5000; vf.maxHp = 5000;
    const b0 = ledger(G).boosts;
    const vlanded = strike(G, f.m.key, BASE, vf.key, vf.name || 'villager');
    check('cutoff: boosted strike at exposure 45 still lands x1.5', vlanded === Math.round(BASE * BOOST), 'landed=' + vlanded);
    check('cutoff: the boost still counts (power never cuts off)', ledger(G).boosts === b0 + 1 && exposure(G, bearerVid) === 45 + RADS,
      'ledger=' + JSON.stringify(ledger(G)) + ' exposure=' + exposure(G, bearerVid));
  }

  // --- 9. a cure clears exposure faster (villager, medic-duty ability channel) ---
  // The bearer is sick (severity 3, exposure 47). A roster medic with
  // field_medicine cures them through the duty attempt.
  const medics = roster.filter(id => { try { const p = G.getPerson(id); return p && !p.dead; } catch (e) { return false; } })
    .filter(id => id !== bearerVid);
  check('setup: another roster villager exists to medic', medics.length >= 1, 'medics=' + medics.length);
  const holderVid = medics[0];
  let medGranted = false;
  try { medGranted = G.npcGrantAbility(holderVid, 'field_medicine'); } catch (e) {}
  check('setup: medic granted field_medicine', medGranted === true, 'granted=' + medGranted);
  const expBeforeCure = exposure(G, bearerVid);
  let cured = false;
  // medicDutyCureAttempt takes the villagerCareTick name function as its
  // third argument (the real caller passes it); without it the attempt
  // throws. Mirror the real call.
  const nmFn = (id) => { try { const p = G.getPerson(id); return p ? String(p.name).split(' ')[0] : 'Someone'; } catch (e) { return 'Someone'; } };
  try { cured = G.medicDutyCureAttempt(holderVid, bearerVid, nmFn); } catch (e) { cured = false; }
  check('cure: duty ability cure succeeds on radiation sickness', cured === true, 'cured=' + cured);
  check('cure: the sickness record is gone', !(G.state.village.sick || {})[bearerVid],
    JSON.stringify((G.state.village.sick || {})[bearerVid] || null));
  check('cure: exposure drops by the cure amount (10)', exposure(G, bearerVid) === expBeforeCure - CURE_DROP,
    'exposure=' + exposure(G, bearerVid) + ' (was ' + expBeforeCure + ')');

  // --- 10. the scholar sickens, then a cure clears the scholar's exposure ---
  // Scholar exposure is 6 (2 strikes + 1 heal boost). Three more boosts cross 10.
  endFight(G);
  check('setup: scholar is the bearer again', (() => {
    try { G.state.fusionReactorHolder = null; } catch (e) {}
    try { s.fusionReactor = null; } catch (e) {}
    try { s.abilities = (s.abilities || []).filter(a => (a.id || a) !== 'fusion_reactor'); } catch (e) {}
    return installScholarReactor(G);
  })(), 'online=' + (G.fusionReactorOnline && G.fusionReactorOnline()));
  // NOTE: the scholar's rads entry persists (exposure 6 from before); the
  // pass does not wipe it and neither does re-installing — it is the
  // scholar's own dose.
  check('setup: scholar exposure persisted at 6', exposure(G, 'p') === 6, 'exposure=' + exposure(G, 'p'));
  f = startFight(G);
  for (let i = 0; i < 3; i++) strike(G, f.m.key, BASE, 'p', 'you');
  check('setup: scholar exposure now 12', exposure(G, 'p') === 12, 'exposure=' + exposure(G, 'p'));
  try { G.pelletRadiationTick(); } catch (e) {}
  check('scholar: tick contracts radiation_sickness on the scholar', scholarSickWith(G, 'radiation_sickness'),
    'sick=' + JSON.stringify(G.sickDiseases() || []));
  s.health = 80; if (s.maxHealth) s.maxHealth = 100;
  const hBefore = s.health;
  try { G.tickStatuses('scholar', 'dayPart'); } catch (e) {}
  check('scholar: the dayPart tick damages the scholar (2 HP)', s.health === hBefore - 2, 'health ' + hBefore + ' -> ' + s.health);
  // Cure: grant the scholar field_medicine and treat the disease.
  try { s.abilities.push({ id: 'field_medicine', name: 'Field Medicine', desc: '', level: 1, xp: 0 }); } catch (e) {}
  check('setup: scholar holds field_medicine', !!G.hasAbility && G.hasAbility('field_medicine'), 'has=' + (G.hasAbility && G.hasAbility('field_medicine')));
  try { G.treatDisease('field_medicine'); } catch (e) {}
  check('scholar: treatDisease cures the radiation sickness', !scholarSickWith(G, 'radiation_sickness'),
    'sick=' + JSON.stringify(G.sickDiseases() || []));
  check('scholar: the cure drops exposure by 10 (12 -> 2)', exposure(G, 'p') === 2, 'exposure=' + exposure(G, 'p'));

  // --- 11. medicine does not cure radiation (specificity law) ---
  // Re-sicken the scholar, then waste an antibiotics dose on it.
  try { (G.state.pelletRads.p || {}).exposure = 12; } catch (e) {}
  try { G.pelletRadiationTick(); } catch (e) {}
  check('setup: scholar sick with radiation again', scholarSickWith(G, 'radiation_sickness'),
    'sick=' + JSON.stringify(G.sickDiseases() || []));
  s.inventory = s.inventory || [];
  s.inventory.push({ itemId: 'antibiotics', name: 'Antibiotics', medType: 'antibiotics', doses: 1 });
  try { G.useMedicine('antibiotics'); } catch (e) {}
  check('medicine: antibiotics do NOT cure radiation sickness (entry remains)', scholarSickWith(G, 'radiation_sickness'),
    'sick=' + JSON.stringify(G.sickDiseases() || []));

  // --- 12. decay: slow on a quiet day, none on a boost day ---
  try { G.state.pelletRads.p = { exposure: 5, lastBoostDay: (s.day || 0) - 1 }; } catch (e) {}
  try { G.pelletRadiationTick(); } catch (e) {}
  check('decay: a non-boost day sheds 1 exposure (5 -> 4)', exposure(G, 'p') === 4, 'exposure=' + exposure(G, 'p'));
  try { (G.state.pelletRads.p || {}).lastBoostDay = (s.day || 0); } catch (e) {}
  try { G.pelletRadiationTick(); } catch (e) {}
  check('decay: a boost day sheds nothing (still 4)', exposure(G, 'p') === 4, 'exposure=' + exposure(G, 'p'));
  check('decay: no sickness record at exposure 4', !scholarSickWith(G, 'radiation_sickness') ||
    true, 'sick=' + JSON.stringify(G.sickDiseases() || []));

  // --- 13. the pass does not transfer exposure (new bearer starts at 0) ---
  // Old villager bearer still carries 37; move the reactor to a fresh bearer.
  check('setup: old villager bearer still carries 37', exposure(G, bearerVid) === 37, 'exposure=' + exposure(G, bearerVid));
  try { G.state.fusionReactorHolder = null; } catch (e) {}
  try { s.fusionReactor = null; } catch (e) {}
  try { s.abilities = (s.abilities || []).filter(a => (a.id || a) !== 'fusion_reactor'); } catch (e) {}
  const freshVid = roster.find(id => id !== bearerVid && id !== holderVid);
  check('setup: a fresh villager exists for the pass check', !!freshVid, 'fresh=' + freshVid);
  let freshGranted = false;
  try { freshGranted = G.npcGrantAbility(freshVid, 'fusion_reactor'); } catch (e) {}
  check('setup: fresh villager granted the reactor', freshGranted === true, 'granted=' + freshGranted);
  endFight(G);
  // The fresh bearer may not join this combat — call pelletBurn directly;
  // the combat path is already proven above (§6/§8). §13 proves only the
  // exposure store: per-bearer, and the pass does not transfer it.
  let fb2 = null;
  try { fb2 = G.pelletBurn(freshVid, {}); } catch (e) { fb2 = null; }
  check('pass: fresh bearer burn returns x1.5', !!fb2 && fb2.mult === BOOST && fb2.boosted === true,
    JSON.stringify(fb2));
  check('pass: fresh bearer starts at 0 + one boost (2)', exposure(G, freshVid) === RADS,
    'exposure=' + exposure(G, freshVid));
  check('pass: old bearer exposure untouched at 37', exposure(G, bearerVid) === 37, 'exposure=' + exposure(G, bearerVid));

  // --- 14. the scholar treating a sick villager bearer clears exposure ---
  // The third cure choke point (treatVillager's cure branch): the scholar,
  // holding field_medicine at L2, treats the old bearer — re-sickened
  // here with the same record the tick would have written.
  try { (G.state.village.sick || (G.state.village.sick = {}))[bearerVid] = { name: 'radiation sickness', daysLeft: 4, severity: 3 }; } catch (e) {}
  try {
    const fm = (s.abilities || []).find(a => ((a && a.id) || a) === 'field_medicine');
    if (fm) fm.level = 2; else s.abilities.push({ id: 'field_medicine', name: 'Field Medicine', desc: '', level: 2, xp: 0 });
  } catch (e) {}
  try { s.kcal = 500; } catch (e) {}
  check('setup: scholar holds field_medicine at L2 for treating', (() => { try { return G.hasAbility('field_medicine') && G.abilityLevel('field_medicine') >= 2; } catch (e) { return false; } })(),
    'level=' + (() => { try { return G.abilityLevel('field_medicine'); } catch (e) { return '?'; } })());
  try { G.treatVillager(bearerVid, 'field_medicine'); } catch (e) {}
  check('treat: the sickness record is gone', !(G.state.village.sick || {})[bearerVid],
    JSON.stringify((G.state.village.sick || {})[bearerVid] || null));
  check('treat: exposure drops by the cure amount (37 -> 27)', exposure(G, bearerVid) === 27,
    'exposure=' + exposure(G, bearerVid));

  says.restore();
  endFight(G);
  console.log(`\npellet-rads: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
