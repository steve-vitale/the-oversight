#!/usr/bin/env node
// vetaidcrisis-sense.js — SENSE-TESTING material for the aid-crisis channel:
// renders per-crisis beat narratives (raise -> fights/deaths during -> resolve)
// so a human can judge whether the fiction reads as sensible and whether a
// scholar's crisis-defense death reads as meaningful — never just counts.
// Usage: node scripts/vetaidcrisis-sense.js [N]  (N crises to render, default 6)
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const ACORP = path.join(REPO, 'evidence', '2026-10-24', 'perseed-aidcrisis');
const N = parseInt(process.argv[2] || '6', 10) || 6;
const load = f => JSON.parse(fs.readFileSync(f, 'utf8'));

let shown = 0;
for (const f of fs.readdirSync(ACORP).filter(x => /^s70\d+-(lead|belong)\.json$/.test(x)).sort()) {
  if (shown >= N) break;
  const d = load(path.join(ACORP, f));
  const evs = d.crisisEvents;
  const raised = evs.filter(e => e.event === 'raised');
  for (const r of raised) {
    if (shown >= N) break;
    shown++;
    console.log(`=== crisis ${shown}: ${f} — "${r.name}" (wave ${r.wave}, kind ${r.kind}) raised day ${r.day} ===`);
    const res = evs.find(e => e.event === 'resolved' && e.name === r.name && e.day >= r.day);
    const end = res ? res.day : 9999;
    const dur = d.fights.filter(x => x.day >= r.day && x.day <= end);
    const dd = d.deaths.filter(x => x.day >= r.day && x.day <= end);
    for (const x of dur) {
      console.log(`  d${x.day} FIGHT vs ${x.mid}(w${x.wave}) via=${x.via} scholarIn=${x.scholarIn} party=[${(x.party || []).join(',')}] crisisActive=${x.crisisActive} atHaven=${x.atHaven} router=${x.router || '-'}`);
    }
    for (const x of dd) {
      console.log(`  d${x.day} DEATH ${x.whoName}${x.isScholar ? ' [SCHOLAR]' : ''} cause=${x.cause}${x.oppMid ? ' vs ' + x.oppMid + '(w' + x.oppWave + ')' : ''} basis=${x.fightBasis} tenure=${x.tenureDays}d bloodTenure=${x.bloodTenure}d crisisActive=${x.crisisActive}`);
    }
    if (res) console.log(`  d${res.day} RESOLVED how=${res.how} after ${res.crisisDays}d, attracted=${res.attracted}, alliesAtDoor=${res.helpAtDoor}`);
    else console.log('  (unresolved at run end)');
    console.log('');
  }
}
