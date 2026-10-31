# sim-twoblow-a — the two-blow finish window (PILOT GO, CONFIRM GO)

Run: Loop A worker, axis scale-onramp (converging, NOT converged).
Arm type: BUILD — one narrow game-code change in src/js/fieldFights.js
ONLY (the two-blow finish window + its survivability companion),
plus policy-side instrument copies. Pre-registration:
evidence/2026-10-31/sim-twoblow-a-prereg.md (committed BEFORE any
lever sims, commit 986aae4e5; the baseline pilot ran on that commit's
code, byte-identical to base pin 1d72a96c3 for fieldFights.js). This
build changes combat feel: the landing commit carries [needs-eyes].
No push, no version bump, no live verification — the coordinator
merges via --ff-only and the ship loop owns deploys.

## Question (from sim-finishgate-a)

The fieldfinish2 one-strike gate never fired on wave-3 beasts (0/71).
Finishgate measured why: of 7 fought break-line flights, only 2 were
blocked by gate 2 alone (short by 12 and by 30 HP), and 2 of the 4
positive-gap rows were covered by two proven blows. This arm builds
that strongest candidate: a "committed finish within two blows" rule.
Expected yield on the finishgate corpus: 1 conversion, not a
wave-3 kill pipeline — the pilot GO below is set at that honest
scale (≥1).

## The rule, exactly (as preregistered, as built)

Location: the IN-ROUND break check ONLY (fieldFights.js). mBreak
UNCHANGED (wave >= 2 ? 0.15 : 0.25). Tracking: twoblowLast = the
lead's LAST TWO proven strikes — vd after all multipliers, before
lead.hp subtraction, counted ONLY when vd > 0, in the lead-strike
else-branch only. Volley damage, the ambush opening strike,
shoulder-check collision damage, and ally strikes are EXCLUDED.
A 0-damage swing (mirage miss, editor cut) proves nothing and
neither enters the window nor counts as this round's strike.

The override fires at a break check iff ALL hold:
0. wave >= 3 — wave-1/2 fights are byte-identical to baseline.
   (Fieldfinish2 fired on wave 1–2, converted 61 already-winnable
   fights, and diverged trajectories into early lesser wins; this
   arm refuses that whole class by construction.)
1. members[0].hp > 0 (the lead is alive).
2. TWO-BLOW GATE: twoblowLast holds exactly two proven blows AND
   members[0].hp <= twoblowLast[0] + twoblowLast[1].
3. vHp / vHpMax >= 0.60 — UNCHANGED, NON-NEGOTIABLE (the spool
   sense-read at 17% HP and the 2026-10-25 HOLD-pilot collapse
   forbid relaxing it; fighters at 17%/29% HP are still refused).
4. rec.intent === 'engage' (a learn villager who flipped to engage
   on a good exchange counts — that flip IS a commitment).
5. vStruckThisRound — this round's lead strike landed damage.
6. !opts.noFlee — sealed arenas untouched.
When it fires: rec.committedFinish = true, rec.committedRounds
+= 1, rec.twoblowLastTwo / twoblowSum set, plus commit snapshots
rec.twoblowCommitMhp, rec.twoblowCommitVhpFrac, rec.twoblowCommitSum
(the gate inputs at the moment of firing, so a reader can verify
the gate without re-deriving it), log line "<Name> holds —
<monster> is two blows from falling, and they are still strong
enough to finish it. (Committed finish, two-blow)", and the
round loop continues — the kill, if it comes, comes from real
strikes in the following rounds, never from a table roll.

Survivability companion (retained from fieldfinish2, NOT a firing
gate change): once committed, at each subsequent round's morale
entry (after the vHp <= 0 death check, before other morale), if
vHp / vHpMax < 0.40 AND !opts.noFlee AND the lead still lives,
the villager flees ('vFlee', log line "<Name> is past holding
even a finished fight — they run while running still works.
(Committed-finish floor)"). A committed villager holds to 40%,
not to the 5% winning floor.

NOTE on the finishgate definition: finishgate's "two-strike reach"
was maxStrike + secondStrike (largest two). This rule uses the
LAST two, as the build brief specifies. The distinction does not
change the known near-miss (baseline chorus 87123 d75 struck 18,
21, 18, 16, 18 — last two 16+18 = 34 ≥ 33, max+second 21+18 = 39
≥ 33, so it converts under either definition). A spike-then-weak
fighter does NOT convert under last-two: the finish is judged on
what the fighter can do now, not on a spike they cannot repeat.

Explicitly UNCHANGED: the volley/contact break, the break line,
gate 3 (0.60), gate 4 (engage), gate 5 (struck this round),
gate 6 (noFlee), cornered-hold, hogtie skip, arena handling,
learn-withdrawal, hopeless flight, HP floor, trick exits, round
cap, volley, strike formula, monster damage. No other src/js
file changes. No policy-default flips. No gate threshold or
demand number moved anywhere else. Diff: src/js/fieldFights.js
+59 lines (commit f41c746b5), verified by inspection.

## Base pin, seeds, policy (per prereg)

- Base pin: 1d72a96c3 (Loop A 2058Z coordinator evidence commit).
  The prereg commit touches only the prereg file, so the baseline
  pilot leg's game code is byte-identical to the pin. The baseline
  CONFIRM leg ran on fieldFights.js restored byte-identically to
  the prereg commit's version (git show 986aae4e5, TWOBLOW grep
  count 0, diff vs prereg empty) while the rule commit sat in
  HEAD; the rule file was then restored from HEAD and verified
  by hash (2e10a98553c61193dc62fae1f018078483ecee6e, before and
  after, identical). The confirm JSONs' anchorCommit field
  records the worktree HEAD at run time (the rule commit) — that
  field is therefore NOT the code the baseline confirm leg ran
  on; this paragraph is the authoritative record, and the
  baseline confirm corpora are byte-consistent with pre-rule
  code (0 commits, 0 committed fights on all 12 seeds, as a
  no-rule leg must show).
- Pilot seeds (8): 87104, 87109, 87119, 87124, 87140, 87115, 87123,
  87127. Confirm seeds (12, fresh): 87103, 87107, 87120, 87121,
  87126, 87128, 87132, 87134, 87135, 87137, 87138, 87141 (the
  first 11 are fieldfinish2's confirm set; 87141 is the next
  seed after the pilot/confirm range, chosen in the prereg
  before any sims, never run before).
- Policy stack, identical both legs: withFullseatDiag(withSeatDrive(
  withWinDefer(TF leadfeast))), FEASTSCALE_R13=1 TRIBFLOOR=1
  WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1, 200 loop-days
  death-aware cap (harness Game.over stop), PLUS the NEW recorder
  scripts/policies/twoblow-diag.js (TWOBLOW=1). Sweep:
  scripts/twoblow-sweep-20261031.js (copy of the fieldkill sweep,
  recorder module + env name swapped — the fieldfinish2 sweep was
  lost in the 1850Z recovery, so this arm rebuilt it from the
  prereg recipe and re-proved it below; nothing was fabricated).
  Analyzer: scripts/twoblow-analyze-20261031.js (copy of the
  fieldfinish2 analyzer + twoblow/commit-snapshot passthrough).
  Proof test: scripts/test-twoblow-20261031.js (53 passed, 0
  failed pre-pilot; 77 passed, 0 failed with pilot corpora —
  engine legs, static legs, and corpus legs).

## Det-gate + determinism (before judged sims were trusted)

- Recorder ON vs OFF on pilot seeds 87104/87127, same stack, same
  seeds, worktree scratch dirs: dayHash arrays BYTE-IDENTICAL
  and end fields identical on both seeds — DET-GATE PASSED.
  The recorder is pure (no RNG draw, no game-state write).
- Corpus determinism leg: judged lever pilot seed 87124 re-run to
  a worktree scratch dir is BYTE-IDENTICAL to its judged JSON
  (284,131 bytes, cmp clean).
- Sweep I/O discipline (fieldkill lesson): stdout-only sweep +
  idle splitter with resilient writer; judged corpora never
  staged in /tmp (the /tmp check-log loss during this run is a
  fresh reminder of why — see infrastructure notes).

## Pilot numbers (8 seeds, lever vs baseline on identical seeds)

| Metric | Baseline | Lever | Prereg bar | Verdict |
| --- | --- | --- | --- | --- |
| Converted field kills (wave >= 3, vKill, committedFinish) | 0 | 1 | >= 1 | PASS |
| Wave-3 field vKills (any mechanism) | 0 | 2 | lever > baseline | PASS |
| Committed fights, wave >= 3 | 0 | 3 (1 vKill, 2 mFlee) | — | — |
| Committed-fight deaths | 0 | 0 | — | — |
| Companion-floor flights | 0 | 0 | — | — |
| Median survival (gameDays) | 118.5 | 119.5 | >= 0.9 x control (106.65) | PASS |
| Max survival | 197 | 197 | — | — |
| Field villager deaths, wave >= 3 rows (vDie) | 4 | 4 | <= control + 3 (7) | PASS |
| Village-lost endings | 1 (87109, day 146) | 1 (87109, day 146) | reported | identical |
| National-ever | 7 | 7 | reported, not judged | identical |
| Table-ever / wins | 7 / 7 | 7 / 7 | reported | identical |
| Wave-4 reach / wave-5 reach | 4 / 0 | 5 / 0 | reported | — |
| Field meetings / TB meetings | 104 / 16 | 92 / 16 | — | — |
| Field outcomes (vFlee / mFlee / evade / vKill) | 55 / 40 / 9 / 0 | 48 / 30 / 12 / 2 | — | — |

PILOT VERDICT: GO — all three bars pass. Confirm ran.

## Confirm numbers (12 fresh seeds, lever vs baseline)

| Metric | Baseline | Lever | Prereg bar | Verdict |
| --- | --- | --- | --- | --- |
| Converted field kills (wave >= 3) | 0 | 2 | confirm-only >= 1 | PASS |
| Wave-3 field vKills (any mechanism) | 0 | 2 | lever > baseline | PASS |
| Committed fights, wave >= 3 | 0 | 3 (2 vKill, 1 vFlee) | — | — |
| Committed-fight deaths | 0 | 0 | — | — |
| Companion-floor flights | 0 | 1 (87126, see sense read) | — | — |
| Median survival (gameDays) | 90 | 90 | >= 0.9 x control (81) | PASS |
| Max survival | 144 | 144 | — | — |
| Field villager deaths, wave >= 3 rows (vDie) | 4 | 4 | <= control + 3 (7) | PASS |
| Village-lost endings | 3 | 3 | reported | identical |
| National-ever | 7 | 7 | reported, not judged | identical |
| Table-ever / wins | 10 / 9 | 10 / 9 | reported | identical |
| Wave-4 reach / wave-5 reach | 9 / 0 | 10 / 0 | reported | — |

## Pooled band (20 seeds, lever vs baseline on identical seeds)

| Metric | Baseline | Lever |
| --- | --- | ---: |
| Converted field kills (wave >= 3) | 0 | 3 |
| Wave-3 field vKills (any mechanism) | 0 | 4 |
| Committed fights, wave >= 3 | 0 | 6 (3 vKill, 2 mFlee, 1 vFlee) |
| Committed-fight deaths | 0 | 0 |
| Companion-floor flights | 0 | 1 |
| Median survival (gameDays) | 90.0 | 90.5 |
| Max survival | 197 | 197 |
| Field villager deaths, wave >= 3 rows (vDie) | 8 | 8 |
| Village-lost endings | 4 | 4 |
| National-ever / table-ever / wins | 14 / 17 / 16 | 14 / 17 / 16 |
| Wave-4 reach / wave-5 reach | 13 / 0 | 15 / 0 |

CONFIRM VERDICT: GO — pooled bars pass (converted 3 ≥ 1,
confirm-only converted 2 ≥ 1, pooled median 90.5 ≥ 81, pooled
field deaths 8 ≤ 11) and no survivability or scale regression
appears anywhere: national, table, wins, village-lost, and both
medians are identical or within noise, and wave-4 reach ROSE
(13 → 15, driven by the converted kills feeding the ledger —
87124 reached wave 4 on the lever leg only in the pilot).

The 4th lever wave-3 field vKill (pooled) is NOT a conversion
and is NOT counted above: seed 87123 pilot day 107, Kate vs a
chorus_line entity at 9 HP, killed by the opening volley
("The lead never reached Kate — it fell to the volley"). That
beast is the same entity Kate fought down to 15 HP in the
committed flight below — the near-miss resolved by the bow on
re-meeting, not by the rule. The flag, not the kill count, is
the primary metric, and it excludes this row correctly.

## Panel (§15)

evidence/2026-10-31/sim-twoblow-a-panel-compare.md (+ .json,
+ before/after panel .json.gz), built by
scripts/twoblow-panels-20261031.js from the two legs' per-seed
corpora (dangerfit precedent — the official panel driver cannot
express the leadfeast + fullseat-diag stack + twoblow instrument;
the deviation is stated on the face of the compare file).
Contract metrics mapped where observable (won, table, national,
survival30/60, communityLost); the rest null, never fabricated.
Panel decision: review_required (screen-only conservatism), with
EVERY mapped metric delta exactly 0 (won 0.8 → 0.8, table 0.85 →
0.85, national 0.7 → 0.7, survival30/60 1 → 1, communityLost
0.2 → 0.2) and NO regression_signal anywhere — the opposite of
fieldfinish2's national regression_signal. The panel is the
instrument; the prereg thresholds above are the judge, and they
pass.

## Sense-testing (SENSE-TESTING LAW)

Read in full: the 3 converted kills, the 2 pilot committed
flights, and the 1 confirm companion flight. All are chorus_line
or spool — the two wave-3 monsters whose fights run long enough
for a fighter to prove two blows.

1. CONVERTED — Emma vs Chorus Line, seed 87124 day 33, expedition
   (10 rounds): Emma strikes steadily (31, 31, 30, 30, 29, 36, 35,
   35, 36) while her gear absorbs the kicks (15, then 19), takes
   only 35 damage all fight, and at R9 the beast stands at 22 HP
   with Emma at 65% HP. She holds — "two blows from falling, and
   they are still strong enough to finish it" — and R10 lands
   35 for the kill. This reads as a real fighter's decision: a
   healthy, armored fighter who has out-traded the beast for nine
   rounds finishing a 22-HP remainder she has already proven she
   can cover twice over (last two 36 + 35 = 71). Not a suicide
   hold: 65% HP, one blow from the kill, no trick round spent.
2. CONVERTED — Thabo vs Chorus Line, seed 87107 day 68, wild
   (6 rounds): a failed Walk-In parley (peacemaker, exposed),
   then Thabo reads the fight ("the odds are good. Committing
   to the kill"), strikes 38/37/35, holds at R4 (40 HP left),
   strikes 38 to 2 HP, holds again, and kills at R6. The commit
   line fires twice and the kill follows on the next strike both
   times — the window behaving exactly as designed, twice in one
   fight, at 68% HP.
3. CONVERTED — Thabo vs Spool, seed 87107 day 85, aid (6 rounds):
   Thabo feeds the spool silence for all three record rounds
   ("waits, breathes, checks a strap"), then strikes 42 and 44
   against replays that his gear mostly absorbs, holds at 12 HP
   with 65% HP, and kills with 43 next blow. This is the direct
   answer to finishgate's spool sense-read: the 17%-HP suicide
   hold is still refused by gate 3, and the 65%-HP proven-blow
   finish converts. Same monster, opposite HP, opposite outcome
   — the gate doing its job visibly.
4. COMMITTED FLIGHTS — Kate vs Chorus Line, seed 87123 day 75,
   wild (8 rounds), and Gabriela vs Chorus Line, seed 87123 day
   93, wild (12 rounds): both hold at the break (Kate twice: 33
   HP then 15 HP, at 85% HP; Gabriela once: 35 HP, at 82% HP) and
   both lose the beast the same way — the NEXT round is a chorus
   downbeat round, and the fighter dances (the signature
   counterplay) instead of striking, so gate 5 fails and the
   beast breaks and runs (Kate's at 15 HP, Gabriela's at 35 HP).
   The dance is the villager's own trick logic choosing safety
   over the strike; it reads as believable (a 30–40 damage kick
   is real), but it is a systematic leak in the window: a commit
   landing just before a downbeat round cannot convert, because
   the downbeat round never strikes. Documented as a finding
   for a future arm (below), NOT redesigned mid-run — the prereg
   binds gate 5 unchanged, and the pilot still passes on the
   conversions that land on non-downbeat rounds.
5. COMPANION FLIGHT — Nikolai vs Spool, seed 87126 day 79, wild
   (6 rounds): Nikolai feeds silence, strikes 23 and 22, holds at
   R5 with the spool at 22 HP and himself at EXACTLY 60% HP (the
   gate boundary, >= so it fires), strikes 19 to 3 HP at R6 —
   but the replay hits him to 37% HP first, and the companion
   floor fires: "past holding even a finished fight — they run
   while running still works." He flees with the beast at 3 HP.
   Painful, and exactly right: the companion is not decorative.
   It fired once in 20 seeds, prevented a potential death, and
   cost a kill. That trade is the design working, and it is why
   committed-fight deaths are 0 across the whole band.

No converted fight has a fighter below 60% HP at the hold
(commitVhpFrac values: 0.65, 0.68, 0.65, 0.85, 0.82, 0.60) —
the spool-type suicide hold does NOT convert, as required.
Narration exists only in the fight log (the commit line and the
floor line); no narration exists outside the log, same as
fieldfinish2 — a known surface gap, not a new one.

## What the rule DID do (post-hoc, not preregistered)

Unlike fieldfinish2, the lever trajectories did NOT diverge into
early lesser wins: national, table, wins, village-lost, and
median survival are identical or within noise on the pooled band,
and the panel shows zero delta on every mapped metric. The
wave>=3-only scope is the reason — wave-1/2 fights are
byte-identical, so the only divergence source is wave-3+ kills,
and there are only 3 of them. Downstream, the converted kills
feed the ledger: wave-4 reach rose 13 → 15 (87124 in the pilot, 87126 in the
confirm), and 87124's lever run lived 20 days longer
(112 vs 92) and reached wave 4 where its baseline did not. That
is a directionally right wall movement from a narrow lever, not
a pipeline: 3 conversions in 20 seeds will not carry the scale
wall by itself, and this evidence does not claim otherwise.

## Metric review (mandatory, §14)

- P1 behaved: the converted-flag primary cleanly separates "rule
  produced this kill" from "a kill happened" (the 87123 volley
  kill is the proof — counted in wave-3 vKills, excluded from
  converted by the flag, correctly).
- P2/P3 behaved: median survival and field deaths moved NOT AT
  ALL on the pooled band (90.0 → 90.5; 8 → 8), so the
  fieldfinish2 confound (early lesser win shortening the median)
  did not recur — because the wave>=3-only scope prevented the
  early-win divergence. The P2/P4 confound note from fieldfinish2
  is therefore retired for this scope, not re-litigated.
- The panel deviation behaved: same dangerfit construction as
  fieldfinish2, zero deltas, no regression signal.
- Last-two vs largest-two: the pilot cannot separate them (all 3
  conversions pass under both definitions — the largest two are
  the last two in every converted fight, since strikes are
  steady). The distinction matters only for spike-then-weak
  fighters, which this band did not produce; a future arm with
  spike-heavy fighters (haymaker/aim stacks) could separate them.
  No re-scoring: last-two stands as built.
- The downbeat leak (finding 4 above) is the largest open
  measurement gap in the window: 2 of 6 committed fights ended
  in flight specifically because the next round was a chorus
  downbeat dance round. A future arm may take up "committed
  fighters strike on downbeat instead of dancing" or "the window
  tolerates one dance round" — neither is built here, and neither
  changes this verdict.
- The confirm-only converted bar (≥1) passed with 2, so the pilot
  conversion was not a fluke — but n=3 conversions total is
  still small. The claim is "the window converts near-misses",
  not "the window converts at a rate" — no rate is claimed.
- Recorder gap, carried from finishgate: expedition fights carry
  mHpStart/mMaxHp null (the entity is not passed), so break-line
  fractions cannot be recomputed for Emma's converted kill from
  the corpus row alone — the log's strike arithmetic (284 left
  after 31 → start ≈ 315, break ≈ 47, commit at 22) fills it,
  but future recorders should still assert non-null HP fields
  on every logged fight row.
- Small-n warning: 3 conversions, 6 committed fights, 20 seeds.
  Every share here is a case count. Do not quote a conversion
  rate without its n.

## Wall numbers (pooled band, both legs, never pooled)

Baseline: national 14/20, table 17/20, wins 16/20, wave-4 13/20,
wave-5 0/20, median 90.0d, max 197d, village-lost 4.
Lever: national 14/20, table 17/20, wins 16/20, wave-4 15/20,
wave-5 0/20, median 90.5d, max 197d, village-lost 4.
Full seat 0, wave 5 reached 0 stands on both legs. Arc reach,
four-realm formation, trap acquisition by source, counter
discovery rates, and young-link succession survival are NOT in
this corpus — reported as unmeasured, not as zero.

## Blanks filled or documented

- FILLED (answered, GO at pilot and confirm): the two-blow
  finish window converts wave-3 near-misses the one-strike gate
  could never touch — 3 converted kills in 20 seeds, 0
  committed-fight deaths, 1 companion-floor retreat, no scale
  or survival regression, no early-lesser-win divergence. The
  finishgate candidate #1 is now built and measured, not just
  ranked.
- DOCUMENTED (next arms, not built): (a) the chorus downbeat
  leak — committed fights that meet a downbeat round next
  always dance instead of striking and lose the beast (2 of 6
  committed fights); (b) the spike-vs-last-two separation, still
  unmeasured; (c) narration outside the fight log for the
  commit/floor lines (same gap as fieldfinish2).
- NOT re-opened: HP-gate relaxation (refused — the 17%/29% spool
  rows stay refused, and the corpus now shows the 65% spool
  finish converting as the contrast), break-line movement,
  contact-break volume (sibling arm's class), learn-intent
  handling (n=1 in finishgate, untouched here).

## Infrastructure notes (loud, for the coordinator)

- safe-commit.sh index clobber hit on EVERY commit this run
  (prereg, rule, baseline corpus, analyzer fix): after each
  safe-commit, the main index showed the just-committed files
  as staged deletions (worktree files byte-identical to HEAD).
  Repaired every time the same way — `git update-index --add
  --cacheinfo "<mode>,<blob-from-HEAD>,<path>"` per file, then
  verified `git status --short` empty + `git diff HEAD` empty
  + hash-object matches — and every commit was verified
  correct (`git show --stat`) before repair. The commits are
  always correct; only the main index lies. This is the third
  sighting of the class on this tree family; after EVERY
  safe-commit, run `git status --short` first.
- The check.js --quick re-run's /tmp log was lost to a /tmp
  cleanup mid-run (session unknown, file gone) — a fresh
  instance of the /tmp-wipe class. Re-ran to a worktree scratch
  file instead (see verification below). Judged corpora were
  never staged in /tmp, per the prereg.
- The 2026-10-25 HOLD-pilot collapse and the spool sense-read
  were honored as constraints throughout: no gate threshold
  moved except gate 2's definition, and the 60% gate refused
  every low-HP hold in the band (lowest commitVhpFrac 0.60).

## Verification (this branch, pending coordinator merge)

- Proof test scripts/test-twoblow-20261031.js: 77 passed, 0
  failed with pilot corpora (engine positive/negative legs,
  static gate-text legs, corpus re-derivation legs).
- Det-gate: PASSED (hashes + end fields identical, 2 seeds).
- Corpus determinism: lever pilot seed 87124 re-run
  BYTE-IDENTICAL to its judged JSON.
- check.js --quick: 284 passed, 6 failed in 488s (re-run to a
  worktree scratch file after the /tmp log loss; the first run
  was 284/6 in 482s, identical counts). ALL 6 failures were
  re-run on pre-rule code (fieldFights.js restored byte-
  identical to the prereg commit) and fail IDENTICALLY there,
  same assertion names, same counts — pre-existing, none
  caused by this arm, none naming fieldFights.js or the
  twoblow instruments:
  (1) scripts/godpath/test-measurement-proof-update.js —
  throws "Proof source inputs are not current" (balance-proof
  manifest stale before this arm);
  (2) scripts/godpath/test-measurement-workflow.js — "retained
  neutrality proof covers the current Game/controller/harness
  inputs" (same staleness class);
  (3) scripts/godpath/test-mobile-combat-cadence.js — "enemy is
  announced before its action runs" + "Continue does not wrap
  the announced round a second time" (phone combat-cadence
  narration, not field-fight break logic);
  (4) scripts/godpath/test-occupation-panels.js — "real CLI
  workflow completed";
  (5) scripts/godpath/test-phone-frame-proof.js — retained
  browser-input hashes vs current source + "Phone receipt
  source is stale or missing" (proof staleness predating this
  arm; it lists every boot input, fieldFights.js among dozens,
  and fails identically with fieldFights.js at base);
  (6) scripts/test-establishment-r20-fixes-20261020.js —
  racks-full voice gating, "next day voices once more:
  expected 2, got 1" (cooking voice gating, no shared code
  path with the wave>=3 break check).
  So: check.js is NOT green on this branch, and that is a
  pre-existing condition of the base, not a regression from
  this arm. The arm's own proof test (77 passed, 0 failed)
  and the det-gate are the evidence for this change; the 6
  stale-proof failures are the base's debt, reported here
  rather than waived or hidden. The rule file was restored
  from HEAD after every temp-revert and verified by hash
  (2e10a98553c61193dc62fae1f018078483ecee6e) each time.
- Worktree state at evidence time: rule + instruments + proof
  test committed (f41c746b5, ae372ae58); baseline pilot corpus
  committed (a8110bc95); lever pilot/confirm corpora, panel
  files, analysis JSONs, panels script, and this evidence file
  go in landing commits below. No other src/ changes. The
  check re-run scratch file (scratch-twoblow-check/quick.log)
  is deleted before the landing commits — it is a log, not
  evidence, and does not ship.
