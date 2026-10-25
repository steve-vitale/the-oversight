# sim-food-round-1937 — coordinator evidence (loop B, axis food-economy)

Run: fleshout-loop-b-20261025T1937Z (14:37 CDT 2026-10-25). Loop A live at
run start on scale-onramp (1915Z claim, w5chain + defwound, NOT touched);
A landed mid-run (791d5b2e9, w5chain DIAG-GO + defwound NO-GO) and started
a new run (2015Z claim, w4funnel + echodraft, NOT touched). This run
worked food-economy (converging), taking the 1849Z next blanks (1) and
(3) in order. Blank (2) (away-ration fix) NOT re-taken: its substance
already landed via the 1329Z adoption run (packtail top-up CONFIRM-GO +
awayvoice narration GO); what remains of that family is noted below, not
re-litigated here.

Both arms measurement only, zero src/js game-code changes, non-overlapping
files, safe together per ARM INDEPENDENCE. No push, no version bump, no
live verification — merged locally, pending ship.

## Pre-registration (coordinator level, written before any worker sims)

- Arm 1 sim-rotdecide2-b: next deciding rot corpus, preserver-widening
  pair parent 1f24a4ef04 -> commit 75fdd9258, inverted haul predicate as
  primary haul measure, rotcompanion template + haul/preserve action
  counts. Binding GO rule set by the worker in its own evidence header
  before any new corpus number was computed: G1 median absolute pd1 rot
  must fall, G2 at least one genuine (numerator-driven) down-move, G3
  denominator guard (pd0 absolute rot must not rise beyond the header
  bar). A denominator-driven step does NOT count as GO. Judged only
  against that header (§14 binding).
- Arm 2 sim-n2beast-b: N=2 flagging rule + Big Beast roster audit, audit
  method pre-registered before verdicts (falsifiable H1/H2/H3: roster /
  bug / churn).

## Arm 1 — sim-rotdecide2-b: NO-GO, LANDED

Worker commits 969e97f9e8a (instrument + pre-registration, committed before
any sweep) and 346d226840 (corpus + results, 82 files), rebased onto
master as a0aa29f08 + 2adf91784, proof re-run post-rebase (synthetic
25/25; worker's pre-rebase modes: synthetic 25, pilot 34, full-corpus 33,
all PASS), merged --ff-only.

Pilot (fresh seeds 9500-9507, 32 configs): PASSED as an instrument check
(32/32 files, 8/8 seeds classified, invHaulActions > 0 on all cells) —
not a verdict. Full corpus (fresh seeds 9500-9515, 64 configs, leadfeast /
dg1, 100d death-aware):

- G1 FAIL: median absolute pd1 rot 7,380 -> 9,353 (x1.267; needed
  <=0.95x). The typical depri-side village rotted 27% MORE.
- G2 FAIL: down split genuine 0 vs denominator-driven 1 + mixed 0
  (needed genuine >= 1). No genuine down-move exists in the corpus.
- G3 HOLD: median absolute pd0 rot 33,089 -> 24,264 (x0.733; guard
  allows <=1.10x).
- Ratio diagnostic only: M 0.297 -> 0.171 (step 0.574) — the ratio steps
  down while the verdict is NO-GO. The absolutes refuse the ratio's
  story. Companion word: DENOMINATOR-DRIVEN.
- Classes: identical 6, up 3, degenerate 6 (all undefined-ratio),
  denominator-driven 1, genuine 0, mixed 0.
- Haul/preserve (diagnostic, inverted predicate primary): median invHaul
  kcal pd0 93,738 -> 92,161, pd1 102,802 -> 95,158; census == invHaul on
  all 64 files (delta +0/+0 again; new haul classes still never fired in
  any traced event). Scholar attempts 0 everywhere (leadfeast, expected);
  villager resolutions medians pd0 39 -> 35, pd1 36 -> 33.
- Attribution answer: the sole down-move, seed 9514, is a fishing boom,
  not a preserve collapse — pd0 haul 64,449 -> 211,791 kcal, rot 67,894
  -> 402,985 absolute, Fish catch trace events 2 -> 118, while cooks were
  credited MORE on the depri side (41 -> 64 resolutions). Mirror seed
  9504 (up sharp): pd0 rot collapsed 78,748 -> 16,710 as haul fell — a
  better village scored as an "up." Degenerate seed 9509 hides a real
  pd1 improvement (haul 147k -> 263k, rot 105,853 -> 37,011) that the
  ratio cannot see.
- Sense: per-seed stories read for 9514, 9504, 9511, 9509, 9508/9515
  (zero-rot villages), and the untouched identical seeds; 8 trace re-runs
  byte-identical (md5-verified). Stated limit: no dialogue / goals /
  routines captured by this instrument — behavior sample is event-level
  only.
- Balanced panel (§15): attempted, failed in the pre-registered
  recorder-row ingestion class (TypeError reading 'days' at
  balance-scorecard.js comparePanels); no compare .md produced. The
  analyzer's paired tables in the arm evidence are the attached
  sweep-compare table. Tooling failure did not block or re-score the
  verdict.

What this means in plain words: on fresh ground, widening the preserver
does not make villages rot less — the depri side rotted more, and the
only village that "improved" did so because it caught an enormous amount
of fish, not because it preserved better. The old ratio said "improvement"
because the no-depri side rotted even more; the companion metric catches
exactly that trick. The preserver-widening step story is now: confirmed
on the old deciding metric (leg2decide 0.404x), contested on govern
(0.645x), and REFUSED on a fresh deciding corpus judged on absolutes.
The next run must not re-judge these corpora; it must decide what
question the preserver lever is even answering.

Wall (this corpus, SEATDRIVE=0 pre-seat regime — NOT a win-seeking run):
national 44/64, table 0 (construction), wins 0, wave max 4 in 24, 3 in 26,
2 in 12, 1 in 2, wave 5 in 0; median daysAlive 100 (18 early cells);
534 deaths — combat 43.8%, sickness 15.5%, monster 13.3%, starvation 7.3%.

## Arm 2 — sim-n2beast-b: RULE WRITTEN, LANDED

Worker commit 3733e4438, rebased onto master as e96801541, proof 14/14
post-rebase and on merged master, merged --ff-only. Zero src/js changes:
no label-generation bug was proven, so none was fixed.

- The Big Beast is a GENERATED VILLAGE-NAME ALIAS, not a roster monster,
  not a bug, not roster churn. Only two rows in the 96-seed corpus, both
  kind villager, player false: s73747 day 77 (gen_ooqx0fl) and s73796 day
  106 (gen_8mfjxe0). Proof chain: no match in monsters.json id / name /
  unknown / curated villageNames (72 entries); literal in no src/js file;
  complete production path expedition vDie -> villager-agency.js
  expedDeath (the ONLY registerDeath site with cause = monster display
  name) -> encounters.js encDescribeMonster -> game.js monsterDisplayName
  (villageName wins) -> generateMonsterName steady-temperament pool
  "The ${Cap} Beast" with default trait big. Both rows are genuine
  expedition deaths to a monster the village had already named.
- What the ledger cannot say: WHICH roster monster wore the name —
  expedDeath passes no monsterId (killerId null). The two seeds' Big
  Beasts may be the same monster or two different ones; the audit does
  not guess. New blank: thread monsterId through expedition deaths (the
  hurtVillager path already threads it into fallen entries).
- No other n=2 label exists in the 96-seed list (323 deaths, 31 labels).
  Same-shape labels at other counts: "Big Big" and "Big Loud" (both 1x,
  same steady generated pool). Contrast: "The Glow Stag" (1x) IS roster
  churn — a curated villageName for gallowdeer — proving the rule reads
  the roster file, not the string. Generated-name pool corrected during
  proving: 25 distinct names, not 27 ("Don't-Look" is trait-independent).
- The written N=2 rule (future arms MUST follow it): INVESTIGATE a
  flagged roster / true-name / descriptor label across >=2 seeds, or an
  unclassified label across >=2 seeds after checking whether monsters.json
  grew. HOLD (present alias, species unidentified — cite nothing further)
  a flagged generated-alias label; forbids citing it as a species, merging
  it into any roster entry, or dismissing it as noise; follow-up is
  species-ID only. HOLD (churn-candidate, cite nothing) a flagged label on
  exactly 1 seed at count 2. DISMISS as monster-name false positive ONLY
  a label already in the roster or the cited baseline — forbidden for
  generated aliases and unclassified labels. N=3 re-tune allowed ONLY if
  pre-registered before seeing the new pool's tail, naming the tolerance
  decision explicitly, AND reporting both N=2 and N=3 readings. This run
  does NOT authorize N=3 — Big Beast being a generated alias weakens, not
  supports, the "monster names need N=3" argument. A future arm writing
  "per sim-n2beast-b, N=3" has misread the file.

## Telemetry deviation check (this run)

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json --current 'evidence/2026-10-25/rotdecide2-b-corpus/*.json' --metrics national,table,wins,exiled`:
3 LOUD lines (national 12 -> 44, table 16 -> 0, wins 16 -> 0, n=80 files) —
all the KNOWN recorder-row counting mismatch class (checker reads
top-level panel paths the recorder rows do not carry; worker wall numbers
prove the fields exist under other names; WINSEAT baseline vs SEATDRIVE=0
pre-seat substrate; table/wins 0 by construction). Baseline NOT rolled.

## Infrastructure

- Safe-commit index clobber hit BOTH worker commits AND both rebases'
  aftermath checks (staged-deletion + untracked-twin variants) — commits
  always verified correct via HEAD blobs, indexes repaired via cacheinfo.
  Safe-commit rejects directory paths (worker worked around with an
  explicit *.json file list).
- Master moved 6 commits under the run (A 1915Z round + 2 journey
  commits); both branches rebased clean (zero file overlap), proofs
  re-ran green after every rebase. No EPERM flap hit on this run's writes.
- Loop A new run (2015Z, w4funnel + echodraft) live at closeout, NOT
  touched. Older B tree sim-fullpantry-casecount-b still shows uncommitted
  changes (not this run's; reaper preserved it, left alone).

## Village assessment (plain words)

The villages in the deciding corpus look like working villages: they haul
roughly a hundred thousand kcal, they preserve through villagers (not the
scholar's hands), they reach national about two-thirds of the time, and
they die mostly in fights, not from hunger. What they do NOT do is rot
less when the preserver is widened — and one village's "improvement" turns
out to be a fishing jackpot, which is the kind of story a ratio alone
would have sold as a preservation win. The death ledger, meanwhile, now
has a rule for its oddest entry: the beast that killed two villagers was
never a species at all, just a name the village gave to something it had
already met — and the ledger can now say so instead of pretending
otherwise.

food-economy stays converging (NOT converged): the deciding corpus
refuses the preserver step on absolutes, the N=2 rule is written and the
Big Beast is identified, but no food-economy game lever has landed from
this run, and the preserver question itself is now open (see next blanks).
scale-onramp stays converging (untouched; sibling loop A). Claim deleted;
lock deleted. Evidence: evidence/2026-10-25/sim-food-round-1937.md
(coordinator, this file) + sim-rotdecide2-b.md +
rotdecide2-b-corpus/ + sim-n2beast-b.md (all merged locally, pending ship).

## Next blanks, in order

1. The preserver question itself: what is preserver widening FOR, if a
   fresh deciding corpus judged on absolutes refuses it? A next arm must
   pre-register a new deciding question (not re-judge these corpora) —
   candidates: haul-throughput vs rot tradeoff, preserve-action counts as
   primary, or a different widening shape. Do NOT re-run the ratio as judge.
2. Thread monsterId through expedition deaths (n2beast blank): the
   hurtVillager path already threads it into fallen entries; expedDeath
   passes killerId null. Until then, generated aliases stay HOLD.
3. Away-ration remainder (from 1849Z blank 2, narrowed): packtail top-up
   + awayvoice already landed (1329Z); what remains unbuilt is the
   "floor/drop the hunger penalty on pack draws" piece, which still needs
   its own code read + pre-registration before any arm touches it.
4. Deathrow next bands start at 73821+ (73701-73818 taken; 9500-9515 now
   taken by rotdecide2 — future rot corpora must pick fresh bands).

## Metric review

- The companion metric did its job: it refused a ratio step that the
  ratio alone would have passed (0.574x). Future deciding corpora in this
  family must keep absolutes + classification primary; a ratio-only judge
  is now a known-bad instrument for this question.
- Degenerate seeds (undefined ratio, 6/16 here) are not empty data: 9509
  hides a real pd1 improvement the ratio cannot see. Future headers must
  state how degenerate seeds enter the verdict (here: classified, counted
  in absolutes, excluded from ratio only).
- The balanced panel still cannot ingest recorder-row corpora (fifth
  sighting class-wide; this run's instance at balance-scorecard.js
  comparePanels). Until fixed, sweep-compare tables remain the comparison
  of record for recorder corpora — the panel gap is a tooling blank, not
  a verdict input.
