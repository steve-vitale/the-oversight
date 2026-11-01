# sim-spikecontact-a — spike-vs-last-two separation + contact-finish BUILD readiness (DIAG-GO)

Run: fleshout-loop-a-20261101T0000Z, arm sim-spikecontact-a.
Axis: scale-onramp (converging, NOT converged). Arm type: DIAG /
instrument ONLY — zero game-code change (verified: `git diff
24bf27d80..HEAD --name-only` shows ZERO files under src/; the
sibling arm sim-chorus-a's fieldFights.js work untouched, sibling
Loop B's work untouched, main tree untouched).
Prereg: evidence/2026-10-31/sim-spikecontact-a-prereg.md (commit
0c173d9de; Amendment 1 commit acb810c76; Amendment 2 commit
211a37d05 — both committed BEFORE any evidence verdict, reasons
stated in the prereg itself).
Base pin: 24bf27d80ee2cb5eaf6592e601a3039b2ef355a0 ("Version bump
66239763c-20261101-000436 (batch ship)"). Worktree:
~/workspace/worktrees/sim-spikecontact-a (branch
sim-spikecontact-a). Policy stack (fresh pilot): withFullseatDiag
(withSeatDrive(withWinDefer(TF leadfeast))),
FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
FULLSEAT=1 + SPIKECONTACT=1, 200 loop-days death-aware cap.

## Verdict: DIAG-GO (all four prereg bars pass)

- D1 (spike separation, re-analysis): 6/6 U-COMMITTED fights
  classified, 0 unclassified, across the 20-seed lever corpora;
  24/24 U-FLIGHT fights classified, 0 unclassified, across all
  four legs (unclassified rate 0%, bar ≤25%).
- D2 (spike separation, fresh pilot): 3/3 U-COMMITTED fights
  classified, 0 unclassified. Pilot committed count (3) clears
  the confirm trigger (≥2), so no confirm leg was needed.
- D3 (contact readiness, fresh pilot): 20/20 wave-3 CONTACT
  meetings instrument-classified, 0 unclassified; BUILD-universe
  count (14) and lie rate (20/20 = 100%, with bow/sling/none
  split) both stated. Pilot CONTACT count (20) clears the
  confirm trigger (>0), so no confirm leg was needed.
- D4 (determinism / instrument purity): recorder ON vs OFF
  dayHash + end fields byte-identical on 2 pilot seeds
  (87104, 87127); judged pilot seed 87124 re-run byte-identical
  to its judged JSON; recorder errors 0 on all 8 pilot seeds.
- Panel (§15): N/A, as preregistered — this DIAG arm makes no
  before/after comparison (single leg on current master; the
  re-analysis is descriptive over prior-base corpora, not a
  judged comparison), so there is no panel to attach. Stated
  here rather than omitted.

## Control-driver step (base-pinning discipline)

Prior instrument verbatim (twoblow sweep, TWOBLOW=1) on 2 pilot
seeds (87104, 87127) on THIS base: dayHash arrays byte-identical
to BOTH the old lever-pilot and old baseline-pilot corpora, end
fields identical (gameDays/won/national/table/maxWave/
endScaleRank). The base moved (ship bump, journey r77
measurement-only, contactrec emission) without moving
trajectories on the control seeds — so the old corpora may be
cited as same-trajectory evidence, with the 2-seed scope of the
control stated, not overstated. The fresh pilot then reproduced
the old lever-pilot band EXACTLY (wall 7/7/7, wave-4 5, median
119.5d, committed both 2 / last-two-only 1, flights both 2 /
last-two-only 2 / neither 2) — a second, 8-seed confirmation
that trajectories did not move.

## (a) Spike-vs-last-two separation — KEEP THE LAST-TWO DEFINITION

Definitions (prereg): S = largest proven blow so far ≥ remaining
HP; L = last-two proven blows sum ≥ remaining HP. Proven =
lead-strike damage after multipliers, >0 only; volley, ambush
opener, collision, ally strikes excluded. Committed fights are
classified at the LAST commit line (Amendment 2: the engine
overwrites twoblowCommitMhp/twoblowCommitSum at every re-fire).

U-COMMITTED, re-analysis (lever legs, 20 seeds, 6 fights):
both 5, last-two-only 1, spike-only 0 (impossible by
construction — the gate requires L), unclassified 0.
Conversions (committed fights ending vKill): 3/3 BOTH —
Emma s87124 d33 (max 36 ≥ 22, last-two 71 ≥ 22), Thabo s87107
d68 chorus (max 38 ≥ 2, last-two 73 ≥ 2), Thabo s87107 d85
spool (max 44 ≥ 12, last-two 86 ≥ 12). This confirms 2156Z's
"all 3 conversions pass under both definitions" with the split
now measured, not asserted.
The 3 non-converting committed fights: Kate s87123 d75 mFlee
BOTH at last commit (max 21 ≥ 15, last-two 36 ≥ 15 — at its
FIRST commit it was last-two-only, 21 < 33 vs 34 ≥ 33; the
last-commit convention is what the engine records), Kate
s87123 d93 mFlee LAST-TWO-ONLY (max 24 < 35, last-two 44 ≥ 35),
Nikolai s87126 d79 vFlee BOTH (max 23 ≥ 22, last-two 45 ≥ 22;
companion-floor flight, committed deaths still 0).

U-FLIGHT, re-analysis (break-check mFlee flights, per leg):
- baseline-pilot (8 seeds): both 3, spike-only 1, last-two-only 1, neither 1 (6 flights).
- lever-pilot (8 seeds): both 2, spike-only 0, last-two-only 2, neither 2 (6).
- baseline-confirm (12 seeds): both 4, spike-only 1, last-two-only 1, neither 1 (7).
- lever-confirm (12 seeds): both 3, spike-only 1, last-two-only 0, neither 1 (5).
Per-leg totals: 24 flights, 0 unclassified. (Legs share
trajectories, so per-leg counts are the citable unit; a
same-seed/day/monster/villager dedup is NOT claimed — repeat
meetings the same day collide on that key, e.g. two Emma
chorus meetings on s87124 d33.)

The separation, in full-gate terms: the ONLY spike-only flights
in 20 seeds are two single-blow Callback break flights — Joaquín
s87124 d71 (one 55 blow, beast at 25 HP) and Meshari s87135
d127 (one 40 blow, beast at 16 HP). NEITHER is convertible
under the full gate set: Joaquín's intent is LEARN (gate 4
blocks any commit rule), Meshari's fighter is at 35 HP at the
flight (gate 3 blocks — 35% < 60%). A spike rule with the gates
unchanged converts ZERO additional fights in 20 seeds. The
last-two rule's one extra commit over spike (Kate d93, which
then lost to a dance round) also converted nothing. No
multi-strike spike-only flight exists anywhere in the corpora:
a fighter whose biggest blow covers the remainder almost always
has two blows that cover it too, because proven blows in a
fight cluster in a narrow band.

RECOMMENDATION (the deliverable sentence): the next twoblow
tuning should KEEP the last-two definition. Switching to spike
gains zero measured conversions, re-admits spike-then-weak
patterns the last-two rule was built to refuse (a huge blow
rounds ago, weak blows since), and the only damage-level
separation in 20 seeds is two 1-blow fights that other gates
already refuse. The binding constraint on conversions is the
gate set (HP 60%, engage intent, struck-this-round), not the
damage definition — proven once more by the fresh pilot's
redactor flight (below).

U-FLIGHT, fresh pilot (8 seeds, 6 flights, 0 unclassified):
both 2, last-two-only 2, neither 2, spike-only 0. The two
lever-leg last-two-only flights that fled DESPITE the rule are
gate failures, not definition failures: Emma s87124 d33 repeat
(last-two 57 ≥ 45, fighter min-HP-frac 0.47 → gate 3 likely)
and Gabriela s87123 d93 (the committed fight itself, final
break after a dance round → gate 5; see sense reads).

Secondary (not judged): wave-3 vFlee flights — re-analysis
unclassified 6/55 (pilot) and 41/144 (confirm) in the secondary
set, reasons no-parsed-strikes 45 (fighters who fled without
landing a proven blow) and parse-vs-engine mismatch 7 (ally
misattribution candidates in ability rounds — the known
first-per-round parse limit, bounded to the secondary set;
ZERO mismatches in either judged universe). Fresh pilot vFlee:
5 unclassified, all no-parsed-strikes.

Notable flight (fresh pilot, s87140 d183 redactor): Babatunde
lands a 110-damage spike (aimed 2.5x × Rage x2.0) plus 40 and
46 — BOTH definitions pass easily against 16 HP left — and the
beast still flees, because Babatunde is at 29 HP (gate 3).
Damage definitions do not bind here; the 60% HP gate does.

## (b) Contact-finish BUILD readiness — the BUILD's numbers

Fresh pilot, wave-3 rows 92, CONTACT meetings 20 (21.7%), ALL
ending mFlee (drive-off), ZERO ending evade. (Evade rows in the
pilot, 12, are all healthy-beast avoidances classified FOUGHT;
their HP capture is 12/12 = 100%, matching contactrec's fix.)
Every CONTACT meeting: rounds 0, mDealt 0, intent engage.
Callers: wild 16, aid 4. Monsters: callback 8, chorus_line 5,
spool 4, redactor 3 (row table in the contact JSON; the pilot's
CONTACT set concentrates on s87123 (9) and s87140 (7)).
Beast HP at contact (mHpStart): median 8.5 HP; TEN of 20 at
exactly 1 HP (1/260 or 1/300). The contact break is, half the
time, a beast at death's door walking away for free.

Instrument split (primary, weapon-instrument; 20/20 classified):
- FINISHABLE (ranged with ammo > 0, OR melee equipped/carried): 14.
- NO-REAL-INSTRUMENT: 6.
- BUILD UNIVERSE (finishable mFlee drive-offs): 14. Every one
  of the 14 is finishable via MELEE; ZERO via a usable ranged
  weapon (see below).
- NO-REAL-INSTRUMENT mFlee remainder (BUILD must leave alone
  or narrate honestly): 6.

LIE RATE: 20/20 = 100% of CONTACT drive-offs credit "the bow"
while the fighter holds no usable ranged weapon. Split:
no-ranged-at-all 12, bow-no-arrows 5, other-ranged-no-arrows 3.
Lie-with-melee: 14 (every finishable meeting is a lie told
while holding a melee weapon — the line credits the wrong
weapon, not a missing one).
Why ranged-usable is 0/20 (mechanism, not coincidence): a
fighter holding a bow WITH arrows looses a volley before the
break check; any volley damage makes mDealt > 0, which
disqualifies the row from CONTACT. A CONTACT row with a usable
bow requires every volley shot to miss AND the beast to have
arrived already below the line — possible, observed 0 times
in 20. The BUILD's ranged path is therefore nearly vacuous on
this corpus: the contact-finish instrument is, in practice,
the melee weapon.

SENSITIVITIES (reported, never folded into the primary):
- Spear-inclusive: 17. The 3 other-ranged-no-arrows rows are
  all a HUNTING SPEAR in the ranged slot (engine isRangedWeapon
  rule: range > 1). A spear in hand is plainly a melee
  instrument in fiction, and the engine's melee fold-in counts
  ranged-weapon bonus toward strike damage — but the primary
  split follows the equipment slot, so spear rows count as
  no-instrument. The BUILD prereg MUST decide this explicitly
  (see sim-findings item appended this run). If spear counts
  as melee, BUILD universe = 17, remainder = 3.
- Unarmed-inclusive: 20. The engine's lead strike deals damage
  unarmed (tactical formula with wb = 0), so under an "any
  strike action counts" reading every CONTACT meeting is
  actionable. The primary stays weapon-instrument because the
  BUILD's fiction and the task's no-real-instrument class are
  about a weapon in hand; an unarmed strike against a wave-3
  beast is a separate design question, flagged here, not
  decided here.

NARRATION CONSTRAINTS (binding on any BUILD, from the logs):
1. A no-arrows bow must NEVER count as the finish instrument
   (5 bow rows + 3 spear rows + 12 no-ranged rows prove the
   line lies in all three forms).
2. The drive-off line must name the held weapon: today it
   always says "with the bow" — including for 12 fighters
   holding NO ranged weapon at all, whose logs contain no
   weapon line whatsoever (the line invents a bow from
   nowhere), and for melee holders (crowbar, kitchen knife,
   machete, sharpened stick) whose real weapon goes unnamed.
3. The bow-no-arrows contradiction is visible IN the log
   itself ("has Crude bow but no arrows" directly above
   "drove off with the bow") — a reader can already see the
   lie without any instrument; the BUILD must not reproduce
   it in either direction (neither crediting an unusable bow
   nor silently renaming the action).

BUILD PREREG NUMBERS (writable verbatim): on the fresh-pilot
band (8 seeds, leadfeast stack, wave-3 CONTACT definition as
in the prereg), a contact-finish BUILD judged on
finishable-mFlee-drive-offs has universe 14 (primary) /
17 (spear-inclusive) / 20 (unarmed-inclusive), remainder
6 / 3 / 0. Preregister the universe choice BEFORE the BUILD
runs; do not pick the largest universe after seeing kills.

## Sense-testing (SENSE-TESTING LAW)

Contact transcripts (4, fresh pilot — all rounds 0, mDealt 0,
a single drive-off line each; the meeting IS the line):
1. Dmitri s87115 d84 callback (bow-no-arrows, NO melee):
   "Dmitri has Crude bow but no arrows — the string stays
   drawn, useless." then "Dmitri drove The Callback off with
   the bow". Coherent as a sequence, self-contradictory as a
   claim: the log refutes its own second line. The pure lie.
2. Sanne s87123 d91 chorus (hunting spear, NO melee, beast
   at 1 HP): a single line, "Sanne drove Chorus Line off with
   the bow". No weapon line at all — Sanne holds a spear, not
   a bow, and a 1-HP beast walks away. The spear edge, in one
   line: the BUILD's hardest definitional case.
3. Mia s87140 d165 spool (crossbow-no-arrows, sharpened stick
   melee): "has Crossbow but no arrows" then "drove Spool off
   with the bow". Finishable via the stick the line never
   names; the line credits the wrong weapon.
4. Weronika s87104 d148 callback (no ranged, crowbar melee,
   beast at 1 HP): single line, "drove The Callback off with
   the bow". A crowbar drives nothing in this sentence; a
   1-HP beast escapes a crowbar-holder.
Verdict: the drive-off narration is systematically dishonest
about the instrument in 20/20 cases, in three distinguishable
forms (unusable bow, absent bow, wrong weapon). The fix is
narration + instrument, not narration alone: naming the real
weapon only helps if the BUILD also requires holding it.

Committed-fight transcripts (2, fresh pilot):
1. Emma s87124 d33 chorus (vKill, BOTH): nine steady strikes
   (31, 31, 30, 30, 29, 36, 35, 35, 36, multipliers named
   every line), takes 35 damage, holds at 65% HP with the
   beast at 22 HP (last two 36+35), kills next strike. Reads
   as a decision a real fighter takes: healthy, proven twice
   over, beast breaking. The strike components read as proven
   blows (lead lines only; no ally lines in this fight; the
   one bow-no-arrows line is pre-fight, not a strike).
2. Gabriela s87123 d93 chorus (mFlee, LAST-TWO-ONLY): commits
   at R11 (beast 35 HP, last two 22+22, max 24 — last-two-only
   by 9 HP of spike shortfall), then R12 is a chorus downbeat
   round and Gabriela DANCES instead of striking, so the
   break check fires with vStruckThisRound false and the
   beast flees at 35 HP. The chorus-downbeat leak from 2156Z,
   visible in transcript: the commit line is immediately
   followed by a dance round. A spike rule would not have
   saved this fight either (max 24 < 35) — the leak is in
   round structure (dance rounds don't strike), not in the
   damage definition.
Verdict: strike components read as proven blows; the
committed-finish line reads as a real decision; the contact
drive-off line does not read as a real action in any of its
20 cases.

## Wall numbers (per band, never pooled)

Fresh pilot (8 seeds, current master, twoblow rule in): national
7/8, table 7/8, wins 7/8, wave-4 5/8, wave-5 0/8, median survival
119.5d, max 197d, full seat 0/8 (bestSeat: lesser 7, none 1).
Per seed: 87104 159d won/global/w4; 87109 146d lost/regional/
w4 (the one non-win, non-national seed); 87119 90d won/global/
w4; 87124 112d won/global/w4; 87140 197d won/national/w3;
87115 90d won/global/w3; 87123 112d won/global/w4; 87127 127d
won/global/w3. Full seat 0 and wave-5-reached 0 stand, as in
2156Z. No wall movement is claimed: this is a DIAG arm, no
lever was judged. Arc reach, four-realm formation, trap
acquisition by source, counter discovery rates, and young-link
succession survival are NOT in this corpus — unmeasured, not
zero.

## Metric review (mandatory, §14)

- Preregs judged as written (plus Amendments 1–2, both
  committed before any verdict, neither changing a GO
  threshold). No metric re-scored mid-run.
- Parse misattribution (prereg question): the first-per-round
  rule misattributes an ally strike as a lead strike only
  where the lead takes an ability action and the ally strikes
  in the same round; engine-truth validation caught 7 such
  cases in the SECONDARY vFlee set (parse-vs-engine mismatch)
  and ZERO in either judged universe (committed, flights).
  The rule is safe for the judged claims, bounded for the rest.
- Weapon-instrument primary vs sensitivities: the choice
  matters materially (14 vs 17 vs 20). The BUILD prereg must
  pick one before running; this arm's recommendation is the
  primary (14) with the spear question decided explicitly,
  because the unarmed reading (20) dissolves the
  no-real-instrument class the task asked to measure.
- CONTACT meeting with melee but no ranged: 14/20 — the
  drive-off line says "with the bow" for all 14. The line is
  wrong even when the meeting is finishable.
- Control-driver step: matched byte-identically (2 seeds).
  Citing old corpora on this base is justified at that scope;
  the fresh pilot's exact reproduction of the old lever-pilot
  band extends the confidence to 8 seeds.
- Telemetry-check: not run by this arm (coordinator step; the
  2156Z refusal of recorder corpora by design still applies
  to these corpora, which carry anchorCommit rows).

## Village assessment (plain words)

The village's wave-3 fights now read clearly in both directions.
When a healthy fighter has proven, twice over, that she can
cover a beast's remaining health, she steps in and usually
finishes it — and whether you judge her by her biggest single
blow or by her last two blows makes no difference to the
outcome, because her blows land in a tight band and the one
time they didn't, a dance round stole the kill anyway. The
other end of the meeting is messier: about a fifth of wave-3
meetings end the instant beast and villager meet, usually with
the beast nearly dead — ten times at exactly 1 hit point — and
the story always says the villager drove it off with a bow,
even when the villager holds no bow, or holds a bow with no
arrows, or holds a crowbar. Fourteen of those meetings could
honestly become real finishes under a rule that costs a
weapon strike instead of giving the flee away free; six could
not, because the villager holds no usable weapon at all. That
fourteen is the next BUILD's universe, and the spear in
Sanne's hand is the one case the BUILD must decide on purpose
instead of inheriting by accident.

## Blanks filled or documented

- FILLED (measured): the spike-vs-last-two separation — 6
  committed fights (5 both, 1 last-two-only), 24 re-analysis
  flights + 6 fresh-pilot flights classified, 0 unclassified
  in either judged universe; verdict KEEP last-two, with the
  counts that force it (spike adds 0 convertible fights).
- FILLED (measured): the contact-finish BUILD universe —
  20 CONTACT meetings, 14 finishable (all via melee), 6
  no-instrument, lie rate 100% in three named forms, plus
  the spear (17) and unarmed (20) sensitivities and the three
  narration constraints. The BUILD's prereg is writable
  verbatim from the numbers above.
- DOCUMENTED (future arms, not built here): (1) the
  chorus-downbeat leak, re-confirmed in transcript (commit
  followed by a dance round, beast flees at 35 HP); (2) the
  spear-in-ranged-slot definition edge (sim-findings item
  appended this run); (3) the first-per-round parse limit
  (7 secondary-set mismatches; judged universes clean).
- NOT re-opened: the break line, the 60% HP gate, the engage
  intent gate, the struck-this-round gate, the committed-finish
  NO-GO history, any gate threshold.

scale-onramp stays converging (NOT converged): a DIAG arm
lands no game change, and no wave-5 or full-seat reachability
is shown. food-economy untouched (sibling Loop B lane). DIAG-GO
means the numbers above are citable for the next BUILD arm.

## Landing / readiness

Instruments + prereg + re-analysis + pilot corpora + analyses
committed on branch sim-spikecontact-a (commits: prereg
0c173d9de, amendment 1 acb810c76, amendment 2 211a37d05,
re-analysis 071dd4ddf, instruments e890a2890, pilot + evidence
29876ac58; branch tip at closeout 29876ac58 plus this
closeout-note commit). Proof test
scripts/test-spikecontact-20261031.js: 18/18.
No src/js change in any commit. Scratch dirs deleted before
closeout. Report: ready to merge, pending coordinator
(--ff-only merge; the batch ship job owns pushes). If master
moved under this branch via sibling landings, DO NOT merge
here — report the branch tip and that a rebase onto current
master + proof re-run is needed at landing.
