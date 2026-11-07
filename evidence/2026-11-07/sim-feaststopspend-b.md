# sim-feaststopspend-b — evidence (NO-GO, killed at pilot)

**Arm:** sim-feaststopspend-b (adoption run fleshout-loop-b-20261107T2030Z,
axis scale-onramp / winnability chain) · **Policy-side only, zero src/js,
zero default flips, no changes to any existing policy file.** Stop-after-spend
wrapper (`scripts/policies/competent-feaststopspend-b.js`) composing onto the
FROZEN feast-drive substrate (`scripts/policies/competent-feastdrive-b.js`,
unmodified, composing onto the FROZEN staged substrate
`scripts/policies/competent-stageally-a.js`, unmodified).
**Prereg:** `evidence/2026-11-07/sim-feaststopspend-b-prereg.md` (FROZEN —
pair-days PRIMARY, donations in the cost bar).
**Base judged:** master **a2e005cbe** (rebased; see §Rebase below).
**Band:** 53001–53008, deliberately reused judged band.
**Horizon:** 150d death-aware. **Policies:** baseline = staged + feast drive
re-baselined on current master; armed = staged + feast drive +
stop-after-spend. **Seeds:** 8 pilot, identical both legs.

## Canon

READ first: `docs/CANON.md`. **No canon doc covers the feast/surge system
as a dedicated doc** — the same standing note as the feastdrive and feastcap
preregs. The design record is the code itself: `src/js/feastBuff.js`
(ontology header: timed buff, devotion gate, feast draw, honest use marking
— spend consumes the arming, `feastSurgeUsed` marks real combat use) and
`src/js/progression.js` (`foodDeeds = sentimentTaught && feastSurgeUsed`,
:650) plus `docs/BALANCING.md` §78–79 (FEASTED buff, feast-surge calibration,
feast draw). Nothing is invented from scratch; every mechanism claim below
is read from that code and cited to it.

## Rebase — substrate-relevant movement, re-swept (not judged stale)

The worktree was cut on master c88df9d25; master moved to a2e005cbe before
judgement. The src/js delta in the range:

- `src/js/food.js` + `src/js/game.js` (journey-establishment r112):
  specialist-ladder fix — foodXp buys skill from 0, village work grants
  foodXp (butchering a kill, working the smoke racks). This touches food
  production directly — the pantry the drive donates from — so it is
  **substrate-relevant until proven otherwise**, exactly the case the
  adoption brief names.
- `src/js/conversation.js` (journey-social r153): conversation-repeat
  fixes (pool dedup bookkeeping, opener double-speaking). Dialogue-only,
  no new `Math.random` calls, no food/feast/kill/survival path touched —
  not substrate-relevant.

Rebase onto the explicit current master SHA (read fresh from the main tree
immediately before rebasing): both picks clean, new tip d7bca6cf0 on
a2e005cbe. Proof re-run green on the rebased tip (25/25, below). Both
pilot legs were then **re-swept on the rebased tip** — the c88 corpus was
not judged stale. The re-sweep mattered: the re-baseline moved on 5 of 8
seeds (53001: 89d→145d, w4 kills 3→5; 53002: 75d→118d; 53004: 110d→131d,
w4 kills 2→8, pair days 0→29; 53006: w4 kills 4→8, donations
12,305→14,930; 53007: 101d lost→150d survived, maxWave 4→5; 53008:
150d survived→144d lost). Seeds 53003 and 53005 reproduced exactly.

Superseded c88 corpus (archived at `/tmp/fss-c88-corpus/`, analysis
verified to reproduce exactly from it before archiving): baseline pair
days 24, armed 0, foodDeeds 4/8, donations 50,180→16,335, median
97.5d→95d, survived 2/2, w4 kills 17→16, starvation 10→11, feasts 23→8,
draws 20→7, faced 12→7 — verdict NO-GO there too (pair-days 0 vs bar
35). The re-sweep changed the numbers, not the direction.

## Verdict — NO-GO, killed at pilot (no confirm spend)

| Bar (FROZEN) | Armed | Bar | Pass |
| --- | ---: | ---: | --- |
| **Pair days (PRIMARY)** | **5** | ≥ 35 | **NO** |
| foodDeeds | 5/8 | ≥ 4/8 | yes |
| Donations (armed total) | 30,230 kcal | ≤ 55,235 (re-baseline) | yes |
| Starvation deaths | 3 | ≤ 2 + 2 | yes |
| Median survival | 123.5d | ≥ 0.8 × 137.5d = 110d | yes |

Substrate sanity PASS (foodDeeds 5/8 ≥ 3, spend seeds 5 ≥ 2 — the stop
bound on 5 seeds). Substrate guard PASS 8/8 (per-seed daily rows exact
through each seed's first spend day; the wrapper delegates identically
before the deed). The primary misses by 30 pair days. Per the prereg,
a miss is NO-GO, never re-scored — the lever is killed at pilot and no
12-seed confirm runs.

## Before / after (re-baseline vs armed, identical seeds, base a2e005cbe)

| Metric | Baseline | Armed |
| --- | ---: | ---: |
| Pair days (total) | 52 | **5** |
| foodDeeds (seeds) | 5/8 | 5/8 |
| Surge spent (seeds) | 5/8 | 5/8 |
| Donated kcal (total) | 55,235 | 30,230 |
| Feasts (total) | 20 | 11 |
| Draws (total) | 14 | 9 |
| Faced (total) | 10 | 9 |
| Wave-4 kills (total) | 31 | 21 |
| Wave-5 kills (total) | 3 | 0 |
| Wave-4 unlock (seeds) | 8/8 | 8/8 |
| Wave-5 unlock (seeds) | 2/8 | 1/8 |
| Median survival | 137.5d | 123.5d |
| Survived (seeds) | 2/8 | 2/8 |
| Starvation deaths | 2 | 3 |
| Standing (total) | 1,894 | 1,559 |
| National / table / wins | 0 / 0 / 0 | 0 / 0 / 0 |
| Instrument errors | 0 | 0 |

## Per-seed table (baseline / armed)

| Seed | Days B/A | w4+ kills B/A | Pair days B/A | Spent B/A | Feasts B/A | Draws B/A | Faced B/A | Donated kcal B/A | First spend | Stop days (A) | Standing B/A | Max wave B/A | Starve B/A |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 53001 | 145 / 145 | 5 / 5 | 0 / 0 | F / F | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 | — | 0 | 199 / 199 | 4 / 4 | 1 / 1 |
| 53002 | 118 / 107 | 2 / 2 | 0 / 0 | T / T | 1 / 1 | 1 / 1 | 1 / 1 | 3,930 / 3,600 | d80 | 28 | 199 / 199 | 4 / 4 | 1 / 1 |
| 53003 | 80 / 80 | 2 / 2 | 0 / 0 | F / F | 0 / 0 | 0 / 0 | 0 / 0 | 450 / 450 | — | 0 | 199 / 199 | 4 / 4 | 0 / 0 |
| 53004 | 131 / 150 | 8 / 4 | **29 / 0** | T / T | 7 / 5 | 4 / 5 | 2 / 5 | 11,250 / 0 | d19 | 132 | 480 / 199 | 5 / 4 | 0 / 0 |
| 53005 | 94 / 123 | 3 / 2 | **18 / 0** | T / T | 2 / 1 | 2 / 1 | 2 / 1 | 13,045 / 9,605 | d20 | 104 | 199 / 199 | 4 / 4 | 0 / 1 |
| 53006 | 150 / 124 | 8 / 3 | 0 / 0 | T / T | 5 / 2 | 4 / 1 | 3 / 1 | 14,930 / 11,235 | d72 | 52 | 199 / 199 | 4 / 4 | 0 / 0 |
| 53007 | 150 / 150 | 2 / 2 | 5 / 5 | F / F | 1 / 1 | 0 / 0 | 0 / 0 | 3,510 / 3,510 | — | 0 | 220 / 220 | 5 / 5 | 0 / 0 |
| 53008 | 144 / 67 | 1 / 1 | 0 / 0 | T / T | 4 / 1 | 3 / 1 | 2 / 1 | 8,120 / 1,830 | d20 | 47 | 199 / 145 | 4 / 4 | 0 / 0 |

## The mechanism — the counter-hypothesis wins, decisively

The stop bound exactly as designed. On all five bound seeds the drive's
own post-deed activity is zero: drive-hosted feasts after spend 0,
drive donate-downs after spend 0 (baseline: 2, 0, 1, 1, 1 feasts and 1,
16, 9, 10, 4 donate-downs on 53002/53004/53005/53006/53008). Donations
fell 55,235→30,230 kcal — the cost bar passes; the stop did cut the
giving, the one thing it was built to cut. The deed is kept: foodDeeds
5/8 both legs, surge spent 5/8 both legs.

And the pairs are gone. Pair days fall 52→5, and **all 5 remaining pair
days sit on 53007, the one seed where the stop never bound** (no spend,
no deed, trajectories identical both legs). On every seed where the stop
engaged, pair days went to zero — including 53004, where the baseline
banked 29, and 53005, where it banked 18. Wave-4 kills fall 31→21 and
wave-5 kills 3→0: the kills that made pairs stopped happening, not just
the feasts. This is the prereg's counter-hypothesis in full: **the
deed's price is paid in draws, not in feasts.** Feast draws are the pair
factory — remove the post-deed draws and the overlap windows never open;
kills without overlap are not pairs.

53004 shows the shape most sharply. The staged policy's own evening
feast kept lighting after the deed — 4 post-deed feasts, 4 draws, faced
5/5 (more fights faced than the baseline's 2) — and still pair days
29→0, because wave-4 kills fell 8→4 and the survivors never overlapped.
The fights still happen; the pairs don't. Stopping the drive's
donate-down feasts removed the kills that overlapped, and the staged
feasts that remained drew scavengers without producing a second living
killer at the same time.

Two loose ends, reported not judged. (1) 53008 armed dies on day 67
against a 144-day baseline — 77 days earlier, with fewer fights and
more food kept. Post-spend trajectories diverge chaotically (different
RNG consumption once the policies part), so a single seed's swing is
not attributable to the stop causally; the median bar still passes and
survived count is flat 2/2. (2) The prereg's mechanism note predicted
that once donate-down stops, recent gives would decay below 1500 within
a week and the base's own EAT FIRST gate would close its feasts too.
That prediction failed on 53004: the staged policy lit 4 post-deed
feasts anyway. The stop applies to the drive, not the substrate, and
the substrate kept feasting — which is precisely why the pair-days
result is a fact about draws, not about a feast count.

## The village, in plain words

Eight villages, same eight starting points. Without the stop, five
villages spend the feast surge, complete the food deed, and in doing so
bank 52 days with two living wave-4 killers side by side — the thing
the whole winnability chain needs next. With the stop, the villages
keep the deed and keep much more of their food (25,000 kcal stays in
the pantries), but the pairs evaporate: 52 days become 5, and the 5
are all on the one village where the surge was never spent, so the stop
never switched on. Two villages live longer with the stop (53004 to the
full 150 days, 53005 by 29 days); two die sooner (53006 by 26 days,
53008 by 77). The same number survive to the end, two of eight. Nobody
reaches the nation, nobody sits at the table, nobody wins — the scale
wall is exactly where it was.

Death causes (both legs, monster-dominated): baseline 604 deaths —
villager combat 266, combat 128, expedition 79, the wild 65, monster 17,
sickness 17, starvation 2; armed 565 deaths — villager combat 276,
combat 86, expedition 72, the wild 66, monster 18, sickness 13,
starvation 3. No new death shape appears under the stop; the same
dangers kill people, at a slightly different pace.

Sense-testing (feast lines, 53004 armed): the feast nights still read
like people, not a ledger. Around the fire, villagers stand up and tell
the room how they put a beast down, in their own words — Soo on
Drum-Belly ("It rears up, belly swelling drum-taut, and beats it with
both paws — BOOM"), Nora on the Anaconda Empress, Ruth on Nightlight,
Fatima on Murkcap, David on the Mountain Lord — each story distinct,
each voice its own. The keepsake lines that follow are System
notifications ("The Wedding Ring is starting to do something"), mechanical
by design, not villager speech. Nothing in the sampled lines reads
robotic or repeated; the narration is not the blank here. The blank is
that after the deed, the fire still draws scavengers and the villagers
still face them — and no second killer is left standing beside the
first.

## Blanks filled / documented

- **Filled (this arm):** the stop-after-spend question is answered, not
  left open — stopping the drive after the deed keeps the deed (5/8)
  and cuts donations (55,235→30,230 kcal) but destroys the pair
  factory (52→5 pair days, wave-5 kills 3→0). The counter-hypothesis
  from the prereg is confirmed: the deed's price is paid in draws.
  Policy-side only; nothing in the game changed, and the arm deletes
  cleanly (wrapper only, drive file untouched).
- **Documented (findings backlog #1869, UPDATE appended):** the pair
  factory is draws, and the next lever on this axis is a
  pair-overlap lever, not another feast throttle — three throttles
  in a row (donation tame, frequency cap, stop-after-spend) have now
  all failed the same pair-days bar for the same reason. Also
  documented: the EAT FIRST dry-up prediction failed on 53004
  (staged feasts kept lighting post-deed).
- **Not chased (out of scope):** the 53008 survival swing (single-seed
  post-spend divergence, see above); the r112 ladder's own effect on
  the substrate (it moved 5/8 re-baseline trajectories — a measurement
  for the ladder's own arm, not this one).

## Metric review

1. **The pair-days bar was calibrated on a collapsed substrate — and
   the verdict doesn't hinge on it.** The bar (≥35) was set from the
   feastcap round, where the re-baseline banked 65 pair days. On the
   rebased tip the re-baseline banks 52 — the r112 ladder moved the
   baseline up from the c88 corpus's 24. Either way the armed leg
   (5) misses by 30; no plausible bar level flips this verdict. The
   lesson is procedural, not metrical: re-sweeping after a
   substrate-relevant rebase was load-bearing here, and the c88 corpus
   would have understated both legs.
2. **The EAT FIRST mechanism note in the prereg was wrong.** It
   predicted post-deed feasts would dry up once gives decayed below
   1500. 53004 armed lit 4 post-deed staged feasts and drew 4
   scavengers. The note was a prediction about the substrate, not a
   bar, so no re-scoring follows — but the next prereg on this axis
   should not assume the staged feast gate closes after the deed.
3. **Median survival hides distribution movement, again.** The median
   bar passes (123.5d ≥ 110d) while 53008 dies 77 days earlier and
   53006 dies 26 days earlier, offset by 53004 and 53005 living
   longer. Survived count is flat at 2/2, which is the honest
   companion number — reported alongside the median, as the
   feastdrive metric review proposed.
4. **No canon doc covers the feast/surge system.** Standing note,
   repeated from the prereg: the design record is the code
   (`feastBuff.js`, `progression.js:650`) and BALANCING.md §78–79.
   A canon doc for the feast/surge system would let the next arm
   argue from design instead of re-reading code; that is a docs
   blank, not a sim arm.

## Panel (§15)

`evidence/2026-11-07/feaststopspend-panel.md` (+ `.json`,
`-before.json.gz`, `-after.json.gz`) — 8 paired cases, decision
**review_required**. No material signal on any contract metric:
national 0→0, table win rate 0→0, survival30/60 0-delta, village
deaths −4.875 (95% exploratory interval −14.625 to 3.625),
village deaths per 100 days regression_watch (+0.68, interval
−7.07 to 10.97), community loss 0-delta. The panel is the
instrument; the pre-registered threshold is the judge — the panel
shows no scale-wall movement, and the arm's own driver corpora show
the pair-days collapse that kills it.

Telemetry deviation check: `scripts/telemetry-check.js` refuses
recorder-corpus input by design (the per-seed files carry top-level
`anchorCommit` — sweep recorder rows, not runs). No LOUD lines were
produced; the scale-wall numbers above (national 0→0, table 0→0,
wins 0→0) are the check's substance, carried by the panel instead.

## Proof

- `scripts/test-feaststopspend-20261107.js`: **25/25 PASS** — run
  green on the rebased tip (d7bca6cf0, base a2e005cbe) after the
  rebase, before the judged re-sweep. Fixture tests (deedDone
  helper, wrapper stats, source-level no-`hostFeast` / no-killlog
  checks) plus live legs in /tmp (neutrality: daily rows exact
  through the baseline spend day; armed: 0 instrument errors, no
  drive feast/donate event after a spend day).
- Analyzer verification: the untracked c88 analysis JSON was
  re-generated from its corpus before archiving and reproduced
  **exactly**; the judged analysis was generated fresh from the
  re-swept corpora by the same committed analyzer.
- No `check.js` run: this arm changed zero src/js and zero
  green-list files (new policy file + scripts + evidence only);
  the arm's own proof tests are the verification.

## Convergence state

Axis scale-onramp / winnability chain: **killed-at-pilot** for
stop-after-spend; axis **converging, not converged** — the feast-deed
link moves (5/8) but every cost-taming variant so far buys the deed
with the pairs, and the scale wall (national / table / wins) is still
0/0/0. The next arm on this axis should be a pair-overlap lever (the
finding in #1869), judged with pair-days in the primary — not a
fourth feast throttle.

## Files

- Prereg (FROZEN): `evidence/2026-11-07/sim-feaststopspend-b-prereg.md`
- Evidence (this file): `evidence/2026-11-07/sim-feaststopspend-b.md`
- Analysis: `evidence/2026-11-07/feaststopspend-analysis.json`
- Baseline corpus: `evidence/2026-11-07/perseed-feaststopspend-b-baseline/` (8 files, anchor d7bca6cf0, base a2e005cbe)
- Armed corpus: `evidence/2026-11-07/perseed-feaststopspend-b-armed/` (8 files, anchor d7bca6cf0, base a2e005cbe)
- Panel: `evidence/2026-11-07/feaststopspend-panel.md` (+ `.json`, `-before.json.gz`, `-after.json.gz`)
- Superseded c88 corpus + analysis + panel: `/tmp/fss-c88-corpus/` (not committed — stale base, verdict NO-GO there too)
- Tooling: `scripts/policies/competent-feaststopspend-b.js`,
  `scripts/feaststopspend-driver-20261107.js`,
  `scripts/feaststopspend-analyze-20261107.js`,
  `scripts/build-feaststopspend-panels-20261107.js`,
  `scripts/test-feaststopspend-20261107.js`
