// test-launchvoice-r268.js — proof test, run r268 (establishment).
// Proves LAUNCHVOICE: every real win-plan departure speaks its one
// launch line, not just wave-4+ ones. The r265 panel proved the hunt
// is mechanically alive but conversationally silent: 57 departures,
// 0 launch beats — winPlanDepartLaunchBeat gated the ordinary beat on
// needWave >= 4, and establishment plans launch below wave 4 or
// targetless. The beat line itself (departLaunchBeat) is already
// wave-agnostic and already handles a null target, so the fix removes
// only the gate. Gear/party staging follows the r265 departures
// fixture (armed + armored holder + companion — the gear a player
// actually has at a hunt, never a fresh un-geared solo scholar);
// this test drives the beat hook directly, the same hook both
// departure paths call AFTER the expedition actually started.
//   §A code pin (read-only grep): no needWave gate left in
//       winPlanDepartLaunchBeat.
//   §B needWave 2 plan launches -> the "sets out" line is spoken
//       once, naming holder + companion + target.
//   §C null-needWave plan with a target -> spoken once, with the
//       "after ..." clause; null target -> spoken without it.
//   §D second hook call, same day + target -> silent (dedup stamp);
//       a new day -> speaks again (a genuinely new launch).
//   §E DEPARTBEAT=0 -> silent (the silence switch still works).
//   §F wave-4+ plan still speaks exactly as before (regression guard).
// Usage: node scripts/test-launchvoice-r268.js
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

require(path.join(REPO, 'src', 'js', 'win-plan.js'));
const Game = globalThis.Scattering.Game;

const MONSTERS = [
  { id: 'herald', wave: 4 }, { id: 'spool', wave: 3 }, { id: 'buffering', wave: 3 },
  { id: 'bulldozer', wave: 1 }, { id: 'reunion', wave: 4 },
];
function cap(id) { return id ? id.charAt(0).toUpperCase() + id.slice(1) : id; }

function makePeople() {
  return {
    amina_diallo: { id: 'amina_diallo', name: 'Amina', dead: false, _armorP: 10, _weaponB: 5,
      items: [{ id: 'spear' }], node: [5, 5] },
    diana_osei: { id: 'diana_osei', name: 'Diana', dead: false, _armorP: 10, _weaponB: 5,
      items: [{ id: 'spear' }], node: [5, 5] },
  };
}
// Minimal beat-hook fixture: holder Amina with a live plan, companion
// Diana. opts override: needWave / target / systemArrived. The hook
// under test is winPlanDepartLaunchBeat only — no expedition is
// started here; the hook's contract is "called AFTER the expedition
// actually started", so a spoken line here proves the gate, not the
// launch path (the paths are pinned by test-departbeat-b.js and
// test-winplan-departures-r265.js).
function beatCtx(o) {
  const opts = o || {};
  const people = makePeople();
  const says = [];
  const plan = { stage: 'hunt',
    target: (opts.target === undefined ? 'herald' : opts.target),
    needWave: (opts.needWave === undefined ? 4 : opts.needWave),
    node: null, party: [], sinceDay: 26, holdSinceDay: -1 };
  const ctx = {
    villagerId: 'scholar1',
    data: { items: [{ id: 'spear' }], monsters: MONSTERS },
    state: {
      scholar: { day: 136 },
      village: {
        px: 5, py: 5, roster: ['amina_diallo', 'diana_osei'],
        winPlan: { amina_diallo: plan },
      },
    },
    getPerson: function (vid) { return people[vid] || null; },
    say: function (line) { says.push(String(line)); },
    disp: function (vid) { return vid === 'amina_diallo' ? 'Amina' : (vid === 'diana_osei' ? 'Diana' : vid); },
    monsterNoun: function (id) { return cap(id); },
    articlePhrase: function (n) { return n; },
  };
  if (opts.systemArrived) ctx.state.systemArrived = true;
  ctx.winPlanReseedLaunchBeat = function (vid) { return Game.winPlanReseedLaunchBeat.call(ctx, vid); };
  ctx.winPlanDepartLaunchBeat = function (vid, launched) { return Game.winPlanDepartLaunchBeat.call(ctx, vid, launched); };
  return { ctx: ctx, plan: plan, says: says };
}
function departLines(says) {
  return says.filter(function (l) { return /sets out .* the fire marks the trail/.test(l); });
}

// ---- §A CODE PIN (read-only grep) ----
(function sectionA() {
  const src = fs.readFileSync(path.join(REPO, 'src', 'js', 'win-plan.js'), 'utf8');
  const lines = src.split('\n');
  const idxFn = lines.findIndex(function (l) { return l.indexOf('    winPlanDepartLaunchBeat(vid, launched) {') !== -1; });
  const idxNext = lines.findIndex(function (l, i) { return i > idxFn && l.indexOf('    winPlanHavenTick(vid, hx, hy) {') !== -1; });
  const body = idxFn !== -1 && idxNext !== -1 ? lines.slice(idxFn, idxNext).join('\n') : '';
  check('§A winPlanDepartLaunchBeat exists', idxFn !== -1, { idxFn: idxFn });
  check('§A no needWave >= 4 gate left in the beat hook (below-wave-4 launches may speak)',
    body.indexOf('needWave') === -1, { bodyHasNeedWave: body.indexOf('needWave') !== -1 });
  check('§A the DEPARTBEAT=0 silence switch is still in the hook',
    body.indexOf('departbeatOn()') !== -1, null);
  check('§A the dedup stamp is still in the hook',
    body.indexOf('departBeatDay') !== -1 && body.indexOf('departBeatTarget') !== -1, null);
})();

// ---- §B BELOW-WAVE-4 PLAN SPEAKS ----
(function sectionB() {
  delete process.env.DEPARTBEAT;
  const f = beatCtx({ needWave: 2, target: 'spool' });
  const res = Game.winPlanDepartLaunchBeat.call(f.ctx, 'amina_diallo', ['amina_diallo', 'diana_osei']);
  const beats = departLines(f.says);
  check('§B needWave-2 launch returns true (the beat fired)', res === true, { res: res });
  check('§B exactly one depart line spoken', beats.length === 1, { says: f.says });
  check('§B the line names holder + companion + target',
    beats.length === 1 && /Amina sets out with Diana after Spool/.test(beats[0]) && /the fire marks the trail/.test(beats[0]),
    { line: beats[0] || null });
})();

// ---- §C NULL NEEDWAVE / NULL TARGET ----
(function sectionC() {
  delete process.env.DEPARTBEAT;
  const f = beatCtx({ target: 'bulldozer' });
  f.plan.needWave = null;
  const res = Game.winPlanDepartLaunchBeat.call(f.ctx, 'amina_diallo', ['amina_diallo', 'diana_osei']);
  const beats = departLines(f.says);
  check('§C null-needWave launch with a target returns true', res === true, { res: res });
  check('§C null-needWave line carries the after clause',
    beats.length === 1 && /after Bulldozer/.test(beats[0]), { line: beats[0] || null });
  const g = beatCtx({ target: null });
  g.plan.needWave = 1;
  const res2 = Game.winPlanDepartLaunchBeat.call(g.ctx, 'amina_diallo', ['amina_diallo', 'diana_osei']);
  const beats2 = departLines(g.says);
  check('§C targetless low-wave launch returns true', res2 === true, { res: res2 });
  check('§C targetless line speaks without an after clause',
    beats2.length === 1 && /Amina sets out with Diana — the fire marks the trail/.test(beats2[0]),
    { line: beats2[0] || null });
})();

// ---- §D DEDUP: SAME LAUNCH SILENT, NEW DAY SPEAKS ----
(function sectionD() {
  delete process.env.DEPARTBEAT;
  const f = beatCtx({ needWave: 3, target: 'spool' });
  Game.winPlanDepartLaunchBeat.call(f.ctx, 'amina_diallo', ['amina_diallo', 'diana_osei']);
  const first = departLines(f.says).length;
  const res2 = Game.winPlanDepartLaunchBeat.call(f.ctx, 'amina_diallo', ['amina_diallo', 'diana_osei']);
  const second = departLines(f.says).length;
  check('§D second call same day + target returns false', res2 === false, { res2: res2 });
  check('§D second call same day + target adds no line', first === 1 && second === 1, { first: first, second: second });
  f.ctx.state.scholar.day = 137;
  const res3 = Game.winPlanDepartLaunchBeat.call(f.ctx, 'amina_diallo', ['amina_diallo', 'diana_osei']);
  check('§D a genuinely new launch (new day) speaks again', res3 === true && departLines(f.says).length === 2, { res3: res3, n: departLines(f.says).length });
})();

// ---- §E DEPARTBEAT=0 SILENCES ----
(function sectionE() {
  process.env.DEPARTBEAT = '0';
  const f = beatCtx({ needWave: 2, target: 'spool' });
  const res = Game.winPlanDepartLaunchBeat.call(f.ctx, 'amina_diallo', ['amina_diallo', 'diana_osei']);
  check('§E DEPARTBEAT=0: low-wave launch stays silent', res === false && departLines(f.says).length === 0, { res: res, says: f.says });
  const g = beatCtx({ needWave: 4, target: 'herald' });
  const res2 = Game.winPlanDepartLaunchBeat.call(g.ctx, 'amina_diallo', ['amina_diallo', 'diana_osei']);
  check('§E DEPARTBEAT=0: wave-4 launch stays silent too', res2 === false && departLines(g.says).length === 0, { res2: res2 });
  delete process.env.DEPARTBEAT;
})();

// ---- §F WAVE-4+ UNCHANGED ----
(function sectionF() {
  delete process.env.DEPARTBEAT;
  const f = beatCtx({ needWave: 4, target: 'herald' });
  const res = Game.winPlanDepartLaunchBeat.call(f.ctx, 'amina_diallo', ['amina_diallo', 'diana_osei']);
  const beats = departLines(f.says);
  check('§F wave-4 launch still returns true', res === true, { res: res });
  check('§F wave-4 line is the same wording as before',
    beats.length === 1 && beats[0] === 'Amina sets out with Diana after Herald — the fire marks the trail.',
    { line: beats[0] || null });
  const g = beatCtx({ needWave: 5, target: 'herald', systemArrived: true });
  Game.winPlanDepartLaunchBeat.call(g.ctx, 'amina_diallo', ['amina_diallo', 'diana_osei']);
  const beats2 = departLines(g.says);
  check('§F System-arrived line keeps the SYSTEM: prefix',
    beats2.length === 1 && beats2[0].indexOf('📺 SYSTEM: "Amina sets out') === 0, { line: beats2[0] || null });
})();

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
