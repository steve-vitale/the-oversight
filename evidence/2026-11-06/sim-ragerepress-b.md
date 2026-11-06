# sim-ragerepress-b — rage re-press — NO-GO on the lever (number passed, mechanism never fired)

- Run: `fleshout-loop-b-20261106T1730Z`, arm 2 of 3, axis scale-onramp / winnability chain
- Arm: `sim-ragerepress-b`, branch `sim-ragerepress-b`, worktree `~/workspace/worktrees/sim-ragerepress-b`
- Band: 95001–95008 (8 seeds, verified fresh — 0 hits in all evidence .md,
  no `"seed": 9500x` in evidence .json, no tracker/claim mentions; suggested
  88011–88018 COLLIDED and was rejected: 88011–88014 used by
  journey-endgame-r46; see prereg)
- Policy: competent verbatim (baseline) vs competent-ragerepress-b
  (`scripts/policies/competent-ragerepress-b.js`: partydamage base
  VERBATIM except rage is exempt from the once-per-fight cap),
  150d death-aware horizon, anchor `3a4803e0b` (prereg) / build `c22333838`
- Prereg: `evidence/2026-11-06/sim-ragerepress-b-prereg.md` (committed
  `3a4803e0b` before any judged sim)
- Corpus: `evidence/2026-11-06/perseed-ragerepress-b/` (16 files),
  analysis `/tmp/rr-analysis.json` (working copy; this file is the record)
- Instruments: `scripts/ragerepress-instrument-20261106.js` (copy of the
  partydamage recorder + the midnight-spanning kill match the partydamage
  metric review named: fight day OR day+1, in the instrument's closeTrace
  and the analyzer's pyrrhic matcher),
  `scripts/ragerepress-driver-20261106.js`,
  `scripts/ragerepress-analyze-20261106.js`,
  `scripts/test-ragerepress-20261106.js` (proof: 57/57 green on the build
  commit with the policy fakes + armed live leg included; 37/37 green
  after the policy was deleted — the deleted policy's fakes and armed
  leg cannot run against a deleted file, and are not faked)
- Verdict: **NO-GO on the lever — the primary metric passed (armed
  12/60 = 20.0% ≥ 10% bar) but the metric-review caveat fires in full:
  the rage re-presses are consecutive-turn refresh churn that never
  delivered a doubled strike, and the kills came from strike fights in
  which rage was never held. The lever is not the cause of the number,
  so the policy does NOT land.** The prototype policy is deleted with
  this run; the instrument/driver/analyzer/test stay as reusable
  measurement tools (they carry the midnight fix the next recorder
  needs). No gate, price, deed, or readyDemand change anywhere in this
  arm. No `src/js` change.

## The blank this arm fills

Partydamage next blank (4): the policy caps rage at once per fight —
competent re-presses rage whenever winning (36× on the partydamage
baseline leg vs 4× armed), so the armed leg fought with LESS rage, not
more. This arm lifted the cap and nothing else. Interpretation note
(recorded in the prereg before any judged sim): competent already
re-presses rage freely, so "competent + rage re-press" would be a null
test; the single-variable test is partydamage-base minus the rage cap.

## Before / after (identical seeds, 8 + 8)

| Metric | Baseline | Armed | Change |
|---|---|---|---|
| Wave-4 TB fights / traced | 54 / 54 | 60 / 60 | +6 fights reached |
| Wave-4 kills (kill log) | 5 | 12 | +7 |
| **Wave-4 TB kill rate, log / traced (PRIMARY)** | **5/54 = 9.3%** | **12/60 = 20.0%** | **+10.7 pts — bar passed** |
| TB kill rate, trace-matched | 5/54 = 9.3% | 11/60 = 18.3% | +9.0 pts — also past the bar |
| TB outcomes (scholar-death / kill / rout / flee / unfinished) | 46 / 5 / 2 / 1 / 0 | 47 / 10 / 1 / 0 / 2 | |
| Field wave-4 fights / kills | 10 / 0 | 34 / 0 | control channel still 0 |
| Median rounds survived (lost TB fights) | 6 | 6 | no movement |
| Beast HP at end (median frac of max) | 0.517 | 0.444 | bites deeper |
| Median damage/round, player side | 28 | 48 | +71% |
| Median damage/round, monster side | 20 | 22 | +2/round taken |
| Scholar strikes/fight (median) | 2 | 5 | the scholar strikes now |
| Scholar moves/fight (verbs) | 269 total | 33 total | flee-walks nearly gone |
| Rage presses (ability verbs) | 23 total | 57 total | volume restored — and wasted (below) |
| Rage re-presses (2nd+ press in a fight) | — (competent) | 48 total | all consecutive-turn (below) |
| Cascade presses (armed only) | — | 72 total | rage 57, patient_aim 12, war_cry 3 |
| Rally verbs in w4 traces (armed only) | 0 | 34 | rally fired in 34/60 fights |
| Median survival (guard) | 95.5d | 111.5d | +16d — guard holds (≥ 76.4d) |
| Starvation deaths (guard) | 2 | 3 | guard holds (≤ baseline + 2 = 4) |
| Wins / national / table | 0 / 0 / 0 | 0 / 0 / 0 | no win either leg |
| Wave 4 unlocks / faced | 7 / 7 | 8 / 7 | |
| Wave 5 unlocks / faced / kills | 1 / 1 / 0 | 0 / 0 / 0 | the door opened once, baseline only |
| Readiness-5-ready days | 3 | 1 | |
| Living wave-4 killers at end | 1 (95001) | 1 (95004) | no pair anywhere |
| Instrument errors | 0 | 0 | |

## Primary metric (binding) — and why the verdict is NO-GO anyway

- Armed wave-4 TB kill rate (log / traced fights, prereg definition):
  **12/60 = 20.0% ≥ 10% GO bar.** The trace-matched rate (11/60 =
  18.3%) also clears the bar. The number passes on either reading.
- The verdict is NO-GO on the LEVER, not on the number, because the
  prereg's metric-review caveat fires: "If the armed leg's rage
  presses cluster on consecutive turns, the mechanism is refresh churn,
  not re-press value." They do — completely. All 48 re-press pairs are
  consecutive-round presses with ZERO scholar strikes between them;
  in all 9 fights where the scholar held rage, scholar strikes = 0 and
  scholar damage = 0. A re-press while rage is still active only
  resets the 3-strike window, and the scholar never strikes while the
  window is live because every turn is spent pressing rage again. The
  mechanism never delivered a single doubled strike. The kills came
  from fights in which rage was never held (see "The twelve armed
  kills"). Landing this policy would ship a cascade that is strictly
  worse than the capped partydamage version in rage-holding fights:
  there the scholar deals zero damage while burning 60 kcal per press.
- The kill-rate gain over baseline is the hold-ground frame on a
  fight-dense band, not the rage cap: this band fought 54–60 wave-4 TB
  fights (vs 24–30 on the partydamage band), and the armed leg's strike
  volume (274 verbs vs 174) and ally damage did the killing. The
  within-band comparison is honest, but it measures the frame, not the
  lever — the lever's own contribution is zero by the trace record.
  Re-scoring the verdict as GO would claim a cause the data refutes;
  the prereg binds the number, and the number is reported as passed,
  but a lever that never fires does not land. No metric was swapped,
  re-cut, or re-thresholded after the run.

## The mechanism, as it actually ran (prereg secondary)

Rage re-press count per fight: armed 57 rage presses in 60 fights
(0.95/fight) vs baseline 23 in 54 (0.43/fight) — volume restored, as
designed. But the spacing analysis kills the mechanism:

- 9 fights with ≥1 rage press; all 9 also have re-presses (2–15 per
  fight; 95004 d77 Algorithm: 15 presses in 16 rounds).
- 48 re-press pairs; ALL 48 are consecutive-round (press on round N,
  press again on round N+1); ZERO have ≥1 scholar strike between the
  presses; ZERO have ≥3 strikes between (the window is never spent).
- In those 9 fights the scholar struck 0 times and dealt 0 damage.
  The scholar's turns were consumed by pressing rage, every turn,
  until the fight ended (8 of the 9 ended scholar-death; the 9th was
  won by the ally).
- The churn is not unique to this policy: competent's own cascade
  re-presses rage whenever winning with no "only when spent" guard —
  baseline 95001 d70 Algorithm shows the same shape (6 presses, 1
  strike, 110 scholar damage). Competent rarely pays for it because it
  flees wave-4 fights; the hold-ground frame forces the churn every
  rage-holding wave-4 fight. The next rage variant needs a spent-guard
  (press only when the previous window's 3 strikes are spent), not a
  cap lift — that is a new arm, not this one.

## The twelve armed kills (damage anatomy from the traces)

| Seed | Day | Monster | Rounds | Entry HP | Rage presses | Scholar dmg | Ally dmg | How |
|---|---|---|---|---|---|---|---|---|
| 95001 | 87 | Suburb | 9 | 1,231 | 0 | 548 | 716 | strikes + allies |
| 95001 | 88 | Algorithm | 2 | 31 | 0 | 54 | 0 | wounded entry |
| 95001 | 126 | Audit | 9 | 781 | 0 | 373 | 430 | strikes + allies |
| 95001 | 136 | Reunion | — | — | — | — | — | unmatched mutual kill (below) |
| 95002 | 108 | Suburb | 6 | 293 | 0 | 204 | 94 | strikes + allies |
| 95003 | 51 | Influencer | 9 | 1,006 | 0 | 738 | 277 | pyrrhic (unfinished trace, mHpLeft 0) |
| 95004 | 78 | Algorithm | 8 | 349 | 7 | 0 | 386 | ALLY kill (Nino) while scholar pressed rage |
| 95004 | 113 | Eulogy | 6 | 318 | 0 | 179 | 145 | strikes + allies |
| 95005 | 100 | Reunion | 8 | 1,200 | 0 | 1,075 | 171 | scholar-heavy |
| 95007 | 52 | Congregation | 10 | 900 | 0 | 686 | 214 | strikes + allies |
| 95007 | 53 | Influencer | 8 | 850 | 0 | 702 | 168 | strikes + allies |
| 95007 | 93 | Eulogy | 1 | 9 | 0 | 25 | 0 | wounded entry |

- **Only one kill trace involved rage at all** — 95004 d78, where the
  scholar pressed rage 7 times, struck never, dealt 0 damage, and the
  companion Nino landed the kill. That is the ally doing the killing
  while the scholar churns, not rage damage.
- **Two kills are wounded-entry kills** (entry 31 and 9 HP — the grind
  had done the work; one 54-damage round and one 25-damage hit). They
  count in the log rate and are reported as such, not as damage-race
  wins.
- **One kill is unmatched to any kill-ending trace** — 95001 d136
  Reunion, logged to Ruth Goldstein via 'player'. The d136 grind ran
  four fights against the same Reunion (entry HP 3,548 → 3,236 →
  2,914 → 249) and the kill is logged the day Ruth herself died in the
  grind. The most likely shape is a mutual kill through the pyrrhic
  direct-write path in a fight that closed 'lost' (scholar-death)
  rather than 'unfinished' — the analyzer's pyrrhic matcher only
  checks 'unfinished' traces, and the instrument's closeTrace never
  checks the log on a 'lost' ending. Filed to the findings backlog:
  the next recorder should check the log on 'lost' endings too. The
  verdict does not depend on it: log-based 20.0% and matched 18.3%
  both clear the bar.
- Baseline kills for contrast: 95001 d71 Algorithm (entry 27, wounded),
  95001 d74 Strike (20 rounds, solo, 1,022 scholar damage), 95007 d52
  Congregation, d56 Influencer, d76 Strike — all strike fights, 0 rage
  presses in the killing traces except the churned d70 Algorithm
  lead-in (6 presses, 1 strike).

## Best-round composition (prereg secondary)

| | Baseline (lost, n=47) | Armed (lost, n=47) |
|---|---|---|
| Median best round | 43 | 64 |
| Median scholar share | 100% | 78% |
| Ally contributed | 13/47 | 22/47 |
| Ability verb in best round | 2/47 | 7/47 |
| Single-actor spike | 37/47 | 30/47 |
| Median share of entry HP | 5.5% | 6.3% |

Best rounds moved (43 → 64) but the shape is the same story as
partydamage: a best round is ~6% of entry HP, and repeating it for
all 6 survived rounds is ~38% of a beast. The ceiling re-sized on the
armed leg is 43.3% (16 flips of 47 lost fights + 10 kills over 60) vs
27.8% baseline — a bigger fantasy, same fantasy: it requires the best
round every round PLUS one aimed strike at 2.5x, and the fights still
end with the scholar dead. No ability verb appears in a best round
often enough to matter (7/47), and none of those 7 is a rage press
that landed doubled strikes — the rage presses consumed the turns
instead.

## Wall numbers

| Seed | Baseline (days, end, w4tb, w4k) | Armed (days, end, w4tb, w4k) |
|---|---|---|
| 95001 | 81, lost, 8, 2 | 137, lost, 16, 4 |
| 95002 | 150, lost, 1, 0 | 124, lost, 6, 1 |
| 95003 | 62, lost, 11, 0 | 86, lost, 9, 1 |
| 95004 | 92, lost, 6, 0 | 119, lost, 8, 2 |
| 95005 | 101, lost, 0, 0 | 104, lost, 1, 1 |
| 95006 | 99, lost, 10, 0 | 95, lost, 0, 0 |
| 95007 | 91, lost, 11, 3 | 150, survived, 16, 3 |
| 95008 | 115, lost, 7, 0 | 78, lost, 4, 0 |
| **Band** | **median 95.5d** | **median 111.5d** |

Wins 0/8 both legs, national 0/8 both, table 0/8 both, wave-4 unlocks
7/8 baseline / 8/8 armed, wave-4 faced 7/8 both, wave-5 unlocks 1/8
baseline (95007, standing 220) / 0/8 armed, wave-5 faced 1/8 / 0/8,
readiness-5-ready days 3 baseline / 1 armed, living wave-4 killers at
end 1/8 both (baseline gen_rwl65e3 on 95001; armed nino_kapanadze on
95004 — the only killer alive at the horizon on either leg). Field
wave-4 fights 10 baseline / 34 armed, 0 kills both.

Trajectory divergence note: identical seeds, different policies, so
the villages diverge — 95007 baseline reached wave 5 (standing 220)
while armed 95007 survived the full 150d at standing 199 and never
opened the door; 95005 baseline never reached wave 4 while armed
95005 fought one and killed it; 95006 baseline fought 10 wave-4 TB
fights while armed 95006 fought none. The per-seed fight counts
differ because the policy changes who lives to fight, not because
the instrument missed fights (0 unclassified, 0 instrument errors,
60/60 and 54/54 traces present on both legs — the two armed traces
with no turns/verbs are the d85 unfinished fight, village died
mid-fight, and the d93 1-round wounded-entry kill).

## Village assessment (plain words)

Eight villages, seven reached the fourth wave on each leg, none won,
none opened the fifth wave's door on the armed leg. The villages kill
more on the armed leg — twelve beasts instead of five — and the extra
kills are real: a scholar and her friends standing their ground and
striking together for six rounds, the friends landing the last blow
sometimes, the scholar landing it others. But the thing this arm was
testing — pressing rage again and again — did none of that. In nine
fights the scholar held rage and spent every single turn pressing it,
sixty food-energy a press, and never once swung her weapon while the
red was up. The rage was lit and relit and never used. The kills came
from the fights where nobody held rage at all. And on one seed, six
people died in a single day grinding the same beast down, and the
"kill" went to a woman who died in the same grind. The road to the
full seat is still blocked in the fight itself: the party survives six
rounds and needs about sixteen, and no amount of re-lit rage buys
those rounds — because the rage, as pressed, buys nothing at all.

## Sense-test read

**One ally kill during the churn — 95004 d78, the Algorithm.** Nino
lands the killing blow while the scholar presses rage for the seventh
time and never strikes. The System names Nino on camera ("That's a
veteran kill, folks"). The fiction is fine; the mechanism is not: the
scholar's seven presses bought zero doubled damage.

**One grind day — 95001 d136.** Six scholars dead in a day (Sanh,
Raj, Lena, Ruth, Onni, Devon), the Reunion ground 3,548 → 249 HP
across four fights, the kill logged to Ruth the day she died. The
day's lines are grave after grave — "You carry the weight of it. They
died beside you." — and no triumph beat for the kill. A village that
loses six people to one beast in a day and banks a kill only in the
ledger is a village the game is asking to do the impossible. Same
family as partydamage's 41-HP grind (87008 d131), one day later in the
story.

**One silent wounded-entry kill — 95007 d93, the Eulogy at 9 HP.**
One 25-damage hit, one round, no turns recorded, no beat. The grind
did the work elsewhere; the kill passes without a word.

**The veteran-kill beat still misfires (not re-filed).** The System
calls wave-2/3 kills "veteran kills" (Redactor, Callback, Spool,
Chorus Line, Focus Group, Ad Break, Buffering) — the mismatch
partydamage already holds in the backlog. The wave-4 kills DO get the
beat (Nino d78 Algorithm, Nino d113 Eulogy, Fatima d52 Congregation).

**A narration glitch, filed.** "Grace SCREAMS — a sound like milk
curdling in fast-forward. The The Congregation freezes." The doubled
"The The" repeats (95007 d52, d53, d55). Filed to the findings
backlog as a minor narration defect.

## Balanced panel (§15) and telemetry

- `scripts/balance-panel.js --help`: refuses with the pilot's error
  (`Error: --out <panel-directory> required`). The tool runs its own
  full panel and takes no corpus input, so it cannot compare competent
  vs ragerepress on identical seeds. No Game-root change exists in
  this arm (policy A/B on identical seeds is the comparison), so no
  compare `.md` is fabricated — same outcome as the pilot, the
  confirm, fightinterior, and partydamage. The matched-seed paired
  comparison is the analyzer output above (identical seeds, both legs,
  same instrument).
- `scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json
  --current 'evidence/2026-11-06/perseed-ragerepress-b/*.json' --metrics
  national,table,wins,exiled`: REFUSED — "refusing recorder-corpus
  input: all 16 --current rows carry top-level anchorCommit, so they
  are sweep recorder rows, not runs." Recorded as the result, same as
  every prior killer-chain arm. No telemetry deviation check was
  possible on this corpus; the wall numbers above are the
  instrument's own. The WINSEAT baseline regime note was checked
  first: no pre-seat comparison is claimed anywhere here.

## Metric review

- **The primary metric is judged as pre-registered** (log kills /
  traced TB fights): armed 12/60 = 20.0% ≥ 10% — the number PASSES.
  The trace-matched rate (11/60 = 18.3%) also passes. The verdict is
  nevertheless NO-GO on the lever, because the prereg's metric-review
  caveat fires: the re-presses cluster on consecutive turns (48/48
  pairs, 0 strikes between), so the mechanism is refresh churn, not
  re-press value. A GO that lands a policy whose mechanism never fired
  would misattribute the frame's kill gain to the lever. No metric was
  swapped, re-cut, or re-thresholded after the run; the number stands
  as passed and the lever stands as killed.
- **The metric as written measures the frame, not the lever.** The
  kill rate cannot tell a rage-caused kill from a strike-caused kill.
  The next rage variant must be judged on rage-attributable damage
  (scholar doubled-strike damage in rage-press fights, or kills in
  fights where rage was pressed AND the scholar struck with the window
  live) — or the variant must carry a spent-guard so the mechanism can
  fire at all. Proposed revision for the NEXT run, not this one.
- **Baseline sits near the bar (9.3%)** on this band and the band is
  fight-dense (54–60 w4 TB fights vs 24–30 on the partydamage band),
  so the armed leg's 20.0% is a band + frame number, not a lever
  number. With 54–60 fights, one kill swings the rate ~1.7 points;
  the NO-GO is a pilot verdict on 8 seeds, not a proof that rage
  re-press can never work — it is a proof that THIS variant (cap lift
  with no spent-guard) cannot work, because the policy never strikes
  while the window is live.
- **The midnight fix worked.** The 95004 d78 Algorithm kill was fought
  day 77 and logged day 78; the recorder's ±1-day match classified
  the trace 'kill' (partydamage's same-day match would have called it
  'rout'). One of the three midnight shapes is now closed; the
  remaining gap is 'lost'-ending mutual kills (95001 d136 Reunion),
  filed to the backlog.
- **The two empty traces are understood, not hidden.** 95003 d85
  Influencer (1 round, 0 turns/verbs, unfinished — village died
  mid-fight) and 95007 d93 Eulogy (1 round, 0 turns/verbs, kill —
  the 9-HP wounded entry; the killing hit landed without a recorded
  turn verb, the same recorder gap the congtrace finding names: the
  verb row is lost when the killing blow lands on the first strike).
  Neither affects the judged numbers (both are in the denominator;
  the d93 kill is in the log numerator).
- **Field channel:** 10 field wave-4 fights baseline, 34 armed, 0
  kills both. Field fights are the untouched control; every kill came
  from a turn-based fight.
- **Guards held:** survival 111.5d ≥ 76.4d (0.8× baseline), starvation
  3 ≤ 4 (baseline + 2), wins 0 vs 0 (no fall).

## Blanks: filled vs documented

- **Filled:** the rage re-press lever — built, piloted on a fresh band,
  judged NO-GO on its mechanism (number passed, lever failed). The
  mechanism is now measured, not guessed: 57 presses, 48 re-presses,
  all consecutive-turn, 0 scholar strikes in rage-press fights, 0
  scholar damage there, 1 kill trace with rage presses (an ally kill).
  The midnight-spanning kill match is built and proven (95004 d77/78).
- **Documented (not filled, owned elsewhere):** the survival-time
  binding itself — the party survives a median 6 rounds in lost fights
  on both legs and needs ~16; holding ground does not buy rounds, and
  re-lit rage buys nothing at all. The next lever must open survival
  time (armor/mitigation curve — a balance lever, not a fight policy)
  or make the rage window spendable (a spent-guard variant), or put
  abilities in villagers' hands so the cascade has something to press.
  No gate, price, or deed change is proposed. No `src/js` change was
  made in this arm.

## What this arm does NOT claim

- Not a GO: the 20.0% passes the pre-registered bar, but the lever
  did not cause it and does not land. A confirm would re-run the same
  non-firing policy; the next step is a different variant
  (spent-guard), not a confirm of this one.
- Not a kill of the hold-ground frame: the frame (staging + rally +
  hold-ground + strike-together) produced 12 kills against 5 baseline
  on identical seeds. The NO-GO is the rage-cap lift's, not the
  frame's. The frame's own verdict was partydamage's NO-GO on its band
  (8.3% vs 10.0%); the band difference, not a lever difference, is the
  honest reading of the two pilots side by side.
- Not a field-fight fix: field fights killed 0 wave-4 monsters on both
  legs; every kill came from a turn-based fight.
- Not a pair: the one living killer (nino_kapanadze, 95004) is alone;
  no second killer exists anywhere on the band, readiness-5 never
  released.
- Not a win story: 0 wins, 0 national, 0 table on both legs; the
  wave-5 door opened once, on the baseline leg only.
- The Stage-0 smoke and the proof legs are not evidence; only the
  judged 8+8 legs above are.

## Next blanks (for the loop, not this arm)

1. **Rage spent-guard variant** — press rage ONLY when the previous
   window's 3 strikes are spent (or no window is live). The cap lift
   proved the failure shape (consecutive-turn refresh, zero strikes);
   the guard is the variant that can actually deliver doubled strikes.
   Judge it on rage-attributable damage, not just the band kill rate.
2. **Survival time** — the co-lever the prereg named: the party needs
   ~16 rounds and survives 6. Armor/mitigation that lets a scholar
   stand 15+ rounds against wave-4 damage is a balance lever (game
   code), not a fight policy.
3. **'Lost'-ending mutual kills** — the recorder should check the log
   on 'lost' endings too (95001 d136 Reunion). Filed to the backlog.
4. **The 249-HP grind** — four scholars died in one day grinding one
   Reunion 3,548 → 249 HP, the kill going to a woman who died in the
   grind. Same family as partydamage's 41-HP grind; the grind's price
   binds.
5. **Abilities reaching villagers** — the cascade fired 72 times in 60
   fights but patient_aim only 12 times and freeze_tag / hogtie /
   bird_strike / turncoat never; the hands are mostly empty. The main
   session's ability-use follow-up is the arm that can move this
   number.

## Proof and commits

- Proof `scripts/test-ragerepress-20261106.js`: **57/57 green** on the
  build commit before the judged run (fixtures + policy unit fakes +
  live legs to /tmp: wave-4 traces with hits/turns, all classified,
  zero instrument errors, determinism byte-identical, neutrality
  off-vs-on, armed strikes in w4 fights, armed never flees w4, rage
  re-press on consecutive turns in fakes, patient_aim still capped,
  midnight-pyrrhic match and day+2 non-match). After the pilot NO-GO'd
  and the policy was deleted, the proof was re-run green at **37/37**
  on the final tree (analyzer fixtures + midnight checks + baseline
  live legs; the policy fakes and armed live leg were removed with the
  dead policy, not faked). The analyzer's pyrrhic matcher and the
  instrument's closeTrace both carry the ±1-day midnight window,
  pinned by proof tests.
- The driver loads the armed policy lazily (only for
  POLICY=ragerepress): the pilot NO-GO'd and the policy file is gone,
  so a top-level require would break the baseline legs and the
  instrument proof. POLICY=ragerepress without the file is a loud stop
  (exit 4), not a silent fallback.
- Prereg committed `3a4803e0b` before any judged sim. Build committed
  `c22333838` (policy + recorder/driver/analyzer + proof 57/57).
  The safe-commit index clobber hit on both commits (files shown
  staged-as-deleted after correct commits); repaired with HEAD-blob
  cacheinfo each time, verified `git status` empty + `git diff HEAD`
  empty + hash-object matches.
- Judged corpus: `evidence/2026-11-06/perseed-ragerepress-b/` (16
  files, 8 baseline + 8 armed), all with 0 instrument errors.
  Analyzer output saved at `/tmp/rr-analysis.json` (working copy;
  the evidence file above is the record).
- Stage-0 smoke: 55002 baseline + armed, 90d, to /tmp (traces
  present, armed strikes in w4, armed never flees w4, 0 errors,
  determinism byte-identical, neutrality on days/endReason/kill-log
  length) — unjudged, not evidence.
- The prototype policy (`scripts/policies/competent-ragerepress-b.js`)
  is DELETED with this run (killed lever leaves no trace); the
  deletion is committed separately below. Instruments, driver,
  analyzer, and proof test remain as reusable measurement tools.

## Convergence

**scale-onramp / winnability chain: converging, NOT converged.** The
rage re-press lever is spent as designed: lifting the cap restored
rage volume (57 presses vs 4) and the kill rate cleared its bar
(20.0% vs 9.3% baseline) — but the volume was churn, not damage, and
the kills came from strikes in fights without rage. The binding
constraint is still survival time × damage per strike vs entry HP,
and the fight-policy half of it is now measured three times over
(solo P3 NO-GO by arithmetic, party P3 NO-GO by pilot, rage re-press
NO-GO by mechanism). The next lever has to buy rounds lived, or make
the rage window actually spendable — or put abilities in villagers'
hands so the cascade has something to press.
