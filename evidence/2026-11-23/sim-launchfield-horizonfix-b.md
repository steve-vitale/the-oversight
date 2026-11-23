# sim-launchfield-horizonfix-b — horizon-exclusion fix, re-judged (Loop B 0230Z)

**Verdict: DIAG-GO on completeness.** The clause extension closes
the exact band that failed: pilot 107439–107446 re-judges
unchanged (DIAG-GO, zero firings), confirm 107447–107454 flips
DIAG-NO-GO → **DIAG-GO** on exactly one firing — seed 107447,
visjoin_134/editor, day 150, parts 0–3, all `horizon-truncated`.
Reproduction exact 10/10 on both bands. No re-score: the frozen
bar is 0 unknown instance-days AND 0 unexplained Leg S parts on
BOTH bands, and both bands meet it.

**Run:** `fleshout-loop-b-20261123T0230Z`, arm
`sim-launchfield-horizonfix-b`. **Base (worktree):** master
`80e7da0bc`. **Frozen corpus base (unchanged):**
`4e805681a050f22672d479cf5e02b0d5700eb2c7`. Instrument-only
arm: analyzer + proof test amended; the driver is byte-identical
(option (a) needs no driver change) and **zero `src/js` changes**.
**No new sims, no legs re-run** — the amended analyzer re-reads
the EXISTING frozen corpora. Substrate (both bands, inherited):
`SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1
ALLYSLOT3=1 LAUNCHSURVIVE=1`, competent verbatim (policy sha
`1884c8852d38`), 150d death-aware, MODE=vre, recorder ON.

## What this arm fixes

sim-launchfield-horizon-b judged DIAG-NO-GO on completeness by
exactly one instance-day: seed 107447, visjoin_134/editor, day
150, parts 0–3, all `no-rows` — the holder-state sampler writes
zero rows village-wide on the final day, so the frozen horizon
clause (which needs >= 1 row that day) could not fire. This arm
freezes ONE option — **(a) CLAUSE EXTENSION** — and re-judges.
(b) SAMPLER FIX was rejected in the prereg: the driver refuses
legs unless the run-time merge-base IS the frozen base, and this
worktree's merge-base is `80e7da0bc`, so legs cannot be re-run
here by design; (b) is also the wider change (it alters what
every future corpus contains), while (a) answers the directed
question exactly — does this exact band now pass.

**The extended clause, frozen.** New shared predicate
`zeroRowFinalDayInfo(j, vid, day, hsCtx)` — true iff ALL of:
(1) `day === finalDay` (`j.gameDays || j.days`, not the literal
150); (2) zero holder-state rows village-wide that day (any vid,
any part/target/when); (3) >= 1 holder-state row for the vid on
`day - 1`; (4) no death record for the vid with `day <=
finalDay`. Day level: in `classifyUnknownDayH`'s `hs-no-rows`
branch, the predicate returns `hs-horizon-truncated` (explained,
counted per instance-day in `hHorizonTruncated` +
`horizonTruncatedDays`). Part level: in `applyPerPartLedger`'s
post-pass, a `no-rows` part at ANY part 0–3 of the final day
reclassifies `horizon-truncated` when the predicate holds. The
original p3-only rule (vid rows that day) is unchanged; the two
rules cannot double-fire. A final-day `no-rows` part/day where
OTHER vids have rows stays `no-rows`; a non-final-day zero-row
day stays unexplained; a `refresh-unexplained` stays unexplained;
a `field-encounter` still fires first.

## Frozen-bar table

| Bar | Pilot 107439–107446 | Confirm 107447–107454 | Verdict |
| --- | --- | --- | --- |
| (a) Completeness: 0 unknown instance-days AND 0 unexplained Leg S parts (horizon-truncated excluded/counted) | unknown **0**, unexplained parts **0** (horizonTruncated 0 parts / 0 days) | unknown **0**, unexplained parts **0** (horizonTruncated **4** parts / **1** day) | PASS both |
| (b) Leg R reproduces the 10 launcheng unknown days exactly | exact, 10/10 | exact, 10/10 | PASS both |
| (c) Instrument: proof green on the frozen base, analyzer selftest green, 8/8 files parse, 0 instrument errors, substrate assertions | proof 64/66 on this worktree (2 §1 failures BY DESIGN after the rebase — see Instrument), selftest 86/86, 8/8, 0 errors, substrate clean | same instrument, 8/8, 0 errors, substrate clean | PASS both |
| (d) Field-encounter fire count — REPORTED, not gating | day-level 2, part-level 0 | day-level 1, part-level 0 | reported |

**Overall: DIAG-GO.** The confirm band's single failing
instance-day is now the clause's one firing, described in full
below.

## Pilot band (107439–107446) — re-judged UNCHANGED

- Files 8, errors 0, anchor `4e805681a050` on every file, policy
  `1884c8852d38`, all 7 flags `1`, `allyslot3InSrc: true`.
- Instances 23 (candidate-not-bid 7, churn 3), instance-days 57, assessed
  days 35 (dawn 24, midday-only 11), assessed rows 35, zero-row days 22.
- Unknown instance-days **0** (B-unknown 3, H-explained 3, H-skip 0).
  hTally: hs-gate-pick 3. Mechanism DENIED.
- Leg S: parts 268, scored 41, explained-not-scored 227, **unexplained 0**,
  horizonTruncated **0** (the clause never fires — no zero-row final
  day needed it). whyNot: retargeted 20, chore-live 82, dead 5, seed-day 24,
  on-expedition 15, gate-pick 30, away 32, engaged 3, refresh-blocked 8,
  plan-deleted 8, scored 41.
- Launches counted 37, wave-4-target 27, uncounted 0, no-start-call 0,
  no-copy-link 0, first fights 6.
- Wall: wins 0, nationalRank 0, nationalStanding 3, table 0, wave4 8/8,
  wave5 3/8, medianDays 150, survived 4, deaths 812, starvation 1,
  standing199 3.
- Every count is byte-identical to the horizon-b pilot analysis —
  the amendment changed nothing on this band, as frozen.

## Confirm band (107447–107454) — DIAG-GO (was DIAG-NO-GO)

- Files 8, errors 0, anchor `4e805681a050` on every file, policy
  `1884c8852d38`, all 7 flags `1`, `allyslot3InSrc: true`.
- Instances 18 (candidate-not-bid 9, churn 0), instance-days 101, assessed
  days 78 (dawn 53, midday-only 25), assessed rows 79, zeroRowDays 23.
- Unknown instance-days **0** (was 1; B-unknown 9, H-explained 9,
  H-skip 0). hTally: hs-gate-pick 8, **hs-horizon-truncated 1**
  (hs-no-rows gone). Mechanism DENIED.
- Leg S: parts 404, scored 79, explained-not-scored 325 (was 321),
  **unexplained 0** (was 4), horizonTruncated **4**. whyNot:
  seed-day 27, away 19, gate-pick 52, refresh-blocked 9,
  chore-live 189, scored 79, engaged 2, **horizon-truncated 4**,
  scholar 12, dead 5, plan-deleted 4, retargeted 2.
- Launches counted 18, wave-4-target 18, uncounted 0, no-start-call 0,
  no-copy-link 0, first fights 9.
- Wall: wins 0, nationalRank 0, nationalStanding 2, table 0, wave4 8/8,
  wave5 2/8, medianDays 148, survived 4, deaths 853, starvation 2,
  standing199 6.
- Every count except the four reclassified parts and the one
  reclassified day is byte-identical to the horizon-b confirm
  analysis — the amendment moved exactly the failing
  instance-day and nothing else.

### The one firing

- **Seed 107447, visjoin_134 / editor, day 150, parts 0–3, all
  `horizon-truncated`.** The only firing on either band, at
  either level: `hHorizonTruncated` 1, `sHorizonTruncated` 4.
- All four guards hold, verified from the corpus (not assumed):
  final day is 150 (`gameDays` 150); zero holder-state rows
  village-wide on d150 (last row for ANY villager is d149;
  3637 rows span d69–d149); visjoin_134 has 12 holder-state
  rows on d149 (111 total, target `editor` only); no death
  record for visjoin_134.

## Field-encounter fires (bar (d), reported not gating)

- Pilot, day-level: 2 — 107439 app_mgpspkk2515/spoiler and 107445
  vasyl_shevchenko/reunion. Part-level (Leg S whyNot
  `field-encounter`): **0**.
- Confirm, day-level: 1 — 107454 visjoin_105/algorithm.
  Part-level: **0**.
- Unchanged from horizon-b: no mid-run part-level fire on either
  band. The fallback's whole observed fire history remains 4
  parts, all d150 p3.

## Sense-test read (real holder-days)

**The truncated instance, read end to end — visjoin_134/editor,
seed 107447.** The plan is seeded day 140 (wave-5 `editor`,
stage `party`) and still open at the horizon. Eight scored
dawns, every one `party-no-companion` with pool eligible 0.
The Leg S tally for the instance: seed-day 3, away 1,
gate-pick 4, refresh-blocked 1, chore-live 21, scored 8,
engaged 2, horizon-truncated 4 — 44 parts, 0 unexplained.

**Day 149, the last sampled day** — twelve holder-state rows,
all at Haven, all target `editor`: p0 part-start idle/done,
then a HAVEN_CHORE indoor (partsLeft 4→3); p1 the chore
continues (3→2); p2 the chore continues (2→1); p3 the chore
still live (partsLeft 1) and the holder is **engaged** — a
fight at the last part of the day. Scored at dawn p0:
eight candidates, the pick is HAVEN_CHORE `party_wait` (the
win-plan override; the raw core pick was FORAGE at 6.25 vs
the chore's 6.6), armed and armored, plan stage `party` /
target `editor` / needWave 5, party empty. The holder spent
the day doing the chore the plan asked them to wait on, and
ended it mid-fight.

**Day 150, the truncated day** — the dawn census ran and says
the holder is there: alive, at Haven (4,4), health 39, armed
and armored, holding the `editor` plan, party empty. But the
holder-state sampler wrote zero rows — not for this holder,
for anyone in the village. The recorder's story — present
and scored for eight straight dawns, then invisible on the
final day — matches the rows exactly: the instrument stops
seeing the village when the sim halts, and the clause names
that halt instead of charging the recorder for it.

**A second holder-day, for breadth — the same instance's day
148:** chore-live, SCORED at p1, engaged at p2, chore-live
at p3. The pattern is the same shape as d149 (score at dawn,
chore through the day, a fight in the afternoon) — the
recorder's per-part ledger reads like a day lived, not a
table. Nothing robotic in the holder's last three days:
wait on the plan, do the chore, fight when engaged.

## Instrument (proof test — rebase behavior recorded)

- Proof test `scripts/test-launchfield-horizon-b.js`:
  **64 passed, 2 failed** on this worktree (base `80e7da0bc`),
  exit 1. The 2 failures are BOTH §1 freeze-time assertions
  that MUST fail after any rebase, by design — the 0030Z
  adoption record shows exactly this shape (51/53) on every
  rebased tip: (1) merge-base is `80e7da0bc`, not the frozen
  base `4e805681a050` (the anchor tripwire doing its job —
  the driver CLI refuses legs on a non-frozen base, exit 2);
  (2) src/js differs from the frozen base (the gateavoid
  arm's `villager-agency.js` change, landed after the frozen
  base) — this arm contributes zero src changes. On the
  frozen base the test is 66/66. Everything else passes:
  §7 re-judge (7/7 — pilot unchanged, confirm DIAG-GO, the
  4 parts + 1 instance-day exactly as frozen), §7b
  old-code-fails control (4/4 — the 86e5bd38e analyzer still
  reports unknown 1 / 4 unexplained / 0 truncated on the
  same confirm corpus, and the temp file is removed).
- Analyzer selftest: **86/86 green** (71 baseline + 5 §H5 +
  10 §H6). The live 150d proof run (§4) recorded 4749
  holder-state rows on seed 107439; D1/D2 at 30d green
  (repeatability + recorder neutrality); §6b tripwire green
  (driver refuses exit 2 on the shimmed non-frozen base).
  Log: `/tmp/horizonfix-proof.log` (outside the repo).
- **§H5 gap found (recorded, not hidden):** the horizon-b
  prereg claims "PLUS §H5 selftest fixtures" — verified by
  grep before this freeze, NO §H5 horizon fixture existed in
  the analyzer selftest. The original p3 clause was never
  directly fixture-tested; it never fired on either band
  (horizonTruncated 0/0), so the gap never bit. This arm
  adds §H5 (original clause, 5 checks) AND §H6 (extension,
  10 checks).
- **Two prereg arithmetic corrections (recorded, not hidden):**
  the selftest total was first written as 85 (§H6 counted as
  9 — it is 10: 3+2+1+2+2), and the proof-test total as 65
  (§7b counted as 3 — it is 4: setup + unknown-1 +
  4-unexplained + temp-file-removed). Both corrected in the
  prereg BEFORE the judged analysis files were written; the
  judgment (clause, bands, bars) is unchanged. Frozen
  totals: proof test 66 (66/66 on the frozen base, 64/66
  expected on this rebased worktree — observed exactly),
  selftest 86/86 (observed exactly).

## Wall numbers (both bands, re-reported from the re-judged analyses)

| | Pilot 107439–107446 | Confirm 107447–107454 |
| --- | --- | --- |
| Wins / national by rank / national by standing / table | 0 / 0 / 3 / 0 | 0 / 0 / 2 / 0 |
| Wave 4 unlocked / wave 5 unlocked | 8 / 3 | 8 / 2 |
| Median survival / survived / deaths / starvation / standing-199 | 150d / 4 / 812 / 1 / 3 | 148d / 4 / 853 / 2 / 6 |

In plain words: every village reaches wave 4, five of sixteen
reach wave 5, none wins, none leaves regional rank, five pile
up standing past 200 without ever leaving regional rank, nine
end at exactly 199 — the same wall as horizon-b, because these
are the same villages re-judged. The launch gate was asked 35
+ 78 assessed days and answered `party-no-companion` every
time; the eligible pool is 0 on every snapshot (poolEligDist
0:22 pilot / 0:53 confirm). Mechanism DENIED on both bands —
the launch mechanism still never fires, which is the
winnability chain's open question, not this arm's: this arm
judges the RECORDER's completeness, and the recorder is now
complete on both bands.

## Metric review

- **The frozen prediction held exactly.** The prereg predicted
  confirm unknown 1 → 0, sUnexplained 4 → 0,
  sHorizonTruncated 0 → 4, hHorizonTruncated 1, hTally
  `hs-no-rows` 1 → 0, pilot unchanged — the re-judge shows
  exactly that, with no other firing on either band. The
  clause extension is surgical: it moved precisely the one
  failing instance-day and nothing else (every other count on
  both bands is byte-identical to the horizon-b analyses).
- **The day-level bar is closed too.** The horizon-b failure
  was counted twice (1 unknown day + 4 unexplained parts);
  the extension closes both with one predicate, because both
  are the same unobserved day. The two levels cannot drift:
  they call the same `zeroRowFinalDayInfo`.
- **The original clause still never fired** (0 p3-only
  firings on either band) — its shape (d150 p3 WITH a row
  that day) still has not recurred since the re-judge. The
  §H5 fixtures now prove it works anyway.
- **Completeness is now closed on the 150d horizon for this
  instrument** — but only for the zero-row-final-day shape.
  A final day where the sampler ran and a holder has no row
  still stays `no-rows` by design (H5b/H6c prove it). The
  next judgment that meets a NEW unexplained shape re-opens
  the question; this verdict does not pre-close it.
- **The launch mechanism question is untouched by this
  verdict.** DIAG-GO here means the recorder accounts for
  every holder-day and holder-day-part; it does not mean the
  launch fires. Mechanism DENIED on both bands, pool eligible
  0 on every snapshot — the named next lever (a trusted
  villager actually at Haven standing as a wave-4+ companion)
  is still the winnability chain's open build.
- **No re-score.** The verdict follows the frozen bars: (a)
  completeness 0/0 on both bands, (b) Leg R exact 10/10,
  (c) instrument green (modulo the 2 by-design §1 failures
  on this rebased worktree, recorded above).

## Files

- Prereg: `evidence/2026-11-23/sim-launchfield-horizonfix-b-prereg.md`
- Instrument: `scripts/analyze-launchfield-horizon-b.js` (amended),
  `scripts/test-launchfield-horizon-b.js` (amended),
  `scripts/launchfield-horizon-driver-b.js` (UNCHANGED)
- Re-judged analyses (new files — the horizon-b analyses are NOT
  overwritten): `evidence/2026-11-23/launchfield-horizonfix-b-analysis.json`
  (pilot) + `launchfield-horizonfix-b-analysis-107447-107454.json`
  (confirm)
- Corpora (existing, read-only):
  `evidence/2026-11-23/perseed-launchfield-horizon-b-107439-107446/`
  (pilot) + `…-107447-107454/` (confirm)
- Proof log: `/tmp/horizonfix-proof.log` (outside the repo)
- Evidence: this file.
