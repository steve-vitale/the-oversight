# sim-dmgshape-b — FROZEN prereg (Loop B 1230Z run, arm sim-dmgshape-b)

**Frozen:** 2026-11-19 12:54 UTC, BEFORE any judged sim. Base master
`e1f002065` (journey-establishment r243). Branch `sim-dmgshape-b`.
**Diagnostic:** instrument-only — ZERO `src/js` game-code changes.
The instrument is a new driver + analyzer in `scripts/` (pure reads
of the fight record `rec`); the game is untouched.

## The question (tracker blank 1, fightcap follow-up)

The fight-ally cap arm (sim-fightcap-b, NO-GO) showed launched quads
deal ~49.5 damage/round in fled fights (n=15) against a ~111/round
winning shape (fightcap-a ladder), and the cleanest pair — the same
d58 Congregation fight on seed 104771 — dealt 435/999 (43.5%) with
two allies and 686/999 (68.7%) with the 4th member, and still fled.
The party needed ~111/round over 9 rounds and dealt ~76. The cap
was a real constraint on damage and not the constraint on killing.
This arm decomposes WHERE the ~61/round gap comes from.

## Correction 2 (coordinator's call, 2026-11-19 ~13:20 UTC — port the
held lever; BEFORE any judged sim on the corrected substrate)

The "Substrate honesty note" above is SUPERSEDED by this correction
(it stays as the record of what was true at freeze time). The
coordinator verified the same blocker on the sibling arm
(sim-partysurvive-b) and authorized, for this purpose only, porting
the held ALLYSLOT3 slot onto this branch — overriding the
"zero src/js changes" line in the original brief for the port alone.

- **Port:** `git cherry-pick 5a5343363` (held lever commit on branch
  sim-fightcap-b; ports slot commit 7efbf26a8 from sim-allyslot3-b
  onto master eccc08af2) onto this branch → commit `c84a312ba`,
  applied CLEANLY with no conflicts. Verification:
  `git diff 5a5343363 -- src/js/fieldFights.js src/js/game.js
  src/js/party-wiring.js` shows ONLY rebase/base differences —
  fieldFights.js 18 lines (sim-speargate-a ammo naming),
  game.js 225 lines (sim-bowopen-a villagerStageBow),
  party-wiring.js byte-identical, scripts/test-allyslot3-b.js
  byte-identical. Proof test `scripts/test-allyslot3-b.js`: **18/18**.
- **Killed inert-substrate leg (full disclosure):** a judged leg on
  the inert substrate had ALREADY STARTED before this correction
  arrived (7/8 seeds complete, 105931–105937; seed 105938 in
  flight). It was KILLED on receipt of the correction, its corpus
  DELETED (7 files, `evidence/2026-11-19/perseed-dmgshape-b/`),
  and NO analysis was run on it — no verdict was taken from it.
  Its driver log is preserved as
  `evidence/2026-11-19/dmgshape-b-leg-killed-inert.log` (+ `.err`).
  The coordinator's "no judged sim has run yet" is therefore
  corrected here: a leg started, was killed mid-run, and is
  discarded; the judged leg below runs AFTER the port, on the
  corrected substrate. The frozen substrate (flags, band, policy,
  horizon) is otherwise UNCHANGED.
- **Ceiling redefinition (consequence of the port, frozen here):**
  the port makes FOUR strikers possible (fighter + 3 allies), so
  component (d) is now `W − P_mean × 4` (was ×3), the empty-slot
  accounting in (c) now includes ally3's empty rounds, and the
  per-member split now reports ally3 separately (roundsDetail
  carries `ally3Dealt` per round on the ported engine). The GO bars
  (accounted ≥ 0.70, top ≥ 0.25), the pool floor, and the
  reconciliation band (±15%, Correction 1, now against
  `P_mean × 4 − D_strike`) are UNCHANGED.
- **EVIDENCE-ONLY:** the ported lever must NEVER be merged to
  master as a game change. This branch holds it only so the
  diagnostic can run; the coordinator lands evidence-only
  (tooling/prereg/evidence cherry-pick, as fightcap was handled)
  or releases the branch done-abandoned.

## Substrate honesty note — ALLYSLOT3 is inert on this master (frozen)

The task brief says to match fightcap-b's arm leg exactly
(SENSEEXPED=1, PARTYSIZE4=1, VETREENGAGE=1, FLEEREPAIR2=1,
FIGHTALLY2=1, ALLYSLOT3=1). Verified by grep over `src/js/` on this
tip: `ally3` and `ALLYSLOT3` occur NOWHERE. The 3rd-ally slot was a
ported lever on the fightcap branch only; it was NO-GO and never
landed, so current master caps field fights at 2 allies
(FIGHTALLY2). The fightcap driver asserts `LEVER_PRESENT` and would
exit 2 here, so this arm uses its own driver copy
(`scripts/dmgshape-driver-b.js`) with that assertion removed — the
flag is still set in env and still self-described per corpus file
(`allyslot3Flag: '1'`, `leverPresent: false`), but it changes
nothing in the engine. The judged population is therefore launched-
quad meetings AS THEY OCCUR ON MASTER (fighter + up to 2 allies);
the reference numbers remain fightcap-b's arm leg (49.5/round fled,
111 winning shape, d58 686/999 in 9 rounds). The decomposition
question is unchanged: the gap is measured against the same 111
shape, and the 4th member's already-measured contribution (141
damage, ~15.7/round over 9 rounds in the d58 pair) is cited as a
known component, not re-measured. No `src/js` change is made to
restore the slot: that would be a game-code change, forbidden to
this instrument-only arm, and the slot's own verdict was NO-GO.

## Seed band + freshness (local_seed_band_freshness)

**Seeds: 105931, 105932, 105933, 105934, 105935, 105936, 105937,
105938 (8, pilot gate).** Freshness check, run before freezing:
`grep -rn "10593" evidence/ --include="*.md"` — ONE hit, a false
positive (evidence/2026-10-29/journey-scale-r52.md line 109, "lines
10593," — a capture line number, not a seed); `grep -rln "1059"
evidence/ --include="sim-*-prereg.md"` — one file,
sim-speargate-a-prereg.md, whose band is 105901–105908 (no overlap);
`grep -rn "105931|105932|10593[0-9]" evidence/ goal
hidden_files/sim-findings.md` — 0 seed hits. Scope searched: all
`evidence/*/sim-*-prereg.md`, all `evidence/**/*.md`, and the goal
`hidden_files/sim-findings.md`. Collisions recorded so the next
worker does not repeat them: 104770–104777 fightcap-b;
104730–104745 partysize4-confirm-b; 105901–105908 speargate-a;
106001–106008 freestrike-b / ragepreempt-b. Band 105931–105938 is
fresh.

## Judged population (frozen)

`scripts/analyze-fightcap-b.js` `quadKills()` population, reused
unchanged (corrected loose join, findings #2564/#2570): wave 4–5
expedition-origin encounters, fought (rounds > 0 or mDealt > 0),
joined to a quad launch (launch party size ≥ 4, fighter belongs to
the launch, 21-day window). The decomposition runs on the FLED
subset (outcome `vFlee`) of that population — the fights that had
damage but no kill. Killed fights (`vKill`) and villager-death
fights (`vDie`) are reported beside, never substituted.

## Primary metric (BINDING, §14)

**Per-round damage decomposition of fled launched-quad fights.**

- `D_meas` = mean of per-fight `mDealt/rounds` over fled fights
  (the fightcap ladder definition — MEAN of per-fight rates, not
  pooled). Reference winning shape `W = 111`/round (fightcap-a
  ladder; canon godhood ~220/round; MONSTER-WAVES.md wave 4: HP
  850–1500, "a 4–6 round fight for a godhood build (~220
  dmg/round)").
- Gap `G = W − D_meas` (per round; G > 0 expected — if G ≤ 0 the
  diagnostic is moot and the verdict is NO-GO kind
  NO-GAP).
- Additive components, all per-round over the fled fights, computed
  from the engine's own per-round records (`rec.roundsDetail`,
  `rec.roundTotals`) and the FULL fight log (uncapped — the 20-line
  cap that hid Ruby d139 is removed in this driver):
  - (a) **Verb loss** — fighter rounds spent on a verb/ability
    instead of a strike (fighter action line in that round is not
    a "strikes for" line; `rec.actionKinds` cross-check):
    `verbRounds / totalRounds × mean fighter landed-strike damage`.
  - (b) **Miss loss** — zero-damage strikes ("strikes for 0":
    mirage miss, editor cut) as a share of strike attempts:
    `zeroStrikes / totalRounds × mean landed-strike damage`.
  - (c) **Ally-delay loss** — striker-slot rounds empty: rounds
    before ally1/ally2/ally3 joined (join line "charges in!") or after
    they went down, vs a full 4-striker round:
    `emptyStrikerRounds / totalRounds × mean ally landed-strike
    damage`. (Correction 2: ally3's empty rounds count now that the
    slot is ported; the ceiling is 4 strikers.)
  - (d) **Base-rate ceiling** — the strike formula's own ceiling:
    `W − P_mean × 4`, where `P_mean` = mean damage per landed
    strike (fighter + allies, volley excluded) and 4 = max
    strikers/round (fighter + 3 allies, no verbs, no misses).
    (Correction 2: was ×3 on the inert substrate; ×4 on the
    ported substrate.) This is the shortfall that remains even at
    a full party striking every round — it names the tactical
    formula ([4+wb, 8+wb] per strike, `fieldFights.js`) as the
    mechanism, with the measured `P_mean` beside it.
  - Reconciliation: (a)+(b)+(c) must equal `P_mean × 4 − D_meas`
    within ±15% (the volley/pre-round damage and Live Broadcast
    echo strikes are the known reconcilers, reported beside the
    error — see Correction 1 for the exact identity); a larger
    error is an instrument failure, verdict
    NO-GO kind INSTRUMENT.
- **Accounted share** = ((a)+(b)+(c)+(d)) / G.
- **GO bar: accounted share ≥ 0.70 AND the single top contributor
  ≥ 0.25 of G, named with per-component numbers.** Justification:
  0.70 means the gap is mostly explained, not mostly residual;
  0.25 means one mechanism dominates enough to aim the next lever
  at. A miss is NO-GO, never re-scored against a friendlier
  metric.

**Pool floor (binding precondition):** ≥6 launches on the leg AND
≥4 joined quad meetings AND ≥8 fled fights in the judged
population. If the floor fails, NO-GO kind METRIC-BROKEN (the band
delivered too thin a pool to decompose). No survey was run before
freezing (the band is fresh and the launch rate on fightcap's band
was 15 launches / 8 seeds); the floor prices that gamble.

## Secondary (REPORTED, not binding)

- Per-member contribution: fighter vs ally1 vs ally2 vs ally3 shares
  of `mDealt` over fled fights (from `roundsDetail`: fighter =
  dealt − allyDealt; ally1 = allyDealt − ally2Dealt − ally3Dealt;
  ally2 = ally2Dealt; ally3 = ally3Dealt; cross-checked against
  the full-log strike parse). (Correction 2: ally3 added.)
- Ability/touch damage share: damage of strikes carrying an
  ability note (aimed 2.5x, HAYMAKER x2, dead aim x2, blood trail
  +2, stalker's opening +4, debt settled 1.5x, GPf `(xN.N)`
  including Rage doubling, mirrored, audited, under review) as a
  share of `mDealt`, plus the ability-attributable EXCESS
  (dmg − dmg/mult for multiplier notes; flat amount for +N notes;
  Live Broadcast echo strikes counted separately). Trick damage
  share: tricks deal no direct damage — reported as ~0 with the
  evidence (trick lines counted), not assumed.
- Volley/pre-round damage share (`rec.flPreRoundDealt` / mDealt).
- Rounds survived before flee/death: distribution of `rounds` by
  outcome; kill-gap per fled fight in HP and in rounds-at-111
  (`(mHpStart − mDealt) / 111`).
- **Late-Rage-fire pin (secondary):** for every Rage fight in the
  corpus (`rec.rageFired`), the fire round parsed from the FULL
  log ("eyes go red" / Rage line with its `R{n}` prefix). Late =
  fire round ≥ 4. Report observed-or-absent with counts and the
  fight contexts. Background: ragepreempt-b's Ruby d139 (seed
  106005, Algorithm, vFlee in 6 rounds) fired on R5/R6 while its
  conditions read true from R1; the mechanism was unobservable
  behind the 20-line cap. This corpus's uncapped log is the pin —
  report what it shows, do not chase it beyond the corpus.

## Cost bars (REPORTED — single diagnostic leg, no lever)

No lever is judged, so there are no cost bars to breach. The wall
numbers (national / table / wins, wave 4–5 unlocks, median
survival, community loss) are reported every run per the scale-wall
directive and compared against fightcap-b's arm leg as the
reproducibility reference.

## Design

- Horizon: 150d, death-aware (dead villages stop, +10d tail max).
- Policies: competent verbatim only.
- Leg: ONE diagnostic leg (MODE=dmgshape), substrate flags
  SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1
  FIGHTALLY2=1 ALLYSLOT3=1 (last flag inert — see honesty note).
- Driver: `scripts/dmgshape-driver-b.js` — a copy of
  `scripts/fightcap-driver-b.js` with ONLY these changes: RUN/OUTDIR
  renamed; `row.log` uncapped (500 lines × 400 chars); the row
  additionally carries `rec.roundsDetail`, `rec.roundTotals`,
  `rec.actionKinds`, `rec.strikesThrown`, `rec.rageFired`,
  `rec.flPreRoundDealt`, `rec.allyDealt`, `rec.ally2Dealt`
  (pure reads, no game change; `rec.ally3Dealt` was already
  carried by the copied row). Correction 2: the driver now STOPS
  if the ported slot code is absent (`LEVER_PRESENT` enforced) —
  the leg must never re-scope to the control substrate. All other
  recorder logic (v4departs, v4gates, dawnbid, wall fields,
  per-seed summary) is byte-identical in behavior.
- Analyzer: `scripts/analyze-dmgshape-b.js` — reuses
  `analyze-fightcap-b.js` `quadKills()` for the population +
  ladder, then decomposes the fled rows from the new fields +
  a full-log parser. `--selftest` covers: the d58 Congregation
  row re-parsed from the frozen fightcap corpus (435/999 ctl
  shape: 8 rounds — the analyzer must reproduce the ladder
  number from the fightcap corpus), a synthetic full-log
  decomposition (known strikes/verbs/misses/joins → known
  components), and a driver smoke (one 30d seed, exit 0, 0
  instrument errors, flags self-describing).
- Panel: `scripts/balance-panel.js` compare of this corpus
  against the fightcap-b arm corpus as a same-substrate
  reproducibility reference (NOT a lever before/after) via
  `scripts/build-dmgshape-b-panels.js`; attach the compare `.md`.
- Telemetry: `node scripts/telemetry-check.js --baseline
  <scale-wall.json> --current 'evidence/2026-11-19/
  perseed-dmgshape-b/*.json' --metrics national,table,wins,
  exiled`; if it refuses recorder corpora, record the refusal
  verbatim and report wall numbers directly (as fightcap-b did).

## Fixture (encounter-gear rule, Steve 2026-11-13)

No staged fixture: the corpus is live launched-quad fights from
the competent policy on the fresh band — the same population
fightcap judged. The analyzer's synthetic selftest stages its
own rows, not live fights.

## Metric review

- **Correction 1 (prereg, before any judged sim — instrument-model
  fix, 2026-11-19 ~13:00 UTC):** while building the analyzer, the
  reconciliation identity as written was found inconsistent: (a)
  prices verb rounds at the fighter's mean and (c) prices empty
  striker rounds at the allies' mean, while the ceiling `P_mean × 3`
  prices every missing attempt at the pooled mean, and `D_meas`
  includes volley damage while (a)–(c) price strike attempts only.
  The exact identity is (a′)+(b′)+(c′)−echoBonus =
  `P_mean × 3 − D_strike`, where (a′),(b′),(c′) are the same counts
  priced at `P_mean`, echoBonus = echo strikes/round × `P_mean`,
  and `D_strike` = (mDealt − volley)/rounds pooled over fled
  fights. The reconciliation check is therefore computed on the
  exact identity (band ±15% unchanged); the reported components
  (a)–(d), the accounted share, and the GO bars (0.70, 0.25) are
  UNCHANGED. The residual error then measures unmodeled round
  effects (flee-round truncation, trick-displaced strikes, stuns),
  which the evidence will name if large. Same class of fix as
  ragepreempt-b's Correction 1: an instrument-model error found in
  shakedown, before any judged data was seen. (Correction 2 moves
  the ceiling to ×4 — four strikers on the ported substrate; the
  identity is otherwise unchanged.)
- The primary denominator (fled launched-quad meetings, corrected
  loose join) is pre-registered here with the reason stated (the
  flee is the outcome to explain; kills and deaths are reported
  beside it). The per-fight dpr definition is fightcap's ladder
  definition (mean of per-fight rates), chosen so `D_meas`
  compares directly with the published 49.5.
- The 111/round winning shape is a fightcap-a ladder number, not
  a canon figure: MONSTER-WAVES.md anchors wave 4 at HP 850–1500
  with "a 4–6 round fight for a godhood build (~220 dmg/round)",
  which brackets 111 as a competent-party winning shape (roughly
  half godhood). If `D_meas` lands far from 49.5, the gap is
  computed from THIS corpus's `D_meas`, not from 49.5 — the
  fightcap number stays a reference, never a substitute.
- The base-rate ceiling (d) uses `P_mean × 4` — four landed
  strikes every round. That is the formula ceiling for a full
  party (Correction 2: was ×3 on the inert substrate), not a
  realistic rate (verbs, misses, and join delays
  are priced separately in (a)–(c)); the reconciliation error
  is the check that the split is honest.
- The late-Rage-fire secondary is observed-or-absent by design:
  one corpus cannot establish the delay mechanism, only whether
  late fires recur and on which rounds.
