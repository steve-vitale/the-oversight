# sim-fullseat-recheck-a — full-seat path recheck on current master (DIAG ONLY)

Run: Loop A worker, arm sim-fullseat-recheck-a, axis scale-onramp, run
fleshout-loop-a-20261101T0615Z. Sibling loop work NOT touched.
Worktree branch: sim-fullseat-recheck-a.
Base: worktree HEAD at prereg time 1c21a87fd7ccb44e12516271bd629bdab44d55b1
(2026-11-01 06:19Z); contact-finish rule is an ancestor of HEAD
(verified via git merge-base --is-ancestor 759dd7263 HEAD).
Pre-registration: evidence/2026-11-01/sim-fullseat-recheck-a-prereg.md
(written BEFORE any judged sims; one amendment before any sims —
the 76201–76208 band failed the freshness grep, replaced wholesale
by 78201–78208 — plus a freshness-verified note, both pre-sweep).
Instrument: scripts/fullseat-recheck-a-sweep.js (2115Z pattern, new
name) + scripts/fullseat-recheck-a-analyze.js +
scripts/test-fullseat-recheck-a.js. Recorders reused UNMODIFIED:
scripts/policies/fullseat-diag.js, scripts/policies/vet2-diag.js,
substrate scripts/policies/tableseat-nowait.js (LEANLINKRESCUE=1,
TABLESEATNOWAIT=1). Composition:
withVet2Diag(withFullseatDiag(tableseatNowait)).
Corpus: evidence/2026-11-01/perseed-fullseat-recheck-a/s<seed>-<policy>.json
(16 rows: 8 baseline + 8 armed) + summary.json + raw sweep log/err.
Sense replays (scratch, non-measured): sim-fullseat-recheck-a-sense-78201.txt,
sim-fullseat-recheck-a-sense-78206.txt.
No game code changed. No policy file edited. No gate threshold
moved. No [needs-eyes] (measurement only, nothing player-facing).
Panel (§15): NOT APPLICABLE — single-base DIAG census, no
before/after lever comparison exists in this arm; none fabricated.
The baseline-vs-armed pair is a recorder-neutrality proof, not a
panel comparison, and its numbers never enter the census tables.

## Verdict: DIAG-GO

Judged exactly against the prereg's bar:
- Usable judged seeds 8/8 armed (+ 8/8 baseline pairs), fixed band,
  no substitutions, no band-shopping.
- 8/8 armed rows carry an end snapshot with per-component
  distances for all 9 components; the 1 won armed row carries a win
  snapshot.
- Ranked binding-blocker list computable; zero UNCLASSIFIED.
- Veteran counts (end + max, vet4 and vet5) present on 8/8;
  wave-5 fight counts (distinct end/max + kills) present on 8/8.
- G1 det-gate PASSED: recorder-wrapped tableseat-nowait with
  FULLSEAT/VET2 unset matches baseline on days/gameDays/ts
  counters (180/181, tsNationalDay 87) with no recorder surface.
- G2 recorder neutrality PASSED: baseline vs armed identical on
  8/8 seeds (days, gameDays, ts counters, starvation).
- G3 corpus integrity PASSED: 16/16 rows, no zero-day rows,
  endSnap with dist everywhere, diag + vet blocks on all armed
  rows, fullseat errs 0, vet2 errs 0.
- Determinism leg PASSED: judged 78201-armed JSON is byte-identical
  to its worktree-scratch re-run (3,582 bytes, `cmp` clean;
  scratch dir deleted before commit).
- Proof: scripts/test-fullseat-recheck-a.js — 55/55 checks green
  (analyzer unit checks + corpus legs re-deriving every headline
  number from the judged rows, independent of the sweep's verdict).
- Verdict sections (a)–(d) all stated below.

## Answer in one paragraph

(a) The full seat is NOT reached on any seed: 0/8 hold a full seat
on any day (firstFullSeatDay null everywhere), while 3/8 reach the
table and 1/8 sits — in the LESSER seat — and wins through it.
(b) The binding bar is still w5: 8/8 blocked at distance 2 (zero
distinct wave-5 monsters fought on every seed), because wave 5
never unlocks (0/8). (c) The veteran story is UNCHANGED from
2115Z/#1649: no village ever holds 2 living wave-4+ killers —
max is 1 (seeds 78201, 78208), 0 on the other six, 0 at end on all
eight; wave-5 kills 0. The contact-finish rule did NOT move the
full-seat path: the non-w5 bars tightened (w4 4/8 at median
distance 1 vs 2115Z's 6/8 at 3; w3 5/8 at 1 vs 6/8 at 2; foodDeeds
4/8 at 1 vs 6/8 at 1), but the w5/veteran wall is exactly where it
was. (d) Wall numbers: national ever 5/8, national final 1/8,
table 3/8, entered 1/8 (lesser), wins 1/8, wave 4 reached 7/8,
wave 5 reached 0/8, full seat 0/8, median run length 164d, max
180d (cap-bound on 2 seeds).

## Plain-words verdict (for the executive update)

A village can now get closer to the full seat on every bar except
the one that matters. The closest village in this band meets every
single full-seat requirement — every wave 1–4 fight, every contest,
every crisis, stage, food deeds, national standing — and is still
locked out by exactly one thing: it has never fought a wave-5
monster, because wave 5 never opens, because the village never
holds two living heroes who have killed a wave-4 monster. The
best it ever holds is one, and by the end even that one is dead.
Meanwhile a different village wins the whole game through the
lesser seat without ever facing wave 4 at all. The lesser seat is
a complete, satisfying win; the full seat is a door whose key —
two living wave-4 killers at once — no village on this band ever
forges. Landing the contact-finish rule changed none of that.

## Wall numbers (armed, 8 seeds)

- Won 1/8 (78206, lesser seat, feared path, day 90).
- National ever 5/8, national final 1/8.
- Table reached 3/8 (78201, 78206, 78208); entered 1/8 (78206);
  enteredFull 0/8.
- Wave 4 reached 7/8; wave 5 reached 0/8; full seat 0/8.
- Median run length 164d, max 180d (78201, 78204 survived to cap).
- Death causes (armed total): villager combat 93, villager-vs-
  villager combat 82, player "the wild" 49, villager monster 11,
  villager expedition 7, villager wound-that-wouldn't-close 6,
  villager ambush 5, player arena 3, villager starvation 3,
  player stranger 2, player contest 2, villager sickness 2,
  villager contest 1, player night 1, player sickness 1, player
  dehydration 1, named-monster singles (Choir Toad, Big Loud,
  Sunbasker) 1 each.

## Per-seed census (armed rows; endDist == maxDist on all 8 seeds)

End distance = distance-to-full at run end; max distance = distance
at the run's closest approach (per-component max). They are
IDENTICAL on every seed this band: no village was ever closer
mid-run than at its end on any deed component. (Veteran counts DO
decay — deed bars are cumulative, veterans are living-only.)

| seed | days/end | won | rank final/max | end seat | end binding (dist) | maxDist total | vet end vet4/vet5 | vet max vet4/vet5 (day) | w5 fought end/max | w5 kills | holdKind / rd5short at end |
|------|----------|-----|----------------|----------|--------------------|---------------|-------------------|-------------------------|-------------------|----------|----------------------------|
| 78201 | 180/survived | 0 | regional/national | lesser | w5 (2) | 2 | 0/0 | 1/1 (109/136) | 0/0 | 0 | defer5 / [weapons, veterans] |
| 78202 | 131/village-lost | 0 | regional/regional | none | w5 (2), foodDeeds (1) | 3 | 0/0 | 2/0 (106/—) | 0/0 | 0 | below-bar / [armor, weapons, veterans] |
| 78203 | 168/village-lost | 0 | regional/global | none | w3 (2), w5 (2) | 4 | 0/0 | 1/0 (135/—) | 0/0 | 0 | cap / [veterans] |
| 78204 | 180/survived | 0 | regional/global | none | w3 (2), w4 (1), w5 (2), foodDeeds (1) | 6 | 1/0 | 1/0 (128/—) | 0/0 | 0 | below-bar / [veterans] |
| 78205 | 99/village-lost | 0 | regional/national | none | w3 (1), w4 (1), w5 (2), foodDeeds (1) | 5 | 0/0 | 1/0 (56/—) | 0/0 | 0 | below-bar / [armor, weapons, veterans] |
| 78206 | 90/over-other | 1 | national/national | lesser | w4 (3), w5 (2) | 5 | 2/0 | 2/0 (87/—) | 0/0 | 0 | below-bar / [veterans] |
| 78207 | 26/village-lost | 0 | village/village | none | w2 (5), w3 (4), w4 (3), w5 (2), contests (2), foodDeeds (1) | 17 | 0/0 | 0/0 (—/—) | 0/0 | 0 | below-bar / [armor, veterans] |
| 78208 | 164/village-lost | 0 | regional/regional | lesser | w3 (1), w5 (2) | 3 | 0/0 | 1/1 (70/110) | 0/0 | 0 | cap / [armor, weapons, veterans] |

Food-deeds split: sentimentTaught true on 8/8; the missing half on
all 4 foodDeeds-blocked seeds (78202, 78204, 78205, 78207) is
feastSurgeUsed — never sentiment. First lesser-seat days: 78201
day 165 (16 lesser days, never sat), 78206 day 78 (sat day 90),
78208 day 128 (never sat). Standing at end: 199 on 78201, 78203,
78208 (pinned at t5-1 on 78201 by defer5; capped on 78203/78208
by the plenty cap); 192 on 78206; 125 on 78202; 100 on 78204/78205.

## Ranked binding blockers (armed, end snapshot)

1. w5 — 8/8 blocked, median end distance 2, median max distance 2.
2. w3 — 5/8, median 1 / 1.
3. w4 — 4/8, median 1 / 1.
4. foodDeeds — 4/8, median 1 / 1 (always the feastSurgeUsed half).
5. w2 — 1/8 (78207 only, distance 5), median 0 / 0.
6. contests — 1/8 (78207 only, distance 2), median 0 / 0.
7. w1, crises, stage — 0/8, median 0 / 0.

## Comparison vs 2115Z and #1649 (plain words)

- 2115Z ranked: w5 8/8 median distance 2; w4 6/8 distance 3;
  w3 6/8 distance 2; foodDeeds 6/8 distance 1; full seat 0/16
  paired rows; wave 5 0/32 paired rows.
- This band: w5 8/8 median distance 2 (IDENTICAL); w4 4/8
  median 1 (closer — fewer seeds blocked, smaller gap); w3 5/8
  median 1 (closer); foodDeeds 4/8 median 1 (fewer seeds
  blocked, same gap); full seat 0/8; wave 5 0/8 unlocks, 0
  fights, 0 kills.
- #1649 (2026-10-31 fullseat-a: closest seeds hold 1 living
  wave-4+ killer vs demand 2; only 4 wave-4+ kills in 19 runs;
  wave 5 never unlocks because the deferral's only short bar is
  veterans): REPRODUCED on the veteran count — max living wave-4+
  killers is 1 (78201, 78208), never 2, and 0 at end on all eight
  — but with one refinement: on the closest seed (78201) the
  end-state deferral short list names TWO bars, weapons (4 of 6
  armed) as well as veterans (0 of 2), spoken aloud by the hold
  beat on day 179 ("put weapons in hands (4 of 6 armed); blood
  your fighters (0 of 2 veterans)"). The 2115Z "only veterans"
  reading does not survive end-state inspection on this band;
  whether weapons-short is persistent at closest approach or
  end-state decay is NOT measured here (the recorder stores no
  daily rd5short series) and is left for the next band.
- The manufacture gap (#1649's mechanism) still binds: villages
  manufacture wave-3 killers (max vet4 = 2 on 78202 and 78206,
  the winner holds 2 living wave-3 killers at its win) but do
  not convert them into living wave-4 killers — 78206, the
  winner, never faced wave 4 at all (w4faced false, w4 = 0).
  Killing a wave-4 monster requires wave 4 to be fought, and
  wave-4 fights are rare enough that the second veteran never
  arrives before the win or the death.

## Sense reads (SENSE-TESTING LAW — meaning, not counts)

(a) Closest-to-full seed 78201, endgame (sense replay, 240 ring
lines, survived to cap, table waiting, never sat): the endgame
voice is honest about the wall. Day 179 hold beat: "The fifth
draft stays in the wings — put weapons in hands (4 of 6 armed);
blood your fighters (0 of 2 veterans)." Day 180 overtime ×2:
"wave 4–5 monsters return as RERUNS (+50% HP, +24% damage, +1
to every pack). Raids come sooner. The table docks your standing
−8. Take your seat from Haven to stop the clock." The village
sits on a priced lesser seat for 16 days (first lesser day 165)
and never takes it while the overtime clock ticks — the waiting
cost is real and legible, but the seat-taking leg does not fire
(see observation below). The transcript reads as a village that
has done everything asked of it and is told, plainly, what it
still lacks. That honesty is the design working; the missing
second veteran is the design not yet reachable.

(b) Blocker seed 78206, the win (sense replay, 240 ring lines,
table done, won day 90): the win is coherent and complete. The
audit reads the run back truthfully: "A lesser seat — national
standing, waves 1–3 faced (17/7/4), 9 contests survived, 3 crises
weathered. The table does not rise. It prices." The war path
even names the unmet bar inside the victory: "Even now the
wave-5 bar reads: blood your fighters (0 of 2 veterans)." The
feared path plays to mercy ("Show mercy"), the audience weeps,
the village endures. Nothing in the transcript pretends wave 4
or 5 happened. The lesser seat is not a consolation prize in the
text — it is a full ending. The full seat is simply a different,
further door, and this village never knocked on it.

## Observations for the coordinator (out of scope for this DIAG arm)

- 78201 held a priced lesser seat for 16 days (first lesser day
  165) and survived to the 180d cap without ever sitting
  (entered 0; same in the sense replay: tableWaiting true,
  tableDone false), while overtime ticked to ×2. Why the
  tableseat-nowait seat leg does not fire on a surviving
  lesser-seat village is not answered by this arm's instrument
  (final rank decayed to regional; the seat leg gates on
  national+ rank — that is the leading hypothesis, not a
  finding). Proposed backlog line for the coordinator to append:
  "- [open] 2026-11-01 — tableseat seat-taking — 78201 held a
  priced lesser seat 16 days and survived to cap without sitting
  while overtime ticked to x2 (sim-fullseat-recheck-a)."
- The defer5 short list on the closest seed names weapons as
  well as veterans at end state. Whether weapons-short persists
  at closest approach (vs end-state decay) needs a daily
  rd5short series on the next band. Proposed backlog line:
  "- [open] 2026-11-01 — wave-5 readiness — closest seed 78201
  ends short on weapons (4/6) as well as veterans (0/2), not
  veterans alone as 2115Z read it (sim-fullseat-recheck-a)."

## Metric review (for the NEXT run)

- The max-vector definition changed NO seed's verdict this band:
  endDist == maxDist on all 8 seeds, so closest approach = end
  state throughout. The definition still earns its keep as a
  guard (it would have caught a closer-mid-run story had one
  existed), but it added no information here.
- The vet4 (wave-3+) vs exact-wave-3-only distinction did NOT
  change any seed's veteran story: exact-wave-3-only end killers
  (78206: Tao, Nathan, both living) are a subset of vet4 and the
  wave-5 bar reads vet5 (wave-4+), which is 0 at end everywhere
  regardless of definition. The distinction matters only for
  narrating HOW a village got its wave-3 killers, not for the
  wave-5 verdict.
- Gap for the next band: no daily rd5short series exists, so the
  weapons-vs-veterans split at closest approach (not just end)
  cannot be resolved from this corpus. A future diag that stores
  the daily unlock block would close it.
