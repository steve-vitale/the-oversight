# Journey succession r51 — DONATION-JOIN + DEED-WHEN-THIN (lane B, pre-registration 2026-10-26, written before any run)

Leg 7 (succession). Rotation-b read 7 → write 4 (next run plays leg 4, endgame).
This run takes r50's metric-review next steps. Instrument only, zero
src/js changes. If a gap closes, the NEXT run's bars change; this run's
bars below bind regardless.

## The next steps (from r50's run note + metric review)

1. DONATION-JOIN REFINEMENT OF W1 (r50 review). r50 classified 11
   transitions as direct (donation-credit) and 5 as deed-day solo, but
   the join was inferential (deed-day presence). This run joins
   directly: the driver records, on every officeCallMove, the call's
   own donation lines (`Donated X. Trust +N` — the _creditPantryGift
   voice, which bypasses bumpTrust), and the analyzer re-classifies
   each C1v3 transition with a donation class that names the line.
   A transition whose covering call carries a donation line is
   donation-explained, whether or not it also carries bump entries.
2. DEED-WHEN-THIN (r50 review: the 26055 seed class). 26055's
   successor never taught or donated while the village starved.
   Question: does competent play deed at all when the pantry is thin,
   or does it hoard? The driver records pantryKcal on every
   officeDaily entry, and the analyzer cross-tabs post-death deed
   calls against the pantry level on the deed day (thin < 15,000 kcal
   vs fed >= 15,000), plus deeds per seed, deeds in the first 10 days
   post-death vs later, and the pantry trajectory per seed.
3. C1v2 DROPPED (r50 review: r50 was its final run). C1v2 is not
   computed as a verdict this run; C1v3 remains the transition rule.
4. MG2v2 ONLY (carried): old MG2 computed for continuity, not judged.
5. SOLO-CREEP: CLOSED as a question (r50: bounded, donation-driven).
   Kept only as a continuity count, not a question.
6. Watches kept: over-cause (now exercised; watch whether it
   distinguishes starvation scatter from other village ends),
   died-between (still empty), chain-death cause-known.

## Canon note

No dedicated succession/mantle canon doc exists in docs/ (CANON.md's
table does not cover the lineage/mantle machinery). This run invents
no canon; it measures the machinery r38–r50 exercised, under Steve's
2026-10-23 meal-gate ruling (established-villager successors eat full
at any trust). CANON.md's "Trust ≠ reputation" (gossip/rumors move
REP only, never trust) remains relevant: a trust move with a donation
line is a deed writer, not a gossip artifact.

## Leg question

On a mixed band with a 45-day successor window, does the direct
donation join name the r50 direct/deed-day-solo transitions as
donation moves (closing W1's last inferential class), and does
competent successor play keep deeding when the pantry is thin — or
does the 26055 pattern (no deeds while starving) repeat?

## What counts as an interesting finding

- W1d: a majority of r50-style direct/deed-day-solo transitions
  carry a donation line on their covering call — the donation join
  names the writer directly, and the last inferential class closes.
- W1d MISS: donation lines are absent on most such transitions —
  the direct class needs a different join (the analyzer then reports
  the residual class honestly; no re-scoring).
- DEED-THIN: deeds continue on thin-pantry days at a rate comparable
  to fed days — competent play deeds through scarcity. Or: deeds
  collapse to zero on thin days while the pantry falls — the 26055
  pattern is systematic, and the next question is whether the
  competent policy's deed triggers are pantry-gated.
- Any carried bar regressing (V1 FAIL-alive-silent, MG2v2 violation,
  M4 unclean mantle) is a REAL BUG, not a metric note.

## Binding metrics (§14)

- SCRIPT (young staging): 2/2 day-5 seeds with death.scripted === true.
  Mature seeds: scripted-or-organic honored, reported per seed.
- V1 (vouch snapshot, carried): on every seed with eligibleAtDeath > 0,
  verdict PASS-fired; no FAIL-alive-silent anywhere.
- C1v3 (transition rule, binds): 100% of post-death daily transitions
  covered by a callMove on the ENTRY's day OR a convoWindowMove on the
  PREVIOUS entry's day.
- W1a (mutation-trap completeness, binds): 100% of daily office
  transitions carry a classification: bump / donation / deed /
  direct / handoff / unexplained. Donation takes precedence in the
  report (a transition with both bump and donation lines is counted
  in both classes in the overlap table, and as donation in the
  single-label table).
- W1d (donation join, binds as a finding bar, not a game bar): of the
  transitions that r50's method would call direct or deed-day solo,
  >= 1/2 carry a donation line on their covering call. Below 1/2,
  the donation join does NOT close the class — reported as such.
- S1 (bearer-own delta, carried): 100% of same-bearer callMoves carry
  a numeric bearerDeltaExact; 100% of chain handoffs carry null; every
  solo-office call has |delta| <= 2 (a >= 3 solo-office delta is an
  instrument contradiction — fail loudly, not a game finding).
- MG2v2 (meal-line only, binds): 0 violations on 5/5 seeds. Old MG2
  reported, not judged.
- M3v2b (social echo, carried): on >= 4/5 seeds, >= 2 v2b mentions of
  the dead bearer within 7 days of death (funeral-arc lines excluded,
  loot lines excluded by the /^You take /i rule). v2 reported alongside.
- M1 (funeral arc): >= 4/5 deaths produce (a) the death beat naming the
  bearer, (b) recoverBearer <redacted> 2 days, (c) the burial act completable.
- M4 (machinery): 5/5 mantles clean (linOk + moOk).
- M5 (people check): 0 identity failures across sense-read transcripts.
- Chain deaths: every chain death cause-known from fallen/lineage, or
  reported UNKNOWN with the missing list named.
- DEED-THIN (exploratory, not binding): deed counts per seed, deed
  days by pantry band (thin < 15,000 vs fed >= 15,000), deeds d+1–10
  vs d+11–45, pantry trajectory per seed. The thin-vs-fed read is
  qualitative and binds nothing this run.

## Seeds / policy / horizon

Seeds 26061–26065 (fresh band: r50 used 26051–26055).
Policy: competent (same as r41–r50). Regimes: 26061, 26062
EARLY_KILL_DAY=5; 26063, 26064, 26065 EARLY_KILL_DAY=40. Horizon:
phase A per regime, then the scripted kill via the REAL playerDeath
('a hushwolf') unless the mantle passes organically in phase A
(honored per the standing rule), then 45d competent play as the
successor. Death-aware stop (+10d tail). Convo checkpoints: d+3, +7,
+14, +30, +45 (2 top-trust villagers each).

## Metric review

- (Filled at run close. If any binding metric proves wrong, the revision
  is proposed here for the NEXT run, never re-scored mid-run.)

## Implementation notes (from r50 driver, for the run that builds r51)

Base: copy scripts/journey-succession-r50-20261026.js →
scripts/journey-succession-r51-20261026.js (mode string, EVID date dir
2026-10-26 for transcripts + tele files; analyzer + proof test copied
and re-seeded the same way). Edit list:

1. DONATION LINES (driver): in the post-loop callMove IIFE, add
   donationLines: callLines filtered to /Donated .*Trust \+/i, each
   sliced to 200 chars, on the pushed officeCallMove. (The gift bucket
   already captures gift-ish lines, but only 3 samples and without
   the Trust +N voice; the donation join needs the full matching set.)
2. PANTRY ON OFFICE DAILY (driver): add pantryKcal: pantryKcal(Game)
   to both officeDaily pushes (death-day series start and the
   post-loop push). pantryKcal is already in driver scope.
3. TELE (driver, optional continuity): add
   'succession.callMovesWithDonation' computed directly from
   officeCallMoves (donationLines non-empty), same direct-from-array
   rule as the r50 tele keys.
4. ANALYZER (copy of r50's, seeds 26061–26065): new sections — W1d
   donation-join table (per transition: single-label class with
   donation precedence, plus bump∩donation overlap counts, plus the
   r50-method direct/deed-day-solo subset and its donation-line
   share); DEED-THIN table (per seed: deed total, deeds by pantry
   band using officeDaily pantryKcal on the deed day — nearest
   officeDaily entry on or before the deed day — deeds d+1–10 vs
   d+11–45, pantry trajectory from officeDaily first/last/min);
   drop the C1v2 section (labelled DROPPED, not computed as a
   verdict). Keep all carried sections (V1, C1v3, S1, MG2v2, M3v2b,
   M1, M4, over-cause, solo continuity count, transcripts, end state).
5. PROOF TEST (copy of r50's): RED = r50 driver lacks donationLines
   on callMoves, pantryKcal on officeDaily, and the r51 tele key.
   GREEN = r51 driver on proof seed 24999 (EARLY_KILL_DAY=5,
   POST_DAYS=30) emits all three; every donationLine matches
   /Donated .*Trust \+/i; every officeDaily entry carries a numeric
   pantryKcal; tele callMovesWithDonation matches the raw array count.
