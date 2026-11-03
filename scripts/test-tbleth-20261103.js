// test-tbleth-20261103.js — proof test for the TB lethality
// decomposition instrument + analyzer (arm sim-tbleth-a).
// Fixture classification, ledger reconciliation, source classes,
// mid-fight joiner, unlinked kill, plus a live-harness smoke.
// Usage: node scripts/test-tbleth-20261103.js
'use strict';
const path = require('path');
const assert = require('assert');
const A = require(path.join(__dirname, 'tbleth-analyze-20261103'));
const INST = require(path.join(__dirname, 'tbleth-instrument-20261103'));

let pass = 0;
function ok(name, fn) { fn(); pass++; console.log('ok ' + pass + ' - ' + name); }
function ex(over) {
  return Object.assign({
    seq: 1, type: 'tb', day: 10, mid: 'm4', wave: 4, leadVid: 'v_s',
    partySizeStart: 1, leadGear: { armorP: 20, armed: true, weapon: 'Spear' },
    hits: [], monsters: [{ key: 'm_0', mid: 'm4', hpStart: 1000, maxHp: 1000, wave: 4, joinedMidFight: false }],
    end: null, kills: [], superseded: false,
  }, over);
}

// 1. Outcome classes incl. pyrrhic split.
ok('tb outcome classes incl pyrrhic', function () {
  const end = function (r) { return { result: r, monsters: [], humans: [] }; };
  const kill = [{ day: 10, fn: 'recordWaveKill', pyrrhic: false, mid: 'm4', wave: 4, by: 'v_s', via: 'player', linkSeq: 1, linkHow: 'tb-open' }];
  assert.strictEqual(A.classify(ex({ end: end('won'), kills: kill })), 'kill');
  assert.strictEqual(A.classify(ex({ end: end('routed'), kills: kill })), 'kill');
  assert.strictEqual(A.classify(ex({ end: end('lost'), kills: [] })), 'fighter-died');
  assert.strictEqual(A.classify(ex({ end: end('lost'), kills: kill })), 'pyrrhic');
  assert.strictEqual(A.classify(ex({ end: end('fled'), kills: [] })), 'fled');
  assert.strictEqual(A.classify(ex({ end: end('calmed'), kills: [] })), 'tb-other:calmed');
  assert.strictEqual(A.classify(ex({ end: null, kills: [] })), 'tb-unended');
});

// 2. Ledger reconciles on a fixture (startHp + dealt = endHp, gap 0),
// and an unexplained gap opens the ledger.
ok('ledger reconciles; unexplained gap opens it', function () {
  const hits = [
    { round: 1, targetKind: 'monster', targetKey: 'm_0', targetMid: 'm4', sourceKey: 'p', sourceLabel: 'you', requested: 100, returned: 50, hpBefore: 1000, hpAfter: 950, hpDelta: -50, sourceClass: 'leader' },
    { round: 2, targetKind: 'monster', targetKey: 'm_0', targetMid: 'm4', sourceKey: 'm_1', sourceLabel: 'ally strike', requested: 30, returned: 30, hpBefore: 950, hpAfter: 920, hpDelta: -30, sourceClass: 'ally' },
  ];
  const e = ex({ hits: hits, end: { result: 'lost', monsters: [{ key: 'm_0', mid: 'm4', alive: true, hp: 920 }], humans: [] } });
  const led = A.ledgerFor(e);
  assert.strictEqual(led.length, 1);
  assert.strictEqual(led[0].dealt, 80);
  assert.strictEqual(led[0].dealtBy.leader, 50);
  assert.strictEqual(led[0].dealtBy.ally, 30);
  assert.strictEqual(led[0].endHp, 920);
  assert.strictEqual(led[0].gap, 0);
  const s = A.summarize(e);
  assert.strictEqual(s.ledgerOpen, false);
  const e2 = ex({ hits: hits, end: { result: 'lost', monsters: [{ key: 'm_0', mid: 'm4', alive: true, hp: 900 }], humans: [] } });
  assert.strictEqual(A.summarize(e2).ledgerOpen, true, '20 HP unexplained gap opens the ledger');
  assert.strictEqual(A.ledgerFor(e2)[0].gap, -20);
});

// 3. Stub-Game known TB fight: wraps fire, identity at start,
// tbDamage ledger + source classes, joiner, kill linkage, unlinked.
ok('stub known TB fight: fire, ledger, classes, joiner, linkage', function () {
  const fighters = [
    { key: 'p', kind: 'player', villagerId: 'v_s', alive: true, hp: 80, maxHp: 80 },
    { key: 'a_0', kind: 'villager', villagerId: 'v_x', alive: true, hp: 60, maxHp: 60 },
    { key: 'm_0', kind: 'monster', mdef: { id: 'm4' }, alive: true, hp: 1000, maxHp: 1000 },
  ];
  const stub = {
    state: { scholar: { day: 5, monster: null, health: 80, energy: 70 }, village: { roster: ['v_s', 'v_x'] }, waveKillLog: [] },
    data: { monsters: [{ id: 'm4', wave: 4 }], items: [], villagers: [{ id: 'v_x' }] },
    villagerId: 'v_s', pendingMonsterId: null, tbfight: null,
    armorBonus: function () { return 20; },
    equippedWeapon: function () { return { unarmed: false, name: 'Spear' }; },
    vpOf: function (vid) { return vid === 'v_x' ? { id: 'v_x', dead: false, items: [] } : {}; },
    monsterCounterKnown: function (id) { return id === 'm4'; },
    tbFighter: function (k) { return fighters.find(function (f) { return f.key === k; }) || null; },
    spawnWorldMonster: function () { return { id: 'm4', wave: 4 }; },
    startCombat: function () {
      this.tbfight = { id: 'f1', round: 1, fighters: fighters };
      return null;
    },
    tbEnd: function () {
      this.recordWaveKill('m4', 'v_s', 'player', null);
      this.tbfight = null; return null;
    },
    fieldFight: function () { return { outcome: 'vDie' }; },
    // Engine-like tbDamage: armor absorbs half of a monster-target hit;
    // returns the actual applied damage; kills at hp<=0.
    tbDamage: function (targetKey, dmg) {
      const t = this.tbFighter(targetKey);
      if (!t || !t.alive) return 0;
      const applied = (t.kind === 'monster') ? Math.floor(dmg / 2) : dmg;
      t.hp = Math.max(0, t.hp - applied);
      if (t.hp <= 0) t.alive = false;
      return applied;
    },
    say: function () { return null; },
    sysSay: function () { return null; },
    useAbility: function (id) { this.tbDamage('m_0', 40, id, null, {}); return true; },
    tbPlayerShout: function () { return true; },
    tbPlayerOfferFood: function () { return true; },
    recordWaveKill: function (mid, by) { this.state.waveKillLog.push({ d: 5, mid: mid, w: 4, by: by, via: 'player' }); return null; },
    recordPyrrhicKill: function () { return null; },
    tele: function () { return null; },
  };
  const inst = INST.install(stub);
  const t = inst.t;
  assert.strictEqual(t.instrumentErrors.length, 0, 'clean install: ' + JSON.stringify(t.instrumentErrors));
  stub.spawnWorldMonster({ id: 'm4' }, 1, 2, {});
  stub.startCombat('m4');
  assert.strictEqual(t.exposures.length, 1, 'TB exposure created at start');
  const e = t.exposures[0];
  assert.strictEqual(e.partySizeStart, 2, 'humans at start: scholar + 1 ally');
  assert.strictEqual(e.leadGear.armorP, 20);
  assert.strictEqual(e.trickKnown, true);
  assert.strictEqual(e.scholarStart.health, 80);
  // Leader strike: requested 100, armor absorbs half -> 50 stuck.
  stub.tbfight.round = 1;
  stub.tbDamage('m_0', 100, 'you', 'p', {});
  // Ally strike: requested 30 -> 15 stuck, sourceKey is the ally fighter key.
  stub.tbDamage('m_0', 30, 'ally strike', 'a_0', {});
  // Ability use inside useAbility stack -> ability-or-trick class.
  stub.useAbility('bird_strike');
  // Monster hit on the leader.
  stub.tbDamage('p', 25, "the beast's paw", 'm_0', {});
  // Shout + offerFood use counts.
  stub.tbPlayerShout();
  stub.tbPlayerOfferFood();
  // Mid-fight joiner: a second monster fighter appears, then takes damage.
  fighters.push({ key: 'm_1', kind: 'monster', mdef: { id: 'm4' }, alive: true, hp: 500, maxHp: 500 });
  stub.tbDamage('m_1', 60, 'you', 'p', {});
  assert.strictEqual(e.hits.length, 5, 'all five pre-kill hits recorded');
  const h0 = e.hits[0];
  assert.strictEqual(h0.requested, 100);
  assert.strictEqual(h0.returned, 50);
  assert.strictEqual(h0.hpDelta, -50);
  assert.strictEqual(h0.sourceClass, 'leader');
  assert.strictEqual(e.hits[1].sourceClass, 'ally');
  assert.strictEqual(e.hits[2].sourceClass, 'ability-or-trick');
  assert.strictEqual(e.hits[3].targetKind, 'player');
  assert.strictEqual(e.hits[3].sourceClass, 'other');
  assert.strictEqual(e.shoutUses, 1);
  assert.strictEqual(e.offerFoodUses, 1);
  assert.strictEqual(e.abilityUses.length, 1);
  const joiner = e.monsters.find(function (m) { return m.key === 'm_1'; });
  assert.ok(joiner && joiner.joinedMidFight, 'joiner flagged with join HP');
  assert.strictEqual(joiner.hpStart, 500);
  // Transcript capture.
  stub.say('You strike for 50.');
  assert.strictEqual(e.transcript.length, 1);
  // Finish: killing blow on m_0 (hp now 1000-50-15-20=915; deal 2000 -> 1000 stuck... use exact).
  stub.tbfight.round = 2;
  stub.tbDamage('m_0', 2000, 'you', 'p', {});
  assert.strictEqual(stub.tbFighter('m_0').alive, false);
  stub.tbEnd('won');
  assert.strictEqual(e.end.result, 'won');
  assert.strictEqual(e.end.round, 2);
  assert.strictEqual(e.kills.length, 1, 'TB kill linked by open fight');
  assert.strictEqual(e.kills[0].linkHow, 'tb-open');
  assert.strictEqual(A.classify(e), 'kill');
  // Ledger: m_0 dealt = 50+15+20+915 = 1000, endHp 0, gap 0.
  // m_1 dealt 30, endHp 470 (pre-call snapshot: alive, hp 470), gap 0.
  const led = A.ledgerFor(e);
  assert.strictEqual(led.length, 2);
  const l0 = led.find(function (r) { return r.key === 'm_0'; });
  assert.strictEqual(l0.dealt, 1000);
  assert.strictEqual(l0.endHp, 0);
  assert.strictEqual(l0.gap, 0);
  const l1 = led.find(function (r) { return r.key === 'm_1'; });
  assert.strictEqual(l1.dealt, 30);
  assert.strictEqual(l1.endHp, 470);
  assert.strictEqual(l1.gap, 0);
  assert.strictEqual(A.summarize(e).ledgerOpen, false);
  // A kill with no open fight is unlinked, never force-joined.
  stub.recordWaveKill('m4', 'v_x', 'contest', null);
  assert.strictEqual(t.unlinkedKills.length, 1, 'stray kill reported unlinked');
  assert.strictEqual(t.orphanTbEnds.length, 0);
  assert.strictEqual(t.instrumentErrors.length, 0);
  assert.ok(t.wrapCounts.tbDamage === 6 && t.wrapCounts.startCombat === 1, 'fire counts prove wraps fired');
  inst.uninstall();
});

// 4. Live harness smoke: install on the real game, kill row captured
// + unlinked, no harness break, clean uninstall.
(async function () {
  const { loadGame, setupGame } = require(path.join(__dirname, 'sim-harness'));
  const { Game } = await loadGame({ seed: 99101, mode: 'tbleth-proof', fullTelemetry: false });
  await setupGame(Game);
  const inst = INST.install(Game);
  try {
    const m4 = (Game.data.monsters || []).find(function (m) { return m && (m.wave || 1) === 4; });
    assert.ok(m4, 'a wave-4 monster def must exist');
    assert.strictEqual(typeof Game.tbDamage, 'function', 'tbDamage wrap installed');
    assert.strictEqual(typeof Game.startCombat, 'function', 'startCombat wrap installed');
    const roster = ((Game.state || {}).village || {}).roster || [];
    const vid = roster.find(function (id) { return id && id !== Game.villagerId; }) || Game.villagerId;
    Game.recordWaveKill(m4.id, vid, 'wild', null);
    assert.strictEqual(inst.t.killRows.length, 1, 'live kill row captured');
    assert.strictEqual(inst.t.unlinkedKills.length, 1, 'no-fight kill is unlinked, not force-joined');
    assert.strictEqual(inst.t.wrapCounts.recordWaveKill, 1, 'kill wrap fired on live harness');
    assert.strictEqual(inst.t.instrumentErrors.length, 0, 'no instrument errors on live install');
    pass++;
    console.log('ok ' + pass + ' - live harness smoke: kill row + unlinked + clean install');
  } finally {
    try { inst.uninstall(); } catch (e) {}
  }
  console.log('TBLETH-PROOF ' + pass + ' PASS');
})().catch(function (e) { console.error('TBLETH-PROOF FAIL: ' + (e && e.stack)); process.exitCode = 1; });
