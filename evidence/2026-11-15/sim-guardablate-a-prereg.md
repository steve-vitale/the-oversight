# CASCADE lingerer guard-removal ablation (arm sim-guardablate-a) — the DECIDING TEST for the family-7 brain-side program decision

Run: fleshout-20261115T1715Z (Loop A), axis scale-onramp (survival collapse).
Arm branch: `sim-guardablate-a` (worktree `~/workspace/worktrees/sim-guardablate-a`,
base master tip `53e7b6a1e` — see §Base). Subject branch: `transplant-guardablate-subject`
(cut only after the baseline leg runs — the baseline is a RE-RUN, not a gate; see §Gate).
Binding prereg: this file. Written and committed BEFORE any judged sim
(proof scripts/test-guardablate-a.js, stage 1, green at prereg stage).

## The question

Does the CASCADE lingerer guard alone explain the lifted survival floor?
Family 7 brain-side (the align step) is UNMEASURED because both measurement
routes closed on gate STOPs: fresh band 3/8 (1215Z), matched band 8/8
(1615Z, evidence/2026-11-15/sim-scale-onramp-round-1615.md §Arm 2). The
1615Z coordinator decision (2) left the program decision open: the
guard-removal ablation as the deciding test, or close by the guard
attribution. This run's coordinator decision (2) chose the ablation.
This arm is that deciding test.

The guard attribution, as it stands before this arm, is a single-diff
inference, not a controlled A/B: the ONLY src/js change between the 1215Z
base (1ca2c257d, fresh-band baseline 3/8) and the 1615Z base (b4343ac9d,
matched-band baseline 8/8) is the +16-line guard
(evidence/2026-11-15/sim-transplant7redef-match-prereg.md §Substrate
change; re-verified by THIS arm at run start — see §Base). This arm
supplies the controlled A/B on identical seeds: tip with the guard vs
tip with EXACTLY the guard lines removed. Nothing else differs between
the legs.

## Guard identity — VERIFIED VERBATIM at base before any sim

The guard is `src/js/game.js:24147–24162` at base `53e7b6a1e`, inside
`monsterTurn()`. The 16 lines are byte-identical to the added lines of
commit `dc8cbd3f3` (verified by THIS arm at run start: `git show
dc8cbd3f3 -- src/js/game.js` added lines diffed against
`sed -n '24147,24162p' src/js/game.js` — empty diff, 16 lines):

```
      // CASCADE (sim-cascade-b, Stage 1 proven): a lingering raider holds
      // the treeline — it is a siege, answered by sortie or endurance
      // (design call #8, Steve 2026-10-16), not a duel. The sortie code
      // itself says a lone villager against a treeline monster is a
      // funeral, not a sortie. But monsterTurn has no safe-tile check,
      // so the besieger steps onto the scholar — inside the hall, on
      // the Haven tile — and starts a turn-based fight it always wins
      // solo; on 'lost' tbEnd restores it wounded and it kills the next
      // bearer <redacted> same way (10 repeat instances, 38/88 scholar deaths
      // in the control pilot). It does not move onto the scholar or
      // start combat on contact. The scholar may still walk up and press
      // Fight (startCombat untouched), the sortie still fights it
      // (fieldFight, not monsterTurn), the nightly gorge and the ~6-night
      // drift valve are untouched, and non-lingering intruders still
      // breach exactly as before. Nothing despawns.
      if (m.lingering) return;
```

(The `<redacted>` above is the author's own word in the source comment,
reproduced as it stands in the code — the commit message says the same
thing in plainer words; the prereg quotes the code, not the message.)

If the hunk had NOT matched dc8cbd3f3's +16 lines exactly, the arm would
have STOPPED here and reported. It matched, so the arm proceeds — no
improvised ablation set.

## Base

- Registered base: master `53e7b6a1e` (`53e7b6a1eaf4004eab5e58f5c57cc88647142547`,
  "Version bump 493b82c6c-20261115-173353 (batch ship)"). Master tip at run
  start IS `53e7b6a1e` — the arm branch sits at the tip, so no rebase is
  owed at adoption. If master moves during the run, rebase onto the current
  tip before finishing and re-run proofs after every rebase.
- Substrate verification by THIS arm at run start (before any sim):
  - `git diff --stat 1ca2c257d b4343ac9d -- src/js/` = `src/js/game.js | 16 ++++++++++++++++`
    — the guard and ONLY the guard between the 1215Z and 1615Z bases.
    (Confirmed, not taken from the 1615Z record.)
  - `git diff --stat b4343ac9d 53e7b6a1e -- src/js/` =
    `src/js/build.js | 2 +-` (version string only, `79060b74b-20261115-113520`
    → `493b82c6c-20261115-173353`) + `src/js/convo-mood.js | 16 ++++++++++++++++`
    (journey-establishment r214, commit c89ac24b3: plain parting for
    friendly/neutral sittings — conversation goodbye lines only, no
    survival path). No other src/js file differs. The tip is therefore
    the 1615Z base + a dialogue-only change + a version stamp.
  - Native standing sha at base: `f935997640a0c1df1a1eb52d91172c7bc49cc2b9ab58fe9d77f58a17839388e9`
    — IDENTICAL to the 1215Z and 1615Z values. Policy sha at base:
    `74a890f0844ebc19fce2ac24da360f114b1f366fdb33a185a122f891dc2f0456`
    — IDENTICAL to the 1215Z and 1615Z values. The fix standing sha is
    `f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078`
    (from 5157782a4), unchanged.
  - The guard is intact at this tip (`game.js:24162`, verified above).
  - The arm branch's one unique commit at run start is the prereg+proof
    commit (this arm's own work).

## Ablation set definition (frozen)

REMOVE EXACTLY the 16 guard lines above from `src/js/game.js`
(`game.js:24147–24162`), 0 added. The subject diff vs tip must be ONLY
those lines: one file (`src/js/game.js`), −16/+0, no other game file
touched, no other behavior change. The removed lines are byte-identical
to the guard hunk verified above; the proof asserts this by diffing the
subject branch's removed lines against the dc8cbd3f3 added lines.

What the ablation restores (the pre-guard behavior): monsterTurn no
longer returns early for a lingering player-tile monster — the besieger
may step onto the scholar on the Haven tile and start contact combat,
exactly as before dc8cbd3f3. Nothing else is restored or changed: the
sortie, the nightly gorge, the ~6-night drift valve, startCombat, and
non-lingering breach behavior are all untouched on BOTH legs (they were
untouched by the guard itself).

Why this form: it is the inverse of the landed commit, line for line —
the smallest exactly-specified diff that removes the guard's effect,
and the only form that tests the attribution. A stub (e.g. forcing
`m.lingering` false) would measure a different change; deleting the
comment but keeping the `return` would measure nothing.

## Seed band + freshness (MATCHED — deliberate reuse, authorized)

- Band: **190391–190398** (8 seeds), MATCHED. This is the bisect program's
  canonical band — the merge leg, the far-end leg, rounds 12–13, the
  7redef fresh/matched arms, and dozens of transplant legs all ran on
  it. That is the point: the question is an A/B against the 1615Z
  baseline design on identical seeds.
- The reuse is DELIBERATE, authorized by the 1415Z coordinator decision
  (2) matched-band precedent (recorded in the 7redef-match prereg) AND
  by this run's coordinator decision (2) — the 1615Z coordinator
  decision, which explicitly named "guard-removal ablation as the
  deciding test, own prereg". This file IS that prereg. Do NOT treat
  the reuse as a freshness failure: the band's prior reads ARE the
  comparison (the 1615Z baseline 8/8 is the drift-check reference).
- Freshness search (per local_seed_band_freshness skill): NOT re-run in
  full — the 7redef-match prereg already recorded it for this exact band
  (per-seed prereg hits 92/14/19/12/15/14/11/92; corpora across dozens of
  arms; no forbidden list). The search result is adopted by reference:
  the hits are the expected matched reuse. No fresh band is picked for
  this arm — the task brief forbids it, and a fresh band would break the
  A/B against the 1615Z baseline.
- Forbidden bands (never reused): 190581–190588, 190541–190548,
  190561–190568, 100301–100316, 100401–100416, 100421–100436,
  73671–73678.
- Step ids: baseline `ep-tip-guardablate`, subject `tguardablate`.
  Corpus dir names distinct from the 7redef-match run's
  (ep-tip-guardablate, not ep-tip-7redef-match).

## Measurement plan

- Subject branch `transplant-guardablate-subject`, cut from the arm branch
  ONLY after the baseline leg has run (the baseline leg is a re-run, not
  a gate — see §Gate — so the cut waits on the baseline leg COMPLETING,
  not on it passing a threshold). One subject commit: exactly the
  ablation hunk above. Subject policy == base policy; subject native
  standing == base native standing (sha `f9359976...`, see §Base).
  Measured diff verified byte-identical to the ablation set: the subject
  diff's added/removed lines must equal exactly the 16 removed lines
  above (−16/+0, one file); `villager-brain.js`, `standing.js`,
  `convo-mood.js`, and every other src/js file untouched.
  The branch was verified NOT to exist at run start (checked by this
  arm — absent).
- NO SNIFF: the 7redef-match arm already proved band health on this
  band 1 hour ago on a substrate one dialogue-only change away
  (sniff 4/4, baseline 8/8). The baseline re-run leg below IS the
  drift check; a second 4-seed sniff would add no information.
- BASELINE LEG: STEP `ep-tip-guardablate` on base `53e7b6a1e`, via
  `scripts/transplant7redef-step.sh` (reused as-is, ARM_BRANCH=
  sim-guardablate-a in the environment — the script restores the driver
  + shared analyzer + instrument from master and the redefined analyzer
  from the arm branch; all four files are present on master AND on this
  arm branch, verified at run start) with
  `SEEDS=190391,190392,190393,190394,190395,190396,190397,190398` in the
  environment. Seeds 190391–190398, 150d death-aware, competent verbatim
  own-policy, fix standing swapped in, native restored byte-identical
  afterwards, sha-verified.
- DRIFT CHECK (pre-registered, part of the baseline leg, NOT a verdict):
  compare the re-run baseline's per-seed days against the 1615Z baseline
  (190391–190398: 150/150/150/150/150/150/150/150, all survived, waves
  5/4/4/5/4/5/4/5, standing 380/199/199/490/199/290/199/295). The ONLY
  substrate change since 1615Z is the convo-mood plain-parting (+16,
  dialogue-only) + the version stamp, so the re-run is expected to read
  8/8 with IDENTICAL per-seed days. Any drift (any seed's days or wave
  differing, or survived <8/8) must be EXPLAINED before judging the
  subject — the drift is then a same-run investigation item, and the
  subject is judged against the RE-RUN baseline (relative form, §Verdict),
  never against the 1615Z numbers.
- SUBJECT LEG: STEP `tguardablate`, via the same step script with the
  same SEEDS env, on the subject commit. Seeds 190391–190398, 150d
  death-aware, competent verbatim own-policy, fix standing swapped in
  every step, native restored byte-identical afterwards, sha-verified.
- Primary metric: survived/8 on the subject leg, judged by §Verdict
  against the baseline leg. Secondary (diagnostic only): scholar deaths
  count + share (especially lingerer-path deaths — see §Lingerer-path
  diagnostic), wave-5 unlocks, median days, death-cause shares, standing
  distribution, national/table/wins. Rank read (same bands as r10/
  masterregress): regional ≥5/8 REGIONAL_INTACT; ≤2/8 RANK_STALL;
  3–4/8 RANK_INCONCLUSIVE. No cost guard — measurement arm; nothing
  lands on master from the subject (the subject branch is never merged).
- Telemetry: recorder-corpus class — the deviation check REFUSES these
  corpora (1615Z precedent, both arms); record the refusal, never roll
  the baseline.
- Sense-testing: read vetSays narration from BOTH corpora and judge
  meaning/coherence — census the lines, quote what villagers actually
  do/say, flag anything robotic or repeated. Compare baseline vs subject
  narration (a collapse-restored subject should read differently at the
  siege nights, not just in counts).

## Verdict mapping (FROZEN — absolute + relative forms, both pre-registered)

Baseline expectation: **8/8** (1615Z). The mapping below is the judge;
no re-scoring against a friendlier metric mid-run (§14).

- ABSOLUTE form (applies when the re-run baseline reads 8/8, as expected):
  - subject ≤3/8 → **CONFIRMED** (guard-attribution confirmed: removing the
    guard restores the collapse; family-7 brain-side closes as
    UNMEASURABLE-by-attribution — the collapse regime was guard-masked,
    not family-7).
  - subject ≥6/8 → **REFUTED** (attribution refuted: something else raised
    the floor; family 7 stays open — the evidence file names the next
    question).
  - subject 4–5/8 → **AMBIGUOUS** (partial attribution, no closure).
- RELATIVE form (applies when the re-run baseline reads <8/8 — the drift
  case; judge the subject against the RE-RUN baseline, never the 1615Z
  numbers):
  - subject ≤ baseline−5 → **CONFIRMED**.
  - subject ≥ baseline−2 → **REFUTED**.
  - else → **AMBIGUOUS**.
- Which form applies is decided by the re-run baseline read itself (8/8
  → absolute; <8/8 → relative), before the subject leg is judged. The
  proof's classifier implements exactly this branch: `classifyVerdict
  (subject, baseline)` returns CONFIRMED / REFUTED / AMBIGUOUS /
  UNCLASSIFIABLE, and unit-cases cover both forms plus the boundary
  (baseline 8, subject 3/4/5/6; baseline 7, subject 2/5/6; baseline 5,
  subject 0/3/4).
- NOTE on the relative form's reach: CONFIRMED needs a 5-survivor gap
  (subject ≤ baseline−5), so it is unreachable when the re-run baseline
  reads below 5/8 — e.g. baseline 4, subject 0 is AMBIGUOUS (gap 4),
  not CONFIRMED. That is the frozen mapping's arithmetic, not a bug;
  the evidence file's metric review flags it. (At the expected baseline
  8/8 the absolute form applies, where CONFIRMED is reachable.)
- What this verdict does and does not do: CONFIRMED closes family 7
  brain-side as a carrier question BY ATTRIBUTION (the collapse the
  family needed to explain was the guard's absence, not the align step)
  — it does NOT re-judge the align step itself, which stays UNMEASURED
  (no subject leg ever ran for it). REFUTED keeps family 7 open and
  sends the floor-raising question back to the coordinator with the
  next question named. AMBIGUOUS closes nothing.

## Gate

There is NO baseline gate on this arm (unlike the 7redef arms): the
baseline leg is a re-run whose read is the drift check AND the control
for the A/B. Any baseline read 0–8/8 proceeds to the subject leg — the
verdict mapping above already handles every baseline read (absolute
form at 8/8, relative form below). The only STOP is an INSTRUMENT
failure: missing/unparseable per-seed files, instrument errors that
can touch the survival read, or a standing-restore failure — those are
INCOMPLETE, not a verdict, and are re-run, not judged.

## Lingerer-path diagnostic (secondary, pre-registered — read before judging the mechanism)

The guard's mechanism is specific: a lingering raider steps onto the
scholar and starts contact combat it always wins solo, then repeats on
the next bearer (the cascade-b Stage 1 diag: 10 repeat instances, 38/88
scholar deaths in the control pilot). The diagnostic to check on the
subject leg:

- Scholar (player) deaths: count + share of all deaths, per leg, and
  per-seed. Baseline expectation from 1615Z: "the wild" 35/593 (6%)
  and combat 179/593 (30%) — the corpus does not carry cascade session
  provenance (no `cascade` keys in the culpritbisect per-seed JSONs),
  so lingerer-path deaths are identified by PATTERN, not by label:
  lockstep same-day scholar deaths (gap-0 followers — two scholars
  dying the same day to the same lingering killer, the cascade-b
  signature) and scholar deaths to "the wild" / combat while a lingerer
  is present. Record the pattern counts on both legs; a subject leg
  that restores the collapse should show the gap-0 lockstep pattern the
  baseline lacks.
- The proof's observable-effect leg (§Proof) is the direct instrument
  for the mechanism (unit-lingering on the baseline vs the subject
  extract); the corpus pattern is corroboration, not the judge. If the
  corpus shows no gap-0 pattern even on a collapsed subject leg, that
  goes in the metric review as an instrument gap — it does not overturn
  the verdict mapping.

## Proof

`scripts/test-guardablate-a.js` (stage 1, before any judged sim). It proves:
guard identity (the 16 lines at game.js:24147–24162 match dc8cbd3f3's
added lines byte-identically; the guard sits inside monsterTurn; the
lever commit dc8cbd3f3 touches exactly src/js/game.js +16 in one hunk);
substrate (only-src/js-change 1ca2c257d..b4343ac9d is the guard;
b4343ac9d..53e7b6a1e src/js is convo-mood +16 + build.js version stamp;
standing/policy shas identical across all three bases); ablation-set
definition (the subject diff is exactly the 16 removed lines, −16/+0,
one file — listed verbatim and matched against the live source; the
rejected stub form named with a reason); mechanism (the guarded
`if (m.lingering) return;` present at base; monsterTurn's movement/
combat code after the guard untouched; startCombat, fieldFight sortie,
gorge, and drift-valve code paths present); verdict mapping
(classifyVerdict absolute + relative forms, boundary unit-cases);
base state (worktree-aware — tip is an ancestor of HEAD, the prereg
names the run id + band, src/js clean on disk, standing == HEAD, only
arm files uncommitted, step tooling present on master + arm branch,
step-script #2381 fix present); seed-band identity (MATCHED band
190391–190398, step ids ep-tip-guardablate / tguardablate, subject
branch transplant-guardablate-subject, matched-reuse search adopted
from the 7redef-match prereg by reference + this run's coordinator
decision (2) authorization); guard-effect legs (§7: the cascade-b
unit-lingering case run live on the baseline tree — lingering adjacent
no move/no fight, lingering on-cell no fight, non-lingering hungry
adjacent DOES engage (positive control), direct startCombat on a
lingering raider still fights — all 4 sub-cases pass); live subject
state (§8: STAGE-1 branch — no subject branch exists yet; after the
cut — branch exists, one commit, diff exactly the ablation set, no
other game file touched, policy + standing == base, and the
unit-lingering case run live on a /tmp pathspec extract of the subject
shows the INVERTED polarity — the lingering adjacent raider DOES move
onto the scholar and start combat, i.e. the case FAILS with the
pre-registered expected detail; the non-lingering positive control
still passes on the subject); step corpora (§9: STAGE-1 branch — no
summaries exist; intermediate branch — baseline summary exists, subject
summary missing (GUARDED read — no uncaught ENOENT, the leg reports
"subject summary missing" and waits); final branch — both exist, drift
check judged, verdict judged, corpora hold 8 files each, per-seed rows
carry the right anchors + fix + policy, instrument errors are 0, and
the evidence file records the verdict).
`scripts/test-culpritbisect-a.js` (116 legs) re-run on the arm branch
as the reused-tooling check. `scripts/test-cascade-b.js` re-run as the
guard-effect instrument (its unit-lingering case is the proof's §7/§8
leg; its static case asserts the guard hunk on the baseline).

## Canon

docs/CANON.md read first, plus docs/MONSTER-WAVES.md (the siege
section — wave 6+ is "the siege: the same escalation logic that
produced waves 1–5, pointed at a village the audience refuses to let
go… a multi-phase siege, not a duel… survivable-in-principle, never a
scripted wipe") and docs/ONTOLOGY.md (lingering raiders: the persistent
threat; the crisis resolves 'fought' when the treeline is clear,
'moved-on' on the 6-day valve; unmet raiders linger and gorge — the
havenGrowth mechanic). The guard comment itself cites design call #8
(Steve 2026-10-16): a lingering raider is a siege, answered by sortie
or endurance, not a duel. No canon doc covers the monsterTurn
contact-combat initiation itself — the guard comment is the design
statement for it, and this arm quotes it rather than inventing canon.
Nothing here invents canon.

## Balanced panel (§15)

Run `scripts/balance-panel.js` before/after compare on the two legs
(build --out/--seeds/--policies/--days, then compare); attach the
compare .md to the evidence. The panel is the instrument; the prereg
threshold is the judge. Concretely: build pseudo-panels from the two
step corpora with a `scripts/build-guardablate-panels-20261115.js`
builder (linkdrive pattern, following
scripts/build-gorgeprice2-panels-20261115.js — case identity is the
seed, pseudo-policy 'guardablate', before=baseline leg guard-ON,
after=subject leg guard-OFF, paired seeds on the same tip). Contract
metrics mappable from the culpritbisect per-seed JSONs: won, national
(scaleRank 'national' or higher), survival30/60 (gameDays),
communityLost (endReason village-lost/village-dead/pop-zero),
villageDeaths (deaths count). All other contract metrics null (not
observed by this instrument — never faked). Commit panel summary only
(panel.json.gz + compare .md/.json); NEVER commit the cases/ cache.

## Guards (reported, never verdict-flipping post-hoc)

- If any per-seed file is missing or fails to parse, the step is
  INCOMPLETE, not a verdict — re-run the missing seed(s) only.
- If instrument errors > 0 on any seed, record them; the verdict
  stands only if the errors cannot touch the survival read (the
  survival read comes from the harness end state, not the instrument).
- The fix swap is the ONLY permitted uncommitted change during a step
  (plus the untracked tooling scratch). After each step, the original
  `standing.js` is restored byte-identical (sha-verified) before the
  next step or any evidence commit. If a restore fails, FAIL LOUDLY
  and do not commit evidence. After each leg, check the arm branch
  back out (the step script leaves HEAD detached at the step commit).
- This arm does NOT re-judge any prior verdict (family 7 UNMEASURED,
  7b NOT-CARRIER, 8fam/8b/8c NOT-CARRIER, masterregress CULPRIT_MERGE /
  POLICY_EXONERATED_AT_MERGE, and the rest of the bisect record) — it
  measures only the guard attribution defined above.
- /tmp tmpfs is 512M — never a full-tree `git archive` extract; use a
  pathspec extract (src/scripts/index.html/manifest.json/sw.js/
  build-source.json) for the guard-effect runs on the subject. The
  1615Z run found /tmp 100% full from stale extracts — check /tmp
  before the subject extract and clear only stale completed-run
  scratch, never a live sibling's files.
- No game-code change is committed by this arm on the arm branch (the
  subject lives on its own branch `transplant-guardablate-subject`,
  left in place, never merged); no `[needs-eyes]` applies. The arm
  branch commits only: prereg, proof + panel builder, evidence + step
  corpora + panel summary.
- Telemetry deviation check (Loop A body step 10): attempted; prior
  bisect arms were REFUSED by the tool (recorder-corpus class). If
  refused again, recorded, not waived, baseline NOT rolled.
- Flap note: a host write flap blocked .git ref writes ~17:29–17:43Z
  and file writes from ~17:50Z on this run's day (two windows, both
  cleared on their own). If the flap returns mid-run, WAIT for it to
  clear rather than bypassing safe-commit; never route around a denial,
  never use --force-delete, never do ref surgery during a flap. The
  flap-watch log is stale post-restart (watcher not yet restarted by
  its watchdog) — noted, not this arm's to fix.
- Safe-commit index clobber: watch for it after every safe-commit
  (prior arms: struck on nearly every commit on this tree) — repair
  with the documented `ls-tree -r HEAD -- <paths> | git update-index
  --add --index-info` pipe and verify worktree hash == HEAD blob
  before continuing.

## Metric review (§14 — filled in the evidence file, never re-scored here)

- (to be filled after the run: did the metric set hold, or does a metric
  need revision for the NEXT run?)
