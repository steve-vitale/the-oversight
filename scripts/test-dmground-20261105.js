// test-dmground-20261105.js — proof for the secondkiller instrument,
// driver, and analyzer (arm sim-dmground-a). Fixture tests (fake Game
// wrappers + analyzer splits) + live harness smoke + off/on neutrality leg
// (driver subprocesses into /tmp, never into evidence/). Exit non-zero on
// any failure.
// Usage: node scripts/test-dmground-20261105.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const AN = require(path.join(REPO, 'scripts', 'dmground-analyze-20261105'));
const INST = require(path.join(REPO, 'scripts', 'dmground-instrument-20261105'));

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}

// ---- fake-Game instrument fixtures ----
function fakeGame() {
  const persons = {
    leader: { equipped: { melee: { itemId: 'shard_spear' }, torso: { itemId: 'bark_armor' } } },
    ally1: { equipped: { melee: { itemId: 'shard_spear' }, armor: null } },
    k1: { equipped: {} },
  };
  const G = {
    villagerId: 'leader',
    data: {
      monsters: [{ id: 'w4a', wave: 4 }, { id: 'w3a', wave: 3 }],
      items: [{ id: 'bark_armor', armor: { protection: 10 } }, { id: 'shard_spear', weapon: { bonus: 25 } }],
      villagers: [], background_survivors: [],
    },
    state: { scholar: { day: 50 }, waveKillLog: [{ d: 10, mid: 'w4a', w: 4, by: 'k1', via: 'field' }], village: { fallen: [], roster: ['leader', 'ally1', 'k1'], health: {} } },
    map: { px: 4, py: 4 },
    getPerson: function (id) { return persons[id] || null; },
    playerAtHaven: function () { return true; },
    tbfight: null,
    fieldFight: function (vid, mdef, m, opts) {
      return { outcome: 'mFlee', rounds: 6, mDealt: 300, allyDealt: 50, vTaken: 20, mHpLeft: 650, packCount: 1, log: [], partySize: 2, allyVid: 'ally1', intent: 'engage', intentWhy: 'party', trickLog: ['shout'], focusFire: true, gearFull: true, committedFinish: true, committedRounds: 2, shoutRound: 2, everWinning: false, everHopeless: true };
    },
    startCombat: function (mid) { G.tbfight = { round: 1, fighters: [{ kind: 'villager', villagerId: 'leader', hp: 80 }, { kind: 'monster', monsterId: 'w4a', mdef: { id: 'w4a' }, hp: 900 }] }; return true; },
    tbPlayerStrike: function () { return true; },
    useAbility: function () { return true; },
    tbEnd: function () { return true; },
    recordWaveKill: function () { return true; },
    playerDeath: function () { return true; },
  };
  return G;
}

(function () {
  const G = fakeGame();
  const inst = INST.install(G);
  check('install-no-errors', inst.t.instrumentErrors.length === 0, JSON.stringify(inst.t.instrumentErrors));
  G.fieldFight('leader', { id: 'w4a', wave: 4 }, { id: 'w4a', hp: 1000 }, { allies: 1, allyVids: ['ally1'] });
  check('field-wave4-recorded', inst.t.fights.length === 1, 'n=' + inst.t.fights.length);
  const f = inst.t.fights[0];
  check('field-party-damage', f.partySize === 2 && f.allyVid === 'ally1' && f.damageDealt === 350 && Math.abs(f.damageFrac - 0.35) < 1e-9,
    JSON.stringify({ partySize: f.partySize, damageDealt: f.damageDealt, damageFrac: f.damageFrac }));
  check('field-second-candidate', f.secondCandidatePresent === true && f.secondCandidates.indexOf('leader') >= 0 && f.firstKiller === 'k1' && f.firstKillerAliveAtStart === true && f.firstKillerInFight === false,
    JSON.stringify({ sc: f.secondCandidates, fk: f.firstKiller, alive: f.firstKillerAliveAtStart }));
  check('field-gear', f.gear && f.gear.weaponId === 'shard_spear' && f.gear.weaponBonus === 25 && f.gear.armorP === 10,
    JSON.stringify(f.gear));
  check('field-ending', f.ending === 'flee' && f.outcomeRaw === 'mFlee' && f.swingsAttempted === 6);
  check('field-dmground-fields', f.focusFire === true && f.gearFull === true && f.committedFinish === true && f.committedRounds === 2 && f.shoutRound === 2 && f.everHopeless === true && f.everWinning === false,
    JSON.stringify({ ff: f.focusFire, gf: f.gearFull, cf: f.committedFinish, cr: f.committedRounds, sr: f.shoutRound }));
  // Wave-3 fight must NOT be recorded (full records are wave-4+ only).
  G.fieldFight('leader', { id: 'w3a', wave: 3 }, { id: 'w3a', hp: 300 }, {});
  check('field-wave3-skipped', inst.t.fights.length === 1, 'n=' + inst.t.fights.length);
  // TB fight: won without a kill-log row must NOT become a kill (analyzer
  // rule; here: the record's ending is kill-or-rout, not kill).
  G.startCombat('w4a');
  G.tbPlayerStrike('m_0'); G.tbPlayerStrike('m_0');
  G.useAbility('bird_strike', 'strike');
  G.tbfight.fighters[1].hp = 400; G.tbfight.round = 3;
  G.tbEnd('won');
  check('tb-recorded', inst.t.fights.length === 2, 'n=' + inst.t.fights.length);
  const tb = inst.t.fights[1];
  check('tb-fields', tb.channel === 'player-tb' && tb.ending === 'kill-or-rout' && tb.swingsAttempted === 2 &&
    tb.damageDealt === 500 && Math.abs(tb.damageFrac - 500 / 900) < 1e-9 &&
    tb.abilitiesUsed.indexOf('bird_strike') >= 0 && tb.secondCandidatePresent === true,
    JSON.stringify(tb));
  inst.uninstall();
  check('uninstall-restores', G.fieldFight('leader', { id: 'w4a', wave: 4 }, { id: 'w4a', hp: 1000 }, {}).outcome === 'mFlee' && inst.t.fights.length === 2);
})();

// ---- analyzer fixtures ----
function arow(seed, opts) {
  const r = { seed: seed, run: 'fixture', days: 100, endReason: 'horizon', won: false,
    fights: [], daily: [{ day: 1, gated: 0, readiness5: { veterans: 0 } }],
    waveKillLog: [], fallen: [], wavesFaced: {}, instrumentErrors: [], deadMap: {},
    scaleRank: 'village', unlockedWave: 1, maxWave: 1 };
  return Object.assign(r, opts || {});
}
function ffight(o) {
  return Object.assign({ day: 20, channel: 'field', fighter: 'leader', fighters: ['leader'], mid: 'w4a', wave: 4,
    entryHp: 1000, damageDealt: 200, damageFrac: 0.2, rounds: 5, swingsAttempted: 5, partySize: 1,
    firstKiller: 'k1', firstKillerAliveAtStart: true, firstKillerInFight: false,
    secondCandidatePresent: true, secondCandidates: ['leader'], ending: 'flee', outcomeRaw: 'mFlee',
    gear: { weaponBonus: 25, armorP: 10 },
    focusFire: false, gearFull: false, committedFinish: false, committedRounds: 0, shoutRound: null, everWinning: false, everHopeless: false }, o || {});
}
(function () {
  const r = arow(1, {
    fights: [ffight({ day: 20 }), ffight({ day: 21, partySize: 2, fighters: ['leader', 'ally1'], ending: 'kill', outcomeRaw: 'vKill' }), ffight({ day: 22, channel: 'player-tb', ending: 'kill-or-rout', outcomeRaw: 'won' })],
    waveKillLog: [{ d: 21, mid: 'w4a', w: 4, by: 'leader', via: 'field' }],
  });
  const s = AN.analyzeSeed(JSON.parse(JSON.stringify(r)));
  check('analyzer-match-one-kill', s.w4killsMatched === 1 && s.unmatchedKills === 0 && s.killRate === 1 / 3,
    JSON.stringify({ matched: s.w4killsMatched, unmatched: s.unmatchedKills, rate: s.killRate }));
  check('analyzer-tb-won-not-kill', s.fights[2].matchedKillBy == null && s.fights[1].matchedKillBy === 'leader' && s.fights[1].matchedKillFirst === true,
    JSON.stringify(s.fights.map(function (f) { return f.matchedKillBy; })));
  // Corrected candidate rule: the day-22 fight's leader was blooded on
  // day 21 (earlier day), so it is candidate-absent; the day-20/21 fights
  // are candidate-present (the day-21 kill itself is not prior blood).
  check('analyzer-splits', s.splits['party:solo'].fights === 2 && s.splits['party:leader+1'].fights === 1 &&
    s.splits['secondCand:present'].fights === 2 && s.splits['secondCand:absent'].fights === 1 &&
    s.splits['alive:alive'].fights === 3,
    JSON.stringify(s.splits));
  const s2 = AN.analyzeSeed(JSON.parse(JSON.stringify(r)));
  check('analyzer-determinism', JSON.stringify(s) === JSON.stringify(s2));
})();
(function () {
  // DMGROUND splits: field fights split by allyVid presence, not partySize.
  const r3 = arow(4, {
    fights: [ffight({ day: 20, allyVid: 'ally1', focusFire: true, gearFull: true, ending: 'flee' }),
      ffight({ day: 21, allyVid: null, partySize: 3, focusFire: false, gearFull: false, ending: 'death', outcomeRaw: 'vDie' }),
      ffight({ day: 22, allyVid: 'ally1', focusFire: true, gearFull: true, ending: 'flee' })],
    waveKillLog: [],
  });
  const out3 = AN.analyzeDir((function () {
    const dir = '/tmp/dmground-split-' + process.pid;
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(dir + '/dmground-s4-fixture.json', JSON.stringify(r3));
    return dir;
  })());
  check('analyzer-allyVid-split', out3.extra.fieldByAlly.joined.fights === 2 && out3.extra.fieldByAlly.noJoiner.fights === 1,
    JSON.stringify(out3.extra.fieldByAlly));
  check('analyzer-focusfire-split', out3.extra.fieldByFocusFire.focusFire.fights === 2 && out3.extra.fieldByFocusFire.noFocusFire.fights === 1,
    JSON.stringify(out3.extra.fieldByFocusFire));
  check('analyzer-gearfull-split', out3.extra.fieldByGearFull.gearFull.fights === 2 && out3.extra.fieldByGearFull.noGearFull.fights === 1 && out3.extra.fieldGearFull === 2,
    JSON.stringify(out3.extra.fieldByGearFull));
  try { fs.rmSync('/tmp/dmground-split-' + process.pid, { recursive: true, force: true }); } catch (e) {}
})();
(function () {
  // Exposure signal: kills only when no first killer lives.
  const dir = '/tmp/dmground-analyzer-' + process.pid;
  fs.mkdirSync(dir, { recursive: true });
  const mk = function (seed, fights, log) {
    return arow(seed, { fights: fights, waveKillLog: log, daily: [{ day: 1, gated: 0, readiness5: { veterans: 0 } }] });
  };
  fs.writeFileSync(dir + '/dmground-s1-fixture.json', JSON.stringify(mk(1,
    [ffight({ day: 20, firstKillerAliveAtStart: true, ending: 'flee' }), ffight({ day: 21, firstKillerAliveAtStart: false, ending: 'kill', outcomeRaw: 'vKill' })],
    [{ d: 21, mid: 'w4a', w: 4, by: 'leader', via: 'field' }])));
  const out = AN.analyzeDir(dir);
  check('analyzer-exposure-signal', out.signals.exposureRotation.killRateFirstAlive === 0 && out.signals.exposureRotation.killRateFirstNotAlive === 1,
    JSON.stringify(out.signals.exposureRotation));
  try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {}
})();

// 18. Strict kill matching: a same-day same-monster kill belongs to the
// fight whose fighters include the killer, not an earlier losing fight.
(function () {
  const r = arow(2, {
    fights: [ffight({ day: 20, fighters: ['jesse'], fighter: 'jesse', ending: 'death', outcomeRaw: 'lost' }),
      ffight({ day: 20, fighters: ['boris'], fighter: 'boris', ending: 'kill-or-rout', outcomeRaw: 'won' })],
    waveKillLog: [{ d: 20, mid: 'w4a', w: 4, by: 'boris', via: 'player' }],
  });
  const s = AN.analyzeSeed(JSON.parse(JSON.stringify(r)));
  check('strict-kill-matching', s.fights[0].matchedKillBy == null && s.fights[1].matchedKillBy === 'boris' && s.w4killsMatched === 1,
    JSON.stringify(s.fights.map(function (f) { return f.matchedKillBy; })));
})();
// 19. Gear armor lives in the torso slot, not an `armor` slot.
(function () {
  const G = fakeGame();
  G.getPerson = function (id) {
    if (id === 'leader') return { equipped: { melee: { itemId: 'shard_spear' }, torso: { itemId: 'bark_armor' } } };
    return null;
  };
  const inst = INST.install(G);
  G.fieldFight('leader', { id: 'w4a', wave: 4 }, { id: 'w4a', hp: 1000 }, { allies: 1, allyVids: ['ally1'] });
  const f = inst.t.fights[0];
  check('gear-torso-armor', f && f.gear && f.gear.armorP === 10 && f.gear.armorId === 'bark_armor', JSON.stringify(f && f.gear));
  inst.uninstall();
})();

// 20. Solo scholar TB fight: the scholar's tbfight entry carries no
// villagerId, so the candidate list must fall back to the scholar id.
(function () {
  const G = fakeGame();
  G.startCombat = function (mid) { G.tbfight = { round: 1, fighters: [{ kind: 'player', hp: 80 }, { kind: 'monster', monsterId: 'w4a', mdef: { id: 'w4a' }, hp: 900 }] }; return true; };
  const inst = INST.install(G);
  G.startCombat('w4a');
  G.tbfight.fighters[1].hp = 400; G.tbfight.round = 2;
  G.tbEnd('won');
  const tb = inst.t.fights[0];
  check('tb-scholar-fallback-candidate', tb && tb.fighters[0] === 'leader' && tb.secondCandidatePresent === true && tb.secondCandidates[0] === 'leader',
    JSON.stringify(tb && { fighters: tb.fighters, sc: tb.secondCandidates }));
  inst.uninstall();
})();
// 25. DMGROUND FIX: TB with companions present — the scholar's vid must
// be in the fighters list (their tbfight entry carries no villagerId),
// so a scholar kill matches the fight under the strict rule.
(function () {
  const G = fakeGame();
  G.startCombat = function (mid) { G.tbfight = { round: 1, fighters: [{ kind: 'villager', villagerId: 'ally1', hp: 80 }, { kind: 'player', hp: 80 }, { kind: 'monster', monsterId: 'w4a', mdef: { id: 'w4a' }, hp: 900 }] }; return true; };
  const inst = INST.install(G);
  G.startCombat('w4a');
  G.tbfight.fighters[2].hp = 400; G.tbfight.round = 2;
  G.tbEnd('won');
  const tb = inst.t.fights[0];
  check('tb-companion-scholar-in-fighters', tb && tb.fighters.indexOf('leader') >= 0 && tb.fighters.indexOf('ally1') >= 0 && tb.secondCandidatePresent === true,
    JSON.stringify(tb && tb.fighters));
  inst.uninstall();
  const r = arow(5, {
    fights: [ffight({ day: 20, channel: 'player-tb', fighters: ['ally1', 'leader'], fighter: 'leader', ending: 'kill-or-rout', outcomeRaw: 'won' })],
    waveKillLog: [{ d: 20, mid: 'w4a', w: 4, by: 'leader', via: 'player' }],
  });
  const s5 = AN.analyzeSeed(JSON.parse(JSON.stringify(r)));
  check('tb-companion-scholar-kill-matches', s5.w4killsMatched === 1 && s5.unmatchedKills === 0 && s5.fights[0].matchedKillBy === 'leader',
    JSON.stringify({ matched: s5.w4killsMatched, unmatched: s5.unmatchedKills }));
})();
// 21. Analyzer corrects the solo-scholar candidate flag from fighters +
// earlier-day kill history.
(function () {
  const r = arow(3, {
    fights: [ffight({ day: 20, fighters: ['boris'], fighter: 'boris', secondCandidatePresent: false, secondCandidates: [] })],
    waveKillLog: [],
  });
  const s = AN.analyzeSeed(JSON.parse(JSON.stringify(r)));
  check('analyzer-corrects-candidate', s.fights[0].secondCandidatePresent === true && s.fights[0].secondCandidatePresentInstrument === false,
    JSON.stringify(s.fights[0]));
})();

async function leverLegs() {
  // GEARFULL gate fixtures (live harness, seed 99201): the lever fires
  // exactly where the prereg gates it — wild wave-3+ fights — and the
  // strikes use the full printed bonus there, the halved fold-in
  // everywhere else. Machete (bonus 35): gated [39,43], halved [22,26].
  // Hunting spear (bonus 30): gated [34,38], halved [19,23].
  const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));
  const { Game } = await loadGame({ seed: 99201, mode: 'competent-dmground-lever', fullTelemetry: false });
  await setupGame(Game);
  const vils = Game.data.villagers || [];
  function arm(vid, weaponId) {
    const p = (Game.data.villagers || []).find(function (x) { return x.id === vid; }) ||
      (Game.data.background_survivors || []).find(function (x) { return x.id === vid; });
    p.items = [weaponId];
    p.equipped = { melee: { itemId: weaponId } };
    return p;
  }
  function strikeNums(rec) {
    return (rec.log || []).filter(function (l) { return /strikes for \d+/.test(l); })
      .map(function (l) { return parseInt(l.match(/strikes for (\d+)/)[1], 10); });
  }
  function leaderNums(rec, firstName) {
    return (rec.log || []).filter(function (l) { return /strikes for \d+/.test(l) && l.indexOf(firstName) >= 0; })
      .map(function (l) { return parseInt(l.match(/strikes for (\d+)/)[1], 10); });
  }
  function allyNums(rec, firstName) {
    return (rec.log || []).filter(function (l) { return /strikes for \d+/.test(l) && l.indexOf(firstName) < 0; })
      .map(function (l) { return parseInt(l.match(/strikes for (\d+)/)[1], 10); });
  }
  const leader = vils[0], ally = vils[1];
  const lp = arm(leader.id, 'machete');
  const ap = arm(ally.id, 'hunting_spear');
  const leaderFirst = String(lp.name || '').split(' ')[0];
  const mons = Game.data.monsters || [];
  const eulogy = mons.find(function (m) { return m.id === 'eulogy'; });
  const deer = mons.find(function (m) { return m.id === 'gallowdeer'; });
  check('lever-monsters-found', !!(eulogy && eulogy.wave === 4 && deer && deer.wave === 1),
    'eulogy=' + (eulogy && eulogy.wave) + ' deer=' + (deer && deer.wave));

  const r1 = Game.fieldFight(leader.id, eulogy, null, { allies: 1 });
  const s1 = leaderNums(r1, leaderFirst);
  check('lever-gate-w4', r1.gearFull === true && (r1.log || []).some(function (l) { return /Gear full/.test(l); }) &&
    s1.length >= 1 && s1.every(function (n) { return n >= 39 && n <= 43; }),
    'gearFull=' + r1.gearFull + ' strikes=' + JSON.stringify(s1));

  const r2 = Game.fieldFight(leader.id, deer, null, { allies: 1 });
  const s2 = leaderNums(r2, leaderFirst);
  check('lever-gate-wave1', r2.gearFull === false && s2.length >= 1 && s2.every(function (n) { return n >= 22 && n <= 26; }),
    'gearFull=' + r2.gearFull + ' strikes=' + JSON.stringify(s2));

  const r3 = Game.fieldFight(leader.id, eulogy, null, { allies: 1, noFlee: true });
  const s3 = leaderNums(r3, leaderFirst);
  check('lever-gate-sealed', r3.gearFull === false && s3.length >= 1 && s3.every(function (n) { return n >= 22 && n <= 26; }),
    'gearFull=' + r3.gearFull + ' strikes=' + JSON.stringify(s3));

  const r4 = Game.fieldFight(leader.id, eulogy, null, { allies: 1, cornered: true });
  const s4 = leaderNums(r4, leaderFirst);
  check('lever-gate-cornered', r4.gearFull === false && s4.length >= 1 && s4.every(function (n) { return n >= 22 && n <= 26; }),
    'gearFull=' + r4.gearFull + ' strikes=' + JSON.stringify(s4));

  const r5 = Game.fieldFight(leader.id, eulogy, null, { allies: 1, allyVids: [ally.id], allyFromStart: true });
  const s5l = leaderNums(r5, leaderFirst);
  const s5a = allyNums(r5, leaderFirst);
  check('lever-ally-full', r5.gearFull === true &&
    s5l.length >= 1 && s5l.every(function (n) { return n >= 39 && n <= 43; }) &&
    s5a.length >= 1 && s5a.every(function (n) { return n >= 34 && n <= 38; }),
    'gearFull=' + r5.gearFull + ' leader=' + JSON.stringify(s5l) + ' ally=' + JSON.stringify(s5a));

  // Ambush opening strike shares the gated term: give fresh villagers
  // the ambush ability and retry across villagers until contact is made
  // (the evade roll may swallow an attempt; each attempt is a new
  // villager, since wounds carry). awareness:true is required — the
  // ambush block lives inside the awareness section. Only the opening
  // strike is asserted (it is the raw tactical roll; round strikes from
  // an ability-holder pick up the godpath x1.3 overcharge).
  let amb = null, ambOpen = [];
  for (let i = 2; i < 5 && !amb; i++) {
    const v = vils[i];
    if (!v) break;
    arm(v.id, 'machete');
    try {
      const st = Game.state.village || (Game.state.village = {});
      const na = st.npcAbilities || (st.npcAbilities = {});
      na[v.id] = ['ambush'];
    } catch (e) {}
    const r = Game.fieldFight(v.id, eulogy, null, { allies: 1, awareness: true });
    if (r.outcome !== 'evade') {
      const opens = (r.log || []).filter(function (l) { return /Opening strike for \d+/.test(l); });
      if (opens.length) { amb = r; ambOpen = opens.map(function (l) { return parseInt(l.match(/Opening strike for (\d+)/)[1], 10); }); }
    }
  }
  check('lever-ambush-full', !!amb && amb.gearFull === true && ambOpen.length >= 1 && ambOpen.every(function (n) { return n >= 39 && n <= 43; }),
    amb ? 'opening=' + JSON.stringify(ambOpen) : 'no ambush opening in 3 attempts');
}

async function liveLegs() {
  const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
  const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
  const { Game } = await loadGame({ seed: 99161, mode: 'competent-dmground-proof', fullTelemetry: false });
  await setupGame(Game);
  const inst = INST.install(Game);
  let last = -1;
  const wrapped = Object.assign({}, competent, {
    daily: function (Gm, ctx) {
      try { return competent.daily(Gm, ctx); } finally {
        const d = ((Game.state || {}).scholar || {}).day || 0;
        if (d !== last) { last = d; inst.snapshot(); }
      }
    },
  });
  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: 5, manifest: undefined, sampleEvery: 30 }); });
  inst.snapshot();
  const fin = inst.finalize();
  inst.uninstall();
  check('live-smoke', result && result.days > 0 && inst.t.daily.length > 0 && inst.t.instrumentErrors.length === 0 && Array.isArray(fin.waveKillLog),
    'days=' + (result && result.days) + ' snaps=' + inst.t.daily.length + ' errs=' + JSON.stringify(inst.t.instrumentErrors));

  const tmp = '/tmp/dmground-proof-' + process.pid;
  fs.mkdirSync(tmp, { recursive: true });
  const envBase = Object.assign({}, process.env, { REPO: REPO, DAYS: '10', SEEDS: '99161', OUTDIR: tmp });
  execSync('node scripts/dmground-driver-20261105.js', { cwd: REPO, env: Object.assign({}, envBase, { RUN: 'proof-off', DMGROUND_OFF: '1' }), stdio: 'pipe' });
  execSync('node scripts/dmground-driver-20261105.js', { cwd: REPO, env: Object.assign({}, envBase, { RUN: 'proof-on' }), stdio: 'pipe' });
  const off = JSON.parse(fs.readFileSync(path.join(tmp, 'dmground-s99161-proof-off.json'), 'utf8'));
  const on = JSON.parse(fs.readFileSync(path.join(tmp, 'dmground-s99161-proof-on.json'), 'utf8'));
  check('neutrality-off-on', off.days === on.days && off.endReason === on.endReason &&
    (off.waveKillLog || []).length === (on.waveKillLog || []).length &&
    on.instrumentErrors.length === 0,
    'off=' + off.days + '/' + off.endReason + '/' + (off.waveKillLog || []).length +
    ' on=' + on.days + '/' + on.endReason + '/' + (on.waveKillLog || []).length +
    ' errs=' + JSON.stringify(on.instrumentErrors));
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}

  console.log(pass + '/' + (pass + fail) + ' PASS');
  process.exit(fail ? 1 : 0);
}
leverLegs().then(function () { return liveLegs(); }).catch(function (e) { console.error(e.stack); process.exit(1); });
