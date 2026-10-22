#!/usr/bin/env node
// test-tabledeed-20261021.js — proof test for arm sim-tabledeed-voice
// (backlog #738: the table's audit fiction never voices wave-4/5 deeds).
//
// GATES (all must be GREEN):
//   E0 shape — tableDeedRecords/tableDeedLines exist, return sane shapes.
//   E1 RED->GREEN on fixtures:
//        F1 audit beat with logged w4 deeds -> voices them BY NAME
//           (monster name, killer, day);
//        F2 no war content -> [] (stays silent);
//        F3 a NON-logged deed claim (unknown mid) -> never voiced,
//           never counted.
//   E2 det-gate — identical fixtures -> identical lines; the call makes
//        zero state writes (state JSON byte-identical before/after).
//   E3 static audit — the src diff is confined to the audit-beat path
//        (table.js audit-beat methods + this test + evidence only).
//
// Usage: node scripts/test-tabledeed-20261021.js
// The RED half is run by checking out base table.js (git checkout --
// src/js/table.js after stashing the fixed copy) and re-running: F1 must
// fail with "tableDeedLines is not a function".
'use strict';
const { execSync } = require('child_process');
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');

let fails = 0;
function ok(cond, name, extra) {
  if (cond) { console.log(`  ok   ${name}`); }
  else { fails++; console.log(`  FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}

// Build a fixture game. opts: {kills:[{mid,day,by,via,w}], faced:{mid:wave},
// titans:{omens,slain,cast}, slainMids:[mid] (codex), readinessReady:bool}
async function fixtureGame(opts) {
  opts = opts || {};
  const { Game } = await loadGame({ seed: 424242, mode: 'tabledeed-fixture', fullTelemetry: false });
  await setupGame(Game);
  Game.state.systemArrived = true;
  const roster = (Game.state.village && Game.state.village.roster) || [];
  const vid = (roster.find(x => x && x !== Game.villagerId)) || 'v_1';
  Game.state.waveKillLog = (opts.kills || []).map(k => ({
    d: k.day, mid: k.mid, w: k.w || 4, by: k.by === 'AUTO' ? vid : (k.by || 'player'), via: k.via || 'companion', trick: null,
  }));
  Game.state.codex = Game.state.codex || {};
  Game.state.codex.monsters = {};
  for (const m of (opts.slainMids || [])) Game.state.codex.monsters[m] = { stage: 'slain' };
  const sch = Game.state.scholar || {};
  sch.prog = sch.prog || {};
  sch.prog.deeds = { wavesFaced: opts.faced || {} };
  sch.prog.tableSittingId = 1;
  Game.state.titans = {
    omens: (opts.titans && opts.titans.omens) || {},
    musters: {},
    slain: (opts.titans && opts.titans.slain) || {},
    cast: (opts.titans && opts.titans.cast) || null,
  };
  if (opts.readinessReady) {
    Game.waveUnlockReady = () => ({ wave: 4, ready: true, armored: 0, armed: 0, tricks: 0, veterans: 0, demand: null, short: [] });
  }
  return { Game, vid };
}

(async () => {
  console.log('== E0 shape ==');
  {
    const { Game } = await fixtureGame({});
    ok(typeof Game.tableDeedRecords === 'function', 'tableDeedRecords exists');
    ok(typeof Game.tableDeedLines === 'function', 'tableDeedLines exists');
    const rec = Game.tableDeedRecords();
    ok(rec && Array.isArray(rec.kills) && Array.isArray(rec.engagements)
      && Array.isArray(rec.titans) && Array.isArray(rec.bars), 'record shape {kills,engagements,titans,bars}');
    const lines = Game.tableDeedLines();
    ok(Array.isArray(lines), 'lines is an array');
  }

  console.log('== E1 fixtures ==');
  // F1: logged w4 deeds -> voiced by name, killer, day.
  {
    const { Game, vid } = await fixtureGame({
      kills: [
        { mid: 'congregation', day: 140, by: 'player', via: 'player' },
        { mid: 'strike', day: 152, by: 'AUTO', via: 'companion' },
      ],
      faced: { congregation: 4, audit: 4 },
      titans: { omens: { herald: { stage: 2, day: 120, warned: {} } }, slain: {}, cast: { herald: 'herald', apocalypse: 'finale' } },
      slainMids: ['congregation', 'strike'],
    });
    const rec = Game.tableDeedRecords();
    ok(rec.kills.length === 2, 'F1 records 2 kills from the log', JSON.stringify(rec.kills.length));
    ok(rec.engagements.length === 1 && rec.engagements[0].mid === 'audit', 'F1 records 1 engagement (audit, fought not killed)');
    ok(rec.titans.length === 1 && rec.titans[0].tid === 'herald' && rec.titans[0].state === 'faced',
      'F1 records the herald encounter (faced, located)');
    const lines = Game.tableDeedLines();
    const joined = lines.join(' ');
    const mCong = Game.monsterNoun('congregation');
    const mStrike = Game.monsterNoun('strike');
    ok(lines.length >= 1, 'F1 voices >=1 line', 'got ' + lines.length);
    ok(joined.includes(mCong), `F1 names the monster (${mCong})`);
    ok(joined.includes(mStrike), `F1 names the monster (${mStrike})`);
    ok(joined.includes('day 140'), 'F1 names the kill day (140)');
    ok(joined.includes('day 152'), 'F1 names the kill day (152)');
    ok(joined.includes('you'), 'F1 names the player killer (you)');
    ok(joined.includes(Game.disp(vid)), `F1 names the villager killer (${Game.disp(vid)})`);
    ok(/THE HERALD|herald/i.test(joined), 'F1 voices the herald encounter');
    console.log('  F1 line0: ' + (lines[0] || '').slice(0, 220));
  }
  // F2: no war content -> silence.
  {
    const { Game } = await fixtureGame({ readinessReady: true });
    const rec = Game.tableDeedRecords();
    ok(rec.kills.length === 0 && rec.engagements.length === 0 && rec.titans.length === 0 && rec.bars.length === 0,
      'F2 records nothing');
    ok(Game.tableDeedLines().length === 0, 'F2 stays silent ([])');
  }
  // F3: a NON-logged deed claim (unknown mid) is never voiced, never counted.
  {
    const { Game } = await fixtureGame({
      kills: [{ mid: 'fakemonzz', day: 140, by: 'player', via: 'player', w: 5 }],
      faced: { fakemonzz: 5 },
      slainMids: [],
      readinessReady: true,
    });
    const rec = Game.tableDeedRecords();
    ok(rec.kills.length === 0, 'F3 records no kills for the unknown mid');
    ok(rec.engagements.length === 0, 'F3 records no engagements for the unknown mid');
    const joined = Game.tableDeedLines().join(' ');
    ok(!joined.includes('fakemonzz'), 'F3 never voices the unknown mid');
    ok(Game.tableDeedLines().length === 0, 'F3 stays fully silent');
  }

  // F4: no kills, but an unready wave-4 bar -> the beat still opens (header
  // + bar readout), naming no monsters it cannot join to a log.
  {
    const { Game } = await fixtureGame({});
    const rec = Game.tableDeedRecords();
    ok(rec.kills.length === 0 && rec.bars.length > 0, 'F4 records only the unready bars');
    const lines = Game.tableDeedLines();
    const joined = lines.join(' ');
    ok(lines.length >= 1 && /THE WAR PATH/.test(joined), 'F4 opens THE WAR PATH beat');
    ok(/wave-4 bar reads/.test(joined), 'F4 voices the readiness bar as it stood');
    console.log('  F4 line0: ' + (lines[0] || '').slice(0, 200));
  }

  // F5: a titan fought in a regular engagement is named ONCE (by the titan
  // block), not twice.
  {
    const { Game } = await fixtureGame({
      kills: [],
      faced: { herald: 4, suburb: 4 },
      titans: { omens: { herald: { stage: 2, day: 76, warned: {} } }, slain: {}, cast: { herald: 'herald', apocalypse: 'finale' } },
      slainMids: [],
      readinessReady: true,
    });
    const rec = Game.tableDeedRecords();
    ok(rec.titans.length === 1 && rec.titans[0].tid === 'herald', 'F5 records the herald titan');
    ok(rec.engagements.length === 1 && rec.engagements[0].mid === 'suburb', 'F5 skips the titan mid in engagements (no double-naming)');
    const joined = Game.tableDeedLines().join(' ');
    const heraldNames = (joined.match(/HERALD/gi) || []).length;
    ok(heraldNames === 1, `F5 names the herald exactly once (got ${heraldNames})`);
  }

  console.log('== E2 det-gate ==');
  // Identical fixtures -> identical lines; zero state writes.
  {
    const mk = () => fixtureGame({
      kills: [
        { mid: 'congregation', day: 140, by: 'player', via: 'player' },
        { mid: 'strike', day: 152, by: 'player', via: 'player' },
      ],
      faced: { congregation: 4 },
      titans: { omens: { herald: { stage: 1, day: 100, warned: {} } }, slain: {}, cast: { herald: 'herald', apocalypse: 'finale' } },
      slainMids: ['congregation', 'strike'],
    });
    const a = await mk(), b = await mk();
    const la = JSON.stringify(a.Game.tableDeedLines());
    const lb = JSON.stringify(b.Game.tableDeedLines());
    ok(la === lb, 'E2 identical fixtures -> identical lines');
    const before = JSON.stringify(a.Game.state);
    a.Game.tableDeedLines();
    const after = JSON.stringify(a.Game.state);
    ok(before === after, 'E2 zero state writes (state JSON byte-identical before/after)');
    // The framing pick must be a dedicated stream: 5 calls, same output.
    const outs = new Set();
    for (let i = 0; i < 5; i++) outs.add(JSON.stringify(a.Game.tableDeedLines()));
    ok(outs.size === 1, 'E2 framing pick stable across calls (dedicated stream)');
  }

  console.log('== E3 static audit ==');
  {
    const stat = execSync('git diff --stat -- src scripts evidence', { cwd: path.join(__dirname, '..') }).toString();
    const files = stat.split('\n').map(l => l.trim().split(/\s+/).pop()).filter(f => f && f.includes('.'));
    const allowed = new Set(['src/js/table.js', 'scripts/test-tabledeed-20261021.js']);
    const evOk = files.every(f => allowed.has(f) || f.startsWith('evidence/2026-10-21/'));
    ok(evOk, 'E3 changed files confined to table.js + test + 2026-10-21 evidence', JSON.stringify(files));
    const diff = execSync('git diff -- src/js/table.js', { cwd: path.join(__dirname, '..') }).toString();
    const hunks = diff.split(/^@@/m).slice(1);
    const touchedFns = new Set();
    for (const h of hunks) {
      for (const m of h.matchAll(/^[-+]\s*(table\w+|_\w+)\s*\(/gm)) touchedFns.add(m[1]);
    }
    // r20 (2026-10-22): tableWithdrawLine is the withdrawal-honesty voicing
    // (pure string builder, no state writes — same class as tableSeatLine).
    const auditFns = new Set(['tableDeedRecords', 'tableDeedLines', 'tableScene', 'tableWithdrawLine']);
    const stray = [...touchedFns].filter(f => !auditFns.has(f) && !f.startsWith('_'));
    ok(stray.length === 0, 'E3 no combat/economy/AI functions touched', JSON.stringify(stray));
  }

  console.log(fails ? `\nRESULT: ${fails} FAILURE(S)` : '\nRESULT: ALL GATES GREEN');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('PROOF CRASH:', e); process.exit(2); });
