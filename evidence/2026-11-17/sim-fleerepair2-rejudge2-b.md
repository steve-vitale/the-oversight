# sim-fleerepair2-rejudge2-b — B2 re-judged on 16 seeds (measurement only)

**Arm:** sim-fleerepair2-rejudge2-b (Loop B run fleshout-loop-b-20261118T0221Z) ·
**Branch tip:** `34a6a8411` (prereg commit; code tip unchanged from
`cf7ae127c`, sim-fleerepair2-rejudge-b) — NO code change in this run ·
**Prereg:** `evidence/2026-11-17/sim-fleerepair2-rejudge2-b-prereg.md`
(frozen before any sims in this run) · **Band:** 16 seeds 103601–103616
(diagnosis 103601–103608 + fresh 103609–103616, freshness verified by
grep: no prereg names the fresh half) · **Horizon:** 150d death-aware ·
**Policy:** competent verbatim · **Substrate both legs:**
`VETREENGAGE=1 PARTYSIZE4=1` · **Armed leg adds:** `FLEEREPAIR2=1` ·
**Both legs:** run FRESH on all 16 seeds in this run (anchor
`34a6a8411a77`, policy df9b7dff4de4).

## Verdict: GO per the frozen prereg — B2 passes STRICT, not just on tolerance

The 0026Z re-judge failed B2 by one kill (6 → 5 on 8 seeds, all on
103602). On 16 seeds the gate costs no kills at all: wave-4 kills tie
13 → 13, so the strict line passes and the pre-registered one-kill
tolerance was never needed. B1 passes non-vacuously again (launched
Suburb meetings 3 → 0, suburb launches 11 → 0, gate blocked 20). Deaths
fall on both guardrail counts. The one-kill gap on the diagnosis half
reproduces exactly — and the fresh half hands the kill straight back
(seed 103612: 0 → 1, a village that died on control survives on the
armed leg and reaches wave 5).

**Instrument note — read this before the analyzer's verdict field.**
The analyzer's own `verdict` field reads NO-GO, and its `instrument`
reads DIRTY. That is an artifact, not a measured failure:
`scripts/analyze-fleerepair2-b.js` computes `instrClean` with the
hardcoded check `ctlS.files === 8 && armS.files === 8` (written when
every panel was 8 seeds). On this 16-seed run the check fails even
though all 16 files are present on both legs, 0 instrument errors were
recorded, and missingHp is 0 on both legs. The prereg's instrument
criterion for THIS run is "16/16 files both legs, 0 instrument errors,
missingHp 0 (recMismatch diagnostic only)" — every clause is met. The
analyzer's B1/B2/B3 judges (the frozen instrument) all pass. The
verdict below is judged against the prereg, as the prereg instructs;
the analyzer discrepancy is recorded as finding #2513 (parameterize
the file-count check; re-running the analyzer on these corpora after
that fix should flip its verdict field to GO with no other change).

| Bar | Result | Numbers |
| --- | --- | --- |
| B1 (PRIMARY re-check): launched meetings vs a leave-counter species (suburb) | **PASS** (non-vacuous: ctl 3 ≥ 1) | ctl 3 → armed 0; suburb launches 11 → 0; gate blocked 20 (suburb seeds 18 → 20, all 20 blocked on armed) |
| B2 (PRIMARY for this re-judge): wave-4 kills, one-kill tolerance | **PASS** — strict line passes too | 13 → 13; strict armed >= ctl: 13 >= 13 PASS; tolerance line (armed >= ctl - 1 = 12): PASS |
| B3 (guardrail): expedition deaths armed ≤ control ×1.10 AND total deaths armed ≤ control ×1.10 | **PASS** | exped 427 → 417 (cap 469.7); total 1448 → 1417 (cap 1592.8); starvation 5 → 4 |
| B4: proof green on final tip | **PASS** | `scripts/test-fleerepair2-b.js` 29/29, 0 fail |
| Instrument (per prereg: 16/16 files, 0 errors, missingHp 0) | **CLEAN** | 16/16 files both legs, 0 instrument errors, missingHp 0/0, recMismatch 1/1 (diagnostic only, identical row both legs — see below) |
| B5: balanced panel, no uninvestigated regression | **INVESTIGATED** | `review_required` decision label; ZERO `regression_watch` rows (all observed metrics `no_material_signal` or `descriptive`); village deaths/run 90.5 → 88.5625, community loss 0.25 → 0.1875, both down |

## Before / after — 16-seed band 103601–103616

| Metric (16 seeds) | Control | Armed (`FLEEREPAIR2=1`) |
| --- | --- | --- |
| Launches (deduped by vid/day, wave-4+) | 38 | 31 |
| Suburb seed events (`mid='suburb'`) | 18 | 20 |
| Gate blocked (`blocked=true`) | 0 | 20 |
| Suburb-hunt launches | 11 | 0 |
| Launched suburb meetings | 3 | 0 |
| Launched suburb meetings, round-1-zero / wise leaves | 2 / 3 | 0 / 0 |
| Wave-4 kills | 13 | 13 |
| Launched meetings (any target) / mean damage share | 9 / 0.142 (n=8) | 7 / 0.192 (n=6) |
| Deaths (total / expedition / starvation) | 1448 / 427 / 5 | 1417 / 417 / 4 |
| Villages survived | 12/16 | 13/16 |
| Wall: national standing (≥200) / national rank / table / wins / wave 4 / wave 5 | 5 / 0 / 0 / 0 / 15 / 5 | 6 / 0 / 0 / 0 / 15 / 6 |
| Median survival (days, analyzer) | 151 | 151 |

## Per-seed, armed vs control

| Seed | Deaths | Exped deaths | Wave-4 kills | Suburb launches | End | Max wave | Standing |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 103601 | 83 → 83 | 24 → 24 | 1 → 1 | 0 → 0 | survived | 4 → 4 | 199 → 199 |
| 103602 | 137 → 108 | 36 → 26 | 2 → 1 | 9 → 0 | survived | 5 → 4 | 550 → 199 |
| 103603 | 103 → 103 | 15 → 15 | 2 → 2 | 0 → 0 | survived | 5 → 5 | 440 → 440 |
| 103604 | 125 → 125 | 79 → 79 | 0 → 0 | 0 → 0 | survived | 4 → 4 | 199 → 199 |
| 103605 | 102 → 90 | 35 → 35 | 0 → 0 | 0 → 0 | survived | 4 → 4 | 199 → 199 |
| 103606 | 84 → 84 | 30 → 30 | 0 → 0 | 0 → 0 | survived | 4 → 4 | 199 → 199 |
| 103607 | 83 → 83 | 18 → 18 | 1 → 1 | 0 → 0 | survived | 4 → 5 | 199 → 380 |
| 103608 | 27 → 27 | 0 → 0 | 0 → 0 | 0 → 0 | village-lost | 3 → 3 | 25 → 25 |
| 103609 | 71 → 71 | 12 → 12 | 2 → 2 | 0 → 0 | survived | 4 → 4 | 199 → 199 |
| 103610 | 72 → 72 | 7 → 7 | 1 → 1 | 0 → 0 | survived | 4 → 4 | 199 → 199 |
| 103611 | 103 → 103 | 22 → 22 | 0 → 0 | 0 → 0 | village-lost | 5 → 5 | 545 → 545 |
| 103612 | 76 → 86 | 20 → 20 | 0 → 1 | 2 → 0 | village-lost → survived | 4 → 5 | 199 → 315 |
| 103613 | 143 → 143 | 69 → 69 | 1 → 1 | 0 → 0 | survived | 5 → 5 | 475 → 475 |
| 103614 | 73 → 73 | 19 → 19 | 0 → 0 | 0 → 0 | village-lost | 4 → 4 | 199 → 199 |
| 103615 | 96 → 96 | 32 → 32 | 3 → 3 | 0 → 0 | survived | 5 → 5 | 325 → 325 |
| 103616 | 70 → 70 | 9 → 9 | 0 → 0 | 0 → 0 | survived | 4 → 4 | 199 → 199 |

Only three seeds move at all: 103602, 103605, 103612. The other
thirteen are trajectory-identical between legs (kills, deaths,
launches, standing all equal) — the determinism the diagnosis relied
on holds on the fresh band too.

## The two seeds that decide B2

**103602 (diagnosis half) — the 0026Z gap reproduces exactly.**
Launches 9 → 0 (all 9 were suburb hunts); deaths 137 → 108,
expedition deaths 36 → 26; wave-4 kills 2 → 1; standing 550 → 199,
max wave 5 → 4. The two lost kills are the same two the 0026Z run
documented: Ruby's day-98 wild Herald kill (717 dealt, 7 rounds) and
Dmitri's day-127 wild Algorithm kill (485 dealt, 5 rounds, met en
route to a suburb hunt) — both wild meetings, neither a launched hunt
kill. The armed leg's one kill is the same day-133 contact finish vs
a 1-HP Herald (23 dealt, rounds 0). The gate takes away 9 wasted
launches and 10 expedition deaths on this seed; the encounter stream
then deals a different hand.

**103612 (fresh half) — the mirror image.** Control: village-lost
day 76, 2 suburb launches, 0 wave-4 kills, standing 199. Armed: the
village SURVIVES to day 150, launches 0 suburb hunts, kills 1 wave-4
monster (day 114, visjoin_64 vs the Herald, contact finish, 37 dealt,
rounds 0, world-tick), standing 199 → 315, wave 5 reached. Total
deaths rise 76 → 86 only because the village lives 74 days longer
(expedition deaths equal at 20). The kill the diagnosis half lost,
the fresh half gained — and it came with a survival, not just a kill.

**103605 — the re-seed sieve, again.** Deaths 102 → 90, kills 0 → 0,
launches 0 → 0 — but suburb seed events 1 → 7, all 7 blocked. With no
suburb plan holding the slot, villagers keep meeting the Suburb in the
wild and the seed call fires (and is blocked) after every flee. Same
shape as the 0026Z run; harmless, all blocked.

**103607 — same count, different hand.** Kills 1 → 1, deaths 83 →
83, but the kill changes hands: control day 103 (app_mgpsphyd307 vs
Herald, 95 dealt, 3 rounds) vs armed day 113 (visjoin_95 vs Herald,
14 dealt, rounds 0 — contact finish). Standing 199 → 380, wave 5
reached on the armed leg. Trajectory divergence in the wild-encounter
stream, in the lever's favor this time.

## What the 13 kills are (both legs)

Every wave-4 kill on both legs is a wild/contact meeting — none is a
launched-hunt kill. Control: 8 Heralds, 1 Congregation, 1 Algorithm,
1 Reunion, 1 Eulogy, 1 Eater (13 total; 12 world-tick, 1 aid).
Armed: 9 Heralds, 1 Congregation, 1 Reunion, 1 Eulogy, 1 Eater (13
total; the Algorithm kill is the 103602 loss, the extra Herald kill
is the 103612 gain). Five of the thirteen on control and eight on
armed are rounds-0 contact finishes (11–37 dealt against a
nearly-dead monster). The gate removes no fight: it removes launches,
and the kills live in the wild stream either way.

## Sense-testing

Read the 'leave' lines on the armed leg (seed 103602, wild meetings —
the gate does not touch wild meetings):

- *"R1: Miles reads the sterile streets — you can't kill a suburb.
  They walk out. (Navigation is victory.)"* (day 89; the Suburb still
  lands HOA Fine for 22 afterwards — the leave is a decision, not an
  escape hatch)
- *"R1: Sigrun reads the sterile streets — you can't kill a suburb.
  They walk out. (Navigation is victory.)"* (day 113)
- *"R1: Rawiri reads the sterile streets — you can't kill a suburb.
  They walk out. (Navigation is victory.)"* (day 114; takes Property
  Tax for 20, 18 HP left)

Wise leaves on wild Suburb meetings: 19 on the armed leg vs 20 on
control (37 vs 39 Suburb encounters) — the learning path and the
leave itself are intact; what vanished is only the launched party
marching at the unkillable one. A quote from the vetSays record on
the armed leg, showing the gate's silence rather than its voice:
there is NO vetSays line on either leg that voices a suburb hunt plan
being made, a launch against the Suburb, or the gate's refusal — 0
hunt+suburb lines in the whole 32-file corpus. The gate returns null
silently, exactly as the 2230Z and 0026Z runs recorded (same silence
family as findings #2493/#2495/#2507); still out of scope for this
measurement-only run.

## Metric review

- **B2's tolerance was pre-registered but never needed.** The strict
  line passes (13 >= 13), so the tolerance question is answered
  empirically rather than by fiat: on 16 seeds the gate neither costs
  nor gains kills. The 0026Z one-kill miss was a band-size artifact —
  an 8-seed panel where one seed's wild-encounter divergence decided
  the verdict. The 16-seed panel shows the same divergence cutting
  both ways (103602 loses one, 103612 gains one). Future arms judging
  a launch-removal lever on kill counts should use 16 seeds minimum;
  an 8-seed kill bar is brittle by construction.
- **B1's calibration gate did its job a third time.** Ctl launched
  suburb meetings = 3 ≥ 1, so the armed 0 is a real zero. The fresh
  half alone contributes 2 suburb launches (103612) but 0 launched
  meetings — launches do not always meet — which is why the band is
  judged as a whole, not per half.
- **The analyzer's hardcoded 8-file check (finding #2513).** The
  frozen analyzer was written for 8-seed panels; its instrument bar
  hardcodes `files === 8`. This run's prereg defined the instrument
  as 16/16 files, and the analyzer's B1/B2/B3 judges all pass — but
  its verdict field says NO-GO on the file-count constant alone. The
  verdict here is GO per the prereg, with the discrepancy disclosed
  above rather than silently overridden. Any future >8-seed run of
  this analyzer hits the same artifact until the check is
  parameterized.
- **B3's guardrail is not noise, again.** Total deaths −31 with
  expedition deaths −10: the gate saves villagers by not sending them
  on futile expeditions. Seed 103612's total-death rise (+10) is a
  longer life, not a cost — the village survives where it died.
- **Drift check:** did not fire (null) — correctly, since the lever
  fired (blocked 20), so the legs are not expected to be identical.
  The 13 trajectory-identical seeds are the determinism the
  single-seed diagnosis relied on.
- **recMismatch 1/1 on both legs, identical row.** Seed 103604, day
  95, Mia vs the Congregation (Pack Hunt): recovered mHpStart 923 vs
  CONTACTREC 932, diff 9 — the known Pack Hunt recovery hole
  (findings #2497/#2501), diagnostic only per the prereg, same row on
  both legs, no verdict moves.
- **Balanced panel (B5):** `review_required` decision label, with ZERO
  `regression_watch` rows (24 not_observed, 6 no_material_signal, 1
  descriptive). The label is the panel's standing verdict for a
  screen-size (non-confirmation) panel, not a flagged regression: the
  only moving observed metrics are village deaths per run (90.5 →
  88.5625, down), village deaths per 100 days (66.76 → 64.51, down),
  and community loss (0.25 → 0.1875, down), all `no_material_signal`.
  No uninvestigated regression.
- **Launched-meeting mean share 0.142 → 0.192** is the shape the fix
  promises: fewer zero-share launched meetings (the suburb leaves
  were the 0-share bulk on control), though n=6–8 meetings makes it
  descriptive, not a claim.
- **Determinism check vs the 0026Z run.** This run re-ran both legs
  fresh on a new anchor (`34a6a8411a77`, prereg commit on the same
  code tip). The diagnosis-half numbers reproduce the 0026Z corpus
  exactly where they overlap: 103602 ctl deaths 137 / armed 108,
  103601 deaths 83/83, 103605 deaths 102/90, kills 6 → 5 on the
  diagnosis half. The instrument is stable across runs.

## Infrastructure notes (for the record, not the verdict)

- **No write flap in this run.** All 32 seeds wrote cleanly on the
  first attempt (both .log files 16 lines, both .err files empty,
  0 instrument errors).
- **OUTDIR passed as a bare dirname** both legs (the 0026Z nested-path
  trap avoided); files landed directly in
  `perseed-fleerepair2-rejudge2-b-ctl/` and
  `perseed-fleerepair2-rejudge2-b-arm/`.
- **Analyzer exit code 1** is its verdict field (NO-GO on the
  hardcoded 8-file instrument check), not an instrument failure — the
  analysis JSON was written normally. The original
  `fleerepair2-b-analysis.json` (fresh panel) and
  `fleerepair2-rejudge-b-analysis.json` (0026Z) were NOT overwritten:
  this run wrote `fleerepair2-rejudge2-b-analysis.json` via the
  `FLEEREPAIR2_ANALYSIS_OUT` env var.
- **No code changed; no new analyzer or test files** (branch
  instruments reused as-is; proof `scripts/test-fleerepair2-b.js`
  29/29 on tip `34a6a8411`).

## Limitations and next arms

1. **The arm is a LAND candidate on this verdict.** The fix works
   exactly as designed (B1 passes non-vacuously, B2 passes strict,
   deaths down, no regression). Whether it merges is the
   coordinator's call — the analyzer's verdict field disagrees with
   the prereg verdict on the file-count artifact (finding #2513), so
   the merge decision should cite this evidence file, not the
   analyzer's verdict field alone. If the coordinator wants the
   analyzer's field to agree first, the #2513 fix (parameterize the
   file-count check) is a one-line instrument change with its own
   proof leg — it touches no game code.
2. **The SEEK clause is not covered** (winPlanFightGate walks a
   standing-stage party into any wave-3+ beast once the trick is known,
   including a suburb) — finding #2503, still open.
3. **Pre-existing suburb plans** keep targeting the suburb; the gate
   only blocks new seeding/retargeting. A follow-up that retires live
   suburb plans needs its own prereg.
4. **The gate is silent.** No voice line marks a refused suburb hunt
   (see §Sense-testing; finding #2507 family). Measurement only here;
   a voice line is a build arm, not this run.
5. **The 103605 re-seed sieve:** with no suburb plan to hold,
   villagers re-meet the Suburb and re-trigger the (blocked) seed call
   7 times on one seed. Harmless (all blocked), but it means the gate
   fires repeatedly rather than once — worth a line in any follow-up
   that voices or logs the refusal.
6. **The 103612 survival is descriptive, not a claim.** One seed
   where not launching suburb hunts coincides with surviving and
   reaching wave 5. It offsets the 103602 loss exactly, which is why
   B2 ties — but a survival effect would need its own prereg and band.

## Files

- Prereg: `evidence/2026-11-17/sim-fleerepair2-rejudge2-b-prereg.md`
  (committed `34a6a8411` before any judged sweep)
- Evidence (this file): `evidence/2026-11-17/sim-fleerepair2-rejudge2-b.md`
- Ctl corpus: `evidence/2026-11-17/perseed-fleerepair2-rejudge2-b-ctl/`
  (16 files) — run log `evidence/2026-11-17/fleerepair2-rejudge2-b-ctl.log`
- Armed corpus: `evidence/2026-11-17/perseed-fleerepair2-rejudge2-b-arm/`
  (16 files) — run log `evidence/2026-11-17/fleerepair2-rejudge2-b-arm.log`
- Analysis: `evidence/2026-11-17/fleerepair2-rejudge2-b-analysis.json`
- Balanced panel: `evidence/2026-11-17/fleerepair2-rejudge2-b-panel-before.json.gz`,
  `evidence/2026-11-17/fleerepair2-rejudge2-b-panel-after.json.gz`,
  `evidence/2026-11-17/fleerepair2-rejudge2-b-panel.json`,
  `evidence/2026-11-17/fleerepair2-rejudge2-b-panel.md`
- No code changed; branch tip `34a6a8411` (prereg only, on code tip
  `cf7ae127c`).
