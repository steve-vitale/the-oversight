# sim-spandraw-playpath-b — real-play ability-tap instrument + pilot census

Run: oversight-flesh-out-loop-b, arm sim-spandraw-playpath-b, axis
food-economy. MEASUREMENT ONLY: zero src/js, zero app.js UI code,
zero changes to any existing analyzer, sweep, or capture. NEW
scripts: playpath driver, tap-window analyzer, proof. This arm
does NOT re-run under competent policy as a promotion band
(spanpromo forbids that); it builds the NEW instrument spanpromo
named and runs a fresh pilot census through it.

## Verdict against the pre-registered bar (judged ONLY against evidence/2026-10-28/sim-spandraw-playpath-b-prereg.md, committed as 46afa322c BEFORE any judged census)

- LEG 1 — pilot gate (instrument GO): GO. All 120 instances
  completed without driver crash (8 seeds × 15 keys, every
  instance endReason survived, no ended-early instance);
  every genuinely attempted tap carries spanEnter+spanExit
  for its key (488/488, strict proof); every tap-window span
  is classified (15-key table, no unclassified span); the
  analyzer reproduces the design control through the
  tap-window path (design tracker instance: crossed, 11
  internal draws, 11 endDay-framed, exclusions 5,990 kcal).
- LEG 2 — per-key census: GO. The table below publishes, for
  each of the 15 keys, taps attempted / succeeded /
  button-refused / impl-refused / skipped, spans, day-
  crossing spans, span-internal draws, exclusion kcal, seeds
  with taps, seeds with exclusions, classification, and zero
  attribution.
- LEG 3 — promotion judgment: NO PROMOTIONS. No key meets
  the PROMOTED-REAL-PLAY rule (crossing + internal draws +
  endDay framing + exclusions). The verdict, per the prereg,
  is "instrument built, crossings still unproven in real
  play" — honest zeros are the answer, and probe-proven
  mechanism is NOT re-scored as real-play proof.
- LEG 4 — controls: GO. (a) The 9954 belongseek replay
  control still classifies cultivate as PROVEN through the
  census analyzer (green_whisper.cultivate: 12 spans, 1
  crossing, 2 internal draws, exclusions 3,820 kcal — the
  replay's proven key is green_whisper, as in census/
  spanpromo). (b) Tap-position distribution is published
  below: played taps were NOT boundary-steered (median
  dayTicks 405, max 478, zero taps at or past 480).

## Overall verdict: INSTRUMENT BUILT, TAPPED IN REAL PLAY, CROSSINGS STILL UNPROVEN

The instrument works, and it is a genuine step past both
predecessors: competent policy never tapped these keys at all
(census/spanpromo: 0 spans), and the design probe tapped them
only by setting the clock to the last hour. This instrument
taps them the way a player would — after a day's played work,
through the UI dispatcher, with the button read as the gate —
and 14 of the 15 keys fire that way (thief fires as an
attempt but is always impl-refused; see below). Across 600
played tap-days: 488 genuine taps, 440 successes, 0 day
crossings, 0 span-internal draws, 0 kcal excluded. No key
promotes. The reason for zero crossings is positional, not
mechanical: played evening taps land mid-to-late day (median
405 of 512 ticks) but never inside any key's cost of the
boundary — the closest tap sat at 478, and the largest key
cost (molt, 60 min = 30 ticks) needs 482. A played day as
competent plays it simply does not run that late before the
evening tap. That is a finding about played days, not a
defect in the instrument — and it is exactly why the prereg
forbade steering taps toward the boundary: had the driver
waited out the last ticks, crossings would have been
manufactured, not played.

## The 15-key table (judged corpus, 8 fresh seeds 10040–10047, 2 lead + 5 tap days per instance)

"Attempted" = button read ok AND tap issued via
activateAbility (no target). "Succeeded" = useAbility returned
true. "Impl-refused" = button ok, tap issued, impl returned
false (narrated refusal after the button let it through).
"Button-refused" = button read refused, no tap issued, no
span. Skipped = in-combat at tap time (0 everywhere: no tap
day ever found the player in combat).

| key | attempted | succeeded | button-refused | impl-refused | skipped | spans | crossing | int. draws | excl kcal | seeds w/ taps | seeds w/ excl | classification |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| tracker.track | 37 | 37 | 3 | 0 | 0 | 37 | 0 | 0 | 0 | 8 | 0 | TAPPED-NO-CROSSING |
| thief.steal_pantry | 37 | 0 | 3 | 37 | 0 | 37 | 0 | 0 | 0 | 8 | 0 | TAPPED-NO-CROSSING |
| game_sense.read_sign | 37 | 37 | 3 | 0 | 0 | 37 | 0 | 0 | 0 | 8 | 0 | TAPPED-NO-CROSSING |
| patient_aim.clean_shot | 37 | 36 | 3 | 1 | 0 | 37 | 0 | 0 | 0 | 8 | 0 | TAPPED-NO-CROSSING |
| stalk.stalk_prey | 37 | 37 | 3 | 0 | 0 | 37 | 0 | 0 | 0 | 8 | 0 | TAPPED-NO-CROSSING |
| blood_trail.follow_blood | 37 | 36 | 3 | 1 | 0 | 37 | 0 | 0 | 0 | 8 | 0 | TAPPED-NO-CROSSING |
| ambush.lay_wait | 37 | 36 | 3 | 1 | 0 | 37 | 0 | 0 | 0 | 8 | 0 | TAPPED-NO-CROSSING |
| animal_ken.read_beast | 38 | 37 | 2 | 1 | 0 | 38 | 0 | 0 | 0 | 8 | 0 | TAPPED-NO-CROSSING |
| scarecrow.stage_injury | 37 | 36 | 3 | 1 | 0 | 37 | 0 | 0 | 0 | 8 | 0 | TAPPED-NO-CROSSING |
| molt.shed_skin | 18 | 15 | 22 | 3 | 0 | 18 | 0 | 0 | 0 | 8 | 0 | TAPPED-NO-CROSSING |
| fear_aura.menace | 40 | 37 | 0 | 3 | 0 | 40 | 0 | 0 | 0 | 8 | 0 | TAPPED-NO-CROSSING |
| intimidating_presence.end_it_before | 27 | 27 | 13 | 0 | 0 | 27 | 0 | 0 | 0 | 8 | 0 | TAPPED-NO-CROSSING |
| war_cry.challenge | 27 | 27 | 13 | 0 | 0 | 27 | 0 | 0 | 0 | 8 | 0 | TAPPED-NO-CROSSING |
| trophy_room.mark | 11 | 11 | 29 | 0 | 0 | 11 | 0 | 0 | 0 | 3 | 0 | TAPPED-NO-CROSSING |
| long_table.share_pot | 31 | 31 | 9 | 0 | 0 | 31 | 0 | 0 | 0 | 8 | 0 | TAPPED-NO-CROSSING |

Totals: 600 tap-days, 488 attempted, 440 succeeded, 112
button-refused, 48 impl-refused, 0 skipped, 488 tap-window
spans, 0 crossing, 0 internal draws, 0 exclusions.

## Zero attribution (never a bare zero)

- Button refusals (112): "Running on empty — eat first.
  (Abilities need 500+ kcal.)" on 43 taps — the played day
  left the player under 500 kcal, so the button honestly
  refused (seed 10041 accounts for most of these: three
  hungry tap days in a row). Once-a-day flags on 16 taps
  (challenge 8, end_it_before 8): a harness tap day and the
  previous tap day landed on the SAME game day (the daily
  itself had crossed midnight), so the flag was genuinely
  still set — the instrument's tap-day counting is harness
  days, the game's flag is game days, and the mismatch is
  honest play, not a bug. Weekly molt gate on 21 taps
  ("Already molted this week."). Share-pot once-a-day on
  6 taps. Trophy no-kills on 26 taps (see below).
- Impl refusals (48): thief 37/37 — every Light Fingers tap
  is refused by the hall gate ("The pantry is in the hall.
  Your hands are not."), even though the player is at the
  haven at tap time: havenStoresAccess() is 'none' on these
  played days, so the pantry the thief would lift from is
  not the player's to touch. The tap is genuine (button ok,
  span logged, cost paid in ticks) and the refusal is the
  game's own rule — Light Fingers is tappable but never
  effective from this played position. The other 11
  impl-refusals, all on seeds 10041/10042 late tap days,
  say "You don't have that ability." — the setup grant did
  not survive to those tap days (the button read does not
  check ownership, so the button showed ok while the tap
  refused). Cause NOT established in this arm (candidates:
  bearer succession or an ability-list rewrite mid-run);
  flagged as a follow-up, never counted as successes.
- Trophy (11 taps on 3 seeds only): kills genuinely earned
  during played days on seeds 10040 (2 taps), 10043 (5),
  10045 (4); the other 5 seeds never recorded a kill in 7
  played days, so 26 taps were button-refused with "no
  kills recorded yet". Trophy is the one key whose
  prerequisite real play only sometimes supplies — and
  when it does, the tap fires and succeeds.
- Molt (18 taps from 40 tap-days): the weekly gate is the
  whole story — one molt per week, 5 tap days inside one
  week, a second molt only when the week turns (seed 10040:
  molt day 4, refused days 5–6, molt again day 7).

## Tap positions (LEG 4b — the not-steered proof)

Attempted taps only (n=488): min dayTicks 5, median 405,
max 478; by dayPart: part 0: 113, part 2: 57, part 3: 318;
zero taps at or past 480, zero at or past 496. The spread
itself is the argument: tap days that crossed midnight
during daily work tap at ticks 5–35 the next morning;
ordinary days tap at 261–478 after the day's work. No tap
was ever placed within any key's cost of the 512-tick
boundary (smallest margin: a 478 tap against molt's
30-tick cost, 4 ticks short). If a future band wants
crossings, it needs played days that run longer — a policy
question (more evening work), not a clock-setting fix,
and any such band needs its own prereg.

## Sense-testing (read end-to-end, judged on meaning)

Seed 10040, war_cry.challenge — the full tap-day sequence,
not a summary. Tap day 3 (game day 4, ticks 5): after the
day's work, the player is talking to Miriam, taps, and the
game answers in its own voice: 'You point at Miriam, in
front of everyone. "You. A bout. Non-lethal. Witnessed."
Miriam holds your gaze, then nods once. "Witnessed." (The
dare stands.)' — then food becomes war cry (−40 kcal).
Tap day 4 falls on the SAME game day 4 (the previous daily
had crossed midnight), and the button honestly refuses:
"You already threw down a challenge today." Tap day 5
(game day 5) issues a fresh dare to Miriam again, and tap
day 6 deepens War Cry to L2. Judgment: this reads as a
player acting, not a probe in costume. The partner is a
real roster villager, the dare persists (the dare stands),
the once-a-day flag genuinely blocks the repeat, and the
ability levels from use. The one thinness, stated plainly:
the tap sitting itself holds no conversation beyond the
tap — the driver opens the talk, taps, and closes it, while
the day's real conversations happen inside competent.daily's
own talk rounds. A fuller instrument would hold a real
conversation turn before tapping; that thinness does not
change any verdict here (the precheck reads the live
conversation, which is what the button scans), but it is
the instrument's known seam.

Contrast, same seed, tracker.track tap day 3 (ticks 5):
"Cold ground. Nothing fresh has passed here — no trail
worth following. (Track)" — a small, honest nothing, the
kind of tap a player makes and moves on from. And thief
tap day 3: "The pantry is in the hall. Your hands are
not." — the refusal names the room and the rule, and the
player learns the pantry is not theirs to lift from yet.
No villager transcript line names any span (the cultnest
arms already established this surface is silent in
speech); silence is reported, not filled in.

## Village assessment (plain words, within what 7-day instances can say)

These are not lived villages — each instance is one village
played for 7 harness days, tapped on the last 5 evenings.
What they show, repeated 120 times, is a village at work:
the player forages, sorts, sows, talks, and eats, and by
evening has the energy — usually — to reach for one more
thing: track a trail, read a beast, menace a rival, share
the pot, shed a skin. Most evenings the player can afford
the tap (488 of 600 tap-days button-ok); some evenings
they cannot (43 hungry evenings under 500 kcal, when the
button honestly says eat first). Kills are rare in a week
of competent play — only 3 of 8 villages recorded one —
which is why the trophy tap mostly waits, honestly, for a
hunt that has not happened yet. The village that this band
shows is a working village whose evenings have room for
one ability tap, but whose days end before the last hour:
night never falls inside a tap, so no dinner is ever
swallowed by one, and the ledger counts every meal once.
Blanks filled: (1) the real-play tap instrument itself,
with button-read + UI-dispatcher taps, tap windows, and a
tap-window analyzer that reproduces the design control;
(2) the pilot census — 14 of 15 keys fire in real play,
thief attempts but is hall-refused, trophy fires only
where played days earned a kill; (3) the positional
reason crossings stay unproven (evening taps never reach
the last ~30 ticks). Documented, not fixed: grant
persistence on late tap days (11 taps, follow-up below);
the tap-sitting conversation seam (above); trophy's
kill scarcity as a played fact, not a defect claim.

## Balanced panel (MEASUREMENT.md §15 — explicit statement, not a fake)

This census has NO before/after game leg: zero game changes,
zero lever variants, nothing to panel. The judged comparison
is WITHIN the instrument (played taps vs the probe's boundary
taps, same classifier, same dedup rule), and panel metrics
(national/table/wins) do not exist for 7-day instances and
are not estimated. So NO balance-panel compare .md is
produced for this arm, as pre-registered.

## Metric review (MEASUREMENT.md §14)

- Analyzer label correction (disclosed, same class as prior
  arms' test corrections): the analyzer first labeled
  tapResult===false as "costRefused". That is wrong: the
  button read already passed costs, so a false return is
  an IMPL refusal (hall gate, ownership loss), not a cost
  refusal. The field is renamed implRefused; no number
  changed, only the label. Corrected analysis + strict
  proof re-run: 10/10 PROOF-GREEN.
- "Succeeded" means useAbility returned true. For thief,
  succeeded 0/37 is not a near-miss: the impl refuses on
  the hall gate every time from this played position. It
  is counted as attempted (button ok, span logged) and
  impl-refused, never as a success.
- Tap-day vs game-day: 5 tap days are harness days, and a
  daily that crosses midnight makes two harness tap days
  share one game day (the once-a-day refusals). Future
  preregs should state tap cadence in game days or accept
  the harness-day count with this note, as this evidence
  does.
- Grant persistence is a limit of this instrument, not of
  the verdict: 11 late taps on 2 seeds hit "You don't have
  that ability." The grant is setup; if the game rewrites
  the ability list mid-run, later taps measure that
  rewrite, not the key. No verdict depends on those 11
  taps (all 15 keys classify the same with or without
  them: every key has successful taps elsewhere except
  thief, whose verdict rests on its 37 hall refusals).

## Proof

- `node scripts/test-spandraw-playpath-b.js` — 6/6, exit 0,
  verdict PROOF-GREEN (synthetic S1–S4 + design control C1
  + census consistency C2).
- `PLAYPATH_STRICT=1 node scripts/test-spandraw-playpath-b.js`
  — 10/10, exit 0, verdict PROOF-GREEN (corpus legs: 120
  files, 488 attempted taps all span-logged, 15-key table).
- Pilot: `COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0
  DEPOSITGATE=1 node scripts/playpath-spandraw-b.js` —
  120 files, exit 0, corpus
  evidence/2026-10-28/sim-spandraw-playpath-b-corpus/,
  analysis evidence/2026-10-28/sim-spandraw-playpath-b-analysis.json.
  Wall-clock ~8 min for 120 instances.
- 9954 replay control: census analyzer on
  evidence/2026-10-27/sim-9954cultnest-b-replay/
  9954cultnest-b-belongseek-nofeast-s9954.json —
  green_whisper.cultivate PROVEN, exclusions 3,820 kcal.
- No jest (proofs are node, not jest). No [needs-eyes]:
  measurement/tooling only, nothing player-visible. Zero
  src/js files in this arm's commits.

## Notes (coordinator backlog — goal hidden_files NOT edited by this arm)

- [follow-up] grant persistence: on seeds 10041/10042, 11
  late taps (animal_ken 1, fear_aura 3, molt 3, ambush 1,
  blood_trail 1, patient_aim 1, scarecrow 1) were refused
  "You don't have that ability." though the setup grant
  succeeded and early taps on the same instances fired.
  Root cause not established (bearer succession vs
  ability-list rewrite); a future arm should record the
  ability list at tap time and trace the loss before
  reusing long tap runs. (sim-spandraw-playpath-b)
- [follow-up] tap-sitting conversation seam: social taps
  open a conversation, tap, and close it, with no
  conversation content in the sitting itself. A fuller
  instrument would hold a real conversation turn before
  tapping. Does not change any verdict here.
  (sim-spandraw-playpath-b)
- [follow-up] thief hall gate in played position: Light
  Fingers taps genuinely but is always impl-refused while
  havenStoresAccess() is 'none', even at the haven. Whether
  a competent played position ever opens hall stores in
  the first week is a separate reachability question.
  (sim-spandraw-playpath-b)
- [follow-up] crossings need longer played days: with
  competent days, evening taps max at dayTicks 478 and
  never sit within any key's cost of the boundary. A
  future promotion band needs a policy whose days run
  longer (more evening work) under its own prereg — NOT
  clock-setting, NOT waits-to-dusk as a steering device.
  (sim-spandraw-playpath-b)

## Convergence line

playpath-instrument — real-play tap instrument (button read
+ UI-dispatcher tap, tap-window spans, 2 lead + 5 tap days):
pilot census 8 fresh seeds 10040–10047, 120 instances, 600
tap-days, 488 genuine taps, 440 successes, 0 day-crossings,
0 span-internal draws, 0 kcal excluded — all 15 keys
TAPPED-NO-CROSSING, NO PROMOTIONS. 14 keys fire in real
play; thief attempts but is hall-refused 37/37; trophy
fires only on the 3 seeds where played days earned a kill
(11 taps); molt gated weekly (18 taps); social once-a-day
flags genuinely block same-game-day repeats. Tap positions
median 405, max 478, zero ≥480 — played evenings never
reach the last ~30 ticks, which is why crossings stay
unproven. Instrument GO (strict proof 10/10); crossings
still unproven in real play, probe mechanism NOT re-scored.

## Verdict (judged against the pre-registered bar, not re-scored): INSTRUMENT GO — LEG 1 GO, LEG 2 GO, LEG 3 NO PROMOTIONS, LEG 4 GO

The instrument now exists, it taps 15 keys through real
play where competent policy tapped none, and its pilot
answer is plain: in real played evenings, no key's span
holds a night, so no key double-counts — and the keys stay
PROBE-PROVEN (mechanism) until a band with longer played
days shows a crossing.
