#!/usr/bin/env node
// test-sumdeploy-a.js — unit proof for the game-side sum-readiness
// deploy (Game.titanCallReadiness, src/js/titans.js) for
// sim-sumdeploy-a (Loop A 20261102T0445Z, axis scale-onramp).
// Prereg: evidence/2026-11-02/sim-sumdeploy-a-prereg.md.
// Real Game via scripts/sim-harness.js (seeded before eval); fabricated
// links / villages / Haven roster only — no stubbed Game.save, no sim.
// Usage: node scripts/test-sumdeploy-a.js
'use strict';
const assert = require('assert');
const path = require('path');
const { loadGame, setupGame } = require(path.join(__dirname, 'sim-harness'));

function adult(id, name) { return { id: id, name: name, age: 30, alive: true }; }
function child(id, name) { return { id: id, name: name, age: 10, alive: true }; }
function link(vid, trust, arrears) {
  return { primary: 'haven', subordinate: vid, status: 'active', trust: trust, arrears: arrears || 0 };
}
let n = 0;
function check(name, cond, detail) {
  n++;
  assert.ok(cond, name + (detail !== undefined ? ' :: ' + JSON.stringify(detail) : ''));
  console.log('ok ' + n + ' ' + name);
}

(async () => {
  const { Game } = await loadGame({ seed: 4242, mode: 'herald', fullTelemetry: false });
  await setupGame(Game);
  assert.ok(typeof Game.titanCallReadiness === 'function', 'Game.titanCallReadiness exported');
  assert.ok(Game._titanTest && typeof Game._titanTest.titanCallReadiness === 'function', '_titanTest exposure');

  function setupWorld(opts) {
    opts = opts || {};
    Game.state.otherVillages = opts.villages || [];
    const v = Game.state.village || {};
    v.mship = v.mship || {};
    v.mship.links = opts.links || [];
    v.roster = opts.havenRoster || [];
    v.away = {};
    v.titanCommitted = opts.titanCommitted || {};
    v.trust = {};
    Game.state.titans = { omens: { herald: { stage: 2 } }, musters: opts.musters || {},
      slain: {}, cast: { herald: 'herald', apocalypse: 'finale' } };
  }

  // RNG counter: genVillageRoster reads global Math.random dynamically,
  // so wrapping it counts generation. titans.js captured R at load is
  // never used by the readiness path, so a zero delta is a real zero.
  const realRandom = Math.random;
  let rngCalls = 0;
  Math.random = function () { rngCalls++; return realRandom(); };
  function resetRng() { rngCalls = 0; }

  // 1. Trusted link, quota 6, capped by rostered free adults (4).
  {
    setupWorld({ links: [link('v1', 80, 0)],
      villages: [{ id: 'v1', name: 'Emberhold', opinion: 20,
        roster: [adult('a1', 'A1'), adult('a2', 'A2'), adult('a3', 'A3'), adult('a4', 'A4'), child('c1', 'C1')] }],
      havenRoster: ['h1', 'h2'] });
    const r = Game.titanCallReadiness('herald');
    check('trusted quota 6 capped at 4 free adults', r.links[0].quota === 6 && r.links[0].contribution === 4, r.links[0]);
    check('haven proj 2 volunteers = 2', r.havenProj === 2, r);
    check('total 6 < 10 not ready', r.total === 6 && r.ready === false, r);
    check('no errors', r.errors.length === 0, r.errors);
  }

  // 2. Untrusted link, quota 2.
  {
    setupWorld({ links: [link('v1', 46, 0)],
      villages: [{ id: 'v1', name: 'Stonebridge', opinion: 28,
        roster: [adult('a1', 'A1'), adult('a2', 'A2'), adult('a3', 'A3')] }],
      havenRoster: [] });
    const r = Game.titanCallReadiness('herald');
    check('untrusted quota 2', r.links[0].quota === 2 && r.links[0].contribution === 2, r.links[0]);
  }

  // 3. Refusals contribute 0: low trust, bad opinion, arrears (even trusted).
  {
    setupWorld({ links: [link('v1', 20, 0), link('v2', 80, 0), link('v3', 90, 3000)],
      villages: [
        { id: 'v1', name: 'A', opinion: 30, roster: [adult('a1', 'A1')] },
        { id: 'v2', name: 'B', opinion: -20, roster: [adult('b1', 'B1')] },
        { id: 'v3', name: 'C', opinion: 40, roster: [adult('c1', 'C1')] }],
      havenRoster: [] });
    const r = Game.titanCallReadiness('herald');
    check('refusing links all 0', r.links.every(function (l) { return l.wouldRefuse && l.contribution === 0; }), r.links);
    check('naive counts them (3), faithful does not (0)', r.naiveTotal === 3 && r.alliesProj === 0, r);
  }

  // 4. Rosterless link: generation counted, snapFree 0 shows undercount.
  {
    setupWorld({ links: [link('v1', 90, 0)],
      villages: [{ id: 'v1', name: 'A', opinion: 30, roster: null, population: 8 }],
      havenRoster: ['h1'] });
    const r = Game.titanCallReadiness('herald');
    const l = r.links[0];
    check('rosterless generated, snap 0, contribution = min(6, freeAdults)',
      l.generatedHere && l.snapFree === 0 && l.contribution === Math.min(6, l.freeAdults) && l.freeAdults > 0, l);
    check('generatedNow lists the village', r.generatedNow.length === 1 && r.generatedNow[0].villageId === 'v1', r.generatedNow);
    // Second call: nothing generated again, same contribution.
    const r2 = Game.titanCallReadiness('herald');
    check('second check generates nothing, same contribution',
      r2.generatedNow.length === 0 && r2.links[0].contribution === l.contribution, r2.links[0]);
  }

  // 5. Haven cap 3 with 5 volunteers; 2 volunteers -> 2.
  {
    setupWorld({ links: [], villages: [], havenRoster: ['h1', 'h2', 'h3', 'h4', 'h5'] });
    const r = Game.titanCallReadiness('herald');
    check('haven cap 3 with 5 volunteers', r.havenProj === 3 && r.volunteers === 5, r);
    setupWorld({ links: [], villages: [], havenRoster: ['h1', 'h2'] });
    const rB = Game.titanCallReadiness('herald');
    check('haven proj 2 with 2 volunteers', rB.havenProj === 2, rB);
  }

  // 5b. Haven valid + volunteers: 1 committed (excluded) + 1 free = 2.
  {
    setupWorld({ links: [], villages: [], havenRoster: ['h1', 'h2'],
      musters: { herald: { allies: [], haven: [{ vid: 'h1' }], day: 0, outfitted: {} } },
      titanCommitted: { h1: 'herald' } });
    const r = Game.titanCallReadiness('herald');
    check('havenValid 1 + 1 free volunteer = 2 (committed excluded)',
      r.havenValid === 1 && r.volunteers === 1 && r.havenProj === 2, r);
  }

  // 6. No weakest-link veto: trusted 6 + untrusted 2 + Haven 3 = 11 ready.
  {
    setupWorld({ links: [link('v1', 80, 0), link('v2', 46, 0)],
      villages: [
        { id: 'v1', name: 'A', opinion: 20, roster: [adult('a1', 'A1'), adult('a2', 'A2'), adult('a3', 'A3'), adult('a4', 'A4'), adult('a5', 'A5'), adult('a6', 'A6')] },
        { id: 'v2', name: 'B', opinion: 28, roster: [adult('b1', 'B1'), adult('b2', 'B2')] }],
      havenRoster: ['h1', 'h2', 'h3'] });
    const r = Game.titanCallReadiness('herald');
    check('untrusted link still counts its 2, total ready',
      r.links[1].contribution === 2 && r.total === 11 && r.ready === true, r);
  }

  // 7. Already-mustered faces cap the quota and leave freeAdults.
  {
    setupWorld({ links: [link('v1', 80, 0)],
      villages: [{ id: 'v1', name: 'A', opinion: 20,
        roster: [adult('a1', 'A1'), adult('a2', 'A2'), adult('a3', 'A3'), adult('a4', 'A4'), adult('a5', 'A5')] }],
      havenRoster: [],
      musters: { herald: { allies: [{ villageId: 'v1', vid: 'a1', name: 'A1' }, { villageId: 'v1', vid: 'a2', name: 'A2' }], haven: [], day: 0, outfitted: {} } } });
    const r = Game.titanCallReadiness('herald');
    check('already 2, contribution min(4, 3 free) = 3',
      r.links[0].already === 2 && r.links[0].freeAdults === 3 && r.links[0].contribution === 3, r.links[0]);
  }

  // 8. Momentary recomputation: arrears / trust changes move the projection.
  {
    const villages = [{ id: 'v1', name: 'A', opinion: 20,
      roster: [adult('a1', 'A1'), adult('a2', 'A2'), adult('a3', 'A3'), adult('a4', 'A4'), adult('a5', 'A5'), adult('a6', 'A6')] }];
    const links = [link('v1', 80, 0)];
    setupWorld({ links: links, villages: villages, havenRoster: ['h1', 'h2', 'h3'] });
    const before = Game.titanCallReadiness('herald');
    check('momentary baseline 6 + 3 = 9', before.total === 9 && before.ready === false, before);
    links[0].arrears = 5000;
    const refused = Game.titanCallReadiness('herald');
    check('arrears added -> contribution 0, total 3', refused.links[0].contribution === 0 && refused.total === 3, refused);
    links[0].arrears = 0;
    links[0].trust = 10;
    const distrusted = Game.titanCallReadiness('herald');
    check('trust dropped -> refusal, contribution 0', distrusted.links[0].wouldRefuse && distrusted.links[0].contribution === 0, distrusted.links[0]);
    links[0].trust = 80;
    const restored = Game.titanCallReadiness('herald');
    check('values restored -> projection restored (no cache)',
      restored.total === 9 && restored.links[0].contribution === 6, restored);
  }

  // 9. The check mutates nothing: trust/opinion/arrears, omens, musters keys.
  {
    setupWorld({ links: [link('v1', 80, 0)],
      villages: [{ id: 'v1', name: 'A', opinion: 20, roster: null, population: 8 }],
      havenRoster: ['h1'] });
    const linksBefore = JSON.stringify(Game.state.village.mship.links.map(function (l) { return [l.trust, l.arrears]; }));
    const opinionsBefore = JSON.stringify(Game.state.otherVillages.map(function (v) { return v.opinion; }));
    const omensBefore = JSON.stringify(Game.state.titans.omens);
    const musterKeysBefore = Object.keys(Game.state.titans.musters || {}).join(',');
    Game.titanCallReadiness('herald');
    const linksAfter = JSON.stringify(Game.state.village.mship.links.map(function (l) { return [l.trust, l.arrears]; }));
    const opinionsAfter = JSON.stringify(Game.state.otherVillages.map(function (v) { return v.opinion; }));
    check('readiness moves no trust/arrears/opinion and creates no muster',
      linksBefore === linksAfter && opinionsBefore === opinionsAfter &&
      omensBefore === JSON.stringify(Game.state.titans.omens) &&
      musterKeysBefore === Object.keys(Game.state.titans.musters || {}).join(','), null);
  }

  // 10. LAZY — mere check: rendering the self bar generates nothing, no RNG.
  {
    setupWorld({ links: [link('v1', 90, 0)],
      villages: [{ id: 'v1', name: 'A', opinion: 30, roster: null, population: 8 }],
      havenRoster: [] });
    resetRng();
    const acts = Game.titanSelfActions();
    check('self-bar render generates no roster and consumes no RNG',
      (Game.state.otherVillages[0].roster == null || Game.state.otherVillages[0].roster.length === 0) && rngCalls === 0,
      { acts: (acts || []).length, rngCalls: rngCalls, roster: Game.state.otherVillages[0].roster });
  }

  // 11. LAZY — readiness on rostered fires consumes no RNG; on a
  // rosterless fire it generates exactly once (the explicit check).
  {
    setupWorld({ links: [link('v1', 80, 0)],
      villages: [{ id: 'v1', name: 'A', opinion: 20, roster: [adult('a1', 'A1'), adult('a2', 'A2')] }],
      havenRoster: ['h1'] });
    resetRng();
    Game.titanCallReadiness('herald');
    check('readiness on rostered fires consumes no RNG', rngCalls === 0, { rngCalls: rngCalls });
    setupWorld({ links: [link('v1', 90, 0)],
      villages: [{ id: 'v1', name: 'A', opinion: 30, roster: null, population: 8 }],
      havenRoster: [] });
    resetRng();
    const first = Game.titanCallReadiness('herald');
    const firstRng = rngCalls;
    resetRng();
    const second = Game.titanCallReadiness('herald');
    check('explicit check on rosterless fire generates once, then free',
      first.generatedNow.length === 1 && firstRng > 0 && second.generatedNow.length === 0 &&
      second.links[0].contribution === first.links[0].contribution && rngCalls === 0,
      { firstRng: firstRng, secondRng: rngCalls, first: first.links[0], second: second.links[0] });
  }

  // 12. 95423-shaped: trusted link in arrears refuses; faithful 9, naive 15.
  {
    setupWorld({ links: [link('v1', 72, 3000), link('v2', 80, 0), link('v3', 46, 0)],
      villages: [
        { id: 'v1', name: 'Emberhold', opinion: 20, roster: [adult('a1', 'A1'), adult('a2', 'A2'), adult('a3', 'A3'), adult('a4', 'A4'), adult('a5', 'A5'), adult('a6', 'A6')] },
        { id: 'v2', name: 'Stonebridge', opinion: 20, roster: [adult('b1', 'B1'), adult('b2', 'B2'), adult('b3', 'B3'), adult('b4', 'B4')] },
        { id: 'v3', name: 'Hungry Road', opinion: 20, roster: [adult('c1', 'C1'), adult('c2', 'C2'), adult('c3', 'C3'), adult('c4', 'C4')] }],
      havenRoster: ['h1', 'h2', 'h3'] });
    const r = Game.titanCallReadiness('herald');
    check('95423-shaped: faithful 0+4+2+3 = 9, not ready; naive 15',
      r.links[0].contribution === 0 && r.alliesProj === 6 && r.total === 9 && r.ready === false && r.naiveTotal === 15, r);
  }

  // 13. Council readiness line: ready + not-ready-with-refusal, sense-read.
  {
    setupWorld({ links: [link('v1', 80, 0), link('v2', 46, 0)],
      villages: [
        { id: 'v1', name: 'Emberhold', opinion: 20, roster: [adult('a1', 'A1'), adult('a2', 'A2'), adult('a3', 'A3'), adult('a4', 'A4'), adult('a5', 'A5'), adult('a6', 'A6')] },
        { id: 'v2', name: 'Stonebridge', opinion: 28, roster: [adult('b1', 'B1'), adult('b2', 'B2')] }],
      havenRoster: ['h1', 'h2', 'h3'] });
    const said = [];
    const origSay = Game.say;
    Game.say = function (s) { if (typeof s === 'string') said.push(s); };
    try { Game.titanWarCouncil('herald'); } finally { Game.say = origSay; }
    const readyLine = said.filter(function (s) { return s.indexOf('would bring') >= 0; })[0] || '';
    console.log('COUNCIL-READY-LINE: ' + readyLine);
    check('council ready line carries count + ready verdict',
      readyLine.indexOf('11 blades') >= 0 && readyLine.indexOf('coalition is ready') >= 0, readyLine);
    setupWorld({ links: [link('v1', 80, 3000)],
      villages: [{ id: 'v1', name: 'Emberhold', opinion: 20, roster: [adult('a1', 'A1'), adult('a2', 'A2')] }],
      havenRoster: [] });
    said.length = 0;
    Game.say = function (s) { if (typeof s === 'string') said.push(s); };
    try { Game.titanWarCouncil('herald'); } finally { Game.say = origSay; }
    const refuseLine = said.filter(function (s) { return s.indexOf('would bring') >= 0; })[0] || '';
    console.log('COUNCIL-REFUSAL-LINE: ' + refuseLine);
    check('council not-ready line names the refusing fire + debts reason',
      refuseLine.indexOf('Emberhold') >= 0 && refuseLine.indexOf('debts unpaid') >= 0, refuseLine);
  }

  // 14. Unknown titan -> null.
  check('unknown titan returns null', Game.titanCallReadiness('nope') === null);

  Math.random = realRandom;
  console.log('SUMDEPLOY-UNIT-OK checks=' + n);
})().catch(function (e) { console.error('SUMDEPLOY-UNIT-FAIL ' + (e && e.stack || e)); process.exit(1); });
