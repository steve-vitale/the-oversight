# Pre-registration — sim-curiousw4-a (Loop A 20261103T0518Z)

Axis: scale-onramp. Arm question: does escalating the curious
default for wave 4 convert the known wave-4 deed gap into wave-4
deeds? Context: wave-4 patrols were KILLED
(evidence/2026-11-03/wave4seek-results.md — variant fought fewer
wave-4 kinds than baseline, baseline premise false) and lingerer-
sortie v1 was KILLED (evidence/2026-11-03/sim-sortie-b.md — delta 0
on seeds-with-wave-4-fought, cost leg failed). This arm is the
curious-default escalation ONLY — it is NOT bundled with feast-draw
rates or sortie changes, and it does NOT repeat patrols or sortie
answers.

## Grounding: why the literal ask-escalation is ungroundable, and what the closest grounded knob is

The curious default in the baseline stack is the ASK ABOUT BEAST
TRICKS block in scripts/policies/competent.js (daily, once per day):
when `Game.counterTeachable()` returns a type, the player asks a
villager about 'beasttricks' and learns that type's counter. Three
code facts, all verified before this prereg was written, close the
literal reading of "ask more about wave 4":

1. `counterTeachable()` (src/js/game.js) iterates `data.monsters`
   and returns only a type that carries a `counter` field and is not
   yet known. Verified against src/data/monsters.json: ALL wave 3–5
   types carry NO `counter` field (9 wave-3, 10 wave-4 including
   herald, 10 wave-5 entries — counter False for every one). The
   askAbout 'beasttricks' topic therefore can NEVER teach a wave-4
   trick, no matter how often it is asked. Asking harder is asking
   about older beasts.
2. Wave-4 trick knowledge lives in a different channel:
   `villagerTrickDefs()` (game.js) holds a counterplay entry for
   every wave-4 type, and `_trickObservation()` banks it after TWO
   survived encounters (scholar: tb fight ending fled / routed /
   calmed with the scholar alive and the beast alive; villager:
   field fight ending vFlee / mFlee / evade). No askAbout topic
   touches this channel. The only policy-side way curiosity converts
   into wave-4 counter-knowledge is surviving wave-4 fights — and
   then USING what is learned.
3. The baseline already asks once per day whenever a teachable type
   exists, so there is no unasked queue for an escalation to drain
   after wave-4 unlock; and a wrapper cannot re-ask on its own
   without picking a villager from a roster-style list, which the
   perception law (below) forbids this policy file from doing.

THE KNOB (one, policy-side only, zero src/js changes): escalate the
curious default from ASKING at the fire to EXPERIMENTING in the
fight. Once wave 4 is unlocked, in a player turn-based fight that
contains a live wave-4 monster, the variant presses the fight's OWN
signature verbs — the buttons the phone itself shows for that fight
(`Game.sigW4CombatButtons()`, the capable.js-proven pattern: parse
the enabled buttons, press by priority, never a disabled button) —
instead of the baseline's generic strike that turn. This is the
curiosity the game affords for wave 4: the verbs ARE the offered
tricks (refuse the Congregation, contradict the Eulogy, tank the
Algorithm, leave the Suburb, meet the Strike's demand, out-
entertain the Influencer, read the Audit's clipboard, poison the
Eater's meal). Pressing one is trying the trick; surviving the
fight banks the observation (fact 2); a learned trick then changes
later fights. The baseline competent fight() never presses any
sigW4 verb (verified: zero sigW4 references in competent.js) — the
buttons are UI-only for this stack, exactly as the sortie button
was UI-only before the sortie arm. This arm is NOT a fight-tactics
rework: it changes nothing about assessment, fleeing, strikes, or
abilities — the base fight runs whenever no sig verb is pressed,
and the base mid-fight eject and start-of-fight walk-away are
untouched.

Verb set and caps (capable.js's wave-4 priority subset, verbatim
priorities, per fight): tbCongRefuse [9, cap 1], tbCongHeresy
[8, cap 2], tbStrikeMeet [9, cap 2], tbInflOutentertain [6, cap 2],
tbAuditRead [5, cap 1], tbSuburbLeave [8, cap 4], tbSuburbRest
[7, cap 2, only when scholar HP < 50%], tbEulogyRewrite [10, cap 1],
tbEulogyContradict [7, cap 4], tbAlgoTank [6, cap 2], tbEaterPoison
[7, cap 1]. Deliberately NOT pressed: tbCongAccept (takes the geas),
tbStrikeScab (not in capable's preference table), tbSuburbAlive
(raises the fight's damage). No RNG is consumed by the layer
(priority order is fixed; ties keep first-seen order). The layer
fires only when: a live wave-4 monster is in the current fight,
it is the player's turn, the scholar has not acted this turn, and
wave 4 is unlocked (a wave-4 fight implies this; the check is still
made). If the pressed verb does not spend the turn (e.g. a read),
the layer falls through to the base fight the same turn.

## Primary metric

Distinct wave-4 monsters fought per seed = count of deed-feed
(`Game.deedState().wavesFaced`) entries whose wave is 4 at run end.
Judged quantity: number of pilot seeds with >= 1 distinct wave-4
fought, variant minus baseline, on identical seeds. A fight counts
when the engine records it (recordDeedFight on real blow-by-blow
fights; fled fights count — the deed is "faced", not "killed").

## GO threshold (binds the run, MEASUREMENT.md §14)

GO iff BOTH:
  (a) seeds-with->=1-wave-4-fought: variant minus baseline >= +2, AND
  (b) the cost bar is clean, all three legs:
      1. total starvation deaths (deaths in the harness death stream
         whose cause mentions starvation or hunger, summed over the
         pilot): variant <= baseline + 2;
      2. fighter-attributed arm deaths: scholar deaths (death-stream
         entries with the player flag) that occur inside a fight in
         which this layer pressed a signature verb, counted by the
         driver's tele-wrap keyed to sig-pressed fight ids (NOT by
         game day — the sortie-b metric review forbids day-joining:
         the death stream carries no sig-specific cause value for
         turn-based fights, its tb deaths read generic 'combat', so
         fight identity + the player flag is the attribution the
         stream actually supports): <= 2 across the pilot;
      3. median survival (game days at run end): variant >= 0.8x
         baseline median.
Anything else = KILLED. A miss is NO-GO, never re-scored against a
friendlier metric mid-run. If KILLED: DELETE the policy file and
the proof test, keep prereg + driver + per-seed JSONs + compare +
evidence, report KILLED with the numbers. Descriptive only, never
judged: total distinct wave-4 kinds, wave-4 kills by path, sig-verb
uses, wave-4 villagerTricks learned, wave-4 observation counts.

## Horizon + why

180d death-aware cap, matching the prior closecommit bands. Dead
villages stop simulating (harness runDays ends at over/village-
lost); no fixed-200d tail. 180d covers the national/wave-4 window
with room for sig-pressed wave-4 fights to accumulate after unlock.

## Seeds (pilot)

98501–98508. Freshness: verified by exact-token grep before any
judged sim (tracked scripts/ + evidence/: no prior judged sim-seed
use; see the freshness note below). If any seed had shown prior
judged use, the band would have fallen to 98601–98608 and this file
would have been amended BEFORE any judged sim runs.

Freshness note (filled before commit): the scripts/ hit for the
9850x tokens is only scripts/sortie-prereg-20261103.md, which names
98501–98508 solely as its own conditional fallback band that was
never triggered (that arm ran 98401–98408). Evidence/ hits are the
known false-positive class (pantry-kcal values, float fragments,
hashes, counts inside long JSON lines — inspected, not seeds; no
seed field, SEEDS list, seed filename, or seed mention). No seed
showed prior judged use, so the band stands.

## Policies (POLICY-SIDE ONLY, zero src/js changes, zero default flips)

- BASELINE ("closecommit"): the verbatim stack from
  scripts/fightoutcome-driver-20261102.js — tribfloor leadfeast +
  windefer + seatdrive + fullseat-diag + titanroute + musterclose +
  mustergap. Env: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1
  SEATDRIVE=1 FULLSEAT=1 HERALD=1. Mode herald. One process per seed.
- VARIANT ("closecommit+curiousw4"): baseline + ONE new policy
  file, scripts/policies/curiousw4.js (`withCuriousW4` wrapper). It
  overrides ONLY fight(): on a player turn in a fight containing a
  live wave-4 monster, it parses the fight's own enabled sigW4
  buttons and presses the highest-priority unpressed verb within
  its per-fight cap (above); otherwise it delegates to the base
  fight byte-identically. It touches no daily, upkeep, travel,
  feast, sortie, or deed-seeking behavior, and it consumes no RNG.

## Perception-law compliance (hard constraint, Steve 2026-10-28)

The layer decides ONLY from:
  1. The fight the scholar is standing in (`Game.tbfight` — the
     player's own senses, by definition) and the live monsters in
     it, read off the fight's own fighters.
  2. The fight's own offered buttons (`sigW4CombatButtons()` — the
     exact affordance the phone shows the player for this fight).
  3. The village's OWN knowledge/deed record (unlockedWave(),
     deedState().wavesFaced) and its own day / game-over guards.
It NEVER reads any monster roster, position, or link list, and
never calls any engine helper that returns one. Compliance is
proven by a proof test with two legs: (a) a source scan of the
policy file for the forbidden roster/position API tokens (the
policy file itself contains none of them, not even in comments);
(b) a determinism leg (stub-Game: an enabled sig verb is pressed
exactly once per fight up to its cap, a disabled button is never
pressed, a wave-3-only fight is untouched, and no random call is
made).

## Secondary measures (descriptive, never judged)

Per seed, both arms: sig-verb uses by verb (variant only; baseline
is structurally zero — the layer is absent), distinct wave-4
fought, wave-4 kills by path (kill-ledger `via`, kills only),
wave-4 villagerTricks learned + villageCounterObs counts for wave-4
types at run end, plus the standard wall numbers
(national/tableWaiting/tableDone/wins, wave reach, median
survival, death causes, starvation counts, scholar deaths).
Table flags use the landed split helper
(scripts/fightoutcome-tableflags.js): tableDone = seat taken, never
the collapsed latch.

## Comparison instrument

Balanced panel (scripts/balance-panel.js) §15: NOT applicable to
this comparison as built — POLICY_REGISTRY in
scripts/sweep-compare.js contains neither the closecommit stack
nor the curiousw4 wrapper, and editing the observer to admit them
would change the instrument mid-comparison. The judged comparison
is therefore the identical-seed driver table
(scripts/curiousw4-driver-20261103.js), with per-seed wave-4
counts for both arms, attached as
evidence/2026-11-03/curiousw4-compare.md. This limitation is stated
here, before any sim, not discovered after.

## Sense-testing (SENSE-TESTING LAW)

Read at least one sig-verb wave-4 fight transcript (or, if no sig
verb ever fires, one wave-4 fight stretch) from the kept say
transcript, and judge meaning, coherence, consequences — not just
counts.

## Metric review

(To be filled at closeout. A miss here is NO-GO; a wrong metric is
proposed for the NEXT run, never re-scored in this one.)
