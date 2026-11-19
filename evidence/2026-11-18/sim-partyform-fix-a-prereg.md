# sim-partyform-fix-a — frozen prereg (finding #2547)

- Arm: `sim-partyform-fix-a` (Loop A, run fleshout-20261118T2330Z, axis scale-onramp)
- Fix: party formation for seeded plans — phase (a) only (see below).
- Status: **FROZEN before any sims** (2026-11-18). No sim has run under this prereg.
- Base: master 046ae5859 + substrate cherry-pick 0838e0142 (see Substrate).
- Canon read: docs/CANON.md, docs/PARTY.md. No canon doc covers party
  formation for seeded plans specifically; the win-plan rules live in
  src/js/win-plan.js's header ontology comment (winplan_ordered_stages,
  winplan_perception_only, winplan_no_second_join). Nothing invented.
- Evidence read: evidence/2026-11-18/sim-partyform-diag-a.md (four shapes
  #2560 leaver, #2561 ranger-gated pool, #2562 range-0 holder, #2563
  scholar-holder frozen away entry), evidence/2026-11-18/sim-wildavoid-
  seedplan-b.md (confirm NO-GO: seed works, party never forms — 104705
  launched-but-fleeing parties, 104708 stalled reunion plan starving the
  pipeline). NOTE: evidence/2026-11-18/sim-wildavoid-seedplan-a.md does
  NOT exist in the tree (only the -b evidence file); the -a arm's
  outcome is covered by the -b evidence and by branch
  sim-wildavoid-seedplan-a (driver + analyzer + fix commits).
- Skills read: ~/workspace/custom-skills/local_seed_band_freshness/
  SKILL.md, ~/workspace/custom-skills/local-proof-of-effect/SKILL.md.

## The fix (phase (a) — the only change in this phase)

Env-gated, default OFF: `PARTYFORMFIX=1`. A plan belongs to a villager
who is actually here and is not the scholar. Three small pieces, one
family, all in existing cleanup/seed paths:

1. `winPlanSeedFromFight` (src/js/win-plan.js) refuses to seed when the
   holder is the scholar (`vid === this.villagerId`, #2563 — every NPC
   system skips villagerId, so a scholar-held plan is a zombie) or when
   the holder is away with purpose `'leave'` / duration >= 999 (#2560 —
   the LEAVE objective sets partsLeft 999 and "the base return clock
   never brings them home"; objTick's dawn re-pick requires !away and
   agencyTick skips non-Haven villagers, so such a plan can never bid).
   A villager away on an ordinary trip (forage/water/expedition) still
   seeds: they come back and the plan can bid.
2. LEAVE departure (src/js/villager-objectives.js, objMaybeDepart's
   `o.kind === 'LEAVE'` branch) calls the existing
   `winPlanOnVillagerLeave(rid)` — the plan dies with the leaving, the
   way betrayal.js already cleans up leavers. Covers plans seeded
   BEFORE the holder walks out for good.
3. Succession (src/js/villager-build.js, `mantleBecome(oldId, newId)`)
   calls the existing `winPlanOnVillagerLeave(newId)` — the successor
   stops being an NPC the moment they take the mantle, so their NPC
   plan dies with the taking instead of freezing with its away entry
   (oliver_moore, 43 holder-days). Called after villagerId points at
   the successor, mirroring the real call sequence from playerDeath.

NOT touched in this phase: the seed itself (it works — do not re-tune),
readyDemand numbers, `findCompanion` (phase (b) only, see trigger
below), holder-range scoring at staging (phase (b) only).

## Phase (b) trigger (frozen)

Implement (b) ONLY if (a) alone leaves the pool empty on the pilot:
pilot arm stages >= 8 seeded plans AND the arm launch-with-party rate
is below 50% AND the analyzer's stall classification shows pool-empty
(no eligible companion at dawn on >= 50% of stalled holder-days) as
the dominant stall shape. If triggered, (b) is: widen `findCompanion`
(both src/js/win-plan.js and src/js/villager-brain.js — the live dawn
path is the brain's) from ranger-profile (`wanderer`/`explorer`) to
`npcMaxDist >= 1` (foragers in, homebodies out — the same bar
`extraCompanionScan` and `companionLaunchable` already use), and score
the HOLDER's range at staging so a range-0 holder's plan does not bid
`party_launch` forever. A triggered (b) gets its own prereg addendum
before any (b) sims run. If the pilot passes GO, (b) is NOT built.

## Substrate (both legs — legs differ ONLY by PARTYFORMFIX)

- `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 WILDAVOID=1 WILDSEEDPLAN=1`
  on BOTH legs. (WILDAVOID=1 is the seed's precondition: the avoid
  branches only fire under it; the seedplan-b arm ran the same pair.)
- WILDSEEDPLAN is NOT on master: it is cherry-picked from the HELD
  branch sim-wildavoid-seedplan-b (commit ba5568812 -> 0838e0142 in
  this worktree, src/js/game.js two avoid call sites + the seedplan-a
  driver/analyzer/proof test). It is staged for MEASUREMENT ONLY and
  is dropped before final delivery (rebase --onto master, dropping
  0838e0142 — the fix touches win-plan.js, villager-objectives.js and
  villager-build.js, none of which the substrate commit touches, so
  the drop is clean). Delivered code = the PARTYFORMFIX change only.
  This mirrors the diag arm's stage-and-revert pattern. The seedplan
  fix itself stays HELD; this arm makes no landing recommendation
  about it. SEEKGATE unset, FIGHTALLY2 unset (as in the seedplan-b arm).
- Policy: competent verbatim (scripts/policies/competent.js).
- Horizon: 150d death-aware (dead villages stop simulating; +10d tail
  max). Never a fixed 200d.
- Driver: scripts/partyform-fix-driver.js (copy of the diag driver +
  richer seed rows + run-end standing fields). Analyzer:
  scripts/analyze-partyform-fix-a.js (with --selftest).
- Panel (§15): scripts/balance-panel.js, `--policies competent`,
  same seeds/days per phase, before = PARTYFORMFIX unset, after =
  PARTYFORMFIX=1, both built from this checkout (substrate present in
  both — the panel isolates the fix flag, the seedplan-b pattern).
  Compare .md attached to the evidence file.

## Seed bands — FRESH (verified before any sim)

- Pilot: 104901–104908 (8 seeds). Confirm: 104911–104922 (12 seeds).
- Freshness check (local_seed_band_freshness skill): grepped EVERY
  dated prereg under evidence/ (1007 files, `evidence/*/sim-*-prereg.md`)
  plus every .md under evidence/ (preregs, screens, analyses,
  band-freeze files) for each of the 20 seed numbers: **0 hits for all
  20**. Two near-misses recorded so the next worker does not repeat
  them: 104801 is USED (sim-partysize4-b-prereg + rerun prereg, 2 hits)
  and 104898 is USED (3 hits) — the first candidate band 104801–104808
  was abandoned on that collision. A full-tree grep over evidence/
  (including JSON corpora) was started and killed as superseded: band
  assignment is governed by preregs, and no corpus can name a seed no
  run ever used.
- No deliberate reuse in this arm: the diag/seedplan bands (104601–
  104608, 104701–104712) are NOT reused — the fix must prove itself on
  fresh ground, not on the villages that diagnosed the shapes.

## Primary metric (binds the run — §14)

Population: WAVE-4 seeded plans. A seed event is one
`winPlanSeedFromFight` call that creates or retargets a plan whose
needWave >= 4 or whose target is a wave-4 species (the W4 frozen list
from src/data/monsters.json). Wave-3 seeds are counted separately as
context only — the seedplan context is wave-4+ (the avoid only fires
there), and the diagnosed shapes are wave-4 holders.

A seeded plan counts as LAUNCHED-WITH-PARTY when the holder's plan
later reaches stage `'hunt'` with `plan.party.length >= 1` (holder +
at least one companion = total party >= 2) before the run ends, the
plan is deleted, or the plan is retargeted to another species. A plan
reaching `'hunt'` with an empty party counts as LAUNCHED-SOLO (the
104705 shape — a launch that is not a party). Reaching neither by run
end counts as STALLED; retarget counts as RETARGETED; deletion counts
as DELETED (with the deletion reason where the driver can see it:
death / leave / succession / table-active).

- PRIMARY: arm launch-with-party rate = launched-with-party /
  seeded wave-4 plans.
- GO requires ALL of: arm rate >= 50% of seeded plans AND arm rate
  >= 2x control rate on identical seeds, with a pool floor of >= 8
  seeded wave-4 plans PER LEG (below the floor the rate is
  unjudgeable — METRIC-BROKEN, not GO and not NO-GO).
- Secondary reads (reported, never re-scored as the primary):
  launched-solo count, stalled count by dominant stall shape
  (pool-empty / range-0-holder / hurt / leaver / scholar-holder),
  fix refusals (scholar / leaver) on the arm leg, plans deleted by
  the LEAVE/mantle cleanups.

## Cost bars (scalemetric — all must pass for GO)

- C1 starvation deaths: arm <= ctl + 2 (band total).
- C2 median survival: arm >= 0.8x ctl.
- C3 community loss (village-lost seeds): arm <= ctl + 1.
- Panel (§15): no `regression_signal` (a `review_required` is an
  investigation note, not a verdict override).

## Pilot gate (frozen)

- Pilot 8 seeds (104901–104908), both legs. Sniff test = the GO bars
  above on the pilot (rate >= 50%, >= 2x ctl, floor >= 8/leg, C1–C3).
- If the pilot FAILS any bar: report NO-GO and STOP. Do not spend the
  confirm. (If the pilot fails ONLY on the (b)-trigger condition —
  pool-empty dominant stall with >= 8 seeds — build (b) under its own
  addendum and re-pilot; do not proceed to confirm on a failed (a).)
- If the pilot PASSES: confirm 12 seeds (104911–104922), both legs,
  judged on the same frozen bars.

## Fixture (local-proof-of-effect skill)

- Sims: no synthetic fixture — full villages under the competent
  policy, the same villages the diagnosis measured. The verdict turns
  on whether seeded plans launch with real parties, not on whether a
  staged fight is winnable.
- Proof test (scripts/test-partyform-fix-a.js): the fixture is a LIVE
  loaded village (seed 104607, the Yuki seed), real roster and real
  gear — no staged gear, no solo scholar. The seed call uses a real
  wave-4 mdef (influencer). The observable effect is the seed's return
  value and the plan's existence/deletion in live game state, with an
  old-code-fails control on every section (PARTYFORMFIX unset = old
  behavior must seed / must keep the plan).
- Analyzer selftest required (scripts/analyze-partyform-fix-a.js
  --selftest) before any sweep runs.

## Wall numbers (reported every run)

National standing (>= 200) / national rank / table / wins / wave-4
unlock / wave-5 unlock / median survival, per leg, from the driver
corpora (run-end standing fields).

## Metric review (filled at evidence time)

- (to be filled in the evidence file; a miss is NO-GO, never
  re-scored against a friendlier metric mid-run.)

## Files

- Prereg: evidence/2026-11-18/sim-partyform-fix-a-prereg.md (this file).
- Fix: src/js/win-plan.js, src/js/villager-objectives.js,
  src/js/villager-build.js (PARTYFORMFIX-gated).
- Instruments: scripts/partyform-fix-driver.js,
  scripts/analyze-partyform-fix-a.js, scripts/test-partyform-fix-a.js.
- Corpora: evidence/2026-11-18/perseed-partyform-fix-a-ctl/ and
  -arm/ (pilot), -confirm-ctl/ and -confirm-arm/ (confirm).
- Analysis: evidence/2026-11-18/partyform-fix-a-analysis.json (+
  -pilot-analysis.json); panels partyform-fix-a-panel-*.json.gz/.md.

## ADDENDUM 1 — instrument correction + pilot re-run (2026-11-19, before any verdict)

The frozen metric, bars, bands, and substrate above are UNCHANGED.
What changed is the instrument, which was found broken during analysis
of the first pilot attempt:

- DRIVER BUG (scripts/partyform-fix-driver.js): the seed-row wrapper
  read the holder's plan AFTER `winPlanSeedFromFight` returned, but
  the function mutates the plan in place (target/needWave/stage).
  The read therefore saw the POST-call state labeled as pre-call:
  true creates and true retargets read back as `existing` (the target
  had already been overwritten to the new beast), and hunt-stage
  no-ops read back as `retargeted` (the old target survived the early
  return). Every seed label in the first attempt is inverted in the
  interesting cases; the pre-call state was never captured and is not
  recoverable from those corpora. FIX: snapshot the pre-call plan
  (existence/target/stage) BEFORE the wrapped call, read the post-call
  plan after it, classify from pre-vs-post, and record live
  `postTarget`/`postStage`/`postNeedWave` on every seed row.
- ANALYZER FIX (scripts/analyze-partyform-fix-a.js): the primary
  population is decided ONLY by the live post-call fields, and only
  TRUE seed events count (created, or a gear/party-stage retarget —
  `isTrueSeedEvent`). Rows without `postTarget` (first-attempt format)
  are LEGACY: unclassifiable for the primary metric, counted
  separately, never derived-from. The band-wide launch census (from
  the daily holderDays snapshot, unaffected by the bug) is added as a
  secondary read. Selftest extended with live-field and legacy cases;
  `SELFTEST ALL PASS` on the corrected analyzer.
- DISPOSITION OF PILOT ATTEMPT 1 (104901–104908, both legs, 2026-11-18
  23:xx–2026-11-19 00:35 UTC): DISCARDED as instrument-broken. It
  produced NO valid primary measurement. Re-analysis with the
  corrected analyzer reports METRIC-BROKEN, pool 0/0, legacy
  unclassifiable 36 ctl / 43 arm (the would-be denominator). The
  corpora are retained under perseed-partyform-fix-a-{ctl,arm}/ for
  the record; the analysis file partyform-fix-a-pilot-analysis.json
  was overwritten by that re-analysis. What SURVIVES from attempt 1
  (does not depend on seed classification): the fix's gate fired —
  18 leaver refusals on the arm leg (0 scholar, 5 Suburb/FLEEREPAIR2),
  against 20 ctl / 21 arm scholar-or-leaver wave>=3 calls; costs
  C1–C3 pass; band-wide first hunts with a party 18 ctl / 26 arm
  (solo 0/0); wall numbers as reported in the re-analysis.
- PILOT RE-RUN: the pilot is re-run on the SAME bands (104901–104908),
  both legs, with the corrected driver, under this same frozen prereg.
  Reuse is not contamination: attempt 1 produced no valid verdict on
  these seeds, so the bands carry no prior measurement. The confirm
  bands (104911–104922) are untouched and remain fresh for the confirm
  if the re-run pilot passes its GO sniff test.
- CROSS-ARM NOTE: the retKind logic came from the seedplan-a/b driver
  family. Seedplan-b's corpora carry no per-call seed rows in this
  shape (they use winPlanStats/v4seeds counters), so the phantom
  question cannot be settled for that arm from its corpora here; its
  owner should re-check whether its "seed works" read rests on the
  same mislabeling. This arm makes no claim about seedplan-b's verdict.
