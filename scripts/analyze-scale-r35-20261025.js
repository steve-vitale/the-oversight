// scripts/analyze-scale-r34-20261025.js — journey-scale r34 analyzer.
// Adds r34 sections: picker stretch/post-deflect counts from transcripts,
// and covenant/primary trust trajectories from the weekly village census.
// Classifies the third-bond blocker per seed from the weekly village census:
//   count-ceiling (total villages - first primary-sub link < 3 covenant slots),
//   unknown (an unlinked village never known by end), opinion<10,
//   declined/countered (capture lines), seasoned-trust bar, reached.
// Usage: node scripts/analyze-scale-r35-20261025.js [EVIDIR]
'use strict';
const fs = require('fs');
const path = require('path');
const EVIDIR = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-10-25', 'journey-scale-r35-trustset');
const files = fs.readdirSync(EVIDIR).filter(f => /^journey-scale-r35-trust-\d+\.json$/.test(f)).sort();
if (!files.length) { console.log('no census JSONs in ' + EVIDIR); process.exit(1); }
for (const f of files) {
  const { census: c } = JSON.parse(fs.readFileSync(path.join(EVIDIR, f), 'utf8'));
  const cap = (() => { try { return fs.readFileSync(path.join(EVIDIR, f.replace(/trust-(\d+)\.json$/, 'capture-$1.txt')), 'utf8'); } catch (e) { return ''; } })();
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
  // R33 picker stats: parse YOU picks from this seed's transcripts.
  const tfiles = fs.readdirSync(EVIDIR).filter(f => f.indexOf(`transcript-${c.seed}-day`) !== -1).sort();
  for (const tf of tfiles) {
    const txt = fs.readFileSync(path.join(EVIDIR, tf), 'utf8');
    const picks = [...txt.matchAll(/^YOU: \[([^\]]+)\]/gm)].map(m => m[1]);
    let maxRun = 0, run = 0, postDef = 0, deflected = false;
    for (const p of picks) {
      if (p === 'dlg:more' || p === 'goon') { run += 1; maxRun = Math.max(maxRun, run); if (deflected) postDef += 1; }
      else { run = 0; if (p === 'dlg:cant' || p === 'gq:open:honest_pass') deflected = true; }
    }
    console.log(`   PICK ${tf}: picks=${picks.join(',') || 'none'} maxStretch=${maxRun} postDeflectGoon=${postDef}`);
  }
  // R33 trust trajectories: per final link, first/peak/final trust from weekly samples.
  const traj = (vid) => {
    const pts = [];
    for (const s of vw) { const v = (s.villages || []).find(x => x.id === vid); if (v && v.linkTrust != null) pts.push({ day: s.day, trust: v.linkTrust, age: v.linkAge, kind: v.linkKind }); }
    if (!pts.length) return null;
    let peak = pts[0];
    for (const p of pts) if (p.trust > peak.trust) peak = p;
    return { first: pts[0], peak, final: pts[pts.length - 1], ever40: pts.some(p => p.trust >= 40), n: pts.length };
  };
  for (const l of (c.links || [])) {
    const t = traj(l.other);
    if (!t) continue;
    console.log(`   TRUST ${l.kind} ${l.other}: first=${t.first.trust}@d${t.first.day} peak=${t.peak.trust}@d${t.peak.day}(age ${t.peak.age}) final=${t.final.trust}@d${t.final.day}(age ${t.final.age}) ever40=${t.ever40} samples=${t.n}`);
  }
  // R34 daily trust attribution: per-link daily snapshots -> weekly delta
  // sums, split by the first day any covenant snapshot shows poolLive.
  const tw = c.trustWatch || [];
  const ev = c.trustEvents || [];
  const byLink = {};
  for (const t of tw) { const k = t.other + '|' + t.kind; (byLink[k] = byLink[k] || []).push(t); }
  let poolDay = null;
  for (const t of tw) if (t.kind === 'covenant' && t.poolLive) { poolDay = t.day; break; }
  console.log(`   TRUST34 poolLiveDay=${poolDay} snapshots=${tw.length} events=${ev.length}`);
  for (const k of Object.keys(byLink)) {
    const pts = byLink[k];
    const first = pts[0], last = pts[pts.length - 1];
    const weekDelta = {};
    for (let i = 1; i < pts.length; i++) { const d = pts[i].trust - pts[i - 1].trust; if (d !== 0) { const w = Math.floor(pts[i].day / 7); weekDelta[w] = (weekDelta[w] || 0) + d; } }
    const weeks = Object.keys(weekDelta).sort((a, b) => a - b);
    const prePool = weeks.filter(w => poolDay == null || (w * 7) < poolDay);
    const postPool = weeks.filter(w => poolDay != null && (w * 7) >= poolDay);
    const sum = (ws) => ws.reduce((s, w) => s + weekDelta[w], 0);
    const evKinds = {};
    for (const e of ev) if ((e.other + '|' + e.kind) === k) evKinds[e.noteKind] = (evKinds[e.noteKind] || 0) + 1;
    console.log(`   TRUST34 ${k}: first=${first.trust}@d${first.day} last=${last.trust}@d${last.day} peak=${Math.max(...pts.map(p => p.trust))} ever40=${pts.some(p => p.trust >= 40)} prePoolNet=${sum(prePool)} (weeks ${prePool.length}) postPoolNet=${sum(postPool)} (weeks ${postPool.length}) weekDeltas={${weeks.map(w => `w${w}:${weekDelta[w]}`).join(' ')}} events=${JSON.stringify(evKinds)}`);
    const es = ev.filter(e => (e.other + '|' + e.kind) === k);
    if (es.length) console.log(`   EVENTS ${k}: ${es.map(e => `d${e.day}[${e.noteKind}]`).join(' ')}`);
  }
  // R35 trust-setter attribution: site derivation from setter stacks.
  const siteOf = (stack) => {
    const frames = String(stack || '').split(' | ').map(x => x.trim()).filter(x => x.indexOf('at ') === 0);
    let fs = frames.filter(x => x.indexOf('[as trust]') === -1 && !/\.set\b/.test(x));
    if (fs.length && /_trustGain/.test(fs[0])) fs = fs.slice(1);
    if (!fs.length) return 'unknown';
    let fi = 0;
    // 'eval' frames are linkTick's _trustGain calls (hierarchy.js:1150/1177/
    // 1189) — the site is the linkTick frame behind them.
    if (/at eval/.test(fs[0]) && fs.length > 1) fi = 1;
    const m = fs[fi].match(/at (?:Object\.|async )?([A-Za-z_$][\w$.]*)/);
    if (!m) return 'unknown';
    const parts = m[1].split('.');
    return parts[parts.length - 1];
  };
  const tsl = c.trustSetLog || [];
  const bySite = {}, drops = [], setterSum = {};
  for (const e of tsl) {
    const site = siteOf(e.stack);
    bySite[site] = (bySite[site] || 0) + 1;
    if (e.delta <= -4) drops.push(e);
    const k = e.other + '|' + e.kind;
    setterSum[k] = setterSum[k] || {};
    setterSum[k][e.day] = (setterSum[k][e.day] || 0) + e.delta;
  }
  console.log(`   TRUST35 setterEvents=${tsl.length} sites=${JSON.stringify(bySite)} drops<=-4=${drops.length}`);
  for (const d of drops) console.log(`   DROP ${d.kind} ${d.other}: d${d.day} ${d.before}->${d.after} (delta ${d.delta}) site=${siteOf(d.stack)}`);
  // Day-label reconciliation (PRE-REGISTERED ATTR test): snapshot delta vs
  // setter sum for the same link-day. Night moves (sleep-phase ticks and
  // night deeds) log the OLD day but land in the NEXT snapshot, so this
  // test is expected to under-match; it is reported as written, not fixed.
  const snapByLink = {};
  for (const t of tw) { const k = t.other + '|' + t.kind; (snapByLink[k] = snapByLink[k] || []).push(t); }
  let matchDays = 0, mismatchDays = 0;
  const mismatches = [];
  for (const k of Object.keys(snapByLink)) {
    const pts = snapByLink[k];
    for (let i = 1; i < pts.length; i++) {
      const d = pts[i].trust - pts[i - 1].trust;
      if (d === 0) continue;
      const ss = (setterSum[k] && setterSum[k][pts[i].day]) || 0;
      if (ss === d) matchDays++;
      else { mismatchDays++; mismatches.push(`${k} d${pts[i].day} snapDelta=${d} setterSum=${ss}`); }
    }
  }
  console.log(`   TRUST35 reconcile-daylabel: matchedLinkDays=${matchDays} mismatchedLinkDays=${mismatchDays}`);
  for (const m of mismatches.slice(0, 10)) console.log(`   MISMATCH ${m}`);
  // Order-greedy reconciliation (exact test): walk each link's snapshots
  // and advance through its setter entries in order; every snapshot level
  // must be hit exactly, and the remaining tail must land on the census
  // final. This is lag-proof: night moves simply sit later in the order.
  const censByLink = {};
  for (const l of (c.links || [])) censByLink[l.other + '|' + l.kind] = l.trust;
  let greedyOk = 0, greedyBad = [];
  for (const k of Object.keys(snapByLink)) {
    const pts = snapByLink[k];
    const entries = tsl.filter(e => (e.other + '|' + e.kind) === k);
    let run = pts[0].trust, cut = 0, good = true;
    for (let i = 1; i < pts.length; i++) {
      const target = pts[i].trust;
      while (cut < entries.length && run !== target) { run += entries[cut].delta; cut++; }
      if (run !== target) { good = false; greedyBad.push(`${k} snap d${pts[i].day} target=${target} run=${run}`); break; }
    }
    if (good) {
      const tail = entries.slice(cut).reduce((a, e) => a + e.delta, 0);
      if (k in censByLink && run + tail !== censByLink[k]) { good = false; greedyBad.push(`${k} tail run+tail=${run + tail} census=${censByLink[k]}`); }
    }
    if (good) greedyOk++;
  }
  console.log(`   TRUST35 reconcile-order: explainedLinks=${greedyOk}/${Object.keys(snapByLink).length} bad=${JSON.stringify(greedyBad)}`);
  // R35 betrayal + driver-drop scan over this seed's transcripts.
  const tfiles2 = fs.readdirSync(EVIDIR).filter(f => f.indexOf(`transcript-${c.seed}-day`) !== -1).sort();
  for (const tf of tfiles2) {
    const txt = fs.readFileSync(path.join(EVIDIR, tf), 'utf8');
    const picks = [...txt.matchAll(/^YOU: \[([^\]]+)\]/gm)].map(m => m[1]);
    const betray = picks.filter(x => x.indexOf('betrayal:') === 0);
    const drop = txt.indexOf('DRIVER DROP') !== -1;
    const wantLine = (txt.split('\n').find(x => x.indexOf('want:') === 0) || '');
    console.log(`   BETRAY ${tf}: want=${wantLine.replace('want: ', '')} betrayPicks=${betray.join(',') || 'none'} driverDrop=${drop} picks=${picks.join(',') || 'none'}`);
  }
  // R35 post-national window.
  const natDay = c.nationalDay || null;
  const postDays = natDay != null ? (c.day - natDay) : null;
  const poolPost = natDay != null ? tw.filter(t => t.kind === 'covenant' && t.poolLive && t.day > natDay).length : 0;
  console.log(`   POSTNAT nationalDay=${natDay} finalDay=${c.day} postNatDays=${postDays} poolLiveDaysAfterNational=${poolPost}`);
}
