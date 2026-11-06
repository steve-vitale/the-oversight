# Rage re-press lever — prereg (arm sim-ragerepress-b)

Run: `fleshout-loop-b-20261106T1730Z`, arm 2 of 3. Axis: scale-onramp /
winnability chain (wild ally-join → wave-4 kills → veterans →
readiness-5 release → wave-5 facing → full seat). Arm:
`sim-ragerepress-b`, branch `sim-ragerepress-b`, worktree
`~/workspace/worktrees/sim-ragerepress-b`.

## Blank (from the 1630Z B run, partydamage next blank #4)

`evidence/2026-11-06/sim-partydamage-b.md` NO-GO'd the party-damage
policy on wave-4 TB kill rate (armed 2/24 = 8.3% vs the 10% bar,
baseline 3/30 = 10.0%). One named confound: the policy caps rage at
once per fight — competent re-presses rage whenever winning (36× on
the baseline leg vs 4× armed), so the armed leg fought with LESS rage,
not more. This arm tests exactly that: lift the cap, nothing else.

## Interpretation note (task wording, recorded before the run)

The brief says "the ONLY difference from competent is the rage cap."
Read literally that is a null test: competent's own cascade
(`abilityPressPlay`, `scripts/policies/competent.js` ~2397) presses
rage whenever winning and non-trivial with NO once-per-fight cap on
rage (only bird_strike and pocket_sand are capped there) — it pressed
rage 36 times on the partydamage baseline leg. A "competent + rage
re-press" policy would BE competent. The meaningful single-variable
test — the one the 1630Z blank names — is the partydamage policy with
the rage cap lifted. So: **armed = competent-partydamage-b verbatim
except rage is exempt from the once-per-fight cap; baseline =
competent verbatim.** The armed leg differs from the partydamage leg
in exactly one variable (the rage cap), and the pilot on a fresh band
is directly comparable to the partydamage pilot (8.3% armed, 10.0%
baseline). If the coordinator intended a different base, this prereg
says so plainly before any judged sim runs.

## The build (policy only — scripts/policies/*)

`scripts/policies/competent-ragerepress-b.js`, a copy of
`competent-partydamage-b.js` with exactly one behavioral change:

- **Rage re-press allowed.** In `cascadePress`, the once-per-fight
  `st.pressed` set exempts `rage`: rage is never skipped for having
  been pressed already in this fight, and is never recorded in
  `pressed`. Every other cascade ability (patient_aim, freeze_tag,
  hogtie, war_cry) stays capped at once per fight. Frozen cascade
  order, one press per turn, dinner reserve 200 kcal, rally round 1,
  hold-ground, strike-together — all byte-identical in behavior to
  the partydamage policy.
- **Engine fact (checked, not assumed):** `rage.unleash_rage`
  (`src/js/abilityActions.js:1614`) sets
  `s.rageActive = { rounds: 3, dmgMult: 2.0 }` — the next three strikes
  deal double damage. There is NO engine once-per-fight block:
  `_actionAvailable` has no rage precheck and
  `ABILITY_ACTION_PRECHECKS` carries no `rage.unleash_rage` entry, so
  a re-press is accepted by the engine. A re-press while rage is
  still active resets the 3-strike window (no stacking — the
  assignment overwrites). Cost 60 kcal per press; the 200 kcal dinner
  reserve gates total spend, so rage can fire at most while kcal
  stays above 260. A refused press costs nothing and falls through
  to striking, exactly as in partydamage.
- **No gate / price / deed / readyDemand change.** No `src/js`
  change. The instrument is a copy of the partydamage recorder with
  one documented improvement (see below).

## Recorder improvement (carried from the partydamage metric review)

The partydamage metric review named it: the recorder's `closeTrace`
matched kills same-day only, so a midnight-spanning kill (fight day
117, kill logged day 118) was classified 'rout'. This recorder
matches kills across the midnight boundary (kill day == fight day OR
fight day + 1), in both the instrument's `closeTrace` and the
analyzer's pyrrhic matcher for 'unfinished' traces. The PRIMARY
metric is log-based (waveKillLog kills / traced fights) and is
unaffected by the classifier either way; the fix changes only the
trace-level ending and the same-day-matched secondary rate.

## Design (frozen — do not tune mid-run)

- Baseline: competent policy VERBATIM (`scripts/policies/competent.js`).
- Armed: `competent-ragerepress-b` (partydamage base + rage re-press).
- Horizon: 150d, death-aware (dead villages stop simulating; +10d tail
  max). Seeds: 8 + 8, identical seeds both legs.
- Anchor: worktree HEAD at prereg commit (recorded in the evidence file).
- Instruments: `scripts/ragerepress-instrument-20261106.js`,
  `scripts/ragerepress-driver-20261106.js`,
  `scripts/ragerepress-analyze-20261106.js`,
  `scripts/test-ragerepress-20261106.js` (proof: fixtures + live smoke
  + off/on neutrality). Corpus:
  `evidence/2026-11-06/perseed-ragerepress-b/` (16 files).

### Seed-band freshness check (skill local_seed_band_freshness)

- Suggested candidate **88011–88018: COLLIDES, rejected.** Seeds
  88011–88014 were used in `evidence/2026-10-24/journey-endgame-r46.md`
  ("Seeds fresh 88011–88014", judged corpus with wins). The suggested
  band overlaps a named range, so it is used even though 88015–88018
  are not individually named.
- Chosen band: **95001–95008**.
- Searched: ALL `evidence/**/*.md` (every dated prereg + every
  evidence .md) for the digit strings 95001–95008 — **0 hits**.
  Searched for `"seed": 9500x` in evidence .json — **0 hits**.
  Searched for per-seed filenames (`*9500*`) — only `s9500.json`
  files (seed 9500, a different seed, rotdecide2-b / raidcallers-b
  corpora), no 95001–95008 file. Searched the convergence tracker
  and the `lever-claims/` directory for 9500 — **0 hits** (the
  `29500`/`19500` hits in `hidden_files/evidence/` are pantryKcal
  values, not seed namings). Searched the forbidden/contaminated
  lists named in preregs (sim-proposefirst-b-prereg used-band list;
  no dedicated forbidden-band file exists in hidden_files per
  sim-fightinterior-b-prereg) — 95001–95008 appears in none.
- Other bands checked and NOT picked: 88015–88018 (not named, but
  adjacent to the used 88011–88014 block — avoided on purpose),
  89011–89014 (journey-endgame-r77), 90001–90006
  (journey-deepening-r7), 92011–92018 / 93011–93026
  (tbretreat-refind), 94011–94026 (pdvalue), 85001–85004
  (journey-scale-r30), 86001–86008 (pitapprentice). Forbidden per
  the task brief, never re-picked: 87001–87008 (partydamage),
  51001–51008 (fightinterior).
- Verdict: band **95001–95008 FRESH**.

## Pre-registered verdict (judged, not fished)

**Primary metric: wave-4 TB kill rate, armed vs competent-verbatim
baseline on identical seeds.** Kill rate = wave-4 kills in
`waveKillLog` (all channels that write the log, pyrrhic included) /
wild wave-4 TB fights (traced fights, both legs counted the same way).
Fight-level endings are reported alongside but do not judge.

- **GO iff armed wave-4 TB kill rate ≥ 10%** (the finishprobe /
  partydamage bar, so the two pilots are comparable). The partydamage
  pilot's armed leg was 8.3% on its band; this arm asks whether
  restoring competent's rage volume (36 presses per band vs 4) moves
  the rate to the bar.
- **NO-GO iff armed kill rate < 10%.** A miss is NO-GO, never re-scored
  against a friendlier metric (§14). If the metric proves wrong, it
  goes under "metric review" and a revision is proposed for the NEXT
  run. If the pilot NO-GOs, the lever is killed: the prototype policy
  is deleted, not landed (a NO-GO policy lands ONLY as a reusable
  instrument if the coordinator explicitly says so — default is delete).

**Secondaries (reported, not judged):**

- **Rage re-press count per fight** (the prereg secondary the task
  names): rage presses per wave-4 TB fight, armed vs baseline, and
  rage re-presses (2nd+ press in a fight) on the armed leg. The
  mechanism check is that the armed leg's rage volume is back at or
  above competent's level (partydamage armed: 4 presses in 24 fights).
- **Survival time as co-lever:** median rounds survived in lost
  wave-4 TB fights (armed vs baseline) + median survival days (guard
  below).
- **Damage per round, by side:** median player-side damage/round and
  monster-side damage/round (trace hit log), scholar strikes/fight,
  beast HP left at end (median frac of max).

**Guards (a GO that breaks a guard is NO-GO):**

- G-survival: armed median survival ≥ 0.8× baseline median survival
  (task's guard; the partydamage pilot's −10d guard is superseded by
  this run's binding guard).
- G-starvation: starvation deaths on the armed leg ≤ baseline + 2
  (the scalemetric bar).
- G-wins: wins must not fall on the armed leg vs baseline (reported;
  a fall is investigated, not auto-failed — a win fall with a kill
  rise is a finding, not a GO).

**Wall numbers (reported every run):** wins / national / table /
wave-4 unlocks / wave-4 faced / wave-5 unlocks / wave-5 faced /
readiness-5-ready days / living wave-4 killers at end / median
survival, per seed and band-wide, both legs.

**Balanced panel (§15):** before/after comparison runs through
`scripts/balance-panel.js`; the compare `.md` is attached to the
evidence file. Prior killer-chain arms found the tool takes no corpus
input (it runs its own full panel) — if it refuses again, the matched
identical-seed paired comparison (the analyzer output) is the
comparison and the refusal is recorded, not fabricated.

## Metric review (per §14 — written before the run)

- Kill rate uses `waveKillLog`, not fight endings: fight-level counts
  undercount the log by the pyrrhic kills, and the pyrrhic path
  bypasses the instrument's kill hook. The denominator is traced
  wave-4 TB fights; field fights are the untouched control channel
  and are counted separately, never mixed into the TB kill rate.
- The partydamage pilot's baseline sat exactly on the bar (10.0%) on
  its band; the baseline on THIS band is the honest comparator, and
  the armed leg must beat the bar, not just its own baseline.
- With 24–30 fights expected, one kill swings the rate ~3–4 points;
  the NO-GO/GO is a pilot verdict on 8 seeds, not a proof that rage
  re-press can never work. A confirm would be spent only on a changed
  lever, never on this one as-is.
- The rage mechanism's ceiling: a re-press resets the 3-strike
  window, so pressing while rage is still active buys nothing — the
  re-press only pays when the previous 3 strikes are spent. The
  secondary (re-press count per fight) is the check that the policy
  actually re-presses AFTER the window is spent rather than
  refreshing a live window every turn. If the armed leg's rage
  presses cluster on consecutive turns, the mechanism is refresh
  churn, not re-press value, and the evidence file says so.
- TB `swingsAttempted` counts player strikes only; companion strikes
  are uncounted, so TB damageFrac (HP lost across the fight) and the
  trace hit log are the reliable damage measures, not swings.
- 8 seeds / 150d is a pilot: thin buckets (<5 fights) are reported as
  unjudgeable, not as firing or failing. A GO/NO-GO verdict rests on
  the pre-registered rules above, not on a re-scored metric. Every
  evidence file carries a "metric review" section.

## Canon read before writing this prereg

- docs/CANON.md, docs/MONSTER-WAVES.md (wave-4 bands HP 850–1500,
  damage 35–95, pierce 0.2–0.5; gate standing >= 100; readiness-5
  bar needs 2 living veterans with wave-4+ kills), docs/SYSTEMS.md
  (systems map — no rage-specific canon; the rage ability def in
  `src/data/abilities.json` is the source: next 3 strikes double
  damage, 60 kcal, System pool, food-powered).
- MONSTER COMMITMENT (Steve 2026-11-02): a monster stays committed
  unless its kind carries an explicit `flee` component; no wave-4
  monster carries one (finishprobe verified). This arm does not
  change any flee component.
- No canon doc covers rage re-press as a lever; the lever is sized
  from the partydamage evidence (the named cap confound), not
  invented from a standing start.
