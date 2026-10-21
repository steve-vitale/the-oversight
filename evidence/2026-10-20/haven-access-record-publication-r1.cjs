'use strict';
const fs=require('fs');
const p='evidence/2026-10-20/haven-access-',receipt=JSON.parse(fs.readFileSync(p+'publication-r1.json'));
if(receipt.version!=='3f09b84a1-20261020-235403'||receipt.inputsVerified!==163||receipt.boot.pageErrors.length)throw Error('Actual publication proof required');
const strip=s=>s.replace(/\nFinal fallback revision \(build3f09b84a1-20261020-235403\):[\s\S]*$/,'\n');
let lanes=strip(fs.readFileSync('docs/AGENT-LANES.md','utf8'));
const boundary=lanes.indexOf('## Completed favor lifecycle goal');if(boundary<0)throw Error('Lane boundary missing');
lanes=`# Agent lanes (2026-10-20)

## Rolling public-release goal — current milestone: terminal caregiver coverage

Steve asked Codex to move through small concrete goals in serial. Keep the
rolling goal active between milestones. Muse retains numerical calibration;
Codex owns repeatable later-game coverage. Fetch shared history before working;
never port an older source tree over newer work.

Haven entrance repair shipped as9026efa1d on shared master/main and
codex/haven-access-20261020. Live build3f09b84a1-20261020-235403 matches all163
boot inputs; fresh mobile boot is clean. Quick269/0 and full1041/0 preceded
the release push. Source-bound phone/save/offline evidence and the paid-camp
negative control are in evidence/2026-10-20/haven-access-*. The changed yard
preserves structures and has35 shared-kit checks, including128 obstruction
layouts. Earlier favor and water milestones remain shipped in this ancestry.

Current bounded lane: caregiver seeds10003/10004 (lost capped wins) and
10001/10008 (gained controls), fixed before continuation. Follow each through
an actual terminal outcome; extend observational caps rather than marking an
alive bearer complete. Preserve policy/RNG continuation, or prove a rerun's
prefix equivalent before using it. Investigate reproducible livelocks instead
of forcing death or loosening Table gates. Retain milestones, opportunities,
all23 measures and full state/outcome provenance. Obtain naturally earned
late-game save(s) for actual phone Continue and actions at both phone heights.
Done when terminal or reproducibly blocked outcomes are explained, the real
late-game phone journey is verified, checks pass and the evidence/tooling is
shared. A cap alone is not done. No numerical balance change is preauthorized
by a reduced win rate; investigate and record tradeoffs first.

Final Haven panels retain review_required: caregiver Table invitations42→30/64
and wins40→30/64. Selected lost seats lack third-wave breadth at the150-day
cap; other progress/survival improvements cannot cancel this warning. Fresh
final-source192-case panels match all retained first-candidate row fields.
Historical86 exact replay pairs keep their original source identities; they
were not rerun against the final fallback source. See the audit and handoff.

`+lanes.slice(boundary);fs.writeFileSync('docs/AGENT-LANES.md',lanes);
let hand=strip(fs.readFileSync('docs/MUSE-CALIBRATION-HANDOFF.md','utf8')),cut=hand.indexOf('## Joint water trip shipped');if(cut<0)throw Error('Handoff boundary missing');
hand=`# Muse calibration handoff

## Haven shipped; terminal caregiver lane active (2026-10-20)

Fetch shared master/main at9026efa1d or newer. Production build
3f09b84a1-20261020-235403 is verified against all163 boot input hashes, with
clean mobile boot. No source port is needed: Muse recovery999c69491 remains
an ancestor. Read haven-access-publication-r1.json and haven-access-audit-r1.md.
The first publication probe saw the old build while deployment was pending;
the second probe verified the new source. Both logs are retained.

The entrance correction reserves new south doorsteps, preserves existing
structures and resolves blocked preferred spots onto connected non-garden
ground. Nine tents built through actual paid actions reproduce the old trap
and succeed with the final fix.35 shared-kit checks,128 obstruction layouts,
trusted-touch journeys at both heights, combat doors and installed update/
offline Continue pass. Quick269/0 and full1041/0 preceded this gameplay push.

Use final after-r2 panels/source bundle, frame-r3, Haven phone-final-r2,
combat-r4, water haven-final-r2 and lifecycle-r2. Fresh192-case final runs
match every retained first-candidate row field. Earlier86 replay pairs,
ablations and eligibility probes remain explicitly historical first-candidate
diagnostics; matching sampled endpoints do not establish universal equivalence.
Both final scorecards remain review_required. Caregiver Table invitations
42→30/64 and wins40→30/64 stay open; more class/survival cannot cancel them.
No gate, food, HP, skill, cost or reward was tuned to regain wins.

Codex now owns four fixed caregiver campaigns (10003,10004,10001,10008) through
actual terminal outcomes or a reproduced diagnosed blocker, with faithful
continuation/prefix proof and naturally earned late-game phone Continue/action.
Muse retains numerical calibration. Alive at a cap remains unknown. Public
release and all-playstyle viability are not cleared by the Haven fix.

`+hand.slice(cut);fs.writeFileSync('docs/MUSE-CALIBRATION-HANDOFF.md',hand);
let levers=strip(fs.readFileSync('docs/SURVIVAL-LEVERS.md','utf8')).replace('## Haven entrance candidate (2026-10-20, not yet published)','## Haven entrance shipped (2026-10-20,9026efa1d)');
levers=levers.replace('Saved/player-built grounds are not regenerated or cleared.','Saved/player-built grounds are not regenerated or cleared. The final fallback\nalso resolves nine paid tents blocking every preferred spot, using connected\nnon-garden ground. The128 saved-obstruction tests preserve all structures.\nFinal after-r2 panels reproduce all192 retained case endpoints; earlier\ndiagnostics keep their historical source identities. Production readback is\nretained as haven-access-publication-r1.json.');fs.writeFileSync('docs/SURVIVAL-LEVERS.md',levers);
let roadmap=fs.readFileSync('docs/ROADMAP.md','utf8');roadmap=roadmap.replace('The current bounded Codex milestone is generated Haven\nentrance/exit accessibility: a tent landed on the documented doorstep during\nactual phone play. Verify placement order and sibling footprints, preserve\nexisting player structures, and prove reachable entrances across seeds and UI.','Haven entrance/exit accessibility shipped as9026efa1d, with verified live build\n3f09b84a1-20261020-235403; paid camp structures and Continue are preserved.\nCurrent bounded Codex milestone: four fixed caregiver campaigns through actual\nterminal outcomes, faithful continuation/prefix proof, and naturally earned\nlate-game phone Continue/actions. See AGENT-LANES.md for seeds and done-when.\nThe caregiver Table-pace warning stays open; alive at a cap is not completion.');fs.writeFileSync('docs/ROADMAP.md',roadmap);
let audit=fs.readFileSync(p+'audit-r1.md','utf8').replace('# Haven entrance milestone — verification in progress','# Haven entrance milestone — shipped9026efa1d').replace('No candidate publication yet. Keep the rolling goal active.','Published as9026efa1d; all163 production boot hashes match and mobile boot is clean.\nSee publication-r1 receipt. The rolling goal stays active. Earlier pending\nstatements below describe the pre-publication investigation.');audit+='\n## Actual publication\n\nOrdinary atomic fast-forward push advanced master/main and the Haven branch\nto9026efa1dead96d75c814290dbb47a8a4fa703fe after fresh quick269/0 and\nfull1041/0. The first live probe correctly refused the old production build\nwhile deployment was pending (live-verify-r1.log). The second verifies the\nnew version, all163 boot hashes and a clean390×736 touch-browser boot\n(live-verify-r2.log and publication-r1.json); Vercel reports READY on that\ncommit. Primary master/main were fast-forwarded, preserving sweep-B.log.\nThe next bounded lane is recorded in AGENT-LANES. This documentation/evidence\nfollow-up gets a separate fresh quick/full before its own push.\n';fs.writeFileSync(p+'audit-r1.md',audit);
console.log('Actual publication and next serial milestone recorded');
