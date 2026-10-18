// analyze-r18.js — summarize the r18 matrix.
const fs = require('fs');
const path = require('path');
const EVIDIR = path.join(__dirname, '..', 'evidence', '2026-10-18');
const seeds = [8961, 8962, 8963, 8964];
const arms = ['grey', 'trial'];
for (const arm of arms) {
  for (const seed of seeds) {
    const f = path.join(EVIDIR, `journey-endgame-r18-${arm}-s${seed}.json`);
    if (!fs.existsSync(f)) { console.log(`${arm}/${seed}: MISSING`); continue; }
    const d = JSON.parse(fs.readFileSync(f, 'utf8'));
    const m = d.m || {};
    const entries = (m.doorEntries || []).map(e => `${e.path}/${e.branch}${e.band ? '(' + e.band + ')' : ''}@d${e.day} lean=${e.lean} g=${e.grounding}`).join(' | ');
    const trials = (m.trialEvents || []).map(t => `${t.tag}:${t.result || ''}@d${t.day} bearer=${String(t.bearer).slice(0, 8)} weak=${t.weakened} terror=${t.terror}`).join(' | ');
    const finals = (m.finals || []).map(x => `${x.pick}@d${x.day}`).join(' | ');
    const alive = (d.census || []).filter(c => c.alive).length;
    const total = (d.census || []).length;
    console.log(`=== ${arm}/${seed}: days=${d.days} endDay=${d.endDay} won=${d.won} alive=${alive}/${total}`);
    console.log(`    announce=${m.announceDay} sit=${m.sitSceneDay} done=${m.doneDay}`);
    if (entries) console.log(`    doors: ${entries}`);
    if (m.beatSteers && m.beatSteers.length) console.log(`    beatSteers: ${JSON.stringify(m.beatSteers)}`);
    if (trials) console.log(`    trials: ${trials}`);
    if (finals) console.log(`    finals: ${finals}`);
    if (m.failEvents && m.failEvents.length) console.log(`    fails: ${JSON.stringify(m.failEvents.map(x => x.reason.slice(0, 80)))}`);
    if (arm === 'grey') console.log(`    flavor: claimed=${m.flavor.greyRelayClaimed} reroutes=${m.flavor.greyReroutes}`);
    if (m.wonTele && m.wonTele.data) console.log(`    wonTele: ${JSON.stringify(m.wonTele.data).slice(0, 200)}`);
  }
}
