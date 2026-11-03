# Full-seat diagnostic — seed 97339 (run fleshout-20261103T0011Z, axis scale-onramp)

## Pre-registration (written BEFORE the judged re-run)

- Arm: full-seat diagnostic, seed 97339 ONLY. ZERO game-code change
  (measurement only). This arm lands no lever.
- Context: run fleshout-20261102T1825Z evidence
  (evidence/2026-11-02/sim-scale-onramp-round-1825.md) — on the
  closecommit stack, seed 97339 reached NATIONAL standing and still took
  the LESSER seat: 92d, national, lesser, path feared, final mercy,
  self-taker Elif Demir. Full seat is 0/12 on that band and unwon overall.
- Reproduction recipe (same stack as the 1825Z wonflag probe, saved as
  goal hidden_files/wonflag-probe-20261102.js): policy stack tribfloor
  leadfeast + windefer + seatdrive + fullseat-diag + titanroute +
  musterclose + mustergap; env flags FEASTSCALE_R13=1 TRIBFLOOR=1
  WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 HERALD=1 (from the 1715Z
  driver header); mode herald; 250d cap; FULL say capture; record
  tableProg. One process, this seed only. Probe:
  scripts/fullseat-97339-probe-20261103.js (adapted from the wonflag
  probe, REPO pointed at this worktree, plus fullseat-diag snapFullSeat
  gate snapshots at every table-audit line and at run end).
- PRE-REGISTERED SUCCESS, judged exactly as written:
  (1) Reproduction must match the branch row EXACTLY — 92d / endReason
  over-other / won / NATIONAL scaleRank / maxWave 4 / lesser seat /
  feared / mercy / self-taker. If it does NOT reproduce, verdict =
  REPRODUCTION FAILED: report loudly and do NOT diagnose gates from a
  different run.
  (2) If reproduced, identify EVERY full-seat gate in code (start from
  table.js deedGateReady and the 2026-10-27 scale enforcement: national
  standing IS required for the full seat, deedGateReady must enforce
  scale in ok) with, for this run, the measured value vs the required
  threshold, and whether the transcript shows the full seat
  offered-and-declined, offered-but-unreachable, or never offered.
  A miss on (1) is NO-GO, never re-scored; metric doubts go under
  "metric review" below.
- Verdict, exactly one: GATE-BLOCKED | CHOICE | REPRODUCTION-FAILED.
- Canon read first: docs/CANON.md, docs/TABLE.md (seat: full/lesser/none),
  src/js/progression.js deedGateReady (code authoritative over docs).

## Results (judged re-run, 2026-11-03 ~00:53 UTC)

- Worktree branch tip at run: 1ce6d98fd (sim-scale-onramp-round-2215
  coordinator evidence). Probe run: 34s, one process, seed 97339 only,
  exit 0, 9,087 say lines captured (full transcript in
  /tmp/fullseat-97339-says.jsonl only — NOT in the repo).
- Compact analysis JSON (probe-written):
  evidence/2026-11-02/fullseat-97339-analysis.json (49.6 KB).

### Reproduction match — EXACT, all 10 fields

| Field | Expected (1825Z branch row) | Got | Match |
|---|---|---|---|
| days | 92 | 92 | yes |
| endReason | over-other | over-other | yes |
| won | true | true | yes |
| scaleRank | national | national | yes |
| maxWave | 4 | 4 | yes |
| seat | lesser | lesser | yes |
| path | feared | feared | yes |
| final | mercy ("Show mercy.") | mercy ("Show mercy.") | yes |
| taker | Elif Demir | Elif Demir | yes |
| takerSelf | true | true | yes |

Pre-registration prong (1) PASSES. Road inactive (roadActive false),
tablePhase done — a table ending, not a nomad-road ending. Gate
diagnosis below is therefore from the reproduced run, not a substitute.

### Every full-seat gate (deedGateReady, src/js/progression.js:613) — measured vs required

Gate state is IDENTICAL at the table-set (d90), at the audit (d92),
and at run end — the seat grade was stable, not a timing artifact.
(At d70, when villagers first gossip about the table, rank was still
regional and w3 was 5; by d90 rank is national and w3 is 6. The w4/w5
binding never moved.)

| Gate component | Required | Measured (d92) | Pass? |
|---|---|---|---|
| w1 distinct fought | ≥ 5 | 14 | yes |
| w2 distinct fought | ≥ 5 | 9 | yes |
| w3 distinct fought | ≥ 4 | 6 | yes |
| w4 distinct fought | ≥ 3 | 0 | NO — short 3 |
| w5 distinct fought | ≥ 2 | 0 | NO — short 2 |
| contests survived | ≥ 3 | 10 | yes |
| crises weathered | ≥ 3 | 3 | yes (exactly) |
| integration stage | ≥ 2 | 3 | yes |
| food deeds (sentimentTaught + feastSurgeUsed) | both | both true | yes |
| scale (national/global, enforced in `ok` per 2026-10-27 ruling) | national/global | national | yes |
| deedGateReady().ok | true | false | NO |
| tableSeat() | full | lesser | — |

Binding blockers (engine's own list): `["w4", "w5"]` and nothing else.
The national village passes scale, contests, crises, stage, and food
deeds — some by wide margins — and fails ONLY the wave-4/5 deed bars.

### Offered / declined / never offered

NEVER OFFERED — and structurally, it could not have been declined.
The full seat is not a menu option: `tableSeat()` computes a grade
from `deedGateReady()`, and the audit announces the grade. The d92
audit line reads, in full:

> "◈ THE AUDIT — the System reads your run back to you, and the
> galaxy listens. A lesser seat — national standing, waves 1–3 faced
> (14/9/6), 10 contests survived, 3 crises weathered. The table does
> not rise. It prices."

No line in the 9,087-line transcript offers, names, or prices a full
seat, and no line records a refusal of one. The only full-seat door,
the Indispensable, is listed unearned with the engine's own reason:
"The Indispensable needs a full seat — the galaxy must actually need
you, not just notice you." Six other doors were earned at the table
(feared 100, beloved 92, witness 73, defiant 52, assimilated 45,
relay 40); the feared path was taken because the win-side policy
(winseek.js tableRoad) always answers the first offered option
(`options[0]`), and feared sorts first — a policy drain artifact, not
a village choice between seats. The seat grade and the path choice are
independent: no door choice could have upgraded the seat.

### Why the w4/w5 bars are empty — the unlock/deed split

Wave 4 IS unlocked (unlockedWave 4, standing 199 vs the wave-5 bar
200) yet zero wave-4 monsters were ever fought blow-by-blow
(w4faced false, w4 = 0). Unlock is not a deed: `recordDeedFight`
feeds only on a real fight. The wave-5 hold at run end is a readiness
deferral, not a standing cap (raw standing 307, capped 307; the
wave-5 readiness check reports short on weapons + veterans). The
lesser-seat table then arrives on the win-day floor (table set d90,
sat d92) and ends the run — so the window in which wave-4/5 deeds
could accrue closes with the lesser win itself. In short: the village
did not fail a fight, skip a door, or choose less. It never met a
wave-4 monster in 92 days, and the table came anyway on the lesser
bar.

### Sense-testing (SENSE-TESTING LAW) — ending read end-to-end

The feared/mercy ending itself reads coherently and movingly: the
footage plays unasked, the village's own people go still at the
cleanest kill, mercy from a predator baffles the table, and the final
line ("You won. Say it plainly: you won. The village endures. The
table signed.") earns its plainness. Villagers gossiping about the
table at d70 ("The table's set... What do you think they'll tell
it?") reads like people anticipating a summons, not a system flag.

But as a NATIONAL village settling for less, the ending does NOT
explain itself — and that is a real player-facing gap, not a numbers
gap. The audit announces "national standing" inside a LESSER-seat
line and never says a full seat exists, what it requires, or that
waves 4–5 are the shortfall. A player reading only this transcript
would conclude national standing should have meant a full seat, or
would never learn a full seat was possible. The pricing is honest
about what was done (14/9/6, 10 contests, 3 crises) and silent about
what is missing. Verdict on sense: the path story works; the seat
story does not explain why it is lesser.

### VERDICT: GATE-BLOCKED

Failing gates, named with value vs threshold: wave-4 deeds 0 vs ≥ 3
distinct fought; wave-5 deeds 0 vs ≥ 2 distinct fought. All other
full-seat gates pass on this run, including national scale. The lesser
seat was computed, not chosen; the full seat was never offered.

### What the next run should move (the filled blank)

The named gate is the wave-4/5 deed bars — specifically wave-4
encounter/fight opportunity, since wave 4 is already unlocked on this
seed yet produces zero deeds in 92 days. Lowering the bars without
producing wave-4 fights would not change this run; the lever must make
wave-4 monsters actually meetable/fightable before the lesser-seat
table closes the run (or make the audit name the shortfall, so the
lesser seat reads as priced rather than arbitrary).

### Metric review

No metric revision proposed. The pre-registered reproduction bar was
met exactly, so no re-scoring occurred. One note for future probes:
the 1825Z "maxWave 4" field is `unlockedWave`, not deeds faced — on
this run unlockedWave 4 coexists with w4 deeds 0, so future
pre-registrations should name the field as unlock, and judge deeds
separately, to avoid reading "wave 4 reached" as "wave 4 fought."

## Run bookkeeping

- Zero game-code change; zero policy change. Probe + evidence +
  analysis JSON only.
- No other loop's worktree, branch, claim, lock, or evidence touched.
- Full transcript kept in /tmp only; nothing multi-MB committed.
- Second gaps surfaced (for the coordinator's findings backlog, NOT
  edited into sim-findings.md from this worktree):
  - wave-4 unlocked but never faced in 92d on a winning seed — wave-4
    encounter opportunity, not unlock pacing, is the binding distance.
  - table audit never names the full seat or its shortfall — a
    national village's lesser seat reads unexplained to the player.

