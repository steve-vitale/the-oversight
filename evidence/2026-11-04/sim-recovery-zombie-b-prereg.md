# Zombie-clearing recovery test — Loop B, arm sim-recovery-zombie-b

Axis: scale-onramp / winnability chain (the recovery leg of the
polityfrag diagnosis). This arm tests ONLY zombie-clearing, never
tend-through, never both bundled. The sibling worker tests
tend-through with a leadcourt-tendthrough policy; this arm uses
scripts/policies/leadcourt.js VERBATIM and changes NO tending
behavior at all.

This arm is the recovery follow-up to sim-polityfrag-b
(evidence/2026-11-04/sim-polityfrag-b.md, run 0830Z). Gates,
win prices, and deed gates stay UNTOUCHED: this arm adds ONE
clearing rule to the engine, it does not retune any door.

## Canon read before this prereg

- docs/CANON.md (manifest) read first. docs/SCALE.md read: a
  polity is one primary with >= 3 SEASONED subordinates;
  seasoned = 30+ days old AND trust 40+ (links form at
  trust 30 — tending required); national cannot stage until
  Haven has been regional for a full season. No canon doc
  covers the diplomacy pipeline's day-to-day trust mechanics
  in the same detail — stated here instead of inventing canon;
  the trust mechanics below are read from src/js/hierarchy.js
  headers and linkTick code, not from a canon doc.
- docs/MEASUREMENT.md §§9–12, 14–15 apply as the loop brief
  encodes them (pilot gate, death-aware horizon,
  pre-registration, metric binding, balanced panel where a
  comparison exists — see the panel note below).

## Question (from polityfrag Finding 3, not re-litigated)

Polityfrag classified the zombie-link trap on 99402: a
trust-0 link still counts as an active subordinate, so no
replacement is ever proposed (0 re-proposals on 8 seeds)
and resumed tending counts as upkeep, blocking the neglect
snap — a polity sits at diplomacy 0 until village death
even when tending resumes. Question: if a trust-0
Haven-primary link is CLEARED from 'active', does the
polity recover — a fresh proposal, a fresh link, diplomacy
above 0 again — before the village dies?

## Code verification (done before writing the rule — the
candidate shape was checked against the code, not assumed)

- proposeLink's duplicate guard refuses ONLY active links:
  `linkWith()` skips every link whose status is not
  'active' (hierarchy.js linkWith). A broken link does NOT
  block a fresh proposal to the same village. Confirmed.
- leadcourt's proposal gate counts ONLY active links:
  `subs` counts links with `status === 'active'` and
  `primary === 'haven'` (scripts/policies/leadcourt.js).
  A broken link drops the count below 3, so proposals
  resume. Confirmed.
- The neglect snap is NOT a weekly mechanism: `_linkNeglected`
  is called ONLY from successionCrisis (speaker-death
  paths), never from the weekly linkTick. So the zombie's
  blockers are the active-count gate + the linkWith guard,
  NOT a blocked weekly snap — the prereg re-scopes the
  mechanism name accordingly. The clearing rule below
  removes both blockers at once by moving the link out of
  'active'.
- Trust-0 reach paths for Haven-primary links: weekly
  shortfall charges (-1 partial / -2 nothing, clamped at
  0) in linkTick's Haven-primary branch; succession
  haircuts (-8, clamped at 0); demand-refusal -15 applies
  only to BELONG links (subordinate === HOME), not here.
- breakLink already narrates aloud for non-peer links
  ("The link with X is broken (faded)..."), and a
  dedicated fading line is added so the clear reads as
  its own beat, not a generic break.
- Baseline scan (per-seed polityfrag JSONs, Haven-primary
  links only): exactly ONE link ever reaches trust 0 —
  99402's village_2, at the d134 snapshot (0 from d134
  to death d143). 99401's trust-0 link is a BELONG link
  (village_1 -> haven), out of this lever's scope, and it
  breaks d97 in baseline anyway. All other seeds' minima
  stay >= 22. Expectation (stated, NOT judged): at most
  one clear in the pilot, on 99402 around d134.

## The clearing rule (exact form, pre-registered)

In linkTick's Haven-primary branch, after the week's
tribute accounting and the speaker-death check, for each
link with `primary === HOME`, `status === 'active'`, NOT
conquered, with `trust <= 0`: say aloud that the bond
has faded to nothing and the table is open again, then
`breakLink(link.id, 'faded')`.

Semantics, stated exactly so the judged leg can be
checked against them:
- The clear fires at the WEEKLY accounting boundary —
  the only place Haven-primary trust moves week to week.
  A link that drops to 0 in a week's tick breaks at that
  same boundary; a link that drops to 0 mid-week via a
  succession haircut gets until the next weekly boundary
  to be tended back above 0 (a tend landing in between
  rescues it).
- A trust-0 link is necessarily unseasoned (trust < 40),
  so no separate seasoning condition is needed; a fresh
  link (formed at trust 30) cannot reach 0 in its first
  week by any reach path above.
- Conquered links are EXCLUDED: their revolt/sabotage
  rails already end them below trust 30, and this lever
  does not touch conquest.
- BELONG links (Haven subordinate) are EXCLUDED: the
  brief scopes this leg to Haven-primary links, and the
  sibling tend-through arm owns tending behavior.

## SCOPE GUARDS (binding, honored)

- Do NOT change trust math, tribute rates, the seasoned
  bars (age 30+ / trust 40+), polity size (3), gates, win
  prices, or deed gates.
- Do NOT touch the tend path or the pantry > 20,000 tend
  gate; leadcourt.js is used VERBATIM (no policy edit,
  no new policy file).
- Narration additions ONLY to say the clearing aloud
  (one dedicated line + breakLink's existing line).
- Known headwinds, NOT changed: breakLink's default
  opinion hit (-15) lowers a re-proposal's judgeLink
  score by ~7 (opinion/2); a re-formed link INHERITS the
  broken link's arrears (existing "debts survive the
  break" canon); leadcourt proposes only while pantry >
  12,000 kcal; a re-seasoned diplomacy recovery needs a
  fresh link + 30 days + trust 40, i.e. ~35+ days of
  post-relink village life. These headwinds are part of
  what the pilot measures, not bugs to fix in-run.

## Pre-registration (committed before any judged sim)

- Policy (judged leg): scripts/policies/leadcourt.js
  {leadcourt} VERBATIM (the CURRENT file at this anchor),
  default env. No policy file is created or edited.
- Seeds (judged leg): 99401–99404 + 99409–99412 — IDENTICAL
  to the polityfrag corpus, same policy, only the engine
  clearing rule differs. The baseline is CITED from
  sim-polityfrag-b.md, not re-derived by re-running
  leadcourt (no reproduction re-run; the pre-clear
  trajectories are deterministic under the unchanged
  code path, and any post-clear divergence is the lever's
  effect, reported as such).
- Horizon (judged leg): 300 days, death-aware (dead
  villages stop simulating; +10d tail max as implemented
  by runDays). WHY 300: the polityfrag drops sit at
  d89/d117 and the only trust-0 state at d134; 300d
  gives post-clear observation on survivors while the
  death-aware stop bounds cost. A village alive at 300
  is censored, reported as survived, not as a win.
  (Polityfrag's horizon was never binding — max 146d —
  and the same is expected here; the horizon question
  is answered by death, not by the cap.)
- Instrument: the diplo instrument
  (scripts/diplo-instrument-20261104.js) REUSED verbatim
  via a NEW driver (scripts/test-recoveryzombie-driver-
  20261104.js, output evidence/2026-11-04/
  perseed-recovery-zombie-b/, RUN=recoveryzombie); it
  refuses to overwrite an existing per-seed file. The
  recovery analyzer (scripts/test-recoveryzombie-
  analyze-20261104.js) REUSES the polityfrag analyzer's
  analyzeSeed and adds: clear events (Haven-primary
  link active -> broken with trust 0 at break, named
  with day and village), re-proposals after a clear,
  re-links after a clear (linkFormedEvents after the
  clear day), diplomacy recovery after a clear, and the
  GO judge below. The snapshot NEVER calls
  villageStandingTotal() or unlockedWave(); ONE
  end-of-run unlockedWave() call is reported separately
  and never counted as a natural door-open.
- PRIMARY METRIC (per seed): polity trajectory +
  hold-share (as polityfrag) + clear events with cause
  + recovery events + re-proposal / re-link events after
  a clear + survival class (see below).
- GO THRESHOLD: GO iff ALL THREE hold — (1) at least 1
  re-proposal + re-link follows a zombie clear on a
  baseline-collapsed seed (99402, 99403, or 99411); AND
  (2) diplomacy recovers > 0 on at least 1 seed; AND
  (3) no more than 1 seed regresses a survival class vs
  the polityfrag baseline. Otherwise NO-GO. A miss is
  NO-GO, never re-scored against a friendlier metric
  mid-run.
  - Survival class, operationalized: lost-before-100d /
    lost-100-to-200d / survived-to-300d. Baseline bands:
    99401 lost-98 (early), 99402 lost-143 (mid), 99403
    lost-118 (mid), 99404 lost-76 (early), 99409
    lost-111 (mid), 99410 lost-107 (mid), 99411
    lost-146 (mid), 99412 lost-64 (early). A regression
    = a seed moving to an earlier band than baseline.
  - "Baseline-collapsed seed" = a seed whose polityfrag
    trajectory is 'collapses' (99402, 99403, 99411).
  - "Re-link follows a clear" = a linkFormedEvent dated
    after the clear day on that seed (to any village —
    leadcourt proposes to the first known unlinked
    village, not necessarily the cleared one).
- SECONDARY (reported, not judged): wall numbers every
  run — wins, national / table (scaleRank), wave 4–5
  unlocks (peak transitions) and facing (waveEngaged),
  median survival, wave reach 1–5, death-cause shares,
  ready days. Arc reach: not instrumented by this arm
  (stated, not faked). Table: not instrumented (stated,
  not faked).
- SENSE-TEST (SENSE-TESTING LAW): sample say-lines /
  transcripts around clear, re-proposal, and recovery
  days (the fading line, breakLink's line, proposal /
  counter / decline narration, any "realm came apart"
  recurrence); judge whether a cleared bond and a fresh
  courtship read as consequences of things villagers
  did, and flag anything robotic, static, or repeated.
- BALANCED PANEL (§15): the comparison is a PAIRED
  per-seed before/after on identical seeds against the
  CITED polityfrag baseline values (same seeds, same
  policy, one engine change) — that pairing IS the
  panel discipline for this corpus. scripts/balance-
  panel.js is attempted as a supplement after the leg;
  it expects panel-format corpora (communityExposure
  etc.), not diplo per-seed JSONs, so if it refuses for
  field-shape reasons the refusal is recorded honestly
  and the paired per-seed table stands as the
  comparison — no panel comparison is fabricated.
- TELEMETRY DEVIATION CHECK: attempted after the leg
  (node scripts/telemetry-check.js against
  hidden_files/telemetry-baselines/scale-wall.json);
  if the tool refuses for field-shape reasons, the
  refusal is recorded honestly, never fabricated.
- The 8 seeds ARE the pilot/screening leg; do NOT
  expand to 12–16 on this worker's own authority —
  report the pilot verdict and let the coordinator
  decide on confirm.

## Metric review (placeholder — completed in the evidence file)

- The evidence file carries the completed metric review:
  what the metric proved, what it missed, and any revision
  proposed for the NEXT run (never applied in-run).
