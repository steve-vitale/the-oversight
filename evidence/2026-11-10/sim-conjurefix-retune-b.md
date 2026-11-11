# sim-conjurefix-retune-b — capability-capped expedition pick, JUDGED (finding #2100)

- Run: `fleshout-loop-b-20261111T0330Z` (adoption of the dead 0330Z run),
  Loop B, arm `sim-conjurefix-retune-b`, worktree
  `~/workspace/worktrees/sim-conjurefix-retune-b`, branch
  `sim-conjurefix-retune-b`.
- Base: master `ad6a04b27` (current master at run start; the regenerated
  control was run on the prereg commit `75a808795`, which adds only the
  prereg file to `ad6a04b27` — identical game code; see §Adoption notes).
- Retune commit: `a634eecfb` (on top of the original fix `d9f3d997a`,
  judged NO-GO in `evidence/2026-11-10/sim-conjurefix-b.md`).
  Prereg: `evidence/2026-11-10/sim-conjurefix-retune-b-prereg.md`
  (committed before any judged sim run).
- Band: **170301–170308** (8 seeds, pilot — the SAME band as the judged
  run, for comparability), horizon **150d death-aware**, policy
  `competent` verbatim (recorded as `policy: "baseline"` by the driver —
  that is the competent policy's label in the instrument; see
  `scripts/encounterprod-driver-20261105.js:3`). Instrument: the census
  instrument reused verbatim
  (`scripts/encounterprod-instrument-20261105.js`); driver verbatim
  (`scripts/encounterprod-driver-20261105.js`,
  `RUN=conjurefix-retune-b` for the after corpus,
  `RUN=conjurefix-retune-base` for the regenerated baseline corpus,
  `OUTDIR=evidence/2026-11-10/perseed-conjurefix-retune-b/`);
  analyzer `scripts/conjurefix-analyze-20261110.js` (psycho exclusion
  kept, per the judged evidence's metric review); proof
  `scripts/test-conjurefix-retune-b.js` (committed in `a634eecfb`;
  re-run deferred to the post-rebase step — see §Sequencing).
- Corpus judged as-is: **no sweep was re-run** by this adoption. All 16
  files parse (analyzer exit 0, 0 instrument errors on all 16). Control
  regenerated on this run's base per the prereg (see §Control
  regeneration).

## Verdict: NO-GO — do not land

The defect is **eliminated again** (primary and secondary both GO), and
the retune moves every judged number in the right direction versus the
original fix — but it **still fails the pre-registered agency-kill
guard and two of the three cost-bar lines** on the regenerated pilot
band. Per the prereg's metric binding a miss is NO-GO, never re-scored
against a friendlier metric. Kill classification per MEASUREMENT §14a:
**CONCEPT-DEAD** for this retune shape (cap + uniform in-cap pick) —
the mechanism was staged, the metric was fair, and the concept failed
on its merits; see §Why the guards still fail for the measured
mechanism. The src/js change does NOT land on this verdict.

| Pre-registered bar | Control (regen.) | After | Line | Verdict |
|---|---:|---:|---|---:|
| PRIMARY — conjured agency kills | 243 | **0** | GO = 0 | **GO** |
| SECONDARY — conjured agency fights | 759 | **0** | GO = 0 | **GO** |
| GUARD — total `waveKillLog` kills | 651 | 524 | ≥ 520.8 (−20%) | PASS (by 3 kills) |
| GUARD — agency kills | 243 | 145 | ≥ 170.1 (−30%) | **FAIL (−40.3%)** |
| COST — median survival | 132d | 108.5d | ≥ 122d (−10d) | **FAIL (−23.5d)** |
| COST — deaths / 100 village-days | 1.34 | 1.59 | ≤ 1.54 (+15%) | **FAIL (+18.7%)** |
| COST — starvation deaths | 0 | 2 | ≤ 2 | PASS (at the line) |
| W3+ kills (reported, not a guard line) | 102 | 73 | — | −28.4% |
| W3+ agency kills (reported) | 12 | 7 | — | −41.7% |

Versus the original fix on its own band (directional only — different
base and control, not a controlled A/B): agency kills 98 → 145, total
kills 458 → 524, median survival 101d → 108.5d, deaths/100 1.96 →
1.59. The retune recovered roughly half the original fix's kill loss
and a third of its survival loss. Not enough: the agency-kill guard
still misses by 25 kills and the survival line by 13.5 days.

Panel (the cost-bar / wall instrument): `review_required` — same
decision as the judged run, but the lethality signal weakened from
regression_signal to regression_watch (see §Balanced panel). Wall
numbers unchanged: national 0/8 → 0/8, table 0 → 0, wins 0 → 0, W4
unlocked 8/8, W5 1/8 after vs 3/8 control.

## The retune (what was built)

`expeditionMonster` (`src/js/villager-agency.js`, +77/−9 in `a634eecfb`,
on top of the fix in `d9f3d997a`) keeps the fix's existence machinery
(reuse / spawn / removal) and retunes only the PICK:

1. **Capability cap** — `expeditionCapabilityCap(vid)`: the highest wave
   in `state.waveKillLog` with `by === vid`, +1 stretch, floored at 1,
   capped at `unlockedWave()`. No kills yet → cap 1.
2. **Reuse, capability-gated** — `expeditionNearbyMonster` takes the cap
   and only returns instances whose def wave ≤ cap.
3. **Spawn, capability-gated and uniform** — the spawn pool is filtered
   to wave ≤ cap and picked with the old uniform `pick(pool)`; the
   newest-weighted `spawnWaveTarget` + `pickByActivity` pick is removed
   from this path.

## Before / after (regenerated corpus, anchors `75a808795` → `a634eecfb`, 0 instrument errors)

| | Control | After |
|---|---:|---:|
| Agency fights (expeditions) | 759 | 392 |
| Conjured agency fights | 759 | **0** |
| Grounded agency fights | 0 | 392 |
| Agency kills | 243 | 145 |
| Conjured agency kills | 243 | **0** |
| Grounded agency kills | 0 | 145 |
| Unmatched agency kills | 0 | 0 |
| Psycho fights (excluded, reported separately) | 3 | 3 |
| Total `waveKillLog` kills | 651 | 524 |
| Kills by wave (W1 / W2 / W3 / W4 / W5) | 320 / 229 / 75 / 27 / 0 | 282 / 169 / 59 / 13 / 1 |
| W3+ kills | 102 | 73 |
| W3+ agency kills | 12 | 7 |
| W4+ agency kills | 0 | 0 |
| World spawns | 521 | 642 |
| Expedition spawns (source `other`) | 35 | 236 |
| Background spawns | 227 | 155 |
| `checkEncounter` spawns | 259 | 251 |
| Fallen (total) | 127 | 110 |
| Village-days | 9461 | 6907 |
| Median survival | 132d | 108.5d |
| National / table / wins | 0 / 0 / 0 | 0 / 0 / 0 |
| W4 unlocked / W5 unlocked | 8/8 / 3/8 | 8/8 / 1/8 |

Agency fights by wave — the mix moves W1-heavy as the prereg
predicted, and high-wave exposure collapses: W1 386 → 235 (−39%),
W2 246 → 109 (−56%), W3 97 → 44 (−55%), **W4 30 → 4 (−87%)**,
W5 0 → 0. Agency fight outcomes: evade 460 → 227 (60.6% → 57.9%
per fight), vKill 243 → 145 (**per-fight kill rate 32.0% → 37.0%**),
**vFlee 31 → 8 (per-fight 4.1% → 2.0%)**, vDie 2 → 2 (flat),
mFlee 23 → 10. The original fix's flee-tripling is reversed — the
fights that happen are now winnable — but there are half as many of
them (759 → 392, −48%).

Per-seed after: 170301 d57 village-lost (42 fights, 11 kills) ·
170302 d150 survived (38 fights, 14 kills) · 170303 d150 survived
(54 fights, 23 kills) · 170304 d74 village-lost (82 fights, 22 kills)
· 170305 d80 village-lost (46 fights, 16 kills) · 170306 d150
village-lost (46 fights, 22 kills) · 170307 d137 village-lost
(28 fights, 11 kills) · 170308 d48 village-lost (56 fights, 26 kills).
Per-seed control: 170301 d131 · 170302 d112 · 170303 d150 ·
170304 d133 · 170305 d150 · 170306 d101 · 170307 d126 · 170308 d144.
The cap also regularizes expedition volume: control agency fights per
seed range 9–229 (170303 alone ran 229 conjured fights); after they
range 28–82.

Death causes (fallen rows): "the wild" 84 → 80 (66% → 73% of fallen;
rate 0.89 → 1.16 per 100 village-days, +30%), monster 17 → 15,
"a stranger" 6 → 3, wound 4 → 2, sickness 3 → 1, contest 2 → 2,
ambush 3 → 2, arena 3 → 0, thirst 1 → 0, starvation 0 → 2, combat
2 → 1, named-monster causes (Spool, The Landlord) 2 → 2 (Big Loud,
Gavel on control). **No new death mode appears**; the villages die of
the same wild, faster per villager-day. Villager (non-scholar) combat
deaths per MEASUREMENT §14c: combat-attributed fallen (cause
`monster` or `combat`) 19 → 16; including named-monster causes 21 →
18. Agency-fight vDie 2 → 2 (flat). The scholar-side metric is the
panel's player deaths/100d: 9.51 → 12.70 (regression_watch, interval
includes zero — see §Balanced panel).

## Why the guards still fail (mechanism, measured not guessed)

Three findings pin it; the cap itself is the throttle, not a bug in
its implementation:

1. **The kill ladder stalls at the W3 rung.** The cap graduates a
   villager one wave per kill they actually land. Only 4 villagers on
   4 seeds ever land a W3 agency kill (7 total, vs 12 on control), and
   **none of them lands a W4 agency kill in the remaining horizon** —
   W4+ agency kills are 0 on both sides, but control at least stages
   30 W4 agency fights against which a kill could happen; the retune
   stages 4. The ladder is too slow to climb inside 150 days: a fresh
   villager faces W1 only, and the W3 rung — the gate to the waves
   the veteran and readiness bars actually need — is nearly empty.
   W3+ agency kills fall 12 → 7 (−42%); total W3+ kills fall
   102 → 73 (−28%).
2. **The volume collapse persists, and it is not only shorter lives.**
   Village-days fall 27% (9461 → 6907), which alone would cut fights
   ~27% — but fights per 100 village-days also fall 29% (8.02 →
   5.68), so expeditions run fewer/shorter legs per day alive even
   before the survival loss compounds. Agency kills per 100
   village-days fall 18% (2.57 → 2.10). Total kills per 100
   village-days actually rise 10% (6.88 → 7.59) — the total-kills
   guard passes only in absolute terms by 3 kills because the
   villages live fewer days. The per-fight numbers prove the fights
   themselves got easier (kill rate up, flee rate halved, vDie
   flat), so the residual per-day expedition shortfall is NOT the
   original fix's deadlier-fights mechanism. What eats the legs per
   day alive is **not identified from this corpus** — the leading
   hypothesis is the reuse-skip: a too-strong beast wandering near is
   skipped rather than fought, and it stays in the world to be met
   later through the unfiltered wild path (`checkEncounter` spawns
   hold 259 → 251 while background spawns fall 227 → 155). That
   hypothesis is unproven here; it is a diagnostic question for the
   next run, not a finding of this one.
3. **The survival cost is real but its mechanism is partly open.**
   Deaths/100 village-days rise 1.34 → 1.59 (+18.7%) while
   per-fight lethality falls — the extra deaths are "the wild" at a
   30% higher rate, not expedition vDie (flat at 2). The panel
   independently shows the same direction (player deaths/100d +3.19,
   village deaths/100d +10.92) but only at regression_watch strength
   (intervals include zero), weaker than the judged run's
   regression_signal. A luck component cannot be excluded: the
   panel's combined run-luck percentile falls 0.90 → 0.59 (6/8
   pairs, marked insufficient). Luck cannot explain a −40% agency
   kill drop with an identified cap mechanism, so it does not change
   the verdict — but a confirm run on a fresh band would be the way
   to separate luck from lever if a variant arm is pursued.

## What the village looked like

Eight competent villages, 150 days max. Three survive to day 150
(170302, 170303, 170306 — though 170306 still ends village-lost at
the horizon); the rest are lost between day 48 and day 137. The
villages still reach wave 4 on 8/8 seeds and wave 5 on 1/8, still sit
at standing 199 held by the readiness gate on four seeds (170302,
170304, 170305, 170306), still never reach national or the table.
The strongest village is 170307 (standing 385, regional, W5
unlocked, the band's only W5 kill — Petra Novak killing a Spoiler
as the player, day ~137) — and even it manages only 11 agency kills
in 137 days. What changed is the texture of the wild: expeditions
now meet real monsters a villager could plausibly face — a fresh
villager meets calibration fauna and walks home alive, and the
village's kill ledger is honest all the way down (0 conjured of 145
agency kills). The price is that the expedition is no longer the
village's kill engine: the village kills about 40% less on
expeditions and dies about 19% faster per day alive, and nobody
climbs high enough to bank the wave-4 kills the veteran bar wants.
Seed 170308 is the sharpest case: 26 agency kills (the band's best)
and dead by day 48 — killing well and dying young.

## Reachability verdict

Waves 1–5 reachable (W5 unlocked 1/8, W5 kills 1 total — the `spoiler`
pattern from the census holds). Regional on all 8; national / table /
win unreachable in this band on both sides — the scale wall stands,
unchanged by this retune. Arc II/III/IV and the win flag were not
reached (same as control). The retune does not open or close any
content door; it changes what an expedition meeting is and how fast
a villager can climb to the waves that matter. Standing max falls
520 → 385; the standing-199 plateau still binds on half the seeds.

## Sense-testing (villagers act like people)

Read the encounter lines in the after corpus (`fightSays`,
`spawnSays`, seed 170303 sampled, plus spot-checks across seeds):
the narration is coherent and names real, placed monsters — "Nabil
killed Extended Warranty out past the ridge — alone — and walked
home. 8 rounds, 44 taken", "Xavier killed Choir Toad out past the
ridge — with Nabil charging in when it turned — and walked home."
Kills read as events with witnesses ("Word travels fast. The village
cheers", "The village watches the broadcast. Nobody blinks"), loot
is noted when taken ("Took Poultice Bandolier off the body"), and
spawn lines name the beast on the tile ("Something moves out there —
The Focus Group"). No robotic repetition beyond the narration
engine's own fixed templates (the same two closing lines recur on
both sides — that is the engine, not this arm). Two flat notes, both
pre-existing and not introduced by the retune: a fled expedition
monster stays on the map and can be met again, but nothing in the
narration tells the village it is still out there (carried from the
judged evidence — the knowledge exists in the world, not in the
gossip); and monster names like "the absence of sound" and "Extended
Warranty" read as in-fiction conceptual horrors, which is correct
for wave 2, but a first-time reader meets them with no gloss. Neither
blocks the verdict.

## Balanced panel (§15)

Before/after through the balanced panel (`scripts/balance-panel.js`),
`--policies competent --days 150 --seeds 170301..170308`, 8 paired
cases, screen only. Decision: **review_required**. The compare is the
instrument for the cost bar / wall numbers; the pre-registered
threshold is the judge — the panel does not overrule the prereg, and
the NO-GO above is judged against the prereg, not the panel.

What carries the review_required: player deaths per 100 calendar
days 9.51 → 12.70 (+3.19, interval −0.59 to 6.90,
regression_watch); village deaths per 100 calendar days 73.27 →
84.19 (+10.92, interval −8.26 to 31.35, regression_watch); first
bearer <redacted> through day 30: 0.75 → 0.50 (regression_watch);
mean sampled living NPCs 8.14 → 7.76 (regression_watch). No material
signal on table/national/win (all 0 both sides), food/hydration/HP
samples, or tier-3+ access. Trap luck 0.71 → 0.31 and combined run
luck 0.90 → 0.59 are marked insufficient (6/8 pairs) — directionally
unlucky, not a verdict input. Table reach (raw, display only):
invitations observed 8/8 → 6/8; sittings 0/8 → 0/8. Compare files:
`evidence/2026-11-10/panel-conjurefix-retune-compare.md` and
`.json`; panel summaries `panel-conjurefix-retune-before/panel.json.gz`
and `panel-conjurefix-retune-after/panel.json.gz` (the `cases/` cache
dirs are NOT committed, per §15).

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/scale-wall.json
--current 'evidence/2026-11-10/perseed-conjurefix-retune-b/*.json'
--metrics national,table,wins,exiled` → **refused** (exit 2):
"refusing recorder-corpus input: all 16 --current rows carry
top-level anchorCommit, so they are sweep recorder rows, not runs."
Recorded as a refusal per the run brief; NOT forced with
`--allow-recorder-corpus` (the judged run's evidence documents that
forcing it fires the spurious "national / table / wins disappeared"
LOUD line against the ~100%-win winseat baseline regime, while this
band is pre-seat with wins structurally 0 on both sides). The panel
is the wall-numbers instrument here: national 0 → 0, table 0 → 0,
wins 0 → 0. No same-run investigation item.

## Control regeneration

The control is regenerated on this run's base, not reused from the
judged run's baseline corpus, per the prereg. The regenerated control
moved from the judged numbers: total kills 613 → 651 (+6.2%),
agency kills 198 → 243 (+22.7%), median survival 126.5d → 132d
(+5.5d), deaths/100 1.48 → 1.34 (−9.5%). The guard lines bind
against the regenerated control, as the prereg requires — and the
retune misses them against the regenerated control by wider margins
than it would have against the old one on agency kills (floor 170.1
vs 138.6). The evidence judges against the regenerated control, not
the old one. The control's own conjured volume also rose (632 →
759 fights), which is consistent with master moving under the
measurement (fishfirst, adoption, coverage landings between the two
runs) rather than with any change in the defect.

## Adoption notes (how this run inherited the arm)

- The 0330Z worker died after generating both corpora and both
  panels plus the compare, before writing any evidence `.md`. This
  adoption judged the corpus as-is and re-ran NOTHING except the
  committed analyzer (exit 0) and the telemetry check (refused, see
  above). Every number in this file was reproduced from the 16
  corpus files with the committed analyzer
  (`scripts/conjurefix-analyze-20261110.js`) plus direct reads of
  the same files — no number is taken on trust from the dead run.
- The control anchor is the prereg commit `75a808795`, not master
  `ad6a04b27` as the brief's shorthand says — but `75a808795` adds
  only the prereg file to `ad6a04b27`, so the control's game code IS
  the stated base. The after anchor is the retune tip `a634eecfb`.
  No staleness: corpus file mtimes (base 03:52–04:02Z, after
  04:57–05:13Z, 2026-11-11) post-date both anchors.
- The five untracked paths (both panel dirs, compare `.json`/`.md`,
  perseed corpus) were committed with this evidence file via
  `scripts/safe-commit.sh` with an expanded file list; the `cases/`
  cache dirs inside the panel dirs were NOT committed. No file was
  corrupt or 0-byte — all 16 corpus files parse and all carry 0
  instrument errors, so nothing was discarded.
- Proof re-run (`scripts/test-conjurefix-retune-b.js` +
  `scripts/test-conjurefix-b.js` +
  `scripts/test-conjurefix-engine-20261110.js`) is deferred to the
  post-rebase step by the coordinator's sequencing order and was NOT
  run in this adoption. The proof file `test-conjurefix-retune-b.js`
  was committed in `a634eecfb` by the dead run; its green status on
  the rebased tip is unverified until that step.

## Metric review

- **The primary and secondary metrics did their job twice.** The
  defect is gone on both the fix and the retune (0 conjured kills,
  0 conjured fights, 392/392 grounded fights, 145/145 grounded
  kills, 0 unmatched). The psycho exclusion (3 fights both sides)
  continues to hold; nothing in this corpus reopens it.
- **The guards did their job twice.** They caught a retune that
  eliminates the defect while still costing too much — agency kills
  −40%, median survival −23.5d, deaths/100 +19%. The per-fight
  improvement (kill rate 32% → 37%, flee rate 4.1% → 2.0%) is real
  but does not rescue the guards as written — a miss is NO-GO. The
  total-kills guard passing by 3 kills (524 vs a 520.8 floor) is a
  warning, not a comfort: it passes only because villages live
  fewer days while killing faster per day alive (total kills per 100
  village-days actually rise 10%).
- **Agency kill conversion investigation item: NOT triggered.**
  Agency kills per agency fight rise 32.0% → 37.0% (+15.6%
  relative), below the prereg's +25% investigation threshold for
  the min-HP spawn effect — reported here, not silently passed.
  The rise is consistent with the cap (fights are against
  beatable waves), not necessarily with min-HP spawns.
- **W3+ kills are the tell, not a guard line.** Total W3+ kills
  102 → 73 (−28%) and W3+ agency kills 12 → 7 (−42%) while the
  original fix held W3+ exactly flat (92 → 92). The retune trades
  high-wave exposure for low-wave safety, and the veteran/readiness
  bars need exactly the high-wave kills it removes. Any next variant
  must protect W3+ agency kills explicitly — the current guards do
  not, and this run shows why they should.
- **Horizon.** 150d death-aware was right: W5 spawned and was faced
  on 1/8 seeds after (3/8 control); the defect's high-wave kinds
  appear. A longer horizon would not change the verdict — the
  guards fail on volume and survival, not on late-game reach.
- **Metric revision proposed for the next run (not a re-score):**
  add W3+ agency kills as a guard line (the veteran bar's input),
  and add fights per 100 village-days alongside the absolute
  guards, so a volume collapse driven by shorter lives is visible
  separately from a volume collapse driven by fewer expeditions per
  day alive. This run's corpus shows the two compounding
  (fights/day −29%, days −27%) and the absolute guards conflate
  them.

## What the next run should try (not this run's scope)

1. **Variant arm (recommended): lift the cap's floor, not the pick.**
   The uniform in-cap pick is fine — the cap is the throttle. Try
   cap = best-kill + 2, or cap = max(best-kill + 1, highest wave
   the villager has SURVIVED a fight against), so a villager who
   survives a W3 fight can face W3 again without first killing one.
   Pre-register the same guards PLUS a W3+ agency-kill guard (see
   §Metric review). Needs its own prereg — it changes the fix shape,
   so it is a new experiment, not a silent completion of this one.
2. **Diagnostic first (cheap):** the residual per-day expedition
   shortfall (fights per 100 village-days −29% with easier fights)
   needs a calldiag on the retuned code — is the reuse-skip eating
   encounter rolls, or are expeditions shorter for another reason?
   That diagnostic decides whether variant 1 can pass or whether the
   skip itself is the cost.
3. **Steve-call (if the variant also fails):** is it acceptable for
   grounded expeditions to cost ~40% of agency kills — i.e. is "real
   monsters are rarer and the village kills less" the intended price
   of existence? If yes, the guards need re-baselining by Steve, not
   by a loop. The original fix's evidence already posed this
   question; this retune sharpens it (the price fell by half and
   still fails).
4. **Do not retry the cap as specified.** CONCEPT-DEAD for cap =
   best-kill + 1 with uniform in-cap pick: a new mechanism is
   required, not a re-run on a fresh band.

## Convergence / blank filled

Finding #2100 stays **claimed, NOT fixed**: the conjured fight is
gone (0 conjured kills, 0 conjured fights, 392/392 grounded on the
pilot band), but the retune as specified fails the agency-kill guard
and the cost bar, so the branch must NOT merge and the src/js change
does not land. The blank filled is the proof that capping the pick by
lived kills halves the original fix's price without paying it off —
the numbers now say by how much (agency kills −40% vs −51%,
survival −23.5d vs −25.5d, deaths/100 +19% vs +32%), and the ladder
stall at the W3 rung is named as the mechanism. What remains blank:
whether a lifted cap (variant 1) passes the guards, and the residual
per-day expedition shortfall's cause (diagnostic 2).

## Sequencing

Evidence committed, awaiting rebase go-ahead. This branch touches
`src/js/villager-agency.js` and may only merge after the
measurement-proof refresh lands (sim-proofrefresh-b4). Do NOT rebase
yet. When the coordinator gives the go-ahead: rebase onto the
post-proofrefresh master SHA, re-run proof
(`scripts/test-conjurefix-retune-b.js` +
`scripts/test-conjurefix-b.js` +
`scripts/test-conjurefix-engine-20261110.js`), report merge-ready.
On this NO-GO verdict the coordinator decides the branch's
disposition; nothing was deleted, rewritten, or forced here.
