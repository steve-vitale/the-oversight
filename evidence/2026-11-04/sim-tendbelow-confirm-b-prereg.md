# Tend-through ONLY below the seasoned bar, decision-time classifier — CONFIRM — Loop B, arm sim-tendbelow-confirm-b — PRE-REGISTRATION

Axis: scale-onramp / winnability chain (wild ally-join → wave-4
kills → veterans → readiness-5 release → wave-5 facing → full
seat). This is the CONFIRM of the PILOT GO in
`evidence/2026-11-04/sim-tendbelow-b.md` (Loop B 1735Z run,
fresh band 91501–91508, decision-time classifier). It tests
ONLY the tend-below-seasoned-bar variant, on a THIRD FRESH
band, with the decision-time classifier and the pilot's
guards (a)–(e) carried verbatim PLUS a new rung guard (f).
It never tests zombie-clearing, never bundles legs, never
touches the sibling arm sim-standaccum-b (same coordinator
run — its tree is never touched), any Loop A tree/claim/
branch, the HELD branch sim-recovery-zombie-b, or the
orphaned sim-fracchoice-b tree.

## Canon read before this prereg

- docs/CANON.md (manifest) read first. docs/SCALE.md read:
  1 season = 30 days; ladder is one rung per season
  (VILLAGE 1–30, REGIONAL 31–60, NATIONAL 61–90, GLOBAL
  91+); a polity is one primary with >= 3 SEASONED
  subordinates; seasoned = 30+ days old AND trust 40+
  (links form at trust 30 — tending required); national
  cannot stage until Haven has been regional for a full
  season.
- No canon doc covers the diplomacy pipeline's day-to-day
  trust mechanics in the same detail — stated here instead
  of inventing canon (same statement as sim-tendfloor-b,
  sim-tendseason-b, and the pilot). Trust mechanics read
  from src/js/hierarchy.js tendLink/_linkSeasoned/_formLink
  code before the pilot prereg and re-verified for this
  confirm: tending is a POLICY verb, weekly (tendedWeek),
  engine tendLink costs 1,500 kcal (partial credit if the
  pantry holds less, zero if bare), once per week per link,
  refused during mourning. _linkSeasoned counts a link
  toward a polity when it is 30+ days old AND trust 40+
  (conquered links: season only; mercy/succ-polity graces
  are polity-membership-only readings and never change
  link.trust). _formLink sets link.day = formation day and
  link.trust = 30 at birth. The proposal gate in the
  leadcourt POLICY is pantry > 12,000 kcal.
  scaleRank() (src/js/hierarchy.js) returns
  village/regional/national/global from the
  nationalLive/globalLive/networkLive flags — global
  implies national implies regional, never a skip. Rung
  order for leg (f): village = 0, regional = 1,
  national = 2, global = 3.

## Why a confirm (not a re-score)

The pilot judged PILOT GO on 91501–91508 under the fixed
decision-time classifier; tendseason's earlier
NO-GO-shaped result stands on its own band (99209–99216)
under the mislabeling snapshot classifier and is NOT
re-scored here. The pilot's metric review item 1 named
the gap this confirm closes: end-state rung downgrades
(91503 and 91506, global → regional) escaped all five
pilot GO legs when a village holds to death a rung lower.
This confirm re-judges the variant on a third fresh band
with guards (a)–(e) verbatim and a new binding rung
guard (f). A GO here is a confirm, not a reversal of
tendseason; a NO-GO corroborates tendseason on a second
band under the fixed classifier.

## Predicate (defined from code before any sim; pilot verbatim)

A link IS seasoned iff (scholar day - link.day) >= 30 AND
(link.trust || 0) >= 40. This policy tends iff NOT that:
age < 30 days OR trust < 40. Fields named: link.day
(formation day, set in _formLink), link.trust, scholar
day. Mercy and succ-polity graces are polity-membership-
only and never change link.trust, so they do not move
this predicate. Conquered links need the season alone for
polity membership, but this policy never raids, and the
raw trust bar is the conservative reading: a
seasoned-age link under trust 40 is exactly a link at
risk of unseasoning, so it gets tended. A seasoned link
is never tended by this policy.

## Decision-time seasoned test (pilot verbatim)

THE RULE: a tend's seasoned state is read from the live
link object at the moment of the tend call — NOT from
any daily snapshot.

- Mechanism: the driver installs the diplo instrument
  verbatim, then wraps Game.tendLink a second time
  (outer wrapper, call-through, RNG-neutral). The outer
  wrapper runs synchronously inside the policy's tend
  call: it reads Game.hierarchyState(), finds the live
  link by id, copies link.trust and link.day and the
  scholar day BEFORE calling through, computes
  seasoned = (day - link.day >= 30) && (trust >= 40),
  then calls the instrument-wrapped tendLink, captures
  its return value (paid kcal: ret > 0 = grain sent,
  ret = 0 = refused — bare pantry, mourning, or
  already-tended-week), and records one
  tendDecisionEvent { day, link, preTrust, preDay,
  preAge, preSeasoned, paid, cls }.
- Why this closes the gap: the policy's own predicate
  reads the same live link object in the same synchronous
  call stack (policy checks belowSeasonedBar, then
  immediately calls tendLink; the wrapper reads the same
  state before any other code runs). No day boundary, no
  snapshot, and no intra-day trust move can intervene
  between the policy's decision and the classifier's
  reading — they read the same values.
- Approximation stated honestly: NONE for the seasoned
  classification itself — it is exact at decision time.
  The remaining approximation is scope, not timing: the
  classifier covers tendLink calls only (the only tending
  verb in this policy family); trust moves from other
  verbs between tends are visible only in the next tend's
  pre-call read or in daily snapshots, which is exactly
  the right granularity for judging "did this policy tend
  a seasoned link." Snapshot-based classification is NOT
  used anywhere in this arm — no fallback, no blending.
  If a tendDecisionEvent is missing for any tendLink
  courtship event (counts must match exactly), the run
  is INSUFFICIENT-DATA (see below), never silently
  snapshot-classified.
- Paid vs call counts: tend totals are reported BOTH as
  call counts and as paid tends (ret > 0, grain actually
  sent) with paid kcal summed, because call counts include
  bare-pantry refusals (tendseason: 300 of the baseline's
  483 calls paid nothing). The judged lever-fired and
  premise conditions use decision-time CALLS (the policy
  decision is what the variant controls); paid totals are
  reported alongside so grain actually sent is never
  overstated.

## Primary variant (EXACTLY ONE — no second shape is run here)

Policy file scripts/policies/leadcourt-tendbelow-b.js
ON MASTER (this branch's committed copy, verified
unmodified: worktree `git status` clean at prereg time;
this arm never edits it) = leadcourt-tendthrough with
EXACTLY ONE change: the tend condition gains the
below-seasoned-bar predicate (tend only if age < 30d OR
trust < 40). Everything else is leadcourt-tendthrough
verbatim: weekly cadence (tendedWeek check unchanged),
Haven-primary links only, 1,500 kcal engine cost per
tend, NO pantry tend gate of any kind (tend-through has
none; this arm adds none back — no 20,000 gate, no
13,500 floor), proposal gate pantry > 12,000 unchanged,
answer/counter logic unchanged. Policy id:
'leadcourt-tendbelow-b'. This shape must never appear as
a post-hoc rescue for another arm, and no other variant,
floor, or shape is judged in this run.

## Pre-registration (committed before any judged sim)

- Baseline leg: scripts/policies/leadcourt-tendthrough.js
  VERBATIM from master (this branch's committed copy,
  verified unmodified: worktree `git status` clean at
  prereg time; this arm never edits it). Re-run on the
  SAME fresh seeds as the armed leg — the judged baseline
  is this leg's own tend-through numbers on 91301–91316,
  NOT the pilot's 91501–91508 numbers or any other band's
  numbers (different seeds, different timelines; those
  are background only and are never pooled with this
  leg).
- Armed leg: scripts/policies/leadcourt-tendbelow-b.js
  (on master, described above). leadcourt.js untouched.
  leadcourt-tendseason-b.js untouched (sibling arm's
  file — read for the classifier lesson, never edited).
  ZERO src/js changes. ZERO gate/price/deed number
  changes. This is a policy-side measurement arm; no
  default flip is proposed.
- Seeds (confirm): 91301–91316, FRESH — verified before
  this prereg: no dated evidence .md in this worktree's
  evidence/ (ALL dates) names any of them as a bare word
  (word-boundary grep, 0 hits each band-wide across the
  .md scan), no per-seed corpus filename in evidence/
  carries any of them (exact-token filename search, 0
  hits), and the band is absent from the task's forbidden
  list (pilot 91501–91508, tendseason 99209–99216,
  fleerepair 99601–99612, exphurt 99917–99932, gearbar
  99101–99108, and the tracker's other 2026-11-04 bands)
  and from the goal tracker's band list. Scope stated
  honestly: the check covers this worktree's evidence/
  plus the goal tracker/sim-findings; the sibling
  sim-standaccum-b arm shares this coordinator run but
  its evidence is not merged into this tree, so its band
  (if any) was not visible here at prereg time — a
  collision found later by the coordinator is a
  coordinator-level flag, never a re-score of this
  verdict. Incidental whole-word hits for 91306/91310
  inside OLD JSON corpora were spot-checked and are
  pantryKcal/freshKcal VALUES (e.g. pantryKcal 91306),
  not seed uses, and do not touch the .md/filename
  freshness criteria. Identical seeds on both legs, 32
  runs total.
- Horizon: 300 days, death-aware (dead villages stop
  simulating; +10d tail max as implemented by runDays).
  WHY 300: identical window to tendfloor, 0930Z,
  tendseason, and the pilot, so per-seed death-day
  deltas are like-for-like; the death-aware stop bounds
  cost (pilot max survival 125d; 300 was never binding).
  A village alive at 300 is censored, reported as
  survived, not as a win.
- Instrument: the diplo instrument
  (scripts/diplo-instrument-20261104.js) REUSED verbatim
  and the polityfrag analyzer
  (scripts/test-polityfrag-analyze-20261104.js) REUSED
  verbatim, through NEW confirm copies of the pilot
  driver/analyzer (scripts/test-tendbelow-confirm-
  driver-20261104.js, output
  evidence/2026-11-04/perseed-tendbelow-confirm-b/,
  RUN=tendbelow-confirm-base for the tend-through leg
  and RUN=tendbelow-confirm-armed for the below-bar leg;
  scripts/test-tendbelow-confirm-analyze-20261104.js,
  which reuses the pilot analyzer's summarizeLeg/
  pairSeeds/judgeGo and adds ONLY the leg (f) rung
  judge). The pilot driver/analyzer files themselves are
  NOT edited. The snapshot NEVER calls
  villageStandingTotal() or unlockedWave(); ONE
  end-of-run unlockedWave() call is reported separately
  and never counted as a natural door-open. The driver
  refuses to overwrite an existing per-seed file.
  Substrate is the same as the pilot (leadcourt family,
  diplo instrument verbatim) — no instrument change is
  claimed or needed beyond the confirm copies, which
  change only the output directory, RUN names, and the
  added rung judge.
- Interim catastrophic-stop rule (NOT a verdict): after
  the armed leg's first 8 seeds are paired with the
  baseline, if band regressions >= 3, OR armed drops
  >= baseline drops + 3, OR any premise violation
  (armed decision-time seasoned tend, unknown tend, or
  decision-record mismatch), STOP the run and report
  STOPPED with the interim table — do not burn the full
  band, and do not claim a GO/NO-GO verdict on a half
  band. Otherwise complete all 16 seeds and judge only
  on the full band.
- Survival bands (same as tendfloor/0930Z/tendseason/
  pilot): A = survived to the 300d horizon, B = died
  150–299d, C = died 100–149d, D = died < 100d. Death day
  = the driver's reported days for the run.
- Wave facing (ever-faced, defined here because the
  reused analyzer's w4faced/w5faced fields read only the
  LAST snapshot): a seed has faced wave 4 (resp. 5) iff
  ANY daily snapshot in its per-seed JSON carries
  w4faced (resp. w5faced) true via Game.waveEngaged.
  Counts are per leg (seeds facing / 16). This definition
  is fixed here, before any sim, and applies identically
  to both legs.
- Hold-share (pooled, per leg): over diplomacy seeds
  only (firstDiploDay != null), sum of post-first-diplo
  snapshots divided by sum of post-first snapshots, from
  the reused analyzer's per-seed fields. If the baseline
  leg has zero diplomacy seeds, the hold-share leg cannot
  be judged and the verdict is INSUFFICIENT-DATA, not a
  pass.
- Tend classification (fixed here, decision-time only):
  a tend's class is its tendDecisionEvent.cls:
  'seasoned' iff preAge >= 30 AND preTrust >= 40,
  otherwise 'below'. No 'unknown' class exists in the
  decision-time scheme except a missing decision record
  (link not found in hierarchyState at call time — the
  policy obtained the link from the same list, so this
  should not occur; if it does, that event is 'unknown'
  and the counts-must-match check fires
  INSUFFICIENT-DATA). A decision-time seasoned tend on
  the armed leg is a premise violation (the variant as
  defined was not run), not a data point.
- Rung classification (fixed here, for leg (f) only):
  end-state scaleRank per seed per leg, from the
  driver's reported scaleRank (Game.scaleRank() at end
  of run). Rung order: village 0, regional 1, national 2,
  global 3. A seed counts as an ARMED downgrade iff
  order(armed) < order(baseline); as a BASELINE
  downgrade iff order(baseline) < order(armed) (i.e.
  the armed leg ends a rung higher — the symmetric
  paired comparison). Ties are neither. If either leg's
  scaleRank is null/unknown on a seed, that seed counts
  for neither side and is listed by seed; if MORE THAN
  2 seeds have an unknown rank on either leg, the
  verdict is INSUFFICIENT-DATA (rung guard unjudgeable),
  mirroring the instrument-error spirit. National+
  counts (regional+ vs national+ vs global) are reported
  alongside the guard.

## PRIMARY METRIC + GO THRESHOLD (binding)

Per-seed: death-day delta (armed days minus baseline
days), survival band vs baseline, hold-share
contribution, drop events, tend counts by decision-time
seasoned state (below-bar / seasoned / unknown) plus
paid tends and paid kcal, ever-faced wave 4/5,
end-state scaleRank rung vs baseline.

GO iff ALL of the following hold:
  (a) NO survival-band regression on ANY seed (armed band
      strictly below baseline band on any seed = fail);
  (b) median death-day delta (armed minus tend-through
      baseline, over all 16 seeds) >= -5 days;
  (c) armed pooled hold-share >= baseline pooled
      hold-share - 0.05 (hold preserved within five
      points);
  (d) WAVE-FACING GUARD: armed ever-faced wave-4 count
      >= baseline wave-4 count - 1, AND armed ever-faced
      wave-5 count >= baseline wave-5 count - 1 (at most
      one facing lost per wave);
  (e) DROP-COUNT GUARD: armed total drops <= baseline
      total drops + 1;
  (f) RUNG GUARD (NEW): armed downgrade count <=
      baseline downgrade count (paired end-state
      scaleRank comparison defined above — net rung
      movement not negative; the pilot's 91506 shape,
      holds-to-death a rung lower with no band regression
      and no drop, is now counted: on the pilot band
      this guard would have read armed 2 vs baseline 0
      and FAILED).
Otherwise NO-GO. A miss is NO-GO, never re-scored against
a friendlier metric mid-run. A guardrail breached is
NO-GO even if (a)–(e) pass (§14: guardrails are metrics
too). On GO, report CONFIRM GO; on NO-GO, report
NO-GO; everything is committed anyway (the coordinator,
not this worker, decides merge vs branch deletion).
INSUFFICIENT-DATA only if > 2 seeds in either leg carry
instrument errors, or the baseline leg has zero
diplomacy seeds (hold-share unjudgeable), or the armed
leg records zero decision-time below-bar tends (lever
never fired), or the armed leg records any decision-time
seasoned tend (variant as defined not run), or any tend
lacks a decision-time record (counts mismatch) or is
'unknown', or more than 2 seeds carry an unknown
end-state scaleRank on either leg (rung guard
unjudgeable). The interim-stop case reports STOPPED,
not a verdict.

## SECONDARY (reported, not judged)

Wall numbers every run — wins, national/table
(scaleRank end-state; table not instrumented by this
arm, stated not faked), wave 4–5 unlocks (maxWave) and
ever-facing (defined above), median/max survival,
death-cause shares, ready days, trajectories,
drop/recovery counts, tend totals by decision-time
seasoned state plus paid tends/kcal (to prove the
restriction actually bit: armed decision-time seasoned
tends must be zero, and below-bar tends must be nonzero
for the lever to have fired at all). Arc reach: not
instrumented (stated, not faked). LEAD vs BELONG shape
reported per seed.

## SENSE-TEST (SENSE-TESTING LAW)

Sample say-lines/transcripts around tend weeks and any
drop days on BOTH legs; quote at least one real
transcript line per leg where tending (or its absence)
shows; judge whether a held, collapsed, or never polity
reads as a consequence of things villagers did, and flag
anything robotic, static, or repeated. Known capture
limit carried from tendfloor/0930Z/tendseason/pilot:
the instrument's SAY_RE does not match tendLink's own
say-lines, so tend lines are proven by event counts and
return values, not quoted lines, unless a captured line
matches.

## BALANCED PANEL (§15)

Before/after comparison on identical seeds (same 16
seeds, baseline = this leg's tend-through run,
candidate = below-bar run). The panel instrument is the
polityfrag analyzer over identical-seed per-seed JSONs
plus the tendbelow wrapper's delta/GO judge and the
confirm rung judge; no balance-panel.js compare is
fabricated — the per-seed before/after table IS the
panel output for this trajectory metric, and any
balance-panel.js refusal or field-shape mismatch is
recorded honestly, not worked around by re-scoring. The
telemetry deviation check (scripts/telemetry-check.js
against the scale-wall baseline) is ATTEMPTED and its
outcome reported honestly (REFUSED/INAPPLICABLE with
reason is acceptable — never a fabricated compare,
never a --allow-recorder-corpus workaround).

## HARD LIMITS (binding, honored)

No gate/price/deed change; no src/js change; no edit to
leadcourt.js, leadcourt-tendthrough.js, or
leadcourt-tendseason-b.js; no edit to the pilot driver/
analyzer files; no edit to any sibling policy; no
zombie-clearing mechanism; no propose/tend verb added
or removed; no file owned by another arm touched; no
Loop A tree/claim/branch touched; no HELD branch adopted,
merged, or re-run; no push, no bump, no live verification,
no merge to master (coordinator merges).

## Metric review (placeholder — completed in the evidence file)

The evidence file carries the completed metric review:
what the metric proved, what it missed, and any revision
proposed for the NEXT run (never applied in-run).
