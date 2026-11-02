# Loop B 1135Z round — food-economy: homeward-extension ablation NO-GO + stepwalk re-confirm NO-GO

Run fleshout-loop-b-20261102T1135Z, axis food-economy (Loop B lane).
Claim written before any sims; deleted at closeout. Pre-flight: main
tree clean at a5a673c81, disk 25%, reaper removed nothing (all active
trees dirty, correctly refused). Sibling Loop A live at run start on
scale-onramp (1030Z claim: mustergap + creekdetour) — NOT touched;
A landed mid-run (4903d44b5: mustergap DIAG-GO + creekdetour PILOT
GO) and started a new run at 1155Z (musterclose + creekwood) — also
NOT touched. A batch-ship version bump (99ec4fcd5) also landed
mid-run. Both B arms absorbed the moved master via rebase (homext)
or were held unrebased (stepwalk, per the 0741Z precedent).

## Arm sim-homext-abl-b (1030Z blank 1) — NO-GO for the extension, DIAG for the outward guard

Worker branch sim-homext-abl-b, rebased onto 4903d44b5 clean
(3/3; the rebase stopped once at the 2nd pick with the known
"local changes would be overwritten" quirk on a clean tree — the
AGENTS.md recovery, verify clean + pick unapplied then
`git rebase --continue`, sailed through), proof re-run 21/21 on
the rebased tip and on merged master, merged --ff-only
(prereg 64210c3ac, build 4b2629541, results b142a72c4).
Worktree released done-merged, branch deleted. No src/js changes:
new outward-only policy + driver + analyzer + proof + one additive
sweep-compare registry line.

Three fresh legs, band 62801-62808, 30d, identical seeds:
baseline 26 away day-ends, 4 pocket episodes (3 homeward-hop) —
reproduces the 1030Z baseline exactly; full guard 3 away,
0 episodes, 3 prevented — reproduces the 1030Z armed file
veto-for-veto (95 vetoes, 85 silent, 10 spoken, 0 homeward,
2 credit uses, 28 lateral passes); outward-only guard 3 away,
0 episodes, 3 prevented — the same 3 seeds (62804, 62807, 62808).

PRIMARY: extension-only preventions = 0 (GO needed >= 1).
Full homeward vetoes = 0, outward-only pass-throughs = 0.
Trajectory identity 8/8: full vs outward-only day-end
position/kcal/hydration, veto counters, daysAlive, endReason,
and full sayLines transcripts identical on every seed. All
no-harm bars pass as exact ties (B1 3 vs 3, B4 0.508 vs 0.508,
B5 worst ratio 1.00x, B6 median 30d both, B2 none,
veto-created pockets 0). Panel (§15, context only): combined
3-policy campaign, 24 cases, sourcesStable, neutrality
matched; outward-only and full panel rows identical on every
field; the outward-only-vs-full compare returns INVALID
(unmatched policies/cases), attached as-is — same structural
class as the 1030Z compare.

Plain words: take the homeward half of the guard away entirely
and nothing changes — not one step, not one meal, not one
spoken line. The outward guard diverts all three episodes
before any homeward entry step, so the extension never had
anything to veto. The 1030Z GO for the FULL GUARD stands
(reproduced exactly); claiming the HOMEWARD EXTENSION adds
prevention is not supported by any judged evidence. Its only
firing evidence remains the unjudged 61807 diagnostic,
deliberately not re-judged here.

Correction carried from the worker: the 1030Z report's prose
veto total ("96, 85 silent, 11 spoken") is a 1-off miscount —
both the rpt armed file and this run's fresh full leg say 95
(85 silent + 10 spoken). No trajectory difference.

## Arm sim-stepwalk-rcf-b (1030Z blank 2) — RE-CONFIRM NO-GO, branch HELD

Worker branch sim-stepwalk-rcf-b at 328814a02 (prereg
203a2ce36, evidence 328814a02), proof 19/19. NOT merged:
held for re-port per the 0741Z precedent, with a fresh
heartbeat. The held branch sim-stepwalk-b was never entered
and never merged (tip still b420baf76); its policy/driver/
analyzer/proof were ported via `git show` only. The 0741Z
confirm band (61901-61916) was NOT re-scored; its NO-GO
stands.

Prereg decision (committed BEFORE any screening sim, blind
to the fresh band): option (a) — pooled failed-trip
tolerance of control + 1 failed day, WITH a non-firing guard
(non-firing seeds' pooled failed days must not worsen).
Justification from the 0741Z decomposition only: the prior
+1 was entirely post-rescue divergence on one firing seed
with all 13 non-firing seeds identical and haul improved.

Judged band 62001-62016 (first band screened, qualified
immediately; banned bands untouched: 61901-61916, 61401-61408,
61501-61508, 61601-61608, 61701-61708, 61801-61808, 61308,
60307). 30d, competent vs competent-stepwalk-b, identical
seeds, DEPOSITGATE=0. Qualifying seeds: 62003, 62009, 62016
(62009 via the successor-home clause alone — its second
vindication in two bands).

| Bar | Control | Armed | Verdict |
|---|---|---|---|
| PRIMARY prevented (>= 2) | 3 qualifying | 3 prevented | PASS |
| Reached-home fires (>= 2) | — | 3, all on qualifying seeds | PASS |
| New-or-worsened (0) | — | none | PASS |
| Median survival (>= 0.8x) | 30d | 30d | PASS |
| Starvation deaths (<= control+2) | 2 | 0 | PASS |
| Mean daily haul (>= 0.8x) | 7.57/day | 7.87/day | PASS |
| Failed-trip, decided bar (<= control+1 AND guard) | 187/448 (0.417) | 192/448 (0.429) | FAIL — +5 days, tolerance allows +1; guard HOLDS (154 = 154) |

Why it fails, trace-proven: all of the +5 is firing-seed
post-rescue divergence (62003: 14 -> 18, 62016: 13 -> 17,
62009: 6 -> 3). Attempt-days are identical (448 both legs),
so this is not longer exposure — rescued scholars fail more
of the same number of forage days. All 13 non-firing seeds
are identical between legs on deaths/attempts/failed-days/
haul. This is the policy's SECOND independent failed-trip
miss (0741Z: +1; this band: +5), so the tolerance question
is now settled AGAINST the policy on this metric, not
against the metric's strictness. No further band was
screened after the NO-GO — that would be chasing a cleaner
result.

Sense test: all three rescues read as a person walking home
— recorded step-by-step paths (62003: 6 steps (0,2)->(4,4)
at 0 kcal, home day 12, 984 kcal day 13; 62009: 6 steps, home
day 7, 1000 kcal day 8; 62016: 4 steps, home day 7, 2310 kcal
day 8), not a teleport. Across pilot + confirm + re-confirm,
the walk has now prevented 8/8 staying-type seeds — but it
still does not land under its bars.

Panel (§15, context only): base panel 16 cases, both-policy
panel 32 cases, 0 cached, sourcesStable, neutrality matched
both policies. Compare base-vs-both: INVALID by the
comparator's matched-policy rule (same refusal as pilot and
confirm), attached as-is. Driver tables stand as the compare.

## Wall (30d pre-seat windows — expected 0s, not regressions)

Homext legs: national / table / wins 0 on all three legs;
survived 8/8; panel wave reach 2 on 7/8 (62806 wave 1).
Stepwalk legs: national / table / wins 0 both legs; vests 0;
driver wave control 1:2/2:14, armed 1:3/2:13; panel wave max
1:6/2:9/3:1 both policies; arc 3 on all 16 both legs.
Full seat 0 / wave 5 reached 0 unchanged (Loop A lane).

## Telemetry deviation check

On the homext corpora glob: PARSE REFUSAL on every leg
(whole-file JSON parse vs one-object-per-line driver rows)
— the same refusal class as the 1030Z homeward corpora,
NOT a metric deviation. Baseline NOT rolled, no new
investigation. Stepwalk corpora live on the held branch,
not on master, so no master-glob check applies to them.

## Metric review

- Homext: the next test must screen for ARMED-policy
  homeward attempts (or a constructed 61807-shape trip),
  since natural bands keep answering the outward question
  instead of the extension question. A band where the full
  guard's homeward vetoes are 0 cannot judge the extension,
  however clean the ablation.
- Stepwalk: the next run should pre-register a DIFFERENT
  no-harm price for rescue arms (failed-trip share rises
  while haul rises, and pooled totals hide +4/+4/-3 seed
  variance) — but must NOT re-score the 62001-62016 or
  61901-61916 bands under it. The tolerance route is now
  exhausted for this policy on this metric.

## Infrastructure

- Rebase stop-at-pick quirk hit the homext rebase once;
  AGENTS.md recovery worked (clean tree + unapplied pick,
  `git rebase --continue`, 3/3 clean).
- Safe-commit index clobber hit worker commits on both arms
  and was repaired by the workers via HEAD-blob cacheinfo;
  commits verified correct. No clobber on the coordinator
  commit (verified below at merge).
- Creekdetour policy never touched sweep-compare.js, so the
  homext registry line merged with no loss.

## food-economy status

food-economy stays converging (NOT converged): the full
guard is now reproduced veto-for-veto and its homeward
extension is measured at exactly zero added prevention on
the qualifying band, and the stepping walk has now
prevented 8/8 staying-type seeds across three bands — but
no guard change has landed as game code (both guards are
policy-side instruments) and no default has flipped.
scale-onramp untouched (sibling Loop A lane).
Next blanks, in order: (1) homeward-extension test on a
band screened for armed-policy homeward attempts, or a
constructed 61807-shape trip (metric review above);
(2) stepwalk landing route under a NEXT prereg with a
different no-harm price for rescue arms — never a
re-score of 61901-61916 or 62001-62016, never a third
tolerance plea on pooled failed-trip share; (3)
Haven-breach intent (steve-call candidate) + place-in-record
design question; (4) 60501-shape roadwork-credit band
(still owed); (5) guard + return-capability pairing OR
veto-budget expedition abort, decided up front; (6) sensor
non-pantry collapse signal; (7) gatediseng confirm band
76701-76712; (8) pantry-cap-as-garden-bottleneck (74007);
(9) standing-load remainder; (10) pack-full refusal
narration; (11) HUNGER WINTER relief passivity (steve-call
candidate); (12) shelling default-flip call; (13) P3 reset
follow-ups; (14) patrol-departure narration; (15)
garden/fish/traps early path; (16) creek clearance
wood-bound; (17) rubble daytime-clearing habit; (18)
washed_out scramble narration; (19) 96-tick bridge edge;
(20) 120d window only on a new horizon-cut episode.
1135Z blank 1 (homeward extension) is now ANSWERED for this
band (NO-GO, extension adds 0); 1135Z blank 2 (stepwalk
re-confirm) is now ANSWERED (NO-GO again, tolerance route
exhausted) with the branch HELD.
Claim deleted; lock deleted.
Merged locally, pending ship (homext arm: ablation NO-GO +
diagnosis; stepwalk arm HELD, not merged).
Evidence: evidence/2026-11-02/sim-food-round-1135.md (this file).
