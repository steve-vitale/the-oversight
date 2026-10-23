# Run fleshout-20261023T1015Z — ADOPTION/LANDING run (axis scale-onramp)

**Run type:** adoption + landing. NO new sims were run by this coordinator — the dead
0815Z run's three arms were complete (workers finished; two arms committed by workers,
all three landed). This run verified, reconciled, and closed out.

**Scheduled:** 2026-10-23 05:15:39 CDT (10:15:39Z). Coordinator start ~10:42Z.

## Concurrency / stale-lock recovery

- Lock at start: `fleshout-20261023T0815Z`, created 2026-10-23T08:43:11Z — 119 min
  stale (>90 min fallback). Registry showed NO tree with run_id 0815Z; arm-tree
  heartbeats 48–116 min stale (materialsinflow 09:54:04Z, defer5gate/havencontact
  08:46:00Z). Per the guard: previous run DEAD. Lock deleted, dead claim marked
  .DEAD, own claim `fleshout-20261023T1015Z.json` written before any work, own lock
  created.
- **Live-actor observation:** at 10:43:40Z and 10:43:53Z — ~60s after this run
  deleted the stale lock — a live actor ff-merged `sim-defer5gate` (4ecfc1337)
  and `sim-havencontact` (1ef52b2f3) into master, then at ~10:45–10:52Z committed
  the materialsinflow arm as `ecc2ab5fc` (KILLED with teeth, evidence-only,
  policy deleted) and ff-merged it. The merges were ff-clean and matched the
  dead run's plan exactly. This run did NOT re-merge; it verified the landed
  state independently (proofs re-run on master — see below).
- The live actor also deleted this run's lock at some point during the
  ~10:55Z service restart (lock recreated 11:02Z for closeout). No tracker
  update and no 0815Z run-evidence file were written by the actor — the
  closeout (this file + tracker update) falls to this run.

## Arms (all three adopted from dead run fleshout-20261023T0815Z)

### Arm 1 — sim-materialsinflow → commit ecc2ab5fc — KILLED WITH TEETH (evidence-only)
- Backlog #834 (communal materials inflow). 32 configs (seeds 67701–67708 ×
  {leadfeast,belongfeast} × {control,armed}), 180d death-aware, SEATDRIVE=0,
  ARMORYDRIVE=1 + ARMORVILLAGE=1 pinned both arms.
- Binding primary: armor craft beats ≥1 on ≥2/8 armed seeds → **0/8 armed
  (0/8 control): NO-GO with teeth.** Mechanism PROVEN (proof 18/18 GREEN):
  the scholar's-hands stash channel fires (donations 6/16 armed configs;
  bark 17, vine 11 hauled); pile precondition (bark≥3 AND vine≥2) on 1/16;
  craft attempts 0/16. Root cause: the craft beat's knowledge gate (villager
  *wearing* bark/hide armor) and the materials precondition form on DISJOINT
  day-sets — villagers upgrade out of the demonstrating low-tier armor before
  the scholar's trickle fills the pile; vine is the binding material
  (reserve-2 chokes 1-unit arrivals). No policy-side lever can fix the
  conjunction — it is game-side.
- Guardrails all PASS (survival 135.5→141.0d, starvation 9→7, pantry −0.7%,
  no new death modes, wave4/5/national unchanged). Sense PASS.
- **Landing override (recorded, not re-litigated):** the worker's evidence
  recommended landing as a measured NO-GO layer (armorvillage-b precedent:
  proven, env-gated default-off, harmless — the supply half ready for a
  future game-side conjunction fix). The landing went KILLED with teeth:
  policy/sweep/test scripts DELETED per kill protocol; evidence .md + 32
  per-seed JSONs retained on master. Rationale in the commit: the craft
  outcome is unreachable policy-side until the game-side conjunction is
  fixed — the lever *as a craft-enabler* is the wrong lever, root-caused,
  not a missed bar. Kill-discipline tension noted honestly: if #835's
  conjunction is ever fixed game-side, the supply half must be rebuilt.
  Steve can overrule either way.
- Findings: #834 updated (answered+measured+killed); #835 filed (the
  knowledge/materials conjunction blank — open, game-side).

### Arm 2 — sim-defer5gate → commit 4ecfc1337 — DIAG-GO (24/24, 0 unexplained)
- Pure re-analysis of the sim-w5door-b census corpus (24 configs, seeds
  65511–65522, anchor f5f19667ce19); instrument-only, zero src/js.
- **The defer5 gate, named bar-by-bar:** `Game.villageStandingTotal()`
  (standing.js:184) holds the gated total at 199 until
  `waveCombatReadiness(5)` is ALL FOUR bars simultaneously — 4 fighters
  armored@P≥15 (worn), 6 armed, 3 counters, **2 LIVING wave-4+ killers**.
  No timer, no partial credit; the peak ratchet grandfathers release.
  Classification: **capability + retention gate**, not pacing, not kill-bar.
- Bindings: {defer5:16, w3rung:2, plenty-cap:2, stand-raw:3, defer4:1}.
  VETERANS is the universal binder (16/16 short at end-of-run; only 1/16
  ever had 2 living veterans at once, decayed to 0); ARMOR the co-binder.
  **Coincidence trap:** 0 days across 16/16 configs where armor AND veterans
  were both met. First fire median d65 (range d57–141); everReady=false all
  16. TRICKS never binds (knowledge is free).
- Named next: veterans-retention DIAG+BUILD — autopsy what kills the
  wave-4 killers; Steve's call whether the living-only veterans bar is
  intended fiction or the decay is the bug (VETSHAPE=1 exists, default OFF).
- Proof: scripts/test-defer5gate.js **ALL GATES GREEN** — re-verified by
  this run on current master (post journey-landing r39).
- Finding #837 filed (attribution note: evidence header mislabels the run
  0713Z; the arm ran under 0815Z).

### Arm 3 — sim-havencontact → commit 1ef52b2f3 — DIAG-GO
- 16-config census (seeds 65801–65808 × {leadfeast,belongfeast}, 2323
  village-days, anchor 98f5f22c3); instrument-only, zero src/js. Claims
  #831's proposed next.
- **66/66 (100%) wave-4+ player fights attributed** (bar ≥95%): origin
  shares {feastdraw:12, **havencontact:53**, field:1}. Havencontact =
  checkEncounter contact at the haven tile = **80.3% of wave-4+ player
  exposure (2.28/100vd)**; ≤85% raid-shadow (unmet raiders bumped the
  morning after), ~15% true-ambient.
- **48/53 havencontact fights happened DURING an active muster.**
  Code-grounded: shelter.js `shelterEveryoneBut` always excludes the
  scholar — the muster detects the threat correctly and shelters the
  village, but **the mantle-holder walks into the contact channel anyway**.
  5/6 in-scope veteran wave-4 deaths are scholars in havencontact
  (0.22/100vd). Named missing lever: **THE SCHOLAR'S HAVEN DEFENSE**
  (Steve's design call).
- Sense PASS with notes (raid-shadow reads as the morning after;
  true-ambient as walking into it; deaths land with weight; mantle passes
  in-beat; robotic notes: strike-line spam, verbatim "rattled" repeats).
- Proof: scripts/test-havencontact.js **31/31 GREEN** — re-verified by
  this run on current master.
- Finding #831 updated (instrument half ANSWERED; the design call stays open).

## Wall numbers (this run's corpora)

| corpus | n | national | table | wins | wave4 | wave5 | median surv |
|---|---|---|---|---|---|---|---|
| materialsinflow (both arms) | 32 | 16/16 | 0 | 0 | 15/16 | 2/16 | 135.5→141.0d |
| havencontact census | 16 | 8/16 | 0/16 | 0/16 | 11/16 | 0/16 | 173d |
| defer5gate (w5door census, inherited) | 24 | 12/24 | 15/24 | 0/24 | 20/24 | 0/24 | 155d |

scale-onramp stays **converging (NOT converged)**: the wave-5 door's
mechanism is now fully named (defer5 = capability+retention gate, veterans
universal binder, coincidence trap quantified at 0/16 co-satisfaction);
the dominant wave-4 player exposure channel is named and measured
(havencontact 80.3%) with the coverage gap identified (muster excludes the
scholar); the armor-craft conjunction is proven disjoint (game-side blank
#835). No lever landed this run changes the wall — two DIAGs and one kill.
Directive lift remains a Steve call.

## Village assessment (from the corpora)

- The villages in these corpora are competent survivors (median 135–173d,
  national 8–16/16 on the pre-seat substrate) that die at the scale wall,
  not in the dirt: the defer5gate census shows villages walking up to the
  wave-5 door around day 65 and never walking through — geared for a smaller
  war while the gate demands a bigger one.
- Villagers act like people in the havencontact transcripts: Aroha binds a
  wound mid-fight, Greta squares up to watch, Rahmat calls targets, Sofia
  joins the party after a death ("Someone should watch your back. Might as
  well be me."). Deaths land with weight (mantle passes in-beat, the
  village stops, links shake). Robotic residue: strike-line spam and
  verbatim repeated lines ("The village is rattled").
- The materialsinflow sense run: the scholar hauling bark to the workbench
  reads as deliberate and owned ("Set 4 bark strips in the village stash.
  The pile grows.") — the channel was fictionally sound; its death is
  mechanical, not fictional.

## Blanks filled / documented

- FILLED: defer5 gate mechanism named bar-by-bar + coincidence trap measured
  (#837); havencontact as a named, proven origin class (#831 instrument half).
- DOCUMENTED: armor-craft knowledge/materials conjunction blank, game-side
  (#835, open); the scholar's haven defense design call (#831, open,
  steve-call); veterans-retention named next (#837, open).
- KILLED with teeth: materialsinflow policy (evidence-only landing).

## Metric review (§14)

- No new sims were run by this coordinator, so no new pre-registration was
  needed. The adopted arms were judged against their own pre-registered
  headers (all present in their evidence files): materialsinflow NO-GO on
  the binding primary (0/8 vs ≥2/8) — honored, not re-scored; defer5gate
  DIAG-GO (24/24 ≥ 22/24, 0 unexplained); havencontact DIAG-GO (all five
  bars delivered).
- Metric note carried forward: the materialsinflow primary conflated three
  legs (inflow fills pile × craft attempts × craft succeeds); a future arm
  on #835 should pre-register each leg separately.

## Telemetry deviation check (§10)

`telemetry-check.js` vs `telemetry-baselines/scale-wall.json`, metrics
national,table,wins,exiled, on all three corpora:
- materialsinflow armed (n=16): 2 LOUD (table 16→0, wins 16→0)
- materialsinflow control (n=16): 2 LOUD (table 16→0, wins 16→0)
- havencontact census (n=16): 2 LOUD (table 16→0, wins 16→0)
- **Verdict: all REGIME artifacts.** The baseline is the winseat full-stack
  baseline; these corpora run the pre-seat substrate (SEATDRIVE=0) where
  table/wins are structurally 0 — the baseline's own _regime block forbids
  the comparison. National did not deviate (16/16 armed+control). Baseline
  NOT rolled. The two DIAG arms are instrument-only (zero src/js); the
  killed arm leaves zero game-code trace — no broad-balance footprint is
  possible.

## Infra / process notes

- Stale-lock recovery per protocol (119-min-stale lock, no live heartbeat).
  A live actor landed all three arms at 10:43–10:52Z after the lock
  deletion; its merges were ff-clean and plan-faithful. This run verified
  rather than re-landed.
- safe-commit.sh index-clobber: not observed this run (no commits made by
  this coordinator).
- Master moved 1× during closeout (journey-landing r39, 751ade579,
  [needs-eyes] — another loop's work; proofs re-verified after it).
- Main tree clean at closeout. Registry: 3 arm trees released/removed
  (all branches fully merged).
- Loop B live throughout on food-economy (claim
  fleshout-loop-b-20261023T0830Z.json; sim-plentydepri-confirm-b processes
  active) — zero file overlap; not touched.
