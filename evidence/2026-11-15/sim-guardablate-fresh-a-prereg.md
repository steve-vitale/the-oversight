# CASCADE lingerer guard-removal ablation on a FRESH band (arm sim-guardablate-fresh-a) — the deciding test for the family-7 brain-side program decision, under the REVISED bar

Run: fleshout-20261115T2015Z (Loop A), axis scale-onramp (survival collapse).
Arm branch: `sim-guardablate-fresh-a` (worktree `~/workspace/worktrees/sim-guardablate-fresh-a`,
base master tip `605d72bd4` — see §Base). Subject branch: `transplant-guardablate-fresh-subject`
(cut only after the baseline leg has run AND the baseline gate has passed — see §Gate).
Binding prereg: this file. Written and committed BEFORE any judged sim
(proof scripts/test-guardablate-fresh-a.js, stage 1, green at prereg stage).

## The question

Does the CASCADE lingerer guard alone explain the lifted survival floor —
on seeds no earlier run has used, under a bar that can actually be met?
The 1715Z guardablate arm (evidence/2026-11-15/sim-guardablate-a.md) read
**AMBIGUOUS** on the matched band (subject 1/8 vs baseline 4/8 — a
3-survivor swing, mechanism corroborated, but the frozen mapping's
CONFIRMED bar of baseline−5 was unreachable at baseline 4/8). Its metric
review proposes the revised bar: CONFIRMED at subject ≤ baseline−3. This
arm re-runs the ablation on a FRESH band under that revised bar, so the
question gets a real new measurement instead of a re-score. Under the
revised bar the 1715Z read (1 vs 4) would have been CONFIRMED (1 ≤ 4−3);
this arm tests whether that verdict holds on unseen seeds.

## Guard identity — VERIFIED VERBATIM at base before any sim

The guard is `src/js/game.js:24147–24162` at base `605d72bd4`, inside
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
reproduced as it stands in the code.)

If the hunk had NOT matched dc8cbd3f3's +16 lines exactly, the arm would
have STOPPED here and reported. It matched, so the arm proceeds — no
improvised ablation set.

## Base

- Registered base: master `605d72bd4` (`605d72bd439d038143cb999aea46a386b4b7f345`,
  "sim-transplant2b-fresh-a: NOT-CARRIER evidence — family 2b fresh-band
  0/8 vs 0/8 (recovered 1715Z orphan: panel review_required, proof
  112/112) + corpora"). Master tip at run start IS `605d72bd4` — the arm
  branch sits at the tip, so no rebase is owed at adoption. If master
  moves during the run, rebase onto the current tip before finishing and
  re-run proofs after every rebase.
- Substrate verification by THIS arm at run start (before any sim):
  - `git diff --stat 1ca2c257d b4343ac9d -- src/js/` = `src/js/game.js | 16 ++++++++++++++++`
    — the guard and ONLY the guard between the 1215Z and 1615Z bases.
    (Re-verified by this arm; the 1715Z arm verified the same.)
  - `git diff --stat b4343ac9d 53e7b6a1e -- src/js/` = `src/js/build.js | 2 +-`
    (version string only) + `src/js/convo-mood.js | 16 ++++++++++++++++`
    (journey-establishment r214 plain parting). (Adopted from the 1715Z
    arm's verification; the proof re-checks the 1215Z→1615Z leg live.)
  - `git diff --numstat 53e7b6a1e 605d72bd4 -- src/` =
    `src/js/alienPlayers.js 3/3`, `src/js/game.js 31/7`,
    `src/js/sigW3c.js 4/4`. The game.js hunks are ONLY the
    journey-endgame r211 quoteWrap/sysSay display-only changes
    (c09a9f732 sysSay doubled-quote fix; 676430c3a quoteWrap follow-up)
    plus the sim-producerparty-b lever (50c874822 +19 lines: a villager
    who fled a hard beast seeds a win-plan) which was REVERTED in the
    same range (43124ee25 −19 lines, "pilot NO-GO evidence — lever
    reverted") — net zero from that pair, no producerparty code in the
    tip (`git grep producerparty` on HEAD game.js: nothing). The
    alienPlayers/sigW3c hunks are the same r211 quote fix. No other
    src file differs. The tip is therefore the 1715Z base + display-only
    quote fixes + a lever that was added and fully reverted.
  - Native standing sha at base: `f935997640a0c1df1a1eb52d91172c7bc49cc2b9ab58fe9d77f58a17839388e9`
    — IDENTICAL to the 53e7b6a1e value. Policy sha at base:
    `74a890f0844ebc19fce2ac24da360f114b1f366fdb33a185a122f891dc2f0456`
    — IDENTICAL to the 53e7b6a1e value. The fix standing sha is
    `f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078`
    (from 5157782a4), unchanged.
  - The guard is intact at this tip (`game.js:24162`, verified above).
  - The arm branch's one unique commit at run start is the 2b-fresh
    evidence commit it was adopted from (605d72bd4); this arm's own
    work starts with the prereg+proof commit.
- RNG-draw-footprint note (1715Z metric-review lesson): the r214 plain
  parting adds one Math.random draw per friendly/neutral sitting close
  and moved the matched-band baseline 8/8→4/8. The substrate changes
  since 53e7b6a1e are display-only string wrapping (quoteWrap/sysSay)
  plus an added-and-reverted lever — none of them adds a Math.random
  call on any path the sims exercise (quoteWrap/sysSay are pure string
  transforms; the reverted lever is absent from the tip). No drift
  check against the 1715Z matched-band baseline is owed on the FRESH
  band (there is no prior fresh-band read to drift against); the
  baseline leg below IS the fresh-band control.

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

## Fresh band + freshness (FULL check, per the seed-band freshness skill)

- Chosen band: **190631–190638** (8 seeds). Fallback band (pre-screened
  the same way, used ONLY if the primary baseline gate stops — see
  §Gate): **190661–190668**.
- Search scope and results (all run before this prereg was written,
  905 dated preregs in the tree):
  - Dated preregs (`grep -rl <seed> evidence/*/sim-*-prereg.md`):
    190631 and 190638 hit ONLY
    evidence/2026-11-15/sim-transplant2b-fresh-prereg.md — where the
    band is named as the pre-screened, UNUSED fallback ("fallback
    190631–190638 NOT needed", its evidence-wide rg timed out at
    100s and was NOT relied on). 190632–190637: NO prereg hits.
    The naming is a pre-screen reservation, never a run: no seed of
    this band was ever run by any arm. This arm completes the full
    check the 2b-fresh prereg left open, as the task brief directs,
    and the naming is recorded here so the next worker does not
    re-litigate it.
  - Evidence-wide seed-context rg (`rg -w -l '19063[1-8]' evidence/`):
    4 files — the 2b-fresh prereg above, plus 3 FALSE POSITIVES,
    each investigated: evidence/2026-11-14/panel-rageprecheck-b-
    confirm-before/cases/7c72c0522d33120aa5d042d7fd246427b37b08a7715fc7d0a9b074f0dc16dff8.json
    (`"kcal":190638.2857142857` — a pantry kcal float, not a seed);
    evidence/2026-10-21/garden-controller-diagnostics-r1.json and
    -r2.json (`"assisted": 190632.47378020972` — a spoilage kcal
    float, not a seed). No seed-context use of any of 190631–190638
    anywhere in evidence/.
  - Dated screens / extension bands: `grep -rln "190631"
    evidence/*/sim-*screen*.md evidence/*/*screen*.md` → NO matches.
  - Forbidden / contaminated band lists: no central list file
    exists; the forbidden bands named in prior preregs are
    190391–190398, 190581–190588, 190541–190548, 190561–190568,
    100301–100316, 100401–100416, 100421–100436, 73671–73678 —
    none is this band. (Sanity: 190641–190648, named as a fallback
    in evidence/2026-11-15/sim-transplant7redef-prereg.md line 209,
    is RESERVED by that naming and was NOT picked — the first
    fallback candidate 190651–190658 was likewise REJECTED because
    190658 is named in evidence/2026-11-12/sim-cut2confirm-b-prereg.md
    line 72 ("is 190658, outside this band").)
  - Fallback band 190661–190668, same full check: 0 prereg hits for
    all 8 seeds; evidence-wide `rg -w -l '19066[1-8]' evidence/` →
    7 files, ALL false positives, each investigated: kcal values
    only (`pantryDepositKcal: 190668`, `dgEasedCum: 190662`,
    `"kcal":190664.463735121`) in sim-onzero9754-b-corpus,
    belongcost-b-corpus, and panel-b2-after.repaired.json. No
    seed-context use of any of 190661–190668 anywhere.
- Step ids: baseline `ep-tip-guardablate-fresh`, subject
  `tguardablate-fresh`, subject re-run `tguardablate-fresh-r`
  (fresh step id; see §Verdict mapping). Corpus dir names distinct
  from the 1715Z arm's (guardablate-fresh, not guardablate).

## Measurement plan

- Subject branch `transplant-guardablate-fresh-subject`, cut from the
  arm branch ONLY after the baseline leg has run AND the baseline gate
  has passed (see §Gate). One subject commit: exactly the ablation
  hunk above. Subject policy == base policy; subject native standing
  == base native standing (sha `f9359976...`, see §Base). Measured
  diff verified byte-identical to the ablation set: the subject diff's
  added/removed lines must equal exactly the 16 removed lines above
  (−16/+0, one file); `villager-brain.js`, `standing.js`,
  `convo-mood.js`, and every other src/js file untouched. The branch
  was verified NOT to exist at run start (checked by this arm —
  absent; the 1715Z `transplant-guardablate-subject` branch is a
  different branch and is left alone).
- NO SNIFF: the fresh band has no prior read to sniff against, and the
  baseline leg below IS the control; a 4-seed sniff would add no
  information beyond the 8-seed baseline itself.
- BASELINE LEG: STEP `ep-tip-guardablate-fresh` on base `605d72bd4`,
  via `scripts/culpritbisect-step-guardablate-fresh-20261115.sh`
  (adapted from `scripts/culpritbisect-step-fresh-20261115.sh`:
  same fix-swap discipline, same 20261115 driver/analyzer mechanics
  — driver + analyzer copied with the fresh-band prefix
  `guardablate-fresh`, RUN `guardablate-fresh-pilot`; the step script
  restores the shared 20261113 tooling from master and the
  guardablate-fresh driver/analyzer from the arm branch; all files
  present on master AND on this arm branch, verified at run start)
  with `SEEDS=190631,190632,190633,190634,190635,190636,190637,190638`
  in the environment. Seeds 190631–190638, 150d death-aware,
  competent verbatim own-policy, fix standing swapped in, native
  restored byte-identical afterwards, sha-verified.
- SUBJECT LEG: STEP `tguardablate-fresh`, via the same step script
  with the same SEEDS env, on the subject commit. Seeds
  190631–190638, 150d death-aware, competent verbatim own-policy,
  fix standing swapped in every step, native restored byte-identical
  afterwards, sha-verified.
- Primary metric: survived/8 on the subject leg, judged by §Verdict
  mapping against the baseline leg. Secondary (diagnostic only):
  scholar deaths count + share (especially lingerer-path deaths —
  see §Lingerer-path diagnostic), wave-5 unlocks, median days,
  death-cause shares, standing distribution, national/table/wins.
  Rank read (same bands as r10/masterregress): regional ≥5/8
  REGIONAL_INTACT; ≤2/8 RANK_STALL; 3–4/8 RANK_INCONCLUSIVE. No cost
  guard — measurement arm; nothing lands on master from the subject
  (the subject branch is never merged).
- Telemetry: recorder-corpus class — the deviation check REFUSES
  these corpora (1715Z precedent, both arms); record the refusal,
  never roll the baseline.
- Sense-testing: read vetSays narration from BOTH corpora and judge
  meaning/coherence — census the lines, quote what villagers actually
  do/say, flag anything robotic or repeated. Compare baseline vs
  subject narration (a collapse-restored subject should read
  differently at the siege nights, not just in counts).

## Verdict mapping (FROZEN — revised bar, from the 1715Z metric review)

Let B = baseline survived/8 on the fresh band, S = subject survived/8.
The mapping below is the judge; no re-scoring against a friendlier
metric mid-run (§14).

- **CONFIRMED** — S ≤ B−3 (a 3-survivor gap, reachable at any baseline
  ≥3). The guard-attribution is confirmed: removing the guard restores
  the collapse on unseen seeds; family-7 brain-side closes as
  UNMEASURABLE-by-attribution — the collapse regime was guard-masked,
  not family-7. It does NOT re-judge the align step itself, which
  stays UNMEASURED (no subject leg ever ran for it).
- **REFUTED** — S ≥ B−1 (within 1 of baseline). Attribution refuted:
  something else raised the floor; family 7 stays open — the evidence
  file names the next question.
- **AMBIGUOUS** — else (S = B−2). Partial attribution, no closure —
  then re-run the SUBJECT leg once with a fresh STEP id
  (`tguardablate-fresh-r`); the re-run's count is judged by the same
  mapping and governs. If the re-run lands in the same AMBIGUOUS band
  again → recorded AMBIGUOUS, treated as NOT-CARRIER for ordering,
  kept on the suspect list (2b-fresh precedent).
- Boundary unit-cases in the proof: (B=8: S=5 CONFIRMED, S=6 AMBIGUOUS,
  S=7 REFUTED); (B=4: S=1 CONFIRMED, S=2 AMBIGUOUS, S=3 REFUTED);
  (B=3: S=0 CONFIRMED, S=1 AMBIGUOUS, S=2 REFUTED); (B=5: S=2
  CONFIRMED, S=3 AMBIGUOUS, S=4 REFUTED); (B=7: S=4 CONFIRMED, S=5
  AMBIGUOUS, S=6 REFUTED). The 1715Z read (S=1, B=4) classifies
  CONFIRMED under this mapping — recorded as the cross-check, NOT as
  this run's verdict.
- The proof's classifier implements exactly this mapping:
  `classifyVerdict(subject, baseline)` returns CONFIRMED / REFUTED /
  AMBIGUOUS / UNCLASSIFIABLE.

## Gate

**BASELINE GATE:** if the fresh baseline reads **B < 3/8, STOP** — do
not cut the subject leg. Try the ONE pre-screened fallback band
190661–190668 (baseline leg on the fallback band, step id
`ep-tip-guardablate-fresh-fb`); if that also reads < 3/8, STOP
**UNMEASURED** (band too harsh to judge; do not cut the subject leg).
The gate exists because the revised CONFIRMED bar (S ≤ B−3) needs a
baseline of at least 3 to be reachable at all, and a baseline below 3
leaves no room to distinguish a guard effect from a band that kills
everything. The only other STOP is an INSTRUMENT failure:
missing/unparseable per-seed files, instrument errors that can touch
the survival read, or a standing-restore failure — those are
INCOMPLETE, not a verdict, and are re-run, not judged.

## Lingerer-path diagnostic (secondary, pre-registered — read before judging the mechanism)

The guard's mechanism is specific: a lingering raider steps onto the
scholar and starts contact combat it always wins solo, then repeats on
the next bearer (the cascade-b Stage 1 diag: 10 repeat instances, 38/88
scholar deaths in the control pilot). The diagnostic to check on the
subject leg:

- Scholar (player) deaths: count + share of all deaths, per leg, and
  per-seed. The corpus does not carry cascade session provenance (no
  `cascade` keys in the culpritbisect per-seed JSONs), so lingerer-path
  deaths are identified by PATTERN, not by label: lockstep same-day
  scholar deaths (gap-0 followers — two scholars dying the same day
  to the same lingering killer, the cascade-b signature) and scholar
  deaths to "the wild" / combat while a lingerer is present. Record
  the pattern counts on both legs; a subject leg that restores the
  collapse should show the gap-0 lockstep pattern the baseline lacks.
  Reference from 1715Z (matched band): baseline gap-0 9, subject
  gap-0 26; scholar deaths 67→106.
- The proof's observable-effect leg (§Proof) is the direct instrument
  for the mechanism (multi-turn lingerer check on the baseline vs the
  subject extract); the corpus pattern is corroboration, not the
  judge. If the corpus shows no gap-0 pattern even on a collapsed
  subject leg, that goes in the metric review as an instrument gap —
  it does not overturn the verdict mapping.

## Proof

`scripts/test-guardablate-fresh-a.js` (stage 1, before any judged sim).
It proves: guard identity (the 16 lines at game.js:24147–24162 match
dc8cbd3f3's added lines byte-identically; the guard sits inside
monsterTurn; the lever commit dc8cbd3f3 touches exactly src/js/game.js
+16 in one hunk); substrate (only-src/js-change 1ca2c257d..b4343ac9d is
the guard; 53e7b6a1e..605d72bd4 src is alienPlayers 3/3 + game.js 31/7
(quoteWrap/sysSay display-only + producerparty added-and-reverted,
net zero) + sigW3c 4/4; standing/policy shas identical at both bases);
ablation-set definition (the subject diff is exactly the 16 removed
lines, −16/+0, one file — listed verbatim and matched against the live
source; the rejected stub form named with a reason); mechanism (the
guarded `if (m.lingering) return;` present at base; monsterTurn's
movement/combat code after the guard untouched; startCombat,
fieldFight sortie, gorge, and drift-valve code paths present);
verdict mapping (classifyVerdict revised form: S ≤ B−3 CONFIRMED,
S ≥ B−1 REFUTED, else AMBIGUOUS; boundary unit-cases; gate rule
B < 3 → STOP); base state (worktree-aware — tip is an ancestor of
HEAD, the prereg names the run id + band + fallback, src/js clean on
disk, standing == HEAD, only arm files uncommitted, step tooling
present on master + arm branch); fresh-band record (the band +
fallback + search scope + results, incl. the false-positive kcal
hits and the two rejected fallback candidates with reasons);
guard-effect legs (§7: the cascade-b unit-lingering case run live on
the baseline tree — lingering adjacent no move/no fight, lingering
on-cell no fight, non-lingering hungry adjacent DOES engage (positive
control), direct startCombat on a lingering raider still fights — all
4 sub-cases pass; plus the multi-turn check: no fight within 6 turns
and stance never assigned on the baseline); live subject state (§8:
STAGE-1 branch — no subject branch exists yet; after the cut —
branch exists, one commit, diff exactly the ablation set, no other
game file touched, policy + standing == base, and the multi-turn
linger check run live on a /tmp pathspec extract of the subject
shows the INVERTED polarity — the unstaged lingering adjacent raider
is assigned 'territorial' on turn 1, steps onto the scholar's cell
on turn 2, and starts the fight on turn 3 (foughtAt 3, seed 100207);
the single-turn unit-lingering case passing on the subject is the
documented fixture limitation carried from the 1715Z adjudication,
not a guard survival — the multi-turn check is the instrument);
step corpora (§9: STAGE-1 branch — no summaries exist; intermediate
branch — baseline summary exists, subject summary missing (GUARDED
read — no uncaught ENOENT, the leg reports "subject summary
missing" and waits); final branch — both exist, the gate is judged
(B ≥ 3 to proceed), the verdict is judged by the revised mapping,
corpora hold 8 files each, per-seed rows carry the right anchors +
fix + policy, instrument errors are 0, and the evidence file records
the verdict).
`scripts/test-culpritbisect-a.js` (116 legs) re-run on the arm branch
as the reused-tooling check. `scripts/test-cascade-b.js` re-run as the
guard-effect instrument (its unit-lingering case is the proof's §7/§8
leg; its static case asserts the guard hunk on the baseline).

## Canon

docs/CANON.md read first, plus docs/VILLAGER-BRAIN.md (the brain-side
program this arm decides for family 7) and docs/MONSTER-WAVES.md (the
siege section — wave 6+ is "the siege: the same escalation logic that
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
step corpora with a `scripts/build-guardablate-fresh-panels-20261115.js`
builder (linkdrive pattern, following
scripts/build-guardablate-panels-20261115.js — case identity is the
seed, pseudo-policy 'guardablate-fresh', before=baseline leg guard-ON,
after=subject leg guard-OFF, paired seeds on the same fresh band).
Contract metrics mappable from the culpritbisect per-seed JSONs: won,
national (scaleRank 'national' or higher), survival30/60 (gameDays),
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
  measures only the guard attribution defined above, on a fresh band
  under the revised bar. The 1715Z AMBIGUOUS stands as written; this
  run does not re-score it.
- /tmp tmpfs is 512M — never a full-tree `git archive` extract; use a
  pathspec extract (src/scripts/index.html/manifest.json/sw.js/
  build-source.json) for the guard-effect runs on the subject. Check
  /tmp before the subject extract and clear only stale completed-run
  scratch, never a live sibling's files.
- No game-code change is committed by this arm on the arm branch (the
  subject lives on its own branch `transplant-guardablate-fresh-subject`,
  left in place, never merged); no `[needs-eyes]` applies. The arm
  branch commits only: prereg, proof + panel builder + driver/analyzer/
  step-script copies, evidence + step corpora + panel summary.
- Telemetry deviation check (Loop A body step 10): attempted; prior
  bisect arms were REFUSED by the tool (recorder-corpus class). If
  refused again, recorded, not waived, baseline NOT rolled.
- Flap note: a host write flap blocked writes in windows on 2026-11-12
  and 2026-11-13 and earlier today. If the flap returns mid-run, WAIT
  for it to clear rather than bypassing safe-commit; never route around
  a denial, never use --force-delete, never do ref surgery during a flap.
- Safe-commit index clobber: watch for it after every safe-commit
  (prior arms: struck on nearly every commit on this tree) — repair
  with the documented `ls-tree -r HEAD -- <paths> | git update-index
  --add --index-info` pipe and verify worktree hash == HEAD blob
  before continuing.

## Metric review (§14 — filled in the evidence file, never re-scored here)

- (to be filled after the run: did the metric set hold, or does a metric
  need revision for the NEXT run?)
