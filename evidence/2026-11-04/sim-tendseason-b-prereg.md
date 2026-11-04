# Tend-through ONLY for links below the seasoned bar — Loop B, arm sim-tendseason-b — PRE-REGISTRATION

Axis: scale-onramp / winnability chain (wild ally-join → wave-4 kills →
veterans → readiness-5 release → wave-5 facing → full seat). This arm
tests ONLY the tend-below-seasoned-bar variant. It never tests
zombie-clearing, never bundles legs, never touches the sibling
recovery-zombie work, never touches any Loop A tree/claim/branch,
never touches the HELD branch sim-recovery-zombie-b, never touches
the orphaned sim-fracchoice-b tree.

## Canon read before this prereg

- docs/CANON.md (manifest) read first. docs/SCALE.md read: 1 season =
  30 days; a polity is one primary with >= 3 SEASONED subordinates;
  seasoned = 30+ days old AND trust 40+ (links form at trust 30 —
  tending required); national cannot stage until Haven has been
  regional for a full season.
- No canon doc covers the diplomacy pipeline's day-to-day trust
  mechanics in the same detail — stated here instead of inventing
  canon (same statement as sim-tendfloor-b). Trust mechanics
  read from src/js/hierarchy.js tendLink/linkTick code: tending is
  a POLICY verb, weekly (tendedWeek), engine tendLink costs 1,500
  kcal (partial credit if the pantry holds less, zero if bare),
  once per week per link, refused during mourning. The proposal
  gate in the leadcourt POLICY is pantry > 12,000 kcal.

## Predicate (defined from code before any sim)

_linkSeasoned (hierarchy.js) counts a link toward a polity when it
is 30+ days old AND trust 40+; _formLink sets link.day = formation
day and link.trust = 30 at birth. So a link IS seasoned iff
(scholar day - link.day) >= 30 AND (link.trust || 0) >= 40, and
this policy tends iff NOT that: age < 30 days OR trust < 40.
Fields named: link.day, link.trust, scholar day. Mercy and
succ-polity graces are polity-membership-only readings and never
change link.trust, so they do not move this predicate. Conquered
links need the season alone for polity membership, but this
policy never raids, and the raw trust bar is the conservative
reading: a seasoned-age link under trust 40 is exactly a link at
risk of unseasoning, so it gets tended. A seasoned link is never
tended by this policy.

## Question (from the tendfloor prereg, not re-litigated)

Tend-through held every polity on 994xx but taxed holders' lives;
floored tend-through (13,500 floor) on 99001–99008 was GO-THIN:
it removed the survival cost (0 band regressions, median delta
+0.5d) but bought three late polity drops where the baseline had
none (pooled hold 0.957 vs 1.000, passing by 0.007). The tendfloor
metric review required the NEXT run to carry a drop-count guard,
and named this shape as the pre-registered sensitivity: grain
targeted at links at risk of unseasoning, not at safe links.
Question for THIS leg: does tending ONLY below-bar links keep
polities held (no grain wasted on already-seasoned links, no
floor starving at-risk links) without the survival tax and
without the floored leg's late drops?

## Primary variant (EXACTLY ONE — no second shape is run here)

NEW policy file scripts/policies/leadcourt-tendseason-b.js =
leadcourt-tendthrough with EXACTLY ONE change: the tend condition
gains the below-seasoned-bar predicate (tend only if age < 30d OR
trust < 40). Everything else is leadcourt-tendthrough verbatim:
weekly cadence (tendedWeek check unchanged), Haven-primary links
only, 1,500 kcal engine cost per tend, NO pantry tend gate of any
kind (tend-through has none; this arm adds none back — no 20,000
gate, no 13,500 floor), proposal gate pantry > 12,000 unchanged,
answer/counter logic unchanged. Policy id:
'leadcourt-tendseason-b'. This shape must never appear as a
post-hoc rescue for another arm, and no other variant, floor, or
shape is judged in this run.

## Pre-registration (committed before any judged sim)

- Baseline leg: scripts/policies/leadcourt-tendthrough.js
  VERBATIM from master (this branch's committed copy, verified
  unmodified: `git diff HEAD` empty for that file; this arm
  never edits it). Re-run on the SAME fresh seeds as the armed
  leg — the judged baseline is this leg's own tend-through
  numbers on 99209–99216, NOT the cited 994xx or 99001–99008
  numbers (different seeds, different timelines; those are
  background only and are never pooled with this leg).
- Armed leg: scripts/policies/leadcourt-tendseason-b.js (new
  file, described above). leadcourt.js untouched. ZERO src/js
  changes. ZERO gate/price/deed number changes. This is a
  policy-side measurement arm; no default flip is proposed.
- Seeds (pilot): 99209–99216, FRESH — verified before this
  prereg: no dated evidence .md in evidence/2026-11-04/ names
  any of 99209–99216 (substring grep, 0 hits each), no
  per-seed corpus filename in evidence/2026-11-04/perseed-*/
  carries any of them (0 hits each), and no dated evidence .md
  of ANY date names any of them as a bare word (0 hits each);
  the band is absent from the task's forbidden list
  (99001–99008 tendfloor pilot, 99009–99024 tendfloor-guard
  confirm, 994xx recovery bands, 996xx, 998xx) and from
  today's other bands. Identical seeds on both legs, 16 runs
  total.
- Confirm band (pre-stated here, so a confirm is legitimate
  WITHOUT a later addendum): 99041–99052 (12 seeds), verified
  fresh the same way as the pilot band (no .md name in
  evidence/2026-11-04/, no corpus filename, no bare-word .md
  hit on any date; absent from the forbidden list and from
  today's other bands). Confirm runs ONLY on a pilot GO, and
  only on this band, and only with this prereg's metric
  (including the drop guard). If the pilot is NO-GO or
  INSUFFICIENT-DATA, no confirm is run on any band. The
  pilot verdict is this worker's deliverable; a pilot GO
  leaves the confirm to the coordinator unless this run
  still has time to run it on the pre-stated band — a
  confirm run without a pilot GO, or on any other band, is
  forbidden.
- Horizon: 300 days, death-aware (dead villages stop
  simulating; +10d tail max as implemented by runDays). WHY
  300: identical window to tendfloor and 0930Z, so per-seed
  death-day deltas are like-for-like; the death-aware stop
  bounds cost (tendfloor max survival 195d; 300 was never
  binding). A village alive at 300 is censored, reported as
  survived, not as a win.
- Instrument: the diplo instrument
  (scripts/diplo-instrument-20261104.js) REUSED verbatim via a
  new parameterized driver
  (scripts/test-tendseason-driver-20261104.js, output
  evidence/2026-11-04/perseed-tendseason-b/, RUN=tendseason-base
  for the tend-through leg and RUN=tendseason-armed for the
  below-bar leg) and the polityfrag analyzer
  (scripts/test-polityfrag-analyze-20261104.js) REUSED verbatim
  through a new wrapper
  (scripts/test-tendseason-analyze-20261104.js). The snapshot
  NEVER calls villageStandingTotal() or unlockedWave(); ONE
  end-of-run unlockedWave() call is reported separately and
  never counted as a natural door-open. The driver refuses to
  overwrite an existing per-seed file. Substrate is the same
  as tendfloor (leadcourt family, diplo instrument verbatim) —
  no instrument change is claimed or needed.
- Survival bands (same as tendfloor/0930Z): A = survived to the
  300d horizon, B = died 150–299d, C = died 100–149d, D = died
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
- Tend classification (fixed here, must match the policy
  predicate exactly): a tend on day D is classified from the
  LATEST daily snapshot with day < D (pre-tend state — the
  driver snapshots AFTER that day's policy run, so the
  same-day snapshot already carries the tend's own +8 trust
  and cannot be used). From that snapshot's link detail
  (link.day, link.trust): seasoned iff (snapDay - link.day
  >= 30) AND (trust >= 40); otherwise below-bar. No earlier
  snapshot carrying the link's detail = unknown. A seasoned
  tend on the armed leg is a premise violation (the variant
  as defined was not run), not a data point.

## PRIMARY METRIC + GO THRESHOLD (binding)

Per-seed: death-day delta (armed days minus baseline days),
survival band vs baseline, hold-share contribution, drop
events, tend counts by pre-tend seasoned state (below-bar /
seasoned / unknown), ever-faced wave 4/5.

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
      lost per wave);
  (e) DROP-COUNT GUARD (added per the tendfloor metric review,
      pre-registered here before any sim, not retrofitted):
      armed total drops <= baseline total drops + 1.
Otherwise NO-GO. A miss is NO-GO, never re-scored against a
friendlier metric mid-run. A guardrail breached is NO-GO even
if (a)–(d) pass (§14: guardrails are metrics too).
INSUFFICIENT-DATA only if > 2 seeds in either leg carry
instrument errors, or the baseline leg has zero diplomacy
seeds (hold-share unjudgeable), or the armed leg records
zero below-bar tends (lever never fired), or the armed leg
records any seasoned tend (variant as defined not run).

## SECONDARY (reported, not judged)

Wall numbers every run — wins, national/table (scaleRank
end-state; table not instrumented by this arm, stated not
faked), wave 4–5 unlocks (maxWave) and ever-facing (defined
above), median/max survival, death-cause shares, ready days,
trajectories, drop/recovery counts, tend totals by pre-tend
seasoned state (to prove the restriction actually bit: armed
seasoned tends must be zero, and below-bar tends must be
nonzero for the lever to have fired at all — a zero in the
below-bar column on the armed leg means the restriction
never mattered and the pilot measured nothing, reported as
INSUFFICIENT-DATA per the metric above, not as a pass).
Arc reach: not instrumented (stated, not faked). LEAD vs
BELONG shape reported per seed.

## SENSE-TEST (SENSE-TESTING LAW)

Sample say-lines/transcripts around tend weeks and any drop
days on BOTH legs; quote at least one real transcript line per
leg where tending (or its absence) shows; judge whether a held,
collapsed, or never polity reads as a consequence of things
villagers did, and flag anything robotic, static, or repeated.
Known capture limit carried from tendfloor/0930Z: the
instrument's SAY_RE does not match tendLink's own say-lines,
so tend lines are proven by event counts, not quoted lines,
unless a captured line matches.

## BALANCED PANEL (§15)

Before/after comparison on identical seeds (same 8 seeds,
baseline = this leg's tend-through run, candidate = below-bar
run). The panel instrument is the polityfrag analyzer over
identical-seed per-seed JSONs plus the tendseason wrapper's
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
