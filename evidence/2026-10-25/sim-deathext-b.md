# sim-deathext-b — deathrow pooled cause list extended to the >= 300-death scale bar (axis food-economy)

Run: fleshout-loop-b-20261025T1849Z (Sun 2026-10-25, loop B, second axis).
Worker tree: ~/workspace/worktrees/sim-deathext-b. Axis: food-economy.
MEASUREMENT ONLY: zero src/js game changes. This arm extends the deathrow-b
pooled list (sim-deathrow-b.md, 40 seeds, 144 villager deaths) to the audit's
>= 300-death scale bar on the identical substrate, so the tableseat-nowait
pooled list can be cited at credible scale. It reuses the committed
tooling unchanged: scripts/sweep-deathrow-b.js (recorder sweep),
scripts/analyze-deathrow-b.js (pool driver pattern),
scripts/analyze-causebase-b.js (pool/compare engine), and adds
scripts/test-deathext-b.js as this arm's proof.

Canon read first: docs/CANON.md, then evidence/2026-10-25/sim-deathrow-b.md
(the recorder + pooled list this arm extends),
evidence/2026-10-25/sim-deathrow-b-baseline.json (existing pooled list:
40 seeds, 144 villager deaths, N=3),
evidence/2026-10-25/sim-causeext-b.md (the blocked report this thread
unblocks) and evidence/2026-10-25/sim-causemeta-b.md (the scope-guard
system this output must satisfy). No canon doc covers death-cause
taxonomy — the causes here are the engine's recorded labels, not canon,
and no label is invented, renamed, or merged in this arm.

## PRE-REGISTRATION (binding — judged only against this, no re-scoring)

- Substrate, exactly as deathrow-b: tableseat-nowait ARMED side only (LEANLINKRESCUE=1 + TABLESEATNOWAIT=1, wait leg omitted), 180 loop-days death-aware (dead villages stop immediately, 0d tail). No other substrate mixed in.
- Fresh bands ONLY (verify against committed evidence filenames before running — 73601-73608, 73671-73678, 73701-73748 are TAKEN, never reused): 73751-73758, 73761-73768, 73771-73778, 73781-73788, 73791-73798, 73801-73808 (48 seeds). Pilot first: band 73751-73758 must pass capture gates (8/8 files with deathRows, kind/flag/cause-missing = 0) before any multi-band spend.
- Combined corpus = existing 40 deathrow-b seeds + fresh 48 = 88 seeds. Primary metric: pooled villager deaths in the combined list.
- GO thresholds: (a) combined villager deaths >= 300; (b) pool builds with scope {policy tableseat-nowait, horizon 180 death-aware} derived from the corpora; (c) guardrail compare passes matched (this corpus, exit 0) and refuses scope-mismatched dirs (exit 2, both scopes named); (d) N recalibrated by deathrow-b's rule (smallest count clearing the observed churn band — labels below N confined to single-seed singletons/doubletons and monster-name churn) with the histogram stated, and whether N moves vs N=3 stated explicitly.
- Conditional 7th band 73811-73818 ONLY if combined < 300 after the 6 bands, to reach the bar. If still < 300 after the 7th, report NO-GO/PARTIAL with the exact count — invent nothing, run no further bands.
- Balanced panel (§15): not a lever pair, same standing precedent as deathrow-b — the analyzer pool/compare modes are the comparison of record; say so in the evidence file.

## RESULTS

### Freshness check (before any sim)

Verified against committed evidence filenames (`git ls-files evidence`):
no file exists for any seed in 73751–73818, and the worktree was clean
(`git status --short` empty) before the first sweep. Bands 73601–73608,
73671–73678, and 73701–73748 were treated as TAKEN and never reused.

### Pilot (band 73751–73758, armed tableseat-nowait, 180d) — GATE PASSED

8/8 files with deathRows; 223 rows; kind/flag/cause-missing = 0/0/0;
G3 corpus integrity PASS. Pilot wall numbers: won 4/8, national-ever 7/8,
national-final 5/8, table 4/8, entered 4/8, wave4 5/8, wave5 0/8,
median 164d, max 180d. Pilot villager deaths: 21. Multi-band spend
proceeded only after this gate passed.

### Six-band combined — ONE SHORT, conditional 7th band fired

Multi-band leg (5 bands, 73761–73808, 40 seeds): 40/40 files, 1,178 rows,
kind/flag/cause-missing = 0/0/0, G3 PASS. Fresh 48 total: 1,401 rows,
155 villager deaths (pilot 223 rows / 21 villager + multi-band 1,178
rows / 134 villager).

Six-band combined (40 old + 48 fresh = 88 seeds): 2,604 rows,
villager deaths 299 — ONE short of the >= 300 bar. Per the
pre-registration, and only per it, the conditional 7th band 73811–73818
was run: 8/8 files, 202 rows, kind/flag/cause-missing = 0/0/0, G3 PASS,
won 3/8, national-ever 5/8, national-final 5/8, table 5/8, entered 3/8,
wave4 3/8, wave5 0/8, median 133.5d, max 180d. No further bands were run;
none were needed.

### Final combined corpus (96 seeds)

- Fresh corpus: evidence/2026-10-25/perseed-deathext-b/ — 56 per-seed
  files + summary.json. Fresh decomposition: 1,603 rows = 1,104
  monster/animal-kind + 320 scholar + 179 villager deaths.
- Old corpus: evidence/2026-10-25/perseed-deathrow-b/ — 40 files,
  1,203 rows = 859 kind + 200 scholar + 144 villager deaths (unchanged;
  sim-deathrow-b-baseline.json still reads 144, verified by proof L3).
- Combined: 2,806 rows = 1,963 kind-excluded + 520 scholar + 323
  villager deaths, 31 labels. File:
  evidence/2026-10-25/sim-deathext-b-baseline.json (the analyzer's own
  pool-mode output on both corpus dirs; re-running the analyzer with
  the same relative-dir invocation reproduces it byte-identically at
  11,611 bytes — proven in this run, not just asserted).
- sim-deathrow-b-baseline.json was NOT overwritten and still carries
  its own 40-seed pool (144 deaths, N=3). The extended file is a new
  artifact, not a replacement.

### Before/after (existing 144 vs combined 323)

| | Seeds | Rows | Villager deaths | Labels |
|---|---|---|---|---|
| BEFORE (deathrow-b) | 40 | 1,203 | 144 | 21 |
| Fresh (this arm) | 56 | 1,603 | 179 | — |
| AFTER (combined) | 96 | 2,806 | 323 | 31 |

Ten labels are new in the combined pool vs deathrow-b: The Anaconda
Empress, Sunbasker, Hummice, "a monitor lizard the size of a canoe,
light sliding wrong off its back", The Callback (3×, 3 seeds),
The Understudy, Big Loud, Speedbump, "a heron that isn't quite there
when you look at it", The Glow Stag. The Callback is the only new label
above singleton count — a recurring monster, not a one-off. The other
nine are single-seed singletons and sit in the churn band (see N).

### N recalibration (deathrow-b's rule, combined histogram)

Rule (as implemented in scripts/test-deathrow-b.js and reused verbatim
here): churn = count <= 2 AND (single-seed OR monster-name per
src/data/monsters.json id/name/unknown/villageNames, 72 entries);
N = churnMax + 1. Histogram (combined, 323 deaths):

- 107x monster (seeds=58)
- 54x sickness (seeds=25)
- 50x ambush (seeds=47)
- 46x a wound that wouldn't close (seeds=30)
- 14x starvation (seeds=11)
- 10x alien (seeds=6)
- 7x thirst (seeds=4)
- 6x combat (seeds=5)
- 4x Choir Toad (seeds=3, monster-name)
- 3x The Callback (seeds=3, monster-name)
- 2x The Big Beast (seeds=2)
- 1x each [churn band]: Ad Break, Big Big, Big Loud, Buffering, Hummice,
  Hushpuppy, Inspiration, Lockpick, Nevermore, Speedbump, Sunbasker,
  The Anaconda Empress, The Glow Stag, The Moderator, The Understudy,
  White Noise, a dog-shaped silence at the treeline, a heron that isn't
  quite there when you look at it, a monitor lizard the size of a canoe
  (light sliding wrong off its back), contest — 20 singletons, all on
  exactly 1 seed.

Churn band max = 1 (every churn label is a singleton) → N = 2.

**N MOVES: 3 → 2, stated explicitly.** At the 40-seed scale the churn
band reached count 2 (Choir Toad, single-seed); at 96 seeds / 323 deaths
no label sits at count 2 as a single-seed blip or roster monster name,
so the smallest count clearing the churn band drops to 2. Labels below
N=2 are exactly the 20 singletons — confined to single-seed singletons,
as the rule requires — and there are NO sub-N non-churn labels (the
proof's caveat list is empty).

Two honest caveats, stated not hidden:

1. The Big Beast sits AT N (2×, 2 seeds) and is NOT roster churn:
   no entry in monsters.json (id, name, unknown, or villageNames)
   matches "The Big Beast", so by the implemented rule it does not
   raise churnMax. If a future arm classifies it as a monster name by
   prose rather than by roster, churnMax would be 2 and N would stay 3.
   The rule's output on the roster as written is N=2; the prose
   reading is recorded here so a future arm can decide explicitly
   rather than silently re-tuning.
2. Consequence of N=2: a future arm's genuinely NEW label at count 2
   now flags as "new" — including a new monster name appearing twice,
   the exact false-positive class N=3 was chosen to avoid at the
   smaller scale. That is the price of the churn band collapsing to
   singletons, and it is a property of the larger pool, not a tuning
   choice made in this run. A future arm that wants monster-name
   tolerance at n=2 should say so explicitly and accept that it is
   re-tuning N, not applying this calibration.

The old blind spot is gone as a side effect: deathrow-b's "combat at
n=2 on 2 seeds" caveat is now combat at n=6 on 5 seeds — a solid
present label, not a tail case.

### Guardrail results (threshold c)

- Matched compare (extended JSON as --baseline, combined corpus dirs
  as the arm): exit 0, scopeCheck status "match".
- Mismatched compare (competent awayration-size-b corpus as the arm):
  exit 2, SCOPE-MISMATCH naming both scopes (tableseat-nowait vs
  competent, horizon 180d death-aware vs 150d, flags undeclared vs
  PLENTYDEPRI=1/DEPOSITGATE=1). No stdout JSON emitted on refusal.
- Scope in the extended JSON (derived from the corpora, not typed):
  policy "tableseat-nowait", horizon { days 180, mode "death-aware" },
  flags PLENTYDEPRI/DEPOSITGATE undeclared (honest: this substrate sets
  neither flag — same partial-flag shape as deathrow-b), kindFilter
  kind in {villager, person} AND scholar flag false, corpora
  [(40 seeds, 73701–73748), (56 seeds, 73751–73818)].

### Wall numbers (medians are average-of-two-middle-values, the deathrow-b convention)

Fresh 56: won 21/56, national-ever 43/56, national-final 38/56,
table 26/56, entered 21/56, wave3+ 50/56, wave4+ 30/56, wave5+ 0/56,
median survival 147.5d, max 180d. End reasons: wins 21, survived 16,
village-lost 19. Final ranks: global 23, regional 17, national 15,
village 1. MaxArc 3: 30 / 4: 26.

Combined 96: won 37/96, national-ever 79/96, national-final 65/96,
table 45/96, entered 37/96, wave3+ 88/96, wave4+ 53/96, wave5+ 0/96,
median survival 147.5d, max 180d. End reasons: wins 37, survived 29,
village-lost 30. Final ranks: global 40, regional 29, national 25,
village 2. MaxArc 3: 51 / 4: 45.

The scale wall is unchanged in shape at 96 seeds: national is routine
(79/96 ever), the table is reachable (45/96 reach, 37/96 take the seat
and win), wave 5 is not (0/96) — the same wall deathrow-b reported at
40 seeds, now with more than twice the seeds behind it. No new breach.

## GO / NO-GO PER THRESHOLD (judged against the pre-registration, no re-scoring)

- (a) Combined villager deaths >= 300: GO — 323 (299 after six bands,
  +24 from the conditional 7th band; the 7th band itself contributed
  202 rows of which 24 were villager deaths).
- (b) Pool builds with scope {policy tableseat-nowait, horizon 180
  death-aware} derived from the corpora: GO — analyzer pool mode on
  both corpus dirs exits 0; scope as stated above.
- (c) Guardrail matched exit 0 / mismatched exit 2 with both scopes
  named: GO — matched scopeCheck match; mismatched SCOPE-MISMATCH
  naming tableseat-nowait vs competent.
- (d) N recalibrated by deathrow-b's rule, histogram stated, N-move
  stated: GO — N = 2, moved from N = 3, histogram above, caveats above.
- Conditional 7th band rule honored: fired only because six-band
  combined was 299 < 300; no further bands run.
- Balanced panel (§15): not a lever pair, same standing precedent as
  deathrow-b — the analyzer pool/compare modes are the comparison of
  record; no panel compare attached, deliberately.

OVERALL VERDICT: GO. The >= 300-death scale bar is met on the
tableseat-nowait substrate (323 villager deaths, 96 seeds) with a
recalibrated N = 2 and an enforced scope guard. The extended pooled
JSON is citable at credible scale; the deathrow-b 40-seed file stands
untouched beside it.

## SENSE-TESTING

Read the 179 fresh villager rows end to end (not just the pooled
counts), plus the fresh scholar/monster-kind decompositions. The rows
still cohere as villages' death stories, and the larger pool sharpens
patterns deathrow-b could only suggest:

- Ambushes still kill early and only early (fresh: days 6–30, median
  13): betrayal before trust forms, then it stops. At 96 seeds this is
  no longer a small-band impression — 50 ambush deaths, 47 seeds, all
  inside the first month.
- Sickness arrives as outbreaks, and the outbreaks now have names.
  Seed 73804 loses six villagers to sickness across days 21–62 — a
  plague fortnight-plus that the village never recovers from (it
  survives to day 180 without winning, after also losing a villager
  on day 7 to "a heron that isn't quite there when you look at it").
  Seed 73767 loses five to sickness and four to wounds that wouldn't
  close across days 11–126: a village ground down, not wiped out.
  Seed 73811 loses four to sickness. These are not drips; they are
  the weeks a village remembers.
- Wounds kill late and slowly (fresh median day 64, range 10–154):
  the ledger still distinguishes the fight from its aftermath, and
  the distinction still reads correctly — seed 73767's four wound
  deaths are spread across the whole run, not clustered on fight days.
- The alien presence has a shape now: seed 73785 loses three
  villagers to "alien" (days 31, 101, 178) — not one incident but a
  recurring pressure across the whole run. Combined alien deaths are
  10 across 6 seeds.
- Monster-name causes are the wave-2 conceptual horrors doing what
  the roster promises, and now some of them RECUR: The Callback kills
  on three different seeds (73776, 73777, 73804); Choir Toad kills on
  two fresh seeds plus its deathrow-b seed. Recurrence is the
  difference between a curiosity and a monster: at 40 seeds these
  were singletons; at 96 seeds Callback (3×) and Choir Toad (4×)
  graduate out of the churn band entirely. New names read as designed
  rather than as data errors: a villager killed on day 8 by The
  Anaconda Empress, one killed by "a monitor lizard the size of a
  canoe, light sliding wrong off its back" on day 5, one by The Glow
  Stag on day 32. The recorder preserves the names instead of
  collapsing them into generic "monster" — that preservation is what
  lets the N recalibration see the tail honestly.
- The kind filter's value is visible again at larger scale: fresh
  monster-kind rows (1,104) carry "combat" (556), "villager combat"
  (441), "expedition" (107) — monster kills the village scored, kept
  out of village blood. Fresh scholar rows (320) are "the arena" 272
  times — the mantle passing, not villagers dying. The filter removes
  2,483 of 2,806 combined rows and the remaining 323 are, on
  inspection, actual villagers.
- Oddities, stated not hidden: "contest" killed one villager in the
  combined pool (the deathrow-b case, seed 73716 day 25) and none in
  the fresh 56 — contests remain playable and occasionally lethal,
  but rare as a villager death cause. No "villager combat" appears
  among villager deaths (monster-kind only), the correct separation.
- LIMIT (unchanged from deathrow-b): rows carry day/who/cause/kind
  only — no fight detail, no last words, no narrative context. This
  sense read judges cause coherence, not death scenes. The narrative
  layer belongs to the deathcensus-a transcript recorder; this
  recorder is the ledger layer, and it does not pretend otherwise.

## METRIC REVIEW (required, §14 — no re-scoring in this run)

- No metric was re-scored. All four pre-registered thresholds are
  reported as written; the one judgment call the pre-registration
  itself contained — the conditional 7th band — fired exactly as
  written (six-band combined 299 < 300) and no further band was run.
- The pre-registration's "combined corpus = 88 seeds" line describes
  the six-band plan; the delivered combined corpus is 96 seeds
  because the conditional band fired. That is compliance with the
  conditional rule, not a revision of the plan: the 88-seed number
  was never a cap, and the 7th band's seeds (73811–73818) were
  pre-registered as the only allowed extension.
- N moved 3 → 2 by the rule, not by choice. The evidence file states
  the rule output, the histogram it came from, and both caveats (The
  Big Beast roster question; n=2 new-label flagging consequence)
  above. A future arm that wants N=3 back must argue it from the
  roster or from an explicit tolerance decision — it cannot cite
  this run for N=3.
- Median convention: medians here use the average-of-two-middle-values
  convention, matching deathrow-b's reported 147d for the old 40
  (recomputed here as 147.0 under that convention; the
  floor(n/2)-element value is 149 and is NOT used). Fresh-56 and
  combined-96 medians (147.5d) use the same convention.
- The pooled JSON's scope.corpora dir strings depend on invocation
  form: the committed file was written with relative dir arguments
  and reproduces byte-identically (11,611 bytes) under the same
  relative invocation. An absolute-path invocation produces
  parsed-identical output whose dir strings are the absolute paths
  (188 bytes longer across the two dir fields' four occurrences) —
  that is why the proof test compares parsed JSON with dir strings
  excluded rather than byte-comparing across invocation forms. No
  count, label, seed list, policy, or horizon leg differs between
  the forms.
- Balanced panel (§15): no panel compare attached, deliberately —
  there is no lever pair in this run (this is a scale extension of a
  measurement pool, not a game lever) and the analyzer pool/compare
  modes are the comparison of record, per the pre-registration and
  the deathrow-b precedent.
- check.js --quick NOT re-run: zero src/js changed in this arm, and
  the arm's suite is scripts/test-deathext-b.js (all legs pass, see
  proof). Same precedent as sim-deathrow-b. The coordinator re-runs
  suites at merge per standing protocol. No jest was run (plain node
  scripts; no jest involvement to cache).
- Seed-band note for the next arm: bands 73701–73818 are now TAKEN
  (deathrow-b 73701–73748, deathext-b 73751–73818). The next
  tableseat-nowait extension should start at 73821+, with the same
  freshness check. The pooled list's N is now 2 (see caveats before
  citing it for new-label flagging).

## PROOF

- `node --check` clean on scripts/test-deathext-b.js.
- Pilot: `SEEDS=73751,…,73758 EVID=evidence/2026-10-25/perseed-deathext-b
  node scripts/sweep-deathrow-b.js` — exit 0, G3 PASS, 8/8 files,
  kind/flag/cause-missing 0/0/0, 223 rows.
- Multi-band: `SEEDS=<73761…73808, 40 seeds> EVID=…/perseed-deathext-b
  node scripts/sweep-deathrow-b.js` — exit 0, G3 PASS, 40/40 files,
  1,178 rows, kind/flag/cause-missing 0/0/0.
- Conditional 7th band: `SEEDS=73811,…,73818 EVID=…/perseed-deathext-b
  node scripts/sweep-deathrow-b.js` — exit 0, G3 PASS, 8/8 files,
  202 rows, kind/flag/cause-missing 0/0/0.
- Pool: `node scripts/analyze-causebase-b.js
  evidence/2026-10-25/perseed-deathrow-b
  evidence/2026-10-25/perseed-deathext-b --out
  evidence/2026-10-25/sim-deathext-b-baseline.json` — exit 0:
  2,806 rows / 1,963 kind / 520 scholar / 323 villager / 31 labels,
  scope policy tableseat-nowait, horizon 180 death-aware.
- `node scripts/test-deathext-b.js` — ALL 14 LEGS PASS (L1 fresh 56
  seeds + rows + combined 96 no-overlap, L2 pool exit 0 + parsed match
  to committed JSON, L3 scope + recomputed counts + scale bar 323 +
  old baseline untouched at 144, L4 matched scopeCheck match /
  mismatched exit 2 SCOPE-MISMATCH naming both scopes, L5 N=2 with
  histogram, L6 determinism --rerun 73751 MATCH, L7 neutrality
  --neutrality 73751 PASS) — full run including the two sim legs;
  a fast re-run (TEST_DEATHEXT_FAST=1) confirms the 12 non-sim legs.
- No src/js changed. No sibling axis, tree, branch, claim, or file
  touched. No push, no version bump, no live verification.
- Corpus: evidence/2026-10-25/perseed-deathext-b/ (56 per-seed files +
  summary.json; note the summary.json covers only the last sweep leg
  run in the dir — the 7th band — the same overwrite pattern as
  deathrow-b's summary, which covers only its multi-band leg; all 56
  per-seed files are present and are what the analyzer pools).
  Extended pooled baseline: evidence/2026-10-25/sim-deathext-b-baseline.json.
  Old baseline untouched: evidence/2026-10-25/sim-deathrow-b-baseline.json.
  Proof: scripts/test-deathext-b.js. Evidence:
  evidence/2026-10-25/sim-deathext-b.md (this file).

## VILLAGE ASSESSMENT (plain words)

Ninety-six tableseat-nowait villages walked the road to the table, and
now their death story is written down at a scale worth citing — that
is the whole result. Seventy-nine of ninety-six reached national at
some point; forty-five reached the table; thirty-seven took the seat
and won. Thirty villages died out entirely; twenty-nine survived the
full 180 days without winning. Nobody reached wave 5 — the wall past
wave 4 is still the wall, and now that statement rests on 96 villages
instead of 40.

How they died, in plain words: monsters first (about a third of
village blood), then sickness and betrayal ambushes (about a sixth
each), then wounds that wouldn't close. The early days kill by
betrayal — neighbors turning on neighbors before trust forms, and
then it stops. The middle kills by monsters, by sickness moving
through a village in a fortnight, and by wounds that fester after the
fight is over. The late days kill by hunger, thirst, and sickness
coming back around. One village lost six people to sickness in six
weeks and never recovered; another lost three to the alien presence
across the whole run, a pressure that never let up. And the monsters
with names — the Callback, the Choir Toad — stopped being one-off
curiosities and started coming back, village after village. That is
what a bigger ledger buys: the difference between a strange death and
a monster with a habit.

What the ledger still does NOT say: nothing about traps, nothing about
counters learned, nothing about which young links held after a
succession. Those instruments don't exist on this substrate yet, and
this run doesn't pretend otherwise. What it does say, for the first
time at credible scale on this road to the table, is exactly who died,
of what, and when — with monster kills and mantle-passings kept out of
the village's blood count, and with a threshold (N=2) calibrated from
this pool's own tail. The next arm that asks "did this lever change
how villagers die" can finally be answered with numbers at scale
instead of tallies.

Convergence state: food-economy stays converging (this arm is
measurement infrastructure + a scale extension, not a game lever — no
game-code fix landed here). The >= 300-death scale bar is met. The
remaining open items for this thread: the N=2 flagging consequence
(new monster names at n=2 will flag as "new" — a future arm should
decide explicitly whether to accept that or re-tune with a stated
tolerance), The Big Beast's roster status (prose monster name vs
roster absence — affects whether N would be 3 under a prose reading),
and the narrative death layer (already owned by the deathcensus-a
transcript recorder, not duplicated here).
