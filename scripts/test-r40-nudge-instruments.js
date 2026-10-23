#!/usr/bin/env node
// PROOF (journey-landing r40): the three driver instrument fixes.
//  - FIX 1: noteMenu no longer flags the first loop pass (turn 1) as a
//    RE-OFFER — that pass re-reads the opening menu (r === r0), so every
//    transcript in r37-r39 carried 5-8 bogus "re-offered at turn 1" lines
//    and MET.reofferFlags was inflated ~10x. A genuine re-offer can never
//    occur before the first pick, so nothing real is masked.
//  - FIX 2: the day-1 nudge (dayOneNudge: the NPC-initiated "Day one.
//    Everyone's pretending they're fine. ...Can we talk?") now has a
//    stream sensor (r40Summary.dayOneNudgeFired/Day). The old sensor —
//    talkRequests key count at d14 — is blind BY DESIGN:
//    expireTalkRequests() prunes delivered records after ~3 days so the
//    Talk badge never pings ancient history. 0 at d14 does NOT mean the
//    nudge never fired.
//  - FIX 3: per-seed MET bleed — the r38/r39 bleed fixes missed the
//    nv/plenty/near-dupe counters. Multi-seed processes reported cumulative
//    census values (plentyVoiceLines 24/50/76/104 for true 24/26/26/28;
//    nvWinddownSurfaced 1/2/3/4 for true 1/1/1/1). Reset per seed like the
//    rest.
// Method: run the r40 driver itself (real code path) on fresh seeds with
// a 3-day horizon, then assert on its own evidence.
// Usage: node scripts/test-r40-nudge-instruments.js
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const OUT = path.join(process.env.HOME || '/home/hatch',
  'workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-23/landing-r40-proof');
try { fs.mkdirSync(OUT, { recursive: true }); } catch (e) {}
let pass = 0, fail = 0;
const ok = (name, cond, extra) => {
  if (cond) { pass++; console.log(`PASS ${name}`); }
  else { fail++; console.log(`FAIL ${name}${extra ? ' — ' + extra : ''}`); }
};
const runDriver = (seeds, outdir) => {
  try {
    return execFileSync('node', [path.join(ROOT, 'scripts/journey-landing-r40-20261023.js')],
      { env: { ...process.env, SEEDS: seeds, DAYS: '3', OUTDIR: outdir }, timeout: 600000, maxBuffer: 64 * 1024 * 1024 }).toString();
  } catch (e) { return (e.stdout || '').toString() + '\n' + (e.stderr || '').toString(); }
};
const census = (seed, dir) => JSON.parse(fs.readFileSync(path.join(dir, `journey-landing-r40-census-${seed}.json`), 'utf8'));

// ---- solo run: fixes 1 + 2 ----
const out1 = runDriver('501', OUT);
ok('driver exits and completes the seed', /ALL SEEDS COMPLETE/.test(out1));
const c1 = census(501, OUT);
const r1 = c1.r40Summary || {};
ok('nudge sensor: fired', (r1.dayOneNudgeFired || 0) >= 1, JSON.stringify(r1.dayOneNudgeFired));
ok('nudge sensor: fired on day 1', r1.dayOneNudgeDay === 1, JSON.stringify(r1.dayOneNudgeDay));
ok('nudge sample is the nudge line', /pretending they're fine/.test(r1.dayOneNudgeSample || ''), (r1.dayOneNudgeSample || '').slice(0, 60));
const tfs = fs.readdirSync(OUT).filter(f => f.indexOf('transcript-501-') >= 0);
ok('transcripts written', tfs.length >= 1, String(tfs.length));
let turn1Flags = 0, totalFlags = 0;
for (const f of tfs) {
  const t = fs.readFileSync(path.join(OUT, f), 'utf8');
  turn1Flags += (t.match(/re-offered at turn 1 /g) || []).length;
  totalFlags += (t.match(/RE-OFFER/g) || []).length;
}
ok('zero "re-offered at turn 1" artifact lines', turn1Flags === 0, `found ${turn1Flags}`);
ok('reoffer flags no longer inflated', totalFlags < 40, `found ${totalFlags}`);

// ---- fix 3: per-seed isolation. Solo 502 (true values), then joint 501+502:
// the joint run's seed-502 census must equal the solo values, not cumulative.
const OUT2 = OUT + '-solo502';
try { fs.mkdirSync(OUT2, { recursive: true }); } catch (e) {}
runDriver('502', OUT2);
const solo502 = census(502, OUT2).r40Summary || {};
const OUT3 = OUT + '-joint';
try { fs.mkdirSync(OUT3, { recursive: true }); } catch (e) {}
const out3 = runDriver('501,502', OUT3);
ok('joint run completes both seeds', /seed 501:.*seed 502:/s.test(out3));
const joint502 = census(502, OUT3).r40Summary || {};
ok('plentyVoiceLines not cumulative across seeds',
  joint502.plentyVoiceLines === solo502.plentyVoiceLines,
  `joint=${joint502.plentyVoiceLines} solo=${solo502.plentyVoiceLines}`);
ok('nvWinddownSurfaced not cumulative across seeds',
  joint502.nvWinddownSurfaced === solo502.nvWinddownSurfaced,
  `joint=${joint502.nvWinddownSurfaced} solo=${solo502.nvWinddownSurfaced}`);
ok('debriefLines not cumulative across seeds',
  joint502.debriefLines === solo502.debriefLines,
  `joint=${joint502.debriefLines} solo=${solo502.debriefLines}`);
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
