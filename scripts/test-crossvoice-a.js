// test-crossvoice-a.js — transcript assertions for arm sim-crossvoice-a
// (crossbow/sling/phase_sling volley narration — same defect class
// sim-searvoice-a fixed for the searcaster, leftover per searvoice §5/§6).
// Runs the staged volley fixture (scripts/crossvoice-fixture-a.js) for
// crossbow, sling, phase_sling and the bow control — armed + dry legs,
// armed reruns — then runs the killlootfixture-a legs + --compare (must
// stay GO), then asserts the crossvoice bars frozen in
// evidence/2026-11-22/sim-crossvoice-a-prereg.md §6:
//   S1 crossbow/sling/phase_sling armed voice (crank/whirl, bolt/stone,
//      hit lines OBSERVED at frozen seed 7, miss lines by construction)
//   S2 no bow language AND no gun language in any crossbow/sling/
//      phase_sling transcript (armed or dry)
//   S3 dry lines name the right ammo in weapon words (crank / pouch /
//      bow string), 0 shots
//   S4 bow lines preserved (source-level) AND bows still use them
//      (revised per the searvoice §5 metric review: source presence
//      alone is no longer sufficient once another weapon branches off)
//   S5 killlootfixture-a --compare still GO on the refreshed legs
//   S6 determinism: armed reruns match primaries on judged fields AND
//      on the volley-line slices (all four weapons)
// One command judges everything: node scripts/test-crossvoice-a.js
// (exit 0 = all bars pass). RED before the fix: S1/S2/S3 fail while
// S5/S6 pass — the test detects the defect; mechanics are unchanged.
// Run with the full pilot substrate env (same as the fixture legs):
//   VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1
//   BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1 node scripts/test-crossvoice-a.js
// (arm leg adds KILLBUNDLE=1 internally per killlootfixture leg).
'use strict';
const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const EVIDENCE_DIR = path.join(REPO, 'evidence', '2026-11-22');
const FIXTURE = path.join(REPO, 'scripts', 'crossvoice-fixture-a.js');
const KILLFIXTURE = path.join(REPO, 'scripts', 'test-killlootfixture-a.js');
const FIELDFIGHTS = path.join(REPO, 'src', 'js', 'fieldFights.js');

const SUBSTRATE = {
  VETREENGAGE: '1', PARTYSIZE4: '1', FLEEREPAIR2: '1', FIGHTALLY2: '1',
  SENSEEXPED: '1', BOWOPEN: '1', SPEARGATE: '1', GUNRATE: '1', CELLGATE: '1',
  KILLLOOTFIXTURE_EVIDENCE_DIR: path.join('evidence', '2026-11-22'),
  CROSSVOICE_EVIDENCE_DIR: path.join('evidence', '2026-11-22'),
  CROSSVOICE_SEED: '7',
};

const WEAPONS = ['crossbow', 'sling', 'phase_sling', 'bow'];
// Frozen expected voice per weapon (prereg §2). <name> is the data name.
const VOICE = {
  crossbow: {
    opening: 'cranks a bolt into place', closing: 'lowers the Crossbow',
    ammoNoun: 'the bolt', ammoPlural: 'no crossbow bolts',
    dryTail: 'the crank clicks on nothing',
    missSrc: 'loosed wide — the bolt buries itself in the dirt. (spent)',
  },
  sling: {
    opening: 'whirls the Sling', closing: 'lowers the Sling',
    ammoNoun: 'the stone', ammoPlural: 'no stones',
    dryTail: 'the pouch hangs empty',
    missSrc: 'loosed wide — the stone skips away into the dirt. (spent)',
  },
  phase_sling: {
    opening: 'whirls the Phase sling', closing: 'lowers the Phase sling',
    ammoNoun: 'the stone', ammoPlural: 'no stones',
    dryTail: 'the pouch hangs empty',
    missSrc: 'loosed wide — the stone skips away into the dirt. (spent)',
  },
  bow: {
    opening: 'nocks an arrow', closing: 'lowers the bow',
    ammoNoun: 'the arrow', ammoPlural: 'no arrows',
    dryTail: 'the string stays drawn, useless',
    missSrc: 'loosed wide — the arrow buries itself in the dirt. (spent)',
  },
};
const NON_BOW = ['crossbow', 'sling', 'phase_sling'];

function runFixture(script, args, extraEnv) {
  const env = Object.assign({}, process.env, SUBSTRATE, extraEnv || {});
  const r = spawnSync('node', [script].concat(args || []), { cwd: REPO, env: env, stdio: 'inherit' });
  return (r.status === 0);
}
function loadJson(f) {
  try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return null; }
}
function judgedFields(out) {
  return {
    ammoAtArrival: out.ammoAtArrival,
    volley: out.volley,
    outcome: out.outcome, rounds: out.rounds,
    mHpLeft: out.mHpLeft, vHpLeft: out.vHpLeft,
    holderAlive: out.holderAlive, ammoAfterFight: out.ammoAfterFight,
  };
}
// Volley lines, identified wording-independently (prereg §3): the
// opening line carries 'the fight opens at range'; the closing line
// carries 'is on them now'; shot lines are the two-space-indented
// lines strictly between them. The dry line carries 'but no '.
function volleyLines(log) {
  const lines = (log || []).map(String);
  const oi = lines.findIndex(function (l) { return l.indexOf('the fight opens at range') !== -1; });
  const ci = lines.findIndex(function (l) { return l.indexOf('is on them now') !== -1; });
  const opening = oi === -1 ? null : lines[oi];
  const closing = ci === -1 ? null : lines[ci];
  let shots = [];
  if (oi !== -1 && ci !== -1 && ci > oi) {
    shots = lines.slice(oi + 1, ci).filter(function (l) { return l.indexOf('  ') === 0; });
  }
  const dry = lines.find(function (l) { return l.indexOf('but no ') !== -1; }) || null;
  return { opening: opening, shots: shots, closing: closing, dry: dry };
}
const BOW_PHRASES = ['nocks an arrow', 'the arrow', 'lowers the bow', 'string stays drawn'];
const GUN_PHRASES = ['Searcaster', 'fires', 'cell spent', 'trigger'];
function phraseHits(log, phrases) {
  const hits = [];
  for (const l of (log || []).map(String)) {
    for (const p of phrases) if (l.indexOf(p) !== -1) hits.push(p + ' :: ' + l.slice(0, 100));
  }
  return hits;
}

function main() {
  const errors = [];
  if (process.env.CELLGATE !== '1') { console.error('CROSSVOICE STOP: CELLGATE=1 required (all legs).'); process.exit(2); }
  if (process.env.FIGHTALLY2 !== '1') { console.error('CROSSVOICE STOP: FIGHTALLY2=1 required (all legs).'); process.exit(2); }
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });

  // --- crossvoice legs (each must exit 0: setup gate passes) ---
  const legs = {};
  for (const w of WEAPONS) {
    legs[w + '-armed'] = runFixture(FIXTURE, [], { CROSSVOICE_WEAPON: w, CROSSVOICE_AMMO: '4' });
    legs[w + '-dry'] = runFixture(FIXTURE, [], { CROSSVOICE_WEAPON: w, CROSSVOICE_AMMO: '0' });
    legs[w + '-armed-rerun'] = runFixture(FIXTURE, ['rerun'], { CROSSVOICE_WEAPON: w, CROSSVOICE_AMMO: '4' });
  }
  for (const k of Object.keys(legs)) if (!legs[k]) errors.push('crossvoice leg failed: ' + k);

  // --- killlootfixture legs + compare (S5) ---
  const kl = {};
  kl.ctl = runFixture(KILLFIXTURE, [], {});
  kl.arm = runFixture(KILLFIXTURE, [], { KILLBUNDLE: '1' });
  kl.ctlRerun = runFixture(KILLFIXTURE, ['rerun'], {});
  kl.armRerun = runFixture(KILLFIXTURE, ['rerun'], { KILLBUNDLE: '1' });
  for (const k of Object.keys(kl)) if (!kl[k]) errors.push('killlootfixture leg failed: ' + k);
  let compareOk = false, compareOut = '';
  try {
    const env = Object.assign({}, process.env, SUBSTRATE);
    const r = spawnSync('node', [KILLFIXTURE, '--compare'], { cwd: REPO, env: env, encoding: 'utf8' });
    compareOut = (r.stdout || '') + (r.stderr || '');
    compareOk = (r.status === 0);
  } catch (e) { errors.push('compare threw: ' + String(e.message).slice(0, 80)); }
  console.log(compareOut);
  if (!compareOk) errors.push('killlootfixture --compare did not exit 0 (S5)');

  // --- load leg JSONs ---
  function leg(w, mode) {
    return loadJson(path.join(EVIDENCE_DIR, 'crossvoice-a-' + w + '-' + mode + '.json'));
  }
  const armed = {}, dry = {}, armedR = {};
  for (const w of WEAPONS) {
    armed[w] = leg(w, 'armed');
    dry[w] = leg(w, 'dry');
    armedR[w] = leg(w, 'armed-rerun');
    if (!armed[w] || !dry[w]) { console.error('CROSSVOICE STOP: missing leg JSONs for ' + w + '.'); process.exit(2); }
    if ((armed[w].instrumentErrors || []).length) errors.push(w + ' armed instrument errors: ' + JSON.stringify(armed[w].instrumentErrors));
    if ((dry[w].instrumentErrors || []).length) errors.push(w + ' dry instrument errors: ' + JSON.stringify(dry[w].instrumentErrors));
  }

  const bars = {};
  const notes = [];
  let src = '';
  try { src = fs.readFileSync(FIELDFIGHTS, 'utf8'); } catch (e) { errors.push('cannot read fieldFights.js'); }

  // S1 — crossbow/sling/phase_sling armed voice (frozen lines + observed hits).
  const s1 = [];
  for (const w of NON_BOW) {
    const v = VOICE[w];
    const out = armed[w];
    const vl = volleyLines(out.log);
    if (!vl.opening || vl.opening.indexOf(v.opening) === -1) s1.push(w + ' opening lacks "' + v.opening + '": ' + JSON.stringify(vl.opening));
    if (!vl.closing || vl.closing.indexOf(v.closing) === -1) s1.push(w + ' closing lacks "' + v.closing + '": ' + JSON.stringify(vl.closing));
    const wantShots = (out.volley && out.volley.shots) || 0;
    if (vl.shots.length !== wantShots) s1.push(w + ' shot lines ' + vl.shots.length + ' !== volley.shots ' + wantShots);
    for (const s of vl.shots) {
      if (s.indexOf(v.ammoNoun) === -1) s1.push(w + ' shot line lacks "' + v.ammoNoun + '": ' + JSON.stringify(s));
      if (s.indexOf('wide') !== -1 && s.indexOf('(spent)') === -1) s1.push(w + ' miss line lacks "(spent)": ' + JSON.stringify(s));
      if (s.indexOf('wide') === -1 && s.indexOf('takes') === -1) s1.push(w + ' hit line lacks "takes": ' + JSON.stringify(s));
    }
    // Hit line OBSERVED (frozen seed 7: crossbow 3/3, sling 2/2, phase_sling 2/2).
    if (!out.volley || (out.volley.hits || 0) < 1) s1.push(w + ' no hit line observed (volley.hits=' + JSON.stringify(out.volley && out.volley.hits) + ')');
    // Miss line is unobserved at seed 7 (every shot hit) — asserted by
    // construction: the frozen miss string must exist verbatim in source.
    if (src.indexOf(v.missSrc) === -1) s1.push(w + ' frozen miss string missing from source: ' + JSON.stringify(v.missSrc));
  }
  bars.S1 = s1.length === 0;
  if (!bars.S1) notes.push('S1: ' + s1.join(' | '));

  // S2 — no bow language AND no gun language anywhere in the
  // crossbow/sling/phase_sling transcripts (armed + dry).
  const s2 = [];
  for (const w of NON_BOW) {
    for (const mode of ['armed', 'dry']) {
      const out = (mode === 'armed') ? armed[w] : dry[w];
      const bow = phraseHits(out.log, BOW_PHRASES);
      if (bow.length) s2.push(w + ' ' + mode + ' bow language: ' + JSON.stringify(bow));
      const gun = phraseHits(out.log, GUN_PHRASES);
      if (gun.length) s2.push(w + ' ' + mode + ' gun language: ' + JSON.stringify(gun));
    }
  }
  bars.S2 = s2.length === 0;
  if (!bars.S2) notes.push('S2: ' + s2.join(' | '));

  // S3 — dry lines name the right ammo in weapon words, 0 shots.
  const s3 = [];
  for (const w of WEAPONS) {
    const v = VOICE[w];
    const out = dry[w];
    const vl = volleyLines(out.log);
    if (!vl.dry) s3.push(w + ' dry: no line with "but no "');
    else {
      if (vl.dry.indexOf(v.ammoPlural) === -1) s3.push(w + ' dry lacks "' + v.ammoPlural + '": ' + JSON.stringify(vl.dry));
      if (vl.dry.indexOf(v.dryTail) === -1) s3.push(w + ' dry lacks "' + v.dryTail + '": ' + JSON.stringify(vl.dry));
    }
    if (!out.volley || out.volley.shots !== 0) s3.push(w + ' dry volley.shots !== 0: ' + JSON.stringify(out.volley));
    if (NON_BOW.indexOf(w) !== -1) {
      const bow = phraseHits(out.log, ['string stays drawn']);
      if (bow.length) s3.push(w + ' dry still says "string stays drawn": ' + JSON.stringify(bow));
    }
  }
  bars.S3 = s3.length === 0;
  if (!bars.S3) notes.push('S3: ' + s3.join(' | '));

  // S4 — bow lines preserved (source-level) AND bows still use them.
  // (Revised per the searvoice §5 metric review: source presence alone
  // is no longer sufficient once another weapon branches off.)
  const s4 = [];
  const bowSrc = ['nocks an arrow', 'loosed — it takes', 'loosed wide — the arrow buries itself in the dirt. (spent)', 'lowers the bow'];
  for (const p of bowSrc) if (src.indexOf(p) === -1) s4.push('missing bow string in source: ' + JSON.stringify(p));
  const bowV = volleyLines(armed.bow.log);
  if (!bowV.opening || bowV.opening.indexOf('nocks an arrow') === -1) s4.push('bow armed opening no longer "nocks an arrow": ' + JSON.stringify(bowV.opening));
  if (!bowV.closing || bowV.closing.indexOf('lowers the bow') === -1) s4.push('bow armed closing no longer "lowers the bow": ' + JSON.stringify(bowV.closing));
  const bowDryV = volleyLines(dry.bow.log);
  if (!bowDryV.dry || bowDryV.dry.indexOf('string stays drawn') === -1) s4.push('bow dry line no longer "string stays drawn": ' + JSON.stringify(bowDryV.dry));
  // Bow shot lines must still be the old bow lines, byte-identical.
  for (const s of bowV.shots) {
    if (s.indexOf('loosed — it takes') === -1 && s.indexOf('loosed wide — the arrow buries itself in the dirt. (spent)') === -1) {
      s4.push('bow shot line is not the old bow line: ' + JSON.stringify(s));
    }
  }
  if (bowV.shots.length !== ((armed.bow.volley && armed.bow.volley.shots) || 0)) s4.push('bow shot lines ' + bowV.shots.length + ' !== volley.shots ' + JSON.stringify(armed.bow.volley));
  bars.S4 = s4.length === 0;
  if (!bars.S4) notes.push('S4: ' + s4.join(' | '));

  // S5 — killlootfixture compare GO (from the run above).
  bars.S5 = compareOk;

  // S6 — determinism: armed reruns match primaries on judged fields
  // AND volley-line slices (all four weapons).
  const s6 = [];
  for (const w of WEAPONS) {
    if (armedR[w]) {
      if (JSON.stringify(judgedFields(armedR[w])) !== JSON.stringify(judgedFields(armed[w]))) s6.push(w + ' rerun judged fields differ');
      if (JSON.stringify(volleyLines(armedR[w].log)) !== JSON.stringify(volleyLines(armed[w].log))) s6.push(w + ' rerun volley lines differ');
    } else s6.push(w + ' missing armed rerun JSON');
  }
  bars.S6 = s6.length === 0;
  if (!bars.S6) notes.push('S6: ' + s6.join(' | '));

  const go = bars.S1 && bars.S2 && bars.S3 && bars.S4 && bars.S5 && bars.S6 && errors.length === 0;
  const volleySummary = {};
  for (const w of WEAPONS) {
    volleySummary[w] = {
      armed: armed[w].volley, dry: dry[w].volley,
      armedLines: volleyLines(armed[w].log), dryLine: volleyLines(dry[w].log).dry,
    };
  }
  console.log(JSON.stringify({
    verdict: go ? 'GO' : 'NO-GO',
    bars: bars,
    volleySummary: volleySummary,
    killlootCompare: compareOk,
    errors: errors,
    notes: notes,
  }, null, 2));
  process.exit(go ? 0 : 1);
}

if (require.main === module) { main(); }
module.exports = { volleyLines: volleyLines, phraseHits: phraseHits };
