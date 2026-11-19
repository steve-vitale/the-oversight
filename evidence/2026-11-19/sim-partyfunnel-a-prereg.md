# sim-partyfunnel-a — frozen prereg (finding #2547 family)

- Arm: `sim-partyfunnel-a` (Loop A, run fleshout-20261119T0615Z, axis scale-onramp)
- Fix: the party-formation funnel AFTER seeding — the plan survives its
  holder's death via reassignment, and a retarget holds a staged party.
- Status: **FROZEN before any sims** (2026-11-19). No sim has run under this prereg.
- Base: master b76d65445 + substrate merge 64b0fb1a6 (HELD sim-partyform-fix-a
  tip, see Substrate).
- Canon read: docs/CANON.md, docs/PARTY.md, docs/MONSTER-WAVES.md (wave-4
  gate: standing >= 100; wave-4 bands; the hunt plan is the village's
  re-engagement after a lived fight). No canon doc covers party formation
  for seeded plans specifically; the win-plan rules live in
  src/js/win-plan.js's header ontology comment (winplan_ordered_stages,
  winplan_perception_only, winplan_no_second_join). Nothing invented.
- Evidence read: evidence/2026-11-18/sim-partyform-diag-a.md (four shapes
  #2560 leaver, #2561 ranger-gated pool, #2562 range-0 holder, #2563
  scholar-holder frozen away entry),
  evidence/2026-11-18/sim-partyform-fix-a.md (phase (a) pilot re-run NO-GO:
  launch-with-party 8/22 = 0.364 vs control 5/19 = 0.263, bar >= 0.50 AND
  >= 2x control; phase (b) NOT triggered — pool-empty tied, not dominant).
- Skills read: ~/workspace/custom-skills/local_seed_band_freshness/
  SKILL.md, ~/workspace/custom-skills/local-proof-of-effect/SKILL.md.

## The design call (mine, Steve can overrule — 2026-10-07)

The phase-(a) pilot re-run loses its seeded plans in exactly two places,
and both are AFTER the seed gate (which works: 18 leaver refusals, 0
scholar-held plans seeded):

- **8 of 22 arm plans DELETED, all 8 with detail "holder died"**
  (arm per-seed outcomes: 104902 sigrun_eiriksdottir d80, visjoin_112 d132;
  104903 app_mgpspkh4623 d118; 104904 app_mgpsphte278 d94, grace_obi d95;
  104906 app_mgpspjxi90 d96, emma_larsen d96, nikos_papadopoulos d144).
  The plan dies with its holder — `winPlanOnVillagerDeath` deletes the
  entry. The hunt was the village's, not the holder's: the village heard
  the beast, geared for it, and lost the one person carrying the plan.
- **4 of 22 arm plans RETARGETED** — the same holder's plan flip-flops
  between species every time they flee something new (ctl 104903:
  visjoin_123 reunion d125 → algorithm d127 → reunion d144 → algorithm
  d146, never launching, ending stalled as a leaver; arm 104906: nikos
  influencer → congregation → nielsen, then died). A plan that keeps
  changing its target never commits to a hunt.

**PRIMARY mechanism — holder-death reassignment (8/22, the dominant loss).**
When a plan holder dies, a pre-kill plan (stage 'gear', 'party', or
'hunt') passes to a living successor instead of being deleted.
Standing/table-stage plans are NOT reassigned — the kill is banked, the
achievement belongs to the dead holder. Successor pick, in order:

1. A living party member (plan.party, alive, not the scholar, holding
   either no plan or the same-target 'hunt' copy — never someone whose
   own hunt is banked at 'standing'/'table' or aimed at another beast).
   They are already on the hunt. The plan keeps target/needWave/node,
   stays 'hunt', party = remaining living members minus the new holder;
   the other living members' copies are re-pointed at the new holder.
   sinceDay resets to today (a fresh clock for the new holder).
2. Else the best living Haven successor from the shared
   `extraCompanionScan` pool (Haven-idle, trust >= 15, not sick,
   range >= 1, not engaged/away/on-expedition, tier-ranked: wave-3+
   killers, then armed, then the rest) — the same "who can go" bars the
   second/third-companion picks already use. A Haven successor re-forms
   the hunt: stage recomputed from their gear (armed+armored → 'party',
   else 'gear'), party cleared, target/needWave/node kept, sinceDay =
   today. Up to 3 picks are tried; a pick holding a different-target or
   banked plan is skipped, never overwritten. The scan's own needWave
   >= 4 gate means the Haven leg is wave-4-only; a wave-3 plan with no
   living party member still deletes (old behavior preserved for it).
3. No eligible successor → delete as before (counted as
   reassign-no-successor, not silently).

Fiction: the hunt outlives its holder. A villager who dies on the trail
is mourned; the village does not forget the beast. The mechanism is
uniform — no wave special-casing beyond the shared scan's own gate —
and it hooks the ONE death choke point: `winPlanOnVillagerDeath`
(called by betrayal.js `removeVillager` 'killed'/'ambushed' and by
game.js `tbVillagerFalls`; the phoenix early-return still keeps a held
death's plan). Stat: `winPlanStats.planReassigned`.

**SECONDARY mechanism — retarget hold (4/22 churn).** In
`winPlanSeedFromFight`, a plan already at stage 'party' WITH a target
does not retarget: the call returns the plan unchanged, exactly like
the existing 'hunt'-stage early return. The village has geared up for
THIS hunt; a new scare does not change it. A 'gear'-stage plan still
retargets (its target is provisional while gearing), and a targetless
'party'-stage plan still retargets (HavenTick engagement seeding creates
target-null plans; the hold must never strand one targetless — the
guard is `plan.target != null`). The plan can still advance (launch →
hunt → kill → standing), die with the holder (→ reassignment), or be
deleted by leave/succession/table. Observable: seed rows with retKind
' existing' on a 'party'-stage plan for a different beast = the hold
firing (counted as `retargetHolds` by the analyzer; the control leg
should read ~0 by construction).

**NOT built, and why.** Findings #2561 (widen `findCompanion` beyond
ranger profiles) and #2562 (score the holder's range at staging) stay
unbuilt: the phase-(b) trigger was NOT met (pool-empty 1 of 2 stalled
plans on the arm leg, tied with range-0-holder, not dominant), and
neither shape binds the pilot's losses (1 stalled plan each). The
measured losses are death (8) and churn (4); this arm attacks those two
and nothing else. #2561/#2562 stay open for a later run.

**Arithmetic the bar has to clear.** Control expectation ≈ fix-a
control 0.263 (5/19). The arm needs >= 0.50 AND >= 2x control
(>= 0.526 on a 0.263 control). Recovering HALF the 8 dead-holder plans
into launches takes the arm from 8/22 (0.364) to ~12/22 (0.545) — past
both halves of the bar, with the retarget hold as the margin. Recovering
fewer than ~4 is a NO-GO on the numbers as frozen.

## Substrate (both legs — legs differ ONLY by PARTYFUNNEL)

- `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1` on BOTH legs.
- PARTYFORMFIX unset on BOTH legs (the phase-(a) code is present via
  the substrate merge but OFF): the control is the fix-a control
  (~0.263), and the arm measures the funnel mechanism ALONE, not
  (a)+(b) combined. Turning PARTYFORMFIX on in the arm would conflate
  two mechanisms under one flag. The (a) fix stays HELD; this arm
  makes no landing recommendation about it.
- WILDSEEDPLAN unset and WILDAVOID unset on BOTH legs (the substrate
  merge also brings the WILDSEEDPLAN call sites in game.js, OFF).
  Seeds still flow without them: `winPlanSeedFromFight` is called
  unconditionally from villager-agency.js on 'evaded'/'fled' outcomes
  and from game.js on vFlee under VETREENGAGE. The pilot pool floor
  (>= 8/leg) is the check that the pool actually forms; if it does
  not, the verdict is METRIC-BROKEN, not GO/NO-GO.
- Substrate merge: HELD branch sim-partyform-fix-a tip 1ede7d6d7,
  merged as 64b0fb1a6. NEVER LANDS — only this arm's own commits land.
  It brings the PARTYFORMFIX code, the WILDSEEDPLAN call sites, and the
  corrected partyform instruments (driver/analyzer/proof test/panel
  builder) to clone from.
- Policy: competent verbatim (scripts/policies/competent.js).
- Horizon: 150d death-aware (dead villages stop simulating; +10d tail
  max). Never a fixed 200d.
- Driver: scripts/partyfunnel-driver.js (clone of partyform-fix-driver
  + `winPlanOnVillagerDeath` wrap recording reassignment rows).
  Analyzer: scripts/analyze-partyfunnel-a.js (clone of
  analyze-partyform-fix-a + reassignment-chain following + retargetHolds
  count + reassigned aggregates). Panel builder:
  scripts/build-partyfunnel-panels-a.js (clone of the fix-a builder).
- Panel (§15): scripts/balance-panel.js, `--policies competent`,
  same seeds/days per phase, before = PARTYFUNNEL unset, after =
  PARTYFUNNEL=1, both built from this checkout (substrate present in
  both — the panel isolates the funnel flag, the fix-a pattern).
  Compare .md attached to the evidence file.

## Seed bands — FRESH (verified before any sim)

- Pilot: 105701–105708 (8 seeds). Confirm: 105711–105722 (12 seeds).
- Freshness check (local_seed_band_freshness skill): grepped EVERY
  dated prereg under evidence/ (`evidence/*/sim-*-prereg.md`) for each
  of the 20 seed numbers: **0 hits for all 20**. A broad grep over
  every .md under evidence/ for the same 20 numbers: **0 hits**.
  Near-misses recorded so the next worker does not repeat them:
  105301, 105401, 105501 are USED (each named in 4 preregs:
  sim-carriersetup-b, sim-fieldcarrier-confirm-a, sim-partysize4-b,
  sim-partysize4-rerun-b) — the first three candidate bands were
  abandoned on those collisions. 105601 appears ONLY as a timestamp
  substring inside run id `loop2-20261114T105601Z` (journey-crisis-r201
  prereg + evidence) — not a seed number; recorded here as a
  false-positive, not a reservation. Bands already used (per the task
  brief): 104601-104608, 104901-104908, 104911-104926, 104931-104938,
  104941-104956, 105201-105208.

## Primary metric (binds the run — §14)

Population: WAVE-4 seeded plans, same definition as partyform-fix-a.
A seed event is one `winPlanSeedFromFight` call that creates or
retargets a plan whose post-call target/needWave is wave-4 (the W4
frozen list from src/data/monsters.json). A seeded plan counts as
LAUNCHED-WITH-PARTY when the plan later reaches stage `'hunt'` with
`plan.party.length >= 1` before the run ends, the plan is deleted, or
the plan is retargeted to another species — FOLLOWING the plan across
holder reassignments (a plan that moves from a dead holder to a living
successor and then launches counts as launched-with-party, with
`reassigned: true` on the outcome). A plan reaching `'hunt'` with an
empty party counts as LAUNCHED-SOLO. Reaching neither by run end
counts as STALLED; retarget counts as RETARGETED; deletion with no
reassignment counts as DELETED (with the deletion reason where the
driver can see it: death / leave / succession / table-active).

- PRIMARY: arm launch-with-party rate = launched-with-party /
  seeded wave-4 plans.
- GO requires ALL of: arm rate >= 50% of seeded plans AND arm rate
  >= 2x control rate on identical seeds, with a pool floor of >= 8
  seeded wave-4 plans PER LEG (below the floor the rate is
  unjudgeable — METRIC-BROKEN, not GO and not NO-GO).
- Secondary reads (reported, never re-scored as the primary):
  launched-solo count, stalled count by dominant stall shape,
  reassigned plans (count, of which launched-with-party, by via:
  party-member vs haven-successor), reassign-no-successor count,
  retargetHolds count (arm vs ctl), fix refusals n/a (PARTYFORMFIX
  off on both legs — the gate is not the mechanism here).

## Cost bars (all must pass for GO)

- C1 starvation deaths: arm <= ctl + 2 (band total).
- C2 median survival: arm >= 0.8x ctl.
- C3 community loss (village-lost seeds): arm <= ctl + 1 (the brief's
  "control+0.125" rate form — identical on 8 seeds).
- Panel (§15): no `regression_signal` (a `review_required` is an
  investigation note, not a verdict override).

## Pilot gate (frozen)

- Pilot 8 seeds (105701–105708), both legs. Sniff test = the GO bars
  above on the pilot (rate >= 50%, >= 2x ctl, floor >= 8/leg, C1–C3).
- If the pilot FAILS any bar: report NO-GO and STOP. Do not spend the
  confirm.
- If the pilot PASSES: confirm 12 seeds (105711–105722), both legs,
  judged on the same frozen bars.

## Fixture (local-proof-of-effect skill)

- Sims: no synthetic fixture — full villages under the competent
  policy, the same villages the diagnosis measured. The verdict turns
  on whether seeded plans launch with real parties, not on whether a
  staged fight is winnable.
- Proof test (scripts/test-partyfunnel-a.js): the fixture is a LIVE
  loaded village (seed 104607, the Yuki seed), real roster and real
  gear — no staged gear, no solo scholar. Every section has an
  old-code-fails control (PARTYFUNNEL unset = old behavior must delete
  / must retarget). Sections: §1 holder death reassigns a 'party'-stage
  plan to a Haven successor (flag ON -> plan lives under the successor
  with the same target; flag OFF -> plan deleted); §2 holder death
  mid-hunt reassigns to a living party member (flag ON -> plan stays
  'hunt' under the member with the remaining party; flag OFF ->
  deleted); §3 standing-stage plan still deletes on holder death
  (flag ON -> deleted, the banked kill does not transfer); §4 a
  'party'-stage plan with a target does not retarget (flag ON -> same
  target after a seed for another beast; flag OFF -> retargeted);
  §5 a targetless 'party'-stage plan still retargets (flag ON ->
  acquires the new target); §6 a 'gear'-stage plan still retargets
  (flag ON -> retargeted).
- Analyzer selftest required (scripts/analyze-partyfunnel-a.js
  --selftest) before any sweep runs, extended with reassignment-chain
  cases (reassigned-then-launches, reassigned-then-deleted,
  reassigned-then-retargeted, retargetHolds counting).

## Wall numbers (reported every run)

National standing (>= 200) / national rank / table / wins / wave-4
unlock / wave-5 unlock / median survival, per leg, from the driver
corpora (run-end standing fields).

## Metric review (filled at evidence time)

- (to be filled in the evidence file; a miss is NO-GO, never
  re-scored against a friendlier metric mid-run.)

## Files

- Prereg: evidence/2026-11-19/sim-partyfunnel-a-prereg.md (this file).
- Fix: src/js/win-plan.js (PARTYFUNNEL-gated).
- Instruments: scripts/partyfunnel-driver.js,
  scripts/analyze-partyfunnel-a.js, scripts/test-partyfunnel-a.js,
  scripts/build-partyfunnel-panels-a.js.
- Corpora: evidence/2026-11-19/perseed-partyfunnel-a-ctl/ and
  -arm/ (pilot), -confirm-ctl/ and -confirm-arm/ (confirm).
- Analysis: evidence/2026-11-19/partyfunnel-a-analysis.json (+
  -pilot-analysis.json); panels partyfunnel-a-panel-*.json.gz/.md.
