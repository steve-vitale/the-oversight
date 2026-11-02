# Loop B 0459Z coordinator evidence — food-economy: roadguard + gatedepth (both PILOT NO-GO, both branches HELD)

Run: oversight-flesh-out-loop-b, run_id fleshout-loop-b-20261102T0459Z.
Axis food-economy (second non-converged axis). Sibling Loop A live on
scale-onramp at run start (0445Z claim: sumconfirm/sumdeploy) — NOT touched;
Loop A closed out mid-run (0445Z round evidence 624592b18) and a NEW Loop A
run started (0605Z lock) before this closeout — NOT touched. No B lock at
run start after the 0330Z closeout; claim written before any sims.
Pre-flight: main tree clean at 680d60dde, disk 27%, reap no-op on live trees
(12/16 active at run start). Registrations slow behind registry-lock
contention with Loop A (as in the 0330Z run); both trees registered at
680d60dde with heartbeats verified before workers spawned.

## Arm sim-roadguard-b (branch sim-roadguard-b, HELD, NOT merged)

Commits: 7005c4928 prereg + guard policy + driver + analyzer + proof
(before any judged sim), 97aa7159 analyzer player-only starvation counting,
2c200eb1 analyzer death attribution by deaths[].day, 3194b76ec pilot NO-GO
evidence + corpora + panel, 0da4a6624 evidence correction (late check.js
result). Worktree clean. Policy-side ONLY, zero src/js, zero edits to
competent.js, one additive panel-registry line. Guard derived FRESH from
master code; held sim-tasktag-b tree/branch NOT touched, read, or copied.

Design (decided up front): greedy return simulation with a single roadwork
credit, applied at hop time to outward/lateral hops; sim models the policy's
walkTo from the hop destination homeward via orthogonal steps checked with
Game.travelBlockage, allowed through exactly ONE rubble (the walk's own
roadwork). Homeward hops never vetoed; self/combat/force pass through.
Rejected up front: walk-end check (too late), guarded-side exemption alone,
BFS sim (over-approves pockets greedy walkTo cannot exit).

Pilot verdict: NO-GO on B3 engagement, no confirm run. Fresh band 61301-61308
(screened: 61001-61008 excluded as spent by sim-storageshed-b2; 61101-61108
screened quiet, band away 4; 61301-61308 qualifies via the death clause —
61308 carries a stranding-linked player starvation death), 30d competent vs
competent-roadguard-b, DEPOSITGATE=0, identical seeds:

| Bar | Baseline | Armed | Verdict |
|---|---|---|---|
| B1 stranding total (away day-ends) | 7 | 7 | PASS |
| B2 new-or-worsened (seed >= 10 AND >= base + 10; strand-linked death) | — | none | PASS |
| B3 engagement (vetoes >= 10) | — | 0 vetoes | FAIL |
| B4 no-harm failed-trip share (<= baseline) | 0.358 (86/240) | 0.358 | PASS |
| B5 no-harm mean daily haul (>= baseline) | 334.1 | 334.1 | PASS |
| B6 survival (median >= baseline; player starvation deaths <= baseline) | 30d; 1 seed | 30d; 1 seed | PASS |

Per-seed pilot rows IDENTICAL on every judged number. The guard evaluated
52-85 return sims per seed and vetoed NOTHING — every outward hop had a
greedy way home under the sim, including 61308's day-7 departure to (1,4).
The roadwork credit NEVER engaged in any leg (creditUses 0 on all pilot,
diagnostic, and screening legs) — the credit's fix for the tasktag failure
is still a prediction, not evidence; the 60501 roadwork case never occurred
on any band run.

Diagnostic 60307 (NOT judged evidence): baseline reproduces Stage A shape
(away days 5-10 at (2,0), player dehydration death day 10). Armed: 6 vetoes
(days 5-7), away days 6-12 at a DIFFERENT pocket (5,2), failed-trip 0.433 ->
0.467, haul 125.5 -> 177.7, player starvation death day 12 (same villager
id as the baseline death). The guard vetoed the day-5 pocket path but
stoneRun re-fired day 6 and the expedition re-routed into (5,2) through
hops the sim approved. Vetoes without a return capability are whack-a-mole.

Root cause (for the next arm): the sim steps ONE orthogonal tile at a time,
but real walkTo jumps up to 3 tiles per travelTo and a jump can be refused
by a blockage on an INTERMEDIATE tile even when an orthogonal path exists.
The sim is MORE permissive than the return walk it models. The next guard
must model travelTo jumps (d<=3 + intermediate-blockage checks), or pair
the guard with a return walk as capable as the sim — sim and return walk
must be the SAME walk.

Sense: the veto line speaks honestly ("You don't walk there — you couldn't
get home from there") but on 60307 its promise fails — the scholar walks
SOMEWHERE ELSE the next morning and dies there instead. 61308 reads as a
villager who does not know he is stranded: forages successfully four days
from (1,4) on unidentified lumps inedible away from camp, starves with a
full-ish bag of unknowns, only his successor walks home. The guard's design
addresses neither shape's real cause.

Proof: scripts/test-roadguard-b.js 13/13 (proves the SIM's logic, incl. the
60501 shape: one rubble passes with exactly one credit; creek / fallen_tree
/ washed_out / second rubble fail — not the guard's effect). §15 panel:
16 cases, 0 reused, neutrality matched both policies, per-seed outcomes
IDENTICAL across legs (survived 7 / village-lost 1 (61308) both; won /
national / table 0 both; maxArc 3 both; vests 1 (61306) both). Panel is
context, never verdict (it reads 61308 as village-lost where the driver
reads survival under succession). check.js --quick (late result): 284
passed, 6 failed in 446s — same counts as the documented pre-existing
pattern, but failing names were lost to a tail pipe, so identity with the
pre-existing 6 is NOT claimed; arm touches zero src/js.

Metric review (next run, NOT a re-score): band rule must require a
POCKET-type qualifier (baseline away >= 10, or a baseline pocket entry with
blocked homeward tries) — a staying-type stranding qualifies as written but
cannot judge a pocket-entry guard; engagement must count prevented
pocket-entries (veto + scholar ends home that day + no entry next day),
not raw vetoes (60307: 6 vetoes, 0 prevented); death attribution must use
deaths[].day, never Game.over (succession deaths leave Game.over false).

## Arm sim-gatedepth-b (branch sim-gatedepth-b, HELD, NOT merged)

Commits: e8608da26 prereg (before any judged sim), 5515a76dc analyzer +
proof 16/16 (synthetic only, no judged numbers), 0d120ad42 evidence +
corpora. Worktree clean. Diag-only arm by prereg design: the (c)+floor
port itself is held unmerged, so stacking a revised port was refused.
Nothing lands in game code.

Design (decided up front): (c') = (c) + floor 12000 + depth 0.75 — a firing
evening's TOTAL pantry must have fallen at least 25% from its firing-time
level AND sit below 12,000 kcal.

Pilot verdict: NO-GO, no confirm run. Confirm band 76701-76712 re-verified
unspent and REMAINS unspent.

| Bar | Result |
|---|---|
| (a) True-positive on 51608 shape | FAIL on the row trajectory: shape arithmetic passes (7,640 <= 0.75 x 11,233 and < 12,000) and recomputation fires (c') day 16 (9,483 -> 5,870, -38.1%), in time vs first starvation day 21 — but the firing scores RECOVERED (bar 6,457; days 25-26 pantries 38,085/7,449) even though the village collapses day 28. Depth delays the true-positive firing by exactly one evening vs (cF) day 15 (9,483 -> 7,535, -20.5%) and flips recovery with it: (cF) NOT-recovered, (c') RECOVERED, same evenings. |
| (b) False-fire on 76007 shape | FAIL on the re-run leg: shape arithmetic passes (published 10,122 > 0.75 x 12,554, so the published day-23 evening does not fire) — but the 76007 re-run under the gatediseng-line substrate (competent, DEPOSITGATE=1, gatecover tracer verbatim; survived 30d, rows 30/30) fires under (c') day 24 (S=19, 10,758 -> 6,280, -41.6%) and scores RECOVERED (days 25-26, climbs to 15,595) — a genuine false fire. The published 19% shape does not reproduce on this substrate. |
| (c) Quiet band | PASS: fresh band 77001-77008 (verified clean before prereg): zero firings under (c), (cF), and (c') on all 8 seeds. |

Net effect of the depth revision: one evening of delay on the true positive,
zero change on the false-fire seed and the quiet band. Depth separates the
two published shapes and nothing else measured. Like the floor before it,
it moves false alarms deeper rather than removing them.

No balanced-panel compare file: inapplicability declared in the prereg
(diag-only rule overlay on identical trajectories; panel deltas would be
definitionally zero — same precedent as gatediseng-b). The before/after
tables in the arm evidence are the compare. check.js --quick not re-run
(zero src/js or green-list files touched).

Sense: on the village that dies, the deeper rule waits one more evening and
still speaks in time — but from so deep that the village's last windfall, a
huge haul that arrives too late and melts away in two days, counts as a
"recovery" while the village dies anyway. On the village that lives, the
deeper rule helps not at all: that village falls further than the dying one
did, down 42%, then climbs back out while its people argue about who is
running things and learn to hear the shape of the land. The eight new
villages are unremarkable in the best way — they survive, lose people to
fights and ambushes but never hunger, and their pantries wobble without
sliding, so the rule rightly stays silent on all of them. What remains is
not a better threshold but a different question: what, other than the
pantry number, tells a real collapse from a deep dip that recovers? The
pantry alone cannot, because the deepest dip in this run belonged to a
village that lived.

Documented for the next arm (3 lines appended to sim-findings.md by the
worker): (1) depth measured, not killed as a concept, but no pantry-only
depth value should be preregged next without fixing the substrate first
and re-deriving shapes on it; (2) recovery-bar artifact — firing-pantry-
relative bars make deeper firings score "recovered" more easily, and
recovery scoring is meaningless without survival (next prereg should tie
the bar to the stand-down pantry or an absolute level, survivors only);
(3) substrate fragility — gatefloor's 76007 shape (19%) reads as 42% on
this substrate, so sensor thresholds need a re-run leg, not just shape
arithmetic. Disclosure carried from the prereg: 76007 is a gatefloor-band
reuse for the false-fire leg only; the quiet leg used fresh 77001-77008.

## Wall numbers (in-window only, never pooled across arms)

Roadguard pilot window (30d): national / table / wins 0 both legs; median
survival 30/30 both legs; wave 1-2 both legs (wave 2 on 61302, 61304, 61305,
61307, 61308; wave 1 on 61301, 61303, 61306); vests 1 (61306) both legs.
Gatedepth pilot window (30d): 8/8 survived, median 30d, max 30d; wave 1 on
2/8, wave 2 on 6/8, waves 3-5 not reached in-window (expected); national /
table / wins / Arc II-IV 0 in-window (expected, not a rate claim); vests
not measured (tracer carries no vest field — no count claimed). Gatedepth
pilot deaths (64, 0 starvation): combat 34, villager combat 12, ambush 6,
the wild 6, expedition 5, monster 1. Full seat 0 / wave 5 reached 0 stand
as last measured (Loop A lane) — UNCHANGED in kind by this run.

## Telemetry deviation check

telemetry-check.js against the scale-wall baseline with the roadguard
pilot corpora: LOUD parse line only — "could not parse
sim-roadguard-b-pilot-armed.jsonl: Unexpected non-whitespace character
after JSON at position 392868 (line 2 column 1)". This is the KNOWN
multi-line-jsonl input-format limitation precedent from the 0330Z run
(single-JSON parse; multi-line jsonl fails at line 2), not a deviation.
Baseline NOT rolled. No LOUD deviation line.

## Infrastructure

Safe-commit index clobber hit worker commits on both arms (repaired via
HEAD-blob cacheinfo, commits verified correct, trees clean). Registry-lock
contention with Loop A slowed registrations and heartbeats at run start
(retried, verified). Held trees sim-roadguard-b and sim-gatedepth-b left in
place with fresh heartbeats for the next arms to re-port from (precedent:
sim-tasktag-b / sim-gatefloor-b held trees still registered); branches
NOT rebased — their bases are now behind master; future work re-ports or
rebases. check.js --quick NOT re-run by the coordinator (arms ran it:
roadguard 284/6 with names unclaimed; gatedepth zero src/js).

## food-economy stays converging (NOT converged)

Two follow-ups to the 0330Z sensor/guard program both NO-GO'd at pilot on
their own preregs: the roadwork-aware guard is inert on a fresh band and
reroutes rather than prevents on the proven pocket, and the depth revision
moves false alarms deeper rather than removing them. No gate change landed,
no default flipped. scale-onramp untouched (sibling Loop A lane).

Next blanks, in order: (1) TravelTo-jump-faithful return sim (d<=3 jumps +
intermediate-blockage checks) re-judged on a POCKET-type band (baseline away
>= 10 or a baseline pocket entry with blocked homeward tries), with
engagement counted as prevented pocket-entries, not vetoes; (2) guard +
return-capability pairing (tripHomeDetour / route-around on the return leg)
OR veto-budget expedition abort — decided up front next run, not both at
once; (3) a 60501-shape band (rubble on the simulated return path) to test
the roadwork credit itself, still 0 uses in every leg; (4) standing go-home
rule for staying-type stranding (61308 shape) — separate line from the
guard line; (5) sensor: a non-pantry collapse signal (pantry alone cannot
separate a deep dip from a collapse) with recovery tied to stand-down
pantry or an absolute level, survivors only, and a substrate re-run leg
before any threshold is preregged; (6) gatediseng confirm band 76701-76712
still unspent; (7) pantry-cap-as-garden-bottleneck on rich seeds (74007);
(8) standing-load remainder (road food + gear + materials 18.6-19.75 kg vs
20 cap) — capacity or materials-pooling arm; (9) pack-full refusal narration
(kg + top load); (10) HUNGER WINTER relief passivity (steve-call candidate);
(11) shelling default-flip call; (12) P3 reset follow-ups — night-22 +3,005
silent inflow bridge (still undocumented), double endDays on vessel-death
days; (13) patrol-departure narration; (14) garden / fish / traps early path
(marginal 2.8% combined); (15) creek clearance wood-bound; (16) rubble
daytime-clearing habit unmeasured; (17) washed_out scramble narration;
(18) 96-tick bridge edge unobserved; (19) a 120d window only if a new
horizon-cut episode appears.

Coordinator evidence: evidence/2026-11-02/sim-food-roadguard-gatedepth-round-0459.md
Claim deleted; lock deleted.
Merged locally, pending ship (nothing landed: both arms HELD, branches kept).
