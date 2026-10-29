# build-map preregistration — knower-trace audit + 0-arrivals investigation

Date: 2026-10-29. Arm: MAP GROUNDWORK ONLY (audit + investigation).
No game-code changes are pre-registered, made, or implied by this note.
Base: master `2342b764c` at spawn (worktree `build-map`, branch `build-map`).

## 1. Knower-trace proof (`scripts/test-knower-trace.js`, seeds 7/42/99)

Bars (each seed must pass unless marked otherwise; a SKIP is reported, never
counted as a pass):
- K0 INITIAL: every `otherVillage` starts `generated=false`, `rumored`
  falsy, and `knowsVillage(v)` false.
- K1 GATE HOLDS (link/alliance): `proposeLink` and `proposeAlliance` on an
  unknown village return null AND say the knowledge refusal
  ("don't know them well enough").
- K2 RUMOR IS A GLOBAL FLAG: driving the real `maybeVillageRumor` until it
  fires for a village sets `rumored=true` (+`rumorDay`, +a `scholar.rumors`
  entry) — and at that moment NO per-villager record exists anywhere
  (`state.village.villageKnowledge` / `knownVillages` / `heardVillages`
  all absent; `knowsVillage` takes no knower argument) while the gate
  already passes with no villager named. That combination IS the leak
  demonstration: one anonymous roll ("A traveler") opens the gate for the
  whole village.
- K3 VISIT IS THE SAME CLASS: walking the player (real `travelTo` steps)
  to within 2 tiles of a village and running the real
  `checkVillageProximity` flips `generated` false->true, again with no
  per-knower record. Pass = demonstrated on >=1 seed; a seed where combat
  engages on the walk is a SKIP for K3 on that seed, not a failure.
- K4 PEER BYPASS: `proposeCovenant` on an UNKNOWN village (opinion raised
  to 10+ by the real `_nudgeOpinion` only) must NOT say the knowledge
  refusal — it reaches courtship (form/counter/decline). Any outcome other
  than the knowledge refusal proves peer proposals are not knowledge-gated.
- K5 RAID UNGATED BY DESIGN: `raidVillage` on an unknown, unlinked village
  musters (`pendingRaid` set) or is refused for a non-knowledge reason.
  The code comment already says "Never knowledge-gated" — this bar
  CONFIRMS the documented divergence; it is not scored as a surprise leak.
  SKIP if fewer than 2 fighters muster.
- K6 REGION REGISTRY, SAME CLASS: `hearOfRegion` on a previously unknown
  region sets `known=true` + `heardDay` + `heardWhy` and stores NO knower
  / `toldBy` field.

Verdict rule: the audit FAILS the "traces cleanly" claim if K2 or K3 shows
a gate passing with no knower record (expected: both do). K1 passing does
NOT rescue that verdict — a gate that works for the player but reads as
village knowledge for every NPC consumer is still a leak. No threshold
moves mid-run; no redesign is built here.

## 2. Arrivals investigation (`scripts/investigate-arrivals-20261029.js`)

Panel: establishment seeds 209/228/238/239 (the r44–r52 panel), 60 days
(42-day establishment window + 18 days for any late `arriveDay` to elapse),
competent policy with the r52 day loop shape (upkeep, driveFights,
driveContests, wait, sleep). Wraps are read-only counters (no state
mutation, no RNG consumption) except the separate counterfactual arm.
Two arms, separate processes:
- ARM A (read-only): wrap `considerApplications`, `genApplicant`,
  `acceptApplication`, `villageAutoRecruit`, `arrivalTick`,
  `considerStrangers`, `visitorInteract`; snapshot daily roster length,
  living count, inbox length, pending-arrivals length, visitors, notability,
  housing room.
- ARM B (counterfactual, `ACCEPT_ONE=1`): same run, but accept the first
  pending application once per seed and record its `arriveDay` and whether
  `arrivalTick` later adds that id to the roster.

Bars:
- A1: `acceptApplication` calls = 0 on every seed (the driver/policy never
  accepts — mirrors r44–r52, whose drivers contain no accept call).
- A2: `villageAutoRecruit` never completes an intake on any seed, with the
  roster length at each call recorded (expected: >=8 at every call, so the
  roster<8 gate never opens — consistent with r44–r52 JSONs, minAlive 9–11).
- A3: `arrivalTick` completions = 0 and `visitorInteract` invite calls = 0.
- A4: applications ARE generated on >=1 seed (inbox length >0 at some
  dawn) — this separates "nobody applies" from "nobody is accepted".
  If A4 fails (zero applications on all seeds), the finding becomes
  two-stacked causes and the report says so.
- B1: on >=1 seed, the accepted applicant joins the roster on/after
  `arriveDay` — proving the accept->arrive chain works and the 0 is a
  decision-gate outcome, not a broken arrival.

Verdict rule: 0-arrivals is EXPLAINED (not a game defect) iff A1+A2+A3 hold
and B1 holds. A faucet build is OUT OF SCOPE regardless: any future arrival
must walk in by a perceivable approach, and this investigation only designs
that approach — it does not build it.

## 3. What this arm does NOT do

No `src/` changes. No gate retunes (gating freeze). No interiors, no
leg-village links, no city people layer, no dens, no starting-location
content, no arrival numbers, no walk-home tax, no waves-faced counting.
The ledger design in the final report is a design for the next build
decision, not a built system.
