#!/usr/bin/env node
// scripts/test-sharepol-20261014.js — SHAREPOL proof (fleshout-b, 2026-10-14).
//
// THE ARM: finding #115 — the throttle's starvation cost is distributional
// (trust-gated sharing), not buffer depth. sharepol (scripts/policies/sharepol.js)
// layers proactive person-to-person sharing onto leadcourt/belongseek: the
// scholar feeds hungry villagers via the honest engine verb
// Game.giveFood(vid, 'meal') (hunger −60, substance-scaled trust, honest beats,
// 1 tick, real pack-unit cost). Opt-in SHAREPOL=1, default OFF.
//
// RED PHASE (gate-off byte-identical): SHAREPOL unset — withShare(base).daily
// must behave BYTE-IDENTICALLY to base.daily on the same fixture (no gifts,
// no hunger/trust/inventory drift, no narration). The policy-side equivalent
// of the patch-file cycle: the layer is provably inert when off.
// GREEN (SHAREPOL=1):
//   §2 mechanism (direct sharePass call — no base.daily confound):
//     1. gifts fire on the two hungriest villagers (cap respected)
//     2. INTAKE MEASURED: recipients' hunger meters drop by exactly 60 (meal
//        relief) — the food reaches hands, not just the attempt counted
//     3. trust moves up on recipients (the virtuous loop's currency)
//     4. a pending food request is answered (deleted, gratitude beat)
//     5. sharing narrates honestly (no silent actions)
//     6. the scholar's pack loses real units (the food is the real cost)
//     7. the gift is remembered (a person deciding, not a dispenser)
//   §3 integration: layered.daily fires gifts inside the real daily flow
//   §4 scholar kcal floor: below 800 kcal the scholar does NOT give
//   §5 no hunger>70 -> pass stands down
//
// Harness: sim-harness (mulberry32 seeded BEFORE eval, full src/js list in
// index.html order minus DOM-only, window stubbed then deleted, Game.save real).
'use strict';
const { loadGame, setupGame, quietLog } = require('./sim-harness');
const { withShare, sharePass, hungryVillagers } = require('./policies/sharepol');
const { leadcourt } = require('./policies/leadcourt');

const fails = [];
function check(name, cond, detail) {
  const ok = !!cond;
  console.log(`  ${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) fails.push(name);
}

const said = [];
async function fixture() {
  const { Game } = await loadGame({ seed: 20261014, mode: 'sharepol-proof', fullTelemetry: false });
  await setupGame(Game);
  Game.say = (t) => { said.push(String(t)); };
  Game.feedback = function () {};
  Game.nearFire = () => true;
  const sch = Game.state.scholar;
  sch.day = 10;
  sch.kcal = 2000;
  sch.inventory = [
    { name: 'Smoked fish', itemId: 'smoked_fish', kcalEach: 400, units: 6, foodState: 'preserved', safe: true, spoilDay: 99999 },
    { name: 'Cooked tubers', itemId: 'cooked_tubers', kcalEach: 300, units: 4, foodState: 'cooked', safe: true, spoilDay: 99999 },
  ];
  const v = Game.state.village;
  const me = sch.villagerId;
  const others = (v.roster || []).filter(id => id !== me);
  const hungers = { [others[0]]: 92, [others[1]]: 84, [others[2]]: 76, [others[3]]: 30 };
  for (const [vid, h] of Object.entries(hungers)) {
    try { Game.npcNeeds(vid).hunger = h; } catch (e) {}
  }
  v.requests = v.requests || {};
  v.requests[others[1]] = { type: 'food', day: 10, part: 'dawn' };
  v.trust = v.trust || {};
  for (const vid of others) v.trust[vid] = 20;
  return { Game, others };
}

function snap(Game, others) {
  const s = { hunger: {}, trust: {}, reqs: 0, pack: 0, said: said.length };
  for (const vid of others) {
    try { s.hunger[vid] = Game.npcNeeds(vid).hunger || 0; } catch (e) { s.hunger[vid] = -1; }
    try { s.trust[vid] = (Game.state.village.trust || {})[vid]; } catch (e) { s.trust[vid] = -1; }
  }
  try { s.reqs = Object.keys(Game.state.village.requests || {}).length; } catch (e) {}
  try { s.pack = (Game.state.scholar.inventory || []).reduce((t, i) => t + (i.units || 0), 0); } catch (e) {}
  return s;
}

(async () => {
  const armed = process.env.SHAREPOL === '1';
  console.log(`SHAREPOL=${process.env.SHAREPOL || 'unset'} (${armed ? 'ARMED — mechanism must fire' : 'GATE OFF — must be inert'})`);

  if (!armed) {
    // ---- §1 RED: gate-off byte-identical ----
    console.log('== §1 RED (gate-off): withShare(base).daily === base.daily ==');
    const fx = await fixture();
    const { Game, others } = fx;
    const base = Object.assign({}, leadcourt);
    const layered = withShare(base);
    const ctxA = {}, ctxB = {};
    said.length = 0;
    await quietLog(async () => { base.daily(Game, ctxA); });
    const sA = snap(Game, others);
    const saidA = said.length;
    const fx2 = await fixture();
    const G2 = fx2.Game;
    said.length = 0;
    await quietLog(async () => { layered.daily(G2, ctxB); });
    const sB = snap(G2, fx2.others);
    check('no gifts fired (shareGifts absent)', !ctxB.shareGifts, 'shareGifts=' + ctxB.shareGifts);
    check('hunger meters identical to base', JSON.stringify(sA.hunger) === JSON.stringify(sB.hunger));
    check('trust identical to base', JSON.stringify(sA.trust) === JSON.stringify(sB.trust));
    check('requests identical to base', sA.reqs === sB.reqs, `${sA.reqs} vs ${sB.reqs}`);
    check('pack identical to base', sA.pack === sB.pack, `${sA.pack} vs ${sB.pack}`);
    check('no narration beyond base', said.length === saidA, `said ${said.length} vs ${saidA}`);
  } else {
    // ---- §2 GREEN: mechanism, direct sharePass (no base.daily confound) ----
    console.log('== §2 GREEN (armed): sharePass puts food in hungry hands ==');
    const { Game, others } = await fixture();
    const v = Game.state.village;
    const ctx = {};
    said.length = 0;
    const packBefore = (Game.state.scholar.inventory || []).reduce((t, i) => t + (i.units || 0), 0);
    const hBefore = {}, tBefore = {};
    for (const vid of others) {
      hBefore[vid] = Game.npcNeeds(vid).hunger || 0;
      tBefore[vid] = (v.trust || {})[vid];
    }
    let gifts = 0;
    await quietLog(async () => { gifts = sharePass(Game, ctx); });
    check('gifts fired (cap 2/day)', gifts === 2 && ctx.shareGifts === 2, `gifts=${gifts} ctx=${ctx.shareGifts}`);
    // asked-first: others[1] (84, asked) then hungriest: others[0] (92)
    const fed = [others[1], others[0]];
    for (const vid of fed) {
      const after = Game.npcNeeds(vid).hunger || 0;
      const drop = hBefore[vid] - after;
      check(`INTAKE on ${vid.slice(0, 8)}: hunger ${hBefore[vid]}→${after} (meal relief −60)`,
        drop === 60, 'drop=' + drop);
      const tGain = ((v.trust || {})[vid] || 0) - (tBefore[vid] || 0);
      check(`trust moved on ${vid.slice(0, 8)}`, tGain > 0, '+' + tGain.toFixed(1));
      const mems = ((v.memory || {})[vid] || []);
      check(`gift remembered on ${vid.slice(0, 8)} (a person, not a dispenser)`,
        mems.some(m => m.t === 'gift'), mems.map(m => m.t).join(',') || '(none)');
    }
    check('cap honored: third hungry villager (76) waits for tomorrow',
      (Game.npcNeeds(others[2]).hunger || 0) === hBefore[others[2]]);
    check('content villager (30) untouched',
      (Game.npcNeeds(others[3]).hunger || 0) === hBefore[others[3]]);
    check('food request answered (deleted)', !(v.requests || {})[others[1]]);
    check('gratitude beat narrated (asked favor)', said.some(s => /Thank you/i.test(s) && /won't forget/i.test(s)));
    check('unasked gift narrated honestly (no silent actions)',
      said.some(s => /You give .* (some|portions of)/.test(s) || /No one sees/.test(s)),
      said.filter(s => /You give|No one sees/i.test(s)).slice(0, 1).join('').slice(0, 100));
    const packAfter = (Game.state.scholar.inventory || []).reduce((t, i) => t + (i.units || 0), 0);
    check('pack lost real units (the food is the cost)', packAfter < packBefore, `${packBefore}→${packAfter}`);

    // ---- §3 GREEN: integration — layered.daily fires gifts in the real flow ----
    console.log('== §3 GREEN: layered.daily fires gifts inside the real daily ==');
    const fx3 = await fixture();
    const G3 = fx3.Game;
    const ctx3 = {};
    said.length = 0;
    await quietLog(async () => { withShare(Object.assign({}, leadcourt)).daily(G3, ctx3); });
    check('gifts fired in the real daily flow', (ctx3.shareGifts || 0) >= 1, 'shareGifts=' + ctx3.shareGifts);
    check('sharing narrated in the real flow', said.some(s => /Thank you|You give|No one sees/i.test(s)));

    // ---- §4 GREEN: scholar kcal floor ----
    console.log('== §4 GREEN: scholar kcal floor ==');
    const fx4 = await fixture();
    const G4 = fx4.Game;
    G4.state.scholar.kcal = 500; // below the 800 floor
    const ctx4 = {};
    let gifts4 = 0;
    await quietLog(async () => { gifts4 = sharePass(G4, ctx4); });
    check('no gifts below the scholar kcal floor', gifts4 === 0 && !ctx4.shareGifts, `gifts=${gifts4}`);

    // ---- §5 GREEN: no hunger>70 -> pass stands down ----
    console.log('== §5 GREEN: no hunger>70 -> pass stands down ==');
    const fx5 = await fixture();
    const G5 = fx5.Game;
    for (const vid of fx5.others) { try { G5.npcNeeds(vid).hunger = 20; } catch (e) {} }
    G5.state.village.requests = {};
    const ctx5 = {};
    let gifts5 = 0;
    await quietLog(async () => { gifts5 = sharePass(G5, ctx5); });
    check('no gifts when nobody is hungry', gifts5 === 0 && !ctx5.shareGifts, `gifts=${gifts5}`);
  }

  console.log(fails.length ? `\nPROOF FAIL: ${fails.length} failure(s)` : '\nPROOF GREEN — all checks pass');
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error('PROOF CRASH:', e); process.exit(2); });
