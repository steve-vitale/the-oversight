# sim-retreatdiag-a — FORMED-BUT-RETREATED: DIAGNOSIS

Run: fleshout loop, run fleshout-20261028T1942Z. Axis: scale-onramp
(blocking axis, converging, NOT converged). Worker: sim-retreatdiag-a.
DIAGNOSIS ONLY — zero src/js, zero default flips, zero game-code
changes. This arm classifies and quantifies; it does not build the
fix. Sibling arm sim-perceptform-a builds perception-based formation
in parallel; no fight routing, allyFromStart, or game file was
touched here. Preregistration (binding, committed BEFORE any judged
census): evidence/2026-10-28/sim-retreatdiag-a-prereg.md
(commit 9f6bcc208). VERDICT: DIAG-GO — all four prereg legs pass
(classification 100%, stay-to-kill 100%, census validity, sense +
ranked lever). The predecessor verdicts stand untouched: shoutgate-a
NO-GO, fieldfeed-a pilot-GO-only. No wall movement is claimed from
re-analysis.

## Plain words first

Every wave-4 field party that ever formed did the same thing: called
for help, got one friend for one blow, looked at the numbers, and
ran. That is not a broken retreat. That is the correct call. A pair
dealing about 15 damage a round needs about 52 rounds to kill the
beast in front of it — and the fight only allows 15 rounds, and the
pair itself only lives about 3 or 4 rounds under the beast's blows.
Loosening the retreat rule would not save these fights; it would
turn 14 orderly retreats into 14 deaths, because at the moment of
retreat the party still owed a median 1,547 damage worth of incoming
blows before the beast would fall, against villagers with about 100
health. The next lever is damage — the pair must hit roughly four to
five times harder before anything else about the fight can matter.
And even then, damage alone is not the whole answer: the pair must
also live long enough to land those blows, so the damage arm must
be judged on kills, not on staying.

## Header (pre-registered) vs result

- CLASSIFICATION BAR: 100% of input parties classified, OTHER = 0.
  RESULT: 16/16, OTHER = 0 → PASS.
- STAY-TO-KILL BAR: >= 80% of classified parties quantified.
  RESULT: 16/16 (100%) → PASS.
- CENSUS-VALIDITY LEGS: both input corpora 8/8 rows, recorder
  errs 0; fresh band 8/8 rows, errs 0, control shape matches
  1528Z (formed 0, field kills 0 on both judged cuts).
  RESULT: all pass (see Fresh band) → PASS.
- DIAG-GO BAR: classification complete AND stay-to-kill
  quantified AND one ranked next lever named with numbers AND
  >= 2 sense transcripts read + quoted. RESULT: all four → DIAG-GO.
- No re-scoring: no metric was changed mid-run. Metric doubts are
  under "metric review" below, for the next run.

## Q1 — the named retreat trigger (16/16 classified)

Universe: 12 shoutgate-armed formed parties (judged set verbatim
from scripts/test-shoutgate-a.js: wave 4, field, resolve/patrol/
aid, villager-led; FORMED = crewed AND calledHelp-or-joined) + 4
fieldfeed-pilot formed parties (judged set verbatim from
scripts/test-fieldfeed-a-analyze.js: wave 4, field,
resolve/patrol, villager-led; FORMED = calledHelp AND joined).
Trigger classes in code order (fieldFights.js morale block).
Every party was a 2-fighter party (leader + exactly one joined
ally — one ally answers per fight, verified per row); all 16
leaders armed; all 16 allies armed-known.

| trigger | n | meaning |
|---|---|---|
| HOPELESS-REFIRE | 14 | vFlee with fleeHopeless = true: the hopeless formula fired again AFTER the ally joined (rally/war-cry did not hold the line) |
| DEATH | 2 | vDie: HP reached 0 (flee flags moot) |
| HP-FLOOR | 0 | no party fled on the bravery floor alone |
| LEARN-WITHDRAWAL | 0 | no formed party was a learn-intent withdrawal |
| ROUND-CAP | 0 | no party reached the 15-round disengage |
| NON-RETREATING | 0 | no formed party killed or drove off its beast |
| OTHER | 0 | nothing unclassified — the bar is met, not footnoted |

Per-party (DPR = party damage/round; killR = rounds to kill at
observed DPR; driveR = rounds to the 15% break line, upper bound
for pre-wounded beasts — see metric review):

| # | source | seed/day | leader + ally | beast (HP faced) | r | out | trigger | DPR | killR | driveR |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | shoutgate | 75106 d109 | app_mgpspjia225 + gen_embnvnq | audit (1100, fresh) | 3 | vFlee | HOPELESS-REFIRE | 15.0 | 73.3 | 62.3 |
| 2 | shoutgate | 75106 d109 | app_mgpsphmu476 + gen_embnvnq | herald (350) | 3 | vFlee | HOPELESS-REFIRE | 18.7 | 18.8 | 15.9 |
| 3 | shoutgate | 75106 d109 | app_mgpsphmu476 + gen_embnvnq | herald (294) | 3 | vFlee | HOPELESS-REFIRE | 17.7 | 16.6 | 14.1 |
| 4 | shoutgate | 75106 d111 | chen_wei + gen_embnvnq | audit (753) | 2 | vFlee | HOPELESS-REFIRE | 14.5 | 51.9 | 44.1 |
| 5 | shoutgate | 75106 d111 | caleb_jones + gen_embnvnq | audit (724) | 3 | vDie | DEATH | 19.3 | 37.4 | 31.8 |
| 6 | shoutgate | 75106 d120 | nikos_papadopoulos + gen_embnvnq | herald (241) | 3 | vFlee | HOPELESS-REFIRE | 12.3 | 19.5 | 16.6 |
| 7 | shoutgate | 75106 d120 | chen_wei + gen_embnvnq | audit (666) | 3 | vFlee | HOPELESS-REFIRE | 9.7 | 68.9 | 58.6 |
| 8 | shoutgate | 75106 d126 | chen_wei + gen_embnvnq | audit (362, aid) | 2 | vFlee | HOPELESS-REFIRE | 16.5 | 21.9 | 18.6 |
| 9 | shoutgate | 75106 d126 | adaeze_nwosu + gen_embnvnq | audit (329, aid) | 2 | vFlee | HOPELESS-REFIRE | 17.5 | 18.8 | 16.0 |
| 10 | shoutgate | 75106 d129 | chen_wei + fatima_hassan | audit (294) | 2 | vFlee | HOPELESS-REFIRE | 16.0 | 18.4 | 15.6 |
| 11 | shoutgate | 75106 d141 | app_mgpspjia225 + fatima_hassan | influencer (850, fresh) | 2 | vFlee | HOPELESS-REFIRE | 11.0 | 77.3 | 65.7 |
| 12 | shoutgate | 75108 d96 | app_mgpspit7437 + ines_duarte | eater (950, fresh) | 2 | vDie | DEATH | 0.0 | inf | inf |
| 13 | fieldfeed | 75106 d118 | visjoin_104 + jorge_silva | influencer (850, fresh) | 3 | vFlee | HOPELESS-REFIRE | 11.0 | 77.3 | 65.7 |
| 14 | fieldfeed | 75106 d118 | mateo_alvarez + jorge_silva | influencer (817) | 3 | vFlee | HOPELESS-REFIRE | 9.0 | 90.8 | 77.2 |
| 15 | fieldfeed | 75106 d121 | visjoin_104 + jorge_silva | suburb (963) | 2 | vFlee | HOPELESS-REFIRE | 10.0 | 96.3 | 81.9 |
| 16 | fieldfeed | 75107 d106 | nikos_papadopoulos + gen_v0dsfw1 | reunion (1200, fresh) | 3 | vFlee | HOPELESS-REFIRE | 16.3 | 73.5 | 62.4 |

Notes on the table:
- Fights last 2–3 rounds, never more. The shout fires (round 2
  on base code, round 1 on shoutgate's fixed gate for catastrophic
  exchanges), the ally joins, and the hopeless formula fires
  again the next round — that is the whole shape, 14 times.
- The 2 deaths: caleb_jones vs audit (vTaken 130 over 3 rounds,
  armorP 9, ally struck for 6 and the leader still died) and the
  75108 eater (mDealt 0, vTaken 219 over 2 rounds, armorP 4 —
  the leader never landed a blow against a 950-HP beast hitting
  for ~110/round).
- The 3 FORMED-UNSTRUCK parties (allyDealt 0): #9 (adaeze, ally
  joined but never struck before the round-2 flee), #12 (eater,
  leader died before the ally could strike), #15 (suburb, ally
  joined but never struck). Unstruck is a sub-class, not a
  separate trigger — all three still classify (refire/refire/
  death respectively by the code-order rule; #12 is DEATH).
- Wounds persist onto the world beast (m.hp = mHpLeft when it
  lives), so mHpStart is the HP actually faced, not max HP.
  Monster max-HP ranges (src/data/monsters.json): audit
  1100–1300, herald 700–900, influencer 850–1050, eater
  950–1150, suburb 1300–1500, reunion 1200–1400. Five parties
  faced a fresh beast at its minimum roll (#1, #11, #12, #13,
  #16); the other 11 faced pre-wounded beasts — and still
  retreated, still needed 16+ rounds to kill.
- Arithmetic-continuous chain (same beast, proven by HP
  arithmetic, not assumed): fieldfeed d118 influencer 850 → 817
  (850 − 33 dealt) → 790 (817 − 27 dealt) across Elmarie's and
  Mateo's fights the same day. Chipping a beast across parties
  is real, but the chain still ends retreated, never killed.

## Q2 — the stay-to-kill gap (16/16 quantified)

At OBSERVED rates only (partyDPR = mDealt/rounds; mDealt already
includes allyDealt):

- Party damage: median 15.0/round, mean 13.4, range 0–19.3.
  Leader share median 89% (leader DPR median 13.2); ally total
  3–6 damage per fight (median share ~11%).
- Rounds to kill: median 51.9 (finite parties), mean 50.7.
  Fresh beasts: 73.3–77.3 rounds (+1 infinite, the zero-damage
  eater). EVERY party, including the most wounded beast faced
  (herald at 294 HP, 16.6 rounds), needs MORE than the 15-round
  cap to kill. Over-cap: 16/16.
- Rounds to drive off (15% break line): median 44.1; over-cap
  15/16. The single under-cap case (#3, herald 294, 14.1 rounds)
  is an UPPER bound (pre-wounded beast — its true break line
  sits higher than 15% of 294, so the true figure is smaller),
  and it still fled at round 3: the morale formula fires ~11
  rounds before even the best-case drive-off.
- Incoming damage: monster DPR median 39/round (leader-only
  median 25.2/round). A villager at the code-default 100 HP
  lasts a median ~4 rounds at the leader-only rate — matching
  the observed 2–3-round fights. The survival window (~3–4
  rounds) is an order of magnitude shorter than the kill window
  (~52 rounds).
- Remaining at the moment of retreat: median 42 rounds still
  needed (range 13.6–94.3, +1 infinite), at a median incoming
  1,547 damage before the kill would land (range 214–3,081).
  Against ~100-HP villagers, that is not a fight to stay in.
- Total damage across all 16 parties: 558 — less than any
  single fresh beast's HP. Sixteen parties combined did not
  deal one beast's worth of damage.
- Structural cap on the ally: the ally joins the round after
  the shout and the fight ends that same round (hopeless
  refire), so the ally lands exactly ~1 strike per fight
  (3–6 damage). Ally damage is structurally negligible in this
  shape no matter how hard the ally hits per strike — the
  leader's damage is the party's damage. (Fresh-fixture
  confirmation: both fixture allies struck exactly once, for 6.)
- Even a fully-kitted pair does better but not enough: the
  sense fixtures (spear + hide kit, full HP) dealt ~23–29/round
  — still 36–38 rounds to kill a fresh beast, still over cap.
  Gear as it stands closes perhaps a third of the gap, not the
  gap.

## Q3 — the single next lever, ranked

1. DAMAGE — FIRST, and the only lever that can move killRounds
   inside the cap at all. Target, from the numbers: party DPR
   must reach mHpStart/15 = 57–80/round for fresh beasts
   (850–1200 HP), i.e. 3.8–5.3x the observed median 15/round
   (median across all parties: 3.5x; fresh beasts: 4.9–5.2x).
   For drive-off inside the cap: 48–68/round. The damage arm's
   prereg MUST define success as a kill (or drive-off), never
   as staying: a damage bump that merely delays retreat into
   death fails, and this diagnosis proves that failure mode is
   the default (see #4). Where the damage comes from (gear,
   abilities, aim, counters, party size) is the damage arm's
   design decision, not this arm's — but the numbers say the
   leader's damage is the lever (89% share; ally structurally
   capped at ~1 strike), so a fix that only buffs the ally
   cannot close a 4–5x gap.
2. STAY-MECHANIC — SECOND: something that gives a staying
   party a different ending than HP-trading (reinforcement
   over rounds, a drive-off that counts as the win, a
   trick/counter finish). Reason it ranks below damage: even
   at cap-fitting damage, the party must survive ~15 rounds
   at ~39 incoming/round (~585 damage vs ~100-HP villagers),
   so damage without a survival answer still dies first. A
   stay-mechanic without damage is worse (see #4) — the two
   are complements, and damage is the one whose test can move
   killRounds below the cap.
3. SURVIVABILITY — THIRD (supporting, never sufficient alone):
   armor/HP would need to stretch the ~4-round survival window
   to ~52 rounds at observed damage — roughly a 13x effective
   HP increase — which is not a plausible sole lever. As a
   complement to damage (survive the 15 rounds a 4–5x damage
   party needs), it is the natural second half of the damage
   arm's measurement (report death share alongside kills).
4. THRESHOLD (hopeless-formula loosening) — LAST, and harmful
   alone: silencing the hopeless flee does not create a kill,
   it deletes the retreat. The 14 refire parties would have
   stayed to absorb a median 1,547 further damage against
   ~100 HP and died — the corpus's 2 deaths are the preview,
   not the exception. Any future threshold proposal must
   answer the 1,547 number first. Do not test threshold alone.

## Q4 — sense-testing law (transcripts read, beats quoted)

Verdict: COHERENT. The retreats read as people judging a fight
they cannot win — not as a missing system. The missing system
is damage/survivability (Q2/Q3), not the retreat judgment.

Transcript 1 — shoutgate 75106 d109 audit (published sense note,
sim-shoutgate-a.md; same-seed replay on armed code):
- "R1: Anthony takes aim (Take Aim — next shot 2.5x). The audit
  hits for 30 (70 left; armor absorbed 11)."
- "R2: Anthony strikes aimed for 28 (1072 left on an 1100-HP
  beast). The audit hits for 30 (40 left)."
- "Anthony is losing — shouts for help! Sandile charges in!"
- "R3: Anthony strikes for 12, Sandile strikes for 5 (1055
  left). The audit hits Anthony for 31 (9 left)."
- "Anthony sees how this ends — and runs while running still
  works." (vFlee, party intact.)
Judgment: aim, trade, call, one shared round, retreat together
at 9 HP rather than dying for pride. The pair's 17/round
against 1055 HP left is visibly hopeless, and the fiction shows
the judgment.

Transcript 2 — fieldfeed 75106 d118 influencer (published sense
note, sim-fieldfeed-a.md; Elmarie vs Ratio, fed [jorge, fatima]):
- "R1: Ratio hits Elmarie for 26 (55 left). Elmarie strikes
  for 11 (839 left)."
- "R2: Ratio hits Elmarie for 26 (29 left). Elmarie strikes
  for 10."
- "Elmarie is losing — shouts for help! Jorge charges in!"
- "R3: Ratio hits Jorge for 65 (35 left). Jorge strikes for 4."
- "Elmarie sees how this ends — and runs while running still
  works." (vFlee, party intact.)
Judgment: the shout comes when losing, the friend takes the
hit, the pair retreats together. A party judging a fight, not
a mechanism firing.

Transcript 3 — fresh fixture, audit 1100 HP, base code
(scripts/test-retreatdiag-a-sense.js, SENSE-SHAPE PASS):
- "R2: Assessment hits ... for 29 (55 left)"
- "... is losing — shouts for help! ... charges in!"
- "R3: ... strikes for 28 (x1.3) (1020 left)"
- "R3: ... strikes for 6 (1014 left)"
- "... sees how this ends — and runs while running still
  works." (vFlee, beast alive at 1014/1100.)
The influencer fixture reads identically (shout round 2, ally
strikes for 6, retreat round 3, beast alive at 780/850).
Fixture calibration note (honest, not hidden): an UN-kitted
day-1 pair died in round 2 before any shout could fire
(audit 42+75, influencer 48+59, calledHelp false) — the shout
requires surviving to round-2 morale, which in practice is
gear-gated. The corpus-shape fixtures kit both fighters
(spear + hide kit, 100 HP), matching the corpus condition
(all 16 leaders armed). The fixture is a shape check, not a
DPR claim: its DPR (~23–29/round) exceeds the corpus median
(15) because it is a fresh, fully-kitted, full-HP pair — and
still needs 36–38 rounds to kill.

What would read as INCOHERENT (not observed here): a party
fleeing while winning, fleeing without the shout beat, or a
silent ally. None of the 16 corpus parties, and neither
fixture, shows that. Contrast the pre-feed control (fieldfeed
sense note): Ingrid dies solo in 2 rounds with 6 trusted armed
villagers in earshot and no shout at all — that was the
incoherent shape, and it belongs to the formation arms, not
to this retreat diagnosis.

## Fresh band (this arm's own census, base code)

Seeds 75101–75108, tableseat-nowait verbatim, LEANLINKRESCUE=1,
TABLESEATNOWAIT=1, 180d death-aware, competent policy,
fieldparty-form-diag recorder only. Corpus:
evidence/2026-10-28/perseed-retreatdiag-a/ (s<seed>-fresh.json
+ summary-fresh.json). 8/8 rows, recorder errs 0, no overflow.

- CONTROL-SHAPE: PASS. Meetings 1,272; judgedA
  (resolve/patrol/aid) 24, formed 0, kills 0; judgedB
  (resolve/patrol) 18, formed 0, kills 0. The 24-count matches
  the 1528Z control exactly (24 field meetings all solo, field
  kills 0). Per-seed judgedA: 75106: 15, 75108: 9, all other
  seeds 0 — the same two-host-seed shape as every predecessor
  band.
- WALL (this band; reported, NOT claimed as movement — this is
  a base-code control reproduction, and it reproduces the
  1528Z control exactly on every field): national ever 7/8,
  final 6/8; table invited 4/8, entered 3/8; wins 3/8, all
  lesser, full seat 0/8; wave-4 reach 6/8; wave-5 0/8; median
  survival 146d; deaths 286; starvation 1.
- Death-cause shares (this band, all deaths): villager combat
  110, villager-vs-villager combat 80, player the wild 41,
  villager expedition 22, villager monster 14, villager ambush
  4, player the arena 2, player the night 2, player sickness
  2, villager sickness 3, player contest 2, villager
  starvation 1, villager thirst 1, villager alien 1, villager
  "a toad like a war drum, throat swelling" 1.
- No wall movement is claimed from re-analysis alone (prereg).
  The fresh band's job was instrument validation, and it
  passed: the census that produced the 16 parties is the same
  census that reproduces the known control shape exactly.

## Village assessment in plain words

The village's fighters are not cowards and they are not broken.
When a villager meets a wave-4 beast with a friend in earshot,
someone shouts, someone charges in, they trade one round
together, and then they make the only call the numbers allow:
they run while running still works. Two leaders who stayed
died. The beasts they face carry 850–1,200 health and hit for
30–110 a round; the pair hits back for about 15 a round, the
friend's share a single blow. Nobody in this corpus was ever
one good round from winning — the closest any party came was
a wounded herald that still needed 17 rounds. Who thrived:
villagers with armor and company, who got help and walked
away. Who died: lightly armored leaders (armorP 4 and 9) who
met a full-strength beast. Missing capability, still: a party
that can actually hurt a wave-4 beast — damage first, and
then the staying power to use it. That is the next blank, in
order, with its number attached: 57–80 damage a round.

## Metric review (for the NEXT run — never a mid-run re-score)

- DRIVE-OFF ROUNDS ARE UPPER BOUNDS for pre-wounded beasts:
  the 15% break line is a fraction of max HP, and mHpStart is
  below max for 11/16 parties — so their true drive-off rounds
  are smaller than tabulated. The conclusion is robust anyway:
  drive-off is exact for the 5 fresh-HP parties (62–82 rounds,
  +1 infinite), and the only under-cap tabulated case is a
  pre-wounded herald that still fled at round 3. Kill rounds
  are exact regardless of max HP (kill = lead HP 0 from the
  HP actually faced).
- PARTY DPR AVERAGES OVER PRE-JOIN ROUNDS: the ally joins
  late, so mDealt/rounds understates post-join DPR. The bias
  is small by construction (ally adds 3–6 total) and cannot
  change any verdict: even doubling the ally's contribution
  moves median party DPR from 15 to ~16.
- SENSE FIXTURE IS DAY-1 STATE: bravery 0, no tricks known, no
  abilities — unlike the corpus's day-100+ fighters. The beats
  match anyway (shout → one ally strike → hopeless refire →
  retreat line), which strengthens the coherence verdict
  rather than weakening it; the fixture's higher DPR is
  disclosed, not used for any corpus number.
- SUMMARY-SCRIPT BUG, CAUGHT AND FIXED (disclosed): the
  first --summary run printed CONTROL-SHAPE: FAIL while its
  own counts showed formed 0 / kills 0 on both cuts — the
  check compared the filtered ARRAYS to 0 instead of their
  lengths. Fixed to .length comparisons, re-run, PASS. No
  corpus row was touched; the fix is in
  scripts/test-retreatdiag-a-sweep.js, and the corrected
  summary is the committed summary-fresh.json.
- PANEL NOTE (standing): scripts/balance-panel.js has no
  census-ingest mode (its compare mode spawns its own
  observer sim runs; it cannot ingest per-seed meeting
  censuses). Paired before/after tables (fresh band vs the
  1528Z control, identical seeds/substrate) are the §15
  substitute, as in 1415Z/1528Z/1628Z/1736Z. No panel artifact
  faked, no panel verdict claimed.
- TELEMETRY DEVIATION CHECK (loop body step 10): corpus path
  for the coordinator's check is
  evidence/2026-10-28/perseed-retreatdiag-a/*.json (metrics
  national,table,wins,exiled; baseline
  .../telemetry-baselines/scale-wall.json). Expected artifact
  class if LOUD lines appear, as in 1528Z/1628Z/1736Z: the
  baseline's regime does not match this substrate, and
  per-seed rows carry nationalEver/entered/won, not
  top-level national/table/wins paths. The fresh band's true
  wall numbers are nationalEver 7/8, entered 3/8, wins 3/8.
  Baseline NOT rolled by this arm; the coordinator judges any
  LOUD lines.

## Blanks filled or documented

- FILLED (diagnosis, not a fix): the formed-but-retreated
  blank (1628Z blank #2, 1736Z blank #3) is now classified
  100% and quantified: HOPELESS-REFIRE 14, DEATH 2; party DPR
  median 15 vs 57–80 needed; killRounds median 52, fresh
  73–77; threshold-loosening quantified as harmful (median
  1,547 further incoming at flee vs ~100 HP).
- DOCUMENTED (for the findings backlog, not chased here):
  (a) the ally's structural one-strike cap — in this fight
  shape the ally can never contribute more than ~1 strike,
  so ally buffs alone cannot close the damage gap; (b) the
  shout is gear-gated in practice — an un-kitted villager
  dies in round 2 before round-2 morale can shout (fixture
  finding); (c) wounded-beast chaining nearly fits the cap
  (herald 294 HP needs 16.6 rounds) — a future arm could
  measure whether repeated parties ever finish a chained
  wounded beast, since no corpus chain has yet done so.
- NOT re-judged: shoutgate-a NO-GO, fieldfeed-a
  pilot-GO-only, earlycrew-a NO-GO all stand as published.

## Test and infrastructure notes

- `node --check` clean on all three new scripts;
  scripts/test-retreatdiag-a.js exits 0 with MACHINE LEGS
  PASS (classification 100%, stay-to-kill 100%, census PASS);
  scripts/test-retreatdiag-a-sense.js SENSE-SHAPE PASS on
  current base code (after the kitting calibration noted
  above); scripts/test-retreatdiag-a-sweep.js --summary
  exits 0 with CONTROL-SHAPE PASS.
- No jest in this arm (node scripts only); the
  --cacheDirectory=/tmp/jest-cache-sim-retreatdiag-a rule is
  recorded and vacuous here, not waived for any jest run.
- Safe-commit index clobber hit the prereg commit
  (staged-deletion twin of a byte-identical file); repaired
  via HEAD-blob `git update-index --add --cacheinfo` with
  status-empty + diff-HEAD-empty verification, never `git
  reset`. No .git EPERM flap this run. No ref surgery.
- Zero src/js diff on this branch (verified at closeout);
  zero policy files added or changed; no other arm's corpus
  touched (predecessor corpora read-only). No push, no bump,
  no live verification (ship-loop line). Ready for
  coordinator merge, pending ship — via the coordinator.

## Commits

- 9f6bcc208 prereg (before any judged census).
- Instruments + corpora + sense + this evidence: final
  commits on this branch (hashes in the run report to the
  coordinator).

## Convergence

scale-onramp stays converging (NOT converged): the retreat is
now explained with numbers and a ranked next lever (damage,
57–80/round, judged on kills), but no wave-4 field party has
yet killed in the field, the full seat stays 0, wave 5 stays 0.
The directive stands until the tracker records this axis
converged on measured evidence.
