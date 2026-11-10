// test-preserve-a.js — proof for the preservation first-numbers instrument
// (arm sim-preserve-a, run fleshout-20261110T2215Z).
// RED->GREEN where a behavior is asserted. Plain node, no jest.
// Usage: node scripts/test-preserve-a.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const PI = require(path.join(REPO, 'scripts', 'preserve-instrument-20261110'));
const AN = require(path.join(REPO, 'scripts', 'preserve-analyze-20261110'));
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));

let pass = 0, fail = 0;
const fails = [];
function ok(cond, name, extra) {
  if (cond) { pass++; console.log('ok   ' + name); }
  else { fail++; fails.push(name); console.log('FAIL ' + name + (extra != null ? ' :: ' + JSON.stringify(extra).slice(0, 300) : '')); }
}
function eq(a, b, name) { ok(a === b, name, { got: a, want: b }); }

// ---- A. Pure classifier fixtures (no game load) ----
(function () {
  eq(PI.classifyMethodPath('at foo (scripts/policies/competent.js:1:1)'), 'policy', 'A1 method policy origin');
  eq(PI.classifyMethodPath('at Game.preserveFood (src/js/food.js:1:1)'), 'internal', 'A2 method internal origin');
  eq(PI.classifyMethodPath('at askSpecialist (src/js/food.js:1:1)'), 'specialist', 'A3 method specialist origin');
  eq(PI.classifyMethodPath(''), 'unknown', 'A4 method empty stack unknown');
})();

// ---- B. Analyzer fixtures (no game load) ----
(function () {
  const seed = {
    seed: 180209, days: 100, gameDays: 100, endReason: 'survived', won: false,
    scaleRank: 'village', maxWave: 2, standing: 12, endPantryKcal: 5000, deaths: [],
    instrumentErrors: [], wrapLive: { preserveFood: true, resolveOneAssignment: true },
    methodCalls: [
      { method: 'preserveFood', path: 'scholar-fire', convertedN: 2, kcalIn: 1000, kcalOut: 950, shelfGained: 56, rescuedKcal: 1000, spoiledRefused: false, refusedN: 0, refusedKcal: 0 },
      { method: 'renderFat', path: 'scholar-fire', convertedN: 1, kcalIn: 500, kcalOut: 450, shelfGained: 87, rescuedKcal: 0, spoiledRefused: false, refusedN: 0, refusedKcal: 0 },
      { method: 'makePemmican', path: 'scholar-fire', bars: 3, barKcal: 1746, kcalIn: 1800, kcalOut: 1746, shelfGained: 90, sets: [{ bars: 3, inKcal: 1800 }] },
      { method: 'askSpecialist', path: 'specialist', task: 'preserver', specialistOcc: 'fisherman', specialistSkill: 3, kcalIn: 500, kcalOut: 500, shelfGained: 43, rescuedKcal: 0 },
    ],
    dutyResolutions: [
      { day: 5, vid: 'v1', occ: 'fisherman', skill: 3, batches: 2, kcalIn: 1000, kcalOut: 990, shelfGained: 56, rescuedKcal: 1000, aboutToRotBefore: 1200, aboutToRotAfter: 200, leftToRot: 200, racksFull: false, tapBatches: 2, tapKcal: 990, tapAgrees: true,
        converted: [{ name: 'Fish (smoked)', foodKind: 'meat', split: false, kcalIn: 500, kcalOut: 495, shelfGained: 28 }, { name: 'Venison (dried)', foodKind: 'meat', split: true, kcalIn: 500, kcalOut: 495, shelfGained: 28 }] },
      { day: 6, vid: 'v1', occ: 'fisherman', skill: 3, batches: 1, kcalIn: 500, kcalOut: 400, shelfGained: 13, rescuedKcal: 500, aboutToRotBefore: 500, aboutToRotAfter: 500, leftToRot: 500, racksFull: true, tapBatches: 2, tapKcal: 999, tapAgrees: false,
        converted: [{ name: 'Fish (smoked)', foodKind: 'meat', split: false, kcalIn: 500, kcalOut: 400, shelfGained: 13 }] },
    ],
    learns: [{ day: 3, tech: 'preserve', source: 'trial', learned: true }, { day: 9, tech: 'render', source: 'watched', learned: true }],
    eats: [
      { via: 'eatOne', foodState: 'preserved', ateKcal: 400 },
      { via: 'eatOne', foodState: 'pemmican', ateKcal: 600 },
      { via: 'eat', foodState: 'rendered', ateKcal: 200 },
      { via: 'tele-eat', foodState: null, ateKcal: 1200 },
    ],
    draws: [{ cook: false, taken: 1000, byState: { preserved: 600, none: 400 }, cookedKcal: 0 }],
    deeds: [{ deed: 'preserving', who: 'player' }, { deed: 'preserving', who: 'v1' }],
    daily: [
      { day: 1, pantry: { preserved: { count: 1, units: 2, kcal: 900, minSpoilDay: 31 }, none: { count: 3, units: 9, kcal: 2000, minSpoilDay: null } }, pack: { preserved: { count: 0, units: 0, kcal: 0, minSpoilDay: null } }, dutyBatches: 1, dutyKcal: 900, cookDuty: [{ vid: 'v1', occ: 'fisherman', preserver: 3 }], foodXp: { v1: { preserver: 1 } }, spoiledPresentKcal: 0, vanishPresLostKcal: 0, vanishPresDrawnKcal: 0, vanishPresRawKcal: 0 },
      { day: 2, pantry: { preserved: { count: 1, units: 2, kcal: 800, minSpoilDay: 31 }, rendered: { count: 1, units: 1, kcal: 450, minSpoilDay: 91 } }, pack: {}, dutyBatches: 0, dutyKcal: 0, cookDuty: [{ vid: 'v1', occ: 'fisherman', preserver: 3 }], foodXp: { v1: { preserver: 4 } }, spoiledPresentKcal: 0, vanishPresLostKcal: 100, vanishPresDrawnKcal: 0, vanishPresRawKcal: 100 },
    ],
    vanishes: [
      { day: 2, state: 'preserved', kcal: 100, spoilDay: 1, drawn: false, spoiledLost: true },
      { day: 2, state: 'preserved', kcal: 50, spoilDay: 90, drawn: false, spoiledLost: false },
    ],
    preserveSays: [{ day: 1, line: 'The racks are already full (20,000 kcal kept — more than the haven can eat before it turns), so X left the fresh pile.' }],
  };
  const s = AN.perSeed(seed);
  eq(s.methodCallsByMethod.preserveFood, 1, 'B1 method counts preserveFood');
  eq(s.methodCallsByMethod.renderFat, 1, 'B2 method counts renderFat');
  eq(s.methodCallsByMethod.makePemmican, 1, 'B3 method counts makePemmican');
  eq(s.kcalOutByMethod.preserveFood, 950, 'B4 kcal out smoke');
  eq(s.shelfGainedByMethod.renderFat, 87, 'B5 shelf gained render');
  eq(s.rescuedKcal, 1000, 'B6 rescued kcal (scholar only)');
  eq(s.pemmicanBars, 3, 'B7 pemmican bars');
  eq(s.pemmicanBarKcal, 1746, 'B8 pemmican bar kcal');
  eq(s.specialistPreserverCalls, 1, 'B9 specialist preserver jobs');
  eq(s.dutyBatchesDiff, 3, 'B10 duty batches (diff)');
  eq(s.dutyTapBatches, 4, 'B11 duty tap batches');
  eq(s.dutyTapMismatches, 1, 'B12 duty tap mismatch flagged');
  eq(s.dutyRacksFullResolutions, 1, 'B13 racks-full resolutions');
  eq(s.dutyRacksFullBlockedKcal, 500, 'B14 racks-full blocked kcal');
  eq(s.dutyLeftToRotKcal, 700, 'B15 left-to-rot kcal');
  eq(s.dutySmokedNames.smoked, 2, 'B16 duty smoked-name count');
  eq(s.dutySmokedNames.dried, 1, 'B17 duty dried-name count');
  eq(s.dutySplitConversions, 1, 'B18 duty split conversions');
  eq(s.eatenPreservedKcal, 400, 'B19 eaten preserved');
  eq(s.eatenPemmicanKcal, 600, 'B20 eaten pemmican');
  eq(s.eatenRenderedKcal, 200, 'B21 eaten rendered');
  eq(s.teleEatTotal, 1200, 'B22 tele eat total');
  eq(s.drawPreservedKcal, 600, 'B23 drawn preserved');
  eq(s.preservingDeeds, 2, 'B24 preserving deeds');
  eq(s.peakPreservedPantryKcal, 900, 'B25 peak preserved pantry');
  eq(s.endPreservedPantryKcal, 800, 'B26 end preserved pantry');
  eq(s.endRenderedPantryKcal, 450, 'B27 end rendered pantry');
  eq(s.vanishSpoiledLostKcal, 100, 'B28 vanish spoiled-lost kcal');
  eq(s.vanishUnexplainedKcal, 50, 'B29 vanish unexplained kcal');
  eq(s.racksFullSayLines, 1, 'B30 racks-full say lines');
  eq(s.foodXpDelta['v1:preserver'], 3, 'B31 foodXp delta');
  eq(s.foodXpMax['v1:preserver'], 4, 'B32 foodXp max');
  const p = AN.pool([s, s]);
  eq(p.dutyRecon.diffBatches, 6, 'B33 pool duty diff batches');
  eq(p.dutyRecon.tapBatches, 8, 'B34 pool duty tap batches');
  eq(p.dutyRecon.mismatches, 2, 'B35 pool duty mismatches');
  eq(p.eatRecon.teleTotal, 2400, 'B36 pool eat recon tele');
  eq(p.eatRecon.wrapTotal, 2400, 'B37 pool eat recon wrap');
  eq(p.vanishSpoiledLostKcalTotal, 200, 'B38 pool vanish lost');
})();

// ---- C. Live instrument fixtures (one loaded game) ----
async function liveFixtures() {
  const { Game } = await loadGame({ seed: 180209, mode: 'preserve-test', fullTelemetry: false });
  await setupGame(Game);
  const pi = PI.install(Game);
  const t = pi.t;
  try {
    const sch = Game.state.scholar;
    const day = sch.day;
    // Fire: step outside onto the Haven grounds, where the map fire pit
    // (cells[4][2]) makes nearFire() true and consumeCookFire free.
    try { sch.insideHaven = false; } catch (e) {}
    ok(Game.nearFire() === true, 'C0 fire available on the Haven grounds', { nearFire: typeof Game.nearFire === 'function' ? Game.nearFire() : null });
    // Start untaught on both rungs (the fixture scholar's occupation may
    // grant 'preserve' — force the blind start so the trial is proven).
    try {
      Game.state.codex.techniques = Game.state.codex.techniques || {};
      Game.state.codex.techniques.preserve = false;
      Game.state.codex.techniques.render = false;
    } catch (e) {}
    // C1: blind smoke — 0.80x / 15d — and the attempt teaches 'preserve'.
    const meat1 = { foodKind: 'meat', foodState: 'cleaned', kcalEach: 400, units: 2, name: 'Venison (cleaned)', spoilDay: day + 2, safe: false, edible: true };
    sch.inventory.push(meat1);
    const i1 = sch.inventory.length - 1;
    Game.preserveFood(i1);
    const m1 = t.methodCalls.filter(function (r) { return r.method === 'preserveFood'; }).pop();
    ok(m1 && m1.convertedN === 1, 'C1 blind smoke converts', m1);
    ok(m1 && m1.kcalIn === 800 && m1.kcalOut === 640, 'C1a blind smoke 0.80x (800 -> 640)', m1);
    ok(m1 && m1.converted[0] && m1.converted[0].spoilDayAfter === day + 15, 'C1b blind smoke 15d shelf', m1 && m1.converted[0]);
    ok(m1 && m1.converted[0] && m1.converted[0].shelfGained === 13, 'C1c blind smoke net shelf gained 13 (15-2)', m1 && m1.converted[0]);
    const l1 = t.learns.filter(function (r) { return r.tech === 'preserve'; }).pop();
    ok(l1 && l1.source === 'trial' && l1.learned === true, 'C1d blind smoke teaches preserve by trial', l1);
    // C2: solid smoke — 0.95x / 30d — now that the technique is known.
    const meat2 = { foodKind: 'meat', foodState: 'cleaned', kcalEach: 400, units: 2, name: 'Venison (cleaned)', spoilDay: day + 2, safe: false, edible: true };
    sch.inventory.push(meat2);
    Game.preserveFood(sch.inventory.length - 1);
    const m2 = t.methodCalls.filter(function (r) { return r.method === 'preserveFood'; }).pop();
    ok(m2 && m2.kcalIn === 800 && m2.kcalOut === 760, 'C2 solid smoke 0.95x (800 -> 760)', m2);
    ok(m2 && m2.converted[0] && m2.converted[0].spoilDayAfter === day + 30, 'C2a solid smoke 30d shelf', m2 && m2.converted[0]);
    ok(m2 && m2.converted[0] && m2.converted[0].shelfGained === 28, 'C2b solid smoke net shelf gained 28 (30-2)', m2 && m2.converted[0]);
    // C3: spoiled meat at the fire is refused honestly (spliced, not smoked).
    const meat3 = { foodKind: 'meat', foodState: 'cleaned', kcalEach: 400, units: 1, name: 'Venison (cleaned)', spoilDay: day - 1, safe: false, edible: true };
    sch.inventory.push(meat3);
    const beforeN = sch.inventory.length;
    Game.preserveFood(sch.inventory.length - 1);
    const m3 = t.methodCalls.filter(function (r) { return r.method === 'preserveFood'; }).pop();
    ok(sch.inventory.length === beforeN - 1, 'C3 spoiled meat spliced at the fire', { before: beforeN, after: sch.inventory.length });
    ok(m3 && m3.spoiledRefused === true && m3.refusedKcal === 400, 'C3a spoiled refusal recorded (400 kcal)', m3);
    // C4: blind render — 0.65x / 90d — teaches 'render'; then solid 0.90x.
    const fat1 = { foodKind: 'fat', foodState: 'raw', kcalEach: 0, hiddenKcal: 500, units: 1, name: 'Deer fat (raw)', spoilDay: day + 3, edible: false };
    sch.inventory.push(fat1);
    Game.renderFat(sch.inventory.length - 1);
    const r1 = t.methodCalls.filter(function (r) { return r.method === 'renderFat'; }).pop();
    ok(r1 && r1.convertedN === 1, 'C4 blind render converts', r1);
    ok(r1 && r1.kcalIn === 500 && r1.kcalOut === 325, 'C4a blind render 0.65x (500 -> 325)', r1);
    ok(r1 && r1.converted[0] && r1.converted[0].spoilDayAfter === day + 90, 'C4b render 90d shelf', r1 && r1.converted[0]);
    const l2 = t.learns.filter(function (r) { return r.tech === 'render'; }).pop();
    ok(l2 && l2.source === 'trial' && l2.learned === true, 'C4c blind render teaches render by trial', l2);
    const fat2 = { foodKind: 'fat', foodState: 'raw', kcalEach: 0, hiddenKcal: 500, units: 1, name: 'Deer fat (raw)', spoilDay: day + 3, edible: false };
    sch.inventory.push(fat2);
    Game.renderFat(sch.inventory.length - 1);
    const r2 = t.methodCalls.filter(function (r) { return r.method === 'renderFat'; }).pop();
    ok(r2 && r2.kcalOut === 450, 'C4d solid render 0.90x (500 -> 450)', r2);
    // C5: pemmican — 2 preserved + 1 rendered + 2 berries, ~97% retention.
    // (render is known now, from C4.) Build the set from the fixtures above.
    const pres = sch.inventory.find(function (it) { return it && it.foodState === 'preserved' && (it.units || 0) >= 2; });
    const rend = sch.inventory.find(function (it) { return it && it.foodState === 'rendered'; });
    if (pres && rend) {
      pres.units = 2; // exactly one set's meat
      rend.units = 1; // exactly one set's fat
      sch.inventory.push({ foodKind: 'plant', plantId: 'blueberry', kcalEach: 50, units: 2, name: 'Blueberries', spoilDay: day + 5, edible: true });
      const plan = (typeof Game.pemmicanPlan === 'function') ? Game.pemmicanPlan(sch.inventory) : null;
      ok(plan && plan.length >= 1, 'C5 pemmican plan finds a set', plan && plan.length);
      Game.makePemmican();
      const pm = t.methodCalls.filter(function (r) { return r.method === 'makePemmican'; }).pop();
      ok(pm && pm.bars >= 1, 'C5a pemmican makes bars', pm);
      ok(pm && pm.barKcal > 0 && pm.barKcal <= pm.kcalIn, 'C5b pemmican never prints kcal', pm);
      ok(pm && pm.shelfGained > 0, 'C5c pemmican shelf gained recorded', pm);
      const bar = sch.inventory.find(function (it) { return it && it.foodState === 'pemmican'; });
      ok(bar && bar.spoilDay === day + 120, 'C5d pemmican bars carry 120d shelf', bar);
    } else {
      ok(false, 'C5 pemmican set-up (no preserved/rendered fixture items)', { pres: !!pres, rend: !!rend });
    }
    // C6: pemmican untaught — render unknown, the engine refuses honestly.
    try { Game.state.codex.techniques.render = false; } catch (e) {}
    const barsBefore = t.methodCalls.filter(function (r) { return r.method === 'makePemmican'; }).length;
    Game.makePemmican();
    const pm2 = t.methodCalls.filter(function (r) { return r.method === 'makePemmican'; }).pop();
    ok(t.methodCalls.filter(function (r) { return r.method === 'makePemmican'; }).length === barsBefore + 1, 'C6 pemmican refusal still recorded as a call', pm2);
    ok(pm2 && pm2.bars === 0, 'C6a untaught pemmican makes 0 bars', pm2);
    try { Game.state.codex.techniques.render = true; } catch (e) {}
    // C7: askSpecialist preserver job + 'watched' learn after two watches.
    // Give a villager a preserver occupation so a specialist is present.
    const ppl = (typeof Game.villagePeople === 'function') ? Game.villagePeople() : [];
    let specVid = null;
    try {
      for (const p of ppl) {
        if (!p || !p.id) continue;
        if (typeof Game.specialistSkill === 'function' && Game.specialistSkill(p, 'preserver') > 0) { specVid = p.id; break; }
      }
      if (!specVid && ppl[0] && ppl[0].id) {
        const p0 = ppl[0];
        specVid = p0.id;
        try { p0.formerOccupation = 'fisherman'; } catch (e) {}
        try { if (p0._src) p0._src.formerOccupation = 'fisherman'; } catch (e) {}
      }
    } catch (e) {}
    try { Game.state.codex.techniques.preserve = false; } catch (e) {}
    if (specVid) {
      for (let w = 0; w < 2; w++) {
        sch.inventory.push({ foodKind: 'meat', foodState: 'cleaned', kcalEach: 300, units: 1, name: 'Meat (cleaned)', spoilDay: day + 2, safe: false, edible: true });
        Game.askSpecialist(specVid, sch.inventory.length - 1, sch.inventory);
      }
      const arecs = t.methodCalls.filter(function (r) { return r.method === 'askSpecialist'; });
      const aLast = arecs[arecs.length - 1];
      ok(aLast && aLast.task === 'preserver', 'C7 askSpecialist preserver task', aLast);
      ok(aLast && aLast.post && aLast.post.foodState === 'preserved', 'C7a specialist smoke converts to preserved', aLast && aLast.post);
      ok(aLast && typeof aLast.specialistSkill === 'number' && aLast.specialistSkill > 0, 'C7b specialist skill recorded', aLast);
      const lw = t.learns.filter(function (r) { return r.tech === 'preserve' && r.source === 'watched'; }).pop();
      ok(lw && lw.learned === true, 'C7c two watches teach preserve', lw);
    } else {
      ok(false, 'C7 askSpecialist (no villagers at the node to specialize)');
    }
    // C8: eat wraps attribute preserved / rendered / pemmican kcal.
    sch.kcal = 0;
    const pres2 = { foodKind: 'meat', foodState: 'preserved', kcalEach: 380, units: 1, edible: true, safe: true, name: 'Venison (smoked)' };
    sch.inventory.push(pres2);
    Game.eatOne(sch.inventory.length - 1);
    const e1 = t.eats.filter(function (r) { return r.via === 'eatOne'; }).pop();
    ok(e1 && e1.foodState === 'preserved' && e1.ateKcal > 0, 'C8 eatOne attributes preserved kcal', e1);
    const pem = sch.inventory.find(function (it) { return it && it.foodState === 'pemmican'; });
    if (pem) {
      Game.eatOne(sch.inventory.indexOf(pem));
      const e2 = t.eats.filter(function (r) { return r.via === 'eatOne'; }).pop();
      ok(e2 && e2.foodState === 'pemmican' && e2.ateKcal > 0, 'C8a eatOne attributes pemmican kcal', e2);
    } else {
      ok(false, 'C8a eatOne pemmican (no pemmican bar in pack)');
    }
    // C9: pantryDraw wrap records drawn kcal by state + remembers objects.
    const v = Game.state.village;
    v.pantry = [
      { foodKind: 'meat', foodState: 'preserved', kcalEach: 300, units: 2, name: 'Meat (smoked)', spoilDay: day + 30 },
      { foodKind: 'plant', foodState: 'none', kcalEach: 100, units: 5, name: 'Grain', spoilDay: 9999 },
    ];
    const dr = Game.pantryDraw(v, 400, { cook: false });
    const drec = t.draws[t.draws.length - 1];
    ok(drec && drec.cook === false && drec.taken === (dr && dr.taken), 'C9 pantryDraw wrap', drec);
    ok(drec && (drec.byState.preserved || 0) + (drec.byState.none || 0) > 0, 'C9a pantryDraw byState recorded', drec && drec.byState);
    // C10: duty racks — direct cook resolution converts about-to-rot
    // surplus; the diff agrees with the _haulcount tap.
    const roster = (v.roster || []);
    const cookVid = roster[0];
    if (cookVid) {
      v.pantry = [
        { foodKind: 'meat', foodState: 'cleaned', kcalEach: 500, units: 20, name: 'Venison (cleaned)', spoilDay: day + 1, safe: false, edible: true },
        { foodKind: 'plant', foodState: 'none', kcalEach: 100, units: 10, name: 'Grain', spoilDay: 9999 },
      ];
      const resBefore = t.dutyResolutions.length;
      Game.resolveOneAssignment(cookVid, { task: 'cook' });
      const dres = t.dutyResolutions[t.dutyResolutions.length - 1];
      ok(t.dutyResolutions.length === resBefore + 1, 'C10 duty resolution recorded', { before: resBefore, after: t.dutyResolutions.length });
      ok(dres && dres.batches >= 1, 'C10a duty converts at least one batch', dres);
      ok(dres && dres.kcalOut > 0 && dres.kcalOut <= dres.kcalIn, 'C10b duty never prints kcal', dres);
      ok(dres && dres.tapAgrees === true, 'C10c duty diff agrees with _haulcount tap', dres);
      ok(dres && dres.shelfGained > 0, 'C10d duty shelf gained recorded', dres);
      ok(dres && dres.aboutToRotBefore > dres.aboutToRotAfter, 'C10e duty reduces about-to-rot kcal', dres);
      // C11: racks-full — preserved stock above rackCap blocks all smoking.
      const skill = (typeof Game.specialistSkill === 'function') ? Game.specialistSkill(Game.getPerson(cookVid) || {}, 'preserver') : 0;
      const ownShelf = (skill > 0) ? (30 + 5 * skill) : 15;
      const rackCap = 125 * (roster.length || 10) * Math.max(1, ownShelf - 2);
      v.pantry = [
        { foodKind: 'meat', foodState: 'preserved', kcalEach: 500, units: 100, name: 'Venison (smoked)', spoilDay: day + 30 },
        { foodKind: 'meat', foodState: 'cleaned', kcalEach: 500, units: 20, name: 'Venison (cleaned)', spoilDay: day + 1, safe: false, edible: true },
      ];
      const presKcal = 500 * 100;
      ok(presKcal >= rackCap, 'C11 racks-full fixture stock above cap', { presKcal: presKcal, rackCap: rackCap });
      Game.resolveOneAssignment(cookVid, { task: 'cook' });
      const dres2 = t.dutyResolutions[t.dutyResolutions.length - 1];
      ok(dres2 && dres2.racksFull === true, 'C11a racks-full signal recorded', dres2);
      ok(dres2 && dres2.batches === 0, 'C11b racks-full converts nothing', dres2);
      ok(dres2 && dres2.aboutToRotBefore > 0, 'C11c racks-full leaves about-to-rot in place', dres2);
    } else {
      ok(false, 'C10 duty resolution (empty roster)');
    }
    // C12: object-tracking vanish — two deterministic sub-cases.
    // (a) An undrawn preserved item whose spoilDay passes and vanishes is
    //     spoiled-lost. (b) A drawn preserved item that vanishes is counted
    //     as drawn, never as lost.
    const lostBefore = t.vanishes.filter(function (r) { return r.spoiledLost; }).length;
    v.pantry = [
      { foodKind: 'meat', foodState: 'preserved', kcalEach: 300, units: 1, name: 'Meat (smoked)', spoilDay: day + 1 },
    ];
    pi.snapshot();
    try { sch.day = day + 2; } catch (e) {}
    v.pantry = [];
    const snap2 = pi.snapshot();
    const lostA = t.vanishes.filter(function (r) { return r.spoiledLost; });
    ok(snap2 && snap2.vanishPresLostKcal === 300, 'C12 undrawn rotted item is spoiled-lost (300 kcal)', snap2 && snap2.vanishPresLostKcal);
    ok(lostA.length === lostBefore + 1 && lostA[lostA.length - 1].kcal === 300, 'C12a lost record carries the rotted kcal', lostA);
    // (b) is drawn at the CURRENT day (day+2 after sub-case (a)) — its
    // spoilDay must be ahead of the current day or the draw refuses it
    // as already spoiled.
    v.pantry = [
      { foodKind: 'meat', foodState: 'preserved', kcalEach: 300, units: 1, name: 'Fish (smoked)', spoilDay: day + 3 },
    ];
    pi.snapshot();
    Game.pantryDraw(v, 300, { cook: false });
    const drawnLeft = v.pantry.filter(function (it) { return it && it.foodState === 'preserved'; }).length;
    ok(drawnLeft === 0, 'C12b draw took the preserved item', { drawnLeft: drawnLeft });
    try { sch.day = day + 4; } catch (e) {}
    const snap3 = pi.snapshot();
    const lostB = t.vanishes.filter(function (r) { return r.spoiledLost; });
    ok(snap3 && snap3.vanishPresDrawnKcal === 300, 'C12c drawn item counted as drawn, not lost', snap3 && snap3.vanishPresDrawnKcal);
    ok(lostB.length === lostA.length, 'C12d no new lost record for the drawn item', { lostB: lostB.length, lostA: lostA.length });
    // C13: snapshot shape + zero instrument errors + wraps live.
    const snap = pi.snapshot();
    ok(snap && snap.pantry && typeof snap.pantryKcal === 'number' && Array.isArray(snap.cookDuty), 'C13 daily snapshot shape', Object.keys(snap || {}));
    ok(t.instrumentErrors.length === 0, 'C14 zero instrument errors in fixtures', t.instrumentErrors);
    ok(t.wrapLive.preserveFood && t.wrapLive.renderFat && t.wrapLive.makePemmican && t.wrapLive.askSpecialist && t.wrapLive.resolveOneAssignment && t.wrapLive.eatOne && t.wrapLive.pantryDraw && t.wrapLive.learnTechnique, 'C15 wraps live', t.wrapLive);
  } finally {
    pi.uninstall();
  }
  return true;
}

// ---- D. Determinism miniature: same seed twice, byte-identical preservation counters ----
async function determinismMini() {
  async function mini(seed) {
    const { Game } = await loadGame({ seed: seed, mode: 'preserve-mini', fullTelemetry: false });
    await setupGame(Game);
    const pi = PI.install(Game);
    const wrapped = Object.assign({}, competent, {
      daily: function (Gm, ctx) {
        try { return competent.daily(Gm, ctx); } finally { try { pi.snapshot(); } catch (e) {} }
      },
    });
    let result = null;
    await quietLog(async function () { result = await runDays(Game, wrapped, { days: 60, manifest: undefined, sampleEvery: 30 }); });
    const out = {
      days: result.days,
      methods: pi.t.methodCalls.map(function (r) { return [r.day, r.method, r.path, r.kcalIn, r.kcalOut, r.shelfGained]; }),
      duty: pi.t.dutyResolutions.map(function (r) { return [r.day, r.vid, r.batches, r.kcalIn, r.kcalOut, r.shelfGained, r.tapAgrees]; }),
      eats: pi.t.eats.map(function (r) { return [r.day, r.via, r.foodState, r.ateKcal]; }),
      stock: pi.t.daily.map(function (r) { return [r.day, (r.pantry.preserved || {}).kcal || 0, (r.pantry.rendered || {}).kcal || 0, (r.pantry.pemmican || {}).kcal || 0]; }),
    };
    pi.uninstall();
    return out;
  }
  const a = await mini(180209);
  const b = await mini(180209);
  ok(JSON.stringify(a) === JSON.stringify(b), 'D1 determinism miniature byte-identical', { aDays: a.days, bDays: b.days, aM: a.methods.length, bM: b.methods.length, aD: a.duty.length, bD: b.duty.length });
  ok(a.duty.length > 0, 'D2 miniature observed live duty resolutions', { duty: a.duty.length, methods: a.methods.length });
  return a;
}

// ---- E. Neutrality miniature: ON vs OFF, short horizon ----
async function neutralityMini() {
  async function mini(seed, instOn) {
    const { Game } = await loadGame({ seed: seed, mode: 'preserve-mini', fullTelemetry: false });
    await setupGame(Game);
    let pi = null;
    if (instOn) pi = PI.install(Game);
    const wrapped = Object.assign({}, competent, {
      daily: function (Gm, ctx) {
        try { return competent.daily(Gm, ctx); } finally { try { if (pi) pi.snapshot(); } catch (e) {} }
      },
    });
    let result = null;
    await quietLog(async function () { result = await runDays(Game, wrapped, { days: 20, manifest: undefined, sampleEvery: 30 }); });
    let pantryKcal = 0;
    try { pantryKcal = ((Game.state.village || {}).pantry || []).reduce(function (x, i) { return x + (i.kcalEach || 0) * (i.units || 1); }, 0); } catch (e) {}
    const deaths = (result.samples.deaths || []).length;
    if (pi) pi.uninstall();
    return { days: result.days, pantryKcal: pantryKcal, deaths: deaths };
  }
  const on = await mini(180209, true);
  const off = await mini(180209, false);
  ok(on.days === off.days && on.pantryKcal === off.pantryKcal && on.deaths === off.deaths, 'E1 neutrality miniature identical', { on: on, off: off });
}

(async function () {
  try {
    await liveFixtures();
    await determinismMini();
    await neutralityMini();
  } catch (e) {
    fail++;
    fails.push('harness-threw: ' + (e && e.stack ? e.stack.split('\n').slice(0, 5).join(' | ') : String(e)));
    console.log('FAIL harness-threw :: ' + String(e && e.stack || e).slice(0, 500));
  }
  console.log('\npreserve proof: ' + pass + ' passed, ' + fail + ' failed' + (fails.length ? ' :: ' + fails.join(' ; ') : ''));
  process.exit(fail ? 1 : 0);
})();
