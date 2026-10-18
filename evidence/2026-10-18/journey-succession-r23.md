# Journey-succession r23 — "the successor's own grief" (2026-10-18)

Leg 7 (succession). Pre-registered per MEASUREMENT.md §§9–12, 14.

## Pre-registration

**Leg question:** when the mantle passes, the successor had a real personal
history with the dead bearer — a measured bond (`v.bonds`, −100..+100, with
depth sediment), shared meals, deep talks, tended wounds. Does the new
bearer's inner life reflect WHO they lost? Trauma is set to a flat 10 for
every successor ("the shock of stepping up"). Do the handoff beats name the
successor's personal loss? Do villagers acknowledge it ("I know you two were
close")? Or does the successor talk about their dead friend like a stranger
with a briefing?

**Prior art:** r12 (orientation: who they ARE), r16 (revolving door, multi-
mourning fix), r20 (village names its dead; successor-as-new-person), r21
(double mantle, "you're not X"), r22 (death-pack voice). None examined the
successor's OWN bond with the deceased. Bonds form bearer↔NPC (`bondAdd` in
carexplore/conversation/game) and NPC↔NPC (feasts, lingering meals) — so
`bondGet(newId, oldId)` is a real number at every handoff, read by NOTHING
in the succession path.

**Interesting-finding criteria:**
(a) on seeds where the successor's bond with the deceased was strong
    (|v|≥20 or depth≥1), ZERO handoff beats or convo lines name the
    successor's personal loss → fiction blank;
(b) the successor's trauma is 10 in every case regardless of bond →
    mechanism note (documented either way);
(c) a villager spontaneously acknowledges the successor's grief, or the
    successor's own convo options let them express it → sensical, document;
(d) the successor talks about the dead bearer with fabricated distance
    while the bond was strong → SENSE violation.

**Seeds:** 5101 (natural bonds), 5102/5103 BONDSEED=close (scripted +55/depth+2
old↔likely-successors), 5104 BONDSEED=hostile (−45/depth−2). Pilot-only
scripting (game code untouched): the handoff is what's under test, and
natural bonds at d14 are ~0–3 (5101), untestable in the pilot window. The
+handoff reads the VALUE; formation pacing is a separate substrate note.
**Policy:** competent. **Horizon:** kill d14, successor plays to d28.
**Binding metrics:**
- M1: ≥3/4 mantles pass cleanly (new bearer, lineage entry, game continues).
- M2: on seeds where |bond|≥20 or depth≥1, ≥1 handoff/convo line within d17
  names the successor's personal relationship with the deceased. <2 qualifying
  seeds hit → BLANK CONFIRMED (fix justified).
- M3: successor trauma at pass recorded (measurement only).
- M4 (people): ≥2/4 seeds — a full death-convo transcript meets the quality bar.
**Kill rule:** mantle fails on ≥2/4 → SUBSTRATE-MISSING.

## What happened

M1: 4/4 GO — Anjali→Vincent (5101), Aurora→Blanca (5102), Domingo→Booker
(5103), Aubrey→Abdelaziz (5104). Lineage entries with cause on all 4; all
villages alive at d28 (9–11 living, pantries 27k–57k kcal).

M2: **0/3 qualifying seeds named it → BLANK CONFIRMED.** With bond 55/depth 2
(5102, 5103) and −45/depth −2 (5104), the 13-line handoff burst never reads
the bond: death line, village grief ("Nobody's talking much"), Codex sync,
skill teachings, MANTLE TRANSFER DETECTED, turns-a-page, orientation ("You
wake up somebody else"), own-record line — zero about who the successor lost.
In 8 driven convos, `successorGriefNamed` fired 0 times. The village mourns
by name (r20's work holds: "Since Aurora died... I keep expecting to see
Aurora at the fire"), but the SUCCESSOR's own loss is invisible — and the
successor has no player-side options to voice it either (no "I miss them"
exists in the convo verbs).

M3: trauma flat 10 on all 4 seeds — close friend, bad blood, stranger, all
the same "shock of stepping up."

M4: transcripts meet the mechanical bar (NPC wants comfort/curiosity →
engaged → resolved, "This was good"), but the SENSE read is damning:
Phumzile (5103, seeded close friend of the deceased) opens "It's quiet
today. Wrong kind of quiet" — and Domingo is never named once in 11 turns;
the driver asks "Are you okay?" six times and the grief never lands on its
object. The Rosa convo (5101) likewise never names Anjali. Grief without a
name, twice.

**Substrate note (natural bonds):** on 5101 (unscripted), the old bearer's
strongest NPC bond after 16 days was 3 — the competent policy barely forms
personal bonds in a fortnight, while NPC↔NPC bonds reached 28 (Vincent↔Brian).
Strong successor↔deceased bonds are rare early but real in social/long runs;
the handoff must handle them when they exist.

## Village assessment (plain words)

Four villages, all alive at day 28. The successions worked — new bearers
stepped into functioning villages and kept them functioning. The villages
mourn their dead by name at the fire. What they don't do: notice that the
new bearer <redacted> mourning too, personally. Blanca buried her close friend
Aurora and nobody — not the handoff, not the village — ever said the two of
them were close. Abdelaziz took the office from a man he had bad blood with
and the handoff treated it like any other Tuesday. The mantle passes the
office flawlessly; the person inside it arrives unacknowledged.

## People check

8 driven convos (deceased's closest friend + successor's closest friend per
seed), full transcripts SENSE-read. Best: João (5102) — "Nobody says
Aurora's name right yet. We will. Give it a few days." Worst: Phumzile
(5103) — grief opener with no object, six "are you okay"s, zero names.
No fabricated shared history anywhere (good); the failure mode is absence,
not invention. The successor's grief has no voice — not in their lines, not
in anyone's acknowledgment.

## Blank filled

**The successor's own grief — named at the handoff, in two halves
(src/js/ledger.js + src/js/convoTopics.js, fiction-led, one small number):**

1. **Handoff beat (ledger.js `playerDeath`, after the orientation line):**
   reads `bondGet(newId, oldId)`.
   - Close (v≥20 or depth≥1): "You knew {old} — not the office, the person.
     The fire keeps expecting {them}, and so do you. That's a heavier kind
     of stepping up. (+5 trauma)" — trauma 10→15, the number named (r22
     precedent). Depth-only sediment (long quiet friendship) counts.
   - Hostile (v≤−20 or depth≤−1): "You and {old} never found easy ground.
     Now their office sits on your shoulders, and the fire will watch what
     you do with their name. Relief is honest. The guilt about the relief
     is honest too." — trauma stays 10; the complexity is named, the number
     doesn't move.
   - Neutral: silence, as before.
2. **Convo acknowledgment (convoTopics.js):** the mantle-memory mourning
   event now carries `bearerId`; when its lines are generated and the
   player's bond with that bearer <redacted> close, the villager can say "I know
   you and {name} were close. I'm sorry." Bearer-branch only; hostile bonds
   get no line — the village doesn't pry.

**Proof:** scripts/test-succession-grief-20261017.js — RED 9 fails on
reverted code (patch-file round-trip, no stash), GREEN 22/22 with the fix.
Covers: close→beat once + trauma 15, hostile→beat once + trauma 10,
neutral→silence + 10 (old behavior preserved), depth-only paths, convo
ack present/absent/hostile-absent, no double-fire.
**Wild confirmation:** re-ran 5102 (close) — "You knew Aurora — not the
office, the person. The fire keeps expecting them, and so do you. That's a
heavier kind of stepping up. (+5 trauma)", trauma 15. Re-ran 5104
(hostile) — the bad-blood beat, trauma 10.

**Regression:** check.js --quick — 96 passed, 1 failed
(test-sprites-valid-20261014.js: dustboar/sunback/sweeps_week/cliffhanger
sprite assertions — the same pre-existing sprite failure as r21/r22,
untouched by this change).

## Metric roll-up

- M1: 4/4 GO.
- M2: 0/3 qualifying → BLANK CONFIRMED → fix implemented + proven.
- M3: flat 10 pre-fix on all 4 → now 15/10/10 by bond (close/hostile/neutral).
- M4: mechanical bar met; SENSE finding is the blank (grief unnamed).

## Metric review

M2's "named" regex first-pass undercounted nothing — the manual SENSE read
of all 13-line handoff bursts and 8 transcripts agreed with it (0 namings).
No revision proposed; the metric did its job. For the next succession run:
M3 should bind on the differentiated trauma (15/10/10), and a convo-half
metric should check the acknowledgment line fires in a real (unscripted)
close-bond succession.

## Telemetry

telemetry-check vs telemetry-baselines/succession.json (deaths.bearer,
census.alive, week2.deadBearerMentions): **quiet** — no LOUD lines. 1 bearer
death/seed by design; 9–11 alive at d28; 0–2 dead-bearer mentions per seed
in the d17 convo window (5104's convos never named Aubrey — the driver's
choice path, not a mechanism miss; the mourning lines were offered).

## Reachable / fun / winnable

- **Reachable:** yes — every succession passes through the handoff; the beat
  fires exactly when the bond exists. The convo acknowledgment rides the
  existing mantle-memory mourning window (10 days).
- **Fun:** stronger — the heaviest grief in the game finally has a voice.
  Before, losing a close friend felt identical to inheriting from a stranger.
- **Winnable:** unaffected — +5 trauma on close bonds is a small honest cost;
  no economy changes.

## Files

- Pilot: scripts/diag-succession-r23-20261017.js
  (SEED=5101 natural; 5102/5103 BONDSEED=close; 5104 BONDSEED=hostile)
- Proof: scripts/test-succession-grief-20261017.js (22/22 GREEN)
- Per-seed: evidence/2026-10-18/journey-succession-r23-510{1,2,3,4}.json
  (+ .log, +.telemetry.json)
- Fix: src/js/ledger.js (grief beat + trauma), src/js/convoTopics.js
  (bearerId + acknowledgment line)
- Patch backup: ~/workspace/patches/succession-grief-r23.patch
