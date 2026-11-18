# sim-winnability-round-0430 — COORDINATOR EVIDENCE (Loop B run fleshout-loop-b-20261118T0430Z, axis winnability-chain)

**Run:** fleshout-loop-b-20261118T0430Z · **Axis:** winnability-chain (converging) · **Loop:** oversight-flesh-out-loop-b
**Arms:** sim-launchparty-b + sim-expedroster-b (+ sim-fightgate-scope-b NOT STARTED)
**Master at closeout:** (this commit — round evidence only; both arms HELD on their branches)
**Claim:** `hidden_files/lever-claims/fleshout-loop-b-20261118T0430Z.json` (retired to `.DEAD` at closeout) · **Lock:** deleted at closeout.

## STALE-LOCK RECOVERY / ADOPTION (closeout by adoption)

The 0430Z coordinator timed out at 7200s with arm 1 complete but
unmerged, arm 2 instrumented but un-swept, and arm 3 unstarted. Lock
`fleshout-loop-b-20261118T0430Z` (created 2026-11-18T04:55:00Z) was
still in place at adoption (~06:57Z); the run's two registered trees
had heartbeats 06:33:30Z (sim-launchparty-b) and 06:36:28Z
(sim-expedroster-b), both >15 min stale, and no live process existed
in either tree — dead per the guard. The adoption refreshed both
heartbeats immediately (07:02Z / 07:05Z), ran the expedroster pilot
sweep the coordinator never reached, verified both arms, and closed
the round. Loop A was live the whole adoption (0647Z claim,
sim-taxonomy2516-a, finding #2516 re-read) — NOT touched. Lane B
playtest loop registered journey2-endgame mid-adoption — NOT touched.
Arm 3 (sim-fightgate-scope-b) was never started; it stays in the
queue for the next Loop B run, NOT adopted here.

## Arm 1 — sim-launchparty-b: BUILD NO-GO (METRIC-BROKEN), HELD

Finding #2515's fix — the meeting sense prefers the win-plan launch
party (`src/js/party-wiring.js`, `LAUNCHPARTY=1`, default off).
Pilot band 103901–103908, substrate `VETREENGAGE=1 + PARTYSIZE4=1 +
FLEEREPAIR2=1`, 150d, competent verbatim, 8 seeds/leg.

| Check | Result |
| --- | --- |
| Primary: launched-meeting subset rate (arm ≥ 60% AND arm−ctl ≥ +30pp) | **MISS** — ctl 0/7, arm 0/8 |
| Pool floor (≥6 launched meetings with ≥1 ally per leg) | **MET** — ctl 7, arm 8 |
| Secondary: companion-slot fill (arm ≥ 70%, +25pp) | **MISS** — ctl 0.00, arm 0.25 |
| Secondary: full-trio arrivals | 0 ctl / 0 arm |
| Secondary: damage per launched contact meeting | DOWN — ctl 67.7 → arm 48.0 (n 7/8, noise, not binding) |
| Secondary: 4th-seat appearances | 0 / 0 (structural — engine caps at 2 allies) |
| Cost bar: starvation (arm ≤ ctl+2) | **PASS** — ctl 11 → arm 9 |
| Cost bar: median survival (arm ≥ 0.8× ctl) | **PASS** — ctl 124.5d → arm 149.5d |
| Proof green | **PASS** — `scripts/test-launchparty-b.js` 16/16 |
| Analyzer selftest green | **PASS** — `scripts/analyze-launchparty-b.js --selftest` 11/11 |

Kill kind METRIC-BROKEN, not CONCEPT-DEAD: a subset meeting needs TWO
launch companions, and the pilot band produced **zero trio launches in
17 wave-4+ launches on either leg** (`partyTrios: 0` on all 16
seeds) — the maximum achievable subset rate was 0% before the first
seed ran. The concept itself demonstrably fires: in every launched
meeting where the fighter's live expedition pairing included a
companion (4/4), the sense returned that companion FIRST, and in the
3 meetings that came to a shout, the companion answered. Panel
`review_required`, one `regression_watch` (deaths/run) investigated
as exposure (arm villages lived 94 more days; deaths/100d flat 69.0 →
68.4), not a new death mode. Finding #2518 filed (trio launch
drought: VETREENGAGE's second-companion pick fired 0/17 wave-4
launches on this band). The corrected primary for the next run is the
companion-slot fill rate (0.00 → 0.25 here); the subset rate is
demoted to a trio-only secondary.

The branch's `src/js/party-wiring.js` change must NOT land. Held on
branch sim-launchparty-b @ f5274f4d6, worktree clean, heartbeat
fresh at closeout.

## Arm 2 — sim-expedroster-b: DIAGNOSTIC NO-GO (METRIC-BROKEN), HELD

The daily `st.exped` snapshot instrument (finding #2511's unanswered
half / tracker blank #4: do launch members share tiles en route, or
only a shared destination?). No `src/js` change. Pilot band
104201–104208 (verified fresh), substrate `VETREENGAGE=1 +
PARTYSIZE4=1 + FLEEREPAIR2=1`, `LAUNCHPARTY` unset, 150d, competent
verbatim, single leg. Pilot sweep run by the adoption (driver exit 0,
8/8 seeds, 0 instrument errors).

| Check | Result |
| --- | --- |
| Primary 1: capture rate ≥95% | **PASS** — 16/16 = 1.000 |
| Primary 2: snapshot gaps = 0 | **FAIL** — 111 gaps |
| Primary 3: join rate = 100% | **PASS** — 6/6 = 1.000 |
| Pool floor (≥5 deduped wave-4 launches) | **MET** — 16 launches |
| Proof green | **PASS** — `scripts/test-expedroster-b.js` 15/15 (re-run on the branch tip by the adoption) |

Kill kind METRIC-BROKEN: the gap bar counts missing days strictly
inside a member's whole-window roster span `[firstRosterDay,
lastRosterDay]`, which bridges the days between one expedition ending
and the next beginning. All 111 gaps were audited against the corpora:
**111/111 are home intervals, 0 are true recorder misses** (no gap
day is ever flanked by rows of the same expedition — e.g. Aroha
s104204: rows d94–99 `sinceDay=98`, no rows d100–112, rows resume
d113 with `sinceDay=113`, a new expedition). The recorder fired on
every day an expedition existed (1,731 roster rows).

**The scientific answer is delivered:** 13/16 launches
together-en-route (same node AND same target on some day; Zoe +
Wanjiru shared tiles for 22 days on s104207), 0 destination-only, 3
holder-only (companions named on the launch row who never departed).
Launch members DO share tiles en route. The corrected gap bar for the
next run counts gaps only within one expedition (one `sinceDay` run);
a re-judge of this same instrument and corpus under the corrected bar
would pass all three bars, with no code change needed.

Held on branch sim-expedroster-b @ cb814633d (instrument 5d68e7ea5 +
pilot corpora/analyzer/evidence cb814633d), worktree clean, heartbeat
fresh at closeout.

## Wall (this run's judged corpora)

| Corpus | National standing | National rank | Table | Wins | Wave 4 | Wave 5 | Median survival | Survived |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| launchparty ctl 103901–103908 | 2/8 | 0 | 0 | 0 | 7/8 | 2/8 | 124.5d | 3/8 |
| launchparty arm | 1/8 | 0 | 0 | 0 | 7/8 | 1/8 | 149.5d | 5/8 |
| expedroster 104201–104208 | 2/8 | 0 | 0 | 0 | 6/8 | 2/8 | 125d | 4/8 |

The wall is unchanged: no table, no wins anywhere. The standing-199
stall dominates both bands (5/8 arm villages parked at exactly 199 on
the launchparty band; 4/8 on the expedroster band). National standing
is reached (2/8 on both control legs) but rank never follows.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale-wall.json --current
'evidence/2026-11-18/perseed-expedroster-b/*.json' --metrics
national,table,wins,exiled`: **REFUSED recorder-corpus input** (all 8
rows carry top-level anchorCommit — sweep recorder rows, not runs;
same documented refusal as prior runs). Baseline NOT rolled. No LOUD
lines beyond the refusal.

## Infrastructure notes

- Write flap EPERM ~05:01–05:19Z (the 23:01 CST window) hit the
  0430Z run mid-flight: worktree registration retries and heartbeat
  failures; the coordinator survived it and timed out later on the
  7200s budget, not on the flap.
- Registry-lock contention all morning: heartbeat/registration calls
  queued on `REGISTRY.lock` for minutes at a time (reaper + sibling
  registrations: journey2-endgame, sim-taxonomy2516-a). The adoption's
  first heartbeat took ~8 min to acquire the lock. No work was lost;
  the lock queue cleared on its own.
- Safe-commit index clobber struck the expedroster evidence commit
  (all 10 files showed staged-deleted in the worktree index);
  repaired via the `git ls-tree -r HEAD | git update-index --add
  --index-info` pipe; commit cb814633d verified correct
  (hash-object matches HEAD blobs, status + diff HEAD empty).
- One service restart SIGTERM'd the launchparty pilot mid-sweep
  (~05:42Z); 6 finished seeds survived intact and the missing seeds
  were resumed, not re-run — no seed ran twice.
- Lane A journey-deepening adoption ran its `check.js --quick` gate
  concurrently (started 06:46Z); the adoption ran no gate of its own
  — both arms are NO-GO held (nothing merges from them) and the round
  evidence is docs-only, so no gate was required. Proof tests were
  re-run for both arms instead (launchparty 16/16 per its evidence;
  expedroster 15/15 re-run by the adoption).

## Findings

- #2518 filed (trio launch drought) — see arm 1.
- #2515 stays [claimed] by sim-launchparty-b: the 4th seat cannot
  appear at a meeting by construction; the launchparty fix is the
  sense-side answer within the 2-ally cap.
- #2512 stays open: no companion-expedition-target snapshot at
  meeting time (the roster recorder now makes the en-route half
  observable; the meeting-instant half is still unrecorded).

## Convergence state

Winnability chain stays converging (NOT converged). Scale-onramp stays
converging (untouched; Loop A live). Food-economy stays converging
(parked). Next blanks, in order: (1) #2515 fix shape — the
launchparty fix needs a confirm on a band where trios actually
launch, or a fill-rate bar that does not (arm 1's corrected prereg);
(2) expedroster re-judge under the per-expedition gap bar (no fresh
sweep needed); (3) #2518 trio drought — vetreengage second-companion
pick, band-fragile or genuinely rare; (4) sim-fightgate-scope-b
(arm 3, never started) for the next Loop B run; (5) #2516 taxonomy
re-read is Loop A's blank — do NOT duplicate. Claim retired to
.DEAD; lock deleted. Evidence: evidence/2026-11-18/sim-winnability-round-0430.md
(this commit). Both arms HELD, nothing merged locally from this run.
