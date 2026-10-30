# sim-rankconv-b — PREREGISTRATION (written BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261030T1130Z.
Axis: food-economy. Arm: sim-rankconv-b — DIAGNOSIS ONLY, backlog #1493
(sim-findings.md line 1493): seed 9981 standing 75 by day 160 with rank
still village (wall snapshot sim-wall-b, run 20261030T0930Z).
ZERO src/js changes, ZERO policy-default changes, ZERO default flips.
Instruments/recorders only (scripts/test-rankconv-b.js + this prereg +
evidence files).

Base pin (HEAD at prereg time): fe1e46f53044453d864b195bb087929d05d993b6
Branch: sim-rankconv-b (worktree ~/workspace/worktrees/sim-rankconv-b).
Note: this HEAD already contains sibling loop-A work (sim-floortime-a
commits on top of the wall run's base 70ae4c83). The reproduction leg
therefore re-runs 9981 on CURRENT master, not the wall base; any drift
from the wall row is reported as drift, not hidden.

## Canon read first (before any leg)

- docs/CANON.md (manifest), docs/SCALE.md (the ladder: village 1–30,
  regional 31–60, national 61–90; Regional Dawn at first bond 21+ days;
  national = a polity + regional 30+ days + an ANSWERED national beat),
  docs/BALANCING.md (checked: no standing-to-rank conversion rule),
  src/js/hierarchy.js scaleRank() / _checkRegional / _checkNational /
  polityOf / _havenPolity / _linkSeasoned / stageFirstAccord /
  stageNationalBeat, src/js/standing.js villageStanding() /
  villageStandingTotal() / _linkRegionalPlus.
- Standing hypothesis stated BEFORE measurement (to be confirmed or
  refuted from recorded gate state, never from numbers alone):
  scaleRank() reads ONLY state.networkLive / nationalLive / globalLive
  (hierarchy.js:2042-2048). Standing feeds WAVE unlocks
  (villageStandingTotal), not rank. Standing's diplomacy source counts
  only SEASONED REGIONAL+ links (standing.js _linkRegionalPlus) — so
  standing cannot manufacture rank: diplomacy points presuppose the
  polity that rank also requires. If 9981 has zero links, its standing
  75 must decompose to war + plenty only, and the blocking gate is
  upstream of standing entirely: no first link, hence no Regional Dawn
  pending, hence no networkLive, hence rank village by construction.

## Primary metric (DIAG, not a lever bar)

Per seed, on identical policy/horizon: final rank, standing trajectory
(total + war/diplomacy/plenty breakdown at end), link roll (every
active link: kind, other end, age days, trust, seasoned?, regional+?),
gate snapshot (networkLive, networkLiveDay, _regionalPending,
pendingAccord, accordUnanswered, pendingNational, scaleRefused,
_havenPolity() shape or null, polityOf('haven') / _belongPolity /
_covenantPolity / _tradePolity, foreignPolities count), max wave,
days, end reason, and policy-origin inter-village verb counts
(proposeLink / proposeCovenant / proposeTrade / answerAccord /
answerNationalChoice — from runDays pacing acts).

## DIAG-GO threshold (pre-registered, binds the run)

DIAG-GO iff ALL of:
1. 9981 reproduction runs to 180d death-aware on current master and
   reproduces the wall face: rank village at end AND standing >= 50
   at some sampled day (wall: 75 by day 160; drift in the exact number
   is reported, the face is rank-village-with-standing).
2. Every pilot seed that ends village-ranked carries a classification
   citing at least one RECORDED gate field (not an inference from the
   standing number): one of NO-LINK (zero active links, no
   _regionalPending), DAWN-PENDING (pending, bond < 21d at end /
   broken), UNSEASONED-REALM (links exist, < 3 seasoned on every
   road), REGIONAL-NOT-NATIONAL (networkLive true, no qualifying
   polity or < 30d regional or beat unanswered/refused), or OTHER
   (named, with the field).
3. The named answer to "what converts standing into regional rank"
   is stated with its code citation, including the answer "nothing
   on this evidence" if that is what the gate state shows.
A miss on (1) or (2) is NO-GO: no confirm spend, no re-scoring against
a friendlier metric. Metric doubts go under "metric review".

## Horizon + why (DEATH-AWARE, never a fixed 200d)

Cap 180 days, death-aware: the harness stops at Game.over; a run
reaching the cap is reported AT CAP, never as a death. Dead/scattered
villages stop simulating (+10d tail max — the harness stops at
Game.over, so no post-death tail is simulated at all, which satisfies
the cap). Why 180: identical to the wall snapshot, so the 9981
reproduction is comparable seed-for-seed and the fresh band covers
the same wave-4/5 + rank window.

## Seeds (fixed up front, never re-screened)

- Reproduction leg (NOT part of the fresh band): 9981, competent, 180d.
- Pilot band (FRESH — verified before this prereg: none of these
  literals appears in any evidence/2026-10-30/*.md file, and no
  evidence/2026-10-30/*rankconv* file existed at prereg time):
  12311, 12312, 12313, 12314, 12315, 12316, 12317, 12318.
- Confirm band (ONLY on pilot DIAG-GO, 12 seeds, same freshness check):
  12401, 12402, 12403, 12404, 12405, 12406, 12407, 12408, 12409, 12410,
  12411, 12412.
No seed is added, dropped, or replaced after seeing results.

## Policies (exact)

- scripts/policies/competent.js (`competent`), defaults only, NO env
  flags (no FEASTSCALE / WINPURSUIT / SEATDRIVE substrate). Same
  policy as the wall snapshot, so the reproduction is a policy match.
- Recorder: scripts/test-rankconv-b.js, invoked ONE SEED PER CHILD
  PROCESS (harness rule: never two harnesses in one process).
  Usage: node scripts/test-rankconv-b.js <seed> <out-json>
  The script refuses to overwrite an existing output file (freshness
  guard: a re-run onto a live file fails loudly instead of silently
  replacing evidence).
- Sense read: one sample villager's days around standing/rank from
  the 9981 reproduction (roster snapshot + deaths + a day-window
  transcript read where the harness exposes one), judged for
  robotic/static/repeated behavior under the SENSE-TESTING LAW.
- Determinism gate: re-run of one pilot seed in a fresh child process
  must reproduce its row byte-identically (days, endReason, rank,
  standing trajectory, link roll, gate snapshot) before judging.
  If master moves under this run (loop A merges), rebase onto the new
  tip and re-run proof legs before judging.

## Balanced panel (§15)

No before/after pair exists (single census state, DIAG only), so NO
panel compare is produced or claimed — honestly stated, never
fabricated. The wall snapshot's panel (sim-wall-b-panel) is the
instrument artifact for the reproduced leg; this arm attaches its
own per-seed gate JSONs as the census instrument instead.

## Telemetry deviation check

Same as the wall run (baseline
hidden_files/telemetry-baselines/scale-wall.json, metrics
national,table,wins,exiled, per-seed files). Regime note pre-stated:
the baseline is a WINSEAT regime baseline; this arm is COMPETENT
regime, so LOUD lines on national/table/wins are the expected regime
artifact, investigated same-run and reported, baseline NOT rolled
on a regime difference.

## Metric review (required section, in every evidence file)

Pre-registered metrics bind the run; a miss is NO-GO, never
re-scored. Revisions proposed here apply to the NEXT run only.
Known candidate issues carried in, not decided here: (a) sweep-compare
`table` counts invitations while the panel counts sittings — quote
invited + entered as a pair; (b) four-realm formation is NOT tracked
by this recorder (polity shape IS recorded, which is the closest
honest field — do not relabel it "four-realm"); (c) runDays `deaths`
counts monster deaths alongside villager deaths — split them in
reporting.
