# sim-scale-onramp-round-1535-a — coordinator evidence (Loop A run fleshout-20261031T1535Z)

Axis: scale-onramp (converging, NOT converged). Sibling Loop B live on
food-economy for the whole run (1430Z claim) — NOT touched. No
fleshout-loop.lock existed at takeover; claim written before any sims.
Rotation file untouched: convergence-directed axis work supersedes the
lever rotation this run.

## Pre-registration (coordinator-level)

Four DIAG arms, all measurement-only (zero src/js, zero policy-default
flips, zero gate/demand numbers moved), each with its own prereg written
before its judged sims (see each arm's evidence). §15 balanced panel:
NOT APPLICABLE to any arm — all four are single-base diag censuses with
no before/after lever comparison; none fabricated. Wall numbers below are
per-band, never pooled: the wavegate 19-seed band was re-measured on two
different bases, and the patrolsilent 16-seed band is a different stack.

Bases: sim-wave3enc-a + sim-vet2-a on 9f22a0838; sim-regtable-a +
sim-killscred-a on 18da20b58. All four rebased clean onto master at
landing and their proof tests re-run green after rebase (see Landing).

## Arm 1 — sim-wave3enc-a: DIAG-GO (merged 0672b457a, proof 156/156)

Question (sim-findings: WAVE-3+ KILLS NEVER HAPPEN ON STALL SEEDS): are
wave-3 fights avoided, fled, or lost? Answer: FLED, not avoided or lost.
293 wave-3 meetings on 19 seeds: fled by villagers 140 (47.8%), fled by
beast 90 (30.7%), fought-lost 36 (12.3%), avoided 10 (3.4%), ledger-point
kills 17 (5.8%), fought-won-no-ledger 0. Field fights NEVER kill a
wave-3 monster (0 kills in 233 field meetings, 2 field deaths); every
wave-3 kill is the scholar's turn-based fight (17 in 60 TB meetings).
Named-5 stall seeds on this base: 74 meetings — fled 57, avoided 9,
lost 4, killed 4 (all TB).
Band (this base): national 14/19, table 16/19, wins 15/19, wave 4 12/19,
wave 5 0/19, median survival 90d, max 197d.
Caveat carried, not hidden: 2 unclassified kill events (routed-party
pyrrhic kills, 87121/87138) are explained in the evidence; the verdict
rests on the prereg's "unexplained" clause. Next arm should join kills
to 'won' OR 'routed' rows and instrument pyrrhic kills.
Evidence: evidence/2026-10-31/sim-wave3enc-a.md (+ prereg).

## Arm 2 — sim-vet2-a: DIAG-GO (merged 7efa25c5e, proof 29/29)

Question (sim-findings: WAVE-5 WALL, MEASURED): is veterans-2 reachable
at all? Answer: NO — on no day of no seed does any village hold 2 living
wave-4+ killers, so wave 5 is unreached by any route, not a post-win
curiosity. Only 4 wave-4+ kills in 19 runs (3 scholar, 1 companion,
kill-time-keyed); 5 of 12 wave-4 seeds never face a wave-4 monster;
veteran mortality removes 2 of the 4 vet5s. Win-day censoring does not
explain it (longest unwon runs and the 197-day winner also never reach
vet2).
Band (this base): national 14/19, table 16/19, wins 15/19 (8 on day 90),
wave 4 12/19, wave 5 0/19, median 90d, max 197d.
Instrument note: the first pilot caught a second waveKillLog writer
(`recordPyrrhicKill`, dying-tick path); that corpus was discarded, the
prereg amended, and the pilot re-run fresh.
Evidence: evidence/2026-10-31/sim-vet2-a.md (+ prereg).

## Arm 3 — sim-regtable-a: EXPLAINED, DIAG-GO (merged 48e88133b, proof 4/4)

Question (sim-findings: REGIONAL-TABLE EXCEPTION 87103): table reached
at regional rank without national — counterexample or design? Answer:
EXPLAINED on two branches. (1) 87103 does not reproduce on this base:
60 days, wave 2 only, regional day 47, no seat ever, village-lost day
60 — wavegate's wave-4-day-57/table-day-71 numbers are prior-base
(anchor 4c92bbb04); det-gate proves base drift, not instrument error.
(2) The regional table is designed: 10/19 seeds reach the table at
regional rank, ALL in a LESSER seat with the full gate false, exactly
as `tableSeat()` designs (lesser needs regional+; only the FULL seat
carries the national/global bar, `progression.js:613` `deedGateReady()`
scale enforced in `ok` per the 2026-10-27 ruling). No seed holds a full
seat at any rank; w5 is 0 on all 16 table days, w4 peaks at 2 (bars
w4≥3, w5≥2 unmet everywhere).
Band (this base): table 16/19 (10 regional + 6 national/global at table
day), all lesser; wins 15/19, all lesser (incl. two wins ending at
regional rank, 87128/87134); national 15/19; wave 4 13/19; wave 5 0/19;
median 90d, max 197d. No-table seeds: 87103, 87109 (one distinct wave-3
fight short of the lesser bar), 87135 (food deeds false alone).
Sense note: the endgame table's voice goes through `say()`, not
`sysSay()`; a scratch probe recovered it (lesser seat earned day 59,
18 silent days, then the table speaks). The 18-day unannounced-
invitation window is a voicing gap, not a verdict-changer.
Disclosure: the worker's `check.js --quick` showed 284 passed / 6 failed
in pre-existing-class suites (measurement-proof-update,
measurement-workflow, mobile-combat-cadence, occupation-panels,
phone-frame-proof, establishment-r20-fixes), not verified by the worker
against a pristine checkout. Coordinator note: zero src/js changes and
zero existing-test edits in this arm, so these are not a landing
blocker under prior-run precedent; not re-verified by the coordinator.
Evidence: evidence/2026-10-31/sim-regtable-a.md (+ prereg).

## Arm 4 — sim-killscred-a: DIAG-GO (merged 75cb7c8d9, proof 21/21)

Question (sim-findings: KILLS-EARNED CRED DANGER-BRANCH LEVER): where
does kills-earned cred die in routing? Answer: in `pickTask`
(`scripts/policies/delegate.js`, lines 102–130) — the fit-first block
returns before the danger branch is ever evaluated (line 108
cook via preserver ≥ 2 traps the 85114 farmer; line 111 mend traps the
85111 mechanic, no roll). The danger branch and `combatCred`'s kill
check are correct but unreachable for fit-routed holders. Ruled out by
measurement: danger roll, trust, presence (100% at-Haven), engine gates,
non-delegate paths (0 rows for every kills holder).
Band (16 seeds, S-PATROL stack, errs 0): 14 kills holders on 9 seeds —
4 fit-trapped, 7 danger-reaching, 3 held-starved/wounded. 85111: mechanic
3 kills, 271 mends, 0 patrols. 85114: farmer 2 kills, 257 cooks,
0 patrols. Wall (substrate flags): national 10/16, table 11/16,
wins 11/16, wave 4 14/16, wave 5 0/16, median 94d, max 201d.
Design sketch (NOT built): danger-before-fit when monsterKills > 0
only; first-order prediction 85111 ~69 patrol + ~49 hunt (from 0/0),
85114 ~38 patrol + ~27 hunt. Risks: specialist starvation (mechanic =
100% of village mending; farmer = 77% of cooking) — the next arm must
measure mend/cook before/after. Sole-coverage guard documented as a
NON-starter (would not fire on either motivating seed).
Evidence: evidence/2026-10-31/sim-killscred-a.md (+ prereg).

## Wall (per-band, never pooled)

Wavegate band on the 9f22a0838 base (wave3enc + vet2, same stack, same
19 seeds): national 14/19, table 16/19, wins 15/19, wave 4 12/19,
wave 5 0/19, median 90d. Wavegate band on the 18da20b58 base (regtable):
table 16/19, wins 15/19, wave 4 13/19, wave 5 0/19, median 90d.
Patrolsilent band (killscred): national 10/16, table 11/16, wins 11/16,
wave 4 14/16, wave 5 0/16, median 94d.
Overall wall UNCHANGED: full seat 0 everywhere, wave 5 reached 0
everywhere stands.

## BASE-DRIFT WARNING (loud, for the next run)

The wavegate stall set does NOT reproduce on the newer bases, and the
wavegate band wins far earlier on them (15/19 wins, 8 on day 90, vs
6/19 wins at days 121–164 on wavegate's base; median 90d vs 137d). The
det OFF legs prove base effects, not instrument artifacts (lootabilities
Arms 1–6 game-code changes re-roll seeded generation). Seed labels do
not transfer across bases. Levers must NOT be judged against
wavegate-era numbers without re-baselining; every future arm re-derives
its band status on its own base.

## Landing

All four arms rebased clean onto master at landing; proof tests re-run
green after rebase (killscred 21/21, regtable 4/4, wave3enc 156/156,
vet2 29/29). One ff-only merge initially failed because sibling Loop B
landed between rebase and merge (798df8849); the arm was rebased again
and merged in the same call — no force, no conflict. Worktrees released
as merged, branches deleted, main tree clean at closeout. Merged
locally, pending ship (ship loop owns pushes/version bumps/live
verification). No [needs-eyes] (measurement only).

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-10-31/perseed-wave3enc/leadfeast/*.json' --metrics
national,table,wins,exiled` — REFUSED by the tool itself ("recorder-
corpus input: all 19 rows carry top-level anchorCommit"), same
refusal class as the 1415Z run. No LOUD lines, baseline NOT rolled.
Recorder corpora are compared with sweep-compare tables, never against
a run baseline here.

## Metric review

- Wave3enc's prereg NO-GO clause ("unclassified > 0 unexplained") was
  applied as written: the 2 routed-party kills are explained, so
  DIAG-GO stands; a literal "unclassified == 0" reading would flip it
  with no census value changed. Next arm: join kills to 'won' OR
  'routed' rows.
- Regtable's planned contrast roles collapsed on the new base (both
  contrast seeds reached table and won); the band-wide scan
  classification carried the question instead. Future single-seed
  checks should pre-register a band-scan fallback.
- Vet2's succession-shaped capture exception (87135 day 135: exact
  capture says scholar, daily census says villager after mantle pass)
  is machine-checked and moves no vet5 number; exact capture wins per
  its prereg.

## Next blanks, in order (scale-onramp)

1. The engine-cap decision (steve-call, from 1415Z) — still the
   highest-value open call; untouched by this run.
2. A BUILD arm for danger-before-fit when kills > 0 (killscred next
   arm), judged against the killscred corpus via the §15 panel, with
   mend/cook before/after measured.
3. The wave-3 field-kill mechanism (wave3enc next question): villagers
   wound wave-3 monsters and re-engage but always leave before the
   kill — why field fights never kill, and whether that is the
   veteran-manufacturing bottleneck.
4. Full-seat bars w4≥3 + w5≥2 reachability on any stack/seed (0/19
   here must not be quoted as "unreachable").
5. The 87109 / 87135 single-bar no-seat stories; the 18-day
   unannounced-invitation voicing window.
6. Hold-beat rung narration (steve-call if narration changes).

scale-onramp stays converging (NOT converged): four 1415Z blanks are
now answered, but no wave-5 or full-seat reachability has been shown
and no game change landed. food-economy untouched (sibling Loop B lane).
Claim retired to .DEAD; lock deleted.
