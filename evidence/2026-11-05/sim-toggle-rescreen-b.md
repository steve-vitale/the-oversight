# Toggle-rescreen-b — re-screen sigoff / gearoff / trickoff on FRESH seeds 99651–99658 (Loop B, 2026-11-05/06)

Run: fleshout-loop-b-20261106T0030Z (adoption of the orphaned arm from the
dead Loop B 2330Z run). Prereg: evidence/2026-11-05/sim-toggle-rescreen-b-prereg.md
(committed 3be4c27a0) — it binds this run; the prereg was NOT rewritten and
the seed band was NOT re-picked. 42 probe runs total: 2 DET + 16 V-full
(2 passes x 8) + 24 Stage 1 (3 variants x 8). All probe .err files empty.

## Verdict (prereg-gated, not re-scored)
- STAGE 0 GATE: PASS. (a) DET=1 byte-identical on seed 99651. (b) V-full
  sweep run twice on all 8 fresh seeds: sat days + classes exact on every
  seed, JSON + transcripts byte-identical (REPEAT PASS).
- STAGE 1 SCREEN — ALL THREE TOGGLES ARE GO-CANDIDATES (confirm owed,
  next run; NO Stage 2 ran here, per prereg):
  - sigoff (SIGDMG): GO-CANDIDATE on S3 only — 0 class flips, 0 sat-day
    moves >=9, but 99653's wave-4 census fight count swings 9 → 13 (+4).
  - gearoff (GEAR): GO-CANDIDATE on S1 + S3 — 99651 flips won-lesser d118
    → scattered d66 (a loss), and S3 fires on 4 seeds (99653 kills 3→0 /
    fights 9→0; 99655 fights 0→15; 99656 fights 6→0; 99658 kills 8→1,
    fights 16→9, and the wave-5 door closes uw5→uw4).
  - trickoff (TRICKHOLD): GO-CANDIDATE on S1 + S3 — 3/8 flips (99651 won
    lesser d118 → scattered d160 with wave-5 reached; 99652 scattered d57
    → survived to the 180d horizon; 99653 scattered d72 → won lesser d96)
    and S3 fires on 5 seeds.
- The 0445Z fast kills do NOT reproduce on fresh seeds: all three
  "non-attributed" singles move whole villages on this block, and two of
  them flip outcome classes. The pilot non-attribution covered only the
  89702/89704/89705 classes, exactly as the prereg warned.

## Staging note (deviation from the prereg's order, documented not hidden)
The prereg stages Stage 0 (a)+(b) before Stage 1. DET (a) passed, but at
~3–9 min per 180d seed-run on the loaded machine, a strict order (pass 1
+ pass 2 = ~35 min) would have consumed the cron window before any variant
ran — leaving the arm with a gate and a baseline but no screen, which is
the arm's whole purpose. So the variants ran after pass 1 and before pass 2
closed the gate. NO judging was done until the gate closed: the screen-bar
numbers were computed from the fixed corpora, but the verdicts above were
finalized only after pass 2 confirmed sat-day exactness on all 8 seeds
(REPEAT PASS, byte-identical). If pass 2 had failed, the variant data would
have been reported as unjudged, not scored. The deviation is order only,
not standard.

## Pinned-base method (as prereg)
- Pinned base ff1725835 (r118's base; arm-2 d8f334da8 verified an ancestor,
  so arm 2 is ON in V-full). Branch sim-toggle-rescreen-b holds
  evidence/scripts only; game code was never committed.
- Pinned checkout: `git checkout ff1725835 -- src index.html scripts`,
  then the 7 tooling scripts copied back from HEAD
  (probe-toggle-b-20261104.js, apply-toggle-variant-20261104.py,
  classify-toggle-b-20261104.js, test-togglepin-b-20261104.js, plus the
  three rescreen scripts committed as 66201f4a9).
- Repair the togglepin run did not need: `git checkout ff1725835 -- src`
  does NOT remove files added after the base — post-base
  src/js/villager-goals.js and src/js/win-plan.js stayed in the worktree
  and index. The harness builds its script list from the pinned index.html
  (0 references to either file), so they were inert for the sims — but
  they would have failed the alloff byte-equality check (`git diff
  d8f334da8^ -- src/js/` non-empty), so both were removed from worktree
  + index for the sim phase. The final restore (`git checkout HEAD --
  src index.html scripts`) returns them. scripts/ likewise still holds
  post-base files on disk (~565 files added since ff1725835); none is
  loaded — the probe requires only the pinned sim-harness.js, the pinned
  policies/, and the probe itself.
- Alloff construction check (before any sim): V-alloff verified byte-equal
  to pre-arm2 blobs (`git diff d8f334da8^ -- src/js/` empty) — PASS.
  Reverts: sigoff 3 hunks, gearoff 7 hunks, moraleoff 1 hunk, trickoff
  1 hunk + GEAR/MORALE header comment lines. Restored to the pinned tree
  after the check (`git diff --quiet -- src/js/` clean).
- Probe: scripts/probe-toggle-rescreen-20261105.js =
  probe-toggle-b-20261104.js with ONLY the PLAN map changed to
  99651–99653 waves / 99654 forcedrift / 99655–99658 wavesnw (verified by
  diff: header comment + PLAN const + its two comment lines only).
  Classifier + proof script are seeds-parameterized copies of the
  toggle-b pair (default seeds 99651–99658). Env for every sweep:
  FULLSEAT=1 VETCOMMIT=1 CAPABLE_GREEDY=1 ARMORYDRIVE=1 CAPABLE_VETGUARD=1
  TELEMETRY_FULL=1 RELAYGREY=1; 180d death-aware horizon; SEEDS env set
  explicitly on every invocation.
- Seed-band freshness re-verified at adoption (before any sim): zero
  exact-boundary hits for any of 99651–99658 in current-master evidence/,
  in the goal hidden_files/, or in other worktrees' 2026-11-05 evidence.
  The only exact-boundary hit anywhere was a pantry kcal value (99653)
  in an Oct 19 scholarraid corpus — a value, not a seed.
- Note: the branch also holds an earlier, different rescreen attempt's
  scripts (scripts/probe-togrescreen-b-20261104.js etc., commit ad6d29f20,
  band 89801–89808) from the dead 2330Z run. NOT used here; left untouched.

## Stage 0 — determinism gate: PASS
- (a) DET=1 on seed 99651 (2 x 120d of the pinned tree): DET GREEN
  byte-identical. Log: evidence/2026-11-05/stage0-det.log (err empty).
- (b) V-full pass 1 vs pass 2 (8 fresh seeds): sat days + classes exact
  on all 8 seeds; per-seed JSON and transcripts byte-identical.
  Log: stage0-vfull-pass1.log / stage0-vfull-pass2.log (errs empty).

### V-full full block (8 fresh seeds, the judged baseline — pass 1)
| seed | plan | class | sat | uw | fights | kills | vDie | days | end scale |
|---|---|---|---|---|---|---|---|---|---|
| 99651 | waves | won lesser | d118 | 4 | 2 | 1 | 1 | 118 | global |
| 99652 | waves | scattered | — | 4 | 0 | 0 | 0 | 57 | village |
| 99653 | waves | scattered | — | 4 | 9 | 3 | 2 | 72 | regional |
| 99654 | forcedrift | won lesser | d90 | 4 | 8 | 1 | 1 | 90 | global |
| 99655 | wavesnw | scattered | — | 3 | 0 | 0 | 0 | 62 | village |
| 99656 | wavesnw | scattered | — | 4 | 6 | 0 | 2 | 103 | regional |
| 99657 | wavesnw | scattered | — | 3 | 0 | 0 | 0 | 25 | village |
| 99658 | wavesnw | scattered | — | 5 | 16 | 8 | 4 | 138 | regional |
Tally: lesser 2/8, full 0/8, wave-4 unlocked (uw>=4) 6/8, wave-5 reached
1/8 (99658), median survival 81d (sorted days 25/57/62/72/90/103/118/138;
classifier upper-median 90d). Note 99658: the block's only wave-5 reach —
16 fights, 8 wave-4 kills — and the village still died out (see the
village assessment: Tashi Sherpa fell to The Spoiler's Leaked Ending and
no one was left to pick up the Codex).

## Stage 1 — toggle screen (24 runs: 3 variants x 8 seeds vs V-full pass 1)
Flip = outcome class differs from same-base V-full. Screen bar: GO-CANDIDATE
iff S1 (flip >=1 seed) OR S2 (|sat-day d| >= 9) OR S3 (wave-4 census kill
swing >=2 or fight swing >=3). Otherwise DIAG-NO-CANDIDATE, no confirm owed.

### sigoff (SIGDMG) — GO-CANDIDATE (S3)
| seed | V-full | sigoff | flip? | sat Δ | kills | fights |
|---|---|---|---|---|---|---|
| 99651 | won lesser d118 | won lesser d116 | no | −2 | 1→1 | 2→4 |
| 99652 | scattered d57 | scattered d57 | no | — | 0→0 | 0→0 |
| 99653 | scattered d72 | scattered d96 | no | — | 3→3 | 9→13 (S3) |
| 99654 | won lesser d90 | won lesser d90 | no | 0 | 1→1 | 8→8 |
| 99655 | scattered d62 | scattered d62 | no | — | 0→0 | 0→0 |
| 99656 | scattered d103 | scattered d103 | no | — | 0→0 | 6→6 |
| 99657 | scattered d25 | scattered d25 | no | — | 0→0 | 0→0 |
| 99658 | scattered d138 uw5 | scattered d138 uw5 | no | — | 8→8 | 16→16 |
S1 0/8, S2 0/8, S3 1/8 (99653). Tally: lesser 2/8, scattered 6/8,
wave-5 1/8 (99658), median 93d (conventional; classifier upper-median 96d).
99652/99654/99655/99656/99657/99658 are class-identical to V-full; 99651
moves only −2 sat days. The lever's whole visible effect on this block is
99653: the village survives 24 days longer and fights 4 more wave-4
fights without changing its class or its kill count.

### gearoff (GEAR) — GO-CANDIDATE (S1 + S3)
| seed | V-full | gearoff | flip? | sat Δ | kills | fights |
|---|---|---|---|---|---|---|
| 99651 | won lesser d118 | SCATTERED d66 | YES — loss | — | 1→0 | 2→0 |
| 99652 | scattered d57 | scattered d63 | no | — | 0→1 | 0→2 |
| 99653 | scattered d72 | scattered d46 | no | — | 3→0 (S3) | 9→0 (S3) |
| 99654 | won lesser d90 | won lesser d90 | no | 0 | 1→1 | 8→9 |
| 99655 | scattered d62 | scattered d107 | no | — | 0→1 | 0→15 (S3) |
| 99656 | scattered d103 | scattered d56 | no | — | 0→0 | 6→0 (S3) |
| 99657 | scattered d25 | scattered d25 | no | — | 0→0 | 0→0 |
| 99658 | scattered d138 uw5 | scattered d132 uw4 | no | — | 8→1 (S3) | 16→9 (S3) |
S1 1/8, S2 0/8, S3 4/8. Tally: lesser 1/8, scattered 7/8, wave-5 0/8
(the block's only wave-5 door closes), median 64.5d (classifier
upper-median 66d). Direction is mixed but the net is negative: the one
lesser win outside the control seed is lost, the wave-5 door closes, and
wave-4 fight counts collapse on 99653/99656/99658 — while 99655
paradoxically fights far MORE (0→15 fights, 6 vDie) and still scatters.
Ally gear parity is doing real work on this block, and not only in the
census: 99651's flip runs through a stranger fight the census never sees
(see sense-reading).

### trickoff (TRICKHOLD) — GO-CANDIDATE (S1 + S3)
| seed | V-full | trickoff | flip? | sat Δ | kills | fights |
|---|---|---|---|---|---|---|
| 99651 | won lesser d118 | SCATTERED d160 uw5 | YES — loss | — | 1→4 (S3) | 2→11 (S3) |
| 99652 | scattered d57 | SURVIVED d181 | YES — rescue | — | 0→1 | 0→10 (S3) |
| 99653 | scattered d72 | WON lesser d96 | YES — rescue | — | 3→2 | 9→10 |
| 99654 | won lesser d90 | won lesser d91 | no | +1 | 1→0 | 8→3 (S3) |
| 99655 | scattered d62 | scattered d28 | no | — | 0→0 | 0→0 |
| 99656 | scattered d103 | scattered d53 | no | — | 0→0 | 6→0 (S3) |
| 99657 | scattered d25 | scattered d25 | no | — | 0→0 | 0→0 |
| 99658 | scattered d138 uw5 | scattered d130 uw4 | no | — | 8→0 (S3) | 16→10 (S3) |
S1 3/8, S2 0/8, S3 5/8. Tally: lesser 2/8, survived-to-horizon 1/8,
scattered 5/8, wave-5 1/8 (99651 — a different seed than V-full's 99658),
median 93.5d (classifier upper-median 96d). The most volatile single
lever in the arm: it rescues two villages (99652 to horizon survival,
99653 to a lesser seat) and loses one (99651 wins nothing but reaches
wave 5 with 4 kills). Like morale in 0445Z, the direction is
seed-dependent — the known-trick hold is a live wire, not a knob.

## Scale-wall numbers (judged corpora, plain words)
- V-full (8): lesser wins 2, full seat 0, national-or-better at end 2
  (99651, 99654 both end global), wave-4 unlocked 6/8, wave-5 reached
  1/8 (99658, still lost), median survival 81d.
- Sigoff (8): lesser 2, full 0, national-or-better 2, wave-4 6/8,
  wave-5 1/8 (99658), median 93d.
- Gearoff (8): lesser 1, full 0, national-or-better 1 (99654 only),
  wave-4 4/8, wave-5 0/8, median 64.5d.
- Trickoff (8): lesser 2, survived-to-horizon 1, full 0,
  national-or-better 1 (99654), wave-4 5/8, wave-5 1/8 (99651),
  median 93.5d.
- In plain words: on this fresh block, villages still win lesser seats
  and never the full seat, with or without any single arm-2 lever; the
  wave-5 door opens exactly once per block on V-full/sigoff/trickoff
  (a different seed each time on trickoff) and never on gearoff, and no
  opened door produces a wave-5 kill or a full seat. The binding
  constraint on this block is still everything downstream of sitting
  lesser: standing, veterans, and wave-5 facing.

## Sense-reading (SENSE-TESTING LAW)
All three toggles are GO-CANDIDATES, so each got a sense-read. All three
PASS — every movement traces to a legible in-fiction mechanism, not a
counting artifact.

- sigoff, most-moved seed 99653: the two transcripts are byte-identical
  through ~line 7850 (same contest win, same Peacemaker's Voice synergy,
  same foraging, same Reunion stalking, same "The Algorithm trailers its
  next move at Maya"). Then they fork on one telegraphed move: V-full's
  Maya quips "Finally. I was getting bored." and lives; sigoff's Maya
  dies to it — Codex death beat, trust −8, trauma +14, body stripped,
  roles reshuffle (Aki becomes Scout). The village then fights 4 more
  wave-4 fights, kills an Algorithm and an Eater it never killed before,
  and lasts 24 days longer before scattering on hunger instead of dying
  out. The signature-damage lever changes how one signature hit lands,
  and the village-level consequences compound from there. No robotic,
  static, or repeated behavior; the death has consequences.
- gearoff, flipped seed 99651: the flip runs through a stranger fight the
  wave-4 census never sees (0 census fights on both sides). A Stranger
  (alien player, beam weapon) enters the game in both variants. V-full's
  village kills the Stranger in combat on day 48 and sits lesser d118.
  Gearoff's village never kills it: the beam does 109 damage through
  armor ("The beam doesn't care about your armor... Your flannel shirt
  might as well be paper"), and the Stranger shoots four villagers
  (Miriam d25, Dante d46, Ethan d48, Aline d49) before leaving. The
  village scatters d66 on hunger with 8 alive, pantry 0 — and the ending
  still reads as a story, not a crash: the Big Big stalks them, "Day 3 of
  hunger," the scatter, and then Rax "The Dentist"'s ticking medkit
  arriving as they walk away. The ally-gear lever is exactly the thing
  that decides whether a party can kill a beam-wielding stranger.
- trickoff, flipped seed 99653 (rescue): read end to end, announce d90 →
  sit d96 (731 lines). It reads as one coherent village story: Chantal
  dies at the start despite a properly cleaned wound ("You kept your
  word. That meant everything."), the Ugly Beast fight is talked down
  ("Walk In"), the Paparazzo is beaten as a team ("MEAT AND FRIENDS —
  Aki, Enrique, Mina, Oliver brought down The Paparazzo. Together."),
  the counter is learned at the fire ("Break line of sight before the
  fourth shot"), the Herald/Loud-Eyes/Big-Eyes gorge at the treeline
  night after night while the village deliberates, Oscar of Thornfield is
  turned away hungry, and the final Extended Warranty kill lands on d96
  morning before the sit. The audit names real deeds (waves 1–3 faced
  17/9/6, 6 wave-4 fought, 11 contests, 3 crises), the war path names
  real kills with days (Tyrone put down Loud-Eyes d79 and d72), the
  readiness-5 hold is named honestly (5 of 6 armed; 0 of 2 veterans),
  and the feared path plays out with mercy chosen and Mina ascending as
  Architect through the relay door. A village that died out d72 with no
  successor in V-full now sits lesser d96 with a full story. One small
  awkwardness, noted not chased: the war path names Loud-Eyes twice
  (d79 and d72) — two separate kills, but the repetition reads flat.

## Village assessment (plain words)
These eight fresh villages are harsher than the 0445Z block: only two sit
lesser on the pinned game, five scatter, one dies out — and the two that
sit do so with the wave-5 door still shut (99651 stands at 199, one short
of 200; 99654 sits at d90 with the door unopened). The strongest village
on the block, 99658, is the one that never sits: it unlocks wave 5,
fights 16 wave-4 fights and kills 8 of them, faces The Spoiler for 14
rounds with Dead Aim shots of 229/251 — and then the Spoiler's Leaked
Ending comes true, Tashi Sherpa falls, and with no one left to pick up
the Codex the village dies out quietly. That is the winnability wall in
miniature: the village can reach wave 5 and fight it, but the fighter
dies and the village ends. What is missing is not wave access on this
block — wave 4 is unlocked on 6/8 seeds and wave 5 opens once — it is
living veteran killers and wave-5 kills: no seed banks 2 living wave-4
killers, no seed kills a wave-5 monster. The blank this run fills is the
0445Z open item (a): sigoff, gearoff, and trickoff all move fresh-seed
outcomes, and two of them flip classes — the 0445Z pilot non-attribution
was a property of those three pilot seeds, not of the levers. The blank
it documents is the confirm: each toggle now owes a 12–16-seed confirm
on its own fresh band, judging class flips, trajectory movement, or both
(see metric review — the next prereg must decide, and must not quietly
re-score to whichever moved).

## Telemetry deviation check
Declared INAPPLICABLE, not run: same reason as toggle-b/togglepin-b — the
corpus is matched-seed classification, and the endgame baseline is the same
stale, regime-unrecorded file r118 already flagged (its own text forbids
pre-seat comparisons). Running the check would manufacture LOUD lines
against a baseline that does not describe this regime. No compare is
fabricated. §15 balanced panels do not apply to this diagnostic: the
instrument is the matched-seed classification itself, and the prereg
staged design governs.

## Metric review (for the NEXT run, not this one)
- The staged-order deviation (variants before pass 2 closed the gate)
  was a window-fit call, and it cost nothing here because pass 2 came
  back byte-identical — but it is a deviation all the same, and the next
  run should either budget pass 2 first or record the same deviation
  explicitly. Do not let "it worked out" quietly become the staging.
- S2 never fired on this block (largest |sat-day Δ| is 2, on sigoff-99651
  and trickoff-99654's +1). The 0445Z range (−9 to −23) did not reproduce
  on fresh seeds — sat-day movement is the noisiest of the three screen
  signals here, and S3 (fight/kill swings) did the work on all three
  toggles. A confirm prereg should weigh whether S2's threshold (9) is
  still the right tripwire or whether the confirm should judge S1 + S3
  primarily.
- The class-only S1 screen and the S3 census screen disagree in an
  instructive way: sigoff moves trajectories (99653: +24 days, +4 fights)
  with zero class flips, while trickoff flips 3/8 with mixed direction
  (2 rescues, 1 loss). A confirm that judges net wins alone would
  misread trickoff (net wins 0: 2 rescues − 1 loss, lesser count
  unchanged at 2/8) and misread sigoff (net wins 0, but a real lever
  effect). The confirm's judge must be gross flips + mechanism per flip,
  as the 0445Z metric review already said for morale — now extended to
  all three toggles. The next run's confirm prereg must pre-register
  whether it judges class flips, trajectory movement, or both — do not
  let the confirm quietly re-score to whichever moved.
- The wave-4-only census is blind to the fights that flipped seeds here
  again (gearoff-99651's stranger fight: 0 census fights on both sides;
  sigoff-99653's fork is a signature hit inside a census fight, but the
  census carries no day, so the fork had to be found by transcript diff).
  Any future morale/staying/signature arm needs a low-wave field-fight
  census and day-stamped fight records, or it will keep reporting "0
  fights" for villages whose fates were decided in fights it never
  recorded. (Carried from the 0445Z metric review; still true, still
  unbuilt.)
- The 99652 trickoff "survived" class (endReason survived, 181 days, 5
  alive, no seat) is a class the S1 screen counts as a flip from
  "scattered" — correctly, since the village did not scatter — but the
  classifier's class vocabulary ("other") undersells it: surviving to
  the horizon without sitting is a distinct outcome worth naming in the
  next confirm's prereg, not lumping under "other".

## Proof results
- Variant constructor (scripts/apply-toggle-variant-20261104.py, from
  master): all three single-OFF variants apply cleanly on the pinned
  base; alloff verified byte-equal to d8f334da8^ for both src/js files
  BEFORE any sim (`git diff d8f334da8^ -- src/js/` empty); every variant
  restored to the pinned tree after its run (`git diff --quiet -- src/js/`
  clean at every stage boundary). Hunk map as prereg: SIGDMG 3 hunks /
  GEAR 7 hunks + comment line / TRICKHOLD 1 hunk; zero unmapped hunks.
- Pinned-tree method: `git checkout ff1725835 -- src index.html
  scripts`, three tooling scripts copied back from master (+ the three
  rescreen scripts); probe ran on the pinned harness. Two post-base
  src/js files (villager-goals.js, win-plan.js) had to be removed for
  the sim phase (see method section); final restore returns them from
  HEAD. scripts/ post-base files on disk are inert (never loaded).
- Probe (scripts/probe-toggle-rescreen-20261105.js): r118 probe verbatim
  except the PLAN map (diff-verified). DET GREEN byte-identical; all
  probe .err files empty (42 runs total: 2 DET + 16 V-full + 24 Stage 1),
  no crashes.
- Classifier (scripts/classify-toggle-rescreen-20261105.js) + proof
  script (scripts/test-toggle-rescreen-b-20261105.js): integrity 8/8
  on all four prefixes; repeat PASS (pass 1 vs pass 2 byte-identical);
  screen mode judges the prereg bar directly (sigoff GO-CANDIDATE S3,
  gearoff GO-CANDIDATE S1+S3, trickoff GO-CANDIDATE S1+S3).
- No game-code change is committed or landed by this arm. Branch holds
  evidence/scripts only. No jest suite was run (no game code is committed
  or landed by this diagnostic arm; the variant code was restored before
  closeout).
- Index-clobber class hit three times (after each safe-commit: committed
  files showed staged-as-deleted); repaired every time via HEAD-blob
  cacheinfo and re-verified (status clean of stray entries, diff HEAD
  shows only the pinned-checkout state) before continuing. All three
  commits verified correct via `git show --stat`. After each safe-commit
  the two removed src/js files were also re-dropped from the index
  (`git rm --cached`), since safe-commit restores the index to HEAD.
- No out-of-arm finding is appended to sim-findings.md from this run
  (the three GO-CANDIDATE verdicts are this run's report; the war-path
  Loud-Eyes repetition is a narration nit, not a finding).

## Commits (branch sim-toggle-rescreen-b, ready for coordinator merge, pending ship)
- 3be4c27a0 — toggle-rescreen-b prereg (fresh band 99651-99658, screen bar
  S1/S2/S3, pinned base ff1725835).
- 66201f4a9 — toggle-rescreen-b tooling (rescreen probe, classifier +
  proof script).
- c07b6159d — toggle-rescreen-b Stage 0: DET GREEN + V-full pass 1
  baseline (8 fresh seeds, lesser 2/8, wave-5 1/8 on 99658, median 90d).
- 13418f2a4 — toggle-rescreen-b Stage 1: sigoff GO-CANDIDATE (S3),
  gearoff GO-CANDIDATE (S1+S3), trickoff GO-CANDIDATE (S1x3+S3x5).
- (Stage 0 pass 2 + this note follow in the closeout commit — per-seed
  outputs, logs, and this note.)
- No push, no bump, no live check — merged locally, pending ship (ship loop
  owns version bumps, pushes, live verification).
