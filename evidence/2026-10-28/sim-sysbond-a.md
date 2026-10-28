# sim-sysbond-a — TABLE sysBond doc/code gap audit (finding #1304)

Run: fleshout loop, run fleshout-20261028T0634Z. Axis: scale-onramp.
Worker: sim-sysbond-a. Worktree: `~/workspace/worktrees/sim-sysbond-a`,
base master 3cb5f8b82. AUDIT ARM ONLY: zero src/js change, zero
gating change, zero behavior change landed. No balanced panel
(no corpus-ingest mode — standing exception). No [needs-eyes]:
doc-only audit; no behavior fix proposed (see verdict rule).

Pre-registration: evidence/2026-10-28/sim-sysbond-a-prereg.md
(written BEFORE any judged fixture or sweep, per MEASUREMENT §§9–12,
14–15). Metric binding: the pre-registered audit GO is judged below;
no metric was re-scored mid-run.

## Verdict: GO (doc correction) — gap closed in docs/TABLE.md

The doc was wrong, the code was not. docs/TABLE.md named sysBond ≥ 2
as part of the Relay door; the code never gated the door on sysBond
in any commit, prices the door's standing from sysBond instead, and
opens the door at sysBond 0 in fixture and in live sims. No
code-wrong proof met the pre-registered bar (see "Code-wrong test"
below), so per the task default the DOC is corrected to match the
code. The correction also fixes two adjacent overstatements found
while examining every Relay-door claim (D1–D4 in the prereg): the
door is not scale-independent as offered (it rides on a lesser+
seat), and the stage-2 office branch accepts any held office, not
only a Bearer-held one. A third sub-gap: the doc's "(curious)" for
≥ 2 is off by one on the code's own naming (1 = curious,
2 = listening).

## The gap, exactly

Doc claim (docs/TABLE.md §7, before this run):
> **Earned by:** integration stage ≥ 3 (neural), OR stage 2 + holding
> the relay office. sysBond (System relationship) ≥ 2 (curious).
> Scale-independent.

Code path (src/js/table-relay.js, `prereq(seat)`, the Relay path
definition registered via `tableRegisterPath`):
- seat 'none' → not earned.
- stage ≥ 3 → earned, strength `40 + bond × 10` (capped 100),
  why: "Stage-3 neural integration. The matrix doesn't care about
  your kingdom — it cares how deep you are. (sysbond N)".
- stage ≥ 2 AND `switchboard()` truthy → earned, strength
  `25 + bond × 5`, why: "Stage 2 with the relay office — the wires
  know your hands. (sysbond N)".
- Else not earned.
- sysBond is READ (`Game.sysBond()`) and used ONLY in the two
  strength formulas and the why line. It is never compared, never
  a condition. There is no `bond >= 2` (or any bond threshold) in
  the door path.

Seat floor (src/js/table.js, `tableEarnedPaths()`): AFTER prereq,
any path whose `minSeat` is 'lesser' (relay's `minSeat` in
table-relay.js) is forced not-earned when `tableSeat()` is 'none'.
`tableOfferPaths()` offers ONLY `tableEarnedPaths()` earned
entries. So the offered door = prereq AND a lesser+ seat, and the
lesser seat itself (`tableSeat()`) requires regional+ scale,
waves faced 4/4/3, 2+ contests, 2+ crises, stage ≥ 2, and
food-thesis deeds. "Scale-independent" is true of the prereq
alone and false of the offered door.

Stage (src/js/progression.js, `integrationStage()`): 3 iff
`systemArrived` and scholar.integration ≥ 80; 2 iff ≥ 40; else 1
(0 before the System arrives). sysBond scale (src/js/table.js,
`sysBond()`/`addSysBond()`): 0–5, named static, curious,
listening, comprehending, champion, kin — i.e. 1 = curious,
2 = listening. The doc's "≥ 2 (curious)" names the wrong level
even if a bond bar had existed.

Office branch, precisely: `switchboard()` (src/js/comms.js)
returns `state.switchboard` or null — the office object whoever
holds it. The Bearer can hold it (`claimRelay()` in
src/js/relay-ext.js, holderId = villagerId) and an appointed
villager can hold it (`appointSwitchboard()`). The code checks
existence, not the holder. The fixture proves a non-Bearer holder
earns the stage-2 door (see matrix).

## History: which came first, and was the gate dropped?

- Doc wording D1 exists verbatim since docs/TABLE.md's first
  contract commit (6053db314, endgame table 2026-10-11).
- Code prereq exists verbatim since its first commit
  (2bd5096d0, defiant + relay paths): stage ≥ 3 / stage ≥ 2 +
  switchboard, bond for strength only, never a bond comparison.
- `git log -S "bond >= 2"` over table-relay.js/table.js: no hit.
  No commit ever gated the door on sysBond, so the gap is NOT a
  deliberate removal visible in history — the doc claim was never
  implemented as a door gate. History alone does not prove
  code-wrong (a doc can be written aspirationally); the verdict
  rule below decides, and history is reported, not smoothed over.

## Code-wrong test (pre-registered bar — NOT met)

Code-wrong required at least one of:
(i) A Steve ruling AFTER the code landed ordering a sysBond door
gate. NOT FOUND: no sysBond mention at all in docs/DECISIONS.md,
docs/DIRECTIVES.md, or docs/godpath/STEVE-ANSWERS.md (grep, this
run). The only Steve-attributed Relay-door text is TABLE.md
itself, contemporaneous with the code (both 2026-10-11).
(ii) A second code path assuming the door enforced sysBond ≥ 2.
NOT FOUND: sysBond uses in table*.js are the arc state, the
meter/strength reads, and challenge-effect handling
(table.js:1182) — nothing assumes a bond-gated door, and no
downstream gate breaks at bond 0. (sysBond DOES gate things
elsewhere, but not the door: relay-ext.js `relayUnlockCheck()`
grants relay-sight at bond ≥ 2, sanctuary/advocate at ≥ 3,
omnipresence at ≥ 4 with dark uses. Those are ability unlocks
inside the relay arc. The door also grants the shared abilities
at entry regardless of bond — see the sense note.)
(iii) A corpus case where a bond-0/1 Relay entry produces a
broken or incoherent state attributable to the missing gate.
NOT FOUND: bond-0 Relay walks win coherently (seatpath-a sense
transcript + this run's band: 3 wins). The only bond effect is
a weaker standing number (40 at bond 0 vs 60 at bond 2), which
is pricing working as coded, not breakage.
Therefore: DOC CORRECTION governs. No behavior fix is specified
as a landing item; the minimal code fix, IF a future Steve ruling
reverses this verdict, would be: in table-relay.js prereq, add
`bond >= 2` to both earning branches (stage ≥ 3 AND stage ≥ 2 +
office) — and re-measure, because it would close the stage-3
route on the entire current band (all four previews bond 0).
That fix is SPECIFIED ONLY, not landed, per the task's
coordinator-approval requirement.

## Fixture proof (gate proof — scripts/test-sysbond-a.js, 14/14)

Full src/js list in index.html order via scripts/sim-harness.js
(seeded Math.random before eval; Game.save never stubbed). The
only stub is a temporary tableSeat returning the stated seat,
restored after every cell, so the relay entry is read out of the
real tableEarnedPaths path (seat floor included), never by
calling prereq directly.

| seat | stage | bond | office | earned | strength | why (short) |
|---|---|---|---|---|---|---|
| lesser | 3 | 0 | — | YES | 40 | Stage-3 neural integration (sysbond 0) |
| lesser | 3 | 1 | — | YES | 50 | Stage-3 (sysbond 1) |
| lesser | 3 | 2 | — | YES | 60 | Stage-3 (sysbond 2) |
| lesser | 3 | 5 | — | YES | 90 | Stage-3 (sysbond 5) |
| lesser | 2 | 0 | yes (non-Bearer holder) | YES | 25 | Stage 2 + office (sysbond 0) |
| lesser | 2 | 1 | yes | YES | 30 | Stage 2 + office (sysbond 1) |
| lesser | 2 | 5 | yes | YES | 50 | Stage 2 + office (sysbond 5) |
| lesser | 2 | 5 | NO | no | 0 | needs stage 3, or stage 2 + office |
| lesser | 1 | 5 | yes | no | 0 | needs stage 3, or stage 2 + office |
| none | 3 | 0 | — | no | 0 | This seat needs a stronger table (floor) |
| none | 3 | 5 | — | no | 0 | This seat needs a stronger table (floor) |
| none | 2 | 5 | yes | no | 0 | This seat needs a stronger table (floor) |

Plus a bond sweep 0–5 at stage 3 + lesser: earned in ALL cells,
strengths exactly 40/50/60/70/80/90 — bond moves strength only,
never earned. Run: `node scripts/test-sysbond-a.js` → 14 passed,
0 failed.

## Band reproduction (corroboration — scripts/test-sysbond-a-sweep.js)

Same substrate as seatpath-a, policy-side only: seeds 75101–75108,
LEANLINKRESCUE=1, TABLESEATNOWAIT=1, TABLERELAY=1
(tablepaths-relay policy), 180d death-aware horizon. Capture at
the FIRST tablePreview day per seed (the earning/pricing moment,
before the seat legs take the seat that day and before any
cockpit verb moves sysBond/grounding). Corpus:
evidence/2026-10-28/perseed-sysbond-a/ (this arm's own directory).

| seed | preview day | seat | stage | sysBond | office holder | relay earned | strength | entered | won |
|---|---|---|---|---|---|---|---|---|---|
| 75101 | 132 | lesser | 3 | 0 | none (stage-3 route) | YES | 40 | relay | yes |
| 75102 | — (no preview, survived 180) | — | — | — | — | — | — | — | no |
| 75103 | 132 | lesser | 3 | 0 | none | YES | 50 | relay | yes |
| 75104 | 90 | lesser | 3 | 0 | none | YES | 40 | relay | yes |
| 75105 | — (no preview, survived 180) | — | — | — | — | — | — | — | no |
| 75106 | 137 | lesser | 3 | 0 | none | YES | 40 | — (village lost day 146 before national, so the nowait seat legs, which wait for national+, never fired) | no |
| 75107 | — (no preview, survived 180) | — | — | — | — | — | — | — | no |
| 75108 | — (no preview, lost day 102) | — | — | — | — | — | — | — | no |

4/4 previews earn Relay at stage 3, sysBond 0, lesser seat.
75103's strength 50 at bond 0 is the prereq 40 plus the
tableEarnedPaths ascension bonus (+10 per ascended villager) —
the only positive term beyond the prereq formula — not a bond
effect. No preview shows a bond-gated door, and no preview
shows a stage-2 office door (the band's previews are all
stage-3; the stage-2 branch is fixture-proven only).

Divergence note (honest, not hidden): these trajectories differ
from seatpath-a's on 75103/75105 (seatpath-a: 75103 no entry in
180d, 75105 relay win day 162). That is EXPECTED, not a capture
artifact to hide: seatpath-a ran on base bcf137c40, this run on
current master 3cb5f8b82 with sibling merges since. This band is
a reproduction on current master, not a same-base replication of
seatpath-a, and its earning values are read before any seat/walk
in its own runs. The capture adds one pricing read (tablePreview
+ tableEarnedPaths) on the first preview day; the earning
snapshot is taken before the seat legs act that day.

## Every Relay-door claim checked (GO item a)

- D1 (§7 "Earned by"): sysBond ≥ 2 bar — FALSE in code (fixture +
  band). Stage ≥ 3 / stage 2 + office — TRUE as prereq.
  "(curious)" for ≥ 2 — FALSE on code naming (1 = curious).
  "Scale-independent" — TRUE of the prereq, FALSE of the offered
  door (seat floor). All four sub-claims corrected in TABLE.md.
- D2 (Per-path minimum seat): "lesser+ by deeds OR stage ≥ 3
  regardless of scale" — corrected to the layered truth: lesser+
  seat AND (stage ≥ 3 OR stage 2 + office). The "only path
  qualified by integration depth" distinctness survives, but
  only as a prereq property, not as a seat bypass.
- D3 (Reachability): "stage-3 qualification is the most reachable
  route by design" — TRUE as a qualification claim; corrected
  with the "(plus a lesser seat)" qualifier so it cannot be read
  as a door bypass. No reachability number changes.
- D4 (naming): covered under D1; the correction drops the
  "(curious)" parenthetical for any bond threshold and states
  bond's real roles (standing pricing; ability unlocks).
- Other docs: grep over docs/ for sysBond ≥ 2 / stage-3 Relay
  earning finds NO other doc repeating the door bar.
  docs/ONTOLOGY.md's Relay summary states verbs and branch, not
  a door bar — no change. docs/MONSTER-WAVES.md and
  docs/PROGRESSION.md stage ≥ 3 lines are the FULL-seat deed gate
  (deedGateReady), not the Relay door — no change. No sibling doc
  line needed correction.

## Sense check (SENSE-TESTING LAW)

Read: seatpath-a sense transcript, seed 75101 relay walk (day 132).
The audit line names the lesser seat and the deeds ("national
standing, waves 1–3 faced (17/7/3), 15 contests, 3 crises") and
no bond bar is claimed at the door. The bond arc then plays OUT
in the cockpit as verbs raise it: "It is curious now" (bond
0→1), "listening now" (→2), "comprehending now" (→3), "champion
now" (→4), with Sanctuary/Advocate granted as bond crosses 3 —
exactly the relayUnlockCheck thresholds. The narration is
coherent about how the seat was earned (deeds + depth) and
treats bond as a DURING-play relationship arc, not a pre-door
qualification. That coherence supports doc correction: nothing in
the played story claims, or needs, a bond gate at the door.
(Door-granted shared abilities — Deep Listen, Faithful Carry,
Relay-sight at entry — arrive regardless of bond; Relay-sight's
bond-2 unlock rule governs the office arc, not the door grant.
Noted, not changed: it is the existing door-grant behavior.)

## Doc correction landed (this arm, docs only)

docs/TABLE.md §7 "Earned by" and the per-path minimum seat line
and the Reachability qualifier — see the commit diff. Wording
states: prereq = stage ≥ 3 OR stage 2 + a relay office held
(Bearer or appointed villager — code checks the office exists);
offered door = prereq AND a lesser+ seat; sysBond does NOT gate
the door — it prices standing (stage 3: 40 + 10/bond; stage 2 +
office: 25 + 5/bond) and gates relay abilities inside the arc
(relay-sight 2, sanctuary/advocate 3, omnipresence 4 + dark uses).
Evidence cited in the doc note: sim-sysbond-a fixture + band.

## What was NOT done (scope guard)

- No src/js edit, no gating/deed-bar edit, no policy default
  flipped, no sibling worktree touched, no claim/lock file
  written or deleted, no push, no version bump, no live check,
  no balanced panel (standing exception, stated in prereg).
- Observed, not changed (out of scope, for the coordinator):
  docs/TABLE.md's full-seat line says stage ≥ 3 while the
  table.js seat comment describes deedGateReady with stage ≥ 2
  (the full-seat deed gate is a separate claim from the Relay
  door and was not audited here).

## Metric review

Pre-registered audit GO judged as stated: (a) all Relay-door
claims D1–D4 checked against code + corpus — DONE; (b) gap
closed in docs — DONE (TABLE.md corrected; no sibling doc line
repeated the claim); (c) zero behavior change landed — DONE;
(d) no Relay-door claim left unexamined — DONE (including the
office-holder reading and the naming sub-gap, both found while
examining D1). No metric proved wrong; no revision proposed for
the next run. The one judgment call — doc-corrects vs
code-fix — followed the pre-registered rule (code-wrong needs
proof, not suspicion) and the proof bar was not met on any of
its three prongs.
