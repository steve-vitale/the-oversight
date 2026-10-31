# Loop B round 1047Z — food-economy ADOPTION run: sim-morningcarry-b finished, NO-GO (coordinator evidence)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261031T1047Z, axis food-economy.
Adoption base at worker start 6856df77f; rebased clean onto master 3d38fb65a
(Loop A 0915Z coordinator evidence) before landing; proofs re-run green after
the rebase (test-morningcarry-b.js 14/14 with judged corpora incl. det-gate +
byte-identical determinism, test-morningcarry-trace-b.js 6/6) and the branch
merged --ff-only. Merged locally, pending ship. No push, no bump, no live
verification (ship loop owns those).

## Stale-lock recovery at start

The previous B run (0841Z) never closed: its lock was 122 min old with no
matching registry entry, its morningcarry tree heartbeat 19+ min stale, and no
morningcarry/axefirst/warmthfuel processes running. Per the run guard it was
treated as dead: lock deleted, its claim retired to .DEAD at closeout (note
attached). Its axefirst-b and warmthfuel-b arms had already landed on master
(bc9183089, ed67d1bf6); only morningcarry-b was stranded, mid-confirm
(prereg + probe instruments committed as 0e7957b3b + 13eb26b70, pilot +
partial confirm corpora uncommitted). The old tree's uncommitted corpora were
backed up to hidden_files/adopt-1047Z/ before any reaping, and the old tree
itself was never touched by the adoption worker. Loop A held a live claim on
scale-onramp (0915Z: heraldcontact / pocketdesign / spearxbow) for the whole
run — NOT touched; A closed mid-run (coordinator evidence 3d38fb65a on
master). Build lanes (lootabilities, journey) NOT touched.

## The arm: sim-morningcarry-b (adoption)

Morning-side food mechanism for the 15215 strand, next blank (1) from the
0741Z B review: half (a) wake pack-eat (first upkeep after day change, before
the routine's own upkeep) + half (b) haven-departure pack carry (pantry
staples, longest shelf first, up to DAYWANT 2000 pack known-kcal). Policy
prototype only: one new policy file, zero edits to existing policy files,
zero src/js, zero default flips. Prereg (evidence/2026-10-31/
sim-morningcarry-b-prereg.md) committed before any judged leg by the original
worker and honored verbatim by the adoption worker: all judged legs re-run
fresh on the adoption base (the old base-003a9c2f3 corpora are reference
only). Cherry-picks verified content-identical to the stranded commits
(empty diff on all introduced files).

Pilot (sniff only, 8 seeds, ON variant): PASS — 8/8 files, errs 0, the single
15215 ON still evening (loop 4) complete, half (b) evaluated on haven
mornings (11 acted departs), half (a) evaluated on the strand morning
(loop 5 wake-eat, ate 2400).

Confirm (8 seeds x 6 legs: guard/ON x control/variant/OFF, + ON-variant
determinism re-run, byte-identical): control via trace driver, variant/OFF
via morningcarry driver, substrate FATAL-asserted. OFF det-gate exact on
every seed, both legs. All 8 seeds survived 30d on all 6 legs; median
survival 30 vs 30.

Primary metric — 15215 stranded-evening census (still = woodcarry bucket
creek + rescued false):

| leg | control still | variant still | fall |
|-----|---------------|---------------|------|
| ON  | [7–16] (10), run 10 | [4] (1), run 1 | 9 |
| guard | [7–9] (3), run 3 | [4–6] (3), run 3 | 0 |

Verdict against the prereg GO clauses — NO-GO (coordinator adjudication:
verdict stands as measured; no re-judgment):

- (a) Fall >= 2 on ON with causal link — FAIL as written. The fall bar is
  met (9), but the causal-link bar is not: the prereg requires a half-(a)
  firing on a strand morning within the control strand's day range (7–16);
  the only ON firing is loop 5, outside it. Control evenings 7–16 were
  prevented by trajectory-wide daily feeding (half (b) fires nearly every
  haven morning from loop 1), not the hypothesized day-7 → day-8 chain.
  The worker evidence notes NO-GO stands under either reading of (a),
  because (c) fails independently — the coordinator concurs.
- (b) Strand length non-increasing on either leg — PASS (ON 10→1, run
  10→1; guard 3→3, run 3→3).
- (c) Guardrails — FAIL. Newly ticks-short still evenings (ON 15211 0→1;
  guard 15211 0→2; guard 15215 1→2); creek still counts up on non-strand
  seed 15211 ([] → [28,29] ON, [28,29,30] guard); earlier/new vessel
  deaths (15215 ON day 17→9; 15215 guard none→days 6,17; 15211 none→day
  17; 15337 none→day 27). Held: median survival, no game-overs, zero
  'Someone watches' / 'Caught' lines.

Sense test: PASS. Every half-(a) firing narrated ("You eat from your pack
before the day's walk — morning food, carried from home"), every day-7
departure narrated ("You pack N portions from the pantry for the road"),
rescued evening shows the bridge ("You lash logs together…"). The 15211
loop-29 failure is narrated too (wake-eat +1400, still stuck on wood 0 —
food can't fix a wood-bleed evening).

NO-GO cleanup (coordinator commit 87d73e509, 597 deletions): the lever
prototype (scripts/policies/morningcarry-diag.js), its driver
(scripts/morningcarry-driver-b.js), and its proof test
(scripts/test-morningcarry-b.js) are deleted — killed arms leave no trace.
Kept: evidence, prereg, censuses, paired compare, all corpora (pilot,
judged, det), trace instruments, and both standalone analyzers, so the
census remains reproducible from the corpora. Safe-commit index clobber hit
the cleanup commit (index showed staged additions for the deleted files);
repaired via `git update-index --force-remove`, verified `git status`
empty + `git diff HEAD` empty, commit verified correct.

## Wall numbers

30-day pre-seat strand census: national / table / wins NOT observable —
reported as such, never fabricated. 15215 max wave 1 → 2 on both variant
legs; nothing else moved. Overall wall UNCHANGED: full seat 0, wave 5
reached 0 stands.

Telemetry deviation check on the judged ON-variant corpus (8 files):
3 LOUD lines (national 12 -> 0, table 16 -> 0, wins 16 -> 0) —
INVESTIGATED as the known WINSEAT-baseline regime artifact (30-day
pre-seat strand-census inputs in which national/table/wins are
structurally unobservable, against a wall-band baseline); exiled clean;
baseline NOT rolled forward.

## Village assessment (plain words)

Feed the traveler at dawn and pack road food at departure, and the famous
ten-evening stranding on seed 15215 collapses to a single evening — the
food half of the trap is real and fixable. But the lever as built feeds
the traveler every single morning from day 2, which re-routes the whole
month: the original stranding never even forms, so the "cure" can't be
tied to the evenings it was meant to cure, and on a second seed (15211)
the same daily feeding manufactures a brand-new stranding at the far end
of the month plus new traveler deaths. Food also cannot fix evenings
where the traveler simply runs out of hours (fed evenings still end
ticks-short) or evenings where the wood has bled away (wood 0). The
morning-food idea survives as a design; this whole-trajectory build of
it does not.

## Metric review (carried; revisions apply to the NEXT run)

- The causal-link clause's trajectory-alignment assumption breaks by
  construction for a whole-trajectory lever: the next run should gate
  packing to strand windows (or re-bar the link) before re-testing.
- Vessel-death guardrails as written are near-unpassable under ordinary
  trajectory divergence; the next run should define that guardrail
  against game-over days or per-seed death counts, not first-death-day
  movement alone.
- Fed-but-ticks-short is real: a future fix must reckon with the
  96-tick bridge budget and wood-bleed, not kcal alone.

## food-economy status + next blanks

food-economy stays converging (NOT converged): the strand is now priced
on five gates plus a joint gate that never holds, evening banking closed,
a morning-food lever measured and killed on guardrails (this run) — but
no strand fix has landed and no food-economy default flipped. Next
blanks, in order: (1) a strand-window-gated morning-food design (pack
only pre-strand, or wake-eat only), pre-registered before judged sims;
(2) a fed-evenings fix that reckons with ticks + wood-bleed, not kcal
alone; (3) an axe-supply-first design before any fell-based fix is
re-attempted; (4) the lacking-line wording decision
(name-first-plus-count recommended) and the warmth-fuel decision, both
still awaiting a design owner; (5) the two Steve-call items (competent
courtship drive; generation-dealt vs earnable vests) and the warmth
default still await rulings. scale-onramp untouched (sibling Loop A
lane).

## Disposition

Worktrees released as merged, branches deleted: sim-morningcarry-adopt-b
(adopted arm + cleanup + this evidence). Stranded tree
sim-morningcarry-b released and removed, branch deleted (its committed
content survives verbatim in the adoption cherry-picks; its uncommitted
corpora survive in hidden_files/adopt-1047Z/). Claim retired to .DEAD;
lock deleted. Evidence: worker evidence
evidence/2026-10-31/sim-morningcarry-b.md + paired compare
sim-morningcarry-b-compare.md + censuses + corpora (on master); this
coordinator evidence (on master). Merged locally, pending ship.
