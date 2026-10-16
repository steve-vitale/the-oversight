# sim-crumbguard-b — GUARDED whole-piece take for finding #121 (2026-10-16)

ARM: food-economy axis, game-code tuning (src/js/game.js pantryDraw
crumbs/floor1 region ONLY; plus a no-op refactor of the league-granary
famine draw to share the same burn helper — byte-verified by det-gate).
Worktree: sim-crumbguard-b. Run: fleshout-loop-b-20261016T1056Z.

**STATUS 2026-10-16 (redirect): KILLED at pilot on the old substrate; premise
MOOT on the new substrate (0152a2ce).** Steve's 2026-10-16 ruling closed the
pantry granularity leak at the root (depositPantryPieces: all external
deposits split to <=500-kcal pieces by default) — the crumb-guard lever's
entire premise (guarding multi-thousand-kcal whole-piece takes) no longer
binds. The lever is moot — a result, not a failure. game.js is zero-trace;
evidence + instruments retained.

Named next from this morning's KILLED sim-crumbs-b (evidence committed in
this tree: evidence/2026-10-16/sim-crumbs-b.md). Steve's 2026-10-14 ruling
on finding #121 stands: hungry villagers take the FULL piece, no
fractionating — a TUNING problem ("tune the distribution floor so a full
piece gets taken when a villager is hungry"). The literal whole-piece
always-take (CRUMB-FIX) was KILLED at confirm this morning: on marginal
pantries the whole-piece take is the lethal move (s88 autopsy: two
2,813-kcal takes drained a 5,626-kcal pantry to 0 in one day -> 4
empty-pantry starvations in the dying tail).

## Pre-registration (MEASUREMENT.md §§9–12, 14 — binding)

- **Lever**: CRUMB-GUARD. At the floor1/stoppedForCrumbs break in
  pantryDraw (game.js), a hungry villager takes the full piece ONLY IF
  pantryFreshKcalAfterTake stays >= a floor of 2 days' village need,
  computed from the engine's own daily-need accounting (villageDayBurn:
  the 7-day rolling honest-net burn the HONEST BURN clock writes, fallback
  roster x 1000 — the same accounting the league-granary famine draw
  uses; that draw now calls the shared helper). Else the old
  stoppedForCrumbs refusal stands. No fractionating — Steve's rule.
  Gate: CRUMBFLOOR=1 (measurement default OFF). RNG-neutral: the guard
  consumes no Math.random.
- **Primary metric**: ABSOLUTE starvedDays — GO if armed <= control x 0.75
  (when control starvedDays >= 8; below that the bug regime is too rare on
  these seeds and the run adjudicates NO-COVERAGE, judged on guardrails +
  the fixture-anchored mechanism proof). NOT the share — the share
  penalizes the intended mechanism by construction (sim-crumbs-b metric
  review). A miss is NO-GO, never re-scored.
- **Heterogeneity lens**: max per-seed (armed - control) starvedDays <= +1
  — the s88 check: no single seed may concentrate the cost mode.
- **Guardrails**: national >= control-2; medianDays >= control-10; no new
  death mode (single-seed occurrences = noise per pilot precedent); thirst
  deaths unchanged; exiled unchanged.
- **Horizon**: 180d death-aware (pacing-law max). Dead villages stop (+10d tail).
- **Substrate**: FEASTSCALE_R13=1 both sides, SEATDRIVE=0 explicit (pre-seat
  courtship substrate). Own paired control, identical seeds. Policies:
  leadcourt + belongseek (the census shape, competent-player family).
- **Seeds**: 8 FRESH — 101, 202, 303, 404, 505, 606, 707, 808 (the
  11/22/33/44/55/66/77/88 set is over-studied; excluded).
- **Staging**: proof RED->GREEN->GATEOFF->UNGUARDED->DETGATE->SMOKE first;
  pilot = 4 seeds (101/202/303/404) x 2 policies x {control, armed} = 16
  runs; confirm = full 8-seed shape = 32 runs. Kill at pilot if the primary
  doesn't move or any guardrail breaks.

## Proof test (scripts/test-crumbguard-20261016.js)

- **RED** (pristine, patch dance): s66-d46 fixture (want=1218, 500 +
  4x2000, 8,000 fresh): taken=500, remaining=718, freshLeft=8,000,
  shortOfFresh=false, no guard methods. The bug reproduces: hungry with a
  full pantry, refused. Marginal s88 fixture (want=1716, 500 + 2x2813):
  taken=500, refused. ALL GREEN.
- **UNGUARDED** (test-local shim of the KILLED literal rule, not game.js):
  two whole-piece takes 3313 + 2813 drain the 6,126 fixture to 0 — the s88
  mechanism, demonstrated. ALL GREEN.
- **GREEN** (CRUMBFLOOR=1): villageDayBurn averages the 7-day honest net
  (5050) and falls back to roster x 1000 (9000); RICH fixture (burn
  ~2,450/d, floor 4,900): full 2000 taken whole (taken=2500,
  crumbGuardTakes=1, indivisible); MARGINAL fixture (burn ~5,050/d, floor
  10,100): refused (taken=500, crumbGuardRefusals=1, 5,626 fresh intact);
  !drewAny whole-piece case unchanged. ALL GREEN.
- **GATEOFF** (guard installed, CRUMBFLOOR unset): byte-for-byte the RED
  fixture behavior — the gate changes nothing when off. ALL GREEN.
- **DETGATE**: 2 seeds (101/202) x 2 policies x 40d sharcensus canonical
  rows — pristine vs gate-off **byte-identical** (md5
  946f15b1044c6438e258704c1fda7b8d). The granary-refactor and the
  gate-off crumb path are trajectory-neutral. ALL GREEN.
- **SMOKE**: harness boots, gate responds both ways. ALL GREEN.

## Pilot (16 runs: seeds 101/202/303/404 x {leadcourt,belongseek} x {control,armed}, CRUMBFLOOR=1 gate, FEASTSCALE_R13=1 SEATDRIVE=0, 180d death-aware)

**SUPERSEDED 2026-10-16 by the substrate change (0152a2ce).** This pilot ran
on the pre-fix substrate (base 3fd8e4d3, pantry slabs up to 2,813 kcal
reachable via the haul leak). Its results are not decision-relevant on the
new substrate and were NOT re-run — the premise probe below replaces them.
Retained as the historical record of why the guarded variant was killed.

Run by the adopting worker 2026-10-16 (the dead run left 7 partial census
files; all 16 runs were re-run fresh in chunks for clean OUT rows — control
leadcourt s101/s202 re-ran byte-deterministic). Analyzer:
scripts/analyze-crumbguard-20261016.js. Raw: evidence/2026-10-16/crumbguard-pilot/
(census-{control,armed}/, crumbguard-pilot-{control,armed}-out.json).

- **PRIMARY (absolute starvedDays)**: control=19, armed=10, bar armed <= 14.3 -> **GO** (spurious — see metric review: 0 crumbs-left starvations in control, 0 sense beats; the guard's intended mechanism never had an opportunity).
- **HETEROGENEITY LENS**: per-seed deltas (armed-control): belongseek-s202 +4, belongseek-s303 -14, leadcourt-s202 -3, leadcourt-s303 +3, leadcourt-s404 +1, rest 0. Max +4 > +1 -> **NO-GO**.
- **GUARDRAILS**: national 6 -> 6 (>= 4) GO; medianDays 180 -> 164 (>= 170) **NO-GO**; new death modes: none GO; thirst 2 -> 2 GO; exiled 0 -> 0 GO.
- Control starvePaths: empty-pantry 14, away-pack-empty 2, spoiled-insufficient 2, away-pack-short 1 — **zero crumbs-left**. Armed: empty-pantry 2, away-pack-empty 2, spoiled-insufficient 4, away-pack-short 2 — also zero crumbs-left.
- Armed villages lost 5/8 runs (leadcourt s101 156d, s202 164d, s404 154d; belongseek s202 137d, s303 89d) vs control 2/8 (leadcourt s202 47d, belongseek s303 114d). Deaths combat-dominated both sides; armed had more combat (130 vs 101), villager-combat (91 vs 75), monster (63 vs 28) deaths. Starvation deaths: control 5, armed 3.
- Guard activity probe (scripts/probe-guardtakes-20261016.js): the guard FIRED 52-65 times per leadcourt run (6 refusals max) — the mechanism is active, just never on a crumbs-left starvation.
- **VERDICT: KILLED at pilot.** Primary GO is spurious (no bug-regime coverage); the lens and the medianDays guardrail both miss. game.js reverted to zero trace.

## Confirm (not run — killed at pilot)

## Sense test

- Proof-phase SENSE BEAT (GREEN): Nino, want 1218, pantry 500 + 4x2000, burn ~2,430/day — takes one whole 2000-kcal piece, over-fed by one indivisible piece, pantry left at 6,500 above the 4,900 two-day floor. Reads as intended: a hungry villager takes the full piece, the pantry's throat not cut.
- Pilot sense beats (analyzer): **0** guard-takes fixed a crumbs-left starvation — because crumbs-left starvation never occurred on these 8 seeds.
- Freeloader-manufacture probe (scripts/probe-freeload-20261016.js): armed leadcourt s101 — Pedro reached freeloader **stage 2 (warning)** mid-run; control s101 had zero staged villagers; Pedro died. The guard's whole-piece over-feeding pushes honest villagers' 7-day net take rate above their fair share (drainBeyondCapacity: netRate7 > fairShare), staging them for gossip -> warning -> vote. Theft is allowed and socially punished by design — but here the "theft" is the engine over-feeding a hungry villager, and the punishment lands on an honest person. s404 armed showed no staging: the mechanism is real but not universal.
- Tail ledgers (armed s101): Nora ate 56,355/54,899 need, Sam 77,292/75,114, Dale 54,636/53,140 — systematic over-feeding, the guard's fingerprint in the books.

## Premise verdict (2026-10-16 redirect — new substrate, 0152a2ce)

**VERDICT: MOOT.** Probe: scripts/probe-premise-20261016.js — ALL GREEN (11/11)
on rebased master (30db20e5, includes 0152a2ce), pristine game.js, no guard
installed. The question: can a whole-piece take at the floor1 break still
drain a pantry dangerously — is the killed sim-crumbs-b mechanism (two
2,813-kcal takes draining 5,626 kcal to 0 in one day) still reachable?

1. The s88 slabs through the new choke point: 2 x 2,813-kcal deposits via
   depositPantryPieces arrive as **12 pieces, max 500 kcal**, all 5,626 kcal
   preserved (no calorie loss, honest split 500/500/500/500/500/313 per slab).
2. Worst-case whole-piece take at the floor1 break: **500 kcal** — 8.9% of
   the s88-shaped pantry, not a drain.
3. Draining the 5,626-kcal pantry via floor1-break whole-piece takes needs
   **12 takes** — an order of magnitude above the killed mechanism's 2.
4. The floor1 refusal still fires on pristine (want=1218 vs 4x500:
   taken=1000, 218 need unmet, 1000 fresh left, shortOfFresh=false) — the
   ruled-on bug exists on the new substrate, **defanged** not fixed. A
   hungry villager is refused 218 kcal with food in the pantry; the cost
   of taking the full piece is now bounded at 500 kcal instead of 2,813.
5. The freeloader-manufacture cost mode (this arm's pilot finding) is
   structurally closed too: per-take over-feed at the break is strictly
   < 500 kcal (old regime: up to 2,813), and the fair-share clock trips
   drainBeyondCapacity only above 2000 kcal/day net sustained — unreachable
   via <500/day takes when the meal structure draws once per day.

The guarded-vs-unguarded difference is negligible on the honest substrate:
the most the guard could ever save is a <500-kcal take it refuses, and the
most the literal take could ever cost is a <500-kcal over-feed. The lever's
premise does not bind. No pilot re-run — there is nothing left to measure.

## Metric review (§14) — addendum 2026-10-16

5. **Steve's 2026-10-16 ruling resolves finding #414's question.**
   The crumb-guard arm asked "how do we tune the distribution floor so a
   full piece gets taken when a villager is hungry without the lethal
   marginal-pantry cost?" Steve's answer: don't tune the take — close the
   granularity leak. With pieces <=500 kcal by default, the whole-piece
   take IS the full piece AND the bounded piece; the floor1 break's worst
   case is a 500-kcal over-feed, which the pantry and the fair-share clock
   both absorb. Root cause first, new systems last. The #121 no-fractionating
   rule now implements itself through piece size — no guard, no gate, no
   lever needed. This is the honest statement: the lever is moot because
   the design got simpler, which is a result, not a failure.

1. **The primary's coverage gate was wrong.** The header gated adjudication on control starvedDays >= 8 (total). Control hit 19 — but ALL of it was empty-pantry/away-pack/spoiled-insufficient; crumbs-left starvation (the bug regime the lever targets) was 0. The primary GO (19 -> 10) is therefore spurious: the reduction came from trajectory divergence (armed belongseek s303 died at 89d of combat before starvation could accumulate vs control's 114d empty-pantry tail), not from the guard fixing anything. **Proposed revision for the next run:** the primary is adjudicable only when control crumbs-left starvedDays >= 4 (a mechanism-coverage gate, not a totals gate). Totals without the bug regime are noise.
2. **The medianDays guardrail caught a real cost the primary couldn't see.** The guard drains ~100k+ extra kcal/run from the pantry via whole-piece over-feeding (52-65 takes/run x ~2,000 kcal), and — worse — manufactures freeloader evidence (s101: Pedro stage 2). The guardrail did its job.
3. **Design implication for any future whole-piece-take:** the over-fed excess must not count as a "take" in the freeloader ledger (takeHist), or the fair-share bar must absorb indivisible-piece granularity. Otherwise the engine frames honest hunger as theft. Logged as a finding (see Blanks).
4. No metric was re-scored mid-run. The NO-GO stands on the pre-registered bars.

## Blanks filled / documented

- **DOCUMENTED (finding, needs design):** whole-piece takes vs the freeloader clock — the guard's over-feeding stages honest villagers for freeloader gossip/warning (s101: Pedro stage 2, then dead). Any future #121 tuning must exempt guard-take excess from takeHist or absorb piece granularity in the fair-share bar. Appended to hidden_files/sim-findings.md as sim-crumbguard-b finding.
- **DOCUMENTED (metric):** primary needs a crumbs-left coverage gate (see metric review §1).
- **DOCUMENTED (infra):** a mid-pilot background exec session vanished without completion delivery (~12:20 UTC, 3 sibling sim processes active, 6GB/7GB used) — almost certainly an OOM kill. Reran the pilot in small chunks (2-4 runs each) with no further loss. Lesson: on this box, chunk long sweeps when siblings are simming.
- Filled: none in game code — the lever is killed, game.js reverted to zero trace.

## Village assessment

The eight control villages: mostly healthy, long-lived places — five of eight
survived the full 180 days, six of eight reached national rank, one (s404)
touched wave 4. s101 control was the picture of a working village: 11
villagers (Pedro, Juan, Angela, Kobby, Hany, Naran, Nikos, Raj, Petra, Farid,
Hassan), 1,666 shared meals, zero starved days, dead at nobody's hands but
time's. The two control losses were honest failures: s202 leadcourt starved
out at day 47 (Néstor's last meals were desperation-spoiled scraps from an
empty pantry — the pantry genuinely ran dry), s303 belongseek collapsed at
114d after 16 empty-pantry starvation days.

The armed villages looked the same from the outside — same waves (more wave-4s,
in fact: 4/8 vs 1/8), same national reach (6/8) — but died younger and
angrier: five of eight lost, median 164 days, with more combat and
villager-on-villager killing. The cruelest beat was Pedro on armed s101: the
guard kept handing him whole pieces when he was hungry, his take ledger
swelled past his fair share, the village started talking (stage 1), then
warning him (stage 2) — for the crime of eating what the engine gave him. He
died in the fighting that followed. Nobody starved less because of the guard;
the pantry just emptied differently.

## Wall numbers

- Control: national 6/8, table 0/8, wins 0/8, wave 4 reach 1/8, wave 5 reach 0/8, median survival 180d.
- Armed: national 6/8, table 0/8, wins 0/8, wave 4 reach 4/8, wave 5 reach 0/8, median survival 164d.
- No table reach, no wins on either side. The scale wall stands: national is reachable (6/8 both sides), the table is not on these seeds/policies.

## Infra notes

- `node scripts/check.js --quick`: 96 passed, 1 failed — the failure is
  `scripts/test-sprites-valid-20261014.js` (dustboar/sunback/sweeps_week/
  cliffhanger calm/aggro sprite mismatches). Pre-existing on this tree's HEAD
  (game.js was reverted byte-identical to HEAD before the check; the test
  validates sprite assets untouched by this arm). Out of this arm's scope;
  not quarantined here — the sprite-owning workers decide.
- A mid-pilot background exec session vanished without completion delivery
  (~12:20 UTC, 3 sibling sim processes active, 6GB/7GB RAM used) — almost
  certainly an OOM kill. The pilot was re-run in 2-4-run chunks with no
  further loss. Lesson: chunk long sweeps when siblings are simming.
