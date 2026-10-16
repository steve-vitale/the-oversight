# sim-rearmlat-b — successor trust-ledger re-arm latency census (loop B diagnostic, 2026-10-16)

Instrument-only diagnostic for sim-findings #385/#386: **(a)** every
successor re-arms the cumulative −5000 within 2–6 days of taking the mantle
while their dated-voluntary ledger never arms; **(b)** the cold-shoulder
journal beat (justice.js:137 — 'The village has gone quiet around me. I know
why.') fires on runs where the dated-voluntary ledger was clean. Zero src/js
changes, zero policy behavior changes — a read-only harness-side instrument
(scripts/rearmlat-20261016.js) measuring the re-arm phenomenon on fresh
seeds and sense-testing the fiction.

## PRE-REGISTRATION (MEASUREMENT §§9–12, 14 — binding, written BEFORE sweep spend)

- **Question**: the successor re-arm phenomenon (ledgerdiag-b finding):
  each new bearer <redacted> fresh book (ledger.js:841-844 zeroes
  v.takes/v.gives on mantleBecome), then the communal bowls (villageMeal,
  game.js:26632 — writes v.takes with NO takeHist entry, undated) re-arm the
  cumulative −5000 trust/justice bar within days, while the dated-voluntary
  ledger (recordTakeHist/recordGiveHist — voluntary pantry takes only)
  stays silent. Meanwhile the cold-shoulder fiction (justice.js:135-139)
  fires on the meal-inflated bar and the scholar internalizes the charge.
  This run census: how fast is the re-arm on fresh seeds, how many re-arms
  are meal-driven vs voluntary-take-driven, and how often does the
  cold-shoulder's blame agree with the dated-voluntary ledger?
- **Instrument**: scripts/rearmlat-20261016.js (REARMLAT=1 env gate, default
  off; det-gate byte-identical when off AND on). Hooks
  recordTakeHist/recordGiveHist (call-through) build the exact full
  dated-voluntary event log per vid; the playerDeath hook mirrors the
  succession book-reset and records each successor's mantleDay; say +
  journalNote hooks capture the cold-shoulder fiction beats for the
  sense-test. Per-dawn snapshots of the cumulative book give the engine
  side. Reuses the pure accounting helpers (tr7Sums, sumEvents,
  classifyBeat) from scripts/ledgerdiag-lib-20261016.js.
- **RE-ARM EVENT**: a successor bearer (any vid != the initial scholar's)
  whose first dawn row with day > mantleDay shows cumNet < −5000
  (strict <, the engine's comparison). Each event is attributed with:
  (1) latency = armDay − mantleDay; (2) dated-voluntary arm status at
  re-arm — volArmDay (first day voluntaryNet < −5000) or null, and the
  driver: **meal-driven** if voluntaryNet(armDay) ≥ −5000 (the voluntary
  side alone would NOT have armed the bar — the undated bowls pushed it
  over), **voluntary-take-driven** if voluntaryNet(armDay) < −5000;
  (3) mealShare = (cumTakes − volTakesCum)/cumTakes at arm day;
  (4) cold-shoulder agreement — the bearer's first stage 0→1 firing while
  in office agrees with the dated ledger iff voluntaryNet7 < 0 (the
  freeloader-clock reading; the cumulative-dated form voluntaryNet < 0 is
  reported alongside, not scored). An event counts ATTRIBUTED when
  (1)–(3) are present and (4) is present or explicitly null (bearer had
  no cold-shoulder firing while in office).
- **PRIMARY (binding)**: ≥ 95% of successor trust-ledger re-arm events
  attributed, each with all four fields. **GO: attribution rate ≥ 0.95.**
- **Reported (not scored)**: the re-arm latency distribution on fresh
  seeds; the share of re-arms that are meal-driven vs
  voluntary-take-driven; the cold-shoulder trigger agreement rate
  (share of stage 0→1 firings with voluntaryNet7 < 0).
- **Horizon**: 180d death-aware (runDays breaks on Game.over/deadTail, +10d
  tail) — matches the ledgerdiag-b horizon so the census is directly
  comparable. **Seeds**: [103,214,325,436,547,658,769,880] ×
  {leadfeast, belongfeast} (fresh seeds — not the ledgerdiag-b set) = 16
  runs, current master tip, NO lever — pure measurement. **Substrate**:
  FEASTSCALE_R13=1, SEATDRIVE=0 explicit (c004b9dd flipped the seat
  default ON; this axis runs the pre-seat substrate — courtship roads
  only).
- **Det-gate**: scripts/test-rearmlat-20261016.js PART B green before sweep
  spend (gate-off AND gate-on byte-identical vs pristine, 30d × {103,214}
  × {leadfeast, belongfeast}, per-dawn ledger hashes — 4/4
  trajectory-identity). **SMOKE=1**: instrument-honesty green before sweep
  spend (leadfeast s103 90d: 0 errors; initial vid excluded; 5 re-arms at
  latencies 3,2,2,2,2 all meal-driven; all attributed; firings carry
  agreement fields; fiction beats captured; uninstall restores all wraps).
- **Sense-test** (Steve's law): the cold-shoulder beat read in transcript
  context on 2–3 runs against the bearer's dated-voluntary ledger — is
  'I know why' honest fiction given the dated ledger?
- **Canon**: docs/CANON.md read; docs/PRESERVATION.md read; docs/BALANCING.md
  read. NO food-distribution canon doc exists — stated per the canon rule;
  all mechanics read from src/js as-is and cited in the lib header. No
  canon invented.

## PROOF (before measurement)

scripts/test-rearmlat-20261016.js — ALL GREEN (run 2026-10-16):
- PART A (fixtures): A1 meal-driven at the boundary (voluntaryNet −4999);
  A2 voluntary-driven below the bar (−5001); A3 exact −5000 is
  meal-driven (strict < never arms); A4 missing core field → not
  attributed; A5 coldAgreement null (no firing in office) → attributed;
  A6 coldAgreement undefined → not attributed; A7 gate-off installs
  nothing (5 refs unchanged, stub track).
- PART B det-gate: 4/4 trajectory-identity pairs — pristine vs gate-ON and
  pristine vs gate-OFF byte-identical, 30d × {103,214} ×
  {leadfeast, belongfeast}, per-dawn ledger hashes.
- SMOKE=1: leadfeast s103 90d — 0 instrument errors; initial vid excluded
  from successors; 5 successor re-arms at latencies 3,2,2,2,2, all
  meal-driven, 5/5 attributed; 4 cold-shoulder firings with agreement
  fields; say + journal beats captured; uninstall restores all 5 wraps.
- Mid-build instrument fix (before sweep spend): the say-beat hook tested
  classifyBeat's return against the wrong string ('coldshoulder' vs the
  lib's 'COLD_SHOULDER_SAY'), silently dropping the 'Something has
  shifted...' say beats. Caught by reading the SMOKE output (0 say beats
  vs 2 journal beats on a run with 2 firings). Fixed, proof re-run ALL
  GREEN, sweep re-run on the fixed instrument.

## RESULTS

Sweep: 16 runs (8 fresh seeds × {leadfeast, belongfeast}), 180d
death-aware, FEASTSCALE_R13=1, SEATDRIVE=0, current master tip, NO lever —
pure measurement. 1202s wall (~20 min; system loaded). Per-seed:
evidence/2026-10-16/perseed-rearmlat/. Summary:
evidence/2026-10-16/perseed-rearmlat/summary.json (driver-written);
pooled recompute: scripts/sweep/analyze-rearmlat-20261016.js. Instrument:
0 errors across all 16 runs. 119 successions produced 99 successor
re-arm events (17 successors died or left office within 2 days of the
mantle — before the bowls could re-arm; 3 with 4–6 days in office never
re-armed — see below).

### The re-arm census (99 events)

| metric | result |
|---|---|
| PRIMARY: attribution rate | **99/99 = 1.000 — GO (bar 0.95)** |
| latency distribution (mantle → cumulative −5000) | min 1d, max 7d, **median 2d**; 1d:3, 2d:59, 3d:32, 4d:4, 7d:1 |
| meal-driven re-arms | **95/99 = 96.0%** |
| voluntary-take-driven re-arms | 4/99 = 4.0% |
| successors whose dated-voluntary ledger NEVER armed | 95/99 (volArmDay null) |

The finding reproduces on fresh seeds and tightens it: the census band is
**1–4 days** (95/99; the ledgerdiag-b 2–6d window holds with one 7d
outlier). 59 of 99 re-arms land exactly 2 days after the mantle — the
village feeds the new Bearer <redacted> two nights, and on the third dawn the
ledger re-indicts them for being fed. The dated-voluntary ledger stays
silent on 95 of the 99 bearers for the entire tenure.

### The 4 voluntary-driven re-arms are genuine hoarding

The attribution rule cleanly separates them — these are not bowl-victims:

| run | bearer | mantle→arm | vol takes | meals | mealShare |
|---|---|---|---|---|---|
| belongfeast-s103 | stan_kowalski | 95→98 (3d) | 6,398 kcal | 0 | 0.000 |
| leadfeast-s325 | sigrun_eiriksdottir | 137→138 (1d) | 5,400 kcal | 0 | 0.000 |
| leadfeast-s436 | marcus_webb | 22→25 (3d) | 5,350 kcal | 1,252 | 0.190 |
| leadfeast-s547 | adaeze_nwosu | 93→96 (3d) | 5,932 kcal | 0 | 0.000 |

Three bearers took 5,400–6,398 voluntary kcal in 1–3 days with NO bowls at
all; the fourth was 81% voluntary. The dated-voluntary ledger DOES detect
real hoarding — on the same day the cumulative bar armed (volArmDay ==
armDay in all four). The engine's bar cannot tell a stan_kowalski from a
bowl-fed successor; the dated ledger can. This is the strongest single
argument in the sweep for the #340 steve-call: switching the bars to the
dated-voluntary ledger loses none of the true positives.

### Cold-shoulder trigger agreement: 41/81 = 50.6%

81 stage 0→1 firings across the 16 runs (every run had at least 3). On the
freeloader-clock reading (voluntaryNet7 < 0 = the dated ledger agrees
there is a drain to blame):

- **41 agreed** — the bearer was genuinely draining voluntarily
  (vn7 −429 to −3,920).
- **40 disagreed (vn7 = 0)** — the fiction blamed a bearer whose
  trailing-7d dated ledger was perfectly clean. Of those, 22 had
  mealShare = 1.0 (literally zero voluntary takes in the entire book)
  and the rest mealShare 0.88–0.96.

Per-run agreement ranges 0.00 (belongfeast-s436: all 7 firings on clean
ledgers, mealShare 0.937–1.0) to 0.80 (leadfeast-s214). The cumulative-
dated form (voluntaryNet < 0) agrees on 58/81 — lifetime voluntary takes
exist on most bearers, but they are weeks stale and dwarfed by the bowls.

## SENSE-TEST (Steve's law — the beat read against the ledger)

The beats are well-written as people: the say line is social weather
("Something has shifted. Conversations stop when you approach the fire.
Nobody meets your eyes for long."), the journal line is the colder knife
("The village has gone quiet around me. I know why."). But the blame
assignment splits the runs in two.

**Dishonest — belongfeast-s436** (0% agreement). Seven firings, seven
different successors, every one with vn7 = 0. Day 66, gen_2jgw8p3:
vn = 0, mealShare = 1.0 — the bearer had taken nothing voluntarily and
given nothing in their entire book; their ledger is the village's bowls,
start to finish. The village went quiet around them for eating the food
it served, and the journal says "I know why." The scholar believes they
know; what they know is the ledger's fiction. Day 124, gen_n4fuizv and
day 152, visjoin_59: the same beat, the same clean book. The fiction is
a copy-paste accusation the village levels at each new face in turn.

**Honest — leadfeast-s214, firings d28–d113** (80% agreement). Here the
bearers really were draining: vn7 −1,128 to −3,920, mealShare down to
0.561. The same two lines read completely differently — the village IS
quiet around someone who took 4,880 voluntary kcal, and "I know why" is
the scholar's honest guilt. Notably, this run's FIRST firing (d14,
gen_ykwpx33, vn7 = 0, mealShare = 0.962) was the meal-driven kind —
the run shows both faces of the beat in sequence: false accusation
first, true ones after.

**Verdict**: 'I know why' is honest fiction exactly when the dated
ledger agrees (vn7 < 0). When vn7 = 0 it is the ledger's fiction wearing
the scholar's voice. The beat does not distinguish the two cases — and
half the time (40/81) it fires on the wrong one. If the bars move to the
dated-voluntary ledger (#340), the fiction needs a new trigger line for
the meal-driven case — or it should only fire when the dated ledger
agrees. Until then, the cold shoulder testifies for the prosecution on
manufactured evidence.

## What the village looked like (assessor's notes)

Sixteen courtship villages on the pre-seat feast substrate, living the
trustcensus opening: four days of bowls, the ledger arms against the
eater, the village goes quiet, half-rations, the bearer dies or is
exiled, and the next face steps into a fresh book the bowls re-arm
within 1–4 days. The meat grinder turns fast: 119 successions in 16
runs; 17 successors died within 2 days of the mantle (before re-arm);
the median tenure of a bearer is measured in weeks, not seasons.

Who thrives: the SUCCESSORS — bearers 2–12 step into fresh books and eat
full rations until the bowls re-arm the bar against them too. Who dies:
everyone, eventually — combat-shaped deaths dominate
(monster:combat 219, monster:villager-combat 151, player:combat 127;
starvation only 2 player / 2 villager — the food economy feeds people,
the ledger starves them by throttle). Knowledge/capabilities missing:
the scholar's give side is still ~zero on most bearers (the
trustdelta absent-generosity finding, unchanged) — so the
dated-voluntary ledger's silence is partly the policies never donating.
The 3 never-rearming successors with 4–6 days in office (belongfeast-s214
visjoin_86, both s880 runs' gen_g2dnlbt) died just short of the bar —
the grinder's near-misses.

Villagers act like people in the transcripts: the cold-shoulder say
beat is social consequence, not a stat change; bearers pick up the
Codex with shaking hands (mantleBecome fiction); named villagers
(tashi_sherpa, nadia_khoury, lena_ruiz) cycle through the office. No
robotic repetition beyond the one deliberate copy-paste accusation —
which is itself the finding.

The blank this run fills: #385/#386, measured — the successor re-arm
latency census (median 2d, 95/99 within 1–4d, 96% meal-driven) and the
cold-shoulder trigger agreement rate (50.6%). The blank it documents:
the fiction's 'I know why' fires on clean ledgers half the time — filed
below.

## Wall numbers (standing directive)

national 14/16; table 15/16; wins 0/16; exiled 0/16; wave4 15/16;
wave5 10/16; median survival 123d; max 180d; maxArc: 15/16 reached
Arc 4.
The scale wall stands: the feast substrate walks courtship roads to
national in 14/16 and the table's door in 15/16 — yet zero wins and zero
exiles. Deaths are combat-shaped (monster:combat 219,
monster:villager-combat 151, player:combat 127); starvation is present
but not the modal killer (player:starvation 2). The table-invited-but-
never-sitting pattern from ledgerdiag-b persists on fresh seeds — the
seat question belongs to the scale-onramp loop, not this axis.

TELEMETRY DEVIATION CHECK: not run by this worker (coordinator step per
the loop body); per-seed evidence glob
evidence/2026-10-16/perseed-rearmlat/ is in place for it.

## Metric review (§14)

PRIMARY GO as pre-registered: **99/99 attributed (1.000 ≥ 0.95) — GO.**
No re-scoring was needed or done. Notes for the NEXT run:
1. The attribution rule's boundary (strict < −5000, the engine's own
   comparison) correctly classified all 4 genuine hoarding binges as
   voluntary-driven with volArmDay == armDay. The rule is design-honest:
   it asks what the dated ledger alone would have done.
2. The 3 never-rearming successors (4–6 days in office, bar not yet
   armed) are censored observations, not counter-evidence — the
   latency histogram's right tail is death-censored. A future census
   should report the Kaplan–Meier-style censoring explicitly.
3. Cold-shoulder agreement was scored on the freeloader-clock form
   (voluntaryNet7 < 0) per the pre-registration; the cumulative-dated
   form agreed on 58/81. The gap between the two forms (stale lifetime
   takes vs recent drain) is itself the argument for the recency
   reading — keep both.
4. Beat capture: the say-beat hook initially tested classifyBeat's
   return against the wrong constant and silently dropped all say
   beats; caught by reading SMOKE output (0 say vs 2 journal beats).
   Fixed before sweep spend. Future instruments should assert beat
   counts in SMOKE (now covered: 'fiction beats captured' checks both
   kinds implicitly via beats.length > 0 — strengthen to per-kind).

## Convergence state

**converged** (diagnostic complete; instrument GO). The #385/#386 census
is measured on fresh seeds: successor trust-ledger re-arms land at
median 2 days (95/99 within 1–4d), 96.0% meal-driven, the dated-
voluntary ledger silent on 95/99 bearers; the cold-shoulder fiction's
blame agrees with the dated-voluntary ledger on 41/81 firings (50.6%).
The steve-call (#340) evidence now includes the true-positive control:
the dated ledger catches all 4 genuine hoarding binges the same day the
cumulative bar armed — switching the bars loses no real detection.

## New open findings (for the backlog — not chased)

- [open] 2026-10-16 — food/trust — THE DATED LEDGER CATCHES REAL
  HOARDERS SAME-DAY (sim-rearmlat-b): the 4 voluntary-driven re-arms
  (stan_kowalski, sigrun_eiriksdottir, marcus_webb, adaeze_nwosu) took
  5,350–6,398 voluntary kcal in 1–3 days with mealShare 0–0.19, and the
  dated-voluntary ledger armed on the same day as the cumulative bar
  (volArmDay == armDay in all four). The engine's bar cannot tell a real
  hoarder from a bowl-fed successor; the dated ledger can. Strongest
  single datum for the #340 steve-call: switching bars loses no true
  positives.
- [open] 2026-10-16 — food/trust — 17 SUCCESSORS DEAD WITHIN 2 DAYS OF
  THE MANTLE (sim-rearmlat-b): of 119 successions, 17 bearers died or
  left office within 2 days of taking the mantle — before the bowls
  could re-arm the bar. The meat grinder's fastest turn; worth checking
  whether these are combat deaths the ledger never gets to punish.
- [open] 2026-10-16 — food/trust — THE FICTION'S TWO FACES IN ONE RUN
  (sim-rearmlat-b): leadfeast-s214's first cold-shoulder firing (d14,
  vn7=0, mealShare 0.962) was meal-driven while the next four (d28–d113,
  vn7 −429 to −3,920) were honest. The same beat is true and false in
  the same run — a single trigger line cannot serve both cases.
