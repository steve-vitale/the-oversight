# journey-landing r136 — RUN NOTE (Lane A, leg 0 LANDING)

**Run id:** playtest-loop-20261115T114401Z (scheduled Sun 2026-11-15 05:45 CST).
**Base:** local master `874d97c00` at registration (version bump 79060b74b).
**Rotation:** read 0 → write 0→1 at closeout on success (read back: 1).
Next leg: establishment. The rotation read 0 legitimately: r135 wrote 0→1,
r210 establishment 1→2, r212 deepening 2→3, r207 scale 3→0.
**Worktree:** `~/workspace/worktrees/journey-landing` (branch
`journey-landing`). Heartbeat at registration; 10-min hbloop for the run.
**Prereg:** `evidence/2026-11-15/journey-landing-r136-prereg.md`.

## Q1 (PRIMARY) — r135 metric-review decisions: BOTH ADOPTED, PROVEN

### Q1a — person-trust bar shape: ±1 absolute for baseline counts under 4

Adopted as pre-registered. `withinTol` in
`scripts/test-person-trust-20261108.js` now reads: baseline 0 → got ≤ 2
(unchanged); baseline 1–3 → ±1 absolute; baseline ≥ 4 → ±25%
(unchanged). Baselines do not move (FORAGE stays 1). Comment cites the
r135 metric review + this prereg. The file's main block is guarded behind
`require.main === module` so the proof test can require `withinTol`
(the old ±25% rule is kept as `withinTolOld` for the comparison).

**Proofs:**
- New `scripts/test-person-trust-bar-shape.js`: **PASS all 18**. The r129
  flip (2 vs 1) passes the new rule and fails the old; a 2-errand flip at
  count 1 (3 vs 1) still fails; ±2 at count 2 (4 vs 2) still fails; large
  counts still bind at ±25% (233 vs 187 passes, 234 vs 187 fails).
- Full `node scripts/test-person-trust-20261108.js`: **PASS all 19**.
  Panel bit-identical to the r135 fixed-code panel (maxTrust 75, entries
  54, trustedOpen 5, kinds {LEAVE:2, WATER:215, EAT:62, VISIT:11,
  FORAGE:1, SEEK:19}).
- Committed as `d4bbafd5c` (prereg + r136 driver + both test changes +
  analyzer change). The post-commit main-index clobber (safe-commit
  known issue — files showed staged-deleted) was repaired with the
  documented `ls-tree -r HEAD | update-index --add --index-info` pipe;
  status clean, worktree hashes match HEAD.

### Q1b — HEED verbatim weighting: HEED-V added, legacy keeps reporting

Added to `scripts/analyze-landing-q1-dialogue.js`: a legacy-HEED sitting
(≥10 turns, heed/details offered ≥3×, never taken) counts as a REAL
filler loop (HEED-V) only if some non-warning THEM line (≥20 chars) is
delivered verbatim 2+ times in that sitting. Warning lines excluded (D2
covers them). HEED-V ⊆ HEED by construction; both print side by side.

**Proofs:**
- New `scripts/test-analyze-landing-q1-dialogue-heedv.js`: **PASS all 6**.
  On the r135 corpus: HEED = 1, HEED-V = 0 — the Dauletkhan sitting
  (1150 d6) was read in full: every brush-off a different line, want
  engaged (stage 3). On a /tmp fixture (same sitting twice, one copy
  with a brush-off line duplicated verbatim): HEED = 2, HEED-V = 1.
- On the r136 live panel (below): HEED = 1 (the same 1150-d6 sitting),
  HEED-V = 0 — the discriminator works on live data: a sitting that
  reads clean on sense-read scores 0.
- HEED-V is a proposal this run and **binds from r137**.

## Q2 — Fresh landing panel (regression watch)

Driver `scripts/journey-landing-r136-20261115.js` (r135 driver verbatim
except OUTDIR/header), seeds 1142–1151, DAYS=28. Corpus
`landing-r136-after/` (124 files, 104 transcripts). Analyzers:
`evidence/2026-11-15/journey-landing-r136-analyzers.log` (14 analyzers,
all exit 0). Pilot (seeds 1142–1145) clean, then full panel.

**The headline: the panel is game-state-identical to r135.** All 10
census JSONs identical modulo embedded corpus paths (and stack-trace
line numbers in 5); all 104 transcripts + system files byte-identical.
The single src/js change since r135 — `af56c7b4f` (succession r209:
deferred-ask ledger guard + favor-block noBeat, in conversation.js /
convo-dialogue.js / convo-wants.js) — moves nothing in the landing
window on this band.

- **M1 ALIVE-D14:** 10/10 alive at d28 (over=no on all seeds). **M2 SYSTEM
  CONTACT:** 10/10 by d9 (d8 on nine, d9 on 1149). **M3 FIGHT-LOG:** 7
  fights, 0 unknown/mixed.
- **Zero-DMG invariant:** PASS (7 fights, 0 violations; zeroDmg=0,
  B-shape=0). Scholar-turns: player-wait 1, player-move 4,
  player-barrier-exit 0, player-ability 0.
- **Practice:** movedCells d1→d28=94, seedsWithMove 10/10,
  skill0→pos 56, practiceReps 2540 — exactly r135's numbers. Hunt reps
  **0** (18th panel running — H1-ESTABLISHED carries). Kills total 217.
- **Pocket watch:** 0 pocket fights, 0 stuck turns. **Move-refusals:**
  byReason {}, stuckFights 0.
- **D1 watch: 0 garbled-label renders.**
- **HEED:** legacy 1 (the same 1150-d6 sitting); **HEED-V 0**. D2 0; D3 0;
  WARNED-BUT-UNRESOLVED 0.
- **M-PR1:** sittings=16, offered=13, picked=13, promised=11,
  neverOffered=2, settled=1; max per-seed never-offered 1. PASS by the
  r129 bar.
- **Personal bridge:** 0 repeats in a sitting (104 sittings, 16 servings).
  **Small bridge:** 0 repeats. **Presshop:** farUnreached=1 — identical
  to the previous panel (r131→r136, six panels running).
  **Outingchain:** CHAIN-COMPLETES-FAR (favors 28, kept 6, broken 3,
  farHaul 5, nearHaul 2).
- **R66 HUNGRY:** starvation deaths 0, starvingWarnings 0.
  STARVATION: GO (every death assigned a cause class).
- **1130-d6 amnesia shape:** 0 recurrences (the 2 "I don't remember"
  hits are the player's own bespoke-answer option, not a villager
  forgetting). **Miriam line:** 0 "That's settled". **Deflect-fallback:**
  0 `fellBack`.
- **Mantle latency:** vacuous (no mantle pass fired).
- **Nodloop:** LOOP=0 — 8 nv sittings, winddown surfaced everywhere, all
  closed via leave.
- **Deaths:** 9 total — 4 monster (Faruk d17, Mireille d23, Kate d25,
  Kupe d26), 5 ambush (Scott d8, Kgomotso d8, Hassan d11, Roman d12,
  Henry d16). Population 111/120 at d28. Scholar deaths 0.
  Correction to the r135 note: it said "four died", counting only
  monster-cause deaths; the 5 ambush-cause deaths were in its analyzer
  log too (9 total on both panels). Report all deaths with the cause
  split from now on.
- **WANT ENGAGEMENT:** curious 77, ask_favor 16, none 8, warn_you 3.

## Q3 — People check (M5, sense-read, 5 full transcripts)

All five PASS the bar (NPC wants something, options engage or deflect
it, endings resolve / plant / owe). The want-thread resume WATCH is
**confirmed with two takes** — see the first finding below.

- **Sanne (1144 d5, curious/dreams):** the r134 WATCH sitting itself,
  byte-identical. The player deflects twice, asks one real question
  ("Sleep's the real currency now. I'm rich in dreams and broke in
  rest."), then leaves; she lets them go dryly ("Do try to stay alive.
  The paperwork otherwise is murder."). Want ends unestablished —
  honest consequence. PASS. The resume is never offered in this
  sitting, so the WATCH gets no sample from it.
- **Liam (1144 d6, curious/alone-time):** opens with a real question
  ("Do you ever just need to be alone?"). The driver deflects at turn
  0; Liam notices ("Okay." Something shutters, just slightly.). At
  turn 6 the resume is offered and TAKEN — "We never finished —
  needing to be alone." — and Liam says: "About needing to be alone —
  yeah, we never did get back to that." He acknowledges the thread
  without re-asking the question. The driver deflects again; Liam
  closes it down ("Look, forget it. You wanted something?") and the
  sitting winds down honestly ("I eat fast and leave early. Not hiding.
  Just — scheduling."). Want ends deflected. PASS — and the resume
  behavior is confirmed as real, not a one-off.
- **Yara (1142 d5, curious/hands):** second resume take, same shape:
  "What did you do with your hands, before?" → deflect → resume at
  turn 6 → "About what you did with your hands — yeah, we never did
  get back to that." Same template line, same acknowledge-only beat.
  The sitting wanders through real answers (sleep, interpreter past,
  4 injured + tension) and closes honestly ("I'm glad we talked. I
  think. I'm still deciding."). Want ends deflected. PASS.
- **Kai (1149 d10, warn_you):** the driver takes [dlg:heed] six times
  in a row; Kai cycles three acknowledgment lines ("Thank you. I
  needed to hear you say it." / "Good. I mean it — watch yourself out
  there." / "Promise me that. Please."). The warning content itself
  is never delivered — the driver never took [dlg:details] or [goon].
  Player-driven repetition, not an NPC loop; the want ends engaged.
  The sitting closes with the beast-naming beat ("Big Ugly" / "Big
  Big" / "The Ugly Beast" ...). PASS with that observation.
- **Omar (1145 d2, nv):** Arabic lines with translation, each gesture
  distinct ("I agree with you", "I won't forget this", "Yes, yes,
  exactly", "You are a kind person", "Well said. Exactly right"),
  wind-down surfaces, closes with the palms-pressed goodbye. PASS.
  The shared closing template ("This was good." They mean it.) recurs
  — carried observation, middles are their own.

### FINDING (confirmed, carried as next run's Q1): the want-thread resume acknowledges without re-asking

Two takes on this panel (Liam 1144-d6, Yara 1142-d5), one template line
("About X — yeah, we never did get back to that."). Picking "We never
finished — X" names the thread and gets an acknowledgment, but the
want's question is never re-posed — the thread dies there. Contrast
warn_you, where the r131 HEED fix makes the resume speak the warning
(`convoWantEngage`). For curious wants, `engageBeat` returns null by
the r121 first-reveal guard (it only fires after the player answered
in this sitting), so the resume falls through to the generic line.

Fix shape (documented, not landed — needs its own prereg + proof):
on resume-take of a deflected question-want, re-hang THE SAME question
via `convoWantOpener` + `convoAcceptWantQuestion` (the machinery the
'request' branch in conversation.js already uses), so the next menu
offers the question's answers again. The question id survives to the
resume point (`c.want.qid` — the resume label already names the
question, per the r14 WANT-QUESTION IDENTITY work). Must not break the
r121 first-reveal guard or the HEED-ENGAGE path. Proof: a scripted
sitting (deflect → resume-take → assert the question is re-posed and
its answers are offered), plus a panel re-run.

## Q4 — Telemetry

`telemetry-check.js` on the r136 panel vs `landing-split.json`:
**one LOUD line, investigated, explained, baseline rolled.**

- LOUD: `villagerDeaths swung 80%: baseline 5 -> current 9`.
- Investigation: the current 9 (4 monster + 5 ambush) is identical to
  r135's panel — the game did not get deadlier. The baseline's 5 is a
  pre-fix-leaning pooled mean (r129 BEFORE 4 / AFTER 8 / r130 4); the
  r129 fix itself moved the regime (4→8 on its AFTER panel), and r135 +
  r136 now agree at 9. The only src/js change since r135 moves nothing
  in this window. Verdict: **baseline staleness, not a bug.** (r135's
  Q4 ran 4 metrics and never evaluated villagerDeaths, which is why
  this surfaced now.)
- Baseline rolled forward with `--update-baseline` to (81/9/217/15/0)
  — systemDay 81, villagerDeaths 9, monsterKills 217,
  folTelemetry.fires 15, starvAutopsies 0 — with the _note updated to
  record the re-pin and the old note preserved inside it. Backup at
  `landing-split.json.20261115-pre-r136.bak`. Re-check after the roll:
  **quiet (10 files, 5 metrics, no large deviations).**

## Village assessment — plain words

All ten villages come through the first month whole: nobody's village
scattered, 111 of 120 people still alive. Nine died — four to monsters
out in the wild, five in ambushes — and the rest held. The System makes
contact on day 8 in nearly every village (day 9 on one). People are
talking: 104 sittings across the panel, wants mostly curious (77) with
favors asked (16) and warnings given (3); six pantry-run favors were
kept and five far hauls came home. The scholars are still strangers
(trust 6–42 in the sittings read), but practice is moving — 94 cells of
it, every village. Nobody starved. The villages are missing the same
thing as ever: a reason to go looking for trouble instead of waiting
for it — nobody has hunted on purpose in eighteen panels running — and
a second pair of hands that knows what it's doing. The landing itself —
first fortnight, first System contact, survival basics — is reachable,
makes sense, and holds together, and the one src change since the last
panel didn't move a single line of it.

## Verdicts

- **Reachable:** YES — System contact 10/10 by d9, favors offered and kept,
  fights firing, no garbled labels.
- **Fun:** YES — conversations carry real wants and land real lines; the
  nonverbal sittings close; the warn_you sitting resolves with a real
  ending instead of looping.
- **Winnable:** YES for this leg (the leg is the first month, and all ten
  villages live through it with food and company). The longer climb is
  still the scale leg's question, not this one's.

## Gate (r136 branch)

`node scripts/check.js --quick` in the worktree: **335 passed, 5 failed
in 718s** (log `evidence/2026-11-15/journey-landing-r136-gate.log`).
Adjudication — 0 attributable:
- `test-measurement-proof-update.js` + `test-measurement-workflow.js` —
  staleness pair (standing set; the r129 src/js change staled the
  neutrality proof, owed to proof refresh).
- `test-phone-frame-proof.js` — phone receipt staleness (standing set;
  refresh needs a browser run, owed separately).
- Two 120s timeouts in the parallel run (box load during the gate):
  living-garden, one-person-army — **both PASS standalone (exit 0)**;
  living-garden 143s, one-person-army 84s — they need more than the
  120s parallel budget. Load artifacts, not the change.
- The modified `test-person-trust-20261108.js` (green-listed, quick)
  PASSED in the gate. The two new proof tests are journey-run proofs
  (run directly: 18/18 + 6/6), not green-listed — same as the r129/r131
  journey proof tests, which are also not in green-list.txt.
- Gate verdict: **GO**.

## Landing (r136 branch)

[PENDING — to be filled by the landing addendum after the ff-only merge.]

## Metric review

- The person-trust bar shape works as designed: the r129 flip now
  passes, a 2-errand flip still fails, large counts still bind at
  ±25%. The bar is a guard against drift, not a tripwire for
  single-errand noise. No further bar-shape change proposed.
- HEED-V discriminates on live data: HEED 1 → HEED-V 0 on a sitting
  read clean. It binds from r137 as proposed.
- The r135 note's "four died" shorthand undercounts: ambush-cause
  deaths are deaths. Report all deaths with the cause split from now
  on (this note does).
- Presshop farUnreached=1 for the sixth straight panel (r131→r136).
  The shape is stable and the bar keeps carrying; no change proposed
  — the number is a watch, not a gate.
- No metric proved wrong this run beyond the items above; no revision
  applied mid-run. The telemetry baseline re-pin (5→9 deaths) is a
  baseline correction, not a metric change.

## Carried (unchanged)

- **NEXT RUN Q1 (new, top):** the want-thread resume re-pose fix —
  resume-take of a deflected question-want should re-ask the question
  (fix shape in Q3 FINDING above). Two confirmed takes; needs its own
  prereg + proof test + panel re-run.
- Teaching the shared chooser to take nv:accept (r197 lane decision owed).
- Hunt assignments still never resolve in the landing window (H1-ESTABLISHED).
- NV sittings share one closing template (palms-pressed goodbye) — middles
  are their own; observation only.
- HEED filler-loop shape (Dauletkhan warn_you, 1150 d6) — legacy watch
  item; the sitting itself resolves engaged, and HEED-V now scores it 0.
- Analyzer vs transcript streak count (r134 carry — analyzer maxSameStreak=1
  on nv sittings vs transcript summary maxStreak=4–5; the analyzer counts
  same-pick runs, the summary counts the sitting length). No bar depends
  on the difference.
