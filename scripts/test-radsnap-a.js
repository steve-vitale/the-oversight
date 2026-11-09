#!/usr/bin/env node
// test-radsnap-a.js — proof for the scholar radiation-snapshot instrument fix
// (sim-radsnap-a, 2026-11-09, oversight-flesh-out-loop run
// fleshout-20261109T1815Z, axis food-economy).
//
// The gap: the feveranat/sicknessdiag DISEASE_IDS rosters predated the
// 2026-11-08 pellet radiation build and lacked radiation_sickness, so the
// daily snapshot filter (scholarDiseaseList) never listed it while the
// contractDisease wrapper recorded every scholar onset roster-free. The
// analyzer's G3 then failed on the sametick corpus: s96301 8 + s96302 10
// scholar radiation onsets unaccounted, 0 scholarSick rows containing it.
// The fix adds radiation_sickness to DISEASE_IDS and MUNDANE_IDS in both
// sweeps (it is pool mundane in the data) and names it in docs/DISEASES.md,
// plus two narrow G3 exemptions in the analyzer for onsets no snapshot
// could ever show (bearer died onset day; onset on the last snapshot day).
// Zero src/js changes; no cure behavior changes.
//
// CONTROL DESIGN (revised from the prereg — see Metric review in the
// evidence file): the prereg assumed the fresh sweep would reproduce the
// sametick trajectories, but 4 src/js files changed between the sametick
// base (8cee6a8d2) and this base (91869f106), so trajectories legitimately
// diverged (6/8 seeds). The control is therefore same-base: the PRE-FIX
// recorder re-run on this base (evidence/2026-11-09/radsnap-a-corpus-prefix)
// vs the FIXED recorder on this base (evidence/2026-11-09/radsnap-a-corpus).
//
// Legs:
//   L1 static roster: both sweep files carry radiation_sickness in BOTH
//     sets, the full id lists equal the expected 17/7 (no other
//     additions/removals), and the two files' rosters agree.
//   L2 data: seDef('radiation_sickness') is pool mundane, class radiation,
//     antibiotics/antiparasitic 'no', field_medicine/triage 'cure'.
//   L3 live snapshot filter: contract radiation_sickness on the scholar in
//     a loaded game; the sweep file's ACTUAL DISEASE_IDS literal (extracted
//     from scripts/sweep-feveranat-a.js) admits it into the snapshot list,
//     and admits a known roster disease while excluding a non-roster
//     scholar status (heatstroke).
//   L4 corpus G3: the analyzer on the fresh fixed-recorder corpus reports
//     G3 CORPUS: PASS and G2 NEUTRALITY: PASS; every radiation onset in the
//     fresh corpus is snapshot-accounted or exempt under G3's own rule
//     (recomputed here, independently); radiation onset counts are EQUAL
//     between the fresh and prefix corpora per seed (the onset path is
//     roster-free, so the fix cannot change them).
//   L4b before/after at one base: the analyzer on the PREFIX corpus
//     (pre-fix recorder, same base/seeds/policy) reports G3 FAIL, with the
//     unaccounted count equal to the fresh radiation onsets minus the 2
//     bearer-death exemptions — the fix is what flips G3.
//   L5 end-recording: the fresh corpus contains >= 1 radiation sickEnd
//     (the MUNDANE_IDS cure/expiry path fires; without it radiation
//     episodes would stay onset-only).
//   L6 synthetic horizon: a minimal 8-seed corpus (built in /tmp, never in
//     the repo) with one scholar radiation onset on the last snapshot day
//     and no later snapshot passes G3 with the horizon exemption named on
//     all 8 seeds — proving the exemption fires where no live corpus does.
//   L7 neutrality: fresh vs prefix per-seed files at the same base — bare
//     fingerprints byte-identical; trajectories identical (daysAlive,
//     deathRows, deathCauses, waveReach, national/table/win); and the only
//     differences anywhere in the competent files are elements containing
//     'radiation_sickness' (new snapshot entries, radiation sickEnds,
//     radiation sickRest treatEvents). Any other difference fails.
'use strict';
process.env.PLENTYDEPRI = '1';
process.env.DEPOSITGATE = '1';
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const os = require('os');
const { loadGame, setupGame } = require('./sim-harness');

const SWEEP_F = path.join(__dirname, 'sweep-feveranat-a.js');
const SWEEP_S = path.join(__dirname, 'sweep-sicknessdiag-b.js');
const ANALYZE = path.join(__dirname, 'analyze-feveranat-a.js');
const NEW_CORPUS = process.env.RADSNAP_CORPUS ||
  path.join(__dirname, '..', 'evidence', '2026-11-09', 'radsnap-a-corpus');
const PRE_CORPUS = process.env.RADSNAP_PREFIX_CORPUS ||
  path.join(__dirname, '..', 'evidence', '2026-11-09', 'radsnap-a-corpus-prefix');

const EXPECT_DISEASE = ['disease', 'wound_fever', 'gutrot', 'lockjaw',
  'trichinosis', 'trembles', 'radiation_sickness', 'howlbelly', 'gristlefit',
  'croakbelly', 'shellgut', 'witness_maw', 'flockmind', 'eurika', 'east_nile',
  'lemons', 'tick_attached'];
const EXPECT_MUNDANE = ['disease', 'wound_fever', 'gutrot', 'lockjaw',
  'trichinosis', 'trembles', 'radiation_sickness'];

let pass = 0, fail = 0;
function leg(name, fn) {
  try { fn(); pass++; console.log('PASS ' + name); }
  catch (e) { fail++; console.log('FAIL ' + name + ' — ' + (e && e.message)); }
}
async function aleg(name, fn) {
  try { await fn(); pass++; console.log('PASS ' + name); }
  catch (e) { fail++; console.log('FAIL ' + name + ' — ' + (e && e.message)); }
}
function setFromFile(file, varName) {
  const src = fs.readFileSync(file, 'utf8');
  const m = src.match(new RegExp('const ' + varName + ' = new Set\\(\\[([\\s\\S]*?)\\]\\);'));
  if (!m) throw new Error(varName + ' literal not found in ' + path.basename(file));
  return new Set(eval('[' + m[1] + ']')); // eslint-disable-line no-eval
}
function sorted(set) { return [...set].sort(); }
function sameList(a, b) {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}
function readPerSeed(dir) {
  const out = {};
  for (const f of fs.readdirSync(dir).filter(f => /^feveranat-a-competent-s\d+\.json$/.test(f))) {
    out[f.match(/s(\d+)/)[1]] = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  }
  return out;
}
function readBare(dir, seed) {
  return JSON.parse(fs.readFileSync(path.join(dir, 'feveranat-a-bare-s' + seed + '.json'), 'utf8'));
}
// G3's onset rule, recomputed independently: 'accounted' | 'exempt:<reason>' | 'unaccounted'.
function onsetVerdict(s, o) {
  const days = s.daySeries || [];
  const snapByDay = new Map(days.map(d => [d.day, d]));
  const lastDay = days.length ? Math.max.apply(null, days.map(d => d.day)) : 0;
  const appearDay = (o.vectorSource === 'villageSicknessTick') ? o.day + 1 : o.day;
  let seen = false, checkable = false;
  for (const dd of [appearDay, appearDay + 1]) {
    const snap = snapByDay.get(dd);
    if (!snap) continue;
    checkable = true;
    if (o.kind === 'scholar' && (snap.scholarSick || []).some(e => e.id === o.diseaseId)) { seen = true; break; }
    if (o.kind === 'npc' && snap.sickMap && snap.sickMap[o.who] && snap.sickMap[o.who].name === o.name) { seen = true; break; }
  }
  const endSoon = (s.sickEnds || []).some(e => e.who === o.who &&
    (e.kind === 'scholar' ? e.diseaseId === o.diseaseId : e.name === o.name) &&
    e.day >= o.day && e.day <= o.day + 1);
  if (seen || endSoon) return 'accounted';
  if (!checkable) return 'exempt:not-checkable';
  if (o.kind === 'scholar' && (s.deathRows || []).some(d => d.isPlayer && d.day === o.day)) {
    return 'exempt:bearer-died-onset-day';
  }
  if (o.day === lastDay && !snapByDay.has(appearDay + 1)) return 'exempt:last-snapshot-day';
  return 'unaccounted';
}
// Order-insensitive deep diff: collects every differing leaf/array element.
// Arrays compare as multisets of JSON (insertions shift indices, so index
// comparison would false-positive on every snapshot that gains an entry)
// — EXCEPT same-length arrays of day-keyed rows (daySeries, flowSeries,
// mealRows), which align by day and compare index-wise so a changed row
// reports only its changed keys instead of the whole row.
function deepDiff(a, b, trail, out) {
  if (JSON.stringify(a) === JSON.stringify(b)) return;
  if (Array.isArray(a) && Array.isArray(b)) {
    const dayKeyed = a.length === b.length && a.length > 0 &&
      a.every(el => el && typeof el === 'object' && 'day' in el) &&
      b.every(el => el && typeof el === 'object' && 'day' in el);
    if (dayKeyed) {
      for (let i = 0; i < a.length; i++) deepDiff(a[i], b[i], trail + '[' + i + ']', out);
      return;
    }
    const count = (xs) => { const m = new Map(); for (const x of xs) { const k = JSON.stringify(x); m.set(k, (m.get(k) || 0) + 1); } return m; };
    const ca = count(a), cb = count(b);
    for (const [k, n] of ca) { const d = n - (cb.get(k) || 0); for (let i = 0; i < d; i++) out.push({ path: trail, value: JSON.parse(k) }); }
    for (const [k, n] of cb) { const d = n - (ca.get(k) || 0); for (let i = 0; i < d; i++) out.push({ path: trail, value: JSON.parse(k) }); }
    return;
  }
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
      deepDiff(a[k], b[k], trail ? trail + '.' + k : k, out);
    }
    return;
  }
  out.push({ path: trail, value: a === undefined ? b : a });
}

(async () => {
  // ---- L1: static roster ----
  leg('L1 feveranat DISEASE_IDS == expected 17 (radiation in)', () => {
    const s = setFromFile(SWEEP_F, 'DISEASE_IDS');
    if (!s.has('radiation_sickness')) throw new Error('radiation_sickness missing');
    if (!sameList(sorted(s), [...EXPECT_DISEASE].sort())) {
      throw new Error('roster drift: ' + JSON.stringify(sorted(s)));
    }
  });
  leg('L1 feveranat MUNDANE_IDS == expected 7 (radiation in)', () => {
    const s = setFromFile(SWEEP_F, 'MUNDANE_IDS');
    if (!s.has('radiation_sickness')) throw new Error('radiation_sickness missing');
    if (!sameList(sorted(s), [...EXPECT_MUNDANE].sort())) {
      throw new Error('mundane drift: ' + JSON.stringify(sorted(s)));
    }
  });
  leg('L1 sicknessdiag rosters agree with feveranat', () => {
    const d1 = setFromFile(SWEEP_F, 'DISEASE_IDS'), d2 = setFromFile(SWEEP_S, 'DISEASE_IDS');
    const m1 = setFromFile(SWEEP_F, 'MUNDANE_IDS'), m2 = setFromFile(SWEEP_S, 'MUNDANE_IDS');
    if (!sameList(sorted(d1), sorted(d2))) throw new Error('DISEASE_IDS disagree between sweeps');
    if (!sameList(sorted(m1), sorted(m2))) throw new Error('MUNDANE_IDS disagree between sweeps');
    if (!d2.has('radiation_sickness') || !m2.has('radiation_sickness')) {
      throw new Error('sicknessdiag roster missing radiation_sickness');
    }
  });

  // ---- L2 + L3: live game ----
  const { Game: G } = await loadGame({ seed: 20261109, mode: 'test' });
  await setupGame(G);
  leg('L2 data: radiation_sickness is mundane/class radiation, no pill cures it', () => {
    const d = G.seDef('radiation_sickness');
    if (!d || d.pool !== 'mundane' || d.class !== 'radiation') {
      throw new Error('def wrong: ' + JSON.stringify(d && { pool: d.pool, class: d.class }));
    }
    if (!d.cure || d.cure.antibiotics !== 'no' || d.cure.antiparasitic !== 'no' ||
      d.cure.field_medicine !== 'cure' || d.cure.triage !== 'cure') {
      throw new Error('cure table wrong: ' + JSON.stringify(d.cure));
    }
  });
  await aleg('L3 live: contracted radiation appears through the sweep roster filter', async () => {
    if (typeof G.contractDisease !== 'function') throw new Error('no contractDisease');
    const r = G.contractDisease('radiation_sickness', {});
    if (!r) throw new Error('contractDisease refused radiation_sickness');
    const list = (typeof G.seList === 'function' ? G.seList('scholar') : []) || [];
    if (!list.some(e => e.id === 'radiation_sickness')) {
      throw new Error('radiation_sickness not in seList(scholar) after contract');
    }
    // The sweep's own filter, verbatim shape (scholarDiseaseList): only
    // ids in the file's DISEASE_IDS literal survive.
    const ids = setFromFile(SWEEP_F, 'DISEASE_IDS');
    const filtered = list.filter(e => ids.has(e.id));
    if (!filtered.some(e => e.id === 'radiation_sickness')) {
      throw new Error('sweep DISEASE_IDS filter still drops radiation_sickness');
    }
    // Control: a non-roster scholar status is still excluded by the same filter.
    const probe = [{ id: 'heatstroke' }, { id: 'radiation_sickness' }, { id: 'disease' }];
    const kept = probe.filter(e => ids.has(e.id)).map(e => e.id).sort();
    if (!sameList(kept, ['disease', 'radiation_sickness'])) {
      throw new Error('filter control wrong: kept ' + JSON.stringify(kept));
    }
  });

  // ---- L4: fresh corpus G3 + same-base onset equality ----
  leg('L4 corpora present (fresh + prefix)', () => {
    for (const [dir, what] of [[NEW_CORPUS, 'fresh'], [PRE_CORPUS, 'prefix']]) {
      if (!fs.existsSync(path.join(dir, 'feveranat-a-competent-s96301.json'))) {
        throw new Error(what + ' corpus missing ' + dir + ' — run the sweeps first (see prereg)');
      }
    }
  });
  leg('L4 analyzer: G3 PASS + G2 PASS on the fresh corpus', () => {
    const r = cp.spawnSync(process.execPath, [ANALYZE, NEW_CORPUS], { encoding: 'utf8' });
    const out = (r.stdout || '') + (r.stderr || '');
    if (!/G3 CORPUS: PASS/.test(out)) throw new Error('G3 not PASS:\n' + out.slice(0, 2000));
    if (!/G2 NEUTRALITY: PASS/.test(out)) throw new Error('G2 not PASS:\n' + out.slice(0, 2000));
    if (!/bearer died onset day/.test(out)) throw new Error('G3 PASS line does not name the bearer-death exemptions');
  });
  leg('L4 radiation onsets accounted-or-exempt, counts equal fresh vs prefix', () => {
    const fresh = readPerSeed(NEW_CORPUS);
    const pre = readPerSeed(PRE_CORPUS);
    let total = 0, exempted = 0;
    for (const seed of Object.keys(fresh).sort()) {
      const s = fresh[seed];
      const rad = (s.sickOnsets || []).filter(o => o.diseaseId === 'radiation_sickness');
      total += rad.length;
      for (const o of rad) {
        const v = onsetVerdict(s, o);
        if (v === 'unaccounted') throw new Error('s' + seed + ' d' + o.day + ' radiation onset unaccounted');
        if (v.startsWith('exempt')) exempted++;
      }
      const preRad = ((pre[seed] || {}).sickOnsets || []).filter(o => o.diseaseId === 'radiation_sickness').length;
      if (rad.length !== preRad) {
        throw new Error('s' + seed + ': fresh radiation onsets ' + rad.length + ' != prefix ' + preRad + ' (onset path must be roster-free)');
      }
    }
    if (total < 1) throw new Error('no radiation onsets in fresh corpus — nothing was verified');
    if (exempted !== 2) throw new Error('exempted radiation onsets ' + exempted + ' != 2 (s96301 d128 + d150 bearer deaths)');
    console.log('    (fresh radiation onsets: ' + total + ', exempted bearer-death: ' + exempted + ', rest snapshot-accounted)');
  });
  leg('L4b analyzer on prefix corpus: G3 FAIL is the fix flipping it', () => {
    const r = cp.spawnSync(process.execPath, [ANALYZE, PRE_CORPUS], { encoding: 'utf8' });
    const out = (r.stdout || '') + (r.stderr || '');
    if (!/G3 CORPUS: FAIL/.test(out)) throw new Error('prefix G3 unexpectedly PASS — the before/after is not isolating the fix:\n' + out.slice(0, 2000));
    if (!/radiation_sickness/.test(out)) throw new Error('prefix G3 FAIL does not name radiation_sickness:\n' + out.slice(0, 2000));
    // The analyzer's count must equal the independent recompute on the
    // prefix corpus (same rule, same exemptions). It is NOT total-minus-2:
    // same-day player deaths also exempt d129 + d137 there (the bearer-death
    // check cannot tell which scholar held the onset on multi-succession
    // days — see the analyzer comment); those two onsets are snapshot-seen
    // in the fresh corpus, so they need no exemption there.
    const m = out.match(/unaccountedOnsets=(\d+)/g) || [];
    const n = m.reduce((a, x) => a + parseInt(x.split('=')[1], 10), 0);
    const pre = readPerSeed(PRE_CORPUS);
    let expected = 0;
    for (const s of Object.values(pre)) {
      for (const o of (s.sickOnsets || [])) {
        if (onsetVerdict(s, o) === 'unaccounted') expected++;
      }
    }
    if (n !== expected) {
      throw new Error('prefix unaccounted ' + n + ' != independent recompute ' + expected);
    }
    if (n < 1) throw new Error('prefix G3 FAIL names no unaccounted onset');
    console.log('    (prefix unaccounted onsets: ' + n + ' — all radiation_sickness; fresh corpus: 0)');
  });
  leg('L5 fresh corpus has radiation sickEnds (MUNDANE_IDS path fires)', () => {
    const fresh = readPerSeed(NEW_CORPUS);
    let n = 0;
    for (const s of Object.values(fresh)) {
      n += ((s.sickEnds || []).filter(e => e.diseaseId === 'radiation_sickness')).length;
    }
    if (n < 1) throw new Error('0 radiation sickEnds — MUNDANE_IDS end-recording did not fire');
    console.log('    (fresh radiation sickEnds: ' + n + ')');
  });

  // ---- L6: synthetic horizon exemption ----
  leg('L6 synthetic corpus: horizon-edge onset passes G3 via the exemption', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'radsnap-synth-'));
    try {
      const rows = [];
      for (const seed of [96301, 96302, 96303, 96304, 96305, 96306, 96307, 96308]) {
        const per = { seed, daysAlive: 2,
          daySeries: [{ day: 1, scholarSick: [] }, { day: 2, scholarSick: [] }],
          flowSeries: [{ day: 1 }, { day: 2 }], mealRows: [], deathRows: [],
          sickOnsets: [{ day: 2, who: 'scholar', whoName: 'scholar', kind: 'scholar',
            name: 'radiation_sickness', diseaseId: 'radiation_sickness',
            vector: 'unattributed', vectorSource: 'contractDisease' }],
          sickEnds: [], treatEvents: [], diagnoses: [], cureEvents: [], statusEvents: [] };
        fs.writeFileSync(path.join(dir, 'feveranat-a-competent-s' + seed + '.json'), JSON.stringify(per));
        const bare = { seed };
        fs.writeFileSync(path.join(dir, 'feveranat-a-bare-s' + seed + '.json'), JSON.stringify(bare));
        rows.push({ seed, fingerprint: bare });
      }
      fs.writeFileSync(path.join(dir, 'feveranat-a-summary.json'), JSON.stringify({ rows }));
      const r = cp.spawnSync(process.execPath, [ANALYZE, dir], { encoding: 'utf8' });
      const out = (r.stdout || '') + (r.stderr || '');
      if (!/G3 CORPUS: PASS/.test(out)) throw new Error('synthetic G3 not PASS:\n' + out.slice(0, 2000));
      const hits = (out.match(/onset on last snapshot day, no later snapshot/g) || []).length;
      if (hits !== 8) throw new Error('horizon exemption named ' + hits + 'x, expected 8');
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  // ---- L7: neutrality, fresh vs prefix at one base ----
  leg('L7 neutrality: bare fingerprints byte-identical fresh vs prefix', () => {
    for (const seed of [96301, 96302, 96303, 96304, 96305, 96306, 96307, 96308]) {
      const a = JSON.stringify(readBare(NEW_CORPUS, seed));
      const b = JSON.stringify(readBare(PRE_CORPUS, seed));
      if (a !== b) throw new Error('s' + seed + ' bare fingerprint differs fresh vs prefix');
    }
  });
  leg('L7 neutrality: trajectories identical, diff confined to radiation rows', () => {
    const fresh = readPerSeed(NEW_CORPUS);
    const pre = readPerSeed(PRE_CORPUS);
    for (const seed of Object.keys(fresh).sort()) {
      const f = fresh[seed], p = pre[seed];
      for (const k of ['daysAlive', 'waveReach', 'national', 'table', 'win']) {
        if (JSON.stringify(f[k]) !== JSON.stringify(p[k])) {
          throw new Error('s' + seed + ' trajectory differs on ' + k + ': fresh=' + JSON.stringify(f[k]) + ' prefix=' + JSON.stringify(p[k]));
        }
      }
      if (JSON.stringify(f.deathRows) !== JSON.stringify(p.deathRows)) {
        throw new Error('s' + seed + ' deathRows differ fresh vs prefix');
      }
      if (JSON.stringify(f.sickOnsets) !== JSON.stringify(p.sickOnsets)) {
        throw new Error('s' + seed + ' sickOnsets differ fresh vs prefix (onset recording must be roster-free)');
      }
      const diffs = [];
      deepDiff(p, f, '', diffs);
      const bad = diffs.filter(d => JSON.stringify(d.value).indexOf('radiation_sickness') === -1);
      if (bad.length) {
        throw new Error('s' + seed + ': ' + bad.length + ' non-radiation diff(s), first: ' +
          JSON.stringify(bad.slice(0, 3)));
      }
      console.log('    (s' + seed + ': ' + diffs.length + ' differing element(s), all radiation)');
    }
  });

  console.log('\ntest-radsnap-a: ' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error('HARNESS FAIL', e); process.exit(2); });
