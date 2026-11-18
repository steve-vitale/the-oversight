# sim-fightcap-dmg-a — PREREG (frozen BEFORE any new sim)

**Arm:** sim-fightcap-dmg-a · **Loop A run:** fleshout-20261118T1515Z
**Type:** CAPABILITY — a damage-multiplier carrier in launched parties
(finding #2544, the fightcap decomposition). **Frozen:** 2026-11-18
~10:05 CST, before any new sim. **Branch:** `sim-fightcap-dmg-a`
(worktree `~/workspace/worktrees/sim-fightcap-dmg-a`).
**Builds on:** `evidence/2026-11-18/sim-fightcap-a.md` and
`evidence/2026-11-18/sim-scale-onramp-round-1415.md` (finding #2544:
a typical launched trio deals ~50 damage/round to a ~1,200 HP wave-4
monster, ~39 rounds to kill, and flees after five rounds while alive;
combined kill share 2/34 launched meetings (0.059), control 0/9. The
only wins (Cooper's party, one seed): a Rage fighter at 2.5x damage +
bow opening + all three hitting every round, ~111 damage/round, wins
in 9–12 rounds. The fight gate never held back a losing party (0
avoids among 28 arm losses) because it scores size+gear, never damage.)

## The carrier (frozen design)

A launched party's holder rages like a Rage-holder when facing a
wave-4+ monster — even without the Rage ability. Implementation is
fight code ONLY (`src/js/game.js`, `tbVillagerAbility` RAGE block;
no win-plan.js change, no wild-avoid change — the sibling arm
sim-wildavoid-seedplan-a owns those files and paths):

- Env-gated `FIGHTCAPDMG=1`; off = byte-identical old behavior.
- Fires when ALL hold: the villager has not yet raged this fight;
  they hold a launched plan (`state.village.winPlan[vid]` with a
  non-empty `party`); they are currently on an expedition
  (`agencyState().exped[vid]` present — the same guard the sense fix
  uses, so a stale plan never carries); the nearest live monster is
  wave ≥ 4 (`m.mdef.wave`); they are adjacent to it (d ≤ 1, the
  existing Rage trigger distance).
- Effect is EXACTLY real Rage: `v._vRageRounds = 3`, next 3 strikes
  deal double damage, same voice line ("eyes go red — the rage takes
  hold. Next 3 strikes hit twice as hard."). The holder only — allies
  keep their own abilities, matching the winning shape (Rage on the
  fighter, allies contributing normal strikes).
- It grants NO ability: no slot taken, nothing persisted, nothing
  learned. The flag is fight-scoped and spent per strike like real
  Rage. This arm is a PROBE of the mechanism (is a damage multiplier
  the binding link?), not a shipped grant path. If GO, the follow-up
  design question — how villagers EARN Rage (System offers on
  level-up / combat completion) — is a separate arm / Steve-call.

**Policy-side ruled out (recorded, not assumed):** policies drive the
scholar; launched-party members are NPC villagers, and abilities are
System-granted, never taught (CANON.md standing rule; MEMORY.md:
"granted by the System for leveling up or completing combats — never
taught, never bought"). No policy path reaches launched-party members,
so the carrier is game code, scoped to fight/ability files as above.

## Substrate (frozen — read before judging the control leg)

The sense fix (HELD branch `sim-launchparty-sense-a`, tip d01eaf0a5)
is merged into this branch as a SUBSTRATE commit (src/js only:
`party-wiring.js` LAUNCHPARTY block + `villager-brain.js` partyTrios
counter — the exact `master...sim-launchparty-sense-a` diff). It is
NOT landed by this arm; the coordinator lands only this arm's own
commits, never the substrate merge (same pattern as sim-fightcap-a,
merge d03754334).

- **Both legs run with `LAUNCHPARTY=1`.** The legs differ ONLY by
  `FIGHTCAPDMG` (ctl unset, arm `=1`). The driver asserts this and
  stops otherwise.
- **Why the substrate is required (deviation from the task's
  "control = current master" wording, recorded here for the
  coordinator):** without the sense fix, the launched party is
  present at only ~48% of launched meetings (re-judge corrected
  arrival 0.48 ctl vs 0.88 arm) — the measured population would be
  the sense problem, not the capability question. The fightcap
  baseline kill share (0.059 combined, 0.091 fresh band) was measured
  on this substrate, and the GO bar below (≥2× the control kill
  share on identical seeds) is only meaningful on the same substrate.
  Control = current master + the substrate the baseline was measured
  on; the ONLY difference between legs is the carrier.

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
  bars pass → **GO** (a damage-multiplier carrier turns launched
  parties into winners; next arm is the earn-path design).
- Pool floor met + kill-share bars missed or any cost bar fails →
  **NO-GO** (the multiplier as staged does not carry the fight; the
  next arm is a different capability shape — e.g. carrier on all
  members, or bow opening — NOT another sense/gate tweak).
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
- Carrier-fire check: meetings where the holder raged WITHOUT the
  Rage ability (log line "eyes go red" + holder's snapshot abilities
  lacking `rage`) — the carrier must be observed firing in the arm
  leg; 0 carrier fires = failed mechanism check, reported as such
  even if the kill share moves.
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
- The rounds=0 "vKill" rows (excluded by the engaged filter) and the
  encounter-log ~20-line cap (parsed strike totals understate long
  fights; all damage-rate claims use mDealt/rounds).

## Horizon, seeds, policies

- **Horizon:** 150d, death-aware (same as the fightcap band, for
  comparability). Dead villages stop simulating (+10d tail max).
- **Seeds (fresh 8-seed pilot band): 104601, 104502, 104503, 104504,
  104605, 104606, 104607, 104608.** Freshness check (skill
  local_seed_band_freshness): `grep -rln "10460[1-9]|10461[0-2]"`
  over `evidence/` (`--include="*.md"`) hit only
  `evidence/2026-11-02/sim-food-round-1636.md` and
  `evidence/2026-11-14/sim-transplant16-prereg.md` — both hits are
  commit hashes containing "10461" (`71046107d`,
  `bb446d104611ddc6bd19b5503567e417de984453`), NOT seed bands;
  `grep -rn "104601"` over `evidence/` — 0 hits. Prereg grep
  (`evidence/*/sim-*-prereg.md` for `10460|10461`) hit the same two
  files for the same hash reason. The one forbidden/contaminated list
  found (`evidence/2026-11-06/drive-practice-contaminated-baseline`)
  does not name this band. Neighbouring used bands on 2026-11-18
  (104401–104408, 104431–104446, 104501–104508) are avoided. **Band
  104601–104608 is fresh; extension 104601–104612 is fresh.**
  The sibling arm (sim-wildavoid-seedplan-a) shares this pilot band
  by design (same seeds, different lever, baselines comparable);
  each arm runs its own sims in its own worktree — never read or
  write the sibling's files.
- **Policies:** competent verbatim. **Substrate both legs:**
  `VETREENGAGE=1 + PARTYSIZE4=1 + FLEEREPAIR2=1 + FIGHTALLY2=1`,
  `LAUNCHPARTY=1`. **Ctl = substrate, FIGHTCAPDMG unset; arm =
  substrate, FIGHTCAPDMG=1.** The legs differ ONLY by env — no code
  revert between legs. The driver asserts the flag matches the MODE
  label and each corpus file records `launchpartyOn`,
  `fightcapdmgOn`, the party-wiring sha and the carrier presence in
  game.js.
- **Instrument:** `scripts/fightcap-dmg-driver-a.js` (copy of
  `scripts/launchparty-sense-driver-a.js` from the sense branch,
  adapted: MODE ⟺ FIGHTCAPDMG, LAUNCHPARTY=1 asserted on BOTH
  legs); analyzer `scripts/analyze-fightcap-dmg-a.js` (reuses
  `legStats` from `analyze-fightcap-a.js`, new judge for the frozen
  bars above, `--selftest`); per-seed JSONs under
  `evidence/2026-11-18/perseed-fightcap-dmg-a-{ctl,arm}/`.
  **§15 panel:** `scripts/build-fightcap-dmg-panels-a.js` (adapted
  copy of the fightcap panel builder, same schema) + `node
  scripts/balance-panel.js compare`; the compare `.md` is attached
  to the evidence file. The panel is the instrument, the frozen bars
  above are the judge.
- **PILOT ONLY, with a confirm gate:** no 12-seed confirm unless the
  pilot passes the sniff test (kill-share bars met); then extend to
  **104601–104612** (12 seeds, re-run whole band both legs) and
  re-judge on the same frozen bars. The coordinator decides.

## Encounter-gear fixture (Steve 2026-11-13)

The verdict turns on whether a launched party FIGHTS as launched and
whether the carrier fires in real fights, so the fixture is the
encounter itself, staged by the competent policy: a geared scholar
fighting with a party, never a fresh un-geared solo scholar. The
pilot's per-seed corpora carry the encounter averages (party size,
gear, abilities) beside the verdict in the evidence file. The nearest
measured point for the encounter gear is the fightcap band itself
(launched parties geared by the launch gear-up, min armorP 17.7–37
on losses); the pilot does not re-derive gear — the competent policy
plays it, and the corpora record what it played.

## Pre-pilot substrate checklist (§14b)

1. **Contact:** launched wave-4 meetings occur on the substrate —
   the fightcap fresh band yields 45 arm / 29 ctl launched meetings
   per 8 seeds; the engaged pair-inclusive pool is 22 arm / 4 ctl.
   The carrier's population is that pool.
2. **Pool sizing:** the pair-inclusive floor (n ≥ 10) is sized to
   that known pool (22 arm on the fightcap band); a pool below the
   floor is a NO-GO thin-pool outcome, not a surprise.
3. **Mechanism pre-check (frozen, not a sim):** the proof test
   `scripts/test-fightcap-dmg-a.js` stages a launched holder (plan +
   expedition + wave-4 monster adjacent) and asserts the carrier
   fires WITHOUT the Rage ability (and does not fire when the flag is
   off, when the holder has no plan, when not on expedition, or
   against a wave-3 monster); the analyzer `--selftest` covers the
   new judge shapes (GO, NO-GO on kill share, NO-GO on ratio, NO-GO
   thin pool, cost-bar failures, carrier-fire detection).

## Canon note

`docs/CANON.md` (manifest), `docs/MONSTER-WAVES.md`, and
`docs/SYSTEMS.md` were read for this arm. MONSTER-WAVES.md: wave-4
bands are damage 35–95, HP 850–1500 — "a 4–6 round fight for a
godhood build (~220 dmg/round)". The damage yardstick comes from
that canon band. Rage: `src/data/abilities.json` — Berserker Rage,
pool `system`, unlock `system_offer`, "Your next three strikes deal
double damage"; NPC path in `game.js` (`tbVillagerAbility` sets
`v._vRageRounds = 3`, strike calc doubles). CANON.md standing rule:
abilities come ONLY from the System (offers, trials, milestones)
into the 6 slots — never taught, never bought. The carrier grants no
ability and touches no grant path; the earn-path design is a
follow-up question, not decided here. No canon doc covers the sim
recorder or the villager launch party — said here rather than
inventing canon. The launch mechanics are cited from code
(`win-plan.js`, `villager-agency.js`, `party-wiring.js`, `game.js`,
`fieldFights.js`), not from canon.

## Metric review

(To be filled at closeout. The fightcap metric review already
applied here: pair-inclusive pre-registered as primary because the
trio+ pool floor was too strict for an 8-seed pilot.)
