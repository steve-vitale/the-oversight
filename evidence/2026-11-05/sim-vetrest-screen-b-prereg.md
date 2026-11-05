# Pre-registration — arm sim-vetrest-screen-b (Loop B run fleshout-loop-b-20261105T1830Z)

BUILD arm. Axis: scale-onramp / winnability chain. First-killer survival.
This is the 32-seed screen the vetrest pilot itself proposed as its next
run (evidence/2026-11-05/sim-vetrest-b.md, "Named next blank #1").

## Ground truth (binding, read first)

- evidence/2026-11-05/sim-vetrest-b-prereg.md — the pilot prereg. Its
  definitions, primary metric, power rule, and kill classification are
  BINDING and carry over to this screen unchanged. This file restates
  them for this band; where the two disagree, the pilot prereg governs.
- evidence/2026-11-05/sim-vetrest-b.md — the pilot evidence:
  UNDERPOWERED verdict, mechanism report, metric review. Pilot result:
  1 banking seed per leg (99713 only), 1 observed first-killer exit on
  the armed leg, skips 0 on both legs, legs byte-identical (zero skip
  opportunities existed). The lever stays committed, default OFF,
  off-mode byte-identical (proof) and on-mode neutral in the wild.
- Lever: VETREST_MANTLE_SKIP (ledger.js playerDeath, default OFF via
  env flag, 45d window, trust-sort skip with fallback, narration line,
  vetrestSkips trace). On master in this worktree (landed this run).
  Proof scripts/test-vetrest-20261105.js is 30/30 green (re-run
  2026-11-05 before this screen; see below).
- Canon: docs/CANON.md read first, then docs/MONSTER-WAVES.md (Wave 4/5
  sections + "Combat readiness gates the standing unlock"). Wave 5 needs
  2 LIVING villagers with a wave-4+ kill in `state.waveKillLog`
  (readiness bar VETERANS, `Game.waveCombatReadiness(5)`,
  src/js/standing.js). No canon doc covers killer rest or succession.
  No win-price / deed-gate / readiness-demand change. No XP/gear files.

## Corpus

- Fresh band: 99511–99542 (32 seeds). Freshness verified by whole-token
  grep BEFORE any judged sim (see Freshness check below): no 99511–99542
  token in any dated prereg (evidence/*/sim-*-prereg.md), no 99511–99542
  token in any dated evidence .md, no 99511–99542 perseed filename.
  The only whole-token 99511–99542 hits anywhere are old-Oct JSON
  corpora values that are NOT seeds (`"pantryFreshAfter":99533`,
  `"pantryFreshAfter":99538`, `"pantryFreshAfter":99519`,
  `"pantryFreshAfter":99528`, `"pantryFreshAfter":99514`,
  `"pantryKcal":99530`, hash fragment `|99518|` in
  fictiongate hashes), verified by context. The only `9951*`
  filenames are 4-digit seeds 9951/9952 (journey-deepening-r32b),
  not this band. Never reuse 991xx/992xx/993xx/996xx/997xx/736xx
  bands.
- Policy: competent policy VERBATIM on BOTH legs (no policy variant —
  the lever is game-code). Baseline leg: VETREST_MANTLE_SKIP unset.
  Armed leg: VETREST_MANTLE_SKIP=1. Instrument reused VERBATIM:
  scripts/killerdeath-instrument-20261105.js (killsLive, scholarDeaths
  with at-haven/in-combat context, killerTrack, daily with readiness5)
  + driver reads of exiles and vetrestSkips at finalize.
  Driver: scripts/vetrest-driver-20261105.js (killersim-driver pattern:
  say-capture, daily snapshots, 150d death-aware). Analyzer:
  scripts/vetrest-analyze-20261105.js. No rewrite; no extension.
- Horizon: 150d death-aware (dead villages stop simulating, +10d tail
  max), same as the pilot.
- Corpus dir: evidence/2026-11-05/perseed-vetrest-screen-b/ (64
  per-seed JSONs: 32 seeds x 2 legs). The 99711–99718 pilot corpus is
  CONTEXT ONLY, never the verdict.
- Staged (§§9–12): this screen IS the staged next step the pilot
  proposed; no further pilot is owed. If the screen GO's, confirm is
  not re-run on the same band — the balanced panel (§15) runs instead
  (see below).

## Freshness check (run 2026-11-05, before this prereg was committed)

- `grep -r -o -E '\b995(1[1-9]|2[0-9]|3[0-9]|4[0-2])\b' evidence/*/sim-*-prereg.md`: 0 hits.
- Same tokens against evidence `--include='sim-*.md'`: 0 hits.
  Same tokens against all evidence `--include='*.md'`: 0 hits.
- `find evidence -name '*9951*' ...`: only 4-digit seed 9951/9952
  files (journey-deepening-r32b, 2026-10-22) — not this band.
- Range mentions in preregs: only `9951-9958` (4-digit seeds,
  2026-10-27 preregs) — not this band.
- Same tokens against the goal hidden_files: 45 hits, EVERY one
  verified by context to be a non-seed number (pantry kcal values
  99533/99538/99519/99528/99514/99530 in Oct crumbdefault/crumbguard/
  prodrebound corpora; hash fragment 99518 in fictiongate hashes).
  No JSON hit is a seed. No prereg, no forbidden-band list names
  this band.
- Per the local_seed_band_freshness skill: a band named in ANY prior
  prereg is NOT fresh even if no corpus exists for it. This band is
  named nowhere.

## Definitions (fixed before any judged sim — pilot prereg, unchanged)

- Killer / first killer / BANKING SEED: killersim2's definitions,
  unchanged (killer = vid with >= 1 wave-4+ kill in waveKillLog;
  banking seed = >= 1 wave-4 kill AND the killer alive at end of the
  kill day — same-day kill-and-exit does NOT bank).
- Living on day d / L(d) / L>=2 day: killersim2's, unchanged.
- First-killer survival: exitDay - firstDay (death and exile both end
  survival); censored (still living at village end) first killers are
  reported separately and EXCLUDED from the median; a median is
  reported only if >= 3 observed exits exist (killersim2's rule).
- SKIP: a succession where the flag is on, the top-trust candidate is
  a fresh killer (window 45d), and the pick goes to the next-most-
  trusted non-fresh candidate. Counted from vetrestSkips
  (driver-copied) AND cross-checked against daily scholarId (the
  skipped vid must not appear as scholarId on any snapshot day inside
  its window — reported, not silently resolved).
- PAIRED SURVIVAL (mechanism measure): on banking seeds, first-killer
  survival armed vs baseline, same seed, side by side. The
  trajectories diverge only after the first skip fires, so the early
  kill is usually identical.
- DEATH CHANNELS: killersim2's deathChannel, unchanged (contest/arena
  vs wild vs other, from the killerdeath split vocabulary).
- COST BARS (from the corpus fields, fixed here):
  - median village survival: median of per-seed run days.
  - starvation deaths: teleDeaths rows with cause exactly
    'starvation' (any player flag), total across the band.
  - village losses: seeds with villageLost true.
  - ROSTER CO-PRIMARY (§14c): non-scholar fallen count = fallen
    entries whose villagerId never appears as a scholarDeath
    scholarId, per seed.
- WALL NUMBERS: wins / national / table (unobserved, never inferred)
  / wave-4 unlocks / wave-4 faced / wave-4 kills / wave-5 unlocks /
  wave-5 faced / wave-5 kills / readiness-5-ready days / median
  survival — per leg.

## Pre-registered metrics (binding — a miss is NO-GO, never re-scored)

- PRIMARY (pilot prereg's bar, binding): on BANKING seeds,
  first-killer median survival (observed exits only, >= 3 required
  to report) >= 19d (2x the 9.5d baseline) AND >= 1 banking seed
  with >= 1 day of 2 living killers AND cost bars hold:
  (i) median village survival armed >= 0.8 x baseline;
  (ii) starvation deaths armed <= baseline + 2;
  (iii) village losses armed <= baseline + 1;
  (iv) ROSTER CO-PRIMARY (§14c): median non-scholar fallen armed
  <= baseline median + 2.
- Verdict GO iff ALL of: the screen is powered (see Power rule) AND
  the primary holds in full. If screen GO → balanced panel (§15,
  see below) before any landing claim.
- Verdict NO-GO iff powered and any primary clause misses.
  A NO-GO on the median clause with the mechanism firing (skips > 0
  AND paired survival up on >= 1 banking seed) is classified
  METRIC-BROKEN (§14a — the bar was unachievable for this mechanism:
  pool ~29% vs a bar needing the scholar-at-kill majority to move),
  not CONCEPT-DEAD. A NO-GO with zero skips firing is CONCEPT-DEAD
  (the mechanism never engaged) or SUBSTRATE-MISSING (if the engine
  did not stage a succession inside a killer's window — stated, not
  assumed). On NO-GO the lever is reverted so no src/js trace remains
  (do the revert + update the proof the way the tbretreat arm did —
  see evidence/2026-11-05/sim-tbretreat-b-confirm.md and its adoption
  proof-fix commit on master; the proof must stay green on the landed
  tip, with skips printed, never silently passed).
- POWER RULE (pre-registered, house pattern from killersim2): the
  screen is UNDERPOWERED (not NO-GO) iff fewer than 2 banking seeds
  across BOTH legs, or fewer than 3 observed first-killer exits for
  the median. An underpowered screen reports the mechanism measures
  and proposes the next run — it claims no GO/NO-GO. Expected
  banking: killersim2 banked 6/32 seeds (~19%) — expect ~6 banking
  seeds per leg at that rate.
- INSUFFICIENT-DATA iff > 2 of the 64 legs carry instrument errors.
- MECHANISM MEASURES (pre-registered, reported not verdicted except
  as the kill-classification input above): skips fired per leg (count
  + seeds); skipped killers' paired survival (armed vs baseline,
  same seed); L>=2 days per banking seed per leg; second-killer
  production (banking seeds with >= 2 killers ever; post-first-blood
  fights/kills); death channels per dead killer.
- REPRODUCTION / SANITY (not judged): instrument errors 0 on judged
  legs; the proof's live determinism + off/on neutrality legs pass
  (same seed twice identical; instrument-off trajectory unchanged at
  30d; flag-off trajectory identical to pristine baseline at 30d) —
  proof run 30/30 green BEFORE this screen.
- BALANCED PANEL (§15): runs ONLY on screen GO — if the screen GO's,
  run scripts/balance-panel.js and attach the compare .md to the
  evidence file. If NO-GO or UNDERPOWERED, no panel is owed; state
  why. If the panel tool cannot carry a game-code env flag cleanly,
  that is stated in the evidence and the per-seed paired comparison
  stands as the evidence — never a fabricated panel compare.

## Metric review warning (from the pilot, carried into this screen)

The >= 19d median bar is likely unachievable for this mechanism alone
even at 32 seeds, for the reason the pilot prereg's §14b stated: the
skip addresses only the NPC-at-kill minority (~29% of banked killers),
while the bar needs the scholar-at-kill majority to move. The screen's
real questions are the MECHANISM MEASURES — does the skip fire, do
skipped killers outlive their baseline counterparts (PAIRED, identical
seeds), do pairs form — not the median. Judge against the header; do
NOT re-score the metric mid-run. The evidence file carries a "metric
review" section.

## Sense-testing

At least one villager transcript/dialogue sample read from this arm's
own corpus and judged for meaning (not counts): for the banking seed
with the longest-lived first killer (or the seed where the skip fires,
if any), quote what the village is TOLD about its veterans and about
the succession — the "veteran kill" cheers, the skip line (if it
fires), the readiness hold beats — and judge whether the story makes
sense for a village whose killers rest while others take the Codex.
If retained veterans die away from combat, note it and move on — do
NOT chase it. Note whether the skip narration line ever fires on
camera in a live succession.

## What this arm will NOT do

No lever on the TB-fight flee path (Loop A's sim-tbretreat-b owns TB
fight flow); no retention-by-location rebuild (killerdeath's probe
stands); no vetrestage rebuild; no gate/price/deed/readyDemand/
VETSHAPE change; no XP/gear files; no re-judging of 99311–99342 or
99711–99718; no rebuild of the ability-use follow-up (main-session
owned). The release question stays a future arm's question.
PERCEPTION LAW: the lever reads state.waveKillLog (the village's own
witnessed-kill record) — keep it that way; no roster-fed shortcut.
