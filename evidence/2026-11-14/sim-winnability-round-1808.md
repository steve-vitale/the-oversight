# sim-winnability-round-1808 — Loop B coordinator evidence

Run: fleshout-loop-b-20261114T1808Z (Loop B), axis: winnability chain
(wild ally-join → wave-4 kills → veterans → readiness-5 release →
wave-5 facing → full seat). Master at close: `d2b78d884`
(vetbank evidence-only) + this commit. Three arms, all NO-GO at
pilot, all evidence-only. No push, no version bump — ship loop owns
deploys. Merged locally, pending ship.

## Stale-lock recovery (dead run fleshout-loop-b-20261114T1557Z)

The 1557Z lock was 2h+ old (created 15:58:50Z, this run started
17:59Z); both its trees' heartbeats were ~1.5h stale
(sim-holdpantry-b 16:31:29Z, sim-cheaptend-b 16:31:29Z); both
workers were done (holdpantry DONE with a complete NO-GO report,
cheaptend DONE but INTERRUPTED BY TIMEOUT); no file writes under
15 minutes in either tree (newest 17:25:47Z). No 1557Z claim file
existed. Lock deleted at run start per the 90-minute fallback;
both arms adopted and closed by this run. No work lost.

## Arms

### 1. sim-holdpantry-b — NO-GO, evidence-only (`81f51c80d`)

Adopted from the dead run (branch tip `4f26f01c5`, 3 commits, tree
clean). Pantry-first HOLD lever (scaleclimb policy + banking step
+ national-beat answers) vs recovered scaleclimb baseline, 8 fresh
seeds 91101–91108, 150d. NO-GO on G2 held-days half (median 21.5
vs 45 bar; ever-counted 6/8 passes) + cost-bar median half
(114.5d vs 150d, 0.76×). G1 GO, G3 GO. Banking moved 118,914 kcal
(567 trips, 88 ok = 15.5%) but the pantry never stayed above the
20k gate (35 vs 34 days) and mourning refused 37 tends vs 7. The
policy, driver, analyzer, panel builder and proof test stay on the
killed branch; only the evidence record landed (prereg, evidence,
16-file corpus, analysis, logs, panel trio). Branch deleted.
Evidence: `evidence/2026-11-14/sim-holdpantry-b.md`.

### 2. sim-cheaptend-b — NO-GO, evidence-only (`2741b8343`)

Adopted from the dead run: the baseline was verified valid by the
coordinator (8 files written 17:10–17:22Z, before the 17:24:43Z
game-code edit) and the adoption worker ran the armed leg on
identical seeds 93211–93218, 150d. Cheaper tend (engine drive gate
20k → 10k, `src/js/hierarchy.js`). NO-GO on G2(a) by ONE day:
median held-days armed **44 vs the 45 bar** (ever-counted 8/8
passes). G2(b) marginal PASSES (ever 8 ≥ 7, median 44 > 31.5,
pooled held 465 ≥ 362). Cost bar PASSES (starvation 0, median
147.5d ≥ 112.4d). G1 PASSES (0 errors, 0 unattributed, 0
unclassified, 16/16). G3 PASSES (exactly one `src/js` change,
verified by the coordinator: `git diff` vs base is hierarchy.js
only; proof post-change green). The 10k gate value is NOT
licensed; no confirm band (the prereg licenses a confirm only on
a clear GO). The game-code change + test update stay on the
killed branch; only the evidence record landed (prereg, evidence,
17-file corpus incl. smoke, analysis, logs, panel trio). Branch
deleted. Evidence: `evidence/2026-11-14/sim-cheaptend-b.md`.

Key finding (filed in the findings backlog by the worker):
national 0/8 on BOTH legs is a POLICY artifact, not a holding
failure. The First Court beat staged on 15/16 configs and sat
unanswered 4–89 days each because the recovered scaleclimb policy
counts pendingNational but never calls `answerNationalChoice`
(0 calls on all 16 configs), and blocks proposes while one is
pending. The polity held (median held-days 44 armed, end-state
diplomacy positive 7/8) and the court came. Confirms the
2026-11-10 diplo-a entry on a second band.

### 3. sim-vetbank-b — NO-GO, evidence-only (`d2b78d884`)

New BUILD arm this run (policy-side only, zero `src/js`).
Scholar veteran-banking: after the scholar's first wave-4+ kill,
the scholar avoids wave-4+ fights and banks the veteran status.
Fresh band 91701–91708, 150d, competent vs competent+vetbank.
NO-GO: G2(a) MISSES (living wave-4+ killers at end armed 2 vs
baseline 3, Δ −1) and the cost bar MISSES on its middle clause
(arm-only starvation 3 > baseline total 2; total 3 ≤ 4 ✓, median
119 vs 142.5d = 0.84× ✓). G2(b) PASSES (readiness-5 days 20 vs
10). G1 PASSES (0 errors, 0 unclassified, all 16 classified).
G3 PASSES (zero `src/js`, proof 63/63 + 25/25). Stage-0 gate
PASSES (16 scholar wave-4+ kills on 6/8 baseline seeds — the
lever was not inert). The banking scholars died anyway (91707
day 92 "the arena", 91708 day 86 "the wild") — banking dies with
the scholar. The policy, driver, analyzer, panel builder and
proof test stay on the killed branch; only the evidence record
landed. Branch deleted. Evidence:
`evidence/2026-11-14/sim-vetbank-b.md`.

## Wall numbers (scale wall, every run)

- Holdpantry: national 1/8 armed (91101, global) vs 0/8
  baseline; table/wins 0/8 both; wave-5 unlocked 2/8 armed vs
  5/8 baseline; median survival 114.5d vs 150d.
- Cheaptend: national/table/wins 0/8 both legs; wave-5 unlocked
  2/8 both; median survival 147.5d armed vs 140.5d baseline.
- Vetbank: national/wins 0/8 both; wave-5 faced 1/8 both;
  median survival 119d armed vs 142.5d baseline.
- Proof-refresh panel wall rows carried (b17): national 11/64,
  wins 16/64 (all capable), entered 16/64, table 56/64, wave-5
  13/64, median 90d.
- The wall has not moved this run: the climb is closed, the hold
  is open on both tested halves (pantry-first and cheaper tend),
  and past standing the binding wall is still veterans — now
  measured as a survivorship problem, not an encounter problem
  (16 scholar wave-4+ kills on 6/8 baseline seeds; the killers
  die).

## Village assessment (plain words)

Three ways to keep a realm, all three measured and all three
short. Bank the pantry and the scholar spends every evening in
the field: the grain walks to the neighbors 99 times instead of
62, one village climbs all the way to global rank — and seven of
eight villages are gone before day 150, buried by the fights the
banking trips bought. Make the tend cheaper and the engine tends
264 times instead of 48, five seeds hold far longer, seven of
eight end the run with a living polity — and the median hold is
44 days against a bar of 45, one day short, because one village's
realm formed 48 days late and another died on day 80. Tell the
scholar to bank their veteran's life instead of re-rolling the
arena, and the scholar banks nothing: they die in the arena on
day 92 and in the wild on day 86, and the village ends with fewer
living veterans than if they had kept fighting. The courtship is
solved. The keeping is not — and this run says the keeping is a
grief problem (37 tends refused at funerals), a spend problem (a
weekly tend plus tribute per link is more than a banked pantry
carries), and a survivorship problem (the killer dies). And under
all three, a quieter defect: the First Court stages and sits
unanswered for weeks because no policy ever answers it — the
door opens and nobody walks through.

Sense-testing: the courtship still reads like a played
relationship (the gift, the drift warning captured for the first
time on the holdpantry band, the shared granary naming the
grief). The polity's dissolution still has no played line in the
game — the loss is visible only in the numbers.

## Metric review (§14)

1. Cheaptend's one-day miss is a verdict, not a rounding error:
   the prereg bar was 45 and the median is 44. No re-scoring, no
   confirm to rescue it. The marginal half passing does not
   overturn the absolute half failing.
2. The cost bar's arm-only clause caught a real cost on vetbank
   (3 armed starvation deaths vs a baseline total of 2) that the
   total clause missed. Keep both halves.
3. Vetbank's stage-0 gate did its job: the lever was live (16
   scholar kills), so the NO-GO is about the lever, not the
   instrument. The activation gate (0 strikes by a banking
   scholar while alive) also held — the failure is survivorship
   after banking, not activation.
4. Cheaptend G3's proof staleness note: the worker's "round 18
   owed on landing" is CORRECTED here — no manifest file changed
   in any landing this run (all three landings are evidence-only),
   so round 18 is NOT owed by this run. It remains owed after the
   next manifest change.
5. Telemetry deviation check: refused on all three corpora by
   design (recorder-corpus input); baseline NOT rolled.

## Corrections to the record

- The 1430Z next-blank (5) "Loop A's stranded fleerepair-a" is
  STALE: branch `sim-fleerepair-a` does not exist;
  `90f5d8298` (2026-11-12) records it already adopted, judged
  and landed by Loop A (pilot GO + confirm GO on master). Do not
  re-list it.
- The body's re-point queue is fully disposed: arm-2 toggle
  CLOSED 2026-11-06 (toggle-confirm family); flee-repair landed;
  standing-99107 answered 2026-11-14 (DIAG-GO). Do not re-take
  queue items from the body text.

## Blanks filled / documented

- FILLED: HOLDING lever, both halves measured NO-GO at pilot
  (pantry-first hold + cheaper tend). Veterans decomposition on
  current master (survivorship, not encounter — scholar kills
  16 on 6/8 seeds, banking scholars die).
- DOCUMENTED (next arm, not this run): a policy that ANSWERS the
  First Court (or lifts the propose block while one is pending);
  donation-only banking (the donation leg moved the grain with
  zero field time); grief/spend lever (mourning-proof tending or
  cheaper tribute); villager-side killer survivorship (arena
  deaths) — a design question, not another scholar-policy arm.

## Next blanks (winnability chain)

1. Answer-the-First-Court policy (cheaptend finding — national
   0/8 is a policy artifact; the polity holds and the court comes).
2. Competent seat-taking BUILD (Steve-call).
3. Proof refresh round 18 (owed after the next manifest change —
   NOT by this run).
4. Phone-frame receipt refresh.
5. Veterans survivorship lever (villager-side; design question).
6. Family 2b AMBIGUOUS (Loop A transplant program).

## Convergence state

Winnability chain — CONVERGING on the climb (regional ~32d,
polity 6–8/8 ever), NOT converged on the hold or the win. Both
HOLDING halves killed at pilot per their preregs; scholar
veteran-banking killed at pilot; national/table/wins still 0/8
on the live arms. Scale-onramp stays converging (untouched;
sibling Loop A). No win-price / deed-gate / readiness changes in
this run.

## Commits (master)

- `81f51c80d` holdpantry-b evidence only (NO-GO)
- `2741b8343` cheaptend-b evidence only (NO-GO)
- `d2b78d884` vetbank-b evidence only (NO-GO)
- (this commit — coordinator round evidence)

## Infrastructure notes

- Reaper skipped 6 consecutive runs on the held registry lock
  (known lock self-contention; fix needs a Steve nod). No
  cleanup this run; no removals. The 10:38 reaper note lists
  sim-cheaptend-b among the dirty trees — that was this run's
  adoption tree, committed and released since.
- Safe-commit index clobber: struck the cheaptend worker's
  commit (repaired via the ls-tree pipe, verified) and all three
  holdpantry worker commits (per the 1557Z record); none struck
  this run's three coordinator evidence commits (all verified
  clean + hash-matched).
- Loop A live throughout (1736Z transplant 15E run; its
  15e-p12 note commit `23a5531b0` landed mid-run) — never
  touched. Master moved under the run only via this run's own
  landings + Loop A's note commit.
- No EPERM flap observed this run. No push, no version bump, no
  live verification — the ship loop owns deploys.

## Worker reports reconciled

- Holdpantry worker (a3f31370): DONE, NO-GO, ready to merge —
  verified from the branch (evidence read, commits, clean tree,
  25 files) and landed evidence-only.
- Cheaptend worker (5889d02f): DONE, INTERRUPTED BY TIMEOUT —
  baseline + instruments committed, armed leg unrun. Adoption
  worker (8e47caec): completed the armed leg, NO-GO, evidence
  committed `a1d90471`, tree clean — verified from the branch
  (numbers recomputed from the analysis JSON: armed ever 8,
  median held 44, pooled 465, starvation 0) and landed
  evidence-only.
- Vetbank worker (a56471b3): completed, NO-GO, evidence
  committed `d62310bf2`, tree clean — verified from the branch
  (numbers recomputed from the pilot report: armed living vets
  2 vs 3, ready5 20 vs 10, starvation 3 vs 2) and landed
  evidence-only.
