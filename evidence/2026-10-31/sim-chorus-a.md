# sim-chorus-a — CHORUS-HOLD (BUILD GO: PILOT GO + CONFIRM GO, game code landed)

Run: Loop A worker, run fleshout-loop-a-20261101T0000Z, arm sim-chorus-a
(BUILD arm, axis scale-onramp, converging NOT converged). Sibling Loop B
live claim 2343Z (food-economy) NOT touched; no other worktree touched.
Main tree untouched. Prereg: evidence/2026-10-31/sim-chorus-a-prereg.md
(commit fee8fc4cbe90b18607ba3cb314116f0c85661222), written and
committed BEFORE any judged sims. Base pin 66239763c (current master
at arm start); judged comparisons are lever-vs-baseline on identical
seeds on this base, never against the twoblow corpora (different base).

## Question (from run 2156Z closeout)

Kate (87123 d75) and Gabriela (87123 d93) commit to a wave-3 finish
under the two-blow window, then the next round is a chorus downbeat
(dance) round and the fighter dances instead of striking, so the
beast flees (at 15 HP and 35 HP) — 2 of 6 committed fights lost this
way.

## Mechanism (read from code, verified against both leak transcripts)

The twoblow gate fires at the in-round break check and sets
rec.committedFinish, but committedFinish does NOT suppress later
break checks: every later round re-gates, and gate 5
(vStruckThisRound) fails on any round the fighter does not land a
lead strike. villagerTrickAction returns {type:'dance'} for
chorus_line on round % 4 when the village knows the trick; the
dance consumes the whole turn (no strike), and rec.trickDance is
cleared after the round's phases, BEFORE the break check. So:
commit round N, dance round N+1, break check re-gates, no strike,
beast flees. The companion 40% floor fires before the break check
and is unaffected; trick-aware morale does not flee these fighters
on dance rounds, so the break check is the sole leak point. The
beast's flee check DOES run on dance rounds in general; this arm
changes only the committed case.

## The fix (CHORUS-HOLD, src/js/fieldFights.js ONLY, +36 lines)

- Per-round local dancedThisRound, reset each round, set in the
  dance trick branch (rec.trickDance itself is already cleared by
  break-check time, so the flag is the honest carrier).
- At the break check, BEFORE the twoblow gate: if
  rec.committedFinish AND dancedThisRound AND beast alive AND
  !opts.noFlee, the beast does NOT flee: log line "holds through
  the downbeat — … is still two blows from falling, and the dance
  was the price of staying in it. (Committed finish, chorus hold)",
  rec.chorusHoldRounds += 1, loop continues. The twoblow gate is
  wrapped in the else branch, byte-identical in behavior when the
  hold does not fire.
- Why dance-only, not general persistence: a general "committed
  never flees at the break check" would also hold through
  0-damage strikes, shouts, waits and other non-strike rounds —
  a wider change than the leak justifies. The dance hold is
  bounded: dance rounds occur at most every 4th round, the next
  round is a strike round, twoblowLast is NOT reset by a dance
  round so the gate re-fires there, and a 0-damage strike there
  still lets the beast flee honestly. The fighter still pays the
  dance round (no strike, no damage); the kick is avoided only
  because they danced. The chorus's design is respected, not
  overridden — no strike is forced through a dance round.
- NOT re-opened: the 60% HP gate, the break line (0.15), the 40%
  companion floor (fires first if breached), the committed-finish
  NO-GO, sealed arenas (!opts.noFlee required). The hold requires
  a PRIOR commitment, so it never creates one and never relaxes
  any gate; persistence does NOT re-impose 60% (a fighter who
  committed at >= 60% and then took damage holds through the
  dance down to the 40% floor). Round cap 15 still ends fights.
- Proof test scripts/test-chorus-20261031.js: 73/73 after both
  pilot corpora landed (49/49 before lever corpus existed).
  Engine legs: 1100 hold fights (1049 vKill, 51 honest later
  mFlee — H3 rules out any hold-round flight); every hold
  follows commit < dance < hold; spool negative: 0 holds.
  Proof-test bug caught and fixed mid-run (not hidden): the
  first version re-captured base items after the godslayer loop,
  stacking both weapons on the fighter so beasts died before
  any round-4 dance (0 holds despite 4214 commits). Fixed by
  capturing pristine bases once; the hold then fired immediately
  (debug trace: commit R3, dance R4, hold, strike R5, re-commit,
  kill R6).

## Numbers, identical seeds, per-band never pooled

Policy stack both legs: withFullseatDiag(withSeatDrive(
withWinDefer(TF leadfeast))), FEASTSCALE_R13=1 TRIBFLOOR=1
WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1, 200 loop-days
death-aware cap, twoblow-diag recorder (unchanged). Instruments:
chorus sweep/split/analyzer/panels (copies of twoblow's, name
swapped, plus leak/hold counts; classifier verified 2/2 on the
old twoblow corpus — Kate d75/15 HP, Gabriela d93/35 HP — before
any judged sim).

Det-gate: recorder ON vs OFF on 87104, 87127 — dayHash arrays +
end fields byte-identical both seeds (DET-GATE PASSED, re-proven
on this base). Corpus determinism: judged lever s87123 re-run
to a worktree scratch dir — hashes IDENTICAL (115 vs 115), end
fields IDENTICAL, file size identical (245008 bytes).

- Pilot (8 seeds: 87104, 87109, 87119, 87124, 87140, 87115,
  87123, 87127) — ALL FIVE PREREG BARS PASS:
  - P1: baseline leak 2 (>= 1, reproduces on this base) ->
    lever leak 0. PASS.
  - P2: converted field kills 1 -> 2 (lever >= baseline). PASS.
  - P3: committed-fight deaths 0 -> 0. PASS.
  - P4: median survival 119.5 -> 121d (bar >= 107.55). PASS.
  - P5: wave->=3 field deaths 4 -> 4 (bar <= 7). PASS.
  - Pilot band: national 7/8, table 7/8, wins 7/8, wave-4 5/8,
    wave-5 0/8, full seat 0 — IDENTICAL both legs. Committed
    fights 3 -> 2 (1 kill -> 2 kills, 0 deaths); chorus holds
    0 -> 1 (vKill). Only seed 87123's trajectory diverges
    (other 7 seeds' per-seed files byte-identical) — the Kate
    kill changes the village's downstream story, so Gabriela's
    later fight does not recur in the same form on the lever
    leg. The judged leak metric is therefore 0 dance-lost
    committed fights anywhere on the lever leg, not "both
    named fights re-fought and held": the second leak case is
    removed by trajectory divergence after the first
    conversion, which is a lever effect, not a missing
    measurement. Stated plainly so the coordinator does not
    over-read "2 -> 0" as two re-fought holds.
- Confirm (12 fresh seeds: 87142-87153) — ALL FIVE BARS PASS
  AS WRITTEN, with a disclosed vacuity (below):
  - Leak 0 -> 0; converted 0 -> 0; committed deaths 0 -> 0;
    median 118.5 -> 118.5d; wave->=3 field deaths 3 -> 3;
    national 8/12, table 9/12, wins 8/12, wave-4 7/12, wave-5
    0/12, full seat 0 — identical both legs. All 12 per-seed
    files are byte-identical between legs (modulo the
    anchorCommit stamp). The lever is exactly inert where no
    dance-round commit occurs — the narrowness proof.
  - Vacuity, disclosed not hidden: the confirm band contains
    ZERO chorus-leak opportunities (only 1 committed fight
    in 12 seeds, a spool floor flight on 87146, not a chorus
    fight). Confirm therefore proves no-harm + narrowness, NOT
    an independent effect replication. The effect replication
    is the pilot (leak 2 -> 0, hold -> kill) plus the 1100-fight
    engine proof. A future arm that wants confirm-band effect
    replication would need seeds screened for committed chorus
    fights — that screening would itself be selection on the
    outcome, so it is NOT recommended; the pilot + engine
    proof is the honest evidence for this narrow fix.
- Pooled 20 (judgement pooling only): leak 2 -> 0; converted
  1 -> 2; committed fights 4 -> 3 (3 kills, 1 floor flight);
  committed deaths 0 both; wave->=3 field deaths 7 -> 7;
  national 15/20, table 16/20, wins 15/20, wave-4 12 -> 12,
  wave-5 0 both, full seat 0 both. Wall UNCHANGED: full seat 0
  and wave-5-reached 0 stand on both legs — this is a
  two-fight leak plug, not a scale-wall movement, and none is
  claimed.

Confirm-baseline method disclosure (twoblow precedent, kept
here): the confirm baseline ran on fieldFights.js temporarily
restored byte-identical to the prereg base (diff vs 66239763c
empty, CHORUS-HOLD grep 0, hash c89e30a1… matches the base
blob), then restored from the lever backup and hash-verified
(hash 01de4270… = HEAD db4cd9628's blob, CHORUS-HOLD grep 5).
The confirm JSONs' anchorCommit records the then-current HEAD
(the fix commit), so this evidence text — not the JSON anchor
— is the authority for which code the baseline-confirm leg ran
on. Baseline pilot ran on prereg-commit code, so its anchor is
exact.

Panel (§15): evidence/2026-10-31/sim-chorus-a-panel-compare.md
(+ .json, + before/after .json.gz): review_required
(screen-only conservatism, same as twoblow) with every mapped
metric delta exactly 0 and no regression signal. Panels built
from sweep corpora (twoblow precedent) because the official
driver cannot express this stack; deviation stated on the face
of the compare file. The panel is the instrument; the prereg
thresholds above are the judge.

## Sense-reads (plain words)

- Baseline Kate (87123 d75): nine steady strikes, holds twice
  ("two blows from falling"), dances R8 — and the beast walks
  away at 15 HP. As a story it is a failure, not a decision:
  she did everything right, dodged the kick exactly as the
  chorus demands, and lost the kill to a bookkeeping rule.
  The dance-then-flee does NOT read sensibly — the dance was
  defensive, not a retreat.
- Baseline Gabriela (87123 d93): same shape, twelve rounds,
  holds R11, dances R12, beast walks at 35 HP. Same verdict.
- Lever Kate (87123 d75): identical through R7, R8 dances
  (kick catches air, 30 avoided), then the new line — "holds
  through the downbeat — Chorus Line is still two blows from
  falling, and the dance was the price of staying in it" —
  then R9 strikes for 20 and the lead falls. This reads as a
  fighter's decision: dodge the kick, hold your ground, finish
  next blow. The one loose phrase, noted honestly: at 15 HP
  with ~20-damage strikes she was really ONE blow from falling,
  and the hold line says "two blows" — it inherits the commit
  line's window phrasing (the two-blow window that qualified
  her), not a fresh prediction. Same looseness already lived
  in the twoblow commit line; the hold line does not invent a
  new one. Worth a wording pass someday, not a rule failure.
- Lever Emma (87124 d33, unchanged control): the textbook
  twoblow kill, byte-identical file on both legs — the hold
  touches nothing where no dance round intervenes.
- Confirm band: no committed chorus fights exist to read on
  either leg (1 committed fight total: the 87146 spool floor
  flight, a believable retreat at the 40% floor, unchanged by
  the lever). That absence is the confirm story, stated
  rather than padded with unrelated transcripts.
- Narration outside the log: none for the hold (same as the
  commit — fight-log only, as with twoblow). No new narration
  lie introduced: the R8 log order (dance line, then kick
  lands, then "kick catches air") is pre-existing baseline
  ordering, unchanged by this arm.

## Check suite (resolved, not waived)

check.js --quick, run twice (626s, 616s): 284 passed, 6 failed,
both runs. The 6 are EXACTLY the pre-existing set from the
twoblow run (measurement-proof-update, measurement-workflow,
mobile-combat-cadence, occupation-panels, phone-frame-proof,
establishment-r20) — none names field fights, chorus, or
twoblow. Re-verified for THIS arm, not just inherited: all 6
were re-run individually on fieldFights.js restored
byte-identical to base 66239763c and fail identically there
(exit 1 each), then the lever file was restored and
hash-verified against HEAD db4cd9628. Pre-existing base debt;
none is caused by CHORUS-HOLD.

## Metric review (mandatory, §14)

- Prereg judged as written; no metric re-scored mid-run.
  Pilot passes all five bars; confirm passes all five bars
  as written, with the confirm-band vacuity disclosed above
  (baseline leak 0 on confirm seeds) rather than claimed as
  effect replication.
- The leak definition (log-structural: commit line followed
  by a dance line, ending mFlee) proved robust: it found
  exactly the 2 known fights on the old corpus, 2 on this
  base's baseline pilot, 0 on the lever pilot, 0 on both
  confirm legs — no false positives (the spool floor flight
  is not a leak; non-committed dance-round flights are not
  leaks).
- The hold fired exactly on dance rounds and nowhere else:
  12/12 confirm seeds byte-identical between legs, 7/8 pilot
  seeds byte-identical, proof-test spool negative 0 holds.
- No hold fight ended in a death (committed deaths 0) or a
  round cap in the judged corpora; the 51 engine-proof
  mFlee holds are honest later flights (strike after hold
  asserted, no hold-round flight).
- Open wording note (not a bar): the hold line's "two blows"
  phrasing inherits the commit window; at very low beast HP
  it overstates the remaining blows. A future narration pass
  may sharpen it; the rule itself is unaffected.

## Landing

Game code: src/js/fieldFights.js ONLY (+36 lines). Commit
carries [needs-eyes] (combat feel). Proof test + instruments
committed alongside. Report: 'ready to merge, pending
coordinator' readiness (coordinator merges via --ff-only).
Do NOT push, do NOT bump versions, do NOT verify live.
Index clobber hit every safe-commit on this worker (known
2026-10-22/23 class, including an MM variant on the fix
commit where the worktree hash already matched HEAD); every
commit verified correct and the index repaired via --add
--cacheinfo from HEAD blobs before continuing — flag to the
ship loop as a recurring infrastructure wart, not a data
problem. No SIGTERM this run.

## Wall numbers (per-band, never pooled)

- Pilot: national 7/8, table 7/8, wins 7/8, wave-4 5/8,
  wave-5 0/8, median 119.5 -> 121d, full seat 0 — identical
  wall on both legs except median.
- Confirm: national 8/12, table 9/12, wins 8/12, wave-4 7/12,
  wave-5 0/12, median 118.5d, full seat 0 — identical both.
- Pooled 20: national 15/20, table 16/20, wins 15/20,
  wave-4 12/20, wave-5 0, full seat 0. Scale-onramp stays
  converging (NOT converged): a real leak plug landed, but
  no wave-5 or full-seat reachability shown. Food-economy
  untouched (sibling Loop B lane).

## Village assessment (plain words)

The village's fighters no longer lose a finished fight to the
music. A healthy fighter who has already proven she can cover
the beast's remaining health, and who dances on the downbeat
because that is what the Chorus Line demands, now holds her
ground through the dance and finishes the next round — and a
fighter who is already hurt still correctly walks away at the
40% floor. Nobody died because of the new rule in 20 seeds.
Outside the two pilot fights, nothing changed at all: on 19
of 20 seeds the village's story is byte-identical with or
without the fix, which is exactly how narrow a leak plug
should be.

## Blanks filled or documented

- FILLED (landed): the chorus-downbeat leak — committed
  fights lost to a dance round go 2 -> 0 on the pilot, with
  the Kate fight converting to a kill.
- DOCUMENTED (not built here): (1) the hold line's "two
  blows" phrasing overstates remaining blows at very low
  beast HP — narration wording for a future pass, not a
  rule change; (2) confirm-band effect replication would
  need outcome-screened seeds and is not recommended (see
  confirm vacuity note).
- NOT re-opened: the 60% HP gate, the break line, the 40%
  companion floor, the committed-finish NO-GO, sealed arenas,
  the chorus dance rule itself, any other gate threshold.
