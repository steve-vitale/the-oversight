# Journey leg 5 — social life (2026-10-12, run 2026-10-12T05:00:48Z)

**Leg:** social life (conversations, gossip, moots, friendships, rivalries across a full run). Rotation 5→6 (succession next).

## Play
Full-run sim harness (`scripts/journey-social-life-20261012.js`, dated copy of the
2026-10-11 script) — competent survival base + socialite layer, real full
conversations driven through the natural player path, 5 social contexts
(A day-1 nudge, B first meeting, C friendship, D talk request, E moot).
2 fresh seeds, DAYCAP=140.

| seed | end | fullConvs | naturalEnds | quickTalks | feasts | moots | met |
|------|-----|-----------|-------------|------------|--------|-------|-----|
| 20261012 | village-lost day 78 | 24 | 21 | 249 | 11 | 2 | 11 |
| 555 | village-lost day 26 | 15 | 15 | 86 | 3 | 0 | 11 |

## Village assessment (plain words)
**Seed 20261012** — David the plumber outlived everyone. Carlos (monster, d28),
Marcus (combat, d56), then the whole village went to "the phoenix link" at
d56–67: Linda, Carmine, Sofia, Emma, Rosa, Eduarda to ash; James, Lena, Barra
to the broken link. By day 78: one man, an empty pantry (0 kcal), 23 plants in
the codex, and a village's worth of unanswered names. **Seed 555** — the
monsters ate the village in 26 days: 8 monster kills by d19 (Van d13, Sofia
d17, Ritu/Lena/Evelyn d18, James/Emma d19), Jack starved d22, Earl died in
combat d26. The pantry still held 24,107 kcal — they didn't starve, they were
hunted. What was missing both runs: nobody lived long enough for the social
layer to pay rent — the people-check quality is real, but it's being proven on
villages that die at the speed of the monster curve.

## People check (sense-tested transcripts)
- Jimena (day 18, trust 51): remembers the unfinished favor from 2 days back,
  states a real need (water run), shows you her thinking place ("don't tell
  the others"), lands the monster-naming debate ("The Loud Beast" vs the pack).
  A real person. THEN the driver re-asked and she snapped "I just said — did
  you miss it?" three times verbatim. → FIXED (see below).
- Sofia (day 30, trust 90, pre-fix code): the same verbatim parrot x2, but ALSO
  "You asked me that before. It's a different question now." — honest memory —
  and the naming moot ('The Reverend' got shouted down), and a regret beat
  ("I didn't say what I needed to say. To someone. Now I can't." / Quiet.
  "Yeah. I think everyone's carrying one of those.") that reads like an actual
  person at a fire.
- Day-2 nudge (James): real want (sick, needs a healer), stated cleanly,
  commitment made ("I'll do it."), natural close ("This was good."). The
  deferred-favor fix from earlier today is holding.
- Moots fired (2+2+2 across seeds) but the moot transcript capture is thin —
  mootNotes records the petition fired, not the exchange. Documented blank,
  not fixed.

## Blank filled: self-repeat deflections parroted verbatim
`sayLine`'s no-repeat ledger exempted the "I just said — did you miss it?"
fallback by design, so consecutive blocks spoke it VERBATIM (x3 observed).
Fix: `Game.convoSelfRepeatLine(vid)` — per-conversation cycling pool
(canonical first, two escalating variants, cap at 9 → canonical), mirroring
the convoDryLine architecture. Wired at all three call sites (base turn tail
in conversation.js, betrayal finish in betrayal.js, dlg:help blocked repeat
in convo-dialogue.js — which additionally passes the SAME cycled line as
sayLine's fallback so re-fires can't desync the claimed line from the
transcript).
Proof `scripts/test-convo-deflect-cycle-20261012.js`: 11/11 GREEN (cycling
semantics, base-tail contract, dlg:help blocked repeat — no desync, no
verbatim parrot). Regressions: norepeat-fallback 9/9, gossip 9/9, ontology
83/83. (playtests/test_conversations.js fails identically with and without
the fix — pre-existing stale harness module list, missing resolveConsequence;
not caused here.)

## Verdict
- **Reachable: YES.** Conversations, talk requests, moots, feasts, naming
  debates all fire organically in competent play; 39 full conversations with
  36 natural ends across 2 seeds.
- **Fun: YES, with a robot-shaped hole now patched.** The favor/want arcs,
  NPC memory, and regret beats read like people. The verbatim parrot was the
  one recurring break — fixed.
- **Winnable: PARTIAL — survival, not sociality, is the binding constraint.**
  Neither village reached day 140 (day 78 wipe via the phoenix link; day 26
  monster wipe). The social leg's content is solid; it just needs villages
  that live long enough to be social.

## Blanks documented (not fixed)
1. Moot transcripts are thin — mootNotes records the petition fired, not the
   exchange. A future social run should capture the moot as a transcript for
   the people check.
2. Social-layer survival: monster attrition kills villages at the speed of
   the monster curve (8 kills by d19 on seed 555). The socialite policy's
   village lives or dies on combat levers — out of this leg's mandate, but
   the social leg's verdict depends on it.
