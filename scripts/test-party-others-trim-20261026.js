#!/usr/bin/env node
// test-party-others-trim-20261026.js — proof for journey social r59.
// BLANK (r58, 2026-10-26): partyConvoChoices splices the party item at
// index 1 of a full subject menu and trims to MAXC=7 from the end,
// cutting 'ask:others' whenever a party member's menu runs long
// (r58: 1008 displaced probes, all in-party). The village-talk verb
// must survive the party trim.
// FIX: trim victims skip 'ask:others' (and 'leave'); if every
// displaceable row is protected, the menu keeps one extra row.
// RED (HEAD code) = case 1 loses 'ask:others'.
// GREEN (fixed code) = all cases pass.
// State setup only (unlock flags + real party membership); the method
// under test runs fully, unstubbed.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

async function main() {
  const { Game } = await loadGame({ seed: 5901, mode: 'party-others-trim' });
  await setupGame(Game);
  const checks = [];
  const ok = (name, cond, detail) => {
    checks.push({ name, pass: !!cond, detail: detail || '' });
    console.log((cond ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
  };
  const ids = (arr) => arr.map(c => c.id);

  // Honest state: party unlocked, System arrived, codex open, one member.
  const v = Game.state.village;
  v.partyUnlocked = true;
  Game.state.systemArrived = true;
  Game.state.scholar.codexUnlocked = true;
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  const vid = roster[0];
  if (!vid) { console.log('FAIL no villager in roster'); process.exit(1); }
  v.party = [vid];
  ok('party member set', Game.inParty(vid) === true, 'vid=' + vid);
  ok('party unlocked', Game.partyUnlocked() === true);

  // Case 1: r58's worked example, verbatim shape — 16-item base menu,
  // 'ask:others' at index 5, unnamed party, MAXC=7.
  const base = ['ask:lately', 'ask:you', 'ask:goal', 'ask:personal', 'ask:gossip',
    'ask:others', 'alive:event:tension', 'ask:spread_rumor', 'teach',
    'skill_teach:gossip_network', 'compare_maps', 'observe', 'theorize',
    'alive:want:curious', 'leave', 'silence'].map(id => ({ id, label: id }));
  Game.partyConvoChoices(vid, base, 7);
  ok('case1 party item spliced at index 1', base[1] && base[1].id === 'party_name', ids(base).join(','));
  ok('case1 ask:others survives the trim', ids(base).indexOf('ask:others') !== -1, ids(base).join(','));
  ok('case1 leave still last', base[base.length - 1].id === 'leave', ids(base).join(','));
  ok('case1 list bounded at MAXC', base.length <= 7, 'len=' + base.length);

  // Case 2: named party -> party_role item, same protection.
  v.partyName = 'The Hearth';
  const base2 = ['ask:lately', 'ask:you', 'ask:goal', 'ask:personal', 'ask:gossip',
    'ask:others', 'alive:event:tension', 'teach', 'leave', 'silence'].map(id => ({ id, label: id }));
  Game.partyConvoChoices(vid, base2, 7);
  ok('case2 party_role spliced at index 1', base2[1] && base2[1].id === 'party_role', ids(base2).join(','));
  ok('case2 ask:others survives the trim', ids(base2).indexOf('ask:others') !== -1, ids(base2).join(','));
  ok('case2 leave still last', base2[base2.length - 1].id === 'leave', ids(base2).join(','));
  ok('case2 list bounded at MAXC', base2.length <= 7, 'len=' + base2.length);
  delete v.partyName;

  // Case 3: room in the menu -> item appended, nothing displaced.
  const short = ['ask:lately', 'ask:others', 'leave'].map(id => ({ id, label: id }));
  Game.partyConvoChoices(vid, short, 7);
  ok('case3 short menu appends party item', ids(short).indexOf('party_name') !== -1, ids(short).join(','));
  ok('case3 short menu keeps ask:others', ids(short).indexOf('ask:others') !== -1, ids(short).join(','));
  ok('case3 short menu untouched length', short.length === 4, 'len=' + short.length);

  // Case 4: degenerate all-protected trim — menu of only the verb + leave,
  // MAXC smaller than the spliced list: the verb must survive even at the
  // cost of one extra row (bounded-ness relaxes, the verb does not).
  const degen = ['ask:lately', 'ask:others', 'leave'].map(id => ({ id, label: id }));
  Game.partyConvoChoices(vid, degen, 2);
  ok('case4 degenerate keeps party item', ids(degen).indexOf('party_name') !== -1, ids(degen).join(','));
  ok('case4 degenerate keeps ask:others', ids(degen).indexOf('ask:others') !== -1, ids(degen).join(','));
  ok('case4 degenerate keeps leave last', degen[degen.length - 1].id === 'leave', ids(degen).join(','));

  // Case 5: non-party villager -> untouched (guard, not the fix).
  const other = roster[1] || roster[0];
  if (other !== vid) {
    const m = ['ask:lately', 'ask:others', 'leave', 'teach', 'observe', 'theorize', 'silence', 'compare_maps'].map(id => ({ id, label: id }));
    Game.partyConvoChoices(other, m, 7);
    ok('case5 non-party menu untouched', m.length === 8 && ids(m).indexOf('party_name') === -1, ids(m).join(','));
  }

  const fails = checks.filter(c => !c.pass);
  console.log(fails.length ? `RESULT: ${fails.length} FAILURES` : 'RESULT: ALL PASS');
  process.exit(fails.length ? 1 : 0);
}
main().catch(e => { console.error('ERROR', e && e.stack || e); process.exit(2); });
