# sim-food-economy-round-2130-b — Loop B coordinator evidence (axis food-economy — 2 DIAG-GO arms LANDED, merged locally pending ship)

Run: oversight-flesh-out-loop-b, run_id fleshout-loop-b-20261031T2130Z.
Axis: food-economy (converging, NOT converged). Loop A live on
scale-onramp for the whole run (2058Z claim, then its 2156Z successor
claim: twoblow + contactrec — NOT touched) -> B worked food-economy.
Claim written before any sims; B lock created at run start, deleted at
closeout. Pre-flight: main tree clean, disk 20%, reaper removed nothing
(sibling dirty trees refused, left alone).

Base at arm start: b26777c16. Loop A landed mid-run (2058Z round
1d72a96c3 + journey-landing r80 c682a459d on top), so both arms were
rebased clean onto c682a459d, proofs re-run green after rebase, then
merged --ff-only in sequence (strandred, then p4sleep re-rebased onto
the post-strandred master and proof re-run a second time, then merged).
Origin/master checked via fetch before merging: origin dc66b4136 is an
ancestor of local master (normal — ship loop has not pushed the latest
local merges yet); no divergence. No push, no version bump: the batch
ship job owns pushes and live verification.

## Arm 1 — sim-strandred-b: DIAG-GO (strand re-derivation)

Prereg: evidence/2026-10-31/sim-strandred-b-prereg.md, written BEFORE
any judged leg. Bar: >=2 seeds in the P3 F1 30d pilot with >=1 genuine
creek-tile evening. Met exactly, no re-scoring, no metric moved mid-run.
DIAG only: zero src/js changes, zero policy edits,
`git diff b26777c16 -- src/ scripts/policies/` empty. 32 judged legs,
all errs 0. Proof scripts/test-strandred-b.js 5/5 pure, re-run green
after rebase and post-merge. Commits 298de8443 (prereg), 1039741e7
(instruments), ee3bdf65b (evidence).

Result, in plain words: the village CAN sleep away at the creek again
— on the deed-seeking patrol band, two seeds spend real nights camped
at the creek. The old strand yardstick (the woodcarry bucket saying
"creek") still says nothing on every leg, so the two yardsticks have
split: nights at the creek are real, the bucket's creek label is not.
No strand design is revived by this arm; it only re-derives the ground
the next strand arm stands on.

Numbers (tile vs bucket kept separate, never merged):
- P3 F1 17501-17508, 30d pilot: 41 genuine absences, 61 creek-tile
  evenings, 9 genuine creek-tile evenings on 2 seeds — 17505 days 5,
  10, 17, 24 (4); 17506 days 5, 8, 15, 24, 29 (5). 11 camps, 7
  genuine-opening. 17504 holds 16 creek-tile evenings (days 11-16,
  19-28) with 0 genuine-class — a long creek camp under a
  continuation-inclusive unit, invisible to the strict unit.
- Confirm P3 F1 60d: 80 genuine absences, 120 creek-tile evenings,
  13 genuine creek-tile (17506 rises to 9, incl. days 38/43/50/57;
  17505 adds none past day 30); 60d-prefix determinism 240 evenings,
  0 mismatches.
- Confirm P1 nighttravel-stack F2 30d: genuine absences 2 (17511,
  17513); 17513 genuine creek camp days 5-10; 17511 one continuation
  creek evening (day 10).
- Bucket criterion (P1 only): 0 raw and 0 haven-checked on all 16
  P1 legs. 17513 sleeps 6 nights at the creek on the woodcarry stack
  and the bucket never says creek.
- Zero drift vs the absencehunt base a3e57bfc1 on every compared cell
  (P3 F1 30d 41/39, 60d 80, P1 F1 1/204, P1 F2 2 — all identical).
- Survival only: 31/32 legs survived their window; sole village-lost
  leg is P3 17506 60d, day 57, while camped at the creek (attrition
  ledger, no single cause claimed).

Sense-reading (P1 17513 day 5 -> day 6): PASS, with a correction to
absencehunt. Day 5 is a genuine ramble — forest floor, crayfish,
kingfisher, Emberhold smoke, the unbridged creek refusing twice —
ending out-of-reach at the creek. The night IS narrated in the sleep
step ("You camp wild tonight — no pantry meal", "You settle into the
cold ground", dawn "You wake stiff and cold… Exposed"). Absencehunt's
"no line narrates the night out" holds only for the within-daily()
transcript. Texture residue: "fragments by the fire" gossip and a
pantry dinner line fire while the vessel is away.

Metric review: none arose mid-run. Carried forward (not judged here):
the next strand prereg must argue the confirmed-night unit (genuine +
continuation: pilot 60 nights, 4 seeds) vs the departure-night unit
(9 nights, 2 seeds) explicitly — the strict unit hides 17504's whole
creek life.

## Arm 2 — sim-p4sleep-b: DIAG-GO (P4 sleep/upkeep-window instrument)

Prereg: evidence/2026-10-31/sim-p4sleep-b-prereg.md, written BEFORE
any judged leg. Bar: classified fraction >= 0.80 OR one mechanism
>= 0.50 of re-derived unexplained away mornings. Result: classified
25/25 = 1.000; dominant mechanism deedHunt-sortie 25/25 = 1.000. No
metric re-scored; no metric doubt arose mid-run. DIAG only: zero
src/js, zero policy changes, diff guard empty. 24 judged legs.
Proof scripts/test-p4sleep-b.js pure 16/16, re-run green after both
rebases and post-merge; corpus checks 65/65, 63/63, 68/68. Commits
26bc63c28 (prereg), 908085f98 (instruments), 1edda5f79 (evidence).

Result, in plain words: the 25 "unexplained" mornings were never a
mystery move in the night. They are hunting sorties: in the morning
upkeep, a fed villager walks out to face a known beast, and is still
out when the day's first snapshot is taken. The old "sleep window"
name is wrong — the bracket is sleep plus the next day's full upkeep
sequence — and the evidence corrects the misnomer. Every one of the
25 carries the same fingerprint (a deedHunt sortie move in its own
upkeep call); 10 of the 25 never even reached their monster, the
partway walk alone stranded them.

Per-seed classification (explained / residue):
- Pilot P4 F1 30d: 8 unexplained, 8 explained, 0 residue (17502:d23;
  17503:d18, d27; 17504:d10; 17506:d27; 17507:d20, d26; 17508:d22).
- Confirm P4 F2 30d: 6 / 6 / 0 (17511:d12, d16; 17512:d25; 17516:d24;
  17517:d22, d27).
- Confirm P4 F1 60d: 11 / 11 / 0 (the F1 30d list exactly, plus
  17505:d37, 17507:d34, 17508:d34).
- Segment split pooled: upkeep-1: 18, upkeep-3: 7, sleep: 0,
  wait-block: 0, fight-drive: 0, contest-drive: 0. Destinations
  pooled: creek 9, trail_edge 5, meadow 5, grove 3, ruin 2,
  forest_floor 1.
- Re-derivation on current master reproduces absencehunt's old-base
  census EXACTLY — every count, every loop-day, in all three cells
  (genuine 1/1/2, day trips 178/177/295, sleep-returns 0,
  away-origin 34/28/101). 60d first-30 lists match 30d on 8/8 seeds.

Is P4's away total now citable? YES, under this definition only:
genuine departure-days + deedHunt-sortie episode starts (a morning
away whose previous evening was at haven AND whose upkeep bracket
contains a deedHunt sortie move). Per cell: F1 30d genuine 1 + starts
8; F2 30d genuine 1 + starts 6; F1 60d genuine 2 + starts 11. Always
state pooled (25) vs distinct episode starts (17) — never a bare
total. NOT citable: that sorties are the only way P4 goes away
(round-trips inside one window leave no census trace — 2 observed —
so sortie counts are lower bounds), and road absences remain 0
(nomad gate never fired on this grid).

Sense-reading (17502, closing morning 23): PASS. It reads as a person
going out to face a beast: hall-floor sleep through a night raid,
dawn waking rested, dusk feast, the draw line ("Night Court is
circling… Face it while the feast is in you"), "Travel 1 tile to
ruin", an Ugly-Eyes fight with Jae joining ("About time someone
fought back"), a Hushpuppy fight, then day 23 starting at the ruin
looting. Correction to absencehunt: its "unnarrated" claim holds for
daily transcripts only (0/25 episode starts appear in any day's
dayLines) — the upkeep say stream narrates 25/25. That
transcript-visibility gap is a design note with counts; no wording
changes landed in this DIAG arm. Texture note: fire-gossip lines
fire during the ruin fight's wait-blocks (same ambient-fire note as
absencehunt).

Metric review (for the NEXT run, not judged here): rename the bracket
(upkeep bracket, not sleep window); split the narration field into
window-stream vs daily-transcript channels; argue whether the morning
snap should move before upkeep parts (would turn all 25 starts into
genuine transitions, at the cost of moving every other census class).

## Village assessment (plain words)

Two long-standing "we don't know" entries are now answered, and both
answers are about ground truth, not new rules. The village can spend
nights at the creek — deed-seeking patrols live there for days at a
time — but the old bucket yardstick cannot see those nights, so any
future creek-strand design must say which yardstick it judges by or
it will measure nothing. And the nomad policy's mystery mornings were
hunting trips all along: fed villagers walking out at dawn to face
beasts, told in the morning-upkeep voice but invisible in the daily
story. Nothing in this round changes how the game plays (zero src/js
in both arms); what changes is what the next arm can honestly claim.
Villagers, on the transcripts read, act like people going out, camping
rough, and fighting — the gaps found are in what gets written down
(where the night-out line lives, which transcript channel carries it),
not in whether the behavior happens.

## Reachability verdict

Waves 1-5, Arc II/III/IV, regional -> national, the table, the win
flag, vests: NOT measured by these pre-seat censuses (stated plainly,
not fabricated). Wall UNCHANGED: full seat 0, wave 5 reached 0 stand
as the last measured wall state (Loop A lane). No food-economy default
flipped, no balance change landed in this round.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-10-31/sim-strandred-b-census-*.json' --metrics
national,table,wins,exiled` and the same for sim-p4sleep-b censuses:
3 LOUD lines each (national 12 -> 0, table 16 -> 0, wins 16 -> 0).
INVESTIGATED as the known missing-field artifact: these are pre-seat
measurement censuses carrying no national/table/wins fields, against
a WINSEAT-regime baseline — the same class as the 2030Z round.
Baseline NOT rolled. No new investigation.

## Landing notes

- Safe-commit index clobber hit all 3 commits of each arm; repaired
  each time via --add --cacheinfo from HEAD blobs, status + diff HEAD
  verified empty after each repair; commits never in doubt.
  Coordinator verified the same way post-merge (main tree clean).
- Registry lock contention with Loop A's concurrent landing slowed
  registration/heartbeat/release calls to minutes each (retries only,
  no force); both arm trees released as merged, branches deleted,
  main tree clean at closeout.
- check.js --quick NOT run at coordinator closeout (arm proofs are the
  landing verification; --quick has hung under concurrent loop load in
  recent rounds and is cited neither as pass nor as failure). Arm
  proofs re-run green post-merge in the main tree: strandred 5/5,
  p4sleep 16/16.

## Next blanks, in order

1. Strand arm on a strandred band (P3 F1 17505/17506 for genuine
   creek nights; 17504 for long creek camps under a confirmed-night
   unit; or P1 F2 17513 on the original stack), with its own prereg
   arguing the confirmed-night vs departure-night unit explicitly.
2. Bucket-vs-tile divergence mechanism (why the woodcarry bucket
   never classifies creek nights) — uninvestigated.
3. Original-voiding bisection on the 19b3e1ae0 base itself (from
   #1654; current-master bisection cannot see it).
4. Daily-transcript narration for night-out episodes (0/25 in daily
   transcripts, 25/25 in the window stream) — design decision for a
   future arm, counts supplied; no wording landed here.
5. P4 round-trip sorties as lower-bound caveat whenever P4 away
   totals are cited.

food-economy stays converging (NOT converged): the strand program's
precondition is now re-derived live on current master (tile substrate
live, bucket still empty) and P4's away total is citable under its
stated definition — but no strand lever has been judged yet and no
game change landed. scale-onramp untouched (sibling Loop A lane).
Claim deleted; lock deleted. Merged locally, pending ship.
