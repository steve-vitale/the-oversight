# sim-food-economy-round-1934-b — coordinator evidence (finalized at closeout)

Run: oversight-flesh-out-loop-b, run_id fleshout-loop-b-20261028T1934Z,
axis food-economy (converging). Loop A live on scale-onramp for the whole
run (claim fleshout-20261029T0002Z, arms sim-staying-a + sim-returns-a,
NOT touched). Main tree clean at run start; disk 20%; worktree-reap run
(active trees only, fixall-map + journey2-crisis left alone with
uncommitted changes, as the reaper requires).

Arms taken (the 2255Z round's named next blanks, in order):
1. sim-nighttravel-bank-b — NIGHTTRAVEL 24+ QUALIFIER BANK (adopt held
   branch sim-nighttravel-b).
2. sim-creekpath-armb-b — CREEKPATH ARM B, route-around-aware trip returns.

## Arm 2 — sim-creekpath-armb-b: GO, LANDED (merged locally, pending ship)

Worker branch sim-creekpath-armb-b: prereg 0fc1b2ac8, code+tools
acb650421, evidence+corpora 927de35c2 (after rebase onto c9ef56f8c;
proof PROOF-GREEN post-rebase, gate-off trace reproduces the 2255Z
before-corpus exactly on 10757). Merged --ff-only into master, ancestor
verified, tree released done-merged, branch deleted, main tree clean.
Gate defaults OFF in the policy file (COMPETENT_TRIPHOME_ROUTE_AROUND);
the measured effect is with the gate on — landing is a default-OFF
instrument + measurement, NOT a game change. No push, no bump, no live
verification (ship loop owns those).

Change (policy-side, scripts/policies/competent.js ONLY, no src/js):
walkHome() helper + return-leg-only detour flag; direct travelTo(haven)
home-returns replaced in forageTripSeedFirst (all three return sites)
and feastFightRoad (patrol return). Deliberately left direct: catch
fallback self-travel, all outbound hops, stoneRun/flee walkTo home walks
(already hop-by-hop; follow-up candidate).

Verdict vs prereg (thief-grant substrate GRANT_THIEF=1 named explicitly;
30d; death-aware; pooled stranded evenings + per-seed strand guard):
- PILOT 10750-10757: GO. 9 -> 3, bar <= 4; strand guard holds every seed;
  G1 0 -> 0; G2 no detour-day death; G3 by construction.
- CONFIRM 10758-10773: GO. 14 -> 4, bar <= 7 (71% cut); strand guard
  holds every seed; G1 8 -> 7 (player 2 -> 1); G2 adjudicated HOLD (below);
  G3 by construction.
- POOLED: 23 -> 7 (70% cut). Sensitivity excl no-move days: 5 -> 2.
- Attribution (diagnostic gate-off leg, pilot): modified code with gate
  UNSET reproduces the before leg exactly — hop-by-hop returns alone fix
  nothing; the detour is the entire effect.

G2 ADJUDICATION (coordinator accepts the worker's adjudication, disclosed
here, not hidden): the analyzer's naive detector fired once (confirm
10772, player starvation death day 11, detour day 10). Investigated: the
death is IDENTICAL in the before leg (same day, same cause, same kcal
path 588 -> 106 -> death) — a death that happens with or without the
detour cannot be attributed to the detour; the day-10 detour served an
away-origin return, not a home return; node travel is free (TIME-ECONOMY).
The prereg's G2 is attributability ("no death attributable to the
crossing itself"), and the before leg supplies the counterfactual. A
strict-literal coincidence reading would say VIOLATION -> NO-GO; the
coordinator rejects that reading because a detector that fires on
identical outcomes in both legs is a broken instrument, not a safety
signal. Metric review carries the detector revision (count only deaths
on/after detour days that do NOT also occur in the before leg same day
same cause) and the detour-day definition revision (record walkHome
TARGET so routed-home vs routed-away returns are never conflated).

Sense-testing: PASS on meaning. 10757 day 25 and 10767 day 4 detours read
as a person walking home around a creek, step by step, with the honest
refusal line spoken first. Debug-transcript double-printing is the
instrument's capture, not a narration bug.

Residual mechanism (why 10752 + 10762 still strand): the failed return
was not a covered trip return (0 detour steps despite a BFS route), and
continuation days are no-move days with no trip attempted. The policy has
NO standing "go home" rule. That is Arm C's work (below), NOT built here.

Village assessment (plain words): the village is healthy in these runs —
every pilot seed survived 30 days, confirm median 30 days, wave-2 kills
throughout. The blank filled is narrow: a trip home that tried one
blocked shortcut and gave up. Now it tries the other way round, and the
week-long creek strands are gone — the index case (10757, six nights)
and the eight-night wetland strand (10767) both break on the first
detoured return. What remains is a missing habit, not a pathing failure:
when nothing calls for a trip, an away villager just stays away — even
starving, even with a clear hop home.

Wall (30d horizon — scale metrics NOT MEASURED here, not zero): median
survival 30d both bands both legs; wave reach max 2 (pilot) / 3 (confirm,
diverged 10772); starvation deaths 8 -> 7 (confirm); player starvation
deaths 2 -> 1. Trajectory divergence disclosed: 10767 deaths 28 -> 10,
10770 14 -> 6 (player starvation deaths eliminated); 10772 10 -> 17 with
a new day-28 successor death 18 days after the detour (divergence noise,
not a guard hit).

Next arm (exact; design, NOT built here) — ARM C, the standing go-home
rule: when the player starts the day away from haven and no trip fires
that day, walk home (walkHome, detour flag on) as a standing step; and/or
anchor trip origins to haven when the player starts away; and/or extend
the detour flag to stoneRun's walkTo home walks. Metric: pooled stranded
evenings on the SAME bands + substrate, bar after <= 50% of the Arm B
after-leg (the new baseline); strand guard unchanged; no-move refused
evenings as a PRIMARY breakout; G2 with the revised counterfactual
counting above.

## Arm 1 — sim-nighttravel-bank-b: HELD (bank committed, judged runs unrun)

Worker branch sim-nighttravel-bank-b, HELD unmerged with its worktree
registered and heartbeated (fresh at closeout) — the 2255Z precedent for
an insufficient-data/measurement arm. Commits on the branch: instrument
adoption 3efb6f6e8 (verbatim from held sim-nighttravel-b, no src/js, no
default flip), prereg ffa772515 (wider 11000-11511 scan targeting 24+
qualifiers, pilot 8 + extension 8 + confirm rest, gates explicit, GO
lands default-OFF instrument only), scan 0c8409f69.

Scan result (committed, proof B1-B8 green): 448 control seeds 11000-11447,
36 qualifiers (8.0%), stop rule >= 32 met at block 14. Bands declared in
the scan commit: pilot 8 + extension 8 + confirm 20. The 24+ bank blank
from 2255Z is CLOSED as a bank — what remains is the staged judged verdict
on it, which this run did not reach.

Why no judged verdict: the pilot chain (01:45 UTC, pilot seeds
11149,11031,11307,11390,11429,11439,11322,11360, control leg first)
WEDGED — 25:50 elapsed with 0:19 CPU, all 8 control output files 0 bytes.
The coordinator killed the wedged chain at ~02:10 (the worker's own
processes only, command-line verified; zero valid output lost — the files
were 0 bytes). The worker's post-kill diagnosis did not produce a
restarted judged leg inside this run's window, and no judged data is
claimed. Root cause of the wedge is NOT established (not the EPERM flap:
a flap fails writes fast, it does not park a process at zero CPU for
20 minutes) — the next run must reproduce the wedge on a single pilot
seed before re-running the full pilot chain, and must not assume the
driver is healthy because the scan leg ran clean.

Container EPERM flap (same class as 2026-10-23/24): observed on .git
index writes during this run (a read-only git status failed writing
index.lock, ~01:45). No ref surgery was performed anywhere; workers were
told to wait out failures, never force. The flap is NOT blamed for the
pilot wedge (see above).

Next arm (exact): adopt held branch sim-nighttravel-bank-b (bank
committed as 0c8409f69); single-seed wedge repro on pilot seed 11149
first; then pilot 8 + extension 8 + confirm 20 per the bank prereg, same
gates (primary M1r >= 0.50, min-n >= 8, G1/G2/G3-fixed). Do NOT re-scan
11000-11447 — the bank is committed; a wider scan only if the bank's
confirm band proves short.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-10-28/sim-creekpath-armb-b-corpus-after-confirm/*.json'
--metrics national,table,wins,exiled` on the landed Arm B after-confirm
corpus (16 files): 3 LOUD lines (national 12 -> 0, table 16 -> 0, wins
16 -> 0), NO exiled LOUD line. All three are the KNOWN field-shape +
regime artifact class: a 30-day pre-seat substrate cannot reach
national/table/wins, and per-seed rows carry nationalEver/won rather
than top-level national/wins paths — the same class as every 2255Z and
earlier 30-day run. Baseline NOT rolled, no investigation item.

## Metric review

- No metric was re-scored mid-run on either arm. Creekpath G2 is
  adjudicated (counterfactual), not re-scored — see above.
- G2 detector revision + detour-day definition revision (creekpath,
  carried to Arm C's prereg).
- Panel limitation (same as 2255Z): no balance-panel compare .md —
  the panel's contract metrics do not include stranded evenings;
  panel-style guard metrics (deaths, starvation, wave reach) are
  reported from the corpora instead.

## Infrastructure (loud)

- Safe-commit index clobber: NOT reported on this run's worker commits
  (creekpath worker evidence + branch state clean; nighttravel scan
  commit verified in branch log). The coordinator evidence commit below
  was verified via HEAD after landing, per the standing lesson.
- EPERM flap: observed on .git index writes (this run, ~01:45, read-only
  git status failed writing index.lock); no ref surgery performed, no
  force used anywhere. The flap is NOT the pilot wedge's cause (a flap
  fails fast; the wedge parked at zero CPU for 20 minutes).
- Wedged pilot chain: killed by coordinator at ~02:10 (worker's own
  processes only, command line verified, zero valid output lost).
- Master moved under the run (fix-all succseam c0b0540c4, journey-landing
  r67 c9ef56f8c); creekpath branch rebased clean in its own worktree,
  proof re-run green, then merged. Origin/master verified as an ancestor
  of local master at closeout (cb30d8f98 ship bump; local ahead with
  unpushed work, as expected — ship loop owns pushes).
- check.js --quick NOT re-run: zero src/js in the landed arm (policy-side
  only, gate default OFF); standing 280/7 pre-existing profile recorded
  by sibling runs.
- Loop A untouched throughout (scale-onramp claim + trees never opened).

## Findings backlog

- sim-findings.md line for creekpath Arm B (2026-10-28 blocked-path entry):
  marked FIXED — Arm B GO pilot+confirm, merged 927de35c2.
- sim-findings.md nighttravel bank entry (2026-10-28 screened-run entry):
  marked FIXED as a bank — 36 qualifiers committed 0c8409f69 on held
  branch sim-nighttravel-bank-b; judged verdict remains open.
- Appended [open] 2026-10-29: standing go-home rule missing (Arm C
  design) and nighttravel pilot chain wedge unexplained (single-seed
  repro required before the next pilot run).

food-economy stays converging (NOT converged): the blocked-path return
fix is proven and landed as a default-OFF instrument, but the standing
go-home blank (Arm C) and the nighttravel evening lever remain open.
scale-onramp stays converging (untouched; sibling loop A lane).
Claim deleted; lock deleted.
Evidence: evidence/2026-10-29/sim-food-economy-round-1934-b.md
(coordinator, this file) + sim-creekpath-armb-b.md (on master) +
sim-nighttravel-bank-b files (held branch sim-nighttravel-bank-b).
Closeout completed by main-session recovery 2026-10-29 ~03:20 UTC:
evidence committed via branch + --ff-only merge, stale 2026-10-28
self-reference corrected to 2026-10-29, claim retired to .DEAD,
fleshout-loop-b.lock deleted, nighttravel-bank worktree heartbeat
refreshed. Wedge cause stands NOT established per this file (the
handoff summary's EPERM-driver-flush claim is not this file's record
and was not adopted).
