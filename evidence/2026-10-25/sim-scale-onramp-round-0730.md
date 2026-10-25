# sim-scale-onramp-round-0730 — coordinator evidence (axis scale-onramp — 2 arms KILLED at pilot, records merged locally pending ship)

Run: fleshout-20261025T0730Z, loop A (oversight-flesh-out-loop). Sibling loop B
live on food-economy for the whole run (claim fleshout-loop-b-20261025T0730Z,
arms sim-packtail-b / sim-awayvoice-b / sim-causebase-b) — NOT touched.
This run worked scale-onramp (converging), taking the 0644Z next blank (1):
the field-fight survivability companion, as two ALTERNATIVE mechanisms
measured separately, never bundled with each other or with any finish lever.
At most one could land. In the event, NEITHER landed as game code.

## Pre-registration (binding, §14 — a miss is NO-GO, never re-scored)

Shared baseline, both arms: policy scripts/policies/tableseat-nowait.js,
seeds 73671–73678, 180d death-aware horizon (dead villages stop, +10d tail
max). Controls had to replicate the published 0644Z numbers exactly before
any arm was judged. Both arms' controls did: national-ever 8/8, final 7/8,
table invited 5 / entered 4, wins 4/8 (lesser seat only), wave-4 5/8,
wave-5 0/8, kind-filtered villager deaths 27 (field 12, other 12, raid 1,
arena 1, tb 1), wins-excluded median 180d, all-runs median 150d.
Deaths are kind-filtered only (person/villager, non-scholar); mixed harness
totals are forbidden for cost bars (0644Z correction). Primary cost median
is the wins-excluded median (control 180d); all-runs median reported
alongside. Wave guard is wave-4-or-win (a win that skips wave-4 passes).

Arm 1 sim-fieldguard-a (nearly-dead entry guard, FIELD fights only):
GO required ALL of: field villager deaths ≤ 9 (baseline 12); one-round
<15%-entry field deaths ≤ 2 (recount baseline 6); wins-excluded median
≥ 180d; national-ever ≥ 6/8; wave-4-or-win ≥ 5/8; raid villager deaths
≤ 2; starvation+sickness ≤ baseline recount + 2; directed probe proving
the guard fires before round 1.
Arm 2 sim-oneshotcap-a (wave-4 one-shot cap, FIELD fights only):
GO required ALL of: one-round ≥50%-entry field deaths = 0 (baseline 3);
field villager deaths ≤ 9; wins-excluded median ≥ 180d; national-ever
≥ 6/8; wave-4-or-win ≥ 5/8; raid villager deaths ≤ 2; directed probe
proving the cap fires and the villager survives round 1.
Pilot GO would have triggered a 12-seed confirm (73679–73690) with
pro-rata legs; neither arm reached confirm.

## Arm 1 — sim-fieldguard-a: KILLED at pilot (commit afdcc8e13, record only)

Mechanism (reverted; saved as evidence/2026-10-25/perseed-fieldguard-a/
fieldguard-reverted.patch for any future revisit): a villager below 15 HP
on the 100-point villager scale does not enter a FIELD fight — withdraws
before round 1, 0 dealt / 0 taken, monster stays. Flag-gated in fieldFight,
passed only by the wild-encounter router and expedition meetings; raid,
arena, contest, aid, sortie, alien, and patrol routes never carry the flag,
and the scholar is never guarded.

Pilot legs (control → armed): PRIMARY field deaths 12 → 6, PASS;
one-round <15% deaths 6 → 0, PASS; wins-excluded median 180d → 158d,
FAIL (the kill); national-ever 8/8 → 8/8, PASS; wave-4-or-win 6/8 → 8/8,
PASS; raid villager deaths 1 → 2, PASS (at cap); starvation+sickness
6 → 7, PASS; directed probe P1–P5, P7 PASS (P6 skips on a fresh harness —
see caveats); guard fired 12 rows in sweep (10 resolve + 2 expedition).
Armed wall: wins 5/8, final 8/8, entered 5/8, wave-5 0/8, full seat 0/8,
all-runs median 100d.

Why the median leg failed (metric review, NOT a re-score): the
wins-excluded pool shrank 4 → 3 because seed 73675 flipped from dying at
180d (control, never entered) to winning at 94d (armed, entered, won) — a
win removes a 180d village from the pool. Remaining non-winners: 93d,
158d, 180d → median 158d. The leg as written cannot distinguish "villages
dying earlier" from "a village leaving the pool by winning" at n=3. The
fail is robust to median definition (lower median, mean, upper median all
put armed below control). Proposed revision for the NEXT run only: judge
survival on a composition-proof basis (full 8-seed distribution, or a
median leg binding only with ≥4 non-winners). Verdict NOT re-scored under
any revision.

Correction to the worker handoff: it said "oneshotcap-a proceeds alone."
That is wrong — oneshotcap-a was independently KILLED (below). Neither
arm proceeds; nothing stacks.

## Arm 2 — sim-oneshotcap-a: KILLED at pilot (commit 6781854c4, record only)

Mechanism (reverted): in a FIELD fight (wave-4+ only), a single round's
damage to a villager is capped below half the villager's max HP, so a
healthy villager cannot be flattened in one round. Raid, arena, and tb
routes untouched; wave-1/2 not softened.

Pilot legs (control → armed): PRIMARY one-round ≥50% deaths 3 → 0, PASS
(mechanism works exactly as designed); field deaths 12 → 13, FAIL (the
kill, bar ≤ 9); wins-excluded median 180d → 180d, PASS (all-runs median
150d → 172d); national-ever 8/8 → 8/8, PASS; wave-4-or-win 6/8 → 6/8,
PASS; raid villager deaths 1 → 1, PASS (raid defense unbroken: 342
fights, 20 kills both arms); stall sense check PASS (field vKill 71 →
71, mFlee 664 → 663, no armed wave-4+ fight past 2 rounds); directed
probe PASS (100-HP villager vs real wave-4 eater at max rolls: uncapped
round-1 damage 160, capped to exactly 49, villager survived round 1).
Armed wall: wins 3/8, final 5/8, entered 3/8, wave-5 0/8, full seat 0/8.
No confirm run was spent (confirm is pilot-GO-only).

Why it died despite the primary passing: seed 73673. In control it won at
day 134; armed, the day-107 suburb one-shot was prevented, and the
diverged trajectory never entered the table, ran to 180 days, and took
three further deaths (one at 0.98 entry HP dying 49+49 over 2 rounds). The
cap buys a round, not a life — villagers who cannot flee or kill in the
bought round still die one round later (wave-4+ vFlee 1 → 8, but vKill
still 0). Villagers still never kill a wave-4 monster in the field. The
divergence analysis is recorded under metric review in the arm evidence,
not used to re-score.

## Village assessment, in plain words

Both companions did exactly the one job each was built for — no villager
died nearly-dead in a field fight under the guard, and no healthy villager
was flattened in one blow under the cap — and villages still ended up
with no fewer field deaths overall. Saving a villager changes the
village's story rather than saving it: the guarded village won one more
time and held national to the end, but two saved villagers later died in
raid fights healthy (73675 day-30 field withdrawal → day-34 raid death;
73674 day-17 → day-134); the capped village lost the win it used to
have on 73673 entirely. As companions these are good tourniquets and bad
cures: they stop the specific bleeding they were built for, but the
village still bleeds at the same rate through the next wound. The
remaining field deaths under the guard were all at ≥23% HP: the wave-4
one-shot class, one even 4-round fight, and one still-unexplained
belltoad 0-damage pair. Wave 5 and the full seat remain unreached; wins
still come only through default-OFF courtship + seat instruments on the
lesser seat.

## Wall numbers (this run's judged corpora, pilot bands)

Controls (both arms replicate 0644Z exactly): national-ever 8/8, final 7/8,
table entered 4/8, wins 4/8 (lesser seat only), wave-4 5/8, wave-5 0/8,
full seat 0/8, median wins-excluded 180d, all-runs 150d.
Fieldguard armed: national-ever 8/8, final 8/8, entered 5/8, wins 5/8,
wave-4-or-win 8/8, wave-5 0/8, full seat 0/8, wins-excluded median 158d.
Oneshotcap armed: national-ever 8/8, final 5/8, entered 3/8, wins 3/8,
wave-4-or-win 6/8, wave-5 0/8, full seat 0/8, wins-excluded median 180d.
Pooled armed: wins 8/16, national-ever 16/16, wave-5 0/16, full seat 0/16.

## Sense-testing notes

Fieldguard: guarded villagers withdraw cleanly (0 rounds, HP unchanged)
and the village carries on; no robotic or repeated dialogue flagged in
this arm's sense pass, but the guard's saved villagers dying later in
raids reads as the village choosing its fights, not as protection — the
story the numbers tell is displacement, not rescue. Oneshotcap: the
capped villager surviving round 1 and fleeing in round 2 reads honestly
as a bought round; nothing in the transcripts suggested the cap itself
was noticed or narrated by villagers. A field-kill / field-save narration
beat remains an open blank (carried from 0337Z/0644Z).

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline hidden_files/telemetry-baselines/scale-wall.json
--current 'evidence/2026-10-25/perseed-<arm>-a/*.json' --metrics national,table,wins,exiled`
on both merged corpora: 2 LOUD lines each (national 12 → 0, wins 16 → 0).
Both are the known path/regime artifact class (rows lack top-level
national/wins paths; actuals are national-ever 8/8 in every corpus and
wins 4/8 controls, 5/8 fieldguard-armed, 3/8 oneshotcap-armed). Baseline
NOT rolled, no new investigation. Same artifact class as 0535Z/0644Z.

## Metric review (for the NEXT run, verdicts above NOT re-scored)

1. Wins-excluded median needs a composition-proof revision (see fieldguard
   section): at small n, a win leaving the pool moves the median more than
   any death does. Next run must pre-register the revision before reuse.
2. Field-deaths-per-exposure (deaths per field fight, or per villager-field-
   fight-day) as a divergence-tolerant metric: both kills turned on band
   totals that cascade when one saved villager re-routes a whole run.
   Pre-register it alongside, never instead of, the band legs.
3. The "bought round must be spendable" problem: a companion that buys a
   round without giving the villager a way to spend it (flee reliably, kill,
   or be reinforced) displaces deaths rather than preventing them. The
   next companion design must name the spend mechanism up front.
4. Balance-panel compare was attempted by both arms and cannot ingest
   recorder corpora (requires panel pairs — the known failure class,
   fourth sighting counting 0535Z/0644Z/0630Z). Sweep-compare tables in
   the arm evidence files are the §15 comparisons; no verdict input came
   from the panel tool.

## Landing record (what merged, what did not)

MERGED (records only, zero src/js, merged locally pending ship):
6781854c4 sim-oneshotcap-a (evidence + sweep script + 16-row corpus) and
afdcc8e13 sim-fieldguard-a (evidence + corpus + probe + analyzer +
reverted patch). Both rebased onto master tip aab412f92 inside their own
worktrees (master had moved under the run on journey instrument commits);
post-rebase read-only verifications reproduced both verdicts exactly
(oneshotcap --summarize; fieldguard analyzer), then fieldguard was rebased
a second time onto the oneshotcap merge and re-verified before its own
--ff-only merge. NO game code from either arm landed; both levers stay
unlanded and must not be re-proposed without a new pre-registration that
answers metric-review items 1–3.
NOT merged as game code: nothing. No push, no version bump, no live
verification — the ship loop owns those.

## Infrastructure

Master moved twice under the run from sibling lanes (journey
establishment r36, journey deepening r45 — both instrument-only, zero
src/js overlap with either arm). Safe-commit index clobber hit both
worker commits (bogus staged deletions for byte-identical files) —
repaired via cacheinfo, commits verified correct before merging. No
container EPERM flap blocked this run. check.js --only fieldfight
timeout artifacts reported by both workers are pre-existing slow-script
timeouts (120s wrapper), not assertion failures or regressions; the
suites pass when run directly. Worktrees released as done-merged and
removed; branches deleted. Rotation left at 3 (convergence work does not
cycle it).

scale-onramp stays converging (NOT converged): both halves of the
0644Z companion target are now measured and both killed at pilot — the
guard halves field deaths but fails the survival median, the cap kills
one-shots but not field deaths — wins still only via courtship + seat
instruments on the lesser seat, full seat still unreached, wave 5 still 0.
food-economy stays converging (untouched; sibling B loop still live at
closeout). Next blanks, in order: (1) a companion with a spendable bought
round (flee/kill/reinforce mechanism named up front, own pre-registration,
metric-review items 1–2 adopted); (2) pool-presence lever for raid draft
(0644Z blank 2, still untested); (3) defender-fight wound manufacture
(0644Z blank 3, still undecided); (4) field-kill / field-save narration
beat (carried).
