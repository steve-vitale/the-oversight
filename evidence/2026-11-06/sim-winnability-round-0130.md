# Loop B adoption/landing round 0130Z — armorcap + routstall LANDED, bypass triaged

Run: `fleshout-loop-b-20261107T0130Z`, axis scale-onramp / winnability chain
(Steve 2026-11-03 re-point). ADOPTION/LANDING run for the dead 2300Z Loop B
run (killed by the main session 01:03Z/01:04Z; its lock + claim were already
deleted by the main session — no stale-lock recovery by this run).
Loop A LIVE on its 0059Z claim the whole run (roleform / grind / tbend /
drive64 adoption — NOT touched).

## Arms

### Arm 1 — sim-armorcap-b: LANDED 87fe58aa5
Test maintenance, zero `src/js`. Re-baselines the armor-cap test's stale
field bands from a fresh 8-seed corpus (finding #1832), per its prereg
derivation rule. Cap test 287/6 → **291/0**; proof
`test-armorcap-20261106.js` **42/42**. Direction preservation holds
(hushwolf pooled mean absorbed 8.24 > K=20 ref 6.2; belltoad 10.49 > 4) —
the re-baseline does not erase the retune. New open finding from its
corpus: bulldozer + belltoad almost never act against a spear fighter
(their cap-test legs measure spear kill speed, not armor).
Evidence: `evidence/2026-11-06/sim-armorcap-b.md`.
Landing: rebased 82e550626 → eabf00dba (rebase stop-at-pick quirk hit
twice, recovered with verified-clean `git rebase --continue`), then →
d98899b1d (main-session brain-design doc landing, docs only, zero
overlap) after master moved mid-landing. Proofs re-run green on every
rebased tip (42/42 + 291/0). Safe-commit index clobber hit the landing
record commit — repaired via HEAD-blob cacheinfo, hashes verified
byte-identical first. Merged `--ff-only` onto d98899b1d; tip 87fe58aa5
verified an ancestor of master. Tree released done-merged, branch deleted.
Note: the landing record commit message names base eabf00dba; the actual
merge-base is d98899b1d (one rebase later) — proofs were re-run green on
that tip too; git history is authoritative.

### Arm 2 — sim-routstall-b: LANDED aba30299d
DIAG-GO, zero `src/js`. The 159-round rout (seed 53001 day 41,
Congregation) is a POLICY LOOP, not a harness artifact: the scholar
strikes 120× with a dry crossbow after 29 rage re-presses and 8 real
hits, never varying; the beam monster fires 79 beams that cannot hit an
off-axis target behind tree cover and never repositions. Terminated
correctly by the engine's whiff-forever guard. D1 deterministic
reproduction bit-identical at the confirm anchor; D2 full verb/HP census;
D3 named fixes (failed-verb treatment in competent fight() at 3
consecutive failed verbs; beam repositioning between beams — both need a
design call, not built here). Proof `test-routstall-20261106.js` **24/24**.
Evidence: `evidence/2026-11-06/sim-routstall-b.md`.
Landing: rebased 82e550626 → 87fe58aa5 (incl. the armorcap landing), 3
commits replayed clean, no quirk. Proof re-run green on the rebased tip
(24/24). Merged `--ff-only`; tip aba30299d verified an ancestor of
master. Tree released done-merged, branch deleted.

### Arm 3 — sim-bypass-b: NO-GO, lever KILLED at pilot, tooling LANDED [see landing line below]
The bypass-damage mitigation lever (scripted lethal hits capped at half
target max HP) was recovered from the dead 2300Z arm by a triage worker:
the pilot sweep had completed (16 valid JSON files, seeds 88001–88008 ×
baseline/armed) but the analyzer never ran — the 2300Z bypass worker died
on a transport error (background exec completion undelivered: sqlx pool
timeout), not a sim error. The worker rebased onto explicit master
eabf00dba, re-ran the proof 39/39, ran the analyzer, and hand-recomputed
the primary as a cross-check.
- PRIMARY (binding): median rounds in LOST wave-4 TB fights, armed
  **10.5** (n=46) vs baseline 10 (n=49), bar ≥ 12 — **MISS**. Wave-4-only
  reading 9 vs 9.0, also a miss. No re-scoring.
- Secondaries all HOLD: kill rate 25.0% ≥ 10% (16/64 matched; log 17/64),
  median survival 117d ≥ 93.6, starvation 6 ≤ 8.
- Mechanism worked exactly as designed: 7 doom hits capped at exactly 50
  (Eulogy narrated ending, req 9999); Eulogy lost fights median 6 → 7
  rounds (+1, as the prereg predicted); the median over 46 fights gained
  half a round. The cap is not broken; it is too small — the other 39–42
  lost fights die on ordinary damage (median 14–15 applied/round, p90
  33). The Reunion owns 13–14 of 46 lost fights at a flat 6 rounds on
  ordinary 94–148-requested hits — the sharpest single target.
- Wall (bypass corpus): national / table / wins 0/8 both legs; wave-4
  unlocks/faced 7/8; wave-5 1/8 (88007 only); wave-4 log kills 17/17,
  wave-5 kills 0; median survival 117d; readiness-5 days 3 baseline /
  14 armed (88002 held two living veterans 11 days, then lost one);
  living wave-4 killers at end 15 baseline / 14 armed; five seeds sit at
  standing exactly 199, one short of the wave-5 door (t5 = 200), held by
  the readiness gate. Nobody has banked two living wave-4 killers and sat.
- Metric review: the primary was the right judge, judged as written; the
  SIZING ANCHOR proved stale — survivaltime's baseline (median 7, 20
  traced fights) vs this run's baseline leg on current master (median 10,
  67 traced fights). Proposal for the next run: re-anchor sizing on the
  current run's own baseline leg, never on a prior arm's numbers. The
  kill-rate secondary (≥10%) no longer discriminates on this band
  (baseline itself 23.9%). Analyzer note: `medianRounds` is over ALL
  traces — the lost-only primary lives only in the hand recomputation;
  next run should print it. Capped-hit filter note: req ≥100 with
  dmg ≤ 50 has false positives (Editor's Cut through armor); the honest
  cap-bite count is req 9999 → dmg exactly 50.
- Disposition: cap REVERTED (game code byte-identical to master;
  `src/js/` diff empty; proof test rewritten to assert the cap is ABSENT,
  39/39 green post-revert). Kept: prereg, instrument, driver, analyzer
  (leg-grouping + ±1-day join fixes are real and reusable), evidence,
  16-file corpus. Evidence: `evidence/2026-11-06/sim-bypass-b.md`.
  Verdict commits: 053bd3ed3 (KILLED + revert), c91060fcb (revert-tip
  record). Landing: rebased eabf00dba → master b5eb5b94e
  (journey-deepening r110, zero overlap; stop-at-pick quirk hit once on
  the revert pick, recovered verified-clean); proof re-run green 39/39 on
  the rebased tip; `src/js/` diff empty. Merged `--ff-only` onto
  b5eb5b94e; tip 44f8d3394 verified an ancestor of master. Tree released
  done-merged, branch deleted.

## Wall (standing report)

No new sim panel ran in this adoption run — both landed arms are
measurement/test maintenance (armorcap) and single-seed diagnosis
(routstall). No wall movement is claimed. Standing wall from the judged
corpora of the last measurement rounds (2130Z): wins 0, national 0,
table 0 everywhere; wave-5 unlocks/faced/kills 0; readiness-5 days 0;
living wave-4 killers at end 0. Wave-4 TB kills moved on armed legs
(survivaltime 1 → 9, ragerepress log 5 → 12) — the chain's first half
moved; the second half (killers living) did not.

## Telemetry deviation check

REFUSED / inapplicable on this run's corpora (same as 2130Z): the armorcap
corpus is a field-test corpus and the routstall corpus is a single-seed
diag reproduction — neither is a scale-wall per-seed panel, and no compare
`.md` is fabricated. Baseline NOT rolled. No LOUD lines.

## Infrastructure

- Pre-flight: main tree clean, disk 29%, `worktree-reap.sh` ran clean
  (removed nothing; LOUD notes only that drive64-a / bypass-b / tbend-a
  had uncommitted changes — never auto-removing; bypass-b's was the
  untracked 16-file pilot corpus this run's worker commits).
- Master moved twice under the run (brain-design doc d98899b1d; Loop A
  grind-a eabf00dba before that). Both landings rebased onto explicit
  master SHAs read immediately before rebasing; proofs green after every
  rebase and on every merged tip.
- Safe-commit index clobber hit the armorcap landing-record commit once
  (repaired via HEAD-blob cacheinfo, hashes verified byte-identical).
  No EPERM flap this run.
- check.js --quick on merged master aba30299d (both landings in, before
  journey r110 landed): **282 passed, 8 failed in 833s** — the standing
  2130Z profile (282/8). The 8: measurement-proof-update (#1353 stale),
  measurement-workflow, mobile-combat-cadence, occupation-panels,
  measurement-cache-flags, phone-frame-proof, capable-bot food-deed
  (#1830), establishment-r20-fixes — none touches the landed arms' files
  (the re-baselined cap test is in the 282). Log:
  `hidden_files/checkquick-0130.log`.
- Bypass worker: verdict NO-GO/KILLED, tooling landed (see Arm 3).
  Worker report received (done, "reverted branch ready"); verdict,
  numbers, and commits verified against the committed branch state
  itself (evidence + corpus committed, worktree clean, `src/js/` diff
  empty on the merged tip).

## Findings

- #1832 armor-cap stale bands: already marked [fixed] in sim-findings.md
  by the 2300Z worker; landing confirms it on master (cap test 291/0).
- Routstall's two named fixes (failed-verb treatment; beam
  repositioning) are open findings, already in sim-findings.md — both
  need a design call before any build.
- Bypass findings: the bypass ceiling is measured, not guessed — the next
  lever on survival time must move the median ORDINARY hit (damage
  reduction biting at 35–95 requested, avoidance on ordinary swings, or
  outgoing damage turning the solo best round into a repeatable round),
  Reunion first (13–14/46 lost fights, flat 6 rounds). The Finale-card
  half of the cap stays unmeasured (no Finale fight in the corpus) — a
  future wave-5 arm inherits that question. Metric-review proposals
  (re-anchor sizing on the run's own baseline leg; lost-only median in
  the analyzer; strict req-9999 cap-bite definition) are recorded in the
  bypass evidence §Metric review for the next run.

## Metric review (§14)

Adoption run — no new metric judged. Both landed arms were judged against
their own preregs by their workers (armorcap: derivation rule held as
written; routstall: D1/D2/D3 bars met). No re-scoring anywhere in this run.

## Next blanks (for the next Loop B run, in order)

1. The 41-HP grind / FINISHER-SIZE build (grind-a named lever, finding
   #1829): a committed finish for beasts met below their break line —
   sizing target 41 HP dead in the meeting (~3 rounds at field damage
   ~41/fight); 125 HP stays a TB job. Guardrail: the rounds-capping /
   armor-ignoring half belongs to bypass-b's verdict — read it before
   sizing.
2. Why the 51002 kill's fight never closed through tbEnd (engine-level).
3. 53004 trajectory fragility.
4. What the arena and "a stranger" are.
5. Measurement neutrality proof refresh #1353 (Oct 29 stale).
6. Capable-bot food-deed failure #1830 (owner: likely stayrecover).
7. Balance levers / flee-repair port / pellet-bearer lock (#1819) — all
   Steve calls; do not build without his ruling.
8. Bypass verdict + its next blank: ordinary damage / avoidance, Reunion
   first (see Arm 3). Do NOT re-apply the bypass cap — the ceiling is
   measured (+0.5 rounds) and re-running it would re-prove the same.

scale-onramp stays converging (NOT converged): wins are still 0
everywhere, wave 5 still 0, and no village has banked two living wave-4
killers and sat. food-economy stays converging (NOT converged, untouched
by this run). Claim deleted; lock deleted.
