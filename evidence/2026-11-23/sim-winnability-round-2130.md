# Loop B winnability-chain round — 2130Z adoption (2026-11-23)

Run fleshout-loop-b-20261123T2130Z, Loop B, axis winnability-chain. ADOPTION of the
timed-out 1830Z round — all three workers done/cancelled, coordinator dead
(machine restart ~19:27Z killed the run; a second restart ~22:58Z hit this
adoption run itself). No new sims were started by the coordinator; all three
arms were verified from git/files and the raw corpora, rebased onto current
master, proofs re-run green, merged ff-only.

STALE-LOCK RECOVERY at run start: B lock held 1830Z (created 18:36:00Z),
2h57m old at recovery; registry heartbeats of its three trees 63+ min stale
(20:26:49–20:26:52Z); no coordinator process in `ps`; all three 1830Z
workers done/cancelled in the subagent listing; no file written in any
adopted tree in the 15 min before 21:33Z. Deleted in the same call it was
re-read in under the 90-min fallback; 1830Z claim retired to .DEAD.
NOT touched: Loop A 2015Z arms (musterask DIAG-GO + departsafe-rejudge GO,
landed as 1a7a5b647 during this run) and the playtest-loop journey-scale
r276 work (landed ea04dd01f + 36ea1b9fb during this run).

## Arm 1 — sim-cellgate-floor-b: DIAG, merged 185a3528b

CELLGATE floor vs kill-loot fight mix (sim-findings line 2716 [claimed]).
Adoption found the 1830Z confirm corpus incomplete — each confirm process
finished exactly one seed (107541, 107545) then died; 10/16 per leg at
adoption. The adoption worker re-ran ONLY the 12 missing seeds with the same
instrument/anchor (81613563bd78)/band in 4 remnant processes (all exit 0,
errors 0); no valid per-seed file overwritten. Corpus complete: 16/16 per
leg, seeds 107533–107548, 0 instrument errors, single policySha, single
gameSha 78f460bcbbbf, floors 3 (arm) / 4 (ctl).

Frozen bars: Bar 3 PASS — armed volleys 9/16 (≥5), 7 at wave 3, each firing
at the holder's first wave-3 fight while loaded (14 shots, 5 hits, 328 dmg);
9th volley is Ava Garcia, a natural 2nd arrival firing at wave 4. Bar 5
PASS — wave-3 volleys 7 (≥3). Bar 4 PASS — control volleys == 2 (Emma w4
d51, Caleb w5 d100 — exact killbundle-b reproduction). Bar 2 PASS — 16/16
bundled, 0 dry, both legs. Bar 6 PASS — tier-4 15.49% vs 11.97% (+3.52pp,
within ±5pp). Bar 7 PASS — starvation 5 vs 9, median survival 151 vs 149.
Bar 1 FAIL (one subcheck) — corpus carries 2 git anchors (pilot 8 on
6b9e75cf1, confirm 8 on 81613563b); proven code-identical (empty src+scripts
diff between anchors, single gameSha on all 32 files). Bar 8 FAIL (status
set) — panel review_required, village-deaths rows regression_watch (+5.125
per run, 95% CI −3.25 to 15.31; paired median 0, worse 4 / better 3 / tied
9; the +82 deaths delta concentrates in 4 divergence seeds, 3 of them
villages the wave-3 firing saved from being lost). Bar 9 DELIVERED —
sense-test + re-arm record in evidence.

Formal verdict DIAG (frozen rule: bar 1 fails → DIAG; bar 8 also fails as
written). The lever question is answered yes — floor 3 makes the loaded gun
fire — but the formal GO label is blocked by the two instrument-validity
deviations. The flip decision (default floor 3) needs coordinator/Steve
acceptance of those deviations or a re-judge; no re-run can repair the
anchor label (valid files must not be overwritten), and the deaths watch
needs a 64-seed holdout, not a re-run. Metric-review proposals
(gameSha-based anchor identity; regression_watch judged by CI/pair-split)
are in the evidence §10. Findings line 2716 stays [claimed] — nothing
landed, no flip made. Game-code change: src/js/fieldFights.js, 13 lines
(CELLGATE_FLOOR param, default 4 preserved — proven by the 17/17 proof,
incl. "floor defaults to 4").

Sense-test: Emma Larsen (107539) carries the gun 24 days through 9 held
fights, fires once at a wave-3 Buffering (d27, 64 dmg), carries the empty
gun 22 more days, dies in the wild d57, gun ends on her unburied corpse,
never looted, nobody ever comments. Dmitri (107546) fires a 0-damage
wave-3 volley that still saves his village from being lost. No holder ever
re-arms — zero equipped-with-cells days after any firing, either leg.

Wall (cellgate corpus): wins 0/16, national 0/16, table not instrumented —
both legs. Wave 4: 16/16 both; wave 5: 11/16 ctl, 12/16 arm. Median
survival 149 ctl / 151 arm; villages lost 8 ctl / 5 arm.

Landing: rebased once onto df7aedb98 (3/3 clean, no quirk stop); proof
test-cellgate-floor-b.js 17/17 green on the rebased tip; merged ff-only,
64 files. Evidence: evidence/2026-11-23/sim-cellgate-floor-b.md.

## Arm 2 — sim-rearm-b: GO, merged d3fcf060a

Corpse-transfer re-arm path (sim-findings line 2717 [claimed] → fixed on
this landing). Adoption found the pilot arm leg at 1 seed; the worker
re-ran only the 7 missing arm seeds, then the full confirm (8+8). Machine
restart ~21:38Z SIGTERM'd the first re-run (nothing lost). Pilot continue
rule was met (supply 6, rearmEvents 1).

Frozen bars, all 8 PASS: Bar 1 instrument PASS (selftest 31/31,
test-rearm-b 18/18, --live 45/45, --dir-ctl/--dir-arm PASS, lineage
11/11 + 36/36 + 14/14, 0 errors on 32 files). Bar 2 bundle intact PASS —
16/16 bundled both legs, klDry 0. Bar 3 re-arm events ≥1 PASS — 4 (all
second-life, all Haven-channel, gun + 2 cells each — prereg §3's "at most
1 cell" expectation was wrong; the Haven sweep reads the death-pack
directly). Bar 4 second-life volley ≥1 PASS — 1 (s107542 Sigrun, d122:
2 shots / 1 hit / 66 dmg vs a wave-5 Cancellation). Bar 5 control clean
PASS — 0 events. Bar 6 supply ≥1 PASS — 13 supply deaths. Bar 7
guardrails PASS — starvation 9 vs 9, median survival 149 vs 149 (delta
0). Bar 8 balanced panel PASS — decision review_required, all metrics
descriptive / no_material_signal / not_observed. Bar 9 scholar-path +
tier-4 + sense-test DELIVERED — scholar takes 3/leg; tier-4 17/142 =
11.97% both legs, byte-identical; Sigrun/Olivia stories read.

Conversion 4/13 supply deaths (31%); 0 witness-channel takes in 16
seeds. The lever stays env-gated (REARM_CELLS=1) — no default flip in
this arm. Game-code change: src/js/corpses.js, 235 lines + src/js/game.js,
4 lines (the re-arm mechanism itself, env-gated).

Open threads (evidence §10): witness channel 0/4 (next question:
wild-corpse expedition); s107535 census wrinkle (gun shown in scholar's
pack d110–113 and d123–129 with no recorded take).

Wall (rearm corpus): national 0/16, wins 0/16, table not instrumented,
wave 4 16/16, wave 5 11/16, median survival 149d — unchanged by this
arm, as expected.

Landing: rebased once onto 185a3528b (2/2 clean, no quirk stop — the pick
hit the known stop-at-pick quirk on the worker's earlier rebase, recovered
with --continue); proof test-rearm-b.js 18/18 green on the rebased tip;
merged ff-only, 62 files. Evidence: evidence/2026-11-23/sim-rearm-b.md.

## Arm 3 — sim-gatehorizon-reprereg-b: NO-GO kind CONCEPT-DEAD, merged df7aedb98

Gate-horizon re-prereg with deaths-log attribution + organic unpinned doors
+ boundary logging (1730Z next blank #3). Pilot corpus was complete on
disk at adoption (legs exit 0 at 21:00:21Z); the worker verified 16/16,
analyzed, judged, and committed. No confirm run: the pilot failed two
frozen bars, so confirm band 109201–109216 stays unspent.

Frozen bars (seeds 109201–109208, 150d horizon, capable policy): H1a
pool-door leader deaths, deaths-log attribution (PRIMARY) — control 10 →
armed 5 (Δ −5), PASS. H1b downstream wave-4 kills (CO-PRIMARY) — control
26 → armed 23 (Δ −3, tolerance −1), FAIL. D5 substrate sanity / D6
durable-log completeness PASS / PASS. Supply (pilot) 8/8 scored both legs,
PASS. M5 guardrails — starvation 1 vs 5 PASS; median survival 91 vs 90
PASS; village deaths 982 vs 924 (+58), FAIL. M5 panel compare
review_required, village deaths regression_watch (no regression_signal).

The gate refused all 8 staged doors; all 8 were winnable on control (8/8
fought, 8/8 killed, 0 leader deaths). Wave-5 kills collapsed 20 → 7; one
armed village never unlocked wave 5. The deaths-log attribution fix is
proven on the fresh corpus (synchronous flag reads 0/0, deaths log reads
10/5). All attributed deaths were organic; pinned 2 → 0, unpinned 8 → 5 —
the gate saves the pinned deaths and cannot reach the rest. The open
question is a design call, not a re-measurement: retune the projection (a
bar the party's actual damage can meet) or remove the gate. Appended to
sim-findings.md as [open] this run.

Two instrument defects found and fixed (proof test only — driver,
analyzer, corpora untouched): (1) `spawnSelf` in the new proof test
spawned the OLD arm's test file (test-gatehorizon-b.js) — first pass
40/47, all 7 fails from that one line. (2) §3b `widenedN` was measured on
profiles recomputed after `pickQuadLive` sets `potential=true` for the
whole roster, so it read 0; the probe now snapshots profiles before the
call; the corpora's `widenedN` values carry the same understatement
caveat, noted in the evidence. One standalone leaderproj run failed
53/55 on nested re-runs under box load 5–7 (driver-smoke timeout
signature); re-ran green 55/55, and it passed 55/55 nested in M3m §6
twice. A machine restart killed the first final M3m attempt mid-§6; it
was re-run clean from scratch.

Proof battery all green on the rebased tip (base 1a7a5b647): M1 18/18, M2
35/35, M2w 16/16, M3 29/29, M3d 49/49, M3e 25/25, M3f 48/48, M3g 43/43,
M3h 50/50, M3i 55/55, M3j 36/36, M3k 11/11, M3m 47/47, analyzer selftest
20/20. Zero src/js.

Wall (gatehorizon corpus): wins 8/8 both legs, national/global 8/8,
table entered 8/8 (waiting 0/8), wave-4 unlocks 8/8, wave-5 unlocks 8 vs
7, median survival 90 vs 91 days.

Landing: already based on 1a7a5b647 (rebased mid-run by the worker after
loop A landed); merged ff-only first, 29 files. Evidence:
evidence/2026-11-23/sim-gatehorizon-reprereg-b.md.

## Wall (this round's judged corpora, 80 configs)

Kill-loot guns now demonstrably fire when loaded AND re-arm: floor 3
gives 9/16 volleys (7 wave-3); the re-arm path gives 4 second-life takes
and a second-life volley. But neither moves the scale wall on its band:
cellgate + rearm wins 0/32 each, national 0/32 each. The gatehorizon band
wins 8/8 on both legs (capable policy) — the gate changes nothing about
winning and costs wave-4/5 kills. Wave 5: cellgate 11–12/16, rearm 11/16,
gatehorizon unlocks 8 vs 7. Median survival: 149–151d (guns bands, capped),
90–91d (gate band).

## Telemetry deviation check

`node scripts/telemetry-check.js` on the cellgate arm corpus and the
gatehorizon armed corpus both REFUSE the input: "refusing recorder-corpus
input: all N --current rows carry top-level anchorCommit, so they are sweep
recorder rows, not runs." No LOUD lines — the tool declines this input
shape by design (recorder corpora are compared with sweep-compare tables,
never against a run baseline). No deviation to investigate; baseline NOT
rolled. Scale-wall numbers are in each arm's evidence file.

## Infrastructure

- Machine restarts: ~19:27Z (killed the 1830Z run) and ~22:58Z (uptime
  12 min at 23:10Z; killed the gatehorizon worker's first final M3m
  attempt and the rearm worker's first re-run — nothing lost in either
  case). Box load 5–7 during the gatehorizon proofs (one 53/55 nested
  flake, re-ran green).
- Write flap ~22:19–22:28Z blocked git writes (new object/index files
  refused, "Operation not permitted"); safe-commit.sh refused twice with
  its mass-deletion guard firing on an empty private index — correct
  behavior, no --force-delete used. Flap cleared 22:28Z.
- Safe-commit index clobber struck on all three worker commits (cellgate
  33 files, rearm 80 files staged-as-deleted, gatehorizon after
  committing) — repaired via the `ls-tree -r HEAD | update-index
  --index-info` pipe each time, commits verified correct.
- Rebase stop-at-pick quirk struck once per worker (cellgate, rearm)
  during their rebases; recovered with --continue after verifying the
  pick unapplied. Coordinator rebases (cellgate 3/3, rearm 2/2) ran
  clean.
- Master moved under this run: loop A 2015Z adoption (1a7a5b647) +
  journey-scale r276 (ea04dd01f, 36ea1b9fb) before the first merge; no
  further moves during the merge sequence.
- check.js --quick NOT re-run this round: the run window ends ~23:30Z
  and the gate takes 550–850s. Justification, per the 2330Z precedent:
  all three arm proof batteries ran green on their (re)based tips
  (cellgate 17/17, rearm 18/18, gatehorizon M1–M3m full battery); loop
  A's 2015Z gate (335/9, 0 attributable) ran on tip 1a7a5b647 hours ago;
  the two game-code changes are env-gated/default-preserving
  (CELLGATE_FLOOR default 4, REARM_CELLS=1) and covered by their proof
  tests. The full repo gate is OWED — the next run or the ship loop
  should run it before this tip ships.

## Findings backlog

- Line 2716 (CELLGATE holds every volley below wave 4): stays [claimed];
  update note appended — floor 3 judged DIAG, lever works, flip
  undecided.
- Line 2717 (no re-arm path): marked [fixed] on the rearm landing.
- New [open] line appended: gate projection retune-vs-remove design call
  (gatehorizon-reprereg-b NO-GO CONCEPT-DEAD).

winnability-chain stays converging (NOT converged): the gun chain is now
complete as a mechanism (bundle loads, floor 3 fires, re-arm re-loads)
but wins are still 0 on both gun bands and the leader-projection gate is
concept-dead — it saves pinned leaders and costs more kills than it
saves. Next blanks, in order: (1) cellgate floor flip decision or a
64-seed deaths holdout; (2) re-arm witness channel — wild-corpse
expedition; (3) gate projection retune-vs-remove design call; (4)
standing accumulation on gear-ready seeds (the 99107 pattern, still open
from the re-point queue). scale-onramp stays converging (untouched;
sibling loop A).

Merged df7aedb98 (gatehorizon) + 185a3528b (cellgate) + d3fcf060a (rearm)
+ this record; merged locally, pending ship. Claim deleted; lock deleted.
