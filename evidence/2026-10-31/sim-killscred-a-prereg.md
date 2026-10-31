# sim-killscred-a — PREREGISTRATION (written BEFORE any judged sims)

Arm: sim-killscred-a, Loop A run fleshout-20261031T1535Z, axis
scale-onramp. DIAG ONLY: no game-code change, no policy-default
flip, no lever built. The deliverable is a routing diagnosis +
design sketch (NOT built) for the sim-findings item
"KILLS-EARNED CRED DANGER-BRANCH LEVER" (Loop A
sim-patrolsilent-a, evidence/2026-10-31/sim-patrolsilent-a.md,
finding N1, DIAG-GO). A lever, if supported, is documented as a
next arm, not built here.

## Question

Patrolsilent (base 19b3e1ae0) found the sole kills-earned combat-
cred holders on two seeds are fit-first trapped: on seed 85111 a
mechanic with 3 kills mends 271x and records 0 patrol attempts;
on seed 85114 a farmer with 2 kills cooks 257x and records 0
patrol attempts. Where exactly does the routing lose the danger
branch to fit-first for a kills-earned holder, and what would
danger-before-fit (or a kills-cred override) change? This arm
measures the loss on its own base; it does NOT implement the
lever.

## Call path (traced from code BEFORE sims)

- scripts/policies/delegate.js, pickTask (lines 102-130):
  order is hp < 40 -> 'rest'; THEN the fit-first block, which
  RETURNS before the danger branch is ever evaluated:
  - spec.cook >= 2 OR spec.preserver >= 2 -> 'cook'
    (src/js/food.js specialistSkill, SPECIALTIES table: a
    farmer matches preserver s:2, so a farmer routes to cook
    on skill alone, before any occupation check);
  - /fisherman|sailor|fisher/ -> 'fish';
  - /farmer|gardener|botanist|herbalist/ -> 'garden';
  - /carpenter|mechanic|engineer|tailor|seamstress/ -> 'mend'
    (a mechanic routes to mend on occupation alone);
  - teacher-ish occupation + 50% roll -> 'teach';
  - ONLY THEN: hp >= 60 AND combatCred -> 35% 'patrol' /
    25% 'hunt' (else falls through to need-based).
  combatCred (delegate.js lines 62-70): agency monsterKills > 0
  OR combat occupation regex
  (hunter|soldier|police|marine|ranger|security|firefighter|
  boxer|mma).
- The pre-registered losing code point hypothesis: the
  fit-first block (delegate.js pickTask, the five early
  returns) runs before the danger branch, so a kills-earned
  holder who is also fit-routed never reaches the
  combatCred evaluation at all. The census verifies this
  live, per holder, per beat — a holder whose delegate pick
  is always a fit task has lost at that block, whatever their
  kill count.
- Engine gates AFTER the attempt (Game.assignTask, src/js/
  game.js line 6395: trust/obedience, wounded refusal) are
  downstream of the pick and cannot explain zero attempts;
  they are recorded for contrast only.
- Caller: delegateBeat (delegate.js lines 133-165), the ONLY
  patrol caller in sims (patrolsilent, verified live).
  Competent's upkeep staffing (water/fish) runs BEFORE
  delegateBeat in the same beat and can pre-claim a villager,
  so pre-claimed is its own bucket, never counted as a
  delegate pick.

## Canon

docs/CANON.md read first. NO canon doc covers delegate
pickTask branch order or patrol assignment specifically
(docs/PARTY.md covers villagers generally; it does not
prescribe fit-first vs danger order). This is stated, not
invented around: the branch order is a policy-layer fact
(delegate.js), not a Steve canon ruling, and the design
sketch below is a proposal for a future arm, not canon.

## Primary metric

Per-seed, per-kills-earned-holder routing table on the
IDENTICAL S-PATROL stack as patrolsilent (leadfeast +
windefer + seatdrive + fullseat + delegate + deadfall;
FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1
SEATDRIVE=1 FULLSEAT=1 DEADFALL_B=1), reusing the
patrolsilent instrument (scripts/patrolsilent-diag-20261031.js
v2) and sweep (scripts/patrolsilent-sweep-20261031.js) with
EVID redirected to this arm's own corpus directory
(evidence/2026-10-31/perseed-killscred-a/). Judged numbers
come ONLY from this arm's corpus, on this arm's base —
patrolsilent's numbers are prior-base context, never
re-judged and never quoted as this run's results.
For each kills-earned holder (raw agency monsterKills > 0 at
any beat; occupation recorded alongside):
- patrol attempts (delegate assignTask rows, task patrol);
- branch counts per upkeep beat at Haven: fit-cook /
  fit-fish / fit-garden / fit-mend / fit-teach? (delegate
  pick = that fit task); danger-hit (pick patrol/hunt);
  danger-reached-fallthrough (pick a need task with hp >= 60
  + cred — danger evaluated, rolls missed); hp-low / rest;
  already-assigned (held assignment at beat start);
  pre-claimed (non-delegate assign in the beat, competent
  staffing); no-call (at-Haven beat, no delegate row).
- occupation duty counts: delegate picks by task for the
  holder (e.g. mend N, cook N), plus specCook/specPreserver
  and hp distribution at beats.
- the exact code point where the danger branch loses
  (file + function + condition), derived from the branch
  counts, not from reading code alone.

## GO threshold (DIAG-GO, judged exactly)

DIAG-GO iff ALL of:
1. Pilot (8 seeds, below) completes with instrument errors 0
   on every seed.
2. Per-seed routing table delivered for EVERY kills-earned
   holder on every pilot seed, including 85111 and 85114:
   patrol attempts on THIS base are reported as measured —
   0 confirmed, or otherwise reported with the numbers
   (base drift moved silence before; a non-zero result is a
   finding, not a failure, provided the table + code point
   still explain it).
3. The losing code point is named exactly (file + function +
   condition) and is consistent with the branch counts: on
   a fit-trapped holder, fit-branch beats must be ~100% of
   their delegate picks with danger-hit 0; on a contrast
   holder who patrols, danger-hit must be > 0.
4. Design sketch (NOT built) delivered: danger-before-fit
   when monsterKills > 0, or a kills-cred override, with a
   predicted effect on 85111/85114 (expected patrol
   attempts > 0, with the danger-roll math stated) and its
   risks (specialist-economy starvation, teach/mend coverage
   loss, trust-gate refusals downstream).
5. Recorder errors 0 on every judged seed; det-gate: 2
   seeds re-run byte-identical (full per-seed JSON) on this
   base.
6. Sense read: at least one trapped holder's day read from
   the corpus (assignments across parts, what the village
   was doing instead of patrolling), judged for meaning,
   not just counts.

A miss on any clause is DIAG-NO-GO (or killed-at-pilot if
the pilot itself fails), never re-scored against a friendlier
metric mid-run. Metric doubts go under "metric review" for
the NEXT run.

## Horizon + why

Death-aware, never fixed 200d: DAYS=200 cap, runDays
early-ends on over / village-lost / won exactly as the
patrolsilent sweep did, so trajectories are comparable
seed-for-seed. The question is about assignment over a
village's life, not a fixed window.

## Seeds (fixed, no band-shopping)

- Pilot: 85111, 85114 (the two trapped-holder seeds) +
  85101 (police-officer contrast), 85103, 85104
  (firefighter contrast), 85107 (no-holder CRED contrast),
  85108 (multi-holder contrast), 85110 (street-artist
  kills-earned ACTIVE contrast: a kills holder who DOES
  patrol on the prior base). 8 seeds.
- Confirm: the remaining patrolsilent band seeds only
  (85102, 85105, 85106, 85109, 85112, 85113, 85115, 85116)
  if the pilot fires cleanly; never below 8, never outside
  the band.
- Policies: S-PATROL stack verbatim (see Primary metric).
  No other policy layer, no game change.

## Base commit

Worktree branch sim-killscred-a, HEAD at prereg time:
18da20b586aeb018d1357170aeb2e2c3176d3ffb ("journey-scale
r62: closeout"). Patrolsilent's anchor 19b3e1ae0 IS an
ancestor of this HEAD (intervening: patrolsilent's own
landing + journey-scale r62 work), so base drift is
expected and silence is re-established here, not assumed.

## What is NOT judged

- No before/after: this is a DIAG census on one base, not a
  lever arm. No panel comparison is fabricated.
- Patrolsilent's corpus is NOT re-judged; its numbers
  appear only as prior-base context, labeled as such.
- Wall numbers (national/table/wins, wave reach) are
  reported where observable on this substrate, never as 0s
  where unobservable. Arc II/III/IV reach, four-realm
  formation, trap acquisition by source, counter
  discovery/kill rates, and young-link succession survival
  are NOT instrumented in this substrate and are NOT
  reported.

## Panel (section 15)

NOT APPLICABLE, none fabricated — single-base DIAG census,
not a before/after lever comparison (same declaration as
patrolsilent-a). A later lever arm reusing this corpus as
its baseline runs the panel then.

## Metric review

(To be filled at end of run; never a re-score of this run.)
