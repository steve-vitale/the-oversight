# sim-scale-onramp-round-1121 — coordinator evidence (axis scale-onramp)

Run: flesh-out loop A, run fleshout-20261027T1121Z. Axis scale-onramp
(topmost non-converged axis, not named in any live claim at run start).
Both arms DIAG/MEASUREMENT ONLY: zero src/js changes, zero default
flips, no game lever, no lever proposal. No [needs-eyes] flag applies
(measurement only — no feel, combat, or UI change). Merged locally,
pending ship (the batch ship job owns version bumps, pushes, and live
verification).

## Run-start closeout (stale-claim recovery, NOT a stale-lock recovery)

No lock file existed at run start. The sibling loop B claim
fleshout-loop-b-20261027T0945Z.json was still live, but its trees'
heartbeats were 09:49Z — ~90 minutes stale at 11:21Z, past the 15-minute
guard — and with no lock file held, the B coordinator was dead by the
guard's own test. The claim was retired to .DEAD (with a .DEAD.note);
B's trees and branches were NOT touched, NOT released, NOT landed by
this run. B's own round then landed independently mid-run as
6995ba7e6 (raidcallers GO + raidday100 DIAG-NO-GO coordinator evidence)
— that landing is B's work, not this run's, and this run's arms were
rebased onto it with zero file overlap. B's retired claim is therefore
a record of a dead coordinator, not a claim on the landed work.

Preflight: main tree clean (0 files), disk 28%. Master moved twice
under the run: 2097f7f04 → 024261db6 (journey-scale r44 landing, during
preflight) → 6995ba7e6 (B round landing, mid-run). Both arms rebased
clean onto the moved master with proofs green post-rebase before merge.
Safe-commit index clobber hit the worker commits (known class, repaired
via HEAD-blob cacheinfo by the workers, commits verified correct).
check.js --quick NOT re-run: zero src/js in both arms; the arm proofs
are the attributable verification (same precedent as the 0755Z/0835Z
rounds).

## Arms (each its own commits, own proof, own evidence section)

### Arm 1 — sim-surgeconfirm-a: INCONCLUSIVE (fallbacks stay CONTRIBUTES)

Commits: prereg 473248d2f (rebased from d0bd3a6c9), evidence +
instruments + corpus 3648c723d (rebased from f4653dcf6). Proof
scripts/test-surgeconfirm-a.js ALL CHECKS PASS (post-rebase and on
merged master).

Question (from the arrivalsurge UNSETTLED section, run
fleshout-loop-a-20261027T0840Z): does the fallback-only band rerun
promote staffing fallbacks from CONTRIBUTES to EXPLAINS? Band:
seeds 73671–73678, tableseat-nowait policy, 180d death-aware horizon,
same five recorders as the repin plus standing/readiness/feast/staffed
recorders. Control = current master as-is; fallback-off = current
master with ONLY the 908ad0f12 + 8a7540534 fallback hunks reverted, as
a separate policy variant file (scripts/policies/competent.js never
edited; the variant is byte-identical to the pre-fallback competent.js
blob, proven by diff). Premise verified before sweeping: the policy
chain tableseat-nowait → leanlinkrescue → competent.daily →
counterPlay executes, and fallbacks fire on control (73671: cook 64,
fish 284, cook fallbacks 2, fish fallbacks 12).

Results, judged ONLY against the prereg's binding promotion rule:

- Fallback-off arrivals 17 (tile-entry 15 + scripted-titan 2) vs
  control 31. Count leg for EXPLAINS (≤ 18) PASSES; DEMOTE bar
  (≥ 24) NOT met.
- Median first-standing-100 day: fallback-off 68 vs control 66.
  Timing leg for EXPLAINS (≥ control + 5 = 71) FAILS.
- Verdict: INCONCLUSIVE — neither promoted nor demoted, never
  re-scored. The new hard fact: taking the fallbacks away cut arrivals
  nearly in half but did NOT push standing-100 later, so
  standing-100 timing is ruled OUT as the arrival channel. The drop
  concentrates in two flipped village stories (73675: 13 → 0, never
  reaches standing 100 off; 73677: 4 → 0, wins early at day 90),
  while 73671 actually rises 13 → 14.
- Control reproduction: control reproduces the repin table on every
  trajectory field and on arrivals (31 = 28 + 3; wins 4/8,
  national-ever 7/8, national-final 5/8, entered 4/8, wave-4 5/8,
  wave-5 0/8, median 130d, deaths 284, starvation 2). The one
  exception is the transient table-invited flag (2/8 vs repin 5/8),
  proven a snap-timing artifact, not base movement: the worker's
  wrapper snaps after base.daily while the repin's snapped before it,
  and on all three differing seeds the control row still shows
  entered = 1 with seat records byte-identical to the repin. The
  verdict is judged within-run (same wrapper both arms) regardless.
- Staffed-count caution (from the arm evidence): under the old code,
  staffed counters count refusals as staffed, so cross-arm staffed
  totals are not comparable; the verdict rests on arrivals +
  standing timing, as the rule specifies.
- Loud failure found and fixed mid-run (disclosed in the arm
  evidence, not hidden): the first fallback-off sweep ran an idle
  policy (variant export destructured under a renamed name, wrapped
  into a no-op; cook = fish = 0 on all 8 seeds). Those rows were
  deleted uncommitted, never counted. Fix: the sweep aliases the
  real export and throws on a missing base. Lesson recorded:
  zero-everywhere staffed counters are the idle-policy signature.
- Social family (D) third arm NOT run — the arrivalsurge evidence
  sequences it after this arm reports; that sequencing is the next
  arm's decision, not this run's.

Evidence: evidence/2026-10-27/sim-surgeconfirm-a.md + prereg +
corpus evidence/2026-10-27/perseed-surgeconfirm-a/ (16 rows + summary).

### Arm 2 — sim-tbstarts-a: DIAG-GO (the w4melt gap is classified)

Commits: prereg e4969e8ac, instruments + corpus 6a8711293, evidence
f59443414, evidence-hash fill f98780d52 (all rebased from
5ae68a0c4/97f64c1b/716b6c9b/9c188d3d). Proof
scripts/test-tbstarts-a.js 10/10 PASS (post-rebase and on merged
master).

Question (from the w4melt band + sim-findings UNSETTLED TB STARTS
line): what are the 33 starts on 73675 with no tbEnd row (61 starts /
28 ends)? The w4melt verdict itself was NOT re-judged. Method: the
existing w4melt corpus could not split the starts, so the band was
reswept with a new tbstarts-diag recorder (v2 adds exactly two
discriminators: the titan outcome-log diff per call and the
active-start call index on end/dissolve rows; classes and thresholds
never changed; v2 reproduces v1's 61/28 counts while partitioning
them). Armed-vs-plain EXACT on 8/8 seeds; plain-vs-repin control
EXACT too (same table as Arm 1's control).

Partition — 73675 (resweep count = w4melt count: 61 starts / 28 ends):

- 33 TITAN-GATE-REFUSED — a raid brings the Herald (a titan) to the
  village wall; nobody meets it, so it lingers and gorges; on later
  days it walks onto the scholar's tile, and the game refuses the
  fight before it starts because a titan cannot be faced alone — the
  muster gate needs 10 allied blades and the village has 0. The
  titans.js wrapper returns null before core startCombat runs; every
  refusal carries a state.titans.outcomes entry (herald / refused /
  muster 0-of-10) and a muster snapshot. Call stack on all 33:
  game.js 'hungry' step-onto-tile via the action-clock batch.
- 27 SETTLED (normal starts with a tbEnd row for the same fight id).
- 1 INSTANT-SETTLED (murkcap d112: started and routed inside its own
  startCombat call; it only looked unsettled in a post-call read
  because tbEnd's finally had already cleared the fight).
- 0 core live-fight refusals, 0 dissolves, 0 unsettled, 0
  unsettled-null, 0 unmatched ends. Arithmetic closes both ways:
  33 + 27 + 1 = 61 starts; 27 + 1 = 28 ends.

Band-wide (73671–73678): 188 starts / 156 ends — 143 settled +
12 instant-settled + 33 titan-refused + 0 elsewhere; 1 unmatched END
(73671 d94 'lost' alien-player direct-build fight — an unmatched end,
not an unsettled start). Titan refusals are 73675-only.

Cluster days TESTED: d113–118 follows the d111 raid, d126–127
follows the d118 re-draft, d152 follows the d148 re-draft
(lingerSince 111/118/148; Herald HP 525/350/175 = the three 25% raid
tolls). Only d118 is itself a raid day, and its refusals are the
re-drafted Herald, not a raid-day effect. No siege-day claim (no named
siege event exists in the corpus vocabulary). No cross-seed shared
cause claimed.

Impact (from rows): all 5 w4melt melt fights are SETTLED starts in
this corpus (73671 reunion d167, 73675 eater d145, 73675 eulogy d145,
73675 suburb d167, 73677 suburb d123 — all 'lost'). No melt
settlement, headline, or wave-4 kill count is touched by the
refusals. The Herald is alive at 73675's end (hp 175).

Sense (non-measured replay, wording only): the d113–118 cluster
replay shows the spoken refusal line 2× d113, 1× d114, 8× d115,
4× d116, 3× d118, 0× d117 — matching the census days, plus nightly
gorge lines. The refusal fiction IS the explanation here, unlike the
silent w4melt melts.

Side correction to a w4melt side-note (not its verdict): 73671's
single unmatched end in this corpus is a d94 alien direct-build
fight, identified from tbstarts rows; the d179 fights both have start
rows here.

Evidence: evidence/2026-10-27/sim-tbstarts-a.md + prereg + corpus
evidence/2026-10-27/perseed-tbstarts-a/ (16 rows + summary + sense).

## Wall numbers (shared repin band, both arms' controls agree)

National-ever 7/8, national-final 5/8, table invited 5/8 (repin;
surgeconfirm's wrapper artifact 2/8 disclosed above), entered 4/8,
wins 4/8 (lesser seat only), wave-4 5/8, wave-5 0/8, median survival
130d, deaths 284, starvation 2, wave-4 kills 2. Full seat unreached;
wins still come only through default-OFF instruments and the lesser
seat. The STANDING DIRECTIVE stands: national is reached reliably
only by policy instruments, the full seat is unreached, wave 5 is 0.
The directive lifts only when the tracker records scale-onramp as
converged on measured evidence — not this run.

## Village assessment (plain words)

Two villages tell the two stories. On the surge band, taking the
cooks-and-fishers fallback away did not make villages reach standing
later — it flipped two villages' whole stories: one never got its
standing at all, one won early and stopped meeting monsters, while a
third met one MORE monster and died sooner fighting. The surge is
not a clock problem; it is a which-villages-live-long-enough problem,
and the fallback moves that, not the standing date. On the melt band,
the "unsettled fights" were never fights: a giant Herald kept walking
up to the village wall, the village kept saying "we cannot face that
alone" out loud, and the game kept a receipt every time. The
mystery gap is closed, and it closes in the fiction's favor — the
refusal is spoken, not silent.

## Villagers act like people (sense check)

Tbstarts sense: the Herald refusals are voiced in-fiction every time
(the spoken refusal line + nightly gorge lines), so a player watching
would understand why nothing happens — the opposite of the silent
melt case. Surgeconfirm sense (color only): fallback-off 73671's
replay ends inside a losing Eulogy fight on day 164 — a village
that met the Draft earlier (open day 90 vs 112), fought more, and
died sooner, even as the band total fell. No robotic, static, or
repeated dialogue was newly flagged by either arm; the table-talk
situation-blindness lines in the backlog stand untouched (they need
Steve's ruling before any voice change).

## Metric review (§14 — binding, no mid-run re-scores)

Arm 1 judged exactly against its prereg's promotion rule:
EXPLAINS needed arrivals ≤ 18 AND median standing-100 ≥ control + 5;
the count passed (17) and the timing failed (68 vs needed 71), so
INCONCLUSIVE is the verdict — not a miss to re-score, and not a
near-miss to round up. Arm 2 judged exactly against its prereg's
DIAG-GO rule: every unsettled start classified (33/33), clusters
tested, impact stated — DIAG-GO. No metric was revised mid-run. One
method note, not a revision: the balanced-panel compare (§15) was
NOT run as a panel artifact — these arms are DIAG measurements on
the w4funnel band, not balanced-panel cases, and forcing the panel
tool over non-panel corpora would produce a meaningless compare.
The judge in both arms is the prereg's threshold, applied to the
arm validators' re-derivations (surgeconfirm proof re-derives the
verdict; tbstarts validator re-derives the partition 10/10).

## Telemetry deviation check

Ran node scripts/telemetry-check.js against
hidden_files/telemetry-baselines/scale-wall.json for both new corpora
(--metrics national,table,wins,exiled). LOUD lines: surgeconfirm —
national 12 → 0, table 16 → 6, wins 16 → 0 (n = 17 files);
tbstarts — national 12 → 0, wins 16 → 0 (n = 17 files). All are the
KNOWN ingestion artifacts documented by every prior round (file-count
/ top-level paths vs band-level nationalEver/won fields; the WINSEAT
baseline's own regime note forbids this comparison). No exiled LOUD
line. Baseline NOT rolled; no new investigation opened.

## Findings backlog updates (this run only)

- Arrivalsurge line (was: confirming measurement "remains a future
  arm"): updated — the confirming measurement is now RUN, verdict
  INCONCLUSIVE, fallbacks stay CONTRIBUTES, standing-100 timing
  ruled out as the arrival channel; social-family (D) separation
  remains the future arm.
- Unsettled-TB-starts line: [open] → [fixed by this run's
  sim-tbstarts-a] — 33 titan-gate refusals, zero unclassified.
- Sibling B lines (raidcallers fixed, raidday100 screen open) were
  updated by B's own round; NOT touched here.

## Next blanks, in order

1. Social-family (D) separation arm — the arrivalsurge evidence
   sequences it after the fallback arm reports; it has now reported
   INCONCLUSIVE, so a D-only band (social visibility without the
   fallbacks, or vice versa) is the next attribution step. The
   prereg must fix whether D is measured against control or against
   fallback-off.
2. Haven pile-up intended-behavior — steve-call if it touches the
   restore rule or narration (carried, not claimed).
3. Whether waiting matters on bands where the seat stays unready
   longer (carried, not claimed).
4. Micro-blank from tbstarts: 73671 d94 unmatched end (alien-player
   direct-build fight) — an unmatched end, not a start; worth one
   classification pass if an arm ever sweeps alien direct-build
   fights, not a lever.

## Convergence state

scale-onramp stays CONVERGING (NOT converged): the surge attribution
is narrowed (standing timing ruled out, fallback count effect
confirmed in direction but not promoted) and the TB-starts gap is
closed, but wave 5 is still 0/8, the full seat is still unreached,
and wins still come only through default-OFF instruments and the
lesser seat. food-economy stays converging (untouched; sibling loop
B). Rotation left at 3. Claim deleted; lock deleted.

Evidence files: evidence/2026-10-27/sim-scale-onramp-round-1121.md
(this file) + sim-surgeconfirm-a.md + prereg +
perseed-surgeconfirm-a/ + sim-tbstarts-a.md + prereg +
perseed-tbstarts-a/. Merged locally, pending ship.
