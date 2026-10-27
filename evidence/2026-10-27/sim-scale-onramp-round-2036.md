# sim-scale-onramp-round-2036 — coordinator evidence (3 arms, merged locally pending ship)

Run: fleshout loop, run fleshout-20261027T2036Z. Axis: scale-onramp
(the blocking axis). Sibling loop B live on food-economy (claim
fleshout-loop-b-20261027T2030Z, trees sim-spandraw-design-b +
sim-stockdoors-b) — NOT touched at any point. Base at spawn
707c450e2; master moved once under the run (journey-establishment
r49, 8594fcd61, scripts-only, zero overlap) — all three arms
rebased clean onto it, proofs re-run green post-rebase, merged
ff-only in order vetsurvive -> standmeet -> overtime (each later
arm re-rebased onto the new master after the earlier merge, proofs
re-run each time). No push, no bump, live NOT verified — the ship
loop owns deploys. Zero src/js across the whole run.

## Plain words

Wave 5 opened. For the first time in this whole census family, a
village actually unlocked wave 5 — 74902, on day 165, a war-and-
links village, not a feast village. And the run also overturns the
story the last two runs told about why the door stays shut. The
old story was "killers die before the door opens." This run
watched three fresh bands and the killers mostly lived: the
vetsurvive killer is still standing 39 days after his kill, the
overtime band's two killers both lived, and standmeet has the
family's first killer alive at a winning village's end. What kills
the door is not death — it is scarcity. Across 24 villages, only
seven wave-4 kills happen at all, and no village ever holds two
living killers at once, which is what the door needs. One village
(74902) peaks at two living killers and opens — then both die and
the door's ratchet is all that remains. The opened door leads
nowhere yet: 15 days pass with no wave-5 monster met, no table
offer, because the full seat still needs wave-5 deeds and food
deeds the village lacks. So the wall moved one notch (wave 5 is
openable) and revealed its next shape (an opened-but-unplayed
wave 5, and a kill funnel that produces one kill per band).

The third arm reframes a standing question rather than answering
it: the "overtime docks" are not deductions from standing at all.
The overtime penalty is a seat price — it weakens the paths on
offer at the table, never the standing total that gates waves. And
on its band the clock never even started, because no village
reached the table: the lesser seat's food deeds and wave-3 bars
are the door there, not national standing. A future overtime
census needs a table-reaching band first, or it measures the
same zero again.

## Arms (all DIAG / MEASUREMENT ONLY, binding preregs)

Arm 1 — sim-vetsurvive-a (band 74801-74808): CENSUS-GO. 1 wave-4
kill, killer ALIVE at end (player's own kill, day 141, 39 days
censored survival). Dead killers 0, so no dominant death cause
and no dead-killer median — the emptiness is the finding. Kill
scarcity (1 kill / 8 seeds, third band running, 3 kills / 24
seeds) replaces killer death as the mechanism. Scholar-as-killer
is the only recorded identity in the family; villagers faced wave
4 repeatedly (74802/74807: 3 kinds each) and killed nothing.
Commits de193c40c / 57367eab9 / 4020fc46a (post-rebase).
Evidence: evidence/2026-10-27/sim-vetsurvive-a.md + prereg +
perseed-vetsurvive-a/. Proof validator ALL PASS (post-rebase and
from the main tree).

Arm 2 — sim-standmeet-a (band 74901-74908): GO (census complete).
Separation 0/5/2/1: high-standing-no-meeting 0, meeting-no-high-
standing 5, both 2, neither 1. The 74406 shape (standing 347,
zero meetings) does NOT replicate. First wave-5 unlock in the
family (74902, d165, gated 202, peak veterans 2, war 100 +
diplomacy 102 + plenty 0). Mirror seed 74908 (capped 252, gated
199, 4 meetings, 0 kills) proves the living killer is the binding
bar: both tracks met, no killer, door holds. First living wave-4
killer at end (74907). Rank-without-offer 0/8 — top rank does
NOT bypass the table; wave-5-without-offer (74902, national, no
offer, deeds short) is the real bypass shape. Commits
4234515ac / a0c3819a0 / 9245a6a8f (post-rebase). Evidence:
evidence/2026-10-27/sim-standmeet-a.md + prereg +
perseed-standmeet-a/. Proof validator ALL PASS.

Arm 3 — sim-overtime-a (band 75001-75008): INCONCLUSIVE — CLOCK
NEVER ELIGIBLE (binding prereg form, no re-score, no second
band). Firings 0/8, penalty 0/8, table 0/8: no village ever
qualifies for the lesser seat (food deeds block 4/8, wave-3
faced blocks 4/8), so the clock never starts and the dock
question is unasked on this band, not answered. Correction
established from code and reconciled to the w5seq replay
(-16 = tier 1 + 4 losses, -26 = tier 2 + 6 losses): the penalty
is min(40, 4t + 3l) on path strengths at the table, never a
standing deduction — retire "dock" for "seat price" in future
preregs. Secondary: wave-4 killers survive 2/2 here, and the
sequential wave-5 structure holds as a comparison column.
Commits 11f90c7a0 / 4e11742a8 / 10feb955e (post-rebase).
Evidence: evidence/2026-10-27/sim-overtime-a.md + prereg +
perseed-overtime-a/. Proof validator ALL PASS (after the
documented G11 correction: never-national seeds are an expected
shape, not a substrate failure).

## Pooled wall numbers (24 configs, this run only)

| field | pooled 24 | vetsurvive 74801-8 | standmeet 74901-8 | overtime 75001-8 |
|---|---|---|---|---|
| national ever / final | 22/24 / 16/24 | 7/8 / 5/8 | 8/8 / 6/8 | 7/8 / 5/8 |
| table invited / entered | 9/24 / 5/24 | 3/8 / 1/8 | 6/8 / 4/8 | 0/8 / 0/8 |
| wins (all feared lesser) | 5/24 | 1/8 | 4/8 | 0/8 |
| full seat | 0/24 | 0/8 | 0/8 | 0/8 |
| wave-4 unlock | 14/24 | 3/8 | 8/8 | 3/8 |
| wave-5 unlock | 1/24 | 0/8 | 1/8 (74902 d165) | 0/8 |
| wave-4 kills (band totals) | 7 | 1 | 4 | 2 |
| deaths / starvation | 836 / 9 (1.1%) | 284 / 6 | 306 / 2 | 246 / 1 |
| median survival (per band) | — | 180d | 174d | 180d |

Combat dominates deaths on all three bands (70-83% across the
combat causes); starvation is ~1% — the scale wall on these
bands is not food collapse. National is not the wall either
(22/24 reach it). The wall is now, in order: (1) the wave-4 kill
funnel (7 kills / 24 seeds, never 2 living killers on one
village at end); (2) the deed bars behind the table (w5 0/24
even where wave 5 opens; food deeds + w3-faced gate the lesser
seat on the stalled band); (3) the opened-but-unplayed wave 5
(74902: 15 days, 0 wave-5 types faced).

## Metric review (§14 — binding, no mid-run re-scores)

No metric was re-scored in any arm. Each arm was judged only
against its own committed prereg on its own fresh band; prior
bands appear as comparison columns only. Method notes carried
forward (proposals for the NEXT run, never revisions of this
one): (1) census-completeness GO (rather than a cell threshold)
is what let standmeet's HS-no-meet 0/8 be a finding instead of
a forced NO-GO on the band that delivered the first wave-5
opening — keep GO as completion + proof for separation
censuses; (2) keep the dormant/inconclusive distinction for
overtime (a zero-firing band with no table is inconclusive,
not dormant); (3) retire "standing docks" for "seat price";
(4) tableWaiting stays the primary offer signal, previewSeen a
footnote (policy prices the table only at national+); (5) the
max-with-end construction for w4facedEver stays standard
(death-day meetings after the last daily sample are a known
one-day edge, seen again on 75005).

## Telemetry deviation check (loop body step 10)

Coordinator re-run, all three corpora, same baseline:
`node scripts/telemetry-check.js --baseline .../telemetry-
baselines/scale-wall.json --current 'evidence/2026-10-27/
perseed-<arm>/*.json' --metrics national,table,wins,exiled`.
3 LOUD lines per corpus, verdict KNOWN ARTIFACT on all three,
baseline NOT rolled, no exiled LOUD line anywhere:
- vetsurvive: national 12->0, table -81% 16->3, wins 16->0.
- standmeet: national 12->0, table -62% 16->6, wins 16->0.
- overtime: national 12->0, table 16->0, wins 16->0.
Two independent reasons, same as w5seq/1940Z: (a) the baseline's
own regime note forbids this comparison (a ~100%-win winseat
suite vs a tableseat-nowait census substrate); (b) the field-
shape artifact (per-seed rows carry nationalEver/entered/won,
not top-level national/table/wins paths; summary.json is the
9th file; the tool's "table" number tracks invited, not
entered). The corpora's real wall numbers are the pooled table
above, not the tool's zeros.

## Balanced panel (§15)

Attempted on all three arms; not producible on any (fourth
round with this standing exception): scripts/balance-panel.js
has no corpus-ingest mode — it builds panels from live roots,
not from census corpora. No panel artifact was faked; the sweep
tables + validators are the comparison of record. A panel
corpus-ingest mode remains a tooling blank for a future run.

## Village assessment (plain words)

Villages live long (medians 174-180 days), reach national
almost always, and then stall in three different places: one
band's villages mostly never meet wave 4; another's meet it and
cannot kill it; the third's never earn the table's lesser bars.
The villages that do reach the table win the lesser seat and
stop — the full seat is still nobody's story. The most human
moment in the run is 74902's: a war-and-links village that
bloods two fighters, opens a door no village has opened, and
then finds nothing on the other side for 15 days — a door
opening onto an empty room is the next thing to fill, not
another key.

## Findings for backlog (coordinator appends; see sim-findings.md)

From vetsurvive: wave-4 kill scarcity (not survivorship) as the
mechanism; scholar-as-killer (villager wave-4 kills unrecorded
elsewhere, zero here); the veteran counted but not storied (no
beat marks the one veteran a village has); lesser-seat bypass
confirmed (74801 wins lesser at gated 99, zero veterans, zero
wave-4 faces). From standmeet: wave-5 unlocked but unmet
(74902, deed w5 0 after 15 days — arrival beat or window?);
wave-5 without table offer (deeds gate the offer after the
unlock); first living wave-4 killer at end (74907); Contract
Quill keepsake-line ambient repeat (noise class, not a bug).
From overtime: overtime clock never eligible without a table-
reaching band; "seat price" wording; food deeds + w3-faced as
the lesser seat's door. All appended to sim-findings.md in the
file's format by this coordinator run.

## Blanks filled or documented

FILLED: the survivorship question (killer lives — scarcity,
not death); the standing/meeting separation (0/5/2/1, 74406
shape not replicated); the first wave-5 unlock (74902 d165)
with its mirror seed (74908); rank-without-offer 0/8; the
overtime eligibility chain + seat-price re-derivation; the
killer-identity gap named (scholar vs villager).
DOCUMENTED, NOT FIXED: wave-5-unlocked-but-unmet; the kill
funnel (faced -> engaged -> killed by channel); the veteran
not storied; seat-price channels (rerun fights, raid knobs)
untested; the panel corpus-ingest mode.
CARRIED (not chased here): the melt stage (proposed
sim-w4melt-a); the empty nonat x w4 class (w5chain-a); the live
rule-(3) firing band — per the 2026-10-27 16:02 call, no more
low-defiance substrates are burned; defiance-always-offered is
itself the finding, and the fallback-feared test waits on kill
conversion / veterans, not another substrate.

## Next blanks, in order

1. Wave-4 encounter->kill conversion census (faced -> engaged
   -> killed, by channel) with killer identity (scholar vs
   villager) as a first-class field — vetsurvive's named next
   arm, and the run's top blank.
2. Wave-5-unlocked-but-unmet: after the unlock announcement,
   when and how does wave-5 talent actually engage — is 15 days
   too short a window, or does the release need an arrival
   beat? (74902 + the Focus Group treeline presence.)
3. The full seat from 74902's shape: the next full-seat arm
   starts from a village that HAS opened wave 5 and names its
   deed gaps (w5 faced, food deeds), not from zero.
4. Overtime seat-price channels (rerun fight scaling, raid
   knobs, path-strength pricing) on a table-reaching band
   (food deeds + wave-3 faced cleared first).
5. Panel corpus-ingest mode (tooling blank, fourth round).

## Infrastructure notes

- Master moved once under the run (8594fcd61, journey
  scripts-only). Rebase dance: each arm rebased onto it clean
  (proofs re-run), then sequential ff-merges each forced a
  re-rebase of the later arms (proofs re-run each time). No
  conflicts anywhere (disjoint files).
- Transient git lock failure on the first overtime rebase
  ("could not detach HEAD", no rebase state left, worktree
  clean): succeeded on immediate retry. Same container-flap
  class as 2026-10-23/24, but single-shot, not persistent.
  No ref surgery was forced; the retry was a clean rebase.
- Safe-commit index clobber hit all three arms' pre-sweep
  commits (known class); each worker repaired via HEAD-blob
  cacheinfo and verified status empty before sweeping.
  Coordinator commit below checked the same way.
- No EPERM flap blocked sweep writes; no jest runs (zero
  src/js; arm proofs are the attributable verification per
  DIAG-only precedent). No [needs-eyes] (measurement only).
- Rotation file left at 3: convergence-directed work
  suspends the lever rotation under the standing directive
  (scale-onramp is the blocking axis until the tracker
  records it converged).
- Sibling trees NOT touched; main tree clean after landing;
  all three arm worktrees released and branches deleted.
  Merged locally, pending ship.
