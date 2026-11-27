# sim-leadworst-a — PREREG (frozen BEFORE any judged sim)

**Arm:** sim-leadworst-a · **Loop A run:** fleshout-20261125T0215Z
**Axis:** scale-onramp (the blocking axis; standing directive applies).
**Type:** Part A DIAG (instrument-only) + Part B ONE default-OFF policy
probe (LEADWORST=1). Two legs on identical seeds: control (flag off)
vs probe (flag on).
**Frozen:** 2026-11-25 ~02:45 UTC, before any judged sim.
**Branch:** `sim-leadworst-a` (worktree
`~/workspace/worktrees/sim-leadworst-a`). **Base:** `d1d61f517`
(master tip at the 2315Z spawn; master has since moved — the branch
is rebased onto the current master tip before finishing, and the
corpus records the anchor commit it actually ran on).
**Adoption:** this arm was stranded by the timed-out 2315Z run. The
first worker wrote NOTHING — no prereg, no instruments, no sims.
This prereg, the instruments, the probe code, and both legs are built
fresh by the adoption worker from the recovered brief below.

## The question (finding #2601)

From basedmg-b (Loop B 1815Z, seeds 109501–109508): the launch lead
carries median weapon bonus 8 vs allies' 17 (lead base/strike 13.8
vs ally 23.0); kill share 0/27; median damage/round 25.7 vs ~111
needed. The launch party's leader is the worst-armed fighter in it.
This arm asks, in sims: (A) is launch leadership really chosen
with no gear weight, how often is the chosen lead the worst-armed
member, and what would the lead's gear need to be for the party to
reach the damage bar? (B) does re-weighting lead choice toward the
best-armed member move kill share?

## Mechanism pre-check (verified in code by the adoption worker, not taken on faith)

- **Lead selection:** the launch lead is whoever seeds a plan in
  `winPlanHavenTick` (src/js/win-plan.js:1154) — any
  ranger/explorer-profile villager at Haven who has personally
  fought a beast (`agencyState().know[vid].fought` non-empty) or
  whose village has slain one (`state.villageSlain`). NO standing,
  veteran, or gear weight exists at seeding — a first-eligible-seeder
  race, not a choice among candidates. (This corrects the original
  brief's phrasing: the lead is not chosen by standing/veteran at
  all.)
- **Companions ARE quality-selected:** `extraCompanionScan`
  (win-plan.js:723) tiers candidates as wave-3+ killers first, then
  armed, then the rest, ranked by `companionRank` within tier.
  `companionRank` (src/js/companion-score.js:83) scores errand /
  temperament / relationship / social need — no gear weight in the
  score itself; the tiering is the quality filter. So the party is
  veteran-first picked while the lead is unselected — the structural
  source of the #2601 gap.
- **Holder gear-up is bounded:** `villagerGearUp` (game.js:7702)
  equips from the holder's own stash, then the best deposited
  communal-armory weapon, then whittles. Nobody else's personal
  gear is ever taken. (Also: `startExpedition`
  (villager-agency.js:468) itself calls `villagerGearUp(vid, true)`
  for every departing villager, so every launch member is geared
  up at depart in both legs.)
- **Two launch paths exist; the brain path fires in sims:**
  `vbrainExecuteDepart` (villager-brain.js:1334) mirrors
  `winPlanDepart`'s `launchParty` (win-plan.js:1393). Any lead-swap
  hook must live in the brain path to be measured; `winPlanDepart`
  parity is a LANDING condition, not part of the probe.
- **wb definition (frozen):** "best-armed" means max wb where
  wb = round((meleeB + rangedB) / 2), the fight engine's own
  formula (fieldFights.js lead strike `lroll([4+wb, 8+wb])`;
  `fighterSnapshot` in the basedmg driver computes it the same
  way). NOTE: `gearOf`'s `weaponB` is melee-only
  (`weaponBonusOf(v, items)` with no slot returns the melee bonus,
  equipment.js:355) — the swap helper MUST NOT use it; it computes
  wb per slot like the snapshot does.

## Part A — hypotheses (frozen)

- **H1 (worst-armed lead):** the lead is the worst-armed party
  member (lowest wb; ties count as worst) in ≥ 50% of judged
  launched meetings.
- **H2 (seed race, not choice):** at Haven-seed time, ≥ 50% of
  seed events have ≥ 1 OTHER eligible seeder alive at Haven (a
  choice existed and was not taken — the seeder won a race).
- **H3 (swap counterfactual):** giving the median meeting's lead
  the party's best observed wb lifts its damage/round by ≥ 25%
  (from ~25.7 toward ~32+), holding strikes/round, multiplier,
  and volley at observed medians.

## Part A — primary metric (BINDING, §14)

**Lead-rank + seed-race quantification on the pair-inclusive
engaged launched wave-4+ meeting population** (the same population
basedmg-b judged: v4encounters row with origin `expedition`,
wave ≥ 4, joined to its v4gates row with a non-empty planParty,
|planParty| ≥ 1, launched party PRESENT, ENGAGED — rounds > 0;
evades join nobody), **judged on the CONTROL leg only** (the
probe must not contaminate the "is leadership chosen with no gear
weight" measurement).

**Part A DIAG-GO bar (frozen):**
- Pair-inclusive pool n ≥ 10 on the control leg (state the pool
  plainly if short), AND
- Lead rank quantified on ≥ 90% of judged meetings (complete
  per-fighter gear snapshots; a meeting with a null lead wb or a
  null best-party wb does not count as quantified), AND
- The seed-race question answered with numbers in EITHER
  direction (H2 confirmed OR refuted with the eligible-set counts)
  — EXCEPT: if fewer than 5 Haven-seed events are recorded across
  the band, the seed-race sub-question is INSUFFICIENT-DATA (the
  DIAG verdict then rests on the lead-rank half alone, and the
  evidence says so plainly; it is not a fail of the whole DIAG),
  AND
- The swap counterfactual computed from the median meeting (H3
  judged as a number, confirmed or refuted — either outcome
  counts toward DIAG-GO, since the counterfactual is a measurement,
  not a lever), AND instrument selftest green, AND proof test green.

**Verdict ladder (frozen):**
- Pool n ≥ 10 + lead-rank quantified ≥ 90% + seed-race answered
  (or INSUFFICIENT-DATA with n<5 events, stated) + counterfactual
  computed + selftest green + proof green → **DIAG-GO**.
- Pool n < 10 → **DIAG-NO-GO THIN-POOL** (numbers reported anyway).
- Lead-rank quantified < 90% → **DIAG-NO-GO INSTRUMENT**.
- Any other frozen bar missed → **DIAG-NO-GO** with the bar named.

## Part B — lever pick (frozen, exactly ONE lever)

**Lever (i) — re-weight lead choice toward the best-armed member.**
Flag-gated (`LEADWORST=1`) lead swap in the brain depart path via a
shared helper in win-plan.js (`winPlanLeadSwap`), considering all
dawn companions after gear-up:

- The helper takes the holder + the dawn companions
  (`c.companion`, `c.companion2`, `c.companion3`), gears each up
  in DEPARTURE order (holder first, then dawn companions — the
  same order `startExpedition` would gear them, so gear allocation
  is unchanged; only who leads can change), computes wb per
  candidate with the fight-engine formula, and picks the max wb.
  Tie → keep the holder (no swap on a tie).
- If the pick is a companion, the plan moves under the new lead's
  key (same pattern as the homebody handoff: the plan object
  moves, the old holder's entry is deleted), the depart list is
  rebuilt as [new lead, old lead, remaining companions in dawn
  order], and the plan is stamped `plan.leadSwap = { from, to,
  wbs, day }` so the instrument can read the swap without knowing
  the new lead in advance. The rest of `vbrainExecuteDepart` runs
  unchanged on the rebuilt list.
- The hook lives ONLY in `vbrainExecuteDepart` (the path that
  fires in sims). `winPlanDepart` parity is a LANDING condition:
  if the probe GOes, the landing commit ports the swap to
  `winPlanDepart`'s `launchParty` and re-proves it; the probe
  itself does not touch that path.
- The flag changes who leads fights — a feel/combat change — so
  if the probe lands as game code, its commit carries
  `[needs-eyes]`.

**Lever (ii) — gear the holder before launch — SET ASIDE.** The
only honest form — taking a better weapon from a companion's
personal stash — violates the standing rule that personal gear is
never taken (verified game.js:7702); the holder already takes the
best deposited weapon via `villagerGearUp`. My own code read
confirms the brief's reasoning; no evidence overturns it. If the
probe's numbers later show the swap alone cannot close the gap
because the best party weapon is itself too weak, that is a
finding for the coordinator, not a silent second lever.

## Part B — primary metric (BINDING, §14)

**Kill share on the pair-inclusive engaged launched wave-4+
meeting population** (same population as Part A / basedmg-b),
control vs probe on identical seeds.

**Part B GO bar (frozen):**
- Probe kills ≥ 2 AND probe kill share − control kill share
  ≥ 5 percentage points, pool n ≥ 10 on EACH leg, AND
- Cost bars (the legStats judge's frozen bars): probe starvation
  deaths total ≤ control + 2 AND probe villager (non-player)
  starvation deaths ≤ control + 2, AND probe median survival
  ≥ 0.8 × control median survival.
- All three must pass for **GO**. Any miss → **NO-GO** with the
  bar named. If the probe fails its bars, it is killed — no
  game-code landing from a failed probe (the probe code is
  reverted before any landing commit; the DIAG instruments and
  evidence stay).

**Secondary metrics (supporting, not binding):**
- Damage/round medians per leg (probe vs control) + the lead-wb
  medians per leg (did the swap actually move who leads?).
- Swap fire rate: fraction of probe-leg departures where the swap
  fired, and the lead-wb gain on swapped departures.
- Wall numbers per leg: national / table / wins, wave-4 and
  wave-5 unlocks, median survival.
- Sense-test: read transcripts of the best + worst probe-leg
  meetings in full; judge whether the swapped lead reads as a
  real leader (who struck, who fled, why), not just counts.

## What this arm does NOT judge

- No 12–16 seed confirm — single band, two legs, 8 seeds each;
  the coordinator decides any follow-up from the verdict.
- No `winPlanDepart` change in the probe (landing condition only).
- No carrier variant (ragecarry NO-GO exhausts that family).
- No `check.js` gate on the DIAG legs (driver + analyzer + proof
  test only); the probe-code commit runs its proof test + the
  affected quick checks before landing consideration.

## Horizon, seeds, policies

- **Horizon:** 150d, death-aware (same as the basedmg /
  fightcap / ragecarry bands, for comparability). Dead villages
  stop simulating (+10d tail max).
- **Seeds (fresh 8-seed band): 110721, 110722, 110723, 110724,
  110725, 110726, 110727, 110728.** Freshness check (skill
  local_seed_band_freshness), 2026-11-25 ~02:40 UTC, before any
  judged sim: `git grep -l -E "110721|...|110728" -- 
  'evidence/*/sim-*-prereg.md'` — 0 hits; same pattern over
  `'evidence/*/*.md'` — 0 hits; over `'scripts/*.js'` — 0 hits.
  Collisions recorded so the next worker does not repeat them:
  110721–110728 (this band); 109501–109508 (basedmg-b);
  107901–107912 (ragecarry confirm); 107801–107808 (ragecarry
  pilot); 110101–110108 (fightcap recheck); 110301–110316
  (fightcap confirm, frozen); 106151–106158 (holder-rich band,
  deliberately not used).
- **Policies:** competent verbatim (`scripts/policies/competent.js`,
  sha256 first 12 `1884c8852d38` — verified at run time in the
  worktree before the band; if the policy sha differs, record it
  and STOP, do not silently run a different policy).
  **Substrate (landed code):** `SENSEEXPED=1 PARTYSIZE4=1
  VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1` — the basedmg-b
  substrate exactly — **plus `SPEARGATE=1 BOWOPEN=1` per the run
  substrate** (the bow-staging / spear-gate levers: game.js:7833
  BOWOPEN gates `villagerStageBow`, game.js:7863 SPEARGATE gates
  the staged-weapon volley check). The driver asserts all seven
  flags and each corpus file records them + shas.
- **Instrument:** `scripts/leadworst-driver-a.js` (a port of
  `scripts/basedmg-driver-b.js` — the recorder is unchanged
  except: a `v4havenseeds` wrap on `winPlanHavenTick` recording
  every fresh plan creation with the seeder's profile,
  engagement source (personally-fought vs village-slain), and
  the other eligible seeders at Haven at that moment with their
  wb; depart rows (both sources) carry lead gear snapshots at
  depart — lead wb, party wbs, lead rank, worst-armed flag,
  best wb in party, gap, and the `leadSwap` stamp when present;
  the `LEADWORST` mode assert — ctl ⟺ flag unset, arm ⟺ flag
  set — and the SPEARGATE/BOWOPEN asserts; per-seed JSONs under
  `evidence/2026-11-24/perseed-leadworst-a-ctl/` and
  `evidence/2026-11-24/perseed-leadworst-a-arm/`);
  analyzer `scripts/analyze-leadworst-a.js` (reuses the basedmg
  strike-line parser + decomposition + counterfactuals by
  require; the lead-rank / seed-race / swap-counterfactual /
  control-vs-probe compare judge are new here, `--selftest`
  incl. the lead-rank shapes, the seed-race shapes, the swap
  counterfactual, and all judge shapes);
  proof `scripts/test-leadworst-a.js` (GREEN before the band).
  **§15 panel:** the control-vs-probe comparison runs through
  `scripts/balance-panel.js` per §15 and the compare `.md` is
  attached to the evidence file.

## Encounter-gear fixture (Steve 2026-11-13)

The verdict turns on whether a launched party FIGHTS as launched,
so the fixture is the encounter itself, staged by the competent
policy: a geared scholar fighting with a party, never a fresh
un-geared solo scholar. The per-seed corpora carry the encounter
averages (party size, gear, abilities) beside the verdict in the
evidence file, so a later reader can see the fixture gap without
re-running the panel. The nearest measured point for the encounter
gear is the basedmg-b band (launched parties geared by the launch
gear-up, lead wb median 8, ally wb median 17); this arm does not
re-derive gear — the competent policy plays it, and the corpora
record what it played, per fighter, per meeting.

## Pre-run substrate checklist (§14b)

1. **Contact:** launched wave-4 meetings occur on the substrate —
   basedmg-b: 27 engaged launched-party meetings / 8 seeds. The
   pair-inclusive pool on this band is expected ≥ 10 per leg.
2. **Pool sizing:** see (1). The pair-inclusive floor (n ≥ 10)
   is the judged population per leg; the trio+ pool is reported,
   not judged.
3. **Mechanism pre-check (frozen, not a sim):** the proof test
   (`scripts/test-leadworst-a.js`, GREEN before the band) stages
   the instrument in a staged field fight — full-log capture,
   fighter gear snapshot, strike-line parsing, lead-rank
   computation — AND stages the swap: a staged holder + dawn
   companions where the best-armed companion out-ranks the holder
   swaps the lead (plan moves, stamp set, depart list rebuilt)
   with the flag on, and does NOT swap with the flag off; the
   gear allocation is unchanged by the swap (same weapons on the
   same people, only the departure order changes). The analyzer
   `--selftest` covers the lead-rank join, the seed-race shapes,
   the swap counterfactual, and all judge shapes incl. THIN-POOL
   and INSTRUMENT paths.

## Canon note

`docs/CANON.md` (manifest), `docs/MONSTER-WAVES.md`, and
`docs/PARTY.md` were read for this arm. MONSTER-WAVES.md: wave-4
bands are damage 35–95, HP 850–1500, pierce 0.2–0.5 — "a 4–6 round
fight for a godhood build (~220 dmg/round)". The damage yardstick
(~111/round Cooper shape, ~220 godhood) comes from that canon band
plus the basedmg-b evidence, not from invention. No canon doc
covers the launch lead, the plan-seeding race, or lead selection —
said here rather than inventing canon. The launch mechanics are
cited from code (`win-plan.js`, `villager-brain.js`,
`villager-agency.js` `startExpedition`, `game.js`
`villagerGearUp`, `companion-score.js`), not from canon.
