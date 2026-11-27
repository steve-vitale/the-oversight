# sim-partydmg-a — PREREG (frozen BEFORE any judged sim)

**Arm:** sim-partydmg-a · **Loop A run:** fleshout-20261127T2215Z
**Type:** DIAG (instruments + evidence only — no game-code fix lands)
**Frozen:** 2026-11-27 ~17:15 UTC, before any judged sim.
**Branch:** `sim-partydmg-a` (worktree
`~/workspace/worktrees/sim-partydmg-a`).
**Builds on:** `evidence/2026-11-24/sim-leadworst-a.md` +
`evidence/2026-11-27/sim-speardmg-a.md` (§§0, 4, 8). Tracker next
blank #1; findings #2601 / 2026-11-27 leadworst entry. The
leadworst arm found the launch lead is the worst-armed fighter in
the launched party (median weapon bonus 8 vs allies' 17), and even
a best-armed lead in every meeting only lifts arm median
damage-per-round to ~70.5 vs the ~111 the kill line needs.
Speardmg-a (just landed, same run family) found the spear is only
5.1% of party damage with 0 vKills in 16 fights — opportunity-
starved, not weak. This arm answers the next question down the
chain: where does TOTAL party damage actually come from, what
does weapon quality contribute, and what (if anything) closes
the gap to the kill line?

## §0. The question, in plain words

A wave-4 fight needs about 111 damage a round to kill the
monster inside the morale window (leadworst-a). The best party
on the speardmg band reached 84.8 dpr; the mean was 30.4. So:
what is party damage made of — which fighters, which weapons,
which channels (strikes, volley, finish, ambush, abilities)?
How much does weapon quality (the folded wb) actually buy, and
how much is just how often each fighter gets to swing? And
arithmetically — no re-sim, no lever — which weapon-quality
improvement would close the gap to 111, and which would not?
Name the binding constraint.

## §1. Design from code (frozen, not a sim)

Read before designing: `docs/CANON.md`, `docs/MONSTER-WAVES.md`,
`docs/BALANCING.md`. **No canon doc covers party damage
decomposition or the wave-4 kill line** — the ~111/round line is
a leadworst-a measurement, not canon; the wave-4 bands (damage
35–95, HP 850–1500, pierce 0.2–0.5; a 4–6 round fight for a
godhood build at ~220 dpr) ARE canon (MONSTER-WAVES.md). Said
here rather than inventing canon. The damage rules live in code:
the tactical strike formula `lroll([4+wb, 8+wb])` with
`wb = round((meleeBonus + rangedBonus)/2)` (fieldFights.js),
the ranged opening volley (BALANCING.md: shots = min(ammo,
clamp(1 + floor(range / monster speed), 1, 4)), lead-only), the
contact finish (lead-only, fires only below the break line),
the ambush opening (lead-only), ally call-in on shouts (1st
ally round 2+, 2nd on the 2nd shout — speardmg-a §4). A weapon
is a human weapon (CANON.md human-skills lane), never an alien
ability.

**What already exists (the ground this diagnostic stands on):**

- The speardmg driver (`scripts/speardmg-driver-a.js`) records,
  for every expedition-origin wave-4+ fieldFight, a RICH row
  (`w4dmgFights`): entry kit per fighter (lead + up to 3
  allies: melee/ranged ids + live bonuses + weapon classes +
  folded wb + armor), per-fighter dealt tallies (leadDealt,
  allyDealt, ally2Dealt, ally3Dealt), volley, contact finish
  (attempted/kill/instrument/weapon/dmg), ambush damage, the
  full fight log, roundsDetail, mHpStart (recovered:
  mHpLeft + mDealt on fought non-kills; null on vKill /
  no-contact), nameCollision flag. This arm CLONES that driver
  verbatim (`scripts/partydmg-driver-a.js`, RUN=partydmg-a) —
  the row is the instrument; nothing about the fight is
  re-measured differently.
- The speardmg analyzer (`scripts/analyze-speardmg-a.js`)
  supplies the strike parser (`parseStrikes`: strike / echo /
  extra / ambush / contact / volley line kinds, attributed by
  the engine's refName rule), the fold-in attribution
  (spearShare / meleeShare / rangedShare), and the mix classes
  (`fighterMix`). This arm's analyzer
  (`scripts/analyze-partydmg-a.js`) REQUIRES those functions
  from it — one definition of the parser, the attribution, and
  the taxonomy; no second copy to drift.
- **Frozen numbers carried in:** kill line ~111 dpr
  (leadworst-a); speardmg band party dpr mean 30.4, max 84.8
  (16 fought fights, 1565 total damage); spear share 5.1%;
  volley 14.6% of party damage; contact finish 0 attempts on
  38 fresh meetings; ambush 0; 0 vKills in 16 fights.
  Leadworst-a: lead median weapon bonus 8 vs allies' 17;
  best-armed lead in every meeting → ~70.5 arm median dpr.
- **The counterfactual rule (frozen):** all weapon-quality
  counterfactuals are ARITHMETIC on the observed fights, never
  a re-sim and never a lever. Expected unmultiplied strike mean
  for folded wb w is (4+w + 8+w)/2 = 6+w (the tactical formula,
  read off fieldFights.js). A fighter's weapon-strike damage is
  re-scaled by (6+w')/(6+w) when their wb moves w → w', with
  their OBSERVED strike count held fixed; multipliers (Rage,
  audit, etc.) are already inside the observed numbers and are
  NOT re-applied. Volley / contact / ambush / extra damage are
  held at their observed values in every counterfactual (they
  are not weapon-strike damage). The required-wb computation
  per fight is: required mean strike damage = 111 /
  (observed weapon strikes per round); required wb = that − 6.
  These are what-if numbers on the observed opportunity
  structure — they answer "would better weapons close it?" and
  nothing else.

**Pre-registered expectation:** party damage will be dominated
by the lead's weapon strikes + the volley, with allies
contributing a minority (they enter late — speardmg-a §4); the
kill-line gap will be dominated by STRIKE RATE (too few swings
per round: ~3.06 weapon strikes per fought fight on the
speardmg band), not by per-strike size — so the weapon-quality
counterfactuals (even all fighters at wb 50) will NOT close
the gap to 111 on most fights, while the strike-rate
counterfactual (every fighter striking every round) will come
closest. The falsifier: a counterfactual that closes the gap
on a majority of fights, or a decomposition showing weapon
quality (not strike rate) as the dominant gap term.

## §2. Primary metric (BINDING, §14)

Single leg (DIAG — no ctl/arm pair; there is no lever to
compare). Population: ALL expedition-origin wave-4+ fieldFights
with rounds > 0 on this band. Each fight row carries the
speardmg rich row (entry kits, per-fighter tallies, volley,
contact finish, ambush, full log, mHpStart).

- **Pool floor:** expedition-origin wave-4+ fights with rounds
  > 0 ≥ 8. (Speardmg band: 16 fought fights — the floor is
  sized to that known density.)
- **Primary metric:** the total party damage decomposition —
  per fight and pooled: (a) by CHANNEL (weapon strikes /
  volley / contact finish / ambush / extra-ability), (b) by
  ROLE (lead / ally1 / ally2 / ally3), (c) by WEAPON-MIX
  CLASS (fighterMix, per-strike means + damage shares),
  (d) by WB TIER (wb bands 0 / 1–9 / 10–19 / 20–29 / 30–49 /
  50+: fighters, strikes, mean per-strike, damage share).
  Plus per fight: party dpr vs the ~111 kill line, the gap
  (111 − partyDpr), rounds-to-kill at observed dpr
  (mHpStart / partyDpr) vs rounds actually fought, and HP left
  at flee (mHpStart − mDealt). Plus the frozen
  counterfactuals (§1): A — every fighter at wb ≥ 30;
  B — lead at the best observed lead wb in every meeting;
  C — every fighter at wb 50; D — every fighter striking
  every round at their observed per-strike mean. Each reports
  counterfactual party dpr (mean / median / max) and the
  fraction of fights reaching ≥ 111.
- **Decomposition completeness (binding):** each of the three
  decompositions (channel, role, mix class) attributes ≥ 0.95
  of pooled mDealt — the fold-in rounding residue + the
  ability residual (unparsedDmg) are reported openly and are
  the only unattributed remainder.
- **Strike-parse coverage (binding):** fights where every strike
  line in the log parses to a known fighter / total fights with
  rounds > 0 ≥ 0.95.
- **Reconciliation (binding):** pooled |parsed damage + volley
  + contactFinish + ambush − mDealt| / pooled mDealt ≤ 0.05.
  The residual is ability damage the log does not itemize
  (gpOut.dealt); it is reported per fight as `unparsedDmg`,
  never folded into any weapon's share.
- **GO threshold:** pool floor met AND decomposition
  completeness ≥ 0.95 on all three decompositions AND coverage
  ≥ 0.95 AND reconciliation ≤ 0.05 AND instrument errors 0.
- **Instrument errors:** 0 on all per-seed files.

**Verdict:** DIAG-GO when all five bars pass (the question is
answered: total party damage is decomposed, the kill-line gap
is quantified per fight, the counterfactuals are computed, and
the binding constraint is named). DIAG-NO-GO kind THIN-POOL
when the pool floor misses; DIAG-NO-GO kind ATTRIBUTION when
coverage, reconciliation, or decomposition completeness
misses; DIAG-NO-GO kind INSTRUMENT when errors > 0. A miss is
NO-GO, never re-scored against a friendlier metric mid-run.
The kill-line verdict (which counterfactual, if any, closes
the gap; the named binding constraint) is the FINDING,
reported under the verdict — it does not flip GO to NO-GO
either way, because the diagnostic's job is to measure it,
not to pass it.

**Staging sniff test (pilot gate):** the analyzer must show the
fight population is real on this band (wave-4+ expedition
fights > 0, and the ledger count reconciles with the
game-maintained `spearSeen` counter per seed via the kept
spearlead ledger — a mismatch is reported as a diagnostic,
not silently pooled) before the verdict is read. If the band
carries no fought wave-4 fight at all, the verdict is
DIAG-NO-GO THIN-POOL with the empty pool as the finding.

## §3. Secondary metrics (supporting, not binding)

- Weapon-strike rate: weapon strikes per round per fight
  (pooled + by role); strikes per fighter per fight; rounds
  with zero party strikes.
- Per-strike mean vs the frozen formula (6+wb): observed mean
  per wb tier vs formula — validates the counterfactual
  arithmetic on live data.
- Lead-vs-ally damage split by fight outcome (vKill / vFlee /
  vDie / mFlee); best-party fight on the band (max party dpr)
  vs the kill line.
- Spear share re-reported for continuity (speardmg-a §2 shape)
  — the spear's 5.1% is the baseline this arm's decomposition
  must reproduce within rounding on its own band.
- Wall numbers: national / table / wins, wave-4 and wave-5
  unlocks, median survival, death-cause shares. Table not
  instrumented by this driver — reported as null, never faked.
- Sense-testing: 2–3 full transcripts of wave-4 fights (the
  best-dpr fight and a typical low-dpr fight), read in full —
  does the fight read sensibly (allies answering shouts, a
  flee at low HP, weapons visible in hands)? SENSE-TESTING
  LAW: judge meaning, not counts.

## §4. Horizon, seeds, policies

- **Horizon:** 150d, death-aware (same as speardmg / spearlead
  bands, for comparability). Dead villages stop simulating
  (+10d tail max).
- **Seeds (fresh 8-seed pilot band): 112101, 112102, 112103,
  112104, 112105, 112106, 112107, 112108.** Freshness check
  (skill local_seed_band_freshness, run 2026-11-27 before this
  freeze): word-boundary ripgrep over all `evidence/*/sim-*-prereg.md`
  files names 112101–112108 in NO prereg, and names the
  fallback 112201–112208 in NO prereg. The only 1121/1122
  hits are run-ID substrings (fleshout-20261027T1121Z,
  fleshout-20261030T1122Z) — not seed bands. No dedicated
  forbidden/contaminated band list exists in the goal
  hidden_files (checked; November preregs record the same
  "no such list" state). Neighbouring used bands avoided:
  111801–111808 (speardmg), 110711–110718 (spearlead),
  110601–110608 (spearopen).
- **Policies:** competent verbatim. **Substrate (single leg):**
  `VETREENGAGE=1 + PARTYSIZE4=1 + FLEEREPAIR2=1 + FIGHTALLY2=1`,
  `SENSEEXPED=1`, `SPEARGATE=1`, `BOWOPEN=1` — the speardmg
  pilot's substrate, so numbers compare. No second leg: the
  question is about fights under the fixed gate ground, not
  about the gate itself.
- **Instrument:** `scripts/partydmg-driver-a.js` (verbatim clone
  of `scripts/speardmg-driver-a.js` — RUN=partydmg-a, OUTDIR
  `evidence/2026-11-27/perseed-partydmg-a-arm`; only the
  run-name, file-name, and stack-skip strings change; the
  recorders, the rich rows, and the substrate are identical).
  Analyzer `scripts/analyze-partydmg-a.js` (new; requires
  `parseStrikes` / `fighterMix` / `spearShare` /
  `meleeShare` / `rangedShare` from
  `scripts/analyze-speardmg-a.js` — one definition of the
  parser, the attribution, and the taxonomy). Per-seed JSONs
  under `evidence/2026-11-27/perseed-partydmg-a-arm/`.
  - The driver records the speardmg rich row unchanged
    (`w4dmgFights`); the decomposition, the kill-line gap,
    and the counterfactuals live in the ANALYZER, not the
    driver.
- **§15 panel:** NOT APPLICABLE — single-leg diagnostic, no
  before/after pair to compare. The balanced panel compares two
  legs; there is no second leg here. Said here rather than
  fabricating a compare. The frozen bars (§2) are the judge.
- **PILOT ONLY.** Confirm 12–16 seeds ONLY if the pilot earns
  one; a DIAG arm earns a confirm only if the pool is thin but
  the ledger is decisive — the coordinator decides from the
  pilot verdict.

## §5. Encounter-gear fixture (Steve 2026-11-13)

The verdict turns on what a departing party carries into a
fight, so the fixture is the fight itself, staged by the
competent policy: a geared scholar fighting with a party,
never a fresh un-geared solo scholar. The proof test
(`scripts/test-partydmg-a.js`, GREEN before the pilot) runs
live on a loaded village — a staged wave-4 expedition fight
with a spear lead + machete ally records a rich row, the
analyzer decomposes the fixture fight (channel / role / mix
/ tier all sum to mDealt within the frozen residue, coverage
1.0), the counterfactuals compute on the fixture (A/B/C/D
all finite, D ≥ A on the fixture party), and a bow-lead
fixture fight decomposes its volley to the lead's ranged
channel — plus the speardmg proof chain it extends
(spear volley null + silent; bow volley fires + ammo spent;
dry bow blocked + "no arrows"). The pilot's per-seed corpora
carry the encounter averages beside the verdict in the
evidence file.

## §6. Pre-pilot substrate checklist (§14b)

1. **Contact:** wave-4 meetings occur on the substrate —
   speardmg band: 38 expedition-origin wave-4+ rows per 8
   seeds, 16 fought. The pool floor (≥ 8 fought expedition
   wave-4 fights) is sized to that known density.
2. **Pool sizing:** see (1). The coverage bar (≥ 0.95) is set
   against the speardmg transcripts, where every strike line
   carries the engine's `refName` and the parser patterns are
   read off the live code (§1); a new log-line shape live is a
   coverage miss and the finding. The reconciliation bar
   (≤ 0.05) is set against the known non-strike sources
   (volley, contact finish, ambush — all recorded on the row)
   with only godpath ability damage as the open residual.
   The decomposition bar (≥ 0.95) is set against the same
   arithmetic: channel + role + mix are three views of the
   same parsed strikes, so a miss in any one names a parser
   or attribution gap, not a data gap.
3. **Mechanism pre-check (frozen, not a sim):** the proof test
   (`scripts/test-partydmg-a.js`, GREEN before the pilot)
   proves the measurement chain on live fights (see §5). The
   analyzer `--selftest` covers the decomposition (channel /
   role / mix / tier all sum to mDealt on fixtures), the
   kill-line gap arithmetic (gap, rounds-to-kill, HP left),
   the counterfactuals (A/B/C/D on a fixture party + the
   required-wb solve), and the judge shapes (DIAG-GO,
   THIN-POOL, ATTRIBUTION, INSTRUMENT).

## §7. Canon

`docs/CANON.md` (manifest), `docs/MONSTER-WAVES.md` (wave 4:
The Mirror Draft, standing ≥ 100; damage 35–95, HP 850–1500,
pierce 0.2–0.5; a 4–6 round fight for a godhood build at
~220 dpr; wave 5: standing ≥ 200 AND wave-4 faced), and
`docs/BALANCING.md` (ranged opening volleys: shots = min(ammo,
clamp(1 + floor(range / monster speed), 1, 4)), each shot spends
1 real ammo; empty quiver → narrated "no arrows") read before
the run. **No canon doc covers party damage decomposition or
the wave-4 kill line** — the ~111/round line is a leadworst-a
measurement, not canon; the counterfactual rule in §1 is this
arm's measurement convention, frozen here, not a canon claim.
A weapon is a human weapon (CANON.md human-skills lane),
never an alien ability.

## §8. Metric review (to be written after the pilot — frozen bars judge as written)

- Finding #2601 / tracker blank #1: claimed by this arm for
  its total-party-damage half; on DIAG-GO the damage
  decomposition + the kill-line gap + the counterfactuals are
  quantified, the binding constraint is named, and the next
  arm is named from that proof (a strike-rate / call-in
  diagnostic, or a weapon-quality lever — decided by the
  numbers, not by preference). On DIAG-NO-GO the finding stays
  open with the failing bar + mechanism diagnosis named.
- Write-flap: probe `git update-ref refs/heads/probe HEAD` before
  every material write; if it fails, stop writing and wait for
  the clear.
