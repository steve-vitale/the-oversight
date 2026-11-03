# Loop 0011Z coordinator evidence — scale-onramp round (run fleshout-20261103T0011Z)

## Pre-registration (this round)

- Axis: scale-onramp (topmost non-converged axis; sibling Loop B live on
  food-economy from 22:33Z, NOT touched — its trees, branches, claims,
  and evidence were never written by this run).
- Arms (claim written before any sims, run_id fleshout-20261103T0011Z;
  lock created at run start, no lock present at run start):
  - sim-heraldband-widen: widened herald screen, spare band 98201-98208.
  - sim-fullseat-97339: full-seat diagnostic on seed 97339, measurement
    only, zero game-code change.
- Standing directive: rotation file reads 3 but rotation stays suspended
  by the directive for this run (not advanced). Scale-onramp is NOT
  converged at closeout — the directive is not lifted by this run.
- Master at run start (workers' base): 1ce6d98fd. Master moved under
  this run by sibling Loop B (cband landing 6480e4c03 / 6f8cb19fa /
  f7bd5070f + coordinator evidence 2618b3b8c) — zero file overlap
  with either arm. Both worker branches were rebased onto the moving
  tip before merging (heraldband onto 2618b3b8c, then fullseat onto
  the heraldband tip); arm-file diffs vs old tips EMPTY both times.
- No game-code change in either arm. No push, no version bump, no live
  verification — merged locally, pending ship.

## Arm sim-heraldband-widen — SCREEN STILL THIN (merged 5ab4a70cb)

- Worker branch sim-heraldband-widen: prereg 34703c69f (rebased form of
  8a0421261, committed BEFORE any judged sim) + results 5ab4a70cb.
  Proof scripts/test-heraldband-widen-20261103.js 13/13 on the final
  rebased tip. Merged --ff-only to master, ancestor-verified in the
  same call; worktree released, removed, branch deleted.
- Band: fresh seeds 98201-98208, freshness re-verified before any sim
  (only hits are the spare-band range mentions themselves plus the
  pre-documented 98207 substring inside commit hash 071198207).
  Stack verbatim from the pilot: policy closecommit (titanroute +
  musterclose + mustergap over lead-fullseat) as composed by
  scripts/fightoutcome-driver-20261102.js; env FEASTSCALE_R13=1
  TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 HERALD=1;
  mode herald, 180d death-aware cap, one process per seed. Recorder /
  analyzer scripts/fightoutcome-{recorder,driver,analyzer}-20261102.js
  as landed. This run's 8 fo files moved into fresh dir
  evidence/2026-11-02/perseed-heraldband-widen before analyzing;
  perseed-heraldband-a (9 files) and perseed-fightoutcome-a untouched.
- Primary metric: analyzer problems = 0 (fought TB 139, field fights
  461, titan TB fights 1, legs 1a/1b/1c + leg 2 complete, floor true)
  BUT fight-positive yield = 1 (98205 only) < GO threshold 2.
  Verdict: SCREEN STILL THIN — screen usable, confirm round NOT
  justified on this band. NOT a verdict on the herald chain.
- Yield per called seed: 1/3 (called: 98202, 98205, 98206). Yield per
  herald-contacted seed: 1/4 (plus 98207's refused attempts).
  Combined with the pilot band (98101-98108, yield 1), context only:
  2/16 per band seed; combined called 5 seeds, yield 2/5. GO was
  judged on this band alone per the prereg.
- Per-seed: 98201 no-call, NATIONAL, won, maxWave 5, 90d over-other;
  98202 call d70, refused-only (26 refusals d71-72, muster 6/10),
  village-lost 90d; 98203 no-call, village-lost 66d; 98204 no-call,
  village-lost 46d; 98205 call d86, SLAIN fight d87, village-lost 88d;
  98206 call d103, still-pending-at-cap (herald present d130, ZERO
  titan attempts in 27 days, game won 130d); 98207 no recorded call
  line but 23 REFUSED attempts d77-81 on the muster gate (have 0,
  need 10), classified refused-only by attempts, village-lost 91d;
  98208 no-call, village-lost 68d. Departed-silent-or-pending: 0
  seeds (class still unexercised after two bands).
- Wall (descriptive, screened band only): national 3/8, table-latch
  6/8 (latch = tableWaiting OR tableDone — NOT table reach), won 2/8,
  wave-4 unlocks 7/8, wave-5 unlocks 1/8, median survival 89 days
  (46, 66, 68, 88, 90, 90, 91, 130; analyzer prints 90 via
  upper-median indexing — both figures recorded so neither is
  mistaken for the other). Movement vs pilot (national 0/8, wave-5
  0/8) is real on this band: 98201 reached national, unlocked wave 5,
  and won — without ever hearing the call. No wave-5 monster was
  fought in the wild; the full seat stays unproven.
- Instrument gap (flagged, not papered over): the landed recorder
  collapses tableWaiting OR tableDone into one `table` field, so
  tableDone CANNOT be reported as a distinct flag from this corpus.
  The next screen needing tableDone must split the recorder field
  first (a recorder change, not a game change).
- Sense-read (98205, day 87): PASS on row/transcript match and
  coalition meaning. Row opens "10 allies join you on the field";
  outcome slain, blades 10 — match. Call d86 answered same day by
  Emberhold (4), Thornfield (4), The Hungry Road (2), named marchers
  matching the roster exactly. Herald 700 to 0, "The Herald falls."
  Price: 2/10 allies die, survivors 4-100 HP, Herald blows 27-37
  plus "The Naming!" AoEs, muster hunger 1,100/10,000 kcal. Blemishes:
  (1) untouched bearer, second sighting — "You" never acts, never
  takes damage, ends 100/100; (2) "No path there." x34 in kept lines
  (pilot: x112); (3) grind feel — ally hits mostly 2-4 vs 700 HP.
  Counts alone did not pass this arm.

## Arm sim-fullseat-97339 — GATE-BLOCKED (merged 4ec8bf3c7)

- Worker branch sim-fullseat-97339: one commit 4ec8bf3c7 (rebased form
  of 33cc54957), measurement only, zero game-code change. Probe
  scripts/fullseat-97339-probe-20261103.js (`node --check` clean +
  the judged run itself, 34s, exit 0). Merged --ff-only to master,
  ancestor-verified in the same call; worktree released, removed,
  branch deleted.
- Reproduction: EXACT, all 10 fields — 92d / over-other / won /
  NATIONAL / maxWave 4 / lesser seat / feared / mercy ("Show mercy.")
  / self-taker Elif Demir. Road inactive, tablePhase done — a table
  ending, not a nomad-road ending. Gate diagnosis is therefore from
  the reproduced run, not a different one.
- Every full-seat gate (`deedGateReady`, progression.js:613), measured
  at d90 table-set, d92 audit, and run end, identical all three
  times: w1 distinct fought 14 (need >=5), w2 9 (>=5), w3 6 (>=4),
  w4 0 (>=3, SHORT 3), w5 0 (>=2, SHORT 2), contests survived 10
  (>=3), crises weathered 3 (>=3, exactly), integration stage 3
  (>=2), food deeds both true, scale national (enforced in `ok`,
  passes). Engine's own binding list: ["w4", "w5"] and nothing else.
  `deedGateReady().ok` false, `tableSeat()` lesser.
- Offered / declined / never offered: NEVER OFFERED. The full seat is
  not a menu option — `tableSeat()` computes a grade and the audit
  announces it. The d92 audit line in full: "A lesser seat — national
  standing, waves 1-3 faced (14/9/6), 10 contests survived, 3 crises
  weathered. The table does not rise. It prices." No line in 9,087
  offers, names, or prices a full seat; no refusal exists. The only
  full-seat door, the Indispensable, is unearned with the engine's
  reason: "The Indispensable needs a full seat — the galaxy must
  actually need you, not just notice you." The feared path was taken
  because winseek's `tableRoad` always answers the first offered
  option and feared sorts first — a policy drain artifact, not a
  village choice between seats; no door choice could have upgraded
  the seat.
- Why w4/w5 are empty — the unlock/deed split: wave 4 IS unlocked
  (unlockedWave 4, standing 199 vs the wave-5 bar 200) yet zero
  wave-4 monsters were ever fought blow-by-blow (w4faced false).
  Unlock is not a deed. The wave-5 hold is a readiness deferral
  (short weapons + veterans), not a standing cap (raw 307, capped
  307). The lesser-seat table then arrives on the win-day floor (set
  d90, sat d92) and ends the run — the window for wave-4/5 deeds
  closes with the lesser win itself. The village never met a wave-4
  monster in 92 days; it did not fail a fight, skip a door, or
  choose less.
- Sense-testing: the feared/mercy story itself works (footage plays
  unasked, mercy from a predator baffles the table, "You won. Say it
  plainly: you won" earns its plainness; d70 villager gossip about
  the table reads like people anticipating a summons). But as a
  NATIONAL village settling for less, the ending does not explain
  itself: the audit announces "national standing" inside a
  lesser-seat line and never says a full seat exists or that waves
  4-5 are the shortfall. A player would conclude national should
  have meant a full seat, or never learn a full seat was possible.
- Filled blank for the next run: move the wave-4/5 deed bars —
  specifically wave-4 encounter/fight opportunity, since wave 4 is
  already unlocked on this seed yet produces zero deeds in 92 days.
  Lowering the bars without producing wave-4 fights would not change
  this run. (Secondarily: make the audit name the shortfall so the
  lesser seat reads as priced, not arbitrary.)

## Telemetry deviation check

Prescribed invocation on the landed widened-band corpus
(per-seed glob fo-*.json only): REFUSED, exit class recorder-corpus
refusal — "all 8 --current rows carry top-level anchorCommit, so they
are sweep recorder rows, not runs." No LOUD lines. Baseline NOT
rolled; no --update-baseline, no --allow-recorder-corpus. Same
expected refusal class as 2215Z.

## Metric review

- Yield >= 2 held: yield 1 correctly blocks confirm on this band too.
  After two blind bands (2/16 combined, 2/5 per called seed), the
  constraint is run-length and muster-gate contact, not band width:
  most villages die or win before calling (6/8 no-call or
  refused-only here), and contacts that do happen stall on the
  muster gate (6/10, 0/10). Proposal for the NEXT run only: do not
  widen blindly a third time — build the next herald work from
  fight-positive / called seeds, or attack the muster-gate stall
  (why 98206 calls and then attempts nothing for 27 days, why
  98207 refuses without a call line).
- The table-latch flag must not be read as table reach (see Wall
  above) — and now, additionally, tableDone is not separately
  reportable from the landed recorder at all. Future arms needing
  tableDone must split the recorder field first.
- Median survival: widened band median 89d by standard median vs 90d
  by the analyzer's upper-median indexing on an even band — both
  figures are recorded in the arm evidence; future arms should state
  which median they use.

## Infrastructure

- EPERM flap: registry/worktree admin writes were slow (register
  calls took ~80-150s) but completed; no ref surgery forced, no
  failed write routed around with an unverified equivalent.
- Safe-commit index clobber (staged-deletion variant) hit both
  worker commits (and both workers repaired it with the HEAD-blob
  cacheinfo recipe and re-verified clean before reporting).
- First fullseat merge attempt failed ff-only because the
  heraldband tip was not in the fullseat branch — no merge was
  performed, no force; fullseat was rebased onto the heraldband tip
  (arm-file diff EMPTY) and then merged.
- check.js --quick NOT re-run: zero src/js in either arm, standing
  280/7 profile recorded by sibling runs this cycle.
- Sibling lanes active throughout (Loop B cband landing, journey
  trees, a new sim-atimescale-b tree appearing at closeout) —
  nothing of theirs touched; master moved once under this run, all
  handled by rebase-onto-current-tip discipline.
- Origin/master verified as behind local master at closeout (local
  merges not yet pushed — ship loop owns pushes, as always).

## Village assessment (plain words)

Two villages' stories, told straight. On the widened herald screen,
eight fresh villages mostly never got to call their titan at all —
they died young or won their own lesser victories first, living about
89 days. One village did slay its Herald in a real coalition fight
(ten allies, two dead, the monster ground down) and then died the
next day anyway. Another village reached national standing, unlocked
the fifth wave, and won — without ever hearing the call. The screen
is still too thin to judge the herald chain, but it is not empty:
the wall is moving at the edges (national 3 in 8, a wave-5 unlock),
just not where the chain needs it.

The sharper story is the national village that settled. Seed 97339
reached national standing, survived ten contests and three crises,
faced waves 1-3 in force — and still sat in a lesser seat, because
the full seat asks for something it never got a chance to earn:
fights against wave-4 and wave-5 monsters. Its fourth wave was
already unlocked, but in 92 days it never once met a wave-4 monster
to fight. Unlocking a wave is not the same as meeting it. And the
game never told the player any of this — the ending announced a
lesser seat for a national village without ever mentioning that a
full seat exists or what was missing. That is the blank this run
filled: the scale wall is no longer "villages never reach national."
It is "national villages never meet wave 4." The next lever has to
put wave-4 monsters in front of villages, not lower a number on a
gate no fight ever reaches.

scale-onramp stays converging (NOT converged): national + lesser
table are demonstrated, but the full seat is still unwon, wave 5 is
still unfought in normal play, and now the binding distance is named
(wave-4 encounter opportunity, not unlock pacing). Next blanks, in
order: (1) wave-4 encounter/fight opportunity — why an unlocked wave
4 produces zero deeds in 92 days, and what puts wave-4 monsters in
front of villages; (2) win-funnel variety: feared/mercy is the only
proven path/final — other paths, finals, and non-self takers
unproven; (3) herald screen: build from fight-positive/called seeds
or attack the muster-gate stall (98206 zero attempts in 27 days,
98207 refused without a call line) instead of a third blind widening;
(4) tableDone recorder split (instrument gap) + audit names the
shortfall (lesser seat reads as priced, not arbitrary); (5)
heralddepart departure-telegraph design question (Steve-call if
feel); (6) npcdeadfilter follow-ups: live-sim transcript of the
accepted-before-death refusal line, debate-notices-death design
question; (7) STEVE-CALL: committed blade as bearer (options a-d,
unchanged); (8) stores-draw upkeep proposal (Steve-call, unchanged).
food-economy untouched (sibling Loop B lane).

Claim retired to .DEAD; lock deleted.
Merged locally, pending ship (heraldband-widen 5ab4a70cb +
fullseat-97339 4ec8bf3c7 + this coordinator evidence).
