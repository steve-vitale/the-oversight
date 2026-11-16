# sim-profilegate-a — the profile gate stops launched wave-4 parties (LEVER)

Run `fleshout-20261116T0446Z`, axis scale-onramp (converging, not converged).
Arm: **sim-profilegate-a** (LEVER, game code). Branch `sim-profilegate-a`,
worktree `~/workspace/worktrees/sim-profilegate-a`, base master `d39ce6e8c`.
Sibling arm sim-seedattach-a (DIAG, disjoint `seedattach-*` files) — untouched.
Loop B is live (aidgate-b + courtship-reconfirm-b) — untouched.

## Verdict: PILOT NO-GO

The frozen bar was: launched wave-4+ plans on ≥3 of 8 seeds (dawn-only
definition) AND the cost bar clean AND the instrument valid. The armed leg
launched **0** (frozen definition) on 0 of 8 seeds. Cost bar passes, instrument
valid, drift clean, proof 59/59 on all three tips — but the launch bar fails,
so the verdict is **NO-GO**. Per §14 the verdict is not re-scored against a
friendlier metric mid-run; the metric doubt is recorded under Metric review
below, and it is a real one: the gate fix DID launch two wave-4 parties, both
through mid-day commits the frozen definition does not count.

**Disposition:** the gate fix AND the seed call are both reverted
(commit `f5dee2331`). `src/` is byte-identical to the base `d39ce6e8c`.
Nothing lands in game code. Instrument, corpora, and this evidence remain.
Whether the seed call lands with a future gate fix is a separate coordinator
decision — the gate fix is nearly inert on master without a seed source
(dawnbid control: 0 instances in 8 seeds).

## The lever, in plain words

Dawnbid (0315Z) found that of 24 seeded wave-4+ plans, 8 were bid and
selected but never left — all 8 holders were non-rangers, because the daily
departure routine (`agencyTick` in `src/js/villager-agency.js`) skips anyone
who is not a wanderer or explorer before it ever tries to send them out.
Brian Otieno bid on 21 of 21 mornings over 40 days and never departed.
The design call (coordinator's, Steve can overrule): a bid-and-selected
`party_launch` plan is a commitment the morning scorer already made; the
profile gate should not veto it. The lever: a launched party plan bypasses
the non-ranger profile gate in the depart path. Only that gate changed —
every other launch condition stayed as it was (gear up at launch, sick stay
home, range-0 can't go, hurt below 70 HP needs medicine or a healer at camp).

## Before / after (identical seeds 100871–100878, 150d death-aware horizon)

Baseline: tableseat-nowait policy (`scripts/policies/tableseat-nowait.js`,
sha `a11a1abc672e`, wrapping leanlinkrescue `53f310aba27a`),
env `LEANLINKRESCUE=1 TABLESEATNOWAIT=1`, both legs. The subject only exists
with the vetparty seed call (reverted on master): BOTH legs re-land it
verbatim (13 lines from `ccf6d869c`, blob `a66d45a5e`, in
`resolveWildMonsterEncounter`, `src/js/game.js`). Control = seed call ON +
gate intact; armed = seed call ON + gate bypass. The judged difference
isolates the gate.

Seed-band freshness (verified 2026-11-16 by this arm): zero hits for
100871–100878 in `evidence/*.md`, `scripts/*.js`, and per-seed filenames;
only decimal-fragment false positives in old October corpus JSON under goal
`hidden_files/` (a kcal float, `"pantry": 100878`, `"dutyPreserved": 100876`).

### Bucket decomposition (analyzer `profilegate-a-analysis.json`)

| Bucket | Control (7 instances) | Armed (3 instances) |
|---|---:|---:|
| launched (frozen dawn-only definition) | 0 | 0 |
| target-killed | 0 | 0 |
| selected-blocked | 5 | 2 |
| bid-not-selected | 0 | 0 |
| plan-churned-before-dawn | 1 (holder-died) | 1 (retargeted) |
| candidate-not-bid | 1 (no-companion-party) | 0 |
| unknown | 0 | 0 |

Seed calls wave-4+ (analyzer count): control 21, armed 16. Classification:
classified share 1.0, unknown 0, 16/16 files parse, 0 instrument errors.
Instance count dropped 3 vs 7 on trajectory divergence — drift-clean (see
Drift), so this is small-n divergence, not an instrument fault.

### GO section (analyzer)

| Bar | Armed | Control | Pass |
|---|---:|---:|---|
| launched seeds (≥3 of 8 needed) | 0 | — | **NO** |
| launched total | 0 | 0 | — |
| median survival | 90d | 91.5d | ratio **0.984** ≥ 0.8 ✓ |
| starvation deaths, totals | 0 | 1 | 0 ≤ 1+2 ✓ |
| starvation deaths, arm-only (matched same-seed same-day) | 0 | 1 | 0 ≤ 1+2 ✓ |
| national at end (scaleRank ≥ 2) | 6/8 | 6/8 | — |

### Wall numbers

| | Control | Armed |
|---|---:|---:|
| wins | 6/8 | 6/8 |
| national at end (scaleRank ≥ 2) | 6/8 | 6/8 |
| national (standing ≥ 200, analyzer wall) | 0/8 | 1/8 (seed 100873, standing 416) |
| table seats | 0/8 | 0/8 |
| wave-4 reached | 8/8 | 8/8 |
| wave-5 reached | 0/8 | 1/8 (seed 100873) |
| median survival | 91.5d | 90d |
| villages lost | 1/8 | 2/8 |
| total deaths | 530 | 511 |
| scholar (player) deaths | 34 | 26 |
| starvation deaths | 1 | 0 |

Ever-national is NOT derivable from this corpus (no trustWeekly samples) —
the prereg's "end + ever" wording over-promised; only end-national is
reported, both ways (scaleRank and standing ≥ 200). Control launched 0, so
the prereg's "re-read as gate-adds-launches" clause was not triggered.

### Per-seed table

| Seed | Leg | Days | End | Won | Rank | Standing | MaxWave | Deaths | Starv | Scholar | v4 seed calls | Departs |
|---:|---|---|---|---|---|---|---:|---:|---:|---:|---:|---:|---:|
| 100871 | control | 89 | village-lost | no | regional | 199 | 4 | 36 | 0 | 4 | 0 | 0 |
| 100871 | armed | 89 | village-lost | no | regional | 199 | 4 | 36 | 0 | 4 | 0 | 0 |
| 100872 | control | 93 | won | yes | national | 199 | 4 | 48 | 0 | 4 | 0 | 0 |
| 100872 | armed | 90 | won | yes | national | 177 | 4 | 48 | 0 | 4 | 0 | 3 |
| 100873 | control | 95 | won | yes | global | 199 | 4 | 64 | 0 | 2 | 2 | 18 |
| 100873 | armed | 111 | won | yes | global | 416 | 5 | 67 | 0 | 2 | 1 | 11 |
| 100874 | control | 151 | survived | no | regional | 125 | 4 | 87 | 1 | 11 | 6 | 108 |
| 100874 | armed | 135 | village-lost | no | regional | 199 | 4 | 81 | 0 | 9 | 1 | 141 |
| 100875 | control | 90 | won | yes | global | 199 | 4 | 58 | 0 | 4 | 1 | 13 |
| 100875 | armed | 90 | won | yes | global | 199 | 4 | 43 | 0 | 2 | 0 | 5 |
| 100876 | control | 90 | won | yes | global | 199 | 4 | 133 | 0 | 3 | 10 | 43 |
| 100876 | armed | 90 | won | yes | global | 199 | 4 | 122 | 0 | 0 | 8 | 52 |
| 100877 | control | 93 | won | yes | global | 199 | 4 | 57 | 0 | 2 | 2 | 16 |
| 100877 | armed | 90 | won | yes | global | 199 | 4 | 67 | 0 | 1 | 6 | 19 |
| 100878 | control | 90 | won | yes | national | 199 | 4 | 47 | 0 | 4 | 0 | 1 |
| 100878 | armed | 90 | won | yes | national | 199 | 4 | 47 | 0 | 4 | 0 | 1 |

Seed 100871 is bit-identical on both legs (lost day 89, same 36 deaths).
Death causes, both legs combined shape: villager combat 247 → 240,
expedition 166 → 144, combat 56 → 67, the wild 22 → 18, sickness 6 → 8.
Villages die fighting, not hungry, on both legs.

### Balanced panel (instrument, not judge)

`scripts/build-profilegate-panels-20261115.js` → `profilegate-a-panel.md`:
decision **review_required**. Table win rate 0.75 → 0.75 (delta 0);
national scale access 0.75 → 0.75 (delta 0); village deaths per run
66.25 → 63.875 (no_material_signal); **community loss 0.125 → 0.25
(delta +0.125, regression_watch)** — the extra loss is seed 100874, lost
day 135 armed vs survived the full 150 days control, on the seed with the
most departures (141 vs 108). Player deaths per run: unknown (0/8 pairs —
the panel cannot read player-flagged deaths from this corpus; the
analyzer's own count is scholar deaths 34 → 26). The panel's
review_required is consistent with the NO-GO; the prereg threshold is the
judge, not the panel.

### Drift check D3 (`scripts/vetparty-drift-check.js`): CLEAN, NO PRE-LEVER DRIFT

First divergence on/after first lever day on every seed: 100871 identical;
100872 div 85 / lever 45; 100873 div 46 / 38; 100874 div 35 / 13;
100875 div 35 / 17; 100876 div 43 / 25; 100877 div 66 / 26;
100878 identical. All divergence is post-seed, so the armed/control
difference is lever-caused, not harness drift.

### Proof (`scripts/test-profilegate-a.js`): 59/59 green on all three shapes

- Not-built (`PROFILEGATE_SEED_CALL=off PROFILEGATE_GATE=off`): 59/59.
- Control anchor (`SEED_CALL=on GATE=off`): 59/59.
- Armed tip (`SEED_CALL=on GATE=on`): 59/59.
- Post-revert re-run (`off`/`off`): 59/59.
- Live gate fixture: staged non-ranger forager `gen_b39ldy9` at Haven with
  companion `gen_qemuplc` — execute NOT reached without a commit on either
  tip; with a `party_launch` commit, reached on the armed tip
  (`reached=true`) and not on the control tip. D1 repeatability and D2 wrap
  neutrality green (60d, seed 100871).

## Why the gate fix did not convert selections into (frozen-definition) launches

### The gate fix works — the matched pair proves it

**gen_gmvcrwd (August), seed 100877, target influencer, seed day 57.**
The seed was a real fight: 3 rounds, 2 allies, fled — "August's gear
absorbs 41." / "R1: Ratio hits August for 15 (55 left)" / "R1: August
strikes for 14 (836 left)".

- **Control:** mid-day (part-1) re-score commits `party_launch` on days
  65, 71, 72, 88 (same companion `gen_r6qd5mu`) — and **zero depart rows
  all run**. The commits were made and the gate vetoed every one.
- **Armed:** the same kind of part-1 commits on days 65 and 78 →
  **launches, both expeditions started, target influencer, companion
  gen_r6qd5mu**. Two real wave-4+ party launches enabled by the gate fix,
  with the identical commits in control producing zero departs. The gate
  was the difference.
- Armed day 86 dawn commit → **launch, inviter out**, companion
  `zoe_adams` NOT started (`companionBlock: hurt-no-medicine-no-healer`) —
  the untouched hurt-below-70 launch condition working as designed, not a
  gate failure.
- Armed day 70 dawn commit → **no execute row at all**. The reason is
  unrecorded: the recorder does not capture the `agencyTick` skip reason
  (away-at-tick-time / night / danger gate / engaged). That is a known
  recorder gap — see Blanks below.

### The dawn selections all died before the gate

**Diana Osei, seed 100876, target audit, seed day 48.** Her seed was also a
real fight: day 48 vs The Audit — "Diana walks straight into The Audit. No
avoiding it." / "Diana sees The Audit coming and nocks an arrow — the fight
opens at range (3 shots)." / "loosed — it takes The Audit for 8 (1236
left)." She bid and was selected on **4 dawns** (days 55, 72, 76, 87),
companions `gen_u9jax0c` then `gen_7q6rr7f` ×3. The census shows her **on
expedition (away from Haven) on all four days** — the departure routine's
expedition branch catches her before any depart logic, so the profile gate
is irrelevant on those days. She departed 16 times as a **companion** on
others' (mostly wave-3) plans; never as inviter for the audit plan after
the seed (only day 38, pre-seed, target null). Her day-76 depart row is
`normal` (execute called but the commit was not EXPEDITION-shaped that
tick). Her mid-day commits (part-2 day 58 while home but too late in the
day — no daytime tick left after part 2; part-1/2 days 59, 64, 67 while
away) were likewise never executable as inviter. Lesson: the scorer bids a
return trip for a holder who is already away; the holder spends most days
away as a companion on other people's trips.

**visjoin_106, seed 100874, target algorithm, seed day 112:** churned
before any dawn — retargeted, closed day 126, 0 scored dawns.

### The other control instances (for the record)

- gen_haos60c, eulogy, 100873: 4 dawn bids/selections (d59, 68, 83, 90),
  companion `gen_mizazuu`, all selected-not-executed.
- app_mgpspjwg627, herald, 100874: candidate-not-bid / no-companion-party
  (2 scored dawns, 0 bids); holder died day 143.
- james_okonkwo, algorithm, 100874: churned / holder-died (seed d109,
  died d112, 0 scored dawns).
- visjoin_138, nielsen (wave-5), 100874: 2 bids/selections (d149, 150),
  companion `visjoin_131`, selected-not-executed; plan deleted day 151.
- ruth_goldstein, audit, 100876: 2 bids/selections (d89, 90), companion
  `hannah_kim`, selected-not-executed.
- nikolai_volkov, audit, 100876: 1 bid/selection (d90), companion
  `hannah_kim`, selected-not-executed.
- gen_gmvcrwd, influencer, 100877: 1 dawn bid/selection (d86), companion
  `zoe_adams`, selected-not-executed.

Wave-3 plans launch constantly in both legs (seed 100876: 52 depart rows
armed vs 43 control; seed 100874: 141 vs 108) — the launch machinery is
busy; it is the wave-4+ chain that stalls.

## Sense-testing

Read the fight lines, not just the counts. The launched parties go
somewhere real, with real companions, and fight what they meet:

- Armed 100877 day 57 — August vs The Influencer (the seed flee):
  "August's gear absorbs 41." / "R1: Ratio hits August for 15 (55 left)"
  / "R1: August strikes for 14 (836 left)". 3 rounds, 2 allies.
- Armed 100877 day 67 — August vs The Eulogy, during the day-65 launched
  expedition window: "August walks straight into The Eulogy. No avoiding
  it." / "R1: August strikes for 16 (1078 left)" / "August's gear absorbs
  36." 1 round, 2 allies. The launched party went for the influencer and
  fought the Eulogy it met instead — the target had moved on; the
  expedition still resolved as a real fight.
- Armed 100877 day 88 — August vs The Reunion ("Big Ugly"): "August walks
  straight into Big Ugly. No avoiding it." / "R1: August strikes for 13
  (1297 left)" / "August's gear absorbs 41." 3 rounds, 2 allies.
- Armed 100873 day 66 — Lucas Brown vs The Audit: "Lucas walks straight
  into The Audit. No avoiding it." / "R1: Lucas walks in open-handed — and
  it goes wrong. It doesn't want peace. They're exposed, off-balance.
  (Walk In — failed)" / "Lucas's gear absorbs 43." 2 rounds, 2 allies.
- Armed 100876 day 75 — Enzo vs The Audit: "Enzo walks straight into The
  Audit. No avoiding it." / "R1: Enzo's eyes go red. Next 3 strikes hit
  twice as hard. (Rage)" / "Enzo's gear absorbs 51."
- Control 100873 day 58 — Miguel vs The Eulogy: "R1: Miguel strikes for 24
  (876 left)" / "Miguel's gear absorbs 33." / "R1: Final Chapter hits
  Miguel for 19 (81 left)".

No launched party departed to nowhere: every launched expedition had a
target and a companion, and the fights read like fights (gear absorbing
hits, abilities firing, rounds, flees). The two mid-day influencer
launches are the sense-check the frozen metric missed.

## What the village looked like (plain words)

The villages look the same on both legs. Six of eight win, reach national
standing or better, and die mostly fighting — on the road, in expeditions,
in village combat — not hungry. The gate fix did not change the shape of a
run: same wins, same standing, same survival (90 vs 91.5 days). The one
real difference is underneath: parties that used to be stopped at the door
now actually leave — two wave-4 parties went out after the influencer on
seed 100877 — but the dawn-only metric did not count them, and the extra
fighting cost one village (seed 100874 lost on day 135 where the control
village survived the full 150 days). The lever works mechanically; the
chain still stalls earlier, at the morning table, where the people who want
to go back are already out on somebody else's trip. And one seed (100873)
reached wave 5 on the armed leg where control stopped at wave 4 — a single
seed, no classified wave-4 plan launch behind it, so it is an observation,
not a lever claim; the armed village also won later (day 111 vs day 95).

## Blanks filled / documented

- **Day-70 blocker unrecorded** (armed 100877, gen_gmvcrwd): a dawn
  `party_launch` commit produced no execute row at all, and the recorder
  cannot say why. The `agencyTick` skip reason is not captured. Next
  diagnostic needs a skip-reason row in the recorder. Finding appended to
  `sim-findings.md`.
- **Companion-pool decomposition still open** (from dawnbid): only 1
  candidate-not-bid instance this run (no-companion-party, control
  100874), so the pool question is unmeasured at this n, not answered.
- **Veteran-death silence persists:** 475 `vetSays` lines across both legs,
  **0** mention a veteran dying — the same silence dawnbid found. Finding
  appended to `sim-findings.md`.
- **Dawn-selected holders are away as companions** (Diana: 4/4 dawn
  selections while on expedition): the next bottleneck is not the gate but
  the holder being out when the dawn they bid on arrives. Finding appended
  to `sim-findings.md`.
- **Wave-5 unlock, armed 100873:** standing 416, maxWave 5, won day 111
  global (control: standing 199, maxWave 4, won day 95). Drift-clean,
  divergence day 46 vs lever first acted day 38 — but 0 instances opened
  on that seed, so no classified wave-4 plan launch explains it. Report
  as observation only.

## Metric review (NOT a re-score — verdict stands NO-GO)

1. **The dawn-only `launched` definition undercounts.** The two real
   wave-4 launches (gen_gmvcrwd, days 65 and 78) came through mid-day
   refresh commits, which the frozen definition ignores. Under an
   any-commit definition the armed leg would read launched 2 (on 1 of 8
   seeds) — still short of the ≥3-seed bar, so the verdict would not
   change, but the next prereg should count launches on any commit (dawn
   or mid-day refresh) or it will keep missing the lever's actual effect.
2. **Ever-national is not derivable from this corpus** (no trustWeekly
   samples). Report end-national only, both definitions, and do not
   conflate the analyzer's standing ≥ 200 national (0 control / 1 armed)
   with scaleRank ≥ 2 national at end (6/8 both legs).
3. **Control launched 0**, so the prereg's "re-read as gate-adds-launches"
   clause was not triggered.
4. **Instance count 3 vs 7 on drift-clean divergence** is a small-n
   caution: the armed leg simply opened fewer plans, which is why the
   launch bar reads 0/8 rather than 0/3. A confirm round (12–16 seeds)
   would need a fresh band and a re-prereg, not a re-read of this pilot.
5. **`selected-not-executed` is still a composite bucket.** It holds
   away-on-expedition (Diana ×4), an unrecorded day-70 blocker, and
   control's five clean gate vetoes. Decomposing it needs the skip-reason
   recorder from Blanks #1.

## Files and commits

- Prereg: `2b6db6843` — `evidence/2026-11-15/sim-profilegate-a-prereg.md`
- Instrument: `43846a84e` — `scripts/profilegate-driver-20261115.js`,
  `scripts/analyze-profilegate-a.js`,
  `scripts/build-profilegate-panels-20261115.js`,
  `scripts/test-profilegate-a.js`
- Control anchor: `73e21f915` — seed call re-landed verbatim
  (blob `a66d45a5e`)
- Control corpus: `19c6cbb35` — `evidence/2026-11-15/perseed-profilegate-a-control/` (8 files)
- Armed anchor: `a56cce6f6` — gate fix (`src/js/villager-agency.js`,
  18 insertions, 1 deletion)
- Armed corpus: `9d6ff2d84` — `evidence/2026-11-15/perseed-profilegate-a-on/` (8 files)
- **Revert: `f5dee2331`** — seed call (13 lines, `src/js/game.js`) +
  gate fix (`src/js/villager-agency.js`) removed; proof 59/59 re-run
  post-revert; `git diff d39ce6e8c -- src/` empty (game.js blob back to
  `440ef1b40`, villager-agency.js blob back to `7376062da`)
- This evidence + `profilegate-a-analysis.json` + panel outputs
  (`profilegate-a-panel.json`, `.md`, `-before.json.gz`, `-after.json.gz`):
  this commit.
- Logs: `/tmp/profilegate-control.log`, `/tmp/profilegate-armed.log`
  (ephemeral, not committed).

## Process notes

- The index-clobber pattern from AGENTS.md struck after **all four**
  safe-commits on this branch (control corpus, armed corpus, gate fix,
  revert) — staged-deleted files / `MM` on the just-committed paths, the
  commit itself always correct. Repaired each time with
  `git ls-tree -r HEAD -- <paths> | git update-index --add --index-info`
  (with `-r` for directories), verified by `git hash-object` matching HEAD
  blobs. Also: safe-commit.sh does NOT accept directory paths — expand
  globs to explicit file lists. Full-tree `git status`/`git diff` grind
  for minutes under current box load; path-scoped git commands only.
- A failed directory-path safe-commit left an empty commit `e7c384f32`,
  removed with `git reset --soft HEAD~1` on this private branch only;
  reflog retains it.
