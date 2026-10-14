#!/usr/bin/env node
// test-gorgcall-20261014.js — proof for the gorgcall layer
// (scripts/policies/gorgcall.js): wave-4/5 lingering treeline monsters get
// the scholar CALLING FOR HELP via the honest comms.js tiers instead of a
// solo fight the engine can't win (0/17 measured, sim-predation-b.md).
//
// PART 0 — gate + exports.
// PART 1 — RED (gate off): wave-4/5 lingerer + gorge night -> NO callForHelp
//   invoked, no crisis raised by the policy, the gorge beat fires pristine.
// PART 2 — NON-AGGRESSION: gate-off wrapped policy byte-identical to raw
//   leadfeast over 20d (day hashes) — default OFF is production-safe.
// PART 3 — GREEN (gate on): wave-5 lingerer at the treeline ->
//   raiseAidCrisis + callForHelp with an honest tier (signal/system), the
//   cost named aloud, exactly one call per monster per day, wave-2
//   lingerer untouched, wave-1/3 answering never engaged.
// PART 4 — ARRIVAL (gate on, engine path): over the following days the aid
//   chain must answer honestly — help arrives (aidHelpArrived, named party)
//   or every ask refuses aloud. Either is honest; silence is not.
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const gc = require('./policies/gorgcall');

let pass = 0, fail = 0;
function ok(cond, name, extra) {
  if (cond) { pass++; console.log('  ok: ' + name); }
  else { fail++; console.log('  FAIL: ' + name + (extra ? ' — ' + extra : '')); }
}
async function withEnv(k, v, fn) {
  const old = process.env[k];
  if (v === undefined) delete process.env[k]; else process.env[k] = v;
  try { return await fn(); } finally { if (old === undefined) delete process.env[k]; else process.env[k] = old; }
}
function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }
function havenTile(Game) {
  const v = (Game.state || {}).village || {};
  return { x: (v.px !== undefined && v.px !== null) ? v.px : 4, y: (v.py !== undefined && v.py !== null) ? v.py : 4 };
}
// injectLingering: a live lingering entity at the haven tile (predation
// fixture pattern). wave resolved from the def by the policy.
function injectLingering(Game, id, hp) {
  const { x, y } = havenTile(Game);
  const m = { id, key: 'gorgcall-test-' + id + '-' + Math.floor(Math.random() * 1e9),
              lingering: true, hp: hp || 1200, tx: x, ty: y, mx: x, my: y };
  Game.worldMonsters().push(m);
  return m;
}
function dayHash(Game) {
  try {
    const s = (Game.state || {}).scholar || {}, v = (Game.state || {}).village || {};
    return [s.day, Math.round(s.health || 0), Math.round(s.kcal || 0), (v.roster || []).length].join('|');
  } catch (e) { return 'ERR'; }
}
async function runHashed(policy, seed, days) {
  const { Game } = await loadGame({ seed, mode: 'gorge-test', fullTelemetry: false });
  await setupGame(Game);
  const hashes = [];
  const p = Object.assign({}, policy, { id: policy.id + '-hash' });
  const od = p.daily;
  p.daily = (G, ctx) => { hashes.push(dayHash(G)); return od ? od(G, ctx) : undefined; };
  await quietLog(() => runDays(Game, p, { days }));
  return hashes;
}
// formHighTrustLink: the engine's own link birth (_formLink) with a real
// other village, trust raised to 65 — above the ask floor (35) and into the
// acceptance band. Honest fixture, no fabricated state.
function formHighTrustLink(Game) {
  const ovs = ((Game.state || {}).otherVillages || []).filter(o => o && o.id && o.id !== 'haven');
  if (!ovs.length) return null;
  const target = ovs[0].id;
  let link = null;
  try { link = Game._formLink(target, { asSubordinate: false, tributeKcalPerWeek: 4000 }, null); } catch (e) {}
  if (!link) return null;
  link.trust = 65;
  return link;
}

(async () => {
  console.log('PART 0 — gate + exports');
  ok(typeof gc.gorgeCall === 'function', 'gorgeCall exported');
  ok(typeof gc.policyForRun === 'function', 'policyForRun exported');
  ok(typeof gc.apexLingerers === 'function', 'apexLingerers exported');
  await withEnv('GORGCALL', undefined, async () => { ok(!gc.layerOn(), 'gate OFF when GORGCALL unset'); });
  await withEnv('GORGCALL', '1', async () => { ok(gc.layerOn(), 'gate ON when GORGCALL=1'); });

  console.log('PART 1 — RED (gate off): no call, pristine gorge');
  await withEnv('GORGCALL', undefined, async () => {
    const { Game } = await loadGame({ seed: 11, mode: 'gorge-test', fullTelemetry: false });
    await setupGame(Game);
    await quietLog(() => runDays(Game, gc.leadfeast, { days: 25 }));
    const ent = injectLingering(Game, 'cancellation', 1200);
    let cfhCalls = 0;
    const origCFH = Game.callForHelp.bind(Game);
    Game.callForHelp = function (t, o) { cfhCalls++; return origCFH(t, o); };
    const said = [];
    const origSay = Game.say.bind(Game);
    Game.say = function (msg) { try { said.push(String(msg || '')); } catch (e) {} return origSay(msg); };
    const ctx = {};
    await quietLog(() => gc.policyForRun().daily(Game, ctx));
    ok(cfhCalls === 0, 'RED: callForHelp never invoked with gate off', cfhCalls + ' calls');
    ok(!ctx.gorgeCalls || !ctx.gorgeCalls.length, 'RED: no calls recorded with gate off');
    ok(!Game.aidCrisis || !Game.aidCrisis(), 'RED: no crisis raised with gate off');
    ok(Game.worldMonsters().includes(ent), 'RED: lingering entity untouched with gate off');
    said.length = 0;
    Game.havenGrowthDaily();
    ok(said.some(t => /gorges at the treeline/.test(t)), 'RED: gorge beat fires pristine');
    Game.callForHelp = origCFH; Game.say = origSay;
  });

  console.log('PART 2 — NON-AGGRESSION: gate-off wrapped == raw leadfeast');
  const hA = await withEnv('GORGCALL', undefined, () => runHashed(gc.leadfeast, 11, 20));
  const hB = await withEnv('GORGCALL', undefined, () => runHashed(gc.policyForRun(), 11, 20));
  ok(hA.length === hB.length && hA.length > 0, 'both runs produced hashes (' + hA.length + ')');
  const diff = hA.findIndex((h, i) => h !== hB[i]);
  ok(diff === -1, 'gate-off wrapped policy byte-identical to raw leadfeast over 20d' +
    (diff === -1 ? '' : ' (diverged day ' + diff + ')'));

  console.log('PART 3 — GREEN (gate on): the call goes out, wave-2 untouched');
  await withEnv('GORGCALL', '1', async () => {
    const { Game } = await loadGame({ seed: 11, mode: 'gorge-test', fullTelemetry: false });
    await setupGame(Game);
    await quietLog(() => runDays(Game, gc.leadfeast, { days: 25 }));
    let stage = 0;
    try { stage = Game.integrationStage ? Game.integrationStage() : 0; } catch (e) {}
    console.log('  info: integrationStage=' + stage + ' (system tier needs >= 2)');
    const link = formHighTrustLink(Game);
    console.log('  info: fixture link: ' + (link ? link.id + ' trust=' + link.trust : 'NONE (no-link branch)'));
    const apex = injectLingering(Game, 'cancellation', 1200);   // wave 5
    const low = injectLingering(Game, 'alien_tick', 300);       // wave 2 — gorgedrive's, not ours
    let cfhCalls = [];
    const origCFH = Game.callForHelp.bind(Game);
    Game.callForHelp = function (t, o) { cfhCalls.push(String(t)); return origCFH(t, o); };
    const said = [];
    const origSay = Game.say.bind(Game);
    Game.say = function (msg) { try { said.push(String(msg || '')); } catch (e) {} return origSay(msg); };
    const ctx = {};
    gc.gorgeCall(Game, ctx);
    const honestTiers = ['signal', 'system'];
    ok(cfhCalls.length === 1, 'GREEN: exactly one callForHelp invocation', cfhCalls.length + ' calls');
    ok(honestTiers.indexOf(cfhCalls[0]) >= 0, 'GREEN: honest tier (signal/system), got ' + cfhCalls[0]);
    if (cfhCalls[0] === 'system') ok(stage >= 2, 'GREEN: system tier only when stage>=2');
    const crisis = Game.aidCrisis ? Game.aidCrisis() : null;
    ok(!!crisis, 'GREEN: aid crisis active (raid-raised or policy-raised)');
    ok(crisis && crisis.calls && crisis.calls.length >= 1, 'GREEN: the call is recorded on the crisis');
    ok(ctx.gorgeCalls && ctx.gorgeCalls.length === 1, 'GREEN: one call recorded in ctx');
    ok(ctx.gorgeCalls[0].monsterId === 'cancellation' && ctx.gorgeCalls[0].wave === 5,
      'GREEN: the call names the wave-5 lingerer', JSON.stringify(ctx.gorgeCalls[0]));
    ok(Game.worldMonsters().includes(low) && low.lingering, 'GREEN: wave-2 lingerer untouched (gorgedrive owns 1-3)');
    ok(!low._gorgcall, 'GREEN: no policy marker on the wave-2 entity');
    ok(!!apex._gorgcall && apex._gorgcall.firstCallDay === gday(Game), 'GREEN: entity marker tracks the call (drift-safe)');
    const decisionLine = said.find(t => /lights the beacon|carry a call|sends a runner/.test(t));
    ok(!!decisionLine, 'GREEN: decision line read in the transcript (no silent actions)', decisionLine ? decisionLine.slice(0, 100) : 'none');
    ok(/price/i.test(decisionLine || ''), 'GREEN: the cost is named aloud', decisionLine ? decisionLine.slice(0, 140) : 'none');
    // once per monster per day: a second call the same day is refused
    cfhCalls = [];
    gc.gorgeCall(Game, ctx);
    ok(cfhCalls.length === 0, 'GREEN: no second call for the same monster the same day');
    ok((ctx.gorgeCallOncePerDay || 0) >= 1, 'GREEN: once-per-day hold counted');
    Game.callForHelp = origCFH; Game.say = origSay;
  });

  console.log('PART 4 — ARRIVAL (gate on): help arrives or every ask refuses aloud');
  await withEnv('GORGCALL', '1', async () => {
    const { Game } = await loadGame({ seed: 11, mode: 'gorge-test', fullTelemetry: false });
    await setupGame(Game);
    await quietLog(() => runDays(Game, gc.leadfeast, { days: 25 }));
    const link = formHighTrustLink(Game);
    ok(!!link, 'PART4 fixture: high-trust link formed', 'no other villages');
    const apex = injectLingering(Game, 'cancellation', 1200);
    const said = [];
    const origSay = Game.say.bind(Game);
    Game.say = function (msg) { try { said.push(String(msg || '')); } catch (e) {} return origSay(msg); };
    let arrivals = 0;
    const origArr = Game.aidHelpArrived.bind(Game);
    Game.aidHelpArrived = function (h) { arrivals++; return origArr(h); };
    const ctx = {};
    gc.gorgeCall(Game, ctx);
    ok(ctx.gorgeCalls && ctx.gorgeCalls.length === 1, 'PART4: the call went out');
    Game.say = origSay; // runDays re-silences via harness? no — restore, then re-wrap after
    // march time: help must walk real day-parts; run 8 days on the armed policy
    const said2 = [];
    Game.say = function (msg) { try { said2.push(String(msg || '')); } catch (e) {} return origSay(msg); };
    await quietLog(() => runDays(Game, gc.policyForRun(), { days: 8 }));
    Game.say = origSay; Game.aidHelpArrived = origArr;
    const arrivalBeat = said2.find(t => /walks in with/.test(t));
    const refusalBeat = said2.find(t => /Refused|stays home|cannot come|said no/i.test(t));
    ok(arrivals >= 1 || !!refusalBeat, 'PART4: honest answer — help arrived or every ask refused aloud',
      'arrivals=' + arrivals + ' refusalBeat=' + !!refusalBeat);
    if (arrivalBeat) console.log('  info: arrival: ' + arrivalBeat.slice(0, 160));
    if (refusalBeat) console.log('  info: refusal: ' + refusalBeat.slice(0, 160));
    const gorgeNights = said2.filter(t => /gorges at the treeline/.test(t)).length;
    console.log('  info: gorge nights during the 8d window: ' + gorgeNights + ' (help does not fight — measured, not presumed)');
  });

  console.log('PART 5 — ESCALATION (gate on): unanswered call -> runner');
  await withEnv('GORGCALL', '1', async () => {
    const { Game } = await loadGame({ seed: 11, mode: 'gorge-test', fullTelemetry: false });
    await setupGame(Game);
    await quietLog(() => runDays(Game, gc.leadfeast, { days: 25 }));
    const link = formHighTrustLink(Game);
    ok(!!link, 'PART5 fixture: high-trust link formed');
    const apex = injectLingering(Game, 'cancellation', 1200);
    const day = gday(Game);
    // backdate the marker: first call 3 days ago, bought nothing
    apex._gorgcall = { firstCallDay: day - 3, lastCallDay: day - 3, escalated: false };
    let cfhTiers = [];
    const origCFH = Game.callForHelp.bind(Game);
    Game.callForHelp = function (t, o) { cfhTiers.push(String(t)); return origCFH(t, o); };
    const said = [];
    const origSay = Game.say.bind(Game);
    Game.say = function (msg) { try { said.push(String(msg || '')); } catch (e) {} return origSay(msg); };
    const ctx = {};
    gc.gorgeCall(Game, ctx);
    ok(cfhTiers.length === 1 && cfhTiers[0] === 'runner', 'PART5: unanswered episode escalates to runner', cfhTiers.join(','));
    ok(ctx.gorgeCalls && ctx.gorgeCalls[0] && ctx.gorgeCalls[0].tier === 'runner', 'PART5: runner call recorded');
    ok(!!apex._gorgcall.escalated, 'PART5: entity marked escalated (no repeat escalation)');
    const rl = said.find(t => /sends a runner/.test(t));
    ok(!!rl && /second try/i.test(rl), 'PART5: escalation decision line names the price aloud');
    // no second escalation the next day
    cfhTiers = [];
    gc.gorgeCall(Game, ctx);
    ok(cfhTiers.length === 0, 'PART5: no repeat escalation (once per episode)');
    Game.callForHelp = origCFH; Game.say = origSay;
  });

  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e && e.stack || e); process.exit(2); });
