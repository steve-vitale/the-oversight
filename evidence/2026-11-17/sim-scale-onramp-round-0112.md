# sim-scale-onramp-round-0112 — COORDINATOR EVIDENCE (run fleshout-20261118T0112Z)

**Run:** fleshout-20261118T0112Z · **Axis:** scale-onramp · **Type:** MULTI-ARM
(1 BUILD GO + 1 DIAG GO + 1 DIAG NO-GO-on-bar with measurement delivered,
all three merged locally pending ship).
**Master at closeout:** c3cbd100e (all three arms merged; Loop B evidence
0f38e4f9c landed mid-run, before the arm merges).

## Run prereg (coordinator header)

- **Primary metric:** the scale wall on the frozen band 103411–103418
  (national standing / rank, table, wins, wave-4/5 unlocks, median survival),
  plus per-arm frozen bars (see each arm's prereg).
- **Arms (planned up front, one shared baseline band):**
  1. sim-holdervoice-b — BUILD, finding #2505 (holder-half voice line).
     GO: every holder-range-0 blocked pick voiced exactly once on first day;
     0 lines on walkable picks; same-base no-line control byte-identical.
  2. sim-handoff-diag-a — DIAG, hand-off option for the range-0-holder
     design call. GO: all instances classified, ≤2 unknown.
  3. sim-notick-a — DIAG, fate of no-tick-after-commit plans.
     GO: all instances classified, ≤1 unknown.
- **Horizon/seeds:** frozen profilegate-b ON corpus, band 103411–103418,
  150d, PROFILEGATE=1+VETREENGAGE=1 (arms 1–2); arm 3 adds a fresh band
  103441–103448, 150d, same flags. Policies: competent-player policy
  plus the arms' recorders. Death-aware horizons per MEASUREMENT.md §§9–12.
- **Judge:** the frozen bar per arm; the balanced panel
  (`scripts/balance-panel.js`) is the instrument for any before/after.

## Run-start state

No Loop A lock existed; Loop B live on the winnability chain the whole run
(0026Z claim: fleerepair2-rejudge-b + seekgate-b) — NOT touched. Loop B
closed during this run (claim deleted by its coordinator; evidence
0f38e4f9c: fleerepair2 re-judge NO-GO, seekgate NO-GO, both HELD).
Pre-flight: main tree clean, disk 44%, reap ran (10/16 active, no
removals). Claim written before any sims:
`hidden_files/lever-claims/fleshout-20261118T0112Z.json` (axis
scale-onramp; arms sim-holdervoice-b, sim-handoff-diag-a, sim-notick-a).
Tracker next blanks at run start, in order: (1) range-0 holders
bidding/holding wave-4 plans — design call (Steve); (2) launched-party
damage wall — Loop B's territory, do NOT duplicate; (3) holder-half
fiction line (#2505); (4) no-tick-after-commit edge. All three arms map
to blanks (1), (3), (4).

## Arm 1 sim-holdervoice-b — BUILD GO (finding #2505 FIXED)

Fiction line in `writeCommit` (src/js/villager-brain.js, +32 lines, the only
src change), immediately after the #2499 companion block:

> "<HolderFirst> meant to walk out with <CompFirst> — but <HolderFirst>
> never leaves Haven, so <HolderFirst> stays home."

Guard: `party_launch` + companion + `npcMaxDist(holder) < 1`. Dedup:
separate `holderSaid` map, once per (holder, companion) pair — pair-keyed
because the line names a specific bid, mirroring #2499. When both holder
and companion are range-0, both lines fire (4 live pairs; two facts, not
a stutter). The #2499 companion line is byte-unchanged; the PROFILEGATE
measurement lever was re-applied worktree-only and reverted before commit
(verified: no `PROFILEGATE` in `src/`, `win-plan.js` untouched).
Full record: evidence/2026-11-17/sim-holdervoice-b.md (+ prereg);
proof test scripts/test-holdervoice-b.js.

**Bars (frozen, all pass; proof 40/40, re-run by the coordinator on the
rebased tip):** B1 25/25 holder-blocked pairs voiced exactly once, on first
day (band 103411–103418, 150d, PROFILEGATE=1+VETREENGAGE=1); B2 0 lines for
174 walkable-holder pairs, 0 orphans, ≤1 per pair; B3 staged fixture green
(all 6 cases, incl. both-range-0 firing both lines once each, companion
first, real names); B4 same-base no-line control byte-identical on all 24
structural fields, 8/8 seeds; sayCount diff 25 = 25 holder lines; B5 0
driver errors, policy sha frozen. `check.js --quick` 334 passed, 6 failed
in 581s — all 6 triaged by the worker, none traces to the line (2 load
timeouts pass on direct retry with the line in; 3 stale-proof + 1 ladder
control reproduce identically with the line stashed); the coordinator did
not re-run the ~26-min quick check (same as 2315Z).

**Wall numbers (this band, line-on):** national standing 1/8 (seed 103417,
450), national rank 0/8, table 0, wins 0, wave 4 unlocked 8/8, wave 5
unlocked 1/8, median survival 102.5d, 2/8 survive to 150d — identical to
homebodyvoice-a. The wall did not move.

**Notes:** seed 103414 carries no holder-blocked picks on this base (Giulia
flipped homebody→forager between the profilegate-b and homebodyvoice-a
bases; her ~60 range-0 depart holds became 3 forager picks). The
state-based B1 absorbed it — 5 other seeds carry the state. Declared in
the evidence, not re-scored. Sick/hurt/late-commit holder blocks remain
silent — follow-up arms.

**Disposition:** BUILD GO. Commits prereg e9ff51f02 + build c3cbd100e
[needs-eyes] (rebased). Merged ff-only onto b98dfeabc.

## Arm 2 sim-handoff-diag-a — DIAG NO-GO on the frozen bar, measurement delivered

Question for the Steve design call: when a range-0 holder blocks a wave-4
plan, could a walker in the same village hold it instead? Full record:
evidence/2026-11-17/sim-handoff-diag-a.md (+ prereg, Corrections 1–2);
proof test scripts/test-handoff-diag-a.js (32/32 on the branch).

**Classification tally (frozen profilegate-b ON corpus, band 103411–103418,
150d; 79 range-0-holder blocked selections):**
- **handoff-available: 28/79 (35.4%)** — same-day-only 22/50 (44%);
  stale-face-value 37/79 (46.8%). The defensible floor is 35%.
- **walker-exists-but-unavailable: 47**
- **no-walker-in-village: 0** — never fires; every blocked morning has walkers.
- **unknown: 4** — giulia day 68, yuki days 71–72, visjoin_59 day 77
  (no pool row on/before the day — a corpus recorder gap, finding #2510).

**What it means, in plain words:** hand-off is viable about a third of
the time, and it is usually a matter of letting the already-picked forager
hold the plan: **18/28 named walkers are the picked companion** — the dawn
bid already chose right; only the holder's range-0 stopped the party.
Named walkers are all foragers; **0/28 are wave-4 veterans** (18/28 have a
wave-3 kill). Hand-off buys departures by competent foragers, not proven
wave-4 killers. One forager, **Meera Reddy, is the named walker in 17/28**
available selections across three holders in seed 103414. Top proven blocks
on the 47 unavailable selections (per-walker): holding another plan 33,
away from Haven 28, onExped 1; 29 fully proven / 6 mixed / 12 resting on
stale-row state. **A hand-off rule must check holding** or it just moves
the jam from holder to walker. The share is an upper bound w.r.t. sickness
(unobservable for unpicked villagers); tight — sickness blocked only 4/113
selections in selblock-a.

**Drift note (carried from the pilot):** frozen instances do not reproduce
on current tip — base drift in the fight/expedition engine since
profilegate-b's frozen base, proven lever-independent by the OFF leg (first
divergence day 38 ON-leg day 56; pilot ON seed 103414: 0 range-0 departs
vs 57 frozen). The classification proceeded corpus-first on the frozen 79,
which is the task's instance set.

**Disposition:** DIAG NO-GO on bar 1 (unknown 4 > frozen ≤2) — the verdict
judges classification completeness, not the game: all 79 selections are
classified, the share is measured, and the design call has its numbers.
The frozen bar was NOT re-scored. Commits prereg 9df1ac9c7 + Corrections
acfee8a81, c15eb26c7 + classification b64fc044a (rebased to b98dfeabc).
Merged ff-only onto 1cac3ec33. DIAG only, net `src/` diff zero.

## Arm 3 sim-notick-a — DIAG GO (no fix built; fix is a candidate)

A part-3 commit with no tick left **evaporates overnight and the plan
carries on**. Full record: evidence/2026-11-17/sim-notick-a.md (+ prereg,
Corrections 1–2); proof test scripts/test-notick-a.js (29/29 on the
branch); tracer scripts/analyze-notick-a.js; fresh corpus
`evidence/2026-11-17/perseed-notick-a-on/` (8 files).

**Fate classification tally (combined, 17/17 named, 0 unknown):**
depart-next-day 6 (2 full party, 4 holder-only — companion
homebody/range-0 never started); depart-later 1 (full party, one-day gap);
re-bid-next-day 2, re-bid-later 4 (incl. tariq_mahmood: 3 no-tick commits
over 32 days in one plan, launched d126); holder-died-after 3 — all
unattributable to the commit on the backing rows (gen_4hoo6rr launched
d134, ten days *before* his d144 commit, died in the wild d147; david_kim
died d86 to a monster while his plan was live and attempting departure;
tom_baker died d99 to a monster with no departure attempted);
plan-deleted-after 1 — luis_fernandez, a horizon artifact (plan launched
d145, holder returned alive d150, run ended; the "close" d151 is
lastCensusDay+1); stall 0, village-ended 0, unknown 0.

**What it means, in plain words:** the commit's only demonstrated cost is
one lost part-3 action (an indoor chore hold instead of the core pick). No
traced plan was harmed by the commit, so per the frozen fix bar **no fix
was built** — the fix (defer a part-≥2 `party_launch` commit to the next
tick) is documented as a **candidate** needing its own arm + balanced
panel. Secondary metric: 38 party_launch commits at part ≥ 2 across both
legs, 0 launched same-day (10 frozen `night` resolutions prove ticks do
run after some late commits — a late launch is possible in principle, so
38 is a small sample for a safety claim).

**Instrument notes:** population correction (Correction 2, pre-evidence):
the frozen corpus carries **12** no-tick selections, not 4 — launched
instances carry no-tick commit days in their history too; GO bar corrected
to 12/12. **Classifier mislabel (finding #2508):** `classifySeed`'s
closeKind calls holder deaths `plan-deleted` — dead villagers drop out of
the daily roster, so its death detection never fires (david_kim d86,
gen_4hoo6rr d147). The tracer reads holder death from the `deaths` array
first; any arm judging a plan's end by closeKind alone inherits the
mislabel. D1 GREEN (seed 103441, 60d, twice, byte-identical) and D2 GREEN
(recorder ON vs OFF: fingerprint/daily/deaths identical) — caveat, as in
selblock-a: at 60d the funnel hasn't started, so D1/D2 prove trajectory
identity, not depart-recorder exercise. **Sense-testing:** the overnight
wait and the dawn re-bid are unvoiced — zero lines across all no-tick
windows say a party waited, re-bid, walked out short-handed, or that the
holder died. Extends finding #2499.

**Wall numbers (fresh band 103441–103448, PROFILEGATE=1, 150d):**
national standing **2/8** (430, 665), rank 0, table 0, wins 0, wave 4
**7/8**, wave 5 **2/8**, median survival **94d**, 1/8 survived to 150d,
753 deaths, 4 starvation. The wall did not move.

**Disposition:** DIAG GO. Commits prereg 0d0664cd1 + Corrections b7b367573,
e7ea86aac + tracer cc79ae382 + evidence 03be00fd2 (rebased to 1cac3ec33).
Merged ff-only onto 0f38e4f9c. DIAG only, net `src/` diff zero, lever
reverted.

## Post-merge proof re-runs (coordinator, merged master c3cbd100e)

- test-holdervoice-b.js: **40/40 green** (re-run on the rebased tip before
  merge, and again on merged master).
- test-handoff-diag-a.js: **31/32** on merged master (32/32 on the branch).
- test-notick-a.js: **28/29** on merged master (29/29 on the branch).
- The single failure in each diag test is the same branch-relative static
  check: "src/ diff vs base is EMPTY" with union
  `["src/js/villager-brain.js"]`. Proven an artifact, not a regression:
  `git diff` from each diag arm's frozen base to HEAD shows ONLY
  villager-brain.js +32 — the sibling holdervoice line ("never leaves
  Haven"). Both diag branches themselves have zero `src/` diff (verified
  pre-merge). The frozen preregs were NOT re-scored. Same class as the
  2315Z/1409Z branch-relative static-check artifact.

## Metric review

- **Holdervoice B1–B5:** all frozen bars pass as written; no re-scoring.
  The state-based B1 (pairs, not the exact d78 instance) absorbed the
  seed-103414 base drift — the right call, declared in evidence.
- **Handoff bar 1:** missed on the corpus gap (unknown 4 > ≤2), not on the
  measurement: every selection WITH a backing row is classified (75/75)
  and the share is computed over all 79. A NO-GO that delivers the numbers
  is the honest outcome; the bar stands for the next arm.
- **Notick bar:** GO on the corrected 12/12 frozen population (Correction 2
  was pre-evidence). The 17/17 combined tally exceeds the bar; the fresh
  band's 5 extra instances are a bonus, not a re-score.
- **Wall metric:** unchanged across all three arms' bands — national
  standing 1–2/8, rank 0, table 0, wins 0. The fiction line and the two
  diagnostics move no outcome, by design (fiction-only + diag-only).
- **Instrument caveat (carried):** D1/D2 at 60d prove trajectory identity,
  not depart-recorder exercise — the funnel hasn't started. Same as
  selblock-a; recorded, not hidden.

## Infrastructure

- Registration slow (~10 min for 3 trees): 11G checkouts grinding on slow
  I/O (`git reset --hard` the slow step, ~2–4 min per tree). No write flap
  — watcher ALL-OK throughout; no EPERM window this run. Last EPERM window
  23:26–23:31Z (2315Z run) already reported.
- One service restart killed the first notick tracer run (re-ran clean).
- Safe-commit index clobber struck all three workers (repaired via the
  documented `ls-tree -r | update-index --add --index-info` recipe;
  commits verified). No rebase stop-at-pick quirk on any of the three
  rebases (all clean, 5/5 + 4/4 + 2/2).
- Bare `git status --short` hangs for minutes in this tree (untracked
  scan) — use `--untracked-files=no` (notick worker note).
- Master moved once under the run (Loop B evidence 0f38e4f9c); all three
  branches rebased inside their worktrees onto the new tip before merging.
  Both arm commits verified ancestors of HEAD. No back-to-back round
  (all three arms landed; run past 100 min).

## Telemetry deviation check

REFUSED recorder-corpus input (same documented refusal as
1729Z/2025Z/2030Z/2230Z/2315Z/0026Z) — baseline NOT rolled. The check
refuses sweep recorder rows (all 8 `--current` rows carry top-level
`anchorCommit`) against a run baseline by design; recorder corpora are
compared with sweep-compare tables, never here. No LOUD lines, no
deviation to investigate.

## Findings filed

- #2505 FIXED (holder-half line landed c3cbd100e).
- NEW #2508 (closeKind mislabels holder deaths as plan-deleted).
- NEW #2509 (pre-System "A" names would read "A meant to walk out with A").
- NEW #2510 (hand-off unknown 4 are a recorder gap — no pool row on/before the day).

## Next blanks, in order

1. **Range-0-holder design call (Steve)** — now with numbers: hand-off
   viable 35% (28/79), never a veteran, usually the already-picked
   companion (18/28); any hand-off rule must check holding (33/47
   unavailable are holding another plan). Judge a fix on first-block share
   AND all-selection share.
2. **No-tick fix candidate** — defer a part-≥2 `party_launch` commit to the
   next tick; needs its own arm + balanced panel (do NOT land on the
   17-instance classification alone).
3. **closeKind fix (#2508)** — consult the deaths array; re-check past
   closeKind-based verdicts for moved fates.
4. **Bare-"A" guard (#2509)** — a shared guard so no say() line can ever
   print a bare "A" name.
5. **Hand-off recorder gap (#2510)** — mid-day-commit snapshot recorder,
   then re-run the classification to close the 4 unknowns.
6. **Launched-party damage wall** — Loop B's territory, do NOT duplicate.

scale-onramp stays converging (NOT converged): the holder half is voiced
and the hand-off option is measured, but wins still come only through
default-OFF courtship + seat instruments, only through the lesser seat,
wave 5 still 0 faced by a launched party, and no launched party has ever
killed a wave-4 beast on any band. The directive stands until the tracker
records this axis converged on measured evidence. food-economy stays
converging (parked); winnability chain stays converging (Loop B closed
0026Z: fleerepair2 re-judge NO-GO, seekgate NO-GO, both HELD). Claim
deleted; lock deleted. Evidence: this file. Arms merged locally, pending
ship: holdervoice-b (c3cbd100e), handoff-diag-a (b98dfeabc),
notick-a (1cac3ec33).
