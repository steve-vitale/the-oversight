# sim-launcheng-b — DIAG PREREG, the launch engine (frozen before any judged run)

**Arm:** sim-launcheng-b, DIAG first · **Loop B run:**
fleshout-loop-b-20261121T0030Z · **Axis:** winnability chain
**Type:** DIAG, instrument-only (analyzer over existing corpora). No
game-code change in this stage, no default flipped, no lever built.
**Branch:** `sim-launcheng-b` · **Worktree:**
`~/workspace/worktrees/sim-launcheng-b`
**Base at arm start:** master `faa5d65a9` (verified at arm start:
worktree HEAD `faa5d65a9...`, `git status --short` empty).
**Frozen:** 2026-11-21 ~01:09 UTC, BEFORE the judged analyzer run.
**Policy:** competent verbatim (`scripts/policies/competent.js`),
sha256 `1884c8852d38...` (as recorded on the corpora).
**Horizon:** 150d, death-aware. **Band:** 106241–106248 (8 seeds —
the band the 19 not-bids are on).

## The question (finding #2605; tracker blank #1)

The damage question (#2605) has no judged answer after four
screened bands (106211–106248, none designates); the blocker is
launch formation, not fight shape. The strikeband4 screen
(`evidence/2026-11-20/sim-strikeband4-b.md` §2, §7, §8) sharpens
it: the binding funnel stage is **candidate-not-bid (19)** — 19
plan instances opened by a wave-4+ seed and never bid — with
plan-churned-before-dawn (7) second, and 15 wave-4-target launches
the frozen definition does not count. This arm classifies EVERY
not-bid candidate by the gate that rejected it, and classifies the
churn, on the band where the 19 live.

## What was read first (do not re-measure what they answered)

- `evidence/2026-11-20/sim-strikeband4-b.md` + prereg — the 4th-band
  NO-GO screen: 7 counted launches, 3 first-fights (floor 6), 3
  distinct strike-fights by proxy / 2 exact (floor 4); binding
  funnel candidate-not-bid (19); uncounted-launch question (§7.3);
  volley-only proxy catch (§5.1); repeat-target churn, third
  sighting (grace_obi vs the algorithm d85/d90/d94).
- `evidence/2026-11-20/sim-strikeband-b.md`, `sim-dmgshape-b.md`,
  `sim-dmgcheck-b.md` — the screen family: the blocker moved
  upstream from fight shape to launch formation; the dmgcheck
  verdict (band variance, not a base regression); the launch
  engine works on its designated band.
- `docs/CANON.md`, `docs/MONSTER-WAVES.md` — read first; wave-4
  bands (damage 35–95, HP 850–1500) and the readiness bars are
  canon. No canon doc covers expedition destination picking
  (haventarget CANON GAP, inherited).
- `docs/MEASUREMENT.md` §§9–12, 14–15 — staged seeds, death-aware
  horizons, pre-registration, metric binding, balanced panels.
- The bid path in code, read before freezing: `winPlanCands`
  (`src/js/villager-brain.js:193`), `vbrainScorePick` (same file,
  the win-plan override), `vbrainExecuteDepart` (same file, the
  brain launch path + companion plan-copy), `winPlanDepart` /
  `winPlanSeedFromFight` / `purgePartyRefs` (`src/js/win-plan.js`),
  the dawn re-pick gate + at-Haven departure gate
  (`src/js/villager-objectives.js`: `objTick` dawn block,
  `objMaybeDepart`), `startExpedition` (`src/js/villager-agency.js`).
- The existing instruments, reused not rebuilt:
  `scripts/strikeband4-survey-driver-b.js` (the recorder whose
  corpora this arm classifies),
  `scripts/analyze-launchfunnel-a.js` (`funnelForSeed`) +
  `scripts/analyze-launchdef-a.js` (`classifySeed`) (the instance
  state machine + funnel taxonomy this arm enriches, never
  re-defines).

## Pre-freeze status (read-only; no judged run before this freeze)

Before freezing, this arm performed READ-ONLY passes over the
EXISTING strikeband4 corpora (no new sim was run, no corpus
written): the funnel table for the band (31 instances), the
pool aggregation, the churn seed/census rows, the uncounted-launch
copy check, and the launch-realness check (`dawnbidStarts`). Those
passes shaped the taxonomy below (they showed which gates the
taxonomy must cover); they did not judge anything — the judged
run is the analyzer below, and its bar is frozen here.

## DECISION — the uncounted-launch definition question (strikeband4 §7.3)

**DECIDED, before freezing: follow-on hunts COUNT as launches.**
The frozen `launchesOf` requires `(targetWave | 0) >= 4`, and 15
launches against wave-4 target types carry `targetWave` null. Code
reading establishes why: the companion plan-copy paths
(`win-plan.js` `winPlanDepart` launchParty, and
`villager-brain.js` `vbrainExecuteDepart`) copy `target` (+`node`)
onto the companion's plan but NEVER copy `needWave` — so a
companion's later launch against the same wave-4 type carries
`targetWave: null` by construction, not because it is a different
kind of hunt. Read-only verification on the corpora: all 15
uncounted launches carry a `party_launch` commit, stage `hunt`,
source `brain`, and a same-day `startExpedition` call for the
holder — genuine wave-4-target party launches. **This arm's
counting rule:** a launch is any `v4departs` row with result
`launch` whose target's wave in `src/data/monsters.json` is >= 4,
regardless of `targetWave`. **This does NOT re-score strikeband4:**
its verdict is robust either way (distinct first-fights stay 3,
§7.2) and is not re-judged here. The rule applies to THIS arm's
classification only.

## Population (no new judged sims in this stage)

The judged leg classifies the EXISTING corpora
`evidence/2026-11-20/perseed-strikeband4-b-106241-106248/` (8
files, recorded by the strikeband4 driver on master `1fcd7edba`,
corpus anchor `c02411c23`, policy `1884c8852d38`, substrate flags
all `1`: SENSEEXPED PARTYSIZE4 VETREENGAGE FLEEREPAIR2 FIGHTALLY2
ALLYSLOT3 LAUNCHSURVIVE; `allyslot3InSrc: false`). **No sim is
re-run for the judged leg:** re-running the band would re-roll
events (finding #2616 — designation transfers in counts, events
re-roll entirely), producing DIFFERENT not-bids; the 19 to
classify are the ones in these corpora. The analyzer asserts the
recorded substrate on every file and refuses corpora that do not
match (wrong arm/run/policy/flags).

**Base-identity check (verified before freezing):** the bid-path
files (`villager-brain.js`, `win-plan.js`, `villager-objectives.js`,
`villager-agency.js`) are BYTE-IDENTICAL between the corpus base
`1fcd7edba` and this arm's base `faa5d65a9` (`git diff --stat`
shows only `fieldFights.js` — the env-gated CELLGATE hold, inert
without `CELLGATE=1`, which this substrate does not set — and
`game.js`). Code citations in the evidence therefore describe the
corpora's own code.

## Taxonomy (frozen — per-dawn, per-instance, churn, pool, launches)

Instances and buckets come from the frozen launchdef/launchfunnel
classifiers (`classifySeed`, `funnelForSeed`); this arm ENRICHES
them, never re-defines them. A candidate-not-bid instance is
complete only when EVERY scored dawn in its window AND every
not-scored dawn in its window carries a reason below, and the
instance rollup names its modal reason.

### A. Scored dawns (part-0 score rows in the instance window)

From the score row's candidate list (`winPlanAction` values) +
the row's plan stage (the `winPlanCands` fall-throughs, read in
code before freezing):

| Reason | Rule (first match) |
| --- | --- |
| `bid` | `party_launch` in cands (contradiction check for not-bid instances — must be 0) |
| `gear-hold` | `gear_hold` in cands (stage gear, unarmed + unarmored) |
| `party-no-companion` | `party_wait` in cands (stage party, `findCompanion` null) — joined to the pool row for that dawn |
| `veteran-guard` | `veteran_guard` in cands (stage table, wave-4 killer, no companion) |
| `gear-geared-silent` | no win-plan cand, stage `gear`, armed or armored (the silent fall-through) |
| `hunt-standing-table-no-companion-silent` | no win-plan cand, stage `hunt`/`standing`/`table`, no companion (the silent fall-through) |
| `other-action:<acts>` | some other win-plan action present |
| `unknown-no-rule` | no win-plan cand and stage outside the known set, or plan missing from the row — MUST be 0 |

Mid-day refresh rows (part 1/2) are counted beside the dawn
table; any `party_launch` among them on a not-bid instance is a
contradiction reported as `unknown-midday-bid`.

### B. Not-scored dawns (instance window days after the seed day with no part-0 score row)

Classified from the census row for that day (+ pool member rows
where they exist), first match:

| Reason | Rule |
| --- | --- |
| `no-dawn-after-seed` | window after the seed day is empty (village ended / instance opened on the final day) |
| `holder-dead` | census `holderAlive` false, or a death row for the holder that day or earlier in the window |
| `holder-on-expedition` | census `holderExped` true |
| `holder-away` | a pool member row for the holder that day reads `away: true` (the `v.away` flag, which the `objTick` dawn block requires to be absent before any re-pick) |
| `holder-off-haven-no-away-read` | no member row that day; census node != haven (the holder never returns to the haven tile; the away flag is sampled, not daily — evidence-strength split reported beside the count) |
| `plan-not-in-census` | no census row for the holder that day (plan deleted / holder left `winPlan`) |
| `unknown-not-scored` | none of the above matched — MUST be 0 |

### C. Churn (the 7 plan-churned-before-dawn instances)

Each carries its frozen `closeKind` (`holder-died` /
`plan-deleted` / `retargeted`) PLUS the closing evidence: the
death row (holder-died) or the closing seed row (retargeted: the
new flee that re-seeded the plan, with its stage-after + path) or
the last census day (plan-deleted). Repeat-target churn is
reported beside: for each vid+target launched >= 2x with no
meeting, the launch days + the track rows for the window
(`targetAliveCount`, `targetNearDist` trend, holder node, last
known tile + source) — the stale-node question is answered from
those rows, not assumed.

### D. Companion pool (the bid gate, per scored not-bid dawn)

For every scored not-bid dawn, the pool row is joined and the
first-fail counts tallied (`dead` / `away` / `trustLow` /
`notAtHaven` / `engaged` / `notRanger` / `onExped` / `eligible`)
plus the roster profile census (rangers at home vs away, from the
pool `members` arrays). A dawn with no pool row is
`unknown-no-pool-row` (MUST be 0 for part-0 rows).

### E. Launch realness + the uncounted 15

Every wave-4-target launch row (counted 7 + uncounted 15, per the
§7.3 decision above) is checked against `dawnbidStarts` for a
same-day `startExpedition` call for the holder; a row without one
is `launch-no-start-call` (reported, not silently dropped). Every
uncounted launch is checked against earlier launches for the
holder-as-companion copy link (holder in an earlier launch's
party / companion slots with the same target); a launch with no
such link is `uncounted-no-copy-link` (reported, not assumed).

## Primary metric (frozen)

Classification completeness over the 19 candidate-not-bid
instances (every scored dawn + every not-scored dawn reasoned,
0 `unknown-*`) + the bid-gate distribution (which gate rejects,
with counts, per dawn and per instance).

## DIAG-GO BAR (frozen — a miss is NO-GO, never re-scored)

The diag is **DIAG-GO** only if ALL of these hold:

1. **Completeness:** 0 `unknown-*` across all 19 candidate-not-bid
   instances (scored + not-scored dawns) AND across all 7 churned
   instances (closeKind + closing evidence present).
2. **Binding gate named:** at least one gate is named as the
   binding rejecter with counts (a per-dawn reason holding a
   plurality of the scored not-bid dawns, with its pool
   decomposition where it is the companion pool).
3. **Launch accounting:** all 22 wave-4-target launches accounted
   (7 counted + 15 uncounted under the §7.3 decision), each with
   its realness check and, for the uncounted 15, its copy-link
   verdict; the uncounted count reconciles to the strikeband4
   §2 table (15).
4. **Instrument validity:** proof test
   `scripts/test-launcheng-b.js` green; analyzer selftest green;
   analyzer run on the real band dir reproduces the frozen
   totals (31 instances, 19 candidate-not-bid, 7 churned, 22
   wave-4-target launches, 15 uncounted, 0 instrument errors on
   8/8 files).

If any bar fails, the verdict is **DIAG-NO-GO** with the gap named
as the next run's instrument item — never re-scored against a
friendlier taxonomy mid-run.

## Build gate (frozen) + overlap guard

**BUILD SECOND, ONLY if** the classification names a concrete,
small, fixable mechanism (a gate rejecting viable candidates for
a fixable reason) — under a SECOND frozen prereg with GO bars on
the same band (before/after on identical seeds, guardrail:
survival/starvation vs control). **If no such mechanism emerges,
deliver DIAG-GO with the named next lever and NO game-code
change.** **OVERLAP GUARD (verified before freezing):** the held
sibling branches touch exactly the files a launch lever would
need — `sim-pinquaddoor-b` touches `fieldFights.js`, `game.js`,
`party-wiring.js`, `villager-agency.js`, `villager-brain.js`,
`win-plan.js`; `sim-reseedexpiry-b` touches `fieldFights.js`,
`villager-brain.js`, `win-plan.js` (diff vs merge-base, `src/js`
+ `scripts/`). If the named mechanism lives in any of those
files, deliver diag-only and name the lever for the next run — do
not force a merge conflict.

## Wall numbers (reported every run, both national definitions)

Wins, national by scaleRank ≥ 2, national by standing ≥ 200,
table seats, wave-4 unlocked, wave-5 unlocked, median survival,
total deaths, starvation deaths — recomputed by the analyzer from
the corpora (not copied from the strikeband4 evidence). Also the
standing-199 stall count.

## Sense-testing (SENSE-TESTING LAW)

Read transcripts. Quote real `vetSays` lines and read at least
one churned plan's story end to end (the grace_obi
algorithm expedition d85–94 and/or the desmond_clarke retarget
chain on 106247) from the corpus rows + the death/census record.
Judge meaning, coherence, consequences — never just counts. The
evidence carries a "metric review" section.

## Instrument limitations (pre-registered, not hidden)

1. **No new sims:** this stage classifies corpora recorded on
   base `1fcd7edba`; it cannot see anything the strikeband4
   recorder did not record (no per-dawn objective kind/state, no
   daily `v.away` — the away flag is sampled only on other
   holders' scored dawns via pool member rows). Where the
   mechanism inference rests on sampled evidence, the evidence
   says so and splits observed vs inferred counts.
2. **Target matching is by TYPE, not instance** (inherited from
   the survey family): a first fight against "the target" may be
   against a different individual of the target species.
3. **Day granularity:** a same-day fight may precede the launch
   within the day (the family's convention, kept).
4. **The analyzer reuses frozen classifiers** (`classifySeed`,
   `funnelForSeed`, `launchesOf`/`firstFight` from
   `analyze-dmgshape-rerun-b.js`) — their definitions are not
   re-decided here except for the §7.3 launch-counting decision
   above, which is explicitly flagged wherever it changes a count
   vs the frozen `launchesOf`.
5. **Write flap:** intermittent EPERM on fresh-file writes has
   struck this program repeatedly (quiet on the strikeband4 run).
   Writes are probed before they matter and verified by
   size/readback; a blocked final commit leaves files on disk
   intact for coordinator adoption, never forced.

## Files

- Prereg: `evidence/2026-11-20/sim-launcheng-b-prereg.md` (this file)
- Instrument: `scripts/analyze-launcheng-b.js`,
  `scripts/test-launcheng-b.js`
- Corpora (existing, read-only):
  `evidence/2026-11-20/perseed-strikeband4-b-106241-106248/` (8 files)
- Analysis: `evidence/2026-11-20/launcheng-b-analysis.json`
- Evidence: `evidence/2026-11-20/sim-launcheng-b.md`
- `src/` diff: 0 lines in this stage (DIAG, analyzer only).

---

## CORRECTION 2026-11-21 (appended after the first judged run — see MEASUREMENT §14; the frozen body above is not rewritten)

The first judged analyzer run (2026-11-21 ~01:15 UTC) returned
DIAG-NO-GO on the completeness bar: 89 `unknown-not-scored`
dawns. Read-only diagnosis of those 89 against the corpora +
the `objTick` code (`villager-objectives.js:1764-1914`) shows the
frozen Taxonomy B was built on a false premise — that a holder
is scored at most once a day, at dawn (part 0). In fact scoring
happens at any of the 4 day-parts, and the pick PHASE DRIFTS:
a `party_wait` pick sets a HAVEN_CHORE with
`partsLeft = 2 + floor(R()*3)` (2–4, or 3–5 when the core pick
was VISIT); the chore completes after that many `objTick` parts,
and the re-pick happens at the next part where the objective is
observed done — dawn only when the completion lands exactly on
a part boundary that leaves the objective idle at dawn
(`vbrainShouldRefresh`: a same-day pick blocks mid-day
re-picks while the commit is fresh; a stale commit allows
them). So most "not-scored dawns" are days the holder WAS
assessed, mid-day. The instrument is corrected, NOT the bar:
the DIAG-GO bar (0 unknown) stands unchanged; the unit moves
from "dawn" to "instance-day" and Taxonomy B is replaced by B'
below. The corrected run is the judged run for this arm; the
first run's DIAG-NO-GO stands as the record of the instrument
gap, and this correction is the dated account of what changed
and why.

### C1. Scored-dawn total 143 → 141

The frozen total 143 counted companionPool rows in instance
windows. Two of those pool rows are RETARGET-BOUNDARY dawns:
the dawn pick belonged to the predecessor instance (the plan
retargeted mid-day), so the instance-matched part-0 score count
is 141, not 143. The two days: 106246
`app_mgpspk5p357` d145 (dawn pick for `influencer`; the
`cancellation` plan was seeded later that day) and 106247
`james_okonkwo` d88 (dawn pick for `eulogy`; the `audit` plan
was seeded later that day). The analyzer's 141 was correct;
the exploration's 143 double-counted the boundary.

### C2. Taxonomy B' — day-level zero-row classification (replaces B)

Unit: the instance-day (every day in `[seedDay, endDay]`).
A day is ASSESSED if any score row exists for (vid, target)
that day, at any part (dawn part-0, or mid-day part 1–3); its
reason comes from Taxonomy A applied to the part-0 row if
present, else the earliest mid-day row. A day with NO score
row is a ZERO-ROW day, classified first-match:

| Reason | Rule |
| --- | --- |
| `holder-dead` | death row for the holder that day or earlier, or census `holderAlive` false |
| `holder-scholar` | the holder is the player character (scholar) at dawn — `daily[day].scholarId == vid` AND `daily[day-1].scholarId == vid` (the scholar never runs `vbrainScorePick`; `objTick` skips `rid == villagerId`). The 3 scored-while-scholar rows in the corpora are mid-day inheritances (holder scored at dawn as a villager, became scholar later that day) and do not contradict this. |
| `retarget-boundary` | a score row exists that day for the same vid with a DIFFERENT plan.target (the dawn pick belonged to the predecessor instance — C1) |
| `seed-day` | `day == seedDay` (the plan was seeded by a fight mid-day; no dawn pick could exist before it) |
| `holder-on-expedition` | census `holderExped` true |
| `holder-away` | a pool member row for the holder that day reads `away: true` (part-0 sample of the `v.away` flag) |
| `field-encounter-day` | a `v4encounters` row that day names the holder (as `vid` or in `allyVids`) — the encounter consumed their parts |
| `plan-not-in-census` | no census row for the holder that day |
| `holder-off-haven` | census node != haven (away-return in progress; the away flag is sampled, not daily) |
| `phase-edge` | the previous assessed day's pick was at part 3 with corePick VISIT — the only no-skip shape whose completion lands on the last part of this day (`p3 + L=5`, L from `3 + floor(R()*3)`), so no refresh fires this day and the next pick lands at the next dawn. Consistency argument, not proof: the R() draw is unrecorded; both phase-edge days' next picks ARE at the next dawn, as the model predicts. |
| `unknown-no-signal` | none of the above matched — MUST be 0 for DIAG-GO |

Pool rows are part-0 only, so the pool decomposition (Taxonomy
D) still rests on the 141 dawn days; the 82 midday-only days
carry the same reason (`party_wait`) without a fresh pool
sample — the evidence says so.

### C3. Corrected frozen totals (instrument-consistency check)

31 instances, 19 candidate-not-bid, 7 churned, 22
wave-4-target launches, 15 uncounted, 0 instrument errors on
8/8 files (unchanged) + 141 scored not-bid dawns (was 143, C1)
+ 268 instance-days, 223 assessed days (141 dawn + 82
midday-only), 85 midday rows, 226 assessed rows, 45 zero-row
days, 10 `unknown-no-signal` zero-row days. The 10 are:
106241 `visjoin_91` d97, d103; 106243 `visjoin_116` d122;
106246 `visjoin_125` (strike) d129, d131, d135; 106246
`visjoin_96` (editor) d146; 106247 `david_kim` (eulogy) d72;
106247 `fatima_hassan` (reunion) d98; 106247
`app_mgpspki2526` (spoiler) d127. On each, the
holder was at Haven, not away at part 0, not the scholar, not
a seed day, with no encounter and no phase-edge shape — yet
the phase model predicts a pick. The only remaining mechanism
in code is skipped `objTick` parts (mid-day `isEngaged`, or a
mid-day node excursion), neither of which the strikeband4
recorder sampled. Closing them needs a per-part holder-state
recorder (objective kind/state/partsLeft, `v.away`,
`isEngaged`, node, for plan holders) on a fresh band — the
next run's instrument item, since events re-roll and a probe
cannot retroactively classify these 9 days.

### C4. Effect on the verdict

The DIAG-GO bar is UNCHANGED (0 unknown). With 10
`unknown-no-signal` instance-days the completeness bar FAILS,
so the corrected run's verdict is DIAG-NO-GO on completeness
alone — bars (2) binding gate, (3) launch accounting, (4)
instrument validity pass. The substantive diagnosis is
complete (the binding gate is named with counts on 223/223
assessed days); the miss is 10/268 days (3.7%) of
non-assessment days, not rejected bids. No game-code change
follows from this stage (diag-only per the overlap guard —
see the evidence file).
