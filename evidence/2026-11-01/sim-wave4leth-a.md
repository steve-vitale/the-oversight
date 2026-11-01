# sim-wave4leth-a — WAVE-4 FIGHT LETHALITY decomposition (DIAG-GO)

Run: flesh-out loop (loop A), 2026-11-01. Axis: scale-onramp (blocking,
NOT converged). Worker: sim-wave4leth-a. DIAG ONLY — zero src/js changes,
no game-code change, no balance lever, no policy-default change.
Prereg: evidence/2026-11-01/sim-wave4leth-a-prereg.md (committed BEFORE
any judged replay). Corpus: evidence/2026-11-01/sim-wave4leth-a/
(8 per-seed rows + summary.json + analysis.json). Instruments:
scripts/sim-wave4leth-a-sweep.js, scripts/sim-wave4leth-a-analyze.js,
scripts/test-sim-wave4leth-a-parser.js (8/8 PASS).

## Verdict: DIAG-GO

Corpus valid (8/8 rows, days > 0, fieldparty diag errs 0, overflow 0,
wrapper errs 0). End-state complete (67 offered fights, shares sum to
1.0). Killer-survival recorded on every kill fight. 65 fought wave-4
fights — far above the pilot bar of 8 — so this is a populated
measurement, not an INSUFFICIENT-DATA report. Transcripts read + quoted
below. One ranked next step named with numbers (§6).

## Band (why this pilot is not contact-starved)

sim-sortiedpr-a PLAYED band VERBATIM: scripts/policies/
tableseat-nowait.js, LEANLINKRESCUE=1, TABLESEATNOWAIT=1, 180d
death-aware (+10d tail max), fieldparty-form-diag.js reused VERBATIM,
sortie-driver layer living only in the sweep script (once per lingerer
episode after a gorge line, answerLingerer('sortie'), NO HP GATE).
Seeds 75101–75108. Competent-player policy = tableseat-nowait; what
party/gear it fields is measured, not assumed (§5).
Two sweeps ran (see §7 for why): the judged corpus is the second run.
Trajectories reproduced exactly (same per-seed days, wave reach, and
fight counts), so the re-run is a determinism check, not a second sample.

## 1. End-states: fleeing is the modal outcome, dying is second, killing is a rounding error

67 wave-4 fights offered (65 fought + 2 evades — evades are offered, not
fought, and are reported separately per the prereg).

| End-state (fought, n=65) | n | share |
|---|---|---|
| FLED (vFlee) | 43 | 66.2% |
| DIED, leader dies (vDie) | 16 | 24.6% |
| DRIVE-OFF (mFlee) | 5 | 7.7% |
| KILL (vKill) | 1 | 1.5% |

By caller (fought): resolve (wild meetings) 50: 33 fled, 13 died,
3 drive-offs, 1 kill. Sortie (mustered) 10: 7 fled, 1 died, 2 drive-offs,
0 kills. Aid 5: 3 fled, 2 died, 0 kills. The shape is caller-independent:
no caller class kills healthy wave-4 beasts.

## 2. Killer survival: nobody ever survives killing a healthy wave-4 beast — because nobody ever does

- Per-role death rates (denominators per prereg): leader 16/65 = 24.6%;
  beast 1/65 = 1.5%; joined ally 0/5 = 0% — but see the caveat, which is
  the finding.
- The single kill is a round-0 contact finish against a 1-HP herald
  (seed 75103, d156, Zenon, solo, no ally, 10 damage, 0 taken). Leader
  alive, trivially. Killer-survival on kills: 1/1.
- SERIOUS-WOUND fights (prereg def: mHpStart >= 100 AND mDealt >= 200 OR
  beast ends <= 50% HP): ZERO. The deepest wound in the corpus is 105
  damage against a 739-HP strike (ends 634, 85.8% HP left), followed by
  101 against a 525-HP herald (ends 424, 80.8%). Killer-survival on
  serious wounds is therefore vacuous — there is no such fight to
  survive. This is the sharpest form of the #1383 result: the
  healthy-beast slice is not "rarely converted", it is never even
  seriously wounded.
- Damage concentration, honestly stated: on the prereg's kill/serious
  slice the concentration verdict is CONCENTRATED on n=1 (leader 100%,
  ally 0%, volley 0%) — which is not a distribution and is NOT claimed
  as one. The corpus-wide concentration is the real number: total party
  damage 1,298 across 65 fights, of which joined allies dealt 13 (1.0%)
  and volleys dealt 0 (0.0%). Damage is concentrated in the leader
  because the leader is the only fighter who ever deals it.
- No ability ever converts a fight: ability-note inventory across all 65
  fights is Peacemaker Walk-In (5 notes, all on drive-offs), failed
  Walk-Ins (6), stalker openings (4), navigation victories (4), and a
  handful of damage multipliers (x2.0 ×2, x1.3 ×1, x0.8 ×1, Rage ×3,
  Take Aim ×1). 4 of the 5 drive-offs ARE Peacemaker Walk-Ins (0 damage);
  the fifth is a round-0 finish against a 25-HP herald (20 damage).
  Drive-off here is an ability or a dying beast, never a damage victory.

## 3. Stay vs flee: nobody stays past round 3, and fleeing does not save them either

- Rounds distribution (fought): round 0: 2 (both round-0 finishes),
  round 1: 35, round 2: 24, round 3: 4. NOTHING reaches round 4, let alone
  the 15-round cap (cap-15 ends: 0).
- Rounds-to-flee: median 1, range 1–3. Rounds-to-death: median 2,
  range 1–3. The stay/flee question answers itself: there is no
  "staying" population to compare against a "fleeing" one. Parties
  leave at round 1 or die at round 2.
- Flee-mechanism flags (NOT a partition — flags overlap; a fight can
  carry several): hopeless flag 20, HP-floor (fleeHpFrac set) 42,
  learn-first 26, of 43 fled fights. Median lowest-HP fraction on fled
  fights: 0.24 — people run at roughly a quarter of their health left,
  having dealt a median 11 damage (see §4). Fleeing is what the engine
  does at the wound floor, not a choice the data can separate from dying:
  the 16 deaths are the fights where the second hit landed before the
  floor could get them out (median damage taken on deaths 62, same as
  on flees, 62 — the difference between fleeing and dying is one more
  incoming hit, not a different fight shape).
- So: fleeing does not save killers (no killer exists to save), and
  staying does not kill them either (no one stays). The lethality
  decomposition is: wave-4 fights end in round 1–3 by flight or death,
  with the beast essentially untouched. A future staying/morale arm
  cannot be judged on "fewer flees" alone — it must produce round-4+
  fights in which the party survives, or it converts flees to deaths
  (the sim-staying-a warning from 2026-10-29, re-observed here as the
  base rate: 16 deaths already happen without any staying lever).

## 4. Damage: the yardstick, sharpened

- Median damage dealt per fought fight: 11. Median sustained DPR
  (rounds >= 1): 11.0. Maximum single-fight damage: 105. Median share
  of beast HP removed: 2.1%. Median beast starting HP: 817 (range
  1–1300; the wave-4 canon band is 850–1500 species HP, but fought HP
  carries wound history — lingerer beasts arrive pre-wounded, which is
  why the median sits just under the band floor).
- HP-band cut (the #1383 cuts): <=64 HP: 2 fights, 1 kill; 65–90 HP:
  0 fights; >=91 HP: 63 fights, 0 kills, 16 leader deaths. The
  healthy-beast slice is 63/65 of the corpus and converts at 0%.
- Against the #1383 yardstick (sortie DPR 16.0, must beat by ~3.6x):
  this all-caller wave-4 corpus runs at median DPR 11.0, i.e. the
  yardstick's 3.6x bar stands — a staying arm needs ~40–58 sustained
  DPR AND a conversion in the >=91-HP slice, not just longer fights.
  Longer fights at 11 DPR still need ~75 rounds for an 817-HP beast.
- Volley contributes NOTHING: 0 damage across 65 fights, and 24/65
  fights (37%) open with the line "has [bow/sling] but no arrows — the
  string stays drawn, useless." Every bow/sling mention in the corpus
  is a no-arrows line. Ammunition starvation is a visible sub-blank:
  the opening volley — the one free damage source before round 1 —
  never fires on this band, not because leaders lack ranged weapons
  (they carry them) but because they carry no arrows.

## 5. The engine cap, measured, and the ally who is never hit

- Joined fighters: 1 fighter in 60/65 fights, 2 fighters in 5/65 (7.7%
  shout-joined — all 5 via the hopeless shout, 0 via allyFromStart in
  this corpus's sortie/resolve fights). Mustered size: 1 in 55, 2 in 5,
  3 in 5. Mustered-minus-joined gap: 0 in 58, 1 in 4, 2 in 3 fights —
  the 3-fighter muster never fields 3 fighters (cap, as allycap-a
  established; re-observed, not re-litigated).
- The 5 joined fights, all sorties, all fled: Antonella + Ngāwai
  (ally 4 damage), Sophia Vogt + Chantal Mukendi (3), Ursula Weber +
  Onni Korhonen (0), Owen + Estela (6), Miriam Guerra + Tom (0).
  Total ally damage 13. Ally damage TAKEN across all 65 fights: 0.
  Fights with allyTaken > 0: 0. Every joined ally's log-parse reads
  "never struck" (allyHpLeft null, allyDied null — never guessed).
- This reframes the ally death rate: 0% is not "allies survive wave-4
  fights", it is "beasts never target the joined ally". The beast
  focuses the leader exclusively in this corpus. Any arm that hopes
  allies will share damage or tank hits must first change targeting or
  entry — as wired, a second fighter adds at most one 0–6-damage strike
  and absorbs nothing.
- Context (per fight, diag): leaders armed 67/67, leader armorP median
  16 (died-fight leaders median 15, fled-fight leaders median 17 —
  armor does not separate the outcomes at this grain), trick known
  20/67, cornered 10/67, ever-hopeless 20/67. Pantry at fight start
  median 9,350 kcal — villages are fed on fight days; food is not the
  fight-day constraint (one exception: the Brian death fight ran with
  pantry 0, noted in §6, not claimed as a cause).

## 6. Sense-testing law: flees read desperate, deaths read as silent arithmetic

SENSE VERDICT: MIXED (flees desperate, deaths silent).

- DIED — seed 75102, d142, Brian Otieno (sortie, mustered ally Boris
  Kowalski on the roster, engineAllies 1) vs algorithm, 750 HP, 2 rounds,
  31 dealt, 102 taken, pantry 0:
  > "Brian has Sling but no arrows — the string stays drawn, useless."
  > "Brian's gear absorbs 50."
  > "R1: Engagement hits Brian for 51 (49 left)"
  > "R1: Brian strikes for 31 (719 left)"
  > "Brian's gear absorbs 49."
  > "R2: Recommended For You hits Brian for 51 (0 left)"
  > "Boris stood the rear through it, watching the treeline behind them."
  Judged: the death is a hit line to zero, then nothing — no death
  line, no reaction, no grief. And the mustered ally's epitaph is
  "stood the rear... watching" while the leader dies: the muster reads
  as a roster entry, not a party. This is silent arithmetic with a
  passive witness, not desperate and traumatic.
- FLED — seed 75103, d76, Daniyar vs algorithm, 750 HP, 1 round,
  11 dealt, 77 taken, 22 HP left:
  > "R1: Daniyar strikes for 11 (739 left)"
  > "Daniyar's gear absorbs 23."
  > "R1: Recommended For You hits Daniyar for 77 (22 left)"
  > "Daniyar is past holding — they run while running still works."
  Judged: this DOES read desperate — one hit takes three-quarters of
  his health and the flee line names the calculation a person would
  make. The flee lines are the most human lines in the corpus.
- KILL — seed 75103, d156, Zenon vs herald, 1 HP, round 0:
  > "Zenon does not let it slip away — they close in and strike with
  > the stone knife for 10 — The Herald falls. (Contact finish)"
  Judged: honest cleanup of a dying beast, not a triumph. It reads
  true precisely because the beast was at 1 HP — the log does not
  pretend a 10-damage strike slew a healthy wave-4 beast.
- JOINED-ALLY fight — seed 75103, d125, Antonella + Ngāwai vs strike,
  739 HP, 3 rounds, 105 dealt (deepest wound in the corpus), fled:
  > "Antonella is losing — shouts for help! Ngāwai charges in!"
  > "R3: Ngāwai strikes for 4 (634 left)"
  > "Antonella sees how this ends — and runs while running still works."
  Judged: the shout-and-charge reads as people; the payoff (one
  4-damage strike, then flight) reads as the engine cap made visible.
  The party story promises more than the fight delivers.

## 7. Instrumentation note (builder's honesty section)

The first pilot run completed with identical trajectories but a wrong
column: the wrapper read the live monster's HP AFTER the fight for
"mHpStart", which returns end HP (the live object is mutated by the
fight). Caught by cross-checking wrapper rows against diag meetings:
fled fights showed mHpStart == mHpLeft. Fix: snapshot mHpStart before
calling fieldFight (commit a4708e093). The corpus was then re-run in
full; the second run reproduced the first exactly (same per-seed days,
wave reach, fight counts), and a post-fix cross-check matches wrapper
to diag on 67/67 fights for mHpStart and mHpLeft (the single apparent
mismatch in the check was my join key colliding on two same-day
Zenon-vs-herald fights, 424→414 then 414→403 — a chained wounded beast,
both rows agreeing exactly). The first run's numbers are superseded;
every number in this file is from the corrected corpus. Parser proof
test: 8/8 (the test caught one real bug first — an HP-left paren filter
that checked for a paren already stripped — fixed before the pilot).

## 8. Wall numbers (reported, never claimed as movement)

8 seeds: won 1 (seed 75104, wave 3 — a win without wave-4 reach, not a
wave-4 story), national ever 5/8, national final 3/8, table invited 3/8,
table entered 1/8, wave-4 reach 6/8, wave-5 reach 0/8, median survival
180d (capped), starvation deaths 2, total deaths 318. Death-cause
leaders (labels verbatim): 'villager:combat' 126,
'villager:villager combat' 75, 'player:the wild' 46,
'villager:monster' 17, 'villager:sortie combat' 11. Wave 5
remains unfought in normal play on this band.

## 9. Caveats

- Sortie-slice drift vs #1383: this corpus has 10 wave-4 sortie fights
  (7 fled, 1 died, 2 drive-offs, 0 kills); #1383 reported 7 wave-4
  sorties with 4 leader deaths on the October 28 master. The substrate
  is verbatim but master moved between Oct 28 and Nov 1, so the slice
  counts differ; the conclusion (0 healthy-beast kills) is identical
  and is now measured on 63 healthy-beast fights, not 7.
- Flee-mechanism flags overlap and are not a partition (§3).
- Evade fights (2) carry no mHpStart (evade happens before contact) —
  they count as offered, not fought, and are excluded from HP bands.
- Concentration on the prereg slice is n=1 and is not a distribution;
  the corpus-wide shares (leader 99.0%, ally 1.0%, volley 0.0%) are the
  concentration finding.

## 10. Metric review

- Prereg bars all met: corpus valid, end-state 100% classified,
  killer-survival recorded on every kill fight, 65 fought fights ≥ 8,
  transcripts read + quoted, next step named below.
- Metric doubts for the NEXT run (not re-scored here): (a) the
  "serious wound" bar (mDealt ≥ 200 OR ≤50% HP) produced zero fights —
  on this band the bar sits above everything the engine produces; a
  future arm should ALSO track a "deepest wound" ladder (e.g. ≥100
  damage, of which this corpus has exactly 2) so progress short of
  "serious" is visible. (b) The concentration verdict needs a
  corpus-wide share as its primary (added in §2/§9 above) because the
  prereg slice can be empty. (c) Ally-death parsing by log line is
  sound (0 struck allies is a real zero: allyTaken is 0 on all 65
  fights in the diag rows too), but a future arm should confirm
  targeting directly in code rather than by log absence.

## 11. Ranked next step (for the staying/morale arm)

1. STAYING/MORALE ARM, sharpened yardstick (this arm's output, not a
   new claim): must (i) produce round-4+ wave-4 fights in which the
   party survives — the current max is round 3 and the current death
   median is round 2, so "fewer flees" without survival converts
   flees to deaths; (ii) beat median DPR 11.0 by ~3.6–5x toward
   40–58 sustained AND convert at least one >=91-HP fight — longer
   fights at current DPR need ~75 rounds for the median 817-HP beast;
   (iii) account for the ally who is never hit (0/65 fights with
   allyTaken > 0) and the volley that never fires (0/65, 24/65
   no-arrows lines) — both are free damage/tanking the current engine
   leaves on the table, and either one moving would show up in this
   decomposition before any kill does. Measure with this arm's
   decomposition, not with DPR alone: end-state shares, rounds-to-
   flee/death, per-role death, and deepest wound are the yardstick.
2. AMMO SUB-BLANK (documented, not chased here): leaders carry
   bows/slings with no arrows on 24/65 wave-4 fights. An ammo-supply
   measurement (do wave-4 leaders ever arrive with arrows, and what
   would a volley add?) is a cheap, narrow follow-up with a clean
   counterfactual.
3. DEATH-NARRATION BLANK (documented, not chased here): leader deaths
   in field fights get no death line and no witness reaction (Brian
   d142: ally "stood the rear... watching"). A narration pass that
   speaks a field death would close the sense gap without touching
   any mechanism.

## What this arm does NOT claim

No game change, no lever, no wall movement, no re-judgment of
sortiedpr/fieldability/allycap verdicts (all stand). The 0% ally death
rate is not "allies are safe" — it is "allies are never targeted".
The 1 kill is not a wave-4 kill — it is a 1-HP contact finish.
[needs-eyes] NOT used: DIAG instrumentation only, no feel/combat/UI
change for Steve to playtest.
