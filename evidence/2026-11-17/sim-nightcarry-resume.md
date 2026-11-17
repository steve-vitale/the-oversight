# sim-nightcarry-resume — UNJUDGEABLE (vacuous subject, frozen floor)

**Verdict: UNJUDGEABLE — not a GO, not a NO-GO.** The frozen
subject-viability floor fires: control + armed wave-4+ instances opened
total **0 < 4**. The lever was never tested on its frozen metric, because
on this tip no wave-4+ plan instance ever opens. The lever itself works
mechanically — it fired 4 times and 3 of those became real departures
with the carried line spoken — but every carried commit rode a **wave-3**
plan, which the frozen metric cannot see. Per the binding prereg, the
lever stays untested pending a plan source (a coordinator decision).
The lever is REVERTED from `src/` in this commit (kill discipline for
unjudged levers, same as the 0215Z adoption); it survives in branch
history at `00fb5745a` and the mode-aware proof test preserves the
proof for a future re-application.

- Run: Loop A `fleshout-20261117T060712Z`, axis scale-onramp, arm
  `sim-nightcarry-a` resumed as `sim-nightcarry-resume`, worktree
  `~/workspace/worktrees/sim-nightcarry-resume`.
- Base: master `9f7d0522e` (verified at resume start). Policy: competent
  verbatim, sha256 `df9b7dff4de4`. Band: seeds 103101–103108 (partially
  spent by this arm's own adopted control leg; reuse authorized by the
  adopted resume instructions — the adopted corpora are SUPERSEDED as
  the baseline by the fresh control leg on this tip and are never mixed
  into the verdict).
- Horizon: 150d death-aware. 8-seed pilot, both legs on the same tip.
- Prereg: `evidence/2026-11-17/sim-nightcarry-a-prereg.md` (binding,
  unchanged). Resume prereg:
  `evidence/2026-11-17/sim-nightcarry-a-resume-prereg.md` (re-application
  verification, D1 result, bars restated).
- Frozen GO bar (restated): primary = launched wave-4+ instances
  (any-commit), armed ≥ control + 2; secondary = carried commits
  converting ≥ 25%; cost bars = deaths/run within +2 of control,
  median survival ratio ≥ 0.9, starvation within +2 (arm-only, B3).
  Subject-viability floor: control + armed instances opened < 4 →
  UNJUDGEABLE.

## The lever, in plain words

A villager commits at dawn (or mid-day) to lead a party out after a
beast. If the day ends before the party leaves, the plan dies overnight
— silently, with no word at the fire and no try the next morning. The
lever carries the commit across ONE night (`NIGHTCARRY=1`, default OFF;
`src/js/villager-brain.js`, +118 lines re-applied from `00fb5745a`),
so a commit written late in the day gets its morning execution window
the next day, and the departure is voiced as yesterday's plan
continuing.

## Re-application (verified, not blind checkout)

Hunks 1–3 applied clean via `git apply`; hunk 4 (the carried
departure voice line) hand-placed at its original anchor, because the
companionguard block (commit `1ef267b8b`, landed since) now sits
between the anchor and the VETREENGAGE block. Verified:
`node --check` passes; diff of the re-applied file vs
`00fb5745a:src/js/villager-brain.js` shows ONLY the companionguard
change and its knock-on lines — no lever code lost, no guard
clobbered; `grep COMPANIONGUARD` present in both
`villager-brain.js:1177` and `villager-agency.js:485`.
`scripts/test-nightcarry-a.js` re-run on the re-applied tip:
**65/65 green** (lever-present mode).

## D1 — DRIFTED (control leg re-run fresh, as instructed)

Re-ran committed control seed 103101 on this tip (MODE=control,
`perseed-nightcarry-resume-d1/`, anchor `9f7d0522e`):

| field | committed control (base 5d5293972) | D1 re-run (tip 9f7d0522e) |
|---|---|---|
| days / endReason | 150 / survived | 150 / survived |
| standing / scaleRank | 465 / regional | 199 / regional |
| maxWave | 5 | 4 |
| deaths | 99 | 38 |
| v4seeds / v4departs / v4gates / v4encounters | 32 / 42 / 27 / 21 | 0 / 0 / 0 / 0 |
| nightcarrySkips | 47 | 0 |
| dawnbidScores / dawnbidDeparts / dawnbidCensus | 151 / 65 / 107 | 0 / 0 / 0 |

First population divergence day 17. Substrate drift, not a lever
effect: between `5d5293972` and `9f7d0522e`, `src/` changed in
`conversation.js` (+70/-), `convo-dialogue.js`, `convo-wants.js`,
`villager-agency.js` (companionguard), `villager-brain.js`
(companionguard), `build.js`. Per the task instruction the ON leg was
NEVER judged against the old-base control leg: the FULL control leg
(8/8) was re-run fresh on this tip and the verdict rests on that
fresh within-tip contrast.

## Judged numbers (fresh legs, same tip, paired seeds)

Analyzer: `scripts/analyze-nightcarry-a.js` (unchanged) →
`evidence/2026-11-17/nightcarry-resume-analysis.json`.
Panel: `scripts/build-nightcarry-resume-panels-20261117.js` (the
frozen builder with a `--run` flag for the resume file names) →
`evidence/2026-11-17/nightcarry-resume-panel.{json,md}` (+
`-before/-after.json.gz`). Drift:
`scripts/vetparty-drift-check.js` → **NO PRE-LEVER DRIFT**
(103103 diverges day 53, exactly the first carry day; all other
seeds identical or diverging only after the lever first acted).

| seed | control days / end | ON days / end | control v4seeds | ON v4seeds | ON carries |
|---|---|---|---|---|---|
| 103101 | 150 survived | 150 survived | 0 | 0 | 0 |
| 103102 | 150 survived | 150 survived | 4 | 4 | 0 |
| 103103 | 135 village-lost | 150 survived | 7 | 17 | 3 |
| 103104 | 150 survived | 150 survived | 16 | 16 | 0 |
| 103105 | 150 survived | 150 survived | 0 | 0 | 0 |
| 103106 | 88 village-lost | 88 village-lost | 0 | 0 | 0 |
| 103107 | 150 survived | 150 survived | 9 | 9 | 1 |
| 103108 | 96 village-lost | 96 village-lost | 0 | 0 | 0 |

- **Primary (frozen): launched wave-4+ instances — armed 0, control
  0, delta 0 (bar +2).** Instances opened both legs: **0**.
  Classification: 0 launched / 0 in every bucket, both legs.
- **Secondary (frozen): carried conversion — null.** The analyzer
  counts carries only inside instances; with 0 instances, carried=0,
  conversion=null (bar 0.25). The raw corpora tell the real story
  (below).
- **Cost bars — ALL PASS:** deaths/run armed 541 vs control 532
  (+9 total = +1.125/run, bar +2/run); median survival 150.5 vs
  150.5, ratio **1.0** (bar ≥ 0.9); starvation totals armed 1 vs
  control 1 (bar +2); starvation arm-only (B3) armed 0 vs control 0
  (bar +2). The single starvation death is the SAME death on both
  legs (seed 103108, day 66, matched same-seed same-day).
- **Panel (§15): decision `review_required`**, flagged on one metric
  only: villageDeaths regression_watch, delta +1.125/run, 95% CI
  [0, 3.375]. The delta is entirely seed 103103 (+9 deaths) — the
  seed where the lever fired and the village survived 15 days longer
  (135 → 150d); deaths accumulate over the extra days, and deaths
  per 100 days is exactly 0 delta. This is a survival artifact, not
  new lethality — and it sits inside the frozen cost bar.
- **Instrument errors: 0 both legs. Corpus: 8/8 both legs. Wave-4 id
  set matches the data. Skip coverage: 0 bare
  `selected-not-executed` (nothing to cover — no instances).**

## What the lever actually did (raw corpora, outside the frozen metric)

The lever fired **4 times** on the ON leg and **3 of 4 converted to
real departures** (both expeditions started), each voiced:

- 103103 d53: Xavier carried a part-3 commit from d52 → launched
  with Theo. Line: *"Xavier is finally setting out — yesterday's
  plan, leaving today with Theo."*
- 103103 d53: Theo carried the mirror commit (d52 part-3, same pair)
  the same morning — no second departure line, because Xavier's
  launch had already started both expeditions. The pair carried each
  other's commits; one launch resulted. (4th carry, unconverted.)
- 103103 d90: Theo carried a part-2 commit from d89 → launched with
  Xavier. Line: *"Theo is finally setting out — yesterday's plan,
  leaving today with Xavier."*
- 103107 d58: Avery carried a part-1 commit from d57 → launched at
  dawn with Katarina. Line: *"Avery is finally setting out —
  yesterday's plan, leaving today with Katarina."*

Raw conversion **3/4 = 75%** — far above the frozen 25% secondary
bar, but it is NOT the frozen secondary: the frozen secondary counts
only carries joined to wave-4+ instances, and there are none. The
carried commits rode **wave-3 plans** (targets: buffering, ad_break,
and one target-null plan at party stage). The lever is wave-agnostic
in code — it carries any `EXPEDITION party_launch` commit — so it
rescued wave-3 plans that the frozen metric was never pointed at.

Seed 103103 is the lever's visible effect: control lost the village
day 135; ON survived to 150d, with v4seeds 7 → 17 and encounters
20 → 41 — the carried launches kept the village fighting (and
dying) longer instead of collapsing. Death causes on 103103 shift
accordingly (expedition deaths 26 → 34, combat 15 → 19).

## Why zero instances open (the vacuity, precisely)

The frozen instance definition opens on a wave-4+ seed row whose
`stageAfter` is `gear` or `party`. On this tip, **every** wave-4+
seed row arrives with `stageAfter = 'hunt'` (control 14/14, ON
16/16). Plans are seeded by **wave-3** fights (chorus_line, gavel,
buffering, ad_break) and advance gear → party → hunt; wave-4/5
monsters (reunion, strike, rerun, spoiler, editor) are only ever
fought mid-hunt, when the plan is already hunting, so the seed call
is a non-opening seed by the frozen definition. Corroborated:
`dawnbidCensus` is 0 on all 16 fresh seeds (no live plan ever has
`needWave ≥ 4` or a wave-4 target at end of day), while launches DO
happen — 21 launch rows on fresh control 103104 alone, all for
wave-3 plans. The instrument is not broken: run against the OLD
adopted control leg (6 seeds), the same analyzer opens **2
instances, both launched** (one dawn, one mid-day part-2) — see
`evidence/2026-11-17/nightcarry-a-oldbase-control-analysis.json`.
On the old base the subject existed; on this tip it does not, in
this form.

Note the control leg's own `nightcarrySkips` are **0 on all 8 fresh
seeds** (vs 47 on old-base seed 103101): the night-death phenomenon
the arm was built to fix does not even register on this tip's
control leg — the skip recorder only fires for wave-4+ plan holders,
and no wave-4+ plan holder ever holds a commit at the night tick
here. The carries that DID fire (4) were invisible to the skip
recorder for the same reason: they rode wave-3 plans.

## Wall numbers (both legs identical)

- scaleRank national: **0/8** control, **0/8** ON (all regional
  except 103108 ON/control at village). Standing ≥ 200 on 2/8 seeds
  both legs (103104: 455, 103105: 225) — the analyzer's
  `wall.national` counts standing ≥ 200, NOT scaleRank; do not read
  it as national reached.
- Table: **0/8** both legs. Wins: **0/8** both legs.
- Wave 4 unlocked: **8/8** both legs. Wave 5 unlocked: **2/8** both
  legs (103104, 103105).
- Median survival: **150.5d** both legs. Survived to 150d: 5/8
  control, 5/8 ON (103103 swaps from lost to survived on the ON leg).
- Deaths: 532 control, 541 ON. No wins, no table, no national on
  either leg — the scale wall stands.

## Village assessment (plain words)

Five of eight villages live to day 150 and three die fighting, not
hungry — the villages are well-fed (one starvation death in 16 runs)
and die in combat or on expeditions. The villages that survive reach
standing 199 and stall there: the 199 wall is the same one the scale
arms keep hitting — standing climbs to 199 on blood and bonds, then
nothing pushes it over except the two seeds that break 200. Wave 4
is unlocked everywhere (8/8) but wave 5 only on 2/8, and no village
gets near national, the table, or a win. The most alive village in
the band is 103104 (standing 455, wave 5, 150d) — and even it never
forms a wave-4 plan at party stage; its parties hunt wave-3 beasts
while wave-4 monsters are met as accidents of the hunt. The lever's
one visible rescue — 103103 surviving 15 extra days on carried
departures — shows the night carry does real work when a commit
dies overnight; it just does that work one wave lower than the
metric was aimed at.

## Reachability verdict

- Waves 1–5: reachable as unlocks (wave 5 on 2/8); wave-4+ party
  launches as defined by the frozen metric: **not observed on this
  tip** — not because launches don't happen, but because no wave-4+
  plan ever sits at party/gear stage when a seed arrives.
- Regional → national, the table, the win flag: **not reached on
  either leg** (0/8 national by scaleRank, 0 table, 0 wins).
- Vests: not measured by this arm's instrument.

## Sense-testing (SENSE-TESTING LAW)

The three carried lines read sensibly: each names the holder, the
companion, and the fact that this is yesterday's plan finally
leaving — the departure reads as the SAME launch, not a fresh
decision, exactly as the prereg's voice rule requires. The mirror
pair on 103103 d53 is the one place the voice is honest by
omission: both villagers carried each other's commit, but only one
departure line fires, because only one departure happened — the
second carry is silent rather than double-voicing a single launch.
No carried line contradicts the day's events. The one sense gap is
the same as the metric gap: nothing in the transcript ever says a
wave-4 plan died overnight, because on this tip no wave-4 plan
holder ever held a commit at night — the silence the arm was built
to fix is absent here, not repaired.

## Metric review

The frozen metric proved wrong in scope, not in arithmetic. The
instance definition (opening seed must be wave ≥ 4 at gear/party)
assumes wave-4 plans are born at party stage; on this tip they are
born as wave-3 plans and meet wave-4 monsters mid-hunt, so the
subject never forms and the floor correctly fires UNJUDGEABLE. The
lever's real effect (4 carries, 3 launches, 75% raw conversion) is
invisible to the frozen bars. Proposed revision for the NEXT run
(not a re-score of this one): judge the carry on **any-wave**
instances — the lever is wave-agnostic in code, and the carry's
value is in rescuing a died-overnight commit regardless of the
plan's wave — OR keep the wave-4+ scope and first land a plan
source that puts wave-4 monsters into plans at party stage (the
prereg's "pending a plan source" path). Either way, the next
prereg should also widen the skip recorder to any-wave plan
holders: on this tip it recorded 0 skips while 4 commits demonstrably
died overnight and were carried — the recorder and the lever watch
different populations. The cost bars held cleanly and need no
revision; the panel's regression_watch on villageDeaths is the
103103 survival artifact and is already explained by the +15
survived days.

## Blanks filled / documented

- **Filled:** the INCOMPLETE arm is finished — control leg completed
  (103107–103108 fresh on this tip, plus the full 8/8 re-run after D1
  drift), ON leg 8/8 run, judged against the frozen bars, proof
  green. The 0415Z review's clobber warning is answered in code:
  the lever was re-applied as hunks only and companionguard is
  verified intact.
- **Documented (not filled):** the wave-4+ instance subject does not
  form on this tip — recorded as a finding (below) for the next arm;
  the lever stays untested pending a plan source (coordinator
  decision). The D1 drift (old-base control corpora no longer
  reproduce on this tip) is recorded with numbers in the resume
  prereg.
- **Finding appended to `sim-findings.md`:** wave-4+ plans never sit
  at party/gear stage when a wave-4 seed arrives (plans are
  wave-3-born, wave-4 met mid-hunt) — the frozen instance definition
  cannot see the lever's effect; next round needs any-wave instances
  or a wave-4 plan source. Also: the skip recorder watches only
  wave-4+ holders while the lever fires on wave-3 plans.

## Files

- Prereg (binding): `evidence/2026-11-17/sim-nightcarry-a-prereg.md`
- Resume prereg: `evidence/2026-11-17/sim-nightcarry-a-resume-prereg.md`
- Evidence (this file): `evidence/2026-11-17/sim-nightcarry-resume.md`
- Analysis: `evidence/2026-11-17/nightcarry-resume-analysis.json`
  (verdict UNJUDGEABLE); old-base cross-check:
  `evidence/2026-11-17/nightcarry-a-oldbase-control-analysis.json`
  (2 instances, both launched)
- Panel: `evidence/2026-11-17/nightcarry-resume-panel.{json,md}`,
  `nightcarry-resume-panel-before.json.gz`,
  `nightcarry-resume-panel-after.json.gz` (decision
  review_required, villageDeaths only)
- Corpora: `evidence/2026-11-17/perseed-nightcarry-resume-control/`
  (8 files), `evidence/2026-11-17/perseed-nightcarry-resume-on/`
  (8 files), `evidence/2026-11-17/perseed-nightcarry-resume-d1/`
  (seed 103101 drift record). Adopted old-base control corpora in
  `evidence/2026-11-17/perseed-nightcarry-a-control/` are superseded,
  kept as the old-base record.
- Proof: `scripts/test-nightcarry-resume.js` (**41/41 green**,
  mode-aware: lever-present legs run on the re-applied tip; off-mode
  legs run after the revert) + `scripts/test-nightcarry-a.js`
  re-run **65/65** on the re-applied tip.
- Panel builder (resume adaptation, `--run` flag):
  `scripts/build-nightcarry-resume-panels-20261117.js`
- Lever: REVERTED from `src/js/villager-brain.js` before commit
  (unjudged-lever kill discipline); `git diff HEAD -- src/` is empty.
  Lever code survives at `00fb5745a`.
