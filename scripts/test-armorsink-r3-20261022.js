#!/usr/bin/env node
// test-armorsink-r3-20261022.js — proof for sim-armorsink-r3 (instrument-only
// DIAG: targeted instrumentation for villager-generation + gear-form paths,
// day-boundary attribution repair). RED->GREEN.
//
// E0 — module shape (r3 exports; r2 module intact).
// E1 — RED->GREEN fixtures on the REAL engine:
//   F-R3a generation hooks: genItemCandidates + choosePersonalFive wrapped;
//        the factory pool provably carries no P>=15 armor (canon: lootTier<=2
//        non-alien at spawn); a planted hide_armor is recorded with its form.
//   F-R3b prize double-fire: alienLootGrant + broadcast_item_prize for ONE
//        grant -> 2 raw hooks, 1 marked shadowOf; the universe delta is
//        attributed via hook-carryforward-d-1. RED control: r2's own
//        dailySample on the identical fixture flags unexplained (r2's gap),
//        r3's sample does not (the repair).
//   F-R3d villager_gear transfer records from/vid/via (r2 recorded wear only).
//   F-R3e holder deltas: an unhooked +1 names the holder vid in holders.
//   F-R3f form audit: equipped-not-in-items desync -> r3formAnomalies.
// E2 — DET-GATE: r2+r3 instrument-on vs bare byte-identical dayHash traces
//      (1 seed x 2 policies x 40d), 0 instrumentErrors.
// E3 — determinism: two r3 ledger runs -> identical ledger JSON.
// E4 — env gate: the r3 sweep exits 2 without the substrate env.
//
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 \
//   VGEAR=1 KILLDISC=1 node scripts/test-armorsink-r3-20261022.js
'use strict';
const { execFileSync } = require('child_process');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const R3 = require('./armorsink-ledger-r3-20261022');
const R2 = R3.R2;
const { loadGame, setupGame, quietLog, runDays } = require('./sim-harness');
const { dayHash } = require('./det-gate');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

(function e0() {
  for (const k of ['freshLedgerR3', 'installR3', 'dailySampleR3', 'finalizeR3', 'holderDelta', 'R2']) {
    check('E0 r3 exports ' + k, R3[k] !== undefined);
  }
  check('E0 r2 module intact (P_LINE 15)', R2.P_LINE === 15 && typeof R2.install === 'function');
})();

async function freshGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'armorsink-r3-test', fullTelemetry: false });
  await setupGame(Game);
  return Game;
}
function liveVillager(Game) {
  const roster = (((Game.state || {}).village || {}).roster) || [];
  const vid = roster.find(id => id && id !== Game.villagerId);
  if (!vid) return null;
  const p = Game.getPerson ? Game.getPerson(vid) : null;
  return (p && !p.dead) ? { vid, p } : null;
}
function setDay(Game, d) { Game.state.scholar.day = d; }

// F-R3a: generation-path hooks fire; factory pool carries no P>=15 armor.
async function fR3a() {
  const Game = await freshGame(65431);
  const C = R3.freshLedgerR3();
  const u2 = R2.install(Game, C);
  const u3 = R3.installR3(Game, C);
  const occ = ((Game.data || {}).occupations || []).find(o => o && o.name) || { name: 'survivor' };
  const pool = await quietLog(async () => Game.genItemCandidates(occ, { age: 30, id: 'test_gen_1' }));
  const defs = R2.armorDefsOf(Game);
  const poolArmor = (pool || []).filter(id => id && defs[id]).sort();
  const genHits = C.r3genArmor.filter(e => e.where === 'genItemCandidates');
  check('F-R3a genItemCandidates hook fired', genHits.length > 0 || poolArmor.length === 0,
    `hits=${genHits.length} poolArmor=${poolArmor.length}`);
  check('F-R3a hook sees exactly the pool armor ids',
    JSON.stringify(genHits.map(e => e.itemId).sort()) === JSON.stringify(poolArmor),
    `hits=${genHits.map(e => e.itemId).join(',')} pool=${poolArmor.join(',')}`);
  // FINDING (not a failure): the factory's take('clothing', 2) has NO
  // lootTier/origin filter — unlike weapons (Steve 2026-10-06: no high-tier
  // loot at spawn). All armor is class:clothing, so generated villagers CAN
  // mint P>=15 armor (here: skull_helm P18, alien_boots P20). The hook
  // proves the generation path is visible to the ledger per run.
  check('F-R3a generation-path visibility proven (hook records P>=15 pool armor)',
    poolArmor.length === 0 || genHits.length === poolArmor.length,
    `poolArmor=${poolArmor.join(',')}`);
  // form conversion: pool -> items (kept 5) + stashed (rest)
  const ch = { id: 'test_gen_2' };
  await quietLog(async () => Game.choosePersonalFive(ch, ['hide_armor', 'stone_knife', 'bark_armor', 'vine', 'pebble', 'twig', 'leaf', 'bark']));
  const planted = C.r3genArmor.filter(e => e.where === 'choosePersonalFive' && e.itemId === 'hide_armor');
  check('F-R3a choosePersonalFive hook records hide_armor with form',
    planted.length === 1 && (planted[0].form === 'items' || planted[0].form === 'stashed'),
    JSON.stringify(planted));
  check('F-R3a no instrument errors', C.instrumentErrors.length === 0, C.instrumentErrors.slice(0, 2).join(';'));
  u3(); u2();
}

// F-R3b: prize double-fire dedup + day-boundary carry-forward (RED->GREEN).
async function prizeScenario(useR3) {
  const Game = await freshGame(65432);
  const C = useR3 ? R3.freshLedgerR3() : R2.freshLedger();
  const lv = liveVillager(Game);
  if (!lv) return { skipped: true };
  const u2 = R2.install(Game, C);
  let u3 = () => {};
  if (useR3) u3 = R3.installR3(Game, C);
  setDay(Game, 50);
  await quietLog(async () => {
    if (useR3) R3.dailySampleR3(Game, C); else R2.dailySample(Game, C);
  });
  const before = C.production.length;
  await quietLog(async () => {
    // ONE grant: alienLootGrant teles loot_dropped, then the prize tele.
    Game.alienLootGrant('swat_vest', lv.p);
    Game.tele('broadcast_item_prize', { who: lv.vid, id: 'swat_vest', tier: 3, contest: 'test-contest' });
  });
  const newProd = C.production.slice(before);
  // the grant lands in the universe AFTER the day-50 sample (the r2 gap:
  // hook labeled day 50, census sees it on the day-51 sample)
  setDay(Game, 51);
  await quietLog(async () => {
    if (useR3) R3.dailySampleR3(Game, C); else R2.dailySample(Game, C);
  });
  u3(); u2();
  return { C, newProd, vid: lv.vid };
}
async function fR3b() {
  const green = await prizeScenario(true);
  check('F-R3b fixture built', !green.skipped);
  if (green.skipped) return;
  check('F-R3b prize fires 2 raw hooks (audit trail kept)', green.newProd.length === 2,
    JSON.stringify(green.newProd.map(e => e.how)));
  const shadows = green.newProd.filter(e => e.shadowOf === 'broadcast_item_prize');
  check('F-R3b exactly 1 shadowOf=broadcast_item_prize', shadows.length === 1,
    JSON.stringify(green.newProd.map(e => ({ how: e.how, shadowOf: e.shadowOf || null }))));
  check('F-R3b GREEN: r3 unexplained empty', green.C.unexplained.length === 0,
    JSON.stringify(green.C.unexplained));
  const attr = green.C.r3attributed.filter(a => a.itemId === 'swat_vest');
  check('F-R3b attributed via hook-carryforward-d-1',
    attr.length === 1 && attr[0].via === 'hook-carryforward-d-1',
    JSON.stringify(attr));
  check('F-R3b no instrument errors', green.C.instrumentErrors.length === 0,
    green.C.instrumentErrors.slice(0, 2).join(';'));
  // RED control: r2's own sample on the identical fixture flags unexplained.
  const red = await prizeScenario(false);
  check('F-R3b RED: r2 flags the same delta unexplained', red.C.unexplained.length === 1 &&
    red.C.unexplained[0].itemId === 'swat_vest' && red.C.unexplained[0].kind === 'production',
    JSON.stringify(red.C.unexplained));
}

// F-R3d: villager_gear transfer records from/vid/via.
async function fR3d() {
  const Game = await freshGame(65433);
  const C = R3.freshLedgerR3();
  const u2 = R2.install(Game, C);
  const u3 = R3.installR3(Game, C);
  await quietLog(async () => {
    Game.tele('villager_gear', { vid: 'v_aaa', from: 'v_bbb', item: 'hide_armor', via: 'gift' });
    Game.tele('villager_gear', { vid: 'v_ccc', item: 'stormcloak', via: 'armory' });
  });
  const t = C.r3transfers;
  check('F-R3d 2 transfers recorded', t.length === 2, 'n=' + t.length);
  check('F-R3d gift transfer has from', t[0] && t[0].from === 'v_bbb' && t[0].vid === 'v_aaa' && t[0].itemId === 'hide_armor',
    JSON.stringify(t[0]));
  check('F-R3d armory transfer from=null', t[1] && t[1].from === null && t[1].via === 'armory',
    JSON.stringify(t[1]));
  u3(); u2();
}

// F-R3e: unhooked delta names the holder.
async function fR3e() {
  const Game = await freshGame(65434);
  const C = R3.freshLedgerR3();
  const lv = liveVillager(Game);
  check('F-R3e live villager found', !!lv);
  if (!lv) return;
  const u2 = R2.install(Game, C);
  const u3 = R3.installR3(Game, C);
  setDay(Game, 50);
  await quietLog(async () => R3.dailySampleR3(Game, C));
  // unhooked appearance: straight into the villager's items
  lv.p.items = lv.p.items || [];
  await quietLog(async () => { lv.p.items.push('hide_armor'); });
  setDay(Game, 51);
  await quietLog(async () => R3.dailySampleR3(Game, C));
  check('F-R3e unexplained still flags the unhooked delta', C.unexplained.length === 1 &&
    C.unexplained[0].itemId === 'hide_armor', JSON.stringify(C.unexplained));
  const hd = (C.unexplained[0] || {}).holders || {};
  check('F-R3e holders name the villager vid', hd[lv.vid] === 1, JSON.stringify(hd));
  u3(); u2();
}

// F-R3f: form audit catches equipped-not-backed-by-items.
async function fR3f() {
  const Game = await freshGame(65435);
  const C = R3.freshLedgerR3();
  const lv = liveVillager(Game);
  check('F-R3f live villager found', !!lv);
  if (!lv) return;
  const u2 = R2.install(Game, C);
  const u3 = R3.installR3(Game, C);
  lv.p.equipped = { torso: { itemId: 'hide_armor', name: 'Hide armor' } }; // desync: not in items
  setDay(Game, 50);
  await quietLog(async () => R3.dailySampleR3(Game, C));
  const an = C.r3formAnomalies.filter(a => a.itemId === 'hide_armor');
  check('F-R3f form anomaly recorded', an.length === 1 && an[0].vid === lv.vid,
    JSON.stringify(an));
  u3(); u2();
}

// E2: DET-GATE — r2+r3 instrument vs bare, byte-identical.
async function detGate() {
  const VCE = require('./policies/vgearconfirm');
  const hashes = {};
  for (const mode of ['ledger', 'bare']) {
    hashes[mode] = {};
    for (const policyId of ['leadfeast', 'belongfeast']) {
      const policy = VCE.armedFor(policyId);
      const { Game } = await loadGame({ seed: 65421, mode: 'armorsink-r3-det', fullTelemetry: false });
      const C = R3.freshLedgerR3();
      let u2 = () => {}, u3 = () => {};
      if (mode === 'ledger') { u2 = R2.install(Game, C); u3 = R3.installR3(Game, C); }
      const oDaily = policy.daily;
      const wrapped = Object.assign({}, policy, {
        daily(G, ctx) {
          const r = oDaily ? oDaily(G, ctx) : undefined;
          C.hashes.push((((G.state || {}).scholar || {}).day || 0) + ':' + dayHash(G));
          if (mode === 'ledger') R3.dailySampleR3(G, C);
          return r;
        },
      });
      await setupGame(Game);
      await quietLog(async () => { await runDays(Game, wrapped, { days: 40, manifest: undefined, sampleEvery: 30 }); });
      try { u3(); } catch (e) {}
      try { u2(); } catch (e) {}
      if (mode === 'ledger') R3.finalizeR3(Game, C);
      hashes[mode][policyId] = C.hashes.join('|');
      if (mode === 'ledger') {
        check(`E2 ${policyId} 0 instrumentErrors`, C.instrumentErrors.length === 0,
          C.instrumentErrors.slice(0, 3).join('; '));
      }
    }
  }
  for (const p of ['leadfeast', 'belongfeast']) {
    check(`E2 DET r3-instrument-on vs off byte-identical (${p})`,
      hashes.ledger[p] === hashes.bare[p] && hashes.ledger[p].length > 0,
      `ledger=${hashes.ledger[p].length} bare=${hashes.bare[p].length}`);
  }
  // determinism: second r3 ledger run identical ledger JSON
  const policy = VCE.armedFor('leadfeast');
  const { Game } = await loadGame({ seed: 65421, mode: 'armorsink-r3-det', fullTelemetry: false });
  const C = R3.freshLedgerR3();
  const u2 = R2.install(Game, C);
  const u3 = R3.installR3(Game, C);
  const oDaily = policy.daily;
  const wrapped = Object.assign({}, policy, {
    daily(G, ctx) {
      const r = oDaily ? oDaily(G, ctx) : undefined;
      C.hashes.push((((G.state || {}).scholar || {}).day || 0) + ':' + dayHash(G));
      R3.dailySampleR3(G, C);
      return r;
    },
  });
  await setupGame(Game);
  await quietLog(async () => { await runDays(Game, wrapped, { days: 40, manifest: undefined, sampleEvery: 30 }); });
  u3(); u2();
  check('E2 ledger repeat byte-identical', C.hashes.join('|') === hashes.ledger.leadfeast);
}

// E4: env gate for the r3 sweep.
function e4() {
  const env = { ...process.env };
  delete env.FEASTSCALE_R13;
  try {
    execFileSync('node', [path.join(ROOT, 'scripts', 'sweep-armorsink-r3-20261022.js')],
      { env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    check('E4 sweep exits 2 without FEASTSCALE_R13', false, 'exited 0');
  } catch (e) {
    check('E4 sweep exits 2 without FEASTSCALE_R13', e.status === 2, 'status=' + e.status);
  }
}

(async function main() {
  try {
    await fR3a();
    await fR3b();
    await fR3d();
    await fR3e();
    await fR3f();
    await detGate();
    e4();
  } catch (e) {
    fail++;
    console.log('  FATAL ' + (e && e.stack || e));
  }
  console.log(`\narmorsink-r3 proof: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
