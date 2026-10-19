# sim-pitstaff-b2 (second briefing) — NOT RE-RUN: the question is already answered (2026-10-19)

Loop-B food-economy arm, run fleshout-loop-b-20261019T1230Z. This run was
briefed to rebuild the PITSTAFF=1 staffing layer on the knowledge-open
substrate (the #551(1)/#578(1) named next: "re-run pitstaff staffing on
the new substrate"). The mandatory findings-backlog check (loop body:
"When planning arms, CHECK the backlog") found that **this exact arm
already ran 13.5h earlier** — run fleshout-loop-b-20261018T1930Z,
evidence/2026-10-18/sim-pitstaff-b2.md, committed on master as d03ebcc1f
(ancestor of current HEAD 43e61a81c) — and was **KILLED with teeth**.
No sims were run, no layer was rebuilt. Re-running would re-measure an
answered question against an explicit do-not-rerun finding.

## Canon read (BEFORE sims)

- docs/CANON.md (full read): knowledge gates every surface; human skills
  ≠ alien abilities — snare/pit/trap craft is HUMAN skill (teachable
  earthly knowledge), never a System slot.
- docs/KNOWLEDGE.md (full read): the pitknowledge channel landed 2026-10-18
  (knowsPit occupations → grantKnowledge L1 paths) is the substrate this
  arm was to rebuild onto; nothing in it asks for policy-side staffing.
- docs/PRESERVATION.md (skimmed the ladder): pit boar/deer meat enters
  the existing cleaned→cooked→smoked→rendered→pemmican ladder — nothing
  new needed for it. No ladder change was planned.
- docs/BEAR.md via the prior evidence: bear is NOT a trap target; boar
  retrieval is a real wound-risk beat ("your own pit trap" is an engine
  death mode).
- **No hunting/traps canon doc exists** (no TRAPS.md/HUNTING.md in docs/
  — re-verified). Trap species table in src/data/recipes.json.

## PRE-REGISTRATION (binding; written BEFORE sims — MEASUREMENT.md §14)

As briefed: QUESTION — does staffing pit traps on the knowledge-open
substrate produce boar kills and boar-kcal to the pantry? PRIMARY
(binding): boar kills armed ≥ 4 AND boar-meat pantry arrivals ≥ 5,000
kcal. ENGAGEMENT (kill-fast): ≥ 16 pit traps armed+set across the armed
side at pilot, else KILL. GUARDRAILS: trap-duty deaths ≤ control+2;
median survival ≥ control−10d; no new death mode; det-gate byte-identical.
HORIZON 180d death-aware. SUBSTRATE FEASTSCALE_R13=1/SEATDRIVE=0/
HUNTSTAFF default OFF both sides. SEEDS fresh verified-unused ×
{leadfeast,belongfeast} × {control,armed}. POLICIES leadfeast/belongfeast
competent-derived. PILOT 8 seeds before ANY confirm spend.

## The decisive backlog check (the stop)

- Finding #581 (hidden_files/sim-findings.md, goal workspace):
  "[killed 2026-10-18 loop-B arm sim-pitstaff-b2, run
  fleshout-loop-b-20261018T1930Z] 2026-10-18 — food/traps —
  PIT-STAFFING NO-GO ON KNOWLEDGE-OPEN SUBSTRATE
  (evidence/2026-10-18/sim-pitstaff-b2.md, 32 runs 9005-9010/9306-9307
  x {leadfeast,belongfeast}, FEASTSCALE_R13=1/SEATDRIVE=0, proof 19/19 +
  det-gate 4/4 pre-sweep): 3/16 armed crafts (bar >=8), 0 boar kills,
  0 boar kcal, AND 2 'your own pit trap' villager deaths armed-side
  (new death mode, 0 control). pitstaff is 0-for-2 (b killed at
  engagement on L0 substrate; b2 killed with teeth on knowledge-open).
  **Do NOT re-run staffing on this channel.** Named next: the NPC
  trapper line (18%/return, pitknowledge sweep: 1 boar + 2,564 pit
  kcal/16 runs) is the live pit economy — instrument it, don't staff it."
- The prior run's pre-reg calibrated the bars BEYOND the brief's: the
  ≥16 engagement bar was justified down to ≥8 crafts, and a paired-delta
  clause was added (control now carries the NPC pit line on both sides,
  so armed−control delta must be ≥3 boar kills AND ≥4,000 kcal). The
  brief's bars are the stale pre-b2 version — the brief was generated
  from pre-1930Z tracker state.
- Verdict on record: **NO-GO — KILLED.** Engagement miss (3 < 8),
  primary miss (0 boar kills, 0 boar kcal), AND new-death-mode
  guardrail miss: 2 "your own pit trap" deaths on armed, 0 on control.
  "A staffed pit-trap program is a villager-death factory."
- The kill landed on master as d03ebcc1f (evidence only, layer deleted
  zero-trace) and is an ancestor of current HEAD. No pitstaff revival
  exists anywhere on master. Current HEAD (43e61a81c) is
  sim-trapline-census-b2 — the #581 named next (instrument the NPC
  trapper line) is already executing.

## Verdict: NOT RE-RUN (prior-evidence kill stands)

- No sims run, by design. Cost of re-running: 32 × 180d death-aware sims
  to re-measure an answered question against an explicit do-not-rerun.
- No layer rebuilt (scripts/policies/pitstaff.js stays absent — the kill
  protocol's zero-trace is preserved). No instrument changes.
- Convergence state: **killed** (recorded 2026-10-18; this run is a
  confirm-of-record, not a new measurement).

## Sweep result

None — deliberately. §15 balanced panel: N/A (no before/after exists;
same class as the b kill's diagnostic note).

## Village assessment

n/a — no new sims. The live pit economy is the NPC trapper line
(18%/return TRAPS-purpose beat), already being instrumented at HEAD.

## Sense-test (SENSE-TESTING LAW)

No new transcripts read. On record from the 1930Z kill (belongfeast-
armed-9307, d148–155): "Somchai Prasert is dead — your own pit trap.
The village stops. Somebody screams. Somebody else starts digging." —
the fiction knows the danger; the staffing layer dug the pits anyway.
That reading stands and needs no re-proof.

## Metric review (mandatory)

- The pre-registered bars above match the brief's stale version; the
  binding bars are the 1930Z run's calibrated ones (≥8 crafts,
  paired-delta ≥3 kills / ≥4,000 kcal, guardrails incl. no-new-death-
  mode). No re-scoring — the kill stands under its own bars.
- Any future pit-staffing proposal must treat "your own pit trap" as a
  known death channel (2 events, player=True, in the death-mode corpus)
  and justify why it would not reproduce the villager-death factory.

## Named next (unchanged from #581)

1. Instrument the NPC trapper line (the live pit economy) — IN PROGRESS
   at HEAD (sim-trapline-census-b2).
2. Trapper Handbook loot tuning (candidate 1) — still untested; note the
   #579 instrument bug (check `bookId`, not `itemId`) before any arm.
3. Day-0 "your old life taught you the pit" beat for the silent
   background L3 grant — still open.

## Proposed backlog text (coordinator: sim-findings.md is outside my file overlap)

- Mark #578's NAMED NEXT (1) as answered-by-#581 (the 1930Z sim-pitstaff-b2
  kill); the brief's "#551(1)" pointer is stale — #551's candidates were
  knowledge-side arms, and the staffing rebuild was #578(1). Add:
  "- [answered 2026-10-18 sim-pitstaff-b2, confirmed-not-rerun 2026-10-19
  loop-B run fleshout-loop-b-20261019T1230Z] — the 1930Z re-run on the
  knowledge-open substrate was NO-GO with teeth (3/16 crafts vs bar ≥8,
  0 boar kills, 0 boar kcal, 2 'your own pit trap' deaths armed/0 control;
  commit d03ebcc1f). Do-not-rerun stands."
- Tracker note for the coordinator: the 20261019T1230Z brief was generated
  from pre-1930Z state (its bars predate the b2 calibrations); the
  convergence tracker's pit-staffing line should read killed-with-teeth,
  not open.
