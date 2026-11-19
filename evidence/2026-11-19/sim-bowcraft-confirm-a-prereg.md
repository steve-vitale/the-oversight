# sim-bowcraft-confirm-a — PREREG (frozen BEFORE any judged sim)

**Arm:** sim-bowcraft-confirm-a · **Loop A run:** fleshout-20261119T1815Z
**Type:** CONFIRM — the replication leg the pilot owed before any
BOWCRAFT turn-on decision (finding #2597 / #2610).
**Frozen:** 2026-11-19 ~19:09 UTC, before any judged sim.
**Branch:** `sim-bowcraft-confirm-a` (worktree
`~/workspace/worktrees/sim-bowcraft-confirm-a`). **Base:** master
`17bb496df` (rebased from the brief's base `af7fddfc4` before any
judged sim, per the brief — the rebase was a clean fast-forward).
**The only differences between af7fddfc4 and 17bb496df are the ship
bump files** (`index.html`, `src/js/build.js`, `sw.js`,
`version.json` — verified with `git diff af7fddfc4..HEAD --stat`:
4 files, no `src/` change other than the build stamp, no
bow/craft/departure code touched).
**The fix is LANDED on master as `ef1c81094`** (sim-bowcraft-a:
BOWCRAFT fix for finding #2597 — serve ranged-less villagers +
seed bow knowledge from seeing). This arm builds NO game code: it
only measures the landed, env-gated fix on a fresh band. The gate
stays; adoption decides un-gating (mirroring speargate).
**Builds on:** `evidence/2026-11-19/sim-bowcraft-a-prereg.md` and
`evidence/2026-11-19/sim-bowcraft-a.md` (BUILD-GO on the pilot band
107001–107008: craft attempts 0 → 47, bows 0 → 13, bowless
departure share 0.795 → 0.732, delta 0.063 against a 0.05 bar —
thin; wave-5 unlocks 0/8 → 4/8 observed-not-attributed).

## The question

Does the pilot replicate on fresh seeds? The pilot's bar-3 delta
(0.063) is thin and one seed (107002, 67 bowless departures on
both legs) carries it; the wave-5 wall movement (0/8 → 4/8) is
observed, not attributed. The confirm leg re-runs the identical
before/after on the FRESH band 107011–107018, 8 seeds per leg, with
the ONE instrument correction the pilot's §12 proposed (finding
#2609, below). GO = the pilot replicates; NO-GO = it does not, and
the fix stays env-gated OFF (nothing to revert — it is already
landed gated; this branch carries instrument + evidence only).

## Code facts (frozen, read before any sim — the fix as landed)

- Duty `villagerWeaponCraftDay` (villager-build.js, landed
  `ef1c81094`): serves ranged-less villagers for the BOW rungs
  (`bow`, `crude_bow`) only; seeds bow knowledge from SEEING a
  ladder weapon EQUIPPED by another home villager (snapshot before
  the per-villager loop); all behind `BOWCRAFT=1` (node sims only);
  control leg (unset) is byte-identical old behavior. Verified
  present in this worktree by grep (`BOWCRAFT` in
  villager-build.js:1276–1411, gate read at exactly one site).
- Recipes (recipes.json, read live in the pilot): hunting_spear
  branch 1 + stone 1 + vine 1; fire_hardened_spear branch 1 +
  wood 1; crude_bow branch 1 + vine 1; bow wood 1 + vine 2.
- No game-code change is made or needed by this arm.

## Primary metric (BINDING, §14) — the pilot's frozen bars, verbatim

**Before/after on identical seeds 107011–107018, two legs
(ctl: BOWCRAFT unset; arm: BOWCRAFT=1), one shared base.**
Judge is the frozen bars below; the panel (§15) is the
instrument.

- **Craft attempts:** `tele('weapon_craft')` events with item
  bow / crude_bow, per leg, across the band.
- **Bows crafted:** the ok:true subset of the above.
- **Bowless departure share:** departures with no volley-capable
  ranged weapon / all departures (same driver row as the pilot).
- **Craft denominator:** ranged-less-knows-bow villager-days =
  sum over census rows of alive villagers with no volley weapon
  equipped or carried who know a bow recipe (bow or crude_bow
  ≥ 1).

**GO threshold — ALL must hold:**
1. Craft attempts (bow rungs) on the arm leg **≥ 3** across the
   band.
2. Bows crafted (bow / crude_bow, ok) on the arm leg **≥ 3**
   across the band.
3. Bowless departure share: arm **< control by ≥ 0.05 absolute**.
4. No-regression guardrails: median survival arm **≥ 0.8×**
   control; starvation deaths arm **≤ control + 2**; village
   deaths per run (panel) arm **≤ control × 1.10**.

**GO** = all four hold → the pilot replicates on a fresh band; the
turn-on decision is NOT made here — the gate stays and adoption
decides un-gating (mirroring speargate).
**NO-GO** = any bar misses → report the measured reason; the fix
stays env-gated OFF.

## Secondary metrics (supporting, not binding)

- Engaged meetings with a bow-armed fighter (arm > 0 is the
  direction; pilot: ctl 2/7 ranged at entry, arm 4/5).
- Craft attempts per ranged-less-knows villager-day (arm leg).
- Knowledge spread: ranged-less villagers who know a bow recipe
  over time (arm vs control); spear-armed-knows-bow days.
- Attribution completeness on the arm leg ≥ 0.90 (same
  instrument as the pilot, WITH the #2609 window fix — the pilot
  measured 0.719 on the frozen window and 0.9375 on the
  diagnostic recomputation with the window fixed; the confirm
  leg judges the fixed instrument).
- Wall numbers (reported every run): national / table / wins,
  wave-4 and wave-5 unlocks, median survival.

## What this arm does NOT judge

- Whether a ranged opening wins fights (bowopen NO-GO stands).
- Arrow supply (arrowsupply NO-GO stands).
- No live verification (ship loop owns deploys). No push, no
  version bump. No merge to master by this arm — the coordinator
  merges.

## Horizon, seeds, policies

- **Horizon:** 150d, death-aware (same as the pilot band, for
  comparability). Dead villages stop simulating (+10d tail).
- **Seeds (confirm, identical both legs): 107011–107018**
  (FRESH — see the freshness check below).
- **Policies:** competent verbatim. **Substrate (both legs):**
  `VETREENGAGE=1 + PARTYSIZE4=1 + FLEEREPAIR2=1 + FIGHTALLY2=1
  + SENSEEXPED=1`. **BOWOPEN unset, SPEARGATE unset.
  LAUNCHPARTY unset** (dead flag). Leg difference is BOWCRAFT
  only: ctl unset, arm `=1`.
- **Instrument:** `scripts/bowcraft-driver-confirm-a.js` (clone
  of `scripts/bowcraft-driver-a.js` — recorder unchanged);
  analyzer `scripts/analyze-bowcraft-confirm-a.js` (clone of
  `scripts/analyze-bowcraft-a.js` + the ONE change below);
  per-seed JSONs under
  `evidence/2026-11-19/perseed-bowcraft-confirm-a-{ctl,arm}/`.
  **§15 panel:** `scripts/build-bowcraft-panels-confirm-a.js`
  (clone of the pilot panel builder, same schema) + `node
  scripts/balance-panel.js compare` with ctl vs arm legs; the
  compare `.md` is attached to the evidence file. The panel is
  the instrument, the frozen bars above are the judge.
- **Proof test:** `scripts/test-bowcraft-confirm-a.js` — GREEN
  before the sweep. Covers: the fix (ranged-less eligibility,
  seeing-seeding, spear-out-of-slot, control-leg identity — as
  the pilot's test, re-pointed at the confirm instruments);
  the analyzer `--selftest` (35 checks, incl. the #2609
  live-cadence fixture); a live 5-day smoke asserting the
  recorder writes baseline + census rows with 0 instrument
  errors and BOWCRAFT on/off proof; analyzer interop on the
  live smoke corpus. Encounter-gear fixture: the competent
  policy stages the encounter itself (a geared scholar fighting
  with a party, never a fresh un-geared solo scholar); corpora
  record the encounter averages beside the verdict.
- **Fallback recovery:** `scripts/recover-bowcraft-fallback-confirm-a.js`
  (clone of the pilot's recover script, re-pointed at the
  confirm log/filenames and the current anchor `17bb496df`).
  If a corpus write fails, the driver falls back to dumping
  the corpus as text into the sweep log; the recover script
  extracts it and writes it back with write + readback
  verification. Never claim a write succeeded without readback
  verification.

## The ONE instrument change vs the pilot (finding #2609)

The attribution gap window is `[prevRowDay, rowDay]` instead of
`(prevRowDay, rowDay]` (`eventsInWindow` in
`scripts/analyze-bowcraft-confirm-a.js`: `kd >= fromDay`).
The pilot's analyzer misattributes same-day crafts to the D+1
row: the day-D census row is taken before the day-D duty runs,
so a craft or loot event on day D first appears in the D+1 row,
and the old window `(D, D+1]` excludes day D. The pilot proved
this by diagnostic recomputation (arm completeness 0.719 →
0.9375, ctl 0.930 → 0.977, verdict unchanged). **This is a
corrected instrument for the confirm leg, NOT a re-score of
the pilot** — the pilot's frozen numbers stand as its record.
The confirm selftest adds a live-cadence fixture (craft day D,
appearance row D+1, plus a loot day-D case) that the old window
fails and the fixed window passes, so the fixture cannot pass
while live data fails.

## Seed-band freshness (verified in this prereg, before any sim)

Band 107011–107018 was reserved by the pilot prereg as the
designated confirm band. Re-verified 2026-11-19 ~19:05 UTC:

- `grep -rl -E "10701[1-8]" evidence/ --include="*.md"` →
  3 files: `sim-bowcraft-a-prereg.md` (designation), 
  `sim-bowcraft-a.md` (evidence §11, "NOT run — owed"),
  `sim-scale-onramp-round-1415.md` ("Confirm leg OWED …
  fresh band 107011–107018 … The band is still fresh").
- Goal `hidden_files/` → 3 files, all naming-only:
  `convergence-tracker.md` (confirm "OWED before any turn-on
  decision"; "sibling Loop A has since picked up the bowcraft
  confirm leg"), `sim-findings.md` (#2597 line, "Confirm leg
  (fresh band 107011–107018) NOT run — owed"), 
  `sim-winnability-round-1530-DRAFT.md` ("sibling loop's item,
  not this round's").
- `~/memory/*.md` → 1 file: `2026-11-19.md` (run notes:
  "Confirm leg … OWED"; "Loop A has picked up bowcraft-confirm
  (107011–107018)").
- `grep -rh -o -E "10701[0-9]" evidence/ --include="*.md"` →
  only `107011` (8×) and `107018` (8×): the range is mentioned
  as "107011–107018" only — no individual seed 107012–107017
  is ever named.
- No per-seed directory or file for the band exists under
  `evidence/2026-11-19/`; `grep` over the per-seed JSON corpora
  for any of 107011–107018 returns 0 hits.

**Result: 0 judged corpora on this band. The band is fresh.**
Every hit names it as the designated/owed confirm band only.

## Pre-run substrate checklist (§14b)

1. **Contact:** departures occur on the substrate — the pilot
   saw 161 departures / 7 engaged meetings on its band; the
   bowless pool is the measured denominator. The confirm band
   is fresh, so contact is re-measured, not assumed — if the
   confirm band shows <100 departures the pool floor is
   reported, not waived.
2. **Pool sizing:** craft denominator is counted, not assumed
   (the ranged-less-knows census count on both legs).
3. **Mechanism pre-check (frozen, not a sim):** the proof test
   (GREEN before the sweep) proves the eligibility split, the
   seeing-seeding rules, the spear-out-of-slot equip, the
   control-leg identity, the analyzer selftest (incl. the
   #2609 live-cadence fixture), and the recorder shape on
   fixtures, plus a short live smoke. The analyzer
   `--selftest` covers the before/after judge shapes incl. the
   GO / NO-GO paths.

## Canon note

`docs/CANON.md` (manifest) was read for this arm, plus the
pilot's canon note stands: no canon doc covers villager
crafting, bow supply, or launch gear-up — said here rather
than inventing canon. All supply-chain claims are cited from
code (`villager-build.js` `villagerWeaponCraftDay`,
`equipment.js` `volleyWeaponOf` / `autoEquip`, `game.js`
`villagerKillLoot` / `genOpeningPool`), not from canon.

## Flap note

This run already hit the host write flap twice before this
prereg was written (a brief ref-lock refusal ~18:18Z, then a
long checkout failure 18:29–18:41Z). If a corpus write fails,
the driver falls back to dumping the corpus as text into the
sweep log (the bowcraft-a recover pattern) and the recover
script restores it with readback verification before any
judging. A corpus is never judged without verifying it parses
and carries the right seed / mode / anchor / bowcraftOn.

## Metric review (filled in the evidence file, not here)

Per §14: if a frozen metric proves wrong, it is written up under
"metric review" in the evidence file and a revision proposed for
the NEXT run — never re-scored mid-run.
