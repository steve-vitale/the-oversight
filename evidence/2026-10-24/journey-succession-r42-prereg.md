# Journey succession r42 — THE SUCCESSOR'S LIFE (lane B, pre-registration 2026-10-24)

Leg 7 (succession). Rotation-b read 7 → write 4 (next run plays leg 4, endgame).
r39/r41 covered death → funeral → meal-gate (all stay-green). The second half
of the leg was never the question: what does the new bearer DO for the next
month? A mantle that passes cleanly but leaves a figurehead is not a village
protagonist. This run asks whether the successor LIVES as the scholar.

## Leg question
After a clean mantle pass, does the successor function as the scholar over
30 post-death days — keeping their OWN build (parity, COHERENCE-SPINE.md:
"the successor keeps their own build"; villager-build.js mantleBecome:
scholar.abilities/tracks/godhood ← the successor's own villager records,
the dead bearer's die with them), earning and progressing (level-up sheets,
System voice, Codex growth, track XP), holding the village together (trust,
pantry, roster) — or does the village stall, the successor stagnate, or a
chain-death spiral eat the chair?

## What counts as an interesting finding
- Post-death scholar.abilities containing a dead-bearer ability the successor
  did not already hold (parity violation — REAL BUG).
- Post-death scholar.abilities NOT equal to the successor's pre-death
  npcAbilities (wipe, or inheritance — REAL BUG unless explained).
- Zero scholar-function signals in 30d (no level-up sheet/choice, no System
  offer/grant line, no Codex growth, no track-XP gain): a figurehead bearer.
- Successor dead within 30d with no chain mantle, or ≥2 chain mantles on one
  seed (chair-eating spiral).
- Trust collapse (successor trust falling through the run) or pantry crash
  to zero with villagers alive.
- A successor first-days transcript that is senseless (fortune-cookie loop,
  fabricated shared history, static menu) — the dialogue lane's, reported.

## Seeds / policy
Seeds 23001–23004 (fresh; verified unused — no prior succession script or
evidence uses the 230xx band). Policy: competent (same as r41, continuity).
Horizon: phase A 40d competent, kill via the REAL playerDeath ('a hushwolf')
if no organic death; post-death 30d competent play as the successor.
Death-aware stop (+10d tail): a dead/scattered village stops simulating.
Convo checkpoints: d+3, +7, +14, +30 (2 top-trust villagers each, fired on
first day at/after the checkpoint so day-jumps cannot skip them).

## Bindings (§14 — a miss is NO-GO, never re-scored mid-run)
- S1 scholar continuity: at +30d (or death-aware end), a living successor
  holds the chair AND scholar.day advanced ≥25 days across the post window.
  Bar: 4/4 non-excluded seeds.
- S2 build parity: post-death scholar.abilities (ids) == successor's
  pre-death npcAbilities (ids), AND no dead-bearer ability appears that the
  successor did not already hold. Bar: 4/4 seeds with a readable pre-death
  record; if unreadable on all seeds → SUBSTRATE-MISSING, reported, not
  re-scored.
- S3 scholar function: ≥1 function signal in the post window (level-up
  sheet/choice for the successor, System offer/grant line, Codex plant/skill/
  ability growth, or scholar track-XP gain). Bar: ≥3/4 seeds.
- S4 continuity: a living successor (or chain successor) at +30d on ≥3/4
  seeds; chain mantles and second-death causes recorded, never hidden.
- S5 stay-green (r41 regressions): M1 funeral arc ≥3/4, M4 machinery 4/4
  (linOk + moOk), MG2 meal gate 0 violations on 4/4 seeds.
- S6 people: 0 identity failures across sense-read transcripts (8/seed).
- S7 (guardrail): no fabricated-history lines in sampled successor-era
  convos; transcripts sense-read, not counted.

## Informational
- F1: successor trust at mantle / +7 / +14 / +30.
- F2: pantry kcal trend (mantle / +7 / +14 / +30) and roster alive/fallen.
- F3: System-voice counts post-death (◈ lines; offer/grant subset).
- F4: Codex deltas (plants/skills/abilities levels) across the post window.
- F5: chain-mantle causes; village census in plain words.

## Metric review
(written after the run)

## Canon
docs/CANON.md (manifest) + docs/COHERENCE-SPINE.md (parity rule, ladder) +
src/js/villager-build.js mantleBecome (field-by-field contract). No new canon
invented. Note for the record: the BLOODRESTRAINT succession hook is DEAD on
master — reverted by coordinator commit fa10e1ca8 per kill discipline
(mechanism-scoped NO-GO on the vetrestage band); this run does not re-litigate
it and runs default settings.
