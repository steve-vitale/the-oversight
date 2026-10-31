# sim-fieldfinish2-a — PRE-REGISTRATION (written BEFORE any judged sims, 2026-10-31)

Run: Loop A worker, axis scale-onramp (converging, NOT converged),
run fleshout-20261031T1850Z. Arm type: BUILD — one narrow game-code
change in src/js/fieldFights.js ONLY, plus a survivability companion
in the same file, plus policy-side instrument copies. Nothing else
in src/ changes. This build changes combat feel: the landing commit
carries [needs-eyes].

## Question (from sim-fieldkill-a, 1702Z)

Field fights never kill wave-3 monsters because the fight exits
before death: the monster's break line below 15% of max HP (36–63
HP for wave-3 max HP 240–420) makes it flee instead of dying, a
monster met already below that line flees on contact before any
blow lands, and 10 of 11 killable-state fights ended with the
monster fleeing at 16–44 HP, one strike from death. Wild fights are
always solo (202/202), so the ally finish is structurally
unavailable, and only the scholar's turn-based fights kill. Prior
HOLD/NOFLEE pilots (2026-10-25) are the warning: removing flee
raised kills but collapsed villages (median 98d/86d vs a >= 120d
bar, villager deaths 15/14 vs <= 12, national reach collapsed) —
the break line is load-bearing villager protection. This lever is
therefore NARROW and SURVIVABILITY-PAIRED, never a flee removal.

## Canon read first

docs/CANON.md, docs/MONSTER-WAVES.md (wave 3: 9 monsters, HP
240–420 in data; wave law, escalation, tiers), src/js/fieldFights.js
header (morale, volley, round cap 15, "wild fights keep the
believable flight", pack lead = world-monster entity). No canon
doc covers villager field-fight flee triggers in detail; the
mechanism below is read from fieldFights.js code, not invented
as canon. Steve's standing rule honored here: "It should be a
fight. A hard one." (2026-10-08) — the finish must be earned in
a fought round, not granted on sight.

## The rule, exactly (committed finish + survivability companion)

Location: the IN-ROUND break check ONLY (fieldFights.js, the block
`if (abBoundN <= 0 && (members[0].hp / members[0].maxHp) < mBreak)`
after the morale section, ~line 2000). mBreak is unchanged
(wave >= 2 ? 0.15 : 0.25). Tracking added: vMaxStrike = the largest
single villager strike damage dealt this fight (the else-branch
strike vd after all multipliers, before lead.hp subtraction);
vStruckThisRound = whether this round's villager strike dealt > 0.
Volley damage and ally strikes are EXCLUDED from vMaxStrike (the
finish is the lead villager's own proven blow, not the bow's
opening or a second pair of hands).

The override fires at a break check iff ALL of these hold:
1. members[0].hp > 0 (the lead is alive).
2. members[0].hp <= vMaxStrike — the monster is plausibly ONE
   strike from death, proven by this fight's own biggest strike,
   not by a hypothetical multiplier stack. (How the number is
   computed: base strike roll([4+wb, 8+wb]), wb = round(wbonus/2),
   then the engine's own multipliers — Aim 2.5x, Haymaker x2,
   Dead Aim x2 under 25%, Blood Trail +2, Stalk +4 round 1 — as
   actually rolled this fight; vMaxStrike is the observed max.)
3. vHp / vHpMax >= 0.60 — the villager is healthy enough.
4. rec.intent === 'engage' — committed, not learning. (A learn
   villager who flipped to engage on a good exchange counts:
   that flip IS a commitment, logged "Committing to the kill".)
5. vStruckThisRound — this round's strike landed damage. No
   trick-round conversions: a villager performing a trick instead
   of striking does not earn a finish.
6. !opts.noFlee — sealed arenas are untouched.
When it fires: rec.committedFinish = true, rec.committedRounds += 1,
log line "<Name> holds — <monster> is one blow from falling, and
they are still strong enough to finish it. (Committed finish)",
and the break check does NOT set mFlee and does NOT break — the
round loop continues. If the next strike does not kill, the break
check fires again and the override re-fires ONLY if all six gates
still hold (notably gate 3: HP back above 60% — field medicine's
once-per-fight +20 when hurt can re-earn it, honestly).

Survivability companion (same file, morale section): once
rec.committedFinish is true, at each subsequent round's morale
entry (after the vHp <= 0 death check, before other morale), if
vHp / vHpMax < 0.40 AND !opts.noFlee, the villager flees:
outcome 'vFlee', fleeHpFrac set, log line "<Name> is past holding
even a finished fight — they run while running still works.
(Committed-finish floor)", break. This overrides the winning
floor (winning sets fleeAt = 0.05): a committed villager holds to
40%, not to 5%. Normal morale (hopeless, floor, learn) still
applies on later rounds; the companion is additional, never a
replacement. Round cap 15 still ends the fight.

Explicitly UNCHANGED (narrowness, stated so the coordinator can
check the diff):
- The volley/contact break (pre-round, ~line 930): a beast met
  already below the line still flees on contact. The finish must
  be earned in a fought round; finishing wounded beasts on sight
  is a different, wider lever and is NOT built here.
- The cornered-hold branch, hogtie bind skip, arena (noFlee)
  handling, learn-withdrawal, hopeless flight, HP floor, trick
  exits, round cap, volley, strike formula, monster damage.
- No second-hostile gate is needed: the pack resolves through
  the lead by design (header: kill the lead and the pack
  dies/scatters), so gate 2 on the lead IS the pack gate.
- No other src/js file changes. No policy-default flips. No gate
  threshold or demand number moved anywhere else.

## Base pin (re-derived, never transferred)

- Worktree HEAD at prereg time: 00e1bd4dbe19b48a1c6532a7683dfa9df87244b2
  (Loop B 1630Z evidence commit). This base is NEWER than
  fieldkill-a's base (f536e3ad3 + instrument f24a4a6c9). Seed
  labels do NOT transfer across bases. Every judged JSON carries
  its anchorCommit. This arm judges ONLY its own two legs
  (baseline leg on this base, lever leg on this base + the rule
  above); fieldkill-a numbers are quoted as prior-base context,
  never as current data, and never judged against.
- The prereg commit itself touches only this evidence file, so
  the baseline leg's game code is byte-identical to the pin.
- Worktree: ~/workspace/worktrees/sim-fieldfinish2-a (branch
  sim-fieldfinish2-a). Main tree untouched.

## Seed plan (fixed now; no band-shopping)

- Pilot (8, = fieldkill-a's pilot set, for construction
  comparability, not value transfer): 87104, 87109, 87119, 87124,
  87140, 87115, 87123, 87127.
- Confirm (11, = the remaining fieldkill-a band seeds): 87103,
  87107, 87120, 87121, 87126, 87128, 87132, 87134, 87135, 87137,
  87138. Run ONLY if the pilot gate passes (below). No
  substitutions, no additions. Total judged band 19.
- Each leg (baseline, lever) runs the SAME seed set on its own
  code; judged comparisons are lever-vs-baseline on identical
  seeds, never against fieldkill-a's corpus.

## Policy stack (identical for both legs)

withFullseatDiag(withSeatDrive(withWinDefer(TF leadfeast))),
FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
FULLSEAT=1, 200 loop-days death-aware cap (harness Game.over
stop; dead villages stop simulating), PLUS the NEW recorder
scripts/policies/fieldfinish2-diag.js (FIELDFINISH2=1), wrapped
OUTSIDE fullseat-diag. The recorder is a copy of
fieldkill-diag.js with exactly ONE added captured field per
field-fight row: committedFinish (rec.committedFinish) and
committedRounds (rec.committedRounds || 0). It is policy-side
only, env-gated, pure reads + post-delegation recording, zero
game-state writes, zero RNG draws — the same purity contract as
fieldkill-diag. fieldkill-diag.js itself is NOT edited. Sweep:
scripts/fieldfinish2-sweep-20261031.js (copy of the fieldkill
sweep, recorder module + env name swapped, same stdout-only
I/O discipline + idle splitter pattern).

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
the recorder captures for every wave).

## GO thresholds (pilot — all four must hold; a miss is NO-GO)

- P1 (effect): converted field kills >= 2 band-wide (lever leg),
  vs 0 on the baseline leg (baseline has no rule, so its flag
  count is 0 by construction; the comparison that matters is
  lever >= 2 AND lever wave-3 field vKills > baseline wave-3
  field vKills).
- P2 (survival guardrail): median survival (gameDays) on the
  lever leg >= 0.8 x control median.
- P3 (death guardrail): field villager deaths (wave-3 field rows
  with outcome 'vDie') on the lever leg <= control + 3.
- P4 (scale guardrail): national-ever (seeds with national == 1)
  on the lever leg >= control - 2.
- Secondary, reported not judged at pilot: table-ever, wins,
  wave-4/5 reach, total villager deaths, killable-state
  conversions (committed fights that ended vKill vs mFlee vs
  vFlee), committed-fight outcomes (how many committed fights
  ended in a kill, a flight, a death, a round cap).

## Confirm gate

Confirm (11 seeds) runs ONLY if the pilot passes all four bars.
Confirm GO (judged over the pooled 19-seed band, lever vs
baseline on identical seeds): the same four bars, PLUS
confirm-only seeds (the 11) show converted field kills >= 1
(the pilot must not be a fluke). If confirm fails any bar, the
verdict is NO-GO at confirm and the game code is reverted (below).

## Det-gate (before judged sims are trusted)

- Recorder ON vs OFF on 2 pilot seeds (87104, 87127), same
  stack, same seeds, worktree scratch dirs (deleted before
  commit; NEVER /tmp, never the judged corpus): dayHash arrays
  + end fields (gameDays/won/national/table/maxWave/
  endScaleRank) byte-identical. A mismatch stops the run
  (killed-at-pilot on instrument grounds) until explained.
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
(village lost or won). Identical to fieldkill-a: wave-3 doors
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
fieldfinish2 instrument. The deviation is stated on the face of
the compare file. Contract metrics mapped where observable
(won, table, national, survival30/60, communityLost); the rest
null, never fabricated. The panel is the instrument; the GO
thresholds above are the judge. Pilot panel attached at pilot;
if confirm runs, the final panel is rebuilt over the full
19-seed band and attached to the evidence file. Compare output:
evidence/2026-10-31/sim-fieldfinish2-a-panel-compare.md (+ .json,
+ before/after panel .json.gz).

## Sense-testing (SENSE-TESTING LAW)

The evidence judges at least 2 converted-kill fight transcripts
(rec.log from the corpus, with rounds, wounds, intent, the
committed-finish line, and the killing blow) and at least 2
non-converted flights (a committed fight that still ended in
flight, and a break-line flight that did NOT qualify for the
override, with the gate that excluded it named) for meaning:
does the finish read as a believable decision by a healthy
fighter one blow from a kill, does the companion floor read as
a believable retreat, does any narration exist for it outside
the log. Counts alone do not pass this section.

## Wall numbers (on the judged band, both legs)

National / table / wins, wave reach (maxWave distribution,
wave-4, wave-5), median + max survival. Wave-1/2 reach is read
from maxWave (a seed with maxWave >= 2 reached wave 2; >= 1 is
trivially all seeds) and wave-3 reach from the daily w3rung
rows. Arc reach, four-realm formation, trap acquisition by
source, counter discovery rates, and young-link succession
survival are NOT in this corpus — reported as unmeasured, not
as zero.

## If NO-GO: revert completely

The game code is reverted so fieldFights.js is byte-identical
to base (verified with `git diff <base> -- src/js/fieldFights.js`
empty) before any landing commit; the killed arm leaves no
trace in src/. Evidence + corpora + panel are retained. The
instrument copies (fieldfinish2-diag.js, sweep, analyzer,
proof test) may be retained as measurement tooling ONLY if they
contain no game-code change — otherwise they are deleted too.
The evidence states the revert verification explicitly.

## If GO: landing

Each landing commit carries its own proof test + evidence
section, message includes [needs-eyes] (combat feel change),
and reports 'merged locally, pending ship' readiness (the
coordinator merges via --ff-only). Do NOT push, do NOT bump
versions, do NOT verify live.

## Metric review (carried, filled at evidence time)

- (To be filled from the run: did the one-strike gate
  (vMaxStrike) prove too narrow or too wide in practice, did
  the 60%/40% thresholds bind anywhere observable, did any
  committed fight end in a death (companion failure), did the
  contact-break exclusion leave a visible class of unfinished
  beasts, did the panel deviation behave, did the pilot gate
  behave.)
