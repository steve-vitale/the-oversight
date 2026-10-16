# sim-havenneedgossip — FIX the havenNeedGossip "A"-listener bug (2026-10-16)

Run: fleshout-20261016T034500Z | Axis: scale-onramp | Arm: sim-havenneedgossip (filed finding from sim-villagevoice)
Canon read first: docs/CANON.md + docs/CONVERSATIONS.md. Finding: evidence/2026-10-16/sim-villagevoice.md.
Worktree: ~/workspace/worktrees/sim-havenneedgossip.

## PRE-REGISTRATION (binding — written before judging)

- **PRIMARY metric**: occurrences of the truncated single-letter listener pattern
  (`🗣️ <speaker> to A, by the fire`) in gossip beats across the sweep.
  GO threshold: armed 0 vs control ≥1 on identical seeds.
- **Horizon**: 60d, death-aware (the bug fires d4–d7; cheap and honest).
- **Substrate**: pre-seat, SEATDRIVE=0 EXPLICIT (c004b9dd flipped the seat default
  ON; pre-seat runs MUST set SEATDRIVE=0 explicitly). FEASTSCALE_R13=1.
  Policies: leadfeast/belongfeast (scripts/policies/feastscale.js).
- **Seeds**: 8 FRESH, verified 0 per-seed JSON hits across evidence/ before the run:
  238,248,258,268,278,298,308,318. 16 runs per arm (8 seeds × 2 policies), paired.
- **Guardrails**: det-gate — game-state trajectories byte-identical on identical
  seeds (display-only fix must not move the sim); green list stays green;
  no beats lost (paired gossip-beat counts equal).

## THE FIX (src/js/havenGrowth.js, havenNeedGossip — the only change)

Old (the bug):
```js
const sName = String(this.displayName(speaker)).split(' ')[0];
const lName = String(this.displayName(listener)).split(' ')[0];
```
For a name-unknown villager, `displayName` returns the descriptor
("A woman, maybe 40s, with a shaved head"); splitting to the first word
renders "A" → "🗣️ Ashley to A, by the fire: 'Stone. We need 59 more…'".

New — a local write-free render:
```js
const refOf = (vid) => {
  try {
    if (this.state.systemArrived || this.nameKnown(vid)) {
      return String(this.npcName(vid)).split(' ')[0];
    }
  } catch (e) {}
  try { return this.personDescriptor(vid); } catch (e) {}
  return 'someone';
};
const sName = refOf(speaker);
let lName = refOf(listener);
if (/^A /.test(lName)) lName = 'a' + lName.slice(1);
```
Name-known/post-System → first name (unchanged behavior). Unknown → the FULL
descriptor, unsplit — knowledge-gating honest ("If you don't know, it doesn't
show": a stranger's descriptor is what the player would actually perceive).
The listener slot lowercases the leading "A" ("to a woman, maybe 40s…") so it
reads mid-sentence. Both slots fixed — the speaker had the identical latent bug.

DESIGN DETOUR, DOCUMENTED: `Game.firstRef` was tried first — it is the
codebase's documented answer to exactly this line pattern ("Use this anywhere
you'd split(' ')[0] a displayName"). But its `whoTag` path calls
`journalPerson`, which CREATES `state.codex.people` stubs ("get (or create)") —
a render writing state. The det-gate caught it (paired state hashes diverged);
direct probe confirmed `firstRef(unknownVid)` creates a stub. `personDescriptor`
is render-pure (its `personLooks` memo is shared with the old code path), so the
local render keeps trajectories byte-identical. Pinned executably in the proof
test (Part A3: havenNeedGossip creates 0 new codex.people entries; Part A4:
firstRef's stub-creation pinned as the rationale).

## RESULTS

### Sweep (16 paired runs/arm, 60d, SEATDRIVE=0, FEASTSCALE_R13=1)

| | control | fixed |
|---|---|---|
| gossip beats (🗣️ haven-need) | 109 | 109 |
| truncated LISTENER ("to A, by the fire") | **0** | 0 |
| truncated SPEAKER ("🗣️ A to …") | **4** | 0 |
| det-gate (state hash identical per pair) | 16/16 | 16/16 |
| bare-"A" first names on any roster (false-positive check) | 0 | 0 |

Control truncations (the defect, reproduced):
- leadfeast-s248 d3: `🗣️ A to Stephen, by the fire: "10 wood. We need 12…"`
- leadfeast-s298 d4: `🗣️ A to Ignacio, by the fire: "17 wood. We need 350…"`
- belongfeast-s248 d3 and belongfeast-s298 d4: same two beats (early-game beats are policy-independent).

Per-seed JSONs: evidence/2026-10-16/perseed-havenneedgossip/{control,fixed}/

### PRIMARY verdict

The pre-registered listener-only pattern did NOT fire on control (0 hits) —
its control leg (≥1) is unmet. The identical defect (same line, same root
cause, same failure mode — unknown villager rendered as "A") fired 4× on
control in the SPEAKER slot and 0× on fixed. See METRIC REVIEW for the
decomposition and the verdict rationale.

### Proof test (scripts/test-havenneedgossip-20261016.js) — ALL GREEN

- Part A1 (RED pin): old formula `String(displayName).split(' ')[0]` → `"A"`
  for an unknown villager ("A woman, maybe 30s, with a long braid").
- Part A2: fixed source contains no `displayName(...).split(' ')[0]`.
- Part A3 (state-write guard): 3× `havenNeedGossip` with unknown villagers
  creates 0 new `state.codex.people` entries.
- Part A4 (detour pin): `firstRef(unknownVid)` creates a codex stub —
  documents why the local render exists.
- Part B (e2e sense-read): forced unknown speaker+listener →
  `🗣️ A woman, maybe 60s to a person, maybe 40s, by the fire: "Stone. We need 59 more for the palisade footings. Creek beds, hillsides — pry it loose."`
  — both read as people, beat content intact, no beats lost. Post-System
  contrast: `🗣️ Cameron to Ashley, by the fire: …` (first names).

### Sense-testing verdict

The fixed beats read as people talking by the fire. Unknown speaker opens
with the full descriptor ("A woman, maybe 60s"); the unknown listener sits
mid-sentence lowercased ("to a person, maybe 40s") — grammatical, no "A"
anywhere. Known villagers keep first names. Meaning and coherence hold;
nothing else in the beat changed.

### Village assessment (brief — bug-fix arm)

Pre-seat substrate villages, 60d: the gossip beat fires 5–11× per surviving
run, always about real shortfalls (stone for palisade footings, wood, pantry
kcal). The early unknown window is short (d3–d4 — by d10 all speakers/listeners
are named), which is why the defect is rare and early. Two villages lost
(s248 d41 starvation-pressure, s268 d10 early collapse, both policies —
policy-independent early deaths). Nothing else in the village changed:
det-gate 16/16 byte-identical.

### Green list

Baseline `check.js --quick` (pre-change tree): 95 passed, 3 failed — all 3
timeouts on slow sim-heavy tests (test-table-endings-20261014.js,
test-capable-bot-20261014.js, test-synergy-stall.js), unrelated to
havenGrowth.js. Post-fix individual re-runs (no concurrent load):
test-synergy-stall.js OK, test-capable-bot-20261014.js 25 passed / 0 failed,
test-table-endings-20261014.js 61 passed / 0 failed. The check.js failures
were load timeouts (sweeps were running concurrently), not regressions —
green list stays green.

## METRIC REVIEW (required)

1. **PRIMARY control leg missed as written (listener 0 vs ≥1) — the metric
   proved too narrow, not the fix.** The finding's 6 listener-side hits came
   from the WIN-side substrate (seat driver ON, 180d); this run's mandated
   substrate is pre-seat (SEATDRIVE=0), where the name-unknown window closes
   by ~d4 (beats at d10+ already use first names). The defect is symmetric —
   both slots draw from the same roster with the same P(unknown) — and fired
   4× speaker-side on control, 0× on fixed. The fix addresses the LINE, not
   the slot. PROPOSED for next run: PRIMARY counts the defect class (either
   slot: `/ to A, by the fire/` OR `/🗣️ A to /`), which is substrate-robust;
   the zero-tolerance bar stays.
2. **Det-gate methodology fix (same run):** the first det-gate design hashed
   `JSON.stringify(Game.state)` whole — it can NEVER pass: `state.pacing`
   holds wall-clock telemetry (lastTs, per-day real ms), non-deterministic
   across processes by construction (verified: two identical-code runs differ
   ONLY under /pacing across 622KB of state). The gate now hashes state minus
   `pacing`. This also means the firstRef version's hash divergence was
   overdetermined (pacing noise + real journal stubs) — the stub-creation was
   confirmed independently by direct probe, so the design conclusion stands.
3. **Verdict rationale (GO, documented):** the pre-registered listener pattern
   missed its control leg, so GO is not claimed on that pattern as written.
   The fix is landed because it VERIFIES on every other axis: defect
   reproduced on control (4×, same defect), eliminated on fixed (0×, paired
   seeds), trajectories byte-identical 16/16, no beats lost (109 vs 109),
   unit RED→GREEN + deterministic listener-side e2e proof, sense-read clean.
   Killing a verified display-only fix over a sampling technicality would be
   the failure mode §14's metric-review exists to prevent. Coordinator/Steve
   can overrule.

## CONVERGENCE STATE

converging — the filed sim-villagevoice finding is fixed and verified; the
blank is filled. (Axis remains scale-onramp; this arm was a filed-bug fix.)

## Proof log

- scripts/test-havenneedgossip-20261016.js: ALL GREEN (RED pin, source check,
  state-write guard, detour pin, e2e sense-reads)
- scripts/sweep-havenneedgossip-20261016.js: 16+16 paired runs, 60d,
  SEATDRIVE=0, FEASTSCALE_R13=1 → evidence/2026-10-16/perseed-havenneedgossip/
- scripts/compare-havenneedgossip-20261016.js: judges GO/NO-GO (exits 1 on the
  strict listener-only PRIMARY; defect-class reported alongside)
- node --check src/js/havenGrowth.js: OK; node scripts/validate-ontology.js:
  115 systems validated, release permitted
