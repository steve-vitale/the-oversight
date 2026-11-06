// test-stageally-20261106.js — proof for the companion-staging + rally
// policy, instrument, and analyzer (arm sim-stageally-a). Fixture tests +
// staged live invite + live rally + live harness smoke + determinism +
// off/on neutrality legs (driver subprocesses into /tmp, never into
// evidence/). Exit non-zero on any failure.
// Usage: node scripts/test-stageally-20261106.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const AN = require(path.join(REPO, 'scripts', 'stageally-analyze-20261106'));
const BKAN = require(path.join(REPO, 'scripts', 'bankkiller-analyze-20261105'));
const RALLY = require(path.join(REPO, 'scripts', 'policies', 'competent-rally-bankkiller-b'));
const STAGED = require(path.join(REPO, 'scripts', 'policies', 'competent-stageally-a'));
const COMP = require(path.join(REPO, 'scripts', 'policies', 'competent'));

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}

// ---------- fake-Game policy fixtures ----------
const realDaily = COMP.competent.daily;
let baseDailyCalls = 0;
COMP.competent.daily = function () { baseDailyCalls++; };
const realFight = COMP.competent.fight;
let baseFightCalls = 0;
COMP.competent.fight = function () { baseFightCalls++; return false; };

function roster() {
  return [
    { id: 'w4a', wave: 4 }, { id: 'w4b', wave: 4 }, { id: 'w5a', wave: 5 },
    { id: 'w3a', wave: 3 }, { id: 'w1a', wave: 1 },
  ];
}
function fighter(key, kind, opts) {
  return Object.assign({ key: key, kind: kind, alive: true, fled: false,
    hp: 100, maxHp: 100, mx: 4, my: 4 }, opts || {});
}
function w4monster(key, mid) {
  return fighter(key, 'monster', { monsterId: mid || 'w4a', mdef: { id: mid || 'w4a', wave: 4 }, hp: 1000, maxHp: 1000, mx: 5, my: 5 });
}
function ally(key) {
  return fighter(key, 'ally', { villagerId: 'vil_' + key, mx: 1, my: 1 });
}

// Fake game for staging tests: party/invite/conversation surface only.
function fakeStageGame(opts) {
  opts = opts || {};
  const party = (opts.party || []).slice();
  const trust = opts.trust || {};
  const away = opts.away || {};
  const asg = opts.asg || {};
  const nodes = opts.nodes || {};
  const dead = opts.dead || {};
  const equipped = opts.equipped || {};
  const menu = opts.menu || [];
  const subjectMenu = opts.subjectMenu || [];
  const g = {
    data: { monsters: roster() },
    state: { scholar: { day: opts.day || 40 }, village: { roster: opts.roster || ['alice', 'bob', 'carol'], trust: trust, away: away, assignments: asg } },
    villagerId: 'scholar',
    map: { px: 4, py: 4 },
    _party: party, _menu: menu, _subjectMenu: subjectMenu,
    _menuSeq: opts.menuSeq || null, _turnIdx: 0, _turnIds: [],
    _convoActive: false, _convoVid: null, _endConvoCalls: 0, _talkCalls: 0,
    _inviteResult: opts.inviteResult || 'accept',
    partyUnlocked: function () { return !!opts.unlocked; },
    partyMembers: function () { return g._party.slice(); },
    inParty: function (vid) { return g._party.indexOf(vid) !== -1; },
    villageStanding: function () { return { total: opts.standing != null ? opts.standing : 0 }; },
    unlockedWave: function () { return opts.wave || 3; },
    playerAtHaven: function () { return !!opts.atHaven; },
    commLevel: function (vid) { return { level: (opts.noLang || {})[vid] ? 'none' : 'low' }; },
    npcNode: function (vid) { const n = nodes[vid]; return n || { nx: 4, ny: 4 }; },
    getPerson: function (vid) { return { id: vid, dead: !!dead[vid], equipped: equipped[vid] || null }; },
    talkTo: function (vid) { g._talkCalls++; g._convoActive = true; g._convoVid = vid; g._onSubject = false; return 'hello'; },
    convoGet: function (vid) { return { active: g._convoActive && g._convoVid === vid }; },
    convoChoices: function (vid) {
      if (!g._convoActive || g._convoVid !== vid) return [];
      if (g._menuSeq) return (g._menuSeq[Math.min(g._turnIdx || 0, g._menuSeq.length - 1)] || []).slice();
      return (g._onSubject ? g._subjectMenu : g._menu).slice();
    },
    convoTurn: function (vid, choiceId) {
      g._turnIds.push(choiceId);
      if (choiceId === 'dlg:subject') { g._onSubject = true; return { line: 'subject', choices: g._subjectMenu.slice(), ended: false }; }
      if (choiceId === 'invite_party' || choiceId === 'dlg:invite') {
        if (g._inviteResult === 'accept' && g._party.indexOf(vid) === -1) g._party.push(vid);
        return { line: g._inviteResult === 'accept' ? 'yes' : 'no', choices: [], ended: false };
      }
      g._turnIdx = (g._turnIdx || 0) + 1;
      return { line: 'ok', choices: [], ended: false };
    },
    endConvo: function (vid, how) { g._endConvoCalls++; g._convoActive = false; return true; },
    tbfight: null,
    tbIsPlayerTurn: function () { return true; },
    tbFighter: function (k) { return null; },
    tbPlayerRally: function () { return false; },
  };
  if (opts.poisonLog) {
    Object.defineProperty(g.state, 'waveKillLog', { get: function () { throw new Error('poisoned log read'); } });
  }
  return g;
}

(function () {
  // 1. Gate: closed before unlock, closed below standing 75, open at 75,
  // open when wave 4 unlocked even with low standing.
  check('gate-closed-no-unlock', STAGED.gateOpen(fakeStageGame({ unlocked: false, standing: 90, wave: 4 })) === false);
  check('gate-closed-low-standing', STAGED.gateOpen(fakeStageGame({ unlocked: true, standing: 74, wave: 3 })) === false);
  check('gate-open-standing-75', STAGED.gateOpen(fakeStageGame({ unlocked: true, standing: 75, wave: 3 })) === true);
  check('gate-open-wave4', STAGED.gateOpen(fakeStageGame({ unlocked: true, standing: 10, wave: 4 })) === true);

  // 2. Candidates: away / assigned / off-node / low-trust / in-party /
  // dead excluded; ranking armed-first, then trust, then id.
  const g2 = fakeStageGame({ unlocked: true, standing: 80, wave: 4, atHaven: true,
    roster: ['alice', 'bob', 'carol', 'dave', 'erin', 'frank', 'gail'],
    trust: { alice: 90, bob: 85, carol: 95, dave: 10, erin: 88, frank: 92, gail: 70 },
    away: { bob: { purpose: 'visit' } },
    asg: { carol: { task: 'water' } },
    nodes: { dave: { nx: 4, ny: 5 }, erin: { nx: 4, ny: 4 } },
    dead: { frank: true },
    equipped: { alice: { melee: 'spear' }, erin: null, gail: { ranged: 'bow' } },
    party: ['zoe'],
  });
  const cands = STAGED.candidates(g2, {});
  // eligible: alice (armed, 90), erin (unarmed, 88), gail (armed, 70).
  // bob away, carol assigned, dave off-node, frank dead; zoe already in party.
  check('candidates-filter-rank', cands.map(function (c) { return c.vid; }).join(',') === 'alice,gail,erin',
    JSON.stringify(cands.map(function (c) { return c.vid + ':' + c.armed + ':' + c.trust; })));

  // 3. askToJoin via invite_party: accepted.
  STAGED.resetStageallyStats();
  const g3 = fakeStageGame({ unlocked: true, standing: 80, wave: 4, atHaven: true,
    trust: { alice: 90 }, menu: [{ id: 'ask:village', label: 'v' }, { id: 'invite_party', label: 'come?' }],
    inviteResult: 'accept' });
  const o3 = STAGED.askToJoin(g3, {}, 'alice');
  check('ask-accepts', o3 === 'accepted' && g3._party.indexOf('alice') !== -1 && g3._endConvoCalls === 1,
    o3 + ' party=' + JSON.stringify(g3._party) + ' endCalls=' + g3._endConvoCalls);

  // 4. askToJoin via dlg:invite: accepted.
  const g4 = fakeStageGame({ unlocked: true, standing: 80, wave: 4, atHaven: true,
    trust: { alice: 90 }, menu: [{ id: 'dlg:invite', label: 'Want to come with us?' }],
    inviteResult: 'accept' });
  check('ask-dlg-invite-accepts', STAGED.askToJoin(g4, {}, 'alice') === 'accepted' && g4._party.indexOf('alice') !== -1);

  // 5. askToJoin declined: not in party, 7-day re-ask block recorded.
  const g5 = fakeStageGame({ unlocked: true, standing: 80, wave: 4, atHaven: true, day: 40,
    trust: { alice: 90 }, menu: [{ id: 'invite_party', label: 'come?' }],
    inviteResult: 'decline' });
  const ctx5 = {};
  check('ask-declines', STAGED.askToJoin(g5, ctx5, 'alice') === 'declined' && g5._party.indexOf('alice') === -1 &&
    ctx5._saDeclined && ctx5._saDeclined.alice === 40, JSON.stringify(ctx5._saDeclined));
  check('reask-blocked-7d', STAGED.candidates(fakeStageGame({ unlocked: true, standing: 80, wave: 4, atHaven: true,
    trust: { alice: 90 } }), Object.assign({}, ctx5, {})).length === 0 ||
    STAGED.candidates(g5, ctx5).map(function (c) { return c.vid; }).indexOf('alice') === -1);

  // 6. askToJoin not offered (reactive menu, then a dead menu): the
  // scholar answers the question once, finds no invite and no way
  // forward, ends the sitting cleanly, no talk left open.
  const ctx6 = {};
  const g6 = fakeStageGame({ unlocked: true, standing: 80, wave: 4, atHaven: true,
    trust: { alice: 90 },
    menuSeq: [[{ id: 'gq:yn:yes', label: 'yes' }, { id: 'leave', label: 'leave' }],
              [{ id: 'leave', label: 'leave' }, { id: 'silence', label: '...' }]] });
  check('ask-not-offered', STAGED.askToJoin(g6, ctx6, 'alice') === 'not-offered' && g6._endConvoCalls === 1 && g6._talkCalls === 1 &&
    ctx6._saLastAsk && ctx6._saLastAsk.answered === 1 && ctx6._saLastAsk.turns === 1,
    JSON.stringify(ctx6._saLastAsk) + ' turns=' + JSON.stringify(g6._turnIds));

  // 6a. askToJoin answers their question, then the invite opens up.
  const ctx6a = {};
  const g6a = fakeStageGame({ unlocked: true, standing: 80, wave: 4, atHaven: true,
    trust: { alice: 90 },
    menuSeq: [[{ id: 'ans:q_someone:a_tell', label: 'tell' }, { id: 'leave', label: 'leave' }],
              [{ id: 'invite_party', label: 'come?' }]],
    inviteResult: 'accept' });
  check('ask-answers-question-then-asks', STAGED.askToJoin(g6a, ctx6a, 'alice') === 'accepted' &&
    g6a._party.indexOf('alice') !== -1 && ctx6a._saLastAsk && ctx6a._saLastAsk.answered === 1 &&
    ctx6a._saLastAsk.turns === 2, JSON.stringify(ctx6a._saLastAsk) + ' turns=' + JSON.stringify(g6a._turnIds));

  // 6b. askToJoin continues their story ('goon'), then the invite opens up.
  const ctx6b = {};
  const g6b = fakeStageGame({ unlocked: true, standing: 80, wave: 4, atHaven: true,
    trust: { alice: 90 },
    menuSeq: [[{ id: 'goon', label: 'Go on.' }, { id: 'leave', label: 'leave' }],
              [{ id: 'dlg:invite', label: 'Want to come with us?' }]],
    inviteResult: 'accept' });
  check('ask-goon-then-asks', STAGED.askToJoin(g6b, ctx6b, 'alice') === 'accepted' &&
    g6b._party.indexOf('alice') !== -1 && ctx6b._saLastAsk && ctx6b._saLastAsk.answered === 0 &&
    ctx6b._saLastAsk.turns === 2, JSON.stringify(ctx6b._saLastAsk) + ' turns=' + JSON.stringify(g6b._turnIds));

  // 6c. askToJoin on a betrayal-owned menu: never accepts or declines
  // the lure — no turn is taken at all, the sitting ends not-offered.
  const ctx6c = {};
  const g6c = fakeStageGame({ unlocked: true, standing: 80, wave: 4, atHaven: true,
    trust: { alice: 90 },
    menu: [{ id: 'betrayal:accept', label: 'go with them' }, { id: 'betrayal:decline', label: 'no' },
           { id: 'leave', label: 'leave' }, { id: 'silence', label: '...' }] });
  check('ask-betrayal-menu-leaves', STAGED.askToJoin(g6c, ctx6c, 'alice') === 'not-offered' &&
    g6c._turnIds.length === 0 && g6c._endConvoCalls === 1, JSON.stringify(g6c._turnIds));

  // 6d. Candidates exclude a villager who shares no language (mime-only
  // conversation — the scholar cannot ask them), but include them when
  // the language check is clear.
  const g6d = fakeStageGame({ unlocked: true, standing: 80, wave: 4, atHaven: true,
    roster: ['alice', 'erin'], trust: { alice: 90, erin: 88 }, noLang: { erin: true } });
  check('candidates-exclude-no-language', STAGED.candidates(g6d, {}).map(function (c) { return c.vid; }).join(',') === 'alice',
    JSON.stringify(STAGED.candidates(g6d, {}).map(function (c) { return c.vid; })));
  const g6e = fakeStageGame({ unlocked: true, standing: 80, wave: 4, atHaven: true,
    roster: ['alice', 'erin'], trust: { alice: 90, erin: 88 } });
  check('candidates-include-shared-language', STAGED.candidates(g6e, {}).map(function (c) { return c.vid; }).join(',') === 'alice,erin');

  // 7. askToJoin via subject navigation when the invite hides there.
  const g7 = fakeStageGame({ unlocked: true, standing: 80, wave: 4, atHaven: true,
    trust: { alice: 90 },
    menu: [{ id: 'ask:village', label: 'v' }, { id: 'dlg:subject', label: 'something else?' }],
    subjectMenu: [{ id: 'invite_party', label: 'come?' }],
    inviteResult: 'accept' });
  check('ask-via-subject', STAGED.askToJoin(g7, {}, 'alice') === 'accepted' && g7._party.indexOf('alice') !== -1);

  // 8. stageParty: one attempt per day, calls base daily first, skips when
  // party full / not at haven / gate closed.
  STAGED.resetStageallyStats();
  baseDailyCalls = 0;
  const g8 = fakeStageGame({ unlocked: true, standing: 80, wave: 4, atHaven: true, day: 40,
    trust: { alice: 90 }, menu: [{ id: 'invite_party', label: 'come?' }], inviteResult: 'accept' });
  const ctx8 = {};
  STAGED.stagedPolicy.daily(g8, ctx8);
  STAGED.stagedPolicy.daily(g8, ctx8); // same day: no second attempt
  const st8 = STAGED.stageallyStats();
  check('stage-one-per-day', baseDailyCalls === 2 && st8.invites === 1 && st8.accepted === 1 && g8._party.length === 1,
    'base=' + baseDailyCalls + ' invites=' + st8.invites + ' accepted=' + st8.accepted);
  STAGED.resetStageallyStats();
  const g8b = fakeStageGame({ unlocked: true, standing: 80, wave: 4, atHaven: true, day: 41,
    trust: { alice: 90 }, menu: [{ id: 'invite_party', label: 'come?' }], party: ['x', 'y'] });
  STAGED.stagedPolicy.daily(g8b, {});
  check('stage-skips-when-full', STAGED.stageallyStats().invites === 0);
  STAGED.resetStageallyStats();
  const g8c = fakeStageGame({ unlocked: true, standing: 80, wave: 4, atHaven: false, day: 41,
    trust: { alice: 90 }, menu: [{ id: 'invite_party', label: 'come?' }] });
  STAGED.stagedPolicy.daily(g8c, {});
  check('stage-skips-away-from-haven', STAGED.stageallyStats().invites === 0);
  STAGED.resetStageallyStats();
  const g8d = fakeStageGame({ unlocked: true, standing: 10, wave: 3, atHaven: true, day: 41,
    trust: { alice: 90 }, menu: [{ id: 'invite_party', label: 'come?' }] });
  STAGED.stagedPolicy.daily(g8d, {});
  check('stage-skips-gate-closed', STAGED.stageallyStats().invites === 0 && STAGED.stageallyStats().gateOpenDays === 0);

  // 9. Pending hook: records a wave-4+ pending, never clears it, returns false.
  STAGED.resetStageallyStats();
  const g9 = fakeStageGame({ unlocked: true, standing: 80, wave: 4, atHaven: true,
    trust: {}, party: ['alice'] });
  g9.pendingEncounter = true;
  g9.pendingMonsterId = 'w4a';
  const r9 = STAGED.stagedPolicy.pending(g9, {});
  const st9 = STAGED.stageallyStats();
  check('pending-records-not-delays', r9 === false && g9.pendingEncounter === true && g9.pendingMonsterId === 'w4a' &&
    st9.pendingW4 === 1 && st9.pendingW4Staged === 1 && st9.pendingEvents.length === 1 &&
    st9.pendingEvents[0].partySize === 1, JSON.stringify(st9.pendingEvents));
  const g9b = fakeStageGame({ unlocked: true, standing: 80, wave: 4, atHaven: true, trust: {} });
  g9b.pendingEncounter = true;
  g9b.pendingMonsterId = 'w3a';
  STAGED.stagedPolicy.pending(g9b, {});
  check('pending-ignores-wave3', STAGED.stageallyStats().pendingW4 === 1);

  // 10. Rally trigger inherited (bankkiller fake shape): fires round 1 with
  // a live w4+ monster + a living ally; delegates without an ally.
  function fakeFightGame(opts) {
    opts = opts || {};
    const monsters = opts.monsters || [];
    const allies = opts.allies || [];
    const p = fighter('p', 'player', { hp: 100, maxHp: 100, mx: 4, my: 4 });
    const fighters = [p].concat(allies, monsters);
    const rallyCalls = [];
    return {
      data: { monsters: roster() },
      state: { scholar: { day: 50 } },
      villagerId: 'alice',
      tbfight: { id: 1, fighters: fighters, round: 1, over: false },
      tbIsPlayerTurn: function () { return true; },
      tbFighter: function (k) { return fighters.find(function (f) { return f.key === k; }) || null; },
      tbPlayerRally: function () { rallyCalls.push(1); return true; },
      _rallyCalls: rallyCalls,
    };
  }
  baseFightCalls = 0;
  RALLY.resetBankkillerStats();
  const gf = fakeFightGame({ monsters: [w4monster('m1')], allies: [ally('a1')] });
  const rf = STAGED.stagedPolicy.fight(gf, {});
  check('rally-inherited-fires', rf === true && gf._rallyCalls.length === 1 && baseFightCalls === 0);
  baseFightCalls = 0;
  const gf2 = fakeFightGame({ monsters: [w4monster('m1')], allies: [] });
  STAGED.stagedPolicy.fight(gf2, {});
  check('rally-inherited-no-ally-delegates', gf2._rallyCalls.length === 0 && baseFightCalls === 1);

  // 11. The policy NEVER reads state.waveKillLog (poisoned getter) — in
  // staging, fighting, or pending.
  const g11 = fakeStageGame({ unlocked: true, standing: 80, wave: 4, atHaven: true, day: 40,
    trust: { alice: 90 }, menu: [{ id: 'invite_party', label: 'come?' }], inviteResult: 'accept', poisonLog: true });
  let threw11 = false;
  try {
    STAGED.stagedPolicy.daily(g11, {});
    STAGED.stagedPolicy.pending(Object.assign(g11, { pendingEncounter: true, pendingMonsterId: 'w4a' }), {});
  } catch (e) { threw11 = true; }
  check('never-reads-kill-log', threw11 === false, 'threw=' + threw11);
})();

// ---------- analyzer fixtures ----------
function row(seed, opts) {
  const r = {
    seed: seed, policy: 'baseline', run: 'fixture', days: 100, endReason: 'horizon', won: false, fights: [],
    daily: [{ day: 1, gated: 0, raw: 0, readiness5: { veterans: 0 }, partySize: 0 }],
    waveKillLog: [], fallen: [], wavesFaced: {}, instrumentErrors: [],
    killsLive: [], scholarDeaths: [], killerTrack: [], rallyCalls: [], tbFights: [],
    bankkillerStats: { w4plusFights: 0, alliesPresentFights: 0, rallyFires: 0, rallyOk: 0, rallyFalse: 0, rallyErrors: 0, events: [] },
    stageallyStats: { gateOpenDays: 0, stageDays: 0, invites: 0, accepted: 0, declined: 0, notOffered: 0, errors: 0, pendingW4: 0, pendingW4Staged: 0, events: [], pendingEvents: [] },
    deadMap: {}, scaleRank: 'village', unlockedWave: 1, maxWave: 1,
  };
  return Object.assign(r, opts || {});
}
function kill(d, mid, w, by, via) { return { d: d, mid: mid, w: w, by: by, via: via || 'player', trick: null }; }
function liveKill(d, mid, w, by) {
  return { day: d, mid: mid, wave: w, by: by, via: 'player', scholarAtKill: by, scholarChannel: true };
}
function tbFight(day, opts) {
  return Object.assign({ seq: 1, day: day, mid: 'w4a', wave: 4, alliesAtEntry: 1, partyAtEntry: 1,
    allyIds: ['bob'], partyIds: ['bob'], outcome: 'won', scholarDiedInFight: false,
    scholarHpFracEnd: 0.5, monsterHpFracEnd: 0, rounds: 4 }, opts || {});
}
function mkLeg(policy, opts) {
  // 8 synthetic rows. opts: productionSeeds, fires, killRate, pairDay (seed
  // index with a pair snapshot), postBloodKills (armed-leg total), days
  // (median driver), allyPresence (share of tb fights with an ally).
  opts = opts || {};
  const rows = [];
  for (let i = 0; i < 8; i++) {
    const prod = i < (opts.productionSeeds || 0);
    const fights = [];
    for (let f = 0; f < 50; f++) fights.push({ day: 50 + f, channel: f < 25 ? 'player-tb' : 'field', mid: 'w4a', wave: 4 });
    const tb = [];
    for (let f = 0; f < 25; f++) tb.push(tbFight(50 + f, { seq: f + 1, alliesAtEntry: (f < Math.round(25 * (opts.allyPresence != null ? opts.allyPresence : 0.8))) ? 1 : 0, partyAtEntry: 0 }));
    const nkills = Math.round(50 * (opts.killRate != null ? opts.killRate : 0.1));
    const log = [];
    const live = [];
    // ALL base kills land on day 60 (first-blood day) so post-first-blood
    // counts are exactly the `extraKills` below — otherwise the base log's
    // own spread days would inflate the post-blood total.
    for (let k = 0; k < nkills; k++) {
      const by = prod ? (k % 2 === 0 ? 'alice' : 'bob') : 'alice';
      log.push(kill(60, 'w4a', 4, by));
      live.push(liveKill(60, 'w4a', 4, by));
    }
    // Post-first-blood kills: extra kills after day 60 by a second killer
    // on the armed leg, counted via waveKillLog day > firstBloodDay.
    const extraKills = (policy === 'staged' && i === 0) ? (opts.postBloodKills || 0) : 0;
    for (let k = 0; k < extraKills; k++) {
      log.push(kill(80 + k, 'w4a', 4, 'carol'));
      live.push(liveKill(80 + k, 'w4a', 4, 'carol'));
    }
    const calls = [];
    const fires = policy === 'staged' ? (opts.fires || 0) : 0;
    for (let c = 0; c < fires; c++) calls.push({ day: 55 + c, round: 1, allies: 1, w4monsters: 1, w4mids: ['w4a'], result: true });
    const pairDay = (opts.pairDay === i);
    rows.push(row(55001 + i, {
      policy: policy,
      days: opts.days != null ? opts.days : 100,
      fights: fights, tbFights: tb, waveKillLog: log, killsLive: live,
      rallyCalls: policy === 'staged' ? calls : [],
      bankkillerStats: { w4plusFights: 50, alliesPresentFights: 40, rallyFires: fires, rallyOk: fires, rallyFalse: 0, rallyErrors: 0, events: [] },
      stageallyStats: { gateOpenDays: 50, stageDays: 20, invites: 5, accepted: 2, declined: 2, notOffered: 1, errors: 0, pendingW4: 10, pendingW4Staged: 8, events: [], pendingEvents: [] },
      daily: [{ day: 100, gated: 150, raw: 180, readiness5: { veterans: pairDay ? 2 : (prod ? 1 : 0) }, partySize: 2 }],
    }));
  }
  return rows;
}
(function () {
  // 12. THIN T1: armed fires < 8 in total across the leg.
  const thinRows = mkLeg('staged', { productionSeeds: 2, fires: 1, killRate: 0.1, allyPresence: 0.8, postBloodKills: 5 });
  thinRows.slice(1).forEach(function (r) { r.bankkillerStats.rallyFires = 0; r.bankkillerStats.rallyOk = 0; r.rallyCalls = []; });
  const vThin = AN.verdictFor(mkLeg('baseline', { killRate: 0.1 }), thinRows);
  check('verdict-thin-t1', vThin.verdict === 'THIN', vThin.verdict + ' ' + vThin.reason);
  // 13. THIN T2: ally presence < 40% with >= 10 armed w4+ TB fights.
  const vThin2 = AN.verdictFor(mkLeg('baseline', { killRate: 0.1 }),
    mkLeg('staged', { productionSeeds: 2, fires: 2, killRate: 0.1, allyPresence: 0.2, postBloodKills: 5 }));
  check('verdict-thin-t2', vThin2.verdict === 'THIN', vThin2.verdict + ' ' + vThin2.reason);
  // 14. GO via living pair: pair snapshot on 1 armed seed, guards hold.
  const vGoPair = AN.verdictFor(mkLeg('baseline', { killRate: 0.1 }),
    mkLeg('staged', { productionSeeds: 1, fires: 2, killRate: 0.1, allyPresence: 0.8, pairDay: 0 }));
  check('verdict-go-pair', vGoPair.verdict === 'GO', vGoPair.verdict + ' ' + vGoPair.reason);
  // 15. GO via post-first-blood kills >= 3 (no pair day).
  const vGoPost = AN.verdictFor(mkLeg('baseline', { killRate: 0.1 }),
    mkLeg('staged', { productionSeeds: 1, fires: 2, killRate: 0.1, allyPresence: 0.8, postBloodKills: 3 }));
  check('verdict-go-postblood', vGoPost.verdict === 'GO', vGoPost.verdict + ' ' + vGoPost.reason);
  // 16. NO-GO: primary missed (no pair, post-blood 2).
  const vMiss = AN.verdictFor(mkLeg('baseline', { killRate: 0.1 }),
    mkLeg('staged', { productionSeeds: 1, fires: 2, killRate: 0.1, allyPresence: 0.8, postBloodKills: 2 }));
  check('verdict-nogo-primary', vMiss.verdict === 'NO-GO', vMiss.verdict + ' ' + vMiss.reason);
  // 17. NO-GO: guard fails — armed median 11d below baseline (bar: -10d).
  const vGuard = AN.verdictFor(mkLeg('baseline', { killRate: 0.1, days: 100 }),
    mkLeg('staged', { productionSeeds: 1, fires: 2, killRate: 0.1, allyPresence: 0.8, pairDay: 0, days: 89 }));
  check('verdict-nogo-guard', vGuard.verdict === 'NO-GO', vGuard.verdict + ' ' + vGuard.reason);
  // 18. Guard boundary holds: armed median exactly 10d below baseline.
  const vGuardEdge = AN.verdictFor(mkLeg('baseline', { killRate: 0.1, days: 100 }),
    mkLeg('staged', { productionSeeds: 1, fires: 2, killRate: 0.1, allyPresence: 0.8, pairDay: 0, days: 90 }));
  check('verdict-guard-edge-holds', vGuardEdge.verdict === 'GO', vGuardEdge.verdict + ' ' + vGuardEdge.reason);
  // 19. Fight-level TB survival + staging splits on a synthetic row.
  const extra = AN.perSeedExtra(row(55001, {
    tbFights: [tbFight(50, { scholarDiedInFight: true }), tbFight(60, { scholarDiedInFight: false }), tbFight(70, { scholarDiedInFight: false, alliesAtEntry: 0 })],
    fights: [
      { day: 50, channel: 'player-tb', mid: 'w4a', wave: 4 },
      { day: 60, channel: 'player-tb', mid: 'w4a', wave: 4 },
      { day: 70, channel: 'field', mid: 'w4a', wave: 4 },
    ],
    waveKillLog: [kill(55, 'w4a', 4, 'alice'), kill(65, 'w4a', 4, 'bob')],
    killsLive: [liveKill(55, 'w4a', 4, 'alice'), liveKill(65, 'w4a', 4, 'bob')],
    scholarDeaths: [{ day: 50, scholarId: 'alice', causeArg: 'injuries', atHaven: true, inCombat: true, pendingEncounter: false }],
    daily: [
      { day: 1, gated: 0, raw: 0, readiness5: { veterans: 0 }, partySize: 0 },
      { day: 2, gated: 80, raw: 80, readiness5: { veterans: 0 }, partySize: 2 },
    ],
    stageallyStats: { gateOpenDays: 1, stageDays: 1, invites: 2, accepted: 1, declined: 1, notOffered: 0, errors: 0, pendingW4: 4, pendingW4Staged: 3, events: [], pendingEvents: [] },
  }));
  check('tb-survival-fight-level', extra.tbFightsW4 === 3 && extra.tbDeathsInFight === 1 &&
    Math.abs(extra.tbSurvivalFightLevel - (2 / 3)) < 1e-9 &&
    Math.abs(extra.allyPresence - (2 / 3)) < 1e-9 &&
    extra.partyDays2 === 1 && extra.invites === 2 && extra.invitesAccepted === 1 &&
    Math.abs(extra.pendingStagedShare - 0.75) < 1e-9,
    JSON.stringify({ tb: extra.tbFightsW4, surv: extra.tbSurvivalFightLevel, ally: extra.allyPresence, party2: extra.partyDays2 }));
})();
COMP.competent.daily = realDaily;
COMP.competent.fight = realFight;

async function liveLegs() {
  const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
  const INST = require(path.join(REPO, 'scripts', 'stageally-instrument-20261106'));
  const STAGEDMOD = require(path.join(REPO, 'scripts', 'policies', 'competent-stageally-a'));

  // 20. Live harness smoke: 5 days, staged policy, instrument on, 0 errors;
  // daily snapshots carry the party fields.
  const { Game } = await loadGame({ seed: 55001, mode: 'competent-stageally-proof', fullTelemetry: false });
  await setupGame(Game);
  const inst = INST.install(Game);
  let last = -1;
  const wrapped = Object.assign({}, STAGEDMOD.stagedPolicy, {
    daily: function (Gm, ctx) {
      try { return STAGEDMOD.stagedPolicy.daily(Gm, ctx); } finally {
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
  const snap0 = inst.t.daily[0] || {};
  check('live-smoke', result && result.days > 0 && inst.t.daily.length > 0 && inst.t.instrumentErrors.length === 0 &&
    Array.isArray(inst.t.rallyCalls) && Array.isArray(inst.t.tbFights) && Array.isArray(fin.waveKillLog) &&
    snap0.partySize != null && snap0.partyIds !== undefined,
    'days=' + (result && result.days) + ' snaps=' + inst.t.daily.length + ' errs=' + JSON.stringify(inst.t.instrumentErrors) +
    ' partySize=' + snap0.partySize);

  // 21. Staged live rally: a real wave-4 monster + a real ally in a real
  // TB fight — the policy's fight hook calls the real tbPlayerRally and
  // the engine marks the allies rallied (turn cascade stubbed, as in the
  // bankkiller staged test). The hand-built fight never passes through
  // startCombat, so no tbFights row is expected here — the row is proven
  // on a fake Game in test 21b below.
  const w4def = (Game.data.monsters || []).find(function (m) { return m && (m.wave | 0) === 4; });
  check('staged-setup-w4def', !!w4def, 'no wave-4 def in roster');
  if (w4def) {
    const realAfter = Game.tbAfterPlayerAction;
    Game.tbAfterPlayerAction = function () {};
    try {
      const p = { key: 'p', kind: 'player', name: 'You', hp: 200, maxHp: 200, mx: 4, my: 4, alive: true, fled: false, speed: 3, moveLeft: 3, acted: false };
      const a1 = { key: 'a_1', kind: 'ally', villagerId: 'vil_a', name: 'Ally One', hp: 100, maxHp: 100, speed: 3, mx: 1, my: 1, alive: true, fled: false, ai: 'brave', moveLeft: 3, acted: false };
      const m1 = { key: 'm1', kind: 'monster', monsterId: w4def.id, mdef: w4def, name: w4def.id, hp: 1000, maxHp: 1000, mx: 5, my: 4, alive: true, fled: false, speed: 2, moveLeft: 2, acted: false };
      Game.tbfight = { id: 99, fighters: [p, a1, m1], order: ['p', 'a_1', 'm1'], turnIdx: 0, round: 1, over: false };
      Game.tbFighter = function (k) { return Game.tbfight.fighters.find(function (f) { return f.key === k; }) || null; };
      Game.tbGridMax = function () { return 8; };
      const inst2 = INST.install(Game);
      const ctx = {};
      const ret = STAGEDMOD.stagedPolicy.fight(Game, ctx);
      const calls = inst2.t.rallyCalls;
      inst2.uninstall();
      check('staged-rally-fires', ret === true && calls.length === 1 && calls[0].result === true &&
        calls[0].w4monsters === 1 && a1.rallied === 3,
        'ret=' + ret + ' calls=' + JSON.stringify(calls) + ' rallied=' + a1.rallied);
      Game.tbfight = null;
    } finally {
      Game.tbAfterPlayerAction = realAfter;
    }
  }

  // 21b. Instrument fight-level rows on a fake Game that mimics the engine
  // contract (startCombat builds the fight, tbEnd closes + nulls it,
  // playerDeath fires mid-fight). The real engine path is covered by the
  // judged driver; this pins the row bookkeeping.
  (function () {
    const fakeFighters = function () {
      return [
        { key: 'p', kind: 'player', villagerId: 'scholar', hp: 50, maxHp: 200, alive: true, fled: false },
        { key: 'a_1', kind: 'ally', villagerId: 'bob', hp: 80, maxHp: 100, alive: true, fled: false },
        { key: 'm1', kind: 'monster', monsterId: 'w4a', mdef: { id: 'w4a', wave: 4 }, hp: 400, maxHp: 1000, alive: true, fled: false },
      ];
    };
    const fg = {
      data: { monsters: roster() },
      state: { scholar: { day: 60 }, village: { roster: ['scholar', 'bob'], trust: {}, party: ['bob'] } },
      villagerId: 'scholar',
      tbfight: null,
      partyMembers: function () { return ['bob']; },
      tbPlayerRally: function () { return true; },
      startCombat: function (mid) { fg.tbfight = { id: 7, fighters: fakeFighters(), round: 1, over: false }; return true; },
      fieldFight: function () { return { outcome: 'fled' }; },
      recordWaveKill: function () { return true; },
      playerDeath: function () { return true; },
      tbEnd: function (result) { const f = fg.tbfight; if (!f || f.over) return; f.over = true; f.result = result; fg.tbfight = null; },
      villageStanding: function () { return { total: 80 }; },
      villageStandingTotal: function () { return 80; },
      waveCombatReadiness: function () { return { wave: 5, ready: false, veterans: 0 }; },
      waveEngaged: function () { return 0; },
      deedState: function () { return { wavesFaced: {} }; },
      scaleRank: function () { return 'village'; },
      unlockedWave: function () { return 4; },
      villageStandingTotal2: null,
      getPerson: function (vid) { return { id: vid, dead: false }; },
    };
    const inst3 = INST.install(fg);
    fg.startCombat('w4a');
    check('tb-row-entry', inst3.t.tbFights.length === 1 && inst3.t.tbFights[0].wave === 4 &&
      inst3.t.tbFights[0].alliesAtEntry === 1 && inst3.t.tbFights[0].partyAtEntry === 1 &&
      inst3.t.tbFights[0].outcome === null, JSON.stringify(inst3.t.tbFights[0]));
    fg.playerDeath('injuries');
    fg.tbEnd('lost');
    check('tb-row-outcome-and-death', inst3.t.tbFights.length === 1 && inst3.t.tbFights[0].outcome === 'lost' &&
      inst3.t.tbFights[0].scholarDiedInFight === true &&
      Math.abs(inst3.t.tbFights[0].scholarHpFracEnd - 0.25) < 1e-9 &&
      Math.abs(inst3.t.tbFights[0].monsterHpFracEnd - 0.4) < 1e-9,
      JSON.stringify(inst3.t.tbFights[0]));
    // Second fight, then a dissolve-without-tbEnd: the stale row must close
    // from the fight object's own result when the next fight starts.
    fg.startCombat('w4a');
    check('tb-row-second-fight', inst3.t.tbFights.length === 2 && inst3.t.tbFights[1].outcome === null,
      JSON.stringify(inst3.t.tbFights.map(function (r) { return r.outcome; })));
    fg.tbfight.over = true;
    fg.tbfight.result = 'dissolved';
    fg.startCombat('w4a');
    check('tb-row-dissolve-repair', inst3.t.tbFights.length === 3 && inst3.t.tbFights[0].outcome === 'lost' &&
      inst3.t.tbFights[1].outcome === 'dissolved' && inst3.t.tbFights[2].outcome === null,
      JSON.stringify(inst3.t.tbFights.map(function (r) { return r.outcome; })));
    inst3.uninstall();
    check('tb-row-no-errors', inst3.t.instrumentErrors.length === 0, JSON.stringify(inst3.t.instrumentErrors));
  })();

  // 22. Live invite leg: 40 days on seed 55001 (gate opens ~day 28 there) —
  // the staging path must ENGAGE: invites attempted, at least one ask
  // reaching a villager and getting an answer (accepted + declined > 0 —
  // the ask lands instead of dying not-offered), and a party day in the
  // snapshots. Acceptance itself is NOT asserted here: on this seed the
  // armed pool is alone-goal (see the prereg smoke note — 5 declines,
  // 0 accepts is the seed's answer, not a broken probe), so whether
  // accepts land is the judged 8-seed run's question. The smoke proves
  // the mechanism engages; the run proves whether it stages.
  const tmp = '/tmp/stageally-proof-' + process.pid;
  fs.mkdirSync(tmp, { recursive: true });
  const envBase = Object.assign({}, process.env, { REPO: REPO, OUTDIR: tmp, POLICY: 'staged' });
  execSync('node scripts/stageally-driver-20261106.js', { cwd: REPO, env: Object.assign({}, envBase, { DAYS: '40', SEEDS: '55001', RUN: 'proof-invite' }), stdio: 'pipe' });
  const inv = JSON.parse(fs.readFileSync(path.join(tmp, 'stageally-s55001-proof-invite.json'), 'utf8'));
  const invStats = inv.stageallyStats || {};
  const partyDays = (inv.daily || []).filter(function (d) { return (d.partySize | 0) >= 1; }).length;
  const answeredAsks = (invStats.accepted || 0) + (invStats.declined || 0);
  check('live-invite-engages', (invStats.invites || 0) > 0 && answeredAsks > 0 && partyDays >= 1 &&
    (inv.instrumentErrors || []).length === 0,
    'invites=' + invStats.invites + ' accepted=' + invStats.accepted + ' declined=' + invStats.declined +
    ' notOffered=' + invStats.notOffered + ' partyDays=' + partyDays + ' errs=' + JSON.stringify(inv.instrumentErrors));

  // 23. Neutrality off/on: driver, staged policy, 10d, seed 55001, /tmp.
  // Gate is closed this early (standing < 75, wave < 4), so off/on must match.
  execSync('node scripts/stageally-driver-20261106.js', { cwd: REPO, env: Object.assign({}, envBase, { DAYS: '10', SEEDS: '55001', RUN: 'proof-off', STAGEALLY_OFF: '1' }), stdio: 'pipe' });
  execSync('node scripts/stageally-driver-20261106.js', { cwd: REPO, env: Object.assign({}, envBase, { DAYS: '10', SEEDS: '55001', RUN: 'proof-on' }), stdio: 'pipe' });
  const off = JSON.parse(fs.readFileSync(path.join(tmp, 'stageally-s55001-proof-off.json'), 'utf8'));
  const on = JSON.parse(fs.readFileSync(path.join(tmp, 'stageally-s55001-proof-on.json'), 'utf8'));
  check('neutrality-off-on', off.days === on.days && off.endReason === on.endReason &&
    (off.waveKillLog || []).length === (on.waveKillLog || []).length &&
    on.instrumentErrors.length === 0,
    'off=' + off.days + '/' + off.endReason + '/' + (off.waveKillLog || []).length +
    ' on=' + on.days + '/' + on.endReason + '/' + (on.waveKillLog || []).length +
    ' errs=' + JSON.stringify(on.instrumentErrors));

  // 24. Neutrality staged-vs-baseline, 10d: gate closed, so trajectories
  // must match and invites must be 0.
  execSync('node scripts/stageally-driver-20261106.js', { cwd: REPO, env: Object.assign({}, envBase, { DAYS: '10', SEEDS: '55001', RUN: 'proof-base', POLICY: 'baseline' }), stdio: 'pipe' });
  const base = JSON.parse(fs.readFileSync(path.join(tmp, 'stageally-s55001-proof-base.json'), 'utf8'));
  check('neutrality-staged-vs-baseline', base.days === on.days && base.endReason === on.endReason &&
    (base.waveKillLog || []).length === (on.waveKillLog || []).length &&
    (on.stageallyStats ? on.stageallyStats.invites : -1) === 0 &&
    (on.bankkillerStats ? on.bankkillerStats.rallyFires : -1) === 0,
    'base=' + base.days + '/' + base.endReason + ' on=' + on.days + '/' + on.endReason +
    ' invites=' + JSON.stringify(on.stageallyStats && on.stageallyStats.invites) +
    ' fires=' + JSON.stringify(on.bankkillerStats && on.bankkillerStats.rallyFires));

  // 25. Determinism: same driver leg twice, identical judged fields.
  execSync('node scripts/stageally-driver-20261106.js', { cwd: REPO, env: Object.assign({}, envBase, { DAYS: '10', SEEDS: '55001', RUN: 'proof-det1' }), stdio: 'pipe' });
  execSync('node scripts/stageally-driver-20261106.js', { cwd: REPO, env: Object.assign({}, envBase, { DAYS: '10', SEEDS: '55001', RUN: 'proof-det2' }), stdio: 'pipe' });
  const d1 = JSON.parse(fs.readFileSync(path.join(tmp, 'stageally-s55001-proof-det1.json'), 'utf8'));
  const d2 = JSON.parse(fs.readFileSync(path.join(tmp, 'stageally-s55001-proof-det2.json'), 'utf8'));
  check('determinism', d1.days === d2.days && d1.endReason === d2.endReason &&
    JSON.stringify(d1.waveKillLog) === JSON.stringify(d2.waveKillLog) &&
    JSON.stringify(d1.fights) === JSON.stringify(d2.fights),
    'd1=' + d1.days + ' d2=' + d2.days);
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}

  console.log(pass + '/' + (pass + fail) + ' PASS');
  process.exit(fail ? 1 : 0);
}
liveLegs().catch(function (e) { console.error(e.stack); process.exit(1); });
