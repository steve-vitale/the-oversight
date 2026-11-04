# Journey endgame r121 — PILOT analysis (lane B, 2026-11-03 21:00 CST run)

Substrate r118 exactly; probe = r118 verbatim except renames +
evidence dir 2026-11-04/perseed-endgame-r121. Base master c4c9865ce.
Pilot seeds 89701 (waves), 89702 (waves), 89704 (forcedrift control),
89705 (wavesnw). 180d, death-aware. PILOT EXIT 0. Analyzer exit 1
solely on stale denominators + tally metrics (see bindings below) —
no instrument error, no seed failure.

## Pilot table (r118 -> r121, matched seeds)

| seed | r118 | r121 |
|---|---|---|
| 89701 waves | village-lost/scattered, 0 fights, uw3, standing 99 | announced d140, sat d141, WON LESSER (feared/light, final:mercy), 16 fights (2 vKill, 10 talkDown, 1 vFlee, 1 mFlee, 2 otherEnd), uw4, standing 199, peakVet 1@d51, kills: algorithm d50, strike d113 |
| 89702 waves | announced d90, WON LESSER, 10 fights (1 vKill), uw4, standing 199 | announced d107, sat d107, WON LESSER (beloved/light, final:audience), 11 fights (2 vKill, 3 mFlee, 4 vFlee, 2 otherEnd), uw4, standing 199, peakVet 1@d78, kills: eater d78, eater d101 |
| 89704 forcedrift | village-lost, 0 fights, uw3, standing 75 | village-lost/scattered d61, 0 fights, uw3, standing 25, 18 deaths |
| 89705 wavesnw | announced d113, WON LESSER, 7 fights (4 vKill), peakVet 2@d99, uw4, standing 199 | announced d90, sat d104, WON LESSER (beloved/light, final:quiet), 16 fights (1 vKill, 12 mFlee, 2 vDie, 1 vFlee), uw4, standing 199, peakVet 1@d104, kill: influencer d104 (sit day) |

Road tally: uw5 0/3 waves seeds, wave-5 faces 0, full seats 0,
lesser wins 3/3 sitting seeds. Standing peaks 199/199/199 — never
200+. Full-seat gap uniform: w5 0/2 (veterans also short at 1/2 on
all three sitting seeds).

## Bindings (prereg, pilot-scaled — the judge)

- M1-guard: GO 4/4 (announced / honest-death on all four).
- M2-census: GO — every fight outcome named, engine opens == census
  fights, 0 errors. M2c GO, M2d GO (23/23 uncommitted classified).
- MFLEE-routed-coverage: GO 16/16 — every mFlee carries gotAwayLines
  + closeSnapResult field, ALL gotAway-only. Zero monFled=true on
  any kind: NO monster-commitment violation.
- KILL-ANATOMY-coverage: GO 43/43 multi-turn fights.
- M5 (prereg wording — sitting seeds voiced): GO. 89701's audit +
  feared path + mercy final, 89702's beloved final, 89705's beloved
  final are all present in the transcripts. The analyzer's
  control-scoped M5 reads NO-GO only because the forcedrift control
  died d61 (0 band crossings, 0 notices) and this block has no relay
  final for the r68 fallback — that is an UNMEASURED control, not a
  voicing failure (see metric review).
- M10-fullseat-gap: GO 3/3, named w5 0/2.
- M11-standing-peak: GO 3/3 reported, 0 at 200+.
- ROAD-TALLY (not gated): 0 uw5, 0 faces, 0 full seats.
- Analyzer-only NO-GOs, NOT prereg gates: M1's printed NO-GO is the
  stale >=5/7 denominator (4/4 under the prereg >=3/4 bar); M4/W5 are
  the tally above; M3/M3b are informational (wavesnw kills 1 vs
  waves kills 4; no seed peaks >=2 veterans — the pair problem
  persists: SECOND-VETERAN second=never on all three).

## Interesting findings

1. 89701 FLIPPED from death to a lesser win. In r118 this seed
   scattered with zero fights; on current HEAD it announces d140
   (after a d90 withdrawal — pellet hums, no hunger on record — then
   a feast-driven recovery, surge d140) and sits d141 feared/light
   with a mercy final. A withdrawal is not a dead end: the run can
   come back through feasting and still win lesser. Reachable/fun
   note in the run's favor.
2. 89705's fight SHAPE flipped: 7 fights/4 kills (r118) -> 16
   fights/1 kill/12 gotAway (r121). The gotAway fights are mostly
   1-turn day-boundary dissolutions plus stare-down disengages,
   narrated honestly ("It got away. No meat, no trophy — but you're
   breathing, and now you know its moves."). No commitment
   violation, but wild fights now mostly dissolve unresolved instead
   of resolving. Hypothesis (unproven): win-intel/win-drives
   landings changed engagement timing. This is the next arm's
   question — diagnosis before any fix, no fix landed here.
3. Sit-day deaths RECUR: 89702 Nadia d107 (alien, sat day); 89705
   Diana d104 (the wild, sat day) + visjoin_94 combat. Diana's
   sit-day death is now a three-run pattern class (r110 d120 alien,
   r121 d104 wild). Narration is strong (see people check), but the
   pattern deserves a named watch: the bearer repeatedly dies the
   day the village sits.
4. The road stays closed on both bars at once: standing caps at 199
   on all three sitting seeds AND veterans sit at 1/2 AND wave-5
   faces at 0/2. No single-bar story explains the closure.

## Village assessment (plain words)

- 89701: nineteen deaths across the run (monsters, aliens,
  dehydration, contests, one wound that wouldn't close), but the
  village held together, banked one veteran (Ruby's line — Ruby
  Callaghan put down Loud-Eyes d113 and later ascended through the
  relay doors the village built), feasted its way back from a d90
  withdrawal, and sat at the lesser seat. What was missing: armor
  (3/4 fighters armored), weapons (3/6 armed), a second veteran,
  and any wave-5 face.
- 89702: thirteen deaths, two eater kills banked one veteran, sat
  the same day it was announced (d107) and won lesser beloved. The
  bearer Nadia died of alien causes ON sit day — the village won
  with its bearer dying at the door. Missing: the second veteran
  and any wave-5 face.
- 89704 (control): eighteen deaths, zero fights, scattered by d61.
  A village that never got to fight at all — the control's story is
  attrition, not battle.
- 89705: fifteen deaths, but the village feasted hard (3 feasts, 8/8
  feast-surge feeds, 21 feasted days) and fought often without
  finishing — twelve fights walked away from. Diana held the fire
  until sit day itself, died in the wild that day, and the mantle
  passed to Leo Martin, 16, trail crew lead, who sat the lesser
  seat beloved and spoke for the quiet ones. Missing: a second
  living veteran (the d104 influencer kill banked the first, on sit
  day — too late to pair) and any wave-5 face.

## People check (transcripts read, sense judgment)

PASS. 89701's window reads as a story, not a ledger: the d90
withdrawal ("NO HUNGER ON THE RECORD — THE PELLET HUMS WHERE THE
FIRE SHOULD BE") is answered 50 days later by an actual feast and
surge, the audit reads the run back honestly (including "more
promises broken than kept" yet a light branch, because the
protected outnumber the killed and the food truth was shared), the
feared path's mercy final resolves the restraint theme, and the
Architect beat credits Ruby's ascension through doors the village
built. 89705's sit-day succession is the strongest people passage
in the pilot: "The Codex turns a page on its own. Diana Osei is
dead. You didn't ask. It knew." / "The village stops. Somebody
screams. Somebody else starts digging." / "You're not Diana... You'll
have to earn this face." Leo arrives with his own kit (Bloodhound,
Echo Location, Berserker Rage, Lucky Rock, Trophy Room, Night
Eyes) — purpose-made, not blank. Party fights read like people:
Sanne joins ("Finally. A fight worth watching."), binds wounds
mid-fight, Rafael screams monsters still.
Texture notes (not fails): Chloe's "Smell that? Something's
different here." repeats across days, and "You wait. The light
changes. Nothing asks anything of you." recurs as ambient filler.
Documented, not fixed — ambient-line variety is a content pass,
not a pilot fix.

## Blank filled or documented

DOCUMENTED (no game fix landed — gating freeze + root-cause-first):
(a) 89705's dissolve-heavy fight shape (finding 2) — next arm's
diagnosis question, not a fix. (b) Ambient-line repetition (above).
(c) M5 fallback gap (metric review). No src/js changed this run;
probe + analyzer + evidence only.

## Metric review (proposals for the NEXT run, never applied mid-run)

- M5: the r68 fallback requires a relay final with notice lines in
  the block; a pilot block with no relay path and a control dead
  before the window then NO-GOs on an unmeasured control. Propose:
  control-dead-before-window + zero relay finals in block = INFO/
  vacuous, not NO-GO (same spirit as the r76 M5b vacuous-GO).
- M1: the analyzer's >=5 denominator is stale for pilots; the
  prereg's pilot-scaled bar (>=3/4) judged this run. Propose the
  analyzer take its M1 bar from an env var or the prereg.
- M3b-peak: with the pair problem persisting (0/3 peak >=2),
  keep it informational until a run banks a pair; do not let it
  gate a pilot whose question is the road.

## Telemetry deviation check

CORRECTED (the run's own ls was truncated to 10 lines, hiding it):
an endgame baseline DID exist — an r51-era snapshot (maxTier /
satPenalty) carrying a regime warning ("Do not compare pre-seat
corpora against this file"). This run's --update-baseline added
three current-regime keys (veterans.unlockedWave / won /
peakLivingVeterans) alongside it, preserving the r51 note. The
check's LOUD lines are new-key artifacts only (pilot sums: uw 15,
won 3/4, peakVet 3) — investigated, no real deviation. A _note_r121
regime label was added to the file so the next endgame run does not
mistake the mixed regimes for one corpus: the r121 keys are a
post-seat-regime seed, not comparable to pre-seat corpora.

## Run-start incidents carried (see prereg)

Stale-lock recovery (lock loop2-20261104T005553Z dead by heartbeat +
process + file evidence); registry-lock contention (~12 min);
r120 HELD WORK — the journey2-endgame tree is dirty AND its src/js
files are gutted (fieldFights.js -2558, sigW4.js -1021, deletions
only) with all-config perseed data present. Untouched by this run
(read-only status counts only). Needs main-session inspection
before any restore, analysis, or landing. This run used the fresh
slug journey2-endgame-r121 instead.

## Verdicts

REACHABLE: yes — 3/3 sitting seeds reach the lesser seat and play a
full finale; the table, audit, and final choice all fire.
FUN: yes, with a caveat — the finales read well and the
withdrawal-then-recovery arc is a real story; the caveat is
89705's dissolve-heavy fights, which make the wild feel
unfinished rather than dangerous.
WINNABLE: lesser yes; FULL no — the road is still closed on every
bar at once (uw5 0, faces 0, veterans 1/2, standing 199-capped).
Nothing in this pilot moves the full seat, and no gate was touched.
