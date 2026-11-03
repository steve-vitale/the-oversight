# Turn-based lethality decomposition — Loop A, run fleshout-20261103T1945Z, arm sim-tbleth-a

Axis: scale-onramp (standing directive: the scale wall). DIAG-ONLY
arm: zero src/js, zero game-code change. This arm DECOMPOSES why
turn-based (TB) wave-4 fights lose; it does not fix them — any fix
touches TB engine code and belongs to a follow-up arm with its own
prereg.

## Pre-registration (committed before any judged sim)

`evidence/2026-11-03/sim-tbleth-a-prereg.md` (commit 2fb455351).
Policy `scripts/policies/competent.js` `{competent}` VERBATIM,
default env. Seeds 99101–99108 (the 1819/w4convert band).
Horizon 140 days, death-aware. Balanced panel (§15):
INAPPLICABLE — a pure diagnostic with no before/after change, so
no comparison is fabricated; the binding checks are the
calibration gate below plus the damage-ledger reconciliation.

Primary metric (pre-registered): kills per TB exposure + the
damage-ledger decomposition (dealt per round by source class,
taken per round by target class, rounds survived, monster HP
remaining at end, ranked factor table). No rate threshold was
pre-registered on the rate itself (§14: this is a diagnostic);
the verdict below judges the DIAGNOSTIC.

## Calibration gate — MATCH (run before the prereg commit)

The UNMODIFIED w4convert census driver was rerun on seed 99107
at this worktree anchor (HEAD 77ff4a807) with RUN=tbleth-calib:
days 80, village-lost, spawnsW4 3, tbCalls 2, tbStarted 2,
fieldsW4 0, killsW4 2, unlinked 0, orphans 0, errors 0. This
MATCHES the 1819 numbers for that seed exactly (3 spawns / 2 TB
/ 0 field / 2 kills / 80d lost). The `identity: DIVERGED` flags
in that run are vs the OLD vetbar pilot/census files — the known
anchor move already proven by w4convert, not a new divergence.
Baseline for this arm is therefore the CURRENT anchor (1819
numbers), never vetbar's old 70 exposures.

## Judged leg — reproduces the anchor exactly

Instrument commit 9d78f3ffb (proof `scripts/test-tbleth-20261103.js`
4/4 before the leg). Judged leg totals: 35 spawns / 23 TB starts
/ 5 field fights / 2 kills / 8 villages lost / median 90d —
IDENTICAL to 1819 on every seed (days, end reason, spawns, TB
starts, field fights, kills all match the w4convert table).
Instrument health: 0 instrument errors, 0 orphan TB ends, 0
unlinked kills, 0 unended TB exposures, 204 TB damage hits
recorded, 1,868 transcript lines captured across the 23 fights.
Every wave-4 monster ledger reconciled (gap 0 on all 24 monster
bodies incl. one mid-fight joiner; see "Ledger" below).

Per-seed (spawns / TB / field / TB kills / days / end):

| seed | days | end | spawns | TB | field | TB kills |
|------|------|-----|--------|----|-------|----------|
| 99101 | 71 | lost | 10 | 10 | 2 | 0 |
| 99102 | 108 | lost | 5 | 5 | 0 | 0 |
| 99103 | 85 | lost | 0 | 0 | 0 | 0 |
| 99104 | 97 | lost | 2 | 0 | 0 | 0 |
| 99105 | 100 | lost | 3 | 0 | 3 | 0 |
| 99106 | 95 | lost | 9 | 5 | 0 | 0 |
| 99107 | 80 | lost | 3 | 2 | 0 | 2 |
| 99108 | 71 | lost | 3 | 1 | 0 | 0 |
| TOTAL | — | 8 lost | 35 | 23 | 5 | 2 |

Per-seed TB detail (all 23 exposures; dealt = hpDelta sum on
monsters; frac = dealt / monster max HP at start):

| seed | day | monster | outcome | party | rounds | maxHP | dealt | frac | taken by leader | trick known |
|------|-----|---------|---------|-------|--------|-------|-------|------|-----------------|-------------|
| 99101 | 57 | eater | died | 1 | 9 | 1115 | 258 | 0.23 | 123 | no |
| 99101 | 61 | algorithm | died | 2 | 13 | 744 | 129 | 0.17 | 126 | no |
| 99101 | 61 | reunion | died | 1 | 5 | 900 | 5 | 0.01 | 129 | no |
| 99101 | 62 | eulogy | died | 1 | 4 | 675 | 54 | 0.08 | 103 | no |
| 99101 | 69 | algorithm | died | 1 | 6 | 750 | 141 | 0.19 | 105 | no |
| 99101 | 70 | algorithm | died | 2 | 6 | 609 | 99 | 0.16 | 145 | no |
| 99101 | 70 | algorithm | died | 2 | 7 | 500 | 158 | 0.32 | 127 | no |
| 99101 | 70 | algorithm | died | 2 | 8 | 330 | 47 | 0.14 | 114 | no |
| 99101 | 70 | algorithm | died | 1 | 4 | 283 | 16 | 0.06 | 152 | no |
| 99101 | 71 | algorithm | died | 1 | 4 | 267 | 1 | 0.00 | 136 | no |
| 99102 | 79 | eulogy | died | 1 | 6 | 1049 | 458 | 0.44 | 3225* | no |
| 99102 | 88 | algorithm | died | 1 | 10 | 1172 | 518 | 0.44 | 115 | no |
| 99102 | 89 | eulogy | died | 2 | 5 | 675 | 115 | 0.17 | 136 | no |
| 99102 | 92 | reunion | died | 1 | 6 | 1200 | 0 | 0.00 | 59 | no |
| 99102 | 97 | eater | died | 1 | 8 | 712 | 67 | 0.09 | 115 | no |
| 99106 | 75 | reunion | died | 2 | 4 | 2201† | 31 | 0.01 | 103 | no |
| 99106 | 85 | reunion | died | 1 | 6 | 900 | 142 | 0.16 | 109 | no |
| 99106 | 86 | suburb | died | 1 | 12 | 975 | 221 | 0.23 | 112 | no |
| 99106 | 92 | eater | died | 2 | 15 | 703 | 94 | 0.13 | 94 | no |
| 99106 | 93 | eulogy | died | 1 | 6 | 675 | 198 | 0.29 | 3683* | no |
| 99107 | 74 | suburb | KILL | 3 | 9 | 926 | 930 | 1.00 | 87 | no |
| 99107 | 76 | congregation | KILL | 2 | 9 | 675 | 785 | 1.16‡ | 0 | no |
| 99108 | 70 | influencer | died | 1 | 14 | 850 | 73 | 0.09 | 113 | no |

\* Eulogy "narrated ending" finisher (requested 9999; armor
absorbed 6774 / 6316, the rest landed). See factor 4.
† Pack of 2 reunion bodies (maxHP summed; one joined mid-fight
in another exposure — the joiner ledger is reconciled, see
"Ledger").
‡ Overkill: monster HP went to −110 (engine does not clamp at
0); dealt 785 vs 675 maxHP reconciles exactly (675 − 785 =
−110).

## Split tables

By outcome: kill 2/23 (0.087), fighter-died 21/23, fled 0/23,
pyrrhic 0/23, tb-other 0/23, tb-unended 0/23. NO turn-based
fight in the band ends in flight — fighters die rather than
escape. (Whether flight was ATTEMPTED is UNRECORDED: movement
intent is not instrumented by this arm; do not read "0 fled"
as "never tried to flee".)

By party at start: solo 0/14, +ally 2/9 (0.222). By party AND
outcome: solo lost 14/14; +ally lost 7/9, killed 2/9. Party is
still the only split with kills, and even with allies 7 of 9
TB fights end lost.

By monster kind: eater 0/3, algorithm 0/8, reunion 0/4, eulogy
0/4, suburb 1/2, congregation 1/1, influencer 0/1. The two
kills are different beasts on one seed, not a farmable type.

By lead gear: DEGENERATE again, as in w4convert — all 23 leads
armed, armorP 6–67 (median 37 on lost fights), weapons from
Stone knife to Phase blade. Phase-blade leads lost 2 fights
(458 and 518 dealt) and won 2. Gear does not differentiate
TB outcomes at this anchor.

Damage totals (all 23 TB fights): dealt to monsters — leader
4079, ally 461, ability-or-trick 0, other 0 (total 4540).
Taken by humans — leader 9323 (incl. 6908 from the two eulogy
finishers), ally 179. Excluding the finishers, leader taken is
2415 vs 4540 dealt — but the leader has 100 HP and the
monster 267–2201, so the same exchange kills the leader and
barely dents the beast.

## Ledger (pre-registered reconciliation)

For each wave-4 monster body: startHp + hpDelta sum = endHp
(tbEnd pre-call snapshot). All 24 bodies reconcile with gap 0,
including:
- the congregation kill's overkill (−110 end HP),
- the reunion pack fight's two bodies (2201 summed maxHP),
- one mid-fight joiner (join HP used as its start, flagged
  `joinedMidFight`, gap 0 — no false gap),
- the two finisher fights (the finisher's hpDelta is the whole
  landed 3225 / 3683; the ledger closes on it exactly).
No healing gap appears on any monster body. One human-side
healing note (not a ledger gap — humans are not ledgered):
in both kill fights allies patched the leader (+12 HP each,
transcript-verified; the congregation leader's HP rose 62.8 →
74.8 across the fight while taking 0 damage — the monster hit
the ally, who then fled at 49 HP, and the leader finished
alone). Human healing outside tbDamage (patches) is why human
HP is reported as start/end snapshots, never as a tbDamage
sum — the instrument does not claim otherwise.

## The ranked lethality-factor finding (plain words)

TB wave-4 fights are lost as a DAMAGE RACE the village cannot
win, not as a gear failure and not as a tactics failure the
numbers can see. Ranked by how much of the 21 losses each
factor explains:

1. THE RACE IS ~9x SHORT (explains all 21 losses). A lost
   fight ends with the beast at a median 84% of its starting
   HP (median dealt fraction 0.16; 17 of 21 below 0.25; best
   lost fight 0.44). At the pace actually dealt, a lost fight
   would need a median 53 rounds to kill its beast; fighters
   survive a median 6 rounds. The two wins dealt 87–103 damage
   per round; lost fights dealt a median 13.5 per round.
   The gap is not close — it is an order of magnitude.
2. TOO FEW SWINGS LAND (the mechanism behind factor 1). Lost
   fights land a median 3 leader strikes (distribution: 0–9,
   mode 3) at 0.42 strikes per round. Round 1 is a no-hit
   round in nearly every fight (closing distance), and later
   rounds repeatedly go hitless while fighters reposition
   ("Too far — 1 squares left" recurs in transcripts). Every
   narrated player strike lands — there are no hidden
   whiffs — so the shortage is swings attempted, not swings
   missed. When a strike does land it hits hard (60–130 with
   good weapons, OVERCHARGED ×1.25 well-fed in transcripts):
   fighters do not lack punch per swing, they lack swings.
3. THE MONSTER NEEDS ONLY ~4–5 HITS (the other side of the
   race). Excluding finishers, monster hits land a median ~26
   net damage after player armor absorbs a median 29 per hit
   (range 8–57 across TB transcripts); median total
   taken by a losing leader is 114 (excl. finishers) against
   100 HP. Armor is working hard — it absorbs roughly as much
   as it lets through — but 100 HP / ~26 per hit is a
   four-hit clock, while the beast's clock is 53 rounds.
   Allies barely change this: monsters focus the leader
   (ally taken 179 total vs leader 9323 incl. finishers),
   and allies add only 461 of 4540 dealt (10%).
4. THE EULOGY HAS A HARD CLOCK, NOT A RACE (2 of 21 losses,
   a separate mechanism). In 2 of 4 eulogy fights the beast's
   narration finishes in round 6 ("...they ended. The last
   line lands like a lid. You die as narrated") and deals a
   scripted 9999-requested blow (3225 / 3683 landed after
   armor). Both victims were far from killing it (0.44 and
   0.29 dealt). Against a eulogy, the race is not "outlast
   it" — it is "kill a 675–1049 HP beast in ~6 rounds or die
   narrated", i.e. ~110–175 damage per round sustained,
   against an observed median 13.5.
5. NO TRICKS, NO ABILITIES, NO COUNTERS IN ANY W4 TB FIGHT
   (0/23 on every measure). Trick-known for the fought kind
   is False in all 23 exposures; shouts 0, food-offers 0,
   useAbility calls 0 inside TB wave-4 exposures (the
   all-fight wrap counts show these actions DO happen in
   lower-wave fights — they simply never happen here). The
   honest reading is narrow: within these fights, the
   competent policy never deploys a counter or an ability.
   Whether that is because counters are unknown (trickKnown
   False everywhere supports this), because the policy's
   trick branch never triggers for these kinds, or because
   fighters die before a trick turn, is NOT separable from
   this instrument — it is the first question for the
   follow-up arm, not a verdict here. Note the classification
   caveat from the prereg: ability damage routed through the
   leader's strike path would read as leader damage — but
   with 0 in-fight useAbility calls, there is no such routing
   to hide behind in this band.
6. PARTY HELPS, GEAR DOES NOT (confirming w4convert, now with
   the mechanism). +ally fights deal more per round (31.4
   vs 20.6 solo, means) and hold both kills, but 7 of 9 still
   lose. ArmorP 6–67 and Phase blades lose solo. Nothing in
   the ledger suggests a gear lever closes a 9x race gap.

What does NOT explain the losses (ruled out by this
decomposition): unarmed/unarmored leads (none exist); dodged
or missed player strikes (none — every narrated strike
lands); monster healing (no monster ledger gap); low
food/energy at fight start (scholars enter well-fed —
OVERCHARGED lines recur — and median start energy is 95);
ability damage being siphoned elsewhere (ability-or-trick
dealt is 0 because no ability was used, not because it was
misclassified).

## Village assessment (plain words + sense-testing)

Picture eight villages playing competently for up to 140 days.
All eight die; the median village lasts 90 days. Their
fighters walk into wave-4 fights geared, fed, and (on 99107)
with allies beside them, and almost always die there: 21 of
23 turn-based fights end with the fighter dead and the beast
still standing at most of its health. The one village that
wins twice does it the same way both times — a Phase-blade
scholar landing ~100 damage a round for nine rounds while
allies strike beside them and patch them up — and still loses
its village four days later. Everywhere else the story is a
short fight: a few good swings, a beast that barely notices,
and a scholar dead by round six.

The sense-test passes on coherence and flags repetition, not
robotic behavior. The kill transcript reads like people:
Sam and Zoe strike, patch the leader twice (+12 HP each,
"Hold still!"), gasp when the leader is hit ("You're hit —
move!"), and the System credits Sam's killing blow on camera.
The death transcripts read like people too: mantle transfer,
the "You're not Rosa" exchange, keepsakes buried, the new
bearer waking as someone else with different hands. Two
repetition flags (flavor, not logic): "A mailbox falls over.
The street doesn't know how to react." after nearly every
strike in the suburb fight, and the suburb's "FOR SALE sign
ticks down: 3 rests remaining" line verbatim every monster
turn. One behavior question, not a verdict: in the 99102
reunion fight the scholar deals 0 damage across 6 rounds and
their turns leave no narration at all — only the monster's
"stalks closer" lines — while the beast returns the scholar's
own moves for the killing blows. From hits + transcript
alone I cannot tell whether the scholar spent those turns
fleeing toward the edge, kiting, or stuck out of range:
movement intent is UNRECORDED by this instrument (see metric
review). That fight is the sharpest single case for the
follow-up arm's turn-economy question.

## Spawns never fought (reconciliation class, as w4convert)

35 spawns vs 28 exposures (23 TB + 5 field; field counts from
the w4convert census definition, counted here only as
fieldCallsW4). Per-seed gaps: 99101 −2 (12 exposures from 10
spawns — some TB fights originate from non-spawn sources, as
w4convert found); 99104 +2 (both spawns at tile (4,3), days 83
influencer and 87 eulogy, village died day 97 without ever
engaging them — fate UNRECORDED, same tiles/days as w4convert);
99106 +4 (9 spawns, 5 exposures); 99107 +1; 99108 +2. The
engine records no spawn-fate event, so whether unengaged
beasts despawned, wandered off, or were still roaming at
village death is UNRECORDED, never guessed. Food/fullness at
fight start is likewise UNRECORDED as a single field (no clean
fullness field was found; scholar health + energy at start
ARE recorded per exposure — median energy 95 — and
transcripts show fighters entering well-fed).

## Metric review (§14 — no in-run re-scoring)

- The prereg's DIAG-GO bar ("every TB exposure decomposed,
  or ≥20 if the band yields more") is met at 23/23, with
  ledger gap 0 on all 24 bodies. No metric was re-scored: the
  outcome classes, source classes, and ledger rule are exactly
  as pre-registered. The one prereg caveat that mattered —
  ability damage routed through the strike path reading as
  leader — did not arise (0 in-fight ability calls).
- "Fled + flee round + reason" was pre-registered as a field
  per exposure; it is empty by outcome (0/23 fled), not by
  instrument gap. A follow-up arm that wants flee analysis
  must instrument movement/position (tbPlayerMove calls,
  fighter coordinates per round), which this arm deliberately
  did not — that is the gap this decomposition exposes, and
  it is the next blank below, not a defect in this arm's
  verdict.
- Rounds survived reads `f.round` at tbEnd pre-call, as
  pre-registered; round 1 is the opening round, and the
  no-hit-round-1 pattern is reported as-is.
- Food/fullness: pre-registered as "if readable" — it reads
  UNRECORDED (no single field), with health/energy recorded
  instead. A follow-up arm should not proxy it from pantry
  or feast flags; the transcript OVERCHARGED lines already
  show fighters enter well-fed, which bounds the question.
- Per-exposure kill rate 2/23 (0.087) reproduces w4convert's
  TB split exactly, as it must — this leg is the same band
  on the same anchor, decomposed deeper, not a new sample.

## Verdict — DIAG-GO

0 instrument errors; 0 orphan TB ends; all 23 TB exposures
decomposed (≥20 bar met at 23/23); damage ledger reconciled
on every exposure (gap 0 or, for the two finisher fights,
gap 0 including the finisher blow); every kill row linked or
reported unlinked (0 unlinked in the judged leg); a ranked
factor table is produced above; proof test 4/4. The GO covers
the diagnostic on the current anchor only. It does NOT fix
TB lethality and does NOT re-describe any other band.

## The single next blank

TB TURN ECONOMY: where does each round go? This decomposition
proves fighters land a median 3 strikes before dying and
spend most rounds not striking, but it cannot say why — move
vs wait vs telegraph vs out-of-range vs flee-attempt — because
movement and position were not instrumented. The follow-up
arm (diag, own prereg, TB only) should instrument per-round
turn economy for wave-4+ TB fights: moves spent, distance to
target, waits, monster telegraph/non-damage rounds, and
flee-attempt signals (edge walks), on the same band and
anchor (calibration gate first, as here). Only with that
table can a fix arm choose between its candidate levers —
more swings per round, longer staying, or a different
eulogy-clock answer — instead of guessing at a 9x race gap.
No gear arm, no ally-join arm, and no gate/price arm follows
from this decomposition: gear is degenerate, party is already
the only winning split, and gates are untouched by design.

## Proof and landing

- `scripts/test-tbleth-20261103.js`: 4/4 (outcome classes
  incl. pyrrhic, ledger reconcile + gap-open, stub known TB
  fight with fire counts / source classes / joiner / exact
  linkage / unlinked kill, live-harness smoke).
- Arm commits on branch sim-tbleth-a: prereg 2fb455351,
  instruments 9d78f3ffb (scripts only, zero src/js). This
  evidence file + the 8 per-seed JSONs
  (`perseed-tbleth-a/`) + the calibration JSON
  (`perseed-w4convert-a/w4convert-s99107-tbleth-calib.json`)
  commit on the same branch, pending coordinator merge
  --ff-only, pending ship (the ship loop owns version bumps,
  pushes, live verification).
- check.js --quick NOT re-run in full: zero src/js changed,
  same standing caveat as prior tooling-only landings; the
  arm's own proof (4/4) was run before the judged leg, and
  the judged leg itself reproduces the anchor exactly.
- Telemetry deviation check: not run by this arm (the
  coordinator runs it after evidence; the judged leg
  reproduces 1819 exactly, so no new deviation is expected
  from this arm).
