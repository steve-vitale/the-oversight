# break-it knowledge r4 — 2026-10-11: the guided-sow identify machine

Worker: break-knowledge worktree. Target: knowledge system (index 2).
Canon check: **no dedicated canon doc covers the knowledge system** — there is no
docs/KNOWLEDGE.md or docs/CODEX.md. docs/CANON.md's manifest lists no knowledge doc.
Governing law came from standing rules ("If you don't know, it doesn't show",
per-item knowledge levels, village-naming, teaching model) in CANON.md, PERCEPTION.md,
CONVERSATIONS.md, and MEMORY. Recommendation: register a docs/KNOWLEDGE.md (the
disease roster was reinvented wrong twice for exactly this reason).

## CATCHES (all fixed, proof below)

### 1. EXPLOIT — guided sowing minted free L1 identification (BROKE)
`sowPlot()` granted `grantKnowledge('plant', pid, 1, {type:'experiment', by:null})`
for any guided plant — instant L1 + integrate(3) with NO teacher, NO language
barrier, NO trust/occupation quality gate, NO wrong-knowledge counterplay. Any
plant any garden-duty villager knew was identifiable for 2 seed units + 16 ticks.
The honest teaching model (teachPlant) was bypassed wholesale.
Fix: guided sowing routes through the real `teachPlant(guideVid, pid)` primitive
via the new `guideForPlant(pid)` — good teachers land the name, poor teachers
build familiarity toward the field-click, wrong teachers teach you wrong.

### 2. HONESTY — sow sheet showed true names of unlearned plants (BROKE)
`sowOptions()` put `plant.name` (true name) on guided-unlearned options while the
sheet's empty-copy promised "KNOWN". The UI leaked what the engine hadn't taught.
Fix: guided-unlearned options show the honest descriptor + "(guided)" tag;
kcalEach gated to null pre-learning; copy corrected (app.js).

### 3. HONESTY — villagerSowPlot narrated the true name of unlearned plants (BROKE)
`"Mara sowed Cattail in the empty plot"` — the player learns the name by osmosis.
Fix: narration goes through `plantCalledName()` (believed name / descriptor).

### 4. HONESTY — the knowledge store was split in two (BROKE)
`villagerKnowsPlants` (food.js) read ONLY `v.plantKnowledge` (occupation
background); conversation's `plantKnownBy`/`plantsKnownBy` read ONLY
`v.familiar`/`v.taught` (region background + in-run). Result: a botanist could
sort your bag and guide your sowing by a plant they "couldn't teach you" in
conversation ("doesn't know that one either"), while a region-familiar local
could teach in talk but not sort or guide. Two contradictory villagers.
Fix: `plantKnownBy`, `plantsKnownBy`, and `villagerKnowsPlants` all read the
full union (familiar ∪ taught ∪ plantKnowledge), as the docstring always promised.

## HELD (attacked, resisted)
- Integrate one-shot: identifyPlant/grantKnowledge refuse repeats (T5).
- Monster naming: displayName funnel, stage lifecycle (encountered→observed→slain),
  patterns recorded via tbLearnPattern, small-village knower threshold, one-shot
  naming integrate — all held (read audit).
- Fireside/rumor teaching: presence-gated, taught[]/codex sync invariant held.
- Dead-code: every src/js file on disk is loaded in index.html (no dead modules).
- Debug scenarios: only debugDay7Experience writes codex directly (3 L1 plants for
  a "lived-in week 1" — fiction-consistent; flagged, not changed).

## Proof
scripts/test-break-knowledge-r4-20261011.js — 15/15 x3 seeds (20261011, 99, 4242).
BEFORE=1 (pre-fix HEAD): 8 FAIL — every exploit/honesty assertion fails, held
assertions pass. Covers all four classes.

## Regressions (all green on the fix)
- test-break-knowledge-20261010 (28), -20261010c (34), -r2-20261010 (40), -r3-20261010 (11)
- gating, softlock, sibling-teach, tradeecon, wrongwipe, firesidewrong (20261008) — all pass
- test-item-knowledge-gating (24), test-knowledge-forage-leak-20261008 — pass
- test-pantry-knowledge-gating: 28/29 — the 1 failure ("unknown line shows no count")
  is PRE-EXISTING: identical on HEAD (a sibling's pantry render added
  `~${unknownKg.toFixed(1)} kg`; the old test regex doesn't strip it). Untouched by
  this fix (my app.js diff is openSowSheet only — verified via git diff).

## Sibling sweep (same bug classes)
- Diseases pools: untouched; r3 asserted symptom-only surfaces — no new writes.
- Monster meat naming: refreshMeatNames + canShow item gate — held.
- Loot items: itemDisplayName funnel — held.
- applyFlashbackReveal (progression.js) writes L2 silently — the flashback scene IS
  the narration (canon: flashbacks teach); flagged, not changed.
