# sim-firstkiller-b — prereg (FIRST-KILLER SURVIVAL classification)

**Arm:** sim-firstkiller-b (run fleshout-loop-b-20261107T0530Z, Loop B, axis
scale-onramp / winnability chain, tracker 0420Z blank 4: first-killer
survival).
**Diagnosis only, zero src/js, no gate/price/deed/readyDemand change, no
lever built.** Loop A is live on sim-nextfight-a (NEXT-FIGHT SURVIVAL
lever build); this arm is classification only and does not touch its files.

## Question

What kills first killers, and where? The stageally-confirm2 re-run
(2026-11-07) left the pair forming through production speed, not
longevity: armed first-killer survival median 10.5d (spans 0, 1, 8, 13,
18, 19 across six seeds with killers) vs baseline 22d (spans 2, 10, 34,
38); the 19d bar still missed and the armed median LOWER than baseline.
Known trajectories on this band (confirm2 ledger): 53006 Adaeze killed
the Influencer day 52 as a companion, became scholar, killed the
Algorithm day 70, died the same day (+18d); gen_k1j6fdz killed day 99,
died day 111 (+12d); Sari killed the Timeslot day 126, died day 127
(+1d); gen_6httusd killed day 148, died day 149 (+1d); greta_hansen
lived 37d after her kill; gen_cowc2ja (3 kills) alive at end. 53007:
visjoin_81 killed day 103, became scholar day 114, died day 116 (+13d).
Killer-survivorship census (killersurvive-b, 24 villages, fresh bands
99641–99648 / 99681–99696) found the same shape at larger n: median
kill→death 7d, TB-fight deaths 77.4% (24/31), cause 'the wild' 67.7%,
0 same-chain deaths, partner alive at death 19%. This arm re-measures
the classification on the STAGED-vs-BASELINE pair (does the staging
policy change WHERE first killers die, not just how fast the second
killer arrives?) and publishes the split table as the answer.

## Method

- **Replay band 53001–53008, DELIBERATELY REUSED** (third measurement of
  this band: confirm-b, confirm2-b, now this arm — reuse documented, not
  hidden). No fresh band consumed; no freshness check needed because no
  new band is claimed. If any fresh band becomes necessary, the
  seed-band freshness check runs first (grep ALL dated preregs
  `evidence/*/sim-*-prereg.md` plus the forbidden-band lists — a band
  named in any prior prereg is not fresh).
- **Legs:** baseline = `scripts/policies/competent.js` verbatim
  (`POLICY=baseline`); staged = `scripts/policies/competent-stageally-a.js`
  UNMODIFIED (`POLICY=staged`). Both legs 150d, death-aware horizon
  (runDays ends on village death / win), identical seeds.
- **Recorder:** `scripts/firstkiller-driver-20261107.js` — a copy of the
  stageally driver (same harness, same say-wrapping, same rally/stage
  stats resets) with the stageally instrument installed VERBATIM and
  the per-seed `firstKillers` table embedded at write time from the
  run's own records. Corpus: `evidence/2026-11-07/perseed-firstkiller-b/`
  (16 files, prefix `firstkiller-s<seed>-firstkiller-<policy>.json`).
- **Recorder rule (pyrrhic lesson, sim-pyrrhic-b):** first-killer
  fates are built from `state.waveKillLog` read at finalize — the
  authoritative log, which INCLUDES the pyrrhic direct-write path
  (`recordPyrrhicKill` bypasses `recordWaveKill`) and kills whose
  fight never closed through tbEnd. NEVER from `killsLive` (the
  `recordWaveKill` wrapper) or from tbEnd outcomes alone. A kill in
  the log with no live row still makes its killer a first killer;
  `liveMissing` is reported, never silently filled.
- **Classifier:** `scripts/firstkiller-analyze-20261107.js` (pure,
  reuses `killerdeath-analyze-20261105.killerFates` +
  `killersurvive-analyze-20261106.deathChannel`, with two taxonomy
  splits added — see below). For EVERY first killer (first wave-4+
  kill by that villager, per seed, per leg) it records: kill day /
  wave / monster / via, death day, death cause channel (quoted death
  record: the raw scholarDeaths row and/or fallen row), days between
  kill and death, scholar-at-death or not (a scholarDeaths record for
  that villager on the death day), scholar-at-kill or not
  (killsLive scholarChannel / via 'player'), and whether the killer
  was alive at the horizon (censored, not dead).
- **Second-killer production timing (secondary, confirms the
  production-speed shape):** per seed, gap in days from the first
  wave-4+ kill (any killer) to the first wave-4+ kill by a DIFFERENT
  killer, and to the second wave-4+ kill overall.

## Death-channel taxonomy (channels, in priority order)

1. `arena-bout:<mid>` — scholarDeaths causeArg is 'the arena' (arena
   bout TB fight; SPLIT OUT from TB-fight, unlike killersurvive-b
   which folded arena bouts into TB-fight — this brief names the arena
   as its own channel).
2. `TB-fight:<mid>` — TB fight row on the death day with
   scholarDiedInFight, killer was the scholar (scholarDeaths row same day).
3. `field-fight:<mid>` — field fight row on the death day in which this
   villager died (outcome vDie / died / scholar-died).
4. `contest` — scholarDeaths causeArg 'contest', not in combat.
5. `starvation` — scholarDeaths causeArg or fallen cause naming
   starvation / hunger / thirst (matched case-insensitively; the exact
   matched string is quoted in the record).
6. `at-home-not-combat` / `on-road-not-combat` — scholar death, not in
   combat, at Haven vs away.
7. `fallen-monster:<name>` / `fallen:<cause>` — fallen record with a
   killing monster / literal cause.
8. `unmatched` — no record explains the death day. Counts AGAINST the
   primary metric (unclassified).

Channel detail always quotes the death record (scholarDeaths row and/or
fallen row JSON, truncated to the cause/location/combat fields).

## Primary metric (binding)

- **Coverage:** ≥80% of first-killer deaths classified (channel ≠
  'unmatched'), pooled across both legs. First killers alive at the
  horizon are censored, not deaths, and do not enter the denominator.
- **DIAG-GO** iff coverage ≥80% AND one channel holds ≥50% of
  classified first-killer deaths (pooled across legs; per-leg shares
  reported alongside, never instead).
- **DIAG-NO-GO on single-channel** iff coverage ≥80% but no single
  channel reaches 50% — the verdict is then the published split table
  as the answer (no dominant channel is itself the finding).
- **Coverage <80% is a NO-GO on the instrument**, not on the
  question — the recorder failed, the verdict is void, the next run
  fixes the recorder.
- On DIAG-GO, the verdict names the lever the dominant channel
  implies (or flags Steve-call if the implication needs his ruling).
  No lever is built in this arm.

## Secondaries (reported, never judged)

- First-killer kill→death median per leg (armed vs baseline) and the
  full span lists; censored (alive-at-end) first killers counted
  separately.
- Second-killer production gap per seed, per leg (median + spans).
- Wall numbers every run: national / table / wins, wave 4–5 unlocks
  and faced, median survival.
- Sense-test read: at least one first-killer death transcript read in
  full (deathSays + burial beats) and judged for meaning/coherence.

## Staging

- Stage-0 smoke to /tmp (seeds 53001–53002, 60d, staged leg): unjudged
  verification that the driver engages (invites/rally/kills present,
  0 instrument errors, determinism byte-identical on repeat,
  neutrality off-vs-on identical on days/end/kill-log length). The
  smoke seeds are in the judged band; the smoke is unjudged and the
  judged legs re-run them from scratch with the frozen driver.
- Pilot gate: the band IS 8 seeds — the judged run is the pilot (8+8).
  No confirm spend exists beyond the band; a confirm on a fresh band
  is a NEXT-run decision, not this run's.
- Proof `scripts/test-firstkiller-20261107.js` green BEFORE the judged
  run and after every rebase. It covers: every channel classifier
  branch (arena, TB, field, contest, starvation, at-home, on-road,
  fallen-monster, fallen-other, unmatched), the pyrrhic log-read
  (kill in waveKillLog with no killsLive row still yields a first
  killer with a classified death), second-killer gap computation
  (including no-second-killer censored seeds), and live smoke legs
  to /tmp (install, wave-4 traces, 0 errors, determinism,
  neutrality).

## Measurement rules applied

- Pre-registered metrics bind this run (§14). A miss is NO-GO, never
  re-scored against a friendlier metric mid-run. If the metric proves
  wrong, it is written under "metric review" in the evidence file and
  a revision proposed for the NEXT run. Every evidence file carries a
  "metric review" section.
- Balanced panel (§15): DIAG arms take no panel — there is no
  before/after Game change to compare (policy A/B on identical seeds
  is the comparison; the analyzer output is the paired comparison).
  No compare `.md` is fabricated.
- Telemetry: `node scripts/telemetry-check.js --baseline
  .../telemetry-baselines/scale-wall.json --current
  'evidence/2026-11-07/perseed-firstkiller-b/*.json' --metrics
  national,table,wins,exiled` is attempted; the recorder-corpus
  refusal (top-level anchorCommit rows) is the expected result and is
  recorded as the result, same as every prior killer-chain arm.
- Determinism cross-check: `src/` is byte-identical between the
  confirm2 anchor (74059c4daf8a) and this worktree's HEAD (41007b9d4)
  (`git diff 74059c4daf8a HEAD -- src/` empty), so the replay is
  expected to reproduce the confirm2 corpus headline numbers
  (days / endReason / wave-4+ kill counts per seed per leg). Any drift
  is reported as a finding (master movement on an evidence-only
  delta), not silently absorbed.

## Canon

docs/CANON.md read first; docs/MONSTER-WAVES.md (wave law, readiness
bars, veteran definition) and docs/CONTESTS.md (contest/arena death
channels, 'the arena' causeArg) read for this area. No canon doc covers
the first-killer death taxonomy itself — the taxonomy above is this
arm's instrument, not canon.

## What this arm does NOT claim

- Not a fix: no game code changes, no lever built. The dominant
  channel, if any, names the next lever; it does not test it.
- Not a re-judgment of stageally-confirm2 GO, killersurvive-b
  DIAG-GO, or the nextfight lever: those verdicts stand as measured.
- Not a fresh band: 53001–53008 is reused deliberately; band-level
  verdicts do not generalize beyond it without a fresh-band confirm.
- Not a field-fight census: field deaths are classified only when a
  first killer dies in one; the field channel's zero is a count, not
  a proof of absence elsewhere.
