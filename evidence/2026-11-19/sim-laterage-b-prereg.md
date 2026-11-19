# sim-laterage-b — FROZEN prereg (Loop B 1530Z run, arm sim-laterage-b)

**Frozen:** 2026-11-19 17:11 UTC, BEFORE any judged sim. Base master
`1927a245e` (winnability-round-1230 adoption closeout). Branch
`sim-laterage-b`.
**Diagnostic:** instrument-only — ZERO `src/js` game-code changes.
The instrument is a new driver + analyzer in `scripts/` (pure reads
of the fight record `rec` + the full fight log); the game is
untouched. No game-code fix is built by this arm; if the diagnostic
names a lever, that is the next arm's work.

## The question

Quantify LATE Rage firing and the rounds lost after it fires —
two halves the freestrike arm did not measure:

- (a) WHEN Rage fires — the fire-round distribution (R1 vs late,
  R2+).
- (b) The delay AFTER firing — rounds from Rage firing to the first
  doubled strike landing, what fills those rounds, and the damage
  foregone.

Background sightings: dmgshape-b §5 (Fatima d118: Rage fires R4
of 9, doubled strikes land R6/R7/R9 because R4–R5 go to trick-hold
+ field medicine; 3/8 Rage fights deal 0 damage) and ragepreempt-b
(Ruby d139, unobservable behind the 20-line log cap). Question:
how common is late fire, and how much does the post-fire verb delay
cost in rounds and damage?

## Mechanism (grounded in code on this tip — not invented)

- Rage fires in `fieldAct` (`src/js/godpath.js:1661`): the holder
  holds rage, has not used it, no multiplier is live (`!G.nextN`),
  the monster is above 40% HP, and the 60-kcal pay succeeds. It
  sets `nextMult = 2, nextN = 3`, logs the Rage line, and returns
  consumed — the fighter does NOT strike that round.
- Fire is gated by everything ahead of it in `fieldAct` (mending
  hands, cheese wheel, static toss, retribution), by trick
  displacement (`villagerTrickAction` displaces `fieldAct` whole,
  `fieldFights.js:1951`), by the foodgate tier block, and by the
  pay. That is the whole candidate set for "why late".
- The doubling is spent ONLY by `fieldStrike`
  (`godpath.js:1766-1767`: `nextN` decrements on a fighter strike;
  nothing else consumes it — gravity_well does not, and no other
  `fieldAct` branch can spend it). Therefore the first doubled
  strike is, by mechanism, the FIRST fighter strike after the Rage
  line. The `(xN.N)` note on the strike line corroborates it (the
  note is the TOTAL multiplier — strikeMult × power × nextMult —
  so a doubled strike may read `(x2.0)`, `(x2.5)`, or another
  value, never a bare strike). A post-fire fighter strike with NO
  multiplier note is an anomaly, not a doubled strike.
- The verb chain that can fill delay rounds is the frozen taxonomy
  in `scripts/analyze-laterage-b.js`: the 10 field-chain verbs
  (from `fieldFights.js`, in chain order), the 13 consuming godpath
  turn verbs (from `fieldAct`), and the 25 trick actions (from the
  `trickAct` branches). Free godpath verbs (foresight, coin guard,
  stoke, gravity well, blink, crowd moves, live broadcast, aegis
  link) never consume the turn — a round with only a free verb and
  no strike/verb is an anomaly.
- CORRECTION to the dmgshape reading, frozen here: the "holds the
  line" lines ("working the trick, not the damage race" /
  "they know how this one is fought...") carry NO round prefix —
  they are morale-hold lines appended at the round's end
  (`fieldFights.js:2581,2594`), not round actions. Delay rounds
  are classified from `R{n}:`-prefixed lines ONLY; morale holds
  are counted per fight as context, never as a delay cause.

## Seed band + freshness (local_seed_band_freshness)

**Seeds: 106111, 106112, 106113, 106114, 106115, 106116, 106117,
106118 (8, pilot gate).** Freshness check, run before freezing:
exact-seed greps `106111`–`106118` over all `evidence/*/sim-*-prereg.md`
— 0 hits; over all `evidence/**/*.md` — 0 hits; over the goal
`hidden_files/sim-findings.md` — 0 hits; no `perseed-*` corpus
directory or file name contains any of the eight seeds. Scope
searched: all preregs, all dated `.md` evidence, the findings
backlog. (A broad `10611` prefix grep hits numeric noise inside
data dumps — pantry kcal values such as 106110 — not seed bands;
the exact-seed check is clean.) Collisions recorded so the next
worker does not repeat them: 106101 is named in
sim-bowopen-a-prereg.md and sim-speargate-a-prereg.md (rejected);
106001–106008 freestrike-b / ragepreempt-b; 105931–105938
dmgshape-b; 104770–104777 fightcap-b. Band 106111–106118 is fresh.

## Survey (BEFORE freezing — pool size only, dmgshape lesson)

A survey leg ran on this band before the prereg froze
(`perseed-laterage-b-survey/`, driver log
`laterage-b-survey.log`, 11 min, exit 0, 0 instrument errors).
ONLY the pool size was counted from it — no fire-round or delay
numbers were computed before freezing. Survey result:
**127 wave-4+ encounters, 1 Rage fight** (seed 106113; Rage line
and `rageFired` flag agree 1/1, 0 mismatches; only 3 encounters
in 127 had a fighter who even HELD rage, all 3 on 106113).
The survey corpus is retained until the judged leg reproduces
its pool count, then deleted; the judged corpus is the record.
The survey does not change the frozen bars below: the pool floor
is priced against the survey's thin pool, and a floor failure is
NO-GO METRIC-BROKEN, never a re-score or a band re-pick.

## Judged population (frozen)

Wave-4+ field fights (`v4encounters`, SEEDLAND semantics) whose
FULL log (uncapped — the 20-line cap that hid Ruby d139 is
removed in this driver) contains a Rage line ("eyes go red ...
(Rage)"). The fire round is the round of the first Rage line.
Late fire = fire round ≥ 2 (the dmgshape ≥ 4 cut is reported
beside for comparability). Out of scope, stated plainly: Rage
fires in wave < 4 fights are NOT measured here — the corpus
records wave ≥ 4 only — and no claim is made about them.

## Primary metric (BINDING, §14)

**Late-fire share + post-fire delay.**

- `lateShare` = Rage fights with fire round ≥ 2 / all classified
  Rage fights.
- `meanDelay` = mean rounds from firing to the first doubled
  strike landing, over Rage fights where a doubled strike lands
  (`firstDoubledRound − fireRound`; the fire round itself counts —
  Fatima: 6 − 4 = 2). Fights where no doubled strike ever lands
  report `delay = null` with `delayToEnd` (rounds from firing to
  fight end) beside the mean, never folded into it.
- Delay-cause rollup: every delay round classified (trick by type,
  field-chain verb, godpath turn verb, silent = no fighter action
  line: stunned / fled / died / fight ended, free_verb_only,
  strike_undoubled). Coarse grouping folds trick types into
  `trick`; the dominant cause is the top coarse category with its
  count over all delay rounds.
- **GO bar: taxonomy complete (0 unclassified Rage fights, 0
  anomalies) AND pool floor ≥ 8 observable (classified) Rage
  fights AND a named dominant delay cause with counts.**
  Justification: 8 is the smallest pool that can carry a
  distribution + a dominant-cause call; the taxonomy bar is the
  instrument proving the numbers, not a sample of them.
- **Pool-floor failure is NO-GO kind METRIC-BROKEN** (same kind as
  dmgshape-b). A miss is NO-GO, never re-scored against a
  friendlier metric (no smaller floor, no re-cut of "late", no
  pooling with the freestrike/ragepreempt corpora — different
  substrates).

## Secondary (REPORTED, not binding)

- Damage/round in late-fire (≥ 2) vs R1-fire fights (mean of
  per-fight `mDealt/rounds`).
- 0-damage Rage-fight share (`mDealt == 0`; dmgshape measured
  3/8).
- Doubled-strikes-landed distribution (0/1/2/3 per fight).
- Fire-round distribution (full) + the dmgshape ≥ 4 late cut.
- Foregone damage ESTIMATE (labeled estimate everywhere it
  appears): per fight, `(3 − doubledLanded) × unit`, where unit
  is the fight's own mean doubled-strike damage when any landed,
  else 2 × the fight's mean pre-fire normal strike, else the
  corpus mean doubled-strike damage. The formula prices the
  unspent window; it is an estimate because the counterfactual
  strike damage is not observed.
- Wall numbers every run (national / table / wins, wave 4–5
  unlocks, median survival, community loss).

## Cost bars (REPORTED — single diagnostic leg, no lever)

No lever is judged, so there are no cost bars to breach. The wall
numbers are reported per the scale-wall directive and compared
against the dmgshape-b leg as the reproducibility reference
(same substrate family, minus the ported slot).

## Design

- Horizon: 150d, death-aware (dead villages stop, +10d tail max).
- Policies: competent verbatim only.
- Leg: ONE diagnostic leg (MODE=laterage), substrate flags
  SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1
  FIGHTALLY2=1 — all five are landed code on this master
  (grep-verified; the driver asserts flags AND code presence and
  stops loudly on mismatch). The RAGEFREE/FIELDCAPDMG carrier is
  NOT used (held-branch code, not on master) and the FREESTRIKE
  ordering is NOT ported — this arm measures real Rage on master
  substrate. The ALLYSLOT3 slot is NOT ported (dmgshape's port
  was evidence-only and never landed; this arm runs without it).
- Driver: `scripts/laterage-driver-b.js` — a slim recorder (the
  dmgshape fieldFight wrap's wave ≥ 4 + uncapped-log pattern with
  the launch-funnel census, dawnbid, companion-pool and
  launch-track apparatus removed). Each corpus file self-describes
  mode/arm/substrate flags and the Rage-mechanism presence.
- Analyzer: `scripts/analyze-laterage-b.js` — fire-round +
  post-fire-delay decomposition, `--selftest` 16/16 (incl. the
  Fatima d118 shape, morale-hold non-attribution, never-lands,
  multi-fire / undoubled / strike-on-fire-round anomalies,
  summarize rates). Proof test `scripts/test-laterage-b.js` 11/11
  (analyzer selftest + 5-day driver smoke + mislabel guards).
- Panel: single diagnostic leg, no before/after — no panel
  compare is promised (a cross-band compare is structurally
  invalid; dmgshape §4). Wall numbers are the reproducibility
  reference.
- Telemetry: `node scripts/telemetry-check.js --baseline
  .../telemetry-baselines/scale-wall.json --current
  'evidence/2026-11-19/perseed-laterage-b/*.json' --metrics
  national,table,wins,exiled`; if it refuses recorder corpora,
  record the refusal verbatim and report wall numbers directly
  (as fightcap-b / dmgshape-b did).

## Fixture (encounter-gear rule, Steve 2026-11-13)

No staged fixture: the corpus is live wave-4+ fights from the
competent policy on the fresh band. The analyzer's synthetic
selftest stages its own rows, not live fights.

## Metric review (pre-registered reasoning, not a verdict)

- The pool floor prices a gamble the survey already lost: the
  survey pool is 1 Rage fight, so the judged leg is expected to
  return NO-GO METRIC-BROKEN. That expectation does not change
  the bars — the judged leg still runs, because the survey is a
  pool count, not a verdict, and the judged corpus is the
  citable record (with the taxonomy run over the fights that do
  exist). If the judged pool somehow differs from the survey pool
  (non-determinism), that difference itself is reported loudly
  and the verdict follows the judged corpus.
- The foregone estimate's weakest basis is the 0-landed case
  (2 × pre-fire mean strike): a fighter who never strikes
  post-fire has a thin pre-fire basis too. The estimate is
  reported with its per-fight basis, so a reader can see which
  fights carry it.
- "Silent" delay rounds conflate stunned / fled / died / ended.
  The outcome + rounds beside each silent round disambiguate
  the common cases (vDie on the round = died; vFlee with the
  fight ending that round = fled); a silent round mid-fight with
  the fight continuing is most plausibly a stun. If silent
  dominates the rollup, the next arm should split it with a
  stun recorder rather than re-scoring this one.
- The fire-round ≥ 2 definition of "late" is the brief's, and it
  is deliberately strict: on master substrate the Rage round is
  usually a fresh round 1 (freestrike measured 15/15 R1 carrier
  fires on its leg), so ≥ 2 is where the phenomenon begins.
  The ≥ 4 cut stays beside it so the dmgshape sighting (R4)
  remains comparable.
