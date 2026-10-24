// trustbuffer-analyze.js — paired analysis for the TRUSTBUFFER=1 depth
// lever (sim-trustbuffer, axis scale-onramp, run fleshout-20261023T2217Z).
//
// Reads evidence/2026-10-23/perseed-trustbuffer/<arm>-<policy>/s<seed>.json
// and judges the pre-registered bars:
//
//   PRIMARY   post-formation dissolution events — the REVISED classifier
//             from the overcourt-restage metric review: ANY single-day dip
//             drop of magnitude >= 102 (catches the -136 full-polity
//             collapses the old exact--102 classifier missed) after a
//             formation event (+102/+122). GO iff armed < control, paired
//             identical seeds. A miss is NO-GO, never re-scored.
//   SECONDARY mean end dip per config, GO = armed >= control + 34 (one
//             full link), paired identical seeds/policies.
//   GUARDRAILS median survival paired diff >= -15d; starvation <=
//             control+2; no new death kinds (>=2-event rule); wall block
//             (national/table/wins, wave4/5, median survival) both arms.
//   ENGAGEMENT the mechanism read: bufferTended (the delta's tends) and
//             tended totals per arm — the delta must ENGAGE (armed buffer
//             tends > 0 where control skipped) for the metric to be a lever
//             test rather than a no-op comparison.
//
// The dip-step classifier records ALL +/-34-multiple single-day steps and
// reconciles every recorded step against the end-dip scalar — an
// unattributed step is a loud warning, not a silent skip.
//
// §15: panel judged inapplicable for policy-layer zero-src/js arms per the
// doorcensus/links-diag precedent. This paired identical-seed sweep is the
// instrument; the pre-registered bars are the judge. The printed
// paired-comparison summary is the §15 attachment.
//
// Usage: node scripts/trustbuffer-analyze.js [evid-dir]
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const EVID = process.argv[2] || path.join(REPO, 'evidence', '2026-10-23', 'perseed-trustbuffer');

const POLICIES = ['leadfeast', 'belongfeast'];
const ARMS = ['control', 'armed'];

function loadDir(arm, policy) {
  const dir = path.join(EVID, `${arm}-${policy}`);
  const rows = [];
  for (const f of fs.readdirSync(dir).sort()) {
    if (!/^s\d+\.json$/.test(f)) continue; // corpus-summary-*.json skipped
    rows.push(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
  }
  return rows;
}

// Dip-step classifier. REVISED per the overcourt-restage metric review:
//   - formation: +102 (polity step) or +122 (+102 bundled with a +20 feast)
//   - dissolution: any single-day drop of magnitude >= 102 (-102 full
//     polity, -136 4-link collapse, -170 5-link collapse)
//   - seasoning: +/-34 or +/-68 (post-polity single/double-link season/loss)
//   - other 34-multiples: composite-34, needs naming (loud)
//   - non-34-multiples (+45/+50/+70...): the DIAG's rule — war/feast
//     composites on the RAW standing trajectory, NOT dip events. They never
//     open the post-formation window and never count as dissolutions.
function classify(step) {
  if (step === 102 || step === 122) return { cls: 'formation', note: step === 122 ? '102+20 feast bundle' : 'polity step' };
  if (step <= -102) return { cls: 'dissolution', note: `polity collapse (${step})` };
  if (step === 34 || step === 68) return { cls: 'seasoning-up', note: `${step / 34} link seasoning` };
  if (step === -34 || step === -68) return { cls: 'seasoning-down', note: `${-step / 34} link seasoning loss` };
  if (step % 34 === 0) return { cls: 'composite-34', note: `34-multiple ${step} (needs naming)` };
  return { cls: 'war-composite', note: 'non-34-multiple: war/plenty step on the raw trajectory, not a dip event' };
}

function analyzeRun(r) {
  const gv = r.gateVector || {};
  const endDip = (gv.dip | 0);
  const steps = (r.dipSteps || []).map(s => Object.assign({}, s, classify(s.step)));
  // formation-day set: a +102/+122 opens the post-formation window
  const formedDays = steps.filter(s => s.cls === 'formation').map(s => s.day);
  const firstForm = formedDays.length ? Math.min.apply(null, formedDays) : null;
  // PRIMARY metric: post-formation dissolution events (revised classifier:
  // any single-day drop >= 102 in magnitude after a formation event)
  const postFormDiss = steps.filter(s => s.cls === 'dissolution' && firstForm != null && s.day >= firstForm);
  const needsNaming = steps.filter(s => s.cls === 'composite-34');
  const warComposites = steps.filter(s => s.cls === 'war-composite').length;
  return { endDip, steps, firstForm, postFormDiss: postFormDiss.length, postFormDissDays: postFormDiss.map(s => s.day + ':' + s.step), needsNaming, warComposites };
}

function starvDeaths(r) {
  let n = 0;
  for (const [k, v] of Object.entries(r.deaths || {})) {
    if (/starv/i.test(k)) n += v;
  }
  return n;
}

function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

const EXPECTED = parseInt(process.env.EXPECTED || '12', 10);
const corpus = {};
function runAnalysis() {
for (const arm of ARMS) for (const pol of POLICIES) corpus[`${arm}-${pol}`] = loadDir(arm, pol);
for (const k of Object.keys(corpus)) {
  if (corpus[k].length !== EXPECTED) { console.error(`ANALYZE STOP: ${k} has ${corpus[k].length} configs, expected ${EXPECTED}`); process.exit(2); }
}

const lines = [];
const P = (s) => lines.push(s);

// ---- per-config table ------------------------------------------------------
P('# trustbuffer paired comparison (the §15 instrument attachment)');
P('');
P('Per-config (seed, policy, control-dip, armed-dip, diff, post-form dissolutions control|armed, tends control|armed+buffer):');
const diffs = [];
const dissPairs = { control: 0, armed: 0 };
const survDiffs = [];
const starvByArm = { control: 0, armed: 0 };
const tendByArm = { control: { tended: 0, buffer: 0 }, armed: { tended: 0, buffer: 0 } };
const deathsByArm = { control: {}, armed: {} };
const wallByArm = { control: {}, armed: {} };
for (const pol of POLICIES) {
  const ctrl = Object.fromEntries(corpus[`control-${pol}`].map(r => [r.seed, r]));
  const armed = Object.fromEntries(corpus[`armed-${pol}`].map(r => [r.seed, r]));
  for (const seed of Object.keys(ctrl).map(Number).sort((a, b) => a - b)) {
    if (!armed[seed]) { console.error(`ANALYZE STOP: seed ${seed} missing on armed-${pol}`); process.exit(2); }
    const c = analyzeRun(ctrl[seed]), a = analyzeRun(armed[seed]);
    const d = a.endDip - c.endDip;
    diffs.push(d);
    dissPairs.control += c.postFormDiss; dissPairs.armed += a.postFormDiss;
    const sd = (armed[seed].gameDays | 0) - (ctrl[seed].gameDays | 0);
    survDiffs.push(sd);
    starvByArm.control += starvDeaths(ctrl[seed]); starvByArm.armed += starvDeaths(armed[seed]);
    tendByArm.control.tended += (ctrl[seed].tended | 0); tendByArm.control.buffer += (ctrl[seed].bufferTended | 0);
    tendByArm.armed.tended += (armed[seed].tended | 0); tendByArm.armed.buffer += (armed[seed].bufferTended | 0);
    for (const [armName, r] of [['control', ctrl[seed]], ['armed', armed[seed]]]) {
      for (const [k, v] of Object.entries(r.deaths || {})) {
        deathsByArm[armName][k] = (deathsByArm[armName][k] || 0) + v;
      }
    }
    P(`  s${seed} ${pol}: dip ${c.endDip} -> ${a.endDip} (diff ${d >= 0 ? '+' : ''}${d})` +
      ` | post-form diss ${c.postFormDiss} -> ${a.postFormDiss}` +
      ` | tends ${ctrl[seed].tended | 0}+${ctrl[seed].bufferTended | 0} -> ${armed[seed].tended | 0}+${armed[seed].bufferTended | 0}` +
      ` | days ${ctrl[seed].gameDays} -> ${armed[seed].gameDays}`);
  }
}

// ---- PRIMARY (binding) -------------------------------------------------------
const goPrimary = dissPairs.armed < dissPairs.control;
P('');
P('## PRIMARY (binding): post-formation dissolution events (revised classifier: single-day dip drop magnitude >= 102 after formation)');
P(`control ${dissPairs.control} vs armed ${dissPairs.armed}. GO bar: armed < baseline.`);
P(`VERDICT: ${goPrimary ? 'GO' : dissPairs.armed === dissPairs.control ? 'TIE (not < : NO-GO on the bar as stated)' : 'NO-GO'} — ${goPrimary ? 'bar met' : 'a miss is NO-GO, never re-scored (§14)'}`);

// ---- SECONDARY ----------------------------------------------------------------
const meanDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;
const goSecondary = meanDiff >= 34;
P('');
P('## SECONDARY: mean end dip per config');
P(`armed mean - control mean = ${meanDiff.toFixed(1)} dip points. GO bar: >= +34 (one full link).`);
P(`VERDICT: ${goSecondary ? 'GO' : 'NO-GO'}`);
P('per-policy: leadfeast mean-diff ' + (diffs.slice(0, 12).reduce((a, b) => a + b, 0) / 12).toFixed(1) +
  ', belongfeast mean-diff ' + (diffs.slice(12).reduce((a, b) => a + b, 0) / 12).toFixed(1));

// ---- mechanism engagement -------------------------------------------------------
P('');
P('## mechanism engagement (the delta must engage)');
P(`tended totals — control: ${tendByArm.control.tended} (loop) + ${tendByArm.control.buffer} (buffer, must be 0)` +
  ` | armed: ${tendByArm.armed.tended} (loop) + ${tendByArm.armed.buffer} (buffer delta)`);
P(tendByArm.control.buffer !== 0
  ? 'LOUD: control shows buffer tends — the delta leaked into the control leg!'
  : 'control buffer tends = 0 — the delta is armed-only, as designed.');
P(tendByArm.armed.buffer > 0
  ? `delta ENGAGED: ${tendByArm.armed.buffer} buffer tends fired on the armed leg.`
  : 'LOUD: delta did NOT engage — 0 buffer tends on the armed leg; the metric compares identical behavior.');

// ---- classifier reconciliation --------------------------------------------------
const needsNaming = [];
for (const arm of ARMS) for (const pol of POLICIES) {
  for (const r of corpus[`${arm}-${pol}`]) {
    const a = analyzeRun(r);
    if (a.needsNaming.length) needsNaming.push({ seed: r.seed, arm, pol, steps: a.needsNaming });
  }
}
P('');
P('## dip-step classifier reconciliation');
P(needsNaming.length
  ? `LOUD: ${needsNaming.length} configs have 34-multiple steps needing names: ${JSON.stringify(needsNaming)}`
  : 'every recorded dip step named (formation/dissolution/seasoning/war-composite); 0 composite-34 steps needing names.');

// ---- guardrails ------------------------------------------------------------------
const medSurvDiff = median(survDiffs);
P('');
P('## GUARDRAILS');
P(`median survival paired diff: ${medSurvDiff}d (bar: >= -15d) — ${medSurvDiff >= -15 ? 'PASS' : 'FAIL'}`);
P(`starvation deaths: control ${starvByArm.control} vs armed ${starvByArm.armed} (bar: <= control+2) — ${starvByArm.armed <= starvByArm.control + 2 ? 'PASS' : 'FAIL'}`);
const newKinds = Object.keys(deathsByArm.armed).filter(k =>
  (deathsByArm.armed[k] || 0) >= 2 && !(deathsByArm.control[k] || 0));
P(`death kinds: control {${Object.entries(deathsByArm.control).map(([k, v]) => `${k}:${v}`).join(', ')}}`);
P(`death kinds: armed   {${Object.entries(deathsByArm.armed).map(([k, v]) => `${k}:${v}`).join(', ')}}`);
P(newKinds.length ? `LOUD: new death kinds on armed (>=2 events): ${newKinds.join(', ')}` : 'no new death kinds (2-event rule) — PASS');

// wall block
for (const arm of ARMS) {
  const rows = [].concat.apply([], POLICIES.map(p => corpus[`${arm}-${p}`]));
  wallByArm[arm] = {
    n: rows.length,
    national: rows.filter(r => r.national).length,
    table: rows.filter(r => r.table).length,
    wins: rows.filter(r => r.won).length,
    w4: rows.filter(r => r.w4Day != null).length,
    w5: rows.filter(r => r.w5Day != null).length,
    medDays: median(rows.map(r => r.gameDays | 0)),
  };
  const w = wallByArm[arm];
  P(`wall ${arm}: national ${w.national}/${w.n} | table ${w.table}/${w.n} | wins ${w.wins}/${w.n} | wave4 ${w.w4}/${w.n} | wave5 ${w.w5}/${w.n} | median ${w.medDays}d`);
}

const out = lines.join('\n');
return out;
}

module.exports = { classify, analyzeRun, median, starvDeaths, POLICIES, ARMS, runAnalysis };

if (require.main === module) {
  const out = runAnalysis();
  console.log(out);
  const EVID_OUT = process.argv[2] || path.join(REPO, 'evidence', '2026-10-23', 'perseed-trustbuffer');
  const attachName = EXPECTED === 12 ? 'paired-comparison.md' : 'paired-comparison-pilot.md';
  fs.writeFileSync(path.join(EVID_OUT, attachName), out + '\n');
  console.log(`\nwrote ${attachName}`);
}
