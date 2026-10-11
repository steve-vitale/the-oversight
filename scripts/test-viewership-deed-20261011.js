#!/usr/bin/env node
// test-viewership-deed-20261011.js — proof: viewership is deed-reactive, not
// pantry-reactive (longsim travel 2026-10-11, docs/SCALE.md "season+ of being
// worth watching"). Before: havenViewership() froze a first-read base of
// pantryKcal/2000 + codexBreadth*1.5 + arc*5 + showmanship — a fat pantry put
// the 40 global bar in reach by day 2-7. After: init = arc*5 + showmanship +
// min(15, codexBreadth*0.5); pantry never feeds fame; ledger showmanship feeds
// live via _viewShoMark; the sticky pool still carries spikes/spends.
// Run: SEED=42 node scripts/test-viewership-deed-20261011.js (also 7, 99)
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEED = parseInt(process.env.SEED || '42', 10);
const { loadGame, setupGame } = require('./sim-harness');

let failures = 0;
function ok(cond, label) {
  if (cond) console.log(`  PASS ${label}`);
  else { failures++; console.log(`  FAIL ${label}`); }
}

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'viewdeed', fullTelemetry: false });
  await setupGame(Game);
  const v = Game.state.village;

  // 1. fresh read: small, and equals the deed formula exactly
  const pg = Game.progState();
  const sho0 = (Game.ledger().showmanship || 0);
  const cx0 = Game.codexBreadth();
  const expected = Math.max(12, (pg.arc || 1) * 5 + Math.min(20, sho0) + Math.min(15, cx0 * 0.5));
  const first = Game.havenViewership();
  ok(first === expected, `fresh viewership equals deed formula (${first} === ${expected}; arc=${pg.arc} sho=${sho0} cx=${cx0})`);
  ok(first < 20, `fresh viewership is small, not near the 40 bar (${first})`);

  // 2. a fat pantry does NOT feed fame (the old bug: pantryKcal/2000)
  v.pantryKcal = 200000;
  ok(Game.havenViewership() === first, `pantry 200,000 kcal does not move viewership (${Game.havenViewership()})`);

  // 3. codex breadth is capped: flood the codex, re-init, contribution <= 15
  const cx = Game.state.codex || (Game.state.codex = {});
  cx.plants = cx.plants || {};
  for (let i = 0; i < 200; i++) cx.plants['testplant' + i] = { level: 2 };
  v.viewership = null; v._viewShoMark = null;
  const capped = Game.havenViewership();
  const expectedCap = Math.max(12, (Game.progState().arc || 1) * 5 + Math.min(20, Game.ledger().showmanship || 0) + 15);
  ok(capped === expectedCap, `200 codex entries still cap at 15 (${capped} === ${expectedCap})`);

  // 4. ledger showmanship feeds LIVE (the canon driver that was dead code)
  const before = Game.havenViewership();
  Game.ledgerAdd('showmanship', 5);
  ok(Game.havenViewership() === before + 5, `showmanship +5 feeds viewership live (${before} -> ${Game.havenViewership()})`);
  ok(Game.havenViewership() === before + 5, 'showmanship is not double-counted on re-read');

  // 5. recordMoment still +1 (canon: big plays get watched)
  const b2 = Game.havenViewership();
  Game.recordMoment('test moment');
  ok(Game.havenViewership() === b2 + 1, 'recordMoment still +1');

  // 6. spends bite and nothing refills: set 45, decline-style -10 sticks
  v.viewership = 45;
  ok(Game.havenViewership() === 45, 'explicit 45 is preserved (sticky pool)');
  v.viewership = 35; // as a decline would leave it
  ok(Game.havenViewership() === 35, 'spends are not refilled by the formula (35 stays 35)');

  // 7. the global bar reads the same number: 45 stages, 12 does not.
  // Build a REAL polity (3 subordinates, Haven primary) — faking nationalLive
  // with no polity is revoked aloud by design (break-it regional r4).
  while (Game.state.otherVillages.filter(v => v && v.id !== 'haven').length < 4) {
    const base = Game.state.otherVillages.filter(v => v && v.id !== 'haven');
    const t = Object.assign({}, base[base.length - 1]);
    const n = base.length;
    t.id = 'village_vd' + n; t.name = 'Viewmere' + n; t.x = (t.x + 3 * n) % 9; t.generated = false;
    Game.state.otherVillages.push(t);
  }
  const ovs = Game.state.otherVillages.filter(v => v && v.id !== 'haven');
  ovs.forEach(vv => { vv.generated = true; });
  const [vA, vB, vC] = ovs;
  ok(!!Game._formLink(vA.id, { asSubordinate: false, tributeKcalPerWeek: 4000 }, null), 'link 1 forms (Haven primary)');
  ok(!!Game._formLink(vB.id, { asSubordinate: false, tributeKcalPerWeek: 4000 }, null), 'link 2 forms (Haven primary)');
  ok(!!Game._formLink(vC.id, { asSubordinate: false, tributeKcalPerWeek: 4000 }, null), 'link 3 forms (Haven primary)');
  ok(!!Game.polityOf('haven'), 'real polity qualifies (primary of 3)');
  Game.state.nationalLive = true;
  Game.state.pendingGlobal = null; Game.state.globalLive = false;
  v.viewership = 45;
  Game.hierarchyDaily();
  ok(!!Game.state.pendingGlobal, 'viewership 45 + national stages The Watchers');
  Game.state.pendingGlobal = null; Game.state.globalLive = false;
  v.viewership = 12;
  Game.hierarchyDaily();
  ok(!Game.state.pendingGlobal, 'viewership 12 + national does NOT stage The Watchers');

  // 8. viewershipBoard still works and shows the number
  const lb = Game.viewershipBoard();
  ok(Array.isArray(lb) && lb.length > 0 && lb.some(r => r.us), 'viewershipBoard intact');

  console.log(failures === 0 ? 'ALL PASS' : failures + ' FAILURES');
  process.exit(failures === 0 ? 0 : 1);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
