# sim-departfit-b — CONFIRM PREREG (frozen before any judged confirm sim)

## 0. Question

Does the pilot GO replicate on a fresh extension band? (Pilot verdict
GO, evidence/2026-11-27/sim-departfit-b.md: post-load loaded share
60/62 = 96.8%, launches 110 vs 137 = 0.803, median survival 151 vs
149d, worst death-cause move 6.3pp, 0 instrument errors, determinism
verified per leg.)

## 1. Frozen bars (identical to the pilot prereg; a miss is NO-GO, never re-scored)

| Bar | Threshold |
|---|---|
| B1 primary — post-load loaded share | ≥ 0.80 of ranged carriers on LAUNCH departures carry ammo > 0, read AFTER the departure call |
| B2 guardrail — launches | launch count within ±25% of the confirm baseline leg on identical seeds |
| B3 guardrail — survival | median survival (gameDays) not worse than baseline by > 10d |
| B4 guardrail — deaths | no death-cause share moves > 15pp vs baseline (from `samples.deaths[].cause`) |
| B5 instrument health | 0 instrument errors across both legs; determinism byte-identical on a re-run of one seed per leg |

Verdict: confirm GO iff B1–B5 all pass on this band — the arm verdict
stands GO. If any bar fails, the arm verdict REVISES to NO-GO and
the lever is reverted per the frozen NO-GO ladder (killed arms leave
no trace); the pilot GO does not stand alone.

## 2. Method (identical to the pilot; only the band changes)

- Seeds: 111401–111416 (16 seeds). Policy: competent verbatim
  (`scripts/policies/competent.js`, `competent()`). No policy variant,
  no env flags. Horizon: 150 days, death-aware.
- Legs (paired, identical seeds, one lever apart): BASELINE = pre-lever
  master (instrument only); CONFIRM = + departure-fitness check.
  The lever code is unchanged since the pilot (HEAD bece5f46f); no
  game-code change between pilot and confirm.
- CTL-LEG NOTE (mechanical, proven by the determinism rerun): the
  baseline leg needs the PRE-lever `src/js/villager-brain.js`
  (commit daf148c13). Swap it in with `git show
  daf148c13:src/js/villager-brain.js > src/js/villager-brain.js`,
  run the ctl leg, restore with `git checkout HEAD --
  src/js/villager-brain.js`, and verify `git hash-object` matches
  HEAD before and after. The arm leg runs on current HEAD.
- Instrument / driver / analyzer / panel builder: the pilot's
  (`scripts/departfit-b-instrument.js`, `scripts/departfit-driver-b.js`,
  `scripts/analyze-departfit-b.js`, `scripts/build-departfit-panels-b.js`),
  unchanged. Per-seed files:
  `evidence/2026-11-27/perseed-departfit-b-confirm-ctl/` and
  `...-confirm-arm/`. Panel: `departfit-b-confirm-panel`.
- The stale-`plan.party` instrument note from the pilot evidence (§5)
  stands: the instrument stamps holder + plan.party + commit
  companions, so B1 is measured on the instrument's list (the frozen
  metric, unchanged for comparability); the analysis reports the
  dry-carrier identities again so the confirm can say whether any dry
  row is a commit member (a real check miss) or a stale party entry.

## 3. Seed-band freshness check (run before freezing)

- Grep every dated prereg under `evidence/` for 111401–111416: ZERO
  prior hits (the only hit is this arm's own pilot prereg naming
  111401–111408 as the fallback band, never used). Grep all
  `evidence/**/*.md` for `11140[1-9]` / `11141[0-6]`: only this arm's
  own files.
- No per-seed file `s11140[1-9]` / `s11141[0-6]` exists under
  `evidence/` (the 2026-10-28 nighttravel scan used seeds 11140 and
  11141 — different integers, no collision).
- Forbidden/contaminated lists named in preregs name no 1114xx band.
- Band 111401–111416 is FRESH. Fallback if a collision is found on
  re-check: 111501–111516 (verify fresh before use).

## 4. Wall numbers (reported, not judged)

Wins, national reach, table, wave-4/5 unlocks, median survival — from
the per-seed summaries, both legs.

## 5. Metric review (to be filled at closeout; bars NOT re-scored)

- (filled in the confirm evidence note)
