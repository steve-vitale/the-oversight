# sim-ledgerbound-b — boundary-aware ledger re-judge

## Prereg header

- **Prereg:** `evidence/2026-10-27/sim-ledgerbound-b-prereg.md` (committed
  `2ff5e518f54ee979cc19867372d950b6335c2e79` before any judged sweep).
- **Primary metric:** boundary-aware ledger closure — named, generic, and
  dried-channel residuals computed against a closing snapshot taken after
  the final day's flows settle (end of day 100, after meal draws), with
  day-101 sweeps treated as post-horizon and excluded from the judged ledger.
- **GO threshold (verbatim from the prereg):** PILOT GO iff named pass rate
  ≥11/12 AND generic ≥7/8 AND dried pooled ≤2%. Confirm GO iff named ≥80% +
  pooled within 1%, generic ≥80% + pooled within 1%, dried pooled within 2%
  (boundary definition). Confirm never overrides the pilot verdict.
- **Horizon:** 100 days, death-aware (a seed that dies ends early; a seed
  that survives runs the full 100 days). The 100-day horizon is the
  stockdoors/residualhunt horizon, and it is the horizon the boundary
  question lives on: the day-100 night meal is the flow that settles after
  the closing snapshot, and the day-101 sweep is the post-horizon flow.
- **Seeds:** pilot 9820–9827 (the residualhunt band, for identical-seed
  comparison); confirm 9850–9861 (fresh band, collision-checked below).
- **Policies:** competent-nofeast — `COMPETENT_FEAST=0`, `SEATDRIVE=0`,
  `PLENTYDEPRI=0`, `DEPOSITGATE=1`, `FEASTSCALE_R13` off.
- **Base:** the pinned pre-`c04d4e0cb` `game.js`, blob
  `b2ba423afdfbdce8c98751ef544f10805b46cfa6`, under residualhunt
  discipline (backup outside the repo, swap, sweep + proof, restore,
  verify — see "Pinned-base discipline" below). The pin was never committed.
- **Instrument:** vendored residualhunt instrument under ledgerbound names
  (`scripts/sweep-ledgerbound-b.js`, `scripts/analyze-ledgerbound-b.js`,
  `scripts/test-ledgerbound-b.js`, `scripts/trace-ledgerbound-b.js`,
  `scripts/stockdoors-capture-ledgerbound.js` + the five reused capture
  files). Only the analyzer's closing step was adapted, exactly as the
  prereg defines. No stockdoors- or residualhunt-named file was modified.
  Zero `src/js` changes.

## Verdict

- **PILOT GO.** Boundary legs: named 11/12, generic 8/8, dried 0.91%.
- **CONFIRM-GO (reported alongside, never overriding the pilot).**
  Boundary legs: named 5/5, generic 12/12, dried 0.36%.
- **Convergence: converged** — for the ledger-boundary blank this run was
  assigned. The boundary definition closes the books on two independent
  bands. The reachability wall (waves 4–5, national standing, the table,
  the win) is a separate open blank and is NOT closed by this run: no seed
  on either band reached it.
- The stockdoors NO-GO verdict stands in its own evidence and is not
  re-judged here. What this run shows is that the stockdoors NO-GO was, in
  part, a boundary artifact: the old-boundary legs on the pilot band still
  fail (9/12 named), while the boundary-aware legs on the identical seeds
  pass. The old definition counts the day-100 night meal against a snapshot
  taken before that meal happened; the boundary definition moves the meal
  and its surplus pushes together, and the books balance.

## Pilot legs (seeds 9820–9827, identical seeds, old vs boundary)

Old-boundary legs (NEW definition from stockdoors/residualhunt, control —
reproduces the residualhunt corpus exactly):

- Leg 1 det-gate (DIAG): PASS. Proof runs seed 9820 with `STOCKDOORS=1`
  vs `0` produced byte-identical inflow, mealdraw, spoilvol, and driedpath
  records, identical death lists and wall fields, and reproduced the corpus
  counts 255/1249/4/163.
- Leg 2 coverage (DIAG): PASS. Stockdoor records on 8/8 seeds, dried
  events on 8/8 seeds, linked transformed share 100.0% (bar ≥95%).
- Leg 3 named (old): 9/12 (75.0%, bar ≥80%) — FAIL. Pooled residual
  4,136 / 1,687,320 = 0.245% (within 1%, but the rate bar fails).
- Leg 4 generic (old): 7/8 (87.5%) — PASS. Pooled 4,412 / 2,225,865 =
  0.198%.
- Leg 5 dried (old): pooled −5,456 / 774,536 = 0.70% — PASS.
- Old-boundary verdict: NO-GO (leg 3 rate).

Boundary-aware legs (judged):

- Leg 3 named (boundary): **11/12 (91.7%) — PASS.** Pooled residual
  −1,664 / 1,687,320 = 0.099%.
- Leg 4 generic (boundary): **8/8 (100.0%) — PASS.** Pooled residual
  −425 / 2,225,865 = 0.019%.
- Leg 5 dried (boundary): **pooled −7,056 / 774,536 = 0.91% — PASS.**
- Boundary verdict: GO. Pilot GO bars met: named 11/12 ≥ 11/12, generic
  8/8 ≥ 7/8, dried 0.91% ≤ 2%.

Named family-seed rows, boundary (old total in parentheses):

- 9821 Burdock: 0 (0) PASS
- 9821 Muscadine Grapes: 0 (0) PASS
- 9822 Burdock: 0 (0) PASS
- 9822 Muscadine Grapes: 0 (0) PASS
- 9823 Burdock: 0 (+270) PASS
- 9824 Muscadine Grapes: 0 (+1,800) PASS — one of the two predicted
  day-100-draw flips
- 9824 Burdock: 0 (+1,800) PASS — the other predicted flip
- 9825 Muscadine Grapes: −864 (−864) PASS
- 9825 Lamb's Quarters: −800 (+1,130) FAIL — see "Lamb's Quarters
  reconciliation" below
- 9826 Lamb's Quarters: 0 (0) PASS
- 9826 Burdock: 0 (0) PASS
- 9827 Purslane: 0 (0) PASS

Generic family-seed rows, boundary (old total in parentheses):

- 9820 Foraged food: +259 (+459) PASS
- 9821 Foraged food: 0 (+1,759) PASS
- 9822 Foraged food: 0 (+3,177) PASS
- 9823 Foraged food: −396 (−602) PASS
- 9824 Foraged food: 0 (−800) PASS
- 9825 Foraged food: 0 (+510) PASS
- 9826 Foraged food: −288 (−91) PASS
- 9827 Foraged food: 0 (0) PASS

Boundary mechanics observed on the pilot band:

- Day-100 meal draws: 82 records (21 pantryDraw + 61 mealCall) — the flow
  the boundary moves.
- Day-100 stockSurplus pushes: 44 records — moved together with the meal
  draws, as the prereg requires.
- Direct day-100 records: 0 — none to list, none adjusted (daytime flows
  are already in the snapshot).
- Day-101 spoil sweeps: 7 (every seed except 9827, which recorded 99
  sweeps) — post-horizon, excluded from boundary flows and closing.
- Seed 9827 recorded no day-100 night meal at all (0 meal draws, 0
  surplus pushes), so its boundary adjustment is zero — the definition
  handles a missing night meal naturally.

## Confirm legs (seeds 9850–9861, fresh band)

Collision check (re-recorded in this header before sweeping, as the prereg
requires): seeds 9850–9861 had no corpus JSON filenames and no mentions in
`evidence/2026-10-26/*.md` or `evidence/2026-10-27/*.md` at check time
(2026-10-27, before the prereg commit). Seeds 9768–9779 were explicitly
excluded as spent-but-unjudged stockdoors post-commit scratch. Limitation:
the filename search covers corpus JSON filenames (where seeds live as
identifiers), not every standalone number inside JSON payloads — a kcal
value is not a seed use.

- Leg 1 det-gate (DIAG): PASS. Same proof run (det-gate seed 9820,
  on-run/off-run identical). The corpus-9820 reproduction check is skipped
  for the confirm dir by design — 9820 is absent there.
- Leg 2 coverage (DIAG): PASS. Stockdoor records on 12/12 seeds, dried
  events on 12/12 seeds, linked transformed share 100.0%. (The analyzer
  prints "12/8" because its label text is pilot-calibrated; the count is
  12 of 12 — cosmetic, see "Metric review".)
- Leg 3 named (old): 5/5 (100.0%) — PASS. Pooled −864 / 300,730 = 0.287%.
- Leg 4 generic (old): 12/12 (100.0%) — PASS. Pooled 735 / 3,722,318 =
  0.020%.
- Leg 5 dried (old): pooled 10,163 / 982,662 = 1.03% — PASS.
- Old-boundary verdict on confirm: GO. Reported as an observation only —
  the confirm never overrides the pilot, and the pilot's old-boundary
  NO-GO stands as the control.
- Leg 3 named (boundary): **5/5 (100.0%) — PASS.** Pooled −864 / 300,730
  = 0.287%. Named rows are identical under both definitions on this band
  (the boundary adjustments net to zero for the named families here):
  9850 Purslane 0, 9851 Burdock 0, 9856 Muscadine Grapes 0, 9858 Lamb's
  Quarters 0, 9861 Burdock −864 (0.98%, passes).
- Leg 4 generic (boundary): **12/12 (100.0%) — PASS.** Pooled −4,042 /
  3,722,318 = 0.109%. Rows: 9850 0, 9851 −218, 9852 −160, 9853 −462,
  9854 −477, 9855 −24, 9856 −1,114, 9857 −313, 9858 0, 9859 −298,
  9860 −176, 9861 −800.
- Leg 5 dried (boundary): **pooled −3,554 / 982,662 = 0.36% — PASS.**
- Confirm verdict: **CONFIRM-GO** (named 5/5 ≥ 80% + pooled 0.287%,
  generic 12/12 ≥ 80% + pooled 0.109%, dried 0.36% ≤ 2%).

Boundary mechanics observed on the confirm band:

- Day-100 meal draws: 125 records (32 pantryDraw + 93 mealCall).
- Day-100 stockSurplus pushes: 64 records.
- Day-101 spoil sweeps: 10 (every seed except 9850 and 9861, which
  recorded 99 sweeps) — post-horizon, excluded.
- Seeds 9850 and 9861 recorded no day-100 night meal (0 meal draws, 0
  surplus pushes) — adjustment zero, as on pilot seed 9827.
- Direct day-100 records: 8 — listed here, NOT adjusted, per the prereg
  (daytime flows are already reflected in the snapshot):
  - Seed 9854, player-take ×7, all Foraged food (dried): 400, 226, 160,
    160, 160, 160, 160 kcal (total 1,426 kcal).
  - Seed 9857, alien-raid ×1: Foraged food ×3 = 600 kcal.
  - The boundary legs above already treat these as daytime flows; no
    silent adjustment was made, and none is needed for the verdict.

## Lamb's Quarters reconciliation (the −120 figure)

The prereg's "−120 net" is Lamb's Quarters 9825's OLD dried-channel
residual on the residualhunt corpus. The judged figures for that
family-seed in this run, on the new pilot corpus:

- Old total residual: +1,130 (2.32% of 48,750 inflow) — FAIL at 1%.
- Old dried residual: −120 (the prereg's figure, reproduced exactly).
- Boundary total residual: −800 (1.64% of 48,750) — FAIL at 1%.
- Boundary dried residual: −800.
- The shift from old to boundary is exactly the day-100 night meal: the
  meal drew 1,930 kcal of Lamb's Quarters that night, 680 kcal of it dried
  (old total 1,130 − 1,930 = −800; old dried −120 − 680 = −800). The
  family-seed's stockSurplus term is zero — surplus pushes credit only the
  generic family — so nothing offsets the meal for this family.
- This is the single failing row that makes the pilot 11/12 rather than
  12/12, and 11/12 is still GO under the verbatim threshold. The miss is
  reported, not hidden, not re-barred: the night meal alone exceeds 1% of
  this family-seed's inflow because the family's inflow (48,750) is small
  next to its night-meal draw (1,930). No separate dried-channel leak is
  evidenced — the −800 IS the meal effect.

## Reachability verdict

Instrument limits, stated plainly: this instrument records wave reach,
village rank, and national/table/win flags. It does not record story arcs
(Arc II/III/IV) or a regional step as separate fields, so no arc numbers
are claimed here — the verdict below is on waves, rank, national, table,
and win only.

- Waves: wave 1 and 2 reached on every seed; wave 3 reached on 3/8 pilot
  seeds (9822, 9824, 9825) and 9/12 confirm seeds; **wave 4 and wave 5
  reached on 0/20 seeds.**
- Rank: village on all 20 seeds — no seed rose above village rank.
- Regional step: no seed is recorded above village rank, so no regional
  step is evidenced on either band.
- National: 0/8 pilot, 0/12 confirm.
- Table: 0/8 pilot, 0/12 confirm.
- Win: 0/8 pilot, 0/12 confirm.
- The village survives but does not advance: 100 days of stable village
  life, no fourth wave, no seat, no win. The reachability wall stands as
  its own blank for a future run; this run's blank was the ledger boundary,
  and that one closed.

## Wall numbers

Pilot (8 seeds, 100 days each, all survived):

- National 0/8, table 0/8, wins 0/8, wave 4–5 unlocks 0/8.
- Median survival: 100 days. Deaths: 38 total.
- Death causes: sickness 17, monster 5, ambush 4, a wound that wouldn't
  close 4, the arena 3, contest 2, sunback 1, alien 1, dehydration 1.

Confirm (12 seeds, 100 days each, all survived):

- National 0/12, table 0/12, wins 0/12, wave 4–5 unlocks 0/12.
- Median survival: 100 days. Deaths: 43 total.
- Death causes: the arena 18, monster 8, ambush 4, a wound that wouldn't
  close 2, dehydration 2, contest 1, starvation 1, alien 1, ad break 1,
  nostalgia 1, the ugly beast 1, dustboar 1, the night 1, sickness 1.
- The cause profile flips between bands — sickness dominates the pilot,
  arena deaths dominate the confirm — while survival stays at 100 days
  on both. The village is not dying out; it is losing people to fights
  and illness at a steady rate and replacing them.

## Village assessment (plain words)

What the village looked like: on every one of the 20 seeds, a small
settlement that made it through 100 days without collapsing. Pantries
stayed stocked, cooking happened daily, and the smoke racks kept food
from going bad. Nobody's village starved out on the pilot band; across
the confirm band there was a single starvation death among 43. The
village is fed. It is also stuck: same rank, same scale, same life at
day 100 as at day 1, with no step toward the wider world.

Who thrived and who died, and why: most villagers lived the full 100
days. The ones who died mostly died of sickness on the pilot band (17 of
38) — illness is the main killer there — and in arena fights on the
confirm band (18 of 43), with monsters and ambushes taking a steady toll
on both. On pilot seed 9820, for example, two villagers were killed by a
monster on day 17, one died in the arena on day 21, and one died in a
contest on day 88. Death is a background cost of village life here, not
a collapse.

What was missing: anything beyond village life. No fourth wave arrived,
no regional standing was earned, no seat at the table was offered, no
ending was reached. The food system works — that is what this run
measured — but food alone does not move the village forward in 100 days.

Which blank was filled: the ledger-boundary blank. Before this run, the
books did not balance and nobody could say whether food was really
vanishing or the counting was wrong. Now the counting is fixed: the
night meal was being charged against a snapshot taken before it
happened. With the snapshot moved to after the meal, the books balance
on both bands, within tolerance, on every family except one small miss
(Lamb's Quarters 9825, explained above). The blank this run filled is
the measurement itself — the village's food is accounted for.

## Sense-transcript sample (seed 9820, day 12)

One sampled day, judged for meaning, coherence, and relevance — not just
counts:

- The day's headline, in the village's own words: "Megan cooked for the
  haven — meals stretched. Megan worked the smoke racks too — 3 batches
  preserved (~1568 kcal, keeps for weeks)."
- What actually happened that day: villagers drew meals at home and away
  (15 meal records, mostly night-meal calls, plus pantry draws of
  Expedition haul); the shared store took 9 surplus pushes; Megan turned
  food that would spoil in 2 days into stores that keep for 40 days —
  one batch went from 1,000 kcal fresh to 990 kcal dried, about a 1%
  loss. That is the food ladder working as the village's survival story
  says it should: cook it, dry it, keep it.
- Judgment: the day reads as a working village, not numbers spinning.
  Cooking, preserving, eating, and storing all line up with each other —
  the person named in the cook line is the person on the smoke-rack
  records, and the preserved food's longer life is visible in the
  numbers. One recording quirk: the night-meal records list no items,
  while the pantry-draw records do — so what the village ate that night
  is legible from the draws, but the meal records alone don't say it.
  That is a gap in the record, not in the village's behavior, and it
  does not change the ledger verdict.

## Proof

- `scripts/test-ledgerbound-b.js` — GREEN on the pinned base for the
  pilot corpus (exit 0), and GREEN on the pinned base for the confirm
  corpus (exit 0, `LEDGERBOUND_CORPUS_DIR` override).
- Pilot proof checks: 8 corpus files valid; all 7 direct methods wrapped
  on every seed; corpus reproduces the residualhunt corpus (excluding
  `ms`) on all 8 matched seeds; det-gate byte-identical with corpus-9820
  reproduction 255/1249/4/163; independent old + boundary leg
  recomputation matches the analyzer on every leg; stockdoor invariant
  holds; zero event-take return mismatches; no unknown direct paths;
  hygiene passes with the pinned-`game.js` allowance applied in BOTH
  hygiene checks (the only uncommitted tracked file in either proof run
  was the pinned `game.js` itself).
- Confirm proof checks: same det-gate and leg-recomputation passes on
  the 12-file confirm corpus; corpus-9820 reproduction and
  residualhunt-corpus reproduction skipped by design (9820 absent from
  the confirm band); hygiene passes the same way.
- No jest run was needed (no game-code change exists); no concurrent
  jest was run.

## Balanced panel (MEASUREMENT.md §15)

No game-code change exists in this run, so there is no before/after
balanced panel — there is nothing to panel. The instrument before/after
is the det-gate: the same seed run with the measurement on vs off
produces identical inflow, mealdraw, spoilvol, and driedpath records,
identical death lists, and identical wall fields. The measurement does
not change the game it measures.

## Metric review

- The boundary definition works and generalizes: it flips exactly the
  predicted rows on the pilot band (the 9824 pair plus the generic
  family) and holds on a fresh band with a different death-cause profile
  and a different wave mix.
- The Lamb's Quarters 9825 miss is a real miss, not rounding: −800 on
  48,750 is 1.64%, and it is fully explained by the night meal. It does
  not block GO, but it shows the boundary still leaves a small family
  outside tolerance when its night-meal draw is large next to its
  inflow. A future run should ask whether that is acceptable noise for
  small families or whether the bar should be pooled-only for families
  under some inflow floor — that is a question for the next prereg, not
  a re-score of this one.
- The confirm named count is small (5 rows): the 10,000-kcal focal filter
  admits few named families on the confirm band. The pooled bar still
  binds (0.287%), but a rate bar on 5 rows is weak evidence. A future
  prereg should consider a lower focal threshold or a minimum named-row
  count before spending a confirm band.
- The analyzer's leg-2 label prints "/8" even on the 12-seed confirm
  band. Cosmetic only — the count (12) is correct — but the label should
  be fixed the next time the analyzer is touched. It is not a judged
  change and was not made here.
- Seeds with no day-100 night meal (9827, 9850, 9861) needed no
  adjustment, and the boundary handled them with adjustment zero. That
  is a point in favor of the definition: it does not invent a meal that
  did not happen.
- Direct day-100 records do exist on the confirm band (8 records, listed
  above) and were correctly left unadjusted as daytime flows. The
  prereg's "list, don't adjust" rule held.

## Infrastructure notes (for the next worker, not the verdict)

- Container write flap (EPERM): on 2026-10-27, worktree file writes
  intermittently failed with EPERM (0-byte files), and git index writes
  failed persistently for about 20 minutes (06:57–07:17 UTC) before
  clearing. Response was wait-and-retry, never ref surgery, never the
  main tree. The prereg commit landed at 07:17:29 UTC.
- Safe-commit index clobber: after the prereg commit, the main index
  showed all 6 committed files as deleted while the worktree files
  existed as untracked. Repaired with the documented recipe
  (`git update-index --add --cacheinfo "100644,<blob-from-HEAD>,<path>"`
  per file), verified with empty status, empty diff, and matching
  hashes. The commit itself was correct; only the index lied. The same
  check must be run after the evidence commit below.
- Per-seed gaps in the sweep (up to ~2 minutes between file writes) are
  normal for this instrument; they are not failures.

## Pinned-base discipline

- Backup (outside the repo):
  `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/sim-ledgerbound-b/gamejs-backup.js`,
  hash-verified as the worktree's pre-pin blob
  `bfa3631982cb2233fdc40ff54c4269bd2649c1fd`.
- Pinned blob swapped in:
  `b2ba423afdfbdce8c98751ef544f10805b46cfa6` (verified by hash after
  the swap; diff vs HEAD at swap time was 2 insertions, 15 deletions).
- Pilot sweep, pilot proof, confirm sweep, and confirm proof all ran on
  the pinned base. The pin was never committed.
- Restored from the backup after the confirm proof; verified
  `git hash-object src/js/game.js` =
  `bfa3631982cb2233fdc40ff54c4269bd2649c1fd` and
  `git diff HEAD -- src/js/game.js` empty.

## Corpus

- Pilot: `evidence/2026-10-27/sim-ledgerbound-b-corpus/` — 8 files
  (`ledgerbound-b-competent-nofeast-s9820.json` … `s9827.json`).
  Pilot per-seed counts (stockdoor / direct / dried): 9820: 640/23/163,
  9821: 849/115/109, 9822: 693/128/97, 9823: 465/237/107, 9824:
  501/73/73, 9825: 398/97/139, 9826: 827/9/98, 9827: 757/8/107 — matching
  the residualhunt census exactly.
- Confirm: `evidence/2026-10-27/sim-ledgerbound-b-confirm-corpus/` — 12
  files (`ledgerbound-b-competent-nofeast-s9850.json` … `s9861.json`).
  Confirm per-seed counts (stockdoor / direct / dried): 9850: 865/124/130,
  9851: 758/84/98, 9852: 824/94/123, 9853: 729/30/116, 9854: 708/23/85,
  9855: 879/31/94, 9856: 553/173/104, 9857: 743/10/91, 9858: 792/10/125,
  9859: 788/14/103, 9860: 863/6/83, 9861: 697/57/98.
- All 20 seeds: 100 days, survived, rank village.
