# Floored tend-through CONFIRM with drop-count guard — Loop B, arm sim-tendfloor-guard-b — PRE-REGISTRATION (guard addendum)

Axis: scale-onramp / winnability chain (wild ally-join → wave-4 kills →
veterans → readiness-5 release → wave-5 facing → full seat). This arm
tests ONLY the floored tend-through variant, on a fresh confirm band,
with the drop-count guard the pilot's metric review required. It never
tests zombie-clearing, never bundles legs, never touches the sibling
recovery-zombie work, any Loop A tree/claim/branch, the HELD branch
sim-recovery-zombie-b, or the orphaned sim-fracchoice-b tree. It does
NOT rebuild the ability-use game-code follow-up (passives, NPC twins,
bar surfacing) — that is a separate builder arm owned by the main
session.

## Canon read before this prereg

- docs/CANON.md (manifest) read first. docs/SCALE.md read: 1 season =
  30 days; a polity is one primary with >= 3 SEASONED subordinates;
  seasoned = 30+ days old AND trust 40+ (links form at trust 30 —
  tending required); national cannot stage until Haven has been
  regional for a full season.
- No canon doc covers diplomacy day-to-day trust mechanics in detail
  — stated here instead of inventing canon. Trust mechanics read
  from src/js/hierarchy.js tendLink/linkTick code: tending is a
  POLICY verb, weekly (tendedWeek), engine tendLink costs 1,500
  kcal (partial credit if the pantry holds less, zero if bare),
  once per week per link, refused during mourning. The proposal
  gate in the leadcourt POLICY is pantry > 12,000 kcal. The
  floored policy adds exactly one gate: tend only while pantry >
  13,500 kcal (= proposal gate + one 1,500-kcal tend).

## Question (from 1330Z sim-tendfloor-b — not re-litigated)

Tend-through held every polity on 994xx but cost two villages
their lives; flooring the tend-through (tend only while pantry >
13,500) removed the survival cost on the fresh pilot band
99001–99008 (0 band regressions, median death-day delta +0.5d)
and bought large survival gains on three seeds plus one new
polity — but the pooled hold-share passed only by 0.007 (0.957
vs 1.000, bar >= 0.950) while the drop count went the wrong way
(0 → 3: 99001 flickers then recovers d115, 99002 collapses
after a 47-day below-floor gap, 99008 collapses at death after
a 132-day gap). The pilot verdict states explicitly: NO confirm
run on the metric as written — a drop-count guard might
overturn it. This run is that guard addendum + confirm.

## Primary variant (EXACTLY ONE — unchanged from the pilot)

- Armed leg: scripts/policies/leadcourt-tendfloor-b.js =
  leadcourt-tendthrough with EXACTLY ONE change: the tend
  condition becomes pantry > 13,500 kcal. Verified byte-identical
  to master before this prereg (`git diff HEAD` empty for it;
  diff against master copy empty). Everything else is
  tend-through verbatim (weekly cadence, Haven-primary only,
  1,500 kcal engine cost, proposal gate unchanged, answer/
  counter logic unchanged).
- Baseline leg: scripts/policies/leadcourt-tendthrough.js
  VERBATIM (verified byte-identical to master). Re-run on the
  SAME fresh seeds as the armed leg — the judged baseline is
  this leg's own tend-through numbers on 99217–99232, NOT the
  pilot's 99001–99008 numbers (different seeds, different
  timelines; background only, never pooled).
- ZERO src/js changes. ZERO gate/price/deed changes. This is a
  policy-side measurement arm; no default flip is proposed.

## Band freshness (step 1 — verified before this prereg, 2026-11-04)

Coordinator-assigned band: 99217–99232 (16 seeds). Re-verified
by this worker against master (not just this branch's older
checkout), before writing this prereg:

- No dated evidence .md on ANY date names 99217–99232 as run
  seeds (word-matched `git grep -w` over master's evidence
  tree, all depths): ZERO hits.
- No per-seed corpus filename on ANY date carries 99217–99232
  (`git ls-tree -r` over master's evidence tree): ZERO hits.
- Absent from the forbidden list (99401–99412, 99601–99612,
  99701–99708, 99801–99808, 98701–98716, 99101, 89701–89707,
  83601–83800, 16101–16116): no overlap.
- Absent from today's bands: today's 992xx mentions in
  evidence/2026-11-04/*.md are only 99201–99216 (the reserved
  bands below); no other today's band touches 99217–99232.
- Clear of every reserved band: standacc extension 99201–99208
  (adjacent, disjoint), tendseason pilot 99209–99216
  (adjacent, disjoint), tendseason confirm 99041–99052,
  approachconf conditional 99901–99912. No overlap.
- NOT the contaminated band: 99009–99024 (belongzombie
  screened all 24 + census on 5) is never used here; the
  interim candidate 99209–99224 is never used here (its first
  eight seeds are the tendseason pilot).

If any of the above had hit, this run would have FAILED LOUDLY
and stopped with no substitution. None hit. Band 99217–99232
is fresh.

## Pre-registration (committed before any judged sim)

- Seeds (confirm): 99217–99232, FRESH (see above). Identical
  seeds on both legs, 32 runs total. This is a CONFIRM: the
  1330Z bars below are carried verbatim, with the seed count
  raised from the pilot's 8 to the confirm's 16 (median over
  all 16 seeds; pooled hold over the confirm's diplomacy
  seeds; wave-guard counts over 16; drop guard over totals).
- Horizon: 300 days, death-aware (dead villages stop
  simulating; +10d tail max as implemented by runDays). WHY
  300: identical window to 0930Z and the pilot, so per-seed
  death-day deltas are like-for-like; never binding on the
  pilot (max survival 195d).
- Instrument: the diplo instrument
  (scripts/diplo-instrument-20261104.js) REUSED verbatim via a
  NEW parameterized driver
  (scripts/test-tendfloor-guard-driver-20261104.js, output
  evidence/2026-11-04/perseed-tendfloor-guard-b/, RUN=
  tendfloor-guard-base for tend-through and RUN=
  tendfloor-guard-armed for floored) and the polityfrag
  analyzer REUSED verbatim through a NEW wrapper
  (scripts/test-tendfloor-guard-analyze-20261104.js). The
  snapshot NEVER calls villageStandingTotal() or
  unlockedWave(); ONE end-of-run unlockedWave() call is
  reported separately and never counted as a natural
  door-open. The driver refuses to overwrite an existing
  per-seed file. Corpus goes in the NEW dir
  perseed-tendfloor-guard-b/ — never the pilot's
  perseed-tendfloor-b/.
- Survival bands (same as 0930Z and the pilot): A = survived
  to the 300d horizon, B = died 150–299d, C = died 100–149d,
  D = died < 100d. Death day = the driver's reported days.
- Wave facing (ever-faced, as in the pilot): a seed has faced
  wave 4 (resp. 5) iff ANY daily snapshot in its per-seed
  JSON carries w4faced (resp. w5faced) true. Counts are per
  leg (seeds facing / 16).
- Hold-share (pooled, per leg): over diplomacy seeds only
  (firstDiploDay != null), sum of post-first-diplo snapshots
  divided by sum of post-first snapshots, from the reused
  analyzer's per-seed fields.
- Drop count (per leg): total analyzer drop events summed
  over all 16 seeds of the leg (drops.length per seed).
  Drops are the analyzer's trust-unseason events, not
  re-classified by this worker.
- Scope observation (reported, not judged): how many seeds
  on this band are baseline-collapsing seeds (baseline drops
  a polity / collapses). If zero, the floor-on-a-collapsing-
  seed question stays untested — stated as a scope limit,
  never hidden. Bands are never swapped mid-run to chase
  collapsing seeds.

## PRIMARY METRIC + GO THRESHOLD (binding)

Per-seed: death-day delta (armed days minus baseline days),
survival band vs baseline, hold-share contribution, drop
events, tend counts by pantry band (<= 13,500 blocked by the
floor; 13,501–20,000 floored-allowed; > 20,000 always-allowed;
unknown-pantry tends counted separately), ever-faced wave 4/5.

GO iff ALL of the following hold:
  (a) NO survival-band regression on ANY seed (armed band
      strictly below baseline band on any seed = fail);
  (b) median death-day delta (armed minus tend-through
      baseline, over all 16 seeds) >= -5 days;
  (c) armed pooled hold-share >= baseline pooled hold-share
      - 0.05 (hold preserved within five points);
  (d) WAVE-FACING GUARD: armed ever-faced wave-4 count >=
      baseline wave-4 count - 1, AND armed ever-faced wave-5
      count >= baseline wave-5 count - 1 (at most one facing
      lost per wave);
  (e) DROP-COUNT GUARD (the one new leg, fixed here, carried
      from the pilot analysis): armed total drops <=
      baseline total drops + 1.
Otherwise NO-GO. A miss is NO-GO, never re-scored against a
friendlier metric mid-run. A guardrail breached is NO-GO even
if (a)–(d) pass (§14: guardrails are metrics too).
INSUFFICIENT-DATA only if > 2 seeds in either leg carry
instrument errors, or the baseline leg has zero diplomacy
seeds (hold-share unjudgeable).

Classifier lesson carried (tendseason, merged): previous-day-
snapshot classification mislabels when trust moves intra-day
(trust 46 at snapshot, 38 at decision time, tend refused ret
0 yet labeled seasoned). This arm's drop classification comes
from the analyzer's own drop events and its tend-band split
from daily snapshots (same snapshot-timing approximation the
pilot documented for pantry bands). If any drop/tend
classification in this corpus looks artifactual, it is
reported under "metric review" — never silently
re-classified mid-run, never re-scored against a friendlier
metric (§14).

## SECONDARY (reported, not judged)

Wall numbers every run — wins, national/table (scaleRank
end-state; table not instrumented by this arm, stated not
faked), wave 4–5 unlocks (maxWave) and ever-facing (defined
above), median/max survival, death-cause shares, ready days,
trajectories, drop/recovery counts, tend totals by pantry band
(to prove the floor actually bit: floored-allowed tends must
be nonzero for the lever to have fired at all), baseline-
collapsing seed count (scope observation above). Arc reach:
not instrumented (stated, not faked). LEAD vs BELONG shape
reported per seed.

## SENSE-TEST (SENSE-TESTING LAW)

Sample say-lines/transcripts around tend weeks and any drop
days on BOTH legs; quote at least one real transcript line per
leg where tending (or its absence) shows; judge whether a held,
collapsed, or never polity reads as a consequence of things
villagers did, and flag anything robotic, static, or repeated.
Known capture limit carried from 0930Z and the pilot: the
instrument's SAY_RE does not match tendLink's own say-lines,
so tend lines are proven by event counts, not quoted lines,
unless a captured line matches.

## BALANCED PANEL (§15)

Before/after comparison on identical seeds (same 16 seeds,
baseline = this leg's tend-through run, candidate = floored
run). The panel instrument is the polityfrag analyzer over
identical-seed per-seed JSONs plus the guard wrapper's
delta/GO judge; no balance-panel.js compare is fabricated —
the per-seed before/after table IS the panel output for this
trajectory metric, and any balance-panel.js refusal or
field-shape mismatch is recorded honestly, not worked around
by re-scoring. The telemetry deviation check
(scripts/telemetry-check.js against the scale-wall baseline)
is ATTEMPTED and its outcome reported honestly
(REFUSED/INAPPLICABLE with reason is acceptable — never a
fabricated compare, never a --allow-recorder-corpus
workaround).

## HARD LIMITS (binding, honored)

No gate/price/deed change; no src/js change; no edit to
leadcourt.js or leadcourt-tendthrough.js; no edit to
leadcourt-tendfloor-b.js (byte-identical to master); no
zombie-clearing mechanism; no propose/tend verb added or
removed; no file owned by another arm touched; no Loop A
tree/claim/branch touched; no HELD branch adopted, merged,
or re-run; no push, no bump, no live verification, no merge
to master (coordinator merges).

## Metric review (placeholder — completed in the evidence file)

The evidence file carries the completed metric review: what
the metric proved, what it missed, and any revision proposed
for the NEXT run (never applied in-run).
