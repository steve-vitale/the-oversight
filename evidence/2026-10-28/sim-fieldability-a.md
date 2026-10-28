# sim-fieldability-a — DAMAGE CEILING: NO NARROW WIRING TO 57–80/round

Run: fleshout loop, run fleshout-20261028T2115Z. Axis: scale-onramp
(blocking axis, converging, NOT converged). Worker: sim-fieldability-a.
DIAGNOSIS ONLY — zero src/js, zero policy changes, zero game-code
changes. This arm audits, quantifies, and ranks; it does not build
the fix, because the audit proved there is no narrow fix to build.
Preregistration (binding, committed BEFORE any judged sweep):
evidence/2026-10-28/sim-fieldability-a-prereg.md (commit
9ad1900b43c133f58c42ae11067e9c0d46aa3019). VERDICT: DIAG-GO —
all four prereg legs pass (control gate reproduced exactly,
ceiling table complete, sense transcripts quoted, ranked next
step named with numbers). The predecessor verdicts stand
untouched: retreatdiag-a DIAG-GO, perceptform-a NO-GO,
shoutgate-a NO-GO, fieldfeed-a pilot-GO-only. No wall movement
is claimed from this arm (the control band is a base-code
reproduction, and it reproduces the 1942Z control exactly).

## Plain words first

The village's fighters cannot hit hard enough, and no single
existing system fixes that. A wave-4 beast carries 850–1,200
health; a pair must deal 57–80 damage a round, every round,
for 15 rounds to kill one. The best party the village can
honestly field — a machete in one hand, a bow in the other,
arrows in the pocket — deals about 48 a round once the fight
settles, plus one opening volley. That still needs 17 rounds
to kill the smallest wave-4 beast and 22 for a big one, and
the fight only allows 15 — before asking whether the pair
survives 15 rounds of 40–65 damage coming back at them.
Piling on every damage ability the game offers gets a
godhood-tier fighter into the band, but that is not a
village party, it is a hero. The tricks the village knows
do not deal damage at all: the eater's poison drives the
beast off without a blow (a win, but not a kill, and it
needs spoiled food in the pack), and hunting the
influencer's followers HALVES the party's damage while it
shrinks the beast's buff. So the damage arm, as assigned,
is killed by measurement, not by opinion — and the next
step is not a bigger number, it is a bigger party: every
ally actually standing on the tile joining the fight,
not just one.

## Header (pre-registered) vs result

- CONTROL-GATE: judgedA 24, formed 0, field kills 0.
  RESULT: meetings 1272, judgedA 24, judgedB 18, formed 0,
  kills 0 — the 1528Z/1942Z shape reproduced EXACTLY,
  including wall and death totals (see Control gate) → PASS.
- CEILING-COMPLETE: per-source sustained-DPR table with
  kill-rounds for 850/1100-HP beasts.
  RESULT: 12 weapon configs + 5 trick cells, all
  fixture-measured, formulas shown → PASS.
- SENSE: >= 2 transcripts read and quoted.
  RESULT: machete+bow vs audit + trick-known influencer,
  both quoted below → PASS.
- RANKED-NEXT: one ranked next step with numbers.
  RESULT: tile-present party first (ceiling math in §Q3),
  sortie-DPR measurement second, Steve-call third → PASS.
- DIAG-GO: all four legs → DIAG-GO. No metric was changed
  mid-run; doubts are under "metric review" below.

## Q1 — the damage formula, verified (not assumed)

Field-fight strikes use the tactical formula verbatim
(fieldFights.js): leader strike = lroll([4+wb, 8+wb]), mean
6+wb, where wb = round((meleeBonus + rangedBonus)/2) from
EQUIPPED gear. The ally's strike is gear-blind:
lroll([3, 6]), mean 4.5, every round while alive — so the
ally contributes ~4.5/round sustained, never more, and
exactly one ally ever joins a fight (one shift of
allyVids, either from-start or shout; the second crew
ally never enters). Godpath fieldStrike multiplies the
leader's strike by the fed power mult 1.25 when the
villager is topped up (villagerPowerMult: hunger at/below
the fed line, village food tier secure) — the fixtures
were fed, so 1.25x is already inside every number below.
Verification against prediction (leader strike mean x 1.25):
godslayer fixture 61.7/round vs 61.25 predicted;
worldbreaker 82.7 vs 82.5; machete 30.0 vs 30.0; hunting
spear 26.7 vs 26.25. The formula is the ceiling; the
fixtures confirm it, they do not exceed it except by
one-shot sources (see Q2).

## Q2 — the ceiling table (sustained DPR, the kill math)

Sustained party DPR = leader strike mean x 1.25 + ally
4.5. Kill rounds = HP / sustained DPR; drive-off rounds
= 0.85 x HP / sustained DPR (15% break line). The
15-round cap is the judge. Fixture DPR (3-round fights)
is shown only to expose its flattery: one-shot sources
(volley, aim) inflate a 3-round average and vanish over
a 15-round fight.

| config (fed, 2 fighters) | sustained DPR | kill 850 | kill 1100 | drive 1100 | fixture DPR (3 rds) |
|---|---|---|---|---|---|
| sharpened stick | 15.75 | 54.0 | 69.8 | 59.4 | 12.9–13.1 |
| fire-hardened spear | 22.0 | 38.6 | 50.0 | 42.5 | 19.1–19.4 |
| hunting spear | 30.75 | 27.6 | 35.8 | 30.4 | 27.9–28.1 |
| machete | 34.5 | 24.6 | 31.9 | 27.1 | 31.7–31.9 |
| machete + bow + arrows | 48.25 (+32 volley once) | 17.6 | 22.8 | 19.4 | 53.7 / 48.1 |
| hardlight knife | 40.75 | 20.9 | 27.0 | 22.9 | 37.9–38.1 |
| godslayer spear | 65.75 | 12.9 | 16.7 | 14.2 | 62.9–63.1 |
| worldbreaker maul | 87.0 | 9.8 | 12.6 | 10.7 | 84.1–84.4 |
| hunting + all dmg abilities* | ~39.5 | 21.5 | 27.8 | 23.7 | 50.9 / 41.5 |
| machete+bow + all dmg abilities* | ~62.7 | 13.6 | 17.5 | 14.9 | 82.3 / 68.5 |

* All damage abilities = patient_aim, haymaker, stalk,
blood_trail, dead_aim, trade_of_blows together. Sustained
value counts only haymaker (x2 every 3rd round = 1.33x
sustained); aim (2.5x, one strike), stalk (+4, round 1),
trade (1.5x, once) are one-shots. Fixture DPR exceeds
sustained exactly because aim and haymaker stack onto
the same short window.

What each EXISTING source can and cannot do:

- WEAPONS (the ladder): every earnable/craftable weapon
  tops out at machete+bow dual, 48.25 sustained — 9
  short of the 57 floor for the smallest beast, 25 short
  of the 73 needed for an 1100-HP beast. Only alien-tier
  weapons reach the band: godslayer (kill 850 in 12.9,
  drive 1100 in 14.2, kill 1100 in 16.7 — over cap) and
  worldbreaker (all inside cap). Both are tier-4 apex
  loot; no wild party at wave-4 time holds them, and
  wiring villagers toward apex loot is a loot-economy
  change, not a narrow wiring — and gear-changing is a
  least-frequent lever (Steve).
- SPEAR SLOT FINDING (new, measured): a spear occupies
  the RANGED slot (autoEquip keys on wkind spear), so
  hunting-spear+bow is NOT a real dual config — the bow
  is dropped, volley null, DPR byte-identical to spear
  alone (27.9 both beasts). Machete (melee, wkind axe) +
  bow is the real dual. Any future gear arm must account
  for slot competition; melee+ranged do not stack for
  spears.
- VOLLEY: bow volley (3 shots at audit speed 2, 2 hits
  for 32 in the sense fixture) is a ONE-SHOT: +32 total,
  worth +10.7/round over a 3-round fight but +2.1/round
  over a 15-round fight. Pocketed arrows (already
  landed, gap-ammo 2026-10-27) help the opening, not the
  kill math. Wild meeting leaders are wanderers, not
  departure fighters, so they may not even carry the
  pocketed quiver — the fixture grants arrows by hand.
- ABILITIES: the full stack on a hunting spear reaches
  only ~39.5 sustained; on machete+bow ~62.7, but that
  requires one villager holding six damage abilities —
  a godhood-tier holder, not the wild population. No
  single ability is a lever: haymaker alone adds ~33%
  to leader strikes (hunting 30.75 -> ~39.5 with the
  stack's other one-shots stripped out, the stack's
  sustained gain IS haymaker); aim/stalk/trade/dead_aim/
  blood_trail are one-shots or endgame-only (dead_aim
  needs the beast below 25% — never reached; blood_trail
  below 50% — rarely reached).
- FED POWER (feastburn parity, already live): the 1.25x
  topped-up mult is already in every number above. It
  is worth +20% of strike DPR (hunting 24.6 -> 30.75
  party) and it is already spent. There is no second
  feastburn to wire for NPCs: food.js's on-strike burn
  trigger is the OLD, retired path; the live path is
  villagerPowerMult, and it fires.
- SECOND ALLY: does not exist in code (one join per
  fight) and would add only ~4.5/round if wired.
- GODPATH VERBS: fieldAct verbs (pack harry 2-4, bird
  strike 8-12, next-strike mults) are one-shots gated on
  holding godpath abilities; strikeMult from
  combat.strike_damage modifiers (e.g. adrenaline_control
  x1.3) multiplies strikes, but only for holders — the
  same godhood-holder population problem as abilities.

## Q3 — tricks are not damage (5 trick cells, trick known)

Baseline hunting spear, trick known via
state.villagerTricks, 5 rng seeds each:

- INFLUENCER focus_followers: DPR 15.2 (vs 28.1
  baseline) — the trick COSTS strikes (2 focus rounds
  in 5) and the fight still ends vFlee at round 5 with
  the beast at 772/850. The trick-aware morale holds
  the line ("working the trick, not the damage race")
  while HP lasts, but it trades damage for buff-shrink:
  a survival lever, and a damage ANTI-lever. Judged on
  kills, it fails; judged on staying, it holds 2 extra
  rounds and still flees.
- EATER poison (spoiled food in pack): mFlee round 1,
  DPR 0.0, 5/5 — the beast vomits out of the fight.
  This IS a win by outcome (drive-off), at zero damage,
  but it fails the coordinator's kill+DPR frame by
  construction, and it needs two gates wild parties
  rarely meet together: trick known AND spoiled food
  carried. Without spoiled food: no trick fires, DPR
  24.1, vFlee 4/5 + vDie 1/5.
- AUDIT inefficient: DPR 18.9 (vs 28.1), fights extend
  to 6 rounds on trick-aware morale, still vFlee 5/5.
  Clearing the tax restores full strikes; it does not
  add damage.
- REUNION novelty: DPR 21.2, vFlee 5/5 — the wait resets
  the mirror's wear, but the wait is itself a lost strike.

Conclusion: no trick cell raises DPR. The trick system
is a survival/resolution system, not a damage system.
An arm that wires a trick harder (e.g. FIGHTOPEN=1
openers for audit/congregation/reunion/editor/
cancellation) buys earlier trick execution, not damage.

## Q4 — sense-testing law (transcripts read, beats quoted)

Verdict: COHERENT, with one narration blank. Both
fixtures end in the corpus retreat shape, and the beats
read as people fighting a losing fight well — not as
missing systems.

Transcript 1 — machete+bow vs fresh audit (1100 HP),
sense fixture, seed rng 9000:
- "sees the grey man with your paperwork coming and
  nocks an arrow — the fight opens at range (3 shots)."
- "loosed — it takes ... for 17 (1083 left)."
  "loosed wide — the arrow buries itself in the dirt.
  (spent)" "loosed — it takes ... for 15 (1068 left)."
- "R1: ... strikes for 41 (x1.2) (1027 left)"
- "R2: ... strikes for 45 (x1.3) (982 left)"
- "... is losing — shouts for help! ... charges in!"
- "R3: ... strikes for 41 (x1.2) (941 left)"
  "R3: ... strikes for 5 (936 left)"
- "R3: Assessment hits ... for 65 (35 left)"
- "... sees how this ends — and runs while running
  still works." (vFlee, beast alive at 936/1100.)
Judgment: the best honest party in the game — volley,
three heavy strikes, a friend's single blow — takes
164 off an 1100-HP beast and runs at the right moment.
The numbers are visible in the fiction: 936 left after
everything they have is the reason to run. Nothing here
reads broken; the gap is arithmetic, not behavior.

Transcript 2 — trick-known influencer (850 HP), 5 rounds:
- "R2: ... ignores the ring light and hunts the
  followers — a phone clatters, a fan-creature drops.
  (1 down.)"
- "... holds the line — working the trick, not the
  damage race."
- "R4: ... hunts the followers — ... (2 down.)"
- "R5: ... strikes for 24 (x1.3) (772 left)"
- "... is losing — shouts for help! ... charges in!"
  (vFlee; ally dealt 0 — joined on the final round and
  never struck, the zero-strike form of the one-strike
  cap.)
Judgment: the trick reads as a plan — hunt the
followers, hold the line while the trick works — and
the cost reads honestly too: 78 damage in 5 rounds,
beast at 772, party at 16 HP. The plan does not fail
for lack of sense; it fails because the trick spends
the rounds the damage needed.

NARRATION BLANK (found, not chased): transcript 2's
exit has NO retreat line — after the round-5 shout,
the fight ends by the HP-floor branch, which logs
nothing, unlike the hopeless branch's "sees how this
ends" line. A party that shouts and then silently
vanishes reads as a dropped beat. Small; for a future
narration pass, not this arm.

## Q5 — ranked next step (single first lever, with numbers)

1. TILE-PRESENT PARTY — FIRST. Change the board, not
   the numbers: every ally actually standing on the
   monster's tile (perception-legit, tile-mate-stamp
   class — needs the perceptform ruling first on whether
   tile-mate-outing-status counts as "same outing")
   joins the fight, not just one. Ceiling math:
   machete+bow leader (48.25 sustained) + 2 allies
   (9.0) = 57.25 sustained — an 850-HP beast dies in
   14.8 rounds (inside cap), an 1100-HP beast drives
   off in 16.3 (still over; with haymaker on the leader,
   ~67 sustained, 1100 drives off in 14.0). This is the
   only existing-system combination whose ceiling
   touches the band with earnable gear — but it is a
   party-size wiring + a perception ruling, not a
   damage tweak, and its prereg must define success as
   a kill (or drive-off), never staying, with the
   survival question (15 rounds at incoming damage)
   measured alongside.
2. SORTIE-DPR MEASUREMENT — SECOND (diagnosis before
   building): mustered parties (lingerersortie,
   cornered hold) are deliberate parties with built
   fighters, unlike wild accidents. Measure their DPR
   and kills first — if sorties already kill, the wall
   is a routing problem (get built fighters to the
   beast), not a damage problem, and no damage arm is
   needed at all.
3. STEVE-CALL — THIRD (if 1 and 2 fail): whether wild
   wanderers should EVER kill a wave-4 beast, or
   whether wave-4 kills are by design a mustered-party
   achievement. If the answer is "wanderers should
   kill," damage needs a genuinely new board lever
   (not a flat multiplier — Steve: control changes the
   board, not the numbers), and that lever needs his
   design ruling before any arm builds it.

What is NOT next: threshold loosening (retreatdiag
proved it converts retreats to deaths at median 1,547
further incoming vs ~100 HP); ally-only buffs (+4.5
ceiling); trick-wiring for damage (tricks cost strikes);
volley-for-wanderers (+32 one-shot, +2.1/round over 15
rounds); alien-weapon distribution (loot-economy change,
least-frequent lever).

## Control gate (this arm's own census, base code)

Seeds 75101–75108, tableseat-nowait verbatim,
LEANLINKRESCUE=1, TABLESEATNOWAIT=1, 180d death-aware,
competent policy, fieldparty-form-diag recorder, sweep
script verbatim from retreatdiag-a. Corpus:
evidence/2026-10-28/perseed-fieldability-a/ (s<seed>-
fresh.json + summary-fresh.json). 8/8 rows, recorder
errs 0, no overflow.

- CONTROL-SHAPE: PASS, reproduced EXACTLY. Meetings
  1272; judgedA (resolve/patrol/aid) 24, formed 0, kills
  0; judgedB (resolve/patrol) 18, formed 0, kills 0.
  Per-seed judgedA: 75106: 15, 75108: 9, all other seeds
  0 — the same two-host-seed shape as 1528Z/1942Z.
- WALL (this band; reported, NOT claimed as movement —
  base-code reproduction): national ever 7/8, final 6/8;
  table invited 4/8, entered 3/8; wins 3/8, all lesser,
  full seat 0/8; wave-4 reach 6/8; wave-5 0/8; median
  survival 146d; deaths 286; starvation 1.
- Death-cause shares (this band, all deaths): villager
  combat 110, villager-vs-villager combat 80, player
  the wild 41, villager expedition 22, villager monster
  14, villager ambush 4, player sickness 2, villager
  sickness 3, player contest 2, player the night 2,
  villager starvation 1, villager thirst 1, villager
  alien 1, player the arena 1, player "a stranger" 1,
  villager "a toad like a war drum, throat swelling" 1.
  (Cause-label drift vs retreatdiag, disclosed: the
  sibling arenalabel landing relabeled one player arena
  death as "a stranger" — totals identical at 286, wall
  identical on every field.)
- No wall movement is claimed from re-analysis alone
  (prereg). The control gate's job was instrument
  validation, and it passed exactly.

## Village assessment in plain words

The village's fighters are already doing everything the
game asks of them: they carry the best earnable weapons,
they shoot before contact when they have arrows, they
shout, a friend charges in, and then they run while
running still works. The audit's best party — machete,
bow, arrows, armor — still leaves 936 health on the
beast after its whole fight. Who thrives: nobody, at
wave 4, in the field, alone or paired — that is the
finding. Who dies: the same lightly armored wanderers
as every band before. Missing capability, still: a
party that can actually hurt a wave-4 beast — and the
audit says that party cannot be built by turning one
existing dial. It needs more hands on the tile, or a
deliberate muster that brings built fighters to the
beast, or a design ruling that wild wanderers are not
supposed to be the killers. That is the next blank, in
order, with its number attached: 57 sustained, from
hands, not from a multiplier.

## Metric review (for the NEXT run — never a mid-run re-score)

- FIXTURE DPR FLATTERS ONE-SHOTS: a 3-round fight's
  DPR divides a volley and an aimed strike by 3, not by
  15. The next damage prereg must judge SUSTAINED DPR
  (strike mean x power + ally rate) or, better, kills
  directly on a long-enough horizon — never fixture
  DPR over retreat-length fights. This arm's ceiling
  table reports both, labeled, so the flattery is
  visible, not hidden.
- FED POWER VARIES IN THE WILD: fixtures were fed
  (hunger 24, tier secure, 1.25x). A hungry wild party
  loses the 1.25x — sustained DPR falls ~20% (machete+
  bow 48.25 -> ~39). The ceiling table is therefore an
  UPPER bound for wild parties, which strengthens the
  DIAG verdict rather than weakening it.
- TRICK-KNOWN IS ASSUMED, NOT MEASURED, IN TRICK
  CELLS: the cells set villagerTricks by hand. Wild
  trick-known rates (2 observations per species from
  survived encounters) were not censused here; a future
  trick arm must census them before claiming any trick
  is reachable in the wild.
- PANEL NOTE (standing): scripts/balance-panel.js has
  no census-ingest mode; identical-seed before/after
  corpora are the §15 substitute, as in prior rounds.
  No panel artifact faked, no panel verdict claimed.
- TELEMETRY DEVIATION CHECK (loop body step 10): corpus
  path for the coordinator's check is
  evidence/2026-10-28/perseed-fieldability-a/*.json
  (metrics national,table,wins,exiled; baseline
  .../telemetry-baselines/scale-wall.json). Expected
  artifact class if LOUD lines appear, as in 1942Z:
  the baseline's regime does not match this substrate,
  and per-seed rows carry nationalEver/entered/won, not
  top-level national/table/wins paths. The band's true
  wall numbers are nationalEver 7/8, entered 3/8, wins
  3/8. Baseline NOT rolled by this arm; the coordinator
  judges any LOUD lines.

## Blanks filled or documented

- FILLED (diagnosis, not a fix): the damage lever's
  ceiling is now quantified per source — weapons,
  dual config, abilities, volley, fed power, tricks,
  second ally — with the formula verified against
  fixtures. The build arm is killed by measurement: no
  narrow existing-system wiring reaches 57–80 sustained.
- DOCUMENTED (for the findings backlog, not chased
  here): (a) spear-occupies-ranged-slot — spear+bow
  dual is not a real config; (b) HP-floor flee logs no
  retreat line (silent exit after a shout); (c) the
  tile-present party + sortie-DPR measurement as the
  ranked next steps (see Q5).
- NOT re-judged: retreatdiag-a DIAG-GO, perceptform-a
  NO-GO, shoutgate-a NO-GO, fieldfeed-a pilot-GO-only
  all stand as published.

## Test and infrastructure notes

- `node --check` clean on all three new scripts;
  scripts/test-fieldability-a-audit.js AUDIT-COMPLETE
  (12 configs x 2 beasts x 5 rng seeds + 5 trick cells
  x 5 seeds); scripts/test-fieldability-a-sense.js
  SENSE-SHAPE PASS (both fixtures vFlee, corpus shape);
  scripts/test-fieldability-a-debug.js used to resolve
  the volley/slot anomalies (equipped + volley + power
  printed per cell) — kept as an instrument.
- No jest in this arm (node scripts only); the
  --cacheDirectory=/tmp/jest-cache-sim-fieldability-a
  rule is recorded and vacuous here, not waived for any
  jest run.
- Safe-commit index clobber hit the prereg commit
  (staged-deletion twin of byte-identical files);
  repaired via HEAD-blob `git update-index --add
  --cacheinfo` with status-empty + diff-HEAD-empty
  verification, never `git reset`. No .git EPERM flap
  this run. No ref surgery.
- Zero src/js diff on this branch (verified at
  closeout); zero policy files added or changed; no
  other arm's corpus touched (predecessor corpora
  read-only; sibling loop-B trees/branches untouched;
  main-tree docs/ONTOLOGY.md untouched). No push, no
  bump, no live verification (ship-loop line). Ready
  for coordinator merge, pending ship — via the
  coordinator.

## Commits

- 9ad1900b43c133f58c42ae11067e9c0d46aa3019 prereg
  (before any judged sweep) + audit + debug instruments.
- Instruments + corpora + sense + this evidence: final
  commits on this branch (hashes in the run report to
  the coordinator).

## Convergence

scale-onramp stays converging (NOT converged): the
damage lever is now closed as a narrow build — its
ceiling is measured, its failure mode is arithmetic,
not behavior — but no wave-4 field party has yet
killed in the field, the full seat stays 0, wave 5
stays 0. The directive stands until the tracker records
this axis converged on measured evidence. Next blanks,
in order: (1) tile-present party (all tile-present
allies join) + the tile-mate-stamp perception ruling;
(2) sortie-DPR measurement; (3) Steve-call on whether
wild wanderers should ever kill wave-4 beasts.
