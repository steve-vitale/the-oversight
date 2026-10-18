// mood-honesty analyzer (journey-deepening-r12) — summarizes the moodAudit100
// block of each seed JSON for human sense-reading (M7).
// Usage: node scripts/mood-honesty-analyze-20261018.js <seed-json> [<seed-json>...]
'use strict';
const fs = require('fs');

function summarize(fp) {
  const d = JSON.parse(fs.readFileSync(fp, 'utf8'));
  const rows = d.moodAudit100;
  console.log(`\n===== ${fp.split('/').pop()} day=${d.maxGameDay} end=${d.endReason} =====`);
  if (!rows || rows.err) { console.log('moodAudit100 MISSING/ERR:', JSON.stringify(rows)); return; }
  const moods = {};
  for (const r of rows) { if (r.alive) moods[r.mood] = (moods[r.mood] || 0) + 1; }
  console.log('mood distribution (alive):', JSON.stringify(moods));
  for (const r of rows) {
    if (!r.alive) { console.log(`  [dead] ${r.name}`); continue; }
    const mems = (r.memories10d || []).map(m => `${m.t}(d${m.day})`).join(', ') || 'none';
    const dis = (r.disease10d || []).map(e => `${e.id}(d${e.day})`).join(', ') || 'none';
    const cur = (r.cured10d || []).map(e => `${e.id}(d${e.day})`).join(', ') || 'none';
    const tr = (r.trust10d || []).map(e => `${e.delta > 0 ? '+' : ''}${e.delta}(d${e.day})`).join(', ') || 'none';
    const n = r.needs || {};
    console.log(`  ${r.name} (${r.id.slice(-6)}): mood=${r.mood} trust=${r.trust} needs[h:${n.hunger},f:${n.fear},s:${n.social},e:${n.energy}]`);
    console.log(`    memories10d: ${mems}`);
    console.log(`    disease: ${dis} | cured: ${cur} | trust10d: ${tr}`);
  }
  const deaths = (rows[0] && rows[0].deaths10d) || [];
  const contests = (rows[0] && rows[0].contests10d) || [];
  console.log('  deaths10d:', deaths.map(x => `${x.who}(d${x.day},${String(x.cause).slice(0, 40)})`).join(' | ') || 'none');
  console.log('  contests10d:', contests.map(x => `${x.type}(d${x.day})`).join(' | ') || 'none');
  console.log('  villageGrief:', rows[0] && rows[0].villageGrief, '| villageCheer:', rows[0] && rows[0].villageCheer);
}

for (const fp of process.argv.slice(2)) summarize(fp);
