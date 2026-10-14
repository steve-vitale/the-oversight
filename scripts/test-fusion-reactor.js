// PROOF TEST: FUSION REACTOR (Steve 2026-10-12)
// "If you find a fusion pellet, it can sustain you for like forever.
//  Basically that one person doesn't have to eat and gets to freely use
//  the food boost. Which tree should it fall under? Everyone choosing this
//  path in a village should have some serious drawback potentially."
//
// Tests:
//  (1) Ability data: survivalist path, system_offer, pool=system (alien, NOT earthly skill)
//  (2) Pellet is RARE: tier-1 alien pool is small, findable=false, alien drops are low-chance
//  (3) Offer gating: pellet+system+slot => offered; no pellet / held / full => not
//  (4) Install: chooseAbility consumes the pellet, sets fusionReactor
//  (5) No eat needed: dailyNeed => 0, resolveDay doesn't starve at 0 kcal
//  (6) Free food boost: feastedMult => 1.25 with reactor, no feast
//  (7) Ceiling: grantFeastBuff REFUSED for reactor scholar; food still peaks higher (1.5) for eaters
//  (8) Village-wide drawback: reactor guests drag feast quality down (the Cold Table)
//  (9) Honest fizzle: acquiring without a pellet removes the ability, no phantom reactor
const SEED = parseInt(process.env.SEED || '20261012', 10);
const { loadGame } = require('./sim-harness');
const assert = require('assert');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS', name); }
  else { fail++; console.log('  FAIL', name, extra || ''); }
}

function freshGame(G) {
  G.genRoster('Columbus, Ohio');
  G.newGame('Columbus, Ohio', null, G.generatedRoster[0].id);
  G.depart();
  const s = G.state.scholar, v = G.state.village;
  s.abilities = [];
  return { s, v };
}
function givePellet(G, n) {
  const s = G.state.scholar;
  s.inventory = s.inventory || [];
  for (let i = 0; i < (n || 1); i++) s.inventory.push({ itemId: 'fusion_pellet', name: 'Fusion pellet', units: 1, kg: 0.1 });
}
function installReactor(G) {
  const s = G.state.scholar;
  s.abilities = s.abilities || [];
  if (!s.abilities.some(a => (a.id || a) === 'fusion_reactor'))
    s.abilities.push({ id: 'fusion_reactor', name: 'Fusion Reactor', desc: '', level: 1, xp: 0 });
  // simulate the install (abilityOnAcquire consumes the pellet)
  G.abilityOnAcquire('fusion_reactor');
}
const richPantry = () => [
  { name: 'Smoked turkey leg', kcalEach: 100, units: 12, foodKind: 'meat', foodState: 'smoked' },
  { name: 'Dried berries', kcalEach: 100, units: 12, foodKind: 'plant', foodState: 'dried' },
  { name: 'Stewed roots', kcalEach: 150, units: 8, foodKind: 'plant', foodState: 'cooked' },
  { name: 'Travel bread', kcalEach: 200, units: 6, foodKind: 'plant', foodState: 'baked' },
];

(async () => {
  const { Game: G, loadFails } = await loadGame({ seed: SEED, mode: 'fusion-reactor-proof' });
  const S = globalThis.Scattering;
  check('all modules load', !loadFails.length, loadFails.join('; '));
  G.say = () => {}; G.sysSay = () => {};

  // ---- (1) ability data ----
  const def = (G.data.abilities || []).find(a => a.id === 'fusion_reactor');
  check('fusion_reactor exists in abilities.json', !!def);
  check('survivalist path (the metabolic/body tree)', !!(def && def.path === 'survivalist' /* god-path 2026-10-14: paths -> path */));
  check('system_offer unlock', !!(def && def.unlock && def.unlock.type === 'system_offer'));
  check('pool=system (alien ability, NOT earthly skill)', !!(def && def.pool === 'system'));

  // ---- (2) pellet rarity ----
  const pellet = (G.data.items || []).find(i => i.id === 'fusion_pellet');
  check('pellet is alien origin', !!(pellet && pellet.origin === 'alien'));
  check('pellet NOT forageable (findable=false)', !!(pellet && pellet.findable === false));
  const t1pool = (G.data.items || []).filter(i => i.origin === 'alien' && (i.lootTier || 1) === 1);
  check('pellet shares a small tier-1 alien pool (rare slice)', t1pool.length <= 6 && t1pool.some(i => i.id === 'fusion_pellet'), `pool=${t1pool.length}`);

  // ---- (3) offer gating ----
  {
    const { s } = freshGame(G);
    G.state.systemArrived = true;
    check('no offer without pellet', G.maybeOfferFusionReactor() === false);
    check('no pending offer created', !(s.abilityChoices || []).some(c => ((c && c.id) || c) === 'fusion_reactor'));
    givePellet(G, 1);
    check('offer fires with pellet + system + slot', G.maybeOfferFusionReactor() === true);
    check('offer is the reactor', (s.abilityChoices || []).some(c => ((c && c.id) || c) === 'fusion_reactor'));
    check('offer idempotent (no double)', G.maybeOfferFusionReactor() === false);
  }
  {
    const { s } = freshGame(G);
    G.state.systemArrived = true;
    givePellet(G, 1);
    s.abilities.push({ id: 'fusion_reactor', name: 'x', desc: '', level: 1, xp: 0 });
    check('no offer when already held', G.maybeOfferFusionReactor() === false);
  }

  // ---- (4) install consumes the pellet ----
  {
    const { s } = freshGame(G);
    G.state.systemArrived = true;
    givePellet(G, 1);
    G.maybeOfferFusionReactor();
    const before = s.inventory.filter(i => (i.itemId || i.id) === 'fusion_pellet').length;
    G.chooseAbility('fusion_reactor');
    const after = (s.inventory || []).filter(i => (i.itemId || i.id) === 'fusion_pellet').length;
    check('pellet consumed on install', before === 1 && after === 0, `before=${before} after=${after}`);
    check('reactor installed', !!(s.fusionReactor && s.fusionReactor.installed));
    check('reactor online', G.fusionReactorOnline() === true);
  }

  // ---- (9) honest fizzle: no pellet, no reactor ----
  {
    const { s } = freshGame(G);
    G.state.systemArrived = true;
    s.abilities.push({ id: 'fusion_reactor', name: 'x', desc: '', level: 1, xp: 0 });
    G.abilityOnAcquire('fusion_reactor'); // no pellet in pack
    check('ability removed when no pellet to install', !s.abilities.some(a => (a.id || a) === 'fusion_reactor'));
    check('no phantom reactor state', !(s.fusionReactor && s.fusionReactor.installed));
  }

  // ---- (5) no eat needed ----
  {
    const { s } = freshGame(G);
    givePellet(G, 1);
    installReactor(G);
    const need = S.calories.dailyNeed(s);
    check('dailyNeed is 0 with online reactor', need === 0, `need=${need}`);
    s.kcal = 0; s.health = 100; s.energy = 100; s.hydration = 80;
    const r = S.calories.resolveDay(s, G.state.village, {});
    check('no starvation spiral at 0 kcal', r.ok && !r.warnings.some(w => /STARVING/i.test(w)), r.warnings.join('; '));
    check('health untouched', s.health === 100);
  }
  {
    // control: a normal scholar still needs food
    const { s } = freshGame(G);
    const need = S.calories.dailyNeed(s);
    check('control: normal scholar still needs ~2200 kcal', need >= 2000, `need=${need}`);
  }

  // ---- (6) free food boost ----
  {
    const { s } = freshGame(G);
    givePellet(G, 1);
    installReactor(G);
    delete s.feastBuff;
    const m = G.feastedMult();
    check('reactor gives free 1.25x with no feast', m === 1.25, `mult=${m}`);
    check('status line names the reactor', /REACTOR/.test(G.feastedLine()), G.feastedLine());
  }

  // ---- (7) ceiling: feast buff refused; food still peaks higher for eaters ----
  {
    const { s } = freshGame(G);
    givePellet(G, 1);
    installReactor(G);
    s.prog = s.prog || {}; s.prog.feastSurge = 1.5; s.prog.feastSurgeUsed = false;
    const gr = G.grantFeastBuff({ quality: 2, served: [], guests: [], daypart: 1, surge: 1.5 });
    check('feast buff REFUSED for reactor scholar', !!(gr && gr.granted === false));
    check('mult stays at reactor floor (no stacking)', G.feastedMult() === 1.25, `mult=${G.feastedMult()}`);
  }
  {
    // control: an eater CAN reach legendary 1.5x — food remains the path to PEAK power
    const { s } = freshGame(G);
    s.prog = s.prog || {}; s.prog.feastSurge = 1.5; s.prog.feastSurgeUsed = false;
    const gr = G.grantFeastBuff({ quality: 2, served: [], guests: [], daypart: 1, surge: 1.5 });
    check('control: eater gets legendary feast buff', !!(gr && gr.granted), JSON.stringify(gr));
    check('control: eater mult beats reactor (1.5 > 1.25)', G.feastedMult() > 1.25, `mult=${G.feastedMult()}`);
  }

  // ---- (8) village-wide drawback: the Cold Table ----
  {
    const { s, v } = freshGame(G);
    v.pantry = richPantry();
    // baseline: no reactors — rich pantry, full village => fine feast (quality 1; legend gate needs story+4 guests)
    const base = G.hostFeast();
    check('baseline feast works', base.ok === true, base.why || '');
    const baseQ = base.quality != null ? base.quality : null;

    // now give three villagers reactors and re-feast
    const { s: s2, v: v2 } = freshGame(G);
    v2.pantry = richPantry();
    const guests = G.feastPlan().guests.filter(g => g.status === 'here').map(g => g.vid).slice(0, 3);
    v2.npcAbilities = v2.npcAbilities || {};
    for (const vid of guests) v2.npcAbilities[vid] = ['fusion_reactor'];
    const cold = G.hostFeast();
    check('feast still happens with reactors present', cold.ok === true, cold.why || '');
    check('reactor guests drag quality DOWN (cold table)', (cold.quality != null ? cold.quality : 99) < (baseQ != null ? baseQ : 99),
      `baseQ=${baseQ} coldQ=${cold.quality}`);
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
