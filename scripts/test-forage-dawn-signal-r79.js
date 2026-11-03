#!/usr/bin/env node
// Proof test for the r79 joint-favor dawn signal (game.js
// jointFavorDawnSignal, hooked into endDay right after the dawn header):
// a promised forage_help / water_haul outing whose partner waits at Haven
// on a window dawn gets ONE dawn line naming them, so a real player learns
// to go talk to them before leaving. Before the fix there was no signal
// at all (r78 blank #2): promises rotted while the partner waited.
// Negative controls: partner away, favor never promised, window passed,
// player away from Haven — all silent. Same-day repeat call: no repeat.
// Each case runs on a FRESH game: favors from earlier cases must not leak
// into later cases' windows (sequential day moves re-open old windows).
// Usage: node scripts/test-forage-dawn-signal-r79.js
const { loadGame, setupGame } = require('./sim-harness');
let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}
async function freshGame() {
  const { Game } = await loadGame({ seed: 385, mode: 'mvc', fullTelemetry: true });
  await setupGame(Game);
  const said = [];
  const origSay = Game.say;
  Game.say = function (t) { said.push(String(t)); try { if (origSay) origSay.call(Game, t); } catch (e) {} };
  const day0 = (Game.state.scholar || {}).day || 0;
  const living = ((Game.state.village || {}).roster || []).filter(id => {
    if (String(id) === String(Game.villagerId)) return false;
    try { return !(Game.getPerson(id) || {}).dead; } catch (e) { return true; }
  });
  function firstName(vid) { try { return Game.displayName(vid).split(' ')[0]; } catch (e) { return String(vid); } }
  function promisedFavor(vid, kind) {
    const f = { id: 'test-' + kind + '-' + String(vid), vid, kind, goal: kind, task: 'test ' + kind,
      state: 'asked', askedDay: day0 - 7, deadline: (day0 - 7) + 2,
      line: '"test"', short: 'test' };
    Game.convoStoreFavor(f);
    const r = Game.convoFavorCommit(vid, f);
    return { f, r };
  }
  return { Game, said, day0, living, firstName, promisedFavor };
}
async function main() {
  // Pre-fix guard: the method must exist, else every case fails cleanly.
  {
    const { Game } = await loadGame({ seed: 385, mode: 'mvc', fullTelemetry: true });
    await setupGame(Game);
    if (typeof Game.jointFavorDawnSignal !== 'function') {
      console.log('FAIL jointFavorDawnSignal missing (pre-fix code)');
      process.exit(1);
    }
  }
  // Case 1: forage partner waiting on meetDay dawn -> one signal naming them.
  {
    const t = await freshGame();
    const vid = t.living[0];
    const c = t.promisedFavor(vid, 'forage_help');
    check('forage commit ok', !!(c.r && c.r.ok), JSON.stringify(c.r));
    t.Game.state.scholar.day = c.f.meetDay; t.Game.dayPart = 0;
    t.said.length = 0;
    const out = t.Game.jointFavorDawnSignal();
    check('forage waiting dawn signals once', out && out.length === 1, 'out=' + JSON.stringify(out));
    check('forage signal names partner', t.said.some(x => x.includes(t.firstName(vid))), 'said=' + JSON.stringify(t.said));
    check('forage signal says forage', t.said.some(x => /forage/i.test(x)), 'said=' + JSON.stringify(t.said));
    // Same-day repeat -> silent.
    t.said.length = 0;
    const out2 = t.Game.jointFavorDawnSignal();
    check('same-day repeat silent', out2.length === 0 && t.said.length === 0, 'out=' + JSON.stringify(out2));
    // Next dawn in the same window signals again (per-day, not one-ever).
    t.Game.state.scholar.day = c.f.meetDay + 1; t.Game.dayPart = 0;
    t.said.length = 0;
    const out3 = t.Game.jointFavorDawnSignal();
    check('second window dawn signals again', out3.length === 1 && t.said.some(x => x.includes(t.firstName(vid))), 'out=' + JSON.stringify(out3));
  }
  // Case 2: water partner waiting -> creek signal.
  {
    const t = await freshGame();
    const vid = t.living[0];
    const c = t.promisedFavor(vid, 'water_haul');
    check('water commit ok', !!(c.r && c.r.ok), JSON.stringify(c.r));
    t.Game.state.scholar.day = c.f.meetDay; t.Game.dayPart = 0;
    t.said.length = 0;
    const out = t.Game.jointFavorDawnSignal();
    check('water waiting dawn signals once', out && out.length === 1, 'out=' + JSON.stringify(out));
    check('water signal says creek', t.said.some(x => /creek/i.test(x)), 'said=' + JSON.stringify(t.said));
  }
  // Case 3: partner away -> silent.
  {
    const t = await freshGame();
    const vid = t.living[0];
    const c = t.promisedFavor(vid, 'forage_help');
    t.Game.state.scholar.day = c.f.meetDay; t.Game.dayPart = 0;
    ((t.Game.state.village || {}).away || (t.Game.state.village.away = {}))[vid] = true;
    t.said.length = 0;
    const out = t.Game.jointFavorDawnSignal();
    check('partner away silent', out.length === 0 && t.said.length === 0, 'out=' + JSON.stringify(out));
  }
  // Case 4: favor asked but never promised -> silent.
  {
    const t = await freshGame();
    const vid = t.living[0];
    const f = { id: 'test-asked-' + String(vid), vid, kind: 'forage_help', goal: 'forage_help',
      task: 'test', state: 'asked', askedDay: t.day0, deadline: t.day0 + 2, line: '"test"', short: 'test' };
    t.Game.convoStoreFavor(f);
    t.Game.state.scholar.day = t.day0 + 1; t.Game.dayPart = 0;
    t.said.length = 0;
    const out = t.Game.jointFavorDawnSignal();
    check('unpromised favor silent', out.length === 0 && t.said.length === 0, 'out=' + JSON.stringify(out));
  }
  // Case 5: window passed (day = dueDay+1) -> silent.
  {
    const t = await freshGame();
    const vid = t.living[0];
    const c = t.promisedFavor(vid, 'forage_help');
    const p = ((t.Game.state.village || {}).promises || {})[vid] || {};
    const due = t.Game.promiseDueDay ? t.Game.promiseDueDay(p) : c.f.deadline;
    t.Game.state.scholar.day = due + 1; t.Game.dayPart = 0;
    t.said.length = 0;
    const out = t.Game.jointFavorDawnSignal();
    check('window passed silent', out.length === 0 && t.said.length === 0, 'due=' + due + ' day=' + t.Game.state.scholar.day);
  }
  // Case 6: player away from Haven -> silent even with a waiting partner.
  {
    const t = await freshGame();
    const vid = t.living[0];
    const c = t.promisedFavor(vid, 'forage_help');
    t.Game.state.scholar.day = c.f.meetDay; t.Game.dayPart = 0;
    const savePx = t.Game.map.px, savePy = t.Game.map.py;
    t.Game.map.px = 0; t.Game.map.py = 0;
    t.said.length = 0;
    const out = t.Game.jointFavorDawnSignal();
    check('player away silent', out.length === 0 && t.said.length === 0, 'out=' + JSON.stringify(out));
    t.Game.map.px = savePx; t.Game.map.py = savePy;
  }
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(1); });
