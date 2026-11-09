# sim-sametick-a — SAME-TICK RECORDER GAP (evidence)

Run: oversight-flesh-out-loop, run fleshout-20261109T1015Z (Loop A).
Axis food-economy. Worker tree: ~/workspace/worktrees/sim-sametick-a, branch
sim-sametick-a. Base master: 8cee6a8d2. Policy: competent ONLY
(scripts/policies/competent.js, UNMODIFIED). Env: PLENTYDEPRI=1,
DEPOSITGATE=1. Horizon: 150d death-aware cap. Seeds: 96301–96308 (the
medicduty / medicdiag band, deliberate reuse — the same band the 33 duty
cures were counted on).

## Brief correction (read first)

The arm brief said the medheadcount corpus was "already in your tree" at
evidence/2026-11-08/medheadcount-a-corpus/ (before) and
evidence/2026-11-08/medheadcount-a-corpus-after/ (after). Neither directory
exists — in this tree, in the main tree, or anywhere in git history
(`git log --all -- evidence/2026-11-08/medheadcount-a-corpus` is empty).
The medheadcount evidence file's corpus lines describe files that lived only
in the dead 0415Z worker's tree, which was reaped before they were
committed. The fixture for this arm is therefore the corpus that DOES exist
and DOES carry the 33: evidence/2026-11-08/medicduty-a-corpus/ (before/ and
after/ legs, 3 recorders × 8 seeds, committed cbc9b4b62 / d910dc6da). Every
"33 duty cures" number below is that corpus's number, verified by re-running
both analyzers on it (see Reproduction). The medheadcount corpus absence is
a gap in the record, not in this arm: the before/after numbers the
medheadcount evidence quotes (56.1% / 82.3%) are not re-verifiable from any
committed file. Flagged for the coordinator, not chased here.

## Pre-registered header (judged bar)

- PRIMARY: on a fresh run of the FIXED recorder over the same band
  (seeds 96301–96308, competent, 150d), duty cures captured ≥ totalDutyCures
  − 1, where totalDutyCures is the independent game counter read by the
  (unmodified) medicduty recorder on the same run. The bar is a ratio
  (≥32/33 on the old corpus's numbers), not the old corpus's absolute 33:
  the fresh run is on a later base (8cee6a8d2) with different trajectories,
  so its own total is the denominator. At most one miss, justified
  individually.
- NEUTRALITY: the recorder is a pure read — bare fingerprints ==
  recorded fingerprints on the fresh run (analyzer G2), and
  scripts/test-feveranat-a.js stays 11/11.
- SECONDARY: the two analyzers agree on curedEpisodes on the fresh corpus
  (feveranat cured-episodes == medicduty curedEpisodes).
- GO: PRIMARY + NEUTRALITY pass. A miss is NO-GO, never re-scored.

## The gap (measured before any fix; code citations)

The feveranat tick wrapper misses records created AND deleted within one
tick — 30 of 33 duty cures on the medicduty corpus.

MECHANISM (engine code, game.js):

1. `villageSicknessTick()` (game.js:32828) runs inside endDay. In order:
   recovery loop (daysLeft -= 1, delete at 0), infection loop (candidates
   roll vectors; a hit creates `v.sick[vid] = { name, daysLeft:
   3 + floor(rand*4), severity }`, game.js:32999), then
   `villagerCareTick(nm)` (game.js:33018).
2. `villagerCareTick()` (game.js:33197): the duty holder tends first and
   tries `medicDutyCureAttempt` before tending (game.js:33244). On success
   `cureIt` does `delete v.sick[pid]` directly (game.js:33144), increments
   `v.medicDutyCures[via]` (game.js:33149-33150), and says a cure line.
   It never calls cureStatus, so no cureEvent exists. The tend path only
   does `daysLeft -= 1` — the cure attempt is the ONLY deletion inside
   care.
3. So a same-tick cure is: infection creates the record (step 1), the duty
   holder deletes it minutes later in the same tick (step 2).

DROP POINTS (recorder code, scripts/sweep-feveranat-a.js):

- Drop point 1 — the `villageSicknessTick` wrapper: diffs `v.sick`
  before/after the WHOLE tick call (including the nested care pass). A
  record created by the infection loop and deleted by care is in NEITHER
  map → no onset, no end. The wrapper's same-tick-turnover handling
  (name-change diffing) cannot see it: there is no name change, the
  record simply never appears.
- Drop point 2 — the `villagerCareTick` wrapper: captures `before` =
  daysLeft map at care entry — the record EXISTS then (created earlier in
  the tick) — but the diff loop only logs `after && after.daysLeft <
  before[vid]`. A deletion (`after` undefined) is silently skipped. The
  cure event is dropped HERE even though the wrapper observed the record.

WHY NOTHING ELSE IN THE CORPUS SAVES IT (verified, not assumed):

- Snapshots: the daySeries snapshot is taken in `policy.daily`
  (sweep-feveranat-a.js `policy.daily` wrapper), which runDays
  (scripts/sim-harness.js:574) calls BEFORE `Game.sleep()` — and sleep
  runs endDay, which runs the tick. A record created and deleted inside
  the endDay tick never appears in any snapshot. Confirmed by code order.
- Say-lines: the cure DOES say a line (cureIt, game.js:33153), but the
  corpus keeps only a 20-line rolling window attached to events. Grep over
  all 8 after-leg feveranat files for every cure-line phrase ("cured
  them", "is going to make it", "pharmacy stores"): ZERO occurrences.
  No cure line survives into the corpus.
- Memories / bonds / counters: `remember()` and `bondAdd()` live in game
  state, not in the corpus; the `medicDutyCures` counter is read ONLY by
  the medicduty recorder (into dutyDays[].dutyCures), never by the
  feveranat recorder.

## Reproduction (current recorder, pre-fix corpus)

Analyzer on the medicduty corpus, before the fix (both analyzers re-run
2026-11-09 on this tree, base 8cee6a8d2):

- `node scripts/analyze-feveranat-a.js evidence/2026-11-08/medicduty-a-corpus/after`:
  cured-episodes=3 (cureEvent 0, cured-end 0, duty-snapshot 3), dutyCure
  events observed=0. F1 episodes=141.
- Same, before leg: cured-episodes=0.
- `node scripts/analyze-medicduty-a.js --before .../before --after .../after`:
  AFTER curedEpisodes=3 totalDutyCures=33 sameTickCures=30 (careCoverage
  39.4%); BEFORE 0/0/0. VERDICT: GO (its own gates).
- Per-seed duty cures (after leg, last-day cumulative counter):
  96301: 10, 96302: 0, 96303: 7, 96304: 8, 96305: 0, 96306: 0, 96307: 8,
  96308: 0. Total 33, all ability-channel (medicine 0).

So the miss is confirmed as stated in the brief: 3/33 captured, 30 missed,
and the miss is structural FOR THE OLD CORPUS — the analyzer fix alone
changes nothing on it (see "Analyzer fix is inert on the old corpus"
below). The old corpus cannot be repaired retrospectively; the fix is
prospective, and the GO bar is judged on a fresh run (see Fresh run).

## The fix (scripts/ only, no src/js diff)

### 1. Recorder: care-wrapper deletion logging (sweep-feveranat-a.js)

The `villagerCareTick` wrapper now captures full record copies at care
entry (name, daysLeft, severity) plus the duty holder id (pure read of
`Game.medicDutyHolder()`), and after the call logs, for every vid present
at entry and gone at exit, a treatEvent:

`{ day, kind: 'dutyCure', who, whoName, diseaseName, diseaseId,
   daysLeftBefore, holder, medics }`

It logs NO sickEnd (the tick wrapper already logs the 'recovered' end for
multi-day cures; a second end would orphan-pair). The existing
'villagerCare' tend event is unchanged in shape. The tick wrapper itself
is unchanged in behavior (comment only, pointing at the care wrapper as
the same-tick capture path).

Why this hook is the right one: the care wrapper is the ONLY observer
that sees the record while it exists — at care entry it is alive with its
name and daysLeft, and its disappearance by care exit has exactly one
cause in code (the duty cure; the tend path only decrements). No new RNG,
no Game-state writes: full-record copies and medicDutyHolder() are pure
reads, and the wrapper only appends to the external event array. The
neutrality proof (below) verifies the trajectory is untouched.

### 2. Analyzer: dutyCure join + synthesis (analyze-feveranat-a.js)

In `buildEpisodes`, after the cureEvent / cured-end handling:

- JOIN: each 'dutyCure' event joins the open episode for the same patient
  whose window contains the cure day (same who, same name/diseaseId) →
  cured, curedBy 'duty-cure-event'. Direct event evidence outranks the
  snapshot inference, so the snapshot rule now fires only when the episode
  is not already cured (guard added; inert on old corpora — a cureEvent /
  cured-end episode can never also carry a snapshot-qualifying
  'recovered' end).
- SYNTHESIS: a 'dutyCure' event that joined no episode synthesizes a 0-day
  cured episode (onsetDay = endDay = cure day, duration 0, outcome
  'cured', curedBy 'duty-same-tick', vector from the name). This inference
  is sound ONLY for the three names the infection loop creates ('wound
  fever', 'gut rot', 'tick fever') — their only creation site is that
  loop, which runs inside this same tick before care, so a cure event for
  one of those names with no onset anywhere can only be a same-tick
  infection+cure.
- UNRECORDED-ONSET: any other name (in practice 'radiation sickness',
  created by the UNWRAPPED feast-buff path, feastBuff.js:399) is counted
  as a captured cure with an unrecorded onset (`dutyCureUnrecorded`) — NO
  episode is synthesized, because its onset day is genuinely unknown.
  Its matching 'recovered' end (the tick wrapper's view of the same
  deletion) is reclassified as explained (`dutyCureEnds`), not orphaned,
  so G3 does not fail spuriously on a corpus containing one.
- F4 now prints the curedBy breakdown including duty-cure-event and
  duty-same-tick, plus a DUTY CURES line (events observed, joined,
  synthesized, unrecorded-onset, ends explained) with the instruction to
  compare the event count against the game's own dutyCures counter.

### 3. Sibling analyzer kept consistent (analyze-medicduty-a.js)

`episodesOf` mirrors the same join + synthesis, so the two analyzers agree
on a fixed-recorder corpus. Its `sameTickCures` (total − curedEpisodes)
now counts ONLY unrecorded-onset cures; on a pre-fix corpus it still
reports the old 30, because the old recorder logged no dutyCure events.
No proof test pins sameTickCures (verified by grep), and
test-medicduty-a.js still passes — 14/14 (adoption re-run 2026-11-09
16:00Z; the file carries one more leg than the worker's 13/13 — L7,
added by the 1315Z adoption, pins repeat same-tick cures on different
days each synthesizing an episode).

## Analyzer fix is inert on the old corpus (structural proof)

Re-ran the FIXED analyzer on the pre-fix medicduty corpus (same command as
Reproduction, after the fix):

- After leg: cured-episodes=3 (duty-snapshot 3, duty-cure-event 0,
  duty-same-tick 0), dutyCure events observed=0.
- Before leg: cured-episodes=0.
- Medicduty analyzer on the old corpus: unchanged (3/33/30, VERDICT GO).

The analyzer adds nothing where the recorder logged nothing. This is the
structural finding the brief anticipated: the 30 same-tick cures are NOT
recoverable from the old corpus by any analyzer — they never persisted
anywhere observable in the recorded files. No number has been faked: the
old corpus still says 3, and the fix's capture is proven only on the fresh
run below.

## Fresh run (fixed recorder, same band)

Sweep (fixed recorder, base 8cee6a8d2, seeds 96301–96308, competent, 150d,
PLENTYDEPRI=1/DEPOSITGATE=1) → evidence/2026-11-09/sametick-a-corpus/
(8 competent + 8 bare + feveranat-a-summary.json, 6.9MB). Wall clock ~39
min under heavy box load (load ~15); per-seed compute 1.7–3.4s.

Per-seed (recorded leg):

| seed | days | end | rank | wave | deaths | dutyCuresTotal | dutyCure events |
|------|------|-----|------|------|--------|----------------|-----------------|
| 96301 | 143 | village-lost | regional | 5 | 20 | 17 | 17 |
| 96302 | 97 | village-lost | regional | 4 | 13 | 0 | 0 |
| 96303 | 81 | village-lost | regional | 4 | 13 | 7 | 7 |
| 96304 | 75 | village-lost | village | 4 | 16 | 1 | 1 |
| 96305 | 81 | village-lost | regional | 4 | 18 | 0 | 0 |
| 96306 | 97 | village-lost | regional | 3 | 16 | 0 | 0 |
| 96307 | 134 | village-lost | regional | 5 | 16 | 18 | 18 |
| 96308 | 80 | village-lost | village | 4 | 9 | 0 | 0 |
| BAND | — | — | — | — | 121 | **43** | **43** |

Analyzer on the new corpus (`node scripts/analyze-feveranat-a.js
evidence/2026-11-09/sametick-a-corpus`, exit 0):

```
CONTEXT: produced=12,555,004 need=12,709,744 produced/need=0.988
  starvation deaths (villager)=5
WALL: national=0/8 table=0 wins=0 waveReach={"1":8,"2":8,"3":8,"4":7,"5":2}
  medianSurvival=89d max=143d
F1 INCIDENCE: episodes=181 (NPC 158, scholar 23); per-seed 31/35/21/11/27/12/25/19
F2 DURATION: closed 180, open 1 (23 reconciled via deathRows); median 3d mean 2.9d max 12d
F3 VECTOR: tick 110, wound 38, unattributed 18, unsafe food 10, food 2, dirty water 2, raw food 1
F4 TREATMENT: treatEvents by kind={dutyCure:43, villagerCare:24, sickRest:1}
  episodes treated=62/181; cured-episodes=43 (cureEvent 0, cured-end 0,
  duty-snapshot 0, duty-cure-event 0, duty-same-tick 43)
  DUTY CURES: dutyCure events observed=43 (joined 0, synthesized same-tick
  43, unrecorded-onset 0, ends explained 0) — game-counter
  totalDutyCures=43; capture 43/43 (missed 0)
G2 NEUTRALITY: PASS — recorded == bare on all 8 seeds
G3 CORPUS: FAIL — s96301 + s96302 scholar radiation_sickness onsets
  unaccounted (see Metric review; pre-existing snapshot gap, not this fix)
G4 CLASSIFICATION: 181 episodes, 18 honestly unattributed (scholar
  radiation onsets with no source string — see Metric review)
DIAGNOSIS VERDICT: COMPLETE — 181 episode(s) classified
```

**PRIMARY: GO — capture 43/43 (missed 0), bar was ≥ total−1 (42).**
Every duty cure the game counter recorded, the care wrapper observed, and
the analyzer counted as a cured episode. All 43 are same-tick syntheses;
ZERO multi-day duty cures occurred on this run (the join path, curedBy
'duty-cure-event', fired 0 times live — it is proven synthetic-only by
test-sametick-a.js L2; the old corpus's 3 snapshot cures prove multi-day
cures exist in the wild on other trajectories). No unrecorded-onset cures
(no radiation-sickness duty cure occurred).

Per-seed arithmetic closes exactly (checked): episodes == onsets +
synthesized on every seed (e.g. 96301: 14 onsets + 17 synthesized = 31;
96307: 7 + 18 = 25), and every onset is paired, ended, or reconciled via
deathRows.

Trajectories differ from the old corpus (median 89d vs 128d; 96304 75d vs
150d) — different base, expected; the GO bar is a within-run ratio, not a
cross-base comparison. The wall is unchanged in kind: national 0/8, table
0, wins 0 (the scale wall stands; this arm is an instrument fix, not a
lever).

## Proof tests

- scripts/test-feveranat-a.js: 11/11 PASS, 0 FAIL (re-run after the fix,
  2026-11-09; L1–L11 all green). Re-run again after the G2-fallback edit
  (below) — still 11/11.
- scripts/test-medicduty-a.js: 14/14 PASS, 0 FAIL (adoption re-run
  2026-11-09 16:00Z; the worker's 13/13 from 2026-11-09 11:05–11:22 UTC
  plus L7, added by the 1315Z adoption for repeat same-tick cures; L5
  live leg s96301 daysAlive=143, s96302=97 on the current base —
  trajectories differ from the old corpus as expected).
- scripts/test-sametick-a.js (new): L1 synthetic synthesis, L2 synthetic
  join + snapshot precedence + defensive no-double-count case, L3 synthetic
  unrecorded-onset — 3/3 PASS. L4 live leg (seed 96301, 150d; pins 17
  dutyCure events and dutyCuresTotal 17 from the committed corpus file;
  asserts accounting identity, determinism, bare==recorded neutrality),
  L5 corpus leg (≥32/33-equivalent on the new corpus: asserts capture
  ≥ total−1 per seed and band) and L6 agreement leg (in-process
  episodesOf vs buildEpisodes per-seed agreement + sameTickCures ==
  unrecorded count) — ALL PASS, run 2026-11-09 by the main-session
  adoption (sim-sametick-adopt-a; log evidence/2026-11-09/sametick-a-test-run.log):
  L4 17/17 duty cures (joined 0, synthesized 17, unrecorded 0,
  daysAlive 143, deterministic, bare==recorded); L5 new corpus 43/43
  (duty-same-tick 43), old corpus still 3; L6 curedEpisodes 43 on both
  analyzers, sameTick/unrecorded 0. **test-sametick-a.js: 6/6 PASS, 0 FAIL.**

## Neutrality proof

- Full-run G2 (analyzer, new corpus): **PASS — recorded == bare on all 8
  seeds** (fingerprints: daysAlive, end, deaths, meals, onsets, ends,
  treats, won). The bare logs match the recorded legs seed by seed
  (143/97/81/75/81/97/134/80 days; 20/13/13/16/18/16/16/9 deaths).
  The recorder is a pure read: no trajectory change.
- One fix was needed to READ the neutrality proof, not to pass it: the
  analyzer's G2 looked only for `sweep-competent.json` in the corpus dir,
  but a multi-recorder corpus names the summary `feveranat-a-summary.json`
  (the sweep's OUT). Added a fallback to that name when the single name is
  absent (content shape identical: `{ rows: [{ fingerprint }], bare }`).
  After the fallback, G2 passes on the new corpus AND on the old
  medicduty corpus (previously NOT CHECKED there — now verified PASS on
  all 8 seeds of the old corpus too, with cured-episodes still 3).
- test-feveranat-a.js L6 (5d smoke, bare==recorded) passes; test-sametick-a
  L4 re-proves determinism + bare==recorded on a 150d live leg — PASS
  (17/17 duty cures, deterministic; adoption re-run 2026-11-09).

## Metric review

- **GO bar (primary): met — 43/43 duty cures captured (missed 0), bar
  ≥42.** The denominator is the fresh run's own game counter (43, not
  the old 33 — different base, different trajectories). Zero misses needs
  no per-miss justification.
- **Neutrality: met — G2 PASS on all 8 seeds, both corpora.**
- **Secondary (analyzer agreement):** the feveranat analyzer and the
  medicduty analyzer both read the new corpus's dutyCure events; the
  agreement leg (L6) checks per-seed cured-episode agreement between
  `buildEpisodes` and `episodesOf` — PASS (43 cured episodes on both
  analyzers, sameTick/unrecorded 0; adoption re-run 2026-11-09). The medicduty
  analyzer on the OLD corpus still reports 3/33/30 (GO), unchanged.
- **G3 CORPUS: FAIL on the new corpus — pre-existing gap, NOT caused by
  this fix.** s96301: 8 unaccounted scholar `radiation_sickness` onsets
  (d128/129/131); s96302: 10 (d65/67/69). Mechanism: `radiation_sickness`
  is absent from the sweep's DISEASE_IDS roster, so the scholar's
  radiation entries never appear in the `scholarSick` snapshots G3 checks
  against — a scholar radiation onset can never be accounted for. The old
  corpus failed G3 the same way (s96301 scholar d20 wound_fever, a
  different instance of the same class: an onset the snapshot roster
  cannot show). Fix belongs to whoever owns the scholar-snapshot
  instrument (add radiation_sickness to the roster, or exempt
  un-snapshot-able diseases in G3); it is out of this arm's scope and
  fixing the sweep now would not fix the already-recorded snapshots.
  The 18 F3-unattributed episodes are the same population: scholar
  radiation onsets via `contractDisease('radiation_sickness', {})` with
  no source string — vector 'unattributed', honestly listed.
- **Cosmetic (verified, not a defect):** the generic treat loop marks an
  episode treated for any same-patient event in its window without
  checking disease (NPCs). On s96304, Cormac's food-poisoning episode
  (d17–18, recovered naturally) carries kind `dutyCure` because a wound
  fever was infected and cured same-tick on d18 — the same day, the same
  patient, a different disease. The wound-fever cure is correctly
  synthesized as its own episode; no cure is double-counted
  (cured-episodes still 43). The treat-kind histogram can over-attribute
  by one in such same-day turnovers; cured counts are unaffected.
- **Coverage note:** the join path (multi-day duty cure, curedBy
  'duty-cure-event') fired 0 times on this run — all 43 cures were
  same-tick. It is proven synthetic-only (L2). Any future arm that needs
  a live multi-day cure should look for it on a longer-lived band.
- **Substitution, documented:** the medicduty sweep was NOT re-chained
  over the fresh run (time-boxed under load). Ground truth for the fresh
  run is the in-sweep `dutyCuresTotal` counter read (the same field the
  medicduty recorder reads, written by the fixed sweep itself at run
  end). The independent-recorder cross-check (a second sweep reading the
  same counter) is deferred as follow-up; the L6 agreement leg checks
  analyzer agreement instead.

## Convergence state

- Axis food-economy, blank #3 (same-tick recorder gap): FIXED PROSPECTIVELY
  (recorder + analyzer + sibling analyzer), proof: 43/43 captured on a
  fresh run of the same band, G2 neutrality PASS on all 8 seeds.
  The pre-fix corpus remains structurally blind (3/33) by design — no
  retrospective repair exists.
- Next arm needing episode counts for a cure build can now use the fixed
  recorder; it must re-record (fresh sweep), not re-read the old corpus.

## Village assessment in plain words

This arm changed no game rules — only the instrument that watches
sickness. What the fresh villages show: all eight villages died out
(village-lost, 75–143 days, median 89), none reached national standing or
the table, two reached the fifth wave. Sickness itself is survivable more
often than it was recorded before: the village healer on duty cured 43
people, every one of them in the same day they fell sick — before this
fix, 30 of 33 such cures were invisible to the record, so the healer's
work looked almost non-existent (3 cures) when it was actually the most
reliable thing in the village. The medicine still works the way it did;
we can finally see it working. The villages still die for the same
reasons as before — the wild, contests, and monsters (63/7/10 of 121
deaths), not sickness (13) — so this fix changes what we can measure,
not how the villages fare.

## Blanks filled or documented

- FILLED (built + proven): same-tick duty-cure capture — the care wrapper
  observes every duty cure, including same-tick ones; the analyzer joins
  or synthesizes them into episodes. Fresh run: 43/43 captured, G2
  neutrality PASS.
- DOCUMENTED (structural): the pre-fix medicduty corpus cannot yield its
  30 same-tick cures to any analyzer — no onset, no end, no event, no
  snapshot, no say-line. The 30 live only in the medicduty recorder's
  dutyCures counter.
- DOCUMENTED (brief correction): the medheadcount corpus
  (evidence/2026-11-08/medheadcount-a-corpus/ + -after/) was never
  committed; the medheadcount evidence's corpus lines describe files that
  existed only in the reaped 0415Z worker tree. The fixture for this arm
  is the medicduty corpus.
- DOCUMENTED (creation-site census for v.sick, for the next recorder):
  villageSicknessTick infection loop (3 tick names, wrapped);
  villagerFoodPoisoning (food names, wrapped); feastBuff.js:399
  ('radiation sickness', UNWRAPPED — its cures land in the
  unrecorded-onset bucket, never as episodes).
