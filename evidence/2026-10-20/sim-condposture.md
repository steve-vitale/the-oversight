# sim-condposture — SCALE-ONRAMP: the CONDITIONAL wave-5 survival posture (r26)

Arm: `sim-condposture` (oversight-flesh-out-loop, run fleshout-20261020T1215Z,
ARM B, axis scale-onramp; live claim in
hidden_files/lever-claims/fleshout-20261020T1215Z.json, written by the
coordinator before any sims — this worker's arm is named there).
Worktree: ~/workspace/worktrees/sim-condposture. Base SHA: 5b22f9022.
Policy-side only by design (zero src/js), default-OFF gate.

Lineage:
- r24 (evidence/2026-10-14/sim-wave5posture.md): blanket homebound posture —
  NO-GO. Helped fast-dying unlockers (s33 postU 13→32, s44 22→38) but cost
  strong ones (s77 44→22 + national lost, s66 14→7): in strong villages the
  scholar's ranging is load-bearing.
- r25 (evidence/2026-10-14/sim-wave5cond.md): the conditional design itself
  (trailing-30d scholar deaths ≥ 2, stand-down < 2) — KILLED AT PILOT,
  UNMEASURABLE not disproven. Mechanism 10/10 GREEN, selectivity validated
  (fired on weak s77/s88, spared strong s22/s44), sense test passed — but the
  det-test PROVED per-run nondeterminism (same seed+policy diverged
  in-process; per-seed postU swings ~27d > 15d effect bar). Identical-seed
  before/after cannot resolve the outcome through the noise floor.
- Backlog #105 (the claim): engage the homebound posture CONDITIONALLY, only
  when the village is already losing scholars in the post-unlock window.

## THE TRIGGER (declared here, BEFORE any sims — docs/MEASUREMENT.md §14)

After wave-5 unlock latches (`Game.unlockedWave() >= 5`), count scholar
succession events (policy-observable `state.scholar.villagerId` change,
tracked passively from day 1 — no behavior change pre-window or gate-off)
whose death day is AFTER the unlock day:
- ENGAGE the r24 posture verbs when post-unlock scholar deaths in the
  trailing 30 days ≥ 2
- STAND DOWN when the count falls < 2 (deaths age out of the window)
- The trigger is POST-UNLOCK-ANCHORED: pre-unlock attrition can never trip
  it (differs from r25, which evaluated trailing-30d at the latch including
  pre-unlock history).

Why ≥2 (not ≥1): a single scholar death is normal attrition; the pathology
the r24 posture saved was the succession-chain spiral (r24: s33 d86/87/93/93,
s44 d98x2/d119/d124x2). Stated risk: the trigger fires only on villages
that are already bleeding in the window — the r25 verdict showed the layer
is inert pre-window, so the armed/control comparison is honest.

When ENGAGED the verbs are the r24 posture verb-for-verb: travel guard
(monster-active wild tiles declined; haven + adjacent + homeward allowed;
combatExit always passes), proposal pause, walk-home at engage, dusk top-up
feast vs a wave-5 haven threat (honest feast gates + 1.5x buffer, 1/day).
When NOT engaged: pure delegation (ranging continues — the strong-village
path the r24 blanket arm destroyed).

Substrate: leadfeast (FEASTSCALE_R13=1). Honest admission: the claim's
"unlocks reachable" cites 2026-10-14 numbers (plentycost 6/15, w5death 6/9)
on a pre-rebuild tree. Since then: history rebuild (2026-10-16), design call
#4 waveCombatReadiness gate collapsed wave-5 to 0/16 (rebuildaudit 290debe8f),
Steve's 2026-10-18 readiness-bar recalibration re-opened the door (readconfirm
c1a17fd56: wave-4 GO 9/16, scale wall unmoved). Whether wave-5 unlocks AT ALL
on current master under leadfeast is UNMEASURED — hence the gates below.

## Pre-registration (MEASUREMENT.md §§9–12, 14) — written BEFORE any sims

Two measurement gates run BEFORE any layer is built. If either fails, the
arm is killed WITHOUT building the policy file (fast kills are throughput;
rebuilding a layer for an unmeasurable outcome is waste).

- GATE 0 (substrate): leadfeast (FEASTSCALE_R13=1), seeds
  11/22/33/44/55/66/77/88, 180d death-aware, instrument-only. THIN-N RULE:
  if wave-5 unlocks < 2 → UNMEASURABLE → kill per §9, no build, no sweep.
  (The r25 thin-n rule assumed a measurable base; on current master the base
  itself is the question.)
- GATE 1 (noise budget): same 8 seeds × leadfeast, a SECOND pass in the same
  process. Fingerprint per run: {days, endReason, unlockDay5, postUnlockDays,
  scholar-death day list, seat, nationalHeldDays}. GO = all 8 fingerprints
  bit-identical across passes. If ANY diverges, the r25 noise verdict stands
  on current master → the before/after comparison cannot be trusted →
  KILLED-AT-PILOT (UNMEASURABLE, not disproven). No confirm spend.
- If both gates pass → build scripts/policies/condposture.js
  (CONDPOSTURE=1, default OFF), proof test (RED→GREEN, gate-off byte-identical
  delegation, trigger engage/disengage, guard verbs, top-up gates), then the
  8-seed pilot: leadfeast vs condfeast on identical seeds, balanced panel
  (scripts/balance-panel.js) §15.

- ARMS (if gates pass): leadfeast (FEASTSCALE_R13=1, gate off) vs condfeast
  (FEASTSCALE_R13=1, CONDPOSTURE=1).
- HORIZON: 180d death-aware (runDays stops on Game.over / pop zero). Why
  180: wave-5 is a late metric; shorter caps truncate the survivors that
  carry the post-unlock window. WIN-PATH HORIZON 180 is the absolute max.
- PRIMARY: aggregate post-unlock scholar death rate = (sum of post-unlock
  scholar deaths across unlockers) / (sum of postUnlockDays across
  unlockers). GO: armed ≤ 0.8× control. (Rate, not mean days: robust to
  unlock-day shifts; r25's metric-review doubt (2) — the layer changes WHO
  unlocks — is answered by counting deaths per window-day across all
  unlockers rather than conditioning a mean on the unlock set.)
- CO-PRIMARY (the r24 hurt, guarded): strong-seed median post-unlock days
  armed ≥ control − 20%. Strong/weak split DECLARED from the GATE 0 run
  (before any armed sims): unlockers with postU ≥ median postU among
  unlockers = strong; the rest = weak.
- GUARDRAILS: wave-5 unlocks ≥ control; overall median survival within ±10d
  of control; national ≥ control − 2; no new death modes.
- WHAT WOULD KILL IT: substrate gate fails; det-gate fails; condition never
  fires on any unlock seed (precondition kill); PRIMARY missed at pilot
  (no confirm spend); any guardrail breached.
- §14 METRIC BINDING: a miss is NO-GO, never re-scored mid-run. Wrong
  metrics go under "metric review" below.

Instrument: scripts/sweep-condposture-20261020.js (GATE0: leadfeast-only
pass; GATE1: two-pass fingerprint; PILOT: leadfeast/condfeast after gates).
Per-seed JSON: evidence/2026-10-20/condposture-gate0.json (substrate),
evidence/2026-10-20/condposture-gate1.json (noise).

## RESULTS — GATE 0 (substrate): wave-5 unlocks 0/8 → KILLED, no build

Driver: scripts/sweep-condposture-20261020.js (PASSES=1, leadfeast
FEASTSCALE_R13=1, seeds 11/22/33/44/55/66/77/88, 180d death-aware).
8/8 runs completed cleanly (exit 0, ~19 min). Per-seed JSON:
evidence/2026-10-20/condposture-gate0.json; full log
evidence/2026-10-20/condposture-gate0.log.

Per-seed (seed: endDay endReason, maxWave, unlockDay5, national, table, seat):
- s11: d93 village-lost, wave 4, u5 —, nat 1, table 1, lesser@50
- s22: d131 village-lost, wave 4, u5 —, nat 1, table 1, lesser@95
- s33: d117 village-lost, wave 4, u5 —, nat 1, table 1, lesser@50
- s44: d103 village-lost, wave 4, u5 —, nat 1, table 1, lesser@85
- s55: d102 village-lost, wave 4, u5 —, nat 1, table 0, none
- s66: d124 village-lost, wave 4, u5 —, nat 1, table 1, lesser@50
- s77: d115 village-lost, wave 4, u5 —, nat 1, table 1, lesser@80
- s88: d137 village-lost, wave 4, u5 —, nat 1, table 1, lesser@70

WALL NUMBERS (this suite): national 8/8, table 7/8, won 0/8, wave-4 8/8,
wave-5 **0/8**, median survival 117d (max 137d). Standing max totals:
287–362 — the T5 standing bar (200) is met on ALL 8 seeds, yet
`Game.unlockedWave()` never leaves 4. The door is readiness-gated (design
call #4), not standing-gated.

GATE 0 THIN-N RULE: wave-5 unlocks (0) < 2 → **UNMEASURABLE → KILLED per §9.**
No layer built, no sweep, no GATE 1 spend. The trigger stays a declared
design; `scripts/policies/condposture.js` was never created (nothing to
delete per kill protocol). The r25 verdict class (noise-dominated outcome)
was never reached — the conditioning event itself is absent on current
master.

Death causes (all 8 runs): monster/V 231 (67%), villager/V 41, villager/P
71, person/V 3. Starvation: 4 starve-days total across 8 runs — the pantry
is not the wall. The wall face on the leadfeast road is now: villages reach
national, sit the lesser table, bank 287–362 standing, and die to monsters
at the wave-4 cap (93–137d) with the wave-5 door readiness-held.

## Metric review (§14)

§14 honored: the GATE 0 thin-n rule is a pre-registered kill condition —
the arm is NO-GO, not re-scored, no confirm spend, no GATE 1.
(1) The claim's substrate assumption ("unlocks reachable: plentycost 6/15,
w5death 6/9", both 2026-10-14, pre-rebuild tree) is STALE on current
master: 0/8 here. The r25 baseline re-run already showed the base moving
(6/8 → 4/8); the 10-16 history rebuild + design call #4 readiness gate +
10-18 recalibration have since closed the door on these seeds. Any future
wave-5-window arm must re-verify unlocks on current master BEFORE
pre-registering window metrics — the door, not the window, is the wall.
(2) Standing ≥200 on 8/8 with wave stuck at 4: t5Ever is a standing metric,
not an unlock metric. Future arms should treat `Game.unlockedWave() >= 5`
as the only unlock condition and stop citing standing totals as unlock
evidence (the r24/r25 evidence files used t5 standing the same honest way,
but the distinction is now load-bearing).
(3) The trigger design (post-unlock-anchored trailing-30d ≥ 2, stand-down
< 2) is declared and unbuilt. It should NOT be built until an arm first
demonstrates ≥2 wave-5 unlocks on current master on identical seeds — the
r25 mechanism record (10/10 GREEN) already covers the near-identical
rolling design; the only unmeasured delta is the post-unlock anchor.
(4) Design boundary worth naming (from w5death, 84% of post-unlock scholar
deaths AT HAVEN): even when the door reopens, the r24/r25 verb set (wild-
tile travel guard, proposal pause, walk-home, dusk top-up) only touches
the ~16% expedition-risk deaths. The w5death village assessment already
named the real lever surface: Haven siege defense in the post-unlock
window, not expedition caution. A future revival should pair the trigger
with siege verbs or stay killed.

## Village assessment

What the villages looked like: eight competent leadfeast villages that all
climb to national, seven of eight sit the lesser table (days 50–95), bank
287–362 standing — and then the ledger stops. Every run ends
"village-lost" at wave 4 (d93–d137), killed by monsters (67% of deaths),
not by the pantry (4 starve-days across all runs). The table arc completes
on the national road while the wave-5 door stays readiness-held: these
villages are doing everything the scale game asks except the one thing the
readiness bars demand.

Who thrived: everyone, by the old metrics — national 8/8, table 7/8. Who
died: everyone, at the wave-4 cap. What was missing: not food, not
standing, not the table — the readiness bars (armor worn / weapons to hand
/ counters known / living veterans) never fill on these trajectories, so
the wave-5 unlock the r24/r25 posture was built to survive cannot occur.
The blank I filled: measured proof, on current master, that the
conditional-posture question has no conditioning set — the axis's binding
wall on the leadfeast road moved from the post-unlock WINDOW (r24/r25's
world) to the wave-5 DOOR. Blanks documented: none new — the door is the
tracked axis work (w5door-measure, readconfirm, defercensus).

## Sense test (SENSE-TESTING LAW)

No window transcripts exist — no unlocks, so no post-unlock window to
sense-test. The driver's bounded say-capture (post-unlock days only)
correctly captured nothing. The pre-window trajectories were not
sense-read in full (no anomaly in the per-seed lines warranted it); the
honest sense statement is: there is no posture to sense-test because the
posture's world (a wave-5-unlocked village) did not occur in 8 seeds.

## Verdict: KILLED AT GATE 0 (substrate) — UNMEASURABLE, not disproven

Pre-registered kill conditions include the thin-n rule; 0/8 unlocks is a
clean kill by the letter. The mechanism question (does conditional
engagement beat the blanket posture?) is unanswered on current master, and
unanswerable until the wave-5 door reopens on some substrate. Instruments
kept: scripts/sweep-condposture-20261020.js (GATE0/GATE1/PILOT driver),
evidence/2026-10-20/condposture-gate0.json + condposture-gate0.log,
evidence/2026-10-20/sim-condposture.md. No policy file was created; nothing
to delete. Layer count: zero src/js changes, zero new policy files.
