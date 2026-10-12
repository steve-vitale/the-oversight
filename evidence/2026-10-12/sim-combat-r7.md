# Long-run sim — lever 1 r7: the shaking eases (trauma consequences, 2026-10-12)

## Canon read
- `docs/CORRUPTION.md` (fear/psycho spawns, cannibalism slope's trauma ~35 first meal, desensitization ×0.82). **No standalone trauma canon doc exists** — trauma's design lives in code comments and the corruption slope. Saying so instead of inventing.
- Trauma law as implemented: player trauma is a 0–100 haunting, not a debuff. The `addTrauma` comment promises "the village can feel it on you" — **that half is unimplemented** (documented below as a blank).

## Lever played
**The competent policy now channels keepsakes for trauma relief at dawn.**
One knob, policy-only (`scripts/policies/competent.js`, new `sootheTrauma()`):
when scholar trauma ≥ 8 (the game's own threshold — `channelLabel()` renames
the button "💛 Hold it (steady yourself)" at exactly 8), the System has taught
resonance harmonics, and a keepsake is ready (not channeled today), the
policy channels it (−6/channel vs −2/night sleep decay). Gate:
`COMPETENT_TRAUMA_RELIEF=0` restores the legacy path verbatim for before/after.
No `[needs-eyes]`: nothing the player feels changed; the measurement
instrument plays the game as designed (r6 precedent).

**Why this lever:** baseline measurement showed the relief economy is real
but unreachable by the competent player — 0 policy-driven channels in 24
runs; the only channels were the System's one-time teachSentiment demo
(21 across 24 runs). Meanwhile trauma sat at a mean of 8.4 with 70
life-days ≥ 30 and 23 nightmares stealing half the night's healing. A
competent player who knows their keepsake steadies them would use it.

## Before / after (identical seeds 1–24, 200 days, competent policy)
Game code identical (master @ ef94197a). Before = legacy policy
(`COMPETENT_TRAUMA_RELIEF=0` path); after = dawn channeling.

| metric | before | after | delta |
|---|---|---|---|
| policy-driven channels | 0 (21 demo-only) | 203 | relief now used |
| trauma mean-of-means (dead lives) | 8.4 | 4.3 | −49% |
| life-days at trauma ≥ 30 | 70 | 10 | −86% |
| nights eligible for nightmare (pre-sleep ≥ 30) | 86 | 11 | −87% |
| nightmares fired | 23 | 4 | −83% |
| lives ever hitting trauma ≥ 30 | 14/79 | 8/82 | −43% |
| median survival | 50d | 50d | flat |
| max survival | 123d | 147d | +24 (noise-adjacent) |
| player death causes (combat/starvation/contest) | 43/12/5 | 41/11/4 | flat |
| villager death causes | unchanged | unchanged | flat |

Consistent across seeds, not outlier-driven (nightmares 23→4; seeds with
zero nightmares 15→20/24).

## What trauma IS, measured (baseline, 24 seeds × 200 days)
- **Distribution among the dead** (79 player-lives, all died — every run
  ended village-lost): trauma-max 0–7: 9 lives; 8–29: 56; 30–49: 12; 50+:
  2. Mean-of-means 8.4. Trauma is usually low-moderate; high trauma is rare.
- **Nightmares:** 23 fired / 86 eligible nights = 26.7% fire rate (design:
  `min(0.8, trauma/100)`; mean trauma at fire 39.7 — in the right ballpark,
  no malfunction). Each steals half the night's healing and then −5 trauma.
- **Correlation with death cause:** none that matters. Combat deaths
  (n=45): meanMax 17.7, meanMean 7.7. Starvation deaths (n=13): meanMax
  15.5, meanMean 6.9, **0 days at ≥30** — starvation kills before trauma
  accumulates. Disease, contest, murder: same band. Trauma doesn't predict
  *how* you die.
- **Mechanical effects — the complete inventory** (grep-verified across all
  src/js): the ONLY stat effect is nightmares halving sleep healing at
  trauma ≥ 30. Everything else is copy: the ≥8 channel-button rename, the
  one-time "You will dream about this. You already know." at ≥ 30, the
  deed-reactive shaking-hands nudge. Relief sources: sleep −2, nightmare −5,
  keepsake channel −6×mult, payRespects −3, funeral comfort −1, succession
  reset to 10, sigW4 absolution cleanse. Nothing in combat stats, talk
  options, movement, foraging, or trust reads trauma. **Trauma is a feel
  system, not a survival lever** — decorative except the nightmare healing
  tax. The after-run proves it: −83% nightmares, survival flat at 50d
  median, death-cause shares flat.

## Reachability verdict (trauma content)
- **Keepsake channeling:** REACHABLE (System demo fires ~1/run when the
  deed crosses 60 with a keepsake; the deed-reactive nudge fires on
  qualifying fights; now the competent policy uses it daily). Before this
  run it was reachable but unused by the instrument.
- **Nightmares:** REACHABLE — 23 baseline fires across 24 runs, always at
  trauma ≥ 30, always narrated with the stolen healing made explicit.
- **Betrayal-trauma wild-day narration** ("still raw after the killing"):
  reachable in principle; fired without the suffix in sampled runs
  (village trauma log mostly empty — ambush-plot kills are rare in sims).
- **combatWitnessReact** (villagers visibly judging fights): content exists
  for start/kill/hurt/flee moments, but **never fired in 90 sampled days**
  with 8 combat wins — `witnesses(6)` needs villagers within 6 tiles and
  competent fights happen in the wild. Reachable only at haven-door fights.
  Not broken by design (wilderness fights *shouldn't* have an audience),
  but Steve should know the content is mostly dormant. Documented, not fixed.
- **"The village can feel it on you"** (addTrauma comment): NOT
  IMPLEMENTED anywhere. No villager reacts to the player's trauma level.
  Documented blank (see below).

## Villagers act like people (transcript-verified, SENSE-TESTING LAW)
Sampled say-streams from the baseline (seeds 11, 1, 3) and a dedicated
witness dump (seed 11, 90 days):
- Nightmare lines land next to the wake report with the stolen healing
  explicit: "Dawn. You wake rested. (-15 health…) You hear the sound again —
  the one they made. It follows you out of sleep." The player can connect
  trauma → nightmare → less healing. Sensical, consequential.
- The demo ("You hold Brass Locket. Breathe. The shaking eases.") and the
  nudge ("Your hands won't stop shaking. The Photo album is right there —
  hold it, think of them.") are personal, name the keepsake, and tell the
  player what to do. No repetition fatigue (nudge fires on qualifying
  fights, not every beat).
- Villagers: Marcus challenges leadership ("Enough. I want a say in how
  this village runs."), Emma teaches tick removal by hand, Sujon
  demonstrates snares ("...Want to actually SEE one?"), the Ashford runner
  threatens over foraging grounds, the wild-day line "The room is wrong
  today. Edgy, listening for the wrong things." fires honestly. Specific,
  consequential, non-repeated. Nothing robotic flagged.
- One robotic-adjacent template: the forage-return line ("X came back with
  N kcal of something edible. The pantry breathes.") repeats with only
  name/number swapped — it's ambient bookkeeping, not dialogue; acceptable.

## Village assessment (plain words)
The village of the after-run is a place that learned to grieve
productively. Before, trauma was a slow bleed nobody treated: 70 days spent
at ≥30, 23 nights where the dark replayed what your hands did and stole
half the morning's healing. The competent player *knew* the keepsake
helped — the button said "Hold it (steady yourself)" — and never pressed
it. Now they do, 203 times across 24 runs, and the haunting nearly
vanishes: 10 high-trauma days, 4 nightmares.

Who died and why: the same as before — combat ~55%, starvation ~15%,
contests ~6%. The village still collapses around day 50 (every run
village-lost; 0/24 runs reached 200 days). Trauma relief didn't save a
single village, because trauma was never what killed them. That's the
honest finding: **this lever buys mornings, not years.** The shaking
eases; the monsters don't.

What was missing: the instrument never used the game's best relief. That's
the blank this run filled. Two blanks remain documented (below), neither
touched this run.

## Blanks filled / documented
- **FILLED:** policy trauma competence (`sootheTrauma` — dawn keepsake
  channeling at trauma ≥ 8). Proof `scripts/test-trauma-relief-20261012.js`
  7/7 (RED 2/7 on the legacy gate — the blank reproduced; GREEN 5/7 on the
  new path).
- **DOCUMENTED (not filled, future trauma work):**
  1. `payRespects` (−3 trauma, corpses.js) — 0 uses in 24 runs. The policy
     loots corpses but never honors them. A real player would; the
     instrument doesn't. Trauma-only follow-up.
  2. "The village can feel it on you" (game.js addTrauma comment) — no
     implementation: no villager line, trust effect, or talk beat keys off
     the player's trauma level. High trauma is invisible to everyone but
     the player and the night. Filling this is a feel/social change and
     would need `[needs-eyes]`; deferred, not invented here.
  3. `combatWitnessReact` dormant in wild fights (witnesses(6) rarely
     satisfied) — content exists, reachability is haven-door-only. Steve's
     call whether that's fine.
- **MEASUREMENT FIX:** death-cause matching now labels final lives of
  village-lost runs honestly (`village-lost(run-end)`) instead of
  'unknown' — the old probe inflated the unknown bucket (13/79 baseline).

## Tooling
- `scripts/probe-trauma-20261012.js` (new): 24 seeds × 200 days; wraps
  `Game.sleep` for exact nightmare accounting (pre≥30 & drop==5), tracks
  per-life trauma curves, channel/respects counters, trauma-correlated
  death causes. `SEEDS="1,2,3" DAYS=200 OUT=/tmp/x.json node
  scripts/probe-trauma-20261012.js`.
- `scripts/dump-witness-20261012.js` (new): SENSE-TESTING reader for
  villager witness/kill/trial lines around fights. `SEED=11 DAYS=90 node
  scripts/dump-witness-20261012.js`.
- `scripts/sweep-combat-lever.js` (reused): 2-seed smoke after the policy
  change — runs clean.

## Proof & regressions
- `scripts/test-trauma-relief-20261012.js`: 7/7 (RED on
  `COMPETENT_TRAUMA_RELIEF=0` legacy path, GREEN on new).
- `scripts/test-armor-up-20261012.js` (r6, shared file changed): 5/5 green.
- No src/ changes; ontology untouched. No jest (policy scripts are
  node-run, per the no-concurrent-jest rule).

## Commit
Policy + tooling + evidence only; merged locally, pending ship. No version
bump, no push (ship loop owns deploys).
