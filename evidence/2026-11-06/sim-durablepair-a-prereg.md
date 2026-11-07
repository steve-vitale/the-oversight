# sim-durablepair-a — PREREG (written before the judge runs, 2026-11-06)

Re-judge of the drive64 64-seed corpora on the DURABLE-pair bar, plus the
narrated-telling audit + hook. Tracker blank #2 (0059Z metric review):
judge a durable pair next (both alive 14d after the second kill, or
living at end) + narrated telling, then re-judge the drive.

## What is being re-judged

The drive64 confirm (branch `sim-drive64-measure`, tip ad0788cdc; evidence
`evidence/2026-11-06/sim-drive64-a.md` on that branch) came back NO-GO on
the count bar: pooled 64 pairs ON 4 vs OFF 0 (count bar >= 5 missed);
fresh-48 ON 2 vs OFF 0 (bar >= 3 missed). The 0059Z metric review says the
count bar (`pairFormed`) over-credits what the game needs: it counts any
same-day-or-later overlap while the first killer still lives, including
gap-0 pairs where both killers die within days. This run formalizes the
proposed revision into a judge script that lands on master, and re-judges
the EXISTING corpora — no new sims for the re-judge, no re-score of the
drive64 verdict (the NO-GO stands; this run judges the durable bar
alongside it).

## Corpus identity (read-only; never merge the branch)

- Branch `sim-drive64-measure` @ ad0788cdc. DO NOT check it out as a
  worktree base; DO NOT merge it into master (it contains the unmerged
  drive build 56a7c720d; the 0059Z verdict says DO NOT MERGE it).
- Panels (via `git show`, copied to /tmp for the judge run):
  `evidence/2026-11-06/drive64-panel-off.json` sha256
  79088c4a60b0e506b5718348b32b4db161283fd02661ef5d909afbd1759e1a8f,
  `evidence/2026-11-06/drive64-panel-on.json` sha256
  f5cf4a2fd5a3c3b8a1a06bd2de40708bc69c6bdd3c46f9dced212659b20dc2b0.
  64 runs each, identical seed lists (99851–99866 + 99053–99100),
  competent, 150d, drive64 prereg env.
- Pair-seed transcripts (same branch path, `drive64-transcript-<seed>.json`):
  99063 sha256 05e6108f9f83f7b610636558f5f217dc58b68b163abe2b0f26b5e9788284d3d9,
  99091 sha256 29978aa90d19cd57bfb5ce81f0d190cad69e412a4bc5f291549f2c684f09d462,
  99854 sha256 926d936db0b807a25305da9ab602e7eaaaef77e6a3669b0c93e9cd83c25d320b,
  99866 sha256 bcb517aa537cc7373bde49a03fa92a46e0a7c6e595466caa63196e9d5311e723.
  Each carries `kills` (wave-4 kill log), `killersDeathDay` (per-killer
  death day from `v.fallen`), and `sayLines` in a window around the pair.
- Panel `extra` per row carries `pairFormed`, `firstKillDay`,
  `secondKillDay`, `livingKillers`, `w4Kills`, `w4Killers`, `dsTold`,
  `dsSeeks`, `dsScoutSeen`, `dsScoutEmpty`, `fallen`, `aliveEnd`.
  The panel does NOT carry per-killer death days — that is why the judge
  reads the transcripts for pair seeds.

## Primary metric (durable pairs, pooled 64)

A `pairFormed` pair (first two distinct wave-4 killers by first-kill day,
per the drive-seek `extraMetrics` definition) is DURABLE iff BOTH killers
are alive 14 days after the second kill, or both are living at horizon
end. Per killer, "alive 14d after the second kill" means: no death record
(alive at end) OR `deathDay - secondKillDay > 14` (strictly more than 14
full days survived after the kill day). The "living at end" clause is
satisfied when the pair seed's `livingKillers == 2`. A pair seed with no
usable death-day source (no transcript AND `livingKillers < 2`) is
UNJUDGED — reported as unknown, never counted durable, never counted
fleeting.

GO threshold (task-suggested, not fitted): durable pairs ON >= 2 AND
durable pairs OFF == 0. The bar is set from the count-bar baseline
(ON 4 / OFF 0): durability must preserve at least half the count-bar
pairs while keeping the OFF leg at zero, or the durable bar does not
separate the legs. A miss is a verdict on the durable bar (reported as
NO-GO on the durable bar), NOT a re-score of the drive64 NO-GO — and
the re-judge still delivers its finding: the count-bar over-credit
ratio (count pairs -> durable pairs) is reported either way.

Secondary (reported, not gating): fresh-48 durable pairs alone; the
count-bar over-credit ratio; per-pair anatomy (second-kill day, each
killer's survival after the second kill, end state); wall numbers per
arm (national / table / wins, wave-4/5 reach and kills, median survival).

GATE (determinism / corpus fidelity, before judging durability): the
judge must reproduce the published pair list exactly — ON pair seeds
[99063, 99091, 99854, 99866], OFF pair seeds [] — and the published
pooled counts (ON w4Kills 25, OFF w4Kills 25, ON pairs 4, OFF pairs 0).
If it does not, STOP and investigate; a mismatch means the judge is not
reading the corpus the drive64 run judged.

## Seeds / horizon / policies (re-judge)

No new sims: seeds 99851–99866 + 99053–99100, horizon 150d (death-aware),
policy competent verbatim, env per the drive64 prereg. Before/after
comparisons, where a before/after exists (telling-hook proof), run
through the balanced panel (`scripts/balance-panel.js`) per §15 where
applicable; the telling-hook proof is a deterministic re-run of existing
pair seeds, not a panel, and says so.

## Seed-band freshness (telling-hook fresh panel, if needed)

SUGGESTED band 99841–99848: VERIFIED FRESH (full check, this run).
Scope: grep over ALL dated preregs (`evidence/*/sim-*-prereg.md`, all
dates) for tokens 99841–99848 and 9984x; grep over all evidence `.md`
for the same tokens; `git grep` over the drive branch's preregs; the
forbidden/contaminated band lists those preregs name; adjacent-band
check (99831–99840, 99849–99866).
- Preregs: the ONLY hit is `evidence/2026-11-06/sim-roleform-a-prereg.md:141`,
  a freshness-probe census line ("99841–99891 show 0 single-seed prereg
  hits") — it records 99841 as probed-and-clean, explicitly NOT taken.
  No prereg names 99841–99848 as a used or reserved band.
- Evidence `.md`: the only other hits are `.json` data files whose
  matches are false positives of the class prior preregs dismiss —
  pantry calorie counts (`pantryFreshAfter: 99843`) and float
  substrings (`10.82617699848129`), not seeds.
- Drive-branch preregs: 0 hits.
- Forbidden/contaminated lists naming 998xx: only 99801–99808 (used,
  stay clear) — disjoint.
- Adjacent used bands are disjoint: 99821–99832 (gearoff confirm),
  99851–99866 (drive screen). 99841–99848 sits between them, touching
  neither.
Band 99841–99848 is HELD IN RESERVE for a fresh telling-hook panel IF
one proves necessary; the patch proof below uses deterministic re-runs
of existing pair seeds (99854/99866) and does NOT consume the band.
If no fresh panel runs, the band stays unused — this prereg does not
reserve it beyond this run.

## Part (b): narrated-telling audit + hook

Audit questions (answered in the evidence, not pre-answered here):
where in the drive-branch code is a kill-telling done silently — who
tells whom about which beast, through which existing SAY channel
(`Game.say` / `sayHavenNews` / the fireside killer-tale beat)?
Preliminary scoping (corpus/code inspection before this prereg): the
drive's telling site is `objTellHuntSite` in `src/js/villager-objectives.js`
(drive branch only — master has no `objTellHuntSite`,
`objNoteHeardSighting`, `monsterHeard` or `objSeekCandidate`), called
from `objHuntFromSite` when a firsthand hunter departs; hearers are
<=2 hall-mates at the hunter's node; `objNoteHeardSighting` records the
heard rumor (naming the teller) and increments `driveSeek.told` with no
SAY anywhere. Master's existing kill-telling channel is the fireside
killer tale (`queueKillerTale` -> `killerTaleBeat` -> `tellKillerTale`,
`sayHavenNews`), which only fires for a monster type nobody has
reported yet. Expectation: the drive-telling hook only makes sense on
the drive branch -> deliver as a patch file in the evidence, with a
proof run on the drive branch in a THROWAWAY copy (never commit
drive-branch code to this branch). Decision rule (binding): if the hook
applies cleanly to master without the drive build, build + proof-test
it on master; otherwise it is a branch patch, reported as such.

Hook requirements (pre-registered): the SAY line names the beast (by
its knowledge-gated descriptor — `monsterDisplayName`, never the true
name) AND the teller; it fires only when a genuinely-new heard record
is born (not on a refresh of an existing rumor); it changes no game
state, consumes no RNG, and must not move any driveSeek counter or
sim trajectory — proven by a deterministic before/after re-run on
identical seeds showing identical counters/outcomes with the telling
lines added.

## Proof (scripts/test-durablepair-20261106.js)

- D1 judge correctness on synthetic fixtures: durable pair (both
  deaths > +14d), fleeting pair (deaths within 14d), living-at-end
  pair (`livingKillers == 2`, no death records), OFF zero pairs,
  pair seed with no transcript (UNJUDGED, never durable), boundary
  (death exactly at secondKillDay+14 — strict rule: NOT durable),
  and the pair-list gate (published ON/OFF pair lists reproduced).
- D2 corpus fidelity: the judge run on the real corpora (paths as CLI
  args) reproduces the published pooled counts (ON w4Kills 25 / pairs
  4, OFF w4Kills 25 / pairs 0) and emits the durable verdict JSON
  committed as evidence.
- D3 telling-hook patch: applies cleanly to a throwaway copy of the
  drive branch tip; deterministic re-run of a pair seed with the patch
  gains a telling SAY line naming teller + beast descriptor, and
  driveSeek counters / kills / pair outcome are identical to the
  unpatched run on the same seed.
- `node scripts/check.js --quick` after every change.

## Prereg-integrity note

Scoping inspection before this prereg (corpus completeness check)
confirmed the transcript JSONs carry populated `killersDeathDay`
fields for all four pair seeds, and the panel carries the
`pairFormed`/`secondKillDay`/`livingKillers` fields the judge needs.
The death-day values were visible in that scoping output, and the
pair anatomy (kill days + death days) is already published in prose
in `sim-drive64-a.md`. The formal verdict is nevertheless produced
only by the judge script run AFTER this prereg, against the GO bar
above; the bar (>= 2) is the task-suggested bar, chosen before the
judge runs, not fitted to the corpus. No per-killer durable numbers
appear in this prereg.

## Metric review (pre-run note)

The count bar is the hypothesis under test, not the judge: if the
durable re-judge collapses ON 4 -> 1 (say), the finding is that the
count bar over-credited fleeting overlaps 4x — the 0059Z metric review
was right, and the drive's successor must be judged on the durable
bar. If durability preserves >= 2, the drive's effect survives the
stricter bar even though it missed the count bar. Either outcome is a
result, not a failure of this run. The telling hook's success is
separate from the durable verdict: a narrated telling is a legibility
fix for the drive's successor, not a re-score of the drive.
