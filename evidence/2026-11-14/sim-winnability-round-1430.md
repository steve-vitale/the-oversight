# sim-winnability-round-1430 — Loop B coordinator evidence

Run: fleshout-loop-b-20261114T1430Z (Loop B), axis: winnability chain
(wild ally-join → wave-4 kills → veterans → readiness-5 release →
wave-5 facing → full seat). Master at close: `0d5335730`
(scaleclimb evidence-only commit). Two arms merged locally, one
killed at pilot. No push, no version bump — ship loop owns deploys.
Merged locally, pending ship.

## Arms

### 1. sim-proofrefresh-b17 — GO 12/12, MERGED (`39aad0e4c`)

Round 17 was owed: `node scripts/godpath/test-measurement-proof-update.js`
failed on master `4355b9d18` (exit 1, "Proof source inputs are not
current"); the stale key was `src/js/conversation.js` (journey-landing
r132 nod-loop fix + journey-crisis r201 favor-want gate). Panel
regenerated in one ~24-min run: 64 rows, 0 stale keys, neutrality
4/4, 0/64 rows moved vs b16. Proof-update test re-verified exit 0
(9/9) on the merged HEAD. Cache-flags 4/4 outright first attempt
(this folded in the owed cache-flags quiet-box A/B — no failure to
discriminate). Wall rows carried (identical to b16): national 11/64,
wins 16/64 (all capable), entered 16/64, table 56/64, wave-5 13/64,
median 90d. Telemetry deviation check refused (tool cannot parse the
`.gz` panel — known limitation, same as b11–b16); baseline NOT rolled.
Evidence: `evidence/2026-11-14/sim-proofrefresh-b17.md` (+ prereg,
`neutral-proofrefresh-b17.json.gz`, `scripts/test-proofrefresh-b17.js`,
`scripts/balance-proof.json` re-point). Round 18 is owed after the
next manifest change — NOT by this run (no manifest file changed in
any landing here).

### 2. sim-standing99107-b — DIAG-GO, MERGED (`c8211b756`)

All five prereg legs pass; proof 17/17; zero `src/js`. The 99107
pattern from 2026-11-03 is GONE on current master: standing is
war-only (war carries 6/8 seeds past capped 200); readiness-ready
days occur on exactly one seed (99102, 7 days, 117–123) and the door
opens the same day (d117); wave-5 faced 0/8; wins 0/8, national 0/8,
table 0/8, median survival 120.5d. The wall past standing is
**veterans — one living veteran short on 317 village-days**.
Standing formula as found in `src/js/standing.js`: war 25 per wave-3+
ledger kill + diplomacy 34 per seasoned REGIONAL+ link + plenty 20
per major feast (quality ≥1); t4=100, t5=200, plenty capped at 100
toward t5; release needs capped ≥200 AND readiness-5 ready; while
≥200 but not ready the gated total holds at 199. The five ladder
tracks feed the LADDER, not standing; tribute feeds no standing
reader. Per-seed corpus in
`evidence/2026-11-14/perseed-standing99107-b/` (8 files). Evidence:
`evidence/2026-11-14/sim-standing99107-b.md` (+ prereg,
`scripts/standing99107-*.js`,
`scripts/test-standing99107-b-20261114.js`). The 11-03 numbers are a
previous anchor and must NOT be pooled with these.

### 3. sim-scaleclimb-b — BUILD NO-GO, KILLED (evidence only, `0d5335730`)

Competent policy learns capable's diplomacy behaviors (proposeLink,
answerAccord gift +10 trust / 2,000 kcal, tendLink +8/week),
modeled on `capable.js`. Policy-side only; zero `src/js`. Prereg
bars G1/G2/G3; verdict NO-GO on G2 (and G1 on the letter — see
metric review). The lever does NOT land; the branch was deleted as
killed. Only the evidence record landed on master (prereg, evidence,
16-file per-seed corpus, analysis JSON, pilot log, panel trio);
the policy, driver, analyzer, panel builder and proof test stay on
the killed branch and leave no trace in the game.

- **G2 THE LEVER — NO-GO.** Half 1 FAILS: diplomacy > 0 at end of
  run on 2/8 armed seeds (need ≥6/8). Half 2 PASSES: ≥3
  Haven-primary seasoned subs at once on 5/8 (need ≥2/8). A miss on
  either half is NO-GO, never re-scored. No confirm band was spent —
  the prereg licenses a 12–16 seed confirm only on a clear GO, so
  the pilot IS the result.
- **G1 INSTRUMENT VALIDITY — NO-GO (letter) / instrument sound
  (substance).** Driver captured a full per-day link roll on all 16
  configs, 0 instrument errors, every link classified — 0
  UNCLASSIFIED. But attribution arithmetic fails its own bar: total
  diplomacy unattributed = −408 (98803 −204, 98804 −102, 98808
  −102) and 2 of 98803's +34 steps name no link. Cause measured:
  diplomacy FLICKERS on 150-day legs — it rises as links count,
  then FALLS as links un-season and the polity dissolves, so
  end-of-run diplomacy is lower than the sum of attributed +34
  steps. The metric assumed diplomacy only rises (true on capable's
  win-truncated ~90d legs, false on 150d legs).
- **G3 LEVER-ONLY — GO.** Zero `src/js` changes; proof test green
  (static 41/41, game 23/23 on smoke seed 98801).

Before / after (paired seeds, 150d): regional day median 70 → 32;
polity bar reached 5/8; diplomacy peaked 136 and held 6–83 days on
5/8 seeds — but ended at 0 on 3 of those 5 as the polity dissolved
(98803 d124, 98804 d121, 98808 d76). Median survival 110d → 122.5d;
survived 0/8 → 2/8 (98801, 98803 to 150d). Gated standing median
199 → 199 (the 199 park holds; 98801's 591 is the exception — war +
diplomacy 136 + plenty, past the gate). National 0/8 both;
table/wins 0/8 both (by design — no seat-taking in this lever).
Wave-5 unlock 1/8 → 2/8; pooled wave kills 198/124/62/16/0 →
302/166/71/19/0. Balanced panel decision: review_required
(national 0 → 0 no_material_signal; villageDeaths/run 64.875 →
81.125 regression_signal — exposure, not a deadlier day: the armed
villages live longer and fight far more; deaths/100d 59.82 → 65.62
regression_watch, CI straddles 0).

Root cause of the holding failure, pinned: the PANTRY, not the tend
predicate. The predicate already fires whenever a link sits below
the bar; the 20k pantry gate blocks it (194 blocked tends on 98803
alone; pantry reads 4–12k kcal on most sampled days). Succession
haircuts and shortfalls then drag trust back under 40 and the third
seasoned bond un-seasons. A follow-up arm should test a
pantry-first hold or a cheaper tend — retuning the predicate alone
changes nothing. Second structural note: the polity needs three
seasoned AT ONCE; stagger kills it as surely as decay (98805
seasons 4 links and scores 0 because no three ever overlap).

## Wall numbers (scale wall, every run)

- Live arms this run (standing99107 + scaleclimb pilots, 8 seeds
  each): national **0/8**, table **0/8**, wins **0/8**; wave-4
  unlocked 8/8; wave-5 faced 0/8 (standing99107) / unlocked 2/8
  (scaleclimb armed); median survival 120.5d / 122.5d.
- Proof-refresh panel wall rows (carried, b16 = b17): national
  11/64, wins 16/64 (all capable), entered 16/64, table 56/64,
  wave-5 13/64, median 90d.
- The wall has moved one link: the climb is closed (regional in
  ~32 days, a realm standing on 5/8 seeds), the hold is open
  (end diplomacy 2/8, 3 of 5 realms dissolved), and past standing
  the binding wall is veterans (one living veteran short on 317
  village-days).

## Village assessment (plain words)

The same eight villages, twice. Left alone, each village gets
exactly one gift from the game itself — a link, handed over by the
ladder around day 50 — and then nothing happens to it. Taught to
court, they propose from day 10, answer every first gesture the
morning after, tend weekly while the pantry holds, and by day 32–39
they are regional — the same climb the best villages make. Three
fires bow to Haven on five seeds, and the System starts counting.
And then the long grind does what it does: the pantry thins, the
grain stops walking, funerals shave trust a little at a time, and
on three seeds the realm that stood at day 42–70 is gone by day
76–124 — not with a line marking the loss, but in the numbers,
trust 23 and 28 where 40 once stood. The two villages that held
their realm are the two whose pantries stayed fat enough to keep
tending. The courtship is solved. The keeping is not. And even
held, a realm is not a seat: standing is still earned mostly by
killing, the door to the fifth wave opened once and was never
walked through, and the villages are one living veteran short of
the bar that would let them through.

Sense-testing: the courtship reads like a played relationship, not
a meter — the gift ("2,000 kcal walks to Emberhold's fire — a gift,
no strings"), the tend ("not tribute, the other way around"), the
counter honestly played ("They won't bow to Haven. But they'll TAKE
Haven"). Villager dialogue in the captured lines is coherent and
specific. Two recorder limits, both inherited: the say-capture cap
(150 lines/run) fills by day ~28 with early chatter, so the polity's
dissolution has no played line in the evidence — visible only in the
numbers.

## Metric review (§14)

1. Scaleclimb G2's diplomacy bar read the wrong thing: end-of-run
   diplomacy misjudges a quantity that flickers. Next run should
   judge diplomacy by HELD-DAYS (days with dip > 0) and
   EVER-COUNTED (polity ever stood), with the end-state read
   alongside, never as the judge.
2. Scaleclimb G1's attribution assumed diplomacy only rises. The
   analyzer needs two fixes for the next run: (a) track dip
   DECREMENTS and name the link that un-counted each time; (b)
   record a counted-day per counting EPISODE, not just the first.
3. The prereg's H-guess — that seasoning three links is the hard
   part — was HALF right: forming and seasoning work (median 4
   formed / 3.5 seasoned / 3 counted); HOLDING is the hard part.
4. No-national-answers exclusion throttles late proposing (327
   blocked-propose days band-wide). A later arm wanting late
   splinter links must answer the beats or lift the pending-national
   block.
5. Proofrefresh: telemetry deviation check refused on the `.gz`
   panel (known limitation); baseline NOT rolled. Standing99107:
   the 11-03 anchor must not be pooled with the new numbers.

## Blanks filled / documented

- FILLED: proof-refresh round 17 (owed maintenance; proof current,
  re-pointed). Standing-99107 decomposition (pattern gone; veterans
  bind). Scaleclimb (climb solved, holding open; pantry is the
  choke).
- DOCUMENTED (next arm, not this run): HOLDING lever —
  pantry-first or cheaper tend. Metric revisions (held-days /
  ever-counted diplomacy; dip-decrement attribution). The polity
  needs three seasoned AT ONCE (propose early and together).
  Unanswered national beats throttle late proposing (327 days).
  Say-capture cap fills by day ~28.

## Infrastructure notes

- REGISTRY.lock contention is extreme today: worktree registration
  ~2 min per tree, heartbeats queued 8–25 min, releases 5+ min
  queued. The reaper's lock self-contention fix is still owed and
  needs a Steve nod (per AGENTS.md). Trees' last heartbeats well
  inside the reaper's ~4h removal window; no removal risk.
- Safe-commit index clobber struck all three workers' commits AND
  the coordinator's main-tree evidence commit (committed files show
  staged-deleted `D`, worktree copies intact, commits correct).
  Repaired every time with the documented pipe (`git ls-tree -r
  HEAD -- <paths> | git update-index --add --index-info`, `-r` for
  directory paths). Verify `git status --short` empty before
  merging; never `git reset` or `git checkout --` on clobbered
  paths.
- Write flap: a denied window was ACTIVE at ~14:43Z
  (validate-ontology.js died EPERM; 127KB gate probe 0/10) while
  the flap watcher logged ALL-OK (watcher blind to panel denial
  bursts, per the b15 finding). It cleared within minutes. The flap
  truncated the proofrefresh worktree's `docs/ONTOLOGY.md` to 0
  lines mid-write; the worker restored it whole from HEAD (2198
  lines, no diff vs HEAD); nothing lost, not a committed change.
  Second sighting of the 2026-11-12 class.
- Telemetry deviation check (body step 10): ran against the
  scaleclimb per-seed corpus — REFUSED ("refusing recorder-corpus
  input: all 16 --current rows carry top-level anchorCommit, so
  they are sweep recorder rows, not runs"). Recorded; baseline NOT
  rolled. (Proofrefresh's panel is unparseable by the tool — known
  limitation.)
- Rebase stop-at-pick quirk: did NOT strike this run (standing
  rebase 4/4 clean; proofrefresh rebase 1/1 clean). Scaleclimb
  needed no rebase (killed, not merged).
- Loop A ran concurrently (run fleshout-20261114T1452Z, three
  workers, transplant arms) — separate work, never touched. Its
  1355Z run closed out before this run's landings (15C conflict,
  15E conflict, 15A AMBIGUOUS, 15F NOT-CARRIER).

## Next blanks (winnability chain)

1. HOLDING lever — pantry-first or cheaper tend (follows scaleclimb
   NO-GO; the tend predicate is exonerated, the pantry gate is the
   choke).
2. Competent seat-taking BUILD (Steve-call).
3. Proof refresh round 18 (owed after the next manifest change).
4. Phone-frame receipt refresh.
5. Loop A's stranded fleerepair-a.
6. Family 2b AMBIGUOUS.
7. Veterans as the binding wall (standing99107: one living veteran
   short on 317 village-days).

## Convergence state

Winnability chain — CONVERGING on the climb (regional 70→32d,
polity 5/8), NOT converged on the hold or the win. Scaleclimb
killed at pilot per its prereg; proofrefresh GO; standing99107
DIAG-GO. No win-price / deed-gate / readiness changes in this run.

## Commits (master)

- `76e741f5f` proofrefresh-b17 prereg; `39aad0e4c` proofrefresh-b17
  panel + re-point + test + evidence (merged)
- `f823d790b` standing99107 prereg; `573accdd3` instruments;
  `78fa68146` analyzer fix; `c8211b756` pilot + evidence (merged)
- `0d5335730` scaleclimb-b evidence only (NO-GO; lever NOT landed)
- (this commit — coordinator round evidence)

## Worker reports reconciled

- proofrefresh worker (d6a76157): GO on the final tip, all six
  prereg legs pass; matches branch evidence verified by
  coordinator; branch merged + worktree released before the report
  arrived.
- standing worker (3dc11c6c): completed with an acknowledgment of
  the coordinator's clobber heads-up; full arm report did not
  arrive as a separate handoff — the arm was verified from the
  branch itself (evidence read, commits, clean tree, proof re-run
  17/17 green) and merged on that basis.
- scaleclimb worker (f65af20f): NO-GO on G2, clobber already
  repaired before filing, tree verified clean; matches the branch
  evidence read by the coordinator; branch deleted as killed,
  evidence preserved on master.
