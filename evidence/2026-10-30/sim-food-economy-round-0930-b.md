# sim-food-economy-round-0930-b — coordinator evidence (Loop B, axis food-economy)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261030T0930Z.
Axis: food-economy (second non-converged axis; sibling loop A live on
scale-onramp the whole run under claim fleshout-20261030T0855Z,
arms sim-removal-a + sim-stalkertick-a, NOT touched — A landed
sim-removal-a (70ae4c83c) and sim-stalkertick-a (e5e5daf60) onto
master mid-run; both B branches were rebased onto the moving
master cleanly and re-proven before merging, see Infrastructure).

Pre-flight: main tree clean, disk 18%, reap 5/16 active at start
(held sim-lackingline3-b, dead-run trees sim-warmthrestraint-b +
sim-woodshortline-b, A's sim-removal-a + sim-stalkertick-a — all
untouched, nothing reaped).

## Arm 1 — sim-woodday-b: NO-GO (daytime wood-recovery probe killed, measurement stands)

The 0830Z run's named next blank: daytime wood recovery, the only
named route to a warmth middle after R1/R2 proved guard-equivalent.
Pinned base aa0573202 at prereg time (prereg 680363a43, before any
judged leg); rebased onto master twice at landing (first onto
8aed42529 after A's removal landing, then onto e5e5daf60 after A's
stalkertick landing), proof re-run green after each rebase, merged
b708a63ac. Zero src/js changes; probe policy is a new opt-in file
scripts/policies/woodday.js, never a default.

Bank: the 10-seed woodwarm qualifier bank (15003, 15009, 15091,
15211, 15215, 15220, 15221, 15337, 15376, 15439), 30 loop-days,
POLICY=nighttravel, COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0,
DEPOSITGATE=1, WOODCARRY=1, WOODWARM=0|1.

Fresh baseline, NO DRIFT — reproduces 0830Z exactly: guard 15 creek
/ 4 still / 11 rescued (15215 strand days 7–9); ON+warmth 21 / 11 /
10, warmth acted 6, log-spent 4, 15215 strand days 7–16.

Census answer, plainly: pack wood NEVER increases during daytime
on a stranded sequence. All 11 strand-pair daytime deltas are
exactly 0 (ON: 0 positive / 9 zero / 0 negative; guard control:
0 / 2 / 0). Overnight reconciliation holds on every pair (morning
wood = post-evening wood, 0 mismatches); morning carry never acts
inside a strand; gathering-verb lines on stranded days are zero
across all legs (cutTree 0, clearBrush 0, fallen-tree 0, pile-take
0). The bot never gathers wood by day because no policy calls
cutTree or clearBrush, and forage yields plants, never wood.

Probe (policy-side morning-gather: act when pack < 4, an adjacent
tree stands, and kcal covers the cut): built because the
pre-registered window was technically met, and FAILED its GO bar,
so NO-GO. The only adjacent-positive stranded morning bank-wide
is seed 15009 day 13 (1 adjacent tree) — but its pack already
holds 4 logs and its evening fails kcal-short (24 kcal), not
wood-short. Every pack-short stranded morning (15215 days 10–16)
wakes treeless AND broke (morning kcal 0–31, below cutTree's
80-kcal cost). Probe legs: acted 0 / 300 days (skips: at-haven
282, pack-ready 11, kcal-floor 7). GO bar: (a) stranded evenings
11 → 11, fall 0 < 3 — FAILS; (b) rescued 10 → 10 — holds;
(c) no narration lie in sense-read tails — holds. The adjacent
morning cut is not the warmth middle. Killed arms leave no trace:
the probe policy stays as an opt-in measurement instrument only,
never a default, and no behavior changes.

Sense-read PASS: full 15215 strand days read end to end (nights 7,
8, 9, 10, 13, 16 + day-17 rescue). Every wood count, bridge line,
and fire line matches its record, including the singular "1 log"
night 13 and the 0→4 haven-carry refill on day 17. Pre-existing
ambient wrinkles only (fireside gossip on fireless nights — same
class as 0830Z). Proof scripts/test-woodday-b.js 20/20 +
woodwarm regression ALL GREEN, re-run green after each rebase
and post-merge in the main tree.

Full detail: evidence/2026-10-30/sim-woodday-b.md (merged
b708a63ac).

## Arm 2 — sim-wall-b: wall snapshot (measurement only)

Current-master wall numbers on competent play, answering the
standing-directive requirement this run with real numbers instead
of the 0830Z NOT OBSERVABLE. Pinned base 70ae4c83c at prereg
time (prereg 08225f8ca, before any judged leg); merged
8aed42529 (base was already current master tip at merge — no
rebase needed). Zero src/js changes, zero policy-default changes.

Panel: scripts/policies/competent.js, defaults only, seeds
9981–9988, 180d death-aware, n=8. Per-seed corpus:
evidence/2026-10-30/sim-wall-b-corpus/ (+ panel validity clean,
panel agrees with the sweep on every judged field for all 8
seeds; panel compare .md deliberately NOT produced — a compare
needs a before/after pair and this arm has no lever pair, and
comparing the panel to itself would be fabricated; the
identical-seed corpus is the §15 substitute, stated in prereg).

Wall numbers:
- National 0/8, table invited 0/8, table entered 0/8, wins 0/8
- Wave 4 unlocks 4/8 (9982, 9985, 9986, 9988), wave 5 unlocks 0/8,
  max wave 4
- Median survival 180 AT CAP (5/8 survived to cap), max 180;
  village-lost 3/8 (days 39, 109, 173)
- Vesting 0, Arc 3 on 8/8, rank village on 8/8
- Deaths 339 total; monster deaths dominate (monster:combat 152,
  monster:villager combat 85); villager-side: the wild 35, wounds
  13, sickness 12, starvation just 1

Plain-words verdict: competent villages live, learn (9981: plants
13→55, codex monsters 4→30, 41 skills), and stay put — the wall
face on competent play is rank progression, not survival. Seed
9981's standing climbed to 75 by day 160 with rank NEVER moving
off village: that is the wall in miniature. Convergence state:
converging, with the numbers. Proof scripts/test-wall-b.js 25/25
green, re-run green post-merge, including a determinism
spot-check (fresh child sweep of seed 9981 reproduces the corpus
row exactly).

Full detail: evidence/2026-10-30/sim-wall-b.md (merged 8aed42529).

## Village assessment (plain words)

Two pictures, same lesson. On the creek bank, one village (15215)
told twice: caught at a creek, burning bridge logs night by night
for warmth while starving (strand mornings at 0–31 kcal), then
walking home day 17 with a refilled pack — or walking home day 10
with its 4 bridge logs intact when warmth never lights. The
refusal lines stay honest about the exact lack every night. On
the wall panel, villages that live six months, learn dozens of
skills, and never become regional: survival is solved on
competent play, rank is not. Nothing here says the village
thrives or starves in the long run beyond that — the creek legs
measure narration honesty on stranded evenings, the wall legs
measure reachability on competent play.

## Reachability

Creek/bridge content reached (21 creek evenings, 10 rescued
crossings per warmth leg). Wave 1–4 reached on the wall panel
(wave 4 on 4/8 seeds); wave 5, regional/national, the table, and
vests reached on 0/8 competent seeds — reported, never zeros
hidden. No game change landed, so no reachability change is
claimed.

## Wall numbers (this run's standing-directive report)

National 0/8, table 0/8, wins 0/8, wave 4 unlocks 4/8, wave 5
unlocks 0/8, median survival 180d at cap, max 180d. See Arm 2.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-10-30/sim-wall-b-corpus/*.json' --metrics
national,table,wins,exiled` on the wall corpus: 3 LOUD lines
(national 12 → 0, table 16 → 0, wins 16 → 0, n=8 seed rows);
exiled clean. This is the KNOWN WINSEAT-baseline vs
competent-regime artifact already recorded by the 0635Z run and
the wall worker's same-run investigation: the baseline is a
winseat-regime baseline, these legs are competent-regime legs
with no seat pursuit. Investigated same-run, not a regression.
Baseline NOT rolled. (The wall worker's first ingest attempt
failed on the combined corpus file — "no seed rows" — fixed
with the per-seed split; the coordinator check above uses the
per-seed glob.)

## Infrastructure

- Wall branch merged --ff-only on its pinned base (already
  current tip); proof 25/25 post-merge; worktree released as
  merged, removed, branch deleted.
- Woodday branch rebased cleanly twice onto the moving master
  (A's removal + stalkertick landings, no conflicts); proof
  20/20 re-run green after each rebase and post-merge; worktree
  released as merged, removed, branch deleted.
- First woodday merge attempt FAILED LOUDLY in a lock race with
  A's stalkertick landing (git index-lock contention; merge did
  not land, branch intact at a634e33cb, main tree clean) — the
  landing was retried after A released its trees as done-merged
  and succeeded (b708a63ac, verified by rev-parse + log + file
  presence, not by the merge line alone). Lesson carried: verify
  HEAD after every merge on this hot tree; a merge line in a
  piped tail is not proof.
- Safe-commit index clobber hit worker commits on both arms
  (committed files showing staged-as-deleted, worktree files
  byte-identical to HEAD) — repaired via HEAD-blob cacheinfo
  each time, commits verified correct, worktrees clean at
  closeout.
- Post-merge proofs in the main tree: woodday 20/20, wall 25/25,
  woodwarm regression ALL GREEN.
- Main tree clean at closeout. No push, no bump, no live
  verification. Merged locally, pending ship.

## Metric review

- Pre-registered bars bound both arms; no re-scoring occurred.
  Woodday's probe GO bar was judged exactly as written (fall
  0 < 3 = NO-GO) even though the census technically met the
  probe-build window — the window authorized building the
  probe, not passing it.
- The wall arm's metric wrinkle is recorded in its evidence:
  sweep-compare `table` counts invitations while the panel
  contract counts sittings; both are reported with definitions,
  and a future run quoting only "table" must state which.
- The "verdict does not travel with a rebase" handling held:
  woodday's judged legs ran on pinned base aa0573202 and the
  rebase changed no game code under them (sibling landings were
  scale-onramp evidence + instrumentation, wall measurement;
  proofs re-ran green on the rebased branch and post-merge).
