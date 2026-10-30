# sim-tributecost-a — tribute cost, quantified at last (DIAG-NO-GO on one leg)

Run: flesh-out loop, run fleshout-20261030T1427Z, arm sim-tributecost-a.
Axis: scale-onramp (converging, NOT converged). Finding under test:
#1540 (run fleshout-20261030T1315Z, arm sim-leantrade-a,
evidence/2026-10-30/sim-leantrade-a.md, DIAG-GO): the leanlink-vs-
competent paired decomposition (seeds 9911–9918, 180d) showed national
reach is NOT shown to be bought with village survival — but tribute
kcal actually paid was NOT quantifiable from that corpus, and
leanlink 9912 (fewer deaths than its surviving competent twin, still
lost) stayed unexplained. This arm is the recorder that closes both
gaps: per-day pantry series, tribute-payment events, timestamped
death log, population series, link snapshots — plus the
pre-registered tribute-zeroing feasibility proof.

DIAG ONLY. Zero src/js changes, zero default flips, zero
policy-default changes. Recorder + policy-side instrumentation only.
The leanlink and competent policies run byte-identical to the vests-b
corpora. No [needs-eyes]: no feel, combat, or UI change.

## Closeout note (read first — this run did not end normally)

The Loop A coordinator timed out after 7200s with this arm's worker
gone and no final report. Closeout was done by the main session's
recovery coordinator: worker death re-verified (no sweep or heartbeat
process alive; registry heartbeats stale at 15:51Z, a reconstruction
stamp from the morning's REGISTRY.json truncation, not proof of life).
On disk: the competent column was complete (8/8 seed files), the
leanlink column had seed files for 9911–9913 only, and the leanlink
run's stdout dump file
(evidence/2026-10-30/sim-tributecost-a-corpus-leanlink/leanlink-rest.log)
ended FATAL: per-seed writes for 9914–9918 failed under the
container's intermittent EPERM write flap, with the five full rows
dumped to stdout for reconstruction — exactly the recovery path the
sweep's own write-retry design names ("the coordinator rebuilds the
file from the dump with a fresh process").

The recovery coordinator reconstructed all five files from that dump
with a fresh process and verified each one before judging: same 33
top-level keys as the intact seed-9911 file, death-log/tele/aggregate
counts exactly equal on all five, all pantry/population values finite
and non-negative, series lengths matching days (see the bar-2 note
below). Strongest independent check: all five reconstructed rows
reproduce the committed vests-b corpus summary fields EXACTLY
(days, endReason, wave, rank, national, table, deaths) — the same
16/16 reproduction the intact rows show. The reconstructed files
are committed here as seed-9914.json through seed-9918.json in the
leanlink corpus dir, alongside the dump log itself so the provenance
is auditable. Nothing was re-simulated: the closeout brief forbids
new sims beyond the refusalsay seed-8 re-run, and reconstruction
from the sweep's own dump is file recovery, not a new sim.

The balance-panel artifacts named in the prereg were NOT produced:
the panel driver runs its own sims, which the closeout brief
forbids. The expected panel compare ("invalid" by structure — the
comparator expects before/after panels under identical policies,
while this pair differs by design) is therefore not fabricated, and
the 16/16 vests-b reproduction below is the substantive
non-perturbation proof. Panels are a named open item, not a gap
papered over.

## Prereg legs (binding — judged only against the prereg)

| Leg | Bar | Result |
|---|---|---|
| 1. All seeds complete, both columns | 8/8 seeds per column (village-lost counts — death-aware horizon) | PASS — competent 8/8, leanlink 8/8 (4 village-lost, all with end states recorded) |
| 2. Recorder completeness, all 16 runs | Pantry series one snapshot per loop-day (count == result.days, finite, non-negative); tele == harness death count and aggregate == log count every run; population series daily with joiner/leaver events; link snapshots every active day | **NO-GO (strict reading)** — tele == log == aggregate on 16/16; series present and finite on 16/16; BUT pantry/pop/link series length is days−1, not days, on three village-lost leanlink runs: 9911 (165/166), 9913 (128/129), 9918 (158/159). Mechanism and metric-review note below. |
| 3. Non-perturbation | Recorder rows match vests-b corpus on endReason, national, table for 16/16, and on game days exactly for >= 14/16 | PASS — 16/16 exact on endReason, national, table, days, wave, rank, AND deaths (the analyzer checks all of them; days match on all 16, exceeding the >= 14/16 bar) |
| 4. Tribute quantification delivered | Per-column totals (paid / income / courting outflow / end arrears) + per-seed tables for the 5 lost seeds (competent 9913; leanlink 9911, 9912, 9913, 9918) | PASS — totals and per-seed tables below; all 5 lost seeds tabulated |
| 5. Zero-feasibility verdict, proof green | Genuine policy path to 0 (with isolating sweep designed) OR stopped-leg finding | PASS — stopped-leg finding, proof green 16/16 (see below) |
| 6. 9912 paradox addressed | Population series + death log for leanlink 9912 vs competent 9912 must show WHY the leanlink village fell with fewer deaths, or state explicitly that the series still does not explain it | PASS — explained (see below) |

**Verdict: DIAG-NO-GO, on bar 2 alone.** A miss is NO-GO under
MEASUREMENT §14, and it is not re-scored here: the strict
count==days reading fails on three runs, so no GO is claimed even
though bars 1, 3, 4, 5, and 6 pass and every finding below stands
on verified data. The arm is HELD (branch preserved, not merged)
pending the bar-2 follow-up named under "Ranked next."

### Bar-2 mechanism (why three runs are short by exactly one)

The recorder's daily snapshot lands in the post-daily hook — after a
completed policy.daily. On a village-lost run, the loss day's
post-daily never runs: the village is lost before or inside that
day's daily, so that day contributes no snapshot. The three short
runs show exactly this signature (last snapshot scholarDay ==
days−1: 9911 last 165 of 166; 9913 last 128 of 129; 9918 last 158
of 159). The competent village-lost run (9913, 86/86) lost after
its post-daily, so it is exact — loss timing within the day, not
recorder loss of completed days, decides the count. The sweep
already takes an end-of-run link snapshot for exactly this
mid-day-loss case ("a village lost mid-day still gets its final
state") but takes no equivalent end-of-run pantry/population
snapshot — that asymmetry is the fixable gap, and it is filed
under metric review rather than silently folded into a GO.

## Tribute quantification (the finding this arm exists for)

Code-derived expectation, stated in the prereg before measurement:
Haven-paid tribute in the leanlink column should be ~0 by
construction (no competent-derived policy calls payTribute), and
the cost side of flipped (Haven-subordinate) links should appear
as arrears + trust decay + link snaps, while LEAD links appear as
pantry income. MEASUREMENT CONFIRMS THE EXPECTATION ON ALL COUNTS.

### Column totals (8 seeds each)

| | Competent | Leanlink |
|---|---|---|
| Haven-paid tribute (payTribute events) | 0 kcal / 0 calls | 0 kcal / 0 calls |
| Tribute income (subordinate→Haven arrivals) | 0 kcal / 0 calls | 175,218 kcal / 74 calls |
| Counter sweeteners | 0 / 0 | 0 kcal / 0 calls |
| Accord gifts (actuals by pantry removal) | 0 / 0 | 46,417 kcal / 23 calls |
| Proposals logged | 0 | 30 |

Competent is all-zero because competent never courts: 0 proposals,
0 links, 0 tribute in either direction. Leanlink pays nothing and
receives much: its courtship costs are accord gifts (~2,000 kcal
each, 23 of them) and nothing else — sweeteners never fired on any
of these 8 seeds (the prereg's "sweeten if pantry > 25,000" path
produced 0 calls; whether the trigger or the pantry condition is
responsible is a backlog item, not a claim made here).

### Per-seed leanlink table (paid is 0 on every seed)

| Seed | End | Arrivals | Accord gifts | Proposals | End arrears, Haven pays | End arrears, Haven receives |
|---|---|---|---|---|---|---|
| 9911 | village-lost d166 | 1,663 / 2 | 6,000 / 3 | 9 | 2 broken links × 5,000 | 2 active links × 4,000 |
| 9912 | village-lost d139 | 19,691 / 7 | 6,150 / 3 | 3 | — | 0 (3 active links, arrears 0) |
| 9913 | village-lost d129 | 33,803 / 13 | 6,087 / 3 | 3 | — | 0 (3 active links, arrears 0) |
| 9914 | survived 180d | 6,563 / 2 | 6,000 / 3 | 3 | — | 0 |
| 9915 | survived 180d | 4,000 / 1 | 6,030 / 3 | 3 | — | 0 |
| 9916 | survived 180d | 22,788 / 18 | 6,150 / 3 | 3 | — | 0 |
| 9917 | survived 180d | 33,500 / 8 | 4,000 / 2 | 3 | — | 0 |
| 9918 | village-lost d159 | 53,210 / 23 | 6,000 / 3 | 3 | — | 0 |

The flipped-link cost appears exactly where the prereg said it
would: seed 9911 ends with two broken Haven-subordinate links
carrying 5,000 arrears each (trust 12) — unpaid tribute settling
as arrears and breakage, never as pantry outflow. No other seed
ends with Haven-pays arrears. The LEAD direction is income, not
cost: leanlink's villages take in 4,000–53,210 kcal per seed from
their subordinates while paying 0.

Plain reading: **leanlink already pays ~nothing, so tribute
outflow cannot be what kills leanlink villages.** The recorder's
Haven-paid ≈ 0 measurement IS the isolation the prereg
anticipated: there is no tribute bill to zero out, and the
tribute-isolating leg stops here by design (see below).

## Zero-feasibility verdict (bar 5 — stopped leg, by the prereg)

Proof test scripts/test-tributecost-zero.js, re-run green by the
recovery coordinator: 16/16.

- Leg Z1: `_formLink` with `tributeKcalPerWeek: 0` yields a link
  whose tribute is 4000, not 0 (the `|| 4000` formation floor).
- Leg Z2: a staged counter from a 0-tribute proposal carries
  5000, not 0 (the fixed counter terms), and accepting it forms a
  5,000-tribute Haven-subordinate link.

Both legs show the engine floors tribute, so per the prereg the
isolating sweep STOPS here: no game-code change, no default flip,
no negative-tribute hack, no engine-method rewrite from policy
code. The finding is DIAG scope: tribute cannot be zeroed from
policy code, so the cost of paying cannot be isolated that way —
and it does not need to be, because the recorder shows leanlink
pays ~nothing already. Named follow-ups, NOT run here: a
walk-away-from-counters variant (never accept subordinate terms)
and a pay-in-full variant (call payTribute weekly on
Haven-subordinate links).

## The 9912 paradox, addressed (bar 6)

Leanlink 9912 fell on day 139 with FEWER total deaths (39) than
its surviving competent twin (44). The new series explain why —
it is not a paradox once the timing is visible:

- Population trajectory, leanlink 9912: 11 → 11 → 11 → 7 → 3
  (days 30/60/90/120/last). Competent 9912: 11 → 11 → 11 → 8 → 8.
- Last-14-days deaths, leanlink: day 126 monster, day 130
  monster, day 131 TWO monster kills (pop 5 → 2 in one day),
  day 138 thirst. Competent's last-14-days deaths: two player
  "the wild" deaths and three monster kills, spread across days
  170–178, with pop never below 8.
- Pantry tail, leanlink: 1,868 kcal at day 125 → 0 at day 139.
  Competent: 21,357 → 11,247 across its tail, minimum 9,163 —
  never in danger.
- Joiners/leavers, leanlink 9912: 6 joiners, 15 leavers, 0
  unexplained (every leaver appears in the death log).

The story reads coherently: leanlink 9912 climbed to global rank
(court: 3 LEAD proposals, 3 accords, national 1, global 1) and
then died of a late clustered collapse — two monster kills on one
day cut the village from 5 to 2, the last villagers starved and
thirsted with the pantry at zero — while its subordinate villages
sat on 43,000–45,000 pantry kcal each at the end (endLinks). The
polity was rich and Haven was poor: tribute income on this seed
(19,691 kcal) arrived over the run but did not prevent the final
collapse, because the collapse was a population cliff, not a
tribute bill. Competent's twin survived because its deaths were
spread out and its pantry stayed healthy, not because it avoided
a cost leanlink paid — leanlink paid 0.

## Wall numbers (every band, from the recorder rows)

- Competent (8): won 0, national 0, table 0, entered 0,
  village-lost 1, median 180d, max wave 4 (wave1 8, wave2 8,
  wave3 8, wave4 6, wave5 0). Monster-combat share of deaths
  81.1%.
- Leanlink (8): won 0, national 5, table 4, entered 0,
  village-lost 4, global 2, median 180d, max wave 4 (wave1 8,
  wave2 8, wave3 8, wave4 6, wave5 0). Monster-combat share
  75.1%.
- The 5 lost seeds: competent 9913 (d86); leanlink 9911 (d166),
  9912 (d139), 9913 (d129), 9918 (d159). All are tabulated above
  with their tribute figures; no lost seed is missing from the
  quantification.

## Sense: the leanlink 9912 final decline, read end to end

Quoted from the new series, not just the totals: pop 6 on day
125, 5 on day 126 (monster kill), 5 through day 130 (monster
kill), 2 on day 131 (two monster kills the same day), 2 through
day 137, 3 on days 138–139 (a joiner arrives as the village dies),
pantry 1,868 → 0, last death thirst on day 138. While this
happened, Haven's three LEAD links stood active (trust 77/43/45,
tribute 2,250/week each, arrears 0) over subordinates holding
~44,000 kcal each. The fall reads as a coherent story — a small
village, already thin, takes a bad day of monster kills and then
cannot feed its last members — and as an indictment of the
tribute-as-safety-net idea: the polity's wealth never reached the
table where it was needed, because the mechanism moves grain on
week boundaries to a pantry that was already emptying faster than
it filled. (Whether tribute SHOULD rescue a collapsing Haven is a
design question, not a measurement finding.)

## Telemetry deviation check

Telemetry check against the scale-wall baseline on both columns'
per-seed rows: LOUD lines on competent (national/table/wins →
0) and leanlink (table −75%, wins → 0). Verdict: REGIME
artifacts, explained, baseline NOT rolled. The baseline is the
WINSEAT regime (~100%-win suite with win-pursuit policies); these
bands run competent/leanlink courtship policies with no
win-pursuit env, and the baseline file itself warns against
comparing pre-seat/courtship substrates to it. The recorder rows
reproduce vests-b exactly, so no telemetry movement here is
attributable to this arm (which changed no game code).

## Metric review (for the NEXT run, not this verdict)

- Bar-2 wording (binding lesson): "count == result.days" fails
  by exactly 1 on village-lost runs whose loss day yields no
  post-daily snapshot. The next prereg should word the bar as
  one snapshot per completed post-daily (days, or days−1 on
  village-lost runs), AND the recorder should take an end-of-run
  pantry/population snapshot alongside the existing end-of-run
  link snapshot, so the loss day's final state is captured rather
  than absent. Either change alone closes the gap; both together
  make the bar unambiguous. Until one lands, bar 2 stays NO-GO
  on a strict reading — this file does not soften it.
- Pantry series measures LEVELS, not flows: tribute income is
  identified from link snapshots + link-history notes + pantry
  movement around week boundaries, not by tracing individual
  pantry kcal (tribute grain arrives as ≤500-kcal pieces among
  other food; per-kcal attribution would be invented). Arrival
  totals are link-history-grounded counts; any week where the
  history cap (40 entries/link) may have dropped a note is
  flagged by the analyzer's design, and none was flagged here.
- Death-log cross-check guards recorder loss, not harness truth:
  a death the engine never telegraphed as a `death` tele event
  is invisible to both the tele capture and the harness capture.
  The backstop is population-series leavers with no death-log
  entry: leanlink 9912 has 0 unexplained leavers, so no hidden
  death class is visible on the paradox seed.
- Panel compare: expected invalid by structure (see closeout
  note). That invalidity is a property of the comparator, not of
  the data, and is recorded here rather than repaired by
  relabeling policies. The two valid single panels remain an
  open item (they require panel-driver sims, forbidden in this
  closeout).

## CORRECTION — confirm bands resumed by the original worker (closeout, 17:05Z)

After this evidence was written, the recovery coordinator found the
original tributecost worker ALIVE and running confirm bands: leanlink
9921–9930, started 16:50Z, 5/10 seeds complete at 17:03Z (process
verified live by ps); competent confirm has 1/10 seeds on disk
(9921, logged 16:54Z) with no live process and no OUT file — its
state is unclear and is follow-up work, not assumed finished or
failed. This closeout's pilot verdict (DIAG-NO-GO on bar 2, strict
reading) STANDS as written: the worker's decision to run confirm
implies a different bar-2 reading (most plausibly the analyzer's
completeness output, which reports the −1 as diagnostic rather
than failure), and that dispute is flagged for follow-up
adjudication, not resolved by overwriting this verdict. Notably,
the confirm band itself reproduces the −1 pattern (leanlink 9924:
157/158; 9925: 124/125), which supports the loss-day mechanism
documented above. Follow-up closeout owed: confirm evidence +
bar-2 verdict adjudication + panel artifacts + competent-confirm
disposition. No merge until adjudicated. The branch is HELD.

## Ranked next

1. Recorder end-of-run pantry/population snapshot + bar-2
   rewording (above); then re-judge bar 2. The quantification,
   paradox decomposition, and zero-feasibility findings in this
   file do not need re-measurement — only the bar-2 leg does.
2. Balance-panel single panels for this pair (panel-driver sims;
   compare expected invalid by structure, documented not forced).
3. Walk-away-from-counters and pay-in-full policy variants
   (prereg-named follow-ups; neither is "tribute zeroed").
4. Sweetener trigger: leanlink sweetened 0 times on 8 seeds —
   check whether the pantry > 25,000 condition or the counter
   path never fired, before assuming sweeteners are a real cost
   channel anywhere.
5. No game change is proposed by this arm.

## Outputs

- scripts/sweep-tributecost-a.js (recorder driver, incl. the
  disclosed atomic tmp+rename write-retry with defer + stdout-dump
  recovery path), scripts/test-tributecost-a.js (18/18),
  scripts/test-tributecost-zero.js (16/16),
  scripts/analyze-tributecost-a.js
- evidence/2026-10-30/sim-tributecost-a-corpus-competent/ (8 seed
  files), evidence/2026-10-30/sim-tributecost-a-corpus-leanlink/
  (8 seed files — 9914–9918 reconstructed from the sweep's stdout
  dump by the recovery coordinator, verified as described — plus
  leanlink-rest.log and leanlink-9911.log),
  evidence/2026-10-30/sim-tributecost-a-analysis.json
- evidence/2026-10-30/sim-tributecost-a-prereg.md (binding)
