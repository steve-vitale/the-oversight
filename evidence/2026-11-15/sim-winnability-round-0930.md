# sim-winnability-round-0930 — Loop B run fleshout-loop-b-20261115T0930Z (axis winnability chain)

STALE-LOCK RECOVERY + ADOPTION of the 0730Z run, then two arms:
gap-3+ established-bearer deaths DIAG-NO-GO (landed c6343a839) +
same-day cascade lever PILOT GO / CONFIRM NO-GO on the cost bar
(kill record landed 81b4db456, lever NOT merged). Merged
locally, pending ship.

## Stale-lock recovery + adoption (0730Z run)

At run start the Loop B lock belonged to run
fleshout-loop-b-20261115T0730Z (created 07:30:00Z, 2h04m+ old — past
the 90-min fallback). Its tree heartbeats were 62–74 min stale, both
workers were cancelled before finishing (~08:54Z), and no live
processes remained. The claim was retired to .DEAD with a note; the
lock was replaced by this run's. Loop A live on scale-onramp
throughout (0810Z transplant arms) — NOT touched.

Recovered intact: the cascade Stage 1 diag (report + control corpus +
lever in the tree, uncommitted) and the gap3 prereg + driver +
analyzers + control corpora. Lost to the write flap: the cascade
"on" leg (8× 0-byte files) and the gap3 control-v5 re-run (5× 0-byte
tmp files) — both deleted as debris, both re-runs owed. The flap
(window #7, ~08:52–09:48Z, ~56 min, the longest on record) was active
at run start and cleared ~09:48Z; it returned briefly ~10:00–10:01Z
during the cascade worker's control sweep (see Infrastructure).

## Arm 1 — sim-gap3-b: DIAG-NO-GO (landed c6343a839)

Branch sim-gap3-b, tip c6343a839 (1 commit, rebased clean onto
7251dcb4f, proof 15/15 re-run after the rebase by the coordinator).
Evidence-only — no src/js change. The diag was computed fresh by the
adopting run from the intact control corpus; no new sims were spent
(the flap blocked per-seed writes at the time).

- The gap-3+ deaths are not trips: **24 of 34 at Haven**, only 8
  map-decline candidates (3 known-only). First-order ceiling on P1
  **0.921x** control (known-only 0.968x); episode-truncation ceiling
  0.746x. GO bar 0.6x. **DIAG-NO-GO** by the frozen rule — no Stage 2
  builds. The dominant channel is the SAME lingering-besieger Haven
  channel the cascade arm owns.
- All 88 scholar `the wild` deaths by location: haven-grounds 49,
  haven-inside 20, dest:forage 16, dest:other 2, non-dest 1. Haven
  timeline: **59 of 69** Haven killers were first seen on the Haven
  tile ≥1 day before the death (3+ days: 37) — squatters, not
  same-day arrivals.
- Gap-3+ detail: wave w4 25 / w5 3 / w3 5 / w2 1; solo 29/34;
  never-killed bearers 22 / fighters 12; policy race says decline
  33/34; HP median 99 (22/34 at 98+); gap days median 8, max 44.
- Proof test 15/15 ALL GREEN (the determinism case failed once only
  on ENOENT writing det-a/ during the flap — a flap artifact, not a
  driver defect; re-run green after the flap cleared).
- Evidence: evidence/2026-11-15/sim-gap3-b.md (+ prereg, corpora).

## Arm 2 — sim-cascade-b: PILOT GO, CONFIRM NO-GO (kill record landed; lever NOT merged)

Adoption worker (branch sim-cascade-b, tip 3bb4cc478 — 3 commits,
rebased clean onto 7251dcb4f, no rebase quirk; worktree released as
done-abandoned). The lever (`if (m.lingering) return;` in
`monsterTurn()`) stays on the branch, NOT on master. What lands here
is the kill record only: report + prereg + 16-seed corpora + §15
panels + driver/analyzer/panel-builder (evidence-only, no src/js, no
proof test — the test asserts the lever and would fail on master
without it). Precedent: successorcaution's killed-arm record landed
the same way (ba84576ba).

**Pilot (8 seeds 100201–100208, 150d, competent-answercourt-b) — GO:**
- P1: 0.1649 → **0.0573 (0.35x)**, bar ≤ 0.0989 — PASS
- P2 median national held-days: 47.5 → **84** — PASS
- Cost: starvation 0 → 1 (≤2), survival 117.5d → **150d** (≥94d) — PASS
- Gap-0 followers 23 → **3**; same-instance repeat-killer pairs
  27 → **0**; survived 0/8 → **5/8**. Proof test 4/4 on the rebased tip.
- Fresh control re-run reproduced the prereg exactly (P1 0.1649,
  held 47.5, survival 117.5, deaths 652, gaps 23/22/5/38) —
  trajectories byte-identical except `anchorCommit`. Zero tip drift
  (af56c7b4f touches only conversation files).

**Confirm (16 seeds 100201–100216) — NO-GO on the cost bar:**
- P1: 0.1248 → **0.0665 (0.53x)** — PASS; P2 57 → **70.5** — PASS;
  survival 123d → **145.5d** — PASS; survived 3/16 → **6/16**.
- **Starvation pooled: 3 → 8, bar ≤ 5 — FAIL by 3.** Gap-0 39 → 11;
  same-instance pairs 41 → 3. Scale reach softer: national-ever
  14 → 12, end national 13 → 11, wave-5 7 → 4, wave-4 16 → 15,
  dissolutions 1 → 3. Total deaths 1329 → 1235.
- **Why (mechanism established, not assumed):** gorge nights
  **645 → 1172 (+82%)** on 14/16 seeds — lingerers now survive to
  gorge the full ~6 nights instead of being fought in the hall, so
  the lever trades bearer lives for pantry kcal (the design's own
  stated price: "the gorge is the price"). Plus one chaotic wipe:
  seed 100216 collapsed at day 26 (control: 143d) downstream of the
  lever firing at d12 (skipped murkcap fight → RNG shift → pantry
  crash); that run had **zero** gorge lines, so the wipe is
  trajectory chaos, not the gorge mechanism. The 3 excess deaths over
  the bar are exactly 100216's +3. Recorded as adjudication context,
  NOT a re-score — the bar stands as failed.
- §15 panel (8- and 16-seed): review_required, no material signals.
  Telemetry LOUD lines are the known winseat-regime artifact
  (identical on control).
- **Kill discipline.** A missed bar alone is not a kill — the WHY is
  established, and the lever is not wrong at its job (P1 0.53x,
  gap-0 39 → 11, pairs 41 → 3, survival +22d, survived 3 → 6).
  What is wrong for landing is the unpriced trade: the lever saves
  scholars by letting every siege run its full gorge. The lever is
  killed **for landing**, not for the idea. Do not re-run this lever
  unchanged on a friendlier metric.
- Evidence: evidence/2026-11-15/sim-cascade-b.md (+ prereg,
  16-seed corpora, §15 panels).

## Wall numbers

- Cascade pilot (fresh control vs armed, 8 seeds): P1 0.1649 →
  0.0573; held-days 47.5 → 84; survival 117.5d → 150d; starvation
  0 → 1; survived 0/8 → 5/8; wave-5 3/8 both; table 0/16; wins 0/16.
- Cascade confirm (16 seeds): P1 0.1248 → 0.0665; held-days 57 →
  70.5; survival 123d → 145.5d; starvation 3 → 8; survived 3/16 →
  6/16; national-ever 14 → 12; end national 13 → 11; wave-5 7 → 4;
  dissolutions 1 → 3; table 0/16; wins 0/16.
- Gap3 control (8 seeds): P1 0.1649; held-days 47.5; survival
  117.5d; starvation 0; total deaths 652; dissolutions 1; wave-5 3/8;
  wave-4 8/8; wins 0; table 0.
- The wall stands: no wins, no table on any winnability band. The
  lever moves the chain's middle links (cascade deaths, survival,
  held-days) but does not open the wall — and at 16 seeds it trades
  some scale reach for that survival.

## Infrastructure

- Flap window #7 (~08:52–09:48Z, ~56 min, longest on record) active
  at run start; cleared ~09:48Z (probe OK, heartbeats verified).
  Returned briefly ~10:00–10:01Z during the cascade worker's fresh
  control sweep: seed 100205's write failed after the driver's 480
  retries, fell back to a stdout dump, then the exec session was
  SIGTERM'd at ~6 min (100206–100208 never ran). Recovered in 2-seed
  chunks; 100205's fallback summary matched its re-run exactly.
- Safe-commit index clobber struck 3× this run (gap3 once, cascade
  twice) — repaired each time with the documented `git ls-tree -r
  HEAD | git update-index --add --index-info` pipe, commits verified
  correct, no work lost.
- `git gc` warning at merge time (too many unreachable loose
  objects) — housekeeping for the ship loop, not this run.
- Reaper skipped at pre-flight (registry lock held) — the known lock
  self-contention; the fix needs a Steve nod, so no action taken.
- Master moved under the run (journey-establishment r210 at
  7251dcb4f → gap3 landing c6343a839 → this round's record).
  Loop A live on scale-onramp throughout (0810Z transplant arms) —
  NOT touched.
- Telemetry deviation check: not applicable to the diag-only gap3
  arm (the tool refuses recorder-corpus per-seed input; no armed leg
  exists to compare). The cascade worker ran it on its armed leg
  with --allow-recorder-corpus: LOUD lines are the known
  winseat-regime artifact, identical on control.

## Metric review

- Cascade: P1 moved 0.35x against the 0.6x bar — a real effect, not
  a ceiling artifact. The shortfall against the predicted ceiling
  (0.0573 observed vs 0.0498) is residual non-lingering breach deaths
  (pending/feast fights, one door-fled stash re-engage) plus lone
  gap-3+ deaths the lever structurally cannot reach — NOT a guard
  failure: same-instance pairs went 27 → 0, so the guard engaged
  fully on its target. Gap-0 fell 23 → 3 while gap-3+ stayed 38 →
  38 — the lever touched exactly the bucket it was built for and
  nothing else. Total deaths rose 652 → 674 on the pilot only because
  villages live longer (524 vs 382 national-days — more days at risk).
  The cost bar's pooled absolute starvation count punishes longer
  survival; the next run should price the gorge directly
  (starvation per lived-day, or pantry-kcal per siege) rather than a
  pooled absolute count — and any re-test of this lever needs its own
  fresh prereg with that priced cost bar, never a re-score of this kill.
- Gap3: P1 conflates Haven deaths (69/88) with destination deaths
  (16/88) — the diag quantifies the addressable share (8 deaths, 5
  while-national). Even the episode-truncation ceiling (0.746x)
  misses the bar by a wide margin; the shortfall is structural, not
  a measurement gap.

## Village assessment (plain words)

Two versions of the same villages, and the same beast standing in
the hall. The old way, a wave-4 monster walked into the hall, killed
the scholar, and killed the next bearer the same day, and the next —
one beast bleeding a little more with each bearer it killed, the
village grieving six times and never learning it was one enemy. The
new way, the beast holds the treeline and never comes in — and the
village lives: five of eight villages survive the season, the realm
holds twice as long, the same-day deaths nearly vanish. But the beast
still eats. Every night it gorges from the pantry, and with no one
fighting it in the hall it eats for six full nights instead of two —
and on the wider count, three more villagers starve than the bar
allows. The village does not die of the beast anymore. It dies a
little hungrier, a little later, holding its realm. And the
established bearer who has lived in the village for weeks still dies
at home the same way — the trip was never the danger; home was.

## Next blanks (winnability chain), in order

1. answercourt cost call (Steve / main session).
2. competent seat-taking BUILD (Steve-call).
3. Cascade gorge-pricing follow-up (NEW): price the gorge directly
   (starvation per lived-day or pantry-kcal per siege) and re-test
   the lingerer guard under a priced cost bar — OR pair the guard
   with a gorge answer (the sortie door is closed by prior evidence;
   a gorge answer is a design call, not a tuning knob). Fresh prereg
   required; never a re-score of this kill.
4. Veterans survivorship (design question).
5. Phone-frame receipt refresh.
6. Only-lead-shape second band.
7. Family 2b AMBIGUOUS (Loop A suspect list).
8. Gap-3+ map-decline: CLOSED (DIAG-NO-GO this run — ceiling 0.921x).

winnability chain stays converging (NOT converged): the middle links
move (cascade deaths halved, survival doubled at pilot) but the cost
bar fails at confirm and table/wins remain 0 on every winnability
band. scale-onramp stays converging (untouched; sibling Loop A).
food-economy stays converging (untouched; parked). Claim deleted;
lock deleted. Evidence: evidence/2026-11-15/sim-winnability-round-0930.md;
arms: evidence/2026-11-15/sim-gap3-b.md (c6343a839),
evidence/2026-11-15/sim-cascade-b.md (kill record 81b4db456).
