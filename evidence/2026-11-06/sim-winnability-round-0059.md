# Loop A adoption/landing round 0059Z — dead 2256Z run adopted, 3 arms LANDED + drive 64-seed NO-GO

Run: `fleshout-20261107T0059Z`, axis scale-onramp / winnability chain
(Steve 2026-11-03 re-point). ADOPTION run for the dead 2256Z Loop A run
(coordinator timed out; main session deleted its lock + claim 01:03Z
after verifying all four workers terminal — no stale-lock recovery by
this run). Loop B ran its own adoption/landing round 0130Z concurrently
(armorcap + routstall LANDED, bypass KILLED, evidence e35ffc890) — NOT
touched; its landings moved master under this run, see Infrastructure.
Master moved under this run: 82e550626 (ship bump) → roleform
79137ca39 → grind eabf00dba → armorcap 87fe58aa5 → routstall aba30299d
→ journey-deepening r110 b5eb5b94e → bypass 44f8d3394 → Loop B
evidence e35ffc890 → tbend 1700ea5fc (this run's final tip).

## Arm 1 — sim-roleform-a: LANDED 79137ca39 (GO with caveats)

Role-formation census across all five tracks, 8 seeds 99891–99898,
80d, competent verbatim; measurement only, no src/js. Proof
`test-roleform-20261106.js` 10/10 green on the rebased tip.
Verdict GO per the prereg rule (5/5 tracks show signal, 4 distinct
roles) — carried by the track/deed system, not by practice: practice
moves competence nowhere on the census (the 2103Z drive-practice arm
measures the haven-labor half only). Caveats in the evidence: the
verdict rule conflates practice-movement with track levels; Strange
has no feeding work by design. One open finding: grave_robber in a
forager's skill set reads off-theme (already in sim-findings.md).
Wall (census): national 0/8, table 0/8, wins 0/8, wave-4 kills 0,
wave-5 0, median 81d.

## Arm 2 — sim-grind-a: LANDED eabf00dba (GO)

41-HP grind characterization, band 99641–99648, competent, 150d.
Proof `test-grind-20261106.js` 54/54 green on the rebased tip.
Evidence + 8-file corpus were left uncommitted by the dead run;
committed here as af6322f60 (safe-commit index clobber hit — repaired
via HEAD-blob cacheinfo, hashes verified byte-identical first).
Verdict GO: 128 wave-4 field fights, 1 kill — a contact finish on a
beast the palisade wall had delivered to 1 HP. Field damage median
41/fight over median 3 rounds; 28% of meetings deal 0 damage; no
field fight that reached rounds ever killed a wave-4 beast (0/127).
The wound-mill ruling IS wired for field fights but its window is
~12 damage — it only collects the 1-HP wall floor. Twoblow fired 0×
on wave 4 (14× on wave 3). Every inter-fight gap between re-meetings
of the same beast (24/24) is exactly one palisade wall hit (25% of
max HP, floored at 1 HP). Named lever (not built): FINISHER-SIZE —
a committed finish for beasts met below their break line, sizing
target 41 HP dead in the meeting (~3 rounds is the honest price),
125 HP stays a TB job. Guardrail recorded in the evidence: if the
sizing touches rounds-capping or armor-ignoring hits, that half
belongs to Loop B's bypass family — do not build it here. Also in
the evidence: Eulogy dismissal leaves the beast at full HP (11/12
wave-4 field mFlees; design question, already in sim-findings.md)
and 100+ round TB stalls, second sighting (99642 Algorithm 121
rounds, 0 damage both sides).
Wall (grind band): 1/8 survived to 150d (99641: maxWave 5, standing
400, W4 kills 7, W5 kills 2, 2 living W4 killers, 22 R5-ready days);
the other 7 lost at 71–145d, standing pinned 199/175, W4 kills
1–3, W5 0.

## Arm 3 — sim-tbend-a: LANDED 1700ea5fc (GO, fix proven)

51002 kill-logged-but-never-closed. Pinned site (H1 confirmed, H2/H3
refuted): the next arena bout opens INSIDE the won fight's `tbEnd`,
before the killing strike returns — `src/js/game.js:45879` tbEnd →
arena hook `:46332–46338` (`_contestArenaAfter` at `:46337`) →
`src/js/contests.js:4767` `_contestArenaAfter` → `:4779`
`startCombat(arc.waves[arc.waveIdx])`. The nested startCombat
stale-closed the won Strike trace as 'unfinished', the tbEnd
wrapper's close read the live (null/new) trace instead of the
captured one, and the stageally post-block unconditionally nulled
`_currentTb`, clobbering the chained bout's row pointer. No exception
anywhere (0 throws in 324 traced events). Fix is scripts-only, zero
src/js (over-aware close in the startCombat wrapper,
captured-trace-only close in the tbEnd wrapper, identity-guarded
pointer clear in stageally) — the arena chain is intended engine
behavior; only the recorders were wrong. Proof
`test-tbend-20261106.js` 18/18 green on the rebased tip; pre-fix
control 15/3 (exactly the 51002 shape); regressions
`test-pyrrhic-20261106.js` 52/52 and
`test-fightinterior-20261106.js` 33/33 green on the rebased tip.
Correction recorded in the evidence (read before citing): the prior
round's "anchor replay byte-identical to the corpus" claim does NOT
reproduce on this tip — both fixed and pre-fix 88-day repros give
days 88 / survived / 81 killsLive / 1 trace vs the corpus's
village-lost / 53 kills / 4 traces. Base drift since the corpus was
generated, not the fix. The GO rests on the focused test, not the
anchor replay. Neutrality proven the other way: fixed vs pre-fix
repros agree on all game state; the single difference is recording —
the day-54 `ad_break` row now records `routed`/50 rounds instead of
`null`. `check.js --quick` was started but killed after ~10 min with
no output while sibling drive64 panels saturated the box (load avg
17) — not a failure, not a pass; the prereg's required regressions
are the two named scripts, both green. This arm is scripts-only, so
no full check was re-run by the coordinator either.

## Arm 4 — sim-drive64-a: NO-GO (64-seed drive confirm — NOT merged)

Branch `sim-drive64-measure`, tip ad0788cdc, drive build pinned at
56a7c720d. Measurement only, no src/js change on this branch. The
prior worker was cancelled with one valid shard (ON 99053–99068);
this session ran the remaining 7 shards and merged. Proof
`test-drive64-20261106.js` 29 checks green. Determinism gate PASS
exact: the 16-seed subset reproduced the builder's pooled numbers
exactly on both arms (OFF 5 kills / 0 pairs / fallen 259 / alive
46; ON 9 / 2 / 262 / 32 / told 293 / seeks 98 / scoutSeen 7 /
scoutEmpty 67).
Primary (prereg bars): pooled 64 pairs ON 4 vs OFF 0 — count bar
≥5 MISSED (margin 4 ≥ 3 met); fresh-48 pairs ON 2 vs OFF 0 —
count bar ≥3 MISSED (margin 2 ≥ 2 met). Timing median gap 1d ≤ 14d
PASS. Guards: G1 median survival ON 93 vs OFF 100 = 93% ≥ 85%
PASS; G2 deaths ON 1007 ≤ 115% of OFF 1018 PASS. Overall GO
required primary + timing + both guards → **NO-GO on weak effect,
not on cost**. The survival dip the 16-seed screen hinted at did
NOT reproduce (mean days 97.7 → 92.5, deaths flat, alive-end 156 =
156). The screen was a hot draw: pair rate regressed 2/16 (12.5%)
→ 4/64 (6.25%), fresh-48 2/48 (4.2%).
Wall (128 village-runs): national 0, table 0, wins 0 both arms;
wave-4 reach 45 → 47 seeds, wave-5 reach 1 → 2 seeds; median 100d
OFF, 93d ON. Sense: the four pair villages read as people joining
the player's fights on camera ("Verónica just put down The Strike...
on CAMERA"), but the pairs are fleeting — all eight pair killers
dead within 22 days of their kill, six within 9; living killers at
end ON 3 vs OFF 4. The drive itself is invisible in narration:
~5,100 SAY lines across the four windows, not one says a killer
told anyone about a beast or that anyone went looking. No pair
formed without telling/seeking (dsTold ≥ 10, dsSeeks ≥ 2 on all
four). **DO NOT MERGE branch sim-drive64-measure** — it contains
the unmerged drive build (56a7c720d) plus this measurement. The
verdict lives in this round file and in
`evidence/2026-11-06/sim-drive64-a.md` on that branch; the branch
is the record. Metric review (for the NEXT run, not applied here):
judge a DURABLE pair — both killers still alive 14 days after the
second kill, or living killers at end — alongside the current pair
count, and require the drive's telling/seeking to be narrated (a
SAY line naming the beast and the teller).

## Wall (this run's judged corpora)

| corpus | national | table | wins | wave-4 | wave-5 | median |
|---|---|---|---|---|---|---|
| roleform census (8) | 0/8 | 0/8 | 0/8 | 0 kills | 0 | 81d |
| grind band (8) | — | — | — | 18 kills* | 2 kills (99641) | 132d† |
| drive64 pooled (128) | 0 | 0 | 0 | reach 45→47 | reach 1→2 | 100→93d |

\* grind W4 kills are mostly TB kills in the band's fight logs, not
field finishes (field: 1/128). † grind median survival across the 8
seeds' end days (71–150d). No village banks two LIVING wave-4
killers and sits — same wall as every run.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale-wall.json --current <glob> --metrics
national,table,wins,exiled`, run on this run's corpora:
- roleform (`roleform-a-seed9989*.json`): 3 LOUD lines (national
  12→0, table 16→0, wins 16→0).
- drive64 panels (`drive64-panel-*.json` on the branch): 3 LOUD
  lines, same three metrics, same direction.
- grind (`perseed-grind-a/*.json`): script REFUSED the input —
  "refusing recorder-corpus input: all 8 rows carry top-level
  anchorCommit, so they are sweep recorder rows, not runs."
  No LOUD lines, no verdict from this tool on the grind corpus;
  the grind wall numbers stand on the evidence table instead.
All LOUD lines are the documented spurious regime class: the
scale-wall baseline's own `_regime` note is the "winseat — full
win-side win stack" regime and forbids comparing pre-seat /
competent-only substrates against it — wins are structurally ~0
there. These corpora are competent-only / pre-seat substrates, and
0 national/table/wins matches the standing wall state in every
recent run. Baseline NOT rolled, no investigation item.

## Infrastructure

- Premature tbend release + repair (coordinator's own error,
  recorded so it is not repeated): the ff-only merge failed because
  master had moved to b5eb5b94e (journey r110 landed by the main
  session) while the proofs ran — but the release + worktree-remove
  + branch-delete commands were `;`-chained, so they ran anyway
  after the failed merge. The tree was released as done-merged
  (wrong) and the worktree removed; the branch survived at
  dd0e1396a. Repaired: registry entry restored to active with an
  explanatory note (atomic JSON write), worktree re-added from the
  branch (registered entry existed first — the reaper hazard the
  bare-add rule guards against does not apply here), rebased twice
  more onto 44f8d3394 (bypass landing) and e35ffc890 (Loop B
  evidence), proofs re-run green on the final tip (18/18, 52/52,
  33/33), merged ff-only and verified by ancestor check before any
  release. Lesson restated: never `;`-chain a merge with its
  release — verify the merge landed before releasing anything.
- Master moved 5 times under this run (roleform, grind, armorcap,
  routstall, journey r110, bypass, Loop B evidence — sibling
  landings, zero file overlap with this run's arms except the
  rebase bases). Both landed arms rebased clean; tbend rebased 3
  times total (once onto eabf00dba, once onto aba30299d, once onto
  e35ffc890 after the premature-release repair).
- Safe-commit index clobber hit the grind evidence commit
  (af6322f60) — repaired via ls-tree HEAD + update-index --add
  --index-info after hash verification; commit verified correct.
  No clobber on the roleform or tbend landings.
- `git status` in the main tree hangs 6+ min under sibling load
  (D-state I/O); pre-flight and closeout used `git diff-index`
  + `git diff --cached` + `git ls-files --others` instead. Disk
  31% at run start. No EPERM flap blocked this run.
- `check.js --quick` NOT re-run by the coordinator: all three
  landed arms are measurement/scripts-only (zero src/js, zero
  green-list files); the standing 282/8 profile was just recorded
  by Loop B's 0130Z round (e35ffc890) on the same master line.
  Loop B's bypass arm was KILLED (primary 10.5 < 12, cap reverted,
  tooling landed, proof 39/39) — recorded here as sibling context
  only.

## Metric review

- drive64: the pre-registered metric binds and the NO-GO stands —
  but `pairFormed` over-credits what the game needs. It counts any
  same-day-or-later overlap while the first killer still lives,
  including gap-0 pairs where both killers die within days. The
  winnability chain needs two LIVING killers at the moment the
  village acts on them. Proposed revision for the NEXT run: judge a
  DURABLE pair (both alive 14 days after the second kill, or
  living killers at end) alongside the current pair count, and
  require narrated telling. The 16-seed screen is a hot draw, not
  a rate estimate — future screens need the fresh-48 bar before
  anyone leans on them.
- tbend: the anchor-replay non-reproduction is a correction to the
  prior round's claim, recorded in the arm evidence — the GO does
  not depend on the anchor replay. No threshold or bar moved.
- grind: the grind-windows and volley-kill definitions were narrowed
  BEFORE analysis (wave-4+ chains only; contact-finish at 0 rounds
  is not a volley kill); the analyzer fix commit documents both.
  No bar moved after the run.

## Convergence state

scale-onramp stays **converging** (NOT converged): the 64-seed
drive confirm — the run owed before anyone leans on the drive —
came back NO-GO on weak effect; no village banks two living
wave-4 killers and sits; the full seat is still unreached; wins
are 0 everywhere on judged corpora; wave 5 is reached only on
isolated seeds. The directive stands until the tracker records
this axis converged on measured evidence. Next blanks, in order:
(1) FINISHER-SIZE build — committed finish for beasts met below
their break line, sized 41 HP in the meeting (~3 rounds); the
rounds-cap / armor-ignoring half belongs to Loop B's bypass
family, do not build it here; (2) durable-pair metric revision +
narrated telling, then re-judge the drive (or its successor) on
the durable bar; (3) killer survivorship — pairs die within days,
the upstream binding problem (wave-4 kills remain rare: 25 per 64
villages per arm; killers die almost as fast as they are made);
(4) role-formation practice-movement gap — the census GO is
carried by track/deed levels, not practice, and the 2103Z
drive-practice arm covers haven labor only. food-economy stays
converging (untouched; sibling B loop). Rotation left at 3
(convergence work does not cycle it).
Claim deleted; lock deleted.
Evidence: evidence/2026-11-06/sim-winnability-round-0059.md (this
file); arms sim-roleform-a.md (79137ca39), sim-grind-a.md
(eabf00dba), sim-tbend-a.md (1700ea5fc), sim-drive64-a.md (branch
sim-drive64-measure ad0788cdc, NOT merged).
