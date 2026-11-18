// analyze-triodrought-b.js — analyzer + judge, arm sim-triodrought-b.
// Reads per-seed JSONs (the triodrought driver recorder) from two dirs and
// judges the frozen prereg: trio-launch rate among wave-4+ launches.
// Join (the mechanism check): each v4departs launch (day, vid) is joined
// to its dawnbidDeparts row (same day+vid, result launch) for the commit
// part, then to the dawnbidScores row (same day+vid+part) for the
// party_launch candidate's companion2 — so the analyzer reports, per
// launch, whether the candidate carried a second companion and whether
// the depart carried it (carry rate). A launch whose score row is absent
// (e.g. scored at a part the recorder did not log) is UNJOINED, never
// counted as either carried or dropped.
// Usage:
//   node scripts/analyze-triodrought-b.js --ctl evidence/2026-11-18/perseed-triodrought-b-ctl --arm evidence/2026-11-18/perseed-triodrought-b-arm [--out evidence/2026-11-18/triodrought-b-analysis.json]
//   node scripts/analyze-triodrought-b.js --selftest
'use strict';
const path = require('path');
const fs = require('fs');

function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort(function (a, b) { return a - b; });
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function isStarvation(d) {
  return /starvat/i.test(String((d && d.kind) || '')) || /starvat/i.test(String((d && d.cause) || ''));
}
function secondPickUB(poolRow) {
  // Upper bound on the winPlanSecondCompanion pool at a dawn snapshot:
  // first-pick eligibles + members failing ONLY the ranger check, minus
  // the ranked first pick. Sick / range<1 are unrecorded, so this is an
  // UPPER bound, never the exact pool.
  const elig = new Set(poolRow.eligible || []);
  const members = poolRow.members || [];
  for (const m of members) if (m && m.firstFail === 'notRanger') elig.add(m.id);
  elig.delete(poolRow.rankedPick);
  return elig.size;
}
function legStats(dir) {
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort() : [];
  const st = { dir: dir, n: 0, valid: 0, errors: 0, launches: 0, trioLaunches: 0,
    sizes: {}, sources: {}, c2depart: 0, candC2: 0, candC2dropped: 0, candC2carried: 0,
    candC2null: 0, unjoined: 0, midday: 0, dawn: 0, poolRows: 0, poolUB: {},
    starvation: 0, starvationVillager: 0, days: [], partyTrios: 0, brainSha: {}, carryPresent: {} };
  const launches = []; // {seed, day, vid, partySize, c2, candC2, joined, commitPart}
  for (const f of files) {
    let d;
    try { d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch (e) { st.errors++; continue; }
    st.n++;
    if (!d || typeof d !== 'object') { st.errors++; continue; }
    st.valid++;
    st.errors += ((d.instrumentErrors || []).length);
    if (d.brainSha) st.brainSha[d.brainSha] = (st.brainSha[d.brainSha] || 0) + 1;
    if (d.carryPresent != null) st.carryPresent[String(d.carryPresent)] = (st.carryPresent[String(d.carryPresent)] || 0) + 1;
    st.partyTrios += ((d.winPlanStats || {}).partyTrios || 0);
    st.days.push(d.days != null ? d.days : (d.gameDays != null ? d.gameDays : 0));
    for (const death of (d.deaths || [])) {
      if (isStarvation(death)) { st.starvation++; if (!death.player) st.starvationVillager++; }
    }
    // Score-row index: (day|vid|part) -> party_launch candidate c2 (first match).
    const scoreIdx = {};
    for (const row of (d.dawnbidScores || [])) {
      const cands = row.cands || [];
      for (const c of cands) {
        if (c && c.winPlanAction === 'party_launch') {
          const k = row.day + '|' + row.vid + '|' + (row.part != null ? row.part : 0);
          if (!(k in scoreIdx)) scoreIdx[k] = (c.companion2 != null ? c.companion2 : null);
          break;
        }
      }
    }
    // Depart-commit index: (day|vid) -> commit part (first launch row).
    const departIdx = {};
    for (const r of (d.dawnbidDeparts || [])) {
      if (r.result !== 'launch') continue;
      const k = r.day + '|' + r.vid;
      if (!(k in departIdx)) departIdx[k] = { part: (r.commitPart != null ? r.commitPart : 0), kind: r.commitKind || null };
    }
    for (const r of (d.v4departs || [])) {
      if (r.result !== 'launch' || (r.targetWave | 0) < 4) continue;
      st.launches++;
      const size = r.partySize != null ? r.partySize : ((r.party || []).length + 1);
      st.sizes[size] = (st.sizes[size] || 0) + 1;
      st.sources[r.source || '?'] = (st.sources[r.source || '?'] || 0) + 1;
      if (size >= 3) st.trioLaunches++;
      if (r.companion2) st.c2depart++;
      const dep = departIdx[r.day + '|' + r.vid];
      const rec = { seed: d.seed, day: r.day, vid: r.vid, partySize: size, c2: r.companion2 || null,
        candC2: null, joined: false, commitPart: dep ? dep.part : null, commitKind: dep ? dep.kind : null };
      if (dep) {
        if (/mid-day/.test(String(dep.kind || ''))) st.midday++; else st.dawn++;
        const k = r.day + '|' + r.vid + '|' + dep.part;
        if (k in scoreIdx) {
          rec.joined = true;
          rec.candC2 = scoreIdx[k];
          if (rec.candC2) {
            st.candC2++;
            if (r.companion2) st.candC2carried++; else st.candC2dropped++;
          } else st.candC2null++;
        } else st.unjoined++;
      } else st.unjoined++;
      launches.push(rec);
    }
    for (const p of (d.companionPool || [])) {
      st.poolRows++;
      const ub = secondPickUB(p);
      st.poolUB[ub] = (st.poolUB[ub] || 0) + 1;
    }
  }
  st.trioRate = st.launches ? st.trioLaunches / st.launches : null;
  st.carryRate = st.candC2 ? st.candC2carried / st.candC2 : null;
  st.medianDays = median(st.days);
  st.launchesDetail = launches;
  return st;
}
function judge(ctl, arm) {
  const bars = [];
  const poolOk = ctl.launches >= 6 && arm.launches >= 6;
  bars.push({ id: 'pool-floor', pass: poolOk, detail: 'launches ctl ' + ctl.launches + ' / arm ' + arm.launches + ' (floor 6/leg)' });
  const trioPass = arm.trioRate != null && arm.trioRate >= 0.50 &&
    ctl.trioRate != null && (arm.trioRate - ctl.trioRate) >= 0.30;
  bars.push({ id: 'trio-rate', pass: trioPass,
    detail: 'arm ' + (arm.trioRate == null ? 'n/a' : arm.trioRate.toFixed(2)) + ' vs ctl ' + (ctl.trioRate == null ? 'n/a' : ctl.trioRate.toFixed(2)) + ' (bar arm>=0.50, diff>=+0.30)' });
  const starvPass = arm.starvation <= ctl.starvation + 2 && arm.starvationVillager <= ctl.starvationVillager + 2;
  bars.push({ id: 'cost-starvation', pass: starvPass,
    detail: 'starvation totals arm ' + arm.starvation + ' vs ctl ' + ctl.starvation + '; villager arm ' + arm.starvationVillager + ' vs ctl ' + ctl.starvationVillager + ' (bar arm<=ctl+2 both)' });
  const medPass = ctl.medianDays == null || arm.medianDays == null || arm.medianDays >= 0.8 * ctl.medianDays;
  bars.push({ id: 'cost-median', pass: medPass,
    detail: 'median survival arm ' + arm.medianDays + 'd vs ctl ' + ctl.medianDays + 'd (bar arm>=0.8x ctl)' });
  let verdict = 'NO-GO';
  let kind = '';
  if (!poolOk) { verdict = 'NO-GO'; kind = 'METRIC-BROKEN'; }
  else if (bars.every(function (b) { return b.pass; })) { verdict = 'GO'; kind = ''; }
  return { verdict: verdict, kind: kind, bars: bars };
}
function summarize(st) {
  const o = {};
  for (const k of ['dir', 'n', 'valid', 'errors', 'launches', 'trioLaunches', 'trioRate', 'sizes', 'sources',
    'c2depart', 'candC2', 'candC2carried', 'candC2dropped', 'candC2null', 'unjoined', 'midday', 'dawn',
    'carryRate', 'poolRows', 'poolUB', 'starvation', 'starvationVillager', 'medianDays', 'partyTrios',
    'brainSha', 'carryPresent']) o[k] = st[k];
  return o;
}
function selftest() {
  let passed = 0, failed = 0;
  function check(name, cond, extra) {
    if (cond) passed++;
    else { failed++; console.log('FAIL: ' + name + (extra ? ' — ' + extra : '')); }
  }
  // Trio-rate math.
  check('trio rate 5/8', Math.abs((function () { const s = { launches: 8, trioLaunches: 5 }; return s.trioLaunches / s.launches; })() - 0.625) < 1e-9);
  // secondPickUB: eligibles + notRanger-only, minus the ranked pick.
  const pool = { eligible: ['a', 'e'], rankedPick: 'a',
    members: [
      { id: 'a', firstFail: 'eligible' },
      { id: 'b', firstFail: 'notRanger' },
      { id: 'c', firstFail: 'notRanger' },
      { id: 'd', firstFail: 'away' },
      { id: 'e', firstFail: 'eligible' },
    ] };
  check('second-pick UB counts eligible+notRanger minus ranked pick', secondPickUB(pool) === 3, 'got ' + secondPickUB(pool));
  check('second-pick UB is 0 when only the ranked pick is eligible',
    secondPickUB({ eligible: ['a'], rankedPick: 'a', members: [{ id: 'a', firstFail: 'eligible' }] }) === 0);
  // Judge shapes.
  function mk(o) { return Object.assign({ launches: 8, trioRate: 0, starvation: 0, starvationVillager: 0, medianDays: 150 }, o); }
  let j = judge(mk({ trioRate: 0 }), mk({ trioRate: 0.625 }));
  check('judge GO shape passes', j.verdict === 'GO' && j.bars.every(function (b) { return b.pass; }), JSON.stringify(j));
  j = judge(mk({ trioRate: 0 }), mk({ trioRate: 0.5, starvation: 3 }));
  check('judge NO-GO when the cost bar breaches', j.verdict === 'NO-GO' && !j.bars[2].pass, JSON.stringify(j.bars));
  j = judge(mk({ launches: 3, trioRate: 0 }), mk({ launches: 8, trioRate: 1 }));
  check('judge METRIC-BROKEN below the pool floor', j.verdict === 'NO-GO' && j.kind === 'METRIC-BROKEN', JSON.stringify(j));
  j = judge(mk({ trioRate: 0.25 }), mk({ trioRate: 0.5 }));
  check('judge NO-GO when the gap is under +30pp', j.verdict === 'NO-GO' && !j.bars[1].pass, JSON.stringify(j.bars[1]));
  // Join logic on a synthetic corpus dir.
  const os = require('os');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'td-analyze-'));
  const dir = path.join(tmp, 'leg');
  fs.mkdirSync(dir);
  const seed = {
    seed: 1, days: 150, instrumentErrors: [], brainSha: 'abc', carryPresent: true,
    winPlanStats: { partyTrios: 0 },
    deaths: [{ day: 5, kind: 'starvation', cause: 'hunger', player: false }],
    v4departs: [
      { day: 10, vid: 'h1', result: 'launch', source: 'brain', targetWave: 4, partySize: 3, companion2: 'c2', party: ['c1', 'c2'] },
      { day: 12, vid: 'h1', result: 'launch', source: 'brain', targetWave: 4, partySize: 2, companion2: null, party: ['c1'] },
      { day: 14, vid: 'h2', result: 'launch', source: 'brain', targetWave: 3, partySize: 2, companion2: null, party: ['c1'] },
    ],
    dawnbidDeparts: [
      { day: 10, vid: 'h1', result: 'launch', commitPart: 0, commitKind: 'dawn' },
      { day: 12, vid: 'h1', result: 'launch', commitPart: 1, commitKind: 'mid-day part-1' },
    ],
    dawnbidScores: [
      { day: 10, vid: 'h1', part: 0, cands: [{ winPlanAction: 'party_launch', companion: 'c1', companion2: 'c2' }] },
      { day: 12, vid: 'h1', part: 1, cands: [{ winPlanAction: 'party_launch', companion: 'c1', companion2: 'c9' }] },
    ],
    companionPool: [{ eligible: ['c1'], rankedPick: 'c1', members: [{ id: 'c1', firstFail: 'eligible' }, { id: 'c9', firstFail: 'notRanger' }] }],
  };
  fs.writeFileSync(path.join(dir, 's1.json'), JSON.stringify(seed));
  const st = legStats(dir);
  check('join counts wave-4 launches only', st.launches === 2, 'got ' + st.launches);
  check('join trio rate 1/2', st.trioLaunches === 1 && Math.abs(st.trioRate - 0.5) < 1e-9);
  check('join carry: 1 carried, 1 dropped', st.candC2 === 2 && st.candC2carried === 1 && st.candC2dropped === 1, JSON.stringify({ c: st.candC2, ok: st.candC2carried, drop: st.candC2dropped }));
  check('join mid-day vs dawn split', st.midday === 1 && st.dawn === 1, JSON.stringify({ mid: st.midday, dawn: st.dawn }));
  check('join starvation counted once, villager', st.starvation === 1 && st.starvationVillager === 1);
  check('join pool UB counted', st.poolUB[1] === 1, JSON.stringify(st.poolUB));
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
  console.log('analyze-triodrought-b --selftest: ' + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.indexOf('--selftest') !== -1) selftest();
  let ctlDir = null, armDir = null, outFile = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--ctl') ctlDir = args[++i];
    else if (args[i] === '--arm') armDir = args[++i];
    else if (args[i] === '--out') outFile = args[++i];
  }
  if (!ctlDir || !armDir) { console.error('usage: analyze-triodrought-b.js --ctl DIR --arm DIR [--out FILE] | --selftest'); process.exit(2); }
  const ctl = legStats(ctlDir);
  const arm = legStats(armDir);
  const j = judge(ctl, arm);
  const result = { verdict: j.verdict, kind: j.kind, bars: j.bars, ctl: summarize(ctl), arm: summarize(arm),
    ctlLaunches: ctl.launchesDetail, armLaunches: arm.launchesDetail };
  console.log(JSON.stringify({ verdict: j.verdict, kind: j.kind, bars: j.bars, ctl: summarize(ctl), arm: summarize(arm) }, null, 2));
  if (outFile) fs.writeFileSync(outFile, JSON.stringify(result, null, 2) + '\n');
}
module.exports = { legStats: legStats, judge: judge, secondPickUB: secondPickUB, median: median };
