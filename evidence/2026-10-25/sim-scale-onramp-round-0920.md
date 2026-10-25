# sim-scale-onramp-round-0920 — coordinator evidence (axis scale-onramp — 2 arms KILLED at pilot, records merged locally pending ship)

Run: fleshout-20261025T0920Z, loop A (oversight-flesh-out-loop). Sibling loop B
live on food-economy at run start (claim fleshout-loop-b-20261025T0730Z, arms
sim-packtail-b / sim-awayvoice-b / sim-causebase-b, awayvoice heartbeat 09:18Z)
— NOT touched. B's claim was gone by closeout and B's tree heartbeats stood at
09:35Z (stale); B's trees were never touched either way. This run worked
scale-onramp (converging), taking the 0730Z next blank (1): a companion with a
SPENDABLE bought round, as two ALTERNATIVE game-code arms on the shared
tableseat-nowait band. At most one could land; NEITHER landed as game code.

## Pre-registration (binding, §14 — a miss is NO-GO, never re-scored)

Shared baseline, both arms: policy scripts/policies/tableseat-nowait.js,
seeds 73671–73678, 180d death-aware horizon (dead villages stop, +10d tail
max). Controls had to replicate the published 0644Z/0730Z numbers exactly
before any arm was judged. Both arms' controls did: national-ever 8/8, final
7/8, table invited 5 / entered 4, wins 4/8 (lesser seat only), wave-4 5/8,
wave-5 0/8, kind-filtered villager deaths 27 (field 12, other 12, raid 1,
arena 1, tb 1), wins-excluded median 180d, all-runs median 150d, one-round
>=50% trio identical (eater 103, suburb 87, suburb 69). Deaths are
kind-filtered only (person/villager, non-scholar); mixed harness totals are
forbidden for cost bars. Wave guard is wave-4-or-win.
Survival judged COMPOSITION-PROOF (0730Z metric review, adopted this run):
the wins-excluded median binds ONLY with >=4 non-winners in both control and
armed; otherwise the full 8-seed distribution judges (armed all-8 mean >=
control mean AND armed sub-100 deaths <= control + 1). Field-deaths-per-
exposure reported alongside raw counts; the raw count still binds.
Tie-break if both GO (moot — neither went): lower field deaths, then higher
all-8 mean survival, then arm 1. The loser would have landed record-only.
Pilot GO would have triggered a 12-seed confirm (73679–73690) with pro-rata
legs; neither arm reached confirm, so no confirm was spent.
Back-to-back second round NOT run: both verdicts landed at ~46m elapsed,
past the ~30m fallback window in the body.

Arm 1 sim-boughtflee-a (FIELD, wave-4+ only): single-round damage capped
below half max HP (100-HP villager vs wave-4 eater at max rolls: uncapped 160
→ capped exactly 49), AND the villager withdraws before round 2 — monster
stays, 0 further damage. Raid, arena, contest, aid, sortie, alien, patrol,
tb routes never carry the flag; wave-1/2/3 not softened; scholar never
guarded. GO required ALL of: field deaths <= 9; one-round >=50% deaths = 0;
composition-proof survival leg; national-ever >= 6/8; wave-4-or-win >= 5/8;
raid deaths <= 2; starvation+sickness <= control + 2; directed probe proving
cap fires + flee with 0 round-2 damage and untouched other routes.
Arm 2 sim-boughtstrike-a (FIELD, wave-4+ only): same cap, AND the villager's
next attack (round 2 only) deals 2x damage. Same GO legs, plus a probe
proving the cap fires and a boosted strike lands (wave-4 field vKill reported
as a diagnostic, not a binding leg).

## Arm 1 — sim-boughtflee-a: KILLED at pilot (commit d134b92e2, record only)

Mechanism (reverted; saved as evidence/2026-10-25/perseed-boughtflee-a/
boughtflee-reverted.patch): cap + withdraw-before-round-2, flag-gated to the
wild-encounter router + expedition meetings.
Pilot legs (control → armed): PRIMARY field deaths 12 → 10, FAIL (the kill,
bar <= 9); one-round >=50% deaths 3 → 0, PASS; composition-proof survival
PASS — both sides have 4 non-winners so the median binds, 180d → 180d, and
the full distribution agrees (all-8 mean 139.4 → 143.4d; sub-100 deaths 2 →
2); national-ever 8/8 → 8/8, PASS; wave-4-or-win 6/8 → 6/8, PASS; raid deaths
1 → 1, PASS (raid fights 342 → 341, vKill 20 → 20, defense intact);
starvation+sickness 6 → 6, PASS; directed probe PASS (capped exactly 49,
cap fired once, outcome vFlee round 1, 0 round-2 damage, boughtFlee true;
gates all cap 0: unflagged wave-4, flagged wave-3, flagged arena, flagged
scholar). Field-deaths-per-exposure 12/985 = 1.22 → 10/994 = 1.01 per 100
fights.
Armed wall: national-ever 8/8, final 7/8, entered 4/8, wins 4/8 (lesser seat
only), wave-4 5/8, wave-5 0/8, full seat 0/8, median all 168d /
wins-excluded 180d. Seed 73673 KEEPS its win under this arm (134d → 168d),
unlike oneshotcap-armed which lost it.
Why it missed by one (metric review, NOT a re-score): the arm killed its
entire target class (wave-4+ field deaths 3 → 1, and that 1 is a 3-HP
entrant; all five armed wave-4+ flees are textbook signatures — exactly 49
taken in exactly 1 round), but all 10 remaining field deaths are out of
scope: nine wave-1/2/3 deaths plus one 0.03-entry death (the fieldguard
arm's class). The bar prices deaths this arm was forbidden to touch. The
next pre-registration must scope the primary to the arm's mechanism class
(or pair a class-scoped primary with the exposure rate) — a bigger wave-4
cap cannot close a wave-1/2/3 toll.
Sense read: the save narrates, never silent — probe summary: "The eater
landed a blow that should have ended Villager — and Villager ran while
running still worked, 1 round, 49 taken." Corpus: 73671 ursula_weber vs
eater, 103-death → 49-flee with 58 HP left; 73673 gen_in9ciwi vs suburb,
69-death → 49-flee with 3 HP left ("barely walked away," literal). Honest
limit: 73676's saved villager re-met the same suburb at 3 HP the same day
and died — bought flee saves the fight, not the day (next blank 1 below).
Caveat: corpus awayNewsLast taps are null for bought-flee rows because the
recorder taps inside the fight wrap while the router's tell() runs after —
narration proven via summary + router branch, but no corpus awayNews row
shows the sentence in the wild.

## Arm 2 — sim-boughtstrike-a: KILLED at pilot (commit 5463b7062, record only)

Mechanism (reverted; saved as evidence/2026-10-25/perseed-boughtstrike-a/
boughtstrike-reverted.patch): same cap + round-2-only 2x strike.
Pilot legs (control → armed): PRIMARY field deaths 12 → 13, FAIL (the kill,
bar <= 9); one-round >=50% deaths 3 → 0, PASS (mechanism works exactly as
designed); composition-proof survival PASS — non-winners 4 control / 5
armed, median binds, 180d → 180d (fallback also passes: all-8 mean 139.375
→ 149.375d, sub-100 deaths 1 → 0); national-ever 8/8 → 8/8, PASS;
wave-4-or-win 6/8 → 6/8, PASS; raid deaths 1 → 1, PASS (raid fights 342,
vKill 20 both arms); starvation+sickness 6 → 7, PASS; directed probe PASS
(uncapped 160 → capped exactly 49, survived round 1, round-1 strike 8 →
round-2 strike 16, narrated "strikes back twice as hard — the bought round,
spent", fled round 2; no-flag scope control: same villager dies round 1 to
the full 160, cap/boost fire 0). Field-deaths-per-exposure 12/985 = 0.01218
→ 13/994 = 0.01308 (worse); wave-4 field vKill 0 → 0.
Armed wall: national-ever 8/8, final 5/8, entered 3/8, wins 3/8 (lesser seat
only), wave-4-or-win 6/8, wave-5 0/8, full seat 0/8, wins-excluded median
180d, all-runs median 172d.
Why it died (same seed, same divergence as oneshotcap, row for row): seed
73673 won at day 134 in control; armed, the day-107 suburb one-shot becomes
a capped 49 + round-1 flee (villager at 3 HP never reaches round 2, so the
boost never arms), the village runs to 180d, never enters the table, and
takes three further deaths. The killing fights select against the strike:
the saved villager flees immediately, and the algorithm villager tanks
instead of striking, so the boost expires unspent. The boost is real where
the villager stands and fights — the 73671 day-89 eater fight doubled total
damage vs its oneshotcap twin (mDealt 14 → 28, same trajectory, fled round
2) — but a 2x strike is not a kill against wave-4 HP bands (850–1500) and
does not turn a losing fight into a win.
Sense read: probe transcript reads honestly — a blow that should have
killed twice over, a doubled strike back, then flight; save and spend both
narrated, never silent. The algorithm deaths read as a villager playing
the algorithm's tanking game and losing anyway — the boost is invisible
there not because it failed, but because the villager never chose the
strike. No stall, no farce, no robotic dialogue flagged; no wave-4+ fight
past 2 rounds.

## Cross-arm verdict

The bought round is now measured three ways (cap alone in 0730Z, cap+flee,
cap+strike) and all three are killed at pilot on the same band. What is
settled: the cap mechanism itself works exactly as designed in all three
(one-shots 3 → 0 every time, raid defense unbroken every time, both
survival legs pass in both arms this run). What is NOT settled: field
deaths as a whole, because the remaining toll is wave-1/2/3 deaths plus
nearly-dead-entry deaths — classes no wave-4 instrument touches. A fourth
wave-4 variant would be re-measuring a settled mechanism. The next
companion must name a different death class up front (see next blanks) and
its primary must be scoped to that class.

## Wall (pilot bands)

Controls (both arms replicate 0644Z/0730Z exactly): national-ever 8/8,
final 7/8, entered 4/8, wins 4/8 (lesser seat only), wave-4 5/8, wave-5 0/8,
full seat 0/8, median 150d / wins-excluded 180d. Flee-armed: wins 4/8,
final 7/8, entered 4/8, wave-5 0/8. Strike-armed: wins 3/8, final 5/8,
entered 3/8, wave-5 0/8.

## Balanced panel (§15) + telemetry deviation check

Panel compare .md NOT attached: balance-panel.js compare cannot ingest
per-seed recorder corpora (it requires panel pairs) — the known tool
finding already in the backlog (fourth sighting, 0730Z run). The comparison
is the sweep-compare tables in the arm evidence files, as in 0644Z/0730Z.
Telemetry deviation check on both corpora: 2 LOUD lines each (national
12 → 0, wins 16 → 0) — the known path/regime artifact class (script reads
top-level national/wins paths; per-seed rows carry nationalEver/entered/
won, actuals national-ever 8/8 and wins 4/8 control / 4/8 flee-armed / 3/8
strike-armed). Baseline NOT rolled, no investigation item.

## Infrastructure

Master moved 3 times under the run (B causebase f810314b8, journey-social
r52 9a669665f, journey-scale r33 8a3f40621), zero file overlap with either
arm. Both branches rebased clean in their own worktrees (flee twice, strike
three times — ff-only correctly refused the diverged branch after each
intervening merge); post-rebase --summary runs reproduced both verdicts
exactly (FLEE_EXIT=0, STRIKE_EXIT=0, control gates 150d/180d, teles 261);
rebased commits verified byte-identical to the workers' commits on all 19
branch files (blob-hash comparison) before merging. Both merged --ff-only
in order (flee d134b92e2, strike 5463b7062). Safe-commit index clobber hit
both worker commits (repaired via cacheinfo, commits verified correct);
no clobber on the coordinator commit. No EPERM flap blocked this run.
Verification summary runs took ~13 min each under sibling load (box
contention with journey-scale --quick runs); both progressed, neither hung.
check.js --quick NOT run by the coordinator (zero src/js in either arm;
the flee worker's armed-tree --quick was killed mid-run under the same
contention and no green claim is made from it).

## Metric review

- Composition-proof survival leg worked as designed: both arms had >=4
  non-winners on both sides, so the wins-excluded median bound (180d →
  180d both arms), and the full-distribution fallback agreed in both cases.
  Adopted as the standing survival rule, not just this run's.
- Field-deaths-per-exposure reported for both arms (flee 1.22 → 1.01,
  strike 0.01218 → 0.01308 per fight) but the raw count still bound, and
  the raw count is what killed both arms. Next pre-registration: scope the
  primary to the arm's mechanism class (wave-4+ deaths, nearly-dead-entry
  deaths, or wave-1/2/3 deaths — named up front), with the exposure rate
  and the all-class count as guards, not as the primary.
- The 73673 divergence is now a three-arm regularity (oneshotcap, strike,
  and by contrast flee which preserves the win): any instrument that
  changes a day-107 suburb fight can flip a win into a 180d non-entry.
  Seed-level divergence narratives belong in every future arm evidence
  file, not just the verdict table.

## Next blanks, in order

1. Post-flee wounded behavior (new, from this run): a villager saved by a
   bought flee at 3 HP re-meets the same monster the same day and dies
   (73676) — what a wounded villager does after fleeing needs its own arm
   and pre-registration, never bundled with another fight lever.
2. Pool-presence lever for raid draft (0644Z blank 2, still untested).
3. Defender-fight wound manufacture (0644Z blank 3, still undecided).
4. Field-kill / field-save narration beat (carried); note the bought-flee
   awayNews tap gap (recorder taps inside the fight wrap, router tell()
   runs after) as a tooling sub-blank.
5. A scoped field-death primary for the next companion: 9 of flee's 10
   remaining field deaths are wave-1/2/3 — the next arm must name its
   death class up front (see metric review).

scale-onramp stays converging (NOT converged): the bought round is measured
three ways and killed three ways; wins still come only through default-OFF
courtship + seat instruments on the lesser seat, full seat still unreached,
wave 5 still 0. The directive stands until the tracker records this axis
converged on measured evidence. food-economy stays converging (untouched;
sibling B loop). Rotation left at 3 (convergence work does not cycle it).
Claim deleted; lock deleted. Evidence: evidence/2026-10-25/
sim-scale-onramp-round-0920.md (coordinator) + sim-boughtflee-a.md +
sim-boughtstrike-a.md (commits d134b92e2, 5463b7062).
