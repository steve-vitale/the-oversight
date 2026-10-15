#!/usr/bin/env node
// scripts/sense-feastscav-20261015.js — SENSE probe for sim-feastscav
// (loop B, 2026-10-15, #227). SENSE-TESTING LAW: read the beats, not the
// counts. Captures narration on one armed leadfeast seed and prints the
// scavenger-draw beats plus the combat-death beats that follow them —
// does the exposure read as a real consequence of the feast, or as
// disconnected noise?
//
// Usage: FEASTSCALE_R13=1 SEED=11 DAYS=60 node scripts/sense-feastscav-20261015.js
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { installFeastScav } = require('./feastscav-instrument-20261015');

if (process.env.FEASTSCALE_R13 !== '1') {
  console.error('SENSE STOP: FEASTSCALE_R13=1 required.');
  process.exit(2);
}
const FS = require('./policies/feastscale');
const SEED = parseInt(process.env.SEED || '11', 10);
const DAYS = parseInt(process.env.DAYS || '60', 10);

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'feastscav-sense' });
  await setupGame(Game);
  const lines = [];
  Game.say = (t) => { try { lines.push(`[d${(Game.state.scholar || {}).day || 0}] ${String(t).slice(0, 220)}`); } catch (e) {} };
  const inst = installFeastScav(Game);
  let r;
  await quietLog(async () => { r = await runDays(Game, FS.leadfeast, { days: DAYS, sampleEvery: 1 }); });
  const rep = inst.report();
  const winList = inst.buildWindows();
  inst.uninstall();

  const drawDays = new Set(winList.filter(w => w.ch === 'draw-fought').map(w => w.start));
  const deathDays = new Set(rep.deathRows.filter(d => d.combatFamily && d.person).map(d => d.day));
  const interesting = new Set();
  for (const d of drawDays) for (let k = 0; k <= 3; k++) interesting.add(d + k);
  for (const d of deathDays) { interesting.add(d); interesting.add(d - 1); }

  console.log(`== sense-feastscav seed ${SEED} (${r.days}d, ${r.endReason}) — ${rep.draws} draws, ${rep.faced} faced, ${rep.totalCombatDeaths} person combat deaths, ${rep.monsterKills} monster kills ==`);
  const pat = /feast|scavenger|circling|cookfire|draw|heckler|combat|fight|died|death|fell|slain|killed|wound/i;
  let shown = 0;
  for (const ln of lines) {
    const m = ln.match(/^\[d(\d+)\]/);
    const d = m ? parseInt(m[1], 10) : -1;
    if (pat.test(ln) && (interesting.has(d) || /scavenger|circling|draw/i.test(ln)) && shown < 60) {
      console.log('  ' + ln);
      shown++;
    }
  }
  console.log('\n-- instrument windows --');
  for (const w of winList) console.log(`  ${w.ch} d${w.start}-${w.end}${w.monsterId ? ' ' + w.monsterId + (w.veteran ? ' (vet)' : '') : ''}`);
  console.log('-- person combat-death rows (the harm) --');
  for (const d of rep.deathRows.filter(x => x.combatFamily && x.person)) console.log(`  d${d.day} [${d.ch}] ${d.cause} — ${d.who}${d.player ? ' (SCHOLAR)' : ''}`);
  console.log('-- monster kills by channel (exposure companion) --');
  console.log('  ' + JSON.stringify(rep.chMonsterKills || {}));
})().catch(e => { console.error('SENSE CRASH:', e); process.exit(2); });
