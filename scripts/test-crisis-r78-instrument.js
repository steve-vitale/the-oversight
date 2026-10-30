#!/usr/bin/env node
// test-crisis-r78-instrument.js — proof test for the r78 instrument fixes.
// Static mode (default): asserts the r78 driver/analyzer contain the two
// r73-prereg claims r76 missed (DEFENDER every-turn ask:lately steering;
// convoFavorAction call-time wrap + per-convo [FAVOR-CALLS] blocks) and
// that both scripts pass node --check.
// Panel mode (--panel): additionally asserts the r78 panel JSONs show the
// instruments live (favor wrap present, >=1 call during a driven convo,
// >=1 lately pick across DEFENDER transcripts, [FAVOR-CALLS] blocks in
// transcript files). Run: node scripts/test-crisis-r78-instrument.js
// [EVIDDIR] [--panel]. EVIDDIR defaults to the goal hidden_files evidence
// dir for 2026-10-30 (same default the driver/analyzer use).
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const args = process.argv.slice(2);
const panelMode = args.includes('--panel');
const EVID = args.find(a => !a.startsWith('--')) ||
  '/home/hatch/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-30';
const ROOT = path.join(__dirname, '..');
const driver = fs.readFileSync(path.join(ROOT, 'scripts', 'journey-crisis-r78-delayed-20261030.js'), 'utf8');
const analyzer = fs.readFileSync(path.join(ROOT, 'scripts', 'analyze-crisis-r78-delayed-20261030.js'), 'utf8');
let failures = 0;
function check(name, ok, extra) {
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (extra !== undefined ? ' ' + JSON.stringify(extra) : ''));
  if (!ok) failures++;
}
// Static: DEFENDER every-turn steering (SHELTERED stays t0-only by construction:
// the steered flag is set from the tag, not from the turn index).
check('steering: DEFENDER tag flag', /\/DEFENDER\/\.test\(tag\)/.test(driver));
check('steering: every-turn lately preference', /choices\.find\(c => c\.id === 'ask:lately'\) \|\| choices\.find\(c => c\.id === 'alive:thread:lately'\)/.test(driver));
check('steering: thread-lately counts as a lately pick', /pick\.id === 'alive:thread:lately'/.test(driver));
check('steering: lately picks counted', /latelyPicks\+\+/.test(driver));
check('steering: subject-menu navigation to lately', /dlg:subject/.test(driver) && /latelyPicks === 0/.test(driver));
check('steering: never navigates past a live want', /betrayal:\|want:\|alive:want:\|confront:\|gq:\|ans:/.test(driver));
check('steering: no t0-only remnant', !/let pick = \(t === 0\) \? choices\.find\(c => c\.id === 'ask:lately'\)/.test(driver));
// Static: favor call-time wrap.
check('wrap: convoFavorAction intercepted', /Game\.convoFavorAction = function \(vid, favor\)/.test(driver));
check('wrap: delegates to original', /const st = _cfa\(vid, favor\)/.test(driver));
check('wrap: logs disjunct components', /rosterIncludes: \(vv\.roster \|\| \[\]\)\.includes\(vid\)/.test(driver) && /personExists: !!person/.test(driver) && /personDead/.test(driver) && /vpDead/.test(driver));
check('wrap: rec shares the call log', /favorCalls: favorCallLog/.test(driver));
check('wrap: per-convo [FAVOR-CALLS] block before probe', driver.indexOf('[FAVOR-CALLS]') !== -1 && driver.indexOf('[FAVOR-CALLS]') < driver.indexOf('FAVOR-AVAILABILITY PROBE'));
check('wrap: menu-time slice excludes probe call', /metaFavorCalls = during/.test(driver));
check('plumbing: convo record carries lately + favor counts', /latelyPicks: cmeta\.latelyPicks, favorCallsDuring: cmeta\.favorCallsDuring/.test(driver));
check('analyzer: r78 glob', /journey-crisis-r78-delayed-seed/.test(analyzer));
check('analyzer: V1 section', /R77 V1 defender voice/.test(analyzer));
check('analyzer: V2 section', /R77 V2 favor call-time probe/.test(analyzer));
check('analyzer: D1 section', /R77 D1 speaker-fought/.test(analyzer));
for (const f of ['scripts/journey-crisis-r78-delayed-20261030.js', 'scripts/analyze-crisis-r78-delayed-20261030.js']) {
  try { execFileSync('node', ['--check', path.join(ROOT, f)], { stdio: 'pipe' }); check('node --check ' + f, true); }
  catch (e) { check('node --check ' + f, false, String(e.message).slice(0, 200)); }
}
if (panelMode) {
  const files = fs.readdirSync(EVID).filter(f => /^journey-crisis-r78-delayed-seed\d+\.json$/.test(f)).sort();
  check('panel: 3 seed JSONs', files.length === 3, files);
  let during = 0, total = 0, defLately = 0, defConvos = 0, blocks = 0, wrapMissing = 0;
  for (const f of files) {
    const d = JSON.parse(fs.readFileSync(path.join(EVID, f), 'utf8'));
    if (d.favorWrapMissing) wrapMissing++;
    total += (d.favorCalls || []).length;
    for (const c of (d.convosDriven || [])) {
      during += c.favorCallsDuring || 0;
      if (/DEFENDER/.test(c.tag || '')) { defConvos++; defLately += c.latelyPicks || 0; }
      try { const txt = fs.readFileSync(path.join(EVID, c.file), 'utf8'); if (/\[FAVOR-CALLS\]/.test(txt)) blocks++; } catch (e) {}
    }
  }
  check('panel: favor wrap present on all seeds', wrapMissing === 0, { wrapMissing });
  check('panel: >=1 favor call during a driven convo (V2i)', during >= 1, { during, total });
  check('panel: >=1 lately pick across DEFENDER transcripts', defLately >= 1, { defConvos, defLately });
  check('panel: every driven transcript carries a [FAVOR-CALLS] block', blocks > 0, { blocks });
}
console.log('[RESULT] FAILURES=' + failures);
process.exit(failures ? 1 : 0);
