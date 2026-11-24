# sim-basedmg-b — PREREG (frozen BEFORE any new sim)

**Arm:** sim-basedmg-b · **Loop B run:** fleshout-loop-b-20261124T1815Z
**Type:** DIAG — decompose launched-party damage/round into its
components and name which one binds (finding #2544).
**Frozen:** 2026-11-24 ~19:00 UTC, before any judged sim.
**Branch:** `sim-basedmg-b` (worktree
`~/workspace/worktrees/sim-basedmg-b`). **Base master:** `c78100ff4`
(sim-winnability-round-1430 adoption closeout).
**Builds on:** `evidence/2026-11-24/sim-ragecarry-b-confirm.md`
(NO-GO powered: the stacked damage-multiplier carrier is EXHAUSTED
as a kill-share lever — do NOT build another carrier variant),
`evidence/2026-11-24/sim-fightcap-recheck-a.md` (DIAG-NO-GO thin
pool, damage/round ~45–55), `evidence/2026-11-24/sim-ragecarry-b.md`
(pilot).

## The question

A typical launched trio deals ~38–51 damage/round to a ~1,200 HP
wave-4 monster and flees after ~5 rounds; the only winning
reference (Cooper's party) dealt ~111/round via a Rage fighter at
2.5x + bow opening + all three hitting every round. Base strikes
are ~12 damage; doubled they are ~30. This arm DECOMPOSES, not
fixes: measure launched-party damage/round into its components and
name which component binds.

## What was read first (do not re-measure what they answered)

- Ragercarry confirm (12 seeds, powered): arm damage/round 51.3
  vs ctl 47.8; the carrier doubles strikes, but launched fighters'
  base strikes are ~12–19 damage, so a doubled strike is ~30–38.
  "Doubling a weak strike does not make a strong party." The one
  control kill (Valeria, 107901 d96, ~145-damage strikes, no Rage)
  shows base damage, not the multiplier, is what kills wave-4
  monsters.
- Fightcap-recheck (8 seeds, thin pool n=9): arm vFlee 45.3/round
  (pooled 49.3), vDie 15.6; longest fight 13 rounds, 742/1059 HP,
  still fled. Zero zero-damage meetings. Recorder gaps still bite:
  the 20-line encounter-log cap truncates every fight longer than
  ~4 rounds, and per-fighter attribution (`dmgByVid`) was empty on
  the Reunion vDie — this arm's instrument closes both gaps (full
  log capture + log-line strike parsing + per-fighter gear
  snapshot).
- Canon: `docs/CANON.md` + `docs/MONSTER-WAVES.md` read. Wave-4
  bands: damage 35–95, HP 850–1500, pierce 0.2–0.5 — "a 4–6 round
  fight for a godhood build (~220 dmg/round)". No canon doc covers
  the sim recorder, the launch party, or Rage-holder acquisition —
  said here rather than inventing canon. The strike engine is cited
  from code: `src/js/fieldFights.js` lead strike
  `lroll([4+wb, 8+wb])`, `wb = round((melee+ranged)/2)`; ally strike
  the same formula on the ally's own weapon; volley opening;
  `src/js/godpath.js` `fieldStrike` (Rage x2 via nextMult, plus
  strikeMult/power/misdirection); ability modifiers in the strike
  block (aim 2.5x, haymaker x2, stalk +4, dead aim x2, blood trail
  +2, trade of blows 1.5x, editor cut, audit half, reunion worn-thin
  0.85^(n-2)).

## The decomposition (frozen)

For every launched wave-4+ meeting in the judged population, the
analyzer reports, per meeting and pooled:

1. **Striker count present** — distinct fighters who struck
   (lead + allies, from parsed strike lines + fight record).
2. **Strikes/round per fighter** — parsed strikes per fighter /
   rounds fought (lead, ally1, ally2/3 separately; verb/trick
   displacement counted as a non-strike round for the lead).
3. **Mean strike damage per fighter** — parsed strike damage,
   split into:
   - **base roll** (reconstructed by reversing the modifiers on
     the strike line, in reverse application order; validated by
     re-applying forward and comparing to the logged damage within
     rounding ±1, and by checking the pooled mean base against
     6+wb from the fighter's gear snapshot),
   - **weapon tier** (equipped melee/ranged weapon id + bonus,
     wb = round((melee+ranged)/2), snapshotted at fight start),
   - **ability contribution** (additive: stalk +4, blood trail
     +2; multiplicative: aim 2.5x, haymaker x2, dead aim x2, trade
     of blows 1.5x — each named separately),
   - **multiplier/Rage contribution** (the `(xN.N)` fieldStrike
     factor; Rage-attributed where the strike falls inside a Rage
     window opened by an "eyes go red" line, else named as
     strikeMult/power — never silently lumped into Rage).
4. **Volley opening** — ranged-opening damage (round-1 volley +
   ambush opening + contact finish), as a share of mDealt.
5. **Rounds fought** before flee/death/victory, **monster HP**
   (mHpStart), **damage/round** — MEAN and MEDIAN across meetings
   (the ragecarry metric-review proposal: a single strong meeting
   must not lift the mean silently).

**Instrument check (frozen):** parsed damage reconciles against
`rec.mDealt` per meeting (sum of parsed strike/volley/ability-touch
damage vs mDealt; residual named per meeting and pooled — ability
lines the parser does not cover land in the residual, never in a
component). The analyzer `--selftest` covers the join, the
strike-line parser (all line shapes incl. Rage windows, ally
echoes, volley, ambush, mirage miss, editor cut), the base
reconstruction round-trip, and all judge shapes.

## Primary metric (BINDING, §14)

**Decomposition completeness on the pair-inclusive engaged
launched wave-4+ meeting population** (the same population
fightcap-a / ragecarry-b judged: v4encounters row with origin
`expedition`, wave ≥ 4, joined to its v4gates row with a
non-empty planParty, |planParty| ≥ 1, launched party PRESENT,
ENGAGED — rounds > 0; evades join nobody), **plus the binding
component named with numbers.**

**DIAG-GO bar (frozen):**
- Pair-inclusive pool n ≥ 10 (state the pool plainly if short),
  AND
- Decomposition complete: every judged meeting parsed with a
  reconciled residual (pooled parsed-vs-mDealt residual ≤ 10% of
  pooled mDealt), every component above reported with numbers, AND
- Binding component named: exactly one component, raised to the
  Cooper's-party level (below), closes the ~38–51 → ~111
  damage/round gap — OR a verdict, with the counterfactual
  numbers, that **no single component does**,
  AND instrument selftest green, AND proof test green.

**Cooper levels (frozen, from the brief + ragecarry evidence):**
- Multiplier: Rage x2 on the fighter's strikes (the carrier's
  multiplier; aim 2.5x reported beside it, never substituted).
- Strikes: 3 strikers striking every round (lead + 2 allies, no
  verb/trick displacement, no ally absence/down).
- Base: every striker's wb raised to the best wb observed among
  launched fighters in THIS corpus (the best available weapon in
  the measured villages); the wb that would be needed to close
  the gap is reported beside it.
- Volley: bow opening ~50–60 damage in round 1.
- Counterfactual method: from the observed MEDIAN meeting (median
  damage/round, median strikes/round, median base, median
  multiplier), scale ONE component to its Cooper level and
  recompute damage/round; the component whose scaling reaches
  ≥ 111 (or comes closest, with the shortfall stated) is binding.
  Rounds-to-kill at the observed rate vs the counterfactual rate
  is reported beside it (rounds is an outcome, never a lever).

**Verdict ladder (frozen):**
- Pool n ≥ 10 + decomposition complete + binding component named
  (or no-single-component verdict with numbers) + selftest green
  + proof test green → **DIAG-GO**.
- Pool n < 10 → **DIAG-NO-GO THIN-POOL** (the decomposition is
  reported anyway; the question stays open).
- Decomposition incomplete (residual > 10% pooled, or a component
  unmeasurable) → **DIAG-NO-GO INSTRUMENT** (the parser/recorder
  gap is named, not papered over).
- Any other frozen bar missed → **DIAG-NO-GO** with the bar named.

## Secondary metrics (supporting, not binding)

- Kill share / win share on the pair population (reported beside
  the decomposition, never substituted for it).
- Trio+ population (size ≥ 3, present, engaged): reported beside
  the primary, never substituted.
- Per-outcome decomposition (vKill / vFlee / vDie): does the
  binding component differ by outcome?
- Monster mix by outcome; wall numbers (reported every run):
  national / table / wins, wave-4 and wave-5 unlocks, median
  survival.
- Table: not instrumented by this driver — reported as null,
  never faked.
- Sense-test: read transcripts of the best + worst meetings in
  full; judge whether fights read as real fights (who struck,
  who fled, why), not just counts.
- Consistency check vs the fightcap-recheck corpus (seeds
  110101–110108, DIAG-NO-GO thin pool, damage/round ~45–55): the
  decomposition must be consistent with it where the bands
  overlap; any inconsistency is named, not smoothed over.

## What this DIAG does NOT judge

- No game-code lever is landed; no carrier variant is built
  (ragecarry NO-GO exhausts that family — see above).
- No 12–16 seed confirm in this run — single-leg DIAG; the
  coordinator decides any follow-up from the verdict.
- The gate arm (damage proxy) — explicitly deferred; the gate
  still measures size+gear, never damage (0 avoids across the
  ragecarry confirm's 24 losses).
- The 4th seat (engine-blocked) — out of scope.
- No `check.js` gate (no src/ change; driver + analyzer + proof
  test only).

## Horizon, seeds, policies

- **Horizon:** 150d, death-aware (same as the fightcap /
  ragecarry bands, for comparability). Dead villages stop
  simulating (+10d tail max).
- **Seeds (fresh 8-seed band): 109501, 109502, 109503, 109504,
  109505, 109506, 109507, 109508.** Freshness check (skill
  local_seed_band_freshness), 2026-11-24 ~19:00 UTC, before any
  judged sim: `git grep -l -E "10950[1-8]" -- 'evidence/*/sim-*.md'
  'evidence/*/sim-*-prereg.md'` — 0 hits; same pattern over
  `'evidence/*.md' 'evidence/*/*.md'` — 0 hits; over
  `'scripts/*.js'` — 0 hits. Collisions recorded so the next
  worker does not repeat them: 109501–109508 (this band);
  107901–107912 (ragecarry confirm); 107801–107808 (ragecarry
  pilot); 110101–110108 (fightcap recheck); 110301–110316
  (fightcap confirm, frozen); 106151–106158 (designated
  holder-rich band, deliberately not used — the damage question
  needs launch richness, not holder richness).
- **Policies:** competent verbatim (`scripts/policies/competent.js`,
  sha256 first 12 `1884c8852d38` — verify at run time; if the
  policy sha differs, record it and STOP, do not silently run a
  different policy). **Substrate (landed code):**
  `SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1
  FIGHTALLY2=1` — the ragecarry-confirm substrate exactly. The
  driver asserts the flags and the SENSEEXPED presence in
  `src/js/party-wiring.js`, and each corpus file records
  `senseexpedOn` + shas.
- **Instrument:** `scripts/basedmg-driver-b.js` (a port of
  `scripts/ragecarry-driver-b.js` from branch `sim-ragecarry-b` —
  the recorder is unchanged except: full `rec.log` capture (no
  20-line slice), per-fighter gear snapshot at fight start
  (weapon id/name/bonus, wb, armorP, abilities), ally dealt
  tallies (`allyDealt`/`ally2Dealt`/`ally3Dealt`), `ffFired` +
  `actionKinds` + `trickLog` on the row; carrier flags are
  asserted OFF — this is a single-leg DIAG with no lever);
  analyzer `scripts/analyze-basedmg-b.js` (reuses `legStats`
  from `scripts/analyze-fightcap-a.js` for the population join;
  the strike-line parser + decomposition + judge are new here,
  `--selftest` incl. the parser shapes, the base-reconstruction
  round-trip, the reconciliation check, and all judge shapes);
  per-seed JSONs under
  `evidence/2026-11-24/perseed-basedmg-b-ctl/`.
  **§15 panel:** single-leg DIAG, so no panel compare is
  required; if a comparison leg is run, it goes through
  `scripts/balance-panel.js` per §15 and the compare `.md` is
  attached.
- **SINGLE LEG.** No 12–16 seed confirm in this run; the
  coordinator decides the follow-up from the verdict.

## Encounter-gear fixture (Steve 2026-11-13)

The verdict turns on whether a launched party FIGHTS as launched,
so the fixture is the encounter itself, staged by the competent
policy: a geared scholar fighting with a party, never a fresh
un-geared solo scholar. The per-seed corpora carry the encounter
averages (party size, gear, abilities) beside the verdict in the
evidence file, so a later reader can see the fixture gap without
re-running the panel. The nearest measured point for the encounter
gear is the fightcap band (launched parties geared by the launch
gear-up, min armorP 17.7–28.3); this DIAG does not re-derive gear —
the competent policy plays it, and the corpora record what it
played, per fighter, per meeting.

## Pre-run substrate checklist (§14b)

1. **Contact:** launched wave-4 meetings occur on the substrate —
   ragecarry confirm: 37 expedition-joined encounters / 12 seeds
   per leg; fightcap recheck: 27 / 8 seeds. The pair-inclusive
   pool on this band is expected ≥ 10 on 8 seeds (ragecarry
   confirm ctl n=13, arm n=12; fightcap recheck arm n=9).
2. **Pool sizing:** see (1). The pair-inclusive floor (n ≥ 10)
   is the judged population; the trio+ pool is reported, not
   judged.
3. **Mechanism pre-check (frozen, not a sim):** the proof test
   (`scripts/test-basedmg-b.js`, GREEN before the band) stages the
   instrument in a staged field fight — full-log capture, fighter
   gear snapshot, strike-line parsing incl. Rage windows and ally
   echoes, base reconstruction round-trip — and proves the
   carrier flags are asserted OFF (no lever in this DIAG). The
   analyzer `--selftest` covers the join, the parser, the
   reconciliation, and all judge shapes incl. THIN-POOL and
   INSTRUMENT paths.

## Canon note

`docs/CANON.md` (manifest) and `docs/MONSTER-WAVES.md` were read
for this arm. MONSTER-WAVES.md: wave-4 bands are damage 35–95, HP
850–1500, pierce 0.2–0.5 — "a 4–6 round fight for a godhood build
(~220 dmg/round)". The decomposition's damage yardstick (~220
dmg/round vs the measured ~38–51) comes from that canon band, not
from invention. Rage is data, not canon prose:
`src/data/abilities.json` rage/`unleash_rage` — cost {turn: true,
kcal: 60}, "Your next three strikes deal double damage"; the field
engine is `src/js/godpath.js` `fieldBegin`/`fieldAct`/`fieldStrike`
+ `src/js/fieldFights.js` (volley, strike fold-in, ally strikes).
No canon doc covers Rage-holder acquisition, the launch party, or
launch gear-up — said here rather than inventing canon. The launch
mechanics are cited from code (`win-plan.js`,
`villager-agency.js` `startExpedition`, `party-wiring.js`
SENSEEXPED, `fieldFights.js`), not from canon.
