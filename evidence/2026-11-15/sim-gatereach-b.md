# sim-gatereach-b — Gate-reachability instrument (diagnostic)

**Run:** Loop B, 2026-11-15. **Branch:** `sim-gatereach-b`, base
master tip `cb00f9818`. **Prereg:**
`evidence/2026-11-15/sim-gatereach-b-prereg.md` (frozen before any
judged corpus; one dated Correction appended before any verdict —
see §10).
**Seeds:** corpus 100821–100828 (8 seeds, verified fresh).
**Horizon:** 150 days, death-aware. **Policy:**
`competent-answercourt-b`. **Instrument errors:** 0 on all 8 seeds.
**Game-code change:** none — diagnostic only.

## Verdict: GO (instrument valid)

All four frozen bars hold. GO here means the instrument is valid and
its first numbers stand — it is NOT a verdict on any lever (no lever
was tested in this run).

## 1. The question, in plain words

The producergate pilot proved the seed half of the expedition
meeting works but the launch half almost never fires, the SEEK never
fires, and every wave-5 field kill arrives through the world-tick
path instead of the gate. This arm built the instrument that
measures, on a fresh baseline band, how wave-5 field fights
actually start and where launched parties go — so the NEXT lever is
aimed at the real meeting point instead of the assumed one.

## 2. Judgment against the frozen bars

| # | Bar (prereg) | Measured | Result |
|---|---|---|---|
| 1 | Classified share of wave-5 field fights ≥ 0.90 | 21/21 = **1.00** | **PASS** |
| 2 | Instrument errors = 0 | **0** | **PASS** |
| 3 | Corpus complete on all 8 seeds | **8/8 files, 0 parse errors** | **PASS** |
| 4 | Launch + wait-episode classification, unclassified ≤ 10% each | launches 0/40, episodes 0/4 | **PASS** |

**Verdict: GO.** The instrument classifies every wave-5 field
fight, every launch has a gate-arrival verdict, every wait episode
has an end reason, and the corpus is complete with zero instrument
errors.

## 3. Per-seed tables

| Seed | Class | Unlock day | First faced | Faced distinct | Field kills | TB kills | Kills | Field deaths W5* | Death-log W5† | Vet@unlock → @end | Ready days after unlock | Dominant short | Survival | End |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 100821 | LOCKED | — | — | 0 | 0 | 0 | 0 | 0 | 0 | — → 0 | — | — | 150d | survived |
| 100822 | LOCKED | — | — | 0 | 0 | 0 | 0 | 0 | 0 | — → 0 | — | — | 137d | village-lost |
| 100823 | KILLED | 90 | 110 | 1 | 0 | 2 | 2 | 0 | 2 | 2 → 3 | 62 | — | 150d | survived |
| 100824 | NEVER-FACED | 128 | — | 0 | 0 | 0 | 0 | 0 | 0 | 2 → 3 | 4 | weapons | 150d | survived |
| 100825 | KILLED | 69 | 73 | 4 | 2 | 5 | 7 | 0 | 7 | 1 → 2 | 53 | veterans | 150d | survived |
| 100826 | LOCKED | — | — | 0 | 0 | 0 | 0 | 0 | 0 | — → 1 | — | — | 150d | survived |
| 100827 | LOCKED | — | — | 0 | 0 | 0 | 0 | 0 | 0 | — → 1 | — | — | 150d | survived |
| 100828 | LOCKED | — | — | 0 | 0 | 0 | 0 | 0 | 0 | — → 0 | — | — | 150d | survived |

\* Field deaths W5 = wave-5 encounter rows with outcome `vDie`
(the encounter-row count this instrument was built to capture).
† Death-log W5 = deaths whose record names a wave-5 monster as the
killer (the old count — see §7 for why the two disagree).

Unlocked 3/8. Field kills 2 (both seed 100825), TB kills 7
(100823: 2, 100825: 5). Starvation 3 (100821: 1, 100824: 1,
100827: 1).

## 4. How wave-5 field fights actually start (the answer)

21 wave-5 field fights on the whole band — and all 21 are on a
single seed, 100825. The other two unlocked villages never fought
wave 5 in the field at all (100823's 2 kills are both TB;
100824 never faced).

| Start mode | Fights | vKill | vFlee | vDie | Ally joined mid-fight |
|---|---|---|---|---|---|
| aid-party (Haven door, lingering raider, aid crisis) | 7 | 2 | 5 | 0 | 5 |
| worldtick-party (beast wanders in, allies sensed) | 14 | 0 | 14 | 0 | 7 |
| expedition-party / expedition-solo | 0 | 0 | 0 | 0 | 0 |
| patrol-* / aid-solo / worldtick-solo | 0 | 0 | 0 | 0 | 0 |

- **Every fight started as a party of 3** (party-at-start 3 on
  21/21) — but that is sensed availability, not participation:
  an ally actually joined mid-fight in only 12/21. In the other
  9 the fighter was never losing badly enough for the hopeless
  shout to fire, so the "party" watched from the treeline.
- **The expedition path produced ZERO wave-5 fights.** Not one
  launched party ever met a wave-5 beast in the field.
- **Both field kills came through the aid door** (see §8 for the
  lines). The world-tick path fought 14 times and killed nothing
  — every one ended in a flee.
- **SEEK fired 0 times for wave 5.** The gate was never even
  consulted about a wave-5 beast on this band (0 wave-5 gate
  rows; see §5).

Wave-4 fights for reference (74 total): worldtick-party 39,
aid-party 31, worldtick-solo 3, expedition-party 1. The expedition
path produced exactly ONE fight in 95 wave-4+ field fights — the
d107 evade in §8. Aid is 31/74 of wave-4 fights and 7/21 of
wave-5 fights: the Haven-door crisis fight is a major channel,
not a corner case.

## 5. The launch → gate → fight flow, as measured

**Launches.** 43 win-plan holder departures, 40 actually launched
(3 failed departs, all seed 100824 — `startExpedition` returned
early, hurt/sick/medic-duty, so the dawn commit said "launch" and
nobody left). All 40 via the brain's dawn commit; the
`winPlanDepart` wrap recorded nothing live (the brain owns dawn
— see the prereg's code facts). Launch sizes: 31 at size 2
(fighter + 1 companion), 9 solo, **0 at size 3** — current master
launches at most one companion. Targets: 38 with no target
species at all, 2 targeting `spool` (a wave-3 beast). **No launch
targeted a wave-4+ species, and none carried needWave ≥ 4.**
The launches are generic win-plan hunts, not Producer hunts.

**Gate arrivals.** 9 of 40 launched parties reached the gate
(22.5%); 31 never met a beast inside their expedition window.
Days to gate: 0, 1, 2, 3, 3, 7, 10, 13, 18 — median 3 days.
All 9 gate rows are about wave-4 beasts; the gate was consulted
about wave 5 zero times. Gate results: 8× `avoid:outmatched`
(party 2, armed AND armored, trick unknown, stage `party`,
target none) and 1× null — the trick-hold (party 3,
armed+armored, trick unknown, stage `hunt`). Trick known at the
gate: 0/9. One gate row (d71, `strike`) served three separate
launches' windows — arrival counts launch-windows, not distinct
meetings; distinct gate meetings on the band number 9.

**Fights joined.** Exactly ONE launched party fought together:
launch d104 (zoe_adams, seed 100827, size 2, target none) →
gate d107 (null, trick-hold) → expedition fight d107 vs `strike`
(wave 4), outcome **evade** — "Zoe saw The Loud Beast in time and
gave it room." The gate withheld SEEK (trick unknown), awareness
evaded, no fight. Across the whole band, no launched party ever
fought a wave-5 beast together, and no launched party ever fought
any beast to a finish.

**Plans.** 18 plan seeds total, but the plan machinery and the
killing never co-occur in one village: the two KILLED villages
(100823, 100825) had ZERO win-plan activity — no plans, no
launches, no waits, no gate rows (their `winPlanStats` key does
not even exist) — while the plan-active villages (100822, 100827
and the 100821/100824/100826 stragglers) never unlocked wave 5.
At end of run, 18 plans held, 0 targeting a wave-5 species.
The brain's dawn log shows 21 win-plan commits (4 party_launch
+ 17 party_wait in the log slice) against 40 executed launches
and 7 executed waits — the log's byAction tally is not a census
of executes (it disagrees in both directions; see §12.4). The
departs wrap is ground truth. `winPlanStats.
partyDepartures` reads 0 despite 40 launches: the brain's launch
mirror bumps no win-plan counter (producergate's note, confirmed
here).

## 6. Party-waits: why waits end without launching

Only 7 wait rows on the whole band, in 4 episodes:

| Episode (seed, villager, target) | Waits | Second-companion waits | Median pool eligible | End |
|---|---|---|---|---|
| 100822, gen_nf5opwg, none | 1 | 0 | 0 | launch (d29) |
| 100827, gen_sitjalf, none | 1 | 0 | 0 | launch (d35) |
| 100821, gen_1mdba34, none | 3 | 0 | 0 | horizon (still waiting at d152) |
| 100827, aki_tanaka, none | 2 | 0 | 0 | hold-expired (d151) |

- **Second-companion waits: 0.** No wait was for a wave-4+
  plan at all (every wait's target is none, needsFull false) —
  the producergate wait problem (561 waits for a second ranger)
  does not reproduce here, because on this band the plans never
  reach for wave 4+.
- **The pool at wait time is empty: median eligible companions
  0.** The census of why: roster members failing each gate —
  away 24, wrong profile 26, dead/trust/not-at-Haven/engaged/
  already-on-expedition 0 each. At waits, the village's people
  are OUT (away) or are not wanderers/explorers — never
  distrusted, never busy, never elsewhere in Haven. The
  companion shortage is a where-are-they problem, not a
  trust problem.
- Two of four episodes end in a launch within days; one waits
  three days and is still waiting at the horizon; one waits two
  days and the hold expires. No episode ends in plan abandonment
  or the fighter's death on this band.

## 7. Field-fight deaths from encounter rows (the re-test bar)

The 2230Z run required the next kill:death bar to count field
deaths from encounter rows before any re-test. Here is that
count, and why it is not the whole story:

| Count | Wave 5 | Wave 4 |
|---|---|---|
| Encounter-row deaths (outcome `vDie` — the lead fighter dies in the fight) | **0** | 7 |
| Death-log deaths (record names a wave-5/4 monster as killer) | **9** (all villager, 0 scholar) | — |

**The two counts disagree by 9, and both are honest about
different things.** Of the 9 death-log wave-5 deaths:

- **7 died inside the scholar's turn-based fights** (cascade
  rows: `tbfightPresent: True`, last session vs the wave-5
  monster, provenance `breach`). A villager dies in the
  scholar's TB fight — the death log names the monster, the
  encounter rows (field fights only) never see it. These are
  not field deaths at all.
- **2 died in 'villager combat' with no TB fight present, on
  the same days as the two field kills** (d106 `cancellation`,
  d147 `finale_crew`, seed 100825). The d106 death follows a
  wounding fight against the same beast two days earlier
  (d104: Ella fled after taking 89, ally Zoltan joined); the
  d147 death is same-day as a 9-round kill in which an ally
  joined. Either an ally died inside a won fight, or a wounded
  villager died of wounds days later — the recorder cannot
  tell which, because neither death array names the victim.
  What it proves: **encounter-row `vDie` counts lead-fighter
  deaths only. Ally deaths inside a won (or fled) fight are
  invisible to it.**

**Consequence for the next lever's bar (metric review §11,
point 1):** a kill:death bar that counts only encounter-row
`vDie` will UNDERCOUNT the price of field kills — on this band
it reads 2 kills / 0 deaths (infinite ratio) while two
villagers died in 'villager combat' against the same beasts on
the kill days. The re-test bar must count encounter `vDie`
PLUS same-day/same-beast 'villager combat' deaths, or state
plainly that it prices only the lead fighter.

## 8. Sense-testing — do the fights read like fights?

Quoted verbatim from the corpora (`w5encounters[].log`).
21 wave-5 encounters scanned, fight lines found on all 21
(`log` rows; `lines` empty — the say-capture fires during the
fight, the log carries the rounds).

**Seed 100825, day 106 — Cancellation, Ella (field kill 1,
aid-party):** a mop-up, not a duel.
> "Ella does not let it slip away — they close in and strike with the hatchet for 15 — Big Ugly falls. (Contact finish)"
— 0 rounds, 15 dealt, 0 taken. Same beast Ella fled from on
day 104 after taking 89 (see below); she met it again at the
door and finished it. The classification matches what a player
would see: Ella + 2 sensed allies at the Haven door, closing
in together.

**Seed 100825, day 147 — The Commercial Break's crew,
visjoin_126 / Therese (field kill 2, aid-party):** a real fight
win, and the only one on the band.
> "R1: Blooded — the village knows where the Producers bleed. (Strikes hit 1.5× as hard; their blows land at 0.75× strength.)"
> "R1: Therese strikes for 23 (283 left)" / "Therese's gear absorbs 24." / "R1: Ad Break hits Therese for 8 (77 left)"
— 9 rounds, 307 dealt, 57 taken, ally Ingrid joined. The
Blooded bonus is narrated because the village knows the trick.
The classification matches: a party of three at the door,
fighting together.

**Seed 100825, day 104 — Cancellation, Ella (the wounding that
precedes kill 1):**
> "R1: Ella walks in open-handed — and it goes wrong. It doesn't want peace. They're exposed, off-balance. (Walk In — failed)"
> "R1: the stamp descends over Ella (1/3). Red ink."
> "R1: Blooded — the village knows where the Producers bleed…"
— 3 rounds, 80 dealt, 89 taken, ally Zoltan joined, vFlee.
The walk-in parley failing and the wounding read as a real
beating; the same beast returns two days later at 15 HP.

**Seed 100825, day 128 — Timeslot, Ivy (world-tick, the modal
wave-5 fight):**
> "R1: RESCHEDULED — THE GREEN ROOM. (The guide showed it coming.)"
> "R1: Blooded — the village knows where the Producers bleed…"
> "R1: Ivy strikes for 33 (837 left)"
— 7 rounds, 257 dealt, 65 taken, vFlee. A long fight, fought
well, fled anyway: 257 damage into an 837-HP remainder and the
fighter still walks away. This is the modal outcome — 14/14
world-tick fights end in flight.

**Seed 100827, day 107 — Strike, Zoe (the ONE launched-party
fight, expedition-party, wave 4):**
> "Zoe saw The Loud Beast in time and gave it room."
— evade, 0 rounds. The gate withheld SEEK for the unknown
trick, awareness did its job, and the launched party went home
without a fight. The classification matches what a player would
see: a party that set out together, met the beast, and gave it
room.

**Judgment.** The fights read like fights: range openers,
Blooded lines when the trick is known, walk-in parley failures,
gear absorbing blows, mop-up finishes of wounded beasts. What
does NOT read right is the expedition story: the only launched
party that ever met a beast gave it room and went home — the
hunt the plan promises never becomes a fight. And the two field
kills both happen at the Haven door to lingering raiders, not
out in the wild where the plans point.

## 9. Wall numbers

| | This band (baseline) |
|---|---|
| National scale, final | 6/8 |
| Table (seat taken) | 0 |
| Wins | 0 |
| Wave 4 unlocked (maxWave ≥ 4) | 8/8 |
| Wave 5 unlocked (maxWave 5) | 3/8 |
| Median survival | 150d |
| Village-lost | 1 (100822, d137) |
| Total deaths | 558 |
| Starvation deaths | 3 |

No balanced-panel compare is owed: the panel
(`scripts/balance-panel.js`) is for before/after comparisons
(§15) and this is a baseline-only diagnostic — stated in the
prereg, not a gap.

## 10. Instrument correction (before any judged corpus)

The first corpus run (same seeds/policy/horizon) was DISCARDED,
unjudged, never committed: its origin stamp read
`other:fieldFight` on all 95 wave-4+ fights (classified share
0.00 on an instrument bug, not on the game). Two defects were
found and fixed; the corpus was re-run with the fixed driver.
The prereg's bars are unchanged; the correction is appended to
the prereg, not silently edited.

1. **The stack reader stopped at the game's own wrapper.**
   `progression.js` `_attachFieldFight` wraps `Game.fieldFight`
   with a deed-recording wrapper, so the first src/js frame
   after the recorder's wrapper is named `fieldFight` — the
   real caller sits below it. `fightOrigin()` now skips frames
   named `fieldFight`. Proven live by the proof test's
   determinism case (150d, seed 100821): every encounter row
   carries a classified start mode.
2. **`aidFight` is a fourth field-fight caller.** The live run
   showed a wave-4 fight with origin `other:aidFight`:
   `aidFight` (comms.js) fights a lingering raider at the Haven
   door during an aid crisis, calling `fieldFight` with
   allied-village leaders as real combatants from round 1 — the
   ONLY live path that passes `allyFromStart`. Origin `aid` and
   start modes `aid-party` / `aid-solo` were added; the
   classified set is now eight modes. On the judged band, aid
   fights never actually carried foreign allies (0/38 aid fights
   had `aid:` allies; `allyFromStart` true on 0/38 — the
   help-at-door list was always empty), so every aid fight on
   this band was fought with Haven villagers. The foreign-helper
   absence is logged as a finding (see §12).

## 11. Next lever (named, with a prereg-ready GO bar)

The instrument's sharpest finding: **the aid door is where
wave-5 killing happens, and the expedition meeting is where it
doesn't.** Both field kills came through aid fights against
lingering raiders; the expedition path produced one fight in 95
(a wave-4 evade) and zero wave-5 fights; the world-tick path
fought 14 times and killed nothing. The gate/SEEK machinery
lives only in `expeditionMonster`, but the fights live at the
door and in the wild.

**Named lever — the aid-gate link.** Route aid fights through
the gate's SEEK branch: when a wave-5 lingerer is at the door,
`aidFight` consults `winPlanFightGate` first; on SEEK (party of
3 armed+armored at the door, trick known) the fight opens with
the trick, exactly as an expedition SEEK does today; on
outmatched the village still fights (it cannot walk away from
its own door) but the fight is narrated as a defense, not a
hunt. Nothing else changes: no gate bar, no standing or
readiness number, no win price, no deed gate, no table rule.

**Prereg-ready GO bar (for the future run; same primary as
producergate, so it compares):** pilot 8 seeds, confirm 16, on
this band's seeds as control vs the lever, 150d death-aware,
policy `competent-answercourt-b`. GO iff ALL hold: (1) wave-5
FIELD kills per unlocked village ≥ 1.00; (2) TB kills per
unlocked ≥ 0.5× control; (3) kill:death ≥ 0.92 where deaths
count encounter-row `vDie` PLUS same-day/same-beast
'villager combat' deaths (see §7 — the lead-only count
under-prices kills); (4) FACED-NOT-KILLED share among unlocked
≤ 0.20; (5) starvation ≤ control + 2 AND median survival ≥
0.8× control.

**Second candidate (not the pick):** lingerer-hunt seeding —
when a wave-5 beast lingers at the door, seed a win-plan hunt
for it, so the next meeting is a hunt instead of an accident.
It attacks the same gap from the plan side, but it assumes the
launch half can deliver a party to the beast, which this
instrument just showed it cannot (1 fight in 95). Fix the
meeting where the fights already are first.

## 12. Metric review (mandatory)

1. **Encounter-row `vDie` under-prices field kills.** See §7:
   the bar reads 2 kills / 0 deaths while two villagers died
   in 'villager combat' against the same beasts on the kill
   days (one plausibly a delayed wound death from the d104
   fight, one plausibly an ally dying inside the won d147
   fight). A future re-test's kill:death bar must count
   encounter `vDie` plus same-day/same-beast 'villager combat'
   deaths, or state that it prices only the lead fighter. The
   death log's killer-field count (9) is the wrong alternative
   — 7 of the 9 died inside the scholar's TB fights, not in the
   field at all.
2. **The gate recorder is blind below wave 4.** The gate wrap
   records wave-4+ rows only, but the gate fires for wave 3 too:
   `winPlanStats` shows 1 `seekContacts` + 1 `standingContacts`
   with 0 wave-4+ seek rows, so those SEEKs were wave-3 fights
   the instrument never saw. A future instrument should record
   wave-3 gate rows (or the analyzer should join the counters).
   The wave-5 conclusion is unaffected (0 wave-5 gate rows, and
   wave-5 SEEKs would have been recorded).
3. **Gate-arrival counts launch-windows, not meetings.** One
   gate row (d71 `strike`) served three launches' windows, so
   the 9 arrivals overstate distinct meetings (9 distinct gate
   rows exist, but they are not the same 9). A future instrument
   should record the expedition's return (or the gate row's id)
   so one meeting is not counted three times.
4. **The brain log is not a census of executes.** 4
   `party_launch` commits logged vs 40 executed launches, and
   17 `party_wait` logged vs 7 executed waits — the log's
   byAction tally disagrees with the departs wrap in BOTH
   directions, so it counts a different population (commits
   across brains and log windows) than the wrap's executes. Any
   future arm that judges the brain by its log will misread it;
   the departs wrap is ground truth.
5. **The classified-share bar survived its stress test.** The
   prereg anticipated another caller carrying a large share; it
   happened (`aidFight`, 38/95 fights) and the correction
   (§10) handled it before any judged corpus existed. The bar
   as written (≥ 0.90 over the corrected eight modes) is the
   right bar for the next run.
6. **The wait instrument measured almost nothing — honestly.**
   7 waits in 8 seeds: the plan stage that waits (`party`) is
   rare on this band because plans rarely form at all in the
   villages that unlock wave 5 (see §5). The wait diagnosis
   (empty pool: away + wrong profile) is real but thin; a
   follow-up band where plans form in unlocking villages would
   thicken it. The 150d horizon is long enough: only 1 of 4
   episodes was still open at the horizon.
7. **No panel compare, by design.** Baseline-only diagnostic;
   the prereg says so. The wall numbers in §9 are the
   comparison point for the next lever's control leg.

## 13. Proof and checks

- **Proof test** `scripts/test-gatereach-b.js` — **4/4 green**
  on the fixed driver tip: static (recorder wiring, wave-5 id
  set exact, driver/analyzer classifier agreement on 12 rows
  incl. aid-party/aid-solo, no src/ file touched), judge (8
  fixtures: GO shape, one NO-GO per bar, boundary GO,
  zero-fights NO-GO), recorder (synthetic 2-seed fixtures:
  start-mode split, field deaths from encounter rows vs the
  death log's killer field, gate fail conditions,
  launch→gate→fight joins, all five wait-episode ends,
  second-companion waits from the pool census, negative-TB
  flag), determinism (seed 100821, 150d, twice identical, 0
  errors, every encounter row classified, ≥1 world-tick
  origin).
- **Driver determinism on the corpus band:** the re-run
  reproduced the first run's per-seed summaries exactly
  (same deaths/days/endReason/waveKills on all 8 seeds) — the
  recorder fix changed only the recorder fields, not the game.
- **`node scripts/check.js --quick` NOT run:** this arm touches
  no game code (scripts + evidence only; `git status --porcelain
  -- src/` empty, asserted by the proof test's static case), and
  sibling Loop A workers are running tests concurrently on the
  shared tree — a parallel quick run risks the documented
  concurrent-jest phantom failures. The instrument's own proof
  suite (4/4 green) is the relevant verification; the ship loop
  owns verification of merged content.

## 14. Files

- Prereg: `evidence/2026-11-15/sim-gatereach-b-prereg.md`
  (incl. the dated Correction, §-"Correction").
- Evidence (this file): `evidence/2026-11-15/sim-gatereach-b.md`
- Analysis (analyzer JSON): `evidence/2026-11-15/gatereach-b-analysis.json`
- Corpora: `evidence/2026-11-15/perseed-gatereach-b/` (8 files)
- Instrument: `scripts/gatereach-driver-20261115.js`,
  `scripts/analyze-gatereach-b.js`,
  `scripts/test-gatereach-b.js`
- Lever: none — diagnostic only, no game-code change.
