# sim-w4field-a — wave-4 field-fight kill-cliff decomposition (MEASUREMENT ONLY)

Run: Loop A, axis scale-onramp, follow-up to sim-killconv-a.
Worktree branch: sim-w4field-a. Base anchor: see per-seed JSONs
(`anchorCommit` field).
Pre-registration: evidence/2026-10-30/sim-w4field-a-prereg.md (written
BEFORE any sims; judged against it below).
Instrument: scripts/w4field-instrument-20261030.js (W4FIELD=1,
read-only, det-gate proven) + scripts/w4field-sweep-20261030.js +
scripts/w4field-analyze-20261030.js.
Proof: scripts/test-w4field-20261030.js — 20/20 green (det-gate on
60d leadfeast trajectory identical with/without instrument; static
read-only scan; classifyFlee fixtures; real wave-4 fieldFight through
the wrapped path field-complete with the original record returned
untouched; real-sweep gate byte-identical re-run).
Corpus: evidence/2026-10-30/perseed-w4field/leadfeast/s85101–s85116.json.
No game code changed. No [needs-eyes] (measurement only, nothing
player-facing). Panel (§15): NOT APPLICABLE — single-base measurement,
no before/after comparison exists in this arm; none fabricated.

## Verdict: DIAG-GO, binding factor NO-SINGLE-BINDING (proximate) / DAMAGE SHORTFALL + SOLO (mechanism)

Judged against the prereg's own rule: a flee/death class is THE
binding factor iff it holds > 50% of failure fights. It does not
happen. Over 27 fought wave-4 field fights (0 kills, 0 drive-offs):

| Class | Fights | Share |
|---|---|---|
| LEARN-WITHDRAWAL (learn-first, not winning by round 3) | 10 | 37% |
| FLOOR (HP floor flee) | 8 | 30% |
| DEATH (villager died) | 7 | 26% |
| HOPELESS (damage race lost) | 2 | 7% |

Top class 37% < 50%, so the verdict is NO-SINGLE-BINDING by the
pre-registered rule — the split is real, not a measurement miss
(30/30 fights field-complete, 0 instrument errors). But the two
mechanism checks the prereg rode alongside are unambiguous, and they
are the answer a lever-builder needs:

(a) DAMAGE: median damage fraction 0.007 — the median fought fight
deals 0.7% of the beast's HP. Median rounds 1 (16x1 round, 10x2,
1x3). Median damage per round 7. No fought fight EVER read as
winning (everWinning 0/27). The best fight in the whole band (Mia
vs a suburb, s85112 day 86) dealt 73 damage in 2 rounds against
1300 HP — 5.6% — and still fled at 30 HP. The beast is essentially
unhurt when every fight ends; whichever exit a fight takes (learn,
floor, death, hopeless) is just which door a 1-round loss walks out
of. Damage shortfall underlies all four classes.

(b) PARTY / GEAR: party cannot be tested from this band because it
never happens — 0/27 fights had partySize > 1, 0 shouts for help
were answered, 0 ally damage was ever dealt. Every wild wave-4
fight is a lone villager. Gear does not rescue it either: 23/27
fighters wore armor at P >= 10 (up to P=50) and still produced 0
kills and 0 drive-offs. Armor is not the binding constraint; the
fight is lost on damage and numbers before armor matters.

So: proximate verdict NO-SINGLE-BINDING; mechanism verdict DAMAGE
SHORTFALL + SOLO. A lever that only changes flee thresholds will
reshuffle the four classes without producing a kill. A lever must
change what a lone villager can deal to a 700–1500 HP beast, or
stop the fight being lone in the first place.

## Wall numbers (fresh band, this base — killconv's band re-measured)

- Seeds: 16 (pilot 85101–85108 + confirm 85109–85116, single policy
  stack identical to killconv, 200d death-aware cap).
- National: 8/16. Table reached: 12/16. Wins: 11/16.
- Wave 4 unlocked: 9/16. Wave 5 unlocked: 0/16.
- Median survival: 106.5 game days. Max: 139.
- Wave-4 field fights: 30 total (3 evades, 20 fled, 7 died, 0 killed,
  0 drive-offs). Fought fights: 27, all lone, all scholar-absent
  (0 scholar-party fights — the scholar's fights are TB, not field).
- Death-cause sampler rows are dominated by early-wave monsters
  (hummice, hushwolf) — the sampler overlaps labels, so shares are
  indicative only, same caveat as killconv.

## The decomposition, in numbers

- Beast HP is ground truth, not estimated, for all 27 fought fights
  (world-entity maxHp present; the 3 estimate-basis fights are all
  evades, where HP never matters).
- Per-monster fought fights: eulogy 9, algorithm 7, suburb 7, herald
  3, reunion 1. No congregation / strike / influencer / audit /
  eater field fights in this band.
- Intent: learn-first 15, trick-known 12. Trick-known fights dealt
  [0 x11, 13] damage — performing the trick REPLACES striking, and
  the trick never finished a fight in 1–3 rounds: 11 of 12
  trick-known fights dealt exactly 0 damage and still took a median
  ~63 damage in return. Learn-first fights dealt 0–73 (median ~19).
- Ranged combat never fires: 14 fights carried a bow/crossbow/sling
  and all 14 volleys fired 0 shots — ammo on hand was 0 in every
  case ("has Crossbow but no arrows — the string stays drawn,
  useless"). The bow's whole opening identity is absent for lack of
  arrows, not lack of bows.
- Wounded re-engagement: 6/27 fighters entered below 50 HP (min 14
  HP); one walked into an algorithm at 25 HP and died to a single
  50-damage hit without acting. Wounded villagers keep meeting
  wave-4 beasts instead of recovering or avoiding them.
- Beasts are usually already wounded when met (entry HP fraction
  median ~0.72, one herald at 0.17) — wounds persist onto the world
  entity — yet still never die: the same eulogy at 388/900 HP was
  met 5 times running (days 88–91) with 0 damage dealt each time,
  because every visitor played the trick instead of striking, and
  the fifth visitor died doing it. Cumulative nibbling stalls
  exactly where trick play replaces damage.
- Flee HP fractions (fled fights): 0.05–0.57 — villagers run
  genuinely hurt, not early; the floor/hopeless/learn exits are
  honest readings of a lost fight, not cowardice tuning.

## Replay note (s85112) — read this before quoting killconv's 35

The analyzer flags one replay mismatch vs the killconv corpus:
s85112 shows 3 fights here vs 8 in killconv, and this run ends day
90 (won, national) vs killconv's day 139 (won, not national), with
day-hash trajectories diverging at day 49 — BEFORE any wave-4
fight. Investigation (decisive, not speculative):

1. This sweep re-run on s85112 alone is byte-identical to the band
   run (same 3 fights, same day-90 end).
2. A pristine driver (same policy stack, NO instrument at all)
   reproduces THIS run exactly: day 90, national, won, hashes
   identical for all 90 days.
3. Killconv's s85112 corpus diverges from pristine at day 49.

Conclusion: the w4field instrument is trajectory-neutral on
s85112, and killconv's s85112 corpus is NOT reproducible on
pristine code — the 5 extra fights in killconv's 35-meeting total
come from that one irreproducible seed. The pristine band total is
30 field meetings, not 35. Killconv's verdict is UNAFFECTED (0
field kills in both bands; opportunity still dominates), but any
future arm quoting "35 meetings" should quote 30, and the killconv
instrument's day-49 perturbation on s85112 (its sleep wrapper's
standing/readiness reads are the prime suspect — this arm wraps
fieldFight only) is an open instrument-hygiene item, not a game
finding. The other 15 seeds replay-identically, so the anomaly is
isolated to s85112. Per the prereg, DIAG-NO-GO requires a mismatch
"with no read-only explanation" — this mismatch HAS a read-only
explanation (pristine == this run), so DIAG-GO stands.

## What the village looked like, in plain words

A competent village walks into wave 4 alone and unarmed in every
way that matters. One villager at a time meets a beast with roughly
a thousand hit points, hits it for about seven damage a round if
they hit it at all, takes sixty-odd damage back in a single round,
and runs or dies. Nobody ever stands beside them — no party, no
answered shout, no second blade. The archers carry bows with no
arrows. The villagers who know a beast's trick spend the whole
fight performing it instead of hitting anything, and the trick
never pays off before they have to run. The village keeps sending
hurt people back to the same wounded beast — one eulogy sat at less
than half health while five visitors in a row dealt it nothing and
the last one died trying. The scholar's fights are a different
story (killconv: 3 wins in 28), but no villager in the wild ever
wins one. Until a lone villager can hurt a wave-4 beast, or until
wild fights stop being lone, the wave-5 bar will never see its
second killer.

## Sense-testing (fight records read in full, not just counted)

One full log per outcome class present, plus the band's best fight
and a wounded re-engagement death:

- EVADE (s85103 day 112, suburb): "Molly saw The Suburb in time and
  gave it room." Sensical — the awareness check working as designed.
- DEATH (s85106 day 93, reunion): Oliver strikes once for 19
  against 699 HP, takes 43, takes 43 again, dead in round 2. Brutal
  and legible — a 2-round fight against a 1200-HP beast.
- LEARN-WITHDRAWAL (s85106 day 111, herald): two strikes for 37
  total against 350 HP, takes 31, withdraws at 57 HP with the line
  "sees how this ends — and runs while running still works."
  Sensical: the learn-first villager got their observation and left.
- FLOOR (s85106 day 128, herald): one strike for 13, one hit for 69
  drops Marcelo to 26 HP, "past holding — they run." Sensical.
- HOPELESS (s85109 day 78, eulogy): Ulzhan contradicts the
  narration twice, deals 0, takes 33 then 54, flees at 5 HP.
  Sensical as a scene, damning as a system: the trick is performed
  correctly and still loses, with no progress shown toward the
  trick ever dismissing the beast.
- BEST CASE (s85112 day 86, suburb): Mia strikes 36 + 37 = 73
  against 1300 HP, absorbs 46 + 19, flees at 30 HP. The band's best
  damage output is 5.6% of the beast. Even the ceiling is a cliff.
- WOUNDED RE-ENGAGEMENT (s85109 day 72, algorithm): Santino enters
  at 25 HP, absorbs 43, takes a 50 hit, dead without acting. No
  avoidance, no recovery, no sense that a 25-HP villager should not
  be taking this meeting.

## Metric review (applies to the NEXT run, never a re-score of this one)

1. The > 50% binding rule worked as designed: it refused to crown
   a 37% plurality, which is the honest call — the four flee classes
   are exits, not causes. The mechanism checks (damage fraction,
   party/gear splits) carried the verdict. Keep this two-level
   structure for future decompositions.
2. Beast-max-HP estimation (mHpLeft + mDealt) was never needed for
   a fought fight in this band (entity maxHp present all 27) — but
   keep the hpBasis flag; evades legitimately lack an entity.
3. "Party" as measured here means partySize > 1 or an answered
   shout. A future arm wanting scholar-party field fights must
   define the scholar's field party separately — the scholar never
   appears in field fights in this band, so scholar-party vs lone
   was untestable, not disproven.
4. Killconv's s85112 irreproducibility should be chased as
   instrument hygiene by whoever next reuses that instrument: its
   sleep-wrapper reads (standing/readiness) are the prime suspect
   for a day-49 perturbation. Do not re-quote killconv's 35 without
   the 30 correction.

## Blanks found (for the coordinator's findings backlog — not chased here)

- Ammo starvation: bows carried, arrows never on hand (14/14
  volleys 0 shots). A lever arm could test whether pocketed arrows
  change field-fight damage at all.
- Trick-known zero-damage stall: eulogy trick play deals 0 and
  shows no dismissal progress across 5 meetings. Whether
  contradiction is MEANT to accumulate toward dismissal (and over
  how many rounds) needs a code read, not a guess.
- Wounded re-engagement: villagers at 14–39 HP still take wave-4
  meetings. Avoidance/recovery judgment for hurt villagers is an
  open rationality gap.
- Lone wild fights: party formation never engages in the wild
  (0/27). If party play is the intended wave-4 answer (Steve's
  wave-4 demand: parties, fully geared), the wild meeting path
  bypasses it entirely — that is the gap a party lever must close.
- Killconv instrument hygiene: s85112 irreproducible (see replay
  note). Flag for the instrument owner, not a game change.

## Convergence state

converging (measurement, not a lever): the scale-onramp axis now has
a measured answer for the field-fight channel — no single flee
class binds, but damage shortfall + solo does (0.7% median damage,
0/27 party, 0/27 ever winning). The next work on this channel is a
lever that changes lone-villager damage or wild party formation,
not a flee-threshold tweak.
