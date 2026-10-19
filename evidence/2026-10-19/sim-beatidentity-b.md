# sim-beatidentity-b — narration/sense blank fill (2026-10-19)

Worker: loop B, run fleshout-loop-b (worktree sim-beatidentity-b).
Canon read: docs/CANON.md + docs/CONVERSATIONS.md first. Both findings are
2026-10-13 narration/sense items from hidden_files/sim-findings.md (still
[open] at run start). This is a narration fix, not a balance lever: proven
with pinned deterministic fixtures (RED->GREEN), not long sims.

## The blanks

1. **Devotion beat verbatim across items** — the surge-arming line
   ("You hold X. Your gifts are not mastered — but they are lived-in, worn
   smooth by use, and they are with you. The feast was the weapon.") slotted
   only the item NAME into a fixed string. Contract Quill, Mixtape, Hard
   Candy, Grandma's Tin Cup read word-identical in one leadfeast run.
2. **Pantry-spoil mutter verbatim across speakers/days** — "Should've smoked
   that. Fresh stuff keeps a day or two on the shelf — the smoke rack is right
   there." fired word-identical from Walt (d16), Nina (d17), Jesse (d21),
   Caleb (d76) on seed 22. (The 2026-10-17 prosefix #439 had already made the
   full teaching once-per-run + condensed repeats; the condensed mutters were
   still anonymous "Someone" with no speaker/day variety.)

## The fix (voice only, zero mechanics, zero RNG draws)

**progression.js — channelSentiment (both surge-arming lanes).** The item
def's `memory` field (the holder's lived story of THIS object — all 38
sentimental defs carry one; `flavor` is the fallback) is now threaded between
"You hold X." and the beat core. The generic "worn smooth by use" is retired:
the memory now evidences it. Beat core and honest FEASTED terms unchanged.

**food.js — spoilVoiceLine (knows-smoking mutter path).** The mutter now names
a real villager via new `_spoilMutterSpeaker(day)`: deterministic by DAY
(same day → same speaker; different days → usually different speakers), no
RNG draws — spoilVoiceLine keeps its exact one-`_beatCast`-draw-per-call
discipline (det-gate findings #263/#264). Variant keeps rotating on the
existing per-run counter. The once-per-run teaching and condensed repeats are
byte-identical. Because the speaker name is embedded in every mutter,
different speakers can never emit the identical string (pinned by a 60-day
sweep); same-speaker repetition weeks apart is a person repeating themselves,
not the theater-class bug.

## Before/after reads (sense-checked by the builder)

BEFORE (devotion): "You hold Contract Quill. Your gifts are not mastered —
but they are lived-in, worn smooth by use, and they are with you. The feast
was the weapon." — identical for all four items but the name.

AFTER (devotion):
- Tin Cup: "You hold Grandma's Tin Cup. Grandma drank her coffee from this on
  the porch every morning for sixty years, rain or shine, and always poured a
  finger's worth onto the ground first — 'for the ones who aren't here.' You
  still do it. Your gifts are not mastered — but they are lived-in, and they
  are with you. The feast was the weapon. (...)"
- Quill: "You hold Contract Quill. It has signed three leases, two loans, and
  one terrible contract you still regret. The penmanship was always excellent.
  The judgment, less so. Your gifts are not mastered — ..."
- Mixtape: "You hold Mixtape. Hand-labeled: 'FOR THE DRIVE.' No player. The
  songs are in your head anyway — you hum them when you work, and the work
  goes faster. ..."
- Hard Candy: "You hold Hard Candy. Butterscotch, doled out like medals —
  good report card, brave dentist visit, the day the dog died. Small
  sweetness, on purpose. ..."

BEFORE (mutter): "The village threw out spoiled stores: venison. Someone
mutters about the smoke rack going cold. (pantry)" — anonymous, and pre-#439
the full teaching repeated byte-identical across named speakers.

AFTER (mutter, finding's days): d16 "A man, maybe 20s mutters about the smoke
rack going cold." / d17 "A woman, maybe 50s kicks the ash pile. The smoke
rack stays empty." / d21 "A woman, maybe 20s gives the smoke rack a long look,
then walks off." / d76 "A woman, maybe 20s mutters about the smoke rack going
cold." — four distinct strings, voiced, physical. (Speakers are
knowledge-gated descriptors — same mechanism as the existing teaching line.)

Builder's sense verdict: both variants read better, not worse. The devotion
lines read as the speaker knowing the object; the mutters read as distinct
people noticing a loss. Shipped.

## Proof

scripts/test-beatidentity-20261019.js — RED->GREEN, GREEN 0 failures:
- PART 0 (RED, pinned base f53227a4): old verbatim devotion line, name-only
  slot, anonymous mutters confirmed on the pre-fix tree.
- PART A (GREEN fixtures): 4 items → 4 distinct devotion lines AND 4 distinct
  mastery lines, each carrying its own memory phrase, beat core + FEASTED
  terms intact; 60-day mutter sweep: identical strings only ever repeat from
  the same speaker; determinism (no RNG); prosefix invariants preserved
  (same-day rotation m4===m1, ≥2 variants; first voicing keeps the full
  teaching verbatim; repeats condensed).
- PART B: full lines printed for human sense-read (above).

Regression: scripts/test-prosefix-20261017.js re-run — PART A all PASS,
PART B spoil forms vary (2 forms observed in the wild). PART B's "feasts
fired in the sim" assertion failed on both my tree AND a pristine-base
checkout (identical seeds 141/252/363/474, 0 feasts either way) — pre-existing
seed/economy drift since 2026-10-17, not caused by this change (the edits are
voice-only; no RNG draws added or moved, so sim trajectories are
byte-identical to base).

## Metric review

No pre-registered balance metric — narration fix, not a lever. Convergence
state: fixed (pending coordinator merge + findings backlog update).

## Files

- src/js/progression.js — item-memory threading in both surge-arming lanes
- src/js/food.js — day-keyed speaker mutters + _spoilMutterSpeaker
- scripts/test-beatidentity-20261019.js — RED->GREEN proof
- evidence/2026-10-19/sim-beatidentity-b.md — this note

Narration text only; no UI surface changed — no [needs-eyes] in the commit.
