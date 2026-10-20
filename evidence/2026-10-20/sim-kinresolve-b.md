# sim-kinresolve-b — fix backlog #697: literal "{kin}" in arm-surge devotion beat

Date: 2026-10-20 | Run: oversight-flesh-out-loop-b (second axis) | Worker: sim-kinresolve-b
Convergence: **converged** (proof-green fix, blank filled)

## Pre-registration (metric binding, MEASUREMENT.md §14)

- Primary metric: literal "{kin}" in the arm-surge beat's player-facing message over a 16-fixture seeded corpus (RED: 16/16 → GREEN: 0/16).
- GO threshold: GREEN corpus exits 0 iff 0/16 contain "{kin}" AND every message holds the holder's real resolved kin first name.
- Horizon: N/A (single beat invocation, death-aware horizon not applicable — beat only).
- Seeds: 5601–5616 (16 fixtures). Policy: N/A (single-player beat driven directly).
- Balanced panel: N/A — text-only one-hunk fix; instead the DET-GATE (16 paired seeds, armed vs control byte-identical digests) stands in for the before/after instrument.

## Canon

docs/CANON.md read. No canon doc covers keepsake text resolution; operative canon is
the engine's own rule at lifeseed.js:342-354 — "No unreplaced placeholders ever
reach the player" — via `resolveKeepsakeText(char, def, text)` filling
{kin}/{first}/{place} from the character's lifeseed. Nothing invented.

## Root cause

src/js/progression.js ~L405 (`channelSentiment`): the arm-surge/beat-identity
devotion beat did `const mem = String((def.memory || def.flavor || '')).trim();`
using def.memory RAW, bypassing `resolveKeepsakeText`. `playFlashback`
(progression.js ~L448-452) already routes through the resolver; the beat did not.
The dog_tags def (src/data/items.json:959) carries `"kin": "friend"` and its
memory holds two `{kin}` tokens → 8 occurrences leaked in evidence
sense-dutyfish-b-s5601.txt.

Deviation from the brief's prescribed hunk (documented, not chased): the brief
resolved against `s = this.state.scholar`. Probing a live harness run showed the
scholar object carries NO `name` and NO `lifeseed` — the player's identity lives
on the villager record `this.vpOf(this.villagerId)` (verified: "Dante Richter",
lifeseed with 3 people). Resolving against bare `s` would have been a dead fix
(the `holderOk` guard fails in production exactly as in the harness). The landed
hunk mirrors playFlashback's holder logic instead: holder = villager record for
`item.owner || this.villagerId`, with the same `ensurePersonLifeseed` guard for
hydrated-successor stubs, then the `resolveKeepsakeText` guard.

## RED (before fix)

`MODE=red node scripts/test-kinresolve-corpus.js` — 16/16 fixtures showed the
beat's actual `channelSentiment` message containing literal "{kin}":

> "You hold Dog Tags. Not yours. {kin}'s. You carry them so someone is remembered — the promise you made in the dust. {kin} would laugh at you carrying them into the apocalypse."

(matches evidence sense-dutyfish-b-s5601.txt exactly). holderOk=false on the bare
scholar, confirming the naive `s`-based guard would not have fired.

## GREEN (after fix)

`MODE=green node scripts/test-kinresolve-corpus.js` — 16/16: no literal "{kin}",
and every message holds the holder's real kin first name (Earl, Giuseppe, Wilson,
Rosa, Eric, Miriam, Aisha, Dariga, Valentina, Natalia, Grace, Ernestine, Brayden,
Kate, Lujain — 16 distinct names, lifeseed-resolved per fixture):

> "You hold Dog Tags. Not yours. Earl's. You carry them so someone is remembered — the promise you made in the dust. Earl would laugh at you carrying them into the apocalypse. Your gifts are not mastered — but they are lived-in, and they are with you. ..."

## DET-GATE (text-only change proof)

16 paired seeds (5601–5616), fixed tree vs `HEAD` control:
- tin_cup (memory has no placeholders): full digest INCLUDING the rendered message → byte-identical 16/16.
- dog_tags: state digest (trauma/day/stats/abilities/feastSurge/chanDay/inventory) → byte-identical 16/16 (message differs by design — that's the fix).

No trajectory moved. `node --check src/js/progression.js` clean. `node scripts/check.js --quick` run (see green list; no new failures).

Digests: evidence/2026-10-20/det-kinresolve-fixed.json, det-kinresolve-control.json.

## Metric review

The brief's pre-registered "16 paired seeds byte-identical trajectories" was
underspecified: a correct fix necessarily changes the rendered message text on
the dog_tags path. Applied as: placeholder-free item → full trajectory identical;
placeholder-bearing item → state identical, message differs only by placeholder
resolution. No re-scoring occurred — the corpus definitions were written before
the fix and held.

## Reachability

N/A — text-resolution bug in an already-reachable beat (devotion lane,
surgeResonance >= 35).

## Village assessment

Not a sim run; no village observed. Sense-check on the evidence message: the
fixed line reads as a person grieving a friend — "Earl would laugh at you
carrying them into the apocalypse" — and the resolved name is the holder's own
lifeseed kin, so the beat now knows WHO the tags belonged to.

## Blanks filled

1. #697 FIXED: arm-surge devotion beat resolves def.memory through
   resolveKeepsakeText against the holder's lifeseed — no more raw placeholders.
   One hunk in src/js/progression.js only; no game-code interaction beyond it.

## Findings (documented, not chased)

- [open] 2026-10-20 — keepsake-resolution — app.js:14585 (`knackSheet`)
  renders `c.memory` raw via esc(). CHECKED: not a leak — spawn-knack.js
  `fillKnackMemory` resolves {kin}/{place} against the character's lifeseed
  before choices are stored, so the sheet renders pre-resolved text. Safe today;
  any future sheet that renders def.memory raw would leak the same class.
- [open] 2026-10-20 — keepsake-resolution — other `{kin}`-bearing defs:
  mothers_ring, reading_glasses, dead_phone, photo_album, locket, lucky_coin
  (all resolved now in the beat path; playFlashback already resolved them).
  Audit point: any other consumer of def.memory/flavor should route through
  resolveKeepsakeText.
