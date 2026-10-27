# sim-raidcallers-b — PRE-REGISTRATION (written BEFORE any judged sweep, 2026-10-27)

Run: oversight-flesh-out-loop-b, axis food-economy. Arm: sim-raidcallers-b.
DIAG/measurement only: ZERO src/js changes, no default flips, no game-code
lever. This arm does NOT re-judge the raiddor GO, the stockdoors NO-GO,
the residualhunt GO, the residual2b phase-1 NO-GO, or the ledgerbound
PILOT GO / CONFIRM-GO — their verdicts stand in their own evidence. Its
verdict is ONLY whether the family ledgers close under the boundary
definition WITH ALL _removePantryKcal callers counted (not just the
unanswered-raid caller), and whether every fired non-raid caller record
is named to its caller frame. Judged ONLY against this prereg.

## Context (read before designing; verdicts not re-judged)

- evidence/2026-10-27/sim-raiddor-ledger-b.md + prereg (on master):
  wrapped the _removePantryKcal raid door (caller villageAgencyDaily,
  unanswered-raid 800) and closed the ledger on two bands — but on 20
  villages x 100 days ONLY the raid caller fired. The other callers
  (tributes, dues, aid, beg answers, answered-raid give/hold-overrun —
  callers in hierarchy.js, comms.js, membership.js, safetynets.js,
  betrayal.js, havenGrowth.js, villageAgency.js non-raid paths) never
  fired on competent-nofeast play. This arm is the 0835Z next blank (1):
  a regional-politics band exercising those other callers.
- evidence/2026-10-27/sim-ledgerbound-b.md + prereg: boundary definition
  (closing snapshot after the final day's flows settle, end of day 100,
  after meal draws; day-101 sweeps post-horizon and excluded).
- Backlog item claimed by this arm (goal hidden_files/sim-findings.md):
  "OTHER _REMOVEPANTRYKCAL CALLERS UNEXERCISED" (2026-10-27, raiddor
  evidence) — marked [claimed 2026-10-27 by fleshout-loop-b arm
  sim-raidcallers-b] at arm start.

## PRE-REGISTERED GO (verbatim — judge ONLY against this)

GO iff ALL of (a) pilot band seeds 9951-9958 (belongseek-nofeast,
current-base — see base rule) fires at least one non-raid
_removePantryKcal record AND every fired non-raid caller record is
named to its caller frame (unknown-caller records == 0, band total);
AND (b) the pilot band closes under the caller-complete boundary
definition (see below): named rate >=80% AND pooled within 1%, generic
rate >=80% AND pooled within 1%, dried pooled within 2%; AND (c) a
fresh confirm band of 12 seeds (9962-9973) on the same base, policy,
and horizon meets the same naming bar and the same three channel bars.

Named-row rule (same as raiddor's, fixed before judging): if a band
yields fewer than 8 named family-seed rows, the named rate bar is NOT
judged (report pooled bars only + the row count) — do NOT claim a
rate GO on <8 rows, and do NOT lower the threshold mid-run. The same
rule applies to the generic rate bar (fewer than 8 generic rows ->
pooled-only). A band with zero non-raid records is DIAG-NO-GO
(coverage still open) with the census reported — NEVER a pass on
silence, and never re-scored against the raid-only legs.

A miss on any clause is NO-GO (or DIAG-NO-GO where stated), never
re-scored against a friendlier metric mid-run. If the metric proves
wrong, write it under "metric review" and propose the revision for
the NEXT run. A det-gate or coverage failure is DIAG-NO-GO
(instrument, not game). The confirm band never overrides the pilot
verdict; it is reported alongside it.

## Base rule (current HEAD, NO pin)

The base is current master HEAD at prereg time:
6ae5049d88d6c22192489dca51a5160d90606daf (worktree HEAD, the
coordinator's merged 0835Z commit). NO base pin: raiddor's pin was
pre-c04d4e0cb and its trajectories must not be cited as current-base
trajectories. All sweeps + proofs run on this HEAD. Any base move
between prereg and sweep is reported, never hidden. The pin discipline
from raiddor does NOT apply here — there is no blob to swap, and the
proof carries no pinned-base allowance (any src/js difference vs HEAD
fails hygiene).

## Boundary definition (ledgerbound's + raiddor's + ALL callers)

Ledgerbound boundary, unchanged: closing snapshot taken after the
final day's flows settle (end of day 100, after meal draws), with
day-101 sweeps treated as post-horizon and excluded from the judged
ledger. Boundary closing for a family = corpus closing + day-100
stockSurplus pushes (Foraged food only) - day-100 meal draws
(pantryDraw + drawSpoiled, day 100). Boundary dried closing = corpus
dried closing - day-100 dried meal draws. Boundary flows =
NEW-definition flows dated <= 100; flows dated > 100 are post-horizon
and excluded.

RAIDDOR ADDITION (control, not judged here): raid-unanswered draws
count as draws, with post-snapshot raid takes (dated == the
closing-snapshot day) subtracted from the boundary closing.

CALLER-COMPLETE ADDITION (the judged legs of this arm): EVERY
_removePantryKcal record — raid-unanswered AND removepantry-<caller>
— dated <= 100 counts as a draw in the boundary ledger, split
base/dried by item name, and records of ANY caller dated == the
closing-snapshot day are post-snapshot: they are subtracted from the
boundary closing (total and dried portion), mirroring the day-100
meal adjustment. A kcal recorded by the _removePantryKcal door must
not also appear in another door's records for the same event
(disjointness proven in the proof: method sets disjoint, plus no
shared day/name/spoilDay/units tuple between _removePantryKcal and
direct records).

## Instrument (vendored under NEW raidcallers names, zero sibling modifications)

- scripts/sweep-raidcallers-b.js (vendored from raiddor's sweep;
  output dir/file prefix, mode string, staging dir, capture require
  adapted; PLUS a POLICY env selecting the policy object:
  competent | belongseek | scalecourt | treeline (withTreeline over
  competent) | warcourt | kind — every candidate wraps the
  competent substrate, so the nofeast gates still apply).
- scripts/analyze-raidcallers-b.js (vendored from raiddor's analyzer;
  old-boundary, ledgerbound-boundary, and raiddor legs byte-identical
  and reported alongside as controls; the NEW legs are the
  caller-complete legs leg3c/leg4c/leg5c + the non-raid naming
  census).
- scripts/test-raidcallers-b.js (proof; see below).
- scripts/trace-raidcallers-b.js (vendored from raiddor's trace; ALL
  _removePantryKcal caller records counted in the transition flows).
- scripts/stockdoors-capture-raidcallers.js (vendored from raiddor's
  capture, header adapted; the _removePantryKcal snapshot-diff
  recorder is unchanged — it already records every caller under its
  own caller frame, raid-unanswered iff caller is
  villageAgencyDaily, else removepantry-<callerFn>).
NEVER modified: any sibling capture file (inflow/mealdraw/spoilvol/
driedpath/stockdoor-capture, ledgerbound files, raiddor files) or
any src/js file.

## Policies + horizon + seeds

Policies: belongseek-nofeast (the census pick — see "Census basis"
below). Env: COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0,
DEPOSITGATE=1, FEASTSCALE_R13 off; belongseek default (BELONG_V3
unset); no treeline/warcourt layer envs. The census bands used the
same nofeast gates with their own policy + layer envs (treeline:
TREELINE=1; warcourt: WARCOURT_RAID=1, IRONCOURT_ANSWER=mercy).
Horizon: 100 days, death-aware (a seed that dies ends early; dead
villages stop simulating) — the raiddor horizon, and the horizon
the boundary question lives on.
Pilot: 8 seeds (9951-9958) before ANY confirm spend (pilot gate).
Confirm: 12 fresh seeds, 9962-9973, collision-checked before this
prereg commit: no corpus JSON filenames for these seeds in
evidence/2026-10-26/ or evidence/2026-10-27/ corpus dirs, no seed
mentions in dated evidence .md files for these seeds (bands
9900-9911 and 9930-9941 were rejected — mentioned in the
ledgerbound prereg as contaminated; 9950 and 10000 were rejected
as range endpoints mentioned in that prereg), not present on the
ledgerbound or raiddor branches, and distinct from census seeds
9500-9503 and from spent-but-unjudged 9768-9779 (never reused as
fresh).

## Census basis (SCREEN, not judged — run before this prereg commit)

Short census sweeps (3 seeds x 100d, seeds 9500-9502, same nofeast
gates) across candidate policy bands, counting non-raid
_removePantryKcal records per caller:
- competent (4 seeds, 9500-9503): 8 raid-unanswered records, 0
  non-raid — reproduces the raiddor finding on the current base:
  competent play never exercises the other callers.
- belongseek (9500-9502): 54 non-raid records, 4 raid-unanswered —
  payTribute 39, answerDemand 8, answerAccord 3, answerNationalChoice
  3, answerGlobalChoice 1; zero unknown callers. Ranks: national,
  national, global. THE PICK: the only band that exercises the
  tribute/dues/demand/accord/choice callers abundantly.
- scalecourt (9500-9502): 5 non-raid records (all answerAccord),
  2 raid-unanswered. Ranks: regional x3. Fires, but sparsely.
- treeline (TREELINE=1; 9500-9502): 0 _removePantryKcal records on
  all 3 seeds — no raids occurred on these trajectories, so no
  answered-raid give/hold-overrun could fire. (Say lines DO show
  treeline hold standoffs on 9502, days 36/66 — holds that ended in
  a count-back, not a pantry take. A future band hunting
  give/overrun specifically would need seeds where holds fail.)
- warcourt (WARCOURT_RAID=1; 9500-9502): 8 non-raid records
  (answerAccord 5, answerAidBeg 3 — the aid-beg answer channel does
  fire here), 2 raid-unanswered. Ranks: regional x3.
The judged band is belongseek: the band that actually fires non-raid
callers with named caller frames, abundantly and across 5 caller
frames. (Early signal at prereg drafting: belongseek seed 9500 alone
fired 19 non-raid records across 4 caller frames — payTribute 14,
answerDemand 3, answerAccord 1, answerNationalChoice 1 — with zero
unknown callers and zero raid-unanswered records; full census numbers
above.)

## Named-row rule (counting, fixed before judging)

A named family-seed row counts iff its boundary inflow >= 10000
(same focal filter as ledgerbound/raiddor). Named set: Lamb's
Quarters, Burdock, Muscadine Grapes, Purslane. Generic set: Foraged
food (alone). Dried pooled: pooled |dried-channel caller-complete
boundary residual| across all focal family-seeds, over pooled
transformed post-kcal (boundary definition, dated <= 100). Rate =
passing rows / counted rows within 1% per row. Pooled share =
|pooled residual| / pooled inflow (named/generic) or / pooled
transformed post-kcal (dried).

## Proof (must be GREEN on the current base before evidence commits)

scripts/test-raidcallers-b.js proves: corpus validity (policy =
RAIDCALLERS_POLICY, stockdoorsOn + raiddorOn true, no truncation,
all 7 direct methods wrapped); det-gate leg 1 (RAIDCALLERS on vs
off byte-identical on non-raid fields + reproduces the corpus
det-seed counts; det-gate seed = first corpus file's seed);
independent leg recomputation (second code path reproduces the
analyzer's pooled residuals for the OLD, boundary, raiddor, AND
caller-complete definitions); caller-complete verdict follows from
legs (GO iff leg1 + leg2 + caller-complete 3-5 + naming pass;
DIAG-NO-GO iff leg1/leg2 fails or zero non-raid records; NO-GO
otherwise); raid/non-raid integrity (item sums equal returned kcal;
path shapes; raid-unanswered caller is villageAgencyDaily);
raid/non-raid disjointness from the direct door (no shared
day/name/spoilDay/units tuple; _removePantryKcal absent from the
direct wrapped set); hygiene (zero src/js modified vs HEAD, zero
sibling files modified — including raiddor files — no modified
tracked file outside this run's own files). The proof runs on both
pilot and confirm corpora (RAIDCALLERS_CORPUS_DIR env).
Proof command (judged corpora): RAIDCALLERS_POLICY=belongseek-nofeast
RAIDCALLERS_CORPUS_DIR=<corpus> node scripts/test-raidcallers-b.js.

## Reachability + sense (reported, not judged)

Waves 1-5, regional/national/table/win on both bands — reported
honestly even when 0. Village assessment in plain words. Sense
note: at least one non-raid payment narration/transcript line
quoted if one exists in the corpus (say-lines or journal) — a
tribute/dues/aid payment read for meaning, coherence, and
consequence — or an explicit statement that the payment is silent
in the captured transcript (that silence is a finding, not a gap
to fill with invented narration).

## Balanced panel (MEASUREMENT.md §15)

This arm changes no lever and no game code, so there is no
before/after to panel. The det-gate is the instrument before/after
(raidcallers on vs off, byte-identical on non-raid fields). Not
forced, not faked — same statement as raiddor.
