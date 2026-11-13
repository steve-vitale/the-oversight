# sim-mirrorcap-panel3-geared — mirror-cap panel 3: geared scholar + party: NO-GO (M2), n=7 reached

**Arm:** sim-mirrorcap-geared-b (Loop B, axis: winnability chain) ·
**Base:** master tip **42024a8de** (rebased from 4c4df500e before any
panel chain ran — see prereg CORRECTION) · **Worktree:**
`~/workspace/worktrees/sim-mirrorcap-geared-b` (branch
sim-mirrorcap-geared-b) · **Baseline leg:** pristine master at
42024a8de, run read-only from the main tree with outputs redirected
into this tree (main tree verified clean before and after; no
second baseline worktree — registration took ~30 min under
REGISTRY.lock contention and the cap was 15/16) · **Cap:**
cherry-picked `61af85f26` (branch sim-mirrorcap-panel-b) as
`417f5ef5a` after the rebase, unchanged as pinned
(`REUNION_ARENA_MIRROR_CAP = 1`, arena-only) · **Prereg:**
`evidence/2026-11-13/sim-mirrorcap-panel3-geared-prereg.md`
(committed before any panel run; fixture, seed band and GO bar
frozen; one recorded correction: base 4c4df500e → 42024a8de) ·
**Steve's call (2026-11-07, lean):** "Probably cap mirror for
arenas." · **Steve's call (2026-11-13 06:20 CST):** "Test a geared
scholar first." · **Standing rule (Steve 2026-11-13):** every test
must reflect the average gear a player would actually have when
they reach that content — a geared scholar fighting with a party,
never a fresh un-geared scholar alone.
**Proof:** `scripts/test-mirror-cap-20261107.js` **29/29 green** on
the new base (before the panel) · `scripts/test-arena-20261107.js`
**57/57 green** after the same one-assertion update panel 2 made
(expect 1 arena Reunion mirror, not 3) · **Panel driver:**
`scripts/mirrorcap-panel3-geared-20261113.js` (panel 2's driver
with the geared fixture + one fix: `Game.equip` returns null on
success, so the equip check reads the equipped map, not the
return value) · **Analyzer:**
`scripts/analyze-mirrorcap-panel3-geared-20261113.js` · **Corpus:**
`evidence/2026-11-13/perseed-mirrorcap-panel3-geared/` (24 JSON
rows: 12 seeds × baseline/armed, 0 instrument errors).

## Verdict: NO-GO — M2 fails on n=7, and the why is now measured for a geared party

Judged against the frozen bar:

- **M1 — the cap fires: PASS.** Arena Reunion mirror count ≤ 1 on
  EVERY chain reaching the Reunion wave (7/7 armed; 1 vs 3 on all
  seven matched pairs).
- **M2 — the draw stops being auto-fatal for a real contestant:
  FAIL.** Armed arm won **0** Reunion waves (bar: ≥ 1). Baseline
  also won 0.
- **M3 — no regression, non-arena control: PASS.** Proof test 29/29:
  field Reunion with partyN 4 still spawns 3, solo still 1.

**GO requires M1+M2+M3. M2 failed, so the verdict is NO-GO as
preregged.** But the fixture gap Steve named is now closed as a
measurement: the geared party is transformatively stronger than
panel 2's fresh scholar — it deals **~8× the damage** (mean 34.1%
of one Reunion's HP vs panel 2's ~1–4%; best chain 57.4%) and
lasts **~2.5× the rounds** (mean 8.6 vs 3.4) — and still wins
none. The deaths are base Reunion lethality at the measured-average
loadout, not mirror count: one Reunion alone still outclasses a
geared party of three. Per Steve's answer, the scaling question
(Reunion HP/damage in the arena) now goes back to him with this
panel as the evidence; the cap number is not recalibrated (1 is
already the floor) and the cap is not landed on this verdict.

## The fixture (measured, not invented)

**Census:** `scripts/geared-census-20261113.js` — real
competent-policy legs, seeds 53001–53008, 150d, daily gear
snapshots + Gauntlet capture. Corpus:
`evidence/2026-11-13/perseed-mirrorcap-geared-census/` (8 valid
JSONs, 0 instrument errors; 5 seeds village-lost, 2 survived to
150d). The census ran on the pre-rebase base (4c4df500e + cap);
the combatdedup change that moved the base is narration dedup and
does not move gear distributions — the loadout derivation stands.

- Scholar, day≥50 (586 scholar-days): median weaponBonus **35**,
  median armorProtection **28**, median HP 100. Top single weapon
  machete (61 days, bonus 35); mode torso wardens_cloak (141 days,
  protection 25); mode two-weapon combo phase_blade+hunting_spear
  (89 days, bonus 90) is the lucky/high loadout, NOT the average.
- Gauntlet-day pre-fight snapshots (n=3 days): 53001 d71
  crude_bow (18) + hide_armor (30) + between_boots (8), armor 38;
  53005 d116 stone_knife (12) + investigators_coat (12), armor 12;
  53007 d124 hunting_spear (30) + phase_blade (60) +
  wardens_cloak (25), wBonus 90, armor 28, party 2 — and that
  scholar WON all 3 Gauntlet waves (waves drawn naturally, not
  forced Reunion). Gauntlet-day wBonus median 18, mean 40.
- Allies, day≥50 formal-party members (362 snapshots): median
  weaponBonus **30**, median armorProtection **20**, median HP 95.
  Top weapon pairs: stone_knife+crude_bow (102), crossbow alone
  (102), stone_knife+hunting_spear (94); mode torso bark_armor
  (146). The Gauntlet-day party (53007 d124) carries exactly this
  shape: Stan stone_knife + crude_bow + bark_armor (wBonus 30,
  armor 20), Elena crossbow + hide_armor (wBonus 28, armor 33).
- Formal party is empty on 65% of day≥50 scholar-days — the panel
  stages its 2 allies as roster villagers placed adjacent (the
  panel-2 pattern), matching how the fight-play census counts
  fights starting with three people.

**Staged loadout (frozen in the prereg):** scholar **machete**
(melee, bonus 35) + **wardens_cloak** (torso, protection 25), HP
100; allies (each) **hunting_spear** (ranged, bonus 30 — no ammo
field, so no quiver staging was needed) + **bark_armor** (torso,
protection 15). The hunting_spear route was chosen over
stone_knife+crude_bow because a bow needs real ammo (the volley
spends 1 ammo/shot from the carrier's own items; the census does
not record ammo counts, so staging a quiver would invent a
number) — the spear reaches the same median 30 ammo-free. The
staged scholar (35/25) sits at the day≥50 medians; the staged
ally (30/15) hits the median weaponBonus exactly, with armor 15
vs median 20 (the remaining ~5 comes from minor slots like
legs/hands, which the driver does not stage — documented in the
prereg). No shoes (none on 79% of day≥50 scholar-days), no
abilities (the driver plays strike-only, as panels 1–2 did).
Fixture readback verified on all 12 armed chains: scholar 35/25,
allies 30/15, partyN 3, 0 instrument errors.

**Census interruptions (recorded):** a write-flap episode
(~14:15–14:53Z, ~38 min; watcher A/B/E FAIL, C/D OK) killed two
census writes mid-run (seed 53002's file left 0 bytes; seed
53006's write failed the same way). Both seeds were re-run after
writes cleared; a second flap micro-window killed 53008's first
retry, and a VM replacement killed the retry loop mid-attempt-2
(background setsid processes do not survive replacements — the
loop was re-run for the one missing seed). All 8 census rows were
validated as parseable JSON before the loadout was derived. The
first attempt's seed band 92102–92117 was abandoned before any
panel run: it is CONTAMINATED (92104 in r104-prereg + doomrevive;
92108 in r124/r125 preregs) — the first worker's
"freshness-verified" claim was wrong; the panel band is
92302–92317, verified clean (see prereg).

## The panel: 16 chains attempted, 12 valid, matched exactly

Fixture (panel 2's, with the geared party): unlockedWave → 4 (live
pool asserted 58 incl. Reunion, excl. Herald); staged scholar with
the census loadout via the real equip path (`Game.equip` for the
scholar, the person record for allies); partyN 3; Gauntlet
`{waves: 3}`; arena-b driver (strike the first live monster each
player turn, `tbAdvance` otherwise); no HP nerfed anywhere. **Only
wave 3 forced to Reunion; waves 1–2 drawn naturally** (driver
replicates `_contestArena`'s picks). Seeds **92302–92317**.

**Four chains are fixture failures, not measurements (92306,
92308, 92310, 92311, both arms identically):** the staged party
did not form at partyN 3 — a staged ally fled the arena at the
sight of the wave-1 beast before the first player turn (the
panel-2 lesson, pre-registered as an allowance this time). The
driver's `partyN=3` fail-loud check fired (exit 2). The four seeds
were NOT replaced: the band was frozen before seeing results, and
replacing failed seeds post-hoc would be cherry-picking. The panel
is judged on the 12 valid chains, with the shortfall stated here,
not hidden. M2's threshold (≥ 1 win) is a count, not a rate, so 0
wins in 7 exposures fails it under any reading of the panel size.
(Panel 2 lost 3/16 this way; panel 3 loses 4/16 — the natural draw
exposes the same real game behavior more often at partyN 3 than
at partyN 4, or it is seed luck; either way it is recorded, not
hidden.)

**Matching is exact:** all 12 valid chains are identical between
arms through every non-Reunion wave (same draws, same rounds, same
HP, same outcomes). The arms diverge only at Reunion waves, as
designed — including the one natural early Reunion draw (see
below). 0 instrument errors. (The baseline rows carry
`capConstant: null`, the arm fingerprint; armed rows carry
`capConstant: 1`.)

### Per-chain outcomes (12 valid chains)

| Seed | Waves 1–2 | Armed | Baseline | Reached Reunion (w3)? |
|---|---|---|---|---|
| 92302 | hummice, bulldozer | died w1 | died w1 | No |
| 92303 | white_noise_heron, review_drone | died w3 | died w3 | **Yes** |
| 92304 | gavel, union_rep | died w1 | died w1 | No |
| 92305 | sanjun, murkcap | died w3 | died w3 | **Yes** |
| 92307 | terms_of_service, reunion | died w2 | died w2 | No (died on natural w2 Reunion) |
| 92309 | ad_break, statickite | died w1 | died w1 | No |
| 92312 | sweeps_week, callback | died w3 | died w3 | **Yes** |
| 92313 | voice_mimic_radio, sweeps_week | died w3 | died w3 | **Yes** |
| 92314 | ducks_in_a_row, sanjun | died w3 | died w3 | **Yes** |
| 92315 | algorithm, paparazzo | died w1 | died w1 | No |
| 92316 | paparazzo, white_noise_heron | died w3 | died w3 | **Yes** |
| 92317 | mirror_stag, landlord | died w3 | died w3 | **Yes** |

Full-chain wins: 0/12 both arms. Wave-1/2 deaths: 5/12 both arms
(the natural draw still puts wave-3/4 beasts on wave 1 — gavel,
ad_break, algorithm — and even a geared scholar often dies before
wave 3; 92302's hummice fight ran 159 rounds and 92309's ad_break
57 rounds before the deaths, kiting fights the strike-only driver
cannot close — the same driver limitation panel 2 noted, not a
game defect); 92307 died on the natural wave-2 Reunion on both
arms.

### The seven matched Reunion waves (the whole M2 sample)

| Seed | Arm | Mirrors | Entry HP | Rounds | Scholar end HP | Reunion HP left |
|---|---|---|---|---|---|---|
| 92303 | armed | **1** | 1.00 | **12** | −0.19 | **42.6%** |
| 92303 | baseline | 3 | 1.00 | 4 | −0.22 | 75.3 / 100 / 100% |
| 92305 | armed | **1** | 0.97 | **6** | −0.09 | **78.1%** |
| 92305 | baseline | 3 | 0.97 | 4 | −0.06 | 85.6 / 100 / 100% |
| 92312 | armed | **1** | 0.90 | **7** | −0.17 | **72.2%** |
| 92312 | baseline | 3 | 0.90 | 4 | −0.05 | 84.0 / 100 / 100% |
| 92313 | armed | **1** | 0.98 | **8** | −0.01 | **71.7%** |
| 92313 | baseline | 3 | 0.98 | 4 | −0.17 | 85.9 / 100 / 100% |
| 92314 | armed | **1** | 0.77 | **8** | −0.07 | **66.9%** |
| 92314 | baseline | 3 | 0.77 | 3 | −0.16 | 86.4 / 100 / 100% |
| 92316 | armed | **1** | 1.00 | **12** | −0.12 | **52.5%** |
| 92316 | baseline | 3 | 1.00 | 5 | −0.12 | 78.7 / 100 / 100% |
| 92317 | armed | **1** | 1.00 | **7** | — | **77.2%** |
| 92317 | baseline | 3 | 1.00 | 3 | −0.17 | 90.3 / 100 / 100% |

(92317 armed has no scholar end HP: the wave ended on the
scholar's death without a wave-3 tbEnd record for that chain —
the analyzer reports hpAtEnd only when the record exists; the
death itself is recorded. Damage is from the Reunion's remaining
HP frac in the monstersAtEnd record, which exists for all seven.)

The cap fires (M1) and it moves the fight decisively: baseline
Reunion waves all end in 3–5 rounds (mean 3.9) with the mirrors
essentially untouched; armed waves last 6–12 rounds (mean 8.6)
and the party takes 22–57% off ONE Reunion (mean 34.1% vs
baseline mean 16.3% against the lead mirror). The geared scholar
strikes for 48–55 a hit (panel 2's fresh scholar: 3–4) and the
armor absorbs 38–53 per returned move. Yet the healthiest entries
(1.00 HP on 92303/92316/92317) still died in 7–12 rounds. The
binding constraint is now visible in the numbers: a Reunion's HP
pool (~1200–1400) against a party dealing ~50/strike means ~25
solid hits to kill one — and the mirror's returned moves (17–23
after absorption) kill the 100-HP scholar in ~5–6 of its own
turns, before the party gets there. One Reunion alone outclasses
the geared party; the mirror count was never the binding
constraint for this contestant either.

### The natural early Reunion (92307, wave 2)

Seed 92307 drew Reunion naturally on wave 2 (waves
`['terms_of_service', 'reunion', 'reunion']`). It is NOT part of
the M2 sample (wave-3 only), but it is a matched extra exposure:
armed 1 mirror, 9 rounds, died (entry 0.80 HP); baseline 3
mirrors, 4 rounds, died (entry 0.80 HP). Same shape as the wave-3
sample — the cap more than doubles the fight's length and the
party still dies to the one mirror. The wave-1 terms_of_service
fight matched exactly (7 rounds, won, 1.00 → 0.80 HP both arms).

## Sense-testing (read, not counted)

**Armed 92303, Reunion wave (12 rounds, entry 1.00 HP, 57.4%
damage — the best chain).** The single mirror still reads as the
Reunion. The scholar's strikes land for 48–55 ("You STRIKE the
everyone you've buried, standing up for 53 (Machete)"), each
preceded by "OVERCHARGED ×1.25 (well-fed): food is fuel" — the
geared scholar fights fed, as a real contestant would. The mirror
returns the move ("It knows 'strike' — it watched you do it 10
times. YOUR MOVE, back at you"), 17–23 after armor absorbs
38–53. The Reunion bleeds ("everyone you've buried, standing up
is BLEEDING — and it likes it. Louder, faster, no more feints")
and the scholar's Agility grows mid-fight ("Your Agility grows —
7. … Footwork — You move without thinking. (tier 1)"). The defeat
is legible: a real fight against a superior foe, lost on the HP
race, not on confusion. Nothing robotic, nothing incoherent.

**Baseline 92316, Reunion wave (5 rounds).** Three mirrors, same
lines, over before the party gets going — the scholar goes down
in 5 rounds having taken 21.3% off the lead mirror.

**92302 hummice (159 rounds, death).** A kiting fight: the
strike-only driver never moves, so a kiting beast is uncatchable
by construction and the chain bleeds out over 159 rounds. Same
driver limitation panel 2 noted on ducks_in_a_row; a
movement-capable driver would be needed to judge kiting beasts
fairly. It changes no verdict (both arms died identically).

## Wall context (fixture numbers, not scale-wall numbers)

This Gauntlet fixture does not reach national/table/wins — it is a
3-wave arena chain for one scholar + party, not a village sim.
Fixture numbers: Reunion-wave wins 0/7 armed, 0/7 baseline;
chain wins 0/12 both arms; deaths 12/12 chains both arms (5
before wave 3, 7 on the Reunion wave, counting 92307's natural
wave-2 Reunion death). Do NOT present these as scale-wall numbers.
The winnability-chain relevance is narrow and stated: the arena
Reunion draw, at cap 1, is still unwinnable for a geared scholar
with a party of three at the measured-average loadout — the mirror
count is not the binding constraint for this contestant.

## What this means

- The mechanism is proven three times over: the cap is live,
  exact, and contained to arenas (M1 + M3 pass, proof 29/29, 7/7
  matched exposures this panel, 7/7 in panel 2).
- The gear question Steve asked is now measured and fails on a
  real sample (M2: 0/7, n=7, not n=2). A geared scholar with a
  party deals 8× panel 2's damage and lasts 2.5× the rounds — and
  still wins none. The cap as pinned does not make the draw
  winnable for a real Gauntlet contestant, because one Reunion
  alone outclasses them, not because three mirrors overwhelm them.
- Per Steve's answer, the scaling question goes back to Steve
  (Reunion HP/damage in the arena) with this panel as the evidence.
  The cap number is not recalibrated here — 1 is already the floor,
  and the evidence gives no reason to think a different cap number
  fixes a lethality gap of this size (the best chain still left
  42.6% of one Reunion standing).
- Do NOT land the cap on this verdict: landing it would claim a
  winnability fix the panel measured as failing. Do NOT kill the
  cap either: the mechanism is proven and the failure is lethality,
  not the cap — killing it discards a proven mechanism over a
  scaling question that belongs to Steve. The cap stays on its
  branch, unlanded, pending Steve's scaling call.
- Remaining measurement gap (for a future panel, not this run):
  abilities are not staged — the driver plays strike-only. The
  census shows Gauntlet contestants hold forager/crafter kits
  (green_whisper, beard_moss, green_thumb, cornucopia; 53007 held
  translator/rally_aura/cornered_rat/night_eyes), not combat
  abilities. Whether an ability-using party wins the Reunion wave
  is unmeasured — but it is a different panel (ability play), not a
  reason to re-run this one, and it does not change this verdict.

## Metric review (MEASUREMENT.md §14)

- The frozen metrics bound the run: M1/M2/M3 judged exactly as
  preregged. The 4 fixture failures reduce the panel from 16 to 12
  valid chains; M2 is a count threshold (≥ 1 win), so 0 wins in 7
  exposures fails it under any panel-size reading. No re-scoring
  against a friendlier metric was done (e.g. "rounds lasted" or
  "damage dealt" were reported as mechanism evidence, never as a
  substitute win bar — even though both moved decisively, the bar
  did not move with them).
- Metric lesson carried forward: the prereg's "16 chains" assumed
  the staged party always forms. With natural draws, a staged ally
  can flee before turn 1 (4/16 here, 3/16 in panel 2). The
  fixture-failure allowance worked as designed. A future panel
  that needs a larger valid n should over-recruit chains up front
  (e.g. prereg 20 chains, judge on valid ones) rather than
  replacing failed seeds post-hoc.
- The proof test (M3) and the panel driver both behaved as
  preregged; `check.js --quick` was run in the panel tree (see
  gate log below). The one driver fix found by the smoke (Game.equip
  returns null on success) was fixed BEFORE the prereg was committed
  and the smoke re-run — it is a driver-correctness fix, not a
  fixture change.

## Gate

`node scripts/check.js --quick` in this worktree
(gate log: `evidence/2026-11-13/sim-mirrorcap-panel3-geared-gate.log`):

- Run: **335 passed, 5 failed in 712s.** The 5 failures:
  1. `test-measurement-proof-update` (exit 1) — "Proof source
     inputs are not current."
  2. `test-measurement-workflow` (exit 1) — "retained neutrality
     proof covers the current Game/controller/harness inputs."
  3. `test-living-garden-deed-attainment` (exit null, exactly
     120s) — timeout.
  4. `test-phone-frame-proof` (exit 1) — retained browser-input
     proof stale (index.html + data files), "current phone evidence
     is required."
  5. `test-one-person-army-deed-attainment` (exit null, exactly
     120s) — timeout.
- Adjudication: (1), (2) and (4) were **verified pre-existing on
  pristine master** (re-run in the main tree at 42024a8de, no cap
  code — identical failures; main tree left clean). They are the
  standing stale-proof classes, not the cap. (3) and (5) are the
  known 120s load-timeout class (exit null at exactly 120s, long
  sims under parallel load) — the same class panel 2 adjudicated;
  living-garden was re-run standalone (see below). **No failure
  touches the cap, partyTactics, arena, or mirror code.**
  Notably absent vs panel 2: no test-arena failure (the assertion
  update is in this branch), no trust-observer-neutrality failure,
  no cache-flags failure. This is the cleanest mirrorcap gate yet
  (335/5 vs panel 2's 329/11 and 325/15).
- Standalone re-runs: living-garden **8 passed, 0 failed** and
  one-person-army **7 passed, 0 failed** when run alone — both
  gate timeouts were box-load artifacts, confirmed. Gate GO after
  adjudication: 335 passed, 5 failed, all 5 pre-existing staleness
  or load artifacts, 0 attributable to the cap or this panel.

## Run notes (process, for the next worker)

- Registration took ~30 min (REGISTRY.lock contention: the
  register script's own pre-reap + the 10-min cron reaper + a
  sibling registration all queued on the lock; the `git worktree
  add` itself then spent ~15 min in `git reset --hard` on the
  shared 1.5-CPU box). Nothing to fix from here — record the cost.
- The first attempt's band 92102–92117 is contaminated (see
  above); do not reuse it. The panel band 92302–92317 is now used
  (12 valid + 4 fixture failures).
- Runner-log caveat: the first version of the panel runner
  clobbered `$?` with a `$(date)` substitution inside the same
  `echo`, so the exit codes it logged before ~15:45Z are all 0 and
  meaningless. The driver itself exits 2 on a fixture failure
  (verified directly). Validity was always judged by JSON parsing,
  never by those exit codes. The fixed runner captures the exit
  code before any substitution.
- Safe-commit index clobber struck on all three commits in this
  tree (D, D+??, MM presentations). The commits were always
  correct; repair was `git ls-tree -r HEAD -- <paths> | git
  update-index --add --index-info` each time, verified by empty
  status + empty diff HEAD.
- The baseline leg ran read-only from the main tree (no second
  baseline worktree). Main tree verified clean before and after.
  The baseline used the main tree at 42024a8de — the same tip the
  armed branch was rebased onto. If master moves again before a
  future panel, rebase BOTH arms to the same tip before running.
