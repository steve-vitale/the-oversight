# What makes bloodings cluster on door seeds? — Loop B, run fleshout-loop-b-20261124T1030Z, arm sim-bloodcluster-b (DIAG)

Axis: winnability chain (re-point 2026-11-03). DIAG-ONLY arm: zero
src/js changes. This arm answers vetpair
(evidence/2026-11-24/sim-vetpair-b.md) §Next blanks #1: the living
veteran PAIR is the door's fingerprint — every readiness-5-ready day
(85, on 4 seeds) is an event-overlap day; 92 overlap days, 6 windows,
on 4 seeds of the vetpair band — while on 8/12 non-door seeds the
bloodings are sequential, with gaps of days to weeks. The pair forms
when the second killer bloods before the first dies. WHY do bloodings
cluster on door seeds and not elsewhere?

Candidate mechanisms (frozen — no mid-run additions): (A) wave-4
spawn density / kill rate — door villages meet more wave-4 monsters,
or convert more meetings into kills; (B) party formation — door
bloodings happen with a party standing beside the killer; (C)
field-fight damage/staying — the win-fielddmg lane (WINFIELD-DMG,
landed 2026-11-03: ally gear parity + party morale in fieldFight):
door villages' field fights deal more damage and stay instead of
fleeing; (D) wild ally-join — the win-allyjoin lane: an ally answers
the shout / joins from the door, or a wild joiner (visitor/drifter)
becomes the second killer. Coordinate with, do not duplicate, those
lanes — no live claims exist for them and no standalone
win-fielddmg / win-allyjoin evidence file exists in this tree; their
published findings are the WINFIELD-DMG code comments in
src/js/fieldFights.js and the 0840Z round record. This arm MEASURES
their quantities on the vetpair band; it does not re-run their lever
tests.

Anchor: HEAD `b7f77443c` (branch sim-bloodcluster-b) at prereg time.
Instrument: the standing-gearready instrument
(`scripts/standing-gearready-b-instrument-20261124.js`) reused
VERBATIM as the base (daily snapshots, killEvents, deathEvents) plus
a NEW thin instrument (`scripts/bloodcluster-b-instrument-20261124.js`)
that wraps `fieldFight` (full fight record, all waves) and
`startCombat` (TB entry party, via `Game.tbfight.fighters`) — both
call-through, RNG-neutral, zero src/js. Driver
(`scripts/bloodcluster-b-driver-20261124.js`, run `bloodcluster-b`)
and analyzer (`scripts/bloodcluster-b-analyze-20261124.js`) are new.
Proof: `scripts/test-bloodcluster-b-20261124.js` (analyzer fixtures +
live harness smoke + determinism replay leg), green BEFORE the judged
leg. The vetpair corpus CANNOT answer this question: it records kill
day/via only — no contacts, no party sizes, no fight records — so the
band is REPLAYED with the new instrument. The vetpair corpus is NOT
pooled with this arm's numbers and NOT re-judged.

Policy: `scripts/policies/competent.js` `{competent}` VERBATIM,
default env. Horizon: 150 days, death-aware (the judged 150d corpus).
Seeds: 109310–109325 (16) — a DELIBERATE REPLAY of the vetpair /
standingconfirm band for comparability. Band freshness in the "unused
band" sense does NOT apply: this is a replay measurement, not a fresh
confirm. New per-seed files carry `-bloodcluster-b` in the RUN slot,
under `evidence/2026-11-24/perseed-bloodcluster-b/`; the driver
refuses to overwrite. Balanced panel (§15): INAPPLICABLE for the
decomposition itself (a census, no before/after change); the analysis
JSONs are attached instead. No comparison is fabricated.

## Substrate check (§14b — before the pilot leg)

The phenomenon IS staged on this substrate: the vetpair census (same
band/policy/horizon) counts 30 wave-4+ bloodings on 12 seeds, 24
deduped wave-4+ kills on the 4 door seeds vs 15 on the 12 non-door
seeds, and 4 door openings. Pool: 39 deduped wave-4+ kills band-wide
is enough to classify every blooding and contrast the four families.
Horizon: bloodings on this band fall on days 40–150, inside 150d.
Staging: pilot = first 8 seeds (109310–109317) as the smoke leg
(instrument fires, field fights recorded, bloodings classified);
confirm = remaining 8 seeds (109318–109325). Both legs judged
against the SAME frozen bars below; the verdict is on the full 16.

## Definitions (frozen — no mid-run taxonomy drift)

- **Blooding** = a killer's FIRST wave-4+ kill (deduped log rows
  only — never kill-event calls; vetpair correction: wave-5 kills on
  this band are 3, not 4). Expected count 30, per the vetpair census.
- **Door seed** = 109311, 109312, 109313, 109314 (the four that open
  the wave-5 door in the vetpair census). **Non-door seed** = the
  other 12. The grouping is FROZEN from vetpair; the new corpus must
  verify it (daily peak reaches 5 on exactly those four) — a
  mismatch is an instrument-health finding, not a re-grouping.
- **Contact (field)** = one `fieldFight` call with wave >= 4 and
  outcome != `alreadyDead` (a corpse is not a spawn). **Contact
  (TB)** = one `startCombat` call with a wave >= 4 monster
  (contest arena fights go through `startCombat`, so they count
  here). **Total contacts** = field + TB. Contacts are counted
  whether or not they end in a kill — the denominator of the kill
  rate.
- **Spawn density** = wave-4+ contacts per village-day alive from
  wave-4 unlock (first daily snapshot with peak >= 4) to end
  (death or horizon). **Kill rate (conversion)** = deduped
  wave-4+ kills / wave-4+ contacts. **Kill volume** = deduped
  wave-4+ kills per village-day alive from wave-4 unlock.
- **Kill channel** (from `recordWaveKill` via, frozen): `field`
  = via wild / agency / patrol / sortie / aid-crisis (all flow
  through `fieldFight`); `tb-scholar` = via player; `tb-companion`
  = via companion; `contest` = via contest; `other` = any other
  recorded via (still classified — the channel is recorded, the
  bucket is a label). A blooding whose via is none of these is
  UNCLASSIFIED.
- **Party size at kill (field)** = fighters standing at the kill:
  `1 + (number of non-null allyVid / ally2Vid / ally3Vid in the
  fieldFight record)`. `rec.partySize` (leader + allies at entry)
  is recorded alongside; the two agree except when an ally answers
  the mid-fight shout. **Party size at kill (TB)** = living
  villager fighters + scholar in `Game.tbfight.fighters` at
  `startCombat` return (entry party; reinforcements after entry are
  not re-read — a stated instrument limit).
- **Ally-join (field)** = any allyVid non-null in the fight record.
  Split: `from-start` when `opts.allyFromStart` was true (aid
  parties already at the door); `shout-joined` when
  `opts.allyFromStart` was false and `rec.calledHelp` is true
  (the hopeless-shout answer). `rec.shoutJoined` is a closure
  local, not a record field — the split is derived as written,
  never guessed from the log text.
- **Field-fight damage/staying** = per wave-4+ field contact:
  rounds, `mDealt` (leader damage), ally damage
  (`allyDealt + ally2Dealt + ally3Dealt`), `vTaken`, outcome.
  Staying = the fight ran to `vKill` / `mFlee` / `vDie` (not
  `vFlee`); the fled share is `vFlee / contacts`.
- **Joiner origin** = the blooder's id prefix at first roster
  appearance in the daily snapshots: `visjoin_` = visitor invited
  to join (betrayal.js — proven in code); `app_` = drifter
  applicant (membership.js — "a drifter with a past, generated
  light"); `gen_` = generated villager (game.js — generated
  character); named/data id = authored villager. **Days
  join→blood** = blooding day − first roster day. Daily snapshots
  are ~daily, not strictly calendar-daily, so a join day is
  accurate to ±1 day (stated limit, not silently corrected).
- **Mechanism class of a blooding** (exactly one per blooding):
  `field-solo` (field kill, party size 1), `field-party-start`
  (field kill, party size >= 2, from-start ally), `field-party-shout`
  (field kill, party size >= 2, shout-joined ally),
  `tb-scholar-solo` (TB kill by scholar, entry party 1),
  `tb-scholar-party` (TB kill by scholar, entry party >= 2),
  `tb-companion` (TB kill by a companion — party by construction,
  entry party recorded), `contest`, `other-<via>`. A blooding with
  no matching fight record (no fieldFight row same day + same mid
  + same leader vid, and no TB start same day + same mid) is
  UNCLASSIFIED.
- **Dominant mechanism** = the candidate family (A–D) whose
  headline rate has the largest door/non-door ratio AND whose
  channel covers >= 50% of door-seed bloodings. Headline rates:
  A = contacts/day and kills/contact; B = share of wave-4+ kills
  with party size >= 2; C = field-fight vFlee share and mDealt per
  kill; D = share of wave-4+ contacts/kills with an ally-join, and
  share of door blooders who are joiners (first roster day > day
  2). If no family reaches a 1.5x door/non-door ratio on its
  headline rate, the verdict is NO-DOMINANT (clustering is
  cumulative volume + survival, not one mechanism) — recorded with
  the ratios, following the vetpair precedent where refuting the
  working description was the census succeeding.

## Pre-registration (binding, §11/§14) — FROZEN BARS

DIAG-GO requires ALL of:

1. **Classification completeness** — every wave-4+ blooding on
   every seed carries exactly one mechanism class; 0 unclassified
   band-wide (door seeds included). Expected 30 bloodings.
2. **Dominant mechanism named with counts** — the dominant
   mechanism (definition above) is named with its door/non-door
   counts and its coverage of door-seed bloodings (>= 50%); or
   NO-DOMINANT is declared with all four families' ratios. Either
   way the naming is explicit — a decomposition that names nothing
   fails this bar.
3. **Door vs non-door contrast quantified** — all four candidate
   families carry a complete contrast table (spawn density,
   conversion, kill volume; party size at kill; field-fight
   damage/staying; ally-join presence + joiner share). 0 missing
   cells. A null (no separation) is a reported number, not a gap.
4. **Instrument health** — 0 instrument errors; every wave-4+
   waveKillLog row linked to a killEvent with `entryAdded` (or
   explained); every wave-4+ fieldFight `vKill` linked to a
   `recordWaveKill` entryAdded row (or explained); every wave-4+
   TB kill linked to a `startCombat` record (alien-duel direct
   builds carry wave null and cannot produce wave kills, so any
   unlink is an error); determinism — seed 109312 run twice on
   this anchor yields identical killEvents and identical wave-4+
   fieldFight rows; door grouping verified (daily peak reaches 5
   on exactly 109311–109314).

Secondary rates (recorded, NOT judged — a move here is a
metric-review note, not a bar failure): inter-blooding gaps on
door vs non-door seeds; killer survival after blooding (vetpair:
median 15d); wave-4 contacts by wave-4 monster type; wave-5
unlocks / faced / kills; wins / national / table counts; median
survival (censored, reported as such).

## Instrument limits (stated up front, not discovered mid-run)

- Daily snapshots understate event overlap by 7.6% (vetpair:
  85 snapshot vs 92 event overlap days) — the overlap numbers
  here are event-level from kill/death events; snapshot figures
  are reported separately and never silently corrected.
- TB party size is read at `startCombat` return (entry party);
  mid-fight reinforcements are not re-read.
- Joiner first-appearance day is accurate to ±1 day (snapshot
  cadence).
- `fieldFight` record `log[]` is NOT stored (volume); only scalar
  fields. Sense-testing reads the live `saySample` / standing
  lines around bloodings instead, plus the vetpair transcripts.
- Contest kills carry no party-size instrumentation; they are
  their own mechanism class with counts.

## Sense-testing law

Transcripts are read: the bloodings on the richest door seed
(109312, expected) are told in plain words — who blooded, with
whom beside them, after how many rounds, for how much damage,
whether anyone answered a shout — and one non-door seed's
sequential bloodings are told the same way. Kill beats and fight
lines around those bloodings are quoted, judged for meaning and
coherence, never just counts.

## Deliverables

- This prereg, committed BEFORE any judged sim.
- Per-seed JSONs under `evidence/2026-11-24/perseed-bloodcluster-b/`
  (16 files + 1 determinism replay file, `-bloodcluster-b` in the
  RUN slot).
- Evidence `evidence/2026-11-24/sim-bloodcluster-b.md`: mechanism
  decomposition with counts, door vs non-door contrast tables for
  all four families, village assessment in plain words, blanks
  filled or documented, next blank named, scale-wall numbers
  (national / table / wins, wave 4–5 unlocks, median survival), a
  "metric review" section (§14).
- New gap found outside this arm → append to
  `hidden_files/sim-findings.md` in its format; do not chase it.
- Zero src/js changes. No push, no bump, no live verification, no
  merge (coordinator merges --ff-only; ship loop owns deploys).
- No second band / no confirm-of-confirm without coordinator
  say-so.
