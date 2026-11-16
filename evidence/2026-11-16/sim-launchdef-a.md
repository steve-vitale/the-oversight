# sim-launchdef-a — the profile-gate bypass re-tested under an any-commit metric, with a skip-reason recorder (LEVER + INSTRUMENT)

Run `fleshout-20261116T0645Z`, axis scale-onramp (converging, NOT converged).
Arm: **sim-launchdef-a**. Branch `sim-launchdef-a`, worktree
`~/workspace/worktrees/sim-launchdef-a`, base master `a3462c4f2`.
Claims: sim-findings #2414 (mid-day metric miss) and #2415
(agencyTick skip reason unrecorded) — both claimed at start, both
answered here. Sibling arm: none on this run (Loop B live on a
DIFFERENT band, 102001–102008 — untouched).

## Verdict: PILOT GO

The frozen bar was: launched wave-4+ plans on ≥3 of 8 seeds
(any-commit definition) AND the cost bar clean AND the instrument
valid AND skip-reason coverage (no bare `selected-not-executed`
commit-day). The armed leg launched **6 instances on 4 of 8 seeds**
(102011, 102015, 102016, 102018). Cost bar clean (starvation 0 vs
1, arm-only 0 vs 1; median 90d vs 90d, ratio 1.0). Instrument
valid (classified 1.0, unknown 0, 16/16 files parse, 0 instrument
errors, drift clean). Skip coverage clean (0 bare
`selected-not-executed` days out of 27 blocked commit-days).
Proof 82/82 on the control tip, the armed tip, and the post-revert
tip. **GO — the gate fix lands as game code.**

**Disposition:** the seed call is REVERTED (`b735283cd`); the gate
fix LANDS (`ed542bba4`, `src/js/villager-agency.js` only — the
branch's `src/` diff is exactly the 18-insertion bypass).
Whether the seed call lands WITH the gate fix, as a chain repair,
is a separate coordinator decision — on master without a seed
source the fix is nearly inert (plans almost never form; dawnbid
control: 0 instances in 8 seeds). The instrument, corpora, panel,
and this evidence remain.

## The lever, in plain words

Dawnbid (0315Z) found that of 24 seeded wave-4+ plans, 8 were bid
and selected but never left — all 8 holders were non-rangers,
because the daily departure routine (`agencyTick`) skips anyone
who is not a wanderer or explorer before it ever tries to send them
out. The 0446Z profilegate pilot tested lifting that gate and
judged NO-GO — but its frozen metric counted only dawn launches,
and the fix's two real launches came through mid-day commits. This
arm re-tests the SAME fix under a corrected metric (a launch
counts on ANY commit — dawn or mid-day refresh) and adds the
missing instrument: a skip-reason recorder that says WHY a
`party_launch` commit produces no execute row. The fix: a launched
`party_launch` plan bypasses the non-ranger profile gate in the
depart path. Only that gate changed — every other launch condition
stayed as it was.

## Before / after (identical seeds 102011–102018, 150d death-aware horizon)

Baseline: tableseat-nowait policy (`scripts/policies/tableseat-nowait.js`,
sha `a11a1abc672e`, wrapping leanlinkrescue `53f310aba27a`),
env `LEANLINKRESCUE=1 TABLESEATNOWAIT=1`, both legs — a REAL
tableseat-nowait baseline (flags on). The subject only exists with
the vetparty seed call (reverted on master): BOTH legs re-land it
verbatim (13 lines from `ccf6d869c`, blob `a66d45a5e`, in
`resolveWildMonsterEncounter`, `src/js/game.js`). Control = seed
call ON + gate intact; armed = seed call ON + gate bypass. The
judged difference isolates the gate.

Seed-band freshness (verified 2026-11-16 by this arm): zero hits
for 102011–102018 in `evidence/*.md` (all dated preregs
included), `scripts/*.js`, per-seed filenames under `evidence/`
(one glob false positive:
`evidence/2026-10-30/sim-sicktele-b-trace-10201.json` — the number
is 10201, not in this band), and `*.md` under goal
`hidden_files/`.

### Bucket decomposition (analyzer `launchdef-a-analysis.json`)

| Bucket | Control (16 instances) | Armed (16 instances) |
|---|---:|---:|
| launched (any-commit) | 3 | **6** |
| target-killed | 1 | 0 |
| selected-blocked | 6 | 2 |
| bid-not-selected | 0 | 0 |
| plan-churned-before-dawn | 2 | 2 |
| candidate-not-bid | 4 | 6 |
| unknown | 0 | 0 |

Seed calls wave-4+ (analyzer count): control 39, armed 64.
Classification: classified share 1.0, unknown 0, 16/16 files
parse, 0 instrument errors. Instance count is 16 vs 16 — no
small-n divergence artifact this time (profilegate read 3 vs 7).

Launch events (not just instances — one instance can launch
repeatedly): armed **13 launches** (8 dawn, 5 mid-day part-1) vs
control 8 (6 dawn, 2 mid-day part-1). The gate adds **+5 launch
events, +3 instances, +2 seeds** beyond control. The one
mid-day-first instance is tashi_sherpa (seed 102015, target
eulogy, day-65 part-1 launch) — under the old dawn-only
definition the armed leg would still read GO (5 dawn launches on
4 seeds), but the corrected metric is what counts all five
mid-day launches, and the proof's fixture proves the two
definitions differ on the same corpus.

### GO section (analyzer)

| Bar | Armed | Control | Pass |
|---|---:|---:|---|
| launched seeds (≥3 of 8 needed) | 4 (102011, 102015, 102016, 102018) | 2 | **YES** |
| launched total (instances) | 6 | 3 | — |
| launched dawn-only (secondary) | 5 | 2 | — |
| median survival | 90d | 90d | ratio **1.0** ≥ 0.8 ✓ |
| starvation deaths, totals | 0 | 1 | 0 ≤ 1+2 ✓ |
| starvation deaths, arm-only (matched same-seed same-day) | 0 | 1 | 0 ≤ 1+2 ✓ |
| bare selected-not-executed days | 0 / 27 blocked days | — | ✓ |
| national at end (scaleRank ≥ 2) | 8/8 | 7/8 | — |

### Wall numbers

| | Control | Armed |
|---|---:|---:|
| wins | 6/8 | **7/8** |
| national at end (scaleRank ≥ 2) | 7/8 | 8/8 |
| national (standing ≥ 200, analyzer wall) | 1/8 (seed 102016, standing 467) | 0/8 |
| table seats | 0/8 | 0/8 |
| wave-4 reached | 8/8 | 8/8 |
| wave-5 reached | 1/8 (seed 102016) | 0/8 |
| median survival | 90d | 90d |
| villages lost | 2/8 | 1/8 |
| total deaths | 497 | 528 |
| scholar (player) deaths | 25 | 34 |
| starvation deaths | 1 | 0 |

Ever-national is NOT derivable from this corpus (no trustWeekly
samples) — the prereg's "end + ever" wording over-promised; only
end-national is reported, both ways (scaleRank and standing ≥ 200).
Control launched on 2 seeds (< 3), so the prereg's "re-read as
gate-adds-launches" clause was NOT triggered — the bar is judged
on the armed leg as written, and the delta (+3 instances, +2
seeds) is reported alongside.

### Per-seed table

| Seed | Leg | Days | End | Won | Rank | Standing | MaxWave | Deaths | Starv | Scholar | Instances | Launched |
|---:|---|---|---|---|---|---|---:|---:|---:|---:|---:|---:|---:|
| 102011 | control | 90 | won | yes | global | 199 | 4 | 54 | 0 | 1 | 2 | 2 |
| 102011 | armed | 90 | won | yes | global | 199 | 4 | 54 | 0 | 1 | 2 | 2 |
| 102012 | control | 90 | won | yes | global | 199 | 4 | 54 | 0 | 2 | 0 | 0 |
| 102012 | armed | 90 | won | yes | global | 199 | 4 | 54 | 0 | 2 | 0 | 0 |
| 102013 | control | 90 | won | yes | global | 199 | 4 | 85 | 0 | 8 | 4 | 0 |
| 102013 | armed | 90 | won | yes | global | 199 | 4 | 86 | 0 | 10 | 3 | 0 |
| 102014 | control | 90 | won | yes | global | 199 | 4 | 63 | 0 | 1 | 0 | 0 |
| 102014 | armed | 90 | won | yes | global | 199 | 4 | 63 | 0 | 1 | 0 | 0 |
| 102015 | control | 75 | village-lost | no | regional | 150 | 4 | 61 | 1 | 5 | 1 | 1 |
| 102015 | armed | 90 | village-lost | no | global | 199 | 4 | 64 | 0 | 3 | 3 | 2 |
| 102016 | control | 92 | won | yes | global | 467 | 5 | 61 | 0 | 4 | 7 | 0 |
| 102016 | armed | 90 | won | yes | global | 199 | 4 | 62 | 0 | 10 | 4 | 1 |
| 102017 | control | 95 | won | yes | global | 177 | 4 | 58 | 0 | 3 | 2 | 0 |
| 102017 | armed | 100 | won | yes | global | 199 | 4 | 61 | 0 | 3 | 3 | 0 |
| 102018 | control | 83 | village-lost | no | global | 199 | 4 | 61 | 0 | 1 | 0 | 0 |
| 102018 | armed | 90 | won | yes | global | 199 | 4 | 84 | 0 | 4 | 1 | 1 |

Seeds 102011, 102012, 102014 are bit-identical on both legs (the
gate never engaged there — 102011's launchers were rangers).
Death causes, both legs combined shape: villager combat 224 →
237, combat 57 → 77, expedition 158 → 146, the wild 20 → 25.
Villages die fighting, not hungry, on both legs.

### Balanced panel (instrument, not judge)

`scripts/build-launchdef-panels-20261116.js` →
`launchdef-a-panel.md`: decision **review_required**. Table win
rate 0.75 → 0.875 (delta +0.125, change_watch); national scale
access 0.875 → 1.0; **village deaths per run 62.125 → 66.0
(delta +3.875, regression_signal, CI [0.5, 9.5])**;
villageDeaths100Days +1.66 (regression_watch). The deaths signal
is real and is the lever's price, not a new death mode: it is
concentrated on seed 102018 (+23 deaths, 84 vs 61 — the seed with
the most gate-enabled departures, 70 depart rows armed vs 22
control) and is combat deaths (villager combat +13, combat +20
across the legs; expedition deaths actually fell 158 → 146).
Scholar deaths rose 25 → 34. No new death-cause category appears
(single-instance named-monster causes on the armed leg — 'The
Eater', 'Big Big', 'The Suburb' — are the same class as control's
'Gavel' / 'Hushpuppy' / 'The Static Kite'). The panel's
review_required is consistent with a GO under the frozen bar
(the prereg threshold is the judge, not the panel), but the
deaths price is a watch item for any confirm round: if the
confirm reproduces +4 deaths/run, the cost bar needs a deaths
term, not just starvation.

### Drift check D3 (`scripts/vetparty-drift-check.js`): CLEAN, NO PRE-LEVER DRIFT

First divergence on/after first lever day on every seed: 102011
identical; 102012 identical; 102013 div 81 / lever 10; 102014
identical; 102015 div 48 / lever 11; 102016 div 56 / lever 54;
102017 div 92 / lever 31; 102018 div 27 / lever 26. All
divergence is post-seed, so the armed/control difference is
lever-caused, not harness drift.

### Proof (`scripts/test-launchdef-a.js`): 82/82 green on all three tips

- Control anchor (`LAUNCHDEF_SEED_CALL=on LAUNCHDEF_GATE=off`): 82/82.
- Armed tip (`SEED_CALL=on GATE=on`): 82/82.
- Post-revert (`SEED_CALL=off GATE=on` — the landing shape): 82/82.
- Live gate fixture: staged non-ranger forager `gen_hg69huq` at
  Haven with companion `gen_ntb585y` — execute NOT reached
  without a commit on either tip; with a `party_launch` commit,
  reached on the armed tip and not on the control tip. D1
  repeatability and D2 wrap neutrality green (60d, seed 102011).
- Live skip-recorder fixture (new): a staged away holder records
  `away-as-companion`; a control-tip holder records
  `profile-gate-veto`; an armed-tip holder records no skip row
  (execute reached).
- Fixture-level old-vs-new: the same mid-day-launch fixture
  classifies `launched:companion:v2:mid-day part-1` under
  any-commit and `selected-blocked:selected-not-executed` under
  dawn-only — the 0446Z miss, reproduced and corrected at
  fixture level.

## The skip-reason decomposition (the new instrument's answer)

Skip rows recorded per (vid, day, part) where a wave-4+ plan
holder holding today's `party_launch` commit produced no execute
row:

| Reason | Control | Armed |
|---|---:|---:|
| profile-gate-veto | **39** | **0** |
| away-on-expedition | 22 | 31 |
| night (all at tick part 3) | 8 | 17 |
| not-at-haven | 4 | 4 |
| other | 2 | 1 |
| **Total skip rows** | **75** | **53** |

What this says, in order:

- **The profile gate was the veto, and the bypass removes it.**
  Control recorded 39 profile-gate-veto ticks; armed recorded 0.
  The cleanest possible demonstration: the same holders, the same
  commits, the veto gone. (Control's blocked instances are
  almost all profile-gate-veto: boris_kowalski 1 day, sanne_bakker
  ×2 instances, brian_otieno + sanne_bakker herald 3 days each —
  and in the armed leg brian_otieno LAUNCHED on day 79 with the
  same companion diana_osei.)
- **The scorer bids return trips for holders who are already
  away.** 53 away rows across both legs. Post-hoc join against
  launch depart rows: 36 had the holder's own launch in-window,
  1 companion-only, 16 both (the holder had launched as inviter
  AND gone as companion within 6 days — the roles overlap in the
  same villagers). The Diana Osei lesson stands as a shape, but
  on this band the dominant away shape is a holder out on their
  OWN launched expedition while the scorer keeps bidding the
  return trip — they cannot depart twice.
- **Part-2 commits die at the night tick.** All 25 night rows are
  at tick part 3: a part-2 `party_launch` commit's next tick is
  night, and `isNight()` vetoes it. Mid-day part-2 launches are
  nearly unreachable by construction — the part-1 commit is the
  working mid-day channel (all 5 mid-day launches are part-1).
  Finding appended to `sim-findings.md`.
- **The 3 `other` rows are explained, and they expose a recorder
  gap.** All three (jorge_silva day 78 both legs; gen_8hwccou day
  84 control) have a CLEAN pre-tick snapshot — wanderer/explorer,
  at Haven, not night, not engaged, no danger — yet execute was
  never called. Post-hoc join: all three departed as COMPANIONS
  in the SAME tick (gen_w3zeqy2 launched with jorge as companion;
  diana_osei launched with gen_8hwccou as companion), before
  their own roster turn. The pre-tick snapshot is stale for them:
  the recorder must re-read expedition status AFTER the tick.
  Fix named for the next instrument revision
  (`away-as-companion-this-tick`); finding appended.
- **No bare `selected-not-executed` days.** Every blocked
  commit-day carries a recorded reason or a depart-row blocker
  (0/27) — the day-70 gap from profilegate-a does not recur.
  The `no-tick-after-commit` inference fired 5 times (part-3
  commits written after the day's last tick — elijah_scott day
  87 both legs; jorge_silva days 60/61 both legs).
- **Away-as-companion vs away-on-expedition via plan stage is
  NOT measurable.** The design assumed a companion's own plan
  stays at party stage while they are out; in fact
  `vbrainExecuteDepart` mirrors the companion's plan to `hunt`
  on departure, so both shapes read `away-on-expedition` at tick
  time. The split above comes from the post-hoc depart-row join,
  not the live recorder. Recorded here so the next instrument
  does not re-derive it from stage.

## Why the gate fix did not convert more selections

- **Companion pool still binds (6/16 armed instances).** All six
  `candidate-not-bid` instances are `no-companion-party` — the
  plan sits at party stage for weeks with no eligible companion
  at Haven. The gate fix cannot help a plan nobody will go with;
  this is dawnbid's Gate 2, unmoved.
- **A real launch condition still bites.** boris_kowalski
  (seed 102013, target eulogy) bid 7 times over 7 days and was
  blocked every time by `inviter-range-0` — the untouched
  range-0 launch condition working as designed, not a gate
  failure.
- **Wave-5 went the other way on one seed.** Control 102016
  reached wave 5 (standing 467); armed 102016 stopped at wave 4
  (standing 199). Drift-clean divergence day 56 vs lever first
  acted day 54 — a single-seed trajectory effect, not a lever
  claim in either direction. Report as observation only.

## Sense-testing

Read the fight lines, not just the counts. The launched parties
go somewhere real, with real companions, and fight what they meet:

- Armed 102015 day 59/61 — Tashi vs The Eulogy (the seed fight,
  then the launched return): "R1: Tashi contradicts the narration
  — it says Tashi runs — Tashi advances." / "R1: Final Chapter
  hits Tashi for 18 (75 left)" / "R2: Epitaph hits Tashi for 13
  (62 left)". 3 rounds, 2 allies, fled.
- Armed 102015 day 70–72 — Adaeze vs The Eater, three meetings
  across the launched window: "R1: Gorge hits Adaeze for 9 (76
  left)" / "R1: Adaeze strikes for 11 (547 left)" … day 72, at 1
  HP: "Adaeze is past holding — they run while running still
  works." 5 rounds, then 2, then 1 — the party kept going back
  and the monster kept winning the war of attrition.
- Armed 102011 day 68 — Peyton vs The Eater: "Peyton walks
  straight into The Eater. No avoiding it." / "Peyton's gear
  absorbs 39." / "R1: Peyton strikes for 25 (1051 left)". 5
  rounds, 2 allies, fled.
- Armed 102016 day 76 — Brian vs The Eulogy: "R1: Brian
  contradicts the narration — it says Brian runs — Brian
  advances." / "R1: Final Chapter hits Brian for 15 (46 left)".
  3 rounds, 2 allies, fled.

No launched party killed its wave-4 target: 0 wave-4 kills by any
of the six launchers in the final kill logs (their kills are wave
1–3). The launches produce real fights, mostly flees — wave 4 is
hard, and the chain's next binding link is killing, not leaving.
Jorge Silva launched 3 times after the strike and met no wave-4
monster at all on those trips (0 recorded wave-4 encounters as
inviter) — the target had moved on; the expedition still resolved
as a real trip, not a departure to nowhere.

## What the village looked like (plain words)

The villages look the same on both legs, except where the gate
worked. Seven of eight armed villages win (six control), all reach
national standing or better, and they die mostly fighting — on
the road, in expeditions, in village combat — not hungry. The one
real difference is underneath: parties that used to be stopped at
the door now actually leave — six wave-4 parties went out across
four villages, five of them through the morning table and one
(Tashi, day 65) through a mid-day re-score the old metric would
have missed — but the extra fighting cost lives: 31 more deaths
across the eight villages, mostly on the seed where the gate let
the most parties out, and the scholar died nine more times. The
fix works, the price is combat deaths, and the chain still stalls
earlier, at the morning table, where the people who want to go
back usually have nobody to go with them.

## Blanks filled / documented

- **Skip-reason recorder works; `selected-not-executed` is
  decomposed.** Profile-gate-veto 39 → 0 is the headline; away
  (53 rows), night-at-part-3 (25), not-at-haven (8), and the
  3 same-tick companion `other` rows are all accounted for.
  Findings #2414 and #2415 updated to `[fixed]` with this
  evidence link.
- **Recorder gap: pre-tick snapshot goes stale on same-tick
  companion departures** (the 3 `other` rows). Next instrument
  revision must re-read expedition status after the tick.
  Finding appended to `sim-findings.md`.
- **Part-2 commits die at the night tick** (17 armed rows). A
  part-2 `party_launch` commit's next tick is night. Design
  question, not this arm's: should a part-2 commit hold to the
  next dawn, or is part-1 the only real mid-day channel?
  Finding appended.
- **Veteran-death silence persists:** 288 `vetSays` lines on both
  legs, **0** mention a veteran dying (the 2 grep hits are
  "deadfall" — gathering dead wood). Same silence dawnbid and
  profilegate found. The finding stays open (not re-appended).
- **Companion pool still unmeasured at this n** (6/16 armed
  instances `no-companion-party`, same shape as dawnbid). The
  pool decomposition per dawn is still owed (Loop B's
  second-companion-pool item).

## Metric review (NOT a re-score — verdict stands GO)

1. **The any-commit definition works and the dawn-only count is
   kept alongside.** Armed: 6 launched instances any-commit, 5
   dawn-only; 13 launch events, 5 via mid-day part-1 commits.
   Under dawn-only the verdict would still be GO (5 on 4 seeds),
   so the correction is validated but not load-bearing on this
   band — the mid-day launch it adds (tashi_sherpa day 65) is
   one instance, and the gate's effect is visible either way.
2. **Control launched on 2 seeds, so no re-read was triggered.**
   The gate-adds-launches delta (+3 instances, +2 seeds, +5
   events) is reported as the effect size, not folded into the
   bar.
3. **The panel's deaths regression_signal is not in the frozen
   cost bar.** The bar covers starvation + median survival only.
   A confirm round should pre-register a deaths term (or the
   coordinator should rule the +3.875/run combat-death price
   acceptable for +3 launches) — this run does not smuggle it
   into the verdict either way.
4. **Ever-national is not derivable from this corpus** (no
   trustWeekly samples). Report end-national only, both
   definitions, and do not conflate the analyzer's standing ≥ 200
   national (0 armed / 1 control) with scaleRank ≥ 2 national at
   end (8/8 armed / 7/8 control).
5. **The away split is post-hoc, not live.** The recorder's
   stage discriminator cannot separate away-as-companion from
   away-on-expedition (the brain mirrors the companion's plan to
   hunt). The decomposition in this evidence comes from joining
   skip rows to depart rows after the fact. A live split needs
   the recorder to check other holders' parties at tick time.

## Files and commits

- Prereg: `a3541c609` — `evidence/2026-11-16/sim-launchdef-a-prereg.md`
- Instrument: `34acf4371` — `scripts/launchdef-driver-20261116.js`,
  `scripts/analyze-launchdef-a.js`,
  `scripts/build-launchdef-panels-20261116.js`,
  `scripts/test-launchdef-a.js`
- Proof fixes: `90fdfff63` (classifySeed `.instances` + filename
  dates), `64de09470` (verbatim PROFILEGATE marker + case-C
  re-stage)
- Analyzer path fix: `1a8b2c849` (analysis to 2026-11-16)
- Control anchor: `2c6195662` — seed call re-landed verbatim
  (blob `a66d45a5e`)
- Control corpus: `f28363fad` — `evidence/2026-11-16/perseed-launchdef-a-control/` (8 files)
- Armed anchor: `ed542bba4` — gate fix (`src/js/villager-agency.js`,
  18 insertions, 1 deletion)
- Armed corpus: `247dbec24` — `evidence/2026-11-16/perseed-launchdef-a-on/` (8 files)
- **Revert: `b735283cd`** — seed call (13 lines, `src/js/game.js`)
  removed; proof 82/82 re-run post-revert; `git diff <base> HEAD
  -- src/` is the gate fix only
  (`src/js/villager-agency.js`, 18 insertions, 1 deletion)
- This evidence + `launchdef-a-analysis.json` + panel outputs
  (`launchdef-a-panel.json`, `.md`, `-before.json.gz`,
  `-after.json.gz`): this commit.
- Logs: `/tmp/launchdef-control.log`, `/tmp/launchdef-armed.log`
  (ephemeral, not committed).

## Process notes

- The index-clobber pattern from AGENTS.md struck after the
  prereg, instrument, and both corpus safe-commits — repaired
  each time with `git ls-tree -r HEAD -- <paths> |
  git update-index --add --index-info` (with `-r` for
  directories), verified by `git status` empty on the committed
  paths. Also: safe-commit.sh does NOT accept directory paths —
  expand globs to explicit file lists.
- The proof caught two real bugs before any judged sim: the
  static check renamed the gate marker (the fix is re-landed
  VERBATIM with its original `PROFILEGATE (sim-profilegate-a)`
  marker — the check must match the source, not the arm name),
  and the staged away-holder fixture assumed the plan stays at
  party stage (on the armed tip case B launches the plan, so
  case C must re-stage it — which is also how the
  away-on-expedition reason was discovered to be the live shape).
- The analyzer wrote its first output to `evidence/2026-11-15/`
  (a `path.join` date the rename pass missed); caught by the
  console path, fixed, re-run — same GO, same numbers.
- `check.js --quick` NOT re-run: one `src/js` file changed (the
  gate fix, proof-covered 82/82 on three tips); same standing
  rationale as 0446Z.
- Telemetry deviation check: REFUSED by shape (recorder rows,
  anchorCommit) — same pattern as 0115Z/1415Z/0315Z/0446Z.
  Baseline NOT rolled; no LOUD lines; no investigation item.
