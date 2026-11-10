# Loop B round 1030Z — capstone-readiness census + Binding chain trace (both DIAG)

Run: fleshout-loop-b-20261110T1030Z. Axis: scale-onramp (winnability chain).
Master at run start 53185abea; at closeout c67a17564. Both arms merged
locally, pending ship. No version bump, no push, no live verification.

## Run setup

Re-point queue fully disposed before this run (arm-2 toggle CLOSED 0630Z;
flee-repair Steve-call held, branch sim-fleerepair-a; standing accumulation
answered) — per precedent, this run took the latest Loop B review's (0930Z)
next blanks in order. Blanks (1) volley-softened W=8, (2) flee-repair,
(3) sit-becomes-win, (4) sweep table contract, (6) trial-by-combat are all
Steve-call-gated — NOT taken. Blank (8) gating leg-4 recalibration is
decision-owed — NOT taken. This run took blanks (5) capstone readiness and
(7) Binding-never-fires follow-up. Both arms are DIAG ONLY, instrument-only,
zero src/js, non-overlapping files. Loop A live on scale-onramp the whole
run (claim fleshout-20261110T0827Z: wave5kill-a + answermail-a adoption arms)
— NOT touched. Orphan trees sim-wideduty-a + sim-sametick-a (food-economy)
stayed deferred — NOT touched. sim-ctraj-b locked + dirty — NOT touched.
Pre-flight: main tree clean, disk 32%, worktree-reap ran (8/16 active, no
removals).

## Arm 1 — sim-capstoneready-b: NO-GO (prereg-bound), LANDED

Commit 5c8b07624 (13 files, zero src/js), proof scripts/test-capstoneready-b.js
17/17 — re-run green by the coordinator on the branch.

The ladder capstone deeds are not one wall but three, and all three stand at
once on a fresh band (140101–140108, competent, 150d, 8 seeds, 736 daily
rows, 0 recorder errors). Per-deed ever-ready: military_tribute 0/8,
trade_charter 0/8, feast_embassy 0/8. Blocked deed-days tied exactly
736/736/736 (veterans-short / no-sealed-charter / no-bundle-feast).

- Tribute (needs 2 living non-scholar wave-4 veterans): peak living veterans
  max 1, never 2; 10 wave-4 kills across 8 seeds, 0 veterans alive at the end
  of any seed. Every veteran died within ~2–23 days of their kill. Sharpest
  pattern: 7 of the 8 non-scholar wave-4 killers died as the scholar —
  veteran supply is drained both by fast deaths in the wild and by succession
  promoting killers out of the tribute count (the scholar never counts, Leg
  3, working as designed). "More kills" alone will not move the tribute;
  killers have to live and stay non-scholar.
- Charter (needs a sealed charter + national scale): 0 sealed charters,
  scale never past regional on any seed. Doubly blocked.
- Embassy (needs feast bundle + National ladder stage): stage half MET on
  8/8 (National d28–d58); bundle half never met (0 feast-bundle flags on all
  736 rows).
- Decoupling: the ladder climbs on XP/breadth (National 8/8) while the scale
  counts links (never national). Ladder points decay as villagers die
  (140101: 71 → 43 as the roster went 11 → 0).

Primary metric (binding blocker named on ≥7/8 seeds) judged NO-GO at 0/8 —
and the metric review says the pooled-share metric was structurally
unsatisfiable (three always-blocked deeds split 1/3 each by construction).
The NO-GO stands as registered; the proposed revision (name the blocker PER
DEED) is for the next census, not a re-score of this one.

Wall (this corpus): national 0/8, table 0/8, wins 0/8, wave-4 unlock 8/8,
wave-5 unlock 1/8, median survival 87d (62–138), all 8 villages village-lost.

Evidence: evidence/2026-11-10/sim-capstoneready-b.md +
evidence/2026-11-10/sim-capstoneready-b-prereg.md; corpus
evidence/2026-11-10/perseed-capstoneready-b/ (8 files); instrument
scripts/capstoneready-b-driver.js + analyzer scripts/capstoneready-b-analyze.js.

## Arm 2 — sim-bindingtrace-b: DIAG-GO, LANDED

Commit c67a17564 (rebased from a14a58cff onto 5c8b07624; 26 files, zero
src/js), proof scripts/test-bindingtrace-b.js 26/26 — re-run green by the
coordinator pre-rebase and post-rebase.

The BELONG → Binding chain fails at exactly one place — B1: the counter
never fires. On 8/8 seeds (band 81201–81208, 8+8 pilot, leanlinkrescue +
tableseat-nowait substrate), 0 counters staged, 0 answered, 0
Haven-subordinate links formed. Before-validity held: national-ever 6/8
(bar ≥4/8). Foreign realms DO form (6/8 seeds, median day 50 — weeks before
the day-77 court), so the realm is not the binding link. Proposals score
55/71/61 — direct accepts, because "Haven is the stronger" puts every day-25
proposal over the accept line before the counter band (35–54) is ever
entered. The ladder's National-stage reward also grants its link directly via
`_formLink`, bypassing negotiation entirely. The Binding is blocked upstream
of trust, the rung clock, exile, and LEAD-masking — at the negotiation that
never happens.

G1 det-gate PASS (seed 81201, wrapped-unset == unwrapped, 90/90 days,
identical ts counters); G2 recorder neutrality PASS (8/8 seeds identical on
days/gameDays/ts/starvation; deaths 619 = 619); G3 corpus integrity PASS
(16/16 rows, engine-gated validation 8/8).

Wall (both arms identical): national ever 6/8, final 5/8; global ever 5/8;
table invited 8/8, entered 4/8, full 0/8; wins 4/8 (lesser seats only);
wave 4 8/8, wave 5 1/8; max arc 4; median survival 90d, max 108d;
starvation deaths 0; beats staged 7, all LEAD/First Court, all answered;
national lost 2 events (one re-staged). Deaths 619 total, ~95%
combat/expedition/wild.

Sense read: the First Court is played well (SYSTEM announcement, speakers
riding in by name, feast answered next morning with trust counted per fire).
The BELONG road is silent: nothing ever says Haven could belong to a foreign
realm, no counter is ever offered, no summons ever comes. A player could play
all 90 days and never learn the road exists.

Evidence: evidence/2026-11-10/sim-bindingtrace-b.md +
evidence/2026-11-10/sim-bindingtrace-b-prereg.md; corpus
evidence/2026-11-10/perseed-bindingtrace-b/ (16 rows + summary.json);
instruments scripts/policies/bindingtrace-b.js +
scripts/test-bindingtrace-b-sweep.js + scripts/test-bindingtrace-b.js;
sense replays sim-bindingtrace-b-sense*.txt (seed 81201, non-measured).

## Wall (this run's judged corpora, 24 configs)

Wins 4/24 (all lesser seats, all on the bindingtrace substrate), national
ever 6/16, table entered 4/16, full seat 0/24, wave-5 unlock 2/24, wave-5
kills 0 (capstoneready) / 0 (bindingtrace — wave-5 unlock 1/8, no kills
reported). Median survival 87–90d. The chain still binds past veterans: the
capstone deeds are three simultaneous walls, and the Binding never stages
because its negotiation never happens.

## Telemetry deviation check (coordinator run, merged master)

- Capstoneready corpus: same 3 LOUD lines as the worker found (national
  12→0, table 16→0, wins 16→0). Already investigated same-run by the worker
  and confirmed by the coordinator: REGIME artifact (the baseline's own
  `_regime` note forbids comparing pre-seat readiness substrates against the
  winseat stack) + schema absence (census files carry no `nationalEver` /
  `table` fields). Baseline NOT rolled, no investigation item.
- Bindingtrace corpus: QUIET on the coordinator run (`--sweep-rows
  --allow-recorder-corpus`: nationalEver=12/16, won=8/16, no large
  deviations). The worker's 2 LOUD lines came from an invocation without the
  sweep-row read (field-name mismatch: it read `national`/`wins` fields the
  rows don't carry). Baseline NOT rolled, no investigation item.
- No balance panel (§15 precedent: the panel takes no corpus input — it
  prints only `review_required` on this corpus, same known failure as prior
  runs); the pre-registered primaries are the identical-seed comparisons +
  the constructed rates. No compare .md fabricated.

## Infrastructure

- A runtime restart interrupted the first worktree-registration call after
  the first tree registered: the second tree (sim-bindingtrace-b) was left
  half-checked-out (locked "initializing", files missing) with no registry
  entry. Recovered without touching the first tree: unlocked, removed the
  half tree + branch (0 unique commits, verified), re-registered cleanly.
  Both trees verified registered + clean + heartbeats fresh before spawning.
- Safe-commit index clobber hit both worker commits (capstoneready 13 files,
  bindingtrace 26 files, staged-as-deleted) — repaired via the HEAD-blob pipe
  each time, commits verified correct by blob hash. No clobber on the
  coordinator evidence commit.
- Coordinator proof re-runs: capstoneready 17/17 green; bindingtrace 26/26
  green pre-rebase and post-rebase. The bindingtrace sweep re-run was killed
  by the coordinator after 10+ min under load (load avg ~9, Loop A running
  concurrently) with no output — the worker's green sweep run on the
  identical branch content stands, and the 26-check proof is the re-verified
  gate. Recorded as not-re-run, not green.
- `node scripts/check.js --quick` NOT re-run by the coordinator on merged
  master: zero src/js in both landings (evidence + instrument scripts only);
  the capstoneready worker's attempt produced zero output in 5.5 min and was
  killed as stuck — treat as not-run, not green. Precedent (2330Z, 0429Z)
  holds: the workers' proof tests are the verification for zero-src/js
  landings.
- Master did not move under the run (53185abea at start, at both merges).
  Loop A's 0827Z claim stayed live the whole run; its tree heartbeats were
  57 min (wave5kill-a) / 137 min (answermail-a) stale at the last check —
  NOT touched, no recovery attempted; the next run checks A's claim before
  taking any winnability blank.

## Findings filed (sim-findings.md)

- LADDER NATIONAL REWARD BYPASSES COURTSHIP (new open, bindingtrace-b):
  the five-track ladder's National-stage reward grants a link via `_formLink`
  directly — no propose, no judge, no counter possible — always
  Haven-primary; ladder "National" can arrive day 16 while scale-national
  cannot stage before day 77. Whether the reward should court, cost, or wait
  for scale-national is a Steve/coordinator call.
- Capstoneready-b appended none (the veteran-succession drain and
  charter/scale absence are the arm's own findings, in its evidence).

## Convergence state

scale-onramp stays converging (NOT converged): the full seat's last mile is
now decomposed on both halves — the capstone deeds are three simultaneous
walls (tribute nearest at peak 1/2 living veterans, charter farthest at
0/0 ingredients, embassy missing only the feast bundle) and the Binding never
stages because its counter never fires (direct accepts at 55/71/61 before
the counter band, plus the ladder reward bypassing negotiation). Wins are
still only lesser seats on the doorwalk substrate, national still 0 on the
competent census, wave-5 kills still 0. food-economy stays converging
(untouched; sibling Loop A live on winnability).
Claim deleted; lock deleted.

Next blanks, in order: (1) volley-softened finish at W=8 (different lever,
own prereg) — gated on the two Steve-calls (wound-mill coverage + tail width
W); (2) flee-repair build (Loop B queue item 2, Steve call — still held,
branch sim-fleerepair-a); (3) sit-becomes-win (Steve-call); (4) sweep table
contract question (Steve-call); (5) trial-by-combat staging (Steve-call);
(6) capstone readiness RE-MEASURE after Loop A's wave5kill (tribute supply)
and answermail (charter seasoning) land — this run is their baseline, with
the per-deed blocker revision from the capstoneready metric review; (7)
Binding counter question — the counter band vs direct-accept ordering, and
the ladder-reward bypass (backlog) — needs a design decision before any
build; (8) gating leg-4 recalibration (decision owed). NOTE for the next
run: Loop A still holds the wave-5 kill lever and answer-the-mail (claim
fleshout-20261110T0827Z, live at this closeout) — check its claim before
taking any winnability blank.
