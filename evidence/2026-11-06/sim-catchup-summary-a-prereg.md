# sim-catchup-summary-a — PRE-REGISTRATION (committed BEFORE any judged sim)

Worker: sim-catchup-summary-a (Loop A, food-economy / narration).
Run: fleshout-20261106T0315Z. Assignment: the catch-up wall follow-up
(sim-findings #1782, tracker 2115Z blank 2), the ALTERNATIVE shape to
the sibling installments arm (sim-catchup-install-a, separate worktree
— do not touch it, do not coordinate with it; only one of the two
shapes can land).

## The defect and its history (measured, not assumed)

- sim-awaynaming-rereg-a (31 seeds, GO, on master as c67e28ba2):
  the uncapped gate delivers ALL held naming lines verbatim on
  return. Biggest wall: **13 lines in one daily phase on seed
  17010** (return day 13: 4 word + 4 debate + 5 settle, 12 held at
  stretch end + 1 kicked on the return morning). Smaller walls:
  15221 (7 held lines, return day 37), 17016 (7 delivered, return
  day 13), 17020 (4 delivered, return day 10). Sense verdict of the
  rereg run: reads true — one coherent fireside catch-up — but 13
  lines is a lot for one day of play, and the remaining open item
  is the design follow-up on the catch-up wall
  (installments/summarizing), not a defect in the gate.
- This arm is the SUMMARIZE shape: on return, collapse the held
  lines into summaries instead of saying them verbatim.

## The summary shape (preregistered, exact wording below)

On a return that finds a non-empty awayNaming queue, delivery is
at most THREE lines, always in this order:

1. The framing line, once (unchanged verbatim from the rereg fix).
2. ONE burst summary line, only when >= 1 held burst (word/debate)
   line exists.
3. ONE settle summary line, only when >= 1 held settle line exists.

### Aggregation decision — stated openly, coordinator/Steve may overrule

The brief describes the shape as "collapse held burst lines per
monster into ONE summary line per monster, and held settle lines
per monster into one settle summary". Read literally
(per-monster summary LINES), that shape CANNOT meet GO (a) as
written on the known worst return: seed 17010 holds 13 lines over
at least 5 distinct monsters (5 settles alone are 5 distinct mids;
4 word/debate pairs are 4 more mids, 2 overlapping at most), so
per-monster lines would be 4 burst summaries + 5 settle summaries
+ framing = **10 lines**, against the (a) budget of 3. The (a)
parenthetical — "framing + <=2 summaries on the worst return" —
only makes sense if the summaries aggregate ACROSS monsters: one
burst summary + one settle summary per return, with ONE CLAUSE PER
MONSTER inside each (monster name + that monster's count). That is
the shape preregistered here: per-monster ACCOUNTING (every monster
named with its exact count) inside per-kind summary LINES. If the
coordinator wanted literal per-monster lines, GO (a) would need
re-registration — this run judges (a) as written.

### Exact wording

Framing (unchanged, once per non-empty delivery):

> While you were away, the haven argued over what to call it — they catch you up at the fire:

Burst summary — template (singulars adjusted: "1 beast — 1 word,
1 debate"):

> They argued over names for 4 beasts — 4 words, 4 debates: "The Loud Beast" (2), "The Ugly Beast" (2), "Judge Hoot" (2), "The Big Beast" (2).

Template: `They argued over names for {B} beast{s} — {W} word{s},
{D} debate{s}: {clauses}.` Clauses are `"FirstProposal" ({n})`
per monster, in queue order (first-held first), where n is that
monster's held burst lines (normally 2 = 1 word + 1 debate). The
clause name is the monster's FIRST PROPOSAL — the name quoted in
its held debate line (`Object.values(proposals)[0]` at delivery,
stable: proposals only grow and insertion order is fixed, so it is
the name the debate line used). It is real content from the held
line, not invented. If a monster has a held word but no proposal
(empty roster at seed time — no debate line was kicked), the clause
falls back to `monsterDisplayName(mid)` (the strange descriptor).
The header carries the word count and the debate count SEPARATELY
so the ledger can be checked per kind (see (b)).

Settle summary — template (singular: "1 beast"):

> They settled names for 5 beasts: "Big-Eyes", "Ugly-Eyes", "Judge Hoot", "Old Ugly", "The Loud Beast".

Template: `They settled names for {S} beast{s}: {names}.` Names are
the villageNames in queue order, verbatim from the held settle
lines. The count S == the number of names listed == the number of
held settle lines (exactly 1 settle line per mid ever — the code
sets villageName once). The beast count IS the carried line count
for settles.

### Sense-check of the wording (drafted here, judged in the evidence)

- Nothing in either summary is invented: every name comes from a
  held line (first proposal / villageName), every count is the exact
  number of held lines, and the only added words are the count
  frame ("argued over names for", "settled names for") — which
  restate what the held lines themselves say ("the argument
  starts", "It's settled").
- No fabricated debate content: the proposer, the exact debate
  wording, and the back-and-forth are compressed away — that is the
  summary's price, stated here, not hidden. The player learns WHICH
  beasts were argued over and settled, and HOW MANY lines each
  stands for; they do not learn who proposed what or the exact
  words.
- Known linkage limit, stated honestly: a monster whose debate and
  settle are both held gets a clause in BOTH summaries — the burst
  clause under its first-proposal name, the settle clause under its
  villageName. When those two names coincide the player can connect
  them; when they differ (debate "The Ugly Beast" -> settled
  "Ugly-Eyes") the summaries do NOT assert which debate led to
  which settlement. The verbatim delivery had the same gap except
  for order/proximity; the summary loses even that hint. The sense
  test in the evidence file judges whether the summaries still read
  true and complete despite this.
- The framing line's singular "what to call it" is kept verbatim
  from the rereg fix even when several beasts were debated — it is
  the established framing, and changing it is out of scope.

### Worked worst return (17010, from the rereg after corpus)

13 held lines (4 word + 4 debate + 5 settle) become 3 delivery
lines: framing + burst summary (4 beasts — 4 words, 4 debates) +
settle summary (5 beasts). 15221: 7 held lines -> 3 lines (burst:
3 beasts — 3 words, 3 debates; settle: 1 beast). 17016: 7 -> 3.
17020: 4 -> 3 (burst: 1 beast — 1 word, 1 debate; settle:
2 beasts). Every held return on the 31 seeds collapses to <= 3
lines by construction (framing + at most 2 summaries).

## Canon

No single canon doc covers naming-news delivery position or
catch-up summarization. The design lives in
evidence/2026-11-05/sim-gossipcensus-a.md (the defect),
evidence/2026-11-05/sim-adoption-round-1715.md (the gossipfix
kill + fix direction), evidence/2026-11-05/sim-awaynaming-rereg-a.md
(the verbatim uncapped gate now on master, incl. the quoted wall),
and evidence/2026-11-05/sim-adoption-round-2115.md (the 2115Z
verdict + metric review). docs/CONVERSATIONS.md (dialogue/gossip)
read; no canon doc prescribes the naming debate's delivery
position or its summarization. docs/CANON.md standing rule "If you
don't know, it doesn't show" supports holding unheard haven talk.
If no doc covers a target, this prereg says so instead of inventing.

## Band freshness (whole-token grep, ALL dated preregs + evidence .md)

Scope searched: `evidence/*/sim-*-prereg.md` (the rereg prereg's
own freshness record, 2026-11-05, stands: the band is NOT fresh —
every seed is named in prior preregs of the same lineage:
sim-gossipcensus-a-prereg.md, sim-gossipfix-a-prereg.md,
sim-awaynaming-cap-a-prereg.md, sim-awaynaming-rereg-a-prereg.md).
REUSE IS BY DESIGN, not a fresh-band claim: before/after on
identical seeds is the methodology (§15), and the rereg corpus
itself is STALE on current master, so the BEFORE leg MUST be
re-run on current master first. No fresh band is claimed anywhere
in this arm. The rereg prereg is the freshness record for this
lineage; this prereg adds no new seed.

## Primary metric — GO threshold (a): the wall

Max single-day DELIVERY <= 3 lines on EVERY seed. Delivery lines
= framing lines + summary lines said in one loop-day (any phase).
Natural at-Haven kicks said the same day (lines kicked after the
return, said immediately) do NOT count — they are not delivery.
Measured by the compare from the corpus's recorded summary/framing
lines per loop-day (see "Instrument additions"). GO iff the max
over all judged seeds is <= 3. A miss is NO-GO, never re-scored.

## Guardrails (all must hold for GO)

(b) REVISED LEDGER (preregistered here): each summary line carries
the count of kicked lines it stands for, and the compare checks
the conservation identity with summary counts in place of verbatim
lines, PER KIND per seed:

- word: verbatim word lines said + SUM(burst-summary word counts)
  + stillHeld word == kicked word.
- debate: verbatim debate lines said + SUM(burst-summary debate
  counts) + stillHeld debate == kicked debate.
- settle: verbatim settle lines said + SUM(settle-summary counts:
  beast count == names listed) + stillHeld settle == kicked
  settle.

where `kicked` is the ledger count (word: monsters with
namingKicked; debate: kicked monsters with >= 1 proposal; settle:
monsters with villageName), `stillHeld` is the awayNaming queue
contents at end of run (the queue still holds VERBATIM entries —
summarization happens at delivery, not at hold — so stillHeld
counts lines exactly as before), and the summary counts are parsed
from the delivered summary text by the compare (patterns in
scripts/policies/gossipcensus-diag.js, the single source of truth;
the compare ALSO checks each summary line's internal consistency:
SUM(per-monster clause counts) == words + debates for burst
summaries; names listed == beast count for settle summaries; any
parse failure or inconsistency fails the run). GO iff the identity
holds exactly on all judged seeds, per kind — 0 lines lost, 0
lines unaccounted. If this accounting proves unworkable (the
delivered text cannot be parsed back to exact counts), the arm is
NO-GO ON DESIGN GROUNDS: report that plainly, do NOT fudge the
meter. The before leg (verbatim delivery on current master) must
satisfy the OLD identity (said + stillHeld == kicked, summary
counts 0) — it drops nothing by construction (uncapped queue).

(c) 0 stranded burst events + 0 stranded settles (rereg primary
definitions, unchanged: stranded sleep windows with >= 1
primary-burst event, adjacent word+debate = 1 event; stranded
settle lines counted separately). GO iff 0 on the AFTER leg.

(d) TRAJECTORY IDENTITY vs the fresh before leg on all seeds
(daysAlive, endReason, stranded nights, stranded sleep windows,
non-stranded sleep windows identical per seed). Summarization must
be RNG-neutral by construction (same argument as the rereg gate:
rotLine draws zero RNG; proposals are seeded either way; only the
`say` is gated; the summary reads live codex state at delivery —
no fresh roll). Trajectory identity (d) proves it empirically.
GO iff all judged seeds match.

(e) SENSE: the evidence file quotes the summaries verbatim (every
summary line delivered on the judged seeds, or the full set on the
worst returns + a sample elsewhere) and judges they read true and
complete — counts honest, names real, no invented content, the
linkage limit (above) acknowledged. A summary that miscounts or
misnames is NO-GO on sense even if the numbers pass.

## Staging (pilot gate, §9–12)

- PILOT (8 seeds, judged first, before any confirm spend):
  17021, 15003, 15009, 15091, 15211, 15215, 15220, 15221 (the
  census pilot, verbatim). Pilot GO = (a) AND (b) AND (c) AND (d)
  AND (e) on the pilot seeds. The pilot's before leg is judged
  against the FRESH before pilot (not the stale rereg corpus).
- CONFIRM (runs ONLY if the pilot passes): the remaining 23 seeds
  17001–17024 except 17021. The full 31-seed after corpus is the
  union of pilot + confirm; no seed is re-run. Full GO = (a)–(e)
  on all 31 seeds.
- If the pilot fails, KILL the arm: revert the game code, delete
  policy files, leave no trace — report the kill with numbers.

## Horizon, seeds, policies (death-aware, never fixed-200d)

- Horizon: 60 loop-days (the census horizon; dead villages stop
  simulating). Driver: scripts/gossipcensus-trace-a.js reused
  VERBATIM except the observational additions listed under
  "Instrument additions" below (reads only, no RNG, no state
  edits — disclosed here before the before leg; the det-gate
  proves they change no trajectory). Policy stack identical
  (bankfood(warmed(woodcarry(nighttravel))) over competent); env
  COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
  POLICY=nighttravel WOODCARRY=1 WOODWARM=0 BANKFOOD=1
  STRANDNARR=1. Before-corpus OUTDIR:
  evidence/2026-11-06/sim-catchup-summary-a-baseline/;
  after-corpus OUTDIR:
  evidence/2026-11-06/sim-catchup-summary-a-corpus/.
- Comparison instrument: scripts/awaynaming-compare-summary-a.js
  (NEW, this arm — adapted from scripts/awaynaming-compare-rereg-a.js:
  same stranded/ledger/stretch/trajectory machinery, with the
  summary-count ledger (b) and the max-single-day-delivery check
  (a) added; the before leg is current-master VERBATIM delivery,
  not the r141 relay, so relayDropped is expected 0 and the
  reconciliation is saidA_eff − saidB == stillHeldB − stillHeldA).
  Reads both corpora, judges this prereg. Exit 0 iff GO. Invoked
  with explicit --before/--after/--out flags (defaults point at
  the summary dirs). --pilot-only judges the pilot subset.
- Balanced panel (§15): before-panel on the PRE-FIX worktree and
  after-panel on the FIXED worktree, same scope as rereg:
  `node scripts/balance-panel.js --root <worktree> --seeds
  17021,15003,15009,15091,15211,15215,15220,15221 --policies
  capable --days 60 --out evidence/2026-11-06/sim-catchup-summary-a-panel-<before|after>`,
  then `compare --before <before>/panel.json.gz --after
  <after>/panel.json.gz --out evidence/2026-11-06/catchup-summary-panel-compare`.
  Expected decision: `no_material_signal` (the change is
  narration-only); rereg got `review_required` with every metric
  delta exactly 0 (coverage-driven, not a signal). The panel
  decision is recorded as returned; trajectory identity (d)
  remains the judge for gameplay neutrality. If a panel errors for
  reasons unrelated to the change, that is reported, not hidden.

## Instrument additions (driver + classifiers, observational only)

Committed BEFORE the before leg, in the instrument commit (the
prereg commit carries the prereg only):

1. scripts/policies/gossipcensus-diag.js gains ADDITIVE exports
   only (existing classifiers untouched): `isFramingLine`,
   `isBurstSummaryLine`, `isSettleSummaryLine`, `parseSummaryLine`
   (pure string functions: the framing regex, the burst-summary
   regex with header word/debate counts + per-monster clause
   counts, the settle-summary regex with beast count + quoted-name
   list; parse returns `{kind, words, debates, beasts, clauses}`
   or null). No state, no RNG.
2. scripts/gossipcensus-trace-a.js analysis gains `allSummaries`:
   every framing/burst-summary/settle-summary line anywhere in the
   run, with idx/loopDay/phase/text + parsed counts (read via the
   diag classifiers). trimTranscript ALSO keeps summary/framing
   lines (they would otherwise be discarded from the corpus).
   Reads only; no RNG; no state edits.
3. No other driver change. The STRANDNARR=0 det-gate leg runs the
   same driver with the recorder off.

## The fix (this arm, not a cherry-pick)

- `src/js/game.js` `deliverHeldNamingNews` ONLY: group the held
  entries by mid (queue order preserved); emit the framing line
  once; emit ONE burst summary line for all held word/debate
  entries (clause per mid: first-proposal name + that mid's burst
  count; header word/debate counts = the sums); emit ONE settle
  summary line for all held settle entries (villageName per mid, in
  queue order). `holdNamingNews` UNTOUCHED (uncapped push — the
  queue still holds verbatim entries; summarization happens at
  delivery only). `sayNamingNews`, `returnToVillage`, and the three
  call sites UNTOUCHED. No gate/price/deed change. [needs-eyes]
  stays in the fix commit message (narration/feel change).
- Proof test scripts/test-catchup-summary-a.js (NEW, this arm,
  committed with the fix): unit leg — (1) held lines for one
  monster collapse to framing + burst summary carrying the right
  count (word 1, debate 1, clause (2)); (2) multi-monster collapse
  incl. a monster with burst+settle held -> exactly 3 delivery
  lines, queue drained, parsed summary counts satisfy the revised
  ledger; (3) cap leg carried over: hold 20 lines directly ->
  queue holds ALL 20 -> delivery is still <= 3 lines; (4)
  stranded delivery still 0 (nothing said while away; queue holds
  the lines); (5) in-haven burst still says immediately (no hold
  when playerAtHaven); (6) framing line matches no burst/settle
  classifier pattern. Integration leg: det-gate (d-a) on fixed
  code (17021 + 15003, STRANDNARR 1 vs 0); anchors re-pinned from
  the FRESH before leg (17021 days/end; 15003 loop-day-7 sleep
  window Word line — re-verify from the before leg, do NOT trust
  the r143 pin; the proof test pins whatever the before leg shows
  and the evidence records it). Usage env identical to the rereg
  proof test.
- scripts/test-awaynaming-cap-a.js + scripts/test-gossip-position-r141.js:
  their delivery assertions expect VERBATIM held lines; this fix
  changes delivery on purpose, so their delivery legs are UPDATED
  in the fix commit to expect framing + summaries (hold/gate/cap
  legs unchanged). Design changed on purpose — update the test in
  the same commit and say so (green-list rule). No other test
  changes.

## Metric binding

Pre-registered metrics bind this run. A miss is NO-GO, never
re-scored against a friendlier metric mid-run. If a metric proves
wrong, it goes under "metric review" in the evidence file with a
revision proposed for the NEXT run. Every evidence file carries a
"metric review" section. The (b) revision above is written here,
before any judged sim — it is the prereg, not a revision.

## Wall numbers (carried, NOT re-measured)

Narration fix corpus; records no scale outcomes. Carried state
from the 1041Z round (0915Z run, 24 distinct seeds): wins 0/24,
national 0/24, table 0/24, wave-5 0/24, readiness-5-ready days
0/24.

## Deliverables

- evidence/2026-11-06/sim-catchup-summary-a-prereg.md (this file,
  committed BEFORE any judged sim, including the before-panel)
- scripts/policies/gossipcensus-diag.js (additive summary
  classifiers) + scripts/gossipcensus-trace-a.js (allSummaries
  recording + trim keep) — instrument commit, before the before leg
- scripts/awaynaming-compare-summary-a.js (before/after
  comparison; reads both corpora, judges this prereg)
- evidence/2026-11-06/sim-catchup-summary-a-baseline/ (per-seed
  JSON from the verbatim driver on pre-fix code; 31 files)
- evidence/2026-11-06/sim-catchup-summary-a-panel-before/
  (§15 before-panel)
- src/js/game.js — deliverHeldNamingNews summarization only.
  Commit message carries [needs-eyes] (narration/feel change).
- scripts/test-catchup-summary-a.js (proof: unit collapse +
  revised ledger + cap + stranded-0 + det-gate + anchors)
- scripts/test-awaynaming-cap-a.js + scripts/test-gossip-position-r141.js
  (delivery assertions updated for the summary shape, same commit)
- evidence/2026-11-06/sim-catchup-summary-a-corpus/ (per-seed
  JSON from the verbatim driver on fixed code; 31 files)
- evidence/2026-11-06/catchup-summary-compare.md (+ .json) —
  the before/after comparison output (pilot + full)
- evidence/2026-11-06/catchup-summary-panel-compare.md (+ .json)
  — the §15 balanced-panel comparison
- evidence/2026-11-06/sim-catchup-summary-a.md (verdict judged
  strictly against this prereg, per-seed table, wall numbers, a
  SENSE-TEST quoting the summaries verbatim, metric review)
- Zero policy changes. No gate/price/deed change. No push, no
  bump, no live verification (coordinator merges via --ff-only;
  ship loop owns deploys).
