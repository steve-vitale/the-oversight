# sim-nationalsticky-b — DIAG: is reached-national lost, and how? (ADOPTION RUN)

Run: fleshout-loop-b-20261117T0330Z (Loop B), arm sim-nationalsticky-b
Axis: winnability chain. Findings backlog #2452 ("NATIONAL IS NOT
STICKY: ONE POINT OF TRUST DRIFT COSTS THE SCALE"), from
evidence/2026-11-16/sim-seasoning-b.md §National is not sticky.
Branch: sim-nationalsticky-b — worktree
~/workspace/worktrees/sim-nationalsticky-b
Date: 2026-11-17 (adoption worker finishing the dead worker's run).
Type: DIAG — instrument + measured loss distribution. No game change,
no default flipped, no lever. No balanced panel (DIAG, no game change
— the neutrality proof D1/D2/D3 is the panel's substitute, as in
seasoning / medicduty).

## Prereg (frozen, carried over verbatim)

- Policy: competent verbatim (`scripts/policies/competent.js`),
  sha256 `df9b7dff4de498779655b04db29782023840d8b2a4ed19a0ecbe86db9c71438c`
  (verified by the proof script, S2).
- Seeds: fresh shared band 103011–103018 (8 seeds × 2 legs = 16
  configs), 200d death-aware. OFF leg = recorder off, ON leg =
  recorder on; the legs differ ONLY by the `NATIONALSTICKY_RECORDER`
  env flag. Anchor commit ec114659f for both legs (same commit; the
  env flag is the leg). `src/` diff zero (proof S1/S1b).
- GO bars (combination rule: GO requires G1 AND G2 AND G3 AND G4;
  any FAIL = NO-GO, never re-scored): G1 instrument validity
  (16/16 complete JSONs, every transition classified, unknown 0);
  G2 proof green (test-nationalsticky-b.js 35/35 on the instrument
  tip); G3 measurement (≥3 reached-national seeds with loss/retention
  classified, else DIAG-NO-GO on power); G4 wall numbers reported for
  both legs.
- Canon note (from the prereg, not invented): no CANON-registered doc
  covers the standing / scale system specifically. The lapse rule is
  quoted from code only (hierarchy.js `_linkSeasoned` / `_checkNational`
  / `_havenPolity`).

## Verdict: DIAG-NO-GO on power — 0/8 reached national on either leg

| Bar | Result | Verdict |
|-----|--------|---------|
| G1 instrument validity | 16/16 complete JSONs, 0 incomplete days, 0 instrument errors, 0 unknown lapses, 0 verb mismatches; every nationalLive transition classified (there were none) | GO |
| G2 proof green | `scripts/test-nationalsticky-b.js` 35/35 on the final tip (see Infrastructure — two redirect attempts hit the write flap, direct runs passed 3×) | GO |
| G3 the measurement | **0 reached-national seeds** (need ≥3) — no reach, no lapse, no re-stage on either leg | **FAIL → DIAG-NO-GO on power** |
| G4 wall numbers | Wall table reported for both legs (identical) | GO |

The instrument is valid and the recorder is neutral (D2 full-band:
0 divergences over all 8 seeds). The question could not be answered
because its precondition never fired: competent verbatim never reaches
national on this band, so there is no loss distribution to measure.
This is the prereg's stated risk, realized exactly as written — not a
re-score and not a reason to switch policy mid-run. The loss
distribution for #2452 still exists only on the courtship road
(seasoning: 4/8 reached, 4/8 lost).

## Per-seed table (OFF and ON legs identical — see drift check)

No seed reached national, so there are no lapse or re-stage rows.
"Link" is the village's single link; "seasoned days" is days the link
counted as seasoned (age 30+ AND trust 40+).

| seed | end | days | maxWave | standing (gated/raw) | w4 kills | deaths | link (formed) | trust form→max→end | seasoned days |
|------|-----|------|---------|----------------------|----------|--------|---------------|--------------------|----------------|
| 103011 | village-lost | 194 | 5 | 580/580 | 5 | 84 | village_2 (d57) | 30→48→26 | 50 |
| 103012 | village-lost | 121 | 4 | 199/265 | 1 | 73 | village_0 (d43) | 30→32→15 | 0 |
| 103013 | village-lost | 183 | 5 | 410/410 | 4 | 90 | village_spl_25_91849 (d54) | 30→68→56 | 99 |
| 103014 | village-lost | 152 | 4 | 199/250 | 3 | 102 | village_1 (d41) | 30→47→38 | 26 |
| 103015 | survived | 200 | 5 | 325/325 | 4 | 75 | village_0 (d45) | 34→55→20 | 89 |
| 103016 | survived | 200 | 4 | 199/415 | 6 | 75 | village_0 (d40) | 30→48→30 | 68 |
| 103017 | survived | 200 | 5 | 375/375 | 5 | 79 | village_0 (d42) | 30→38→20 | 0 |
| 103018 | village-lost | 161 | 5 | 320/320 | 4 | 101 | village_3 (d28) | 30→54→34 | 34 |

Totals (both legs): reached 0, lost 0, held 0, lapses 0, unknown
lapses 0, verb mismatches 0, instrument errors 0, wave-4 kills 32,
deaths 679, survived 3/8.

## Why national never formed — the mechanism, measured

The blocker on this band is **link count, not standing and not
trust**:

- Every village formed exactly **one** link, ever (formed d28–d57,
  trust 30 at formation — the peer-link floor). No village ever had
  two links at once. `nCounted` (links counted toward a polity) was
  **0 on every day of every seed**.
- The shape candidates (`polityOf('haven')`, `_belongPolity`,
  `_covenantPolity`, `_tradePolity`) were **null on every day of
  every seed**; `havenPolity` was always null; `pendingNational`
  was never set. The staging check never had anything to stage.
- A covenant polity needs ≥3 seasoned links; the villages had at
  most 1 seasoned link at a time (6/8 seeds seasoned their single
  link for 26–99 days; 103012 and 103017 never seasoned it — trust
  peaked at 32 and 38).
- Standing is NOT the blocker here: raw standing ≥200 on 8/8 seeds,
  gated standing ≥200 on 5/8 (the other three sit at the regional
  gated cap of 199 while raw reads 265/250/415 — the same
  gated-vs-raw divergence seasoning reported, in the same direction).
  Villages can clear the standing bar and still have no polity to
  stage, because standing never gates the polity — `_havenPolity`
  reads seasoned links only.
- The #2452 drift engine is alive on this band even though it has
  nothing to break: trust wanders hard after formation (103011:
  48→26 across the tail; 103015: 55→20; 103012: 32→15). Competent
  tends 0 accords, so a single link's trust is left to drift. If a
  second and third link ever formed, the seasoning lapse pattern
  (one point of drift costs the scale) would be waiting for them.

In plain words: the villages are strong enough on standing and kill
enough wave-4 beasts (32 kills, wave 4 reached on 8/8, wave 5 on
5/8), but they only ever make one friend-village, and one friend
cannot make a nation. The scale wall on competent verbatim is a
diplomacy wall — link formation — a step before the stickiness
question this DIAG was built to answer.

## Lapse causes

None to report — zero lapses because zero reaches. The cause
taxonomy (trust-drift / link-loss / both / unknown, + standing-fall
co-occurrence) is proven working by the proof script's D3 synthetic
corpus (including the seasoning 45→39 trust-drift re-derivation),
but no lapse in this corpus exercised it. No lapse had a
standing-fall co-occurrence to record, because no lapse occurred.

## Wall numbers (both legs identical)

| | OFF | ON |
|--|-----|-----|
| n | 8 | 8 |
| national by standing (gated ≥200) | 5 | 5 |
| national by standing (raw ≥200) | 8 | 8 |
| national by scaleRank | 0 | 0 |
| national ever (nationalLive) | 0 | 0 |
| table | 0 | 0 |
| wins | 0 | 0 |
| wave-4 unlocked ever | 8 | 8 |
| wave-5 unlocked ever | 5 | 5 |
| wave-4 kills | 32 | 32 |
| deaths | 679 | 679 |
| survived to horizon | 3 | 3 |
| median survival (analyzer) | 194 | 194 |
| max survival (analyzer) | 202 | 202 |

OFF-vs-ON drift check: **0 divergences** over the full band
(day, nationalLive, scaleRank, standing raw, pop, waveKills per
seed; analyzer `drift.divergences: 0`, all 8 seeds `identical`).
The recorder moved nothing.

## Sense-testing

No lapse line and no re-stage line fired — none could, since
national was never reached. That silence is not itself a finding
(no lapse occurred to be silent about). What the say record does
show:

- The fiction never mentions national, a First Court, or a Founding
  Council on any seed. The 28 regex hits for `national|…|Binding`
  are all false positives: the loot item "Rage Bindings" and the
  trader word-lines about *other* villages binding (e.g. 103011
  d79: "Word comes late, through traders: Thornfield and The Red
  Table have bound together — Thornfield primary"). The world does
  form bonds elsewhere; Haven's villages watch it happen and never
  join in — a coherent picture of a village that is strong and
  alone, not a silent bug.
- Trust is visible to the player only as rejection: the early
  "Trust too low" conversation refusals ("Why should I listen to
  you?") are the only trust language in the record. Nothing in the
  fiction tells the player their one link's trust is drifting
  (48→26 on 103011) or that a second and third link are what the
  nation needs. If the polity ever forms, the player will have had
  no warning that link count is the gate.
- No villager behavior in the record looks robotic about scale: the
  villages simply never attempt diplomacy beyond the single link.
  That is the competent policy's shape (1 link, 0 tends, 0 accords),
  not a villager acting out of character.

## Metric review (prereg questions, answered — no re-scoring)

- **Did the 200d horizon buy reach-plus-loss room?** No — reaches
  never landed at any day, so the horizon was not the constraint.
  The 200d run bought the link-trust traces (drift visible to d194)
  instead.
- **Was competent verbatim the right policy?** No, for this
  question. The loss distribution only exists on the courtship road
  (seasoning's 4/8 reached). Retest for the NEXT run: courtship
  deeds on a fresh band (the seasoning band 102201–102208 is spent;
  do not reuse it), or a policy that forms ≥3 links. Do NOT extend
  this run.
- **Did any lapse carry a standing-fall co-occurrence, or lack a
  link cause?** No lapses at all; the question is unmeasured, not
  answered.
- **Did the OFF leg reproduce the ON leg's trajectories exactly?**
  Yes — 0 divergences, all summary fields identical per seed. The
  recorder is neutral on the full band, not just the 60d proof.
- **Is "days lapsed until re-stage" the right holding-cost unit?**
  Unmeasured — no lapse, no re-stage. The machinery-loss cost
  (pool/tariff/calls cleared on lapse) remains an open question for
  the courtship retest; the seasoning re-stagings (2–14d) suggest
  days understate it, but this corpus cannot say.
- **G3 bar review:** the ≥3-reached bar did its job — it stopped a
  zero-event corpus from being dressed up as a loss distribution.
  Keep the bar for the retest.

## Infrastructure

- **DEVIATION (dead worker's OFF leg, verified, not taken on
  faith):** the 6 existing files in
  `evidence/2026-11-16/perseed-nationalsticky-b-off/` (seeds
  103011–103016) carried `recorderOn: true` with full daily series
  and captured say lines — the dead worker ran `MODE=off` WITHOUT
  `NATIONALSTICKY_RECORDER=off`, so the recorder defaulted ON
  (driver line 37: `RECORDER_ON = process.env.NATIONALSTICKY_RECORDER
  !== 'off'`). They were mislabeled recorder-ON corpora, not the
  prereg's OFF leg. Verified per file (`leg: off, mode: off,
  recorderOn: true`, sayLines 317–538 each) and moved, unaltered,
  to `evidence/2026-11-16/perseed-nationalsticky-b-off-MISLABELED/`
  with a README. Cross-check: those 6 files are trajectory- and
  say-line-identical to the properly-run ON leg for the same seeds
  (series signature + sayLines equal on 6/6) — a second, independent
  determinism confirmation, and proof the mislabeling was a flag
  omission, not a data corruption. The OFF leg was then re-run
  properly (`MODE=off NATIONALSTICKY_RECORDER=off`) for all 8
  seeds; the new files carry `recorderOn: false`, `sayLines: 0`.
- **Write flap:** two attempts to re-run the proof with stdout
  redirected into a fresh log file exited 1 with a 0-byte log; the
  same command with stdout to the terminal passed 35/35 three
  times. The proof log was written with the file tool instead.
  The flap is the known recurring host write refusal on fresh/empty
  files; nothing was lost.
- **Registry lock contention:** the mid-run heartbeat blocked ~9
  min on `REGISTRY.lock` (a sibling registration held it); the
  adoption worker killed only its own heartbeat child process, the
  heartbeat then landed, and the ON leg started unaffected. No
  sibling work was touched.
- **Box load:** the OFF leg took ~22 min and the ON leg ~30 min
  for 8×200d seeds each (siblings running parallel arms at the
  same time); both exited 0 with 8/8 files and 0 instrument errors.

## Village assessment (plain words)

Eight villages, all strong enough on paper — standing over the bar,
wave-4 beasts killed on every one, wave 5 reached on five — and not
one of them ever becomes a nation, because each only ever makes a
single friend-village and never tends even that one. Their one bond
slowly frays (trust sliding from the high 40s into the 20s) while
nobody notices, and the trader gossip shows other villages binding
together in the wider world while Haven stays alone. The blank this
run fills is a precise one: on competent play the scale wall is not
"national slips away" — it is "national never forms". The stickiness
question is still open, and it can only be measured where villages
actually reach national first.

## Next run (for the coordinator, not this run)

Retest the loss distribution on the courtship road with a fresh seed
band (seasoning's band is spent). The tend-drive lever
(#1918: let the drive run while national, tend to 55) still awaits
its precondition — this run confirms the precondition exists on
courtship and does not exist on competent. If the courtship retest
shows lapses again, the tend-drive retest has its measured ground.

## Files

- Evidence: `evidence/2026-11-16/sim-nationalsticky-b.md` (this file)
- Prereg: `evidence/2026-11-16/sim-nationalsticky-b-prereg.md`
- Analysis: `evidence/2026-11-16/nationalsticky-b-analysis.json`
- Analyzer log: `evidence/2026-11-16/nationalsticky-b-analyzer.log`
- Driver logs: `evidence/2026-11-16/nationalsticky-b-off-driver.log`,
  `evidence/2026-11-16/nationalsticky-b-on-driver.log`
- Proof re-run: `evidence/2026-11-16/nationalsticky-b-proof-rerun.log`
  (35/35, final tip)
- Corpora: `evidence/2026-11-16/perseed-nationalsticky-b-off/` (8),
  `evidence/2026-11-16/perseed-nationalsticky-b-on/` (8)
- Mislabeled corpus (kept, not used):
  `evidence/2026-11-16/perseed-nationalsticky-b-off-MISLABELED/`
  (6 files + README)
