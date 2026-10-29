# Loop B round 1930Z — food-economy (coordinator evidence)

Run: fleshout-loop-b-20261029T1930Z. Axis: food-economy (second axis;
Loop A live on scale-onramp at run start and throughout — 2019Z claim
allydpr/w5ready, NOT touched; A landed both its arms mid-run as
ee0ecab4f/c1ac35db4 + 647cd67b6/4c9cd9d6e, zero overlap with this
run's files).

## Pre-flight + stale-claim recovery (run start, 19:38Z)

- Main tree clean, disk 18%, reaper removed nothing (4 active trees;
  stale B trees nighttravel-bank/verdict + creekpath-armc carry
  uncommitted changes — left alone, reaper refuses them; journey2-social
  is another loop's live tree).
- No Loop B lock existed. A live claim file for Loop A 1715Z
  (tilejoin/fullseat) was still present, but its arms had already been
  landed by the A adoption run 1915Z (commits 5618cb543 + 5a9f7579e,
  coordinator evidence 1445c59db), and no A lock or A worktree existed
  at 19:38Z. The 1715Z claim was therefore a stale orphan, not a live
  claim: retired to `.DEAD` with a `.DEAD.note` explaining the landing,
  so it cannot block future runs. B worked its own second axis,
  food-economy, and wrote its claim before any sims.
- Sibling landings moved master twice under this run (journey r66
  51fae4c91, then A's allydpr/w5ready). Both arm branches were rebased
  clean onto the new master (zero file overlap each time), proof
  re-runs green after each rebase, then merged --ff-only.

## Arm 1 — sim-lackingline2-b: INSUFFICIENT-DATA (killed at banking)

Backlog #1450 (lacking-line still unplayed, fourth run) + #1444.
Prereg d6432a65c (committed before the banking screen), evidence
30aeceb36. Proof re-run by coordinator post-rebase: 14/14 green.

Method (mandatory from the 1730Z next-run note): bank OFF-leg creek
episodes FIRST via the blockscreen2 method, then run the judged ON leg
on the banked episodes. No sequential-ON screening repeated, no bar
lowered.

- Banking screen (OFF legs, woodcarry3 driver unchanged, WOODCARRY=0,
  30d): 400 seeds screened sequentially (13400–13799), 11,945
  evenings, 77 travel-refused (34 creek, 43 other-refused), 0 errs,
  0 unclassified.
- Qualifiers: 7 in screen order — 13421, 13473, 13480, 13556, 13592,
  13703, 13714 — against the pre-registered 8-seed floor. The cap
  (400 seeds) was hit one qualifier short, so NO judged ON leg was run:
  running a 7-seed "confirm" would have violated both the prereg and
  the never-below-8 rule. The bar was never lowered, no post-hoc seeds
  added, no refusal faked.
- Yield lesson (new finding, not chased): 7/400 = 1.75% banking yield.
  At that rate 8 qualifiers need ~460 seeds and 12 need ~700 (~55 min).
  The woodcarry3 band's rich yield was a selected band's yield, not a
  population rate. Future banking preregs must size caps to this rate
  or bank on a sharper trait.
- OFF data sharpens the hunt: every OFF creek evening holds wood 0
  (competent play never packs road wood without the lever), while
  kcal < 60 and ticks < 96 DO bind OFF — including ticks-short
  first-episode evenings (95, 45, 46). Ticks is the one gate the lever
  does not fix, so a ticks-short ON evening is the most plausible
  still-refused route; the carry-skip chain and out-of-reach preludes
  (297 such evenings on this screen) are the other honest routes.
  Full next-run designs are in the arm evidence's next-run note.
- Reachability verdict: the lacking-line is still unplayed after FIVE
  runs. #1450 stays OPEN.
- Zero src/js change, zero policy change, zero default flip.
  Corpus: evidence/2026-10-29/sim-lackingline2-b-bank-census.json +
  sim-lackingline2-b-corpus-off/ (7 seeds).

## Arm 2 — sim-raidguard-b: GO-REMOVE (guard proven unreachable)

Backlog #1451 residual (1) only (residuals 2–3 noted, not chased).
Prereg f67a04f25 (before any judged leg), proof 52026e0c5, removal
d8000e47b, evidence 49800aabd. Coordinator proof re-run post-rebase:
21 pass, 0 fail, 1 SKIP (the G1c fixture leg, see ruling below).
`node --check` on src/js/game.js clean.

Question: the raid-aftermath guard ("already fell to the raid…")
fired 0 times on the raidname band. Answer: the case cannot occur.

- Seating gates (pre-removal game.js, traced): the candidate filter
  refuses hp 0/negative/NaN roster villagers, and tbHumanFighter —
  the ONLY villager-seating path — returns null for dead-flagged,
  hp <= 0, or non-finite hp villagers. Both desync directions covered.
- No-damage interval between fighter construction and the snapshot:
  tbPlaceHumans only repositions/removes; monster-batch-2 touches
  monster fighters only; villageEvent/observe/beginApexHunt/
  identifyMonster/removeWorldMonster touch no fighter hp.
- Snapshot timing: the snapshot is a materialized name list taken
  before the opening turns, so opening-turn deaths cannot populate it
  — in node and in browser (same synchronous call).
- Firing-case attempt failed at the seating gate as predicted:
  same-seed 515011, healthy run seats 2 villagers, 0-HP run seats 0,
  raid line still fires (pending shadow armed), aftermath absent.
- Neutrality: guard-removed corpora deep-equal guard-present `-on`
  corpora on ALL recorded fields including say, 16/16 files
  (band 10710–10725, 30d, same substrate/policy as raidname; pilot
  move counts match raidname exactly). 0 aftermath lines in both
  corpora. check.js --quick: 284 passed / 6 failed, failing set
  identical name-for-name to raidname's recorded base (all
  pre-existing); "quick green" is unachievable on this base and is
  not claimed.
- Sense: the flagship 10713/28 tail in the removed corpus is
  line-for-line identical to the guard-present tail (Rasha falls in
  the opening exchange, raid line names the fight, no aftermath line).
  No [needs-eyes] on the removal — no player-visible text changes
  anywhere (the removed line never fired on any corpus).
- Removal (src/js/game.js only): snapshot computation + aftermath say
  deleted, raid line untouched, with a do-not-re-add comment citing
  the proof. Narration-dead-code removal, no mechanism/balance change.

### Coordinator ruling on the G1c judgment call (explicit)

The worker flagged: its prereg fixture formulation (a 1-HP villager
dying in opening turns) could NOT be staged — 30 seeds ×
bulldozer/hummice plus a 6-run hushwolf probe produced zero
opening-turn villager deaths (bulldozer speed 3 < player 4, so it
never gets opening turns). T3 reports SKIP, not a pass. The worker
offered: if the coordinator reads G1c as fixture-only, the verdict
falls to NO-GO and the removal should not merge.

RULING: GO-REMOVE stands. The SKIP is a fixture-staging limitation,
not a gap in the conclusion, for three reasons stated here so the
call can be overruled with eyes open: (1) the seating gates — the
actual premise of the guard — WERE demonstrated by fixture (0 HP
seats 0 fighters); (2) the timing proposition the fixture leg was
meant to test (opening-turn deaths populating the snapshot) is
refuted by construction (snapshot materialized before opening
turns) AND by the corpus witnesses, which are the stronger test of
that exact proposition on real fights — Willie, s10711 creation#2
day 8, hp −2; Rasha, s10713 creation#2 day 28, hp −11; both in
raid-line fights with no aftermath line; (3) removal neutrality is
16/16 deep-equal including say fields. The SKIP stays recorded in
the proof (21 pass / 1 SKIP), not hidden, and the do-not-re-add
comment requires a firing case before any restoration.

## Wall numbers (bands, NOT movement)

Both arms ran 30-day legs: national / table / wins NOT OBSERVABLE,
reported not claimed. Wave 4–5 reach 0 on both bands. Raidguard band:
all 16 survived to day 30. Lackingline2 band: 11 lost of 400 villages
over 30 days (banking screen, not a band result). No wall movement is
claimed from this run: one measurement arm returned no judged band,
one narration-dead-code removal is trajectory-neutral by proof.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'<corpus-glob>' --metrics national,table,wins,exiled`, run on both
corpora: 3 LOUD lines each (national 12→0, table 16→0, wins 16→0);
exiled clean. This is the KNOWN WINSEAT-baseline vs pre-seat regime
artifact, same as the 1615Z/1630Z/1730Z rounds — 30-day legs where
the wall metrics are not observable, not a regression. Baseline NOT
rolled. No same-run investigation item beyond this note.

## Village assessment (plain words)

Four hundred villages, thirty days each, eleven lost. Almost every
night is spent inside; the nights out are mostly out-of-reach nights
where the player never tries the walk home. Creek strandings touched
only seven villages in four hundred — one crossing that won't let
the player through, night after night for two to eight nights, while
the village goes on without them and the stranded villager goes
hungry, down to nothing on the longest episodes. The stranded
evenings read as lived days (a creek survey for an elder, meeting
Isabella by name, a Speedbump counter learned from Aroha, gossip by
the fire), ending on the engine's honest refusal line — but nothing
marks the night away. What was missing every stranded night was four
logs in the pack, which the lever supplies; whether the game ever
still says so out loud remains unproven after five runs. The raid
story, meanwhile, got one dead sentence removed: a line about
defenders who "already fell" that the engine could never truthfully
say, because the people it names can never be seated in the fight
it describes.

## Metric review

- Lackingline2: the prereg bound the run correctly — the 8-seed
  floor held and the run died honestly at banking instead of
  producing a 7-seed verdict. The metric that proved wrong was the
  BANKING BUDGET, not the verdict bar: the 400-seed cap was sized
  from the selected woodcarry3 band's yield, not a population rate.
  Revision for the NEXT run (not this one): size banking caps from
  the measured 1.75% rate (~460 seeds for 8, ~700 for 12), or bank on
  a sharper trait (ticks-short first episodes). The min-n bar itself
  is NOT revised.
- Raidguard: the prereg's fixture-only G1c formulation proved
  unstageable; the corpus-witness substitute is accepted above as
  the stronger test of the same proposition. Next DIAG preregs
  should name corpus witnesses as a first-class leg alongside
  fixtures, not as a fallback.
- check.js --quick on this base cannot go green (6 pre-existing
  failures); arm gates rest on proof suites + base-vs-changed
  failing-set comparison, same call as the 1730Z round.

## Infrastructure

- Safe-commit index clobber struck the raidguard worker's commits
  (repaired each time via HEAD-blob cacheinfo, verified); it did NOT
  strike this coordinator's merge path — main-tree `git status`
  empty + `git diff HEAD` empty verified after each merge and after
  this evidence commit.
- No EPERM flap this run. No check.js --quick at coordinator level
  (arm 1 zero src/js; arm 2 gated by its proof suite + failing-set
  comparison).
- Loop A 2019Z lock + claim still live at this run's closeout (A in
  its own closeout after landing both arms) — NOT touched.

## Landing

Merged locally, pending ship. No push, no version bump, no live
verification (ship loop owns deploys). Commits on master:
d6432a65c + 30aeceb36 (lackingline2), f67a04f25 + 52026e0c5 +
d8000e47b + 49800aabd (raidguard), plus this coordinator evidence
commit. Claim retired to .DEAD; lock deleted at closeout.
