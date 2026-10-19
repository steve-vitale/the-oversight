#!/usr/bin/env node
// test-others-pronoun-20261018.js -- PROOF TEST (journey-social r26).
// t2fol_others "was a {occupation}, before" line hardcoded "they handle
// things" even for she/her villagers ("Camila was a police officer,
// before. You can still see it — the way they handle things." —
// transcript-caught 2026-10-18, s1902-deep-2).
// GREEN = the line agrees with the subject's own pronouns.
'use strict';
process.env.TRIBFLOOR = '1';
const { loadGame, setupGame } = require('./sim-harness');
const safe = (fn, d) => { try { return fn(); } catch (e) { return d; } };

async function main() {
  const { Game } = await loadGame({ seed: 4242, mode: 'others-pronoun-proof' });
  await setupGame(Game);
  const sid = Game.villagerId;
  const roster = (Game.state.village.roster || []).filter(id => id !== sid);
  // find a she-pronoun and a he-pronoun villager
  let she = null, he = null;
  for (const id of roster) {
    const vp = safe(() => Game.vpOf(id), {});
    const pro = safe(() => Game.t2pro(vp, id), 'they');
    if (!she && pro === 'she') she = id;
    if (!he && pro === 'he') he = id;
    if (she && he) break;
  }
  if (!she || !he) { console.log('SKIP: no she/he pair found in roster'); process.exit(2); }
  console.log(`she=${safe(() => Game.displayName(she), she)} he=${safe(() => Game.displayName(he), he)}`);
  const talker = roster.find(id => id !== she && id !== he);
  Game.startConvo(talker);
  const c = Game.convoGet(talker);
  let fails = 0;
  for (const [oid, pro, want] of [[she, 'she', 'she handles'], [he, 'he', 'he handles']]) {
    c.t2other = oid;
    // force a formerOccupation so the occupation line is in the pool
    const vp = Game.vpOf(oid) || {};
    const had = vp.formerOccupation;
    vp.formerOccupation = 'police officer';
    const fns = Game.t2fol_others(talker);
    if (had === undefined) delete vp.formerOccupation; else vp.formerOccupation = had;
    const f1 = (fns && fns[0]) || [];
    const occLine = f1.find(l => /was an? .*before/.test(String(l)));
    if (!occLine) { console.log(`FAIL [${pro}]: no occupation line in f1`); fails++; continue; }
    const ok = String(occLine).includes(want) && !/they handle/.test(String(occLine));
    console.log(`${ok ? 'ok' : 'FAIL'} [${pro}]: ${String(occLine).slice(0, 110)}`);
    if (!ok) fails++;
  }
  try { Game.endConvo(talker, 'left'); } catch (e) {}
  console.log(fails ? `\n${fails} FAILURES` : '\nALL GREEN');
  process.exit(fails ? 1 : 0);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
