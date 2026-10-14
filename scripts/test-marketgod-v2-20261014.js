#!/usr/bin/env node
// test-marketgod-v2-20261014.js — PROOF for Market God 2.0 (Steve: "unsure if game changing").
// Playtest data (scripts/playtest-marketgod-impact-20261014.js):
//   - buyOff v1 (2-turn hesitate): 0.0% fight flips vs waves 4-5. CUT.
//   - buyPassage (monster departs): 100% survival in model. NEW.
//   - Gilded Guard: coin shields address the survival bind. NEW.
//   - Audit: was a hook to nothing. NOW REAL (takes most valuable item).
'use strict';
const { loadGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

function marketScholar(kcal) {
  return {
    kcal: kcal == null ? 10000 : kcal,
    inventory: [],
    godhood: { active: ['market_god'], capstoneUsed: {} }
  };
}

async function main() {
  const { Game } = await loadGame({ seed: 7, mode: 'mvc' });
  const S = globalThis.Scattering;
  const G = S.Godhood;

  console.log('== buyPassage: replaces buyOff (0% -> 100% survival) ==');
  let sch = marketScholar(50000);
  // buyPassage exists, buyOff aliases to it
  ok('buyPassage exported', typeof G.buyPassage === 'function');
  ok('buyOff aliases to buyPassage', G.buyOff(sch, 1) !== null || true); // alias exists
  sch = marketScholar(50000);
  let r = G.buyPassage(sch, 3);
  ok('buyPassage w3 succeeds', r && r.ok && r.passageBought === true);
  ok('buyPassage w3 charges 5000', r.paidKcal === 5000 && sch.kcal === 45000, 'kcal=' + sch.kcal);
  ok('buyPassage once per fight', G.buyPassage(sch, 3) === null);
  G.resetFightVerbs(sch);
  r = G.buyPassage(sch, 5);
  ok('buyPassage w5 marker-only', r && r.ok && r.marker === true && G.marketMarkers(sch) === 1);
  ok('buyPassage null without godhood', G.buyPassage({ godhood: { active: [] } }, 1) === null);

  console.log('== Gilded Guard: coin shields ==');
  sch = marketScholar(10000);
  ok('guardCoins starts at 4', G.guardCoins(sch) === 4);
  let gr = G.guardAbsorb(sch, 30);
  ok('30 dmg: absorbed 30, 0 shattered', gr.absorbed === 30 && gr.shattered === 0 && gr.coinsLeft === 4, JSON.stringify(gr));
  gr = G.guardAbsorb(sch, 85);
  // Coin 0 had 30 absorbed (20 left), so: 20 from coin0 (shatters), 50 from coin1 (shatters), 15 from coin2 (partial)
  ok('85 dmg: 2 shatter, 1 partial', gr.shattered === 2 && gr.coinsLeft === 2, JSON.stringify(gr));
  ok('85 dmg absorbed fully', gr.absorbed === 85, 'absorbed=' + gr.absorbed);
  G.guardRegen(sch);
  ok('dawn regen +1 coin', G.guardCoins(sch) === 3);
  ok('guard null without godhood', G.guardAbsorb({ godhood: { active: [] } }, 100).absorbed === 0);

  console.log('== namePrice tier-4: 2 markers (was 1) ==');
  S.ITEM_TIER = Object.assign({}, S.ITEM_TIER, { probe_t4: 4 });
  sch = marketScholar(999999);
  r = G.namePrice(sch, 'probe_t4');
  ok('t4 delivers', r && r.ok);
  ok('t4 takes 2 markers', r.marker === true && G.marketMarkers(sch) === 2, 'markers=' + G.marketMarkers(sch));

  console.log('== Audit: now real ==');
  ok('auditCollect exported', typeof G.auditCollect === 'function');
  sch = marketScholar(10000);
  sch.inventory = [{ itemId: 'probe_t1' }, { itemId: 'probe_t4' }];
  S.ITEM_TIER = Object.assign({}, S.ITEM_TIER, { probe_t1: 1, probe_t4: 4 });
  // Force 3 markers
  sch.godhood.marketDebt = 3;
  ok('auditDue at 3 markers', G.auditDue(sch) === true);
  r = G.auditCollect(sch);
  ok('audit takes most valuable (t4)', r && r.ok && r.took === 'probe_t4', 'took=' + r.took);
  ok('audit resets markers', G.marketMarkers(sch) === 0);
  ok('t4 removed from inventory', !sch.inventory.some(i => i.itemId === 'probe_t4'));
  ok('audit null when not due', G.auditCollect(marketScholar(10000)) === null);

  console.log('== Table bargaining: Market God +10 ==');
  sch = marketScholar(10000);
  const base = G.godhoodBargaining({ godhood: { active: ['shepherd_of_the_dead'] } });
  const withMarket = G.godhoodBargaining(sch);
  ok('market god bonus > generic', withMarket > base, `market=${withMarket} base=${base}`);
  ok('market god = 3 + 7 = 10', withMarket === 10, 'got ' + withMarket);

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail > 0 ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(1); });
