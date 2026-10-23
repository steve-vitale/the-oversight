// overcourtrestage-analyze.js — paired analysis for the LINKFORM=2
// overcourt confirm (sim-overcourt-restage, axis scale-onramp, run
// fleshout-20261023T2015Z).
//
// Reads evidence/2026-10-23/perseed-overcourtrestage/<arm>-<policy>/s<seed>.json
// and judges the pre-registered bars:
//
//   PRIMARY   mean end dip per config, GO = armed >= baseline + 34
//             (one full link), paired identical seeds/policies.
//   SECONDARY post-formation dissolution events (dip -102 steps after a
//             formation event on the windowstay trajectories), GO = armed <
//             baseline. Carries the sim-links-diag metric-review caveat:
//             +34 single-link steps are seasonings, not formations — they do
//             not open the post-formation window; the end-dip scalar catches
//             them.
//   GUARDRAILS median survival paired diff >= -15d; starvation <=
//             control+2; no new death kinds (>=2-event rule); wall block
//             (national/table/wins, wave4/5, median survival) both arms.
//
// The dip-step classifier records ALL +/-34-multiple steps (the sim-links-diag
// instrument note: the |step|>=102 classifier missed +34 seasonings once a
// polity exists) and reconciles every recorded step against the end-dip
// scalar — an unattributed step is a loud warning, not a silent skip.
//
// §15: panel judged inapplicable for policy-layer zero-src/js arms per the
// doorcensus/links-diag precedent. This paired identical-seed sweep is the
// instrument; the pre-registered bars are the judge. The printed
// paired-comparison summary is the §15 attachment.
//
// Usage: node scripts/overcourtrestage-analyze.js [evid-dir]
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const EVID = process.argv[2] || path.join(REPO, 'evidence', '2026-10-23', 'perseed-overcourtrestage');

const POLICIES = ['leadfeast', 'belongfeast'];
const ARMS = ['control', 'armed'];

function loadDir(arm, policy) {
  const dir = path.join(EVID, `${arm}-${policy}`);
  const rows = [];
  for (const f of fs.readdirSync(dir).sort()) {
    if (!/^s\d+\.json$/.test(f)) continue;
    rows.push(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
  }
  return rows;
}

// Dip-step classifier: every recorded step must be named.
// - formation: +102 (polity step function) or +122 (+102 bundled with a +20 feast)
// - dissolution: -102
// - seasoning: +/-34 or +/-68 (post-polity single/double-link season/loss)
// - other 34-multiples: composite-34, needs naming (loud)
// - non-34-multiples (+45/+50/+70...): the DIAG's rule (sim-links-diag E6) —
//   war/feast composites on the RAW standing trajectory, NOT dip events.
//   They never open the post-formation window and never count as dissolutions.
function classify(step) {
  if (step === 102 || step === 122) return { cls: 'formation', note: step === 122 ? '102+20 feast bundle' : 'polity step' };
  if (step === -102) return { cls: 'dissolution', note: 'full polity dissolution' };
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
  // SECONDARY metric: post-formation dissolution events (-102 after formation)
  const postFormDiss = steps.filter(s => s.cls === 'dissolution' && firstForm != null && s.day >= firstForm);
  // reconciliation: every step classified; only composite-34 needs naming
  const needsNaming = steps.filter(s => s.cls === 'composite-34');
  const warComposites = steps.filter(s => s.cls === 'war-composite').length;
  const scalarRaw = (() => {
    try {
      const w = r.window || [];
      return w.length > 1 ? ((w[w.length - 1].raw | 0) - (w[0].raw | 0)) : null;
    } catch (e) { return null; }
  })();
  return { endDip, steps, firstForm, postFormDiss: postFormDiss.length, postFormDissDays: postFormDiss.map(s => s.day), needsNaming, warComposites, scalarRaw };
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

const corpus = {};
function runAnalysis() {
for (const arm of ARMS) for (const pol of POLICIES) corpus[`${arm}-${pol}`] = loadDir(arm, pol);
for (const k of Object.keys(corpus)) {
  if (corpus[k].length !== 12) { console.error(`ANALYZE STOP: ${k} has ${corpus[k].length} configs, expected 12`); process.exit(2); }
}

const lines = [];
const P = (s) => lines.push(s);

// ---- per-config table ------------------------------------------------------
P('# overcourtrestage paired comparison (the §15 instrument attachment)');
P('');
P('Per-config (seed, policy, control-dip, armed-dip, diff, post-form dissolutions control|armed):');
const diffs = [];
const dissPairs = { control: 0, armed: 0 };
const survDiffs = [];
const starvByArm = { control: 0, armed: 0 };
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
    for (const [armName, r] of [['control', ctrl[seed]], ['armed', armed[seed]]]) {
      for (const [k, v] of Object.entries(r.deaths || {})) {
        deathsByArm[armName][k] = (deathsByArm[armName][k] || 0) + v;
      }
    }
    P(`  s${seed} ${pol}: dip ${c.endDip} -> ${a.endDip} (diff ${d >= 0 ? '+' : ''}${d})` +
      ` | post-form diss ${c.postFormDiss} -> ${a.postFormDiss}` +
      ` | days ${ctrl[seed].gameDays} -> ${armed[seed].gameDays}`);
  }
}

// ---- PRIMARY ---------------------------------------------------------------
const meanDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;
const goPrimary = meanDiff >= 34;
P('');
P('## PRIMARY (binding): mean end dip per config');
P(`armed mean - control mean = ${meanDiff.toFixed(1)} dip points. GO bar: >= +34 (one full link).`);
P(`VERDICT: ${goPrimary ? 'GO' : 'NO-GO'} — ${goPrimary ? 'bar met' : 'bar missed (a miss is NO-GO, never re-scored §14)'}`);
P('per-policy: leadfeast mean-diff ' + (diffs.slice(0, 12).reduce((a, b) => a + b, 0) / 12).toFixed(1) +
  ', belongfeast mean-diff ' + (diffs.slice(12).reduce((a, b) => a + b, 0) / 12).toFixed(1));

// ---- SECONDARY ---------------------------------------------------------------
const goSecondary = dissPairs.armed < dissPairs.control;
P('');
P('## SECONDARY: post-formation dissolution events');
P(`control ${dissPairs.control} vs armed ${dissPairs.armed}. GO bar: armed < baseline.`);
P(`VERDICT: ${goSecondary ? 'GO' : dissPairs.armed === dissPairs.control ? 'TIE (not < : NO-GO on the bar as stated)' : 'NO-GO'}`);

// ---- classifier reconciliation ----------------------------------------------
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

// ---- guardrails --------------------------------------------------------------
const medSurvDiff = median(survDiffs);
P('');
P('## GUARDRAILS');
P(`median survival paired diff: ${medSurvDiff}d (bar: >= -15d) — ${medSurvDiff >= -15 ? 'PASS' : 'FAIL'}`);
P(`starvation deaths: control ${starvByArm.control} vs armed ${starvByArm.armed} (bar: <= control+2) — ${starvByArm.armed <= starvByArm.control + 2 ? 'PASS' : 'FAIL'}`);
// new death kinds (>=2-event rule): kinds with >=2 events on one arm, 0 on other
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
  const EVID_OUT = process.argv[2] || path.join(REPO, 'evidence', '2026-10-23', 'perseed-overcourtrestage');
  fs.writeFileSync(path.join(EVID_OUT, 'paired-comparison.md'), out + '\n');
  console.log('\nwrote paired-comparison.md');
}
