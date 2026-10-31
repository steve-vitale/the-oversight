# sim-twoblow-a — PRE-REGISTRATION (written BEFORE any lever sims)

Run: Loop A worker, axis scale-onramp (converging, NOT converged).
Arm type: BUILD — one narrow game-code change in src/js/fieldFights.js
ONLY (the two-blow finish window + its survivability companion, both
in that file), plus policy-side instrument copies. Nothing else in
src/ changes. This build changes combat feel: the landing commit
carries [needs-eyes].

## Question (from sim-finishgate-a, landed master 1d72a96c3)

The fieldfinish2 pilot proved the committed-finish one-strike gate
never fires on wave-3 beasts (0/71 wave-3 fights, lever leg). The
finishgate DIAG then measured exactly how far short it falls: of
7 fought break-line flights in the corpus, 2 are blocked by gate 2
alone — short by 12 HP (baseline chorus_line 87123 d75: 33 HP left,
biggest blow 21, fighter at 85% HP) and by 30 HP (lever spool
87109 d89: 37 HP left, one 7-damage blow — a weak fighter, not a
near-miss). The finishgate candidate ranked first, and this arm
builds it: a "committed finish within two blows" rule. Expected
yield on the finishgate corpus: 1 conversion (the baseline pure
near-miss), not a wave-3 kill pipeline — the pilot GO below is
set at that honest scale (≥1), not at a pipeline.

## Canon read first

docs/CANON.md, docs/MONSTER-WAVES.md (wave 3: 9 monsters, HP
240–420 in data; break line 15% for wave >= 2, i.e. a 36–63 HP
remainder at the break check), evidence/2026-10-31/
sim-finishgate-a.md and sim-finishgate-a-prereg.md (gate audit,
gap table), evidence/2026-10-31/sim-fieldfinish2-a.md and
sim-fieldfinish2-a-prereg.md (the six-gate rule, its NO-GO, and
its survivability companion). No canon doc covers villager
field-fight flee triggers in detail; the mechanism below is read
from fieldFights.js code, not invented as canon. Steve's standing
rule honored here: monster encounters are fought, not rolled
(2026-10-08) — the finish is earned in fought rounds, by blows
actually landed, not granted on sight or by an outcome table.

## The rule, exactly (two-blow window, behind the existing HP gate)

Location: the IN-ROUND break check ONLY (fieldFights.js, the block
`if (abBoundN <= 0 && (members[0].hp / members[0].maxHp) < mBreak)`
after the morale section). mBreak is UNCHANGED (wave >= 2 ? 0.15
: 0.25). Tracking added, in the lead-strike else-branch only:
twoblowLast = the fighter's last two proven lead strikes — vd
after all multipliers (Aim, Haymaker, Dead Aim, Blood Trail,
Stalk, trade-of-blows, godpath fieldStrike), before lead.hp
subtraction, counted ONLY when vd > 0. Volley damage, the
ambush opening strike, shoulder-check collision damage, and
ally strikes are EXCLUDED (the finish is the lead villager's
own proven blows in fought rounds, exactly as fieldfinish2's
vMaxStrike excluded volley and allies). A 0-damage strike
(mirage miss, editor cut) is NOT a proven blow: it does not
enter twoblowLast and does not set vStruckThisRound.
vStruckThisRound = whether this round's lead strike dealt > 0,
reset at each round's start.

The override fires at a break check iff ALL of these hold:
0. wave >= 3 — the rule touches wave-3+ beasts ONLY. Wave-1/2
   fights are byte-identical to baseline. (Fieldfinish2 fired
   on wave 1–2, converted 61 already-winnable fights, and
   diverged trajectories into early lesser wins; this arm
   refuses that whole class by construction.)
1. members[0].hp > 0 (the lead is alive).
2. TWO-BLOW GATE (replaces fieldfinish2's one-strike gate):
   twoblowLast holds exactly two proven blows AND
   members[0].hp <= twoblowLast[0] + twoblowLast[1] — the beast
   is plausibly TWO blows from death, proven by this fight's
   own last two blows, not by a hypothetical multiplier stack
   and not by its biggest blow rounds ago. NOTE on the
   finishgate definition: finishgate's "two-strike reach" was
   maxStrike + secondStrike (largest two). This rule uses the
   LAST two, as the build brief specifies. The distinction
   does not change the known near-miss: baseline chorus
   87123 d75 struck 18, 21, 18, 16, 18 — last two 16+18 = 34
   ≥ 33, and max+second 21+18 = 39 ≥ 33, so it converts
   under either definition. A spike-then-weak fighter (huge
   blow rounds ago, weak blows since) does NOT convert under
   last-two: the finish is judged on what the fighter can do
   now, not on a spike they cannot repeat. That is the
   honest reading of "within two blows".
3. vHp / vHpMax >= 0.60 — UNCHANGED, NON-NEGOTIABLE. The spool
   sense-read (fighter at 17% HP, beast at 28 HP, proven 44)
   and the 2026-10-25 HOLD-pilot collapse forbid relaxing it;
   fighters at 17%/29% HP must still be refused. No other
   gate threshold moves.
4. rec.intent === 'engage' — committed, not learning. (A learn
   villager who flipped to engage on a good exchange counts:
   that flip IS a commitment, logged "Committing to the kill".)
5. vStruckThisRound — this round's lead strike landed damage.
   No trick-round conversions.
6. !opts.noFlee — sealed arenas are untouched.
When it fires: rec.committedFinish = true, rec.committedRounds
+= 1, rec.twoblowLastTwo = twoblowLast.slice(),
rec.twoblowSum = twoblowLast[0] + twoblowLast[1], log line
"<Name> holds — <monster> is two blows from falling, and they
are still strong enough to finish it. (Committed finish,
two-blow)", and the break check does NOT set mFlee and does
NOT break — the round loop continues, and the kill, if it
comes, comes from real strikes in the following rounds (at
most two, if the gate's arithmetic holds; the gate re-fires
only if all gates still hold, notably gate 3). If the next
strikes do not kill, the break check fires again and the
override re-fires ONLY if all gates still hold.

Survivability companion (retained from fieldfinish2, NOT a
firing-gate change): once rec.committedFinish is true, at each
subsequent round's morale entry (after the vHp <= 0 death
check, before other morale), if vHp / vHpMax < 0.40 AND
!opts.noFlee, the villager flees: outcome 'vFlee', fleeHpFrac
set, log line "<Name> is past holding even a finished fight —
they run while running still works. (Committed-finish floor)",
break. This overrides the winning floor (winning sets fleeAt
= 0.05): a committed villager holds to 40%, not to 5%. The
companion tightens post-commit survivability; it does NOT
relax gate 3, the break line, or any other threshold. Normal
morale (hopeless, floor, learn) still applies on later rounds;
the companion is additional, never a replacement. Round cap 15
still ends the fight.

Explicitly UNCHANGED (narrowness, stated so the coordinator can
check the diff):
- The volley/contact break (pre-round): a beast met already
  below the line still flees on contact. The finish must be
  earned in a fought round.
- The break line itself (mBreak), gate 3 (0.60), gate 4
  (engage), gate 5 (struck this round), gate 6 (noFlee).
- The cornered-hold branch, hogtie bind skip, arena (noFlee)
  handling, learn-withdrawal, hopeless flight, HP floor, trick
  exits, round cap, volley, strike formula, monster damage.
- No other src/js file changes. No policy-default flips. No
  gate threshold or demand number moved anywhere else.

## Base pin (re-derived, never transferred)

- Worktree HEAD at prereg time: 1d72a96c3b0cccffb54a1249a1f7f5d84dadec30
  (Loop A 2058Z coordinator evidence commit). The prereg commit
  itself touches only this evidence file, so the baseline leg's
  game code is byte-identical to the pin. Judged comparisons are
  lever-vs-baseline on identical seeds, never against
  fieldfinish2's or finishgate's corpora (different bases).
- Worktree: ~/workspace/worktrees/sim-twoblow-a (branch
  sim-twoblow-a). Main tree untouched.

## Seed plan (fixed now; no band-shopping)

- Pilot (8, = fieldfinish2's pilot set, for construction
  comparability, not value transfer): 87104, 87109, 87119, 87124,
  87140, 87115, 87123, 87127.
- Confirm (12, fresh seeds, run ONLY if the pilot gate passes):
  87103, 87107, 87120, 87121, 87126, 87128, 87132, 87134, 87135,
  87137, 87138, 87141. The first 11 are fieldfinish2's confirm
  set; 87141 is the next seed after the pilot/confirm range,
  chosen here before any sims, never run before, not selected
  from any result. No substitutions, no additions.
- Each leg (baseline, lever) runs the SAME seed set on its own
  code; judged comparisons are lever-vs-baseline on identical
  seeds. Baseline pilot runs on the prereg-commit code (no game
  change yet); lever pilot runs after the rule lands in the
  worktree. The two legs therefore differ ONLY by this rule.

## Policy stack (identical for both legs)

withFullseatDiag(withSeatDrive(withWinDefer(TF leadfeast))),
FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
FULLSEAT=1, 200 loop-days death-aware cap (harness Game.over
stop; dead villages stop simulating), PLUS the NEW recorder
scripts/policies/twoblow-diag.js (TWOBLOW=1), wrapped OUTSIDE
fullseat-diag. The recorder is a copy of fieldkill-diag.js with
exactly these captured-field additions per field-fight row:
committedFinish (rec.committedFinish), committedRounds
(rec.committedRounds || 0), twoblowLastTwo (rec.twoblowLastTwo
|| null), twoblowSum (rec.twoblowSum || null), and the env gate
renamed FIELDKILL -> TWOBLOW (all function/store names renamed
likewise). It is policy-side only, env-gated, pure reads +
post-delegation recording, zero game-state writes, zero RNG
draws — the same purity contract as fieldkill-diag.
fieldkill-diag.js itself is NOT edited. Sweep:
scripts/twoblow-sweep-20261031.js (copy of the fieldkill
sweep, recorder module + env name swapped, same stdout-only
I/O discipline + idle splitter pattern). Splitter:
scripts/twoblow-split-20261031.js (copy of the fieldkill
splitter, name swapped). Analyzer:
scripts/twoblow-analyze-20261031.js (copy of the
fieldfinish2 analyzer, which already counts committedFinish
conversions; plus twoblowLastTwo/twoblowSum passthrough on
converted rows).

## Primary metric (binding)

Converted field kills, band-wide: field-fight rows with wave
>= 3, outcome 'vKill', AND committedFinish === true (the kill
was produced by this rule, proven by the flag — not a volley
kill, not a haymaker overkill above the break line, which the
baseline could also produce). Reported alongside, never folded
into the primary: total wave-3+ field vKills (any mechanism),
wave-3 field vKills, wave-4/5 field vKills (rows exist for all
waves; only wave-3 rows carry full logs, so a wave-4/5 vKill
cannot be log-verified as committed — it is reported, not
counted as converted, unless its row carries the flag, which
the recorder captures for every wave), committed-fight
outcomes (how many committed fights ended in a kill, a flight,
a death, a round cap), companion-floor flights.

## GO thresholds (pilot — all three must hold; a miss is NO-GO)

- P1 (effect): converted field kills >= 1 band-wide (lever
  leg), vs 0 on the baseline leg (baseline has no rule, so its
  flag count is 0 by construction; the comparison that matters
  is lever >= 1 AND lever wave-3 field vKills > baseline
  wave-3 field vKills). Scale note: finishgate's corpus yield
  is 1 conversion, so ≥1 is the honest pilot bar — a rule
  built to convert near-misses, not a pipeline.
- P2 (survival guardrail): median survival (gameDays) on the
  lever leg >= 0.9 x control median (baseline −10%, per the
  build brief). Median gameDays is confounded by win-ends-run
  (fieldfinish2 metric review: an early lesser win shortens
  the median without any village dying), so a P2 miss is
  reported with village-lost counts alongside and judged as
  written — it does not get re-scored against a friendlier
  metric mid-run.
- P3 (death guardrail): field villager deaths (wave >= 3
  field rows with outcome 'vDie') on the lever leg <= control
  + 3 (fieldfinish2's noise allowance, adopted verbatim).
  Committed-fight deaths are reported separately: any
  committed fight ending vDie is a companion-failure loud
  line in the evidence, even if P3 passes.
- Secondary, reported not judged at pilot: table-ever, wins,
  national-ever (reported, NOT judged — fieldfinish2 showed
  end-of-run national totals move when a leg wins earlier at
  lower scale; judging national-ever here would repeat that
  confound), wave-4/5 reach, total villager deaths,
  village-lost endings, killable-state conversions.

## Confirm gate

Confirm (12 seeds) runs ONLY if the pilot passes all three
bars. Confirm GO (judged over the pooled 20-seed band, lever
vs baseline on identical seeds): the same three bars, PLUS
confirm-only seeds (the 12) show converted field kills >= 1
(the pilot must not be a fluke). If confirm fails any bar, the
verdict is NO-GO at confirm and the game code is reverted
(below).

## Det-gate (before judged sims are trusted)

- Recorder ON vs OFF on 2 pilot seeds (87104, 87127), same
  stack, same seeds, worktree scratch dirs (deleted before
  commit; NEVER /tmp, never the judged corpus): dayHash arrays
  + end fields (gameDays/won/national/table/maxWave/
  endScaleRank) byte-identical. A mismatch stops the run
  (killed-at-pilot on instrument grounds) until explained.
  NOTE: the fieldfinish2 sweep/det scripts were LOST during
  the 1850Z recovery (see sim-fieldfinish2-a.md, instrument
  loss note) — this arm rebuilds them from the prereg recipe
  (copy of the fieldkill sweep with recorder module + env name
  swapped) and re-proves det-gate + determinism before judging
  any new sims. Nothing is fabricated to fill that gap.
- Corpus determinism leg: one judged pilot seed re-run to a
  worktree scratch dir is byte-identical to its judged JSON.
- Sweep I/O discipline (fieldkill lesson): the sweep prints ONE
  JSON line per seed to stdout and writes nothing itself; a
  separate idle splitter reads the stdout file and writes the
  per-seed JSONs with a resilient writer (retry + full-size
  verification). stdout/stderr captured to files in single
  FOREGROUND execs, never a backgrounded pipe. Judged corpora
  are NEVER staged in /tmp.

## Horizon + why (death-aware, never a fixed 200d)

Cap 200 loop-days; stop rule is the harness's Game.over
(village lost or won). Identical to fieldfinish2: wave-3 doors
opened late and villages lived with wave 3 for tens of days on
prior bases, so a shorter cap would censor the meeting tail;
the death-aware stop keeps cost at the survival distribution.

## Panel (§15)

Before/after comparison runs through scripts/balance-panel.js —
as panels built in the balance-panel schema from the two legs'
per-seed corpora (dangerfit precedent:
scripts/dangerfit-panels-20261031.js), because the official
panel driver runs sweep-compare registry policies only and
cannot express the leadfeast + fullseat-diag stack +
twoblow instrument. The deviation is stated on the face of
the compare file. Contract metrics mapped where observable
(won, table, national, survival30/60, communityLost); the rest
null, never fabricated. The panel is the instrument; the GO
thresholds above are the judge. Pilot panel attached at pilot;
if confirm runs, the final panel is rebuilt over the full
20-seed band and attached to the evidence file. Compare output:
evidence/2026-10-31/sim-twoblow-a-panel-compare.md (+ .json,
+ before/after panel .json.gz).

## Sense-testing (SENSE-TESTING LAW)

The evidence judges at least 2 converted-kill fight transcripts
(rec.log from the corpus, with rounds, wounds, intent, the
committed-finish line, and the killing blow) — or, if only 1
conversion exists, that 1 plus 1 non-converted break-line
flight that did NOT qualify for the override, with the gate
that excluded it named — for meaning: does the finish read
as a decision a real fighter would take (healthy, two blows
from a kill, beast breaking), does the companion floor read
as a believable retreat, does any narration exist for it
outside the log. Spool-type suicide holds must NOT convert:
any converted fight whose fighter was below 60% HP at the
hold is a rule failure, not a success, and fails the arm
regardless of P1. Counts alone do not pass this section. If
P1 fails (0 conversions), this section is vacuous by the
mechanism's own non-firing, and that vacuity IS reported as
the finding (as in fieldfinish2).

## Wall numbers (on the judged band, both legs)

National / table / wins, wave reach (maxWave distribution,
wave-4, wave-5), median + max survival, per-band never pooled.
Wave-1/2 reach is read from maxWave and wave-3 reach from the
daily w3rung rows. Arc reach, four-realm formation, trap
acquisition by source, counter discovery rates, and young-link
succession survival are NOT in this corpus — reported as
unmeasured, not as zero.

## If NO-GO: revert completely

The game code is reverted so fieldFights.js is byte-identical
to base (verified with `git diff <base> -- src/js/fieldFights.js`
empty) before any landing commit; the killed arm leaves no
trace in src/. Evidence + corpora + panel are retained. The
instrument copies (twoblow-diag.js, sweep, splitter, analyzer,
proof test) may be retained as measurement tooling ONLY if they
contain no game-code change — otherwise they are deleted too.
The evidence states the revert verification explicitly.

## If GO: landing

Each landing commit carries its own proof test + evidence
section, message includes [needs-eyes] (combat feel change),
and reports 'ready to merge, pending coordinator' readiness
(the coordinator merges via --ff-only). Do NOT push, do NOT
bump versions, do NOT verify live. Do NOT merge to master
yourself.

## Metric review (carried, filled at evidence time)

- (To be filled from the run: did the last-two gate prove too
  narrow or too wide in practice — did any converted fight
  rest on a spike-then-weak pattern, did any near-miss fail
  only because its last two were weak while its largest two
  would have covered, did the 60% gate bind anywhere
  observable, did any committed fight end in a death
  (companion failure), did the wave>=3-only scope prevent the
  fieldfinish2 early-lesser-win divergence, did the panel
  deviation behave, did the pilot gate behave.)
