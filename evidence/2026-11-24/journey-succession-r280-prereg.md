# Journey succession r280 — Lane B, leg 7 (succession) — PREREGISTRATION

Written before any r280 fix or play. This run is TWO things in
sequence, on one branch (`journey2-7`):

1. **Adoption closeout of r279.** The 07:58:50Z adoption run landed
   two commits (panel + run note) and died in the VM restart
   (~09:26Z) before merging. This run verified the held branch
   (rebase onto master clean, 7 carried proofs GREEN on the
   rebased tip, gate re-run — see the r280 run note for the gate
   verdict), then merges it, releases the tree, and writes
   rotation-b 7 → 4 (r279's closeout, as its prereg promised).
2. **The filed r279 fixes (this run's fresh work, leg 7).** r279
   ended with two FAILs, both filed for the next run — this run:
   (a) drift-note beats served through the repeat-ledgered
   sayLine path dry to a spoken meta-line; (b) mourning second
   sittings repeat the first sitting's shape about the same
   dead person. Both are game-code fixes with proof tests and a
   matched-replay panel (below). Rotation stays 4 after this
   run — the next run plays endgame.

Lock: `playtest-loop-2.lock` run_id
`playtest-loop-2-2026-11-24T09:55:00Z` (stale-lock recovery of
the 07:58:50Z lock: 1h56m old, registry heartbeat 09:09:30Z,
no live coordinator process, VM restart ~09:26Z per uptime).
Worktree: `~/workspace/worktrees/journey2-7` (adopted tree,
registry re-pointed to this run; heartbeat loop
`journey2-7-hbloop-r280.sh` every 5 min, setsid).
Flap W27: 10:02–~10:05Z (~3 min, EPERM on fresh-file writes +
git ref write; probe `git update-ref refs/heads/probe HEAD`
failed, then passed 10:05Z). Registry repoint hit it once
(0-byte REGISTRY.json.tmp, live registry untouched); repoint
retried clean 10:16Z after the lock flowed.

## Standing state (what r279 left)

- DRY CENSUS FAIL: 1 other-class hit — seed 34547 d35 Benoit,
  drift note `"Benoit has an edge today — something curdled."`
  run-blocked (said in an earlier sitting) and sayLine served
  the honest dry line `"...Sorry, lost my train of thought."`
  instead. Stage direction replaced by spoken meta-speech.
- MOURN-TEMPLATE FAIL: 2 verbatim repeats, both at the d+3→d+8
  window edge — 34544 Gabriela (Tashi d+3 / Javier d+8,
  opener:owed-favor), 34549 Claire (Tebogo d+3 / Enrique d+8,
  opener:burnt-piece). Different speakers, same shape, same
  dead, dplus difference exactly 5.
- REL-WIT INSUFFICIENT-DATA (1 draw, 0 servings) for the third
  straight panel — bottleneck is now the lately-event naming
  the staged dead, NOT sitting supply. NOT this run's work:
  the lately-naming step is a separate staging-design question,
  carried, not re-scoped here.
- Controls re-baselined by r279 measurement: smoke 33998 —
  handoff d6 Heinrich → Grace, relPost bonds 33, relD14 47,
  relEnd 50, mourning servings 0, NPC-NPC bonds 15, selfId
  grace_obi.

## Fix 1 — drift-note stage directions bypass the repeat ledger

Root cause (verified in code): `convoDriftNote(vid)` returns a
stage-direction beat (`"X has an edge today — …"`); the caller
(conversation.js, the opener's drift-note site) serves it
through plain `sayLine(vid, dn)`. The five drift sentences are
shared across villagers and a re-crossing re-serves the
identical sentence, so the run ledger blocks it and sayLine's
fallback serves the spoken dry line. The note is already
stamped at most once per day per villager; the ledger adds
nothing for it.

Fix (src/js/conversation.js): a `stageDirection: true` opt on
sayLine — exempt from the self/run blocks and from the
run-ledger feed, exactly parallel to the existing `structural`
exemption (a stage direction is narration, not NPC speech).
Call sites: the opener's drift-note serve AND the held-beats
path (a drift note held for the continuer carries
`driftNote: true` through the goon turn, which serves it with
the same exemption instead of substituting a thread beat).
Fallback when blocked is now unreachable for drift notes; no
other sayLine caller changes.

Proof test: `scripts/test-journey-succession-r280-driftnote-stage.js`
— stage a villager with drift bitterness ≥2, poison the run
ledger with the villager's own drift-note line (as if said in
an earlier sitting), open a conversation: FIXED, the drift
note IS served (no dry line in the transcript); UNFIXED, the
dry line (RED). Control: no poisoning — the note serves
normally. Held-path case: the note is held behind an
opener-owned reply and served on the continuer — still the
drift note, never a substitute.

## Fix 2 — mourning second sittings steer away from the first sitting's shape

Root cause (verified in code): the mourning opener pool
(t2gen_lately, 5 generic single-name templates + relationship
variants) is picked per-villager (convoPick key `t2:lately`),
so a second speaker about the same dead person draws fresh
from the same 5. The village-fresh preference
(`villageLineFresh`, LINE_FRESH_DAYS=5) does not engage at
the failure geometry: d+3→d+8 is a difference of exactly 5,
and the steering counts that FRESH (`>= 5`) while the
MOURN-TEMPLATE bar counts it a violation (`<= 5`). The
preference is also only a preference — when no template is
village-fresh it collapses to the per-villager pick.

Fix (src/js/convoTopics.js, topic2Ask): village-level shape
memory per dead person, `state.village.mournShapesServed`
(deadId → [unfilled template strings]). In the stage-1
fill-aware retry, a candidate whose template is already
recorded for THIS dead person (single-name mourning only,
deadId present) is skipped like a ledger-blocked one, and the
first candidate that is neither blocked nor already-served
about this dead person wins. If NO candidate passes, the
original pick returns unchanged (current behavior — the
last-resort gap, documented, not papered over; this keeps the
fix from converting a MOURN-TEMPLATE risk into a
MOURN-EXHAUST one). After the final template is decided, it
is recorded for the dead person. The stage-2 prefixed retry
stays carved out for mourning (unchanged). Follow-up shapes
(cope/next/part) are NOT steered by this fix — the filed
failure was openers only; a follow-up repeat is a separate
filing if a panel shows one.

Proof test: `scripts/test-journey-succession-r280-mourn-shape-steer.js`
— stage one death, speaker A serves a mourning opener about
the dead, slide the run ledger past A's line (48 filler
entries, the d+3→d+8 geometry), speaker B opens a mourning
lately about the SAME dead: FIXED, B's served template differs
from A's; UNFIXED, B can re-serve A's shape (the test forces
it: B's per-villager said-list is pre-filled with the other 4
templates, so an unsteered pick MUST draw A's). Control: no
prior serving — any of the 5 serves, no dry line. Exhausted
case: memory pre-filled with all 5 templates — B still serves
a line, no crash, no dry line (fallback documented).

## Panel — matched replay (NOT a fresh band)

Driver: `scripts/journey-succession-r280-20261124.js` (r279
driver, rename-only fork). Analyzer:
`scripts/analyze-journey-succession-r280-20261124.js` (r279
analyzer, rename-only fork). Runner:
`scripts/run-journey-succession-r280-panel.sh`.
Seeds: the SAME band as r279 — 34542–34565 (24 fresh-in-r279
seeds; EARLY_KILL_DAY=40, POST_DAYS=70) + positive control
34403 + smoke 33998 (EARLY_KILL_DAY=5, POST_DAYS=25).
This is a MATCHED before/after replay, not a fresh panel:
the question is whether the two wild failures recur on the
exact trajectories that produced them. Seed-band freshness:
band 34542–34565 was r279's fresh band — reuse here is
INTENTIONAL and declared; no new band is consumed.

## Bars (binding, §14 — carried from r279 unless noted)

- DRY CENSUS: 0 dry hits of any class on the matched replay.
  The Benoit drift-note hit must be GONE on seed 34547 (same
  seed, same day, fixed code serves the note).
- MOURN-TEMPLATE: 0 same-speaker same-shape firings for
  different dead AND 0 different-speaker same-shape same-dead
  firings within 5 days (double-stage exemption unchanged).
  The 34544 Gabriela and 34549 Claire pairs must be GONE.
- SUPPLY / MONSTER-WITNESS / STAGE / REL-BOND / REL-VET /
  MOURN-EXHAUST / MANTLE-FINE / SKIP-LEDGER / CAP-NC:
  carried from r279, judged as before (thresholds unchanged).
- REL-WIT: carried, INSUFFICIENT-DATA expected again (the
  lately-naming bottleneck is not this run's work); a serving
  naming the WRONG dead is still a FAIL LOUDLY fabrication.
- CONTROLS (smoke 33998): must match the r279 re-baseline
  (relEnd 50, NPC-NPC bonds 15, rest as r279). If the smoke
  snapshot moves, investigate as fix-vs-drift, not assumed —
  the fixes touch conversation serving, so a move is possible
  and must be explained, not re-baselined silently.
- WILD CHECK: 0 regressions on F4a/F4b/F4c/F5/F6/C3c/F2/C3d
  and the carried landed-fix surfaces. The 7 carried proofs
  re-run on the fix tip.
- F5 WILD EXERCISE (DESCRIPTIVE): rolling window advances
  one panel (…+r279+r280).

## What would count as interesting

- The two wild failures gone on the matched replay, with no
  other bar moving: the fixes are proven on the failing
  trajectories.
- A smoke move: the fixes change a served line on 33998 —
  judged as fix (explained) or drift (investigated).
- A NEW dry hit or template repeat elsewhere on the replay:
  the steering has a hole — filed, not re-scored.
- REL-WIT draws moving (up or down): the shape memory must
  not starve the witness variant — if draws fall, the memory
  is over-steering and the fix is revisited.
