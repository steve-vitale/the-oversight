# sim-leadgate-a — PREREG (frozen)

**Arm:** sim-leadgate-a · **Loop A run:** fleshout-20261122T1115Z
**Axis:** scale-onramp · **Finding:** #2667 follow-up (gunlife-a GO:
the lead gate — the volley belongs to the LEAD fighter only, and in
4/8 traces the gun holder carries the gun equipped for 29–65 days
with cells and never leads a wave-4+ fight while holding it)
**Type:** DIAG (descriptive diagnosis — no lever, no contrast leg)
**Base master:** `87b2122f3` (worktree
`~/workspace/worktrees/sim-leadgate-a`, branch `sim-leadgate-a`)
**Frozen:** 2026-11-22 ~06:15 UTC, before any judged run. No judged
run has run.

## 1. The question

sim-gunlife-a traced 8 contest searcaster grants on band
107321–107328: 4/8 traces are `equipped-never-led-wave4+` — the
holder carries the gun equipped for 29–65 days with cells and never
leads a wave-4+ fight while holding it. Holders lead below-wave-4
fights (sigrun 9, chen 2) or no fights (gen_joga8nx 0); the wave-4+
leads go to someone else. The volley belongs to the LEAD fighter
only. The question is one level up from the gun: WHO leads wave-4+
parties, and why is the armed holder never the lead? Party
formation, not the gun.

## 2. Code-read priors (from code on this base — hypotheses, not conclusions)

- Canon: docs/CANON.md read; docs/MONSTER-WAVES.md read (wave-4/5
  gates, readiness bars, the veteran bar); docs/PARTY.md read (the
  SCHOLAR's party — invites, caps, betrayal; it does not cover
  villager plan-lead selection); docs/VILLAGER-BRAIN.md noted (dawn
  scorer; not re-read in full — the launch path is named below from
  code). **No canon doc covers who leads a wave-4+ villager party
  or how a plan holder is picked** — said here rather than inventing
  canon. The rule below is code-derived.
- **There is no lead-selection rule.** The "lead" of a wave-4+ party
  is the win-plan HOLDER by construction — `winPlanDepart(vid)`
  (src/js/win-plan.js:1202) launches vid's own plan; vid is the
  lead; companions are picked around them. A companion never becomes
  the lead. So "who leads" = "who holds a wave-4+ hunt plan and gets
  it launched". The chain has four links, and the gun touches none
  of them:
  1. **Seeding** (`winPlanSeedFromFight`, win-plan.js:856, wave ≥ 3):
     a villager gets a plan ONLY by PERSONALLY facing a wave-3+
     monster — fleeing it (VETREENGAGE-gated vFlee seed, game.js
     fieldFight deed wrap ~:21564), evading/fleeing in
     `expeditionMonster` (villager-agency.js:801, :884). A kill
     advances the plan through `winPlanNoteKill`. Contest wins grant
     guns but seed NO plan. A gun holder with no personal wave-3+
     face has no plan at all.
  2. **Stage gate** (seed + `winPlanDepart` gear branch): the seed
     sets stage `'party'` only if armed AND armored
     (`gearOf`: weaponB > 0 or carries a weapon item; armorP > 0),
     else `'gear'` — and `winPlanDepart` holds in `'gear'` until
     geared. A gun counts toward armed (searcaster is a weapon) but
     never toward armored.
  3. **Launch attempt**: `agencyTick` (villager-agency.js:447) calls
     `winPlanDepart` for each plan holder home at Haven (or
     `vbrainExecuteDepart` when the brain owns dawn); the dawn pass
     (`winPlanCands`, villager-brain.js:217) bids an EXPEDITION
     candidate at w 5.0 when stage is party/hunt/standing/table AND
     `findCompanion` returns someone. Launch requires
     `findCompanion` (win-plan.js:243) to return a launchable
     companion: alive, not away, trust ≥ 15, at Haven, not engaged,
     ranger profile (wanderer/explorer) unless PROFILEGATE4 opens
     (not in this substrate), not on expedition — ranked by the
     shared `companionScore` (companion-score.js: errand +4,
     bold/warm +2, relationship > 40 +1, lonely +1; tie-break by id).
     **Nothing in findCompanion or companionScore mentions the gun,
     ranged weapons, or combat skill.**
  4. **Second/third picks** (`extraCompanionScan`, win-plan.js:659):
     for wave-4-target plans only, tiers are (1) living wave-3+
     killers, (2) currently armed villagers, (3) the rest; within
     each tier the shared companionRank order. A gun holder is at
     best tier 2 (armed) — and only as a COMPANION, never as lead.
     `companionLaunchable` (win-plan.js:728): armed-or-armored, not
     sick, range ≥ 1, HP ≥ 70 or healable. Again no gun term.
- **No numeric combat-skill field exists in the code.** The code's
  own fighter-quality signals are wave kills (`state.waveKillLog`,
  `hasKillWaveAtLeast`), armed/armored (`gearOf`), HP
  (`state.village.health`), veteran status, and range profile
  (`npcRangeProfile`). The instrument records those, plus temper /
  goal / occupation / `npcSkills` list, and says so — it does not
  invent a combat-skill number.
- The volley rule (gunlife-a prereg §2, re-verified on this base by
  reading fieldFights.js in the gunlife arm): the opening volley is
  the LEAD fighter's own ranged kit only. A gun fires only when its
  holder leads a wave-4+ fight with the gun equipped and cells on
  hand.
- HPGATE scope check (coordinator heads-up, 2026-11-22 05:33 CST):
  the range d2aedf6e6..87b2122f3 is exactly one commit (Loop B
  sim-hpgate-b). Its only game-code change is src/js/
  villager-agency.js +43: an HP-gate on pinned-quad DOOR parties,
  env-gated `HPGATE=1` AND `_pinDoor` (PINQUAD). This substrate sets
  neither HPGATE nor PINQUAD, so off-mode is byte-identical — it
  cannot affect lead selection or party formation on this band. It
  also gates at the door-open decision, not at launch or at lead
  selection. Verified by reading the diff (not by assumption).
  Recorded here; the evidence file repeats the verification.

## 3. Rebase before the prereg (coordinator heads-up)

The branch base was `d2aedf6e6`; master moved to `87b2122f3`
(Loop B sim-hpgate-b merge). The branch fast-forward-rebased onto
`87b2122f3` (git rebase, exit 0, no conflicts, no stop-at-pick
quirk — the branch tip d2aedf6e6 was an ancestor of 87b2122f3, so
the rebase was a fast-forward; the gunlife commits are ancestors
of the new tip). Scope verified as above. All judged runs in this
arm run on the rebased tip. Pre-flight re-runs of the reused
instrument's proofs (killlootbundle proof 12/12, analyzer selftest
17/17) on the rebased tip are part of bar 1.

## 4. Band freshness (local_seed_band_freshness skill)

- **Band: 107359–107366 (8 seeds).** Verified before this prereg:
  grepped every prereg under `evidence/*/sim-*-prereg.md` and every
  `evidence/*/sim-*.md` for each standalone token 107359, 107360,
  107361, 107362, 107363, 107364, 107365, 107366 — **0 hits on all
  8** (run in the worktree, `grep -rl "\b<seed>\b"
  evidence/*/sim-*-prereg.md evidence/*/sim-*.md`).
- **No collision; no shift needed.** Nearest used band: 107351–
  107358 (Loop B sim-hpgate-b, this same day) — no overlap.
  Forbidden bands from prior briefs (106751–106766, 107221–107228,
  107191–107198, 107131–107138, 107111–107118, 107091–107098,
  107081–107088, 107051–107058, 107021–107028) do not overlap it
  either.

## 5. Instrument (frozen design)

- `scripts/leadgate-driver-a.js`: a COPY of
  `scripts/killlootbundle-driver-a.js` reused with its wraps intact
  (contest prizes, kill-loot, fieldFight volleys, alienLootGrant,
  corpse takes, daily `v4gunLoc` gun census) PLUS leadgate wraps
  (pure reads + driver-local writes; every game function runs
  exactly once, untouched):
  - `winPlanDepart` + `vbrainExecuteDepart` → `v4departs`: every
    hold/launch with plan (stage/target/needWave/party) and, at
    launch time, per-member attributes for the lead and each
    companion (see §6).
  - `fieldFight` (same wrap as the volley wrap) → `v4fights` for
    wave ≥ 4: lead vid, allyVids, outcome, rounds, volley, and
    per-fighter attributes for lead + each ally.
  - `winPlanSeedFromFight` → `planSeeds`: who seeded a plan, from
    what wave/outcome, stage after seeding.
  - Daily census addition `planCensus`: one row per day for every
    villager who holds ANY plan or holds a gun (equipped or
    carried): plan state + attributes (see §6). The full roster is
    NOT censused daily — the comparison populations are plan
    holders and gun holders, which this covers.
  - **RUN id / OUTDIR (frozen choice):** `RUN=leadgate-a`,
    OUTDIR `perseed-leadgate-a-ctl`. The driver writes under
    `evidence/2026-11-22/<OUTDIR>` (the killlootbundle driver's
    hardcoded 2026-11-21 date dir is corrected in this copy — the
    copy is owned by this arm).
  - **Single leg (diag):** MODE=ctl only. No lever to contrast.
  - **Parallelism:** the 8 seeds run as 2 detached processes (4
    seeds each), same RUN/OUTDIR — per-seed filenames never collide.
- New analyzer `scripts/analyze-leadgate-a.js`: reads the per-seed
  JSONs and emits per-launch / per-fight lead tables, the
  gun-holder-vs-lead comparison, and the verdict;
  `node scripts/analyze-leadgate-a.js --dir <dir> --out <file>`;
  `--selftest` runs the staged checks.
- Proof test `scripts/test-leadgate-a.js`: staged-corpus checks
  (lead attribution, gun-holder-in-party flag, plan-seed capture,
  dead-holder skip) — 100% required before the band.

## 6. Definitions (frozen)

- **Wave-4+ launch:** a `v4departs` row with result `launch` and
  plan.needWave ≥ 4 (or plan.target a wave-4+ species). The LEAD is
  the row's vid (the plan holder). Companions are the row's party.
- **Wave-4+ fight:** a `v4fights` row (fieldFight, mdef.wave ≥ 4).
  The LEAD is the row's vid. Party = [vid] + allyVids.
- **Gun holder:** a living villager with a searcaster equipped
  (`rangedKitOf` rwId === 'searcaster') or carried, per the daily
  `v4gunLoc` census. Scholar-equipped rows count as a gun holder
  (`__scholar__`) but the scholar is not a villager lead — reported
  separately, never counted as a villager lead.
- **Eligible to lead under the code rule:** holds a wave-4+ plan
  (needWave ≥ 4) in stage party / hunt / standing / table. (The
  code has NO other lead-eligibility rule — companions are never
  leads, and no attribute picks the lead. A gun holder is eligible
  iff they hold such a plan.)
- **Lead attributes** (recorded live at launch/fight time, per
  member): hp (state.village.health, default 100), armed, armored,
  armorP, weaponB (gearOf replica), range profile
  (npcRangeProfile), temper (npcTemper), goal (npcGoal), occupation,
  npcSkills list, wave kills (waveKillLog counts at w ≥ 3 and
  w ≥ 4), veteran (hasKillWaveAtLeast 3 / 4), gun equipped /
  carried + cells, plan stage/target/needWave, atHaven / away /
  engaged / onExped at that moment. Dead holders' rows are SKIPPED
  for equipped-gun attribution (ghost rule, finding #2635) and
  flagged dead in the census.
- **Attributed launch/fight:** a row carrying complete lead
  attributes AND complete attributes for every party member (or an
  explicit `attrsError` naming the unreadable member — an error
  row still counts as attributed iff the lead's own attributes are
  complete and the error is named, never silent).
- **Gun holder in party:** a launch/fight row whose party contains
  a gun holder (any seat). **Gun holder as lead:** the lead's own
  gun flags are set.

## 7. Frozen bars (judge: the analyzer on the full band)

| # | Bar | Threshold |
|---|---|---|
| 1 | **Instrument validity** — killlootbundle proof test 12/12 + analyzer `--selftest` 17/17 re-run on the rebased tip; leadgate proof test 100% + analyzer `--selftest` 100% on the rebased tip; 0 instrument errors on all 8 seed files | all must hold |
| 2 | **Coverage** — ≥ 80% of wave-4+ launches AND ≥ 80% of wave-4+ fights carry a lead attribution with dated rows (per §6); every contest searcaster grant on the band appears in the gun census (0 unaccounted grants) | all must hold |
| 3 | **GO** — the diagnosis names the binding lead-selection rule WITH numbers (e.g. leads are plan holders seeded by X; gun holders hold a wave-4+ plan in Y of Z cases because W; the code term that excludes the gun is named) AND names the next lever that follows from it | all must hold for GO |
| 4 | **NO-GO rule** — coverage below 80% on either leg, or the recorder cannot see lead/plan/gun state → NO-GO (never re-scored against a friendlier metric mid-run, §14) | frozen |

**Zero-launch rule (frozen, no re-scoring):** if the band sees
**fewer than 5 wave-4+ launches**, there is nothing to attribute
and the verdict is **INCONCLUSIVE** (not GO, not NO-GO) — the
evidence says so and names the next step (a wider band, or a
substrate check on why launches are absent). A miss is NO-GO,
never re-scored against a friendlier metric mid-run (§14).

GO = all four bars pass. GO means: the diagnosis names why the
gun's holder is never the wave-4+ lead, on the band's launches and
fights, with dated rows to prove it. NO-GO = the recorder is blind
or the launches won't attribute; the evidence says which, and the
next arm fixes the instrument first.

## 8. Run plan (frozen)

- **Pre-flight (NOT judged):** `node scripts/test-killlootbundle-a.js`
  → 12/12; `node scripts/analyze-killlootbundle-a.js --selftest` →
  17/17; `node scripts/test-leadgate-a.js` → 100%;
  `node scripts/analyze-leadgate-a.js --selftest` → 100% — all
  re-run on base `87b2122f3` before any judged run. Green.
- **Band (judged):** 8 seeds, **107359–107366**, horizon 150d
  death-aware, competent verbatim policy
  (`scripts/policies/competent.js`). Single leg, MODE=ctl.
  Substrate: `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1
  SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1`; `LEND`
  unset; `PRESENCE` unset; `KILLBUNDLE` unset; `HPGATE` unset;
  `PINQUAD` unset; `HYPOFLOOR` unset.
- **Per-launch lead table** in the evidence file from the analyzer
  output (per-seed JSONs in
  `evidence/2026-11-22/perseed-leadgate-a-ctl`).
- **Wall numbers** recorded: wins, national, table (not
  instrumented by this driver — recorded as not instrumented,
  never faked), wave 4–5 unlocks, median survival.
- **Sense-test:** read one launch/departure transcript (the
  DEPARTBEAT launch beat + the launch rows): does the party
  walking out read like people making a choice?
- **Canon:** docs/MONSTER-WAVES.md (gates/readiness); docs/PARTY.md
  (scholar's party only); no canon doc covers wave-4+ villager
  party-lead selection — the rule is code-derived (see §2), said
  here rather than inventing canon.

## 9. Metric review (to be filled in the evidence file)

- (filled after the run; no bar re-scored)
