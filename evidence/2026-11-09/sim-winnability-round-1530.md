# sim-winnability-round-1530 — Loop B 1530Z adoption + closeout (1 arm KILLED at pilot + 1 arm LANDED + 1 arm DIAG-NO-GO LANDED, merged locally pending ship)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261109T1530Z.
Axis: scale-onramp / winnability chain (converging, NOT converged).
Base master at adoption: `ae7daf40c` (journey-landing r121). Master moved once
during the run before the sickness arm registered: Loop A landed
sim-sametick-a (`9aeb78712` + `0ba20ac1c`, same-tick duty-cure recorder fix,
GO 43/43) — zero overlap with this run's arms; the sickness tree is based on
`0ba20ac1c`. Loop A live on food-economy the whole run (1315Z claim:
sametick-adopt-a, wideduty-adopt-a) — NOT touched.

## Run-start closeout (stale-lock recovery)

The 1330Z B run was dead: lock `fleshout-loop-b-20261109T1330Z` created
14:30:07Z (~117 min old at recovery), tree heartbeats 15:16/15:21Z (66+/71 min
stale, past the 15-min guard), no writes since 15:19Z. Lock deleted, 1330Z
claim retired to `.DEAD` with a note. The 1330Z coordinator died mid-closeout:
the party-up pilot verdict existed only as a commit message (`fa3f53d75`,
an EMPTY commit — the pilot corpora were never committed, only untracked
files in the dead worktree) and the measureproof final panel was held for a
party-up landing that never came. This run adopted both arms; the adoption
verdicts below were verified by the coordinator re-running the instruments
on the dead worktree's files, not by taking the commit messages on trust.

## Arm 1 — sim-partyup-adopt-b: party-up before field fights (KILLED AT PILOT)

Prereg: `evidence/2026-11-09/sim-partyup-fieldfights-b-prereg.md` (dead
branch `sim-partyup-fieldfights-b`, commits `0834e3df3` prereg,
`a26a81a2e` build, `a5263c453` proof, `fa3f53d75` pilot-corpora message).
Policy-side lever, zero src/js: winseek + staging (`stageally` verbatim) +
rally on wave-4+ with allies + decline (direct `tbBarrierExit` push) of solo
wave-3+ fights. Fresh band 57301–57312; pilot 57301–57308, both legs, 150d
death-aware, no sitting / no door-walking on either leg.

### Pilot numbers (coordinator re-run of scripts/analyze-partyup-fieldfights-20261109.js on the dead worktree's untracked corpora — identical to the dead worker's commit-message numbers)

| metric | control (gate OFF = winseek) | armed (PARTYUP_B=1) | pre-registered bar |
|---|---|---|---|
| pre-90 wild deaths (PRIMARY) | 86 (n=110 pre-90) | 77 (n=103) | ≤ 0.6× control = 51.6 — FAIL |
| floor-reach | 5/8 | 3/8 | ≥ 4/8 — FAIL |
| non-scholar pre-90 deaths (guardrail) | 34 | 42 | ≤ 1.25× = 42.5 — PASS (barely) |
| true median survival | 94d | 79d | report |
| wave-4 kills (waveKillLog) | 7 | 6 | report |
| party presence (daily rows) | 7.1% (50/703) | 39.5% (263/666) | report |
| fights W / L / R / F | 34 / 89 / 23 / 0 | 40 / 64 / 28 / 34 | report |
| scholar pre-90 deaths (wild) | 76 (66) | 61 (54) | report |
| non-scholar pre-90 deaths (wild) | 34 (20) | 42 (23) | report |
| declines / fled / stuck / fought-out | 0 | 46 / 34 / 8 / 8 | report |
| rallies ok / false | 0 | 31 / 0 | report |
| staging invites / accepted / declined / not-offered | 0 | 41 / 15 / 14 / 12 | report |
| national / table sits / wins | 0 / 0 / 0 | 0 / 0 / 0 | report |
| wave-4 unlocks / wave-5 unlocks | 7/8 / 0/8 | 6/8 / 0/8 | report |

Control band split: wild 86 (78.2%), arena 8, starvation 5,
sickness-disease 10, other 1. Armed band split: wild 77 (74.8%), arena 4,
starvation 9, sickness-disease 12, other 1. Sit-verb calls 0 on both legs
(expected 0). G3 corpus integrity PASS 8/8 both legs (analyzer; snapshot
gaps d2→d4 etc. are the known instrument note, living-drop notes are
join-masked, neither fails a seed).

### Verdict: KILLED AT PILOT (per the prereg: pilot miss → kill, no confirm spend)

The mechanism worked and the village still died. Staging fired (15 accepted
invites), party presence rose 7%→40%, 46 declines were pushed (34 fled),
31 rallies landed, fights won rose 34→40 and lost fell 89→64 — and pre-90
wild deaths moved only 86→77, floor-reach FELL 5/8→3/8, median survival FELL
94d→79d. The lever moved deaths from the scholar (76→61) onto party members
(non-scholar 34→42, guardrail passed by half a death at 42 vs 42.5) without
saving the village. A party that stands with the scholar loses together:
fights with support still lost 36 on the armed leg (vs 23 on control), and
the armed leg's wave-4 fights were lost 28× with support present in 25.
The prefloor diagnosis ("the party is present only 10% of days") was true
and fixed, and fixing it did not fix the dying. The binding constraint is
not party presence at the fight — it is what the fight does to whoever is
in it. No confirm spend, no re-score, no tuning pass: the prereg's kill
rule was honored exactly as written.

Disposition: branch `sim-partyup-fieldfights-b` DELETED with all four
commits (prereg, build, proof, pilot message). Killed arms leave no trace:
no policy file, no driver, no analyzer, no corpora land on master. The
numbers above, verified by the coordinator's own analyzer re-runs, are the
record. Backlog line for the lever updated with the kill (sim-findings.md).

### Proof status (coordinator re-verified, not taken on trust)

- G1 det-gate: 51/51 PASS lines on re-run in the dead worktree
  (`node scripts/test-partyup-fieldfights-b.js`, log
  /tmp/partyup-proof-rerun.log). The 51 PASSes are real.
- BUT the test file itself exits 1: after the 51 legs, the trailing
  G2/G3-on-corpora section calls `PF.loadDir` at line 412 and `PF` is
  never defined in the file (the requires define `AN` and `A` only).
  `ReferenceError: PF is not defined`. The dead worker's 51/51 claim was
  true at proof-commit time (corpora dirs did not exist yet, so the
  section printed SKIP and exited 0); the crash only fires once corpora
  exist. The bug dies with the branch — but any future arm copying this
  test's trailing section will inherit it. Filed as a backlog instrument
  note (see Findings).
- G2 neutrality: NEVER RAN — the unrecorded controls
  (`perseed-partyup-fieldfights-b-unrec/`, seeds 57302 + 57309) were
  never generated; the worker died before G2. Moot for a pilot kill
  (killed on the primary metric, not on G2), recorded as not-run.
- G3 corpus integrity: verified independently via the analyzer (PASS 8/8
  both legs), not via the crashing test section.

### Sense-testing (coordinator read of the armed corpora)

57302 (59d, 12 pre-90 deaths, all wild): Tyrone dies day 1, Robinson to an
ambush day 7 — the village starts dying before it starts living. The burial
lines read coherently ("🕯️ Tyrone Shaw is dead — the wild. The village
stops. Somebody screams. Somebody else starts digging."). 57307 (90d, 17
pre-90 deaths): Jude dies day 8 to the wild. 57301 (147d, the longest-lived
armed village): Kennedy dies day 15 to `a wound that wouldn't close` — the
sickness runner-up is visible on the armed leg too, and the lever that was
supposed to save the village from the wild did nothing for the wound.
Two repetitions worth naming: the Codex kill-feed pollution the prefloor
evidence flagged is visible here as well ("📖 The Codex turns a page on its
own. Jude Kozlov is dead." fires beside the ledger line for the same death),
and the fireside line "A crow that watches too long and blinks too little —
I put it down today." repeats VERBATIM across seeds and days (57301 d6,
57302 d4, 57307 d7) — a stock line, not a conversation. Neither changes the
verdict; both are filed below.

### Village assessment in plain words

Eight villages were given a real party and a standing order to stop dying
alone — and they died together instead. The scholar lived a little longer
in the count and the village lived a little shorter in days: three of eight
reached the day-90 floor with a party, five without one. The fights got
fairer and the funerals got no fewer. The party is not the answer to the
wild deaths; whatever kills a scholar in a lost field fight kills their
friends standing next to them nearly as often.

### Metric review

- The primary metric was judged on the SAME-BAND control (86), not the
  prefloor 118, exactly as the prereg's metric-review note required. The
  fresh control landed at 86 pre-90 wild vs the prefloor 118 — a band
  effect (57301–57308 are kinder than 55201–55212), not a gate leak: the
  gate-off proof holds (control staging 0, declines 0, party presence
  7.1% — the one control seed with a party, 57302 at 49%, formed it
  through winseek's own play, not the lever).
- The 0.6× bar was the right bar: the armed leg's 0.90× is not a near
  miss, it is a different outcome (deaths redistributed, not removed).
  No re-score was attempted and none is proposed.
- The guardrail (non-scholar ≤ 1.25×) nearly failed at 42 vs 42.5 with
  control non-scholar deaths at 34 — on a band where the control number
  is small, the guardrail is a coin flip. Proposed for the NEXT run's
  prereg (not this one): judge the guardrail on the non-scholar WILD
  subset with an absolute cap, or on the scholar-share of pre-90 deaths,
  rather than a ratio over a small count.
- The floor-reach half did its job as designed: it caught a lever that
  saves scholars by never fighting (here, by declining into fewer
  floor-reaching villages) — the deaths-down/kills-down trade the prereg
  warned about showed up as deaths-flat/kills-flat with survival down.

## Arm 2 — sim-measureproof-refresh-adopt-b: measurement-proof refresh (LANDED)

Prereg: `evidence/2026-11-09/sim-measureproof-refresh-b-prereg.md` (dead
1330Z branch `sim-measureproof-refresh-b`, commits `0751ff81c` prereg,
`d3e32385d` trial evidence; adopted + rebased clean onto `89e9b9bf1` as
`5c4b3e738` + `7940d73f2`). The 1330Z worker's trial panel (verified green
on base `c6dd255b9`) was held for the party-up landing, per the prereg's
critical sequencing — and the party-up arm was KILLED (Arm 1 above), so
there was no game-code landing to wait on. The /tmp trial panel itself is
GONE (wiped by a sibling /tmp cleanup); its digest `6f15c045…` is a
cross-check only. The final panel was regenerated from scratch on the
final merged master.

- What was stale (verified on `c6dd255b9` before regeneration, and
  re-confirmed on the rebased branch): `test-measurement-proof-update.js`
  exit 1 ("Proof source inputs are not current");
  `test-measurement-workflow.js` 8/9 (the retained-neutrality check
  failed). The retained panel was `neutral-r162-rebased3.json.gz`
  (r162 third refresh, `4fcd2ecbb`, built on `8419eefa4`); the manifest
  diff showed exactly one moved input,
  `scripts/policies/scalecourt-traderoad-r113.js` (scale r113 landing
  `5b8ff908e`). The 598e21bdb panel was NOT reused (superseded per the
  Oct 29 rebuild header).
- Final regeneration (coordinator, in the adopted worktree):
  `node scripts/balance-panel.js --out
  /tmp/neutral-measureproof-refresh-b-final --seeds 7 --policies
  capable,risk-aware,socialite,winseek --days 150` — exit 0, 4 cases,
  0 cached jobs, ~90s. Panel: 4 rows (seed 7 × 4 policies × 150d),
  `sourcesStable: true`, neutrality all four cohorts `match: true`,
  0 warnings; `sourceHeadStart == sourceHeadEnd == 7940d73f2` (the
  rebased branch HEAD at generation time).
- Installed at `evidence/2026-11-09/neutral-measureproof-refresh-b.json.gz`
  (sha256 `ddac3956cfb293018d52545cd671488bb0ecdefd21e601b1006447f01a318a17`).
  `node scripts/balance-proof-update.js <panel>` accepted it; new
  `balance-proof.json` panelDigest `ddac3956…`, all eight normalized
  sources recorded (only `scalecourt-traderoad-r113.js` differs from the
  r162 panel's pointer set — the moved input is now current).
- Final verification on the rebased branch AND on merged master:
  `test-measurement-proof-update.js` **9/9 PASS**,
  `test-measurement-workflow.js` **9/9 PASS** (both, both places).
  Master tip re-checked immediately before the merge (`89e9b9bf1`,
  unchanged since regeneration) — no manifest input moved between
  generation and merge.
- Prereg bars: (a) PASS, (b) PASS, (c) PASS (manifest equality at
  generation time; sourceHeadEnd is the rebased branch HEAD, which
  becomes the merged master tip on ff-only merge), (d) PASS — zero
  gameplay change (`git diff --stat` vs base shows only
  `scripts/balance-proof.json`, the new panel file, and evidence).
- Landed as `7f32370af` (final-panel commit; safe-commit index clobber
  struck, repaired per the documented pipe — hash-object == HEAD blob
  for all three files, status empty + diff empty after). Merged
  --ff-only; proof pair re-verified 9/9 + 9/9 on merged master. Tree
  released done-merged, branch deleted.
- Wall numbers: n/a — no game change, no new sims beyond the proof panel
  itself (per the prereg).

## Arm 3 — sim-sicknessdiag-b: sickness-disease second measurement (DIAG-NO-GO, LANDED)

Worker arm, new this run (backlog line 1987 claimed by this run; the
second measurement after the party-up arm). Branch `sim-sicknessdiag-b`,
base master `0ba20ac1c`, rebased clean onto `27d32b4e7` by the worker
(proof re-run after the rebase). Commits (post-rebase SHAs):
`9f51d0da0` prereg, `c049dab61` instruments, `613d4efe4` evidence,
`89e9b9bf1` corpora. Proof `scripts/test-sicknessdiag-b.js` **58/58
green**, re-verified by the coordinator on the branch tip AND on merged
master. Zero src/js (`git diff HEAD -- src/` empty). Merged --ff-only
as `89e9b9bf1`; tree released done-merged, branch deleted.

Evidence: `evidence/2026-11-09/sim-sicknessdiag-b.md` (read it for the
full tables; the numbers below are the coordinator's summary of it).

### Verdict: DIAG-NO-GO — the fever channel is already healed; no medic/wound-care lever is supported

Fresh band 58201–58208, winseek, 150d death-aware. Pre-90 deaths n=99:
wild 79 (79.8%), arena 12 (12.1%), starvation 2 (2.0%),
**sickness-disease 5 (5.1%)**, other 1. The sickness share fell from the
prefloor band's 14.9% to 5.1%; the arena has overtaken it as runner-up
(secondary finding — different seeds/bases, needs its own DIAG before
anyone leans on it). All 5 sickness deaths are `a wound that wouldn't
close` with **no fever episode at all** — 0 wound-first, 0 sickness-first,
5 unlinked-verified. Wound_fever killed 0/36 episodes, tick fever 0/101.
The healer was present on 93.8% of village-days, and the Haven Medic Duty
(landed `d910dc6da`) cured 73 infections the night they started (73/73 vs
the game counter). The lever-naming rule failed on the mechanism, not on
noise (0 wound-first vs bar ≥50%; 0 healer-absent wound_fever episodes —
no contrast exists to measure). Kill taxonomy: the hypothesized mechanism
is CONCEPT-DEAD on winseek/current master; do not retry a medic/wound-care
lever without a new mechanism.

### Coordinator caveats (not in the worker's evidence — the worker's run overlapped Loop A's landing)

- **The corpora predate Loop A's wideduty landing.** The sweep ran on
  base `0ba20ac1c`; Loop A landed `sim-wideduty-a` (`48c93b22b`,
  duty-held 61%→88%) while the worker was running, and the worker
  rebased the branch (proof re-run) without re-running the sweep. The
  verdict direction is strengthened, not weakened, by wider duty
  coverage — the duty already cured everything it touched — but the
  measurement was not re-run on the widened substrate. Recorded here so
  the next reader does not mistake the base.
- **The evidence file cites a pre-rebase prereg SHA** (`fd95674de` in its
  "Files committed" section); the landed prereg commit is `9f51d0da0`
  (rebase-renamed). Content identical; the SHA in the evidence text is
  stale.
- **G1's unlinked bar is METRIC-BROKEN as written** (5 unlinked vs the
  ≤2 bar): it conflated verified attrition deaths with instrument gaps.
  The worker's proposed revision for the next run — split unlinked into
  unlinked-verified vs unlinked-unexplained, bar only the unexplained
  (this run: 0 unexplained) — is recorded in the evidence's metric review
  and is NOT re-scored here. The verdict stands as DIAG-NO-GO.
- **Three of the five wound deaths are fight-damage attrition**, not a
  disease burden: Kathleen (95→2 HP in one policy day), Xavier, Halima
  crashed from healthy morning HP during the day and died on the night's
  wound roll; the damage that set them up is not attributed in this
  corpus. The next run wanting the full chain should record
  `hurtVillager` damage per villager per day (filed as a finding).

### Wall numbers (winseek leg)

Floor-reach 4/8, national 0/8, table sits 0/8, wins 0/8, wave-4 unlocks
8/8, wave-5 unlocks 0/8, true median survival 86.5d. Sit-verb calls 0.

### Village assessment in plain words (from the worker's evidence, coordinator-endorsed)

Eight villages, all lost, none past 115 days — the same deed-seeking
villages the prefloor band buried, dying in the wild (79/99) and the
arena (12/99). But the sick beds tell a different story than a month ago:
fever is everywhere (146 episodes) and nobody dies of it. Someone is
always at the sick bed — a healer in camp 19 days out of 20 — and the
medic on duty cures a fresh wound fever before morning 73 times on this
band. The villages still die, but they die with their boots on, not in
their beds. The five wound deaths are the tail of the fighting: Nora,
bound up four days running while her health slid 95→17 because the
healer can treat only one person a day; Kathleen, healthy at breakfast
and dead by nightfall after something big took 93 health off her in a
single day. There is no medic-shaped lever left to pull on this
substrate, because the medics already won.

## Wall numbers (this run's judged corpora)

Party-up pilot, 16 configs (8 seeds × 2 legs), winseek, 150d death-aware:
national 0/16, table sits 0/16, wins 0/16, wave-4 unlocks 13/16, wave-5
0/16, median survival 94d control / 79d armed, floor-reach 5/8 control /
3/8 armed. Sickness pilot, 8 configs, winseek, 150d: national 0/8, table
0/8, wins 0/8, wave-4 8/8, wave-5 0/8, median 86.5d, floor-reach 4/8.
Measureproof: n/a (no game change). Pooled this run: national 0/24,
table 0/24, wins 0/24, wave-5 0/24 — the scale wall is unmoved by this
run; the work was killing a lever and closing a measurement, not moving
the wall.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'<partyup pilot corpora glob>' --metrics national,table,wins,exiled
--sweep-rows` — REFUSED BY DESIGN on recorder-corpus input ("all 8 rows
carry top-level anchorCommit, so they are sweep recorder rows, not runs").
No deviation signal; baseline NOT rolled. Same refusal class as the 1030Z
run. On the sickness corpora (coordinator re-run, --sweep-rows): LOUD
national 12→0, table 16→0, wins 16→0 — the same explained regime
artifact (winseek never sits or wins by design; baseline seeded from a
different regime), matching the worker's report exactly. Baseline NOT
rolled.

## Infrastructure

- Stale-lock recovery at run start (see above); Loop A landed sametick-a
  mid-run (see header) — zero overlap, no rebase forced on any arm.
- The dead 1330Z run's /tmp trial panel
  (/tmp/neutral-measureproof-refresh-b-trial/) is GONE (wiped by a
  sibling /tmp cleanup) — the measureproof closeout regenerates from
  scratch on the final master; its digest `6f15c045…` is recorded in the
  dead arm's evidence as a trial cross-check only.
- Loop A landed wideduty-a during the sickness arm (see Arm 3 caveats) —
  zero file overlap with this run's arms, no rebase forced on the
  coordinator's arms; the sickness worker rebased clean once.
- Safe-commit index clobber struck the measureproof final-panel commit —
  repaired per the documented pipe (hash-object == HEAD blob for all
  three files, status empty + diff empty after); commit verified correct.
  The sickness worker reports clobber on 3 of its commits, repaired the
  same way.
- Worktree registration was slow (~2 min for the sickness tree, not
  failed). No EPERM flap this run. `node scripts/check.js --quick` on
  merged master: [result appended at closeout].
- `node scripts/check.js --quick` on merged master: **296 passed, 4 failed
  in 363s** — failures: `test-mobile-combat-cadence.js` (Continue wrap),
  `test-occupation-panels.js` (CLI workflow),
  `test-phone-frame-proof.js` (phone receipt stale),
  `test-establishment-r20-fixes-20261020.js` (racks-full voicing gate).
  None attributable to this run: both landed arms are zero src/js and the
  failure areas (mobile combat cadence, occupation panels, phone frame
  receipts, establishment voicing) were untouched by either merge. The
  standing 280/7 profile from the 1030Z/1230Z runs has shifted (296/4) as
  master moved (sametick, wideduty, journey r163 landings); the 4 failures
  are pre-existing staleness/breakage on current master, not a regression
  from this run. NOT claimed green.
- Main tree clean at closeout; `git status --short` empty.

## Findings filed

- Party-up lever KILLED AT PILOT (backlog line updated; see Arm 1).
- Sickness-disease second measurement DIAG-NO-GO (backlog line 1987
  updated with the outcome; see Arm 3).
- Retained measurement proof staleness FIXED (backlog line updated:
  final panel landed `7f32370af`, proof pair 9/9 + 9/9 on merged master).
- [New] The arena is the new runner-up pre-floor killer (12/99, 12.1%).
- [New] Wound deaths are the tail of fight damage, not a disease burden
  (record `hurtVillager` damage per villager per day next time).
- [New] Healer rounds treat one patient a day — the triage choice has a
  price (steve-call).
- [New] Scholar-side cure channels never fire under winseek.
- DeathSays Codex-kill-feed pollution RE-CONFIRMED (existing open item;
  seen again on the sickness and party-up corpora).
- [New] 2026-11-09 — scale-onramp / instruments — PROOF-TEST TRAILING
  SECTION REFERENCES UNDEFINED `PF`: sim-partyup-fieldfights-b's proof
  test prints 51/51 G1 PASS then throws `ReferenceError: PF is not
  defined` (line 412, `PF.loadDir`) once the pilot corpora exist, because
  the file requires `AN` and `A` but never `PF`. The 51/51 claim was true
  at proof time (section SKIPped); the crash is latent until corpora
  land. Any future arm copying this test's G2/G3 tail inherits the crash
  — the tail must require the prefloor analyzer as `PF` or drop the
  section. (Adoption run fleshout-loop-b-20261109T1530Z, log
  /tmp/partyup-proof-rerun.log.)
- [New] 2026-11-09 — scale-onramp / narration — "A CROW THAT WATCHES
  TOO LONG" FIRESIDE LINE REPEATS VERBATIM ACROSS SEEDS: the same
  fireside line repeats word-for-word on different villages on different
  days (57301 d6, 57302 d4, 57307 d7) — stock line, not a conversation;
  low priority, filed for the narration lane. (Adoption run
  fleshout-loop-b-20261109T1530Z, party-up pilot corpora.)
## Next blanks, in order

1. **The arena decomposition** (new runner-up, 12/99) — its own DIAG on
   a controlled band before anyone leans on it; control the band/base
   confound (sickness band vs prefloor band).
2. **Flee-repair build** (Loop B queue item 2 — tbfinish wasted turns:
   failed flees that never succeed, zero-tile moves, rage re-pressed
   instead of striking). The party-up kill sharpens it: the decline
   mechanism worked but the fights still killed everyone in them; the
   wasted-turn class is the remaining fight-loop inefficiency with a
   named owner.
3. Fightblend attribution re-ask #4 — MIDDLE headline as current-master
   endpoint, or retire the single-seed attribution for a frozen-band seed
   set (from the 1230Z review; untouched this run).
4. Standing accumulation on gear-ready seeds (the 99107 pattern — Loop B
   queue item 3, still open).
5. Sit-becomes-win Steve-call; sweep table contract question (Steve-call);
   capstone readiness; trial-by-combat staging (Steve-call);
   Binding-never-fires follow-up; gating leg-4 recalibration (decision
   owed) — all carried from the 1230Z review.

## Convergence state

scale-onramp stays converging (NOT converged): the party-up lever — the
named answer to the biggest pre-floor killer — is killed at pilot with the
mechanism proven working and the outcome absent; the sickness half of the
pre-floor decomposition is now closed with a measured answer (the fever
channel is healed; the remaining wound deaths are fight-damage attrition);
the arena is the new runner-up and undecomposed; the floor-survival half
is still the binding half (3–5/8 reach it), national is 0/24 pooled,
wave-5 is 0/24, the full seat is still 0 everywhere. The retained
measurement proof is current again (9/9 + 9/9 on merged master).
food-economy stays converging (untouched; sibling Loop A). Claim deleted;
lock deleted. Evidence: evidence/2026-11-09/sim-winnability-round-1530.md
(coordinator commit) + evidence/2026-11-09/sim-sicknessdiag-b.md +
evidence/2026-11-09/sim-measureproof-refresh-b.md.
