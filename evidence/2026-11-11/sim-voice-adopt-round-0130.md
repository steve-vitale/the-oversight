# Evidence — Loop B adoption round 0130Z: voice/instrument fixes landed (findings #2274, #2252, #2253, #2271)

Run: fleshout-loop-b-20261112T0130Z (scheduled Wed 2026-11-11 19:30 CST) · coordinator adoption run
Axis: winnability chain — findings-backlog voice/instrument fixes (scale-onramp converging, NOT converged; directive stands)
Coverage program: COMPLETE on measurement (d33ca69f9). Re-point queue: FULLY DISPOSED (arm-2 toggle closed 0630Z; flee-repair Steve call, held branch sim-fleerepair-a; standing accumulation answered by veterans-lock decomposition).

## Stale-lock recovery (run start)
The 2330Z B run was dead at run start: lock `fleshout-loop-b-20261111T2330Z` created
23:34:50Z, its trees' heartbeats 00:18:07Z (73 min stale, past the 15-min guard),
all three workers delivered done/interrupted-by-timeout, no processes in either
tree. Claim retired to `fleshout-loop-b-20261111T2330Z.json.DEAD`, lock deleted,
per the concurrency guard. Loop A live on its 2317Z claim (survival-collapse
bisect ROUND 2) — NOT touched; no A tree, claim, or axis touched. Pre-flight:
main tree clean, disk 40%, `worktree-reap.sh` removed nothing (14/16 active, all
holding uncommitted work — reaper correctly refused). Adopted trees heartbeated
and read back (01:38:16Z).

## Arms landed (both GO, merged locally pending ship)
Master at claim: e0f1cacb0. Master at closeout: 7f676033d.

### Arm 1 — sim-medname-b: GO (finding #2274, medicine narration)
- Fix: `src/js/game.js` `useMedicine` KIND_NAME map + plural flag — antimalarial /
  cold remedy / bandage / ORS no longer narrate as "antiparasitic". No cure
  behavior touched. Test: `scripts/test-journey-crisis-r181-regional-meds.js`
  section (6) NAMES. Commit `9b98a0efc` (5 files), rebased onto e0f1cacb0, merged
  ff-only first.
- Proof on merged master: regional-meds suite `r181 regional-meds: ALL PASS`
  17/17, exit 0. Targeted regression all exit 0 (disease-break-r14 68/0,
  curepath ALL GREEN, recovery 7/7, parity-disease 5/5, status-effects 51/51,
  standing-regional-filter 20/20).
- `check.js --quick` (detached, completed): 330 passed, 10 failed in 1319s. All 10
  unattributable: 6× 120s per-script cap timeouts (long sim/deed scripts, several
  printing passing `ok` lines first, none exercises `useMedicine`); 3 identical on
  pristine HEAD by stash-compare (measurement-proof-update,
  measurement-workflow, phone-frame-proof — pre-existing proof/receipt
  staleness); 1 (measurement-cache-flags) fails only under check.js load but
  passes standalone on both pristine and fixed trees (exit 0, 4/4). The five
  October pre-existing failures stand as recorded in the arm evidence.
- Incomplete, recorded not passed: standalone test-synergy-stall spot-check —
  background process lost after ~2.5 min with progress output but no verdict.
- Evidence: `evidence/2026-11-11/sim-medname-b.md` (+ prereg, check-quick log).

### Arm 2 — sim-finalvoice-b: GO (findings #2252 + #2253, finale voice)
- Fix: `src/js/progression.js` channelSentiment cap (each lane's canonical arming
  closing prints ONCE per run; later armings rotate variants) + `src/js/table.js`
  bar suppression on priced full seats (war record still voices). No gate,
  price, deed, or readiness change. Test: `scripts/test-finalvoice-20261111.js`
  V1–V4. Commit `7f676033d` (rebased from bd3cbc217 onto 9b98a0efc after the
  medname merge moved master; proof V1–V4 re-run green on the rebased tree),
  merged ff-only second.
- Live band 2 (capped code, seeds 89901–89904, 120d, pass-A; corpus already
  complete at adoption, verified as-is): canonical devotion sentence verbatim
  across FULL transcripts 0/0/0/1 (89901 0/4 core, 89902 0/126, 89903 0/4,
  89904 1/225); band-1 same-seed comparison 89902 31→0, 89904 57→1. Bar-reads 0
  on all four transcripts. Targeted set green on the rebased tree (main67 0
  failures, tabledeed ALL GATES GREEN, feast-tooltip 19/0, warpath-twice 7/1
  pre-existing, godpath validate 75/0, ladder 25/0, table-entry 43/0,
  table-sheet-handoff 5/0). Full `check.js --quick` not run (recorded caveat;
  targeted set covers every touched function).
- Caveat recorded in the arm evidence: 89901/89902/89903 transcripts are
  announce-sliced from d90, so their 0 reflects the single canonical hearing
  predating the slice; 89904 (announced dnull, no slice) supplies the
  full-run check at 1/225.
- Evidence: `evidence/2026-11-11/sim-finalvoice-b.md` (+ prereg, probe,
  band-2 log, perseed corpus).

### Arm 3 — sim-vetsays-b: already landed by the dead run (finding #2271)
Commit `9a32925b3` verified an ancestor of master at run start; branch already
gone. No adoption work needed. Backlog line already marked `[fixed]`.

## Scale-wall numbers (finalvoice band 2, 4 seeds)
Won 2/4 (both lesser seats, sat d90); wave 5 unlocked on 89901 and 89903; no
full seat, no national reach; median satDay of sitters 90. Medname: N/A (no sim
run — narration-only fix).

## Telemetry deviation check
`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json
--current 'evidence/2026-11-11/perseed-finalvoice-b/*.json' --metrics
national,table,wins,exiled`: 3 LOUD lines (national 12→0, table 16→0, wins
16→0, n=4). All REGIME + field-shape artifacts: a 4-seed voice-fix band is not
a win-seeking panel corpus, and the per-seed rows carry won/seat fields, not the
top-level national/table/wins panel paths the WINSEAT baseline expects (the band
itself recorded won 2/4). Baseline NOT rolled, no investigation item.

## Infrastructure / incidents
- **Stash-stack collision (loud, recovered, no work lost):** during the
  finalvoice rebase, a bare `git stash pop` popped the sibling medname arm's
  rebase stash ("On sim-medname-b: medname-rebase") into the finalvoice tree
  and dropped its entry. The dropped stash commit (336505f30) still existed;
  the finalvoice worker restored it with `git stash store` under its original
  message (back at stash@{0}, content verified byte-identical), then applied
  its own stash by explicit ref. The medname worker later confirmed its tree
  clean with pristine game.js and dropped the redundant stash by explicit ref
  (byte-identical to the committed fix). Lesson recorded in `~/AGENTS.md`:
  never bare `git stash pop` on this shared repo while a sibling may be
  stashing — use explicit stash refs (`git stash apply stash@{N}` /
  `git stash drop stash@{N}`), or commit first, then rebase the commit.
- Safe-commit index clobber struck both worker commits (files showed D + ??,
  src files MM); repaired both times with the `ls-tree -r` +
  `update-index --index-info` pipe; commits always correct, worktrees
  verified clean.
- Second merge initially refused ff-only (master moved under the run by the
  first merge — the expected two-branch case); finalvoice rebased onto the
  explicit new master SHA 9b98a0efc, proof re-run green, merged ff-only.
  No pipe masked any exit code.
- Reaper at closeout: removed nothing; 12/16 active after releasing the two
  adopted trees (both `released ... as done-merged`, branches deleted,
  worktrees removed). Main tree clean at closeout.
- Loop A still live at closeout on its 2317Z claim (bisect ROUND 2); untouched.

## Findings backlog updates
- #2274 → `[fixed]` (medname, 9b98a0efc).
- #2252 → `[fixed]` (finalvoice, 7f676033d).
- #2253 → `[fixed]` (finalvoice, 7f676033d).
- #2271 → already `[fixed]` (vetsays, 9a32925b3).
- New open items appended: test-warpath-twice-20261023 pre-existing failure
  ("remainder count honest (3 more)", monster-noun lookup miss voicing "the
  something"); test-tabledeed-20261021 E3 vacuous file-confinement check
  (parses `git diff --stat` with `.split(/\s+/).pop()`, takes the +/- bar,
  never the filename); dry-swallow bandage verb ("You dry-swallow the
  bandage" — a bandage is applied, not swallowed; per-kind use-verb
  follow-up).

## Metric review
Both arms judged against their preregs without re-scoring: medname GO on the
section-(6) + regression bar; finalvoice GO on (a) AND (b) AND (c), with the
band-2 live count as the deciding check for (a). One metric note: the
finalvoice prereg's "at most 1x per finale transcript" was written as if a
finale transcript held one arming round; the live band showed finale slices
hold 27–60 armings, so the cap revision (recorded in the prereg before
landing) is what makes the literal GO hold in the wild — no further revision
proposed. No metric was re-scored mid-run.

## Village assessment (plain words)
The village now says the right pill name when someone takes medicine from a
ruin cabinet, and the end of a long run no longer repeats the same keepsake
line four times in a row or reads a combat checklist aloud to a village that
already paid for its seat. Two small voice defects, fixed as measured — the
game is not more winnable for it, but the win, when it comes, will read like
it was earned.

## Next blanks (for the next B run)
In order: (1) the three new findings above (warpath remainder-count,
tabledeed E3, bandage verb) — small, testable, unclaimed; (2) the
synergy-stall spot-check left inconclusive by the medname adoption — re-run
to a verdict or drop it; (3) loop A's bisect outcome (survival-collapse) will
set the next winnability arm — do not pre-claim it while A is live.

scale-onramp stays converging (NOT converged): national/table/wins still 0 on
every win-seeking band; the survival-collapse bisect is the open question.
Claim deleted; lock deleted.
