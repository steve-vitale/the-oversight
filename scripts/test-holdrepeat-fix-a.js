// test-holdrepeat-fix-a.js — proof test, arm sim-holdrepeat-fix-a.
// Proves the day-count-varied hold wording (finding #2744): Eamon's
// hurt line repeated 31x over 36 days, 13 consecutive days, 1 distinct
// text — a stuck record. The fix varies the hold line by how long the
// CURRENT consecutive hold has lasted (bands: day 1 fresh, days 2–3,
// days 4–6, day 7+), keeping the hold REASON identical and the
// "— the party waits." close. Wording only: who holds and why never
// changes — the streak is derived from voiced hold days, no RNG, and
// the only state written is the dedup/streak maps beside holdSaid.
//
//   §A code pins (read-only greps).
//   §B staged fixtures through the REAL vbrainExecuteDepart: 13-day
//       hurt run (all four bands fire, reason token every day), 13-day
//       runs per other exercised kind (companion / sick / range0 / kit),
//       broken hold (launch day, and a gap day) resets the streak to
//       band 0, day-1 lines byte-identical to the holdspeak originals.
//   §C OLD-CODE CONTROL: the same 3-day hurt + 3-day companion
//       fixture against the pre-change villager-brain.js (git show of
//       the branch base tip) must return the same 'hold' verdicts —
//       only the spoken text differs (new lines equal old lines once
//       the wear asides are stripped).
// Usage: node scripts/test-holdrepeat-fix-a.js
//        node scripts/test-holdrepeat-fix-a.js --old-code <villager-brain.js path>
//        (child mode: runs only the §C fixture against the given file
//        and prints one JSON line; used by §C.)
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
const CLOSER = ' — the party waits.';
const WEAR = [' — another day gone', ' — the wait wearing thin', ' — so many days now'];

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

// People: Mara (holder), Desmond + Theo (companions). Same roster as
// test-holdspeak-a.js so lines compare directly with its fixtures.
function makePeople() {
  return {
    mara_voss: { id: 'mara_voss', name: 'Mara Voss', dead: false, _armorP: 0, _weaponB: 0,
      items: [], node: [5, 5], descriptor: 'A person, maybe 40s, with deep-set eyes' },
    desmond_okafor: { id: 'desmond_okafor', name: 'Desmond Okafor', dead: false, _armorP: 10, _weaponB: 5,
      items: [{ id: 'spear' }], node: [5, 5], descriptor: 'A man, maybe 40s, with a scarred cheek' },
    theo_kim: { id: 'theo_kim', name: 'Theo Kim', dead: false, _armorP: 10, _weaponB: 5,
      items: [{ id: 'spear' }], node: [5, 5], descriptor: 'A man, maybe 20s, with calloused knuckles' },
  };
}
const ITEM_DEFS = [{ id: 'spear', weapon: true }, { id: 'bandage', healAmount: 25 }];

// holdCtx: a fake Game ctx driving the REAL vbrainExecuteDepart.
// (Same shape as test-holdspeak-a.js; the opts object is kept live on
// fx.opts so a fixture can flip expedStarts mid-run for a launch day.)
// opts: holder (default mara_voss), day (default 40), commit, hp
// (default 100), sick (bool), maxD (npcMaxDist, default 3), deadTarget,
// handoff, armorP / weaponB, companionAtHaven, medicine, known,
// expedStarts.
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
      if (opts.expedStarts) exped[vid] = { tx: 6, ty: 5 };
    },
    stashState: function () { return { medicine: medicine }; },
    campPeopleIds: function () { return Object.keys(people); },
    campHealerId: function () { return null; },
  };
  ctx.state.village.health[holder] = (opts.hp != null ? opts.hp : 100);
  if (opts.sick) ctx.state.village.sick[holder] = true;
  ctx.state.village.winPlan[holder] = plan;
  ctx.state.village.vbrain = { commit: {}, perception: {}, logs: [],
    stats: { picks: 0, gates: 0, expeditions: 0, winPlan: 0 } };
  ctx.state.village.vbrain.commit[holder] = commit;
  if (!opts.companionAtHaven) {
    ctx.state.village.roster = [holder];
  } else {
    ctx.state.village.trust[opts.companionAtHaven === true ? 'desmond_okafor' : opts.companionAtHaven] = 50;
  }
  return { ctx: ctx, opts: opts, holder: holder, says: says, exped: exped, medicine: medicine, plan: plan };
}

function depart(fx, vid, hx, hy) {
  seedRng(42);
  return Game.vbrainExecuteDepart.call(fx.ctx, vid || fx.holder, hx || 5, hy || 5, false);
}

// setDay: advance the fixture to a new day (scholar day + commit day,
// the pair vbrainExecuteDepart gates on).
function setDay(fx, d) {
  fx.ctx.state.scholar.day = d;
  fx.ctx.state.village.vbrain.commit[fx.holder].day = d;
}

// runHoldDays(fx, firstDay, n): hold on n consecutive days from
// firstDay; returns the hold lines spoken (HOLD_BEAT_RE only).
function runHoldDays(fx, firstDay, n) {
  const lines = [];
  for (let i = 0; i < n; i++) {
    setDay(fx, firstDay + i);
    const ret = depart(fx);
    if (ret !== 'hold') lines.push(null);
  }
  return fx.says.filter(function (l) { return HOLD_BEAT_RE.test(l); });
}

function distinct(xs) {
  const seen = {};
  xs.forEach(function (x) { seen[x] = true; });
  return Object.keys(seen);
}

// ---------- §C fixture (shared by parent and child mode) ----------
// 3-day hurt hold + 3-day companion hold. The child (old code) prints
// {rets, lines}; the parent (§C) compares verdicts and lines.
function offOnFixture() {
  const out = { rets: [], lines: [] };
  const hurt = holdCtx({ commit: { kind: 'EXPEDITION', winPlanAction: 'party_launch', companion: 'desmond_okafor' }, hp: 52, day: 40 });
  for (let d = 40; d <= 42; d++) { setDay(hurt, d); out.rets.push(depart(hurt)); }
  const comp = holdCtx({ commit: { kind: 'HAVEN_CHORE', winPlanAction: 'party_wait', companion: null }, day: 40 });
  for (let d = 40; d <= 42; d++) { setDay(comp, d); out.rets.push(depart(comp)); }
  out.lines = hurt.says.concat(comp.says).filter(function (l) { return HOLD_BEAT_RE.test(l); });
  return out;
}

// Child mode (§C): only the §C fixture, one JSON line.
if (OLD_CODE_PATH) {
  console.log(JSON.stringify(offOnFixture()));
  process.exit(0);
}

// ---------- §A — code pins (read-only greps on the source) ----------
const SRC = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-brain.js'), 'utf8');
check('A1 holdStreak kept beside the holdSaid dedup map',
  /br\.holdStreak\[String\(vid\)\] = st/.test(SRC) && /br\.holdSaid\[key\] = day/.test(SRC));
check('A2 streak advances only on the next consecutive day, else resets to 1',
  /if \(st\.last === day - 1\) st\.n = st\.n \+ 1; else st\.n = 1;/.test(SRC));
check('A3 four day-count bands (1 / 2–3 / 4–6 / 7+)',
  /st\.n <= 1 \? 0 : \(st\.n <= 3 \? 1 : \(st\.n <= 6 \? 2 : 3\)\)/.test(SRC));
check('A4 all three wear asides present, closer shared',
  WEAR.every(function (w) { return SRC.indexOf(w.trim()) !== -1; }) &&
  /var line = name \+ core \+ wear \+ ' — the party waits\.'/.test(SRC));
check('A5 no Math.random in the hold voice / streak code',
  !/function holdVoice[\s\S]{0,4000}?Math\.random/.test(SRC));
check('A6 reason cores are the holdspeak originals (band 0 = old line)',
  /core = ' is still hurt, and no one who can walk will take the plan'/.test(SRC) &&
  /core = ' is sick, and no one who can walk will take the plan'/.test(SRC) &&
  /core = ' never leaves Haven, and no one who can walk will take the plan'/.test(SRC) &&
  /core = ' has no one to walk out with'/.test(SRC) &&
  /core = ' has no weapon and no armor yet'/.test(SRC));

// ---------- §B — staged fixtures through the real vbrainExecuteDepart ----------
// B1 13-day hurt hold (Eamon's shape): all four bands fire.
(function () {
  const fx = holdCtx({ commit: { kind: 'EXPEDITION', winPlanAction: 'party_launch', companion: 'desmond_okafor' }, hp: 52, day: 40 });
  const lines = runHoldDays(fx, 40, 13);
  const d = distinct(lines);
  check('B1a 13-day hurt hold speaks 13 lines, 4 distinct wordings',
    lines.length === 13 && d.length === 4, { lines: lines.length, distinct: d.length });
  check('B1b day 1 is the holdspeak original, verbatim',
    lines[0] === 'Mara is still hurt, and no one who can walk will take the plan — the party waits.', { line: lines[0] });
  check('B1c bands fire in order: 1 / 2–3 / 4–6 / 7+',
    lines[1] === 'Mara is still hurt, and no one who can walk will take the plan — another day gone — the party waits.' &&
    lines[2] === lines[1] &&
    lines[3] === 'Mara is still hurt, and no one who can walk will take the plan — the wait wearing thin — the party waits.' &&
    lines[5] === lines[3] &&
    lines[6] === 'Mara is still hurt, and no one who can walk will take the plan — so many days now — the party waits.' &&
    lines[12] === lines[6], { sample: [lines[1], lines[3], lines[6]] });
  check('B1d the reason token survives every day, closer every day',
    lines.every(function (l) { return l.indexOf('still hurt') !== -1 && l.slice(-CLOSER.length) === CLOSER; }), { lines: lines });
  check('B1e no single line repeats on >= 10 consecutive days (worst run 7)',
    (function () {
      let run = 1, worst = 1;
      for (let i = 1; i < lines.length; i++) { run = lines[i] === lines[i - 1] ? run + 1 : 1; if (run > worst) worst = run; }
      return worst === 7;
    })(), { lines: lines });
})();
// B2 13-day runs per other exercised kind: >= 3 distinct wordings,
// reason token intact every day.
(function () {
  const cases = [
    { name: 'companion', opts: { commit: { kind: 'HAVEN_CHORE', winPlanAction: 'party_wait', companion: null } }, token: 'no one to walk out with' },
    { name: 'sick', opts: { commit: { kind: 'EXPEDITION', winPlanAction: 'party_launch', companion: 'desmond_okafor' }, sick: true }, token: 'is sick' },
    { name: 'range0', opts: { commit: { kind: 'EXPEDITION', winPlanAction: 'party_launch', companion: 'desmond_okafor' }, maxD: 0 }, token: 'never leaves Haven' },
    { name: 'kit', opts: { commit: { kind: 'HAVEN_CHORE', winPlanAction: 'gear_hold', companion: null } }, token: 'no weapon' },
  ];
  cases.forEach(function (c) {
    const o = Object.assign({ day: 40 }, c.opts);
    const fx = holdCtx(o);
    const lines = runHoldDays(fx, 40, 13);
    check('B2 ' + c.name + ' 13-day hold: 4 distinct wordings, reason token every day',
      lines.length === 13 && distinct(lines).length === 4 &&
      lines.every(function (l) { return l.indexOf(c.token) !== -1 && l.slice(-CLOSER.length) === CLOSER; }),
      { lines: lines.length, distinct: distinct(lines).length });
  });
})();
// B3 a broken hold resets the streak: launch day in the middle, then
// the next hold speaks band 0 (fresh) again.
(function () {
  const fx = holdCtx({ commit: { kind: 'EXPEDITION', winPlanAction: 'party_launch', companion: 'desmond_okafor' }, hp: 52, day: 40 });
  setDay(fx, 40); depart(fx);
  setDay(fx, 41); depart(fx);
  const holdLines = function () { return fx.says.filter(function (l) { return HOLD_BEAT_RE.test(l); }); };
  const before = holdLines().length;
  fx.opts.expedStarts = true;
  setDay(fx, 42);
  const rLaunch = depart(fx);
  delete fx.exped[fx.holder];
  fx.opts.expedStarts = false;
  setDay(fx, 43);
  const rHold = depart(fx);
  const lines = holdLines();
  check('B3 launch day breaks the hold and the next hold speaks fresh (band 0)',
    rLaunch === 'launch' && rHold === 'hold' && lines.length === before + 1 &&
    lines[2] === 'Mara is still hurt, and no one who can walk will take the plan — the party waits.',
    { rLaunch: rLaunch, rHold: rHold, lines: lines });
})();
// B4 a gap day (no hold) also resets the streak.
(function () {
  const fx = holdCtx({ commit: { kind: 'EXPEDITION', winPlanAction: 'party_launch', companion: 'desmond_okafor' }, hp: 52, day: 40 });
  setDay(fx, 40); depart(fx);
  setDay(fx, 42); depart(fx);
  const lines = fx.says.filter(function (l) { return HOLD_BEAT_RE.test(l); });
  check('B4 a skipped day resets the streak (day 42 speaks band 0 again)',
    lines.length === 2 && lines[1] === 'Mara is still hurt, and no one who can walk will take the plan — the party waits.',
    { lines: lines });
})();
// B5 a fresh holder on day 1 still speaks the holdspeak original
// (band 0), for every kind — the day-1 fixtures in
// test-holdspeak-a.js B1–B11 are unchanged by this arm.
(function () {
  const fx = holdCtx({ commit: { kind: 'HAVEN_CHORE', winPlanAction: 'party_wait', companion: null }, day: 40 });
  depart(fx);
  check('B5 day-1 companion line is the holdspeak original',
    fx.says.length === 1 && fx.says[0] === 'Mara has no one to walk out with — the party waits.', { says: fx.says });
})();

// ---------- §C — old-code control ----------
(function () {
  const { execSync } = require('child_process');
  const os = require('os');
  const tmp = path.join(os.tmpdir(), 'holdrepeat-old-brain-' + process.pid + '.js');
  try {
    const oldSrc = execSync('git show c329b477d:src/js/villager-brain.js', { cwd: REPO, encoding: 'utf8' });
    fs.writeFileSync(tmp, oldSrc);
    const out = execSync('node ' + JSON.stringify(__filename) + ' --old-code ' + JSON.stringify(tmp), { encoding: 'utf8' });
    const res = JSON.parse(out.trim().split('\n').pop());
    const now = offOnFixture();
    const stripWear = function (l) {
      let s = l;
      WEAR.forEach(function (w) { s = s.split(w).join(''); });
      return s;
    };
    const sameVerdicts = JSON.stringify(res.rets) === JSON.stringify(now.rets);
    const sameLines = JSON.stringify(res.lines) === JSON.stringify(now.lines.map(stripWear));
    check('C1 old code returns the same hold verdicts (decision identical)',
      sameVerdicts && res.rets.every(function (r) { return r === 'hold'; }), { old: res.rets, now: now.rets });
    check('C2 new lines equal old lines once the wear asides are stripped (wording only)',
      sameLines, { old: res.lines, strippedNew: now.lines.map(stripWear) });
    check('C3 old code repeats one line 3x per 3-day run (the stuck record this arm fixes)',
      distinct(res.lines).length === 2, { distinct: distinct(res.lines) });
  } catch (e) {
    check('C1 old code returns the same hold verdicts (decision identical)', false, String(e && e.message || e).slice(0, 200));
    check('C2 new lines equal old lines once the wear asides are stripped (wording only)', false, String(e && e.message || e).slice(0, 200));
    check('C3 old code repeats one line 3x per 3-day run (the stuck record this arm fixes)', false, String(e && e.message || e).slice(0, 200));
  } finally {
    try { fs.unlinkSync(tmp); } catch (e) {}
  }
})();

console.log('----');
console.log(passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
