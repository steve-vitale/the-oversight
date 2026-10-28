# fixall-armor round 3 — armor-craft conversion — PRE-REGISTRATION (binding, MEASUREMENT §14)

Workstream: ARMOR-CRAFT CONVERSION, round 3 ("fix all" item A, 2026-10-28).
This run lands or holds the conversion that tackle-armor (2026-10-27) and
tackle-armor-r2 (2026-10-28, HELD/NO-GO: B1 5/8, B3 4/8; 38 attempts / 20
crafts) proved at mechanism level but could not land on breadth. A miss is
NO-GO, never re-scored mid-run. Metric doubts go under "metric review" in
the results file and apply to the NEXT run only.

Worktree: ~/workspace/worktrees/fixall-armor, branch fixall-armor.
Base commit (worktree HEAD at pre-reg): 3a5c49f491ebd69f8147d1e3720ba92f2af107d1
(master at coordinator check 2026-10-28 ~17:53 CDT; main tree clean).
Pre-reg + instruments are committed BEFORE any judged sweep and BEFORE any
game change in this run. A scratch diagnostic (hidden_files/fixall-armor/,
NOT a judged sweep) ran before this pre-reg to identify the exact levers;
its findings are summarized below and do not change the bars after the band.

## Plain-words picture

Villagers already know how to sew armor in the game's code. In live play it
never happened, for two stacked reasons r2 fixed but never landed: the
sewing beat was switched off by a flag no browser game can set, and the
shared pile never held bark, vine or hide. R2 proved that fix works (0 → 38
attempts, 0 → 20 crafts) but held it: sewing happened on only 5 of 8
villages, a finished piece on only 4 of 8.

## Diagnosis (scratch diagnostic, seeds 67605 + 67608, r2 code, unjudged)

Both faces of the gap were traced day by day (stash ledger + craft tele +
daily snapshots). There is NO hidden bark consumer: the stash identity
(delta = ledger gives − ledger takes − craft consumption) holds on every
day modulo a one-day snapshot lag. What actually happened:

1. **67605 — slow random inflow racing knower mortality, not a drain.**
   Vine arrived from day 29, hide from day 35, but the first bark arrived
   day 48. Two starting-gear bark wearers were home on and off until days
   57/65; bark reached 3 only on day 70, five days after the last knower
   died. Bark inflow is a slow random walk (about 0.11 bark events/day at
   the r2 mix on open days); the window [knower home + bark ≥ 3 + vine ≥ 2]
   never opened because the clocks are mismatched, not because anything
   ate the bark. Zero ledger takes, zero craft attempts all run.
2. **67608 — armor-sterile village, a seeding gap, not a conversion gap.**
   181 survived days, final pile bark 36 / vine 32 / hide 16 — and ZERO
   armor anywhere, ever: no starting armor, the bot scholar never crafted
   or carried armor, the armor pile never held a piece, no gear events.
   With no first piece, the wearing-is-knowledge rule can never engage:
   sewing needs wearing, wearing needs a piece, and no path introduces
   the first piece in bot play. (In human play the player can craft and
   gift/deposit armor; the bot does neither, and the pile-draw path that
   would let villagers wear a deposit is itself flag-gated.)
3. **67607 — early collapse (village lost day 51), out of armor's reach.**
   Not a conversion failure; counted in the bars as written, not excused.

## Fix to be tested (after the before-band only)

Three levers, all existing mechanisms, no new system, no rewritten
conversion, no odds/cooldown/knowledge/recipe change, no gate change:

- (a) SALVAGE r2 verbatim: src/js/storage.js open-village contribution
  mix (branch 45 / wood 25 / bark 15 / vine 10 / hide 5) + removal of the
  ARMORVILLAGE gate on `villagerArmorCraftDay()` in src/js/villager-build.js.
- (b) BARK MIX WIDENING (the 67605 lever): bark 15% → 30%, taken from
  branch/wood (branch 45% → 35%, wood 25% → 20%); vine 10% and hide 5%
  UNCHANGED. Total inflow rate, trigger, amount, ledger and RNG draw count
  unchanged; branch+wood still the majority (55%). Rationale: bark is the
  only recipe needing 3 of one material, and trees are the commonest
  outing — the binding material was the rarest-timed arrival. This is a
  supply-mix change, NOT a gate change (no deed, standing, wave, scale or
  readiness-bar threshold moves) and NOT "raise all inflow" (vine/hide
  shares frozen, total rate frozen).
- (c) UNGATE the armory-pile draw (the 67608 lever, live-play seeding):
  remove the ARMORVILLAGE gate on step 3b of `villagerGearDay()` (same
  file), so deposited armor is drawn and worn exactly like the already
  ungated weapons pile. Deposit-is-consent canon (docs/STORAGE.md) already
  blesses this: nothing becomes communal except by deliberate deposit,
  and the weapons pile works this way today. The flag can never be set in
  a browser game, same argument as r2's craft enable. This completes the
  loop: deposit → wear → knower → sew → spares → wear.

Explicitly NOT changed: recipes (bark 3+vine 2, hide 2+vine 1), odds (L1
35% blind, L2+ 85%), cooldown (≤1 attempt / 3 days), knowledge rule
(wearing bark/hide armor), all gating files and thresholds (gating freeze,
Steve 2026-10-27 16:53, still in force; regional finale-omen gate stays),
and no roster-scan extension (perception law, Steve 2026-10-28): the craft
beat reads each home villager's own worn items + the communal pile, and
step 3b touches no new scan — it ungates an existing block of the existing
gear day, which allocates only among villagers at home. The existing
shout-answer helper (villagerFightAllies, party-wiring.js) is NOT touched.

## Band (before and after, identical)

- Seeds: 67601–67608 (the armorvillage / tackle-armor pilot seeds).
- Policy: leadfeast, via AD.armedFor + AV.armedFor (the stack from rounds
  1–2; with no ARMORVILLAGE flag in this run the AV layer is inert
  delegation, so the effective stack is leadfeast + armorydrive).
- Horizon: 180 days, death-aware.
- Env: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0
  KILLDISC=1 ARMORYDRIVE=1 — and deliberately NO ARMORVILLAGE flag in
  either leg. This is the live-play condition. The before leg is expected
  at 0 attempts / 0 crafts (gate off + no inflow); the after leg must
  clear the bars below.
- Script: scripts/measure-fixall-armor.js (tooling, committed with this
  pre-reg; ported from round 2's measure script). Per seed it records,
  via tele wrap + daily policy snapshot: attempts, crafts, craftEvents by
  item, RECIPE-MATCHED coincidenceDays (see below), knowersDays,
  barkWearersDays, hideWearersDays, stashDays (bark/vine/hide/branch/wood),
  survivalDays, deaths with cause tally, and finalWornArmor.
- Output: evidence/2026-10-28/fixall-armor-band-before.json and
  evidence/2026-10-28/fixall-armor-band-after.json (written by the script,
  in-worktree).
- Instrument note (stated before the run, not after):
  scripts/balance-panel.js is NOT the judge for this band, because its
  contract (scripts/balance-metrics.json) contains no NPC armor-craft
  metric — its gear metrics cover the player's gear only, and its policies
  are not the leadfeast armor stack. The ported measure script is the
  instrument for B1–B3; G1 covers harm. Re-running a panel that cannot
  observe the metric would not strengthen the verdict.

## Bars (binding — GO for merge only if ALL hold)

- B1 attempts: attempts > 0 on ≥6/8 seeds after (before expected 0/8).
  Unchanged from r2 — the same bar that failed 5/8.
- B2 recipe-matched coincidence-or-attempt among knower-seeds: among
  after-band seeds with knowersDays > 0, at least all-but-one (and at
  least 4) have (recipe-matched coincidenceDays > 0 OR attempts > 0).
  This is r2's metric-review correction, pre-registered here instead of
  applied retroactively: r2's coincidence counted a day when ANY knower
  was home AND ANY complete recipe was on hand, so a bark-wearer scored
  days on a complete hide recipe it could never sew (seed 67605: 18
  phantom days). The corrected metric is STRICTER: under it r2's B2 would
  have been 5/7 and would ALSO have failed. No bar is loosened anywhere
  in this round.
- B3 crafts: crafts ≥ 1 on ≥5/8 seeds after. Unchanged from r2 — the same
  bar that failed 4/8.
- G1 guardrails: no new death-cause kind in the after band that is absent
  in the before band at >2× share; starvation deaths after ≤2× before
  (band totals). Branch/wood pile days after must not collapse vs before
  (diagnostic: the mix shift must not starve tool materials — branch and
  wood stashDays reported per seed; a collapse to near-zero on most seeds
  fails G1 even if the death bars pass).
- G2 no-substitution: git diff for the game change touches ONLY
  src/js/storage.js (the inflow beat) and the gate lines of
  src/js/villager-build.js (`villagerArmorCraftDay` + step 3b of
  `villagerGearDay`); recipes, odds, cooldown, knowledge, and all gating
  files untouched. The proof test asserts the knowledge gate, the
  cooldown, and the pile draw.
- If any bar fails: HELD/NO-GO, game change reverted zero-trace, evidence
  + instruments kept, exact remaining gap reported. A missed bar is NOT
  a kill (kill discipline): root-cause WHY and confirm the lever itself
  is wrong before killing anything.

## Confirm (only if the pilot band GOes)

- 12 fresh seeds 67701–67712, after-code only, same policy/horizon/env.
- Confirm bars (binding): C1 attempts > 0 on ≥9/12 seeds; C2 crafts ≥ 1
  on ≥8/12 seeds; C3 guardrail: no death-cause kind absent in the pilot
  before-band accounting for >10% of confirm deaths, and starvation share
  ≤2× the pilot before-band starvation share.
- Land only if pilot GO + confirm GO. Pilot GO + confirm fail = HELD with
  the confirm gap named.

## Diagnostics (reported, not judged)

- D1 geared outcome: finalWornArmor after vs before, and crafted pieces
  ending up worn (proof test asserts the spares-flow path at unit level).
- D2 hide channel: hide craft events in the band.
- D3 branch/wood pile days after vs before (mix-shift safety, feeds G1).

## Sense test (SENSE-TESTING LAW)

The results file quotes at least two captured say-lines (a stash-
contribution line for a craft material, and a craft success/failure line
if any fire) and reads them for meaning, coherence, and relevance — not
just counts.

## Proof test (before/after, browser-like: NO env flag)

scripts/test-fixall-armor.js, run with NO ARMORVILLAGE set:
- E1 inflow mix: open-village contributions bring bark, vine AND hide,
  branch+wood still the majority (fails before the inflow fix).
- E2 knowledge gate + cooldown: non-wearer never attempts even with
  materials on hand; knower does not attempt twice within 3 days.
- E3 craft fires without the flag: a knower with a complete recipe
  attempts (tele fires / cooldown set) with no flag set (fails before
  the enable — the function returns 0).
- E4 spares flow gears another villager: a crafted piece in a knower's
  spares moves to an unarmored villager on the next villagerGearDay and
  that villager wears it.
- E5 hide knower: a villager wearing hide_armor with hide+vine on hand
  attempts a hide craft (no flag).
- E6 pile draw without the flag (round 3): a bark_armor deposited in the
  stash armor pile is drawn by an unarmored villager on the next
  villagerGearDay and worn (fails before the 3b ungate — the pile sits
  untouched).
On pre-fix code E1, E3 and E6 fail; on post-fix code all pass. The test
itself is committed with this pre-reg, before the game change.

## Metric review (NEXT run only — not applied here)

- None carried forward except the population question r2 deferred and this
  round deliberately does NOT take: whether bars should judge knower-seeds
  only. This round keeps all-seed bars (B1/B3 as written) so a pass cannot
  be read as redefinition; if this round fails only on the armor-sterile
  / early-collapse seeds, that decision belongs to the next round's
  pre-reg, with this round's opportunity-day data as its evidence.
