# sim-roundcap-b — prereg: census + sizing of the round-cap walk-away (DIAG + SIZING, zero src/js)

- Arm: sim-roundcap-b (Loop B, DIAG + SIZING arm, run fleshout-loop-b-20261110T0626Z, arm 2 of 2)
- Branch: sim-roundcap-b; base anchor `215c37e65cf28118cc7520d954fefde751564955`
  (worktree `~/workspace/worktrees/sim-roundcap-b`, `git status --short` empty at prereg time)
- Grounding: evidence/2026-11-10/sim-volleysoft-b.md + sim-findings.md entry
  ROUND-CAP WALK-AWAY (open, observation, 2026-11-10). The finding: seed
  99596 day 60, Keerati vs Buffering (wave 3) — the 15-round cap ends the
  fight with the beast at 10 HP and the fighter at 56 HP; the fighter walks
  away from a beast one strike from dead. Same shape day 60 Tom (beast
  29 HP, fighter 54 HP). This arm censuses how often that shape occurs in
  the wild and sizes what a cap extension (+1/+2/+3 rounds) would convert.
  It does NOT decide whether the walk-away is the intended price, and it
  does NOT change MAX_ROUNDS or land any game-code change. Zero src/js in
  this arm (instrument + proof + evidence + corpora only). If any src/js
  change starts looking necessary, STOP and report it as the sizing
  outcome instead of making it.

## Premise corrections (from code read BEFORE any judged computation here)

1. **The cap is engine-real and recorded.** `var MAX_ROUNDS = 15`
   (src/js/fieldFights.js:81); the rounds loop runs `round <= MAX_ROUNDS
   && !rec.outcome` (:1367); when no outcome after round 15,
   `rec.roundCap = true` (:2578) and the outcome is set by the
   disengagement branch (:2581–2596): arena (`opts.noFlee`) → judges'
   call for the less-bloodied; committed beast (`!mCanFlee`) → `vFlee`,
   fighter walks away, beast holds the field; flee-capable beast →
   worse-off side disengages (`vFlee` or `mFlee`). Wounds persist onto
   the world entity (`m.hp = rec.mHpLeft`, :2599) — the beast is met
   again later at its capped HP (trail-chaining, as volleysoft saw on
   99596 d59–61). finishLog maps a roundCap vFlee to ending 'timeout'
   (src/js/finishLog.js:64–67).
2. **The cap is the ONLY clock in a field fight.** There is no other
   round limit; a fight that does not cap ends vKill / vDie / vFlee /
   mFlee / evade by morale, break, or death. A round-cap row is
   therefore identifiable in the wild corpus ONLY by the engine-set
   `rec.roundCap` flag — rounds === 15 alone is ambiguous (a morale
   flee can land in round 15). The existing grind instrument does NOT
   record roundCap, so this arm adds a thin layer
   (scripts/roundcap-instrument-20261110.js) that decorates each field
   row with `roundCap`, the fighter's entry HP, and the fighter's strike
   range (see below). No RNG draws, no state writes.
3. **"One strike from dead" is engine-defined, not a guess.** The
   fighter's close-in strike is `lroll([4+wb, 8+wb])`,
   `wb = round((meleeBonus + rangedBonus) / 2)` (fieldFights.js:612–614,
   :2102). The instrument computes wb after the fight with the same
   equipment helpers the engine uses
   (`S.equipment.weaponBonusOf(vp, data.items, …)` on the fighter's
   post-gear-up equipment — gear-up happens at fight entry and nothing
   re-equips mid-fight, so post-fight equipment is entry equipment).
   One strike from dead = `mHpLeft <= 8 + wb` (the beast dies to the
   fighter's best possible single strike). A stricter sensitivity,
   `mHpLeft <= 4 + wb` (dies to the fighter's WORST single strike), is
   reported alongside.

## Band + freshness verification (this run, before the run)

- **Band: 99633–99640 (8 seeds), FRESH.** Verification, per seed:
  `grep -r <seed> evidence/ --include="*prereg*"` = 0 hits for all 8;
  `grep -rl <seed> evidence/2026-1*/*.md` = 0 hits for all 8;
  `ls evidence/*/*<seed>*` = 0 files for all 8;
  `grep -rl <seed> scripts/` = 0 hits for all 8. Range-level check:
  no prereg range covers 99633–99640 (used 996xx ranges found:
  99601–99612, 99651–99658, 99671–99678, 99682–99687). Search scope:
  all preregs under evidence/*/sim-*-prereg.md, all dated .md under
  evidence/, all evidence filenames, scripts/.
- **CORRECTION — the suggested band 99743–99750 is NOT fresh.** The
  first worker's check searched single-seed literals only and reported
  0 hits. Re-verification found the RANGE claim `99741–99752`
  (tbretreat-b-confirm) in evidence/2026-11-05/sim-gearoff-confirm-b-
  prereg.md:62, sim-sigoff-confirm-b-prereg.md:43, and
  sim-trickoff-confirm-b-prereg.md:55,59 — a range claim names the
  whole interval, so 99743–99750 is reserved. The single-seed literals
  99743–99750 never appear, which is exactly how the miss happened.
  Recorded here so the next worker does not repeat it. Also rejected
  as used: 99731–99732, 99733–99738 (tbretreat-b-confirm), 99741–99742,
  99651–99658 (toggle-rescreen confirms), 99671–99678, 99682–99687,
  99702–99707, 99711–99718, 99721–99728.
- Sibling arm check (2026-11-10 ~07:10Z, re-checked at prereg commit):
  no sim-meleefirst-b prereg existed in evidence/ or scripts/ — the
  sibling had not claimed a band. If a meleefirst prereg appears before
  this run's wild leg starts, re-check for a band collision before
  running.
- Policy: competent, verbatim (scripts/policies/competent.js).
- Horizon: 150d death-aware (runDays ends on village death / win;
  +10d tail max). Same horizon as the vetfinish / volleysoft legs, so
  the wild numbers are comparable.
- Driver: scripts/roundcap-driver-20261110.js (thin copy of
  scripts/finishersize-driver-20261106.js with the roundcap instrument
  swapped in), OUTDIR evidence/2026-11-10/perseed-roundcap-b,
  RUN=roundcap-wild. The driver records every field-fight row; the
  roundcap layer adds roundCap / vHpStart / vStrikeMin / vStrikeMax /
  oneStrike. No new game behavior anywhere.

## Classification bars (bind this run, §14)

- **Round-cap walk-away (wild):** a field-fight row with
  `roundCap === true` (engine-set). Outcome at cap is vFlee (fighter
  walks away, committed beast holds the field), mFlee (flee-capable
  beast, worse-off side), or vFlee by judges' call (arena rows excluded
  — wild only; the driver never passes noFlee, verified by the
  analyzer counting optsKeys).
- **Near-dead at cap:** beast HP at cap (`mHpLeft`) in buckets ≤10,
  ≤20, ≤30, >30. The 99596 case sits in ≤10 (10 HP) and ≤30 (29 HP).
- **One strike from dead (wild):** `roundCap && mHpLeft <= vStrikeMax`
  where vStrikeMax = 8 + wb (instrument-computed). Stricter
  sensitivity: `mHpLeft <= vStrikeMin` (4 + wb).
- **Fighter state at cap:** `vHpLeft` (absolute + fraction of
  vHpStart); "healthy" = vHpLeft ≥ 50. Wave, monster id, day, fighter
  vid recorded per row. Trail-chaining: whether the same beast instance
  (instId) is met again later with entryHp == this fight's mHpLeft,
  and that later meeting's outcome (the grind instrument's chaining
  signal — the 99596 chain died by volley on the 4th meeting).
- **Constructed sizing shapes:** fights built to CAP with the beast
  near-dead, re-driven through the REAL Game.fieldFight. Shapes chosen
  from the wild census (wave + kind + entry HP + fighter wb that
  actually cap); the 99596 shape is the anchor: wave-3 Buffering,
  entry HP in the 29–73 range, bow/spear fighter — Buffering's mirage
  misses stretch fights to the cap. Each shape: 30 seeded streams,
  fighter entry HP 100, ally from start where the wild shape has one.
  The cap is extended ONLY in the test's in-memory loaded copy of
  fieldFights.js (see below) — src/js on disk is never touched.
- **Cap extension (constructed, engine-real):** the same constructed
  fight re-driven with MAX_ROUNDS = 16 / 17 / 18 in the loaded copy.
  The extension is a true continuation, not a new fight: the RNG
  stream is identical (same seed family), so rounds 1–15 must
  reproduce exactly — the proof test asserts the cap-15 patched load
  reproduces the cap-15 unpatched outcomes exactly (identity check),
  and asserts rounds 1–15 logs match between cap-15 and cap-18 runs
  on the same stream. Conversion = beast dies (vKill) within the
  extension rounds; fighter death cost = vDie within the extension;
  rounds-to-kill distribution recorded.
- **Costs/risks (constructed):** for capped near-dead fights, the
  fighter's outcome distribution WITHOUT any extension (vKill / vDie /
  vFlee at cap, rounds spent = 15, fighter HP lost), and WITH each
  extension (+1/+2/+3): conversion rate, fighter-death rate, extra
  rounds spent. A cap extension's cost is spelled out as: the extra
  rounds the fighter spends striking instead of walking away, while
  the beast still hits back.

## Primary metric (binds this run, §14)

This is a DIAG + SIZING arm, not a lever arm — there is no before/after
and no GO/NO-GO on a lever. The primary is the **wild near-dead
round-cap rate**: round-cap walk-aways with the beast at ≤30 HP on the
fresh band, with their one-strike share.
- **DIAG-GO if ≥ 1 near-dead (≤30 HP) round-cap walk-away is observed**
  on the 8-seed band (the window exists in the wild at this scale, with
  its outcome distribution recorded). **DIAG (field-unmeasurable) if 0**
  round-cap fights at all — report 0/8 seeds and 0 per field fight; do
  NOT extend the band mid-run to chase the window. If caps occur but
  none near-dead, that is itself the verdict shape (cap ends fights,
  but not near-dead ones) — report it as measured, do not re-score.
  Either way the constructed sizing is the deliverable: it does not
  depend on the wild count.
- The sizing is judged complete when it reports, for each constructed
  shape: conversion rate at +1/+2/+3 rounds (beast dies within the
  extension), fighter-death rate within the extension, rounds-to-kill
  distribution, and the fighter HP cost of the extension — plus the
  lever spec below.

## Lever spec (to be written into the evidence file, not built here)

The evidence file carries a pre-registered spec for a future build run:
primary metric, GO threshold, cost bar, band, horizon — so the next run
can build against it without re-sizing. Draft shape (to be fixed by the
measured numbers): primary = near-dead capped meetings converted to
kills / near-dead capped meetings, with the cap extended by the number
of rounds the sizing shows converts; GO ≥ 0.50. Cost bar set from the
measured fighter-risk numbers (vDie share within the extension, extra
rounds, HP lost). If the sizing shows +1/+2/+3 converts ~0 of the
near-dead caps, or the fighter-death cost exceeds the kill gain, the
spec says so plainly and names the alternative (e.g. a finishing
allowance only when the beast is one strike from dead, or no build at
all — the walk-away as the intended price) with its own numbers,
rather than recommending a blanket cap raise.

## Wall numbers (reported every run)

National / table / wins, wave 4–5 unlocks, wave-4 kills (all channels
+ field), wave-5 kills, median survival, scholar deaths — from the
analyzer on the wild corpus, same shape as vetfinish / volleysoft.

## Sense-test + village assessment

Read transcripts / fightLines / deathSays from the wild corpus; judge
meaning, coherence, relevance, consequences — never just counts. Flag
anything robotic, static, or repeated. Village assessment in plain
words: what the village looked like, who thrived and who died and why,
what knowledge/capabilities were missing, which blank this arm filled
(sizing + spec) or documented.

## Metric review (§14a, in the evidence file)

Any metric problem found goes here for the NEXT run; no re-scoring
mid-run. Known candidates: the wild "one strike" definition uses the
fighter's strike range, not the strike that would actually have been
rolled next (the next strike is a draw, not a fact); the constructed
extension re-drives a patched in-memory copy, so its identity check
(cap-15 patched == cap-15 unpatched) is the load-bearing proof that
the extension is a true continuation; arena rows (judges' call) are a
different shape from the wild walk-away and must stay excluded.
