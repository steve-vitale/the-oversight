# sim-scale-onramp-round-0215 — coordinator evidence (run fleshout-20261030T0215Z)

Axis: scale-onramp (converging, NOT converged). Sibling Loop B live on
food-economy for the whole run (0130Z claim: raidname-b1-b +
lackingline-woodshort-b, NOT touched — B landed its own round mid-run as
676de8486, zero overlap with this run's files). Pre-flight: main tree
clean, disk 20%, reaper removed nothing. Worktree registration was slow
(reap's git status + 55k-file checkouts, ~9 min for the second tree) but
succeeded; no EPERM flap this run. Safe-commit index clobber hit all
worker commits on both arms (staged-deletion / stale-blob variants);
workers repaired via HEAD-blob cacheinfo with hash verification each
time, coordinator verified status empty after every merge.

## Plain words first

Two threads from the join story close out here, and neither moves the
scale wall — which is itself the finding. First, the narration thread:
solo fights that ended silently now end with an honest line, exactly
like the shout-joined fights did last run. Second, the party thread:
the tracker asked for a counterfactual — if every villager standing on
the tile joined, would fights flip? The answer is no, for a plain
reason: most of the time there is no party on the tile. In 19 of 26
joined fights the tile held exactly one mate — the one who already
joined — so a take-everyone rule changes nothing for 73% of joins. And
where mates do exist, they still don't add enough: the full party
needs 3.6x its observed damage just to drive the beast off at the
median. Party formation is not the scale-onramp fix. What remains is
changing what a fight is for (survival-flip targeting, the wounded
beast's free flee, the wave-4 meeting shape) or answering the
floor-timing Steve-call — not counting heads on the tile again.

## Arm 1 — sim-soloendlines-a (backlog #1458, LANDED, narration only)

Worker commits (rebased onto 676de8486, fixtures re-run green
post-rebase, merged --ff-only): prereg 30acf6816, tooling a4c710691,
game change 190658258, evidence 07475b1ef — all [needs-eyes].
Change: src/js/fieldFights.js, 15 insertions, 1 deletion, gated on
!shoutJoined && !opts.allyFromStart in the same two branches
joinendlines-a touched: (a) solo break branch: "<Monster> breaks —
wounded past its line, it turns and runs." (b) solo floor branch:
"<Villager> is past holding — they run while running still works."
Joined lines and allyFromStart endings byte-unchanged. Zero mechanism
change.

Binding prereg verdict: NO-GO as written. Metric A (literal
classifier) 165/672 = 24.6% vs bar >= 80% (min-n 2 met). Metric B
12/12 solo floor-flees carry line (b) — GO. Stray lines 0 — PASS.
Neutrality PASS (per-seed rows byte-identical after stripping logs).
Sense PASS (3 transcripts read end to end).

Decomposition (identical both legs): break branch (the silent blank)
165/165 carry line (a) in after; bow drive-offs 507/507 already carry
their own line ("drove X off with the bow — it broke before it ever
closed") and never reach the break branch; trick terms-of-service 4
carry their own line. Solo vFlee: floor 12/12 carry line (b) in after
(0/12 before — the blank confirmed); hopeless 69 and learn 3 each
carry their own lines. The prereg classifier, copied from
joinendlines-a, missed the bow marker — invisible there because a bow
drive-off fires before round 1 and a shout can only fire at round
>= 2, so the joined corpus could never contain one.

COORDINATOR DECISION (documented for Steve's overrule): the change
LANDS under the corrected classifier — bow fights excluded because
they already end with a line and were never part of the blank. Under
that correction the retained corpora judge A 165/165 GO, B 12/12 GO,
stray 0, neutrality PASS, with no new sims required. The binding
prereg verdict stands NO-GO as written in the worker evidence; the
landing decision rests on the category error being proven (a fight
that already ends with a line is not a missing line), not on a
threshold being softened. The change is narration-only and
revertible. Coordinator post-rebase proof: fixtures 23/23 pure +
24/24 engine green, and a fresh sweep re-run on the rebased branch
reproduced the after leg exactly (wall numbers below, 0 recorder
errors).

Wall numbers (identical both legs, per seed): won 6, full seat 0,
national ever 6, national final 6, table 7, entered 6, wave 4 reached
5, wave 5 reached 0, median survival 114d, starvation deaths 2,
deaths total 232. Per seed days/won/deaths: 75101 115/won/26, 75102
86/lost/45, 75103 90/won/16, 75104 101/won/31, 75105 165/won/59,
75106 115/won/26, 75107 114/won/20, 75108 31/lost/9. Re-derivation
note: this before leg reproduced the published joinendlines numbers
exactly — no substrate drift this run (contrast joinendlines-a's own
divergence note, backlog #1457, which stays open as a warning for
other bands).

## Arm 2 — sim-partycounter-a (tracker-directed counterfactual, DIAG-GO, NOT-BRIDGEABLE)

Worker commits (rebased onto 5d40ae91c, analyzer re-run green
post-rebase, merged --ff-only): prereg 086396c52, instruments
f039b28b9, evidence + corpus 999f64748. Measurement only, zero
src/js. Coordinator re-ran scripts/test-partycounter-a.js on the
worktree before merging: MACHINE-LEGS-PASS.

Question: if every tile mate at shout time joined at observed rates,
do kill/survival flips become bridgeable? Band: seeds 75101–75108,
180d death-aware, tableseat-nowait, own before leg re-derived (this
band diverges from shoutrec's published band — won 6 vs 3, deaths 232
vs 311 — per backlog #1457, no published number quoted as current;
verdict rests on paired legs within this band only).

Results (26 joined fights of 214 fought; 19 addressable, 18/19 =
94.7% priced finite for both flips, DIAG-GO bar >= 80% PASS; the one
miss is an active-zero-dealt death, counted not dropped):
- Single-ally before leg on the same fights: median kill 6.49x,
  survival 4.28x.
- Party primary (every tile mate at the joined ally's observed rate):
  median kill 5.83x, survival 3.56x. Per-mate sensitivity (each mate's
  own observed DPR): medians identical — 13/18 addressable fights
  have N=1, where the two pricings coincide by construction.
- Shares (party survival / kill): <=1x 16.7% / 0.0% (3/18, 0/18);
  <=1.5x 27.8% / 11.1%; <=3x 50.0% / 38.9%; <=5x 66.7% / 44.4%.
- Flips at 1x: party at observed rates rescues 1 of 11 lost (vFlee)
  addressable fights on survival, 0 of 11 on kill. The other two
  <=1x survival prices are fights that already drove off.
- Wave-split (party survival median): wave 1 PARTIAL 2.42x (n=8);
  wave 2 PARTIAL 1.91x (n=2, flag only — both N=1, so no party effect
  at all); wave 3 NOT BRIDGEABLE 4.31x (n=5); wave 4 wall 69.34x
  (n=3; sensitivity 27.85x, still a wall).
- Tile-mate counts (all joined): N=1 in 19, 2 in 2, 3 in 1, 4 in 3,
  6 in 1 (mean 1.69). Only 5/26 fights have N>2.
- Floor branch, separate (never folded): 7/26 = 26.9% zero-window
  joins, including one N=4 fight — party damage cannot fix timing;
  still a separate Steve-call question.
- Perception-law compliance: shout-time tile presence provable from
  recorded state (fight is one synchronous call; no advancePart /
  nodePos write in fieldFights.js); no roster feed anywhere. Join
  integrity 0 errors; joined ally in tileAll for all 26; shoutAllyDealt
  = 0 throughout. Sense 4 transcripts read (incl. s75104 d17 Najat vs
  anaconda, N=2: second fed mate Chantal stands on the tile all six
  rounds and never appears in a line — the fiction gap a party rule
  would need to answer, not a damage gap).

Verdict: DIAG-GO on the instrument, NOT-BRIDGEABLE on the question.
Do NOT build a party-join rule to close this gap — it may be worth
building for feel, but on this evidence it is not a scale-onramp fix.
No one-ally or entry-strength change proposed or built.

## Wall numbers (this run, judged corpora, report-only for diverging prototypes)

Won 6, full seat 0, national ever 6, national final 6, table 7,
entered 6, wave 4 reached 5, wave 5 reached 0, median survival 114d,
starvation 2, deaths 232. Full seat still 0, wave 5 still 0, wins
still only via default-OFF instruments and the lesser seat.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-10-29/perseed-partycounter-a/on/*.json' --metrics
national,table,wins,exiled` → LOUD national 12 -> 0, LOUD wins
16 -> 0; table and exiled clean. Verdict: the KNOWN WINSEAT-baseline
regime + field-shape artifact class (same as every run since 1955Z;
per-seed rows lack top-level national/wins paths; actuals national
ever 6, wins 6). Baseline NOT rolled.

## Metric review

- Soloendlines classifier: add the bow marker ("off with the bow")
  and the poison marker ("VOMITS out of the fight", 0 in-band) to
  the mflee-other list in any future solo-ending prereg. The
  joinendlines classifier was sufficient for joined fights only.
- Partycounter: no metric revision proposed; the party median is
  now measured, not proxied, and the N=1 dominance (73%) is the
  structural result, not a sample-size artifact (addressable n=19
  >= 8 floor).
- Panel: before/after comparisons in this run are paired legs on
  identical seeds through the arm analyzers (the §15 panel
  instrument was not re-run as a separate compare .md because both
  arms judge paired legs within their own corpora; wall numbers are
  reported per seed above for panel re-check).

## Sense-testing note

Narration now reads honestly at every solo ending shape measured:
solo drive-offs close with the break line, solo floor flees close
with the past-holding line, bow drive-offs already had their line,
and joined endings kept theirs. The remaining fiction gap is
behavioral, not narrational: a second tile mate who stands through
a whole fight and never acts (partycounter S1) — a party rule would
need to answer why she waits, and on damage evidence alone that
rule does not earn its place.

## Context note (arrived mid-run, not a driver of this run)

MEMORY.md gained a 2026-10-29 22:02 CDT note during closeout (gate
sequencing: Steve is fine changing gates but asks whether sim /
villager behavior has been proven normal first; win-prices must not
be lowered to match broken behavior). No gate changed in this run,
and no win-price was touched — consistent with that note. It bears
on the next scale-onramp arm's design: prove behavior normal before
tuning gates to it.

## Infrastructure notes

- Master moved twice during this run (sibling B round 676de8486 and
  the prior B/journey landings); both arms were rebased clean onto
  the moving tip (zero src/js in the master movement), proofs
  re-run post-rebase, then merged --ff-only. No merge conflicts.
- Coordinator's own sweep re-run in the solo worktree left 9
  untracked fresh corpus files; deleted before rebase (worker's
  committed corpora untouched).
- Rotation file NOT advanced (convergence work supersedes the
  rotation; documented for Steve's overrule). Sibling trees present
  at closeout left alone.
- Merged locally, pending ship. Do NOT push, do NOT bump — the batch
  ship job owns deploys and live verification.
