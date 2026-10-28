# sim-sortiedpr-a — SORTIE-DPR: mustered parties are not the killers (DIAG-GO)

Run: fleshout loop, run fleshout-20261028T2236Z (loop A). Axis: scale-onramp
(blocking axis, converging, NOT converged). Worker: sim-sortiedpr-a.
Task: the SORTIE-DPR measurement — the second-ranked next blank from run
fleshout-20261028T2115Z. Question: mustered parties may already be the
killers — measure, before building anything, what mustered/sortie parties
actually achieve in real sims on CURRENT MASTER. MEASUREMENT ONLY: zero
src/js, zero policy-default changes, zero use of the sibling tileparty
arm's branch.

Preregistration (binding, committed BEFORE any judged sweep):
evidence/2026-10-28/sim-sortiedpr-a-prereg.md (commit 16aa80eab).
Instruments: scripts/test-sortiedpr-a-sweep.js (AUTO + PLAYED bands),
scripts/test-sortiedpr-a.js (analyzer + judge),
scripts/test-sortiedpr-a-sense.js (sense replay) — commit bd71ece75,
plus an analyzer honesty fix (joined/ally fields reported UNKNOWN, never
0, when the recorder does not carry them) in the corpus commit below.
Corpus: evidence/2026-10-28/perseed-sortiedpr-a/ (auto/ 8 rows + summary,
played/ 16 rows + summary). Analyzer re-run green after every step
(exit 0); `node --check` clean on all three scripts.

## Plain words first

Mustered parties are not the killers. When a village actually sends a
sortie — three fighters named, rations priced, marching to its own
treeline — the party kills broken beasts and only broken beasts. Across
60 sortie fights, the party deals a median 16 damage a round, against a
kill band of 57–80 a round for a fresh wave-4 beast. Every kill in the
corpus is a beast that started at 64 HP or less: 30 of 35 kills started
at 1 HP, and the other five started at 22–64 HP. Every
fight against a healthy beast (12 fights, 91 HP and up) ends the same
way: the party flees, the leader dies, or the beast walks off — zero
kills. Against wave-4 beasts specifically (7 fights), the party never
kills, never drives off: 3 flights, 4 dead leaders. And the muster
itself overstates the fight: a party of three fights as one leader
plus, only sometimes, one joined ally — the ally joined in just 8 of 60
fights and dealt 2.2% of all sortie damage. The third mustered fighter
never appears in a fight log at all. So the sortie is a real village
act with a real price (176,714 kcal in rations, 6 dead leaders), and
it finishes what is already broken — it does not take a healthy beast,
and its damage rate is roughly a quarter of what a wave-4 kill needs.

## Definition (as pre-registered, before counting)

- MUSTERED/SORTIE PARTY: a fieldFight whose stack caller class is
  'sortie' (havenGrowth.lingererSortie: _musterAway(3,'defense'), rations
  paid, cornered fight at the home treeline). MUSTERED SIZE =
  engineAllies + 1. JOINED FIGHTERS = 1 + (joinedAllyVid ? 1 : 0) — the
  engine fights leader + at most ONE joined ally (allyFromStart is NOT
  set by lingererSortie; an ally joins only via the hopeless shout).
- SUSTAINED PARTY DPR = mDealt / rounds (rounds >= 1; mDealt = all party
  damage: leader + joined-ally + volley + abilities). Ally share =
  allyDealt / rounds. Round-0 fights are one-shot events, excluded from
  sustained DPR (there were none: all 60 fights had rounds >= 1).
- KILL vs DRIVE-OFF: drive-off does NOT count as a kill. Reported
  separately throughout. Aid fights (allyFromStart) are contrast only,
  never pooled. VillageAgency raid-defense musters are flat rolls, not
  fieldFights — excluded by construction.

## Bands (identical seeds, same substrate, base code)

Substrate (both bands, VERBATIM): tableseat-nowait, LEANLINKRESCUE=1,
TABLESEATNOWAIT=1, 180d death-aware, fieldparty-form-diag recorder
VERBATIM + this arm's say/answerLingerer opportunity counters (r50
method; recorder-only).
- AUTO (autonomous, 8 seeds 75101-75108): NO sortie-answering layer.
- PLAYED (played sorties, 16 seeds 75101-75116): tableseat-nowait + a
  sortie-driver layer living ONLY in the sweep script (never a policy
  default): once per lingerer episode, when a gorge line has been seen
  for it, call answerLingerer('sortie'). NO HP GATE (unlike
  partyfinish's min<=80/sum<=300 gate): DPR is measured against the
  real lingerer population, healthy beasts included. The engine's own
  gates still apply (no-fighters return; rations paid).
- Pilot (8 seeds, both bands) populated the measurement (37 PLAYED
  sortie fights, threshold 10), so confirm ran (PLAYED to 16 seeds).
  AUTO confirm was not run: pilot AUTO showed 0 sorties, and the
  prereg sends AUTO to confirm only if pilot AUTO shows any sortie.

## The autonomous finding (AUTO band, 8 seeds)

- Sortie fights: 0. AnswerLingerer calls: 0. Sortie attempts: 0.
- Opportunities present: 53 lingerer episodes, 46 gorge-seen, 183
  lingerer-days, 183 gorge nights. The absence is measured, not
  assumed: villages endure 183 gorge nights and never once march out
  on their own — no beat-answering policy exists on this substrate,
  and the engine never sorties by itself.
- AUTO wall (control replication, NOT movement): won 3/8 (all lesser,
  full 0/8), national ever 7/8, final 6/8, table invited 4/8, entered
  3/8, wave-4 6/8, wave-5 0/8, median 146d, starvation 1, deaths 286 —
  byte-for-byte the partyfinish baseline shape (won 3, median 146d,
  deaths 286). The substrate is the same game partyfinish measured.
- Aid fights on AUTO (contrast, never pooled): 41 meetings.

## The DPR measurement (PLAYED band, 16 seeds, judged corpus)

60 sortie fights, 45 sortie attempts, 112 episodes (100 gorge-seen,
100 sortied — every gorge-seen episode got its sortie; 12 episodes
never gorge-seen while tracked, so never sortied). 2 attempts failed
honestly with no-fighters (d145, d163 on seed 75105 — the bench bare
while an influencer at 619 HP and a gavel at 225 HP held the treeline;
the village could not answer a strong treeline at all).

Outcomes (kills and drive-offs separate, always):
KILL 35, DRIVE-OFF 13, FLED (vFlee) 6, DIED (vDie) 6,
EVADE 0, OTHER 0. Kill rate 35/60 (58%); drive-off rate 13/60 (22%).

Sustained DPR (mDealt/rounds, all 60 fights rounds >= 1):
median 16.0, q25 9.5, q75 23.0, min 0.0, max 59.0.
Leader share median 15.0/round; ally share median 0.0/round.
Total damage 1,540; ally damage 34 (2.2%).

Mustered vs joined (the gap the prereg demanded be reported):
mustered size 2: 21 fights, 3: 39 fights. Joined fighters 1: 52
fights, 2: 8 fights. Joined-ally rate 13% (8/60). In 52 of 60
fights the "party of three" fought as a solo leader.

Survival rounds by outcome: kills median 1 round (max 3); drive-offs
median 1 (max 4); fled median 3 (max 4); leader deaths median 2
(max 5). Fights that kill end in round 1 because the beast was
already broken; fights that last are the ones the party loses.

Cap-fit at median DPR 16.0: an 850-HP beast needs 53.1 rounds, an
1100-HP beast 68.8 rounds — both far over the 15-round cap. At the
75th percentile (23.0), still 37.0 / 47.8 rounds. Even the single
best sustained multi-round rate (36.3, reunion 900 HP, 3 rounds,
leader died) needs 23.4 rounds for 850 HP.

What sorties actually kill: 35 kills, median starting HP 1, max
starting HP 64 (a heckler). Kills by wave: w1 25, w2 9, w3 1, w4 0.
No kill of any beast starting above 64 HP anywhere in the corpus.

Healthy beasts (>= 91 HP, 12 fights): 0 kills, 1 drive-off
(gallowdeer 91, fled at 17 HP), 6 fled, 5 leader deaths. DPRs:
0, 0, 0, 0, 9.5, 13.7, 16.3, 17.8, 24.7, 25.8, 36.3, 58.0 (the 58
is a single round before the leader died). Median healthy-beast DPR
≈ 15. The healthy-beast fight is not a slower kill — it is a loss
or a flight.

Wave-4 sortie fights (7, the scale-wall slice): 0 kills, 0
drive-offs, 3 fled, 4 leader deaths:
- eulogy 675: 0 damage, fled round 1.
- eater 712: 0 damage, leader died round 2.
- influencer 406: 41 damage over 3 rounds, fled.
- eater 712: 58 damage round 1, leader died.
- reunion 900: 19 damage over 2 rounds, leader died.
- reunion 900: 109 damage over 3 rounds (36.3/round, the corpus's
  best sustained rate), leader died.
- reunion 900: 0 damage, fled round 2.
A wave-4 lingerer met by a mustered party is never killed and never
driven off in this corpus — it kills the leader or watches the
party run.

Zero-damage fights (13): the trick-spend rounds partyfinish named
(sanjun shout, spool wait, callback farewell, redactor redaction,
cliffhanger/sunback 1-HP holds) — rounds where the party's action
is consumed by the beast's counterplay and no damage lands. They are
part of the DPR distribution, not excluded from it: a party that
spends its round on a trick deals 0 that round, and the median
already includes that.

Price: 176,714 kcal in sortie rations across 45 attempts; 6 leader
deaths in sortie fights (vDie). NOTE (taxonomy, read carefully):
the PLAYED death-cause count 'villager:sortie combat' = 35 is the
MONSTER death records (registerDeath cause for the 35 killed
beasts), not villager deaths — villager sortie deaths are the 6
vDie fights. Total PLAYED deaths 606 vs AUTO 286 on different seed
counts (16 vs 8 seeds) — not a before/after comparison; the
pilot-8 PLAYED deaths were 299 vs AUTO 286 (+13; the pilot's
'sortie combat' cause count of 21 is monster deaths, per the caveat
above, so the villager sortie cost on pilot-8 is the 3 pilot vDie
leaders plus the usual combat churn).

PLAYED wall (16 seeds, reported, NOT claimed as movement — the band
differs from AUTO by the driver layer only): won 4/16 (all lesser,
full 0/16), national ever 14/16, final 11/16, table invited 6/16,
entered 4/16, wave-4 11/16, wave-5 0/16, median 166d, starvation 4,
deaths 606. The driver layer does not move the wall: wave 5 stays
0, the full seat stays 0.

## Secondary analysis (partyfinish gated corpus, NEVER pooled)

Same analyzer, same definition, over the committed partyfinish armed
corpus (29 sortie rows, gated driver min<=80/sum<=300): kills 22,
drive-offs 7, sustained DPR median 16.0 (q25 9.0, q75 23.0, max
61.0), mustered 3 in 27/29, 1 round-0 volley kill excluded from
sustained DPR. The gated and ungated drivers AGREE on median sortie
DPR (16.0 both) — the DPR finding is not a driver artifact. The
gated driver's higher kill rate (22/29 = 76% vs 35/60 = 58%) is the
gate, not the party: it only sorties weak treelines. Its recorder
carries no joined-ally or ally-damage fields, so joined rate and
ally share are UNKNOWN there (reported as such after the analyzer
fix), never 0. Partyfinish's GO verdict is NOT re-judged.

## Sense-testing read (transcript quoted, seed 75105 replay)

The sense replay reproduces the judged corpus exactly (d89: 4 fights
— 3 kills + redactor; d95, d152, d173 attempts match; the two
no-fighters failures match), so the transcript below is the judged
corpus's own words, not a second story.

SORTIE line (d89): "⚔️ SORTIE — Caleb, Vasyl, Miguel take up arms and
a day's rations (6,092 kcal from the stores) and walk out to the
treeline. Nobody's coming back the same."

The three 1-HP kills read, after the partyfinish summary fix, "Caleb
killed the White Noise with their party — 1 round, 0 taken. Word
travels fast. Cornered at the treeline, it could not slip away
before a blow." — party credit honest, cornered clause present.

The redactor fight (d89, 4 rounds, 71 damage, ally 7, fled) reads as
a real party fight with a real cost:
"Caleb has Bow but no arrows — the string stays drawn, useless."
"R1: the Redactor's handles point at Caleb's weapon — the redaction
lands next round." / "R1: Return hits Caleb for 19 (81 left)" /
"R1: Caleb's eyes go red. Next 3 strikes hit twice as hard. (Rage)" /
"R2: Caleb strikes for 32 (x2.0) (125 left)" / "Caleb is losing —
shouts for help! Vasyl charges in!" / "R3: Caleb stops mid-fight and
binds the wound — field medicine, +20 HP." / "R3: Vasyl strikes for 4
(121 left)" / "Caleb holds the line with Vasyl — 20 → 15. (Shield
Wall)" / "R3: Redact hits Caleb for 15 (64 left)" / "Caleb looks at
Vasyl standing with them — and does not run. For them. (Rally)" /
"R4: Caleb strikes for 32 (x2.0) (89 left)" / "R4: Vasyl strikes for 3
(86 left)" / "R4: the Redactor redacts Caleb's last turn — the wounds
un-write. (+35)" / "R4: Redact hits Vasyl for 35 (65 left)" / "Caleb
sees how this ends — and runs while running still works."
And the village learns: "💡 COUNTER LEARNED — The Redactor: Go quiet
— starve the redaction. ... (Caleb lived to tell it, twice — the
village pieced it together.)"

SENSE VERDICT: COHERENT, with one narration blank. The sortie reads
as people deciding (named fighters, priced rations, sober last
line); the fight reads as a party fight (shout-joined ally, shield
wall, rally, retreat line, counter learned). BLANK: the third
mustered fighter (Miguel on d89) never appears in the fight log —
the muster names three, the fight fields two. Party credit for
kills is honest now (partyfinish fix), but the third fighter is a
ghost in the fiction: named at the treeline, absent from the blows.
That gap is the mustered-vs-joined gap wearing story clothes, and
it is named here rather than smoothed over.

## Ranked next step (with numbers)

(1) TILE-PRESENT PARTY (coordinator's ranked blank 1 from 2115Z,
still open): this arm sharpens its yardstick. A tile-present party
that actually fields all its fighters must beat 16.0 median DPR by
~3.6x to reach the 57–80 kill band for fresh beasts — and, harder,
must convert the healthy-beast slice (currently 0 kills in 12) at
all. Report joined-fighter counts alongside kills, or the arm will
over-claim exactly the way mustered size over-claims here (3
mustered, 1.13 joined on average).
(2) WAVE-4 SORTIE SURVIVAL (this arm's own finding): 4 of 7 wave-4
sortie fights kill the leader. Any future sortie work must answer
the survival question (party must live to round 3+ at 35–95
incoming/round) before the damage question — a party that dies in
round 2 has no DPR.
(3) THIRD-FIGHTER GHOST (narration): the mustered-but-never-joined
fighter needs either a log presence (holding the line, carrying the
wounded) or a muster that says two, not three. Small, honest, and
visible to any player reading a sortie day.
(4) THRESHOLD loosening LAST, harmful alone (2115Z standing order).

## Verdict: DIAG-GO

Judged by scripts/test-sortiedpr-a.js (exit 0) with --sense-ok after
the sense replay passed:
- CORPUS-VALIDITY: PASS. AUTO 8/8 rows, PLAYED 16/16 rows, recorder
  errs 0, overflow 0, days > 0.
- OPPORTUNITY-REPORTED: PASS. AUTO absence stated with 53 episodes /
  183 gorge nights / 0 calls; PLAYED opportunities stated per band.
- DISTRIBUTION-COMPLETE: PASS. 60 fought sortie fights (threshold
  10), DPR distribution + shares + mustered/joined + survival rounds
  + kills/drive-offs separate + round-0 list (none) + cap-fit all
  reported.
- SENSE: PASS. One full sortie transcript read + quoted (seed 75105
  replay, trajectory-matched to the judged corpus), verdict
  COHERENT with one named blank.
- RANKED-NEXT: named with numbers above.
DIAG-GO. No game change is proposed or landed by this arm; the
measurement itself is the fill. The answer to the coordinator's
question is no: mustered parties are not the killers — they finish
broken beasts at 16 DPR, and the wave-4 fight is still the wall.

## Metric review (§14 — binding, no mid-run re-scores)

No metric was re-scored mid-run. Judgment notes, disclosed, none a
re-score:
1. MEDIAN DPR IS A BREAK-LINE MEDIAN. 35 of 60 fights are 1-HP
   kills (median starting HP 1), so the median DPR (16.0) describes
   mostly one-round finishes of broken beasts, not sustained
   multi-round damage. The healthy-beast slice (12 fights, median
   ≈ 15) and the wave-4 slice (7 fights, 0 kills) are reported
   separately precisely so the median is not misread as "parties
   deal 16/round against real beasts" — they deal ~15 against real
   beasts too, and lose. A future prereg that wants a clean
   sustained-DPR number should pre-register a healthy-beast-only
   cut (mHpStart >= 100) as its primary.
2. DEATH-CAUSE TAXONOMY TRAP (caught before reporting): the
   'sortie combat' death-cause count equals the kill count (35)
   because registerDeath records the KILLED MONSTER under that
   cause. Reading it as villager deaths would overstate sortie
   lethality 35 vs the true 6 leader deaths. Stated here so the
   next reader does not make that mistake.
3. AID CONTRAST IS THIN. Aid fights (93 total across both bands)
   show median DPR 0.0 with 1 kill — but 61 of 93 had rounds 0
   (volley/evade paths), so the aid median is dominated by
   zero-round fights, not by fought damage. It is reported as
   contrast only, never as a DPR claim.
4. PANEL. scripts/balance-panel.js has no census-ingest mode
   (standing exception, as in prior rounds). Identical-seed paired
   tables (AUTO vs PLAYED) + the analyzer output are the §15
   substitute. No panel artifact faked.
5. CONFIRM NOTE. The confirm (seeds 75109-75116) was interrupted
   once mid-run (its driver process vanished after 75115 with no
   output; no sweep process remained). Recovery: seed 75116 was
   re-run alone (deterministic seed + code + driver) and the
   16-seed summary rebuilt; all 16 rows validate (errs 0). No
   numbers were carried across the interruption by hand.

## Infrastructure notes

- Sweep wall time: pilot ~10 min (16 seed-runs), confirm ~17 min
  (8 seed-runs, slower under sibling load) + 75116 re-run ~2 min.
  Per-seed invocations; no concurrent jest; node --check clean on
  all three instruments.
- Safe-commit index clobber hit both the prereg commit and the
  instruments commit (bogus staged deletions for files byte-identical
  to HEAD); repaired via HEAD-blob cacheinfo each time with hash
  verification, never git reset. The corpus+evidence commit below
  must be checked the same way before this run is called done.
- check.js --quick: NOT run by this worker, deliberately — sibling
  check runs were in flight in other worktrees during this run, and
  the repo rule is never concurrent jest. This arm touches zero
  src/js and zero green-list files; the proofs of record are the
  analyzer (exit 0), node --check on all instruments, the corpus
  gates (errs 0, overflow 0, 16/16 + 8/8 rows), and the sense
  trajectory match. The coordinator/ship loop's check remains the
  gate before any push — this arm does not claim check.js green.
- docs/ONTOLOGY.md: left alone throughout (known sibling transient).
- No B tree/branch/file touched (sim-nighttravel-b,
  sim-dawnhall-b untouched; no B claim read or written — claim
  handling is the coordinator's). No push, no bump, no live
  verification (coordinator/ship-loop line).
- Branch ready, pending coordinator merge; NOT pushed, NOT bumped,
  live NOT verified.

## Convergence

scale-onramp stays converging (NOT converged): sortie DPR is now
measured end to end (median 16.0, healthy-beast kills 0/12, wave-4
sortie kills 0/7), the autonomous absence is measured with
opportunity counts (53 episodes, 0 sorties), and the ranked next
step is tile-present party with a sharpened yardstick — but no
wave-4 field kill has happened, the full seat is still 0, and wave
5 is still 0. The directive stands until the tracker records this
axis converged on measured evidence.
