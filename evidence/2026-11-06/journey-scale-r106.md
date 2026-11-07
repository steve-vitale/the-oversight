# journey-scale r106 — run note (lane A, leg 3 SCALE)

**Run id:** laneA-scale-2026-11-07T0245Z (scheduled 20:45 CST 2026-11-06).
No prior lock existed, so no stale-lock recovery. Main tree clean,
disk 29%. Base master@5a4e3e4b5 at first scored seed. Rotation read 3
-> scale; 3->0 written at closeout on success only (see closeout).
Prereg: evidence/2026-11-06/journey-scale-r106-prereg.md (committed
2391bed32 BEFORE any scored seed ran; proof test 40/40). Heartbeats:
registration ~02:44Z, 600s loop throughout (verified alive at each
commit).
**Service note:** the first worktree-register attempt took ~2 min
(slow checkout, same class as r104/r105 stalls) — no work lost.
Safe-commit index clobber struck on the prereg commit (repaired via
HEAD-blob cacheinfo, verified clean).

## Q1 — FILL ARM CONFIRM, FRESH BAND (binding)

**Verdict: INSUFFICIENT-DATA (pre-registered).** Control dry = 0, so
the phenomenon did not occur on this band and the arm's 0 dry carries
no elimination evidence. The arm did not fail — it simply had
nothing to eliminate.

| seed | control dry | arm dry | control end | arm end | \|delta\| | arm fills |
|------|-----------|---------|------------|---------|----------|-----------|
| 95911 | 0 | 0 | d66 regional | d66 regional | 0 | 0 (skipFull 1) |
| 95912 | 0 | 0 | d69 regional | d69 regional | 0 | 0 (skipFull 28) |
| 95913 | 0 | 0 | d62 regional | d62 regional | 0 | 0 (skipStudy 17) |
| 95914 | 0 | 0 | d126 regional | d116 **global** | **10** | 2 top-ups, 4L |

- Walk-outs: control 6 total (dry 0, partial 1, wet 5), arm 7
  (dry 0, partial 0, wet 7). The control's one partial was on 95914.
- The arm fired ONLY on 95914 (2 top-ups, 4L). On 95911/95912 the
  fill gate declined because the pack was already full (skipFull 1
  and 28); on 95913 it declined 17 study days (the retry-churn seed
  again — see Q2). Three of four seeds are day-identical between
  quads (same end day, same death counts, same everything).
- **Footprint (two-sided, adopted from the r105 proposal):**
  |delta| = 0, 0, 0, 10 — CLEAN by the letter (≤ 10) but exactly
  on the edge, and the sign is negative on the one seed that
  moved: the arm ended 10 days sooner. The ending differs too:
  the arm scattered with 7 alive; the control died with 0 alive.
  The two-sided bound worked as designed — it flags the divergence
  for discussion without failing the run (see metric review).

## Q1b — THE 95914 DIVERGENCE (report-only, the run's real story)

Both quads staged national/global on 95914 — 1/4 each. **r105's
arm-only national does NOT reproduce as arm-attributed:** the
control stages national/global on this band too, with no fill arm
at all.

- **Control:** regional d47, national d80, global d81 (covenant
  shape, firstQual d79, STAGED 45 nat-gate rows), dissolved d112
  ("The realm came apart"), re-staged d113/d114, died d126 in the
  wild with 0 alive. courtNational answers 2. The shared granary
  kept 29,550 kcal for Haven across the first dissolve and 34,800
  across the second — real food, already poured, surviving the
  realm's fall.
- **Arm:** national d78, global d79 (two days earlier), held
  global to the end with NO dissolve, scattered d116 on the fifth
  hungry day with 7 alive. courtNational answers 1.
- **Confound, stated plainly:** the arm's fills (2 top-ups, 4L)
  re-roll the stream after they fire; every 95914 difference after
  the first fill — earlier staging, no dissolve, fewer dry nights,
  the scatter ending — is observed, not proven causal. One seed
  cannot carry a default-fill decision — the same conclusion as
  r105, now from the other side.
- **Realm dissolve / re-stage is a NEW shape in the scale line:**
  a league can fall apart and come back. What dissolved it on d112
  is not yet named — the nat-gate rows show cov 3/3 seasoned
  straight through d125, so the dissolve is NOT a seasoning
  failure; it needs a r107 look at the gov/trust lines around d112
  (member death? tribute arrears? a defense call refused aloud?).

## Q2 — CENSUS CONTINUITY (report-only)

| seed | control end | arm end | rank C / A | seat | arc | seasoned peers (final) | deaths |
|---|---|---|---|---|---|---|---|
| 95911 | d66 pop 0/0 | d66 pop 0/0 | regional / regional | lesser | 4 | lead 1/1 | 75 / 75 |
| 95912 | d69 pop 0/0 | d69 pop 0/0 | regional / regional | none | 3 | lead 1/1, cov 0/3 | 91 / 91 |
| 95913 | d62 pop 2/2 | d62 pop 2/2 | regional / regional | lesser | 4 | lead 0/1 | 49 / 49 |
| 95914 | d126 pop 0/0 | d116 pop 7/7 | regional / **global** | none | 3 | C: lead 1/1 + cov 3/3; A: cov 3/3 + trade 1/2 | 74 / 76 |

National staged 1/4 both quads (95914), global 1/4 both. BELONG
still untested (belong=- on all rows in both quads). No full seat,
no wave-5 content faced, no kill claimed on any seed.
Deaths fight-heavy on every seed (95914 control: 30 villager-combat
+ 14 combat + 12 expedition + 9 the wild + 5 monster + 1 thirst;
arm: 35 villager-combat + 16 expedition + 8 combat + 8 the wild +
3 monster + 1 starvation). 95913 is the retry-churn seed again (18
pilgrimages, 17 studies, identical both quads — scattered d62 on
the third hungry day, 2 alive). 95911 died d66, ten days short of
the rung (networkLiveDay 46 + 30 = d76); its lead-seasoned count
flickers 1/1↔0/1 as trust dips under 40 — the seasoned bar is
trust-fragile day to day. 95912 died d69 regional, no seat.
tendPeer: control 95914 fired 4×, arm 2×; 0 elsewhere. The 95914
covenants seasoned 3/3 in both quads — tending fired and trust
rose, but the seasoning is not separated from time's work. The
r105 reading carries: tending is one path, not the only path.

## Q3 — PEOPLE CHECK (sense law)

Corpus: **3 sittings read in full** (control 95914 day 90 + day 120;
arm 95914 day 90 — the only seed alive at day 90/120 in either
quad). V-INIT-BOND proposals observed: **0 in 3 sittings**
(report-only, same caveat as r105: proposals happen at visits,
the daily pair tick, and talk requests — a sitting is not the only
venue).

- **Day 120 Sari (control 95914, postal worker, steady, trust 91,
  seek_comfort stage 0→2): REAL.** "They'd tell me to keep working.
  So I'm working. That's the whole plan." — grief, steady, in
  character. The gossip thread then names the actual dead, one by
  one, and how they went: "Yara headed out for water." "Hassan
  headed out for water." "Farid headed out for water." "James ate
  something last month that should've killed them. They're fine."
  Mourning that names the dead and the manner — the sense law's
  good case. The middle is staccato (each "tell me more" yields
  one name + one clause, a list rather than a story), but it is
  grounded in the village's state, no fabricated history.
- **Day 90 Sigrun (control AND arm 95914, night security guard,
  withdrawn, trust 90, ask_favor stage 2): thin but coherent, and
  the same sitting twice.** The opening — "Show me what's hurt.
  Doesn't matter if it's a leg or a water pump. I'll look." — is
  the ask in voice, but the ask itself is never put as a request.
  Turn-0 choices in BOTH sittings were ONLY betrayal:accept,
  betrayal:decline, leave, silence — no engage option, so the
  picker took the accept (ordinary, not armed, both quads; see
  betray file). The gift lands (a tool in the control, a thinking
  spot in the arm), then healer aphorisms in a different order
  ("I can't save everyone. I can save the person in front of me."
  / "Bodies mend. It's the other stuff — trust, hope — that takes
  the real work."). The want stayed stage 2 in both sittings.
  **Filed blank (see metric review): the turn-0 betrayal trap** —
  a pending betrayal invite crowds the NPC's own want out of the
  opening, and the engage-first picker accepts it. Sigrun's
  ask_favor (planted d83) was never heard in either sitting.
- No verbatim repeats in any transcript.

## Q4 — WATER CONTROL (report-only)

Walk-outs: control 6 (dry 0, partial 1, wet 5), arm 7 (dry 0,
partial 0, wet 7) — these counts ARE Q1's instrument.
**Q4b dry nights** (nights slept out with packW 0 at the morning
entry; r105's open blank): control 95914 — 10 packW-0-out / 7
hyd-0-in of 18 nights; arm 95914 — 3 / 1 of 15 nights; all other
seeds 0 in both quads. Retry nights are the dry ones on control
95914 (packWOut avg 0.5L on retries vs 2.5L first; drain avg
28.5). Confounded by the stream re-roll — observed, not causal.
The separator holds: the exact-14 residual REPRODUCES a fifth
time — 57 nights at drain exactly 14 across the two quads (1
drink, hyd 100→86 class, same signature as r102/r103/r104/r105).

## Village assessment, in plain words

Four villages, and three of them are the same village twice over —
the same deaths, the same days, the same endings, with or without
the water bottle. The fourth is the whole run, twice. In one
version it climbs to a league of equals on day 81, watches the
league fall apart on day 112, puts it back together on day 114,
and dies in the wild on day 126 with no one left — a nation that
lived twice and ended in the grass. In the other version it climbs
two days sooner, holds the league without a crack, and scatters
hungry on day 116 with seven people still alive — a global fire
that walked away from itself because the pantry was empty. The
other three villages never get the chance either way: one dies ten
days short of becoming a nation, one dies at day 69 with its
league friends too young to count, one walks the same road to the
same village eighteen times and scatters on the third hungry day.
The water helps — it really does — but on this band it helped by
re-rolling one village's fate, not by fixing a dry departure that
never happened.

## Reachable / Fun / Winnable (leg verdict)

- **REACHABLE — PARTLY, unchanged.** National/global staged 1/4 on
  BOTH quads this time — the ladder opens when a village survives
  past day ~78, with or without the fill arm. Survival is still the
  binding constraint, not trust: three of four seeds die before
  day 70.
- **FUN — YES, with the same honest caveat.** Sari's mourning list
  is genuinely good, and a league falling apart and coming back is
  a real moment. The dull spot is the death band: three of four
  seeds die before day 70 in both quads, so most of the leg's
  window is never played.
- **WINNABLE — NOT YET.** No full seat, no wave-5 content faced,
  no kill claimed on any seed. A global village scattered hungry
  at day 116 — the table is still unreached, and now hunger, not
  combat, ended the furthest run.

## Telemetry deviation check

`node scripts/telemetry-check.js` against
hidden_files/telemetry-baselines/scale.json, metrics
nationalLive,scaleRank: **quiet on both quads (4 files, 2 metrics
each, no large deviations).** Same caveat as r93–r105: that baseline
is an old aggregate shape, so "quiet" means "no large deviation on
these two metrics", not a clean bill — the control's nationalLive=true
(1/4) and the arm's (1/4) did not trip it. Baseline NOT rolled forward.

## Metric review

- **No pre-registered metric was re-scored mid-run.** Q1 is judged
  exactly as pre-registered (INSUFFICIENT-DATA: control dry 0).
- **Footprint bound review:** the two-sided bound adopted from
  r105 worked — |delta| 10 sits exactly on the edge and the run
  discusses it rather than failing. Proposed: keep the two-sided
  bound; a |delta| exactly at the edge on a single seed is
  discussion material, not a verdict input. No change proposed.
- **Phenomenon-rate review (proposed for r107):** dry walk-outs
  are seed-rare — r104 3 dry on 1 seed, r105 2 dry on 1 seed,
  r106 0 dry on 4 seeds. A 4-seed confirm cannot judge an arm for
  a ~1-in-4-seed phenomenon. PROPOSED: either a bigger panel (8+
  seeds) for the fill question, or pivot the scale leg to the
  dissolve/re-stage question this run surfaced (what dissolves a
  realm on d112? the instrument trail is clean: gov/trust lines
  around d112 on control 95914). The fill arm stays UNJUDGED, not
  killed — INSUFFICIENT-DATA is not a NO-GO.
- **Analyzer PREFIX fix verified:** the arm analysis read the arm
  dir with the same prefix (walk-outs 7, fills 2/4L on 95914) —
  the r105 defect is closed.
- **Turn-0 betrayal trap (filed blank, not fixed this run):** when
  a betrayal invite is pending, turn-0 choices are ONLY
  betrayal:accept / decline / leave / silence — the NPC's own
  want is unreachable in that sitting, and the engage-first picker
  takes the accept (ordinary, not armed, both quads). Sigrun's
  ask_favor stage 2 (planted d83) was never heard in either
  sitting. This is engine behavior (the conversation opens on the
  invite), not a picker bug — a design question for the main
  session. Changing picker priority would break panel
  comparability, so no change here.
- **Safe-commit index clobber struck on the prereg commit**
  (repaired via HEAD-blob cacheinfo, verified clean). Same class
  as r105's six.
- **Heartbeat loop held** (600s, verified alive at each commit).

## Harness

Policy: scalecourt-nogate-morntrace3 (control) vs
scalecourt-nogate-morntrace3-fillnarrow (arm) — diff-verified in
r105 and re-checked by this run's proof test: the only behavior
delta is topUpBeforeWalk. Both quads TEND_PEER=1.
Driver: scripts/journey-scale-r106-20261106.js (r105 driver,
labels/seeds/EVIDIR only + analyzer PREFIX comment fix).
Analyzer: scripts/analyze-journey-scale-r106-20261106.js.
Proof: scripts/test-journey-scale-r106-natgate-20261106.js (40/40;
not on the green list, same precedent as the r102–r105 proof
tests — do not add it). Per-seed evidence:
evidence/2026-11-06/journey-scale-r106/ (control) +
journey-scale-r106-arm/ (arm) + analysis txt.
Smoke seed 95910 × DAYCAP=45 proved the driver (pilgrimages=9, 45
natGate rows; smoke outputs deleted per the r103 precedent).
Pilot seed 95911 control passed (no crash, d66). Determinism: no
mid-run driver fix, so no re-run needed. Duplicate-day note: the
daily hook fires twice on day 2 across ALL watches (pre-existing
r99 lineage behavior), so nat-gate counts carry +1 row on day 2.
Disclosed; immaterial (1 row per seed).

## Closeout (filled after the check gate)
- check.js --quick: 278 passed, 12 failed in 1694s (log
  evidence/2026-11-06/journey-scale-r106-checkquick.log). All 12
  adjudicated, none new — 6 standing pre-existing families
  (measurement proof-update + workflow freshness "retained
  neutrality proof covers the current inputs" ×2 scripts;
  mobile-combat-cadence "Continue does not wrap the announced
  round a second time"; occupation-panels "real CLI workflow
  completed"; phone-frame-proof stale receipt ×3 assertions;
  establishment-r20-fixes "next day voices once more: expected 2
  got 1") + measurement-cache-flags 4 assertions (failed r104,
  passed r105, fails r106 — flaky/load: 91.1s runtime while 3
  check.js --quick runs shared the box) + 5 load timeouts at
  120.1–120.2s (solo-campaign-endings, trust-observer-neutrality,
  synergy-stall, capable-bot, table-endings — capable-bot's
  assertion is the documented base-flaky food-deed one from
  r105/r107/r108). No failure touches conversation / convo-wants /
  betrayal / hierarchy / scale code or the r106 tooling (no r106
  string anywhere in the log; the r106 proof test is not on the
  green list and was not run by check.js). This run changed NO
  src/js (only new scripts/ + evidence/), so none of the 12 can
  be caused by it.
- Master moved during the run (Lane B sim-arena-b landed
  7ad7e376c, zero src/js); rebased journey-scale onto 7ad7e376c
  (explicit SHA, per the stale-ref lesson), proof test re-run
  green 40/40 on the rebased tip, merged ff-only.
- Merged locally, pending ship (no bump/push/live-verify — ship
  loop owns those).
- Rotation 3 -> 0 written at closeout, verified by read-back.
- Heartbeat loop killed after release; final heartbeat before
  release verified fresh.
