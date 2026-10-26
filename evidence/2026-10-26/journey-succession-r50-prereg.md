# Journey succession r50 — MIXED REGIME + MUTATION-SITE TRUST TRAP + SOLO-CREEP LONG WINDOW (lane B, pre-registration 2026-10-26, written before any run)

Leg 7 (succession). Rotation-b read 7 → write 4 (next run plays leg 4, endgame).
This run takes r49's metric-review next steps. Instrument only, zero
src/js changes. If a gap closes, the NEXT run's bars change; this run's
bars below bind regardless.

## The next steps (from r49's run note + metric review)

1. WRITER-SITE AT THE MUTATION (r49's headline thread). r49: 17/50 trust
   moves (34%) land on days with ZERO trapped deed calls — the writer
   sits at least partly outside the five trapped deed APIs. Day-join
   is retired as a discriminator. This run traps at the mutation site:
   Game.bumpTrust is wrapped post-death (forwarded unchanged, return
   preserved) and every call is logged with day, villager, before/after
   (actual delta, after the progressive-gain adjustment), the reason
   string the caller passed (or null), and a stack-derived call site.
   Each runDays call's bump slice is attached to that call's
   officeCallMove; each convo window's bump slice is attached to that
   window's convoWindowMove. Direct-assignment moves (a trust-map mover
   with NO bump entry in the call window) are classified separately —
   they are the residual writer class, not lumped with "unexplained".
2. SOLO-CREEP LONG WINDOW (r49's open question). r49's solo-office
   class opened with 11 solo +1s (26045: 8). Is solo creep bounded, or
   does it run away on longer windows? This run extends the post-death
   window to 45 days (POST_DAYS=45, convo checkpoint +45 added) and
   reports solo-office cumulative delta plus per-10-day rates
   (d+1–10, 11–20, 21–30, 31–45). Rising rate in the late window is a
   runaway watch; flat/decaying rate is bounded.
3. C1v3 FINAL RUN WITH C1v2 (r49 review: report C1v2 one more run, then
   drop it). C1v3 binds; C1v2 is reported for continuity only.
4. MG2v2 ONLY (r49 review: the old MG2 regex retires). The old MG2 is
   still computed for continuity but is NOT judged; MG2v2 binds.
5. A1 RETIRED (r49 review: the handoff-loss thread is CLOSED — the
   r48 "loss" was the worn/pack double-count collapsing at the merge).
   Armor maps are still snapshotted for continuity but carry NO
   verdict this run. If armor is ever re-examined, count distinct
   pieces per holder, not location totals.
6. Watches kept: over-cause (over=true branch still unexercised),
   died-between (still empty), chain-death cause-known, E1b continuity
   (retired as a discriminator).

## Canon note

No dedicated succession/mantle canon doc exists in docs/ (CANON.md's
table does not cover the lineage/mantle machinery). This run invents
no canon; it measures the machinery r38–r49 exercised, under Steve's
2026-10-23 meal-gate ruling (established-villager successors eat full
at any trust). Canon note carried: CANON.md's "Trust ≠ reputation"
(gossip/rumors move REP only, never trust) is directly relevant to the
writer-site question — a trust move with no deed and no bump entry
is a candidate for a non-deed writer (event, inheritance formula, or
direct assignment), not a gossip artifact.

## Leg question

On a mixed band with a 45-day successor window, does trapping trust
at the bumpTrust mutation site explain the trust moves day-join could
not (r49's 34% no-deed class), does solo-office creep stay bounded
over the longer window, and do the carried succession bars (vouch,
funeral, meal gate, echo, machinery) still hold?

## What counts as an interesting finding

- W1: a majority of r49-style no-deed transitions carry a bump entry
  with a named reason (e.g. haven-work, haul, garden) — the writer is
  the mutation site, and the "mystery moves" were ordinary gameplay
  the deed traps never saw (deeds are only five APIs; bumpTrust is
  called from dozens of systems).
- W1-DIRECT: a mover class with NO bump entry in its call window —
  that is a real second writer (direct v.trust assignment or an
  inheritance-formula entry), named per seed with its mover deltas.
- SOLO: solo-office cumulative delta concentrated in the late window
  (31–45) at a rising rate — runaway watch for r51. Flat/decaying
  rate — bounded, and the solo class is ordinary +1 haven-work creep.
- Any carried bar regressing (V1 FAIL-alive-silent, MG2v2 violation,
  M4 unclean mantle) is a REAL BUG, not a metric note.

## Binding metrics (§14)

- SCRIPT (young staging): 2/2 day-5 seeds with death.scripted === true.
  Mature seeds: scripted-or-organic honored, reported per seed.
- V1 (vouch snapshot, carried): on every seed with eligibleAtDeath > 0,
  verdict PASS-fired; no FAIL-alive-silent anywhere.
- C1v3 (transition rule, binds): 100% of post-death daily transitions
  covered by a callMove on the ENTRY's day OR a convoWindowMove on the
  PREVIOUS entry's day. C1v2 reported, not binding, final run.
- W1a (mutation-trap completeness): 100% of daily office transitions
  carry a classification: bump-explained (≥1 bump entry for the bearer
  or a mover in the covering call/window) / deed-explained / direct-
  candidate (mover, no bump entry in window) / unexplained (no mover,
  no bump, no deed — the solo-office residual, separately counted).
- W1b (writer found, binds as a finding bar, not a game bar): of the
  transitions that would be no-deed under r49's day-join, ≥1/2 are
  bump-explained. Below 1/2, the mutation trap does NOT close the
  writer question — reported as such, and the next instrument must
  trap the trust object itself (or the inheritance formula), not add
  more deed APIs.
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
- SOLO (exploratory, not binding): solo-office count, cumulative
  delta, and per-10-day rates reported per seed; the bounded/runaway
  read is qualitative and binds nothing this run.

## Seeds / policy / horizon

Seeds 26051–26055 (fresh band: r45 used 26001–26005, r46 26011–26015,
r47 26021–26025, r48 26031–26035, r49 26041–26045).
Policy: competent (same as r41–r49). Regimes: 26051, 26052
EARLY_KILL_DAY=5; 26053, 26054, 26055 EARLY_KILL_DAY=40. Horizon:
phase A per regime, then the scripted kill via the REAL playerDeath
('a hushwolf') unless the mantle passes organically in phase A
(honored per the standing rule), then 45d competent play as the
successor. Death-aware stop (+10d tail). Convo checkpoints: d+3, +7,
+14, +30, +45 (2 top-trust villagers each).

## Metric review

- (Filled at run close. If any binding metric proves wrong, the revision
  is proposed here for the NEXT run, never re-scored mid-run.)

## Implementation notes (from r49 driver, for the run that builds r50)

Base: copy scripts/journey-succession-r49-20261026.js →
scripts/journey-succession-r50-20261026.js (mode string, EVID date dir
2026-10-26 for transcripts + tele files; analyzer + proof test copied
and re-seeded the same way). Edit list:

1. BUMP TRAP (after the deed wrappers, before phase A): wrap
   Game.bumpTrust; record into rec.bumpLog ONLY when postDeathActive
   (same gating as deeds). Entry: {day, vid: firstName, before, after,
   delta, reason: (arg3 ?? null), site: first stack line matching
   /\.js:\d+/ after the wrapper frames, truncated to 160 chars}.
   before/after via trustOf around the forwarded call. Forward the
   original's return value; never swallow errors (record + rethrow
   like the deed wrappers).
2. CALL-SCOPED BUMP SLICE: in the post-loop iteration, capture
   bumpMark = rec.bumpLog.length before runDays; in the callMove
   IIFE, attach bumpEntries: rec.bumpLog.slice(bumpMark) (full entries,
   not just counts) to the pushed move object. Convo window: capture
   bumpMarkConvo = rec.bumpLog.length before the convo block
   (convoLinesBefore48 point) and attach its slice to any
   convoWindowMove pushed in the post-convo IIFE.
3. CONVO_DAYS: [3, 7, 14, 30, 45]. POST_DAYS stays env-overridable
   (default 30); production runs pass POST_DAYS=45. Proof test keeps
   POST_DAYS=30 (fast) — the +45 checkpoint simply never fires there.
4. ANALYZER (copy of r49's, seeds 26051–26055): new sections — W1
   classification per transition (bump/deed/direct/unexplained) with
   the r49-style no-deed subset and its bump-explained share; SOLO
   table (count, cumulative delta, per-10-day rates, late-window
   share); C1v2 + C1v3 side by side (C1v2 final run); MG2v2 verdict
   with old MG2 as continuity-only. Drop the A1 verdict section
   (armor maps still read for continuity, no verdict). TELE TRAP
   (r47/r48 lesson): tele is written BEFORE finish(), so any
   finish-time classification counts must be computed directly from
   rec arrays (bumpLog, officeCallMoves, convoWindowMoves, officeDaily),
   never from finish-time objects.
5. PROOF TEST (copy of r49's): RED = r49 driver lacks bumpLog,
   bumpEntries on callMoves, convoWindow bump slices. GREEN = r50
   driver on proof seed 24999 (EARLY_KILL_DAY=5, POST_DAYS=30) emits
   all three; every bumpLog entry has day/vid/before/after/delta
   (delta === after-before); every officeCallMove carries a bumpEntries
   array; W1 classification covers 100% of that seed's transitions
   (or reports the uncovered set explicitly); tele carries
   succession.bumpCalls + succession.bumpExplainedShare computed
   directly.
