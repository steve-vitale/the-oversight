# sim-chorus-a — PRE-REGISTRATION (written BEFORE any judged sims)

Run: Loop A worker, run fleshout-loop-a-20261101T0000Z, arm sim-chorus-a
(BUILD arm, axis scale-onramp, converging NOT converged). Sibling Loop B
live claim 2343Z (food-economy arms sim-strandtile-b / sim-refusedband-b)
is NOT touched; no other worktree is touched. Main tree untouched.

## Question (from run 2156Z closeout, evidence/2026-10-31/sim-scale-onramp-round-2156-a.md)

In the twoblow corpus, Kate (seed 87123 d75) and Gabriela (87123 d93)
commit to a wave-3 finish under the two-blow window, then the next
round is a chorus downbeat (dance) round and the fighter dances
instead of striking, so the beast flees (at 15 HP and 35 HP) — 2 of 6
committed fights lost this way. This arm fixes that leak only.

## Canon read first

docs/CANON.md, docs/MONSTER-WAVES.md (Chorus Line: visible 4/4 beat;
beats 1-3 count down, the downbeat kicks everything in front of it;
"dance and you're untouchable (but dancing is your whole turn)").
No canon doc covers villager field-fight flee triggers in detail;
the mechanism below is read from src/js/fieldFights.js, not invented
as canon. Steve's standing rules honored: monster encounters are
fought, not rolled (2026-10-08) — the finish, if it comes, comes
from real strikes in fought rounds, never a table roll; the chorus's
design is respected, not overridden (see "The fix" — no strike is
forced through a dance round).

## Mechanism (read from code, verified against both leak transcripts)

- The twoblow gate fires at the IN-ROUND break check
  (`members[0].hp / maxHp < mBreak`, 0.15 for wave >= 2): if the
  fighter's last two proven blows sum to >= the beast's remaining
  HP, fighter HP >= 60%, intent engage, this round's lead strike
  landed, not sealed, then rec.committedFinish = true and the
  round loop continues instead of fleeing.
- committedFinish is NEVER cleared and does NOT suppress later
  break checks: every later round re-runs the break check and
  re-gates. On a later round where the fighter does NOT land a
  lead strike, gate 5 (vStruckThisRound) fails and the beast flees.
- villagerTrickAction returns {type:'dance'} for chorus_line when
  round % 4 === 0 and the village knows the trick. The dance
  branch consumes the fighter's whole turn (no strike, so
  vStruckThisRound stays false) and sets rec.trickDance = 1, which
  is cleared after the round's phases run, BEFORE the break check.
- Hence: commit on round N, dance on round N+1 (a %4 round), break
  check re-gates, vStruckThisRound is false, beast flees. Both
  leak transcripts show exactly this shape (Kate commits R6 and
  R7, dances R8, flees at 15 HP; Gabriela commits R11, dances R12,
  flees at 35 HP). The companion 40% floor fires before the break
  check and is unaffected; morale on a dance round does not flee
  these fighters (trick-aware morale: a trick-performing villager
  above 25% HP is not called hopeless), so the break check is the
  sole leak point. The beast's flee check DOES run on dance
  rounds in general (non-committed fights flee on dance rounds as
  on any round); this arm changes only the committed case below.

## The fix, exactly (CHORUS-HOLD, src/js/fieldFights.js ONLY)

- Track a per-round local flag dancedThisRound, reset at each
  round's start, set true in the dance trick branch (alongside
  rec.trickDance = 1). No other trick branch touches it.
- At the in-round break check, BEFORE the twoblow gate, add one
  hold branch: if rec.committedFinish is already true AND
  dancedThisRound is true AND members[0].hp > 0 AND !opts.noFlee,
  then the beast does NOT flee this round: log
  "<Name> holds through the downbeat — <monster> is still
  two blows from falling, and the dance was the price of
  staying in it. (Committed finish, chorus hold)", increment
  rec.chorusHoldRounds (audit field, default 0, added to the
  rec init block), and continue the round loop WITHOUT breaking.
  The twoblow gate itself is untouched and still re-fires on
  later strike rounds.
- Why this shape and not general commitment persistence: the
  briefed leak is specifically the dance round. A general
  "committed never flees at the break check" would also hold
  through 0-damage strikes, shouts, waits and other non-strike
  rounds — a wider behavior change than the leak justifies, and
  it would let a committed fighter hold indefinitely without
  proving anything. The dance hold is bounded by construction:
  dance rounds occur at most every 4th round, the next round is
  a strike round, and on that strike round the gate re-fires
  (twoblowLast is NOT reset by a dance round, so the proven
  blows survive it) or, if the strike whiffs to 0, the beast
  flees honestly. The fighter still pays the dance round: no
  strike, no damage, the kick avoided only because they danced.
- Persistence does NOT re-impose the 60% gate: a fighter who
  committed at >= 60% and then took damage still holds through
  the dance round down to the companion 40% floor (which fires
  first if breached). The 60% gate, the break line (0.15), the
  companion 40% flee floor, and the committed-finish NO-GO are
  NOT re-opened. Sealed arenas untouched (hold requires
  !opts.noFlee). Round cap 15 still ends the fight.

Explicitly UNCHANGED: the twoblow gate and all its gates, the
break line, the 60% gate, the 40% companion floor, the chorus
dance rule itself (round % 4, whole-turn cost, kick avoidance),
monster damage, strike formula, morale, hogtie, arena handling,
learn-withdrawal, hopeless flight, HP floor, volley, trick exits.
No other src/js file changes. No policy-default flips. This
changes combat feel: the landing commit carries [needs-eyes].

## Base pin (re-derived, never transferred)

- Worktree HEAD at prereg time: 66239763c33db0dcb9522aadbb826729a5187951
  (current master at arm start). The prereg commit touches only
  this evidence file, so the baseline leg's game code is
  byte-identical to the pin. Judged comparisons are lever-vs-
  baseline on identical seeds, never against the twoblow corpora
  (different base: twoblow pilot anchor a8110bc...; trajectories
  on this base are re-measured, not transferred).
- Worktree: ~/workspace/worktrees/sim-chorus-a (branch
  sim-chorus-a). Main tree untouched.

## Seed plan (fixed now; no band-shopping)

- Pilot (8, = twoblow's pilot set, chosen because it contains
  the leak seed 87123, not because of any result on this base):
  87104, 87109, 87119, 87124, 87140, 87115, 87123, 87127.
- Confirm (12, fresh seeds, run ONLY if the pilot gate passes):
  87142, 87143, 87144, 87145, 87146, 87147, 87148, 87149, 87150,
  87151, 87152, 87153. Sequential seeds after the twoblow
  pilot/confirm range, never judged before, not selected from
  any result. No substitutions, no additions.
- Each leg (baseline, lever) runs the SAME seed set on its own
  code; judged comparisons are lever-vs-baseline on identical
  seeds. Baseline pilot runs on the prereg-commit code (no game
  change yet); lever pilot runs after CHORUS-HOLD lands in the
  worktree. The two legs differ ONLY by this rule.

## Policy stack (identical for both legs)

withFullseatDiag(withSeatDrive(withWinDefer(TF leadfeast))),
FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
FULLSEAT=1, 200 loop-days death-aware cap (harness Game.over
stop; dead villages stop simulating), PLUS the existing recorder
scripts/policies/twoblow-diag.js (TWOBLOW=1), wrapped OUTSIDE
fullseat-diag. The recorder is unchanged and already proven
pure (reads + post-delegation recording, zero game-state
writes, zero RNG draws). Sweep: scripts/chorus-sweep-20261031.js
(copy of the twoblow sweep, name swapped only). Splitter:
scripts/chorus-split-20261031.js (copy of the twoblow
splitter, name swapped). Analyzer:
scripts/chorus-analyze-20261031.js (copy of the twoblow
analyzer, PLUS the chorus-leak and chorus-hold counts defined
below; all other counts identical).

## Primary metric (binding) — chorus-leak count

A chorus-leak fight is a field-fight row with ALL of:
  committedFinish === true, mid === 'chorus_line',
  outcome === 'mFlee', AND a dance log line
  ("dances on the downbeat") appearing AFTER the
  "Committed finish, two-blow" log line in that fight's log.
(Leak definition is log-structural, so it measures the same
thing on both legs without depending on the new audit field.
Chorus-hold fights are counted separately on the lever leg:
rows with a "Committed finish, chorus hold" log line; they
must be 0 on the baseline leg by construction.)
Reported alongside, never folded into the primary: converted
field kills (wave >= 3, outcome vKill, committedFinish true),
total wave-3+ field vKills, committed-fight outcomes,
companion-floor flights, chorus-hold outcomes (how many hold
fights end in a kill).

## GO thresholds (pilot — ALL must hold; a miss is NO-GO)

- P1 (effect): baseline pilot leak count >= 1 (the leak
  reproduces on this base; the 2156Z report's count of 2 is
  NOT transferred — the judged baseline is this run's) AND
  lever pilot leak count = 0.
- P2 (no conversion loss): lever converted field kills >=
  baseline converted field kills, band-wide.
- P3 (committed safety): lever committed-fight deaths = 0.
- P4 (survival guardrail): lever median survival (gameDays)
  >= 0.9 x baseline median (baseline -10%).
- P5 (death guardrail): lever wave->=3 field deaths
  (wave >= 3 field rows with outcome 'vDie') <= baseline + 3
  (twoblow's noise allowance, adopted verbatim).
- Secondary, reported not judged at pilot: table-ever, wins,
  national-ever (reported, NOT judged — end-of-run national
  totals move when a leg wins earlier at lower scale),
  wave-4/5 reach, total villager deaths, village-lost endings.

## Confirm gate

Confirm (12 fresh seeds) runs ONLY if the pilot passes all
five bars. Confirm GO (judged on the confirm-only band,
lever vs baseline on identical seeds): lever leak count = 0
AND lever converted >= baseline converted AND lever committed
deaths = 0 AND lever median >= baseline median -10% AND lever
wave->=3 field deaths <= baseline + 3. If confirm fails any
bar, the verdict is NO-GO at confirm and the game code is
reverted (below). If the pilot baseline leak count is 0
(non-reproduction), the pilot is NO-GO on P1 and no confirm
runs; the outcome is a measured DIAG (leak rate 0 on this
base on these seeds), not a fix claim.

## Det-gate (before judged sims are trusted)

- Recorder ON vs OFF on 2 pilot seeds (87104, 87127), same
  stack, same seeds, worktree scratch dirs (deleted before
  commit; NEVER /tmp, never the judged corpus): dayHash arrays
  + end fields (gameDays/won/national/table/maxWave/
  endScaleRank) byte-identical. A mismatch stops the run
  until explained. (The recorder is unchanged from twoblow,
  but the gate is re-proven on this base — bases moved.)
- Corpus determinism leg: one judged pilot seed re-run to a
  worktree scratch dir is byte-identical to its judged JSON.
- Sweep I/O discipline (fieldkill lesson): the sweep prints
  ONE JSON line per seed to stdout and writes nothing itself;
  a separate idle splitter reads the stdout file and writes
  the per-seed JSONs with a resilient writer (retry +
  full-size verification). stdout/stderr captured to files
  in single FOREGROUND execs, never a backgrounded pipe.
  Judged corpora are NEVER staged in /tmp.

## Horizon + why (death-aware, never a fixed 200d)

Cap 200 loop-days; stop rule is the harness's Game.over
(village lost or won). Identical to twoblow: wave-3 doors
opened late and villages lived with wave 3 for tens of days
on prior bases, so a shorter cap would censor the meeting
tail; the death-aware stop keeps cost at the survival
distribution.

## Panel (§15)

Before/after comparison runs through scripts/balance-panel.js
— as panels built in the balance-panel schema from the two
legs' per-seed corpora (twoblow precedent:
scripts/twoblow-panels-20261031.js, copied as
scripts/chorus-panels-20261031.js with corpus dirs/names
swapped), because the official panel driver runs
sweep-compare registry policies only and cannot express the
leadfeast + fullseat-diag stack + twoblow instrument. The
deviation is stated on the face of the compare file.
Contract metrics mapped where observable (won, table,
national, survival30/60, communityLost); the rest null, never
fabricated. The panel is the instrument; the GO thresholds
above are the judge. Compare output:
evidence/2026-10-31/sim-chorus-a-panel-compare.md (+ .json,
+ before/after panel .json.gz).

## Sense-testing (SENSE-TESTING LAW)

The evidence judges at least 2 committed-fight transcripts
on EACH leg (baseline leak fights if they reproduce, else
the nearest committed chorus fights; lever hold fights, plus
any lever committed fight that still ends mFlee) — for
meaning: does the dance-then-flee read sensibly on baseline
(a fighter who committed, then danced to dodge the kick, then
watched the beast walk away — the leak as a story failure),
does the dance-hold read sensibly on lever (danced to dodge,
held, re-engaged, finished — or fled honestly on a later
gate), does any narration exist for it outside the log.
Counts alone do not pass this section. A lever converted
fight whose fighter was below 60% HP at the hold is a rule
failure, not a success, and fails the arm regardless of P1
(the 60% gate is unchanged; the hold must not become a
backdoor around it — the hold branch requires a prior
committedFinish, which itself required >= 60%).

## Wall numbers (on the judged band, both legs)

National / table / wins, wave reach (maxWave distribution,
wave-4, wave-5), median + max survival, full seat, per-band
never pooled. Arc reach, four-realm formation, trap
acquisition by source, counter discovery rates, and young-link
succession survival are NOT in this corpus — reported as
unmeasured, not as zero.

## If NO-GO: revert completely

The game code is reverted so fieldFights.js is byte-identical
to base (verified with `git diff 66239763c -- src/js/fieldFights.js`
empty) before any landing commit; the killed arm leaves no
trace in src/. Evidence + corpora + panel are retained. The
instrument copies (chorus sweep/splitter/analyzer/panels,
proof test) may be retained as measurement tooling ONLY if
they contain no game-code change — otherwise they are deleted
too. The evidence states the revert verification explicitly.

## If GO: landing

Each landing commit carries its own proof test + evidence
section, message includes [needs-eyes] (combat feel change),
and reports 'ready to merge, pending coordinator' readiness
(the coordinator merges via --ff-only). Do NOT push, do NOT
bump versions, do NOT verify live. Do NOT merge to master
yourself.

## Metric review (carried, filled at evidence time)

- (To be filled from the run: did the leak reproduce on this
  base, did the dance hold fire exactly on dance rounds and
  nowhere else, did any hold fight end in a death (companion
  failure) or a round cap, did the hold change any non-chorus
  fight (it must not — dance rounds exist only for chorus),
  did the panel deviation behave, did the pilot gate behave.)
