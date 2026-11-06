# sim-finishprobe-a — finishing probe → build (DIAG-GO via P3, Stage 2 NO-GO)

- Run: `fleshout-20261106T0615Z`, axis scale-onramp / winnability chain
- Arm: `sim-finishprobe-a`, branch `sim-finishprobe-a`, worktree `~/workspace/worktrees/sim-finishprobe-a`
- Band: 55001–55008 (8 seeds, verified fresh — 0 hits in all preregs and all
  evidence .md; coordinator's claim names the same band, shared with sibling
  sim-stageally-a by design)
- Policy: competent verbatim, 150d death-aware horizon, anchor `3e8b3024d34d`
- Prereg: `evidence/2026-11-06/sim-finishprobe-a-prereg.md` (Stage 2 amendment
  appended 2026-11-06, committed `7e061dc` before any Stage 2 work)
- Corpus: `evidence/2026-11-06/perseed-finishprobe-a/` (8 files),
  analysis `evidence/2026-11-06/finishprobe-a-analysis.json`
- Instruments: `scripts/finishprobe-instrument-20261106.js`,
  `scripts/finishprobe-driver-20261106.js`,
  `scripts/finishprobe-analyze-20261106.js`,
  `scripts/test-finishprobe-20261106.js` (**41/41 PASS**)
- Supplements (read-only, competent verbatim, same band, in `/tmp`):
  holdings + turn-use (`/tmp/finishprobe-holdings-34174`),
  gear-engine cross-check (`/tmp/finishprobe-gear-34175`),
  corpus regen with the fixed instrument (`/tmp/finishprobe-regen-34176`)
- Verdict: **Stage 1 DIAG-GO via P3. Stage 2 NO-GO by arithmetic — no policy
  built, no pilot spent.** No gate, price, or deed change anywhere in this arm.

## The blank this arm fills

secondkiller-b's next blank (1) was literally this arm: the finishing
probe/build, kill conversion primary. Prior arms had established that
wave-4 kills are rare (3/58 wild, 5.2%) and that post-first-blood kills
never happen (0/19), but nobody had classified every fight ending from
engine records to say *why* — whether the monster gets away, the fighter
walks away, or the fighter dies. The sigoff SAY-census claimed every
wave-4 fight ends with the monster fleeing (mFlee). This probe tested
that claim against the engine's own records.

## Stage 1 verdict: DIAG-GO (P3 fires)

| Rule | Test | Result |
|---|---|---|
| P1 round-cap remainder | ≥25% of wild w4 fights end non-kill with monster endFrac <0.15 | **NO** — 0/57 (near-miss share 0) |
| P2 disengage-ability leak (game-code-only) | ≥15% of wild w4 field fights end mFlee via staredDown/peacemaker/poison-meal | **NO** — 0/17 field fights end mFlee at all |
| P3 TB damage-race / ability gap | TB kill rate <10% AND ≥50% of TB losses end beast >50% HP AND abilities used in <25% of TB fights | **FIRES** — 5.0% < 10%; 27/38 = 71% > 50%; 7/40 = 17.5% < 25% |
| P4 fresh-vs-lifted split | fresh TB kill rate ≥20% AND lifted ≤5%, ≥5 fights per bucket | **UNJUDGEABLE** — pending-live bucket n=1 (0/1); lifted 2/37 (5.4%), fresh 0/4 |
| P5 ally effect (probe-only) | ally-present vs solo kill rates | reported only — TB ally 0/11 vs solo 2/29; field ally 0/6 vs 0/11. Handed to sim-stageally-a; this arm builds no ally lever. |

## Ending classification — the whole answer in one table

57 wild wave-4 fights, 2 kills (**3.5%**). Instrument errors: 0 on all seeds.

| Channel | Fights | Kill | Scholar/villager death | Fighter walks away | Monster gets away | Evade |
|---|---|---|---|---|---|---|
| TB (player) | 40 | **2 (5.0%)** | 38 scholar-death | 0 scholar-flee | 0 rout | — |
| Field (villager) | 17 | 0 | 2 villager-death | 10 vFlee (morale floor) + 2 suburb-walkout | **0 mFlee** | 3 |
| Arena field | 0 | 0 | 0 | 0 | 0 | 0 |
| **Wild total** | **57** | **2** | **40** | **12** | **0** | **3** |

- **mFlee: 0 of 57.** The monster never gets away — not once, in either
  channel. The sigoff SAY-census claim ("every wave-4 fight ends mFlee")
  does **not** reproduce in record-based classification on current master.
  What the SAY lines called "the monster got away" is, on the engine's
  records, the fighter walking away or dying. See the reclassification
  note below.
- **Round-cap: 0.** No field fight reaches 15 rounds (14 at 1–3 rounds,
  3 contact-0). There is no treeline siege grinding down to a round-cap
  remainder — P1's pattern does not exist on this band.
- **Near-miss (monster endFrac <0.15 in a non-kill): 0.** No fight ends
  with the beast nearly dead. The kills are not almost-happening; the
  losses are not close.
- **Post-first-blood: 0/11 wild** (TB 0/4, field 0/7) — reproduces
  secondkiller (0/19) and killersim2 (1/45). Once a village has its
  first wave-4 kill, nobody ever lands a second one in the wild.

### Kill-rate splits (TB, n=40)

- By entry: lifted 2/37 (5.4%), pending-live 0/1, other-nonlifted 0/2.
  By entry frac: wounded 0 fights, middle 2/36, fresh 0/4.
- By ally: ally-present 0/11, solo 2/29.
- By rounds: 1–5 rounds 0/15, 6–15 rounds 0/22, 16+ rounds 2/3.
  (Both kills took 32 and 46 rounds — see below.)
- By monster: algorithm 0/12, reunion 0/10, eater 0/7, suburb 0/4,
  eulogy 0/3, congregation 0/2, **Strike 2/2**.

### Damage (the honest numbers)

- TB median damage dealt: 7.2% of entry HP. Field median: 0.9%.
- TB lost fights: median 6 rounds, median 2 strikes, median 2 swings
  per round attempted ~0.33 — the scholar spends roughly half its turns
  moving (median 3 moves) and almost none on abilities (median 0).
  8 of 38 lost fights had **0 swings** — the scholar never struck once.
- Swings/round by monster (lost fights): algorithm 0.40, eater 0.17,
  reunion 0.45, congregation 0.56, eulogy 0.60, suburb 0.33 — low
  across ALL monsters, not Strike-specific.
- Field fights: villagers flee at the morale floor after 1–2 rounds
  with vHpLeft 5–24 (fleeHpFrac 0.05–0.24), dealing 0–74 damage.

## The two kills (both vs Strike — the monster that does not attack)

- **55005 d121 — Carlos Diaz vs Strike**, solo, lifted, treeline siege,
  32 rounds, 29 swings, 695 damage, **no abilities used**,
  endScholarHp 100.
- **55006 d113 — Nina Petrova vs Strike**, solo, lifted, treeline siege,
  46 rounds, 12 swings, rage used once, 750 damage, endScholarHp 96.6.

Every attacking wave-4 monster killed the scholar on this band. The two
kills happened only because Strike shuts the grid down instead of
attacking — the scholar had 32–46 rounds with zero incoming damage to
grind down 695–750 HP. That is the whole kill window on this band: a
monster that does not hit back.

### The grind, seen again

55001's Algorithm was fought **6 times in a row** (entries 900 → 750 →
634 → 620 → 546 → 499), each fight dealing 14–116 damage and each
scholar dying, the beast keeping its wounds between fights — the same
grind price grindfinish-b found (six scholars died grinding one beast
750 → 114 HP). The grind works as plumbing; its price is six lives for
a beast that still stands at 482 HP.

## Supplements: holdings, gear, and the arithmetic that kills Stage 2

Two read-only supplements ran on the same band to pin the Stage 2 build.
Both reproduced the judged corpus fight by fight (trajectory identity
verified: same days/endReason/fights/kills per seed; per-fight
day/channel/mid/outcomeRaw/rounds/swings/entryHp/mHpLeft identical).
0 instrument errors on every leg.

### Holdings + turn-use (40 TB fights)

- Scholars hold MANY abilities (0 fights holding zero). Combat-pressable
  holdings: patient_aim 17 (**used 0**), rage 8 (used 6 — the cascade
  presses rage when held), hogtie 10 (used 0), war_cry 2 (used 0),
  pocket_sand 1 (used 1), peacemaker 14 (never pressed by the cascade);
  **bird_strike 0, freeze_tag 0, turncoat 0 — held by nobody**, so the
  cascade steps that name them can never fire.
- Scholar kcal at fight start: median 2082, only 1 fight below 240
  (dinner reserve 200 + cheapest press) — **kcal is NOT the binding
  constraint**.
- Scholar HP frac at fight start: median 1.00 — scholars enter wave-4
  TB fights at full health and die in ~6 rounds.
- Turn budget in lost fights (n=38): rounds median 6, strikes median 2,
  **moves median 3**, waits 0, abilities median 0. The scholar spends
  about as many turns moving (flee-walks, closing distance) as striking.

### Gear — the judged corpus was wrong, and the correction matters

The judged corpus's gear columns reported weaponId None in 40/40 TB
fights and armorP 0 throughout — as if scholars fought wave-4 monsters
bare-handed and unarmored. That was an **instrument bug**, found by the
gear-engine cross-check: `gearOf` read `Game.getPerson(vid).equipped`,
which does not return the scholar's live equipped slots in the harness.
The engine's own `Game.equippedWeapon()` shows scholars **armed in
37/40** TB fights with real weapons (hunting spear +30 ×6, harvest
scythe +40 ×4, machete +35 ×3, phase blade +60 ×2, fire-hardened spear
+15, stone knife +12, sharpened stick +5, crowbar +12, hatchet +15,
kitchen knife +8, searcaster +120 ×1; unarmed 3/40) and wearing real
armor (hide armor, bark armor, riot gear, worldroot plate; armorP 0–60
across fights). The two killers were armed (crowbar +12; harvest scythe
+40 with a hunting spear +30 in pack). Damage/strike scales cleanly
with weapon bonus (median by bonus: +5 → 8.5, +12 → 15.7, +15 → 18.9,
+25 → 40, +30 → 40.7, +35 → 46.3). Weapon bonus flows into strike
damage; the scholars are not fighting bare-handed.

The instrument was fixed (`gearOf` now uses the engine's own
`equippedWeapon()` + `state.scholar.equipped` for the scholar; the
getPerson path stays for non-scholar fighters with a caveat), the proof
test gained 4 gearOf regression tests (41/41 PASS), and the corpus was
**regenerated with the fixed instrument** — 57 fights, 0 non-gear
mismatches against the judged corpus, and the analyzer re-run is
identical on every key. No verdict number moved. The old gear columns
must never be cited.

### The Stage 2 upper bound (why nothing was built)

The P3 build as pre-registered (hold-ground + cascade extension:
patient_aim / freeze_tag / hogtie / rage / war_cry ordering,
never-flee-once-committed) was sized against the supplements:

- Entry HP floor is **350** (range 350–1325, median 712). Zero fights
  entered below 350; 7 entered at or below 500.
- Median survival in lost TB fights is **6 rounds**; damage/strike tops
  out at ~46 (best observed gear, +35 bonus).
- Upper bound, generous to the point of unattainable: every round a
  strike at the fight's bonus-implied damage/strike, plus one aimed
  strike at 2.5x — zero movement, zero tricks, zero misses beyond
  measured rates, full survived rounds granted. Under that bound **at
  most 1 of 38 lost fights flips to a kill** (55007 d78 eater: 672
  projected vs 664 entry, a 1% margin), and that fight is
  pre-first-blood, so post-first-blood kills under the bound are **0**.
  The bound's kill rate would be 3/40 = 7.5% — below the 10% GO bar;
  the post-first-blood leg (needs ≥2) is 0.
- The ceiling fight on the band proves it from the other side: 55002
  d72 congregation, **18 rounds** (longest survival), 13 swings, 529
  damage dealt of 1052 entry with a +30 hunting spear — the beast
  still stood at 523 HP. Even the best fight on the band dealt only
  half a beast's HP. (That scholar held patient_aim and never pressed
  it — the cascade gap is real, but adding one aimed strike, ~+60,
  still leaves ~460 HP standing.)

**Stage 2 verdict: NO-GO by arithmetic. No policy file was created, so
there is nothing to revert, and no pilot was spent.** Building the P3
policy and piloting it would have spent a run confirming a foregone
NO-GO. The DIAG verdict stands — the probe named the mechanism — but
the mechanism is not a fight-policy gap.

### The named mechanism (plain words)

Wave-4 fights do not end with the monster getting away. The monster
never flees, and the fighter never escapes either. They end with the
scholar dead (38 of 40 turn-based fights) or walking away from a field
fight after a round or two. The scholar cannot finish the beast because
the beast has roughly ten times the scholar's health and hits hard
enough to kill the scholar in about six rounds, while the scholar's
strikes — even with a good weapon — take only a small bite each round.
The two kills on the band happened only against the one monster that
never attacks, where the scholar had all the time in the world. **A
finishing move cannot fix a fight the scholar does not live long enough
to finish.** The binding constraint is survival time × damage per
strike vs entry HP — a game-balance fact, not a fight-policy gap.

### Game-code proposal (reported, NOT built — a Steve call)

The levers that could open a real kill window are balance levers, not a
fight policy: (a) survival time — armor/damage mitigation that lets a
scholar stand 15+ rounds against wave-4 damage (scholars already wear
the armor they own; the question is whether the mitigation curve is
enough); (b) damage per strike — weapon tier already flows and is
already the best owned; (c) entry HP — deeper wounding before the lift
(the grind's price binds: six scholars died grinding one beast
750 → 114 HP in the grindfinish arm); (d) party damage — the sibling
arm sim-stageally-a owns ally-staging in TB. No gate, price, or deed
change is proposed. No src/js change was made in this arm.

### P3 leg-2 honesty note

P3's second leg (71% of TB losses end with the beast above half HP)
measures entry state more than damage output: beasts enter lifted at a
median 70% of max HP, so they end above 50% almost by construction.
The honest damage measure is damageFrac (median 6.8% of entry HP
dealt; median 47 damage of 712 entry). P3 fired as written; the leg is
reported with this caveat.

## The sigoff reclassification

The sigoff SAY-census claim — "on the sigoff leg every wave-4 fight
ends mFlee, the monster gets away" — cannot be HP break-line flight for
wave-4 on current master: no wave-4 monster carries a `flee` component
and all wave-4 `fleeAt` = 0 (verified in `src/data/monsters.json` and
`src/data/monsterBehaviors.json`; only `lockpick_raccoon` carries
`flee: true`). The field and TB flee checks both gate on it. On the
engine's records, 0 of 57 fights end with the monster leaving. The SAY
lines the census read as "got away" are the fighter's own walk-away
(field round-cap / morale-floor vFlee, 10 fights) and the scholar's
death (38 TB fights) — the village experiences the beast as "gone"
because the fighter is gone, not because the beast fled. Any future
SAY-based mFlee count for wave-4 must be checked against the fled
flags and the ending taxonomy, not the narration alone.

## Wall numbers

| Seed | Days | End | W4 fights | W4 kills | Standing |
|---|---|---|---|---|---|
| 55001 | 57 | village-lost | 7 | 0 | 145 |
| 55002 | 123 | village-lost | 6 | 0 | 175 |
| 55003 | 95 | village-lost | 0 | 0 | 99 |
| 55004 | 90 | village-lost | 6 | 0 | 135 |
| 55005 | 150 | survived (not won) | 18 | 1 | 199 |
| 55006 | 130 | village-lost | 10 | 1 | 150 |
| 55007 | 81 | village-lost | 10 | 0 | 120 |
| 55008 | 83 | village-lost | 0 | 0 | 99 |
| **Band** | **median 92.5d** | **0 wins** | **57** | **2** | — |

Wins 0/8, national 0/8, table 0/8, wave-4 unlocks 6/8, wave-4 faced
6/8, wave-5 unlocks 0/8, wave-5 faced 0/8, readiness-5-ready days 0,
living wave-4 killers at end 0/8.

## Village assessment (plain words)

Eight villages, six reached the fourth wave, none won, none even
opened the fifth wave's door. The villages are not losing because
their fighters run away or because the monsters slip off into the
trees — the monsters stand and fight, and the fighters stand and die.
A village sends its best person out against a beast with ten times
their health, and that person lands a couple of good hits with a real
spear and then dies in about six rounds. Twice, against the one beast
that never fights back, a fighter had the time to wear it down and
came home with a kill — and both times that kill was the village's
only one, and the killer did not live to make a second. The road to
the full seat is blocked not at the door but in the field: the village
cannot kill the beasts the door demands, because no one lives long
enough in the fight to finish one.

## Sense-test reading

- **55006 d113 (Nina's Strike kill):** the SHUTDOWN line ("the picket
  line holds. Your abilities sputter, your items sit dead, the grid
  itself refuses…") repeats verbatim ~30 times across the 46-round
  fight — the same robotic repetition secondkiller-b noted. The fight
  is winnable only because Strike never attacks, and the narration
  spends 46 rounds saying the same sentence. Sense flag for monster
  narration, not for the verdict.
- **55005 d121 (Carlos's Strike kill):** no SAY lines were captured for
  the kill day in the driver's death/fight filter — the village's first
  wave-4 kill on that seed passes without a captured triumph beat (the
  gap grindfinish-b noted: the kill passes without a "we killed it"
  beat; a carcass line exists elsewhere). A first kill should sound
  like something.
- **55005 d131 (the 20-HP Eulogy):** a villager fought a Eulogy at
  **20 HP** entry, dealt 0 damage (spent turns on `contradict`
  tricks), and fled; a second fight the same day vs the same 20-HP
  Eulogy ended with the villager dead — killed by a nearly-dead beast
  while arguing with its narration instead of striking. Sense flag for
  the Eulogy contradict-vs-strike choice in field fights.
- Field fights otherwise read coherently: flee lines name the morale
  floor honestly (vHpLeft 5–24 at flee).

## Balanced-panel compare

**INAPPLICABLE — no armed leg exists.** Stage 2 was NO-GO by
arithmetic, so no finisher policy was built and no armed pilot was
run; there is no before/after pair to compare. The judged Stage 1
corpus on 55001–55008 (competent verbatim) stands as the before-leg
for any future arm that proposes a lever against this wall — it must
run its armed leg on these identical seeds and attach the balanced
panel then (`scripts/balance-panel.js`, MEASUREMENT.md §15).

## Metric review

- The sigoff "mFlee" claim was SAY-census, not record-based. The
  probe's record-based taxonomy reclassified those endings: 0 mFlee,
  10 field vFlee + 38 TB scholar-deaths. The probe did not inherit the
  SAY label (prereg metric-review note, confirmed).
- TB swingsAttempted counts player strikes only; companion strikes are
  uncounted, so TB damageFrac (HP lost across the fight) is the
  reliable TB damage measure, not swings. Damage-per-strike figures in
  this file use solo lost fights only, where no companion damage
  confounds the numerator.
- The single-swing damage-per-strike trap: three lost fights showed
  huge per-strike damage from exactly one swing (229, 115, 46). The
  Stage 2 upper bound does NOT use those — it uses bonus-implied
  damage/strike (median per weapon-bonus bucket over fights with ≥2
  swings), so the bound is not inflated by n=1 outliers.
- P3 leg 2 (beast above half HP at loss) is confounded by lifted entry
  state (median entry 70% of max HP); the honest damage measure is
  damageFrac, reported alongside.
- Field "party size" counts mustered allies, not fighters who struck;
  splits use allyVid presence, not partySize.
- Same-day kill matching is strict (killer among the fight's fighters,
  same day). Unmatched kills: 0. Kill-log total = matched total = 2.
- The judged corpus's gear columns were instrument-false (getPerson
  path) and were corrected by regeneration; the corrected gear numbers
  in this file come from the engine's own `equippedWeapon()` reader,
  cross-checked in an independent supplementary leg. Non-scholar
  (villager) gear columns still use the getPerson path and are
  unverified — no finding in this file rests on them.
- 8 seeds / 150d is a pilot: thin buckets (<5 fights) are reported as
  unjudgeable, not as firing or failing (P4 pending-live n=1). A DIAG
  verdict rests on the pre-registered rules, not on a re-scored metric.

## Blanks: filled vs documented

- **Filled:** the finishing probe — every wave-4 fight ending on this
  band is classified from engine records; mFlee is 0; the mechanism is
  named (survival time × damage/strike vs entry HP); the sigoff
  SAY-census claim is reclassified; the P3 build was sized and
  rejected on its own arithmetic with the upper bound shown.
- **Documented (not filled, owned elsewhere):** the survival-time
  binding itself — a balance lever (armor/mitigation curve, entry-HP
  wounding, party damage) must open a kill window before any finisher
  policy can matter. The game-code proposal is named above; the
  sibling arm sim-stageally-a owns the ally-staging half (P5 handoff:
  TB ally-present 0/11 vs solo 2/29 — null on this band, small n).

## Handoff notes

- To sim-stageally-a (sibling, same band): P5 — ally-present TB fights
  killed nothing (0/11) while solo fights killed twice (2/29). Null on
  this band at small n; your ally-staging build is the arm that can
  move this number, this arm did not touch it.
- To the loop: the `gearOf` getPerson bug affected every instrument in
  this family (grindfinish / secondkiller / killerdeath lineage all
  share the gearOf shape). Any past finding that cited scholar gear
  from those corpora should be re-checked against the engine reader
  before being relied on.
- To the loop: `safe-commit.sh` lost its exec bit in this worktree
  (mode 644); invoke as `bash scripts/safe-commit.sh` until repaired.
