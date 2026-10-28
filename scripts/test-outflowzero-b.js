#!/usr/bin/env node
// test-outflowzero-b.js — scripted fixtures for the four zero-record
// outflow paths (sim-outflowzero-b, prereg
// evidence/2026-10-27/sim-outflowzero-b-prereg.md, committed BEFORE
// any judged probe as 906d8b42).
//
// Measurement only: zero src/js changes. Reuses
// scripts/stockdoors-capture.js UNCHANGED (which folds the driedhunt
// _removePantryKcal door in as 'remove-pantry-kcal'). Each fixture
// snapshots the pantry INDEPENDENTLY of the capture (its own
// before/after read), calls the real game method, and compares the
// capture record against that independent snapshot with ZERO kcal
// tolerance. A fixture manipulation (grant thief, set trader state,
// set a child age) touches only the fixture's own fresh game state
// and is printed in the report.
//
// Fixture seeds: 9820 (reused substrate, stated) and 9850 (fresh).
// Run: node scripts/test-outflowzero-b.js  (exit 0 = all four paths
// CLOSED on legs F1+F2; exit 1 = at least one path fails F1/F2).
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
const { installStockdoorsCapture, pantrySnap } = require('./stockdoors-capture');

const SEEDS = [9820, 9850];
let failures = 0;
const check = (name, ok, detail) => {
  console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail ? ' — ' + detail : ''));
  if (!ok) failures++;
};
const snap = (Game) => pantrySnap(Game).map(s => {
  const o = {}; for (const k of Object.keys(s)) if (k !== '_ref') o[k] = s[k]; return o;
});
const pantryKcal = (list) => list.reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
const decrease = (pre, post) => {
  // Independent snapshot diff by stack identity (name|kcalEach|spoilDay).
  const key = (i) => [i.name, i.kcalEach, i.spoilDay].join('|');
  const postMap = new Map(post.map(i => [key(i), i]));
  const out = [];
  for (const pr of pre) {
    const po = postMap.get(key(pr));
    const lost = (pr.units || 1) - (po ? (po.units || 1) : 0);
    if (lost > 0) out.push({ name: pr.name, kcalEach: pr.kcalEach, units: lost, kcal: lost * (pr.kcalEach || 0), spoilDay: pr.spoilDay });
  }
  return out;
};
const sumKcal = (items) => items.reduce((t, i) => t + (i.kcal || 0), 0);

async function freshGame(seed, tag) {
  const { Game } = await loadGame({ seed, mode: 'outflowzero-b-' + tag, fullTelemetry: false });
  const cap = installStockdoorsCapture(Game);
  const sayLines = [];
  const origSay = Game.say;
  if (typeof origSay === 'function') {
    Game.say = function (...args) {
      try { if (sayLines.length < 5000) sayLines.push(String(args[0] || '')); } catch (e) {}
      return origSay.apply(this, args);
    };
  }
  await setupGame(Game);
  return { Game, cap, sayLines };
}

async function fixtureLightFingers(seed) {
  const { Game, cap, sayLines } = await freshGame(seed, 'lift');
  const s = Game.state.scholar, v = Game.state.village;
  const access = (typeof Game.havenStoresAccess === 'function') ? Game.havenStoresAccess() : '?';
  s.abilities = s.abilities || [];
  if (!Game.hasAbility('thief')) s.abilities.push({ id: 'thief', name: 'Light Fingers', level: 1, xp: 0 });
  const held = !!Game.hasAbility('thief');
  s.inventory = [];
  const pre = snap(Game);
  const preKcal = pantryKcal(pre);
  const ret = Game.useAbility('thief', 'steal_pantry');
  const post = snap(Game);
  const dec = decrease(pre, post);
  const recs = cap.directRecords.filter(r => r.path === 'thief.steal_pantry');
  const rec = recs[recs.length - 1];
  const invGain = (s.inventory || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  const liftLines = sayLines.filter(l => /Light Fingers|disappears|wrist/i.test(l));
  const caught = liftLines.some(l => /caught|wrist/i.test(l));
  console.log(`[lift seed=${seed}] access=${access} held=${held} ret=${ret} preKcal=${preKcal} dec=${JSON.stringify(dec)} rec=${rec ? rec.totalKcal : null} invGain=${invGain} caught=${caught} say=${JSON.stringify(liftLines)}`);
  check(`lift/${seed} F1 fires`, ret === true && dec.length > 0, `ret=${ret} decKcal=${sumKcal(dec)}`);
  check(`lift/${seed} F2 record==snapshot`, !!rec && rec.totalKcal === sumKcal(dec) && rec.items.length === dec.length &&
    rec.items.every((it, i) => it.name === dec[i].name && it.kcalEach === dec[i].kcalEach && it.units === dec[i].units),
    rec ? `rec=${rec.totalKcal} snap=${sumKcal(dec)}` : 'no record');
  check(`lift/${seed} F2 inventory gain==record`, !!rec && invGain === rec.totalKcal, `invGain=${invGain} rec=${rec ? rec.totalKcal : null}`);
  check(`lift/${seed} no remove-pantry-kcal contamination`, !cap.directRecords.some(r => r.path === 'remove-pantry-kcal'),
    `removeRecords=${cap.directRecords.filter(r => r.path === 'remove-pantry-kcal').length}`);
  return { seed, ret, dec, rec, caught, say: liftLines };
}

async function fixtureEventFeed(seed) {
  const { Game, cap, sayLines } = await freshGame(seed, 'evfeed');
  const pre = snap(Game);
  Game.evRiverTrader({});
  const feedRet = Game.feedRiverTrader();
  const post = snap(Game);
  const dec = decrease(pre, post);
  const recs = cap.directRecords.filter(r => r.path === 'event-take');
  const rec = recs[recs.length - 1];
  const traderLines = sayLines.filter(l => /trader|spread|feast/i.test(l)).slice(-3);
  console.log(`[evfeed seed=${seed}] ret=${feedRet} dec=${JSON.stringify(dec)} rec=${rec ? JSON.stringify({ total: rec.totalKcal, retTaken: rec.retTaken, retMismatch: rec.retMismatch }) : null}`);
  check(`evfeed/${seed} F1 fires`, feedRet === true && dec.length > 0, `ret=${feedRet} decKcal=${sumKcal(dec)}`);
  check(`evfeed/${seed} F2 record==snapshot && sum==retTaken`, !!rec && rec.totalKcal === sumKcal(dec) && rec.retTaken === rec.totalKcal && rec.retMismatch === false && rec.retTaken >= 600,
    rec ? `rec=${rec.totalKcal} snap=${sumKcal(dec)} retTaken=${rec.retTaken} mismatch=${rec.retMismatch}` : 'no record');
  check(`evfeed/${seed} no remove-pantry-kcal contamination`, !cap.directRecords.some(r => r.path === 'remove-pantry-kcal'), '');
  return { seed, ret: feedRet, dec, rec, say: traderLines };
}

async function fixtureEventTrade(seed) {
  const { Game, cap } = await freshGame(seed, 'evtrade');
  const pre = snap(Game);
  Game.evRiverTrader({});
  const tradeRet = Game.tradeRiverTrader('rope');
  const post = snap(Game);
  const dec = decrease(pre, post);
  const recs = cap.directRecords.filter(r => r.path === 'event-take');
  const rec = recs[recs.length - 1];
  console.log(`[evtrade seed=${seed}] ret=${tradeRet} dec=${JSON.stringify(dec)} rec=${rec ? JSON.stringify({ total: rec.totalKcal, retTaken: rec.retTaken, retMismatch: rec.retMismatch }) : null}`);
  check(`evtrade/${seed} F1 fires`, tradeRet !== null && tradeRet !== false && dec.length > 0, `ret=${tradeRet} decKcal=${sumKcal(dec)}`);
  check(`evtrade/${seed} F2 record==snapshot && sum==retTaken`, !!rec && rec.totalKcal === sumKcal(dec) && rec.retTaken === rec.totalKcal && rec.retMismatch === false && rec.retTaken >= 250,
    rec ? `rec=${rec.totalKcal} snap=${sumKcal(dec)} retTaken=${rec.retTaken}` : 'no record');
  return { seed, ret: tradeRet, dec, rec };
}

async function fixtureBulk(seed) {
  const { Game, cap, sayLines } = await freshGame(seed, 'bulk');
  const s = Game.state.scholar, v = Game.state.village;
  s.inventory = [];
  const pre = snap(Game);
  const idxs = [];
  for (let i = 0; i < v.pantry.length && idxs.length < 2; i++) {
    if ((v.pantry[i].units || 0) >= 1 && (v.pantry[i].kcalEach || 0) > 0) idxs.push(i);
  }
  const sel = {}; for (const i of idxs) sel[i] = 1;
  const ret = Game.takeFromPantryBulk(sel);
  const post = snap(Game);
  const dec = decrease(pre, post);
  const packedLines = sayLines.filter(l => /^Packed:/i.test(l));
  const recs = cap.directRecords.filter(r => r.path === 'player-take-bulk');
  const rec = recs[recs.length - 1];
  const invGain = (s.inventory || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  console.log(`[bulk seed=${seed}] sel=${JSON.stringify(sel)} ret=${JSON.stringify(ret)} packedLines=${JSON.stringify(packedLines)} dec=${JSON.stringify(dec)} rec=${rec ? rec.totalKcal : null} invGain=${invGain}`);
  // takeFromPantryBulk returns null on SUCCESS too (its success signal
  // is the "Packed: ..." narration, not the return value — read the
  // function tail: `this.say('Packed: ...'); return null;`). F1 for
  // bulk is therefore Packed narration + pantry decrease, never the
  // return value. See the evidence file's metric-review note.
  check(`bulk/${seed} F1 fires`, packedLines.length === 1 && dec.length === idxs.length, `packed=${packedLines.length} decItems=${dec.length}`);
  check(`bulk/${seed} F2 record==snapshot`, !!rec && rec.totalKcal === sumKcal(dec) &&
    rec.items.every((it) => dec.some(d => d.name === it.name && d.kcalEach === it.kcalEach && d.units === it.units)),
    rec ? `rec=${rec.totalKcal} snap=${sumKcal(dec)}` : 'no record');
  check(`bulk/${seed} F2 inventory gain==record`, !!rec && invGain === rec.totalKcal, `invGain=${invGain} rec=${rec ? rec.totalKcal : null}`);
  check(`bulk/${seed} no remove-pantry-kcal contamination`, !cap.directRecords.some(r => r.path === 'remove-pantry-kcal'), '');
  return { seed, ret, dec, rec };
}

async function fixtureChild(seed) {
  const { Game, cap, sayLines } = await freshGame(seed, 'child');
  const v = Game.state.village, s = Game.state.scholar;
  const roster = v.roster || [];
  let rid = roster.find(id => id !== Game.villagerId && (() => { try { return Game.npcAge(id) < 15; } catch (e) { return false; } })());
  let ageSet = false;
  if (!rid) {
    rid = roster.find(id => id !== Game.villagerId);
    if (rid) {
      v.rosterChars = v.rosterChars || {};
      v.rosterChars[rid] = v.rosterChars[rid] || {};
      v.rosterChars[rid].age = 10;
      ageSet = true;
    }
  }
  if (!rid) { check(`child/${seed} F1 has a subject`, false, 'empty roster'); return { seed }; }
  const childAge = (() => { try { return Game.npcAge(rid); } catch (e) { return null; } })();
  v.positions = v.positions || {};
  if (!v.positions[rid]) v.positions[rid] = { mx: (s.mx ?? 4), my: (s.my ?? 4) };
  if (v.sick) delete v.sick[rid];
  const n = Game.npcNeeds(rid);
  n.hunger = 80; n.fear = 0; n.energy = 70;
  const pre = snap(Game);
  const preHunger = n.hunger;
  const H = { pos: v.positions[rid], n, name: Game.displayName(rid),
    announce: (m) => { try { sayLines.push(String(m)); } catch (e) {} },
    nearestCell: () => null, depleted: () => false, RESTFUL: () => false };
  const detail = (() => { try { return Game.genDetail(Game.map.px, Game.map.py); } catch (e) { return []; } })();
  Game.npcChildAction(rid, detail, { night: false, announced: 0 }, H);
  const post = snap(Game);
  const dec = decrease(pre, post);
  const recs = cap.directRecords.filter(r => r.path === 'npc-child-pantry');
  const rec = recs[recs.length - 1];
  const eatLines = sayLines.filter(l => /eats from the pantry/i.test(l));
  console.log(`[child seed=${seed}] rid=${rid} age=${childAge} ageSet=${ageSet} preHunger=${preHunger} postHunger=${n.hunger} dec=${JSON.stringify(dec)} rec=${rec ? rec.totalKcal : null} eatLines=${JSON.stringify(eatLines)}`);
  check(`child/${seed} F1 fires`, dec.length === 1 && dec[0].units === 1, `dec=${JSON.stringify(dec)}`);
  check(`child/${seed} F2 record==snapshot && hunger-30`, !!rec && rec.totalKcal === sumKcal(dec) && rec.items.length === 1 && rec.items[0].units === 1 && (preHunger - n.hunger) === 30,
    rec ? `rec=${rec.totalKcal} snap=${sumKcal(dec)} hungerDrop=${preHunger - n.hunger}` : 'no record');
  check(`child/${seed} F2 first-kcal-stack`, !!rec && dec[0].name === pre.find(i => (i.kcalEach || 0) > 0 && (i.units || 1) > 0).name,
    `dec0=${dec[0] && dec[0].name} first=${pre.find(i => (i.kcalEach || 0) > 0) && pre.find(i => (i.kcalEach || 0) > 0).name}`);
  check(`child/${seed} no remove-pantry-kcal contamination`, !cap.directRecords.some(r => r.path === 'remove-pantry-kcal'), '');
  return { seed, rid, age: childAge, ageSet, dec, rec, say: eatLines };
}

(async () => {
  const out = {};
  for (const seed of SEEDS) {
    out[seed] = {
      lift: await fixtureLightFingers(seed),
      evfeed: await fixtureEventFeed(seed),
      evtrade: await fixtureEventTrade(seed),
      bulk: await fixtureBulk(seed),
      child: await fixtureChild(seed),
    };
  }
  console.log('FIXTURE SUMMARY ' + JSON.stringify(Object.fromEntries(Object.entries(out).map(([sd, o]) => [sd, {
    lift: o.lift.dec && sumKcal(o.lift.dec), evfeed: o.evfeed.dec && sumKcal(o.evfeed.dec),
    evtrade: o.evtrade.dec && sumKcal(o.evtrade.dec), bulk: o.bulk.dec && sumKcal(o.bulk.dec),
    child: o.child.dec && sumKcal(o.child.dec) }]))));
  if (failures) { console.log('FIXTURES FAILED: ' + failures + ' check(s)'); process.exit(1); }
  console.log('ALL FIXTURE CHECKS PASSED');
})().catch(e => { console.error('FIXTURE CRASH', e && e.stack || e); process.exit(2); });
