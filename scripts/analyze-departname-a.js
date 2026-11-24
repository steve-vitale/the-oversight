// analyze-departname-a.js — analyzer + judge, arm sim-departname-a.
// Compares the before/after per-seed corpora produced by
// scripts/dawnchoke-driver-a.js (reused unchanged) and judges the
// frozen GO bars from evidence/2026-11-23/sim-departname-a-prereg.md.
//
// What it checks, per seed:
//   * beatLines (every fireside-beat SAY line): count, days, and
//     text. After-lines must contain ZERO physical-description
//     namings (/A (person|man|woman), maybe \d0s/) across ALL beat
//     kinds (departure "marks the trail", re-seed launch "new
//     trail", re-seed/expiry "put down"). Each after line must equal
//     its before counterpart with each descriptor span replaced by
//     exactly one capitalized first name (the substitution the fix
//     performs — proven correct by scripts/test-departname-a.js,
//     which stages known people; the band check proves nothing ELSE
//     in the line changed).
//   * departBeats (structured rows): day/vid/launched/target must
//     be byte-identical before vs after — the same departures
//     happened with the same parties; the fix is text-only.
//   * deaths, v4departs launch counts, days, endReason identical —
//     the fix spends no RNG and writes no state.
//   * B1 repro: the 5 known beats (hardcoded below, verbatim from
//     sim-detgate-order-a) reproduced on the before leg (same seed,
//     day, text); the after leg shows them fixed.
// Usage:
//   node scripts/analyze-departname-a.js --before <dir> --after <dir>
//     [--out <analysis.json>] [--selftest]
//   (dirs hold dawnchoke-a-s<seed>-<run>-ctl.json per seed.)
'use strict';
const fs = require('fs');
const path = require('path');

const DESCRIPTOR_RE = /A (person|man|woman), maybe \d0s/;
function escapeRegExp(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
// The visible-trait pool is fixed data (game.js visibleTraitPool):
// a descriptor's trait is always one of these strings, so the full
// descriptor span can be matched exactly — a bare character class
// would run past the trait into the following words ("...with a
// gap-toothed grin sets out with Lucas"). Read live from game.js;
// fall back to the hardcoded copy if the parse fails.
const TRAIT_POOL_FALLBACK = ['with a long braid', 'with a shaved head', 'with tattooed arms',
  'with a scarred cheek', 'with a limp', 'with thick glasses',
  'with weathered hands', 'with grey-streaked hair', 'with a nervous tic',
  'with freckles', 'with a buzz cut', 'with a slouched posture',
  'with restless hands', 'with a crooked nose', 'with a gap-toothed grin',
  'with ink-stained fingers', "with a farmer's tan", 'with calloused knuckles',
  'with deep-set eyes', 'with a broad frame', 'with a wiry build',
  'with a missing fingertip', 'with a burn-scarred forearm', 'with sun-creased eyes'];
function loadTraitPool() {
  try {
    const src = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'game.js'), 'utf8');
    const m = src.match(/visibleTraitPool\(\) \{[\s\S]*?return \[([\s\S]*?)\];/);
    if (!m) return TRAIT_POOL_FALLBACK;
    const items = m[1].match(/'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"/g) || [];
    const traits = items.map(function (q) { return q.slice(1, -1); });
    return traits.length ? traits : TRAIT_POOL_FALLBACK;
  } catch (e) { return TRAIT_POOL_FALLBACK; }
}
const TRAIT_POOL = loadTraitPool();
const DESCRIPTOR_FULL_RE = new RegExp(
  'A (?:person|man|woman), maybe \\d0s(?:, (?:' +
  TRAIT_POOL.map(escapeRegExp).join('|') + '))?', 'g');
// A substituted name token: a capitalized first name as the name
// cultures generate it — letters (including accented, e.g. Tomás),
// with internal apostrophes (Chepng'etich) or hyphens. The
// descriptor it replaces never looks like this (it starts "A ").
const NAME_TOKEN_RE = /^[A-ZÀ-ÖØ-Þ][A-Za-zÀ-öø-ÿ'’\-]*$/;

// The 5 known repro beats, verbatim from sim-detgate-order-a
// §sense-test (seed, day, exact line).
const KNOWN_BEATS = [
  { seed: 107423, day: 7, text: 'Sean sets out with A person, maybe 40s, with deep-set eyes — the fire marks the trail.' },
  { seed: 107425, day: 5, text: 'A person, maybe 40s, with a gap-toothed grin sets out with Lucas — the fire marks the trail.' },
  { seed: 107425, day: 6, text: 'A man, maybe 40s, with a scarred cheek sets out with Desmond — the fire marks the trail.' },
  { seed: 107425, day: 6, text: 'Owen sets out with A man, maybe 20s, with calloused knuckles — the fire marks the trail.' },
  { seed: 107429, day: 5, text: 'DeAndre sets out with A woman, maybe 30s — the fire marks the trail.' },
];

function beatKind(text) {
  if (/marks the trail/.test(text)) return 'depart';
  if (/found a new trail/.test(text)) return 'reseed-launch';
  if (/put down/.test(text)) return 'reseed-expiry';
  return 'other';
}
function descriptorCount(text) {
  const m = String(text).match(/A (?:person|man|woman), maybe \d0s/g);
  return m ? m.length : 0;
}
// lineMatchesAfter(beforeLine, afterLine): the after line equals the
// before line with each full descriptor span replaced by exactly one
// capitalized first name. Pure string check: split the before line
// on descriptor spans, escape the literal parts, join with a
// single-name group, and test the after line against it.
function lineMatchesAfter(beforeLine, afterLine) {
  const parts = String(beforeLine).split(DESCRIPTOR_FULL_RE);
  const descs = String(beforeLine).match(DESCRIPTOR_FULL_RE) || [];
  if (!descs.length) return beforeLine === afterLine;
  const pattern = '^' + parts.map(escapeRegExp).join("([A-ZÀ-ÖØ-Þ][A-Za-zÀ-öø-ÿ'’\\-]*)") + '$';
  let re = null;
  try { re = new RegExp(pattern); } catch (e) { return false; }
  const m = re.exec(String(afterLine));
  if (!m) return false;
  // Every substituted token must be a bare first name (the regex
  // already enforces the shape; this is the explicit shape check).
  for (let i = 1; i < m.length; i++) if (!NAME_TOKEN_RE.test(m[i])) return false;
  return true;
}
function loadCorpus(dir) {
  const out = {};
  for (const f of fs.readdirSync(dir)) {
    if (!/\.json$/.test(f)) continue;
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    out[j.seed] = j;
  }
  return out;
}
function analyze(beforeDir, afterDir) {
  const before = loadCorpus(beforeDir);
  const after = loadCorpus(afterDir);
  const seeds = Object.keys(before).map(Number).sort(function (a, b) { return a - b; });
  const perSeed = {};
  let totalBeatsBefore = 0, totalBeatsAfter = 0;
  let totalDescBefore = 0, totalDescAfter = 0;
  let totalDeathsBefore = 0, totalDeathsAfter = 0;
  let totalLaunchesBefore = 0, totalLaunchesAfter = 0;
  let lineMismatches = [];
  let structMismatches = [];
  let metaMismatches = [];
  const fixedReproLines = [];
  for (const seed of seeds) {
    const b = before[seed], a = after[seed];
    if (!a) { metaMismatches.push({ seed: seed, issue: 'missing after-leg corpus' }); continue; }
    const bb = b.beatLines || [], ab = a.beatLines || [];
    const bd = (b.deaths || []).length, ad = (a.deaths || []).length;
    const bl = (b.v4departs || []).filter(function (r) { return r.result === 'launch'; }).length;
    const al = (a.v4departs || []).filter(function (r) { return r.result === 'launch'; }).length;
    totalBeatsBefore += bb.length; totalBeatsAfter += ab.length;
    totalDeathsBefore += bd; totalDeathsAfter += ad;
    totalLaunchesBefore += bl; totalLaunchesAfter += al;
    let descB = 0, descA = 0;
    const descByKindB = {}, descByKindA = {};
    for (const row of bb) { const n = descriptorCount(row.text); descB += n; totalDescBefore += n; const k = beatKind(row.text); descByKindB[k] = (descByKindB[k] || 0) + n; }
    for (const row of ab) { const n = descriptorCount(row.text); descA += n; totalDescAfter += n; const k = beatKind(row.text); descByKindA[k] = (descByKindA[k] || 0) + n; }
    // Paired-line check: same count, same days in order, each after
    // line a name-substitution of its before line.
    if (bb.length !== ab.length) {
      lineMismatches.push({ seed: seed, issue: 'beat count differs', before: bb.length, after: ab.length });
    } else {
      for (let i = 0; i < bb.length; i++) {
        if (bb[i].day !== ab[i].day) {
          lineMismatches.push({ seed: seed, index: i, issue: 'beat day differs', before: bb[i], after: ab[i] });
          continue;
        }
        if (!lineMatchesAfter(bb[i].text, ab[i].text)) {
          lineMismatches.push({ seed: seed, index: i, issue: 'after line is not a name-substitution of the before line', before: bb[i].text, after: ab[i].text });
        }
      }
    }
    // Structured departBeats must be byte-identical (same
    // departures, same parties, same targets).
    const dbs = JSON.stringify(b.departBeats || []);
    const das = JSON.stringify(a.departBeats || []);
    if (dbs !== das) structMismatches.push({ seed: seed, issue: 'departBeats differ' });
    if (bd !== ad || bl !== al || b.days !== a.days || b.endReason !== a.endReason) {
      metaMismatches.push({ seed: seed, issue: 'run meta differs',
        deathsBefore: bd, deathsAfter: ad, launchesBefore: bl, launchesAfter: al,
        daysBefore: b.days, daysAfter: a.days, endBefore: b.endReason, endAfter: a.endReason });
    }
    // Repro seeds: collect the fixed forms of the known beats.
    if (seed === 107423 || seed === 107425 || seed === 107429) {
      for (let i = 0; i < ab.length; i++) {
        if (bb[i] && DESCRIPTOR_RE.test(bb[i].text) && !DESCRIPTOR_RE.test(ab[i].text)) {
          fixedReproLines.push({ seed: seed, day: ab[i].day, before: bb[i].text, after: ab[i].text });
        }
      }
    }
    perSeed[seed] = { beatsBefore: bb.length, beatsAfter: ab.length,
      descriptorsBefore: descB, descriptorsAfter: descA,
      descByKindBefore: descByKindB, descByKindAfter: descByKindA,
      deathsBefore: bd, deathsAfter: ad, launchesBefore: bl, launchesAfter: al,
      daysBefore: b.days, daysAfter: a.days,
      endBefore: b.endReason, endAfter: a.endReason };
  }
  // B1: known-beat reproduction on the before leg.
  const knownReproduced = [];
  const knownMissing = [];
  for (const kb of KNOWN_BEATS) {
    const corp = before[kb.seed];
    const found = corp && (corp.beatLines || []).some(function (r) { return r.day === kb.day && r.text === kb.text; });
    if (found) knownReproduced.push(kb);
    else knownMissing.push(kb);
  }
  const reproSeeds = [107423, 107425, 107429];
  let reproDescAfter = 0;
  for (const s of reproSeeds) {
    const a = after[s];
    if (!a) continue;
    for (const row of (a.beatLines || [])) reproDescAfter += descriptorCount(row.text);
  }
  const bars = {
    B1_repro: knownReproduced.length >= 4 && reproDescAfter === 0 && knownReproduced.length === fixedReproLines.length,
    B2_band: (function () {
      // Band = every seed EXCEPT the repro seeds.
      const bandSeeds = seeds.filter(function (s) { return reproSeeds.indexOf(s) === -1; });
      for (const s of bandSeeds) {
        const ps = perSeed[s];
        if (!ps) return false;
        if (ps.beatsBefore !== ps.beatsAfter) return false;
        if (ps.descriptorsAfter !== 0) return false;
        if (ps.deathsBefore !== ps.deathsAfter) return false;
        if (ps.launchesBefore !== ps.launchesAfter) return false;
      }
      return lineMismatches.length === 0 && structMismatches.length === 0 && metaMismatches.length === 0;
    })(),
  };
  return { seeds: seeds, perSeed: perSeed,
    totals: { beatsBefore: totalBeatsBefore, beatsAfter: totalBeatsAfter,
      descriptorsBefore: totalDescBefore, descriptorsAfter: totalDescAfter,
      deathsBefore: totalDeathsBefore, deathsAfter: totalDeathsAfter,
      launchesBefore: totalLaunchesBefore, launchesAfter: totalLaunchesAfter },
    knownReproduced: knownReproduced, knownMissing: knownMissing,
    fixedReproLines: fixedReproLines, reproDescriptorsAfter: reproDescAfter,
    lineMismatches: lineMismatches, structMismatches: structMismatches,
    metaMismatches: metaMismatches, bars: bars,
    verdict: (bars.B1_repro && bars.B2_band) ? 'GO' : 'NO-GO' };
}

function selftest() {
  let p = 0, f = 0;
  function check(name, cond, extra) {
    if (cond) { p++; console.log('PASS ' + name); }
    else { f++; console.log('FAIL ' + name + (extra != null ? ' :: ' + JSON.stringify(extra) : '')); }
  }
  check('lineMatchesAfter: single descriptor -> name',
    lineMatchesAfter('Sean sets out with A person, maybe 40s, with deep-set eyes — the fire marks the trail.',
      'Sean sets out with Mara — the fire marks the trail.'));
  check('lineMatchesAfter: holder descriptor -> name',
    lineMatchesAfter('A person, maybe 40s, with a gap-toothed grin sets out with Lucas — the fire marks the trail.',
      'Mara sets out with Lucas — the fire marks the trail.'));
  check('lineMatchesAfter: two descriptors -> two names',
    lineMatchesAfter('A man, maybe 40s, with a long braid sets out with A woman, maybe 30s — the fire marks the trail.',
      'Owen sets out with Mara — the fire marks the trail.'));
  check('lineMatchesAfter: identical lines (no descriptor) match',
    lineMatchesAfter('Sean sets out with Mara after Herald — the fire marks the trail.',
      'Sean sets out with Mara after Herald — the fire marks the trail.'));
  check('lineMatchesAfter: changed target does NOT match',
    !lineMatchesAfter('Sean sets out with Mara after Herald — the fire marks the trail.',
      'Sean sets out with Mara after Eater — the fire marks the trail.'));
  check('lineMatchesAfter: descriptor surviving in after does NOT match',
    !lineMatchesAfter('Sean sets out with A person, maybe 40s, with deep-set eyes — the fire marks the trail.',
      'Sean sets out with A person, maybe 40s, with deep-set eyes — the fire marks the trail.'));
  check('lineMatchesAfter: SYSTEM prefix preserved',
    lineMatchesAfter('📺 SYSTEM: "Sean sets out with A person, maybe 40s, with deep-set eyes — the fire marks the trail."',
      '📺 SYSTEM: "Sean sets out with Mara — the fire marks the trail."'));
  check('lineMatchesAfter: trait-less descriptor -> name',
    lineMatchesAfter('DeAndre sets out with A woman, maybe 30s — the fire marks the trail.',
      'DeAndre sets out with Mara — the fire marks the trail.'));
  check('lineMatchesAfter: reseed-launch line with descriptor holder',
    lineMatchesAfter('A person, maybe 40s, with a gap-toothed grin is hunting Eater now — the fire found a new trail.',
      'Sean is hunting Eater now — the fire found a new trail.'));
  check('lineMatchesAfter: apostrophe name (Chepng\'etich, from nameCultures.json)',
    lineMatchesAfter('A person, maybe 40s, with a gap-toothed grin sets out with Lucas — the fire marks the trail.',
      'Chepng\'etich sets out with Lucas — the fire marks the trail.'));
  check('lineMatchesAfter: accented name (Tomás, from characterGen firstNames)',
    lineMatchesAfter('Sean sets out with A man, maybe 20s, with calloused knuckles — the fire marks the trail.',
      'Sean sets out with Tomás — the fire marks the trail.'));
  check('lineMatchesAfter: multi-name party, one descriptor',
    lineMatchesAfter('Sean sets out with A person, maybe 40s, with deep-set eyes and Emmett after Herald — the fire marks the trail.',
      'Sean sets out with Mara and Emmett after Herald — the fire marks the trail.'));
  check('descriptorCount: two in one line', descriptorCount('A man, maybe 40s, with a long braid sets out with A woman, maybe 30s — the fire marks the trail.') === 2);
  check('descriptorCount: zero on a named line', descriptorCount('Sean sets out with Mara — the fire marks the trail.') === 0);
  check('beatKind: depart', beatKind('Sean sets out with Mara — the fire marks the trail.') === 'depart');
  check('beatKind: reseed-launch', beatKind('Sean is hunting Eater now — the fire found a new trail.') === 'reseed-launch');
  check('beatKind: reseed-expiry', beatKind('Sean was ready to hunt Herald — but the fire says that kind is already put down.') === 'reseed-expiry');
  console.log('analyze-departname-a selftest: ' + p + ' passed, ' + f + ' failed');
  process.exit(f === 0 ? 0 : 1);
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.indexOf('--selftest') !== -1) { selftest(); return; }
  function arg(name) {
    const i = args.indexOf(name);
    return i !== -1 ? args[i + 1] : null;
  }
  const beforeDir = arg('--before'), afterDir = arg('--after'), outPath = arg('--out');
  if (!beforeDir || !afterDir) {
    console.error('Usage: node scripts/analyze-departname-a.js --before <dir> --after <dir> [--out <analysis.json>] [--selftest]');
    process.exit(2);
  }
  const res = analyze(beforeDir, afterDir);
  console.log(JSON.stringify({
    verdict: res.verdict,
    bars: res.bars,
    totals: res.totals,
    knownReproduced: res.knownReproduced.length + '/' + KNOWN_BEATS.length,
    knownMissing: res.knownMissing,
    fixedReproLines: res.fixedReproLines,
    reproDescriptorsAfter: res.reproDescriptorsAfter,
    lineMismatches: res.lineMismatches,
    structMismatches: res.structMismatches,
    metaMismatches: res.metaMismatches,
  }, null, 2));
  if (outPath) fs.writeFileSync(outPath, JSON.stringify(res, null, 2) + '\n');
  process.exit(res.verdict === 'GO' ? 0 : 1);
}
module.exports = { analyze: analyze, lineMatchesAfter: lineMatchesAfter, descriptorCount: descriptorCount, beatKind: beatKind, KNOWN_BEATS: KNOWN_BEATS };
