# Journey succession r47 — SCRIPTED DAY-5 REGIME + BEARER-OWN DELTA + EVENT-VS-DEED SPLIT (lane B, pre-registration 2026-10-25)

Leg 7 (succession). Rotation-b read 7 → write 4 (next run plays leg 4, endgame).
This run takes r46's four named next steps, on a single changed regime so
the comparison is honest: every seed now uses the scripted day-5 kill. No
game change is proposed or expected; this is an instrument run. If a gap
closes, the NEXT run's bars change; this run's bars below bind regardless.

## The four next steps (from r46's run note, 2026-10-25)

1. SCRIPTED-REGIME SEEDS AT EARLY_KILL_DAY=5. r46's day-10/40 kills were
   all pre-empted by arena deaths in phase A (all 5 first deaths organic,
   days 8–28), so no seed ever staged the scripted kill in the real band —
   only the proof seed (24999) did, at day 5. This run stages the kill at
   day 5 on all 5 seeds, before the arena band opens, and asks whether the
   young-village succession behaves differently from r46's arena band.
2. BEARER-OWN-DELTA ON SOLO-OFFICE CALLS. r46's "solo-office" calls are
   calls where the office entry moved but NO villager's trust moved >= 3
   (the movers threshold). This run records the bearer's own trust delta
   UNCENSORED on every callMove (bearerDeltaExact), so a solo-office call
   can be checked: is it a small bearer drift (delta 1–2, i.e. the office
   entry moving under its own threshold), or is something else moving the
   entry? On chain handoffs (bearer changed mid-call) the field is null —
   an old-bearer-to-new-bearer delta would be meaningless.
3. EVENT-BEAT VS DEED WRITERS (the narrowed trap). r46 narrowed the trap
   to: diffuse jumps ride event-dense calls, concentrated moves are
   single-mover. This run classifies every trust-move call by its own
   lines: event-only (crisis lines, no gift lines), deed-only (gift lines,
   no crisis lines), both, neither — and cross-tabulates that against
   concentration (solo / single-mover / concentrated top-share >= 0.5 /
   diffuse). This is still census, never attribution — but if diffuse
   moves cluster on event-only calls and concentrated moves on deed-only
   calls, the NEXT step is event trapping; if not, the trap stays open.
4. ONE MORE V2B RUN BEFORE ANY BAR REVISION. M3v2b stays binding at
   >= 2 on >= 4/5 seeds, unchanged from r46. A second miss does not revise
   the bar mid-run; it goes to metric review for the next run.

Died-between stays opportunistic (third run watching): the branch cannot be
forced honestly and stayed empty through r45 and r46.

## Canon note

No dedicated succession/mantle canon doc exists in docs/ (CANON.md's table
covers diseases, bear, preservation, waves, contests, conversations, party,
systems, balancing, time, kin, fans — not the lineage/mantle machinery).
This run invents no canon: it measures the machinery r38–r46 already
exercised, under Steve's 2026-10-23 meal-gate ruling (established-villager
successors eat full at any trust). DEAD-LEDGER.md was skimmed; it is a
dead-code ledger, not succession canon.

## Leg question

In the scripted day-5 regime — a village too young for the arena band —
does the succession machinery still hold (vouch, funeral, machinery, meal
gate, echo), and do the call-census patterns from r46 (solo-office drift,
event-riding diffuse jumps) reproduce or were they arena-band artifacts?

## What counts as an interesting finding

- SCRIPTED STAGING: >= 4/5 seeds stage the scripted day-5 kill (not
  pre-empted by an organic death before day 5, not a village-over skip).
  A pre-emption before day 5 is itself a finding (the arena band opens
  earlier than r46's days 8–28 suggested).
- S1: on solo-office calls, bearerDeltaExact equals the office delta BY
  CONSTRUCTION (both read trust[bearer], rounded the same way) — so the
  S1 finding is the distribution, not the equality: if every solo-office
  delta sits within ±2, solo-office calls are fully explained as
  sub-threshold bearer drift (the movers threshold is 3) and the
  "solo-office" class closes as a threshold artifact, not a hidden
  mechanism. Any solo-office call with |delta| >= 3 would be an
  instrument contradiction (a >=3 mover the movers list missed) and is a
  fail-loudly bug, not a game finding.
- S1b: single-mover calls split bearer-mover vs other-mover. A
  bearer-mover single is trivial (the office entry IS the bearer's trust);
  an other-mover single is the interesting case.
- E1: diffuse moves cluster on event-only calls AND/OR concentrated moves
  cluster on deed-only calls — either clustering narrows the trap; no
  clustering leaves it open and is reported as such.
- V1, M1, M4, MG2, M5 stay green: any regression is a REAL BUG, fail
  loudly — same as every succession run. Regime note: a day-5 village
  will have few or no trust>=60 vouchers, so V1 may pass vacuously on
  some seeds; that vacuity is reported, never dressed up as coverage.
  Likewise a thin young-village echo (M3v2b miss) is a regime effect to
  report in metric review, never a re-score.

## Binding metrics (§14)

- SCRIPT (staging): >= 4/5 seeds with death.scripted === true (the
  driver staged the kill after 5 phase-A calls; on the proof seed that
  lands on day 6, since the game starts on day 1 — the regime is "5
  phase-A days", not "death on day 5"). An organic pre-emption
  (scripted === false) counts as a miss, reported with its day.
- V1 (vouch snapshot, carried): 5/5 seeds resolve under r45's rule with
  no snapshot-timing artifact and no FAIL.
- C1 (call attribution, carried): 100% of post-death officeDaily moves
  have a matching callMove (same day) carrying office before/after, a
  per-villager trust diff, and bucketed call lines summing to the call
  line total.
- S1 (bearer-own delta, completeness): 100% of same-bearer callMoves
  carry a numeric bearerDeltaExact; 100% of chain handoffs carry null.
- E1 (event-vs-deed, completeness): 100% of trust-move calls carry an
  eventClass in {event-only, deed-only, both, neither}; the cross-tab is
  reported whatever it shows.
- M3v2b (social echo, carried): on >= 4/5 seeds, >= 2 v2b mentions of
  the dead bearer within 7 days of death (funeral-arc lines excluded,
  loot lines excluded by the /^You take /i rule). v2 reported alongside.
- M1 (funeral arc): >= 4/5 deaths produce (a) the death beat naming the
  bearer, (b) recoverBearer <redacted> 2 days, (c) the burial act completable.
- M4 (machinery): 5/5 mantles clean (linOk + moOk).
- MG2 (meal gate): 0 violations on 5/5 seeds.
- M5 (people check): 0 identity failures across sense-read transcripts.
- Chain deaths: every chain death cause-known from fallen/lineage, or
  reported UNKNOWN with the missing list named.

## Seeds / policy / horizon

Seeds 26021–26025 (fresh band: no journey-succession evidence file uses
26021–26025; r45 used 26001–26005, r46 used 26011–26015). Policy:
competent (same as r41–r46). Horizon: phase A 5 days, then the scripted
kill via the REAL playerDeath ('a hushwolf') unless the mantle passes
organically in phase A (honored per the standing rule), then 30d
competent play as the successor. Death-aware stop (+10d tail).
Convo checkpoints: d+3, +7, +14, +30 (2 top-trust villagers each).

## Metric review

- (Filled at run close. If any binding metric proves wrong, the revision is
  proposed here for the NEXT run, never re-scored mid-run.)
