#!/usr/bin/env node
'use strict';
// Gate semantics, prepared cap behavior, real link receipts and independent
// observer A/B. Every child loads one shared-harness world.
const assert = require('assert');
const { execFileSync } = require('child_process');
const { createHash } = require('crypto');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { attachLinkPipe, finalizeLinkPipe, leadcourtWindow } = require('./link-pipeline-20261014');
const campaignSeed = Number(process.env.FL_SEED || 12);
let pass = 0;
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
function check(label, condition) { assert(condition, label); pass++; console.log('  ok ' + label); }
function stateHash(G) { return hash({ state: G.state, over: G.over, won: G.won,
  dayPart: G.dayPart, villagerId: G.villagerId, tbfight: G.tbfight, pendingEncounter: G.pendingEncounter }); }
function child(kind, extra = {}) {
  const stdout = execFileSync(process.execPath, [__filename], { env: { ...process.env,
    LINK_CHILD: kind, ...extra }, encoding: 'utf8', maxBuffer: 8e6 });
  const line = stdout.split('\n').find(line => line.startsWith('LINK_RESULT '));
  assert(line, 'child result: ' + kind);
  process.stdout.write(stdout.split('\n').filter(line => !line.startsWith('LINK_RESULT ')).join('\n'));
  const result = JSON.parse(line.slice('LINK_RESULT '.length)); pass += result.checks || 0;
  return result;
}
async function runChild(kind) {
  const seed = Number(process.env.SEED || campaignSeed);
  const armed = process.env.FOURTHLINK === '1';
  const { leadcourt } = require('./policies/leadcourt');
  const { fourthlink } = require('./policies/fourthlink');
  const { Game: G, loadFails } = await loadGame({ seed, mode: 'link-pipe-proof' });
  assert.equal(loadFails.length, 0, 'no module load failures');
  // The historical fourth-link opportunity case is a woodland cohort.
  G.debugRegion = 'na_eastern_woodlands';
  await setupGame(G);
  const policy = armed ? fourthlink : leadcourt;
  if (kind === 'fault' || kind === 'return') {
    const sentinel = kind === 'fault' ? new TypeError('prepared original error') : { id: 'prepared-return', __threw: true };
    let calls = 0;
    G.proposeLink = function () { calls++; assert.strictEqual(this, G); if (kind === 'fault') throw sentinel; return sentinel; };
    const p = attachLinkPipe(G, {});
    let result, error;
    try { result = G.proposeLink('prepared'); } catch (caught) { error = caught; }
    check('wrapped original is called exactly once', calls === 1);
    if (kind === 'fault') check('observer preserves original error identity', error === sentinel && p.errors.length === 1);
    else check('observer preserves legitimate object return identity', !error && result === sentinel && p.errors.length === 0);
    return { checks: pass };
  }
  if (kind === 'unknown') {
    // Four-link structural fixtures do not depend on generated settlement count.
    const targets = G.state.otherVillages.slice(0, 4);
    while (targets.length < 4) {
      const target = { ...targets[0], id: 'prepared-observer-village-' + targets.length, name: 'Prepared observer village' };
      G.state.otherVillages.push(target); targets.push(target);
    }
    assert.equal(targets.length, 4);
    G.state.scholar.day = 40;
    const links = G.mshipState().links = targets.map((target, i) => ({
      id: 'unknown-fixture-' + i, primary: 'haven', subordinate: target.id,
      day: i === 3 ? undefined : 39, trust: 80, status: 'active', history: [],
    }));
    const m = {}, p = attachLinkPipe(G, m); p.snapshot(G, 'leadcourt');
    const fin = finalizeLinkPipe(G, m), unknown = fin.links.find(link => link.id === links[3].id);
    check('unknown formation date stays null with an explicit observation date', unknown.day === null && unknown.age === null && unknown.observedDay === 40);
    check('raw snapshot does not invent the missing age', p.roll[0].links[3].age === null);
    check('unknown order cannot fabricate a fourth formation', fin.unknownFormationDates === 1 && fin.formationOrderKnown === false && fin.fourthLeadLink === null);
    check('observed lifecycles are distinguished from new proposals', fin.linksObserved === 4 && fin.linksFormed === fin.linksObserved && fin.proposals.total === 0);
    p.tends.push({ linkId: links[3].id, paid: 1500, week: null, day: 40 });
    const partial = finalizeLinkPipe(G, m).links.find(link => link.id === links[3].id);
    check('paid tending with an unknown week stays explicitly unknown', partial.tendWeeks === null && partial.unknownTendWeeks === 1 && partial.successfulTends === 1);
    return { checks: pass };
  }
  if (kind === 'fixture') {
    // Four-link structural fixtures do not depend on generated settlement count.
    const targets = G.state.otherVillages.slice(0, 4);
    while (targets.length < 4) {
      const target = { ...targets[0], id: 'prepared-observer-village-' + targets.length, name: 'Prepared observer village' };
      G.state.otherVillages.push(target); targets.push(target);
    }
    assert.equal(targets.length, 4, 'four explicitly prepared village records');
    targets.forEach(v => { v.generated = true; });
    G.state.otherVillages = targets;
    G.state.scholar.day = 40; G.state.scholar.kcal = 8000;
    G.state.village.pantry = [{ name: 'Prepared grain', kcalEach: 1500, units: 40, spoilDay: 9999 }];
    G.state.pendingCounter = null; G.state.pendingAccord = null; G.state.pendingNational = null;
    const links = G.mshipState().links = targets.slice(0, 3).map((target, i) => ({
      id: 'prepared-link-' + i, primary: 'haven', subordinate: target.id, day: 39,
      trust: 80, status: 'active', tributeKcalPerWeek: 4000, arrears: 0, history: [],
    }));
    const m = {}, p = attachLinkPipe(G, m);
    p.snapshot(G, 'leadcourt');
    const before = p.win[0];
    check('prepared cap window is open with three leads and one candidate', before.open && before.capFires && before.subs === 3 && before.cands === 1);
    check('roll captures all three actual prepared links', p.roll[0].links.length === 3);
    check('formation dates use actual link dates, not first snapshot day', links.every(link => p.formed[link.id].day === link.day && p.formed[link.id].observedDay === 40));
    policy.daily(G, {});
    p.snapshot(G, 'leadcourt');
    const fin = finalizeLinkPipe(G, m);
    check('real tend calls have positive food receipts', p.tends.length === 3 && p.tends.every(row => row.paid > 0));
    check('actual blocked-cap opportunity is recorded', fin.capBlockedDays > 0 && fin.errors.length === 0);
    const pantryBeforeRefusal = G.state.village.pantry.reduce((sum, item) => sum + item.kcalEach * item.units, 0);
    const refused = [G.tendLink(links[0].id), G.tendLink(links[0].id)];
    const afterRefusal = finalizeLinkPipe(G, m), first = afterRefusal.links.find(link => link.id === links[0].id);
    check('actual repeat tends are refused without food charge', refused.every(paid => paid === 0) && G.state.village.pantry.reduce((sum, item) => sum + item.kcalEach * item.units, 0) === pantryBeforeRefusal);
    check('refused attempts do not inflate paid tending weeks', first.tendWeeks === 1 && first.tendAttempts === 3 && first.successfulTends === 1);
    return { armed, proposals: p.proposals, tends: p.tends, capBlockedDays: fin.capBlockedDays, checks: pass };
  }
  assert.equal(kind, 'campaign');
  // The current generated start has only three target villages. This is an
  // explicit four-target opportunity cohort, not natural fourth-link reach.
  // Both observer arms and both policies receive the same actual records.
  while (G.state.otherVillages.length < 4) {
    const v = JSON.parse(JSON.stringify(G.state.otherVillages[0]));
    v.id = 'prepared-fourthlink-' + G.state.otherVillages.length;
    v.name = 'Prepared fourth-link settlement';
    v.generated = true;
    G.state.otherVillages.push(v);
  }
  const m = {}, p = process.env.LINK_OBSERVER === '1' ? attachLinkPipe(G, m) : null;
  // The daily snapshot precedes competent.daily; its food/discovery/answers
  // can open a courtship window later in the same day. Observe the actual
  // proposal boundary as well, without substituting it for the daily series.
  const proposalEntries = [], propose = G.proposeLink;
  G.proposeLink = function (...args) {
    const window = leadcourtWindow(this);
    const result = propose.apply(this, args);
    proposalEntries.push({ target: args[0], window, linkId: result?.id || null });
    return result;
  };
  const hashes = [], warnings = [], warn = console.warn;
  console.warn = (...args) => { warnings.push(args.map(String).join(' ')); warn(...args); };
  const observed = { ...policy, daily(Game, ctx) {
    hashes.push(stateHash(Game)); // same boundary before observer sampling in each arm
    if (p) p.snapshot(Game, 'leadcourt');
    return policy.daily(Game, ctx);
  } };
  let result;
  try { await quietLog(async () => { result = await runDays(G, observed, { days: 60, sampleEvery: 10 }); }); }
  finally { console.warn = warn; }
  const standing = G.villageStanding();
  hashes.push(stateHash(G));
  return { seed, armed, hashes, days: result.days, gameDays: result.gameDays,
    end: result.endReason, standing: standing.total, links: standing.links,
    randomTail: Array.from({ length: 16 }, () => Math.random()), warnings, proposalEntries,
    pipe: p ? finalizeLinkPipe(G, m) : null };
}
async function main() {
  if (process.env.LINK_CHILD) {
    Object.defineProperty(globalThis, 'performance', { configurable: true, value: { now: () => 0 } });
    console.log('LINK_RESULT ' + JSON.stringify(await runChild(process.env.LINK_CHILD))); return;
  }
  delete process.env.FOURTHLINK;
  const { leadcourt } = require('./policies/leadcourt');
  delete require.cache[require.resolve('./policies/fourthlink')];
  check('gate off exports the actual baseline object', require('./policies/fourthlink').fourthlink === leadcourt);
  process.env.FOURTHLINK = '1'; delete require.cache[require.resolve('./policies/fourthlink')];
  const on = require('./policies/fourthlink').fourthlink;
  check('gate on exports a distinct uncapped policy', on !== leadcourt && /cap/i.test(on.desc));
  child('fault'); child('return'); child('unknown');
  const capped = child('fixture', { FOURTHLINK: '0' });
  const uncapped = child('fixture', { FOURTHLINK: '1' });
  check('baseline makes no fourth proposal at its cap', capped.proposals.length === 0);
  check('uncapped policy makes one real fourth proposal', uncapped.proposals.length === 1);
  let baseline;
  for (const seed of [...new Set([campaignSeed, 7, 42, 99])]) {
    const bare = child('campaign', { SEED: String(seed), FOURTHLINK: '0', LINK_OBSERVER: '0' });
    const inst = child('campaign', { SEED: String(seed), FOURTHLINK: '0', LINK_OBSERVER: '1' });
    console.log('  neutrality receipt ' + JSON.stringify({ seed, bare, inst }));
    check('seed ' + seed + ': daily/final state snapshots identical', hash(bare.hashes) === hash(inst.hashes));
    check('seed ' + seed + ': days/ending/standing/links identical', bare.days === inst.days && bare.gameDays === inst.gameDays && bare.end === inst.end && bare.standing === inst.standing && bare.links === inst.links);
    check('seed ' + seed + ': RNG continuation identical', hash(bare.randomTail) === hash(inst.randomTail));
    check('seed ' + seed + ': actual proposal entries identical', hash(bare.proposalEntries) === hash(inst.proposalEntries));
    check('seed ' + seed + ': real windows sampled without warnings/errors', inst.pipe.winDays > 0 && inst.pipe.errors.length === 0 && bare.warnings.length === 0 && inst.warnings.length === 0);
    if (seed === campaignSeed) baseline = inst;
  }
  check('canonical campaign records actual proposals/links/tends', baseline.pipe.proposals.total > 0 && baseline.pipe.linksObserved > 0 && baseline.pipe.tends > 0);
  const armed = child('campaign', { SEED: String(campaignSeed), FOURTHLINK: '1', LINK_OBSERVER: '1' });
  check('canonical matched campaign keeps proposing', armed.pipe.proposals.total >= baseline.pipe.proposals.total);
  const fourth = armed.pipe.fourthLeadLink;
  const fourthReceipt = fourth && armed.proposalEntries.find(row =>
    row.target === fourth.target && row.window.day === fourth.formedDay && row.linkId);
  check('baseline campaign stays below a fourth lead formation', baseline.pipe.fourthLeadLink === null);
  check('armed campaign forms a real fourth lead from an open capped proposal window',
    fourthReceipt && fourthReceipt.window.open && fourthReceipt.window.capFires &&
    fourthReceipt.window.subs >= 3 && armed.pipe.links.some(link =>
      link.id === fourthReceipt.linkId && link.target === fourth.target && link.dir === 'lead') &&
    armed.pipe.errors.length === 0);
  console.log('  campaign comparison ' + JSON.stringify({ baseline: baseline.pipe, armed: armed.pipe }));
  delete process.env.FOURTHLINK;
  console.log('link proof green: ' + pass + ' checks');
}
main().catch(error => { console.error(error.stack); process.exitCode = 1; });
