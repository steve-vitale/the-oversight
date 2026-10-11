# Conversation want-system gaps — fixed 2026-10-11 (Steve: "Address any gaps!")

Source: playtest loop landing-leg R2 report (evidence/2026-10-11/journey-landing-r2.md).

## Gap 1 — favor-ask drowned everything (the big one)

**Diagnosis.** `convoSelectWant` is max-weight + 0.5 jitter (not weighted
random). `ask_favor.pick()` returns urgency 2–4 whenever
`convoFindFavorNeed` finds a real need; every other want sits at 0.5–1.5.
In the landing leg a real need ALWAYS exists (pantry below the 4000/mouth
bar, cistern 0L from day 2), so the favor won every opener. Measured: 0/33
first meetings opened curious across 3 seeds. CONVERSATIONS.md's "the first
conversation with someone always includes one [question] — strangers are
curious" was dead.

**Design call** (mine — Steve: figure it out yourself, document it):
first meetings lead with curiosity about the stranger, not errands.
- First meeting (`(c.count||0) <= 1`): `curious` weight → max(w, 3);
  `ask_favor` with urgency < 4 (chronic) dampened ×0.4 (urgency 2 → 0.8,
  urgency 3 → 1.2).
- ACUTE needs (urgency 4: hunger>70, health<60, sick) keep full weight and
  still lead — a starving stranger begs first, asks later. That's human.
- Considered and rejected: (b) cross-conversation variety rule — bigger
  behavioral change, not needed once the opener distribution is right;
  (c) favor-opens-per-day cap — punishes legitimate chronic needs on
  repeat visits. Revisit if the playtest loop sees a new monoculture.

**Result.** 33/33 first meetings open curious (3 seeds); acute-need
villager still opens ask_favor ("Please — do you have anything to eat?
Anything at all?"). Sample openers: "Where are you from — originally?
Before all this." / "Got a read on anyone here yet? Who should I be
watching?" / "What day is it? ...Do you still count? I lost track days
ago." Full 4-turn transcript sense-checked: question → answer →
characterful follow-up → natural pivot. No interrogation feel — the
question pool's variety carries it.

## Gap 2 — the question pool was starving

**Diagnosis.** `convoPickUnaskedQuestion` filtered by per-villager
`askedQs` AND village-wide `askedAny` AND trust/mood `qok`, with NO
fallback. At trust ~10 only ~12 questions pass the gates; village-wide
dedup drained them after ~22 hangs across the village, then every
low-trust stranger got null — curious won the picker but its opener
returned null. (The mid-conversation question path already had a
per-villager fallback; the want path didn't.)

**Fix.** Added the same fallback to `convoPickUnaskedQuestion`:
village-wide-unasked → per-villager-unasked. Rationale: a small camp
circles back to the same worries; hearing a repeat from a different
villager beats a stranger with no questions. The UNIQUE-PERSON LAW
still holds for the first pass — the fallback only fires on exhaustion.

## Gap 3 — run-ledger false positives + the lying snap

**Diagnosis.** `sayLine` blocked any line in the 48-entry run-wide ledger
(lines said by ANY villager recently). Shared pool lines (GQ_ACK 5-pools,
"Another time, then." decline, per-kind whyLines) tripped it constantly.
The fallback — `"I just said — did you miss it?"` — (a) LIED (this
speaker never said it; another villager did), (b) parroted VERBATIM
(ledger-exempt, so consecutive blocks repeated it), (c) read as the NPC
snapping at the player.

**Fix (two parts).**
1. `sayLine` now splits self-block from run-block. Self-repeats keep the
   caller's "I just said" fallback (honest there). Run-blocks get
   `convoDryLine(vid)` — honest dry lines ("...Sorry, lost my train of
   thought." / "Hm. Never mind — go on." / "...Actually, forget it."),
   per-conversation cycling, never verbatim, never ledgered, capped at 9
   uses (past that, silence is the honest signal). This also means
   run-blocks no longer return null — "no silent actions" outranks the
   old null contract.
2. `convoPick` is now run-ledger-aware: it prefers lines no villager has
   spoken in the current window (a preference, not a hard filter — small
   pools must not collapse), so blocks rarely reach sayLine at all.

## Proof

`scripts/test-convo-gaps.js` — RED before (4/4 failed), GREEN after:
- (a) ≥50% first meetings open curious: 100% (33/33, 3 seeds)
- (a2) acute need still leads: hunger-85 villager opens ask_favor
- (b) pool non-empty at low trust after village-wide exhaustion (98
  drained): returns q_origin
- (c) run-ledger block → honest dry line, never the snap
- (d) consecutive blocks → different dry lines, never verbatim

Regressions: dialog-coherence 37/37, dialog-gating ALL GREEN,
dialog-stream 43/43, favor-system 30/30, phantom-beats-r2 18/18,
ontology 76/76. dialog-ui-fix 38/2 — the 2 failures are pre-existing
source-regex checks about favor pools (identical on pristine base via
stash); the D7 ledger assertion was updated to the new honest contract
(run-block → dry line, not null).

## Files

- src/js/convo-wants.js — first-meeting curiosity in convoSelectWant;
  per-villager fallback in convoPickUnaskedQuestion
- src/js/conversation.js — self/run block split in sayLine;
  convoDryLine; run-ledger-aware convoPick
- scripts/test-convo-gaps.js — new proof (RED→GREEN)
- scripts/test-dialog-ui-fix-20261011.js — D7 assertion updated to new contract
