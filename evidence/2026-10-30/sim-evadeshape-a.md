# sim-evadeshape-a — EVADE-AS-SHAPE CENSUS, WIDER BAND (32 SEEDS)

Run: flesh-out loop, run fleshout-20261030T0533Z. Axis: scale-onramp
(blocking axis, converging, NOT converged). Worker: sim-evadeshape-a.
DIAG arm, MEASUREMENT ONLY — zero src/js game changes, no default
flip, no gate change.
Preregistration (binding, committed BEFORE any judged analysis):
evidence/2026-10-30/sim-evadeshape-a-prereg.md (commit 4a559b12).
Instruments: commit 73d31cfe (evadelog recorder + 32-seed sweep +
evade analyzer, fixtures 44 checks) and commit 0f6662e3 (channel /
wave-4 / gear breakdowns on the same corpus, legs unchanged).
VERDICT: DIAG-GO + SHAPE-GO (all-wave). Every machine leg PASSES,
the taxonomy audit PASSES, determinism PASSES, sense PASSES (all
328 evade lines read). The all-wave shape verdict is reportable
(328 evades, far above the prereg bar of 5). The WAVE-4 shape
verdict is INSUFFICIENT-DATA (held): only 4 wave-4 evades, below
the prereg bar of 5 — the wave-4 evade shape is described, not
characterized, and no wave-4 evade claim is softened into a GO.
The w4meet NO-GO is thereby closed on its own terms: the taxonomy
now has its PRE-CONTACT-EVADE class, and OTHER = 0 on a band twice
as wide.

## Plain words first

An evade is not a general meeting shape. It is an expedition
shape, and only an expedition shape. On 32 seeds, 328 meetings
end with a villager seeing a beast in time and giving it room —
and every single one is an expedition-caller meeting, alone on
the tile, with no crew and no ally. Field meetings never evade
(0/2,599) and raid meetings never evade (0/1,164). The reason is
in the wiring, not the dice: only the expedition path in
villager-agency.js passes `awareness: true` to fieldFight, so
only it runs the pre-fight awareness check that can produce
'evade'. Every other fieldFight caller omits the flag, so its
pre-contact outcome is the beast scattering instead — and
scattering is the dominant pre-contact outcome in the game:
2,272 of 4,334 meetings (52%) end with the beast leaving before
contact, against 328 evades (7.6%). The taxonomy fix matters
because the old outcome list lumped the evade in with OTHER and
hid this channel split; the census matters because it shows the
split is total, not partial.

Who evades: expedition villagers out alone, always armed, never
a wave-3 veteran, usually not a scholar (0/328 scholar-led).
Evades skew early-wave and early-run: 216 wave-1, 89 wave-2,
19 wave-3, 4 wave-4, 0 wave-5 (no wave-5 meeting exists in-band
to evade). About half are warned by the corpus definition
(153/328 with a prior meeting of the type or a known counter);
all 4 wave-4 evades are unwarned — first contacts, every one.
After an evade, the story usually moves on, not back: only
148/328 evades are followed by another meeting with the same
beast type in the seed, and none of the 4 wave-4 evades is ever
followed by its type again. Evasion buys time, not safety:
313/328 evaders appear in a later meeting, and 204/328 have a
recorded death later in the run — including all 4 wave-4
evaders, dead 2, 10, 14, and 26 days after their clean escape.
The evade line itself is honest and knowledge-gated: unknown
beasts get generic phrases ("The Ugly Beast", "Big-Eyes"), known
beasts get their true names, and the same villager can be seen
learning a name across evades (Aaron's gallowdeer goes from "the
thing with headlights for eyes" to "Highbeam Deer").

## Header (pre-registered) vs result

- COMPLETENESS: 32/32 valid seeds AND all seven recorders errs 0
  with overflow empty AND joins 100% AND evadelog count == joined
  evade count AND every universe row assigned a shape + outcome
  class AND taxonomy OTHER = 0.
  RESULT: 32/32 rows valid; joins 4,334/4,334, 0 errors, 0 branch
  mismatches, 0 wave disagreements; evadelog 328 == joined evades
  328 (multiset diff 0); shape OTHER = 0; taxonomy OTHER = 0 →
  PASS.
- TAXONOMY-AUDIT: 1-seed pilot (75101) distinct (rounds-bucket,
  outcome) pairs all covered by the taxonomy before the judged
  sweep.
  RESULT: pilot pairs — rounds<1 x evade (15), rounds<1 x mFlee
  (81), rounds<1 x vKill (5), rounds>=1 x mFlee (27),
  rounds>=1 x vFlee (8), rounds>=1 x vKill (14) — all covered,
  no OTHER pair → PASS. (vDie appears in no pilot pair; its
  DEATH class is fixture-proven, not pilot-observed. Disclosed,
  not hidden.)
- DETERMINISM GATE: one seed re-run into a scratch EVID dir;
  its row JSON byte-identical.
  RESULT: seed 75120 re-ran byte-identical (analyzer --detgate
  DETGATE-PASS); scratch dir removed after the diff → PASS.
- SENSE BAR: ALL evade log lines read in full (evadelog verbatim
  lines; every evade has exactly one line).
  RESULT: all 328 lines read in full (298 distinct line texts;
  duplicates are same-name/same-phrase repeats across seeds);
  bad line counts 0; wave-3/4 evade lines cross-checked against
  w4dpr's stored logs: 23/23 match verbatim → PASS.
- FIXTURE BAR: taxonomy, tile rule, shape mapping, warned
  signals, readiness shortfall, join rule, evade-damage-anomaly
  flag, after-evade next-meeting logic proven on synthetic rows
  before judging.
  RESULT: FIXTURES-PASS (44 checks, 0 fails) → PASS.
- SHAPE VERDICT: reportable iff total evades >= 5; wave-4 shape
  reportable iff wave-4 evades >= 5.
  RESULT: all-wave SHAPE-GO (328 >= 5); wave-4 shape
  INSUFFICIENT-DATA (4 < 5), held, described not characterized
  → the two verdicts are quoted separately, as preregistered.
- UNLOCK-VS-CONTACT PAIR (reporting leg): per seed, wave-4
  unlock AND wave-4 meeting counts both reported.
  RESULT: reported per seed below; unlock 20/32, contact 13/32
  → PASS as a reporting leg.
- WALL NUMBERS are REPORT-ONLY (see below). No wall number is
  a GO leg.

## Wall numbers (this band, 32 seeds, tableseat-nowait, 180d — REPORT-ONLY)

- Wins: 14/32, all lesser seats (full 0). National ever: 23/32.
  National final: 19/32. Table reached: 21/32. Table entered:
  14/32 (every entered seat won a lesser seat).
- Wave reach (unlock flag): wave 1: 32/32, wave 2: 32/32,
  wave 3: 29/32, wave 4: 20/32, wave 5: 0/32.
- Median survival: 115d (analyzer convention — upper-middle row;
  days sorted [31, 35, 86, 90, 90, 91, 96, 99, 100, 101, 101, 104,
  110, 114, 115, 115, 115, 118, 126, 128, 130, 143, 150, 152, 160,
  165, 174, 180, 180, 180, 180, 180]; statistical median 114.5d,
  noted for comparability).
- Deaths: 1,109 total. Starvation: 8.
- Death causes (1,109): villager:combat 449 (40.5%),
  villager:villager combat 274 (24.7%), player:the wild 154
  (13.9%), villager:expedition 71 (6.4%), villager:monster 48
  (4.3%), rest small. This band does not starve; it is killed
  in combat, as before.
- Wave-4 meetings on this band: 87 (vs 21 on w4meet's 16 seeds
  — the wider band + heavy new seeds 75119/75129, not drift on
  the shared seeds; first-16-seeds wave-4 count is unchanged
  in shape). Wave-4 outcomes: FLEE 54, DEATH 27, EVADE 4,
  SCATTER 1, DRIVE-OFF 1, KILL 0. Wave-4 kills stay 0 — now on
  87 meetings, not 21.

## Q1 — the taxonomy, fixed (the w4meet NO-GO, closed)

One class per meeting, from recorded (rounds, outcome) only:

| Class | Rule | n in-band |
|---|---:|---:|
| PRE-CONTACT-EVADE | rounds < 1 AND outcome 'evade' | 328 |
| PRE-CONTACT-SCATTER | rounds < 1 AND outcome 'mFlee' | 2,272 |
| PRE-CONTACT-KILL | rounds < 1 AND outcome 'vKill' | 20 |
| KILL | rounds >= 1 AND outcome 'vKill' | 427 |
| DRIVE-OFF | rounds >= 1 AND outcome 'mFlee' | 719 |
| FLEE | rounds >= 1 AND outcome 'vFlee' | 510 |
| DEATH | rounds >= 1 AND outcome 'vDie' | 58 |
| OTHER | anything else | 0 |

The four-way distinction that must never blur: evade (no fight,
villager saw first) vs flee (fight, then villager left) vs
drive-off (fight, then beast left) vs scatter (no fight, beast
left). Evade-damage anomalies: 0 — every evade row has mDealt 0
and vTaken 0, as the definition expects. The taxonomy audit
leg (new in this prereg, proposed in w4meet's metric review)
caught nothing this time — and that is the point: the audit
exists so a taxonomy failure is found on a 1-seed pilot, not
on a judged band.

## Q2 — the census: evades by channel, wave, party, caller

### By channel (the headline — the split is total)

| Channel | Meetings | Evades | Scatters | Evade rate | Scatter rate |
|---|---:|---:|---:|---:|---:|
| wild (field) | 2,599 | 0 | 1,517 | 0% | 58.4% |
| raid | 1,164 | 0 | 755 | 0% | 64.9% |
| other (expedition) | 571 | 328 | 0 | 57.4% | 0% |
| TOTAL | 4,334 | 328 | 2,272 | 7.6% | 52.4% |

Mechanism, read from src/js (not inferred from the counts):
fieldFight's awareness check runs only `if (opts.awareness)`,
and the ONLY caller passing `awareness: true` is the
expedition path in villager-agency.js (expeditionMonster:
`fieldFight(vid, m, null, { awareness: true, ... })`). The
field caller (game.js wild), the raid caller (game.js raid /
havenGrowth.js), the contest callers, and the nomad callers
all omit the flag. The corpus matches the wiring exactly:
0 evades in 3,763 non-expedition meetings, 328 in 571
expedition meetings, 0 scatters in expedition meetings. An
"evade lever" that is not an expedition lever is therefore
mis-aimed: on current wiring, evasion cannot be raised for
field or raid meetings without first wiring the awareness check
into those callers — which is a design change, not a tuning
change, and is proposed (not built) under RANKED NEXT.

### By wave (meetings in parentheses)

| Wave | Meetings | Evades | Evade rate |
|---|---:|---:|---:|
| 1 | 2,977 | 216 | 7.3% |
| 2 | 836 | 89 | 10.6% |
| 3 | 434 | 19 | 4.4% |
| 4 | 87 | 4 | 4.6% |
| 5 | 0 | 0 | n/a (no wave-5 meeting exists in-band) |

Evades exist at every reached wave but concentrate at wave 1
(66% of evades). Wave-3 evade beasts (9 types): ad_break,
buffering, callback, chorus_line, focus_group, gavel, redactor,
spool, terms_of_service. Wave-4 evade beasts: eater (1),
algorithm (2), strike (1) — see the wave-4 section.

### By party, caller, intent, gear (all evades)

- Party: solo-tile 328/328; tile-mates 0; joined 0. Crew size
  0 at all 328 evades. Evades are a lone expedition villager's
  shape — nobody is beside them to join, and nobody needs to
  be: the meeting never becomes a fight.
- Caller: other (expedition) 328/328. No other caller produces
  an evade in-band.
- Intent: learn 154, engage 174 — evasion does not care what
  the villager went out intending. (Intent is recorded at the
  meeting; the awareness check runs before intent matters.)
- Scholar-led: 0/328. Armed: 328/328. ArmorP: range 1–63,
  median 12. VeteranW3 (wave-3+ kill in the ledger): 0/328.
  The evader is an armed non-veteran villager; gear does not
  separate evaders from fighters in-band (fighters are also
  armed 21/21 at wave 4 in w4meet), and the prereg's refusal
  stands: do not turn the evade into a gear story. The log
  credits sight, the engine formula is tracking/ability-based,
  and tracking XP / game_sense / tracker / echo_location are
  NOT in any recorder row — so no evade predictor is claimed
  from this corpus. A future instrumented arm that records
  tracking XP and abilities at evade time could test the
  formula; this one cannot, and says so.
- Evade days: range d2–d180, median d51. Evades happen from
  the first week to the last day; 30/32 seeds have at least
  one evade (exceptions: 75121 with 231 meetings and 0 evades,
  75132 with 113 meetings and 0 evades — both verified by the
  evadelog cross-check, not by recorder absence: their joined
  evade counts are also 0).

### By beast (top counts; 47 types evaded in all)

speedbump_turtle 19, living_wire 16, anaconda_empress 14,
gallowdeer 14, mirrormoth 12, drumbelly_tanuki 11,
white_noise_heron 11, moderator 11, sunbasker 10, and 38 more
types at 1–9 each. No beast type dominates evasion; the
distribution follows the expedition pool, not a beast-specific
evade affinity — with one caveat: the corpus cannot separate
"this type is evaded often" from "this type is met often on
expeditions", because the expedition meeting pool itself is
not broken out by type here. The count is reported as evades
per type, never as an evade rate per type.

## Q3 — warned vs unwarned (corpus definition, with its caveat)

WARNED = prior meeting with the same beast type in the same
seed (W1) OR counter known for the type at the meeting (W2).
W3 (same wounded individual, mHpLeft == next mHpStart) is 0
for evades — structurally N/A, not a finding: every evade is
an expedition meeting, where mHpStart is null (no live start
HP recorded), so the W3 condition can never fire. The W3
column is reported as N/A-by-construction wherever evades are
quoted, never as "no re-meets".

| Wave | Evades | Warned | W1 | W2 |
|---|---:|---:|---:|---:|
| 1 | 216 | 107 | — | — |
| 2 | 89 | 40 | — | — |
| 3 | 19 | 6 | — | — |
| 4 | 4 | 0 | 0 | 0 |
| TOTAL | 328 | 153 (46.6%) | 152 | 99 |

(W1/W2 overlap: 152 + 99 = 251 signal hits across 153 warned
evades; the split by signal is band-total, per the prereg.)
CAVEAT, carried verbatim in spirit: an "unwarned" evade means
"no prior-type contact and no counter knowledge in the corpus",
NOT "the village had zero warning in fiction" — and it strains
hardest exactly here, because the evader WAS warned by their
own eyes at contact ("saw in time"). The corpus classifies
evades by PRIOR signals only; the evade log line itself is
the awareness signal, reported as sense evidence, not
retrofitted into the warned definition. All 4 wave-4 evades
are unwarned first contacts (prior-type count 0, trickKnown
false) — the village meets wave 4 blind even when it meets it
by evasion.

## Q4 — after an evade (re-meeting, later outcome, villager survival)

Per evade, corpus order per seed:

- NEXT SAME TYPE (any villager): present for 148/328 evades
  (45.1%), median gap 12 days; absent for 180/328 (censored
  by village end or by the type never reappearing). Next-type
  outcomes: DRIVE-OFF 42, PRE-CONTACT-EVADE 42, KILL 23,
  PRE-CONTACT-SCATTER 23, FLEE 14, DEATH 3, PRE-CONTACT-KILL 1.
  The commonest sequel to an evade is another evade or a
  drive-off — the type, when re-met, is again not fought to a
  villager death (3/148).
- NEXT SAME VILLAGER, SAME TYPE: present for 65/328 evades
  (19.8%), median gap 21 days; absent for 263/328. Next-same
  outcomes: PRE-CONTACT-EVADE 24, PRE-CONTACT-SCATTER 21,
  DRIVE-OFF 9, KILL 4, FLEE 4, DEATH 2, PRE-CONTACT-KILL 1.
  The same villager re-evading the same type (24) is the
  single commonest same-villager sequel — evasion repeats.
- SAME-INDIVIDUAL CANDIDATE (narrow rule: next same-type
  meeting with non-null mHpStart equal to the evade's mHpLeft):
  exactly 1 in-band — seed 75106 day 53, anaconda_empress,
  next meeting same day (gap 0) by a different villager, HP
  90 == 90, outcome FLEE. This candidate is WEAK by the rule's
  own terms (same day, different villager, a low HP shared by
  any fresh spawn at that HP) and is reported as "candidate by
  the narrow rule only", never as identity proof. The honest
  headline is: individual-level evade aftermath is
  UNMEASURED in this corpus — the expedition channel records
  no live start HP, so wound continuity cannot track evaded
  beasts. (Contrast w4meet's field/raid chains, where live HP
  makes W3 tracking possible.)
- VILLAGER AFTERMATH: 313/328 evaders appear in a later
  meeting (alive at least until then); 204/328 have a
  recorded death after their evade day (deathsDetail exact-vid
  match; death causes dominated by 'the wild' 120, contest 20,
  'a wound that wouldn't close' 13, monster 12). 119 evaders
  have later meetings but no recorded death match (alive at
  last appearance, or died unrecorded); 5 have neither a later
  meeting nor a death match (end-of-run censoring). Deaths-
  matchability: 31/32 seeds have at least one deathsDetail
  `who` equal to a meeting `vid`; seed 75109 is UNMATCHABLE
  (no death `who` matches any meeting `vid` there), so its
  evaders' aftermath is last-appearance only — 75109's evades
  are included in the later-meeting counts and excluded from
  any death-match claim. Of the 204 death matches, 161 carry
  player=true at death (the evader later became, or was, the
  player character when they died) — reported as the recorded
  flag, not as a succession claim: the corpus does not record
  when a villager becomes the player character.
- REPEAT EVADERS: 50 (seed, villager) pairs evade 3+ times in
  their seed (max 16: Catalina on 75115; 15: Milagros on 75115;
  14: Lauren on 75123, Mario on 75126). Repeat evasion is a
  villager-level trait in the data, not a one-off: the same
  expedition villagers keep seeing beasts in time. Whether
  that is tracking XP accumulating (the engine credits +2
  tracking XP per evade) is the natural hypothesis — and it
  is NOT testable from this corpus, because tracking XP is
  not a recorder field. Named as the hypothesis, not the
  finding.

## Q5 — the wave-4 evade subset (described, NOT characterized)

Wave-4 meetings in-band: 87. By shape: wild 61, raid 20,
other 6. By outcome: FLEE 54, DEATH 27, EVADE 4, SCATTER 1,
DRIVE-OFF 1, KILL 0. The 4 evades (all unwarned, all solo-tile
expedition, all with no later same-type meeting in their seed):

| Seed | Day | Beast | Evader | Gear | Aftermath |
|---|---:|---|---|---|---|
| 75110 | 51 | eater | Ellis (gen_8mimj4v) | armorP 50, crossbow | 2 later meetings (last d54); died d77 'the wild' |
| 75120 | 78 | algorithm | Hang (gen_goohhmb) | armorP 4, spear | 0 later meetings; died d80 'the wild' |
| 75123 | 67 | algorithm | Lauren (gen_ek49jwh) | armorP 10, bow | 7 later meetings (last d75); died d81 'the wild' |
| 75125 | 130 | strike | Ethan (ethan_hunt) | armorP 17, hatchet | 6 later meetings (last d133); died d140 'the wild' |

Notes, each checkable in the analysis JSON's evadeDetail:
- The 75110 eater evade is the w4meet discovery, reproduced
  exactly on the wider band (same seed, day, beast, evader,
  gear) — the base has not moved.
- The 75125 strike evade's line reads "Ethan saw Big-Eyes in
  time and gave it room" — a wave-4 beast met unknown, given a
  generic phrase. Knowledge-gating holds even at wave 4.
- All 4 wave-4 evaders die later in their runs (gaps 2, 10,
  14, 26 days). Evasion at wave 4 buys days, not survival —
  but with n=4 this is a description of four cases, not a
  rate, and it is NOT a shape verdict. The prereg bar (5)
  exists for exactly this reason.
- Wave-4 evades are 4/6 of the other-channel wave-4 meetings
  (the other 2 are both 1-round FLEEs: 75119 d82 eater,
  75123 d65 congregation — the other-channel wave-4 meeting
  is rare because expedition meetings rarely draw wave 4 at
  all: 6/87). No wave-4 raid or field meeting evades, as the
  channel rule predicts.

## Q(e) — unlock vs contact per seed (the pair, never reach alone)

Unlock = waveReach >= 4; contact = wave-4 meetings; evades =
all-wave evades (wave-4 evades in parentheses).

| Seed | Days / end | Wave reach | Unlocked 4 | Wave-4 meetings | Evades |
|---|---:|---:|---:|---:|---|
| 75101 | 115 / over | 4 | yes | 0 | 15 (0) |
| 75102 | 86 / lost | 4 | yes | 13 | 8 (0) |
| 75103 | 90 / over | 3 | no | 0 | 5 (0) |
| 75104 | 101 / over | 4 | yes | 0 | 6 (0) |
| 75105 | 165 / over | 4 | yes | 0 | 6 (0) |
| 75106 | 115 / over | 3 | no | 0 | 24 (0) |
| 75107 | 114 / over | 4 | yes | 0 | 2 (0) |
| 75108 | 31 / lost | 2 | no | 0 | 2 (0) |
| 75109 | 180 / survived | 3 | no | 0 | 21 (0) |
| 75110 | 118 / over | 4 | yes | 2 | 4 (1) |
| 75111 | 99 / over | 3 | no | 0 | 9 (0) |
| 75112 | 128 / over | 3 | no | 0 | 14 (0) |
| 75113 | 150 / lost | 4 | yes | 3 | 4 (0) |
| 75114 | 160 / lost | 4 | yes | 1 | 5 (0) |
| 75115 | 180 / survived | 2 | no | 0 | 34 (0) |
| 75116 | 180 / survived | 4 | yes | 2 | 23 (0) |
| 75117 | 143 / over | 4 | yes | 0 | 4 (0) |
| 75118 | 130 / lost | 4 | yes | 0 | 3 (0) |
| 75119 | 174 / lost | 4 | yes | 18 | 7 (0) |
| 75120 | 100 / lost | 4 | yes | 2 | 21 (1) |
| 75121 | 180 / survived | 3 | no | 0 | 0 (0) |
| 75122 | 126 / lost | 4 | yes | 3 | 1 (0) |
| 75123 | 115 / lost | 4 | yes | 4 | 33 (1) |
| 75124 | 96 / over | 4 | yes | 0 | 6 (0) |
| 75125 | 152 / lost | 4 | yes | 10 | 19 (1) |
| 75126 | 180 / survived | 3 | no | 0 | 15 (0) |
| 75127 | 35 / lost | 2 | no | 0 | 5 (0) |
| 75128 | 101 / over | 4 | yes | 1 | 14 (0) |
| 75129 | 104 / lost | 4 | yes | 27 | 8 (0) |
| 75130 | 91 / over | 4 | yes | 1 | 2 (0) |
| 75131 | 90 / over | 3 | no | 0 | 8 (0) |
| 75132 | 110 / lost | 3 | no | 0 | 0 (0) |

UNLOCK ≠ CONTACT, still: 20/32 unlock wave 4, 13/32 meet a
wave-4 monster, 7 unlock seeds never meet one. Evades do not
track unlock: the two zero-evade seeds (75121, 75132) never
unlock wave 4, but the highest-evade seeds (75115: 34, 75123:
33) sit at wave 2 and wave 4 respectively — evasion volume is
an expedition-activity signal, not a progression signal.

## Sense-testing law (all 328 evade lines read in full)

S1 — the template holds, and knowledge-gating shows through
it. Every line is "<Name> saw <phrase> in time and gave it
room." — one line, no truncation, no mid-log endings. The
phrase is the beast as the villager knows it: revealed types
get true names ("Highbeam Deer", "The Moderator", "Spool"),
unrevealed types get generic sense-phrases ("The Ugly Beast",
"Big-Eyes", "Loud-Eyes", "Big Loud", "the drumbeat with no
drummer", "the thing with headlights for eyes"). The same
villager learning a name across evades is visible in-line
(Aaron, 75123: gallowdeer as "the thing with headlights for
eyes" on d4, twice, then "Highbeam Deer" on d10). No robotic
or repeated dialogue is flagged beyond the deliberate single-
line template — which is the engine's evade line, not filler:
one line is all a non-fight needs.

S2 — same-day doubles (3 groups): Gabriela evades a
cliffhanger twice on 75102 d6; Christian evades a speedbump
twice on 75114 d9; Aaron evades a gallowdeer twice on 75123
d4. Same villager, same beast, same day, two separate
expedition meetings. Coherent as expedition legs re-meeting
the same beast — but it is the one place the transcript
strains: nothing in the line distinguishes the two meetings
(no leg, no place). A reader cannot tell whether the beast
was met twice or the log doubled. The corpus proves two
meetings (two joined rows, two evadelog rows, distinct part
counters); the line does not. Reported, not smoothed.

S3 — the wave-4 lines read like the wave-1 lines, and that is
the point. "Ellis saw The Eater in time and gave it room."
"Hang saw The Algorithm in time and gave it room." "Lauren
saw The Algorithm in time and gave it room." "Ethan saw
Big-Eyes in time and gave it room." (the strike, unknown).
No special wave-4 evade language exists — evasion is one
mechanic at every wave, and its line does not scale with the
beast. The strike line is the most honest in-band: a
wave-4 monster, met blind, described by what the villager
could actually see.

S4 — busy expedition days read as busy days, not as log
spam. Andre (75101 d85) evades three beasts in one day
(living_wire, rut_king, hummice); Lauren (75123 d67) evades
four (voice_mimic_radio, speedbump, algorithm, focus_group);
Mario (75126 d14) evades three. Each
line names a different beast; the multiplicity is the
expedition meeting many beasts, not one beast logged many
times. Cross-cutting: (1) evasion is always solitary — no
line ever mentions an ally, matching the solo-tile census;
(2) no evade line ever mentions gear, tracking, or an ability
— the line credits sight alone, which is why no gear or
ability predictor is claimed from this corpus.

## RANKED NEXT (with numbers — no lever built here)

1. EXPEDITION-AWARENESS INSTRUMENT (the mechanism question
   this census licenses). The census proves evasion is
   expedition-only by wiring, and proves repeat evaders exist
   (50 pairs at 3+, max 16) — but cannot test WHY they evade,
   because tracking XP and abilities (game_sense / tracker /
   echo_location) are not recorder fields. Next arm: a
   recorder that captures tracking XP + ability flags at
   every expedition meeting, then tests whether evade rate
   rises with tracking (engine formula: base 0.35 + up to
   +0.30 tracking + behavior/speed/notice/size terms +
   ability bonuses, clamped [0.05, 0.90]). If the formula
   holds in-corpus, evasion becomes a trainable meeting shape
   (tracking as a lever); if it does not, the formula itself
   is the finding. Licensed by 328 evades + 50 repeat pairs;
   not a lever yet.
2. FIELD/RAID AWARENESS DESIGN QUESTION (Steve-call, not a
   build). The channel split is total (0/3,763 non-expedition
   evades). Before any "evasion lever" is built for field or
   raid meetings, Steve must rule on whether the awareness
   check SHOULD run there at all: field/raid meetings
   currently resolve pre-contact by beast scatter (58–65%),
   and wiring awareness into them would change the dominant
   pre-contact outcome of the game, not tune a dial. This arm
   prices the split; it does not recommend the wiring.
3. WAVE-4 EVADE SHAPE — STILL INSUFFICIENT-DATA (n=4).
   Do not judge any wave-4 evade lever from 4 cases. A
   band that produces more wave-4 evades (or an expedition-
   heavy band at wave-4 villages) must come first; the
   prereg bar of 5 stands for the next run too.
4. SCATTER CENSUS (the bigger pre-contact shape, named not
   chased). Scatters are 2,272/4,334 (52%) — seven times the
   evade count — and this arm classifies them but does not
   characterize them (by beast, by channel, by what the beast
   does after scattering). If pre-contact outcomes are the
   meeting-shape question, scatter is the larger half of it.
   Proposed as the next census, not built here.
5. EVADED-BEAST PROVENANCE (finding, needs an instrument).
   Individual-level evade aftermath is unmeasured: the
   expedition channel records no live start HP, so the
   single same-individual candidate is weak (same day,
   different villager, HP 90 == 90) and W3 is structurally
   N/A for evades. If chains matter for evades, the next
   instrument must record a beast identity (spawn seq) on
   the expedition path before any chain arithmetic is
   trusted.

## Findings for the coordinator (reported, NOT appended by this worker)

- [evade taxonomy closed] PRE-CONTACT-EVADE (rounds < 1 AND
  outcome 'evade') is now a named class; w4meet's NO-GO leg
  passes on this band (OTHER = 0, 32 seeds). Finding #1466
  closes as measured, not as fixed-in-game (no game change
  was made or needed — the class was missing from the
  analyzer, not from the engine).
- [channel split, total] Evades are expedition-only by wiring
  (only villager-agency expeditionMonster passes
  awareness: true); field 0/2,599, raid 0/1,164. Scatter is
  the field/raid pre-contact outcome (58–65%). Any evade
  lever that is not an expedition lever is mis-aimed.
- [wave-4 kills still 0] Wave-4 meetings 87, kills 0, on the
  wider band (FLEE 54, DEATH 27, EVADE 4, SCATTER 1,
  DRIVE-OFF 1). The wave-4 wall number moved in sample size,
  not in outcome.
- [repeat evaders] 50 (seed, villager) pairs evade 3+ times
  (max 16); tracking-XP hypothesis named, not testable from
  this corpus (no tracking field in any recorder row).
- [evaded-beast provenance gap] Expedition meetings record no
  live start HP, so evaded-beast identity/chains are
  unmeasured (W3 N/A for all 328 evades; 1 weak candidate).
- [same-day doubles] 3 same-villager/same-beast/same-day
  evade pairs; lines do not distinguish the two meetings
  (part counters do). Sense note, not a bug claim.
- [seed 75109 deaths unmatchable] No deathsDetail `who`
  matches any meeting `vid` on 75109; its evaders' aftermath
  is last-appearance only. Other 31 seeds match.

## Metric review (for the NEXT run — nothing re-scored here)

- TAXONOMY-AUDIT LEG: worked — the 1-seed pilot listed 6
  pairs, all covered, and the judged band then ran clean
  (OTHER = 0). Keep it mandatory: a taxonomy that can only
  fail on the judged band is a wasted band. One disclosure:
  the pilot corpus contained no vDie pair, so the DEATH class
  was fixture-proven, not pilot-observed; future audits
  should note absent pairs explicitly, as this one does.
- SHAPE VERDICT SPLIT (all-wave vs wave-4): worked — the
  split prevented a softened GO. All-wave shape is GO at 328;
  wave-4 shape stays held at 4. Future preregs for rare
  subsets should keep separate bars per subset, never one
  pooled bar.
- WARNED DEFINITION: held up, with its strain now measured:
  153/328 evades are warned by prior signals, yet every
  evade is "warned by its own eyes" at contact. Keep the
  definition (prior signals only) and keep the caveat
  attached wherever the unwarned share is quoted; do not
  retrofit the evade line into warned without a recorder
  that captures pre-contact awareness as a signal.
- W3 FOR EVADES: the prereg's N/A handling worked (W3 = 0
  reported as structurally N/A, not as "no re-meets"). Future
  evade preregs should state the N/A up front, as this one
  did — otherwise W3 = 0 reads as a finding.
- DEATHS-MATCH: worked on 31/32 seeds; the 75109
  unmatchability was caught by the matchability check, not
  by assumption. Keep the per-seed matchability report; a
  band-wide death-match rate without it would have silently
  mixed matched and unmatched seeds.
- MEDIAN-DAYS CONVENTION (carried): the analyzer reports the
  upper-middle row (115d); the statistical median is 114.5d.
  This evidence quotes 115d for comparability and notes
  114.5d here.
- BALANCED PANEL (§15): not applicable — DIAG census on a
  fixed band, not a before/after lever comparison. No panel
  compare is claimed.
- EVADELOG RECORDER (new instrument): worked — 328 lines,
  0 errors, 0 overflow, multiset match with the joined
  corpus, 23/23 wave-3/4 lines verbatim-matched against
  w4dpr. The verbatim stack stays verbatim; the new recorder
  is additive and record-only. Future arms needing all-wave
  log lines should reuse it rather than widening w4dpr.

## Convergence note

Scale-onramp stays converging, NOT converged. This arm moves
no wall number by design — it is diagnosis — but it closes
the w4meet taxonomy NO-GO on a band twice as wide, proves the
base stable (the 75110 eater evade reproduces exactly; the
first-16-seeds wave-4 shape is unchanged), and reframes the
evade question: evasion is not a meeting shape to tune in
general, it is an expedition mechanic whose predictors
(tracking, abilities) are currently unrecorded. The next arm
that claims movement on this axis must move a measured
quantity — a wave-4 kill, a drive-off, a repeated wave-4
evasion with a characterized shape, an expedition evade rate
that moves with tracking — not re-describe the census. The
wave-4 evade shape itself remains held at n=4, honestly.

## Infrastructure notes

- Sweep compute ~15 minutes for 32 seeds (background run;
  per-seed cost varies with meeting count, e.g. 75109 with
  251 meetings). Pilot seed 75101 ran in ~16s.
- Safe-commit index clobber hit all three worker commits
  (prereg, instruments, analyzer breakdown) — repaired via
  HEAD-blob cacheinfo each time with hash verification, never
  reset, never forced, commits verified correct. Same clobber
  class as the 2026-10-29 loop notes; this run's third
  instance was the staged-deletion variant (index holding the
  old blob while HEAD + worktree held the new one).
- Analyzer exits 0 (MACHINE-LEGS-PASS); fixtures 44 checks;
  sense read 328/328 evade lines + 23/23 w4dpr cross-check.
- Corpus size: 32 rows + summary.json under
  evidence/2026-10-30/perseed-evadeshape-a/ (~24MB class, same
  per-seed size as w4meet's corpus).
- No live verification, no push, no bump: this arm reports
  "branch ready for coordinator merge, pending ship" per
  assignment. The batch ship job owns pushes.
- Note for the coordinator: evidence/2026-10-30/ also holds a
  sibling file (journey-crisis-r70.md) that is NOT this
  worker's — left untouched.

## Files

- Corpus: evidence/2026-10-30/perseed-evadeshape-a/s75101–s75132-fresh.json
  (32 rows) + summary.json (corpusOk true).
- Analysis: evidence/2026-10-30/evadeshape-a-analysis.json
  (recomputed from the corpus by the analyzer, incl. channel /
  wave-4 / gear breakdowns).
- Analyzer: scripts/test-evadeshape-a.js (machine legs PASS;
  fixtures 44 checks; --sense prints all evade lines;
  --detgate byte-compare; --taxaudit distinct-pair audit).
- Sweep: scripts/test-evadeshape-a-sweep.js (tableseat-nowait
  substrate verbatim + full w4meet recorder stack verbatim +
  evadelog-diag recorder + deathsDetail).
- Recorder: scripts/policies/evadelog-diag.js (record-only,
  evade rows only, all waves).
- Prereg: evidence/2026-10-30/sim-evadeshape-a-prereg.md
  (4a559b12).
- Instruments: scripts/test-evadeshape-a-sweep.js +
  scripts/test-evadeshape-a.js + scripts/policies/evadelog-diag.js
  (73d31cfe, breakdown extension 0f6662e3).
