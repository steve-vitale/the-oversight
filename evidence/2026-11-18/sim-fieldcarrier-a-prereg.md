# sim-fieldcarrier-a — PREREG (frozen BEFORE any new sim)

**Arm:** sim-fieldcarrier-a · **Loop A run:** fleshout-20261118T1515Z
**Type:** CAPABILITY — port of the damage-multiplier carrier to the
field engine (finding #2552). **Frozen:** 2026-11-18 ~12:13 CST, before
any new sim. **Branch:** `sim-fieldcarrier-a` (worktree
`~/workspace/worktrees/sim-fieldcarrier-a`).
**Builds on:** `evidence/2026-11-18/sim-fightcap-dmg-a.md` and
`evidence/2026-11-18/sim-fightcap-dmg-a-prereg.md` (finding #2544;
the dmg arm's verdict was NO-GO because its carrier lived in the
turn-based board fight (`game.js` `tbVillagerAbility`) and NEVER
FIRED — launched-party meetings resolve in the off-screen field-fight
engine (`fieldFights.js` + godpath field sim); pilot legs
bit-identical, kill share 0/13 on both).

## The carrier (frozen design — field port of the TB carrier)

The TB carrier (commit b9a2a295, `game.js` `tbVillagerAbility` RAGE
block + proof test `scripts/test-fightcap-dmg-a.js` 13/13) is the
MECHANISM REFERENCE: real Rage (3 rounds, double damage, same voice
line, once per fight, gated `FIGHTCAPDMG=1`). It is NOT in this
worktree (the coordinator landed tooling + evidence only; see
Substrate below) and is NOT re-implemented here. This arm ports the
same mechanism to the engine where the fights happen:

- Env-gated `FIELDCAPDMG=1` (NEW flag); off = byte-identical old
  behavior. The TB carrier is untouched (`FIGHTCAPDMG` stays absent
  from this tree — nothing in `game.js` reads it here).
- Hook: `fieldBegin` (`src/js/godpath.js`), called from
  `fieldFights.js:658` (lead) and `~1329` (ally, inside `allyGear` —
  numbers-only, no `fieldAct` runs for allies, so the ally injection
  is inert there). `fieldBegin` takes a 4th argument, the monster
  wave (both call sites have it in scope); a missing/0 wave means the
  carrier never applies (safe default).
- Fires when ALL hold: the villager has no real Rage ability
  (`rage` not in `vAbs` — the marker distinguishes carrier rage from
  real Rage); they hold a launched plan (`state.village.winPlan[vid]`
  with a non-empty `party`); they are currently on an expedition
  (`agencyState().exped[vid]` present — the same staleness guard the
  TB carrier used, so a stale plan never carries); the monster is
  wave ≥ 4 (the passed wave argument).
- Effect is EXACTLY real Rage through the EXISTING `fieldAct` Rage
  branch: the carrier sets `held.rage = true` plus a
  `carrierRage: true` marker on the per-fight state `G`; `fieldAct`
  fires it when its own conditions hold (`!used.rage`, no
  `nextN` pending, monster above 40% HP) and pays the honest 60 kcal
  via `fieldPay` (`unleash_rage`, same as real Rage); `nextMult = 2`,
  `nextN = 3`, same voice line ("eyes go red — the rage takes
  hold. Next 3 strikes hit twice as hard."). The holder only — allies
  keep their own abilities, matching the winning shape.
- It grants NO ability: no slot taken, nothing persisted, nothing
  learned. The flag is fight-scoped and spent per strike like real
  Rage (`fieldStrike` consumes `nextN`). This arm is a PROBE of the
  mechanism (is a damage multiplier the binding link?), not a shipped
  grant path. If GO, the follow-up design question — how villagers
  EARN Rage (System offers on level-up / combat completion) — is a
  separate arm / Steve-call.
- ADJACENCY (deliberate difference from the TB carrier, recorded):
  the TB carrier required the monster adjacent (d ≤ 1) on the board
  grid. Field fights have no grid — the fight itself IS the
  engagement, so there is no adjacency check to port. A field fight
  against a wave-4+ monster is the field equivalent of "adjacent to a
  wave-4+ monster".
- The carrier injection also forces a non-null `fieldBegin` return
  for a holder with no other field abilities (previously `null`, which
  would have skipped `fieldAct` entirely and the carrier with it).
  With `held.rage` set, the early-null return no longer triggers; no
  other field numbers change (`rage` carries no `modifiers` in
  `src/data/abilities.json`, so `strikeMult`/`power`/`dodge`/`armor`
  are untouched).

**Policy-side ruled out (recorded, not assumed):** policies drive the
scholar; launched-party members are NPC villagers, and abilities are
System-granted, never taught (CANON.md standing rule; MEMORY.md:
"granted by the System for leveling up or completing combats — never
taught, never bought"). No policy path reaches launched-party members,
so the carrier is game code, scoped to the field fight files as above.

## Substrate (frozen — read before judging the control leg)

This worktree does NOT contain the sense fix (HELD branch
`sim-launchparty-sense-a`, substrate commit 480168a58) NOR the TB
carrier (b9a2a295): `git merge-base --is-ancestor` is false for both
against this branch tip, and `grep LAUNCHPARTY src/js/` is empty.
The coordinator landed tooling + evidence only, and this arm's task
FORBIDS cherry-picking the sense substrate (never to land). So:

- **Both legs run on current master as-is.** The legs differ ONLY by
  `FIELDCAPDMG` (ctl unset, arm `=1`). The driver asserts this and
  stops otherwise.
- **Substrate env both legs:** `VETREENGAGE=1 + FLEEREPAIR2=1 +
  FIGHTALLY2=1` — all three are read by landed code in this tree
  (verified by grep: `VETREENGAGE` in game.js / villager-brain.js /
  win-plan.js; `FLEEREPAIR2` in win-plan.js; `FIGHTALLY2` in
  fieldFights.js / party-wiring.js).
- **`LAUNCHPARTY` and `PARTYSIZE4` are NOT set on either leg.**
  Grep-verified: no `src/js` file reads `LAUNCHPARTY` in this tree
  (its only reader was the held substrate commit), and no file
  anywhere in `src/` reads `PARTYSIZE4` (it appears only in
  `scripts/*.js` driver comments/assertions — setting it would be a
  vacuous env var). The dmg driver's assertions requiring them are
  NOT carried over; requiring a flag no code reads would be a false
  substrate claim. Control = current master + the three landed
  env-gated fixes above; the ONLY difference between legs is the
  carrier.
- **POOL-FLOOR RISK (pre-registered, not a re-score):** without the
  sense fix, the launched party is present at only ~48% of launched
  meetings (dmg prereg re-judge: corrected arrival 0.48 without the
  fix vs 0.88 with it). The dmg pilot WITH the fix yielded an engaged
  pair-inclusive pool of 13/leg. Without the fix this pilot's pool
  may fall below the frozen floor of 10. If it does, the frozen
  ladder below yields NO-GO THIN-POOL — an inconclusive measurement
  of the field carrier on the un-fixed population, NOT a verdict on
  the multiplier, and NOT a license to add the substrate mid-run.
  The pilot measures the pool as it finds it.

## Primary metric (BINDING, §14)

**Kill share of engaged wave-4+ expedition meetings where the
launched party (pair-inclusive) fights** — the fightcap-a population
with the size floor lowered to |planParty| ≥ 1 (the fightcap metric
review: the trio+ pool floor n≥10 was too strict for an 8-seed pilot;
pre-register the pair-inclusive rate as primary). Same join/presence/
engaged filters as `scripts/analyze-fightcap-a.js` (`legStats` with
`minPlanParty=1`): v4encounters row with origin `expedition`, wave
≥ 4, joined to its v4gates row (same day+vid+mid, first match) with a
non-empty planParty, launched party PRESENT (corrected arrival,
piecewise), ENGAGED (rounds > 0). **Kill** = outcome `vKill` only
(not `mFlee` talk-downs/scare-offs — this arm measures fight
capability, so only kills count). Win share (vKill+mFlee) and the
trio-only kill/win shares are reported beside, never substituted.

**GO threshold:** arm pair-inclusive kill share ≥ 0.25 **AND**
≥ 2× the control pair-inclusive kill share on identical seeds
(if the control kills 0, the ratio bar passes iff the arm kills > 0)
**AND** pool floor arm pair-inclusive n ≥ 10 **AND** all cost bars
pass. **Cost bars (binding guardrails, scalemetric):** community
loss (endReason village-lost / village-dead / pop-zero) arm share ≤
ctl share + 0.125; starvation arm ≤ ctl + 2 (totals AND
villager-only); median survival arm ≥ 0.8 × ctl median. Instrument
errors 0 on all per-seed files.

**Verdict ladder (frozen):**
- Pool floor met (arm pair n ≥ 10) + kill-share bars met + all cost
  bars pass → **GO** (a damage-multiplier carrier in the field engine
  turns launched parties into winners; next arm is the earn-path
  design).
- Pool floor met + kill-share bars missed or any cost bar fails →
  **NO-GO** (the multiplier as staged does not carry the fight; the
  next arm is a different capability shape — e.g. the base strike /
  the full winning shape (strong base + bow + three contributors) —
  NOT a bigger multiplier alone and NOT another TB-engine tweak).
- Pool floor missed (arm pair n < 10) → **NO-GO, thin pool,
  inconclusive** (the pair-inclusive floor is the powered population;
  unlike the fightcap diag run there is no DIAG-GO path here — the
  question is a capability measurement, not a decomposition).

## Secondary metrics (supporting, not binding)

- Trio-only kill/win shares (same filters, minPlanParty=2).
- Per-outcome decomposition (rounds, damage share mDealt/mHpStart,
  damage/round mDealt/rounds, vTaken, party size, min/mean armorP,
  abilities/member, fighter damage share) by outcome, per leg —
  the ladder: typical ~50/round, winning ~111/round, godhood ~220.
- Carrier-fire check (mechanism, finding #2553): the SNAPSHOT PROXY
  IS RETIRED — the dmg analyzer counted 2 "carrier" fires on BOTH
  legs that were real Rage, invisible to the 30-day snapshot
  (`samples.villagers` records `npcAbilities` every 30 days; a Rage
  granted between snapshot and meeting is invisible). Carrier-fire
  detection MUST come from the fight engine itself: when the
  `fieldAct` Rage branch fires with the carrier marker on the
  per-fight state (`G.carrierRage`), it sets
  `G.carrierRageFired = true`; `fieldFights.js` carries that onto
  the fight record (`rec.carrierRageFired`), and the driver copies it
  onto the encounter row (`row.carrierRage`). The analyzer counts
  rows with `carrierRage === true` — no snapshot read, no log-token
  heuristic. The bar is a MECHANISM CHECK, not a verdict bar: arm
  carrier fires > 0 AND ctl carrier fires == 0. 0 carrier fires in
  the arm leg = failed mechanism check, reported as such even if the
  kill share moves (and a kill-share move with 0 fires would be
  unexplained, not a GO). The analyzer `--selftest` proves the
  detector distinguishes carrier fires from baseline Rage (a meeting
  whose log carries the Rage token but whose row has
  `carrierRage !== true` is NOT counted; a row with
  `carrierRage === true` IS counted even when the holder's snapshot
  abilities list `rage` — the engine flag is the authority, the
  snapshot is not consulted).
- Gate × outcome crosstab (unchanged question: does the gate hold
  back losers now that parties can win?).
- Monster mix by outcome; wall numbers (reported every run):
  national / table / wins, wave-4 and wave-5 unlocks, median
  survival, per leg.
- Table: not instrumented by this driver — reported as null, never
  faked.

## What this pilot does NOT judge

- No sense/gate tweak. No win-plan.js change, no wild-avoid change.
- The 4th seat (engine-blocked: `fieldFights.js` slices allyVids to
  2) — out of scope.
- How villagers EARN Rage permanently — out of scope (see above).
- The TB carrier (`game.js`) — untouched, not re-measured here.
- The rounds=0 "vKill" rows (excluded by the engaged filter) and the
  encounter-log ~20-line cap (parsed strike totals understate long
  fights; all damage-rate claims use mDealt/rounds).

## Horizon, seeds, policies

- **Horizon:** 150d, death-aware (same as the fightcap/dmg bands,
  for comparability). Dead villages stop simulating (+10d tail max).
- **Seeds (pilot band): 104601, 104602, 104603, 104604, 104605,
  104606, 104607, 104608 — DELIBERATE MATCHED-BAND REUSE.** This is
  the SAME band as the dmg pilot (and the fightcap fresh band), by
  design: the field carrier is measured against the same meetings on
  identical seeds — an identical-seeds before/after design (§15), not
  a fresh band. The sibling arm (sim-wildavoid-seedplan-b) shares
  this pilot band by design (same seeds, different lever, baselines
  comparable); each arm runs its own sims in its own worktree —
  never read or write the sibling's files.
- **Confirm band (only if the pilot passes the sniff test):
  104701–104716 (16 fresh seeds).** Freshness check (skill
  local_seed_band_freshness): `grep -rhoE "104[78][0-9]{2}"` over
  `evidence/*/sim-*-prereg.md` hits only `104898` (a different,
  unrelated band); no prereg uses any seed in 104701–104716. The
  full-evidence grep is re-run before any confirm spend and recorded
  in the evidence file; the one forbidden/contaminated list found
  (`evidence/2026-11-06/drive-practice-contaminated-baseline`) does
  not name this band. Neighbouring used bands on 2026-11-18
  (104401–104408, 104431–104446, 104501–104508, 104601–104608) are
  avoided. **Confirm = re-run the WHOLE 16-seed band both legs**
  (pilot 8 + fresh 8: 104601–104608 + 104701–104708) — the pilot
  seeds are re-run, not carried over, so the confirm is one clean
  16-seed comparison; the fresh-8 leg (104701–104708) is judged
  alongside, never substituted for the whole.
- **Policies:** competent verbatim. **Substrate both legs:**
  `VETREENGAGE=1 + FLEEREPAIR2=1 + FIGHTALLY2=1` (landed code only —
  see Substrate above). **Ctl = substrate, FIELDCAPDMG unset; arm =
  substrate, FIELDCAPDMG=1.** The legs differ ONLY by env — no code
  revert between legs. The driver asserts the flag matches the MODE
  label and each corpus file records `fieldcapdmgOn`, the godpath sha
  and the carrier presence in godpath.js / fieldFights.js.
- **Instrument:** `scripts/fieldcarrier-driver-a.js` (copy of
  `scripts/fightcap-dmg-driver-a.js`, adapted: MODE ⟺ FIELDCAPDMG,
  sense-substrate assertions REMOVED — the substrate is absent by
  design, see above — `PARTYSIZE4`/`LAUNCHPARTY` assertions REMOVED
  — no code reads them in this tree; encounter rows carry
  `carrierRage` from the fight record); analyzer
  `scripts/analyze-fieldcarrier-a.js` (reuses `legStats` from
  `analyze-fightcap-a.js`, new judge for the frozen bars above,
  engine-side carrier-fire detection, `--selftest`); per-seed JSONs
  under `evidence/2026-11-18/perseed-fieldcarrier-a-{ctl,arm}/`.
  **§15 panel:** `scripts/build-fieldcarrier-panels-a.js` (adapted
  copy of the fightcap panel builder, same schema) + `node
  scripts/balance-panel.js compare`; the compare `.md` is attached
  to the evidence file. The panel is the instrument, the frozen bars
  above are the judge.
- **PILOT ONLY, with a confirm gate:** no 16-seed confirm unless the
  pilot passes the sniff test (kill-share bars met + pool floor met);
  then the confirm band above and re-judge on the same frozen bars.
  The coordinator decides.

## Encounter-gear fixture (Steve 2026-11-13)

The verdict turns on whether a launched party FIGHTS as launched and
whether the carrier fires in real fights, so the fixture is the
encounter itself, staged by the competent policy: a geared scholar
fighting with a party, never a fresh un-geared solo scholar. The
pilot's per-seed corpora carry the encounter averages (party size,
gear, abilities) beside the verdict in the evidence file. The nearest
measured point for the encounter gear is the dmg band itself
(launched parties geared by the launch gear-up, min armorP 17.7–37
on losses); the pilot does not re-derive gear — the competent policy
plays it, and the corpora record what it played.

## Pre-pilot substrate checklist (§14b)

1. **Contact:** launched wave-4 meetings occur on the dmg
   substrate — 32 launched expedition meetings per 8 seeds, 13
   engaged pair-inclusive. WITHOUT the sense fix the meeting count is
   expected to be similar (meetings are seeded by plans, not by the
   fix) but the PRESENT/engaged pool is expected to be smaller (see
   pool-floor risk above). The pilot measures the pool as it finds
   it; contact is the meetings, the pool is the measurement.
2. **Pool sizing:** the pair-inclusive floor (n ≥ 10) is sized to the
   known WITH-fix pool (13/leg); the WITHOUT-fix pool is the open
   question the pilot answers first, before any kill-share claim.
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
   record. The analyzer `--selftest` covers the new judge shapes (GO,
   NO-GO on kill share, NO-GO on ratio, NO-GO thin pool, cost-bar
   failures, engine-side carrier-fire detection incl. the real-Rage
   non-count).

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
`godpath.js`), not from canon.

## Metric review

(To be filled at closeout. The dmg metric review already applied
here: pair-inclusive pre-registered as primary because the trio+
pool floor was too strict for an 8-seed pilot; the snapshot-proxy
carrier-fire bar is RETIRED and replaced by engine-side detection
above.)
