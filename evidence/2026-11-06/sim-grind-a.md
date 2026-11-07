# sim-grind-a — characterize the 41-HP grind (finding #1829) — GO

Run: fleshout-20261106T2256Z, Loop A. Axis: scale-onramp / winnability chain.
Arm: `sim-grind-a`, worktree `~/workspace/worktrees/sim-grind-a`.
Prereg: `evidence/2026-11-06/sim-grind-a-prereg.md` (committed BEFORE any
judged sim, fdf36014). Instruments: `scripts/grind-instrument-20261106.js`
(partydamage recorder + fieldFight wrapper with per-entity instance ids),
`scripts/grind-driver-20261106.js`, `scripts/grind-analyze-20261106.js`.
Proof: `scripts/test-grind-20261106.js` **54/54 PASS** (fixtures + the
87008 d131 grind shape reproduced from the committed partydamage corpus +
live smoke with off/on neutrality). Corpus:
`evidence/2026-11-06/perseed-grind-a/` (8 files, seeds 99641–99648, 150d
death-aware, competent policy verbatim, 0 instrument errors).
Anchor: tooling 2d05b64e.

## Verdict — GO

The grind is characterized with numbers, and the finisher-sizing lever is
named below (FINISHER-SIZE). No game-code change was made; no gate, price,
deed, or readyDemand change. Characterization only, per the prereg.

## The grind, in one paragraph

A wave-4 beast in the field is ground down in three currencies, and only
one of them is the villagers' own blows. Field fights deal a median 41
damage per meeting over a median 3 rounds, then the villager flees (79%)
or dies (8%) — and 28% of meetings deal no damage at all. The beast's
health only ever drops in big steps from two other sources: the scholars'
turn-based fights, and the palisade wall, which takes exactly 25% of max
HP off every raider it drafts on a raid night, floored at 1 HP. Every
single gap between re-meetings of the same beast on this band — 24 of
24 — is exactly one wall hit (the one exception is the 1-HP floor
itself). The field's only kill in 128 wave-4 fights was a contact
finish on a beast the wall had already delivered to 1 HP. The wound-mill
ruling IS wired for field fights, but its window is one strike of about
12 damage — it can only collect a beast already at ~12 HP or less. A
beast at 41 HP, the 87008 shape, cannot be finished in the field at all:
it is met, struck once, and flees. The tail is finished in turn-based
fights, or not at all.

## The field-grind distribution (primary metric)

Wave-4+ field fights, band 99641–99648 (n = 128):

| Measure | Value |
|---|---|
| Fights | 128 (of 1,000 field fights band-wide) |
| Outcomes | vFlee 101 (79%), vDie 10 (8%), mFlee 12 (9%), vKill 1 (1%), evade 4 (3%) |
| Rounds | median 3, mean 3.09, max 15 (only 1 fight reached the 15-round cap) |
| Damage per fight | median 41, mean 41.3, range 0–164 |
| HP left at fight end | median 775.5 (of 850–1500 max) |
| Entry frac | tail (<15%) 1, mid (15–75%) 45, fresh (≥75%) 77, unknown 5 |
| Zero-damage fights | 36/128 (28%): vFlee 20, mFlee 9, evade 4, vDie 3 |
| Contact finish | attempted 1, killed 1 (the only field kill) |
| Twoblow committed finish | 0 (14 band-wide, all wave 3) |
| Cornered-party hold | 0 |
| Volley kills | 0 (14 band-wide, all lower waves) |
| Scholar as field fighter | 0 rows |
| Regen suspect (entry > prev exit) | 0 |

Rounds-to-kill per field fight: there is no distribution — 1 kill in 128
fights, and it took 0 rounds (contact finish). No field fight that
reached rounds ever killed a wave-4 beast (0/127).

Same-day re-fights (field, wave 4+): 25 same-day same-mid groups;
24 extra same-day fights inside instance chains. Instance chains: 28
wave-4+ chains (same beast re-met by object identity), 2–8 fights each,
spanning up to 50 days.

## The palisade is the grind's silent partner

Field instance chains, inter-fight gaps (same beast, exit HP → next
entry HP): 24 gaps band-wide. **23 are exactly 25% of the beast's max
HP; the 24th is the 1-HP floor** (246 HP − 275 wall = floored at 1).
Mechanism (havenGrowth.js): on a raid night, if the village has a
palisade (havenTier ≥ 2), every drafted raider takes
`m.hp = max(1, m.hp − round(0.25 × maxHp))`. Examples: audit 641 → 366
(275 = 25% of 1100); eulogy 575 → 350 (225 = 25% of 900); strike 601 →
351 (250 = 25% of 1000); timeslot 1267 → 917 (350 = 25% of 1400);
suburb 1171 → 846 (325 = 25% of 1300). The villagers' own blows never
produce a gap like that — their median is 41. The wall does in one
night what the field needs ~7 meetings to do, and it is the ONLY thing
that brings a field-ground beast into finishable range: the audit chain
(d56–106, 8 fights, 825 → 1) reached 1 HP solely because the wall hit
it on the d105 night (246 − 275 → floored at 1); Vasyl contact-finished
it the next day for 12 damage.

Legibility: the raid line does say "The palisade's stakes take their
toll as they come over the wall" — the toll is announced in kind, never
in number, and never names which beast. A player sees beasts getting
weaker after raid nights but is never told the wall does a quarter of a
beast's health per night.

## The TB side: chains are the exception, the relay is the rule

Wave-4+ TB fights: 67 traces. Endings: scholar-death 47, kill 17,
rout 3 (kill rate 25.4% per fight). Consecutive same-(mid, maxHp)
pairs: 30 — exact continuation 6, further-wounded 2, reset-or-fresh
22. Most "re-fights" are fresh beasts of the same type, not the same
wounded beast. Multi-fight TB chains: 3.

| Chain | Shape | Cost | Result |
|---|---|---|---|
| 99643 reunion d133–134 | 549 → 285 → 0 (2 fights) | 1 scholar death | KILL |
| 99644 eulogy d61–66 | 675 → 501 → 403 → 251 → 0 (4 fights) | 3 scholar deaths | KILL |
| 99647 reunion d90–91 | 900 → 398 → 384 → 212 (3 fights) | 3 scholar deaths | no kill, village lost d99 |

Kill classification — all 18 wave-4+ kills (17 TB + 1 field):

| Class | Kills | Shape |
|---|---|---|
| Fresh single fight | 5 | entry frac 0.50–0.98, no prior fight on the trail |
| Cross-channel field → TB | 7 | TB entry == a prior field exit (same mid; lift fidelity per grindfinish-b 29/30) |
| Cross-channel field + wall → TB | 2 | TB entry == field exit − one wall hit (eulogy 350−225=125; editor 1378−375=1003) |
| TB chain | 2 | exact continuation, above |
| Field contact finish | 1 | audit at 1 HP (wall-delivered), 0 rounds |
| (timeslot d143, counted in the 7) | — | fight d142, kill logged d143 (midnight span) |

Method note: TB fighters are fresh copies (the lifted world object is
untouched during the fight), so TB↔field identity cannot be proven by
object — TB trace instance ids overlap field instance ids 0/8 seeds.
Cross-channel links rest on exact-HP trail matching (entry == prior
exit, or exit − wall), the method grindfinish-b validated (lift
fidelity 29/30, exact continuation 13/14). A fresh TB roll landing
exactly on a prior field exit is possible in principle (~1/250 per
roll); 9 such matches band-wide is not coincidence.

Damage-per-round in the tail: the tail is nearly empty on this band.
TB fights entered below 15% HP: 1 (99641 d142 eulogy, entry 125/900,
3 rounds, KILL, 134 damage, 44.7 dmg/round). Field fights entered
below 15%: 1 (the 1-HP audit, 0 rounds, contact finish for 12). The
villages almost never REACH the tail — they kill fresh/mid or die.
The 87008 tail (41 HP, five scholars, no kill) was a rare event; this
band's nearest shape is the 125-HP eulogy, killed in 3 rounds.

Scholar deaths during grind windows: 70 scholar deaths band-wide.
16/70 fell on wave-4 grind days (days with a multi-fight chain
fight) — but same-day is not caused-by: on 99644 d61 three scholars
died, only one in the eulogy chain fight (the other two died in a
wave-3 buffering TB fight and a wave-4 algorithm TB fight the same
day). Chain-attributable toll: TB multi-chains 7 deaths / 2 kills;
field instance chains 6 fighter deaths / 1 kill. The grind's price
is ~3 deaths per chain kill — and on 99644 the chain days carried 6
of the village's 7 scholar deaths. On 99641, the village strong
enough to pay it survived: 8 scholar deaths over 150 days.

## The wound-mill wiring verdict (guardrail b)

Steve 2026-10-27: defenders finish a crippled beast they meet if they
can — risk-weighted, not unconditional. For FIELD fights the ruling
IS wired, in three pieces (fieldFights.js):
- Contact finish (wave ≥ 3, beast met already below its break line,
  mBreak 0.15): one plain strike, lroll([4+wb, 8+wb]). Fired once
  band-wide, killed once (1 HP, 12 damage).
- Twoblow committed finish (in-round, wave ≥ 3): the beast stays if
  the last two blows sum to its remaining HP, fighter ≥ 60% HP,
  intent engage. Fired 0 times on wave-4 (14 times on wave 3).
  Arithmetic: two blows sum to ~12–16 damage; a wave-4 beast crosses
  its 15% break line at 127–225 HP — the gate can essentially never
  fire for wave 4. It is a wave-3 mechanism wearing a wave-4 coat.
- Cornered-party hold (lingererSortie only): 0 observed.
The ruling's spirit is NOT met for a 41-HP beast: defenders meet it,
strike once for ~12, and it flees. The next arm is the finisher
below — named here, NOT built here (characterization only).

## FINISHER-SIZE — the named lever (next arm)

Size the finisher from the measured tail, not from TB:
- The tail that matters is ~40 HP (87008: 41 HP; this band: the
  wall floor is 1 HP, the TB tail entry was 125 HP). The current
  contact finish tops out at ~12–20 damage in one strike — it can
  only collect the 1-HP floor.
- Candidate sizing (for the next arm to test, not a ruling): let the
  contact finish be a COMMITTED finish — the fighter (or the party
  beside them) keeps striking a beast met below its break line
  while they hold above the morale floor, instead of one strike
  then a free flee. Sizing target from this corpus: a 41-HP beast
  must die in the meeting (field damage ~41/fight says one meeting
  at ~3 rounds is the honest price); a 125-HP beast stays a TB job.
- Guardrail: if the sizing touches rounds-capping or armor-ignoring
  hits, that half belongs to Loop B's sim-bypass-b this run — name
  it there, do not build it here. The finisher as sized above is a
  damage/rounds shape, not a cap or pierce change.
- The Eulogy shape is a separate question (filed below): 11 of the
  12 field mFlees are Eulogy counter-dismissals — the villager
  works the trick for 2–3 rounds, deals 0 damage, and the story
  dismisses the beast kindly at full HP. The counter works as
  designed; it also means the field can never grind a Eulogy to
  death through its own counterplay.

## Wall numbers (national / table / wins, wave 4–5, median survival)

| Seed | Days | End | MaxWave | Standing | W4 kills | W5 kills | Living W4 killers | R5-ready days |
|---|---|---|---|---|---|---|---|---|
| 99641 | 150 | survived | 5 | 400 | 7 | 2 | 2 | 22 |
| 99642 | 132 | lost | 4 | 199 | 1 | 0 | 0 | 0 |
| 99643 | 145 | lost | 4 | 199 | 3 | 0 | 1 | 0 |
| 99644 | 71 | lost | 4 | 175 | 1 | 0 | 0 | 0 |
| 99645 | 137 | lost | 4 | 199 | 3 | 0 | 0 | 0 |
| 99646 | 125 | lost | 4 | 199 | 2 | 0 | 1 | 0 |
| 99647 | 99 | lost | 4 | 175 | 1 | 0 | 0 | 0 |
| 99648 | 64 | lost | 4 | 150 | 0 | 0 | 0 | 0 |
| **Band** | **median 128.5d** | **7/8 lost** | **w4 8/8, w5 1/8** | — | **18** | **2** | — | **22 total** |

Wins 0/8, national 0/8 (scaleRank village 8/8), table sittings not
recorded by this instrument (no table-sitting field in the corpus;
won=false on all seeds). Wave-4 faced 7/8 seeds (99648 fought no
wave-4 fight of any kind), wave-5 faced 1/8 (99641 only). Wave-4
unlocks 8/8, wave-5 unlocks 1/8.

Seed 99641 is the furthest the chain has run on a competent-baseline
pilot band: 7 wave-4 kills, 2 wave-5 kills (Timeslot, Editor, both
d143, both announced on camera), readiness-5 ready for 22 days
(veterans 2, armored 5, armed 6, tricks 32), 2 living wave-4 killers
at end, standing 400, survived the full 150 days — and still village
rank, still no win. The wall after wave 5 is national/table, not
kills: the village can now kill the Producers and still cannot climb.

## Sense-test read

**One contact finish — 99641 d106, the Audit at 1 HP.** The fiction
and the numbers agree for once: "Vasyl just put down The Loud Beast...
on CAMERA. That's a veteran kill, folks. REMEMBER the name." The
System celebrates the field finish exactly like a turn-based kill.
The catch a player would never see: the beast was at 1 HP because
the palisade took 275 off it the night before, and no line says so.

**One grind week — 99644 d61–66, the Eulogy.** Three scholars die
across the chain (Mabel, Dieter, Desmond on d61 alone — two of them
in OTHER fights the same day), then the fourth fight kills the beast
on d66. The deaths read coherently and grimly, each named, keepsakes
buried, succession speeches at the grave. But the fiction never names
the beast or the grind: six people die "in the wild" across a week
and no line ever says they died fighting the same Eulogy, or that it
is down to 251 HP. Same blank grindfinish-b found on 99313: the grind
is invisible in the fiction, so a player reads unrelated deaths, not
one siege being won an inch at a time.

**One silent kill — 99641 d142, the Eulogy tail.** Gen_iewoeql kills
a 125-HP Eulogy in 3 rounds; the scholar Majda dies the same day
"in the wild" and no veteran-kill line announces the kill — while
the two wave-5 kills the next day both get the camera line. DeathSays
is not capped here (357/400), so the absence is real, not truncation.
Fourth sighting of the announcement mismatch (fightinterior flagged
it; partydamage saw it twice): the System calls wave-3 kills veteran
kills and sometimes ignores real wave-4 kills. Not re-filed.

**One stall — 99642 d57, the Algorithm, 121 rounds.** A turn-based
fight ran 121 rounds to a rout with ZERO damage dealt on either side.
Same shape on 99641 d150: an Editor fight ran 148 rounds to a
scholar death (1500 → 931 HP). Turn-based fights have no round cap,
and these two stalled for 100+ rounds. Filed below; not chased here.

**The Eulogy stall, read aloud.** A 99646 field meeting: "R1: Final
Chapter hits Qing for 44 (24 left) — Qing is past holding — they run
while running still works." A 99641 meeting: "Pavel holds the line —
working the trick, not the damage race." The fiction is honest about
what is happening (they are working the trick, not winning the
damage race) and never says the price: three meetings later the beast
is still at 350 HP and Pavel has 24 HP left.

## Village assessment (plain words)

Eight villages, seven lost, one survived the whole 150 days. They all
reached the fourth wave, and this time they could actually kill its
beasts — eighteen kills, most of them in single fights, a few ground
down over days. The way they ground them down is the story: a villager
meets a beast in the field, lands a few blows, and runs for their life
after three rounds; the beast walks off barely scratched. Night after
night the palisade's stakes take a quarter of its health when it comes
over the wall. Days later another villager meets it, a little weaker,
and runs again. Eventually a scholar faces it with real weapons and
finishes it — or the village runs out of scholars first, which is what
happened on seven of eight seeds. The strongest village, 99641,
survived, killed two of the fifth wave's Producers, had two living
veterans and three weeks of readiness — and still sat at village rank
with no road to the table. The grind works, but it is a relay run by
three runners — field blows, wall stakes, and scholar fights — and the
baton only passes when the village is strong enough to keep paying
in lives.

## Metric review (§14)

Pre-registered primary metric: the field-grind distribution
(rounds-to-kill per field fight, HP left at fight end, scholar deaths
during grind windows, same-day re-fight counts, damage-per-round in
the tail). All measured, none re-scored:
- Rounds-to-kill: degenerate (1 kill / 128 fights, 0 rounds) — the
  distribution does not exist, and that IS the measurement: the field
  never kills a wave-4 beast in rounds.
- HP left at fight end: median 775.5; distribution table above.
- Scholar deaths during grind windows: loose proxy 16/70 on grind
  days; attributable 13 chain deaths / 3 chain kills. Same-day is
  not caused-by (99644 d61 shows why) — reported both ways, the
  loose number never presented as the toll.
- Same-day re-fight counts: 25 field groups, 24 extra same-day
  fights in instance chains, 1 TB same-day refight.
- Damage-per-round in the tail: n=1 TB (44.7) + n=1 field (12 in
  0 rounds). The tail is nearly unmeasured because villages almost
  never reach it — reported as a thin cell, not padded.
- Guards: wall numbers above; no gate/price/deed/readyDemand change
  (none made). Instrument errors 0/8 seeds. One metric correction:
  the grind-windows definition as first written counted wave-1/2
  re-fights as grind days; it was narrowed to wave-4+ chains BEFORE
  analysis (analyzer fix, proof test re-run 54/54) — the prereg's
  intent was always the wave-4 grind, and the narrowed numbers are
  the judged ones. The volley-kill definition was likewise narrowed
  before analysis (a contact-finish kill at 0 rounds is not a volley
  kill). No threshold or bar moved after the run.
- Convergence state: **converging** — the grind is characterized and
  the finisher is sized and named; the lever is unbuilt and untested.

## Prior-art note (why this arm is not a re-run of grindfinish-b)

sim-grindfinish-b (2026-11-05, band 99309–99316) characterized the TB
chain: lift 88%, no reset, kills came fresh. This arm re-measures on
a fresh band with what that instrument lacked — per-round field rows
with instance identity and finisher flags — and finds the field side
is NOT nearly absent here (128 wave-4 field fights vs 11 there; the
difference is band variance plus this instrument recording every
fieldFight call, including 0-round meetings). Its headline (the chain
is not the binder; the price is) still holds, sharpened: the price
binds through the RELAY (field + wall + TB), and the field leg of the
relay cannot finish anything above ~12 HP.

## Balanced panel (§15) and telemetry

- `scripts/balance-panel.js`: runs its own full panel and takes no
  corpus input, so it cannot compare a single-leg characterization
  on identical seeds. No Game-root change exists in this arm
  (competent verbatim, instruments only), so no compare `.md` is
  fabricated — same outcome as the pilot, the confirm, fightinterior,
  and partydamage.
- `scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json
  --current 'evidence/2026-11-06/perseed-grind-a/*.json' --metrics
  national,table,wins,exiled`: REFUSED — "refusing recorder-corpus
  input: all 8 --current rows carry top-level anchorCommit, so they
  are sweep recorder rows, not runs." Recorded as the result, same as
  partydamage. The baseline was NOT reseeded: a same-shape
  recorder-vs-recorder compare is the instrument's own route, and
  rolling a recorder corpus into a run baseline without it would be
  a category error.

## Findings for the backlog

- FINISHER-SIZE (named lever, next arm): the tail finisher as sized
  above — a committed finish for beasts met below their break line,
  target 41 HP in the meeting. (This arm's GO deliverable.)
- 100+ round TB stalls (open): Algorithm 121 rounds to rout with 0
  damage (99642 d57); Editor 148 rounds to scholar-death (99641
  d150). Turn-based fights have no round cap; these two stalled for
  100+ rounds. Mechanism unexamined here.
- Eulogy dismissal vs grind (open, touches signature canon): 11/12
  field mFlees are Eulogy counter-dismissals at full HP (0 damage).
  The counter works as designed — but the field can never grind a
  Eulogy through its own counterplay. Whether a dismissal should
  leave the beast wounded, or count as grind progress, is a design
  question for a later arm; do not change signature canon on a
  measurement run's say-so.
- (Not re-filed: the 1-HP lift-fidelity mismatch class — grindfinish-b
  already holds it (99315's 6 HP; this band's 99643 reunion 550 → 549);
  the veteran-kill announcement mismatch — fightinterior holds it,
  fourth sighting here.)
