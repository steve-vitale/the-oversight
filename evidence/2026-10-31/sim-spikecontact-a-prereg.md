# sim-spikecontact-a — PRE-REGISTRATION (written BEFORE any judged sims)

Run: fleshout-loop-a-20261101T0000Z, arm sim-spikecontact-a.
Axis: scale-onramp (converging, NOT converged). Arm type: DIAG /
instrument ONLY — zero game-code change. This arm must NOT edit any
file under src/js/ (sibling arm sim-chorus-a owns game-code changes
to fieldFights.js this run; this arm stays independent of it). It
reuses the contactrec recorder emission already in fieldFights.js
(rec.mHpStart / rec.mMaxHp, landed run 2156Z) and adds scripts/,
policies/, evidence/ files only. It does NOT build a contact-finish
rule. It does NOT touch sibling Loop B's work (live claim 2343Z:
food-economy arms sim-strandtile-b / sim-refusedband-b) or any other
worktree. Main tree at ~/workspace/the-scattering untouched.

## Canon read first

docs/CANON.md, docs/MONSTER-WAVES.md (wave 3: 9 monsters, HP
240-420 in data; break line 15% for wave >= 2; wave-3 gating day 25+
and 4 wave-2 ledger points), evidence/2026-10-31/
sim-scale-onramp-round-2156-a.md (the closeout this arm answers),
evidence/2026-10-31/sim-twoblow-a-prereg.md (the proven-blow
definition and the six-gate rule this arm separates), evidence/
2026-10-31/sim-contactrec-a-prereg.md (the evade-HP capture rules
and the contactbreak CONTACT definition reused below). No canon doc
covers villager field-fight flee triggers or contact drive-off
narration in detail; the mechanisms below are read from
fieldFights.js code, not invented as canon. Steve's standing rule
honored here: monster encounters are fought, not rolled
(2026-10-08) — a future contact-finish BUILD may only convert a
meeting through a real action the fighter actually takes, never by
an outcome table, and never by crediting a weapon the fighter
cannot use.

## Questions (from run 2156Z closeout, documented future arms)

(a) SPIKE-VS-LAST-TWO SEPARATION. All 3 twoblow conversions in 20
seeds pass under BOTH definitions: (i) a single spike blow covering
the beast's remaining HP, (ii) the last-two-blows sum covering it.
Separate them, so the next twoblow tuning knows which definition
it is tuning.

(b) CONTACT-FINISH BUILD READINESS. Quantify the exact universe a
future contact-finish BUILD would judge on: for wave-3
contact-break meetings, the fighter's real finish instrument
(held weapon, arrows/ammo state, melee availability), split into
finishable-with-a-real-action vs no-real-instrument — including
the known narration lie (a villager with a crude bow but no arrows
driving a beast off "with the bow", and the sling variant). The
future BUILD's prereg must be writable from this arm's numbers.

## Definitions (binding — fixed here, before any sims)

PROVEN BLOW: a lead-strike damage value vd after all multipliers,
counted ONLY when vd > 0 — exactly the twoblow rule's definition
(fieldFights.js, twoblowLast tracking). Volley damage, the ambush
opening strike, shoulder-check collision damage, and ally strikes
are EXCLUDED. In log-parsing terms: a lead strike is a log line
`R<n>: <leadName> strikes for <vd> ...` where the line is the
FIRST "strikes for" line of its round (the lead strikes before
any ally in a round; ally lines "strikes again" never match, and
a later same-round ally "strikes for" line is excluded by the
first-per-round rule). A 0-damage strike line (mirage miss,
editor cut narration aside) is not a proven blow and is dropped.

SPIKE (definition S): at a decision moment, maxStrikeSoFar >=
remainingHp, where maxStrikeSoFar is the largest proven blow
landed so far in the fight and remainingHp is the beast's HP at
that moment.

LAST-TWO (definition L): at a decision moment,
lastTwoSumSoFar >= remainingHp, where lastTwoSumSoFar is the sum
of the last two proven blows landed so far in the fight.

CLASSIFICATION of a fight at its decision moment: spike-only
(S true, L false), last-two-only (L true, S false), both (both
true), neither (both false).

DECISION MOMENTS (two universes, never pooled):

- U-COMMITTED: every fight with committedFinish === true. Moment
  = the FIRST commit in the fight (first log line containing
  "(Committed finish, two-blow)"; later re-fires are the same
  decision re-struck, not new decisions). Engine truth at the
  moment: twoblowCommitMhp (remaining HP) and twoblowCommitSum
  (last-two sum). Parsed strikes are taken from log lines strictly
  BEFORE the first commit line. Classification uses engine
  remainingHp = twoblowCommitMhp, engine lastTwoSum =
  twoblowCommitSum (so L is true by construction for every
  committed fight — the gate required it), and parsed
  maxStrikeSoFar for S. Consequence, stated now so it cannot be
  re-read later as a surprise: U-COMMITTED can contain only
  "both" and "last-two-only". A "spike-only" committed fight is
  impossible by construction. The separation therefore lives in
  U-FLIGHT, and the committed set answers only "how many of the
  rule's own conversions also pass the spike definition".
- U-FLIGHT (twoblow-eligible flights): wave-3 field fights with
  outcome mFlee, rounds >= 1, whose log contains the break-check
  flight marker "breaks — wounded past its line" (the engine's
  own narration for the in-round break check firing; trick
  exits, stare-downs, peacemaker exits, and learn/hopeless/floor
  flights carry different lines and are excluded). Moment = the
  flight: the fight ends at the break check, so remainingHp =
  mHpLeft (final HP, no damage lands after a break-check flight).
  Classification uses parsed strikes over the whole log:
  maxStrike = max parsed proven blow, lastTwoSum = sum of the
  last two parsed proven blows. Fights with fewer than 1 parsed
  proven blow are unparseable for this purpose, not "neither".

AMENDMENT 1 (committed BEFORE any judged verdict, 2026-11-01):
baseline legs ran on pre-rule code, so their rows physically
carry no twoblowLastTwo/twoblowCommit fields — engine-truth
validation is impossible there, not merely failed. For
pre-rule (baseline) U-FLIGHT fights ONLY, the validation below
is replaced by damage reconciliation: the sum of ALL parsed
damage components (lead strikes + ally strikes + volley hits +
ambush opener) must equal the recorded mDealt exactly; a
mismatch is UNCLASSIFIED with reason
'reconciliation-mismatch'. Lever legs keep engine-truth
validation. This amendment changes no GO threshold and no
classification rule — it supplies the validation the baseline
legs can actually satisfy. Truncation for U-COMMITTED is
judged on the FULL captured log, never on the pre-commit
slice (the slice ends at the commit line, which is not an
outcome line).

PARSE VALIDATION (no silent trust in log parsing): a parsed
fight is CLASSIFIED only if its parsed sequence reproduces
engine truth where engine truth exists —
- U-COMMITTED: parsed last-two sum (strikes before the first
  commit line) == twoblowCommitSum. Any mismatch, or no commit
  line found in the log, or no parsed strikes before it, =
  UNCLASSIFIED (parse failure), never forced into a class.
- U-FLIGHT: parsed last-two sum (whole log) == rec.twoblowLastTwo
  sum at fight end (the engine updates twoblowLastTwo on every
  proven strike, and a break-check flight ends the fight, so end
  == break moment). Mismatch, or missing twoblowLastTwo while
  parsed strikes exist, or log truncated (see below) =
  UNCLASSIFIED.
Log truncation guard: the recorder caps the captured log (60
lines in the old recorder; 200 in this arm's recorder). A fight
whose captured log ends mid-fight (last captured line is a
round line and the fight's outcome line is absent) is
UNCLASSIFIED, not parsed. Wave-4/5 rows in the OLD corpora carry
log null (old recorder captured logs for wave-3 only), so any
wave-4/5 committed fight in the old corpora is UNCLASSIFIED by
this rule and reported as such, not reconstructed.

CONTACT-BREAK MEETING (for question b): the contactbreak
definition, unchanged: mHpStart < 0.15 * mMaxHp AND rounds <= 1
AND mDealt == 0 AND outcome in {mFlee, evade}. Classified with
the contactrec HP-capture preference order (pre-call entity HP,
then the rec.mHpStart/rec.mMaxHp emission, then the evade-only
exact fill; fought rows never get an invented mHpStart). This
arm reuses scripts/contactbreak-analyze-20261031.js's
classifyRow verbatim via require, and
scripts/contactrec-analyze-20261031.js's capture accounting.

FINISH INSTRUMENT (for question b, recorded at contact, i.e.
PRE-call, before the volley spends anything): from the fighter's
person record (Game.data.villagers / background_survivors by vid)
and Game.data.items —
- rangedEq: equipped ranged entry (vp.equipped.ranged), with its
  item def (name, weapon.ammo id).
- ammoAtContact: count of the fighter's own pack entries whose
  itemId or material equals the ranged weapon's ammo id (the
  engine's own counting rule, fieldFights.js volley block),
  units summed. Null when no ranged weapon is equipped.
- meleeEq: equipped melee entry (vp.equipped.melee ||
  vp.equipped.weapon), with its item def.
- meleeCarried: pack entries whose item def is a weapon and is
  not a ranged weapon (engine isRangedWeapon rule: weapon def
  with range > 1, or bow/sling/rifle/pistol/crossbow in the
  name) — a weapon to hand but not equipped.
- volleyPost: rec.volley as returned (shots, hits, dmg,
  ammoLeft) — the post-volley remainder, recorded alongside but
  never substituted for ammoAtContact.

FINISHABLE-WITH-A-REAL-ACTION (primary, weapon-instrument):
a CONTACT meeting where the fighter at contact holds EITHER
(a) a ranged weapon with ammoAtContact > 0, OR (b) a melee
weapon equipped or carried. NO-REAL-INSTRUMENT: neither (a)
nor (b). The drive-off line's credited weapon is recorded
separately: "with the bow" always (engine line, fieldFights.js
volley-break block) vs the fighter's actual rangedEq name
(bow / sling / none). LIE RATE: among CONTACT meetings ending
mFlee, the share whose credited weapon ("the bow") is not a
usable instrument the fighter holds — i.e. rangedEq is null,
or rangedEq is held but ammoAtContact == 0 — reported split by
rangedEq kind (bow-no-arrows, sling-no-arrows, no-ranged-at-all).
SENSITIVITY (reported, never folded into the primary): the
engine's lead strike deals damage unarmed too (tactical formula
lroll([4+wb, 8+wb]) with wb = 0 unarmed), so under an
"any strike action counts" reading EVERY contact meeting is
actionable. That count is reported as a sensitivity row so the
future BUILD prereg can choose with eyes open; the primary
stays weapon-instrument because the BUILD's fiction, and the
task's "no-real-instrument" class, are about a weapon in hand,
and an unarmed strike against a wave-3 beast is a separate
design question (flagged in metric review, not decided here).
EVADE vs DRIVE-OFF split: CONTACT meetings ending 'evade' are
avoidances (the awareness return precedes contact), not
drive-offs; they are reported as their own row and are NOT
part of the finishable universe for a BUILD that replaces the
drive-off (no meeting happened to finish). The BUILD universe
count = CONTACT meetings ending mFlee that are
finishable-with-a-real-action. The no-real-instrument mFlee
count is the remainder the BUILD must leave alone (or narrate
honestly, a BUILD decision, not this arm's).

## Base pin (re-derived, never transferred)

- Worktree HEAD at prereg time:
  24bf27d80ee2cb5eaf6592e601a3039b2ef355a0
  ("Version bump 66239763c-20261101-000436 (batch ship)").
  The prereg commit itself touches only this evidence file, so
  the fresh-pilot leg's game code is byte-identical to the pin.
- Worktree: ~/workspace/worktrees/sim-spikecontact-a (branch
  sim-spikecontact-a). Main tree untouched.
- CONTROL-DRIVER STEP (base-pinning discipline): BEFORE any
  judged fresh-pilot leg, run the prior instrument verbatim —
  scripts/twoblow-sweep-20261031.js with TWOBLOW=1 on 2 pilot
  seeds (87104, 87127) — on this base, and compare dayHash
  arrays + end fields (gameDays/won/national/table/maxWave/
  endScaleRank) against the old twoblow pilot corpus for the
  same seeds. If they match byte-identically, the base moved
  without moving trajectories and the old corpora may be cited
  as same-trajectory evidence. If they diverge, the divergence
  is reported as base movement (sibling landings since the old
  corpus: contactrec emission, journey r77 measurement-only,
  ship bump) and the old corpora are cited ONLY as
  prior-base re-analysis, never as same-base comparisons. The
  control step never blocks the fresh pilot on its own: it
  classifies the evidence, it does not gate it.

## Seed plan (fixed now; no band-shopping)

- RE-ANALYSIS (no new sims): all four twoblow corpora already
  on master — evidence/2026-10-31/twoblow-baseline-pilot.jsonl,
  twoblow-lever-pilot.jsonl, twoblow-baseline-confirm.jsonl,
  twoblow-lever-confirm.jsonl (20 seeds: 8 pilot + 12 confirm,
  both legs). Judged re-analysis universes are drawn from these
  files only, via the splitter output already on master
  (perseed-twoblow-*/leadfeast/s<seed>.json) — re-read, never
  re-run, never edited.
- FRESH PILOT (8, = twoblow pilot set, for construction
  comparability, not value transfer): 87104, 87109, 87119,
  87124, 87140, 87115, 87123, 87127. Single leg on current
  master (the twoblow rule is already IN master, so the pilot
  measures the rule as shipped, not a new lever). No baseline
  leg: this is a DIAG arm, not a BUILD arm — there is no lever
  to compare, so there is no before/after comparison to run
  through the balanced panel. Panel (§15) is therefore N/A for
  this arm, stated here rather than omitted: the panel is the
  instrument for before/after comparisons, and this arm makes
  none. Wall numbers are still reported per band, never pooled.
- CONFIRM (12, fresh seeds, run ONLY if the pilot is too thin
  to classify: fewer than 2 U-COMMITTED fights OR fewer than 5
  U-FLIGHT fights on the pilot, OR any U-COMMITTED fight
  unclassified on the pilot): 87103, 87107, 87120, 87121, 87126,
  87128, 87132, 87134, 87135, 87137, 87138, 87141 (the twoblow
  confirm set, chosen here before any sims). If confirm runs,
  its numbers are reported as their own band, never pooled
  into the pilot band for judging.

## Policy stack (identical for the fresh pilot; control leg excepted)

withFullseatDiag(withSeatDrive(withWinDefer(TF leadfeast))),
FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
FULLSEAT=1, 200 loop-days death-aware cap (harness Game.over
stop; dead villages stop simulating), PLUS the NEW recorder
scripts/policies/spikecontact-diag.js (SPIKECONTACT=1), wrapped
OUTSIDE fullseat-diag. The recorder is a copy of twoblow-diag.js
with exactly these captured-field additions per field-fight row:
parsed lead-strike components (leadStrikes, maxStrike,
lastTwoParsed, lastTwoParsedSum), parse-validation flags
(parseOk, parseNote), instrument fields (rangedEqId,
rangedEqName, ammoAtContact, meleeEqId, meleeEqName,
meleeCarriedIds, volleyPost, driveOffCredited), and the
contactrec HP-capture preference order (pre-call, emission,
evade-only exact fill) replacing twoblow-diag's pre-call-only
HP fields; and the log captured for wave >= 3 (slice 200, not
wave-3-only slice 60). It is policy-side only, env-gated, pure
reads + post-delegation recording, zero game-state writes, zero
RNG draws — the same purity contract as twoblow-diag.
twoblow-diag.js and contactrec-diag.js themselves are NOT
edited. Sweep: scripts/spikecontact-sweep-20261031.js (copy of
the twoblow sweep, recorder module + env name swapped, same
stdout-only I/O discipline + idle splitter pattern). Splitter:
scripts/spikecontact-split-20261031.js (copy of the twoblow
splitter, name swapped). Analyzers:
scripts/spikecontact-analyze-20261031.js (spike separation on
any corpus dir: committed + flight classification with parse
validation, per-leg, per-band never pooled) and
scripts/spikecontact-contact-20261031.js (contact instrument
split on a corpus dir, reusing contactbreak classifyRow and
the contactrec capture accounting). Control leg uses the
twoblow sweep/diag verbatim, TWOBLOW=1, on 2 seeds, to a
worktree scratch dir deleted before commit (never /tmp, never
the judged corpus).

## Primary metrics (binding)

- M1 (spike separation, re-analysis): classification counts
  over U-COMMITTED (lever legs, 20 seeds) and U-FLIGHT (all
  four legs, 20 seeds), each with classified / unclassified
  counts. The deliverable sentence: "the next twoblow tuning
  should use definition X", with counts, where X follows from
  the U-FLIGHT separation (if spike-only flights materially
  outnumber last-two-only flights, or vice versa) and the
  U-COMMITTED both-share.
- M2 (contact readiness, fresh pilot): classification of 100%
  of fresh-pilot wave-3 CONTACT meetings into
  finishable-with-a-real-action vs no-real-instrument (with
  the evade row split out), the BUILD-universe count
  (finishable mFlee drive-offs), and the lie rate with its
  bow/sling/none split. The deliverable: the future BUILD's
  prereg numbers, writable verbatim.
- M3 (wall numbers, fresh pilot band): national / table /
  wins, wave-4, wave-5, median + max survival, full seat
  (fullseat-diag bestSeat == 'full'), per band never pooled.

## GO thresholds (DIAG — all must hold; a miss is DIAG-NO-GO)

- D1 (spike separation, re-analysis): 100% of U-COMMITTED fights
  classified (zero unclassified) across the 20-seed lever
  corpora, AND every U-FLIGHT fight either classified or
  counted as unclassified with its parse-failure reason named
  (U-FLIGHT unclassified rate reported, not hidden; a
  U-FLIGHT unclassified rate above 25% fails D1 — the
  separation would rest on a minority of parseable flights).
- D2 (spike separation, fresh pilot): 100% of fresh-pilot
  U-COMMITTED fights classified (zero unclassified). If the
  pilot has zero U-COMMITTED fights, D2 is vacuous and the
  confirm leg (above) MUST run before any DIAG-GO is claimed.
- D3 (contact readiness, fresh pilot): 100% of fresh-pilot
  wave-3 CONTACT meetings instrument-classified (zero
  unclassified: every CONTACT row carries rangedEq/ammo/
  melee fields, nulls allowed only where the fighter truly
  holds nothing), with the BUILD-universe count and the
  lie rate both stated. If the pilot has zero CONTACT
  meetings, D3 is vacuous and the confirm leg MUST run.
- D4 (determinism / instrument purity): recorder ON vs OFF
  det-gate on 2 pilot seeds (87104, 87127) with the NEW
  recorder (same pattern as twoblow: dayHash arrays + end
  fields byte-identical between ON and OFF legs on this base),
  and one judged pilot seed re-run byte-identical to its
  judged JSON. A mismatch stops the run until explained.
- Secondary, reported not judged: wall numbers (no lever is
  judged, so no wall movement is claimed); sense-read verdicts
  (below); the unarmed-strike sensitivity row.

## Horizon + why (death-aware, never a fixed 200d)

Cap 200 loop-days; stop rule is the harness's Game.over
(village lost or won). Identical to twoblow: wave-3 doors opened
late and villages lived with wave 3 for tens of days on prior
bases, so a shorter cap would censor the meeting tail; the
death-aware stop keeps cost at the survival distribution.

## Sense-testing (SENSE-TESTING LAW)

The evidence judges at least 4 contact-meeting transcripts and
2 committed-fight transcripts from the fresh pilot (or, if the
pilot yields fewer, every one it yields plus re-analysis
transcripts to reach the count, labelled as such) for meaning:
do the drive-off lines name a weapon the villager actually
holds (or is the lie visible in the log itself, e.g. a
"has Bow but no arrows" line directly above a "drove off with
the bow" line)? Do the strike components read as proven blows
(lead strikes with multipliers named, ally strikes distinct,
0-damage mirage/cut lines excluded from the proven set)? Does
any narration exist for the contact break outside the fight
log? Counts alone do not pass this section.

## Wall numbers (on the judged band)

National / table / wins, wave reach (maxWave distribution,
wave-4, wave-5), median + max survival, full seat, per band
never pooled. Arc reach, four-realm formation, trap acquisition
by source, counter discovery rates, and young-link succession
survival are NOT in this corpus — reported as unmeasured, not
as zero.

## If DIAG-NO-GO: no game change to revert (none was made)

The instrument files are retained as measurement tooling (they
contain no game-code change); the evidence states the gap that
failed the bar and what the next arm must fix before the
numbers are citable. No src/js file is touched in any outcome.

## If DIAG-GO: landing

Each landing commit carries its own proof test + evidence
section, message WITHOUT [needs-eyes] (instrument-only, no feel
change), and reports 'ready to merge, pending coordinator'
readiness (the coordinator merges via --ff-only). Do NOT push,
do NOT bump versions, do NOT verify live. Do NOT merge to
master yourself.

## Metric review (carried, filled at evidence time)

- (To be filled from the run: did the first-per-round parse
  rule ever misattribute an ally strike as a lead strike — did
  any U-FLIGHT parse-validation mismatch fire, and why; did
  the weapon-instrument primary vs unarmed-strike sensitivity
  change the BUILD universe materially, and which should the
  BUILD prereg use; did any CONTACT meeting carry a melee
  weapon but no ranged weapon, and did its drive-off line
  still say "with the bow"; did the control-driver step match
  or diverge, and what does that say about citing old corpora
  on this base.)
