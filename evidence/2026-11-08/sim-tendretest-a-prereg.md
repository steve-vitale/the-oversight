# sim-tendretest-a — prereg: retest the tenddrive lever on a national-loss-bearing band

Run: fleshout-20261108T2315Z (Loop A). Worktree:
`~/workspace/worktrees/sim-tendretest-a` (branch sim-tendretest-a).
Axis: scale-onramp / winnability chain (converging, NOT converged).
Game-code BUILD (re-application of the tenddrive-a fix, reverted after its
NO-GO). The lever, its sizing, and the first verdict live in
evidence/2026-11-08/sim-tenddrive-a.md and sim-tenddrive-a-prereg.md.

## Canon + code read first (before any sweep)

- docs/CANON.md, docs/SCALE.md, docs/TABLE.md.
- Prior decomposition, NOT re-measured:
  evidence/2026-11-08/sim-tendtrust-b.md (the DIAG that sized this lever:
  national-loss dips 3/7/12 trust points = 1/1/2 tends at lift +8; cap 55
  banks 15 headroom above the 40 bar, cap 50 banks only 10) and
  evidence/2026-11-08/sim-tenddrive-a.md (the pilot: mechanism proven
  working — 2 engine tends while national, seed 76402 d89 — but NO-GO
  because band 76401–76408 on base 6680d7924 had ZERO national-loss
  events, so the headroom had nothing to save).

## THE BUILD (exact construction — pre-registered, do not widen silently)

Re-apply the tenddrive-a fix, commit 91092b28 on branch sim-tenddrive-a
(the fix diff ONLY — tip 9da541de6 is the REVERT, do NOT cherry-pick it).
In `src/js/win-plan.js`, `winPlanBondsTick` ONLY:

1. DELETE the early return `if (st.nationalLive || st.pendingNational)
   return null;` — the TENDING leg no longer blocks while national or
   while a national beat is pending. `winPlanMusterTick`'s early return
   stays exactly as-is; every other leg's nationalLive behavior stays
   as-is.
2. Raise the tend cap from 50 to 55 WHILE nationalLive:
   `if ((l.trust || 0) >= (st.nationalLive ? 55 : 50)) continue;`
   — cap stays 50 when not national (including pendingNational, which
   is not nationalLive).

Nothing else in the drive changes: the ≥2-link gate, the actor-at-Haven
gate, pantryDays ≥ 3, once/week/link cadence, the mourning skip, and the
tendLink +8 / 1,500 kcal are all untouched. This arm changes the GATE,
not the firing rate: the drive's ~1-in-3-week firing rate
(actor-presence throttle, unmeasured) is a measured property, not a bar.

## Substrate, seeds, horizon

- Substrate (both legs): tableseat-nowait (LEANLINKRESCUE=1,
  TABLESEATNOWAIT=1) wrapped with the tendtrust-b recorder
  (TENDTRUST=1 — proven neutral, G2 in tendtrust; the recorder counts
  engine tends while nationalLive on both legs, identically).
- Retest seeds: 76409–76420 — 12 seeds, CONFIRM size. Freshness verified
  at run start (see below).
- Horizon: 180 loop-days, death-aware (runDays breaks on Game.over).
- Leg order: BASELINE leg FIRST on the unfixed worktree, then the
  CANDIDATE leg on the fixed worktree. Both legs run the same sweep
  script (`scripts/test-tendretest-a-sweep.js`, adapted from
  test-tenddrive-a-sweep.js: same two arms per leg — plain
  tableseat-nowait + recorder-wrapped — so each leg carries its own G2
  recorder-neutrality check; the GO judgment compares the recorded
  arms across legs, identical instruments, only the game code differs).
- Own baseline replication on THIS base — do NOT reuse the tenddrive-a
  corpus as the control; its numbers are only a reproduction check.
  Reproduction check (tenddrive-a baseline, base 6680d7924, band
  76401–76408): national ever 3/8, final 3/8, losses 0, won 3/3 lesser,
  median 97d. Base drift is expected (this branch's base is newer); the
  judgment uses MY OWN baseline leg, never tenddrive-a's numbers.

## GO BARS (binding, §14 — a miss is NO-GO, never re-scored)

- JUDGEABILITY GATE (first): if the baseline leg shows ZERO
  national-loss events (diag.nationalLost on the armed arm), the verdict
  is NO-GO-unjudgeable — write it under "metric review", do NOT widen
  the band, do NOT re-run on another band in this arm.
- PRIMARY: candidate national final ≥ baseline + 2 AND every baseline
  loss seed (a seed with ≥1 nationalLost event on the baseline armed
  leg) holds national to end on the candidate leg (nationalFinal === 1).
- MECHANISM: engine tends while nationalLive observed on ≥1 seed, AND
  ≥1 link topped to trust ≥55 while national BY A TEND
  (tend-attributed topping: an engine-winplan tend while national with
  trustBefore < 55 <= trustAfter — the bare topped-55 is
  non-discriminating, the baseline already reaches ≥55 via court/aid
  gains, so part (b) as written in tenddrive-a is corrected here to
  require the topping to be tend-attributed).
- SECONDARY cost bar (scalemetric): starvation ≤ control + 2 (totals
  AND arm-only), median ≥ 0.8× control median.
- No seed is excluded from win claims a priori on this band (the 76404
  exclusion was specific to band 76401–76408); a seed that never forms
  a third sub is context, not a bar.
- GO = gate + primary + mechanism + secondary all hold. A miss on any
  is NO-GO, never re-scored.

## Seed-band freshness check (confirm band) — WORKER-VERIFIED

- Chosen band: **76409–76420** (12 seeds, 764xx series).
- Search scope: every dated prereg `evidence/*/sim-*-prereg.md` (654
  files, all dates), grepped for the exact band regex
  `764(09|1[0-9]|2[0-9])` — the ONLY naming is
  `evidence/2026-11-08/sim-tenddrive-a-prereg.md:111/125-126`, which
  designates 76409–76420 as THIS lever's own confirm band and states it
  "remains fresh" (a reservation for this retest, not a competing use).
  The other `764` hits in preregs are not 764xx band namings: 976x
  stock bands (sim-stock9762-b-prereg.md, sim-callertag-resweep-b-prereg.md),
  seed lists containing 10764 (sim-adjacenttile-b-prereg.md), 99764
  (sim-trickoff-confirm-b-prereg.md), a float substring
  (sim-partydamage-b-prereg.md), commit SHAs (76421939b, 874646764), and
  the 76401–76408 lineage itself (binddiag / tendtrust / tenddrive-a).
- Forbidden/contaminated lists: the preregs that mention
  "forbidden"/"contaminated" name other bands (74201–74208, 73601–73608,
  9700–9711, 9930–9941, 9950, 10000) and other subjects (spoilDay);
  NONE names any 764xx band.
- Whole evidence tree (non-prereg files): the raw regex also matches
  stray numeric substrings inside old JSON corpora (e.g. a
  `"pantryKcal":76411` calorie count in a 2026-10-15 corpus file, and
  "76416" inside a float in a 2026-10-17 beats file) — calorie counts /
  float substrings, NOT band namings. Two .md files name the band as a
  reservation, same as the prereg: `sim-tenddrive-a.md:107` (metric
  review: "the confirm band 76409–76420 was NOT run ... and remains
  fresh") and `sim-scale-adoption-round-2216.md:91` ("No confirm band
  spent (76409–76420 stays fresh)"). A targeted search for actual seed
  use (`"seed": 76409`–`76420`, corpus filenames `s76409`–`s76420`, and
  word-boundary `76409`–`76420` in .md files) returns NOTHING outside
  these reservation namings. (rg seed-field search over all of
  evidence/ matches only this prereg's own line 119, which quotes the
  search pattern; the filename find returns one hit,
  `evidence/2026-11-05/sim-enddaybeats-fix-a-panel-after/cases/76415209…json`,
  a panel-case file named by a SHA hash beginning 76415, not a seed.)
- Tracker + findings: `grep 764` on the convergence tracker and
  `sim-findings.md` — matches are commit SHAs, the 976x stock bands,
  the 76401–76408 band itself (finding #1918, this arm's own blank,
  whose UPDATE names 76409–76420 as "the confirm band ... stays fresh"
  — the same reservation, not a competing use).
- Result: **76409–76420 is FRESH.** No prior prereg, forbidden list,
  contaminated list, screen, extension band, tracker line, or findings
  entry names any seed in it except this lever's own confirm-band
  reservation in sim-tenddrive-a-prereg.md.

## Proof

- `scripts/test-tenddrive-a.js` — the lever spec, retained unchanged:
  (1) the drive tends while nationalLive; (2) cap 55 while national /
  50 otherwise; (3) muster stand-down still returns null while
  national. It must FAIL on the unfixed tree (verified this run:
  national-tend FAIL, cap55 FAIL, cap50 PASS control, muster-national
  PASS, exit 1) and PASS on the fixed tree. Do NOT add it to the green
  list while the fix is reverted.
- `scripts/test-tendretest-a-sweep.js` + `scripts/test-tendretest-a-judge.js`
  — adapted from the tenddrive-a instruments for the new band/prereg
  (12 seeds; judge adds the judgeability gate, dynamic loss seeds, and
  tend-attributed topping). Adapt only; do not rebuild from scratch.
- `node scripts/check.js --quick` on the fixed tree (or name each
  failing line with its cause). Never run concurrent jest; use
  `--cacheDirectory=/tmp/jest-cache-sim-tendretest-a`.
- Balanced panel (§15): `scripts/balance-panel.js` before (unfixed
  worktree) and after (fixed worktree) on the 76409 band (capable,
  risk-aware, socialite, winseek, 180d); compare and attach the
  compare .md. The panel is the instrument; the pre-registered GO bars
  are the judge. If the compare returns `invalid`, follow the
  COMPARE-CONTRACT repair route in
  evidence/2026-11-08/sim-comparecontract-a.md (rebuild the
  before-panel under the wrapper policy with the flag unset) — do not
  silently drop the panel.
- Sense-testing law: replay narration on a loss seed (or the closest
  seed). Judge meaning, coherence, relevance, consequences — never just
  counts. Does the village hear anything about bonds cooling / grain
  sent while national? Write the plain-words village assessment.

## Notes (pre-registered, not bars)

- (1) The double-tend night quirk (tendtrust: a week-boundary night can
  deliver two tends, delta +16) — record if observed; not a bar.
- (2) The engine drive's ~1-in-3-week firing rate is a measured
  property, not a bar — this arm changes the gate, not the firing rate.
- (3) The tendtrust-b recorder's header comment still says the engine
  drive "never [tends] while nationalLive" — true of the OLD gate, stale
  under the fix. The recorder file itself is a landed instrument from
  another arm and is NOT modified here; the stale comment is recorded,
  not fixed, in this arm's evidence.
- (4) Base drift vs tenddrive-a: this branch's base is newer than
  6680d7924 (sibling arms landed since). The judgment uses my own
  baseline leg; tenddrive-a's numbers are a reproduction check only.

## Landing rule

- GO → fix lands as its own commit with `[needs-eyes]` (villager
  behavior change: a drive that runs while national) + proof test +
  evidence + corpora; the tend voice is pre-existing (new occasion,
  not a new line) — default no flag unless new voice lines appear.
- NO-GO (including NO-GO-unjudgeable) → revert the game-code change
  completely (zero src/js diff); commit prereg + instruments +
  evidence + corpora only.
- Do NOT push, do NOT bump versions, do NOT verify live — report
  'ready-to-merge' with branch tip, verdict, proof results, evidence
  path. The coordinator merges via --ff-only.

## Flap protocol

Probe O_EXCL file creation (`git update-ref refs/heads/probe HEAD`,
then delete it) before every sweep and every commit; if the probe
fails, do read work and retry later — never force a write, never route
around the denial with a manual ref edit. Probe OK at prereg time
(2026-11-08 ~23:45Z). Do NOT run scripts/worktree-heartbeat.sh
(REGISTRY.lock flock stall — coordinator owns the registry entry).

## Metric review (to fill at evidence time)

- (To be written in sim-tendretest-a.md: whether the bars worked as
  written, any instrument gaps found, panel outcome.)
