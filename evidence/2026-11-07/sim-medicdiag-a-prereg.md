# sim-medicdiag-a — VILLAGE-SIDE CARE CENSUS (arm sim-medicdiag-a)

Run: oversight-flesh-out-loop, run fleshout-20261108T0015Z (Loop A), axis
food-economy (converging, NOT converged). Worker tree:
~/workspace/worktrees/sim-medicdiag-a, branch sim-medicdiag-a.
Substrate: worktree HEAD ba9859e13 at prereg time (current master as cut;
verified `git -C ~/workspace/the-scattering rev-parse master` ==
ba9859e13 before writing this prereg, so no rebase is owed). Tree clean
at prereg time.

## Canon

READ docs/CANON.md first, then docs/DISEASES.md (two pools, never mix;
cure tiers per disease: folk remedies → occupation medicine → specific
ruin medicine → earned healer deepenings → the Fever's End synergy).
docs/PARTY.md was checked and contains NO healer-role / villager-care
canon — no canon doc covers how many medics a village should have or
what village-side care looks like; that gap is a finding of this diag,
not an invention. The CANON.md law "human skills ≠ alien abilities"
bounds the fix shape: herbal_remedy / field_medicine / triage are the
scholar's System-granted abilities; a villager-side care lever must say
which lane it lives in (occupation skill vs System ability) before it
is built.

## The question (1928Z review's named next blank: a village-side care lever)

The fever anatomy (sim-feveranat-a, DIAG-GO) measured 167 episodes on
8 seeds: treated 75/167, treated deaths 0/75 vs untreated 23/92;
diagnoses 1, cures 0 in the wild; healer present at onset 87 episodes
/ 3 deaths vs absent 80 / 20. The scholar-tending arm (sim-tendsick-a)
proved tending works and costs a third of the village's foraged food
(PILOT NO-GO on starvation). The 1928Z review's named next blank is a
village-side care lever — more medics, not more scholar time. This arm
is DIAG ONLY: it MEASURES whether that lever has anything to push on.
It does NOT build the fix; it names its shape.

## How village-side care works (code-read before sims, not guessed)

- HEALER DEFINITION (one definition, used everywhere): a "healer" is
  the scholar holding triage / field_medicine / herbal_remedy, else a
  living roster villager whose formerOccupation matches
  /nurse|medic|doctor|paramedic|midwife|veterinarian|pharmacist|herbalist|dentist/i
  (`campHealerId(place)`, game.js). Physical presence matters:
  `campPeopleIds(place)` — away residents cannot lend remote hands; a
  field camp holds only its travelling party. No skill level enters the
  definition; no `herbal_remedy` / `field_medicine` holding by a
  villager gates anything except triage reach (below).
- TENDING (`villagerCareTick`, game.js, called from
  `villageSicknessTick` once per day): each available medic tends ONE
  sick villager per day (TWO if that medic holds the triage ability,
  via `npcHasAbility(mid, 'triage')`); the tended record's
  `daysLeft -= 1`. A severity-2+ sick medic stays down (patient, not
  tender); a severity-1 medic pushes through. Tending NEVER deletes a
  `v.sick` record and NEVER cures — it only shortens the spell.
- SICKNESS DAMAGE (`villageSicknessTick`, game.js): `1 + severity*2`
  HP/day, −1 if a healer is present in the patient's camp
  (`healerFor(vid)` via `campHealerId('haven'|'here')`). Recovery when
  `daysLeft <= 0`; death through `hurtVillager` with cause 'sickness'
  (or the disease id when the village knows it).
- WOUND CARE (`healerRounds`, game.js): the camp healer patches the
  single worst wound (+15 HP, worst HP < 70) once per day. Wounds,
  NOT sickness — out of scope for the cure verdict, recorded here so
  the next run does not count it as fever treatment.
- DIAGNOSIS IN THE WILD: `villagerDiagnosisTick` names only the
  SCHOLAR's sickness (40%/day at haven); `examineSick` on a villager
  is a scholar action that sets `rec.diagnosed`. No villager-side code
  ever sets a villager record's `diagnosed` field. The 1 diagnosis in
  167 episodes was the scholar examining someone.
- THE SCHOLAR'S CURE LADDER (exists, scholar-only): per-disease cure
  table in src/data/statusEffects.json — Fever `disease`:
  herbal_remedy=cure, field_medicine=ease, triage=ease,
  antibiotics=ease, needsDiagnosis=false; wound_fever:
  herbal/field/triage/antibiotics all cure, needsDiagnosis=false;
  gutrot: herbal=cure, antiparasitic=cure, field/triage=ease,
  needsDiagnosis=false; lockjaw: field/triage/antibiotics cure,
  needsDiagnosis=true; trichinosis: antiparasitic cure,
  needsDiagnosis=true; trembles: NO cure at any tier. `treatDisease`
  (scholar self) and `treatVillager` (scholar on a villager, L2+,
  150 kcal, 32 ticks; `delete v.sick[vid]` on a 'cure' result) are
  the only callers of that table for villagers. `cureStatus` operates
  on the scholar status-engine list only, never on `v.sick`.
- CALLERS OF treatVillager / tendVillager (grep-verified before sims):
  ONLY the competent policy's `keepPromiseHeal`
  (scripts/policies/competent.js, scholar keeping a heal promise) and
  the app.js UI buttons (`vtend:` / `vtreat:` — the player tapping).
  NO villager/NPC caller exists anywhere in src/js.
- `delete v.sick[vid]` SITES (grep-verified before sims): treatVillager
  (scholar cure, game.js); villageSicknessTick (recovery / death /
  stale cleanup, game.js); betrayal (villager leaves, betrayal.js);
  `resolveAidInbound` medicine delivery (safetynets.js) — a FOREIGN
  village's aid cures the single sickest villager, gated on links +
  trust + a request. That is the ONLY non-scholar cure of a villager's
  sickness in code, and it is external, not village-side.
- NPC ABILITY HOLDINGS: villagers CAN hold triage / herbal_remedy /
  field_medicine — as SKILLS via the craft track (src/data/tracks.json
  craft: triage, steady_hands, preservation_instinct, herbal_remedy,
  camp_cook) learned through level-ups / teaching
  (`npcGrantAbility` → skill lane → `npcLearnSkill`; `npcHasAbility`
  reads `npcAbilities` or `npcKnowsSkill`). Whether any medic
  actually holds one on this band is MEASURED by the live leg
  (medicDetail snapshot), not assumed.

## SEED-BAND NOTE (deliberate reuse, not fresh)

Seeds 96301–96308 are REUSED deliberately: they are the feveranat /
tendsick band, and this census must be directly comparable episode by
episode (same villages, same trajectories). The band was verified
FRESH for feveranat across every dated sim-*-prereg.md, the
convergence tracker, and sim-findings.md; this run adds no new seeds
and claims no freshness — it re-reads the same corpus with an extended
recorder. The re-run is a reproduction check, not a new sample.

## PRE-REGISTRATION (binding per MEASUREMENT.md §14 — a miss is NO-GO, never re-scored)

- Substrate: branch sim-medicdiag-a @ ba9859e13. Policy: competent
  ONLY (scripts/policies/competent.js, UNMODIFIED). Env (explicit, =
  shipped defaults): PLENTYDEPRI=1, DEPOSITGATE=1. Horizon: 150d
  death-aware cap (dead villages stop; runDays endReason recorded per
  seed; no fixed-200d run). Seeds: 96301–96308 (8 seeds — the census
  reads the EXISTING feveranat-a-corpus for the full band; the extended
  recorder re-runs the same 8 seeds to prove reproduction and to add
  the medicDetail snapshot).
- Instruments (all NEW; the feveranat instruments are reused, not
  duplicated):
  scripts/analyze-medicdiag-a.js (census over
  evidence/2026-11-07/feveranat-a-corpus/ + medicdiag-a-corpus),
  scripts/sweep-medicdiag-a.js (feveranat recorder + ONE declared
  delta: a per-day `medicDetail` snapshot — each roster medic's vid,
  occupation, Haven-vs-field place, and npcHasAbility holdings for
  triage / herbal_remedy / field_medicine; pure reads, no RNG, no
  Game-state writes; all other wrappers, snapshots, and the bare mode
  identical to sweep-feveranat-a.js, renamed MEDICDIAG_*),
  scripts/test-medicdiag-a.js (proof: healer-definition unit legs,
  cure-channel code-read legs, coverage-accounting unit legs, live leg
  re-running the extended recorder on 2 seeds showing the census
  reproduces feveranat's counts).
- G3 FINAL-DAY RULE (pre-registered policy, from the tendsick metric
  review): excuse the final day's missing snapshot/flow when the run
  ends mid-day — endReason village-lost / game over — not only when a
  death is recorded that day. The corpus is judged under this rule.
- Census questions (each gets a pooled number; the census is COMPLETE
  when all four are answered):
  - C1 HEALER CAPACITY: what counts as a healer (definition above,
    verified against the live leg); healer-days per village (days with
    campHealerId('haven') non-null) and medic-days (sum of medicCount
    over days); NPC sick-days with a healer present at Haven vs absent
    (daySeries join: sickCountNPC × healerPresent); tends delivered
    (villagerCare events) vs theoretical capacity (medic-days × 1,
    triage doubling where the live leg shows it); tends per medic-day.
    NOTE the instrument asymmetry, stated in advance: medicCount is
    roster-wide (all medics alive and not sev-2 sick) while
    healerPresent is Haven-physical — the live leg's medicDetail
    (Haven medic count) closes the gap.
  - C2 CURE-CHANNEL EXISTENCE: read `villagerCareTick` and the cure
    ladder in code; verdict EXISTS-AND-GATED (gate named) or ABSENT,
    with code citations (file + function; line numbers drift so cite
    function names). Corpus corroboration: cureEvents, diagnoses,
    treatVillager/tendVillager calls in the wild.
  - C3 MODELED VALUE: healer-present episode mortality (NPC episodes
    only; deaths = outcomes starting 'died') applied to
    healer-absent episodes — deaths-avoided = absentDeaths −
    absentCount × presentRate. Assumptions stated plainly with the
    number: (1) association, not causation — healer presence
    correlates with other survival factors (wound patching, village
    wealth); (2) the effect is assumed to transfer fully to absent
    episodes; (3) no capacity limit in the model — the census
    separately measures capacity, which is the constraint; (4) NPC
    episodes only (the scholar runs the full status engine, a
    different mechanism). Also: sick-days covered per healer-day.
  - C4 FIX SHAPE: name the concrete shape a more-medics lever would
    take (e.g. healer duty assignment, training path, cure-channel
    wiring) with its own prereg pointer — the shape is the deliverable,
    the build belongs to a later run. Flag steve-call if it proposes
    a new cure mechanic.
- Gates (judged ONLY against this header):
  - G1 coverage: 100% of fever episodes carry a healer-present/absent
    classification at onset (healerPresent non-null); zero
    UNCLASSIFIED. (Treatment + outcome classification is inherited
    from feveranat's G4, already DIAG-GO on this corpus.)
  - G2 cure-channel verdict: rendered EXISTS-AND-GATED (gate named)
    or ABSENT, with code citations (file + function).
  - G3 modeled value: deaths-avoided computed under the stated
    assumptions above (C3), with the rates shown.
  - G4 fix shape: named, with its gating question flagged steve-call
    if it proposes a new cure mechanic.
- GO: all four gates pass. A miss is DIAG-NO-GO, never re-scored
  mid-run; if a metric proves wrong, write it under "metric review"
  and propose the revision for the NEXT run.
- DIAG ONLY — zero src/js, no lever, no default flip. If a fix shape
  is found worth landing, it is documented as the NAMED next arm; it
  is not landed here.
- Reachability check (reported, not gated): national / table / wins,
  wave reach 1–5, median survival — expected 0/0/0 on competent-only
  150d per the sibling runs; any non-zero is reported as a deviation,
  not a win.
- Telemetry deviation check (loop-body step 10): after writing
  evidence, run `node scripts/telemetry-check.js --baseline
  ~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/scale-wall.json
  --current 'evidence/2026-11-07/medicdiag-a-corpus/medicdiag-a-competent-s*.json'
  --metrics national,table,wins,exiled`. Any LOUD line is a same-run
  investigation item — dig into the deviation (explained vs real bug)
  BEFORE rolling the baseline forward. Report LOUD lines with verdict.
  (Expectation: competent-only 150d shows national/table/wins 0 — the
  awayconfirm/prodcollapse runs hit the identical LOUD lines as a
  regime artifact; do NOT roll the baseline on a regime artifact.)

## Results

(to be filled after the sweeps — verdict judged ONLY against this header)

## AMENDMENT A1 (written BEFORE any judged live-leg run, 2026-11-08 ~02:00Z)

SUBSTRATE MOVE. The prereg's substrate line says ba9859e13, but the
feveranat corpus this census reads was recorded on base 018295600
(2026-11-07 1928Z). Between the two bases, master moved — journey /
alien-expansion / succession landings. Verified on this base: the
feveranat recorder itself, run on ba9859e13, gives seed 96301
daysAlive=104 (endReason village-lost, 15 onsets), NOT the corpus's
127d — and the medicdiag recorder gives the identical 104d. The
divergence is the base move, not the recorder: same base + same seed
+ same policy → same trajectory under both recorders.

CONSEQUENCE (design correction, not a re-score): corpus-vs-corpus
reproduction (medicdiag fingerprints == feveranat bare fingerprints)
is unachievable on this base and is NOT the reproduction proof. The
proof is RECORDER-VS-RECORDER ON THE SHARED CURRENT BASE: for each of
the 8 seeds, the medicdiag oneRun and the feveranat oneRun, both run
in-process on ba9859e13, must give identical fingerprints AND identical
healerPresent / medicCount / sickCountNPC series. That proves the
extended recorder is neutral and its medicDetail joins the feveranat
corpus day-by-day on the current substrate.

UNCHANGED: the census gates G1–G3 are still judged on the feveranat
corpus as preregistered (base 018295600, 167 episodes). The medicDetail
live leg characterizes healer capacity (source split, holdings) on the
current base and is reported as such in the evidence file; where the
two bases' numbers differ, both are shown and the difference is named
a substrate difference, not a census revision.

## Metric review (post-run)

(to be filled after the sweeps)

## Sense (SENSE-TESTING LAW)

(to be filled after the sweeps — transcripts read on at least two fever
episodes: one healer-present, one healer-absent; quote what the village
actually does when someone falls sick and no healer is there)

## Village assessment in plain words

(to be filled after the sweeps)

## Blanks filled or documented

(to be filled after the sweeps)

## Findings for the backlog (coordinator appends — this worker does NOT edit sim-findings.md)

(to be filled after the sweeps)
