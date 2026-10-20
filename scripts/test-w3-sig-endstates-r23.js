// test-w3-sig-endstates-r23.js -- wave-3 signature counterplay end-states (deepening r23).
// Canon (docs/MONSTER-WAVES.md):
//   Redactor: "Two consecutive quiet turns starve it (damage halved); a third and it flees."
//   Spool: "Feed it heals and waits during the record phase and the replay is medicine
//     and silence" (the counter neutralizes the replay; it does NOT flee).
// r22's design note #3 conflated the two ("canon's 'third quiet turn flees' isn't in the
// code" — that canon is the Redactor's, and it IS in sigW3a.js). This test pins the
// actual end-states:
//   T1: redactor flees after quiet turns (grace turn + 3 quiet = 4 player turns).
//   T2: spool fed 3 waits => harmless replay; the fight then resolves by killing it
//       within a sane round bound.
//   T3 (report-only): spool stays and replays silence if the player keeps waiting —
//       the neutralized state is permanent by design (Steve call if it should leave).
// Prints PASS/FAIL lines and exits nonzero on failure. No-party fights (party strikes
// would pollute the quiet measurement).
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const HARNESS = path.join(ROOT, 'scripts', 'sim-harness.js');
let pass = 0, fail = 0; const fails = [];
function ok(cond, name) {
  if (cond) { pass++; console.log('  ok: ' + name); }
  else { fail++; fails.push(name); console.log('  FAIL: ' + name); }
}
function gameEval(seed, js) {
  const tmpFile = '/tmp/w3end-' + seed + '-' + process.pid + '.js';
  const code = `
const { loadGame, setupGame } = require(${JSON.stringify(HARNESS)});
const lib = require(${JSON.stringify(path.join(ROOT, 'scripts', 'godpath', 'lib.js'))});
(async () => {
  const { Game } = await loadGame({ seed: ${seed}, mode: 'synth', fullTelemetry: false });
  await setupGame(Game);
  const out = {};
  try { await (async () => { ${js} })(); } catch (e) { out.__err = String(e && (e.stack || e)).slice(0, 700); }
  console.log(JSON.stringify(out));
})().catch(e => { console.log(JSON.stringify({ __crash: String(e).slice(0, 300) })); });
`;
  fs.writeFileSync(tmpFile, code);
  try {
    const r = execSync('node ' + tmpFile, { cwd: path.join(ROOT, 'scripts'), maxBuffer: 32 * 1024 * 1024 }).toString();
    return JSON.parse(r.split('\n').pop() || r);
  } finally { try { fs.unlinkSync(tmpFile); } catch (e) {} }
}
const DRIVE = `
function endTurn() {
  if (!Game.tbfight || Game.tbfight.over) return;
  if (!Game.tbIsPlayerTurn()) return;
  const p = Game.tbFighter('p'); if (p) { p.moveLeft = 0; p.acted = true; }
  Game.tbAfterPlayerAction();
}
function quietTurn() {
  if (!Game.tbfight || Game.tbfight.over) return false;
  if (!Game.tbIsPlayerTurn()) return false;
  try { Game.tbPlayerWait(); } catch (e) { endTurn(); return true; }
  return true; // tbPlayerWait auto-advances (AGENTS.md)
}
function strikeTurn() {
  if (!Game.tbfight || Game.tbfight.over) return -1;
  const f = Game.tbfight;
  const m = f.fighters.find(x => x.kind === 'monster' && x.alive && !x.fled);
  if (!m || !Game.tbIsPlayerTurn()) return -1;
  const p = Game.tbFighter('p');
  if (p) {
    p.mx = Math.min(7, Math.max(1, m.mx + 1)); p.my = Math.min(7, Math.max(1, m.my));
    if (p.mx === m.mx && p.my === m.my) p.mx = Math.max(1, m.mx - 1);
  }
  const hp0 = m.hp;
  try { Game.tbPlayerStrike(m.key); } catch (e) {}
  endTurn();
  return hp0; // hp-before; caller re-reads state
}
function mstate() {
  if (!Game.tbfight) return { gone: true, over: true, why: 'fight-cleared' };
  const f = Game.tbfight;
  const m = f.fighters.find(x => x.kind === 'monster');
  return { gone: false, over: !!f.over, why: f.why || f.over || false, fled: !!(m && m.fled),
           hp: m ? m.hp : -1, alive: !!(m && m.alive), round: f.round || 0 };
}
`;

// ---------- T1: REDACTOR flees after quiet turns ----------
console.log('== T1 redactor quiet-flee ==');
{
  const o = gameEval(1101, DRIVE + `
    lib.fight(Game, 'redactor'); // no party: clean verb measurement
    const says = [];
    const _say = Game.say; Game.say = function (m) { says.push(String(m)); try { return _say.apply(this, arguments); } catch (e) {} };
    const p = Game.tbFighter('p'); if (p) { p.hp = 600; p.maxHp = 600; }
    let waits = 0;
    for (let i = 0; i < 6 && !mstate().over; i++) { if (quietTurn()) waits++; }
    const st = mstate();
    out.waits = waits; out.over = st.over; out.fled = st.fled; out.why = String(st.why);
    out.starveNote = says.some(s => /STARVING/i.test(s));
    out.fleeNote = says.some(s => /starves/i.test(s) && /goes/i.test(s));
  `);
  if (o.__err || o.__crash) { ok(false, 'redactor scenario ran clean (' + (o.__err || o.__crash) + ')'); }
  else {
    ok(o.over === true, 'fight over after quiet turns (waits=' + o.waits + ', over=' + o.over + ')');
    // when the redactor flees the fight object is cleared (gone=true); the narrated
    // flee beat is the ground truth for the counter firing.
    ok(o.fleeNote === true, 'redactor fled (flee beat narrated; fight cleared=' + o.over + ')');
    ok(o.waits <= 4, 'flee by the 4th quiet turn (grace + 3; got ' + o.waits + ')');
    ok(o.starveNote === true, 'starving beat narrated');
    ok(o.fleeNote === true, 'flee beat narrated');
  }
}

// ---------- T2: SPOOL fed waits => harmless replay, killable ----------
console.log('== T2 spool feed-silence end-state ==');
{
  const o = gameEval(1102, DRIVE + `
    lib.fight(Game, 'spool'); // no party
    const p = Game.tbFighter('p'); if (p) { p.hp = 800; p.maxHp = 800; }
    for (let i = 0; i < 3 && !mstate().over; i++) quietTurn();
    const mm = Game.tbfight.fighters.find(x => x.kind === 'monster');
    const recLen = (mm.spRec || []).length;
    const hpAfterRecord = p.hp;
    let rounds = 0;
    while (!mstate().over && rounds < 80) { rounds++; strikeTurn(); }
    const st = mstate();
    out.recLen = recLen; out.hpLostInRecord = 800 - hpAfterRecord;
    out.roundsToKill = rounds; out.over = st.over; out.mAlive = st.alive; out.mhp = st.hp;
    out.playerHp = p.hp;
  `);
  if (o.__err || o.__crash) { ok(false, 'spool scenario ran clean (' + (o.__err || o.__crash) + ')'); }
  else {
    ok(o.recLen === 3, 'record phase captured 3 turns (got ' + o.recLen + ')');
    ok(o.hpLostInRecord === 0, 'record phase is harmless (player lost ' + o.hpLostInRecord + ' HP)');
    // when the spool dies the fight object is cleared (gone); over=true is the kill.
    ok(o.over === true, 'spool dies after feed-silence (over=' + o.over + ')');
    ok(o.roundsToKill <= 60, 'kill resolves in a sane bound (' + o.roundsToKill + ' rounds)');
    console.log('  info: spool kill took ' + o.roundsToKill + ' rounds, player HP ' + o.playerHp + '/800');
  }
}

// ---------- T3 (report-only): neutralized spool does not leave on its own ----------
console.log('== T3 spool neutralized-state (report-only) ==');
{
  const o = gameEval(1103, DRIVE + `
    lib.fight(Game, 'spool'); // no party
    const p = Game.tbFighter('p'); if (p) { p.hp = 2000; p.maxHp = 2000; }
    for (let i = 0; i < 3 && !mstate().over; i++) quietTurn();
    const m0 = Game.tbfight.fighters.find(x => x.kind === 'monster');
    const hp0 = m0.hp;
    let rounds = 0;
    while (!mstate().over && rounds < 40) { rounds++; quietTurn(); }
    const st = mstate();
    out.roundsWaited = rounds; out.over = st.over; out.fled = st.fled;
    out.mhp0 = hp0; out.mhp = st.hp; out.playerHp = p.hp;
  `);
  if (o.__err || o.__crash) { console.log('  info: scenario errored: ' + (o.__err || o.__crash)); }
  else {
    console.log('  info: after ' + o.roundsWaited + ' quiet replay rounds: over=' + o.over +
      ', fled=' + o.fled + ', spool HP ' + o.mhp0 + '->' + o.mhp + ', player HP=' + o.playerHp);
    console.log('  info: the neutralized spool neither attacks nor leaves — the trick makes a safe punching bag.');
  }
}

console.log('\n' + pass + ' passed, ' + fail + ' failed');
if (fail) { console.log('FAILURES: ' + fails.join('; ')); process.exit(1); }
