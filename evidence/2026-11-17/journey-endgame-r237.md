# Journey endgame r237 — run note (Lane B leg 4, 2026-11-17)

Leg 4 (endgame). Rotation-b read 4 at run start. Substrate master
7413db0f7 exactly. Probe scripts/probe-endgame-r237-20261117.js (r233
probe verbatim except renames, PLAN-map 89770–89777, + read-only
deathCleanups sample). Analyzer scripts/analyze-endgame-r237-20261117.js.

**Run history (adoption):** the 14:00 Lane B occurrence timed out
mid-run. Pass A completed and verified; Pass C launched WITHOUT EVIDDIR
and overwrote Pass A's corpora (see Incident below); Pass C-wide never
started. Adopted by the main session: the orphan hbloop (pid 19179) was
killed by exact PID, the tree heartbeated, and the remaining work
(Pass C analysis, C-wide probe + analysis, transcript watches,
telemetry, gate) was finished in the tree by the adoption worker.
No fix arm this run — evidence only.

## Incident — Pass C overwrote Pass A (EVIDDIR default footgun)

Pass C was launched without EVIDDIR. The probe defaults EVIDDIR to
`evidence/2026-11-17/perseed-endgame-r237` — the Pass A outdir — so
Pass C wrote its 6 per-seed JSONs + transcripts over Pass A's.
Pass C itself completed all 6 seeds (log complete, 6/6 valid JSON
lines; on-disk corpora verified intact: all parse, capstone+buyout
enabled, buyout attempts present, transcripts non-empty).

Pass A's per-seed files are unrecoverable: the pass-a log lines are
summary projections (127 flat keys vs ~977 nested keys in the full
record; 0 differing shared keys, so the projections are consistent
with the records but lossy). Pass A verdicts below rest on the
analyze-a log, which was run BEFORE the overwrite and preserves the
full binding verdicts, plus the pass-a log projections. Pass A
transcript watches (F5 / C3d / people check on Pass A) are
UNMEASURABLE — carried on Pass C + C-wide transcripts instead.

Process fix for the next endgame run: set EVIDDIR explicitly on EVERY
pass invocation. The probe's default outdir is a footgun of the same
class as the r131 SEEDS lesson.

## Pass A-live (CAPSTONE unset, BUYOUT unset) — PRIMARY GO | ALL GO

Matched re-run vs r233 pass A (seeds 89701–89706). Verdicts from the
pre-overwrite analyze-a log (journey-endgame-r237-analyze-a.log).
PRIMARY-BINDINGS GO | PRIMARY GO | ALL GO. CORPUS-PURITY GO 6/6.

- lesser 6/6, full 0/6, won 6/6. M23b 1/6 (89702@d85) vs r233 0/6.
- 89701: uw 5, FACED wave 5 ×2 (editor d81, timeslot d90), release
  snap d79 ready (2 living veterans), standing peak 430. Matches r233.
- 89702: uw 5 (r233: 4), FACED wave 5 ×4 (editor d80, spoiler d85,
  cancellation d86, rerun d87), standing peak 387 (r233: 199),
  deedGate ok d85 (r233: never). **The one headline difference vs
  r233.** Per the prereg it is attributed first to delta (a)
  plan-death-on-removal (the launch vehicle changed), with (b)
  dialogue/RNG-draw shifting as the alternative; the panel cannot
  separate them (same seeds, trajectories not bit-identical by design).
- 89703: uw 4, w5max 0. 89704: uw 5 but NEVER-ARRIVED (faced 0),
  vetFights 0. 89705: survives (sat d99), uw 4, peakVet 0.
  89706: sat d100, uw 4.
- Starvation: Daniel Zhu d12 (89702), Nikos d24 (89704).
- M4-wave5-or-full 2/5 (89701 + 89702 OPEN uw=5). M11 peaks
  430/387/199/199/199. M20 mech199 true on all 6 seeds.
- 159-turn Algorithm fight (r194): NO recurrence (longest multi-turn
  fight 37 turns). fastW4 diedInFight gap (r171): no fastW4
  scholar-death with empty diedInFight observed (one day-window-only
  causal, 89703 d77 algorithm vDie, scholarDied=false).

## Pass C-live (CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1) — PRIMARY GO | ALL GO

Matched to r233 pass C (seeds 89701–89706). Analyzer run by the
adoption (journey-endgame-r237-analyze-c.log).
PRIMARY-BINDINGS GO | PRIMARY GO | ALL GO. CORPUS-PURITY GO 6/6.

- lesser 5/6, **full 1/6 — 89703 TOOK THE FULL SEAT d90**
  (feast_embassy delivered d89, deedGate ok d89, pricedFull d90).
  The buy-out road converts on the SAME seed as r233 (89703) — third
  round running (r230: 89704; r233 + r237: 89703).
- M23b 1/6 (89703@d89/DELIVERED). M25c 6/6 bought early.
- Wave 5: 89702 FACED 1 (spoiler d80), 89703 FACED 2 (cancellation
  d75, rerun d88), 89705 uw 5 NEVER-ARRIVED. 89701 uw 4.
- Starvation (Q10): 89702 Daniel Zhu d12 + Ruth d81 — Ruth died
  AFTER the d18 buyout with pantry 43,263 kcal (R66-pattern watch:
  starving with a full pantry); 89704 Nikos d24.
- CompanionGuard skips 14 total; medicDutyBlocked 195 total (r233:
  9 / 219). deathCleanups 12 total (89702: 3, 89705: 6, 89706: 3);
  removalCleanups 0. No stranded launch observed.
- M22-feast-hold: 89705 UNEXPLAINED=1 (unexplainedDays=40) — one
  feast-hold day with no recorded reason; filed as a watch item.
- 89704 buyout refused d35/d36 (pantry short of 8,000) then BOUGHT
  d38 — the bundle was reachable, not priced out.

## Pass C-wide (STRETCH, fresh 89770–89777) — WIDE-VERDICT GO

Run by the adoption with EVIDDIR set correctly.
M25c 7/7 bought, CORPUS-PURITY 8/8.
WIDE-VERDICT GO (M25c + starvation tally).

- lesser 7/8, full 0/8, **lost 1/8 (89774, village-lost d67)**.
- **Wave 5 FACED 1/8: 89770 (uw 5, w5max 2, faced 2)** — the FIRST
  fresh-band wave-5 facing in C-wide (r233: 0/8). No full seat on
  fresh seeds. Q4 answered: yes, one seed faced wave 5; the full
  seat still never comes on a fresh band.
- 89774 survival collapse (prereg interesting finding — a village
  dying before d90): starvation (Alejandra d31, Logan d32, Aroha d65,
  Sanne d67) + sickness (Colin d26) + thirst (Xavier d43). 32 buyout
  attempts, ALL refused — away from Haven, or pantry short of 8,000
  (closest 8,935 away, 7,545 at Haven); pantry hit 0 repeatedly.
  The village scattered d67: "Haven couldn't hold. On the third
  hungry day, people started walking — in different directions. The
  scattering, again." A food-collapse death, not a wiring failure.
- 89777: 8 starvation deaths (d62–80) DESPITE buying d35 — the Joja
  price in lives (Q10). 89773: 2 starvation deaths (Nikos
  Papadopoulos d76, Gianella d96). 89775: Arturo d72, sat d133
  (latest sitting on the panel).
- Funeral-mend (Q11): fired + voiced on C-wide — Naran's feast
  (1,500 kcal, links mended), Aroha's feast (pantry empty, links
  honestly unmended), Yamato's + Carlos's feasts (6,000 kcal,
  mended). The partial-payment case works as designed.

## People check — PASS (Pass C + C-wide transcripts read in full)

89701–89705, 89770 (head), 89774 (tail) read in full. Named
villagers acting like people: Donna joining the party, Sofia showing
the scholar her thinking place, Rosa boiling water for the sick,
Rosa Mendez outshining the scholar on the dark merge, Paisley Powell
walking out of the light alone. The 89703 full-seat finale is
coherent (audit naming Hassan/Yuki kills, the Herald falling to the
coalition, Salvador Lugo's ascension). The 89774 collapse reads as a
real collapse, not a bug. No dry line, no SYSTEM:"" line, no
senseless passage found. (Pass A transcripts lost — see Incident.)

## Watches

- F5 settled-favor (Q5): 0 exact-variant servings on ALL passes
  (vacuous again on the endgame leg, as in r233). The branch is
  reachable in panel play (succession r230 fired 2×) but the
  endgame panel's sittings never reach it. Stays a watch, not a
  binding.
- "It's handled" repeat (NEW watch, not F5): the sick-tending line
  "Rosa is already boiling water. It's handled." serves 7× verbatim
  on 89775 (Xavier, Nadia, Ena ×3, Rosa ×2 — different patients,
  different days, one template). Filed for the dialogue pass.
- C3d recap-live-want (Q6): 0 "recap" mentions on any transcript —
  vacuous again (no recap sittings on the endgame panel).
- DRY census: 0 dry hits on every pass.
- Q7 companionGuard: skips 14, medicDutyBlocked 195 (Pass C).
  Pass A unmeasurable (lost with the corpora).
- Q8 deathCleanups: 12 on Pass C, 0 removal cleanups, no stranded
  launch observed. Pass A unmeasurable.
- Q9 89705: survives on both passes (Pass A sat d99; Pass C sat
  d90). The r230 d59 loss stays in the past.

## Metric review

- M23b tally: Pass A 1/6, Pass C 1/6, C-wide 0/8 (deedGateFirstOk
  never on fresh seeds).
- F5 + C3d stay vacuous on the endgame leg for a second straight
  round — the watches need a panel whose sittings reach them, not a
  metric change.
- The 89775 sick-line repeat is a new verbatim-repeat watch item
  (dialogue pass), not a binding.
- Telemetry baseline: r188 stands (see below).

## Gate + telemetry

- Telemetry: QUIET. Pass-A 5-seed sums (uw 23 vs 22, won 5 vs 4,
  peakVet 8 vs 8) against the r188 baseline — 5 seed rows, 3
  metrics, no large deviations. Rows were reconstructed from the
  pass-a log projections (the probe's own stdout) because the Pass A
  files were overwritten; values are the probe's own numbers.
  Baseline NOT rolled.
- Gate (`check.js --quick`): **332 passed, 8 failed in 1080s, 0
  attributable.** The 8: measurement-proof staleness pair (2) +
  phone-frame stale receipt (1) + ladder-bundle control (1) — all
  standing — plus 4 exact-120s timeouts (living-garden,
  one-person-army, trust-observer-neutrality, capable-bot), all
  load artifacts on the standing list. Cache-flags passed this run.
  The run touches no src/ (evidence + logs only), so nothing here
  can be a regression from r237.

## Closeout

- Evidence-only run (no game code changed). Rotation-b write (4→5,
  social life) is owed at landing, after the adopting session
  verifies the merge — NOT written by this worker.
- Files: prereg, probe/analyzer clones, smoke + pass-A + pass-C +
  pass-C-wide logs, analyze-A (pre-overwrite) + analyze-C +
  analyze-C-wide logs, perseed corpora (Pass C in
  perseed-endgame-r237/, C-wide in perseed-endgame-r237-cwide/,
  smoke in perseed-endgame-r237-smoke/), gate log, this note.
  Pass A per-seed files are lost (see Incident); the analyze-a log
  and pass-a log projections are the preserved record.
