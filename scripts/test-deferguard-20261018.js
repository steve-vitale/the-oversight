#!/usr/bin/env node
// test-deferguard-20261018.js — proof for the deferguard policy layer
// (flesh-out loop arm sim-deferguard, 2026-10-18, scale-onramp axis).
// POLICY-SIDE ONLY: proves scripts/policies/deferguard.js, never touches
// src/js. Fixtures stub Game.standingDeferral (documented); the det-gate
// and smoke run the real engine.
//
// (a) MECHANISM (in-process fixtures on a real harness game):
//     invite guard refuses qualifying veterans (refusal, no trust hit) and
//     passes non-veterans through untouched; standDown dismisses party
//     veterans via the real dismissFromParty verb; nothing fires with the
//     window closed; the scholar is never a qualifying veteran.
// (b) DET-GATE: DEFERGUARD unset => deferguard-lead byte-identical to
//     vetrel-lead on fixed seeds (pure delegation).
// (c) SMOKE: DEFERGUARD=1 short run drives without errors.
// Usage: node scripts/test-deferguard-20261018.js
'use strict';
// POST-KILL INFO-SKIP (coordinator repair 2026-10-18): the deferguard layer
// was deleted per the kill protocol (KILLED-AT-PILOT, engagement 0/16), so
// this proof has nothing to prove. Exit 0 instead of crashing on the
// missing module.
const fs = require('fs'), path = require('path');
if (!fs.existsSync(path.join(__dirname, 'policies', 'deferguard.js'))) {
  console.log('INFO-SKIP: test-deferguard-20261018.js — layer deleted per kill protocol (KILLED-AT-PILOT 2026-10-18); proof vacuous.');
  process.exit(0);
}
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');
const { vetrelLead } = require('./policies/vetrel');
const DG = require('./policies/deferguard');
const deferguardLead = DG.withDeferguard(vetrelLead, 'deferguard-lead',
  'vetrel-lead + DEFERGUARD veteran expedition guard (DEFERGUARD=1)');

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
function trustOf(Game, vid) {
  try { return (((Game.state || {}).village || {}).trust || {})[vid]; } catch (e) { return undefined; }
}
function partyAdd(Game, vid) {
  try { const ps = Game.partyState(); ps.party = ps.party || []; if (!ps.party.includes(vid)) ps.party.push(vid); return true; }
  catch (e) { return false; }
}

async function newGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'deferguard-proof' });
  await setupGame(Game);
  return Game;
}

async function main() {
  process.env.VETREL = '1';
  process.env.REPOSITION = '1';
  process.env.NODEWITNESS = '1';
  process.env.FEASTSCALE_R13 = '1';
  process.env.TRIBFLOOR = '1';
  process.env.SUCCGRACE = '1';
  process.env.RAIDDENSITY = '1';
  process.env.SEATDRIVE = '0';
  process.env.DEFERGUARD = '1'; // gate ON for mechanism fixtures; det-gate toggles it off

  console.log('== (a) MECHANISM fixtures ==');
  // A. invite guard: window open — veteran refused, non-veteran passes through
  {
    const Game = await newGame(9301);
    const vet = pickVillager(Game); makeVeteran(Game, vet);
    let civ = null;
    try {
      const roster = ((Game.state.village || {}).roster || []).filter(id => id && id !== Game.villagerId);
      for (const id of roster) { if (id !== vet) { let vp = null; try { vp = Game.vpOf(id); } catch (e) {} if (vp && !vp.dead) { civ = id; break; } } }
    } catch (e) {}
    check('fixture has veteran + civilian', !!(vet && civ), '');
    const t0 = trustOf(Game, vet);
    const restoreDefer = stubDeferral(Game, { wave: 4, deferred: true, grandfathered: false, raw: 120, threshold: 100 });
    const cap = captureSay(Game);
    const ctx = {};
    const origInvite = Game.inviteToParty;
    let sawRefusal = false;
    DG.withInviteGuard(Game, ctx, () => {
      const r = Game.inviteToParty(vet);
      sawRefusal = !!(r && !r.ok && /held home|wave/i.test(r.msg || ''));
      check('veteran invite refused during open window', sawRefusal, JSON.stringify(r && r.msg));
      check('no trust hit on refused invite', trustOf(Game, vet) === t0, `before=${t0} after=${trustOf(Game, vet)}`);
      check('guard beat said aloud', cap.lines.some(l => /stays home|proven fighters/i.test(l)),
        cap.lines.slice(0, 2).join(' ').slice(0, 140));
      // non-veteran passes through to the real verb (identical result to orig)
      let rc = null, ro = null;
      try { rc = Game.inviteToParty(civ); } catch (e) { rc = { err: 1 }; }
      Game.inviteToParty = origInvite;
      try { ro = Game.inviteToParty(civ); } catch (e) { ro = { err: 1 }; }
      check('non-veteran invite passes through to the real verb',
        (rc && ro && !!rc.ok === !!ro.ok) || (rc && ro && rc.err && ro.err),
        `guarded=${JSON.stringify(rc && rc.ok)} orig=${JSON.stringify(ro && ro.ok)}`);
    });
    check('inviteToParty restored after guard', Game.inviteToParty === origInvite, '');
    check('invite-block telemetry counted', (ctx.dgInviteBlocks | 0) >= 1, `dgInviteBlocks=${ctx.dgInviteBlocks}`);
    cap.restore(); restoreDefer();
  }
  // B. standDown: veteran in party + window open => dismissed via the real verb
  {
    const Game = await newGame(9302);
    const vet = pickVillager(Game); makeVeteran(Game, vet);
    check('fixture veteran placed in party', partyAdd(Game, vet), '');
    const t0 = trustOf(Game, vet);
    const restoreDefer = stubDeferral(Game, { wave: 4, deferred: true, grandfathered: false, raw: 150, threshold: 100 });
    const cap = captureSay(Game);
    const ctx = {};
    const n = DG.standDown(Game, ctx);
    let inParty = true;
    try { inParty = Game.partyMembers().includes(vet); } catch (e) {}
    check('party veteran stood down during open window', n === 1 && !inParty, `n=${n} inParty=${inParty}`);
    check('dismissal cost the real trust -8', trustOf(Game, vet) === (t0 === undefined ? -8 : t0 - 8),
      `before=${t0} after=${trustOf(Game, vet)}`);
    check('stand-down reason said aloud', cap.lines.some(l => /holds Haven|alive, not out there/i.test(l)),
      cap.lines.slice(0, 3).join(' ').slice(0, 160));
    check('dismissal telemetry recorded', (ctx.dgDismissals || []).length === 1, JSON.stringify(ctx.dgDismissals));
    cap.restore(); restoreDefer();
  }
  // C. window closed => no block, no stand-down
  {
    const Game = await newGame(9303);
    const vet = pickVillager(Game); makeVeteran(Game, vet);
    partyAdd(Game, vet);
    const restoreDefer = stubDeferral(Game, { wave: 4, deferred: false, grandfathered: false, raw: 60, threshold: 100 });
    const ctx = {};
    const n = DG.standDown(Game, ctx);
    let inParty = false;
    try { inParty = Game.partyMembers().includes(vet); } catch (e) {}
    check('no stand-down when window closed', n === 0 && inParty, `n=${n}`);
    DG.withInviteGuard(Game, ctx, () => {
      const r = Game.inviteToParty(vet);
      check('no invite-block when window closed', !(r && !r.ok && /held home/i.test(r.msg || '')), JSON.stringify(r && r.msg));
    });
    check('no telemetry when window closed', !ctx.dgInviteBlocks && !ctx.dgDismissals, '');
    restoreDefer();
  }
  // D. the scholar is never a qualifying veteran
  {
    const Game = await newGame(9304);
    makeVeteran(Game, Game.villagerId);
    check('scholar excluded from qualifying veterans', !DG.qualifyingVeteran(Game, Game.villagerId), '');
  }
  // E. gate off => pure delegation (no wrap installed, no dismiss)
  {
    delete process.env.DEFERGUARD;
    const Game = await newGame(9305);
    const vet = pickVillager(Game); makeVeteran(Game, vet);
    partyAdd(Game, vet);
    const restoreDefer = stubDeferral(Game, { wave: 4, deferred: true, grandfathered: false, raw: 150, threshold: 100 });
    const before = Game.inviteToParty;
    const ctx = {};
    deferguardLead.daily(Game, ctx);
    check('gate-off daily does not install the invite wrap', Game.inviteToParty === before, '');
    let inParty = false;
    try { inParty = Game.partyMembers().includes(vet); } catch (e) {}
    check('gate-off daily does not stand anyone down', inParty, '');
    check('gate-off daily leaves ctx untouched', !ctx.dgInviteBlocks && !ctx.dgDismissals && !ctx.dgWindowDays, '');
    restoreDefer();
    process.env.DEFERGUARD = '1';
  }

  console.log('== (b) DET-GATE (gate off => byte-identical to vetrel) ==');
  {
    const seeds = [9311, 9312];
    let green = 0;
    for (const seed of seeds) {
      for (const [pid, pol] of [['vetrel-lead', vetrelLead], ['deferguard-lead', deferguardLead]]) {
        delete process.env.DEFERGUARD;
        const { Game } = await loadGame({ seed, mode: 'deferguard-det' });
        await setupGame(Game);
        const hashes = [];
        const wrapped = Object.assign({}, pol, {
          daily(G, ctx) {
            hashes.push(G.state.scholar.day + ':' + dayHash(G));
            return pol.daily(G, ctx);
          },
        });
        await quietLog(async () => runDays(Game, wrapped, { days: 60 }));
        global._detHashes = global._detHashes || {};
        global._detHashes[`${pid}-s${seed}`] = hashes.join('\n');
      }
      const a = global._detHashes[`vetrel-lead-s${seed}`];
      const b = global._detHashes[`deferguard-lead-s${seed}`];
      const same = a === b;
      if (same) green++;
      check(`gate-off byte-identical [seed ${seed}]`, same, same ? '' : 'trajectories diverged');
    }
    check('det-gate all green', green === seeds.length, `${green}/${seeds.length}`);
  }

  console.log('== (c) SMOKE (gate on, short run) ==');
  {
    process.env.DEFERGUARD = '1';
    const { Game } = await loadGame({ seed: 9321, mode: 'deferguard-smoke' });
    await setupGame(Game);
    let err = null;
    try {
      await quietLog(async () => runDays(Game, deferguardLead, { days: 45 }));
    } catch (e) { err = e; }
    check('45d gate-on run completes without errors', !err, err && String(err.message).slice(0, 120));
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('FATAL', e); process.exit(2); });
