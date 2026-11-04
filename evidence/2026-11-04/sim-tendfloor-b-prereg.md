# Floored tend-through — Loop B, arm sim-tendfloor-b — PRE-REGISTRATION

Axis: scale-onramp / winnability chain (wild ally-join → wave-4 kills →
veterans → readiness-5 release → wave-5 facing → full seat). This arm
tests ONLY the floored tend-through variant. It never tests
zombie-clearing, never bundles legs, never touches the sibling
recovery-zombie work, never touches any Loop A tree/claim/branch,
never touches the HELD branch sim-recovery-zombie-b.

## Canon read before this prereg

- docs/CANON.md (manifest) read first. docs/SCALE.md read: 1 season =
  30 days; a polity is one primary with >= 3 SEASONED subordinates;
  seasoned = 30+ days old AND trust 40+ (links form at trust 30 —
  tending required); national cannot stage until Haven has been
  regional for a full season.
- No canon doc covers the diplomacy pipeline's day-to-day trust
  mechanics in the same detail — stated here instead of inventing
  canon (same statement as sim-recovery-tend-b). Trust mechanics
  read from src/js/hierarchy.js tendLink/linkTick code: tending is
  a POLICY verb, weekly (tendedWeek), engine tendLink costs 1,500
  kcal (partial credit if the pantry holds less, zero if bare),
  once per week per link, refused during mourning. The proposal
  gate in the leadcourt POLICY is pantry > 12,000 kcal.
- No canon doc covers polity tending/links day-to-day beyond the
  above — stated, not invented.

## Question (from 0930Z sim-recovery-tend-b — not re-litigated)

Tend-through (leadcourt with ONLY the pantry > 20,000 tend gate
removed) held every polity (hold-share 1.000, 0 drops, 3/3
baseline-collapsed seeds hold) but cost two villages their lives:
99409 C→D (111→82d) and 99410 C→D (107→95d), hypothesized as
grain spent on villages that needed it least (99409: 73 tends vs
27 baseline; 99410: 72 vs 42; 87% of tend-through tends fired at
snapshot pantry <= 20,000). The asymmetry: the tax is not uniform
— villages at risk of dropping are saved, villages already safe
pay for grain they did not need.

Question for THIS leg: does flooring the tend-through — tending
below 20,000 ONLY while the pantry stays above a floor — keep
the polity gain while removing the survival cost?

## Primary variant (EXACTLY ONE — no second shape is run here)

NEW policy file scripts/policies/leadcourt-tendfloor-b.js =
leadcourt-tendthrough with EXACTLY ONE change: the tend condition
becomes pantry > 13,500 kcal (instead of unconditional in
tend-through, instead of > 20,000 in leadcourt). Everything else
is leadcourt-tendthrough verbatim: weekly cadence (tendedWeek
check unchanged), Haven-primary links only, 1,500 kcal engine
cost per tend, proposal gate pantry > 12,000 unchanged,
answer/counter logic unchanged. Policy id:
'leadcourt-tendfloor-b'.

FLOOR JUSTIFICATION (from the 0930Z data, fixed before any sim):
13,500 = the 12,000-kcal proposal gate + one 1,500-kcal tend.
The floor is set so that a tend authorized by the policy can
never by itself push the pantry below the proposal gate: a tend
fires only above 13,500, so after paying the full 1,500 the
pantry still sits above 12,000, and the village keeps its
ability to propose new links. Because the check runs per link
inside the weekly loop, a week whose pantry starts just above
the floor buys at most one tend that week — the floor is a
per-week spend brake, not just an on/off switch. The 0930Z
holders' cost was grain sent through thin pantries week after
week; the floor stops exactly that tail: below 13,500, no grain
leaves, whatever the trust numbers say.

The OTHER shape from the queue (tend-through only for links
below the seasoned bar) is NOT run in this pilot. It is recorded
here as the pre-registered sensitivity for a NEXT run only — it
must never appear as a post-hoc rescue if this variant misses.
No other variant, floor, or shape is judged in this run.

## Pre-registration (committed before any judged sim)

- Baseline leg: scripts/policies/leadcourt-tendthrough.js
  VERBATIM from master (this branch's committed copy, verified
  unmodified: `git diff HEAD` empty for that file; this arm
  never edits it). Re-run on the SAME fresh seeds as the armed
  leg — the judged baseline is this leg's own tend-through
  numbers on 99001–99008, NOT the cited 994xx polityfrag/
  tend-through numbers (different seeds, different timelines).
  The 994xx numbers are background only and are never pooled
  with this leg.
- Armed leg: scripts/policies/leadcourt-tendfloor-b.js (new
  file, described above). leadcourt.js untouched. ZERO src/js
  changes. ZERO gate/price/deed number changes. This is a
  policy-side measurement arm; no default flip is proposed.
- Seeds (pilot): 99001–99008, FRESH — verified before this
  prereg: no dated evidence .md in evidence/2026-11-04/ names
  99001–99008, and no per-seed corpus filename in
  evidence/2026-11-04/perseed-*/ carries 99001–99008; the band
  is absent from the task's forbidden list (99401–99412,
  99601–99612, 99701–99708, 99801–99808, 98701–98716, 99101,
  89701–89707, 83601–83800, 16101–16116) and from today's
  other bands (99501–99508 askplus, 99901+ approachconf).
  Identical seeds on both legs, 16 runs total.
- Confirm band (pre-stated here, so a confirm is legitimate
  WITHOUT a later addendum): 99009–99024 (16 seeds), verified
  fresh the same way as the pilot band (no .md name, no corpus
  filename). Confirm runs ONLY on a pilot GO, and only on this
  band. If the pilot is NO-GO, no confirm is run on any band.
  The pilot verdict is this worker's deliverable; a pilot GO
  leaves the confirm to the coordinator unless this run still
  has time to run it on the pre-stated band — a confirm run
  without a pilot GO, or on any other band, is forbidden.
- Horizon: 300 days, death-aware (dead villages stop
  simulating; +10d tail max as implemented by runDays). WHY
  300: identical window to 0930Z, so per-seed death-day
  deltas are like-for-like; the death-aware stop bounds cost
  (0930Z max survival 153d; 300 was never binding). A village
  alive at 300 is censored, reported as survived, not as a win.
- Instrument: the diplo instrument
  (scripts/diplo-instrument-20261104.js) REUSED verbatim via a
  new parameterized driver
  (scripts/test-tendfloor-driver-20261104.js, output
  evidence/2026-11-04/perseed-tendfloor-b/, RUN=tendfloor-base
  for the tend-through leg and RUN=tendfloor-armed for the
  floored leg) and the polityfrag analyzer
  (scripts/test-polityfrag-analyze-20261104.js) REUSED verbatim
  through a new wrapper
  (scripts/test-tendfloor-analyze-20261104.js). The snapshot
  NEVER calls villageStandingTotal() or unlockedWave(); ONE
  end-of-run unlockedWave() call is reported separately and
  never counted as a natural door-open. The driver refuses to
  overwrite an existing per-seed file. Substrate is the same
  as 0930Z (leadcourt family, diplo instrument verbatim) —
  no instrument change is claimed or needed.
- Survival bands (same as 0930Z): A = survived to the 300d
  horizon, B = died 150–299d, C = died 100–149d, D = died
  < 100d. Death day = the driver's reported days for the run.
- Wave facing (ever-faced, defined here because the reused
  analyzer's w4faced/w5faced fields read only the LAST
  snapshot): a seed has faced wave 4 (resp. 5) iff ANY daily
  snapshot in its per-seed JSON carries w4faced (resp.
  w5faced) true via Game.waveEngaged. Counts are per leg
  (seeds facing / 8). This definition is fixed here, before
  any sim, and applies identically to both legs.
- Hold-share (pooled, per leg): over diplomacy seeds only
  (firstDiploDay != null), sum of post-first-diplo snapshots
  divided by sum of post-first snapshots, from the reused
  analyzer's per-seed fields. If the baseline leg has zero
  diplomacy seeds, the hold-share leg cannot be judged and
  the verdict is INSUFFICIENT-DATA, not a pass.

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
      baseline, over all 8 seeds) >= -5 days;
  (c) armed pooled hold-share >= baseline pooled hold-share
      - 0.05 (hold preserved within five points);
  (d) WAVE-FACING GUARD: armed ever-faced wave-4 count >=
      baseline wave-4 count - 1, AND armed ever-faced wave-5
      count >= baseline wave-5 count - 1 (at most one facing
      lost per wave).
Otherwise NO-GO. A miss is NO-GO, never re-scored against a
friendlier metric mid-run. A guardrail breached is NO-GO even
if (a)–(c) pass (§14: guardrails are metrics too).
INSUFFICIENT-DATA only if > 2 seeds in either leg carry
instrument errors, or the baseline leg has zero diplomacy
seeds (hold-share unjudgeable).

## SECONDARY (reported, not judged)

Wall numbers every run — wins, national/table (scaleRank
end-state; table not instrumented by this arm, stated not
faked), wave 4–5 unlocks (maxWave) and ever-facing (defined
above), median/max survival, death-cause shares, ready days,
trajectories, drop/recovery counts, tend totals by pantry band
(to prove the floor actually bit: blocked-band tends must be
zero on the armed leg, and floored-allowed tends must be
nonzero for the lever to have fired at all — a zero in the
13,501–20,000 band on the armed leg means the floor never
mattered and the pilot measured nothing, reported as such).
Arc reach: not instrumented (stated, not faked). LEAD vs
BELONG shape reported per seed.

## SENSE-TEST (SENSE-TESTING LAW)

Sample say-lines/transcripts around tend weeks and any drop
days on BOTH legs; quote at least one real transcript line per
leg where tending (or its absence) shows; judge whether a held,
collapsed, or never polity reads as a consequence of things
villagers did, and flag anything robotic, static, or repeated.
Known capture limit carried from 0930Z: the instrument's
SAY_RE does not match tendLink's own say-lines, so tend lines
are proven by event counts, not quoted lines, unless a
captured line matches.

## BALANCED PANEL (§15)

Before/after comparison on identical seeds (same 8 seeds,
baseline = this leg's tend-through run, candidate = floored
run). The panel instrument is the polityfrag analyzer over
identical-seed per-seed JSONs plus the tendfloor wrapper's
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
leadcourt.js or leadcourt-tendthrough.js; no zombie-clearing
mechanism; no propose/tend verb added or removed; no file
owned by another arm touched; no Loop A tree/claim/branch
touched; no HELD branch adopted, merged, or re-run; no push,
no bump, no live verification, no merge to master
(coordinator merges).

## Metric review (placeholder — completed in the evidence file)

The evidence file carries the completed metric review: what
the metric proved, what it missed, and any revision proposed
for the NEXT run (never applied in-run).
