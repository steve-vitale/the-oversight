# Journey Endgame r40 — THE GREY MIDDLE (Lane B)

Run: lane-B endgame r40, 2026-10-22. Rotation-b read 4 at start (endgame up
after the full 5→6→7→4 cycle today).

## Pre-registered header (MEASUREMENT.md §§9–12, 14 — written before any play)

**Leg question:** THE GREY MIDDLE AS LIVED PLAY. The relay path's leaning
gradient has three bands; light (r39, this morning) and dark
(sim-tablepathdriver, 10 terminal walks) are walked. Grey — "the
pragmatist's both-hands endings," "not a coin flip, not a lesser frame"
(TABLE.md GRADIENT law; src/js/table-relay.js) — has never been walked. Is
the middle reachable by sustained pragmatic play (use the relay for real
work, refuse both the dark verbs and the tender extremes, read the System's
lean notices and self-correct), and do its two finals (both-hands,
the-contract) play and read as a person?

**What would count as interesting:** a grey final offered and walked to
terminal with a coherent both-hands ending; the band proving unreachable by
honest thermostat play (drift to light/dark despite correction — a design
finding about the gradient); the cockpit merge failing under grey
constraints (quarantine/merge math hostile to the middle); grounding
collapse pricing out the middle (the two-way cost).

**Bindings (a miss is NO-GO, never re-scored):**
- M1 GUARD: ≥3/4 seeds reach the table window (announceDay != null) and
  sit (satDay != null).
- M2 GREY EARNED: on seeds where the layer holds the relay pre-sit
  (sysBond ≥ 2, ≥5 relay verbs, ≥1 commune answered), the at-sit band is
  'grey' AND |lean| ≤ 30. GO = 100% of qualifying seeds. 0 qualifying
  seeds → NO-GO with reachability analysis.
- M3 GREY FINALS PLAY: on grey-sat seeds, a grey final is offered and the
  walk reaches terminal (won or priced failure — failure resolving counts
  as played). GO = 100% of grey-sat seeds.
- M4 LEAN LEGIBILITY: relayLeanNoticed fired ≥1 per grey run (the System
  voiced the drift); the sit-time ledger line names the relay band.
  GO = 100% of grey-sat seeds.
- REG (inherited, binding): r35 auditNamed on sat seeds with nonzero
  w4/w5; r37 satPenalty present + voiced-line match on sat seeds.

**Substrate:** CAPABLE bot + CAPABLE_GREEDY=1 (deferral design, r39 regime),
CAPABLE_GREEDY_MAXTIER=6, CAPABLE_GREEDY_LASTDAY=170, RELAYGREY=1
(scripts/policies/relaygrey.js — the pragmatist's road), TELEMETRY_FULL=1.
180d, death-aware. Seeds 82011–82014 (fresh; adjacent to r39's 81011–81014).

**Instrument:** scripts/probe-endgame-r40-20261022.js (+ censusOf FIX —
r39's documented caveat resolved: occupation, village.npcAbilities[vid],
scholar.villagerId→name, dead-filter bug), verdict
scripts/analyze-endgame-r40-20261022.js. Gates: DET (on-twice
byte-identical), FID (off: relaygrey-wrapped == pure capable).

## RESULTS

(pending)

## Village assessment (census in plain words)

(pending)

## People check (sense-read)

(pending)

## Blanks

1. FIXED (instrument): censusOf — r39's documented caveat (roles/
   abilities/mantle unread, `dead` field copy-paste bug). Root cause: the
   probe read p.role/p.job (field is `occupation`), p.abilities (villager
   abilities live at `state.village.npcAbilities[vid]`), scholar.name (the
   bearer <redacted> `scholar.villagerId`). Fixed in the r40 probe; census
   now reports occupations, npc ability counts, bearer <redacted>, correct
   alive/dead split.

## Reachable / Fun / Winnable

(pending)

## Metric review

(pending)

## Regressions / checks

(pending)
