// scripts/test-ladder-bundle-20261108.js — feast bundle + buy-out + capstone
// delivery + mercy proofs (leg 2).
// Prereg: evidence/2026-11-08/sim-ladder-leg2-prereg.md (bar L2-2).
// Uses the shared kit (scripts/godpath/lib.js) + sim-harness for the mercy
// section (mirror of test-table-sanctity-gate-20261020.js); rigged states, no seeds.
'use strict';
const K = require('./godpath/lib');
const { loadGame, setupGame, quietLog } = require('./sim-harness');

function resetXp(Game) {
  const T = ['combat', 'field', 'social', 'craft', 'strange'];
  const pt = Game.playerTracks();
  for (const t of T) pt[t].xp = 0;
  const roster = ((Game.state.village || {}).roster || []);
  for (const vid of roster) {
    if (!vid || vid === Game.villagerId) continue;
    const vp = Game.vpOf ? Game.vpOf(vid) : null;
    if (vp && vp.dead) continue;
    const x = Game.npcXp(vid);
    for (const t of T) x[t] = 0;
  }
}

function setLedger(Game, wave, points) {
  Game.state.waveLedger = Game.state.waveLedger || {};
  Game.state.waveLedger[wave] = { points, perType: {}, perTypeX: {} };
}

function resetLadderState(Game) {
  resetXp(Game);
  Game.state.waveLedger = {};
  Game.state.feastLog = [];
  Game.state.waveKillLog = [];
  try { Game.deedState().contestsSurvived = 0; } catch (e) {}
  try { Game.state.codex = { plants: {}, monsters: {}, animals: {}, recipes: {}, techniques: {}, skills: {} }; } catch (e) {}
  try { const ls = Game.hierarchyState(); ls.length = 0; } catch (e) {}
  delete Game.state._ladderPeakStage;
  delete Game.state._ladderCapBeat;
  try { Game.state.nationalLive = false; Game.state.globalLive = false; Game.state.networkLive = false; } catch (e) {}
  try {
    const pg = Game.progState();
    delete pg.ladderCapstone; delete pg.ladderCapstoneDay; delete pg.ladderCapstoneDetail;
    pg.crises = {}; pg.sentimentTaught = false;
    pg.tableWaiting = false; pg.tableDone = false; pg.tableAnnounced = false;
  } catch (e) {}
  try {
    const s = Game.state.scholar;
    s.prog = s.prog || {};
    delete s.prog.feastSurgeUsed; delete s.prog.feastSurge;
    s.integration = 0;
  } catch (e) {}
}

function rigNational(Game) { // 40 counted: Fight 24 + Forage 16
  setLedger(Game, 3, 48);
  Game.playerTracks().field.xp = 192;
}

function livingVillager(Game) {
  const roster = ((Game.state.village || {}).roster || []);
  for (const vid of roster) {
    if (!vid || vid === Game.villagerId) continue;
    const vp = Game.vpOf ? Game.vpOf(vid) : null;
    if (vp && !vp.dead) return vid;
  }
  return null;
}

function livingVillagers(Game, n) {
  const out = [];
  const roster = ((Game.state.village || {}).roster || []);
  for (const vid of roster) {
    if (!vid || vid === Game.villagerId) continue;
    const vp = Game.vpOf ? Game.vpOf(vid) : null;
    if (vp && !vp.dead) { out.push(vid); if (out.length >= n) break; }
  }
  return out;
}

function rosterLen(Game) { return ((Game.state.village || {}).roster || []).length; }

function bundlePantry() { // 6 stacks x 300 kcal = 1800; no hunted meat among them
  return [
    { name: 'Blackberries', kcalEach: 100, units: 3, foodKind: 'plant', foodState: 'raw', plantId: 'blackberry' },
    { name: 'Garden muscadine', kcalEach: 100, units: 3, foodKind: 'plant', foodState: 'raw', plantId: 'muscadine', gardenShares: { ordinary: 1 } },
    { name: 'Brewed dandelion tea', kcalEach: 100, units: 3, foodKind: 'plant', foodState: 'cooked', plantId: 'dandelion' },
    { name: 'Ginseng root', kcalEach: 100, units: 3, foodKind: 'plant', foodState: 'raw', plantId: 'american_ginseng' },
    { name: 'Smoked fish', kcalEach: 100, units: 3, foodKind: 'meat', foodState: 'preserved', plantId: null },
    { name: 'Pemmican', kcalEach: 100, units: 3, itemId: 'pemmican', foodKind: 'meat', foodState: 'pemmican', plantId: null },
  ];
}

function eqArr(a, b) { return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((x, i) => x === b[i]); }

async function main() {
  const T = K.reporter('test-ladder-bundle-20261108');
  const Game = await K.load({ seed: 7 });
  K.newRun(Game);

  // --- the 12 contributions, each in isolation (feastBundleCheck unit matrix) ---
  resetLadderState(Game);
  Game.state.codex.recipes = {};
  const one = (item, ctx) => Game.feastBundleCheck([item], ctx || {});
  const cases = [
    ['hunted_meat', { foodKind: 'meat', foodState: 'carcass', plantId: 'meat_white_tailed_deer' }, {}],
    ['cooked_meat', { foodKind: 'meat', foodState: 'cooked', plantId: 'meat_white_tailed_deer' }, {}],
    ['foraged_feast', { foodKind: 'plant', foodState: 'raw', plantId: 'blackberry' }, {}],
    ['crafted_centrepiece', { itemId: 'pemmican', foodKind: 'meat', foodState: 'pemmican', plantId: null }, {}],
    ['monster_meat', { foodKind: 'meat', foodState: 'raw', plantId: 'meat_congregation' }, {}],
    ['explorers_rare', { foodKind: 'plant', foodState: 'raw', plantId: 'american_ginseng' }, {}],
    ['preserved_food', { foodKind: 'meat', foodState: 'preserved', plantId: null }, {}],
    ['medicine_brewed', { foodKind: 'plant', foodState: 'cooked', plantId: 'dandelion' }, {}],
    ['garden_harvest', { foodKind: 'plant', foodState: 'raw', plantId: 'muscadine', gardenShares: { ordinary: 1 } }, {}],
    ['guest_of_honor', null, { star: true }],
    ['kept_recipe', null, {}],
    ['keepsake_channel', null, { surge: true }],
  ];
  for (const [id, item, ctx] of cases) {
    if (id === 'kept_recipe') Game.state.codex.recipes = { snare: { level: 3 } };
    else Game.state.codex.recipes = {};
    const r = item ? one(item, ctx) : Game.feastBundleCheck([], ctx);
    T.ok('contribution resolves in isolation: ' + id, eqArr(r.contributions, [id]) && r.count === 1 && r.complete === false, JSON.stringify(r));
  }
  Game.state.codex.recipes = {};
  // Priority: specific-before-general — one item fills ONE slot only.
  let r = Game.feastBundleCheck([{ itemId: 'pemmican', foodKind: 'meat', foodState: 'pemmican', plantId: null }]);
  T.ok('pemmican fills ONLY the centrepiece slot', eqArr(r.contributions, ['crafted_centrepiece']), JSON.stringify(r));
  r = Game.feastBundleCheck([{ foodKind: 'meat', foodState: 'cooked', plantId: 'meat_congregation' }]);
  T.ok('cooked monster meat fills ONLY the monster-meat slot', eqArr(r.contributions, ['monster_meat']), JSON.stringify(r));
  r = Game.feastBundleCheck([{ foodKind: 'meat', foodState: 'raw', plantId: 'meat_congregation' }]);
  T.ok('raw monster meat fills ONLY the monster-meat slot', eqArr(r.contributions, ['monster_meat']), JSON.stringify(r));
  r = Game.feastBundleCheck([{ foodKind: 'meat', foodState: 'raw', plantId: 'meat_white_tailed_deer' }]);
  T.ok('raw animal meat fills ONLY the hunted-meat slot', eqArr(r.contributions, ['hunted_meat']), JSON.stringify(r));
  r = Game.feastBundleCheck([{ foodKind: 'plant', foodState: 'cooked', plantId: 'dandelion', gardenShares: { ordinary: 1 } }]);
  T.ok('garden medicinal cooked plant fills ONLY the garden slot', eqArr(r.contributions, ['garden_harvest']), JSON.stringify(r));
  // Duplicates and <6.
  r = Game.feastBundleCheck([
    { foodKind: 'meat', foodState: 'carcass', plantId: 'meat_white_tailed_deer' },
    { foodKind: 'meat', foodState: 'carcass', plantId: 'meat_white_tailed_deer' },
  ]);
  T.ok('two identical hunted-meat items fill ONE slot', eqArr(r.contributions, ['hunted_meat']) && r.count === 1 && r.complete === false, JSON.stringify(r));
  r = Game.feastBundleCheck([
    { foodKind: 'meat', foodState: 'carcass', plantId: 'meat_white_tailed_deer' },
    { foodKind: 'meat', foodState: 'cooked', plantId: 'meat_white_tailed_deer' },
    { foodKind: 'plant', foodState: 'raw', plantId: 'blackberry' },
    { itemId: 'pemmican', foodKind: 'meat', foodState: 'pemmican', plantId: null },
    { foodKind: 'plant', foodState: 'raw', plantId: 'american_ginseng' },
  ]);
  T.ok('5 distinct contributions do NOT complete the bundle', r.count === 5 && r.complete === false, JSON.stringify(r));
  r = Game.feastBundleCheck([
    { foodKind: 'meat', foodState: 'carcass', plantId: 'meat_white_tailed_deer' },
    { foodKind: 'meat', foodState: 'cooked', plantId: 'meat_white_tailed_deer' },
    { foodKind: 'plant', foodState: 'raw', plantId: 'blackberry' },
    { itemId: 'pemmican', foodKind: 'meat', foodState: 'pemmican', plantId: null },
    { foodKind: 'plant', foodState: 'raw', plantId: 'american_ginseng' },
    { foodKind: 'meat', foodState: 'preserved', plantId: null },
  ]);
  T.ok('6 distinct contributions complete the bundle', r.count === 6 && r.complete === true, JSON.stringify(r));

  // --- a real feast completes the bundle without a hunt (non-hunt mixture) ---
  K.newRun(Game);
  resetLadderState(Game);
  const v = Game.state.village;
  v.pantry = bundlePantry();
  Game.state.codex.recipes = { snare: { level: 3 } };
  const s = Game.state.scholar;
  s.prog = s.prog || {}; s.prog.feastSurge = 1.5; // keepsake channel armed
  const before = Game.villageLadder().counted;
  T.ok('ladder counted is 0 before the bundle feast', before === 0, 'counted ' + before);
  const plan = Game.feastPlan();
  T.ok('feast plan previews the bundle as complete', !!plan.bundle && plan.bundle.complete === true, JSON.stringify(plan.bundle));
  const here = (plan.guests || []).filter(g => g.status === 'here').slice(0, 3).map(g => g.vid);
  T.ok('3 guests here to invite', here.length === 3, 'here ' + here.length);
  const feast = Game.hostFeast({ guests: here });
  T.ok('the bundle feast was held', feast.ok === true, JSON.stringify(feast));
  T.ok('the bundle completed at the feast', !!feast.bundle && feast.bundle.complete === true, JSON.stringify(feast.bundle));
  T.ok('no hunted meat among the bundle slots', !!feast.bundle && !feast.bundle.contributions.includes('hunted_meat'), JSON.stringify(feast.bundle && feast.bundle.contributions));
  const sixFood = ['foraged_feast', 'garden_harvest', 'medicine_brewed', 'explorers_rare', 'preserved_food', 'crafted_centrepiece'];
  T.ok('all six food slots filled at the feast', !!feast.bundle && sixFood.every(id => feast.bundle.contributions.includes(id)), JSON.stringify(feast.bundle && feast.bundle.contributions));
  const log = Game.state.feastLog[Game.state.feastLog.length - 1];
  T.ok('feast log entry is a bundle entry', !!log && log.bundle === true, JSON.stringify(log));
  T.ok('feast log entry records the live bundle stage', !!log && typeof log.bundleStage === 'number', JSON.stringify(log));
  const after = Game.villageLadder();
  T.ok('the bundle grants +4 ladder points', after.counted === 4 && after.detail.bundleBonus === 4, 'counted ' + after.counted + ' bonus ' + (after.detail && after.detail.bundleBonus));
  T.ok('the ladder line names the bundle bonus', /bundle/.test(Game.ladderLine()), Game.ladderLine());
  // --- +4 once per stage only ---
  Game.state.scholar.day = (Game.state.scholar.day || 1) + 1;
  v.pantry = bundlePantry();
  const plan2 = Game.feastPlan();
  const here2 = (plan2.guests || []).filter(g => g.status === 'here').slice(0, 3).map(g => g.vid);
  const feast2 = Game.hostFeast({ guests: here2 });
  T.ok('a second bundle feast the next day is held', feast2.ok === true, JSON.stringify(feast2));
  T.ok('the second feast also completes the bundle', !!feast2.bundle && feast2.bundle.complete === true, JSON.stringify(feast2.bundle));
  const after2 = Game.villageLadder();
  T.ok('+4 is granted once per stage only (still 4, not 8)', after2.counted === 4 && after2.detail.bundleBonus === 4, 'counted ' + after2.counted);
  const bundles = Game.state.feastLog.filter(e => e.bundle);
  T.ok('both bundle feasts are logged at the same stage', bundles.length === 2 && bundles[0].bundleStage === bundles[1].bundleStage, JSON.stringify(bundles.map(b => b.bundleStage)));

  // --- buy-out: pay 8000 kcal, no feast, bundle counts as complete ---
  K.newRun(Game);
  resetLadderState(Game);
  const bv = Game.state.village;
  const bs = Game.state.scholar;
  // Refusals first, on fresh states.
  bv.pantry = [{ name: 'Stores', kcalEach: 100, units: 50, foodKind: 'plant', foodState: 'raw', plantId: 'blackberry' }]; // 5000 kcal
  let buy = Game.feastBundleBuyOut();
  T.ok('buy-out refuses when the pantry holds under 8000 kcal', buy.ok === false && /holds about/.test(buy.why || ''), JSON.stringify(buy));
  T.ok('refused buy-out leaves the pantry untouched', Game.pantryKcalLive(bv) === 5000, 'kcal ' + Game.pantryKcalLive(bv));
  bs.exiled = true;
  bv.pantry = [{ name: 'Stores', kcalEach: 100, units: 100, foodKind: 'plant', foodState: 'raw', plantId: 'blackberry' }];
  buy = Game.feastBundleBuyOut();
  T.ok('buy-out refuses in exile', buy.ok === false && /exile/.test(buy.why || ''), JSON.stringify(buy));
  bs.exiled = false;
  const feastsBefore = Game.villageStanding().feasts;
  T.ok('no Standing bread minted yet in this fresh village', feastsBefore === 0, 'feasts ' + feastsBefore);
  const haveBefore = Game.pantryKcalLive(bv);
  buy = Game.feastBundleBuyOut();
  T.ok('buy-out succeeds with 8000+ kcal in the pantry', buy.ok === true && buy.spent === 8000, JSON.stringify(buy));
  T.ok('buy-out spends exactly 8000 kcal', Game.pantryKcalLive(bv) === haveBefore - 8000, 'before ' + haveBefore + ' after ' + Game.pantryKcalLive(bv));
  const buyLog = Game.state.feastLog[Game.state.feastLog.length - 1];
  T.ok('buy-out writes a bundle feast-log entry', !!buyLog && buyLog.bundle === true && buyLog.buyout === true, JSON.stringify(buyLog));
  T.ok('buy-out grants the +4', Game.villageLadder().counted === 4, 'counted ' + Game.villageLadder().counted);
  T.ok('a buy-out mints NO Standing bread (quality 0 never counts)', Game.villageStanding().feasts === feastsBefore, 'feasts ' + Game.villageStanding().feasts);
  buy = Game.feastBundleBuyOut();
  T.ok('buy-out refuses once the stage already banked its bonus', buy.ok === false && /already banked/.test(buy.why || ''), JSON.stringify(buy));

  // --- capstone delivery: military tribute removes exactly 2 veterans ---
  K.newRun(Game);
  resetLadderState(Game);
  const [vA, vB] = livingVillagers(Game, 2);
  T.ok('two living villagers exist for the tribute', !!vA && !!vB);
  Game.state.waveKillLog = [{ by: vA, w: 4, day: 1 }, { by: vB, w: 4, day: 1 }];
  let ready = Game.ladderCapstoneReady('military_tribute');
  T.ok('tribute reads ready with 2 living wave-4 veterans', ready.ready === true, JSON.stringify(ready));
  const rosterBefore = rosterLen(Game);
  const scholarId = Game.villagerId;
  let dl = Game.ladderDeliverCapstone('military_tribute');
  T.ok('tribute delivery succeeds', dl.ok === true && dl.kind === 'military_tribute', JSON.stringify(dl));
  T.ok('tribute removes exactly 2 villagers', rosterLen(Game) === rosterBefore - 2, 'before ' + rosterBefore + ' after ' + rosterLen(Game));
  T.ok('both tributed villagers are off the roster', !((Game.state.village.roster || []).includes(vA)) && !((Game.state.village.roster || []).includes(vB)), 'vA ' + vA + ' vB ' + vB);
  T.ok('the scholar is still on the roster', (Game.state.village.roster || []).includes(scholarId), 'scholar ' + scholarId);
  T.ok('delivery is recorded on progState', Game.progState().ladderCapstone === 'military_tribute', 'capstone ' + Game.progState().ladderCapstone);
  T.ok('delivery switches the sanctity hook on', Game.tableActive() === true, 'tableActive ' + Game.tableActive());
  dl = Game.ladderDeliverCapstone('trade_charter');
  T.ok('a second delivery of any kind is refused (irreversible)', dl.ok === false && dl.reason === 'delivered', JSON.stringify(dl));
  T.ok('the recorded capstone is unchanged by the refused delivery', Game.progState().ladderCapstone === 'military_tribute', 'capstone ' + Game.progState().ladderCapstone);

  // --- scholar-veteran edge (KNOWN GAP, prereg): readiness counts the scholar, delivery refuses honestly ---
  K.newRun(Game);
  resetLadderState(Game);
  const vC = livingVillager(Game);
  T.ok('one living villager exists for the scholar edge', !!vC);
  Game.state.waveKillLog = [{ by: Game.villagerId, w: 4, day: 1 }, { by: vC, w: 4, day: 1 }];
  ready = Game.ladderCapstoneReady('military_tribute');
  T.ok('readiness counts the scholar as a payable veteran (leg-1 read)', ready.ready === true, JSON.stringify(ready));
  const rosterEdge = rosterLen(Game);
  dl = Game.ladderDeliverCapstone('military_tribute');
  T.ok('delivery refuses honestly: the scholar is not a payable veteran', dl.ok === false && dl.reason === 'veterans-short', JSON.stringify(dl));
  T.ok('nothing is recorded on the refused delivery', !Game.progState().ladderCapstone, 'capstone ' + Game.progState().ladderCapstone);
  T.ok('the roster is untouched by the refused delivery', rosterLen(Game) === rosterEdge, 'roster ' + rosterLen(Game));

  // --- capstone delivery: trade charter ---
  K.newRun(Game);
  resetLadderState(Game);
  dl = Game.ladderDeliverCapstone('trade_charter');
  T.ok('charter delivery refuses with no sealed link', dl.ok === false && dl.reason === 'no-sealed-charter', JSON.stringify(dl));
  T.ok('nothing is recorded on the refused charter', !Game.progState().ladderCapstone, 'capstone ' + Game.progState().ladderCapstone);
  try { Game.hierarchyState().push({ kind: 'trade', status: 'active', other: 'X', subordinate: 'X', chartered: true }); } catch (e) {}
  Game.state.nationalLive = true;
  ready = Game.ladderCapstoneReady('trade_charter');
  T.ok('charter reads ready with a sealed link at National scale', ready.ready === true, JSON.stringify(ready));
  dl = Game.ladderDeliverCapstone('trade_charter');
  T.ok('charter delivery succeeds', dl.ok === true && dl.kind === 'trade_charter', JSON.stringify(dl));
  T.ok('charter delivery records the capstone', Game.progState().ladderCapstone === 'trade_charter', 'capstone ' + Game.progState().ladderCapstone);
  T.ok('charter delivery records which link was sealed', !!(Game.progState().ladderCapstoneDetail && Game.progState().ladderCapstoneDetail.link), JSON.stringify(Game.progState().ladderCapstoneDetail));

  // --- capstone delivery: feast embassy ---
  K.newRun(Game);
  resetLadderState(Game);
  rigNational(Game);
  dl = Game.ladderDeliverCapstone('feast_embassy');
  T.ok('embassy delivery refuses with no bundle feast', dl.ok === false && dl.reason === 'no-bundle-feast', JSON.stringify(dl));
  T.ok('nothing is recorded on the refused embassy', !Game.progState().ladderCapstone, 'capstone ' + Game.progState().ladderCapstone);
  Game.state.feastLog = [{ day: 1, quality: 2, bundle: true, bundleStage: 3 }];
  ready = Game.ladderCapstoneReady('feast_embassy');
  T.ok('embassy reads ready with a bundle feast at National', ready.ready === true, JSON.stringify(ready));
  dl = Game.ladderDeliverCapstone('feast_embassy');
  T.ok('embassy delivery succeeds', dl.ok === true && dl.kind === 'feast_embassy', JSON.stringify(dl));
  T.ok('embassy delivery records the capstone', Game.progState().ladderCapstone === 'feast_embassy', 'capstone ' + Game.progState().ladderCapstone);

  // --- MERCY: a scripted post-capstone raid cannot kill villagers ---
  // Mirror of test-table-sanctity-gate-20261020.js, but the sanctity comes
  // from a delivered capstone (no sitting, tableDone false).
  async function freshMercy() {
    const { Game: G } = await loadGame({ seed: 64203, mode: 'posttable', fullTelemetry: false });
    await setupGame(G);
    const v = G.state.village || {};
    const hx = v.px ?? 4, hy = v.py ?? 4;
    G.map.px = hx; G.map.py = hy;
    const s = G.state.scholar; s.mx = 4; s.my = 4;
    const m = G.spawnWorldMonster({ id: 'suburb' }, hx, hy, { mx: 4, my: 6 });
    m.lingering = true;
    return { Game: G, m, hx, hy };
  }
  function countFires(G) {
    let fires = 0; const orig = G.startCombat;
    G.startCombat = (...a) => { fires++; return orig.apply(G, a); };
    return { get() { return fires; }, restore() { G.startCombat = orig; } };
  }
  // A. Delivery switches the hook on; 200 monster turns, no ambient raid.
  {
    const { Game: G } = await freshMercy();
    T.ok('mercy: tableActive is FALSE before delivery (not vacuous)', G.tableActive() === false, 'tableActive ' + G.tableActive());
    try { G.hierarchyState().push({ kind: 'trade', status: 'active', other: 'X', subordinate: 'X', chartered: true }); } catch (e) {}
    G.state.nationalLive = true;
    const dl2 = G.ladderDeliverCapstone('trade_charter');
    T.ok('mercy: charter delivery succeeds in the posttable game', dl2.ok === true, JSON.stringify(dl2));
    T.ok('mercy: tableActive is TRUE after delivery, before any sitting', G.tableActive() === true, 'tableActive ' + G.tableActive());
    const cnt = countFires(G);
    await quietLog(() => { for (let i = 0; i < 200; i++) G.monsterTurn(); });
    cnt.restore();
    T.ok('mercy: 200 monster turns after delivery fire NO ambient raid', cnt.get() === 0, 'fires ' + cnt.get());
  }
  // B. The overtime raid-scaler also refuses under the mercy.
  {
    const { Game: G } = await freshMercy();
    // Control first: no delivery, tier 2, a live fight — it scales.
    G.progState().overtime = 2;
    G.tbfight = { fighters: [{ kind: 'monster', hp: 100, maxHp: 100, name: 'Congregation' }] };
    const scaled = G.overtimeScaleFight('congregation');
    T.ok('control: overtimeScaleFight scales when nothing is delivered', scaled === true, 'scaled ' + scaled);
    // Now deliver, and the same rig refuses.
    try { G.hierarchyState().push({ kind: 'trade', status: 'active', other: 'X', subordinate: 'X', chartered: true }); } catch (e) {}
    G.state.nationalLive = true;
    const dl2 = G.ladderDeliverCapstone('trade_charter');
    T.ok('mercy: charter delivery succeeds for the scaler check', dl2.ok === true, JSON.stringify(dl2));
    G.tbfight = { fighters: [{ kind: 'monster', hp: 100, maxHp: 100, name: 'Congregation' }] };
    const refused = G.overtimeScaleFight('congregation');
    T.ok('mercy: overtimeScaleFight refuses under a delivered capstone', refused === false, 'scaled ' + refused);
  }
  // C. Control: without delivery, the same raid fires.
  {
    const { Game: G } = await freshMercy();
    const cnt = countFires(G);
    await quietLog(() => { for (let i = 0; i < 200; i++) G.monsterTurn(); });
    cnt.restore();
    T.ok('control: 200 monster turns WITHOUT delivery fire the ambient raid', cnt.get() > 0, 'fires ' + cnt.get());
  }

  T.done();
}

main().catch(e => { console.error(e); process.exitCode = 1; });
