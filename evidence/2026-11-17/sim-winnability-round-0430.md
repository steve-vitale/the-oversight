# Loop B round 0430Z — coordinator evidence (adoption closeout)

**Run:** `fleshout-loop-b-20261117T0430Z`, Loop B, axis winnability chain.
**Coordinator:** timed out at 2026-11-17T07:10:19Z (2h cap) before closeout.
Adopted in the main session: arm 2's release completed, arm 3 heartbeated,
rebased, proof re-run, and merged; this file, the tracker update, and the
claim/lock deletion done by the adoption coordinator.

## Arms

### sim-zeroattempt-b — DIAG GO (landed by the run)

**Verdict: DIAG GO, all four prereg bars pass. Proof 111/111.**
Band 103201–103208 (fresh), 150d, competent verbatim, zero `src/js` change.
Commits: prereg + instrument `ddbd69ce9`/`63c850e46`/`f8b23c9ce`/`7a7580071`,
evidence + corpora `b410ac30c`. Evidence:
`evidence/2026-11-16/sim-zeroattempt-b.md`.

The never-commit village, one level deeper than expignite-b: **the win-plan
store is never switched on, and nothing else can switch it on for them.**
On the four zero seeds, engaged rangers stood at Haven calling for a plan
228, 21, 269 and 29 times — every call died at the store's first line
(`if (!v || !v.winPlan) return null`) before the code ever asked whether
the villager was engaged. The village had killed beasts by day 4–12; the
shared kill knowledge was there from the first week. Waking the store on
the first Haven day would seed plans within days on three seeds (day 112
on the fourth, the first day its lone wanderer ever stood at Haven in
daylight with the danger low enough). The soft wanderer path is real but
starved: the chance roll was reached only 62 of 1,088 wanderer/explorer
days (5.7%) and passed 11 times. Assignments are the quiet second lock:
weight 99 against core weights ~7, **never expires** (observed 89–107
days). Wall identical both legs: national by standing 3/8, by scaleRank
0/8, table 0, wins 0, wave-4 8/8, wave-5 3/8, median survival 150.5d.

### sim-haventickgate-b — DIAG GO (landed by the run, release by adoption)

**Verdict: DIAG GO, all four prereg bars pass. Proof 102/102.**
Band 103211–103218 (fresh), 150d, competent verbatim, zero `src/js` change.
Commits: prereg `ba2be3a9f`, instrument `335d83da3`, evidence + analysis +
corpora `767fb69f9`, corpora `6fb6ea002`. Evidence:
`evidence/2026-11-16/sim-haventickgate-b.md`.

**It is the store, and only the store.** 3 of 8 villages never start a plan
in 150 days — and on all three the plan store simply never existed. Not
profile (4–8 rangers each), not Haven presence (89, 203, 192 havenTick
reaches), not engagement (heard of slain beasts from day 4–8). Every
reached call died at the same guard line. Across the three empty seeds,
456 ranger+engaged calls were eaten by the guard, spanning day 4 to day
149. Ignited seeds prove it from the other side: 1–100 would-be creations
eaten per ignited seed before the first initializer arrived (103212 waited
until day 83). The frozen taxonomy row `store-never-initialized` (proposed
by planignite-a) classifies 3/3 empty seeds on a fresh band. HavenTick
`lived` is zero on a third consecutive band (16 creations: 14 heard + 2
both, 0 lived). Wall identical both legs: national by standing 2/8, by
scaleRank 0/8, table 0, wins 0, wave-4 8/8, wave-5 2/8, median 151d.

Release: the run merged the arm to master `6fb6ea002` but the release step
was still waiting on the registry flock when the coordinator timed out.
Adoption verified the branch fully merged (`git merge-base --is-ancestor`
+ branch contains), ran `worktree-release.sh` (exit 0), removed the
worktree, deleted the branch.

### sim-deadplan-b — DIAG GO, cost COSTLY (landed by adoption)

**Verdict: DIAG GO, all four prereg bars pass. Cost COSTLY. Proof 89/89.**
Band 103221–103228 (fresh), 150d, competent verbatim, zero `src/js` change.
Commits: prereg `2c59164ff`, instrument `0966de273`, analyzer fix
`2c5cbc724`, evidence + corpora `9ef8bac37` (final rebased tip `8bd1e2368`,
after rebases onto `6fb6ea002` and then `10b68c9d9` — master moved twice
mid-adoption, once on the nightcarry-resume landing).
Evidence: `evidence/2026-11-16/sim-deadplan-b.md`.

A dead villager's plan does cost something, but not much — and not where
expected. The pool is clean: across 12,929 plan touches and 7,157 dawn
scorings, not one ever involved a dead holder. The cost is **stale dead
names in living people's plans: 6 living holders carried a dead companion
in their plan's party for 10–34 days each, 149 villager-days in all.**
Zero launches carried a dead member — the brain rebuilds the party from
living people at launch. The census is the loudest symptom (1,500 of 2,615
rows, 57%, belong to dead holders; on some days every plan in the census
is a dead person's) but nothing in the game reads that count. The named
next step (a BUILD arm, not a diagnostic): death cleanup in `win-plan.js`
— delete `winPlan[vid]` on death AND purge the vid from every living
holder's `plan.party`. Instrument correction mid-run: the first analyzer
run said NOISE-ONLY on a roster-flag death-day bug; the corrected
(deaths-array) analyzer flipped it to COSTLY. Wall identical both legs:
national by standing 6/8, by scaleRank 0/8, table 0, wins 0, wave-4 8/8,
wave-5 6/8, median 151d.

Adoption verification: proof re-run by the adoption coordinator on the
pre-rebase tip (**89 passed, 0 failed, exit 0**) and on both rebased tips
(89/89 each); `src/` diff vs master empty (evidence only); worktree clean;
ff-merged unpiped (the first attempt failed exit 128 because master moved
on the nightcarry-resume landing mid-adoption — rebased and retried);
released; branch deleted.

## What this round settles

The plan-ignition question is now answered three independent ways on three
fresh bands: planignite-a (the catch-22, store never initializes), 
...[truncated 2085 chars]