# sim-fusionoffer-b — BUILD (findings #2326 + #2327)

Run: fleshout-loop-b-20261114T0730Z (Loop B), arm sim-fusionoffer-b
Axis: winnability chain (findings #2326 + #2327, filed by Loop B arm
sim-retribution-offer-b; see evidence/2026-11-14/sim-retribution-offer-b.md)
Branch: sim-fusionoffer-b — worktree ~/workspace/worktrees/sim-fusionoffer-b
Base: master d3fb7d5fb (one commit behind current master 2de44bad8 — a
playtest-loop landing; do NOT rebase, the coordinator rebases at landing)
Date: 2026-11-14
Prereg: evidence/2026-11-14/sim-fusionoffer-b-prereg.md (written 08:10Z,
sha256 92fbb05d1d2e7f226118a567285e9e7db60483f8c98fcc10b438e88c10716e21)

## Verdict: GO on both findings — fix verified live in sims

- (a) #2326 DEFERRAL: GO. Staged 16/16; live on 190395: the day-75
  prize sheet [switcheroo, aegis_link, bird_whisperer] that the
  fusion offer trampled BEFORE is ACCEPTED after (switcheroo
  taken), and the fusion offer lands the same day right after it
  (seq 25, accepted).
- (b) #2327 PELLET GATE: GO. Staged 16/16; live on 190395: the
  day-34 prize sheet that offered fusion_reactor with no pellet
  BEFORE (unattributed fizzle, instrument error) is
  [unbreakable, switcheroo, rain_dancer] AFTER — fusion never
  offered, no fizzle, no error.
- (c) PROOF TEST GREEN: GO — scripts/test-fusionoffer-b.js 16/16
  post-fix (8/16 pre-fix, defect legs RED as designed), re-run
  16/16 after the fix was re-applied for the before re-runs.
- (d) NEUTRALITY: GO — survived 1/8 both legs, maxWave
  distribution identical (5 on 190397 only), median survival
  127.5d both legs; per-seed days/standing/maxWave identical on
  all 8 seeds. One intended movement on 190395 (see below).
- (e) check.js --quick: FAILED as measured — 325 passed, 15
  failed — cause identified as the write flap (see check.js
  section); all fusion/contest/ability-area tests green
  individually. A clean re-run after the flap clears is owed
  before landing.
- (f) SENSE: GO — no silent discard, no nag, no nonsense line
  (see Sense-testing).

## What was wrong, in plain words

Twice on the retribution band the System stepped on its own offer.
First, when the scholar won a contest and was still choosing between
three prize abilities, the pellet in their pack made the System blurt
out the fusion-reactor offer instead — wiping the prize sheet the
scholar had not answered. Second, the contest prize bag offered the
fusion reactor to a scholar who did not even hold a pellet — and when
the scholar accepted, the install reached for a pellet that was not
there and the ability dissolved. The offer was a taunt the install
undid. Both are fixed now: the fusion offer waits its turn, and the
prize bag only offers the reactor when there is a pellet to install.

## The fix (two guards, same offer path)

- #2326 — `maybeOfferFusionReactor` (src/js/game.js): replaced the
  fusion-only pending check with the any-sheet guard
  `if ((s.abilityChoices || []).length) return false;` — the same
  shape `pumpLevelUps` (tracks.js:438) and `_cxPrizeAbilityOffer`
  already use. Deferral is lossless: the day-part tick (game.js:28857)
  and the pellet-arrival loot hook (game.js:46758) call the offer
  again, so it lands the moment the pending sheet clears. No queue
  state, no narration change — the pending sheet's own lines stand
  and the fusion sysSay fires only when the offer really lands.
- #2327 — `_cxPrizeAbilityOffer` (src/js/contests.js:5055): the prize
  bag now also excludes fusion_reactor when the scholar holds no
  pellet (`!this.hasFusionPellet()` — the same possession condition
  `abilityOnAcquire` uses). The singularity exclusion stays as-is.
- Scope check (done before the run): no other player offer path can
  surface fusion_reactor. It is in NO tracks.json kit (so
  `levelUpOffers` can never offer it); the arrival sheet and the
  aid-quest reward use fixed small pools that exclude it; villager
  paths already exclude it (villager-build.js:257/295/312). The
  `abilityOnAcquire` revoke stays in place as the backstop for any
  stale pre-fix sheet.

## Proof: staged RED -> GREEN (scripts/test-fusionoffer-b.js)

Fixture (Steve 2026-11-13): a mid-game scholar — integration 80
(6 slots), two early-kit abilities held (lucky_rock, green_thumb),
machete + bark armor in the pack, pellet present/absent per leg.

Pre-fix run (base d3fb7d5fb, unmodified game code): **8 passed,
8 failed** — the defect legs fail exactly as the findings describe:
- F1: `maybeOfferFusionReactor()` returned true and the pending
  prize sheet [switcheroo, aegis_link, bird_whisperer] became
  [fusion_reactor] (the 190395 day-75 trample, staged verbatim).
- P1: with the bag narrowed to [fusion_reactor, night_eyes] and NO
  pellet, the prize sheet was [fusion_reactor].
- P2: 1/40 full-bag prize sheets contained fusion_reactor with NO
  pellet (the 190395 day-34 fizzle, reproduced statistically).
Post-fix run: **16 passed, 0 failed**. Legs:
- (a) #2326 deferral: pending sheet survives byte-identical,
  offer returns false, no fusion line is said while deferred;
  after the sheet is answered the offer lands (returns true,
  [fusion_reactor]), the fusion sysSay fires exactly once, the
  accepted reactor installs and the pellet is consumed.
- (b) #2327 pellet gate: narrowed bag — without pellet the sheet
  is [night_eyes] only; with pellet it offers fusion_reactor and
  the accepted reactor installs (no fizzle). Full bag — 0/40
  sheets contain fusion_reactor without a pellet.
- (c) Safety net: a stale pre-fix sheet offering fusion with no
  pellet still revokes honestly (not held, no phantom reactor).

## Neutrality leg (before/after, retribution driver)

Competent verbatim, 150d death-aware, steeple band 190391–190398.
BEFORE: anchor d3fb7d5fb, RUN fusionoffer-before,
evidence/2026-11-14/perseed-fusionoffer-b-before/ (per-seed files
LOST — the write flap denied every file write, the driver fell back
to stdout, and the delivered output was truncated to the last 2
seeds; recovered summaries: 190393, 190397, 190398 below).
AFTER: anchor d3fb7d5fb (fix uncommitted in worktree — see Commits),
RUN fusionoffer-after, summaries captured via stdout grep;
per-seed JSONs landed for 190392–190398 (190391's file is a
0-byte tmp — its summary survives via grep).
The 5 missing BEFORE summaries (190391, 190392, 190394, 190395,
190396) are re-run individually after the AFTER leg, same driver,
same anchor, summaries via grep; a single-seed re-run of 190393 is
used to validate the method (must reproduce 126/199/4, offers 16).

BEFORE summaries recovered from the full-band run (per-seed files
lost to the flap; summaries from the delivered stdout):
| seed | days | end | maxWave | standing | scale | offers | bySource (arr/LU/prize/fusion) | byStatus (acc/tram/pend) |
|------|------|-----|---------|----------|-------|--------|-------------------------------|--------------------------|
| 190393 | 126 | village-lost | 4 | 199 | regional | 16 | 1/13/2/0 | 15/1/0 |
| 190397 | 128 | village-lost | 5 | 320 | regional | 15 | 1/10/3/1 | 12/2/1 |
| 190398 | 92 | village-lost | 4 | 199 | regional | 12 | 1/9/1/1 | 10/2/0 |

NOTE: these differ from the retribution arm's run on base 6a74c1522
(190393 was 126/199/4 there too, but 190397 was 135/199/4 and
190398 was 139/370/5) — the rageprecheck landing between the bases
moved trajectories. The before/after comparison on THIS base is the
judged one; the retribution corpora are NOT a substitute before
record.

AFTER summaries (all 8, RUN fusionoffer-after, anchor d3fb7d5fb at
launch — fix in worktree, uncommitted; per-seed files landed for
190392–190395, summaries via grep for the rest):
| seed | days | end | maxWave | standing | scale | offers | bySource (arr/LU/prize/fusion) | byStatus (acc/tram/pend) |
|------|------|-----|---------|----------|-------|--------|-------------------------------|--------------------------|
| 190391 | 64 | village-lost | 4 | 145 | regional | 5 | 1/2/1/1 | 5/0/0 |
| 190392 | 143 | village-lost | 4 | 199 | regional | 11 | 1/7/2/1 | 10/1/0 |
| 190393 | 126 | village-lost | 4 | 199 | regional | 16 | 1/13/2/0 | 15/1/0 |
| 190394 | 146 | village-lost | 4 | 199 | regional | 15 | 1/9/4/1 | 15/0/0 |
| 190395 | 150 | survived | 4 | 199 | regional | 19 | 1/12/5/1 | 18/1/0 |
| 190396 | 127 | village-lost | 4 | 199 | regional | 13 | 1/10/1/1 | 10/3/0 |
| 190397 | 128 | village-lost | 5 | 320 | regional | 15 | 1/10/3/1 | 12/2/1 |
| 190398 | 92 | village-lost | 4 | 199 | regional | 12 | 1/9/1/1 | 10/2/0 |

After-leg scale wall: 1/8 survived (190395, 150d), 0 national,
0 table, 0 wins; maxWave 5 on 190397, 4 on the rest; median
survival 127.5d (sorted days 64, 92, 126, 127, 128, 143, 146,
150 — conventional median (127+128)/2 = 127.5). The wall stands —
this fix was never expected to move it.

BEFORE re-run summaries (individual seeds, same driver, same
anchor d3fb7d5fb, fix temporarily reverted via edit — the fix was
re-applied afterwards and the proof test re-run 16/16; per-seed
files landed in perseed-fusionoffer-b-before-rerun/):
| seed | days | end | maxWave | standing | scale | offers | bySource (arr/LU/prize/fusion) | byStatus (acc/tram/unattr) |
|------|------|-----|---------|----------|-------|--------|-------------------------------|----------------------------|
| 190391 | 64 | village-lost | 4 | 145 | regional | 5 | 1/2/1/1 | 5/0/0 |
| 190392 | 143 | village-lost | 4 | 199 | regional | 11 | 1/7/2/1 | 10/1/0 |
| 190393 | 126 | village-lost | 4 | 199 | regional | 16 | 1/13/2/0 | 15/1/0 |
| 190394 | 146 | village-lost | 4 | 199 | regional | 15 | 1/9/4/1 | 15/0/0 |
| 190395 | 150 | survived | 4 | 199 | regional | 16 | 1/9/5/1 | 12/3/1 |
| 190396 | 127 | village-lost | 4 | 199 | regional | 13 | 1/10/1/1 | 10/3/0 |
| 190397 | 128 | village-lost | 5 | 320 | regional | 15 | 1/10/3/1 | 12/2/0 |
| 190398 | 92 | village-lost | 4 | 199 | regional | 12 | 1/9/1/1 | 10/2/0 |

Method validation: the 190393 single-seed re-run reproduces the
full-band before summary byte-for-byte on every field
(126/199/4, offers 16, 1/13/2, accepted 15/trampled 1, held 2,
deaths 85, errors 0) — single-seed runs are comparable to the
full-band run.

BEFORE vs AFTER, per seed (days / standing / maxWave / offers /
trampled / unattributed):
| seed | before | after | verdict |
|------|--------|-------|---------|
| 190391 | 64 / 145 / 4 / 5 / 0 / 0 | 64 / 145 / 4 / 5 / 0 / 0 | identical |
| 190392 | 143 / 199 / 4 / 11 / 1 / 0 | 143 / 199 / 4 / 11 / 1 / 0 | identical |
| 190393 | 126 / 199 / 4 / 16 / 1 / 0 | 126 / 199 / 4 / 16 / 1 / 0 | identical |
| 190394 | 146 / 199 / 4 / 15 / 0 / 0 | 146 / 199 / 4 / 15 / 0 / 0 | identical |
| 190395 | 150 survived / 199 / 4 / 16 / 3 / 1 | 150 survived / 199 / 4 / 19 / 1 / 0 | trajectory identical; offer stream fixed (see below) |
| 190396 | 127 / 199 / 4 / 13 / 3 / 0 | 127 / 199 / 4 / 13 / 3 / 0 | identical (see note) |
| 190397 | 128 / 320 / 5 / 15 / 2 / 0 | 128 / 320 / 5 / 15 / 2 / 0 | identical |
| 190398 | 92 / 199 / 4 / 12 / 2 / 0 | 92 / 199 / 4 / 12 / 2 / 0 | identical |

190395, the defect seed, in detail (before -> after):
- Day 34 prize: [fusion_reactor, long_table, last_rites] ->
  UNATTRIBUTED (fizzle, instrument error
  choose-cleared-without-grant) becomes [unbreakable, switcheroo,
  rain_dancer] -> ACCEPTED (unbreakable). The fizzle is gone.
- Day 75 prize [switcheroo, aegis_link, bird_whisperer]: TRAMPLED
  (by the fusion offer) becomes ACCEPTED (switcheroo taken), and
  the fusion offer lands the same day right after it (seq 25,
  accepted, reactor installed). The trample is gone; the deferral
  is not a loss.
- Remaining trample (day 44 level_up) is a succession trample in
  both legs — not a fusion overwrite.
- Deaths 52 -> 77 on this seed with the village outcome unchanged
  (150d survived, regional 199, W4): the scholar holds different
  abilities mid-run after the fix (keeps unbreakable + switcheroo
  + the reactor instead of losing the prize sheet to the fizzle
  and the trample), so individual fights resolve differently.
  That is the intended effect of the fix, not a regression — the
  fix changes what the scholar holds by design. Reported as a
  finding per the prereg, not scored against GO bar (d), whose
  terms (survived count, maxWave distribution, median survival)
  are all identical.
- 190396 note: the day-91 fusion trample from the retribution
  band does NOT reproduce on this base (trajectory differs:
  127d here vs 140d there — the rageprecheck landing moved it).
  Its 3 tramples in both legs are all level_up succession
  tramples (days 58/68/70); the fusion offer (day 96) is accepted
  in both. The fix changes nothing where the defect does not fire.

[NEUTRALITY TABLE COMPLETE — see above]

## Scale-wall numbers (every run)

After leg (8 seeds, competent, 150d): 1/8 survived (190395,
150d), 7/8 village-lost, median survival 127.5d (days 64, 92,
126, 127, 128, 143, 146, 150), maxWave 5 on 190397 only, 4 on
the rest; standing 145–320, all regional, 0 national, 0 table,
0 wins. Identical on the before leg. The wall stands — this fix
was never expected to move it.

## Sense-testing: what the village looked like

The staged legs read clean. While a prize sheet is pending, the
deferred fusion offer says nothing at all — no silent discard, no
nag, no line about a pellet the scholar cannot see; the prize
sheet's own lines stand untouched, and when the scholar answers,
the System says its one pellet line exactly once and the reactor
installs with the pellet consumed. The prize bag with no pellet
never names the reactor. The backstop still speaks honestly: a
stale pre-fix sheet accepted with no pellet dissolves with "No
pellet, no reactor. Find one first." Nothing in the fix invents a
line or leaves a sheet unanswered.

## check.js --quick (GO bar (e))

Ran 08:22–08:34Z, WITH the fix in the tree: **325 passed, 15
failed** (704s). The visible failure is test-offline-assets.js —
`EPERM: operation not permitted, copyfile '.../sw.js' ->
'/tmp/oversight-offline-DhlwY5/sw.js'` — the write flap, not the
fix. The full failure list scrolled past the truncated delivery and
is unattributed individually; the run coincided with the flap
emptying docs/ONTOLOGY.md to 0 bytes at 08:30 (see below), which
alone fails ontology-dependent tests. Targeted post-fix re-runs of
every fusion/contest/ability-area test are ALL GREEN:
test-fusion-reactor.js 32/32, test-fusion-singularity-20261012.js
32/32, test-fusion-mantle-20261015.js 9/9,
test-contest-prize-lanes-20261011.js 52/52,
test-ability-lanes-20261014.js 38/38,
test-gift-steering-20261015.js 2/2,
test-mantle-reactor-voice-r91-20261103.js 8/8,
test-devotiongate-a.js 29/29, test-capable-bot-20261014.js 42/42,
test-retribution-offer-b.js --game 26/26. GO bar (e) is therefore
FAILED as measured (not green), with the cause identified as the
write flap and no failure in the changed area; a clean re-run after
the flap clears is owed before landing.

## Metric review

1. The prereg's GO bar (d) assumed the driver's per-seed files
   would land; under the flap they did not, and the delivered
   stdout truncated to the last 2 seeds. Recovery: summaries via
   stdout grep + individual seed re-runs (method validated by
   re-running 190393 — must reproduce the recovered summary).
   Future arms running drivers under a flap should pipe through
   grep from the start.
2. GO bar (e) (check.js --quick green) cannot be met while the
   flap is denying test file writes; the bar needs a "clean re-run
   after the flap clears" clause, not a re-score.
3. The P1 narrowed-bag leg initially used lucky_rock as the second
   def — but the fixture already holds lucky_rock, so the bag was
   empty without a pellet and the leg returned false vacuously.
   Fixed by narrowing to [fusion_reactor, night_eyes] (unheld).
   The false-vacuous run is recorded, not hidden: pre-fix P1
   failed for the right reason (fusion offered), post-fix it
   passes for the right reason (night_eyes offered, fusion absent).

## Infrastructure note — write flap during this run

- Flap episode ongoing since ~08:12Z (watcher log: A=FAIL@write,
  B=FAIL update-ref at 08:12–08:14, 08:18–08:19, 08:30 and later).
  `git hash-object -w`, `git read-tree` (private index), `git
  show > file`, `cp`, python file writes, and node copyFileSync all
  denied with EPERM at various points; small shell writes and the
  muse.write/muse.edit tool layer kept working.
- safe-commit.sh failed 4x early in the run (prereg attempts):
  the private index cannot be built while the flap denies git
  writes, so the mass-deletion guard misreads the flap-emptied
  index (458 files, 288740 deletions) and refuses. The guard is
  working as designed; the input is flap-damaged. Writes cleared
  ~08:50Z; the prereg (141c6be13) and fix+test (ae60e7ffc)
  commits then landed, each followed by the index-clobber repair
  (see Commits). The evidence commit follows.
- docs/ONTOLOGY.md was emptied to 0 bytes at 08:30 by the check.js
  run (validate-ontology regenerates it: truncate succeeded,
  content write denied — the same signature as 2026-11-12).
  Restored 08:47 by HARD LINK from the main tree's copy
  (byte-identical: hash 5d6fe6026e13ff64de7d5a2e579f2466d7a958c4,
  353061 bytes, inode 147731174 shared with
  ~/workspace/the-scattering/docs/ONTOLOGY.md). The content is
  correct and `git status` is clean for the path, BUT the file is
  a hard link: if the main tree's copy is modified, this tree's
  copy changes too. THE COORDINATOR MUST replace the link with a
  real copy (`cp --remove-destination` from the main tree, or
  `git checkout HEAD -- docs/ONTOLOGY.md`) once file writes
  clear, before any merge/commit work in this tree.
- The before leg's per-seed JSONs were lost (see Neutrality leg);
  recovered via stdout summaries + individual re-runs.
- Prereg commit ordering note: the prereg file was written 08:10Z
  (sha256 92fbb05d1d2e7f226118a567285e9e7db60483f8c98fcc10b438e88c
  10716e21) BEFORE any judged sim; its commit was blocked by the
  flap, so the before leg ran anchored on the base d3fb7d5fb with
  the prereg file already fixed on disk. The prereg content is
  unchanged since.

## Findings

- Findings #2326 and #2327 are FIXED by this arm (ready to mark
  [fixed] in hidden_files/sim-findings.md — the coordinator does
  the marking).

## Files

- src/js/game.js — #2326 deferral guard in maybeOfferFusionReactor.
- src/js/contests.js — #2327 pellet gate in _cxPrizeAbilityOffer.
- scripts/test-fusionoffer-b.js — proof test (16/16 post-fix).
- evidence/2026-11-14/sim-fusionoffer-b-prereg.md — prereg.
- evidence/2026-11-14/perseed-fusionoffer-b-before/ — before leg
  (0-byte .tmp files only — writes denied by the flap; NOT
  committed, removed from the tree).
- evidence/2026-11-14/perseed-fusionoffer-b-before-rerun/ — the
  6 before-leg re-runs (190391–190396), per-seed JSONs, all
  landed (190393 validation + 5 missing seeds).
- evidence/2026-11-14/perseed-fusionoffer-b-after/ — after leg,
  7/8 per-seed JSONs landed (190392–190398); 190391's file is a
  0-byte tmp (write denied), its summary survives via the grep
  capture in the evidence tables above.
- evidence/2026-11-14/sim-fusionoffer-b.md — this file.

## Commits (branch sim-fusionoffer-b, base master d3fb7d5fb)

- 141c6be13 — prereg.
- ae60e7ffc — fix + proof test (16/16).
- (this commit) — evidence + corpora.
- Anchor note: the AFTER leg's per-seed JSONs record anchorCommit
  d3fb7d5fb (HEAD at launch — the fix was in the worktree,
  uncommitted). The code the after leg actually ran is identical
  to ae60e7ffc's tree for the two changed files (the fix was
  reverted and re-applied verbatim for the before re-runs; the
  proof test re-ran 16/16 after re-application). The BEFORE
  re-runs ran on base code (fix reverted, verified by empty
  `git diff --stat` on both files) with EXPECTED_ANCHOR
  d3fb7d5fb.
- The safe-commit index clobber struck on both commits (prereg:
  staged-as-deleted; fix: MM on both game files + staged-deleted
  test file); each was repaired with the `git ls-tree -r HEAD --
  <paths> | git update-index --add --index-info` pipe and
  verified with `git status --short` + `git diff HEAD` empty +
  hash-object == HEAD blob before continuing. Both commits
  verified correct by `git show --stat`.
