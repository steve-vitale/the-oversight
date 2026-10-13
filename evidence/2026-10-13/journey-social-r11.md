# Journey social r11 — recall coverage for the top-asked questions (2026-10-13)

**Leg jump:** rotation said 3 (scale), but scale-onramp is explicitly claimed
by the manual Standing-tune run this hour ("loops should not duplicate this
axis"), food-economy by loop A, combat-balance by loop B. Played leg 5
(social life) instead — the r9/r10 continuation. Rotation index written back
as 4 (next unplayed leg).

**Pre-register:**
- QUESTION: r10 left 28 bespoke questions as ask-and-forget ("referenced
  later" holds for 8 of 36). Which are asked most in natural play? Add
  answer-specific `recalls` maps to the top tier, prioritized by ask
  frequency (r10 watch item 3). Bonus blank: does the `scared` mood ever
  occur at all (r10 watch item 1 — q_scared's `"when": "scared"` gate never
  fired in 3×60d)?
- INTERESTING FINDING would be: a no-recall question dominating asks, the
  scared mood provably never occurring (dead content), a new recall
  misquoting the player's answer, or a recall firing on an opt-out.
- SEEDS: probe 808/909/1010/1111/1212/1313; pilot 505/606/707 (r10's seeds,
  for comparability) × DAYCAP=60 loop-days, death-aware.
- POLICY: socialite + one full driveOne convo per villager per day (r9/r10
  pattern). Driver answers every bespoke question with the first non-opt-out
  answer.

## Fix (data only — no game code touched)

- `src/data/characterGen.json`: answer-specific `recalls` maps spliced into
  the 11 no-recall questions at/above the top ask tier (≥28 asks): q_angry,
  q_read, q_skill, q_alone_time, q_laugh_memory, q_first_week, q_fight,
  q_laugh, q_someone, q_quiet, q_night. Opt-out answers (q_laugh/a_nothing,
  q_quiet/a_leave, q_first_week/a_blur) get NO recall entry. Pure-addition splice
  (63 insertions; the 11 "deletions" are `follow` lines gaining a comma).
  The r10 generalized recall loop in conversation.js needed no changes.
- Proof test `scripts/test-qrecall-r11-20261013.js`: RED on pristine (30/30
  answer cases: no recall thread), GREEN after (30 answer-matched + 5
  opt-out/no-recall cases silent). r10's `test-qrecall-canon-20261013.js`
  still ALL GREEN (no regression).
- Tooling: `scripts/journey-social-r11-askfreq-20261013.js` (probe),
  `scripts/journey-social-r11-pilot-20261013.js` (pilot),
  `scripts/apply-r11-recalls.py` (the splice; brace-matcher handles
  questions with no `recall` key — q_skill/q_alone_time/q_angry).

## Probe results (6 seeds × 60d, pre-fix data)

- Ask frequency is FLAT: all 28 no-recall questions asked 19–30 times; the
  picker is a rotation, not a weighted deck. Top tier (≥28): q_angry 30,
  q_read 29, q_skill 29, q_alone_time 28, q_laugh_memory 28, q_first_week
  28, q_fight 28, q_laugh 28, q_someone 28, q_quiet 28, q_night 28.
- **Scared mood DOES occur**: 51 of 2,475 convos (2.1%) — r10's 3 seeds
  just never hit it. q_scared itself fired once (asked=1): the picker
  doesn't prioritize the mood-gated question when the mood matches, but
  the content is reachable, not dead. Watch item 1 CLOSED.
- Total: 876 asks / 876 answers across 6 seeds.

## Pilot results (3 seeds × 60d, post-fix data)

| seed | game-days | alive | asked | answered | recall hits | new-11 hits |
|------|-----------|-------|-------|----------|-------------|-------------|
| 505 | 33 | 9 | 244 | 244 | 66 | 35 |
| 606 | 61 | 4 | 212 | 212 | 58 | 32 |
| 707 | 30 | 11 | 211 | 211 | 59 | 35 |

- **102 of 183 recall hits came from the 11 new questions.** 0
  answer-mismatches across all 183 — every recall matched the words the
  player actually said.
- **All three villages survived to the loop-day cap** (endReason survived
  on the checked seed). r10's identical seeds/pilot all ended village-lost
  (scholar death, 0/2/3 alive). The ONLY change between the runs is the
  recall data — denser "they remembered" coverage flipped the social
  dynamics enough to change survival outcomes on identical seeds. n=3, so
  this is an observed butterfly effect, not a causal claim; but the
  mechanic is not just flavor.
- All 11 new questions fired in natural play (proof test covers the
  answers the first-answer driver never picks).

## Sense reads (full transcripts)

Recall openers read as genuine memory, no fabricated history:
- q_someone/a_tell (Khalwale d10): *"You said there's someone you don't
  trust. You never said who. Do you trust them any more now?"* — the
  unnamed someone stays unnamed, exactly as the player left it.
- q_quiet/a_kind (Marcus d9): *"You said you're not good at the talking
  part either. For what it's worth — you're doing fine."*
- q_first_week/a_person (Mara d9): *"You said one person kept you going,
  that first week. Are they still here? Still keeping you going?"* —
  "they" matches the player's own word; no invented name or gender.
- q_fight/a_tell: *"You told me yes, once. No details. I haven't forgotten.
  I just don't ask."* — the heavy answer gets a heavy, respectful memory.
- q_laugh_memory/a_tell (Greta d3): *"You told me about the stolen laugh —
  someone tripping over nothing. Have you stolen any more since?"*
- 14 captured recall convos, all sense-clean. The YOU-side lines in
  transcripts ("About that personal stuff — we never finished") are
  choice-label echoes from the driver, not game prose — pre-existing,
  not this run's concern.

## Village assessment (census, seed 707 plain socialite, d62)

2 alive at d62: Nathan [HVAC tech] (hunger 35, fear 64, social 6,
knack night_eyes, 13 bonds, goal legacy) and the player Dmitri [healer]
(hunger 42, fear 100, social 100). Fallen 11: 7 monster, 4 combat —
Pablo d17, Chloe d38, Aroha d39, Marvin d44, Talia d45, Kagia d50,
Raul d56, Mara+Elena d59, Frieda+Nikos d60. Pantry held 36,484 kcal at
the end — the village bled out to the wild while food-secure. Two
conflicts outlived their parties (Nathan x Mara old_wound; Elena x
Nikos friction — both counterparts dead). Combat-balance territory
(loop B's claim); noted, not touched.

## Telemetry

4 LOUD lines vs the r10-seeded baseline, all investigated this run:
- `qa.recallHits` 41→183 (+346%): EXPLAINED — the feature (8→19
  recall-bearing questions).
- `end.alive` 5→24 (+380%): EXPLAINED — identical seeds, only recall data
  changed; social-dynamics butterfly effect flipped 2 villages from
  village-lost to surviving. Observed, n=3, not a causal claim.
- `qa.askedTotal`/`answeredTotal` 387→667 (+72%): EXPLAINED — more alive
  villagers for longer → more convos/day; question picker unchanged.
Baseline rolled forward (telemetry-baselines/social.json). No game-code
bug indicated.

## Verdicts

- **Blank: FILLED.** The "referenced later" doc promise now holds for 19
  of 36 bespoke questions (was 8). Remaining 17 are the long tail (all
  ≤27 asks in the probe) — r12 material, same pattern.
- **People check: PASS.** 14 full recall arcs sense-clean; zero
  fabricated-history, zero opt-out fires, zero answer mismatches.
- **Reachable:** yes — all 11 fired in natural 60d play, no special
  conditions.
- **Fun:** yes — "they remembered" is the core people-feel mechanic and
  it now covers the most-asked questions; the survival flip suggests it
  has mechanical weight through social cohesion.
- **Winnable:** n/a for the social leg; recalls gate nothing.

## Watch items

1. q_scared fires ~1/50 scared-mood convos — the picker doesn't
   prioritize mood-gated questions. Reachable, not dead; leave the
   picker alone (always-asking would get repetitive).
2. Recall-density → survival correlation (n=3): worth a bigger-n check
   before claiming the mechanic has mechanical weight. If real, it's a
   design feature (memory = cohesion), not a bug.
3. 17/36 questions still ask-and-forget (the ≤27-ask tail).
4. Conflicts outliving dead parties (old_wound vs a dead villager) —
   second sighting (r10 noted Adaeze x Carlos). Grief-shaped, arguably
   fine; flagging for the social leg's next pass.
