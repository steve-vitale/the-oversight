# sim-prodstore-a — PLENTY-WEEK lever pilot (ADOPTION run, fleshout-20261107T1820Z)

Axis: food-economy (converging, NOT converged). Run: fleshout-20261107T1820Z,
adopting the timed-out Loop A run fleshout-20261107T1615Z arm sim-prodstore-a.
Branch `sim-prodstore-a`; lever commit 52a1c2698 (prereg + diagnosis instruments
f7277d2af; lever + amendment + pilot sweep + proof L9–L11 + diagnosis corpus).

## Pre-registration (frozen — see evidence/2026-11-07/sim-prodstore-a-prereg.md + Phase-B amendment)

- Question: what caps food production/storage, and does demanding a full
  week's buffer before food work stands down recover the easing loss?
- Lever PLENTY-WEEK: the plenty threshold the production throttle + both
  easings read goes 4 → 7 fresh days. One helper
  `Game._prodstorePlentyThreshold()` in src/js/game.js (7 when
  `PRODSTORE_LEVER` is set, 4 otherwise); `prodThrottleEngaged()` and
  `prodThrottleHungerExempt()` read it. Flag-gated, default OFF — no default
  behavior change. Canon: PRESERVATION.md names no plenty threshold and no
  throttle number — the "4" is a bare engine constant, not canon.
- Pilot: same 8 seeds 96201–96208, competent, 150d death-aware,
  PLENTYDEPRI=1 DEPOSITGATE=1, PRODSTORE_LEVER=1, armed corpus vs the
  Phase-A baseline corpus on identical seeds.
- **GO bar (binding): villager starvation deaths ≤ 1 AND median survival ≥
  92.4d (0.8 × 115.5d).** Baseline: 3 starvation deaths, median 115.5d.
  Both must hold. Cost bars reported alongside: wave reach, death-cause
  shares, empty-pantry days (baseline 24), spoilage, cap-flag days.
- Confirm band 96209–96224 (16 seeds) — freshness RE-VERIFIED this run:
  each seed grepped individually against ALL dated
  evidence/*/sim-*-prereg.md (only hits: the self-reference in this
  prereg), convergence tracker (0), sim-findings.md (0), no
  forbidden/contaminated list names the band. Confirm runs ONLY on a pilot GO.

## VERDICT: NO-GO — killed at pilot

**Starvation deaths 2 (bar ≤ 1) — MISS. Median survival 102d (bar ≥ 92.4d) —
PASS. Both must hold, so the run is NO-GO.** Convergence state:
killed-at-pilot. Kill classification (§14a): **CONCEPT-DEAD for the 4→7
threshold as a standalone lever** — the mechanism was staged, the metric was
fair, and the concept failed on its merits as a net win (autopsy below).
The underlying insight is NOT dead: the easing really does discard food
during scarcity, and the lever really did recover it. What died is the
threshold recalibration as the fix, because its labor side-effect costs
more than the recovered food buys. Do not retry 4→7 without a new
mechanism that holds the labor allocation (e.g. forage-exposure or
cook-priority handling). The next arm belongs to the production-collapse
regime (see "Next arm"), which the sibling arm sim-prodcollapse-diag-a is
already diagnosing — not to another threshold value.

## Before / after (identical seeds 96201–96208, competent, 150d)

| Metric | Baseline (unarmed) | Armed (PLENTY-WEEK) | Δ |
|---|---|---|---|
| Starvation deaths (villager) | 3 | 2 | −1 (bar ≤ 1: MISS) |
| Median survival | 115.5d | 102d | −13.5d (bar ≥ 92.4d: pass) |
| Max survival | 150d | 150d | 0 |
| produced / need | 1.054 (15.54M / 14.74M) | 0.998 (13.64M / 13.67M) | −0.056 |
| ate / need | 0.895 | 0.882 | −0.013 |
| Throttle/easing discarded | 2,651,133 kcal (17.1% of produced) | 1,864,996 kcal (13.7%) | −786,137 (−29.7%) |
| Throttle-engaged village-days | 662/911 (72.7%) | 477/836 (57.1%) | −15.6 pts |
| Throttle redirects | 2,038 | 1,849 | −189 |
| Spoilage swept | 338,708 (12.3% of stocked+stored) | 446,776 (18.1%) | +108,068 (+31.9%) |
| Empty-pantry village-days | 24/911 (2.6%) | 43/836 (5.1%) | +19 |
| Cap-flag days | 0/911 | 0/836 | 0 (cap still never binds) |
| Fresh-days median (snapshots) | 5.3 | 7.6 | +2.3 (buffer built, as designed) |
| Cook resolutions | 928 / 5,680 duties | 458 / 4,791 duties | cook share halved |
| Forage resolutions | 114 | 310 | ×2.7 |
| Fish resolutions | 1,907 | 1,673 | −234 |
| Death causes (top) | the wild 72, monster 17, sickness 10 | the wild 78, monster 29, sickness 12, wounds 9 | monster +12, wounds +8 |
| Wave reach | 1–4: 8/8, 7/8 reach 4; 5: 2/8 | 1–4: 8/8; 5: 2/8 | unchanged |
| National / table / wins | 0 / 0 / 0 | 0 / 0 / 0 | unchanged (wall numbers) |

Per-seed survival (daysAlive), baseline → armed:
96201: 100 → 85 · 96202: 150 → 116 · **96203: 66 → 150** · 96204: 150 → 138 ·
96205: 122 → 70 · 96206: 146 → 137 · 96207: 109 → 88 · 96208: 71 → 57.
Seven of eight seeds died earlier armed; one (96203) was rescued outright.

## Autopsy — why the lever failed its own metric

The mechanism worked exactly as designed: easing fell 29.7%, engaged days
fell 15.6 points, the fresh-days buffer rose 5.3 → 7.6, and the seed the
lever was built for — 96203, the baseline collapse seed (3 starvation
deaths, dead by day 66, throttle never engaged during its collapse) —
survived the full 150 days with ZERO starvation deaths armed. The lever
fixed the exact collapse it targeted.

It failed as a net win because keeping the throttle off longer changed
WHAT villagers do with the recovered time, not just how much food they
make. Labor reallocated hard toward foraging (114 → 310 resolutions) and
away from cooking (928 → 458) and fishing (1,907 → 1,673). More villagers
out foraging means more exposure: monster deaths 17 → 29, "a wound that
wouldn't close" 1 → 9, "the wild" 72 → 78. Seven seeds died earlier of
non-starvation causes, and the two remaining starvation deaths moved to a
different seed — 96207 (d55 Priya, d84 Tom, both pantry 0 / freshDays 0,
the same empty-pantry regime as baseline) — instead of being eliminated.
The extra stock also partly rotted: spoilage rose 32% and empty-pantry
days nearly doubled (24 → 43), because villages that die earlier leave
less time to eat what they stocked. In plain words: the village kept more
food by working food longer, but the extra work sent more people out to
get hurt, and the food they saved sat uneaten or spoiled while they died
of other things. The deaths live in the production-collapse regime, as
the prereg amendment predicted they might — the lever moves the collapse
between seeds rather than removing it.

## Reachability verdict — unchanged

Waves 1–4 reached on 8/8 seeds both arms; wave 5 on 2/8 both arms.
National 0/8, table 0/8, wins 0/8 both arms — the scale wall stands; this
lever was never expected to move it, and it didn't. No content was gated
or ungated by the lever (flag-gated, default off; the armed run is a
measurement substrate only).

## Village assessment (what the villages looked like)

Armed villages are busier in the field and thinner at the fire: more
foraging parties, fewer cooks, fuller pantries that rot faster. The
clearest village story is 96203 armed — the village that starved in the
baseline lived the whole 150 days, its people dying instead to monsters
and the wild like everyone else. The bleakest is 96205 armed — dead by
day 70 with 10 "the wild" deaths. Nobody thrived because of the lever;
the lever redistributed who died of what, it did not make villages
thrive. The binding constraint is still production collapse with an
empty pantry (all 5 starvation deaths across both arms had pantry 0 /
freshDays 0), now joined by the finding that food-duty time is itself
exposure time.

## Villagers acting like people (SENSE-TESTING LAW)

Transcript samples from the armed corpus death rows read coherent and
human, not robotic: "Back at the haven the argument starts: Ming is
calling it 'The Glow Stag.' Nobody agrees yet — weigh in if you want."
"Oliver stared at their hands for a long time today. Something is
changing." "Victor came back with 314 kcal of something edible. The
pantry can't take it all — 157 kcal in, 157 kcal eaten at the fire."
(the deposit-gate voice narrating the easing honestly — the lever's own
pathology, spoken aloud). The starvation deaths narrate themselves
plainly: "Priya is away from the haven, hurt (health 5/100), and their
pack is empty — nothing to eat out here. They walked away from Haven and
haven't come back." / "Ella went to sleep hungry. Nobody says anything."

One robotic pattern, pre-existing, not caused by this lever (filed as a
finding, see below): the game's biggest killer, "the wild" (78/142 armed
deaths), narrates every death with the identical two-line stamp —
"<Name>'s <Attack> hits you for <N>. / You go down." — only the attacker
name and number change. And "The garden is going weedy — your Burdock
needs tending, or the harvest halves." fired twice verbatim on the same
day. The death that kills most villagers has the least to say about it.

## Checks run

- `node --check src/js/game.js` — OK.
- `node scripts/check.js --quick` (pre-rebase, on the lever commit):
  **283 passed, 7 failed in 857s** (standing profile 280 passed / 7 failed
  pre-existing; +3 passes, same failure count — the visible failures are
  the known pre-existing phone-frame proof (3) and establishment-r20
  (racks-full voice gate) classes; not chased, per instructions).
- `node scripts/test-prodstore-diag-a.js` — **11/11 PASS** (L1–L8
  diagnosis legs + L9 armed 5-day run: throttle-engaged days 0 vs
  baseline 4, easing 0 vs 3,634; L10 unset run byte-identical to baseline;
  L11 pilot sweep refuses unarmed). Re-run after the rebase (below).
- Analyzer replication: `node scripts/analyze-prodstore-diag-a.js` on
  both corpora (baseline `evidence/2026-11-07/prodstore-a-corpus/`,
  armed `evidence/2026-11-07/prodstore-a-corpus-armed/`); tables above
  are its output. Accounting-closure residuals on the armed corpus run
  0.3%–149.3% of inflows per seed (same instrument limitation as Phase A:
  unmeasured inflows on event days; the easing ranking is ledger-based
  and robust to it).
- Balanced panel: NOT run. A panel is a confirm-stage instrument and
  confirm spend is barred on a killed arm (§14 kill rule); a panel cannot
  overturn a pre-registered NO-GO. The identical-seed analyzer
  before/after above is the before/after comparison, and both corpora are
  committed for reproducibility.
- Telemetry deviation check: `node scripts/telemetry-check.js
  --baseline .../telemetry-baselines/scale-wall.json --current
  'evidence/2026-11-07/prodstore-a-corpus-armed/*.json' --metrics
  national,table,wins,exiled` fired 3 LOUD lines (national 12→0, table
  16→0, wins 16→0). **Explained, not a bug: regime artifact.** The
  scale-wall baseline is the "winseat — full win-side win stack" regime
  (win-pursuit flags, 180d), and its own `_regime.note` warns not to
  compare pre-seat substrates against it ("wins are structurally ~0
  there"). This arm's substrate is plain competent policy with no
  win-pursuit flags; national/table/wins are 0/8 in BOTH the Phase-A
  baseline and the armed corpus on identical seeds. No deviation, no
  baseline roll-forward (the run is a NO-GO kill; the baseline is not
  touched).

## Metric review

- The GO bar was fair and achievable in principle: had 96207 not starved,
  the pilot would have passed (2 → 0 starvation deaths on that seed was
  the whole margin; median survival passed). It was NOT a METRIC-BROKEN
  kill: the bar did not measure noise or an unreachable pool — the
  concept missed by one death on a seed that had zero starvation deaths
  at baseline.
- What the metric did not foresee: median survival as a guardrail
  (≥92.4d) passed while 7/8 seeds individually got shorter — the pooled
  median hid a broad survival regression behind the 96203 rescue. A
  future pre-registration for a labor-reallocating lever should add a
  per-seed guardrail (e.g. no more than 2 seeds losing >20d) alongside
  the median, and a cost bar on monster/wild deaths. Proposed for the
  NEXT run, not applied here: the NO-GO stands as judged.
- The starvation bar (≤1, "half of 3, integer") was coarse at n=8 with
  all 3 baseline deaths on one seed — one seed flipping is the whole
  verdict. That is the honest limit of an 8-seed pilot on a rare event,
  and the kill classification already accounts for it: the mechanism
  evidence (96203 rescued, easing −29.7%) is recorded here so the next
  arm can reuse it instead of re-proving it.

## Next arm

Target the production-collapse regime, not the easing: why a village
produces ~70% of need for a month with the throttle never engaged (the
96203 baseline collapse; now also 96207 armed). The sibling arm
sim-prodcollapse-diag-a (same run, Loop A) is diagnosing exactly that.
The easing-recovery insight from this arm (711,964 kcal recoverable on
freshDays (4,7] days; the lever recovered 786k pooled) stays available
as a component of a future combined arm — but only with a mechanism that
holds labor allocation, since forage exposure ate the gain.

## Rebase note

Master moved under this arm during the run (journey-establishment r111
landed c88df9d25). Branch rebased onto the explicit SHA c88df9d25 (never
`git rebase master`); proof test re-run green after the rebase (see
commit message / run note). Pilot numbers above were measured on the
pre-rebase base (eac2bfc4d + lever); the rebase replays the identical
lever hunk onto newer master and changes no measured number — the lever
is killed, so no pilot re-run was spent on the new base.

## Files

- Prereg + amendment: evidence/2026-11-07/sim-prodstore-a-prereg.md
- Diagnosis corpus (baseline): evidence/2026-11-07/prodstore-a-corpus/ (9 files)
- Armed pilot corpus: evidence/2026-11-07/prodstore-a-corpus-armed/ (9 files)
- Sweep (pilot, BAND=pilot/confirm): scripts/sweep-prodstore-pilot-a.js
- Proof test (L1–L11): scripts/test-prodstore-diag-a.js
- Analyzer: scripts/analyze-prodstore-diag-a.js
- Lever: src/js/game.js (`_prodstorePlentyThreshold`, 4 → 7 when
  PRODSTORE_LEVER=1; default off, byte-identical baseline per L10)
