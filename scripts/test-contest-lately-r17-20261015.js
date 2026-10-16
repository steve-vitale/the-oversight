#!/usr/bin/env node
// test-contest-lately-r17-20261015.js — proof for the r17 show-memory fix.
// RED (pre-fix): fireContest plants no village memory; t2LatelyEvent never
// returns kind 'show'; a televised grab is conversationally invisible.
// GREEN (post-fix): lastContest planted; participant + bystander get
// kind 'show' within 7 days; t2gen_lately emits show lines; window expires.
// Run: node scripts/test-contest-lately-r17-20261015.js (seeds 7, 42, 99)
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { oracleV2 } = require('./policies/oracleV2');
const SEEDS = [7, 42, 99];

function dayOf(Game) { try { return Game.state.scholar.day || 0; } catch (e) { return 0; } }
function livingRoster(Game) {
  const v = Game.state.village || {};
  return (v.roster || []).filter(id => { try { const vp = Game.vpOf(id); return vp && !vp.dead; } catch (e) { return true; } });
}

async function one(seed) {
  const fails = [];
  const ok = (cond, msg) => { if (!cond) fails.push(msg); console.log((cond ? '  PASS ' : '  FAIL ') + msg); };
  const { Game } = await loadGame({ seed, mode: 'test-contest-lately', fullTelemetry: true });
  await setupGame(Game);
  // Minimal setup: jump to day 15 (contest eligibility needs day 14+) on a
  // fresh village with no deaths — isolates the show scan from grief/mantle.
  try { Game.state.scholar.day = 15; } catch (e) {}
  const d0 = dayOf(Game);
  const roster = livingRoster(Game).filter(id => id !== Game.villagerId);
  ok(roster.length >= 2, `seed ${seed}: 2+ villagers to cast (have ${roster.length})`);
  if (roster.length < 2) return fails;

  // fire a REAL contest through the real path
  const before = (Game.state.village || {}).lastContest;
  Game.fireContest({ id: 'duel', name: 'Duel', participants: 2 });
  const lc = (Game.state.village || {}).lastContest;
  // (no grief/mantle to clear: fresh village, day 15, no deaths)  ok(!!lc && lc !== before, `seed ${seed}: lastContest planted by fireContest`);
  ok(lc && lc.name === 'Duel', `seed ${seed}: lastContest carries the contest name`);
  ok(lc && (lc.day || 0) === d0, `seed ${seed}: lastContest day = fire day (${d0})`);
  const ids = (lc && lc.ids) || [];
  ok(ids.length >= 1, `seed ${seed}: lastContest records the cast (${ids.length})`);

  // participant + bystander both see kind 'show'
  const partId = ids.find(id => id !== 'player' && roster.includes(id));
  const byId = roster.find(id => id !== partId && !ids.includes(id));
  let evP = null, evB = null;
  try { evP = partId ? Game.t2LatelyEvent(partId) : null; } catch (e) {}
  try { evB = byId ? Game.t2LatelyEvent(byId) : null; } catch (e) {}
  ok(evP && evP.kind === 'show', `seed ${seed}: participant latelyKind=show (got ${evP && evP.kind})`);
  ok(evB && evB.kind === 'show', `seed ${seed}: bystander latelyKind=show (got ${evB && evB.kind})`);
  ok(evP && evP.self === true, `seed ${seed}: participant event is self-marked`);
  ok(evB && !evB.self, `seed ${seed}: bystander event is not self-marked`);

  // lines exist and name the contest
  let linesP = [], linesB = [];
  try { linesP = partId ? Game.t2gen_lately(partId) : []; } catch (e) {}
  try { linesB = byId ? Game.t2gen_lately(byId) : []; } catch (e) {}
  ok(linesP.length > 0 && linesP.join(' ').includes('Duel'), `seed ${seed}: participant lately lines name the contest`);
  ok(linesB.length > 0 && linesB.join(' ').includes('Duel'), `seed ${seed}: bystander lately lines name the contest`);
  if (linesP.length) console.log(`    e.g. participant: ${linesP[0].slice(0, 90)}...`);
  if (linesB.length) console.log(`    e.g. bystander: ${linesB[0].slice(0, 90)}...`);

  // window expires: 8 days later, no more 'show'
  try { Game.state.scholar.day = d0 + 8; } catch (e) {}
  let evP2 = null;
  try { evP2 = partId ? Game.t2LatelyEvent(partId) : null; } catch (e) {}
  ok(!evP2 || evP2.kind !== 'show', `seed ${seed}: show window expired after 7d (now ${evP2 && evP2.kind})`);
  return fails;
}

(async () => {
  let fails = [];
  for (const s of SEEDS) {
    console.log(`-- seed ${s} --`);
    fails = fails.concat(await one(s));
  }
  if (fails.length) { console.error(`\n${fails.length} FAILURES`); process.exit(1); }
  console.log('\nALL GREEN');
})().catch(e => { console.error('FATAL', e); process.exit(1); });
