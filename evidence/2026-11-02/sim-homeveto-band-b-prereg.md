# sim-homeveto-band-b — PREREG (committed BEFORE any judged sim)

Run: oversight-flesh-out-loop-b, arm sim-homeveto-band-b (Loop B,
food-economy tracker blank 1 from run
fleshout-loop-b-20261102T1135Z, coordinator brief 2026-11-02:
homeward-extension band screened for armed-policy homeward
vetoes). Worktree sim-homeveto-band-b, branch
sim-homeveto-band-b. Coordinator task brief, 2026-11-02.
This worker does NOT push, bump, verify live, merge, or
rebase; the coordinator lands the branch. Status to
coordinator: committed on branch, pending coordinator merge.

## Predecessors (read, never re-litigated, never checked out)

- evidence/2026-11-02/sim-homewardstep-rpt-b.md (Loop B 1030Z):
  PILOT GO for the FULL guard on qualifying band 62801-62808
  (3 baseline homeward-hop pocket episodes, 3 prevented, all
  no-harm bars PASS) — BUT homeward vetoes were 0 on the
  judged band: all prevention came via inherited OUTWARD
  vetoes.
- evidence/2026-11-02/sim-homext-abl-b.md (Loop B 1135Z):
  ablation on that same band, outward-only vs full, 8/8
  trajectories identical, extension-only preventions 0 —
  NO-GO for the extension ON THAT BAND. Its metric review
  states the structural problem this run answers: on natural
  bands the outward guard diverts trips before the homeward
  step is ever attempted under guard, so the extension is
  unmeasurable unless a band is found where an armed-policy
  homeward step into no-escape ground is actually attempted.
- The extension's only firing evidence remains the unjudged
  61807 diagnostic (2 homeward vetoes, episode 1 -> 0),
  plus a sim-latescape-b note: on 61807 a walk-home step
  steps INTO a pocket (2,0)->(3,0) day 4, the guard fences
  the pocket edge days 5-7, home day 8, but the day-4
  failing day-end anchors the run as one episode so
  prevented = 0 under the conservative per-seed rule.
  Neither is re-judged here; the 61807 shape is used ONLY
  in the DIAG leg (below), if no band qualifies.

## Canon note

docs/CANON.md read first; docs/MAP.md states the way home
as travel through the same travelTo pipeline (home board,
beyond tiles, one continuous map). No canon doc covers the
pocket guard itself: it is a policy-side sim instrument
(a competent variant), not a game system, so there is no
canon to invent from — the guard's E(D) model is
inherited verbatim from the predecessors, and this run
changes nothing in any policy file. Policy/instrument
only: scripts/policies/* (unchanged, reused) plus
driver/analyzer/test/evidence. ZERO src/js changes.

## Question

Can a FRESH natural band be found where the homeward
extension actually fires under the armed policy — i.e. a
band carrying >= 2 baseline homeward-hop pocket episodes
AND >= 1 armed-policy homeward veto — so that the
extension's own prevention can be judged, outward-only vs
full, on identical seeds?

## Screening (decided up front, before any sim)

Bands, in order, first qualifier stops the search (max 8
bands, 8 seeds each, seeds = start..start+7):

1. 64001-64008
2. 64101-64108
3. 64201-64208
4. 64301-64308
5. 64401-64408
6. 64501-64508
7. 64601-64608
8. 64701-64708

BANNED (never screened, never judged): 62801-62808,
62001-62016, 61901-61916, 62301, 62401, 62501, 62601,
62701 (as band starts, i.e. their 8-seed bands), and any
other previously used band. The 64001+ series was checked
against today's evidence before this prereg was written
(zero mentions) and sits clear of every previously used
band start named in the predecessor reports.

Per band, BOTH legs are run fresh with
scripts/homext-abl-b-driver.js (unchanged): baseline
'competent' under the SHADOW guard, and armed
'competent-homewardstep-b' (full guard). The baseline
leg is judged for episodes with
scripts/analyze-homext-abl-b.js in screening mode
(--baseline alone); the armed leg's homeward-veto count
comes from scripts/analyze-homeveto-screen-b.js (new,
counts day.homewardVetoes per seed — exact driver
fields, no episode logic duplicated). EVERY band
screened is disclosed in the evidence file with its
baseline homeward episodes AND its armed homeward
vetoes, whether it qualifies or not. Screening files
are screening evidence only, NEVER judged legs: if a
band qualifies, the pilot below re-runs all three legs
fresh on its seeds.

A band QUALIFIES iff BOTH hold:
- (a) baseline homeward-hop pocket episodes >= 2, AND
- (b) armed (full-guard) homeward vetoes >= 1.
If (b) fails, the band fails even if (a) holds; if (a)
fails, the band fails even if (b) holds. Screening stops
at the first qualifier; bands after it are never run.

## Pilot (only if a band qualifies; all legs fresh)

Substrate, identical to the predecessors: competent, 30d,
DEPOSITGATE=0, COMPETENT_FEAST=0, SEATDRIVE=0,
PLENTYDEPRI=0, and the packcomp * =1 flags must NOT be 1.
Death-aware horizon: 30 loop-days max; dead villages
stop simulating; no fixed-200d horizon. Horizon reason:
pockets are an early far-travel phenomenon (observed
days 4-29 in predecessor evidence); a 30d window contains
them while a longer window adds pre-seat noise, and the
30d pre-seat profile (national / table / wins 0) is
expected, not a regression. Policies, identical seeds,
one leg per policy: baseline 'competent' (shadow),
'competent-homewardstep-outwardonly-b' (outward-only),
'competent-homewardstep-b' (full). Judged by
scripts/analyze-homext-abl-b.js in 3-leg mode
(--baseline --outwardonly --full). No confirm spend in
this run: a pilot verdict goes to the coordinator for a
confirm decision (12-16 seeds), it is not spent here.

Definitions (inherited unchanged from the ablation
prereg, which inherited them from rpt-b):
- Away day-end: post-daily snapshot position != haven tile.
- Failed-trip day: >= 1 forage attempt, 0 successes.
- Mean daily haul: band mean of seed mean-daily forage
  kcal (roadguard valuation, as in the rpt-b analyzer).
- Pocket-entry stranding episode: a maximal run of
  consecutive away day-ends containing >= 1 day-end whose
  live dayEndReturnSim E(position) FAILS, AND (the run
  lasts >= 2 day-ends OR a strand-linked player death
  follows: a player starvation/dehydration death whose
  deaths[].day maps to an away day-end that day or the
  day before).
- HOMEWARD-HOP pocket episode: a pocket-entry episode
  whose ENTRY day's shadow hop log contains a homeward hop
  (destination Manhattan distance to haven < current
  distance) landing on the entry day-end tile. Episodes
  not meeting this are counted separately and are NOT in
  the PRIMARY denominator.
- PREVENTED by a leg (conservative per-seed rule): a
  baseline homeward-hop pocket episode on a seed counts
  as PREVENTED by that leg only if that leg on that seed
  has ZERO pocket-entry episodes of any type.

PRIMARY METRIC (binding): EXTENSION-ONLY PREVENTIONS =
the count of baseline homeward-hop pocket episodes on
seeds where the FULL leg has ZERO pocket episodes of any
type AND the OUTWARD-ONLY leg has >= 1 pocket episode.
GO threshold: >= 1 extension-only prevention, AND all
no-harm bars below PASS. A miss is NO-GO for the
extension on the qualifying band, never re-scored
against a friendlier metric mid-run (e.g. never
re-scored as full-guard prevention, which the 1030Z
pilot already established at 3 on a different band).

NO-HARM BARS (all binding, judged FULL vs OUTWARD-ONLY
— the extension's own cost, not the inherited guard's):
- B1 away day-ends: full <= outward-only (band total).
- B2 new-or-worsened: ZERO — no full seed with away
  day-ends >= 10 AND >= outward-only + 10, and no
  strand-linked player death on a full seed without an
  outward-only counterpart episode on that seed.
- B4 failed-trip share: full <= outward-only.
- B5 per-seed haul floor: EVERY seed's full mean daily
  haul >= 1.00x its own outward-only haul (worst seed
  decides; a 0/0 seed is null and excluded, as in the
  ablation). No pooled B5 bar is judged here: the pooled
  full-vs-baseline haul comparison is the 1030Z pilot's
  bar, already passed, and re-judging it would
  double-count the inherited guard.
- B6 survival: median survival full >= outward-only;
  player starvation-death seeds full <= outward-only + 2.
VETO-CREATED-POCKET BAR (binding): ZERO full seeds with
>= 1 pocket-entry episode where the outward-only leg on
that seed has none (a pocket the homeward vetoes
themselves created).
PROOF PROPERTY (binding): outward-only homeward vetoes
must be 0 — a property of the variant, checked on the
judged band; any nonzero value is a proof failure, not
a bar failure to argue around.

REPORTED (not bars): full homeward vetoes vs outward
vetoes; outward-only pass-throughs (E-failed homeward
hops passed); spoken vs silent vetoes; lateral passes;
credit uses; false opens (full); trajectory identity
between the full and outward-only legs (any divergence
is reported as a finding, since with homeward vetoes > 0
the legs SHOULD diverge exactly at the vetoed steps);
per-seed table for all three legs.

BALANCED PANEL (§15): run scripts/balance-panel.js on the
judged seeds/policies (single combined campaign, all
three policies, same seeds/days) as CONTEXT, never
verdict — the panel runs its own substrate and its
definitions differ from the driver's judged bars. Attach
the compare summary to the evidence file. If a
multi-policy compare returns INVALID by design (as the
predecessors' split-panel compares did), record it
as-is; do not override it.

SENSE-TESTING LAW: read the sayLines transcripts for
veto lines on both armed legs and for the stranded
villages' own words on judged seeds; judge meaning and
coherence, never just counts. The evidence file carries
a village assessment in plain words, plus wall numbers
for the judged band (national / table / wins, wave
unlocks, median survival) with the 30d pre-seat profile
stated as expected, not a regression.

METRIC REVIEW (in the evidence file, never a re-score):
metric doubts go here and propose revisions for the NEXT
run only.

## If NO band qualifies within budget (DIAG leg only)

Report DIAG-NO-BAND. Do NOT claim GO or NO-GO for the
extension. The DIAG leg is a constructed 61807-shape
trip, documented as diagnostic (never judged): a
diagnostic reconstruction on seed 61807 itself (the only
seed with known homeward firing) showing the shape —
outbound steps through escapable ground, then a homeward
step into no-escape ground vetoed by the full guard and
passed by the outward-only variant — with vetoes and
episode accounting spelled out, including the
day-4-failing-day-end anchoring effect from the
latescape note, plus a statement of what a judging band
would need (the qualifier above, on fresh seeds). No
fresh-seed diagnostic is judged as evidence for the
extension; the DIAG leg explains the shape, it does not
score it.

## Census (proof, not judged evidence)

BEFORE the pilot legs are judged, the proof test
scripts/test-homeveto-screen-b.js must show: (a) the
screener counts homeward vetoes exactly on synthetic
driver-shaped records (including a zero-veto leg and a
multi-seed mixed leg); (b) every screening band start in
this prereg is outside the banned set above; (c) the
reused driver/analyzer files are byte-identical to the
ablation run's (no silent instrument change — verified
by git, since this branch descends from the ablation
commit and no policy/driver/analyzer file is edited in
this run). Any failure is a proof failure: fix the
instrument, do not judge legs against a failing one.
The predecessor proof scripts/test-homext-abl-b.js
(21/21, outward-only never vetoes homeward) remains the
proof for the outward-only variant itself and is re-run
post-commit as a regression check, not re-authored.

## Deliverable

Evidence file evidence/2026-11-02/sim-homeveto-band-b.md
(prereg header, screening ledger for every band run,
census numbers, three-leg numbers before/after if a
band qualifies, extension-only verdict or DIAG-NO-BAND,
village assessment in plain words, wall numbers, metric
review section), plus the screener + proof test files,
all committed on branch sim-homeveto-band-b. Report to
coordinator: GO / NO-GO / DIAG-NO-BAND verdict with
judged numbers, commit hashes, and proof-test result.

## Explicitly excluded

No reuse of any banned band; no chasing a GO by
re-screening past the 8-band budget; no re-judging the
61807 diagnostic as evidence; no pairing with any other
arm's re-confirm; no src/js changes; no other
worktree touched; no push, bump, live verification,
merge, or rebase.
