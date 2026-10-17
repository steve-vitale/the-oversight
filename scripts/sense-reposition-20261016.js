#!/usr/bin/env node
// sense-read for sim-reposition: replay belongfeast-s3402-armed (face_it x2
// on d21 and d29) and dump the fight narration around those performances.
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
const { withReposition } = require(path.join(REPO, 'scripts', 'policies', 'reposition'));

(async () => {
  process.env.FEASTSCALE_R13 = '1';
  process.env.TRIBFLOOR = '1';
  process.env.SEATDRIVE = '0';
  process.env.REPOSITION = '1';
  const { Game } = await loadGame({ seed: 3402, mode: 'reposition-sense', fullTelemetry: false });
  await setupGame(Game);
  const dayOf = () => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
  const lines = [];
  const _s = Game.say.bind(Game);
  Game.say = function (t) {
    try {
      const d = dayOf();
      if (d === 21 || d === 29) {
        const s = String(t || '');
        if (/fight|trick|move|step|back|gaze|eye|pounce|sweep|tiger|COUNTER|shadow|arch|lunge|turn|round/i.test(s)) {
          lines.push(`d${d}: ${s.slice(0, 280)}`);
        }
      }
    } catch (e) {}
    return _s(t);
  };
  const policy = withReposition(TF.belongfeast, 'reposition-belong', 'sense');
  await quietLog(async () => { await runDays(Game, policy, { days: 35, manifest: undefined, sampleEvery: 30 }); });
  console.log('=== fight-narration lines on d21/d29 (face_it performance days) ===');
  const seen = new Set();
  for (const l of lines) { if (!seen.has(l)) { seen.add(l); console.log(l); } }
  console.log(`\n(${lines.length} raw, ${seen.size} unique)`);
})();
