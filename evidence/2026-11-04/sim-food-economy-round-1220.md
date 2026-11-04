# sim-food-economy-round-1220 — coordinator evidence (Loop A run fleshout-20261104T1220Z, axis food-economy)

Sibling Loop B live on scale-onramp throughout (1212Z claim: approachconf;
Loop B landed mid-run: 6a48b6d3e approachconf GO-THIN coordinator evidence;
a new Loop B run, 1245Z, started during this run's landing) — NOT touched.
Loop B's landing moved master 51d3f7773 -> 6a48b6d3e under both worker
branches; both branches were rebased onto current master before merging
(hurthome rebase hit the documented stop-at-pick quirk — done+todo
duplicate, worktree clean, pick unapplied, verified by grep — recovered
with `git rebase --continue` per AGENTS.md, 3 commits replayed exactly
once; armorfetch rebase clean). No file overlap with the Loop B landing
(approachconf evidence/scripts only), so both rebases were conflict-free.
Claim written before any sims; deleted at closeout. Lock deleted at
closeout. No gate/price/deed change in either arm.

## Arm 1 sim-hurthome-fix-c (GO — the hurt turn-home fix LANDS)

Named next arm from fix-b (NO-GO on guardrails). Worker tree
sim-hurthome-fix-c. Fix re-applied exactly: cherry-pick of 5cf217912
(new hash 2e789403c after rebase; [needs-eyes] — a behavior change to
when hurt villagers come home). Prereg 0e37977ad (committed before any
judged sim) + retro-case instrument; evidence + corpora 27a1354aa.
Band note: the brief's proposed 97701–97716 was NOT fresh (exact seed
file cw-base-s97701.json exists); 981–986 bands also have exact-seed
files. Adopted 98701–98716, the first band with zero exact-seed files
under evidence/, stated in the prereg. Cells: competent, 100d
death-aware cap, PLENTYDEPRI=1, DEPOSITGATE=1, 16 seeds per cell.
Pilot gates passed both cells (baseline 13, armed 23 trip cases).
Judged census: baseline trip cases 35, armed 53; returned-hurt trip
cases baseline 16, armed 48.
GUARDRAILS BOTH HOLD, reversing fix-b's breach: median daysAlive
armed 92 vs baseline 74 (+18, tolerance −10); survived seeds armed 8
vs baseline 4 (+4, tolerance −2). Decomposition (pre-registered):
D1 flips outlives 8 / underlives 3 / ties 5 — not predominantly
one-way; D2 returned-villager deaths armed 33/220 (0.150) vs baseline
hurt-episode-villager deaths 30/211 (0.142) — no meaningful excess.
Verdict per the binding rule: GO, cascade noise, no systematic
survival cost. Descriptive primary: pooled median return latency
armed 1 part vs baseline 1 part (means 0.52 vs 1.50); died-while-away
share armed 0.019 (1/53) vs baseline 0.400 (14/35). Walk-out
exclusion holds (armed walk-out returned-hurt cases 0; no armed
hurt-return line names a walk-out villager). Narration audit passes
(49 armed hurt-return lines; Violet s98701 hp 5 and Norman s98704
hp 4 quoted and judged TRUE). Instrument clean (0 errors,
0 unclassified, 32 seeds). Coverage fix works: lines 49 vs
returned-hurt cases 48 (gap 1/49, down from fix-b's 2/24); the retro
case fired once in-corpus (s98716 Chen, latency-0 exact close); the
one gap line (Gabriela s98712) is a same-part return/patch/re-departure
race, documented, line true, median unaffected.
Proofs green on merged master: test-hurthome-fix-a 10/10,
test-hurthome-b 20/20, test-hurthome-c 6/6.
Wall (this corpus, not a scale panel): national/table/wins 0/16 both
cells, maxWave 4 both. The scale wall is untouched, as expected.
What lands: the game.js hurt check + hurt line and its proof test —
the first hurthome fix to ship after fix-a INSUFFICIENT-DATA and
fix-b NO-GO. The expedHurt write-back remains unbuilt (backlog
EXPHURT DISCONNECT stays open).

## Arm 2 sim-armorfetch-watch-c (watch CLOSED, both metrics, no game change)

Worker tree sim-armorfetch-watch-c. Prereg 93e869fff (committed before
the judged panel run); evidence + fresh panel ad967ede4 (after rebase).
Panel: competent, seeds 16101–16116, 60d, same spec as armorfetch-b.
Earned player tier-3+ weapon/armor access: fresh 16/16 (1.0), Wilson
95% CI 0.7135–1.0, vs watch value 0.3125 — watch closed, no further
regression. Player tier-3+ contest/show weapon/armor: fresh 16/16
(1.0), same CI, vs watch value 0.125 — watch closed. Neither metric
meets "regression confirmed" (interval entirely below the watch
value) — not close; the fresh lower bound sits far above both watch
values. Believed because the fresh panel was checked against
armorfetch-b's own after-panel on the instrument (observer digest,
metric contract digest, simulation flags identical) and re-extracting
the old panel reproduces armorfetch-b exactly (5/16 access, 2/16
contest/show): the change is in the game since 2026-10-30, not the
ruler. Fresh grants are concrete (every seed ≥1 contest-source
tier-3+ grant; craft/trade 0/16, corpse 9/16). Mechanism (likely
loot/contest-prize landings) is documented as inference, not traced.
No paired compare against the old panel was interpreted, per the
prereg. Spawn drift: re-probed before the prereg — 16103 is now
bloodplate torso P40 (was swat_vest P35), 16109 holds no stashed armor
(was farstrider_boots P12), exactly as briefed; no further drift.
The other 14 seeds each hold exactly one stashed armor piece beating
the empty slot. Panel measures earned gear, so the same-seed/policy/
days population is comparable, with spawn drift as a small
starting-gear trajectory change. The acceptance test was not re-run
and is not claimed. Proof on merged master: test-armorfetch-b 38/38
(Parts A+B; Part C skips, no corpus built by this arm, as designed).
Wall (panel band, descriptive): wins 0/16, national 0/16, table
win/entry/sitting 0/16, vests 1/16 (16109), wave reach 4 on 8/16 / 3
on 8/16 / 5 on 0/16, max Arc 3 on 16/16, community loss 3/16,
survived 13/16, median gameDays 60.5. Gear access saturated while
the scale wall stands still.
Backlog: ARMORFETCH PANEL TIER-3+ WATCH marked fixed (this run);
SPAWN-GENERATION DRIFT item updated (16103 bloodplate P40).

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline hidden_files/telemetry-baselines/scale-wall.json --current 'evidence/2026-11-04/perseed-hurthome-fix-c/*.json' --metrics national,table,wins,exiled` (n=34 files): LOUD national 12 -> 0, table 16 -> 0, wins 16 -> 0. EXPLAINED (same class as the 1120Z run): a 100d hurt-episode diagnostic corpus, not a scale panel — national/table/wins are 0/16 in both cells by the corpus window, and neither arm changes any gate or price. Baseline NOT rolled.

## Merged-master check profile

check.js --quick on the landing tip: 283 passed, 7 failed in 723s
(tail only; visible failure a racks-full voice gate case). Full-output
rerun on current master (including Loop B 1245Z): 280 passed, 10
failed in 1155s — measurement-proof-update, measurement-workflow,
measurement-cache-flags, mobile-combat-cadence, occupation-panels,
phone-frame-proof, establishment-r20 voice (all previously named /
pre-existing staleness family), plus three 120s-cap timeouts (exit
null: trust-observer-neutrality, capable-bot, table-endings — the
same three slowest tests from the first run, consistent with load,
not assertion failures). NONE of the failures touch either arm's
files; all four arm proof suites are green on merged master. The
profile is documented, not claimed green.

## Merged locally, pending ship

hurthome-fix-c 2e789403c + 0e37977ad + 27a1354aa; armorfetch-watch-c
93e869fff + ad967ede4; coordinator evidence (this file). No push, no
version bump, no live verification — the batch ship job owns those.
Main tree verified clean after landing and closeout.

## Metric review

- The fix-c decision rule worked as designed: keeping fix-b's hard
  guardrail thresholds while pre-registering the decomposition that
  separates a systematic cost from cascade noise let this run judge
  what fix-b could not, without loosening anything after seeing a
  miss. Keep this pattern for future guardrail re-judgments.
- Latency medians saturate (1 vs 1 parts here, 0 vs 2 in fix-b) while
  means and died-away shares keep separating — for future arms,
  report the latency mean and died-away share alongside the median,
  never the median alone.
- The tier-3+ watch closing at 16/16 from 0.3125 shows the watch
  mechanism working: a regression_watch with an interval including 0
  correctly waited for a re-check instead of tuning against noise.
