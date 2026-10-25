# sim-n2beast-b — The Big Beast audit + the operational N=2 flagging rule (axis food-economy)

Run: fleshout-loop-b-20261025T1937Z (Sun 2026-10-25, loop B, second axis).
Worker tree: ~/workspace/worktrees/sim-n2beast-b. Axis: food-economy, tracker
next blank 3. MEASUREMENT ONLY: zero src/js game changes (no label-generation
bug was proven — see verdict; a display-name alias is not a bug).
This arm answers the two questions left open by run
fleshout-loop-b-20261025T1849Z (evidence/2026-10-25/sim-food-round-1849.md
and sim-deathext-b.md — both read first): (1) what The Big Beast is, and
(2) what a future arm must do when a new label at count 2 flags under N=2.

Canon read first: docs/CANON.md, then docs/MONSTER-WAVES.md (wave law) for
the monster context. No canon doc covers the death-label N rule or the
deathrow pooled list — the N rule is an instrument rule from the
deathrow-b/deathext-b arms (scripts/test-deathrow-b.js, scripts/test-deathext-b.js),
not canon, and nothing in this file invents canon to fill that gap. The
death labels themselves are the engine's recorded display names, not canon.

## PRE-REGISTRATION — audit method (written BEFORE verdicts; judged only against this)

Corpora (fixed, no additions): the deathext 96-seed pooled list
(evidence/2026-10-25/sim-deathext-b-baseline.json) and its two per-seed
corpus dirs (evidence/2026-10-25/perseed-deathrow-b/, 40 files;
evidence/2026-10-25/perseed-deathext-b/, 56 files). No new sims: this is
an audit of an existing corpus, not a new measurement.

Code paths examined (fixed list):
- Roster check: src/data/monsters.json (72 entries) — fields id, name,
  unknown, villageNames, nameTraits, case-insensitive.
- Display-name chain: src/js/game.js monsterDisplayName(mid) (villageName
  wins, else true name post-System, else unknown descriptor) and
  monsterNamingCheck (majority of roster agrees -> villageName sticks).
- Name-generation pool: src/js/game.js generateMonsterName(mid, vid)
  (curated villageNames if present, else temperament pools over
  mdef.nameTraits or the default ['big', 'loud', 'ugly']).
- Death-cause chain: src/js/villager-agency.js expedDeath (cause = mName)
  fed by encDescribeMonster (src/js/encounters.js) -> monsterDisplayName;
  src/js/corpses.js registerDeath -> tele 'death' (day/kind/who/cause);
  scripts/sweep-deathrow-b.js deathRows passthrough; scripts/analyze-causebase-b.js
  pool (labels raw, unnormalized).
- Implemented N rule: scripts/test-deathext-b.js L5 — churn = count <= 2
  AND (single-seed OR roster monster-name); N = churnMax + 1.

Three hypotheses, with what counts as proof for each (fixed before verdicts):
- H1 REAL MONSTER (roster entry): PROVEN only if "The Big Beast" matches a
  monsters.json id, name, unknown, or curated villageName (case-insensitive).
  Anything else is not H1, however monster-like the string reads.
- H2 LABEL ARTIFACT (recorder/label-generation bug): PROVEN only if a Big
  Beast row is malformed, duplicated, truncated, or carries a cause string
  no game code path can produce — i.e. the recorder, not the game, made
  the label. A label the game genuinely produces is not H2 even if it is
  an alias rather than a species.
- H3 ROSTER CHURN (implemented rule): PROVEN only if the label satisfies
  the implemented churn predicate (count <= 2 AND single-seed OR roster
  monster-name). A prose resemblance to a monster name is not H3 — the
  rule reads the roster, not the prose.
- If none of H1–H3 is proven, the verdict must name the fourth category the
  code paths actually yield (generated display-name alias, true-name
  display, unknown-descriptor display, or other) and state what the ledger
  cannot identify. The ledger rows carry day/kind/who/cause only — no
  monster id — so any verdict claiming a specific roster id for a Big
  Beast row without a monsterId-carrying source is disallowed by this method.

Sense-testing: both Big Beast rows are read in their full per-seed
death-row context (all rows of seeds 73747 and 73796), not just the pooled
count — meaning and coherence, not just counts.

GO thresholds for this arm (judged only against these):
- (a) Every Big Beast row located with exact corpus file, day, villager id,
  kind, and player flag.
- (b) H1/H2/H3 each decided PROVEN or NOT-PROVEN against the criteria above,
  with the exact code lines / roster facts as proof.
- (c) The n=2 stratum of the 96-seed list enumerated completely (every
  label at count exactly 2), and any same-shape label at any count named.
- (d) A written operational N=2 flagging rule with dispositions
  (investigate / hold / dismiss), the monster-name tolerance question
  answered, and the exact condition under which a future arm may re-tune
  to N=3 — plus what this run does NOT authorize.
- (e) The rule applied as a worked example to the deathext 96-seed list.
- (f) Proof test scripts/test-n2beast-b.js green, recomputing (a)–(c)
  from corpora + code instead of asserting prose.

## RESULTS — verdicts (judged against the pre-registration above)

### The Big Beast rows (threshold a)

Exactly two rows in the 96-seed corpus, both kind villager, player false,
distinct villager ids, distinct days, distinct seeds:

- evidence/2026-10-25/perseed-deathrow-b/s73747.json — day 77, villager
  gen_ooqx0fl, cause "The Big Beast", player false.
- evidence/2026-10-25/perseed-deathext-b/s73796.json — day 106, villager
  gen_8mfjxe0, cause "The Big Beast", player false.

No other file in either corpus dir contains the string. The rows are
well-formed (day/kind/who/cause/player all present, zero missing fields
in either file's G3 gates from the deathext run).

### H1 REAL MONSTER — NOT PROVEN

No entry in monsters.json (72 entries) matches "The Big Beast" in id,
name, unknown, or curated villageNames, case-insensitive (proof test
recomputes this). The only three entries with curated villageNames at
all are gallowdeer (Highbeam Deer), nevermore, and nightcourt — none
lists "The Big Beast". The string literal "The Big Beast" appears
nowhere in src/js/ either. A roster monster it is not.

### H2 LABEL ARTIFACT (bug) — NOT PROVEN

The label is exactly what the game produces, through a complete code
path with no recorder involvement in the string:
1. A villager on expedition meets a monster picked from
   monsterWavePool() (src/js/villager-agency.js, expedition encounter).
2. The fight resolves vDie -> expedDeath(vid, mName, ...) calls
   registerDeath({ kind: 'villager', ..., cause: mName }) — the ONLY
   registerDeath call site in src/js whose cause is a monster display
   name (all other villager-death sites pass fixed strings like
   'monster', 'combat', 'thirst', or 'split-fight: ' + mname).
3. mName comes from encDescribeMonster(m) (src/js/encounters.js:136),
   which returns monsterDisplayName(mdef.id).
4. monsterDisplayName (src/js/game.js) returns the village-agreed
   villageName when one exists, else the true name post-System, else
   the unknown descriptor.
5. The village name itself comes from generateMonsterName
   (src/js/game.js): curated villageNames if the roster entry has any,
   else a temperament pool over the entry's nameTraits — and NO roster
   entry defines nameTraits, so every entry falls back to the default
   ['big', 'loud', 'ugly']. The steady-temperament pool is
   [`${Cap}-Eyes`, `The ${Cap} Beast`, `Big ${Cap}`]; with trait 'big'
   that yields exactly "The Big Beast". Majority agreement in
   monsterNamingCheck then sticks it as codex.monsters[mid].villageName.
6. corpses.js registerDeath fires tele 'death' with that cause verbatim;
   the sweep recorder copies day/kind/who/cause through, and the
   analyzer pools labels raw and unnormalized (the 70-character monitor
   lizard label in the same pool proves no truncation mangles labels).

So both rows are genuine expedition deaths (vDie on expedition) to a
monster the village had already named. The recorder did not invent,
duplicate, or truncate anything. No src/js change is warranted: there is
no label-generation bug to fix. What the label is NOT is a species:
"The Big Beast" is a generated village name — a display-name alias —
and the ledger cannot say which roster monster wore it, because
expedDeath passes killerId null and no monsterId (unlike the
hurtVillager path, which threads monsterId/monsterName into fallen
entries but records cause 'monster', not the name). The two seeds'
Big Beasts may be the same roster monster or two different ones; the
corpus cannot distinguish, and this file does not guess.

### H3 ROSTER CHURN — NOT PROVEN (and the rule's output stands)

Implemented rule: churn = count <= 2 AND (single-seed OR roster
monster-name). The Big Beast is count 2 on 2 seeds and is not a roster
monster-name (H1), so it fails both prongs of the OR's second half and
the single-seed prong: NOT churn. The deathext N=2 output is therefore
correct under its own rule, and this audit confirms it rather than
revising it. The prose reading ("it reads like a monster name, so treat
it as roster churn") would require changing the rule to read prose or
the generated-name pool — a re-tuning decision for a future arm, not a
finding of this audit. Note what this audit adds to that future
decision: the label is not even a prose guess at a roster name — it is
a mechanically generated alias from a 25-name pool (3 temperaments x 3
names x 3 default traits, 27 draws with 'Don't-Look' trait-independent),
so a prose-based churn prong would sweep in
generated aliases systematically, not just this one label.

### The n=2 stratum, complete (threshold c)

The 96-seed pooled list (323 villager deaths, 31 labels) has EXACTLY ONE
label at count 2: The Big Beast. There is no second n=2 label to dispose
of — any worked example with two n=2 rows would be inventing data.

Same-shape labels at other counts (generated village names from the
same steady pool, same default traits):
- "Big Big" — 1x, 1 seed — steady pool, trait 'big' (`Big ${Cap}`).
  Below N; sits in the churn band as a single-seed singleton.
- "Big Loud" — 1x, 1 seed — steady pool, trait 'loud' (`Big ${Cap}`).
  Below N; same disposition.
- "The Glow Stag" — 1x, 1 seed — NOT generated: a curated villageName
  for gallowdeer (Highbeam Deer). It IS roster churn by the implemented
  rule (curated villageNames are in the roster check), which is why it
  sits in the churn band while Big Beast does not. The contrast is the
  whole point: same pool shape in prose, opposite rule outcomes, because
  the rule reads the roster file, not the string.

Labels at count >= 3 that the rule treats as present, for contrast:
Choir Toad 4x/3 seeds (roster true name of belltoad), The Callback 3x/3
seeds (roster true name of callback) — both graduated out of churn by
recurrence, the pattern Big Beast has not reached.

### SENSE-TESTING — the rows in context

Seed 73747 (village-lost day 130, wave 4, reached the table, did not
win): day 77 is a heavy fight day — three monster-kind kills the same
day (anaconda_empress, gallowdeer, statickite) alongside the Big Beast
villager death. An earlier named-monster villager death on the same
seed (day 47, "Ad Break" — the true name of ad_break) shows the
naming/System display layer was already active long before day 77.
The Big Beast death reads as one more expedition loss on a bad day, not
as an anomaly: the village was already losing people to named monsters
and to generic 'monster' (days 88, 101) in the same stretch.

Seed 73796 (village-lost day 145, wave 4, arc 3, no table): the Big
Beast death on day 106 sits mid-run among steady monster-kind kills and
scholar arena deaths, with no other named-monster villager death on the
seed. That absence does not contradict the verdict: only expedition
deaths carry display names (the hurtVillager path records 'monster'),
so a village can have a settled monster name and show it exactly once
in the ledger — when an expedition villager dies to it. Both deaths are
late-run (days 77, 106), consistent with naming convergence taking time:
a village must meet, argue over, and agree a name before it can die to
"The Big Beast" rather than to an unknown descriptor or generic monster.

## THE OPERATIONAL N=2 FLAGGING RULE (threshold d — a future arm MUST follow this)

Status of N: the cited calibration is N=2 (deathext 96-seed pool,
323 deaths, churnMax 1). Until a future arm re-calibrates by the
implemented rule on its own pool, N=2 is the flagging threshold: a label
counts as PRESENT (citable as a real, recurring cause) at count >= 2,
and as CHURN (not citable) below 2.

Definitions for flagging:
- NEW label: a label absent from the cited pooled baseline (currently
  the deathext 96-seed list, 31 labels). A label already in the baseline
  is not "new" however often it recurs — recurrence is a graduation
  note, not a flag.
- FLAG: a NEW label reaching count >= N in a future arm's pool.
- DISPLAY CLASSES (classify before judging, in this order):
  1. roster — matches monsters.json id, name, unknown, or curated
     villageNames (case-insensitive);
  2. generated alias — matches the generateMonsterName pool (temperament
     pools over the roster's nameTraits, or the default
     ['big', 'loud', 'ugly'] if none are defined — recompute from the
     roster at flag time, do not hardcode the 25 names);
  3. true name — equals a roster name but reached via the post-System
     display path (indistinguishable in the ledger from class 1; treat
     as roster for flagging);
  4. unknown descriptor — equals a roster unknown field;
  5. unclassified — matches none of the above (possible new roster
     content, new descriptor, or a future naming pool).

Dispositions (exactly one per flagged label):
- INVESTIGATE (report as present, open a follow-up): a flagged label in
  class 1/3/4 across >= 2 seeds, or any flagged label in class 5 across
  >= 2 seeds after first checking whether monsters.json grew since the
  baseline run (a roster addition explains class 5 without any mystery).
  Investigation means: report the label as a present cause, name the
  seeds/days, and state what would confirm it (recurrence at larger
  scale, or a monsterId-carrying corpus). It never means editing the
  roster to match the label.
- HOLD (report as present alias / present-but-unidentified, open a
  follow-up, cite nothing further): a flagged label in class 2
  (generated alias, the Big Beast shape). It is real — a village named
  something and died to it — but it is not a species, not a roster
  entry, and not mergeable into one. HOLD forbids three moves: citing
  it as a monster species, merging it into any roster entry, and
  dismissing it as noise. Its follow-up is species identification only,
  which requires either a recorder that carries monsterId on expedition
  deaths or same-seed codex/transcript evidence naming the underlying
  monster — neither exists in the deathrow ledger, so HOLD is the
  terminal disposition for ledger-only arms.
- HOLD (churn-candidate, cite nothing): a flagged label on exactly 1
  seed at count 2 (any class). One seed's twice-told name is not
  recurrence. Re-check at larger scale; do not cite as present, do not
  delete.
- DISMISS as monster-name false positive (report as "not new", close
  with no follow-up): ONLY a label in class 1/3/4 that is already in
  the cited baseline or already in the roster at flag time — i.e. a
  known monster's name showing up again is not news. Dismissal is
  forbidden for class 2 (a generated alias is not a roster name, so
  "it's just a monster name" is false for it) and forbidden for class 5
  (unknown is not known). A future arm that dismisses a class-2 or
  class-5 label as a "monster-name false positive" has misapplied this
  rule.

### The monster-name tolerance question, answered explicitly

Question: may a future arm re-tune to N=3 so that a new monster name
appearing twice no longer flags?
Answer: YES, but only under all of these conditions, stated in its own
pre-registration BEFORE it sees the new pool's tail:
  (a) it names the tolerance decision explicitly (e.g. "we accept
      generated-alias and roster-churn noise at n=2, so present-status
      requires n>=3");
  (b) it reports BOTH readings — the N=2 flagging and the N=3 flagging —
      so the re-tune hides nothing;
  (c) it justifies the re-tune from the tolerance decision, never from
      this run.
What it may NOT cite this run for: this run does NOT authorize N=3.
Its rule output is N=2; its Big Beast verdict is "generated alias, not
roster" (H1/H3 not proven), which weakens rather than supports a
"Big Beast proves monster names need N=3" argument — the label that
motivated the question is not a roster monster name at all. A future
arm that writes "per sim-n2beast-b, N=3" has misread this file. It may
cite this file only for: N=2 is the current calibration; Big Beast is
a generated alias; class-2 labels need HOLD, not dismissal.

A related fork, stated not chosen: a future arm may instead EXTEND the
implemented churn prong to the generated-name pool (churn = count <= 2
AND (single-seed OR roster OR generated-alias)). That is also a
re-tuning, subject to the same three conditions, and it would move
Big Beast-shaped labels into churn at n=2 while leaving genuinely new
class-5 labels flagging. This file does not choose that fork — it
records that the fork exists and that either choice must be
pre-registered with dual reporting.

## WORKED EXAMPLE — the rule applied to the deathext 96-seed list (threshold e)

The n=2 stratum has one member. Applying the rule to it (as a future
arm would apply it to a new pool's n=2 flags — here the "new" label is
new relative to the 40-seed deathrow-b baseline, where Big Beast was
1x):

| Label | Count | Seeds | Roster? | Generated? | Display class | Disposition | What it triggers next |
|---|---|---|---|---|---|---|---|
| The Big Beast | 2 | 73747 (day 77), 73796 (day 106) | No | Yes — steady pool, trait 'big' | Generated alias (class 2) | HOLD — present alias, species unidentified | Species-ID only: a monsterId-carrying expedition-death recorder, or same-seed codex/transcript evidence. No roster edit, no species citation, no dismissal. If a future pool shows it at n>=3 across >=3 seeds, it graduates to "recurring alias" — still class 2, still not a species. |

Contrast rows (not n=2 flags, shown so the rule's edges are visible):
- Big Big (1x, 1 seed, generated, class 2): below N — churn band, no
  flag, no disposition. If a future pool lifts it to 2x across 2 seeds,
  it flags and takes HOLD, exactly like Big Beast.
- Big Loud (1x, 1 seed, generated, class 2): same as Big Big.
- The Glow Stag (1x, 1 seed, curated villageName for gallowdeer, class
  1): churn band by the roster prong. If it reached 2x across 2 seeds
  in a future pool, it would flag and take INVESTIGATE (roster class,
  multi-seed) — the opposite path from Big Beast at the same count,
  because its name is in the roster file and Big Beast's is not.
- Choir Toad (4x, 3 seeds, roster true name) and The Callback (3x, 3
  seeds, roster true name): present by recurrence; not flags (already
  in the baseline's present set), noted as graduations.

What NO disposition in this worked example triggers: no game-code
change, no roster edit, no N change. The only forward work it opens is
instrumental — a future arm's proposal to thread monsterId through
expedition deaths (the hurtVillager path already threads it into
fallen entries; expedDeath does not) — recorded here as a documented
blank, not built here, because this arm is measurement-only and no bug
was proven.

## METRIC REVIEW (required, §14 — no re-scoring in this run)

- No metric was re-scored: there is no before/after lever pair in this
  arm (audit + rule-writing, not a game lever), so no balanced-panel
  compare .md is attached — same standing precedent as the
  instrument-only arms (deathrow-b, deathext-b). The analyzer pool /
  proof test is the comparison of record.
- Method note for the NEXT run: the ledger's missing monsterId on
  expedition deaths is the binding limit on species identification
  for every generated-alias label, not just Big Beast. A future arm
  that wants to resolve aliases must change the recorder (or pair the
  ledger with codex/transcript corpora from the same seeds) — the
  ledger alone can never answer "which monster was The Big Beast?".
- The pre-registration's hypothesis criteria were fixed before verdicts
  were written into this file: H1/H2/H3 each have a falsifiable roster /
  code / row test, and the fourth-category fallback (generated alias)
  is what the code paths yielded. No verdict here rests on prose
  resemblance — the file's central distinction (Glow Stag = roster
  churn, Big Beast = generated alias) exists precisely because the
  rule reads the roster file, not the string.

## PROOF

- `node --check` clean on scripts/test-n2beast-b.js.
- `node scripts/test-n2beast-b.js` — 14 PASS, 0 FAIL (all legs pass): the
  n=2 stratum, both Big Beast rows, the roster non-match, the
  generated-pool match, the code-path greps (expedDeath cause mName,
  encDescribeMonster -> monsterDisplayName, monsterDisplayName
  villageName-first, generateMonsterName steady pool template), the
  same-shape labels (Big Big, Big Loud), the Glow Stag contrast, the
  N=2 recomputation, and the pooled totals (323 deaths, 31 labels).
- No src/js changed. No sibling axis, tree, branch, claim, or file
  touched. No push, no version bump, no live verification.
- Corpus: evidence/2026-10-25/perseed-deathrow-b/ +
  evidence/2026-10-25/perseed-deathext-b/ + sim-deathext-b-baseline.json
  (all pre-existing, untouched). Proof: scripts/test-n2beast-b.js.
  Evidence: evidence/2026-10-25/sim-n2beast-b.md (this file).

## VILLAGE ASSESSMENT (plain words)

Two villages, months apart in game time and seeds apart in the corpus,
both lost someone on expedition to a beast they had already named.
That is the whole story the ledger can tell, and it is a village story,
not a data error: people meet something big in the woods, argue about
what to call it, settle on "The Big Beast" — the plainest name a steady
villager reaches for — and then one of their own does not come home
from the treeline. The name turning up twice does not mean one monster
stalked two villages; village names are invented fresh in each village,
so the same plain name can be coined twice for two different beasts.
The ledger keeps the name and loses the beast, and this audit says so
plainly instead of picking a monster to blame. What is missing is the
thread from name to beast — a recorder that writes down which monster
a village named, not just what it called it. Until that thread exists,
"The Big Beast" stays on the books as a named loss with an unknown
face, which is honest, and more useful than a false certainty.

Convergence state: food-economy stays converging (this arm is
measurement infrastructure + a rule, not a game lever — no game-code
fix landed here). Tracker blank 3 (N=2 flagging consequence + Big Beast
roster question) is now answered: Big Beast is a generated village-name
alias, not a roster monster, not a bug, not roster churn; and the N=2
rule a future arm must follow is written above, with HOLD for generated
aliases and N=3 re-tuning allowed only pre-registered with dual
reporting, never cited from this run.
