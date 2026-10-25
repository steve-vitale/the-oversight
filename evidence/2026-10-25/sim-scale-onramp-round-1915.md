# sim-scale-onramp-round-1915 — coordinator evidence (2026-10-25, run fleshout-20261025T1915Z)

Lever played: scale-onramp (standing directive, Steve 2026-10-12 — the scale
wall is the binding constraint until a run shows national/table reached in
sims). Two arms, one shared baseline, both on the tableseat-nowait substrate
(LEANLINKRESCUE=1, TABLESEATNOWAIT=1), seeds 73671–73678, 180d death-aware
horizon (runDays stops on death/win; 180 is the cap, not a fixed horizon).
Sibling loop B was live on food-economy at run start (1849Z claim, arms
sim-deathext-b + sim-haultrace-b, NOT touched; B landed mid-run as
d5d28d443) -> this run worked scale-onramp (converging), taking the 1815Z
run's next blanks (2) and (3) in order. Blank (1) — a mechanism that moves
the old core — was NOT taken: it is gated by Steve rulings (melt
fiction-vs-mechanics gap; whether surviving-core near-immortality is the
intended reading of "earlier waves never leave"), and this run does not
design past that gate.

## Arms and pre-registrations (written BEFORE any sims)

Arm 1 — sim-w5chain-a (DIAG ONLY, zero src/js, zero default flips).
Question: the wave-5 eligibility chain PER SEED CLASS. DIAG-GO bars (all
required): (a) gate trace complete for >=95% of seeds (defer5 bars +
standing total over time, samples at 30/60/120/180 + end); (b) per-class
table (national-reached x wave-4-reached) with the binding leg named per
class, including whether any seed ever held all four bars simultaneously;
(c) births-side check: any wave-5 birth attempted/blocked by a gate other
than defer5, or "defer5 only" with numbers; (d) sense: one gate-relevant
transcript excerpt read and quoted. Recorder neutrality as in prior runs:
no RNG drawn, gated functions never called mid-run. Pilot must reproduce
the published control band exactly or STOP.

Arm 2 — sim-defwound-a (defender-fight wound manufacture, findings #990 /
#977). Stage 1 DIAG (mandatory, instrument only): quantify defender-fight
wound manufacture on the shared band — below-line wounds per defender
fight, by wave, and the re-meet rate of wounded entities. Stage 2 ONE rule
only: exactly one of (a) defender finish or (b) defender retreat, never
both, never bundled with a survivability companion, no toll change.
Pre-registered GO bars (pilot 8 seeds, identical seeds): below-line
survivor count down >=30% AND (villager kills up OR re-meet rate down),
with cost guards deaths no worse than control +10% and wins no worse than
control. Any bar missed = NO-GO: revert game code, land record only. If
Stage 1 shows no clean single rule, or the rule needs Steve's design
ruling, STOP at Stage 1 and land a DIAG record.

## Before/after numbers on identical seeds (control band vs arms)

Published control band (poolpres/1815, both arms gate against it — must
reproduce exactly or STOP): deaths 234, national-ever 7/8, wins 4/8,
wave-4 6/8, wave-5 0/8, raids 85, raiders 361, pool 1,494, pool wave-3+ 107,
median survival 135d.

Arm 1 — sim-w5chain-a: DIAG-GO. Corpus PASS. Neutrality EXACT on every
headline — deaths 234, national-ever 7/8, wins 4/8, wave-4 6/8, wave-5 0/8,
raids 85, raiders 361, pool 1,494, pool wave-3+ 107, median 135d,
starvation 5. Gate trace complete 8/8 (100%, bar >=95%), zero
point/recorder errors. (b) Per-class table — binding leg VETERANS in
every class: nat x w4 (6 seeds: 73671, 73672, 73674, 73675, 73677, 73678)
leg days met armored 487 / armed 828 / tricks 803 / veterans 0, days
all-four bars 0, days full-eligible 0; nat x no-w4 (73673 alone) 119 /
120 / 118 / 0, all-four 0; nonat x no-w4 (73676 alone) 55 / 53 / 61 / 0,
all-four 0; nonat x w4 class EMPTY on this band. Sharpening beyond
w5births: no seed ever held all four defer5 bars simultaneously, not for
one day — and 7/8 seeds never had even ONE living wave-4 killer at any
daily point. Best seed 73678 had one for 2 days against a demand of two,
and was still 28 standing short of 200, so neither leg alone explains its
stop. 73673 sat pinned at gated 99 for 58 days by the wave-4 veterans bar.
Binding stage: capped-200 for 7 seeds; rd5ready for 73675 alone. (c)
Births-side: NOT "defer5 only". 309 spawnWaveTarget calls; pool top 5: 0
calls; target-5 returns: 0. Wave-5 births 0 by every source (total births
323: w1 181, w2 95, w3 36, w4 11, w5 0; w4 by source: tile-entry 9,
scripted-titan 2). Targeting exonerated again (top-4 -> 4 in 10/15, 67% vs
designed 60%). Defer5 was active on exactly one seed (73675, 37 days) and
binding only on its last 2 days (days 134–135, gated 199, after wave 4
released); the other 7 seeds were blocked upstream (standing number,
then the wave-4 chain) before defer5 could engage. Scripted bypass check:
wave-5 defs exist in data and finale/network spawns bypass the pool
filter in principle, but zero scripted wave-5 births on this band — no
finale was reached, so the bypass never fired. (d) Sense (seed 73675, day
134, the day wave 4 released): "The fifth draft stays in the wings. It
wants a village that can fight — blood your fighters (0 of 2 veterans)."
Honest and well-placed — names the exact binding leg with no other bar
short, at the moment the previous door opens. The wrinkle: the village
hears it day 134 and wins through the lesser seat day 135, so the beat is
a doorbell rung as the village leaves. Commit 353bede41 (rebased onto
d5d28d443), zero src/js diff. Game code: ZERO changes from this arm.

Arm 2 — sim-defwound-a: Stage 1 DIAG-GO, Stage 2 NO-GO (record only, game
code reverted, zero src/js diff). Stage 1: control band reproduced
EXACTLY (raids 85, raiders 361, deaths 234, national-ever 7/8, wins 4/8,
wave-4 6/8, wave-5 0/8, median 135d, pool 1,494, pool wave-3+ 107); corpus
8/8, zero recorder errors. The correction to the old reading: defender
fights manufacture only a FIFTH of the wound mill. Defender fights 322
(mFlee 263, vFlee 34, vKill 25, vDie 0). Below-line survivor events 260 —
but only 56 MANUFACTURED by the defender fight (w1 37, w2 15, w3 4); 204
PRE-WOUNDED (the entity arrived already below the line). Field fights
manufacture 69 more; the toll directly accounts for only ~4 entities'
entry into the mill (consistent with 0535's "4 attributable crossings").
Re-meet: 204/260 events re-met (78.5%), 877 total re-meets, 100% of them
rounds-0 mFlee — not one is a real fight. Finished by a later villager
fight: 0. Fates of 108 distinct survivor entities: still-present 87
(80.6%), removed by player fights 20 (14 kills + 6 melts), departure 1,
vanished 0. Wounds never heal (0 HP rises). Defender-wounded entities
echo hardest: 10.3 re-meets each vs 4.1 for field-wounded ones (hypothesis:
they stay near Haven and the nearest-first raid draft keeps re-pulling
them — needs a draft trace to confirm). Sense (seed 73671): one tanuki
dropped 1.00 -> 0.11 on day 8 ("bloodied but breathing"), then met 23
times as the same boilerplate line ("stared down… 0 rounds, not a
scratch… It's still out there, somewhere"). Stage 2 — defender finish
(raid fights only: a monster the fight drops below the break line keeps
fighting instead of fleeing; monsters MET below the line still rounds-0
flee, by design; round-cap, trick mFlees, arena, aidFight untouched):
PRIMARY PASS — below-line events 260 -> 105 (-60%, bar <=182),
manufactured 56 -> 0; second leg PASS — defender kills 25 -> 65,
re-meets 877 -> 351; proof PASS — first-divergence 8/8, every seed's
first manufactured fight converts to a vKill in exactly one more round.
COST GUARDS FAIL both: deaths 234 -> 316 (bar <=257), wins 4/8 -> 3/8
(bar >=4/8). Deaths rise on all 8 seeds; defender vDie 0 -> 3; median
135d -> 96d; national-ever 7 -> 5. Interpretation: the finish itself
costs one round, but the cascade costs far more — dead phantoms free raid
slots that refill with healthy monsters, so later raids are fought against
real teeth. Same class as the 0535 finish lessons. Per the
pre-registration the game code is reverted and nothing behavioral merges.
Commits 619652d9c (Stage 1) + 7395490d1 (Stage 2, rebased onto 353bede41).

## Reachability verdict

Unchanged by design (measurement + killed rule, zero behavior landed):
national-ever 7/8, final national 6/8, wins 4/8 (lesser seat only), wave-3
8/8, wave-4 6/8, wave-5 0/8, full seat 0/8, median survival 135d. The wall
numbers did not move this run; what moved is the diagnosis. Two facts now
pin the wall from opposite sides: (1) the wave-5 chain never even starts
for 7/8 seeds — the binding constraint is upstream of defer5, in the
wave-4 kill funnel (2 faced seeds, 1 kill, 1 veteran alive for 2 days, 0
second veterans ever); (2) the wound mill that was supposed to be a
defender-fight problem is mostly a pre-wounded arrival problem — fixing
defender fights alone cannot convert kills, and finishing them costs more
lives than it saves.

## Village assessment (plain words)

The village of this band is a competent, national-reaching village that
keeps winning the wrong way: it reaches the table through the lesser seat
while the real prize — a village that can field two living fighters who
have each killed a wave-4 monster — never forms. Fighters who do kill a
wave-4 monster do not survive to be counted twice, and the village hears
the fifth draft's challenge the day before it leaves through the lesser
door. Around the haven, the same crippled beasts circle for months:
wounded monsters are met again and again but never actually fought — the
game says "it's still out there, somewhere" dozens of times for the same
animal. The village is not starving and not collapsing; it is stuck at
the exact step where surviving killers should accumulate, and the
accumulation never happens.

## Blanks filled or documented

FILLED (measurement): the wave-5 eligibility chain per seed class — the
binding leg is veterans in every class, all-four bars 0 days on 8/8 seeds
(w5chain). DOCUMENTED (killed, honestly): the defender-finish rule —
mechanism proven, cost guards failed, game code reverted (defwound).
DOCUMENTED (corrected reading): defender fights are a fifth of the wound
mill, not the mill; 204/260 below-line events arrive pre-wounded.
CARRIED, in order: (1) the wave-4 kill funnel — is it thin because
wave-4 monsters arrive too late/rarely (11 births, mostly late), because
fights aren't survived (73677 faced, 0 kills), or because the veteran
must survive to count (living-vs-cumulative veterans is a Steve design
ruling, not settled here)? Pre-reg sketch: same band/recorders plus a
wave-4 encounter-outcome census (fought/fled/killed/killer-died, killer
survival days); DIAG-GO when every wave-4 encounter is outcome-classified.
(2) Whether defenders should finish a crippled beast they MEET (the
residual mill: 105 defender events, 351 re-meets armed) — a separate rule
with its own loot/ledger scale, likely needing Steve's ruling before any
arm touches it. (3) The still-gated old-core mechanism (blank 1 from
1815Z) — unchanged, still needs Steve's rulings. (4) Defender-fight
narration is two boilerplate sentences repeated dozens of times
(narration blank, not mechanics). (5) Wall-wounded entities echo 2.5x
faster than field-wounded ones (10.3 vs 4.1 re-meets each) — nearest-first
draft hypothesis, needs a draft trace. (6) Measurement gap: kind-filtered
villager deaths for the 1815 band are unmeasured (defwound Stage 1 corpus
predates the deathList field); future arms should carry the raw death
list from the start. (7) Empty nonat x w4 class: no wave-4-without-national
seed exists on this band; a future arm wanting that contrast must
manufacture one or say so.

## Metric review

Pre-registered metrics bind this run: w5chain DIAG-GO bars all met as
written; defwound Stage 2 NO-GO judged against its written bars (a miss is
NO-GO, not re-scored against the passing primary leg). No metric revision
proposed for the next run, except the carried measurement gap above (carry
the raw death list) and the w5chain note that the nonat x w4 class is
empty by construction on this band — a future arm must not pre-register a
bar requiring that class without manufacturing it.

## Telemetry deviation check

Ran `node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-10-25/perseed-sim-w5chain-a/*.json' --metrics
national,table,wins,exiled`. LOUD lines: national disappeared baseline 12
-> current 0; table swung -75% baseline 16 -> current 4; wins disappeared
baseline 16 -> current 0. VERDICT: explained artifact, NOT a real bug —
same field-shape/regime class as prior runs (recorder rows carry
nationalEver/won/entered, not top-level paths; pre-seat substrate vs
WINSEAT baseline). The arms reproduce the control band EXACTLY on
identical seeds (national-ever 7/8, wins 4/8), so the wall numbers did not
actually move. Baseline NOT rolled. Balanced panel not run: no
before/after lever pair exists in this run (both arms instrument-only /
record-only); the sweep-compare tables and analyzer outputs in the arm
evidence files are the comparison of record, per the standing exception
for recorder rows.

## Infrastructure

Master moved once under the run (sibling loop B landed d5d28d443 mid-run);
both branches rebased clean in their own worktrees (w5chain 1 commit,
defwound 2 commits, zero file overlap with B's landing), proofs re-run
green after rebase (w5chain analyzer exit 0; defwound analyzer 25/25),
ff-only merges in order (w5chain, then defwound). Safe-commit index
clobber hit both worker commits (staged deletions, files byte-identical
to HEAD) — repaired via cacheinfo in the worktrees, commits verified
correct; no clobber on the coordinator evidence commit (verified below).
No EPERM flap blocked this run's writes. Zero src/js diff across the
whole run.

scale-onramp stays converging (NOT converged): national is reached
reliably only by default-OFF policy instruments, wins still come only
through the lesser seat, the full seat is still unreached, wave 5 still
has zero births, and these two arms move diagnosis, not the wall itself.
The standing directive stands. food-economy stays converging (untouched;
sibling loop B). Claim deleted; lock deleted. Evidence:
evidence/2026-10-25/sim-scale-onramp-round-1915.md (this file) +
sim-w5chain-a.md + perseed-sim-w5chain-a/ (w5chain 353bede41) +
sim-defwound-a.md + sim-defwound-a-sense.txt + perseed-defwound-a/ +
perseed-defwound-arm-a/ (defwound 619652d9c, 7395490d1). Merged locally,
pending ship.
