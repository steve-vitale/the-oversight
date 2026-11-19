# sim-sense-guard-diag-a — FROZEN prereg (Loop A 0115Z run, arm sim-sense-guard-diag-a)

**Frozen:** 2026-11-19 ~02:30 UTC, BEFORE any judged sim. Base master
`be0b90b41` + staged HELD substrate cherry-picked from branch
`sim-allyslot3-rerun-b`: sense fix `1eaff1e00` (→ `1fe712030`),
3rd-ally slot `41edabbb2` (→ `7efbf26a8`), judged driver `69e12cc5a`
(→ `dedfe0635`). Branch `sim-sense-guard-diag-a`.
**Diag, NOT a lever:** no sense change lands from this arm. It
measures whether the launch-party sense's same-expedition guard is
too strict for a party that set out together, or whether expeditions
genuinely split — measured, not assumed. The sense itself is HELD
NO-GO substrate (finding #2538); the slot is HELD (finding #2515).
**Substrate (rides along, NEVER re-judged, DROPPED before delivery
— seedplan-b pattern):** LAUNCHPARTY sense fix + ALLYSLOT3 slot +
rerun-b driver lineage. Both legs... there is ONE leg (see Design):
the rerun-b ARM substrate exactly, all flags on.

## The question (finding #2571)

Loop B arm sim-allyslot3-rerun-b (evidence/2026-11-18/
sim-allyslot3-rerun-b.md, NO-GO, field-4 3/7 = 0.43): the sense
returns the full trio in only 5/10 meetings. The two genuine misses
are companions not co-located on the same expedition tile at the
meeting instant: seed 104721 day 69 (quad holder sensed 1 launch
companion + 1 bystander; the other two companions failed the
same-expedition guard) and seed 104722 day 112 (fighter sensed
companions of a different overlapping quad, not his own). Of the 5
meetings where the sense DID return the trio, 3 fielded the third
ally and 2 ended in 1–2 rounds before any shout could be answered.
The slot's ceiling is ~0.5 until the sense rate rises, regardless of
band richness.

**Precision note (read from the code, not the finding's shorthand):**
the guard is expedition-DESTINATION equality, not current-tile
co-location: `party-wiring.js` counts a launch companion iff their
expedition entry exists and `pExped.tx === myExped.tx &&
pExped.ty === myExped.ty`. Companions a leg apart on the same
destination PASS; the ontology comment says so ("they travel
together even a leg apart at the meeting instant"). The finding's
"same-expedition tile" means same expedition target tile. The diag
stamps the guard's exact inputs at the meeting instant (fighter
plan.party + expedition, each companion's expedition target/legs/
duration, node, alive state, mirrored plan) via a wrapper on
`Game.villagerFightAllies` (pure reads; the original runs once,
untouched) — the recorder the re-judge arm asked for ("a future
recorder must stamp expedition state at the meeting instant").

## Env flags — live vs inert (verified on current master)

- LIVE on master, env-gated, default OFF: PARTYSIZE4, VETREENGAGE,
  FLEEREPAIR2, FIGHTALLY2 (grep `src/js/*.js`, this base).
- HELD substrate, NOT on master: LAUNCHPARTY (sense fix,
  `party-wiring.js` — grep count 0 on master), ALLYSLOT3 (slot,
  `fieldFights.js` + `party-wiring.js` + `game.js` wild router).
  Staged here by cherry-pick for measurement only; dropped before
  delivery. Leg guards in the driver assert all six flags.
- Substrate tests on this tip: `test-launchparty-sense-a.js`
  12/12, `test-allyslot3-b.js` 18/18, `test-partyquads-b.js`
  29/29 (0 skipped).

## Seed-band freshness (skill: local_seed_band_freshness)

Fresh band **104750–104757** checked before the survey: no
`evidence/**/*.md` names any 10475x seed, no filename contains
10475, no commit message or branch names 10475, no exact seed
104750–104757 appears in any prereg. Used bands NOT reused:
104901–104908, 104911–104922, 104601–104608, 104701–104712,
104704–104711, 104730–104745, 104431–104438, 104720–104727,
104401–104408, 104501–104508 (task list + prereg greps).
**Repro leg seeds 104721, 104722, 104437 are reused BY DESIGN** as
the frozen test cases (finding #2571's named rows) — a targeted
reproduction, not a fresh pilot; recorded here so no later reader
mistakes it for a freshness violation.

## Survey (pool measurement, NOT a judged sweep)

The diag driver ran MODE=diag on 104750–104757, 150d, competent,
arm substrate, BEFORE this prereg was frozen. Corpus:
`evidence/2026-11-19/perseed-sense-guard-diag-a-survey/` (8 files,
0 instrument errors; interrupted once by a machine restart after 3
seeds — per-seed files are independent, resumed seed by seed, all 8
exit 0). Measured pool (analyzer
`evidence/2026-11-19/sense-guard-diag-a-survey-analysis.json`):

| | Survey (diag, 8 seeds) |
| --- | --- |
| Launches (wave-4+, deduped) | 15 |
| Quad launches | 9 |
| Primary denominator meetings (fought expedition, fighter-anchored best-match join) | 18 |
| Sense-trio rate | 7/18 = 0.39 |
| Misses by class | not-in-plan:fighter-relaunched 10, not-in-plan:mirror-overwrite 5, target-mismatch 4; no-exped 0, dead 0, fighter-no-exped 0, unclassified 0 |
| Trace coverage | 18/18 same-day traces; stale 0; no-trace 0; dropped 0; mirrorMismatch 0 |
| Wall: wins / national / wave 5 / wave 4 / standing ≥200 / survived / median days | 0 / 0 / 3 / 8 / 3 / 5 / 151d |

**Pool floor (set FROM this measured rate, finding #2566):** ≥6
launches (measured 15 — floor is 40% of measured) and ≥2
denominator meetings (measured 18 — floor far below measured).
The survey's sense numbers (0.39) are pre-prereg pool data, NOT
judged: the judged fresh leg re-runs the same 8 seeds after
freezing, and determinism vs the survey is itself a check.

## Instrument notes (pre-freeze corrections, not metric changes)

- **Tracer filter (smoke-seed fix):** the sense is called ~5,600×/
  seed; 73% of calls are for fighters with no plan at all. The
  unfiltered tracer hit its 5000/seed cap and DROPPED 638 traces,
  losing a day-120 meeting's trace. The tracer now records only
  the diag population (fighter with a launch party OR on an
  expedition) and counts skipped calls (`senseTracesSkipped`);
  re-run seed 104750: 918 traces, dropped 0, day range 32–120.
- **Patrol/aid meetings carry NO sense call:** their allyVids come
  from the outdoor-crew snapshot (`game.js` patrol path), never
  from `villagerFightAllies`. The analyzer reports them as
  no-sense-path (survey: 60), never scores them as misses.
  Expedition + world-tick meetings DO call the sense.
- **Mirror agreement:** 0 mirrorMismatch on all survey traces —
  the tracer's guard mirror agrees with the sense's actual launch
  return everywhere it was checked.

## Primary metric (BINDING, §14)

**The decomposition on the judged fresh band.** Denominator:
fought expedition meetings joined to a quad launch by the
fighter-anchored best-match rule (finding #2570: fighter must
belong to the joined launch; best match on {fighter + sensed
allies} ∩ party; most recent on ties; 21-day window; NO
target==mid rule, finding #2564). For each meeting: sense-trio
(expected launch companions ⊆ sense return) and, for each missing
companion, exactly one mechanism class from the meeting-instant
trace. Mechanism taxonomy (frozen):

| Class | Meaning |
| --- | --- |
| guard-pass (not a miss) | companion counted by the guard |
| target-mismatch | companion's expedition target (tx,ty) differs from the fighter's — genuinely split (sub-detail: companion's own plan target) |
| no-exped | companion holds no expedition entry at the meeting instant |
| dead | companion dead at the meeting instant |
| fighter-no-exped | fighter holds no expedition entry — whole launch list skipped |
| no-plan-party | fighter holds no plan / empty party |
| flag-off | LAUNCHPARTY unset (instrument check, never expected) |
| not-in-plan:fighter-relaunched | fighter re-launched after the joined launch — the sense correctly reads the NEW party; the join attributes the meeting to a stale launch |
| not-in-plan:mirror-overwrite | fighter was taken as a companion in another holder's later launch — the mirror write overwrote their plan.party |
| not-in-plan:companion-own-launch | the missing companion departed on their own plan — their mirrored plan was clobbered |
| not-in-plan:companion-retasked | the missing companion joined another holder's later launch |
| not-in-plan:other | none of the above (detail names the fighter's current plan) |
| unclassified | pid in planParty but no member row — instrument fault, counts against classification completeness |

**DIAG-GO criteria (frozen — the diag judges whether the question
is ANSWERED, not whether the sense is good):**

1. Pool floor: launches ≥6 AND denominator meetings ≥2 on the
   judged fresh band. Else DIAG-NO-GO, kind METRIC-BROKEN.
2. Trace coverage: same-day traces on ≥90% of primary meetings.
   Else DIAG-NO-GO, kind TRACE-GAP.
3. Classification complete: every miss carries a named mechanism
   (unclassified == 0). Else DIAG-NO-GO, kind UNCLASSIFIED.
4. Test cases: ≥3 of the 4 named rows reproduce (same seed +
   fighter + monster, day ±3) AND carry a same-day trace. Else
   DIAG-NO-GO, kind TESTCASE-MISS.
5. Instrument: 0 file errors; 0 traces dropped by cap; 0 mirror
   mismatches. Else DIAG-NO-GO, kind INSTRUMENT.
6. The evidence file then names the dominant mechanism (largest
   miss class, or a stated split) AND a named next arm that follows
   from it (guard relaxation vs expedition-cohesion vs join fix).
   That recommendation is the diag's deliverable; the analyzer
   judges 1–5, the evidence judges 6.

**Sense-trio rate (reported, not binding):** the share of primary
meetings where the sense returned the full trio. The rerun-b band
read 0.50 (5/10); the survey band reads 0.39 (7/18). No threshold
is set on it — the diag explains the rate, it does not pass it.

## Test cases (frozen)

| Label | Seed | Day | Fighter | Monster | From |
| --- | --- | --- | --- | --- | --- |
| d69 | 104721 | 69 | gen_5b212hy (quad holder) | audit | #2571 genuine miss 1 |
| d112 | 104722 | 112 | nino_kapanadze | eater | #2571 genuine miss 2 |
| d117 | 104722 | 117 | miguel_santos | editor | #2570 join artifact (actually fielded) |
| d133 | 104437 | 133 | ruby_callaghan (companion) | reunion | #2564 off-target live-fire row |

If a row does not reproduce on current master + substrate, the
evidence documents the trajectory difference instead of silently
substituting another row; the bar (≥3/4) already prices that risk.

## Design

- Horizon: 150d, death-aware. Policies: competent verbatim only —
  the question is a mechanism question, not a playstyle question.
- Legs: ONE diag leg (rerun-b arm substrate, all flags on). There
  is no control leg: this is a measurement of the sense mechanism,
  not a lever contrast — **the §15 balanced panel does not apply**
  (stated here, not faked: there is no before/after to compare).
  Telemetry check likewise does not apply to recorder corpora
  (refuses them by design — rerun-b precedent); scale-wall numbers
  come from the analyzer's wall census instead.
- Judged legs (run AFTER freezing): (a) repro leg — seeds 104721,
  104722, 104437, OUTDIR perseed-sense-guard-diag-a-repro;
  (b) fresh leg — seeds 104750–104757, OUTDIR
  perseed-sense-guard-diag-a-diag (re-run of the survey band;
  determinism vs the survey corpus is checked). One seed per exec
  (a 4-seed exec was SIGTERMed by a machine restart mid-survey;
  per-seed files are the resume unit).
- Proof: `scripts/test-sense-guard-diag-a.js` — tracer fidelity on
  staged quads (guard-pass / target-mismatch / no-exped /
  fighter-no-exped / dead), wrapper passthrough (wrapped ==
  unwrapped), substrate-gated mirror agreement (SKIPS cleanly when
  the HELD substrate is dropped), analyzer d133 regression.
  On this tip: 9/9, 0 skipped (substrate present).
  `scripts/analyze-sense-guard-diag-a.js --selftest`: 10/10.
- Parallel arm note: Loop B run fleshout-loop-b-20261119T0130Z
  claims sim-sensecotravel-b (DIAG #2577/#2578: fighter-anchored
  best-match join re-judgment of the 2330Z pilot corpus +
  co-location decomposition). That arm re-judges EXISTING corpora;
  this arm runs FRESH sims with a meeting-instant recorder. The
  two are complementary, not duplicative; no shared files, no
  shared branches (do not touch sim-allyslot3-rerun-b,
  sim-partysize4-confirm-b, or sim-sensecotravel-b).

## Fixture (encounter-gear rule, Steve 2026-11-13)

The staged proof fixtures stage a geared wave-4 hunting party as
the launch leaves them (holder + 3 launch companions, armed, on
one shared target) — the average gear/party a player has when they
reach wave-4 content — never a fresh un-geared solo scholar. The
pilot's driver stages the geared fight through the competent
policy.

## Metric review

- The primary denominator (fought expedition meetings, fighter-
  anchored best-match join) is the one place this prereg could
  drift: it excludes patrol/aid meetings (no sense call exists
  there — reported as no-sense-path, not scored) and world-tick
  meetings (reported separately). The exclusion is pre-registered
  here, before any judged numbers are seen, with the reason
  stated — it is not a mid-run re-score. The raw sense rate over
  ALL joined meetings (expedition + world-tick) is reported
  alongside so the exclusion's size stays visible.
- The join revision (#2570) is a BETWEEN-run metric revision,
  made before this run's judged sims and frozen here — it is not
  a re-score of the rerun-b pilot (which keeps its NO-GO verdict).
- The pool floor (≥6 launches, ≥2 denominator) is set from the
  survey's measured rate (15 launches, 18 denominator per 8
  seeds) with slack below measured on both clauses — the direct
  repair of finding #2566.
- The survey is a pool measurement, not a judged sweep: it ran
  with the diag driver before freezing, and its numbers set the
  floor. The judged fresh leg re-runs the same band after
  freezing; if it does not reproduce the survey corpus (minus
  anchorCommit), that is an instrument finding, not a re-score.
- No metric was re-scored: this file is frozen before the judged
  legs run and before any judged sim.
