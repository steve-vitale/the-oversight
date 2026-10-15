#!/usr/bin/env node
// Proof test: party members' kin get itinerary legs (nomad-partykin 2026-10-15).
// Spec: docs/WORLD-REGIONS.md §6 + design calls in evidence/2026-10-15/nomad-partykin.md.
// The road driver's itinerary plans legs for every party villager's
// known-region scattered kin; their reunions are narrated from their
// perspective; their fates are salted by seeker id; all-found counts them.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame } = require('./sim-harness');

const SEED = parseInt(process.env.SEED || '45', 10);
let pass = 0, fail = 0;
const ok = (cond, label) => {
  if (cond) { pass++; console.log('  PASS: ' + label); }
  else { fail++; console.log('  FAIL: ' + label); }
};
const legNames = (l) => (l.kinNames && l.kinNames.length ? l.kinNames : (l.kinName ? [l.kinName] : []));
const regionKnown = (Game, id) => !!((((Game.state || {}).world || {}).regions || {})[id] || {}).known;
const seekerName = (Game, pid) => {
  try { const rc = Game.state.village.rosterChars[pid]; if (rc && rc.name) return rc.name; } catch (e) {}
  try { const d = (Game.data.villagers || []).find(x => x.id === pid); if (d && d.name) return d.name; } catch (e) {}
  try { const vp = Game.vpOf(pid); if (vp && vp.name) return vp.name; } catch (e) {}
  return null;
};

async function main() {
  const { Game } = await loadGame({ seed: SEED });
  await setupGame(Game, 'Columbus, Ohio');
  const D = Game.nomadDrive, N = Game.nomad;
  ok(!!D && typeof D.scatteredKinOf === 'function' && typeof D.partySeekers === 'function',
    'drive exposes party-kin itinerary API');

  Game.state.globalLive = true;
  const pkin = Game.worldKin(Game.villagerId).filter(k => k.fate === 'scattered' && k.region);
  for (const k of pkin.slice(0, 2)) Game.hearOfRegion(k.region, 'test');
  const r = N.start();
  r.supplies = { food: 9999999 };

  console.log('== (a) party kin get legs ==');
  const members = D.partySeekers().filter(id => id !== Game.villagerId);
  ok(members.length >= 1, 'party has volunteer members (' + members.length + ')');
  let target = null;
  for (const mid of members) {
    for (const k of D.scatteredKinOf(mid)) {
      if (k.region && regionKnown(Game, k.region)) { target = { mid, kin: k }; break; }
    }
    if (target) break;
  }
  ok(!!target, 'a party member has a known-region scattered kin');
  Game.hearOfRegion(target.kin.region, 'test');
  D.syncItinerary();
  const leg = r.legs.find(l => legNames(l).indexOf(target.kin.name) >= 0 &&
    (l.kinOwners || {})[target.kin.name] === target.mid);
  ok(!!leg, `leg planned for ${target.kin.name}, seeker tagged (${target.mid})`);
  // The bearer's own legs still read as owner null.
  const pleg = r.legs.find(l => legNames(l).indexOf(pkin[0].name) >= 0);
  ok(!!pleg && !(pleg.kinOwners || {})[pkin[0].name], "bearer's own leg has null owner");

  console.log('== (b) reunion from their perspective ==');
  const mname = seekerName(Game, target.mid);
  ok(!!mname, 'seeker has a name (' + mname + ')');
  const mFirst = mname.split(' ')[0];
  for (const fate of ['alive', 'changed', 'dead', 'moved']) {
    const sc = Game.nomadScenes.reunionScene(target.kin.name, fate, target.mid);
    ok(!!sc && sc.lines.length >= 2, `${fate}: member scene plays (${sc ? sc.lines.length : 0} lines)`);
    if (sc) {
      ok(sc.lines.some(l => l.indexOf(mFirst) >= 0), `${fate}: names the seeker`);
      ok(!sc.lines.some(l => /\byour\b/i.test(l)), `${fate}: never the bearer's second person`);
      ok(sc.lines.some(l => l.indexOf(target.kin.name) >= 0), `${fate}: names the kin`);
      ok(sc.lines.some(l => l.indexOf(target.kin.relation) >= 0), `${fate}: names the relation`);
    }
  }
  const bsc = Game.nomadScenes.reunionScene(target.kin.name, 'alive', null);
  ok(!!bsc && bsc.lines.some(l => /\byour\b/i.test(l)), 'bearer scene still second person (unchanged)');
  const c1 = Game.nomadScenes.reunionScene(target.kin.name, 'changed', target.mid);
  const c2 = Game.nomadScenes.reunionScene(target.kin.name, 'changed', target.mid);
  ok(!!c1 && !!c2 && c1.extra.decision === c2.extra.decision,
    'member changed-decision deterministic (' + (c1 && c1.extra.decision) + ')');
  ok(!!c1 && !c1.choices && ['joined', 'choice', 'stayed', 'fight'].indexOf(c1.outcome) >= 0,
    'member changed resolves to a decided outcome (' + (c1 && c1.outcome) + ')');

  console.log('== fate salting ==');
  const f1 = D.fateFor('Some Name', 0, 'seeker_1'), f2 = D.fateFor('Some Name', 0, 'seeker_1');
  ok(f1 === f2, 'salted fate deterministic (' + f1 + ')');
  let movedAt2 = 0;
  for (let i = 0; i < 200; i++) if (D.fateFor('Person ' + i, 2, 'seeker_1') === 'moved') movedAt2++;
  ok(movedAt2 === 0, 'moved excluded after 2 moves for party kin');
  let saltDiffers = 0;
  for (let i = 0; i < 200; i++) {
    if (D.fateFor('Person ' + i, 0, 'seeker_1') !== D.fateFor('Person ' + i, 0, 'seeker_2')) saltDiffers++;
  }
  ok(saltDiffers > 0, 'seeker salt changes fates (' + saltDiffers + '/200 differ)');
  const b1 = D.fateFor('Test Person', 0), b2 = D.fateFor('Test Person', 0);
  ok(b1 === b2, 'bearer fate deterministic (' + b1 + ')');

  console.log('== (d) moved-on relocates the seeker\'s kin ==');
  let target2 = null;
  for (const mid of members) {
    for (const k of D.scatteredKinOf(mid)) {
      if (k.name !== target.kin.name && k.region) { target2 = { mid, kin: k }; break; }
    }
    if (target2) break;
  }
  ok(!!target2, 'a second party kin exists for the moved-on test');
  const fakeLeg = { regionId: target2.kin.region, kinName: target2.kin.name, status: 'active', moves: {} };
  const oldRegion = Game.state.world.kin.find(k => k.name === target2.kin.name && k.owner === target2.mid).region;
  ok(D.moveKinOn(target2.kin.name, fakeLeg, target2.mid) === true, 'moveKinOn relocates party kin');
  const entry2 = Game.state.world.kin.find(k => k.name === target2.kin.name && k.owner === target2.mid);
  ok(entry2.region !== oldRegion && entry2.region !== fakeLeg.regionId, 'region changed to a new region');
  ok(!((Game.state.nomadScenes || {}).trails || {})[target2.kin.name], 'trail reset to vague');
  ok(fakeLeg.moves[target2.kin.name] === 1, 'move counted');

  console.log('== (h) dead seeker releases their kin ==');
  N.nomadKill(target.mid, 'test');
  ok(r.partyIds.indexOf(target.mid) < 0, 'seeker died on the road');
  Game.nomad.daily(); // wrapped: sync + releaseGoneSeekers + maybeReunion
  ok(leg.resolvedKin[target.kin.name] === 'released', "dead seeker's kin released");

  console.log('== (c) all-found counts party kin ==');
  ok(D.checkAllFound() === false, 'unresolved kin -> road stays open');
  for (const l of r.legs) {
    l.resolvedKin = l.resolvedKin || {};
    for (const n of legNames(l)) if (!l.resolvedKin[n]) l.resolvedKin[n] = 'alive';
  }
  // Party kin whose regions were never learned must not block.
  const unknownBlocked = [];
  for (const mid of D.partySeekers()) {
    for (const k of D.scatteredKinOf(mid)) {
      if (k.region && !regionKnown(Game, k.region)) unknownBlocked.push(k.name);
    }
  }
  console.log('  INFO: ' + unknownBlocked.length + ' unknown-region party kin outstanding');
  ok(D.checkAllFound() === true, 'every known-region kin resolved -> all-found (unknown regions do not block)');
  ok(Game.over === true && Game.won === true, 'all-found ends the run won');

  console.log(`\npartykin: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
