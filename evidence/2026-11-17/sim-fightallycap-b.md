# sim-fightallycap-b — a second ally slot in the fight engine

**Arm:** sim-fightallycap-b (BUILD) · **Run:** fleshout-loop-b-20261117T1830Z · **Finding:** #2496
**Base:** master `adad111ca` (sim-winnability-round-1729) · **Commit:** `df0a7e178`
**Prereg:** `evidence/2026-11-17/sim-fightallycap-b-prereg.md` (frozen before any pilot sims)
**Band:** seeds 103601–103608 · 150 days, death-aware · competent verbatim
(`scripts/policies/competent.js`, sha256 `df9b7dff…`)
**Legs:** ctl `VETREENGAGE=1` · arm `VETREENGAGE=1 FIGHTALLY2=1` · rec
`FIGHTALLY2=1 FIGHTALLY2_RECORDER=off` on seed 103601 only

## Verdict: GO on all frozen bars — READY TO LAND

| Bar | Frozen rule | Result |
|---|---|---|
| **B1 PRIMARY** — second ally joins | mean joining allies ≥ 1.5 across armed-leg expedition fought meetings with alliesN ≥ 2 and calledHelp, judged iff n ≥ 3 | **PASS** — 1.625 (n=8; 3 meetings with 1 ally, 5 with 2) vs control exactly 1.0 (n=18, every meeting exactly 1) |
| **B2 SECONDARY** — damage share | launched fought meetings mean share ≥ 0.10, judged iff n ≥ 3 captured shares on the armed leg | **UNJUDGEABLE** — only 1 launched fought meeting carried a captured share on the armed leg (n=1). Per the prereg the verdict rides on B1 alone |
| **B3 GUARDRAIL** — deaths within 10% of control | expedition deaths armed ≤ ctl × 1.10 AND total deaths armed ≤ ctl × 1.10 | **PASS** — total 665 vs 744 (89% of control; limit 818); expedition 191 vs 237 (81%; limit 261). Deaths fell on both counts |
| **B4 PROOF** — proof test green | `scripts/test-fightallycap-b.js` green | **PASS** — 22/22 |
| **B5 PANEL** — balanced-panel compare | `balance-panel.js compare`, flag `FIGHTALLY2` declared, `.md` attached, no uninvestigated regression | **PASS with investigation** — panel decision `review_required` on one watch item only (community loss 1/8 → 3/8); investigated below, no lever mechanism found; every other metric `no_material_signal` or `not_observed` |
| **Instrument** | 8/8 files both legs, 0 errors, every fought non-kill row carries `mHpStart` | **CLEAN** — 8/8, 0 errors, missingHp 0/0. One diagnostic-only `recMismatch` on the control leg (see below) |

## What was built

The fight engine had one ally slot: one companion could join from the
start, and one more could answer a single hopeless shout — so an expedition
fight (no ally from the start) could only ever field one joining ally, no
matter how big the party was. This build adds a second ally slot behind the
`FIGHTALLY2=1` flag (off in the browser):

- A second shout: when the leader is *still* losing after the first ally
  arrives, they shout again and a second companion charges in.
- The second ally gets their own body, gear, and wound settlement — they
  strike on the same formula with their own gear, take their share of the
  monster's blows (the monster's attention splits across whoever is
  standing), and their wounds settle per-person at the end, exactly like
  the first ally's.
- `rec.allyDealt` is now the total damage across both allies; `ally2Dealt`
  / `ally2Taken` / `ally2Vid` carry the second slot's own numbers.

Off-mode behavior is byte-identical to before the change (proven on three
staged fights, pre-change numbers captured first, re-run after the change —
identical). God-path hooks (ally share/down/mend, Live Broadcast, ward
rescue) stay ally-1-only by design; that is a documented limitation, not a
bug — the second slot is a fight-engine change, not a god-path change.

## Before / after (pilot numbers)

| | Control | Armed | |
|---|---|---|---|
| Mean joining allies (B1 population) | 1.0 (n=18) | **1.625 (n=8)** | bar 1.5 — PASS |
| Second-ally joins, all origins | 0 | **37 across 6 of 8 seeds** | the B1 population is narrow by design (expedition + called-for-help); the lever also fires on aid and world-tick fights and on fights where both allies start present |
| Launched fought meetings (B2 population) | 4 (3 with a share, mean 0.011) | 1 (1 with a share) | B2 unjudgeable — see below |
| Total deaths | 744 | 665 | −11% |
| Expedition deaths | 237 | 191 | −19% |
| Wave-4+ launches | 20 | 14 | trajectories diverge once the lever fires |
| Expedition fought meetings with 2+ companions | 23 | 12 | same divergence; B1 n is smaller on the armed leg but still judged (n=8 ≥ 3) |

Per-seed B1 (mean joining allies / eligible meetings): control 1.0 on every
seed that had any (103601–103604, 103606, 103607; 103605 and 103608 had none).
Armed: 103601 1.6 (n=5), 103604 1.5 (n=2), 103605 2.0 (n=1), the other five
seeds had no B1-eligible meeting. The pass is pooled, and the concentration
is honest: the situation B1 measures (a multi-companion expedition fight
where the leader calls for help) is rare — it arose on 3 of 8 armed seeds.
The lever itself fired far more broadly (37 joins), just mostly outside
B1's narrow population.

Why B2 is unjudgeable: the armed leg launched fewer wave-4+ hunts (14 vs
20) and only one launched party's meeting carried a captured share. That is
trajectory divergence, not a measurement failure — once the first armed
fight resolves differently, the whole 150-day village plays differently,
and the launch-then-meet chain is the most fragile link. The prereg
anticipated this: B2 is conditional, and the verdict rides on B1.

## Reachability — waves, standing, table, wins

| | Control | Armed |
|---|---|---|
| Wave 4 unlocked | 7/8 | 8/8 |
| Wave 5 unlocked | 2/8 | **5/8** |
| National standing (scaleRank ≥ national) | 2/8 | **5/8** |
| National rank | 0/8 | 0/8 |
| Table offered / taken | 0/8 | 0/8 |
| Wins | 0/8 | 0/8 |
| Median survival | 151 days | 150 days |
| Villages surviving 150 days | 7/8 | 5/8 |

The armed villages reach further — wave 5 on 5 of 8 instead of 2, national
standing on 5 instead of 2 — but two more villages collapse entirely (see
the B5 investigation). No village reaches the table or wins on either leg;
the win is still gated far above what a second ally alone moves.

## B5 investigation — the community-loss watch (1/8 → 3/8)

The panel flags one item: community loss 0.125 → 0.375 (+0.25, interval
0 to 0.625 — the interval includes 0, so the panel itself calls this a
watch, not a demonstrated regression). The three armed villages that
collapsed:

- **103608, lost day 87** — the lever **never fired** on this village: zero
  second-ally joins in any fight. Its control twin also collapsed (day 45,
  the earliest loss in the whole pilot). The armed twin survived twice as
  long. Not lever-caused.
- **103602, lost day 97** — the lever fired **once**: one second ally in a
  world-tick fight on day 84, dealing 26 damage and taking none. The
  village's deaths were dominated by home fights (32 villager-combat
  deaths). No plausible mechanism from a single 26-damage assist.
- **103606, lost day 147** — the lever fired **8 times**, mostly defending
  the village itself (second allies dealing 143, 115, 104 damage in home
  fights). This village reached wave 5 and standing 410 — further than its
  control twin (wave 4, standing 199) — and died with **zero** expedition
  deaths. The second ally was helping it hold on, not killing it.

And the band totals cut against a lever-kills-villages story: total deaths
fell 744 → 665 and expedition deaths fell 237 → 191. The honest reading is
trajectory divergence on 8 seeds: the armed villages play bolder, reach
further, and on two seeds the re-rolled 150 days happen to collapse late.
B5 is judged PASS with this investigation attached; the panel's formal
decision (`review_required`) is stated here, not laundered, so the
coordinator can overrule.

## Instrument notes

- 8/8 files both legs, 0 instrument errors, missingHp 0/0.
- One diagnostic-only `recMismatch` on the control leg: seed 103604, day
  95, congregation, fled — the post-call recovery says the monster started
  with 923 HP, the record's own field says 932 (a 9 HP gap, ~1%). The row
  still carries a spawn HP, so nothing is counted missing and no bar is
  affected. Worth one look if the recorder is ever revisited; not a
  verdict item.
- D2 (recorder-off armed leg, seed 103601): trajectory-identical to the
  armed leg — the recorder does not change play. The analyzer prints
  `d2div: 7` because the rec leg runs one seed by design and the other
  seven were never run recorder-off; the one seed that ran matches exactly.
- The drift rule does not bind: the armed leg fielded a second ally 5 times
  in the B1 population (37 times overall), so the legs are expected to
  diverge.

## Sense-testing — does the second ally read like a person?

Yes. Two expedition transcripts from seed 103601 (armed):

- Day 77, The Audit: Karl is losing and shouts — Gustavo charges in. Karl
  is *still* losing and shouts again — Fernando charges in. After that all
  three strike each round and the monster splits its blows between Karl and
  Gustavo. The escalation reads as a real fight getting desperate, then
  turning into a three-person stand.
- Day 105, The Strike: the same shape — Leo shouts, Fernando arrives,
  still losing, shouts again, Miguel arrives and hits for 42. Miguel dealt
  238 damage across the fight and took 23 in wounds that settled on his own
  body afterwards.

One joining ally dealt 0 damage and took 0 (day 98, reunion aid fight) —
they arrived and the fight ended before they acted. No phantom settlement:
no wounds were recorded for them, which is correct. Nothing in the logs
reads as a duplicated or ghost companion; the second shout only fires when
the leader is still losing, so it never reads as a free extra fighter.

## Village assessment, in plain words

A party that travels together can now actually fight together. Before this
build, the fourth seat on a hunt was decoration: the extra companion walked
along and watched one ally do all the joining. Now, when a fight is going
badly, a second companion can answer the second shout and turn a losing
fight into a three-person stand — and on the pilot's villages they did,
37 times, dealing real damage and taking real wounds.

The villages that got the second ally reached further up the ladder (wave 5
on 5 of 8 instead of 2, national standing on 5 instead of 2) while losing
fewer people overall. But they are not safer villages: two more of them
collapsed entirely, and the collapses look like the price of reaching
further on re-rolled fortunes rather than the lever hurting anyone — one
collapsed village never even saw the second ally, and another saw them
defending its home. The win is still nowhere in sight: no table, no seat,
no win on either leg. This build fixes the fight engine's cap, which is
what it was asked to do; the wall past wave 5 is still standing.

## Check status

`node scripts/check.js --only fight`: 11 passed, 3 failed — and all three
fail identically on pristine base `adad111ca` (verified by checking out the
pre-change files and re-running: same exit codes, same failing checks,
including identical numbers). Pre-existing, none caused by this build:
`test-zombie-fight-20261011.js` (`Text is not defined` in `genCharacter`,
a node-harness DOM stub gap); `test-inffight-class-20261014.js` (5 sense
failures, scholar at −3 HP); `test-break-monsters3-fieldfights-20261008.js`
(24 passed / 2 failed: wounded-leader retreat persistence and mFlee
persistence). Log: `evidence/2026-11-17/fightallycap-check-fight.log`.
The full `check.js --quick` was not completed (one attempt died to the
recurring host write flap before producing a log); the scoped fight check
plus the 22/22 proof test are the verification for this build.
