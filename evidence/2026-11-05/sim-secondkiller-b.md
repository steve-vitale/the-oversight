# Second-killer production — DIAG verdict (arm sim-secondkiller-b)

Run: fleshout-loop-b-20261105T0430Z. Axis: winnability chain (wild
ally-join → wave-4 kills → veterans → readiness-5 release → wave-5
facing → full seat). Instrument-only; ZERO src/js changes, no policy
probe variant, no gate/price/deed/readyDemand change. Prereg:
`evidence/2026-11-05/sim-secondkiller-b-prereg.md` (committed before any
judged sim). Corpus: `evidence/2026-11-05/perseed-secondkiller-b/` (8
files, instrument errors 0). Proof: `scripts/test-secondkiller-20261105.js`
21/21 PASS (fixture + live harness smoke + off/on neutrality leg).

## Prereg summary

- Fresh band 99151–99158, competent policy verbatim, 150d death-aware
  horizon, 8 seeds (pilot; DIAG instrument run, no confirm owed).
- Primary metric: wave-4 kill rate per wild wave-4 fight, split three
  ways — (a) first killer alive at fight start vs none alive (vs no
  first killer yet, reported separately), (b) party size (solo /
  leader+1 / larger), (c) would-be second killer present vs absent —
  plus gear, abilities, swings, damage fraction, ending, killer
  identity/first-kill flag, days since first blood, first-killer-in-
  fight flag.
- Verdict rule (pre-registered): a RANKED cause table (production vs
  finishing vs exposure/rotation), judged strictly against the
  pre-stated implicating patterns — never re-scored against a
  friendlier split.

## Verdict (ranked cause table, judged against the prereg)

### 1. FINISHING — implicated, by a wide margin

- Overall: 3 kills in 58 wild wave-4 fights (5.2%). Every kill is a
  first blood; after first blood the kill rate is 0/19.
- The pre-registered finishing pattern holds on the CORRECTED splits:
  second candidates are present in all 58 fights (see production
  note), their fights' kill rate is 3/58 = 0.052 (< 0.10) and their
  median damage fraction is 0.060 (< 0.5).
- The mechanism is visible in both channels:
  - FIELD (villager) fights: 0 kills in 30 fights. Median damage dealt
    is 2.7% of monster entry HP. Fights last 2–3 rounds, then the party
    flees (18) or dies (11). A joining ally was present in 16/30
    (allyVid), and still nothing converted — parties are not losing
    for lack of company.
  - PLAYER turn-based fights: 3 kills in 28, but 24 end in death (the
    scholar loses). Median damage fraction 0.20 — scholars scratch a
    fifth of a wave-4 monster's health and then die. Abilities were
    used in only 4/28 TB fights (war_cry ×2, rage ×2); the rest were
    struck-out losses.
- Plain words: fresh faces reach wave-4 monsters constantly and hit
  them with kitchen knives and crowbars for a couple of rounds, then
  run or die. The monster keeps ~97% of its health in field fights.
  That is a damage-and-staying failure, not a meeting failure.

### 2. PRODUCTION (party/presence) — REFUTED as defined

- The pre-registered production pattern was "second candidates rarely
  present in wild wave-4 fights at all." The corrected data shows the
  opposite: a would-be second killer (a fighter with no wave-4 kill
  yet) is present in 58/58 fights. Presence is universal because
  almost nobody has ever killed a wave-4 monster — so "present" is
  nearly a tautology here, and it cannot be the binding constraint.
- The one production-flavored fact that survives: field party size
  overstates combatants. 27/30 field fights carry partySize 3 (a
  mustered party of three), but only 16/30 had a joining ally
  (allyVid); 12 mustered triples fought with no ally joining at all.
  Even the 16 with a real ally converted nothing, so this is a
  finishing footnote, not a rival cause.
- The instrument's first-pass number (41 present / 17 absent) was an
  artifact of the scholar-vid bug (see Corrections) and must not be
  cited.

### 3. EXPOSURE/ROTATION — pattern NOT shown (underpowered, not exonerated)

- The pre-registered pattern required kills to concentrate in fights
  where no first killer lives, at a much higher rate than with a
  living first killer. Observed: kill rate with a living first killer
  0/1, with a dead first killer 0/18, before any first blood 3/39.
  Both post-blood buckets are zero — there is no contrast to claim,
  so the pattern is NOT shown.
- What the data does show about the alive window: it barely exists.
  Only 1 of 58 fights happened while a first killer lived — seed
  99156, day 100, 18 days after first blood, fought by two visiting
  joiners (not the killer), fled at 6.8% damage. The reason the
  window is empty is killer lifespan, not rotation: of the 3 killers,
  Boris (99154) died in a contest the day after first blood, Marcus
  (99157) died in the arena the same day as first blood, and only
  Sigrun (99156) lived to the end. Retention (killerdeath-b) kept
  killers home and still got no second blood; this run shows the
  window itself is usually 0–1 days long because first blood is
  followed almost immediately by a contest/arena death — deaths the
  retention probe (outward exposure only) never touched.
- Ranked third because its defining pattern did not appear; the
  lifespan mechanism is carried forward as context for the next blank,
  not as a verdict claim.

## Per-seed table

| seed | days | end | w4 fights | w4 kills | killers ever | living at end | living-pair day |
|------|------|-----|-----------|----------|--------------|---------------|-----------------|
| 99151 | 114 | village-lost | 13 | 0 | 0 | 0 | — |
| 99152 | 125 | village-lost | 10 | 0 | 0 | 0 | — |
| 99153 | 33 | village-lost | 0 | 0 | 0 | 0 | — |
| 99154 | 103 | village-lost | 17 | 1 | 1 | 0 | — |
| 99155 | 59 | village-lost | 0 | 0 | 0 | 0 | — |
| 99156 | 100 | village-lost | 5 | 1 | 1 | 1 | — |
| 99157 | 79 | village-lost | 13 | 1 | 1 | 0 | — |
| 99158 | 60 | village-lost | 0 | 0 | 0 | 0 | — |

The three kills (all first bloods, all player-TB wins, all damage
fraction 1.0): seed 99154 day 80, Boris Kowalski vs the Eulogy (solo,
3 rounds, 1 counted player strike — a trick/interrupt kill, not a
damage grind); seed 99156 day 82, Sigrun Eiriksdottir (companion) vs
the Congregation, with Elena Petrova beside her (10 rounds, 0 counted
player strikes — the kill came from the companion, see metric review);
seed 99157 day 48, Marcus Webb vs the Strike (solo, 71 rounds, 69
player strikes — the one true damage grind in the corpus).

## Per-fight split tables (analyzer output, corrected splits)

Alive bucket: noneYet 39 fights / 3 kills (7.7%, median damage 0.083);
notAlive 18 / 0 (median 0.042); alive 1 / 0 (median 0.068).
Channel: field 30 / 0 (median 0.027; flee 18, death 11, other 1);
player-tb 28 / 3 (median 0.197; death 24, kill-or-rout 3, unfinished 1).
Party size (mustered, see metric review): solo 27 / 2 (7.4%); leader+1
4 / 1 (25.0%); larger 27 / 0 (median 0.020). Field ally actually joined:
16/30, 0 kills; mustered triple with no joiner: 12/30, 0 kills.
Second candidate (corrected): present 58 / 3 (5.2%, median 0.060);
absent 0 fights — the absent bucket is empty after correction, which
is itself the finding: there is no wild wave-4 fight without a fresh
face in it.
Post-first-blood: 19 fights / 0 kills (field 15, TB 4).
Gear (weapon only — armor void, see metric review): field fighters
carried weapon bonuses 5–35 (crowbar 12 and kitchen knife 8 most
common); the best field weapon seen (bonus 35) still converted nothing.
Abilities in TB fights: 4/28 used any (war_cry, rage); field fights
record no tricks (waves 4–5 are counter-less by design, so an empty
trick log is expected, not a gap).

## Scale-wall numbers (every run)

Wins 0/8. National 0/8. Table 0/8. Wave-4 unlocks 5/8. Wave-4 faced
5/8. Wave-5 unlocks 0/8. Wave-5 faced 0/8. Median survival 89.5 days
(all 8 villages lost; range 33–125 days). Three seeds (99153, 99155,
99158) never faced wave 4 at all — they died at 33–60 days, before or
without wave-4 exposure.

## Village assessment (plain words)

The villages look like places that keep sending their best person out
to fight a monster ten times their size and then burying them. On seed
99154, four villagers die in the wild across days 79–80, Boris kills
the Eulogy on day 80, and Boris himself dies in a contest on day 81 —
the village's one veteran, gone the next morning, with the grave
speeches and buried keepsakes narrated in full. On 99157, Marcus
spends 71 rounds killing the Strike and dies in the arena the same
day. On 99156, Sigrun's kill is announced on camera as a veteran kill
while the village is being raided the same night. Nobody in any
village reaches national standing; nobody sits at the table; nobody
wins. What is missing is not courage or company — parties of three
walk out and fresh faces are in every fight — it is the ability to
hurt a wave-4 monster faster than it hurts them, and to stay in the
fight past round three. Field parties deal about 3% of a monster's
health before they break; scholars deal about 20% before they die.
The wave-4 door opens on 5 of 8 seeds and nothing walks through it
twice.

## Sense-testing law (one fight's transcript, judged for coherence)

- Seed 99154, days 79–82: coherent and grim. Deaths are narrated
  (Codex page, grave, screams, digging, keepsakes buried, succession
  speeches at the grave), Boris's contest death the day after his
  kill reads as consequence, not noise. One loose thread: a "bring
  Nompumelelo home" burial line appears on day 79 with no matching
  death line in the sampled lines — either an earlier death's delayed
  burial or a mismatched body, noted not judged.
- Seed 99157, day 48 (the 71-round Strike kill): the Strike's
  SHUTDOWN picket-line beat repeats verbatim a dozen times in the
  sample with no variation across the whole fight. The fight itself
  is legible (a shutdown monster that must be met or scabbed around),
  but the beat's repetition is robotic — a small sense flag for the
  monster's narration, not for the verdict.
- Seed 99156, day 82: Sigrun's kill is announced on camera as a
  veteran kill, Mara is named Healer, a raid hits the same night.
  Coherent: the village celebrates and bleeds in the same breath.

## Blanks filled or documented

- FILLED (this run): the second-killer production question, as a DIAG
  verdict — finishing binds, presence does not, the alive window is
  0–1 days because first blood is followed by contest/arena death.
- DOCUMENTED (not fixed — instrument-only scope): field-party damage
  conversion (3% of HP), scholar TB loss rate (24/28 deaths), contest/
  arena deaths emptying the alive window, Strike shutdown-beat
  repetition.

## Named next blank (for the following run)

A FINISHING probe/build, not another census: wild parties break at
2–3 rounds dealing ~3% of a wave-4 monster's health, and scholars lose
24/28 TB fights dealing ~20%. Test a finishing lever on the same band
family with kill conversion as primary — e.g. a policy-side
hold-ground/focus-fire variant if expressible, otherwise a game-code
finishing build (party damage concentration, staying power, or
finishing mechanics) — with gates, prices, deed gates, and readyDemand
untouched. Secondary blank, after finishing: the post-blood
contest/arena deaths that empty the alive window (Boris day+1,
Marcus day+0) — a retention shape that covers contest/arena exposure,
not just outward trips, if finishing ever produces a living pair to
protect.

## Corrections made after the judged corpus (disclosed, not hidden)

1. Kill matching (analyzer): the first-pass analyzer fell back to the
   first same-day same-monster fight when the killer was not among
   that fight's fighters, misattributing seed 99154's day-80 kill to
   a different scholar's losing fight. Matching is now STRICT (killer
   must be among the fight's fighters); unmatched kills are reported,
   never assigned. All 3 kills still match (3/3, 0 unmatched), but
   the attributed fights changed for 99154 (now Boris's won fight)
   and 99156 (now Sigrun's companion fight). Overall kill rate is
   unchanged (3/58).
2. TB second-candidate flag (instrument + analyzer): the instrument
   computed TB candidates from tbfight human fighters, but the
   scholar's own entry often carries no villagerId, so solo scholar
   fights were coded candidate-absent. The instrument now falls back
   to the scholar id, and the analyzer recomputes the flag from the
   record's fighters + kill history strictly before the fight day
   (day granularity; same-day earlier fights are not excluded —
   stated limitation). First-pass 41/58 present becomes corrected
   58/58 present. The verdict uses corrected splits only.
3. Gear armor (instrument): worn armor lives in torso/legs/shoes
   slots, not an `armor` slot, so the judged corpus has armorP null
   throughout. Fixed post-corpus (engine armorOf preferred, torso
   fallback); the corpus is NOT re-run for this secondary field —
   the verdict does not depend on armor. Weapon bonuses stand as
   captured.

## Metric review (per §14)

- Field "party size" counts mustered allies (opts.allies + 1), not
  fighters who struck; future runs should split field fights by
  allyVid presence (16/30 here), not partySize. The party split in
  this evidence is therefore reported with that caveat, and the
  allyVid cross-check (0 kills with or without a joiner) carries
  the point either way.
- TB swingsAttempted counts player strikes only. Companion strikes
  are uncounted (Sigrun's kill fight shows 0 player strikes), so TB
  swings understate party damage attempts. TB damage fraction (HP
  lost across the fight) is the reliable TB damage measure here, not
  swings.
- TB "won" without a kill-log row is never counted as a kill
  (analyzer rule, held: 3 kill-or-rout endings, all 3 matched to
  kill-log rows; the unfinished TB fight, 1, is counted as a fight
  with no kill).
- Say-line capture matched the substring "dead" and therefore
  collected deadfall chore lines; the sense read above filtered those
  out by hand. Future instruments should match whole words or a
  narrower death pattern.
- 8 seeds / 150d gave 58 wild wave-4 fights — enough to split by
  channel and by post-blood status, but the alive-window split has
  n=1 and cannot support a rate claim. That thinness is a finding
  (the window is short), not a reason to re-run the same census.
- The 30d retention window / haven-day scope from killerdeath-b was
  not re-tested here (instrument-only arm); its verdict stands
  untouched.

## Balanced panel (§15)

INAPPLICABLE, stated not fabricated: single-arm instrument run, no
Game-root change and no policy variant to compare. No balance-panel
compare exists for it, and none is attached.
