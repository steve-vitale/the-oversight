// test-searvoice-a.js — transcript assertions for arm sim-searvoice-a
// (searcaster volley narration as a gun, finding #2623 + the 2026-11-21
// narration finding). Runs the forced-arrival fixture
// (scripts/test-killlootfixture-a.js) both legs (+ determinism reruns)
// into evidence/2026-11-22/ via KILLLOOTFIXTURE_EVIDENCE_DIR, runs the
// fixture's --compare (must stay GO), then asserts the searvoice bars
// frozen in evidence/2026-11-22/sim-searvoice-a-prereg.md §6:
//   S1 arm volley lines carry gun language (raises/fires/cell spent)
//   S2 whole arm transcript has NO bow language
//   S3 ctl keeps the honest dry-gun line (no fusion cells + trigger)
//   S4 bow lines preserved verbatim in fieldFights.js (source-level)
//   S5 fixture --compare still GO on the refreshed legs
//   S6 determinism: rerun legs match primaries on judged fields AND
//      on the volley-line slices
// One command judges everything: node scripts/test-searvoice-a.js
// (exit 0 = all bars pass). RED before the fix: S1/S2/S3 fail while
// S5 passes — the test detects the defect; mechanics are unchanged.
// Run with the full pilot substrate env (same as the fixture legs):
//   VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1
//   BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1 node scripts/test-searvoice-a.js
// (arm leg adds KILLBUNDLE=1 internally per leg).
'use strict';
const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const EVIDENCE_DIR = path.join(REPO, 'evidence', '2026-11-22');
const FIXTURE = path.join(REPO, 'scripts', 'test-killlootfixture-a.js');
const FIELDFIGHTS = path.join(REPO, 'src', 'js', 'fieldFights.js');

const SUBSTRATE = {
  VETREENGAGE: '1', PARTYSIZE4: '1', FLEEREPAIR2: '1', FIGHTALLY2: '1',
  SENSEEXPED: '1', BOWOPEN: '1', SPEARGATE: '1', GUNRATE: '1', CELLGATE: '1',
  KILLLOOTFIXTURE_EVIDENCE_DIR: path.join('evidence', '2026-11-22'),
};

function runFixture(args, extraEnv) {
  const env = Object.assign({}, process.env, SUBSTRATE, extraEnv || {});
  const r = spawnSync('node', [FIXTURE].concat(args || []), { cwd: REPO, env: env, stdio: 'inherit' });
  return (r.status === 0);
}
function loadJson(f) {
  try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return null; }
}
function judgedFields(out) {
  return {
    cellsAtArrival: out.cellsAtArrival,
    volley: out.volley,
    outcome: out.outcome, rounds: out.rounds,
    mHpLeft: out.mHpLeft, vHpLeft: out.vHpLeft,
    holderAlive: out.holderAlive, cellsAfterFight: out.cellsAfterFight,
  };
}
// Volley lines, identified wording-independently (prereg §3): the
// opening line carries 'the fight opens at range'; shot lines start
// with two spaces and carry 'loosed' or 'fires'; the closing line
// carries 'is on them now'.
function volleyLines(log) {
  const lines = (log || []).map(String);
  const opening = lines.find(function (l) { return l.indexOf('the fight opens at range') !== -1; }) || null;
  const shots = lines.filter(function (l) { return l.indexOf('  ') === 0 && (l.indexOf('loosed') !== -1 || l.indexOf('fires') !== -1); });
  const closing = lines.find(function (l) { return l.indexOf('is on them now') !== -1; }) || null;
  return { opening: opening, shots: shots, closing: closing };
}
const BOW_PHRASES = ['nocks an arrow', 'the arrow', 'lowers the bow', 'string stays drawn'];
function bowHits(log) {
  const hits = [];
  for (const l of (log || []).map(String)) {
    for (const p of BOW_PHRASES) if (l.indexOf(p) !== -1) hits.push(p + ' :: ' + l.slice(0, 100));
  }
  return hits;
}

function main() {
  const errors = [];
  if (process.env.CELLGATE !== '1') { console.error('SEARVOICE STOP: CELLGATE=1 required (both legs).'); process.exit(2); }
  if (process.env.FIGHTALLY2 !== '1') { console.error('SEARVOICE STOP: FIGHTALLY2=1 required (both legs).'); process.exit(2); }
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });

  // --- fixture legs (each must exit 0: setup gate passes) ---
  const legsOk = {};
  legsOk.ctl = runFixture([], {});
  legsOk.arm = runFixture([], { KILLBUNDLE: '1' });
  legsOk.ctlRerun = runFixture(['rerun'], {});
  legsOk.armRerun = runFixture(['rerun'], { KILLBUNDLE: '1' });
  for (const k of Object.keys(legsOk)) if (!legsOk[k]) errors.push('fixture leg failed: ' + k);

  // --- S5: fixture compare still GO ---
  let compareOk = false, compareOut = '';
  try {
    const env = Object.assign({}, process.env, SUBSTRATE);
    const r = spawnSync('node', [FIXTURE, '--compare'], { cwd: REPO, env: env, encoding: 'utf8' });
    compareOut = (r.stdout || '') + (r.stderr || '');
    compareOk = (r.status === 0);
  } catch (e) { errors.push('compare threw: ' + String(e.message).slice(0, 80)); }
  console.log(compareOut);
  if (!compareOk) errors.push('fixture --compare did not exit 0 (S5)');

  const ctl = loadJson(path.join(EVIDENCE_DIR, 'killlootfixture-a-ctl.json'));
  const arm = loadJson(path.join(EVIDENCE_DIR, 'killlootfixture-a-arm.json'));
  const ctlR = loadJson(path.join(EVIDENCE_DIR, 'killlootfixture-a-ctl-rerun.json'));
  const armR = loadJson(path.join(EVIDENCE_DIR, 'killlootfixture-a-arm-rerun.json'));
  if (!ctl || !arm) { console.error('SEARVOICE STOP: missing leg JSONs.'); process.exit(2); }

  const bars = {};
  const notes = [];
  const armV = volleyLines(arm.log);
  const ctlV = volleyLines(ctl.log);

  // S1 — arm gun voice.
  const s1 = [];
  if (!armV.opening || armV.opening.indexOf('raises the Searcaster') === -1) s1.push('opening lacks "raises the Searcaster": ' + JSON.stringify(armV.opening));
  if (!armV.closing || armV.closing.indexOf('lowers the Searcaster') === -1) s1.push('closing lacks "lowers the Searcaster": ' + JSON.stringify(armV.closing));
  const wantShots = (arm.volley && arm.volley.shots) || 0;
  if (armV.shots.length !== wantShots) s1.push('shot lines ' + armV.shots.length + ' !== volley.shots ' + wantShots);
  for (const s of armV.shots) {
    if (s.indexOf('fires') === -1) s1.push('shot line lacks "fires": ' + JSON.stringify(s));
    if (s.indexOf('wide') !== -1 && s.indexOf('(cell spent)') === -1) s1.push('miss line lacks "(cell spent)": ' + JSON.stringify(s));
  }
  bars.S1 = s1.length === 0;
  if (!bars.S1) notes.push('S1: ' + s1.join(' | '));

  // S2 — arm: no bow language anywhere in the transcript.
  const armBow = bowHits(arm.log);
  bars.S2 = armBow.length === 0;
  if (!bars.S2) notes.push('S2: bow language in arm log: ' + JSON.stringify(armBow));

  // S3 — ctl: honest dry-gun line, no bow wording, 0 shots.
  const s3 = [];
  const ctlLog = (ctl.log || []).map(String);
  const dryLine = ctlLog.find(function (l) { return l.indexOf('no fusion cells') !== -1; }) || null;
  if (!dryLine) s3.push('no line with "no fusion cells"');
  else if (dryLine.indexOf('trigger') === -1) s3.push('dry line lacks "trigger": ' + JSON.stringify(dryLine));
  const ctlBow = bowHits(ctl.log);
  if (ctlBow.length) s3.push('bow language in ctl log: ' + JSON.stringify(ctlBow));
  if (!ctl.volley || ctl.volley.shots !== 0) s3.push('ctl volley.shots !== 0: ' + JSON.stringify(ctl.volley));
  bars.S3 = s3.length === 0;
  if (!bars.S3) notes.push('S3: ' + s3.join(' | '));

  // S4 — bow lines preserved verbatim in the source.
  const s4 = [];
  let src = '';
  try { src = fs.readFileSync(FIELDFIGHTS, 'utf8'); } catch (e) { s4.push('cannot read fieldFights.js'); }
  const bowSrc = ['nocks an arrow', 'loosed — it takes', 'loosed wide — the arrow buries itself in the dirt. (spent)', 'lowers the bow'];
  for (const p of bowSrc) if (src.indexOf(p) === -1) s4.push('missing bow string in source: ' + JSON.stringify(p));
  bars.S4 = s4.length === 0;
  if (!bars.S4) notes.push('S4: ' + s4.join(' | '));

  // S5 — fixture compare GO (from the run above).
  bars.S5 = compareOk;

  // S6 — determinism: reruns match primaries on judged fields AND volley lines.
  const s6 = [];
  if (ctlR) {
    if (JSON.stringify(judgedFields(ctlR)) !== JSON.stringify(judgedFields(ctl))) s6.push('ctl rerun judged fields differ');
    if (JSON.stringify(volleyLines(ctlR.log)) !== JSON.stringify(ctlV)) s6.push('ctl rerun volley lines differ');
  } else s6.push('missing ctl rerun JSON');
  if (armR) {
    if (JSON.stringify(judgedFields(armR)) !== JSON.stringify(judgedFields(arm))) s6.push('arm rerun judged fields differ');
    if (JSON.stringify(volleyLines(armR.log)) !== JSON.stringify(armV)) s6.push('arm rerun volley lines differ');
  } else s6.push('missing arm rerun JSON');
  bars.S6 = s6.length === 0;
  if (!bars.S6) notes.push('S6: ' + s6.join(' | '));

  const go = bars.S1 && bars.S2 && bars.S3 && bars.S4 && bars.S5 && bars.S6 && errors.length === 0;
  console.log(JSON.stringify({
    verdict: go ? 'GO' : 'NO-GO',
    bars: bars,
    armVolley: arm.volley, ctlVolley: ctl.volley,
    armVolleyLines: armV, ctlVolleyLines: ctlV,
    ctlDryLine: dryLine,
    errors: errors,
    notes: notes,
  }, null, 2));
  process.exit(go ? 0 : 1);
}

if (require.main === module) { main(); }
module.exports = { volleyLines: volleyLines, bowHits: bowHits };
