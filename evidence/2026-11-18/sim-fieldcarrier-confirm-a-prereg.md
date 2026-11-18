# sim-fieldcarrier-confirm-a — PREREG (frozen BEFORE any new sim)

**Arm:** sim-fieldcarrier-confirm-a · **Loop A run:** fleshout-20261118T2330Z
**Axis:** scale-onramp · **Finding:** #2552 follow-up (fieldcarrier-a pilot NO-GO THIN-POOL)
**Frozen:** 2026-11-18 ~17:35 CST, before any new sim. **Branch:** `sim-fieldcarrier-confirm-a`
(worktree `~/workspace/worktrees/sim-fieldcarrier-confirm-a`, base master at `ac1b82736`).
**Builds on:** `evidence/2026-11-18/sim-fieldcarrier-a.md` +
`evidence/2026-11-18/sim-fieldcarrier-a-prereg.md` (pilot NO-GO THIN-POOL:
carrier fires 6x, 0 kills, judged pair pool n=2 — launched party absent
12/19 meetings WITHOUT the sense substrate; §5 two undetermined non-fires —
food tier tight/starving or hunger blocking the 60-kcal pay; §9 next
question),
`evidence/2026-11-18/sim-fightcap-a.md` (§5 damage race: typical party
~40–60 dmg/round needs ~39 rounds, winning party ~111/round wins in 9–12;
§10 next arm (a) is the damage-multiplier carrier),
`evidence/2026-11-18/sim-fightcap-dmg-a.md` (TB carrier never fired — wrong
engine).

## What this arm re-measures (frozen design)

The carrier itself is already built and HELD on branch `sim-fieldcarrier-a`
— carrier commit `e3a77c411` (`[needs-eyes]`, godpath.js fieldBegin +
fieldAct Rage branch + fieldFights.js record) and tooling commit
`bceb0e433` (driver + analyzer + panel builder). This arm cherry-picks
both onto its branch as lever + instruments (keeping the `[needs-eyes]`
marker; conflicts resolved in the worktree, proof test re-run).

**CRITICAL — the pilot proved re-running WITHOUT the sense substrate
re-measures the same empty pool, so BOTH legs run the held
launchparty-sense substrate as measurement substrate only:** commit
`480168a58` ("SUBSTRATE (HELD, do not land): sense fix from
sim-launchparty-sense-a `d01eaf0a5`") / branch `sim-launchparty-sense-a`
tip `d01eaf0a5`, with `LAUNCHPARTY=1` on both legs. **NEVER land the
substrate or the carrier — this arm is a measurement; landing is the
coordinator's call after the verdict.** Legs differ ONLY by
`FIELDCAPDMG` (ctl 0 / arm 1).

**Substrate both legs:** `VETREENGAGE=1 + FLEEREPAIR2=1 + FIGHTALLY2=1 +
LAUNCHPARTY=1` (all read by code in this tree: `VETREENGAGE` in game.js /
villager-brain.js / win-plan.js; `FLEEREPAIR2` in win-plan.js;
`FIGHTALLY2` in fieldFights.js / party-wiring.js; `LAUNCHPARTY` in the
substrate's party-wiring.js block). **PARTYSIZE4 is NOT set** (keep the
2030Z partysize4 decision out of this measurement — note: unlike the
fieldcarrier-a prereg's claim, `src/js/villager-brain.js:258` DOES read
`PARTYSIZE4` now, partysize4-b having landed since; leaving it unset is
the deliberate control choice, not a vacuous flag).

**Master drift since the fieldcarrier-a pilot:** master gained
foodgate-instr (`a519253b9`, finding #2557-A — tier/hunger instrumentation
on the fight record, no behavior change), fleerepair3-b (`0b8312f20`,
`FLEEREPAIR3` flag, unset here), fightallycap-b (`dded39f58`,
`FIGHTALLY2`, set here). Both legs share current master, so drift is not
a leg confound; the pilot's numbers were measured on older master and are
not carried over — this confirm re-measures from scratch.

## Instrument addition (required by fieldcarrier-a §5/§9)

Record food tier and holder hunger on every encounter row so a non-fire
is attributable to the tier gate, the hunger gate, or neither. The
landed foodgate instrument (`a519253b9`) already puts these on the fight
record (`rec.foodTier`, `rec.hungerStart`, `rec.foodgateTierBlocked` /
`Round` / `Count`, `rec.foodgatePayBlockedRage`,
`rec.foodgatePayBlockedFirst` with hunger) — this arm's driver change is
to COPY those record fields onto the encounter row (the bceb0e433 driver
predates the instrument and copies none of them), and the analyzer change
is to tabulate the attribution. A non-fire with no tier/hunger recorded
is **undetermined** and must be reported as such.

**Attribution rules (frozen):** for every held-but-unfired row
(`carrierRageHeld` true, `carrierRageFired` false) in the judged
population, and for every held-but-unfired engaged row outside it:
- **tier-gate** iff `foodgateTierBlocked` is non-null (fieldAct returned
  before any verb on the tier gate; record the kind + blocked-round
  count). Caveat recorded with the table: the `tight` gate lifts when
  the pack grows or HP falls, so a tier-blocked fight may still have
  had later rounds — the count, not just the flag, is reported.
- **hunger-gate** iff `foodgatePayBlockedRage` is true (the Rage pay was
  refused for hunger — on a carrier row, with no real Rage held, that
  refusal IS the carrier's pay; record `payBlockedFirst.hunger`).
- **neither** iff held, engaged (rounds > 0), fired false, no tier block,
  no pay block — the carrier had its chance and fieldAct chose another
  verb (trick displacement, HP ≤ 40%, already used). Recorded as
  "neither gate; verb choice / HP / trick".
- **undetermined** iff `foodTier` or `hungerStart` is null on the row
  (instrument gap — reported as such, never silently attributed).

## Primary metric (BINDING, §14 — reused frozen bars, new derived floor)

**Kill share of engaged wave-4+ expedition meetings where the launched
party (pair-inclusive) fights** — the fieldcarrier-a population:
v4encounters row with origin `expedition`, wave ≥ 4, joined to its
v4gates row (same day+vid+mid, first match) with a non-empty planParty,
launched party PRESENT (corrected arrival, piecewise), ENGAGED
(rounds > 0), `|planParty| ≥ 1`. **Kill** = outcome `vKill` only.

**GO threshold:** arm pair-inclusive kill share ≥ 0.25 **AND** ≥ 2× the
control pair-inclusive kill share on identical seeds (if the control
kills 0, the ratio bar passes iff the arm kills > 0) **AND** pool floor
arm pair-inclusive n ≥ 10 (derived below) **AND** all cost bars pass.
**Cost bars (binding guardrails):** community loss (endReason
village-lost / village-dead / pop-zero) arm share ≤ ctl share + 0.125;
starvation arm ≤ ctl + 2 (totals AND villager-only); median survival
arm ≥ 0.8 × ctl median. Instrument errors 0 on all per-seed files.

**Mechanism check (gates GO):** arm carrier fires > 0 AND ctl carrier
fires == 0, inside the judged population (engine-side detection,
finding #2553 — snapshot proxy retired).

**Verdict ladder (frozen):**
- Pool floor met (arm pair n ≥ 10) + kill-share bars met + all cost
  bars pass + mechanism check passes → **GO**.
- Pool floor met + kill-share bars missed or any cost bar fails or
  mechanism check fails → **NO-GO**.
- Pool floor missed (arm pair n < 10) → **NO-GO, thin pool,
  inconclusive** (finding #2566 — a floor above the measured pool is a
  pre-registered failure, not a measurement; no confirm, no re-score).

## Pool-floor derivation (finding #2566 — derived, never set blind)

The floor is derived from the fightcap-a fresh band's measured launch
richness — the launch-rich band WITH the sense substrate — not from the
fieldcarrier-a pilot band (which ran WITHOUT it and is the wrong
population for this arm):

- **fightcap-a fresh band 104501–104508** (substrate + `LAUNCHPARTY=1`
  arm leg, `PARTYSIZE4=1`): **45 launched meetings / 8 seeds**,
  pair-inclusive (size ≥ 2) engaged **n = 22 arm** (ctl n = 4 — ctl had
  `LAUNCHPARTY` off, so the arm leg is the launch-rich reference).
- **fightcap-dmg-a band 104601–104608** (substrate + `LAUNCHPARTY=1`
  both legs): **32 launched meetings / 8 seeds**, pair-inclusive
  engaged **n = 13 / leg**.
- This arm's population is `|planParty| ≥ 1` — a SUPERSET of the
  size-≥2 cut above (solo launches that are present + engaged add in),
  with `LAUNCHPARTY=1` on BOTH legs, so both legs should resemble the
  fightcap-a arm leg. Expected pair-inclusive engaged n per 8 seeds:
  **≥ 13** (the lower of the two measured WITH-substrate bands, on the
  narrower ≥2 cut) and likely ~22.
- **Floor: arm pair n ≥ 10** — below the lower measured bound (13),
  i.e. ~77% of the lower measurement and ~45% of the richer one.
  Haircut for the differences from the derivation bands: `PARTYSIZE4`
  is OFF here (may shrink trio launches; the ≥1 population is a
  superset, so the haircut is covered) and master has drifted since
  both bands. If the pilot still delivers below 10, the ladder yields
  NO-GO THIN-POOL — the floor derivation is recorded here and is not
  re-scored.

## Secondary metrics (supporting, not binding)

- Trio-only kill/win shares (same filters, minPlanParty=2).
- Per-outcome decomposition (rounds, damage share mDealt/mHpStart,
  damage/round mDealt/rounds, vTaken, party size, min/mean armorP,
  abilities/member, fighter damage share) by outcome, per leg — the
  ladder: typical ~50/round, winning ~111/round, godhood ~220.
- Carrier-fire table with tier/hunger attribution for EVERY held row
  (see Instrument above) — fires and non-fires, inside and outside the
  judged population.
- Gate × outcome crosstab.
- Monster mix by outcome; wall numbers (reported every run):
  national / table / wins, wave-4 and wave-5 unlocks, median
  survival, per leg.
- Table: not instrumented by this driver — reported as null, never
  faked.

## What this pilot does NOT judge

- No sense/gate tweak. No win-plan.js change, no wild-avoid change.
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
- **Seeds (pilot band): 104901, 104902, 104903, 104904, 104905,
  104906, 104907, 104908 — FRESH 8-seed pilot band.** Freshness check
  (skill local_seed_band_freshness): searched ALL dated preregs
  (`evidence/*/sim-*-prereg.md`, 1007 files) per seed — zero hits for
  every seed 104901–104908; no corpus filename under `evidence/`
  carries any of them (the single `*1049*` filename hit is
  `evidence/2026-10-28/sim-nighttravel-bank-b-scan-insideevening/
  nighttravel-b-insideevening-s11049.json` — seed 11049, unrelated).
  Neighbouring used bands avoided: 104601–104608 (fightcap-dmg /
  fieldcarrier pilot), 104701–104716 (named as the fieldcarrier-a
  confirm band AND used by wildavoid-seedplan-b confirm corpora —
  reserved twice over, not reused), 104501–104508 (fightcap-a fresh
  band). The `104801` candidate was NOT picked: it is named in
  `sim-partysize4-b-prereg.md` / `sim-partysize4-rerun-b-prereg.md`
  ("105301 / 104701 / 104801 / 105401 / 105501 were also clear but
  105201 was picked first") — the rerun-b prereg treats that naming
  as an explicit non-use declaration, but this arm avoids the
  ambiguity entirely by using the zero-hit 104901 band instead. No
  forbidden/contaminated band list names this band (contaminated
  bands named in preregs: 9700–9711, 9930–9941, 73601–73608,
  74201–74208).
- **Confirm band (only if the pilot passes the sniff test):
  104911–104926 (16 fresh seeds).** Freshness check: same full-prereg
  search per seed — zero hits for every seed 104911–104926. The
  confirm is a FRESH second band run whole, both legs, judged on the
  same frozen bars; the pilot corpus is not carried into the confirm
  judgement.
- **Policies:** competent verbatim. **Substrate both legs:**
  `VETREENGAGE=1 + FLEEREPAIR2=1 + FIGHTALLY2=1 + LAUNCHPARTY=1`.
  **Ctl = substrate, FIELDCAPDMG unset; arm = substrate,
  FIELDCAPDMG=1.** The legs differ ONLY by env — no code revert
  between legs. The driver asserts MODE↔FIELDCAPDMG and
  `LAUNCHPARTY=1` on both legs, and each corpus file records
  `fieldcapdmgOn`, `launchpartyOn`, `sensePresent`, `carrierPresent`,
  the godpath sha and the carrier presence in godpath.js /
  fieldFights.js.
- **Instrument:** `scripts/fieldcarrier-driver-a.js` (adapted from
  bceb0e433 for this arm: `LAUNCHPARTY=1` assertions on both legs,
  `sensePresent` recorded, foodgate field copies onto every encounter
  row — see Instrument above); analyzer
  `scripts/analyze-fieldcarrier-a.js` (reuses `legStats` from
  `analyze-fightcap-a.js`, new judge for the frozen bars above,
  engine-side carrier-fire detection, carrier-fire attribution table,
  `--selftest`); per-seed JSONs under
  `evidence/2026-11-18/perseed-fieldcarrier-confirm-a-{ctl,arm}/`.
  **§15 panel:** `scripts/build-fieldcarrier-panels-a.js` (adapted
  copy of the fightcap panel builder, same schema) + `node
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
   from the WITH-substrate measured pools (22 and 13, narrower cut)
   — see derivation above. Per finding #2566, a floor above the
   measured pool would be a pre-registered failure; this floor sits
   below the lower measurement.
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
   record. Re-run on the rebased tip: must be **38/38**. The
   analyzer `--selftest` covers the new judge shapes (GO, NO-GO on
   kill share, NO-GO on ratio, NO-GO thin pool, cost-bar failures,
   engine-side carrier-fire detection incl. the real-Rage
   non-count) PLUS the new instrument tests: driver copies foodTier /
   hungerStart / foodgate flags onto the encounter row (tier-gate,
   hunger-gate, neither, undetermined cases), and the analyzer
   attribution table classifies each correctly.

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
here. No canon doc covers the field engine, the sim recorder, or
the villager launch party — said here rather than inventing canon.
The launch mechanics are cited from code (`win-plan.js`,
`villager-agency.js`, `party-wiring.js`, `fieldFights.js`,
`godpath.js`), not from canon. The foodgate instrument is landed
code (finding #2557-A), not canon.

## Metric review

(To be filled at closeout.)
