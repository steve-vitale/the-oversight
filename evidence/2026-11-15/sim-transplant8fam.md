# H1 transplant — family 8fam: the four CONFLICTED PR #22 hunks, theirs-resolved (arm sim-transplant8fam-a)

Run: fleshout-20261115T1425Z (Loop A), axis scale-onramp (survival collapse).
Prereg: evidence/2026-11-15/sim-transplant8fam-prereg.md (committed BEFORE
cutting any judged leg or running any judged sim — commit 990e124a1;
this prereg SUPERSEDES the 1215Z run's prereg fbae7cf31 / correction
4b95529b9 on band + sniff only; family, subject, verdict mapping
unchanged — see the prereg's §Supersession note).
Arm branch: `sim-transplant8fam-a` (worktree
`~/workspace/worktrees/sim-transplant8fam-a`, branch base recent master
738ccb2c9; substrate the far end 203a32775).
Subject branch: `transplant-8fam-subject`, commit
b6ec3c7d1c700c3cab26c6bd578074588f7901f5 (adopted from the 1215Z run,
verified hunk-by-hunk, NOT re-cut; left in place, one commit on the
far end 203a32775).
Canon: docs/CANON.md read first; docs/CONVERSATIONS.md read (dialogue,
talk, gossip — the family's area). No canon invented or rewritten.

## Verdict: UNMEASURED (sniff band-health) — the far end reads survived 0/4 on the fresh band's first 4 seeds

The 4-seed sniff leg reads survived **0/4** — the pre-registered
tripwire fired. Per the committed prereg, the run STOPPED: no baseline
leg was run, no subject leg was cut, and the 8fam survival question is
UNMEASURED on this band. A subject leg would have been uninterpretable
— the baseline band is catastrophically unhealthy, so a subject reading
0/4 could not distinguish "the family collapses the far end" from "the
band kills everything". The 0/4 is a real read, not a harness artifact
(0 instrument errors on all 4 seeds; fix standing f8fda4295a99 verified
swapped in; far-end policy a7ff5c51; seeds exactly 190589–190592).

The family-test verdict is reported SEPARATELY, and it is the opposite
story: the four hunks work exactly as designed — the conflicted script
passes all four cases on the subject (exit 0) and shows pre-fix control
behavior on the far end (exit 1), and the dialog-audit #4 proof's
plant-lesson resume shape runs coherent on the subject. The hunks are
LIVE at the dialogue level; the SURVIVAL question is unmeasured
because the band failed, not the hunks.

## The question

Do the four CONFLICTED hunks of origin family 8 — merge `713eb7545`
(PR #22 live-thread-dry-engage, dialog-coherence audit defect #4) — AS
A FAMILY, resolved by taking THEIRS in the conflicted regions, alone
collapse the far end `203a32775` (GOOD 4/8 on the matched band) toward
the merge's 1/8? Narrowed 8b measured the three clean hunks
NOT-CARRIER (bit-identical trajectories); narrowed 8c measured the
excluded second dlg:more hunk NOT-CARRIER on the matched-band rerun.
The four conflicted hunks have NEVER been measured in any form. This
arm measures ONLY those four hunks, theirs-resolved (lesson-outcome /
diegetic-act, favor settlement, favor-line sayLine, blocked-repeat).
Nothing 8b or 8c already measured, nothing else from the merge.

## Primary metric, GO threshold, horizon

- Primary metric: survived/8 (villages reaching day 150 alive, out of
  8 seeds), on the pre-registered fresh band 190589–190596.
- GO threshold (verdict mapping, stated before any leg): subject ≤1/8
  CARRIER (with a healthy baseline ≥3/8); 2/8 AMBIGUOUS → re-run once
  (2/8 again → recorded AMBIGUOUS, treated as NOT-CARRIER for ordering
  but kept on the suspect list); ≥3/8 NOT-CARRIER.
- Horizon: 150d, death-aware (a village that reaches day 150 but is
  already lost counts as LOST, not survived — seed 190591 in the sniff
  reached 150d village-lost). The horizon matches the bisect program:
  150 days is where the wave-5 door and the full-seat bar are decided,
  and the far end's settled 4/8 is a 150d read.
- Sniff tripwire (pre-registered, the 8c lesson): the first 4 seeds of
  the fresh band are run first as a band-health check. 0/4 → STOP,
  UNMEASURED-band-health; ≥1/4 → PROCEED to the full 8-seed baseline
  leg, which must read ≥3/8 or the run stops (UNMEASURED, no subject
  leg). The sniff is a tripwire, not a judge.
- Policies: competent verbatim own-policy (the family touches no
  policy — subject policy IS the far-end policy `a7ff5c51…`); fix
  standing swapped in every step (`f8fda4295a99…`), native standing
  restored byte-identical afterwards (sha-verified `75762cb2…`).

## Sniff leg ep-far-8fam-sniff (far end, fix standing swapped in)

Tripwire: the first 4 seeds of the fresh band must read ≥1/4 or the run
stops. FAILED — 0/4.

- Survived 0/4. Per-seed days: 140/65/150/121 — median 140d
  (analyzer's medianDays).
- Per-seed: 190589 140d village-lost (wave 5 unlocked, standing 200
  regional, deaths 97); 190590 65d village-lost (wave 4, standing 150
  regional, deaths 68); 190591 150d village-lost (wave 4, standing 199
  regional, deaths 128 — reached day 150 already lost); 190592 121d
  village-lost (wave 4, standing 199 regional, deaths 84).
- Rank: RANK_INCONCLUSIVE (regional 4/4, village 0/4). Wall: wins 0,
  national 0, table 0, wave5 1/4, wave4 4/4, median 140d, deaths 377,
  standing 150–200, blooded 1.
- Death causes (377): villager combat 140, combat 102, expedition 79,
  the wild 45, monster 4, the arena 3, singletons 4 (a wound that
  wouldn't close, Gavel, The Strike, a stranger — 1 each).
- Instrument errors 0. Analyzer exit 0 (verdict BAD — the bisect
  classification for ≤1/8 under its 8-seed rule; the sniff judgment
  uses the raw survived count 0/4, not the label). Summary:
  evidence/2026-11-13/culpritbisect-a-ep-far-8fam-sniff-summary.json;
  corpus
  evidence/2026-11-13/perseed-culpritbisect-a-ep-far-8fam-sniff/
  (4 per-seed JSONs); driver log
  evidence/2026-11-13/culpritbisect-a-ep-far-8fam-sniff-driver.log.
- Leg wall time ~4 min (step started 15:34:03Z; the box was quiet —
  no sibling load noted). Step script: /tmp copy with SEEDS edited to
  the sniff band + the sniff analyzer installed over the master
  restore (the master analyzer hardcodes the matched band); committed
  tooling untouched.
- Post-leg state verified: HEAD detached at the far end during the
  step, native standing restored byte-identical (`75762cb2…`), arm
  branch `sim-transplant8fam-a` checked back out, tracked tree clean.

## What it means

The far end's settled 4/8 does NOT generalize to this fresh band
either — and this band is harsher than 8c's: 0/4 on the first four
seeds (8c's fresh band read 1/8 over eight seeds, its first four also
0/4: 122/134/150/92 lost). The matched band's first four read 1/4
(86/144/150/43 — one survivor). On 190589–190592 the far end loses
every village: three before day 150, and the fourth (190591) reaches
day 150 already lost. All four stall at regional (standing 150–200);
none reaches national, the table, or a win; wave 5 unlocks once
(190589, which still loses at 140d). Deaths are fighting deaths
(villager combat 140 + combat 102 of 377) with expedition next (79) —
the same shape as the survival collapse, not a new failure mode.

The sniff tripwire worked as designed: it caught a 0/4 band before the
arm spent the full baseline leg and the subject leg on it. What is NOT
known after this run: whether the four conflicted hunks move survival
on ANY band. The matched-band design (the 1215Z prereg, step
`ep-far-8fam`) would have measured the family against the healthy 4/8
far end — its baseline leg died incomplete in a write flap, and this
run's brief forbids reusing that band. The subject (`b6ec3c7d1`) is
left in place for a possible coordinator-directed rerun, e.g. on the
matched band where the far end is healthy.

## Family-test leg (dialogue instrument — judged separately, never a verdict input)

- Conflicted script `scripts/test-transplant8fam-conflicted.js`,
  far-end control (pathspec extract of the far end to /tmp, seed 1/7
  staging, same as the subject run): exit 1 — H-settled PASS (both
  answer "It's already handled"); H-unfinished, B-test, L-test all
  show pre-fix CONTROL behavior (far end answers "already handled"
  with a live unfinished outing; falls through to the dup repeat
  instead of the fell-back early return; delivers the secret react
  as a diegetic act). Probes staged cleanly (B: "Nothing I can name.
  Company's enough."; L: "Thank you. ...I needed someone to know,
  and I needed it to stop there.").
- Same script on the subject (pathspec extract of `b6ec3c7d1` to
  /tmp): exit 0 — ALL FOUR cases pass (H-settled, H-unfinished,
  B-test, L-test). "TRANSPLANT8FAM CONFLICTED: PASS (8fam behavior
  holds)". The four hunks are behaviorally live and distinct on this
  substrate: the favor-settlement guard, the fell-back early return,
  and the secretOutcome removal each change what the villager says.
- Dialog-audit #4 proof `scripts/test-live-thread-engage-dry-20261108.js`
  (merge blob `a0161cc9…`) against the subject extract: exit 1,
  RESULT: 3 FAILURES — all pre-registered, none a regression: Dale
  goon setup fails `TypeError: Game.convoHasLiveUnfinished is not a
  function` (an 8b method, reversed out of this subject); Dale-honest
  fails twice on missing-8b-content grounds (goon dried while
  unfinished remained; should name unfinished work structurally);
  the #14 favor/debt check fails MODULE_NOT_FOUND
  (`test-favor-debt-help-coherence-20261108.js` absent at the far end
  and the subject — the pre-existing substrate gap 8b documented).
  The one #4 shape this subject could carry — the Ruth plant-lesson
  resume — RAN and produced a coherent non-dry follow-through
  ("Honestly, we never finished talking about that plant lesson — we
  got cut off. 'The chickweed by the creek — how to tell it from the
  lookalike.'" → "I had plans. Real ones. A trip. A thing I was
  saving for. They're still in a drawer somewhere, in a life I don't
  live anymore."). Diagnostic only, as pre-registered.
- /tmp tmpfs note: both extracts are 199M (pathspec only, never a
  full-tree extract). The "fatal: not a git repository" lines in both
  extract runs are harness version-detection noise in a non-repo
  extract, not failures.

## Sense-testing (vetSays census, sniff corpus — 247 lines, 4 seeds)

Censused every vetSays line in the sniff corpus (190589: 79, 190590:
43, 190591: 65, 190592: 60):

- "lost my train of thought" (dry): 0. "Still on" (resume): 0.
  "already handled" (settled favor): 0. Dry-fallback lines: 0.
  `secret:`: 0. Teach / plant lesson: 0. Help: 0. Favor: 0.
- "unfinished" (any): 4 — all four are the SAME scripted System ARC
  IV beat, one per seed ("...The case is made of deeds, not words —
  and yours, though unfinished, are undeniable."), a story beat about
  deeds, not a villager's unfinished-thread dialogue.
- The family's dialogue surface is entirely unexercised in the
  survival sim on this band — the same finding as 8b (0/0 across both
  corpora) and 8c (0/0 across 440 + 225 lines). Villagers never open
  a Help exchange on a live unfinished thread under the competent
  policy here, so the survival sim cannot speak to the hunks'
  dialogue behavior either way; the conflicted script above is the
  instrument that does.
- What the corpus DOES say: narration dominated by combat, task, and
  System beats. Most repeated line: "The Scarred The Focus Group is
  still frozen from your scream." ×16 — a combat frozen-status line
  recurring across fights, not robotic villager speech. Task
  assignments ("📋 A woman, maybe 30s, with a scarred cheek — 🪾
  Gather deadfall. They'll report back by next part." ×7) and
  alien-audience interjections ("📺 ..." ×4 each, identical on all
  four seeds) are scripted beats firing on every seed, as expected
  under one deterministic policy. Nothing incoherent to flag: the
  lines are coherent, just not conversational — villagers barely
  speak in this corpus at all.
- No subject corpus exists to compare against (sniff STOP), so the
  sense-test is one-sided by design on this path.

## Recovered 1215Z leg (INCOMPLETE — recorded, not adopted)

Step `ep-far-8fam` (matched band 190391–190398, far end, fix standing
swapped in, policy a7ff5c51) ran 13:21–13:57Z during the 1215Z run and
died in a WRITE FLAP: seeds 190391/190392 wrote full per-seed JSONs;
seeds 190393–190398 left only 0-byte `.tmp-6927` files. The driver
log's per-seed lines record all 8 sims completing in-process with
errors 0: days 86/144/150/43/150/87/150/150 — EXACTLY the settled
far-end baseline (4/8 survived). The analyzer reported INCOMPLETE
(missing 6 seeds); no summary JSON exists. Per the guards, a step with
missing per-seed files is INCOMPLETE, not a verdict. This leg is NOT
adopted (wrong band for this run + incomplete) and its files are LEFT
ALONE (untracked in the worktree, per the task brief). This run's step
ids are deliberately distinct (`ep-far-8fam-sniff`,
`ep-far-8fam-fresh`, `t8fam`) so nothing overwrote the 1215Z log or
corpus directory.

## Telemetry deviation check

Attempted per the loop body (telemetry-check.js, baseline
evidence/2026-10-13/sim-scale-wall-r15-baseline.json, current the
sniff per-seed corpus, metrics national,table,wins,exiled): REFUSED —
"recorder-corpus input: all 4 --current rows carry top-level
anchorCommit, so they are sweep recorder rows, not runs" (exit 2).
Recorded, not waived; baseline NOT rolled. Same refusal class as all
prior bisect / transplant arms. No --allow-recorder-corpus and no
--update-baseline were passed.

## Proof

- `scripts/test-transplant8fam.js` — stage 1 green at prereg
  (149/149, commit 990e124a1); re-run after the sniff leg (the §9
  sniff-STOP branch): 151 passed, 0 failed. The +2 is the sniff-STOP
  branch's extra legs (tripwire fired, no baseline/subject summaries,
  evidence records UNMEASURED-band-health + 0/4).
- `scripts/test-culpritbisect-a.js` (116 legs) re-run as the
  reused-tooling check: 116 passed, 0 failed. (Run in place on the
  arm branch — its requires are repo-relative, so a /tmp copy cannot
  resolve them; the prereg's "/tmp copy" note was wrong about the
  mechanics. The run writes nothing to the repo.)
- `scripts/test-transplant8fam-conflicted.js` — far-end control exit 1
  (expected), subject exit 0 (all four cases pass); see §Family-test
  leg above.

## Metric review (§14 — filled after the steps, never re-scored here)

- The metric set held: the sniff tripwire (0/4 STOP) caught a
  catastrophically unhealthy band before the baseline + subject legs
  were spent, exactly as designed. No metric needs revision for the
  tripwire itself.
- What the tripwire cannot answer: the full 8-seed fresh baseline was
  never run, so this run says nothing about whether the fresh band's
  full 8 read 1/8 (like 8c's) or 0/8. The NEXT run on a fresh band
  should keep the sniff — it is cheap (~4 min) and it saved ~70 min
  of uninterpretable legs here.
- Open design question for the coordinator (not a metric change):
  the matched-band design measures this family against a healthy far
  end; the fresh-band design keeps hitting band-health STOPs (8c
  1/8 gate, 8fam 0/4 sniff). If the family is to be measured at all,
  the matched band (or a fresh band pre-screened healthy) is the way;
  a fresh band chosen blind is likely to STOP again.
- The analyzer's verdict label (BAD) and "/8" printout on a 4-seed
  sniff are cosmetic mislabels from its 8-seed rule — the sniff
  judgment correctly uses the raw survived count (0/4). A future
  tooling touch could parameterize the label, but it changes no
  verdict and is not this arm's work.

## Guards / incidents

- Flap: NO write flap struck this run. The 14:34–14:35Z FLAP? probe
  lines at run start were a probe artifact (EEXIST on the probe's own
  `nodeprobe-oexcl.lock`, errno 17; probes A/B/C/D/F/G/H all OK) —
  not a host write flap. The 1215Z run's flap window (which killed
  its baseline leg) is recorded in the prereg and above.
- Safe-commit index clobber: STRUCK once, on the prereg commit
  (990e124a1) — after the commit the main index showed the three
  committed files as MM / staged-deleted while the worktree files
  were byte-identical to HEAD (verified: hash-object == HEAD blob for
  all three). Repaired with `git ls-tree -r HEAD -- <paths> | git
  update-index --add --index-info`; verified `git status --short`
  empty apart from the untracked 1215Z leg files + `git diff HEAD`
  empty + all three blobs matching HEAD. The commit itself was
  correct; only the index lied (the documented pattern).
- No game-code change was committed by this arm on the arm branch
  (the subject lives on its own branch, left in place, NEVER landed).
  The arm branch commits only: prereg, proof scripts, evidence file,
  sniff step corpus + summary + driver log.
- The 1215Z run's untracked leg files
  (`evidence/2026-11-13/culpritbisect-a-ep-far-8fam-driver.log` +
  `evidence/2026-11-13/perseed-culpritbisect-a-ep-far-8fam/`) were
  left alone throughout, per the task brief.
