# sim-ragepreempt-b — evidence (finding #2584)

**Arm:** sim-ragepreempt-b · **Loop B run:** fleshout-loop-b-20261119T0530Z
**Axis:** winnability chain · **Finding:** #2584 (free-action Rage
pre-empted by a higher-priority turn verb; the round file calls the
same case #2572)
**Prereg:** `evidence/2026-11-19/sim-ragepreempt-b-prereg.md` (frozen
2026-11-19 ~23:50 CST, before any judging; Correction 1 ~00:10 CST
— see below).
**Branch:** `sim-ragepreempt-b` (base master `cd2d685b8`).
**Verdict: DIAG-GO — the question is answered from the frozen corpora; no fresh sims were needed.**

## The answer

**A turn verb pre-empts the free-action Rage round in 4 of 10
observable carrier fires — rate 0.40 raw, 0.30 harmful.** The
frozen interpretation rule (harmful rate ≥ 0.25) fires: **the
rage-setup-a paired damage rate (2/2) does NOT generalise** — the
free strike is lost often enough to change the expected value of
RAGEFREE. **Named next step: order the free strike ahead of the
verbs** (the Rage round strikes before the verb chain is
consulted). This arm builds no game code; the ordering fix is the
next arm's work, not this arm's change.

| Cut | Denominator | Pre-empted | Harmful | Rate | Harmful rate |
|---|---|---|---|---|---|
| Primary: all arm-leg carrier fires | 10 observable of 11 | 4 | 3 | **0.40** | **0.30** |
| Judged-population cut (rage-setup-a pair-inclusive engaged) | 7 observable of 8 | 3 | 2 | 0.43 | 0.29 |

Per-verb classification (primary cut, 0 unclassified, 0 anomalies):

| Verb | n | Harmful? | What it cost |
|---|---|---|---|
| peacemaker_failed (Walk In — failed) | 2 | yes | the free strike + exposure (+25% incoming next blow) |
| field_medicine (binds the wound) | 1 | yes | the free strike (heals +20 HP instead) |
| peacemaker_success (Walk In) | 1 | no | no strike — but the fight ends peacefully, so nothing was needed |

## The numbers behind the verdict

**Corpora (frozen, read-only):** `evidence/2026-11-18/
perseed-rage-setup-a-{ctl,arm}/`, band 106001–106008, 150d,
competent. Arm leg 11 carrier-fired rows, 10 with an observable
Rage round (Ruby d139 unobservable — log cap, see below); ctl leg
21 carrier-fired rows, 20 observable. Analysis:
`evidence/2026-11-19/ragepreempt-b-analysis.json`. Instrument:
`scripts/analyze-ragepreempt-b.js` (`--selftest` 20/20) +
`scripts/test-ragepreempt-b.js` (**15/15** — selftest shapes plus
the frozen test cases on the real corpus rows).

**All 11 arm-leg carrier fires:**

| Seed | Day | Fighter | Monster | Rage round | Classification | Rounds | Outcome |
|---|---|---|---|---|---|---|---|
| 106001 | 120 | Vladimir | Audit | R1 | free strike landed (32, ×2.0) | 3 | vFlee |
| 106001 | 120 | Vladimir | Audit | R1 | free strike landed (36, ×2.0) | 1 | vFlee |
| 106001 | 132 | Kavira | Eater | R1 | **pre-empted: field_medicine** | 4 | vFlee |
| 106004 | 95 | Sergio | Influencer | R1 | free strike landed (50, ×2.0) | 4 | vFlee |
| 106004 | 96 | Rafael | Audit | R1 | free strike landed (24, ×2.0) | 1 | vFlee |
| 106004 | 98 | Xavier | Strike | R1 | **pre-empted: peacemaker_failed** | 1 | vFlee |
| 106004 | 114 | Xavier | Eater | R1 | **pre-empted: peacemaker_success** | 1 | vFlee |
| 106005 | 139 | Ruby | Algorithm | — | **unobservable (log cap)** | 6 | vFlee |
| 106006 | 53 | Heinrich | Reunion | R1 | **pre-empted: peacemaker_failed** | 2 | vDie |
| 106008 | 47 | Scott | Algorithm | R1 | free strike landed (73, ×2.5) | 7 | vFlee |
| 106008 | 55 | Somchai | Eulogy | R1 | free strike landed (80, ×2.0) | 4 | vFlee |

**Control leg (negative control, passes):** 20/20 observable ctl
carrier Rage rounds show the consumed signature (Rage line, then
only the monster phase — no strike, no verb), 0 pre-empted, 0
unclassified, 0 anomalies. The classifier distinguishes a consumed
turn from a pre-empted one; the ctl leg proves it.

**Why the 2/2 does not generalise — and why it was thin to begin
with:** the two paired fired meetings behind rage-setup-a's 2/2
are Sergio d95 (clean — free strike 50 landed) and Ruby d139
(unobservable — her Rage round sits in the cut tail, so the pair
cannot even be checked for pre-emption). The paired result rests
on one checkable pair. On the full arm pool, the free strike lands
6 times in 10 and is lost 4 times in 10 — and 3 of those 4 losses
are harmful (the fighter spends the Rage round on something else
while the fight continues). A lever whose flagship benefit fails
3 times in 10 cannot be judged on 2 pairs.

## Sense-testing (pre-empted fight transcripts read in full)

- **Heinrich d53 (arm, Reunion, vDie in 2 rounds) — VERIFIED
  from the corpus, the finding's own row.** R1: "Heinrich's eyes
  go red. Next 3 strikes hit twice as hard. (Rage)" then
  "Heinrich walks in open-handed — and it goes wrong. It doesn't
  want peace. They're exposed, off-balance. (Walk In — failed)".
  R2 he strikes once doubled (35) while exposed, then dies. The
  failed Walk In did not just cost the free strike: it left him
  exposed for the blow that killed him. The peacemaker verb is the
  only verb in the chain that can both eat the round AND make the
  next hit worse.
- **Kavira d132 (arm, Eater, vFlee in 4 rounds) — VERIFIED.**
  R1: Rage fires, then "Kavira stops mid-fight and binds the
  wound — field medicine, +20 HP" instead of the strike. R2/R3/R4
  strikes land doubled (18/20/24, ×2.0) — the Rage multiplier
  survived; only the R1 free strike was lost. The party still
  flees with the monster at 865/950 HP. A heal that costs the
  flagship strike is a defensible trade at low HP (Kavira was at
  36 HP) but it is still a lost doubled strike, and the fight was
  lost anyway.
- **Xavier d98 (arm, Strike, vFlee in 1 round, 0 dealt) —
  VERIFIED.** R1: Rage, then the failed Walk In, then "still
  off-balance from the failed parley, Xavier takes it worse",
  a 26-damage hit (14 HP left), a Scream Cheese stun, and flight.
  The whole fight is one round: rage, failed talk, one exposed
  hit, run. Zero damage dealt. This is the pre-emption at its
  worst — the Rage round produced nothing but exposure.
- **Xavier d114 (arm, Eater, vFlee in 1 round, 0 dealt) —
  VERIFIED, the benign case.** The monster acts FIRST (Gorge hits
  for 15, Xavier at 3 HP) — then R1 Rage, then the Walk In
  SUCCEEDS: "it listens. It stands down. (Peacemaker: Walk In)".
  Xavier flees anyway, alive at 3 HP. The free strike never
  happened, but no strike was needed: the verb ended a fight he
  would likely have died in. This is the one pre-emption that is
  not a loss — and it is also the carrier firing on a nearly-dead
  holder (the #2568 shape: the gate is the monster's HP, never
  the holder's).
- **Sergio d95 (arm, Influencer, vFlee in 4 rounds) — VERIFIED,
  the clean case.** R1: Rage, then immediately "Sergio strikes
  for 50 (×2.0)". The free action working exactly as designed.
  Scott d47 likewise (73, ×2.5). When no verb fires, the
  mechanism is exactly what rage-setup-a measured.
- **Ruby d139 (arm + ctl, Algorithm, vFlee in 6 rounds) — the
  unobservable row.** Both legs' logs are byte-identical for the
  first 20 lines (R1–R3 flat 14 strikes, R4 field medicine, R5
  monster hit) and then cut: the persisted log is capped at 20
  lines. The engine flag says the carrier fired on both legs, so
  the Rage round is R5/R6, in the cut tail. The arm dealt 238 vs
  ctl 216 (+22) — consistent with one doubled strike in the tail,
  but the round itself cannot be classified from the corpus. See
  "Open observation" below.

**Reading:** pre-emption is not a corner case. Two of the four
losses are the peacemaker's failed Walk In — the only verb that
both eats the round and punishes the fighter for it — and the
third harmful loss is field medicine, which fires exactly when
the fighter is hurt, i.e. exactly when the doubled strike matters
most. The verbs that pre-empt are not random: they are the
verbs a hurt or talkative fighter reaches for first. Ordering the
free strike ahead of the verbs removes the interaction at its
root; accepting the rate means accepting that the flagship benefit
fails a third of the time, worst when the fighter is weakest.

## Wall numbers (recomputed from the corpora, both legs)

| | Rage-setup ctl | Rage-setup arm |
|---|---|---|
| Seeds | 8 (106001–106008) | 8 |
| National | 0/8 | 0/8 |
| Table | null (not instrumented) | null |
| Wins | 0/8 | 0/8 |
| Wave-4 unlock | 8/8 | 8/8 |
| Wave-5 unlock | 6/8 | 5/8 |
| Median survival | 150d | 148.5d |
| Community loss | 3/8 | 4/8 |

No full seat, no national, no wins on either leg. The winnability
wall stands: the launch decision and the flee are the binding
constraints; the Rage setup turn is a tax on the damage that
might break the flee, not the wall itself.

## Open observation (not a verdict item)

**Ruby d139: why did the carrier fire late?** On both legs the
Rage branch's conditions all read true from R1 (carrier armed,
monster at ~99% HP, 60-kcal pay affordable — hunger 25 against a
gate of 80, no pay-block recorded), yet the engine flag says the
fire happened on R5/R6, past the 20-line log cap. No earlier
turn-action branch fired on R1–R4 (no mending/cheese/retribution
lines), and no trick displaced fieldAct (strikes happened). The
mechanism of the delay is not established from the corpus. A
future arm with an uncapped recorder (or a staged reproduction of
Ruby's fight) should pin it — if the carrier can fire late, the
pre-emption question has a second dimension (late Rage rounds
have a different verb mix: field medicine is likelier as HP
falls). Filed as a follow-up in the findings backlog, not as a
claim about this arm's rate: the rate stands on the 10 observable
rows.

## Metric review

- The frozen bars judged correctly: pool floor met (10 ≥ 8),
  classification complete (0 unclassified, 0 anomalies, 0
  consumed-on-arm), ctl control passes (20/20 consumed, 0
  pre-empted), instrument errors 0 — **DIAG-GO**.
- **Correction 1 (prereg, before the judged run completed):** the
  shakedown run exposed two instrument-model errors — the ctl Rage
  round is a `consumed` signature, not "unclassified", and Ruby
  d139 is unobservable (log cap), not "not pre-empted". Both are
  label/test-case corrections; the frozen metric (pre-emption
  rate), pool floor (≥ 8), and interpretation rule (harmful ≥
  0.25) are unchanged, and the arm-leg classifications are
  identical before and after (4/10, harmful 3/10).
- The 20-line encounter-log cap is the binding instrument limit
  here: 1 of 11 arm rows (and its ctl pair) is unclassifiable
  because the Rage round fell past the cap. The floor (≥ 8 of 11)
  absorbed it; a corpus with a later-firing carrier would not
  survive the same cap. A future recorder should persist the Rage
  round (or the full log) for carrier-fired fights.
- Real-Rage holders could not be cut from these corpora
  (`rageFired` is not persisted on the encounter row — 0 rows
  carry it), so the rate is carrier-only by construction. The
  RAGEFREE change applies branch-wide, so holder pre-emptions are
  the same mechanism and presumably the same rate — but that is an
  inference, not a measurement. A `rageFired`-persisting recorder
  is the precondition for measuring it.
- Telemetry deviation check: `scripts/telemetry-check.js`
  REFUSES recorder corpora by design (exit 2, "refusing
  recorder-corpus input: all 8 --current rows carry top-level
  anchorCommit") — no LOUD lines, no baseline roll (same as the
  round-0115 closeout).
- No game-code change was made or is proposed by this arm; no
  `check.js --quick` gate was run (nothing in `src/` changed —
  the deliverable is the analyzer, its proof test, and evidence).
  Analyzer `--selftest` 20/20 and proof test 15/15 are the
  instrument proof.

## What lands / what is held

- **HELD, do not merge:** the `RAGEFREE` change (branch
  `sim-rage-setup-a`), the sense substrate cherry-pick, the
  carrier cherry-pick — all stay on their branches, as before.
  This arm adds no game code.
- **Lands (evidence + instrument only):** prereg (with Correction
  1), this file, analysis JSON, `scripts/analyze-ragepreempt-b.js`,
  `scripts/test-ragepreempt-b.js` (see the round evidence file).
- **Named next step:** order the free strike ahead of the verbs
  (the Rage round strikes before the verb chain is consulted).
  That is a build arm, not this DIAG arm. The ordering fix should
  be measured against this rate (4/10 pre-empted, 3/10 harmful)
  on identical seeds before any kill-share claim is made for it.
