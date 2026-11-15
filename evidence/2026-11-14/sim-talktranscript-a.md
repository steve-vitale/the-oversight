# sim-talktranscript-a — OVE-48 SPOKEN DRIVE, JUDGED ON THE TRANSCRIPT (Loop A, fleshout-20261115T0427Z)

Run: fleshout-20261115T0427Z (Loop A), axis scale-onramp, H1 transplant
program. Arm sim-talktranscript-a, branch `sim-talktranscript-a`,
worktree `~/workspace/worktrees/sim-talktranscript-a`. Tracker blank
#1, from run fleshout-20261115T0215Z. Prereg:
evidence/2026-11-14/sim-talktranscript-prereg.md (committed BEFORE
any judged sim, commit 76486f8f9; stage-1 proof 80/80, including
the one-sitting smoke test).

## Verdict

| Question | Verdict | Headline |
|---|---|---|
| (b) UNSPOKEN DRIVE, spoken channel — naming half | **GO (half)** | 65.9% of held sittings name the drive in a non-opener transcript beat (bar 25%, n=3,952 pooled) — 40.9 points clear. |
| (b) UNSPOKEN DRIVE, spoken channel — length half | **MISS (half)** | Mean exchanges aligned 3.52 vs misaligned 3.55 — a dead heat, 0.03 exchanges the wrong way (n≈2,000 a side). |
| (b) combined, as pre-registered (BOTH halves) | **NO-GO** | The bar requires both halves. The naming half passes by a wide margin; the length half is a tie. |

In plain words: the villagers WERE saying the drive aloud all
along — the old instrument was deaf to it. On the spoken
transcript, two out of three held sittings name the day's drive in
the conversation itself, and that holds up under every stricter
reading (54.8% without the loose word "promise", 64.6% on quoted
spoken beats only, ~45% on drive-specific words alone with no
generic words at all). What does NOT hold up is the second half:
sitting down with a villager whose opener matched the day does not
make the sitting any longer — three and a half turns either way,
exactly as the old instrument measured, because the sitting's
length is set by the conversation's own energy budget, not by
whether the opener matched the dawn. So the pre-registered verdict
is NO-GO, but it is a NO-GO about sitting length, not about
villagers speaking their drive. The ove48-mech (b) NO-GO is
superseded as a channel finding: on the channel that carries
speech, the naming question is settled GO, and the coordinator
should not rest the revert-vs-keep call on the old 18.7% number.

## Lever played

None — DIAG/instrument. Transcript recorder/driver/analyzer/step
scripts + evidence only; ZERO src/js changes (verified in stage 2:
`git log master..HEAD -- src/js/` empty). The OVE-48 pick itself
(c937de65f / 493d7a975) is the subject under measurement, not this
arm's change.

## Method (per prereg — band, horizon, policy, legs)

- Seeds: deliberate reuse of the band-3 band 190457–190464 (8 seeds).
  Horizon 150d death-aware. Roster-check standing fix swapped in
  for every step (sha f8fda4295a99, from 5157782a4; native restored
  byte-identical afterwards, sha-verified 75762cb2… on both legs).
  Own-policy per step (each step runs its commit's OWN competent.js).
  COMPETENT_TALK=1 on both legs (held conversations, up to 2/day,
  5 turns).
- L-TALK-BASE: far end 203a32775, STEP t-talktranscript-base.
- L-TALK-SUBJ: subject branch `transplant-15a-narrowed-subject` at
  493d7a975, STEP t-talktranscript-subj. Subject verified at run
  start (1 commit on the far end, tree 6d6216e3…, diff 3 files
  +320/-3, green-list byte-identical). Read-only; never committed
  onto, never rebuilt.
- Capture channel: c.transcript, snapshotted at endConvo AFTER the
  original runs (the goodbye + want-closing beats are spoken by
  sayLine inside endConvo itself). Only `who === 'them'` beats
  count; seq 0 is the opener beat, seq >= 1 are the turn lines.
  Game.say is NOT wrapped at all (proof test asserts identity).
  Nonverbal sittings (no shared language — nvOpen returns before
  convoSelectWant) close without an open record and are counted
  separately (sittingsNonverbal), not as misses; repeat endConvo
  calls on a dead conversation return noop and are counted
  separately (endConvoNoop). Close conservation holds on both legs
  (captured + nonverbal + noop = endConvo calls).
- The lexicon is VERBATIM the ove48-mech lexicon (proof test
  deep-equals it against scripts/ove48-mech-analyze-20261114.js) —
  only the capture channel changed, so the flip is attributable
  to the channel.

## The judged measurement (talk legs, COMPETENT_TALK=1)

| | Talk-base (far end) | Talk-subj (OVE-48) | Pooled |
|---|---|---|---|
| Conversation opens | 2,852 | 3,097 | 5,949 |
| Weighted-pick opens | 1,239 | 1,489 | 2,728 |
| Dawn-aligned share | 26.5% | 65.7% | — |
| `convoDawnPriorities` reads | 0 ✓ (control) | 1,489 ✓ | — |
| Held sittings (exchanges ≥ 1) | 1,895 | 2,057 | 3,952 |
| Mean exchanges per held sitting | 3.52 | 3.55 | 3.54 |
| Them-beats captured (joined / unjoined) | 17,489 / 0 | 19,227 / 0 | 36,716 / 0 |
| Mean them-beats per held sitting | 7.70 | 7.80 | 7.75 |
| Held sittings with zero them-beats | 0 | 0 | 0 |
| Quoted beats (spoken words) | 87.7% | 87.3% | 87.5% |
| Held sittings naming the drive (non-opener transcript beat) | 1,185 (62.5%) | 1,418 (68.9%) | **2,603 (65.9%)** |
| — ex-"promise" | 963 (50.8%) | 1,201 (58.4%) | **2,164 (54.8%)** |
| — quoted-only | 1,170 (61.7%) | 1,384 (67.3%) | **2,554 (64.6%)** |
| — drive-words-only (no generic words) | 41.1% | 48.9% | **~45.2%** |
| Held sittings naming the drive (opener incl.) | 66.5% | 74.8% | 70.8% |
| Mean exchanges, aligned opens | 3.50 (n=627) | 3.53 (n=1,332) | **3.52 (n=1,959)** |
| Mean exchanges, misaligned opens | 3.54 (n=1,268) | 3.59 (n=725) | **3.55 (n=1,993)** |
| Validity V1/V2/V3/V4/V6 | all pass | all pass | — |

GO required BOTH: naming ≥ 25% AND mean exchanges aligned >
misaligned. Naming is 65.9% (bar 25%) — passed by 40.9 points on
the primary lexicon, and still passed on every stricter secondary
(ex-promise 54.8%, quoted-only 64.6%, drive-words-only ~45.2%).
Length is 3.52 vs 3.55 — aligned sittings run 0.03 exchanges
SHORTER, a dead heat on n≈2,000 a side. **NO-GO as pre-registered
— on the length half alone.** The "0 lines name the drive"
NO-GO condition does not trigger (2,603 sittings name it).

Two honest observations about what the numbers mean:

1. The channel artifact is confirmed and quantified. The SAME
   3,952 held sittings (identical trajectories — opens, held
   counts, survival, and even the length split are byte-for-byte
   the mech legs' numbers) read 18.7% on Game.say and 65.9% on
   c.transcript. The say channel was thin: only ~10% of held
   sittings yielded even one quoted turn line there. The
   transcript channel is rich: every held sitting carries spoken
   beats (mean 7.75 them-beats, zero sittings with none, 0
   unjoined beats across 36,716). The mech (b) NO-GO measured
   the narration feed, not the villagers.
2. Naming is a property of held conversations, not of the OVE-48
   pick. The far end — no pick at all — names the drive in 62.5%
   of held sittings; the subject leg adds only ~6 points (68.9%).
   When the scholar sits down and stays, villagers talk about
   their day's drive whether or not the opener was dawn-picked.
   The pick shapes WHICH want opens the conversation (aligned
   65.7% vs 26.5%); it does not teach villagers to speak their
   drive — they already do.
3. The length half cannot discriminate, on either channel. The
   numbers are IDENTICAL to the mech instrument's (3.52 vs 3.55,
   same n's) because exchanges don't depend on the capture
   channel at all. Alignment does not buy a longer sitting in
   this engine — the energy budget (2–6 exchanges from
   temperament + social need) does, and deepTalk picks
   want-holders first, whose threads run a fixed length
   regardless of alignment.

## Sensitivities (all reported, none judged)

| Reading | Pooled naming share | vs 25% bar |
|---|---|---|
| Primary (verbatim lexicon, non-opener transcript beats) | 65.9% (2,603/3,952) | +40.9 |
| Ex-"promise" | 54.8% (2,164/3,952) | +29.8 |
| Quoted-only (spoken beats, no narration beats) | 64.6% (2,554/3,952) | +39.6 |
| Drive-words-only (no generic dawn/commitment words) | ~45.2% (~1,785/3,952) | +20.2 |

"promise" is the generic word doing the most work (1,182
turn-beat hits on the base leg, 1,464 on the subject leg —
the role-list beat "Roles. Not ranks — promises." fires it
often); "commit" adds ~100 hits a leg ("committing it to
memory"). Even with every generic word removed, the share
stays nearly double the bar.

Per-drive naming (held sittings): party_up 68.0% base / 71.3%
subj; food_security 63.7% / 76.2%; safety 48.6% / 61.3%;
build_standing 68.1% / 65.7%; knowledge 12/12 / 16/16 (tiny n —
"know/learn/teach" are everywhere in curious threads); gear_up
8/16 / 6/13 (tiny n); bank_veterans 3/3 / 0/0. Safety is the
weakest channel, as in ove48-conv.

## Wall numbers (scale-onramp axis)

| | Talk-base (far end, held) | Talk-subj (OVE-48, held) |
|---|---|---|
| Survived /8 | 3/8 | 4/8 |
| Median survival | 147d | 150d |
| Wins / national / table | 0 / 0 / 0 | 0 / 0 / 0 |
| Wave-5 reached /8 | 6/8 | 5/8 |
| Wave-4 reached /8 | 8/8 | 8/8 |
| Deaths (all seeds) | 600 | 642 |
| Standing range | 150–525 | 199–740 |
| Scale rank | regional 8 | regional 8 |

The scale wall stands on both legs: national 0, table 0, wins 0.
Waves 1–5 are reachable (wave 5 on 5–6 of 8 seeds per leg);
regional is reached everywhere; national, the table, and the win
flag remain decoration in these sims — unchanged by OVE-48, by
held conversations, or by the instrument. Death causes are the
familiar shape on both legs: villager combat and combat dominate
(base: villager combat 245, combat 197, expedition 57, the wild
47; subj: 241, 203, 94, 49). Villages die fighting, not hungry
(starvation 8/0).

## Reachability verdict

Waves 1–5 reachable on both legs. Arc reach: not re-measured on
these legs (the ove48-conv arm recorded ARC IV on subject seed
190458). Regional reached on 16/16 seed-legs; national, the table,
and the win flag reached on 0/16. The content past regional
remains decoration in these sims.

## Village assessment (plain words)

Eight villages, same eight starting points, two versions of the
same world — and this time we actually listened to what the
villagers said. When the scholar sits down and stays, the
villagers talk about the day's work: the pantry and the forage
run at sunup, the moot that needs calling, the roles that need
filling, the thing they promised to do. Two out of three sittings
name the drive out loud, on both versions of the world — the
dawn-picked opener doesn't teach them to say it, it just knocks
on a door that was already open. They don't sit longer because
the opener matched the day; they sit as long as they have breath
for, about three and a half turns, and then they go back to
their lives. And none of this is what kills a village. Villages
die in fights, the same as ever, and they still don't reach
national, still don't see the table, still don't win — the scale
wall is untouched by any of this, either way. What this run
settles is narrower and cleaner: the last run's verdict that
villagers don't talk about their drive was a deaf instrument,
not a silent village.

## Sense-testing (read the transcripts, not just the counts)

The transcripts read like people. Genuine drive-naming lines
(verbatim, non-opener beats):
- "Then it's set. Where the sugar maple grows thick, at sunup.
  Pack and knife. We travel light." (food_security / ask_favor)
- "The moot is called. The fire gets built up."
  (build_standing / curious)
- "Teach me something. Anything you know that I don't."
  (knowledge / curious)
- "Good. The old burn east of camp, dawn. Pack light — we move
  fast." (safety / ask_favor)
- "Wow." Nino looks hurt, then angry. "I share my food with you
  and this is what I get?" (food_security / curious)

The misses read like people too — a sitting about the funniest
thing seen since the Scattering, a day-one "Can we talk? Just
talk — like people used to", a comfortable quiet by the fire.
Nothing robotic or repeated beyond the per-want line pool itself,
which predates this arm.

Three honest limits, all measured:

1. The lexicon is loose. "A thin smile" counts as food-talk
   ("thin" is a pantry word); "committing it to memory" counts
   via the generic "commit"; "holding this whole thing together"
   counts as party-talk via "together". The sensitivities bound
   this: even drive-words-only, with no generic words at all,
   the share is ~45% — the looseness inflates the number, it
   does not create the finding.
2. Not every 'them' beat is spoken words. ~12.5% of them-beats
   are unquoted narration or stage directions ("You show them
   Mayapple — where it grows…", "The ground remembers.",
   "Counted."). The quoted-only share (64.6%) shows the verdict
   does not depend on them — but the dialogue box mixes speech
   with narration, and a future classifier should probably
   require quotes. (Filed in sim-findings.md.)
3. A menu beat speaks aloud. The party-role list ("Roles. Not
   ranks — promises." followed by the 🗡️/🩹/🎒/🗣️/👁️ role roster
   with "(Which one is Mina?)") appears as a spoken them-beat in
   the transcript — UI text wearing a villager's voice. It fires
   the generic "promise" match often. (Filed in
   sim-findings.md.)

Also recorded, carried from ove48-mech: grief/taken talk thins
under OVE-48 even in held conversations (seek_taken 150→93,
seek_comfort 138→94) — the flavor cost named in ove48-conv
persists when villagers sit down, not just when they walk out.
And repay pre-emptors are ~10% of talk-leg opens (315 base /
320 subj): the held policy engages unresolved wants first, so a
tenth of all conversation opens are the villager collecting on an
old debt, not the dawn pick at all.

## Blanks filled / documented

FILLED:
- (b) on the spoken channel: naming GO-half 65.9% (bar 25%),
  with the channel artifact quantified (18.7% say vs 65.9%
  transcript on the SAME 3,952 held sittings) and the length
  half shown channel-independent (3.52 vs 3.55, identical to the
  say instrument). The ove48-mech (b) NO-GO is superseded as a
  channel finding.
- The transcript instrument (snapshot c.transcript at endConvo,
  'them' beats only, Game.say untouched), driver, analyzer
  (verbatim lexicon + ex-promise + quoted-only secondaries), step
  script, and proof test — committed 76486f8f9 (prereg + tooling,
  stage-1 80/80 including the smoke test).
- Two findings for the backlog (sim-findings.md): the dialogue
  box mixes spoken words with unquoted narration beats; the
  party-role menu list is spoken aloud as a them-beat. The
  "wrong channel" finding is marked FIXED by this run.

DOCUMENTED (open, for the coordinator / next arm):
- The combined (b) verdict is NO-GO only because the length half
  is a dead heat. The naming question is settled GO on the
  spoken channel under every sensitivity. The revert-vs-keep
  call should not rest on the old 18.7% number, and if the
  coordinator wants a length verdict, the length metric itself
  needs redesigning (it cannot discriminate: the energy budget,
  not alignment, sets sitting length) — not another capture
  channel.
- The safety drive remains the weakest naming channel (48.6%
  base / 61.3% subj) — if a future tuning wants safety-drive
  villagers to voice the danger, the safety lexicon/openers are
  the place, not the instrument.
- DUTY/ASSIGN kinds populate the commitment record but have no
  DAWN_KIND_WANTS entry (carried from ove48-mech) — not
  re-measured here; the kind half was already GO on master tip.
- Step-script lesson (carried): on newer trees,
  vetfirst/masterregress are tracked files — the restore must
  restore them from the step commit, not delete them. Both
  talktranscript steps ran on old trees where the scratch files
  don't exist, so plain rm was correct here; the branch's step
  script keeps the mech restore logic verbatim.
- Safe-commit index clobber (AGENTS.md pattern, second sighting
  on this arm): after the prereg commit 76486f8f9, the worktree's
  main index showed all 6 committed files staged-as-deleted
  (files byte-identical to HEAD). Repaired with `git ls-tree -r
  HEAD -- <paths> | git update-index --add --index-info`;
  verified status empty + diff HEAD empty. The commit was
  correct; only the main index lied.

## Metric review

1. The (b) bar was applied as written and the combined verdict is
   NO-GO — no re-scoring. But the bar's two halves turned out to
   measure two different things: the naming half measures what
   villagers SAY (and the channel fix moved it 18.7% → 65.9%),
   while the length half measures the conversation energy budget
   (and is numerically IDENTICAL across channels, 3.52 vs 3.55).
   A combined GO that requires both halves can never pass on the
   length half as designed — alignment does not and cannot buy
   exchanges in this engine. The next run's prereg should either
   judge the halves separately (naming GO / length NO-GO, as this
   evidence does) or replace the length half with a metric
   alignment can actually move (e.g. drive-thread depth: does the
   sitting stay on the drive's thread past exchange 2?).
2. The 25% naming bar was the right strictness for transcript
   beats: the strictest sensitivity (drive-words-only, ~45%)
   still clears it by 20 points, so the bar was not the thing
   that was wrong — the channel was. Keep the bar for the next
   talk measurement.
3. The lexicon's generic words do real work ("promise" is
   ~1,200–1,500 turn-beat hits a leg; "commit" ~100 a leg via
   "committing"). The ex-promise and quoted-only secondaries
   added in this prereg should be standard in the next talk
   prereg, plus a drive-words-only sensitivity and full word
   boundaries (the current regexes anchor only the left edge,
   so "committing" matches "commit"). None of these change this
   run's verdict — they bound it.
4. The one-sitting smoke test did its job: it caught a real
   instrument bug before any judged leg (nonverbal closes
   counted as unjoined misses) and proved the channel rich
   (7.75 them-beats per held sitting) before a single judged
   seed ran. Keep the smoke-test requirement for the next
   talk-measurement prereg.
5. No metric was re-scored mid-run. The instrument fix
   (nonverbal/noop close accounting) corrected the recorder to
   match the engine's close paths; it did not change any bar,
   and the judged legs ran after the fix was committed.

## Commits (this arm, branch sim-talktranscript-a)

- 76486f8f9 — prereg + transcript instrument/driver/analyzer/step
  + proof test (stage-1 80/80, smoke test proves c.transcript)
- ba6625a6b — talk-base corpus + driver log + summary
- 6d006ecd3 — talk-subj corpus + driver log + summary
- (this commit) — talk comparison + this evidence file; stage-2
  proof 23/23

## Files

- Prereg: evidence/2026-11-14/sim-talktranscript-prereg.md
- Instrument: scripts/talktranscript-instrument-20261114.js
- Driver: scripts/talktranscript-driver-20261114.js
- Analyzer: scripts/talktranscript-analyze-20261114.js
- Step: scripts/talktranscript-step.sh
- Proof test: scripts/test-talktranscript.js
- Talk-base corpus: evidence/2026-11-14/perseed-talktranscript-t-talktranscript-base/
  + talktranscript-t-talktranscript-base-driver.log
  + talktranscript-t-talktranscript-base-summary.json
- Talk-subj corpus: evidence/2026-11-14/perseed-talktranscript-t-talktranscript-subj/
  + talktranscript-t-talktranscript-subj-driver.log
  + talktranscript-t-talktranscript-subj-summary.json
- Talk comparison: evidence/2026-11-14/talktranscript-talk-comparison.json
- Mech reference: evidence/2026-11-14/sim-ove48-mech-a.md,
  sim-ove48-mech-prereg.md, ove48-mech-talk-comparison.json
