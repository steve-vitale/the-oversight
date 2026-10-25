# sim-scale-onramp-round-1815 — coordinator evidence (2026-10-25, run fleshout-20261025T1815Z)

Lever played: scale-onramp (standing directive, Steve 2026-10-12 — the scale
wall is the binding constraint until a run shows national/table reached in
sims). Two arms, one shared baseline, both on the tableseat-nowait substrate
(LEANLINKRESCUE=1, TABLESEATNOWAIT=1), seeds 73671–73678, 180d death-aware
horizon (runDays stops on death/win; 180 is the cap, not a fixed horizon).

## Arms and pre-registrations (written BEFORE any sims)

Arm 1 — sim-oldcore-a (DIAG ONLY, zero src/js, zero game-code change, zero
default flips). Question from the 1715Z run's next blanks: a mechanism that
moves the OLD wave-1/2 core (departure, mortality, draft weighting) or a
re-derived 23% bar — NOT another birth weight. This arm measures the core
first; the mechanism design is the next run's pre-registration. DIAG-GO bars
(all required): (a) ≥95% of raid-time pool entities' fates classified;
(b) old-core table per seed + pooled for maintain + hushwolf wave-1/2
entities (birth count, median lifespan, still-present-at-end share,
exit-cause shares, appearances/birth); (c) core share over time (days
30/60/120/180) + wave-3+ turnover comparison; (d) named mechanism answer —
which removal path, if any, moves old stock — or "none measured" with
numbers; (e) sense: one raid transcript read + quoted line. Any leg missing
= DIAG-NO-GO. Recorder neutrality as in w5births: no RNG drawn, nothing
thrown into the engine, originals untouched, gated functions never called
mid-run.

Arm 2 — sim-palisade-a (narration only, zero behavior change). Carried blank,
confirmed absent four times: the palisade-escalation narration beat for
wave-3+ raids. Site: src/js/havenGrowth.js, havenRaidTick. Mechanism: when a
raid's drafted raiders include wave-3+ (wmax >= 3 via crisisWaveOf — m.wave
is NEVER on the entity), the raid announcement flow carries one added
escalation beat, knowledge-gated display name (mname, never the true name),
said aloud like the raid announcement. Constraints: fires exactly when
wmax >= 3, never when wmax < 3; changes no spawn, draft, damage, crisis, or
economy value. STOP CONDITION: if the beat requires touching spawn, draft,
crisis, or economy logic, STOP and report — narration only. GO bars (all
required): proof green (driven game: wave-3+ raid → beat present, wave-1/2
-only raid → beat absent, in both palisade and no-palisade variants, existing
raid sentences byte-unchanged); pilot 100%/0% (beat on 100% of wmax>=3 raids,
0% of wmax<3 raids, on the shared band); mechanics-neutral guard (pilot
counts reproduce the control band EXACTLY — any deviation = NO-GO, revert
game code, land record only); sense pass (before/after excerpts judged for
meaning). Commit message MUST include [needs-eyes] (feel/narration change).

## Before/after numbers on identical seeds (control band vs arms)

Published control band (poolpres, both arms gate against it — must reproduce
exactly or STOP): deaths 234, national-ever 7/8, wins 4/8, wave-4 6/8,
wave-5 0/8, raids 85, raiders 361, pool 1,494, pool wave-3+ 107 (7.16%).

Arm 1 — sim-oldcore-a: DIAG-GO. Corpus PASS. Neutrality EXACT reproduction
of the published control band on every headline — deaths 234, national-ever
7/8, wins 4/8, wave-4 6/8, wave-5 0/8, raids 85, raiders 361, pool 1,494, pool
wave-3+ 107. (a) Classification 256/256 raid-time pool entities (100%,
unknown 0); no entity lacks a birth record, removal event, or still-present
verdict. (b) Old-core table: births 81 (maintain 57, scripted-hushwolf 24);
still-present-at-end 42 (51.9%); exited median life 11 days; still-present
median age 128 days; appearances/birth 6.80. (c) Core share over time
falls but never collapses (61% days 0–30 → 31% days 120+), while wave-3+
share climbs (0% → 16.9%) — the roster gets richer while the old
individuals stay. Wave-3+ turnover comparison: 2.28 appearances/birth vs
old stock 6.80 — old stock re-appears ~3x as often per birth. (d) Named
mechanism answer: fights move old stock (30 of 39 exits are kills: 12
player-fight, 10 villager-fight, 8 raid-defense); melts move 7 more
(player-fight-melt); departures move 2 (1 monsterTurn-departure, 1
departure-lost-trail). No fled-record, aid-crisis, sortie, or scripted
removal moved ANY old stock. So "none measured" is FALSE as a blanket
answer and TRUE in the sense the tileentry run needed: NO mechanism moves
the SURVIVING core. The pool share is set by survival, not births, and
survival past the early window is near-absolute. (e) Sense read done (see
the arm's evidence file). Commit: sim-oldcore-a, DIAG-GO, zero src/js diff.
Game code: ZERO changes from this arm (measurement only).

Arm 2 — sim-palisade-a: GO — all pre-registered legs pass. Proof 4/4 on the
rebased branch (w3-palisade beat present, w3-nowall beat present, w12
-palisade beat absent, w12-nowall beat absent; RAID sentences byte
-unchanged). Pilot 100%/0%: wmax>=3 raids 26, beat present 26 (100%);
wmax<3 raids 59, beat present 0 (0%); pairing exact every seed. Mechanics
-neutral guard EXACT on all five: raids 85, raiders 361, deaths 234, wins
4/8, national-ever 7/8. Per-seed pilot: 73671 survived 180d, 16 raids,
deaths 31; 73672 won d97, 7 raids, deaths 25; 73673 won d124, 7 raids,
deaths 28; 73674 survived 180d, 14 raids, deaths 18; 73675 won d135, 13
raids, deaths 24; 73676 village-lost d70, 7 raids, deaths 31; 73677
village-lost d143, 12 raids, deaths 43; 73678 won d116, 9 raids, deaths 34.
Sense pass: the day-60 raid reproduces tileentry's line verbatim
(wmax=2, beat correctly ABSENT) — the wave-2 apex still gets no special
billing, which is the point: the beat is a wave-3+ flag, not a "big raid"
flag. Implementation (havenGrowth.js only, +25 lines): after the existing
RAID say, compute the raid's wmax from drafted raiders via crisisWaveOf
and, iff wmax >= 3, say one separate line: "One of them is bigger than
the usual teeth at the door — <name> came with this raid, and the wall was
not built for its kind." The RAID sentence, palisade sentence,
contest-collision line, and crisis-tier logic are otherwise untouched.
Known limitation (design judgment, not a metric change): it names only the
first wave-3+ raider when a raid drafts two. Commit: sim-palisade-a with
[needs-eyes]. Check hygiene (supplementary, not pre-registered): node
--check clean; check.js --quick 279 passed, 8 failed — twice (745s, then
824s); all 8 failures re-run individually with ONLY the game change
stashed (pristine havenGrowth.js): all 8 fail identically on pristine
code with identical failing assertions — pre-existing, NOT caused by the
beat. Raid-adjacent godpath test-palisade-sleep.js passes (4/4) with the
beat live.

## Reachability verdict (unchanged by these arms, by design)

National-ever 7/8, final 6/8, invited 4/8, entered 4/8, wins 4/8 (lesser
seat only), wave-3 8/8, wave-4 6/8, wave-5 0/8, full seat 0/8, median
survival 135d (180d wins-excluded), deaths 234. Oldcore is measurement-only
and palisade is narration-only, so neither moves the wall itself — the wall
numbers are identical to the control band, and that is the honest result:
this run measured the old core and filled a narration blank; it did not
claim a scale breakthrough.

## Village assessment (plain words)

These are the same villages as the shared band, trajectory for trajectory
— both arms reproduce the control band exactly, so the news is about what
was learned, not new fates. In the first weeks the woods are a battlefield
: the village fights the small early animals, the player sometimes kills
them and sometimes drives them off — and driving one off in a player fight
quietly deletes it, even though the story says it melted back into the
woods (the melt fiction-vs-mechanics gap, carried below as a Steve ruling).
After the early window, the animals that survive basically never leave:
half the old core is still standing at the end of the run, some of them
four months old, re-appearing in raid after raid. The village's later raids
are fought against a mix where the old animals are still a third of the
pool and the newer, bigger things are the minority — which is why pushing
the share of big things up by birthing more of them barely moved the
needle in the tileentry run. And when a genuinely bigger thing does come
over the wall now, the village says so out loud instead of reading its
name flat in a list like any other raider.

## Blanks filled or documented

FILLED — old-core turnover classification (arm 1): every raid-time pool
entity's fate classified, the old-core table built, the mechanism answer
named (fights move young core only; surviving core near-immortal).
FILLED — palisade-escalation narration beat (arm 2): the carried blank,
confirmed absent four times across runs, now exists, proven, and guarded
exact.
DOCUMENTED, NOT FIXED — (1) melt fiction-vs-mechanics gap: should a melt
restore the monster instead of deleting it? (2) surviving-core
near-immortality: is it the intended reading of "earlier waves never
leave," or should an aging/retirement path exist? Both need Steve's design
ruling before any game change — the diag settles neither. (3) The 23% pool
wave-3+ bar question from tileentry (whether it is the right price when
the draft is nearest-first and wave-3+ stock turns over faster) now has
new input (6.80 vs 2.28 appearances/birth) but is still NOT re-derived
here — that is the next run's pre-registration question.

## Metric review (§14 — binding, no mid-run re-scores)

No metric was re-scored mid-run in either arm. Oldcore was judged exactly
against its five DIAG-GO legs; palisade exactly against its four GO legs
(proof, pilot 100%/0%, guards exact, sense). The 23% bar was NOT
re-derived and NOT used to judge oldcore (oldcore is a diag, not a lever).
Palisade's check.js 279/8 result was judged as hygiene, not as a GO leg:
the 8 failures were proven pre-existing by pristine-code reproduction,
not by comparing against a friendlier metric. The telemetry-check and
balanced panel were NOT run, per the standing exception for this run
(recorder rows are not panels; the panel cannot ingest per-seed recorder
corpora — eighth sighting expected). Each arm's sweep-compare table +
analyzer output is its comparison of record. The telemetry baseline was
NOT rolled.

## Infrastructure notes

- Sibling loop B landed mid-run (master e7d34d80c → 2018a499a, four
commits, zero src/js touched), then journey-social r53 (cda9b8480) and
journey scale r35 (92f80d05f) landed during landing. Both arms branched
from e7d34d80c, so plain ff-only merges failed on diverged histories;
each arm was rebased onto the current master inside its own worktree,
arm files verified byte-identical to the pre-rebase commits, proofs
re-run on the rebased branches (oldcore classify 19/19 + diag gates PASS
+ sweep --summary neutrality EXACT; palisade escalation proof 4/4), then
merged ff-only in order (oldcore, then palisade). No rebase conflict on
either arm (zero file overlap with the new base commits).
- Main-tree index clobber found at 18:46Z (same class as 2026-10-22/23/24,
caused by B's coordinator commit): staged deletion + untracked same path
for sim-food-round-1752.md, worktree file hash == HEAD blob hash —
repaired via update-index --cacheinfo, verified status empty + diff HEAD
empty. Re-checked after both merges: main tree clean.
- The analyzer/sweep --summary scripts rewrite their summary files with
a run timestamp (and the diag analyzer with an absolute worktree path
for evidDir); those rewrites were restored from the committed files
after verification — the committed corpora are byte-identical to the
arms' original commits.
- Palisade's check.js --quick took 824s (and 745s on its first run) — the
suite is slow because of long sim scripts (slowest 68s/67s/46s), which
explains the worker's long quiet stretch, not a stall. Its
revert-then-restore of havenGrowth.js at ~18:59Z was a path-limited
stash to re-run the 8 failures on pristine code, popped cleanly.
- Oldcore's agent never delivered a completion report (quiet ~22 min
post-commit); its commit + evidence were verified independently and it
was closed as cleanup after the merge. Palisade's agent completed with
"commit has landed, ready for coordinator merge."
- No EPERM flap blocked this run's own writes; all arm rows wrote first
try (oldcore's evidence notes the same). The stray .git/__flap2__.lock
probe artifact from another agent was left alone.
- A stray file note: palisade's committed corpus carries 8 per-seed rows
but no summary.json (the run summary's expectation of one was wrong, not
the commit) — the aggregated pilot numbers live in sim-palisade-a.md.
- Heartbeats verified via registry reads after each heartbeat call;
reaper threshold is 4h staleness, so no reaper risk arose.

## Next blanks, in order

1. A mechanism that moves the OLD core now that turnover is measured —
fights move young core only, melts move 7, departures move 2 — so a
departure/mortality/draft-weighting lever, or a re-derived 23% bar, must
be designed with its own pre-registration, NOT another birth weight.
(The melt-path and near-immortality readings above are Steve rulings
that gate any such design.)
2. Wave-5 eligibility chain per seed class (from w5births-a: FACED4,
READINESS4, SPAWN4, STANDING100, STANDING200) — still 0 births, 0 eligible
moments on this band.
3. Defender-fight wound manufacture (carried).
4. Palisade beat's one-raider naming limit (design judgment, recorded in
the sense file) — only if Steve wants the second big raider named too.

## Convergence

scale-onramp stays converging (NOT converged): national is reached
reliably only by default-OFF policy instruments, wins still come only
through the lesser seat, the full seat is still unreached, wave 5 still
has zero births, and these two arms move measurement and narration, not
the wall itself. The standing directive stands. Food-economy stays
converging (untouched; sibling loop B). B's landing and the
index-clobber repair are recorded in the review note (see tracker).

Merged locally, pending ship. The batch ship job owns pushes, version
bumps, and live verification.
