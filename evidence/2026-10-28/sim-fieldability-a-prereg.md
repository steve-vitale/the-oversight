# sim-fieldability-a — PREREGISTRATION (binding, committed BEFORE any judged sweep)

Run: fleshout loop, run fleshout-20261028T2115Z. Axis: scale-onramp
(blocking axis, converging, NOT converged). Worker: sim-fieldability-a.
Task: the scale-onramp DAMAGE lever for wave-4 field parties.

## Audit verdict that shapes this prereg (audit phase, no judged sweep yet)

The audit (scripts/test-fieldability-a-audit.js, base code, 2-fighter
shout-join shape, 5 rng seeds per cell, scholar day 120, fed
villagers so the 1.25x topped-up power mult is already IN every
number below) finds NO single narrow wiring of an EXISTING system
that plausibly moves a wild field party's SUSTAINED DPR to the
retreatdiag band of 57-80/round for fresh-beast kills inside the
15-round cap. Fixture DPR over 3-round fights FLATTERS one-shot
sources (volley, aim) — the kill math must use sustained DPR
(strike mean x 1.25 + ally 4.5/round), because a fight that is
going to kill must last 12-15 rounds, not 3:

- Strike mean = 6 + wb, wb = round((melee + ranged)/2) from
  EQUIPPED gear; godpath fieldStrike multiplies by the fed
  power 1.25 (verified: godslayer fixture 61.7/round vs
  49 x 1.25 = 61.25 predicted; worldbreaker 82.7 vs 82.5).
- Sustained party DPR by weapon (fed, ally 4.5/round):
  stick 15.75, fire spear 22, hunting spear 30.75, machete
  34.5, machete+bow dual 48.25 (+32 volley ONE-SHOT, not
  per-round), hardlight 40.75, godslayer 65.75, worldbreaker
  87.0. Kill rounds at sustained DPR: 850-HP beast needs
  57/round, 1100-HP needs 73/round (cap 15).
- Spear occupies the RANGED slot (autoEquip: wkind spear ->
  ranged), so hunting-spear+bow is NOT a real dual config —
  the bow is dropped (fixture: identical DPR to spear alone,
  volley null). Machete (melee) + bow is the real dual.
- Full damage-ability stack (patient_aim, haymaker, stalk,
  blood_trail, dead_aim, trade_of_blows) on hunting spear:
  ~40 sustained (haymaker x2 every 3rd round = 1.33x
  sustained; aim/stalk/trade are one-shots). On machete+bow
  it reaches ~63 sustained — but that is a godhood-tier
  holder (6 damage abilities + dual kit), not the wild
  party population, and stacking it is not a narrow wiring.
- Tricks are NOT damage: eater poison = mFlee at 0 DPR
  (a drive-off win, but it fails the coordinator's kill+DPR
  frame and needs spoiled food in the pack + trick known);
  influencer focus_followers HALVES party DPR (15.2 vs 28
  baseline) while shrinking the monster's buff — a
  survival lever, not damage; audit inefficient extends
  fights (to 6 rounds) at DPR 18.9; reunion novelty DPR
  21.2. A second ally joins never (one ally per fight in
  code) and would add at most ~4.5/round anyway.
- Plausible wild best (machete+bow, both earnable, arrows
  pocketed): sustained ~48 + 32 volley one-shot -> an
  850-HP beast still needs ~17 rounds to kill, an 1100-HP
  beast ~22 — both over cap, before the survival question
  (party must also live 15 rounds at 39-65 incoming/round
  vs ~100 HP). Alien-tier weapons (godslayer, worldbreaker)
  reach the band but are tier-4 apex loot villagers do not
  hold at wave-4 time; wiring villagers toward them is a
  loot-economy change, not a narrow existing-system wiring,
  and gear-changing is a least-frequent lever (Steve).

Per the task's audit rule ("if the audit shows no single
existing system can plausibly move party DPR toward 57-80,
do NOT force a build: convert to a DIAG arm"), this arm
CONVERTS TO DIAG. No game code will be changed, no armed
band will be judged, no build pilot will be run. The
coordinator's kill+DPR GO frame is therefore NOT applied
to a build (there is none to judge); the DIAG-GO bars
below replace it, and this conversion itself is the
fast kill of the build arm.

## Preregistered DIAG bars (judged against these, no re-scoring)

- CONTROL-GATE: the known band (seeds 75101-75108,
  tableseat-nowait verbatim, LEANLINKRESCUE=1,
  TABLESEATNOWAIT=1, 180d death-aware, competent policy,
  fieldparty-form-diag recorder, retreatdiag sweep script
  verbatim) reproduces the 1528Z/1942Z control shape:
  judgedA 24, formed 0, field kills 0 (retreatdiag fresh:
  meetings 1272, judgedA 24, judgedB 18). Small meeting-
  count drift from sibling master landings is reported,
  not hidden; formed/kills must still be 0 or the gate
  FAILS and the wall numbers are not trusted.
- CEILING-COMPLETE: a per-source ceiling table (weapon
  ladder, dual config, ability stack, volley, tricks,
  second ally, fed power) with sustained-DPR numbers and
  kill-rounds for 850/1100-HP beasts, each cell either
  fixture-measured or code-derived with the formula shown.
- SENSE: >= 2 fight transcripts read and quoted (new
  sense fixtures: a machete+bow party vs audit; a
  trick-known influencer party), judged coherent or not
  on their own beats.
- RANKED-NEXT: one ranked next step named with numbers
  (the step after damage, given damage alone cannot be
  wired narrowly from existing systems).
- DIAG-GO: control gate reproduced AND ceiling table
  complete AND >= 2 transcripts quoted AND ranked next
  step named. Any leg failing -> DIAG-NO-GO with the
  failing leg named.

## What this arm will NOT do

- No game-code change, no policy change, no armed band.
- No claim of wall movement (the control band is a base-
  code reproduction; its wall numbers are reported, not
  claimed as movement).
- No re-scoring: if the control gate fails, the verdict
  is DIAG-NO-GO, not a looser gate.
- Out-of-scope findings are APPENDED to the findings
  backlog only, never chased mid-run.

## Guards (reported, not judged as a build)

- Wall numbers every run: national ever/final, table
  invited/entered, wins (lesser/full), wave 4-5 reach,
  median survival, death-cause shares, starvation count.
- Metric review section in the evidence file (standing
  §14 rule); balanced-panel §15 substitute as in prior
  rounds (identical-seed corpora; panel has no
  census-ingest mode — no panel artifact faked).

## Seeds / policies / horizon

- Control band: seeds 75101-75108, tableseat-nowait
  verbatim, 180d death-aware (dead villages stop +10d
  tail max per the harness), competent policy.
- Fixtures: seeds 75106 base, rng seeds 9000-series
  (audit) / sense seeds; scholar day 120; fresh beasts
  at minimum HP roll (audit 1100, influencer 850).
