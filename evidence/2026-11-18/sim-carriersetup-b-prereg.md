# sim-carriersetup-b — PREREG (frozen BEFORE any new sim)

**Arm:** sim-carriersetup-b · **Loop B run:** fleshout-loop-b-20261119T0130Z
**Axis:** winnability-chain · **Finding:** #2568 (fieldcarrier-confirm-a §5/§9
— the Rage setup turn kills)
**Frozen:** 2026-11-18 ~20:00 CST, before any new sim. **Branch:**
`sim-carriersetup-b` (worktree `~/workspace/worktrees/sim-carriersetup-b`,
base master at `48c81dac6`).
**Builds on:** `evidence/2026-11-18/sim-fieldcarrier-confirm-a.md` +
`evidence/2026-11-18/sim-fieldcarrier-confirm-a-prereg.md` (pilot NO-GO
THIN-POOL: carrier fires 6× in the judged population, first carrier kill
906 dmg / 11 rounds, but pool 7 < 10, kill share 0.143 < 0.25, community
loss 4/8 vs 2/8) and finding #2568's own next arm: test surviving the
setup, not a bigger multiplier.

## What this arm builds (frozen design)

Finding #2568: the field-engine Rage carrier fires, but the fighter spends
round 1 going red instead of striking — the Rage branch sets
`nextMult = 2; nextN = 3` and returns `consumed = true` WITHOUT striking.
On the three paired fired meetings in the confirm: two deaths where the
control leg fled (Carlos d63, Theo d62) and one improved flee (Liam d49);
plus Dmitri d45 fired at 14 HP, dead round 1, 0 dealt. The gate is the
monster's HP above 40%, never the holder's — the carrier fires on a dying
holder. This arm tests the finding's two named fixes, as two separate
variants against ONE shared control, on ONE shared fresh band:

- **free (primary variant) — Rage as a free action that strikes the same
  round.** `FIELDCAPDMG=1 + FIELDCAPFREE=1`. When the CARRIER fires, the
  setup no longer costs the fighter their first strike: the Rage branch
  sets nextMult/nextN and returns `consumed = false`, so the caller
  proceeds to the strike block in the same round and `fieldStrike`
  consumes one doubled strike immediately (nextN 3 → 2). Total doubled
  strikes stay 3 — they start a round earlier, they are not a fourth.
  Carrier-only: a holder with REAL Rage keeps the live consumed setup
  turn (the live ability is untouched; changing it is a separate design
  call). Recorded on the fight record as `carrierRageFreeFired`.
- **floor (secondary variant) — an HP/armor floor on firing.**
  `FIELDCAPDMG=1 + FIELDCAPFLOOR=1`. The carrier does not fire when the
  holder is too hurt or too thinly armored to survive the setup round:
  holder HP ≥ 50% of max (live `c.vHp / c.vHpMax` at the fire moment)
  AND worn armor P ≥ 10. The armor bar is the wave-4 readiness demand
  from `docs/MONSTER-WAVES.md` (armored: fighters at P ≥ 10); the HP
  bar is the one-hit test — at ≥50% of ~70 max HP a wave-4 hit
  (20–30/round) leaves the holder alive, below it a single hit can kill
  (Dmitri fired at 14 HP). A floor-blocked carrier is recorded
  (`carrierFloorBlocked`, reason `hp` or `armor`), never paid for (the
  60-kcal Rage pay is refused before the check), and the fighter strikes
  instead that round. Carrier-only, same scope as free. The floor is
  checked every round the branch would otherwise fire, so a holder hurt
  mid-fight below 50% will not fire in a later round either.

**Held chain (cherry-picked onto this branch, verified by diff, not hash
alone):** substrate `bc0f001e8` → `12051fed5` (sense fix, HELD, do not
land); carrier `568814f4b` → `403cf6b63` (`[needs-eyes]` kept); tooling
`ba18f1867` → `d221942c2`; confirm adaptation `9dd183c4b` → `a3fc095be`.
Diffs vs the original commits: substrate 0 lines, tooling 0 lines,
carrier src-only 0 lines (the 26-line test-file delta is exactly the
9dd183c4b determinism fix). The substrate and the carrier are HELD —
never to land from this arm; landing is the coordinator's call after
the verdict.

**Substrate all legs:** `VETREENGAGE=1 + FLEEREPAIR2=1 + FIGHTALLY2=1 +
LAUNCHPARTY=1` (same as the confirm). **PARTYSIZE4 is NOT set**
(deliberate control choice, same as the confirm). Legs differ ONLY by
env — no code revert between legs. The driver asserts MODE↔flags on
every leg and each corpus file records `fieldcapdmgOn`,
`fieldcapfreeOn`, `fieldcapfloorOn`, `launchpartyOn`, `sensePresent`,
`carrierPresent`, the godpath sha and the carrier presence in
godpath.js / fieldFights.js.

**Legs:** ctl = substrate, `FIELDCAPDMG` unset; free = substrate +
`FIELDCAPDMG=1 + FIELDCAPFREE=1`; floor = substrate +
`FIELDCAPDMG=1 + FIELDCAPFLOOR=1`. `FIELDCAPFREE` and `FIELDCAPFLOOR`
are mutually exclusive (the driver refuses both set).

## Primary metric (BINDING, §14 — confirm bars kept, setup-cost bar added)

**Kill share of engaged wave-4+ expedition meetings where the launched
party (pair-inclusive) fights** — the confirm population, unchanged:
v4encounters row with origin `expedition`, wave ≥ 4, joined to its
v4gates row (same day+vid+mid, first match) with a non-empty planParty,
launched party PRESENT (corrected arrival, piecewise), ENGAGED
(rounds > 0), `|planParty| ≥ 1`. **Kill** = outcome `vKill` only.
**Damage on fired meetings** (mDealt, and mDealt/rounds) is the
supporting mechanism readout for the setup fix — the fix's direct
effect is the strike that was lost.

**GO threshold (per variant leg, vs ctl on identical seeds):** variant
pair-inclusive kill share ≥ 0.25 **AND** ≥ 2× the control
pair-inclusive kill share (if the control kills 0, the ratio bar passes
iff the variant kills > 0) **AND** pool floor met (below) **AND** all
cost bars pass **AND** mechanism check passes **AND** the paired
setup-death bar passes (below). The kill-share bar is the confirm's
bar, kept unchanged so the verdicts are comparable — the setup fix
must move the kill share, not just the damage line.

**Paired setup-death bar (new, binding — the finding's question):**
zero variant-leg deaths on fired meetings whose ctl twin fled (same
seed/day/vid/mid, carrier fired on the variant leg). A paired death
reproduces the Carlos/Theo shape the fix exists to remove — if it
occurs, that variant is NO-GO even if its kill share passes. (A death
could in principle come from another cause, but the paired comparison
isolates the carrier as the only difference between the legs, so a
paired death IS the setup cost reproduced.)

**Pool floor (derived, finding #2566 — from the MEASURED arm-leg rate,
not the control's):** the confirm pilot delivered **7 judged carrier
meetings on 8 seeds with the sense substrate on** (arm pair n = 7; ctl
n = 14). The floor must sit BELOW what the band can deliver, so:
**ctl pair n ≥ 10** (the band's richness, judged on the control leg's
delivery — the confirm ctl delivered 14) **AND each variant leg pair
n ≥ 6** (below the measured arm-leg delivery of 7). If ctl < 10 the
band is thin and the whole pilot is NO-GO THIN-POOL. If a variant leg
delivers < 6, that variant is NO-GO THIN-POOL. The pools are reported
per leg beside each other; no re-scoring.

**Cost bars (binding guardrails, same as the confirm):** community loss
(endReason village-lost / village-dead / pop-zero) variant share ≤ ctl
share + 0.125; starvation variant ≤ ctl + 2 (totals AND villager-only);
median survival variant ≥ 0.8 × ctl median. Instrument errors 0 on all
per-seed files.

**Mechanism checks (gate GO, per variant):**
- free: carrier fires > 0 in the judged population AND free-action
  fires > 0 (`carrierRageFreeFired` true on the encounter row — a
  doubled strike landed in the fire round), AND ctl carrier fires == 0.
- floor: carrier fires > 0 in the judged population AND (floor-blocks
  > 0 in the corpus OR every judged fire is on a holder meeting the
  floor at fight start — HP fraction ≥ 0.5 from `vHpStart/vHpMax`),
  AND ctl carrier fires == 0.

**Verdict ladder (frozen, per variant leg):**
- Pool floor met + kill-share bars met + all cost bars pass +
  mechanism check passes + paired setup-death bar passes → **GO**.
- Pool floor met + kill-share bars missed or any cost bar fails or
  mechanism check fails or paired setup-death occurs → **NO-GO**.
- Pool floor missed (ctl < 10, or that variant < 6) → **NO-GO, thin
  pool, inconclusive** (finding #2566 — no confirm, no re-score).

## Secondary metrics (supporting, not binding)

- Per-outcome decomposition (rounds, damage share mDealt/mHpStart,
  damage/round mDealt/rounds, vTaken, party size, min/mean armorP,
  abilities/member, fighter damage share) by outcome, per leg — the
  ladder: typical ~50/round, winning ~111/round, godhood ~220.
- Carrier-fire table with tier/hunger/floor attribution for EVERY held
  row — fires and non-fires, inside and outside the judged population.
  Floor-blocked non-fires are a first-class attribution class
  (`carrierFloorBlocked` reason), alongside the confirm's evade /
  tier-gate / hunger-gate / neither / undetermined.
- Funnel with **awareness-evades as a first-class funnel loss**
  (finding #2569: 20 of the confirm arm's 34 meetings never started
  on seed 104905) — evades reported in the funnel table per leg.
- Gate × outcome crosstab; monster mix by outcome; wall numbers
  (reported every run): national / table / wins, wave-4 and wave-5
  unlocks, median survival, per leg.
- Table: not instrumented by this driver — reported as null, never
  faked.

## What this pilot does NOT judge

- No bigger multiplier (finding #2568 rules it out: test surviving
  the setup, not a bigger multiplier). `nextMult` stays 2, `nextN`
  stays 3 on both variants.
- No sense/gate tweak. No win-plan.js change, no wild-avoid change.
- The 4th seat (engine-blocked: `fieldFights.js` slices allyVids to
  2) — out of scope.
- How villagers EARN Rage permanently — out of scope.
- The TB carrier (`game.js`) — untouched, not re-measured here.
- The rounds=0 "vKill" rows (excluded by the engaged filter) and the
  encounter-log ~20-line cap (parsed strike totals understate long
  fights; all damage-rate claims use mDealt/rounds).

## Horizon, seeds, policies

- **Horizon:** 150d, death-aware (same as the confirm, for
  comparability). Dead villages stop simulating (+10d tail max).
- **Seeds (pilot band): 104931, 104932, 104933, 104934, 104935,
  104936, 104937, 104938 — FRESH 8-seed pilot band.** Freshness check
  (skill local_seed_band_freshness): searched ALL dated preregs
  (`evidence/*/sim-*-prereg.md`, 1011 files) per seed — zero hits for
  every seed 104931–104938; no corpus filename under `evidence/`
  carries any of them; no `.md` under the goal `hidden_files/` names
  them (the one raw substring hit in a JSON corpus is inside a longer
  number, not a seed use). Neighbouring used/reserved bands avoided:
  104901–104908 (fieldcarrier-confirm pilot), 104911–104926 (reserved
  for the carrier kill-share confirm — NOT used here), 104720–104727
  (allyslot3-rerun-b), 105001–105008, 105101, 105201–105208,
  105301/105401/105501 (named in partysize4 preregs). No
  forbidden/contaminated band list names this band (contaminated bands
  named in preregs: 9700–9711, 9930–9941, 73601–73608, 74201–74208).
- **Confirm band (only if a variant passes the pilot sniff):
  104941–104956 (16 fresh seeds).** Freshness check: same
  full-prereg search per seed — zero hits for every seed 104941–
  104956. The confirm is a FRESH second band run whole (ctl + the
  passing variant(s)), judged on the same frozen bars; the pilot
  corpus is not carried into the confirm judgement.
- **Policies:** competent verbatim. **Substrate all legs:**
  `VETREENGAGE=1 + FLEEREPAIR2=1 + FIGHTALLY2=1 + LAUNCHPARTY=1`.
  **Ctl = substrate, FIELDCAPDMG unset; free = substrate,
  FIELDCAPDMG=1 + FIELDCAPFREE=1; floor = substrate, FIELDCAPDMG=1 +
  FIELDCAPFLOOR=1.** The legs differ ONLY by env — no code revert
  between legs.
- **Instrument:** `scripts/fieldcarrier-driver-a.js` (adapted for
  this arm: MODE ctl|free|floor, `FIELDCAPFREE`/`FIELDCAPFLOOR`
  assertions + recording, `carrierRageFreeFired` /
  `carrierFloorBlocked` copied onto every encounter row, OUTDIR
  `perseed-carriersetup-b-<mode>`); analyzer
  `scripts/analyze-fieldcarrier-a.js` (judge extended: per-variant
  verdicts on the frozen bars above, paired setup-death check,
  floor-blocked attribution class, free-action mechanism check,
  `--selftest`); per-seed JSONs under
  `evidence/2026-11-18/perseed-carriersetup-b-{ctl,free,floor}/`.
  **§15 panel:** `scripts/build-fieldcarrier-panels-a.js` (adapted
  copy of the confirm builder, same schema) + `node
  scripts/balance-panel.js compare`, run twice (ctl-vs-free,
  ctl-vs-floor); both compare `.md` files are attached to the
  evidence file. The panel is the instrument, the frozen bars above
  are the judge.
- **PILOT ONLY, with a confirm gate:** no 16-seed confirm unless a
  variant passes the pilot sniff (pool floor met + kill-share bars
  met + costs pass + mechanism passes + no paired setup-death); then
  the confirm band above and re-judge on the same frozen bars. If no
  variant passes, verdict per variant, report it, do not spend the
  confirm and do not re-score. The coordinator decides.

## Encounter-gear fixture (Steve 2026-11-13)

The verdict turns on whether a launched party FIGHTS as launched and
whether the carrier fires in real fights, so the fixture is the
encounter itself, staged by the competent policy: a geared scholar
fighting with a party, never a fresh un-geared solo scholar. The
pilot's per-seed corpora carry the encounter averages (party size,
gear, abilities) beside the verdict in the evidence file. The nearest
measured point for the encounter gear is the confirm band itself
(launched parties geared by the launch gear-up; the confirm kill's
party: min armor 32, mean armor 35, abilities/member 5.67); the pilot
does not re-derive gear — the competent policy plays it, and the
corpora record what it played.

## Pre-pilot substrate checklist (§14b)

1. **Contact:** launched wave-4 meetings occur on the sense
   substrate — the confirm band delivered 34 arm meetings / 8 seeds
   (28 with the party present). Both legs run the substrate, so
   contact is the meetings on all three legs; the pool is the
   measurement.
2. **Pool sizing:** the floor (ctl ≥ 10, variant ≥ 6) is derived from
   the MEASURED WITH-substrate pools (confirm: ctl 14, arm 7) — see
   derivation above. Per finding #2566, a floor above the measured
   pool would be a pre-registered failure; both floors sit below
   their measured reference.
3. **Mechanism pre-check (frozen, not a sim):** the proof tests
   `scripts/test-fieldcarrier-a.js` (38/38, re-run on the rebased tip
   after the variant build) and the new
   `scripts/test-carriersetup-b.js` — staged launched holder in a REAL
   `Game.fieldFight`: (a) free-action: with `FIELDCAPDMG=1 +
   FIELDCAPFREE=1` the carrier fires in round 1 AND a doubled strike
   lands in the same round (fire-round damage > 0, nextN 3 → 2 after
   the round), and the same staged fight WITHOUT the free flag spends
   round 1 going red with 0 dealt; (b) floor: with `FIELDCAPDMG=1 +
   FIELDCAPFLOOR=1` a holder at 14/70 HP does NOT fire and strikes
   instead (floor-blocked, reason hp), a holder at full HP with armor
   P ≥ 10 DOES fire, and a holder at full HP with armor P < 10 does
   NOT fire (reason armor); (c) both flags off (ctl shape) behaves
   exactly as the confirm carrier (fires, consumed setup turn). The
   analyzer `--selftest` covers the new judge shapes (GO, NO-GO on
   kill share, NO-GO on ratio, NO-GO thin pool, cost-bar failures,
   paired setup-death, floor-blocked attribution, free-action
   mechanism) plus the instrument: driver copies
   `carrierRageFreeFired` / `carrierFloorBlocked` onto the encounter
   row.

## Canon note

`docs/CANON.md` (manifest), `docs/MONSTER-WAVES.md`, and
`docs/SYSTEMS.md` were read for this arm. MONSTER-WAVES.md: wave-4
bands are damage 35–95, HP 850–1500 — "a 4–6 round fight for a
godhood build (~220 dmg/round)"; the wave-4 readiness demand is armor
P ≥ 10 (this arm's floor borrows that bar, it does not change it).
Rage: `src/data/abilities.json` — Berserker Rage, pool `system`,
unlock `system_offer`, "Your next three strikes deal double damage",
cost 60 kcal (`unleash_rage`); field port in `godpath.js`
(`fieldBegin` held map + `fieldAct` Rage branch sets `nextMult = 2;
nextN = 3`, paid via `fieldPay`; `fieldStrike` consumes it). CANON.md
standing rule: abilities come ONLY from the System (offers, trials,
milestones) into the 6 slots — never taught, never bought. The carrier
grants no ability and touches no grant path; the earn-path design is a
follow-up question, not decided here. The free-action and floor
variants are carrier-only field-engine behaviors — real Rage keeps its
live consumed setup turn — so no live ability changes in this arm.
No canon doc covers the field engine, the sim recorder, or the
villager launch party — said here rather than inventing canon. The
launch mechanics are cited from code (`win-plan.js`,
`villager-agency.js`, `party-wiring.js`, `fieldFights.js`,
`godpath.js`), not from canon.

## Metric review

(To be filled at closeout.)
