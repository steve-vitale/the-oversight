# Finishing probe — prereg (arm sim-finishprobe-a)

Run: fleshout-20261106T0615Z. Axis: scale-onramp / winnability chain
(wild ally-join → wave-4 kills → veterans → readiness-5 release → wave-5
facing → full seat). Stage 1 is a DIAGNOSTIC probe (instrument only,
zero src/js). Stage 2 builds a finisher policy ONLY on DIAG-GO, under a
prereg AMENDMENT appended to this file and committed before any Stage 2
judged sim. Coordinator claim:
`~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/lever-claims/fleshout-20261106T0615Z.json`
(arms sim-stageally-a + sim-finishprobe-a; shared pilot band 55001–55008).

## Blank (from the 2026-11-05 arms)

- sim-secondkiller-b: 3 kills in 58 wild wave-4 fights (5.2%), 0/19 after
  first blood; villager field fights 0/30 (median 2.7% of monster HP in
  2–3 rounds before fleeing/dying). Next blank (1) is this arm: finishing
  probe/build, kill conversion primary.
- sim-grindfinish-b (DIAG-NO): grind plumbing works (TB lift 88.2%,
  TB→TB continuation 13/14) but TB fights end death-or-win (32 death,
  2 won, 0 fled band-wide); field fights nearly absent (11 band-wide,
  0 field kills). The grind's PRICE binds.
- sim-killersim2-b (DIAG-GO): death channels for 7 banked killers —
  wild 5, contest/arena 1, other "a stranger" 1; five of seven died in
  combat at haven; 3 of 10 wave-4 kills are same-day kill-and-die.
- sim-sigoff-confirm-b: on the sigoff leg every wave-4 fight ends mFlee
  (the monster gets away, SAY-census classification) and kills are the
  hard proof the readiness-5 door demands.

## Code law read before writing this prereg (no canon invented)

- docs/CANON.md, docs/MONSTER-WAVES.md read. Wave-4 bands: HP 850–1500,
  damage 35–95, pierce 0.2–0.5; gate standing >= 100; readiness-5 bar
  needs 2 living veterans (wave-4+ kills).
- MONSTER COMMITMENT (Steve 2026-11-02, src/js/fieldFights.js:664-676,
  src/js/game.js:41929-41933, 42751-42758): a monster stays committed
  unless its kind carries an explicit `flee` component. Verified in
  src/data/monsters.json: NO wave-4 monster (congregation, strike,
  influencer, audit, reunion, suburb, eulogy, algorithm, eater, herald)
  carries `flee`; all wave-4 `fleeAt` values are 0 (monsters.json and
  src/data/monsterBehaviors.json). Only lockpick_raccoon carries
  `flee: true`.
- Field-flight paths (fieldFights.js) and which gate on `mCanFlee`
  (= `!!mdef.flee`): volley drive-off below break line (mBreak 0.15 for
  wave >= 2), contact-finish drive-off, in-round break check below
  mBreak (with the TWOBLOW committed-finish gate, wave >= 3), round-cap
  disengagement (15 rounds, worse-off side). For wave-4 all of these
  resolve COMMITTED (hold / fighter walks away), NOT mFlee.
- Field mFlee exits that BYPASS mCanFlee (designed, per-monster or
  player-chosen): stare-down (intimidating_presence, rounds <= 2),
  peacemaker walk-in (round 1, 35%), EATER poison-meal trick, plus
  wave-3-only dismissals (redactor starve-out, focus-group bore, ToS
  loophole) and the sealed-arena judges' call (contest only).
- TB flight (game.js tbMonsterTurn): `fleeAt > 0 AND hp/maxHp < fleeAt
  AND monsterMayFlee AND 0.7 roll`. Wave-4: fleeAt 0, MayFlee false —
  no HP-driven TB flight. TB 'won' still needs the kill-log match to
  distinguish kill from rout (signature dismissal / walk-out).
- Consequence for this probe: the sigoff SAY-census "every fight ends
  mFlee" CANNOT be the HP break-line flight on current master for
  wave-4 field fights. Either it is one of the bypass exits above, or
  the SAY census read a walk-away (field round-cap vFlee: "walks away
  ... holds the field"; TB 'fled') as "the monster got away". This
  probe classifies endings from the ENGINE RECORD (fieldFight rec +
  tbEnd result + strict kill-log match), not from SAY lines, and will
  say which of those two it is.

## Stage 1 design (DIAG probe)

- Fresh band 55001–55008 (8 seeds), competent policy VERBATIM, 150d
  death-aware horizon. Instrument:
  `scripts/finishprobe-instrument-20261106.js` (extends the
  grindfinish/secondkiller record shape: same fight fields plus
  finishprobe mechanism flags — see below). Driver:
  `scripts/finishprobe-driver-20261106.js` (same sweep shape as
  grindfinish-driver; refuses to overwrite). Analyzer:
  `scripts/finishprobe-analyze-20261106.js`. Proof:
  `scripts/test-finishprobe-20261106.js` (fixtures + live smoke +
  off/on neutrality). Corpus:
  `evidence/2026-11-06/perseed-finishprobe-a/` (8 files).
- Anchor: worktree HEAD 3e8b3024d34d (branch sim-finishprobe-a).
  No gate, price, deed-gate, readyDemand, flee/retreat, or food change
  in either stage. Stage 2 is policy-only unless the probe proves a
  game-code change is the only action — in that case the game-code
  proposal is REPORTED WITHOUT BEING BUILT (flee-repair game-code port
  is a STEVE CALL, not this arm's to take).

### Seed-band freshness check (skill local_seed_band_freshness)

- Searched: all `evidence/**/*.md` (every dated prereg +
  evidence .md) for the digit strings 55001–55008 — 0 hits. Searched
  all `evidence/**/*prereg.md` for each seed individually — 0 hits.
  Forbidden/contaminated band lists named in preregs live in .md and
  are covered by the same grep — 0 hits.
- `evidence/**/*.json` hits for "5500[1-8]" are decimal-substring
  noise inside float fields (e.g. `"fd":2.255008569233497`), not seed
  namings; no .json file names 55001–55008 as seeds.
- The coordinator's claim file names this same band for this run
  (shared with sibling sim-stageally-a by design — different arm,
  different instrument, same seeds; no corpus is shared).
- Verdict: band 55001–55008 FRESH.

### Ending taxonomy (record-based, per wild wave-4 fight)

- Field (fieldFight rec.outcome): kill (vKill) / mFlee / vFlee
  (villager fled or walked away) / vDie (villager died) / evade /
  other. TB (tbEnd result + strict kill-log match): kill (won +
  matched kill) / rout (won + NO matched kill — monster fled or
  dismissed; monster fled-flag recorded) / scholar-flee (fled) /
  scholar-death (lost) / unfinished (open at finalize).
- "Timeout" is not a separate engine outcome: field round-cap is
  recorded as a flag (rounds >= 15) on the vFlee/mFlee ending it
  produces; TB has no round cap (longest fights recorded by rounds).
- Kill matching is STRICT (killer must be among the fight's fighters;
  same-day window as secondkiller). Unmatched kills are reported,
  never assigned. TB "won" is NEVER counted as a kill without a
  kill-log row.

### Per-fight record (Stage 1)

Ending + monster HP at end (mHpLeft; endFrac vs maxHp and vs defHpHi)
+ rounds + party size + ally actually present (allyVid) + entry type
(TB: lifted vs fresh/pending-live vs door-fled stash; field: entryFrac
vs def range) + channel (field / player-tb) + first-blood status +
post-first-blood flag + damage dealt / damageFrac + gear (weapon bonus,
armor P) + abilities/tricks used + intent + field mechanism flags
(staredDown, peaceful, contactFinishAttempted/Kill, volley, committedFinish,
committedRounds, committedHold, chorusHoldRounds, twoblow fields,
judges, fleeWise, corneredHold, fleeHopeless, fleeHpFrac, vHpLeft) +
rec.log (capped) for mFlee, kill, and round-cap fights (mechanism audit
+ sense-test). Daily snapshots + scholar deaths + killsLive + finalize
as in the grindfinish base. Contest/arena fights are EXCLUDED from the
wild counts (noFlee / judges' call is a different fight); they are
counted separately if the instrument sees them, never mixed in.

### Pre-registered DIAG verdict rules (judged, not fished)

Primary metric: wave-4 kill rate per wild wave-4 fight, with the
ending distribution and the mechanism table. DIAG-GO iff at least one
POLICY-actionable pattern below fires with a concrete build decision.
DIAG-NO (no Stage 2 build) iff no policy-actionable pattern fires —
endings are then explained by already-known mechanisms and the
dominant mechanism is named, including a game-code-only proposal if
that is what the probe proves.

- P1 ROUND-CAP REMAINDER: >= 25% of all wild wave-4 fights end
  non-kill with monster endFrac < 0.15 (below the wave>=2 break line,
  beast still standing when the fight ends). Build decision if it
  fires: a policy variant that converts treeline sieges into
  scholar-led TB fights (sortie-to-lingerer, reusing existing
  sortie/treeline policy machinery — exact mechanism pinned in the
  Stage 2 amendment after a code read, before any judged Stage 2
  sim), so the concentrated scholar + abilities + gear finish what
  the field party could not in 15 rounds.
- P2 DISENGAGE-ABILITY LEAK (game-code-only, NOT a DIAG-GO pattern):
  >= 15% of wild wave-4 field fights end mFlee via staredDown /
  peaceful / poison-meal. If P2 fires and no P-pattern fires, verdict
  is DIAG-NO for Stage 2 with a NAMED game-code proposal reported and
  NOT built (those abilities end committed-beast fights without a
  kill; gating them vs wave-4 is engine work, and the flee-repair
  game-code port is a STEVE CALL).
- P3 TB DAMAGE-RACE / ABILITY GAP: TB kill rate < 10% AND >= 50% of
  TB losses end with monster endFrac > 0.5 AND abilities used in
  < 25% of TB fights. Build decision if it fires: a finisher policy
  extending the competent ability cascade for wave-4 TB fights
  (patient_aim / freeze_tag / hogtie / rage / war_cry ordering,
  never-flee-once-committed), as a new policy file in
  scripts/policies/.
- P4 FRESH-vs-LIFTED SPLIT: fresh (pending-live, non-lifted) TB kill
  rate >= 20% AND lifted TB kill rate <= 5%, with >= 5 fights in each
  bucket (thin-band guard: either bucket < 5 fights makes P4
  UNJUDGEABLE, not firing). Build decision if it fires: a policy
  variant that seeks fresh wild fights and declines treeline sieges
  (or the reverse, if the split runs the other way — the amendment
  pins the direction from the measured split).
- P5 ALLY EFFECT (probe-only, NOT a build — sibling sim-stageally-a
  owns ally-staging in TB): ally-present vs solo kill rates reported;
  if ally presence predicts kills, the finding is HANDED to the
  sibling arm, not built here.

Sibling boundary: sim-stageally-a tests ally-staging in TB fights on
the same band. This probe covers fight endings generally (both
channels, field + TB, all mechanisms) and does NOT build an
ally-staging variant. If P1/P3/P4 fire, the Stage 2 build is checked
against the sibling's arm before the amendment is committed, so the
two builds do not duplicate each other.

### Stage 2 (only on DIAG-GO)

- Write a prereg AMENDMENT (appended to this file, committed) BEFORE
  any Stage 2 judged sim: baseline vs armed on identical seeds
  (same band 55001–55008), GO bar = wave-4 kill rate >= 10% on the
  armed leg (vs ~5% measured baseline) OR post-first-blood kills
  >= 2. Guards: median survival not worse than baseline by more than
  10d; no gate/price/deed change. Balanced panel
  (scripts/balance-panel.js, MEASUREMENT.md §15) for the before/after
  compare; the compare .md is attached to the evidence file. If Stage
  2 is a NO-GO, the policy file is reverted before the final commit so
  no trace remains.
- If DIAG-NO: no Stage 2, no policy file, evidence file carries the
  named mechanism + (if P2 fired) the game-code proposal.

## Metric review (per §14 — written before the run)

- The sigoff "mFlee" claim is SAY-census, not record-based. This
  probe's record-based taxonomy may reclassify those endings (e.g.
  round-cap vFlee read as "got away"). If it does, the evidence file
  says so explicitly with the counts — the probe does not inherit the
  SAY label.
- TB swingsAttempted counts player strikes only (secondkiller metric
  review); companion strikes are uncounted, so TB damageFrac (HP lost
  across the fight) is the reliable TB damage measure, not swings.
- Field "party size" counts mustered allies, not fighters who struck;
  splits use allyVid presence, not partySize (secondkiller metric
  review).
- Same-day kill matching (Loop A sim-staypolicy-a note): midnight-
  spanning kills may score 0 matched; unmatched kills are reported,
  never assigned, and the count is stated.
- 8 seeds / 150d is a pilot: ~45–60 wild wave-4 fights expected (prior
  bands). Thin buckets (< 5 fights) are reported as unjudgeable, not
  as firing or failing. A DIAG verdict rests on the pre-registered
  rules above, not on a re-scored metric. Every evidence file carries
  a "metric review" section.

## Wall numbers (reported every run)

Wins / national / table / wave-4 unlocks / wave-4 faced / wave-5
unlocks / wave-5 faced / median survival, per seed and band-wide.

---

## STAGE 2 AMENDMENT (appended 2026-11-06, after the Stage 1 pilot was judged — committed before any Stage 2 work)

### Stage 1 verdict: DIAG-GO via P3 (as pre-registered)

Pilot on 55001–55008, competent verbatim, 150d, anchor 3e8b3024d34d.
57 wild wave-4 fights, 2 kills (3.5%). TB 40: 38 scholar-death, 2 kills,
0 scholar-flee, 0 rout. Field 17: 0 kills, 0 mFlee, 10 vFlee, 3 evade,
2 vDie, 2 suburb-walkout. mFlee 0/57; round-cap 0; near-miss (endFrac
<0.15) 0. P1 NO, P2 NO, **P3 FIRES** (TB kill rate 0.05 < 0.10; TB
losses ending beast >50% HP 27/38 = 71%; abilities used 7/40 = 17.5%
< 25%), P4 UNJUDGEABLE (pending-live n=1), P5 probe-only (ally 0/11
vs solo 2/29 TB). Full numbers in
evidence/2026-11-06/finishprobe-a-analysis.json and the evidence file.

### Supplementary legs (instrument-only, competent verbatim, same band)

Two read-only supplements were run to pin the Stage 2 build before
writing this amendment. Both reproduced the judged corpus fight by
fight (trajectory identity verified: same days/endReason/fights/kills
per seed; per-fight day/channel/mid/outcomeRaw/rounds/swings/entryHp/
mHpLeft identical). 0 instrument errors on every leg.

1. **Holdings + turn-use** (/tmp/finishprobe-holdings-34174): scholars
   hold many abilities (0/40 fights holding zero). Combat-pressable
   holdings in 40 TB fights: patient_aim 17 (used 0), rage 8 (used 6),
   hogtie 10 (used 0), war_cry 2 (used 0), pocket_sand 1 (used 1),
   peacemaker 14 (never pressed by the cascade); bird_strike 0,
   freeze_tag 0, turncoat 0 — held by nobody. Scholar kcal at fight
   start median 2082 (1 fight <240) — kcal is NOT the binding
   constraint. Turn budget in lost fights (n=38): rounds median 6,
   strikes median 2, moves median 3, waits 0, abilities median 0.
2. **Gear-engine cross-check** (/tmp/finishprobe-gear-34175): the
   judged corpus's gear columns are WRONG — an instrument bug (see
   below). The engine's own `Game.equippedWeapon()` shows scholars
   ARMED in 37/40 TB fights (hunting spear +30 x6, harvest scythe
   +40 x4, machete +35, phase blade +60 x2, fire-hardened spear +15,
   stone knife +12, sharpened stick +5, crowbar +12, hatchet +15,
   kitchen knife +8; unarmed 3/40) and wearing real armor (hide
   armor, bark armor, riot gear, worldroot plate in the slots). The
   two killers were armed (crowbar +12; harvest scythe +40 with a
   hunting spear +30 in pack). Damage/strike scales cleanly with
   weapon bonus (median by bonus: +5 -> 8.5, +12 -> 15.7, +15 ->
   18.9, +25 -> 40, +30 -> 40.7, +35 -> 46.3). Weapon bonus flows
   into strike damage; the scholars are not fighting bare-handed.

### Instrument correction (gearOf bug — found by the gear cross-check)

`gearOf` in both instruments reads `Game.getPerson(vid).equipped`.
For the scholar that path returns empty slots in the harness: the
scholar's equipped state lives in `Game.state.scholar.equipped`,
which `Game.equippedWeapon()` reads. Result: the judged corpus
reports weaponId None 40/40 and armorP 0 40/40 — false. The fix
(this amendment's work, before the evidence file): `gearOf` uses
the engine's own `Game.equippedWeapon()` + `state.scholar.equipped`
for the scholar, keeps the getPerson path for non-scholar fighters
with a caveat comment, and the proof test asserts gearOf returns an
equipped weapon. The Stage 1 corpus is REGENERATED with the fixed
instrument (read-only capture change; trajectories must verify
identical to the judged corpus on every classification field — the
re-run is a corpus correction, not a new judged sim) and the
analyzer re-run. The judged verdict numbers above are unaffected:
no classification field depends on gear.

### Stage 2 assessment: NO-GO by arithmetic — no policy built, no pilot spent

The P3 build as pre-registered (hold-ground + cascade extension:
patient_aim / freeze_tag / hogtie / rage / war_cry ordering,
never-flee-once-committed) was sized against the supplements. It
cannot pass its own GO bar:

- Entry HP floor is 350 (range 350–1325, median 712). Zero fights
  entered below 350; 7 entered at or below 500.
- Median survival in lost TB fights is 6 rounds; the scholar dies
  to 35–95 damage/round at 100 HP. Damage/strike tops out at ~46
  (best observed gear, +35 bonus).
- Upper bound (generous to the point of unattainable): every round a
  strike at the fight's bonus-implied damage/strike, plus one aimed
  strike at 2.5x — zero movement, zero tricks, zero misses beyond
  measured rates, full survived rounds granted. Under that bound
  **at most 1 of 38 lost fights flips to a kill** (55007 d78 eater:
  672 projected vs 664 entry, a 1% margin), and that fight is
  pre-first-blood, so post-first-blood kills under the bound are 0.
  The bound's kill rate would be 3/40 = 7.5% < the 10% GO bar; the
  post-first-blood leg (needs >= 2) is 0.
- The ceiling fight on the band proves it from the other side:
  55002 d72 congregation, 18 rounds (longest survival), 13 swings,
  529 damage dealt of 1052 entry with a +30 hunting spear — the
  beast still stood at 523 HP. Even the best fight on the band dealt
  only half a beast's HP.
- The only kills on the band were vs Strike (32 and 46 rounds,
  zero incoming damage — the one wave-4 monster that does not
  attack). Every attacking wave-4 monster killed the scholar on
  this band: algorithm 0/12, reunion 0/10, eater 0/7, suburb 0/4,
  eulogy 0/3, congregation 0/2.

The binding constraint is **survival time x damage/strike vs entry
HP** — a game-balance fact, not a fight-policy gap. No wave-4 TB
fight policy can open a kill window that does not exist: the scholar
would need to survive ~15–40 rounds to grind down a 350–1325 HP
beast at ~20–46/strike, and dies in ~6. Building the P3 policy and
piloting it would spend a run confirming a foregone NO-GO. Per the
task (build only if the probe names a policy-actionable finishing
pattern) and Steve's 2026-11-01 rebuke against re-proving proven
constraints: **Stage 2 is NO-GO. No policy file is created, so there
is nothing to revert.** The DIAG verdict stands (P3 fired; the probe
named the mechanism); the build does not proceed.

### Named mechanism (the Stage 1 finding, in plain words)

Wave-4 fights do not end with the monster getting away — the monster
never flees (0 mFlee in 57 fights) and the fighter never escapes
either (0 scholar-flees in 40 TB fights). They end with the scholar
dead (38/40 TB) or walking away from a field fight after a round or
two (10/17 field). The scholar cannot finish the beast because the
beast has roughly ten times the scholar's health and hits hard enough
to kill the scholar in about six rounds, while the scholar's strikes —
even with a good weapon — take only a small bite each round. The two
kills on the band happened only against the one monster that never
attacks, where the scholar had all the time in the world. A finishing
move cannot fix a fight the scholar does not live long enough to finish.

### Game-code proposal (reported, NOT built — a Steve call)

The levers that could open a real kill window are balance levers, not
a fight policy: (a) survival time — armor/damage mitigation that lets
a scholar stand 15+ rounds against wave-4 damage (scholars already
wear the armor they own; the question is whether the mitigation curve
is enough); (b) damage per strike — weapon tier already flows and is
already the best owned; (c) entry HP — deeper wounding before the
lift (the grind's price binds: six scholars died grinding one beast
750 -> 114 HP in the grindfinish arm); (d) party damage — the sibling
arm sim-stageally-a owns ally-staging in TB. No gate, price, or deed
change is proposed. No src/js change is made in this arm.

### P3 leg-2 honesty note

P3's second leg (71% of TB losses end with the beast above half HP)
measures entry state more than damage output: beasts enter lifted at
a median 70% of max HP, so they end above 50% almost by construction.
The honest damage measure is damageFrac (median 6.8% of entry HP
dealt; median 47 damage of 712 entry). P3 fired as written; the leg
is reported with this caveat in the evidence file.

### What is still committed in this arm

Corpus regeneration with the fixed instrument (classification
identity verified), analyzer re-run, evidence file
evidence/2026-11-06/sim-finishprobe-a.md, findings appended to
sim-findings.md, memory note, final report: DIAG-GO (P3) + Stage 2
NO-GO (by arithmetic, no policy built, no pilot spent).
