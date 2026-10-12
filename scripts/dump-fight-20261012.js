#!/usr/bin/env node
// dump-fight-20261012.js — replay one seed, dump the say-stream around each
// wave-3 combat (SENSE-TESTING LAW: read the fight, not just the outcome).
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

(async () => {
  const seed = parseInt(process.env.SEED || '22', 10);
  const days = parseInt(process.env.DAYS || '200', 10);
  const { Game, manifest } = await loadGame({ seed, mode: 'competent', fullTelemetry: true });
  await setupGame(Game);
  const said = [];
  const origSay = Game.say.bind(Game);
  Game.say = (line, ...rest) => { said.push({ day: (Game.state.scholar||{}).day, line: String(line) }); return origSay(line, ...rest); };
  const policy = Object.assign({}, competent);
  const result = await runDays(Game, policy, { days, manifest, sampleEvery: 10 });
  // find combat_start with wave>=3
  const tele = result.telemetry || [];
  for (let i = 0; i < tele.length; i++) {
    const ev = tele[i];
    if (ev.type === 'combat_start' && (ev.wave || 1) >= 3) {
      console.log(`\n===== combat_start seed ${seed} wave ${ev.wave} vs ${ev.vs} day ${ev.day} pack ${ev.pack} php ${ev.php}`);
      // find the matching combat_end
      let j = i + 1;
      for (; j < tele.length && j < i + 400; j++) { if (tele[j].type === 'combat_end') break; }
      const end = tele[j] && tele[j].type === 'combat_end' ? tele[j] : null;
      console.log('RESULT:', end ? end.result + ' (php ' + end.php + ')' : 'no end found');
      // day-range of the fight: narrate lines between
      const d0 = ev.day, d1 = end ? end.day : d0;
      const lines = said.filter(s => s.day >= d0 && s.day <= d1);
      console.log(`--- narrative (${lines.length} lines, day ${d0}-${d1}) ---`);
      for (const s of lines.slice(0, 120)) console.log('day ' + s.day + ' | ' + s.line.slice(0, 160));
    }
  }
})();
