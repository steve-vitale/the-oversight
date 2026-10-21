# sim-trustdrift-voice — trust-drift warning beats + tend-skip boundary (2026-10-21)

**Axis:** scale-onramp (standing directive). **Arm:** content fix — backs backlogs #751 (trust-erosion beats for sub-seasoned links) and #753 (voiced tend-skip).

**Canon note:** docs/CANON.md was read first. There is NO canon doc covering link-trust fiction — every mechanism claim below is grounded in `src/js/hierarchy.js` reads (cited by area), never invented. Canon rules honored: "If you don't know, it doesn't show" (beat text uses only what the village can know), "No silent actions" (the blank we're filling).

## Pre-registration (binding, written before any code change)

- **PRIMARY — scripted-scenario RED→GREEN.** Scenario: a Haven-primary (lead) link, 35 days old (seasoned age met), trust set from 45 → 39 (forced across the trust-40 bar), then `hierarchyDaily()` runs:
  - RED (pre-fix, this exact script): the crossing emits ZERO warning beats — the trust-40 seasoned bar (`_linkSeasoned`: 30+ days AND trust 40+, hierarchy.js:228) is crossed in silence.
  - GREEN (post-fix): the crossing emits EXACTLY ONE "X is drifting" beat with honest person-noticing text (no numbers, no meter-readout), once per crossing (no repeat on subsequent days), re-arming only if trust climbs back ≥40.
- **PRIMARY (tend-skip):** verify the engine-visible side already voices: `tendLink` on a bare pantry says "The pantry is bare — there is no grain to send..." (hierarchy.js:926-929). The 8802 shape (loop-B: policy never calls `tendLink` once pantry ≤ its 20k gate) is a policy-side skip — invisible to the engine. NO fiction will be invented for it; the boundary is documented here instead of faked.
- **REGRESSION — det-gate.** Paired same-seed scenario runs, pre- vs post-change: (a) no-crossing scenario (trust erodes 50→41, never crosses): say-digests byte-identical; (b) crossing scenario (45→39): diff is exactly the one new beat line, nothing else. Honest exclusions: none expected — the change adds one watcher + one line of fiction; no numbers move.
- **check.js --quick** after the change (plus `--only hierarchy` if that filter exists); keep the green list green.
- **§15 note:** fiction change — the det-gate is the instrument here; no balance levers move, so no before/after panel is run (declared, not dodged). No win-rate/wave/national deltas expected.

## The two DIAG shapes (from evidence/2026-10-21/sim-dissolvetax.md + loop-B)

1. **leadfeast-s64908:** Thornfield link, Haven primary, trust 65→38 over ~30 days, tending faithful early, then nothing voiced — realm dissolves at the trust-40 seasoned bar ("◈ The realm came apart"). The player learns the bond died at the funeral.
2. **loop-B 8802:** trust 100→7 over nine weeks; tending stopped when the pantry crossed the policy's 20k gate, unvoiced — the policy never calls `tendLink`, so the engine's bare-pantry refusal never fires either.

## Implementation

**File:** `src/js/hierarchy.js` — +1 method (`_trustDriftWatch`), +1 hook line in `hierarchyDaily()`, +1 `@ontology` bullet. No numbers moved, no RNG consumed (fixed copy, deterministic).

**The bar (verified in code):** `_linkSeasoned` (hierarchy.js:228) — a link counts toward a polity only when 30+ days old AND trust ≥ 40. The assignment's "below 50" guess is superseded: the actual constant is **40**.

**`_trustDriftWatch()`** runs inside `hierarchyDaily()`, immediately before `_checkNational()`, so the warning lands the same day a link un-seasons — ahead of the realm's verdict. Per active Haven-party link (lead road `primary === HOME`, peer leagues `a/b === HOME`; subordinate-Haven links excluded — they answer to BELONG's trust-50 gate, different fiction; conquered links excluded — their bar is the season, not the trust; links < 30 days old excluded — young links can't drift below a bar they never crossed):
- Tracks `link._trustDriftAbove` (persisted on the link object, like `_succDay`/`_succTrust`).
- First observation initializes silently (no crossing observed → no fiction).
- `true → false` crossing: voices the beat ONCE, stamps a `_linkNote('drift')` + ledger entry.
- `false → true`: re-arms silently.
- Knowledge-gated: the fiction is only what the village can know — the speaker's manner at the gate, wagons coming back light. No trust numbers, no meter-readout.

**Beats:**
- Lead: `⚠️ Thornfield's fire is drifting from ours — their speaker doesn't linger at the gate the way they used to, and nobody over there says why. Bonds don't mend themselves; a tended fire remembers who fed it.`
- Peer (covenant/trade): `⚠️ The bond with Ashford's fire is cooling — their manner at the council has gone careful, all courtesy and no warmth. Leagues are kept warm or they go cold.`

**Tend-skip boundary (arm 2 — documented, not faked):** the 8802 skip is policy-side and engine-invisible. Verified: policies gate tending behind their own pantry thresholds (`scripts/policies/fourthlink.js:78-81`, `refusecourt.js:67-72`: `pantryKcal(Game) > 20000` before calling `Game.tendLink`). When the gate fails, the policy simply never calls — the engine sees no intent-to-tend, so any engine-voiced "we skipped tending because the pantry was low" line would be invented fiction. The engine-visible side was already honest and stays: `tendLink` on a bare pantry says "The pantry is bare — there is no grain to send to Thornfield. They'll hear we came empty-handed, and they'll hear why." (proof: `tendRefusal` section of the test). The 8802-shaped fix belongs to policy arms (a policy-side "tending paused — pantry below the 20k gate" line), not to the engine. This arm does not invent it.

## Sense-testing

Real transcript excerpts from the proof run (seed 64908, scripted 45→39 crossing):

> ⚠️ Thornfield's fire is drifting from ours — their speaker doesn't linger at the gate the way they used to, and nobody over there says why. Bonds don't mend themselves; a tended fire remembers who fed it.

> ⚠️ The bond with Ashford's fire is cooling — their manner at the council has gone careful, all courtesy and no warmth. Leagues are kept warm or they go cold.

**Judgment:** both read like a person noticing a bond cooling, not a UI meter. The lead line names observable things (the speaker's manner at the gate, the unexplained silence) and ends with an honest actionable nudge toward the real `tendLink` verb ("a tended fire remembers who fed it" — the fiction's own word for the verb, per the tendLink line "Tending is a rhythm, not a purchase"). The peer line avoids promising a verb that doesn't exist for peer links (no tendLink for covenant/trade) — it observes and lets the player decide. Neither names a trust number or the 40 bar. The lead line's "their speaker doesn't linger at the gate" is knowledge-gated: the village can only know the manner of people who come to the gate. Verdict: reads human, coherent, relevant — no rewrite needed.

## Metric review (§14)

- PRIMARY RED→GREEN: met. RED (pre-fix): crossing 45→39 emitted 0 drift beats — the narration blank confirmed on current master. GREEN (post-fix): exactly 1 beat on crossing; still 1 the next day (no spam); silent re-arm on the climb back ≥40; 2nd beat on the re-cross. The pre-registered bar did not change mid-run.
- TEND-SKIP: engine-visible refusal verified already-voiced (bare pantry line fires, `tendLink` returns 0). The policy-side skip is documented as the engine-invisible boundary — no metric invented for unfakeable fiction.
- REGRESSION det-gate: met. Paired same-seed runs (final script, pristine vs changed hierarchy.js): NOCROSS scenario (50→41) digest `d7b227dac2b9ce67` pre AND post — byte-identical. CROSS scenario: RED digest `1a8af07f55a7f7cc` → GREEN `77b9dc429d44a6d0`; line-level diff of the full say-logs is exactly the new beat lines (1 in the transcript section + 2 in the dump), nothing else.
- Honest exclusions from the det-gate: the say-stream digest covers narration; the feature also writes one `_linkNote('drift')` history entry and one `ledgerAdd('hierarchy','drift-warn:<vid>')` per crossing — deterministic state writes, no RNG, excluded from the digest by design (they're the feature's memory, not its voice).
- §15: fiction change — no balance levers moved, so no balanced-panel before/after was run (declared). The det-gate is the instrument; the pre-registered threshold is the judge.
- Convergence: this arm is a content fix, not a scale lever — it does not move the wall numbers (national/table/wins). It fills the narration blank (#751, #753) that makes scale-wall losses legible.

## det-gate

- RED digests (pristine hierarchy.js, final script): CROSS `1a8af07f55a7f7cc`, NOCROSS `d7b227dac2b9ce67` — exit 1 (RED).
- GREEN digests (changed hierarchy.js): CROSS `77b9dc429d44a6d0`, NOCROSS `d7b227dac2b9ce67` — exit 0 (GREEN).
- NOCROSS byte-identical pre/post. CROSS diff = exactly the new beat lines.
- Full RED/GREEN logs: `~/workspace/trustdrift-det-red.txt`, `~/workspace/trustdrift-det-green.txt`.
- Post-GREEN edit: the ontology bullet was reflowed to a single line (validator requires single-line rule bullets) — comment-only, zero behavior change; `node --check` + `validate-ontology.js` green after.
