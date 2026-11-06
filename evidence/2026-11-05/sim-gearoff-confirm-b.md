# Gearoff-confirm-b — confirm the GEAR toggle on FRESH seeds 99821–99832 (Loop B, 2026-11-06)

Run: fleshout-loop-b-20261106T0130Z, arm sim-gearoff-confirm-b. Prereg:
evidence/2026-11-05/sim-gearoff-confirm-b-prereg.md (committed beafc5018)
— it binds this run; the prereg was NOT rewritten and the seed band was
NOT re-picked. 26 probe runs total: 2 DET + 12 V-full (pass 1) + 12
gearoff. All probe .err files empty.

## Verdict (prereg-gated, not re-scored): GO
- STAGE 0 GATE: PASS. (a) DET=1 byte-identical on seed 99821. (b) V-full
  sweep on all 12 fresh seeds (pass 1 — the judged baseline; NO pass 2,
  per the pre-registered staging deviation below).
- STAGE 1 CONFIRM — gearoff GO: the screen signal reproduces. Signal
  seeds 6/12 (GO bar: >=2): S1 class flips on 3 seeds (2 losses, 1
  rescue), S3 trajectory swings on 4 seeds; union 6. S2 fired on 1 seed
  (descriptive only, not deciding). Every flip is mechanism-traced below.
- The rescreen signal (1 flip + S3 on 4/8 seeds) reproduces on fresh
  seeds at the same order of magnitude. Ally gear parity is a live lever:
  it moves whole villages, in both directions, on this block too.

## Staging deviation (pre-registered, explicit — in the prereg before any sim)
NO full V-full pass-2 repeat. Justification recorded in the prereg: the
rescreen proved byte-identical repeat on this identical pinned base +
probe (8 seeds); DET re-verifies determinism on this band's first seed;
a 12-seed pass 2 would cost ~30 min and add no new information
(determinism is a property of the code, not the seeds). This is the
prereg's own staging, not a quiet change.

## Pinned-base method (as prereg)
- Pinned base ff1725835 (arm-2 d8f334da8 verified an ancestor, so arm 2
  is ON in V-full). Branch sim-gearoff-confirm-b holds evidence/scripts
  only; game code was never committed.
- Pinned checkout: `git checkout ff1725835 -- src index.html scripts`,
  then the 7 tooling scripts copied back from HEAD. Two post-base
  src/js files (villager-goals.js, win-plan.js) removed from worktree +
  index for the sim phase (inert — the pinned index.html does not
  reference them — but they would fail the alloff byte-equality check).
- Alloff construction check (before any sim): V-alloff verified
  byte-equal to pre-arm2 blobs (`git diff d8f334da8^ -- src/js/` empty)
  — PASS. Reverts: sigoff 3 hunks, gearoff 7 hunks, moraleoff 1 hunk,
  trickoff 1 hunk + GEAR/MORALE header comment lines. Restored to the
  pinned tree after the check.
- Probe: scripts/probe-toggle-confirm-gearoff-b-20261106.js =
  probe-toggle-rescreen-20261105.js with ONLY the PLAN map changed to
  99821–99823 waves / 99824 forcedrift / 99825–99832 wavesnw (verified
  by diff: header comment + PLAN const + its two comment lines only).
  Classifier + proof script are seeds-parameterized copies of the
  rescreen pair (default seeds 99821–99832), plus two changes: a
  `confirm` mode judging the prereg bar (GO iff S1-or-S3 fires on >=2
  of 12 seeds; S2 descriptive only) and a `survived` class for
  endReason=survived (alive at the 180d horizon without sitting — named,
  never lumped under "other"). The confirm mode was validated against
  the rescreen corpus before any sim: it reproduces the rescreen
  gearoff verdict exactly (GO, signal 5/8, S1=1, S3=4).
- Env for every sweep: FULLSEAT=1 VETCOMMIT=1 CAPABLE_GREEDY=1
  ARMORYDRIVE=1 CAPABLE_VETGUARD=1 TELEMETRY_FULL=1 RELAYGREY=1; 180d
  death-aware horizon; SEEDS env set explicitly on every invocation.
- Seed-band freshness re-verified by this worker before any sim: 0
  exact-boundary hits for any of 99821–99832 in all dated preregs
  (evidence/*/sim-*-prereg.md), in goal hidden_files/ *.md, and in file
  names; the only exact-boundary hit in hidden_files/ *.json is the
  coordinator's own claim file naming this band as the assignment. The
  loose `9982` hits in 2026-10-27/28/30 preregs are the 4-digit seeds
  9981–9988, not this band.

## Stage 0 — determinism gate: PASS
- (a) DET=1 on seed 99821 (2 x 120d of the pinned tree): DET GREEN
  byte-identical. Log: evidence/2026-11-05/stage0-det.log (err empty).
- (b) V-full pass 1 (12 fresh seeds): the judged baseline below.
  Integrity 12/12, err empty. No pass 2, per the pre-registered
  staging deviation above.

### V-full full block (12 fresh seeds, the judged baseline — pass 1)
| seed | plan | class | sat | uw | fights | kills | vDie | days | end scale |
|---|---|---|---|---|---|---|---|---|---|
| 99821 | waves | scattered | — | 3 | 0 | 0 | 0 | 64 | village |
| 99822 | waves | won lesser | d97 | 4 | 4 | 0 | 0 | 97 | global |
| 99823 | waves | won lesser | d99 | 4 | 9 | 0 | 3 | 99 | regional |
| 99824 | forcedrift | won lesser | d90 | 4 | 1 | 0 | 0 | 90 | global |
| 99825 | wavesnw | scattered | — | 4 | 5 | 1 | 1 | 91 | regional |
| 99826 | wavesnw | scattered | — | 4 | 4 | 0 | 2 | 146 | regional |
| 99827 | wavesnw | scattered | — | 3 | 0 | 0 | 0 | 36 | village |
| 99828 | wavesnw | won lesser | d90 | 4 | 8 | 1 | 1 | 90 | regional |
| 99829 | wavesnw | scattered | — | 3 | 0 | 0 | 0 | 69 | village |
| 99830 | wavesnw | scattered | — | 3 | 0 | 0 | 0 | 83 | regional |
| 99831 | wavesnw | scattered | — | 3 | 0 | 0 | 0 | 97 | regional |
| 99832 | wavesnw | won lesser | d90 | 4 | 11 | 0 | 2 | 90 | global |
Tally: lesser 5/12, full 0/12, survived-to-horizon 0/12, wave-4
unlocked (uw>=4) 7/12, wave-5 reached 0/12, median survival 90.5d
(sorted days 36/64/69/83/90/90/90/91/97/97/99/146; classifier
upper-median 90d). Note this block is much weaker on wave-4 killing
than the rescreen block: only 2 wave-4 kills in total across 12 seeds
(99825: 1, 99828: 1), and no seed reaches wave 5 at all — so the
confirm's S3 kill-swing bar can only fire if gearoff ADDS kills, or via
fight-count swings.

## Stage 1 — gearoff confirm (12 runs vs same-base V-full pass 1)
Signal = S1 (class flip) OR S3 (wave-4 census kill swing >=2 or fight
swing >=3) on a seed. GO iff signal fires on >=2 of 12 seeds. S2
(|sat-day Δ| >= 9) recorded, descriptive only.

### gearoff — GO (signal 6/12, S1 3, S3 4, S2 1)
| seed | V-full | gearoff | flip? | sat Δ | kills | fights |
|---|---|---|---|---|---|---|
| 99821 | scattered d64 | scattered d174 | no | — | 0→0 | 0→6 (S3) |
| 99822 | won lesser d97 | won lesser d119 | no | +22 (S2) | 0→0 | 4→4 |
| 99823 | won lesser d99 | won lesser d91 | no | −8 | 0→1 | 9→9 |
| 99824 | won lesser d90 | won lesser d91 | no | +1 | 0→0 | 1→5 (S3) |
| 99825 | scattered d91 | scattered d90 | no | — | 1→0 | 5→4 |
| 99826 | scattered d146 | scattered d67 | no | — | 0→0 | 4→0 (S3) |
| 99827 | scattered d36 | scattered d36 | no | — | 0→0 | 0→0 |
| 99828 | won lesser d90 | SCATTERED d90 | YES — loss | — | 1→1 | 8→12 (S3) |
| 99829 | scattered d69 | scattered d27 | no | — | 0→0 | 0→0 |
| 99830 | scattered d83 | WON lesser d99 | YES — rescue | — | 0→0 | 0→2 |
| 99831 | scattered d97 | scattered d62 | no | — | 0→0 | 0→0 |
| 99832 | won lesser d90 | SCATTERED d174 | YES — loss | — | 0→1 | 11→12 |
S1 3/12 (gross: 2 losses, 1 rescue), S2 1/12 (99822, +22 — descriptive
only), S3 4/12 (99821, 99824, 99826, 99828). Signal seeds (S1 or S3):
99821, 99824, 99826, 99828, 99830, 99832 = 6/12. Tally: lesser 4/12
(net −1 vs V-full — but net wins alone would understate the lever:
gross flips are 3, two of them losses and one a rescue), scattered 8/12,
wave-5 0/12, median 90.5d (classifier upper-median 91d).

## Scale-wall numbers (judged corpora, plain words)
- V-full (12): lesser wins 5, full seat 0, survived-to-horizon 0,
  national-or-better at end (global scale) 3 (99822, 99824, 99832),
  wave-4 unlocked 7/12, wave-5 reached 0/12, median survival 90.5d.
- Gearoff (12): lesser 4, full 0, survived-to-horizon 0,
  national-or-better at end 2 (99824, 99830), wave-4 unlocked 8/12,
  wave-5 reached 0/12, median survival 90.5d.
- In plain words: on this fresh block, villages win lesser seats and
  never the full seat, with or without ally gear parity; the wave-5 door
  opens on NO seed in either variant (this block never even reaches it,
  unlike the rescreen block's 99658); gearoff costs one net lesser win
  but the gross movement is bigger — three villages change class, and
  the two losses are different kinds of loss (a fight-death cascade on
  99828, a seat that never announces on 99832) while the rescue (99830)
  runs through survival, not fighting. The binding constraint on this
  block is still everything downstream of sitting lesser: standing,
  veterans, and wave-5 facing — no seed banks 2 living wave-4 killers,
  no seed kills a wave-5 monster, in either variant.

## Sense-reading (SENSE-TESTING LAW) — PASS
All three flips mechanism-traced; the rescue seed read end to end.

- 99828, loss (won lesser d90 → scattered d90): traced to the fight
  census, day by day. V-full fights 8 wave-4 fights with 1 villager
  death (Chloe Dubois d64, Reunion — fled fight, died "the wild") and
  1 kill (Influencer d81, Hugo put it down; Desmond + Skylar died in
  that fight and the village still sat d90 with 1 living veteran).
  Gearoff fights 12 with EIGHT villager deaths: Jasper Werner d68,
  Hannah Kim d71, Chloe Dubois d73, Emma Larsen d84, Tiril Johansen
  d84, Marelize Letsoalo d84, Nino Kapanadze d84, Wei Chen d84 — the
  same Reunion fights V-full survived or fled become death traps, the
  party shrinks 6→3 across d68–d84, and the village announces d90 with
  4 alive and scatters instead of sitting. The damage dealt is NOT low
  under gearoff (457–803 per fight) — the party deals plenty; the
  allies die while dealing it, unarmored, and most fights end with the
  party fleeing while villagers still die ("the wild" deaths after
  fleeing). The lever's fingerprint is ally survivability, not party
  damage. The two d90 transcripts share nothing after the header:
  V-full's is the table finale (audit, war path, Hugo ascends as
  Architect); gearoff's is ordinary daily life on the day the village
  ends — the fork happened weeks earlier, in the fights.
- 99830, rescue (scattered d83 → won lesser d99): read end to end,
  announce d90 → sit d99 (1111 lines). It reads as one coherent village
  story: Jabulani mauled then killed by The Eater on d90 (mourned);
  Nora of Ashford's raid and the Eater gorging at the treeline; the
  Siege contest won by BOTH Farid and Nina on camera (Rage Bindings,
  Ghost Camo prizes); Raj becomes the national voice; the Tide Clock
  won by you and Raj (Starfall bow prize); the Big Loud / Big-Eyes /
  Big Ugly talked down or fought with the whole party (Joseph, Nora,
  Raj, Farid, Nina all acting — Redact mechanic, armor absorbing 21,
  Nora raging for 86/91); Emberhold's 2,559 kcal aid accepted; Ashford
  given 2,000 kcal (Peter weeps, trust +4); the Hardened Blood Tithe
  refused on principle while Nina still wins hers; an overtime week
  (d97); then the table d99 — lesser seat, global standing, waves 1–3
  faced 15/9/8, 3 wave-4 fought, 9 contests, 4 crises, Raj ascends as
  Architect through relay. The audit names real deeds; the feared path
  plays with mercy chosen. PASS — meaning, coherence, consequences all
  legible. The rescue runs through SURVIVAL, not fighting: V-full's
  twin starved — pantry empty for days, Georgy starved d73, raids
  stripped the stores, Gonzalo Ponce died of dehydration d83, "No one
  is left to pick up the Codex." Death records show the fork from d11:
  V-full bleeds steadily into a hunger spiral (starvation/dehydration
  deaths d62–d83); gearoff loses more people to monsters (7 monster
  deaths) but keeps 7 alive, reaches wave 4, announces d90, sits d99.
  The exact first diverging fight is not in the census (wave-4-only —
  the known blind spot, see metric review); the fork is a butterfly
  through the lever's own mechanism (ally gear in ALL field fights, not
  just wave 4), not a counting artifact.
- 99832, loss (won lesser d90 → scattered d174): V-full sat d90 with
  only 1 alive — a knife-edge win (13 deaths, the last Nina d90
  "alien", a sit-day death). Gearoff's village lived 84 days LONGER
  (d174), fought more (12 fights incl. a wave-4 Strike kill d167, 966
  damage), and still died out with 1 alive — because the lesser seat
  NEVER announced (announceDay null, firstLesserDay null in 174 days)
  despite standing max 199, 19 contests (vs V-full's 10), 75 food
  shared (vs 41), score 236 (vs 139). The village survived longer and
  fought more, but the seat path never opened; attrition ground it down
  one monster death at a time (Renata d110, Jacob d111, Baher d143,
  Sebastian d144, Nittaya d156). Which announce-gate condition never
  fired is NOT visible in the census — recorded as a measurement gap,
  not invented. The flip is real; the mechanism is "longer survival +
  more fighting, seat never announced."
- 99821, most-moved S3 seed (scattered d64 → scattered d174, fights
  0→6): gearoff more than doubles survival with zero kills and zero
  villager fight-deaths — all 6 wave-4 fights end mFlee or talkDown (3
  talkDowns). With weaker allies the party talks monsters down and
  flees instead of fighting; the village lives to d174 and still dies
  out with 1 alive. Same class, very different trajectory — exactly
  what S3 is for.

## Village assessment (plain words)
These twelve fresh villages are harsher than the rescreen block: five
sit lesser on the pinned game, seven scatter, none reaches wave 5, and
only two wave-4 kills happen in the whole baseline. The strongest
villages are the ones that sit early (d90) with one person left standing
— 99832's V-full win is a single survivor sitting down. Take ally gear
parity away and the block gets stranger, not simply worse: one village
bleeds out in wave-4 fights it used to survive (99828), one never gets
its seat announced at all despite out-scoring its winning twin on
nearly every deed (99832), one starves in one timeline and wins in the
other (99830), and one lives twice as long by talking monsters down
(99821). What is missing is not wave access — wave 4 is unlocked on
7–8 of 12 seeds in both variants — it is living veteran killers and
wave-5 kills: no seed banks 2 living wave-4 killers, no seed kills a
wave-5 monster, in either variant. The blank this run fills is the
rescreen's open item: gearoff's signal reproduces on fresh seeds — the
lever moves outcomes (GO). The blank it documents is the 99832
announce-gate miss: a village can out-score its winning twin and still
never be offered the seat, and the current instruments cannot say which
condition never fired.

## Telemetry deviation check
Declared INAPPLICABLE, not run: same reason as toggle-b/togglepin-b/
toggle-rescreen-b — the corpus is matched-seed classification, and the
endgame baseline is the same stale, regime-unrecorded file r118 already
flagged (its own text forbids pre-seat comparisons). Running the check
would manufacture LOUD lines against a baseline that does not describe
this regime. No compare is fabricated. §15 balanced panels do not apply
to this diagnostic: the instrument is the matched-seed classification
itself, and the prereg staged design governs.

## Metric review (for the NEXT run, not this one)
- The pre-registered staging deviation (no pass 2) cost nothing here:
  DET re-verified determinism on the band's first seed and the judged
  baseline is a single fixed pass-1 corpus. Keep the deviation explicit
  in future confirms; do not let it quietly become the staging.
- S2 fired exactly once (99822, sat +22, 97→119) and did not decide
  anything — consistent with the rescreen's finding that sat-day
  movement is the noisiest signal and S3 does the work. S2 staying
  descriptive-only was the right call.
- The wave-4-only census is blind to the fights that flipped seeds here
  AGAIN (99830's rescue fork is in low-wave fights the census never
  records; 99832's announce-gate miss has no census signal at all).
  Any future arm that needs the fork — not just the outcome — needs a
  low-wave field-fight census and day-stamped fight records, or it will
  keep reporting "0 fights" for villages whose fates were decided in
  fights it never recorded. (Carried from the 0445Z metric review via
  the rescreen; still true, still unbuilt.)
- The audit-vs-census gap: gearoff-99830's audit says "3 wave-4
  fought" while the census says 2 fights (both mFlee) — the audit
  counts raid fights at the door the census doesn't. A narration nit
  for the audit, not a finding: the numbers disagree by one because
  they count different things.
- Gross flips vs net wins: net lesser wins moved 5→4 (−1) while gross
  flips were 3 (2 losses, 1 rescue). A confirm judged on net wins
  alone would have called this lever a small negative; judged gross,
  as pre-registered, it is a clear GO with mixed direction. The
  gross-flip judge was the right call and should stay the confirm
  standard.
- The `survived` class naming (endReason=survived) was built into the
  classifier and proof script but fired on 0/24 runs here — no village
  survived to the horizon without sitting on this block. The naming
  stands for future confirms.

## Proof results
- Variant constructor (scripts/apply-toggle-variant-20261104.py, from
  master): gearoff applies cleanly on the pinned base (7 hunks,
  fieldFights.js only + GEAR header comment line); alloff verified
  byte-equal to d8f334da8^ for both src/js files BEFORE any sim
  (`git diff d8f334da8^ -- src/js/` empty); variant restored to the
  pinned tree after its run (`git diff --quiet -- src/js/` clean).
- Pinned-tree method: `git checkout ff1725835 -- src index.html
  scripts`, seven tooling scripts copied back from master; probe ran on
  the pinned harness. Two post-base src/js files (villager-goals.js,
  win-plan.js) removed for the sim phase; final restore returns them
  from HEAD. scripts/ post-base files on disk are inert (never loaded).
- Probe (scripts/probe-toggle-confirm-gearoff-b-20261106.js): rescreen
  probe verbatim except the PLAN map (diff-verified: header comment +
  PLAN const + its two comment lines only). DET GREEN byte-identical;
  all probe .err files empty (26 runs total: 2 DET + 12 V-full + 12
  gearoff), no crashes.
- Classifier (scripts/classify-toggle-confirm-gearoff-b-20261106.js) +
  proof script (scripts/test-toggle-confirm-gearoff-b-20261106.js):
  integrity 12/12 on both prefixes; confirm mode judges the prereg bar
  directly (GO, signal 6/12, S1=3, S2=1, S3=4); confirm mode validated
  pre-sim against the rescreen corpus (reproduces its gearoff verdict
  exactly: GO, signal 5/8, S1=1, S3=4).
- No game-code change is committed or landed by this arm. Branch holds
  evidence/scripts only. No jest suite was run (no game code is
  committed or landed by this diagnostic arm; the variant code was
  restored before closeout).
- Index-clobber class hit twice (after each safe-commit: committed files
  showed staged-as-deleted); repaired both times by re-checking out the
  pinned tree + re-dropping the two post-base src/js files from the
  index, and re-verified (src/js clean vs index, worktree src/ +
  index.html byte-equal to ff1725835) before continuing. Both commits
  verified correct via `git show --stat`.
- Time: 26 probe runs at ~3.5 min/seed ≈ 91 min of sims; total run
  ~1h45m from worktree start, over the nominal 70–80 min budget — the
  overrun is sim time at the rescreen's own measured pace, not rework.
  No verdict was rushed to fit the window.
- No out-of-arm finding is appended to sim-findings.md from this run
  (the GO verdict is this run's report; the 99832 announce-gate miss
  and the audit-vs-census gap are documented above as measurement gaps,
  not findings).

## Commits (branch sim-gearoff-confirm-b, ready for coordinator merge, pending ship)
- beafc5018 — gearoff-confirm-b prereg (fresh band 99821-99832, judge
  S1+S3, pinned base ff1725835) + tooling (probe PLAN map only,
  classifier + proof with confirm mode + survived class).
- 8874bb65 — gearoff-confirm-b Stage 0: DET GREEN (seed 99821) +
  V-full pass 1 baseline (12 fresh seeds, lesser 5/12, wave-5 0/12,
  median 90d).
- (Stage 1 + this note follow in the closeout commit — per-seed outputs,
  logs, and this note.)
- No push, no bump, no live check — merged locally, pending ship (ship
  loop owns version bumps, pushes, live verification).
