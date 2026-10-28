# sim-eggdriver-a — eggroad driver arms P6 + P10 (2026-10-26)

Steve's order 2026-10-26: proceed with fleshed-out proposals, adversarial
review. This run tests the eggroad pilot's driver proposals P6
(snapshot-gated re-call) and P10 (muster-feeding call gate) as OPT-IN
driver variants only. Default driver behavior unchanged; no game code,
no policy defaults changed. The pilot probe is untouched — the variants
live in a new probe file that copies the pilot driver and adds gated
hooks.

## PRE-REGISTRATION (binding, MEASUREMENT §14)

### Substrate (identical to the pilot)

r53 endgame stack exactly: capable + deedhunt + vetcommit + armorydrive +
vetguard + fullseat-diag. CAPABLE_GREEDY OFF; probe-local sit-gate (never
sit until `pg.networkFallen`). Titan drive: r42 daily driver (omen stage
≥ 2 → war council → call → commit Haven's own up to 3 → march/fight when
ready → stand down on 20-day stall below half gate or 45-day hold).
Seeds: matched 88101–88108 (pilot) + 88111 (call diagnostic, trust
comparison). Horizon 180d, death-aware. Baseline = the pilot's committed
per-seed JSONs (88101–88108) + the diagnostic JSON (88111), plus base-arm
equivalence runs on 88101 + 88111 (the copied driver must reproduce the
pilot before any variant result is trusted).

### Code facts the variants rest on (read from src/js/titans.js)

- Answering (soundTitanCall): a link REFUSES if trust < 25, opinion
  < −10, or arrears > 0 — and refusal costs trust −8. Otherwise quota =
  6 if trust ≥ 70 AND opinion ≥ 10, else 2. Re-calling is safe in one
  direction only: it tops up to the CURRENT quota (a village at 2 that
  reaches trusted gains 4 more); a village already at quota gains 0.
- Stand-down (titan:standdown): dissolves the muster AND costs trust
  −5 per answering village. A naive re-call on an unimproved snapshot
  re-burns −8 per refuser and −5 per answerer at the next stand-down:
  the snapshot gate is load-bearing, not decorative.
- Upkeep (titanMusterUpkeep): 1000 kcal/blade/day drawn from the
  PLAYER'S PACK (playerPackSpend on scholar inventory, finished food
  only), NOT directly from the village pantry. The pantry is the
  reservoir the scholar refills from (enterBuilding + takeFromPantry,
  Haven node only). P10's "pantry gate" is therefore a reservoir gate,
  and P10 must also top up the pack — a pantry gate alone cannot feed
  a muster whose draw hits the pack.
- Omens do NOT expire (titanDawnTick advances stages, never retracts
  them). Deferring a call loses nothing except time — which is exactly
  what the P10 delay measurement watches.
- "Other spending" leg: VOID on this substrate. The r53 stack spends no
  discretionary pantry (deedPatrol travels/forages, surgeUpkeep channels
  sentiment; neither draws pantry). Feasts are seat-critical and village
  meals are automatic — neither is suppressible by this driver, and
  suppressing village meals to feed a muster would BE the starvation
  the bound forbids. P10's operative legs are the call gate, the pack
  top-up, and the reserve guard. Recorded here, not implemented as a
  fourth leg.

### Variant definitions (exact)

- SNAPSHOT: active links via hierarchyState, per link: other village,
  trust, opinion, arrears, roster, adults. PREDICTED blades (allies
  only, faces availability NOT modeled — the measured re-call result
  is the truth): per link, 0 if trust < 25 or opinion < −10 or
  arrears > 0; else 6 if trust ≥ 70 and opinion ≥ 10, else 2; summed.
- P6 (snapshot-gated re-call): after a stand-down, the driver records
  stoodDownDay, stoodDownAllies, and the snapshot. On later days
  (stage still ≥ 2, not slain), a re-call is permitted iff ANY of:
  (a) a new active link formed since the stood-down snapshot;
  (b) a link's trust crossed UPWARD over 25 (from < 25 to ≥ 25, with
  opinion ≥ −10 and arrears 0) or over 70 (from < 70 to ≥ 70, with
  opinion ≥ 10);
  (c) predicted blades now exceed stoodDownAllies.
  On a permitted re-call: stoodDown cleared, called reset, the call
  re-runs (game tops up to current quotas). Council is NOT repeated.
  Re-call count and trust trajectory are recorded (churn watch).
- P10 (muster-feeding call gate):
  (1) CALL GATE: call only when pantryKcal + packKcal ≥ minAllies ×
  1000 × 7 (7-day runway: covers the 88111 fight-in-2-days pattern
  plus a short assembly stall; a 45-day stall needs 450k kcal, which
  no village pantry covers — pretending otherwise would make the
  gate a fiction). While the gate is unmet, the call is DEFERRED
  (council already sat; no commits before a call); deferral days
  and pantry/pack at each deferred day are recorded.
  (2) PACK TOP-UP while a muster stands (once per day, global across
  titans — dawn upkeep draws the SUM of standing musters): if the
  scholar is at Haven and packKcal < totalStandingBlades × 1000 +
  2000 (one day of muster + own need), draw pantry → pack (prepared
  food first) up to that need, but never below the reserve floor.
  Top-up kcal recorded.
  (3) RESERVE GUARD (the bound that never starves the village):
  while a muster stands and is NOT ready, if pantryKcal <
  rosterAlive × 2000 × 3 (3 days of full need for the living
  roster), stand the muster down early (reason 'reserve-guard').
  Ready musters are EXEMPT (the fight resolves them). The guard is
  on the reservoir because upkeep draws from the pack the pantry
  refills; pack kcal is recorded alongside every guard check.
- COMBINED (P6+P10): both gates apply. A re-call needs snapshot
  improvement AND the pantry gate; top-up and reserve guard apply
  throughout.
- BASE (control, not a judged arm): the copied driver with all
  variant flags off. Must reproduce pilot 88101 and diagnostic 88111
  on key facts before variant results are trusted.

- Top-up price (code fact, found while writing the probe): pantry takes
  are COUNTED (takeRate7, 3000 kcal/day abuse bar) and weight-capped
  (carryCapacity). A 10-blade top-up (~10,000 kcal/day) can therefore
  trip theft/freeloader consequences even while it feeds the muster —
  the top-up trades link-trust for Haven-trust. The probe measures
  this (say-line capture for red-handed/freeloader/Too heavy + scholar
  trust trajectory) instead of assuming the top-up is free. Top-up is
  deficit-only and at most once per day; bars below are unchanged.

### Arms and bars (binding)

Arms: P6 alone, P10 alone, P6+P10 combined — each on matched seeds
88101–88108 + 88111.

- PRIMARY (binding, per arm): muster-ready count on matched seeds:
  ≥ 3 musters reach gate-ready AND ≥ 1 nielsen (12-gate) ready → GO.
  Else NO-GO. Baseline pilot: 0/10 (0 herald-ready of 6 called,
  0 nielsen-ready of 4 called). A single ready muster is explicitly
  NOT go — the bar requires a regime change plus the harder gate.
- P10 MECHANISM BAR: trust-at-second-call ≥ trust-at-first-call on
  ≥ 1/2 of second-call opportunities (a seed where a second muster
  is called after a first stood down or was slain). Baseline: the
  88111 diagnostic — both second-call links decayed (71→58, 35→24),
  0/2 preserved. If P10 holds trust, this bar moves; if not, P10's
  trust-preservation claim fails even if readiness moves.
- COMBINED CONSTRAINT (binding on the combined arm): call-fire rate
  at horizon ≥ 50% of stage-≥2 titan-slots (a titan-slot = one titan
  on one seed that reached omen stage ≥ 2). Below 50%, the combined
  arm is over-gated NO-GO even if the primary bar is met.
- FRESH-SEED CONFIRM: only on GO — 12–16 fresh seeds (verified unused
  block) on the GO arm(s) before anything is called landable.

### Adversarial measurements (reported for every arm; never re-scored)

- P6 fire rate: stand-downs → permitted re-calls → actual re-calls
  (and blades gained per re-call). If the gate never permits a
  re-call, that is a P7 signal (gates may be the binder), NOT a
  P6 failure.
- P10 call-delay distribution: days from omen stage ≥ 2 to call, per
  arm vs baseline; deferred days; calls delayed past village death
  are CENSORED (never counted as fired).
- P10 upkeep bound: pantry + pack trajectories under standing
  musters; reserve-guard firings; village meal coverage; any
  starvation event while a muster stands (the bound's failure mode).
- Combined over-gating: call-fire rate (above) + deferral days.
- Re-call churn: re-calls per titan, trust trajectory after each
  re-call (stand-down −5 and refusal −8 must not outrun improvement).
- Naive re-call harm (code fact, stated not measured): an ungated
  re-call on 88111's decayed snapshot would re-refuse at 35→24's
  village and re-burn trust — the gate exists because the game
  charges for every call.

### Metric review

(To be filled after the sweeps. A miss is NO-GO, never re-scored
against a friendlier metric mid-run. If a metric proves wrong, the
revision goes here and applies to the NEXT run.)

### AMENDMENT (pre-sweep, after base equivalence — bars unchanged)

BASE DRIFT CONFIRMED, copy faithful: the original pilot probe re-run on
88101 on current master reproduces the base arm EXACTLY (announce null,
seat none, tier 0, scale national, herald call day 181, no stand-down,
no fights). The copied driver is faithful; the divergence from the
pilot-then JSON is master drift between the pilot's base (be3a588c2)
and current master (f89a9b32d), not a copy error. On current master,
88101 never announces and never seats, but reaches national scale —
its road changed completely. (Flagged for the parent: something in the
intervening landings moved seat/scale dynamics on this substrate;
this run does not chase it.)
Consequence, decided before any variant sweep: the pilot-then JSONs
are NOT the comparison baseline on current master. The control set is
the base arm run on all 9 matched seeds on current master. The PRIMARY
bar is absolute (≥3 ready + ≥1 nielsen) and stands as written; the
P10 trust bar (≥1/2 preserved) is judged against both the diagnostic's
58/24 decay AND baseNOW-88111's pairs (same probe, same master — the
cleaner comparison). The pilot baseline file was restored
byte-identical after the experiment (git checkout, status clean).

## RESULTS (matched seeds 88101–88108 + 88111, 180d, all arms complete)

Control (base, current master): 10 titan-slots reached stage ≥ 2, 10/10
fired, 6 musters ever ready (ready flag OR slain OR fought), 1 nielsen
ready, 5 fights, 1 slain (88111 herald), 2 stood down at end, 0 censored.
Trust preserved on 3/12 second-call pairs (0.25) — the decay the
diagnostic named, reproduced on current master.

### Verdicts

- **P6 — NO-GO as a readiness improver (letter GO, substance NO-GO).**
  Ready 6 + nielsen 1, identical to control. The pre-registered bar
  (≥3 ready + ≥1 nielsen) is met by the CONTROL, so it cannot
  discriminate the arm — see Metric review. Improvement over control:
  fights 5→6 (+1), slain 1→1 (none), nielsen ready 1→1 (none),
  village survivals +1 (88102 lost→survived). Mechanism PROVEN:
  re-calls fired 3/3 when permitted (stand-downs → permits → actual
  calls, all three). No regressions: fire rate 1.00, censored 0,
  no seed worse than control. NOT landable as a readiness lever (no
  improvement); its code is non-regressing and may be carried as an
  opt-in driver option for future measurement with a revised bar.
- **P10 — NO-GO, decisively.** Ready 0 (vs control 6), fire rate
  0.20 (2/10 slots), 206 deferral days, 4 slots censored (88107 ×2
  and 88111 ×2 died without a call), fights 0 (vs control 5), slain 0
  (vs control 1). The 7-day gate (70k/84k) never opens on 4 of 5
  calling seeds. It DESTROYS the known win: on 88111, the herald
  call was deferred 53 days and never fired — the village died
  without fighting the herald the base driver slays. NOT landable in
  any form.
- **P6+P10 — NO-GO + OVER-GATED.** Ready 0, fire rate 0.20 (violates
  the pre-registered ≥0.50 combined constraint), 317 deferral days,
  fights 0, slain 0, censored 4. P10's gate dominates: P6's 2 permits
  on 88102 never became calls (deferred forever). The two gates
  compound delay instead of composing benefit. NOT landable.
- **Fresh-seed confirm: NOT RUN.** No arm earned GO, so no confirm
  spend was justified. Nothing here is called landable.

### P6 detail (what re-calls actually do)

- 88102 herald: stood down, then re-called day 130 → 17 allies
  (pantry 39,860), then re-called day 151 → 17 allies again (pantry
  7,876 — thin, and P10 would have deferred this one). Fights 2,
  ready at end, village SURVIVED (control: village-lost). The
  strongest P6 signal — but single-seed, and the muster was already
  readyEver in control via its first fight, so the ready count does
  not move.
- 88107 herald: re-call day 122 → 4 allies (pantry 0, pack 550).
  PREDICTION GAP: the snapshot gate predicted 10 (quota sum) but
  only 4 joined — faces availability (free fighters, cross-muster
  commitments) is not modeled in the prediction. The gate's (c)
  condition can over-promise. Outcome unchanged (village-lost).
- 88111: no re-call opportunity — the nielsen never stood down on
  current master (unlike the diagnostic's day-136 stand-down), so P6
  had nothing to re-call. P6 is inert wherever musters never stall.
- Trust: kept 5/21 pairs (0.24) vs control 3/12 (0.25) — P6 does not
  preserve trust (it was never designed to; re-calls add calls that
  can refuse and stand down).

### P10 detail (why the gate fails)

- Delay distribution (deferral days): 88107 herald 55 + nielsen 31
  (pantry peaked ~13k vs 70k/84k — never close), 88111 herald 53 +
  nielsen 27 (pantry+pack peaked ~62k vs 70k — missed by ~8k),
  88104 herald 12 + nielsen 5 (horizon-edge calls suppressed),
  88108 nielsen 6, 88101 herald 1 (horizon-edge call suppressed),
  88102 herald 12 + nielsen 4 (then called day 122).
- Gate-guard fight on 88102: after 12/4 deferral days, both musters
  called day 122 — then the reserve guard stood BOTH down within a
  day (pantry 48,635 and 59,246 vs reserve 60,000; blades 3 and 5).
  The gate waits for a fat pantry, the guard dissolves the muster
  the moment it dips below reserve — a ~6k window that wastes the
  muster AND costs trust (−5 per answering village).
- Top-up leg UNEXERCISED: 1 attempt, 0 kcal across P10 (and 1/0 in
  combined). Musters rarely stand with pantry above reserve, so the
  allowed draw is 0 whenever a muster stands. The "prioritize
  upkeep" leg has no measured effect; its theft-bar interaction
  (takeRate7) remains untested in practice. No genuine theft/
  freeloader say-lines were observed (the say filter caught noise:
  "steals your warmth", trap lines).
- Trust bar "MET" (3/3) is a MIRAGE: only 88102's 2 stillborn calls
  produced pairs, and the musters were dissolved before erosion
  could occur. Three pairs from doomed musters prove nothing about
  trust preservation. Reported as met on the letter, meaningless in
  substance.
- Feasibility curve (pantry+pack at deferred days): a 2-day gate
  (20k/24k) would fire on 88102/88111/88104; a 6-day gate (60k) fires
  on 88102/88111 only at peak; the specified 7-day gate fires on
  none of them reliably. A shorter gate is a NEW proposal, not a
  pass for P10-as-specified — and it would not fix conversion, only
  call timing.

### Combined detail

P10's gate dominates completely: 317 deferral days (more than P10's
206, because permitted re-calls add deferral days too), fire rate
0.20, ready 0. The 2 permits on 88102 never became calls. Combined
adds delay to P10 without adding any of P6's benefit.

### CORRECTION to the eggroad pilot's framing (adversarial finding)

The pilot's "0/10 muster-ready" is a BLADEHIST ARTIFACT. BladeHist
records only !ready days — so a muster that fights on call day and
then lingers as a post-fight zombie reads as 0–3 blades. True
readiness = reached gate + fought: pilot-then had ≥3/10 (3 fights),
current-master control has 6/10 slots with 1 nielsen. Gate 3 of the
pilot's binding chain ("musters never ready") is WRONG as stated.
The true wall is CONVERSION: musters reach gates and fight (base:
5 fights) but almost never kill (1 slain). P6 does not move
conversion; P10 destroys the fights themselves.

### Muster evaporation (open titan-lane question, not resolved here)

- Combined-88102: a 17-blade muster fell to 3 blades overnight
  with NO fight (callRecord 17 day 122 → reserve-guard 3 day 123).
  Mechanism unidentified: not escalation (that raids pack/trust
  only), not normalize-missing-persons (those are kept). Needs a
  dawn muster census instrument in the titan lane.
- Base-88102: post-fight zombie musters linger (17 → fight → 0–3
  allies + Haven trickle → stand-down at exactly 20 days). A
  defeated muster is treated as a stalled assembly, not dissolved.
- Probe limitation: this probe CLEARS bladeHist on re-call,
  destroying the first muster's forensics. Future probes must
  archive, not clear.

### Base drift + infrastructure (from the run)

- 88101's road changed completely between the pilot's base and
  current master (no seat/announce, national scale, herald call day
  181 vs 114) — recorded in the pre-sweep amendment; the loop fleet
  should note the seat/scale drift, not this run.
- EPERM flap hit once during the combined sweep (0-byte 88104
  file). Recovered by delete + retry (88104 OK on attempt 2, same
  result as P10's 88104). No work lost. Completed combined seeds
  were untouched by the flap.

### Metric review (for the NEXT run, not a re-score of this one)

- The PRIMARY bar was miscalibrated: an absolute count the control
  already meets cannot judge an arm. Next run's bar must measure
  IMPROVEMENT over control (e.g., +2 ready, or a nielsen slain, or
  a second titan slain on one seed).
- The trust bar needs a minimum pair count (P10's 3/3 is vacuous).
- The fire-rate constraint WORKED: it caught combined over-gating
  that the primary bar alone would have missed.
- "Muster-ready" must be defined as reached-gate-and-fought (or
  slain), never as bladeHist maxima — the pilot's artifact must not
  recur.
