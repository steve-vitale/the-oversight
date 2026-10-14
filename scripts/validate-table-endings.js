#!/usr/bin/env node
// scripts/validate-table-endings.js — the Table's endings-by-build contract
// and Muse's to-do list (2026-10-14).
//
// Steve: "Each playstyle and godhood path, moral choice version should have
// its own ending." The engine (src/js/endingKey.js) resolves a build-aware
// beat (src/data/table-beats.json) and a COMPOSED ending
// (src/data/table-endings.json; Steve round 5: path final + one build coda):
// the path's own light/dark final plus the most specific coda
// (god > class/subclass > track, path-independent, 70 in all), unless a
// rare bespoke path entry overrides it. This script checks the data against
// the real path defs, gods, classes and tracks, and reports coverage: codas
// filled X/70, bespoke path entries listed separately (optional).
//
//   node scripts/validate-table-endings.js           # errors + coverage summary
//   node scripts/validate-table-endings.js --todo    # + every missing coda and beat slot (the to-do list)
//   node scripts/validate-table-endings.js --json    # machine-readable coverage
//
// Exit 1 on any error (bad id, bad moral, unknown final, unknown token,
// unlosable option).
// Missing text is never an error: it falls back.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const args = process.argv.slice(2);
const TODO = args.includes('--todo');
const JSON_OUT = args.includes('--json');

const readJSON = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const errors = [];
const err = (m) => errors.push(m);

// The pure lookup helpers, from the engine itself (no game load needed).
globalThis.Scattering = { };
require(path.join(ROOT, 'src/js/endingKey.js'));
const EK = globalThis.Scattering.EndingKey;

// The real Table path defs: load table-<path>.js against a stub registry.
const PATHS = {};
globalThis.Scattering.Game = { data: {}, tableRegisterPath(def) { if (def && def.id) PATHS[def.id] = def; } };
for (const f of fs.readdirSync(path.join(ROOT, 'src/js')).filter(f => /^table-[a-z]+\.js$/.test(f)).sort()) {
  try { require(path.join(ROOT, 'src/js', f)); } catch (e) { err(`${f}: failed to load against the stub registry (${e.message})`); }
}
delete globalThis.Scattering.Game;

const GP = readJSON('src/data/godpaths.json');
const TRACKS = (readJSON('src/data/tracks.json').tracks) || [];
const BEATS = readJSON('src/data/table-beats.json');
const ENDINGS = readJSON('src/data/table-endings.json');
const UNIVERSE = EK.universe(GP, TRACKS);
const VALID_SEL = new Set(UNIVERSE.concat(['default']));
const FINALES = new Set(['network', 'apocalypse', 'herald', 'none']);

const moralsFor = (pid) => pid === 'relay' ? ['light', 'dark', 'grey'] : ['light', 'dark'];
const finalIds = (pid, moral) => {
  const def = PATHS[pid] || {};
  const f = (def.finals || {});
  const list = (f[moral] || (moral === 'grey' ? (f.grey || f.light) : null) || []).map(x => x.id);
  return new Set(list.concat(['hosts', 'poddemand']));
};
const isStrArr = (a) => Array.isArray(a) && a.length > 0 && a.every(x => typeof x === 'string' && x.trim());
// checkTokens(where, lines): only {name} {class} {god} {verb} {path} fill.
const checkTokens = (where, lines) => {
  for (const l of (Array.isArray(lines) ? lines : [lines])) {
    for (const t of EK.tokensIn(l)) if (EK.TOKENS.indexOf(t) < 0) err(`${where}: unknown token {${t}} (use ${EK.TOKENS.map(x => '{' + x + '}').join(' ')})`);
  }
};

if (!Object.keys(PATHS).length) err('no Table paths registered (table-<path>.js)');

// ---------------- table-beats.json ----------------
for (const lvl of Object.keys(BEATS.levelBonus || {})) {
  if (EK.LEVELS.indexOf(lvl) < 0) err(`beats.levelBonus: unknown level '${lvl}'`);
  if ((BEATS.levelBonus[lvl] | 0) < 0) err(`beats.levelBonus.${lvl}: a build never lowers the odds`);
}
for (const k of Object.keys(BEATS.finale || {})) {
  if (k === '_doc') continue;
  if (!FINALES.has(k)) err(`beats.finale: unknown titan finale outcome '${k}' (use ${[...FINALES].join('/')})`);
}
for (const lvl of Object.keys(BEATS.templates || {})) {
  if (lvl !== 'god' && lvl !== 'subclass') err(`beats.templates.${lvl}: templates exist for god and subclass only (lower levels need bespoke text)`);
}
function checkEntry(where, e, pid, known) {
  for (const k of Object.keys(e)) {
    if (k === '_doc') continue;
    if (['label', 'line', 'say', 'effects'].indexOf(k) < 0) err(`${where}: unknown field '${k}'`);
  }
  for (const m of EK.MORALS) {
    const hasL = !!EK.pick(e.label, m), hasS = !!EK.pick(e.say, m);
    if (hasL !== hasS) err(`${where}: moral '${m}' has ${hasL ? 'a label but no say' : 'say but no label'} (both or neither)`);
    const say = EK.pick(e.say, m);
    if (say != null && !isStrArr(say)) err(`${where}.say.${m}: must be a non-empty array of lines`);
    for (const f of ['label', 'line', 'say']) { const v = EK.pick(e[f], m); if (v != null) checkTokens(`${where}.${f}.${m}`, v); }
    const eff = EK.pick(e.effects, m);
    if (eff) for (const mk of Object.keys(eff)) {
      if (['fail', 'goto', 'trial'].indexOf(mk) >= 0) err(`${where}.effects.${m}: '${mk}' is the engine's call, not data's`);
      else if (known && !known.has(mk)) err(`${where}.effects.${m}: unknown meter '${mk}' for ${pid} (known: ${[...known].join(', ')})`);
      else if (typeof eff[mk] !== 'number') err(`${where}.effects.${m}.${mk}: must be a number`);
    }
  }
  for (const f of ['label', 'line', 'say', 'effects']) {
    const v = e[f];
    if (v && typeof v === 'object' && !Array.isArray(v)) for (const m of Object.keys(v)) {
      if (m !== '_doc' && EK.MORALS.indexOf(m) < 0) err(`${where}.${f}: unknown moral '${m}'`);
      if (m === 'grey' && pid && pid !== 'relay') err(`${where}.${f}: 'grey' is the relay's band only`);
    }
  }
}
for (const t of Object.keys(BEATS.templates || {})) checkEntry(`beats.templates.${t}`, BEATS.templates[t], null, null);

const beatCov = {}; // pid -> moral -> {bespoke:[sel], missing:[sel]}
for (const pid of Object.keys(BEATS.paths || {})) {
  const P = BEATS.paths[pid];
  const def = PATHS[pid];
  const w = `beats.paths.${pid}`;
  if (!def) { err(`${w}: unknown Table path (registered: ${Object.keys(PATHS).join(', ')})`); continue; }
  const nBeats = (def.beats || []).length;
  if (!Number.isInteger(P.beat) || P.beat < 0 || P.beat >= nBeats) err(`${w}.beat: ${P.beat} is not a beat of ${pid} (0..${nBeats - 1})`);
  // Known meters: everything the path's data names, plus the engine's two.
  const known = new Set(['grounding', 'sysBond']);
  const addM = (o) => { if (o && typeof o === 'object') for (const k of Object.keys(o)) known.add(k); };
  for (const m of moralsFor(pid)) {
    const mt = EK.pick(P.meter, m);
    if (mt) known.add(mt);
    addM(EK.pick(P.gain, m));
    const st = EK.pick(P.stake, m);
    if (st && st.meter) known.add(st.meter);
  }
  for (const L of (P.limits || [])) { if (L.meter) known.add(L.meter); if (L.overMeter) known.add(L.overMeter); }
  for (const m of moralsFor(pid)) {
    // ALWAYS LOSABLE (Steve 2026-10-14): every build option carries a stake.
    const st = EK.pick(P.stake, m);
    if (!st || !st.meter || (st.gte == null && st.lte == null)) err(`${w}.stake.${m}: missing — every build option must carry the path's stake (losable for every key)`);
    if (!EK.pick(P.meter, m)) err(`${w}.meter: no meter for moral '${m}'`);
    if (!EK.pick(P.gain, m)) err(`${w}.gain.${m}: missing default gains`);
    const d = (P.options || {}).default;
    if (!d || !EK.hasMoral(d, m)) err(`${w}.options.default: moral '${m}' missing — the path+moral fallback must exist for every key (never gate on godhood)`);
  }
  for (const L of (P.limits || [])) {
    if (!L.meter || (L.gte == null && L.lte == null && !L.overMeter)) err(`${w}.limits: each limit needs meter + gte/lte/overMeter`);
  }
  for (const sel of Object.keys(P.options || {})) {
    if (!VALID_SEL.has(sel)) { err(`${w}.options['${sel}']: unknown selector (god:<godId>, class:<path>[/<subclass>], track:<track>, default)`); continue; }
    checkEntry(`${w}.options['${sel}']`, P.options[sel], pid, known);
  }
  for (const k of Object.keys(P.finale || {})) if (!FINALES.has(k)) err(`${w}.finale: unknown outcome '${k}'`);
  beatCov[pid] = {};
  for (const m of moralsFor(pid)) {
    const c = beatCov[pid][m] = { bespoke: [], template: [], missing: [] };
    for (const sel of UNIVERSE) {
      const e = (P.options || {})[sel];
      const lvl = EK.levelOf(sel);
      if (e && EK.hasMoral(e, m)) c.bespoke.push(sel);
      else if ((BEATS.templates || {})[lvl] && EK.hasMoral(BEATS.templates[lvl], m)) { c.template.push(sel); c.missing.push(sel); }
      else c.missing.push(sel);
    }
  }
}
for (const pid of Object.keys(PATHS)) if (!(BEATS.paths || {})[pid]) err(`beats.paths.${pid}: missing — every Table path plays the build at one beat`);

// ---------------- table-endings.json ----------------
// Codas: path-independent, light/dark only (the relay's grey reads one of
// them by relayLean), at god / class+subclass / track level.
const CODA_SELS = UNIVERSE.filter(s => EK.CODA_LEVELS.indexOf(EK.levelOf(s)) >= 0);
const CODA_SET = new Set(CODA_SELS);
const CODAS = ENDINGS.codas || {};
for (const k of Object.keys(ENDINGS)) {
  if (['_doc', 'codas', 'paths'].indexOf(k) < 0) err(`endings: unknown top-level field '${k}' (codas, paths)`);
}
for (const sel of Object.keys(CODAS)) {
  if (sel === '_doc') continue;
  const w = `endings.codas['${sel}']`;
  if (!CODA_SET.has(sel)) {
    err(VALID_SEL.has(sel) ? `${w}: codas live at god:<id>, class:<path>/<subclass> and track:<t> only (a bare class or default has no coda)` : `${w}: unknown selector (god:<godId>, class:<path>/<subclass>, track:<track>)`);
    continue;
  }
  const C = CODAS[sel] || {};
  for (const m of Object.keys(C)) {
    if (m === '_doc') continue;
    if (m !== 'light' && m !== 'dark') { err(`${w}: unknown moral '${m}' (codas are light/dark; the relay's grey reads one by relayLean)`); continue; }
    if (!isStrArr(C[m])) err(`${w}.${m}: must be a non-empty array of lines`);
    else checkTokens(`${w}.${m}`, C[m]);
  }
}
const codaHave = [], codaMissing = [];
for (const sel of CODA_SELS) for (const m of ['light', 'dark']) {
  const C = CODAS[sel] || {};
  (isStrArr(C[m]) ? codaHave : codaMissing).push(`${sel}.${m}`);
}

const endCov = {};
for (const pid of Object.keys(ENDINGS.paths || {})) {
  const w = `endings.paths.${pid}`;
  if (!PATHS[pid]) { err(`${w}: unknown Table path`); continue; }
  const P = ENDINGS.paths[pid];
  for (const sel of Object.keys(P)) {
    if (sel === '_doc') continue;
    if (sel === 'default') { err(`${w}.default: the path+moral ending is the path's own finals (table-${pid}.js); author a more specific selector`); continue; }
    if (!VALID_SEL.has(sel)) { err(`${w}['${sel}']: unknown selector`); continue; }
    for (const m of Object.keys(P[sel])) {
      if (m === '_doc') continue;
      if (moralsFor(pid).indexOf(m) < 0) { err(`${w}['${sel}']: unknown moral '${m}' for ${pid}`); continue; }
      const E = P[sel][m] || {};
      for (const k of Object.keys(E)) if (['title', 'lines', 'finals', '_doc'].indexOf(k) < 0) err(`${w}['${sel}'].${m}: unknown field '${k}'`);
      if (E.lines != null && !isStrArr(E.lines)) err(`${w}['${sel}'].${m}.lines: must be a non-empty array of lines`);
      if (E.title != null) checkTokens(`${w}['${sel}'].${m}.title`, E.title);
      if (isStrArr(E.lines)) checkTokens(`${w}['${sel}'].${m}.lines`, E.lines);
      for (const fid of Object.keys(E.finals || {})) if (isStrArr(E.finals[fid])) checkTokens(`${w}['${sel}'].${m}.finals.${fid}`, E.finals[fid]);
      if (!E.lines && !E.finals) err(`${w}['${sel}'].${m}: needs lines and/or finals`);
      const ok = finalIds(pid, m);
      for (const fid of Object.keys(E.finals || {})) {
        if (!ok.has(fid)) err(`${w}['${sel}'].${m}.finals.${fid}: not a final of ${pid} ${m} (${[...ok].join(', ')})`);
        else if (!isStrArr(E.finals[fid])) err(`${w}['${sel}'].${m}.finals.${fid}: must be a non-empty array of lines`);
      }
    }
  }
}
// Bespoke path entries: optional overrides, listed, never counted as missing.
const bespoke = [];
for (const pid of Object.keys(PATHS)) {
  const P = (ENDINGS.paths || {})[pid] || {};
  endCov[pid] = {};
  for (const m of moralsFor(pid)) {
    const c = endCov[pid][m] = { bespoke: [] };
    for (const sel of UNIVERSE) {
      const E = (P[sel] || {})[m];
      if (E && ((E.lines && E.lines.length) || (E.finals && Object.keys(E.finals).length))) { c.bespoke.push(sel); bespoke.push(`${pid}.${sel}.${m}`); }
    }
  }
}

// ---------------- report ----------------
let bTot = 0, bHave = 0, bTpl = 0;
const rows = [];
for (const pid of Object.keys(PATHS).sort()) {
  for (const m of moralsFor(pid)) {
    const b = (beatCov[pid] || {})[m] || { bespoke: [], template: [], missing: UNIVERSE.slice() };
    const e = (endCov[pid] || {})[m] || { bespoke: [] };
    bTot += UNIVERSE.length; bHave += b.bespoke.length; bTpl += b.template.length;
    rows.push({ path: pid, moral: m, beats: b.bespoke.length, beatTemplates: b.template.length, endings: e.bespoke.length, slots: UNIVERSE.length, beatBespoke: b.bespoke, endingBespoke: e.bespoke, beatMissing: b.missing });
  }
}
const codaTot = CODA_SELS.length * 2;
if (JSON_OUT) {
  console.log(JSON.stringify({ errors, slotsPerPathMoral: UNIVERSE.length, codas: { filled: codaHave.length, total: codaTot, have: codaHave, missing: codaMissing }, bespokeEndings: bespoke, beats: { bespoke: bHave, template: bTpl, total: bTot }, rows }, null, 1));
} else {
  console.log(`Endings by build — composed: the path's final + one build coda. ${CODA_SELS.length} coda selectors x light/dark (${CODA_SELS.filter(s => /^god:/.test(s)).length} gods, ${CODA_SELS.filter(s => /\//.test(s)).length} subclasses, ${TRACKS.length} tracks)`);
  console.log(`\ncodas filled ${codaHave.length}/${codaTot}${codaHave.length ? ': ' + codaHave.join(', ') : ''}`);
  console.log(`bespoke path entries (optional overrides, win over any coda): ${bespoke.length}${bespoke.length ? '\n  ' + bespoke.join('\n  ') : ''}`);
  console.log('\nbeats  path           moral  bespoke/template');
  for (const r of rows) console.log(`  ${r.path.padEnd(13)} ${r.moral.padEnd(6)} ${String(r.beats).padStart(3)} / ${String(r.beatTemplates).padStart(2)}   of ${r.slots}${r.beatBespoke.length ? '   bespoke: ' + r.beatBespoke.join(', ') : ''}`);
  console.log(`\ncoverage: codas ${codaHave.length}/${codaTot} (a missing coda falls through to the next level, then to the final alone); beats ${bHave}/${bTot} bespoke (+${bTpl} by template, the rest fall back to the path default)`);
  if (TODO) {
    console.log('\nTO-DO (Muse): missing codas, most specific level first. Each falls through today.');
    const g = {};
    for (const s of codaMissing) { const l = EK.levelOf(s.replace(/\.(light|dark)$/, '')); (g[l] = g[l] || []).push(s.replace(/^[a-z]+:/, '')); }
    for (const l of EK.CODA_LEVELS) if (g[l]) console.log(`  coda  ${l}: ${g[l].join(' ')}`);
    console.log('\nTO-DO (optional): beat slots without bespoke text (templates and the path default cover them).');
    for (const r of rows) {
      const gb = {};
      for (const s of r.beatMissing) { const l = EK.levelOf(s); (gb[l] = gb[l] || []).push(s.replace(/^[a-z]+:/, '')); }
      console.log(`\n${r.path} / ${r.moral}`);
      for (const l of EK.LEVELS.filter(x => gb[x])) console.log(`  beat    ${l}: ${gb[l].join(' ')}`);
    }
  } else {
    console.log('run with --todo for the full list of missing slots');
  }
  if (errors.length) { console.log(`\nERRORS (${errors.length}):`); for (const e of errors) console.log('  ' + e); }
  console.log(`\nvalidate-table-endings: ${errors.length ? 'FAIL' : 'OK'} — ${errors.length} errors`);
  console.log(`validate-table-endings: ${errors.length ? 0 : 1} passed, ${errors.length ? 1 : 0} failed`);
}
process.exitCode = errors.length ? 1 : 0;
