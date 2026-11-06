# The HOLD — arm sim-hold-b (Loop B, fleshout-loop-b-20261106T1130Z)

Verdict: **NO-GO** — decided by the confirm kills guard. Clause 1 and
clause 2 pass in both stages and the survival guard passes in both
stages, but the confirm's wave-4 ledger guard fails: armed 1 vs
baseline 5 (0.2x, bar 0.5x). The lever is NOT landed. The policy
(`scripts/policies/linkseek-hold.js`) stays unmerged; nothing in
`src/js` changed in this arm.

## Adoption note (this run)

Adoption of the stranded HOLD arm for the dead Loop B run
fleshout-loop-b-20261106T0930Z. The first HOLD worker died at
10:28:32Z from a runtime transport failure; an adoption worker ran
10:30:47Z–11:33:40Z and was cancelled before finishing. This run
verifies, judges, and closes out that arm. Adopted work: prereg
commit 8653b29fe, instruments/lever/proof commit 76276a8d0 (proof
36/36 at that commit), plus uncommitted work — 4 modified scripts
and the untracked per-seed corpus (32 judged legs) + analysis JSONs
+ the combined balanced panel (completed this run: the 2 missing
panel jobs, linkseek-hold 58005/58008 observe=1, ran fresh; the
other 16 cases were reused from cache).

## Canon read

- `docs/CANON.md` (manifest). No canon doc covers link trust /
  tribute mechanics in full — stated here, not invented: the
  mechanism lives in `src/js/standing.js` (`_linkRegionalPlus`),
  `src/js/hierarchy.js` (`polityOf`, `tendLink`, `linkTick`,
  `successionCrisis`, `theirLeaderDied`, `answerRenegotiation`,
  `_trustGain`, `_linkNeglected`), and the leadcourt/linkseek
  policy (tends, tribute). There is no canon doc to cite for the
  hold; this file says so.

## The lever (policy-side only, prereg 8653b29fe)

`scripts/policies/linkseek-hold.js` = linkseek verbatim + hold layer:
1. Answer renegotiation beats the day they are seen — 'gift'
   (1,500 kcal, +8 trust) when Haven's pantry tops 4,500 kcal,
   else 'visit' (+5, or +2 with an empty bench).
2. Tend guard 20000 → 6000, lowest-trust first; pantry re-read
   before each tend, so a thin pantry self-throttles.
No gate/price/deed/readyDemand change. No game-code change.

## Prereg bar (binding — judged only against this)

GO iff ALL of: (1) armed end-rank national+ >= baseline +2 seeds
on the 8-seed pilot; (2) >= 1 additional seed holds all 3 links
seasoned to day 150 (end diplomacy 102) OR the realm persists >= 30
days longer than baseline on seeds where both legs form it;
(3) guards: median survival armed >= 0.8x baseline; total wave-4
ledger points armed >= 0.5x baseline total (POOLED counts per the
0730Z metric review); no new death mode. A miss on any clause is
NO-GO, never re-scored against a friendlier metric mid-run.

## Corpus verification (independent, this run)

All 32 judged per-seed files
(`evidence/2026-11-06/perseed-hold-b/hold-s{58001–58008,59001–59008}-{linkseek,hold}-{hold-pilot,hold-confirm}.json`)
were verified with an independent Python re-implementation
(`/tmp/verify-hold.py`, 248 checks, 0 failures — not the repo
analyzers): every file parses, run/seed/leg/arm match the prereg
method (two legs per seed, identical seeds, 150d death-aware,
baseline `linkseek` verbatim vs armed `linkseek-hold`,
anchorCommit 8653b29fe), instrumentErrors = 0 on all 32 legs, all
32 legs end `village-lost` (0 wins either leg), days <= 150.
Every judged number in both analysis JSONs (all rows, all wall
numbers, all clauses and guards) recomputes exactly from the raw
per-seed files. No per-seed file was corrupt or missing; no seed
was re-run. The 3 stage-0 smoke legs (58001–58003, linkseek leg
only) remain unjudged smoke output, as preregistered.

## Analyzer versions — what produced the numbers (disclosed)

The 4 modified scripts are legitimate fixes by the cancelled
adoption worker, not drift. Proven by running BOTH versions:

- The analysis JSONs on disk are **byte-identical to the output of
  the modified (uncommitted) scripts** on re-run (judge analyzer
  pilot + confirm; eater analyzer pilot + confirm), and DIFFER from
  the committed HEAD scripts' output. The JSONs were produced by
  the modified scripts. The judge analyzer itself is unmodified
  (HEAD vs current judge output identical).
- HEAD eater analyzer under-attributes badly on this corpus:
  pilot coverage off 1.000 on 11/16 legs (up to 1.514, 418
  unexplained trust-points); confirm off on 12/16 legs (up to
  1.257, 444 unexplained). The modified analyzer: coverage exactly
  1.000 on all 30 active legs (58004 both legs: no links formed,
  village died d44 — coverage null, absDelta 0), unexplained 0 of
  absDelta 3679 (baseline) / 3054 (armed) pooled.
- The fixes (all in `scripts/hold-eater-analyze-20261106.js`):
  multiset (not set) history diff — two same-day deaths write
  byte-identical notes; sequential running-trust clamping —
  `_trustGain` RETURNS the nominal gain even when the 100-cap or
  mourning swallowed it, so tend notes print "+8" for +0/+3 that
  actually landed; mourning window judged by the ENTRY's day, not
  the snapshot day; succession -8 keyed off the NOTE text, not the
  pending flag (the hold policy answers beats the same day, so the
  flag was already cleared by snapshot time); first-court
  feast/host/word/cold attribution from the note; spy
  day-boundary skip + interval matching for aid answers.
  Headline effect of the fixes (HEAD → fixed, pooled pilot):
  speaker-death -664 (83) → -1024 (128); tend 1112 → 1067;
  court entries move out of `history-other:court` into
  `court-feast` / `court-feast-choked`. Confirm: speaker-death
  -1096 (137) → -1368 (171); tend 1859 → 1772; aid-offer-accepted
  380 (108) → 372 (102) — 6 phantom +4s removed.
- The proof suite grew with the fixes: 36/36 at commit 76276a8d0
  → **42/42 now** (`node scripts/test-hold-20261106.js`), the 6
  new checks covering the day-boundary spy skip, the same-day
  answered-beat -8, the cap lie, and court feast/cold.
- `scripts/hold-instrument-20261106.js`: one-line fix — the aid
  spy now reads the method from arguments[1] for kind
  'renegotiation' too (it was taking arguments[0], the link id).
  Disclosure: the recorded corpus still carries the old shape —
  41 of the 75 renegotiation spy records have a link id in `how`
  (all on armed legs; baseline legs never answer a beat, so they
  have no such records). No code reads `how` (grep over the hold
  scripts finds no consumer), so no judged number depends on it;
  the fix is for future recordings only.
- `scripts/sweep-compare.js`: registered `linkseek-hold` in
  POLICY_REGISTRY so the balanced panel could build its column.
  The panel was built with the registration in place — but the
  registration is REVERTED in the committed tree, not carried
  forward (see the check.js note below: it was first suspected
  of breaking `test-measurement-cache-flags.js`, then
  exonerated — the test fails identically with HEAD
  `sweep-compare.js` under current box contention — and since
  the lever is killed, a dead policy's registry entry is not
  kept). To rebuild the panel, re-add the one-liner (same
  pattern as linkseek, `try { const lh =
  require('./policies/linkseek-hold'); POLICY_REGISTRY['linkseek-hold']
  = lh.linkseekHold; } catch (e) {}`) and re-run the panel
  command in the Balanced panel section.
- No modification changes any JUDGED number: the judge analyzer
  is unmodified and its outputs are identical under HEAD and
  current scripts. The eater fixes change only attribution
  (which eater a trust point belongs to), never the per-seed
  rows the verdict is judged on.

## Pilot — GO (58001–58008)

| clause | baseline | armed | bar | pass |
|---|---|---|---|---|
| 1. end-rank national+ | 0 | 4 | >= baseline+2 (=2) | YES |
| 2. holds all 3 to end | 1 | 4 | >= baseline+1 | YES |
| 2b. realm persistence (both formed) | 58005: 5d, 58008: 11d | 58005: 51d (+46), 58008: 25d (+14) | gain >= 30 | (moot — holds clause passes) |
| guard: median survival | 72d | 82d (1.14x) | >= 0.8x | YES |
| guard: ledger-4 total | 1 | 2 | >= 0.5x | YES |

Wall (pilot, per leg): wins 0/0; national 0/0; global 0/4; table
0/0; national+ end 0/4; wave-4 unlock 4/4; wave-4 faced 4/4;
wave-5 unlock 0/0; wave-5 faced 0/0; median survival 72/82;
survivors (150d) 0/0; ledger-4 total 1/2; readiness-5-ready days
0/0; ledger-5 0/0.

Per-seed pilot (days / end rank / realm span / ledger-4,
baseline → armed): 58001: 47 regional / 83 global, 0→23d, 0→0;
58002: 76 regional / 88 global, 0→3d, 0→1; 58003: 94 regional /
73 regional, 0→0d, 1→0; 58004: 44 village / 44 village, 0→0d,
0→0; 58005: 124 regional / 112 global, 5→51d, 0→1; 58006: 72
regional / 46 village, 0→0d, 0→0; 58007: 60 village / 53
village, 0→0d, 0→0; 58008: 68 regional / 82 global, 11→25d,
0→0. Holds-all-3: baseline 58008 only; armed 58001, 58002,
58005, 58008.

## Confirm — NO-GO (59001–59008)

| clause | baseline | armed | bar | pass |
|---|---|---|---|---|
| 1. end-rank national+ | 2 | 4 | >= baseline+2 (=4) | YES (exactly at bar) |
| 2. holds all 3 to end | 4 | 5 | >= baseline+1 | YES |
| 2b. realm persistence (both formed) | 59001: 56d, 59002: 53d, 59004: 11d, 59007: 75d, 59008: 15d | 59001: 2d (-54), 59002: 16d (-37), 59004: 20d (+9), 59007: 31d (-44), 59008: 59d (+44) | gain >= 30 | (moot — holds clause passes; 3 of 5 gains negative) |
| guard: median survival | 92d | 81d (0.88x) | >= 0.8x | YES |
| guard: ledger-4 total | 5 | **1 (0.2x)** | >= 0.5x | **NO — this decides the verdict** |

Wall (confirm, per leg): wins 0/0; national 0/0; global 2/4;
table 0/0; national+ end 2/4; wave-4 unlock 7/7; wave-4 faced
7/7; wave-5 unlock 0/0; wave-5 faced 0/0; median survival 92/81;
survivors (150d) 0/0; ledger-4 total 5/1; readiness-5-ready days
0/0; ledger-5 0/0.

Per-seed confirm (days / end rank / realm span / ledger-4,
baseline → armed): 59001: 116 regional / 61 regional, 56→2d,
0→1; 59002: 116 global / 81 global, 53→16d, 2→0; 59003: 78
regional / 73 regional, 0→0d, 0→0; 59004: 79 regional / 88
global, 11→20d, 0→0; 59005: 75 regional / 81 regional, 0→0d,
0→0; 59006: 92 regional / 61 regional, 25→0d, 1→0; 59007: 143
global / 97 global, 75→31d, 2→0; 59008: 78 regional / 122
global, 15→59d, 0→0. Holds-all-3: baseline 59002, 59004, 59007,
59008; armed 59001, 59002, 59004, 59007, 59008.

The confirm is judged on the confirm's own numbers. The ledger
guard is a pooled-count guard (0730Z metric review), and the
confirm cell alone is 1 vs 5 — not a thin-cell artifact: the
baseline confirm legs banked kills on 59002 (2), 59006 (1) and
59007 (2), and the armed legs on those same seeds banked 0, 0,
0. The one armed ledger point is 59001, where the armed leg died
at d61 after forming its realm at d58.

## Pooled (pilot + confirm, n=16 per leg)

- End-rank national+: armed 8 vs baseline 2.
- Holds all 3 to end: armed 9 vs baseline 5.
- Wins 0/0. Wave-5 unlock 0/0, wave-5 faced 0/0. Ledger-5 0/0.
  Readiness-5-ready days 0/0 — no leg ever stood ready, so
  release-after-ready could not be tested by this arm either.
- Wave-4 ledger (the guard's pooled reading): armed 3 vs
  baseline 6 = exactly 0.5x — the pooled reading sits ON the bar
  while the confirm cell (1 vs 5) fails it. See metric review.
- Median survival pooled: armed 81d vs baseline 78d (1.04x).

## Eater table (pooled pilot + confirm, per leg)

Coverage 1.000 on all 30 active legs, unexplained 0 (see
analyzer-versions section). Speaker-death vs renegotiation-lapse
split — the two eaters the lever was built against:

| eater | baseline (n) | armed (n) |
|---|---|---|
| tend | +1406 (180) | +1433 (192) |
| speaker-death | -1200 (150) | -1192 (149) |
| accord-gift | +440 (44) | +400 (40) |
| aid-offer-accepted | +356 (94) | +304 (86) |
| renegotiation-lapse | -288 (48) | 0 (0) |
| renegotiation-gift | 0 (0) | +416 (52) |
| renegotiation-other | 0 (0) | +60 (12) |
| renegotiation-visit-word | 0 (0) | +22 (11) |
| tribute-waived | +148 (155) | +104 (106) |
| titan-strike | -100 (20) | -90 (18) |
| tribute-paid | +82 (84) | +74 (87) |
| aid-beg-gave | +32 (8) | +44 (11) |
| aid-beg-refused | -5 (1) | -20 (4) |
| tribute-shortfall | -4 (2) | -3 (2) |
| succession-grief-priced-in | 0 (210 events) | 0 (166) |
| choked gains (tribute/court/feast) | 0 (114 events) | 0 (109) |

Per stage: pilot baseline speaker-death -472 (59), lapse -156
(26); pilot armed -552 (69), lapse 0, gift +232 (29).
Confirm baseline speaker-death -728 (91), lapse -132 (22);
confirm armed -640 (80), lapse 0, gift +184 (23).

Tend weeks (pooled): baseline landed 174 / missed-opportunity
4 / guard-blocked 150 / choked 59 (387 link-weeks); armed landed
234 / missed-opportunity 0 / guard-blocked 37 / choked 45 (316
link-weeks). The lever did what it was built to do: lapses go
48 → 0, guard-blocked tend weeks 150 → 37, landed tends 174 →
234. What it did NOT do: speaker-death is unchanged (-1200 vs
-1192, 150 vs 149 events) — the deaths themselves don't stop;
the lever only answers the beats they stage. And the armed
confirm tend sum (+862) is LOWER than baseline (+910) despite
more landed tends (139 vs 116): armed links sit at the trust-100
cap more often, so +8 notes land +0..+3 — the cap-lie the
analyzer fix corrects for.

## Balanced panel (§15)

Combined panel `evidence/2026-11-06/panel-hold-both/` (both
policies, one panel; pilot seeds 58001–58008, 150d):
`panel.json.gz` + 18 case files (16 reused from cache, 2 ran
fresh this run). Validity: sourcesStable true, observer-neutrality
proofs match for both policies on seed 58001, 0 observer errors,
0 warnings, 0 gear errors.

Panel rows (pilot): wins 0/0; national 0/4; table touched 1/8
both legs (58008, maxArc 4), ENTERED 0/8 both; waveReach 3:4 /
4:4 both legs; maxRank baseline regional 6 / village 2, armed
global 4 / regional 1 / village 3; median days 72/82.

Death causes (panel observer, pilot): no new death mode. Armed
legs kill slightly more monsters (villager:monster 26 vs 25;
monster:villager combat 188 vs 180; monster:expedition 68 vs 64)
and lose fewer villagers to the wild (player:the wild 38 vs 46),
but starvation deaths double (villager:starvation 12 vs 6) and
thirst deaths appear only on armed legs (villager:thirst 3 vs 0).
Thirst is a pre-existing game death cause, not a lever-introduced
mode — the same reading linkseek-b gave its armed-only starvation
(5 vs 0): a cause appearing in one 8-seed cell is sampling, not
a new mode. The tend grain (1,500 kcal per tend, 234 landed
tends armed vs 174 baseline) is the plausible pressure — see
metric review. Median survival still rose (82 vs 72), so the
food pressure did not cost the run.

`compare` note (linkseek precedent, unchanged): the
`balance-panel compare` subcommand matches identical policy sets
across two panels (a flag on/off); it returns "invalid —
unmatched policies / unmatched cases" for a policy-vs-policy
comparison. Per the sim-awayeve-b / sim-linkseek-b precedent,
the §15 instrument for policy-vs-policy is the matched-seed
paired comparison (identical seeds, same harness, same
instrument) that the judge analyzer performs — and the combined
panel above is attached for the observer-neutral 23-metric rows.
No `compare` was re-attempted this run: the refusal is already
on record for this exact shape, and the combined panel is the
instrument that applies.

Telemetry deviation check: `telemetry-check.js` REFUSES the
per-seed corpus — "all 16 --current rows carry top-level
anchorCommit, so they are sweep recorder rows, not runs.
Recorder corpora are compared with sweep-compare tables, never
against a run baseline here." Recorded as a refusal, not a
result; the wall comparison is the analyzer + panel above (the
same conclusion linkseek-b reached for its spurious LOUD lines).

## Village assessment (plain words)

Sixteen villages, each played twice — once by a scholar who lets
grief go unanswered, once by one who answers every knock at the
door with grain or a visit. The answering villages hold their
bonds: nine of sixteen keep all three links seasoned to the end,
against five of sixteen for the silent ones, and eight climb to
national rank or beyond where only two did before. The realm
holds longer on the pilot seeds — one village kept its three
bonds fifty-one days where the silent twin lost them in five.
But the confirm seeds tell the other half: on three of the five
seeds where both villages formed a realm, the answering village
held it FEWER days than the silent one, and the villages still
die — every one of the thirty-two legs ends village-lost, most
before day 100, none ever standing ready, none ever facing the
fifth wave. The bonds are held now; the fighters still aren't
there. The hold fixes the diplomacy blank linkseek left — trust
no longer bleeds out unanswered — and the next blank is the one
this arm's own guard caught: the villages that hold their realms
are not the villages that kill wave-4 beasts. On the confirm
seeds the silent villages banked five wave-4 kills and the
answering ones one, on the same seeds, with the same fights in
front of them. Grain answers grief; it does not win fights.

## Sense-test (quoted lines)

History notes and standing lines are coherent against the numbers
on sampled seeds:

- "Met grief with grain (1,917 kcal, trust +8); the tribute
  leverage never landed." (59008 armed d29 — an answered beat,
  the gift the lever exists to send.)
- "Young link: grief delays the verdict — a renegotiation is
  staged." (59008 armed d29 — the beat the gift answers.)
- "Haven sent grain (1,500 kcal, trust +8); the bond is fed."
  (58005/59008 — the weekly tend, landing as the trust
  trajectory shows.)
- "Emberhold rode in ready to pay; waved home — our shelves are
  full past tomorrow. (Waiver: the week counts paid, no
  arrears.)" (58005/59008 d28 — the waiver, honest about why.)
- "First court: shared granary feast (1,276 kcal)." (58005
  armed d77 — a thin-pantry feast; the analyzer prices it at +3,
  not the full +10, which is the honest number for 1,276 kcal.)
- "Standing 227 (war 125 · bonds 102 · bread 0) — wave 4 at
  100, wave 5 at 200 — HELD at wave 4: the fifth draft waits
  (blood your fighters (0 of 2 veterans))" (58005 armed d60 —
  the standing line names the veteran bar the village is short
  on; the numbers match the analyzer's 0 ready days.)
- "HELD at wave 3: not ready to fight the next draft (armor the
  village (2 of 3 fighters armored))" (59008 armed d63 — the
  gate names the armor gap, not a generic refusal.)
- "You see smoke on the horizon. Emberhold — 12 people, 3 days
  in. fishing folk, by the look of it. They know 2 plants — 2
  new to you. They've been here the whole time." (58005 armed
  d3 — first sight names a real village, a real population,
  real knowledge.)
- "A runner from Emberhold, dusty and direct: 'Your foragers
  are stripping our side of the northeast ground. Back off —
  or we'll talk with teeth.' (Trust -3. The commons cuts both
  ways.)" (59008 armed d13 — the neighbors push back over a
  real shared ground; the friction is legible, not random.)
- Limitation (same as linkseek-b): the say sample is capped at
  300 lines and fills by ~day 32–41, so late-run standing-door
  lines are never sampled; the standing lines above come from
  the daily snapshots, not the say corpus.

## Metric review (for the NEXT run, §14 — no in-run re-scoring)

- The pooled pilot+confirm ledger reading (armed 3 vs baseline
  6 = exactly 0.5x) is NOT a re-score of the confirm NO-GO: the
  confirm is judged on the confirm's own numbers (1 vs 5), and
  the verdict stands. But the pooled landing exactly on the bar
  while the confirm cell fails it says the guard as written is
  fragile at n=8 per cell: one kill either way flips a cell.
  The next run should either judge the guard on the pooled n=16
  (as the prereg's "POOLED counts" phrase arguably already
  intends — the prereg says "total wave-4 ledger points armed >=
  0.5x baseline total (POOLED counts per the 0730Z metric
  review)" while the judge code applies it per stage) or keep the
  per-stage guard and accept that a single thin cell can kill an
  otherwise-passing arm. This run does NOT resolve that: the
  prereg's judge code applied it per stage, and metric binding
  says the run is judged as preregistered. Flagged for the next
  prereg, not re-scored here.
- The confirm's mostly-negative realm-persistence gains (3 of 5
  negative, -54/-37/-44) against the pilot's positive ones
  (+46/+14) say realm span is dominated by village lifetime, not
  by trust: the armed confirm legs died sooner (median 81 vs
  92), so their realms ended with them. Realm span as a clause
  measures survival as much as holding. A future hold arm should
  pair realm span with a survival-matched reading, or judge
  holding by end-diplomacy (holds-all-3) alone.
- The ledger guard's thinness cuts both ways: the pilot's ledger
  (2 vs 1) passed on a single kill. Small-n kill counts are the
  noisiest number in this arm; the next winnability arm should
  pre-register a kills metric with a wider band or a larger
  confirm (the reserved 8-seed band is the constraint — pooled
  n=16 is the standard met in aggregate).
- Food pressure: armed starvation deaths doubled on the pilot
  panel (12 vs 6) and thirst appeared (3 vs 0). The tend grain
  is the plausible cause (234 landed tends armed vs 174
  baseline at 1,500 kcal each, plus 52 renegotiation gifts).
  Median survival still rose, so this is a watch item, not a
  guard failure — but a future hold variant should meter the
  grain spend against pantry depth, not just the tend guard.
- Say filter: the 300-line cap fills by ~day 32–41 (same
  limitation linkseek-b noted at 200 lines); late-run lines are
  never sampled. Per-week sampling or a higher cap belongs in
  the next instrument revision.
- `check.js --quick`: 279 passed, 11 failed in 1358s (this
  worktree, 2026-11-06 ~12:00Z). The 7 linkseek-baseline
  failures are unchanged and pre-existing (measurement
  proof-update, measurement-workflow neutrality, mobile combat
  cadence, occupation panels, phone-frame proof, capable-bot
  food deed, establishment r20 voice gate). 4 are new this run
  and all 4 are timeout-shaped, not assertion failures caused
  by this arm's changes: `test-measurement-cache-flags.js`
  (0/4 under check.js) and 120s wall-clock kills of
  `test-synergy-stall.js`, `test-table-endings-20261014.js`,
  `test-trust-observer-neutrality.js` (capable-bot changed mode
  from its baseline assertion failure to a 120s timeout).
  The cache-flags failure was investigated, not assumed: with
  the `linkseek-hold` registry edit stashed it passed 4/4
  once, but with the edit it failed 3/4 then 1/4 — and with
  the edit REVERTED (HEAD `sweep-compare.js`) it failed 1/4
  again, identically. Timed single panel runs straddle the
  test's 30s spawnSync timeout on this box (19.6s–29.7s for
  the same command; a plain grep over scripts/ took 40s),
  and Loop A was running balance-panel jobs concurrently
  through this window. The failure tracks box contention,
  not the edit — the registration is exonerated, and it is
  reverted anyway because the lever is killed (see
  analyzer-versions section). The trust-observer-neutrality
  timeout was re-run standalone: 6 passed, 0 failed in 89s —
  it only exceeds check.js's 120s per-script allowance under
  4-parallel contention. No failure touches a
  hold file: the hold proof suite passes standalone 42/42,
  and no hold analyzer, instrument, or policy file is loaded
  by any of the 4 newly failing tests except
  trust-observer-neutrality (which loads sweep-compare, now
  byte-identical to HEAD).

## Convergence state

Axis scale-onramp / winnability chain: the HOLD lever is
**killed-at-confirm.** Pilot GO, confirm NO-GO on the kills
guard. The hold mechanism works (lapses 48 →
0, guard-blocked tends 150 → 37) but does not move the
winnability chain: 0 wins, 0 wave-5 facings, 0 ready days on all
32 legs. The lever is killed as a winnability arm; its pieces
(answer beats, tend at 6000) remain measured facts for the next
arm to build on, not a landing. No commit to master from this
arm's policy; the committed work here is instruments, analyzer
fixes, proof tests, panel, and this evidence.

## Files

- Prereg: `evidence/2026-11-06/sim-hold-b-prereg.md` (8653b29fe)
- Evidence: `evidence/2026-11-06/sim-hold-b.md` (this file)
- Per-seed corpus: `evidence/2026-11-06/perseed-hold-b/hold-s{58001–58008,59001–59008}-{linkseek,hold}-{hold-pilot,hold-confirm}.json` (32 files)
- Judge analysis: `evidence/2026-11-06/perseed-hold-b/hold-analysis-hold-{pilot,confirm}.json`
- Eater analysis: `evidence/2026-11-06/perseed-hold-b/hold-eater-analysis-hold-{pilot,confirm}.json`
- Balanced panel: `evidence/2026-11-06/panel-hold-both/` (`panel.json.gz` + 18 cases)
- Lever (NOT landed): `scripts/policies/linkseek-hold.js`
- Instruments/analyzers: `scripts/hold-instrument-20261106.js`,
  `scripts/hold-driver-20261106.js`, `scripts/hold-analyze-20261106.js`,
  `scripts/hold-eater-analyze-20261106.js`, `scripts/test-hold-20261106.js`
  (the `sweep-compare.js` linkseek-hold registration used for the
  panel build is REVERTED in this commit — see analyzer-versions
  section; the panel files above are the built evidence)
