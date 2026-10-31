# sim-ammo-a — field-fight ammo: why pocketing never reaches wave-4 fighters (DIAG-GO) + dawn home top-up lever (NO-GO)

Run: Loop A, fleshout-20261031T0016Z, axis scale-onramp, arm sim-ammo-a.
Worktree branch: sim-ammo-a. Base anchor: f52f08600550 (worktree HEAD;
the w4field anchor 359a384cc is an ancestor of it, and the re-baseline
below reproduces w4field's fight sequence exactly on this later base).
Pre-registration: evidence/2026-10-31/sim-ammo-a-prereg.md (written
BEFORE any judged sims; judged against it below).
Instrument: scripts/ammo-diag-20261031.js (AMMODIAG=1, read-only,
det-gate proven) + scripts/ammo-sweep-20261031.js +
scripts/ammo-analyze-20261031.js.
Proof: scripts/test-ammo-20261031.js — 23/23 green (det-gate on 60d
leadfeast trajectory identical with/without instrument; static
read-only scan; wrap fixtures incl. a real wave-4 fieldFight through
the wrapped path with a complete ammo census; real-sweep gate
byte-identical re-run). The lever's own unit proof
(scripts/test-ammo-topup-20261031.js, 12/12 on the lever tree) is NOT
committed: the lever was killed and reverted, so that proof cannot
pass on the final tree, and a failing test in the tree is worse than
no test. Its results are recorded in §Stage 2 below.
Corpora: evidence/2026-10-31/perseed-ammo-a/baseline/s85101–s85116.json
+ lever/s85101–s85116.json. The lever corpus was run with the lever
as an uncommitted worktree change to villager-agency.js (17 lines,
diff sha256 1d8d2221065150218571613b9c206335475a5645e024b03b9d2181824ce5bac4);
the change was reverted before commit (see §Stage 2), so no src/js
diff ships with this arm. No [needs-eyes] (nothing player-facing
ships: the lever is dead, the rest is measurement).
Panel (§15): NOT APPLICABLE, and none fabricated. scripts/balance-panel.js
is a policy-comparison driver: it runs registry policies
(capable/risk-aware/socialite/winseek, plus leadfeast) on ONE frozen
root and compares panel outputs. It cannot express this arm's
substrate (the leadfeast + seatdrive + windefer + fullseat-diag stack
is not a registry policy) and it has no before/after root mechanism
for a game-code change. The judge is therefore the pre-registered
identical-seed sweep comparison + cost bar, exactly as the prereg
allowed. (Same rationale as sim-w4field-a / sim-killconv-a.)

## Verdict: STAGE 1 DIAG-GO, STAGE 2 NO-GO (lever killed, reverted)

Stage 1, judged against the prereg: census coverage 30/30 wave-4
fights (100%, bar was >= 95%), re-baseline reproduces w4field
exactly (per-seed fight identity — day, vid, monster, outcome —
matches on all 16 seeds), and the band verdict names class (a) with
a per-weapon split. DIAG-GO.

Stage 2, judged against the prereg's binding GO: PRIMARY prong 1
(volley shots > 0 on >= 50% of ranged wave-4 fights) is UNMET — the
lever corpus contains ZERO ranged wave-4 fights (0/0, not >= 50%);
prong 2 (median volley damage per fought wave-4 fight > 0) is UNMET
— median 0 over 16 fought fights. Cost bar is CLEAN (below), but a
clean cost bar does not rescue a missed primary. NO-GO. The lever
is reverted; no game code ships from this arm.

## STAGE 1 — the answer: (a) never pocketed, and stronger: never departed

Over 16 seeds, 14/14 ranged wave-4 field fights are class (a).
The instrument strengthens (a) past "no pocket call" into a mechanism:

- 0 departures ever: for EVERY one of the 14 dry fighters, the
  departure record shows ZERO patrol/expedition departures before
  the fight — and zero pocket calls in the whole run. These are not
  fighters whose craft failed, whose ammo was spent, or whose stash
  was bypassed. They never pass a pocketing departure at all.
- Callers: wild node meetings (resolveWildMonsterEncounter) 5,
  Haven-door aid fights (aidFight) 9, expedition meetings 0. The
  dry fighters are jumped at home or on a home node, not met on
  expedition. Departure state at fight time: home 10, away-not-
  expedition 4, on-expedition 0.
- Per weapon: sling 7, crude_bow 4, crossbow 3. Every dry fighter's
  own stash held 0 of the needed ammo, and no ammoCraft counter
  existed for any of them (never crafted, never carried).
- The pile is full while the slings are empty: pile stone at fight
  time was 168–465 on all 14 fights — sling fighters walk around
  with empty slings next to a mountain of stones. For bows, a second
  independent block: pile stick = 0 AND fiber = 0 at all 14 fight
  moments, so an arrow/bolt craft attempt would fail on materials
  even if the fighter had pocketed (arrow needs stick 2 + stone 1 +
  fiber 1; bolt needs stick 2 + stone 1).
- Weapon acquisition is recent, not ancient: first-seen-with-weapon
  day is 2–8 days before the first fight for every dry fighter
  except one founder (sling from day 2, fight day 57, still zero
  departures in 57 days). They pick up a ranged weapon, never leave
  through a pocketing departure, and get jumped with it dry.
- Pocketing itself works for the villagers it reaches: 102 pocket
  calls band-wide delivering 49 units (baseline), and the
  expeditionMonster wave-4 fights (3, all evades) carried no ranged
  weapon at all — the departure path never even fields a ranged
  wave-4 fighter in this band.

In one line: departure-only pocketing cannot reach fighters who
never depart. The wave-4 field-fight population and the pocketing
population are disjoint sets.

## STAGE 2 — the lever: dawn at-home top-up ("quiver by the door")

Variant selection (prereg note, not a re-score): the prereg's V-wild
candidate required "an honest leaving-home hook ... that is NOT
mid-fight". Stage 1 proved no such hook reaches these fighters —
they never leave home through a pocketing departure — so V-wild as
literally written has no hook, and V-stash required class (b), which
Stage 1 refuted. The variant actually tested widens the hook by the
same honesty principle the prereg states: pocket where the pile is
at hand, never mid-fight. A villager AT HOME (not away, not on
expedition) with a ranged weapon tops up at dawn, once a day, via
the existing villagerPocketAmmo (own stash, then pile stones, then
one craft attempt). Fight entry still pockets nothing; travelers
and expedition fighters are never topped up from the home pile
(their ammo comes from departure pocketing). Game-code change was
required because no scholar policy can express NPC pack management
(policies drive the scholar only; the competent policy's arrowCraft
is scholar-only). The change touched only villager-agency.js
(agencyTick, 17 lines, dawn-gated, chain-safe try/catch like its
neighbors) — no volley code, no monster stats, no gates, no deed
bars, no wave thresholds.

Unit proof on the lever tree (12/12, script deleted with the lever
for the reason in the header): sling at home at dawn tops to 6 with
the pile closing exactly; non-dawn tops nothing; away villagers get
nothing; a bow with no sticks crafts nothing and touches nothing;
a bow with materials consumes exactly one recipe (stick -2, carried
0 or 5 on the blind roll); an expedition tick tops nothing.

Pilot (8 seeds, lever): volley damage on wave-4 fights was
UNMEASURED, not zero — the pilot produced zero ranged wave-4 fights
(all 4 lever fights were expeditionMonster, non-ranged or spear),
because early volleys shift trajectories from the first low-wave
fight onward. Killing on an n=0 sample would be the false kill the
loop warns about ("noisy small-n causes false kills"); the delivery
mechanism WAS visibly moving (187 units delivered in the pilot vs
43 baseline pilot). So the confirm was run, and the pilot-gate
ambiguity is recorded in §Metric review for future runs.

Confirm (16 seeds, lever, identical seeds + policy stack):
- Wave-4 fights: 20 (evade 4, vDie 5, vFlee 11) vs baseline 30.
  Ranged (ammo-weapon) fights: 0. The 20 lever fighters carry
  hunting_spear (10) or nothing (10). Lever-band villagers DO still
  carry bows (crossbow 25, crude_bow 22, sling 14, bow 20 villagers
  seen) — the lever did not remove bows from the game; in lever
  trajectories the wave-4 meetings fell on spear/melee villagers
  (meetings cluster by village: s85109 holds 11 of the 20 fights,
  s85112 holds 5), while bow carriers never met a wave-4 beast.
- Volley: 0 shots, 0 damage, 0 kills, 0 drive-offs — same zeros as
  baseline, but for a different reason (no ranged fighter met a
  beast, not a dry bow). The lever therefore did not demonstrate
  ANY wave-4 volley, firing or dry, in 16 seeds.
- Delivery still works: 8384 pocket calls (mostly dawn no-weapon
  early returns, as designed) delivering 318 units vs baseline 102
  calls / 49 units.
- Cost bar: CLEAN. Sampled starvation-like deaths 4 (lever) vs 5
  (baseline) — within control+2; median survival 95d vs 111d
  baseline = 0.86x, above the 0.8x floor. (Caveat, same as w4field:
  the deaths rows are a sampler, not a full census; shares are
  indicative. No arm-attributable death category exists in the
  samples, so "arm-only deaths" is read as the starvation cost the
  lever could plausibly impose, and it did not impose it.)
- Wall numbers, lever: national 9/16, table 14/16, wins 14/16,
  wave 4 unlocked 9/16, wave 5 unlocked 0/16, median survival 95d,
  max 190d. The win count (14 vs baseline 11) is NOT claimed as a
  lever effect: it rides trajectory chaos plus early-fight volleys
  in low waves, and the judged wave-4 metric never fired. Wave 5
  stays 0/16 either way.

Judged strictly: NO-GO. The lever is reverted and no trace of it
ships. What the confirm actually proved is narrower and still
useful: at-home top-up delivers ammo (318 units) without starving
anyone, but wave-4 volley measurement on identical seeds is
destroyed by trajectory divergence — the lever's early volleys
reshuffle which villagers live, move, and meet beasts, so the
before/after wave-4 samples are different villages, not a controlled
pair. A future volley measurement needs a design that survives that
(see §Blanks).

## Wall numbers (fresh band, this base — baseline arm)

- Seeds: 16 (pilot 85101–85108 + confirm 85109–85116, single policy
  stack identical to killconv/w4field, 200d death-aware cap).
- National: 8/16. Table reached: 12/16. Wins: 11/16.
- Wave 4 unlocked: 9/16. Wave 5 unlocked: 0/16.
- Median survival: 111 game days. Max: 139.
- Wave-4 field fights: 30 (evade 3, fled 20, died 7, killed 0,
  drive-offs 0). Ranged: 14, all 0-shot volleys.

## What the village looked like, in plain words

A village can own bows, arrows' raw materials in a pile, and a
working pocketing rule — and still send every single wave-4 fighter
out with an empty quiver, because the fighters who meet wave-4
beasts are not the villagers who go on expeditions or patrols.
They are the people at home: the ones standing by the door when a
raider lingers, the ones on a home node when a beast wanders in.
They picked up a crossbow or a sling days ago and nobody ever handed
them a bolt or a stone, even though the stone pile by the door held
hundreds. The archers who DO get pocketed ammo are on expeditions
somewhere else, meeting lesser beasts or nothing at all. The bow's
whole opening identity — the volley — is absent from wave-4 fights
not because the code is broken (it fires fine when ammo is carried)
and not because ammo doesn't exist (stones pile up unused), but
because the only two moments the game hands out ammo are two kinds
of departure these fighters never take.

## Sense-testing (fight records read in full, not just counted)

Baseline, volley-dry class (the finding itself):
- s85106 day 93, Oliver vs reunion (vDie): "Oliver has Crossbow but
  no arrows — the string stays drawn, useless." One strike for 19
  against 699 HP, dead in round 2. Honest narration, damning system:
  the line is legible, the quiver is empty, and nothing in the scene
  explains why. Minor wording blank (not chased): the dry line always
  says "arrows" even for a crossbow (bolts) or sling (stones).
- s85109 day 88, Sanne vs eulogy, twice (vFlee): the trick-known
  stall w4field already found — "contradicts the narration",
  0 damage, "past holding — they run". Coherent as a scene; the
  volley line is the only ranged content, and it is the dry line.
Lever corpus: no volley-fire exemplar exists to read (the finding).
Lever wave-4 fights read exactly like baseline damage-shortfall
fights (11 damage vs ~900 HP; a one-shot 66-damage death) — the
lever changed nothing visible in wave-4 fights because no lever
fighter carried a bow there.

## Metric review (applies to the NEXT run, never a re-score of this one)

1. The pilot gate's "kill if volley damage does not move" is
   ambiguous at n=0: zero ranged fights is unmeasured, not
   zero-movement. Future preregs should state the n=0 rule up front
   (this run's call: confirm, because the delivery mechanism was
   visibly moving and a kill on an empty sample is a false kill).
2. Identical-seed before/after breaks for combat levers: the first
   low-wave volley re-rolls downstream RNG, so the wave-4 samples
   are different villages, not a controlled pair. A future volley
   arm should either (a) measure volleys on a forced-meeting fixture
   band (same fighter, same beast, lever on/off — the blitz-
   combatstats pattern), or (b) pre-register a band-level rate
   (ranged-fight volley rate across 16+ seeds) instead of a
   per-fight median that needs matched fights.
3. The GO median prong (median volley damage per FOUGHT fight > 0)
   is stricter than the shots prong: with ranged fights ~half of
   fought fights, it needs nearly every ranged fight to fire AND
   hit. A sling-only win could never pass it. Future preregs should
   pick one: median over RANGED fought fights, or the shots-rate
   prong alone.
4. The deaths sampler cannot carry the cost bar's "arm-only deaths"
   clause precisely — it has no arm-attributable category. Future
   arms needing a tight cost bar should record a dedicated
   starvation-death counter in the sweep (like the ammostorage
   arm's starvationDeaths), not sample rows.

## Blanks found (for the coordinator's findings backlog — not chased here)

- Stick/fiber supply for arrow/bolt crafts: pile stick = 0 and fiber
  = 0 at all 14 baseline dry fights. Even perfect pocketing leaves
  bow/crossbow fighters dry unless sticks/fiber reach the pile.
  (Separate supply-chain blank, not this arm's lever.)
- Volley measurement design for combat levers: see metric review
  (2). The identical-seed wave-4 comparison does not survive
  trajectory divergence.
- Dry-line wording: the volley dry line always says "arrows" (crossbow
  bolts, sling stones included). One-line narration fix, not chased.
- The 14 dry fighters' never-departing status is itself a rationality
  question: villagers who carry crossbows for 50+ days without ever
  patrolling or ranging — what ARE they doing? (Out of this arm's
  scope; the instrument's departures + weaponFirstSeen records can
  serve a follow-up.)

## Convergence state

converging (measurement + killed lever): the scale-onramp axis now
has a measured answer for the ammo channel — departure-only
pocketing cannot reach wave-4 field fighters (disjoint populations),
and the at-home top-up that should reach them could not be judged
on wave-4 volleys because trajectory divergence emptied the ranged
sample. The next work on this channel is a divergence-proof volley
measurement (forced-meeting fixture band) and/or the stick/fiber
supply blank — not another identical-seed lever run.

## Files

- Pre-registration: evidence/2026-10-31/sim-ammo-a-prereg.md
- Evidence: evidence/2026-10-31/sim-ammo-a.md (this file)
- Instrument: scripts/ammo-diag-20261031.js (AMMODIAG=1, v2: fieldFight
  + pocket + departure wrappers + daily weapon-first-seen scan)
- Sweep: scripts/ammo-sweep-20261031.js (ARM=baseline|lever)
- Analyzer: scripts/ammo-analyze-20261031.js
- Proof: scripts/test-ammo-20261031.js (23/23 GREEN on the final tree)
- Corpora: evidence/2026-10-31/perseed-ammo-a/baseline/s85101–s85116.json
  + lever/s85101–s85116.json
- NOT committed (killed with the lever): the 17-line dawn top-up in
  src/js/villager-agency.js (reverted; diff sha256 in §Stage 2) and
  its unit proof scripts/test-ammo-topup-20261031.js (12/12 on the
  lever tree, deleted because it cannot pass on the reverted tree).
