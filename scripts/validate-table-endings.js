#!/usr/bin/env node
// scripts/validate-table-endings.js — the Table's endings-by-build contract
// and Muse's to-do list (2026-10-14).
//
// Steve: "Each playstyle and godhood path, moral choice version should have
// its own ending." The engine (src/js/endingKey.js) resolves a build-aware
// beat (src/data/table-beats.json) and an ending text
// (src/data/table-endings.json) by the locked ending key, most specific
// first: god > class/subclass > class > track > the path's own finals.
// This script checks the data against the real path defs, gods, classes and
// tracks, and reports coverage: which slots have bespoke text, which fall back.
//
//   node scripts/validate-table-endings.js           # errors + coverage summary
//   node scripts/validate-table-endings.js --todo    # + every missing slot (the to-do list)
//   node scripts/validate-table-endings.js --json    # machine-readable coverage
//
// Exit 1 on any error (bad id, bad moral, unknown final, unlosable option).
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
      if (!E.lines && !E.finals) err(`${w}['${sel}'].${m}: needs lines and/or finals`);
      const ok = finalIds(pid, m);
      for (const fid of Object.keys(E.finals || {})) {
        if (!ok.has(fid)) err(`${w}['${sel}'].${m}.finals.${fid}: not a final of ${pid} ${m} (${[...ok].join(', ')})`);
        else if (!isStrArr(E.finals[fid])) err(`${w}['${sel}'].${m}.finals.${fid}: must be a non-empty array of lines`);
      }
    }
  }
}
for (const pid of Object.keys(PATHS)) {
  const P = (ENDINGS.paths || {})[pid] || {};
  endCov[pid] = {};
  for (const m of moralsFor(pid)) {
    const c = endCov[pid][m] = { bespoke: [], missing: [] };
    for (const sel of UNIVERSE) {
      const E = (P[sel] || {})[m];
      if (E && ((E.lines && E.lines.length) || (E.finals && Object.keys(E.finals).length))) c.bespoke.push(sel); else c.missing.push(sel);
    }
  }
}

// ---------------- report ----------------
let bTot = 0, bHave = 0, bTpl = 0, eTot = 0, eHave = 0;
const rows = [];
for (const pid of Object.keys(PATHS).sort()) {
  for (const m of moralsFor(pid)) {
    const b = (beatCov[pid] || {})[m] || { bespoke: [], template: [], missing: UNIVERSE.slice() };
    const e = (endCov[pid] || {})[m] || { bespoke: [], missing: UNIVERSE.slice() };
    bTot += UNIVERSE.length; bHave += b.bespoke.length; bTpl += b.template.length;
    eTot += UNIVERSE.length; eHave += e.bespoke.length;
    rows.push({ path: pid, moral: m, beats: b.bespoke.length, beatTemplates: b.template.length, endings: e.bespoke.length, slots: UNIVERSE.length, beatBespoke: b.bespoke, endingBespoke: e.bespoke, beatMissing: b.missing, endingMissing: e.missing });
  }
}
if (JSON_OUT) {
  console.log(JSON.stringify({ errors, slotsPerPathMoral: UNIVERSE.length, beats: { bespoke: bHave, template: bTpl, total: bTot }, endings: { bespoke: eHave, total: eTot }, rows }, null, 1));
} else {
  console.log(`Endings by build — ${Object.keys(PATHS).length} paths, ${UNIVERSE.length} build slots per path x moral (${UNIVERSE.filter(s => /^god:/.test(s)).length} gods, ${UNIVERSE.filter(s => /\//.test(s)).length} subclasses, ${UNIVERSE.filter(s => /^class:[^/]+$/.test(s)).length} classes, ${TRACKS.length} tracks)`);
  console.log('path           moral  beats(bespoke/template)  endings(bespoke)');
  for (const r of rows) console.log(`  ${r.path.padEnd(13)} ${r.moral.padEnd(6)} ${String(r.beats).padStart(3)} / ${String(r.beatTemplates).padStart(2)}                ${String(r.endings).padStart(3)}   of ${r.slots}${r.beatBespoke.length || r.endingBespoke.length ? '   bespoke: ' + Array.from(new Set(r.beatBespoke.concat(r.endingBespoke))).join(', ') : ''}`);
  console.log(`\ncoverage: beats ${bHave}/${bTot} bespoke (+${bTpl} by template, the rest fall back to the path default); endings ${eHave}/${eTot} bespoke (the rest fall back to the path's own light/dark finals)`);
  if (TODO) {
    console.log('\nTO-DO (Muse): missing slots, most specific level first. Each falls back today.');
    for (const r of rows) {
      const byLvl = (list) => {
        const g = {};
        for (const s of list) { const l = EK.levelOf(s); (g[l] = g[l] || []).push(s.replace(/^[a-z]+:/, '')); }
        return EK.LEVELS.filter(l => g[l]).map(l => `${l}: ${g[l].join(' ')}`);
      };
      console.log(`\n${r.path} / ${r.moral}`);
      for (const l of byLvl(r.endingMissing)) console.log(`  ending  ${l}`);
      for (const l of byLvl(r.beatMissing)) console.log(`  beat    ${l}`);
    }
  } else {
    console.log('run with --todo for the full list of missing slots');
  }
  if (errors.length) { console.log(`\nERRORS (${errors.length}):`); for (const e of errors) console.log('  ' + e); }
  console.log(`\nvalidate-table-endings: ${errors.length ? 'FAIL' : 'OK'} — ${errors.length} errors`);
  console.log(`validate-table-endings: ${errors.length ? 0 : 1} passed, ${errors.length ? 1 : 0} failed`);
}
process.exitCode = errors.length ? 1 : 0;
