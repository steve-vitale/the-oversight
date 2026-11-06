# sim-pyrrhic-b — pyrrhic-kill instrumentation: fight-level kill counts stop undercounting the log — GO

- Run: `fleshout-loop-b-20261106T1630Z`, axis winnability chain
- Arm: `sim-pyrrhic-b`, branch `sim-pyrrhic-b`, worktree `~/workspace/worktrees/sim-pyrrhic-b`
- Band: NONE consumed — deliberate reuse of the committed fightinterior corpus `evidence/2026-11-06/perseed-fightinterior-b/` (16 files, 51001–51008). No judged re-run.
- Prereg: `evidence/2026-11-06/sim-pyrrhic-b-prereg.md` (committed `540fd066e` before any judged work)
- Instruments: `scripts/pyrrhic-reclassify-20261106.js` (re-classification of the committed corpus),
  `scripts/fightinterior-instrument-20261106.js` (closeTrace + shared pure `classifyEnding`, changed),
  `scripts/fightinterior-analyze-20261106.js` (ENDINGS + KILL_ENDINGS + fightLevelKills, changed),
  proof `scripts/test-pyrrhic-20261106.js` (**52/52 PASS**)
- Verdict: **GO — all five preregged thresholds hold (G1–G5).**
- Findings fixed: #1811, #1822 (see sim-findings.md).

## The blank this arm fills

The fightinterior recorder undercounted wave-4 kills at fight level:
its only kill hook was the `recordWaveKill` wrapper (`killsLive`), and
its only kill ending came from a `'won'` tbEnd. Two kills on band
51001–51008 escaped both: one through the pyrrhic attribution path
(`recordPyrrhicKill` writes the log directly, bypassing
`recordWaveKill`), one through a fight that never closed through
tbEnd at all. Fight-level counts read baseline 2 vs log 3, staged 5
vs 6 — and every downstream kill count built on fight endings
inherited the gap. This arm makes the recorder read the authoritative
log at close time, so the two shapes are visible in their own ending
classes.

## Ground-truth correction (what the brief got wrong, verified first)

The brief said "2 of 9 wave-4 kills are pyrrhic". The corpus census
(all 16 files: log 9, live 8, ending-kills 7) says the two
undercounted kills are DIFFERENT shapes:

- **51005 staged, day 65, Reunion, by greta_hansen, via 'companion':
  TRUE pyrrhic.** In waveKillLog, NOT in killsLive. The
  `recordPyrrhicKill` path (`src/js/game.js` ~34032, called from
  tbEnd's `'lost'` branch ~45859) wrote the log directly. Its trace
  (seq 6) closed through tbEnd as `'lost'` → ending 'scholar-death'.
  Invisible at fight level AND to killsLive.
- **51002 baseline, day 80, Strike, by grace_obi, via 'player':
  KILL-LOGGED-BUT-NEVER-CLOSED, not pyrrhic-path.** It IS in
  killsLive — `recordWaveKill` ran. But its trace (seq 2, 21 rounds,
  killing blow round 21, beast HP −14) never closed through tbEnd:
  outcome 'unfinished', mHpLeft 0. The round-21 killing strike has
  a hit record but NO verb record (the verb wrapper's post-call push
  found the trace already gone — the same loss the congtrace arm
  noted), and the trace was closed as 'unfinished' when the next
  fight (Eulogy, same day) opened. A fight CAN dissolve without
  tbEnd (`game.js` ~36590: death mid-crossing dissolves with result
  'dissolved', `tbfight = null`, no tbEnd) — but the exact
  interleaving on this fight is NOT proven from the corpus and is
  NOT claimed here. The fix covers the observable shape (log entry
  present + beast at 0 HP + trace never closed), whatever dissolved
  it.

Route (b) — read waveKillLog at closeTrace in the recorder — was
chosen because it covers BOTH shapes with one mechanism (route (a),
wrapping the pyrrhic path in game.js, cannot fix grace's kill: that
kill is already in killsLive; its miss is a close-path problem, not
a hook problem), with zero game-code change and therefore zero
neutrality risk. The instrument family's "scripts only, zero src/js"
convention holds, and the 2026-10-17 pyrrhic steve-call boundary
(no wave-unlock deeds, no loot/carcass for pyrrhic kills) is
untouched: the fix only READS the log the engine already wrote.

## Before / after (same 16 committed files, re-classified)

| Metric | Before (recorded) | After (re-classified) | Log |
|---|---|---|---|
| Baseline fight-level kills | 2 | **3** | 3 |
| Staged fight-level kills | 5 | **6** | 6 |
| Total fight-level kills | 7 | **9** | 9 |
| Unclassified traces | 1 (the 'routed' trace) | **0** | — |
| Ambiguous matches | — | **0** | — |

Per-leg endings after re-classification:

| Ending | Baseline (25 traces) | Staged (34 traces) |
|---|---|---|
| kill | 2 | 5 |
| pyrrhic-kill | 0 | 1 (greta d65 Reunion) |
| kill-unclosed | 1 (grace d80 Strike) | 0 |
| rout | 0 | 1 (51006 d105 Strike, 'routed' → 'rout') |
| scholar-death | 21 | 27 |
| scholar-flee | 1 | 0 |
| unfinished | 0 | 0 |

The corpus's single 'unfinished' trace resolves to
'kill-unclosed'; there are no remaining 'unfinished' traces on this
band, so the 'village died mid-fight' half of the split has ZERO
live instances here — it is implemented and fixture-proven, and is
reported as such (see "What this arm does NOT claim"). The other
day-65 Reunion trace (seq 5, same day+mid, killer not in its
fighters) correctly stays 'scholar-death' — the killer-in-fighters
guard works: 0 candidates, no false pyrrhic.

Note the analyzer re-run over the OLD corpus still reads the OLD
recorded endings (fightLevelKills 2/5, unclassified 1): the recorded
traces carry old endings, and the analyzer counts what is recorded.
The GO numbers come from `pyrrhic-reclassify-20261106.js`, which
re-derives endings from the recorded fields with the new classifier.
The analyzer's `fightLevelKills` is the live-forward counter — it
will read true counts on the NEXT corpus recorded with the new
instrument.

## Primary metric (binding — GO thresholds, all hold)

- G1 fight-level kill counts match the log per leg: baseline 3 = 3,
  staged 6 = 6, total 9 = 9. **PASSED.**
- G2 the two named kills are visible in their own endings: 51005
  staged day-65 Reunion by greta_hansen → 'pyrrhic-kill'; 51002
  baseline day-80 Strike by grace_obi → 'kill-unclosed'. Both
  unambiguous (exactly 1 match candidate each). **PASSED.**
- G3 'unfinished' is split: the corpus's single 'unfinished'
  trace resolves to 'kill-unclosed'; every remaining 'unfinished'
  trace (zero on this band) would carry an unfinishedKind in
  {village-died, dissolved, horizon}; the village-died / dissolved
  / horizon paths are fixture-proven. **PASSED** (live half vacuous
  on this band, stated honestly).
- G4 'routed' → 'rout' fixture passes, and the 'won' → 'kill' /
  'lost' → 'scholar-death' regressions pass (no existing ending
  changes class — the full re-classification moves exactly 2
  traces: greta's and grace's — plus the 'routed' trace, which the
  old corpus recorded as the raw 'routed' string and which now
  reads 'rout'). **PASSED.**
- G5 proof green (`scripts/test-pyrrhic-20261106.js` 52/52),
  including live legs to /tmp with 0 instrument errors,
  determinism byte-identical, neutrality off-vs-on identical
  (days/end/kills). **PASSED.**

No metric was swapped, re-cut, or re-thresholded. The corpus was
NOT re-run.

## The fix (scripts only, zero src/js)

- `scripts/fightinterior-instrument-20261106.js` — `closeTrace`
  now classifies through one shared pure function,
  `classifyEnding(trace, logEntries, liveEntries, closeKind,
  villageLost)` (exported, so the corpus re-classification runs
  the SAME logic as the live close path):
  - `'lost'` + a during-fight log entry (wave ≥ 4, same day+mid,
    killer in this fight's fighters) NOT in killsLive →
    'pyrrhic-kill', else 'scholar-death'. The killsLive exclusion
    is what keeps a same-day grind kill from false-matching a
    later lost fight.
  - `'unfinished'` + a during-fight log entry + beast at 0 HP
    (`mHpLeft === 0`) → 'kill-unclosed'. The mHpLeft guard stops
    a same-day kill from a LATER fight matching this trace at a
    stale/finalize close.
  - `'unfinished'` + no match → ending stays 'unfinished' with
    `unfinishedKind` by close path: 'village-died' (finalize,
    village lost), 'dissolved' (stale close at the next startCombat
    — the fight dissolved without tbEnd), 'horizon' (finalize,
    village alive). The close path is passed explicitly into
    closeTrace ('tbEnd' / 'stale' / 'finalize'); nothing is
    guessed from state.
  - `'won'` is unchanged (killsLive match → 'kill', else 'rout');
    `'routed'` → `'rout'` is unchanged (landed 304ced6cf); the
    fixture for it is ADDED here (the landing carried no test).
  - At trace open, the waveKillLog length is snapshotted
    (`_logLenAtOpen`); only entries appended during the fight are
    candidates at close. The snapshot and the fight object are
    both deleted before the trace is pushed — no internal fields
    leak into the serialized corpus (proven by a live-leg check).
  - The log read is a READ only: no `recordWaveKill` call, no
    deed, no loot, no game-state write, no RNG draw.
- `scripts/fightinterior-analyze-20261106.js` — ENDINGS gains
  'pyrrhic-kill' and 'kill-unclosed'; `KILL_ENDINGS` =
  {kill, pyrrhic-kill, kill-unclosed} is used by `sizeNextLever`
  (a pyrrhic kill IS a dead beast — it counts toward the ceiling,
  never as a lost fight to flip) and by the new `fightLevelKills`
  counter; an `unfinishedKinds` tally is reported. The one-round
  anomaly check now fires on any kill ending.
- `scripts/pyrrhic-reclassify-20261106.js` — read-only
  re-classification of a per-seed corpus directory (per-leg
  fight-level kills vs the log, named-kill endings, unfinished
  split, GO verdict object). Offline limits stated in its header
  and the prereg: no close path and no log snapshot in the pre-fix
  corpus, so unmatched 'unfinished' traces report unfinishedKind
  'unknown' instead of a guessed split; the live snapshot guard
  is replaced offline by the mHpLeft guard + the killsLive
  exclusion. Neither limit bites on this band.

## Wall numbers

Restated from sim-fightinterior-b.md (the committed corpus's own —
this arm ran no judged sims, so there are no new wall numbers):
wins 0/8 both legs, national 0/8 both, table 0/8 both, wave-4
unlocks 5/8 both, wave-4 faced 5/8 both, wave-5 unlocks 0/8,
wave-5 faced 0/8, readiness-5-ready days 0 baseline / 1 staged,
median survival 85.5d baseline / 105d staged. The fix changes no
village's fate — the two kills already happened; only the recorder
sees them now.

Live legs (unjudged, to /tmp, throwaway seed 55002, 90d baseline):
the new instrument installs cleanly, records wave-4 traces with 0
instrument errors, determinism byte-identical on repeat, neutrality
off-vs-on identical (days/end/kill-log length). No wall numbers are
claimed from a throwaway seed.

## Village assessment (plain words)

Two villages already knew something the recorder didn't. On one
seed, a fighter took a Reunion down with her and died in the same
fight — the village buried her, the beast stayed dead, and the
record said only that she died. On another, a fighter ground a
Strike down over twenty-one rounds, landed the killing blow, and
the record left the fight open forever, as if it had never ended.
Both kills were in the village's own book the whole time. The
recorder just wasn't reading that page. Now it does — and the
count of dead wave-4 beasts at fight level is nine, the same nine
the book holds.

## Sense-test read

None — no transcript is re-read; the fix touches no narration.
(The 51005 day-66 burial beat and the 51002 day-80 kill day were
already sense-read in sim-fightinterior-b.md.)

## Metric review

- **'pyrrhic-kill' stays a distinct ending** (this arm's call,
  recorded for the next run to revisit): a lost fight that killed
  is not a won fight, and the distinct ending keeps the analyzer's
  endings table honest. The cost is that every future kill-count
  reader must use KILL_ENDINGS, not `ending === 'kill'` — the
  analyzer now exports it, and the old `ending === 'kill'` read
  undercounts by exactly the pyrrhic + unclosed kills. If a future
  arm folds them into 'kill' with a pyrrhic flag, the proof's
  sizing/analyzer fixtures must move with it.
- **The during-fight log snapshot is the right guard live, but the
  offline path cannot use it** — the re-classification leans on
  the mHpLeft guard and the killsLive exclusion instead. If the
  two ever disagree on a future band, the live snapshot wins: it
  is timing-precise, the offline guards are inferential.
- **'unfinished-dissolved' stays a sub-field, not an ending.**
  The dissolve-without-tbEnd path is a real engine shape
  (game.js ~36590), and a future band with many dissolved fights
  may want it counted as its own ending rather than noted as an
  unfinishedKind. The split as built keeps D1 complete (every
  'unfinished' trace is classified) while the count question
  stays open.
- **The 51002 interleaving is still unexplained at the engine
  level.** The corpus proves the shape (kill logged, trace never
  closed, verb row lost) but not the throw/interleave site inside
  tbEnd or its caller. A live reproduction pinning the site is
  owed if any future arm needs to trust unclosed-fight traces —
  but it was NOT this arm's GO, and the fix covers the shape, not
  the cause. The diagnostic is recorded here, in this file's
  metric review, for the next arm to pick up.
- **No metric was swapped.** The wavesFaced-style secondary read
  does not apply here; the analyzer re-run on the old corpus
  (fightLevelKills 2/5) is the expected old-endings read, not a
  competing number — the GO is the re-classification, stated in
  the prereg.

## Balanced panel (§15) and telemetry

- `scripts/balance-panel.js`: no Game-root change exists (zero
  src/js) and no policy changes — there is nothing to compare
  before/after. No compare `.md` is fabricated. The matched-corpus
  re-classification (identical 16 files, before/after classifier)
  IS the comparison; its output is attached below.
- `scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json --current 'evidence/2026-11-06/perseed-fightinterior-b/*.json' --metrics national,table,wins,exiled`: attempted — REFUSED, same as every prior killer-chain arm ("refusing recorder-corpus input: all 16 --current rows carry top-level anchorCommit, so they are sweep recorder rows, not runs"). Recorded as the result. The WINSEAT baseline regime note was checked first: no pre-seat comparison is claimed anywhere here.

## Re-classification output (attached)

- `/tmp/pyrrhic-reclassify.json` (working copy; the tables above
  are the record): byLeg baseline {logW4 3, liveW4 3,
  fightKillsBefore 2, fightKillsAfter 3, endingsAfter
  {scholar-death 21, kill-unclosed 1, kill 2, scholar-flee 1}},
  staged {logW4 6, liveW4 5, fightKillsBefore 5, fightKillsAfter 6,
  endingsAfter {scholar-death 27, kill 5, pyrrhic-kill 1, rout 1}},
  namedKills [51002 baseline d80 strike → kill-unclosed (1
  candidate), 51005 staged d65 reunion greta → pyrrhic-kill (1
  candidate), 51005 staged d65 reunion other-trace →
  scholar-death (0 candidates)], unclassified 0, ambiguousMatches
  0, go ALL true.
- `/tmp/pyrrhic-analyze-new.json` (working copy): the new
  analyzer over the old corpus — fightLevelKills 2/5 (old recorded
  endings, expected), staged unclassified 1 (the recorded raw
  'routed' string, re-derived to 'rout' by the reclassifier).

## What this arm does NOT claim

- Not a lever: no policy was built, no pilot was spent, no
  gate/price/deed change is proposed. No village lives longer or
  kills more because of this fix — the kills already happened;
  only the recorder sees them now.
- Not a settlement of the pyrrhic deed question: the steve-call
  on wave-unlock deeds for pyrrhic kills (#466) is still open, and
  this fix deliberately does not touch it.
- Not an explanation of the 51002 interleaving: the engine-level
  cause of "kill logged, trace never closed" is an open
  diagnostic, recorded in this file's metric review for the next
  arm — not this arm's GO.
- Not a re-judgment of the fightinterior DIAG-NO-GO: the verdict
  stands as measured (D1 missed by the 'routed' string, fixed
  separately in 304ced6cf). This arm fixes the measurement blank
  the NO-GO's metric review named.
- Not a live proof of the 'village died mid-fight' split: zero
  such traces exist on this band; the path is fixture-proven
  only, and is reported as such.
- Not a claim that the next corpus is covered: the analyzer's
  fightLevelKills will read true counts only on corpora recorded
  with the new instrument; old corpora need the reclassifier.

## Proof and commits

- Proof `scripts/test-pyrrhic-20261106.js`: **52/52 PASS** —
  classifier fixtures for every new ending and guard (pyrrhic
  basic + grind false-positive exclusion + wrong-killer/day/wave,
  unclosed basic + beast-alive guard, all three unfinishedKind
  paths + unknown, routed→rout, won/fled regressions, unknown
  outcome passthrough, normKill both shapes), analyzer fixtures
  (ENDINGS/KILL_ENDINGS, sizing counts new kill endings,
  fightLevelKills + unfinishedKinds on a synthetic corpus), the
  corpus re-classification asserted against G1–G3 (before 7,
  after 9, named kills, 0 unclassified, 0 ambiguous), and live
  legs to /tmp (55002 baseline 90d: install, wave-4 traces,
  all classified, 0 errors, no internal fields leaked, live
  unfinished kinds real, determinism byte-identical, neutrality
  off-vs-on identical).
- Regression: the fightinterior proof
  `scripts/test-fightinterior-20261106.js` re-run green on the
  final tree: **33/33 PASS** (fixtures + live legs to /tmp:
  baseline + staged smoke, determinism, neutrality).
- `node scripts/check.js --quick`: 283 passed, 7 failed — twice
  (first run 738s, re-run 588s, identical 283/7). The 7 are all
  pre-existing base failures, none touching this arm's files
  (blast radius proven: only the fightinterior driver, the two
  proof tests, and the reclassifier require the changed modules,
  and none of those is a check job): godpath
  test-measurement-proof-update + test-measurement-workflow
  (stale retained neutrality proof — "Proof source inputs are not
  current"), test-mobile-combat-cadence ("Continue does not wrap
  the announced round a second time"), test-occupation-panels
  ("real CLI workflow completed"), test-phone-frame-proof (phone
  receipt stale), test-capable-bot-20261014 ("real capable player
  combat earns the food deed at first use"), test-establishment-
  r20-fixes-20261020 (racks-full voice gate, "next day voices once
  more: expected 2, got 1"). Not fixed here — out of scope for
  this instrument arm; the failures are identical with and
  without this change's files in the tree (the changed modules
  are not required by any check job).
- Prereg committed `540fd066e` before any judged work. The
  safe-commit index clobber hit on the prereg commit (file shown
  staged-as-deleted after a correct commit); repaired with
  HEAD-blob cacheinfo, verified `git status` empty + `git diff
  HEAD` empty + hash-object matches.
- Judged corpus: unchanged — no file under
  `evidence/2026-11-06/perseed-fightinterior-b/` was modified.
  The reclassifier is read-only.

## Convergence

**scale-onramp / winnability chain: converging, NOT converged.**
Fight-level kill counts now match the log on the measured band
(9 = 9), and the recorder's taxonomy holds every tbEnd result
shape the engine emits on this corpus plus the two kill shapes
it used to hide. The funnel numbers themselves do not move — the
kills were already in the book — but the next lever's sizing
(the party-damage ceiling, 35% staged) now counts the kills it
used to miss, and no future arm will re-litigate whether a
pyrrhic kill counts. The open engine diagnostic (why a logged
kill's fight never closed) is the remaining blank from this arm.
