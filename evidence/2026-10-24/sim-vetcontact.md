# sim-vetcontact — VETCONTACT=1 pilot (2026-10-24, flesh-out loop arm sim-vetcontact, axis scale-onramp)

The FORMATION half's havencontact lever. Design brief: evidence/2026-10-24/sim-wallseg.md
("VETCONTACT=1 — the havencontact formation lever", ~line 260-296). Canon read:
docs/CANON.md, docs/MONSTER-WAVES.md (wave law; waveKillLog as the veterans-bar
source in standing.js — the readiness gate this layer feeds).

## Pre-registration (§14 binding — fixed before any sims; the bars below are the judge)

- **Lever:** VETCONTACT=1 — policy-side, zero src/js. When the staging window is
  live (wave-4 unlocked && the wave-5 veterans bar unmet — the same live reads
  vetformation uses) AND a wave-4+ monster sits on the haven tile
  (Game.monsterAt(haven) — the havencontact channel the sim-havencontact DIAG
  named, 80.3% of wave-4+ exposure), stage the kill-formation AT Haven
  immediately: best armed fighter as anchor + best armed non-veterans (a
  veteran's repeat kill forms nothing), up to 3, consent-based invites
  (Game.inviteToParty, VGEAR protocol shape), NEVER dismisses, non-suicidal
  (armed, hp ≥ 40%, trust ≥ 20) — the same gates as vetformation's
  formationBeat, minus the travel-target threat requirement. Fires ONLY when
  vetformation's own travel-target signal is COLD (one delta, no
  double-staging). The landed finishing discipline operates in the resulting TB
  fight unchanged. Env gate VETCONTACT=1 opts in; gate off = pure delegation,
  byte-identical to the wrapped stack (det-gate pinned in the proof).
- **Substrate (pinned BOTH arms; the lever is the ONLY delta):**
  FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1
  ARMORYDRIVE=1 ARMORVILLAGE=1 VETFORMATION=1 TRUSTBUFFER=1 LINKFORM=2.
  control = VC.controlFor(base) = VF.formedFor(base), VETCONTACT unset.
  armed = VC.contactFor(base) = withVetcontact(VF.formedFor(base)), VETCONTACT=1.
- **PRIMARY (binding):** wave-4+ kills per config (state.waveKillLog direct read
  — the source the veterans bar reads), armed vs control, paired identical
  seeds, 8-seed pilot (16 configs: seeds 70501, 70504, 70505, 70802, 70903,
  70905, 70907, 71001 × {leadfeast, belongfeast}), 180d death-aware (dead
  villages stop, +10d tail max). GO iff armed total − control total ≥ +4 kills
  AND armed ≥ control on ≥6/8 seed-pairs (seed-pair = both bases summed).
  A miss is NO-GO, never re-scored.
- **ENGAGEMENT (reported):** contactStages (formations staged for havencontact)
  > 0 on ≥6/8 armed configs; staged wave-4 fights (≥2 formation-committed
  companions engaged) armed > control.
- **GUARDRAILS:** median survival paired diff ≥ −10d; starvation ≤ control+2;
  no new death kinds (≥2-event rule); wall block (national/table/wins, wave4/5,
  median survival) reported for both arms.
- **§15:** before/after through scripts/balance-panel.js — the panel is the
  instrument, the bars above are the judge. The intervention is env-gated, so
  the automated compare is descriptive-by-construction (substrate flags must
  match exactly; the intervention flag is NOT in options.flags); the manual
  paired-row comparison (scripts/analyze-vetcontact.js) is the judging
  instrument. Panel compare: evidence/2026-10-24/vetcontact-panel-primary.md
  (decision=review_required; one regression_watch: npcHungry delta=+0.25 on
  leadfeast — the same starvation signal the guardrail bar already judges,
  6 vs 4, within bar).

## Results — PILOT NO-GO

Per-seed: evidence/2026-10-24/perseed-vetcontact/{control,vetcontact}/
(32 JSONs, anchor 84d390816755). Judge: scripts/analyze-vetcontact.js.

- **PRIMARY: NO-GO.** Wave-4+ kills (waveKillLog direct): control 18, armed 15,
  delta −3 (bar ≥ +4) → FAIL. Seed-pairs armed ≥ control: 7/8 (bar ≥6/8) →
  PASS. Both required; a miss is NO-GO, never re-scored. Pair rows: 13/16
  pairs identical (mostly zeros); the only moving pair is s70505-belong
  (ctrl 3, armed 0).
- **ENGAGEMENT: NO-GO.** contactStages > 0 on 1/16 armed configs (bar ≥6/8
  configs: need ≥12) → FAIL. Only s70903-belong ever committed (1 invite).
  Staged wave-4 fights (union trace): control 40, armed 41 → PASS on the
  letter, but the union is dominated by the vf trace — see root cause.
- **GUARDRAILS: PASS.** Median survival paired diff 0.0d (bar ≥ −10d).
  Starvation 6 vs 4 (bar ≤ control+2). No new death kinds (≥2-event rule).
- **SECONDARY:** distinct wave-4+ killer vids control 13 / armed 10;
  damage-majority villager wave-4 kills control 15 / armed 11.

## Root cause — the lever is confirmed wrong (KILL DISCIPLINE)

The implementation is proven correct (proof 37/37 after fixing 3 test-side
assertion false-positives; mechanism fires on synthetic fixtures; det-gate
byte-identical; armed 180d deterministic). The theory of change is what's
broken:

1. **The "channel gap" doesn't exist as a staging gap.** The DIAG's 80.3%
   measured WHERE wave-4+ fights start (exposure channel), not who is staged
   to fight them. The havencontact fight is fought by the same party
   vetformation stages on travel-target threat days. Field proof: of the 11
   vc-attributed staged fights (≥2 vc-trace companions engaged), 9 also had
   ≥2 vf-trace companions engaged — the contact beat re-affirmed the same
   party vetformation already armed. Net union gain: +1 staged fight
   (41 vs 40), −3 kills. The one delta is not a delta in practice.
2. **The firing opportunity is rare.** 10 contact-days across 16 configs; the
   window is closed most of the time (skipWin 27–179), and when it's live with
   monsters about, vetformation's signal is usually hot too (skipVfHot up to
   81 vs contactDays ≤ 3 per config) — the cold-signal + havencontact +
   at-haven alignment almost never happens.
3. **When it fires, it can't commit.** 1 invite in 10 contact-days — the party
   is already staged or nobody passes the non-suicidal gates.

Trace-level honesty note: ctx.vcFormationVids is affirmed on every contact
day even when invited=0, so the vc fight-trace attribution overstates the
lever's agency; the pre-registered contactStages (commits) bar is the honest
instrument and it reads 1/16.

## Village assessment

Sixteen villages, two fates. The leadfeast villages mostly died mid-ambition
(76–181d, village-lost; combat deaths 30–40) — the familiar scale-wall shape:
wave 4 unlocks, the village bleeds out in wave-4 fights without closing kills
(13/16 configs reached wave 4; wave-4+ kills totaled 18 control / 15 armed
across all 16). The belongfeast villages that survived (s70504-lead 181d,
s70903-belong 182d) reached national + table — s70903-belong hit national=1,
table=1 with 3 wave-4 kills, all by Elif via companion, all in fights where
Elif was VF-staged. Nobody reached wave 5 with a win (wins 0/32 both arms;
wave5 5/16 control, 3/16 armed). The wall stands: national 9/16 both arms,
table 11/16 both arms, wins 0.

## Sense read (SENSE-TESTING LAW)

The lever's real action across 16 armed configs was a single invite
(s70903-belong) — so the story is the absence. In that one config, the three
wave-4 kills (d159 suburb, d175/d176 influencer, all by Elif via companion)
were closed in fights where Elif was staged by vetformation's travel-target
beat; the contact beat's affirmed trace carried only a stale gen_wak4y85.
The lever was a passenger in its own best case. Elsewhere: s70505-belong
day 148 — a wave-4 fight engaged the affirmed pair (sam_wilson,
gen_umm7nz8), killed six villagers including both, and produced no kill;
the paired control's d118/d136/d139 kills came from fighters vetformation
staged. Staging, where it mattered, was vetformation's.

## Wall block

control: national=9/16 table=11/16 wins=0/16 wave4=13/16 wave5=5/16
  medianSurv=143.5d maxSurv=181d
armed:   national=9/16 table=11/16 wins=0/16 wave4=13/16 wave5=3/16
  medianSurv=154.5d maxSurv=182d

## Metric review

- **The primary's second clause (≥6/8 seed-pairs) passed while the first
  (≥+4 kills) failed — and that IS the finding.** 13/16 pairs were
  identical; the lever moved nothing anywhere except s70505-belong
  (3→0). Per §14 the bar is not re-scored: NO-GO stands. The pair-level
  clause is a weak instrument when the base rate is near-zero — a future
  formation lever should pre-register on a substrate/seed band where
  wave-4+ kills actually occur, or use distinct-killer-vids as the primary.
- **The engagement union counter is inflated by trace affirmation without
  invites.** contactStages (commits) is the honest instrument; the fight
  trace should only count fights following an actual commit. Revision for
  the next run: gate the vc fight attribution on vcContactStages > 0 for
  the current trace.
- **Guardrails:** nothing alarming; the npcHungry regression_watch in the
  panel is the same 6-vs-4 starvation signal, within bar.
- **Telemetry deviation check:** `telemetry-check.js` vs
  hidden_files/telemetry-baselines/scale-wall.json fires LOUD "wins
  disappeared: baseline 16 -> current 0" on BOTH arms. Explained, not a bug:
  the baseline's own _regime block forbids comparing pre-seat substrates
  against it ("wins are structurally ~0 there ... interpret the LOUD as a
  regime artifact"). This run is SEATDRIVE=0 pre-seat; the baseline is the
  winseat full-win stack. No baseline roll-forward (different regime).

## Convergence verdict

**killed-at-pilot.** The lever is confirmed wrong per KILL DISCIPLINE: the
implementation is proven correct, the theory of change is broken (the
havencontact channel needs no independent staging — the party is shared
with vetformation's travel-target staging). Killed arms leave no trace:
the policy file is deleted, no game-code was touched, nothing lands.
The measurement record (this file, the 32 per-seed JSONs, the analyzer,
the panel compare .md) is the durable evidence so the loop doesn't
re-try this shape.
