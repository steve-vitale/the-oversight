# sim-rumortarget-a — rumor-born plans take the beast named in the heard tale

**Verdict: PILOT NO-GO.** Primary 3/8 seeds, bar 4. The rule works — 21
attaches, 156 targeted launches — but wave-4/5 tales almost always arrive
after the plan has already taken a wave-3 beast, or go stale, or the teller
dies first. The miss is timing, not a broken rule. The lever is reverted in
the worktree and verified (see Revert record); the commit of that revert was
refused by `scripts/safe-commit.sh`'s delete guard, so the lever still sits
on the branch, env-gated OFF by default. This file lands evidence-only.

- Run: Loop A `fleshout-20261117T0215Z`, axis scale-onramp, arm
  `sim-rumortarget-a`, branch `sim-rumortarget-a`.
- Base: master `5d5293972` (verified at start). Instrument tip:
  `b98b229ed` (lever + prereg + instrument). Policy: competent verbatim,
  `scripts/policies/competent.js`, sha256 `df9b7dff4de498779655b04db29782023840d8b2a4ed19a0ecbe86db9c71438c`
  (12-char `df9b7dff4de4`).
- Band: seeds 103101–103108 (fresh; re-verified in the prereg — 0 hits in
  any `*.md` under `evidence/`, in `scripts/`, or in live goal claims).
  Horizon: 150d death-aware (+10d tail max). 8-seed pilot.
- Prereg: `evidence/2026-11-17/sim-rumortarget-a-prereg.md` (frozen before
  any judged sim). Analyzer: `scripts/analyze-rumortarget-a.js` —
  exit code 1 (primary failure, by design).
- Analysis: `evidence/2026-11-17/rumortarget-a-analysis.json`.
  Panel: `evidence/2026-11-17/rumortarget-a-panel.md` (+ `.json`,
  `-before.json.gz`, `-after.json.gz`).
- Corpora: `evidence/2026-11-17/perseed-rumortarget-a-control/` and
  `evidence/2026-11-17/perseed-rumortarget-a-on/` (8/8 each).
- Master has since moved to `2ac3052b0` (vetreengage-confirm-a CONFIRM
  NO-GO landed). `src/js/win-plan.js` is unchanged between base and
  current master, so the verified revert applies cleanly to either.

## What was built

When a rumor-born plan (`origin 'heard'`, created from fire talk in
`winPlanHavenTick`, target-null, stage gear/party/hunt) stands at Haven,
`winPlanRumorAttach` attaches the beast named in a tale actually told at
the fire — gated by the drive brief's rumor rules
(`docs/VILLAGER-BRAIN.md` §2, §7 phase 1):

- **Source trust:** tale actually told (`played === true` on
  `state.killerTales` / `vetKillerTales`) by a teller alive on the roster
  now (not in `village.fallen`). Tales only queue for villager killers,
  never the scholar.
- **Staleness:** tale day within 30 days (`RUMOR_TALE_FRESH_DAYS = 30`,
  a prereg choice, not canon).
- **Distance:** tale told at Haven's fire to a villager standing at Haven
  (delivery distance zero by construction). Kill location is NOT in state
  (waveKillLog/tales carry no coordinates) — recorded as a blank, not
  invented. The plan gets a target species, never a node (`plan.node`
  stays null).
- **Wave:** beast wave ≥ 3. Pick highest wave, then freshest tale day,
  then queue order (deterministic).
- On attach: `plan.target = mid`, `plan.needWave = wave`, provenance
  stamps `targetSource='tale'`, `targetTeller`, `targetTaleDay`, plus one
  `Game.say` voice line naming the beast via `monsterDisplayName` and the
  teller via `firstRef`.
- Attach fires at creation AND as a refresh on later Haven ticks while the
  plan is target-null (creation-only was judged a straw man: births
  front-load before any wave-4 tale can exist). No re-attach once
  targeted; a stale tale never clears a target.
- Env gate `RUMORTARGET=1`, default OFF (mirrors the `VETREENGAGE`
  precedent). Live-master sites only (`winPlanHavenTick` + new helper
  `winPlanRumorAttach` in `src/js/win-plan.js`, 166 lines).

## Judged numbers vs the frozen bars

| Bar (frozen in the prereg) | Result | Pass? |
| --- | --- | --- |
| **Primary:** rumor-born plans acquire a named wave-4/5 target on ≥4/8 seeds (armed leg) | **3/8** (103101, 103103, 103107) | **FAIL** |
| **Launch bar:** launched rumor-born plans carrying a target ≥1 (any wave) | **156** participant-rows, all hunt-stage; 48 wave-4/5 | PASS |
| **Cost — deaths/run:** armed ≤ control mean + 2 | 90.125 → **88.625** (bar ≤ 92.125) | PASS |
| **Cost — median survival ratio:** armed/control ≥ 0.9 | 142 → **131**, ratio **0.9225** | PASS |
| **Cost — starvation deaths:** armed ≤ control + 2 | 3 → **1** (bar ≤ 5) | PASS |
| **Proof test** `scripts/test-rumortarget-a.js` green incl. old-code-fails control | **67/67** at instrument tip `b98b229ed` | PASS |
| **Instrument:** 8/8 + 8/8 files parse, 0 errors both legs, D1 + D2 green, §15 panel attached | 8/8 + 8/8, 0/0 errors, 0 control attach rows, 0 cross-check mismatches, D3 clean (below) | PASS |

A miss on the primary is PILOT NO-GO — never re-scored against a
friendlier metric mid-run (§14). The launch bar, the cost bars, the proof
test and the instrument all pass; only the primary fails, by one seed.

The prereg's feasibility note did NOT trigger: the control leg shows 5/8
seeds with at least one told wave-4/5 tale (103101: 3, 103102: 2,
103103: 2, 103104: 1, 103105: 3; 103106/103107/103108: 0), so the primary
was achievable by construction on this band. The NO-GO is a straight bar
miss, not a supply-absence escape.

## Wall numbers

| | Control | Armed (RUMORTARGET=1) |
| --- | --- | --- |
| Wins | 0/8 | 0/8 |
| National at end | 0/8 | 0/8 |
| Wave 4 reached | 8/8 | 8/8 |
| Wave 5 reached | 2/8 | 3/8 |
| Median survival (upper median, 5th of 8 sorted gameDays) | 142d | 131d |

No wins, no national seats on either leg. The armed leg's third wave-5
seed is 103107, whose trajectory the lever changed (see per-seed table).

## Per-seed table

gameDays is the analyzer's day count (the driver's `days` field reads 1
less on most seeds — a day-counting offset, not a different run). Starv =
starvation deaths (kind/cause naming starvation/hunger). w4/5 = attaches
with a wave-4/5 beast. RumorBorn = distinct rumor-born plans. ToldW45 =
told (played) wave-4/5 tales at end of run. Opps = applicable attach calls
with no result (a missed opportunity).

| Seed | Armed (days / end / deaths / starv / standing / maxWave) | Control (days / end / deaths / starv / standing / maxWave) | Attaches (w4/5) | Creation / Refresh | RumorBorn | ToldW45 | Opps |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 103101 | 151 / survived / 99 / 0 / 465 / 5 | 151 / survived / 99 / 0 / 465 / 5 | 5 (5) | 0 / 5 | 6 | 3 | 8 |
| 103102 | 121 / lost / 101 / 0 / 199 / 4 | 121 / lost / 101 / 0 / 199 / 4 | 2 (0) | 2 / 0 | 3 | 2 | 0 |
| 103103 | 151 / survived / 106 / 0 / 199 / 4 | 150 / survived / 121 / 1 / 199 / 4 | 4 (1) | 1 / 3 | 6 | 3 | 7 |
| 103104 | 121 / lost / 76 / 0 / 199 / 4 | 147 / lost / 73 / 0 / 199 / 4 | 2 (0) | 0 / 2 | 3 | 1 | 5 |
| 103105 | 131 / lost / 92 / 0 / 400 / 5 | 142 / lost / 107 / 1 / 540 / 5 | 2 (0) | 0 / 2 | 3 | 3 | 9 |
| 103106 | 116 / lost / 60 / 0 / 175 / 4 | 116 / lost / 60 / 0 / 175 / 4 | 0 (0) | 0 / 0 | 0 | 0 | 0 |
| 103107 | 151 / survived / 126 / 0 / 525 / 5 | 96 / lost / 111 / 0 / 199 / 4 | 6 (2) | 2 / 4 | 6 | 3 | 8 |
| 103108 | 65 / lost / 49 / 1 / 140 / 4 | 65 / lost / 49 / 1 / 140 / 4 | 0 (0) | 0 / 0 | 0 | 0 | 0 |
| **Total** | | | **21 (8)** | **5 / 16** | **27** | **15** | **37** |

- **Bit-identical trajectories (4 seeds):** 103101, 103102, 103106,
  103108 — every headline number matches control exactly. On 103101 the
  5 attaches changed nothing measurable: the plans were already launching;
  the targets just named what they were already doing.
- **Diverged trajectories (4 seeds):** 103103 (deaths 121 → 106),
  103104 (147d → 121d), 103105 (deaths 107 → 92, standing 540 → 400),
  103107 (lost day 96 → **survived 150d**, standing 199 → 525, wave 5
  reached). The lever changes departures, departures change encounters,
  encounters change everything downstream. The 103107 flip is one seed —
  not a judged claim, and the cost bars still pass.
- **103106 / 103108:** no rumor-born plan is ever created and no wave-4/5
  tale is ever told. The primary was unachievable by construction there —
  the same shape as rumorplan-a seed 102016. The village still plays; the
  plan system is not on the critical path under competent on this band.

## Attach split

- **By wave:** 21 attaches total — 8 wave-4/5, 13 wave-3. No wave-1/2
  tale ever attaches (gated out by design).
- **By site:** 5 at creation, 16 on refresh. Creation-only would have
  given a 2/8 primary (103103, 103107) — the refresh path supplied the
  3rd primary seed (103101, all 5 attaches on refresh). The refresh was
  essential, not a nicety.
- **Tale ages at attach:** 1–28 days (median ~5). The oldest attach,
  103107 day 146, took a herald tale told day 118 at age 28 — two days
  inside the 30-day window. The window is doing real work at the boundary.
- **Distinct tales:** of the 15 told wave-4/5 tales on the armed leg,
  only 4 were ever attached (103101 suburb day 57; 103103 herald day 94;
  103107 eulogy day 96, herald day 118). The other 11 arrived after the
  plans had already attached, or went stale, or their teller died. On
  103101 all 5 attaches took the SAME tale (Adaeze's suburb, day 57) —
  it stayed fresh and she stayed alive, so every heard plan at Haven
  took it.
- **Missed opportunities:** 37 applicable calls with no attach. At every
  one, the only candidates on offer were wave-1/2 tales (reject reason
  `wave<3` on all 37), untold tales, or stale tales. No wave-4/5 tale was
  ever eligible at an opportunity moment and passed over.

## Launches

- **156** launched rumor-born participant-rows carrying a target (the
  prereg's definition: one row per participant per real expedition start,
  plan origin `heard`, `targetAfter` non-null) — all 156 hunt-stage.
- **48** of them wave-4/5 (44 on 103101, 4 on 103107).
- Grouping by (day, inviter) among inviter-heard rows gives **88**
  distinct expedition starts carrying a target, **31** of them wave-4/5
  — a lower bound on distinct launches (companion-heard rows excluded).
- The target persists across launches and spreads to companions: a
  companion's own plan carries the same target into their next hunt
  (see the trip read below).

## Voice sample (sense-testing)

All 21 attach lines are in the corpora (`vetSays`, matched by the
analyzer). Each names the teller by first name and the beast as the
village knows it at that moment. Four judged against their cited tales:

1. **103101, day 58 — Luz.** "Luz keeps coming back to Adaeze's tale of
   The Suburb — and now has a beast to hunt." Honest: Adaeze killed a
   suburb on day 57 (companion kill) and told the tale at the fire that
   day ("You all know The Suburb by now. I put another one down
   today."). Age 1 day.
2. **103101, day 64 — Jorge.** "Jorge keeps coming back to Adaeze's tale
   of Big Ugly — and now has a beast to hunt." Same tale, same beast as
   (1) — but the beast is now named "Big Ugly", not "The Suburb".
   The line uses `monsterDisplayName` at attach time, and the display
   name moved between day 58 and day 64. The line is honest at attach
   time and matches the tale's wording at tale time; the flip itself is
   a pre-existing naming-system behavior, not this lever's (see
   Findings). One beast, two names across the run.
3. **103103, day 108 — Sari.** "Sari keeps coming back to Botros's tale
   of Loud-Eyes — and now has a beast to hunt." Honest: Botros
   (`app_mgpspjcy270`) told the herald tale on day 94; attached at age
   14 days. The herald is the run's only wave-4 attach on this seed.
4. **103107, day 98 — Theo.** "Theo keeps coming back to Theo's tale of
   The Eulogy — and now has a beast to hunt." The holder citing a tale
   he himself told: Theo killed the eulogy on day 96 and told it at the
   fire. Coherent under the rule — his plan is rumor-born because at
   creation he had fought nothing (`fought: []` on his creation row); he
   killed the beast after his plan was created, and the origin stamp is
   a creation-time fact. A villager can be moved by their own story
   retold at the fire.

## Trip read (one launched targeted plan, end to end)

Seed 103101, holder `gen_glpkqri`:

- Day 53: companion on `gen_v8gvd52`'s hunt, target-null.
- Day 58: attaches suburb on refresh (Adaeze's tale, age 1d) and
  launches the same day as inviter — hunt stage, target suburb,
  needWave 4, party of 1.
- Days 62, 65: companion on two more suburb-targeted hunts
  (`gen_q86y332`, `leo_martin`) — the target spreads through the party.
- Days 70, 73: launches again as inviter with target suburb.
- **But:** zero suburb encounters all run (21 wave-4 encounters, none
  suburb). The only suburb kill was Adaeze's day-57 companion kill that
  produced the tale. The target names the hunt; it does not summon the
  beast. The parties went out hunting "suburb" and met audits, eulogies,
  congregations, strikes, algorithms and reunions instead — mostly
  evaded. The lever changes what plans say they are hunting, and it
  changes departures; it does not change what the world puts in front of
  them.

## Why the primary missed (nearest misses)

The mechanism works. The bar fails on timing: a plan takes the first
fresh beast it hears about, and wave-4 beasts are almost never the first
thing it hears. A plan attaches once and never reconsiders.

- **103102 — the reunion tale died with its teller.** Tariq told the
  reunion tale on day 55. By day 90, when Desmond's heard plan stood at
  Haven, the tale was 35 days old (stale) AND Tariq was dead. The
  second wave-4 tale (herald, day 111) came after both heard plans had
  already attached wave-3 beasts (days 54, 90). No target-null heard plan
  remained to hear it.
- **103104 — the herald tale arrived after the last call.** The only
  wave-4 tale was told day 101. The last attach call was day 95 (two
  null calls, no tales on offer at all). No target-null heard plan stood
  at Haven in the tale's 30-day window; the village was lost day 121.
- **103105 — all three wave-4/5 tales came too late.** Herald day 97,
  suburb day 115, editor day 116 — all after the last attach call (day
  39). The plans had taken wave-3 beasts on days 32 and 39 and never
  looked back.
- **103107 — the suburb tale went stale two days early.** A suburb tale
  told day 66 was 32 days old when the next heard plan stood at Haven
  on day 98 — two days past the window. The day-98 attach took the
  eulogy tale (age 2) instead. The herald tale (day 118) did attach on
  day 146, at age 28 — two days inside the window.
- **103106 / 103108 — no plans, no tales.** Nothing to attach, nothing
  to attach to.

The pattern is consistent: wave-4/5 tales are told late (days 55–118)
while heard plans attach early (days 32–90) to whatever fresh wave-3
tale is around. The 30-day window and the attach-once rule then lock the
plan to the wave-3 beast. A second round that wants this bar would need a
different rule — e.g. re-attaching when a higher-wave tale arrives — not
more call sites. That is a design call for the coordinator, not this arm.

## Drift (D3) and panel (§15)

- **D3 drift smoke** (`scripts/vetparty-drift-check.js`, control vs
  armed): **NO PRE-LEVER DRIFT.** 4 seeds bit-identical (103101, 103102,
  103106, 103108); the other 4 diverge only after the lever first acted
  (103103 diverges day 43 vs first attach day 37; 103104 day 45 vs 35;
  103105 day 39 vs 32; 103107 day 34 vs 32). No divergence precedes any
  attach.
- **§15 balanced panel** (`evidence/2026-11-17/rumortarget-a-panel.md`):
  decision `review_required` (screen-only run); **no material signal on
  any observed metric.** Village deaths/run 90.125 → 88.625 (paired
  delta −1.5, 95% exploratory interval −7.5 to 4.5); community loss
  0.75 → 0.625; national 0 → 0; wins 0 → 0. The lever moves nothing on
  the wall metrics at this n, consistent with the cost bars.

## Revert record (loud failure — read this)

Per the task, a primary miss means PILOT NO-GO: revert the lever on the
branch (verify `src/` diff vs master is 0 lines), land evidence-only.

The revert was **performed and verified in the worktree** — `git checkout
5d5293972 -- src/js/win-plan.js`, then `git diff 5d5293972 -- src/` empty
and `node --check src/js/win-plan.js` passing — but the **commit was
refused** by `scripts/safe-commit.sh`:

> REFUSED: this commit deletes 160 lines in src/. This is the stale-tree
> revert signature. If this is intentional, re-run with --force-delete.

The task forbids `--force-delete` without coordinator approval, so it was
**not** forced. The revert was rolled back to keep the worktree in a
clean, committed state, and is reported here instead.

**Current branch state:** the lever remains on the branch at
`b98b229ed`, env-gated with default OFF. The OFF path was proven
bit-identical to old code (proof test control + 4/8 armed seeds
bit-identical to control), so the game is unchanged. The branch is
evidence + instrument + a dormant lever. The coordinator's call:
approve `--force-delete` for the revert commit, or drop the lever commit
on merge. The verified revert is one command:
`git checkout 5d5293972 -- src/js/win-plan.js` (win-plan.js is unchanged
between base `5d5293972` and current master `2ac3052b0`, so this restores
master content either way). The remaining `src/` diff vs current master
is only the two journey-r230 master-side landings (`convo-dialogue.js`,
`convo-wants.js`) that predate this branch — not this arm's changes.

**Proof-test note:** `scripts/test-rumortarget-a.js` passed 67/67 at the
instrument tip `b98b229ed`. Its static anchor ("src diff is win-plan.js
only") describes that tip; once the revert lands, that assertion fails
by design (src/ back to master) and the lever assertions require
`RUMORTARGET=1` + the lever code. The test documents the lever's
behavior at `b98b229ed`; it is not a live green check on a reverted tree.

**Ontology regen note:** running `node scripts/check.js --quick` on this
branch regenerated `docs/ONTOLOGY.md` (one line: `Provides:` for win-plan
gains `winPlanRumorAttach(vid, atCreation)`). The lever commit
`b98b229ed` omitted that regen; it is committed here with the evidence so
the tree stays self-consistent. If the coordinator later applies the
revert, the line goes stale again until the next check regenerates it —
self-healing, no action needed.

**Full check result:** `node scripts/check.js --quick` on the instrument
tip + evidence (see the commit message for the final numbers).

## Metric review

- Bars were frozen in the prereg before any judged sim; the analyzer
  exits non-zero on bar failure (it exited 1) and no bar was re-scored
  mid-run. The primary is judged exactly as pre-registered: ≥1
  wave-4/5 tale-attach row on a rumor-born plan, per seed, armed leg.
- The mechanism secondary (wave-3+ attaches: 21 attaches on 6/8 seeds,
  156 targeted launches) shows the RULE works — the miss is the timing
  of wave-4/5 tales relative to plan attachment, not the attachment
  rule itself. The creation-vs-refresh split is reported as a secondary:
  refresh supplied 16/21 attaches and the 3rd primary seed.
- Cost bars use the analyzer's counts (deaths array lengths; starvation
  read from `deaths` rows matching /starv|hunger|famine/i on kind+cause —
  the rumorplan-a corpus had 0 such rows anywhere, so a 0/0 read means
  "no observed starvation deaths", not "no villager ever hungered").
  Median survival is the analyzer's upper median (5th of 8 sorted
  gameDays), 142 → 131, ratio 0.9225.
- No staged fight fixture was used; judged numbers come from full 150d
  sims under competent policy. The encounter-gear rule does not apply —
  this arm stages no fight fixture.
- The panel is the instrument, the pre-registered threshold is the
  judge. The panel's `review_required` is its standing label for a
  screen-only run, not a verdict on this arm.

## Findings for the backlog (via report — coordinator owns sim-findings.md)

1. (Known) The rumorplan-a proof test's frozen competent sha
   `74a890f0844e` is stale on current master (journey r127/r128/r140
   landings changed `competent.js`).
2. (Known) The per-villager heard-list gap: no per-villager record of
   who heard a tale — the brain doc's phase-2/3 trust map +
   heard-filtered belief state is the fuller fix.
3. (Known) Kill location is not recorded in state, so no location gate
   is possible without a new write at the kill choke point.
4. (Known) Seeds 103106/103108 (like rumorplan-a seed 102016) never
   create any win-plan at all, yet the village still plays — plans are
   not on the critical path under competent on this band.
5. (New) **Attach-once locks in wave-3.** A plan that takes a fresh
   wave-3 tale can never upgrade to a wave-4 tale told later. The
   wave-4/5 bar fails on timing, not supply. A second round would need
   a re-attach-on-higher-wave rule — a new design call.
6. (New) **Display-name flip.** The same beast is named "The Suburb"
   in a day-58 attach line and "Big Ugly" from day 64 in later lines
   for the same tale. The line uses `monsterDisplayName` at attach time
   and matches the tale's wording at tale time; the flip is a
   pre-existing naming-system behavior, not this lever's.
7. (New) **Self-tale attach.** A holder can attach a tale they
   themselves told (Hannah, Theo, Avery) when they killed the beast
   after their plan was created — origin is stamped at creation, so a
   later fight does not reclassify the plan.
8. (New) **`safe-commit.sh`'s delete guard blocks the mandated NO-GO
   revert.** Any src/ deletion trips the stale-tree-revert guard, and
   `--force-delete` needs coordinator approval — so a killed arm's
   revert cannot land from the arm itself. Either the coordinator
   approves the flag per revert, or the guard needs a carve-out for
   evidence-only reverts.
