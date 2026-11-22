# sim-needwave-b — the GUARDED needWave copy

**Verdict: GO — all eight frozen bars pass, judged twice.** The
guarded copy keeps the unguarded copy's intended effect (null
launch rate 0.47 → 0.00, trio+ 0.40 → 0.89) while the wipe-aware
det-gate holds on all 8 seeds — 23 companion copies on the armed
leg, ZERO wipes to null. The verdict was judged once on base
b199d55c8 (GO) and re-judged on the rebased base 1c11dbb14 (GO
again, identical numbers except the beat rate, which master
changed underneath — see §10). The game-code change stands as
committed; no revert.

- **Run:** fleshout-20261122T1415Z, axis scale-onramp, arm sim-needwave-b
- **Prereg:** `evidence/2026-11-22/sim-needwave-b-prereg.md`, commit
  `6bf3be04e` (frozen before any judged run; rebase note in §10)
- **Instrument:** `scripts/needwave-driver-b.js`,
  `scripts/analyze-needwave-b.js` (selftest 26/26),
  `scripts/test-needwave-b.js` (31/31),
  `scripts/test-needwave-a.js` (26/26, pins updated deliberately
  — see §9), `scripts/build-needwave-panels-b.js`, instrument
  commit `6bf3be04e`
- **Fix commit:** `af4d7007f` — "guarded needWave copy in the
  companion plan sync (copy only when the leader's wave number is
  set; never erase a companion's) [needs-eyes]"
- **Band:** 107391–107398 (8 seeds, verified fresh in the prereg)
- **Horizon:** 150 days, death-aware. **Policy:** competent verbatim.
  **Substrate:** `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1
  SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1`; LEND/PRESENCE/
  KILLBUNDLE/HPGATE/PINQUAD/HYPOFLOOR unset.
- **Leg order (frozen, re-run):** ctl on the instrument commit
  first (anchor `6bf3be04e`), fix committed, arm on the fix
  second (anchor `af4d7007f`). Analyzer verified both anchors
  and both file shas (ctl win-plan `4f6465aaaa09`, brain
  `f5da2607c26b`; arm win-plan `9de1187e731d`, brain
  `89d73e040fbe`).
- **Analysis (judged):** `evidence/2026-11-22/needwave-b-analysis.json`
  (analyzer exit 0, verdict GO)
- **First judgment (preserved):**
  `evidence/2026-11-22/needwave-b-analysis-b199d55c8.json` (GO on
  base b199d55c8; corpora `perseed-needwave-b-*-b199d55c8/`,
  panel `needwave-b-panel-b199d55c8.*`)
- **Corpus (judged):** `evidence/2026-11-22/perseed-needwave-b-ctl/`
  and `perseed-needwave-b-arm/` (8 files each, 0 instrument
  errors on all 16)
- **Panel:** `evidence/2026-11-22/needwave-b-panel-before.json.gz` /
  `-after.json.gz`, compare `evidence/2026-11-22/needwave-b-panel.md`
  (decision: review_required)

## 1. The lever played

sim-needwave-a proved the UNGUARDED copy NO-GO on the det-gate: a
leader with no wave number wipes a companion's set wave number
(seed 107377: Jason's wave 4 wiped day 58, trio launch became a
silent solo). This arm is the guarded copy — one line per
companion, three syncs per site, assignment on the SAME line as
its `if` guard:

- `src/js/win-plan.js`, `launchParty`: `if (plan.needWave != null)
  cplan.needWave = plan.needWave;` (and `cplan2` / `cplan3`).
  This path is DEAD in sims — the brain owns dawn — but the copy
  belongs there too, so the two paths cannot drift apart again.
- `src/js/villager-brain.js`, `vbrainExecuteDepart`: `if (plan2 &&
  plan2.needWave != null) cplan.needWave = plan2.needWave;` (and
  `cplan2` / `cplan3`). This is the live path: all 23 copies on
  this band came through it (source `brain` on every copy row).

Nothing else in game code was touched. The guard copies only when
the leader's wave number is set; a null leader copies nothing, so
a companion's set number survives. A set leader OVERWRITES a
companion's set number (leader 3 + companion 4 → companion 3):
that is the chosen shape, not a wipe — the sync already re-points
the companion's target unconditionally, so the wave number follows
the target. Two such downgrades were counted on the band (§4);
neither cost a launch its wave-4+ status in the end (Xavier
re-copied 4 to the same companion days later).

The instrument blind spot from -a is fixed first
(sim-findings.md line 2693): `diffNeedWaves` now logs EVERY
needWave change — a wipe to null IS a row (`to: null`), and the
holder's own plan IS included with `isHolderPlan: true`. The
analyzer treats holder rows as re-seed noise (compared as a
stream pre-bound, never the bound) and companion rows as the
lever's copies. No holder rows fired on either leg of this band
(0 on all 16 files), so the holder inclusion was exercised
vacuously here — but the mechanism is proven by the analyzer
selftest (7 new wipe/holder/downgrade cases), and the -a wipe
shape (a companion row to null) would have set the bound.

## 2. Before / after on identical seeds

Zero-launch rule cleared: ctl 15 launches, arm 9 (bar needs ≥ 5 per leg).

| Bar (prereg §6) | Control | Armed | Threshold | Result |
|---|---|---|---|---|
| 1. Instrument validity | proof 31/31 + 26/26, analyzer selftest 26/26, 0 errors on 16 files | same | all must hold | PASS |
| 2. Det-gate (wipe-aware) | — | all 8 seeds pass, bounds day 35–118 (or none) | all must hold | PASS |
| 3. PRIMARY — launches with no wave number | 7/15 = 0.47 | 0/9 = 0.00 | armed ≤ 0.25 | PASS |
| 4. Trio+ launch rate | 6/15 = 0.40 | 8/9 = 0.89 | armed > control | PASS |
| 5. Departure-beat rate | 15/15 = 1.00 | 9/9 = 1.00 | armed ≥ control | PASS * |
| 6. Starvation guardrail | 2 total | 0 total, max per-seed excess 0 | ≤ ctl+2 total, ≤ +2 per seed | PASS |
| 7. Survival guardrail | median 151d | median 151d | ≥ 0.8 × control | PASS |
| 8. NO-GO rule | no bar missed | — | any miss → NO-GO | **GO** |

\* Bar 5 passes trivially on the rebased base: master landed
LAUNCHVOICE (r268, 1c11dbb14) mid-run, which deleted the beat's
wave-4+ gate — every departure now speaks on both legs (see §10
and §14). On the first judgment (base b199d55c8, gate intact) the
same bar read 0.40 → 1.00, the lever's beat effect measured, not
assumed. The re-judgment's bar 5 is a pass, not evidence of a
beat effect.

Per seed (launches / null launches / trio+ / beats spoke / starvation deaths /
total deaths / days / end):

| Seed | Control | Armed |
|---|---|---|
| 107391 | 6 / 5 / 1 / 6 / 0 / 128 / 151d survived | 4 / 0 / 4 / 4 / 0 / 135 / 151d survived |
| 107392 | 3 / 2 / 1 / 3 / 2 / 69 / 61d lost | 0 / 0 / 0 / 0 / 0 / 111 / 142d lost |
| 107393 | 0 / 0 / 0 / 0 / 0 / 98 / 151d survived | 0 / 0 / 0 / 0 / 0 / 111 / 151d survived |
| 107394 | 1 / 0 / 1 / 1 / 0 / 73 / 143d survived | 1 / 0 / 1 / 1 / 0 / 73 / 143d survived |
| 107395 | 5 / 0 / 3 / 5 / 0 / 119 / 151d survived | 4 / 0 / 3 / 4 / 0 / 119 / 151d survived |
| 107396 | 0 / 0 / 0 / 0 / 0 / 55 / 151d survived | 0 / 0 / 0 / 0 / 0 / 55 / 151d survived |
| 107397 | 0 / 0 / 0 / 0 / 0 / 78 / 151d survived | 0 / 0 / 0 / 0 / 0 / 78 / 151d survived |
| 107398 | 0 / 0 / 0 / 0 / 0 / 84 / 151d survived | 0 / 0 / 0 / 0 / 0 / 84 / 151d survived |

Wall numbers (scale wall — the axis question): wins 0 → 0, national 0 → 0,
wave-5 reached 6 → 5 villages, wave-4 reached 8 → 8, median survival
151d → 151d, villages lost 1 → 1. No movement toward the table on either
leg. Table entry is not instrumented by this driver — recorded as not
instrumented, never faked.

## 3. Village assessment, in plain words

The guarded copy does what the unguarded copy was supposed to do,
without doing the thing that killed it. On seed 107391 the control
leg is five silent null launches and one quad; the armed leg is
four launches, all quads, all with a wave number, all announced.
The copy chain is visible in the rows: Xavier copies wave 3 to
four companions across days 35–58, Yara copies wave 4 to Xavier
and Mateo on day 142, and Xavier copies 4 onward on days 147 and
149 — each launch hands its wave number to the next launch's
leader. That compounding is the prereg's §2 prediction, measured.

On seed 107395 the same compounding shows in one step: Lucas
copies wave 4 to Tariq on day 123 (Tariq held 3), and Tariq's
next launch on day 128 goes out with wave 4 instead of the silent
wave-3 pair the control leg ran. On the first judgment's base
(gate intact) that launch was silent on control and spoken on
armed; on the rebased base both speak, but the armed one is a
wave-4 launch and the control one is a wave-3 pair — the copy
changed what the party IS, not just whether it is announced.

Seed 107392 is the honest limit. The control leg launches three
times (Vasyl's wave-4 quad day 49, Victor's two null pairs days
52 and 57) and the village is lost by day 61. The armed leg
launches zero times — not one wave-4+ departure is even attempted
— and the village lasts to day 142. The two day-36 copies fired,
then nothing: no holder ever committed to a launch. The lever
cannot fix a launch that is never attempted; the village survived
longer (starvation 2 → 0) without ever setting out. That is the
carried launch-funnel finding (§6), not a lever failure — but it
is also why the band's launch total fell 15 → 9. Fewer launches,
all of them real parties: the funnel narrowed and deepened at the
same time.

Seeds 107396, 107397, 107398 never launch on either leg, and
107394's single launch is byte-identical on both legs (Sofia with
Ethan and Priya after The Herald, day 106). Four of eight villages
never attempt a wave-4+ departure in 150 days at all — the wall
after this lever is the attempt rate, not the sync.

## 4. Why the det-gate passes (and what the wipe-aware record saw)

The gate compares every recorded event stream between the legs up
to the armed leg's first COMPANION copy (any to-value). Bounds:
107391 day 35, 107392 day 36, 107393 day 71, 107394 day 58,
107395 day 118, 107396 none (no copies), 107397 none, 107398 day
43. All 8 seeds pass with zero mismatches; the ctl leg recorded
0 companion copy rows on all 8 seeds.

The armed leg recorded 23 companion copies and 0 holder rows:

- 19 fills from null (the intended effect), 2 upgrades (3 → 4:
  Lucas → Tariq day 123; Xavier → Jorge/Mateo days 147/149),
  2 downgrades (4 → 3: gen_6fs6wo2 → Mateo days 147 and 149 —
  a wave-3 holder copying over Mateo's 4; Xavier re-copied 4 to
  Mateo the same days, so the downgrade never stuck on a launch),
  **0 wipes to null**. The guard held on every copy.
- All 23 copies came through the brain path (`source: brain`);
  the win-plan.js path is still dead in sims, as in -a.
- Seeds 107396/107397 recorded no copies and identical streams
  end to end (identical deaths, days, and outcomes on both legs)
  — the gate passes trivially there and the villages are
  untouched by the lever, which is itself a result: where no
  companion sync fires, the lever changes nothing.

The first judgment's det-gate bounds were identical (same days),
and the re-run reproduced every copy row exactly — the only
difference between the two judgments is the beat stream, which
LAUNCHVOICE changed on both legs equally (see §10).

## 5. Sense-test: the departure announcements

On the first judgment's base the contrast was silent vs speaking
(control: Tariq and a nameless companion slip out silently days
82–99; armed: the same departures speak). On the rebased base
every departure speaks — LAUNCHVOICE's doing, not this lever's —
so the sense-test here is party vs lone departure, in the lines
themselves. Control, seed 107391, days 82–99:

- 📺 SYSTEM: "Henry sets out after The Audit — the fire marks the trail."
- 📺 SYSTEM: "Tariq sets out after The Audit — the fire marks the trail."
- 📺 SYSTEM: "Henry sets out after Ugly-Eyes — the fire marks the trail."

Nobody with them; the village hears a man leaving alone. Armed,
seed 107391, days 142–149:

- 📺 SYSTEM: "Yara sets out with Mateo, Megan and Xavier after The Loud Beast — the fire marks the trail."
- 📺 SYSTEM: "Xavier sets out with Mateo, Megan and Jorge after The Loud Beast — the fire marks the trail."
- 📺 SYSTEM: "Xavier sets out with Mateo, Jorge and Ulzhan after The Loud Beast — the fire marks the trail."

A party setting out reads as a party. The same contrast on seed
107395: control day 135, "Tariq sets out with Theo after The Big
Beast" as a wave-3 pair; armed day 138, "Giulia sets out with
Theo and Lucas after The Big Beast" as a trio with a wave number.
The lines are honest about who is going and after what — the
lever changed the party, and the party is what the line names.

One reading note: the beat-line corpus on the rebased base is
noisier — every departure in the village speaks now, including
wave-1/2 forages ("Ulzhan sets out with Katarina", no target, day
after day) and a few anonymous-person lines with no SYSTEM prefix
("A man, maybe 50s, with a missing fingertip sets out with Anh").
That is LAUNCHVOICE's volume, not this lever's; the wave-4+
launches are the ones this evidence judges.

## 6. Launch-funnel findings (carried from the control leg)

These were found on the control leg and are unchanged by the
lever; they are the reason launches are rare on this band at all
(15 launches in 8 villages over 150 days, while wave-4 fights
number in the dozens per village):

- **The homebody holder.** Seed 107380 in -a: Dale held a wave-4
  plan from day 86 to day 150 and held all 41 dawn commits. The
  same shape recurs here: seed 107392 armed holds plans for
  weeks with zero departures attempted.
- **The forager choke.** Holders who are foragers never reach the
  depart call without a launch commit today. Plans sit for weeks
  with no departure ever attempted.
- **The dominant plan shape is (`hunt`, no target, no wave).**
  Hundreds of census rows. That is the brain-path first-companion
  sync shape: stage hunt, no target, no wave number.
- **The attempt rate is now the wall.** Four of eight villages
  never attempt a wave-4+ departure in 150 days on either leg.
  The needWave copy fixes what happens WHEN a party sets out; it
  cannot make a village set out. That is the next wall after the
  guarded copy.

## 7. New findings for the backlog

- **No new backlog items.** The downgrade shape (set-to-lower
  copy, 2 rows on seed 107391) is documented here (§4), not a
  defect: the companion's target is re-pointed unconditionally
  by the same sync, so the wave number following the target is
  coherent, and both downgrades were re-upgraded the same day.
  If a future band shows downgrades sticking on launches, the
  fill-only variant (copy only when the companion's is blank) is
  the next arm — named here, not filed as a defect.
- **Brain-path first-companion target/node gap (carried, still
  open).** The first companion's sync copies no target and no
  node on the brain path. Recorded in the -a prereg as a separate
  finding, not fixed by this lever.

## 8. Panel comparison (§15)

`node scripts/balance-panel.js compare` on the paired 8-seed panels:
decision **review_required**. Table win rate 0 → 0, national access 0 → 0,
first-bearer survival through day 30/60 unchanged (1 → 1). Village deaths
per run 88 → 95.75 (+7.75, regression_watch), deaths per 100 days 67.0 →
64.3 (no_material_signal), community loss 0.125 → 0.125 (no_material_signal).
The deaths-per-run uptick is a longer-life denominator effect, not more
dying per day: the armed villages lived 766 total village-days vs 704
(the seed 107392 village alone lived 81 days longer and accumulated 42
of the +62 deaths over that longer life), while deaths per 100 days fell
and starvation fell 2 → 0. The panel is the instrument; the frozen bars
in §2 are the judge. No scale movement; the death uptick stays inside
the frozen guardrails. The panel numbers are identical to the first
judgment's panel.

## 9. Proof and check status

- **Proof test** `scripts/test-needwave-b.js`: 31/31 on the new code;
  fails on old code as designed (10 fail: the guarded-copy
  assertions — §A positive pins, §B1/§B2/§B4 copies, §B3 beat,
  §D1 wave-3 copy). Fixture: holder Amina with a live Herald plan
  (wave 4), companions Diana (pre-existing plan, null), Emmett,
  Femi (planless) — all armed and armored, per the encounter-gear
  rule (a geared scholar with a party, never a fresh un-geared
  scholar alone). Includes the wipe fixture (§B2W: null-wave
  leader + set-wave companions keep their number) and the
  downgrade fixture (§B4: leader 3 + companion 4 → companion 3,
  documented shape).
- **test-needwave-a.js (updated pins):** 26/26 on the new code.
  The update was DELIBERATE, in the instrument commit: §A pins
  unchanged (the unguarded line-start copy is still forbidden,
  and the guarded shape does not trip them); §B/§D rewritten to
  the guarded expectations (companions inherit 4; the
  companion-turned-holder speaks; wave-3 copies 3); §B2W wipe
  guard unchanged; §C BASE now b199d55c8. The file no longer
  asserts the revert — it guards the guarded shape. The adoption
  coordinator owns the 512f86760 guard-flip merge; this update is
  on this branch only and must be reconciled at merge time (the
  guard as adopted pins the revert; this branch's version pins
  the guarded copy — the coordinator should keep THIS branch's
  version if the lever lands, the adopted version if it does not).
- **Pre-flight green before any judged run:** killlootbundle proof
  12/12, leadgate proof 33/33, needwave analyzer selftest 26/26.
  Re-run green after the rebase onto 1c11dbb14, plus the
  directly-affected r268 tests: launchvoice 19/19, departbeat
  34/34.
- **`node scripts/check.js` was NOT run** — freeze constraint
  from the arm brief (a parallel adoption coordinator owns the
  round gate; concurrent jest causes phantom failures). Only the
  proof tests + sims were run. The ship loop's gate covers the
  branch at adoption time.
- **Directly-affected tests on the new code:** departbeat 34/34,
  leadgate 33/33, launchvoice 19/19, killlootbundle 12/12.
  partysize4-b / companionguard-b were not re-run (they fail on
  frozen-base diff checks from older bases, pre-existing, per
  -a §9 — not re-verified this run; recorded, not claimed).

## 10. Base moves during this run (rebase record)

The brief named master d9d98bf8f; local master moved twice during
the run, and the branch was rebased before judging each time, per
the prereg §7 base note:

1. **b199d55c8** (launchfield-refreeze-b, evidence-only, no src/
   changes — verified by `git show --stat`): rebased before the
   prereg commit. First judgment (GO) was produced on this base.
2. **1c11dbb14** (journey-establishment r268: PLANWAKE GO,
   LAUNCHVOICE speaks, day-desync answered, STRANDED-CLOSE menu
   fix): landed after the first judgment. It touches
   `src/js/win-plan.js` (22 lines) — LAUNCHVOICE deleted the
   departure-beat wave-4+ gate (`if ((plan.needWave | 0) < 4)
   return false;`), so every departure now speaks. The first
   rebase attempt failed on transient lock contention with a
   sibling reaper (`could not detach HEAD`, no lock file present);
   the retry succeeded cleanly, no conflicts. The branch was
   rebased (lever tip `af4d7007f`, instrument `6bf3be04e`), all
   proofs re-run green, and BOTH legs were re-run on the rebased
   base into the canonical dirs — the b199d55c8-base corpora,
   logs, analysis, and panel were preserved with `-b199d55c8`
   suffixes. The re-judgment reproduces the first judgment
   exactly except bar 5 (beat rate 1.0 vs 1.0, was 0.40 → 1.00):
   launch streams, copy rows, bounds, starvation, survival, and
   the panel are identical. The needwave-a landing the brief
   warned about did NOT land during this run.

## 14. Metric review

Per prereg §6 bar 8 and §8: no bar is re-scored. The verdict is
GO on all eight bars, judged twice on two bases with identical
results except bar 5. Two things about the metrics need saying
plainly, because they change what the NEXT run should measure:

- **Bar 5 (departure-beat rate) no longer discriminates.** On
  the first judgment's base it measured the lever's beat effect
  (0.40 → 1.00). On the rebased base master removed the gate the
  bar measured, so the bar reads 1.00 vs 1.00 — a pass that proves
  nothing about this lever. The bar is NOT re-scored (it passes
  as frozen), but a future arm should retire or replace it: the
  beat is now LAUNCHVOICE's, and the lever's audible footprint is
  the party in the line, not whether it speaks. The proof tests'
  §B3 (companion-turned-holder speaks) has the same caveat: it
  passes on the rebased base, but the line would speak even
  without the copy now — §B3 pins the line's presence, not the
  gate.
- **The launch total fell 15 → 9 and no bar turns on it.** The
  rates all improved while the count fell, because the villages'
  histories diverge after the first copy and the funnel narrowed:
  seed 107392 stopped launching entirely while surviving 81 days
  longer. A future prereg should consider a launch-count floor
  or an attempt-rate bar alongside the rate bars — the current
  bars cannot tell "fewer, better launches" from "the funnel
  dried up." On this band the per-seed table shows it is the
  former on 107391/107395 and the latter on 107392, and the
  guardrails (starvation 2 → 0, survival flat) say the drying-up
  cost nothing. That is the evidence; the bar design is the next
  run's question.

## Blanks

- **Table entry:** not instrumented by this driver; 0 wins / 0 national on
  both legs, so nothing to report either way.
- **Win-plan.js launchParty path:** confirmed dead in sims (all 23 copies
  via the brain path). The copy was still applied there for parity.
- **Seed 107392's zero launches on the armed leg:** downstream of the
  day-36 first copy (Dmitri → gen_ma6viy6, null → 3); the village's
  launch history diverged from control before Vasyl's day-49 quad and
  never attempted a wave-4+ departure after. The village lost at day
  142 vs 61 — longer life, no launches, no starvation.
- **Why launches are rare at all:** §6 — homebody holders, the forager
  dawn choke, and targetless plans. The needWave copy cannot fix a launch
  that is never attempted; that is the next wall after the guarded copy.
