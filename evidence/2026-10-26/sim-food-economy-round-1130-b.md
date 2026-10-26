# sim-food-economy-round-1130-b — coordinator evidence (loop B, axis food-economy)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261026T1130Z.
Axis: food-economy (second non-converged axis; scale-onramp untouched).
Loop A live at run start on scale-onramp (fleshout-20261026T1040Z,
hunttable + raidpool, already merged as 896fdff79 when this run started,
claim still live) -> B worked food-economy per role. Loop A's claim was
deleted by its own closeout during this run; nothing of A's was touched.
Master at run start 896fdff79. Sibling landings during this run, all
zero-overlap with B's arms: journey-scale r39 (2ae24d410), ship-loop
version bump (2a0d3d686), journey-landing r56 (6a2628489), loop A
round 1146 (101259cae, choiceprice + wave3bar). Both B arms were
rebased clean in their own worktrees where needed; proofs green after
every rebase and on merged master.

Arms (2, pre-registered up front against the 1035Z run's named next
blanks, in order):
- sim-reminder-b — GO (pilot + confirm), LANDED as default, commit
  9465c8d4e (rebased from 8daf898f7).
- sim-noelig-lean-b — DIAG-GO, LANDED, commit 338e28abe (rebased from
  6064320d2).

## Arm 1 — sim-reminder-b (GO, landed, game-code)

Question (1035Z blank 1): a frozen-stretch reminder voice, an untested
NEW design, not a D variant. Rule D itself was NOT re-judged or revived.

Design (fixed in the arm header before sweeping, N=7): on top of gate
B's one-voice-per-day slot, a racks-full complaint speaks when its
rounded kcal figure differs from THAT cook's last spoken figure
(per-cook memory, avoiding the killed variant-C failure mode); on
frozen days it counts silent racks-bound days and speaks a reminder
on the 7th silent day (one in-game week). Silenced complaints become
the plain frame. `RACKSVOICE_REMINDER=0` restores gate B;
`RACKSVOICE_GATE=0` still restores the old per-cook rule above both.
Game change: src/js/game.js +40 lines only. Commit message carries
[needs-eyes] (voice feel, Steve's phone check if he wants it).

Pre-registered PILOT GO (binding, 8 seeds 9750-9757, leadfeast, pd0,
dg1, 100d death-aware): (primary) reminder coverage 100% — every
frozen stretch of >=7 silent racks-bound days contains at least one
reminder voice; (guardrails) total racks-full voice <= B baseline,
numerics identical every cell, say totals unchanged, no seed loses
all racks-full voice. Confirm on 12-16 fresh seeds iff pilot GO.

Results (identical seeds, coordinator-verified on merged master):
- Pilot B -> R: 19->13, 0->0, 37->13, 49->34, 25->20, 10->9, 22->19,
  68->41. Band B 230 -> R 149 (ratio 0.648), reminders 1. Max
  voiceless racks-bound-day run <= 6 on every seed.
- Confirm, fresh seeds 9760-9775, B -> R: 32->20, 0->0, 55->47,
  47->27, 35->25, 16->7, 37->31, 61->30, 8->3, 21->17, 14->11,
  28->24, 34->15, 19->15, 0->0, 23->18. Band B 430 -> R 290
  (ratio 0.674), reminders 2. Max voiceless run <= 6 every seed.
- Neutrality leg ran first both times (flagged-vs-unflagged
  numerics identical). Proof: pilot 99/0, confirm 179/0, both green
  post-rebase and on merged master (confirm re-run by coordinator
  on final HEAD 101259cae: 179/0).
- Post-flip spot check by the worker: default mode == R corpus
  exactly and `RACKSVOICE_REMINDER=0` == B corpus exactly (ignoring
  only the ms timing field), including full detail arrays.

Sense (from the arm evidence, read not just counted): pilot
reminder 9752 day 44 (Theo, 17,033 kcal) returns the same true
number after silent days 38-43 — D's 25-voiceless-day failure on
9752 cannot recur. Confirm reminders 9767 days 48 and 55: a
20-day frozen run at 47,678 kcal reads day 36, day 41 (first-time
speaker), day 48 reminder, day 55 reminder, day 56 change voice —
four voices instead of twenty, alternating cooks. Caveats reported
by the worker, not hidden: reminder volume is thin (1 pilot,
2 confirm) — most reduction comes from change filtering; 9757
stays all-Miguel under both arms, so R does not fix first-cook
dominance; N=7 is now landed, any other N is a new arm.

Wall (reminder corpora, SEATDRIVE=0 so table/wins are construction
zeros): pilot national-or-better 7/8 (9756 global), table/wins
0/8, wave-4 3/8, wave-5 0/8, median 100d capped, deaths 49.
Confirm national-or-better 14/16, table/wins 0/16, wave-4 6/16,
wave-5 0/16, median 100d, deaths 119.

## Arm 2 — sim-noelig-lean-b (DIAG-GO, landed, zero src/js)

Question (1035Z blank 4): P-RACKS-NOELIG was genuinely empty on
leadfeast (0/900) — is it populated on a leaner policy?

Method (fixed in the arm header before sweeping): ONE leaner policy,
competent with `COMPETENT_FEAST=0`, FEASTSCALE_R13 off, SEATDRIVE=0
— the whole feast engine removed (eveningFeast, channelDevotion,
feastFightRoad all gate on feastOn()), plus no leadcourt
tribute/tend outflows; base foraging/cooking/preserving only.
Plainvoice at-source splitter reused unchanged. Pilot band seeds
9750-9757, pd0, dg1, 100d death-aware. DIAG-GO iff splitter
classifies >=95% of plain lines AND the P-RACKS-NOELIG count is
reported per seed — a measured 0 is a complete DIAG result, not a
failure; extend to 16 seeds only if UNCLASSIFIED >5%.

Results (coordinator-verified on merged master, proof 200/0):
- P-RACKS-NOELIG per seed: 0 on all 8 seeds. Band 0 of 925 plain
  lines (leadfeast 0/900 — now a two-band zero).
- Full band split: P-SILENCED 612 (66.2%), P-RES2PLUS 146,
  P-FIRST-NOSMOKE 167, P-RACKS-NOELIG 0, UNCLASSIFIED 0 (100%
  coverage, no extension). Spoken complaints 320 vs 612 silenced.
- The 'dinner already covered by the reserve' story holds,
  stronger than on leadfeast: eligible surplus present on 165/167
  P-FIRST-NOSMOKE and 146/146 P-RES2PLUS lines; only 2 plain lines
  in the band lack eligible surplus, both early-game first
  resolutions before preserving started.
- Interpretation (arm's, recorded here): whenever preserved stock
  reaches the rack cap, about-to-rot surplus is present at the same
  resolutions — the racks fill from the same surplus stream that
  supplies the complaint. The class's absence is not a policy-band
  artifact; a future hunt should pre-register a substrate-state
  hypothesis (e.g. foraging stopped while racks stay full), not
  another policy swap.

Wall (leaner band, SEATDRIVE=0 construction zeros): national-or-
better 0/8, table/wins 0/8, wave-4 0/8, wave-5 0/8, median 100d.
The band genuinely is leaner in progress (leadfeast same seeds:
national 7/8, wave-4 3/8), with two villages lost outright (9751
day 48, 9754 day 97 with starvation deaths) — yet racks-full
complaint volume did not fall (320 spoken + 612 silenced vs
leadfeast's 230 + 483). The racks problem is a preserving-loop
property, not a feast-policy property.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-10-26/sim-reminder-b-corpus/*.json' --metrics
national,table,wins,exiled`: 3 LOUD lines (national 12 -> 42 over
48 double-counted B+R files, table 16 -> 0, wins 16 -> 0). All the
known regime/ingestion artifact class: SEATDRIVE=0 construction
zeros for table/wins, recorder rows without the checker's top-level
keys, and B+R columns double-counted in one glob. Baseline NOT
rolled. No investigation item. (The noelig corpus was not
separately telemetry-checked; its wall numbers above are the
record, and the same artifact class would apply.)

## Balanced panel (§15)

Attempted honestly by both arms: scripts/balance-panel.js requires
--out and spawns its own sims; it cannot ingest recorder corpora,
so no panel input was fabricated. Paired identical-seed tables are
the comparison of record, as in the 1035Z round.

## Infrastructure

- No EPERM flap blocked this run. Worktree registration flock waits
  ran minutes on sibling contention only (both trees registered
  clean at base 896fdff79).
- Safe-commit index clobber hit both worker commits and was
  repaired via HEAD-blob cacheinfo each time; commits verified
  correct (file lists + hashes) before merge. Noelig rebased once
  (journey-scale r39), reminder rebased once (ship bump +
  journey-landing r56); both rebases clean, zero file overlap.
- check.js --quick was started on merged master but ABORTED by the
  coordinator, not claimed: loop A's round-1146 landing changed
  the main tree mid-run, so a partial quick result could not be
  attributed to this arm. The clean green evidence is the arm
  proof suites re-run on final HEAD 101259cae: reminder confirm
  179/0, noelig 200/0. The standing 279/8 pre-existing profile was
  not re-attributed by this run.
- Both branches deleted after merge (noelig 338e28abe, reminder
  9465c8d4e); worktrees released/removed; main tree clean at
  closeout. Merged locally, pending ship — no push, no version
  bump, no live check (the ship loop's bump 2a0d3d686 landed
  mid-run and is a separate commit).

## Village assessment, in plain words

The kitchens are quieter now, but not silent in a way that lies.
When the smoke racks stay full at the same amount for days, the
cooks now speak when the amount changes and remind the village
once a week if nothing changes — so a player never again reads a
month of quiet as "the racks problem went away." On poorer
villages with no feasts at all, the same racks still overflow and
the same one-complaint-a-day rule still hides most of it, and the
one case this run went hunting — a full rack with nothing fresh
about to rot — never showed up on either way of playing. The
racks fill from the same surplus that feeds the complaint, so
that case may need a village that stops foraging, not a
different feast policy.

## Blanks filled or documented

Filled: frozen-stretch reminder voice design (1035Z blank 1) —
implemented as default rule R, pilot + confirm GO. P-RACKS-NOELIG
on leaner policies (1035Z blank 4) — measured, 0/925, two-band
zero; the measurement blank is closed, the class stays empty.
Documented (next blanks, in order): (1) first-cook dominance under
R (9757 all-Miguel) — a diversity arm, not a reminder retune;
(2) plain-silenced indistinguishability (1035Z blank 3) — a player
still cannot tell a swallowed complaint from quiet cooking;
(3) a substrate-state hunt for P-RACKS-NOELIG (foraging stopped
while racks stay full) instead of another policy swap; (4) any
other reminder interval N is a new arm, not a retune of landed R.

## Convergence state

food-economy stays converging (NOT converged): a real game-code
fix landed from this run (rule R, default) and a two-band
measurement closed, but the scale wall is untouched by this axis
(table/wins construction zeros here, wave-5 0, full seat
unreached) and the plain-silenced indistinguishability blank
remains. scale-onramp stays converging (untouched; sibling loop
A). Claim deleted; lock deleted.
