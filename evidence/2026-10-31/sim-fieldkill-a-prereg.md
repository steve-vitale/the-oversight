# sim-fieldkill-a — PRE-REGISTRATION (written BEFORE any judged sims, 2026-10-31)

Run: Loop A worker, axis scale-onramp, run fleshout-20261031T1702Z.
Arm type: DIAG ONLY — measurement, zero src/js changes, zero
policy-default flips, zero edits to existing policy files, no gate
threshold or demand number moved. Sibling Loop B is live on
food-economy — NOT touched. The deliverable is the instrument +
census + verdict; do NOT build a lever fix.

## Question (from sim-wave3enc-a, next blank #3)

WHY do wave-3 field fights never kill? Wave3enc (its base
9f22a0838, 19 seeds, 293 meetings) found: fled by villagers 140,
fled by beast 90, fought-lost 36, avoided 10, ledger kills 17,
fought-won-no-ledger 0; field fights NEVER kill a wave-3 monster
(0/233 field, 2 field deaths); all kills are the scholar's
turn-based fight (17/60). This arm joins every wave-3 field
meeting to damage dealt/taken per side, rounds fought before
fleeing, who fled and what triggered it, party size and ally
joins in the wild, monster HP remaining at flee, and whether
any field fight ever reaches a killable state — and names the
losing mechanism exactly (code point if one exists) or reports
it as a measured distribution if no single point exists.

Canon read first: docs/CANON.md, docs/MONSTER-WAVES.md (wave 3:
9 monsters, HP 240–420 in data, damage bands 20–55 in data;
"a mid-build fight (4–6 rounds at ~64 dmg/round)" — a
player-build figure, NOT a villager field figure), plus
src/js/fieldFights.js header (morale, volley, round cap 15).
No canon doc covers villager field-fight flee triggers in
detail; the mechanism below is read from fieldFights.js code
and measured, not invented as canon.

## Base pin (re-derived, never transferred)

- Worktree HEAD at prereg time: f536e3ad33da39ed7c4ed6cc620277287405bed3
  (sim-scale-onramp-round-1535-a coordinator evidence commit).
  This base is NEWER than wave3enc's base (9f22a0838), which is
  newer than wavegate's (4c92bbb04). Seed labels do NOT transfer
  across bases. Every judged JSON carries its anchorCommit.
  This arm judges ONLY its own corpus on THIS base; wave3enc
  numbers are quoted as prior-base context, never as current
  data, and never judged against.
- Worktree: ~/workspace/worktrees/sim-fieldkill-a (branch
  sim-fieldkill-a). Main tree untouched.

## Seed plan (fixed now; no band-shopping)

- Pilot (8): 87104, 87109, 87119, 87124, 87140 (wave3enc's 5
  named seeds on ITS base) + 87115, 87123, 87127 (contrast).
- Confirm (11, = remaining wave3enc band seeds): 87103, 87107,
  87120, 87121, 87126, 87128, 87132, 87134, 87135, 87137, 87138.
  Run ONLY if the pilot gate passes (below). No substitutions,
  no additions. Total judged band 19, same seed SET as wave3enc
  (for comparability of construction, not of values).

## Policy stack (identical to wave3enc, plus the NEW recorder)

- withFullseatDiag(withSeatDrive(withWinDefer(TF leadfeast))),
  FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1
  SEATDRIVE=1 FULLSEAT=1, 200 loop-days death-aware cap
  (harness Game.over stop; dead villages stop simulating).
- NEW recorder: scripts/policies/fieldkill-diag.js
  (FIELDKILL=1), wrapped OUTSIDE fullseat-diag. It does NOT
  replace or edit wave3enc-diag; wave3enc-diag is NOT in this
  stack. The recorder extends wave3enc-diag's fieldFight
  capture with the fields wave3enc dropped (below) and adds a
  recordPyrrhicKill wrap (the second waveKillLog writer found
  by vet2). It is policy-side only, env-gated, pure reads +
  post-delegation recording, zero game-state writes, zero RNG
  draws — the same purity contract as wave3enc-diag.

## Recorder capture (new fields, wave-3 field fights)

Pre-call (before delegating fieldFight): monster entity HP
(m.hp) and max HP (m.maxHp) when m is present; villager HP
(village.health[vid]); opts allies count, allyVids length,
allyFromStart, noFlee, cornered flags.
Post-call (from the returned rec, untouched): outcome, rounds,
vTaken, mDealt, allyDealt, allyTaken, vHpLeft, mHpLeft,
partySize, calledHelp, allyVid, intent + intentWhy,
fleeHopeless, fleeLearn, fleeHpFrac, everWinning,
everHopeless, minHpFrac, volley {shots,hits,dmg}, roundTotals
(per-round cumulative mDealt/vTaken/allyDealt), trickLog,
shoutRound (+ shoutMhp/shoutMmax/shoutVhp), corneredHold,
staredDown, peaceful, redactorQuiet, judges, and rec.log
(wave-3 fights only, capped at 60 lines) for the sense read.
TB fights: same tbEnd capture as wave3enc (result, monster
ids, scholar presence, arena). Kill events: recordWaveKill
delta as in wave3enc, PLUS recordPyrrhicKill events (flagged
pyrrhic=true, delta null — they score NO ledger points by
design, game.js tbEnd 'lost' path). Say capture: as wave3enc
(wave-3 names only), for the sense read.

## Meeting definition + kill join (binding, fixes wave3enc)

A MEETING is one fight row: one fieldFight call with a wave-3
mdef, or one settled tbEnd fight containing a wave-3 monster
— exactly wave3enc's definition, so counts stay comparable.
Kill join (THE wave3enc metric-review fix): a wave-3 kill
event joins to a fight row on same day + same monster type
with row result 'won' OR 'routed' (tbEnd settles kills for
non-lost results, game.js tbEnd: `if (result === 'won' ||
result === 'routed' || result === 'lost')` — 'won'/'routed'
via recordWaveKill, 'lost' via recordPyrrhicKill). Field
vKill rows join to their own recordWaveKill event on same
day + type (field-kill call sites in game.js call
recordWaveKill directly). Any kill event with no matching
'won'/'routed'/'lost'/vKill row is UNCLASSIFIED (orphan);
any 'won'/'routed' TB row with a dead wave-3 monster and no
kill event is UNCLASSIFIED. The verdict rests on the
'won' OR 'routed' clause for ledger kills, with pyrrhic
('lost') kills reported as a SEPARATE third shape, never
folded into the ledger-kill count. This clause is stated
here so the coordinator can check it, not silently assumed.

## Flee-trigger classification (binding, priority order)

Applies to every non-evade field fight that ends in flight
(vFlee or mFlee). Exactly one class, in this priority order
(first match wins; the analyzer implements exactly this):
1. volley-driveoff: outcome mFlee AND rounds == 0 AND
   volley.dmg > 0 (the volley branch ends the fight before
   round 1, fieldFights.js volley section).
2. trick-exit: outcome mFlee AND (peaceful OR staredDown OR
   redactorQuiet >= 3 OR trickLog contains 'offer_food'
   shaping — the trick verb ends the fight, not damage).
3. learn: fleeLearn == true (learn-first withdrawal:
   intent 'learn', round >= 3, not winning — OR a floor /
   hopeless flee by a learning villager, which the engine
   also flags fleeLearn).
4. hopeless: fleeHopeless == true AND NOT fleeLearn
   (morale branch: round >= 2, rtd < rtk * 0.85, alone or
   help already spent — fieldFights.js morale section).
5. floor: fleeHpFrac != null AND fleeHopeless == false AND
   NOT fleeLearn (HP below the situational flee line
   vBreak, with the trajectory NOT hopeless).
6. mBreak-driveoff: outcome mFlee AND mHpLeft / mMax < 0.15
   (monster below its wave>=2 break line, mBreak = 0.15).
7. round-cap: rounds == 15 AND outcome in (vFlee, mFlee)
   (round cap: the worse-off side disengages).
8. unclassified: any flight fight matching none of 1–7.
vKill, vDie, evade, alreadyDead are outcomes, not flee
triggers, and are counted separately, never forced into 1–8.
The analyzer also cross-tabs trigger x final intent
(learn vs engage) and trigger x caller (wild / expedition /
aid / patrol / sortie / other) so a trigger that is really
a channel artifact cannot hide.

## Killable state (binding definitions)

- mMax: pre-call m.maxHp when present; else the monster
  def's hp upper bound (monsters.json hp[1]). mHpStart:
  pre-call m.hp when present; else mDealt + mHpLeft
  (derived — flagged derivedStart=true; healing monsters
  e.g. Ad Break pause-heal make this an UNDER-estimate of
  start, never an over-estimate of damage dealt).
- Per-round damage (this fight's own rate): vDpr =
  mDealt / max(1, rounds) for rounds >= 1; for 0-round
  volley fights vDpr = volley.dmg (a volley-only rate).
  Monster rate: mDpr = vTaken / max(1, rounds).
- killable-at-flee (PRIMARY): mHpLeft <= 2 * vDpr — the
  monster dies within 2 more rounds at this fight's own
  rate. near-killable: mHpLeft <= 5 * vDpr. rtk_end =
  mHpLeft / vDpr (rounds-to-kill remaining at flee;
  infinite when vDpr == 0 — reported as a separate
  zero-damage class, never averaged in).
- below-break-at-flee: mHpLeft / mMax < 0.15 (a fleeing
  fight already past the monster's own break line — should
  be near-zero for vFlee fights, by construction of the
  mBreak check; a non-zero count there names a code path
  that skips the check, e.g. cornered hold / hogtie bind).
- The verdict reports: count + share of flee fights that
  are killable-at-flee, near-killable, below-break; the
  distribution of rtk_end (median, min, share <= 2, <= 5,
  <= 15); and the same for the closest-to-kill fight on
  each seed. A "never killable" verdict requires the
  killable-at-flee count to be 0 AND the median rtk_end
  to exceed the 15-round cap — both stated, not one alone.

## Per-seed report (required for every judged seed)

Field meetings (wave-3 only) with outcome split; damage
distributions by outcome (median mDealt, vTaken, allyDealt,
vDpr, mDpr, rounds); HP-at-flee distribution (mHpLeft,
mHpLeft/mMax, rtk_end); flee-trigger distribution (classes
1–8 above, with unclassified listed individually); party
picture (partySize distribution, wild-only: share starting
solo, share allyFromStart, share shout-joined mid-fight,
share solo start-to-finish, outcomes by party class);
kill-join table (ledger kills by clause: won / routed /
field-vKill; pyrrhic kills by lost rows; orphans listed);
wall numbers (national / table / won / wave 4 / wave 5 /
median + max survival, on THIS base); recorder errors;
sense-read pointer (which fight's log was read).

## Primary metric

Field-fight mechanism-census completeness over the judged
band: (a) every wave-3 field fight on every judged seed is
assigned exactly one outcome + (for flights) exactly one
trigger class 1–7, with unclassified == 0; (b) every wave-3
kill event joins to a 'won' OR 'routed' TB row, a field
vKill row, or a pyrrhic 'lost' row, with unexplained
orphans == 0; (c) killable-state distributions are computed
for 100% of flee fights (zero-damage fights in their own
class, never dropped); (d) recorder errors == 0 on all
judged seeds; (e) cross-checks (i)–(iii) below all pass.
Completeness is judged over the full 19-seed band, with
the pilot gate (below) as the spend control.

Cross-checks: (i) det-gate byte-identity on 2 pilot seeds
(ON vs OFF: identical dayHash arrays + identical end
fields gameDays/won/national/table/maxWave/endScaleRank);
(ii) corpus determinism leg (one judged pilot seed re-run
byte-identical); (iii) kill-event count == waveKillLog
wave-3 entries on every judged seed (ledger + pyrrhic
events both counted against the log; a log entry with no
event, or an event with no log entry, is reported, never
smoothed).

## Band verdict (stated now, judged later, never re-scored)

- DIAG-GO: primary metric (a)–(e) all hold, >= 8 usable
  judged seeds, AND the evidence states (a) damage/rounds/
  HP-at-flee distributions by outcome, (b) the flee-trigger
  distribution with the dominant trigger named, (c) party
  size + ally joins in the wild, (d) the killable-state
  verdict (count + share killable / near-killable /
  below-break, median rtk_end), (e) a sense read of at
  least one FULL field-fight transcript (rec.log, not
  counts), (f) the losing mechanism in plain words with
  its code point(s) (fieldFights.js morale / break /
  cap sections by name) or, if no single point exists,
  as the measured distribution with the shares that rule
  out each single-point candidate.
- DIAG-NO-GO: unclassified > 0 unexplained (fights or
  kill-joins), or any cross-check failing unexplained, or
  instrumentErrors > 0 with no read-only explanation, or
  a required verdict section (a)–(f) missing, or the
  pilot fails on instrument grounds.
- KILLED-AT-PILOT: the pilot gate fails (below) and no
  confirm is run. Pilot numbers are still reported; the
  field-kill question stays open, not answered by pilot.

## Pilot gate (8 seeds before any confirm spend, §9)

Pilot GO requires: recorder fires on all 8 pilot seeds
with zero recorder errors; per-seed JSONs valid (days > 0,
daily rows sorted); field-meeting tables computable on
every pilot seed (including total 0 with all buckets 0 on
never-unlocked seeds — a zero table is complete, not a
failure); cross-check (iii) holds on every pilot seed;
AND the instrument demonstrably fires (at least one
wave-3 field fight recorded on at least one pilot seed,
with trigger fields present — a pilot with zero field
fights everywhere is instrument-suspect and stops as
killed-at-pilot with that reason stated, unless a
contrast seed shows field fights, in which case the
zero is a finding and the confirm still runs).

## Horizon + why (death-aware, never a fixed 200d)

Cap 200 loop-days; stop rule is the harness's Game.over
(village lost or won). Identical to wave3enc: wave-3 doors
opened late and villages lived with wave 3 for tens of
days on prior bases, so a shorter cap would censor the
meeting tail; the death-aware stop keeps cost at the
survival distribution.

## Panel (§15)

NOT APPLICABLE — single-base DIAG census, no before/after
lever comparison exists in this arm; none fabricated (same
declaration as wave3enc-a). The det leg compares
recorder-on vs recorder-off trajectories of the SAME
stack; it is a neutrality proof, not a panel comparison,
and its numbers never enter the census tables.

## Det-gate (before judged sims are trusted)

- A det script (same pattern as wave3enc-det-20261031.sh)
  runs 2 pilot seeds (87104, 87127) twice each — recorder
  ON vs OFF (same stack, same seeds) — to worktree scratch
  dirs (deleted before commit; NEVER /tmp, never the
  judged corpus), and compares dayHash arrays + end fields.
  Requirement: byte-identical hashes and identical end
  fields on both seeds. A mismatch stops the run
  (killed-at-pilot on instrument grounds) until explained.
- Corpus determinism leg: one judged pilot seed re-run to
  a worktree scratch dir is byte-identical to its judged
  JSON.
- Sweep I/O discipline (prior-run lessons): the sweep
  prints ONE JSON line per seed to stdout and writes
  nothing itself; a separate idle splitter reads the
  stdout file and writes the per-seed JSONs with a
  resilient writer (retry + full-size verification).
  stdout/stderr are captured to files in single FOREGROUND
  execs, never a backgrounded pipe. Judged corpora are
  NEVER staged in /tmp.

## Sense-testing (SENSE-TESTING LAW)

The evidence judges at least one FULL wave-3 field-fight
transcript (rec.log from the corpus, with rounds, wounds,
intent, ally, flee line) for meaning: who met what, why
the fight ended when it did, whether the ending reads as
a believable decision or a timer, and whether any
narration exists for it outside the log. Counts alone do
not pass this section. Preference: the closest-to-kill
fight on the band (minimum rtk_end among flee fights),
so the sense read tests the verdict's sharpest case; if
no fight comes within 5 rounds of a kill, the sense read
covers the median flee fight instead and says so.

## Metric review (carried, filled at evidence time)

- (To be filled from the run: did the trigger
  classification hold without unclassified fights, did
  the won/routed/pyrrhic kill join hold without orphans,
  did the det-gate hold, did any classification rule
  misfire, did the pilot gate behave, does the killable
  definition need rewording for the next arm.)
