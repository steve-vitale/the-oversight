# sim-survivaltime-b — PRE-REGISTRATION (armor-curve survival-time lever)

- Run: `fleshout-loop-b-20261106T1730Z`, arm 1 of 3, axis scale-onramp /
  winnability chain (Steve 2026-11-03 re-point)
- Arm: `sim-survivaltime-b`, branch `sim-survivaltime-b`,
  worktree `~/workspace/worktrees/sim-survivaltime-b`
- Base: `dc76d9bf6` (worktree HEAD at prereg time; master has since moved
  to `8a975ad45` — rebase onto the explicit current master SHA before
  finishing, re-run proof green, report both SHAs)
- Policy: competent verbatim, BOTH legs. The lever is game code, not a
  fight policy: baseline = competent on K=20 code, armed = competent on
  K=6 code. No policy file is created or changed in this arm.
- Horizon: 150d death-aware (villages stop at death / win; +10d tail max),
  same as finishprobe / partydamage — the wave-4 kill window lives at
  days ~45–140 on those bands.
- Seeds: **88001–88008** (8 seeds, identical on both legs).
- Instruments: `scripts/survivaltime-instrument-20261106.js`,
  `scripts/survivaltime-driver-20261106.js`,
  `scripts/survivaltime-analyze-20261106.js` (copies of the partydamage
  family, renamed only — same traces, same same-day kill matcher; the
  midnight-spanning matcher fix is sibling arm sim-midnightkill-b's,
  NOT touched here). Proof: `scripts/test-survivaltime-20261106.js`.
- Corpus: `evidence/2026-11-06/perseed-survivaltime-b/` (16 files).

## Seed-band freshness (local_seed_band_freshness — full search)

- Searched: ALL of `evidence/` for the exact strings 88001–88008
  (0 files); precise seed-naming patterns (`"seed": 8800x`, `seed 8800x`,
  `8800x–8800`, `SEEDS=8800x`) in `evidence/` (0 matches); the goal
  `hidden_files/lever-claims/` + `convergence-tracker.md` for "8800"
  (0 matches); the standacc forbidden/contaminated lists
  (`evidence/2026-11-04/perseed-standacc-b/`, band 99101–99108 — no
  88xxx). Neighbor bands in use: 87001–87008 (partydamage, 1630Z),
  88101+, 87128+ — 88001–88008 sits in an unused gap.
- One caution, checked and cleared: a full-tree substring grep for
  `8800[1-8]` over the goal `hidden_files/` matches a handful of old
  adopted corpora — every hit inspected is a coincidental digit run
  inside a random float (e.g. `10.403899388007758` contains "88007",
  `63.7880080845207` contains "88008"), NOT a seed naming. No prereg,
  screen, extension band, forbidden list, or claim names 88001–88008.
- Verdict: **band 88001–88008 is FRESH.**

## The lever (game code, one mechanism)

- **Armor-curve retune: the diminishing-returns constant 20 → 6.**
  The curve `r = effP / (effP + K)` (Steve 2026-10-09) maps worn
  protection to the fraction of a blow absorbed, after armor-pierce
  (`effP = prot × (1 − pierce)`). K=20 was set the same day pierce was
  introduced and never re-tuned for it: with wave-4 pierce 0.2–0.45,
  tier-appropriate armor (median worn prot ≈ 33, see sizing) absorbs
  only ~47% of a wave-4 hit. Steve's 2026-11-05 rule: "if a fighter in
  full gear and armor appropriate for the tier still can't survive, the
  gear isn't good enough — protection per tier must let them survive
  that tier's fights."
- Implementation: one shared helper `Game.armorReduction(prot, pierce)`
  (new, next to `armorBonus()` in `src/js/game.js`) returning
  `effP / (effP + 6)`, used at all four sites where the curve exists
  today — `src/js/game.js` tbDamage player block + villager/ally block,
  `src/js/fieldFights.js` villager + ally blocks. Same rule everywhere:
  villagers' armor works exactly like the scholar's (parity law).
  No other number changes. No win price, deed gate, readyDemand, gate,
  or pierce value changes anywhere. No new item, no new recipe, no new
  system.
- Why this shape and not a new armor tier: scholars already wear the
  armor they own (finishprobe gear supplement: armorP 0–60 in wave-4
  TB fights); a new tier would need an acquisition path the sims may
  never walk. The curve is the tier-protection lever that reaches
  every fighter already wearing armor.

## Sizing (from the partydamage baseline corpus, 87001–87008, unjudged)

- Lost wave-4 TB fights (n=25): median 6 rounds, median entry HP 857,
  median monster damage 16.7/round applied (62.5 requested/hit,
  34.0 applied/hit, 3 hits/fight), scholar max HP 100.
- Median armor reduction on monster→scholar hits: **46.6%**
  (r=0.466, implied effP ≈ 17.6, implied worn prot median ≈ 33 at
  pierce 0.35). Median player-side damage: ~15–20/round.
- Through-fraction under K: current 0.534 → K=8: 0.312 (1.7× survival,
  ~10 rounds) → **K=6: 0.255 (2.1× survival, ~12–13 rounds)** →
  K=4: 0.21 (2.5×, ~15 rounds). K=6 is the smallest change that puts
  the secondary bar in reach; K=8 predicts a miss on it.
- Counterfactual replay on the 14 complete-ledger lost fights (implied
  entry HP 95–105 of 100, i.e. fights where the tbDamage ledger fully
  accounts for the scholar's death): at K=6, 14/14 survive their
  OBSERVED hit totals — but that is a lower bound, not a kill
  prediction: surviving longer means more incoming hits AND more
  outgoing damage, and the replay holds outgoing damage fixed.
- **Honest sizing caveat (binding):** at competent damage rates
  (~15–20/round), killing an ~850-HP beast needs ~40+ rounds. Even
  12–13 survived rounds deals only ~200–250 damage (~25–30% of
  entry). The STATIC sizing does NOT predict the primary bar is met.
  The pilot tests whether DYNAMIC effects close the gap: scholars
  surviving losing fights can re-fight the same wounded beast the
  next day (the grind's price collapses — today the grind costs a
  life per round of it), allies in the same armor survive longer and
  deal more damage, and longer fights press more abilities. If the
  dynamics do not move kills, the pilot NO-GOs and the evidence will
  say the mechanism works but the primary needs damage/ally help too.
- Ledger caveat found in sizing: 11/25 lost fights have implied entry
  HP far below max (29–85 of 100) — either scholars enter some fights
  already hurt, or some wave-4 damage bypasses the tbDamage ledger
  (Eater fights cluster at the low end). The instrument records entry
  HP only for the beast, so this is UNRESOLVED in the sizing; the
  pilot reports scholar entry-HP distribution as a secondary analysis
  and files it as a finding if it reproduces. It does not change the
  bars: armor can only mitigate what flows through the curve.

## Primary metric (binding)

- **Wave-4 TB kill rate (log kills / traced TB fights) ≥ 10% on the
  armed leg.** Definition (partydamage's, midnight-proof): numerator =
  wave-4 entries in `waveKillLog` (`w >= 4`); denominator = traced
  wave-4 TB fights on that leg. Baseline on identical seeds is the
  comparison; the bar is absolute (≥10%), not merely "beats baseline".
- GO iff armed ≥ 10%. NO-GO otherwise. No re-scoring, no friendlier
  metric, no re-thresholding after the run.

## Secondary metrics (binding as stated, reported alongside)

- **Median rounds survived in LOST wave-4 TB fights ≥ 12** (2× the
  6-round finishprobe baseline). The mechanism check: if survival does
  not double, the curve change did not buy the rounds it was sized for.
- **Median survival (village days) ≥ 0.8× control** (guard).
- **Starvation deaths ≤ control + 2** (guard).
- Reported (not judged): wave-1–3 TB rounds survived by wave (blast
  radius: the curve also eases early fights — bark P=10 vs pierce 0
  goes 33% → 62% reduction); field wave-4 fights/kills; per-beast
  grind survival (scholars surviving losing fights); wins / national /
  table; wave-4/5 unlocks, faced, kills; readiness-5-ready days;
  living wave-4 killers at end; damage/round by side; scholar entry-HP
  distribution.

## Canon

- `docs/CANON.md` + `docs/MONSTER-WAVES.md` read first. Wave-4 bands
  (damage 35–95, HP 850–1500, pierce 0.2–0.5) are anchored and
  UNTOUCHED — this arm changes the armor curve, not the monsters.
  The armor curve itself is Steve 2026-10-09 canon
  ("prot=20 halves what gets through"); the retune is a balance-lever
  change to that canon number under Steve's 2026-11-05 tier-protection
  rule, documented here and in code. No gate/price/deed number moves.

## Metric review (to be filled after the run)

- (pending)
