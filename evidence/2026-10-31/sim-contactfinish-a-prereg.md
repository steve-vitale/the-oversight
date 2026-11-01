# sim-contactfinish-a — PRE-REGISTRATION (written BEFORE any judged sims)

Run: fleshout-loop-a-20261101T0125Z, arm sim-contactfinish-a.
Axis: scale-onramp (converging, NOT converged). Arm type: BUILD —
one narrow game-code change in src/js/fieldFights.js ONLY (the
contact-finish rule at the volley-break block + honest drive-off
narration in that same block), plus policy-side instrument copies
of the spikecontact recorder/sweep/splitter (new copy-named files;
NO edit to any scripts/*contactrec* or *spikecontact* file, NO edit
to any sibling arm's files). It does NOT touch sibling Loop B's
food-economy work, any other worktree, or the main tree at
~/workspace/the-scattering. This build changes combat feel and
narration: the landing commit carries [needs-eyes].

## Canon read first

docs/CANON.md, docs/MONSTER-WAVES.md (wave 3: 9 monsters, HP
240-420 in data; break line 15% for wave >= 2; wave-3 gating day
25+ and 4 wave-2 ledger points), evidence/2026-10-31/
sim-spikecontact-a.md + sim-spikecontact-a-prereg.md (the CONTACT
definition, the fresh-pilot BUILD numbers, the lie rate, the spear
sensitivity), evidence/2026-10-31/sim-contactbreak-a.md (the
contact-break class, the candidate shape: a finish must cost a
real action, a no-arrows bow must not count), evidence/
2026-10-31/sim-contactrec-a.md (the evade-HP capture rules),
evidence/2026-10-31/sim-fieldfinish2-a.md (the committed-finish
NO-GO history, the load-bearing break line), and the twoblow
prereg (the six-gate rule this arm does NOT re-open). No canon
doc covers villager field-fight contact drive-off narration in
detail; the mechanism below is read from fieldFights.js code
(the volley-break block and the lead-strike formula), not
invented as canon. Steve's standing rule honored here: monster
encounters are fought, not rolled (2026-10-08) — the finish is
one real lead-strike damage roll, never an outcome table.

## Inherited facts (from sim-spikecontact-a; NOT re-litigated)

- CONTACT definition (contactbreak, unchanged): mHpStart <
  0.15*mMaxHp AND rounds <= 1 AND mDealt == 0 AND outcome in
  {mFlee, evade}. The BUILD universe is CONTACT meetings ending
  mFlee (drive-offs); evade meetings are avoidances, NOT
  drive-offs, and are never converted.
- Spikecontact fresh pilot (8 seeds): 92 wave-3 rows, 20 CONTACT
  meetings, BUILD universe 14 primary (melee weapon, 0 via usable
  ranged), 17 spear-inclusive, 20 unarmed-inclusive; lie rate
  20/20 = 100% (drive-off line always says "with the bow",
  including 12 fighters holding no ranged weapon at all); beast
  HP at contact median 8.5, 10 of 20 at exactly 1 HP.
  Contactbreak corpus: 27/104 (26%) baseline, seed-concentrated
  (87123: 12, 87140: 7).
- Spear edge (sim-findings 2026-11-01): a hunting spear sits in
  the fighter's RANGED equipment slot, so the slot-based
  instrument split counts spear-holders as NO-REAL-INSTRUMENT —
  yet a spear in hand is plainly a melee instrument in fiction,
  and the engine's own melee fold-in counts ranged-weapon bonus
  toward strike damage.

## COORDINATOR DECISION (preregistered verbatim, not silently changed)

spear-counts-as-melee. Your BUILD universe = melee equipped/
carried OR spear-in-ranged-slot OR ranged weapon with
ammoAtContact > 0. On the spikecontact pilot band that universe
is 17; the remainder (3 unarmed on that band) must NEVER
convert. A no-arrows bow NEVER counts as a finish instrument.

Operationalized in code (so the coordinator can check the diff):
a weapon def counts as a CLOSE instrument when it is a melee
weapon in fiction — weapon.type === 'melee' (every spear in
src/data/items.json is range 2, type 'melee': hunting_spear,
fire_hardened_spear, shard_spear, starfall_lance,
godslayer_spear) OR it is not a ranged weapon under the
equipment.js isRangedWeapon rule (range > 1, or bow/sling/
rifle/pistol/crossbow in the name). A spear in the ranged slot
is therefore a close instrument; a bow, sling, or crossbow is a
close instrument NEVER — it counts only through the ranged path
(ammoAtContact > 0, see below). A carried spear counts exactly
like an equipped one (the pack is a weapon to hand). The
analyzer's spear rule is name-based (rangedEqName matching
/spear/i, or a carried/melee name matching /spear/i) because
the recorder rows carry names, not defs; the engine rule above
is def-based, and the two must agree on every judged row —
any disagreement is reported as an instrument mismatch, never
papered over.

## The rule, exactly (contact finish at the volley-break block ONLY)

Location: src/js/fieldFights.js, the volley-break block
(`else if ((members[0].hp / members[0].maxHp) < mBreak)` after
the volley), in the NON-cornered branch only. The cornered-hold
branch, the volley-kill branch, the in-round break check, the
twoblow rule, chorus-hold, sealed arenas, the 60% HP gate, and
the break line itself (mBreak: wave >= 2 ? 0.15 : 0.25) are ALL
UNCHANGED. Wave scope: the finish STRIKE fires for wave >= 3
beasts ONLY (the twoblow narrowness precedent: fieldfinish2
fired on wave 1-2, converted 61 already-winnable fights, and
diverged trajectories into early lesser wins; this arm refuses
that whole class by construction). The honest NARRATION fix
below applies at every wave (narration only, no outcome change
for wave 1-2).

The rule fires at a would-be free drive-off iff ALL of these hold:
0. wave >= 3.
1. members[0].hp > 0 (the lead is alive).
2. rec.mDealt === 0 — the meeting is a true contact meeting:
   no volley damage has landed. A volley-softened beast below
   the line is a volley drive-off, NOT a contact meeting, and
   keeps the old outcome (with honest narration, below).
3. !opts.noFlee — sealed arenas are untouched.
4. The fighter holds a finish instrument at contact, in this
   priority order for narration (first match wins):
   (a) equipped melee weapon, (b) carried close weapon,
   (c) spear in the ranged slot, (d) ranged weapon with
   ammoAtContact > 0. AmmoAtContact is the PRE-volley count
   (captured in the volley block before any shot is spent):
   a bow whose volley shots all missed still held arrows at
   contact. A no-arrows bow (ammoAtContact == 0) is NEVER an
   instrument, and an unarmed fighter (no instrument of any
   kind) NEVER converts.
5. The meeting is not cornered-held (cornered branch already
   decided, untouched).

When it fires, the fighter spends ONE real action — closes and
strikes, a single lead-strike damage roll, plain tactical
formula lroll([4+wb, 8+wb]) with wb exactly as the engine
already computes it (melee+ranged fold-in, so a spear in the
ranged slot contributes through the fold-in, as in fought
rounds). NO ability multipliers apply (no Aim, Haymaker, Dead
Aim, Blood Trail, godpath fieldStrike): this is a pre-round
closing strike, not a fought round, and importing round
machinery would invent mechanics. NO ally strike, NO second
strike, NO volley re-fire.
- If the strike damage >= beast HP: the beast dies. rec.outcome
  = 'vKill', all pack members set hp 0 / alive false (the
  volley-kill convention: the pack's coordination shatters
  with the lead), rec.contactFinishKill = true, and the log
  names the held weapon honestly (see Narration). The kill
  then flows through the SAME settlement code as any vKill
  (creditDeed fight_won, caller-side recordWaveKill, body/
  meat registration) — no special ledger path is invented.
- If the strike does NOT kill: the beast flees as before.
  rec.outcome = 'mFlee', rec.contactFinishKill = false, the log
  records the strike and the flight honestly, and the fight
  ENDS — there is no chase, no continued round, no second
  attempt. The break line is load-bearing villager protection
  and this arm does NOT force a continued fight and does NOT
  lower the break line.

WHAT THE FIGHTER PAYS (stated now, judged as written): the
action itself is the cost. The closing strike is the fighter's
one action in a meeting that would otherwise end instantly:
no round runs, no other action is available in the meeting
anyway, so the cost is opportunity-only within the meeting —
but it is a REAL roll with a REAL failure mode (a non-killing
strike ends the meeting in a flight, and the beast is gone).
THE BEAST CANNOT HIT BACK IN THIS EXCHANGE, BY GUARDRAIL:
the beast is already below its break line and turning to run
— that is why the old rule gave it a free flight. No round
runs, so no monster attack phase exists to hit back in; the
engine sets rec.outcome in the volley-break block and the
round loop (condition !rec.outcome) never starts. The fighter
takes NO damage from a contact-finish attempt, which is why
the GO bar "deaths attributable to contact-finish attempts =
0" is a real bar and not a tautology: any vDie on a row with
contactFinishAttempted = true fails it outright (a vDie
cannot occur without a round, so such a row would prove a
code-path leak). This zero-risk shape is honest ONLY because
the beast was already fleeing: the rule converts a free flight
into a single strike-or-flight, it does not drag a fighting
beast into extra rounds.

NARRATION (binding):
- A contact-finish kill line names the weapon actually held:
  "<Name> does not let it slip away — they close in and strike
  with the <weapon> for <vd> — <monster> falls. (Contact
  finish)". A non-killing strike line likewise names the weapon
  and the remaining HP, then the flight.
- A remaining drive-off line (non-finishable meeting, wave < 3
  meeting, or volley-softened meeting) names the weapon actually
  held when one is held: "<Name> drove <monster> off with the
  <weapon> — it broke before it ever closed." The weapon name
  is the held def's name (melee, carried, spear, or usable
  ranged, same priority as above).
- The leftover unarmed class stops lying: with NO weapon held,
  the line is "<Name> drove <monster> off — it broke before it
  ever closed." No weapon is credited at all. The old line's
  two regex shapes ("drove ... off", "broke before it ever
  closed") are preserved so existing log analyzers keep
  recognizing a drive-off; only the false "with the bow" credit
  is removed.
- No-arrows bow lines stay contradictory ONLY if this arm
  fails its bar: a bow-no-arrows fighter is unarmed for this
  rule (no instrument), so their drive-off line is the
  no-weapon line above — never "with the bow".

Explicitly UNCHANGED (narrowness, stated so the coordinator can
check the diff):
- The break line (mBreak), the 60% HP gate, the twoblow rule,
  chorus-hold, sealed arenas, the cornered-hold branch, the
  volley itself (shots, hit chance, damage), the strike formula
  for fought rounds, monster damage, the round cap, trick
  exits, learn-withdrawal, hopeless flight, the HP floor.
- No other src/js file changes. No policy-default flips. No
  gate threshold or demand number moved anywhere else.
- The recorder/analyzer files of the spikecontact and
  contactrec arms are NOT edited; this arm's instruments are
  new copy-named files (contactfinish-diag.js, contactfinish-
  sweep/split/analyze, test-contactfinish-20261031.js) carrying
  the engine's new rec fields (contactFinishAttempted,
  contactFinishKill, contactFinishWeapon, contactFinishDmg,
  contactFinishInstrument, contactFinishBeastHp) in addition to
  the spikecontact fields.

## Base pin (re-derived, never transferred)

- Worktree HEAD at prereg time: ee159dbc3 (coordinator
  evidence, run 2359-a). The prereg commit itself touches only
  this evidence file, so the baseline leg's game code is
  byte-identical to the pin. Judged comparisons are lever-vs-
  baseline on identical seeds, never against spikecontact's or
  any other corpus (different bases: chorus-hold landed since
  the spikecontact base 24bf27d80).
- Worktree: ~/workspace/worktrees/sim-contactfinish-a (branch
  sim-contactfinish-a). Main tree untouched.
- CONTROL-DRIVER STEP (base-pinning discipline): BEFORE judging
  any leg, run the prior instrument verbatim —
  scripts/twoblow-sweep-20261031.js with TWOBLOW=1 on 2 pilot
  seeds (87104, 87127) — on this base, and compare dayHash
  arrays + end fields (gameDays/won/national/table/maxWave/
  endScaleRank) against the old twoblow pilot corpus for the
  same seeds. If they match byte-identically, the base moved
  without moving trajectories (chorus-hold is inert off the
  commit+dance leak) and old corpora may be cited as
  same-trajectory evidence at that scope. If they diverge, the
  divergence is reported as base movement and old corpora are
  cited ONLY as prior-base evidence, never as same-base
  comparisons. The control step classifies the evidence; it
  does not gate the fresh legs (both legs run fresh on this
  base either way).

## Seed plan (fixed now; no band-shopping)

- PILOT (8, = twoblow pilot set): 87104, 87109, 87119, 87124,
  87140, 87115, 87123, 87127. Two legs, identical seeds:
  BASELINE leg FIRST (before any src/js edit), then LEVER leg
  (after the rule lands). The legs differ ONLY by this rule.
- CONFIRM (12, fresh seeds, run ONLY if the pilot passes ALL
  GO bars): 87103, 87107, 87120, 87121, 87126, 87128, 87132,
  87134, 87135, 87137, 87138, 87141 (the twoblow confirm set).
  Confirm numbers are reported as their own band, NEVER pooled
  into the pilot for judging.
- No substitutions, no additions.

## Policy stack (identical for both legs)

withFullseatDiag(withSeatDrive(withWinDefer(TF leadfeast))),
FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
FULLSEAT=1, 200 loop-days death-aware cap (harness Game.over
stop; dead villages stop simulating), PLUS the NEW recorder
scripts/policies/contactfinish-diag.js (CONTACTFINISH=1),
wrapped OUTSIDE fullseat-diag. The recorder is a copy of
spikecontact-diag.js with exactly these changes: env gate
renamed SPIKECONTACT -> CONTACTFINISH (all function/store
names renamed likewise), plus the six contactFinish rec fields
above captured per field-fight row. It is policy-side only,
env-gated, pure reads + post-delegation recording, zero
game-state writes, zero RNG draws — the same purity contract
as spikecontact-diag. spikecontact-diag.js itself is NOT
edited. Sweep: scripts/contactfinish-sweep-20261031.js (copy
of the spikecontact sweep, recorder module + env name swapped,
same stdout-only I/O discipline + idle splitter pattern).
Splitter: scripts/contactfinish-split-20261031.js (copy of the
spikecontact splitter, name swapped). Analyzer:
scripts/contactfinish-analyze-20261031.js (contact instrument
split with the SPEAR-COUNTS-AS-MELEE universe + conversion
accounting + lie-rate accounting on remaining drive-off lines
+ wall numbers, per leg, per band never pooled; reuses
scripts/contactbreak-analyze-20261031.js classifyRow verbatim
via require).

## Primary metric (binding)

Judged finishable mFlee CONTACT meetings: wave-3 rows on a leg
classifying CONTACT under the contactbreak definition AND
ending mFlee, with a finish instrument under the
spear-counts-as-melee universe (baseline leg: computed by the
analyzer from instrument fields; lever leg: rows the engine
attempted, cross-checked against the analyzer's universe —
any attempt outside the analyzer universe, or any analyzer-
universe row the engine did not attempt, is reported as an
instrument mismatch and fails the arm's accounting even if
the conversion bar passes). Converted kills: wave-3 rows with
contactFinishKill === true (lever leg only; baseline has no
rule, so its flag count is 0 by construction). Conversion rate
= converted kills / judged finishable mFlee CONTACT meetings
on the lever leg. Unarmed meetings converted: wave-3 CONTACT
mFlee rows with NO instrument (analyzer universe) whose lever
outcome is vKill with contactFinishKill === true — must be 0.

## GO thresholds (pilot, all must hold; a miss is NO-GO, game code reverted, no trace)

- converted kills >= 50% of judged finishable mFlee CONTACT
  meetings on the lever leg;
- unarmed meetings converted = 0;
- deaths attributable to contact-finish attempts = 0;
- median survival >= baseline -10%;
- wave>=3 field deaths <= baseline + 2;
- lie rate on remaining drive-off lines = 0 (every remaining
  drive-off names a weapon actually held, or uses honest
  non-weapon wording).

Confirm (ONLY if pilot GO): same bars on the 12-seed confirm
band, judged on the confirm band alone (converted kills >=
50% of the confirm band's judged finishable meetings, etc.;
median/deaths bars vs the confirm baseline leg on identical
seeds). A confirm miss is NO-GO at confirm and the game code
is reverted.

## Det-gate (before judged sims are trusted)

- Recorder ON vs OFF on 2 pilot seeds (87104, 87127), same
  stack, same seeds, worktree scratch dirs (deleted before
  commit; NEVER /tmp, never the judged corpus): dayHash arrays
  + end fields (gameDays/won/national/table/maxWave/
  endScaleRank) byte-identical. A mismatch stops the run
  until explained.
- Corpus determinism leg: one judged pilot seed re-run to a
  worktree scratch dir is byte-identical to its judged JSON.
- Sweep I/O discipline (fieldkill lesson): the sweep prints
  ONE JSON line per seed to stdout and writes nothing itself;
  a separate idle splitter reads the stdout file and writes
  the per-seed JSONs with a resilient writer (retry + full-size
  verification). stdout/stderr captured to files in single
  FOREGROUND execs, never a backgrounded pipe. Judged corpora
  are NEVER staged in /tmp.

## Horizon + why (death-aware, never a fixed 200d)

Cap 200 loop-days; stop rule is the harness's Game.over
(village lost or won). Identical to twoblow/spikecontact:
wave-3 doors opened late and villages lived with wave 3 for
tens of days on prior bases, so a shorter cap would censor
the meeting tail; the death-aware stop keeps cost at the
survival distribution.

## Panel (§15)

Before/after comparison runs through scripts/balance-panel.js
— as panels built in the balance-panel schema from the two
legs' per-seed corpora (twoblow precedent:
scripts/twoblow-panels-20261031.js), because the official
panel driver runs sweep-compare registry policies only and
cannot express the leadfeast + fullseat-diag stack +
contactfinish instrument. The deviation is stated on the face
of the compare file. Contract metrics mapped where observable
(won, table, national, survival30/60, communityLost); the rest
null, never fabricated. The panel is the instrument; the GO
thresholds above are the judge. Pilot panel attached at pilot;
if confirm runs, the final panel is rebuilt over the full
20-seed band and attached to the evidence file.

## Sense-testing (SENSE-TESTING LAW)

The evidence judges at least 4 contact-meeting transcripts
(converted + leftover) from the lever leg (or, if the lever
yields fewer, every one it yields plus baseline transcripts
to reach the count, labelled as such) for meaning: does the
kill read as earned (a real strike, named weapon, beast
actually at death's door), does the leftover read honestly
(no weapon credited that nobody holds, no-arrows bow never
credited), does any line still credit an unheld weapon?
Counts alone do not pass this section.

## Wall numbers (on the judged band, both legs, never pooled)

National / table / wins, wave reach (maxWave distribution,
wave-4, wave-5), median + max survival, full seat
(fullseat-diag bestSeat == 'full'), per band never pooled.
Arc reach, four-realm formation, trap acquisition by source,
counter discovery rates, and young-link succession survival
are NOT in this corpus — reported as unmeasured, not as zero.

## If NO-GO: revert completely

The game code is reverted so fieldFights.js is byte-identical
to base (verified with `git diff <base> -- src/js/fieldFights.js`
empty) before any landing commit; the killed arm leaves no
trace in src/. Evidence + corpora + panel are retained. The
instrument copies may be retained as measurement tooling ONLY
if they contain no game-code change — otherwise they are
deleted too. The evidence states the revert verification
explicitly.

## If GO: landing

Each landing commit carries its own proof test + evidence
section, message includes [needs-eyes] (combat feel +
narration change), and reports 'ready to merge, pending
coordinator' readiness (the coordinator merges via --ff-only).
Do NOT push, do NOT bump versions, do NOT verify live. Do NOT
merge to master yourself.

## Metric review (carried, filled at evidence time)

- (To be filled from the run: did the spear-counts-as-melee
  universe (17 on the spikecontact band) reproduce on the fresh
  baseline band, or did the fresh band's instrument split
  differ, and why; did any engine contact-finish attempt fall
  outside the analyzer's universe (or vice versa); did the
  plain tactical roll (no ability multipliers) convert at the
  preregistered >= 50% rate, or did the missing multipliers
  starve conversions — and is that a rule-shape finding for
  the NEXT arm, not a re-score of this one; did any non-killing
  strike read as a wasted action or as an honest failed
  put-down; did the wave>=3-only scope prevent the
  fieldfinish2 early-lesser-win divergence; did the control-
  driver step match or diverge, and what does that say about
  citing old corpora on this base; did the lie rate reach 0
  on remaining drive-off lines on BOTH legs, or only on the
  lever leg — the narration fix is in the shared block, so a
  baseline-leg lie would be a code-path leak, not a
  measurement artifact.)
