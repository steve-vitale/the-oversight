# sim-fightallycap-confirm-b — PREREG (frozen)

**Arm:** sim-fightallycap-confirm-b · **Loop B run:** fleshout-loop-b-20261117T2030Z
**Axis:** winnability chain (wild ally-join → wave-4 kills → veterans → readiness-5 release → wave-5 facing → full seat)
**Type:** CONFIRM (measurement-only — NO src change, NO default flip). The
FIGHTALLY2 lever (second ally slot in the fight engine) landed on master
`db8a289bf` (pilot GO, run 1830Z). This run asks whether the pilot effect
generalizes to seeds the pilot never saw.
**Frozen:** 2026-11-17, BEFORE any confirm sims. No bar re-scored mid-run; a
missed bar is NO-GO, never re-scored against a friendlier metric. Metric
review lives in the evidence file, not here.

## Pilot result being confirmed

Pilot (band 103601–103608, 8 seeds, 150d, competent verbatim): B1 1.625 PASS
(n=8; 5 meetings with 2 joining allies) vs control exactly 1.0 (n=18);
B2 UNJUDGEABLE (n=1 launched fought meeting with a captured share on the
armed leg); B3 PASS (total deaths 665 vs 744; expedition 191 vs 237);
B4 22/22; B5 PASS with investigation (community-loss watch 1/8 → 3/8,
investigated, no lever mechanism found); wall: wave-5 unlocks 5/8 vs 2/8,
national standing 5/8 vs 2/8, no table, no wins. Evidence:
`evidence/2026-11-17/sim-fightallycap-b.md`, prereg
`evidence/2026-11-17/sim-fightallycap-b-prereg.md`.

## Base, band, policy, legs

- **Base at freeze:** master `db8a289bf` (sim-fightallycap-b: pilot GO).
- **Policy:** competent verbatim (`scripts/policies/competent.js`), sha256
  `df9b7dff4de498779655b04db29782023840d8b2a4ed19a0ecbe86db9c71438c`
  (same hash as the pilot — verified on this tip before freezing).
- **Band:** seeds 103801–103812 (12 seeds, frozen fresh — see freshness
  check below). **Horizon:** 150d death-aware.
- **Legs:** ctl `VETREENGAGE=1` · arm `VETREENGAGE=1 FIGHTALLY2=1`.
  (Substrate identical to the pilot; the lever is env-gated default-OFF.)
- **Instrument:** the pilot's instrument, reused unchanged:
  `scripts/fightallycap-driver-20261117.js` (RUN `fightallycap-b`,
  OUTDIR `perseed-fightallycap-confirm-b-ctl` / `-arm`) +
  `scripts/analyze-fightallycap-b.js` (output renamed to
  `fightallycap-confirm-b-analysis.json` immediately after the run so the
  pilot's `fightallycap-b-analysis.json` is never overwritten) +
  `scripts/build-fightallycap-b-panels-20261117.js`
  (`--out evidence/2026-11-17/fightallycap-confirm-b-panel`,
  `--seeds 103801,…,103812`).
- **D2 determinism leg:** not re-run — the recorder-off leg was already
  proven trajectory-identical on the pilot (seed 103601); the recorder and
  the lever code are unchanged since, and this is a measurement-only
  confirm. (If the analyzer's drift check fires, D2 is re-run before any
  verdict.)

## Freshness check (done BEFORE freezing, per local_seed_band_freshness)

- Searched every `evidence/*/sim-*-prereg.md` (968 files) plus every
  `evidence/*/sim-*.md` for each of 103801–103812: **0 hits per seed**.
- Searched dated evidence filenames / corpus filenames for `*1038*`:
  one hit only — `evidence/2026-10-28/sim-nighttravel-bank-b-scan-insideevening/nighttravel-b-insideevening-s11038.json`
  (seed **11038**, not in this band).
- Taken bands named in `evidence/2026-11-17/sim-*-prereg.md` and avoided:
  103001–103008, 103011–103018, 103021–103028, 103101–103108,
  103201–103208, 103211–103218, 103221–103228, 103231–103238,
  103241–103248, 103411–103418, 103421–103428, 103431–103438,
  103501–103512 (planignconfirm-b, 12 seeds), 103601–103608 (pilot).
  103801–103812 collides with none of them.

## Bars (frozen — same as pilot)

| # | Bar | Threshold |
| --- | --- | --- |
| B1 (PRIMARY) | Second ally joins | Mean joining allies **≥ 1.5** across armed-leg expedition-origin fought meetings with `alliesN ≥ 2` AND `calledHelp`. Judged ONLY when n ≥ 3 such meetings on the armed leg; otherwise UNJUDGEABLE and the run is NO-GO. Joining allies = (`allyVid` ? 1 : 0) + (`ally2Vid` ? 1 : 0). |
| B2 (SECONDARY) | Damage share up | Judged ONLY when ≥ 3 launched fought meetings carry a captured share on the armed leg. PASS iff their mean share **≥ 0.10** absolute. Share = `mDealt / mHpStart`; a vKill meeting shares at 1.0 by definition. |
| B3 (GUARDRAIL) | Expedition-death price | Expedition deaths armed ≤ control × 1.10 AND total deaths armed ≤ control × 1.10. |
| B4 | Proof green | `scripts/test-fightallycap-b.js` green on the final tip. (Pre-checked 22/22 on this tip before freezing; re-run at closeout.) |
| B5 | Balanced panel (§15) | `scripts/balance-panel.js compare` on the ctl→arm pseudo-panels (intervention flag `FIGHTALLY2` declared), `.md` attached to the evidence file; no uninvestigated regression. |
| Instrument | Recorder clean | All files parse, 12/12 files both legs, 0 instrument errors, every FOUGHT encounter row (rounds > 0 or dealt > 0) that is not a kill carries `mHpStart`. No-contact evades (rounds 0, dealt 0) and vKill rows correctly carry null and are not counted missing. `recMismatch` is diagnostic only. |

**Verdict:** GO iff B1 && B3 && B4 && instrument clean && (B2 unjudged || B2 pass)
&& B5 has no uninvestigated regression. A B2 fail is NO-GO with the numbers;
per kill discipline the lever stays HELD (not killed) unless the run
establishes the lever itself is wrong. This arm changes NO game code and
flips NO default — a GO confirms the landed lever; a NO-GO is reported to
the coordinator with the numbers (the lever stays env-gated OFF, so a NO-GO
does not un-land anything by itself).

## Drift rule

If the armed leg fields a second ally 0 times, the flag never changed
behavior, so the two legs must be trajectory-identical (same seeds, same
substrate flags) — any divergence is an instrument/code defect to
investigate, never a lever effect. (When the second slot fires,
trajectories diverge by design and the rule does not apply.)

## Pre-run scoping (from the pilot corpora, not from this run)

On the pilot band the B1 population was n=18 ctl / n=8 arm — the armed leg
had fewer eligible meetings because trajectories diverge once the lever
fires. On 12 fresh seeds the n ≥ 3 judging floor should still clear, but
the armed-leg B1 n is the honest risk: if it lands under 3, the run is
UNJUDGEABLE / NO-GO per the frozen rule, not re-scored. The unconditional
join distribution (0/1/2 joins) is reported alongside the mean.

## Wall numbers (reported every run)

National / table / wins, wave 4–5 unlocks, median survival — from the
analyzer (`wall` block) on both legs.
