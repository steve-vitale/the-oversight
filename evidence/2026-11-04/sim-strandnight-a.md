# sim-strandnight-a — stranded-night bedding census: NO-GO (the blank is a corpus-slice artifact)

Run: oversight-flesh-out-loop, run fleshout-20261105T0115Z, arm
sim-strandnight-a, axis food-economy. Worktree
sim-strandnight-a, base c28f447de (master has since moved one
evidence-only commit to bd32597b8 — NOT rebased, per task).
Measurement on current master; NO game-code change, NO policy
change, NO hook landed. Sibling trees never touched (including
sim-upkeepbf52-a and any Loop B tree); main tree never
touched; hidden_files never touched (coordinator owns the
backlog/tracker/claims). Nothing is pushed, bumped, or
live-verified by this worker (coordinator merges via
--ff-only); report 'merged locally, pending ship' readiness.

## Prereg (binding; committed BEFORE any judged sim)

evidence/2026-11-04/sim-strandnight-a-prereg.md (commit
f1e7585bf, with the census instruments). Instruments commit
f1e7585bf (new driver + analyzer + proof test, pure 15/15
GREEN before any judged sim). One instrument note, disclosed
in the prereg: the corpus tests use analyzeCorpora (parsed
objects, no disk) because fixture writes into a fresh /tmp dir
failed deterministically with EPERM (0-byte file, write
denied) across 6 runs in this worktree's process while
identical inline writes passed — the Nov 4 evening write flap.
analyzeDir is a thin loader over analyzeCorpora and is
exercised by the real census run below (analyzer exit 0 on
the full 40-file corpus).

Primary metric: number of DISTINCT 0-action stranded nights
in the screened band, and how many carry a bedding-down line
in the FULL night transcript (daily-phase lines + sleep-phase
lines; the dawn wake line is not a bedding-down line and is
reported separately as nightOut). GO bar: >= 3 distinct AND
0 carrying. NO-GO: >= 3 distinct AND >= 1 carrying (the blank
is an artifact; document the lines, land no hook).
INSUFFICIENT-DATA: < 3 distinct after the full band.

## Verdict: NO-GO — land no hook

| clause | bar | result |
|--------|-----|--------|
| Distinct 0-action nights | >= 3 | 7 distinct nights (3 seeds). PASS on count |
| Carrying a bedding-down line (full transcript) | 0 for GO | 7/7 carrying — ALL in sleep-phase lines. GO FAILS |
| Carrying in daily-phase lines only | (reported) | 0/7 — the prior arm's daily-slice reading REPRODUCES |
| Anomalies (clock/kcal-moving '0-action' records) | 0 expected | 0 |
| Bankfood errs | 0 | 0 on all 40 files |

§14a classification: NOT CONCEPT-DEAD. No mechanism was
staged and failed. This is a measurement correction of the
finding itself: the finding's "day record" was the bankfood
corpus's daily-phase slice, which excludes sleep-phase lines
by construction. In the full player-visible night transcript,
every stranded 0-action night beds down out loud. A hook
would duplicate a line the player already reads ("You settle
into the cold ground. Sleep takes you.") — so none is landed.
Convergence state: killed-at-pilot (the hook, not the census
question — the question is answered).

The verdict does NOT hinge on the broadest pattern: every one
of the 7 nights carries BOTH settle lines ("Sleeping rough
means the cold ground" AND "You settle into the cold ground.
Sleep takes you."). Dropping the "camp wild" alternative from
BEDDING_RE would change nothing — 7/7 still carry. The
"camp wild tonight" line appears on 6/7 nights (absent only
on 17023/36); the dawn night-out note appears on only 4/7
nights (see §Out-of-scope findings).

## 1. THE SCREEN (40 seeds, blocks 1–5; no early stop)

Screening leg: guard-variant only (BANKFOOD=1, WOODWARM=0),
60d, death-aware. Blocks ran in seed order; per the prereg
there was NO early stop (the GO bar needs a zero-carrying
result, and stopping early on count alone could hide a
carrying night in a later block). Screen logs:
sim-strandnight-a-screen-block{1,2,3,3b,4,5}.log. All
bankfood errs 0 on all 40 files. Corpus:
evidence/2026-11-04/sim-strandnight-a-corpus-guard-variant
(40 files, ~36 MB).

| block | seeds | zero-action nights (cumulative) |
|-------|-------|----------------------------------|
| 1 | 17001–17008 | 0 (0) |
| 2 | 17009–17016 | 1 (1: 17010/24) |
| 3 (+3b) | 17017–17024 | 6 (7: 17021/51, /52, /53; 17023/34, /35, /36) |
| 4 | 17025–17032 | 0 (7) |
| 5 | 17033–17040 | 0 (7) |

Per-seed screen table (guard-variant leg; bfEv = bankfood
evening records; flips = mode 'flip' records; zero = 0-action
no-gather-target flips):

| seed | days / end | bfEv | flips | zero |
|------|-----------|------|-------|------|
| 17001 | 59 village-lost | 0 | 0 | — |
| 17002 | 60 survived | 0 | 0 | — |
| 17003 | 60 survived | 0 | 0 | — |
| 17004 | 60 survived | 0 | 0 | — |
| 17005 | 60 survived | 0 | 0 | — |
| 17006 | 60 survived | 0 | 0 | — |
| 17007 | 60 survived | 3 | 3 | — (all acted) |
| 17008 | 60 survived | 0 | 0 | — |
| 17009 | 60 survived | 0 | 0 | — |
| 17010 | 57 village-lost | 3 | 2 | 24 |
| 17011 | 60 survived | 0 | 0 | — |
| 17012 | 34 village-lost | 0 | 0 | — |
| 17013 | 60 survived | 0 | 0 | — |
| 17014 | 60 survived | 0 | 0 | — |
| 17015 | 51 village-lost | 0 | 0 | — |
| 17016 | 60 survived | 4 | 3 | — (all acted) |
| 17017 | 60 survived | 0 | 0 | — |
| 17018 | 60 survived | 0 | 0 | — |
| 17019 | 60 survived | 0 | 0 | — |
| 17020 | 60 survived | 2 | 2 | — (all acted) |
| 17021 | 60 survived | 3 | 3 | 51, 52, 53 |
| 17022 | 60 survived | 0 | 0 | — |
| 17023 | 60 survived | 4 | 3 | 34, 35, 36 |
| 17024 | 60 survived | 2 | 1 | — (acted) |
| 17025 | 60 survived | 3 | 2 | — (all acted) |
| 17026 | 60 survived | 0 | 0 | — |
| 17027 | 60 survived | 0 | 0 | — |
| 17028 | 60 survived | 0 | 0 | — |
| 17029 | 60 survived | 2 | 2 | — (all acted) |
| 17030 | 60 survived | 0 | 0 | — |
| 17031 | 60 survived | 0 | 0 | — |
| 17032 | 60 survived | 0 | 0 | — |
| 17033 | 60 survived | 0 | 0 | — |
| 17034 | 60 survived | 0 | 0 | — |
| 17035 | 60 survived | 0 | 0 | — |
| 17036 | 60 survived | 0 | 0 | — |
| 17037 | 60 survived | 0 | 0 | — |
| 17038 | 30 village-lost | 0 | 0 | — |
| 17039 | 60 survived | 0 | 0 | — |
| 17040 | 60 survived | 0 | 0 | — |

Totals: 26 bankfood evenings, 21 flips, 7 zero-action
nights. Ten seeds strand; 30 never record a stranded
evening. Zero-action nights are rare (7/40 seeds, 7/21
flips) and cluster: three consecutive nights on each of two
scholars (17021, 17023) plus one creek night (17010/24).

## 2. THE CENSUS (full transcript, per distinct night)

Census report: evidence/2026-11-04/
sim-strandnight-a-census.json (analyzer output over the full
40-file corpus; analyzer exit 0).

| distinct night | tile | edible before | sleep fired | bedding (sleep) | bedding (daily) | night-out note |
|---|---|---|---|---|---|---|
| 17010/24 | creek (8,0) | 0 | yes | 3 lines | 0 | no |
| 17021/51 | thicket (8,8) | 270 | yes | 3 lines | 0 | yes |
| 17021/52 | thicket (8,8) | 270 | yes | 3 lines | 0 | no |
| 17021/53 | thicket (8,5) | 0 | yes | 3 lines | 0 | yes |
| 17023/34 | trail_edge (0,8) | 0 | yes | 3 lines | 0 | yes |
| 17023/35 | trail_edge (0,8) | 0 | yes | 3 lines | 0 | yes |
| 17023/36 | trail_edge (8,8) | 0 | yes | 2 lines | 0 | no |

Every night's sleep-phase bedding lines are the engine's own
sleep() lines, in order: "Sleeping rough means the cold
ground — heal ~16." then "You settle into the cold ground.
Sleep takes you." (plus "You camp wild tonight — no pantry
meal. Eat from your pack." on 6/7). No night's daily-phase
lines carry any bedding line — the daily slice ends, as the
prior arm read it, without one. The two channels disagree on
every night, and the sleep channel is the one the player
reads: in real play the transcript is continuous, and the
settle line follows the day's last line within the same night.

Robustness notes: (a) sleep fired on 7/7 nights — no
sleep-refused night was observed in this band, so the
refusal case the prereg flagged never arose; (b) edible
pack contents do not matter to the verdict — nights with 0
edible (5/7) and with 270 kcal grapes (2/7) bed down alike;
(c) tile does not matter — creek, thicket, and trail_edge
nights all carry the same generic settle lines (no
tile-named bedding line exists anywhere in the band — the
settle line never says "thicket").

## 3. SENSE TEST (law — read end to end)

17021 loop-day 51, new corpus, daily-phase lines (last 5 of
17) then sleep-phase lines (first 3 of 18):

Daily tail (the prior arm's day record, verbatim):
- "Journal: Deep shade. The floor keeps its secrets."
- "A shot in the dark — you take what's green: 4× unknown
  nuts. Into the bag, unnamed. (Not food until identified —
  sort them at camp.) You also gather deadfall: 2× branches,
  1× bark fiber. This patch is picked clean — it'll recover
  in a few days."
- "Travel 1 tile to thicket."
- "Something moves out there — Static."
- "Ezequiel speaks only 🇪🇸 Spanish. No shared words at all —
  just eyes, hands, and patience."

Sleep-phase lines that follow, verbatim:
- "Sleeping rough means the cold ground — heal ~16."
- "You settle into the cold ground. Sleep takes you."
- "The static resolves into something almost like a voice.
  Almost like yours."

Judgment: the daily tail alone DOES read as a day that just
ends — a person foraging, meeting Static, failing to share
words with Ezequiel, and then nothing. But the night does not
end there for the player: the very next lines are a person
being told, honestly, that sleeping rough means cold ground,
and settling into it. "You settle into the cold ground.
Sleep takes you." reads as a person bedding down — plain
words, no system-note phrasing, and it names the cost (cold
ground, heal ~16) rather than dressing it up. The gap the
prior arm filed is real as a corpus-slice observation and
false as a player-experience claim. What the player is NOT
told on these nights is anything tile-specific ("in the
thicket") or anything about the carried food — but that is
a different, narrower blank than "the night itself has no
line," and this arm's bar does not cover it (see §Out-of-scope
findings). No hook is landed on a narrower blank this arm did
not pre-register.

## 4. VILLAGE ASSESSMENT (plain words)

At 60 days the band looks like the substrate arm's band with
a second strand story added: most villages never leave haven
at all (30 of 40 seeds never record a stranded evening), and
the ones that strand do so as competent, equipped scholars
working patches far from home — 17021 spends three nights in
a thicket foraging grapes and unknown shoots while Static
circles, 17023 spends three nights on a trail edge, 17010
spends one night at a creek. The stranded scholar is not
abandoned by the narration at night: every one of these
nights, the game says plainly that they are sleeping rough,
what it costs, and that sleep takes them. The villages that
die early (17001 day 59, 17012 day 34, 17015 day 51, 17038 day
30) die without stranding at all — stranding here is a
survivor's pattern, not a death pattern. Nothing in this run
suggests a stranded scholar goes to bed in silence.

## 5. METRIC REVIEW (revisions apply to the NEXT run, never mid-run)

- The dual-channel census worked and should be the default
  for any future "day record" claim: a corpus that captures
  only daily-phase lines MUST NOT be quoted as the player's
  day record without the sleep-phase join. The prior arm's
  finding is corrected, not deleted: its daily-slice
  observation (0/7 daily) reproduces exactly, and its
  player-facing inference ("the night itself has no line")
  does not survive the join. Future evidence files should
  name the channel ("daily-phase slice" vs "full night
  transcript") every time they quote a day record.
- BEDDING_RE held: the verdict is identical with or without
  the "camp wild" alternative (settle lines alone carry 7/7).
  Keep the pattern as written; do not narrow it to
  tile-named lines — a tile-named requirement would be a
  contrived bar that the engine's generic settle line was
  never designed to meet, and it would manufacture a GO out
  of a line the player already reads.
- The full-band-no-early-stop rule held: blocks 4–5 added
  zero nights, but the count alone (7 at block 3) already
  decided NO-GO on carrying, so the extra blocks bought
  confidence in the share (7/7, not 3/3) rather than a
  different verdict. For a future census whose bar is a
  zero-carrying result, early stopping on count would be
  wrong in exactly the way the prereg said; keep the rule.
- The 45-minute pending-flush loop in the bankfood driver
  family is load-bearing under the EPERM flap (block 2 and
  block 5 both flushed only after long waits; see §6). Do
  not shorten it without a flap-free write path.
- One metric gap for the next run: nightOut (the dawn
  "spent the night out here" note) fired on only 4/7 nights
  with no tile or scholar pattern visible in this census
  (same scholar, same thicket area: 51 yes, 52 no, 53 yes).
  If a future arm wants to claim anything about dawn
  orientation lines, it needs its own prereg for that note —
  this arm reports it, nothing more.

## 6. INFRASTRUCTURE INCIDENTS (disclosed, no data affected)

- Git-write EPERM block (~25 min, 01:52–02:00 UTC): every
  git object/index write failed ("Operation not permitted")
  while shell and node writes succeeded — including
  safe-commit.sh's /tmp private index and `git hash-object
  -w`. Retried, not worked around; the block lifted and the
  prereg commit landed as f1e7585bf. After that commit the
  documented safe-commit index clobber appeared (committed
  files shown staged-as-deleted in the main index); repaired
  per the AGENTS.md recipe (update-index --add --cacheinfo
  from HEAD blobs for all 4 files) and verified: `git status
  --short` empty, `git diff HEAD` empty, worktree hashes equal
  HEAD blobs. The commit itself was always correct.
- Block 2 and block 5 flush loops: block 2's seeds 17010–
  17016 and block 5's seeds 17035–17040 first wrote 0-byte
  files (flap), then flushed cleanly after long waits
  (block 2 ~30 min, block 5 ~15 min); all 40 corpus files
  verified non-zero and JSON-parseable before judging, and
  the analyzer ran exit 0 over the full corpus. No data was
  staged, no file was hand-edited back into shape.
- Block 3 wrapper interruption: the background command
  running blocks 2–3 vanished after seed 17023 with no crash
  line and no staged files, leaving seed 17024 unwritten.
  Recovered by a single-seed re-run of 17024 alone (same env,
  42 s, written, errs 0) — completing the pre-registered
  band, not selecting on outcome (17024's flip was acted,
  contributing no night either way).

## 7. REACHABILITY / WALL NUMBERS (observed, NOT attributed)

A 60-day strand census does not read national / table /
wins — stated plainly, not fabricated. What the corpus reads
(guard-variant, 40 seeds): median survival 60 days (census
boundary); min 30; maxWaveUnlocked 3 on 28 seeds, 4 on 12
seeds. No wins, no national, no table are read by this
corpus — the scale wall is untouched by this arm and
unmeasured here.

## Proof

- scripts/test-strandnight-a.js: pure 15/15 GREEN (re-run
  after the census; same result as before any judged sim).
- scripts/analyze-strandnight-a.js over the full corpus:
  exit 0; census JSON:
  evidence/2026-11-04/sim-strandnight-a-census.json (7
  distinct, 7 carrying, 0 anomalies, 0 daily-only).
- Driver: scripts/strandnight-trace-a.js (committed
  f1e7585bf, unchanged since prereg — the OUTDIR default
  still names the old bankfood path, so all screen commands
  passed OUTDIR explicitly; no code change was made after
  the prereg commit).
- Determinism note: no game-code change, no policy change,
  so no matched-seed bit-identity proof is owed; the
  substrate arm's 17021/51–53 nights reproduce as the same
  0-action flips in this run's new corpus (same loop-days,
  same tiles, same 270 kcal grapes on 51/52), and the new
  corpus ADDS their sleep-phase lines.
- Pinned base: worktree HEAD at prereg writing time
  c28f447de; prereg + instruments f1e7585bf; evidence +
  census + logs + corpus in the final commit below.
- check.js --quick NOT run: this arm changed zero src/js
  files and added no green-list test (test-strandnight-a.js
  is a pure proof, not on scripts/green-list.txt), so the
  green list cannot be affected by this arm; the arm's own
  proof (15/15) plus the analyzer's exit-0 run over the real
  corpus stand as its verification. Stated, not waived: if
  the coordinator wants a quick run, it is a no-op for this
  arm's files.

## Out-of-scope findings (for the coordinator to append to the
findings backlog — NOT chased here, NOT edited into hidden_files
by this worker)

- [open] 2026-11-04 — bankfood-corpus day records exclude
  sleep-phase lines by construction — any "day record" claim
  read from a bankfood corpus (daily-phase lines only) omits
  Game.sleep()'s settle and wake lines; future corpus drivers
  should attribute sleep-phase lines to the night they close,
  or analyzers should join them, before any narration blank
  is filed (sim-strandnight-a; corrects the
  sim-bankretain-substrate-a stranded-night finding's
  player-facing inference while reproducing its daily-slice
  observation).
- [open] 2026-11-04 — dawn night-out note fires on only 4/7
  stranded nights with no visible pattern — 17021/51 yes,
  /52 no, /53 yes (same scholar, same thicket area); 17010/24
  no, 17023/36 no, 17023/34–35 yes. What gates the "You spent
  the night out here" line at dawn needs its own prereg
  before anyone claims dawn orientation is reliable
  (sim-strandnight-a). Question only, not a verdict.
- [open] 2026-11-04 — stranded bedding lines are never
  tile-named — every stranded night's settle line reads "the
  cold ground" regardless of creek, thicket, or trail_edge
  tile; no night says where it bedded down. Narrower than
  the filed blank (which this arm refuted) and NOT
  pre-registered here, so it is filed as a question for a
  future arm, not a fix (sim-strandnight-a).
