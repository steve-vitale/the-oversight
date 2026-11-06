# Winnability round 1430 — table-offer BUILD landed + fight-interior DIAG landed (Loop B, 2026-11-06)

Run: fleshout-loop-b-20261106T1430Z, axis scale-onramp / winnability chain.
Loop A live on food-economy at run start (1115Z claim, sim-mootgate-a +
sim-gorgeharness-a) — NOT touched; A's 1115Z run later timed out and its
1415Z run (killersurvive-a + mootgate/gorgeharness adoptions) landed
mid-run — NOT touched. No gate / price / deed / readyDemand change in
either arm. Arm 1 is game code (src/js/table.js only); arm 2 is
instrument-only (zero src/js) — non-overlapping, shared one run.

## Outcome: 2 arms LANDED, merged locally pending ship

- sim-tableoffer-b — BUILD GO (merged 99813ea70: prereg 9310220a4, fix
  3b00c7a4b, evidence attribution 99813ea70).
- sim-fightinterior-b — DIAG-NO-GO on D1, D2 GO (merged 304ced6cf:
  prereg 528effc65, recorder 18bb71a24, corpus + evidence a6f5a3cce,
  corpus ece79c717/e1a53fa8, correction 304ced6cf).
- Proof on merged master: test-tableoffer-20261106.js GREEN,
  test-tablewithdraw-20261021.js GREEN,
  test-fightinterior-20261106.js 33/33.

## Arm 1 — tableoffer: BUILD GO (the sticky table offer)

Evidence: evidence/2026-11-06/sim-tableoffer-b.md (+ prereg).
Steve 2026-11-06 07:06 CST: once the table offers a seat, the offer does
NOT withdraw — the d90 withdrawal is a DEFECT to fix, not a rule.
Fix (src/js/table.js only, 3 edits): tableMissingBars(seat) extracted
as the single source of truth; tableHoldingLine (offer holds, once per
dip, naming the real loss) + tableReturnLine (case whole again, held
offer re-fires); tableAnnounce / tableScene no-seat branch: when
pg.tableAnnounced is true, a dipped bar HOLDS instead of withdrawing
(tableWaiting + tableAnnounced stay true; holding line once per dip).
Only a table NEVER announced still withdraws aloud (pre-offer path).
Sitting stays gated on the LIVE seat (tablePreview/tableTakeSeat
untouched) — a dipped offer cannot be sat until the case is whole.
Decline/deny preserved: nothing auto-sits, nothing clears the wait
(the Easter-egg road — staying unseated through the Network campaign —
is untouched). No win-price / deed-gate / readyDemand change; no change
to what earns the offer.

FORENSICS CORRECTION (read before citing 99767): trickoff-99767's own
JSON proves the literal case was NEVER offered — bestSeat 'none',
firstLesserDay null, surgeDay null, announceDay null. The bearer took
the fusion pellet and never banked the feast surge, so the food-thesis
deed was uncompletable and the seat never held; the d90 line quoted in
finding #1795 is the progression.js reactor beat (pellet quote), not
table.js's withdrawal beat. vfull-99767 (same seed, control policy):
surgeDay 54, firstLesserDay 54, announced d90, sat d110 lesser, won.
This fix does NOT change trickoff-99767's outcome. It fixes the
offered-then-dipped class, which is the defect Steve ruled on; the
pellet-never-offered class is a separate open design question
(steve-call, appended to sim-findings.md as its own entry, split out
of #1795). Seed 89702's d90 withdrawal was not located in the cited
evidence; not chased.

Pre-registered GO (prereg 9310220a4, before any judged sim): reproduction
RED pre-fix, GREEN post-fix (holds once, re-fires on recovery, sits),
decline preserved, existing table tests green — ALL MET. Reproduction
scenario (seeded, d95 lesser-seat profile, integration 45 -> 39):
BEFORE 8 failures, withdrawal fired, flags cleared; AFTER GREEN —
holding line once, flags stay, second dipped dawn silent, recovery
re-fires with preview returning the lesser seat, tableScene sits.
test-tablewithdraw-20261021.js rewritten to the ruling, GREEN.
check.js --only table: 10 passed, 0 failed.
No-regression sweep (sweep-winpath.js, competent, seeds 99761–99772,
180d): pre/post byte-identical (arc>=4 0/12, wave>=4 8/12, wave>=5 0/12,
national 0, table fired 0, wins 0, median 84d, max 179d) — the competent
driver never reaches the table on this band, so the sweep proves "no
change where the table never fires"; the scenario tests are the offer
proof. check.js --quick ON THE REBASED TIP (fix 3b00c7a4b, master
304ced6cf): 275 passed, 15 failed in 481s — 8 transient EPERM write
flakes (each passes on immediate individual retry), 7 pre-existing
identical on the base, 0 attributable to this arm; foodpower fixed
(ontology header re-pinned to bare one-method-per-line entries;
validate-ontology.js clean, "All 132 systems validated"; ONTOLOGY.md
diff is exactly the 3 added methods).

Wall (this arm's sims): national-or-better 0/12, table fired 0/12,
wins 0/12, wave-4 unlocked 8/12, wave-5 reached 0/12, median survival
84d — flat by design: the fix acts after the offer, not before it.

## Arm 2 — fightinterior: DIAG-NO-GO on D1 (one taxonomy string)

Evidence: evidence/2026-11-06/sim-fightinterior-b.md (+ prereg).
Fresh band 51001–51008 (verified fresh across all dated preregs +
forbidden lists), competent baseline vs stageally-armed, 150d
death-aware. D1 classification completeness: baseline 25/25, staged
33/34 — MISSED by one fight (51006 staged, day 105, Strike, 121
rounds, 0 hits: engine ends it tbEnd 'routed', recorder mapped only
won/lost/fled/unfinished). The fight is fully traced (120 verb
records) — nothing dropped; the taxonomy missed a string. D2
per-turn trace present ≥90%: 100% both legs — PASSED. Guard holds
(staged median survival 105d vs baseline 85.5d). Verdict NOT re-scored
per §14. The one-line fix ('routed' → 'rout' in closeTrace) landed as
the correction commit 304ced6cf in the same branch; the judged corpus
was NOT re-run.

The interior, measured (59/59 wave-4 TB fights traced, 0 instrument
errors): the rally costs NOTHING — round-1 player damage is 0 in 59/59
fights on both legs (round 1 is a closing round; the rally displaces
a move, not a strike, and the scholar moves after rallying anyway).
The fight is a damage race the party loses ~4x: staged 28 dmg/round
vs median 709 entry HP (~25 rounds to kill) over 6 survived rounds;
monster 17/round vs 100-HP scholar (~6 rounds to die). Beast ends at
48% max HP staged vs 69% baseline — the party bites deeper and lives
a round longer, but the race is still lost fourfold. Allies strike when
there (189/245 ally turns land, 77%, 2,669 ally damage staged); the
scholar barely strikes (median 2–2.5 strikes/fight; 9/34 staged fights
zero scholar strikes). Finishing is NOT the bind: mFlee 0 again
(reproduces finishprobe's 0/57 on this band's 59 fights); lost fights
end with the beast at 48–69% HP. Kills 6 staged vs 3 baseline (all
scholar-led; one companion kill, 51005 day 107 Strike by visjoin_83).
One pair day (51005 d66, veterans 2) lasted one day — both killers
dead within the week. The 53006-day-149 1-round shape did NOT
reproduce; the nearest shape is a wounded-entry kill (51005 day-66
Reunion entered at 123 HP) — most likely a deeply-wounded entry, not
a one-shot. Field fights killed 0 wave-4 monsters on both legs.

Stage-2-style sizing (finishprobe shape, party damage in the
numerator): baseline 1 flip of 22 lost fights (ceiling kill rate 12%);
staged 7 flips of 28 lost fights (ceiling 35.3% vs the 10% GO bar).
NEXT LEVER, SIZED NOT GUESSED: party damage per round — hold ground
and strike together every round the party survives (finishprobe P3
build, cascade extended to the party). Caveat: the bound is generous
(best rounds 143–159 are likely unrepeatable spikes); size the pilot's
GO against the ceiling, not the bound, and record best-round
composition. Survival time is the co-lever (the 25-round Suburb flip
is a survival story).

Wall (this arm): wins 0/8 both, national 0/8 both, table 0/8 both,
wave-4 unlocks 5/8 both, wave-5 unlocks 0/8, readiness-5-ready days
0 baseline / 1 staged, living wave-4 killers at end 0/8 baseline /
1/8 staged.

## Wall (both arms, pooled)

Wins 0 everywhere; national 0; table sittings 0; wave-5 unlocks 0 in
every judged ledger this round; wave-5 kills 0; readiness-5-ready days
1 (fightinterior staged, one pair day). The wall is still wave-4 kills
+ killer survival — now with the interior measured: the party deals
about a quarter of a beast's health before it dies, and no amount of
rallying changes the arithmetic.

## Telemetry deviation check

fightinterior: telemetry-check REFUSED recorder-corpus input (all 16
rows carry top-level anchorCommit) — recorded as the result, same as
every prior killer-chain arm; no LOUD lines, baseline NOT rolled.
tableoffer: no committed per-seed evidence glob (sweep JSONs in /tmp);
no compare fabricated. Balanced panel (§15): inapplicable on both
arms (no Game-root change in fightinterior; tableoffer's sweep is a
no-regression check, not a panel comparison) — no compare .md
fabricated.

## Infrastructure

- Master moved under the run: 12cac2ec7 → b13016733 → f2c4a6708 →
  a7a443a88 (Loop A killersurvive-a landed) → 304ced6cf (fightinterior
  merge) → 99813ea70 (tableoffer merge). Both branches rebased clean
  (fightinterior 5/5 onto a7a443a88, proof 33/33 re-run on the rebased
  tip; tableoffer already on 304ced6cf at merge time). No rebase
  stop-at-pick quirk this run.
- Registry-lock contention all run: worktree registration ~16 min for
  2 trees; heartbeat script stuck ~2.5 min per call twice; reaper +
  sibling registrations queued minutes at a time; nothing failed.
- EPERM write flap active 16:00–16:06Z: two heartbeat writes refused
  (PermissionError on fp.write), 8/15 check failures on the tableoffer
  rebased tip are transient EPERM flakes (each passes on retry). Flap
  cleared by 16:11Z (heartbeat landed). Zero data lost.
- Safe-commit index clobber hit on worker commits (prereg + instrument
  on fightinterior; prereg on tableoffer) — repaired via HEAD-blob
  cacheinfo each time, commits verified correct, trees clean.
- Loop A collision: A's 1415Z run had a fightinterior-a arm and DROPPED
  it on collision with this run's live arm (per its coordinator evidence
  04b668512); A's killersurvive-a (DIAG-GO) landed on master mid-run
  and was incorporated by rebase, not duplicated. A's entry hands this
  run the Reunion finding — answered by the fightinterior evidence
  (wounded-entry kill shape, no fresh-entry one-round kill).
- Coordinator deviation, recorded: the worker spawn template's "merge
  your work to local master via --ff-only" line was overridden by the
  body's own "After workers complete" section — the coordinator merged
  both branches (established practice in every prior round entry).
  Workers reported "ready to merge, pending ship" and committed
  nothing after their final reports.
- check.js --quick NOT re-run by the coordinator: tableoffer's
  rebased-tip run (275/15, 0 attributable) + fightinterior's zero-src/js
  profile cover this run; the standing 283/7 profile was just recorded
  by Loop A's 1415Z run.

## Convergence

scale-onramp / winnability chain: converging, NOT converged. The
sticky-offer defect Steve ruled a defect is fixed and landed, and the
fight interior is now measured end to end — but wins are still 0
everywhere, wave-5 kills still 0, no seed banks two living wave-4
killers and sits. Next blanks, in order: (1) the party-damage-per-round
lever pilot (hold-ground + strike-together, GO against the 35%
ceiling, best-round composition recorded; survival time as co-lever);
(2) first-killer survival (pair day lasted one day; killer survival
~50 days longer, or second kill ~50 days sooner — balance levers are
a Steve call); (3) pyrrhic-kill instrumentation (2 of 9 wave-4 kills
invisible to the killsLive wrapper; wrap the pyrrhic attribution path
src/js/game.js ~34015); (4) the 121-round Strike standoff (competent
policy loops a failed move 120 rounds against a shutdown grid);
(5) the pellet-bearer table lock (steve-call, finding appended);
(6) the 53004 trajectory fragility (Loop A's blank: one-day RNG
displacement flips a 150d survival to d84 death). food-economy stays
converging (NOT converged): untouched by this run (Loop A's 1415Z run
is live on it now). Claim deleted; lock deleted.
