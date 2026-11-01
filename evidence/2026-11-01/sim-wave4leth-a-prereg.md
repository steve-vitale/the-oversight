# sim-wave4leth-a — PREREGISTRATION (binding, committed BEFORE any judged replay)

Run: flesh-out loop (loop A), run fleshout-20261101T... (coordinator-assigned).
Axis: scale-onramp (blocking axis, NOT converged). Worker: sim-wave4leth-a.
Task: WAVE-4 FIGHT LETHALITY decomposition — the 1235Z next blank (5).
DIAG ONLY: zero src/js changes, no game-code change, no balance lever, no
policy-default change. Instrumentation/census/analyzer only.

## Sharpened against, not a repeat of

- Findings entry "MUSTERED PARTIES ARE NOT THE KILLERS" (loop-A arm
  sim-sortiedpr-a, evidence/2026-10-28/sim-sortiedpr-a.md, DIAG-GO): 60
  played sortie fights, median sustained DPR 16.0; kills 35 all of beasts
  starting <=64 HP; healthy beasts >=91 HP: 0 kills in 12 fights; wave-4
  sorties 0 kills / 0 drive-offs in 7 fights, 4 leader deaths; joined-ally
  rate 13%; ally damage share 2.2%. This arm does NOT re-measure sortie
  median DPR. Its yardstick is adopted verbatim: a future staying/morale
  arm must beat 16.0 DPR by ~3.6x and convert the healthy-beast slice at all.
- Findings entry "DAMAGE HAS NO NARROW EXISTING-SYSTEM WIRING TO 57–80
  SUSTAINED DPR" (loop-A arm sim-fieldability-a, evidence/2026-10-28/
  sim-fieldability-a.md, DIAG-GO): the 57–80 kill band and the 15-round
  cap frame this arm's cap-fit reading. Its "2 allies 9.0" component is
  already known unfieldable (allycap-a, 2026-10-31: second-ally entries
  0/96); this arm measures the cap as a constraint (joined fighters
  actually fielded), it does not re-litigate it.
- (Note on numbering: the task cited findings entries #1369 and #1383;
  sim-findings.md carries no numeric IDs, so the two entries above are
  identified by their content — the sortie-DPR entry quotes #1383's
  numbers exactly, and the fieldability entry is the 57–80 yardstick
  source. If the coordinator's numbering maps differently, the content
  identification above is the binding reference.)

## Canon read first

docs/CANON.md, then docs/MONSTER-WAVES.md (wave law; wave-4 band
damage 35–95, HP 850–1500, pierce 0.2–0.5) and docs/PARTY.md (party
concept: people follow or don't, based on trust and their own goals;
no trust gate on invites; partyMax 3→4→5 by day). No canon doc covers
wave-4 fight lethality decomposition — definitions below are derived
from code mechanisms (fieldFights.js fieldFight record), stated exactly
so they can be checked:
- fieldFight returns { outcome, rounds, vTaken, mDealt, vHpLeft, mHpLeft,
  allyDealt, allyTaken, allyVid, calledHelp, everHopeless, fleeHopeless,
  fleeHpFrac, minHpFrac, log[] }. Outcome vocabulary: 'evade' |
  'vKill' | 'mFlee' | 'vFlee' | 'vDie' | 'alreadyDead' (+ round-0 volley
  variants of vKill/mFlee). vDie means the LEADER died (vHp <= 0 breaks
  the round loop); vKill means the beast died.
- The engine fields leader + at most ONE joined ally (allycap-a): an
  ally joins only via allyFromStart (aid fights) or the hopeless shout
  (one ally, shift once, intent !== 'learn'). Mustered size (engineAllies
  + 1) and joined fighters (1 + joinedAllyVid ? 1 : 0) are reported
  separately, always.
- Ally death is NOT a fieldFight record field. It is derived in this
  arm's wrapper ONLY from rec.log: the joined ally's name (via
  Game.displayName(rec.allyVid)) and the last "hits <allyName> for X
  (N left)" line — allyHpLeft = N, allyDied = (N == 0). If no such line
  exists the ally was never struck: allyHpLeft = null (unstruck), never
  guessed. Leader death needs no parse: outcome === 'vDie'.

## Corpus: ALL wave-4 fights, not just sorties

Primary corpus: every fieldFight with wave == 4 on the band below, as
recorded by scripts/policies/fieldparty-form-diag.js reused VERBATIM
(never edited) — its meeting rows already carry wave, caller, outcome,
rounds, mDealt, mHpStart, mHpLeft, vTaken, allyDealt, allyTaken,
joinedAllyVid, engineAllies, allyVids, leader armed/armorP, readiness,
trickKnown, cornered, everHopeless, fleeHopeless. This arm's wrapper
(scripts/sim-wave4leth-a-sweep.js) adds per fight, recorder-only: wave
(replicated waveOf: Game.crisisWaveOf else data/monsters def wave),
vHpLeft, minHpFrac, fleeHpFrac, allyHpLeft/allyDied (log parse above),
volley damage (round-0 log lines parsed; volley lines are the pre-round
shots — stated approximation, counted separately), ability-note
inventory (parenthetical ability tags on strike lines, e.g. HAYMAKER,
dead aim, Broadcast — qualitative, damage stays in the fighter's share),
pantry kcal at fight start (food-state proxy; a direct per-fighter
fed/feast read does not exist in the recorder surface, so pantry kcal
is the stated proxy, NOT claimed as a fed flag), and the full rec.log
for sense transcripts (kept only for wave-4 fights).
- Caller classes reported separately, never pooled silently: sortie,
  aid, wild/field (all other callers), raid. The headline decomposition
  pools all wave-4 fights AND breaks out by caller.
- Round-0 fights (volley kill / drive-off before round 1) are one-shot
  events: counted in end-states, EXCLUDED from sustained-rounds
  distributions, listed separately.

## Definitions (fixed BEFORE counting)

- END-STATE per fight: KILL (vKill) / DRIVE-OFF (mFlee) / FLED (vFlee) /
  DIED (vDie, leader died) / EVADE (evade) / OTHER (alreadyDead or any
  other outcome; must be listed, never folded into a neighbor).
- PER-ROLE DEATH: leaderDied = outcome vDie; allyDied = log-parse above
  (only when an ally joined); beastDied = outcome vKill. Death rate per
  role = deaths / fights in which that role was present (ally rate
  denominator = fights with a joined ally only).
- KILLER SURVIVAL: on every KILL fight AND every SERIOUS-WOUND fight,
  record leader-alive-at-end (outcome !== vDie) and ally-alive-at-end
  (ally joined AND NOT allyDied). SERIOUS WOUND = mDealt >= 200 OR beast
  ends at <= 50% of mHpStart (mHpLeft <= 0.5 * mHpStart), on fights with
  mHpStart >= 100 (so the already-dying lingerer population cannot
  inflate the slice — the #1383 healthy-beast cut, restated).
- STAY vs FLEE: rounds-to-flee = rounds on vFlee fights; rounds-to-death
  = rounds on vDie fights; rounds-survived distribution by end-state;
  flee mechanism split where recorded: fleeHopeless vs fleeHpFrac floor
  vs fleeLearn vs round-cap end (rounds == 15 with no kill — the cap
  end, named, not folded into "fled").
- KILL CONCENTRATION: per fight, leaderShare = (mDealt - allyDealt) /
  mDealt, allyShare = allyDealt / mDealt, volleyShare = volleyDmg /
  mDealt (mDealt > 0 only); top-fighter share = max(leaderShare,
  allyShare) with volley folded into the leader share for the
  two-fighter view and reported separately for the three-way view.
  Concentration verdict: CONCENTRATED if median top-fighter share >=
  0.9 on serious-wound/kill fights, SPREAD otherwise. Ability-note
  inventory is qualitative context, never a damage split.
- ENGINE CAP (measured, not assumed): joined-fighters distribution
  (1 vs 2), engineAllies distribution, shoutJoined rate
  (calledHelp && !allyFromStart), and the gap mustered-size minus
  joined-fighters per fight.
- CONTEXT per fight: mustered size, joined fighters, leader armed /
  armorP, village readiness (armed/armored/tricks/veterans), trickKnown,
  cornered, pantry kcal at fight start, mHpStart band (<=64 / 65-90 /
  >=91, the #1383 cuts, plus the wave-4 canon band 850-1500 noted
  separately — lingerer beasts carry wound history, so mHpStart is the
  fought HP, never the species max).

## Band (identical seeds, same substrate, base code)

Substrate VERBATIM from sim-sortiedpr-a PLAYED band (the band already
known to produce wave-4 fights — 7 wave-4 sorties on its pilot, so this
pilot is not contact-starved by construction): scripts/policies/
tableseat-nowait.js, LEANLINKRESCUE=1, TABLESEATNOWAIT=1, 180d
death-aware (runDays stops on death/win; +10d tail max),
scripts/policies/fieldparty-form-diag.js reused VERBATIM, plus the
sortiedpr PLAYED sortie-driver layer living ONLY in this arm's sweep
script (once per lingerer episode, when a gorge line has been seen,
call answerLingerer('sortie'); NO HP GATE). The driver is what produces
wave-4 sortie contacts; natural wave-4 field/aid/raid fights on the same
seeds are recorded with no driver involvement and reported by caller,
so the driver effect is visible, not hidden.
- Seeds: PILOT 75101–75108 (8 seeds). CONFIRM: none planned — DIAG arm;
  if the pilot yields too few wave-4 fights to classify, the verdict is
  INSUFFICIENT-DATA (below) and the run stops; no confirm band is burned
  on a fight-starved base.
- Policy statement: competent-player policy = tableseat-nowait (the
  loop's competent substrate). What party/gear it fields is MEASURED,
  not assumed: per-fight leader armed/armorP + village readiness are in
  the corpus; no gear is granted by this arm.

## Bars (judge against this header; a miss is DIAG-NO-GO, no re-scoring)

- CORPUS-VALIDITY: 8/8 pilot rows, days > 0 each, fieldparty diag errs 0,
  overflow 0, wrapper errs 0.
- END-STATE-COMPLETE: 100% of wave-4 fights in the band end-state
  classified (shares sum to 1.0; OTHER listed with counts, never 0
  by assumption).
- KILLER-SURVIVAL-RECORDED: on every kill AND every serious-wound
  fight, leader-alive and ally-alive recorded (no missing values; an
  unjoined ally is "no ally", not "alive").
- PILOT GATE / INSUFFICIENT-DATA: if fought wave-4 fights (rounds >= 0,
  any end-state except evade... evade counts as offered-not-fought and
  is reported separately) number < 8, verdict is INSUFFICIENT-DATA with
  opportunity counts: seeds reaching wave 4, wave-4 fights offered
  (evades + fought), wave-4 fights fought, by caller. The run stops;
  no confirm spend. (Anchor: #1383's 7 wave-4 sorties alone would NOT
  clear this bar — the all-caller corpus must exceed it, or the
  insufficiency is itself the finding.)
- DIAG-GO: corpus valid AND end-state complete AND killer-survival
  recorded AND >= 8 fought wave-4 fights AND >= 1 wave-4 fight
  transcript read + quoted AND one ranked next step named with numbers.
  Fewer than 8 fought wave-4 fights with > 0 present -> INSUFFICIENT-
  DATA as above (not a partial GO). Zero wave-4 fights fought ->
  INSUFFICIENT-DATA with opportunity counts (seeds reaching wave 4
  reported; zero reach = SUBSTRATE-EMPTY note, not a kill).
- WALL NUMBERS per band (reported, never claimed as movement):
  national ever/final, table invited/entered, wins (lesser/full),
  wave 4-5 reach, median survival, death-cause shares, starvation count.

## Sense-testing law (transcripts read + quoted)

- S1: up to three wave-4 fight transcripts from the pilot corpus, chosen
  by end-state priority: a DIED fight first, then a FLED fight, then a
  serious-wound or KILL fight if one exists. Each quoted with its
  end-state, rounds, damage shares, and per-role survival, and judged:
  do deaths/flees read as desperate and traumatic (Steve's hard rule:
  violence desperate and traumatic) or as silent arithmetic (a line
  count with no human stakes)?
- SENSE VERDICT categories: DESPERATE (deaths/flees carry human stakes
  in the lines) / MIXED / SILENT-ARITHMETIC (outcomes happen without
  any line a player would feel). If no wave-4 fight exists to quote,
  the sense leg FAILS and the verdict is INSUFFICIENT-DATA with the
  failing leg named — a measurement arm with no transcript is not
  credible.

## What this arm does NOT do

No src/js change, no policy change, no default flip, no fight routing,
no roster read, no push, no bump, no live verification. No use, import,
or build on any sibling arm's branch. No re-judgment of predecessor
verdicts (sortiedpr DIAG-GO, fieldability DIAG-GO, allycap
CLAIM-CONFIRMED all stand). No wall movement claimed from measurement
alone. No panel artifact (standing exception: the panel has no
census-ingest mode; identical-seed paired tables are the §15 substitute,
as in prior rounds). Instruments: scripts/sim-wave4leth-a-sweep.js
(PLAYED band + wrapper), scripts/sim-wave4leth-a-analyze.js (analyzer +
judge), scripts/test-sim-wave4leth-a-*.js (proof tests). Each must pass
`node --check`; analyzer must print its verdict after every rebase.
Never run concurrent jest; cache dir /tmp/jest-cache-sim-wave4leth-a
(no jest expected — node scripts only; the rule is recorded, not
waived). Never touch docs/ONTOLOGY.md (known sibling transient — left
alone). Never touch sibling trees/branches, the lever-claims directory,
the convergence tracker, or any lock file.

## Metric review (filled at judging time)

- (to be filled when the analyzer runs)
