# sim-scale-onramp-round-1639 — stale-lock recovery + adoption closeout (tributecost DIAG-NO-GO adjudicated, refusalsay Confirm GO)

Run: flesh-out loop, run fleshout-20261030T1639Z. Axis: scale-onramp
(blocking axis, converging, NOT converged). Sibling loop B live on
food-economy — NOT touched: no loop-B trees, claims, or axis.
Sibling gaps-completion loop active throughout (its own trees,
claims, and merges) — not touched; master moved under this run
three times (fullseatgate 3dbfe5f76 → loop-B recovery 0fd9f2058 →
infra-regatomic 881604799, the atomic-registry-write fix for the
morning's empty-registry crash).

## Stale-lock recovery (read first — this run adopted a dead run)

The 11:15 CDT schedule fired at 16:34Z to find loop A's lock held
by run fleshout-20261030T1427Z (created 14:27:35Z, >90 min old)
with its worktree heartbeats stale at 15:51Z (>15 min). Per the
concurrency guard the previous run was DEAD no matter how fresh
the lock looked: lock deleted, its claim retired to
`.DEAD`, and this run's claim
(`hidden_files/lever-claims/fleshout-20261030T1639Z.json`) written
BEFORE any sims. Pre-flight: disk 20% (pass); main tree held two
0-byte gapscomp probe files (`evidence/probe-gapscomp2.tmp`,
`probe-gapscomp.tmp`, 16:25Z) — recoverably trashed (trash ids
20261030-163813-8e75cf1f633b400696c447393fa2ca58 and
20261030-163815-9f962e9cdfac4756b76f1e3494ca7985, restorable),
after which `git status` was clean. Registry backed up before any
heartbeat (`hidden_files/REGISTRY-backup-20261030T1640Z.json`;
the morning's heartbeat-script truncation is why). Adopted trees
re-heartbeated (tributecost 16:43Z, refusalsay 17:01Z, then
17:29Z); reap refused all dirty trees, so no adopted corpus was
at risk at any point.

The dead run's third arm, sim-fullseatgate-a, had already merged
(3dbfe5f76, PILOT-FAILED table 4/8, wave-deed lead) — not re-done
here. Its other two arms were mid-sweep with uncommitted corpora
and were adopted, not restarted: restarting would have thrown
away finished seeds and re-spent the EPERM flap's damage.

## Arms (both DIAG/measurement only — zero game-code changes)

### sim-tributecost-a — DIAG-NO-GO (bar 2 alone), adjudicated and MERGED

Evidence: `evidence/2026-10-30/sim-tributecost-a.md` (recovery
closeout + adoption addendum). Commits on master (rebased clean
4/4 onto 0fd9f2058): 3786e0639 prereg, 5e9729faa instrument,
0413c62bc closeout, 045e3ca1b adoption addendum. Proofs re-run
green by the coordinator: zero-feasibility 16/16, recorder 18/18.

Question (finding #1540): does tribute outflow kill leanlink
villages, and why did leanlink 9912 fall with fewer deaths than
its surviving competent twin? Answer: NO — Haven pays 0 kcal of
tribute in either column (no `payTribute` ever fires); leanlink
takes IN 175,218 kcal / 74 arrivals and pays 46,417 kcal / 23
accord gifts; sweeteners 0. The flipped-link cost appears only
as arrears + breakage (9911: 2 broken links × 5,000 arrears).
The 9912 paradox is explained, not a paradox: leanlink 9912's
pantry collapsed ~day 90 and never recovered, population bled
11 → 2, final death thirst day 138 with pantry 0, while its
three subordinates sat on ~44,000 kcal each. Plain words: the
climb costs margin, not tribute — a village that climbs has no
slack left when a bad week comes.

Verdict detail: bars 1, 3, 4, 5, 6 PASS; bar 2 (recorder
completeness, strict count==days) FAILS on three village-lost
leanlink runs (165/166, 128/129, 158/159) because the loss day's
post-daily never runs — no loop-day data is missing (snapshot
counts match the harness's own sample counts exactly). The
adopted worker first drafted a GO on an operative definition and
WITHDREW it as re-scoring, forbidden by §14; the recovery
coordinator and the worker concur on DIAG-NO-GO. Adjudication
(this coordinator): the HELD flag meant "no merge until
adjudicated" — this is the adjudication. A NO-GO verdict is not
a merge ban (dissolveprobe NO-GO merged at round 1315); the
evidence, instrument, and corpora land with the verdict intact,
and the bar-2 fix is next-run work, not a merge blocker.
Confirm band was STOPPED per the pilot gate (leanlink 7/10 +
competent 1/10 partial data committed and labeled partial, no
conclusion claimed). Tribute-zeroing leg STOPPED per prereg:
engine floors tribute at 4,000 (formation) / 5,000 (counter) —
no policy-side path to 0, no hack attempted.

Pilot wall numbers (9911–9918, 180d): competent national 0/8,
table 0/8, wins 0/8, wave 5 0/8, lost 1/8, median 180d;
leanlink national 5/8, table 4/8, wins 0/8, wave 5 0/8, lost 4/8,
global 2/8, median 180d.

### sim-refusalsay-a — Confirm GO, MERGED

Evidence: `evidence/2026-10-30/sim-refusalsay-a.md` (pilot +
confirm). Commits on master (rebased clean 7/7 onto 881604799):
410fc8179 prereg, 720f82ce7 amendment, a96fcb5ad instrument,
d9cac56cf closeout, 9dd3fb94b correction, 11aecfb98 confirm,
7074478fb summary. Fixtures re-run green by the coordinator
post-rebase: 107/107.

Question (finding #1539): confirm the gate text (have/need) on
the 120 dissolved rows from dissolveprobe, with say-text capture
and no removeWorldMonster wrap. ANSWERED on both bands, 197/197
rows: every dissolved row is a muster-gate refusal of THE HERALD
— no elimination rows, no unknown-say, no campaign gate. Gate
text, identical on all 197 rows (distinct sayTexts = 1): "⛔ THE
HERALD does not notice you the way prey notices a hunter. It
notices you the way weather notices a field. You cannot face
this alone — sound the call, muster 10 allied blades (you have
0). This is not courage. This is arithmetic." Every row: have 0
/ need 10. Fates: pilot SCHOLAR-RESTORED 75 / SPAWN-ENDED 45;
confirm SCHOLAR-RESTORED 52 / SPAWN-ENDED 25. The open follow-up
remains WHY a muster never forms (have 0 on 197/197) — already
logged in the backlog, not re-logged here.

Pilot wall numbers (75101–75108): won 6, nationalEver 6,
nationalFinal 6, tableReached 7, tableEntered 6, wave 8/8/7/5/0,
median 114d, deaths 232 — zero divergence vs the dissolveprobe
pilot. Confirm wall numbers (75117–75128, own band): won 3
(full 0), nationalEver 8, nationalFinal 6, tableReached 6,
tableEntered 3, wave 12/12/11/9/0, median 143d, deaths 458.
Full seat 0 on both bands; wave 5 0 on both bands.

Balanced-panel §15 comparison: declared non-applicable in the
prereg for this DIAG-only instrument arm (identical-seed
substrate + wall recomputation instead) — stated in the arm
evidence, no panel compare fabricated. Substrate on the confirm
band reported as n/a per prereg (no draftflag comparator on
that band), never as a pass.

## Reachability verdict (this run)

Waves 1–5: 1–4 reached across all bands; wave 5 reached 0/8,
0/8, 0/12, 0/12. Regional → national: reached (leanlink 5/8,
refusalsay confirm 8/12 ever). Table: reached (leanlink 4/8,
refusalsay 7/8 pilot, 6/12 confirm) but entered-and-won only as
lesser seats; full seat 0 everywhere. Win flag: lesser-seat wins
only (refusalsay pilot 6, confirm 3). Nothing in this run moves
the wall: the wall is now precisely instrumented (tribute
exonerated, muster-gate refusal confirmed), not breached.

## Village assessment (plain words)

Competent villages are homebodies that live: they survive, climb
nowhere, win nothing. Leanlink villages are climbers that burn:
half reach national, half sit at a table, half die doing it, and
none wins or reaches wave 5. The scale wall is a margin problem,
not a tribute tollbooth — and the endgame door is a muster
problem: the Herald's gate asks for 10 allied blades and the
village has 0, on every refused row, on every seed, on both
bands. Until a muster can form, the full seat stays decoration
behind an arithmetic wall.

## Blanks filled or documented

- FILLED (landed): tribute quantification (#1540) — paid 0,
  income 175,218 kcal, paradox explained; refusal confirmation
  (#1539) — 197/197 muster-gate refusals, have 0 / need 10.
- DOCUMENTED (not chased): bar-2 loss-day snapshot gap (fix:
  end-of-run pantry/population snapshot + bar rewording);
  balance-panel single panels for the tributecost pair
  (panel-driver sims required; compare expected invalid by
  structure); walk-away-from-counters and pay-in-full policy
  variants (prereg-named); sweetener trigger (0 firings on 8
  seeds); why a muster never forms (backlog, open).
- Backlog touched by the tributecost worker, not duplicated
  here: items 1547/1548/1549 updated, #1540 adjudication
  recorded. No new backlog items from this run.

## Metric review (for the NEXT run, not this verdict)

- Bar-2 wording (tributecost): "count == result.days" fails by
  exactly 1 on village-lost runs whose loss day yields no
  post-daily snapshot. Next prereg should word the bar as one
  snapshot per completed post-daily (days, or days−1 on
  village-lost runs), AND the recorder should take an end-of-run
  pantry/population snapshot alongside the existing end-of-run
  link snapshot. Until one lands, bar 2 stays NO-GO on a strict
  reading — neither arm softened it.
- The confirm band itself reproduces the −1 pattern (leanlink
  9924: 157/158; 9925: 124/125), supporting the loss-day
  mechanism; the dispute between the closeout's strict verdict
  and the original worker's implied looser reading is resolved
  here in favor of the strict reading (§14 binds).
- Refusalsay confirm telemetry: no confirm telemetry leg in the
  prereg; the pilot check's REGIME-artifact verdict covers this
  policy regime (see telemetry section below).

## Telemetry deviation check (coordinator, this run)

`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-10-30/perseed-refusalsay-a-confirm/*.json'
--metrics national,table,wins,exiled --sweep-rows` → LOUD:
table −62% (baseline 16 → current 6), wins −81% (baseline 16 →
current 3). Verdict: REGIME ARTIFACTS, explained, baseline NOT
rolled. The baseline file itself warns against comparing
pre-seat/courtship/readiness substrates to the winseat regime
("wins are structurally ~0 there"); the refusalsay band runs
tableseat-nowait policy, not the winseat stack. Caveat: the
check counted 24 rows for 12 distinct seeds (census + fresh
files both ingested), so its per-row aggregates are NOT
per-seed wall numbers — the worker's analyzer wall numbers
above stand. No telemetry movement here is attributable to
either arm (both changed no game code). The tributecost arm's
own check reached the identical REGIME verdict in its evidence.

## Convergence state

scale-onramp stays CONVERGING (NOT converged): full seat 0,
wave 5 0 across every band this run; the muster-never-forms
question is now the sharpest open item on the axis, and the
tribute-cost question is closed. food-economy untouched
(sibling loop B lane).

## Landing

Merged locally, pending ship. No push, no version bump, no live
verification (ship loop owns deploys). No [needs-eyes]: no feel,
combat, or UI change in either arm. Both worktrees released,
removed, and branches deleted; main tree clean at closeout.
