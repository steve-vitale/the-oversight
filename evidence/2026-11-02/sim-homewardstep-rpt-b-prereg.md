# sim-homewardstep-rpt-b — PREREG (committed BEFORE any judged sim)

Run: oversight-flesh-out-loop-b, arm sim-homewardstep-rpt-b (Loop B,
food-economy next blank 1 from run fleshout-loop-b-20261102T0933Z).
Worktree sim-homeward-rpt-b, branch sim-homeward-rpt-b.
Coordinator task brief, 2026-11-02. This worker does NOT push, bump,
verify live, or merge into master; the coordinator merges. Status to
coordinator: committed on branch, pending coordinator merge.

## Predecessor (read ONLY via `git show`, never checked out or merged)

Branch sim-homewardstep-b, tip 4de106b7c, evidence
evidence/2026-11-02/sim-homewardstep-b.md. HELD verdict:
UNDER-POWERED pilot (band 62001-62008 carried only 1 baseline
homeward-hop pocket episode, bar >= 2; homeward vetoes 0 on the
judged band, all 31 vetoes inherited outward; B5 haul 166.8 ->
147.1, 0.88x, failed entirely on 62003's diversion under the
inherited outward guard). Its unjudged diagnostic (seed 61807:
day-4 homeward hop (2,0)->(3,0) vetoed, episode 1 -> 0) is
mechanism demonstration only, not judged evidence, and is NOT
re-judged here.

## The re-port (what is armed — decided up front)

The guard is re-ported VERBATIM from the predecessor branch via
`git show` into this tree as scripts/policies/competent-homewardstep-b.js
plus its driver, analyzer, and proof test (header comments updated
to this run; analyzer deltas listed below). NO game-code change,
NO competent.js edit, NO policy-default flip. The panel registry
gains the same one additive line the predecessor added (zero
behavior change to existing entries).

WHAT IS ARMED — FULL INHERITED GUARD (decided up front, not
re-decided mid-run): the policy file is indivisible. The homeward
extension cannot be armed without the outward guard it extends:
every guarded hop, outward or homeward, is evaluated with the
same lateral-escape-aware E(D) and vetoed only if E(D) fails.
Therefore the PRIMARY is judged on homeward-hop pocket episodes,
but ALL no-harm bars judge the FULL guard's cost — exactly as
the predecessor judged them. A haul or stranding cost caused by
an inherited outward diversion is attributed to the inherited
guard in the report, but it is NOT excused: a failed bar is a
failed bar (see B5 below).

## Question

On a band that actually carries homeward-hop pockets, does the
homeward-step guard prevent homeward-hop pocket entries without
stranding the scholar worse than the pocket it prevents?

## Screening (binding, fresh bands only)

- BANNED for re-screening as fresh: 62001-62008, 62101-62108,
  62201-62208 (already screened at 1/0/0 homeward episodes).
  Also banned for judged reuse (predecessor prereg): 61801-61808,
  61401-61408, 61901-61916, 61301-61308, 60501-60508, 60307,
  60201-60212, plus prior-arm bands 61501-61508, 61601-61608,
  61701-61708.
- SCREENING BANDS (in order): 62301-62308, 62401-62408,
  62501-62508, 62601-62608, 62701-62708, 62801-62808,
  62901-62908, 63001-63008. Max 8 bands screened, 8 seeds each,
  baseline-shadow only. Screening spend and the qualifier result
  per seed are disclosed, every band, even bands screened after
  a qualifier is found (there will be none — screening stops at
  the first qualifier).
- QUALIFYING THRESHOLD: the FIRST screened band carrying >= 2
  baseline homeward-hop pocket episodes (definition below) is
  the judged pilot band.
- JUDGED-BAND FALLBACK (decided up front): if NO band qualifies
  after 8 bands, the judged band is the screened band with the
  MOST baseline homeward episodes (earliest on ties), and the
  pilot verdict is capped at UNDER-POWERED for PRIMARY (judge
  the no-harm, veto-memory, and veto-created-pocket bars only;
  never claim prevention). This differs from the predecessor's
  first-band fallback deliberately: under a cap, the band with
  the most homeward signal is the most informative judged band.
- NO FAR-TRAVEL SUBSTRATE, NO LONGER HORIZON (decided up front,
  with reasons): a far-travel substrate would manufacture
  pockets the guard was not designed for and break
  comparability with the predecessor's episode definition; the
  30d window already contains every observed pocket (entry
  days 4-22 in predecessor evidence). Screening more natural
  bands preserves the natural substrate and the definition.
  Cost is bounded: screening is baseline-shadow only, 8 seeds
  per band, and the run stops at the first qualifier.

## Pilot (judged)

Substrate (identical to predecessors): competent, 30d,
DEPOSITGATE=0, COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0,
and the packcomp * =1 flags must NOT be 1. Death-aware
horizon: 30 loop-days max; dead villages stop simulating; no
fixed-200d horizon. Horizon reason: pockets are an early
far-travel phenomenon (observed days 4-22); a 30d window
contains them while a longer window adds pre-seat noise, and
the 30d pre-seat profile (national / table / wins 0) is
expected, not a regression. Policies: baseline 'competent'
run in SHADOW mode (the homewardstep sim runs on EVERY
guarded hop including homeward hops, logs, never vetoes —
trajectories provably identical to pure competent, since the
sim is read-only) vs armed 'competent-homewardstep-b' (veto
mode), identical seeds. Pilot size: 8 seeds minimum (the
qualifying band); no confirm spend in this run — a pilot GO
goes to the coordinator for a confirm decision, it is not
spent here.

Definitions (inherited unchanged from the predecessor):
- Away day-end: post-daily snapshot position != haven tile.
- Failed-trip day: >= 1 forage attempt, 0 successes.
- Mean daily haul: band mean of seed mean-daily forage kcal
  (roadguard valuation, as in the predecessor analyzer).
- Pocket-entry stranding episode: a maximal run of
  consecutive away day-ends containing >= 1 day-end whose
  live dayEndReturnSim E(position) FAILS, AND (the run lasts
  >= 2 day-ends OR a strand-linked player death follows: a
  player starvation/dehydration death whose deaths[].day
  maps to an away day-end that day or the day before).
- HOMEWARD-HOP pocket episode: a pocket-entry episode whose
  ENTRY day's shadow hop log contains a homeward hop
  (destination Manhattan distance to haven < current
  distance) landing on the entry day-end tile. Episodes not
  meeting this are counted separately and are NOT in the
  PRIMARY denominator.
- PREVENTED (primary metric, NOT veto count): a baseline
  homeward-hop pocket episode on a seed counts as PREVENTED
  only if the armed leg on that seed has ZERO pocket-entry
  episodes of any type (the conservative rule: any armed
  episode on that seed = reroute / whack-a-mole, zero
  prevented counted for that seed).

PRIMARY METRIC (binding): PREVENTED HOMEWARD-HOP POCKET
ENTRIES >= 2 on the judged pilot band.

NO-HARM BARS (all binding):
- B1 stranding total: armed away day-ends <= baseline away
  day-ends (band total).
- B2 new-or-worsened: ZERO — no armed seed with away
  day-ends >= 10 AND >= baseline + 10, and no strand-linked
  player death on an armed seed without a baseline
  counterpart episode on that seed.
- B4 failed-trip share: armed <= baseline.
- B5 mean daily haul: armed >= 0.95 x baseline (pooled),
  AND per-seed floor (see below). BOTH bind.
- B6 survival: median survival armed >= control (median
  baseline); player starvation-death seeds armed <=
  baseline + 2 (secondary guard).

PER-SEED HAUL GUARD (decided up front — how a 62003-style
single-seed haul collapse is judged): the pooled B5 bar is
UNCHANGED and binding: a pooled miss is a FAIL, full stop,
even if 7/8 seeds are identical and the miss is one seed's
diversion — attribution is diagnosis, never an excuse.
Added, also binding: the per-seed floor — NO seed's armed
mean daily haul below 0.50 x its own baseline haul. A pooled
pass with a single seed collapsed below 0.50x is still a
FAIL (hidden harm the pool would mask). The per-seed table
is reported for every seed, split by whether the seed saw
any homeward veto, so a collapse on a homeward-veto-free
seed is attributed to the inherited outward guard and a
collapse on a homeward-vetoed seed to the extension — as
attribution only, never as a re-score.

VETO-WORSE BAR (binding): ZERO veto-created pocket episodes
— no armed seed with >= 1 pocket-entry episode where the
baseline seed had none. Reported alongside: for every vetoed
homeward hop, the origin tile's E (computed at veto time):
pass = the stay was on escapable ground; fail = already
pocketed before the veto. A veto-created pocket fails the
run even if PRIMARY passes.

REPORTED (not bars): homeward vetoes vs outward vetoes,
spoken vs silent vetoes (the memory working); lateral
passes; false opens (armed away day-ends where that day's
vetoes == 0 AND the day-end E fails); beyond-ungenerated
touches; roadwork credit uses.

FALSE-CLOSE PROXY (decided up front, addressing the
predecessor's metric review): the predecessor's 62001
artifact proved attempt-logs are not arrivals — 19 proxy
fires for a hop the baseline scholar never took. The quoted
cost signal is now the ARRIVAL-CONDITIONED proxy (v2): an
armed vetoed hop f->t on loopDay d counts ONLY if the
baseline leg on the same seed-day ARRIVED at t — a later
baseline hop that day departs from t, OR the baseline day
ends at t. The attempt-based proxy (v1: baseline took the
hop that day and ended home) is reported alongside for
comparability. Neither is a bar.

BALANCED PANEL (§15): run scripts/balance-panel.js on the
pilot seeds/policies (single combined campaign, both
policies, same seeds/days) as CONTEXT, never verdict — the
panel runs its own substrate and its survival/death
definitions differ from the driver's judged bars. Attach
the compare summary to the evidence file. If a
single-policy compare returns INVALID by design (as on the
predecessor run), record it as-is; do not override it.

SENSE-TESTING LAW: read the sayLines transcripts for veto
lines and for the stranded villages' own words; judge
meaning and coherence, never just counts. The evidence
file carries a village assessment in plain words, plus wall
numbers for the judged band (national / table / wins, wave
unlocks, median survival) with the 30d pre-seat profile
stated as expected, not a regression.

METRIC REVIEW (in the evidence file, never a re-score):
metric doubts go here and propose revisions for the NEXT
run only.

## Census (proof, not judged evidence)

BEFORE the pilot is judged, the re-ported proof test must
show, on synthetic fake-Game cases plus the live-engine
hop/walk battery (ported from the predecessor, no-credit
core agreement 100%): a homeward hop into a no-escape
destination IS vetoed and the scholar stays at the origin,
orig travelTo never called; a homeward hop into an
escapable destination passes untouched (including a hop
straight into haven); shadow mode evaluates and logs
homeward hops but never vetoes (trajectories identical to
pure competent); veto memory for homeward destinations
(first veto says, second silent, both vetoed); E(D)
agreement (61705 lateral miniature passes, 61704 true
pocket fails, credit rules unchanged). Target: 100% on the
above (predecessor: 48/48). Any disagreement is a proof
failure: fix the port, do not judge the pilot against a
disagreeing port.

## Analyzer deltas in this re-port (vs predecessor file)

1. Per-seed haul floor bar (B5perSeed, binding, >= 0.50x
   per seed) added to the judged output; pooled B5
   unchanged.
2. Arrival-conditioned false-close proxy (v2) added and
   quoted; attempt-based proxy (v1) retained alongside.
3. Per-seed haul-ratio-by-homeward-veto split added to the
   per-seed table for attribution.
No definition, threshold, or bar other than these three
additions changes.

## Deliverable

Evidence file evidence/2026-11-02/sim-homewardstep-rpt-b.md
(prereg header, census agreement numbers, screening table
for EVERY screened band, pilot numbers before/after,
homeward-hop verdict, village assessment in plain words,
wall numbers, metric review section), plus the re-ported
policy + driver + analyzer + proof test files, all
committed on branch sim-homeward-rpt-b. Report to
coordinator: GO / NO-GO / UNDER-POWERED verdict with judged
numbers, commit hashes, and proof-test result.

## Explicitly excluded

No pairing with any stepwalk re-confirm — that is a
separate future prereg, explicitly excluded here.
