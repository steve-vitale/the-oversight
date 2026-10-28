# sim-scale-onramp round 0527 — run fleshout-20261028T0527Z (axis scale-onramp — 1 game fix LANDED + 1 audit GO + 1 measurement NO-GO, merged locally pending ship)

Run-start guard: no lock file, no live lever-claim (all prior claims .DEAD);
sibling loop-B trees untouched (journey2-crisis, panel-contract-rulings,
sim-caughtlift-b). Pre-flight: main tree clean (0 lines), disk 16%,
worktree-reap safe (only the two sibling dirty trees preserved, untouched).
Lock + claim written before any sims (claim: axis scale-onramp, arms
sim-lingerer-vis-a / sim-w4tbkill-a / sim-fighterconstruct-a). This run
took the tracker's scale-onramp blanks in order from round 0416: (1)
visibility for toll-wounded lingerers, (2) a KILL-judged arm on the TB
half of the conversion split, (3) the fighter-construction footnote
audit (#1301). The TABLE sysBond doc/code gap (#1304) was NOT taken and
stays open.

Shared substrate, VERBATIM from sim-w4convert-a: seeds 75101–75108,
LEANLINKRESCUE=1, TABLESEATNOWAIT=1, 180d death-aware, full env set plus
a substrate-activation gate (courtship counters non-zero). No arm
re-scored a prior arm's verdict or corpus.

## Pre-registration (binding, per arm)

Each arm committed its prereg before any judged sweep (see arm evidence).
All three detgates passed on the prior-base numbers exactly (75101:
132/132 days, tsNationalDay 77) — no base-drift amendment was needed on
any arm, and no arm forced an old number.

## Arm 1 — sim-fighterconstruct-a (backlog #1301, MEASUREMENT ONLY) — GO

Commits: prereg 12d88c056, instruments + corpus 351e9c436, evidence
dad6b89ad (rebased onto 3604b3e43 clean; coordinator proof re-run on the
rebased checkout: VERDICT-MECHANICAL PASS, parity exact on all 8 seeds
x 13 checks). Zero src/js changes, zero tableseat-nowait changes.
Footnote CLOSED: monsters are built fresh. The two below-max monster TB
starts are opening-turn villager strikes, not fighter construction —
75102 d166 audit 1140/1211 (deficit 71 = Gabriela 48 + Elena 23, residual
0, construction 1211/1211) and 75106 d143 audit 1268/1298 (deficit 30 =
Dihya 30, residual 0, construction 1298/1298). Construction-below-max
rows: 0/36 fighters. All other candidate inputs tested and refuted
(def roll sets hp == maxHp; veteran ruled out; overtime fraction-neutral
with 5 scaled fights at hp == maxHp; world leakage refuted numerically;
rounding integers; no fear_aura/pocket_sand events). Discriminator: the
only 2 fighter rows on the band with a villager ordered before the
player are exactly the 2 below-max rows. Corrected sentence for future
arms: "The monster is always built fresh, and its start snapshot is
full except when a faster villager strikes it during the opening
turns — 2/28 fights on this band, both explained."
Evidence: evidence/2026-10-28/sim-fighterconstruct-a.md (+ prereg),
corpus perseed-fighterconstruct-a/, instruments
scripts/policies/fighterconstruct-diag.js + scripts/test-fighterconstruct*.js.
Findings carried (not re-judged here): part of w4convert's "TB scales
the monster up" reading was pre-fight overtime scaling at start, not
in-fight growth (75103 d178 suburb start already 3688/3688 =
construction 1475 x2.5 overtime) — a future arm can separate the two
with this corpus's construction -> start -> end join; and both traced
fights have the scholar at speed 1 (burdened), going last — whether
burden routinely ordering villagers ahead of the scholar is intended
is a design question.

## Arm 2 — sim-lingerer-vis-a (tracker blank 1, MEASUREMENT ONLY) — NO-GO for landing

Commits: prereg fc8dac702, instruments 29b07a43a, evidence 71bcce40a
(rebased onto dad6b89ad clean; coordinator proof re-run with the parity
dir: exit 0, parity exact vs wallwounds-after, engagement delta 0,
finish delta 0; one coordinator re-run without the parity arg dropped
the parity leg — re-run WITH the parity dir before judging, disclosed
here so the next coordinator does not repeat the omission). The
visibility change (one clause appended to the linger-birth line in
havenGrowth.js, gated on palisade + post-toll hp < maxHp, village
language only) was REVERTED byte-clean: zero src diff against base,
including havenGrowth.js, verified by the coordinator.
Judgment: beat fires PASS (14 clause lines armed sense replay vs 0
control; wall-less d8 lingerer honestly gets no clause); engagement
delta FAIL, the deciding leg (engaged 36 vs 36, finished 11 vs 11, all
8 row files byte-identical control vs armed); cost bar PASS
(starvation 2 vs 2, median 162d both); substrate gate PASS (courtship
121, 8/8 active both bands). Acting-policy check done first: the only
lingerer-answering policy (gorgedrive) wraps leadfeast, never
tableseat-nowait, reads HP directly, and is not wound-selective; no
policy calls answerLingerer('sortie') (sortie fieldFights 0) and no
policy parses narration (say() is output-only). Census highlight (both
bands identical): 40 toll-wounded lingerer instances, 36 engaged, 11
finished — ALL 11 finishes are scholar TB wins; villager field finishes
0/40 despite 37 field + 37 resolve event rows; 4 never-engaged (incl.
75103 seq 46 terms_of_service: 52 days at the treeline unengaged); 25
engaged-but-unfinished = the next arm's pool. Named next blank:
wound-selective lingerer finishing composed with this substrate
(gorgedrive over tableseat-nowait with wounded-first targeting, or a
sortie-answering policy), judged on finishes against this 40/36/11
control. The visibility sentence may be re-proposed WITH such a
policy, judged from scratch, never carried on this arm's firing proof.
Evidence: evidence/2026-10-28/sim-lingerer-vis-a.md (+ prereg),
corpus perseed-lingerer-vis-a/ (control/ + armed/), instruments
scripts/test-lingerer-vis*.js. check.js --quick on the arm: 279
passed, 8 failed — a subset of wallwounds' proven pre-existing 9;
game code is reverted to base, so none can be this arm's.

## Arm 3 — sim-w4tbkill-a (tracker blank 2, TB half, KILL-JUDGED) — GO, phase B

Commits: prereg b674d8194, phase-B game change fa3516cc1
([needs-eyes] — a fight-feel change; the ship loop fast-tracks flagged
batches), instruments d52ae8127, evidence 7ef158448 (rebased onto
71bcce40a clean; coordinator proofs on the rebased checkout:
test-w4tbkill-rule.js 8/8, test-w4tbkill-worldhp.js 7/7, node --check
clean on game.js, analyzer control vs phase B GO reproduced exactly,
and a FRESH single-seed 75102 phase-B re-run byte-identical to the
committed phase-B row ignoring the generated timestamp, including the
day-172 kill).
Phase A (policy-side engagement discipline, W4TBKILL policy) is NO-GO
as a kill lever and is the prereg's documented proof that policy alone
cannot move the needle: lost 25 -> 10, fled 0 -> 19, scholar deaths in
wave-4 fights 28 -> 10, but kills still 0, won fights still 0. No
confirm band was spent on it, per prereg.
Phase B (game change, src/js/game.js only, +35 lines added, none
removed): a lifted world monster's PRIMARY TB fighter now enters at
the monster's world HP/maxHP (tbWorldHpFor helper + wave-4+-gated
primary-fighter use in startCombat). Veterans excluded (veteran +50%
HP is canon hardening, not baked into world HP); bystanders,
packmates/crew roll as before; meeting/spawn rates, wave unlocks,
gating, and all base stats untouched. Scope leak caught by the detgate
before any judged sweep: the first phase-B version applied to all
waves and moved 75101 from 132 days to 180 with no seat; gating the
call site to wave 4+ restored 132/132 exactly on all three detgates.
The ungated version never ran a judged sweep and never landed.
Verdict legs: kills phase B 1 vs control 0; won wave-4 TB fights 1 vs
0; starvation 2 vs 2 (bar control+2); median 146 vs 162 days = 0.90x
(bar 0.8x); substrate gate passes both bands (courtship 121/121, 8/8
active); recorder errors 0 on every row, no overflow. World-origin
wave-4 TB fights: control 25 lost / 0 fled; phase A 10 lost / 19 fled;
phase B 1 won / 22 lost. The kill: seed 75102 day 172, a lingering
reunion chipped across four meetings (300 -> 171 -> 120 -> won solo,
scholar ending 35/100). The killer (Olivia Bennett) did not survive
the run, so this is NOT a veterans-bar opening — reported as such,
not inflated. Construction check: 20/23 phase-B world fights entered
at exactly map HP; the 3 exceptions are all below their monster's
range floor (world-derived from a same-kind sibling, not fresh rolls
— the alias-by-kind edge, disclosed in arm evidence). No titan fight
was altered on this band. check.js --quick on the arm: 279 passed, 8
failed; none of the 8 concerns wave-4 fighter construction (left for
their owners, documented in arm evidence).
Evidence: evidence/2026-10-28/sim-w4tbkill-a.md (+ prereg), corpora
perseed-w4tbkill-control/ + perseed-w4tbkill-a/ + perseed-w4tbkill-b/,
instruments scripts/policies/w4tbkill.js + scripts/test-w4tbkill*.js.

## Wall (this band only, never pooled — all three arms agree on control)

| band | national ever/final | table shown/entered | wins lesser/full | wave-4 | wave-5 | median | starvation | w4 kills | won TB |
|---|---|---|---|---|---|---|---|---|---|
| control | 7/8, 5/8 | 6/8, 3/8 | 3 (3/0) | 5/8 | 0/8 | 162d | 2 | 0 | 0 |
| w4tbkill phase A | 7/8, 7/8 | 4/8, 4/8 | 4 (4/0) | 5/8 | 0/8 | 162d | 1 | 0 | 0 |
| w4tbkill phase B | 7/8, 6/8 | 6/8, 4/8 | 4 (4/0) | 5/8 | 0/8 | 146d | 2 | 1 | 1 |

The scale wall moved in one honest respect this run: a wave-4 monster
can now be killed on this substrate, because the fight finally
remembers the world's wounds. It did not move on reach: the full seat
stays 0/8, wave 5 stays 0/8, and the one kill did not open the veterans
bar (the killer died). Visibility alone moved nothing.

## Village assessment (plain words)

The village on this band is a competent, courtship-active village that
reaches national standing more often than not, sits at the lesser
table about a third of the time, and wins there. What changed this run
is narrow and real: a monster the village has already battered outside
no longer walks into its fight at full strength, and on one seed that
was exactly enough — a reunion worn down across four meetings finally
fell to a scholar who ended the fight at 35 health. What did not
change is just as plain: naming a wounded monster at the treeline does
not make anyone go and finish it, because nothing in the village's
routines answers a wounded lingerer — all eleven finishes on the
visibility band were the scholar's fights, never a villager walking
out to finish one. The next work is a finishing routine, not another
sentence — and the full seat and wave 5 are still untouched by any of
it.

## Metric review

Pre-registered metrics bound every arm and were honored: fighterconstruct
GO on census completeness (unclassified 0); lingerer-vis NO-GO on its
own deciding leg (engagement delta 0, need >= +1) — a firing beat was
never re-scored as an engagement win; w4tbkill GO on a kill / won TB
fight (1 vs 0) with the cost bar, and phase A NO-GO as a lever on the
same rule. No metric was re-scored mid-run. The balanced-panel §15
exception stands (balance-panel.js has no corpus-ingest mode — the
standing limitation, same as prior rounds); paired before/after sweep
tables + exact parity are the substitute, and no panel artifact was
faked.

## Telemetry deviation check

Ran on the w4tbkill phase-B corpus (10 files): 3 LOUD lines (national
12 -> 0, table -62% 16 -> 6, wins 16 -> 0) — the known WINSEAT-baseline
vs tableseat-nowait-substrate regime mismatch plus per-seed field-shape
artifact class, identical to every census-family round. No exiled line.
Baseline NOT rolled.

## Infrastructure notes

- Registry-lock contention queued all three registrations (~60-100s
  each, waited out); no bypass.
- Safe-commit index clobber hit all worker commits (bogus staged
  deletions for files byte-identical to HEAD); repaired via HEAD-blob
  cacheinfo each time, commits verified correct. No clobber on the
  coordinator evidence commit (verified below).
- Master moved three times under the run before landing (sibling
  loop-B caughtlift + onceaday-scope, journey-scale r47,
  journey-succession r55) — zero file overlap with any arm except
  none; the only src/js file in the master delta (comms.js) is
  untouched by all three arms. Each arm was rebased onto the current
  master one at a time with proofs re-run, then merged ff-only,
  released, and removed before the next arm was touched (the 0416Z
  landing-incident lesson, applied).
- Coordinator proof corrections, disclosed: the lingerer analyzer
  must be run WITH its parity dir (without it the parity leg drops
  to null — caught and re-run correctly); the w4tbkill analyzer
  reads its corpora from EVID_CONTROL / EVID_PHASE env vars, not
  positional args (a positional run judged phase A again — caught
  and re-run correctly for phase B). Both corrections re-proved
  the workers' verdicts exactly; neither changed a corpus.
- Coordinator evidence commit verified: status empty, diff HEAD
  empty, hash-object matches (see closeout check).
- No EPERM flap this run. No push, no bump, no live verification
  (ship-loop line).

scale-onramp stays converging (NOT converged): a real lethality fix
landed and produced the substrate's first wave-4 kill, the fighter
footnote is closed, and visibility is measured negative — but the
full seat is still 0, wave 5 still unlocks nowhere, and one kill is
not a veterans bar. The directive stands until the tracker records
this axis converged on measured evidence. food-economy stays
converging (untouched; sibling B loop live). Rotation left at 3.
Claim deleted; lock deleted.

Next blanks, in order: (1) wound-selective lingerer finishing
composed with the tableseat-nowait substrate, judged on finishes
against the lingerer-vis 40/36/11 control; (2) the TABLE sysBond
doc/code gap (#1304); (3) separating pre-fight overtime scaling
from in-fight TB growth on the w4convert reading (fighterconstruct
corpus join); (4) whether a burdened scholar routinely going last
is intended.
