// PROOF TEST: FUSION SINGULARITY (Steve 2026-10-12)
// "it's supposed to be rare and only affect a single one of the villagers."
// + "it's a permanent ability that can't be swapped out."
//
// (a) First install sets the run-level holder flag.
// (b) Second pellet -> no offer while flag set; loot hook says TAKEN out loud.
// (c) Villager field-track grant refused while flag set (choke point);
//     without the flag, a villager grant claims the singularity.
// (d) STAMP (wave-5 cancellation) cannot take the reactor — source-wired
//     exemption + honest copy. (No player respec UI exists; the STAMP is the
//     hostile removal path. npcRevokeAbility only ever targets phoenix_clause.)
// (e) Regression: Cold Table + feast refusal still green (see test-fusion-reactor.js,
//     run separately).
//
// RED: neutralize the flag checks and (a)-(c) fail; remove the sigW5 filter
// and (d) fails.
const SEED = parseInt(process.env.SEED || '20261012', 10);
const fs = require('fs');
const path = require('path');
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
  G.state.systemArrived = true;
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
  G.abilityOnAcquire('fusion_reactor');
}
function villagerVid(G) {
  // a roster villager who is NOT the player
  const ids = G.state.village.roster.filter(id => id !== G.villagerId);
  return ids[0];
}

(async () => {
  const { Game: G, loadFails } = await loadGame({ seed: SEED, mode: 'fusion-singularity-proof' });
  check('all modules load', !loadFails.length, (loadFails || []).join('; '));
  const said = [];
  G.say = (t) => said.push(String(t));
  const sysSaid = [];
  G.sysSay = (t) => sysSaid.push(String(t));
  G.journalNote = () => {}; G.tele = () => {};

  // ---- (a) first install sets the holder flag ----
  {
    const { s } = freshGame(G);
    said.length = 0;
    givePellet(G, 1);
    installReactor(G);
    const h = G.state.fusionReactorHolder;
    check('holder flag set on install', !!(h && h.who === 'player'), JSON.stringify(h));
    check('holder records the day', !!(h && typeof h.day === 'number'));
    check('reactor online after install', G.fusionReactorOnline() === true);
    check('install copy names permanence', said.some(t => /does not come out/i.test(t)), said.join(' | ').slice(0, 120));
  }

  // ---- (b) second pellet -> no offer; loot hook says TAKEN ----
  // NOTE: the flag is RUN-level (on state), not per-scholar. newGame wipes it
  // (new run = new world — correct). Succession keeps it: simulate by swapping
  // in a fresh scholar on the same state.
  {
    G.state.scholar = { villagerId: 'succ-test-vid', abilities: [], inventory: [] };
    G.villagerId = 'succ-test-vid';
    G.state.systemArrived = true;
    const s = G.state.scholar;
    check('flag survives succession (run-level, not per-scholar)', !!G.state.fusionReactorHolder);
    check('reactor died with the body (new scholar holds none)', !s.fusionReactor && !s.abilities.some(a => (a.id || a) === 'fusion_reactor'));
    sysSaid.length = 0;
    givePellet(G, 1);
    check('maybeOfferFusionReactor refuses while taken', G.maybeOfferFusionReactor() === false);
    check('no pending reactor offer created', !(s.abilityChoices || []).some(c => ((c && c.id) || c) === 'fusion_reactor'));
    // loot hook: granting a pellet while taken says so out loud, no offer
    const r = G.alienLootGrant('fusion_pellet');
    check('pellet still grants (burnable)', !!(r && r.entry));
    check('loot hook says TAKEN out loud', sysSaid.some(t => /ONE REACTOR PER WORLD/i.test(t)), sysSaid.join(' | ').slice(0, 140));
    check('still no offer after loot', !(s.abilityChoices || []).some(c => ((c && c.id) || c) === 'fusion_reactor'));
  }

  // ---- (b2) pending-offer race: offer made pre-flag, accepted post-flag ----
  {
    delete G.state.fusionReactorHolder;
    const { s } = freshGame(G);
    said.length = 0;
    givePellet(G, 1);
    check('offer fires with no flag', G.maybeOfferFusionReactor() === true);
    // meanwhile, a villager takes the world's reactor
    const vid = villagerVid(G);
    check('villager grant claims singularity', G.npcGrantAbility(vid, 'fusion_reactor') === true);
    check('flag now points at the villager', G.state.fusionReactorHolder && G.state.fusionReactorHolder.who === 'villager');
    // player accepts the stale pending offer
    s.abilities = s.abilities || [];
    G.chooseAbility('fusion_reactor');
    check('stale install refused — ability not kept', !s.abilities.some(a => (a.id || a) === 'fusion_reactor'));
    check('stale install says TAKEN honestly', said.some(t => /One reactor per world/i.test(t)), said.join(' | ').slice(0, 160));
    check('no phantom reactor state', !(s.fusionReactor && s.fusionReactor.installed));
    check('pellet NOT consumed on refused install', (s.inventory || []).filter(i => (i.itemId || i.id) === 'fusion_pellet').length === 1);
  }

  // ---- (c) villager grant refused while flag set ----
  {
    // flag currently held by the villager from (b2)
    const vid2 = G.state.village.roster.filter(id => id !== G.villagerId && id !== G.state.fusionReactorHolder.vid)[0];
    const before = ((G.state.village.npcAbilities || {})[vid2] || []).slice();
    check('direct grant refused while taken', G.npcGrantAbility(vid2, 'fusion_reactor') === false);
    const after = ((G.state.village.npcAbilities || {})[vid2] || []);
    check('refused grant adds nothing', JSON.stringify(before) === JSON.stringify(after));
    // field-track path: the kit finder skips it while taken (no lie in the grant line)
    delete G.state.fusionReactorHolder;
    const vid3 = villagerVid(G);
    check('no flag -> villager grant succeeds', G.npcGrantAbility(vid3, 'fusion_reactor') === true);
    check('grant sets the flag', !!(G.state.fusionReactorHolder && G.state.fusionReactorHolder.who === 'villager'));
    check('second villager refused after first claims', G.npcGrantAbility(vid2, 'fusion_reactor') === false);
  }

  // ---- (d) STAMP exemption — source-wired (the cancellation block is not
  // separately invocable; assert the filter + honest copy in place) ----
  {
    const sig = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'sigW5.js'), 'utf8');
    check('STAMP filters fusion_reactor from candidates',
      /abId\(e\) !== 'fusion_reactor'/.test(sig));
    check('STAMP honest copy when reactor held',
      /It is inside you\. It does not come out/.test(sig));
    check('STAMP copy honest when only reactor held',
      /nothing it could take/.test(sig));
    // npcRevokeAbility is only ever aimed at phoenix_clause (one-shot), never a pool
    const game = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'game.js'), 'utf8');
    const revokes = [...game.matchAll(/npcRevokeAbility\(vid, '([^']+)'\)/g)].map(m => m[1]);
    check('npcRevokeAbility only targets phoenix_clause', revokes.length > 0 && revokes.every(id => id === 'phoenix_clause'), revokes.join(','));
  }

  // ---- copy honesty ----
  {
    const def = (G.data.abilities || []).find(a => a.id === 'fusion_reactor');
    const blob = ((def && def.description) || '') + ' ' + ((def && def.flavor) || '');
    check('description names one-per-world', /one reactor per world/i.test(blob));
    check('description names permanence', /never comes out|does not come out/i.test(blob));
  }

  // ---- pellet drops stop once taken (rollAlienLoot pool filter) ----
  {
    delete G.state.fusionReactorHolder;
    const mdef = { loot: { chance: 1, tier: 1 }, wave: 1 };
    let sawPelletOpen = false;
    for (let i = 0; i < 60; i++) { if (G.rollAlienLoot(mdef, null) === 'fusion_pellet') { sawPelletOpen = true; break; } }
    check('pellets can drop with no flag (control)', sawPelletOpen);
    G.state.fusionReactorHolder = { who: 'player', vid: G.villagerId, day: 1 };
    let sawPelletTaken = false;
    for (let i = 0; i < 200; i++) { if (G.rollAlienLoot(mdef, null) === 'fusion_pellet') { sawPelletTaken = true; break; } }
    check('no pellet drops while taken (200 rolls)', !sawPelletTaken);
    delete G.state.fusionReactorHolder;
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERR', e); process.exit(1); });
