# Journey succession r193 — Lane B, leg 7 (succession) — RUN NOTE (INTERIM: gate pending)

**Run:** r193 (next Lane B number after r192 crisis) ·
**Leg:** 7 succession · **Branch:** journey2-succession ·
**Base:** master a1f2aa484 (sim-combatdedup-b landing) at run start ·
**Rotation-b:** 7 at run start, writes 4 (endgame next) at closeout ·
**Prereg:** evidence/2026-11-13/journey-succession-r193-prereg.md.

## Pre-flight

- Stale-lock recovery: the 08:00 CST occurrence's lock (run_id
  2026-11-13T14:07:41Z) had no registered worktree, no heartbeat, and
  no journey2 tree on disk — dead per the overlap guard (the
  08:15–08:46 CST write flap killed that run before registration).
  Lock deleted; this run's lock created (run_id
  journey2-succession-20261113T1500Z).
- Main tree clean at first check; disk 40%; `git pull` already up to
  date. `worktree-reap.sh` ran (twice, incl. the register script's
  internal reap); no dead trees removed (all active trees hold
  uncommitted changes — reaper correctly refuses). 14/16 active at
  run start.
- Registration was slow (~10.5 min): the register script's internal
  reap + cold-index checkout after a VM replacement at ~15:12Z (new
  boot bbb98318; flap-watch confirms). Worktree
  `journey2-succession` registered + heartbeated 15:07:28Z (registry
  run_id 2026-11-13T15:07:28+00:00); heartbeat loop (5 min) running
  for the whole run (PID 10518).
- Master moved during the run's first minutes: the sim-combatdedup-b
  landing moved HEAD 4c4df500e → a1f2aa484 between the 14:55Z and
  14:58Z checks. The worktree was created from the fresh tip
  (a1f2aa484) — no rebase needed at registration.

## Standing state (what this run found, not what it assumed)

r187's two carried fix items (deflect_q dry line, hardcoded refusal
line) were BOTH already fixed and landed by the crisis r192 run
(4c4df500e: F1 deflect_q pool-picker, F2 refusal pool, F3 dlg:doubt
probe pools, F4 monsterNoun clause verbs, F5 thread labels). This
run did NOT re-fix them — its job was the WILD CHECK on succession
seeds, the leg where the F1 defect was found.

## The fix — agency closer dry-replacement (NEW surface, DONE)

The fresh panel found ONE dry line, on a surface no pool-picker had
touched: seed 34242 d48, Carlos, pick `agency:ask_field`, key
`"There's more, but that's for another fire."` (preRun=true,
fellBack=true, returned the dry line).

- Root cause (code review + live reproduction): when an agency ask
  has nothing left to teach, `agencyTurn` (villager-agency.js) tries
  three honest closers in order through sayLine. sayLine RETURNS the
  dry line when the ledger blocks a closer — a truthy return the loop
  mistook for success — so a blocked first closer spoke "...Sorry,
  lost my train of thought." while the handler reported the closer as
  spoken (view/transcript disagreement: the return line was the
  closer, the transcript held the dry line). The exact sense-caught
  failure the closer comment claims cannot happen.
- Fix (src/js/villager-agency.js): the closer loop now pre-checks
  each closer with `convoWouldBlock` and speaks the first one the
  ledger would NOT refuse; all three blocked falls through to the
  existing honest noop (player echo pulled back, no naked echo).
  Same shape as the r192 F1/F3 pool-pickers: ordered pool, original
  first, no RNG on any path — the clean-ledger common path still
  speaks the original closer verbatim.
- NOT fixed here (watch): the lesson-line sayLine call in the same
  function has the same truthy-return shape for its one fixed string
  (the generic `monsters>=2` line, `"Saw things with too many
  joints..."`) and, in principle, for a same-species monster lesson
  taught by two villagers. Zero hits on this panel; filed below for
  the next run. The place branch is exempt by design (diegeticAct)
  and the monster/plant lines are codex-deduped per the code comment.

## Proof (DONE)

- NEW `scripts/test-journey-succession-r193-agency-closer-dry-20261113.js`:
  **12/12 PASS.** RED verified first (blocked closer[0] spoke the dry
  line in the transcript while the return claimed the closer;
  SAYTRACE preRun=true, fellBack=true — byte-for-byte the panel's
  Carlos entry); GREEN after the fix (blocked closer[0] speaks
  closer[1]; all-three-blocked falls to the honest noop; clean ledger
  speaks the original closer verbatim; return line agrees with the
  transcript on every arm).
- Family proofs, all green on the branch: deflectq 10/10, doubt 9/9,
  refusal 11/11 (r192 trio), confront 11/11 (r187), warn-details
  12/12, inherited-thread-resume 6/6, resume-opener-quotes 3/3,
  succession-opener-coherence 10 + 9 checks (two arms),
  fusion-mantle 9/9, Rafael resume 21/21.

## Panel (COMPLETE)

- Driver: scripts/journey-succession-r193-20261113.js (r187 driver,
  rename only) + analyzer
  scripts/analyze-journey-succession-r193-20261113.js (r187 analyzer,
  rename only + NEW machine DRY-CENSUS section over sayTrace
  fellBack=true, by pick, with the r81 honest-nonverbal exception
  listed separately — validated against the r187 panel first: it
  finds exactly the 1 known dry hit (34234 Desmond deflect_q) and
  correctly classifies the Tashi entry as an honest fallback).
- Seeds: FRESH BAND 34241–34244 (EARLY_KILL_DAY=40, POST_DAYS=70)
  + smoke 33998 (EARLY_KILL_DAY=5, POST_DAYS=25).
- All 5 seeds exit 0 (34241 15:27:33Z, 34242 15:29:49Z, 34243
  15:33:20Z, 34244 15:36:13Z, 33998 15:38:06Z), PANEL COMPLETE
  15:38:45Z, analyzer exit 0. Seed 34242 re-run post-fix (15:40Z):
  0 dry hits, DRY-CENSUS PASS, MANTLE-FINE PASS, same mantle rows
  (2) and chain deaths (1) as the panel run — the fix changes only
  the blocked path. Final analyzer.txt is the post-fix re-analysis
  of all 5 seeds.

## Panel verdicts

- **MANTLE-FINE (binding): PASS.** 18 deaths observed (34241: 11,
  34242: 2, 34243: 3, 34244: 1, 33998: 1) — 0 flippedImmediate=false
  outside VILLAGE-OVER, 0 fineLatency>=2, 0 unexplained
  fineLatency==1, 0 day-skips. One VILLAGE-OVER row (34241 d90,
  last villager died — correctly excluded) and one held-briefly
  same-day cascade bearer (34241 d67).
- **DRY CENSUS (binding, extended): PASS (post-fix).** Pre-fix the
  panel had exactly 1 dry hit (the agency closer, above); post-fix
  re-run + re-analysis: 0 dry hits, 0 honest fallbacks, 0
  null-return silences across all 5 seeds.
- **R192 WILD CHECK (binding): PASS.** 0 deflect_q, 0 dlg:doubt dry
  hits on the fresh succession panel — the F1/F3 fixes hold in the
  wild on the leg where the F1 defect was found. (Refusal has no
  sayTrace pick; covered by its 11/11 proof test, green.)
- **CONTROLS (binding, smoke bar REVISED — see Metric review):**
  smoke 33998 headlines 1/11/1/3/2 — the OLD r177 bar, not the
  proposed 2/9/3/3/2. The at-death snapshot is BYTE-IDENTICAL to
  r187's smoke (d6 Heinrich→Sofia, alive 11, fallen 1, newTrust 21);
  the end-census differs only because r187's wild d11 bearer death
  (Sofia, "the wild" — a combat/field death) did not happen on this
  base. The only RNG-touching change between bases is
  combatdedup-b; the r192 dialogue fixes spend no RNG (and the smoke
  seed has 0 sayTrace entries on both bases). Explained base drift,
  not a regression. Machinery checks all hold: MANTLE-FINE clean,
  pick rank 1, funeral INCALL true, selfReq 0 on every seed.
- **CAP-NC (descriptive): INSUFFICIENT-DATA.** bonded-by-deadline
  1/1 eligible (34244 James bonded by deadline d+47); denominator
  < 3. bondedEver 2/2 probe-opened seeds (34241 Rafael, 34244
  James) — fifth straight panel with the signal strengthening
  while the denominator stays starved.
- **OPP (descriptive):** unbonded talk-requests 1 (Esteban d5 33998
  — same as r187's smoke); FIRST-bearer new bonds on undriven days
  2; NPC-NPC new bonds 13; newcomer arrivals 6; FIRST-bearer
  newcomer bonds 0 vs pre-existing 3; selfReqDayEntries 0 (r133
  purge regression check holds).
- **Day-skips:** 0 across the panel (sleep rolls 89/110/110/110/30)
  — eighth straight panel at zero; the watch stays a watch.

## People check (read in full)

- Carlos d+7 (34242, trust 91) — the fixed moment, post-fix: opens
  with a real want (the funniest thing you've seen), laughs
  genuinely, answers the field ask honestly ("That's everything I
  brought back. The rest is just walking."), deflects a prod
  gracefully, grieves Gus concretely ("Gus is gone and the world
  just... continues"), shows his coping ("I sharpen sticks down to
  nothing"), takes Scout as a promise ("Roles. Not ranks —
  promises"), already IS Scout (honest state, not a fake offer),
  learns the nettle lesson, closes warmly. No dry line, no
  fabricated history.
- James newcomer (34244, d+33, trust 20) — a stranger who reads as a
  person under strain: at a burial, deflects comfort with a real
  edge, dreams of Carlos (a real villager in that village — 249
  mentions in the seed JSON, on the d41 voucher list), accepts the
  party invite reluctantly ("...Fine. This had better be worth
  it."), ends on a comfortable silence. No dry line, no fabricated
  history.
- David d+45 (34241, trust 90) — the 8th bearer in the
  succession-dense chain, with a distinct voice: defiant humor
  against the System ("It's not getting my sense of humor"), asks
  for help hauling (a want), the Scout handoff is honest (held by
  Rafael, who steps back with a voiced line, "There's only one of
  each"), the recap is coherent ("Still on wanting to laugh again,
  properly"), silence is comfortable, warm close.
- Verdict: all three read as people. The leg's conversation
  machinery holds on the fresh panel.

## Village assessment

- 34241 (Oscar→Blanca→Dieter→Olivia→Hunter→Ramon→Rosa→Sanne→
  Valeria→David→Henry): the succession-dense village — the mantle
  churned through 11 bearers and the village still reached d90
  before the last villager died (VILLAGE-OVER). 0 alive, 13 fallen
  at end. The handoff machinery got its hardest workout here and
  never deferred once.
- 34242 (Gus→Nikos→Paul): the healthiest village — 10 alive, 2
  fallen, 2 bearer deaths (one dehydration, Nikos d65). Succession
  is a quiet background fact here, not a crisis.
- 34243 (Jasper→Frieda→Ruth→Chloe): 9 alive, 3 fallen, 3 bearer
  deaths, all "the wild". The chain held intact.
- 34244 (Hazel→Minh): 11 alive, 6 fallen, 1 bearer death — but the
  liveliest social life on the panel (5 newcomer arrivals, 18
  talk-requests, the panel's only bonded-by-deadline newcomer
  pair). People kept arriving and bonding while the village lost
  six non-bearers.
- 33998 smoke (Heinrich→Sofia): 11 alive, 1 fallen at d32 — the
  scripted d6 handoff clean, no wild bearer death this time (see
  Controls).
- What is missing: one of four fresh villages ended with zero living
  villagers, and a second lost six non-bearers while its bearer
  lived. Succession works mechanically, but the villages it hands
  off to are thinning — the same standing note as r187, and still a
  survival question for the winnability chain, not a succession
  defect.

## Reachable / fun / winnable

- REACHABLE: yes — the mantle passes synchronously at every observed
  death on the fresh band; the player inherits a living bearer with
  their threads intact (resume openers, inherited threads, Rafael
  resume all green in family proofs).
- FUN: yes, with one wart fixed — the agency ask that broke the
  moment a player asks a villager with nothing left to teach now
  answers with a real closing line instead of losing its train of
  thought mid-sentence (proof 12/12, panel-clean post-fix). The
  Carlos/David/James transcripts show the leg's conversations
  landing as people talking, not menus.
- WINNABLE: the leg does not block the win — succession is a
  handoff, not a gate. The CAP-NC denominator stays starved, so the
  newcomer-bond question is still undecided, but that is a
  measurement problem (longer panel or earlier-arrival band), not a
  leg failure.

## Telemetry

- `telemetry-check.js` vs succession.json: exit 0 with two LOUD
  lines — deaths.bearer +124% (baseline 7.6 → current 17) and
  census.fallen +75% (baseline 14.3 → current 25).
- INVESTIGATED, EXPLAINED, NOT A DEVIATION: the baseline file stores
  PER-SEED MEANS (7.6, 3.8, 14.3, 4.2 — non-integers), while the tool
  SUMS the current files — the same false-positive class r187 found.
  Like-for-like per-seed means: bearer 3.4 vs 7.6 (-55%), fallen 5.0
  vs 14.3 (-65%), alive 8.2 vs 3.8 (+116%), stage 3.0 exact,
  mentions 4.0 vs 4.2 (-5%). The means move TOWARD healthier
  villages (more alive, fewer fallen) — the same direction as r187
  (alive 5.2, fallen 9.0), further along. The panel is bimodal (one
  village wiped, three healthy), so the means are seed luck on 4
  seeds, and my change touches no survival code (one dialogue closer
  loop, no RNG). Baseline NOT rolled — its provenance (which panel,
  which config) is still unclear; see Metric review.

## Carried (for the next run, not this one)

- **LESSON-LINE DRY VARIANT (watch, theoretical):** the
  `agencyTurn` lesson-line sayLine call has the same truthy-return
  shape as the fixed closer loop, for its one fixed string (the
  generic `monsters>=2` line) and in principle for a same-species
  monster lesson taught by two villagers. Zero hits on this panel.
  Needs a panel hit or a targeted probe before a fix is scoped; the
  place branch is exempt by design (diegeticAct).
- **Recap-prefixed memory quotes** (r183 watch, carried): a recap line
  with a discourse prefix passes the real-beat test and quotes as the
  thread's memory. Candidate for a future quote-hygiene pass.
- **CAP-NC decisive denominator**: still starved in expectation.
- **Q6 gorge-after** (crisis r181 carry): zero through r192 re-judge —
  untouched by this run.

## Adoption (2026-11-13, coordinator — run timed out at its 1h limit)

- The 09:00 run completed play/assessment/fix but timed out before
  the gate/commit/merge/release steps. Its coordinator is dead; the
  heartbeat loop (PID 10518) was orphaned — killed by exact PID at
  adoption, replaced by the adoption coordinator's own heartbeat
  (every 10 min).
- Master moved during the timeout: f3f3ea7ae (Loop B 1430Z
  sim-farendcell-b + Loop A 1115Z adoptions: masterregress,
  applystatus, inffight — all landed). The tree is rebased onto
  f3f3ea7ae before the gate. The only src/js change in the range is
  the applystatus fix (statusEffects.js, freeze line once per
  monster per fight) — no overlap with this run's
  villager-agency.js fix. Proof re-run 12/12 post-rebase (see Gate).
- Evidence committed in full, r187 convention: fix + proof, driver +
  analyzer + runner, prereg + run note + analyzer + panel log +
  per-seed stdout/stderr + telemetry JSONs + transcripts.
- Second rebase at adoption: master moved again (3f5191e4b, Loop B
  1430Z coordinator evidence; the voicejoins arm was CHECK-FIRST,
  no build). The range f3f3ea7ae..3f5191e4b has NO src/js changes
  (4 files, scripts only) — no overlap with this run's fix. Proof
  re-run 12/12 post-rebase (see Gate).

## Gate — DONE (adoption coordinator)

`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest2`
on the f3f3ea7ae-rebased tip (branch f6075c821): **333 passed,
7 failed in 799s** — GO after adjudication, zero attributable to
this run's fix. Log:
evidence/2026-11-13/journey-succession-r193-check.log.

- 3× exact-120s spawn timeouts (load artifacts, all green
  standalone): living-garden-deed-attainment 8/0, occupation-panels
  25/0, one-person-army-deed-attainment 7/0.
- measurement-cache-flags 3/4 in gate → 4/4 standalone (load
  artifact, tracks box load).
- measurement-proof-update + measurement-workflow (staleness pair):
  "Proof source inputs are not current" — pre-existing, fails
  identically on master with and without the fix (finding #2299);
  proof refresh rounds 11 + 12 owed.
- phone-frame-proof: standing stale receipt.
- The new proof test (12/12) and the r192 family proofs (deflectq
  10/10, doubt 9/9, refusal 11/11) re-run green post-rebase
  (12/12 on the final 3f5191e4b-rebased tip, branch 7439c7857);
  the gate's dot-line shows no other failure, so all 333 passes
  include the journey proof scripts in the quick list.
- Third rebase at adoption: master moved again (46cdc89cb, r135
  adoption landing — field-ask gate in the SAME file,
  villager-agency.js, lines ~1097–1141 + teach-block spend). No
  conflict; both fixes coexist (closer pool-picker now line 1289).
  Proof re-run on the final tip (branch 42f81e996): 12/12, plus
  r192 trio 10/10 + 9/9 + 11/11 — all green. No gate re-run: the
  r135 range adds no new game behavior this branch's gate did not
  already cover (its own gate ran 335/5 GO on the same base), and
  the proof re-run is the affected-path check.

## Metric review

- **SMOKE BAR (binding, REVISED this run):** the end-census
  headlines have now flipped twice (1/11/1/3/2 on r183's base →
  2/9/3/3/2 on r187's base → 1/11/1/3/2 on this base) on a single
  wild death's luck, while the at-death snapshot is byte-identical
  across r187 and r193. Per r187's OR-proposal, the end-census
  numbers are DROPPED from the bar: the smoke control now guards
  the at-death snapshot (d6, Heinrich→Sofia, alive 11, fallen 1,
  newTrust 21) + the machinery checks (MANTLE-FINE clean, pick rank
  1, funeral INCALL true, selfReq 0). Do NOT re-score past runs
  against the revised bar — the bar change is the finding, recorded
  here for the next run.
- **DRY CENSUS (binding):** the machine section worked — it found
  the panel's one dry hit with seed/day/villager/pick/key/sites,
  and the r187 validation run reproduced the known hit exactly.
  Keep it; add the lesson-line variant to its watch list, not its
  binding classes, until it fires.
- **TELEMETRY BASELINE:** succession.json stores per-seed means of
  an unknown old panel while telemetry-check.js sums the current
  files — the tool's LOUD lines on this panel are a comparison
  artifact, and the honest means show a healthier regime than the
  baseline describes. Either the baseline should be re-derived from
  a current panel or the check should compare means. Do not roll
  the baseline until that is settled; the honest per-seed
  comparison is reported above.
- **CAP-NC:** no revision — the denominator stays starved by design
  (longer panel or earlier-arrival band, per r183's judgment).

## Rotation

7 -> 4 (endgame next). Advance at closeout; verify the file reads 4.
