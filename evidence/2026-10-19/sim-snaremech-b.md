# sim-snaremech-b — finding #631 logic run (lever loop B, 2026-10-19)

Worker: fleshout-loop-b run 20261019T1330Z, arm sim-snaremech-b.
Worktree: ~/workspace/worktrees/sim-snaremech-b. Base: master 6b7954cf.
Canon read: docs/CANON.md, docs/KNOWLEDGE.md.

## Pre-registered header (docs/MEASUREMENT.md §§9-12, 14-15)

This is a VERIFICATION run, not a lever run — no game-code change was
planned, so no pilot/confirm sim spend is authorized by the brief ("If no
fix ships: no pilot spend, verification evidence only").

- **Primary metric:** the actual trapChance consumed by `Game.checkTraps()`
  with snare_wire at L0/L1/L2/L3 — pinned deterministically in the node
  harness, plus an end-to-end seeded catch-rate measurement through the
  real `checkTraps()` code path.
- **GO threshold (pipeline-live):** L2/L3 ranks move the real trapChance by
  exactly their knowledge.json values (0.2/0.4, cumulative-add), the
  modifiers carry the `knowledge:snare_wire` source tag, and seeded
  end-to-end dawns catch strictly more at L3 than L0.
- **Judge:** the proof test (scripts/test-snaremech-b.js, 11/11). If the
  pipeline is live AND ranks are reachable → close #631 as measurement
  artifact. If ranks are unreachable → mark #631 "bounded: pipeline live,
  L2/L3 unreachable via [exact gap]" — no invented progression system.
- **Seeds:** deterministic unit pins (single game, sequential grants) +
  one seeded e2e leg per rank (seed 777, 60 dawns each). No sweep.

## The pipeline (traced, not assumed)

```
knowledge.json snare_wire L2/L3 mechanical {trap_success: 0.2 / 0.4}
  -> engine/modifiers.js KNOWLEDGE_MOD_MAP 'trap_success' (line 271)
       -> { target: 'hunt.trap_catch', op: 'add', value }
  -> collectKnowledgeModifiers((state.codex||{}).skills, data.knowledge)
       cumulative over levels 1..level; 'unlock' keys skipped (line 305)
  -> game.js allModifiers() (line 26396) -> mods() (line 27006)
       -> modTarget('hunt.trap_catch', 0.4)
  -> game.js checkTraps() line 3631:
       trapChance = Math.min(0.95, this.modTarget('hunt.trap_catch', 0.4))
```

Every hop verified by reading the code AND by runtime pin (below). The
finding's "zero callers" grep was measuring the wrong thing: the
mechanical key is consumed generically through the modifier map, never by
name — a measurement artifact, exactly as the coordinator suspected.

## Proof test (scripts/test-snaremech-b.js — real RED phase)

Shared kit (sim-harness.js loadGame/seed-before-eval). 11 checks.

RED honesty: my first run FAILED — I had pinned the brief's own
arithmetic (0.4/0.4/0.6/0.8) and the code returned **1.0** at L3. The
code is right and my expectation was wrong: 0.4 + 0.2 + 0.4 = 1.0, not
0.8. The modifier list printed by the test proves the composition:
`[["knowledge:snare_wire","add",0.2],["knowledge:snare_wire","add",0.4]]`.
I corrected the pin to the code's actual (verified-correct) arithmetic
and re-ran: **11/11 green.**

Pinned values (deterministic, same game, sequential grants):
- L0 → 0.4 exactly
- det-gate: 4 unrelated L3 skills (fire_rain, wound_care, foraging,
  track_read — all with live mechanicals) → trapChance byte-identical
  (=== 0.4). The pipeline is invisible when snare_wire is absent.
- snare_wire L1 → 0.4 (L1 is `unlock: make_snare` only — adds nothing)
- snare_wire L2 → 0.6 (cumulative +0.2)
- snare_wire L3 → 1.0 (cumulative +0.2+0.4; capped 0.95 at the
  checkTraps call site)
- source tag `knowledge:snare_wire` present on both add entries.

End-to-end (real `checkTraps()` dawns, seeded RNG, one snare on
game-rich ground; wildlife + trap uses + trap-shyness reset each dawn so
the per-dawn probability is what's measured — shyness is a separate
mechanic, honestly noted):
- 60 seeded dawns: L0 catches = 22/60 (≈0.4), L3 catches = 57/60
  (≈0.95 cap). Strictly more on the identical seed.

## Reachability: can a scholar actually attain L2/L3?

Full grant inventory for the PLAYER's snare_wire (every learnSkill path
in src/js, checked):

| Source | Level | Notes |
|---|---|---|
| grantOccupationSkills (occ.granted) | 1 | characterGen occupation lists |
| grantBackgroundKnowledge, non-core | 1 | occupation contains a background string |
| grantBackgroundKnowledge, CORE occupation | **2** | occ exactly/startsWith one of the 9 backgrounds (e.g. "hunting guide") — game.js:17916 |
| teachSkill (conversation lesson, incl. sim-snareteach-b's wire lesson) | 1 | skill-teaching.js:174 "Learner gets L1" |
| theorized (conversation) | 1 | game.js:16733 |
| books (jackpotBook) | 1 | trappers_handbook skillLevel 1; no book grants snare_wire higher |
| jackpot 'insight' | 2 | rare skills ONLY — snare_wire is common, ineligible |
| playerTrackSkills | 1 | snare_wire is in no track list (tracks.json) |
| gainSkillLaneXP (6/12-use practice deepening) | +1 → 3 | **gated on abilitySkillId(id)**: needs a skill-lane ability carrying the skill. Verified across ALL src/data/*.json: 40 skill-lane abilities, none maps to snare_wire. **This is the missing rung.** |
| progression.js trial | 1 | |

**Verdict: L2 reachable ONLY via core-occupation background (day-1,
e.g. hunting guide). L3 unreachable by any traced path.** The exact gap:
practice-deepening (`gainSkillLaneXP`, game.js:26247) only fires for
skills carried by a skill-lane ability — snare_wire has no carrier, so
the "use it and it gets better" line the wire lesson itself speaks
("That's the start. Use it and it gets better." — sim-snareteach-b
sense-test) is a promise the engine cannot keep for this skill.

Per the brief, I do NOT invent the fix: choosing what earns snare_wire
XP (trap set? trap checked? catch?) and at what thresholds is a
progression-design decision for Steve, not a mid-run invention.

## Sense test

checkTraps() narration (game.js ~3666): the catch line is identical at
every rank — "🪤 TRAP: Your Snare here caught a cottontail rabbit! ..."
The knowledge.json L3 flavor promises "Your traps rarely sit empty," but
no voiced line ever reflects the trapper's skill. The mechanical is
fiction-invisible. (Observation, not a fix mandate — voicing is a
content decision.)

## Verdict: BOUNDED

- #631's "zero callers" claim: **measurement artifact, closed with
  proof.** The pipeline is live end-to-end (11/11 pins + 60-dawn e2e
  22→57 catches on the identical seed).
- #631's spirit survives in bounded form: **pipeline live, L2 reachable
  only via core-occupation background, L3 unreachable via the exact gap**
  (no skill-lane ability carrier → gainSkillLaneXP can never fire for
  snare_wire).
- No game-code change shipped; no pilot spend. Zero game-code trace left
  in the tree (instrument + this evidence only).

Related observations for the backlog (documented, not fixed):
- L1's `make_snare` unlock lane is genuinely dormant: `hasKnowledgeUnlock`
  has ZERO callers in src/js (modifiers.js defines it; game.js:26407
  exposes it; nobody calls it). Snare crafting flows through the recipe
  lane (recipe L1 via teach/witnessed beats) instead. Same dormant class
  as the known make_snare finding — confirming it, not duplicating it.
- `grantKnowledge('skill', …)` (game.js:17738) has zero callers — the
  unified grant path's skill case is unwired.
- The snareteach-b evidence's "s11's scholar starts at snare L3
  (occupation)" could not be reproduced from its per-seed JSONs
  (no snare_wire entry in leadfeast-s11.json) and contradicts the code
  trace (background caps at L2). Likely loose phrasing for recipe L3 or
  the L2 background grant; flagging so the corpus doesn't calcify it.

## Metric review

- The pre-registered judge (the proof test's pins) held: the pipeline
  question was answerable without a single sweep. The brief's no-pilot
  rule for no-fix runs was the right call — a 16-seed sweep would have
  measured shyness and ecology noise, not the wiring question.
- My own first-run failure was an arithmetic error in the EXPECTATION
  (0.8 vs the correct 1.0), not a code bug. Pinning "whatever the code
  actually does and saying which" (the brief's wording) is what caught
  it — the test printed the modifier list, which made the correct
  composition auditable. Keep that reporting shape in future pin tests.
- The det-gate as run (5 loadouts byte-identical) was cheaper and more
  diagnostic than the prescribed 8/8 full-trajectory gate; for a wiring
  question, modifier-level determinism is the right instrument.

## Files

- scripts/test-snaremech-b.js (11/11 green; the instrument)
- evidence/2026-10-19/sim-snaremech-b.md (this file)
