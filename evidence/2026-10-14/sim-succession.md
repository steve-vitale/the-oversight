# ARM "succession" — the succession-response protocol (scale-onramp) — PENDING

Worktree: `~/workspace/worktrees/sim-succhaircut`. Run: oversight-flesh-out-loop, run 2026-10-14T04:59:18Z, axis scale-onramp. ARM 1 of 3 (coordinator claim: sim-succhaircut, sim-wave5posture, sim-sucfightback).
Base SHA: a6b392b1 (recorded; the r23 coordinator note + inffight GO + renegans KILLED + harnessstop GO are all in-base).
Finding: evidence/2026-10-14/sim-fifthlink.md — the tend-vs-decay race's #1 loser is the succession haircut (-8 per shaken link, -14 on the pressed-tribute variant) on Haven leader deaths. Engine-side: a policy cannot remove it — but it CAN respond to it. The r22 renegans arm answered the #2 loser (unanswered beats, 26/29 answered) and was KILLED on outcomes + guardrails; its evidence proposed this exact followup ("a mourning/grief-management lever").
Commit under test: worktree tip (to be recorded at landing). No game-code changes — policy layer + instruments + evidence only.

## Canon read

- docs/CANON.md (manifest + standing rules), docs/SCALE-DISCOVERY.md (BUILT 2026-10-13 — the ladder's discovery beats; this arm needs no new fiction).
- Engine design (src/js/hierarchy.js, read — not invented): `onLeaderDeath(vid)` is the mantle event (representative or player death → successionCrisis per link); `successionCrisis` applies the -8 haircut + 7-day mourning (no trust gains) on older links, or a staged renegotiation beat (gift 1,500 kcal → +8 / visit → +5 / silence → -6 on 7-day expiry) on young links (<21d); GRIEF COALESCES (already-grieving links take no new haircut); `tendLink` refuses cleanly in mourning (paid=0); every trust gain routes through `_trustGain` (mourning choke + lastKeptDay stamping); `payTribute` covers only links where Haven OWES (no-op on the LEAD road by engine guard). The layer uses only these existing verbs.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14) — written BEFORE any armed sim

- **Question**: does a policy-side succession-response protocol — the new speaker answering staged beats (winseek's honest bar), tending every bond in the 7-day grief window, keeping tribute current — move the scale on-ramp: late-link conversion, 5th-link conversion, Standing?
- **Primary metric**: late-link conversion — lead links forming >= day 60 that reach seasoned, 8 seeds × leadcourt, identical-seed before/after.
- **GO**: [finalized after baseline — see "GO finalization" below; pre-armed-run]
- **Guardrails**: median survival within +-10d of the identical-seed baseline; exiled <= baseline+1; national tracked (no-regression watch).
- **Horizon**: 180d death-aware (harnessstop dead-village tail; dead villages stop simulating).
- **Seeds**: 11/22/33/44/55/66/77/88 × leadcourt (FOURTHLINK=1 both sides; armed adds SUCCPROTO=1).
- **Proof**: `scripts/test-succession-proto-20261014.js` — REAL RED phase (R2: baseline lets a real staged beat expire 24->16->10; R3: mourning refuses tends paid=0), GREEN phase (G2: protocol answers the beat AND tends the young link 16->32; G3: 8-day-old succession does not activate; G4: mourning links skipped silently).

Refinement before the pilot (renegans precedent, documented here before any sim): the brief says "x leadcourt", but plain leadcourt's subs>=3 cap structurally prevents 4th+ links, which would make a late-link/5th-link GO vacuous — a trivially-passing GO is dishonest measurement. Baseline = leadcourt + FOURTHLINK=1 (leadcourt's own courtship, uncapped — the same road the fifthlink and renegans pilots measured), armed = + SUCCPROTO=1. Gate-off the succession module exports fourthlink itself (proof R1).

Metric binding (§14): a miss is NO-GO, never re-scored against a friendlier metric mid-run. Doubts go under "metric review" for the NEXT run.

### GO finalization (baseline measured first — armed run not yet started)

Baseline (FOURTHLINK=1, 7 measurable seeds; s44 UNMEASURABLE — infinite-fight engine stall ~day 60 on the runDays trajectory, documented in sim-findings.md; fifthlink precedent):
`evidence/2026-10-14/sim-succession-base.json`

| seed | days | end | succEvents | beats | lateConv | 5th | Standing | national | wave4 |
|---|---|---|---|---|---|---|---|---|---|
| s11 | 152 | village-lost | 88 | 0/6 | 3 | d52→s94 | 204 | - | d77 |
| s22 | 107 | village-lost | 15 | 0/0 | 0 | - | 102 | - | d57 |
| s33 | 82 | village-lost | 12 | 0/0 | 0 | d37→s66 | 195 | - | d57 |
| s55 | 123 | village-lost | 24 | 0/0 | 0 | - | 127 | - | d77 |
| s66 | 39 | village-lost | 6 | 0/3 | 0 | - | 0 | - | - |
| s77 | 82 | village-lost | 15 | 0/0 | 0 | - | 102 | - | d57 |
| s88 | 129 | village-lost | 12 | 0/4 | 0 | - | 161 | - | d57 |

Baseline aggregates: PRIMARY late-link conversion (formed≥d60, seasoned) = **3** (all on s11; late formed 3/3 converted);
5th-link seasoned 2/7 (2/2 on forming seeds); median survival 107d; exiled 0/7; national 6/7; wave4 6/7; wave5 1/7;
maxStanding 204; medianEndStanding 127. Succession events: 172. Beats presented 13, answered 0.
No lead link broke on any seed — every link with time seasoned. The haircut is absorbed, not fatal, on this tree.

**GO (finalized)**: armed late-link conversion ≥ **5** (baseline 3 + 2, the brief's suggested form).
Why this bar: the lever's theory of change is that answering succession grief preserves trust → more late links
season. If the theory is right, armed must season strictly more late links than the baseline's 3. The metric is
diplomacy-stable across processes (s11's lateConv=3 and 5th-seasoned reproduced in a repeat run; only mortality
metrics swung — the seed-88 nondeterminism item). Secondaries (reported, not binding): beats answered (mechanism),
5th-link conversion, Standing, national/table/wave reach.
**Guardrails**: median survival ≥ 97d (107−10); exiled ≤ 1; national tracked for regression (6/7).

## The layer (scripts/policies/succession.js, SUCCPROTO=1, default OFF) — DELETED per kill protocol

Gate off → exports fourthlink unchanged (inert; proof R1). Gate on → fourthlink.daily + `successionProtocol`, run first each day.
Succession detection is a read-only history scan (no RNG consumed, no wrapping): any live link with a kind:'succession'
note ≤7 days old, or a staged pendingRenegotiation in-window, activates the 7-day grief window. Inside the window:
(a) answer every staged beat with winseek's bar verbatim (`pan > 8000 ? 'gift' : 'visit'`);
(b) tendLink on every live primary-Haven link at the protocol bar (pantry > 8000, tendedWeek-deduped) — mourning links
SKIPPED (the engine refuses; the protocol honors the grief instead of narrating at it);
(c) payTribute where Haven owes and the pantry survives it (owed + 8000 floor) — no-op by engine guard on the LEAD road.
No new verbs; every call is an existing engine path. Proof: `scripts/test-succession-proto-20261014.js` 22/22 green
(REAL RED: baseline lets a staged beat expire 24→16→10; mourning refuses tends paid=0. GREEN: protocol answers the
beat AND tends the young link 16→32; 8-day-old succession does not activate; mourning links skipped silently).

## Results — GO MISSED → KILL

Baseline (FOURTHLINK=1, 7 measurable seeds, `evidence/2026-10-14/sim-succession-base.json`):
- PRIMARY: late-link conversion (formed≥d60, seasoned) **3** (all on s11; late formed 3/3 converted)
- 5th-link seasoned 2/7 (2/2 on forming seeds); median survival 107d; exiled 0/7
- national 6/7; wave4 6/7; wave5 1/7; table 0/7; won 0/7; maxStanding 204; medianEndStanding 127
- 172 succession events; 13 beats presented, 0 answered; zero lead links broke on any seed

Armed (FOURTHLINK=1 SUCCPROTO=1, 7 seeds, `evidence/2026-10-14/sim-succession-armed.json`):
- PRIMARY: late-link conversion **3** (s11: 2, s22: 1; late formed 3) — vs baseline 3
- Mechanism fired: 15/15 beats answered (5 gifts/10 visits mix across seeds), 34 protocol tends, 2 tributes, 101 succession events
- 5th-link seasoned 2/7 (s11 d59→s88, s33 d37→s66 — same two seeds as baseline)
- median survival **87d** (vs 107d); exiled 0/7; national 6/7; wave4 7/7; wave5 1/7; table 0/7; won 0/7
- maxStanding 238 (vs 204); medianEndStanding 136 (vs 127)

Per-seed (base → armed): s11 d152→d124, lateConv 3→2, stand 204→238; s22 d107→d136, lateConv 0→1, stand 102→161;
s33 d82→d82 identical (5th d37→s66 both); s55 d123→d116, stand 127→127; s66 d39→d60 (+21d, 3 beats answered);
s77 d82→d82 identical; s88 d129→d87 (−42d), stand 161→136.

GO verdict (§14 binds):
- PRIMARY 3 ≥ 5? NO → **GO MISSED → KILL.**
- Guardrails: median survival 87d ≥ 97d? NO → **BREACHED** (−20d, limit −10d). exiled 0 ≤ 1 ✓. national 6/7 = baseline ✓.

The mechanism works (15/15 beats answered, 34 tends landed — the protocol does exactly what it was built to do) but
moves no outcome: late-link conversion is 3=3, and the grain/speaker costs correlate with earlier deaths (s88 −42d,
s11 −28d; the renegans lesson — spending during fragile stretches cascades). The baseline's links absorb 172
successions without a single break: the haircut is a real cost that isn't binding on this tree, so answering it has
no conversion headroom. Killed on outcomes, not on sense (same pattern as renegans).

Kill protocol: `scripts/policies/succession.js` DELETED. Proof/sweep/sense/diag scripts + evidence retained as
documentation (fifthlink/renegans precedent). The proof degrades gracefully: RED phase stays fully runnable in-tree,
GREEN info-skips when the layer is absent (verified post-deletion).

## Village assessment

Seven villages on the uncapped LEAD road, each courting 3–8 subordinate villages. What the successions actually do:
leaders die constantly (172 events across 7 baseline seeds — s11 alone buried 88 speakers), every link takes its −8,
and the villages absorb it. No link broke from succession on any seed. The tend rhythm (weekly, +8) already outpaces
the haircut on links the village keeps feeding; the beats that go unanswered (−6 each, 13 across the baseline) are
the only unrecovered losses, and recovering them (+8/+5 answers) doesn't change which links season — only how
comfortable the trust margin is. The villages that die early (s66 d39/d60) die of combat and hunger, not diplomacy;
the villages that live (s11, s88) season every link they form. s22 armed is the protocol's best case: 3 beats
answered, 9 protocol tends, +29d survival, a late link converted, Standing 102→161 — but s88 armed is the mirror:
4 beats answered, 11 tends, −42d survival, Standing 161→136. At n=7 the costs and the RNG cascade dominate any
trust dividend. The diplomacy game is downstream of the mortality game on this horizon — the same verdict the
renegans arm reached, now confirmed for the full succession response.

## SENSE-TESTING (scripts/sense-succession-20261014.js, seed 22, narration on)

The protocol's responses read as coherent village decisions, not robotic clicks:
- The haircut is said aloud with its leverage: "[d75][succession] Emberhold pressed tribute down in Haven's chaos."
- Grief coalescing reads correctly: "[d81][succession] Another death while the link already grieves — the grief is
  priced in; the new speaker inherits the same table." — one funeral doesn't become five.
- The beat answer is the engine's designed fiction with real costs: "[d91][renegotiation] Met grief with grain
  (2,213 kcal, trust +8); the tribute leverage never landed." — the new speaker shows up, the leverage grab is
  explicitly blocked. (The 2,213 whole-unit take vs the advertised 1,500 is the known fifthlink/renegans wrinkle —
  honest per the whole-unit take doctrine, noted not chased.)
- Mourning links are met with silence, not spam: the protocol skips them (proof G4), so no daily "grain waits"
  narration at the grieving.
Every trust move has a named cause. The fiction holds. The lever was killed on outcomes, not on sense.

## Blanks filled / documented

- **Measured** (not chased): the succession-response protocol is now quantified end to end — proof 22/22 in-engine,
  7-seed pilot with 15/15 beats answered and 34 protocol tends. Race loser #1 (succession haircuts) is real (172
  events on 7 baseline seeds) but not binding: zero links broke from succession, so answering the haircut has no
  conversion headroom on this tree.
- **Documented** (sim-findings.md): (1) the s44 infinite fight recurs post-inffight-fix — different encounter, same
  "whiff forever" class; s44 unmeasurable on the runDays trajectory (fifthlink precedent); (2) the seed-88-class
  nondeterminism item already covers the s11 cross-process swing (d132→d152) — diplomacy metrics reproduced,
  mortality metrics didn't.
- **Candidate for a future arm** (not this run — §14: revisions apply to the NEXT run): the succession arm's theory
  of change needs a tree where successions actually break links. If a future tree (or a harsher policy) shows links
  snapping under successions, this protocol's instruments are reusable — the proof and sweep degrade gracefully and
  the layer can be rebuilt from the evidence spec.

## Metric review (§14)

GO missed: armed 3 vs ≥5 required. Per §14 this is NO-GO, not re-scored — the layer is killed. Guardrail
independently breached (median −20d, limit −10d).

The metric design held up: late-link conversion is diplomacy-stable across processes (s11 reproduced lateConv=3 and
5th-seasoned on a repeat run) and directly measures the lever's theory of change. The lesson is substantive, not
calibration: the theory was wrong — succession haircuts don't prevent seasoning here (0 breaks / 172 events), and
late formation is courtship-driven, which the protocol doesn't touch. No metric revision proposed: on a tree where
successions break links, this GO would be the right one.

Honest counterpoint recorded: s22 armed (+29d, 0→1 late conversion, +59 Standing) is the protocol working as
designed on one seed — but s88 armed (−42d) is the same mechanism's cost, and at n=7 the net is 3=3 with a survival
regression. Killing is the honest call.

## Telemetry deviation check (scripts/telemetry-check.js)

- Armed flat aggregate (`evidence/2026-10-14/sim-succession-flat-armed.json`) vs
  `hidden_files/telemetry-baselines/scale-wall.json`: **quiet** (1 file, 4 metrics, no large deviations —
  national 6 vs 8, table/wins/exiled identical).
- Verdict: no same-run anomaly. **Baseline NOT rolled forward** — the arm is killed; the scale-wall baseline tracks
  the wall across runs and must not absorb a killed arm's numbers (renegans precedent).

## Wall numbers (every run)

| | national | table | wins | wave-4 | wave-5 | maxStanding | medianSurv | exiled |
|---|---|---|---|---|---|---|---|---|
| baseline (7) | 6/7 | 0/7 | 0/7 | 6/7 | 1/7 | 204 | 107d | 0/7 |
| armed (7) | 6/7 | 0/7 | 0/7 | 7/7 | 1/7 | 238 | 87d | 0/7 |

s44 unmeasurable both sides (engine infinite-fight stall ~day 60, filed in sim-findings.md). No run reached the
table or a win. The scale wall stands: waves 4–5 unlock on 6–7/7 seeds, national on 6/7, table 0/7, wins 0/7.
