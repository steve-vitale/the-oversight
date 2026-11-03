# Gear-bar autopsy — Loop A verdict (run fleshout-20261103T1819Z, arm sim-gearbar-a)

Axis: scale-onramp (standing directive: the scale wall). This arm carries
the never-started 1415Z gearbar arm and vetbar-a next blank 2: the
readiness-5 gear half (armored / armed), pairing seed-for-seed with the
vetbar pilot's veteran numbers on seeds 99101–99108.

## Pre-registration (committed before any judged sim, 89e4ac4dd)

Full text: `evidence/2026-11-03/sim-gearbar-a-prereg.md`. In short:

- Question: is the readiness-5 gear shortfall a MECHANISM bug (gear
  owned but not worn / gate miscounting worn vs owned) or a numbers
  shortfall (not enough armor/weapons exist, are learned, or are made)?
- Policy: `scripts/policies/competent.js` `{competent}` verbatim,
  default env. Seeds: 99101–99108, same band as vetbar. Horizon: 140
  days, death-aware (dead villages stop simulating; all 8 died before
  the cap, so no truncation question arises).
- Instrument: scripts only, zero src/js. Daily snapshots of
  `waveCombatReadiness(5)` plus a per-fighter recount (worn armor P via
  the gate reader AND a manual equipped-slot sum, pack / stash armor
  and weapons, equipped weapons, communal stash weapons/armor, village
  wood, scholar codex bark/hide recipe levels). Every bar value must
  reconcile to the recount.
- Phase 1 (diagnostic) succeeds iff: 0 instrument errors, gate ==
  recount on every snapshot, no worn-gear-missed flag, every end
  shortfall fighter in exactly one reason class.
- Phase 2 (fix + identical-seed rerun) triggers ONLY on a mechanism
  bug, narrowly defined: (a) gate-vs-recount mismatch, or (b) a
  non-scholar fighter spending >= 7 consecutive HOME days in
  owns-not-worn / stashed-not-fetched / communal-untaken AND a focused
  repro on their actual state showing the mechanism failing, or (c) a
  worn-gear-missed flag. A numbers shortfall is a CLEAN KILL.
- Phase 2 GO (fixed, judged later, never applied here): fixed arm
  beats baseline by >= 1 armored and/or >= 1 armed fighter on >= 2/8
  pilot seeds AND no seed loses an armored or armed fighter.
- Hard limits (binding, honored): no `readyDemand`, t4/t5, or
  `plentyCap` change; no win-price/deed-gate change; no wild-router
  ally-join code, no field-fight damage/staying code, no
  national-standing code, no veteran-counting code (settled by vetbar),
  no Loop B food-economy code. Fix area was the gear bars + wear/equip
  mechanism only — and no fix triggered, so no src/js was touched at
  all in this arm.
- Balanced panel (§15): no fix was judged, so no comparison is
  fabricated and none is attached. Stated explicitly per the task,
  not omitted silently.

## Grounding verified in code before the pilot (not assumed)

- Gate (`src/js/standing.js`): wave-5 demands armored 4 / armorP 15 /
  armed 6 / tricks 3 / veterans 2. Armor counts only when WORN
  (`armorOf` over equipped slots; scholar via `armorBonus`); weapons
  count when equipped OR carried in pack. The gate counts EVERY living
  roster member — there is no fighter/non-fighter distinction, so no
  such class is used.
- Mechanism (`src/js/equipment.js` `autoEquip`,
  `src/js/villager-build.js` `villagerGearDay`,
  `src/js/game.js` `villagerGearUp`): daily gear allocation for home
  villagers (scholar skipped) — autoEquip from own pack, own-stash
  fetch of slot-beating gear, spares redistributed by gain, communal
  weapons then communal armor by gain, one per villager per day;
  departure gearUp fetches own-stash armor/weapon, communal weapon,
  then whittles a sharpened stick if wood > 3. Deposit-is-consent
  throughout; no automatic redistribution of personal gear.
- Bark armor is P10 (below the wave-5 demand of 15 alone); hide armor
  is P20 (meets it alone). Bark + other pieces + coordination can
  reach 15.

## Phase 1 results — pilot (analyzer: scripts/gearbar-analyze-20261103.js)

Per-seed, end = last snapshot with >= 1 living fighter (see the
instrument correction below; post-collapse snapshots are empty):

| seed | days | end | maxWave | standing | end armored/armed | max armored (day) | max armed (day) | living end | tricks/vet end |
|------|------|-----|---------|----------|-------------------|-------------------|-----------------|------------|----------------|
| 99101 | 71 | lost | 4 | 125 | 1 / 1 | 7 (42) | 12 (2) | 1 | 24 / 0 |
| 99102 | 108 | lost | 4 | 140 | 1 / 2 | 7 (63) | 12 (2) | 2 | 25 / 0 |
| 99103 | 85 | lost | 3 | 99 | 0 / 2 | 4 (24) | 11 (2) | 2 | 22 / 0 |
| 99104 | 97 | lost | 4 | 125 | 2 / 2 | 7 (78) | 12 (4) | 2 | 23 / 0 |
| 99105 | 100 | lost | 4 | 195 | 6 / 7 | 6 (37) | 12 (2) | 7 | 32 / 0 |
| 99106 | 95 | lost | 4 | 135 | 1 / 1 | 8 (31) | 12 (2) | 1 | 32 / 0 |
| 99107 | 80 | lost | 4 | 150 | 4 / 7 | 5 (66) | 11 (5) | 7 | 20 / 2 |
| 99108 | 71 | lost | 4 | 100 | 5 / 5 | 8 (67) | 12 (2) | 5 | 23 / 0 |

Median survival 90 days (max 108). Wins 0/8. All 8 villages lost.

Reconciliation (the Phase 1 bar): instrument errors 0 on all 8 seeds,
gate-vs-recount mismatch days 0 on all 8 seeds (every daily snapshot,
~700 total), worn-gear-missed flag days 0, unclassified end fighters 0.
The gate counts exactly what the recount counts, and no worn armor
ever reads below its manual equipped-slot sum.

Transient vs end — the headline finding: BOTH gear bars are met
transiently on 8/8 seeds (armored max 4–8, always >= demand 4; armed
max 11–12, always >= demand 6, usually by day 2–5 from starter gear +
whittling). The bars then DECAY as fighters die. At end, armored
demand is met on 3/8 seeds (99105, 99107, 99108) and armed demand on
2/8 (99105, 99107). End shortfall is attrition, not production: on
5/8 seeds the living roster at end (1–2 people) is arithmetically
below the demands (4 armored / 6 armed) no matter how geared — a
one-person village cannot field four armored fighters.

End reason classes (27 living end fighters; armed shortfall: ZERO):

| class | count | meaning |
|-------|-------|---------|
| meets (armor) | 20 | worn P >= 15 |
| wears-below-demand | 2 | worn P 1–14, nothing better owned (one fighter at P14 — a single point short) |
| owns-not-worn | 5 | armor in pack while worn P < 15 — ALL FIVE are duplicate spares (see below) |
| no-armor-* / stashed / communal classes | 0 | no end fighter in any of these |
| meets (armed) | 27 | every living end fighter is armed |
| armed shortfall (any class) | 0 | — |

Owns-vs-wears split at end, all seeds summed: armor worn 66 pieces,
pack 57, stash 2, communal 0; weapons total 63 (equipped + carried +
stash). Gear is abundant; bodies are not. Communal stash weapons and
armor are 0 units at end on all 8 seeds, village wood at end is
151–1395 (the whittle fallback was never wood-blocked), scholar codex
knows bark at L1–2 on all seeds and hide on 6/8 — recipe knowledge is
not the constraint either.

## The persistence investigation (why Phase 2 does NOT trigger)

The analyzer flags fighters with >= 7 consecutive home days in a
mechanism class — 4 on 99101, 1 on 99102, 12 on 99103, 6 on 99104, 2 on
99105, 1 on 99106, 5 on 99107, 4 on 99108. That list looks like a
mechanism failure until the gear is read slot by slot. It is not:

1. The overwhelming majority are DUPLICATE SPARES. The pack holds a
   second copy of the already-worn item (same id, same P) or a weaker
   same-slot piece: e.g. worn bark 10 with three more bark 10 in pack
   (99102), worn investigators-coat 12 with a duplicate in pack
   (99105), worn denim 4 with denim + gloves duplicates in pack
   (99107). autoEquip correctly keeps the worn copy; the spare cannot
   raise worn P. The prereg-literal owns-not-worn class counts
   instances, not slot-wise gain, so it over-flags spares — recorded
   here as an instrument refinement for the next arm, not hidden.
2. The four genuine-improvement cases were traced day by day, and
   every one resolves within a day — the mechanism works:
   - 99104 gen_eefxb2h: stormcloak (P15) enters pack day 32 at ap 1 →
     worn day 33, ap 18.
   - 99108 gen_anmt6e3: witness-coat (P15) enters pack day 52 at ap 5
     → worn day 53, ap 17.
   - 99105 app_mgpsphkk46: scar-tissue wraps (hands, empty slot)
     enter pack day 62 at ap 14 → worn day 63, ap 24.
   - 99108 gen_2n9s4kk: good-boots (empty shoes slot) arrive while
     the fighter is AWAY (gearDay correctly skips away villagers) →
     worn on return/departure gear-up, ap 27.
3. The five end owns-not-worn cases were checked individually: all
   are duplicate spares (running-shoes dup, bark dup, ghost-camo dup,
   denim/gloves dups, torso pieces weaker than the worn
   investigators-coat 12). Zero genuine improvements left unworn at end.

Phase 2 trigger check: (a) mismatches 0 — no; (b) >= 7 home days in a
mechanism class PLUS a repro showing failure — persistence exists
only as spare artifacts, and the repro traces show success — no;
(c) worn-gear-missed flags 0 — no. Phase 2 does NOT trigger.

## Verdict — CLEAN KILL, no fix, no confirm

There is no wear/equip mechanism bug to fix: the gate counts worn vs
owned exactly as designed, the daily allocation wears genuine
improvements within a day, and the armed bar has zero shortfall
fighters at end on any seed. Per the prereg, no fix is forced, no
confirm run is spent, and no balanced-panel comparison is fabricated.
The blank is documented precisely instead:

1. PRODUCTION IS NOT THE GEAR STORY. Both gear bars are met
   transiently on 8/8 seeds and gear is plentiful at end (66 worn +
   57 pack armor pieces, 63 weapons). Villages do not fail readiness-5
   for lack of gear-making or gear-wearing.
2. ATTRITION IS THE GEAR STORY. Bars decay as fighters die, and
   collapsed villages (1–2 living) cannot meet demands sized for a
   full roster. Gear shortfall at end is a survival failure wearing a
   gear costume.
3. THE BINDING BARS ON SEEDS THAT GET CLOSE ARE ELSEWHERE. 99105
   meets both gear bars (6/7) with standing 195 — one step from the
   standing bar — but veterans 0. 99107 meets ALL FOUR bars
   (armored 4, armed 7, tricks 20, veterans 2) on days 76–80 and still
   does not release, because standing is 150, not the 199 the door
   needs: readiness-ready alone does not release, by design (standing
   opens the door, readiness decides walking through). The wall past
   gear is veterans-production (vetbar blank 1: kill conversion +
   killer survival) and standing accumulation — not gear.

## Village assessment (plain words)

Picture eight villages playing competently for two to three months
each. All eight die; none reaches the horizon. Early on, everyone is
armed — a sharpened stick or a starting weapon in every hand by the
first week — and within a month or two most villages have four or
more fighters in real armor. Then people start dying, and the armor
goes with them: not because anyone refuses to wear it, but because
the wearer is dead and the village is smaller. By the end, five
villages are down to one or two living souls, one of them carrying
eleven spare armor pieces no one is left to wear. The two villages
that stay big enough to field a geared party still cannot open the
wave-5 door — one is a single standing point from the threshold but
has no living veteran, the other is fully ready on every bar for
five days and still lacks the standing to walk through. The gear
closet is full. The village is empty. That is the wall now.

Villagers act like people in the traces that matter here: they wear
what they own, they pick up better armor the day after they find it,
they carry spares of what they already wear, and the last survivor of
a collapsed village is found still wearing good armor with the dead
village's spares in their pack. Nothing robotic was flagged by this
arm; the sense-test failure, if any, is the opposite — villagers gear
up sensibly and still die. Say-line samples are coherent in-fiction
(the old bark cuirass by the fire teaching its shape on day 1,
pantry checks before heading out, fireside retellings); the one
recurring oddity is anonymized gossip ("A woman, maybe 40s, telling
A man, maybe 50s about A man, maybe 60s"), which is the game's
deliberate fog-of-war voice, not a gear finding.

## Wall numbers (this pilot, not wall movement)

Wins 0/8. Villages lost 8/8, survived to horizon 0/8. National /
table: not instrumented by this arm (readiness-5 is the gate before
them). Readiness-5-ready snapshots 6, all on seed 99107 (days 76–80),
0 on the other 7 seeds. Wave-5 unlocks 0/8, wave-5 faced 0/8, wave-4
faced 7/8 (99103 never passed wave 3). Gear bars met transiently
8/8 (both bars); met at end 3/8 armored, 2/8 armed, 2/8 both. Median
survival 90 days (max 108). These are the baseline the next arm
measures against, not a claim that the wall moved.

## Metric review (for the NEXT run, §14 — no in-run re-scoring)

- End-snapshot correction (instrument fix, not a metric change): the
  first analyzer run classified the FINAL snapshot, which for lost
  villages is post-collapse (0 living fighters, empty classes on
  99101/99106). "End" now means the last snapshot with >= 1 living
  fighter, falling back to the last snapshot only if none exists.
  The metric (end armored/armed) is unchanged; the snapshot that
  represents "end" is now the village's last living day. Proof tests
  still pass (16/16) after the change.
- The prereg-literal owns-not-worn class over-flags duplicate spares.
  Proposed refinement for the NEXT arm (not applied here): count a
  fighter owns-not-worn only when a pack/stash armor piece would
  raise worn P slot-wise (empty slot, or higher P than the worn piece
  in that slot, coordination accounted for). Do not re-score this
  pilot against that class — its verdict stands on the prereg
  classes plus the day-by-day traces, which already separate spares
  from genuine improvements.
- Snapshot cadence is ~daily (68 snapshots over 71 days on 99101):
  policy.daily does not fire every calendar day, so persistence runs
  are snapshot-consecutive, not strictly calendar-consecutive. The
  1-day improvement-to-worn traces are unaffected (they read
  consecutive snapshots).
- Seed-band pairing note: these are the same seeds as vetbar, but
  the branch moved since (journey-landing r74 etc.), so trajectories
  differ from vetbar's (median 90d here vs 111d there; 0 survivors
  here vs 1 there). Gear findings stand on this run alone; cross-arm
  seed pairing is band-level, not trajectory-identical. Any future
  arm that needs paired veteran + gear numbers on identical
  trajectories must re-run both instruments on one anchor.
- Say-sample noise: the gear filter matched "ready" broadly (garden
  beds "turned and ready"), so the 150-line cap fills with garden
  noise; the gear-relevant lines (bark recipe, cuirass beat) are
  still coherent. A tighter filter (armor|weapon|cuirass|veteran)
  is proposed for the next arm's sense sample.

## Next blanks, in order

1. Veterans-production + killer survival (vetbar blank 1, still open):
   why wave-4 exposures yield so few kills and why killers die — the
   binding bar on the seed that meets both gear bars (99105: veterans
   0). Coordinate with, do not duplicate, the win-fielddmg and
   win-allyjoin lanes.
2. Standing accumulation to 199 on gear-ready seeds (99107 pattern):
   a village fully readiness-ready for five days still needs the
   standing bar; measure what standing income is missing on such
   seeds before any gate/price discussion (gates and prices stay
   untouched unless Steve orders otherwise).
3. Roster-collapse arithmetic for future gear arms: measure gear bars
   against living-roster size (or at peak roster), not only at end —
   a collapsed village's end shortfall is survival, not gear.
4. Readiness-5 release still 0 days of actual release (99107's ready
   days did not release for lack of standing): after blanks 1–2,
   re-measure release on identical seeds before any gate/price
   discussion.

## Proof and landing

- Proof: `scripts/test-gearbar-20261103.js` — 16/16 PASS (15 fixture
  tests: all six armor classes, all armed classes, gate-mismatch
  detection, worn-gear-missed detection, transient-max tracking,
  persistence runs incl. away-reset and scholar exclusion; plus the
  live harness smoke: fresh seed-99101 game snapshots with gate ==
  recount and zero instrument errors). Re-run post-commit below.
- Commits (this worktree branch sim-gearbar-a; coordinator merges via
  --ff-only; merged locally, pending ship — no push, no bump, no
  live verification by this worker):
  - 89e4ac4dd sim-gearbar-a prereg (before any judged sim)
  - b781a238 sim-gearbar-a instruments: gear recount + driver +
    analyzer + proof 16/16 (zero src/js)
  - (pilot + evidence commit below)
- Files: prereg + evidence in `evidence/2026-11-03/sim-gearbar-a*.md`;
  per-seed JSON in `evidence/2026-11-03/perseed-gearbar-a/` (8 files,
  gearbar-pilot run); scripts `gearbar-instrument-20261103.js`,
  `gearbar-driver-20261103.js`, `gearbar-analyze-20261103.js`,
  `test-gearbar-20261103.js`.
- Index-clobber note: safe-commit.sh left bogus staged deletions in
  the main index after both commits (prereg + instruments); repaired
  each time via HEAD-blob `update-index --cacheinfo` and verified
  `git status` empty + `git diff HEAD` empty. The commits themselves
  were always correct.
- Worktree state at handoff: only committed work; no uncommitted
  leftovers beyond the pilot + evidence commit below (verified
  before reporting).
