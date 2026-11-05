# journey-scale r100 — Lane A, leg 3 SCALE (2026-11-05 midday)

**Run id:** laneA-scale-2026-11-05T1145CST (scheduled 11:45 CST 2026-11-05).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success.
**Base:** master@1a898136c at branch creation.
**Pre-register:** evidence/2026-11-05/journey-scale-r100-prereg.md
(committed as 54a6580ac + correction 44a7d121b before any scored seed ran).
**Change set at closeout:** ZERO src/js. Policy arm clone
(scalecourt-nogate-morntrace3-fill.js: topUpBeforeWalk + packTop name
fallback) + driver/analyzer clones + evidence + run note. Gating freeze
honored; perception law honored (the arm presses only offered player
verbs — fillWater / donateToPantry — like a player would).
**Fix-gate verdict: no src/ change.** The arm is policy-side, and it
FAILED its pre-registered demonstration (see Q1) — the standing
competent policy does NOT change in this run. The flaw the trace
found (over-broad gate) is proposed as a narrowed arm for r101, not
landed here.

## Infrastructure notes (loud, first)
- **EPERM flap: CLEAR at run start.** O_EXCL probe OK (17:52 UTC); no
  flap artifact all run.
- **Slow git, cold cache:** the VM rebooted ~17:34 UTC and every loop
  restarted at once (load 20.6). Pre-flight `git status --short` in
  the main tree took 12.8 min (three concurrent sibling git-status
  processes all crawling on the same 10.4MB index restat); it came
  back EMPTY, disk 31%, pull already up to date. Worktree
  registration took ~3 min. Nothing here is a failure — but a
  13-minute pre-flight is the cost of the post-reboot pile-up.
- **Safe-commit index clobber struck on ALL THREE commits** (prereg,
  prereg correction, tooling) — same class as r90/r94–r99: after each
  correct private-index commit, the worktree's main index lied
  (files staged-as-deleted + untracked). Repaired via HEAD-blob
  cacheinfo each time, verified: `git status` clean, `git diff HEAD`
  empty, `git show --stat` correct. The commits themselves were
  correct.
- **Heartbeat loop verified by registry read-back** (18:02, 18:08,
  18:12 … alive for the whole run).
- **BASE MOVE RESHUFFLED THE BAND (the run's biggest fact).** r99 ran
  on master@3f14110d1; this run on 1a898136c (batch ship: journey-
  endgame r140 + sim-awayration2-b, whose own message says "pack
  design change shifted runDays stream"). The matched band is no
  longer the r99 band in trajectory terms: 85501 d38→d106, 85502
  d29→d61, 85503 d96→d33, 85504 d105→d74. The control quad (r99
  policy, no arm, THIS base — evidence/2026-11-05/
  journey-scale-r100-control/) proves the reshuffle is base-caused:
  85502/85503/85504 end identically with and without the arm, and
  85503's control dies d33 exactly like the arm run. The prereg's
  "r99: 2 dry / 10 walk-outs" baseline does not exist on this base
  (see Q1). No re-scoring was done: the gate is judged as written,
  and the control is reported alongside it.
- Lock discipline held throughout; lock deleted at closeout.

## Q1 — FILL ARM ELIMINATES DRY WALK-OUTS (binding)
**FINDING clause: FAIL as a demonstration — the arm did not produce
the pre-registered evidence.** The clause had two parts, and the
second fails while the first is vacuous:
- Dry walk-outs: **0 across the quad (8 walk-outs: 2+0+3+3)** —
  the 0-dry half is met. BUT the same-base control ALSO has **0 dry
  walk-outs (0/10)**. The dry walk-outs r99 measured do not occur
  on this base at all, so "0 dry" carries no evidence for the arm.
- The arm firing: **fillTopUps=2 total litres across the quad**
  (85501: 1L on d85; 85503: 1L on d27; 85502: 0; 85504: 0). The
  clause required fillTopUps ≥ 1 AND fillTopUpLiters ≥ 2 on each of
  85503 and 85504 (the seeds that walked out dry in r99). Observed:
  85503 got 1L (not ≥2), 85504 got 0L. **Second half fails.**
- The control's one near-miss sharpens the picture: 85501 d119
  RETRY walks out with packW **1** (pack-full, room 0, cistern 23
  clean, 3 pack-full refusals) — a partial walk-out the arm never
  got to test, because the arm run on 85501 died at d106 (see below).

**The flaw the trace found (mechanism, descriptive): the arm's gate
is over-broad.** It fires on ANY day with `_pilgrim` set while the
scholar is at Haven — including study days, when courtship studies
instead of walking (dist ≤ 2), and days the scholar already carries
3L. Evidence:
- **85501 d58:** the arm's unload (donateHaul) shed 6.2kg
  (packKg 19.1 → 12.9 at postCourt) on a day the scholar did NOT
  walk out (stayed at Haven, postCourt at (4,4) — a study day).
  The trajectories diverge from there: d59 entry packKg 4.1 vs
  control 19.3, cap 24 vs 22, cistern 27/0 vs 19/0. The arm run
  dies d106 (pantry 0, pop 5/5 alive, arc 3, seat none); the
  control lives to d150 (pop 0/0, arc 4, lesser seat waiting).
  The divergence is the arm's unload, not its water — the fill
  itself is 1L and harmless. Donating food to the pantry cannot
  starve a village, but it changes what the scholar carries and
  the RNG stream downstream; the 44-day-earlier death is the
  arm's footprint, and it is a NEGATIVE footprint on this seed.
- **fillUnloads counts:** 85501: 15 unloads for 1 top-up; 85502:
  11 unloads for 0 top-ups; 85503: 2 for 1; 85504: 0 for 0. The
  unload runs whenever room < 3 on a `_pilgrim` day, even when no
  fill is needed — 26 of 28 unload passes bought no water.
  85502 is the purest case: its target village_2 sits at (4,5),
  dist 1 from Haven — all 14 of its "trips" are eval+study from
  home with 0 walk-out days, yet the arm ran its unload pass 11
  times on those days. The gate fires on proximity, not on
  walking.
- **The arm's only fills:** 85503 d27 (packW 2→3, the walk-out
  day — the one clean hit) and 85501 d85 (packW 2→3, a NON-walk
  day: the scholar sat at Haven at hyd 0 all d84, see Q1c).
**What the arm proved, narrowly:** the fill-after-daily placement
works when it fires (both fills landed 1L, cistern dropped by
exactly 1, no refusal on those days). What it did NOT prove: that
topping up eliminates dry walk-outs — there were none to eliminate
on this base. The proposed fix for r101 (not landed here): narrow
the gate to an ACTUAL imminent walk (dist to target > 2, the same
condition courtship uses to walk rather than study) AND water < 3
before any unload runs. That arm needs its own prereg.

## Q1b — RESET-LOOP CONSEQUENCE (report-only)
**No loop to collapse.** Resets = **0 across the whole arm quad**
(and 0 in the control quad). r99 had 28. On this base/band the
thirst-walk reset loop does not occur at all — the pilgrimages
complete (studies 2/2/13/3 per seed) and the villages die of pantry
0 or population 0 instead. Q1b's expectation (collapse) is vacuous
alongside Q1: a collapse cannot corroborate an arm when there is
nothing to collapse. The loop's absence on this base is itself a
finding about band fragility (see Metric review).

## Q1c — MOVER + DRAIN REGRESSION (report-only)
**Burn model HOLDS on the nights that remain.** 74 pilgrimage
nights: 1 no-drink night (d84: drain 59 vs burn ~62, within ±10);
drink nights follow the r99-established pattern (drain 14 with 1
morning drink; negative with 2). The one outside-±10 case by the
naive (burn − 50×drank) formula is a floor+cap artifact, not a
model break: **d85 drain −100** — the scholar sat at hyd 0 all of
d84 (packW 0, cistern 0 clean / 16 dirty at Haven, pilgrimage to
village_2 stalled at attempt 2–3) and drank twice overnight back
to the 100 cap as the cistern recovered (10 clean by d85 entry).
A full day at zero hydration while the village's water is dry and
a pilgrimage stalls is a real gameplay moment, reported as-is.
The drain separator (pack water / tile water) still describes the
nights; the counts changed shape (no loop nights) because the
band changed, not the instrument.

## Q2 — CENSUS CONTINUITY (report-only; r93–r99 metric unchanged)

| seed | end | day | pop | pantry | rank | seat | arc | seasoned peers (final) | shape |
|---|---|---|---|---|---|---|---|---|---|
| 85501 | over (pantry 0) | 106 | 5/5 | 0 | regional | none | 3 | 0 (lead 37/81d; covenants 30/29/29, 8–6d) | arm-diverged, early hunger |
| 85502 | over (pop 0) | 61 | 0/0 | 0 | regional | lesser waiting | 4 | 0 (lead 30/35d; covenant 25/7d) | died out, lesser waiting |
| 85503 | over (pantry 0) | 33 | 5/5 | 0 | village | none | 3 | 0 (lead 33/8d) | early hunger (base) |
| 85504 | over (pop 0) | 74 | 0/0 | 250 | regional | lesser waiting | 4 | 3 (lead 45/48d; covenants 59/32d, 54/31d) | died out, lesser waiting |

National staged 0/4, courtNational answers 0/4 — same as r93–r99.
The two long-lived villages again die with a lesser seat waiting
(arc 4). 85504 now banks THREE seasoned peers (r99: two) — a lead
at 45/48d plus two covenants at 59/32d and 54/31d — and still no
national: the third seasoned peer is a LEAD link, and the polity
needs the court to sit (pendingNational never staged on any seed).
85501's covenants all formed at d98–d100, days before it died.

## Q3 — PEOPLE CHECK (sense law; corpus rule as r96–r99)
Corpus: d90 on 85501 only (the only seed alive at day 90; no day
substitution, per prereg). **1 of 1 fully real, short.**
- **85501 d90 Chantal (Pharmacist, steady, trust 94, 27 prior
  conversations, want: curious stage 1):** "About your first
  memory — What's your first memory? Like, ever. The earliest
  thing. That's where we are." A real want — curiosity about the
  scholar, grounded in a long relationship. The scholar answers
  ("A kitchen. Morning light. I must've been three."), she
  responds naturally ("Three. That's young. The brain keeps what
  it needs, I guess."), and when pressed ("Please, go on.") she
  deflects with earned history: "That could have stung. They let
  it pass — you've been kind before." The want advances to stage 2
  (owed, not faked closed); the close ("Steady as she goes. See
  you at dinner.") is grounded in the village day. REAL. Caveat:
  the picker chose "leave" after 3 turns, so the sitting is short
  — but the sitting as played is complete, and nothing in it is
  filler or fabricated history.

## Village assessment (plain words)
Four villages on a band the new base reshuffled beyond recognition.
One never gets out of the first month (85503 dies at day 33 with
its pantry empty, five people still standing). One dies out
entirely by day 61 (85502) and another by day 74 (85504), both with
a lesser seat already waiting for them — they reached the region,
courted their neighbours, swore covenants, and died before any
nation could sit. The longest-lived (85501) reaches day 106 and
the region, forms three covenants in its last week, and dies with
its pantry empty while its people are still alive. Nobody reaches a
nation on any seed; nobody sits at a table. The pilgrims, for their
part, walk out with water in their bottles this time — the dry
walk-outs of the morning are gone, not because the new fill habit
fixed them, but because on this base the villages' early days run
differently and the thirst that used to strand pilgrims never
bites. One scholar still spends a whole day at zero thirst with
an empty cistern while his pilgrimage stalls — the water can still
run out from under a village, and when it does the scholar simply
waits it out.

## Reachable / Fun / Winnable (leg verdict)
- **REACHABLE — PARTLY, unchanged from r96–r99.** Regional on 3/4
  seeds; national staged 0/4. The covenant road opens in play
  (85504 banks three seasoned peers), but the court never sits —
  the season to hold the polity is not reached on these seeds.
- **FUN — YES, with the same honest caveat.** The one conversation
  is genuinely good (Chantal's first-memory curiosity, earned and
  owed). The dull spot is the early-death band: one village ends
  before the leg's window (day 80) even opens, and two more die
  with a lesser seat waiting and nothing left to play for.
- **WINNABLE — NOT YET.** No national, no global, no full seat on
  any seed; the lesser seat waits on 2/4 while the villages die.
  Behind this wall still sits the wave-4 kill wall from the
  November 3 picture; this run faced no wave-5 content and claims
  no kill. The fill arm did not move the funnel — it fired twice.

## Telemetry deviation check (step 14 — NOT rolled)
`node scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale.json --current
'evidence/2026-11-05/journey-scale-r100/journey-scale-r100-trust-*.json'
--metrics nationalLive,scaleRank` → "quiet (4 files, 2 metrics, no
large deviations)". Same caveat as r93–r99: that baseline is an old
aggregate shape, so "quiet" means "no large deviation on these two
metrics", not a clean bill. Baseline NOT rolled forward.

## Tests
- Pilot gate (pre-registered): seed 85503 ran first; pilgrimage
  trips present (3 trips, 2 studies) and all morntrace3 fields
  populate on every row (99 rows, 0 null packKg, 0 null cist).
  Gate PASSED — full quad ran. (The pilot's d33 death vs r99's
  d96 was base drift, proven by the control quad — see
  Infrastructure.)
- Control quad (same-base, r99 policy, no arm): 85501 d150, 85502
  d61, 85503 d33, 85504 d74. 85502/85503/85504 end identically
  with and without the arm; 85501 diverges at d58 (the arm's
  unload on a study day). Postrace byte-identical on 85503.
- Quad determinism: arm quad ran ~45s; control quad ~59s.
  Morntrace diffs arm-vs-control are exactly two kinds: the
  packTop name fallback (names now read: Trail mix, Cattail,
  Purslane, Hickory Nuts (in shell), Vine, unknown berries) and
  the fill itself (d27 85503: packW 2→3, cist 25→24, +1 tick;
  d85 85501: packW 2→3, cist 10→9).
- `node scripts/check.js --quick` (on the branch code,
  `--cacheDirectory=/tmp/jest-cache-playtest`): **284 passed, 6
  failed in 433s.** The 6 are r98/r99's same pre-existing failures
  (same files: godpath/test-measurement-proof-update,
  test-measurement-workflow, test-mobile-combat-cadence,
  test-occupation-panels, test-phone-frame-proof,
  test-establishment-r20-fixes-20261020) — proof-freshness and
  phone-receipt staleness on the base, not this run (zero src/js
  touched; the new driver/analyzer/policy-clone are never executed
  by check.js). r99's 4 load-attributed new failures are GONE
  (load was ~4–5 this run vs 22 then); 284 passed vs r99's 280.
  No failure touches this run's files. Full log:
  evidence/2026-11-05/journey-scale-r100-checkquick.log.

## Metric review
- **Q1's FINDING clause failed on its second half, and the failure
  is instructive:** the clause assumed the r99 band's dry
  walk-outs would still be there to eliminate. The base move
  erased them (control: 0 dry / 10). A matched-band gate that
  depends on a phenomenon the base move can erase is fragile —
  the next run's prereg should gate on the CONTROL's dry count on
  the same base (run the control FIRST, or gate on arm-vs-control
  on the same base), not on a prior run's number. No re-scoring
  was done: the verdict stands as FAIL on the pre-registered
  clause, with the mechanism (over-broad gate) reported
  descriptively.
- **Arm-design lesson (for r101):** an unload that runs whenever
  room < 3, regardless of whether a fill is needed or a walk is
  imminent, is a state-changing action with its own footprint
  (85501: 15 unloads, 1 fill, 44-day-earlier death). The narrowed
  gate (dist > 2 AND water < 3 before any unload) is the proposed
  revision; it needs its own prereg and its own control.
- **Instrument note (packTop):** the name fallback works — raw
  stacks now read by name (Cattail:9, Cattail:7.8 on 85504 d35,
  the exact case r99 could not name). One residual: names with
  spaces ("Trail mix", "Hickory Nuts (in shell)") are fine in the
  row format (the analyzer's `top=(\S+)` regex only captures to
  the first space — the printed top= value truncates at "Trail".
  Cosmetic; the full value is in the file. r101's analyzer should
  use `top=(.+?)(?: dThirst=|$)` if it needs full names.
- Q1b's metric is new for this run (reset collapse) and is
  vacuous on this base (0 resets either way); Q1c's burn check
  holds on the one no-drink night; Q2's metric is unchanged from
  r93–r99; Q3's corpus rule held (d90 exists for 1 seed; no day
  substitution).
- No pre-registered metric was re-scored mid-run.

## Harness
scripts/journey-scale-r100-20261105.js (r99 lineage: labels/seeds/
EVIDIR + the fill policy require + three census fields; diff vs r99
verified: labels + require + census fields only). Policy:
scripts/policies/scalecourt-nogate-morntrace3-fill.js (r99 clone +
topUpBeforeWalk + packTop name fallback; diff verified: header +
import + fallback + function + call + desc only — plus the
fillWater-return fix: the loop detects success by water-count
growth, since fillWater returns null on success too). Analyzer:
scripts/analyze-journey-scale-r100-20261105.js (r99 analyzer +
revised DRY-vs-WET gate + fill-counter report; the r99 gate lines
replaced, everything else labels only). Pilot seed 85503 x DAYCAP=180
ran ~4s; full quad ~45s; control quad ~59s. Per-seed evidence:
evidence/2026-11-05/journey-scale-r100/ (per-seed files,
transcripts, analysis) and evidence/2026-11-05/
journey-scale-r100-control/ (same-base no-arm control). Prereg +
this note in repo evidence/2026-11-05/.

## Blanks: filled or documented
- FILLED (documented, mechanism traced — no game change): the fill
  arm's over-broad gate — it fires on study days and when water is
  already 3L, and its unload pass (26 of 28 passes buying no water)
  diverged 85501 by 44 days. The narrowed gate is proposed for
  r101, not landed here.
- FILLED (documented): the packTop name fallback works — raw forage
  stacks read by name (Cattail:9, Cattail:7.8, Purslane, Hickory
  Nuts, Trail mix, Vine, unknown berries).
- FILLED (documented): the d85 −100 drain is a hyd-0 floor + 100-cap
  artifact (scholar at 0 all d84, cistern dry, drank twice
  overnight as the cistern recovered) — not a burn-model break.
- DOCUMENTED (no instance this run): national staging — 0/4, with
  the shape named per seed (85504 banks three seasoned peers but
  the court never sits; 85501's covenants form d98–d100, days
  before it dies).
- CARRIED (next micro-question + narrowed arm for r101): competent
  tops up bottles at Haven before a pilgrimage walk-out ONLY when
  a walk is imminent (dist > 2) AND water < 3, unload only to make
  room for the fill — proven on the same band with a same-base
  control run FIRST so the gate's baseline is known before the
  arm is judged.
