# Journey succession r52 — TIGHTENED W1d + DEED-TRIGGER (lane B, pre-registration 2026-10-27, written before any run)

Leg 7 (succession). Rotation-b read 7 → write 4 (next run plays leg 4, endgame).
This run takes r51's metric-review next steps. Instrument only, zero
src/js changes. If a gap closes, the NEXT run's bars change; this run's
bars below bind regardless.

## The next steps (from r51's run note + metric review)

1. TIGHTENED W1d SUBSET (r51 review). r51's subset (r50 direct + any
   solo-office transition on a deed day) admitted one definition
   artifact: 26065 entryD65 was bump-classified ("shared a quiet talk")
   and merely sat on a deed day, yet entered the subset through the
   solo+deed-day clause. This run's subset is r50 single-label direct
   + deed-class solo ONLY (solo-office AND r50 class deed). The old
   subset is still reported alongside for continuity, but W1d binds
   on the tightened subset.
2. DEED-TRIGGER (r51 review: retire the pantry-band framing). r51
   answered deed-when-thin as "seed-shaped, not pantry-shaped":
   26061 deeds while thin (30 deeds), 26064 never deeds at all, and
   26063/26065 deed only after recovery. The question now is what
   gates the deed triggers on a given day. The driver records, for
   every post-death day, a deed-opportunity snapshot: codex plants
   known, teachable pairs (a codex plant the scholar knows that some
   living villager does not), scholar kcal vs the kcal cap (the
   competent policy donates only when scholar kcal exceeds 1.5x cap,
   keeping a 2x-cap buffer), pack kcal total, pantry kcal, and the
   hall gate (havenStoresAccess === 'none' blocks donations). Each
   deedLedger entry also carries its call-time context: arguments,
   scholar kcal/cap, pantry kcal, hall gate, and (for teachPlant)
   whether the target already knew the plant. The analyzer contrasts
   deed days against no-deed days on each gate, per seed.
3. CARRIED, UNCHANGED: SCRIPT, V1, C1v3, W1a, S1, MG2v2 (old MG2
   reported, not judged), M3v2b, M1, M4, M5, over-cause, died-between,
   chain-death cause-known, solo continuity count. C1v2 stays DROPPED.
4. FORAGING-OUTING BLANK: documented only. It is a design-sized build
   and Steve has not ruled it in scope; this run does not build it
   and does not re-test it as a verdict — transcripts that hit it
   are counted as instances, nothing more.

## Canon note

No dedicated succession/mantle canon doc exists in docs/ (CANON.md's
table does not cover the lineage/mantle machinery). This run invents
no canon; it measures the machinery r38–r51 exercised, under Steve's
2026-10-23 meal-gate ruling (established-villager successors eat full
at any trust). CANON.md's "Trust ≠ reputation" (gossip/rumors move
REP only, never trust) remains relevant: a trust move with a donation
line is a deed writer, not a gossip artifact.

## Leg question

On a mixed band with a 45-day successor window, does the tightened
donation-join subset still clear the bar (closing W1's last
definition artifact), and what gate explains the deed-trigger
contrast — why does one successor line teach and donate for 45 days
while another never deeds at all?

## What counts as an interesting finding

- W1d-tightened: a majority of the tightened-subset transitions carry
  a donation line on their covering call — the join closes cleanly
  once the artifact class is excluded.
- W1d-tightened MISS: the tightened subset falls below half — the
  donation join does NOT close the class even without the artifact;
  the analyzer then reports the residual class honestly; no re-scoring.
- DEED-TRIGGER: a single gate (no teachable pairs, scholar kcal below
  the 1.5x-cap donation gate, hall-gated donations, empty pack)
  accounts for the zero-deed seed's days at >= 80% — the trigger is
  identified. Or: no gate accounts for it — the trigger is a policy
  or engine question beyond these gates, reported as open.
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
- W1d-tightened (donation join, binds as a finding bar, not a game
  bar): of the transitions in the TIGHTENED subset (r50 single-label
  direct, or solo-office with r50 class deed), >= 1/2 carry a donation
  line on their covering call. The old (r51) subset share is reported
  alongside but does not bind.
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
- DEED-TRIGGER (finding bar, not a game bar): the analyzer must print,
  for every seed, the deed-day vs no-deed-day contrast on all five
  gates (teachable pairs, kcal gate, hall gate, pack kcal, pantry
  band). A seed with zero deeds must have its closed-gate share
  reported; the verdict names the gate or reports "no gate explains".

## Seeds / policy / horizon

Seeds 26071–26075 (fresh band: r51 used 26061–26065).
Policy: competent (same as r41–r51). Regimes: 26071, 26072
EARLY_KILL_DAY=5; 26073, 26074, 26075 EARLY_KILL_DAY=40. Horizon:
phase A per regime, then the scripted kill via the REAL playerDeath
('a hushwolf') unless the mantle passes organically in phase A
(honored per the standing rule), then 45d competent play as the
successor. Death-aware stop (+10d tail). Convo checkpoints: d+3, +7,
+14, +30, +45 (2 top-trust villagers each).

## Metric review

- (Filled at run close. If any binding metric proves wrong, the revision
  is proposed here for the NEXT run, never re-scored mid-run.)

## Implementation notes (from r51 driver, for the run that builds r52)

Base: copy scripts/journey-succession-r51-20261026.js →
scripts/journey-succession-r52-20261027.js (mode string, EVID date dir
2026-10-27 for transcripts + tele files; analyzer + proof test copied
and re-seeded the same way). Edit list:

1. DEED-CALL CONTEXT (driver): in the deed-ledger wrapper, record on
   each entry: argsJson (args mapped through a safe summarizer — first
   arg as vid label, remaining args JSON-truncated to 120 chars),
   scholarKcal (state.scholar.kcal), kcalCap (Game.kcalCap() guarded),
   pantryKcalAtCall, hallGate (Game.havenStoresAccess() guarded), and
   for teachPlant: targetKnowsBefore (target's plantKnowledge includes
   the plant arg, guarded). All reads guarded; a failed read records
   null, never throws.
2. DEED-OPPORTUNITY SNAPSHOT (driver): new rec.deedContext array. In
   the post-death loop, after each runDays call (next to the
   officeDaily push), push { day, dplus, bearer, knownPlants (codex
   plant keys count), teachablePairs (count of (pid, vid) pairs with
   pid in codex plants and vid a living non-bearer villager whose
   plantKnowledge lacks pid), scholarKcal, kcalCap, kcalGateOpen
   (scholarKcal > cap * 1.5), packKcal (scholar inventory kcal total),
   pantryKcal, hallGated (havenStoresAccess() === 'none'), deedsToday
   (deedLedger entries with day === curDay) }. Helper functions
   guarded like pantryKcal.
3. TELE (driver, optional continuity): add
   'succession.deedContextDays' computed directly from rec.deedContext
   length, same direct-from-array rule as the r51 tele keys.
4. ANALYZER (copy of r51's, seeds 26071–26075): W1d section prints
   BOTH the r51 subset share and the tightened subset share (tightened
   = direct OR (soloOffice AND r50-class deed)); W1d binds on the
   tightened share. New DEED-TRIGGER section (per seed): deed counts
   by deed type with args summaries; deed-day vs no-deed-day contrast
   on the five gates from deedContext (mean/min/max teachablePairs,
   kcal-gate-open share, hall-gated share, packKcal mean, pantry band
   counts); for teachPlant deeds, targetKnowsBefore share; for
   donate deeds, kcal-gate-open share at call time. Keep all carried
   sections (V1, C1v3, S1, MG2v2, M3v2b, M1, M4, over-cause, solo
   continuity count, transcripts, end state). DEED-THIN (pantry-band)
   kept for continuity, not judged.
5. PROOF TEST (copy of r51's): RED = r51 driver lacks deedContext,
   deedLedger argsJson/context fields, and the r52 tele key. GREEN =
   r52 driver on proof seed 24999 (EARLY_KILL_DAY=5, POST_DAYS=30)
   emits all three; every deedContext entry carries numeric
   teachablePairs, scholarKcal, kcalCap, packKcal, pantryKcal and a
   boolean kcalGateOpen/hallGated; every deedLedger entry carries
   argsJson + scholarKcal + pantryKcalAtCall; tele deedContextDays
   matches the raw array count.
