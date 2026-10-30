# sim-scale-onramp-round-0533 — coordinator evidence (run fleshout-20261030T0533Z)

Axis: scale-onramp (blocking axis, converging, NOT converged). Both arms
DIAG, MEASUREMENT ONLY — zero src/js game changes, no default flip, no
gate change, no push, no bump, no live verification. Merged locally,
pending ship (batch ship job owns pushes + live verification).

## Run shape

- Concurrency guard: no live lock at start (previous loop-A run 0420Z had
  closed its lock + claim). Lock + claim written before any sims
  (fleshout-20261030T0533Z, axis scale-onramp, arms sim-evadeshape-a +
  sim-chainclose-a). Sibling loop B was live on food-economy at run start
  (trees sim-raidnamefix-b / sim-woodshortledger-b, later merged by B
  mid-run) — NOT touched; both arms below rebased cleanly onto the
  moving head, zero conflicts, zero sibling files touched.
- Infrastructure: a runtime restart killed the coordinator's
  worktree-registration command mid-run (after both trees were in fact
  registered); effects verified before proceeding (both trees present,
  registry active, heartbeats refreshed) — nothing was re-run blindly.
  Worktree checkout itself was slow (~3 min per tree, git reset in
  uninterruptible IO) but completed. Safe-commit index clobber hit all
  worker commits on both arms; repaired via HEAD-blob cacheinfo each
  time, commits verified correct, never reset, never forced.
- Pre-flight: main tree clean at start, disk 19%. Closeout: main tree
  clean (0 status lines), both branches deleted after merge, reap done
  (remaining active trees are siblings', untouched).

## Arm 1 — sim-evadeshape-a: DIAG-GO + all-wave SHAPE-GO, wave-4 shape HELD

Prereg: evidence/2026-10-30/sim-evadeshape-a-prereg.md (committed before
any judged analysis). Band: 32 seeds 75101–75132, 180d death-aware,
tableseat-nowait substrate verbatim + verbatim recorder stack + one new
record-only evadelog recorder. Legs: completeness 32/32, joins
4,334/4,334, evadelog 328 == joined evades 328, taxonomy OTHER = 0,
shape OTHER = 0; taxonomy-audit pilot 6/6 pairs covered; determinism
seed 75120 byte-identical; sense all 328 evade lines read; fixtures
44/44. Coordinator re-ran the analyzer on merged master: identical
numbers, MACHINE-LEGS-PASS.

Census (4,334 meetings): evades 328 (7.6%); scatters 2,272 (52.4%);
kills 427, drive-offs 719, flees 510, deaths 58, pre-contact kills 20,
OTHER 0.

Headline — the evade split is total, and it is wiring, not dice:
evades by channel are expedition (other) 328/571 (57.4%), field 0/2,599,
raid 0/1,164. Only the expedition path in villager-agency.js passes
`awareness: true` to fieldFight; every other caller omits it, so their
pre-contact outcome is beast scatter (field 58.4%, raid 64.9%,
expedition 0%). An evade lever that is not an expedition lever is
mis-aimed. By wave: w1 216, w2 89, w3 19, w4 4, w5 0 (no wave-5 meeting
in-band). All evades: solo-tile 328/328, expedition caller 328/328,
crew 0, scholar-led 0, armed 328/328. Warned 153/328. After an evade:
next same-type meeting present 148/328 (median gap 12d; commonest
sequels another evade 42 or drive-off 42, only 3 deaths); 50
(seed, villager) pairs evade 3+ times (max 16). Individual-level evade
aftermath is unmeasured (exactly 1 same-individual candidate, weak).

Wave-4 subset — described, NOT characterized: INSUFFICIENT-DATA, held
(4 < prereg bar 5, no bar lowered). 87 wave-4 meetings: FLEE 54,
DEATH 27, EVADE 4, SCATTER 1, DRIVE-OFF 1, KILL 0. The 4 evades are all
unwarned first contacts, all solo-tile expedition; all 4 evaders later
died 2/10/14/26 days after escaping; none was ever re-met by its type.

Sense: PASS. All 328 evade lines read (298 distinct texts), all of the
form "<Name> saw <phrase> in time and gave it room." Knowledge-gating
is visible in-line (gallowdeer "the thing with headlights for eyes" d4
-> "Highbeam Deer" d10). Wave-3/4 lines cross-checked against w4dpr:
23/23 verbatim. One strain noted, not smoothed: 3 same-villager /
same-beast / same-day double evades whose lines cannot distinguish
the two meetings.

Finding #1466 (evade taxonomy gap, w4meet DIAG-NO-GO) is CLOSED on its
own terms: PRE-CONTACT-EVADE is now a named class and OTHER = 0 on a
band twice as wide. Backlog line marked fixed by this run.

Commits (merged ff): prereg a4ff31482, instruments a3562e612,
analyzer breakdown 3241ce219, evidence + corpus c795e7e25.

## Arm 2 — sim-chainclose-a: DIAG-GO

Prereg: evidence/2026-10-30/sim-chainclose-a-prereg.md (committed before
any judged analysis). Band: 16 seeds 75101–75116, 180d death-aware,
same substrate + recorder stack verbatim. Legs: completeness 16/16,
joins 2,257/2,257, breakline == w4dpr everywhere, shoutrec
prefix-consistency 751/751 (the corrected leg from chainfinish's metric
review — final-equality stays retired); close-target computability
10/10 chains (seed pace), 2/2 recurring chains (chain pace),
8/8 single-meeting chains explicitly undefined pace (not missing),
0 Infinity targets; determinism seed 75102 byte-identical and
byte-identical to chainfinish's row (base did not move for the shared
seed); sense all 16 fought wild wave-4 logs read; fixtures 46/46.
Coordinator re-ran fixtures on merged master: 46/46 green.

Close targets (formula: runway = run days − last meeting day;
M = floor(pace × runway); target = ceil(remaining HP / M)):

- Eulogy chain (75102, 4 meetings): chain-pace target 41/meeting
  (seed-pace 78, daily bound 32). Binding: damage scale — observed
  median 11.5, best 24, so ~1.7× the best meeting is needed.
- Algorithm chain (75102, 4 meetings): chain-pace target 120
  (seed-pace 160, daily bound 64). Binding: lifetime/HP — even daily
  meetings need 64.
- 8 single-meeting chains: chain pace undefined (never re-met);
  seed-pace targets 20–395. Binding: recurrence, not damage.

Distributions: chain pace (n=2) sorted [41, 120] — closable at 20: 0/2,
at 41: 1/2, at 60: 1/2 (the 41→60 band is empty). Seed pace (n=10)
sorted [20, 20, 24, 33, 78, 136, 160, 202, 218, 395] — closable at 20:
2/10, at 41: 4/10, at 60: 4/10 (gap 33→78: "a bit more damage" buys
nothing). Seed level (chain pace): closable at 41: 1/5 contact seeds,
1/16 seeds overall. Lifetimes after first wild contact: 31, 61, 5, 45,
41* days (*75116 horizon-censored, targets are upper bounds).
0 chains finished; 0 kills in 16 wild meetings.

Binding constraint, split three ways: damage scale for the eulogy,
lifetime/HP for the algorithm, recurrence for 80% of chains (never
re-met, so no pace exists to price). Pricing damage further without
a second meeting is pricing a denominator that does not exist.

Join effectiveness — UNJUDGED observation only (not a scored leg):
allies deal 24 of 321 total damage (7.5%), ~10% median share in the
5/16 joined fights. Carried as a prereg candidate for a later run.

Sense: PASS. Chain story reads coherently — eulogy (d55–d59) and
algorithm (d65–d71) chains show exact wound persistence, no heal lines
or HP resets; wild vs raid are separate chains. Two qualifications:
s75116's audit opens at 825 HP with no prior raid audit on that seed
(spawn-HP variance, unexplained), and the "no arrows" line appears in
striking fights too (it means "ranged unusable," not "disarmed"). All
16 fights end flee (11) or death (5) in 1–3 rounds.

Instrument fix carried (chainfinish analyzer bug, harmless on its
single-contact-seed band, wrong on multi-seed bands): chains must be
keyed by (seed, mid), not mid alone; censored = horizon-survived only
(the old flag mislabeled won runs as censored). The fix must be ported
before any other arm reuses that analyzer.

Commits (merged ff): prereg 73003d016, instruments d82bf5c35,
instrument fix 7b529dc76, evidence + corpus 43639571e, rebase-note
correction f6c8acc40.

## Wall numbers (each arm's own corpus, report-only — no game change)

- Chainclose band (16 seeds): won 9/16 (full 0), national ever 13/16,
  national final 11/16, table reached 12/16, entered 9/16; wave reach
  16/16/14/9/0; median survival 118d; deaths 527, starvation 3.
- Evadeshape band (32 seeds): won 14/32 (full 0), national ever 23/32,
  national final 19/32, table reached 21/32, entered 14/32; wave reach
  32/32/29/20/0; contact seeds (wave-4 meetings) 13/32 vs unlock 20/32;
  median survival 115d; deaths 1,109, starvation 8.

The wall has not moved: full seat 0, wave-5 reach 0, wave-4 kills 0 on
both bands. What moved is the diagnosis: damage, heads, holds, and
mitigation are eliminated as pooled-gap bridges (prior runs); now
evades are shown to be an expedition-only wiring shape, and chain
closure is shown to be recurrence-bound for most chains and
damage-bound for the one attainable chain (41/meeting).

## Village assessment (plain words)

A village that meets a wave-4 beast almost never meets it twice, and
almost never kills it. When a lone villager spots a beast on an
expedition in time, they step aside and live — that is the only clean
escape in the whole census, and it only happens on expeditions, because
only expeditions tell the fight the villager was aware. Everywhere
else the beast simply scatters or the meeting becomes a short, losing
fight: eleven of sixteen wild wave-4 fights end with the villager
fleeing, five with the villager dead, none with the beast dead. The
wounds a village does inflict stick — the same scarred beast comes
back days later with exactly the same wounds — but villages die
(around day 86–118) long before the ~75–160 meetings a chain would
need at the damage villagers actually deal. The one chain that could
close inside a lifetime needs 41 damage every meeting; villagers
manage 11 or 12 on a typical meeting, 24 on their best. So the village
is not one good fight away from the wave-4 wall falling: it is a
second meeting away, and then a much harder hit away.

Villagers still read like people in the transcripts: evade lines carry
real knowledge growth (an unnamed "thing with headlights for eyes"
becomes "Highbeam Deer" days later), and chain logs show the same beast
returning with its wounds intact rather than resetting. Nothing
robotic or repeated was found in the evade or chain lines this run.

## Reachability verdict

Waves 1–4 reached (wave 4: 9/16 and 20/32 seeds); wave 5 reached 0 on
both bands; national reached (ever) on most seeds; table reached on
most seeds; full seat 0; wins only via the lesser seat (9/16, 14/32).
Arc reach, four-realm formation, trap acquisition, counter
discovery/kill, young-link succession, tier-2/wave-3 reach: NOT
measured by these two arms (out of scope — see prior runs' panels);
no claim is made here.

## Metric review

- Chainclose prereg used the chainfinish metric-review revision
  (shoutrec prefix-consistency instead of final-equality) and it held:
  751/751. No further revision proposed.
- Evadeshape prereg's rarity bar (shape verdict needs >= 5 evades) held
  honestly: all-wave shape passed at n=328, wave-4 shape held at n=4
  with no bar lowered. No revision proposed.
- Telemetry deviation check (both corpora, baseline scale-wall.json,
  metrics national/table/wins/exiled): 2 LOUD lines each — national
  12 -> 0, wins 16 -> 0. VERDICT: explained artifact, baseline NOT
  rolled. The baseline file labels itself a WINSEAT ~100%-win suite
  and warns DO NOT compare pre-seat substrates against it; these
  corpora are the tableseat-nowait pre-seat regime, and their own
  wall numbers contradict "disappeared" (national ever 13/16 and
  23/32; wins 9/16 and 14/32). The 0 is a field-mapping artifact of
  the fresh per-seed files against the baseline's fields, not a real
  loss. Table + exiled clean on both.
- No metric was re-scored mid-run on either arm.

## Blanks filled or documented

Filled: evade taxonomy (PRE-CONTACT-EVADE class, OTHER = 0 on 32
seeds); chain-close targets priced with distributions (41 eulogy /
120 algorithm, recurrence binding for 8/10 chains); chainfinish
analyzer grouping + censored-flag bugs fixed in the chainclose
instrument (port still owed to other users of that analyzer).
Documented (not chased mid-run, appended to sim-findings.md):
recurrence-first measurement; spawn-HP census; expedition-awareness
instrument (tracking XP + ability flags at expedition meetings);
field/raid awareness wiring (Steve-call); scatter census (2,272
meetings, the larger pre-contact shape); evaded-beast provenance
instrument; join-effectiveness prereg candidate.

## Ranked next (for the next scale-onramp run — not built here)

1. Recurrence-first measurement — 8/10 chains never re-meet; price what
   produces a second meeting before pricing damage further.
2. Expedition-awareness instrument — record tracking XP + ability flags
   at expedition meetings; test whether evade rate follows the engine
   formula (base 0.35 + tracking + ability bonuses). 50 repeat-evader
   pairs license it; no predictor is claimable from this corpus.
3. Eulogy-scale probe — the one attainable chain-pace target (41)
   against a best observed 24; a later arm measures what moves damage
   toward it.
4. Wave-4 evade shape stays HELD until a band yields >= 5 wave-4 evades.
5. Steve-calls carried (not decided here): whether the awareness check
   should run on field/raid callers at all (it would change the game's
   dominant pre-contact outcome, scatter, not tune a dial); whether
   narration turns should ever deal damage (chainfinish F-3, carried).

Convergence state: scale-onramp CONVERGING (not converged).
food-economy untouched (sibling loop B lane).
