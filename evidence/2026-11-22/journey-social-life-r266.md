# Journey social life r266 — run note

**Run:** Lane B social life, prereg `evidence/2026-11-22/journey-social-life-r266-prereg.md`.
**Seeds:** 45813–45816 (fresh band, unused per the prereg's reuse check).
**Driver/analyzer:** `scripts/journey-social-life-r266-20261122.js`,
`scripts/analyze-journey-social-r266-20261122.js` (r265 driver/analyzer verbatim
except seeds + OUTDIR).
**Timeout note:** the run hit the 3600s cap during execution. The panel and Arm B
were complete when it timed out; the adoption (this note) finished the remaining
work — determinism re-run, dry-site root cause, people transcript check, village
assessment, telemetry, gate — in the same worktree. Nothing was re-run or
re-scored after the timeout.

## Prereg (as filed)

- **Arm A — F5-REASK:** daily scan (max 2 visits/day, after the day's social play)
  for a villager with an `ask_favor` seed on a *settled, named* favor; open a
  sitting, press the want choice, record the served variant. Frozen bars:
  F5-REASK any variant ≥1, F5W any variant ≥1, F6 dry 0, M4-SPLIT conversational
  ≤12, TRAIL distinct ≥6 / max recurrence ≤4.
- **Arm B — test-side fix for the r152 regression:** the named-favor landing broke
  three standing proof matchers (F5 46/4, F6 48/1, repay-fallback 35/1). Fix the
  tests to match the (unchanged) game behavior; controls r225 F5 22/0 and the
  r152 named test must stay green.
- **Blank — DRY-SITE:** one dry line anywhere in the panel is a named defect; if
  it fires, find the exact trigger and line in `conversation.js` and report it.
- **Watch-only:** M12-native (revised bar), M6, B6, M9, M10, FACE, outing watch
  (kept/attempts ≥25%).

## Panel verdicts

| Bar | Result | Verdict |
| --- | --- | --- |
| M4-SPLIT conversational | 15 (bar ≤12); instructional 208 | **NO-GO** |
| TRAIL distinct | 4 (bar ≥6); max recurrence 2 (bar ≤4, passes) | **NO-GO** |
| F6 dry-line | 1 (bar 0) | **NO-GO** |
| F5 settled-favor (named pool, legacy) | V1=0 V2=0 V3=0 | 0 — honest, generic pool only |
| F5W settled-favor (widened, both pools) | V1=2 V2=2 V3=2, total 6, all on 45813 | V3 served in the wild, first time in 8 panels |
| F5-REASK funnel | scanned 3878, askFavorSeeds 1478 (distinct 198), settled-at-last-sight 0, sittings 0, reasks 0 | starved — see below |
| M12-native (watch) | threeTimes 65, maxPerSitting 1, sittings 2+ = 0, exits 221 (11.48% of 566) | GO |
| M6 haven-news (watch) | strandedDays 27, deliveredAtHaven burst 386 / settle 192 / witness 46 / tale 152; radius-1 away 0 | GO (re-aligned gate definition) |
| B6 want-resolutions (watch) | 586 total, deflectedFromStage0 0 | GO |
| M9 recap cap (watch) | fires in the wild | HOLDS |
| M10 NARR coach (watch) | 0 verbatim repeats in 581 conversations | HOLDS |
| FACE (watch) | 0 accuseFace verbatim repeats in a sitting | HOLDS |
| M11 recap-empty (watch) | 0 of 223 near-dup flags | 0 — job-B1 pool fix does NOT land |
| M8 link-formation (watch) | SETTLED — ≥1 link formed via a driver settle, no BLOCKED re-raise after | SETTLED |
| BOND | 114 villager-initiated proposals (link 64, person 50), 35 accepted; 0 scholar-initiated | ANSWERED |
| OUTING (watch ≥25%) | attempts 8, kept 2, deliveredKcal 740, conversion **25.0%** — passes exactly | watch PASSES |
| CONFESS | total 22, confessed 9, attacked 2, deflected 4, already-confessed 7 | — |
| DROPPED-THREAD | 1 of 581 conversations | same sitting as the F6 dry line |

Three binding bars miss, so the run is **NO-GO overall**. No bar was re-scored;
the misses stand as filed.

## The dry line — root cause (BLANK, answered)

**The one dry line:** seed 45815, day 82, David Kim. The player picks the resume
line *"We never finished — that debt."* and the game answers
*"…Sorry, lost my train of thought."* — a dry answer to a real pick about a
real, still-open debt. The same sitting is the panel's only dropped thread
(DROPPED-THREAD 1/581).

**Mechanism (verified in code):** the dry line is the `sayLine` no-repeat
fallback in `src/js/conversation.js` (~line 1096–1100): when the pick's
intended line is blocked by the run ledger — already said in this sitting or
inside the 48-entry run window — the game has nothing else to say and falls
back to *"lost my train of thought."* The resume pick re-serves the dropped
thread's last beat; that beat was already in the ledger, so the pick dried.
The line is honest about the failure (it says the thread is lost) but it is
still a dry answer to a live question, and the bar counts any dry line
panel-wide, so F6 fails on this one line.

**What is NOT established:** which exact line was blocked (the settled-favor
variant or the thread's last beat). The corpus does not record it. The next
run should either log the blocked line when the fallback fires, or — the fix
direction, not built here — make the resume pick fall through to the thread's
*next* line (the r19 opener fall-through pattern) instead of the dry fallback.
No game fix was built in this adoption; this is a filed finding.

## F5-REASK funnel — diagnosis (Arm A)

The arm never got a sitting. 3,878 scans, 1,478 `ask_favor` seeds, 198 distinct
seeds — **every one last seen in state `asked`, zero ever seen settled** at
scan time. The gate is seed visibility, not the re-ask branch:

- The natural path works: all 6 F5W servings came through ordinary sittings on
  seed 45813, one villager (`app_mgpspjdv685`, Svyatoslava), two favors —
  a wound favor on d50 (V1, then V2, then V3 across three re-asks in one
  sitting) and a food favor on d104 (V3, V1, V2). The cycle draws each
  variant in turn without replacement, and the lines read as a person
  (*"Never mind this wound — we got it handled. Thanks anyway."*,
  *"This wound — it's taken care of, I swear."*,
  *"Honestly? It's done — this wound. Finished. Thank you for checking."*).
- The arm scanned **after the day's social play**. A seed whose favor settles
  is consumed by the first sitting that opens on it the same day — by the
  end-of-day scan it is already gone, and the seeds still visible are the
  ones whose favors have not settled yet. A daily scan structurally cannot
  catch the window.
- **Next arm:** intercept at the sitting (or scan before social play), not a
  daily scan after it. The prereg's fallback — seed the re-ask, or give
  settled favors a want — still applies if interception proves impractical.

## Arm B — test-side fix (verified by the adoption)

All three fixed matchers green, re-run by the adoption in this worktree:

- F5 harness: **50 passed, 0 failed** (was 46/4)
- F6 dry-opener: **49 passed, 0 failed** (was 48/1)
- repay-fallback: **36 passed, 0 failed** (was 35/1)
- Controls: r225 F5 settled-favor **22/0**; r152 settled-reask-names-favor
  **11/0**; r247 settled-help-names-favor PASS (0 failed); r201 settled-favor
  **9/0**.

The game behavior is unchanged; the tests now match it. The r152 test debt
for these three matchers is closed.

## Determinism

Seed 45813 re-run to a separate OUTDIR (`/tmp/det-r266`); the JSON is
**identical to the panel JSON after stripping wall-clock fields**. The panel
is deterministic.

## People check (full transcripts read by the adoption)

Five contexts read in full (A day-1 nudge, B first meeting, C friendship,
D talk-request, plus the F5W servings and the dry sitting):

- **Wanjiru Kamau, 45814 d84 (C-friendship) — GOOD.** Opens with a real
  village-link proposal (*"I've heard good things about Ashford. We should
  link with them — we'd be stronger together."*), then a belief exchange
  with a real voice (*"I believe in breakfast. In people showing up. Small,
  provable things. The big beliefs all broke — the small ones held."*) and
  personal history (wild food forager; fun was *"whatever I could steal
  between shifts"*).
- **Adaeze Nwosu (D-talk-request) — the M4 shape, handled.** A real water-haul
  ask and table talk with voice (*"Seven doors and it chose US. I save the
  best bite for last and try to feel chosen instead of chosen-at."*), but the
  driver hammers *"Wait — what were we talking about?"* three times and the
  game answers with the thread label three times, escalating only on the
  third (*"We're going in circles — still on that water haul."*).
- **A-day1-nudge (Devon Okafor, 45813 d2) — door-direction cycling.** The
  driver asks *"Why can't I do this now?"* four times; the game cycles four
  Haven-door direction variants. Patient, but four near-identical lines in
  one sitting is exactly what M4 flags (door-req flags 127 of 223 near-dups
  panel-wide, worst sitting 6 in one C-friendship sitting on 45813).
- **F5W sittings (d50, d104) — read as a person.** See the F5-REASK section.
- **David Kim, 45815 d82 — the defect.** One dry line, as above. The sitting
  otherwise reads fine (mourning, *"You asked me that before"*, a party
  decline), which is what makes the dry answer land badly: the conversation
  was alive and the game dropped it.

Flat spots carried forward, not defects: door-direction cycling under driver
hammering, and *"So." / "Well." / "Anyway."* filler when the driver repeats
a small-talk pick four times in a row.

## Village assessment (plain words)

Three villages survive to day 138–141; the fourth (45815) is lost on day 138
— scattered, hungry for five days, one person left (David Kim, the villager
from the dry-line sitting). 581 conversations across the panel (152/155/155/119
per seed), 487 natural ends, 79 feasts, 7 moots. 114 villager-initiated bond
proposals, 35 accepted; end-of-run bonds 91/86/72/102. 27 successions (the
scholar's seat passed hand to hand as people died). 4 plots, all tied to a
grievance, none late; all 4 springs escaped. 9 confessions out of 22
confrontations. Nothing in the villages themselves reads as broken — the
panel's failures are all in conversation lines, not in village life.

## Metric review

- **M4-SPLIT (NO-GO, 15 vs ≤12):** conversational near-dups rose from r265's
  12 to 15. The drivers are the door-direction cycle and the thread-label
  resume loop — both are the game answering a repeated driver pick with a
  near-identical line. The bar is doing its job; the fix is line variety in
  those two spots, not a bar change.
- **TRAIL (NO-GO, distinct 4 vs ≥6):** only 4 distinct press-sequences
  recurred across 6 presses. The trail pool is thin; the next run needs a
  wider press pool or a looser bar with a reason.
- **F6 (NO-GO, 1 vs 0):** one dry line, root-caused above. The bar is
  absolute and the miss is real.
- **F5 legacy 0:** the named-pool metric still reads zero because the
  servings came through the widened pool. F5W is the honest judge now and
  it fired (V3 in the wild for the first time). The legacy F5 bar should be
  retired or re-pointed at the widened pool next run — it measures the
  generic pool's silence, which is by design.
- **M12-native GO (watch-only):** max 1 repeat per sitting, 0 sittings with
  2+, 221 exits. The native three-times guard holds.
- **M6 GO (watch-only):** no naming-beat line emitted beyond radius-1 of
  Haven. The strict on-tile away total (64) remains the known metric/gate
  definition discrepancy from r265 — reported, not failed.
- **OUTING watch passes at exactly 25.0%:** 8 attempts, 2 kept. All 8
  attempts sat on a single seed (45813); the other three seeds sought zero
  outings. The watch's denominator is seed-volatile, as in r265.
- **BOND ANSWERED:** 114 villager-initiated proposals is down from r265's
  180 (-37%, under the 60% telemetry swing bar) but the per-village-day rate
  (0.204) sits inside the historical band (r195 0.328, r200 0.177). No
  scholar-initiated person bonds (0) — villagers propose, the scholar does
  not.

## Telemetry

No canonical baseline exists for the current metric set
(`telemetry-baselines/social.json` is an October snapshot on stale `l3.*`
keys). Ad-hoc comparison: baseline built from the r265 panel JSONs in /tmp
(`/tmp/r266-social-baseline.json`), r266 checked against it with
`telemetry-check.js` on the real-signal metrics (`social.moots`,
`social.fullConvs`, `social.transcripts`, `bondProposed`,
`confrontEvents`, `outingArm`, `mootNotes`,
`funeralMendStats.funerals`). **LOUD ×1, explained, baseline NOT rolled**
(ad-hoc /tmp artifact, not committed):

- `outingArm` 21 → 8 (-62%): attempt volume fell, kept fell with it (2 vs
  8). Per-seed attempts: r266 8/0/0/0 — all on one seed — vs r265 2/0/4/15.
  The outing-seek trigger is seed-volatile and concentrates on one seed per
  panel; the conversion (25.0%) held at the watch floor. Same explanation as
  r265's own LOUD line (56 → 21). Not a regime change.
- Quiet on the rest: moots 6 → 7, fullConvs 574 → 581, transcripts 574 →
  581, bondProposed 180 → 114 (-37%, under the 60% swing bar),
  confrontEvents 19 → 22, funerals 11 → 16 (+45%, under the bar),
  mootNotes 7 → 7.

## Gate (`check.js --quick`)

**DONE by the adoption:** `node scripts/check.js --quick
--cacheDirectory=/tmp/jest-cache-r266-gate` on the worktree at `bda6ff495`
with the uncommitted r266 files in place: **339 passed, 5 failed in 784s
— 0 attributable.** The failures are exactly the standing families,
identical to r152/r153 (339/5): measurement-proof staleness pair (2),
phone-frame stale receipt (1), 120s deed-attainment timeouts (2). This run
touches no src/, data, or index.html — only scripts (driver + analyzer) +
evidence — so none of the failures can be caused by this branch. Log:
`evidence/2026-11-22/journey-social-life-r266-gate.log`. The gate was
re-run on the rebased tip at closeout; see the closeout addendum below.

## Adoption notes

- The timed-out run's panel and Arm B were complete; the adoption verified
  both rather than taking the worker's word (determinism re-run identical;
  all three fixed matchers + four controls re-run green).
- The worktree's `evidence/2026-11-22/` also holds succession r266 files
  (transcripts, telemetry JSONs, `journey-succession-r266.md`). Those are
  committed base content from the branch's history, not this run's — they
  were not touched and do not enter this note.
- Rotation-b: 5 → 6 on closeout.
- Next run's owed items: (1) resume-pick fall-through or blocked-line
  logging for the dry fallback; (2) F5-REASK interception at the sitting;
  (3) door-direction + thread-label line variety (M4); (4) retire or
  re-point legacy F5 at the widened pool; (5) TRAIL press-pool width.
