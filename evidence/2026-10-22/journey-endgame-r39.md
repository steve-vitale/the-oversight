# Journey Endgame r39 — THE WAITING ROOM OR THE FINAL ACT? (Lane B)

Run: lane-B endgame r39, 2026-10-22, ~05:00–07:00 CDT. (r38 never played —
coordinator timeout 2026-10-22 ~04:05; this is the next endgame occurrence;
rotation-b read 4 at start, advanced 4→5 at close.)

## Pre-registered header (MEASUREMENT.md §§9–12, 14 — written before any play)

**Leg question:** THE OVERTIME WINDOW AS LIVED PLAY. Steve 2026-10-14:
"waiting should have a cost" — and his standing design call: priced
opportunity mechanism vs "waiting stays simply wrong." The r37 probe proved
the price is RECORDED and VOICED (satPenalty + "Every door's standing −M").
Nothing has read what the waiting weeks themselves PLAY like. Is the overtime
window (table announced → seat taken, days 90–170) the final act of the run —
narrated, populated, consequential — or a waiting room where a competent
player just watches tiers rise until the price is right?

**What would count as interesting:** a tier that rises silently (no on-air
announcement), a waiting-week with zero world events, the deferral never
framed as a decision (the policy waits deliberately; the game must surface it
as a choice), villagers who ignore the looming table entirely — OR,
conversely, the window playing richly: RERUN fights landing, raids pressing,
the System's tier lines landing on air, the seat-offer returning as a
decision beat. Any of these is evidence toward Steve's overtime-design call.

**Bindings (a miss is NO-GO, never re-scored):**
- M1 tier narration: on every sat seed, every tier 1..maxTier has BOTH an
  overtime_tier tele event AND a "◈ OVERTIME ×N" SAY line. GO = 4/4 sat seeds.
- M2 populated window: on every sat seed, every waiting-week (7d from the
  announce) contains ≥1 tele event AND window SAY density ≥3 lines/week.
  GO = 4/4 sat seeds.
- M3 deferral surfaced as a choice: ≥3/4 sat seeds have ≥1 "Take your seat"
  beat in the window. GO = ≥3/4.
- REG (inherited, binding): r35 audit naming (0 silent audits on sat seeds
  with nonzero w4/w5 deeds); r37 satPenalty present + voiced-line match.
- GUARD: ≥3/4 seeds reach the table window (announceDay != null).

**Substrate:** CAPABLE bot + CAPABLE_GREEDY=1 (deferral design),
CAPABLE_GREEDY_MAXTIER=6, CAPABLE_GREEDY_LASTDAY=170, TELEMETRY_FULL=1.
180d, death-aware. Seeds 81011–81014 (fresh; adjacent to r37's 81001–81004).
Instrument: scripts/probe-endgame-r39-20261022.js (DET-gated byte-identical,
verdict scripts/analyze-endgame-r39-20261022.js).

## RESULTS (4/4 seeds, per-seed JSON + transcripts in evidence/2026-10-22/perseed-endgame-r39/)

PRIMARY: GO (exit 0) — M1 4/4, M2 4/4, M3 4/4, REG r35 GO, REG r37 GO, GUARD 4/4.

| seed | announce | sat | seat | maxTier | weeks | say/wk | tele evs | defer beats | path/branch | won |
|------|----------|-----|------|---------|-------|--------|----------|-------------|-------------|-----|
| 81011 | d90 | d132 | lesser | 6 | 5 | 1046 | 601 | 7 | beloved/light | yes |
| 81012 | d90 | d132 | lesser | 6 | 5 | 1050 | 683 | 7 | relay/light | yes |
| 81013 | d90 | d104 | lesser | 2 | 1 | 1841 | 311 | 3 | feared/light | yes |
| 81014 | d90 | d107 | lesser | 2 | 2 | 1225 | 356 | 3 | assimilated/light | yes |

- M1: every tier rise on all 4 seeds carried BOTH the ◈ OVERTIME ×N SAY line
  and the overtime_tier tele event (6/6, 6/6, 2/2, 2/2). No silent tiers.
- M2: the quietest waiting-week anywhere had 36 tele events (81011 week 5);
  the loudest 181 (81011 week 4). SAY density 1000+/week. The window's event
  mix: combat_start ×16–17, deaths, contests, skills taught, traps, favors,
  ability grants — the world keeps turning, loudly.
- M3: "Take your seat from Haven to stop the clock." closes every tier-rise
  line; the deferral is framed as the player's standing decision, 3–7×/run.
- REG r35: all 4 audits named nonzero w4/w5 deeds (w4=4–5 each seed).
  REG r37: satPenalty present on all 4; penalties 30/27/17/8; voiced-line
  match on all 4.

**The finding for Steve's overtime-design call:** the window is the final
act, not a waiting room. The tier announcements name the cost concretely
("+50% HP, +24% damage, +1 to every pack... The table docks your standing
−8"), the RERUN fights actually land (16 combats in 81011's window), raids
press sooner, and the seat stays a live decision beat rather than a timeout.
Waiting reads as a priced gamble — you watch the tiers climb, the fights get
harder, the standing drain grow — not as dead air. Whatever mechanism he
chooses, the substrate already supports it: the cost is felt, not just
stated.

## Village assessment (census in plain words)

Four villages, all reached global scale by day 90 with pantries overflowing
(27k–80k kcal — nobody was hungry in the endgame). All four sat the lesser
seat between days 104–132 and won. 8–11 villagers alive at the end; the final
stretch cost each village a few people to the RERUN fights (8–15 deaths
voiced in the windows, mostly monsters). Wave deeds: w1 13–21, w2 8–12,
w3 5–6, w4 4–5 distinct fought, w5 0 — competent lesser-seat runs, no wave-5
in this batch. Four different paths walked (beloved, relay, feared,
assimilated), all light branches — the light road was open on every run
(protected outnumbered killed, food truth shared, promises kept).

Instrument caveat (documented, not scored): the probe's censusOf reads
roles/abilities/mantle poorly (all '?'/0/None — the person-object shape
differs from what it expects) and its `dead` field has a copy-paste bug
(counts the living). Plain-words counts above use roster length only. A
future run should fix censusOf rather than re-score this one.

## People check (sense-read: endgame-r39-81014-transcript.txt, seated stretch)

The feared→assimilated walk reads like people, not machinery. The village
enters the feared calibration, underplays its hand ("THE TABLE FALTERS —
you played your hand before the fear was in the room, and the demonstration
underwhelmed. The ring dims."), and takes the downgrade honestly ("You take
the smaller door. It is still a door.") — failure resolving the story per
TABLE.md canon, never wiping it. The assimilated-light final choice,
"Remember the taste of grief," lands: the locket, the ache chosen over the
anesthesia *inside* the machine, the grief as the signal that gets out. The
architect credit reads too ("Brian Kang ascended through doors you built:
relay... The village will remember who built the door."). The dark coda about
the kids in stasis ("They are still there. Still small. Still waiting for
someone to decide they matter more than the moment.") still stings — the
win doesn't erase it. Conversations in the window weren't sense-read
individually this run (the window is combat/economy-dense); the social leg
owns that surface.

## Blanks

1. FIXED (voicing, proof 12/12): the WAR PATH audit beat named two
   engagements against the same monster type with the identical sentence
   twice ("They faced Big Loud and lived to sit here. They faced Big Loud
   and lived to sit here." — 81014 transcript). table.js now names once with
   a count ("They faced Big Loud twice and lived to sit here."); two
   different nouns keep the old voicing byte-identical. Pricing untouched.
   scripts/test-tabledeed-dupename-20261022.js.
2. DOCUMENTED (instrument): r37's 81001 transcript anomaly — the "◈ THE
   TABLE IS SET" marker wasn't found in its capture, so the transcript
   fell back to the audit index (30 lines). r39's fresh runs find the
   marker on 4/4 seeds and the beat fires unconditionally in table.js once
   pg.tableAnnounced is set, so this reads as an r37 instrument artifact,
   not a game bug. Noted here; no game-code change.

## Reachable / Fun / Winnable

- Reachable: 4/4 competent runs reached the table window (announced d90),
  sat a lesser seat, and played a full path to a win. The overtime window
  fires for anyone who defers; the tier content is reachable by waiting.
- Fun: the window plays as a pressure-cooker finale — harder fights, a
  visible price, a standing invitation. The audit reads the run back
  honestly (w4/w5 named), and the path finales land emotionally
  (assimilated-light's grief choice; the beloved coda).
- Winnable: 4/4 won, four different paths, all light. The dark branches
  weren't walked in this batch — the policy plays clean; dark stays for a
  darker policy, not a gap.

## Metric review

- All pre-registered bars met on the 4-seed pilot; no re-scoring.
- M2's SAY-density half is an approximation (windowSayLines/windowWeeks —
  the instrument doesn't day-tag SAY lines); it passed at 1000+/week vs a
  bar of 3, so the approximation doesn't threaten the verdict. A future
  revision could day-tag SAY lines for exact per-week density.
- censusOf limitations documented above (roles/abilities/mantle unread;
  `dead` field buggy) — fix the instrument next run; the plain-words
  census stands as reported.
- No expansion: the pilot answered the question on 4 seeds; the finding is
  articulated and the analyzer exits 0. Multi-seed confirmation not needed.

## Regressions / checks
- scripts/test-tableaudit-20261021.js: 15/15 (r35 inheritance).
- scripts/test-tableaudit-r37-20261022.js: 9/9 (r37 inheritance).
- scripts/test-tabledeed-dupename-20261022.js: 12/12 (new).
- node scripts/check.js --quick: 284 passed, 3 failed in 1525s. The 3
  failures are all scripts/godpath/test-phone-frame-proof.js — the known
  pre-existing phone-frame staleness (r35 note, 2026-10-21). Proven
  pre-existing this run: stashed the table.js change, re-ran the proof,
  identical 2 FAILs on the unmodified base; change restored byte-identical.
  No new failures from this run's change.
- Telemetry deviation check vs endgame baseline (maxTier,
  satPenalty.penalty): quiet — 4 files, 2 metrics, no large deviations.
  Baseline NOT rolled (no LOUD lines to investigate).
