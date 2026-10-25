// scripts/analyze-scale-r31-20261024.js — journey-scale r32 analyzer.
// Classifies the third-bond blocker per seed from the weekly village census:
//   count-ceiling (total villages - first primary-sub link < 3 covenant slots),
//   unknown (an unlinked village never known by end), opinion<10,
//   declined/countered (capture lines), seasoned-trust bar, reached.
// Usage: node scripts/analyze-scale-r31-20261024.js [EVIDIR]
'use strict';
const fs = require('fs');
const path = require('path');
const EVIDIR = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-10-25', 'journey-scale-r32-nogate');
const files = fs.readdirSync(EVIDIR).filter(f => /^journey-scale-r32-nogate-\d+\.json$/.test(f)).sort();
if (!files.length) { console.log('no census JSONs in ' + EVIDIR); process.exit(1); }
for (const f of files) {
  const { census: c } = JSON.parse(fs.readFileSync(path.join(EVIDIR, f), 'utf8'));
  const cap = (() => { try { return fs.readFileSync(path.join(EVIDIR, f.replace(/nogate-(\d+)\.json$/, 'capture-$1.txt')), 'utf8'); } catch (e) { return ''; } })();
  const cov = (c.links || []).filter(l => l.kind === 'covenant');
  const prim = (c.links || []).filter(l => l.kind === 'primary-sub');
  const vw = c.villageWatch || [];
  const last = vw.length ? vw[vw.length - 1] : null;
  const endVillages = last ? last.villages : [];
  const unknown = endVillages.filter(v => !v.known && !v.linkKind);
  const belowBar = endVillages.filter(v => v.known && !v.linkKind && (v.opinion || 0) < 10);
  const atBar = endVillages.filter(v => v.known && !v.linkKind && (v.opinion || 0) >= 10);
  const maxPeers = (c.villageTotal || 0) - prim.length;
  const seasoned = cov.filter(l => l.ageDays >= 30 && l.trust >= 40); // _linkSeasoned: age>=30 AND trust>=40
  const cnt = (re) => (cap.match(re) || []).length;
  // pool drawn: weekly poolWatch samples miss mid-week pour+draw (pilot: 0 at every
  // sample, 4,001 drawn). Parse draw amounts from the capture instead.
  const draws = [...cap.matchAll(/draws ([\d,]+) kcal from the league granary/g)].map(m => parseInt(m[1].replace(/,/g, ''), 10));
  const poolDrawn = draws.reduce((a, b) => a + b, 0);
  let blocker;
  if (c.nationalLive || c.nationalDay) blocker = 'REACHED';
  else if (maxPeers < 3) blocker = 'count-ceiling';
  else if (cov.length >= 3 && seasoned.length < 3) blocker = 'seasoned-trust-bar';
  else if (unknown.length) blocker = 'unknown-village';
  else if (belowBar.length && !atBar.length) blocker = 'opinion<10';
  else blocker = 'declined/countered-or-other';
  console.log(`seed ${c.seed}: day=${c.day} over=${c.over} pop=${c.popAlive}/${c.popTotal} rank=${c.scaleRank} nat=${c.nationalDay} glob=${c.globalDay} totalVill=${c.villageTotal} knownEnd=${c.villageKnownEnd} primLinks=${prim.length} covLinks=${cov.length} seasonedCov=${seasoned.length} maxPeers=${maxPeers} proposed=${c.proposedLead} proposedPeer=${c.proposedPeer} pilgrimages=${c.pilgrimages} studies=${c.climbStudies} barelyKnow=${cnt(/barely know Haven's name/g)} declinesCov=${cnt(/declines the covenant/g)} counters=${cnt(/doesn't say no\. They say/g)} poolDrawn=${poolDrawn} poorDays=${c.courtPoorDays||0} pilgPoor=${c.pilgrimagesPoor||0} propPoor=${c.proposedPeerPoor||0} BLOCKER=${blocker}`);
  console.log(`   end villages: ${endVillages.map(v => `${v.id} known=${v.known} op=${v.opinion} codex=${v.codexGiven} link=${v.linkKind || '-'}`).join(' | ')}`);
  console.log(`   unknown=${unknown.length} belowBar=${belowBar.length} atBarUnlinked=${atBar.length}`);
}
