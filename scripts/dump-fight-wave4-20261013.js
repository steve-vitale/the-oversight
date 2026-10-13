#!/usr/bin/env node
// scripts/dump-fight-wave4-20261013.js — replay a seed/policy, dump the
// say-stream around each wave-4+ combat (SENSE-TESTING LAW: read the fight,
// not just the outcome). Used by the wave-5 confirm arm to judge whether
// wave-4 monsters function as fights or a death sentence.
//
// Usage: POLICY=leadcourt SEED=22 MAXFIGHTS=3 node scripts/dump-fight-wave4-20261013.js
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');

async function main() {
  const pid = process.env.POLICY || 'leadcourt';
  const seed = parseInt(process.env.SEED || '22', 10);
  const days = parseInt(process.env.DAYS || '180', 10);
  const maxFights = parseInt(process.env.MAXFIGHTS || '3', 10);
  const { [pid]: base } = require('./policies/' + pid);
  const { Game, manifest } = await loadGame({ seed, mode: 'wave4fight-' + pid, fullTelemetry: true });
  await setupGame(Game);
  const said = [];
  const origSay = Game.say.bind(Game);
  Game.say = (line, ...rest) => { said.push({ day: (Game.state.scholar || {}).day, line: String(line) }); return origSay(line, ...rest); };
  const policy = Object.assign({}, base);
  const result = await runDays(Game, policy, { days, manifest, sampleEvery: 10 });
  const tele = result.telemetry || [];
  let shown = 0;
  for (let i = 0; i < tele.length && shown < maxFights; i++) {
    const ev = tele[i];
    if (ev.type === 'combat_start' && (ev.wave || 1) >= 4) {
      shown++;
      let j = i + 1;
      for (; j < tele.length && j < i + 500; j++) { if (tele[j].type === 'combat_end') break; }
      const end = tele[j] && tele[j].type === 'combat_end' ? tele[j] : null;
      console.log(`\n===== fight ${shown}: seed ${seed} ${pid} wave ${ev.wave} vs ${ev.vs} day ${ev.day} pack ${ev.pack} php ${ev.php}`);
      console.log('RESULT:', end ? `${end.result} (php ${end.php}${end.mhp != null ? '/' + end.mhp : ''})` : 'no end found');
      // rounds/hits summary from damage events between start and end
      const d0 = ev.day, d1 = end ? end.day : d0;
      let hits = 0, phits = 0, mdmg = 0, pdmg = 0;
      for (let k = i; k < (end ? j : tele.length); k++) {
        const e = tele[k];
        if (e.type === 'damage') { hits++; if (e.side === 'player') { phits++; mdmg += (e.amount || 0); } else { pdmg += (e.amount || 0); } }
      }
      console.log(`damage events: ${hits} (player landed ${phits} for ~${mdmg}, took ~${pdmg})`);
      const lines = said.filter(s => s.day >= d0 && s.day <= d1);
      console.log(`--- narrative (${lines.length} lines, day ${d0}-${d1}) ---`);
      for (const s of lines.slice(0, 100)) console.log('day ' + s.day + ' | ' + s.line.slice(0, 200));
    }
  }
  console.log(`\n${shown} wave-4+ fight(s) found`);
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
