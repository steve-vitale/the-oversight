# sim-causebase-audit-b — AUDIT of the pooled death-cause baseline (axis food-economy, MEASUREMENT ONLY)

Run: fleshout-loop-b-20261025T1530Z (Sun 2026-10-25, loop B, second axis).
Worker tree: ~/workspace/worktrees/sim-causebase-audit-b. Axis: food-economy.
MEASUREMENT ONLY: ZERO src/js game changes. Existing files only; NO new sims
run in this arm. This arm audits the already-landed pooled baseline
sim-causebase-b (commit f810314b8: evidence/2026-10-25/sim-causebase-b.md,
evidence/2026-10-25/sim-causebase-b-baseline.json,
scripts/analyze-causebase-b.js, scripts/test-causebase-b.js).

Question (tracker 1430Z next blank 1; sim-findings line 993): does the landed
pooled baseline already satisfy the "pooled baseline cause list before any
'new death mode' guardrail reuse" blank — or is a new corpus still needed?

Canon read first: docs/CANON.md, then docs/PRESERVATION.md (the food ladder).
No canon doc covers death-cause taxonomy — the causes here are the engine's
recorded labels, not canon, and no label is invented, renamed, or merged in
this audit. The audit judges the baseline against the pre-registration below
only.

## PRE-REGISTRATION (written BEFORE the verdict — criteria restate the assignment's audit checklist as pass/fail bars)

A pooled baseline satisfies the "new death mode" guardrail blank iff ALL of
C1–C5 pass. C6–C7 are scope/documentation bars: a failure there does not
mean the numbers are wrong, but it does mean future arms cannot cite the
baseline blind — a C6/C7 failure caps the verdict at PARTIALLY SATISFIES
even if C1–C5 pass. No new corpus is required by any criterion below unless
a C1–C5 bar fails.

- C1 REPRODUCTION: re-running scripts/analyze-causebase-b.js on the 6 landed
  corpora reproduces the committed JSON exactly — 1,302 rows, 0 kind
  exclusions, 732 scholar exclusions, 570 villager deaths, 48 labels, pooled
  cause counts identical, output byte-identical to the committed file.
- C2 SCALE: pooled villager deaths an order of magnitude above a single
  8-seed band (a band yields ~30 villager deaths; bar: >= 300 deaths across
  >= 100 runs), so a pooled zero is meaningful where a band zero was not.
- C3 POPULATION SEPARATION: scholar/villager separation verified from the
  corpora themselves (not from the md's prose), and the kind filter's
  exclusions recomputed on independent data (deathcensus baseline side).
- C4 SEED DISJOINTNESS: seedOverlap empty across the 6 corpora — no
  trajectory double-counted in the pool.
- C5 GUARDRAIL USABILITY: the baseline's own rule (absent + >= 3 = flag;
  present + >= 3 + >= 2x pooled share = share-shift flag) is mechanically
  runnable via --compare mode on BOTH a real out-of-baseline corpus and a
  synthetic hypothetical arm, and its flags behave as the md promises
  (flag = "look", never "fail").
- C6 MACHINE-READABLE SCOPE: the committed JSON artifact a future arm
  passes as --baseline records its substrate (policy, horizon, flags) so a
  future author can verify comparability from the artifact itself, not
  only from prose in the md.
- C7 TAIL + TRUNCATION HONESTY: the long tail (n = 1–2 labels) and the
  32-char truncation caveat are quantified, and the guardrail's treatment
  of them is stated in a way that cannot mislead a future arm author
  (absence = "not observed in this population", never "unknown to the
  engine"; truncated labels matched exactly, never fuzzily).

Verdict scale (exactly one): SATISFIES (C1–C7 all pass) / PARTIALLY
SATISFIES (C1–C5 pass, C6/C7 fail — usable with binding caveats, no new
corpus for in-scope reuse) / DOES NOT SATISFY (any C1–C5 fail — name the
missing piece and the exact corpus/instrument that would close it; do NOT
run that corpus here).

## REPRODUCTION (no trust in printed numbers — re-run, not re-read)

- scripts/test-causebase-b.js (landed): ALL LEGS PASS on re-run
  (leg1/1b kind filter, leg2 negative control, leg3 raw labels, leg4
  determinism, leg5 refusals + summary listing).
- scripts/analyze-causebase-b.js on the 6 landed corpora, original
  relative invocation: stdout BYTE-IDENTICAL to the committed
  evidence/2026-10-25/sim-causebase-b-baseline.json (diff clean).
  Denominators reproduced exactly: 1,302 rows, 0 kind exclusions,
  732 scholar exclusions, 570 villager deaths, 48 labels, per-corpus
  villager deaths 40 / 65 / 71 / 22 / 247 / 125, pooled counts identical.
- NO ANALYZER COUNTING BUG FOUND. The analyzer was not changed in this
  arm: a counting error would have been fixed with proof; there is none
  to fix. (One path-spelling caveat, not a bug: the analyzer echoes input
  dir paths verbatim, so byte-identical reproduction requires the same
  relative invocation the landed run used. Counts are path-independent.)

## CRITERION-BY-CRITERION VERDICT

- C1 REPRODUCTION: PASS. Byte-identical re-run; every denominator and
  pooled count reproduced (above).
- C2 SCALE: PASS. 570 villager deaths across 144 runs — 19x a single
  8-seed band (~30 villager deaths). A pooled zero now means something
  a band zero never did. The 0630Z failure mode (starvation absent from
  an 8-seed band) cannot recur inside this scope: starvation sits in
  the pool at 49/570 (8.6%).
- C3 POPULATION SEPARATION: PASS, recomputed from the corpora, not the
  prose. Scholar rows in the 6 corpora total 732; scholar causes present
  in the villager baseline are only starvation (11), contest (47),
  dehydration (24), sickness (17). Scholar-only causes: 'the arena'
  (613), 'the night' (12), 'the expedition' (6), 'lockjaw' (2) — see the
  caveat below; the separation itself is exact.
- C4 SEED DISJOINTNESS: PASS. seedOverlap [] across all 6 corpora
  (bands 94301–94308, 94401–94416, 94421–94436, 94501–94508, 94601–94664,
  94701–94732). No trajectory double-counted.
- C5 GUARDRAIL USABILITY: PASS. --compare mode runs cleanly on real
  out-of-baseline data AND on a synthetic hypothetical arm (worked
  examples below). Flags behave as promised: flag = "look", never "fail".
- C6 MACHINE-READABLE SCOPE: FAIL. The committed JSON's top-level keys
  are mode, generatedBy, population, corpora, seedOverlap, rowsTotal,
  excludedByKind, excludedScholar, villagerDeaths, pooledCauses,
  pooledTable — NO policy, horizon, PLENTYDEPRI, DEPOSITGATE, or
  substrate field anywhere. A future arm author holding only the JSON
  cannot verify from the artifact that their arm matches the baseline's
  substrate; they must trust the md's prose. The corpus files DO carry
  policy / plentydepri / depositgate fields, so this metadata was
  available and simply not recorded.
- C7 TAIL + TRUNCATION HONESTY: PARTIAL. The tail is quantified
  honestly (see below) and the N = 3 rule handles it, but the tool does
  not handle truncation: compare mode matches labels by exact string,
  so a full-length label that the recorder would have truncated matches
  nothing. The md warns about this in prose; the tool does not.

## WORKED GUARDRAIL EXAMPLES (what flags, what doesn't)

### Example A — REAL out-of-baseline data: deathcensus baseline side (tableseat-nowait, seeds 73671–73678)

Running --compare on the baseline-side files only (the whole dir refuses
with duplicate-seed, correctly — baseline and armed share seeds):
261 rows = 192 monster + 42 scholar + 27 villager — the published
decomposition, reproduced exactly. New labels: 'Nevermore' (n = 1) and
'The Suburb' (n = 1), both flagged FALSE (churn note only). NO
share-shift flag fires on 27 deaths. This is the audit's sharpest
demonstration of the scope limit: two labels that are REAL causes on
another substrate sit below N = 3 and are swallowed as churn. On a new
substrate, N = 3 does not detect genuine new modes at small n — it was
calibrated on competent-substrate churn, and the churn band on any other
substrate is unknown. A future arm on a different substrate must NOT
reuse N = 3 without re-calibrating it.

### Example B — SYNTHETIC hypothetical arm (19 villager deaths)

- 'famine fever', absent from baseline, n = 4 → FLAGGED (investigate).
- 'river drowning', absent, n = 2 → NOT flagged (churn note only).
- 'stripes flowing where no wind blows' (full-length near-miss of the
  truncated baseline label 'stripes flowing where no wind bl') → appears
  as ABSENT (exact-match limitation). At n >= 3 this would false-flag as
  a new mode when it may be the same monster untruncated. Check any
  long new monster-name label against the 4 truncated labels before
  calling it a mode.
- starvation 10/19 (52.6%) vs pooled 8.6% → share-shift FLAGGED (6.1x).
  Correct behavior: the flag means "look", and a starvation-diagnosis
  arm would be expected to run hot.

## THE TAIL (what sits at n = 1–2, and what the guardrail does with it)

48 labels total. Top 5 cover 470/570 (82.5%): monster 219, sickness 83,
ambush 63, a wound that wouldn't close 56, starvation 49. The tail is
34/48 labels (71%) at most twice: 26 singletons (nearly all monster
names: 'the eater', 'the influencer', 'glasswing darter', 'judge hoot',
'wound_fever', ...) and 8 doubletons (bad belly, bulldozer, drum-belly,
experiment, night court, spool, the mountain lord, the paparazzo). The
guardrail's treatment is sound for its scope: 1–2 appearances of an
absent label are routine rare-monster churn (a new monster name showing
up once IS the normal case), and N = 3 is the smallest count clearing
the observed churn band. The tail is unresolvable at this pool size —
no threshold can distinguish a real rare mode from churn at n = 1 — and
the rule honestly says so instead of pretending otherwise.

## ABSENT KINDS: absence = zero, or = unmeasured?

Absence from this baseline means ONE thing only: "not observed among
570 kind-filtered villager deaths on competent policy, 150d horizon,
PLENTYDEPRI = 1, DEPOSITGATE = 1." It never means "does not exist in the
engine." Proven cases of the distinction:

- Scholar-only labels: 'the arena' killed the scholar 613 times in these
  very corpora and appears ZERO times as a villager death. If a future
  arm ever produces villager 'the arena' deaths at n >= 3, the guardrail
  will flag it as "new" — correctly for the villager population, but a
  future author who reads "new" as "never seen before" will be misled.
  Same class: 'the night' (12 scholar), 'the expedition' (6), 'lockjaw'
  (2). Named-disease deaths would behave the same way: the baseline
  carries generic 'sickness' (83) plus 'bad belly' (2) and 'wound_fever'
  (1), not roster disease names — a future disease arm's named-disease
  villager deaths would flag as "new" even though the diseases are
  known content.
- Other-substrate labels: 'Nevermore' and 'The Suburb' (deathcensus
  band, tableseat-nowait) are absent from the competent baseline
  entirely. A tableseat arm citing this baseline would misread both.
- Horizon: every pooled corpus is a 150d death-aware run. Deaths past
  day 150 — late-game, national, table-adjacent causes — are unmeasured
  here, not zero. A longer-horizon arm needs its own extension, not
  this list.
- Monster-kind rows: zero in all 6 sweep corpora (the sweep recorder is
  villager-only by construction), so the by-kind exclusion never bites
  inside the pool — it bites only in census-format corpora. That is a
  property of the corpora, not proof the filter is unnecessary.

## SCOPE LIMITS (binding — future arms cite the baseline ONLY inside these)

1. POLICY: competent policy only (scripts/policies/competent.js,
   unmodified). NOT tableseat-nowait, NOT belongfeast/leadfeast, NOT
   journey/narrative substrates. The analyzer does NOT enforce this: it
   exits 0 with no warning on a different-substrate dir (verified on
   the deathcensus dir). Substrate matching is the author's job, and the
   JSON gives them nothing to check it against (C6).
2. FLAGS + HORIZON: PLENTYDEPRI = 1, DEPOSITGATE = 1, 150d death-aware
   horizon, measurement-only source arms (zero src/js in every source
   arm's own evidence).
3. POPULATION: kind in {villager, person} AND scholar flag false.
   Scholar successions and monster kills are a different population;
   never compare an unfiltered death table against this baseline.
4. LABELS: raw, unnormalized, 32-char truncated. Two truncated labels
   ('stripes flowing where no wind bl', 'stripes resolving out of the
   bam') are distinct prefixes, so no collision is observed — but a
   future long label could collide with a truncated one, and exact-match
   compare cannot see it.
5. SHARES: the pooled share is a MIXTURE, not a clean control.
   Per-corpus starvation shares run 25.0% / 9.2% / 5.6% / 18.2% / 7.7% /
   4.8% against pooled 8.6% — pantrystarve is a diagnosis run, cover-b a
   different composition. A share-shift flag against pooled share can
   fire on composition alone (the pantrystarve demo in sim-causebase-b.md
   proves it). Treat every share flag as "look", and prefer comparing
   against the per-corpus range, not just the pooled point.

## BINDING CAVEATS FOR FUTURE ARMS (read before citing this baseline)

1. CITE THE SCOPE IN YOUR EVIDENCE HEADER: "competent policy, 150d,
   PLENTYDEPRI = 1, DEPOSITGATE = 1, kind-filtered villager deaths
   (n = 570)". An arm outside any leg of that scope must NOT cite this
   baseline as its guardrail — it needs its own pooled list (or a
   documented extension), and N = 3 must be re-calibrated for its
   substrate, not reused.
2. "ABSENT" MEANS "NOT OBSERVED IN THIS POPULATION" — never "new to the
   game". Check scholar-only labels ('the arena' above all) and
   other-substrate labels before calling any flagged label a new mode.
3. LONG MONSTER NAMES: check any flagged long label against the 4
   truncated baseline labels (32 chars, all singletons: 'a crow that
   watches too long and', 'a toad like a war drum, throat s', 'stripes
   flowing where no wind bl', 'stripes resolving out of the bam')
   before calling it a mode — it may be the same monster untruncated.
4. SHARE FLAGS ARE "LOOK", NEVER "FAIL" — and never judge a share flag
   against pooled share alone; check the per-corpus range (starvation
   4.8–25.0%).
5. REPRODUCE WITH THE SAME RELATIVE INVOCATION if you need byte-identical
   output — the analyzer echoes dir paths verbatim.

## SENSE-TESTING (does the rule make sense to a future arm author?)

The guardrail section is mostly exemplary — its worked pantrystarve demo
("That flag is CORRECT behavior, not an alarm") teaches the flag =
"look" semantics by example. Two lines would mislead an author who reads
them without the scope section:

- "A label PRESENT in the pooled list can never be 'new' — only its
  share can shift." True inside the villager population, false as a
  general claim: a label can be old to the engine and new to villagers
  (see 'the arena'), and the sentence as written invites the
  engine-wide reading.
- "no collision is observed in this pool" (truncation). True and
  carefully worded — but an author in a hurry reads it as "truncation
  is safe", when the live risk is the reverse: a future full-length
  label failing to match its truncated twin (worked Example B above).
  The md's own rule 4 ("Treat a new long monster-name label as
  approximate") is the correct guidance; the "no collision" sentence
  should never be quoted without it.

Spot-check of the baseline's own sense read (from sim-causebase-b.md):
Owen starving away from a full pantry while the village eats is the
documented away-ration shape, not a data error — the pooled starvation
count (49) is the honest size of that shape across 144 runs. The table
reads as a story the food-economy arms already proved, not as noise.
No new sense finding in this audit.

## METRIC REVIEW (required, §14 — no re-scoring in this run)

- Is "pooled cause list" the right guardrail instrument at all? For
  LABEL NOVELTY, yes — it repairs exactly the failure it was built for
  (an 8-seed band's zero masquerading as absence), and the N = 3 rule
  is honestly calibrated to the observed churn band rather than chosen
  as a magic number. For MAGNITUDE, no — the pooled share is a mixture
  across diagnosis/confirm/cover compositions, so it is a "look"
  instrument for shares, not a bar. A future arm that wants a share bar
  should pre-register against the per-corpus range or a clean control
  band, not the pooled point.
- What would I change for the next audit? (a) Record substrate metadata
  in the baseline JSON (policy, horizon, flags, seed bands) — the C6
  gap, fixable without touching counts, since compare mode reads only
  pooledCauses; (b) have compare mode emit the per-corpus share range
  alongside the pooled share, so a share flag can be judged against the
  range in one run; (c) have the analyzer warn (stderr, never stdout,
  so byte-identical pool output survives) when pooled corpora disagree
  on policy/flags — the fields are already in the files; (d) re-derive
  N per substrate instead of reusing 3. None of these changes any
  landed number, and none is a precondition for in-scope reuse — that
  is why the verdict is PARTIALLY, not DOES NOT.
- No metric was re-scored in this run. sim-causebase-b's DIAG-GO stands;
  this audit judges only whether its artifact closes the tracker blank.
  The 0630Z guardrail note is superseded for competent-scope arms only.
- Balanced panel (§15): no panel compare is attached, deliberately —
  there is no lever in this run and no panel pair to compare; the pooled
  table IS the comparison instrument, used here via --compare mode on
  real and synthetic corpora (Examples A and B above).

## VERDICT: PARTIALLY SATISFIES

C1–C5 pass; C6 fails and C7 is partial. The pooled baseline IS usable
as the "new death mode" guardrail — inside its stated scope
(competent policy, 150d, PLENTYDEPRI = 1, DEPOSITGATE = 1,
kind-filtered villager deaths) and under the five binding caveats
above. Future arms inside that scope may cite it and need NO new
corpus. The tracker blank is therefore closed for competent-scope
guardrail reuse, and remains open as a scope extension — not a gap —
for any arm outside that scope (other policies, longer horizons):
such an arm needs its own pooled list and its own N calibration, and
must not borrow this list's N = 3. No new corpus was run or is
required by this audit.

## PROOF

scripts/test-causebase-audit-b.js — ALL LEGS PASS:
- C1 byte-identical reproduction (1302/0/732/570, 48 labels,
  per-corpus 40/65/71/22/247/125).
- C2 scale (570 deaths, 144 runs, >= 10x a band).
- C3 scholar-only set recomputed ('the arena' 613, 'the night' 12,
  'the expedition' 6, 'lockjaw' 2).
- C4 seedOverlap [].
- C5a deathcensus baseline-side compare (27 villager; Nevermore /
  The Suburb n = 1, unflagged; zero share-shift flags).
- C5b synthetic arm (absent n = 4 flagged; absent n = 2 churn;
  truncated near-miss shown absent; starvation share-shift flagged).
- C7 tail quantified (26x1, 8x2; 4 truncated singletons).
- C6 recorded as FAIL (no substrate fields in committed JSON);
  C7b analyzer substrate silence recorded (exit 0, no warning).
scripts/test-causebase-b.js (landed) re-run: ALL LEGS PASS.
Node --check clean on the new test script. No src/js changed. No new
sims run. No sibling axis, tree, branch, claim, or file touched.
check.js --quick NOT re-run: zero src/js changed in this arm, and the
arm's suite is test-causebase-audit-b.js (green); the coordinator
re-runs suites at merge per standing protocol.

## VILLAGE ASSESSMENT (plain words)

The audit does not change the village's story — it checks the ledger
the story is written in. That ledger is sound where it claims to be:
across 144 competent-policy villages, villagers die of monsters first
(219 of 570), then sickness, betrayal, wounds, and hunger — and the
scholar, the player character, dies far more often than any villager
(732 successions) without those deaths being village blood at all. What
the audit adds is the warning label on the ledger: it covers one kind
of village, on one policy, for 150 days, with monster names cut off
mid-word — and anything outside that frame needs its own ledger, not a
borrowed one.

Convergence state: food-economy stays converging (this arm is audit
infrastructure, not a lever — no game-code fix landed here). The
tracker blank (1) "pooled baseline cause list before any 'new death
mode' guardrail reuse" is closed for competent-scope reuse with the
binding caveats above; it survives only as a scope-extension note for
non-competent / longer-horizon arms.

