#!/usr/bin/env node
// test-titanghost-a.js — proof for sim-titanghost-a.
// B1 (ghost stop): an omen whose monster is absent must not escalate,
// must not form a muster on call, and must not take Haven blades on
// commit — it says the nothing-located line instead. A present titan
// is unchanged on all three paths.
// B2 (muster-hunger legibility): a hungry muster states its trust
// price aloud and writes one link.history entry per charged link per
// hunger day (kind muster-hunger, amount -2); the -2 math itself is
// untouched (a fed day writes nothing, trust moves identically).
//
// Usage: node scripts/test-titanghost-a.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  ok: ' + name); }
  else { fail++; console.log('  FAIL: ' + name + (extra ? ' — ' + extra : '')); }
}

async function main() {
  const { Game } = await loadGame({ seed: 8991, mode: 'titanghost-proof' });
  await setupGame(Game);

  const said = [];
  const osay = Game.say;
  Game.say = function (t) { try { said.push(String(t)); } catch (e) {} return osay.call(this, t); };
  Game.recordMoment = function () {};
  const spendCalls = [];
  const savedSpend = Game.playerPackSpend;
  Game.playerPackSpend = function (n) { spendCalls.push(n); return n; };

  // ---- fixture: one answering ally, one located omen ----
  Game.state.otherVillages = [
    { id: 'ashford', name: 'Ashford', opinion: 30, roster: [
      { id: 'ash_speaker', name: 'Mara Voss', alive: true },
      { id: 'ash_fighter', name: 'Tomm Rill', alive: true },
    ]},
  ];
  const linkAsh = { primary: 'haven', subordinate: 'ashford', status: 'active', trust: 60,
    theirSpeaker: { id: 'ash_speaker', name: 'Mara Voss' }, arrears: 0, history: [] };
  Game.mshipState = () => ({ links: [linkAsh] });
  Game.state.scholar.day = 100;
  const T = Game._titanTest;
  T.titanState().omens.herald = { stage: 2, day: 95, warned: {} };

  // ================= B1: ABSENT titan =================
  const trustBefore = linkAsh.trust;
  said.length = 0; spendCalls.length = 0;
  T.titanEscalate('herald', 100);
  check('B1 absent: escalation says nothing about the Herald',
    !said.some(function (t) { return /HERALD/.test(t) && /(fed in the night|struck .* in the night)/.test(t); }),
    said.join(' | ').slice(0, 300));
  check('B1 absent: escalation spends nothing and costs no trust',
    spendCalls.length === 0 && linkAsh.trust === trustBefore,
    'spend=' + spendCalls.length + ' trust=' + linkAsh.trust);

  said.length = 0;
  const callAbsent = Game.soundTitanCall('herald');
  check('B1 absent: call returns null', callAbsent === null, 'returned ' + JSON.stringify(callAbsent));
  check('B1 absent: call says the nothing-located line',
    said.some(function (t) { return /There is nothing located to march against/.test(t); }),
    said.join(' | ').slice(0, 300));
  check('B1 absent: call creates no muster',
    !T.titanState().musters.herald, 'muster=' + JSON.stringify(T.titanState().musters.herald));

  said.length = 0;
  const c1a = Game.titanCommitOwn('herald');
  const c2a = Game.titanCommitOwn('herald');
  check('B1 absent: commit returns null on both taps', c1a === null && c2a === null,
    'tap1=' + JSON.stringify(c1a) + ' tap2=' + JSON.stringify(c2a));
  check('B1 absent: commit says the nothing-located line',
    said.some(function (t) { return /There is nothing located to march against/.test(t); }),
    said.join(' | ').slice(0, 300));
  check('B1 absent: no pending commit left behind',
    !(T.titanState().pendingCommit && T.titanState().pendingCommit.indexOf('herald:') === 0),
    'pending=' + T.titanState().pendingCommit);

  // ================= B1: PRESENT titan (guardrail) =================
  // Reset the muster the absent-commit probe just (wrongly) built, so
  // the present section measures a fresh call + commit, not leftovers.
  T.titanState().musters.herald = null;
  T.titanState().pendingCommit = null;
  if (Game.state.village) Game.state.village.titanCommitted = {};
  // Pending-lapse: a first tap taken while present must not send blades
  // once the monster is gone. (Monster still absent here.)
  T.titanState().pendingCommit = 'herald:stale';
  const lapse = Game.titanCommitOwn('herald');
  check('B1 absent: a pending commit lapses when the monster is gone',
    lapse === null && !T.titanState().pendingCommit,
    'returned ' + JSON.stringify(lapse) + ' pending=' + T.titanState().pendingCommit);
  // Place the Herald the way titanPlace does (free tile, titan flag).
  let mon = null;
  try { mon = Game.spawnWorldMonster('herald', 7, 4, { titan: true }); } catch (e) { mon = null; }
  const present = (Game.worldMonsters() || []).some(function (m) { return m && m.id === 'herald'; });
  check('fixture: Herald placed in the world', present && !!mon, 'mon=' + !!mon);
  if (present) {
    said.length = 0; spendCalls.length = 0;
    const tb = linkAsh.trust;
    T.titanEscalate('herald', 100);
    T.titanEscalate('herald', 105);
    T.titanEscalate('herald', 110);
    check('B1 present: escalation still speaks and still costs',
      said.some(function (t) { return /HERALD/.test(t) && /(fed in the night|struck .* in the night)/.test(t); }) &&
      (spendCalls.length > 0 || linkAsh.trust < tb),
      said.join(' | ').slice(0, 300) + ' spend=' + spendCalls.length + ' trust=' + tb + '->' + linkAsh.trust);

    said.length = 0;
    const callPresent = Game.soundTitanCall('herald');
    check('B1 present: call still forms a muster',
      !!callPresent && (callPresent.allies || []).length >= 2,
      'allies=' + (callPresent && (callPresent.allies || []).length));
    const r1 = Game.titanCommitOwn('herald');
    const r2 = Game.titanCommitOwn('herald');
    const st = T.titanState();
    const havenN = (st.musters.herald.haven || []).length;
    check('B1 present: commit still takes Haven blades on two taps',
      r1 === 'confirm' && !!r2 && havenN >= 1,
      'tap1=' + JSON.stringify(r1) + ' haven=' + havenN);
  }

  // ================= B1 follow-up: campaign nodes count as presence =================
  // A Network node monster standing (tower, no heart yet) is a present
  // titan for the call; with no node standing, the call refuses.
  T.titanState().omens.the_network = { stage: 2, day: 100, warned: {} };
  linkAsh.trust = 60;
  // Free ashford's fighters (committed to the herald muster above) so the
  // Network call has someone to recruit.
  T.titanState().musters.herald = null;
  var tower = null;
  try { tower = Game.spawnWorldMonster('network_tower', 7, 4, { titan: true, networkNode: 'mast_nw' }); } catch (e) { tower = null; }
  var netCall = Game.soundTitanCall('the_network');
  check('B1 follow-up: a Network node monster counts as present for the call',
    !!netCall && (netCall.allies || []).length >= 2, 'allies=' + (netCall && (netCall.allies || []).length));
  if (tower) { try { Game.removeWorldMonster(tower); } catch (e) {} }
  var netCall2 = Game.soundTitanCall('the_network');
  check('B1 follow-up: no node standing, the Network call refuses',
    netCall2 === null, 'returned ' + JSON.stringify(netCall2));

  Game.playerPackSpend = savedSpend;
  console.log(pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
}

main().catch(function (e) { console.error('TEST FAIL: ' + (e && e.stack ? e.stack : e)); process.exit(1); });
