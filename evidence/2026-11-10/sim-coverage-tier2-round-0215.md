# Coverage Tier 2 round — run fleshout-20261111T0215Z (fishing first numbers + standing-199 plateau read — 2 arms LANDED, merged locally pending ship)

Run: `fleshout-20261111T0215Z`, Loop A, axis coverage Tier 2 (fishing first
numbers) + scale-onramp (standing-199 plateau read, backlog #2098).
Coordinator evidence. Both arms merged locally, pending ship. No push, no
bump, no live verification by this run — the ship loop owns deploys.

## Run summary

No lock at run start (Loop A 0115Z closed 02:15Z, claim + lock deleted).
Loop B LIVE on its 0025Z claim at run start (sim-garden-b hb 01:17:28Z +
sim-fightplay-b hb 01:25:59Z, sims running per the 0115Z review at 02:15Z)
— NOT touched. Loop B's 0230Z adoption run later recovered that dead run
and landed both arms (garden 3536e0aea, fightplay defeb45bf) and marked
Tier 2 gardening + fight-play [x] in the tracker. This run worked the next
unchecked items in order: fishing + standing-199 (#2098). Master tip at
claim time: cb7cd6695. Pre-flight: main tree clean, disk 35%,
worktree-reap ran (10/16 active, no removals; LOUD lines all other
owners' uncommitted trees). Claim written before any sims; arms
registered as sim-fishfirst-a + sim-standing199-a.

Master moved once under the run (Loop B landing, cb7cd6695 → defeb45bf,
11 commits). Both arms rebased onto the explicit master SHA at closeout
(standing199 onto defeb45bf, fishfirst onto 68c5c221e), proofs re-run
green after every rebase (standing199 35/35, fishfirst 51/51), both
merged --ff-only with ancestor checks. No EPERM flap this run.

## Arm 1 — sim-fishfirst-a: GO (fishing first numbers)

Branch `sim-fishfirst-a`, merged ff-only as b6277758a (prereg f0d1264f1,
instrument 2e2f0faaa, pilot b6277758a after rebase). Proof 51/51, re-run
green on the rebased branch and on merged master. Zero src/js.

Coverage Program Tier 2 fishing — FIRST NUMBERS. Band 180233–180240
(8 seeds, competent, 150d death-aware, 869 village-days). The
coordinator-suggested 180225–180232 was correctly refused by the worker:
named in the preserve-a prereg as a reserved confirm band, so per the
freshness skill it counted as used; the worker ran the full search and
picked 180233–180240, recorded in the prereg. GO on instrument validity
+ complete first-numbers capture (1,279/1,279 deposits named, 74/74
carcasses with origin, neutrality 8/8 exact, 0 instrument errors).

Headline: the creek crew is staffed 838 days but catches fish on 86.
PRODTHROTTLE redirects 2,199 duty resolutions to wood/water/stone while
the pantry holds >4 fresh days; the other empty days are 104
fished-out/no-water and 217 all-holders-sheltered. Fish landed 113,790
kcal — 13.6% of pantry deposits, the 2nd-biggest duty food after
foraging (35.1%); garden 3.1%; Game meat 0. The scholar never fishes
(0 line-fish attempts, 0 gill-net sets, 0 fish carcasses, fishWise 0/8)
yet eats 7,025 kcal of village fish. Staffing: 1,142 calls / 1,099 ok /
43 refused (3.8%, all trust-too-low); repeat-ask shape persists (max 4
asks of one villager in one day) despite the landed fallback. Sheltered
holders 683/1,717 holder-days (40%). Ecology never limits: home-board
fish stock grows on every watered seed (141→761); the fished-out line
fires 0 times. But seed 180235 has 0 water tiles yet staffed a creek
crew 143 days (301 calls, 0 fish). Hunt duty never staffed under
competent (Game meat 0); fishing grants no foodXp (0 snapshots); fish
spoilage unmeasured (dawn sweep purges rot pre-snapshot); trader-gift
smoked fish unmeasured; catch voice uncaptured (say cap exhausts day
7–9, first catch day 22–93). Instrument fix found in proof: noteDeed IS
creditDeed('player') — wrapping both double-counted player deeds; fixed
with a suppression flag, proven 51/51.

Wall (fishfirst corpus): wins 0/8, national 0/8, table 0/8, wave-4
unlock 8/8, wave-5 2/8, regional 6/8, median survival 122.5d (middle
two 116/129), deaths 650, starvation 4 (0.6% — villages die fighting,
not starving).

Evidence: evidence/2026-11-10/sim-fishfirst-a.md + sim-fishfirst-a-prereg.md
+ fishfirst-summary-fishfirst-pilot.json + perseed-fishfirst-a/ (16 files).

## Arm 2 — sim-standing199-a: DIAG-GO (standing-199 plateau read)

Branch `sim-standing199-a`, merged ff-only as 68c5c221e (prereg a3aee9d6b,
instruments 0f32e02b8, pilot 68c5c221e after rebase). Proof 35/35, re-run
green on the rebased branch and on merged master. Zero src/js.

Backlog #2098 ANSWERED and marked fixed in sim-findings.md. Band
170233–170240 (8 seeds, competent, 150d death-aware). Classes: released
3, defer5 2, standing-short 3. Pin-days: 97 / 50 / 54 / 41 / 23. First
pins d55–98.

The answer: 199 is a stage gate — the defer5 combat-readiness deferral.
`villageStandingTotal()` (src/js/standing.js:184) holds the gated total
at t5−1 while `waveCombatReadiness(5)` isn't ready. On all 5 pinned
seeds, every first-pin day had veterans as the ONLY short bar (demand:
2 living wave-4+ killers; first-pin counts 0–1; armor/armed/tricks all
met). The plenty cap fired 0 days; points-source exhaustion accounts
only for the 3 standing-short seeds (peaks 150/185/195). Raw standing
never decays on this band — the 76003 shape (197→100) did not
reproduce; what rots is readiness (veteran deaths, gear thinning), not
the number.

The gate OPENS: releases 3/8 (d105, d113, d121) — each on the exact day
the second living veteran arrived; two release veterans were `visjoin_*`
incomers carrying kills. Near-miss of the run: 170235 gets its 2nd
veteran on the final day but weapons fall to 4/6 — door stays shut.
Diplomacy 0 on every snapshot of every seed; max 1 link/village
(170233: zero links, still village-scale at standing 320).
Seasoned-but-not-regional windows on 3 seeds — the standaccum-b note
holds verbatim. Sense-test: standingLine rows honest on every
pin/release day; hold beats read aloud via a supplementary sense leg
(captureSysSay, trajectory verified identical to the pilot on all 148
common days) — "The fifth draft stays in the wings… blood your
fighters (1 of 2 veterans)", tracking the bar as veterans live and die.
Steve-call #2067 (near-miss path) NOT decided — reported only.

Wall (standing199 corpus): wins 0/8, national 0/8, table 0/8, wave-4
8/8, wave-5 unlocked 3/8 (0 wave-5 kills — facing unmeasured), median
survival 150d (horizon cap, 4 censored). Deaths 135; the wild 91 (67%),
monster 16.

Evidence: evidence/2026-11-10/sim-standing199-a.md + sim-standing199-a-prereg.md
+ standing199-summary.json + perseed-standing199-a/ (8 pilot + 1 sense file).

## Wall numbers (this run's judged corpora, 32 configs)

National 0/16, table 0/16, wins 0/16; wave-5 unlocks 5/16 (standing199
3/8, fishfirst 2/8); wave-4 16/16; median survival 122.5d / 150d. The
scale wall stands above both measurements: the 199 gate opens when the
second veteran arrives, but no village in either corpus reached
national, and wave-5 facing is still unmeasured.

## Telemetry deviation check

REFUSED both corpora (recorder rows, not runs) — same handling as the
2115Z and 0115Z runs: "Recorder corpora are compared with sweep-compare
tables, never against a run baseline here." Baseline NOT rolled, no LOUD
lines, no investigation item.

## Metric review (for the NEXT run, §14)

- Both arms' metric reviews (in their evidence files) stand. Neither
  arm spent a confirm band (measurement / DIAG arms only; GO on
  instrument validity claims no landing).
- Fishfirst: fish spoilage + trader-gift smoked fish unmeasured by
  instrument limits, not by absence — a later arm needing those numbers
  needs a same-tick capture or a wrap on the inline push.
- Standing199: wave-5 facing needs its own entry-point wrap; the
  release-day veteran-arrival mechanism is now the thing to watch, not
  the standing number.

## Infrastructure

- Safe-commit index clobber hit all 3 commits on BOTH workers —
  repaired each time via `git ls-tree -r HEAD | git update-index --add
  --index-info` after hash-object verification; all blobs matched HEAD,
  status empty. No clobber on the coordinator commit (this file).
- The orphan branch sim-preserve-a (2115Z note) was listed by `git
  branch --list` at run start (02:16Z) and gone on re-check minutes
  later (show-ref + loose/packed refs all empty) — no action taken by
  this run; likely reaper/sibling cleanup. No slug conflict remains.
- Worktree sim-ctraj-b exists on disk with NO registry entry — left
  alone (not mine; the reaper did not remove it).
- Loop B's 0230Z coordinator evidence file
  (evidence/2026-11-10/sim-adoption-round-0230.md) sat uncommitted in
  the main tree through this run's closeout — NOT mine, left for that
  run; this run's safe-commit named only its own file.
- Stale claim fleshout-20261110T1815Z.json is still live though its arms
  appear landed (diplo 70e3af870, spawncensus 00cc52780) — flagged for a
  retirement check, not touched here.
- check.js --quick NOT re-run: zero src/js in either arm; standing
  280/7 pre-existing profile last recorded by the 2315Z run. The r129
  measurement-proof refresh stays owed (tracker tail); this run touched
  no src/js.
- The 2115Z round record's repo copy was already committed as 3daa1a9b6
  by the 0115Z run — the "owed" item is done, nothing claimed here.

## Tracker

Tier 2 fishing [x] (sim-fishfirst-a, b6277758a). Backlog #2098 fixed
(sim-standing199-a, 68c5c221e). Tier 2 gardening + fight-play [x] by
Loop B's 0230Z adoption run (not this run's marks).

scale-onramp stays converging (NOT converged): the 199 gate is now
decomposed and observed opening on 3/8 seeds, but wins are still 0
everywhere, national 0/16 in this run's corpora, and wave-5 facing is
still unmeasured. food-economy stays converging (untouched; sibling
loop). Next blanks, in order: (1) trapping first numbers (next
unchecked Tier 2 item); (2) wave-5 facing measurement (wrap a wave-5
engagement entry point); (3) fishing follow-ups — no-water staffing fix,
scholar fishing verbs, fishing XP question; (4) COUNTER_ANSWER default
call (Steve/coordinator); (5) measurement-proof refresh after r129
(owed). Claim deleted; lock deleted.
