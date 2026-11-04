# sim-fleerepair-adopt-a — ADOPTION of orphaned 0115Z fleerepair arm (Loop A run fleshout-20261104T0415Z, axis scale-onramp)

## Adoption note

This run adopts the orphaned 0115Z arm sim-fleerepair-a (stranded tip
0018227b2). The 0215Z run's next-blank 1. No new game-code change was made
here: the branch was reset to the stranded tip, the preserved orphan corpus
was restored byte-identical, only the missing armed legs (99104–99108) were
run, the pilot was judged against the stranded prereg, and the branch was
rebased onto current master with the proof re-run green.

- Stranded branch: sim-fleerepair-a, tip 0018227b2 (prereg 59ebbf305,
  flee-repair policy code 98806a3db [needs-eyes], proof fix 74960416d,
  driver fix 0018227b2).
- Adopted branch: sim-fleerepair-adopt-a, tip after rebase badb0eed4
  (4 stranded commits replayed cleanly onto master 18beb0c6c).
- Corpus source: ONLY the preserved copy at
  ~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/orphan-fleerepair-20261104/
  (11 files: baseline 99101–99108 complete, armed 99101–99103 only).
  All 11 copied into evidence/2026-11-04/perseed-fleerepair-a/ and verified
  byte-identical by md5sum. The branch driver refuses to overwrite, so the
  restored files and the new legs cannot clash.
- Verification at reset: scripts/policies/competent.js is byte-identical
  (md5 fed50f0c…) between branch base dbfeb63eb and master 18beb0c6c, and
  the base→stranded-tip diff on competent.js is ONLY the gated
  COMPETENT_FLEE_REPAIR change (directional branch only, legacy untouched,
  defaults untouched). PLAYER flee only: no monster-flee change, no
  gate/price/deed change, no default flip.

## Canon

No canon doc covers TB flee — verified again in this run: grep for
flee/barrier in docs/CANON.md returns NOTHING, matching the prereg. What
covers it instead is in-code law in src/js/game.js (tbBarrierExit) and
Steve's 2026-11-02 ruling that monsters do NOT flee while players CAN.
Nothing is invented here; the arm is policy-side only.

## Design (from the stranded prereg, unchanged)

- Seeds 99101–99108 (the 1819/w4convert/tbleth/tbfinish band), horizon
  140 days, death-aware. Baseline = scripts/policies/competent.js verbatim
  (all gates default); armed = scripts/policies/competent-fleerepair-a.js
  (COMPETENT_DIRECTIONAL_FLEE=1, COMPETENT_EXIT_VERIFIED_FLEE=1,
  COMPETENT_FLEE_REPAIR=1, nothing else).
- Instrument scripts/fleerepair-instrument-20261104.js, driver
  scripts/fleerepair-driver-20261104.js (POLICY env), analyzer
  scripts/fleerepair-analyze-20261104.js, summarizer
  scripts/fleerepair-summarize-20261104.js, proof
  scripts/test-fleerepair-20261104.js.
- New legs run here (branch AS-IS, pre-rebase, single-base judging):
  DAYS=140 SEEDS=99104,99105,99106,99107,99108 POLICY=fleerepair
  RUN=fleerepair — log evidence/2026-11-04/fleerepair-adopt-a-armed-legs-99104-99108.log.
  All 5 legs completed, 0 instrument errors on every leg, all 16 per-seed
  files anchored at 0018227b2.

## Calibration gate: FAILS vs tbfinish, re-baselined per prereg

The prereg gate required the baseline leg to reproduce the tbfinish judged
leg (51 TB exposures, 2 TB kills, days 99101:134, 99102:115, 99103:75,
99104:66, 99105:140 SURVIVED, 99106:78, 99107:38, 99108:42). The orphan
baseline leg, on the SAME anchor as the armed legs, measures:

- 26 TB exposures (not 51), 5 killRows (4 linked, not 2), 0 instrument errors.
- Days: 99101:140 survived, 99102:127 lost, 99103:118 lost, 99104:139 lost,
  99105:84 lost, 99106:96 lost, 99107:71 lost, 99108:68 lost.
  Every seed diverges from the tbfinish table — the same base-drift the
  0215Z trickcensus run found (99107: 38d -> 71d there, 71d here).

Per the prereg, the gate FAILS and the judged baseline is whatever the
baseline leg measures, stated here — tbfinish numbers are NOT cited as the
baseline anywhere below. Judging stays single-base: all 16 legs share anchor
0018227b2, so the armed-vs-baseline comparison is valid even though the
cross-base calibration failed. This run did NOT rebase before judging, for
exactly this reason.

## Judged table (8-seed pilot, per-seed)

Baseline leg (competent verbatim):

| seed | days | end | TB exp | fieldW4 | W4 kills | escapes | flee-trig fights | turns |
|------|------|-----|--------|---------|----------|---------|------------------|-------|
| 99101 | 140 | survived | 1 | 0 | 1 | 0 | 0 | 5 |
| 99102 | 127 | lost | 3 | 5 | 1 | 0 | 3 | 15 |
| 99103 | 118 | lost | 6 | 7 | 1 | 0 | 4 | 19 |
| 99104 | 139 | lost | 6 | 3 | 0 | 0 | 3 | 19 |
| 99105 | 84 | lost | 9 | 3 | 2 | 0 | 5 | 82 |
| 99106 | 96 | lost | 1 | 2 | 0 | 0 | 1 | 3 |
| 99107 | 71 | lost | 0 | 0 | 0 | 0 | 0 | 0 |
| 99108 | 68 | lost | 0 | 0 | 0 | 0 | 0 | 0 |

Armed leg (fleerepair variant; 99101–99103 preserved, 99104–99108 run here):

| seed | days | end | TB exp | fieldW4 | W4 kills | escapes | flee-trig fights | turns |
|------|------|-----|--------|---------|----------|---------|------------------|-------|
| 99101 | 82 | lost | 10 | 10 | 1 | 0 | 1 | 39 |
| 99102 | 134 | lost | 5 | 5 | 0 | 0 | 1 | 33 |
| 99103 | 140 | survived | 13 | 22 | 5 | 2 | 0 | 59 |
| 99104 | 140 | survived | 4 | 0 | 1 | 0 | 0 | 24 |
| 99105 | 82 | lost | 3 | 0 | 0 | 0 | 0 | 9 |
| 99106 | 111 | lost | 8 | 2 | 3 | 0 | 0 | 48 |
| 99107 | 70 | lost | 0 | 0 | 0 | 0 | 0 | 0 |
| 99108 | 130 | lost | 4 | 2 | 0 | 0 | 0 | 14 |

Exposure outcomes: baseline 26 = 4 kills, 22 fighter-died, 0 fled. Armed
47 = 10 kills, 35 fighter-died, 2 fled. The exposure-count gap (26 vs 47)
is chaotic trajectory divergence — the same seeds under a different flee
policy walk different village histories — not a measurement error. The
prereg judges totals, and the per-seed table above shows the divergence
plainly rather than hiding it.

## GO judgement (strict, prereg threshold)

GO iff ALL THREE hold. Verdict: **GO (pilot)** — all three pass, but see
the thinness caveat under leg 1 and the confirm requirement at the end.

1. **Escapes >= 2 across armed TB exposures: PASS, exactly at threshold.**
   Armed escapes = 2, baseline = 0. Both escapes are on seed 99103
   (day 85 vs a wave-4 eulogy, day 129 vs wave-4 reunions), both round-1
   endings with 0 bracketed turns and 0 hits — see sense-test for why
   they still count and why their thinness matters.
2. **Median strikes/fight armed >= baseline: PASS.** Armed median 4,
   baseline median 2 (all TB exposures). Median strikes in lost fights
   also passes: armed 4 vs baseline 2. Median damage fraction in lost
   fights: armed 0.178 vs baseline 0.108; all fights 0.196 vs 0.118.
3. **Cost bar clean: PASS, both halves.**
   (a) Starvation deaths, totals: armed 2 <= baseline 5 + 2 = 7. On the
   arm-only reading (deaths attributable to this arm's fights): all
   starvation deaths in both legs are non-player villagers (baseline:
   99103 x2, 99106, 99107, 99108; armed: 99107, 99108) — no starvation
   death is a TB fighter's death in either leg, so the fight-attributable
   count is 0 in both legs, 0 <= 0 + 2. Both readings pass (the
   prereg's "arm-only" phrasing is ambiguous; see metric review).
   (b) Median survival: armed 120.5 days >= 0.8 x baseline median 107 =
   85.6 days. Baseline days sorted: 68, 71, 84, 96, 118, 127, 139, 140.
   Armed days sorted: 70, 82, 82, 111, 130, 134, 140, 140.

Supporting mechanism evidence (not judged, but it is the repair working):

- Barrier pushes (tbBarrierExit wraps, whole run): baseline 0 on ALL 8
  seeds — the tbfinish loop's 0-push band, reproduced. Armed 6 total
  (99102:1, 99103:2, 99105:1, 99108:2). The directional path actually
  pushes barriers now; the summarizer's exposure-level push count is 0
  because pushes in non-W4 TB fights are outside the W4 census and the
  two W4 escapes ended in unbracketed round 1 (below).
- Flee-attempt turns: baseline 34 across 16 flee-triggered fights; armed
  2 across 2 flee-triggered fights. Zero-tile-move turns in W4 exposures:
  baseline 32, armed 0. The loop class is gone from W4 exposures.
- The 2 armed flee-triggered fights both end in the fighter fighting on
  and dying, not looping: 99101 exp#1 (1 flee attempt, then 4 strikes),
  99102 exp#2 (1 flee attempt in a 15-turn fight dominated by
  tricks/abilities, then a strike). That is the repaired shape — a failed
  flee falls through to combat — not the old walk-to-edge loop.

## Sense-test (SENSE-TESTING LAW): PASS, with a disclosed instrument gap

Before (baseline): flee fights read as a robot walking into a wall. The
clearest case is 99105 exp#2: 25 turns, 11 flee attempts, move-only turns
stacked round after round (rounds 11–14, 19–26 nearly all moves), ending
in the fighter's death with the monster barely dented. 99104 exp#4 is a
single flee-attempt turn and death. No barrier push ever happens; the
fighter spends its turns failing to leave and then dies. That is the blank
this arm was built to fill.

After (armed): the two escapes read as people escaping, not as a silent
no-op loop.

- 99103 day 85 (eulogy, solo, 50/100 HP, monster untouched 900/900):
  "Travel 1 tile to creek." then "BARRIER CROSSED — you crash through
  to a new area. It can't follow. (You left the fight — it melts back
  into the wilds.)" then "You escape. The thicket keeps its secrets.",
  the gamblers' line, and a Codex sighting. A hurt person crashing out
  through the barrier while the beast is still at full strength — that
  is an escape, with the cost visible (no damage dealt, no kill).
- 99103 day 129 (reunions, party of 2, 100/100 HP): "Travel 1 tile to
  Haven." then "While you were gone — 2 things you missed:" (both
  allies mauled while the player was away), "You walk back into Haven.",
  "BARRIER CROSSED — you crash through into Haven. The gate shuts
  behind you. The wild goes quiet. (Haven is safe — nothing follows you
  here.)", "It didn't leave — you did. The treeline holds its shape;
  the siege goes on.", "You escape.", and a Reunion counter learned.
  The escape has consequences in the transcript itself — allies hurt,
  siege ongoing — not a free reset.

Sense verdict: PASS. Neither escape is a silent no-op loop.

Disclosed gap: both escapes have 0 bracketed turns. The round-1 pending
buffer attaches round-1 player actions only when the exposure is created
after startCombat returns; a fight that ends fled in the opening pass
leaves turns empty, so there is no bracketed flee→walk→push→exit turn
sequence to audit — the escape lives only in the transcript say-lines.
The prereg's literal escape definition (exposure end result 'fled')
counts them, and the transcripts corroborate them, but the mechanism
attribution (directional push vs another round-1 exit path) is
transcript-level, not turn-level. Likewise the instrument records no
policy-ctx counters, so consumed-push and stuck-resolution firings of
the repair itself are inferred from the aggregate shape (0 zero-tile
moves, 6 pushes, 2 flee turns), not counted individually. The confirm
run should either fix the round-1 capture gap or pre-register a
bracketed-escape requirement.

## Wall numbers (reported, NOT judged)

| metric | baseline | armed |
|--------|----------|-------|
| wins | 0 | 0 |
| national reached | NOT MEASURED (see below) | NOT MEASURED |
| table reached | NOT MEASURED (see below) | NOT MEASURED |
| wave-4 faced (TB + field) | 46 (26 + 20) | 88 (47 + 41) |
| wave-4 kills (killRows; linked) | 5 (4) | 10 (10) |
| wave-5 faced (maxWave >= 5) | 0 | 0 |
| median survival (days) | 107 | 120.5 |

National/table honesty note: the per-seed JSON carries no standing/scale
field (grep for national/regional/standing/table across a per-seed file:
0 hits), and the summarizer's wall.national/wall.table are hard-coded 0
by construction, not by measurement. Reporting them as measured 0 would
be fabrication. What IS measured: wins 0/0, maxWave never >= 5 on any of
the 16 legs (baseline 99107/99108 peak at wave 3; armed 99107 at wave 3;
all others peak at wave 4), villages lost on 7/8 legs in both arms
(armed survivors: 99103, 99104 at 140d; baseline survivor: 99101 at 140d).
The scale wall is unchanged by this arm — as expected for a pilot this
small, and it is not a judged metric here.

## Village assessment (plain words)

The village still mostly dies, and nothing in this arm changes that arc:
combat deaths dominate both legs' death tele (baseline "villager combat"
229 of 477 deaths; armed 230 of 520), starvation is a small share (5 vs
2), and no village reaches wave 5, let alone national, the table, or a
win. What changed is narrow but real: fighters no longer spend their
fights walking into a blocked edge and dying without ever pushing the
barrier. They push barriers (6 pushes where there were 0), they sometimes
get out alive (2 escapes where there were 0), and when they cannot get
out they fight instead of looping (median 4 strikes per fight vs 2).
The blank filled is the flee loop itself; the blank documented is
everything downstream of it — killing a wave-4 beast in the wild is still
rare (10 kills across 47 armed exposures), and the road past wave 4 is
still closed on every seed. Knowledge/capability gaps that remain: the
Reunion counter was learned on an escape, which is the game rewarding
survival with knowledge — that channel works — but no new capability
arrives from fleeing itself, and fleeing is still a round-1-or-nothing
event in the data (no mid-fight escape was ever bracketed).

## Drift check (master vs branch base dbfeb63eb, src/js/game.js)

Drift is +103 lines in 2 hunks, and NEITHER touches flee/TB paths: grep
for tbBarrierExit/tbfight/tbPlayerMove/tbEnd/flee/Barrier over the diff
returns nothing. Hunk 1 (+98 lines, ~line 30424) is the sim-firenarr-deploy-b
evening narration method; hunk 2 (+11 lines, ~line 32622) is a
teaching/journal note. Verdict: the drift does not touch the flee/TB
paths, so the rebase below does not re-open the judged mechanism — but
the judged numbers themselves remain single-base (anchor 0018227b2) and
must not be re-cited as master-base numbers.

## Rebase + proof (after judging, per brief)

- Rebase of sim-fleerepair-adopt-a onto master 18beb0c6c: CLEAN, all 4
  stranded commits replayed, no conflicts. New tip badb0eed4
  (driver fix; policy commit 5ec8f6f3a [needs-eyes], proof fix 0765383f9,
  prereg a593dec03, on top of 18beb0c6c).
- Proof re-run on the rebased branch: `node
  scripts/test-fleerepair-20261104.js` — ALL PASS (exit 0): gate-off
  legacy control, directional repair-off gate pinned, repair fallthrough
  (failed step -> strike), repair consumed-push (blocked, then next call
  strikes), round-1 pending turn attached, variant gates exact with
  DPS_RACE off, 2-day live-harness smoke. No proof extension was needed;
  the existing proof covers the policy change and no gap was found in it.
- No rebase conflict, no proof failure — nothing forced.

## Metric review (for the NEXT run, not a re-score of this one)

- The prereg's cost-bar phrase "on totals AND on arm-only deaths" is
  ambiguous: the deaths tele records carry no fight attribution, so
  "arm-only" had to be interpreted (here: fight-attributable starvation
  = 0 in both legs). The next prereg should define arm-only precisely
  (e.g. player deaths inside TB exposures, or starvation deaths within
  N days of an armed-leg fight).
- Per-seed matching breaks under policy divergence (26 vs 47 exposures):
  totals judging is the honest route, but the next arm should expect
  divergence and pre-register whether it judges totals, per-seed deltas,
  or both.
- National/table are not instrumented in this driver at all. Any future
  wall-number claim from this instrument needs a scale field added to
  the per-seed JSON first; until then, national/table must be reported
  as unmeasured, not 0.
- The escape threshold was met exactly (2) in a single seed, both
  unbracketed round-1 events. The confirm run should pre-register how a
  round-1 escape is evidenced (transcript lines vs bracketed turns) and
  fix the pending-buffer gap for fights ending in the opening pass.
- Median strikes/fight mixes kills and deaths; it passed on both the
  all-fight and lost-fight medians here (4 vs 2 on both), so the verdict
  is robust to that choice this time — but lost-fight strikes is the
  cleaner primary for a flee arm, since kills inflate the all-fight
  median.

## Verdict

**Pilot GO** — escapes 2 (>= 2), median strikes/fight 4 >= 2, cost bar
clean (starvation 2 <= 7 totals and 0 fight-attributable; median survival
120.5 >= 85.6), sense-test PASS (both escapes read as people escaping).
Branch tip badb0eed4 is rebased on master 18beb0c6c with proof green and
is mechanically ready for the coordinator's --ff-only merge.

**Prereg confirm requirement, stated loudly:** the stranded prereg
requires a 12–16-seed confirm before ANY landing claim. This GO is a
pilot GO only. Whether the coordinator merges the pilot evidence+corpus
now or holds the branch for the confirm run is the coordinator's call;
nothing here claims the arm is confirmed or landed.

## Files

- Evidence (this file): evidence/2026-11-04/sim-fleerepair-adopt-a.md
- Corpus (16 files): evidence/2026-11-04/perseed-fleerepair-a/
  (8 baseline preserved + 3 armed preserved, md5-verified; 5 armed legs
  99104–99108 run in this adoption)
- Armed-legs log: evidence/2026-11-04/fleerepair-adopt-a-armed-legs-99104-99108.log
- Summaries: evidence/2026-11-04/fleerepair-adopt-a-summary-baseline.json,
  evidence/2026-11-04/fleerepair-adopt-a-summary-armed.json
- Prereg (stranded, unchanged): evidence/2026-11-04/sim-fleerepair-a-prereg.md
