// analyze-capablewinpath-b.js — DIAG arm sim-capablewinpath-b.
// Reads evidence/2026-11-14/perseed-capablewinpath-b/*.json, classifies
// every seed (prereg taxonomy), extracts per-seed milestone days from the
// daily series, ranks the divergence steps, and runs the reproduction
// check against the stage-2 AFTER-leg corpus
// (evidence/2026-11-14/perseed-rageprecheck-b-confirm-after/).
// Usage: node scripts/analyze-capablewinpath-b.js [--outdir <dir>]
// Prints markdown tables to stdout; also writes
// evidence/2026-11-14/capablewinpath-b-analysis.json.
// As a module: { classify, milestones, analyze }.
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');
const OUTDIR = process.argv.includes('--outdir')
  ? path.resolve(process.argv[process.argv.indexOf('--outdir') + 1])
  : path.join(REPO, 'evidence', '2026-11-14', 'perseed-capablewinpath-b');
const REPRO_DIR = path.join(REPO, 'evidence', '2026-11-14', 'perseed-rageprecheck-b-confirm-after');

function firstDay(series, pred) {
  for (const s of series) if (pred(s)) return s.d;
  return null;
}
function snapAt(series, day) {
  let best = null;
  for (const s of series) { if (s.d <= day) best = s; else break; }
  return best;
}
function wkGet(wk, w) {
  if (!wk) return 0;
  return (wk[String(w)] | 0) || (wk[w] | 0) || 0;
}

// Per-seed milestones from one recorder record.
function milestones(r) {
  const S = r.series || [];
  const m = { seed: r.seed, policy: r.policy };
  m.firstSeatDay = firstDay(S, function (s) { return s.seat !== 'none'; });
  m.seatKind = m.firstSeatDay != null ? (snapAt(S, m.firstSeatDay) || {}).seat : 'none';
  m.previewReadyDay = firstDay(S, function (s) { return s.preview && s.preview.ready; });
  m.seatTakenDay = (r.seatTakes && r.seatTakes.length) ? r.seatTakes[0].day : null;
  m.seatTakenSeat = (r.seatTakes && r.seatTakes.length) ? r.seatTakes[0].seat : null;
  m.regionalDay = firstDay(S, function (s) { return s.scale === 'regional' || s.scale === 'national' || s.scale === 'global'; });
  m.nationalDay = firstDay(S, function (s) { return s.scale === 'national' || s.scale === 'global'; });
  m.arc2Day = firstDay(S, function (s) { return s.arc >= 2; });
  m.arc3Day = firstDay(S, function (s) { return s.arc >= 3; });
  m.arc4Day = firstDay(S, function (s) { return s.arc >= 4; });
  m.w1Day = firstDay(S, function (s) { return s.w1 >= 4; });
  m.w2Day = firstDay(S, function (s) { return s.w2 >= 4; });
  m.w3Day = firstDay(S, function (s) { return s.w3 >= 3; });
  m.contDay = firstDay(S, function (s) { return s.cont >= 2; });
  m.crisDay = firstDay(S, function (s) { return s.cris >= 2; });
  m.stage2Day = firstDay(S, function (s) { return s.stage >= 2; });
  m.sentDay = firstDay(S, function (s) { return s.sent === 1; });
  m.surgeDay = firstDay(S, function (s) { return s.surge === 1; });
  m.ladDay = firstDay(S, function (s) { return s.ladPeak >= 1; });
  m.w4KillDay = firstDay(S, function (s) { return wkGet(s.wk, 4) > 0; });
  m.w5KillDay = firstDay(S, function (s) { return wkGet(s.wk, 5) > 0; });
  const unw = (r.events || []).filter(function (e) { return e.kind === 'unlockedWave'; });
  m.unlock4Day = null; m.unlock5Day = null;
  for (const e of unw) { if (e.wave >= 4 && m.unlock4Day == null) m.unlock4Day = e.day; if (e.wave >= 5 && m.unlock5Day == null) m.unlock5Day = e.day; }
  m.winDay = r.won ? r.days : null;
  m.path = (r.tableState && r.tableState.path) || null;
  m.branch = (r.tableState && r.tableState.branch) || null;
  m.final = (r.tableState && r.tableState.final) || null;
  m.tablePathChoice = ((r.tableChoices || []).filter(function (c) { return String(c.id).indexOf('path:') === 0; }).map(function (c) { return c.id; }) || [])[0] || null;
  // Standing split + veterans + abilities at first-seat day (or day 90).
  const atSeat = m.firstSeatDay != null ? snapAt(S, m.firstSeatDay) : null;
  const at90 = snapAt(S, 90);
  m.standingAtSeat = atSeat ? { total: atSeat.stRaw, war: atSeat.war, dip: atSeat.dip, plenty: atSeat.plenty, warPts: atSeat.warPts, links: atSeat.links, feasts: atSeat.feasts } : null;
  m.vetAtSeat = atSeat ? { vet4: atSeat.vet4, vet5: atSeat.vet5 } : null;
  m.abilAtSeat = atSeat ? atSeat.abil.slice() : null;
  m.standingAt90 = at90 ? { total: at90.stRaw, war: at90.war, dip: at90.dip, plenty: at90.plenty } : null;
  // Binding bar: the last lesser-seat bar to complete (max completion day).
  const bars = { w1: m.w1Day, w2: m.w2Day, w3: m.w3Day, cont: m.contDay, cris: m.crisDay, stage2: m.stage2Day, sent: m.sentDay, ladPeak: m.ladDay, regional: m.regionalDay };
  let binding = null, bindingDay = -1;
  for (const k of Object.keys(bars)) {
    if (bars[k] == null) { binding = k; bindingDay = null; break; }
    if (bars[k] > bindingDay) { bindingDay = bars[k]; binding = k; }
  }
  // If some bar never completes, the binding bar is the never-completing one.
  const neverBars = Object.keys(bars).filter(function (k) { return bars[k] == null; });
  m.barDays = bars;
  m.bindingBar = neverBars.length ? neverBars[0] : binding;
  m.bindingDay = neverBars.length ? null : bindingDay;
  m.neverBars = neverBars;
  m.seriesDays = S.length;
  m.endReason = r.endReason; m.days = r.days; m.won = !!r.won;
  m.maxWave = r.maxWave; m.standing = r.standing; m.scaleRank = r.scaleRank;
  m.waveKills = r.waveKills;
  m.deaths = (r.deaths || []).length; m.villagerCombatDeaths = r.villagerCombatDeaths | 0;
  m.capSummary = r.capSummary || null;
  m.instrumentErrors = (r.instrumentErrors || []).length;
  return m;
}

function missingBars(lastSnap) {
  if (!lastSnap || !lastSnap.seatDetail) return ['no-seat-detail'];
  const d = lastSnap.seatDetail;
  const miss = [];
  if ((d.w1 | 0) < 4) miss.push('w1(' + (d.w1 | 0) + '/4)');
  if ((d.w2 | 0) < 4) miss.push('w2(' + (d.w2 | 0) + '/4)');
  if ((d.w3 | 0) < 3) miss.push('w3(' + (d.w3 | 0) + '/3)');
  if ((d.contestsN | 0) < 2) miss.push('contests(' + (d.contestsN | 0) + '/2)');
  if ((d.crisesN | 0) < 2) miss.push('crises(' + (d.crisesN | 0) + '/2)');
  if (!['regional', 'national', 'global'].includes(d.rank)) miss.push('scale(' + d.rank + ')');
  if ((d.stage | 0) < 2) miss.push('stage(' + (d.stage | 0) + '/2)');
  if (!d.foodDeeds) miss.push('sentimentTaught');
  if ((d.ladderPeakStage | 0) < 1) miss.push('ladderPeak(' + (d.ladderPeakStage | 0) + '/1)');
  return miss.length ? miss : [];
}

// Prereg taxonomy. Returns one of: won-table / qualified-never-sat /
// never-qualified-<bars> / died-before-90 / survived-no-seat / UNCLASSIFIED.
function classify(r) {
  const S = r.series || [];
  const last = S.length ? S[S.length - 1] : null;
  if (r.won) return 'won-table';
  const seatDay = firstDay(S, function (s) { return s.seat !== 'none'; });
  if (seatDay != null) {
    if (!(r.seatTakes && r.seatTakes.length)) return 'qualified-never-sat';
    return 'UNCLASSIFIED'; // took the seat but did not win — needs a look
  }
  if (r.endReason === 'village-lost' && (r.days || 0) < 90) return 'died-before-90';
  if (r.endReason === 'survived') return 'survived-no-seat';
  if (r.endReason === 'village-lost') {
    const miss = missingBars(last);
    return 'never-qualified-' + (miss.length ? miss.join('+') : 'unknown');
  }
  return 'UNCLASSIFIED';
}

function median(xs) {
  const a = xs.filter(function (x) { return x != null; }).sort(function (x, y) { return x - y; });
  if (!a.length) return null;
  return a.length % 2 ? a[Math.floor(a.length / 2)] : (a[a.length / 2 - 1] + a[a.length / 2]) / 2;
}

function analyze(outDir) {
  const dir = outDir || OUTDIR;
  const files = fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort();
  const rows = files.map(function (f) { return JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); });
  const ms = rows.map(milestones);
  const classes = rows.map(function (r) { return { seed: r.seed, policy: r.policy, cls: classify(r) }; });
  const unclassified = classes.filter(function (c) { return c.cls === 'UNCLASSIFIED'; });
  const totalErrors = rows.reduce(function (t, r) { return t + (r.instrumentErrors || []).length; }, 0);

  // Paired divergence: median milestone day per policy + paired gap.
  const byPolicy = { competent: {}, capable: {} };
  const keys = ['regionalDay', 'nationalDay', 'arc2Day', 'arc3Day', 'arc4Day', 'w1Day', 'w2Day', 'w3Day', 'contDay', 'crisDay', 'stage2Day', 'sentDay', 'surgeDay', 'ladDay', 'w4KillDay', 'w5KillDay', 'unlock4Day', 'unlock5Day', 'firstSeatDay', 'previewReadyDay', 'seatTakenDay', 'winDay'];
  for (const k of keys) {
    byPolicy.competent[k] = median(ms.filter(function (m) { return m.policy === 'competent'; }).map(function (m) { return m[k]; }));
    byPolicy.capable[k] = median(ms.filter(function (m) { return m.policy === 'capable'; }).map(function (m) { return m[k]; }));
  }
  const neverCount = function (pol, k) { return ms.filter(function (m) { return m.policy === pol && m[k] == null; }).length; };

  // Reproduction check vs stage-2 AFTER corpus.
  const repro = [];
  if (fs.existsSync(REPRO_DIR)) {
    const rf = fs.readdirSync(REPRO_DIR).filter(function (f) { return f.endsWith('.json'); });
    const rmap = {};
    for (const f of rf) {
      try {
        const r = JSON.parse(fs.readFileSync(path.join(REPRO_DIR, f), 'utf8'));
        rmap[r.seed + ':' + r.policy] = r;
      } catch (e) { /* skip unreadable */ }
    }
    for (const r of rows) {
      const old = rmap[r.seed + ':' + r.policy];
      if (!old) { repro.push({ seed: r.seed, policy: r.policy, status: 'no-prior' }); continue; }
      const diffs = [];
      if (old.days !== r.days) diffs.push('days ' + old.days + '->' + r.days);
      if (old.endReason !== r.endReason) diffs.push('end ' + old.endReason + '->' + r.endReason);
      if (!!old.won !== !!r.won) diffs.push('won ' + !!old.won + '->' + !!r.won);
      if ((old.maxWave || 1) !== (r.maxWave || 1)) diffs.push('maxWave ' + old.maxWave + '->' + r.maxWave);
      if ((old.standing | 0) !== (r.standing | 0)) diffs.push('standing ' + old.standing + '->' + r.standing);
      const wkOld = old.waveKills || {}, wkNew = r.waveKills || {};
      const wkKeys = new Set(Object.keys(wkOld).concat(Object.keys(wkNew)));
      for (const k of wkKeys) if ((wkOld[k] | 0) !== (wkNew[k] | 0)) diffs.push('wk' + k + ' ' + (wkOld[k] | 0) + '->' + (wkNew[k] | 0));
      repro.push({ seed: r.seed, policy: r.policy, status: diffs.length ? 'DIFF' : 'match', diffs: diffs });
    }
  }

  return { files: files.length, rows: rows, milestones: ms, classes: classes, unclassified: unclassified, totalErrors: totalErrors, byPolicy: byPolicy, neverCount: neverCount, repro: repro, keys: keys };
}

function print(a) {
  const L = [];
  L.push('# sim-capablewinpath-b — analyzer output');
  L.push('');
  L.push('Configs: ' + a.files + ' (expect 32). Instrument errors total: ' + a.totalErrors + '. UNCLASSIFIED: ' + a.unclassified.length + (a.unclassified.length ? ' — ' + JSON.stringify(a.unclassified) : ''));
  L.push('');
  L.push('## Classification (per seed)');
  L.push('| seed | policy | class | days | end | won | seatDay | path |');
  for (let i = 0; i < a.rows.length; i++) {
    const r = a.rows[i], m = a.milestones[i], c = a.classes[i];
    L.push('| ' + r.seed + ' | ' + r.policy + ' | ' + c.cls + ' | ' + r.days + ' | ' + r.endReason + ' | ' + (!!r.won) + ' | ' + (m.firstSeatDay == null ? '—' : m.firstSeatDay) + ' | ' + (m.path || '—') + ' |');
  }
  L.push('');
  L.push('## Milestone medians (days; never-count in parens)');
  L.push('| milestone | competent median | capable median | competent never | capable never |');
  for (const k of a.keys) {
    L.push('| ' + k + ' | ' + (a.byPolicy.competent[k] == null ? '—' : a.byPolicy.competent[k]) + ' | ' + (a.byPolicy.capable[k] == null ? '—' : a.byPolicy.capable[k]) + ' | ' + a.neverCount('competent', k) + '/16 | ' + a.neverCount('capable', k) + '/16 |');
  }
  L.push('');
  L.push('## Per-seed milestone table (capable wins; competent contrast)');
  L.push('| seed | pol | seatDay | seat | previewReady | takenDay | path/branch | winDay | regional | national | sent | ladPeak | w3bar | cont | cris | stage2 | w4kill | w5kill | unlock4 | unlock5 | vet@seat | standing@seat (w/d/p) | villDeaths |');
  for (const m of a.milestones) {
    const st = m.standingAtSeat;
    L.push('| ' + m.seed + ' | ' + m.policy.slice(0, 4) + ' | ' + (m.firstSeatDay == null ? '—' : m.firstSeatDay) + ' | ' + m.seatKind + ' | ' + (m.previewReadyDay == null ? '—' : m.previewReadyDay) + ' | ' + (m.seatTakenDay == null ? '—' : m.seatTakenDay) + ' | ' + (m.path ? m.path + '/' + (m.branch || '?') : '—') + ' | ' + (m.winDay == null ? '—' : m.winDay) + ' | ' + (m.regionalDay == null ? '—' : m.regionalDay) + ' | ' + (m.nationalDay == null ? '—' : m.nationalDay) + ' | ' + (m.sentDay == null ? '—' : m.sentDay) + ' | ' + (m.ladDay == null ? '—' : m.ladDay) + ' | ' + (m.w3Day == null ? '—' : m.w3Day) + ' | ' + (m.contDay == null ? '—' : m.contDay) + ' | ' + (m.crisDay == null ? '—' : m.crisDay) + ' | ' + (m.stage2Day == null ? '—' : m.stage2Day) + ' | ' + (m.w4KillDay == null ? '—' : m.w4KillDay) + ' | ' + (m.w5KillDay == null ? '—' : m.w5KillDay) + ' | ' + (m.unlock4Day == null ? '—' : m.unlock4Day) + ' | ' + (m.unlock5Day == null ? '—' : m.unlock5Day) + ' | ' + (m.vetAtSeat ? m.vetAtSeat.vet4 + '/' + m.vetAtSeat.vet5 : '—') + ' | ' + (st ? st.total + ' (' + st.war + '/' + st.dip + '/' + st.plenty + ')' : '—') + ' | ' + m.villagerCombatDeaths + ' |');
  }
  L.push('');
  L.push('## Binding bars (last lesser-seat bar to complete)');
  for (const m of a.milestones) {
    L.push('- ' + m.seed + ' ' + m.policy + ': binding=' + m.bindingBar + (m.bindingDay == null ? ' (never)' : ' day ' + m.bindingDay) + '; neverBars=[' + m.neverBars.join(',') + ']');
  }
  L.push('');
  L.push('## Capable layer counters on winning seeds (capSummary)');
  for (const m of a.milestones) {
    if (m.policy !== 'capable' || !m.won || !m.capSummary) continue;
    const c = m.capSummary;
    L.push('- ' + m.seed + ': seatTaken=' + c.capSeatTaken + ' tableAnswers=' + c.capTableAnswers + ' huntSorties=' + c.capHuntSorties + ' huntWaveFights=' + c.capHuntWaveFights + ' huntFeastFights=' + c.capHuntFeastFights + ' offersChosen=' + c.capOffersChosen + ' abilityUses=' + c.capAbilityUses + ' sigUses=' + c.capSigUses + ' fleeExits=' + c.capFleeExits + ' convosHeld=' + c.capConvosHeld + ' relayClaimed=' + c.capRelayClaimed + ' relayAppointed=' + c.capRelayAppointed + ' keepsakes=' + c.capKeepsakesWorn);
  }
  L.push('');
  L.push('## Reproduction check vs stage-2 AFTER corpus');
  const diffs = a.repro.filter(function (r) { return r.status === 'DIFF'; });
  const matches = a.repro.filter(function (r) { return r.status === 'match'; });
  const noprior = a.repro.filter(function (r) { return r.status === 'no-prior'; });
  L.push('match ' + matches.length + ' / diff ' + diffs.length + ' / no-prior ' + noprior.length + (a.repro.length ? '' : ' (no stage-2 corpus found)'));
  for (const r of diffs) L.push('- ' + r.seed + ' ' + r.policy + ': ' + r.diffs.join('; '));
  L.push('');
  return L.join('\n');
}

if (require.main === module) {
  const a = analyze();
  console.log(print(a));
  const outPath = path.join(REPO, 'evidence', '2026-11-14', 'capablewinpath-b-analysis.json');
  fs.writeFileSync(outPath, JSON.stringify({ files: a.files, totalErrors: a.totalErrors, unclassified: a.unclassified, classes: a.classes, milestones: a.milestones, byPolicy: a.byPolicy, repro: a.repro }, null, 2) + '\n');
  console.log('wrote ' + path.relative(REPO, outPath));
}

module.exports = { classify: classify, milestones: milestones, analyze: analyze, missingBars: missingBars };
