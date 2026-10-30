# sim-scale-onramp-round-0738 — scholar-melt split + spawn-HP census

Run: flesh-out loop, run fleshout-20261030T0738Z. Axis: scale-onramp
(blocking axis, converging, NOT converged). Sibling loop B live on
food-economy the whole run (0730Z claim: warmthrestraint +
woodshortline) — NOT touched. This run worked scale-onramp, taking
the 0641Z run's ranked-next items in order: the scholar tb-combat
melt split (recurrence finding #1) and the spawn-HP variance census
(recurrence + chainclose finding). Not another fight-price arm, not
a damage buff, not a gate move.

Both arms DIAG ONLY, measurement only, zero src/js game changes, no
default flip, no gate move, no deed-bar move. Merged locally,
pending ship. No push, no version bump, no live verification (the
batch ship job owns deploys).

## Pre-registration (binding, per arm)

- sim-spawnhp-a: prereg cc566d24e (rebased; worker commits
  0edbdcb6e/0ea9d2644 pre-rebase) + pre-sweep SPAWN-VARIANCE
  correction, committed BEFORE any judged analysis. Primary metric:
  opening-HP census of every wild wave-4 individual on the band.
  GO bars: prereg before judged analysis, 16/16 valid seeds, every
  wave-4 individual carries an opening-HP row with provenance
  class, 0 UNCLASSIFIED provenance among the 3 below-floor cases
  or an honest undetermined verdict with the missing instrument
  named, determinism gate (1 seed byte-identical), sense bar.
  Horizon 180d death-aware; seeds 75101–75116; substrate
  tableseat-nowait exactly as chainclose used it (verified from
  chainclose's sweep; 16/16 rows byte-identical).
- sim-scholarmelt-a: prereg db4cd8f55 (rebased; worker commits
  a54df4fbe/5701bc0a4 pre-rebase) + correction #2 (recorder fix,
  not a re-score), committed BEFORE any judged analysis. Primary
  metric: fate classification of every scholar tb-combat on the
  band, with the 4 BEAST-VANISHED chains resolved. GO bars:
  prereg before judged analysis, 16/16 valid seeds, recorder
  covers all scholar tb-combats, 0 UNCLASSIFIED among the 4
  vanished chains, determinism gate, sense bar. Same band,
  horizon, and substrate as spawnhp (16/16 rows + census
  byte-identical to chainclose/recurrence).

## Arm 1 — sim-spawnhp-a: DIAG-GO (LANDED)

Commits (rebased onto 57a0fc000, fixtures re-run green
post-rebase, merged --ff-only): prereg cc566d24e, instruments
4a8938ccc, evidence ee3be4fc5. Proof on merged master:
scripts/test-spawnhp-a.js FIXTURES-PASS 33/33. Determinism:
seed 75102 re-ran byte-identical (row + census), scratch
removed. Sense: 4/4 below-floor transcripts read — all read as
fights against already-wounded beasts, with no meeting-time
narration of the wall wound.

Plain words: wild wave-4 beasts do NOT spawn with varying HP.
Every wild entity spawns at exactly its type's floor. What
varies is arrival HP, because the world wounds beasts before
first contact. The wound behind all three mysteries is the raid
palisade toll: a drafted world monster moved to a palisaded
haven loses 25% of max HP — 1100→825, 900→675, 850→637
(212.5 rounds up to 213). The alienPlayers ~2906 lead is
refuted as a spawn explanation: that line is beam damage inside
an existing tb fight, never a spawn, and 0.75 sits outside its
0.9–1.1 band anyway.

Per-type opening-HP table (wild individuals, never meetings;
10 total): audit n=4, 825–1100, mean 1022.75, all maxHp 1100
(wound variance, not spawn variance); algorithm 1000 (n=1),
eulogy 900 (n=1), herald 700 (n=1), reunion 1200 (n=2), suburb
1300 (n=1) — all INSUFFICIENT-DATA for a variance claim alone.
No wild individual opened above its floor. Provenance counts:
SPAWN-HP 5, WOUNDED-IN-CORPUS 1, OFF-CORPUS-WOUNDED 1,
AT-FLOOR-OR-ABOVE 3, SPAWN-VARIANCE 0, UNDETERMINED 0.

The 3 provenance verdicts (all reproduced exactly):
- 75113 eulogy 675 (raid d136) — OFF-CORPUS-WOUNDED, same-day
  draft toll (d116+ entity, 900 through d135–136, drafted d136
  toll→675, fought 17 dealt, d137 census 658 = toll 225 +
  fight 17). Analyzer's first cited sighting (d112) corrected
  in evidence: that entity is a different beast (tolled d113,
  then vanished with no meeting). Class unchanged.
- 75116 audit 825 (wild d139) — OFF-CORPUS-WOUNDED, pre-sighting
  draft toll. Census never shows it at 1100; first sighting
  d133 already 825/1100, pinned at (4,4) 7 days (lingering-
  raider signature) before the wild meeting. Draft day
  pre-d133 cannot be dated from this corpus.
- 75113 influencer 637 (raid d127) — OFF-CORPUS-WOUNDED,
  same-day draft toll. Census shows it only d126–127 at full
  850; d127 morning snapshot still 850, fight opens 637.

Supporting census: 0/44 unmet streaks with maxHp below floor;
18 pure toll-shaped adjacent-day drops band-wide (exact toll
amount + (4,4) pin, no meeting); 3 unexplained (4,4) drops with
no recorded meeting (suburb 975→872, reunion 900→745,
algorithm 750→624) — these feed the scholarmelt follow-up.
Caveats: corpus records no havenTier (palisade inferred from
toll signature) and no entity IDs (trajectory continuity is
hp+tile+day adjacency). Spawn-variance: CLOSED on this band —
do not re-run; assume floor spawn and price wounds.

## Arm 2 — sim-scholarmelt-a: DIAG-NO-GO (LANDED, honest fail)

Commits (rebased onto 53bc8ecef, fixtures re-run green
post-rebase, merged --ff-only): prereg db4cd8f55, correction
b094b7296, instruments bf5c6a151, correction #2 c0ea2c8d3,
xcheck fix 5969d616e, evidence cb7cb2f10. Proof on merged
master: scripts/test-scholarmelt-a.js FIXTURES-PASS 44/44.
Determinism: seed 75102 row + census byte-identical, scratch
removed. Sense: all 10 villager logs read end to end + matched
scholar traces + near-misses; no villager story removes any
beast — all end fleeing or dead with the beast standing.

Plain words: the scholar melt sink is real but explains only
1 of the 4 vanished chains. Band scholar tb-combat census
(427 fights): SCHOLAR-KILL 182, SCHOLAR-FLEE-MELT 63,
SPAWN-ENDED 70, SCHOLAR-RESTORED 87, BYSTANDER-OR-NONMONSTER
22, UNCLASSIFIED 3. Wave-4 melts 15; wild non-titan
non-lingerer melts 38. The classification leg fails on the
prereg's own terms (3 orphan UNCLASSIFIED + 3 of 4 chains
INSUFFICIENT-DATA) and is reported as a fail, not softened.

The 4 vanished chains:
- s75116 audit — SCHOLAR-FLEE-MELT (judged). Chain d139, 785
  HP: villagers wound 825→785, Miguel flees at 1 HP, beast
  stands. Matched fightSeq 21, d140, tile (4,4), wild, lift
  785, lifted, fighter 785→661 alive, scholar 100→−17 (died),
  result lost, no restore. Exactly one audit scholar fight
  exists on s75116, so the match is unambiguous.
- s75102 algorithm — INSUFFICIENT-DATA (same-day candidate,
  unjudged). Candidate fightSeq 21, d71 (same day as last
  meeting), lift 959 at (4,4), wild, lifted, fighter 959→957
  alive, scholar 100→−15, lost, no restore — melt in form.
  Prereg requires dayStart strictly after lastDay; widening
  mid-run would be re-scoring (§14). A next-run prereg with a
  same-day window + part-stamped ordering resolves it.
- s75102 eulogy — INSUFFICIENT-DATA. Census (eulogy, 853):
  present d57–61 at (4,4), gone d62. Only s75102 eulogy
  scholar fight is seq 17, d62: bystander lift 146 HP,
  routed, different fighter at 962 HP fled — near-miss, not
  the 853 instance. No scholar fight vs the 853 instance.
- s75116 suburb — INSUFFICIENT-DATA. Villager log d140:
  Miguel strikes once (1300→1285) and dies; beast stands,
  roams census d141–158, gone d159. Suburb scholar fights are
  different instances (seq 18 d128 wild 975 melt, pre-chain;
  seq 23 d159 lingering 960 melt — hp-mismatch near-miss).
  No scholar fight vs the 1285 instance.

Instrument lesson (correction #2, not a re-score): the first
sweep left 78 UNCLASSIFIED — 75 herald fights dissolved inside
startCombat with lift fields unfilled. The recorder now records
post-start world presence for over/null fights; dissolved
classification is restored-first. Re-run: 120 dissolved rows,
all herald — 75 SCHOLAR-RESTORED (identity back at flush),
45 SPAWN-ENDED, 0 dissolved melts. Never read a dissolved
result as a melt without a post-end identity check.

Transcript limitation, stated plainly: node-sim stubs Game.say
to no-op without narration (not enabled, to preserve the
substrate), so scholar fights have no say transcript; evidence
is the structured trace (lift snapshot, fighter HP path,
result, post-end world check). Villager w4dpr logs are
engine-internal and were read.

Ranked next (NOT this run's work): (1) unexplained-removal
census + stalker-tick recorder — 2 chains vanish with no
scholar fight and no villager story; strongest code candidate
lostSight > 6 → removeWorldMonster (game.js ~23158), plus
fledMonsters bolt/gave-up (~23375–23380), glasswing trap
vanish (23108), curious fade (23264), titan-fall cleanup
(titans.js:1197). (2) Same-day matching window with
part-stamped ordering (resolves algorithm under a next-run
prereg). (3) Roster identification for unknown-wave rows
(123/427 fights, 29%, carry non-roster primary ids).
(4) Empty-fighter orphan tbEnds (3) — pin the tbEnd call site.
(5) Audit census-timing documentation — snapshots capture
pre-meeting state (d140 fight instance absent from the d140
snapshot); snapshot day labels must not be read as end-of-day
state without a phase note.

## Wall numbers (this run's judged corpora, report-only)

Both bands substrate-identical to chainclose, so the wall
numbers re-confirm rather than move: wins 9/16 (all lesser,
full 0), national ever 13/16, final 11/16, table 12/16,
entered 9/16, wave reach 16/16/14/9/0, median survival 118d,
deaths 527. Telemetry check vs scale-wall baseline: quiet
(16 seed rows, 0 non-row files skipped, 4 metrics, no large
deviations) — baseline NOT rolled forward; nothing deviated.

## Reachability verdict

Waves 1–4 reachable; wave 5 unreachable on this band (0/16);
the table reachable only through the lesser seat via
default-OFF instruments (entered 9/16); the full seat
unreached; wins only lesser, only via those instruments. The
two measurements narrow the wall rather than moving it:
beasts arrive wounded (toll, not spawn variance) and mostly
do not vanish through the scholar — one chain does, two
vanish with no story at all, one waits on a same-day window.

## Village assessment (plain words)

The village in this band meets beasts that are already hurt
by a wall the villagers never see: a beast drafted to a
palisaded haven comes back 25% weaker, and nobody in the
story says so. When a beast survives a meeting, it usually
does not get hunted down — one was finished off in a
scholar's turn-based fight the day after, but two simply
stop being there, with no fight and no story, and the
fourth can only be explained if same-day scholar fights
count. The village's hardest beasts are not mysterious in
their strength — they spawn at a fixed floor — but their
comings and goings still are: wounded arrivals, silent
disappearances, and a census whose day labels run a phase
ahead of the fights. That is the next measurement's job,
not a lever's.

## Metric review

Both preregs bound their runs and were honored: spawnhp met
every bar (DIAG-GO); scholarmelt's classification bar failed
on its own terms and the verdict stands as DIAG-NO-GO — the
same-day algorithm candidate was NOT promoted, the 3 orphan
tbEnds were NOT classified by fiat. No metric was re-scored
mid-run. Proposed for the NEXT run only: a same-day matching
window with part-stamped ordering in the melt prereg, and a
census-phase note in every sweep header (snapshot day =
pre-meeting state). The 427-fight census and the 10-individual
spawn census are the baselines for those preregs.

## Convergence state

scale-onramp: converging, NOT converged. Full seat 0, wave 5 0
on this band, as on every band this cycle. No axis is
converged. No gate number was moved on this evidence, per the
2026-10-29 gate-sequencing note (prove behavior normal before
tuning gates to it).
