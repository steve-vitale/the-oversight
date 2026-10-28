# sim-sysbond-a — PRE-REGISTRATION (written BEFORE any judged fixture or sweep)

Run: fleshout loop, run fleshout-20261028T0634Z. Axis: scale-onramp
(the blocking axis). Worker: sim-sysbond-a, arm sim-sysbond-a
(tracker blank 2, finding #1304 — TABLE sysBond doc/code gap).
Worktree: `~/workspace/worktrees/sim-sysbond-a` (branch sim-sysbond-a,
base master 3cb5f8b82 at worktree creation, worktree clean at start).
AUDIT ARM ONLY. Zero src/js behavior change, zero gating change
(Steve 2026-10-27 gating freeze stands), zero claim/lock file writes
(the coordinator owns them). This arm lands at most: this prereg +
evidence + instruments + docs/TABLE.md (and sibling doc lines ONLY
if they repeat the same Relay-door claim). No balanced panel
(no corpus-ingest mode — standing exception, stated here).

## Canon read first

- docs/CANON.md, then docs/TABLE.md (the seat; §7 THE RELAY; the
  Reachability section), then docs/MONSTER-WAVES.md where relevant,
  then src/js/table-relay.js (the Relay path definition) and
  src/js/table.js (tableEarnedPaths seat floor, sysBond/grounding).
- No canon invented. If no doc covers a target, the evidence file
  says so instead of inventing.

## Audit question

Does docs/TABLE.md's Relay-door wording match the code that earns
the Relay door, and if not, which side governs — with proof, not
suspicion? Default (per task): correct the DOC unless the
code-wrong case is PROVEN (a condition that should gate but fires
nowhere, or equivalent code + corpus proof). A behavior-changing
fix is NOT landed by this arm: if code-wrong is proven, the
evidence specifies the minimal fix precisely and the coordinator
approves before any behavior change.

## Exact doc claims under test (all Relay-door claims in TABLE.md)

- D1 (§7 THE RELAY, "Earned by"): "integration stage ≥ 3 (neural),
  OR stage 2 + holding the relay office. sysBond (System
  relationship) ≥ 2 (curious). Scale-independent."
- D2 (Per-path minimum seat): "relay: lesser+ by deeds OR stage ≥ 3
  regardless of scale — the matrix doesn't care about your kingdom;
  it cares how deep you are. This is the relay's distinctness: the
  only path qualified by integration depth instead of territory."
- D3 (Reachability): "relay path's stage-3 qualification is the
  most reachable route by design (integration is earned through
  play, not territory)."
- D4 (implicit in D1's parenthetical): sysBond ≥ 2 IS the "curious"
  level. Checked against code: src/js/table.js sysBond()/addSysBond
  names 0 static, 1 curious, 2 listening — so ≥ 2 is "listening",
  not "curious", on the code's own naming.
- Other docs repeating the Relay-door claim: grep docs/ for
  sysBond ≥ 2 / stage-3 Relay earning (ONTOLOGY.md's Relay summary
  states verbs and branch, not a door bar — verified in evidence;
  any other hit is listed there). Evidence files are NOT doc
  claims and are not "corrected".

## Code path under test (read before this prereg)

- src/js/table-relay.js prereq(seat): seat none → not earned.
  stage ≥ 3 → earned, strength 40 + bond×10, why names sysbond.
  stage ≥ 2 AND switchboard() truthy → earned, strength 25 + bond×5.
  Else not earned. sysBond is READ but never compared: it prices
  strength only.
- src/js/table.js tableEarnedPaths(): applies a seat floor AFTER
  prereq — a path with minSeat 'lesser' (relay's minSeat) is forced
  not-earned when tableSeat() is 'none', whatever prereq says.
  So the earned door = prereq AND a lesser+ seat. The lesser seat
  itself (tableSeat()) requires regional+ scale, waves 4/4/3, 2+
  contests, 2+ crises, stage ≥ 2, food-thesis deeds.
- Therefore D1's "scale-independent" and D2's "regardless of scale"
  are true of the PREREQ alone and false of the EARNED door as
  offered (tableOfferPaths offers only tableEarnedPaths earned
  entries). This layered distinction is the audit's central
  question alongside the sysBond bar.
- sysBond DOES gate things elsewhere (not the door):
  src/js/relay-ext.js relayUnlockCheck(): bond ≥ 2 grants
  relay-sight, bond ≥ 3 grants sanctuary/advocate, bond ≥ 4 (+ dark
  uses) grants omnipresence. Those are ability unlocks inside the
  relay arc, not the door. The evidence keeps them separate.

## History question (checked before judging)

- Doc wording D1 exists verbatim since docs/TABLE.md's first
  contract commit (6053db314, endgame table 2026-10-11).
- Code prereq exists verbatim since its first commit
  (2bd5096d0, defiant + relay paths): stage ≥ 3 / stage ≥ 2 +
  switchboard, bond for strength only, never a bond comparison.
  No history commit ever gated the door on sysBond (git log -S
  "bond >= 2" over table-relay.js/table.js: no hit). The gap is
  therefore NOT a deliberate removal visible in history: the doc
  claim was never implemented as a door gate. That history fact
  alone does not prove code-wrong — a doc can also have been
  written aspirationally. The verdict rule below decides.

## Judged measurements (in order)

1. FIXTURE (scripts/test-sysbond-a.js, new, in-worktree):
   load the full src/js list in index.html order (minus DOM-only
   files), seed Math.random before eval, never stub Game.save.
   Matrix over prereq inputs via tableEarnedPaths with tableSeat
   stubbed ONLY to return the stated seat (fixture isolation,
   documented in the script; the stub is restored, and the
   seat-floor layer is separately verified with seat 'none'):
   seat ∈ {lesser, none} × stage ∈ {2, 3} (via scholar.integration
   40/80 thresholds — progression.js integrationStage()) ×
   sysBond ∈ {0, 1, 2, 5} (via progState sysBond) × switchboard ∈
   {absent, present}. Record relay earned/strength/why per cell.
   Pass bar for the fixture: stage-3 + lesser + sysBond 0 earns;
   stage-2 + lesser + switchboard + sysBond 0 earns; seat none
   earns nothing at any stage/bond; sysBond moves strength only.
2. BAND REPRODUCTION (same substrate as seatpath-a, policy-side
   only): seeds 75101–75108, LEANLINKRESCUE=1,
   TABLESEATNOWAIT=1, TABLERELAY=1 (tablepaths-relay policy),
   180d death-aware horizon, via a capture wrapper that records,
   at the FIRST tablePreview-ready moment per seed (the earning
   moment, before any cockpit verb moves sysBond/grounding):
   seat, integration stage, sysBond, switchboard holder, and the
   tableEarnedPaths relay entry (earned/strength/why). If the
   full band is too costly in this run, the 3 seating seeds
   (75101, 75104, 75105 per seatpath-a) are the minimum
   reproduction set and the reduction is stated in evidence —
   the fixture (1) is the gate proof either way; the band is
   corroboration, not the gate.
3. SENSE check (SENSE-TESTING LAW): read the relay walk narration
   on one seating seed (seatpath-a's sense transcript + this
   run's capture if produced). Judge whether the narration is
   coherent about HOW the seat was earned — in particular
   whether any line claims a System-relationship bar was met
   when sysBond was 0. A narration claim of a bond bar would
   strengthen code-wrong; its absence supports doc correction.

## Pre-registered GO (audit GO, not a behavior GO)

GO iff ALL of: (a) every Relay-door claim D1–D4 checked against
code + corpus, with file/function references; (b) the gap closed
in docs (TABLE.md corrected to match code, plus any sibling doc
line repeating the claim) OR a precise minimal code fix specified
with proof; (c) zero behavior change landed by this arm; (d) no
other doc claim about the Relay door left unexamined. If the
evidence is ambiguous (e.g. a Steve ruling or design note that
genuinely supports the bond gate as intended behavior), report
AMBIGUOUS with both readings and do NOT pick one silently —
that outcome fails GO and the fix specification is still given
for the code-wrong reading.

## Verdict rule (decided here, before judging)

- Doc correction governs UNLESS code-wrong is proven. Proof of
  code-wrong requires at least one of: (i) a Steve ruling or
  design note AFTER the code landed ordering a sysBond door gate;
  (ii) a second code path that assumes the door enforced sysBond
  ≥ 2 (e.g. an ability, narration, or downstream gate that breaks
  or lies at sysBond 0–1 on an earned door); (iii) a corpus case
  where sysBond 0–1 relay entry produces a broken/incoherent
  state attributable to the missing gate (not merely a weaker
  strength number). Strength-only pricing at bond 0, and a doc
  sentence never implemented, do NOT meet this bar — they are
  the doc-wrong signature.
- Note the naming sub-gap (D4): if the doc is corrected, the
  correction must not repeat "(curious)" for ≥ 2. The corrected
  wording states bond's real door role (none — strength only)
  and, if bond is mentioned at all, uses the code's names
  (1 curious, 2 listening) or drops the parenthetical.

## What this arm does NOT do

- No src/js edits, no gating/deed-bar edits, no policy defaults
  flipped, no sibling worktree files touched, no claim/lock
  files written or deleted, no push, no version bump, no live
  verification, no balanced panel (standing exception above).
