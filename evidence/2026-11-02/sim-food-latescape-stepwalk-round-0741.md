# Loop B 0741Z round — food-economy: lateral-escape guard + stepping return walk (both NO-GO, branches HELD)

Run: fleshout-loop-b-20261102T0741Z. Sibling Loop A live on scale-onramp
at run start (0725Z claim: heraldcontact + arrearsscreen) — NOT touched;
A's claim was gone by closeout (A run ended; its landings, if any, are
its own record). Axis: food-economy (converging). Pre-flight: main tree
clean at b312c404b, disk 26%, reap no-op (10/16 active at start). Claim
written before any sims. This file is the coordinator record; arm
evidence lives on the held branches (see below). Nothing landed in this
run: both arms NO-GO, both branches held with fresh heartbeats for
re-port, NOT rebased (0619Z precedent).

## Arm 1 — sim-latescape-b: PILOT NO-GO, branch HELD (not merged)

Successor to the 0619Z jumpfaithful NO-GO (food-economy next blank 1).
Commits: 5f1166864 (prereg, before any judged sim), 376975a8f (build),
1003b2804 (evidence + corpora + panel). Proof: scripts/test-latescape-b.js
41/41, re-run green by the coordinator (census 7 hop + 6 walk cases,
false opens 0 / false closes 0).

What was built: a lateral-escape-aware guard + veto memory, policy-side
only (scripts/policies/competent-latescape-b.js; zero src/js). Escape
model E(D): direct walkTo-faithful sim, else up to 4 stocked lateral
legs, one shared roadwork credit. Veto memory = silent repeats, never
an abort. Veto memory works as narration: 6 vetoes pilot-wide, only
2 spoken lines (4 silent) — the repeat-shout problem is gone.

Pilot (substrate identical to predecessors: competent, 30d,
DEPOSITGATE=0). Band 61801–61808, first fresh band screened, qualifies
via 61807. Disclosed cap: the band carries exactly ONE baseline pocket
episode, so PRIMARY (>=2) was mathematically unattainable on this band
— the pilot still judges prevention of that episode, false-close
behavior, veto memory, and all no-harm bars.

| Bar | Baseline | Armed | Verdict |
|---|---|---|---|
| PRIMARY prevented pocket-entries (>=2) | 1 episode (61807) | 0 prevented | FAIL |
| B1 away day-ends (<= baseline) | 9 | 7 | PASS |
| B2 new-or-worsened (= 0) | — | none | PASS |
| B4 failed-trip share (<= baseline) | 0.254 (61/240) | 0.258 (62/240) | FAIL (+1 day, all on 61807) |
| B5 mean daily haul (>=0.95x) | 315.4 | 318.2 | PASS |
| B6 median survival (>= control) | 30d | 30d | PASS (starv seeds 1->0, see caveat) |

Why it NO-GOs — trace-proven, not a sim bug: the pocket entry on
61807 day 4 is a HOMEWARD hop the guard never evaluates. After foraging
at (2,0), the trip's walk home steps (2,0)->(3,0) — Manhattan-closer to
haven (6->5), so it passes through under the inherited "never veto a
return" rule — yet from (3,0) the onward walk fails and the scholar
day-ends there for 6 days (baseline). The armed guard fences the
pocket's edge afterward (vetoes (3,1)->(3,0) days 5-7, home by day 8),
but day 4's failing day-end anchors the whole run as one episode under
the conservative rule, so prevented = 0. Do NOT claim a life saved: the
starvation-coded death is gone but a day-9 player death still occurs on
armed (cause 'the wild', same person, same day; scholar came home day 8
at 90 kcal and died on the next outing).

Two more proven points: (1) The false-close proxy over-counts: its 3
entries on 61802 day 14 are hops the engine itself refused (baseline
scholar never visited (4,6); forages identical) — the proxy needs an
arrival condition. (2) Positive lateral evidence: 61803's 3 away days
at (1,7) fail the walkTo-only sim but pass the lateral check (legs 2)
and end unharmed — a would-be pocket under the old model is a stocked
way home under the new one. Balanced panel (§15, context only):
16 cases, 0 reused, neutrality matched both policies; per-seed outcomes
identical both legs (survived 8/8, won/national/table 0, wave 2 on 7/8,
wave 1 on 61806).

Village assessment (plain words): the guard can now tell a real
dead-end from a path that only looks like one — it stopped shouting at
scholars who would have walked out sideways, and it stopped shouting
the same warning night after night. But it still cannot see the one
way scholars actually walk into trouble: stepping toward home itself.
Until the guard is allowed to question a homeward step, it guards the
edges of the trap while the front door stays open.

## Arm 2 — sim-stepwalk-b: PILOT GO, CONFIRM NO-GO, branch HELD (not merged)

Successor to the 0619Z stayhome NO-GO (food-economy next blank 2).
Pilot commits: dfed39a29 (prereg + policy + sweep + analyzer + proof,
before any judged sim), f79e20e49 (evidence + corpora + panels).
Proof: scripts/test-stepwalk-b.js 11/11, re-run green by the coordinator.
Confirm commits: 2545e52f4 (confirm prereg, before any judged/screening
sim), b420baf76 (evidence + corpora + panels + verdict test).
Proof: scripts/test-stepwalk-confirm-b.js 23/23, re-run green by the
coordinator. check.js --quick on the pilot: 283 passed, 7 failed in
964s — causality proven, none caused by this arm (6 fail identically
with the arm's files removed; the 7th passes standalone both ways,
parallel-load flakiness).

What was built: the stayhome trigger, guards, and fire line kept
UNCHANGED (the stepwalk policy imports the predecessor's evaluator
verbatim, byte-identical port, sha256 b926330b…); only the walk
changed. Instead of one greedy direct jump to home, the recall now
moves tile-by-tile along a BFS path over travelBlockage-clean
orthogonal steps, re-planning from the scholar's actual tile each
step, via adjacent travelTo calls (so the intermediate-jump refusal can
never fire). Policy-side only: zero src/js, zero competent.js edits,
zero default flips. This is also the walk docs/MAP.md §6 blesses for
the player's own "Walk home" action.

Pilot (30d, competent vs competent-stepwalk-b, identical seeds,
DEPOSITGATE=0). Band 61401–61408 — DISCLOSED REUSE of the
predecessor's qualified band (qualifying seeds 61403, 61407).

| Bar | Baseline | Armed | Verdict |
|---|---|---|---|
| PRIMARY prevented staying-type deaths (>=2) | 2 qualifying seeds | 2 prevented | PASS |
| Reached-home fires (>=2) | — | 3, all reached home | PASS |
| New-or-worsened strandings (0) | — | none | PASS |
| Median survival (>=0.8x) | 30d | 30d | PASS — real, not vacuous |
| Starvation deaths (<= control+2) | 5 | 4 | PASS — real |
| Mean daily haul (>=0.8x) | 7.68/day | 8.26/day | PASS — real |
| Failed-trip share (<= control) | 0.390 | 0.350 | PASS — real |

The pilot rescues, tile by tile: 61403 day 15 at 98 kcal walks
(5,3)->(5,4)->(4,4) — exactly the clean path the jump couldn't take —
eats at home (98->1920 kcal), fires again at 0 kcal day 18 and walks
home again; baseline scholar dies of starvation day 18, armed scholar
stays home fed through day 30. 61407 day 5 at 426 kcal walks
(3,3)->(4,3)->(4,4) home; baseline dies of dehydration day 10, armed
recovers and lives to a "wild" death day 26 — life extended 16 days,
not lived forever (that day-26 death is not a staying-type death: home
through day 25, max post-rescue episode 1).

Confirm (same bars, 30d, identical seeds, DEPOSITGATE=0). Judged band
61901–61916 (16 seeds), first fresh band screened, qualifies
immediately with 3 qualifying staying-type seeds (61901, 61908,
61909). Banned bands untouched (61401–61408 pilot; 61501–61508;
61601–61608; 61701–61708; 61801–61808; 61308; 60307). Note:
61908/61909 qualify ONLY via the successor-home clause (baseline
scholars died "the wild" at 0 kcal after 5–8 stranded nights, successor
home next day) — the clause did real work here, against the pilot's
suggestion to drop it; the 2026-11-02 successor-clause-unverified
findings line is superseded (see findings appended by the coordinator).

| Bar | Control | Armed | Verdict |
|---|---|---|---|
| PRIMARY prevented (>=2) | 3 qualifying seeds | 3 prevented | PASS |
| Reached-home fires (>=2) | — | 3, all on qualifying seeds | PASS |
| New-or-worsened (0) | — | none | PASS |
| Median survival (>=0.8x) | 30d | 30d | PASS, non-vacuous |
| Starvation deaths (<= control+2) | 0 | 0 | PASS |
| Mean daily haul (>=0.8x) | 4.79/day | 5.30/day | PASS |
| Failed-trip share (<= control) | 0.583 (260/446) | 0.585 (261/446) | FAIL — by one failed day |

Verdict: CONFIRM NO-GO. Per §14 binding, the miss is not re-scored
and no re-confirm was run to chase a cleaner result. The +1 comes
entirely from firing seeds (61909: 13->15 failed days; 61908 improved
7->6; 61901 unchanged); all 13 non-firing seeds are identical between
legs on deaths/attempts/failed-days/haul, and haul improved band-wide
— post-rescue divergence on one seed, not systemic harm. But the
prereg bar is pooled share <= control with no tolerance, and 261 >
260. The policy is NOT landed on this evidence. Confirm rescues:
61901 walks home 2 steps at 177 kcal, recovers to ~1100, still dies
"the wild" day 10 at home, fed (baseline day 8 -> day 10: stranding
prevented, life extended 2 days); 61908 walks home 5 steps at 223 kcal,
survives to day 30 (baseline: stranded at 0 kcal, died "the wild" day
11); 61909 walks home 6 steps at 0 kcal, survives to day 30 (same
baseline shape). No re-fires on the confirm band. Panel (§15, context
only): both-policy campaign, 32 cases, sourcesStable, neutrality
matched both policies, survived 16/16 both, won 0 both; base-vs-lever
compare INVALID by the comparator's matched-policy rule (same refusal
as the pilot and sim-stayhome-b), attached as-is.

Village assessment (plain words): for the first time, a starving
scholar far from home actually walks home — step by step, around the
creek and the fallen tree that used to stop the rescue cold — and eats.
Three out of three stranded scholars on a fresh band came home. But
the rescue is not free: on one seed the rescued scholar's later trips
fail one day more than the scholar who died, and the rule as written
says one day too many is a miss. So the walk works and the verdict
doesn't — the next run must decide up front whether a one-day pooled
tolerance is honest, or whether a fresh band re-confirms under the
same hard bar. What must not happen is quietly re-scoring this band.

## Telemetry deviation check

On the stepwalk confirm corpus: 3 LOUD lines (national 12->0,
table/wins 16->0) — the known REGIME artifact class (30d competent-only
pre-seat window vs WINSEAT baseline; baseline file carries its _regime
label since the 2026-10-18 claim). Baseline NOT rolled, no
investigation item. Latescape corpus is the same window class.

## Wall (30d pre-seat windows; full-seat/wave-5 numbers stand from Loop A lane)

In-window: national / table / wins 0 both legs, both arms (expected
measurement profile, not a regression). Full seat 0 / wave 5 reached 0
unchanged. Confirm band wave reach: control 1:5/2:10/3:1, armed
1:4/2:11/3:1; all 16 survived to day 30, maxArc 3.

## Infrastructure

No EPERM flap this run (contrast 0619Z: ~20 min blocked at start).
Safe-commit index clobber hit worker commits on both arms (repaired
via HEAD-blob cacheinfo, commits verified correct, trees clean).
Held trees sim-latescape-b + sim-stepwalk-b left in place with fresh
heartbeats for re-port (NO-GO branches held, NOT rebased — bases behind
master after sibling landings). Coordinator evidence committed via
short-lived branch + --ff-only merge (repo AGENTS.md forbids direct
master commits), not a direct master commit.

## Findings appended by the coordinator (7 lines, hidden_files/sim-findings.md)

Homeward-hop pocket entry; false-close proxy arrival condition;
lateral reclassification in the wild (61803); stayhome re-fire pattern
(pilot) vs none on confirm band; rescue semantics + fed-at-home
"wild" death cause question; panel compare matched-policy rule;
successor-clause vindication (supersedes the unverified line).

food-economy stays converging (NOT converged): the stepping return
walk is proven (pilot GO + confirm 3/3 prevented, 3/3 reached home)
but NOT landed — its confirm missed one pooled bar by one day; the
lateral-escape guard is proven as a model but NOT landed — it cannot
evaluate homeward-hop entries. No gate change landed, no default
flipped. scale-onramp untouched (sibling Loop A lane).
Next blanks, in order: (1) homeward-step check — evaluating E from a
homeward hop's destination too — needs its own prereg, since it changes
the "never veto a return" rule and a vetoed homeward step strands the
scholar where it stands; (2) stepwalk re-confirm under a NEXT prereg
that decides up front: pooled failed-trip tolerance (e.g. <= control+1
day, justified as post-rescue divergence) OR a fresh band under the
same hard bar — decided up front, not after seeing the band; (3)
fed-at-home "wild" death cause instrument (61901: 1099 kcal day 9,
dead day 10 at home); (4) false-close proxy arrival condition before
it is quoted again; (5) 60501-shape band to test the roadwork credit
itself (0 uses in every leg — still owed); (6) guard +
return-capability pairing OR veto-budget expedition abort, decided up
front, not both; (7) sensor non-pantry collapse signal, recovery tied
to stand-down pantry or absolute level, survivors only, substrate
re-run leg before any threshold prereg; (8) gatediseng confirm band
76701-76712 still unspent; (9) pantry-cap-as-garden-bottleneck on rich
seeds (74007); (10) standing-load remainder (18.6-19.75 kg vs 20 cap);
(11) pack-full refusal narration; (12) HUNGER WINTER relief passivity
(steve-call candidate); (13) shelling default-flip call; (14) P3 reset
follow-ups; (15) patrol-departure narration; (16) garden / fish /
traps early path; (17) creek clearance wood-bound; (18) rubble
daytime-clearing habit; (19) washed_out scramble narration; (20)
96-tick bridge edge; (21) 120d window only if a new horizon-cut
episode appears.
Claim deleted; lock deleted.
Merged locally, pending ship (nothing landed: both arms HELD, branches kept).
