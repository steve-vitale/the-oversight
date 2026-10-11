#!/usr/bin/env node
// test-agency-lever-20261011.js — proof for longsim lever 3 (villager agency).
// Proves, on fixed seeds, each change in the agency commit set:
//   L1 lever: teachable plant-lesson cadence is every 2nd plant discovery
//      (invariant: entries created === floor(plants discovered / 2))
//   H1 honesty: 'taught' deed + teaching trust fire ONLY when a lesson lands
//   H2 honesty: no-lesson ask records nothing and bumps nothing
//   T1 transcript: agency turns push you/them beats into the convo transcript
//   T2 no-repeat: three asks in a row never speak the same line twice
//      (sayLine's per-convo + run-wide ledgers; specific plant/monster lines)
//   C1 chores: objPick never leaves a stale chore tag on a non-chore objective
// Run: node scripts/test-agency-lever-20261011.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log(`ok   ${name}`); }
  else { fail++; console.log(`FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}
function freshIds(Game, n) {
  const v = Game.state.village || {};
  return (v.roster || []).filter(id => id !== Game.villagerId).slice(0, n);
}

(async () => {
  // ============ L1: lever cadence ============
  {
    const { Game } = await loadGame({ seed: 424242, mode: 'lever' });
    await setupGame(Game);
    const vid = freshIds(Game, 1)[0];
    const a = Game.agencyOf(vid);
    const st = Game.agencyState();
    st.teachable[vid] = [];
    a.know[vid].plants = 0;
    // expeditionSign draws its own rolls; the %2 invariant must hold exactly
    // regardless of which branch each roll takes.
    for (let i = 0; i < 300; i++) { try { Game.expeditionSign(vid, 3); } catch (e) {} }
    const plants = a.know[vid].plants;
    const entries = (st.teachable[vid] || []).length;
    ok('L1 entries === floor(plants/2) (%2 cadence)',
      entries === Math.floor(plants / 2),
      `plants=${plants} entries=${entries} expected=${Math.floor(plants / 2)}`);
    ok('L1 lever creates entries at all (baseline starved)', entries > 5, `entries=${entries}`);
  }

  // ============ H1/H2/T1/T2: agencyTurn honesty + transcript + no-repeat ============
  {
    const { Game } = await loadGame({ seed: 777, mode: 'honesty' });
    await setupGame(Game);
    const vid = freshIds(Game, 1)[0];
    const st = Game.agencyState();
    const a = Game.agencyOf(vid);
    // reset agency knowledge: no lessons possible
    a.know[vid] = { plants: 0, monsters: 0, places: [], fought: [] };
    st.teachable[vid] = [];
    const v = Game.state.village;
    v.explorerNews = v.explorerNews || {};
    v.explorerNews[vid] = { day: 1, agency: true, dist: 4 };
    const trustBefore = ((v.trust || {})[vid] || 0);
    const deedsBefore = (st.ach || []).filter(d => d.vid === vid && d.type === 'taught').length;
    const r0 = Game.agencyTurn(vid, 'agency:ask_expedition');
    ok('H2 no-lesson ask returns a line (weather fallback)', !!(r0 && r0.line), JSON.stringify(r0 && r0.line));
    const taughtAfter = (st.ach || []).filter(d => d.vid === vid && d.type === 'taught').length;
    ok('H2 no-lesson ask records no taught deed', taughtAfter === deedsBefore, `before=${deedsBefore} after=${taughtAfter}`);
    ok('H2 no-lesson ask bumps no teaching trust', ((v.trust || {})[vid] || 0) === trustBefore,
      `before=${trustBefore} after=${(v.trust || {})[vid]}`);

    // now give them a real lesson: one teachable entry
    st.teachable[vid] = [{ topic: 'plants', day: 1 }];
    v.explorerNews[vid] = { day: 2, agency: true, dist: 4 };
    const r1 = Game.agencyTurn(vid, 'agency:ask_expedition');
    ok('H1 lesson ask returns a line', !!(r1 && r1.line), JSON.stringify(r1 && r1.line));
    const taughtAfter1 = (st.ach || []).filter(d => d.vid === vid && d.type === 'taught').length;
    ok('H1 lesson ask records exactly one taught deed', taughtAfter1 === taughtAfter + 1,
      `before=${taughtAfter} after=${taughtAfter1}`);
    ok('H1 lesson ask bumps trust by exactly 2', ((v.trust || {})[vid] || 0) === trustBefore + 2,
      `trust=${(v.trust || {})[vid]} expected=${trustBefore + 2}`);
    ok('H1 plant lesson spent the entry (declining)', (st.teachable[vid] || []).length === 0);
    const taughtPlants = Object.values((Game.state.codex || {}).plants || {}).filter(p => p && p.source === 'taught').length;
    ok('H1 plant landed in codex with taught source', taughtPlants === 1, `taught=${taughtPlants}`);

    // T1: transcript has you + them beats
    let tr = [];
    try { tr = ((v.conv || {})[vid] || {}).transcript || []; } catch (e) {}
    const youBeats = tr.filter(e => e.who === 'you');
    const themBeats = tr.filter(e => e.who === 'them');
    ok('T1 transcript records the player question', youBeats.length >= 1, `you=${youBeats.length}`);
    ok('T1 transcript records the teaching reply', themBeats.length >= 1, `them=${themBeats.length}`);
    ok('T1 returned line matches a transcript them-beat',
      themBeats.some(e => String(e.text).slice(0, 60) === String(r1.line).slice(0, 60)),
      `line=${String(r1.line).slice(0, 80)}`);

    // T2: no verbatim repeats across three asks (entry spent; monster lesson
    // armed for the second ask so it speaks a specific species line)
    a.know[vid].fought = ['hushwolf'];
    v.explorerNews[vid] = { day: 3, agency: true, dist: 4 };
    const r2 = Game.agencyTurn(vid, 'agency:ask_expedition');
    v.explorerNews[vid] = { day: 4, agency: true, dist: 4 };
    const r3 = Game.agencyTurn(vid, 'agency:ask_expedition');
    ok('T2 ask2 (monster lesson) line differs from ask1 (plant lesson)',
      r2 && r2.line && r2.line !== r1.line,
      `ask1=${String(r1.line).slice(0, 60)} ask2=${String(r2 && r2.line).slice(0, 60)}`);
    const speciesName = (() => { try { return Game.monsterDisplayName('hushwolf'); } catch (e) { return 'hushwolf'; } })();
    ok('T2 ask2 names the taught species (knowledge-gated display name)',
      r2 && r2.line && String(r2.line).indexOf(speciesName) !== -1,
      `ask2=${String(r2 && r2.line).slice(0, 100)} species=${speciesName}`);
    ok('T2 ask3 never repeats a spoken line verbatim',
      r3 && r3.line && r3.line !== r1.line && r3.line !== r2.line,
      `ask3=${String(r3 && r3.line).slice(0, 80)}`);
  }

  // ============ C1: chore tag clearing ============
  {
    const { Game } = await loadGame({ seed: 31337, mode: 'chore' });
    await setupGame(Game);
    const ids = freshIds(Game, 4);
    const v = Game.state.village;
    const hx = v.px ?? 4, hy = v.py ?? 4;
    let checked = 0, violations = 0;
    for (const vid of ids) {
      for (let i = 0; i < 25; i++) {
        try {
          const o = Game.objPick(vid, hx, hy);
          checked++;
          if (o.kind !== 'HAVEN_CHORE' && o.chore) violations++;
        } catch (e) {}
      }
    }
    ok('C1 no stale chore tag on non-chore objectives', violations === 0, `violations=${violations}/${checked}`);
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS FAILURE:', e && e.message); process.exit(2); });
