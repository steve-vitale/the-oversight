#!/usr/bin/env node
// test-radsource-a.js — proof for the radiation-source attribution
// instrument fix (sim-radsource-a, 2026-11-09, oversight-flesh-out-loop,
// axis scale-onramp / instruments).
//
// The gap: scholar radiation_sickness onsets arrive via
// contractDisease('radiation_sickness', {}) with NO source string (the
// sole scholar contraction site is src/js/feastBuff.js:389, pellet
// boost), and the sweep's vectorForScholarSource maps the source STRING
// only — so all 13 radiation onsets on the radsnap band landed as
// vector 'unattributed' and the analyzer honestly reported them
// unattributed under G4. Canon ground (docs/DISEASES.md): radiation's
// ONLY vector is "the pellet's invisible fire" — the disease id itself
// is the source evidence.
//
// The fix (instrument only, ZERO src/js changes), two layers:
//   1. RECORDER — sweep-feveranat-a.js: vectorForDiseaseId (shared
//      helper) attributes radiation_sickness from the id, consulted
//      first by vectorForScholarSource(src, effectId) and by the
//      applyStatus-direct mundane branch.
//   2. ANALYZER — analyze-feveranat-a.js finish(): an episode whose
//      diseaseId is radiation_sickness and whose RECORDED vector is
//      missing/'unattributed' is re-derived to the pellet vector with
//      vectorSource 'disease-id (analyzer)' (named in F3, never
//      silent); a recorded vector is never overridden. This layer is
//      what fixes the RECORDED radsnap corpus on re-run; the recorder
//      layer fixes future sweeps at record time.
//
// Legs:
//   L1 static: the id rule exists in both files, at the right places,
//     with the exact vector string in both.
//   L2 function leg (ACTUAL functions extracted from the sweep file):
//     radiation ids attribute from the id even with an empty source;
//     the source map still works for every other id; an empty source
//     for a non-radiation id stays 'unattributed' (control).
//   L3 live game: the engine path still contracts radiation with {}
//     on this base, and the canon ground (pool/class) is unchanged.
//   L4 judged corpus: the post-fix analyzer on the RECORDED radsnap
//     corpus reports the exact prereg F3 map, unattributed=0,
//     re-derived=13, G3 PASS, G2 PASS, G4 EVERY episode classified.
//   L5 per-episode control (buildEpisodes, recorded data as the
//     before-state): the corpus files still carry 13 radiation onsets
//     recorded 'unattributed' (the fix is analyzer-side; the corpus is
//     untouched), and for every NON-radiation disease the recorded
//     onset vectors equal the built episode vectors — no non-radiation
//     vector moved. Synthesized same-tick episodes (no onset) excluded.
//   L6 prefix corpus: the same attribution fix lands on the second
//     recorded corpus (same 13 onsets), while G3 stays FAIL there with
//     the same 9 unaccounted snapshot-gap onsets — the vector fix does
//     not paper over the snapshot gap.
'use strict';
process.env.PLENTYDEPRI = '1';
process.env.DEPOSITGATE = '1';
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const { loadGame, setupGame } = require('./sim-harness');

const SWEEP_F = path.join(__dirname, 'sweep-feveranat-a.js');
const ANALYZE = path.join(__dirname, 'analyze-feveranat-a.js');
const CORPUS = process.env.RADSOURCE_CORPUS ||
  path.join(__dirname, '..', 'evidence', '2026-11-09', 'radsnap-a-corpus');
const PRE_CORPUS = process.env.RADSOURCE_PREFIX_CORPUS ||
  path.join(__dirname, '..', 'evidence', '2026-11-09', 'radsnap-a-corpus-prefix');
const PELLET = "the pellet's invisible fire";
const EXPECT_F3 = { tick: 123, wound: 27, 'unsafe food': 6, food: 2,
  'dirty water': 3, 'raw food': 1, [PELLET]: 13 };

let pass = 0, fail = 0;
function leg(name, fn) {
  try { fn(); pass++; console.log('PASS ' + name); }
  catch (e) { fail++; console.log('FAIL ' + name + ' — ' + (e && e.message)); }
}
async function aleg(name, fn) {
  try { await fn(); pass++; console.log('PASS ' + name); }
  catch (e) { fail++; console.log('FAIL ' + name + ' — ' + (e && e.message)); }
}
function sameMap(a, b) {
  const ka = Object.keys(a).sort(), kb = Object.keys(b).sort();
  return ka.length === kb.length && ka.every((k, i) => k === kb[i] && a[k] === b[k]);
}
// Extract a top-level function's SOURCE text verbatim from a file, so the
// test exercises the file's ACTUAL code, not a copy.
function extractSrc(file, name, argPat) {
  const src = fs.readFileSync(file, 'utf8');
  const m = src.match(new RegExp('function ' + name + '\\(' + argPat + '\\) \\{[\\s\\S]*?\\n\\}'));
  if (!m) throw new Error(name + ' not found in ' + path.basename(file));
  return m[0];
}
function extractConst(file, name) {
  const src = fs.readFileSync(file, 'utf8');
  const m = src.match(new RegExp('const ' + name + ' = ("(?:[^"\\\\]|\\\\.)*"|\'(?:[^\'\\\\]|\\\\.)*\');'));
  if (!m) throw new Error(name + ' const not found in ' + path.basename(file));
  return eval(m[1]); // eslint-disable-line no-eval
}
function readPerSeed(dir) {
  const out = {};
  for (const f of fs.readdirSync(dir).filter(f => /^feveranat-a-competent-s\d+\.json$/.test(f))) {
    out[f.match(/s(\d+)/)[1]] = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  }
  return out;
}
function runAnalyzer(dir) {
  const r = cp.spawnSync(process.execPath, [ANALYZE, dir], { encoding: 'utf8' });
  const out = (r.stdout || '') + (r.stderr || '');
  if (r.status !== 0) throw new Error('analyzer exited ' + r.status + ' on ' + dir + ':\n' + out.slice(0, 1000));
  return out;
}
function f3Map(out) {
  const m = out.match(/F3 VECTOR ATTRIBUTION: by vector=(\{.*\})/);
  if (!m) throw new Error('no F3 by-vector line in analyzer output');
  return JSON.parse(m[1]);
}

(async () => {
  // ---- L1: static ----
  leg('L1 sweep carries the disease-id rule (helper + vector string)', () => {
    if (extractConst(SWEEP_F, 'RADIATION_VECTOR') !== PELLET) {
      throw new Error('RADIATION_VECTOR is not the pellet vector');
    }
    const src = fs.readFileSync(SWEEP_F, 'utf8');
    if (!/function vectorForDiseaseId\(effectId\)/.test(src)) throw new Error('vectorForDiseaseId missing');
    if (!/if \(effectId === 'radiation_sickness'\) return \{ vector: RADIATION_VECTOR/.test(src)) {
      throw new Error('vectorForDiseaseId does not return the pellet vector for radiation_sickness');
    }
    if (!/function vectorForScholarSource\(src, effectId\)/.test(src)) {
      throw new Error('vectorForScholarSource does not take effectId');
    }
    if (!/const vec = vectorForScholarSource\(src, effectId\);/.test(src)) {
      throw new Error('contractDisease wrapper does not pass effectId');
    }
    if (!/const vecD = vectorForDiseaseId\(effectId\);/.test(src)) {
      throw new Error('applyStatus-direct branch does not use the id rule');
    }
    if (!/const byId = vectorForDiseaseId\(effectId\);\n  if \(byId\) return byId;/.test(src)) {
      throw new Error('id rule is not consulted first in vectorForScholarSource');
    }
  });
  leg('L1 analyzer carries the re-derivation in finish() + F3 count line', () => {
    const src = fs.readFileSync(ANALYZE, 'utf8');
    if (!/o\.diseaseId === 'radiation_sickness' && \(!vector \|\| vector === 'unattributed'\)/.test(src)) {
      throw new Error('finish() re-derivation guard missing');
    }
    if (!/vectorSource = 'disease-id \(analyzer\)'/.test(src)) {
      throw new Error('re-derivation does not mark vectorSource');
    }
    if (!/disease-id re-derived=/.test(src)) throw new Error('F3 re-derived count line missing');
    if (!/vector = "the pellet's invisible fire"/.test(src)) {
      throw new Error('analyzer does not use the pellet vector string');
    }
  });

  // ---- L2: actual extracted functions ----
  leg('L2 radiation attributes from the id, source map intact (control)', () => {
    // Eval the ACTUAL functions together in one scope: vectorForScholarSource
    // closes over vectorForDiseaseId + RADIATION_VECTOR in the sweep file,
    // so the extracted copies must share a scope too (same names, same file).
    const pellet = extractConst(SWEEP_F, 'RADIATION_VECTOR');
    const byIdSrc = extractSrc(SWEEP_F, 'vectorForDiseaseId', 'effectId');
    const fSrc = extractSrc(SWEEP_F, 'vectorForScholarSource', 'src, effectId');
    const scope = 'const RADIATION_VECTOR = ' + JSON.stringify(pellet) + '; ' + byIdSrc + ' ';
    const byId = eval('(function(){ ' + scope + 'return vectorForDiseaseId; })()'); // eslint-disable-line no-eval
    const f = eval('(function(){ ' + scope + 'return (' + fSrc + '); })()'); // eslint-disable-line no-eval
    const cases = [
      // [src, effectId, expected vector] — radiation first, whatever the source.
      ['', 'radiation_sickness', PELLET],
      [null, 'radiation_sickness', PELLET],
      [undefined, 'radiation_sickness', PELLET],
      ['a tick bite', 'radiation_sickness', PELLET],
      // Source map still answers for every other id (control: no regression).
      ['the creek water', 'disease', 'dirty water'],
      ['a tick bite', 'disease', 'tick (ambient)'],
      ['a mosquito bite', 'disease', 'mosquito (ambient)'],
      ['a heatwave mosquito bite', 'disease', 'mosquito (heatwave)'],
      ['a cut gone wrong', 'disease', 'wound'],
      ['a dirty cut', 'wound_fever', 'wound'],
      ['a botched tick removal', 'wound_fever', 'tick-removal botch'],
      ['the roasted deer', 'disease', 'food'],
      // Empty source for a NON-radiation id stays unattributed (control).
      ['', 'disease', 'unattributed'],
      [null, 'gutrot', 'unattributed'],
      ['something unknown', 'disease', 'unattributed'],
    ];
    for (const [src, id, want] of cases) {
      const got = f(src, id).vector;
      if (got !== want) throw new Error('vectorForScholarSource(' + JSON.stringify(src) + ', ' + id + ') = ' + JSON.stringify(got) + ', want ' + JSON.stringify(want));
    }
    if (byId('disease') !== null || byId('wound_fever') !== null || byId('tick_attached') !== null) {
      throw new Error('vectorForDiseaseId fires for a non-radiation id');
    }
    if (!byId('radiation_sickness') || byId('radiation_sickness').vector !== PELLET) {
      throw new Error('vectorForDiseaseId misses radiation_sickness');
    }
  });

  // ---- L3: live game ----
  const { Game: G } = await loadGame({ seed: 20261109, mode: 'test' });
  await setupGame(G);
  await aleg('L3 live: engine contracts radiation with {} (premise holds)', async () => {
    if (typeof G.contractDisease !== 'function') throw new Error('no contractDisease');
    const r = G.contractDisease('radiation_sickness', {});
    if (!r) throw new Error('contractDisease refused radiation_sickness');
    const list = (typeof G.seList === 'function' ? G.seList('scholar') : []) || [];
    if (!list.some(e => e.id === 'radiation_sickness')) {
      throw new Error('radiation_sickness not in seList(scholar) after contract');
    }
    const d = G.seDef('radiation_sickness');
    if (!d || d.pool !== 'mundane' || d.class !== 'radiation') {
      throw new Error('canon ground moved: ' + JSON.stringify(d && { pool: d.pool, class: d.class }));
    }
  });

  // ---- L4: judged corpus ----
  leg('L4 analyzer on recorded radsnap corpus: exact F3 map, 13/13, G3+G2 PASS', () => {
    const out = runAnalyzer(CORPUS);
    const got = f3Map(out);
    if (!sameMap(got, EXPECT_F3)) {
      throw new Error('F3 map drift: ' + JSON.stringify(got) + ' != ' + JSON.stringify(EXPECT_F3));
    }
    if (!/attributed=175\/175 unattributed=0/.test(out)) throw new Error('attributed/unattributed counts wrong');
    if (!/disease-id re-derived=13 episode/.test(out)) throw new Error('re-derived line missing or != 13');
    if (/UNATTRIBUTED /.test(out)) throw new Error('UNATTRIBUTED listing lines remain');
    if (!/G3 CORPUS: PASS/.test(out)) throw new Error('G3 not PASS');
    if (!/G2 NEUTRALITY: PASS/.test(out)) throw new Error('G2 not PASS');
    if (!/G4 CLASSIFICATION: 175 episode\(s\) on 8\/8 seeds — EVERY episode classified/.test(out)) {
      throw new Error('G4 does not say EVERY episode classified');
    }
    if (!/DIAGNOSIS VERDICT: COMPLETE — 175 episode\(s\) classified \(175 attributed, 0 unattributed/.test(out)) {
      throw new Error('verdict line wrong');
    }
    if (!/scholar onsets by vector \(source-string \/ disease-id evidence\)=\{"the pellet's invisible fire":13,"wound":3,"food":2,"dirty water":3\}/.test(out)) {
      throw new Error('scholar by-vector line wrong');
    }
    console.log('    (F3 map exact; 13/13 radiation attributed; G3/G2 PASS; G4 EVERY classified)');
  });

  // ---- L5: per-episode control against the recorded before-state ----
  leg('L5 recorded onsets still 13 unattributed radiation; non-radiation vectors unmoved', () => {
    const { buildEpisodes } = require('./analyze-feveranat-a.js');
    const per = readPerSeed(CORPUS);
    let radRecorded = 0, radEpisodes = 0;
    for (const seed of Object.keys(per).sort()) {
      const s = per[seed];
      const rec = {};
      for (const o of (s.sickOnsets || [])) {
        const k = o.diseaseId || o.name;
        (rec[k] = rec[k] || []).push(o.vector || 'unattributed');
        if (k === 'radiation_sickness') radRecorded++;
      }
      const eps = buildEpisodes(s).eps.filter(e => !e.synthesized);
      const got = {};
      for (const e of eps) {
        const k = e.diseaseId || e.name;
        (got[k] = got[k] || []).push(e.vector || 'unattributed');
        if (k === 'radiation_sickness') radEpisodes++;
      }
      for (const k of new Set([...Object.keys(rec), ...Object.keys(got)])) {
        const a = (rec[k] || []).slice().sort();
        const b = (got[k] || []).slice().sort();
        if (k === 'radiation_sickness') {
          if (a.length !== 13 || !a.every(v => v === 'unattributed')) {
            throw new Error('s' + seed + ': recorded radiation vectors not all unattributed: ' + JSON.stringify(a));
          }
          if (b.length !== a.length || !b.every(v => v === PELLET)) {
            throw new Error('s' + seed + ': built radiation vectors not all pellet: ' + JSON.stringify(b));
          }
          continue;
        }
        if (a.length !== b.length || a.some((v, i) => v !== b[i])) {
          throw new Error('s' + seed + ' ' + k + ': episode vectors moved — recorded ' +
            JSON.stringify(a) + ' vs built ' + JSON.stringify(b));
        }
      }
    }
    if (radRecorded !== 13) throw new Error('recorded radiation onsets ' + radRecorded + ' != 13');
    if (radEpisodes !== 13) throw new Error('built radiation episodes ' + radEpisodes + ' != 13');
    console.log('    (recorded corpus untouched: 13 radiation onsets still recorded unattributed; all non-radiation episode vectors equal their recorded onsets)');
  });

  // ---- L6: prefix corpus ----
  leg('L6 prefix corpus: same attribution fix; G3 FAIL unchanged (snapshot gap)', () => {
    const out = runAnalyzer(PRE_CORPUS);
    const got = f3Map(out);
    if (!sameMap(got, EXPECT_F3)) {
      throw new Error('prefix F3 map drift: ' + JSON.stringify(got));
    }
    if (!/attributed=175\/175 unattributed=0/.test(out)) throw new Error('prefix attributed counts wrong');
    if (!/disease-id re-derived=13 episode/.test(out)) throw new Error('prefix re-derived != 13');
    if (!/G3 CORPUS: FAIL/.test(out)) throw new Error('prefix G3 unexpectedly PASS — the vector fix must not touch the snapshot gap');
    if (!/unaccountedOnsets=9/.test(out)) throw new Error('prefix unaccounted count moved from 9');
    if (!/G2 NEUTRALITY: PASS/.test(out)) throw new Error('prefix G2 not PASS');
    if (!/G4 CLASSIFICATION: 175 episode\(s\) on 8\/8 seeds — EVERY episode classified/.test(out)) {
      throw new Error('prefix G4 does not say EVERY episode classified');
    }
    console.log('    (prefix F3 identical to fresh; G3 still FAIL with the same 9 snapshot-gap onsets)');
  });

  console.log('\ntest-radsource-a: ' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error('HARNESS FAIL', e); process.exit(2); });
