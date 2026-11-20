# sim-cellgate-a — NO-GO (PARTICIPATION) — full 8-seed pilot judged

**Arm:** sim-cellgate-a · **Loop A run:** fleshout-20261120T1015Z
**Type:** BUILD + measure — the CELL SUPPLY PER GUN lever for finding #2599
**Status: NO-GO, kind PARTICIPATION — the lever is REVERTED (game code leaves no
trace).** The pilot ran to 16/16 seeds (ctl 107051–107058, arm 107051–107058).
The analyzer judges the four frozen bars on the full band: bars 1, 3, and 4
pass; bar 2 misses by exactly one entry (2 vs floor 3). Per the frozen
ladder, a NO-GO reverts the game code before commit; instrument + evidence
commit only. The gate itself is PROVEN — bar 3 passes with the first armed
wave-4+ searcaster volley in this finding's history — but the armed-entry
pool is too thin for the floor, so the lever does not land.
**Prereg:** `evidence/2026-11-20/sim-cellgate-a-prereg.md` (commit
`c6715520a`, frozen 2026-11-20 ~11:15 UTC, amended ~11:17 UTC on the
fidelity check, before any judged sim).
**Branch:** `sim-cellgate-a`, base master ec0a42913.

## 1. The lever (frozen design, built as preregistered)

**CELLGATE=1** (default OFF). One shape only: the WAVE-GATED volley.
In `src/js/fieldFights.js` `fieldFight`'s volley block: when CELLGATE=1
and the lead's equipped ranged weapon is a searcaster and the monster's
wave is < 4, the volley is HELD — zero shots, zero cells spent, honest
hold line ("holds the Searcaster — saves the cells for a worthier
beast"). Wave 4+ searcaster volleys fire exactly as before. Every other
weapon is untouched at every wave. The hold needs cells to save
(`_ammoN > 0`) — a cell-less searcaster still says "no fusion cells"
honestly. `_cfAmmoBefore` is set before the gate, so the contact-finish
universe still sees the held ammo at contact.

**Control substrate (rebuilt, not re-argued):** the gunrate mechanism —
searcaster weight 4/18 in the tier-4 contest pool + expedition-holder
redirect (`_gunRateFighter`: current expedition +8, launches +2 each
capped +8, wave3Kill +4, wave2Kill +2, contestWin +1 each, roster-order
tie-break; own eligibility, NOT contestEligible) + 2-cell bundle with
the gun — env-gated **GUNRATE=1**, recovered from the gunrate prereg +
proof test and the searsupply lever commit (`6c4b75925`). The control leg
runs GUNRATE=1 only; the arm leg runs GUNRATE=1 + CELLGATE=1. The two
legs differ ONLY by CELLGATE.

**NOT built:** a bigger bundle; a cell resupply route; any village craft
for cells, ever — cells are alien tech.

**Draw-neutrality:** the substrate adds ZERO `Math.random()` calls (the
diff's only `Math.random` mention is a comment — verified by grep). The
gate itself skips the volley's RR()/lroll draws when it holds fire; that
is the lever's mechanism, disclosed in the prereg, not a silent shift.
CELLGATE unset = the old volley, byte-identical (proven by the gate
test's control checks and by the fidelity check, §3).

## 2. Proof (before any sim)

- `scripts/test-cellgate-a.js` **12/12 GREEN** on base ec0a42913 before
  the pilot: low-wave hold on-leg (0 shots, both cells kept, hold line);
  control low-wave burn off-leg (shots > 0, cells spent per loosed shot);
  wave-4+ fire on-leg (shots > 0, cells spent); bow volleys below wave 4
  with CELLGATE=1 (gate is searcaster-only); 0-cell searcaster says "no
  fusion cells", not the hold line. One test-design note, recorded here
  because it is a real engine quirk: the volley record reports PLANNED
  shots — if the monster dies on hit 1 the loop breaks after one loosed
  shot, so the spend checks count loosed lines in the log, not
  `rec.volley.shots` (the first run caught exactly this: 11/12, then
  fixed to 12/12). The analyzer's armed-volley counter reads
  `shots > 0`, so it is unaffected by the quirk.
- `scripts/test-gunrate-a.js` (unmodified, against the rebuilt
  substrate) **39/39 GREEN** before the pilot: all substrate assertions
  pass (defs, gun reweight on/off, trade + kill-loot untouched, redirect
  fixtures, bundle, control-leg identity, gear-up, volley armed/0-cell).
  During the flap the analyzer `--selftest` inside it crashed on a /tmp
  write (EPERM, 6/6 retries); after the restart cleared the flap it
  passes 45/45, and the full test reads 39/39.
- `scripts/analyze-gunrate-a.js --selftest` **45 passed, 0 failed** (after
  the flap cleared). The analyzer is the unmodified gunrate analyzer —
  its selftest is the same code that passed 45/45 this morning — and it
  reproduces the gunrate verdict exactly on the gunrate corpora (NO-GO /
  PARTICIPATION, 177 holder-days, 0/0, guardrail 4.55 vs 5.14).
- `scripts/cellgate-fidelity-a.js` **PASS** (see §3): the rebuilt
  substrate is faithful.

## 3. Pilot status (16 of 16 seeds — COMPLETE)

- **Band:** REUSED 107051–107058, per the task (paired before/after on
  identical seeds, one flag apart). Horizon 150d, death-aware. Competent
  verbatim policy. Substrate `VETREENGAGE=1 + PARTYSIZE4=1 + FLEEREPAIR2=1
  + FIGHTALLY2=1 + SENSEEXPED=1 + BOWOPEN=1 + SPEARGATE=1` on both legs;
  ctl GUNRATE=1, arm GUNRATE=1 CELLGATE=1.
- **Done:** ctl 8/8, arm 8/8. All 16 corpora valid, 0 instrument errors,
  census coverage 97–98% of lived days on every seed (analyzer coverage
  bar — see the analysis JSON).
- **Fidelity (prereg §14b item 5):** control-leg seed 107053 matches the
  gunrate-a arm corpus for seed 107053 on every SIMULATION field
  (`scripts/cellgate-fidelity-a.js` PASS). Three exclusion classes,
  each a runner/path artifact, not simulation state: per-process `seq`
  counters (the gunrate driver runs all 8 seeds in one process, so seed
  107053's seqs start at ~177; the wrapper runs one seed per process);
  worktree paths inside stack-frame strings (`frame`, `caller` —
  sim-cellgate-a vs sim-gunrate-a); top-level metadata (arm/run/mode/
  leg, gameSha, anchorCommit, cellgateOn/cellgatePresent/v4cellgate).
  The smoke control seed itself matches gunrate's 107053 row exactly
  (150d survived, w4, st199, 37 meetings).
- **Run notes (this run — the flap, twice):**
  - The host write flap (EPERM on fresh-file writes and git ref writes)
    was live from ~11:02Z. It blocked the prereg commit (safe-commit hit
    its 6-attempt EPERM retry loop and refused on a mass-deletion diff —
    the private index could not be built), blocked cloning the 1987-line
    gunrate driver, blocked the analyzer selftest's /tmp fixture writes,
    and blocked the worktree heartbeat's registry write. The pilot
    therefore runs through a thin wrapper,
    `scripts/cellgate-driver-wrap-a.js`, which requires the judged
    gunrate driver as a module and calls its `oneRun(seed)` per seed
    (the MODE/GUNRATE guards live only in the driver's main block, which
    does not run on require; the wrapper replicates them). The corpus
    content is identical to what the cloned driver would produce — the
    same oneRun, the same recorder — with ONE documented gap: the
    `v4cellgate` recorder (gate-held / low-wave-burn rows) is NOT
    available in the wrapper, so the gate's secondary counts are derived
    from the census + kill log instead (gunrate §6 method). The panel
    builder (`scripts/build-cellgate-panels-a.js`) is a full rename of
    the gunrate builder.
  - A machine restart at ~11:23Z (uptime 0 min) killed a waiting
    sleep+probe mid-run and CLEARED the flap: git ref probe OK, analyzer
    selftest 45/45. The prereg committed immediately after
    (`c6715520a`). The safe-commit left the known index-clobber pattern
    (prereg staged-as-deleted + untracked); repaired with `git ls-tree
    HEAD -- <file> | git update-index --add --index-info`, verified
    status clean of the artifact.
  - The flap RETURNED ~11:47Z, mid-pilot: the last five corpus writes
    failed and fell back to `@@FALLBACK` stdout dumps in the sweep logs
    (ctl 107057 + 107058; arm 107056 + 107057 + 107058), leaving 0-byte
    `.tmp` files. All five were recovered from the logs byte-verified
    (JSON parses, seed asserts pass, sizes match) and the stale tmps
    removed. No seed was lost, nothing was re-run.
  - The heartbeat for this tree failed twice on the flap (registry
    write EPERM, 11:22Z and 11:47Z). The tree is dirty (uncommitted
    lever work + instruments), which the reaper skips; no work was lost.
- **Analysis:** `evidence/2026-11-20/cellgate-a-analysis.json`
  (analyzer verdict NO-GO / PARTICIPATION). Panel:
  `evidence/2026-11-20/cellgate-a-panel-before.json.gz` /
  `-after.json.gz` + `cellgate-a-panel.md` (compare decision
  `review_required` — see §4, it does not overturn the prereg judge).

## 4. Verdict — NO-GO (PARTICIPATION)

| Frozen bar | Ctl (8 seeds) | Arm (8 seeds) | Bar | Result |
|---|---|---|---|---|
| 1. Searcaster-holder-days ≥ 40 | **177** | **194** | 40 | **PASS** |
| 2. Armed-holder entries ≥ 3 | 0 | **2** | 3 | **FAIL** |
| 3. Armed volleys fired ≥ 1 | 0 | **1** | 1 | **PASS** |
| 4. Guardrail (exposure-normalized) | deaths/engaged 4.55; median 150d | deaths/engaged **3.95** (bar ≤ 5.01); median **146d** (bar ≥ 120) | — | PASS |

**Why it is PARTICIPATION, and why it is a near-miss, not a failure of
the mechanism:** the gate did exactly what it was built to do. Holder
cell-days rose 58 → 182 (zero-days fell 119 → 12); four of five holders
kept their cells to the end of their holder window, and the fifth spent
his on a wave-4 volley (§6). Armed-holder entries rose 0 → 2, and bar 3
passes with the first armed wave-4+ searcaster volley in this finding's
history (Lautaro, day 117, 2 shots, 1 hit, 67 damage, vKill — §7). But
the armed-entry pool is thin: in 8 seeds the holders walk into a wave-4+
fight carrying cells exactly twice. Bar 2's floor (≥ 3) misses by one
entry. The binding constraint has moved again — from cell survival
(fixed by this arm) to holder PRESENCE at wave-4+ fights. The next lever
for finding #2599 is lead-side / presence-side (get the armed holder
into the wave-4+ fights, or the gun to the fighters already going), not
more supply and not a wider gate. A bigger bundle would only add a
second volley to a gun that already reaches the right fight once.

**The panel's `review_required` does not change the verdict.** The
balanced-panel compare flags "Community loss" as `regression_watch`
(+0.125: 4 villages lost vs 3). Village deaths per run actually FELL
(-2.25: 103.6 vs 105.9) and deaths per 100 calendar days fell (-2.41),
and every other metric is `no_material_signal`. Per §14 metric binding,
the panel is the instrument and the pre-registered threshold is the
judge; the frozen guardrail (exposure-normalized deaths/engaged 3.95 vs
4.55, medians 146d vs 150d) PASSES. The community-loss flag is the raw
count in panel clothing — recorded here as a watch item, not a re-score.
(The arm leg's extra lost village is 107055 at 139d vs ctl survived —
the same seed where Lautaro's volley fired; the village reached standing
595, higher than control's 570, and then died. Small numbers, watched,
not a verdict item.)

**Instrument bug found (not a verdict item):** the analyzer's
`armedLeads` counter is NEVER incremented — it is initialized to 0 and
read in the judge detail, but no code path adds to it (grep over
`analyze-gunrate-a.js`: init, read, selftest assert, output — no
increment). So "armed leads 0" in the analysis is an instrument artifact,
not a finding: the armed-detail rows themselves record `lead: True` for
Lautaro's volley fight (he LED it). The real armed-lead count on this
band is 1, read from `armedDetail`. The selftest even bakes the bug in
(it asserts armedLeads === 0 on a fixture whose armed entry is an ally).
This does not touch the verdict — bar 2 counts entries, bar 3 counts
volleys, both computed from other fields — but the next arm that counts
leads must fix the counter first. Filed in §11 / the backlog.

## 5. Wall numbers (full 16-seed band)

- National **0/16**, table not instrumented (null, never faked),
  wins **0/16**. Wave 4 reached 16/16, wave 5 reached 6/16
  (ctl 3/8, arm 3/8). Median survival 150d ctl, 146d arm.
  Community lost 3/8 ctl, 4/8 arm. Scale rank regional on all 16.
- Standing: ctl 175–630 (four seeds pinned at the 199 wave-4 floor),
  arm 175–650 (four at 199). The wall is unmoved — the pilot band
  carries the wall numbers, as expected; the lever was never a scale
  lever. The guardrail improvement (deaths/engaged 3.95 vs 4.55) is the
  only wall-adjacent movement, and it is small.

Per-seed (days / end / max wave / standing / holder-days /
wave-4+ meetings / engaged / armed entries):

| Seed | Ctl | Arm |
|---|---|---|
| 107051 | 142d lost w4 st199 hd0 m33 e27 a0 | 142d lost w4 st199 hd0 m33 e27 a0 |
| 107052 | 112d lost w4 st199 hd51 m34 e26 a0 | 112d lost w4 st199 hd51 m33 e26 a0 |
| 107053 | 150d survived w4 st199 hd0 m37 e31 a0 | 150d survived w4 st199 hd0 m37 e31 a0 |
| 107054 | 85d lost w4 st175 hd18 m6 e3 a0 | 106d lost w4 st175 hd39 m15 e12 a0 |
| 107055 | 150d survived w5 st570 hd28 m26 e24 a0 | 139d lost w5 st595 hd24 m27 e26 a1 |
| 107056 | 150d survived w4 st199 hd0 m19 e15 a0 | 150d survived w4 st199 hd0 m19 e15 a0 |
| 107057 | 150d survived w5 st630 hd64 m49 e30 a0 | 150d survived w5 st650 hd64 m59 e43 a1 |
| 107058 | 150d survived w5 st350 hd16 m32 e30 a0 | 150d survived w5 st350 hd16 m32 e30 a0 |

## 6. The cell-survival mechanism (why bar 2 is 2 and bar 3 is 1)

The gate held everywhere it was supposed to. Same five holders, same six
grants, same twelve cell grants on both legs (all contest-prize) — the
ONLY difference between the legs is the gate, and the census shows it:

| Holder (seed) | Grant day | Ctl cells | Arm cells | What happened on the arm leg |
|---|---|---|---|---|
| victor_lopez (107052) | 57 | days 58–99 (41d) | days 58–109 (51d) | kept both cells to the village's loss (112d); never spent them, never entered a wave-4+ fight armed |
| yuki_mori (107054) | 67 | day 68 only (1d) | days 68–106 (39d) | kept both cells to the village's loss (106d); on ctl she burned them day 69 on a wave-1 mirrormoth |
| app_mgpspjqc442 "Lautaro" (107055) | 106 | 0 days | days 106–117 (12d) | SPENT them day 117 on the wave-4 Rerun volley — the intended spend (§7) |
| naran_tumen (107057) | 86 | 0 days | days 87–150 (64d) | kept both cells to day 150; entered ONE wave-4+ fight armed, as an ally, while the lead died (§7) |
| catalina_reyes (107058) | 77 | days 77–92 (16d) | days 77–92 (16d) | identical window on both legs — see the open observation below |

Totals: holder cell-days 58 (ctl) → 182 (arm); zero-days 119 → 12.
On the control leg, 4/4 cell-loss days coincide with a low-wave led kill
(gunrate §6, reproduced here: victor day 100, yuki day 69, Lautaro day
106, naran day 87). On the arm leg there are ZERO low-wave burns — the
only cell loss in the whole band is Lautaro's wave-4 volley. The gate
is not a partial fix: below wave 4 the searcaster never fires at all.

**Open observation (not a verdict item):** catalina_reyes shows the
identical 16-day window on both legs (cells days 77–92, then the gun
itself gone day 93 — the gunrate §6 vanish, unrecorded sink, repeats
exactly). One gun in six vanishes this way on BOTH legs; the instrument
still does not track inter-villager gun hand-offs (gift, trade, theft,
drop). The next arm that counts guns should instrument transfers.

## 7. Sense testing (transcripts read, not just counted)

- Lautaro (app_mgpspjqc442, 107055) is the whole pilot in one villager,
  again — but this time the story ends differently. The System hands its
  expedition holder a loaded alien gun on day 106; he carries it, loaded,
  for eleven days past the moths and union reps that ate it last run;
  on day 117 he LEADS a wave-4 fight against The Rerun and the gun
  finally fires: "Lautaro sees The Rerun coming and nocks an arrow — the
  fight opens at range (2 shots). loosed — it takes The Rerun for 67
  (833 left). loosed wide — the arrow buries itself in the dirt.
  (spent)." He then fights six rounds, calls for help twice (Benoit,
  then Thabo, charge in), and KILLS it (mDealt 985, vTaken 26). The
  volley did not win the fight alone — it opened it, as designed. The
  narration is still bow-generic for an alien gun ("nocks an arrow",
  "lowers the bow") — the #2593 fix named the ammo, not the weapon's
  verbs. Filed as a backlog item, not a verdict item.
- Then the gun goes quiet again, honestly: Lautaro leads SEVEN more
  wave-4+ fights (days 120–130: timeslot, spoiler, network_note, editor)
  with the empty gun, and the log repeats "no fusion cells" seven times.
  The 2-cell bundle is still exactly one volley — the gate moved the
  volley to the right fight, it did not add a second one. The village
  loses him at day 139 (village-lost; the village reached standing 595
  first, higher than control's 570).
- Naran (107057, day 87) is the searsupply shape with cells: yara_haddad
  leads an Algorithm fight and dies in round 1 ("Recommended For You
  hits Yara for 14 (0 left)") while naran stands by as an ally with a
  loaded searcaster + 2 cells. The gun never fires because naran doesn't
  lead. Arming the holder is no longer the gap — putting the holder in
  front is.
- Victor and yuki (107052, 107054) are the quiet proof: on the control
  leg their cells burned in the first low-wave fight they led; on the arm
  leg they carry loaded guns for 51 and 39 days to the villages' losses
  without ever firing — not because the gate failed, but because no
  wave-4+ fight ever put them in it. A loaded gun the village never
  brings to the hard fight is the new shape of the same frustration.

## 8. How it finished

The pilot ran as two background legs (ctl PID 4955, arm PID 4957;
~27 min ctl, ~31 min arm, slower than gunrate's ~17 min under sibling
load + the flap's write retries):

```
cd ~/workspace/worktrees/sim-cellgate-a
VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 MODE=ctl OUTDIR=perseed-cellgate-a-ctl SEEDS=107051,107052,107054,107055,107056,107057,107058 RUN=cellgate-a node scripts/cellgate-driver-wrap-a.js > evidence/2026-11-20/cellgate-a-sweep-ctl.log 2> evidence/2026-11-20/cellgate-a-sweep-ctl.err
VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1 MODE=arm OUTDIR=perseed-cellgate-a-arm SEEDS=107051,107052,107053,107054,107055,107056,107057,107058 RUN=cellgate-a node scripts/cellgate-driver-wrap-a.js > evidence/2026-11-20/cellgate-a-sweep-arm.log 2> evidence/2026-11-20/cellgate-a-sweep-arm.err
```

Smoke first (control leg, seed 107053 only — the fidelity seed), then the
fidelity check, then the two legs above. Then:

```
cd ~/workspace/worktrees/sim-cellgate-a
node scripts/analyze-gunrate-a.js --ctl evidence/2026-11-20/perseed-cellgate-a-ctl --arm evidence/2026-11-20/perseed-cellgate-a-arm --out evidence/2026-11-20/cellgate-a-analysis.json
node scripts/build-cellgate-panels-a.js
node scripts/balance-panel.js compare --before evidence/2026-11-20/cellgate-a-panel-before.json.gz --after evidence/2026-11-20/cellgate-a-panel-after.json.gz --out evidence/2026-11-20/cellgate-a-panel
```

**Revert (NO-GO per the frozen ladder):** the game code was reverted
before commit — the lever leaves no trace in `src/`.
`src/js/contests.js`, `src/js/game.js`, and `src/js/fieldFights.js` were
restored to HEAD (`git checkout HEAD -- <files>`; the working-tree diff
vs HEAD is empty for all three). Verified: 0 `GUNRATE` / `CELLGATE` refs
in `src/`, `node --check` clean on all three files. The proof tests now
read **26/39** (gunrate — the 13 lever-on assertions fail against
reverted code, the 26 control / off-leg assertions still pass) and
**9/12** (cellgate — the 3 hold-specific assertions fail, the 9 control /
identity / data assertions still pass) — the same record the gunrate
NO-GO arm left for its own test. Neither test is on the green list.
`node scripts/check.js --quick` after the revert: **335 passed, 9 failed
in 1441s** (exit 1; `evidence/2026-11-20/cellgate-a-check-quick.log`).
The 9 failures, by class: five 120s timeouts (godpath
living-garden-deed-attainment, occupation-panels,
one-person-army-deed-attainment, trust-observer-neutrality, and
test-capable-bot-20261014 — the slow-godpath class, slower this run
under sibling load: 1441s vs gunrate's 778s); three stale retained
proofs (godpath measurement-proof-update, measurement-workflow, and
phone-frame-proof — the retained-proof class); one measurement-cache-flags
(4 assertions, 86.2s, observer/cache identity). None touches the arm's
area — no contest, loot, prize, searcaster, cell, or volley test failed
— and the reverted `src/` is byte-identical to base ec0a42913, so none
is attributable to this arm. The gunrate arm's post-revert record on
its base was 339/5; this base runs 344 scripts.

## 9. Metric review (§14)

- No bar was re-scored; the verdict is the analyzer's frozen-bar judge
  on the full band. Bar 4's exposure-normalized guardrail held with room
  (3.95 vs 4.55 deaths/engaged; medians 146d vs 150d), and the panel's
  community-loss flag (§4) is the raw-count metric resurfacing in the
  panel instrument — it must not be re-introduced as a guardrail at
  judging time.
- The metric that proved wrong is bar 2's floor as a measure of THIS
  lever: armed entries measure holder PRESENCE at wave-4+ fights, which
  the gate never touched (it only decides whether the gun fires once
  there). The gate moved the volley bar (bar 3: 0 → 1) and the cell
  census (58 → 182 cell-days) decisively, but bar 2's floor (≥ 3)
  demands three armed ENTRIES — a presence count — from a lever that
  only governs firing. The revision for the next run is a lever that
  moves presence (lead-side: the armed holder into wave-4+ fights), and
  a bar that counts armed LEADS alongside entries (with the counter
  fixed — see §4's instrument bug), so a presence failure shows up
  before the 3-entry floor does.
- Bar 1's floor (40) passed 4.9× — the weight overshot the floor's
  purpose again (gunrate passed it 4.4×). The binding constraint has
  moved downstream of the grant rate AND of cell survival; neither a
  further gun-rate increase nor a bigger bundle is the next lever (see
  §4). The redirect heuristic is vindicated as far as it goes (every gun
  reached a lead-weighted villager; the expedition-holder term decided
  the recipient on the observed grants) — but the recipient rule cannot
  fix a presence gap: the village must bring the holder to the fight.
- The fidelity check's exclusion classes (per-process `seq`, worktree
  paths in strings, top-level metadata) are the honest form of the
  "byte-identical" check — the as-drafted wording was amended before the
  prereg commit because whole-file byte identity is unachievable when
  the metadata differs by construction (prereg §14b item 5, amendment
  note). The amendment was made before the commit and before any judged
  sim; it narrows the check to simulation state, it does not weaken it.

## 10. Village assessment (plain words)

Ten of the sixteen villages lived to day 150; six died out (three per
leg... four on the arm leg, three on control — 107055 tipped the count —
at 85–142 days). Every village reached wave 4; six reached wave 5; none
reached national, none won. Most villages sit pinned at standing 199 —
the wave-4 floor — for the whole back half of the run: they survive,
they fight, they do not climb. The two strongest villages (arm 107057 at
650, ctl 107057 at 630) are the ones that kept a full 150 days.

People die out in the wild and in fights, not at home: the arm leg's
deaths per engaged meeting actually fell (3.95 vs 4.55), and median
survival is nearly identical (146d vs 150d). The gun no longer goes off
at moths. Five villages in eight finally saw the System's rarest weapon
stay loaded — up from one in eight carrying it empty — and one of them
watched it fire at the monster it was made for. But four of those five
carried it loaded for weeks and never once stood in front of a wave-4
beast with it, and the fifth fired it once and then carried it empty
through seven more hard fights. The supply line works now. The village
needs to bring the gun to the fight.

## 11. Files

- Prereg: `evidence/2026-11-20/sim-cellgate-a-prereg.md`
  (commit `c6715520a`)
- Lever (REVERTED — no trace in `src/`):
  `src/js/contests.js`, `src/js/game.js`, `src/js/fieldFights.js`
  restored to HEAD (see §8)
- Instrument (committed, this run): `scripts/cellgate-driver-wrap-a.js`
  (thin wrapper reusing the judged gunrate driver as a module),
  `scripts/test-cellgate-a.js` (12/12 pre-revert on ec0a42913;
  9/12 post-revert, hold assertions only),
  `scripts/cellgate-fidelity-a.js` (field-exclusion fidelity check,
  PASS), `scripts/build-cellgate-panels-a.js` (full rename of the
  gunrate panel builder). Reused unmodified: `scripts/gunrate-driver-a.js`
  (substrate proof via `scripts/test-gunrate-a.js`, 39/39 pre-revert,
  26/39 post-revert) and `scripts/analyze-gunrate-a.js` (frozen-bar
  judge; selftest 45/45).
- Sweeps (complete corpora):
  `evidence/2026-11-20/cellgate-a-sweep-ctl.log` / `.err`,
  `evidence/2026-11-20/cellgate-a-sweep-arm.log` / `.err`,
  `evidence/2026-11-20/perseed-cellgate-a-ctl/` (8 files),
  `evidence/2026-11-20/perseed-cellgate-a-arm/` (8 files)
- Smoke (pre-pilot, control leg, seed 107053):
  `evidence/2026-11-20/cellgate-a-smoke-ctl.log` / `.err`,
  corpus in `evidence/2026-11-20/perseed-cellgate-a-ctl/`
  (cellgate-a-s107053-cellgate-a-ctl.json — the pilot's ctl leg reused
  the smoke file for 107053; the pilot ran the other 7 ctl seeds)
- Analysis + panel: `evidence/2026-11-20/cellgate-a-analysis.json`,
  `evidence/2026-11-20/cellgate-a-panel-before.json.gz`,
  `evidence/2026-11-20/cellgate-a-panel-after.json.gz`,
  `evidence/2026-11-20/cellgate-a-panel.json`,
  `evidence/2026-11-20/cellgate-a-panel.md`
- Quick check (post-revert, backgrounded during evidence writing):
  `evidence/2026-11-20/cellgate-a-check-quick.log` / `.err`
- This evidence file

## 12. Findings for the backlog (append to sim-findings.md)

- [open] 2026-11-20 — instrument — `armedLeads` counter in
  `scripts/analyze-gunrate-a.js` (and its clones) is NEVER incremented:
  initialized 0, read in the judge detail, asserted 0 in the selftest,
  but no code path adds to it. The next arm that counts armed leads must
  fix the counter first (cellgate evidence §4).
- [open] 2026-11-20 — narration — the opening-volley log lines are
  bow-generic even for the searcaster ("nocks an arrow", "lowers the
  bow"); #2593 fixed only the no-ammo line. A searcaster volley should
  read as an alien weapon firing (cellgate evidence §7).
- [open] 2026-11-20 — items — catalina_reyes loses the GUN itself on
  day 93 on BOTH legs (gunrate §6 + cellgate §6, identical window);
  the sink is unrecorded (gift / trade / theft / drop). The next arm
  that counts guns should instrument inter-villager transfers.
- [open] 2026-11-20 — participation — finding #2599's next lever is
  lead-side / presence-side, not supply: holders keep cells 182/194
  days but enter wave-4+ fights armed only twice in 8 seeds. Get the
  armed holder into the wave-4+ fights (or the gun to the fighters
  already going). A bigger bundle is NOT the next lever (cellgate
  evidence §4).
