# sim-wildavoid-a — outmatched-avoid on the wild routers (finding #2506)

**Arm:** sim-wildavoid-a, Loop A run fleshout-20261118T1015Z, axis scale-onramp.
**Branch:** `sim-wildavoid-a`, commit `a54c8131e` (build + prereg + instruments + proof test).
**Verdict: NO-GO** (prereg: GO iff B1&&B2&&B3&&B4&&B5; B4 fails, the rest pass).
**Prereg:** `evidence/2026-11-18/sim-wildavoid-a-prereg.md` (frozen before the pilot).
**Band:** 104411–104418, 8 seeds, 150d death-aware, policy competent verbatim,
substrate VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1, SEEKGATE unset, FIGHTALLY2 unset.
Two legs on identical seeds: MODE=ctl (WILDAVOID unset) vs MODE=arm (WILDAVOID=1).
**Corpora:** `evidence/2026-11-18/perseed-wildavoid-a-ctl/` (8 files) and
`perseed-wildavoid-a-arm/` (8 files); analysis `wildavoid-a-analysis.json`;
panels `wildavoid-a-panel-before.json.gz` / `-after.json.gz`, compare
`wildavoid-a-panel.md` (decision: review_required).

## The lever, in plain words

Until now, when villagers bumped into a big monster out in the world — on a
patrol, on a day's wandering, or answering someone's call for help — they
fought it even when they were hopelessly outmatched: one villager, or two,
against a wave-4 beast, sometimes unarmed or unarmored. The expedition rule
already knew better: a planned hunt checks whether the party is big enough
and geared enough, and calls the hunt off if not. This arm puts that same
check on the wild meetings. When a villager meets a wave-4-or-worse beast
with too small or too poorly geared a party (fewer than 3, or anyone unarmed
or unarmored), they step aside instead of fighting — one spoken line ("sees
the beast and gives it room — not ready alone, going back for help"), the
beast stays in the world, and nobody's plan is touched. Full geared parties
of three or four fight exactly as before. Raids at the haven door are
exempt (defending home is not optional), and a villager resting after a
flee is left alone. The veteran-guard half of the gate was deliberately not
touched, and the Suburb's leave-trick was not changed.

## Before / after on identical seeds

| Measure | Control | Arm | Bar | Result |
| --- | --- | --- | --- | --- |
| Wild wave-4+ meetings | 127 (world-tick 67, aid 60, patrol 0) | 108 (world-tick 64, aid 44, patrol 0) | — | — |
| Meetings the gate would have avoided (ctl) / avoided (arm) | 10, all by the outmatched rule | 13 (world-tick 9, aid 4; wave-4: 11, wave-5: 2) | arm ≥ 50% of ctl (B1) | **PASS** (ratio 1.3) |
| Wave-4 launch events / instances | 30 / 30 | 30 / 30 | ≥ 90% of ctl (B2) | **PASS** |
| Wild wave-4+ deaths | 18 | 12 | arm ≤ ctl (B3) | **PASS** |
| Wild flee damage (villager damage taken on flees) | 4,288 | 3,552 | arm ≤ ctl (B3) | **PASS** |
| Wild Suburb deaths | 1 | 1 | arm == 0 (B4) | **FAIL** |
| Wild Suburb meetings ending vFlee/mFlee/avoid | 10 of 11 | 8 of 9 | all (B4) | **FAIL** (one vDie, see below) |
| Trick-known seeds | 2 | 2 | arm ≥ ctl − 1 (B4) | PASS |
| Instrument (B5) | 8/8 files, 0 errors, D3 48/48 = 1.0 | 8/8 files, 0 errors, D3 45/45 = 1.0 | see B5 | **PASS** |

Per-seed wild deaths (ctl → arm): 104411: 1→1, 104412: 4→2, 104413: 1→1,
104414: 1→1, 104415: 0→0, 104416: 3→4, 104417: 3→2, 104418: 5→1.
Per-seed wild flee damage (ctl → arm): 290→290, 1354→1080, 281→281, 208→142,
0→0, 376→156, 939→961, 840→642. Total deaths all causes: 705 → 699.
Median survival: 132.5 days both legs.

## Why B4 fails — and what it is not

The single B4 failure is one meeting: seed 104417, day 98, a Suburb met
through aid, ending in a villager death. Read against the control leg, the
meeting is **identical**: same day, same aid origin, same outcome (vDie),
same damage taken (17), same party — three villagers (visjoin_92,
gen_0og0xvr, desmond_clarke), all armed, all armored. The two legs'
trajectories on that seed were identical through day 98 (first divergence
day 141, first avoid day 141), so the lever cannot have caused the death,
and the death predates any avoid on the seed by 43 days.

The mechanism is a pre-learning mauling, not a missed avoid. The same party
had already been mauled by the Suburb on days 94–97 (25, 13, 13, 14, 14
damage taken, all fled) — the village had not yet learned the Suburb's
leave-trick, so the trio fought for real each time, and on day 98 one of
them, already wounded from the earlier maulings, died to a 17-damage hit.
The avoid rule only fires on an *outmatched* party; this party was matched
(3, armed, armored), so the rule correctly did not fire — the classifier
agrees on both legs. The census band's Suburb picture (8 meetings, all
round-1 flees, 0 deaths) did not hold on this band: this band has a
pre-learning Suburb death on *both* legs. The prereg's B4 bar (arm Suburb
deaths == 0) therefore fails on a death the lever is scoped not to prevent.
Per the frozen prereg the verdict is NO-GO; whether the bar or the scope
should change is a coordinator call, not a waiver made here.

The arm did avoid one Suburb meeting (seed 104414, day 127, Amine's duo
of 2 — the avoid replaced what would have been a fought meeting; the
control leg fought it and fled with damage). It was the control's only
outmatched Suburb meeting on the band.

## Reachability verdict

The content in this arm's area is reachable: wave-4 meetings happened on
7 of 8 seeds on both legs (127 wild meetings on control), wave-5 on 3 of 8,
launches fired 30 times on both legs. The avoid itself fired 13 times on
the arm leg across 6 of 8 seeds (seeds 104411, 104413, 104415 had no avoid:
their wild meetings were all matched parties). No seed was avoid-free
because the lever was broken — the proof test fires it live on every
staged shape, and the arm corpus shows it firing on world-tick and aid
meetings, wave 4 and wave 5, solos, duos, and one Suburb meeting.

## Village assessment, in plain words

The lever does what the census priced it to do, and nothing it was told
not to do. Villagers stopped walking alone into fights they could not win:
13 meetings stepped aside from, wild deaths down by a third (18 to 12),
flee damage down by about a sixth (4,288 to 3,552), and not one planned
hunt lost (30 launches before, 30 after). The villages end up in the same
place overall — same national standing (3 of 8), same table (0), same wins
(0), same median survival (132.5 days) — because the wall is not wild
deaths; it is the standing stall at 199 and the deed gate, which this lever
never claimed to move. One seed (104416) ended worse on the arm: the
village was lost on day 145 where the control survived to day 150 (see the
panel investigation below). Everywhere else the arm is equal or better.
The villages feel slightly more sensible — a lone villager who sees a
Herald and steps aside reads as a person, not a casualty statistic — but
the same villager can meet the same beast six times in a week and say the
same line each time, and nobody ever actually goes for help (see
sense-testing notes).

## Panel compare (the instrument; the prereg is the judge)

`balance-panel.js compare` on the 8 paired seeds: **review_required**, with
two `regression_watch` lines, investigated here, not waived:

- **Village deaths per 100 calendar days: 69.66 → 70.17** (paired delta
  +0.51, 95% interval −0.40 to +1.62, includes 0). Absolute deaths per run
  *fell* (88.125 → 87.375). The rate rises only because the arm's runs
  total fewer days (1,010 vs 1,026 — the 104416 village lost 5 days
  early). A denominator effect, not more dying.
- **Community loss: 0.625 → 0.75** (paired delta +0.125, interval 0 to
  0.375). The extra loss is the single seed 104416: control survived 150
  days, arm lost the village on day 145. Its chain, read from the corpus:
  the arm's first avoid was day 123 (a eulogy, party of 2); the player
  bearer Greta Hansen then died in the wild on day 124 (on control she
  died the same way on day 140); a herald killed visjoin_124 on day 130
  for 113 damage (that herald was not one of the avoided beasts — the
  avoids were a eulogy, an editor, and an audit); the village collapsed
  day 145. An avoid deals no damage and kills no one; the worsening is
  chaotic trajectory divergence after the first avoid, concentrated in
  one seed. No material signal on either line (both intervals touch or
  include 0), and the judged bar B3 passes on the wild slice.

All other panel metrics: no material signal (wins 0/0, national 0/0 on the
panel's scale-access read, survival through day 30: 1.0 both, through day
60: 0.875 both).

## Wall numbers (both legs)

National standing 3/8, national rank 0, table 0, wins 0, wave-4 unlocked
7/8, wave-5 unlocked 3/8, median survival 132.5 days — identical on both
legs. The lever moves wild-meeting survival, not the wall.

## Sense-testing notes (read the transcripts, not just the counts)

The avoid line reads well once: "Daniyar sees The Herald and gives it
room — not ready alone, going back for help." The beast names land
("The Herald", "Big Ugly", "The Editor", "Big Big", "The Suburb"). But
two things read wrong in the transcript:

1. **The repeat.** Tanya meets the same audit ("Big Big") six times in
   eight days (days 131–138, seed 104416) and says the identical line
   every time. The avoid leaves the beast in the world and the same
   outmatched villager keeps walking into it — by design, but the
   transcript reads like a loop, not a person learning.
2. **The unkept promise.** The line says "going back for help" — and
   nothing ever happens. The avoid deliberately seeds no plan (prereg
   scope decision 2), so no help is ever sought, no party ever forms
   around the avoided beast. The villager goes back, and the story ends
   there. If this lever goes further, the line should either stop
   promising help or the avoid should actually start the help-seeking —
   a plan, a call, a return with friends.

## Proof and instrument checks

- **Proof test** `scripts/test-wildavoid-a.js`: ALL PASS (91 assertions).
  Live routers: solo avoids, flag-off fights, geared trio fights (herald
  and Suburb, trick known — round-1 wise leave, 0 damage dealt), solo vs
  Suburb avoids, patrol solo avoids and the beast stays in the world,
  patrol flag-off fights. Helper-vs-gate agreement on 10 staged fixtures
  (solo/duo/trio × gear × wave 3/4, plan/no-plan, table veteran,
  VETREENGAGE counted member, SEEK still fires, veteran-guard still
  fires, helper is pure). Exemptions: raid fights, post-flee rest returns
  null. Src confinement: only `src/js/game.js` (+43, including a
  one-line `return rec` so the patrol returns its fight record like the
  wild router does) and `src/js/win-plan.js` (+81/−11) changed;
  party-wiring.js (sense arm), comms.js, villager-agency.js untouched.
- **Fixes found while proving:** the fight re-equips villagers from
  their carried items at fight entry, so gear staged only in `equipped`
  is silently dropped — the proof test now stages gear in `person.items`
  and lets `villagerGearUp` wear it. There is no true solo villager in a
  fresh game (everyone senses two high-trust villagers on the Haven
  node); the test stages trust per fixture.
- **D1 repeatability:** seed 104411, 60d, arm, run twice — outputs
  identical except the `file` path. **PASS.**
- **D2 wrap neutrality:** same seed/days, recorder ON vs OFF — all 59
  daily fingerprints identical (vetSays 9 vs 0 is the recorder's own say
  capture, not game state). **PASS.**
- **D3 (in-analyzer):** replica-vs-live-gate agreement 1.0 on both legs
  (ctl 48/48, arm 45/45, n ≥ 5). **PASS.**
- **B5 cross-checks:** 0 unclassified rows both legs; every arm avoid
  row's snapshot classifies outmatched (0 mismatches);
  `winPlanStats.wildAvoids` == recorded avoids (13 == 13); 'gives it
  room' say lines == avoids (13 on arm, 0 on ctl); trajectory control
  passes on all 8 seeds (first divergence day ≥ first avoid day, or
  identical with no avoid).
- **Smoke deviation (recorded):** the prereg's 1-seed 30d smoke ran
  clean (0 errors) but wave 4 had not unlocked by day 31 (maxWave 2),
  so it could not show a `v4avoids` row. The smoke was extended to
  150d on the same seed to prove the rows: 15 encounters, all matched
  parties (3–4, armed, armored), 0 avoids — consistent, not a wiring
  failure. Smoke output discarded, not judged.
- **check.js --quick:** 324 passed, 17 failed in 2140s under load
  average ~18 (sibling sims running). Every failure observed was a
  120s per-test timeout. Targeted re-runs all green: wave4-gate 1/1,
  aid 3/3, raid 2/2, gate 1/1, fieldfight-summary 4/4,
  determinism-gate GREEN (bit-identical trajectories).
  `test-break-monsters3-fieldfights-20261008.js` scores 24/26 on this
  base; its 2 failures call `Game.fieldFight` directly, a path this
  change cannot touch (fieldFight never calls the gate; WILDAVOID
  unset), and are pre-existing on the base, not caused by this arm.
- **Write flap (11:50):** the check run emptied the worktree's
  `docs/ONTOLOGY.md` to 0 bytes; restored byte-identical from HEAD
  (2199 lines, no diff). The main tree's copy was intact. Nothing lost.

## Blanks

- No patrol wild meetings on either leg (0/127 ctl, 0/108 arm) — the
  patrol half of the lever is built and proof-tested live, but unmeasured
  in the wild on this band, exactly as the census band showed.
- The veteran-guard half of the gate fired nowhere (0 times on both
  legs) — unmeasured, as scoped; it needs a table-stage veteran first.
- Foreign aid allies are not counted in the avoid's party (no gear read
  exists for them); the watch (`helpAtDoor`) recorded 0 avoids with
  foreign faces at the door, so the question stayed moot on this band.
- The B1 ratio is 1.3 (13 arm avoids vs 10 ctl would-avoids): after the
  first avoid bends a trajectory, the arm meets meetings the control
  never had — the avoids are not a subset of the control's would-avoids.
  B1 as written (≥50%) passes; the ratio is reported, not hidden.

## Metric review

- B1's bar (≥50% of ctl would-avoids) was met with margin (130%), but
  the ratio above 1.0 shows the arm/ctl avoid counts are not directly
  comparable once trajectories diverge — a future bar should compare
  per-seed first-avoid rates or judge on the control's population only.
- B3 (deaths and flee damage down) passed on the wild slice, but total
  deaths barely moved (705 → 699): the wild slice is a small share of
  all dying, and one seed's divergence (104416) gave back a quarter of
  the saving. The lever banks the census's price; it does not move the
  wall.
- B4's zero-death bar assumed the census band's clean Suburb picture
  would hold. It did not: a matched-party pre-learning Suburb death
  exists on this band, identical on both legs. A zero bar on a
  matched-party death is unmeetable by an outmatched-only rule — the
  bar measures the trick-learning window, not the lever. If the arm is
  re-judged, B4 should be re-scoped to outmatched Suburb meetings only
  (where the arm did avoid 1 of 1 it met, and the control's only
  outmatched Suburb meeting was the same one, fought and fled).
- No 16-seed confirm: the pilot is NO-GO, so no confirm spend per the
  back-to-back rule.

## Files

- Build: `src/js/game.js`, `src/js/win-plan.js` (commit a54c8131e).
- Prereg, driver, analyzer, panel builder, proof test: committed in
  a54c8131e.
- This evidence file, the 16 per-seed corpora, `wildavoid-a-analysis.json`,
  and the panel files: committed with this note.
