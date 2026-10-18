#!/usr/bin/env node
// test-vetsurvive-20261018.js — proof for the vetsurvive policy layer
// (flesh-out loop arm sim-vetsurvive, 2026-10-18, scale-onramp axis).
// POLICY-SIDE ONLY: proves scripts/policies/vetsurvive.js, never touches
// src/js. Fixtures stub Game.standingDeferral (documented); the det-gate
// and smoke run the real engine.
//
// (a) MECHANISM (in-process fixtures on a real harness game):
//     muster shelters veteran candidates with reason 'veteran-keep' + the
//     legible beat; release stands down on window close; the draft guard
//     excludes sheltered veterans from partyMembers during base.daily;
//     the scholar-hold travel guard blocks wild travel but allows Haven.
// (b) DET-GATE: VETSURVIVE unset => vetsurvive-lead byte-identical to
//     vetrel-lead on fixed seeds (pure delegation, both policies).
// (c) SMOKE: VETSURVIVE=1 short run drives without errors.
// Usage: node scripts/test-vetsurvive-20261018.js
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');
const { vetrelLead, vetrelBelong } = require('./policies/vetrel');
const VS = require('./policies/vetsurvive');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

function stubDeferral(Game, def) {
  const orig = Game.standingDeferral;
  Game.standingDeferral = function () { return Object.assign({}, def); };
  return () => { Game.standingDeferral = orig; };
}
function captureSay(Game) {
  const orig = Game.say;
  const lines = [];
  Game.say = function (msg) { try { lines.push(String(msg)); } catch (e) {} return orig.call(Game, msg); };
  return { lines, restore() { Game.say = orig; } };
}
function pickVillager(Game) {
  const v = Game.state.village || {};
  const roster = (v.roster || []).filter(id => id && id !== Game.villagerId);
  for (const id of roster) {
    let vp = null;
    try { vp = Game.vpOf(id); } catch (e) {}
    if (vp && !vp.dead) return id;
  }
  return null;
}
function makeVeteran(Game, vid) {
  Game.state.waveKillLog = Game.state.waveKillLog || [];
  Game.state.waveKillLog.push({ d: 60, mid: 'the_redactor', w: 3, by: vid, via: 'companion', trick: null });
}

async function newGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'vetsurvive-proof' });
  await setupGame(Game);
  return Game;
}

async function main() {
  process.env.VETREL = '1';
  process.env.FEASTSCALE_R13 = '1';
  process.env.SEATDRIVE = '0';
  process.env.VETSURVIVE = '1'; // gate ON for mechanism fixtures; fixture F toggles it off

  console.log('== (a) MECHANISM fixtures ==');
  // A. muster: window open + veteran villager => sheltered, reason kept, beat said
  {
    const Game = await newGame(9101);
    const vid = pickVillager(Game);
    check('fixture has a living villager', !!vid, '');
    makeVeteran(Game, vid);
    const restoreDefer = stubDeferral(Game, { wave: 4, deferred: true, grandfathered: false, raw: 120, threshold: 100 });
    const cap = captureSay(Game);
    const ctx = { _vsMustered: [] };
    // ensure at haven for the muster order
    let haven = false;
    try { haven = Game.playerAtHaven(); } catch (e) {}
    VS.musterPass(Game, ctx);
    const sh = ((Game.state.village || {}).sheltered || {})[vid];
    check('veteran sheltered during open window', !!(sh && Game.isSheltered(vid)), haven ? '' : 'not at haven?');
    check('shelter reason is veteran-keep', sh && sh.reason === 'veteran-keep', JSON.stringify(sh && sh.reason));
    check('muster tracked in ctx', (ctx._vsMustered || []).includes(vid), JSON.stringify(ctx._vsMustered));
    check('muster beat is player-legible', cap.lines.some(l => /MUSTER/.test(l) && /veteran/i.test(l)),
      cap.lines.filter(l => /MUSTER/.test(l)).slice(0, 1).join(' ').slice(0, 120));
    check('telemetry counted', (ctx.vsMusters | 0) === 1 && (ctx.vsMusteredTotal | 0) >= 1,
      `musters=${ctx.vsMusters} total=${ctx.vsMusteredTotal}`);
    cap.restore(); restoreDefer();
  }
  // B. no muster when window closed; release on grandfathered
  {
    const Game = await newGame(9102);
    const vid = pickVillager(Game);
    makeVeteran(Game, vid);
    const ctx = { _vsMustered: [] };
    let restoreDefer = stubDeferral(Game, { wave: 4, deferred: false, grandfathered: false, raw: 60, threshold: 100 });
    VS.musterPass(Game, ctx);
    check('no muster when window closed', !Game.isSheltered(vid), '');
    restoreDefer();
    // now open, muster, then grandfathered => release
    restoreDefer = stubDeferral(Game, { wave: 4, deferred: true, grandfathered: false, raw: 150, threshold: 100 });
    VS.musterPass(Game, ctx);
    check('mustered on open', !!Game.isSheltered(vid), '');
    restoreDefer();
    const cap = captureSay(Game);
    restoreDefer = stubDeferral(Game, { wave: 4, deferred: false, grandfathered: true, raw: 150, threshold: 100, peak: 4 });
    VS.musterPass(Game, ctx);
    check('released on grandfathered', !Game.isSheltered(vid), '');
    check('stand-down beat said', cap.lines.some(l => /STAND DOWN/.test(l)), '');
    check('tracking cleared', (ctx._vsMustered || []).length === 0, JSON.stringify(ctx._vsMustered));
    cap.restore(); restoreDefer();
  }
  // C. non-veterans are never mustered
  {
    const Game = await newGame(9103);
    const vid = pickVillager(Game);
    const restoreDefer = stubDeferral(Game, { wave: 4, deferred: true, grandfathered: false, raw: 130, threshold: 100 });
    const ctx = { _vsMustered: [] };
    VS.musterPass(Game, ctx);
    check('non-veteran not mustered', !Game.isSheltered(vid), '');
    restoreDefer();
  }
  // D. draft guard: sheltered veteran excluded from partyMembers during base.daily
  {
    const Game = await newGame(9104);
    const vid = pickVillager(Game);
    makeVeteran(Game, vid);
    Game.state.village.sheltered = Game.state.village.sheltered || {};
    Game.state.village.sheltered[vid] = { since: 60, reason: 'veteran-keep' };
    const before = Game.partyMembers();
    const ctx = {};
    let during = null;
    VS.withDraftGuard(Game, ctx, () => { during = Game.partyMembers(); });
    check('guard excludes sheltered veteran', during && !during.includes(vid) && during.length === before.length - (before.includes(vid) ? 1 : 0),
      `before=${before.length} during=${during && during.length}`);
    check('partyMembers restored after guard', Game.partyMembers().length === before.length, '');
    check('non-sheltered members kept', during && before.filter(id => id !== vid).every(id => during.includes(id)), '');
  }
  // E. scholar-hold travel guard: wild blocked, Haven allowed
  {
    const Game = await newGame(9105);
    const calls = [];
    const trueOrig = Game.travelTo;
    const spy = function (x, y) { calls.push([x, y]); return 'ok-' + x + ',' + y; };
    Game.travelTo = spy;
    const ctx = {};
    const v = Game.state.village || {};
    const hx = v.px ?? 4, hy = v.py ?? 4;
    let wildRet = 'unset', homeRet = 'unset';
    VS.withScholarHold(Game, ctx, () => {
      wildRet = Game.travelTo(hx + 1, hy);
      homeRet = Game.travelTo(hx, hy);
    });
    check('wild travel blocked (null)', wildRet === null, String(wildRet));
    check('haven travel allowed', homeRet === 'ok-' + hx + ',' + hy, String(homeRet));
    check('block counted', (ctx.vsTravelBlocked | 0) === 1, `blocked=${ctx.vsTravelBlocked}`);
    check('travelTo restored to pre-guard fn', Game.travelTo === spy, '');
    Game.travelTo = trueOrig;
  }
  // F. gate off: pure delegation (no shelter, no guards, no flags)
  {
    delete process.env.VETSURVIVE;
    const Game = await newGame(9106);
    const vid = pickVillager(Game);
    makeVeteran(Game, vid);
    const restoreDefer = stubDeferral(Game, { wave: 4, deferred: true, grandfathered: false, raw: 140, threshold: 100 });
    const ctx = {};
    const pmBefore = Game.partyMembers;
    const trBefore = Game.travelTo;
    await quietLog(async () => VS.vetsurviveLead.daily(Game, ctx));
    check('gate-off daily: no muster', !Game.isSheltered(vid), '');
    check('gate-off daily: ctx untouched', ctx._vsMustered === undefined && ctx._vsScholarHold === undefined,
      Object.keys(ctx).filter(k => /^_vs/.test(k)).join(','));
    await quietLog(async () => VS.vetsurviveLead.upkeep(Game, ctx));
    check('gate-off: partyMembers untouched', Game.partyMembers === pmBefore, '');
    check('gate-off: travelTo untouched', Game.travelTo === trBefore, '');
    restoreDefer();
    process.env.VETSURVIVE = '1';
  }
  // G. gate-on daily wires the guard + muster (integration, short)
  {
    const Game = await newGame(9107);
    const vid = pickVillager(Game);
    makeVeteran(Game, vid);
    const restoreDefer = stubDeferral(Game, { wave: 4, deferred: true, grandfathered: false, raw: 140, threshold: 100 });
    const ctx = {};
    await quietLog(async () => VS.vetsurviveLead.daily(Game, ctx));
    check('gate-on daily: veteran mustered', !!Game.isSheltered(vid), '');
    restoreDefer();
  }

  console.log('== (b) DET-GATE (gate off => byte-identical to vetrel) ==');
  {
    const seeds = [9201, 9202];
    let green = 0;
    for (const seed of seeds) {
      for (const [pid, pol] of [['vetrel-lead', vetrelLead], ['vetsurvive-lead', VS.vetsurviveLead]]) {
        delete process.env.VETSURVIVE;
        const { Game } = await loadGame({ seed, mode: 'vetsurvive-det' });
        await setupGame(Game);
        const hashes = [];
        const wrapped = Object.assign({}, pol, {
          daily(G, ctx) {
            hashes.push(G.state.scholar.day + ':' + dayHash(G));
            return pol.daily(G, ctx);
          },
        });
        await quietLog(async () => runDays(Game, wrapped, { days: 60 }));
        const key = `${pid}-s${seed}`;
        hashes._key = key;
        if (!global._detHashes) global._detHashes = {};
        global._detHashes[key] = hashes.join('\n');
      }
      const a = global._detHashes[`vetrel-lead-s${seed}`];
      const b = global._detHashes[`vetsurvive-lead-s${seed}`];
      const same = a === b;
      if (same) green++;
      check(`gate-off byte-identical [seed ${seed}]`, same, same ? '' : 'trajectories diverged');
    }
    check('det-gate all green', green === seeds.length, `${green}/${seeds.length}`);
  }

  console.log('== (c) SMOKE (gate on, short run) ==');
  {
    process.env.VETSURVIVE = '1';
    const { Game } = await loadGame({ seed: 9301, mode: 'vetsurvive-smoke' });
    await setupGame(Game);
    const ctx = {};
    let err = null;
    try {
      await quietLog(async () => runDays(Game, VS.vetsurviveBelong, { days: 45 }));
    } catch (e) { err = e; }
    check('45d gate-on run completes', !err, err && String(err.message || err).slice(0, 200));
    check('game state coherent', !Game.over || typeof Game.over === 'boolean', '');
  }

  console.log(`\nPROOF: ${pass} pass, ${fail} fail.`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('PROOF CRASH:', e && e.stack || e); process.exit(2); });
