'use strict';
// One-off analyzer for the wincensus per-seed JSONs -> gate taxonomy tables. (Diagnostic scratch.)
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'evidence', '2026-10-14', 'wincensus-per-seed');
const files = fs.readdirSync(dir).filter(f => f.startsWith('census-')).sort();
for (const f of files) {
  const c = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const g = c.gates;
  console.log('=== ' + f.replace('census-leadfeast-', '').replace('.json', ''));
  console.log('  days=' + c.days, 'end=' + c.endReason, 'chain=' + g.chain.join(' '));
  console.log('  arc4=' + g.arc4Day, 'waiting=' + g.waitingDay, 'scene=' + g.sceneDay + '(' + g.sceneSeat + ')',
    'prompts=' + g.promptsOffered, 'answered=' + g.choicesAnswered,
    'path=' + (g.pathStarted ? g.pathStarted.pathId + '@' + g.pathStarted.day + '/' + g.pathBranch : '-'),
    'beats=' + g.beatsAnswered, 'fails=' + g.fails.length, 'trials=' + g.trials,
    'finals=' + g.finalsDay, 'final=' + (g.finalChosen ? g.finalChosen.id + '@' + g.finalChosen.day + '(floorOk=' + g.finalChosen.floorOk + ',won=' + g.finalChosen.won + ')' : '-'));
  console.log('  deferrals=' + JSON.stringify(g.deferrals), 'wonDay=' + g.wonDay,
    'stall(pendingModal=' + c.stall.pendingModalDays, 'deferred=' + c.stall.deferredDays + ', phaseEnd=' + c.stall.phaseAtEnd + ', choicesEnd=' + c.stall.choicesAtEnd + ', activeEnd=' + c.stall.activeAtEnd + ')');
  console.log('  wall: national=' + c.wall.nationalEver + (c.wall.nationalFirstDay ? '@' + c.wall.nationalFirstDay : ''),
    'maxWave=' + c.wall.maxWaveUnlocked, 'maxSeat=' + c.wall.maxSeat.seat + '@' + c.wall.maxSeat.day,
    'deedBars=' + (c.wall.deedBars ? JSON.stringify(c.wall.deedBars.gw) + ' cx' + c.wall.deedBars.gcx + ' cr' + c.wall.deedBars.gcr + ' rank=' + c.wall.deedBars.grank : '-'));
  const ds = c.deaths.filter(d => d.player).slice(0, 3);
  const vd = c.deaths.filter(d => !d.player);
  const causes = {};
  for (const d of vd) causes[d.cause] = (causes[d.cause] || 0) + 1;
  console.log('  scholarDeaths=' + JSON.stringify(ds.map(d => d.day + ':' + d.cause)),
    'villagerDeaths=' + vd.length, 'causes=' + JSON.stringify(causes).slice(0, 200));
}
