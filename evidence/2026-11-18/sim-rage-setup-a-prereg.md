# sim-rage-setup-a — PREREG (frozen BEFORE any new sim)

**Arm:** sim-rage-setup-a · **Loop A run:** fleshout-20261119T0115Z
**Axis:** scale-onramp · **Finding:** #2568 (setup-turn survival — the
follow-up to sim-fieldcarrier-confirm-a, finding #2552)
**Frozen:** 2026-11-18 ~19:45 CST, before any new sim. **Branch:**
`sim-rage-setup-a` (worktree `~/workspace/worktrees/sim-rage-setup-a`,
base master at `be0b90b41` — local master HEAD; journey-scale r243
landed locally, pending ship; origin/master `046ae5859` is behind it).
**Builds on:** `evidence/2026-11-18/sim-fieldcarrier-confirm-a.md` +
`evidence/2026-11-18/sim-fieldcarrier-confirm-a-prereg.md` (pilot NO-GO
THIN-POOL: carrier fires 6× in the judged population, first carrier
kill, pool 7 < 10, community loss 4/8 vs 2/8) and
`evidence/2026-11-18/sim-fieldcarrier-a.md` (pilot NO-GO THIN-POOL).

## The question (finding #2568)

The Rage branch sets `nextMult = 2; nextN = 3` and returns
`consumed = true` WITHOUT striking — the fighter spends round one
going red instead of striking, and the carrier fires on a dying holder
(the gate is the monster's HP above 40%, never the holder's). On three
paired fired meetings: two deaths where the control leg fled (Carlos
d63: 494 → 103 dealt, fled → died; Theo d62: 193 → 149, fled → died)
and one improved flee (Liam d49: +78 damage, still fled); plus Dmitri
d45 fired at 14 HP, dead round 1, 0 dealt. **NEXT ARM (frozen
direction from #2568): test SURVIVING the setup — an HP/armor floor
on firing, OR Rage as a free action that strikes the same round — NOT
a bigger multiplier. Pick ONE shape.**

## Shape picked: Rage as a free action that strikes the same round

**The change (env-gated `RAGEFREE=1`, off = old behavior exactly):**
in `godpath.js` `fieldAct`'s Rage branch, after setting
`nextMult = 2; nextN = 3` and paying the honest 60 kcal, return
`out.consumed = false` instead of `consumed = true` — so the caller
(`fieldFights.js`) runs its normal strike in the same round, and
`fieldStrike` consumes the first of the 3 doubled strikes on that
round. The multiplier stays ×2 for 3 strikes (no bigger multiplier —
out of scope per #2568); the 60-kcal pay stays; the monster-HP-above-
40% gate stays; the once-per-fight use stays. The change applies to
the shared Rage branch (carrier fires AND real-Rage holders alike —
Rage is Rage; the card text in `src/data/abilities.json` says "Your
next three strikes deal double damage" and says nothing about losing
a turn; the setup turn is engine behavior, not canon). The TB carrier
(`game.js`) is untouched.

**Why this shape and not the HP/armor floor:** the measured mechanism
is the lost turn, not the gate. Carlos and Theo died on rounds 3–4,
not round 1 — a holder-HP floor would need a threshold nobody has
measured (their HP at fire is unknown), and a floor that blocks
firing on hurt holders blocks the carrier exactly when the fight is
hardest. The free action removes the measured cost directly, with no
threshold to tune: the Rage round strikes, the doubled strikes start
a round earlier, and a fighter who would have died before the third
doubled strike now lands one on the round they rage. If the setup
turn is the cost, removing it should convert the paired deaths back
toward flees/kills and raise the kill share; if the deaths persist,
the setup turn was not the binding cost — that is what this arm
measures. The HP/armor floor remains the untested other shape for a
future arm, judged against this arm's result.

## Legs (both run the carrier — the legs differ ONLY by RAGEFREE)

- **ctl:** substrate + `FIELDCAPDMG=1`, `RAGEFREE` unset — the
  consuming carrier, i.e. the fieldcarrier-confirm-a arm behavior,
  re-measured on this band. The carrier fires; the setup turn is lost.
- **arm:** substrate + `FIELDCAPDMG=1` + `RAGEFREE=1` — the free-action
  carrier. The carrier fires; the Rage round strikes (first doubled
  strike).

**Substrate, BOTH legs:** `VETREENGAGE=1 + PARTYSIZE4=1 + FLEEREPAIR2=1
+ FIGHTALLY2=1 + WILDAVOID=1 + LAUNCHPARTY=1` (competent policy, 150d
death-aware). The held launchparty-sense substrate is cherry-picked
as measurement substrate only (`480168a58` → `d0c2ed7e4`), NEVER to
land — same as confirm-a. The carrier is cherry-picked as the lever
under test (`e3a77c411` → `9f8f108a4`); tooling from `bceb0e433` →
`0757a9c29`; confirm-a adaptation `9dd183c4b` → `20f4b316e`.

**Flag liveness VERIFIED on current master (`be0b90b41`, before any
sim):** `VETREENGAGE` live (game.js / villager-brain.js / win-plan.js);
`PARTYSIZE4` live (villager-brain.js:258, win-plan.js:286 — landed
since confirm-a, so it is set here rather than held out);
`FLEEREPAIR2` live (win-plan.js); `FIGHTALLY2` live
(fieldFights.js); `WILDAVOID` live (game.js, win-plan.js);
`LAUNCHPARTY` NOT on master — held substrate cherry-pick (above);
`FIELDCAPDMG` NOT on master — held carrier cherry-pick (above);
`WILDSEEDPLAN` INERT on master — no `src/js` or `scripts` file in
this tree reads it (the code lives on held branch
`sim-partyform-fix-a`); it is NOT set on either leg, and the legs
are recorded honestly as running without it. `PARTYFORMFIX`
likewise not present on master. The driver asserts the live flags and
records `rageFreeOn` per corpus file; a leg/flag mismatch is a loud
stop, never a silent mislabel.

## Primary metric (BINDING, §14 — same judged population as confirm-a)

**Kill share of engaged wave-4+ expedition meetings where the launched
party (pair-inclusive) fights** — v4encounters row with origin
`expedition`, wave ≥ 4, joined to its v4gates row (same day+vid+mid,
first match) with a non-empty planParty, launched party PRESENT
(corrected arrival, piecewise), ENGAGED (rounds > 0),
`|planParty| ≥ 1`. **Kill** = outcome `vKill` only.

**GO threshold:** arm pair-inclusive kill share ≥ 0.25 **AND** ≥ 2×
the control pair-inclusive kill share on identical seeds (if the
control kills 0, the ratio bar passes iff the arm kills > 0) **AND**
pool floor arm pair n ≥ 10 (derived below) **AND** all cost bars pass
**AND** the mechanism check passes.
**Cost bars (binding guardrails):** community loss (endReason
village-lost / village-dead / pop-zero) arm share ≤ ctl share + 0.125;
starvation arm ≤ ctl + 2 (totals AND villager-only); median survival
arm ≥ 0.8 × ctl median. Instrument errors 0 on all per-seed files.

**Mechanism check (gates GO):**
(a) the carrier fires > 0 on BOTH legs inside the judged population
(the change must not break firing — ctl fires prove the carrier,
arm fires prove it still fires free);
(b) unit proof: with `RAGEFREE=1`, `fieldAct` returns
`consumed = false` on the Rage round AND the same-round strike via
`fieldStrike` is doubled (first of the 3); with `RAGEFREE` unset,
`consumed = true` as before — proof test §1h / §1g;
(c) sim-level paired check: on paired fired meetings (same
seed/day/vid/mid on both legs, carrier fired on both), arm damage
PER ROUND (mDealt/rounds) ≥ ctl damage per round on ≥ 2/3 of pairs
— the free strike raises the rate even when the fight ends a round
earlier (see Correction 1). If fewer than 2 paired fired meetings
exist, (c) is reported UNMEASURED and does not gate GO (the unit
proof (b) carries the mechanism); if ≥ 2 pairs exist, (c) gates.

**Verdict ladder (frozen):**
- Pool floor met (arm pair n ≥ 10) + kill-share bars met + all cost
  bars pass + mechanism check passes → **GO**.
- Pool floor met + kill-share bars missed or any cost bar fails or
  mechanism check fails → **NO-GO**.
- Pool floor missed (arm pair n < 10) → **NO-GO, thin pool,
  inconclusive** (finding #2566 — a floor above the measured pool is a
  pre-registered failure, not a measurement; no confirm, no re-score).

## Pool-floor derivation (finding #2566 — derived, never set blind)

Measured WITH-substrate pair-inclusive engaged pools (narrower ≥2
cut unless noted):
- **fightcap-a fresh band 104501–104508** (substrate +
  `LAUNCHPARTY=1` arm leg, `PARTYSIZE4=1`): pair-inclusive engaged
  **n = 22 arm**.
- **fightcap-dmg-a band 104601–104608** (substrate +
  `LAUNCHPARTY=1` both legs): pair-inclusive engaged **n = 13 / leg**.
- **fieldcarrier-confirm-a band 104901–104908** (substrate +
  `LAUNCHPARTY=1` both legs, `PARTYSIZE4` OFF, `WILDAVOID` OFF):
  pair-inclusive engaged **ctl n = 14, arm n = 7** — the arm leg
  halved its own pool through trajectory divergence (confirm-a §7).
- This arm's population is `|planParty| ≥ 1` — a SUPERSET of the
  ≥2 cut above, with `PARTYSIZE4=1` (the fightcap-a arm reached 22
  with it) and `WILDAVOID=1` (avoid-outmatched may thin the pool
  via evades — evades are counted as a first-class funnel loss,
  finding #2569, and reported in the funnel table).
- **Floor: arm pair n ≥ 10** — below the lower measured bound (13),
  i.e. ~77% of the lower measurement, with a haircut for WILDAVOID
  evade pressure and for arm-side divergence (the confirm-a arm
  delivered 7). If the pilot still delivers below 10, the ladder
  yields NO-GO THIN-POOL — the floor derivation is recorded here
  and is not re-scored.

## Secondary metrics (supporting, not binding)

- Trio-only kill/win shares (same filters, minPlanParty=2).
- Per-outcome decomposition (rounds, damage share mDealt/mHpStart,
  damage/round mDealt/rounds, vTaken, party size, min/mean armorP,
  abilities/member, fighter damage share) by outcome, per leg.
- Carrier-fire table with tier/hunger attribution for EVERY held row
  (the confirm-a instrument, unchanged) — fires and non-fires, inside
  and outside the judged population.
- **Paired fired-meeting table** (same seed/day/vid/mid, carrier
  fired on both legs): outcome, rounds, mDealt, holder HP at fire
  where the transcript shows it — the Carlos/Theo/Dmitri shapes are
  the question: do the paired deaths convert to flees/kills?
- Gate × outcome crosstab; monster mix by outcome; wall numbers
  (reported every run): national / table / wins, wave-4 and wave-5
  unlocks, median survival, per leg. Table: not instrumented by this
  driver — reported as null, never faked.
- Evade funnel: evades (rounds 0) counted as a first-class loss at
  every funnel step, per seed (finding #2569).

## What this pilot does NOT judge

- No bigger multiplier (out of scope, frozen direction #2568).
- No HP/armor floor on firing (the other frozen shape — a future arm
  may test it against this arm's result).
- No sense/gate tweak. No win-plan.js change, no wild-avoid change
  beyond the `WILDAVOID=1` substrate flag (live on master).
- The 4th seat (engine-blocked: `fieldFights.js` slices allyVids to
  2) — out of scope.
- How villagers EARN Rage permanently — out of scope.
- The TB carrier (`game.js`) — untouched, not re-measured here.
- The rounds=0 "vKill" rows (excluded by the engaged filter) and the
  encounter-log ~20-line cap (parsed strike totals understate long
  fights; all damage-rate claims use mDealt/rounds).

## Horizon, seeds, policies

- **Horizon:** 150d, death-aware (same as the fightcap/dmg/carrier
  bands, for comparability). Dead villages stop simulating (+10d tail
  max).
- **Seeds (pilot band): 106001, 106002, 106003, 106004, 106005,
  106006, 106007, 106008 — FRESH 8-seed pilot band.** Freshness check
  (skill local_seed_band_freshness): searched ALL dated preregs
  (`evidence/*/sim-*-prereg.md`, ~1000 files) per seed — zero hits
  for every seed 106001–106008; zero hits in `evidence/2026-11-18/`
  for the band anchors (106001, 106011). Neighbouring used bands
  avoided: 104901–104908 (fieldcarrier-confirm-a pilot),
  104911–104926 (its named confirm band), 104601–104608
  (fightcap-dmg / fieldcarrier-a pilot), 104701–104716
  (fieldcarrier-a confirm band + wildavoid-seedplan-b confirm
  corpora), 104501–104508 (fightcap-a fresh band), 104431–104438,
  104730–104745. The 104951–104958 candidate was NOT picked: an
  evidence-wide sweep returned 2 unexplained hits for 104951 (the
  files were not identified before the sweep was killed for cost);
  the band is avoided rather than cleared. The 105001–105008
  candidate was NOT picked: named in sim-partyquads-b /
  sim-partysize4-b preregs (2 hits for 105001, 1 each for 105002–
  105008). No forbidden/contaminated band list names this band
  (contaminated bands named in preregs: 9700–9711, 9930–9941,
  73601–73608, 74201–74208).
- **Confirm band (only if the pilot passes the sniff test):
  106011–106026 (16 fresh seeds).** Freshness check: same full-prereg
  search per seed — zero hits for every seed 106011–106026. The
  confirm is a FRESH second band run whole, both legs, judged on the
  same frozen bars; the pilot corpus is not carried into the confirm
  judgement.
- **Policies:** competent verbatim. **Substrate both legs:**
  `VETREENGAGE=1 + PARTYSIZE4=1 + FLEEREPAIR2=1 + FIGHTALLY2=1 +
  WILDAVOID=1 + LAUNCHPARTY=1`. **Ctl = substrate, FIELDCAPDMG=1,
  RAGEFREE unset; arm = substrate, FIELDCAPDMG=1, RAGEFREE=1.** The
  legs differ ONLY by RAGEFREE — no code revert between legs. The
  driver asserts MODE↔RAGEFREE and `LAUNCHPARTY=1` + the sense
  substrate on both legs, and each corpus file records
  `fieldcapdmgOn`, `rageFreeOn`, `launchpartyOn`, `sensePresent`,
  `carrierPresent`, the godpath sha and the carrier presence in
  godpath.js / fieldFights.js.
- **Instrument:** `scripts/fieldcarrier-driver-a.js` (adapted for
  this arm: MODE↔RAGEFREE mapping, `PARTYSIZE4=1` + `WILDAVOID=1`
  required, `rageFreeOn` recorded, `WILDSEEDPLAN` explicitly NOT
  set with the inertness recorded); analyzer
  `scripts/analyze-fieldcarrier-a.js` (judge adapted: mechanism
  check is carrier-fires-on-both-legs + paired-damage check, NOT
  ctl-zero; the old ctl-zero bar is retired — both legs run the
  carrier by design); per-seed JSONs under
  `evidence/2026-11-18/perseed-rage-setup-a-{ctl,arm}/`.
  **§15 panel:** `scripts/build-rage-setup-panels-a.js` (adapted copy
  of the fieldcarrier panel builder, same schema) + `node
  scripts/balance-panel.js compare`; the compare `.md` is attached
  to the evidence file. The panel is the instrument, the frozen bars
  above are the judge.
- **PILOT ONLY, with a confirm gate:** no 16-seed confirm unless the
  pilot passes the sniff test (pool floor met + kill-share bars met);
  then the confirm band above and re-judge on the same frozen bars.
  If the pilot pool still misses, verdict NO-GO THIN-POOL, report it,
  do not spend the confirm and do not re-score. The coordinator
  decides.

## Encounter-gear fixture (Steve 2026-11-13)

The verdict turns on whether a launched party FIGHTS as launched and
whether the carrier fires in real fights, so the fixture is the
encounter itself, staged by the competent policy: a geared scholar
fighting with a party, never a fresh un-geared solo scholar. The
pilot's per-seed corpora carry the encounter averages (party size,
gear, abilities) beside the verdict in the evidence file. The nearest
measured point for the encounter gear is the fightcap-a band itself
(launched parties geared by the launch gear-up, min armorP 17.7–37
on losses); the pilot does not re-derive gear — the competent policy
plays it, and the corpora record what it played.

## Pre-pilot substrate checklist (§14b)

1. **Contact:** launched wave-4 meetings occur on the sense
   substrate — 45 launched expedition meetings per 8 seeds on the
   fightcap-a fresh band (32 on the dmg band). Both legs run the
   substrate, so contact is the meetings on both legs; the pool is
   the measurement.
2. **Pool sizing:** the pair-inclusive floor (n ≥ 10) is derived
   from the WITH-substrate measured pools (22, 13, 14/7) — see
   derivation above. Per finding #2566, a floor above the measured
   pool would be a pre-registered failure; this floor sits below the
   lower measurement (13).
3. **Mechanism pre-check (frozen, not a sim):** the proof test
   `scripts/test-fieldcarrier-a.js` stages a launched holder (plan +
   expedition + wave-4 monster) in a REAL `Game.fieldFight` and
   asserts the carrier fires WITHOUT the Rage ability (record
   `carrierRageFired` true, Rage line in the log, doubled strikes via
   `fieldStrike`); does not fire when the flag is off, when the
   holder has no plan, when not on expedition, or against a wave-3
   monster; a holder WITH real Rage fires with `carrierRageFired`
   false (the detector distinguishes); the flag-off leg shows zero
   carrier fires (failing control); and a determinism leg runs the
   same staged fight twice under a re-seeded RNG and compares the
   record — **38/38 on the rebased tip before this arm's change**.
   New §1h (this arm): with `RAGEFREE=1` the Rage round returns
   `consumed = false` and the same-round strike is doubled (first of
   the 3); with `RAGEFREE` unset the round stays consumed (§1g
   unchanged); a live staged fight with `RAGEFREE=1` shows the Rage
   round dealing damage and determinism holds under the flag. The
   analyzer `--selftest` covers the new judge shapes (GO, NO-GO on
   kill share, NO-GO on ratio, NO-GO thin pool, cost-bar failures,
   mechanism: carrier fires on BOTH legs, paired-damage check incl.
   the <2-pairs unmeasured case, old ctl-zero bar retired).

## Canon note

`docs/CANON.md` (manifest), `docs/MONSTER-WAVES.md`, and
`docs/SYSTEMS.md` were read for this arm. MONSTER-WAVES.md: wave-4
bands are damage 35–95, HP 850–1500 — "a 4–6 round fight for a
godhood build (~220 dmg/round)". The damage yardstick comes from
that canon band. Rage: `src/data/abilities.json` — Berserker Rage,
pool `system`, unlock `system_offer`, "Your next three strikes deal
double damage", cost 60 kcal (`unleash_rage`); field port in
`godpath.js` (`fieldBegin` held map + `fieldAct` Rage branch sets
`nextMult = 2; nextN = 3`, paid via `fieldPay`; `fieldStrike`
consumes it). CANON.md standing rule: abilities come ONLY from the
System (offers, trials, milestones) into the 6 slots — never taught,
never bought. The carrier grants no ability and touches no grant
path; the earn-path design is a follow-up question, not decided
here. The free-action change touches no grant path either — it
changes what the Rage turn does in the field engine, and the card
text promises doubled strikes, not a lost turn. No canon doc covers
the field engine, the sim recorder, or the villager launch party —
said here rather than inventing canon. The launch mechanics are cited
from code (`win-plan.js`, `villager-agency.js`, `party-wiring.js`,
`fieldFights.js`, `godpath.js`), not from canon.

## Correction 1 — 2026-11-18 ~20:00 CST, BEFORE any sims

Mechanism check (c) redefined from total mDealt to damage PER ROUND
(mDealt/rounds). A same-seed probe (`/tmp/probe-ragefree.js`, scratch)
showed the confound: with `RAGEFREE=1` the staged algorithm fight
dealt 81 total in 4 rounds vs 85 in 5 rounds with the flag off — the
free strike landed (R1 20 at x2.5, lead damage 58 vs 51) but the
fight fled a round earlier, cutting one ally-strike round from the
total. Total mDealt is confounded by fight length; damage per round
(ON 20.25 vs OFF 17.0) is the clean live aggregate. The gating
mechanism proof remains (a) carrier fires on both legs + (b) unit
proof; (c) now compares the rate. No sims had run when this correction
was made; the original (c) text is preserved above in the edit
history of this file's commits.

## Metric review

(To be filled at closeout.)
