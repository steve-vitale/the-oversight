// test-holdspeak-a.js — proof test, arm sim-holdspeak-a.
// Proves the held-departure voice (finding #2713): on current master a
// held departure is silent — the plan stays staged, the party re-bids
// tomorrow, and nothing is ever said about waiting for kit or health
// (463 'hold' verdicts vs 450 launches on the 19-seed departname
// before-corpus, 0 hold lines). The fix voices every hold in
// vbrainExecuteDepart (src/js/villager-brain.js): the holder by true
// first name (the departname-a beatName convention) and the REAL hold
// reason, read from the hold code itself — kit (gear_hold), no
// companion (party_wait / veteran_guard), no trail (expired-plan
// held), sick / hurt / cannot-walk (party_launch execute-fail with no
// walker to take the plan). Text-only: say() consumes no RNG; the
// only state written is the once-per-(holder,day) dedup map.
//
//   §A code pins (read-only greps).
//   §B staged fixtures through the REAL vbrainExecuteDepart: H1
//       hold-action commits (kit x3, companion x2, veteran), H2
//       expired-plan held, H3 execute-fail (sick / hurt / range-0 /
//       unknown), dedup across ticks and days, pre-System naming,
//       calledName preference, nameless record, no line on a launch,
//       heal-check never re-called (medicine pile untouched).
//   §C OLD-CODE CONTROL: the same B1 fixture against the pre-change
//       villager-brain.js (git show of the branch base tip) must
//       return 'hold' with ZERO hold lines (fail on old, pass on new).
// Usage: node scripts/test-holdspeak-a.js
//        node scripts/test-holdspeak-a.js --old-code <villager-brain.js path>
//        (child mode: runs only the §B1 fixture against the given
//        file and prints one JSON line; used by §C.)
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; console.log('PASS ' + name); }
  else { failed++; console.log('FAIL ' + name + (extra != null ? ' :: ' + JSON.stringify(extra) : '')); }
}

globalThis.Scattering = globalThis.Scattering || {};
globalThis.Scattering.Game = globalThis.Scattering.Game || {};
globalThis.Scattering.equipment = {
  armorOf: function (person) { return (person && person._armorP) || 0; },
  weaponBonusOf: function (person) { return (person && person._weaponB) || 0; },
};

const OLD_CODE_PATH = (function () {
  const i = process.argv.indexOf('--old-code');
  return i !== -1 ? process.argv[i + 1] : null;
})();
require(OLD_CODE_PATH || path.join(REPO, 'src', 'js', 'villager-brain.js'));
const Game = globalThis.Scattering.Game;

const HOLD_BEAT_RE = /— the party waits\./;
const DEPART_BEAT_RE = /sets out .* — the fire marks the trail\./;
const DESCRIPTOR_RE = /A (person|man|woman), maybe \d0s/;

// Deterministic Math.random: the party_launch branch rolls a target
// distance/direction. Same seed every fixture, so lines are stable.
function seedRng(seed) {
  let s = (seed | 0) || 1;
  Math.random = function () {
    s = (Math.imul(s, 1103515245) + 12345) | 0;
    return ((s >>> 0) % 10000) / 10000;
  };
}
seedRng(42);

// People: Mara (holder — the task's example name), Desmond + Theo
// (companions), Ash (calledName), and a nameless record. Descriptors
// are the canned personDescriptor strings, exactly as game.js builds
// them; the scholar knows nobody pre-System by default.
function makePeople() {
  return {
    mara_voss: { id: 'mara_voss', name: 'Mara Voss', dead: false, _armorP: 0, _weaponB: 0,
      items: [], node: [5, 5], descriptor: 'A person, maybe 40s, with deep-set eyes' },
    desmond_okafor: { id: 'desmond_okafor', name: 'Desmond Okafor', dead: false, _armorP: 10, _weaponB: 5,
      items: [{ id: 'spear' }], node: [5, 5], descriptor: 'A man, maybe 40s, with a scarred cheek' },
    theo_kim: { id: 'theo_kim', name: 'Theo Kim', dead: false, _armorP: 10, _weaponB: 5,
      items: [{ id: 'spear' }], node: [5, 5], descriptor: 'A man, maybe 20s, with calloused knuckles' },
    ash_kim: { id: 'ash_kim', name: 'Ashley Kim', calledName: 'Ash River', dead: false,
      _armorP: 10, _weaponB: 5, items: [{ id: 'spear' }], node: [5, 5],
      descriptor: 'A woman, maybe 30s' },
    noname: { id: 'noname', dead: false, _armorP: 0, _weaponB: 0,
      items: [], node: [5, 5], descriptor: 'A person, maybe 50s' },
  };
}
const ITEM_DEFS = [{ id: 'spear', weapon: true }, { id: 'bandage', healAmount: 25 }];

// holdCtx: a fake Game ctx driving the REAL vbrainExecuteDepart.
// opts: holder (default mara_voss), day (default 40), commit (the
// dawn commit — winPlanAction/kind/companion/day), hp (default 100),
// sick (bool), maxD (npcMaxDist, default 3), deadTarget ('held' /
// 'expired' / null), handoff ('launch' / 'hold'), armorP / weaponB
// (holder gear), companionAtHaven (bool — findCompanion result),
// medicine (stash pile entries, to prove the heal check is never
// re-called: the pile must be untouched), known (ids the scholar
// knows — default none, pre-System).
function holdCtx(o) {
  const opts = o || {};
  const holder = opts.holder || 'mara_voss';
  const people = makePeople();
  if (opts.armorP != null) people[holder]._armorP = opts.armorP;
  if (opts.weaponB != null) people[holder]._weaponB = opts.weaponB;
  const says = [];
  const exped = {};
  const plan = { stage: (opts.stage || 'party'), target: 'eater', needWave: 4,
    node: null, party: [], reseedExpiryDay: (opts.deadTarget ? 30 : null) };
  const medicine = (opts.medicine || []).map(function (e) { return Object.assign({}, e); });
  const known = {};
  (opts.known || []).forEach(function (id) { known[id] = true; });
  const commit = Object.assign({ day: (opts.day != null ? opts.day : 40),
    kind: 'HAVEN_CHORE', winPlanAction: 'party_wait', companion: null },
    opts.commit || {});
  const ctx = {
    state: { scholar: { day: (opts.day != null ? opts.day : 40), systemArrived: !!opts.systemArrived },
      village: { roster: Object.keys(people), trust: {}, health: {}, sick: {},
        winPlan: {}, vbrain: null, away: {} } },
    data: { items: ITEM_DEFS },
    dayPart: 1,
    villagerId: '__scholar__',
    says: says,
    exped: exped,
    medicine: medicine,
    _plan: plan,
    say: function (line) { says.push(String(line)); },
    getPerson: function (vid) { return people[vid] || null; },
    vpOf: function (vid) { return people[vid] || null; },
    npcName: function (vid) {
      const p = people[vid];
      if (!p) return 'Someone';
      if (p.calledName) return String(p.calledName).split(' ')[0];
      return p.name ? String(p.name).split(' ')[0] : 'Someone';
    },
    displayName: function (vid) {
      if (known[vid]) return this.npcName(vid);
      const p = people[vid];
      return p ? p.descriptor : 'A person, maybe 40s';
    },
    nameKnown: function (vid) { return !!known[vid]; },
    npcMaxDist: function (vid) { return (opts.maxD != null ? opts.maxD : 3); },
    npcRangeProfile: function () { return 'wanderer'; },
    npcNode: function (vid) { return { nx: 5, ny: 5 }; },
    agencyState: function () { return { exped: exped }; },
    isEngaged: function () { return false; },
    companionRank: null,
    vbrainCommit: Game.vbrainCommit,
    winPlanOf: function () { return plan; },
    winPlanCommitDeadTarget: function () { return opts.deadTarget || null; },
    winPlanHomebodyHandoff: function () { return opts.handoff || 'hold'; },
    winPlanStats: function () { return {}; },
    winPlanDepartLaunchBeat: function () { return true; },
    winPlanReseedLaunchBeat: function () { return false; },
    startExpedition: function (vid) {
      // The holder's expedition NEVER starts in hold fixtures (the
      // gate under test); companions are never reached on a hold.
      if (opts.expedStarts) exped[vid] = { tx: 6, ty: 5 };
    },
    stashState: function () { return { medicine: medicine }; },
    campPeopleIds: function () { return Object.keys(people); },
    campHealerId: function () { return null; },
  };
  ctx.state.village.health[holder] = (opts.hp != null ? opts.hp : 100);
  if (opts.sick) ctx.state.village.sick[holder] = true;
  ctx.state.village.winPlan[holder] = plan;
  // The commit the depart executor reads (real commit store).
  ctx.state.village.vbrain = { commit: {}, perception: {}, logs: [],
    stats: { picks: 0, gates: 0, expeditions: 0, winPlan: 0 } };
  ctx.state.village.vbrain.commit[holder] = commit;
  // findCompanion reads trust + npcNode + the roster; force its
  // answer through the roster: a companion at Haven iff asked.
  if (!opts.companionAtHaven) {
    ctx.state.village.roster = [holder];
  } else {
    ctx.state.village.trust[opts.companionAtHaven === true ? 'desmond_okafor' : opts.companionAtHaven] = 50;
  }
  return { ctx: ctx, holder: holder, says: says, exped: exped, medicine: medicine, plan: plan };
}

function depart(fx, vid, hx, hy) {
  seedRng(42);
  return Game.vbrainExecuteDepart.call(fx.ctx, vid || fx.holder, hx || 5, hy || 5, false);
}

// Child mode (§C): only the B1 fixture, one JSON line.
if (OLD_CODE_PATH) {
  const fx = holdCtx({ commit: { kind: 'HAVEN_CHORE', winPlanAction: 'gear_hold', companion: null } });
  const ret = depart(fx);
  console.log(JSON.stringify({ ret: ret, lines: fx.says.filter(function (l) { return HOLD_BEAT_RE.test(l); }) }));
  process.exit(0);
}

// ---------- §A — code pins (read-only greps on the source) ----------
const SRC = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-brain.js'), 'utf8');
check('A1 holdVoice called at all three hold sites',
  (SRC.match(/holdVoice\(this, vid, hx, hy/g) || []).length === 3, (SRC.match(/holdVoice\(this, vid, hx, hy/g) || []).length);
check('A2 holdBlockKind defined and used at the execute-fail site',
  /function holdBlockKind\(self, vid\)/.test(SRC) && /holdBlockKind\(this, vid\)/.test(SRC));
check('A3 holdName prefers npcName (beatName convention)',
  /function holdName\(self, vid\)/.test(SRC) &&
  SRC.indexOf("typeof self.npcName === 'function'") !== -1);
check('A4 no Math.random in the hold voice helpers',
  !/function holdVoice[\s\S]{0,3000}?Math\.random/.test(SRC) &&
  !/function holdName[\s\S]{0,1500}?Math\.random/.test(SRC) &&
  !/function holdBlockKind[\s\S]{0,1500}?Math\.random/.test(SRC));
check('A5 every hold line ends with the capture closer (shared assembly + 3 wear asides)',
  (SRC.match(/— the party waits\./g) || []).length >= 1 &&
  /var line = name \+ core \+ wear \+ ' — the party waits\.'/.test(SRC) &&
  /another day gone/.test(SRC) && /the wait wearing thin/.test(SRC) && /so many days now/.test(SRC));
check('A6 hold code never re-calls villagerHealCheck',
  SRC.indexOf('villagerHealCheck(') === -1);
check('A7 dedup key is per (holder, day)',
  /holdSaid\[.*vid.*day/.test(SRC) || /String\(vid\) \+ '>' \+ day/.test(SRC));
check('A8 hold lines are say() fiction only — state writes are the dedup map + the hold streak map only (sim-holdrepeat-fix-a)',
  /br\.holdSaid\[key\] = day/.test(SRC) && /br\.holdStreak\[String\(vid\)\] = st/.test(SRC));

// ---------- §B — staged fixtures through the real vbrainExecuteDepart ----------
// B1 gear_hold, holder with neither weapon nor armor.
(function () {
  const fx = holdCtx({ commit: { kind: 'HAVEN_CHORE', winPlanAction: 'gear_hold', companion: null } });
  const ret = depart(fx);
  check('B1 gear_hold holds and speaks the kit line', ret === 'hold' &&
    fx.says.length === 1 && fx.says[0] === 'Mara has no weapon and no armor yet — the party waits.', { ret: ret, says: fx.says });
})();
// B2 gear_hold, holder armed but unarmored.
(function () {
  const fx = holdCtx({ commit: { kind: 'HAVEN_CHORE', winPlanAction: 'gear_hold', companion: null }, weaponB: 5 });
  const ret = depart(fx);
  check('B2 gear_hold armed-but-unarmored names the armor gap', ret === 'hold' &&
    fx.says.length === 1 && fx.says[0] === 'Mara still has no armor — the party waits.', { ret: ret, says: fx.says });
})();
// B3 gear_hold, holder armored but unarmed.
(function () {
  const fx = holdCtx({ commit: { kind: 'HAVEN_CHORE', winPlanAction: 'gear_hold', companion: null }, armorP: 10 });
  const ret = depart(fx);
  check('B3 gear_hold armored-but-unarmed names the weapon gap', ret === 'hold' &&
    fx.says.length === 1 && fx.says[0] === 'Mara still has no weapon — the party waits.', { ret: ret, says: fx.says });
})();
// B4 party_wait, no companion at Haven.
(function () {
  const fx = holdCtx({ commit: { kind: 'HAVEN_CHORE', winPlanAction: 'party_wait', companion: null } });
  const ret = depart(fx);
  check('B4 party_wait speaks the no-companion line', ret === 'hold' &&
    fx.says.length === 1 && fx.says[0] === 'Mara has no one to walk out with — the party waits.', { ret: ret, says: fx.says });
})();
// B5 party_wait, a companion is available by execute time.
(function () {
  const fx = holdCtx({ commit: { kind: 'HAVEN_CHORE', winPlanAction: 'party_wait', companion: null }, companionAtHaven: true });
  const ret = depart(fx);
  check('B5 party_wait with a companion now present does not claim none', ret === 'hold' &&
    fx.says.length === 1 && fx.says[0] === 'Mara is still waiting on a companion — the party waits.', { ret: ret, says: fx.says });
})();
// B6 veteran_guard: a veteran with wave-4 kills, no companion.
(function () {
  const fx = holdCtx({ commit: { kind: 'HAVEN_CHORE', winPlanAction: 'veteran_guard', companion: null } });
  const ret = depart(fx);
  check('B6 veteran_guard speaks the veteran wait', ret === 'hold' &&
    fx.says.length === 1 && fx.says[0] === 'Mara has the kills for the table, but no one to walk out with yet — the party waits.', { ret: ret, says: fx.says });
})();
// B7 expired-plan held: target dead, no re-seed rumor.
(function () {
  const fx = holdCtx({ commit: { kind: 'EXPEDITION', winPlanAction: 'party_launch', companion: 'desmond_okafor' }, deadTarget: 'held' });
  const ret = depart(fx);
  check('B7 expired-plan held speaks the no-trail line', ret === 'hold' &&
    fx.says.length === 1 && fx.says[0] === 'Mara still has no trail to follow — the party waits.', { ret: ret, says: fx.says });
})();
// B8 execute-fail, holder sick.
(function () {
  const fx = holdCtx({ commit: { kind: 'EXPEDITION', winPlanAction: 'party_launch', companion: 'desmond_okafor' }, sick: true });
  const ret = depart(fx);
  check('B8 execute-fail sick speaks the sick line', ret === 'hold' &&
    fx.says.length === 1 && fx.says[0] === 'Mara is sick, and no one who can walk will take the plan — the party waits.', { ret: ret, says: fx.says });
})();
// B9 execute-fail, holder hurt (52 HP), medicine on hand — and the
// medicine pile must be untouched: the heal check is never re-called.
(function () {
  const fx = holdCtx({ commit: { kind: 'EXPEDITION', winPlanAction: 'party_launch', companion: 'desmond_okafor' },
    hp: 52, medicine: [{ itemId: 'bandage', units: 2, doses: 2, name: 'Bandage' }] });
  const ret = depart(fx);
  check('B9 execute-fail hurt speaks the hurt line', ret === 'hold' &&
    fx.says.length === 1 && fx.says[0] === 'Mara is still hurt, and no one who can walk will take the plan — the party waits.', { ret: ret, says: fx.says });
  check('B9b medicine pile untouched (no heal-check re-run)',
    fx.medicine.length === 1 && fx.medicine[0].units === 2 && fx.medicine[0].doses === 2, fx.medicine);
})();
// B10 execute-fail, holder range-0 (cannot walk).
(function () {
  const fx = holdCtx({ commit: { kind: 'EXPEDITION', winPlanAction: 'party_launch', companion: 'desmond_okafor' }, maxD: 0 });
  const ret = depart(fx);
  check('B10 execute-fail range-0 speaks the never-leaves-Haven line', ret === 'hold' &&
    fx.says.length === 1 && fx.says[0] === 'Mara never leaves Haven, and no one who can walk will take the plan — the party waits.', { ret: ret, says: fx.says });
})();
// B11 execute-fail, no block readable (residual).
(function () {
  const fx = holdCtx({ commit: { kind: 'EXPEDITION', winPlanAction: 'party_launch', companion: 'desmond_okafor' } });
  const ret = depart(fx);
  check('B11 execute-fail unknown speaks generally, never invents a cause', ret === 'hold' &&
    fx.says.length === 1 && fx.says[0] === 'Mara couldn\'t get out today, and no one could take the plan — the party waits.', { ret: ret, says: fx.says });
})();
// B12 dedup: three ticks the same day speak once; the next day speaks again.
(function () {
  const fx = holdCtx({ commit: { kind: 'HAVEN_CHORE', winPlanAction: 'party_wait', companion: null }, day: 40 });
  const r1 = depart(fx); const r2 = depart(fx); const r3 = depart(fx);
  check('B12a three holds one day speak exactly once', r1 === 'hold' && r2 === 'hold' && r3 === 'hold' && fx.says.length === 1, { says: fx.says });
  fx.ctx.state.scholar.day = 41;
  fx.ctx.state.village.vbrain.commit.mara_voss.day = 41;
  const r4 = depart(fx);
  check('B12b the next day speaks again, in band-1 wording (day-count bands, sim-holdrepeat-fix-a)',
    r4 === 'hold' && fx.says.length === 2 &&
    fx.says[1] === 'Mara has no one to walk out with — another day gone — the party waits.', { says: fx.says });
})();
// B13 pre-System naming: the scholar knows nobody, yet the line names
// the holder by true first name — never a stranger descriptor.
(function () {
  const fx = holdCtx({ commit: { kind: 'HAVEN_CHORE', winPlanAction: 'party_wait', companion: null }, known: [] });
  const ret = depart(fx);
  check('B13 pre-System hold line names the true first name', ret === 'hold' &&
    fx.says.length === 1 && fx.says[0].indexOf('Mara') === 0 && !DESCRIPTOR_RE.test(fx.says[0]), { says: fx.says });
})();
// B14 calledName preferred over the generated name.
(function () {
  const fx = holdCtx({ holder: 'ash_kim', commit: { kind: 'HAVEN_CHORE', winPlanAction: 'party_wait', companion: null } });
  const ret = depart(fx);
  check('B14 calledName preferred (Ash, not Ashley)', ret === 'hold' &&
    fx.says.length === 1 && fx.says[0].indexOf('Ash has no one') === 0, { says: fx.says });
})();
// B15 nameless record reads Someone, never undefined.
(function () {
  const fx = holdCtx({ holder: 'noname', commit: { kind: 'HAVEN_CHORE', winPlanAction: 'party_wait', companion: null } });
  const ret = depart(fx);
  check('B15 nameless record reads Someone', ret === 'hold' &&
    fx.says.length === 1 && fx.says[0].indexOf('Someone has no one') === 0, { says: fx.says });
})();
// B16 a launch speaks no hold line.
(function () {
  const fx = holdCtx({ commit: { kind: 'EXPEDITION', winPlanAction: 'party_launch', companion: 'desmond_okafor' },
    expedStarts: true });
  const ret = depart(fx);
  check('B16 a launch speaks no hold line', ret === 'launch' &&
    fx.says.filter(function (l) { return HOLD_BEAT_RE.test(l); }).length === 0, { ret: ret, says: fx.says });
})();
// B17 hold lines carry the capture token and never the departure-beat token.
(function () {
  const fx = holdCtx({ commit: { kind: 'HAVEN_CHORE', winPlanAction: 'party_wait', companion: null } });
  depart(fx);
  check('B17 hold line carries the HOLD_BEAT_RE token, not the beat token',
    fx.says.length === 1 && HOLD_BEAT_RE.test(fx.says[0]) && !DEPART_BEAT_RE.test(fx.says[0]));
})();
// B18 hurt+sick corner (documented): reads hurt — both are health
// reasons about the same person, never a kit/health confusion.
(function () {
  const fx = holdCtx({ commit: { kind: 'EXPEDITION', winPlanAction: 'party_launch', companion: 'desmond_okafor' }, hp: 52, sick: true });
  const ret = depart(fx);
  check('B18 hurt+sick reads hurt (documented corner)', ret === 'hold' &&
    fx.says.length === 1 && fx.says[0].indexOf('is still hurt') !== -1, { says: fx.says });
})();
// B19 an expired plan (not held) speaks no hold line.
(function () {
  const fx = holdCtx({ commit: { kind: 'EXPEDITION', winPlanAction: 'party_launch', companion: 'desmond_okafor' }, deadTarget: 'expired' });
  const ret = depart(fx);
  check('B19 expired plan returns normal with no hold line', ret === 'normal' &&
    fx.says.filter(function (l) { return HOLD_BEAT_RE.test(l); }).length === 0, { ret: ret, says: fx.says });
})();

// ---------- §C — old-code control ----------
(function () {
  const { execSync } = require('child_process');
  const os = require('os');
  const tmp = path.join(os.tmpdir(), 'holdspeak-old-brain-' + process.pid + '.js');
  try {
    const oldSrc = execSync('git show 60f6e7436:src/js/villager-brain.js', { cwd: REPO, encoding: 'utf8' });
    fs.writeFileSync(tmp, oldSrc);
    const out = execSync('node ' + JSON.stringify(__filename) + ' --old-code ' + JSON.stringify(tmp), { encoding: 'utf8' });
    const res = JSON.parse(out.trim().split('\n').pop());
    check('C1 old code holds with ZERO hold lines (RED on old, GREEN on new)',
      res.ret === 'hold' && res.lines.length === 0, res);
  } catch (e) {
    check('C1 old code holds with ZERO hold lines (RED on old, GREEN on new)', false, String(e && e.message || e).slice(0, 200));
  } finally {
    try { fs.unlinkSync(tmp); } catch (e) {}
  }
})();

console.log('----');
console.log(passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
