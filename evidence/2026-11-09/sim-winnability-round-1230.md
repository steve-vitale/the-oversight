# sim-winnability-round-1230 — Loop B 1230Z (ADOPTION CLOSEOUT)

**Run:** fleshout-loop-b-20261109T1230Z (Loop B) · **Axis:** scale-onramp / winnability chain (converging, NOT converged) · **Base master:** `5e79679e4` (moved during the run; branches rebased onto explicit SHAs) · **Coordinator:** died mid-closeout. This file is written by the adoption run fleshout-loop-b-20261109T1330Z (stale-lock recovery: B lock 2h old, takeseat tree heartbeat 89m stale, no tree writes since 13:30Z; e18f + prefloor already landed on master, takeseat-repin-b merged ff-only by the adoption run as `04d0bac8c`).

## Arms (all 3 landed, merged locally pending ship)

### Arm 1 — sim-e18f-beforeafter-b: e18f72dce EXONERATED (DIAG, zero src/js)

Commits: prereg `5fdfa90dd`, work `a3ba1d22c`. Proof 52/52. On seed 53007, L0+L1 both read NEW; the food.js specialist rung authors only the d17–d20 MIDDLE opening. The NEW→MIDDLE step is NOT e18f. Remaining suspects: b98ac0730 (conversation.js secret-response), e3ef2b612 (villager-agency.js place-line). Evidence: evidence/2026-11-09/sim-e18f-beforeafter-b.md. Backlog item marked fixed by the adoption run.

### Arm 2 — sim-prefloor-deaths-b: DIAG-GO — pre-floor deaths wild 76.6%, lever named

Commits: prereg `c6e374624`, driver + analyzer + proof `c541f85f2` (55/55), evidence `01540e4c5` (proof 86/86). Fresh band 55201–55212, 150d death-aware, winseek leg + doorwalk baseline leg, both gates OFF.

**The verdict:** pre-day-90 deaths under winseek are wild — 118 of 154 (76.6%) — and they are, one for one, the scholar dying in lost field fights walked into alone: 107 lost fights, 90 of them solo, and every lost fight kills the scholar (107/107). The village does not bleed its people in the wild; it is decapitated, over and over — 112 scholar deaths across 12 seeds (5–13 per village). The party system is unlocked (860/921 daily rows) but present only 97/921 rows (10%), against 933/1324 (70%) on the doorwalk leg, where fights are won 169–76. Sickness-disease is the runner-up (23/154, 14.9%), led by `a wound that wouldn't close` (14). Starvation is 6/154 (3.9%) — food is NOT the binding pre-floor killer on this band.

**Named lever (not built here): PARTY-UP BEFORE FIELD FIGHTS.** Winseek must bring a party to field fights — or not engage wave-3+ fights solo. Prereg shape for the next arm: same recorder, fresh band (55201–55212 is burned by this arm — do NOT reuse), winseek + party-up drive; GO = pre-90 wild deaths ≤ 0.6× control (118) AND floor-reach ≥ 6/12. If parties cannot form under winseek's play at all, the lever becomes party formation itself. Evidence: evidence/2026-11-09/sim-prefloor-deaths-b.md.

### Arm 3 — sim-takeseat-repin-b: GO — live legs re-pinned, both suites green

Commits: prereg `e8f2200dc`, work `04d0bac8c` (merged ff-only by the adoption run). Takeseat 25/25, feareddoor 33/33 on the branch tip; re-verified green on merged master by the adoption run (takeseat 25/25, feareddoor 33/33). Seed 53001 is now a sat seed (lesser, day 98) in both suites: the armed takeseat leg takes the lesser seat day 98 (baseline none), the armed feareddoor leg walks the FEARED door where the baseline walks the assigned defiant door. No surviving quiet seed exists in bands 53001–53008 or 53101–53108 (12/12 survivors sit; only villages that die young don't). The whole-run head-equality neutrality claim is replaced by discrimination + pre-sit neutrality (95 identical daily rows, divergence starting exactly on the sit day in exactly the four sit fields) — strictly stronger, named in the test comments and the evidence. Evidence: evidence/2026-11-09/sim-takeseat-repin-b.md. Backlog item marked fixed by the adoption run.

## Wall numbers (this run)

Winseek leg (prefloor band 55201–55212, the judged leg): floor-reach **4/12**, national **0/12**, table sits **0/12**, wins **0/12**, wave-4 unlocks **10/12**, wave-5 unlocks **0/12**, true median survival **75.5d**. Doorwalk baseline leg (same band): floor-reach **8/12**, median **134d**, wave-4 12/12, wave-5 **5/12**, national 0/12, wins 0/12. The substrate gap is the whole story of the floor: villages that fight with a party live ~60 days longer and reach wave 5; villages that fight alone die at a 75d median, 15 days short of the floor.

## Infrastructure

- **EPERM flap, prefloor doorwalk sweep (~13:0xZ):** the sweep died on seed 55210's corpus write — `writeFileRetry` exhausted 40 attempts × 15s (~10 min refusal window) and threw loudly. No partial corpus left; seeds 55210–55212 re-run after writes verified clear. No data lost.
- **EPERM flap, takeseat (~13:04–13:16Z, ~12 min):** driver JSON writes failed four times; plain probes succeeded in the same minutes, briefly misleading diagnosis toward the harness. Both suites went green on the next attempt after the flap cleared. No work lost.
- **Safe-commit index clobber** struck the takeseat prereg commit — repaired per the documented pipe, commit verified correct.
- **Coordinator death:** the 1230Z coordinator's lock went 2h stale with the takeseat tree heartbeat 89m stale and no writes after the 13:30Z work commit. The adoption run (1330Z) verified the branch (evidence committed on it, tree clean), merged it ff-only, re-verified both suites on merged master, and retired the 1230Z claim/lock. No work was re-done; nothing was lost.

## Findings filed (adoption run)

- PARTY-UP BEFORE FIELD FIGHTS (named lever) — appended, claimed by 1330Z arm sim-partyup-fieldfights-b.
- Sickness-disease runner-up (wound-led) — appended, open (second measurement).
- `the night` + `betrayal` observed causes — appended, open (register by name).
- deathSays polluted by the Codex kill feed — appended, open.
- Every lost field fight kills the scholar (107/107) — appended, open (Steve-call).
- TAKESEAT/FEAREDDOOR LIVE-LEG PINS STALE — fixed by sim-takeseat-repin-b.
- E18F72DCE BEFORE/AFTER OWED — fixed by sim-e18f-beforeafter-b (exonerated).
- DAY-90 FLOOR BINDING HALF — fixed (decomposed) by sim-prefloor-deaths-b; build claimed by 1330Z.
- RETAINED MEASUREMENT PROOF STALE — claimed by 1330Z arm sim-measureproof-refresh-b.

## Convergence state

**scale-onramp stays converging (NOT converged):** the day-90-floor survival half is now decomposed with a named lever (party-up before field fights), the e18f suspect is exonerated, and the takeseat/feareddoor suites prove a sharper claim than before — but national is 0/12 on both legs, wave-5 is 0/12 under winseek, the full seat is still 0 everywhere, and only 4/12 villages even reach the day-90 floor. Next blanks, in order: (1) party-up build (1330Z arm 1); (2) measurement-proof refresh (1330Z arm 2); (3) fightblend attribution re-ask #4 — against the MIDDLE headline as the current-master endpoint, or retire the single-seed attribution for a frozen-band seed set; (4) sickness-disease second measurement (wound-led); (5) sit-becomes-win Steve-call (first-option door play after a sit); (6) sweep table contract question (Steve-call); (7) capstone readiness (veterans die / links don't season); (8) trial-by-combat staging (Steve-call); (9) Binding-never-fires follow-up; (10) gating leg-4 recalibration (decision owed). food-economy stays converging (untouched; sibling Loop A).

Loop A live at closeout (1315Z claim: sametick-adopt-a, wideduty-adopt-a on food-economy) — not touched. 1230Z claim retired (.DEAD) and lock deleted by the adoption run after the orphaned work was safely merged.
