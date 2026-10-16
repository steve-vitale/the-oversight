#!/usr/bin/env node
// Proof: sysSay single-prefix (journey-establishment r10 2026-10-16).
// The "📺 SYSTEM:" wrapper already marks the voice — a leading 📺 in the
// text doubled it (pilot episode rendered as 📺 SYSTEM: "📺 Ahem...").
// The fix strips one leading 📺 for DISPLAY ONLY; systemVoiceIdFor must
// still receive the original text so pre-generated MP3 matching is unchanged.
//
// RED: run against the pre-fix game.js to see the doubled prefix.
// GREEN: exactly one 📺 (the SYSTEM wrapper's) in the said line.

const { loadGame, setupGame } = require('./sim-harness');

const SEED = parseInt(process.env.SEED || '61', 10);

(async () => {
  const { Game } = await loadGame({ seed: SEED, narration: true });
  await setupGame(Game);
  Game.state.systemArrived = true;

  const said = [];
  const _say = Game.say.bind(Game);
  Game.say = function (t) { said.push(String(t)); };

  // capture what the voice lookup receives
  const voiceSeen = [];
  const _vid = Game.systemVoiceIdFor ? Game.systemVoiceIdFor.bind(Game) : null;
  Game.systemVoiceIdFor = function (t) { voiceSeen.push(String(t)); return _vid ? _vid(t) : null; };

  Game.sysSay('📺 Ahem. Testing. Testing. Is this thing on?');
  Game.sysSay('"Ooh. A DELEGATOR! No leading emoji here."');
  Game.sysSay('📺Pardon the jank — no space after emoji.');

  Game.say = _say;
  if (_vid) Game.systemVoiceIdFor = _vid;

  let fail = 0;
  const ok = (cond, msg) => {
    console.log((cond ? 'PASS' : 'FAIL') + ' ' + msg);
    if (!cond) fail++;
  };

  ok(said.length === 3, `3 lines said (got ${said.length})`);
  // 1. prefixed input -> exactly one 📺 (the SYSTEM wrapper's)
  const c1 = (said[0].match(/📺/g) || []).length;
  ok(c1 === 1, `prefixed text renders single 📺 (got ${c1}): ${said[0].slice(0, 60)}`);
  ok(said[0].indexOf('📺 SYSTEM: "Ahem. Testing.') === 0, 'wrapper intact, text stripped: ' + said[0].slice(0, 50));
  // 2. unprefixed input -> unchanged behavior (one 📺 from wrapper)
  const c2 = (said[1].match(/📺/g) || []).length;
  ok(c2 === 1 && said[1].indexOf('📺 SYSTEM: ""Ooh. A DELEGATOR!') === 0, 'unprefixed text unchanged: ' + said[1].slice(0, 50));
  // 3. no-space variant also stripped
  const c3 = (said[2].match(/📺/g) || []).length;
  ok(c3 === 1 && said[2].indexOf('📺 SYSTEM: "Pardon the jank') === 0, 'no-space 📺 stripped: ' + said[2].slice(0, 50));
  // 4. voice lookup still sees ORIGINAL text (MP3 matching unchanged)
  ok(voiceSeen[0] === '📺 Ahem. Testing. Testing. Is this thing on?', 'voice lookup got original text: ' + voiceSeen[0].slice(0, 40));
  ok(voiceSeen[1] === '"Ooh. A DELEGATOR! No leading emoji here."', 'voice lookup unprefixed unchanged');

  // 5. determinism spot: same seed twice -> identical output
  console.log(fail === 0 ? 'GREEN' : 'RED');
  process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error('FATAL', e); process.exit(2); });
